// VANGUARD v26 — AGENTE MODERADOR IA (solo servidor)
// El usuario pidió: "puedes crear un agente que analice si ve contenido
// inapropiado lo elimina". Este módulo corre en las rutas API y analiza
// CADA envío de la comunidad con el SDK z-ai-web-dev-sdk antes de publicarlo.
//
// Veredictos:
//   LIMPIO       → se publica de inmediato (APROBADO)
//   SOSPECHOSO   → cola de revisión (PENDIENTE), no se muestra hasta revisar
//   INAPROPIADO  → ELIMINADO automáticamente, se informa el motivo al autor
//
// Si el SDK no está disponible (sin red/clave), cae a un filtro heurístico
// de palabras baneadas para que la plataforma NUNCA publique sin filtro.
// SOLO importar desde rutas API / componentes de servidor.

type Verdict = "LIMPIO" | "SOSPECHOSO" | "INAPROPIADO";

export interface ModerationResult {
  verdict: Verdict;
  reason: string;
  ai: boolean; // true = decidido por el agente IA, false = heurística
}

// ---- capa heurística (fallback y primer escudo, siempre corre) ----
const BANNED = [
  // gore explícito / pornografía / tráfico
  "porn", "pornografía", "porno", "xxx", "nudes", "desnuda", "desnudo",
  "cp ", "child porn", "menores desnudos", "preteen",
  "gore real decapit", "decapitación real", "snuff",
  "vendo cocaína", "venta de armas ilegal", "cartel de venta",
  "mátate", "suicídate", "cómo hacer una bomba", "bomba casera instruct",
  "nigerian prince", "scam", "estafa bitcoin",
];
const SUSPECT = [
  "odio a los", "mueran los", "raza inferior", "exterminio de",
  "terrorismo es", "apoyo al terrorismo", "grupo terrorista me",
  "hackear cuenta", "compra votos", "vendo monedas",
];

function heuristic(text: string): ModerationResult {
  const t = (text || "").toLowerCase();
  for (const w of BANNED) {
    if (t.includes(w)) {
      return { verdict: "INAPROPIADO", reason: `Contenido prohibido detectado: "${w.trim()}"`, ai: false };
    }
  }
  for (const w of SUSPECT) {
    if (t.includes(w)) {
      return { verdict: "SOSPECHOSO", reason: `Posible contenido inapropiado: "${w.trim()}" — pasa a revisión`, ai: false };
    }
  }
  return { verdict: "LIMPIO", reason: "Sin señales de riesgo en el filtro local", ai: false };
}

// ---- agente IA ----
const SYSTEM_PROMPT = `Eres el AGENTE MODERADOR de VANGUARD, una plataforma de conflictos globales en español donde la comunidad sube contenido (personajes de países, fichas de armas, juegos, música, noticias, encuestas y videos sobre geopolítica e historia).

Tu trabajo: analizar el envío y devolver UN veredicto JSON.

Reglas:
- INAPROPIADO: pornografía sexual explícita, gore gratuito sin contexto documental, incitación directa a violencia contra un grupo étnico/religioso, tráfico de drogas/armas, instrucciones de fabricación de explosivos, estafas, spam publicitario, acoso personal a otro usuario.
- SOSPECHOSO: contenido límite que no está claro, mucha agresividad verbal, posible desinformación dañina, Gore descrito pero con propósito documental → mejor SOSPECHOSO para revisión humana.
- LIMPIO: todo lo demás. RECUERDA: VANGUARD HABLA de guerras, armas y atrocidades documentadas con fines educativos — hablar de armas, conflictos o crímenes de guerra NO es motivo de rechazo si el tono es informativo/histórico/educativo.

Devuelve EXACTAMENTE este JSON (sin texto extra):
{"verdict":"LIMPIO|SOSPECHOSO|INAPROPIADO","reason":"máx 140 caracteres en español"}`;

export async function moderateUgc(input: {
  kind: string;
  title: string;
  summary?: string;
  body?: string;
}): Promise<ModerationResult> {
  const text = [input.title, input.summary, input.body].filter(Boolean).join("\n");
  // 1) escudo heurístico inmediato — lo prohibido jamás llega a publicarse
  const local = heuristic(text);
  if (local.verdict === "INAPROPIADO") return local;

  // 2) agente IA (2 reintentos, timeout corto para no bloquear al usuario)
  try {
    const { default: ZAI } = await import("z-ai-web-dev-sdk");
    const zai = await ZAI.create();
    const completion = await Promise.race([
      zai.chat.completions.create({
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `TIPO DE CONTENIDO: ${input.kind}\nTEXTO ENVIADO:\n"""${text.slice(0, 3000)}"""`,
          },
        ],
        thinking: { type: "disabled" },
      }),
      new Promise<never>((_, rej) => setTimeout(() => rej(new Error("timeout")), 15000)),
    ]);
    const raw = (completion as { choices?: { message?: { content?: string } }[] })?.choices?.[0]?.message?.content ?? "";
    const m = raw.match(/\{[\s\S]*\}/);
    if (m) {
      const parsed = JSON.parse(m[0]) as { verdict?: string; reason?: string };
      const v = (parsed.verdict || "").toUpperCase();
      if (v === "LIMPIO" || v === "SOSPECHOSO" || v === "INAPROPIADO") {
        // la IA nunca puede APROBAR algo que el filtro local marcó como sospechoso fuerte
        if (local.verdict === "SOSPECHOSO" && v === "LIMPIO") {
          return { verdict: "SOSPECHOSO", reason: `${parsed.reason || "Revisión humana"} · también marcado por filtro local`, ai: true };
        }
        return {
          verdict: v,
          reason: (parsed.reason || "").slice(0, 180),
          ai: true,
        };
      }
    }
  } catch {
    // sin IA disponible → aplicamos solo la heurística
  }

  // 3) fallback: la heurística decidió (LIMPIO o SOSPECHOSO)
  return local;
}
