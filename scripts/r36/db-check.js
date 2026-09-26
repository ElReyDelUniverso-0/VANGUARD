const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  const counters = await p.$queryRaw`SELECT k, n FROM site_counter WHERE k IN ('players:total','presence:peak','shares:external') ORDER BY k`;
  console.log('COUNTERS:', JSON.stringify(counters, (_, v) => typeof v === 'bigint' ? Number(v) : v));
  const online = await p.$queryRaw`SELECT COUNT(*)::int AS n FROM site_presence WHERE last_seen > ${Date.now() - 90000}`;
  console.log('ONLINE:', JSON.stringify(online, (_, v) => typeof v === 'bigint' ? Number(v) : v));
  await p.$disconnect();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
