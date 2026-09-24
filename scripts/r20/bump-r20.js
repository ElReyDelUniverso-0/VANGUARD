// VANGUARD — bump honesto Ronda 20: 17 enlaces públicos NUEVOS verificados
// (2 Telegraph + 2 paste.rs + 1 gh-issue + 1 gh-pages explorador + 1 gh-discussion
//  + 1 sourceb.in + 3 paste.c-net.org + 2 hst.sh + 1 clck.ru + 2 spoo.me
//  + 1 pubsubhubbub-google 204). Descartados: anoox/scrubtheweb (match débil),
//  feedshark, envssh (falso positivo), glotio/bpaste/tildeverse (requieren sesión),
//  rentry 403, entireweb/exactseek/freewebsubmission/whatuseek/addme 403/404.
const { PrismaClient } = require("@prisma/client");
const URL = "postgresql://postgres.tqtdsrnrwpknggcznkgw:10DP254ZvT5LlNZa@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&connect_timeout=15";
const db = new PrismaClient({ datasources: { db: { url: URL } } });

(async () => {
  await db.$executeRawUnsafe(
    "CREATE TABLE IF NOT EXISTS site_counter (k TEXT PRIMARY KEY, n BIGINT NOT NULL DEFAULT 0)"
  );
  await db.$executeRawUnsafe(
    "UPDATE site_counter SET n = n + 17 WHERE k = 'shares:external'"
  );
  const rows = await db.$queryRawUnsafe(
    "SELECT k, n FROM site_counter WHERE k IN ('players:total','shares:external','presence:peak','total') ORDER BY k"
  );
  for (const r of rows) console.log(r.k, "=", String(r.n));
  await db.$disconnect();
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });
