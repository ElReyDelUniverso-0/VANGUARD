// ═══════════════════════════════════════════════════════════════════
// v406.3 EL CALENDARIO DE LA REDACCIÓN — 30 días (18-nov → 17-dic-2026).
// Cuatro semanas con prioridad propia, una cola de piezas con ángulo, fuentes
// previstas, informe con el que se coordina y contenido existente al que
// remite (control de duplicados). Las piezas ya publicadas se toman del
// registro: si una entra en ARTICULOS, el calendario la marca sola.
// También viven aquí los criterios de calidad, la verificación y el mapa
// de coordinación con el departamento de informes.
// ═══════════════════════════════════════════════════════════════════
import { ARTICULOS } from "./index";
import type { ClaveArea, PiezaPlan } from "./tipos";

export const VENTANA = { desde: "2026-11-18", hasta: "2026-12-17" };

export interface Semana {
  n: number;
  desde: string;
  hasta: string;
  foco: string;
  objetivo: string;
  areas: ClaveArea[];
  hitos: string[];
}

export const SEMANAS: Semana[] = [
  {
    n: 1,
    desde: "2026-11-18",
    hasta: "2026-11-24",
    foco: "Cumbres y guerra en el Golfo",
    objetivo: "Lanzar la biblioteca con 13 piezas y cubrir APEC, el cierre de la COP31 y la escalada en Ormuz y Baréin.",
    areas: ["relaciones", "geopolitica", "conflictos", "recursos"],
    hitos: ["18-19 nov · APEC en Shenzhen", "19 nov · cumbre a tres Xi-Trump-Putin", "20 nov · cierre previsto de la COP31", "Proclamación del Senado en Alaska"],
  },
  {
    n: 2,
    desde: "2026-11-25",
    hasta: "2026-12-01",
    foco: "Instituciones y sociedad",
    objetivo: "Construir las piezas de fondo que explican cómo se decide el mundo (ONU, OPEP+) y abrir Sociedad con datos.",
    areas: ["relaciones", "economia", "sociedad", "educacion", "historia"],
    hitos: ["25 nov · Día contra la violencia hacia las mujeres", "29 nov · Día de solidaridad con el pueblo palestino", "1 dic · Día Mundial del Sida"],
  },
  {
    n: 3,
    desde: "2026-12-02",
    hasta: "2026-12-08",
    foco: "Historia y vecindario",
    objetivo: "Piezas permanentes con anclaje de efeméride y el Caribe en primer plano: esclavitud, Haití y la República Dominicana, Pearl Harbor.",
    areas: ["historia", "paises", "ciencia", "recursos"],
    hitos: ["2 dic · Día para la abolición de la esclavitud", "7 dic · 85 años de Pearl Harbor"],
  },
  {
    n: 4,
    desde: "2026-12-09",
    hasta: "2026-12-17",
    foco: "G20 en Miami y cierre de año",
    objetivo: "Cobertura completa del G20 y cuenta atrás de la tregua de tierras raras (10 de enero de 2027).",
    areas: ["relaciones", "economia", "recursos", "educacion"],
    hitos: ["10 dic · Nobel de la Paz y Día de los Derechos Humanos", "14-15 dic · G20 en Miami", "10 ene 2027 · fin de la suspensión china (preparación)"],
  },
];

