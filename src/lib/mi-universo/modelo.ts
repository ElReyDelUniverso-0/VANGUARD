// ═══════════════════════════════════════════════════════════════════
// v421.8 · MY UNIVERSE — EL MODELO (lógica pura, sin React, sin DOM)
//
// QUÉ ES ESTO: el motor del espacio personal. Nada de lo que hay aquí sabe
// pintar ni guardar; solo decide qué es una parrilla, dónde cabe una pieza,
// qué pasa cuando arrastras una encima de otra, cuánto puede crecer, cómo se
// agrupa en zonas, cómo se cambia de distribución y cómo se vuelve atrás.
//
// POR QUÉ PURO: porque así se puede probar entero en node sin navegador
// (scripts/pruebas-mi-universo.mjs) y porque el mismo Estado sirve para el
// guardado local, la exportación a archivo y —el día que haya base durable—
// el guardado por cuenta. Una sola verdad, ninguna copia.
//
// REGLAS QUE CUMPLE:
//  ① Añadir una pieza no crea módulos: apunta a una sala real del catálogo.
//  ② Quitar una pieza quita el ACCESO, nunca el módulo (el catálogo no se toca).
//  ③ Nunca hay dos piezas solapadas: toda mutación termina en `acomodar`.
//  ④ Nada se pierde: cambiar de distribución reordena, no borra; quitar una
//     zona devuelve sus piezas a la primera; las instantáneas guardan copias.
//  ⑤ Todo lo que entra de fuera (importar, localStorage) se VALIDA y se
//     recorta: un JSON roto no puede romper el espacio.
// ═══════════════════════════════════════════════════════════════════

export const VERSION_MODELO = 1;
/** clave del guardado local (se le añade el usuario: un espacio por cuenta) */
export const CLAVE_LOCAL = "vx421-my-universo";
export const MAX_INSTANTANEAS = 20;
export const MAX_ZONAS = 8;
export const MAX_PIEZAS = 60;

export type Tema = "obsidiana" | "abisal" | "ambar" | "jade";
export type Columnas = 6 | 8 | 12;
export type Ancho = 1 | 2 | 3 | 4 | 6;
export type Alto = 1 | 2 | 3;

export type Pieza = {
  /** instancia: dos piezas pueden apuntar al mismo módulo sin pisarse */
  id: string;
  /** clave del catálogo (una sala real de la casa) */
  clave: string;
  zona: string;
  col: number;
  fila: number;
  ancho: Ancho;
  alto: Alto;
  favorito: boolean;
};

export type Zona = { id: string; nombre: string };

/** Un «núcleo» es un espacio concreto con su parrilla, sus zonas y su tema. */
export type Nucleo = {
  nombre: string;
  tema: Tema;
  columnas: Columnas;
  zonas: Zona[];
  piezas: Pieza[];
};

export type Instantanea = { id: string; cuando: string; etiqueta: string; nucleo: Nucleo };

/** El espacio entero de una persona: sus núcleos (espacios independientes). */
export type Espacio = {
  version: number;
  activo: string;
  nucleos: Record<string, Nucleo>;
  instantaneas: Instantanea[];
  actualizado: string;
};

// ─────────────────────────────── temas ───────────────────────────────
export type DefinicionTema = {
  clave: Tema;
  nombre: string;
  lema: string;
  acento: string;
  fondo: string;
  tinta: string;
  borde: string;
};

export const TEMAS: DefinicionTema[] = [
  { clave: "obsidiana", nombre: "Obsidiana", lema: "Negro profundo, oro viejo", acento: "#e8c56a", fondo: "#05060b", tinta: "#f5f2e8", borde: "#1d2130" },
  { clave: "abisal", nombre: "Abisal", lema: "Azul de fondo oceánico", acento: "#3ddcff", fondo: "#03070e", tinta: "#e6f4ff", borde: "#122639" },
  { clave: "ambar", nombre: "Ámbar", lema: "Cobre cálido, papel", acento: "#f5a623", fondo: "#0b0803", tinta: "#fff6e6", borde: "#2a1f0f" },
  { clave: "jade", nombre: "Jade", lema: "Verde de mesa de guerra", acento: "#5eead4", fondo: "#030a09", tinta: "#e9fffb", borde: "#0f2a26" },
];

