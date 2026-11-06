"use client";

// ============================================================
// v359.0 VANGUARD ID — LA FIRMA VIVA
// El motor PURO de identidad de la casa: nada se inventa, todo se
// DERIVA del estado real que ya vive en Vanguard (game-store +
// profile-store). Este archivo no importa ninguna tienda: recibe
// los datos por parámetro (estructura, no acoplamiento).
//
//   · KNOWLEDGE LEVEL: 4 dimensiones con PESOS PUBLICADOS que suman
//     100. Cada dimensión se normaliza sobre su techo real — jamás
//     sobre la distribución de otros agentes (aquí no hay ranking
//     de personas: la comparación es el agente contra su techo).
//   · La publicación NO da puntos. La participación constructiva se
//     mide por VARIEDAD de superficies y devolución (responder,
//     votar, comentar), con techo por superficie: el hilo #50 no
//     suma más que el #5. El nivel de conocimiento no es popularidad.
//   · PRIVACIDAD: por defecto se expone lo mínimo (actividad y
//     favoritos OFF). Sin ubicación, sin datos sensibles, sin
//     correos ni teléfonos — la casa jamás los pide.
//   · ANTI-SUPLANTACIÓN: nombres reservados de roles oficiales +
//     huella de identidad estable (código corto visible en el
//     carnet, para verificación humana entre agentes de confianza).
//   · LIMITACIONES DECLARADAS: los datos son del aparato local; el
//     guardado en la nube (cuenta) cubre el save del juego, no este
//     panel; el nivel no compara agentes entre sí.
// ============================================================

// ── KNOWLEDGE LEVEL ──────────────────────────────────────────

/** Pesos publicados del índice. Suman exactamente 100 (verificado en suite). */
export const PESOS_KL = {
  EDUCACION: 35,
  CONTRIBUCION: 30,
  CONSTRUCTIVA: 20,
  RETOS: 15,
} as const;
export type ClaveDimensionKL = keyof typeof PESOS_KL;

/** Entrada REAL del motor: cada campo viene del estado vivo de la casa. */
export interface EntradaKL {
  quizCorrect: number;
  quizAnswered: number; // nº de preguntas respondidas (no ids únicos)
  readBriefings: number;
  misionesCompletadas: number;
  logrosDesbloqueados: number;
  respuestasForo: number; // respuestas escritas en hilos
  votosEncuestas: number; // encuestas votadas
  comentariosDados: number; // comentarios escritos (video/noticia/foro)
  likesDados: number; // likes/reacciones otorgadas
  hilosPropios: number;
  semanasDesafio: number; // desafioHistorial.length (semanas WORLD CHALLENGE)
  wargamesGanadas: number;
  retosDiariosClaimed: number; // dailyChallengeClaimed.length
  mpVictorias: number;
}

/** Techos reales por sub-métrica — públicos y auditables. */
export const TECHOS_KL = {
  readBriefings: 80,
  misionesCompletadas: 30,
  logrosDesbloqueados: 25,
  respuestasForo: 8,
  votosEncuestas: 8,
  comentariosDados: 8,
  likesDados: 10,
  hilosPropios: 4,
  semanasDesafio: 8,
  wargamesGanadas: 12,
  retosDiariosClaimed: 20,
  mpVictorias: 10,
} as const;

/** Precisión de quiz exigida para puntuar con confianza (mín. de respuestas). */
export const QUIZ_MIN_CONFIANZA = 10;

const cap = (v: number, techo: number) => Math.max(0, Math.min(1, v / techo)) * 100;

/** Una dimensión 0–100 con su desglose honesto. */
export interface DimensionKL {
  clave: ClaveDimensionKL;
  nombre: string;
  valor: number; // 0–100
  peso: number; // PESOS_KL
  desglose: { etiqueta: string; valor: number; techo: number }[];
}

