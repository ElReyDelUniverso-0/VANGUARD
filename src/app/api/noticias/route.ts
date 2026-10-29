import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { asegurarTabla } from "@/lib/db-ddl";
import { createZAI } from "@/lib/zai-server";
import { iaParalela, primerJSON, gatewaySospechosoCaido } from "@/lib/ia-gateway";
import { busquedaAlternativa } from "@/lib/investiga-rss";

// v105.0 LA REDACCIÓN — la sala de lectura de Vanguard.
// Tres vías sobre la capa de noticias REALES que ya vive en la BD (GDELT +
// 15 medios RSS):
//   GET ?porque=<titulo>&s=<resumen>&f=<fuente>  → el ¿POR QUÉ IMPORTA? de una
//     noticia: contexto y antecedentes escritos por LA REDACCIÓN (IA), con
//     caché de 24 h — la misma explicación para todo el planeta.
//   GET ?investiga=<pregunta>                    → INVESTIGACIÓN REAL: búsqueda
//     web en vivo (web_search) + síntesis firmada con hallazgos citados
//     (medio + fecha, cero enlaces). Caché de 6 h.
//   GET (sin parámetros)                         → portada: las últimas piezas
//     con su resumen legible, bandera y tiempo de lectura.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// ---- rate limit en memoria por IP (patrón MENTE) ----
const hits = new Map<string, { n: number; ts: number }>();
const WINDOW_MS = 60_000;
const MAX_REQ = 12;

function limited(ip: string): boolean {
  const now = Date.now();
  const h = hits.get(ip);
  if (!h || now - h.ts > WINDOW_MS) {
    hits.set(ip, { n: 1, ts: now });
    if (hits.size > 500) {
      for (const [k, v] of hits) if (now - v.ts > WINDOW_MS) hits.delete(k);
    }
    return false;
  }
  h.n += 1;
  return h.n > MAX_REQ;
}

function ipDe(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for") || "";
  return fwd.split(",")[0].trim() || "local";
}

function clean(s: unknown, max: number): string {
  return String(s ?? "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

// huella estable de una pieza (misma técnica anti-repetidas del canal de noticias)
function huella(t: string): string {
  return (t || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(" ")
    .slice(0, 9)
    .join(" ");
}

// ---- caché persistente (tabla creada al vuelo — patrón site_counter) ----
async function cacheLeer(k: string, ttlMs: number): Promise<Record<string, unknown> | null> {
  try {
    await asegurarTabla(
      "redaccion_cache",
      "CREATE TABLE IF NOT EXISTS redaccion_cache (k TEXT PRIMARY KEY, v TEXT NOT NULL, ts BIGINT NOT NULL)"
    );
    const rows = await db.$queryRawUnsafe<{ v: string; ts: bigint }[]>(
      `SELECT v, ts FROM redaccion_cache WHERE k = '${k.replace(/'/g, "''")}' LIMIT 1`
    );
    if (rows.length === 0) return null;
    const ts = Number(rows[0].ts);
    if (Date.now() - ts > ttlMs) return null;
    return JSON.parse(rows[0].v) as Record<string, unknown>;
  } catch {
    return null;
  }
}

async function cacheGuardar(k: string, valor: unknown): Promise<void> {
  try {
    await asegurarTabla(
      "redaccion_cache",
      "CREATE TABLE IF NOT EXISTS redaccion_cache (k TEXT PRIMARY KEY, v TEXT NOT NULL, ts BIGINT NOT NULL)"
    );
    const v = JSON.stringify(valor).replace(/'/g, "''");
    await db.$executeRawUnsafe(
      `INSERT INTO redaccion_cache (k, v, ts) VALUES ('${k.replace(/'/g, "''")}', '${v}', ${Date.now()})
       ON CONFLICT (k) DO UPDATE SET v = '${v}', ts = ${Date.now()}`
    );
  } catch {
    /* la caché jamás tumba la respuesta */
  }
}

// ---- núcleo IA: doble vía (gateway directo → SDK) con deadline ----
function conDeadline<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, rej) => setTimeout(() => rej(new Error("deadline")), ms)),
  ]);
}
const DEADLINE_IA = 20_000;

async function llmJSON(system: string, user: string, ms = 24_000): Promise<Record<string, unknown> | null> {
  // v105.0 CARRERA 1∥3: gateway privado y núcleo público a la vez; si ambos
  // colapsan (raro), el SDK lo intenta 8s. Nunca más 40s de cuelgues muertos.
  let raw = "";
  try {
    raw = await conDeadline(iaParalela(system, user, ms), ms + 1500);
  } catch { /* vía 2 */ }
  if (!raw) {
    try {
      const zai = await createZAI();
      const completion = await conDeadline(zai.chat.completions.create({
        messages: [
          { role: "assistant", content: system },
          { role: "user", content: user },
        ],
        thinking: { type: "disabled" },
      }), 8000);
      raw = completion.choices[0]?.message?.content ?? "";
    } catch { /* agotado */ }
  }
  return raw ? primerJSON(raw) : null;
}

