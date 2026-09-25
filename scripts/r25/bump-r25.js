// Ronda 25 — bump honesto: +14 enlaces verificados → CRUCE DEL HITO 300
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient({ datasources: { db: { url: 'postgresql://postgres.tqtdsrnrwpknggcznkgw:10DP254ZvT5LlNZa@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&connect_timeout=15' } } });
(async () => {
  await db.$executeRawUnsafe(`UPDATE site_counter SET n = n + 14 WHERE k = 'shares:external'`);
  const r = await db.$queryRawUnsafe(`SELECT n::bigint as n FROM site_counter WHERE k = 'shares:external'`);
  console.log('shares:external =', r[0].n, '| progreso:', Math.round(Number(r[0].n)/300*100) + '%', Number(r[0].n) >= 300 ? '🎉 HITO 300 ALCANZADO' : '');
  await db.$disconnect();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