/** La cola de piezas pendientes (lo publicado se añade desde el registro). */
const COLA: PiezaPlan[] = [
  { fecha: "2026-11-19", area: "relaciones", titulo: "Shenzhen: la primera cumbre a tres entre EE. UU., China y Rusia", tipo: "actualidad", prioridad: 1, estado: "pendiente-evento", evento: "19 nov", angulo: "Qué se dijo sobre armas nucleares e Irán, y qué quedó fuera (Ucrania).", informe: "Crónica del día + cables de agencias", complementa: "Pieza «De Shenzhen a Miami» (la contextualiza, no la repite)", fuentes: ["Cancillería china", "Casa Blanca", "Kremlin", "EFE"] },
  { fecha: "2026-11-20", area: "economia", titulo: "Balance de APEC: ¿se prorroga la tregua comercial entre EE. UU. y China?", tipo: "actualidad", prioridad: 1, estado: "pendiente-evento", evento: "fin de APEC", angulo: "Aranceles, tierras raras y chips: qué cambia para el 10 de enero.", informe: "Pulso mundial + pieza de tierras raras", complementa: "Actualiza «Tierras raras» y «De Shenzhen a Miami»", fuentes: ["MOFCOM", "USTR", "Reuters/EFE"] },
  { fecha: "2026-11-21", area: "relaciones", titulo: "COP31: lo que se acordó en Antalya (y lo que no)", tipo: "actualidad", prioridad: 1, estado: "pendiente-evento", evento: "cierre de la COP31", angulo: "Texto final frente a los cuatro nudos: financiación, adaptación, fósiles y la decisión marco.", informe: "Crónica del día", complementa: "Actualiza «COP31 en Antalya»", fuentes: ["CMNUCC (decisiones)", "Noticias ONU"] },
  { fecha: "2026-11-22", area: "conflictos", titulo: "Irán y EE. UU.: cronología de una guerra (febrero-noviembre de 2026)", tipo: "actualidad", prioridad: 1, estado: "en-preparacion", angulo: "Línea de tiempo verificada mes a mes: ofensiva, Ormuz, bloqueo, ataques en Baréin, mediación de Catar.", informe: "Cables del teatro «hormuz» (radar) + contadores", complementa: "/conflicto/hormuz (noticias sueltas) → aquí la secuencia", fuentes: ["CENTCOM", "Cancillería de Catar", "agencias"] },
  { fecha: "2026-11-23", area: "economia", titulo: "Qué es la OPEP+ y cómo influye en el precio del petróleo", tipo: "permanente", prioridad: 2, estado: "en-cola", angulo: "Cuotas, capacidad ociosa y por qué Ormuz pesa más que cualquier reunión.", informe: "Pulso mundial", complementa: "Remite a «Ormuz y los cuellos de botella»", fuentes: ["OPEP", "EIA", "AIE"] },
  { fecha: "2026-11-24", area: "paises", titulo: "Baréin, la isla de la Quinta Flota", tipo: "permanente", prioridad: 2, estado: "en-cola", angulo: "Por qué un país de 780 km² es pieza clave en la guerra del Golfo.", informe: "Censo /mundos + teatro «hormuz»", complementa: "Amplía la ficha /mundos/bh con historia y bases", fuentes: ["Gobierno de Baréin", "US Navy (NAVCENT)"] },
  { fecha: "2026-11-25", area: "sociedad", titulo: "Violencia contra las mujeres: lo que dicen los datos de la ONU", tipo: "permanente", prioridad: 2, estado: "en-cola", evento: "25 nov", angulo: "Feminicidios por región y cómo se miden.", informe: "Censo /mundos (población) para tasas", fuentes: ["ONU Mujeres", "UNODC"] },
  { fecha: "2026-11-26", area: "recursos", titulo: "Ríos que cruzan fronteras: el Nilo, el Mekong y el Indo", tipo: "permanente", prioridad: 2, estado: "en-cola", angulo: "Presas, sequías y tratados del agua: el próximo recurso en disputa.", informe: "Capas del planeta (/mapas)", fuentes: ["FAO AQUASTAT", "ONU-Agua"] },
  { fecha: "2026-11-27", area: "relaciones", titulo: "El Consejo de Seguridad por dentro: el veto y sus límites", tipo: "permanente", prioridad: 1, estado: "en-cola", angulo: "Quién lo usa, cuántas veces y qué bloquea.", informe: "Inteligencia mundial (/servicios)", complementa: "Remite a «Westfalia» (Carta de la ONU)", fuentes: ["ONU · Dag Hammarskjöld Library (registro de vetos)", "Carta de la ONU"] },
  { fecha: "2026-11-28", area: "educacion", titulo: "Cómo leer un mapa sin dejarse engañar: proyecciones y escalas", tipo: "permanente", prioridad: 2, estado: "en-cola", angulo: "Por qué Groenlandia parece del tamaño de África y qué mapa usar para cada cosa.", informe: "Centro de mapas (/mapas)", complementa: "Guía de lectura para /mapas y /mundos", fuentes: ["USGS (proyecciones)", "IGN"] },
  { fecha: "2026-11-29", area: "historia", titulo: "29 de noviembre de 1947: el plan de partición de Palestina", tipo: "permanente", prioridad: 2, estado: "en-cola", evento: "29 nov", angulo: "La resolución 181, lo que proponía y por qué nunca se aplicó.", informe: "Teatro «gaza»", complementa: "Remite a «Estados con reconocimiento limitado» sin repetir su tabla", fuentes: ["ONU · A/RES/181(II)"] },
  { fecha: "2026-11-30", area: "geopolitica", titulo: "El estrecho de Taiwán: geografía de una crisis", tipo: "permanente", prioridad: 1, estado: "en-cola", angulo: "180 km de mar: mareas, playas y por qué una invasión es tan difícil.", informe: "Teatro «taiwan»", complementa: "Une «La máquina más compleja del mundo» con /conflicto/taiwan", fuentes: ["Departamento de Defensa de EE. UU. (informe China)", "Ministerio de Defensa de Taiwán"] },
  { fecha: "2026-12-01", area: "sociedad", titulo: "El VIH en 2026: dónde sigue la epidemia", tipo: "actualidad", prioridad: 2, estado: "en-cola", evento: "1 dic", angulo: "Datos de ONUSIDA y el impacto de los recortes de la ayuda internacional.", informe: "Censo /mundos", fuentes: ["ONUSIDA", "OMS"] },
  { fecha: "2026-12-02", area: "historia", titulo: "La trata atlántica: la historia que explica el Caribe", tipo: "permanente", prioridad: 2, estado: "en-cola", evento: "2 dic", angulo: "Rutas, cifras de la base Slave Voyages y su huella en La Española.", informe: "Las eras (/archivo-mundial#epocas)", fuentes: ["Slave Voyages (Emory)", "UNESCO · La Ruta del Esclavo"] },
  { fecha: "2026-12-03", area: "ciencia", titulo: "Drones: cómo cambiaron la guerra, de Ucrania a Ormuz", tipo: "permanente", prioridad: 1, estado: "en-cola", angulo: "Doctrina y costes: un dron de mil dólares contra un tanque de millones.", informe: "Armería + teatros «ukraine» y «hormuz»", complementa: "La armería lista aparatos; aquí la doctrina", fuentes: ["RUSI", "CSIS"] },
  { fecha: "2026-12-04", area: "economia", titulo: "La deuda de los países pobres: quién debe a quién", tipo: "permanente", prioridad: 2, estado: "en-cola", angulo: "China, el FMI y los bonistas: el nuevo mapa de acreedores.", informe: "Censo /mundos (PIB)", fuentes: ["Banco Mundial · International Debt Report", "FMI"] },
  { fecha: "2026-12-05", area: "paises", titulo: "Haití y la República Dominicana: una isla, dos países", tipo: "permanente", prioridad: 1, estado: "en-cola", angulo: "Historia, frontera, economía y migración con datos, sin consignas.", informe: "Censo /mundos (fichas do y ht)", complementa: "Amplía /mundos/do y /mundos/ht", fuentes: ["ONE (Oficina Nacional de Estadística)", "Banco Mundial", "OIM"] },
  { fecha: "2026-12-06", area: "recursos", titulo: "El triángulo del litio: Argentina, Bolivia y Chile", tipo: "permanente", prioridad: 2, estado: "en-cola", angulo: "Salares, modelos de explotación y quién se queda con el valor.", informe: "Pulso mundial", complementa: "Serie de minerales críticos (sigue a «Tierras raras»)", fuentes: ["USGS MCS", "Cochilco"] },
  { fecha: "2026-12-07", area: "historia", titulo: "Pearl Harbor, 85 años: el ataque que metió a EE. UU. en la guerra", tipo: "permanente", prioridad: 1, estado: "en-cola", evento: "7 dic", angulo: "La sorpresa estratégica como lección: lo que se sabía y no se creyó.", informe: "Archivo de guerras (/historia)", complementa: "El archivo cubre la guerra; aquí el día y la doctrina de la sorpresa", fuentes: ["National Archives (EE. UU.)", "Naval History and Heritage Command"] },
  { fecha: "2026-12-08", area: "relaciones", titulo: "La OTAN en 2026: miembros, artículo 5 y gasto", tipo: "permanente", prioridad: 2, estado: "en-cola", angulo: "Qué obliga y qué no el artículo 5; quién cumple el objetivo de gasto.", informe: "Poder militar (/poder)", fuentes: ["OTAN · informes de gasto", "Tratado del Atlántico Norte"] },
  { fecha: "2026-12-09", area: "sociedad", titulo: "Corrupción: cómo se mide y qué dicen los índices", tipo: "permanente", prioridad: 3, estado: "en-cola", evento: "9 dic", angulo: "Qué mide (y qué no) el Índice de Percepción de la Corrupción.", informe: "Censo /mundos", fuentes: ["Transparency International", "Banco Mundial (WGI)"] },
  { fecha: "2026-12-10", area: "educacion", titulo: "La Declaración Universal de los Derechos Humanos, artículo por artículo", tipo: "permanente", prioridad: 2, estado: "en-cola", evento: "10 dic", angulo: "Qué dice, qué no obliga y cómo se usa hoy. Con el Nobel de la Paz del día.", informe: "Inteligencia mundial (/servicios)", fuentes: ["ONU · DUDH", "Comité Nobel noruego"] },
  { fecha: "2026-12-11", area: "relaciones", titulo: "Actualización: guía del G20 de Miami", tipo: "actualidad", prioridad: 1, estado: "en-cola", angulo: "Revisión de «De Shenzhen a Miami» con agenda y asistentes definitivos.", informe: "Cables de agencias", complementa: "Actualiza la pieza existente (no se publica otra)", fuentes: ["Web de la presidencia estadounidense del G20"] },
  { fecha: "2026-12-12", area: "economia", titulo: "Dólar, euro y yuan: quién manda en las monedas del mundo", tipo: "permanente", prioridad: 2, estado: "en-cola", angulo: "Reservas, pagos y el debate de la desdolarización.", informe: "Divisas (/divisas)", complementa: "/divisas da tasas; aquí el poder monetario", fuentes: ["FMI · COFER", "SWIFT RMB Tracker"] },
  { fecha: "2026-12-13", area: "geopolitica", titulo: "El Ártico: deshielo, rutas y bases", tipo: "permanente", prioridad: 2, estado: "en-cola", angulo: "La ruta del mar del Norte, Groenlandia y la carrera por el polo.", informe: "Centro de mapas", fuentes: ["NSIDC", "Consejo Ártico"] },
  { fecha: "2026-12-14", area: "relaciones", titulo: "G20 en Miami: primera jornada", tipo: "actualidad", prioridad: 1, estado: "pendiente-evento", evento: "14 dic", angulo: "Quién llegó, quién faltó y el primer borrador de declaración.", informe: "Crónica del día", fuentes: ["Presidencia del G20", "agencias"] },
  { fecha: "2026-12-15", area: "educacion", titulo: "Cómo estudiar un conflicto con fuentes abiertas: guía para estudiantes", tipo: "permanente", prioridad: 3, estado: "en-cola", angulo: "Un método de trabajo con UCDP, ACLED, mapas y prensa.", informe: "Contadores + teatros", complementa: "Sigue a «Cómo verificar» y «Cómo se cuentan los muertos»", fuentes: ["UCDP", "ACLED"] },
  { fecha: "2026-12-16", area: "relaciones", titulo: "Balance del G20 de Miami", tipo: "actualidad", prioridad: 1, estado: "pendiente-evento", evento: "fin del G20", angulo: "Declaración final (si la hay) frente a la agenda; el efecto de la ausencia de Sudáfrica.", informe: "Crónica del día", complementa: "Actualiza «De Shenzhen a Miami»", fuentes: ["Presidencia del G20", "agencias"] },
  { fecha: "2026-12-17", area: "recursos", titulo: "Tierras raras: cuenta atrás al 10 de enero", tipo: "actualidad", prioridad: 1, estado: "en-cola", angulo: "Qué ha negociado cada parte y qué pasa si la suspensión caduca.", informe: "Pulso mundial", complementa: "Actualiza «Tierras raras» (revisión obligatoria)", fuentes: ["MOFCOM", "USTR"] },
];

