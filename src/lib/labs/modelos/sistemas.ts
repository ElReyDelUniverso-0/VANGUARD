// ═══════════════════════════════════════════════════════════════════
// v411.0 · LABORATORIOS DE SISTEMAS COMPLEJOS
//
//   · red        — una red eléctrica que se cae en cascada
//   · energia    — mezcla de generación, almacenamiento y fiabilidad
//   · transporte — reparto modal, congestión y emisiones de una ciudad
//
// El hilo común: aquí no se simula una variable, se simula una ESTRUCTURA.
// El resultado depende de cómo están conectadas las piezas, no solo de cuántas
// hay. Es la diferencia entre un modelo y un sistema.
// ═══════════════════════════════════════════════════════════════════

import type { ModeloLab } from "../tipos";
import { limitar, redondear, ruido } from "../tipos";

// ───────────────────────── 12. RED ─────────────────────────

/** 9 nodos en anillo con dos cuerdas: una red pequeña pero no trivial. */
const NODOS_RED = 9;
const ENLACES: [number, number][] = (() => {
  const e: [number, number][] = [];
  for (let i = 0; i < NODOS_RED; i++) e.push([i, (i + 1) % NODOS_RED]);
  e.push([0, 4], [2, 6], [1, 7]);
  return e;
})();

