// Lista tablas y conteos de la SQLite demo (solo lectura, para plan de migración)
import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
const tables = await p.$queryRawUnsafe(
  `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma%' ORDER BY name`
);
for (const t of tables) {
  const n = t.name;
  let c = 0;
  try { c = (await p.$queryRawUnsafe(`SELECT COUNT(*) as c FROM "${n}"`))[0].c; } catch {}
  console.log(`${c}\t${n}`);
}
await p.$disconnect();
