// ═══════════════════════════════════════════════════════════════════
// v411.0 · LABORATORIOS DE SOCIEDAD
//
//   · demografia   — estructura por edades, fecundidad, longevidad y migración
//   · urbanizacion — el trasvase campo-ciudad y lo que pasa cuando llega más
//                    gente que vivienda
//
// Los totales de población de los presets salen del censo del atlas de la casa
// (dato real, con fuente). La ESTRUCTURA por edades es un supuesto: el atlas no
// guarda pirámides de población, y fingir que sí sería inventar datos.
// ═══════════════════════════════════════════════════════════════════

import type { ModeloLab } from "../tipos";
import { limitar, redondear } from "../tipos";

// ───────────────────────── 5. POBLACIÓN ─────────────────────────

export const demografia: ModeloLab = {
  id: "demografia",
  nombre: "Población y estructura por edades",
  categoria: "demografia",
  pregunta: "¿Qué le pasa a un país que envejece?",
  resumen:
    "Una población partida en tres grupos (0-14, 15-64 y 65+) que envejece un año cada paso. Tú decides la fecundidad, la esperanza de vida y la migración; el modelo devuelve el total, el peso de los mayores y la carga que soporta la población activa.",
  contexto:
    "La transición demográfica es el fenómeno social más predecible de todos: los que nacen hoy tendrán 65 años dentro de 65. Japón pasó del 12 % de mayores al 29 % en tres décadas; Nigeria tiene una media de edad de 18 años. Este laboratorio permite mover esas dos realidades con las mismas reglas y ver el mecanismo que hay detrás: no es la población, es su forma.",
  unidadTiempo: "año",
  pasosDefecto: 50,
  pasosMax: 120,
  anioInicial: 2026,
  variables: [
    { id: "poblacion", nombre: "Población inicial", unidad: "millones", min: 1, max: 1500, paso: 1, defecto: 48, origen: "real", nota: "En los presets viene del atlas (dato real). Si lo mueves a mano, deja de ser un dato y pasa a ser tu escenario." },
    { id: "estructura", nombre: "Estructura de partida", unidad: "0 joven · 100 envejecida", min: 0, max: 100, paso: 1, defecto: 62, origen: "supuesto", nota: "Reparto inicial entre niños, adultos y mayores. Es un supuesto: el atlas no guarda pirámides de población." },
    { id: "fecundidad", nombre: "Fecundidad", unidad: "hijos por mujer", min: 0.8, max: 6.5, paso: 0.1, defecto: 1.3, origen: "eleccion", nota: "Por debajo de 2,1 la población se contrae a largo plazo, sin inmigración." },
    { id: "esperanza", nombre: "Esperanza de vida", unidad: "años", min: 50, max: 95, paso: 1, defecto: 83, origen: "eleccion", nota: "Empuja la mortalidad de todos los grupos, sobre todo de los mayores." },
    { id: "migracion", nombre: "Migración neta", unidad: "por mil habitantes/año", min: -10, max: 20, paso: 1, defecto: 3, origen: "eleccion", nota: "Positiva: llega gente. Negativa: se va. Se reparte entre adultos y niños." },
  ],
  metricas: [
    { campo: "total", nombre: "Población", unidad: "millones", formato: "num", decimales: 1 },
    { campo: "pct65", nombre: "Mayores de 65", unidad: "%", formato: "pct", decimales: 1 },
    { campo: "dependencia", nombre: "Tasa de dependencia", unidad: "% sobre la población activa", formato: "pct", decimales: 1, nota: "(niños + mayores) ÷ adultos × 100. Por encima del 70 % el sistema se tensa." },
    { campo: "activos", nombre: "Población activa", unidad: "millones", formato: "num", decimales: 1 },
  ],
  series: [
    { campo: "total", nombre: "Población total", color: "#fbbf24", unidad: "M" },
    { campo: "pct65", nombre: "% mayores de 65", color: "#f87171", unidad: "%" },
    { campo: "dependencia", nombre: "Dependencia", color: "#7dd3fc", unidad: "%" },
  ],
  reales: [
    { dato: "Población de España", valor: "48,7 millones", fuente: "Atlas de VANGUARD (censo propio, datos hasta 2025)", donde: "/atlas" },
    { dato: "Población de Nigeria", valor: "232 millones", fuente: "Atlas de VANGUARD", donde: "/atlas" },
    { dato: "Población de Japón", valor: "123 millones", fuente: "Atlas de VANGUARD", donde: "/atlas" },
  ],
  supuestos: [
    "La fecundidad se aplica a la mitad de la población adulta (mujeres) repartida en 35 años fértiles.",
    "La mortalidad de cada grupo crece cuando la esperanza de vida es baja; no hay tablas de vida por edad.",
    "Cada año, 1/15 de los niños pasa a adultos y 1/45 de los adultos pasa a mayores.",
    "La migración se reparte 70 % adultos y 30 % niños.",
  ],
  limites: [
    "Tres grupos de edad no son una pirámide: no se ven los efectos de una generación concreta.",
    "No hay mortalidad infantil diferenciada ni estructura por sexo.",
    "No modela epidemias, guerras ni catástrofes: la esperanza de vida es una sola cifra.",
    "La estructura inicial es un supuesto, no un dato: cada país tiene su propia historia.",
    "Un horizonte de 100 años aquí es un ejercicio, no una proyección oficial — para eso están la ONU y el Banco Mundial.",
  ],
  presets: [
    { id: "espana", nombre: "España (dato real)", descripcion: "48,7 M de habitantes, estructura envejecida.", parametros: { poblacion: 48.7, estructura: 78, fecundidad: 1.2, esperanza: 84, migracion: 6 } },
    { id: "nigeria", nombre: "Nigeria (dato real)", descripcion: "232 M, la población más joven del planeta.", parametros: { poblacion: 232, estructura: 8, fecundidad: 5.1, esperanza: 63, migracion: -1 } },
    { id: "japon", nombre: "Japón (dato real)", descripcion: "123 M, el país más envejecido del mundo.", parametros: { poblacion: 123, estructura: 92, fecundidad: 1.2, esperanza: 84, migracion: 1 } },
    { id: "india", nombre: "India (dato real)", descripcion: "1.441 M, transición a media todavía.", parametros: { poblacion: 1441, estructura: 30, fecundidad: 2.0, esperanza: 70, migracion: -1 } },
  ],
  init: (p) => {
    const e = limitar(p.estructura, 0, 100) / 100;
    const share65 = 0.03 + e * 0.29;
    const share15 = 0.52 + e * 0.06;
    const share0 = Math.max(0.05, 1 - share65 - share15);
    return {
      p0: p.poblacion * share0,
      p1: p.poblacion * share15,
      p2: p.poblacion * share65,
      anio: 0,
    };
  },
  step: (e, p, i) => {
    const le = p.esperanza;
    const nacimientos = (e.p1 / 2 / 35) * p.fecundidad;
    const m0 = e.p0 * (0.003 + Math.max(0, 82 - le) * 0.0007);
    const m1 = e.p1 * (0.004 + Math.max(0, 82 - le) * 0.0005);
    const m2 = e.p2 * (0.035 + Math.max(0, 86 - le) * 0.006);
    const paso0 = e.p0 / 15;
    const paso1 = e.p1 / 45;
    const mig = (p.migracion / 1000) * (e.p0 + e.p1 + e.p2);
    const p0 = limitar(e.p0 - paso0 - m0 + nacimientos + mig * 0.3, 0.01, 5000);
    const p1 = limitar(e.p1 + paso0 - paso1 - m1 + mig * 0.7, 0.01, 5000);
    const p2 = limitar(e.p2 + paso1 - m2, 0.01, 5000);
    return { p0, p1, p2, anio: i };
  },
  derivar: (e) => {
    const total = e.p0 + e.p1 + e.p2;
    return {
      total,
      activos: e.p1,
      pct65: total > 0 ? (e.p2 / total) * 100 : 0,
      pct15: total > 0 ? (e.p0 / total) * 100 : 0,
      dependencia: e.p1 > 0 ? ((e.p0 + e.p2) / e.p1) * 100 : 0,
    };
  },
  lectura: (e, p, r) => {
    const total = e.p0 + e.p1 + e.p2;
    const pct = (e.p2 / total) * 100;
    const dep = ((e.p0 + e.p2) / e.p1) * 100;
    const l = [
      `Con fecundidad de ${p.fecundidad} hijos por mujer y ${p.esperanza} años de esperanza de vida, la población pasa de ${p.poblacion.toFixed(1)} a ${total.toFixed(1)} millones en ${r.pasos} años.`,
      `Los mayores de 65 pasan a ser el ${pct.toFixed(1)} % y la dependencia queda en el ${dep.toFixed(0)} %.`,
    ];
    if (p.fecundidad < 2.1 && p.migracion < 1) l.push("Por debajo de 2,1 hijos por mujer y sin inmigración, la población se contrae: el modelo lo hace visible a partir de la segunda década.");
    if (pct > 28) l.push("Por encima del 28 % de mayores, cada adulto sostiene a más de un dependiente: es el punto donde el gasto sanitario y las pensiones cambian de régimen.");
    if (pct < 10 && p.fecundidad > 3.5) l.push("La estructura es muy joven: hay mucho capital humano por formar y presión fuerte sobre escuelas y empleo.");
    if (p.migracion >= 10) l.push("Una migración de 10 por mil al año solo compensa la caída si se mantiene durante décadas; no es una solución de un año.");
    return l;
  },
};