export const red: ModeloLab = {
  id: "red",
  nombre: "Red en cascada",
  categoria: "sistemas",
  pregunta: "¿Cómo un fallo pequeño apaga una ciudad entera?",
  resumen:
    "Nueve nodos conectados en anillo con tres atajos. La demanda crece, la capacidad se amplía y el mantenimiento decide cuánta se pierde. Cuando un nodo se sobrecarga, su carga salta a los vecinos: si hay redundancia, la red aguanta; si no, el apagón se propaga.",
  contexto:
    "El 14 de agosto de 2003, una línea caída en Ohio dejó a 55 millones de personas sin luz en el noreste de Estados Unidos y Canadá en cuatro minutos. No falló la generación: falló la topología. Este laboratorio hace visible la diferencia entre una red redundante y una red eficiente, que no son lo mismo.",
  unidadTiempo: "año",
  pasosDefecto: 25,
  pasosMax: 60,
  anioInicial: 2026,
  variables: [
    { id: "demanda", nombre: "Crecimiento de la demanda", unidad: "% anual", min: 0, max: 8, paso: 0.5, defecto: 2.5, origen: "eleccion", nota: "Cuánto crece la carga cada año." },
    { id: "ampliacion", nombre: "Ampliación de capacidad", unidad: "% anual", min: 0, max: 8, paso: 0.5, defecto: 2, origen: "eleccion", nota: "Inversión en nueva capacidad. Si va por debajo de la demanda, la red se tensa." },
    { id: "mantenimiento", nombre: "Mantenimiento", unidad: "0-100", min: 0, max: 100, paso: 5, defecto: 55, origen: "eleccion", nota: "Reduce la probabilidad de que un nodo falle por sí solo." },
    { id: "redundancia", nombre: "Redundancia", unidad: "0-100", min: 0, max: 100, paso: 5, defecto: 40, origen: "eleccion", nota: "Enlaces y respaldo. Cuesta dinero y no produce nada hasta el día que hace falta." },
    { id: "acoplamiento", nombre: "Acoplamiento entre nodos", unidad: "0-100", min: 10, max: 100, paso: 5, defecto: 70, origen: "supuesto", nota: "Cuánta carga se transfiere al vecino cuando un nodo cae. Alto = más eficiente y más frágil." },
  ],
  metricas: [
    { campo: "conectividad", nombre: "Conectividad", unidad: "% de nodos en servicio", formato: "pct", decimales: 0 },
    { campo: "cascada", nombre: "Mayor cascada", unidad: "nodos caídos", formato: "num", decimales: 0, nota: "El peor apagón de la corrida." },
    { campo: "margen", nombre: "Margen de la red", unidad: "% de capacidad libre", formato: "pct", decimales: 1 },
    { campo: "apagones", nombre: "Apagones acumulados", unidad: "eventos", formato: "num", decimales: 0 },
  ],
  series: [
    { campo: "conectividad", nombre: "Conectividad (%)", color: "#c084fc", unidad: "%" },
    { campo: "margen", nombre: "Margen (%)", color: "#34d399", unidad: "%" },
    { campo: "cascada", nombre: "Cascada (nodos)", color: "#f87171", unidad: "nodos" },
  ],
  reales: [
    { dato: "Apagón del noreste de EE. UU. y Canadá", valor: "14 de agosto de 2003, ~55 millones de afectados", fuente: "U.S.-Canada Power System Outage Task Force", donde: "/en-vivo" },
    { dato: "Apagón de la península ibérica", valor: "28 de abril de 2025", fuente: "informes del operador del sistema", donde: "/geografia" },
  ],
  supuestos: [
    "Cada nodo tiene la misma capacidad inicial y la demanda se reparte por igual.",
    "Un nodo cae cuando su carga supera su capacidad; su carga se reparte entre los vecinos que siguen en pie.",
    "El acoplamiento decide cuánta carga se transfiere; la redundancia, cuánta capacidad de respaldo hay.",
    "Sin mantenimiento, cada año hay un 12 % de probabilidad de fallo inicial en algún nodo.",
  ],
  limites: [
    "Nueve nodos no son una red nacional: no hay líneas, tensiones, ni flujos físicos.",
    "No hay mercado eléctrico, ni precios, ni generación distribuida.",
    "El fallo inicial es aleatorio con semilla, pero la cascada es determinista: no captura la incertidumbre real de un operador.",
    "No modela ciberataques, clima extremo ni mantenimiento programado.",
    "Es una lección de topología, no un simulador de operación de red.",
  ],
  presets: [
    { id: "frágil", nombre: "Red eficiente y frágil", descripcion: "Sin redundancia, demanda al alza.", parametros: { redundancia: 5, mantenimiento: 35, ampliacion: 1, acoplamiento: 90 } },
    { id: "robusta", nombre: "Red redundante", descripcion: "Mucho respaldo y mantenimiento.", parametros: { redundancia: 80, mantenimiento: 80, ampliacion: 3.5, acoplamiento: 45 } },
    { id: "colapso", nombre: "Crecimiento sin inversión", descripcion: "La demanda sube y la capacidad se queda.", parametros: { demanda: 6, ampliacion: 0.5, mantenimiento: 40, redundancia: 20 } },
  ],
  init: (p) => {
    const e: Record<string, number> = { anio: 0 };
    for (let i = 0; i < NODOS_RED; i++) {
      e[`carga${i}`] = 70;
      e[`cap${i}`] = 110;
      e[`vivo${i}`] = 1;
    }
    return e;
  },
  step: (e, p, i, semilla) => {
    const s: Record<string, number> = { anio: i };
    const carga: number[] = [];
    const cap: number[] = [];
    const vivo: number[] = [];
    for (let n = 0; n < NODOS_RED; n++) {
      carga[n] = (e[`carga${n}`] ?? 70) * (1 + p.demanda / 100);
      cap[n] = (e[`cap${n}`] ?? 110) * (1 + p.ampliacion / 100);
      vivo[n] = e[`vivo${n}`] ?? 1;
    }
    // Fallo espontáneo (depende del mantenimiento y de la semilla).
    const prob = 0.12 * (1 - p.mantenimiento / 100);
    const r = ruido(semilla, i, 7);
    const falloInicial = r < prob ? Math.floor(ruido(semilla, i, 11) * NODOS_RED) : -1;
    if (falloInicial >= 0) vivo[falloInicial] = 0;
    // Cascada: mientras haya un nodo por encima de su capacidad, cae y reparte.
    let caidos = falloInicial >= 0 ? 1 : 0;
    for (let ronda = 0; ronda < NODOS_RED; ronda++) {
      let peor = -1;
      for (let n = 0; n < NODOS_RED; n++) if (vivo[n] === 1 && carga[n] > cap[n]) peor = n;
      if (peor < 0) break;
      vivo[peor] = 0;
      caidos += 1;
      const vecinos = ENLACES.filter(([a, b]) => a === peor || b === peor).map(([a, b]) => (a === peor ? b : a));
      const activos = vecinos.filter((v) => vivo[v] === 1);
      const sobra = (carga[peor] - cap[peor]) * (p.acoplamiento / 100);
      for (const v of activos) carga[v] += sobra / activos.length / (1 + p.redundancia / 55);
      carga[peor] = 0;
    }
    for (let n = 0; n < NODOS_RED; n++) {
      s[`carga${n}`] = vivo[n] ? carga[n] : 0;
      s[`cap${n}`] = cap[n];
      s[`vivo${n}`] = vivo[n];
    }
    // Recuperación: los nodos caídos vuelven al año siguiente, más despacio si no hay mantenimiento.
    const recupera = 0.5 + p.mantenimiento / 200;
    for (let n = 0; n < NODOS_RED; n++) {
      if (!s[`vivo${n}`] && ruido(semilla, i, 20 + n) < recupera) {
        s[`vivo${n}`] = 1;
        s[`carga${n}`] = 50;
      }
    }
    // Peor cascada de la corrida.
    const heredada = e.peorCascada ?? 0;
    s.peorCascada = Math.max(heredada, caidos);
    s.apagones = (e.apagones ?? 0) + (caidos > 1 ? 1 : 0);
    return s;
  },
  derivar: (e) => {
    let vivos = 0;
    let libre = 0;
    let total = 0;
    for (let n = 0; n < NODOS_RED; n++) {
      if (e[`vivo${n}`]) vivos += 1;
      libre += Math.max(0, (e[`cap${n}`] ?? 0) - (e[`carga${n}`] ?? 0));
      total += e[`cap${n}`] ?? 0;
    }
    return {
      conectividad: (vivos / NODOS_RED) * 100,
      margen: total > 0 ? (libre / total) * 100 : 0,
      cascada: e.peorCascada ?? 0,
      apagones: e.apagones ?? 0,
    };
  },
  lectura: (e, p, r) => {
    const vivos = Array.from({ length: NODOS_RED }, (_, n) => e[`vivo${n}`] ?? 1).filter((v) => v === 1).length;
    const margen = (() => {
      let libre = 0;
      let total = 0;
      for (let n = 0; n < NODOS_RED; n++) {
        libre += Math.max(0, (e[`cap${n}`] ?? 0) - (e[`carga${n}`] ?? 0));
        total += e[`cap${n}`] ?? 0;
      }
      return total > 0 ? (libre / total) * 100 : 0;
    })();
    const l = [
      `Con ${p.mantenimiento} de mantenimiento y ${p.redundancia} de redundancia, quedan ${vivos} de ${NODOS_RED} nodos en servicio y un margen del ${margen.toFixed(1)} %.`,
      `El peor apagón de la corrida se llevó ${(e.peorCascada ?? 0).toFixed(0)} nodos.`,
    ];
    if (p.redundancia < 25 && p.acoplamiento > 70) l.push("Red eficiente y acoplada: es la combinación más barata de construir y la que convierte un fallo local en un apagón regional.");
    if (margen < 8) l.push("Con menos del 8 % de margen, cualquier calor, avería o pico de demanda se come la reserva. Es el punto donde los operadores empiezan a cortar por turnos.");
    if (p.ampliacion < p.demanda) l.push("La capacidad crece por debajo de la demanda: el margen se cierra solo, año tras año, sin que nadie tome ninguna decisión.");
    if (p.redundancia >= 70) l.push("La redundancia cuesta y no se nota hasta el día del fallo: es la definición exacta de inversión en resiliencia.");
    return l;
  },
};

