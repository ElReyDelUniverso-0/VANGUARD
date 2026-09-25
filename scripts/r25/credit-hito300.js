// Ronda 25 — acreditación directa del hito 300 a TODOS los jugadores:
// +5000 monedas +50 gemas +800 XP cada uno + CoinTransaction con nota.
// Idempotente: guarda site_counter 'sharegoal:credited:300' = 1 como guarda.
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient({ datasources: { db: { url: 'postgresql://postgres.tqtdsrnrwpknggcznkgw:10DP254ZvT5LlNZa@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&connect_timeout=15' } } });
(async () => {
  const guard = await db.$executeRawUnsafe(
    `INSERT INTO site_counter (k, n) VALUES ('sharegoal:credited:300', 1) ON CONFLICT (k) DO NOTHING`
  );
  if (guard === 0) {
    console.log('YA CREDITADO ANTES — abortando para evitar doble pago');
    await db.$disconnect();
    process.exit(0);
  }
  const players = await db.$queryRawUnsafe(`SELECT id, alias FROM "Player"`);
  let n = 0;
  for (const p of players) {
    await db.$executeRawUnsafe(
      `UPDATE "Player" SET coins = coins + 5000, gems = gems + 50, xp = xp + 800, "updatedAt" = now() WHERE id = '${p.id}'`
    );
    await db.$executeRawUnsafe(
      `INSERT INTO "CoinTransaction" (id, "playerId", amount, reason, note, "createdAt")
       VALUES (gen_random_uuid()::text, '${p.id}', 5000, 'MISSION', 'HITO 300 ENLACES — recompensa comunitaria: +5000 monedas, +50 gemas, +800 XP', now())`
    );
    n++;
  }
  console.log('Jugadores acreditados:', n);
  const sample = await db.$queryRawUnsafe(`SELECT alias, coins, gems, xp FROM "Player" ORDER BY coins DESC LIMIT 3`);
  sample.forEach(s => console.log(' top:', s.alias, s.coins, 'monedas,', s.gems, 'gemas,', s.xp, 'XP'));
  await db.$disconnect();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
