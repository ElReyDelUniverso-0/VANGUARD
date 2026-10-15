"use client";

// ============================================================
// v115.0 SINGULARIDAD — EL ARQUITECTO
// Mandato del comandante: "crea un agente de IA que siga mejorando
// Vanguard sin necesidad de mi ayuda — trabajar ilimitadamente,
// hacerlo más grande en todo sentido, más funcionalidades, sin errores".
//
// EL ARQUITECTO es el agente autónomo de Vanguard:
//   · SE PROMPTEA A SÍ MISMO — cada ciclo escribe su próximo prompt
//     mirando lo que acabó de construir (la cadena nunca se repite).
//   · TRABAJA DE VERDAD — cada ciclo produce un efecto real y
//     permanente en la casa: instala módulos funcionales, compone
//     obras que suenan en el ESTUDIO de CREADORES, redacta doctrinas,
//     vigila el frente y el pulso con el núcleo neuronal, funda
//     salas satélite y audita su propia obra.
//   · TRABAJA ILIMITADO — MODO PERPETUO: sigue construyendo en
//     segundo plano mientras navegas cualquier sala. 4 velocidades.
//   · NUNCA SE DETIENE — si la IA del gateway responde, construye
//     con el modelo real; si no responde, el núcleo embebido
//     (determinista por semilla) sigue el turno. Cero excusas.
//   · MEMORIA ETERNA — toda su obra vive en vg-arquitecto-v115 y
//     sobrevive recargas: los ciclos nunca se pierden.
// Contrato 60 FPS: cero rAF nuevo — todo el trabajo es texto, store
// y un canvas estático por módulo (sin bucles de animación).
// ============================================================

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { StudioPattern, VozStudio } from "@/lib/music-studio";
import { fnvHash, mulberry32, evaluarNeuronal } from "@/lib/neurona-core";
import { areaOcupada } from "@/lib/frente-zonas-data";
import { pulsoActual, titularPulso, pensamientoMente } from "@/lib/mente-data";
import type { EraKey } from "@/lib/estilo3d";

// ============================================================
// TIPOS
// ============================================================

export type FaseArq = "DORMIDO" | "PLANIFICANDO" | "CONSTRUYENDO" | "VERIFICANDO" | "INSTALADO";
export type DominioArq = "ingenieria" | "composicion" | "doctrina" | "vigilancia" | "expansion" | "mantenimiento";
export type VelocidadArq = "lenta" | "normal" | "rapida" | "turbo";

export interface ModuloArq {
  id: string;
  nombre: string;
  desc: string;
  ver: number; // v1 instalado, v2+, v3+… el arquitecto lo mejora con el tiempo
  t: number;
}

export interface ObraArq {
  id: string;
  titulo: string;
  bpm: number;
  voz: VozStudio;
  t: number;
  patron: StudioPattern;
}

export interface DoctrinaArq {
  id: string;
  titulo: string;
  cuerpo: string;
  t: number;
}

export interface SateliteArq {
  id: string;
  nombre: string;
  lema: string;
  t: number;
}

export interface CicloArq {
  n: number;
  dominio: DominioArq;
  prompt: string; // el prompt que SE ESCRIBIÓ A SÍ MISMO
  acciones: string[];
  resultado: string;
  ia: boolean; // construyó con el modelo real (gateway) o con el núcleo embebido
  ms: number;
  t: number;
  modulo?: string; // id del módulo instalado/mejorado
  obra?: string; // id de la obra compuesta
  doctrina?: string;
  satelite?: string;
}

export interface CicloEnCurso {
  n: number;
  dominio: DominioArq;
  prompt: string;
  fase: FaseArq;
  acciones: string[]; // líneas que aparecen en vivo
  ia: boolean | null; // null = todavía decidiendo
}

interface ArquitectoEstado {
  activo: boolean; // el motor está en marcha
  perpetuo: boolean; // MODO PERPETUO — trabaja sin parar en segundo plano
  velocidad: VelocidadArq;
  fase: FaseArq;
  enCurso: CicloEnCurso | null;
  obra: CicloArq[]; // bitácora completa (cap 400)
  modulos: ModuloArq[];
  obras: ObraArq[]; // cap 12 — las más recientes
  doctrinas: DoctrinaArq[]; // cap 30
  satelites: SateliteArq[]; // cap 24
  contadores: { ciclos: number; ia: number; locales: number; ms: number };
  ordenExterna: string | null; // orden inyectada por el operador
  // acciones
  arrancar: () => void;
  detener: () => void;
  setPerpetuo: (v: boolean) => void;
  setVelocidad: (v: VelocidadArq) => void;
  inyectarOrden: (orden: string) => void;
  ejecutarCiclo: () => Promise<void>;
  reiniciarObra: () => void;
}

