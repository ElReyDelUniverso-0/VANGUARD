"use client";

// v80.0 — Cerebro del CONSEJO DE ACERO con el NÚCLEO EMBEBIDO (LLM corriendo
// en el navegador). Diseño para modelos pequeños:
//  · Intervenciones: 1 generación por consejero, texto plano en su voz.
//  · Veredicto/votos/decreto: 1 generación con formato por LÍNEAS etiquetadas
//    (los modelos de 0.5B fallan el JSON estricto pero siguen bien etiquetas).
//  · Parsers tolerantes: cualquier pieza que falle tiene plantilla de finta,
//    para que la sala NUNCA quede en silencio.
//  · MEMORIA PERSISTENTE: los consejeros recuerdan tus últimas crisis entre
//    sesiones (localStorage) y pueden referenciarlas. Esto no existía.

import { generarNucleo } from "./nucleo-navegador";

export type ConsejeroId = "estratega" | "canciller" | "general" | "analista";

const VOZ: Record<ConsejeroId, { nombre: string; desc: string }> = {
  estratega: {
    nombre: "EL ESTRATEGA",
    desc: "consejero táctico: frío, calculador, habla de mapas, suministros y consecuencias de segundo orden. Frases cortas y quirúrgicas.",
  },
  canciller: {
    nombre: "LA CANCILLER",
    desc: "consejera diplomática: elegante y medida, habla de tratados, sanciones, opinión pública y salidas negociables. Busca la mesa antes que el frente.",
  },
  general: {
    nombre: "EL GENERAL",
    desc: "consejero militar: seco y contundente, habla de capacidad, movilización y coste sin adornos. Desprecia la duda.",
  },
  analista: {
    nombre: "EL ANALISTA",
    desc: "consejero de datos: metódico y cuantitativo, habla con porcentajes y escenarios. Números antes que adjetivos.",
  },
};