export function dimensionKL(entrada: EntradaKL, clave: ClaveDimensionKL): DimensionKL {
  const nombreDim: Record<ClaveDimensionKL, string> = {
    EDUCACION: "Educación",
    CONTRIBUCION: "Contribución",
    CONSTRUCTIVA: "Participación constructiva",
    RETOS: "Retos completados",
  };
  if (clave === "EDUCACION") {
    const accuracy =
      entrada.quizAnswered >= QUIZ_MIN_CONFIANZA
        ? (entrada.quizCorrect / entrada.quizAnswered) * 100
        : (entrada.quizCorrect / QUIZ_MIN_CONFIANZA) * 100; // sin muestra suficiente, escala honesta
    const lectura = cap(entrada.readBriefings, TECHOS_KL.readBriefings);
    return {
      clave, nombre: nombreDim[clave], peso: PESOS_KL.EDUCACION,
      valor: 0.6 * accuracy + 0.4 * lectura,
      desglose: [
        { etiqueta: "Precisión de quiz", valor: Math.round(accuracy), techo: 100 },
        { etiqueta: "Briefings leídos", valor: Math.round(lectura), techo: 100 },
      ],
    };
  }
  if (clave === "CONTRIBUCION") {
    const misiones = cap(entrada.misionesCompletadas, TECHOS_KL.misionesCompletadas);
    const logros = cap(entrada.logrosDesbloqueados, TECHOS_KL.logrosDesbloqueados);
    return {
      clave, nombre: nombreDim[clave], peso: PESOS_KL.CONTRIBUCION,
      valor: 0.6 * misiones + 0.4 * logros,
      desglose: [
        { etiqueta: "Misiones completadas", valor: Math.round(misiones), techo: 100 },
        { etiqueta: "Logros desbloqueados", valor: Math.round(logros), techo: 100 },
      ],
    };
  }
  if (clave === "CONSTRUCTIVA") {
    // VARIEDAD con techo por superficie: el volumen no infla más allá del techo.
    const partes = [
      cap(entrada.respuestasForo, TECHOS_KL.respuestasForo),
      cap(entrada.votosEncuestas, TECHOS_KL.votosEncuestas),
      cap(entrada.comentariosDados, TECHOS_KL.comentariosDados),
      cap(entrada.likesDados, TECHOS_KL.likesDados),
      cap(entrada.hilosPropios, TECHOS_KL.hilosPropios),
    ];
    const valor = partes.reduce((a, b) => a + b, 0) / partes.length;
    return {
      clave, nombre: nombreDim[clave], peso: PESOS_KL.CONSTRUCTIVA,
      valor,
      desglose: [
        { etiqueta: "Respuestas en foros", valor: Math.round(partes[0]), techo: 100 },
        { etiqueta: "Encuestas votadas", valor: Math.round(partes[1]), techo: 100 },
        { etiqueta: "Comentarios dados", valor: Math.round(partes[2]), techo: 100 },
        { etiqueta: "Reacciones otorgadas", valor: Math.round(partes[3]), techo: 100 },
        { etiqueta: "Hilos abiertos", valor: Math.round(partes[4]), techo: 100 },
      ],
    };
  }
  // RETOS
  const semanas = cap(entrada.semanasDesafio, TECHOS_KL.semanasDesafio);
  const guerra = cap(entrada.wargamesGanadas, TECHOS_KL.wargamesGanadas);
  const diarios = cap(entrada.retosDiariosClaimed, TECHOS_KL.retosDiariosClaimed);
  const mp = cap(entrada.mpVictorias, TECHOS_KL.mpVictorias);
  return {
    clave: "RETOS", nombre: nombreDim.RETOS, peso: PESOS_KL.RETOS,
    valor: 0.35 * semanas + 0.3 * guerra + 0.2 * diarios + 0.15 * mp,
    desglose: [
      { etiqueta: "Semanas WORLD CHALLENGE", valor: Math.round(semanas), techo: 100 },
      { etiqueta: "Wargames ganadas", valor: Math.round(guerra), techo: 100 },
      { etiqueta: "Retos diarios reclamados", valor: Math.round(diarios), techo: 100 },
      { etiqueta: "Victorias multijugador", valor: Math.round(mp), techo: 100 },
    ],
  };
}

