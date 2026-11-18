// ═══════════════════════════════════════════════════════════════════
// v411.0 · LABORATORIOS DE GEOGRAFÍA FÍSICA
//
//   · clima       — carbono, concentración y anomalía térmica
//   · agua        — cuenca, demanda y acuífero que se vacía
//   · territorio  — uso del suelo, suelo fértil perdido y restauración
//
// Estos modelos son deliberadamente simples. No son modelos climáticos ni
// hidrológicos: son máquinas de enseñar mecanismos. Cada uno lo dice en su
// lista de límites y ninguno se presenta como predicción.
// ═══════════════════════════════════════════════════════════════════

import type { ModeloLab } from "../tipos";
import { limitar, redondear } from "../tipos";

// ───────────────────────── 7. CLIMA ─────────────────────────

/** GtCO₂ que equivalen a 1 ppm de CO₂ en la atmósfera (≈ 2,13 GtC). */
const GTCO2_POR_PPM = 7.8;
const PPM_PREINDUSTRIAL = 280;

export const clima: ModeloLab = {
  id: "clima",
  nombre: "Clima y carbono",
  categoria: "geografia",
  pregunta: "¿Cuánto calienta una trayectoria de emisiones?",
  resumen:
    "Un ciclo de carbono mínimo: emisiones que suben, océanos y bosques que absorben una fracción, concentración que se acumula y una anomalía térmica que responde con retraso. Mueve emisiones, deforestación y mitigación y mira el termómetro del año 2100.",
  contexto:
    "El CO₂ no se va cuando se deja de emitir: se queda. Esa es la razón por la que la temperatura no responde a las emisiones de un año, sino a la suma de todos. Este laboratorio reproduce el mecanismo con tres números que puedes mover a mano y comparar con la realidad: 424 ppm y +1,3 °C en 2024.",
  unidadTiempo: "año",
  pasosDefecto: 75,
  pasosMax: 150,
  anioInicial: 2026,
  variables: [
    { id: "emisiones", nombre: "Emisiones anuales", unidad: "GtCO₂/año", min: 0, max: 60, paso: 0.5, defecto: 38, origen: "real", nota: "El mundo emite unas 37-38 GtCO₂ al año. Es dato real; lo que muevas después es escenario." },
    { id: "deforestacion", nombre: "Deforestación", unidad: "GtCO₂/año", min: 0, max: 12, paso: 0.5, defecto: 4, origen: "supuesto", nota: "Uso del suelo y bosque perdido, en equivalente CO₂." },
    { id: "mitigacion", nombre: "Esfuerzo de mitigación", unidad: "0-100", min: 0, max: 100, paso: 5, defecto: 20, origen: "eleccion", nota: "Reduce las emisiones un 0,8 % por punto y año." },
    { id: "absorcion", nombre: "Absorción natural", unidad: "% de las emisiones", min: 10, max: 70, paso: 5, defecto: 45, origen: "supuesto", nota: "Océano y biosfera. Hoy absorben algo menos de la mitad; se satura al subir la concentración." },
    { id: "sensibilidad", nombre: "Sensibilidad climática", unidad: "°C por duplicar CO₂", min: 1.5, max: 6, paso: 0.1, defecto: 3, origen: "supuesto", nota: "La horquilla científica es 2,5-4 °C; 3 es el valor central del IPCC." },
  ],
  metricas: [
    { campo: "ppm", nombre: "Concentración de CO₂", unidad: "ppm", formato: "num", decimales: 0 },
    { campo: "anomalia", nombre: "Anomalía térmica", unidad: "°C sobre 1850-1900", formato: "num", decimales: 2 },
    { campo: "presupuesto", nombre: "Presupuesto de 1,5 °C", unidad: "% restante", formato: "pct", decimales: 0, nota: "Cuánto del margen de 1,5 °C queda sin usar. A 0 %, el umbral se ha cruzado." },
    { campo: "emisionesAnio", nombre: "Emisiones del año", unidad: "GtCO₂", formato: "num", decimales: 1 },
  ],
  series: [
    { campo: "anomalia", nombre: "Anomalía (°C)", color: "#f87171", unidad: "°C" },
    { campo: "ppm", nombre: "CO₂ (ppm ÷ 10)", color: "#7dd3fc", unidad: "ppm" },
  ],
  reales: [
    { dato: "CO₂ atmosférico en 2024", valor: "≈ 424 ppm", fuente: "NOAA Global Monitoring Laboratory", donde: "/pulso-mundial" },
    { dato: "Anomalía global 2024", valor: "≈ +1,3 °C sobre 1850-1900", fuente: "OMM / Copernicus", donde: "/geografia" },
    { dato: "Emisiones anuales mundiales", valor: "≈ 37,4 GtCO₂ (2024)", fuente: "Global Carbon Budget", donde: "/pulso-mundial" },
  ],
  supuestos: [
    "2,13 GtC equivalen a 1 ppm de CO₂ en la atmósfera.",
    "La absorción natural baja a medida que la concentración sube (se satura).",
    "La temperatura es transitoria: responde a la concentración con un factor 0,55 sobre la sensibilidad de equilibrio.",
    "La mitigación actúa gradualmente: reduce un 0,8 % de emisiones por punto y año.",
  ],
  limites: [
    "No hay aerosoles, metano, óxido nitroso ni ozono: solo CO₂ equivalente agregado.",
    "No hay retroalimentaciones del permafrost ni colapso de casquetes: el modelo es más benévolo que la realidad en el extremo alto.",
    "Es un modelo de una caja: no hay geografía, ni estaciones, ni eventos extremos.",
    "La sensibilidad climática es un parámetro, no un resultado: cambiarla cambia el mundo sin cambiar la física.",
    "No es una predicción ni una herramienta de política. Para cifras oficiales, IPCC AR6 y Global Carbon Budget.",
  ],
  presets: [
    { id: "actual", nombre: "Trayectoria actual", descripcion: "Emisiones sostenidas y mitigación tibia.", parametros: { emisiones: 38, deforestacion: 4, mitigacion: 20 } },
    { id: "paris", nombre: "Acuerdo de París cumplido", descripcion: "Mitigación fuerte desde ya.", parametros: { emisiones: 38, deforestacion: 2, mitigacion: 85 } },
    { id: "atraso", nombre: "Transición aplazada", descripcion: "Dos décadas más de emisiones crecientes.", parametros: { emisiones: 52, deforestacion: 8, mitigacion: 10 } },
  ],
  init: () => ({
    ppm: 424,
    anomalia: 1.3,
    emisionesAnio: 42,
    acumuladas: 0,
    anio: 0,
  }),
  step: (e, p, i) => {
    const brutas = p.emisiones + p.deforestacion;
    const mitigadas = Math.max(0, brutas * (1 - (p.mitigacion / 100) * 0.008 * (i + 1)));
    const saturacion = limitar(p.absorcion - (e.ppm - 424) * 0.09, 8, 70);
    const netas = mitigadas * (1 - saturacion / 100);
    const ppm = e.ppm + netas / GTCO2_POR_PPM;
    const anomalia = p.sensibilidad * 0.55 * (Math.log(ppm / PPM_PREINDUSTRIAL) / Math.log(2));
    return { ppm, anomalia, emisionesAnio: mitigadas, acumuladas: e.acumuladas + mitigadas, anio: i };
  },
  derivar: (e) => {
    const margen = Math.max(0, 1.5 - e.anomalia);
    return {
      ppm: e.ppm,
      anomalia: e.anomalia,
      emisionesAnio: e.emisionesAnio,
      acumuladas: e.acumuladas,
      presupuesto: (margen / 1.5) * 100,
    };
  },
  lectura: (e, p, r) => {
    const l = [
      `Partiendo de 424 ppm y +1,3 °C, esta trayectoria lleva a ${e.ppm.toFixed(0)} ppm y +${e.anomalia.toFixed(2)} °C en ${r.pasos} años.`,
      `Emisiones acumuladas del periodo: ${(e.acumuladas / 1000).toFixed(1)} billones de toneladas de CO₂.`,
    ];
    if (e.anomalia > 1.5) l.push("El umbral de 1,5 °C se cruza en esta corrida. Ojo: ese umbral es político, la física no tiene escalón.");
    if (e.anomalia > 2) l.push("Por encima de 2 °C, los límites de este modelo pesan más que sus resultados: aquí no hay colapso de casquetes ni permafrost.");
    if (p.mitigacion >= 80) l.push("Con mitigación alta, la curva se aplana pero no vuelve: el CO₂ ya emitido se queda décadas. Bajar emisiones frena el daño, no lo deshace.");
    if (p.mitigacion <= 20 && p.emisiones >= 45) l.push("Emisiones crecientes con mitigación baja: es el escenario en el que la adaptación se vuelve más barata que la mitigación, y por eso se elige tarde.");
    return l;
  },
};