export const temaDe = (clave: Tema): DefinicionTema =>
  TEMAS.find((t) => t.clave === clave) ?? TEMAS[0];

// ─────────────────────────── utilidades ──────────────────────────────
let contador = 0;
const nuevoId = (prefijo: string): string =>
  `${prefijo}-${Date.now().toString(36).slice(-5)}${(++contador).toString(36)}${Math.random().toString(36).slice(-3)}`;

const limitar = (n: number, min: number, max: number): number =>
  !Number.isFinite(n) ? min : Math.min(max, Math.max(min, Math.trunc(n)));

const copia = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

/** dos piezas se pisan si están en la misma zona y sus rectángulos se cruzan */
export const solapan = (a: Pieza, b: Pieza): boolean =>
  a.zona === b.zona &&
  a.col < b.col + b.ancho &&
  b.col < a.col + a.ancho &&
  a.fila < b.fila + b.alto &&
  b.fila < a.fila + a.alto;

/** ¿cabe en esa posición sin pisar a nadie? */
const libre = (nucleo: Nucleo, zona: string, col: number, fila: number, ancho: number, alto: number, excepto?: string): boolean => {
  if (col + ancho > nucleo.columnas) return false;
  const candidata: Pieza = { id: excepto ?? "·", clave: "", zona, col, fila, ancho: ancho as Ancho, alto: alto as Alto, favorito: false };
  return !nucleo.piezas.some((p) => p.id !== excepto && solapan(p, candidata));
};

/** el primer hueco libre de la zona, de arriba abajo y de izquierda a derecha */
export const huecoLibre = (nucleo: Nucleo, zona: string, ancho: number, alto: number): { col: number; fila: number } => {
  const anchoReal = Math.min(ancho, nucleo.columnas);
  for (let fila = 0; fila < 200; fila++) {
    for (let col = 0; col <= nucleo.columnas - anchoReal; col++) {
      if (libre(nucleo, zona, col, fila, anchoReal, alto)) return { col, fila };
    }
  }
  return { col: 0, fila: 0 };
};

/**
 * REACOMODO — la garantía de que nunca hay dos piezas encima.
 * Se ordenan por (favorito primero, luego fila, luego columna) y se vuelven a
 * colocar una por una en el primer hueco: sin solapes y sin huecos muertos.
 */
export function acomodar(nucleo: Nucleo): Nucleo {
  const porZona = new Map<string, Pieza[]>();
  for (const z of nucleo.zonas) porZona.set(z.id, []);
  for (const p of nucleo.piezas) {
    const lista = porZona.get(p.zona) ?? porZona.get(nucleo.zonas[0]?.id ?? "");
    if (lista) lista.push({ ...p });
  }
  const colocadas: Pieza[] = [];
  for (const z of nucleo.zonas) {
    const lista = (porZona.get(z.id) ?? []).sort(
      (a, b) => Number(b.favorito) - Number(a.favorito) || a.fila - b.fila || a.col - b.col,
    );
    const parcial: Nucleo = { ...nucleo, piezas: colocadas };
    for (const p of lista) {
      const ancho = limitar(p.ancho, 1, nucleo.columnas) as Ancho;
      const alto = limitar(p.alto, 1, 3) as Alto;
      const hueco = huecoLibre(parcial, z.id, ancho, alto);
      const nueva: Pieza = { ...p, zona: z.id, ancho, alto, col: hueco.col, fila: hueco.fila };
      colocadas.push(nueva);
      parcial.piezas = colocadas;
    }
  }
  return { ...nucleo, piezas: colocadas };
}

// ─────────────────────────── construcción ────────────────────────────
/** Reparte las claves dadas en tres zonas con una composición que se ve bien. */
export function nucleoInicial(nombre: string, claves: string[], tema: Tema = "obsidiana"): Nucleo {
  const zonas: Zona[] = [
    { id: "zona-mando", nombre: "Mando" },
    { id: "zona-trabajo", nombre: "Trabajo" },
    { id: "zona-lectura", nombre: "Lectura" },
  ];
  const piezas: Pieza[] = [];
  claves.slice(0, MAX_PIEZAS).forEach((clave, i) => {
    const zona = i === 0 ? zonas[0].id : i <= 3 ? zonas[1].id : zonas[2].id;
    piezas.push({
      id: nuevoId("pz"),
      clave,
      zona,
      col: 0,
      fila: 0,
      ancho: i === 0 ? 4 : i <= 3 ? 2 : 2,
      alto: i === 0 ? 2 : 1,
      favorito: i === 0,
    });
  });
  return acomodar({ nombre, tema, columnas: 8, zonas, piezas });
}

