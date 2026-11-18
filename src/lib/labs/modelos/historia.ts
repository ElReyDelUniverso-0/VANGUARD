// ═══════════════════════════════════════════════════════════════════
// v411.0 · LABORATORIOS DE HISTORIA
//
//   · imperios — por qué crecen y por qué se rompen (sobrextensión fiscal)
//   · rutas    — cómo una ruta nueva hunde a las ciudades de la ruta vieja
//
// Regla de esta familia: aquí NO se simula "la historia real". Se simula un
// mecanismo con parámetros inspirados en casos documentados. La historia no es
// un sistema determinista y el laboratorio lo dice en cada ficha. Los datos
// concretos (superficies, fechas) van citados; las cifras del motor son
// supuestos declarados.
// ═══════════════════════════════════════════════════════════════════

import type { ModeloLab } from "../tipos";
import { limitar } from "../tipos";

// ───────────────────────── 10. IMPERIOS ─────────────────────────

export const imperios: ModeloLab = {
  id: "imperios",
  nombre: "Ascenso y caída de un imperio",
  categoria: "historia",
  pregunta: "¿Por qué se rompen los imperios?",
  resumen:
    "Un imperio con cuatro números: territorio controlado, tesoro, ejército y legitimidad. Conquistar suma territorio y resta legitimidad; administrar cuesta dinero; si el territorio crece más rápido que la administración, aparece la sobrextensión y con ella la rebelión.",
  contexto:
    "Roma llegó a unos cinco millones de kilómetros cuadrados y acabó partiendo el mando en dos. Los mongoles controlaron el mayor territorio contiguo de la historia y se repartieron en cuatro kanatos en dos generaciones. La causa no fue una sola: en este modelo es la distancia entre lo que se conquista y lo que se puede administrar.",
  unidadTiempo: "año",
  pasosDefecto: 60,
  pasosMax: 200,
  anioInicial: 100,
  variables: [
    { id: "territorio", nombre: "Territorio inicial", unidad: "índice 100", min: 10, max: 300, paso: 5, defecto: 60, origen: "eleccion", nota: "Tamaño de partida. 100 ≈ un millón de km² de referencia." },
    { id: "administracion", nombre: "Capacidad administrativa", unidad: "0-100", min: 10, max: 100, paso: 5, defecto: 50, origen: "eleccion", nota: "Carreteras, funcionarios, correo, censo. Es lo que convierte conquista en Estado." },
    { id: "agresividad", nombre: "Impulso expansionista", unidad: "0-100", min: 0, max: 100, paso: 5, defecto: 55, origen: "eleccion", nota: "Cuánto del excedente va a conquistar en vez de a consolidar." },
    { id: "impuestos", nombre: "Presión fiscal", unidad: "% del excedente", min: 0, max: 60, paso: 1, defecto: 25, origen: "eleccion", nota: "Más ingresos hoy, menos legitimidad mañana." },
    { id: "gastoMilitar", nombre: "Gasto militar", unidad: "% del presupuesto", min: 0, max: 90, paso: 5, defecto: 45, origen: "eleccion", nota: "Protege la frontera y se come el presupuesto civil." },
    { id: "cohesion", nombre: "Cohesión interna", unidad: "0-100", min: 0, max: 100, paso: 5, defecto: 55, origen: "supuesto", nota: "Lengua, élites y religión compartidas. Es un supuesto, no una medida." },
  ],
  metricas: [
    { campo: "territorio", nombre: "Territorio", unidad: "índice", formato: "indice", decimales: 0 },
    { campo: "legitimidad", nombre: "Legitimidad", unidad: "0-100", formato: "num", decimales: 1 },
    { campo: "tesoro", nombre: "Tesoro", unidad: "índice", formato: "indice", decimales: 0 },
    { campo: "sobreextension", nombre: "Sobreextensión", unidad: "% sobre la capacidad", formato: "pct", decimales: 0, nota: "Territorio que excede lo que la administración puede sostener." },
    { campo: "rebelion", nombre: "Presión de rebelión", unidad: "0-100", formato: "num", decimales: 1 },
  ],
  series: [
    { campo: "territorio", nombre: "Territorio", color: "#f472b6", unidad: "índice" },
    { campo: "legitimidad", nombre: "Legitimidad", color: "#fbbf24", unidad: "0-100" },
    { campo: "sobreextension", nombre: "Sobreextensión", color: "#f87171", unidad: "%" },
    { campo: "tesoro", nombre: "Tesoro", color: "#34d399", unidad: "índice" },
  ],
  reales: [
    { dato: "Superficie máxima del Imperio romano", valor: "≈ 5 millones de km² (s. II)", fuente: "estimaciones historiográficas habituales", donde: "/atlas" },
    { dato: "Imperio mongol", valor: "≈ 24 millones de km², el mayor contiguo de la historia", fuente: "estimaciones historiográficas", donde: "/geografia" },
    { dato: "División del Imperio romano", valor: "año 395, muerte de Teodosio", fuente: "historiografía clásica", donde: "/geografia" },
  ],
  supuestos: [
    "Cada punto de territorio produce un excedente decreciente (las provincias ricas se conquistan primero).",
    "La capacidad administrativa sostiene territorio hasta 40 + 1,2 × administración.",
    "La legitimidad baja con impuestos altos, con sobrextensión y con la falta de cohesión.",
    "El ejército disuade la rebelión pero su coste sale del tesoro.",
  ],
  limites: [
    "No hay vecinos ni rivales: el imperio crece contra la geografía, no contra otro Estado.",
    "No hay tecnología, religión, clima ni sucesión dinástica: las cuatro causas clásicas de la caída quedan fuera.",
    "La rebelión es una presión, no una guerra civil: no hay secesión ni mapa que cambie.",
    "Es un modelo didáctico del mecanismo fiscal-militar, no una tesis sobre ningún imperio concreto.",
    "Ninguna cifra de aquí debe citarse como historia: los datos son del motor, no de las fuentes.",
  ],
  presets: [
    { id: "roma", nombre: "Roma en expansión", descripcion: "Administración fuerte, ejército caro, territorio grande.", parametros: { territorio: 160, administracion: 75, agresividad: 45, impuestos: 30, gastoMilitar: 55, cohesion: 60 } },
    { id: "mongol", nombre: "Conquista mongol", descripcion: "Expansión velocísima y administración que no llega.", parametros: { territorio: 60, administracion: 25, agresividad: 95, impuestos: 15, gastoMilitar: 70, cohesion: 30 } },
    { id: "britanico", nombre: "Imperio marítimo", descripcion: "Mucho territorio, mucha administración, cohesión baja.", parametros: { territorio: 220, administracion: 85, agresividad: 40, impuestos: 22, gastoMilitar: 40, cohesion: 24 } },
    { id: "consolidar", nombre: "Consolidar antes de crecer", descripcion: "Poca conquista y mucha institución.", parametros: { territorio: 80, administracion: 80, agresividad: 10, impuestos: 20, gastoMilitar: 25, cohesion: 75 } },
  ],
  init: (p) => ({
    territorio: p.territorio,
    tesoro: 50,
    ejercito: 40,
    legitimidad: 65,
    rebelion: 10,
    anio: 0,
  }),
  step: (e, p, i) => {
    const capacidad = 40 + p.administracion * 1.2;
    const sobre = Math.max(0, e.territorio - capacidad);
    const excedente = Math.pow(e.territorio, 0.85) * 1.6 * (1 - sobre / Math.max(1, capacidad)) ** 0.5;
    const ingresos = excedente * (p.impuestos / 100);
    const costeMilitar = excedente * (p.gastoMilitar / 100) * 0.25;
    const costeAdmin = e.territorio * 0.05 * (0.6 + p.administracion / 100);
    // Conquistar cuesta dinero y se frena cuando el territorio ya excede lo
    // que la administración puede sostener: es la sobrextensión, en vivo.
    const impulso = (p.agresividad / 100) * Math.max(0, e.tesoro) * 0.02 * (e.ejercito / 50);
    const freno = Math.max(0, 1 - sobre / Math.max(1, capacidad * 0.3));
    const conquista = impulso * freno;
    const tesoro = e.tesoro + ingresos - costeMilitar - costeAdmin - conquista * 1.5;
    const perdida = Math.max(0, sobre) * 0.03 + (e.rebelion / 100) * 0.8;
    const territorio = limitar(e.territorio + conquista - perdida, 5, 400);
    const ejercito = limitar(e.ejercito + (p.gastoMilitar - 35) * 0.06 - (e.rebelion / 100) * 0.3, 5, 120);
    const presionFiscal = Math.max(0, p.impuestos - 30) * (1 - p.cohesion / 150);
    const legit = limitar(
      e.legitimidad + (p.cohesion / 100) * 0.5 - presionFiscal * 0.05 - (sobre / Math.max(1, capacidad)) * 3 + (tesoro > 0 ? 0.2 : -1.2),
      0,
      100
    );
    const rebelion = limitar(e.rebelion + (100 - legit) * 0.03 + presionFiscal * 0.05 - (p.gastoMilitar / 100) * 1.4, 0, 100);
    return { territorio, tesoro: limitar(tesoro, -100, 400), ejercito, legitimidad: legit, rebelion, anio: i };
  },
  derivar: (e, p) => ({
    territorio: e.territorio,
    legitimidad: e.legitimidad,
    tesoro: e.tesoro,
    rebelion: e.rebelion,
    sobreextension: (Math.max(0, e.territorio - (40 + p.administracion * 1.2)) / Math.max(1, 40 + p.administracion * 1.2)) * 100,
  }),
  lectura: (e, p, r) => {
    const l = [
      `En ${r.pasos} años el territorio pasa de ${r.inicial.territorio.toFixed(0)} a ${e.territorio.toFixed(0)} y la legitimidad del 65 al ${e.legitimidad.toFixed(0)}.`,
    ];
    const sobre = Math.max(0, e.territorio - (40 + p.administracion * 1.2));
    if (sobre > 20) l.push(`El imperio controla ${sobre.toFixed(0)} puntos de territorio más de lo que su administración puede sostener: eso es la sobrextensión, y en el modelo se paga en legitimidad y en territorio perdido.`);
    if (p.agresividad >= 80 && p.administracion <= 40) l.push("Conquista máxima con administración mínima es la receta mongola: el territorio se toma y se cae, porque no hay instituciones que lo sujeten.");
    if (e.tesoro < 0) l.push("Tesoro en negativo: el ejército se paga con deuda o con más impuestos, y ambas cosas aceleran la rebelión.");
    if (e.rebelion > 60) l.push("Con la presión de rebelión por encima de 60, el modelo entra en la fase de ruptura: pierde territorio cada año aunque gane batallas.");
    if (p.administracion >= 75 && p.agresividad <= 30) l.push("Administrar antes de conquistar da menos mapa y más duración: es la corrida aburrida y también la más estable.");
    return l;
  },
};

