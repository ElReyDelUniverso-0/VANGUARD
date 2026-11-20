// ═══════════════════════════════════════════════════════════════════
// v405.12 · EL REGISTRO DE LOS MUNDOS — la auditoría convertida en índice
//
// LO QUE HABÍA (medido, no supuesto): nueve puertas geográficas abiertas en
// paralelo (/atlas, /mapas, /mundo, /zona-cero, /conflictos, /rostros,
// /pulso-mundial, /archivo-mundial, /teatro-3d), una puerta de dos mundos
// (/noticias · /juego), 147 secciones 3D propias en /vanguard2 y nueve
// naciones FICTICIAS del espejo de juego (mundial-data) que se llamaban
// «mundo» igual que el planeta real. Ninguna sabía de las otras: el lector
// tenía que adivinar dónde estaba cada cosa.
//
// LO QUE HACE ESTE ARCHIVO: no borra ni una de esas puertas (regla del
// Dueño). Las declara en una tabla, dice qué CLASE de mundo es cada una
// —real, simulación, juego declarado, 3D o espacio propio— y qué se FUSIONÓ
// con qué. La sala /mundos enseña esta tabla entera: es el mapa de la casa,
// no un módulo nuevo aislado.
//
// REGLA: todo `ruta` de este archivo existe en el repositorio y toda `sala`
// del cuartel existe en mapa-salas.ts. Lo comprueba test-mundos.js.
// ═══════════════════════════════════════════════════════════════════

export type ClaseMundo = "real" | "simulacion" | "juego" | "puerta" | "tridimensional" | "espacio";

export interface MundoCasa {
  clave: string;
  nombre: string;
  clase: ClaseMundo;
  /** ruta real del repositorio (o puerta del cuartel con ?sala=) */
  ruta: string;
  /** icono de lucide (los mismos nombres que usa la barra) */
  icono: string;
  lema: string;
  resumen: string;
  /** de dónde salen sus datos, dicho sin adornos */
  fuente: string;
  /** la cifra que lo identifica (se recalcula en la sala, no se escribe a mano) */
  cifra: { valor: string | number; etiqueta: string };
}

export const MUNDOS: MundoCasa[] = [
  {
    clave: "indice",
    nombre: "El mapa de los mundos",
    clase: "real",
    ruta: "/mundos",
    icono: "globe-2",
    lema: "Todo el planeta en un solo mapa",
    resumen:
      "El índice que faltaba: países con polígono real, fronteras, macroterritorios y las nueve puertas geográficas de la casa en una sola pantalla.",
    fuente: "Natural Earth · geo-paises · atlas-data · world-data · poder-data",
    cifra: { valor: "249", etiqueta: "países con ficha" },
  },
  {
    clave: "atlas",
    nombre: "Atlas del planeta",
    clase: "real",
    ruta: "/atlas",
    icono: "book-open",
    lema: "Capital, gobierno y líder de cada nación",
    resumen: "Las naciones con su capital, población, superficie, idioma, moneda, gobierno y líder real, más las personas que mueven el mundo.",
    fuente: "atlas-data (datos verificados de la casa)",
    cifra: { valor: "162", etiqueta: "naciones con ficha completa" },
  },
  {
    clave: "mapas",
    nombre: "Centro de mapas",
    clase: "tridimensional",
    ruta: "/mapas",
    icono: "layers",
    lema: "Ocho capas sobre el globo",
    resumen: "El globo 3D con pintado por país: mundial, político, físico, económico, demográfico, temático, histórico y de acontecimientos.",
    fuente: "World Bank · Natural Earth · Banco Mundial (poder-data)",
    cifra: { valor: "8", etiqueta: "capas geográficas" },
  },
  {
    clave: "mundo-3d",
    nombre: "Mundo 3D",
    clase: "tridimensional",
    ruta: "/mundo",
    icono: "globe",
    lema: "El planeta que respira",
    resumen: "El globo de la casa con las zonas de control y los cables del día encendidos en su coordenada real.",
    fuente: "cables de 24 h por teatro (BD de la casa)",
    cifra: { valor: "9", etiqueta: "teatros vigilados" },
  },
  {
    clave: "zona-cero",
    nombre: "Zona cero",
    clase: "real",
    ruta: "/zona-cero",
    icono: "target",
    lema: "Los puntos calientes, uno por uno",
    resumen: "Cada frente del planeta con su lectura geográfica: dónde está, quién lo rodea y por qué importa.",
    fuente: "teatros + geografía del censo",
    cifra: { valor: "9", etiqueta: "puntos calientes" },
  },
  {
    clave: "conflictos",
    nombre: "Tablero de conflictos",
    clase: "real",
    ruta: "/conflictos",
    icono: "swords",
    lema: "Las regiones en seguimiento",
    resumen: "Los conflictos abiertos con su intensidad medida y su puerta a cada teatro.",
    fuente: "acontecimientos del núcleo (hechos reales con fecha)",
    cifra: { valor: "9", etiqueta: "acontecimientos sembrados" },
  },
  {
    clave: "rostros",
    nombre: "Rostros del poder",
    clase: "real",
    ruta: "/rostros",
    icono: "users",
    lema: "Quién manda y desde dónde",
    resumen: "Las personas del poder con su sede real, su ciudad, su zona horaria y su biografía.",
    fuente: "PERSONAS_ATLAS (sede y zona reales)",
    cifra: { valor: "78", etiqueta: "personas con sede" },
  },
  {
    clave: "pulso",
    nombre: "Datos vivos",
    clase: "real",
    ruta: "/pulso-mundial",
    icono: "activity",
    lema: "El planeta medido ahora",
    resumen: "Sismos, clima espacial y señales del mundo en tiempo real, con su hora y su fuente.",
    fuente: "USGS · NOAA SWPC y fuentes abiertas",
    cifra: { valor: "24 h", etiqueta: "ventana de medida" },
  },
  {
    clave: "archivo",
    nombre: "Archivo mundial",
    clase: "real",
    ruta: "/archivo-mundial",
    icono: "archive",
    lema: "Lo que ya pasó, con su fuente",
    resumen: "El archivo de la casa por países y regiones: lo publicado, ordenado por geografía.",
    fuente: "archivo de cables de la casa",
    cifra: { valor: "10", etiqueta: "guerras históricas con coordenada" },
  },
  {
    clave: "teatro",
    nombre: "Arsenal 3D · simulador",
    clase: "simulacion",
    ruta: "/teatro-3d",
    icono: "crosshair",
    lema: "Cualquier coordenada, un teatro",
    resumen: "Convierte un país o una coordenada en un teatro táctico 2D/3D: terreno, unidades, frentes y órdenes.",
    fuente: "geometría real + modelos del juego (declarado)",
    cifra: { valor: "5", etiqueta: "módulos de simulación" },
  },
  {
    clave: "escenarios",
    nombre: "Escenarios",
    clase: "simulacion",
    ruta: "/escenarios",
    icono: "flask-conical",
    lema: "Qué pasa si…",
    resumen: "Los escenarios jugables de la casa: se abren, se tuercen y se comparan con el mundo real.",
    fuente: "motor de escenarios propio (declarado)",
    cifra: { valor: "abiertos", etiqueta: "sin guion fijo" },
  },
  {
    clave: "puerta",
    nombre: "La Puerta · un solo mundo",
    clase: "puerta",
    ruta: "/",
    icono: "door-open",
    lema: "Toda la casa y su centro",
    resumen: "La intro de la casa (v432): un solo mundo — noticias, mapas, conocimiento, simulación y juego con el mismo estilo — y su centro, la Zona Cero.",
    fuente: "modulos.ts (cero cifras a mano)",
    cifra: { valor: "1", etiqueta: "mundo, una sola piel" },
  },
  {
    clave: "vanguard2",
    nombre: "VANGUARD-2 · mundos 3D",
    clase: "tridimensional",
    ruta: "/vanguard2",
    icono: "boxes",
    lema: "Cada sección, su propio mundo",
    resumen: "147 secciones construidas en 3D: cada una se levanta al entrar y se despieza al salir.",
    fuente: "motor 3D propio (three.js) · secciones de tabs-v2",
    cifra: { valor: "147", etiqueta: "secciones 3D" },
  },
  {
    clave: "espejo",
    nombre: "Naciones del espejo",
    clase: "juego",
    ruta: "/cuartel?sala=mundial",
    icono: "venetian-mask",
    lema: "Ficción declarada",
    resumen:
      "Nueve naciones inventadas con dossier de juego (gobierno, economía, riesgo). NO son países reales y ninguna cifra de aquí se mezcla con el mapa real.",
    fuente: "mundial-data · contenido propio del mundo Vanguard (ficción)",
    cifra: { valor: "9", etiqueta: "naciones de ficción" },
  },
  {
    clave: "miespacio",
    nombre: "Mi espacio",
    clase: "espacio",
    ruta: "/espacio",
    icono: "briefcase",
    lema: "Tu propio entorno",
    resumen: "Donde guardas lo que encuentras en estos mundos: piezas, proyectos, sesiones y actividad.",
    fuente: "almacén local del operador (vx405.11-espacio)",
    cifra: { valor: "7", etiqueta: "clases de pieza" },
  },
];