/** Un espacio nuevo con contenido de arranque (las claves las pone el catálogo). */
export function espacioNuevo(nombre: string, claves: string[]): Espacio {
  const clave = "principal";
  const nucleo = nucleoInicial(nombre, claves);
  return {
    version: VERSION_MODELO,
    activo: clave,
    nucleos: { [clave]: nucleo },
    instantaneas: [],
    actualizado: new Date().toISOString(),
  };
}

// ───────────────────────────── piezas ────────────────────────────────
export function anadirPieza(nucleo: Nucleo, clave: string, zonaId?: string): { nucleo: Nucleo; id: string; nuevo: boolean } {
  const existente = nucleo.piezas.find((p) => p.clave === clave);
  if (existente) return { nucleo, id: existente.id, nuevo: false };
  if (nucleo.piezas.length >= MAX_PIEZAS) return { nucleo, id: "", nuevo: false };
  const zona = zonaId && nucleo.zonas.some((z) => z.id === zonaId) ? zonaId : nucleo.zonas[0].id;
  const id = nuevoId("pz");
  const conPieza: Nucleo = {
    ...nucleo,
    piezas: [...nucleo.piezas, { id, clave, zona, col: 0, fila: 0, ancho: 2, alto: 1, favorito: false }],
  };
  return { nucleo: acomodar(conPieza), id, nuevo: true };
}

/** Quita el ACCESO. El módulo sigue en la casa: esto no toca el catálogo. */
export const quitarPieza = (nucleo: Nucleo, id: string): Nucleo =>
  acomodar({ ...nucleo, piezas: nucleo.piezas.filter((p) => p.id !== id) });

export const alternarFavorito = (nucleo: Nucleo, id: string): Nucleo =>
  acomodar({
    ...nucleo,
    piezas: nucleo.piezas.map((p) => (p.id === id ? { ...p, favorito: !p.favorito } : p)),
  });

/**
 * MOVER — arrastrar una pieza a una celda.
 * Si la celda está ocupada, la otra pieza se va al sitio que dejó esta: es un
 * intercambio, no una expulsión. Después se reacomoda para cerrar huecos.
 */
export function moverPieza(nucleo: Nucleo, id: string, destino: { zona: string; col: number; fila: number }): Nucleo {
  const pieza = nucleo.piezas.find((p) => p.id === id);
  if (!pieza) return nucleo;
  if (!nucleo.zonas.some((z) => z.id === destino.zona)) return nucleo;
  const col = limitar(destino.col, 0, nucleo.columnas - pieza.ancho);
  const fila = limitar(destino.fila, 0, 200);
  const movida: Pieza = { ...pieza, zona: destino.zona, col, fila };
  const choque = nucleo.piezas.find((p) => p.id !== id && solapan(p, movida));
  const piezas = nucleo.piezas.map((p) => {
    if (p.id === id) return movida;
    if (choque && p.id === choque.id) return { ...p, zona: pieza.zona, col: pieza.col, fila: pieza.fila };
    return p;
  });
  return acomodar({ ...nucleo, piezas });
}

/** REDIMENSIONAR — ancho en columnas (1..columnas) y alto en filas (1..3). */
export function redimensionar(nucleo: Nucleo, id: string, ancho: number, alto: number): Nucleo {
  const pieza = nucleo.piezas.find((p) => p.id === id);
  if (!pieza) return nucleo;
  const anchoReal = limitar(ancho, 1, nucleo.columnas);
  const altoReal = limitar(alto, 1, 3);
  const col = Math.min(pieza.col, nucleo.columnas - anchoReal);
  const piezas = nucleo.piezas.map((p) =>
    p.id === id ? { ...p, ancho: anchoReal as Ancho, alto: altoReal as Alto, col } : p,
  );
  return acomodar({ ...nucleo, piezas });
}

// ────────────────────────────── zonas ────────────────────────────────
export function crearZona(nucleo: Nucleo, nombre: string): Nucleo {
  if (nucleo.zonas.length >= MAX_ZONAS) return nucleo;
  const limpio = nombre.trim().slice(0, 28) || `Zona ${nucleo.zonas.length + 1}`;
  return { ...nucleo, zonas: [...nucleo.zonas, { id: nuevoId("zn"), nombre: limpio }] };
}

