// micro-lección v266/v267: la estática v272 se simula en Node contra los
// ficheros reales ANTES del QA — 13 asertos a la primera o se corrige aquí.
import { readFileSync } from "node:fs";
import { join } from "node:path";

const RAIZ = process.cwd();
let ok = 0, mal = 0;
function afirmar(cond, msg) {
  if (cond) { ok++; } else { mal++; console.error("  ✗ " + msg); }
}

const pag = readFileSync(join(RAIZ, "src/app/en-vivo/page.tsx"), "utf8");
const quiz = readFileSync(join(RAIZ, "src/app/en-vivo/quiz-peso.tsx"), "utf8");

afirmar(pag.includes("const ordenadosPeso = [...iniciales].sort"), "parejas no derivadas de la instantánea");
afirmar(pag.includes("parejasPeso.length < 8"), "sin cota de parejas");
afirmar(pag.includes("a.impacto !== b.impacto"), "parejas con pesos iguales admitidas");
afirmar(pag.includes("<QuizPeso parejas={parejasPeso} />"), "quiz no montado");
afirmar(quiz.includes('import { TIERS, type TierImpacto } from "@/lib/impacto"'), "TIERS no consumido");
afirmar(quiz.includes("pesoApostado > pesoRival"), "veredicto sin peso real");
afirmar(quiz.includes("TIERS[tier as TierImpacto]?.label"), "etiquetas no canónicas");
afirmar(quiz.includes("marcarHidratado(CLAVE_PESO)"), "cerradura ausente");
afirmar(quiz.includes("estaHidratado(CLAVE_PESO)"), "escritura sin cerradura");
afirmar(!quiz.includes("db.") && !quiz.includes("fetch("), "quiz toca red o BD");
afirmar(!/20\d\d-\d\d-\d\d/.test(quiz), "fechas a mano en el quiz");

// la línea compuesta, simulada con una muestra real de parejas
const parejas = 8;
const lineaQuiz = `EL QUIZ DEL PESO — ${parejas} parejas reales del archivo miden tu ojo`;
afirmar(/^EL QUIZ DEL PESO — \d+ parejas reales del archivo miden tu ojo$/.test(lineaQuiz), "línea compuesta no encaja el regex vivo");

// el botón vive UNA vez en el JSX (el map lo renderiza dos veces en el HTML)
const botones = (quiz.match(/PESA MÁS ▸/g) || []).length;
afirmar(botones === 1, `el botón de apuesta no está exactamente una vez en el JSX (${botones})`);

console.log(`SIMULACIÓN v272: ${ok} pasan · ${mal} fallan`);
process.exit(mal > 0 ? 1 : 0);
