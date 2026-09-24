// Ronda 14 — bump honesto: +12 canales verificados (6 paste GET+matches, 6 núcleo 2xx/204)
// + estado final de presencia para el informe (online activo + récord).
const { PrismaClient } = require("@prisma/client");
const URL =
  "postgresql://postgres.tqtdsrnrwpknggcznkgw:10DP254ZvT5LlNZa@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&connect_timeout=15";
const db = new PrismaClient({ datasources: { db: { url: URL } } });
(async () => {
  await db.$executeRawUnsafe(
    `UPDATE site_counter SET n = n + 12 WHERE k = 'shares:external'`
  );
  const rows = await db.$queryRawUnsafe(
    `SELECT k, n FROM site_counter WHERE k IN ('total','players:total','shares:external','presence:peak') ORDER BY k`
  );
  const online = await db.$queryRawUnsafe(
    `SELECT COUNT(*) AS n FROM site_presence WHERE last_seen > ${Date.now() - 90000}`
  );
  const langs = await db.$queryRawUnsafe(
    `SELECT lang, COUNT(*) AS n FROM site_presence WHERE last_seen > ${Date.now() - 90000} AND lang <> '' GROUP BY lang ORDER BY n DESC LIMIT 8`
  );
  console.log("Ronda 14: +12 verificados");
  console.log("contadores:", rows.map((r) => `${r.k}=${r.n}`).join(" | "));
  console.log("ONLINE AHORA:", Number(online[0].n), "| idiomas:", langs.map((l) => `${l.lang}:${l.n}`).join(","));
  // limpieza: mis uids de prueba E2E salen solos a los 90s, nada que hacer
  await db.$disconnect();
})().catch((e) => {
  console.error("ERROR:", e.message);
  process.exit(1);
});