/** Nombres del escalafón KNOWLEDGE LEVEL (conocimiento, no popularidad). */
export const NIVELES_KL: { nivel: number; min: number; nombre: string }[] = [
  { nivel: 1, min: 0, nombre: "APRENDIZ" },
  { nivel: 2, min: 10, nombre: "LECTOR" },
  { nivel: 3, min: 20, nombre: "OBSERVADOR" },
  { nivel: 4, min: 30, nombre: "DOCUMENTALISTA" },
  { nivel: 5, min: 40, nombre: "VERIFICADOR" },
  { nivel: 6, min: 50, nombre: "ANALISTA" },
  { nivel: 7, min: 60, nombre: "CORRESPONSAL" },
  { nivel: 8, min: 70, nombre: "ESTRATEGA" },
  { nivel: 9, min: 80, nombre: "CONSEJERO" },
  { nivel: 10, min: 90, nombre: "SABIO DEL NÚCLEO" },
];

export interface ResultadoKL {
  puntaje: number; // 0–100
  nivel: number;
  nombreNivel: string;
  minSiguiente: number | null; // umbral del siguiente nivel (null = tope)
  dimensiones: DimensionKL[];
}

/** El veredicto completo: 4 dimensiones ponderadas con pesos publicados. */
export function conocimientoLevel(entrada: EntradaKL): ResultadoKL {
  const claves: ClaveDimensionKL[] = ["EDUCACION", "CONTRIBUCION", "CONSTRUCTIVA", "RETOS"];
  const dimensiones = claves.map((c) => dimensionKL(entrada, c));
  const puntaje = dimensiones.reduce((a, d) => a + (d.valor * d.peso) / 100, 0);
  let actual = NIVELES_KL[0];
  for (const n of NIVELES_KL) if (puntaje >= n.min) actual = n;
  const siguiente = NIVELES_KL.find((n) => n.min > puntaje) ?? null;
  return {
    puntaje,
    nivel: actual.nivel,
    nombreNivel: actual.nombre,
    minSiguiente: siguiente ? siguiente.min : null,
    dimensiones,
  };
}

// ── INSIGNIAS DERIVADAS (todas de estado real) ───────────────

export interface InsigniaId {
  id: string;
  nombre: string;
  descripcion: string;
  conseguido: boolean;
  progreso: number; // 0–1
  detalle: string; // el número REAL que la sostiene
}

export interface EntradaInsignias {
  streak: number;
  quizCorrect: number;
  readBriefings: number;
  misionesCompletadas: number;
  votosEncuestas: number;
  respuestasForo: number;
  semanasDesafio: number;
  wargamesGanadas: number;
  mpVictorias: number;
  operacionesMercado: number;
  avataresPoseidos: number;
  camarasColocadas: number;
  bioEditada: boolean;
}