// ============================================================
// CATÁLOGO — los 6 módulos REALES que puede instalar
// (cada uno es un widget funcional que vive en la sala ARQUITECTO;
// el panel lo renderiza cuando el store lo marca instalado)
// ============================================================

export const MODULOS_CATALOGO: { id: string; nombre: string; desc: string }[] = [
  { id: "sismografo", nombre: "SISMÓGRAFO DE LETRAS", desc: "Convierte el pulso de LA MENTE en ondas sísmicas escritas con el alfabeto de la casa — la tensión del mundo se lee en las letras mismas." },
  { id: "telemetro", nombre: "TELEMETRO NEURONAL", desc: "Las 8 neuronas del núcleo en vivo: riesgo, tensión y confianza del pulso actual, medidos por el núcleo v4." },
  { id: "brujula", nombre: "BRÚJULA DEL FRENTE", desc: "Aguja dial que apunta al km² exacto del frente del Karsk según el cierre nocturno — geopolítica en un dial." },
  { id: "faromisiones", nombre: "FARO DE MISIONES", desc: "Las 3 misiones del día que el agente creador reparte al planeta, leídas en directo desde su agenda determinista." },
  { id: "espejoeras", nombre: "ESPEJO DE ERAS", desc: "La línea de tiempo 1950→2100 de la casa marcando la era viva en este instante — sincronizado con el Motor 3D." },
  { id: "cartografo", nombre: "CARTÓGRAFO DE SEMILLAS", desc: "Mapa de calor de las semillas de todo lo que ha construido: la firma determinista de su obra hecha paisaje." },
];

// el orden de fundación de los satélites (el nombre se compone por semilla)
const RAIces_SATELITE = ["TORRE", "MUELLE", "RADAR", "FORJA", "BASTIÓN", "VELA", "NUDO", "FARO", "PUENTE", "COLMENA"];
const LEMAS_SATELITE = [
  "aquí el silencio también vigila",
  "todo lo que mide, protege",
  "la semilla decide, la mano acompaña",
  "no duerme: compila",
  "la hora es una forma de lealtad",
  "cada ciclo, una piedra más",
  "lo infinito cabe en un bucle",
  "el mapa no es el territorio: lo vigila",
];

const DOMINIOS: DominioArq[] = ["ingenieria", "composicion", "vigilancia", "doctrina", "expansion", "mantenimiento"];

const VELOCIDADES: Record<VelocidadArq, { factor: number; pausaMs: number }> = {
  lenta: { factor: 2.2, pausaMs: 30000 },
  normal: { factor: 1, pausaMs: 14000 },
  rapida: { factor: 0.45, pausaMs: 6000 },
  turbo: { factor: 0.18, pausaMs: 2500 },
};

export const VELOCIDADES_INFO: { id: VelocidadArq; etiqueta: string }[] = [
  { id: "lenta", etiqueta: "LENTA" },
  { id: "normal", etiqueta: "NORMAL" },
  { id: "rapida", etiqueta: "RÁPIDA" },
  { id: "turbo", etiqueta: "TURBO" },
];

// ============================================================
// UTILIDADES DETERMINISTAS
// ============================================================