export const renombrarZona = (nucleo: Nucleo, id: string, nombre: string): Nucleo => ({
  ...nucleo,
  zonas: nucleo.zonas.map((z) => (z.id === id ? { ...z, nombre: nombre.trim().slice(0, 28) || z.nombre } : z)),
});

/** Quitar una zona NO pierde piezas: se mudan a la primera zona que quede. */
export function quitarZona(nucleo: Nucleo, id: string): Nucleo {
  if (nucleo.zonas.length <= 1) return nucleo;
  const zonas = nucleo.zonas.filter((z) => z.id !== id);
  const refugio = zonas[0].id;
  const piezas = nucleo.piezas.map((p) => (p.zona === id ? { ...p, zona: refugio, fila: 0 } : p));
  return acomodar({ ...nucleo, zonas, piezas });
}

// ─────────────────────────── distribuciones ──────────────────────────
export type ClaveDistribucion = "mando" | "mosaico" | "lectura" | "torre";

export const DISTRIBUCIONES: { clave: ClaveDistribucion; nombre: string; lema: string }[] = [
  { clave: "mando", nombre: "Mando", lema: "Dos pantallas grandes arriba, el resto en filas cortas" },
  { clave: "mosaico", nombre: "Mosaico", lema: "Piezas alternas de dos y cuatro columnas" },
  { clave: "lectura", nombre: "Lectura", lema: "Una columna ancha: cada pieza, un renglón" },
  { clave: "torre", nombre: "Torre", lema: "Doce columnas: una cabecera y cuatro torres" },
];

/**
 * Cambiar de distribución REORDENA, no borra: las mismas piezas, otro trazado.
 * Devuelve siempre un núcleo válido y sin solapes.
 */
export function aplicarDistribucion(nucleo: Nucleo, clave: ClaveDistribucion): Nucleo {
  const orden = [...nucleo.piezas].sort(
    (a, b) => Number(b.favorito) - Number(a.favorito) || nucleo.zonas.findIndex((z) => z.id === a.zona) - nucleo.zonas.findIndex((z) => z.id === b.zona) || a.fila - b.fila || a.col - b.col,
  );
  const zonaDe = (i: number): string => nucleo.zonas[Math.min(i, nucleo.zonas.length - 1)].id;

  if (clave === "lectura") {
    const piezas = orden.map((p, i) => ({ ...p, zona: nucleo.zonas[0].id, ancho: 6 as Ancho, alto: 1 as Alto, col: 0, fila: i }));
    return acomodar({ ...nucleo, columnas: 6, piezas });
  }
  if (clave === "torre") {
    const piezas = orden.map((p, i) =>
      i === 0
        ? { ...p, zona: zonaDe(0), ancho: 11 as Ancho, alto: 2 as Alto, col: 0, fila: 0 }
        : { ...p, zona: zonaDe(i > 1 ? 1 : 0), ancho: 3 as Ancho, alto: 1 as Alto, col: 0, fila: 0 },
    );
    return acomodar({ ...nucleo, columnas: 12, piezas });
  }
  if (clave === "mosaico") {
    const piezas = orden.map((p, i) => ({
      ...p,
      zona: zonaDe(i < 2 ? 0 : i < 5 ? 1 : 2),
      ancho: (i % 3 === 0 ? 4 : 2) as Ancho,
      alto: (i === 0 ? 2 : 1) as Alto,
      col: 0,
      fila: 0,
    }));
    return acomodar({ ...nucleo, columnas: 8, piezas });
  }
  // mando (por defecto)
  const piezas = orden.map((p, i) => ({
    ...p,
    zona: zonaDe(i < 2 ? 0 : i < 5 ? 1 : 2),
    ancho: (i < 2 ? 4 : 2) as Ancho,
    alto: (i < 2 ? 2 : 1) as Alto,
    col: 0,
    fila: 0,
  }));
  return acomodar({ ...nucleo, columnas: 8, piezas });
}

/** Volver al trazado original sin perder el contenido ni el tema. */
export function restaurarOriginal(nucleo: Nucleo): Nucleo {
  const claves = nucleo.piezas.map((p) => p.clave);
  return { ...nucleoInicial(nucleo.nombre, claves, nucleo.tema) };
}