export function insigniasDe(e: EntradaInsignias): InsigniaId[] {
  const def: (Omit<InsigniaId, "conseguido" | "progreso"> & {
    valor: number; techo: number;
  })[] = [
    { id: "fuego", nombre: "RACHA DE FUEGO", descripcion: "Entrar 7 días seguidos", valor: e.streak, techo: 7, detalle: `${e.streak}/7 días de racha` },
    { id: "mente", nombre: "MENTE AGUDA", descripcion: "10 respuestas correctas de quiz", valor: e.quizCorrect, techo: 10, detalle: `${e.quizCorrect}/10 correctas` },
    { id: "archivista", nombre: "ARCHIVISTA", descripcion: "Leer 20 briefings del archivo", valor: e.readBriefings, techo: 20, detalle: `${e.readBriefings}/20 briefings` },
    { id: "mision", nombre: "MISIÓN CUMPLIDA", descripcion: "Completar 5 misiones", valor: e.misionesCompletadas, techo: 5, detalle: `${e.misionesCompletadas}/5 misiones` },
    { id: "veredicto", nombre: "VEREDICTO", descripcion: "Votar en 3 encuestas", valor: e.votosEncuestas, techo: 3, detalle: `${e.votosEncuestas}/3 encuestas` },
    { id: "voz", nombre: "VOZ CONSTRUCTIVA", descripcion: "Responder 3 hilos del foro", valor: e.respuestasForo, techo: 3, detalle: `${e.respuestasForo}/3 respuestas` },
    { id: "campeon", nombre: "CAMPEÓN DE SEMANA", descripcion: "Completar una semana del WORLD CHALLENGE", valor: e.semanasDesafio, techo: 1, detalle: `${e.semanasDesafio} semana(s) en el salón` },
    { id: "mesa", nombre: "GENERAL DE LA MESA", descripcion: "Ganar 5 wargames", valor: e.wargamesGanadas, techo: 5, detalle: `${e.wargamesGanadas}/5 victorias` },
    { id: "mano", nombre: "MANO FIRME", descripcion: "Ganar 3 duelos multijugador", valor: e.mpVictorias, techo: 3, detalle: `${e.mpVictorias}/3 victorias MP` },
    { id: "mercader", nombre: "MERCADER", descripcion: "Operar 5 veces en la bolsa", valor: e.operacionesMercado, techo: 5, detalle: `${e.operacionesMercado}/5 operaciones` },
    { id: "coleccio", nombre: "COLECCIONISTA", descripcion: "Poseer 5 avatares", valor: e.avataresPoseidos, techo: 5, detalle: `${e.avataresPoseidos}/5 avatares` },
    { id: "centinela", nombre: "CENTINELA", descripcion: "Colocar una cámara de vigilancia", valor: e.camarasColocadas, techo: 1, detalle: `${e.camarasColocadas}/1 cámara` },
    { id: "firma", nombre: "FIRMA VIVA", descripcion: "Escribir tu propia bio", valor: e.bioEditada ? 1 : 0, techo: 1, detalle: e.bioEditada ? "bio firmada" : "bio por defecto" },
  ];
  return def.map((d) => ({
    id: d.id, nombre: d.nombre, descripcion: d.descripcion, detalle: d.detalle,
    conseguido: d.valor >= d.techo,
    progreso: Math.max(0, Math.min(1, d.valor / d.techo)),
  }));
}

// ── PRIVACIDAD ───────────────────────────────────────────────

export type VisibilidadId = "PUBLICO" | "COMUNIDAD" | "PRIVADO";

export interface PrivacidadId {
  visibilidad: VisibilidadId;
  mostrarNivel: boolean;
  mostrarStats: boolean;
  mostrarActividad: boolean;
  mostrarBio: boolean;
  mostrarFaccion: boolean;
  mostrarFavoritos: boolean;
}

/** Mínima exposición por defecto: actividad y favoritos OFF. */
export const PRIVACIDAD_DEFECTO: PrivacidadId = {
  visibilidad: "COMUNIDAD",
  mostrarNivel: true,
  mostrarStats: true,
  mostrarActividad: false,
  mostrarBio: true,
  mostrarFaccion: true,
  mostrarFavoritos: false,
};

export const ETIQUETAS_PRIVACIDAD: Record<VisibilidadId, string> = {
  PUBLICO: "Público — el carnet completo viaja en el enlace compartido",
  COMUNIDAD: "Comunidad — agentes de Vanguard, sin compartir fuera",
  PRIVADO: "Privado — el carnet solo vive en tu aparato",
};

// ── NOTIFICACIONES (categorías reales de la casa) ────────────

export const CATEGORIAS_NOTIF_ID = ["misiones", "logros", "comunidad", "contribuciones", "sistema"] as const;
export type ClaveNotifId = (typeof CATEGORIAS_NOTIF_ID)[number];
export type PrefsNotifId = Record<ClaveNotifId, boolean>;

export const NOTIF_DEFECTO: PrefsNotifId = {
  misiones: true,
  logros: true,
  comunidad: true,
  contribuciones: true,
  sistema: true,
};

export const DESCRIPCION_NOTIF_ID: Record<ClaveNotifId, string> = {
  misiones: "Misiones, recompensas y racha diaria",
  logros: "Logros desbloqueados y reclamables",
  comunidad: "Foros, encuestas y respuestas a tus hilos",
  contribuciones: "Revisión de tus contribuciones y verificaciones",
  sistema: "Canon, versiones y puertas de la casa",
};

// ── ANTI-SUPLANTACIÓN ────────────────────────────────────────

