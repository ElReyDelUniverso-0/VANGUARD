// Test E2E del game-service a traves del gateway (:81 con XTransformPort=3003)
import { io, type Socket } from "socket.io-client";

const URL = "http://localhost:81/?XTransformPort=3003";
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const connect = (s: Socket) => new Promise<void>((res) => { if (s.connected) res(); else s.once("connect", () => res()); });

async function main() {
  let ok = 0, fail = 0;
  const check = (name: string, cond: boolean) => {
    if (cond) { ok++; console.log(`PASS ${name}`); }
    else { fail++; console.log(`FAIL ${name}`); }
  };

  const s1 = io(URL, { transports: ["websocket", "polling"] });
  const s2 = io(URL, { transports: ["websocket", "polling"] });
  await Promise.all([connect(s1), connect(s2)]);
  check("sockets conectados via gateway", s1.connected && s2.connected);

  // ===== CHAT =====
  const histP = new Promise<any>((res) => s1.once("chat:history", res));
  const joinAckP = new Promise<any>((res) => s1.emit("chat:join", { room: "general", name: "TEST-OP", country: "UN" }, res));
  const onlineP = new Promise<any>((res) => s1.once("chat:online", res));
  const joinAck = await joinAckP;
  check("chat:join ack ok", joinAck?.ok === true);
  const hist = await histP;
  check("chat:history seed >= 5 msgs", Array.isArray(hist?.msgs) && hist.msgs.length >= 5);
  const online = await Promise.race([onlineP, wait(2000).then(() => null)]);
  check("chat:online 8 salas", online ? Object.keys(online.online).length === 8 : false);

  // s2 entra y recibe mensaje de s1
  const msgP = new Promise<any>((res) => s2.once("chat:msg", (m: any) => { if (m.author === "TEST-OP") res(m); }));
  s2.emit("chat:join", { room: "general", name: "TEST-2", country: "MX" }, () => {});
  await wait(300);
  s1.emit("chat:msg", { room: "general", body: "prueba de mensaje real" });
  const msg = await Promise.race([msgP, wait(3000).then(() => null)]);
  check("chat:msg fluye entre 2 sockets", msg?.body === "prueba de mensaje real");

  // ===== MULTIJUGADOR =====
  const state1 = await new Promise<any>((res) => s1.emit("mp:join", { playerId: "test-op-1", name: "TEST-OP" }, (r: any) => res(r?.state)));
  check("mp:join estado con 24 territorios", !!state1 && Array.isArray(state1.territoryMeta) && state1.territoryMeta.length === 24);
  check("mp fase LOBBY", state1?.phase === "LOBBY");

  const claim = await new Promise<any>((res) => s1.emit("mp:claim", { terrId: "eeuu" }, res));
  check("mp:claim ok", claim?.ok === true);

  const stAfter = await new Promise<any>((res) => {
    const h = (s: any) => { if (s.territories?.eeuu?.owner === "test-op-1") { s1.off("mp:state", h); res(s); } };
    s1.on("mp:state", h);
    setTimeout(() => res(null), 4000);
  });
  check("mp:state broadcast (propio)", stAfter?.territories?.eeuu?.owner === "test-op-1");
  check("mp startAt activado", typeof stAfter?.startAt === "number");

  console.log(`\nRESULTADO: ${ok} PASS / ${fail} FAIL`);
  s1.disconnect(); s2.disconnect();
  process.exit(fail > 0 ? 1 : 0);
}

main().catch((e) => { console.error("ERROR", e); process.exit(1); });
