// ═══════════════════════════════════════════════════════════════════
// v421.0 · EL ORGANIZADOR — la Cámara archiva sola, y dice por qué
//
// La misión pedía «organizador automático por proyectos» y «guardado de
// investigaciones». Hasta ahora el archivo era manual: el operador tenía que
// crear un proyecto, elegirlo en un desplegable y pulsar Guardar; además toda
// investigación se guardaba con `etiquetas: []`.
//
// Este módulo hace tres cosas, todas deterministas (sin modelo, sin red):
//  ① ETIQUETAR: saca de la propia investigación —pregunta, síntesis, fuentes
//     y documentos— hasta seis etiquetas legibles: tema, lugar y tipo.
//  ② SUGERIR DESTINO: si ya hay un proyecto que comparte vocabulario con la
//     investigación, propone ese (y explica qué palabras comparten); si no,
//     propone crear uno nuevo con nombre derivado de la etiqueta principal.
//  ③ ARCHIVAR SOLO: crea el proyecto si hace falta y guarda la investigación
//     con sus etiquetas, dejando en el historial a qué proyecto fue.
//
// LÍMITE DECLARADO: es un organizador por vocabulario, no por comprensión. Si
// dos investigaciones hablan de lo mismo con palabras distintas, no las junta.
// Por eso el operador SIEMPRE puede elegir el proyecto a mano: lo automático
// es la propuesta, no el candado.
// ═══════════════════════════════════════════════════════════════════

import type { Fuente, Investigacion, Proyecto } from "./tipos";
import { normalizar, terminos } from "./texto";
import { archivarInvestigacion, crearProyecto, leerProyectos } from "./store";

// ── temas: vocabulario español + inglés (los documentos llegan en ambos) ──
const TEMAS: { etiqueta: string; palabras: string[] }[] = [
  { etiqueta: "Defensa", palabras: ["defensa", "militar", "exercito", "ejercito", "armas", "armament", "guerra", "conflicto", "otan", "nato", "misil", "tropas", "defense", "military", "war", "troops", "weapon"] },
  { etiqueta: "Tecnología", palabras: ["tecnologia", "semiconductor", "semiconductores", "chip", "chips", "litografia", "euv", "software", "digital", "algoritmo", "inteligencia", "artificial", "computacion", "technology", "semiconductor", "lithography", "computing", "transformer", "neural"] },
  { etiqueta: "Energía", palabras: ["energia", "petroleo", "gas", "nuclear", "electrico", "electrica", "renovable", "litio", "hidrogeno", "energy", "oil", "power", "renewable"] },
  { etiqueta: "Economía", palabras: ["economia", "inflacion", "comercio", "mercado", "pib", "deuda", "banca", "arancel", "presupuesto", "economy", "trade", "market", "inflation", "tariff"] },
  { etiqueta: "Política", palabras: ["elecciones", "gobierno", "parlamento", "presidente", "partido", "reforma", "diplomacia", "tratado", "election", "government", "treaty"] },
  { etiqueta: "Salud", palabras: ["salud", "sanidad", "virus", "pandemia", "vacuna", "hospital", "health", "vaccine", "disease"] },
  { etiqueta: "Clima", palabras: ["clima", "climatico", "emisiones", "sequia", "inundacion", "temperatura", "climate", "emissions", "drought"] },
  { etiqueta: "Derechos", palabras: ["derechos", "censura", "refugiados", "detencion", "libertad", "tortura", "rights", "censorship", "refugees"] },
  { etiqueta: "Ciencia", palabras: ["investigacion", "estudio", "cientifico", "fisica", "quimica", "biologia", "paper", "arxiv", "research", "physics", "study"] },
  { etiqueta: "Historia", palabras: ["historia", "historico", "archivo", "memoria", "desclasificado", "history", "archive", "declassified"] },
];

/** Palabras vacías que nunca valen como etiqueta ni como vínculo. */
const VACIAS = new Set([
  "que", "como", "cual", "cuales", "cuando", "donde", "quien", "quienes", "porque", "para",
  "sobre", "entre", "desde", "hasta", "segun", "tiene", "tienen", "hay", "son", "esta",
  "estan", "ser", "estar", "hace", "hacer", "mas", "menos", "muy", "todo", "todos", "cada",
  "the", "and", "for", "with", "from", "that", "this", "what", "which", "how", "why",
  "was", "were", "are", "has", "have", "its", "their", "about", "into", "than",
]);

function limpio(t: string): boolean {
  return !VACIAS.has(t) && t.length >= 4 && !/^\d+$/.test(t);
}

/** El texto de referencia de una investigación: pregunta + síntesis + títulos. */
function cuerpo(inv: Investigacion, documentos: { nombre: string }[] = []): string {
  return [
    inv.pregunta,
    inv.pregunta, // la pregunta pesa doble: es lo que el operador quiso saber
    inv.sintesis,
    ...inv.fuentes.slice(0, 8).map((f) => f.titulo),
    ...documentos.map((d) => d.nombre),
  ].join("\n");
}

/** ① Etiquetas: hasta 3 temas, hasta 2 lugares, y el tipo de material. */
export function etiquetar(inv: Investigacion, documentos: { nombre: string }[] = []): string[] {
  const t = new Set(terminos(cuerpo(inv, documentos), 4));
  const fuera: string[] = [];

  const temas = TEMAS.map((tema) => ({
    etiqueta: tema.etiqueta,
    n: tema.palabras.reduce((s, p) => s + (t.has(p) ? 1 : 0), 0),
  }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n)
    .slice(0, 3);
  for (const tema of temas) fuera.push(tema.etiqueta);

  // lugares: los que la propia investigación ya trajo como ficha de país, y
  // los que aparecen en el título de la pregunta (sin gazetteer aquí: esto
  // corre en el navegador y no arrastra el lector de documentos).
  const vistos = new Set<string>();
  for (const f of inv.fuentes) {
    const esPais = f.via === "pais" || f.id.startsWith("pais:");
    if (!esPais) continue;
    const nombre = f.titulo.replace(/^ficha( de)?( país)?[:\s·—-]*/i, "").split(/[·—(]/)[0].trim();
    const clave = nombre.toLowerCase();
    if (nombre && !vistos.has(clave)) {
      vistos.add(clave);
      fuera.push(nombre);
    }
    if (fuera.length >= 5) break;
  }

  if (documentos.length) fuera.push("documentos del operador");

  // sin temas ni lugares: dos palabras largas de la pregunta, en claro
  if (!fuera.length) {
    for (const termino of Array.from(t).filter(limpio).slice(0, 2)) {
      fuera.push(termino[0].toUpperCase() + termino.slice(1));
    }
  }
  return Array.from(new Set(fuera)).slice(0, 6);
}

export interface Destino {
  /** proyecto existente que encaja (null = hay que crear uno) */
  proyectoId: string | null;
  /** nombre del proyecto, exista o esté por crear */
  nombre: string;
  /** por qué ese destino, en una frase para la interfaz */
  motivo: string;
  /** palabras que comparten, si el destino es uno existente */
  comparte: string[];
  etiquetas: string[];
  crear: boolean;
}

/** ② Destino sugerido: proyecto existente por vocabulario, o uno nuevo. */
export function sugerirDestino(
  inv: Investigacion,
  proyectos: Proyecto[],
  documentos: { nombre: string }[] = []
): Destino {
  const etiquetas = etiquetar(inv, documentos);
  const propios = new Set(terminos(cuerpo(inv, documentos), 4).filter(limpio));

  let mejor: { p: Proyecto; comparte: string[] } | null = null;
  for (const p of proyectos) {
    const textoProyecto = `${p.nombre} ${p.descripcion}`;
    const suyos = terminos(textoProyecto, 4).filter(limpio);
    // se devuelve la forma CON tildes del proyecto: «litografía», no «litografia»
    const crudos = textoProyecto.split(/[^0-9A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+/).filter(Boolean);
    const forma = (t: string) => crudos.find((w) => normalizar(w) === t) ?? t;
    const comparte = Array.from(new Set(suyos.filter((x) => propios.has(x)).map(forma)));
    if (comparte.length >= 2 && (!mejor || comparte.length > mejor.comparte.length)) {
      mejor = { p, comparte };
    }
  }

  if (mejor) {
    return {
      proyectoId: mejor.p.id,
      nombre: mejor.p.nombre,
      motivo: `comparte ${mejor.comparte.slice(0, 3).map((x) => `«${x}»`).join(", ")} con este proyecto`,
      comparte: mejor.comparte.slice(0, 3),
      etiquetas,
      crear: false,
    };
  }

  const principal = etiquetas[0] ?? "General";
  return {
    proyectoId: null,
    nombre: `Investigación · ${principal}`.slice(0, 90),
    motivo: proyectos.length
      ? "ningún proyecto existente comparte vocabulario suficiente: se creará uno"
      : "primer proyecto de la casa: se creará uno",
    comparte: [],
    etiquetas,
    crear: true,
  };
}

/**
 * ③ Archivar sin preguntar: crea el proyecto si toca y guarda con etiquetas.
 * Devuelve el destino real para que la interfaz lo pueda decir en voz alta.
 */
export function archivarAuto(
  inv: Investigacion,
  documentos: { id: string; nombre: string }[] = []
): { ok: boolean; destino: Destino; error?: string } {
  const destino = sugerirDestino(inv, leerProyectos(), documentos);
  let proyectoId = destino.proyectoId;
  if (!proyectoId) {
    const creado = crearProyecto(destino.nombre, destino.etiquetas.join(" · "));
    proyectoId = creado.id;
  }
  const r = archivarInvestigacion(proyectoId, inv, documentos, "", destino.etiquetas);
  return { ok: r.ok, destino, error: r.error };
}

/** Fuentes que quedaron fuera por la poda de candidatas (para poder decirlo). */
export function describirPoda(fuentes: Fuente[], maximo = 6): string {
  if (fuentes.length <= maximo) return "";
  return `Se usaron ${maximo} de ${fuentes.length} fuentes candidatas; el resto quedó fuera por puntuación, no por falta de datos.`;
}
