// v103.0 MODO AGENTE — EL CEREBRO DEL AGENTE QUE CREA DENTRO DE VANGUARD.
// El comandante pidió: "mejora la mente, o sea la IA, super potente y que sea
// como un modo agente que cree dentro de Vanguard".
// Este núcleo es DETERMINISTA (misma semilla → misma creación, para todos los
// operadores del mundo) y bebe SOLO de datos reales del juego:
//   · LAS 4 CRISIS DEL ESPEJO y sus 8 PERTURBACIONES (whatif.ts)
//   · EL FRENTE DEL KARSK que se mueve cada noche (frente-zonas-data.ts)
//   · LOS 23 EXPEDIENTES REALES DESCLASIFICADOS (CIA/FBI/NARA/NSArchive/BlackVault)
//   · EL NÚCLEO NEURONAL v4 (neurona-core.ts: evaluarNeuronal + predecir)
//   · EL PULSO ACTUAL DE LA MENTE (mente-data.ts)
// Misiones: quiz · ordena · vof · escenario · informe
// REGLA DE LA CASA: todo lo que crea está auditado (validarJuego / reglas UGC)
// y todo lo que publica lleva firma — del operador con pasaporte o de
// MENTE·VANGUARD, la cuenta oficial del agente. Nada anónimo.

import {
  LAB_ESCENARIOS, PERTURBACIONES, escenarioPorId,
  type ConfigLab, type PerturbacionId,
} from "./whatif";
// v103.0: los DATOS vienen del módulo PURO (sin "use client") — desde una ruta
// API, los export de un módulo "use client" llegan como stubs, no como valores.
import { EXPEDIENTES, type Expediente } from "./expedientes-datos";
import { areaOcupada } from "./frente-zonas-data";
import {
  evaluarNeuronal, predecir, fnvHash, mulberry32, bucketMinutos,
} from "./neurona-core";
import { pensamientoMente, titularPulso, pulsoActual } from "./mente-data";
import type { JuegoDef } from "./juegos";

// ============================================================
// TIPOS
// ============================================================

export type MisionAgente = "quiz" | "ordena" | "vof" | "escenario" | "informe";

export interface MisionMeta {
  id: MisionAgente;
  nombre: string;
  producto: string;      // qué crea
  desc: string;
  icono: "quiz" | "ordena" | "vof" | "escenario" | "informe";
  color: string;         // hex de identidad de la misión
  pasos: number;         // pasos del protocolo (para la consola)
  recompensa: string;    // texto honesto de recompensa si se firma
}

export const MISIONES: MisionMeta[] = [
  {
    id: "quiz", nombre: "QUIZ DEL MUNDO", producto: "un juego de preguntas",
    desc: "El agente investiga el frente, las crisis del Espejo y los expedientes desclasificados, y redacta un quiz con opciones.",
    icono: "quiz", color: "#FFC94D", pasos: 6, recompensa: "+50ⓒ +25XP al firmar",
  },
  {
    id: "ordena", nombre: "ORDENA LA HISTORIA", producto: "un juego de cronología",
    desc: "Elige una cadena de hechos reales desclasificados y los revuelve: tú los pones en orden cronológico.",
    icono: "ordena", color: "#7FE3FF", pasos: 6, recompensa: "+50ⓒ +25XP al firmar",
  },
  {
    id: "vof", nombre: "VERDAD O MENTIRA", producto: "un juego de afirmaciones",
    desc: "Mezcla verdades verificables del archivo con mentiras plausibles que ella misma inventa (y las marca).",
    icono: "vof", color: "#B48CFF", pasos: 6, recompensa: "+50ⓒ +25XP al firmar",
  },
  {
    id: "escenario", nombre: "ESCENARIO ¿Y SI...?", producto: "un escenario compartible",
    desc: "Elige una crisis del Espejo, aplica UNA perturbación con su dosis, corre la simulación real y la publica en la Galería del Destino.",
    icono: "escenario", color: "#38BDF8", pasos: 7, recompensa: "+35ⓒ al firmar",
  },
  {
    id: "informe", nombre: "INFORME NEURONAL", producto: "un brief de inteligencia",
    desc: "Lee el pulso actual de LA MENTE, lo pasa por el núcleo neuronal v4 y firma un brief con riesgo, actores y recomendación.",
    icono: "informe", color: "#BEF264", pasos: 5, recompensa: "+8XP al supervisar",
  },
];

