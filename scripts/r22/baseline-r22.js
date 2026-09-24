// Ronda 22 — baseline: contadores actuales
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient({ datasources: { db: { url: 'postgresql://postgres.tqtdsrnrwpknggcznkgw:10DP254ZvT5LlNZa@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&connect_timeout=15' } } });
(async () => {
  const rows = await db.$queryRawUnsafe(`SELECT k, n::bigint as n FROM site_counter WHERE k IN ('shares:external','players:total','presence:peak','visits') ORDER BY k`);
  rows.forEach(r => console.log(r.k, '=', r.n));
  const online = await db.$queryRawUnsafe(`SELECT COUNT(*)::int as c FROM presence WHERE last_seen > now() - interval '90 seconds'`);
  console.log('online_now =', online[0].c);
  await db.$disconnect();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
