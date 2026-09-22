// Test rápido de la DATABASE_URL final (pooler :6543 + pgbouncer) antes de subirla a Vercel
import { PrismaClient } from "@prisma/client";

const url = process.env.DATABASE_URL || "";
const masked = url.replace(/:[^:@]+@/, ":****@");
console.log("Probando:", masked);

const p = new PrismaClient();
try {
  const ok = await p.$queryRaw`SELECT 1 AS ok`;
  const memes = await p.$queryRaw`SELECT count(*)::int AS n FROM "Meme"`;
  const games = await p.$queryRaw`SELECT count(*)::int AS n FROM "UgcItem"`;
  console.log("DB_OK | select1:", ok[0].ok, "| memes:", memes[0].n, "| juegos:", games[0].n);
} catch (e) {
  console.error("DB_FAIL:", e.message?.slice(0, 300));
  process.exit(1);
} finally {
  await p.$disconnect();
}
