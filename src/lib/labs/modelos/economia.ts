// ═══════════════════════════════════════════════════════════════════
// v411.0 · LABORATORIOS DE ECONOMÍA
//
// Cuatro modelos con mecánicas distintas, no cuatro skins del mismo gráfico:
//   · macro      — acumulación de capital y productividad (Cobb-Douglas)
//   · fiscal     — asignación de un presupuesto y espiral de deuda
//   · comercio   — red de seis nodos con gravitación, aranceles y cuello de
//                  botella: el shock de un nodo viaja a sus socios
//   · produccion — recursos que se agotan, EROI que cae y tecnología que
//                  sustituye
//
// NINGUNO PREDICE. Cada uno tiene sus supuestos escritos y sus límites a la
// vista; el objetivo es entender el mecanismo, no acertar el futuro.
// ═══════════════════════════════════════════════════════════════════

import type { EstadoLab, ModeloLab, ParametrosLab } from "../tipos";
import { limitar, redondear, ruido, saturar } from "../tipos";

// ───────────────────────── 1. ECONOMÍA NACIONAL ─────────────────────────

// Calibración de referencia: capital 100, trabajo 25 y productividad 1 dan un
// producto de ~39,7 en el año cero. Todo se publica como índice (año 0 = 100)
// para no fingir euros ni paridades que el modelo no calcula.
const K0 = 100;
const L0 = 25;
const A0 = 1;
const Y0 = A0 * Math.pow(K0, 0.33) * Math.pow(L0, 0.67);

