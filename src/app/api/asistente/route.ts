import { NextRequest, NextResponse } from "next/server";
import { muro } from "@/lib/fortaleza";
import { TAB_LABELS } from "@/lib/i18n-tabs";

// v179.0 VG-ASSIST — EL AGENTE DE VOZ: el oído y la boca de Vanguard.
// El cliente transcribe la voz del piloto (Web Speech API) y manda el texto.
// Este route es el CEREBRO: interpreta la intención y devuelve
//   { hablar, ai, accion: { tipo: "navegar"|"buscar"|"menu"|"hablar", destino?, consulta? }, briefing? }
// v180.0 VANGUARD AUTOMÁTICO: «léeme las noticias» ya NO solo navega —
// el cerebro pregunta al motor en vivo y devuelve un BRIEFING HABLADO con
// los cables reales del momento (determinista, ANTES del LLM: cero alucinación).
// Reglas de acero:
//  · el destino SOLO puede ser una clave del vocabulario real (TAB_LABELS.es)
//  · MURO 20 peticiones por IP y minuto (la voz no es gratis)
//  · sin SDK disponible → intérprete determinista local (nunca se queda mudo)
// POST { texto, lang, tab, tabs?: [{key,label}] }

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const VOCAB = TAB_LABELS.es; // clave -> etiqueta en español (fuente única con la paleta)
const CLAVES_VALIDAS = new Set(Object.keys(VOCAB));

const LANG_NOMBRE: Record<string, string> = {
  es: "español", en: "inglés", pt: "portugués", fr: "francés",
  de: "alemán", it: "italiano", ru: "ruso", zh: "chino",
};

const SYSTEM = `Eres VG-ASSIST, el agente de voz de VANGUARD (plataforma mundial de conflictos geopolíticos, noticias en vivo y simulación). El piloto te habla y tú interpretas SU INTENCIÓN.

Devuelve UN JSON EXACTO con:
- "hablar": tu respuesta SPOKEN en {IDIOMA}, máximo 140 caracteres, tono de oficial de inteligencia: directo, frío, sin relleno. Nada de markdown ni emojis.
- "accion": un objeto:
  · {"tipo":"navegar","destino":"CLAVE"} si quiere ir a una sección — CLAVE debe ser EXACTAMENTE una de: [CLAVES]
  · {"tipo":"buscar","consulta":"texto"} si quiere buscar algo concreto (un país, un conflicto, un término)
  · {"tipo":"menu"} si quiere ver el menú completo o el índice
  · {"tipo":"hablar"} si solo pregunta algo y la respuesta te basta

REGLAS:
- Si pide noticias / qué pasa en el mundo / últimas horas → navegar a "centro" (CENTRO MUNDIAL) y en "hablar" resume que abres el centro de impacto en vivo.
- Si menciona un país o conflicto concreto con "ficha" o "colección" → navegar a "fichas".
- Si pide una sección por nombre o sinónimo razonable, elige SU clave. Si no está seguro, usa "buscar" con el término.
- NUNCA inventes claves fuera de la lista. NUNCA prometas acciones que no existen.
- Devuelve EXACTAMENTE: {"hablar":"...","accion":{...}}`;

function norm(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "").trim();
}

