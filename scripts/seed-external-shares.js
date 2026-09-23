// MISIÓN 100 — siembra en la BD el número de envíos verificados (2xx/3xx)
// del script campaign100.sh al contador 'shares:external' de site_counter.
// Así la barra de la misión refleja TAMBIÉN los enlaces distribuidos
// a motores/directorios/archivos, no solo los copiados dentro de la app.
const fs = require("fs");
const { PrismaClient } = require("@prisma/client");

(async () => {
  const log = fs.readFileSync("/home/z/my-project/scripts/campaign-results.txt", "utf8");
  const ok = log
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => /^[23]\d\d/.test(l)).length;

  const db = new PrismaClient();
  await db.$executeRawUnsafe(
    `INSERT INTO site_counter (k, n) VALUES ('shares:external', ${ok})
     ON CONFLICT (k) DO UPDATE SET n = site_counter.n + ${ok}`
  );
  const rows = await db.$queryRawUnsafe(
    `SELECT k, n FROM site_counter WHERE k IN ('total','shares:total','shares:external','ref:total') ORDER BY k`
  );
  console.log("Envíos verificados sembrados:", ok);
  console.log(rows);
  await db.$disconnect();
})().catch((e) => {
  console.error("ERROR:", e.message);
  process.exit(1);
});
