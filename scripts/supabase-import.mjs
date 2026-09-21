// VANGUARD v30 — Importa el JSON exportado a Supabase Postgres
// REQUISITO: correr en proceso NUEVO DESPUÉS de `prisma generate` postgres
//   DATABASE_URL="postgresql://postgres.tqtdsrnrwpknggcznkgw:PASS@aws-0-us-west-2.pooler.supabase.com:5432/postgres" \
//     bun scripts/supabase-import.mjs
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";

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

const exportData = JSON.parse(readFileSync("/tmp/vanguard-export.json", "utf8"));
const pg = new PrismaClient();

let total = 0;
const pending = [...ORDER];
for (let round = 1; round <= 3 && pending.length; round++) {
  for (const model of [...pending]) {
    const rows = exportData[model] ?? [];
    if (!rows.length) { pending.splice(pending.indexOf(model), 1); continue; }
    try {
      for (let i = 0; i < rows.length; i += 50) {
        await pg[model].createMany({ data: rows.slice(i, i + 50), skipDuplicates: true });
      }
      pending.splice(pending.indexOf(model), 1);
      total += rows.length;
      console.log(`  OK ${model}: ${rows.length}`);
    } catch (e) {
      const msg = String(e?.message ?? e).split("\n").slice(0, 3).join(" | ").slice(0, 160);
      if (round === 3) console.log(`  FAIL ${model}: ${msg}`);
    }
  }
  if (pending.length && round < 3) await sleep(800);
}

console.log("\n=== VERIFICACION (Supabase vs export) ===");
let ok = true;
for (const model of ORDER) {
  const expected = (exportData[model] ?? []).length;
  if (!expected) continue;
  let got = -1;
  try { got = await pg[model].count(); } catch { got = -1; }
  const mark = got >= expected ? "OK" : "XX";
  if (got < expected) ok = false;
  console.log(`  ${mark} ${model}: ${got}/${expected}`);
  total += 0;
}
await pg.$disconnect();
console.log(ok ? "\n★ IMPORTACION COMPLETA Y VERIFICADA" : "\n★ IMPORTACION CON DIFERENCIAS — revisar XX");
process.exit(ok ? 0 : 1);
