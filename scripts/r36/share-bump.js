// Ronda 39 — bump shares:external +N tras verificar enlaces externos (landing v62, issue #41, discussion #42, 4 pastes, 15 shorts)
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
const N = Number(process.argv[2] || 0);
(async () => {
  if (!N || N <= 0) { console.error('usage: node share-bump.js <n>'); process.exit(1); }
  await p.$queryRaw`INSERT INTO site_counter (k, n) VALUES ('shares:external', ${N}) ON CONFLICT (k) DO UPDATE SET n = site_counter.n + ${N}`;
  const rows = await p.$queryRaw`SELECT k, n FROM site_counter WHERE k IN ('players:total','presence:peak','shares:external') ORDER BY k`;
  console.log('AFTER BUMP +' + N + ':', JSON.stringify(rows, (_, v) => typeof v === 'bigint' ? Number(v) : v));
  await p.$disconnect();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
