// Verificación E2E v32: conexión al game-service (Render) y flujo god:state/mp:state
import { io } from "socket.io-client";

const URL = process.env.RT_URL || "https://vanguard-games.onrender.com";
console.log("Conectando a", URL, "(polling primero, como en v32)…");

const socket = io(URL, {
  transports: ["polling", "websocket"],
  timeout: 25000,
  reconnection: false,
});

let godCount = 0;
let mpCount = 0;
let connectedTransport = "";

socket.on("connect", () => {
  connectedTransport = socket.io.engine.transport.name;
  console.log("CONECTADO · id:", socket.id, "· transporte inicial:", connectedTransport);
});
socket.on("god:state", (s) => {
  godCount++;
  if (godCount === 1)
    console.log("god:state OK · fase:", s.war?.phase, "· claimed:", `${s.war?.claimed}/${s.war?.total}`, "· feed:", s.feed?.length);
});
socket.on("mp:state", (s) => {
  mpCount++;
  if (mpCount === 1)
    console.log("mp:state OK · territorios:", Object.keys(s.territories || {}).length, "· meta:", s.territoryMeta?.length);
});
socket.on("connect_error", (e) => console.log("CONNECT_ERROR:", e.message));

setTimeout(() => {
  const ok = godCount >= 5 && mpCount >= 5;
  console.log(`RESULTADO en 8s: god:state=${godCount} mp:state=${mpCount} → ${ok ? "FLUJO_OK (1s cadencia estable)" : "FLUJO_FLOJO"}`);
  socket.close();
  process.exit(ok ? 0 : 1);
}, 8000);
