// Vanguard v102.0 LA CIUDADELA — MOTOR DE JUEGOS DE LA COMUNIDAD.
// El comandante pidió: "que se pueda publicar juegos dentro de Vanguard o
// que se puedan crear dentro de Vanguard".
// Tres motores SIN CÓDIGO — el creador rellena formularios, Vanguard genera
// el juego. Todo viaja como JSON validado en UgcItem.specs (kind "juego").
//  - quiz:   preguntas con 2-4 opciones y una correcta
//  - ordena: eventos que el jugador pone en orden cronológico
//  - vof:    afirmaciones VERDAD o MENTIRA

export type MotorJuego = "quiz" | "ordena" | "vof";

export interface PreguntaQuiz {
  q: string;
  o: string[];
  a: number; // índice de la opción correcta
}
export interface PasoOrdena {
  t: string; // texto del evento
}
export interface AfirmacionVof {
  t: string;
  v: boolean; // ¿es verdad?
}
export interface DatosJuego {
  quiz?: { preguntas: PreguntaQuiz[] };
  ordena?: { pasos: PasoOrdena[] };
  vof?: { afirmaciones: AfirmacionVof[] };
}
export interface JuegoDef {
  engine: MotorJuego;
  data: DatosJuego;
}

export const MOTORES: { id: MotorJuego; nombre: string; desc: string; min: number; max: number }[] = [
  { id: "quiz", nombre: "QUIZ DEL MUNDO", desc: "Preguntas con opciones — el clásico que nunca falla", min: 4, max: 12 },
  { id: "ordena", nombre: "ORDENA LA HISTORIA", desc: "Eventos revueltos: ponlos en orden cronológico", min: 4, max: 8 },
  { id: "vof", nombre: "VERDAD O MENTIRA", desc: "Afirmaciones desafiantes: ¿verdad o mentira?", min: 5, max: 10 },
];

const MAX_TEXTO = 160;
const MAX_OPCION = 90;
const MAX_JSON = 24_000;

function textoLimpio(s: unknown, max: number): string {
  if (typeof s !== "string") return "";
  const limpio = s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim();
  return limpio.slice(0, max);
}

/**
 * Valida y normaliza la definición de un juego del Taller.
 * Devuelve el JSON listo para guardar o un error legible.
 */
export function validarJuego(input: unknown): { ok: true; def: JuegoDef; json: string } | { ok: false; error: string } {
  let def: JuegoDef;
  try {
    def = (typeof input === "string" ? JSON.parse(input) : input) as JuegoDef;
  } catch {
    return { ok: false, error: "El juego llegó corrupto — publica de nuevo desde el Taller" };
  }
  if (!def || typeof def !== "object" || !def.engine || !def.data) {
    return { ok: false, error: "El juego está vacío — elige un motor y rellénalo" };
  }

  if (def.engine === "quiz") {
    const lista = Array.isArray(def.data.quiz?.preguntas) ? def.data.quiz!.preguntas : [];
    const motor = MOTORES[0];
    if (lista.length < motor.min || lista.length > motor.max)
      return { ok: false, error: `El quiz necesita entre ${motor.min} y ${motor.max} preguntas` };
    const preguntas: PreguntaQuiz[] = [];
    for (const p of lista) {
      const q = textoLimpio(p?.q, MAX_TEXTO);
      if (q.length < 6) return { ok: false, error: "Cada pregunta necesita al menos 6 letras" };
      const opciones = (Array.isArray(p?.o) ? p.o : []).slice(0, 4).map((o: unknown) => textoLimpio(o, MAX_OPCION));
      if (opciones.length < 2 || opciones.some((o: string) => o.length < 1))
        return { ok: false, error: "Cada pregunta necesita 2 a 4 opciones completas" };
      const a = Number(p?.a);
      if (!Number.isInteger(a) || a < 0 || a >= opciones.length)
        return { ok: false, error: "Marca la respuesta correcta en cada pregunta" };
      preguntas.push({ q, o: opciones, a });
    }
    const datos: DatosJuego = { quiz: { preguntas } };
    const json = JSON.stringify({ engine: "quiz", data: datos });
    if (json.length > MAX_JSON) return { ok: false, error: "El quiz es demasiado grande — recorta" };
    return { ok: true, def: { engine: "quiz", data: datos }, json };
  }

  if (def.engine === "ordena") {
    const lista = Array.isArray(def.data.ordena?.pasos) ? def.data.ordena!.pasos : [];
    const motor = MOTORES[1];
    if (lista.length < motor.min || lista.length > motor.max)
      return { ok: false, error: `Ordena necesita entre ${motor.min} y ${motor.max} eventos` };
    const pasos: PasoOrdena[] = [];
    for (const p of lista) {
      const t = textoLimpio(p?.t, MAX_TEXTO);
      if (t.length < 4) return { ok: false, error: "Cada evento necesita al menos 4 letras" };
      pasos.push({ t });
    }
    const datos: DatosJuego = { ordena: { pasos } };
    const json = JSON.stringify({ engine: "ordena", data: datos });
    if (json.length > MAX_JSON) return { ok: false, error: "El juego es demasiado grande — recorta" };
    return { ok: true, def: { engine: "ordena", data: datos }, json };
  }

  if (def.engine === "vof") {
    const lista = Array.isArray(def.data.vof?.afirmaciones) ? def.data.vof!.afirmaciones : [];
    const motor = MOTORES[2];
    if (lista.length < motor.min || lista.length > motor.max)
      return { ok: false, error: `Verdad o Mentira necesita entre ${motor.min} y ${motor.max} afirmaciones` };
    const afirmaciones: AfirmacionVof[] = [];
    for (const p of lista) {
      const t = textoLimpio(p?.t, MAX_TEXTO);
      if (t.length < 6) return { ok: false, error: "Cada afirmación necesita al menos 6 letras" };
      afirmaciones.push({ t, v: p?.v === true });
    }
    const datos: DatosJuego = { vof: { afirmaciones } };
    const json = JSON.stringify({ engine: "vof", data: datos });
    if (json.length > MAX_JSON) return { ok: false, error: "El juego es demasiado grande — recorta" };
    return { ok: true, def: { engine: "vof", data: datos }, json };
  }

  return { ok: false, error: "Motor de juego desconocido" };
}

/** ¿Es un juego del Taller (JSON estructurado) o un juego legacy (HTML/URL)? */
export function esJuegoTaller(specs: string): boolean {
  try {
    const def = JSON.parse(specs) as JuegoDef;
    return def?.engine === "quiz" || def?.engine === "ordena" || def?.engine === "vof";
  } catch {
    return false;
  }
}

// ====== barajado determinista (misma partida para todos, sin sorpresas de servidor) ======
export function barajarDeterminista<T>(arr: T[], seed: string): T[] {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    h ^= h << 13; h ^= h >>> 17; h ^= h << 5;
    const j = Math.abs(h) % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export const MEDALLAS = [
  { min: 1.0, nombre: "OJO DE ÁGUILA", icon: "🏆" },
  { min: 0.8, nombre: "ANALISTA DE ORO", icon: "🥇" },
  { min: 0.6, nombre: "OBSERVADOR", icon: "🥈" },
  { min: 0.0, nombre: "RECLUTA", icon: "🎖️" },
];