// ---- prompts ----
const SYSTEM_PORQUE = `Eres LA REDACCIÓN de VANGUARD, la sala de lectura de una plataforma de inteligencia. Un operador acaba de leer un titular y pulsa "¿POR QUÉ IMPORTA?". Tu trabajo: explicarlo como un redactor jefe de élite — claro, sobrio, educativo, sin sensacionalismo y sin tecnicismos innecesarios.
Reglas de acero: español; usa SOLO el material dado (titular, resumen, medio) más contexto general y verificable del tema; si el material es escaso, explica el contexto general del tema de forma honesta y nunca inventes datos concretos (cifras, nombres, fechas) que no estén en el material; cero violencia gráfica; cero enlaces; cero markdown.
Respondes SOLO con JSON válido, sin markdown:
{"explica":"2-4 frases: por qué importa esta noticia ahora mismo","contexto":"2-4 frases: los antecedentes esenciales para entenderla","claves":["exactamente 3 puntos clave, cada uno máximo 95 caracteres"],"sigue":"1 frase: qué conviene vigilar a partir de ahora"}`;

const SYSTEM_INVESTIGA = `Eres LA MENTE investigadora de VANGUARD. Recibes la pregunta de un operador y una lista de HALLAZGOS WEB REALES (título, medio, fecha y fragmento de páginas encontradas en vivo). Tu trabajo: sintetizar una respuesta DIRECTA a la pregunta usando esos hallazgos.
Reglas de acero: español; responde primero a lo que se preguntó (nada de evasivas); cada afirmación fáctica debe apoyarse en los hallazgos; si los hallazgos no alcanzan para algo, dilo con honestidad ("no se pudo verificar"); cero URLs y cero enlaces — al citar usa solo nombre del medio y fecha; cero violencia gráfica; cero markdown.
Respondes SOLO con JSON válido, sin markdown:
{"respuesta":"4-8 frases que responden directo a la pregunta","hallazgos":[{"titulo":"título verbatim del hallazgo","fuente":"medio verbatim","fecha":"fecha verbatim o vacía"}] máximo 6, SOLO del material real,"claves":["2-3 conclusiones, máx 95 caracteres cada una"],"confianza":0}
confianza: entero 0-100 según cuánto respaldan los hallazgos la respuesta.`;

