// Ronda 13 — bump honesto: +12 canales verificados (6 paste con GET+matches, 6 núcleo 2xx/204)
const { PrismaClient } = require("@prisma/client");
const URL =
  "postgresql://postgres.tqtdsrnrwpknggcznkgw:10DP254ZvT5LlNZa@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&connect_timeout=15";
const db = new PrismaClient({ datasources: { db: { url: URL } } });
(async () => {
  await db.$executeRawUnsafe(
    `UPDATE site_counter SET n = n + 12 WHERE k = 'shares:external'`
  );
  const rows = await db.$queryRawUnsafe(
    `SELECT k, n FROM site_counter WHERE k IN ('total','players:total','shares:external','shares:total') ORDER BY k`
  );
  console.log("Ronda 13: +12 verificados (6 paste GET-OK + 6 núcleo 2xx/204)");
  console.log(rows.map((r) => `${r.k}=${r.n}`).join(" | "));
  await db.$disconnect();
})().catch((e) => {
  console.error("ERROR:", e.message);
  process.exit(1);
});