function limpiar(s: string, max = 340): string {
  return s
    .replace(/^\s*(?:el|la)?\s*(?:estratega|canciller|general|analista)\s*:\s*/i, "")
    .replace(/[*#`_>]/g, "")
    .replace(/^["'“”\s]+|["'“”\s]+$/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function cortarEnFrase(s: string, max: number): string {
  if (s.length <= max) return s;
  const corte = s.slice(0, max);
  const p = Math.max(corte.lastIndexOf("."), corte.lastIndexOf("!"), corte.lastIndexOf("?"));
  return p > max * 0.5 ? corte.slice(0, p + 1) : corte.trim();
}

// ---------- MEMORIA PERSISTENTE (nunca vista: te recuerdan entre sesiones) ----------
export type Recuerdo = { tema: string; veredicto: string; fecha: number };
const MEM_KEY = "vanguard:nucleo-memoria:v1";

export function cargarMemoria(): Recuerdo[] {
  try {
    const m = JSON.parse(localStorage.getItem(MEM_KEY) ?? "[]");
    return Array.isArray(m) ? m.slice(0, 8) : [];
  } catch {
    return [];
  }
}

export function guardarRecuerdo(r: Recuerdo) {
  try {
    const lista = [r, ...cargarMemoria().filter((x) => x.tema !== r.tema)].slice(0, 8);
    localStorage.setItem(MEM_KEY, JSON.stringify(lista));
  } catch {}
}

export function textoMemoria(): string {
  const m = cargarMemoria();
  if (m.length === 0) return "";
  return `MEMORIA: ya deliberaste con este comandante en otras sesiones: ${m
    .slice(0, 3)
    .map((r) => `"${r.tema}" (veredicto: ${r.veredicto})`)
    .join("; ")}. Referéncialo solo si aporta.`;
}

// ---------- INTERVENCIÓN DE UN CONSEJERO ----------
// El prefijo de asistente ("EL GENERAL:") + continue_final_message fuerza el
// personaje y elimina preámbulos ("¡Claro!"): el modelo CONTINÚA la intervención.
export async function intervenirNucleo(id: ConsejeroId, tema: string): Promise<string | null> {
  const v = VOZ[id];
  const texto = await generarNucleo(
    [
      {
        role: "system",
        content: `Eres ${v.nombre}, ${v.desc} Estás en el CONSEJO DE ACERO del juego de geopolítica ficticio VANGUARD. Hablas SIEMPRE en primera persona y en español. Nunca narras ni das listas. Máximo 2 frases. No digas que eres una IA.`,
      },
      {
        role: "user",
        content: `CRISIS PLANTEADA POR EL COMANDANTE: "${tema}". ${textoMemoria()} Da tu intervención ante el consejo.`,
      },
      { role: "assistant", content: `${v.nombre}:` },
    ],
    90,
  );
  if (!texto) return null;
  const limpio = cortarEnFrase(limpiar(texto), 320);
  return limpio.length > 12 ? limpio : null;
}

// ---------- CARA A CARA CON UN CONSEJERO ----------
export async function dialogarNucleo(
  id: ConsejeroId,
  tema: string,
  mensaje: string,
  historial: string[],
): Promise<string | null> {
  const v = VOZ[id];
  const texto = await generarNucleo(
    [
      {
        role: "system",
        content: `Eres ${v.nombre}, ${v.desc} Estás cara a cara con el comandante en el CONSEJO DE ACERO (juego ficticio VANGUARD). Hablas en primera persona, en español, 2-3 frases, en tu voz. No digas que eres una IA.`,
      },
      {
        role: "user",
        content: `CONTEXTO: la crisis en la sala es "${tema}".\n${
          historial.length ? `ÚLTIMO INTERCAMBIO:\n${historial.slice(-3).join("\n")}\n` : ""
        }${textoMemoria()}\nEL COMANDANTE TE DICE: "${mensaje}". Contesta en tu voz.`,
      },
      { role: "assistant", content: `${v.nombre}:` },
    ],
    100,
  );
  if (!texto) return null;
  const limpio = cortarEnFrase(limpiar(texto, 380), 360);
  return limpio.length > 12 ? limpio : null;
}

// ---------- DECRETO ----------
// Diseño v80 (lección QA): pedir a un modelo de 0.5B "9 líneas etiquetadas"
// produce o copia verbatim o corte prematuro. Lo que SÍ sabe hacer:
// continuar una frase empezada. Así que el modelo solo redacta la frase del
// decreto ("El consejo ordena …") y el veredicto, votos y órdenes se derivan
// en el juego con validación estricta. Si la frase es basura → finta.
const VEREDICTOS = ["PROCEDER", "CONTENER", "NEGOCIAR", "ESPERAR"] as const;
type VotoNucleo = { id: ConsejeroId; voto: string; confianza: number };
type DecretoNucleo = { titulo: string; veredicto: string; texto: string; acciones: string[] };

function detectarVeredicto(frase: string): string {
  const t = frase.toLowerCase();
  if (/(negoci|la mesa|dipl|alto el fuego|acuerdo|tratado|ceder terreno para)/.test(t)) return "NEGOCIAR";
  if (/(esper|vigil|paciencia|no mover|pausa|monitore|observar|aguard)/.test(t)) return "ESPERAR";
  if (/(proced|actu|operaci|movi|avanz|golpe|cumpl|ejecut|despliegu)/.test(t)) return "PROCEDER";
  return "CONTENER";
}

const ACCIONES_VEREDICTO: Record<string, string[]> = {
  PROCEDER: ["Consulta la Sala OSINT antes de actuar", "Marca el objetivo en el Mapa Mundial", "Vuelve al consejo con pruebas nuevas"],
  CONTENER: ["Refuerza la vigilancia en Pulso Mundial", "Documenta el caso en Archivo Secreto", "Reevalúa en 24 horas con datos frescos"],
  NEGOCIAR: ["Abre expediente diplomático en Alianzas", "Consulta a los Embajadores por país", "Prepara tu propuesta para el tribunal"],
  ESPERAR: ["Vigila el Pulso Mundial cada 6 horas", "Abre expediente en el Archivo Secreto", "Trae el tema de vuelta al consejo"],
};

const TITULOS_VEREDICTO: Record<string, string[]> = {
  PROCEDER: ["VENTANA ABIERTA", "ORDEN DE AVANCE"],
  CONTENER: ["CONTENCIÓN FIRME", "MURO DE ACERO"],
  NEGOCIAR: ["MESA ANTES QUE FRENTE", "CANAL ABIERTO"],
  ESPERAR: ["ORDEN DE ESPERA", "MIRADA FIJA"],
};

// votos derivados del veredicto + hash de la sesión: variados, no aleatorios puros
function votosDe(veredicto: string, semilla: string): VotoNucleo[] {
  let h = 0;
  for (let i = 0; i < semilla.length; i++) h = (h * 31 + semilla.charCodeAt(i)) | 0;
  const bit = (i: number, m: number) => Math.abs((h >> i * 3) % m);
  const ids: ConsejeroId[] = ["estratega", "canciller", "general", "analista"];
  return ids.map((id, i) => {
    // el veredicto sesga los votos: mayoría coherente con la decisión
    const favor = veredicto === "PROCEDER" || veredicto === "NEGOCIAR";
    const r = bit(i, 100);
    const voto = r < (favor ? 55 : 35) ? "A FAVOR" : r < (favor ? 80 : 70) ? "EN CONTRA" : "ABSTENCIÓN";
    return { id, voto, confianza: 42 + bit(i + 5, 56) };
  });
}

export async function decretoNucleo(
  tema: string,
  intervenciones: string[],
): Promise<{ votos: VotoNucleo[]; decreto: DecretoNucleo } | null> {
  const texto = await generarNucleo(
    [
      {
        role: "system",
        content: "Eres el SECRETARIO del CONSEJO DE ACERO, juego de guerra ficticio. Terminas frases de decreto militar en español. Escribes solo la continuación, sin comillas, sin etiquetas, sin explicaciones.",
      },
      {
        role: "user",
        content: `CRISIS: "${tema}"\nINTERVENCIONES:\n${intervenciones
          .map((t, i) => `${i + 1}. ${t}`)
          .join("\n")}\n\nTermina la frase del decreto (máximo 16 palabras):`,
      },
      { role: "assistant", content: "El consejo ordena" },
    ],
    55,
  );
  if (!texto) return null;
  const frase = limpiar(texto, 150)
    .replace(/^(?:el\s+)?consejo\s+ordena\s*:??\s*/i, "")
    .replace(/<\|im_end\|>[\s\S]*$/, "")
    .trim();
  // validación estricta: si el modelo se salió del guion, finta
  if (frase.split(" ").length < 3 || frase.split(" ").length > 24) return null;
  if (/(crisis|intervenci|veredicto|voto\b|orden\d|secretario|im_start)/i.test(frase)) return null;

  const veredicto = detectarVeredicto(frase);
  const votos = votosDe(veredicto, frase + tema);
  const titulos = TITULOS_VEREDICTO[veredicto];
  const decreto: DecretoNucleo = {
    titulo: `DECRETO: ${titulos[Math.floor(Math.random() * titulos.length)]}`,
    veredicto,
    texto: `El consejo ordena ${frase.charAt(0).toLowerCase() + frase.slice(1)}.`,
    acciones: [...ACCIONES_VEREDICTO[veredicto]].sort(() => Math.random() - 0.5).slice(0, 3),
  };
  return { votos, decreto };
}

// ---------- FINTAS (respaldo procedural: la sala nunca calla) ----------
const STOP = new Set(["de", "la", "el", "los", "las", "un", "una", "y", "o", "en", "con", "para", "por", "que", "al", "del", "su", "es", "son", "se", "sobre"]);
function kw(tema: string): string {
  const w = tema
    .toLowerCase()
    .replace(/[^a-záéíóúñü0-9\s]/g, " ")
    .split(/\s+/)
    .filter((x) => x.length > 3 && !STOP.has(x));
  return w[0] ?? "la crisis";
}

const FINTA: Record<ConsejeroId, ((k: string) => string)[]> = {
  estratega: [
    (k) => `La geografía manda: alrededor de ${k} hay tres ejes y solo dos defendibles. Aseguro suministros antes de mover una pieza visible.`,
    (k) => `${k} es una partida de segundo orden: quien mueve primero cede la iniciativa. Preparo posiciones ocultas.`,
  ],
  canciller: [
    (k) => `Antes de que ${k} escale en la prensa, abriría un canal discreto. Una mesa callada vale más que diez discursos.`,
    (k) => `Hay margen diplomático en ${k}: tercero neutral, plazo corto y agenda mínima. Si falla, la coalición queda legitimada.`,
  ],
  general: [
    (k) => `La disuasión se demuestra, no se anuncia. Visibilidad de capacidades respecto a ${k} y nada más.`,
    (k) => `Pregunto lo incómodo: ¿qué pasa el día después en ${k}? Sin respuesta operativa, toda escalada es un cheque sin fondos.`,
  ],
  analista: [
    (k) => `Modelo rápido sobre ${k}: 52% congelamiento esta semana, 28% escalada retórica, 14% incidente físico. Faltan datos duros.`,
    (k) => `Tres señales vigilo en ${k}: tráficos logísticos, discursos internos y reservas. Si dos se mueven juntas, el modelo cambia.`,
  ],
};

export function intervencionFinta(id: ConsejeroId, tema: string): string {
  const k = kw(tema);
  const voces = FINTA[id];
  return voces[Math.floor(Math.random() * voces.length)](k);
}

export function decretoFinta(tema: string): { votos: VotoNucleo[]; decreto: DecretoNucleo } {
  const veredicto = VEREDICTOS[Math.floor(Math.random() * VEREDICTOS.length)];
  const ids: ConsejeroId[] = ["estratega", "canciller", "general", "analista"];
  const votos = ids.map((id) => ({
    id,
    voto: ["A FAVOR", "EN CONTRA", "ABSTENCIÓN"][Math.floor(Math.random() * 3)],
    confianza: 42 + Math.floor(Math.random() * 50),
  }));
  const k = kw(tema);
  const acciones: Record<string, string[]> = {
    PROCEDER: ["Consulta la Sala OSINT antes de actuar", "Marca el objetivo en el Mapa Mundial", "Vuelve al consejo con pruebas nuevas"],
    CONTENER: ["Refuerza la vigilancia en Pulso Mundial", "Documenta el caso en Archivo Secreto", "Reevalúa en 24 horas con datos frescos"],
    NEGOCIAR: ["Abre expediente diplomático en Alianzas", "Consulta a los Embajadores por país", "Prepara tu propuesta para el tribunal"],
    ESPERAR: ["Vigila el Pulso Mundial cada 6 horas", "Abre expediente en el Archivo Secreto", "Trae el tema de vuelta al consejo"],
  };
  return {
    votos,
    decreto: {
      titulo: `DECRETO: ${veredicto === "PROCEDER" ? "VENTANA ABIERTA" : veredicto === "CONTENER" ? "CONTENCIÓN FIRME" : veredicto === "NEGOCIAR" ? "MESA ANTES QUE FRENTE" : "ORDEN DE ESPERA"}`,
      veredicto,
      texto: `El consejo analiza "${k}" y ordena: ${veredicto.toLowerCase()} — sin regalar la iniciativa sobre ${k}.`,
      acciones: [...acciones[veredicto]].sort(() => Math.random() - 0.5).slice(0, 3),
    },
  };
}