export const cambiarColumnas = (nucleo: Nucleo, columnas: Columnas): Nucleo =>
  acomodar({
    ...nucleo,
    columnas,
    piezas: nucleo.piezas.map((p) => ({ ...p, ancho: limitar(p.ancho, 1, columnas) as Ancho, col: 0 })),
  });

export const cambiarTema = (nucleo: Nucleo, tema: Tema): Nucleo => ({ ...nucleo, tema });

// ──────────────────────────── instantáneas ───────────────────────────
export function crearInstantanea(espacio: Espacio, etiqueta: string): Espacio {
  const nucleo = espacio.nucleos[espacio.activo];
  if (!nucleo) return espacio;
  const nueva: Instantanea = {
    id: nuevoId("in"),
    cuando: new Date().toISOString(),
    etiqueta: etiqueta.trim().slice(0, 48) || `Copia del ${new Date().toLocaleString("es-ES")}`,
    nucleo: copia(nucleo),
  };
  return { ...espacio, instantaneas: [nueva, ...espacio.instantaneas].slice(0, MAX_INSTANTANEAS), actualizado: new Date().toISOString() };
}

export function recuperarInstantanea(espacio: Espacio, id: string): Espacio {
  const inst = espacio.instantaneas.find((i) => i.id === id);
  if (!inst) return espacio;
  return {
    ...espacio,
    nucleos: { ...espacio.nucleos, [espacio.activo]: copia(inst.nucleo) },
    actualizado: new Date().toISOString(),
  };
}

export const borrarInstantanea = (espacio: Espacio, id: string): Espacio => ({
  ...espacio,
  instantaneas: espacio.instantaneas.filter((i) => i.id !== id),
});

// ─────────────────────────── espacios (núcleos) ──────────────────────
/** «Espacios independientes»: cada uno con su parrilla, sus zonas y su tema. */
export function crearNucleo(espacio: Espacio, nombre: string, claves: string[]): { espacio: Espacio; clave: string } {
  const limpio = nombre.trim().slice(0, 32) || `Espacio ${Object.keys(espacio.nucleos).length + 1}`;
  let clave = limpio.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "espacio";
  while (espacio.nucleos[clave]) clave = `${clave}-2`;
  return { espacio: { ...espacio, nucleos: { ...espacio.nucleos, [clave]: nucleoInicial(limpio, claves) }, activo: clave, actualizado: new Date().toISOString() }, clave };
}

export const abrirNucleo = (espacio: Espacio, clave: string): Espacio =>
  espacio.nucleos[clave] ? { ...espacio, activo: clave } : espacio;

export const renombrarNucleo = (espacio: Espacio, clave: string, nombre: string): Espacio => {
  const nucleo = espacio.nucleos[clave];
  if (!nucleo) return espacio;
  return { ...espacio, nucleos: { ...espacio.nucleos, [clave]: { ...nucleo, nombre: nombre.trim().slice(0, 32) || nucleo.nombre } } };
};

/** Borrar un espacio nunca deja la casa sin ninguno: queda el primero. */
export function borrarNucleo(espacio: Espacio, clave: string): Espacio {
  const claves = Object.keys(espacio.nucleos);
  if (claves.length <= 1) return espacio;
  const nucleos = { ...espacio.nucleos };
  delete nucleos[clave];
  const activo = espacio.activo === clave ? Object.keys(nucleos)[0] : espacio.activo;
  return { ...espacio, nucleos, activo };
}

/** Aplica un cambio al núcleo activo sin repetir el `activo` por todas partes. */
export function editarActivo(espacio: Espacio, f: (n: Nucleo) => Nucleo): Espacio {
  const nucleo = espacio.nucleos[espacio.activo];
  if (!nucleo) return espacio;
  return {
    ...espacio,
    nucleos: { ...espacio.nucleos, [espacio.activo]: f(nucleo) },
    actualizado: new Date().toISOString(),
  };
}

// ─────────────────────── serializar / validar ────────────────────────
export function serializar(espacio: Espacio): string {
  return JSON.stringify({ ...espacio, version: VERSION_MODELO });
}

/**
 * VALIDACIÓN — todo lo que entra de fuera pasa por aquí.
 * Un JSON roto, una versión vieja o una pieza sin sitio no pueden dejar el
 * espacio en un estado imposible: se recorta y se reacomoda.
 */