// ───────────────────────── 11. RUTAS ─────────────────────────

interface CiudadRuta {
  id: string;
  nombre: string;
  lat: number;
  lng: number;
  /** Peso comercial histórico relativo (supuesto declarado). */
  peso: number;
  /** 1 = está en la ruta terrestre, 0 = solo marítima. */
  tierra: number;
}

const CIUDADES: CiudadRuta[] = [
  { id: "xian", nombre: "Chang'an", lat: 34.3, lng: 108.9, peso: 1.0, tierra: 1 },
  { id: "dunhuang", nombre: "Dunhuang", lat: 40.1, lng: 94.7, peso: 0.7, tierra: 1 },
  { id: "kashgar", nombre: "Kashgar", lat: 39.5, lng: 76.0, peso: 0.7, tierra: 1 },
  { id: "samarcanda", nombre: "Samarcanda", lat: 39.65, lng: 66.96, peso: 0.9, tierra: 1 },
  { id: "merv", nombre: "Merv", lat: 37.66, lng: 62.19, peso: 0.6, tierra: 1 },
  { id: "bagdad", nombre: "Bagdad", lat: 33.3, lng: 44.4, peso: 1.0, tierra: 1 },
  { id: "constantinopla", nombre: "Constantinopla", lat: 41.0, lng: 29.0, peso: 1.1, tierra: 1 },
  { id: "venecia", nombre: "Venecia", lat: 45.44, lng: 12.33, peso: 1.0, tierra: 1 },
  { id: "lisboa", nombre: "Lisboa", lat: 38.72, lng: -9.14, peso: 0.5, tierra: 0 },
  { id: "calicut", nombre: "Calicut", lat: 11.25, lng: 75.78, peso: 0.8, tierra: 0 },
  { id: "malaca", nombre: "Malaca", lat: 2.19, lng: 102.25, peso: 0.9, tierra: 0 },
  { id: "canton", nombre: "Cantón", lat: 23.13, lng: 113.26, peso: 0.9, tierra: 0 },
];

