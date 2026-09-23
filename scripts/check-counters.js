// Chequeo rápido de contadores (reutilizable cada ronda)
// Uso: node scripts/check-counters.js
const { PrismaClient } = require("@prisma/client");
const URL =
  "postgresql://postgres.tqtdsrnrwpknggcznkgw:10DP254ZvT5LlNZa@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&connect_timeout=15";
const db = new PrismaClient({ datasources: { db: { url: URL } } });
(async () => {
  const rows = await db.$queryRawUnsafe(
    `SELECT k, n FROM site_counter WHERE k IN
     ('total','players:total','shares:external','shares:total','agent:runs','agent:ok','agent:last')
     ORDER BY k`
  );
  for (const r of rows) console.log(`${r.k} = ${Number(r.n)}`);
  const pres = await db.$queryRawUnsafe(
    `SELECT uid, lang FROM site_presence ORDER BY last_seen DESC LIMIT 5`
  );
  console.log("presence:", JSON.stringify(pres));
  await db.$disconnect();
})().catch((e) => {
  console.error("ERROR:", e.message);
  process.exit(1);
});
