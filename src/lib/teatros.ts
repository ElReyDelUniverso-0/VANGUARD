// v206.0 MÁS PUERTAS — el mapa de teatros de guerra de la agencia.
// Fuente única usada por /conflicto/[tag] (página por teatro) y por
// sitemap.ts (las puertas anunciadas a Google). Solo teatros con cables
// vivos y abundantes en la BD: una URL desconocida es 404 limpio.
export const TEATROS: Record<string, { nombre: string; resumen: string }> = {
  ukraine: {
    nombre: "Ucrania",
    resumen:
      "La guerra entre Rusia y Ucrania: frentes activos, drones, misiles, energía y diplomacia. Cada cable llega verificado por fuente y alimenta el mapa en vivo.",
  },
  gaza: {
    nombre: "Gaza e Israel",
    resumen:
      "El conflicto en Gaza e Israel: operaciones, ayuda humanitaria, rehenes y la tensión regional que se extiende por Oriente Medio.",
  },
  hormuz: {
    nombre: "Ormuz y el Golfo",
    resumen:
      "El estrecho de Ormuz y el Golfo Pérsico: el cuello de botella del petróleo del mundo, escoltas navales y la tensión con Irán.",
  },
  taiwan: {
    nombre: "Taiwán y el Pacífico",
    resumen:
      "Taiwán, China y el Pacífico: ejercicios militares, incursiones aéreas, semiconductores y la carrera naval del siglo.",
  },
  sahel: {
    nombre: "El Sahel",
    resumen:
      "El Sahel africano: golpes de Estado, yihadismo, mercenarios y la nueva geopolítica del oro, el uranio y el litio.",
  },
  redsea: {
    nombre: "Mar Rojo",
    resumen:
      "El Mar Rojo y Babel-Mandeb: ataques a la navegación comercial y la respuesta de las flotas internacionales.",
  },
  korea: {
    nombre: "Las Coreas",
    resumen:
      "Corea del Norte y del Sur: lanzamientos de misiles, ejercicios conjuntos y la carrera armamentista en la península.",
  },
  sudan: {
    nombre: "Sudán",
    resumen:
      "La guerra civil en Sudán: el mayor desplazamiento de población del mundo, la hambruna y la lucha por el poder entre generales.",
  },
  lebanon: {
    nombre: "Líbano",
    resumen:
      "El Líbano y la frontera norte: Hezbolá, operaciones transfronterizas y la crisis política del país del cedro.",
  },
};