const RUTA_TIERRA: [string, string][] = [
  ["xian", "dunhuang"],
  ["dunhuang", "kashgar"],
  ["kashgar", "samarcanda"],
  ["samarcanda", "merv"],
  ["merv", "bagdad"],
  ["bagdad", "constantinopla"],
  ["constantinopla", "venecia"],
];

const RUTA_MAR: [string, string][] = [
  ["lisboa", "calicut"],
  ["calicut", "malaca"],
  ["malaca", "canton"],
];

export const rutas: ModeloLab = {
  id: "rutas",
  nombre: "Rutas comerciales históricas",
  categoria: "historia",
  pregunta: "¿Qué le hace una ruta nueva a las ciudades de la ruta vieja?",
  resumen:
    "Doce ciudades y dos caminos entre Asia y Europa: la ruta de la seda por tierra y la ruta marítima del cabo de Buena Esperanza. La seguridad, los peajes y el coste deciden por dónde va la mercancía; la prosperidad de cada ciudad sigue al tráfico que la atraviesa.",
  contexto:
    "Durante siglos, la seda y las especias cruzaron Asia por oasis: Chang'an, Samarcanda, Bagdad, Constantinopla, Venecia. En 1498 Vasco da Gama llega a Calicut por mar y el mapa comercial se da la vuelta. Las ciudades de la ruta terrestre no desaparecieron, pero dejaron de ser el centro del mundo. Este laboratorio permite abrir y cerrar esa ruta y ver el reparto.",
  unidadTiempo: "año",
  pasosDefecto: 40,
  pasosMax: 120,
  anioInicial: 1450,
  variables: [
    { id: "seguridad", nombre: "Seguridad de la ruta", unidad: "0-100", min: 5, max: 100, paso: 5, defecto: 65, origen: "eleccion", nota: "Bandidaje, guerras y control de los pasos. Baja el tráfico terrestre." },
    { id: "peajes", nombre: "Peajes y aduanas", unidad: "% del valor", min: 0, max: 60, paso: 2, defecto: 22, origen: "eleccion", nota: "Cada reino que atraviesa la mercancía cobra. Es el gran coste de la ruta terrestre." },
    { id: "rutaMaritima", nombre: "Ruta marítima abierta", unidad: "0-100", min: 0, max: 100, paso: 5, defecto: 0, origen: "eleccion", nota: "0 = solo ruta de la seda. 100 = cabo de Buena Esperanza plenamente operativo (después de 1498)." },
    { id: "demanda", nombre: "Demanda europea", unidad: "índice", min: 20, max: 200, paso: 10, defecto: 100, origen: "supuesto", nota: "Apetito de seda y especias en el extremo occidental." },
    { id: "costeMar", nombre: "Coste del flete marítimo", unidad: "índice", min: 10, max: 150, paso: 5, defecto: 45, origen: "supuesto", nota: "Por unidad de mercancía. En la historia real fue mucho más barato que la caravana." },
  ],
  metricas: [
    { campo: "cuotaMar", nombre: "Cuota marítima", unidad: "% del comercio", formato: "pct", decimales: 1 },
    { campo: "prosperidadMedia", nombre: "Prosperidad media", unidad: "índice 100 = inicio", formato: "indice", decimales: 1 },
    { campo: "venecia", nombre: "Venecia", unidad: "índice", formato: "indice", decimales: 1 },
    { campo: "lisboa", nombre: "Lisboa", unidad: "índice", formato: "indice", decimales: 1 },
    { campo: "samarcanda", nombre: "Samarcanda", unidad: "índice", formato: "indice", decimales: 1 },
  ],
  series: [
    { campo: "cuotaMar", nombre: "Cuota marítima (%)", color: "#7dd3fc", unidad: "%" },
    { campo: "venecia", nombre: "Venecia", color: "#f472b6", unidad: "índice" },
    { campo: "lisboa", nombre: "Lisboa", color: "#fbbf24", unidad: "índice" },
    { campo: "samarcanda", nombre: "Samarcanda", color: "#34d399", unidad: "índice" },
  ],
  reales: [
    { dato: "Llegada de Vasco da Gama a Calicut", valor: "mayo de 1498", fuente: "historiografía de los descubrimientos", donde: "/geografia" },
    { dato: "Ruta de la seda", valor: "activa como red de oasis desde el s. II a. C.", fuente: "historiografía clásica", donde: "/geografia" },
    { dato: "Caída de Constantinopla", valor: "1453", fuente: "historiografía clásica", donde: "/geografia" },
  ],
  supuestos: [
    "El tráfico terrestre es proporcional a la demanda, a la seguridad y al inverso del peaje.",
    "El tráfico marítimo es proporcional a la demanda, al grado de apertura y al inverso del coste del flete.",
    "Cada ciudad captura una parte del tráfico que la atraviesa según su peso histórico.",
    "La prosperidad se deprecia un 3 % al año: si una ruta se cierra, la ciudad decae despacio, no de golpe.",
  ],
  limites: [
    "Doce ciudades y dos corredores: es un esquema, no un mapa comercial completo.",
    "No hay precios, monedas, seguros ni compañías: solo flujo y prosperidad.",
    "Los pesos históricos son supuestos declarados, no cifras de archivo.",
    "No hay consecuencias políticas: en la realidad, perder la ruta llevó a guerras y a imperios.",
    "Que una ciudad caiga en el modelo no significa que cayera en la historia: la historia real tiene mucho más ruido.",
  ],
  presets: [
    { id: "seda", nombre: "Ruta de la seda (s. XV)", descripcion: "Sin ruta marítima, peajes altos, seguridad media.", parametros: { seguridad: 60, peajes: 25, rutaMaritima: 0, demanda: 100 } },
    { id: "gama", nombre: "Después de Vasco da Gama", descripcion: "Ruta marítima operativa y flete barato.", parametros: { seguridad: 50, peajes: 25, rutaMaritima: 85, demanda: 110, costeMar: 30 } },
    { id: "bloqueo", nombre: "Ruta terrestre bloqueada", descripcion: "Guerra en los pasos y peajes abusivos.", parametros: { seguridad: 15, peajes: 50, rutaMaritima: 45, demanda: 100 } },
    { id: "convivencia", nombre: "Dos rutas", descripcion: "Mar y tierra repartiéndose la carga.", parametros: { seguridad: 75, peajes: 12, rutaMaritima: 50, demanda: 120, costeMar: 55 } },
  ],
  init: (p) => {
    const e: Record<string, number> = { anio: 0 };
    for (const c of CIUDADES) e[c.id] = 100;
    return e;
  },
  step: (e, p, i) => {
    const tierra = p.seguridad / 100 / (1 + p.peajes / 60);
    const mar = (p.rutaMaritima / 100) / (p.costeMar / 45);
    const total = Math.max(0.001, tierra + mar);
    const cuotaTierra = tierra / total;
    const cuotaMar = mar / total;
    const siguiente: Record<string, number> = { anio: i };
    for (const c of CIUDADES) {
      const entrada = c.tierra ? cuotaTierra : cuotaMar;
      // El tráfico pasa por la ciudad: su prosperidad tiende al nivel de tráfico.
      const objetivo = 100 * (0.35 + entrada * 1.8) * (p.demanda / 100);
      const actual = e[c.id] ?? 100;
      siguiente[c.id] = limitar(actual * 0.97 + objetivo * 0.03, 1, 400);
    }
    return siguiente;
  },
  derivar: (e, p) => {
    const tierra = p.seguridad / 100 / (1 + p.peajes / 60);
    const mar = (p.rutaMaritima / 100) / (p.costeMar / 45);
    const total = Math.max(0.001, tierra + mar);
    const vals = CIUDADES.map((c) => e[c.id] ?? 100);
    return {
      cuotaMar: (mar / total) * 100,
      prosperidadMedia: vals.reduce((a, b) => a + b, 0) / vals.length,
      venecia: e.venecia ?? 100,
      lisboa: e.lisboa ?? 100,
      samarcanda: e.samarcanda ?? 100,
    };
  },
  mapa: (e, p) => {
    const tierra = p.seguridad / 100 / (1 + p.peajes / 60);
    const mar = (p.rutaMaritima / 100) / (p.costeMar / 45);
    const total = Math.max(0.001, tierra + mar);
    const puntos = CIUDADES.map((c) => ({
      id: c.id,
      lat: c.lat,
      lng: c.lng,
      radio: 3 + ((e[c.id] ?? 100) / 100) * 4,
      color: c.tierra ? "#f472b6" : "#7dd3fc",
      etiqueta: `${c.nombre} · ${(e[c.id] ?? 100).toFixed(0)}`,
    }));
    const rutas = [
      ...RUTA_TIERRA.map(([a, b]) => {
        const A = CIUDADES.find((c) => c.id === a)!;
        const B = CIUDADES.find((c) => c.id === b)!;
        return {
          id: `t-${a}-${b}`,
          from: [A.lat, A.lng] as [number, number],
          to: [B.lat, B.lng] as [number, number],
          color: "#f472b6",
          label: "Ruta de la seda",
          peso: (tierra / total) * 1.2 + 0.08,
        };
      }),
      ...RUTA_MAR.map(([a, b]) => {
        const A = CIUDADES.find((c) => c.id === a)!;
        const B = CIUDADES.find((c) => c.id === b)!;
        return {
          id: `m-${a}-${b}`,
          from: [A.lat, A.lng] as [number, number],
          to: [B.lat, B.lng] as [number, number],
          color: "#7dd3fc",
          label: "Ruta marítima",
          peso: (mar / total) * 1.2 + 0.02,
        };
      }),
    ];
    return {
      puntos,
      rutas,
      nota: "Rutas esquemáticas sobre un mapa real. Los trazos no reproducen caminos históricos: unen ciudades para enseñar el reparto del tráfico.",
    };
  },
  lectura: (e, p, r) => {
    const cuota = p.rutaMaritima > 0 ? (p.rutaMaritima / (p.costeMar / 45)) / (p.rutaMaritima / (p.costeMar / 45) + p.seguridad / (1 + p.peajes / 60)) * 100 : 0;
    const l = [
      `Con estos parámetros, el ${cuota.toFixed(0)} % de la mercancía va por mar y el resto por tierra.`,
      `Venecia queda en ${(e.venecia ?? 100).toFixed(0)} y Lisboa en ${(e.lisboa ?? 100).toFixed(0)}.`,
    ];
    if (cuota > 60) l.push("Una ruta marítima barata se lleva la carga: las ciudades de la ruta terrestre no pierden el comercio de golpe, lo pierden década a década. En el mapa se ve como un cambio de color, no como un corte.");
    if (p.peajes > 35) l.push("Los peajes altos son la razón histórica por la que se buscó el mar: cada aduana encarecía la seda antes de llegar a Europa.");
    if (p.seguridad < 25) l.push("Con la seguridad muy baja, ni el mar ni la tierra mueven mercancía: el modelo se contrae y todas las ciudades caen.");
    if (p.rutaMaritima === 0) l.push("Sin ruta marítima, el comercio es un asunto de oasis y caravanas: es el mundo anterior a 1498.");
    return l;
  },
};