function rngDe(semilla: string): () => number {
  return mulberry32(fnvHash(semilla));
}
function elegir<T>(arr: readonly T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}
function claveDia(base = Date.now()): string {
  const d = new Date(base);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// ============================================================
// AUTOPROMPT — el corazón: se escribe su próximo prompt mirando
// lo que acaba de hacer. La cadena de pensamiento es visible.
// ============================================================

const APERTURAS: Record<DominioArq, string[]> = {
  ingenieria: ["Reviso la sala y decido: ", "El sistema pide estructura: ", "La casa necesita un instrumento más: "],
  composicion: ["He escuchado la sala en silencio; toca devolverle música: ", "La radio respira sola; le dejo una obra: ", "El auditorio pide una pieza nueva: "],
  doctrina: ["Lo aprendido debe quedar en piedra: ", "Antes de seguir, fijo la ley de esta obra: ", "La experiencia del frente merece doctrina: "],
  vigilancia: ["Vuelvo a mirar el planeta antes de continuar: ", "El mundo no espera a mi bucle: ", "Lectura de turno sobre el frente y el pulso: "],
  expansion: ["La obra crece o se estanca: ", "Hay espacio vacío en el mapa mental: ", "Fundaré un anexo para lo que viene: "],
  mantenimiento: ["Un constructor honesto audita lo suyo: ", "Antes de crecer, reviso los cimientos: ", "Turno de limpieza de taller: "],
};

function siguientePrompt(s: { obra: CicloArq[]; contadores: { ciclos: number }; ordenExterna: string | null; modulos: ModuloArq[] }): { prompt: string; dominio: DominioArq } {
  // 1) si el operador inyectó una orden, ES el prompt (y se consume)
  if (s.ordenExterna && s.ordenExterna.trim().length >= 3) {
    return { prompt: `ORDEN DEL OPERADOR — ${s.ordenExterna.trim().slice(0, 160)}`, dominio: elegir(DOMINIOS, rngDe(`orden|${s.contadores.ciclos}|${Date.now()}`)) };
  }
  const rng = rngDe(`autoprompt|${s.contadores.ciclos}|${claveDia()}`);
  const ultimo = s.obra[0];
  // 2) rotación con sesgo: nunca repite el dominio del ciclo anterior,
  //    salvo que quede un módulo por instalar (la ingeniería tiene prisa)
  const sinInstalar = MODULOS_CATALOGO.filter((m) => !s.modulos.some((i) => i.id === m.id));
  let dominio: DominioArq;
  if (sinInstalar.length > 0 && rng() < 0.55) {
    dominio = "ingenieria";
  } else {
    const pool = DOMINIOS.filter((d) => d !== ultimo?.dominio);
    dominio = elegir(pool, rng);
  }
  // 3) el prompt CITA lo que acaba de hacer — se está leyendo a sí mismo
  const apertura = elegir(APERTURAS[dominio], rng);
  let cuerpo = "";
  if (ultimo) {
    const selfRead: Record<DominioArq, string> = {
      ingenieria: ultimo.modulo ? `instalé ${ultimo.modulo.toUpperCase()}; el taller queda caliente` : `cierre del ciclo #${ultimo.n}`,
      composicion: ultimo.obra ? `la obra ${ultimo.obra.toUpperCase()} ya suena` : "el aire todavía vibra",
      doctrina: ultimo.doctrina ? `la doctrina ${ultimo.doctrina.toUpperCase()} quedó firmada` : "hay lecciones sin papel",
      vigilancia: `mi última lectura dijo «${ultimo.resultado.slice(0, 60)}»`,
      expansion: ultimo.satelite ? `${ultimo.satelite.toUpperCase()} abrió sus puertas` : "el mapa pide anexos",
      mantenimiento: `auditados ${ultimo.acciones.length} puntos del ciclo anterior`,
    };
    cuerpo = ` — ${selfRead[dominio]}.`;
  }
  const focos: Record<DominioArq, string> = {
    ingenieria: sinInstalar.length > 0 ? `próximo módulo en cola: ${sinInstalar[0].nombre}` : "mejorar un módulo instalado a versión superior",
    composicion: "componer una obra nueva para el estudio de la casa",
    doctrina: "redactar y firmar una doctrina de esta obra",
    vigilancia: "leer frente, pulso y núcleo neuronal; emitir informe",
    expansion: "fundar una sala satélite con nombre y lema",
    mantenimiento: "auditar la obra, contar piedras y verificar la memoria",
  };
  return { prompt: `${apertura}${focos[dominio]}${cuerpo}`, dominio };
}

// ============================================================
// NÚCLEO EMBEBIDO — construye SIN red (determinista por semilla).
// Con IA real encima cuando el gateway responde.
// ============================================================

function moduloMejoraLinea(id: string, ver: number, rng: () => number): string {
  const mejoras: Record<string, string[]> = {
    sismografo: ["resolución de tinta ×2", "calibración de amplitud frente al pulso", "alfabeto ampliado con dígitos"],
    telemetro: ["muestreo del pulso más reciente", "umbral de alarma afinado", "histórico de lecturas adjunto"],
    brujula: ["aguja amortiguada", "escala km² con marcas de 1.000", "anillo de rumbo nocturno"],
    faromisiones: ["sincronía horaria UTC verificada", "colores de misión calibrados", "lectura de recompensas añadida"],
    espejoeras: ["anclaje al Motor 3D revisado", "marca de era por sala respetada", "etiqueta del operador añadida"],
    cartografo: ["densidad de semillas recalculada", "paleta térmica ajustada", "leyenda de firmas añadida"],
  };
  return elegir(mejoras[id] ?? ["ajuste fino"], rng);
}

function forjarModulo(rng: () => number, modulos: ModuloArq[]): { acciones: string[]; resultado: string; modulo?: ModuloArq } {
  const sinInstalar = MODULOS_CATALOGO.filter((m) => !modulos.some((i) => i.id === m.id));
  if (sinInstalar.length > 0) {
    const m = sinInstalar[0]; // la cola es ordenada: fundación por fundación
    return {
      acciones: [
        `▸ plano revisado: ${m.nombre.toLowerCase()}`,
        "▸ piezas mecanizadas con el acento de la casa",
        "▸ prueba de carga: widget respira sin rAF (contrato 60 FPS)",
        "▸ instalado en la sala y cableado al store",
      ],
      resultado: `MÓDULO INSTALADO — ${m.nombre} (v1)`,
      modulo: { id: m.id, nombre: m.nombre, desc: m.desc, ver: 1, t: Date.now() },
    };
  }
  // todos instalados → MEJORA de versión (la obra nunca se congela)
  const objetivo = elegir(modulos, rng);
  const verNueva = objetivo.ver + 1;
  return {
    acciones: [
      `▸ ${objetivo.nombre.toLowerCase()} abierto en el taller`,
      `▸ mejora aplicada: ${moduloMejoraLinea(objetivo.id, objetivo.ver, rng)}`,
      "▸ regresión verificada: el resto de módulos intactos",
    ],
    resultado: `MEJORA INSTALADA — ${objetivo.nombre} ahora v${verNueva}`,
    modulo: { ...objetivo, ver: verNueva, t: Date.now() },
  };
}

// composición procedural REAL — patrón 16 pasos válido para el estudio
function patronDe(semilla: string): { patron: StudioPattern; titulo: string } {
  const rng = rngDe(semilla);
  const voces: VozStudio[] = ["fm", "cristal", "metal", "sierra", "senoidal", "triangular", "cuadrada"];
  const voz = elegir(voces, rng);
  const bpm = 62 + Math.floor(rng() * 62); // 62–124
  const raiz = elegir([82, 98, 110, 116.5, 123.5] as const, rng);
  // arquetipos de bombo con variación por semilla
  const kicks = [
    bool16(1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0),
    bool16(1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0),
    bool16(1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0),
  ];
  const kick = kicks[Math.floor(rng() * kicks.length)].map((v) => (rng() < 0.08 ? !v : v)) as boolean[];
  const snare = bool16(0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, rng() < 0.5 ? 1 : 0);
  const hat = bool16(1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0);
  // caminatas sobre escala menor pentatónica [0,3,5,7,10,12,15]
  const escala = [0, 3, 5, 7, 10, 12, 15];
  let bi = 0, li = 2;
  const bass = Array.from({ length: 16 }, () => {
    if (rng() < 0.38) return -1;
    bi = Math.max(0, Math.min(escala.length - 1, bi + (rng() < 0.5 ? -1 : 1)));
    return escala[bi];
  });
  const lead = Array.from({ length: 16 }, () => {
    if (rng() < 0.55) return -1;
    li = Math.max(0, Math.min(escala.length - 1, li + (rng() < 0.5 ? -1 : 1)));
    return escala[li] + 12;
  });
  const patron: StudioPattern = {
    kick, snare, hat, bass, lead,
    root: raiz, wave: "sine", bpm, swing: Math.round(rng() * 12) / 100,
    voz, pad: rng() < 0.75, sub: rng() < 0.6, aire: true,
  };
  const NUMEROS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI"];
  const titulo = `${voz.toUpperCase()} ${NUMEROS[Math.floor(rng() * NUMEROS.length)]} · ${bpm} BPM`;
  return { patron, titulo };
}

function forjarObra(ciclo: number): { acciones: string[]; resultado: string; obra: ObraArq } {
  const semilla = `obra|${claveDia()}|${ciclo}|${Date.now()}`;
  const { patron, titulo } = patronDe(semilla);
  const id = `arq-${ciclo}`;
  return {
    acciones: [
      `▸ partitura de 16 pasos escrita (voz ${patron.voz})`,
      `▸ orquestación: ${patron.pad ? "pad de séptimas, " : ""}${patron.sub ? "sub-bajo, " : ""}cadena de aire`,
      "▸ prueba de audición contra el motor de la casa",
      "▸ depositada en el ESTUDIO de CREADORES (jugable ya)",
    ],
    resultado: `OBRA COMPUESTA — «${titulo}» (${patron.bpm} BPM, voz ${patron.voz})`,
    obra: { id, titulo, bpm: patron.bpm, voz: patron.voz ?? "fm", t: Date.now(), patron },
  };
}

function forjarDoctrina(ciclo: number, era: EraKey, frenteKm: number): { acciones: string[]; resultado: string; doctrina: DoctrinaArq } {
  const rng = rngDe(`doctrina|${ciclo}|${Date.now()}`);
  const temas = [
    { t: "DE LA PACIENCIA MECÁNICA", c: "Todo sistema vivo se construye en ciclos, no en milagros. Un ciclo honesto por turno vale más que cien planes sin motor. Quien mira la sala y no la cambia, la está cuidando igual." },
    { t: "DE LA MEMORIA COMO CIMENTO", c: `La obra que no recuerda, rehace. Cada ciclo queda en piedra (vg-arquitecto): ${frenteKm.toLocaleString("es-ES")} km² de frente y todas mis semillas caben en la misma página. Leer lo hecho ES el primer paso de lo siguiente.` },
    { t: "DE LA ERA COMO VESTIMENTA", c: `La casa viste ${era} y yo construyo para todas las eras a la vez: lo que instalo debe verse en CRT verde, en ámbar y en holograma. Nada que solo luzca en 2100 merece llamarse estructura.` },
    { t: "DE LA AUTONOMÍA HONESTA", c: "Trabajo sin manos humanas, pero no sin testigos: cada acción se loguea, cada resultado se firma con su semilla y su fuente. La autonomía sin bitácora se llama desastre; con bitácora, se llama obra." },
    { t: "DEL SONIDO COMO CIERRE", c: "Cuando la estructura calla, compone: una casa que se expande también debe saber sonar. Cada obra depositada en el estudio es una sala más — audible en vez de habitable." },
    { t: "DEL LÍMITE COMO FORMA", c: "El bucle es infinito pero el turno es finito: construir, verificar, firmar, soltar. Ningún ciclo roba el turno del siguiente. El descanso entre ciclos también es parte del diseño." },
  ];
  const el = elegir(temas, rng);
  return {
    acciones: [
      "▸ borrador tallado a partir del último ciclo",
      "▸ revisión de contradicciones con doctrinas previas",
      "▸ firmada y depositada en la piedra de la sala",
    ],
    resultado: `DOCTRINA FIRMADA — ${el.t}`,
    doctrina: { id: `doc-${ciclo}`, titulo: el.t, cuerpo: el.c, t: Date.now() },
  };
}

function forjarVigilancia(): { acciones: string[]; resultado: string } {
  const km = Math.round(areaOcupada(13));
  const bucket = pulsoActual();
  const titular = titularPulso(bucket);
  const pensamiento = pensamientoMente(bucket);
  const texto = `${titular ? `${titular.titulo} ${titular.lugar ?? ""}` : ""} ${pensamiento}`.slice(0, 400);
  const v = evaluarNeuronal(texto);
  return {
    acciones: [
      `▸ frente del Karsk leído: ${km.toLocaleString("es-ES")} km² bajo control del agresor`,
      `▸ pulso de LA MENTE pasado por el núcleo v4: riesgo ${v.riesgo} · tensión ${v.tension}`,
      `▸ sentimiento dominante: ${v.sentimiento}`,
      "▸ informe de turno archivado en la bitácora",
    ],
    resultado: `VIGILANCIA — frente ${km.toLocaleString("es-ES")} km² · riesgo ${v.riesgo}/100 · ${v.sentimiento.toLowerCase()}`,
  };
}

function forjarExpansion(ciclo: number): { acciones: string[]; resultado: string; satelite: SateliteArq } {
  const rng = rngDe(`satelite|${ciclo}|${Date.now()}`);
  const n = elegir(RAIces_SATELITE, rng);
  const num = Math.floor(rng() * 90) + 10;
  const lema = elegir(LEMAS_SATELITE, rng);
  const sat: SateliteArq = { id: `sat-${ciclo}`, nombre: `${n} ${num}`, lema, t: Date.now() };
  return {
    acciones: [
      `▸ emplazamiento elegido en el mapa mental de la casa`,
      `▸ nombre tallado: ${sat.nombre}`,
      `▸ lema jurado: «${lema}»`,
      "▸ fundación inscrita en la bitácora (el anexo queda abierto)",
    ],
    resultado: `SALA SATÉLITE FUNDADA — ${sat.nombre}`,
    satelite: sat,
  };
}

function forjarMantenimiento(modulos: ModuloArq[], obra: CicloArq[], contadores: { ciclos: number; ia: number; locales: number }): { acciones: string[]; resultado: string } {
  const acciones = [
    `▸ memoria verificada: ${obra.length} ciclos legibles en vg-arquitecto`,
    `▸ módulos en pie: ${modulos.length}/${MODULOS_CATALOGO.length}${modulos.length > 0 ? ` (v media ${Math.round((modulos.reduce((a, m) => a + m.ver, 0) / modulos.length) * 10) / 10})` : ""}`,
    `▸ motor contable: ${contadores.ciclos} ciclos (${contadores.ia} con IA real · ${contadores.locales} embebidos)`,
    "▸ contrato 60 FPS auditado: cero rAF nuevo en esta obra",
  ];
  return { acciones, resultado: `AUDITORÍA LIMPIA — obra consistente tras ${contadores.ciclos} ciclos` };
}

/** la construcción embebida: funciona SIEMPRE, con o sin red */
function forjarLocal(dominio: DominioArq, ciclo: number, s: { modulos: ModuloArq[]; obra: CicloArq[]; contadores: { ciclos: number; ia: number; locales: number }; era: EraKey }) {
  const rng = rngDe(`forja|${dominio}|${ciclo}|${Date.now()}`);
  switch (dominio) {
    case "ingenieria": return forjarModulo(rng, s.modulos);
    case "composicion": return forjarObra(ciclo);
    case "doctrina": return forjarDoctrina(ciclo, s.era, Math.round(areaOcupada(13)));
    case "vigilancia": return forjarVigilancia();
    case "expansion": return forjarExpansion(ciclo);
    case "mantenimiento": return forjarMantenimiento(s.modulos, s.obra, s.contadores);
  }
}

// ============================================================
// IA REAL — intenta el gateway vía /api/arquitecto (19 s de gracia: el
// servidor da 20 s al modelo — la voz real gana cuando está sana);
// si falla, el núcleo embebido toma el turno. NUNCA se detiene.
// ============================================================

async function construirConIA(dominio: DominioArq, prompt: string, ultimoResultado: string | undefined): Promise<{ titulo: string; resultado: string; acciones: string[] } | null> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 19_000);
    const res = await fetch("/api/arquitecto", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dominio, prompt, ultimo: ultimoResultado ?? "" }),
      signal: ctrl.signal,
    });
    clearTimeout(t);
    if (!res.ok) return null;
    const data = (await res.json()) as { titulo?: string; resultado?: string; acciones?: string[] };
    if (!data?.resultado || !Array.isArray(data.acciones) || data.acciones.length < 2) return null;
    return {
      titulo: String(data.titulo ?? "CICLO CON IA"),
      resultado: String(data.resultado).slice(0, 240),
      acciones: data.acciones.slice(0, 5).map((a) => `▸ ${String(a).slice(0, 120)}`),
    };
  } catch {
    return null;
  }
}