export async function GET(req: Request) {
  if (limited(ipDe(req))) {
    return NextResponse.json({ ok: false, error: "La redacción respira — espera un momento" }, { status: 429 });
  }
  const url = new URL(req.url);
  const porque = url.searchParams.get("porque");
  const investiga = url.searchParams.get("investiga");

  // ---------- ¿POR QUÉ IMPORTA? ----------
  if (porque) {
    const titulo = clean(porque, 300);
    const resumen = clean(url.searchParams.get("s"), 600);
    const fuente = clean(url.searchParams.get("f"), 80);
    if (titulo.length < 8) {
      return NextResponse.json({ ok: false, error: "Titular demasiado corto para explicar" }, { status: 400 });
    }
    const k = `pq:${huella(titulo)}`;
    const cache = await cacheLeer(k, 24 * 3600_000);
    if (cache) {
      return NextResponse.json({ ok: true, ia: cache.ia === true, cache: true, ...cache });
    }
    const user = `TITULAR: ${titulo}\nMEDIO: ${fuente || "desconocido"}\nRESUMEN: ${resumen || "(sin resumen disponible)"}`;
    const json = await llmJSON(SYSTEM_PORQUE, user);
    if (json && typeof json.explica === "string" && json.explica) {
      const out = {
        ia: true,
        explica: clean(json.explica, 700),
        contexto: clean(json.contexto, 700),
        claves: Array.isArray(json.claves) ? json.claves.map((c) => clean(c, 110)).filter(Boolean).slice(0, 3) : [],
        sigue: clean(json.sigue, 220),
      };
      await cacheGuardar(k, out);
      return NextResponse.json({ ok: true, cache: false, ...out });
    }
    // respaldo honesto sin IA: la sala no se queda muda
    const out = {
      ia: false,
      explica: `El titular enlaza con una de las líneas de tensión que Vanguard vigila en tiempo real. ${resumen ? `Según ${fuente || "el medio"}: «${resumen.slice(0, 220)}». ` : ""}Sin el núcleo IA disponible en este pulso, la sala no inventa contexto: abre el Espejo o el Grafo Mundial para ver las piezas conectadas a esta historia.`,
      contexto: "",
      claves: [] as string[],
      sigue: "",
    };
    return NextResponse.json({ ok: true, cache: false, ...out });
  }

  // ---------- INVESTIGACIÓN REAL ----------
  if (investiga) {
    const q = clean(investiga, 240);
    if (q.length < 4) {
      return NextResponse.json({ ok: false, error: "Escribe qué investigar (mínimo 4 letras)" }, { status: 400 });
    }
    const k = `inv:${huella(q)}`;
    const cache = await cacheLeer(k, 6 * 3600_000);
    if (cache) {
      return NextResponse.json({ ok: true, cache: true, ...cache });
    }
    let hallazgos: { name: string; snippet: string; host: string; date: string }[] = [];
    // v105.0: si el gateway ya está marcado caído en esta instancia, su búsqueda
    // web también está bloqueada — vamos directo al RSS real (ahorra 9-15s)
    if (!gatewaySospechosoCaido()) {
      try {
        const zai = await createZAI();
        const res = (await conDeadline(
          zai.functions.invoke("web_search", { query: q, num: 8, recency_days: 45 }),
          9_000
        )) as { name?: string; snippet?: string; host_name?: string; date?: string }[];
        if (Array.isArray(res)) {
          hallazgos = res
            .filter((r) => r && (r.name || r.snippet))
            .slice(0, 8)
            .map((r) => ({
              name: clean(r.name, 200),
              snippet: clean(r.snippet, 400),
              host: clean(r.host_name, 80).replace(/^www\./, ""),
              date: clean(r.date, 40),
            }));
        }
      } catch { /* la red no respondió: seguimos */ }
    }
    // v105.0 vía 3 de hallazgos: Google News RSS — alcanzable desde producción
    if (hallazgos.length === 0) {
      const alt = await busquedaAlternativa(q, 8);
      hallazgos = alt.map((h) => ({ name: h.titulo, snippet: h.fragmento, host: h.medio, date: h.fecha }));
    }

    const material = hallazgos.length > 0
      ? hallazgos.map((h, i) => `[${i + 1}] ${h.name}\nMEDIO: ${h.host}\nFECHA: ${h.date || "sin fecha"}\nFRAGMENTO: ${h.snippet}`).join("\n\n")
      : "(la búsqueda web no devolvió hallazgos en este pulso)";

    const json = await llmJSON(SYSTEM_INVESTIGA, `PREGUNTA DEL OPERADOR: ${q}\n\nHALLAZGOS WEB:\n${material}`, 26_000);
    if (json && typeof json.respuesta === "string" && json.respuesta) {
      const out = {
        ia: true,
        web: hallazgos.length > 0,
        nHallazgos: hallazgos.length,
        respuesta: clean(json.respuesta, 1400),
        hallazgos: Array.isArray(json.hallazgos)
          ? json.hallazgos
              .map((h) => {
                const hh = h as { titulo?: unknown; fuente?: unknown; fecha?: unknown };
                return { titulo: clean(hh.titulo, 200), fuente: clean(hh.fuente, 80), fecha: clean(hh.fecha, 40) };
              })
              .filter((h) => h.titulo)
              .slice(0, 6)
          : [],
        claves: Array.isArray(json.claves) ? json.claves.map((c) => clean(c, 110)).filter(Boolean).slice(0, 3) : [],
        confianza: Math.max(0, Math.min(100, Math.round(Number(json.confianza) || 0))),
      };
      await cacheGuardar(k, out);
      return NextResponse.json({ ok: true, cache: false, ...out });
    }
    const out = {
      ia: false,
      web: hallazgos.length > 0,
      nHallazgos: hallazgos.length,
      respuesta: hallazgos.length > 0
        ? `La red devolvió ${hallazgos.length} hallazgos para «${q}», pero el núcleo de síntesis no respondió a tiempo. Los titulares reales están listos abajo — cada uno con su medio y fecha. Reintenta la síntesis en unos segundos.`
        : `Ni la búsqueda web ni el núcleo de síntesis respondieron en este pulso. Vanguard no inventa hallazgos: reintenta en unos segundos o reformula la pregunta con otro ángulo.`,
      hallazgos: hallazgos.slice(0, 6).map((h) => ({ titulo: h.name, fuente: h.host, fecha: h.date })),
      claves: [] as string[],
      confianza: 0,
    };
    return NextResponse.json({ ok: true, cache: false, ...out });
  }

  // ---------- PORTADA ----------
  try {
    const rows = await db.newsItem.findMany({
      orderBy: { publishedAt: "desc" },
      take: 72,
    });
    const items = rows.map((r) => ({
      id: r.id,
      t: r.title,
      s: r.summary || "",
      f: r.source,
      img: r.imageUrl || "",
      fecha: r.publishedAt.toISOString(),
      tag: r.tacticalTag || "INFO",
      conflicto: r.conflictTag || "",
      pais: r.sourceCountry || "",
    }));
    const ultimas = rows.reduce((acc, r) => Math.max(acc, r.createdAt.getTime()), 0);
    return NextResponse.json({
      ok: true,
      items,
      actualizadoMs: ultimas ? Date.now() - ultimas : 0,
      total: rows.length,
    });
  } catch (e) {
    console.error("noticias route error", e);
    return NextResponse.json({ ok: false, items: [], error: "archivo no disponible" }, { status: 200 });
  }
}