/** Intérprete determinista: la red de seguridad si la IA no está disponible. */
function heuristica(
  texto: string,
  lang: string
): { hablar: string; accion: { tipo: string; destino?: string; consulta?: string } } {
  const t = norm(texto);
  const es = lang === "es";
  const pedidoBusca = /^(busca|buscar|encuentra|buscame|búscame|search)\b/.test(t) || /\b(buscame|búscame|busca)\s+(.{2,})/.test(texto.toLowerCase());

  // "abre X" / "ir a X" / "muestra X" → buscar la sección cuyo nombre encaje
  const patronAbrir = t.match(/(?:abre|abrir|entra|ir\s+a|vamos\s+a|muestra|ense|llevame|lleva\s+me|ve\s+a|open|go\s+to)\s+(?:la\s+|el\s+|los\s+|las\s+)?([a-z0-9ñáéíóúü\s]{3,40})/);
  const objetivo = patronAbrir?.[1]?.trim() ?? "";

  if (objetivo) {
    let mejor: { clave: string; puntos: number } | null = null;
    for (const [clave, etiqueta] of Object.entries(VOCAB)) {
      const e = norm(etiqueta);
      const o = norm(objetivo);
      let puntos = 0;
      if (clave === o) puntos = 100;
      else if (e.includes(o) && o.length >= 4) puntos = 80;
      else if (o.includes(e) && e.length >= 4) puntos = 70;
      else {
        // palabra clave suelta: "fichas", "crisis", "arcade"…
        const primera = o.split(/\s+/)[0];
        if (primera.length >= 4 && (e.startsWith(primera) || clave === primera)) puntos = 60;
        else if (primera.length >= 4 && e.split(/[\s(]/)[0].startsWith(primera.slice(0, 5))) puntos = 50;
      }
      if (puntos > 0 && (!mejor || puntos > mejor.puntos)) mejor = { clave, puntos };
    }
    if (mejor && mejor.puntos >= 50) {
      return {
        hablar: es ? `Abriendo ${VOCAB[mejor.clave].split("(")[0].trim()}.` : `Opening ${VOCAB[mejor.clave].split("(")[0].trim()}.`,
        accion: { tipo: "navegar", destino: mejor.clave },
      };
    }
    // país/conflicto que no es sección → paleta con la consulta
    return {
      hablar: es ? "Sin sala directa para eso. Abro la búsqueda con tu término." : "No direct room for that. Opening search.",
      accion: { tipo: "buscar", consulta: objetivo.slice(0, 40) },
    };
  }

  if (pedidoBusca) {
    const consulta = texto.toLowerCase().replace(/^(busca|buscar|encuentra|búscame|buscame|search)\s*/i, "").slice(0, 40).trim();
    if (consulta.length >= 2) {
      return {
        hablar: es ? `Buscando «${consulta}» en todo Vanguard.` : `Searching for "${consulta}".`,
        accion: { tipo: "buscar", consulta },
      };
    }
  }

  if (/\b(menu|menú|indice|índice|index|todo|secciones)\b/.test(t)) {
    return {
      hablar: es ? "Desplegando el menú completo." : "Opening the full menu.",
      accion: { tipo: "menu" },
    };
  }

  return {
    hablar: es
      ? "No te entendí, piloto. Di «abre» más el nombre de una sala, o «busca» más un término."
      : "I didn't catch that, pilot. Say 'open' plus a room name, or 'search' plus a term.",
    accion: { tipo: "hablar" },
  };
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const vMuro = muro(`asistente:${ip}`, 20, 60_000);
  if (!vMuro.permitido) {
    return NextResponse.json(
      { error: `Muro de la Ciudadela: demasiadas órdenes de voz — espera ${Math.ceil(vMuro.espera / 60)} min.` },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const texto = String(body.texto || "").slice(0, 300).trim();
  const lang = LANG_NOMBRE[String(body.lang || "es")] ? String(body.lang || "es") : "es";
  const tabActual = String(body.tab || "inicio").slice(0, 30);
  if (!texto) return NextResponse.json({ error: "Falta el texto de la orden" }, { status: 400 });

  // ═══ v180.0 VANGUARD AUTOMÁTICO — BRIEFING DETERMINISTA ANTES DEL LLM ═══
  // «léeme las noticias» / «¿qué pasa?» → el motor EN VIVO responde con cables
  // REALES (títulos, países e impacto del centro mundial). Cero alucinación:
  // la rama no toca el LLM y si el motor duerme, se dice la verdad.
  const tNorm = norm(texto);
  const pidePulso =
    /\b(lee(me)?|leeme|briefing|informe|pulso|novedades|noticias|news|que\s+pasa|que\s+hay|actualidad|ultimas?\s+horas?|resumen)\b/.test(tNorm);
  if (pidePulso) {
    try {
      const ctrl = new AbortController();
      const reloj = setTimeout(() => ctrl.abort(), 9000);
      const rNoticias = await fetch(new URL("/api/news?modo=centro", req.nextUrl.origin), {
        signal: ctrl.signal,
        cache: "no-store",
      });
      clearTimeout(reloj);
      if (rNoticias.ok) {
        const d = (await rNoticias.json()) as {
          items?: { id: string; title?: string; paisNombre?: string; impacto?: number | string; tier?: string; edad?: string }[];
          pulso?: { total?: number; paises?: number; urgente?: number; critico?: number };
        };
        const items = (d.items || [])
          .map((c) => ({ ...c, imp: Number(c.impacto) || 0 }))
          .sort((a, b) => b.imp - a.imp)
          .slice(0, 4);
        const p = d.pulso || {};
        if (items.length) {
          const es = lang === "es";
          const cabecera = es
            ? `Pulso del mundo: ${p.total ?? items.length} cables en vivo, ${p.paises ?? "-"} países.`
            : `World pulse: ${p.total ?? items.length} live cables, ${p.paises ?? "-"} countries.`;
          const lineas = items.map(
            (c) => `${c.paisNombre || "MUNDO"} (${c.imp}) — ${(c.title || "").slice(0, 80)}`
          );
          const hablar =
            (cabecera + " " + lineas.slice(0, 3).join(". ")).slice(0, 480) +
            (es ? ". Te dejo en el Centro Mundial." : ". Taking you to the World Center.");
          return NextResponse.json({
            hablar,
            ai: false,
            accion: { tipo: "navegar", destino: "centro" },
            briefing: items.map((c) => ({
              titulo: (c.title || "").slice(0, 110),
              pais: c.paisNombre || "MUNDO",
              impacto: c.imp,
              tier: c.tier || "alto",
              edad: c.edad || "",
            })),
          });
        }
      }
    } catch {
      // motor dormido → cae al LLM/heurística de abajo (honestidad siempre)
    }
  }

  // vocabulario que el LLM puede pisar (claves reales + etiqueta en español)
  const vocabLineas = Object.entries(VOCAB)
    .map(([k, v]) => `${k} = ${v.split("(")[0].trim()}`)
    .join("; ");
  const systemFinal = SYSTEM
    .replace("{IDIOMA}", LANG_NOMBRE[lang])
    .replace("[CLAVES]", vocabLineas.slice(0, 6000));

  // 1º) intento IA con reloj; 2º) red de seguridad determinista
  try {
    const { default: ZAI } = await import("z-ai-web-dev-sdk");
    const zai = await ZAI.create();
    const completion = await Promise.race([
      zai.chat.completions.create({
        messages: [
          { role: "system", content: systemFinal },
          { role: "user", content: `PESTAÑA ACTUAL: ${tabActual}\nORDEN DEL PILOTO: «${texto}»` },
        ],
        thinking: { type: "disabled" },
      }),
      new Promise<never>((_, rej) => setTimeout(() => rej(new Error("timeout")), 15000)),
    ]);
    const raw = (completion as { choices?: { message?: { content?: string } }[] })?.choices?.[0]?.message?.content ?? "";
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]) as {
        hablar?: string;
        accion?: { tipo?: string; destino?: string; consulta?: string };
      };
      const hablar = (parsed.hablar || "").trim().slice(0, 220);
      const a = parsed.accion || {};
      const tipo = ["navegar", "buscar", "menu", "hablar"].includes(a.tipo || "") ? a.tipo! : "hablar";

      if (tipo === "navegar" && a.destino && CLAVES_VALIDAS.has(a.destino)) {
        return NextResponse.json({ hablar, ai: true, accion: { tipo: "navegar", destino: a.destino } });
      }
      if (tipo === "buscar" && (a.consulta || "").trim().length >= 2) {
        return NextResponse.json({ hablar, ai: true, accion: { tipo: "buscar", consulta: a.consulta!.trim().slice(0, 40) } });
      }
      if (tipo === "menu") {
        return NextResponse.json({ hablar, ai: true, accion: { tipo: "menu" } });
      }
      if (hablar) {
        return NextResponse.json({ hablar, ai: true, accion: { tipo: "hablar" } });
      }
    }
  } catch {
    // sin IA → heurística (abajo)
  }

  const h = heuristica(texto, lang);
  return NextResponse.json({ hablar: h.hablar, ai: false, accion: h.accion });
}