// ═══════════════════════════════════════════════════════════════════
// LAS FUSIONES — qué se unió con qué, y por qué
// ═══════════════════════════════════════════════════════════════════
export interface Fusion {
  familia: string;
  /** la puerta canónica que queda */
  canonico: string;
  /** las piezas que ahora entran por ella (siguen existiendo: se enlazan) */
  absorbe: string[];
  motivo: string;
  /** la cifra que lo demuestra */
  cifra: string;
}

export const FUSIONES: Fusion[] = [
  {
    familia: "ficha-pais",
    canonico: "/mundos/[iso]",
    absorbe: ["geo-paises (249)", "atlas-data (162)", "world-data (249 monedas)", "poder-data (167)", "acontecimientos (9)"],
    motivo:
      "El mismo país se describía en cinco tablas que no se hablaban: la bandera usaba ISO-2, el Banco Mundial ISO-3, Natural Earth el código numérico y las noticias el nombre. Ahora hay UNA ficha que une las cinco por identidad ISO y declara qué campo falta.",
    cifra: "5 tablas → 1 ficha · 249 países",
  },
  {
    familia: "mapa",
    canonico: "/mundos",
    absorbe: ["world-paths.json (silueta)", "territory-paths.ts (24 manchas)", "countries-110m", "territory del mapa de guerra"],
    motivo:
      "Había una silueta sin países y 24 manchas de macroterritorio que no se podían tocar: ninguna de las dos servía para preguntar por un país. El mapa nuevo dibuja los 177 polígonos de Natural Earth, sus fronteras reales y, encima, los 24 territorios de la casa.",
    cifra: "4 mapas → 1 mapa con países y fronteras",
  },
  {
    familia: "puerta-geo",
    canonico: "/mundos",
    absorbe: ["/atlas", "/mapas", "/mundo", "/zona-cero", "/conflictos", "/rostros", "/pulso-mundial", "/archivo-mundial"],
    motivo:
      "Nueve puertas geográficas abiertas a la vez, sin un índice que dijera cuál abrir. La sala las declara todas con su clase y su fuente: se entra por el mapa y desde ahí se salta a la que haga falta. Ninguna se cierra.",
    cifra: "9 puertas · 1 índice",
  },
  {
    familia: "ficcion-real",
    canonico: "/mundos",
    absorbe: ["mundial-data (9 naciones ficticias)"],
    motivo:
      "Las naciones del espejo de juego se llamaban «mundo» igual que el planeta real y sus cifras viajaban sin etiqueta. Ahora viven en su propia clase —«juego declarado»— y el mapa real no mezcla ni uno de sus números.",
    cifra: "0 cifras de ficción en el mapa real",
  },
  {
    familia: "mundos-3d",
    canonico: "/mundos#tridimensional",
    absorbe: ["/mundo (globo)", "/mapas (globo por capas)", "/vanguard2 (147 secciones)", "/teatro-3d (teatro)"],
    motivo:
      "Cuatro motores 3D y ninguna lista de qué hay en cada uno. El registro los agrupa por clase «tridimensional» y dice qué resuelve cada uno, para que el lector no elija a ciegas.",
    cifra: "4 motores · 1 registro",
  },
  {
    familia: "simulacion",
    canonico: "/teatro-3d",
    absorbe: ["/escenarios", "/ver-guerra", "/objetivos", "/armeria", "/cruce"],
    motivo:
      "La simulación vivía en cinco salas sin puente desde la geografía: se podía ver un país y no simularlo. Ahora cada ficha de país lleva su botón «simular aquí» con las coordenadas reales del país en la URL.",
    cifra: "249 fichas → simulador en un toque",
  },
];