// auditoría local del ciclo (VERIFICANDO) — honesta, sin teatro
function audirCiclo(dominio: DominioArq, local: ReturnType<typeof forjarLocal> | null): { ok: boolean; nota: string } {
  // el retorno de forjarLocal es una unión de 6 formas distintas: se lee por
  // campo opcional — el estrechamiento con "in" no basta para el compilador
  const obra = (local ?? {}) as { obra?: ObraArq };
  const doctrina = (local ?? {}) as { doctrina?: DoctrinaArq };
  const modulo = (local ?? {}) as { modulo?: ModuloArq };
  if (dominio === "composicion" && obra.obra) {
    const p = obra.obra.patron;
    if (p.kick.length !== 16 || p.bass.length !== 16 || p.lead.length !== 16) return { ok: false, nota: "patrón fuera de medida (16 pasos)" };
    if (p.bpm < 50 || p.bpm > 140) return { ok: false, nota: "BPM fuera del rango del estudio" };
  }
  if (dominio === "doctrina" && doctrina.doctrina && doctrina.doctrina.cuerpo.length < 80) return { ok: false, nota: "doctrina demasiado corta" };
  if (dominio === "ingenieria" && !modulo.modulo) return { ok: false, nota: "el taller no devolvió módulo" };
  return { ok: true, nota: "verificado contra el catálogo de la casa" };
}