// ───────────────────────── 8. AGUA ─────────────────────────

export const agua: ModeloLab = {
  id: "agua",
  nombre: "Cuenca y recursos hídricos",
  categoria: "geografia",
  pregunta: "¿Cuándo se vacía un acuífero?",
  resumen:
    "Una cuenca con lluvia, embalse y acuífero. La agricultura, las ciudades y la industria piden agua cada año; si la demanda supera la recarga, se perfora el acuífero. El agua superficial se agota antes y avisa tarde.",
  contexto:
    "El 70 % del agua dulce que usamos va al campo. En el norte de India, en el valle central de California y en el Sahel, el agua que se riega hoy salió de un acuífero que tardó milenios en llenarse. Este laboratorio enseña la aritmética de ese préstamo y su fecha de vencimiento.",
  unidadTiempo: "año",
  pasosDefecto: 40,
  pasosMax: 100,
  anioInicial: 2026,
  variables: [
    { id: "lluvia", nombre: "Aportación anual", unidad: "hm³/año", min: 200, max: 6000, paso: 100, defecto: 1800, origen: "supuesto", nota: "Agua que entra en la cuenca cada año." },
    { id: "agricultura", nombre: "Demanda agrícola", unidad: "% del total", min: 10, max: 90, paso: 5, defecto: 70, origen: "supuesto", nota: "El regadío es, con diferencia, el mayor consumidor mundial." },
    { id: "demandaTotal", nombre: "Demanda total", unidad: "hm³/año", min: 100, max: 7000, paso: 100, defecto: 1400, origen: "eleccion", nota: "Ciudades, campo e industria juntos." },
    { id: "eficiencia", nombre: "Eficiencia de riego", unidad: "%", min: 20, max: 95, paso: 5, defecto: 45, origen: "eleccion", nota: "Cuánto del agua aplicada llega al cultivo. El resto se pierde." },
    { id: "embalse", nombre: "Capacidad de embalse", unidad: "hm³", min: 0, max: 4000, paso: 100, defecto: 900, origen: "eleccion", nota: "Agua superficial que se puede guardar de un año a otro." },
    { id: "recarga", nombre: "Recarga del acuífero", unidad: "% de la lluvia", min: 2, max: 40, paso: 1, defecto: 12, origen: "supuesto", nota: "La parte que se infiltra y vuelve al acuífero." },
  ],
  metricas: [
    { campo: "estres", nombre: "Estrés hídrico", unidad: "% de la aportación", formato: "pct", decimales: 0, nota: "Por encima del 100 % se vive de reservas. Por encima del 80 %, la cuenca está en tensión." },
    { campo: "acuiferoPct", nombre: "Acuífero", unidad: "% de su capacidad", formato: "pct", decimales: 0 },
    { campo: "superficialPct", nombre: "Embalse", unidad: "% de su capacidad", formato: "pct", decimales: 0 },
    { campo: "perCapita", nombre: "Agua disponible", unidad: "m³ por persona/año", formato: "num", decimales: 0 },
  ],
  series: [
    { campo: "acuiferoPct", nombre: "Acuífero (%)", color: "#7dd3fc", unidad: "%" },
    { campo: "superficialPct", nombre: "Embalse (%)", color: "#fbbf24", unidad: "%" },
    { campo: "estres", nombre: "Estrés hídrico (%)", color: "#f87171", unidad: "%" },
  ],
  reales: [
    { dato: "Agua dulce usada por la agricultura", valor: "≈ 70 % del total mundial", fuente: "FAO AQUASTAT", donde: "/pulso-mundial" },
    { dato: "Personas con estrés hídrico alto", valor: "más de 2.000 millones al menos un mes al año", fuente: "ONU Agua", donde: "/geografia" },
  ],
  supuestos: [
    "El acuífero arranca al 80 % de su capacidad y tiene un volumen de 20 años de aportación.",
    "El riego ineficiente no vuelve a la cuenca: se pierde por evaporación.",
    "La demanda crece un 0,4 % anual si hay agua y se recorta si falta.",
    "El agua disponible por persona usa una población de referencia de 2 millones, declarada como supuesto.",
  ],
  limites: [
    "Una sola cuenca agregada: no hay ríos, trasvases ni cuencas vecinas.",
    "No hay calidad del agua ni contaminación: solo cantidad.",
    "La sequía no es un evento: la lluvia es constante y el usuario decide el nivel.",
    "No incluye cambio climático sobre la lluvia: eso está en el laboratorio de clima, y aquí no se acoplan.",
    "No sirve para planificar infraestructura real; sirve para entender por qué el acuífero se vacía antes de que se note.",
  ],
  presets: [
    { id: "regadio", nombre: "Cuenca de regadío", descripcion: "Agricultura intensiva, riego ineficiente.", parametros: { agricultura: 80, eficiencia: 40, demandaTotal: 1600 } },
    { id: "ciudad", nombre: "Cuenca urbana", descripcion: "Ciudad grande, poca agricultura.", parametros: { agricultura: 25, eficiencia: 70, demandaTotal: 1200 } },
    { id: "eficiente", nombre: "Modernización", descripcion: "Riego tecnificado y demanda contenida.", parametros: { eficiencia: 85, demandaTotal: 1100, recarga: 20 } },
  ],
  init: (p) => ({
    acuifero: p.lluvia * 20 * 0.8,
    superficial: p.embalse * 0.6,
    anio: 0,
  }),
  step: (e, p, i) => {
    const aportacion = p.lluvia;
    const infiltracion = aportacion * (p.recarga / 100);
    const demanda = p.demandaTotal * 1.004 ** i;
    const perdidaRiego = demanda * (p.agricultura / 100) * (1 - p.eficiencia / 100);
    const demandaReal = demanda * (1 - perdidaRiego / Math.max(1, demanda) / 3);
    // Primero se usa el embalse; lo que no llega se bombea del acuífero.
    const delEmbalse = Math.min(e.superficial + aportacion * 0.5, demandaReal);
    const resto = Math.max(0, demandaReal - delEmbalse);
    const superficial = limitar(e.superficial + aportacion * 0.5 - delEmbalse + Math.max(0, aportacion * 0.1), 0, p.embalse);
    const acuifero = limitar(e.acuifero + infiltracion - resto, 0, p.lluvia * 20);
    return { superficial, acuifero, anio: i };
  },
  derivar: (e, p) => {
    const demanda = p.demandaTotal;
    return {
      estres: (demanda / Math.max(1, p.lluvia)) * 100,
      acuiferoPct: (e.acuifero / Math.max(1, p.lluvia * 20)) * 100,
      superficialPct: p.embalse > 0 ? (e.superficial / p.embalse) * 100 : 0,
      perCapita: (p.lluvia * 1e6) / 2e6,
    };
  },
  lectura: (e, p, r) => {
    const ac = (e.acuifero / (p.lluvia * 20)) * 100;
    const l = [
      `Con una demanda de ${p.demandaTotal} hm³ y una aportación de ${p.lluvia} hm³, el estrés hídrico queda en el ${((p.demandaTotal / p.lluvia) * 100).toFixed(0)} %.`,
      `El acuífero pasa del 80 % al ${ac.toFixed(0)} % de su capacidad en ${r.pasos} años.`,
    ];
    if (ac < 30) l.push("Por debajo del 30 %, el acuífero ya no es una reserva: es una deuda. Bombeo más profundo, agua más salada y hundimiento del terreno son los siguientes pasos en la realidad.");
    if (p.demandaTotal > p.lluvia) l.push("La demanda supera lo que llueve: cada año se cierra la diferencia con reservas. Eso tiene fecha de caducidad.");
    if (p.eficiencia >= 80) l.push("Con eficiencia alta, la misma producción usa mucha menos agua: es la palanca más rápida de este modelo.");
    return l;
  },
};

