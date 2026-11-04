// ============================================================
// v218.0 EL NÚCLEO — REGISTRO CENTRAL DE MÓDULOS
// El censo oficial de la casa: TODO módulo vivo de Vanguard con
// nombre, descripción, categoría, ruta, permisos, estado y
// dependencias. Si una función no está aquí, no existe para el
// Núcleo (no aparece en /nucleo ni en la búsqueda de módulos).
//
// REGLAS DEL CENSO (las verifica scripts/pruebas-nucleo.mjs):
//   · ids únicos, con prefijo mod:.
//   · cada ruta debe existir de verdad en src/app/.
//   · las dependencias (mod:… / fnt:…) deben existir.
//   · SOLO módulos reales: jamás se registra una función que no
//     vive en producción (nada de carteles).
// Para AÑADIR un módulo: src/lib/nucleo/README.md (4 pasos).
// ============================================================

/** Categorías del censo — la navegación de /nucleo las agrupa. */
export const CATEGORIAS_MODULO = [
  "REDACCION", // leer la guerra: cables, teatros, última hora
  "MUNDO", // el planeta: mapas, espía, traductor
  "SIMULACION", // vivir la guerra: juegos, misiones, objetivos
  "COMUNIDAD", // la gente: audios, cuentas, contribuciones
  "SISTEMA", // la casa: núcleo, modo, privacidad
] as const;

export type CategoriaModulo = (typeof CATEGORIAS_MODULO)[number];

/** Nivel de acceso que NECESITA usar el módulo (se juzga en el servidor). */
export const PERMISOS_MODULO = ["publico", "cuenta", "dueno"] as const;
export type PermisoModulo = (typeof PERMISOS_MODULO)[number];

/** Estado de implementación honesto. */
export const ESTADOS_MODULO = ["VIVO", "BETA", "PLAN"] as const;
export type EstadoModulo = (typeof ESTADOS_MODULO)[number];

export interface ModuloNucleo {
  id: string; // mod:<slug> — estable, jamás se recicla
  nombre: string; // EL PULSO, LA EMISORA…
  lema: string; // una línea que lo explica
  descripcion: string; // qué hace de verdad y con qué datos
  categoria: CategoriaModulo;
  ruta: string; // la puerta real (src/app/…)
  permiso: PermisoModulo; // publico | cuenta | dueno
  estado: EstadoModulo; // VIVO | BETA | PLAN
  dependencias: string[]; // mod:… y fnt:… de los que vive
  alias: string; // términos extra para la búsqueda
  /** Si el módulo ES una entidad (mapa o simulación), su id estable. */
  idEntidadComo?: string; // vg:mapa:mundo, vg:simulacion:ver-guerra…
}

export const MODULOS_NUCLEO: ModuloNucleo[] = [
  // ── REDACCIÓN ──────────────────────────────────────────────
  {
    id: "mod:envivo",
    nombre: "EL PULSO · EN VIVO",
    lema: "La redacción abierta 24 h",
    descripcion:
      "Línea del tiempo minuto a minuto con SOLO cables reales (GDELT + 18 medios), LO MÁS CALIENTE ranqueado por impacto y exactitud visible: hora, fuente y sello de credibilidad en cada pieza.",
    categoria: "REDACCION",
    ruta: "/en-vivo",
    permiso: "publico",
    estado: "VIVO",
    dependencias: ["fnt:cables", "fnt:fuentes"],
    alias: "en vivo ultima hora directo pulso breaking redaccion noticias archivo",
  },
  {
    id: "mod:vertigo",
    nombre: "EL VÉRTIGO",
    lema: "El mundo en deslizamientos",
    descripcion:
      "El feed infinito: cada cable a pantalla completa, se desliza y la siguiente pieza del planeta encaja. Doble toque para latir.",
    categoria: "REDACCION",
    ruta: "/vertigo",
    permiso: "publico",
    estado: "VIVO",
    dependencias: ["fnt:cables"],
    alias: "vertigo feed infinito tiktok deslizar scroll",
  },
  {
    id: "mod:noticia",
    nombre: "EL CABLE",
    lema: "Cada noticia, su página propia",
    descripcion:
      "Página indexable por cable con fuente, bandera, resumen, traducción y el ¿POR QUÉ IMPORTA? de la redacción. La puerta por la que Google entra al archivo.",
    categoria: "REDACCION",
    ruta: "/noticia/[id]",
    permiso: "publico",
    estado: "VIVO",
    dependencias: ["fnt:cables", "fnt:fuentes"],
    alias: "noticia cable detalle lectura articulo",
  },
  {
    id: "mod:traductor",
    nombre: "MODO TRADUCTOR",
    lema: "Las noticias del mundo en tu idioma",
    descripcion:
      "Los 8 idiomas de Vanguard en una fuente: estudio completo de traducción y las últimas noticias traducidas al vuelo desde los cables reales.",
    categoria: "REDACCION",
    ruta: "/traductor",
    permiso: "publico",
    estado: "VIVO",
    dependencias: ["fnt:cables"],
    alias: "traductor idiomas traducir ingles chino ruso frances portugues",
  },
  // ── MUNDO ──────────────────────────────────────────────────
  {
    id: "mod:guerra-hoy",
    nombre: "GUERRA HOY",
    lema: "El planeta vigilado",
    descripcion:
      "Los frentes activos del día con el Ojo de Dios: teatros, unidades, leyenda del globo y el pulso de última hora sobre el panel.",
    categoria: "MUNDO",
    ruta: "/guerra-hoy",
    permiso: "publico",
    estado: "VIVO",
    dependencias: ["fnt:cables", "fnt:teatros"],
    alias: "guerra hoy frentes ojo de dios panel mapa conflictos",
    idEntidadComo: "vg:mapa:guerra-hoy",
  },
  {
    id: "mod:mundo",
    nombre: "EL MUNDO 3D",
    lema: "El planeta girando en vivo",
    descripcion:
      "El globo entero con motor 3D: 9 teatros encendidos por cables reales de 24 h, 28 plazas del poder, 6 arcos de fricción y vuelo de cámara por selección.",
    categoria: "MUNDO",
    ruta: "/mundo",
    permiso: "publico",
    estado: "VIVO",
    dependencias: ["fnt:cables", "fnt:teatros"],
    alias: "mundo 3d globo planeta tierra guerras en vivo mapa",
    idEntidadComo: "vg:mapa:mundo",
  },
  {
    id: "mod:conflicto",
    nombre: "FICHAS DE TEATRO",
    lema: "Una página por frente de guerra",
    descripcion:
      "Ficha server-rendered por cada teatro de guerra: resumen, cables reales del frente y puertas al globo, a la sala en vivo y al espía.",
    categoria: "MUNDO",
    ruta: "/conflicto/[tag]",
    permiso: "publico",
    estado: "VIVO",
    dependencias: ["fnt:teatros", "fnt:cables"],
    alias: "conflicto teatro frente ficha ucrania gaza taiwan sahel",
  },
  {
    id: "mod:espia",
    nombre: "MODO ESPÍA",
    lema: "Lo que los gobiernos publican",
    descripcion:
      "Índice de tensión por teatro (24 h contra la media de 7 días) y escuchas oficiales RSS verificadas una a una: ONU, ReliefWeb, OMS, OPCW. SIN SEÑAL honesto cuando no hay nada.",
    categoria: "MUNDO",
    ruta: "/espia",
    permiso: "publico",
    estado: "VIVO",
    dependencias: ["fnt:escuchas", "fnt:cables", "fnt:teatros"],
    alias: "espia gobierno radar escuchas osint inteligencia onu oms opcw desarme",
  },
  // ── SIMULACIÓN ─────────────────────────────────────────────
  {
    id: "mod:ver-guerra",
    nombre: "VER GUERRA 3D",
    lema: "El frente en vivo, en volumen",
    descripcion:
      "El simulador 3D de frentes: unidades, territorios y batallas del teatro en tiempo real dentro del navegador.",
    categoria: "SIMULACION",
    ruta: "/ver-guerra",
    permiso: "publico",
    estado: "VIVO",
    dependencias: ["fnt:teatros"],
    alias: "ver guerra 3d simulador frente unidades batalla",
    idEntidadComo: "vg:simulacion:ver-guerra",
  },
  {
    id: "mod:zona-cero",
    nombre: "ZONA CERO",
    lema: "La ciudad que cae en vivo",
    descripcion:
      "El espectáculo único de Vanguard: una ciudad en directo, bloque a bloque, mientras el mundo arde.",
    categoria: "SIMULACION",
    ruta: "/zona-cero",
    permiso: "publico",
    estado: "VIVO",
    // v230.0 EL ESPEJO — dependencias declaradas: el simulador pulsa los
    // teatros reales (fnt:teatros) y su radar de despachos + la sección de
    // la guerra real viven de los cables (fnt:cables). Antes: vacías.
    dependencias: ["fnt:teatros", "fnt:cables"],
    alias: "zona cero ciudad en directo simulacion bloques",
    idEntidadComo: "vg:simulacion:zona-cero",
  },
  {
    id: "mod:mision",
    nombre: "MISIONES",
    lema: "Tu misión comunitaria",
    descripcion:
      "La misión del día, retos semanales y el progreso que paga tu tiempo en monedas, gemas y XP — guardado en la nube con tu cuenta.",
    categoria: "SIMULACION",
    ruta: "/mision",
    permiso: "cuenta",
    estado: "VIVO",
    dependencias: ["mod:cuenta"],
    alias: "mision misiones retos semanales recompensas monedas xp",
  },
  {
    id: "mod:objetivos",
    nombre: "LOS 100",
    lema: "La vitrina que casi nadie termina",
    descripcion:
      "Los 100 objetivos de Vanguard con botín a la vista y EL 1% como rey: solo cae con los otros 99 desbloqueados. Progreso real del PlayerState.",
    categoria: "SIMULACION",
    ruta: "/objetivos",
    permiso: "publico",
    estado: "VIVO",
    dependencias: [],
    alias: "objetivos logros desafios recompensas monedas gemas 1% vitrina",
  },
  {
    id: "mod:vanguard2",
    nombre: "VANGUARD-2",
    lema: "Cada sección, su propio mundo 3D",
    descripcion:
      "El universo en volumen: cada sección del SPA como mundo 3D independiente, en CSS3D, cero DOM encima.",
    categoria: "SIMULACION",
    ruta: "/vanguard2",
    permiso: "publico",
    estado: "VIVO",
    dependencias: [],
    alias: "vanguard2 universo 3d volumen secciones",
  },
  {
    id: "mod:escenarios",
    nombre: "EL ESTRATEGA",
    lema: "Escenarios con datos reales, nunca predicciones",
    descripcion:
      "Simulación pequeña verificable: datos/supuestos/variables/reglas/resultados SEPARADOS — fechas históricas, cables reales, frentes OSINT y gasto militar del Banco Mundial combinados bajo 5 supuestos declarados y 4 pesos que ajusta el usuario (0–2). Determinista, con desglose y procedencia a la vista. No predice: mide el peso relativo de los factores.",
    categoria: "SIMULACION",
    ruta: "/escenarios",
    permiso: "publico",
    estado: "VIVO",
    dependencias: ["fnt:acontecimientos", "fnt:cables", "fnt:teatros", "fnt:indicadores"],
    alias: "escenarios estratega simulacion presion teatro modelo pesos variables que pasa si analisis",
    idEntidadComo: "vg:simulacion:escenarios",
  },
  // ── COMUNIDAD ──────────────────────────────────────────────
  {
    id: "mod:audios",
    nombre: "LA EMISORA",
    lema: "La guerra en voz alta",
    descripcion:
      "El parte de guerra hablado que EXPLICA cada frente (emisor v217) y el muro donde los comandantes mandan su audio: grabador con permiso de micrófono, ≤90 s, moderado por techos.",
    categoria: "COMUNIDAD",
    ruta: "/audios",
    permiso: "publico",
    estado: "VIVO",
    dependencias: ["fnt:audios", "fnt:cables", "fnt:teatros"],
    alias: "audios emisora voz micro grabar radio comandante parte hablar escuchar",
  },
  {
    id: "mod:cuenta",
    nombre: "CUENTA VANGUARD",
    lema: "Tu progreso, en la nube",
    descripcion:
      "Registro y entrada reales (alias + clave, lockout, muros): el progreso viaja a cada aparato. La puerta vive en /modo y en el ritual de entrada.",
    categoria: "COMUNIDAD",
    ruta: "/modo",
    permiso: "cuenta",
    estado: "VIVO",
    dependencias: [],
    alias: "cuenta registro login entrar aliaste crear cuenta nube guardar",
  },
  // ── SISTEMA ────────────────────────────────────────────────
  {
    id: "mod:modo",
    nombre: "TU MODO",
    lema: "Elige qué hacer en Vanguard",
    descripcion:
      "El selector permanente de puertas: 6 modos de la casa, fijado en tu cuenta o en tu aparato, con panel de cuenta sin salir de la página.",
    categoria: "SISTEMA",
    ruta: "/modo",
    permiso: "publico",
    estado: "VIVO",
    dependencias: ["mod:cuenta"],
    alias: "modo elegir puerta entrada ritual que hacer",
  },
  {
    id: "mod:portada",
    nombre: "VANGUARD TODO",
    lema: "La portada total",
    descripcion:
      "La casa completa: redacción, mente, sensores, juegos y comunidad — el SPA con las 81 secciones, el buscador total y VG-ASSIST.",
    categoria: "SISTEMA",
    ruta: "/",
    permiso: "publico",
    estado: "VIVO",
    dependencias: [],
    alias: "portada todo casa spa inicio hangar",
  },
  {
    id: "mod:nucleo",
    nombre: "EL NÚCLEO",
    lema: "El mapa que conecta todo",
    descripcion:
      "Este censo: el registro de módulos, las 8 entidades compartidas con ids estables, la búsqueda global sobre fuentes autorizadas y los enlaces contextuales entre páginas.",
    categoria: "SISTEMA",
    ruta: "/nucleo",
    permiso: "publico",
    estado: "VIVO",
    dependencias: ["fnt:modulos"],
    alias: "nucleo mapa modulos arquitectura busqueda entidades sistema",
  },
  {
    id: "mod:privacidad",
    nombre: "PRIVACIDAD",
    lema: "Las reglas de la casa por escrito",
    descripcion:
      "Qué se guarda, qué no y con qué derecho — la página que exige Publisher Center y la honestidad de la casa.",
    categoria: "SISTEMA",
    ruta: "/privacidad",
    permiso: "publico",
    estado: "VIVO",
    dependencias: [],
    alias: "privacidad terminos datos reglas legal",
  },
];

/** ── Consultas del censo (puras, sin BD) ─────────────────── */

export function moduloPorId(id: string): ModuloNucleo | null {
  return MODULOS_NUCLEO.find((m) => m.id === id) ?? null;
}

export function moduloPorRuta(ruta: string): ModuloNucleo | null {
  return MODULOS_NUCLEO.find((m) => m.ruta === ruta) ?? null;
}

/** Módulos agrupados por categoría, en el orden del censo de categorías. */
export function modulosPorCategoria(): { categoria: CategoriaModulo; modulos: ModuloNucleo[] }[] {
  return CATEGORIAS_MODULO.map((categoria) => ({
    categoria,
    modulos: MODULOS_NUCLEO.filter((m) => m.categoria === categoria),
  }));
}

/** ¿Depende A de B, directa o en cadena? (evita ciclos por diseño). */
export function dependeDe(idModulo: string, idDependencia: string, profunidad = 6): boolean {
  const mod = moduloPorId(idModulo);
  if (!mod || profunidad <= 0) return false;
  if (mod.dependencias.includes(idDependencia)) return true;
  return mod.dependencias
    .filter((d) => d.startsWith("mod:"))
    .some((d) => dependeDe(d, idDependencia, profunidad - 1));
}

/** Los módulos que viven de este (cadena hacia arriba). */
export function dependientesDe(id: string): ModuloNucleo[] {
  return MODULOS_NUCLEO.filter((m) => m.dependencias.includes(id));
}