/** Calendario completo: lo publicado (desde el registro) + la cola. */
export function calendario(): PiezaPlan[] {
  const publicadas: PiezaPlan[] = ARTICULOS.map((a) => ({
    fecha: a.publicado,
    area: a.area,
    titulo: a.titulo,
    tipo: a.tipo,
    prioridad: a.tipo === "actualidad" ? 1 : 2,
    estado: "publicado",
    angulo: a.entradilla,
    informe: a.informe,
    complementa: a.complementa,
    fuentes: a.fuentes.map((f) => f.nombre.split(" · ")[0]),
    slug: a.slug,
  }));
  return [...publicadas, ...COLA].sort((x, y) => (x.fecha < y.fecha ? -1 : x.fecha > y.fecha ? 1 : x.prioridad - y.prioridad));
}

export function semanaDe(fecha: string): Semana | null {
  return SEMANAS.find((s) => fecha >= s.desde && fecha <= s.hasta) ?? null;
}

export function cola(): PiezaPlan[] {
  return COLA;
}

export const ESTADO_ES: Record<PiezaPlan["estado"], string> = {
  publicado: "Publicado",
  "en-preparacion": "En preparación",
  "en-cola": "En cola",
  "pendiente-evento": "Tras el evento",
};

// ── criterios de calidad y verificación ─────────────────────────────
export const CRITERIOS_CALIDAD: { titulo: string; texto: string }[] = [
  { titulo: "Nada sin fuente", texto: "Cada pieza enlaza sus fuentes; las cifras llevan organismo y año. El registro rechaza un artículo sin fuentes." },
  { titulo: "Primaria antes que secundaria", texto: "Se cita el documento o el organismo que produce el dato (ONU, USGS, EIA, Banco Mundial) antes que la prensa que lo cuenta." },
  { titulo: "Atribuir lo que dicen las partes", texto: "Las cifras de una parte en guerra se presentan como suyas («según Teherán», «según el CENTCOM») y se señala si no hay verificación independiente." },
  { titulo: "Fecha visible", texto: "Publicación, última revisión y registro de cambios en cada pieza. La actualidad declara su fecha de corte." },
  { titulo: "No repetir la casa", texto: "Antes de encargar una pieza se comprueba qué sala la cubre ya; la pieza nueva aporta otro ángulo y enlaza a la sala en vez de copiarla." },
  { titulo: "Español claro", texto: "Frases cortas, términos técnicos explicados la primera vez, cifras con formato español (punto de miles, coma decimal)." },
  { titulo: "Sin enlaces muertos", texto: "Todo enlace interno apunta a una ruta viva; las puertas clásicas se filtran contra el registro de salas." },
];