export function deserializar(texto: string): Espacio | null {
  let bruto: unknown;
  try {
    bruto = JSON.parse(texto);
  } catch {
    return null;
  }
  if (!bruto || typeof bruto !== "object") return null;
  const e = bruto as Partial<Espacio>;
  if (!e.nucleos || typeof e.nucleos !== "object") return null;

  const nucleos: Record<string, Nucleo> = {};
  for (const [clave, valor] of Object.entries(e.nucleos)) {
    const n = valor as Partial<Nucleo>;
    if (!n || typeof n !== "object" || !Array.isArray(n.zonas) || !Array.isArray(n.piezas)) continue;
    const zonas: Zona[] = n.zonas
      .filter((z): z is Zona => !!z && typeof (z as Zona).id === "string")
      .slice(0, MAX_ZONAS)
      .map((z) => ({ id: z.id, nombre: typeof z.nombre === "string" ? z.nombre.slice(0, 28) : "Zona" }));
    if (!zonas.length) continue;
    const columnas = ([6, 8, 12] as Columnas[]).includes(n.columnas as Columnas) ? (n.columnas as Columnas) : 8;
    const tema = TEMAS.some((t) => t.clave === n.tema) ? (n.tema as Tema) : "obsidiana";
    const vistos = new Set<string>();
    const piezas: Pieza[] = [];
    for (const p of n.piezas.slice(0, MAX_PIEZAS)) {
      const pieza = p as Partial<Pieza>;
      if (!pieza || typeof pieza.clave !== "string" || !pieza.clave) continue;
      const id = typeof pieza.id === "string" && pieza.id && !vistos.has(pieza.id) ? pieza.id : nuevoId("pz");
      vistos.add(id);
      piezas.push({
        id,
        clave: pieza.clave.slice(0, 80),
        zona: zonas.some((z) => z.id === pieza.zona) ? (pieza.zona as string) : zonas[0].id,
        col: limitar(Number(pieza.col), 0, columnas - 1),
        fila: limitar(Number(pieza.fila), 0, 200),
        ancho: limitar(Number(pieza.ancho), 1, columnas) as Ancho,
        alto: limitar(Number(pieza.alto), 1, 3) as Alto,
        favorito: pieza.favorito === true,
      });
    }
    nucleos[clave] = acomodar({
      nombre: typeof n.nombre === "string" && n.nombre ? n.nombre.slice(0, 32) : clave,
      tema,
      columnas,
      zonas,
      piezas,
    });
  }
  if (!Object.keys(nucleos).length) return null;

  const instantaneas: Instantanea[] = Array.isArray(e.instantaneas)
    ? e.instantaneas
        .filter((i): i is Instantanea => !!i && typeof (i as Instantanea).id === "string" && !!(i as Instantanea).nucleo)
        .slice(0, MAX_INSTANTANEAS)
        .map((i) => ({ id: i.id, cuando: String(i.cuando ?? ""), etiqueta: String(i.etiqueta ?? "Copia").slice(0, 48), nucleo: i.nucleo }))
    : [];

  const activo = typeof e.activo === "string" && nucleos[e.activo] ? e.activo : Object.keys(nucleos)[0];
  return {
    version: VERSION_MODELO,
    activo,
    nucleos,
    instantaneas,
    actualizado: typeof e.actualizado === "string" ? e.actualizado : new Date().toISOString(),
  };
}

/** Resumen legible (lo usa la barra y las pruebas). */
export function resumen(espacio: Espacio): {
  espacios: number;
  piezas: number;
  zonas: number;
  favoritas: number;
  instantaneas: number;
  tema: Tema;
  columnas: Columnas;
  activo: string;
} {
  const nucleo = espacio.nucleos[espacio.activo];
  return {
    espacios: Object.keys(espacio.nucleos).length,
    piezas: nucleo?.piezas.length ?? 0,
    zonas: nucleo?.zonas.length ?? 0,
    favoritas: nucleo?.piezas.filter((p) => p.favorito).length ?? 0,
    instantaneas: espacio.instantaneas.length,
    tema: nucleo?.tema ?? "obsidiana",
    columnas: nucleo?.columnas ?? 8,
    activo: espacio.activo,
  };
}
