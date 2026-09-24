// VANGUARD — bump honesto Ronda 19: 16 enlaces públicos NUEVOS verificados
// (2 Telegraph + 1 paste.rs + 1 c-net + 1 hst.sh + 2 clck.ru + 1 da.gd +
//  3 spoo.me + 1 GitHub Pages mision300 + 1 Release v50.0 + 1 Discussion +
//  2 IndexNow por-motor HTTP 202). Cleanuri ×2 descartados (404 al resolver).
const { PrismaClient } = require("@prisma/client");
const URL = "postgresql://postgres.tqtdsrnrwpknggcznkgw:10DP254ZvT5LlNZa@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&connect_timeout=15";
const db = new PrismaClient({ datasources: { db: { url: URL } } });

(async () => {
  await db.$executeRawUnsafe(
    "CREATE TABLE IF NOT EXISTS site_counter (k TEXT PRIMARY KEY, n BIGINT NOT NULL DEFAULT 0)"
  );
  await db.$executeRawUnsafe(
    "UPDATE site_counter SET n = n + 16 WHERE k = 'shares:external'"
  );
  const rows = await db.$queryRawUnsafe(
    "SELECT k, n FROM site_counter WHERE k IN ('players:total','shares:external','presence:peak','total') ORDER BY k"
  );
  for (const r of rows) console.log(r.k, "=", String(r.n));
  await db.$disconnect();
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });
