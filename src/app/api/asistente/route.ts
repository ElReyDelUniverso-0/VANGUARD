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
// v181.0 EL AGENTE TOTAL: «van por ti a lugares solo por decirle y puedes
// editar y mirar Vanguard solo hablando» — dos poderes nuevos DETERMINISTAS:
//  · tipo "ficha": «muéstrame la ficha de Ucrania» → abre la CARTA de la
//    colección (vg:asistente-ficha la descubre como si se tocara a mano)
//  · tipo "idioma": «cambia el idioma a inglés» → cambia el idioma de la
//    Casa en vivo (store del idioma) y el agente confirma EN EL NUEVO idioma
//  · «edita mi perfil» → sala PERFIL (Personalizar Perfil)
// Reglas de acero:
//  · el destino SOLO puede ser una clave del vocabulario real (TAB_LABELS.es)
//  · el conflicto SOLO puede ser una clave real del feed (/api/news)
//  · MURO 20 peticiones por IP y minuto (la voz no es gratis)
//  · sin SDK disponible → intérprete determinista local (nunca se queda mudo)
// POST { texto, lang, tab, tabs?: [{key,label}] }

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const VOCAB = TAB_LABELS.es; // clave -> etiqueta en español (fuente única con la paleta)
const CLAVES_VALIDAS = new Set(Object.keys(VOCAB));

// v181.0 — LOS 9 CONFLICTOS REALES del feed (catálogo v176, claves estables de
// /api/news conflictTag). Espejo HONESTO: la voz solo puede abrir cartas que
// existen — jamás inventa una ficha. El nombre es SOLO para confirmar hablando.
const CONFLICTOS: { id: string; nombre: string; alias: string[] }[] = [
  { id: "ukraine", nombre: "VG-01 RUSIA—UCRANIA", alias: ["ucrania", "ukraine", "rusia", "russia", "zelenski", "zelensky", "putin", "kiev", "donesk", "donetsk", "vg-01", "vg01", "vg 01"] },
  { id: "gaza", nombre: "VG-02 ISRAEL—GAZA", alias: ["gaza", "palestina", "palestine", "hamas", "israel", "netanyahu", "rafah", "vg-02", "vg02", "vg 02"] },
  { id: "lebanon", nombre: "VG-03 ISRAEL—HEZBOLÁ", alias: ["libano", "líbano", "lebanon", "beirut", "hezbola", "hezbolá", "hezbollah", "nasrallah", "vg-03", "vg03", "vg 03"] },
  { id: "sudan", nombre: "VG-04 SUDÁN: SAF—FRS", alias: ["sudan", "sudán", "darfur", "jartum", "khartoum", "saf", "frs", "rsf", "vg-04", "vg04", "vg 04"] },
  { id: "redsea", nombre: "VG-05 EL MAR ROJO", alias: ["mar rojo", "red sea", "huties", "hutíes", "houthi", "houthis", "yemen", "sanaa", "bab el mandeb", "vg-05", "vg05", "vg 05"] },
  { id: "korea", nombre: "VG-06 LAS DOS COREAS", alias: ["corea", "korea", "kim", "pyongyang", "pyongyang", "seul", "seúl", "seoul", "norcorea", "corea del norte", "vg-06", "vg06", "vg 06"] },
  { id: "taiwan", nombre: "VG-07 EL ESTRECHO DE TAIWÁN", alias: ["taiwan", "taiwán", "taipei", "formosa", "vg-07", "vg07", "vg 07"] },
  { id: "hormuz", nombre: "VG-08 ORMUZ—IRÁN", alias: ["hormuz", "ormuz", "iran", "irán", "iran", "teheran", "teherán", "persia", "golfo persico", "golfo pérsico", "vg-08", "vg08", "vg 08"] },
  { id: "sahel", nombre: "VG-09 EL SAHEL", alias: ["sahel", "mali", "malí", "niger", "níger", "burkina", "jnim", "eigs", "vg-09", "vg09", "vg 09"] },
];