// ───────────────────────── 6. URBANIZACIÓN ─────────────────────────

export const urbanizacion: ModeloLab = {
  id: "urbanizacion",
  nombre: "Urbanización y ciudades",
  categoria: "demografia",
  pregunta: "¿Qué pasa si la ciudad crece más rápido que la vivienda?",
  resumen:
    "Dos poblaciones —campo y ciudad— y un parque de vivienda que se construye despacio. La gente se mueve por la diferencia de salario; si llega más gente de la que hay techo, aparece el asentamiento informal y cae la productividad urbana.",
  contexto:
    "Más de la mitad de la humanidad vive en ciudades y en África y Asia la urbanización va por delante de la obra pública. Lagos, Kinsasa o Karachi crecen varios cientos de miles de personas al año. Cuando la vivienda formal no llega, la ciudad no deja de crecer: cambia de forma. Ese es el mecanismo que este laboratorio pone a la vista.",
  unidadTiempo: "año",
  pasosDefecto: 30,
  pasosMax: 80,
  anioInicial: 2026,
  variables: [
    { id: "ruralInicial", nombre: "Población rural inicial", unidad: "%", min: 5, max: 90, paso: 1, defecto: 55, origen: "supuesto", nota: "Punto de partida del país." },
    { id: "poblacion", nombre: "Población total", unidad: "millones", min: 1, max: 400, paso: 1, defecto: 40, origen: "eleccion", nota: "Tamaño del sistema." },
    { id: "productividadAgr", nombre: "Productividad agrícola", unidad: "índice", min: 20, max: 200, paso: 5, defecto: 60, origen: "eleccion", nota: "Si el campo produce más, expulsa menos gente." },
    { id: "inversionVivienda", nombre: "Inversión en vivienda", unidad: "% del PIB urbano", min: 0, max: 12, paso: 0.5, defecto: 3, origen: "eleccion", nota: "Lo que se construye cada año." },
    { id: "regulacion", nombre: "Coste regulatorio del suelo", unidad: "0-100", min: 0, max: 100, paso: 5, defecto: 45, origen: "eleccion", nota: "Trabas y precio del suelo: encarece construir y frena la entrada." },
    { id: "transporte", nombre: "Transporte urbano", unidad: "0-100", min: 0, max: 100, paso: 5, defecto: 40, origen: "eleccion", nota: "Permite que la ciudad se extienda sin colapsar." },
  ],
  metricas: [
    { campo: "pctUrbano", nombre: "Población urbana", unidad: "%", formato: "pct", decimales: 1 },
    { campo: "deficit", nombre: "Déficit de vivienda", unidad: "% de la población urbana", formato: "pct", decimales: 1 },
    { campo: "informal", nombre: "Vivienda informal", unidad: "% del parque", formato: "pct", decimales: 1 },
    { campo: "productividad", nombre: "Productividad urbana", unidad: "índice 100 = inicio", formato: "indice", decimales: 1 },
  ],
  series: [
    { campo: "pctUrbano", nombre: "% urbano", color: "#fbbf24", unidad: "%" },
    { campo: "deficit", nombre: "Déficit de vivienda", color: "#f87171", unidad: "%" },
    { campo: "informal", nombre: "Vivienda informal", color: "#f472b6", unidad: "%" },
    { campo: "productividad", nombre: "Productividad urbana", color: "#34d399", unidad: "índice" },
  ],
  reales: [
    { dato: "Población urbana mundial", valor: "~57 % en 2024", fuente: "ONU-Hábitat / Banco Mundial", donde: "/pulso-mundial" },
    { dato: "Habitantes de Lagos", valor: "más de 15 millones en el área metropolitana", fuente: "estimaciones ONU", donde: "/atlas" },
  ],
  supuestos: [
    "El salario urbano dobla al rural por unidad de productividad: es la fuerza que empuja la migración.",
    "Cada punto de inversión construye vivienda, que se deprecia un 2 % anual.",
    "Una vivienda aloja a 5 personas; por encima de esa capacidad aparece el déficit.",
    "La productividad urbana cae cuando crece la informalidad y mejora con el transporte.",
  ],
  limites: [
    "Una sola ciudad agregada: no hay jerarquía urbana ni ciudades secundarias.",
    "No hay suelo como mercado ni precios de alquiler explícitos.",
    "La informalidad se mide como déficit de vivienda, no como empleo.",
    "No incluye migración internacional: eso vive en el laboratorio de población.",
    "No es un plan urbanístico: es la tensión entre dos velocidades, la de la gente y la del ladrillo.",
  ],
  presets: [
    { id: "exodo", nombre: "Éxodo rural", descripcion: "Campo pobre y ciudad que absorbe sin planificar.", parametros: { ruralInicial: 70, productividadAgr: 40, inversionVivienda: 2, regulacion: 60 } },
    { id: "planificada", nombre: "Ciudad planificada", descripcion: "Inversión alta, transporte y reglas claras.", parametros: { ruralInicial: 40, productividadAgr: 100, inversionVivienda: 8, regulacion: 25, transporte: 80 } },
    { id: "saturada", nombre: "Metrópoli saturada", descripcion: "Casi todo urbano, poco margen de obra.", parametros: { ruralInicial: 12, productividadAgr: 150, inversionVivienda: 1.5, regulacion: 80, transporte: 30 } },
  ],
  init: (p) => ({
    rural: p.poblacion * (p.ruralInicial / 100),
    urbano: p.poblacion * (1 - p.ruralInicial / 100),
    vivienda: p.poblacion * (1 - p.ruralInicial / 100) / 5,
    informal: 0,
    anio: 0,
  }),
  step: (e, p, i) => {
    const salarioUrb = 100 * (1 + p.transporte / 400) / (1 + e.informal / 200);
    const salarioRural = p.productividadAgr;
    const brecha = (salarioUrb - salarioRural) / 100;
    const migracion = Math.max(0, brecha) * e.rural * 0.02 * (1 - p.regulacion / 220);
    const rural = limitar(e.rural - migracion, 0.1, 5000);
    const urbano = e.urbano + migracion + e.urbano * 0.012;
    const vivienda = e.vivienda * 0.98 + (p.inversionVivienda / 100) * urbano * 0.16;
    const capacidad = vivienda * 5;
    const exceso = Math.max(0, urbano - capacidad);
    const informal = limitar((exceso / Math.max(1, urbano)) * 100, 0, 90);
    return { rural, urbano, vivienda, informal, anio: i };
  },
  derivar: (e, p) => {
    const total = e.rural + e.urbano;
    const capacidad = e.vivienda * 5;
    const deficit = total > 0 ? (Math.max(0, e.urbano - capacidad) / e.urbano) * 100 : 0;
    return {
      pctUrbano: total > 0 ? (e.urbano / total) * 100 : 0,
      deficit,
      informal: e.informal,
      productividad: ((1 + p.transporte / 400) / (1 + e.informal / 200)) * 100,
      poblacion: total,
    };
  },
  lectura: (e, p, r) => {
    const total = e.rural + e.urbano;
    const pct = (e.urbano / total) * 100;
    const l = [
      `La población urbana pasa del ${(r.inicial.urbano / (r.inicial.rural + r.inicial.urbano) * 100).toFixed(0)} % al ${pct.toFixed(0)} % en ${r.pasos} años.`,
    ];
    if (e.informal > 30) l.push(`Con el ${e.informal.toFixed(0)} % de la vivienda en informalidad, el modelo dice lo que ya se ve en las ciudades reales: la gente llega y la ciudad se construye sin plano.`);
    if (p.inversionVivienda <= 2 && p.ruralInicial >= 60) l.push("Inversión en vivienda por debajo del 2 % con un campo expulsando gente: el déficit solo puede crecer.");
    if (p.regulacion >= 70) l.push("Un coste regulatorio muy alto frena la construcción formal y empuja la ciudad hacia fuera del mercado.");
    if (p.transporte >= 70) l.push("El transporte alto permite que la ciudad crezca en extensión sin colapsar: es la variable que más cambia el resultado.");
    return l;
  },
};