// ───────────────────────── 13. ENERGÍA ─────────────────────────

export const energia: ModeloLab = {
  id: "energia",
  nombre: "Mezcla energética",
  categoria: "sistemas",
  pregunta: "¿Se puede bajar el carbón sin apagar la luz?",
  resumen:
    "Una demanda que crece, tres tecnologías que se construyen y se retiran, y un almacenamiento que decide si la renovable variable sirve. El modelo calcula emisiones, coste medio y energía no suministrada: la factura de elegir una mezcla.",
  contexto:
    "La electricidad es el 20 % de la energía final del mundo y tiene que crecer para descarbonizar el resto. El problema no es que falte sol: es que no está de noche. Este laboratorio enseña por qué el almacenamiento y la red valen tanto como los paneles, y por qué cerrar el carbón demasiado rápido sin respaldo tiene un coste que se paga en apagones.",
  unidadTiempo: "año",
  pasosDefecto: 30,
  pasosMax: 60,
  anioInicial: 2026,
  variables: [
    { id: "demandaInicial", nombre: "Demanda inicial", unidad: "TWh/año", min: 20, max: 4000, paso: 20, defecto: 250, origen: "eleccion", nota: "Tamaño del sistema eléctrico." },
    { id: "crecimiento", nombre: "Crecimiento de la demanda", unidad: "% anual", min: -2, max: 6, paso: 0.5, defecto: 1.5, origen: "eleccion", nota: "Electrificar transporte y calor sube esta cifra." },
    { id: "renovable", nombre: "Construcción renovable", unidad: "TWh/año de nueva capacidad", min: 0, max: 80, paso: 2, defecto: 18, origen: "eleccion", nota: "Solar y eólica. Producen según el recurso, no según la demanda." },
    { id: "fosil", nombre: "Construcción fósil", unidad: "TWh/año de nueva capacidad", min: 0, max: 60, paso: 2, defecto: 10, origen: "eleccion", nota: "Respaldo firme y emisiones." },
    { id: "almacenamiento", nombre: "Almacenamiento", unidad: "% de la demanda que cubre", min: 0, max: 40, paso: 2, defecto: 8, origen: "eleccion", nota: "Baterías y bombeo. Sin esto, la renovable no sustituye a la fósil de noche." },
    { id: "factorSolar", nombre: "Factor de capacidad renovable", unidad: "%", min: 15, max: 50, paso: 1, defecto: 28, origen: "supuesto", nota: "Cuánto produce de media una instalación respecto a su máximo. Depende del sitio." },
    { id: "precioFosil", nombre: "Precio del combustible", unidad: "índice", min: 30, max: 200, paso: 5, defecto: 100, origen: "supuesto", nota: "Encarece la generación fósil y por tanto el coste medio." },
  ],
  metricas: [
    { campo: "emisiones", nombre: "Emisiones", unidad: "MtCO₂/año", formato: "num", decimales: 1 },
    { campo: "coste", nombre: "Coste medio", unidad: "índice 100 = inicio", formato: "indice", decimales: 1 },
    { campo: "renovablePct", nombre: "Renovable", unidad: "% de la generación", formato: "pct", decimales: 1 },
    { campo: "noSuministrada", nombre: "Energía no suministrada", unidad: "% de la demanda", formato: "pct", decimales: 2 },
  ],
  series: [
    { campo: "renovablePct", nombre: "Renovable (%)", color: "#34d399", unidad: "%" },
    { campo: "emisiones", nombre: "Emisiones (Mt)", color: "#f87171", unidad: "Mt" },
    { campo: "noSuministrada", nombre: "No suministrada (%)", color: "#fbbf24", unidad: "%" },
  ],
  reales: [
    { dato: "Electricidad en la energía final mundial", valor: "≈ 20 %", fuente: "AIE, World Energy Outlook", donde: "/pulso-mundial" },
    { dato: "Factor de capacidad solar típico", valor: "15-25 % según latitud", fuente: "IRENA", donde: "/geografia" },
  ],
  supuestos: [
    "La renovable variable cubre como máximo su producción media, descontada la variabilidad del año.",
    "El almacenamiento cubre un porcentaje de la demanda en las horas sin recurso, con una eficiencia del 85 %.",
    "El fósil llena siempre el hueco restante; su emisión es de 0,4 tCO₂ por MWh.",
    "Las instalaciones se retiran a los 30 años (renovable) o 40 (fósil).",
  ],
  limites: [
    "Resolución anual: no hay horas, ni picos, ni noches. Un sistema real se juzga por la hora 7.000 del año.",
    "No hay hidráulica, nuclear, biomasa ni interconexiones: tres tecnologías y una batería.",
    "No hay precios de mercado ni costes de red.",
    "El factor de capacidad agregado oculta la correlación entre sitios y la variabilidad entre años.",
    "No es un plan energético: es una calculadora de compensaciones entre coste, emisiones y fiabilidad.",
  ],
  presets: [
    { id: "carbon", nombre: "Todo carbón", descripcion: "Fósil barato y sin prisa climática.", parametros: { renovable: 2, fosil: 25, almacenamiento: 0, precioFosil: 60 } },
    { id: "transicion", nombre: "Transición ordenada", descripcion: "Renovable fuerte con respaldo y baterías.", parametros: { renovable: 24, fosil: 6, almacenamiento: 18, crecimiento: 2 } },
    { id: "prisa", nombre: "Cierre precipitado", descripcion: "Mucha renovable y poco almacenamiento.", parametros: { renovable: 34, fosil: 0, almacenamiento: 3 } },
  ],
  init: (p) => ({
    demanda: p.demandaInicial,
    renovable: p.demandaInicial * 0.25,
    fosil: p.demandaInicial,
    nuclear: 0,
    anio: 0,
    costeBase: 0,
  }),
  step: (e, p, i, semilla) => {
    const demanda = e.demanda * (1 + p.crecimiento / 100);
    const renovable = e.renovable * 0.967 + p.renovable;
    const fosil = e.fosil * 0.985 + p.fosil;
    const variabilidad = 0.9 + ruido(semilla, i, 31) * 0.2;
    const generacionRenovable = renovable * (p.factorSolar / 100) * variabilidad;
    const almacen = Math.min(demanda * (p.almacenamiento / 100), Math.max(0, generacionRenovable));
    const firmeRenovable = generacionRenovable + almacen * 0.85;
    const hueco = Math.max(0, demanda - firmeRenovable);
    const generacionFosil = Math.min(fosil, hueco);
    const noSuministrada = Math.max(0, hueco - generacionFosil);
    const emisiones = generacionFosil * 0.4; // TWh × 0,4 t/MWh = MtCO₂
    const coste = (generacionFosil * p.precioFosil * 0.9 + generacionRenovable * 22 + almacen * 34) / Math.max(1, demanda);
    return {
      demanda,
      renovable,
      fosil,
      nuclear: 0,
      anio: i,
      generacionRenovable,
      generacionFosil,
      noSuministrada,
      emisiones,
      coste,
    };
  },
  derivar: (e) => {
    const total = (e.generacionRenovable ?? 0) + (e.generacionFosil ?? 0) + (e.noSuministrada ?? 0);
    return {
      emisiones: e.emisiones ?? 0,
      coste: e.coste ?? 0,
      renovablePct: total > 0 ? ((e.generacionRenovable ?? 0) / total) * 100 : 0,
      noSuministrada: e.demanda > 0 ? ((e.noSuministrada ?? 0) / e.demanda) * 100 : 0,
      demanda: e.demanda,
    };
  },
  lectura: (e, p, r) => {
    const total = (e.generacionRenovable ?? 0) + (e.generacionFosil ?? 0) + (e.noSuministrada ?? 0);
    const pct = total > 0 ? ((e.generacionRenovable ?? 0) / total) * 100 : 0;
    const l = [
      `La renovable cubre el ${pct.toFixed(0)} % de la generación al final de la corrida y las emisiones quedan en ${(e.emisiones ?? 0).toFixed(0)} MtCO₂ al año.`,
      `La energía no suministrada es el ${(((e.noSuministrada ?? 0) / Math.max(1, e.demanda)) * 100).toFixed(2)} % de la demanda.`,
    ];
    if ((e.noSuministrada ?? 0) / Math.max(1, e.demanda) > 0.01) l.push("Por encima del 1 % sin suministrar, el sistema ya no es fiable: en la realidad eso son cortes programados y un problema político, no una cifra técnica.");
    if (p.almacenamiento < 8 && p.renovable > 25) l.push("Renovable alta con poco almacenamiento: el modelo genera de sobra de día y no llega de noche. Es el error clásico de contar capacidad en vez de energía.");
    if (p.fosil <= 4 && p.almacenamiento >= 15) l.push("Con respaldo fósil bajo y almacenamiento suficiente, el sistema se sostiene: la mezcla importa más que la suma.");
    if (p.precioFosil <= 60) l.push("Con el combustible barato, la transición no se paga sola: durante décadas el coste medio sube antes de bajar.");
    return l;
  },
};