export interface PasoAgente {
  n: number;
  fase: string;      // INVESTIGANDO / ANALIZANDO / REDACTANDO / AUDITANDO / LISTO
  linea: string;     // línea de log para la consola
  ms: number;        // pacing sugerido en pantalla
}

export interface CreacionJuego {
  tipo: "juego";
  motor: "quiz" | "ordena" | "vof";
  def: JuegoDef;
  titulo: string;
  resumen: string;
  fuente: string;    // de dónde salió cada dato (transparencia total)
}

export interface CreacionEscenario {
  tipo: "escenario";
  cfg: ConfigLab;
  titulo: string;
  resumen: string;
  fuente: string;
  // resultados de la simulación real ya corrida (para la tarjeta)
  fin: string;
  ganador: "A" | "B" | "T" | "N" | "P";
  diaFin: number;
  frenteFinal: number;
  bajasTotales: number;
  escaladaMax: number;
  mcTop: { nombre: string; probabilidad: number }[];
}

export interface CreacionInforme {
  tipo: "informe";
  titulo: string;
  resumen: string;
  cuerpo: string;
  fuente: string;
  riesgo: number;
  tension: number;
  confianza: number;
  sentimiento: string;
  actores: string[];
  probEscenarios: { nombre: string; probabilidad: number; señal: string }[];
  pasos: string[];
}

export type Creacion = CreacionJuego | CreacionEscenario | CreacionInforme;

export interface ResultadoMision {
  mision: MisionAgente;
  semilla: string;
  creacion: Creacion;
  protocolo: PasoAgente[];
  auditada: boolean;
  notaAuditoria: string;
}

// ============================================================
// UTILIDADES DETERMINISTAS
// ============================================================

