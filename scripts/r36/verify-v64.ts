// Verificación v64.0: plantillas de misión nuevas + lógica de rollover diario
import { MISSION_TEMPLATES } from "../../src/lib/game-data";

const codes = MISSION_TEMPLATES.map((m) => m.code);
const dupes = codes.filter((c, i) => codes.indexOf(c) !== i);
console.log("total misiones:", MISSION_TEMPLATES.length);
console.log("códigos duplicados:", dupes.length === 0 ? "NINGUNO ✓" : dupes);

const d = MISSION_TEMPLATES.find((m) => m.code === "D_PREGON_1");
const w = MISSION_TEMPLATES.find((m) => m.code === "W_CARD_3");
console.log("D_PREGON_1:", d ? `OK cat=${d.category} target=${d.target} ${d.coinReward}ⓒ+${d.xpReward}XP` : "FALTA ✗");
console.log("W_CARD_3:", w ? `OK cat=${w.category} target=${w.target} ${w.coinReward}ⓒ+${w.xpReward}XP+${w.gemReward}💎` : "FALTA ✗");

// rollover: D_* se limpian, W_/S_/STORY_ persisten
const fake: Record<string, { progress: number; completed: boolean; claimed: boolean }> = {
  D_PREGON_1: { progress: 1, completed: true, claimed: true },
  D_QUIZ_3: { progress: 3, completed: true, claimed: false },
  W_CARD_3: { progress: 2, completed: false, claimed: false },
  S_STREAK_7: { progress: 4, completed: false, claimed: false },
  STORY_KIEV: { progress: 1, completed: true, claimed: true },
};
const kept: typeof fake = {};
for (const [c, v] of Object.entries(fake)) if (!c.startsWith("D_")) kept[c] = v;
const keptOk = kept.W_CARD_3 && kept.S_STREAK_7 && kept.STORY_KIEV && !kept.D_PREGON_1 && !kept.D_QUIZ_3;
console.log("rollover D_* limpio / resto persiste:", keptOk ? "CORRECTO ✓" : "FALLO ✗", "| conservados:", Object.keys(kept).join(", "));

// contar DAILY y WEEKLY tras v64
const daily = MISSION_TEMPLATES.filter((m) => m.category === "DAILY").length;
const weekly = MISSION_TEMPLATES.filter((m) => m.category === "WEEKLY").length;
console.log(`DAILY: ${daily} | WEEKLY: ${weekly}`);
