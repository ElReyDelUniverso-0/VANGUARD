// ═══════════════════════════════════════════════════════════════════
// v412.0 · EL MOTOR DE NEXOS — lo que conecta las seis familias
//
// El problema medido: la casa tiene 88 páginas y tres simuladores que hablan
// del mismo mundo, pero cada uno vivía en su carril. Un visitante que abría
// /labs/macro no tenía ni una puerta a los datos que alimentan el modelo; y
// una ficha de país no decía qué modelo explica el mecanismo que muestra.
//
// Este archivo declara, para cada laboratorio y para cada país, las salidas
// que existen DE VERDAD, con su familia y el motivo por el que se enlazan.
// No inventa rutas: tools/arquitectura/probar.mjs comprueba una a una contra
// el censo del árbol (src/lib/arquitectura/censo.json) y falla si alguna no
// está en src/app.
//
// Regla de la casa que también se aplica aquí: ningún nexo promete un dato
// que la página de destino no tenga. Por eso cada motivo dice qué se va a
// encontrar y, cuando el modelo NO simula el país concreto, lo dice.
// ═══════════════════════════════════════════════════════════════════

export type FamiliaNexo = "pais" | "datos" | "mapa" | "cronologia" | "simulador" | "herramienta";

export interface Nexo {
  /** ruta real de la casa (puede llevar {iso} como plantilla) */
  ruta: string;
  etiqueta: string;
  familia: FamiliaNexo;
  /** por qué se enlaza: qué hay al otro lado */
  porque: string;
}

export const FAMILIA_NEXO: Record<FamiliaNexo, { nombre: string; color: string }> = {
  pais: { nombre: "País", color: "#5eead4" },
  datos: { nombre: "Dato", color: "#7dd3fc" },
  mapa: { nombre: "Mapa", color: "#a3e635" },
  cronologia: { nombre: "Cronología", color: "#fca5a5" },
  simulador: { nombre: "Simulador", color: "#fcd34d" },
  herramienta: { nombre: "Herramienta", color: "#c4b5fd" },
};

/** Las salidas comunes a los quince laboratorios: existen para todos. */
const NEXOS_BASE: Nexo[] = [
  {
    ruta: "/datos",
    etiqueta: "El catálogo de datos",
    familia: "datos",
    porque: "Los doce modelos de datos de la casa con su procedencia, su licencia, su fecha de captura y sus límites escritos.",
  },
  {
    ruta: "/mundos",
    etiqueta: "La ficha de cualquier país",
    familia: "pais",
    porque: "249 fichas con población, superficie, economía y vecinos: los mismos países cuyos totales mueve este modelo.",
  },
  {
    ruta: "/escenarios",
    etiqueta: "El Estratega",
    familia: "herramienta",
    porque: "La otra forma de simular de la casa: presión por teatro, también con supuestos a la vista.",
  },
  {
    ruta: "/colecciones",
    etiqueta: "Recorridos guiados",
    familia: "herramienta",
    porque: "Siete colecciones que encadenan salas por tema, para seguir el hilo sin volver al principio.",
  },
];

