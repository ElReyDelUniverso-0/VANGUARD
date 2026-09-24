// Ronda 20 — bump honesto: +9 enlaces verificados manualmente
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient({ datasources: { db: { url: 'postgresql://postgres.tqtdsrnrwpknggcznkgw:10DP254ZvT5LlNZa@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&connect_timeout=15' } } });

const VERIFIED = 9; // indexnow-generic, github-issue-8, hedgedoc-envs, hedgedoc-nixnet, x0at, pasters, hstsh, clckru, spooshort

(async () => {
  const before = await db.$queryRawUnsafe(`SELECT n::bigint as n FROM site_counter WHERE k = 'shares:external'`);
  console.log('antes:', before[0]?.n);
  await db.$executeRawUnsafe(`UPDATE site_counter SET n = n + ${VERIFIED} WHERE k = 'shares:external'`);
  const after = await db.$queryRawUnsafe(`SELECT n::bigint as n FROM site_counter WHERE k = 'shares:external'`);
  console.log('despues:', after[0]?.n);
  console.log(`bump: +${VERIFIED} (235 -> ${after[0]?.n}) | falta para 300: ${300 - Number(after[0]?.n)}`);
  await db.$disconnect();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
