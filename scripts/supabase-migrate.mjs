// VANGUARD v30 PASO PRO — Migración SQLite → Supabase Postgres
// Uso (cuando haya contraseña real de la BD):
//   SUPABASE_DIRECT_URL="postgresql://postgres:PASSWORD@db.tqtdsrnrwpknggcznkgw.supabase.co:5432/postgres" \
//     bun scripts/supabase-migrate.mjs
// Pasos que ejecuta:
//  1. Exporta TODAS las tablas demo de la SQLite a JSON (orden dependencias)
//  2. Genera prisma/schema.postgres.prisma (provider postgresql)
//  3. prisma db push  → crea las tablas en Supabase
//  4. prisma generate → cliente Postgres
//  5. Importa los datos demo a Supabase
//  6. Verifica conteos exportados vs importados
//  7. Cambia el schema principal a postgresql (queda listo para commit+push)
import { PrismaClient as SqliteClient } from "@prisma/client";
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync, unlinkSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";

const DIRECT_URL = (process.env.SUPABASE_DIRECT_URL || "").trim();
if (!DIRECT_URL || DIRECT_URL.includes("[YOUR-PASSWORD]")) {
  console.error("✖ Falta SUPABASE_DIRECT_URL con contraseña REAL (sin [YOUR-PASSWORD]).");
  process.exit(1);
}
if (!/^postgresql:\/\/[^:]+:[^@]+@/.test(DIRECT_URL)) {
  console.error("✖ La URL no parece válida. Formato: postgresql://postgres:PASS@db.<ref>.supabase.co:5432/postgres");
  process.exit(1);
}

const ORDER = [
  // padres (sin FK)
  "Account", "Mission", "QuizQuestion", "Player", "NewsItem", "DroneScore",
  "WeeklyReward", "MpProfile", "LiveStream", "StreamSchedule", "StreamReplay",
  "ContributorProfile", "NewsVerify", "AmbassadorCandidate", "Denuncia", "Meme",
  "UgcItem", "CommunityCurrency", "Contribution", "ContribNotification",
  "GovRole", "GovRecruit",
  // hijos (con FK)
  "MissionProgress", "QuizResult", "Prediction", "CoinTransaction",
  "UnlockedBriefing", "LiveChatMessage", "StreamDonation", "NewsVerifyVote",
  "AmbassadorVote", "DenunciaVote", "MemeLike", "UgcVote", "UgcComment",
  "CurrencyTrade", "ContributionVote",
];

const step = (n, msg) => console.log(`\n=== PASO ${n}: ${msg} ===`);

// ---------- PASO 1: exportar SQLite ----------
step(1, "Exportando datos de la SQLite demo");
const sqlite = new SqliteClient();
const exportData = {};
let totalRows = 0;
for (const model of ORDER) {
  try {
    const rows = await sqlite[model].findMany();
    exportData[model] = rows;
    totalRows += rows.length;
    console.log(`  ${model}: ${rows.length} filas`);
  } catch (e) {
    console.log(`  ${model}: 0 (sin tabla o error: ${String(e).slice(0, 80)})`);
    exportData[model] = [];
  }
}
await sqlite.$disconnect();
writeFileSync("/tmp/vanguard-export.json", JSON.stringify(exportData));
console.log(`  TOTAL: ${totalRows} filas → /tmp/vanguard-export.json`);

// ---------- PASO 2: schema postgres ----------
step(2, "Generando prisma/schema.postgres.prisma");
const mainSchema = readFileSync("prisma/schema.prisma", "utf8");
if (!mainSchema.includes('provider = "sqlite"')) {
  console.log("  El schema principal ya es postgresql — se reutiliza tal cual.");
}
const pgSchema = mainSchema.replace(
  'provider = "sqlite"',
  'provider = "postgresql"'
);
if (pgSchema === mainSchema && mainSchema.includes('provider = "sqlite"')) {
  console.error("  ✖ No pude cambiar el provider."); process.exit(1);
}
writeFileSync("prisma/schema.postgres.prisma", pgSchema);
console.log("  OK");

// ---------- PASO 3: crear tablas en Supabase ----------
step(3, "Creando tablas en Supabase (prisma db push)");
function run(cmd) {
  execSync(cmd, { stdio: "inherit", env: { ...process.env, DATABASE_URL: DIRECT_URL } });
}
run("bunx prisma db push --schema prisma/schema.postgres.prisma --accept-data-loss");

// ---------- PASO 4: cliente postgres ----------
step(4, "Generando cliente Prisma para Postgres");
run("bunx prisma generate --schema prisma/schema.postgres.prisma");

// ---------- PASO 5: importar datos ----------
step(5, "Importando datos demo a Supabase");
const { PrismaClient: PgClient } = await import("@prisma/client");
const pg = new PgClient({ datasources: { db: { url: DIRECT_URL } } });
const pending = [...ORDER];
for (let round = 1; round <= 3 && pending.length; round++) {
  for (const model of [...pending]) {
    const rows = exportData[model];
    if (!rows.length) { pending.splice(pending.indexOf(model), 1); continue; }
    try {
      for (let i = 0; i < rows.length; i += 50) {
        await pg[model].createMany({ data: rows.slice(i, i + 50), skipDuplicates: true });
      }
      pending.splice(pending.indexOf(model), 1);
      console.log(`  ✓ ${model}: ${rows.length}`);
    } catch (e) {
      if (round === 3) console.log(`  ✖ ${model}: ${String(e).slice(0, 120)}`);
      // si falla por FK, se reintenta en la siguiente ronda
    }
  }
  if (pending.length && round < 3) await sleep(1000);
}
if (pending.length) console.log(`  ⚠ Sin importar (revisar): ${pending.join(", ")}`);

// ---------- PASO 6: verificación ----------
step(6, "Verificando conteos Supabase vs SQLite");
let ok = true;
for (const model of ORDER) {
  const expected = exportData[model].length;
  if (!expected) continue;
  const got = await pg[model].count();
  const mark = got >= expected ? "✓" : "✖";
  if (got < expected) ok = false;
  console.log(`  ${mark} ${model}: ${got}/${expected}`);
}
await pg.$disconnect();

// ---------- PASO 7: schema principal → postgres ----------
step(7, "Cambiando schema principal a postgresql");
if (mainSchema.includes('provider = "sqlite"')) {
  writeFileSync("prisma/schema.prisma", pgSchema);
}
try { unlinkSync("prisma/schema.postgres.prisma"); } catch {}
try { unlinkSync("prisma/schema.supabase.prisma"); } catch {}
console.log("  prisma/schema.prisma = postgresql ✓");

console.log(ok
  ? "\n★ MIGRACIÓN COMPLETA — datos verificados. Listo para commit+push y env vars en Vercel."
  : "\n★ MIGRACIÓN COMPLETA CON DIFERENCIAS — revisar los ✖ de arriba.");