// ═══════════════════════════════════════════════════════════════════
// LOS PUENTES — de un país a los módulos de información y simulación
// `{lat}`, `{lng}` y `{nombre}` se sustituyen por los del país elegido.
// ═══════════════════════════════════════════════════════════════════
export interface Puente {
  id: string;
  nombre: string;
  clase: "informacion" | "simulacion" | "archivo" | "dinero";
  desc: string;
  ruta: string;
}

export const PUENTES: Puente[] = [
  { id: "mapas", nombre: "Centro de mapas", clase: "informacion", desc: "El globo 3D con las ocho capas y el país ya buscado", ruta: "/mapas" },
  { id: "atlas", nombre: "Atlas del planeta", clase: "informacion", desc: "La ficha larga: capital, gobierno, líder y su dato estratégico", ruta: "/atlas" },
  { id: "teatro", nombre: "Simular aquí", clase: "simulacion", desc: "Abre el teatro táctico en las coordenadas reales del país", ruta: "/teatro-3d?lat={lat}&lng={lng}&nombre={nombre}" },
  { id: "escenarios", nombre: "Escenarios", clase: "simulacion", desc: "Qué pasa si este país entra en un escenario abierto", ruta: "/escenarios" },
  { id: "conflictos", nombre: "Conflictos", clase: "informacion", desc: "Las regiones en seguimiento y su intensidad", ruta: "/conflictos" },
  { id: "zona-cero", nombre: "Zona cero", clase: "informacion", desc: "Los puntos calientes con su lectura geográfica", ruta: "/zona-cero" },
  { id: "rostros", nombre: "Rostros del poder", clase: "informacion", desc: "Quién manda en el país y desde qué sede", ruta: "/rostros" },
  { id: "divisas", nombre: "Divisas", clase: "dinero", desc: "Su moneda frente al dólar y al resto del tablero", ruta: "/divisas" },
  { id: "pulso", nombre: "Datos vivos", clase: "informacion", desc: "Sismos, clima espacial y señales del planeta", ruta: "/pulso-mundial" },
  { id: "archivo", nombre: "Archivo mundial", clase: "archivo", desc: "Lo publicado sobre la región, ordenado por geografía", ruta: "/archivo-mundial" },
  { id: "historia", nombre: "Archivo de guerras", clase: "archivo", desc: "Diez guerras reales con fecha y coordenada", ruta: "/historia" },
  { id: "espacio", nombre: "Guardar en mi espacio", clase: "informacion", desc: "Lo que encuentres aquí va a tu mesa de trabajo", ruta: "/espacio" },
];

/** Resuelve un puente para un país concreto (coordenadas y nombre ya dentro). */
export function resolverPuente(p: Puente, pais: { lat: number; lng: number; nombre: string }): string {
  return p.ruta
    .replace("{lat}", String(Math.round(pais.lat * 1000) / 1000))
    .replace("{lng}", String(Math.round(pais.lng * 1000) / 1000))
    .replace("{nombre}", encodeURIComponent(pais.nombre));
}

/** Cuántos mundos de cada clase hay (lo enseña la sala, no se escribe a mano). */
export function mundosPorClase(): { clase: ClaseMundo; nombre: string; cuantos: number }[] {
  const NOMBRE: Record<ClaseMundo, string> = {
    real: "Geografía real",
    simulacion: "Simulación",
    juego: "Juego declarado",
    puerta: "Puertas de entrada",
    tridimensional: "Mundos 3D",
    espacio: "Espacio propio",
  };
  const orden: ClaseMundo[] = ["real", "tridimensional", "simulacion", "juego", "puerta", "espacio"];
  return orden
    .map((clase) => ({ clase, nombre: NOMBRE[clase], cuantos: MUNDOS.filter((m) => m.clase === clase).length }))
    .filter((x) => x.cuantos > 0);
}