// ───────────────────────── 14. TRANSPORTE ─────────────────────────

export const transporte: ModeloLab = {
  id: "transporte",
  nombre: "Movilidad urbana",
  categoria: "sistemas",
  pregunta: "¿Qué saca más coches de la calle?",
  resumen:
    "Una ciudad reparte sus viajes entre coche, transporte público y bicicleta/peatón. La congestión castiga al coche, la inversión mejora al bus, y la densidad urbana decide si eso sirve de algo. El modelo devuelve reparto modal, tiempo de viaje y emisiones.",
  contexto:
    "Un carril de bus mueve cinco veces más gente que un carril de coches. Pero el reparto modal no cambia por decreto: cambia cuando la alternativa es más rápida o más barata que el coche. Este laboratorio permite probar las tres palancas habituales —inversión, precio y urbanismo— y ver cuál mueve la aguja.",
  unidadTiempo: "año",
  pasosDefecto: 25,
  pasosMax: 60,
  anioInicial: 2026,
  variables: [
    { id: "viajes", nombre: "Viajes diarios", unidad: "millones", min: 0.2, max: 40, paso: 0.2, defecto: 6, origen: "eleccion", nota: "Tamaño de la ciudad." },
    { id: "inversionTransporte", nombre: "Inversión en transporte público", unidad: "0-100", min: 0, max: 100, paso: 5, defecto: 45, origen: "eleccion", nota: "Más frecuencia, más cobertura, más velocidad comercial." },
    { id: "precioCoche", nombre: "Coste de usar coche", unidad: "índice", min: 30, max: 250, paso: 10, defecto: 100, origen: "eleccion", nota: "Combustible, peajes, aparcamiento y seguro." },
    { id: "densidad", nombre: "Densidad urbana", unidad: "0-100", min: 10, max: 100, paso: 5, defecto: 55, origen: "eleccion", nota: "La densidad hace viable el transporte público y acorta distancias." },
    { id: "restriccion", nombre: "Restricción al coche", unidad: "0-100", min: 0, max: 100, paso: 5, defecto: 20, origen: "eleccion", nota: "Zonas de bajas emisiones, límites, prioridad al bus." },
    { id: "electricos", nombre: "Cuota de coche eléctrico", unidad: "%", min: 0, max: 100, paso: 5, defecto: 12, origen: "eleccion", nota: "Reduce emisiones por viaje, no congestión." },
  ],
  metricas: [
    { campo: "cochePct", nombre: "Reparto del coche", unidad: "% de los viajes", formato: "pct", decimales: 1 },
    { campo: "tiempo", nombre: "Tiempo medio de viaje", unidad: "minutos", formato: "num", decimales: 1 },
    { campo: "emisiones", nombre: "Emisiones del transporte", unidad: "tCO₂/día", formato: "num", decimales: 0 },
    { campo: "congestion", nombre: "Congestión", unidad: "0-100", formato: "num", decimales: 0 },
  ],
  series: [
    { campo: "cochePct", nombre: "Coche (%)", color: "#f87171", unidad: "%" },
    { campo: "publicoPct", nombre: "Transporte público (%)", color: "#7dd3fc", unidad: "%" },
    { campo: "activoPct", nombre: "Bici y a pie (%)", color: "#34d399", unidad: "%" },
    { campo: "emisiones", nombre: "Emisiones (t/día)", color: "#fbbf24", unidad: "t" },
  ],
  reales: [
    { dato: "Reparto modal en Ámsterdam", valor: "más de un tercio de los viajes en bici", fuente: "municipalidad de Ámsterdam", donde: "/geografia" },
    { dato: "Capacidad de un carril de bus", valor: "hasta 5 veces la de un carril de coches", fuente: "literatura de transporte urbano", donde: "/geografia" },
  ],
  supuestos: [
    "El reparto modal se calcula con una utilidad que resta tiempo y coste a cada modo.",
    "La congestión es cuadrática con el número de coches y alarga el viaje del coche y del bus.",
    "La bicicleta y el peatón ganan peso con la densidad y con la restricción al coche.",
    "Los coches eléctricos emiten un 25 % de lo que emite uno de combustión (contando la red).",
  ],
  limites: [
    "Una ciudad agregada: no hay origen-destino ni hora punta.",
    "No hay aparcamiento como mercado, ni precios de vivienda, ni segregación espacial.",
    "El reparto modal es una utilidad, no una encuesta: no predice lo que hará la gente.",
    "No incluye seguridad vial, ruido ni accidentes.",
    "Cambiar la densidad es cambiar el modelo de ciudad, no una medida de un año.",
  ],
  presets: [
    { id: "coche", nombre: "Ciudad para el coche", descripcion: "Baja densidad, gasolina barata, poco bus.", parametros: { densidad: 25, precioCoche: 50, inversionTransporte: 15, restriccion: 0 } },
    { id: "mixta", nombre: "Ciudad mixta", descripcion: "Bus decente y algo de restricción.", parametros: { densidad: 55, precioCoche: 100, inversionTransporte: 55, restriccion: 25 } },
    { id: "peatonal", nombre: "Ciudad de proximidad", descripcion: "Densidad alta, bus fuerte y coche caro.", parametros: { densidad: 85, precioCoche: 180, inversionTransporte: 85, restriccion: 70, electricos: 30 } },
  ],
  init: (p) => ({
    coche: 55,
    publico: 30,
    activo: 15,
    anio: 0,
  }),
  step: (e, p, i) => {
    const congestion = limitar((e.coche / 100) * (p.viajes / 6) * 1.2 * (1 - p.inversionTransporte / 300), 0, 100);
    const tiempoCoche = 22 + congestion * 0.45;
    const tiempoBus = 38 - p.inversionTransporte * 0.18 + congestion * 0.12;
    const tiempoActivo = 24 - p.densidad * 0.08;
    const costeCoche = p.precioCoche / 100;
    // Utilidades (menos es mejor): tiempo + coste + penalización por restricción.
    const uCoche = -(tiempoCoche / 10) - costeCoche - p.restriccion / 80;
    const uBus = -(tiempoBus / 10) - 0.55 - (100 - p.inversionTransporte) / 120;
    const uActivo = -(tiempoActivo / 10) - 0.55 - (100 - p.densidad) / 70;
    const suma = Math.exp(uCoche * 1.4) + Math.exp(uBus * 1.4) + Math.exp(uActivo * 1.4);
    const objetivoCoche = (Math.exp(uCoche * 1.4) / suma) * 100;
    const objetivoBus = (Math.exp(uBus * 1.4) / suma) * 100;
    const objetivoActivo = (Math.exp(uActivo * 1.4) / suma) * 100;
    return {
      coche: e.coche * 0.85 + objetivoCoche * 0.15,
      publico: e.publico * 0.85 + objetivoBus * 0.15,
      activo: e.activo * 0.85 + objetivoActivo * 0.15,
      anio: i,
    };
  },
  derivar: (e, p) => {
    const congestion = limitar((e.coche / 100) * (p.viajes / 6) * 1.2 * (1 - p.inversionTransporte / 300), 0, 100);
    const viajesCoche = (p.viajes * e.coche) / 100;
    const emisiones = viajesCoche * 900 * (1 - (p.electricos / 100) * 0.75);
    return {
      cochePct: e.coche,
      publicoPct: e.publico,
      activoPct: e.activo,
      tiempo: (e.coche / 100) * (22 + congestion * 0.45) + (e.publico / 100) * (38 - p.inversionTransporte * 0.18 + congestion * 0.12) + (e.activo / 100) * Math.max(8, 24 - p.densidad * 0.08),
      emisiones,
      congestion,
    };
  },
  lectura: (e, p, r) => {
    const cong = limitar((e.coche / 100) * (p.viajes / 6) * 1.2 * (1 - p.inversionTransporte / 300), 0, 100);
    const l = [
      `El coche pasa del ${r.inicial.coche.toFixed(0)} % al ${e.coche.toFixed(0)} % de los viajes; el transporte público, del ${r.inicial.publico.toFixed(0)} % al ${e.publico.toFixed(0)} %.`,
      `La congestión queda en ${cong.toFixed(0)} sobre 100 y las emisiones en ${(((p.viajes * e.coche) / 100) * 900 * (1 - (p.electricos / 100) * 0.75)).toFixed(0)} tCO₂ al día.`,
    ];
    if (p.inversionTransporte >= 75 && p.densidad >= 65) l.push("Inversión alta y densidad alta: la combinación que más cambia el reparto. Sin densidad, el bus no tiene pasajeros; sin inversión, no tiene frecuencia.");
    if (p.precioCoche <= 60 && p.densidad <= 35) l.push("Ciudad dispersa y coche barato: ninguna otra palanca compensa. La forma de la ciudad manda.");
    if (p.electricos >= 70) l.push("Los coches eléctricos bajan emisiones pero no congestión: el modelo lo separa a propósito, porque son dos problemas distintos.");
    if (p.restriccion >= 60) l.push("Una restricción fuerte funciona, pero el modelo avisa: si no hay alternativa, el viaje no desaparece, cambia de hora o de coche.");
    return l;
  },
};