export const macro: ModeloLab = {
  id: "macro",
  nombre: "Economía nacional",
  categoria: "economia",
  pregunta: "¿Qué pasa si subo la inversión pero no la productividad?",
  resumen:
    "Una economía cerrada de libro de texto: el producto sale del capital, el trabajo y la productividad. Tú decides cuánto se invierte, cuánto se investiga y cuánto se recauda; el modelo te devuelve el producto por habitante, la deuda y la inflación año a año.",
  contexto:
    "Desde Solow (1956) se sabe que el capital por trabajador se acumula hasta un punto en el que la depreciación se come la inversión nueva. Lo que crece sin límite es la productividad. Este laboratorio existe para que se vea ese mecanismo con las manos: subir la inversión da un salto y luego se aplana; mover la productividad mueve la pendiente durante décadas.",
  unidadTiempo: "año",
  pasosDefecto: 30,
  pasosMax: 80,
  anioInicial: 2026,
  variables: [
    { id: "inversion", nombre: "Inversión", unidad: "% del PIB", min: 8, max: 40, paso: 1, defecto: 21, origen: "eleccion", nota: "Parte del producto que se destina a capital nuevo: fábricas, obra, máquinas." },
    { id: "id", nombre: "Investigación y desarrollo", unidad: "% del PIB", min: 0, max: 6, paso: 0.1, defecto: 1.4, origen: "eleccion", nota: "El gasto que mueve la productividad, con rendimientos decrecientes." },
    { id: "apertura", nombre: "Apertura comercial", unidad: "índice 0-100", min: 0, max: 100, paso: 1, defecto: 45, origen: "eleccion", nota: "Cuánto se importa la tecnología del exterior y se compite fuera." },
    { id: "presion", nombre: "Presión fiscal", unidad: "% del PIB", min: 8, max: 55, paso: 1, defecto: 34, origen: "eleccion", nota: "Recaudación: paga el gasto público y modera el consumo privado." },
    { id: "gasto", nombre: "Gasto público", unidad: "% del PIB", min: 12, max: 60, paso: 1, defecto: 36, origen: "eleccion", nota: "Lo que el Estado gasta cada año; por encima de lo recaudado, hay déficit." },
    { id: "shock", nombre: "Shock externo", unidad: "% de golpe", min: 0, max: 8, paso: 0.5, defecto: 0, origen: "supuesto", nota: "Una perturbación temporal que se disipa en tres años." },
  ],
  metricas: [
    { campo: "pib", nombre: "PIB", unidad: "índice 100 = inicio", formato: "indice", decimales: 1 },
    { campo: "pibpc", nombre: "PIB por habitante", unidad: "índice 100 = inicio", formato: "indice", decimales: 1, nota: "Es el nivel de vida material del modelo." },
    { campo: "deuda", nombre: "Deuda pública", unidad: "% del PIB", formato: "pct", decimales: 1 },
    { campo: "inflacion", nombre: "Inflación", unidad: "% anual", formato: "pct", decimales: 1 },
    { campo: "productividad", nombre: "Productividad", unidad: "índice 100 = inicio", formato: "indice", decimales: 1 },
  ],
  series: [
    { campo: "pibpc", nombre: "PIB por habitante", color: "#34d399", unidad: "índice" },
    { campo: "deuda", nombre: "Deuda / PIB", color: "#f87171", unidad: "%" },
    { campo: "inflacion", nombre: "Inflación", color: "#fbbf24", unidad: "%" },
    { campo: "productividad", nombre: "Productividad", color: "#7dd3fc", unidad: "índice" },
  ],
  reales: [
    { dato: "Inversión mundial aproximada", valor: "~25 % del PIB", fuente: "Banco Mundial, formación bruta de capital", donde: "/pulso-mundial" },
    { dato: "I+D de las economías avanzadas", valor: "2–3,5 % del PIB", fuente: "UNESCO / Banco Mundial", donde: "/pulso-mundial" },
  ],
  supuestos: [
    "Función de producción Cobb-Douglas con exponentes 0,33 (capital) y 0,67 (trabajo): son valores convencionales, no medidos para ningún país concreto.",
    "Depreciación del capital del 5 % anual y crecimiento de la población activa del 0,6 %.",
    "La inflación sigue una curva de Phillips suave alrededor del 2 % objetivo.",
    "El tipo de interés de la deuda sube con el nivel de deuda (2 % + deuda/20).",
  ],
  limites: [
    "No hay sector exterior, ni tipos de cambio, ni banca: es una economía cerrada de manual.",
    "No modela distribución de la renta ni desempleo; el trabajo se emplea entero.",
    "Los exponentes y la depreciación son convenciones docentes: no están calibrados a ningún país.",
    "Los shocks son exógenos y simétricos: en la realidad llegan por donde menos se espera.",
    "No sirve para predecir el PIB de nadie. Sirve para ver el mecanismo.",
  ],
  presets: [
    { id: "emergente", nombre: "Economía emergente", descripcion: "Inversión alta, productividad baja, presión fiscal baja.", parametros: { inversion: 32, id: 0.8, apertura: 55, presion: 22, gasto: 26 } },
    { id: "avanzada", nombre: "Economía avanzada", descripcion: "Inversión media, I+D alto, Estado grande.", parametros: { inversion: 22, id: 3.2, apertura: 60, presion: 46, gasto: 47 } },
    { id: "austeridad", nombre: "Ajuste fiscal", descripcion: "Recorte de gasto con deuda alta de partida.", parametros: { inversion: 18, id: 1.2, apertura: 40, presion: 38, gasto: 32 } },
  ],
  init: () => ({ k: K0, l: L0, a: A0, deuda: 60, inflacion: 2, anio: 0 }),
  step: (e, p, i, semilla) => {
    const y = e.a * Math.pow(e.k, 0.33) * Math.pow(e.l, 0.67);
    const shockActivo = i <= 3 ? 1 - p.shock / 100 : 1;
    const inversion = (p.inversion / 100) * y * shockActivo;
    const dep = 0.05 * e.k;
    const k = e.k + inversion - dep;
    const l = e.l * 1.006;
    // Productividad: I+D con saturación, apertura y un ruido determinista.
    const impulso = 0.004 + 0.0035 * Math.sqrt(p.id) + 0.0006 * (p.apertura / 100) * 10;
    const a = e.a * (1 + impulso * (1 - 0.25 * saturar(e.a / 4)) + ruido(semilla, i, 1) * 0.0015);
    const crecimiento = y / Math.max(1e-9, e.a * Math.pow(e.k, 0.33) * Math.pow(e.l, 0.67)) - 1;
    // Inflación: brecha de producto + déficit.
    const ypot = Y0 * 1.021 ** i;
    const brecha = y / ypot - 1;
    const deficit = p.gasto - p.presion;
    const inflacion = limitar(
      0.55 * e.inflacion + 0.45 * (2 + 1.2 * brecha + 0.12 * deficit + (i <= 3 ? p.shock * 0.35 : 0)) + ruido(semilla, i, 2) * 0.15,
      -3,
      25
    );
    // La deuda se mide sobre el PIB: crece con el déficit y con el tipo real
    // menos el crecimiento. Sin ese último término, cualquier déficit parecía
    // una espiral infinita.
    const tipo = limitar(2 + e.deuda / 60, 2, 11);
    const deuda = limitar(e.deuda + deficit + (e.deuda * (tipo - inflacion - crecimiento * 100)) / 100, 0, 400);
    return { k, l, a, deuda, inflacion, anio: i };
  },
  derivar: (e) => {
    const y = e.a * Math.pow(e.k, 0.33) * Math.pow(e.l, 0.67);
    // Población del modelo: +0,6 % anual (el mismo supuesto que el empleo).
    const poblacion = 1.006 ** (e.anio || 0);
    return {
      pib: (y / Y0) * 100,
      pibpc: (y / Y0 / poblacion) * 100,
      productividad: (e.a / A0) * 100,
      deuda: e.deuda,
      inflacion: e.inflacion,
    };
  },
  lectura: (e, p, r) => {
    const y0 = r.inicial.a * Math.pow(r.inicial.k, 0.33) * Math.pow(r.inicial.l, 0.67);
    const y1 = e.a * Math.pow(e.k, 0.33) * Math.pow(e.l, 0.67);
    const crec = ((y1 / y0) ** (1 / Math.max(1, r.pasos)) - 1) * 100;
    const lineas = [
      `El producto crece un ${crec.toFixed(2)} % anual de media en ${r.pasos} años, con inversión del ${p.inversion} % y presión fiscal del ${p.presion} %.`,
    ];
    if (e.deuda > 120) lineas.push(`La deuda termina en el ${e.deuda.toFixed(0)} % del PIB: por encima del 120 % el modelo entra en territorio de sostenibilidad dudosa y el tipo de interés se come el margen.`);
    else if (e.deuda < 40) lineas.push(`La deuda baja al ${e.deuda.toFixed(0)} % del PIB: hay espacio fiscal, pero también menos gasto público.`);
    if (e.inflacion > 8) lineas.push(`La inflación se descontrola (${e.inflacion.toFixed(1)} %): el déficit y la brecha de producto se retroalimentan.`);
    if (p.id >= 3) lineas.push("El esfuerzo en I+D es alto: la productividad es la única palanca que no se agota.");
    if (p.inversion >= 35) lineas.push("Con inversión por encima del 35 % el capital se acumula más rápido de lo que la economía puede absorber: el rendimiento por unidad extra cae.");
    return lineas;
  },
};