/** clave del día UTC — el agente crea lo mismo para todo el planeta cada día */
export function claveDia(base = Date.now()): string {
  const d = new Date(base);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

/** semilla de una misión: día + misión + variante (misma para todos) */
export function semillaDe(mision: MisionAgente, variante = 0, base = Date.now()): string {
  return `${claveDia(base)}|${mision}|${variante}`;
}

function rngDe(semilla: string): () => number {
  return mulberry32(fnvHash(semilla));
}

function elegir<T>(arr: readonly T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

function barajar<T>(arr: T[], rng: () => number): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** extrae el primer año de un rango tipo "1978–1995" */
function añoInicio(year: string): number {
  const m = year.match(/\d{4}/);
  return m ? parseInt(m[0], 10) : 1950;
}

// ============================================================
// BANCO DE INVESTIGACIÓN — lo que el agente LEE antes de crear
// ============================================================

function hallazgosDe(semilla: string): string[] {
  const rng = rngDe(semilla);
  const frente = Math.round(areaOcupada(13));
  const esc = elegir(LAB_ESCENARIOS, rng);
  const exp = elegir(EXPEDIENTES, rng);
  const p = elegir(PERTURBACIONES, rng);
  return [
    `frente del Karsk: ${frente} km² bajo control del agresor (cierre nocturno)`,
    `crisis leída: ${esc.nombre} — tensión base ${esc.tensionBase}/100`,
    `expediente abierto: ${exp.id.toUpperCase()} (${exp.agencia}, ${exp.year})`,
    `perturbación en catálogo: ${p.nombre}`,
    `8 neuronas del núcleo en línea · pulso de 5 minutos estable`,
  ];
}

// ============================================================
// PROTOCOLO — los pasos que la consola muestra EN DIRECTO
// ============================================================

function protocoloDe(mision: MisionAgente, semilla: string): PasoAgente[] {
  const meta = MISIONES.find((m) => m.id === mision)!;
  const hallazgos = hallazgosDe(semilla);
  const pasos: PasoAgente[] = [
    { n: 1, fase: "INICIANDO", linea: `misión ${mision.toUpperCase()} aceptada — semilla ${semilla.split("|")[0]}`, ms: 700 },
    { n: 2, fase: "INVESTIGANDO", linea: `▸ ${hallazgos[0]}`, ms: 1100 },
    { n: 3, fase: "INVESTIGANDO", linea: `▸ ${hallazgos[1]}`, ms: 1000 },
    { n: 4, fase: "ANALIZANDO", linea: `▸ ${hallazgos[2]}`, ms: 1000 },
  ];
  if (meta.pasos >= 6) pasos.push({ n: 5, fase: "ANALIZANDO", linea: `▸ ${hallazgos[3]}`, ms: 900 });
  if (meta.pasos >= 7) pasos.push({ n: 6, fase: "REDACTANDO", linea: "▸ corriendo simulación real con el motor del Laboratorio…", ms: 1300 });
  pasos.push({ n: meta.pasos - 1, fase: "REDACTANDO", linea: `▸ ${hallazgos[4]}`, ms: 900 });
  pasos.push({ n: meta.pasos, fase: "AUDITANDO", linea: "▸ auditoría de acero: validación + moderador IA…", ms: 800 });
  return pasos.map((p, i) => ({ ...p, n: i + 1 }));
}

// ============================================================
// GENERADORES — una función por misión
// ============================================================

const AGENCIAS = ["CIA", "FBI", "NSARCHIVE", "NARA", "BLACKVAULT"] as const;
const AGENCIA_NOMBRE: Record<string, string> = {
  CIA: "la CIA", FBI: "el FBI", NSARCHIVE: "el National Security Archive",
  NARA: "los Archivos Nacionales", BLACKVAULT: "el Black Vault",
};

function crearQuiz(semilla: string): CreacionJuego {
  const rng = rngDe(semilla);
  const preguntas: { q: string; o: string[]; a: number }[] = [];

  // --- 2 preguntas de crisis del Espejo (mundo Vanguard · SIM) ---
  const crisis = barajar(LAB_ESCENARIOS, rng).slice(0, 2);
  for (const c of crisis) {
    const agresor = c.B.nombre;
    const otros = barajar(LAB_ESCENARIOS.filter((x) => x.id !== c.id), rng)
      .slice(0, 3)
      .map((x) => x.B.nombre);
    const opciones = barajar([agresor, ...otros], rng);
    preguntas.push({
      q: `¿Qué bando encabeza la agresión en ${c.nombre}?`,
      o: opciones,
      a: opciones.indexOf(agresor),
    });
    const claves = c.claves;
    const correcta = elegir(claves, rng);
    const distractoras = barajar(
      LAB_ESCENARIOS.filter((x) => x.id !== c.id).flatMap((x) => x.claves).filter((k) => !claves.includes(k)),
      rng
    ).slice(0, 3);
    const mezcla = barajar([correcta, ...distractoras], rng);
    preguntas.push({
      q: `¿Cuál de estas claves logísticas pertenece a ${c.nombre}?`,
      o: mezcla,
      a: mezcla.indexOf(correcta),
    });
  }

  // --- 2 preguntas de expedientes REALES desclasificados ---
  const exps = barajar(EXPEDIENTES, rng).slice(0, 2);
  for (const e of exps) {
    const agenciaCorrecta = e.agencia;
    const otras = barajar(AGENCIAS.filter((a) => a !== agenciaCorrecta), rng).slice(0, 3);
    const opciones = barajar([agenciaCorrecta, ...otras], rng);
    preguntas.push({
      q: `¿Qué archivo desclasificó "${e.titulo.slice(0, 70)}"?`,
      o: opciones,
      a: opciones.indexOf(agenciaCorrecta),
    });
  }

  // --- 1 pregunta del frente vivo ---
  const frenteKm = Math.round(areaOcupada(13));
  const correctaFrente = `${frenteKm.toLocaleString("es-ES")} km²`;
  const señuelos = [
    `${Math.round(frenteKm * 0.55).toLocaleString("es-ES")} km²`,
    `${Math.round(frenteKm * 1.8).toLocaleString("es-ES")} km²`,
    `${Math.round(frenteKm * 2.6).toLocaleString("es-ES")} km²`,
  ];
  const mezclaFrente = barajar([correctaFrente, ...señuelos], rng);
  preguntas.push({
    q: "Según el cierre nocturno, ¿cuánto territorio del Karsk controla hoy el agresor?",
    o: mezclaFrente,
    a: mezclaFrente.indexOf(correctaFrente),
  });

  // --- 1 pregunta de mecánica del juego (didáctica, honesta) ---
  preguntas.push({
    q: "En el Laboratorio del Destino, el Monte Carlo corre 24 mundos. ¿Para qué?",
    o: [
      "Para estimar probabilidades de cada final",
      "Para predecir el futuro con certeza",
      "Para elegir el final más popular",
      "Para acortar la guerra simulada",
    ],
    a: 0,
  });

  const c0 = crisis[0];
  const titulo = `QUIZ ${c0.id.toUpperCase()} ·${semilla.split("|")[0].slice(5)}`;
  return {
    tipo: "juego",
    motor: "quiz",
    def: { engine: "quiz", data: { quiz: { preguntas } } },
    titulo,
    resumen: `Quiz investigado y redactado por el AGENTE de Vanguard: crisis del Espejo, el frente vivo del Karsk y ${exps.length} expedientes reales desclasificados. Cada respuesta cita su fuente.`,
    fuente: `fuentes: Espejo (${crisis.map((c) => c.id).join(", ")}), frente-zonas-data (cierre nocturno), expedientes reales ${exps.map((e) => e.agencia).join("/")}`,
  };
}

function crearOrdena(semilla: string): CreacionJuego {
  const rng = rngDe(semilla);
  // cadena cronológica de expedientes REALES ordenados por año de inicio
  const muestra = barajar(EXPEDIENTES, rng)
    .map((e) => ({ e, y: añoInicio(e.year) }))
    .sort((a, b) => a.y - b.y);
  // tomar 5 consecutivos bien separados en el tiempo
  const idx = Math.floor(rng() * Math.max(1, muestra.length - 5));
  const cadena = muestra.slice(idx, idx + 5);
  const pasos = cadena.map(({ e }) => ({
    t: `${e.titulo.slice(0, 95)} (${e.agencia})`,
  }));
  return {
    tipo: "juego",
    motor: "ordena",
    def: { engine: "ordena", data: { ordena: { pasos } } },
    titulo: `CRONOLOGÍA CLASIFICADA ·${semilla.split("|")[0].slice(5)}`,
    resumen: `Cinco expedientes REALES desclasificados revueltos por el AGENTE: ponlos en orden cronológico. Fechas reales, archivos reales — cero invención.`,
    fuente: `fuentes: ${cadena.map((c) => `${c.e.agencia} ${c.y}`).join(" → ")}`,
  };
}

function crearVof(semilla: string): CreacionJuego {
  const rng = rngDe(semilla);
  const afirmaciones: { t: string; v: boolean }[] = [];

  // 4 verdades REALES del archivo
  const exps = barajar(EXPEDIENTES, rng).slice(0, 4);
  for (const e of exps) {
    const plantilla = Math.floor(rng() * 3);
    if (plantilla === 0) afirmaciones.push({ t: `${AGENCIA_NOMBRE[e.agencia] ?? e.agencia} desclasificó: "${e.titulo.slice(0, 90)}"`, v: true });
    else if (plantilla === 1) afirmaciones.push({ t: `El expediente ${e.id.toUpperCase()} está clasificado en su categoría ${e.cat} y es de consulta pública`, v: true });
    else afirmaciones.push({ t: `"${e.titulo.slice(0, 80)}" corresponde a la época ${e.year} y hoy puede leerse en línea`, v: true });
  }

  // 2 verdades del mundo Vanguard (marcadas como SIM)
  const esc = elegir(LAB_ESCENARIOS, rng);
  afirmaciones.push({ t: `En el mundo Vanguard, ${esc.B.nombre} encabeza la crisis "${esc.nombre}" (SIM)`, v: true });
  afirmaciones.push({ t: `El Laboratorio del Destino PREdice el futuro real con certeza absoluta`, v: false });

  // 3 mentiras plausibles inventadas por el agente (marcadas como MENTIRA)
  const falsas = [
    { t: `La CIA operó el Proyecto STARGATE junto al programa lunar Apolo como una sola misión conjunta`, v: false },
    { t: `El FBI desclasificó en 1998 un archivo sobre vida extraterrestre en el Mar de Chukchi`, v: false },
    { t: `Los Archivos Nacionales (NARA) confirman que el frente del Karsk existe y se mueve cada noche`, v: false },
  ];
  for (const f of barajar(falsas, rng).slice(0, 3)) afirmaciones.push(f);

  // total 9 (entre 5 y 10) barajadas
  const mezcla = barajar(afirmaciones, rng).slice(0, 9);
  const esc2 = esc;
  return {
    tipo: "juego",
    motor: "vof",
    def: { engine: "vof", data: { vof: { afirmaciones: mezcla } } },
    titulo: `VERDAD O MENTIRA ·${semilla.split("|")[0].slice(5)}`,
    resumen: `Nueve afirmaciones mezcladas por el AGENTE: 4 verdades del archivo desclasificado, verdades del mundo SIM (${esc2.nombre}) y mentiras plausibles que ella inventó. Nada de misterios inventados sobre hechos reales — cada mentira es de archivo o de mundo Vanguard.`,
    fuente: "fuentes: expedientes reales (CIA/FBI/NARA/NSArchive/BlackVault) + Espejo (SIM, marcado)",
  };
}

function crearEscenario(semilla: string): CreacionEscenario {
  const rng = rngDe(semilla);
  const crisis = elegir(LAB_ESCENARIOS, rng);
  const pert = elegir(PERTURBACIONES, rng);
  const dosis = 1 + Math.floor(rng() * 5); // 1-5
  const horizonte = elegir([90, 180, 240] as const, rng);
  const cfg: ConfigLab = {
    crisisId: crisis.id,
    perturbacion: pert.id as PerturbacionId,
    dosis,
    horizonte,
  };

  // la simulación REAL corre donde se pida (server en la API, client en preview)
  // aquí solo prepara la carta; el resultado llega de simular() externamente.
  return {
    tipo: "escenario",
    cfg,
    titulo: `¿Y SI ${pert.nombre.toUpperCase()} EN ${crisis.nombre.toUpperCase()}? (D${dosis})`,
    resumen: `Escenario generado por el AGENTE: crisis ${crisis.nombre} + ${pert.nombre} con dosis ${dosis}/5, horizonte ${horizonte} días.`,
    fuente: `fuentes: Espejo (${crisis.id}) + motor del Laboratorio (SIMULACIÓN · no es predicción)`,
    fin: "",
    ganador: "T",
    diaFin: 0,
    frenteFinal: 0,
    bajasTotales: 0,
    escaladaMax: 1,
    mcTop: [],
  };
}

function crearInforme(semilla: string): CreacionInforme {
  const rng = rngDe(semilla);
  const bucket = pulsoActual();
  const titular = titularPulso(bucket);
  const pensamiento = pensamientoMente(bucket);
  // el titular del pulso (con su riesgo) + el pensamiento de LA MENTE: la lectura
  const texto = `${titular ? `${titular.titulo} ${titular.lugar ?? ""}` : ""} ${pensamiento}`.slice(0, 600);
  const v = evaluarNeuronal(texto);
  const proyeccion = predecir(texto, bucket);

  const crisis = elegir(LAB_ESCENARIOS, rng);
  const exp = elegir(EXPEDIENTES, rng);
  const frenteKm = Math.round(areaOcupada(13));

  const actores = [crisis.A.nombre, crisis.B.nombre];
  const cuerpo = [
    // v207.0 INFINITO: la voz lee el pulso completo (era 220, hoy sin corte práctico)
    `PULSO LEÍDO — "${texto.slice(0, 480)}"`,
    ``,
    `LECTURA NEURONAL (núcleo v4, 8 neuronas):`,
    `· riesgo ${v.riesgo}/100 · tensión ${v.tension}/100 · confianza ${v.confianza}/100`,
    `· sentimiento: ${v.sentimiento} — neuronas activas: ${v.neuronasActivas.length > 0 ? v.neuronasActivas.join(", ") : "sin señales fuertes"}`,
    ``,
    `PROYECCIÓN ${proyeccion.horizonte.toUpperCase()}:`,
    ...proyeccion.escenarios.slice(0, 3).map((e) => `· ${e.nombre} ${e.probabilidad}% — señal: ${e.señal}`),
    ``,
    `CONTEXTO DEL FRENTE: el Karsk amanece con ${frenteKm.toLocaleString("es-ES")} km² bajo control del agresor; la crisis que más pesa hoy en el Espejo es ${crisis.nombre} (tensión base ${crisis.tensionBase}/100).`,
    ``,
    `ARCHIVO QUE APOYA LA LECTURA: ${exp.titulo} (${exp.agencia}, ${exp.year}) — ${exp.desc.slice(0, 160)}…`,
    ``,
    `RECOMENDACIÓN DEL AGENTE: ${
      v.sentimiento === "ESCALADA" ? "vigilar los tres ejes del frente y preparar sala de crisis; el umbral se acerca."
      : v.sentimiento === "TENSIÓN" ? "mantener vigilancia del corredor logístico y revisar el Espejo cada 5 minutos."
      : "aprofitar la tregua: abrir expedientes del archivo y entrenar en el Laboratorio."
    }`,
    ``,
    `— firmado por el AGENTE DE VANGUARD · semilla ${semilla} · SIMULACIÓN · NO ES PREDICCIÓN`,
  ].join("\n");

  return {
    tipo: "informe",
    titulo: `INFORME NEURONAL ·${semilla.split("|")[0]} · riesgo ${v.riesgo}`,
    resumen: `Brief firmado por el AGENTE: lectura del pulso con el núcleo v4, proyección ${proyeccion.horizonte} y una recomendación operativa.`,
    cuerpo,
    fuente: "fuentes: mente-data (pulso), neurona-core v4, frente-zonas-data, expedientes reales",
    riesgo: v.riesgo,
    tension: v.tension,
    confianza: v.confianza,
    sentimiento: v.sentimiento,
    actores,
    probEscenarios: proyeccion.escenarios.slice(0, 3),
    pasos: proyeccion.pasos,
  };
}

// ============================================================
// ORQUESTADOR — ejecuta una misión completa (sin publicar)
// ============================================================

export function crearCreacion(mision: MisionAgente, semilla: string): Creacion {
  switch (mision) {
    case "quiz": return crearQuiz(semilla);
    case "ordena": return crearOrdena(semilla);
    case "vof": return crearVof(semilla);
    case "escenario": return crearEscenario(semilla);
    case "informe": return crearInforme(semilla);
  }
}

/** AUDITORÍA local (el servidor repite la suya): sanity + límites */
export function auditar(c: Creacion): { ok: boolean; nota: string } {
  if (c.tipo === "juego") {
    const d = c.def;
    if (d.engine === "quiz") {
      const n = d.data.quiz?.preguntas.length ?? 0;
      if (n < 4 || n > 12) return { ok: false, nota: `quiz con ${n} preguntas fuera de rango 4-12` };
      if (d.data.quiz!.preguntas.some((p) => p.o.length < 2 || p.a < 0 || p.a >= p.o.length)) return { ok: false, nota: "pregunta con opciones inválidas" };
    }
    if (d.engine === "ordena") {
      const n = d.data.ordena?.pasos.length ?? 0;
      if (n < 4 || n > 8) return { ok: false, nota: `ordena con ${n} pasos fuera de rango 4-8` };
    }
    if (d.engine === "vof") {
      const n = d.data.vof?.afirmaciones.length ?? 0;
      if (n < 5 || n > 10) return { ok: false, nota: `vof con ${n} afirmaciones fuera de rango 5-10` };
      const verdades = d.data.vof!.afirmaciones.filter((a) => a.v).length;
      if (verdades < 2) return { ok: false, nota: "vof sin verdades suficientes" };
    }
    return { ok: true, nota: "juego validado contra las reglas del Taller" };
  }
  if (c.tipo === "escenario") {
    const validos = ["karsk", "vand", "zenit", "sarn"];
    if (!validos.includes(c.cfg.crisisId)) return { ok: false, nota: "crisis desconocida" };
    if (c.cfg.dosis < 1 || c.cfg.dosis > 5) return { ok: false, nota: "dosis fuera de rango 1-5" };
    if (![90, 180, 240].includes(c.cfg.horizonte)) return { ok: false, nota: "horizonte inválido" };
    return { ok: true, nota: "escenario listo para la Galería del Destino (SIMULACIÓN · no predicción)" };
  }
  if (c.cuerpo.length < 120) return { ok: false, nota: "informe demasiado corto" };
  return { ok: true, nota: "informe firmado con fuentes citadas" };
}

/** Misión completa: protocolo + creación + auditoría */
export function ejecutarMision(mision: MisionAgente, semilla: string): ResultadoMision {
  const creacion = crearCreacion(mision, semilla);
  const auditoria = auditar(creacion);
  return {
    mision,
    semilla,
    creacion,
    protocolo: protocoloDe(mision, semilla),
    auditada: auditoria.ok,
    notaAuditoria: auditoria.nota,
  };
}

/** Las 3 misiones del día (deterministas por UTC) — para AGENTE EN VIVO */
export function misionesDelDia(base = Date.now()): { mision: MisionAgente; semilla: string }[] {
  const dia = claveDia(base);
  const rng = rngDe(`${dia}|agenda`);
  const tipos: MisionAgente[] = ["quiz", "ordena", "vof", "escenario", "informe"];
  const barajadas = barajar(tipos, rng);
  return barajadas.slice(0, 3).map((m) => ({ mision: m, semilla: semillaDe(m, 0, base) }));
}

/** la crisis de un escenario, resuelta para títulos/carteles */
export function crisisDe(cfg: ConfigLab) {
  return escenarioPorId(cfg.crisisId);
}
