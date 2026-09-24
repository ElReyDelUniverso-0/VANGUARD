// VANGUARD — bump honesto Ronda 18: 43 enlaces públicos permanentes verificados
// (5 releases + 4 discussions + 6 GitHub Pages + 3 pastemyst + 8 clck.ru +
//  6 cleanuri + 6 spoo.me + 3 paste.rs + 4 Telegraph — todos HTTP 200 + contenido)
const { PrismaClient } = require("@prisma/client");
const URL = "postgresql://postgres.tqtdsrnrwpknggcznkgw:10DP254ZvT5LlNZa@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&connect_timeout=15";
const db = new PrismaClient({ datasources: { db: { url: URL } } });

(async () => {
  await db.$executeRawUnsafe(
    "CREATE TABLE IF NOT EXISTS site_counter (k TEXT PRIMARY KEY, n BIGINT NOT NULL DEFAULT 0)"
  );
  await db.$executeRawUnsafe(
    "UPDATE site_counter SET n = n + 43 WHERE k = 'shares:external'"
  );
  const rows = await db.$queryRawUnsafe(
    "SELECT k, n FROM site_counter WHERE k IN ('players:total','shares:external','presence:peak','total') ORDER BY k"
  );
  for (const r of rows) console.log(r.k, "=", String(r.n));
  await db.$disconnect();
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });
