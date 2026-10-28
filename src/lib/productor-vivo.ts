// ============================================================
// v191.0 EL PRODUCTOR — Vanguard produce contenido NUEVO SOLO.
// Mandato del Dueño: «que Vanguard produzca nuevas [cosas en] sus
// módulos». Hasta hoy el feed dependía de que la comunidad publicara:
// si nadie subía nada, PARA TI amanecía vacío y muerto. Ahora el feed
// es un organismo vivo: EL PRODUCTOR fabrica PULSOS — tarjetas con
// datos reales del planeta — y los siembra en el algoritmo con el
// tiempo, aunque nadie publique nada.
//
// Recetas del productor (mezcla de local y en vivo, todo best-effort):
//   ① EL DATO — efemérides REALES de Wikimedia (qué pasó un día como hoy).
//   ② EL CONFRONTA — VS de países con plantillas de guerra (local, jamás falla).
//   ③ LA PREGUNTA — «¿quién gana A contra B?» para el coliseo de predicciones.
//   ④ EL MEME DEL DÍA — el meme más gustado de la galería comunitaria
//     (/api/memes) entra al feed: los memes del pueblo, en PARA TI.
//   ⑤ EL CABLE CALIENTE — el titular de mayor impacto de /api/news (GDELT).
//
// RITMO: primera hornada al abrir, y luego 1 pulso nuevo cada
// PRODUCTOR_MS (4 min; localStorage vg191-cada lo afinca para QA)
// SOLO con la pestaña visible — jamás mientras el aparato duerme.
// Caché en localStorage (vg191-pulsos, tope 40): recargar no vacía el feed.
// ============================================================

import { WORLD_FLAGS, countryName } from "@/lib/world-data";
import type { TarjetaFeed } from "@/lib/algoritmo-feed";

const K_CACHE = "vg191-pulsos";
const MAX_PULSOS = 40;

export const PRODUCTOR_MS_DEFAULT = 240_000; // 4 min entre pulsos

export function productorMs(): number {
  try {
    const v = Number(localStorage.getItem("vg191-cada") || 0);
    if (v >= 5_000) return v; // QA: vg191-cada=8000 → un pulso cada 8s
  } catch { /* noop */ }
  return PRODUCTOR_MS_DEFAULT;
}

// ---------- caché local ----------

export function leerCache(): TarjetaFeed[] {
  try {
    const raw = localStorage.getItem(K_CACHE);
    if (!raw) return [];
    const arr = JSON.parse(raw) as TarjetaFeed[];
    return Array.isArray(arr) ? arr.filter((p) => p && p.tipo === "pulso") : [];
  } catch { return []; }
}

function guardarCache(pulsos: TarjetaFeed[]): void {
  try {
    localStorage.setItem(K_CACHE, JSON.stringify(pulsos.slice(0, MAX_PULSOS)));
  } catch { /* noop */ }
}

// ---------- recetas locales (jamás fallan) ----------

function paisAzar(): { code: string; name: string } {
  const f = WORLD_FLAGS[Math.floor(Math.random() * WORLD_FLAGS.length)];
  return { code: f.code, name: countryName(f.code) };
}

let nConfronta = 0;
function recetaConfronta(): TarjetaFeed {
  const a = paisAzar();
  let b = paisAzar();
  let vueltas = 0;
  while (b.code === a.code && vueltas < 8) { b = paisAzar(); vueltas++; }
  nConfronta += 1;
  const frentes = ["EL FRENTE", "EL COLISEO", "LA MESA DE GUERRA", "EL TABLERO MUNDIAL"];
  const frente = frentes[nConfronta % frentes.length];
  return {
    id: `pulso-vs-${Date.now()}-${nConfronta}`,
    tipo: "pulso",
    titulo: `${a.name.toUpperCase()} VS ${b.name.toUpperCase()} — ¿QUIÉN TOMA ${frente}? VOTA EN PREDICCIONES`,
    autor: "VANGUARD",
    ts: Date.now(),
    likes: 0,
    datos: { receta: "confronta", a: a.code, b: b.code },
  };
}

let nPregunta = 0;
function recetaPregunta(): TarjetaFeed {
  const a = paisAzar();
  const b = paisAzar();
  nPregunta += 1;
  const preguntas = [
    `¿SOBREVIVE ${a.name.toUpperCase()} A UNA CRISIS TOTAL? EL CONSEJO YA DELIBERA`,
    `${a.name.toUpperCase()} Y ${b.name.toUpperCase()} FIRMAN PAZ O PREPARAN TRAICIÓN — TÚ DECIDES`,
    `SI ${a.name.toUpperCase()} MOVILIZA MAÑANA, ¿A QUIÉN DESPIERTA?`,
  ];
  return {
    id: `pulso-pregunta-${Date.now()}-${nPregunta}`,
    tipo: "pulso",
    titulo: preguntas[nPregunta % preguntas.length],
    autor: "VANGUARD",
    ts: Date.now(),
    likes: 0,
    datos: { receta: "pregunta" },
  };
}

// ---------- recetas en vivo (best-effort, con gracia si fallan) ----------

async function recetaDato(): Promise<TarjetaFeed | null> {
  try {
    const r = await fetch("/api/efemerides", { cache: "no-store" });
    if (!r.ok) return null;
    const j = (await r.json()) as { items?: { year: number; text: string }[] };
    const its = j.items ?? [];
    if (its.length === 0) return null;
    const it = its[Math.floor(Math.random() * Math.min(its.length, 8))];
    return {
      id: `pulso-dato-${it.year}-${Date.now()}`,
      tipo: "pulso",
      titulo: `UN DÍA COMO HOY · ${it.year} — ${it.text.slice(0, 140).toUpperCase()}`,
      autor: "VANGUARD",
      ts: Date.now(),
      likes: 0,
      datos: { receta: "dato" },
    };
  } catch { return null; }
}

async function recetaMemeComunitario(): Promise<TarjetaFeed | null> {
  try {
    const r = await fetch("/api/memes?sort=top&limit=12", { cache: "no-store" });
    if (!r.ok) return null;
    const j = (await r.json()) as {
      memes?: { id: string; likes: number; createdAt: string; composicion?: string; texto?: string; autor?: string }[];
    };
    const memes = j.memes ?? [];
    if (memes.length === 0) return null;
    const m = memes[Math.floor(Math.random() * Math.min(memes.length, 5))];
    return {
      id: `pulso-memedia-${m.id}`,
      tipo: "pulso",
      titulo: `EL MEME DEL DÍA — EL PUEBLO YA RÍE (${m.likes} LIKES) · ABRE LA GALERÍA DE MEMES`,
      autor: m.autor || "LA COMUNIDAD",
      ts: Date.now(),
      likes: m.likes ?? 0,
      datos: { receta: "memedia", memeId: m.id },
    };
  } catch { return null; }
}

async function recetaCable(): Promise<TarjetaFeed | null> {
  try {
    const r = await fetch("/api/news?limit=6", { cache: "no-store" });
    if (!r.ok) return null;
    const j = (await r.json()) as {
      items?: { title?: string; impacto?: number; sourcecountry?: string }[];
    };
    const its = j.items ?? [];
    if (its.length === 0) return null;
    // el cable de MAYOR impacto disponible
    const hot = [...its].sort((a, b) => (b.impacto ?? 0) - (a.impacto ?? 0))[0];
    if (!hot?.title) return null;
    return {
      id: `pulso-cable-${Date.now()}`,
      tipo: "pulso",
      titulo: `CABLE CALIENTE · IMPACTO ${hot.impacto ?? "?"}/100 — ${hot.title.slice(0, 130).toUpperCase()}`,
      autor: "LA AGENCIA",
      ts: Date.now(),
      likes: Math.round(hot.impacto ?? 10),
      datos: { receta: "cable" },
    };
  } catch { return null; }
}

// ---------- hornadas ----------

/** Una hornada: 1 receta local inmediata + hasta 2 en vivo en paralelo. */
export async function hornada(): Promise<TarjetaFeed[]> {
  const local = Math.random() < 0.5 ? recetaConfronta() : recetaPregunta();
  const vivos = await Promise.all([recetaDato(), Math.random() < 0.5 ? recetaMemeComunitario() : recetaCable()]);
  const nuevos = [local, ...vivos.filter((x): x is TarjetaFeed => x !== null)];

  const cache = leerCache();
  const vistos = new Set(cache.map((p) => p.id));
  const frescos = nuevos.filter((p) => !vistos.has(p.id));
  const mezcla = [...frescos, ...cache].slice(0, MAX_PULSOS);
  guardarCache(mezcla);
  return frescos;
}

/** Primera hornada al abrir: 3 pulsos garantizados (local ×2 + vivo). */
export async function primeraHornada(): Promise<TarjetaFeed[]> {
  const cache = leerCache();
  const hoy = Date.now();
  // la caché del mismo día sigue válida; si está vieja (12 h) se renueva
  const fresca = cache.filter((p) => hoy - p.ts < 12 * 3_600_000);
  if (fresca.length >= 3) return [];
  const local2 = [recetaConfronta(), recetaPregunta()];
  const vivo = await Promise.all([recetaDato(), recetaCable()]);
  const nuevos = [...local2, ...vivo.filter((x): x is TarjetaFeed => x !== null)];
  const mezcla = [...nuevos, ...fresca].slice(0, MAX_PULSOS);
  guardarCache(mezcla);
  return nuevos;
}

/**
 * EL LATIDO DEL PRODUCTOR: programa la siguiente hornada con el ritmo
 * elegido y SOLO produce con la pestaña visible (si estaba oculta, produce
 * en cuanto vuelve). Devuelve la función de limpieza.
 */
export function latidoProductor(onPulsos: (pulsos: TarjetaFeed[]) => void): () => void {
  let vivo = true;
  let timer = 0;
  const tick = async () => {
    if (!vivo) return;
    if (typeof document !== "undefined" && document.hidden) {
      timer = window.setTimeout(tick, 15_000); // dormida: reintentar pronto
      return;
    }
    try {
      const pulsos = await hornada();
      if (pulsos.length > 0 && vivo) onPulsos(pulsos);
    } catch { /* el productor nunca tira la casa */ }
    if (vivo) timer = window.setTimeout(tick, productorMs());
  };
  timer = window.setTimeout(tick, productorMs());
  return () => { vivo = false; window.clearTimeout(timer); };
}