/** Roles oficiales de la casa: nadie puede firmarlos como alias propio. */
export const NOMBRES_RESERVADOS = [
  "dueno", "dueño", "owner", "admin", "administrador", "vanguard",
  "moderador", "moderacion", "moderación", "nucleo", "núcleo",
  "sistema", "soporte", "staff", "root", "bot", "oficial",
  "prensa", "redaccion", "redacción", "nulo", "null", "undefined",
];

/** Normaliza para comparar: minúsculas, sin acentos, sin espacios extremos. */
export function normalizarAlias(a: string): string {
  return a.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export interface VeredictoAlias {
  ok: boolean;
  motivo?: string;
}

/** Valida un alias nuevo: forma + reservados. La historia del alias queda en la tienda. */
export function aliasValido(alias: string): VeredictoAlias {
  const a = alias.trim();
  if (a.length < 3) return { ok: false, motivo: "Mínimo 3 caracteres." };
  if (a.length > 20) return { ok: false, motivo: "Máximo 20 caracteres." };
  if (!/^[a-zA-Z0-9_\-·.]+$/.test(a)) return { ok: false, motivo: "Solo letras, números, guion, punto, · y _ ." };
  const n = normalizarAlias(a);
  if (NOMBRES_RESERVADOS.includes(n)) return { ok: false, motivo: "Ese nombre pertenece a un rol oficial de la casa — no puede firmarse." };
  return { ok: true };
}

// ── HUELLA DE IDENTIDAD ──────────────────────────────────────

/** FNV-1a 32 bit — determinista, sin dependencias. */
function fnv1a(texto: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Huella corta estable a partir de una semilla aleatoria de una sola vida. */
export function huellaDe(semilla: string): string {
  const h1 = fnv1a(semilla);
  const h2 = fnv1a(semilla + "\u241fvg");
  const bloque = (n: number) => n.toString(36).toUpperCase().padStart(6, "0").slice(0, 4);
  return `${bloque(h1)}-${bloque(h2)}`;
}

/** Semilla criptográfica local (el navegador del agente firma su carnet). */
export function nuevaSemillaHuella(): string {
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    const buf = new Uint8Array(12);
    crypto.getRandomValues(buf);
    return Array.from(buf, (b) => b.toString(16).padStart(2, "0")).join("");
  }
  return `${Date.now()}-${Math.random()}`;
}

// ── METODOLOGÍA Y LÍMITES (los que la casa confiesa) ─────────

export const METODOLOGIA_KL: string[] = [
  "El KNOWLEDGE LEVEL es un índice de 0 a 100 con 4 dimensiones y pesos PUBLICADOS: Educación 35, Contribución 30, Participación constructiva 20, Retos completados 15. La suma de pesos es exactamente 100 y vive en el código fuente (src/lib/vanguard-id.ts) — auditable por cualquiera.",
  "Cada dimensión se normaliza sobre su TECHO real (p. ej. 80 briefings leídos = 100), nunca sobre la distribución de otros agentes. Aquí no hay ranking de personas: el agente se mide contra el techo, no contra la multitud.",
  "La publicación NO da puntos por volumen. La dimensión constructiva promedia 5 superficies con techo por superficie: responder foros, votar encuestas, comentar, reaccionar y abrir hilos. El hilo #50 no suma más que el #5 — el nivel no es popularidad.",
  "La educación exige muestra: con menos de 10 respuestas de quiz, la precisión escala linealmente hasta 10 para no premiar 1 de 1.",
];

export const LIMITACIONES_ID: string[] = [
  "Los datos de este carnet viven en TU aparato (localStorage). El guardado en la nube de la cuenta cubre el save del juego; este panel de identidad no viaja con él todavía.",
  "El índice no compara agentes entre sí ni otorga privilegios de moderación: la moderación de la casa es humana y está declarada en el Núcleo.",
  "Las insignias se derivan del estado real del juego en este aparato; si borras los datos del navegador, el historial se reinicia — la casa no lo oculta.",
  "Ningún dato sensible se pide ni se expone: sin ubicación, sin correo, sin teléfono, sin datos de pago. El carnet muestra lo que TÚ marcas como visible.",
];
