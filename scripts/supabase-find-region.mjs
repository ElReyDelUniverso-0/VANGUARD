// Detecta la región del pooler de Supabase probando el handshake PostgreSQL
// Uso: bun scripts/supabase-find-region.mjs
const REF = "tqtdsrnrwpknggcznkgw";
const USER = `postgres.${REF}`;
const REGIONS = [
  "us-east-1", "us-east-2", "us-west-1", "us-west-2",
  "eu-central-1", "eu-central-2", "eu-west-1", "eu-west-2", "eu-west-3",
  "ap-southeast-1", "ap-southeast-2", "ap-northeast-1", "ap-northeast-2",
  "ap-south-1", "sa-east-1", "ca-central-1",
];

function startupMessage(user, db) {
  const buf = Buffer.concat([
    Buffer.from([0, 0, 0, 0]), // length placeholder
    Buffer.from([0, 3, 0, 0]), // protocol 3.0
    Buffer.from(`user\0${user}\0database\0${db}\0\0`),
  ]);
  buf.writeInt32BE(buf.length, 0);
  return buf;
}

async function probe(region, port) {
  const host = `aws-0-${region}.pooler.supabase.com`;
  return new Promise((resolve) => {
    const net = require("node:net");
    const s = net.connect({ host, port, timeout: 8000 });
    let data = Buffer.alloc(0);
    let done = false;
    const finish = (r) => { if (!done) { done = true; try { s.destroy(); } catch {} resolve(r); } };
    s.on("connect", () => s.write(startupMessage(USER, "postgres")));
    s.on("data", (d) => {
      data = Buffer.concat([data, d]);
      const t = String.fromCharCode(data[0]);
      if (t === "R") finish({ region, port, ok: true, code: "AUTH" });
      else if (t === "E") {
        const msg = data.toString("utf8");
        const why = msg.includes("Tenant or user not found") ? "tenant-no-encontrado"
          : msg.includes("password") ? "password-mal" : "error";
        finish({ region, port, ok: why === "password-mal", why });
      }
    });
    s.on("timeout", () => finish({ region, port, ok: false, why: "timeout" }));
    s.on("error", (e) => finish({ region, port, ok: false, why: e.message.slice(0, 60) }));
  });
}

console.log(`Buscando región del proyecto ${REF}...`);
for (const region of REGIONS) {
  const r = await probe(region, 5432);
  if (r.ok) { console.log(`★ REGIÓN: ${region} (session :5432 responde AUTH)`); process.exit(0); }
}
console.log("✖ Ninguna región respondió AUTH — ¿proyecto pausado?");
process.exit(1);
