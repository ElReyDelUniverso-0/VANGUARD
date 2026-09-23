// Limpieza de uids de prueba de /api/presence (Task 52)
// Uso: node scripts/cleanup-presence-test.js
const { PrismaClient } = require("@prisma/client");
const URL =
  "postgresql://postgres.tqtdsrnrwpknggcznkgw:10DP254ZvT5LlNZa@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&connect_timeout=15";
const db = new PrismaClient({ datasources: { db: { url: URL } } });
(async () => {
  const del = await db.$executeRawUnsafe(
    `DELETE FROM site_presence WHERE uid LIKE 'v42test%'`
  );
  console.log("filas de prueba borradas:", del);
  const rows = await db.$queryRawUnsafe(
    `SELECT uid, lang FROM site_presence LIMIT 10`
  );
  console.log("restantes:", JSON.stringify(rows));
  await db.$disconnect();
})().catch((e) => {
  console.error("ERROR:", e.message);
  process.exit(1);
});