// ───────────────────────── 9. TERRITORIO ─────────────────────────

export const territorio: ModeloLab = {
  id: "territorio",
  nombre: "Uso del suelo y erosión",
  categoria: "geografia",
  pregunta: "¿Cuánto suelo fértil cuesta alimentar a un país?",
  resumen:
    "Un territorio repartido entre bosque, cultivo, pasto y ciudad. Cada año se tala, se ara, se urbaniza y se restaura. El suelo fértil se pierde con la erosión y tarda siglos en volver; la productividad depende de cuánto quede.",
  contexto:
    "La erosión no se ve en el telediario: se mide en toneladas por hectárea y año. La FAO estima que un tercio del suelo del planeta está degradado. Este laboratorio convierte esa cifra en una curva: cada hectárea arada en pendiente y sin cobertura pierde suelo que no vuelve en una generación.",
  unidadTiempo: "año",
  pasosDefecto: 60,
  pasosMax: 150,
  anioInicial: 2026,
  variables: [
    { id: "bosqueInicial", nombre: "Bosque inicial", unidad: "% del territorio", min: 0, max: 90, paso: 1, defecto: 45, origen: "supuesto", nota: "Cobertura forestal de partida." },
    { id: "deforestacion", nombre: "Tala anual", unidad: "% del bosque", min: 0, max: 5, paso: 0.1, defecto: 0.8, origen: "eleccion", nota: "Superficie que se convierte en cultivo o pasto cada año." },
    { id: "expansionAgricola", nombre: "Expansión agrícola", unidad: "0-100", min: 0, max: 100, paso: 5, defecto: 55, origen: "eleccion", nota: "Cuánta tierra nueva se pone en cultivo para producir más." },
    { id: "urbanizacion", nombre: "Suelo urbanizado al año", unidad: "% del territorio", min: 0, max: 2, paso: 0.05, defecto: 0.3, origen: "eleccion", nota: "El urbano es el uso que no vuelve: es irreversible." },
    { id: "restauracion", nombre: "Restauración", unidad: "% del territorio/año", min: 0, max: 3, paso: 0.1, defecto: 0.3, origen: "eleccion", nota: "Reforestación y recuperación de suelo." },
    { id: "intensidad", nombre: "Intensidad agrícola", unidad: "0-100", min: 0, max: 100, paso: 5, defecto: 60, origen: "eleccion", nota: "Más intensidad produce más y erosiona más." },
  ],
  metricas: [
    { campo: "bosque", nombre: "Bosque", unidad: "% del territorio", formato: "pct", decimales: 1 },
    { campo: "suelo", nombre: "Suelo fértil", unidad: "% del original", formato: "pct", decimales: 1 },
    { campo: "produccion", nombre: "Producción agrícola", unidad: "índice (100 ≈ inicio)", formato: "indice", decimales: 1 },
    { campo: "degradado", nombre: "Suelo degradado", unidad: "% del territorio", formato: "pct", decimales: 1 },
  ],
  series: [
    { campo: "bosque", nombre: "Bosque (%)", color: "#34d399", unidad: "%" },
    { campo: "suelo", nombre: "Suelo fértil (%)", color: "#fbbf24", unidad: "%" },
    { campo: "produccion", nombre: "Producción", color: "#7dd3fc", unidad: "índice" },
    { campo: "degradado", nombre: "Degradado (%)", color: "#f87171", unidad: "%" },
  ],
  reales: [
    { dato: "Suelo degradado en el mundo", valor: "≈ 33 % de la tierra", fuente: "FAO, Informe sobre la degradación del suelo", donde: "/geografia" },
    { dato: "Pérdida de suelo por erosión", valor: "hasta 10 veces la tasa de formación en tierras de cultivo", fuente: "FAO", donde: "/geografia" },
  ],
  supuestos: [
    "El suelo fértil se forma a un ritmo de 0,1 % al año y se pierde proporcional a la intensidad agrícola y a la falta de bosque.",
    "La productividad agrícola depende del suelo disponible y de la intensidad, con rendimientos decrecientes.",
    "El suelo urbanizado no vuelve nunca.",
    "El bosque y el pasto protegen el suelo; el cultivo desnudo no.",
  ],
  limites: [
    "No hay clima, pendiente, tipo de suelo ni lluvia: la erosión es proporcional a la intensidad.",
    "No hay comercio: la producción no se puede importar, así que el modelo siempre empuja a arad más.",
    "La restauración recupera cobertura, pero no reproduce la formación de suelo en siglos.",
    "Los porcentajes son agregados nacionales: no distingue regiones dentro del país.",
    "No sustituye a un inventario de suelos ni a un sistema de información geográfica.",
  ],
  presets: [
    { id: "frontera", nombre: "Frontera agrícola", descripcion: "Tala rápida y expansión para producir más.", parametros: { bosqueInicial: 70, deforestacion: 2.2, expansionAgricola: 85, intensidad: 80 } },
    { id: "intensivo", nombre: "Agricultura intensiva", descripcion: "Poca tierra nueva, mucha intensidad.", parametros: { bosqueInicial: 25, deforestacion: 0.3, expansionAgricola: 20, intensidad: 95 } },
    { id: "restauracion", nombre: "Restauración", descripcion: "Bosque que vuelve y suelo que se recupera.", parametros: { bosqueInicial: 30, deforestacion: 0.2, expansionAgricola: 20, restauracion: 2, intensidad: 45 } },
  ],
  init: (p) => {
    const bosque = p.bosqueInicial;
    return {
      bosque,
      cultivo: Math.max(5, 55 - bosque * 0.4),
      pasto: Math.max(5, 40 - bosque * 0.3),
      urbano: 4,
      suelo: 100,
      degradado: 12,
      anio: 0,
    };
  },
  step: (e, p, i) => {
    const talado = e.bosque * (p.deforestacion / 100);
    const nuevoCultivo = talado * (p.expansionAgricola / 100) * 0.7;
    const restaurado = Math.min(e.cultivo + e.pasto, (p.restauracion / 100) * 100) * 0.4;
    const urbanoNuevo = Math.min(e.cultivo, p.urbanizacion);
    // Erosión: la intensidad sobre cultivo desnudo y la falta de bosque la disparan.
    const erosion = (p.intensidad / 100) * (e.cultivo / 100) * (1.4 - e.bosque / 150);
    const formacion = 0.1 * (e.bosque / 100 + 0.2);
    const suelo = limitar(e.suelo - erosion + formacion, 1, 100);
    const bosque = limitar(e.bosque - talado + restaurado, 1, 90);
    const cultivo = limitar(e.cultivo + nuevoCultivo - restaurado - urbanoNuevo, 1, 90);
    const urbano = e.urbano + urbanoNuevo;
    const pasto = limitar(100 - bosque - cultivo - urbano, 0, 90);
    const degradado = limitar(e.degradado + erosion * 0.9 - formacion * 0.5, 0, 90);
    return { bosque, cultivo, pasto, urbano, suelo, degradado, anio: i };
  },
  derivar: (e, p) => ({
    bosque: e.bosque,
    suelo: e.suelo,
    degradado: e.degradado,
    // Índice: 100 ≈ el valor de partida con los parámetros por defecto.
    produccion: (e.suelo / 100) * (0.5 + (p.intensidad / 100) * 0.6) * (0.7 + e.cultivo / 100) * 100,
  }),
  lectura: (e, p, r) => {
    const l = [
      `En ${r.pasos} años el bosque pasa del ${r.inicial.bosque.toFixed(0)} % al ${e.bosque.toFixed(0)} % del territorio y el suelo fértil queda al ${e.suelo.toFixed(0)} % del original.`,
    ];
    if (e.suelo < 70) l.push("Por debajo del 70 % de suelo original, la producción empieza a caer aunque se siga intensificando: es la trampa de la erosión.");
    if (e.bosque < 15) l.push("Con menos del 15 % de bosque, el modelo pierde casi toda su capacidad de retener suelo. La curva se vuelve difícil de revertir.");
    if (p.restauracion >= 1.5) l.push("La restauración funciona, pero despacio: recupera cobertura en décadas y suelo en siglos. Ese desfase es el mensaje del laboratorio.");
    if (p.urbanizacion >= 1) l.push("Cada punto de suelo urbanizado al año es irreversible en este modelo: la ciudad no devuelve tierra.");
    return l;
  },
};