// ───────────────────────── 15. ACOPLE ECONOMÍA ↔ DEMOGRAFÍA ─────────────────────────

export const acople: ModeloLab = {
  id: "acople",
  nombre: "Economía y población acopladas",
  categoria: "demografia",
  pregunta: "¿Qué pasa cuando el crecimiento depende de la gente que hay?",
  resumen:
    "Aquí no se simula una cosa: se simulan dos que se necesitan. La economía produce con capital y trabajadores; la población cambia con la renta, la salud y la fecundidad; y el reparto por edades decide cuántos producen y cuántos dependen. Mueve el ahorro o la salud y mira el otro lado del sistema.",
  contexto:
    "La transición demográfica y el crecimiento económico se empujan mutuamente. Más renta baja la fecundidad; menos fecundidad deja más mujeres trabajando y más ahorro por hogar; más salud alarga la vida y sube la factura de las pensiones. Ningún país eligió ese mecanismo: le pasó. Este laboratorio es el único de la casa donde dos modelos se calculan a la vez.",
  unidadTiempo: "año",
  pasosDefecto: 60,
  pasosMax: 120,
  anioInicial: 2026,
  variables: [
    { id: "ahorro", nombre: "Tasa de ahorro", unidad: "% del PIB", min: 5, max: 45, paso: 1, defecto: 22, origen: "eleccion", nota: "Lo que no se consume se convierte en capital nuevo." },
    { id: "salud", nombre: "Gasto en salud", unidad: "% del PIB", min: 1, max: 18, paso: 0.5, defecto: 6, origen: "eleccion", nota: "Alarga la vida… y aumenta los años de dependencia." },
    { id: "educacion", nombre: "Gasto en educación", unidad: "% del PIB", min: 1, max: 15, paso: 0.5, defecto: 4.5, origen: "eleccion", nota: "Es la palanca lenta: mueve la productividad con décadas de retraso." },
    { id: "apertura", nombre: "Apertura", unidad: "0-100", min: 0, max: 100, paso: 5, defecto: 45, origen: "eleccion", nota: "Importa tecnología y presiona a las empresas locales." },
    { id: "fecundidad", nombre: "Fecundidad de partida", unidad: "hijos por mujer", min: 1, max: 6.5, paso: 0.1, defecto: 3.4, origen: "supuesto", nota: "Punto de salida. Después el modelo la mueve según la renta." },
    { id: "esperanza", nombre: "Esperanza de vida inicial", unidad: "años", min: 45, max: 88, paso: 1, defecto: 68, origen: "supuesto", nota: "Punto de salida; la salud la empuja o la deja quieta." },
    { id: "migracion", nombre: "Migración neta", unidad: "por mil/año", min: -8, max: 15, paso: 1, defecto: 0, origen: "eleccion", nota: "Alivia o agrava la dependencia según quién llegue." },
  ],
  metricas: [
    { campo: "pibpc", nombre: "Renta por habitante", unidad: "índice 100 = inicio", formato: "indice", decimales: 1 },
    { campo: "poblacion", nombre: "Población", unidad: "índice 100 = inicio", formato: "indice", decimales: 1 },
    { campo: "activos", nombre: "Población activa", unidad: "% del total", formato: "pct", decimales: 1 },
    { campo: "fecundidad", nombre: "Fecundidad", unidad: "hijos por mujer", formato: "decimal", decimales: 2 },
    { campo: "esperanza", nombre: "Esperanza de vida", unidad: "años", formato: "num", decimales: 1 },
  ],
  series: [
    { campo: "pibpc", nombre: "Renta por habitante", color: "#34d399", unidad: "índice" },
    { campo: "poblacion", nombre: "Población", color: "#fbbf24", unidad: "índice" },
    { campo: "fecundidad", nombre: "Fecundidad", color: "#f472b6", unidad: "hijos" },
    { campo: "esperanza", nombre: "Esperanza de vida", color: "#7dd3fc", unidad: "años" },
  ],
  reales: [
    { dato: "Fecundidad mundial", valor: "≈ 2,2 hijos por mujer (2024)", fuente: "ONU, World Population Prospects", donde: "/pulso-mundial" },
    { dato: "Esperanza de vida mundial", valor: "≈ 73 años", fuente: "OMS / ONU", donde: "/pulso-mundial" },
    { dato: "Población en edad de trabajar", valor: "≈ 65 % del total mundial", fuente: "ONU", donde: "/atlas" },
  ],
  supuestos: [
    "Producción Cobb-Douglas con capital (0,32) y trabajadores (0,68).",
    "La proporción de población activa sube con la esperanza de vida y baja con la fecundidad.",
    "La fecundidad converge hacia un objetivo que cae con la renta por habitante: es la transición demográfica, en una línea.",
    "La esperanza de vida responde al gasto sanitario con saturación en 88 años.",
    "La educación mueve la productividad un 2 % anual por punto de gasto, con retraso acumulativo.",
  ],
  limites: [
    "Dos ecuaciones acopladas no son un modelo macroeconómico ni demográfico: son un mecanismo.",
    "No hay estructura por edades fina: una sola proporción de activos resume la pirámide.",
    "No hay pensiones, sistema sanitario ni mercado de trabajo: la dependencia es una ratio, no una factura.",
    "La fecundidad responde a la renta media, no a decisiones individuales ni a políticas de familia.",
    "El acoplamiento amplifica errores: si el supuesto demográfico falla, la economía también. Por eso se compara, no se cree.",
  ],
  presets: [
    { id: "transicion", nombre: "Transición clásica", descripcion: "Renta que sube, fecundidad que baja, vida que se alarga.", parametros: { ahorro: 28, salud: 6, educacion: 5, apertura: 55, fecundidad: 4.5, esperanza: 62 } },
    { id: "envejecida", nombre: "Sociedad envejecida", descripcion: "Poca fecundidad y mucha salud: menos activos.", parametros: { ahorro: 24, salud: 11, educacion: 5.5, fecundidad: 1.3, esperanza: 84 } },
    { id: "trampa", nombre: "Trampa de renta baja", descripcion: "Ahorro bajo y educación baja: la renta no arranca.", parametros: { ahorro: 8, salud: 2, educacion: 2, apertura: 20, fecundidad: 5.5, esperanza: 55 } },
    { id: "migracion", nombre: "Alivio migratorio", descripcion: "País envejecido que recibe población activa.", parametros: { ahorro: 24, salud: 9, educacion: 6, fecundidad: 1.4, esperanza: 82, migracion: 9 } },
  ],
  init: (p) => ({
    k: 100,
    a: 1,
    pob: 100,
    fert: p.fecundidad,
    esperanza: p.esperanza,
    anio: 0,
  }),
  step: (e, p, i) => {
    const activosPct = limitar(0.62 - e.fert * 0.045 + (e.esperanza - 70) * 0.0015, 0.32, 0.7);
    const activos = e.pob * activosPct;
    const y = e.a * Math.pow(e.k, 0.32) * Math.pow(Math.max(1, activos), 0.68);
    const ypc = y / Math.max(1, e.pob);
    const k = e.k * 0.95 + (p.ahorro / 100) * y;
    const a = e.a * (1 + (p.educacion / 100) * 0.02 + (p.apertura / 100) * 0.006 - 0.0015);
    const esperanza = limitar(e.esperanza + (p.salud - 3) * 0.09 * (1 - e.esperanza / 92), 40, 92);
    // La renta se mide en múltiplos de la subsistencia: así la transición
    // demográfica depende del nivel absoluto, no de un índice interno.
    const rentaMult = ypc * 6.5;
    const objetivoFert = limitar(6.8 - 2.6 * Math.log(Math.max(0.4, rentaMult)), 1.05, 6.4);
    // Bajar la fecundidad es rápido; recuperarla, lentísimo: por eso una
    // sociedad que ya está por debajo del objetivo apenas rebota.
    const ritmo = objetivoFert > e.fert ? 0.02 : 0.06;
    const fert = limitar(e.fert + (objetivoFert - e.fert) * ritmo, 0.8, 6.5);
    const crecimiento = (fert - 2.05) * 0.013 - (esperanza - 70) * 0.0002 + p.migracion / 1000;
    const pob = limitar(e.pob * (1 + crecimiento), 5, 2000);
    return { k, a, pob, fert, esperanza, anio: i };
  },
  derivar: (e, p) => {
    const activosPct = limitar(0.62 - e.fert * 0.045 + (e.esperanza - 70) * 0.0015, 0.32, 0.7);
    const activos = e.pob * activosPct;
    const y = e.a * Math.pow(e.k, 0.32) * Math.pow(Math.max(1, activos), 0.68);
    const y0 = 1 * Math.pow(100, 0.32) * Math.pow(Math.max(1, 100 * limitar(0.62 - p.fecundidad * 0.045 + (p.esperanza - 70) * 0.0015, 0.32, 0.7)), 0.68);
    return {
      pibpc: (y / Math.max(1, e.pob) / (y0 / 100)) * 100,
      poblacion: e.pob,
      activos: activosPct * 100,
      fecundidad: e.fert,
      esperanza: e.esperanza,
      dependencia: ((1 - activosPct) / activosPct) * 100,
    };
  },
  lectura: (e, p, r) => {
    const activosPct = limitar(0.62 - e.fert * 0.045 + (e.esperanza - 70) * 0.0015, 0.32, 0.7);
    const dep = ((1 - activosPct) / activosPct) * 100;
    const l = [
      `En ${r.pasos} años la fecundidad pasa de ${p.fecundidad} a ${e.fert.toFixed(2)} y la esperanza de vida de ${p.esperanza} a ${e.esperanza.toFixed(0)} años.`,
      `La población activa queda en el ${(activosPct * 100).toFixed(0)} % del total y la dependencia en el ${dep.toFixed(0)} %.`,
    ];
    if (e.fert < 1.6 && e.esperanza > 80) l.push("Fecundidad muy baja y vida muy larga: el modelo entra en el régimen de pocos activos y muchos años de dependencia. No es una anomalía, es la aritmética de dos curvas.");
    if (p.salud >= 10 && e.fert < 2.1) l.push("Subir salud sin subir fecundidad alarga la vida y agrava la dependencia: dos objetivos legítimos que se pelean.");
    if (p.educacion <= 2.5 && p.ahorro <= 10) l.push("Educación y ahorro por el suelo: la renta no arranca y la fecundidad se queda alta. Es la trampa que el modelo reproduce sin necesidad de malicia.");
    if (p.migracion >= 8) l.push("La migración alta alivia la dependencia… si los que llegan son adultos. El modelo lo hace explícito: cambia el reparto, no solo el total.");
    return l;
  },
};