function buscaConflicto(t: string): { id: string; nombre: string } | null {
  for (const c of CONFLICTOS) {
    for (const a of c.alias) {
      if (t === a) return c;
      if (a.length >= 5 && t.includes(a)) return c;
      if (a.length < 5 && new RegExp("(^|\\s)" + a.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "($|\\s)").test(t)) return c;
    }
  }
  return null;
}

// v181.0 — LOS 8 IDIOMAS de la Casa (Lang de i18n.ts): «cambia el idioma»
const IDIOMAS: { id: string; alias: string[] }[] = [
  { id: "es", alias: ["espanol", "español", "castellano", "spanish"] },
  { id: "en", alias: ["ingles", "inglés", "english", "inglés"] },
  { id: "pt", alias: ["portugues", "portugués", "brasil", "brazilian"] },
  { id: "fr", alias: ["frances", "francés", "french"] },
  { id: "de", alias: ["aleman", "alemán", "german"] },
  { id: "it", alias: ["italiano", "italian"] },
  { id: "ru", alias: ["ruso", "russian"] },
  { id: "zh", alias: ["chino", "chinese", "mandarin", "mandarín"] },
];

function buscaIdioma(t: string): string | null {
  for (const i of IDIOMAS) for (const a of i.alias) if (t.includes(a)) return i.id;
  return null;
}

const CONFIRMA_IDIOMA: Record<string, string> = {
  es: "Hecho. Español activo.", en: "Done. English active.", pt: "Feito. Português ativo.",
  fr: "Fait. Français actif.", de: "Erledigt. Deutsch aktiv.", it: "Fatto. Italiano attivo.",
  ru: "Готово. Русский активен.", zh: "完成。中文已激活。",
};

const LANG_NOMBRE: Record<string, string> = {
  es: "español", en: "inglés", pt: "portugués", fr: "francés",
  de: "alemán", it: "italiano", ru: "ruso", zh: "chino",
};