// ───────────────────────── 2. PRESUPUESTO PÚBLICO ─────────────────────────

export const fiscal: ModeloLab = {
  id: "fiscal",
  nombre: "Presupuesto público",
  categoria: "economia",
  pregunta: "¿Qué se rompe si bajo impuestos y mantengo el gasto?",
  resumen:
    "Un Estado con tres cajas: servicios sociales, infraestructura y el resto. Tú repartes la recaudación; el modelo calcula el déficit, la deuda y lo que pasa con la capacidad del país a medio plazo.",
  contexto:
    "El presupuesto es la decisión política más concreta que existe: cada punto del PIB que va a hospitales no va a carreteras. Este laboratorio hace visible el intercambio y el precio de financiarlo con deuda, que no es gratis: sube el tipo de interés y desplaza gasto futuro.",
  unidadTiempo: "año",
  pasosDefecto: 25,
  pasosMax: 60,
  anioInicial: 2026,
  variables: [
    { id: "presion", nombre: "Presión fiscal", unidad: "% del PIB", min: 10, max: 55, paso: 1, defecto: 36, origen: "eleccion", nota: "Lo que el Estado recauda." },
    { id: "social", nombre: "Gasto social", unidad: "% del gasto", min: 10, max: 70, paso: 1, defecto: 45, origen: "eleccion", nota: "Sanidad, educación, pensiones: construye capital humano." },
    { id: "infra", nombre: "Gasto en infraestructura", unidad: "% del gasto", min: 2, max: 35, paso: 1, defecto: 12, origen: "eleccion", nota: "Obra pública: construye capital físico." },
    { id: "eficiencia", nombre: "Eficiencia del gasto", unidad: "0-100", min: 30, max: 100, paso: 1, defecto: 65, origen: "eleccion", nota: "Cuánto de cada euro gastado se convierte en servicio real." },
    { id: "deudaInicial", nombre: "Deuda de partida", unidad: "% del PIB", min: 0, max: 200, paso: 5, defecto: 60, origen: "supuesto", nota: "El punto de salida del país." },
  ],
  metricas: [
    { campo: "deuda", nombre: "Deuda pública", unidad: "% del PIB", formato: "pct", decimales: 1 },
    { campo: "deficit", nombre: "Déficit anual", unidad: "% del PIB", formato: "pct", decimales: 1 },
    { campo: "servicios", nombre: "Calidad de los servicios", unidad: "índice 0-100", formato: "indice", decimales: 1 },
    { campo: "infraestructura", nombre: "Infraestructura", unidad: "índice 0-100", formato: "indice", decimales: 1 },
    { campo: "pib", nombre: "PIB", unidad: "índice 100 = inicio", formato: "indice", decimales: 1 },
  ],
  series: [
    { campo: "deuda", nombre: "Deuda / PIB", color: "#f87171", unidad: "%" },
    { campo: "servicios", nombre: "Servicios", color: "#fbbf24", unidad: "índice" },
    { campo: "infraestructura", nombre: "Infraestructura", color: "#7dd3fc", unidad: "índice" },
    { campo: "pib", nombre: "PIB", color: "#34d399", unidad: "índice" },
  ],
  reales: [
    { dato: "Gasto social en la OCDE", valor: "~20 % del PIB de media", fuente: "OCDE, Social Expenditure Database", donde: "/pulso-mundial" },
    { dato: "Deuda pública mundial", valor: "supera el 90 % del PIB", fuente: "FMI, Fiscal Monitor", donde: "/pulso-mundial" },
  ],
  supuestos: [
    "El gasto se reparte entre social e infraestructura; el resto (administración, defensa, intereses) queda como remanente.",
    "Los servicios y la infraestructura se deprecian un 3 % anual si no se reponen.",
    "El crecimiento del PIB responde a la infraestructura y al capital humano con rendimientos decrecientes.",
    "El tipo de interés sube con la deuda: 2 % + deuda/25.",
  ],
  limites: [
    "No hay ciclo económico ni recaudación endógena: los impuestos no caen cuando la economía se enfría.",
    "No distingue tipos de impuesto (renta, IVA, sociedades): solo el total.",
    "La calidad del gasto es un supuesto lineal: en la realidad la misma cifra compra cosas muy distintas.",
    "No modela pensiones por edad ni demografía: eso vive en el laboratorio de población.",
    "No es una recomendación de política fiscal. Es un mecanismo, no un consejo.",
  ],
  presets: [
    { id: "estado-social", nombre: "Estado social", descripcion: "Presión alta, mucho gasto social.", parametros: { presion: 45, social: 60, infra: 10, eficiencia: 72, deudaInicial: 95 } },
    { id: "austeridad", nombre: "Austeridad", descripcion: "Presión fiscal mantenida y recorte de gasto para bajar deuda.", parametros: { presion: 38, social: 38, infra: 8, eficiencia: 60, deudaInicial: 110 } },
    { id: "inversor", nombre: "Estado inversor", descripcion: "Infraestructura como prioridad.", parametros: { presion: 40, social: 35, infra: 28, eficiencia: 70, deudaInicial: 55 } },
  ],
  init: (p) => ({ deuda: p.deudaInicial, servicios: 55, infraestructura: 50, pib: 100, deficit: 0, anio: 0 }),
  step: (e, p, i) => {
    const recaudacion = (p.presion / 100) * e.pib;
    // Gasto primario: 38 % del PIB. Los porcentajes social e infraestructura
    // se reparten ESA caja; los intereses van aparte y no se cuentan dos veces.
    const gastoPrimario = 0.37 * e.pib;
    const gastoSocial = (p.social / 100) * gastoPrimario;
    const gastoInfra = (p.infra / 100) * gastoPrimario;
    const tipo = limitar(2 + e.deuda / 60, 2, 11);
    const intereses = (e.deuda * (tipo - 2)) / 100; // en % del PIB
    const deficit = ((gastoPrimario - recaudacion) / e.pib) * 100 + intereses;
    const ef = p.eficiencia / 100;
    // Los servicios y la infraestructura tienden a un nivel objetivo que
    // depende de cuánto se gasta en ellos y de la eficiencia con que se gasta.
    const objetivoServicios = 100 * ef * Math.min(1, (gastoSocial / e.pib) * 100 / 0.2);
    const objetivoInfra = 100 * ef * Math.min(1, (gastoInfra / e.pib) * 100 / 0.06);
    const servicios = limitar(e.servicios + (objetivoServicios - e.servicios) * 0.25 - Math.max(0, e.deuda - 110) * 0.01, 0, 100);
    const infraestructura = limitar(e.infraestructura + (objetivoInfra - e.infraestructura) * 0.25, 0, 100);
    const crecimiento = 0.010 + 0.0005 * (infraestructura - 50) + 0.0004 * (servicios - 50) - Math.max(0, e.deuda - 90) * 0.0003;
    const g = limitar(crecimiento, -0.05, 0.06);
    const pib = e.pib * (1 + g);
    const deuda = limitar(e.deuda + deficit - e.deuda * g, 0, 400);
    return { deuda, servicios, infraestructura, pib, deficit, anio: i };
  },
  derivar: (e) => ({
    deuda: e.deuda,
    deficit: e.deficit,
    servicios: e.servicios,
    infraestructura: e.infraestructura,
    pib: e.pib,
  }),
  lectura: (e, p, r) => {
    const l: string[] = [
      `Con una presión fiscal del ${p.presion} % y ${p.social} % del gasto en lo social, el país termina con una deuda del ${e.deuda.toFixed(0)} % del PIB y un déficit del ${e.deficit.toFixed(1)} %.`,
    ];
    if (e.deuda > 120) l.push("La deuda entra en zona de riesgo: cada punto nuevo cuesta más intereses y el espacio para gastar se cierra.");
    if (e.servicios < 40) l.push("Los servicios se deterioran por debajo del 40: el ahorro de hoy se paga en capital humano mañana.");
    if (e.infraestructura < 35) l.push("La infraestructura se queda corta: el modelo empieza a crecer por debajo del 1 % anual.");
    if (e.pib < r.inicial.pib * 1.02) l.push("En todo el horizonte el PIB apenas se mueve: el ajuste ha costado el crecimiento.");
    return l;
  },
};