/** Los nexos propios de cada modelo, por familia de conocimiento. */
const NEXOS_PROPIOS: Record<string, Nexo[]> = {
  macro: [
    {
      ruta: "/comparador",
      etiqueta: "Comparar países",
      familia: "datos",
      porque: "El PIB, la población y la deuda de dos a cuatro países a la vez, con su puesto mundial y el año de cada cifra.",
    },
    { ruta: "/rankings", etiqueta: "Los rankings", familia: "datos", porque: "Las ocho listas mundiales completas: dónde cae cada economía respecto de las demás." },
    {
      ruta: "/mundos/es",
      etiqueta: "España, ficha a ficha",
      familia: "pais",
      porque: "Un país concreto para contrastar el orden de magnitud que devuelve el modelo.",
    },
    { ruta: "/divisas", etiqueta: "Divisas y mercado", familia: "datos", porque: "El tipo de cambio y el mercado: lo que este modelo deja fuera por diseño." },
  ],
  fiscal: [
    { ruta: "/rankings", etiqueta: "Peso económico", familia: "datos", porque: "Para comparar el tamaño del presupuesto con el de la economía que lo sostiene." },
    { ruta: "/poder", etiqueta: "El poder", familia: "herramienta", porque: "Quién decide el gasto y con qué instrumentos, país a país." },
    { ruta: "/organizaciones", etiqueta: "Los bloques", familia: "datos", porque: "Dieciséis organizaciones con sus miembros y su peso conjunto: el marco donde se negocia el presupuesto." },
  ],
  comercio: [
    { ruta: "/mapas", etiqueta: "El globo por capas", familia: "mapa", porque: "La capa económica sobre el planeta real: el modelo dibuja una red sin fronteras y el mapa pone las fronteras." },
    { ruta: "/divisas", etiqueta: "Divisas", familia: "datos", porque: "El comercio entre monedas distintas: el modelo lo simplifica y esta sala enseña el detalle." },
    { ruta: "/organizaciones", etiqueta: "Aduanas y bloques", familia: "datos", porque: "Los bloques comerciales reales con sus miembros de pleno derecho." },
  ],
  produccion: [
    { ruta: "/atlas", etiqueta: "El atlas", familia: "mapa", porque: "Las naciones con capital, población y moneda: el punto de partida de la producción que suma el modelo." },
    { ruta: "/pulso-mundial", etiqueta: "Datos vivos", familia: "datos", porque: "El planeta medido en tiempo real: lo que este modelo, que trabaja en años, no puede ver." },
  ],
  demografia: [
    {
      ruta: "/demografia",
      etiqueta: "El centro de población",
      familia: "datos",
      porque: "Cuántos países reúnen la mitad de la humanidad, la brecha de esperanza de vida y el peso de cada grupo de edad.",
    },
    { ruta: "/mundos/jp", etiqueta: "Japón, el caso extremo", familia: "pais", porque: "El país que mejor muestra el envejecimiento que simula este modelo." },
    { ruta: "/mundos/ng", etiqueta: "Nigeria, el otro extremo", familia: "pais", porque: "La estructura de edad contraria: la misma máquina, el otro lado del mundo." },
    { ruta: "/regiones", etiqueta: "Las regiones", familia: "datos", porque: "Las 24 subregiones con sus cifras sumadas: el mapa donde encaja la población que simulas." },
  ],
  urbanizacion: [
    { ruta: "/mapas", etiqueta: "El mapa", familia: "mapa", porque: "Las capas de población sobre el territorio: el modelo da porcentajes, el mapa da sitio." },
    { ruta: "/demografia", etiqueta: "Población", familia: "datos", porque: "De dónde sale la gente que llega a la ciudad." },
    { ruta: "/mundos/do", etiqueta: "República Dominicana", familia: "pais", porque: "Un país con urbanización alta y datos públicos para contrastar el orden de magnitud." },
  ],
  acople: [
    { ruta: "/demografia", etiqueta: "La población real", familia: "datos", porque: "El modelo acopla economía y edades; este centro tiene las cifras de partida por país." },
    { ruta: "/comparador", etiqueta: "Dos países cara a cara", familia: "datos", porque: "Para poner juntos los dos extremos demográficos y ver la diferencia de base." },
    { ruta: "/labs/macro", etiqueta: "El modelo económico suelto", familia: "simulador", porque: "La mitad económica de este acoplamiento, sin la demografía encima." },
  ],
  clima: [
    { ruta: "/pulso-mundial", etiqueta: "Datos vivos", familia: "datos", porque: "Clima espacial, sismos y señales: la observación del planeta, no su simulación." },
    { ruta: "/mapas", etiqueta: "Capas del planeta", familia: "mapa", porque: "El territorio donde ocurriría lo que el modelo calcula." },
    { ruta: "/labs/agua", etiqueta: "La cuenca", familia: "simulador", porque: "El clima mueve el agua: el modelo vecino que recoge esa consecuencia." },
  ],
  agua: [
    { ruta: "/labs/clima", etiqueta: "El clima", familia: "simulador", porque: "De dónde sale la recarga de la cuenca que aquí se vacía." },
    { ruta: "/labs/territorio", etiqueta: "El suelo", familia: "simulador", porque: "El otro recurso lento: lo que se pierde cuando se riega de más." },
    { ruta: "/mapas", etiqueta: "Dónde está el agua", familia: "mapa", porque: "El mapa pone cuenca y país donde el modelo solo pone números." },
  ],
  territorio: [
    { ruta: "/atlas", etiqueta: "El atlas", familia: "mapa", porque: "Superficie y población reales de cada nación." },
    { ruta: "/mapas", etiqueta: "El globo", familia: "mapa", porque: "El suelo que el modelo erosiona, visto en su sitio." },
    { ruta: "/labs/produccion", etiqueta: "La producción", familia: "simulador", porque: "Cuánto rinde ese suelo y a qué coste." },
  ],
  imperios: [
    {
      ruta: "/historia",
      etiqueta: "El archivo de la historia",
      familia: "cronologia",
      porque: "Las guerras que enseñaron a leer las de hoy, con su fecha y su resultado.",
    },
    { ruta: "/mundos/tr", etiqueta: "Turquía, ficha de país", familia: "pais", porque: "El territorio donde el modelo pone un imperio: la ficha dice quién vive ahí hoy." },
    { ruta: "/archivo-mundial", etiqueta: "Archivo mundial", familia: "cronologia", porque: "Eras y carteles verificados, el material de contexto de cualquier imperio." },
  ],
  rutas: [
    { ruta: "/historia", etiqueta: "Cronología", familia: "cronologia", porque: "Para fechar las rutas que el modelo recorre sin fecha." },
    { ruta: "/mapas", etiqueta: "El mapa real", familia: "mapa", porque: "El modelo dibuja una retícula; aquí está el planeta con sus relieves y sus costas." },
    { ruta: "/archivo-mundial", etiqueta: "Archivo mundial", familia: "cronologia", porque: "Las eras y los personajes que hicieron transitables esas rutas." },
  ],
  red: [
    { ruta: "/pulso-mundial", etiqueta: "Datos vivos", familia: "datos", porque: "El estado del planeta en vivo: la red que aquí se apaga en cascada, observada de verdad." },
    { ruta: "/datos", etiqueta: "Procedencia", familia: "datos", porque: "Qué datos tiene y qué no tiene la casa sobre infraestructura, con su fecha." },
    { ruta: "/labs/energia", etiqueta: "La energía", familia: "simulador", porque: "La red eléctrica es el caso concreto de una red en cascada." },
  ],
  energia: [
    { ruta: "/labs/red", etiqueta: "La red", familia: "simulador", porque: "Qué pasa con la mezcla cuando la red no aguanta." },
    { ruta: "/rankings", etiqueta: "Los rankings", familia: "datos", porque: "Peso económico y población: el tamaño de la demanda que hay que cubrir." },
    { ruta: "/mapas", etiqueta: "El mapa", familia: "mapa", porque: "Dónde hay sol, viento y ríos: el modelo reparte sin geografía." },
  ],
  transporte: [
    { ruta: "/demografia", etiqueta: "La población", familia: "datos", porque: "Cuánta gente se mueve y hacia dónde crece." },
    { ruta: "/labs/urbanizacion", etiqueta: "La ciudad", familia: "simulador", porque: "El modelo de al lado: la ciudad que crece es la que se atasca." },
    { ruta: "/mapas", etiqueta: "El territorio", familia: "mapa", porque: "La forma real de la ciudad que el modelo trata como una línea." },
  ],
};

/** Todas las salidas de un laboratorio: las comunes más las suyas. */
export function nexosDeModelo(id: string): Nexo[] {
  const propios = NEXOS_PROPIOS[id] ?? [];
  const yaEsta = new Set(propios.map((n) => n.ruta));
  return [...propios, ...NEXOS_BASE.filter((n) => !yaEsta.has(n.ruta))];
}

/** Cuántos nexos declara cada familia (para la sala de arquitectura). */
export function cuentaNexos() {
  const todas = new Map<string, Nexo>();
  for (const id of Object.keys(NEXOS_PROPIOS)) {
    for (const n of nexosDeModelo(id)) todas.set(`${id}|${n.ruta}`, n);
  }
  const porFamilia: Record<FamiliaNexo, number> = { pais: 0, datos: 0, mapa: 0, cronologia: 0, simulador: 0, herramienta: 0 };
  for (const n of todas.values()) porFamilia[n.familia] += 1;
  return { modelos: Object.keys(NEXOS_PROPIOS).length, enlaces: todas.size, porFamilia };
}

// ───────────────────────────────────────────────────────────────────
// DEL PAÍS AL RESTO DE LA CASA
//
// Una ficha de país es el nodo más rico de la plataforma (geografía, economía,
// población, vecinos, bloques) y era el más aislado: no decía qué modelo
// explica lo que enseña. Estas cinco salidas son iguales para los 249 países
// porque las cinco existen para todos; ninguna promete datos por país que la
// casa no tenga.
// ───────────────────────────────────────────────────────────────────

export function nexosDePais(iso: string): Nexo[] {
  return [
    {
      ruta: "/comparador",
      etiqueta: "Comparar con otros",
      familia: "datos",
      porque: "Poner este país al lado de hasta tres más en ocho indicadores, con el año real de cada cifra.",
    },
    {
      ruta: "/mapas",
      etiqueta: "Verlo en el globo",
      familia: "mapa",
      porque: "El mismo territorio con las capas de población, economía y clima por encima.",
    },
    {
      ruta: "/labs/demografia",
      etiqueta: "Simular su población",
      familia: "simulador",
      porque: "El mecanismo del envejecimiento, con una advertencia escrita: el modelo usa cohortes genéricas, no los datos de este país.",
    },
    {
      ruta: "/labs/macro",
      etiqueta: "Simular su economía",
      familia: "simulador",
      porque: "Cómo crece una economía y cómo se le va la deuda. Tampoco usa las cifras de este país: sirve para entender el mecanismo.",
    },
    {
      ruta: "/datos",
      etiqueta: "De dónde salen sus cifras",
      familia: "datos",
      porque: "El catálogo con la fuente, la licencia y la fecha de captura de cada indicador de la ficha.",
    },
    {
      ruta: "/historia",
      etiqueta: "Su historia en el archivo",
      familia: "cronologia",
      porque: "Las guerras del archivo que tocaron este territorio, con fecha y resultado.",
    },
    {
      ruta: `/mundos/${iso}`,
      etiqueta: "La ficha de este país",
      familia: "pais",
      porque: "Volver al punto de partida: geografía, economía, vecinos y bloques en una sola página.",
    },
  ];
}