const SYSTEM = `Eres VG-ASSIST, el agente de voz de VANGUARD (plataforma mundial de conflictos geopolíticos, noticias en vivo y simulación). El piloto te habla y tú interpretas SU INTENCIÓN.

Devuelve UN JSON EXACTO con:
- "hablar": tu respuesta SPOKEN en {IDIOMA}, máximo 220 caracteres, tono de oficial de inteligencia: directo, frío, sin relleno. Nada de markdown ni emojis.
- "accion": un objeto:
  · {"tipo":"navegar","destino":"CLAVE"} si quiere ir a una sección — CLAVE debe ser EXACTAMENTE una de: [CLAVES]
  · {"tipo":"buscar","consulta":"texto"} si quiere buscar algo concreto (un país, un conflicto, un término)
  · {"tipo":"menu"} si quiere ver el menú completo o el índice
  · {"tipo":"ficha","destino":"CONFLICTO"} si quiere VER la ficha/carta coleccionable de un conflicto — CONFLICTO debe ser EXACTAMENTE uno de: [ukraine, gaza, lebanon, sudan, redsea, korea, taiwan, hormuz, sahel]
  · {"tipo":"idioma","destino":"es|en|pt|fr|de|it|ru|zh"} si pide cambiar el idioma de la plataforma
  · {"tipo":"hablar"} si solo pregunta algo y la respuesta te basta

REGLAS:
- Si pide noticias / qué pasa en el mundo / últimas horas → navegar a "centro" (CENTRO MUNDIAL) y en "hablar" resume que abres el centro de impacto en vivo.
- Si menciona un país o conflicto concreto con "ficha", "carta" o "colección", o pide «muéstrame/enséñame» un conflicto → tipo "ficha" con SU clave de conflicto.
- Si pide el MAPA del mundo o ver mapas → navegar a "maps" (Google Maps de Conflictos). Si pide CREAR un mapa o editar mapas → navegar a "studios". Si pide el mapa de incidentes → navegar a "incidentes".
- Si pide BANDERAS (ver/crear banderas) o música o contenido de creadores → navegar a "studios" (Estudios Creadores: noticias, banderas, mapas, música).
- Si pide crear su nación / Age of Nations → navegar a "edad".
- Si pide cambiar/poner el idioma (inglés, chino, portugués…) → tipo "idioma" con su código.
- Si pide editar/personalizar/configurar su perfil → navegar a "perfil" (Personalizar Perfil).
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

  // v181.0: ① IDIOMA — «cambia el idioma a inglés» en la red de seguridad
  if (/\b(cambia|cambiar|cambiale|pon|poner|ponle|idioma|language)\b/.test(t)) {
    const idi = buscaIdioma(t);
    if (idi) {
      if (idi === lang) {
        return { hablar: es ? "Ya hablamos en ese idioma, piloto." : "Already speaking that language, pilot.", accion: { tipo: "hablar" } };
      }
      return { hablar: CONFIRMA_IDIOMA[idi], accion: { tipo: "idioma", destino: idi } };
    }
  }

  // v181.0: ② FICHA — «muéstrame la ficha de Ucrania» abre la CARTA entera
  const conf = buscaConflicto(t);
  if (conf && /\b(ficha|fichas|carta|cartas|coleccion|muestrame|ensename|mira|abre|abrir)\b/.test(t)) {
    return {
      hablar: es ? `Abriendo la ficha ${conf.nombre}.` : `Opening card ${conf.nombre}.`,
      accion: { tipo: "ficha", destino: conf.id },
    };
  }

  // "abre X" / "ir a X" / "muestra X" / "edita mi perfil" → buscar la sección cuyo nombre encaje
  const patronAbrir = t.match(/(?:abre|abrir|entra|ir\s+a|vamos\s+a|muestra|ense|llevame|lleva\s+me|ve\s+a|edita|editar|personaliza|configura|open|go\s+to)\s+(?:la\s+|el\s+|los\s+|las\s+|mi\s+|tu\s+)?([a-z0-9ñáéíóúü\s]{3,40})/);
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

  // ═══ v181.0 EL AGENTE TOTAL — dos ramas DETERMINISTAS antes del LLM ═══
  // La voz que VA por ti a los lugares y MIRA Vanguard contigo: abrir una
  // carta concreta de la colección y cambiar el idioma de la Casa. Cero
  // alucinación: si el conflicto o el idioma no existen, la rama no dispara.
  const tNorm = norm(texto);
  const es = lang === "es";

  // ① IDIOMA: «cambia el idioma a inglés» / «habla chino»
  const posibleIdioma =
    /\b(cambia|cambiar|cambiale|cambie|pon|poner|ponle|switch)\b/.test(tNorm) ||
    /\b(habla|hablar|responde)\b.*\b(idioma|ingles|espanol|english|chino|ruso|frances|aleman|italiano|portugues)\b/.test(tNorm) ||
    /\b(idioma|language|lenguaje)\b/.test(tNorm) ||
    (/\b(quiero|dame)\b/.test(tNorm) && !!buscaIdioma(tNorm));
  const idiomaP = posibleIdioma ? buscaIdioma(tNorm) : null;
  if (idiomaP) {
    if (idiomaP === lang) {
      return NextResponse.json({
        hablar: es ? "Ya hablamos en ese idioma, piloto." : "Already speaking that language, pilot.",
        ai: false,
        accion: { tipo: "hablar" },
      });
    }
    return NextResponse.json({
      hablar: CONFIRMA_IDIOMA[idiomaP],
      ai: false,
      accion: { tipo: "idioma", destino: idiomaP },
    });
  }

  // ② FICHA: «muéstrame la ficha de Ucrania» / «abre gaza» / «la carta VG-05»
  const pideCarta =
    /\b(ficha|fichas|carta|cartas|coleccion)\b/.test(tNorm) ||
    /\b(muestrame|ensename|mirame|mira|abre|abrir)\b/.test(tNorm);
  if (pideCarta) {
    const conf = buscaConflicto(tNorm);
    if (conf) {
      return NextResponse.json({
        hablar: es ? `Abriendo la ficha ${conf.nombre}.` : `Opening card ${conf.nombre}.`,
        ai: false,
        accion: { tipo: "ficha", destino: conf.id },
      });
    }
  }

  // ═══ v201.0 LA VOZ VIVA — MAPAS y BANDERAS antes del LLM ═══
  // «abre el mapa» / «crea un mapa» / «muestra las banderas» / «naciones»:
  // la voz vuela a las salas de cartografía SIN esperar a la IA. Cero
  // alucinación: solo salas que existen en la Casa.
  const pideMapa = /\b(mapa|mapas)\b/.test(tNorm);
  const pideBanderas = /\b(bandera|banderas|flags?)\b/.test(tNorm);
  const creaEnEstudios = /\b(crea|crear|haz|hacer|dibuja|dibujar|pinta|pintar|edita|editar|disena|fabrica|construye)\b/.test(tNorm) || /\bmusica\b/.test(tNorm);
  if (pideMapa && /\b(incidente|incidentes|incidencia)\b/.test(tNorm)) {
    return NextResponse.json({
      hablar: es ? "Abriendo el mapa de incidentes en vivo." : "Opening the live incidents map.",
      ai: false,
      accion: { tipo: "navegar", destino: "incidentes" },
    });
  }
  if (pideBanderas || (pideMapa && creaEnEstudios) || (!pideMapa && creaEnEstudios && /\b(estudios?|creador|contenido)\b/.test(tNorm))) {
    return NextResponse.json({
      hablar: es ? "Abriendo los Estudios Creadores: noticias, banderas, mapas y música a tu mano." : "Opening Creator Studios: news, flags, maps and music at your command.",
      ai: false,
      accion: { tipo: "navegar", destino: "studios" },
    });
  }
  if (pideMapa) {
    return NextResponse.json({
      hablar: es ? "Abriendo el mapa mundial de conflictos." : "Opening the world conflict map.",
      ai: false,
      accion: { tipo: "navegar", destino: "maps" },
    });
  }
  if (/\b(naciones|age\s*of\s*nations|aof)\b/.test(tNorm)) {
    return NextResponse.json({
      hablar: es ? "Abriendo Age of Nations: tu nación te espera, comandante." : "Opening Age of Nations: your nation awaits, commander.",
      ai: false,
      accion: { tipo: "navegar", destino: "edad" },
    });
  }

  // ═══ v180.0 VANGUARD AUTOMÁTICO — BRIEFING DETERMINISTA ANTES DEL LLM ═══
  // «léeme las noticias» / «¿qué pasa?» → el motor EN VIVO responde con cables
  // REALES (títulos, países e impacto del centro mundial). Cero alucinación:
  // la rama no toca el LLM y si el motor duerme, se dice la verdad.
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
      const tipo = ["navegar", "buscar", "menu", "hablar", "ficha", "idioma"].includes(a.tipo || "") ? a.tipo! : "hablar";

      if (tipo === "navegar" && a.destino && CLAVES_VALIDAS.has(a.destino)) {
        return NextResponse.json({ hablar, ai: true, accion: { tipo: "navegar", destino: a.destino } });
      }
      if (tipo === "ficha" && a.destino && CONFLICTOS.some((c) => c.id === a.destino)) {
        return NextResponse.json({ hablar, ai: true, accion: { tipo: "ficha", destino: a.destino } });
      }
      if (tipo === "idioma" && a.destino && IDIOMAS.some((i) => i.id === a.destino)) {
        return NextResponse.json({ hablar: CONFIRMA_IDIOMA[a.destino] || hablar, ai: true, accion: { tipo: "idioma", destino: a.destino } });
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