// ───────────────────────── 3. COMERCIO Y CADENAS ─────────────────────────

type Nodo = { id: string; nombre: string; lat: number; lng: number; pib: number };

const NODOS: Nodo[] = [
  { id: "eur", nombre: "Europa", lat: 50, lng: 10, pib: 20 },
  { id: "nam", nombre: "Norteamérica", lat: 39, lng: -98, pib: 28 },
  { id: "asi", nombre: "Asia Oriental", lat: 34, lng: 115, pib: 26 },
  { id: "golf", nombre: "Golfo Pérsico", lat: 26, lng: 50, pib: 4 },
  { id: "afr", nombre: "África subsahariana", lat: 2, lng: 20, pib: 3 },
  { id: "lat", nombre: "América Latina", lat: -15, lng: -60, pib: 6 },
];

const distancia = (a: Nodo, b: Nodo) => {
  const toRad = (g: number) => (g * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
};

/** Corredores con cuello de botella: si el shock cae aquí, el coste se dispara. */
const CORREDORES: { id: string; nombre: string; a: string; b: string; choke: boolean; lat: number; lng: number }[] = [
  { id: "atlantico", nombre: "Atlántico", a: "eur", b: "nam", choke: false, lat: 45, lng: -35 },
  { id: "suez", nombre: "Suez · mar Rojo", a: "eur", b: "asi", choke: true, lat: 29, lng: 33 },
  { id: "ormuz", nombre: "Ormuz", a: "golf", b: "asi", choke: true, lat: 26, lng: 56 },
  { id: "pacifico", nombre: "Pacífico", a: "asi", b: "nam", choke: false, lat: 35, lng: -160 },
  { id: "cabotaje", nombre: "Cabo de Buena Esperanza", a: "eur", b: "afr", choke: false, lat: -20, lng: 15 },
  { id: "panama", nombre: "Panamá", a: "nam", b: "lat", choke: true, lat: 9, lng: -79 },
];

const PIB_BASE = NODOS.reduce((a, n) => a + n.pib, 0);
/** Flujo de referencia: la red tal como está declarada, sin aranceles ni shock. */
const FLUJO_BASE = (() => {
  let f = 0;
  for (let a = 0; a < NODOS.length; a++)
    for (let b = a + 1; b < NODOS.length; b++) f += (NODOS[a].pib * NODOS[b].pib) / Math.pow(distancia(NODOS[a], NODOS[b]) / 1000, 1.15);
  return f;
})();

export const comercio: ModeloLab = {
  id: "comercio",
  nombre: "Comercio y cadenas de suministro",
  categoria: "sistemas",
  pregunta: "¿Cuánto me cuesta cerrar un estrecho?",
  resumen:
    "Seis bloques comerciales conectados por seis corredores marítimos. Tú pones aranceles, fletes e inventarios; el modelo calcula el comercio total, el coste logístico y cuánto PIB se pierde cuando un corredor se bloquea.",
  contexto:
    "En 2021 el portacontenedores Ever Given bloqueó el canal de Suez seis días y se estimó en miles de millones de dólares diarios el comercio detenido. En 2024 los ataques en el mar Rojo obligaron a rodear África: más días, más combustible, más coste. Este modelo no reproduce esas cifras: reproduce el mecanismo por el que un estrecho de 300 metros mueve el precio de un contenedor en tres continentes.",
  unidadTiempo: "mes",
  pasosDefecto: 36,
  pasosMax: 72,
  variables: [
    { id: "arancel", nombre: "Arancel medio", unidad: "%", min: 0, max: 40, paso: 1, defecto: 5, origen: "eleccion", nota: "Coste que se añade a cada mercancía que cruza una frontera." },
    { id: "flete", nombre: "Coste del flete", unidad: "índice 1-4", min: 0.8, max: 4, paso: 0.1, defecto: 1.2, origen: "supuesto", nota: "Precio del transporte por unidad de mercancía." },
    { id: "inventario", nombre: "Inventario de reserva", unidad: "días", min: 0, max: 90, paso: 5, defecto: 30, origen: "eleccion", nota: "Cuánto stock guarda cada empresa. Más reserva = menos daño por shock, más coste fijo." },
    { id: "diversificacion", nombre: "Diversificación de proveedores", unidad: "0-100", min: 0, max: 100, paso: 5, defecto: 40, origen: "eleccion", nota: "Cuánto reparte cada bloque sus compras entre varios socios." },
    { id: "shock", nombre: "Shock en un corredor", unidad: "0-100", min: 0, max: 100, paso: 5, defecto: 0, origen: "eleccion", nota: "Cierre o sabotaje de un corredor concreto." },
    { id: "corredor", nombre: "Corredor afectado", unidad: "0-5", min: 0, max: 5, paso: 1, defecto: 2, origen: "eleccion", nota: "0 Atlántico · 1 Suez · 2 Ormuz · 3 Pacífico · 4 Cabo · 5 Panamá." },
  ],
  metricas: [
    { campo: "comercioTotal", nombre: "Comercio total", unidad: "índice 100 = inicio", formato: "indice", decimales: 1 },
    { campo: "coste", nombre: "Coste logístico", unidad: "índice", formato: "indice", decimales: 2 },
    { campo: "pibMundial", nombre: "PIB de la red", unidad: "índice 100 = inicio", formato: "indice", decimales: 1 },
    { campo: "perdida", nombre: "PIB perdido por el shock", unidad: "%", formato: "pct", decimales: 2 },
  ],
  series: [
    { campo: "comercioTotal", nombre: "Comercio", color: "#7dd3fc", unidad: "índice" },
    { campo: "coste", nombre: "Coste logístico", color: "#f87171", unidad: "índice" },
    { campo: "pibMundial", nombre: "PIB de la red", color: "#34d399", unidad: "índice" },
  ],
  reales: [
    { dato: "Bloqueo del canal de Suez (2021)", valor: "6 días, cientos de buques esperando", fuente: "Autoridad del Canal de Suez / prensa verificada", donde: "/conflicto/redsea" },
    { dato: "Tráfico marítimo mundial", valor: "~80 % del comercio de mercancías por volumen", fuente: "UNCTAD, Review of Maritime Transport", donde: "/mundo" },
  ],
  supuestos: [
    "Cada bloque tiene un PIB de referencia (20, 28, 26, 4, 3 y 6 unidades) que refleja su peso relativo aproximado, no una cifra oficial.",
    "El comercio sigue un modelo gravitatorio: proporcional al producto de los tamaños e inversamente proporcional a la distancia.",
    "El shock dura 6 meses y se disipa; el inventario amortigua el primer tramo.",
    "La diversificación reduce la exposición de forma lineal.",
  ],
  limites: [
    "Seis nodos no son el mundo: es un mapa de mecanismos, no un modelo de equilibrio general.",
    "No hay precios, ni tipos de cambio, ni sustitutos: si un corredor se cierra, el comercio cae, no se reasigna a otro producto.",
    "El PIB de cada bloque es una unidad de conveniencia, no un dato del Banco Mundial.",
    "No captura el efecto financiero ni el de confianza, que en la realidad amplifican el golpe.",
  ],
  presets: [
    { id: "normal", nombre: "Comercio abierto", descripcion: "Arancel bajo, fletes normales, inventario medio.", parametros: { arancel: 4, flete: 1.2, inventario: 30, diversificacion: 50, shock: 0 } },
    { id: "ormuz", nombre: "Cierre de Ormuz", descripcion: "El 80 % del corredor del golfo se corta seis meses.", parametros: { arancel: 4, flete: 1.2, inventario: 20, diversificacion: 35, shock: 80, corredor: 2 } },
    { id: "guerra-comercial", nombre: "Guerra comercial", descripcion: "Aranceles altos y proveedores concentrados.", parametros: { arancel: 25, flete: 1.6, inventario: 25, diversificacion: 20, shock: 0 } },
  ],
  init: (p) => ({
    pib0: NODOS[0].pib,
    pib1: NODOS[1].pib,
    pib2: NODOS[2].pib,
    pib3: NODOS[3].pib,
    pib4: NODOS[4].pib,
    pib5: NODOS[5].pib,
    shockActivo: p.shock,
    mes: 0,
  }),
  step: (e, p, i) => {
    const shock = i <= 6 ? p.shock / 100 : 0;
    const amortiguado = shock * (1 - p.inventario / 140);
    // el shock golpea al nodo del corredor y se propaga a sus socios
    const corredor = CORREDORES[Math.round(limitar(p.corredor, 0, 5))];
    const indice: Record<string, number> = { eur: 0, nam: 1, asi: 2, golf: 3, afr: 4, lat: 5 };
    const golpeados = new Set([corredor.a, corredor.b]);
    const salida: EstadoLab = { ...e };
    for (const nodo of NODOS) {
      const golpe = golpeados.has(nodo.id) ? amortiguado * 0.9 : amortiguado * (1 - p.diversificacion / 100) * 0.35;
      const clave = `pib${indice[nodo.id]}`;
      const apertura = 1 - p.arancel / 160;
      const base = (salida[clave] as number) * (1 + 0.0022 * apertura - golpe * 0.035);
      salida[clave] = limitar(base, 1, 200);
    }
    salida.shockActivo = Math.max(0, e.shockActivo - 100 / 7);
    salida.mes = i;
    return salida;
  },
  derivar: (e, p) => {
    const pibs = [e.pib0, e.pib1, e.pib2, e.pib3, e.pib4, e.pib5];
    let flujo = 0;
    for (let a = 0; a < NODOS.length; a++) {
      for (let b = a + 1; b < NODOS.length; b++) {
        const d = distancia(NODOS[a], NODOS[b]);
        const gravedad = (pibs[a] * pibs[b]) / Math.pow(d / 1000, 1.15);
        const corredor = CORREDORES.find(
          (c) => (c.a === NODOS[a].id && c.b === NODOS[b].id) || (c.b === NODOS[a].id && c.a === NODOS[b].id)
        );
        const penal =
          corredor && e.shockActivo > 0 && Math.round(p.corredor) === CORREDORES.indexOf(corredor)
            ? 1 - (e.shockActivo / 100) * 0.85
            : 1;
        flujo += gravedad * penal;
      }
    }
    const coste = p.flete * (1 + p.arancel / 100) * (1 + (e.shockActivo / 100) * 0.9) * (1 - p.inventario / 500);
    const pibMundial = pibs.reduce((a, b) => a + b, 0);
    // Potencial sin shock: el crecimiento que la red habría tenido. Así la
    // "pérdida" mide el daño del escenario, no la diferencia contra el año 0.
    const meses = e.mes ?? 0;
    const potencial = PIB_BASE * Math.pow(1 + 0.0022 * (1 - p.arancel / 160), meses);
    return {
      comercioTotal: (flujo / FLUJO_BASE) * 100 * (1 - p.arancel / 100),
      coste,
      pibMundial: (pibMundial / PIB_BASE) * 100,
      perdida: Math.max(0, (1 - pibMundial / potencial) * 100),
    };
  },
  lectura: (e, p, r) => {
    const pib = [e.pib0, e.pib1, e.pib2, e.pib3, e.pib4, e.pib5].reduce((a, b) => a + b, 0);
    const base = 87;
    const potencial = base * Math.pow(1 + 0.0022 * (1 - p.arancel / 160), r.pasos);
    const l = [
      `La red empieza con 87 unidades de PIB y termina con ${pib.toFixed(1)}: un ${(((pib - base) / base) * 100).toFixed(1)} % sobre el inicio y un ${(((pib - potencial) / potencial) * 100).toFixed(1)} % respecto a la trayectoria sin shock, en ${r.pasos} meses.`,
      `El coste logístico queda en ${(p.flete * (1 + p.arancel / 100)).toFixed(2)} veces el nivel base antes del shock.`,
    ];
    if (p.shock > 0) l.push(`Con el corredor ${CORREDORES[Math.round(limitar(p.corredor, 0, 5))].nombre} al ${p.shock} % de cierre, los bloques conectados por él pierden más que el resto: el comercio no desaparece, se encarece.`);
    if (p.inventario >= 60) l.push(`Un inventario de ${p.inventario} días amortigua el golpe inicial, pero inmoviliza capital todo el año.`);
    else if (p.inventario <= 10) l.push("Con inventario mínimo, el sistema funciona con eficiencia perfecta y sin ninguna resistencia: cualquier cierre se transmite entero.");
    if (p.diversificacion >= 70) l.push("La diversificación reparte el daño entre varios socios: el bloque golpeado cae, la red no.");
    return l;
  },
  mapa: (e, p) => {
    const pibs: Record<string, number> = { eur: e.pib0, nam: e.pib1, asi: e.pib2, golf: e.pib3, afr: e.pib4, lat: e.pib5 };
    const idx = Math.round(limitar(p.corredor, 0, 5));
    return {
      nota: `Cada trazo es un corredor; su grosor, el flujo comercial. El corredor ${CORREDORES[idx].nombre} es el que se corta con el shock.`,
      puntos: NODOS.map((n) => ({
        id: n.id,
        lat: n.lat,
        lng: n.lng,
        radio: 3 + (pibs[n.id] / 30) * 14,
        color: pibs[n.id] < n.pib * 0.85 ? "#f87171" : "#7dd3fc",
        etiqueta: `${n.nombre} · ${pibs[n.id].toFixed(1)}`,
      })),
      rutas: CORREDORES.map((c, i) => {
        const a = NODOS.find((n) => n.id === c.a)!;
        const b = NODOS.find((n) => n.id === c.b)!;
        const afectado = i === idx && e.shockActivo > 0;
        return {
          id: c.id,
          from: [a.lat, a.lng] as [number, number],
          to: [b.lat, b.lng] as [number, number],
          color: afectado ? "#f87171" : "#e8c56a",
          label: c.nombre,
          peso: afectado ? 1 : 0.45,
        };
      }),
    };
  },
};

// ───────────────────────── 4. PRODUCCIÓN, ENERGÍA Y RECURSOS ─────────────────────────

// Referencia del año cero para publicar índices en vez de unidades arbitrarias.
const Y0P = 1 * Math.pow(100, 0.3) * Math.pow(100, 0.5) * Math.pow(0.925, 0.2);

export const produccion: ModeloLab = {
  id: "produccion",
  nombre: "Producción, energía y recursos",
  categoria: "economia",
  pregunta: "¿Qué pasa cuando la energía deja de ser barata?",
  resumen:
    "Una economía que produce con capital, trabajo y energía, y que extrae un recurso finito. Cuanto más se extrae, peor es el retorno energético (EROI) y más cuesta mantener la producción. Tú decides inversión, eficiencia, reciclaje y tecnología.",
  contexto:
    "El EROI —cuánta energía obtienes por cada unidad que gastas en extraerla— ha caído en el petróleo convencional desde los años setenta. Ese número, y no la cantidad física de recurso, es el que decide cuándo una fuente deja de ser útil. El modelo enseña la forma del problema: el pico no llega cuando se acaba el recurso, sino cuando extraerlo cuesta más de lo que rinde.",
  unidadTiempo: "año",
  pasosDefecto: 40,
  pasosMax: 100,
  anioInicial: 2026,
  variables: [
    { id: "inversion", nombre: "Inversión en capital", unidad: "% del PIB", min: 5, max: 40, paso: 1, defecto: 22, origen: "eleccion", nota: "Máquinas y fábricas nuevas." },
    { id: "extraccion", nombre: "Ritmo de extracción", unidad: "% del recurso/año", min: 0.5, max: 8, paso: 0.1, defecto: 3, origen: "eleccion", nota: "Cuánto se saca cada año del stock." },
    { id: "eficiencia", nombre: "Eficiencia energética", unidad: "0-100", min: 10, max: 100, paso: 1, defecto: 45, origen: "eleccion", nota: "Cuánto producto se saca por unidad de energía." },
    { id: "reciclaje", nombre: "Reciclaje y sustitución", unidad: "%", min: 0, max: 60, paso: 1, defecto: 12, origen: "eleccion", nota: "Parte del recurso que vuelve al ciclo o se sustituye." },
    { id: "tecnologia", nombre: "Tecnología", unidad: "0-100", min: 0, max: 100, paso: 1, defecto: 35, origen: "eleccion", nota: "Mejora del EROI y de la productividad total." },
  ],
  metricas: [
    { campo: "producto", nombre: "Producción", unidad: "índice 100 = inicio", formato: "indice", decimales: 1 },
    { campo: "recurso", nombre: "Recurso restante", unidad: "% del stock inicial", formato: "pct", decimales: 1 },
    { campo: "eroi", nombre: "EROI", unidad: "energía obtenida / invertida", formato: "indice", decimales: 2, nota: "Por debajo de 5, la sociedad dedica una parte creciente de su esfuerzo a conseguir energía." },
    { campo: "intensidad", nombre: "Intensidad energética", unidad: "índice (100 = inicio)", formato: "indice", decimales: 1 },
  ],
  series: [
    { campo: "producto", nombre: "Producción", color: "#34d399", unidad: "índice" },
    { campo: "recurso", nombre: "Recurso restante", color: "#fbbf24", unidad: "%" },
    { campo: "eroi", nombre: "EROI", color: "#f87171", unidad: "ratio" },
  ],
  reales: [
    { dato: "EROI del petróleo convencional", valor: "de ~30:1 (años 70) a ~10:1 hoy según yacimiento", fuente: "literatura revisada sobre EROI (Murphy, Hall)", donde: "/poder" },
    { dato: "Consumo energético por unidad de PIB", valor: "cae ~1,5 % anual en economías avanzadas", fuente: "AIE, indicadores de intensidad energética", donde: "/pulso-mundial" },
  ],
  supuestos: [
    "El producto sigue una función con capital, trabajo y energía: exponentes 0,3 / 0,5 / 0,2.",
    "El EROI cae de forma logística con el recurso restante; la tecnología lo sostiene.",
    "El reciclaje reduce la extracción neta, no la demanda.",
    "No hay comercio: el recurso se extrae y se consume dentro del sistema.",
  ],
  limites: [
    "No distingue tipos de energía (fósil, nuclear, renovable): usa un único stock agregado.",
    "No incluye precios ni sustituciones de mercado.",
    "La relación EROI-recurso es una curva elegida, no una medición de ningún yacimiento real.",
    "No modela emisiones ni clima: eso vive en el laboratorio de clima.",
    "Un resultado «catastrófico» aquí es una consecuencia de los supuestos, no un pronóstico.",
  ],
  presets: [
    { id: "abundante", nombre: "Recurso abundante", descripcion: "Extracción moderada y tecnología alta.", parametros: { extraccion: 2, eficiencia: 55, reciclaje: 25, tecnologia: 60 } },
    { id: "choque", nombre: "Choque energético", descripcion: "Extracción máxima y poca sustitución.", parametros: { extraccion: 7, eficiencia: 35, reciclaje: 5, tecnologia: 25 } },
    { id: "transicion", nombre: "Transición", descripcion: "Eficiencia y reciclaje altos, extracción baja.", parametros: { extraccion: 1.6, eficiencia: 80, reciclaje: 45, tecnologia: 70 } },
  ],
  init: () => ({ k: 100, l: 100, recurso: 100, eroiBase: 20, anio: 0 }),
  step: (e, p, i, semilla) => {
    const extraido = (p.extraccion / 100) * e.recurso;
    const recurso = limitar(e.recurso - extraido * (1 - p.reciclaje / 200), 0.5, 100);
    const eroi = limitar(3 + (recurso / 100) * 22 + (p.tecnologia / 100) * 9, 1.2, 40);
    const energia = (recurso / 100) * (eroi / 20) * (0.7 + p.eficiencia / 200);
    const a = 1 + (p.tecnologia / 100) * 0.012;
    const producto = a * Math.pow(e.k, 0.3) * Math.pow(e.l, 0.5) * Math.pow(Math.max(0.05, energia), 0.2);
    const k = e.k + (p.inversion / 100) * producto - 0.05 * e.k;
    const l = e.l * 1.004;
    return { k, l, recurso, eroiBase: eroi + ruido(semilla, i, 3) * 0.15, anio: i };
  },
  derivar: (e, p) => {
    const energia = (e.recurso / 100) * (e.eroiBase / 20) * (0.7 + p.eficiencia / 200);
    const producto = (1 + (p.tecnologia / 100) * 0.012) * Math.pow(e.k, 0.3) * Math.pow(e.l, 0.5) * Math.pow(Math.max(0.05, energia), 0.2);
    return {
      producto: (producto / Y0P) * 100,
      recurso: e.recurso,
      eroi: e.eroiBase,
      intensidad: (energia / Math.max(0.1, producto / Y0P)) * 100,
    };
  },
  lectura: (e, p, r) => {
    const l = [
      `Tras ${r.pasos} años queda el ${e.recurso.toFixed(1)} % del recurso y el EROI está en ${e.eroiBase.toFixed(1)}: ${e.eroiBase < 5 ? "por debajo del umbral en el que la energía deja de ser barata." : "todavía en zona cómoda."}`,
    ];
    if (p.extraccion >= 6) l.push("Extraer al 6 % anual o más vacía el stock en dos décadas: el modelo llega al límite aunque el recurso «exista».");
    if (p.reciclaje >= 35) l.push("El reciclaje alto retrasa el pico: la misma demanda, menos extracción.");
    if (p.tecnologia >= 60) l.push("La tecnología sostiene el EROI durante un tiempo, pero no lo hace infinito.");
    return l;
  },
};