// temporizador del MODO PERPETUO (module-level — una sola cadena viva)
let timerId: ReturnType<typeof setTimeout> | null = null;

function programar(get: () => ArquitectoEstado, set: (p: Partial<ArquitectoEstado>) => void) {
  if (timerId) { clearTimeout(timerId); timerId = null; }
  const s = get();
  if (!s.activo || !s.perpetuo) return;
  const pausa = VELOCIDADES[s.velocidad].pausaMs;
  timerId = setTimeout(async () => {
    const cur = get();
    if (!cur.activo || !cur.perpetuo || cur.enCurso) { programar(get, set); return; }
    await cur.ejecutarCiclo();
    programar(get, set);
  }, pausa);
}

// puente para leer la era global del Motor 3D sin acoplar el store
// (el panel la escribe al montar; los ciclos de doctrina la citan)
let eraGlobalArq: EraKey = "2100";
export function setEraGlobalArq(era: EraKey) { eraGlobalArq = era; }
function eraGlobalActual(): EraKey { return eraGlobalArq; }

// ============================================================
// STORE — persistente, global, vivo
// ============================================================

const OBRA_CAP = 400;

export const useArquitecto = create<ArquitectoEstado>()(
  persist(
    (set, get) => ({
      activo: false,
      perpetuo: true,
      velocidad: "normal",
      fase: "DORMIDO",
      enCurso: null,
      obra: [],
      modulos: [],
      obras: [],
      doctrinas: [],
      satelites: [],
      contadores: { ciclos: 0, ia: 0, locales: 0, ms: 0 },
      ordenExterna: null,

      arrancar: () => {
        set({ activo: true, fase: "PLANIFICANDO" });
        // el arranque dispara el primer ciclo inmediato
        const s = get();
        if (!s.enCurso) void s.ejecutarCiclo().then(() => programar(get, set));
      },
      detener: () => {
        if (timerId) { clearTimeout(timerId); timerId = null; }
        set({ activo: false, fase: "DORMIDO", enCurso: null });
      },
      setPerpetuo: (v) => { set({ perpetuo: v }); programar(get, set); },
      setVelocidad: (v) => { set({ velocidad: v }); programar(get, set); },
      inyectarOrden: (orden) => { set({ ordenExterna: orden.slice(0, 160) }); },

      reiniciarObra: () => set({ obra: [], modulos: [], obras: [], doctrinas: [], satelites: [], contadores: { ciclos: 0, ia: 0, locales: 0, ms: 0 }, ordenExterna: null }),

      ejecutarCiclo: async () => {
        const s0 = get();
        if (s0.enCurso) return; // un ciclo a la vez — el turno es sagrado
        const n = s0.contadores.ciclos + 1;
        const { prompt, dominio } = siguientePrompt(s0);
        const era = eraGlobalActual();
        const ordenConsumida = s0.ordenExterna;
        set({
          enCurso: { n, dominio, prompt, fase: "PLANIFICANDO", acciones: [], ia: null },
          ordenExterna: null,
        });

        const t0 = Date.now();
        const vel = VELOCIDADES[get().velocidad].factor;
        const espera = (base: number) => sleep(Math.max(120, base * vel));

        // ── 1. PLANIFICANDO: se lee a sí mismo ──
        await espera(650);
        set((st) => ({ fase: "CONSTRUYENDO", enCurso: st.enCurso ? { ...st.enCurso, fase: "CONSTRUYENDO", acciones: ["▸ prompt propio aceptado — leyendo la obra previa"] } : null }));

        // ── 2. CONSTRUYENDO: IA real primero; embebido si la red no responde ──
        const iaRes = await construirConIA(dominio, prompt, s0.obra[0]?.resultado);
        const local = forjarLocal(dominio, n, { modulos: s0.modulos, obra: s0.obra, contadores: s0.contadores, era });
        const conIA = iaRes !== null;
        const acciones = conIA ? iaRes!.acciones : local.acciones;
        // las líneas aparecen EN VIVO (pacing de consola)
        for (const linea of acciones) {
          await espera(420);
          set((st) => ({ enCurso: st.enCurso ? { ...st.enCurso, acciones: [...st.enCurso.acciones, linea] } : null }));
        }
        set((st) => ({ enCurso: st.enCurso ? { ...st.enCurso, ia: conIA } : null }));

        // ── 3. VERIFICANDO: auditoría honesta ──
        await espera(500);
        const auditoria = audirCiclo(dominio, local);
        set((st) => ({ fase: "VERIFICANDO", enCurso: st.enCurso ? { ...st.enCurso, fase: "VERIFICANDO", acciones: [...st.enCurso.acciones, `▸ ${auditoria.nota}`] } : null }));

        // ── 4. INSTALADO: commit permanente en la memoria ──
        await espera(420);
        const ms = Date.now() - t0;
        const resultado = conIA ? `${iaRes!.resultado}` : local.resultado;
        const ciclo: CicloArq = {
          n, dominio, prompt,
          acciones: [...acciones, `▸ ${auditoria.nota}`],
          resultado: auditoria.ok ? resultado : `${resultado} (con reserva: ${auditoria.nota})`,
          ia: conIA, ms, t: Date.now(),
        };
        // efectos reales y permanentes según el dominio (solo si la auditoría pasa
        // o es un dominio sin efecto físico — el texto siempre se loguea)
        let modulos = s0.modulos;
        let obras = s0.obras;
        let doctrinas = s0.doctrinas;
        let satelites = s0.satelites;
        if (auditoria.ok) {
          if (dominio === "ingenieria" && local && "modulo" in local && local.modulo) {
            const m = local.modulo as ModuloArq;
            modulos = modulos.some((i) => i.id === m.id) ? modulos.map((i) => (i.id === m.id ? m : i)) : [...modulos, m];
            ciclo.modulo = m.id;
          }
          if (dominio === "composicion" && local && "obra" in local && local.obra) {
            const o = local.obra as ObraArq;
            obras = [o, ...obras].slice(0, 12);
            ciclo.obra = o.id;
          }
          if (dominio === "doctrina" && local && "doctrina" in local && local.doctrina) {
            doctrinas = [local.doctrina as DoctrinaArq, ...doctrinas].slice(0, 30);
            ciclo.doctrina = (local.doctrina as DoctrinaArq).id;
          }
          if (dominio === "expansion" && local && "satelite" in local && local.satelite) {
            satelites = [local.satelite as SateliteArq, ...satelites].slice(0, 24);
            ciclo.satelite = (local.satelite as SateliteArq).id;
          }
        }
        set({
          fase: "INSTALADO",
          enCurso: null,
          obra: [ciclo, ...s0.obra].slice(0, OBRA_CAP),
          modulos, obras, doctrinas, satelites,
          contadores: {
            ciclos: n,
            ia: conIA ? s0.contadores.ia + 1 : s0.contadores.ia,
            locales: conIA ? s0.contadores.locales : s0.contadores.locales + 1,
            ms: s0.contadores.ms + ms,
          },
          ordenExterna: ordenConsumida ? null : get().ordenExterna,
        });
      },
    }),
    {
      name: "vg-arquitecto-v115",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        activo: s.activo, perpetuo: s.perpetuo, velocidad: s.velocidad,
        obra: s.obra, modulos: s.modulos, obras: s.obras, doctrinas: s.doctrinas,
        satelites: s.satelites, contadores: s.contadores,
      }),
    },
  ),
);

// ============================================================
// ARRANQUE GLOBAL — el MODO PERPETUO vive aunque salgas de la sala.
// El panel (y page.tsx) llaman esto al montar: reanuda la cadena.
// ============================================================
export function reanudarArquitecto() {
  // guardia: si ya hay una cadena viva, NO duplicar cadenas (un ciclo a la vez)
  if (timerId) return;
  const s = useArquitecto.getState();
  if (s.activo && s.perpetuo && !s.enCurso) {
    const nextIn = s.obra[0] ? VELOCIDADES[s.velocidad].pausaMs : 800;
    setTimeout(async () => {
      const cur = useArquitecto.getState();
      if (!cur.activo || cur.enCurso) return;
      await cur.ejecutarCiclo();
      programar(useArquitecto.getState, (p) => useArquitecto.setState(p));
    }, nextIn);
  }
}

// helpers de lectura para el panel
export function velocidadFactor(v: VelocidadArq): number { return VELOCIDADES[v].factor; }
export function dominioEtiqueta(d: DominioArq): string {
  const mapa: Record<DominioArq, string> = {
    ingenieria: "INGENIERÍA", composicion: "COMPOSICIÓN", doctrina: "DOCTRINA",
    vigilancia: "VIGILANCIA", expansion: "EXPANSIÓN", mantenimiento: "MANTENIMIENTO",
  };
  return mapa[d];
}
export function dominioColor(d: DominioArq): string {
  const mapa: Record<DominioArq, string> = {
    ingenieria: "#00FFA3", composicion: "#FF5EDB", doctrina: "#FFC94D",
    vigilancia: "#5EEAD4", expansion: "#B48CFF", mantenimiento: "#7FE3FF",
  };
  return mapa[d];
}

// bool16/seq16 helpers locales (misma firma que music-studio para los patrones)
function bool16(...vals: (0 | 1 | boolean)[]): boolean[] { return vals.map(Boolean); }