export const PASOS_VERIFICACION: string[] = [
  "Cada dato numérico se contrasta con su fuente primaria o con dos fuentes secundarias independientes.",
  "Toda URL citada se abre antes de publicar y se comprueba que el título corresponde a lo que se cita.",
  "Las cifras de víctimas y daños indican quién las da y si están verificadas de forma independiente.",
  "Imágenes y vídeos de terceros pasan por el método de siete pasos de la redacción.",
  "Las piezas de actualidad declaran su fecha de corte y se revisan tras el hito que las condiciona.",
  "Un error corregido se anota en el registro de cambios de la pieza, con fecha.",
];

// ── coordinación con el departamento de informes ─────────────────────
export interface Informe {
  nombre: string;
  ruta: string;
  entrega: string; // qué le da a la redacción
  recibe: string; // qué le devuelve la redacción
  areas: ClaveArea[];
}

export const INFORMES: Informe[] = [
  { nombre: "Crónica del día", ruta: "/cronica", entrega: "Los hechos fechados que disparan piezas de actualidad y balances.", recibe: "Enlaces a las piezas de contexto para cada hecho grande.", areas: ["relaciones", "geopolitica", "conflictos"] },
  { nombre: "Radar de teatros (cables por conflicto)", ruta: "/conflictos", entrega: "Cables verificados por teatro (Ormuz, mar Rojo, Taiwán, Gaza, Ucrania…).", recibe: "Cronologías y explicadores que dan contexto al flujo de cables.", areas: ["conflictos", "geopolitica"] },
  { nombre: "Censo de los mundos", ruta: "/mundos", entrega: "Las 249 fichas con datos del Banco Mundial: alimentan las piezas de datos vivos.", recibe: "Piezas de países que amplían las fichas y enlazan a ellas.", areas: ["paises", "economia", "sociedad"] },
  { nombre: "Contadores y verdad cruda", ruta: "/verdad-cruda", entrega: "Cifras de víctimas y daños por conflicto.", recibe: "El método para leerlas («Cómo se cuentan los muertos»).", areas: ["conflictos", "educacion"] },
  { nombre: "Inteligencia mundial", ruta: "/servicios", entrega: "Briefings temáticos y agenda internacional.", recibe: "Piezas de fondo sobre instituciones y cumbres.", areas: ["relaciones"] },
  { nombre: "Informe de calidad", ruta: "/calidad", entrega: "Enlaces rotos y rutas caídas detectados por los agentes.", recibe: "Correcciones de enlaces en la biblioteca.", areas: ["educacion"] },
];
