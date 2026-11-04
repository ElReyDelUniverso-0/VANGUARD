// v206.0 MÁS PUERTAS — el mapa de teatros de guerra de la agencia.
// Fuente única usada por /conflicto/[tag] (página por teatro) y por
// sitemap.ts (las puertas anunciadas a Google). Solo teatros con cables
// vivos y abundantes en la BD: una URL desconocida es 404 limpio.
//
// v263.0 EL ARCHIVO QUE CRECE — cada teatro lleva sus CLAVES: las palabras
// que citan los cables que le pertenecen (lugares, actores, nombres propios
// en español, la lengua del archivo). La sala /conflicto/[tag] las usa para
// hallar candidatos ENTRE los cables sin etiqueta (74 % del archivo): el
// cable que cita «Kiev» o «Hezbolá» gana una puerta a su sala SIN que nadie
// escriba en la BD (la casa no clasifica a mano — un solo escritor —, solo
// abre la puerta y declara qué palabras la abrieron).
// v269.0 EL MAPA DEL ARCHIVO — el tamaño de página del archivo vive en la
// FUENTE (una sola verdad): la sala /conflicto/[tag] pagina con él desde
// v261 (40 por página) y ahora el sitemap deriva con el mismo número las
// páginas profundas que anuncia a Google. Si el archivo cambia de dieta,
// se cambia aquí una vez y sala y mapa siguen la misma ley.
export const PAGE_SIZE_ARCHIVO = 40;

export const TEATROS: Record<
  string,
  { nombre: string; resumen: string; claves: string[] }
> = {
  ukraine: {
    nombre: "Ucrania",
    resumen:
      "La guerra entre Rusia y Ucrania: frentes activos, drones, misiles, energía y diplomacia. Cada cable llega verificado por fuente y alimenta el mapa en vivo.",
    claves: [
      "ucrania",
      "zelenski",
      "zelensky",
      "kiev",
      "kyiv",
      "rusia",
      "kremlin",
      "putin",
      "donbas",
      "donbás",
      "crimea",
      "moscú",
      "bajmut",
      "ruso",
      "rusa",
    ],
  },
  gaza: {
    nombre: "Gaza e Israel",
    resumen:
      "El conflicto en Gaza e Israel: operaciones, ayuda humanitaria, rehenes y la tensión regional que se extiende por Oriente Medio.",
    claves: [
      "gaza",
      "israel",
      "hamás",
      "hamas",
      "netanyahu",
      "palestin",
      "rafah",
      "jénin",
      "jenin",
      "cisjordania",
      "tel aviv",
    ],
  },
  hormuz: {
    nombre: "Ormuz y el Golfo",
    resumen:
      "El estrecho de Ormuz y el Golfo Pérsico: el cuello de botella del petróleo del mundo, escoltas navales y la tensión con Irán.",
    claves: ["ormuz", "golfo pérsico", "irán", "iran", "teherán", "teheran"],
  },
  taiwan: {
    nombre: "Taiwán y el Pacífico",
    resumen:
      "Taiwán, China y el Pacífico: ejercicios militares, incursiones aéreas, semiconductores y la carrera naval del siglo.",
    claves: ["taiwán", "taiwan", "taipei", "pekin", "beijing", "xi jinping", "mar de china"],
  },
  sahel: {
    nombre: "El Sahel",
    resumen:
      "El Sahel africano: golpes de Estado, yihadismo, mercenarios y la nueva geopolítica del oro, el uranio y el litio.",
    claves: ["sahel", "malí", "níger", "burkina", "wagner", "bamako", "niamey", "yihadis"],
  },
  redsea: {
    nombre: "Mar Rojo",
    resumen:
      "El Mar Rojo y Babel-Mandeb: ataques a la navegación comercial y la respuesta de las flotas internacionales.",
    claves: ["mar rojo", "babel-mandeb", "mandeb", "hutí", "huti", "yemen", "sanaa"],
  },
  korea: {
    nombre: "Las Coreas",
    resumen:
      "Corea del Norte y del Sur: lanzamientos de misiles, ejercicios conjuntos y la carrera armamentista en la península.",
    claves: ["corea", "pyongyang", "kim jong", "seúl", "seoul"],
  },
  sudan: {
    nombre: "Sudán",
    resumen:
      "La guerra civil en Sudán: el mayor desplazamiento de población del mundo, la hambruna y la lucha por el poder entre generales.",
    claves: ["sudán", "sudan", "jartum", "darfur", "burhan", "dagalo", "hemedti"],
  },
  lebanon: {
    nombre: "Líbano",
    resumen:
      "El Líbano y la frontera norte: Hezbolá, operaciones transfronterizas y la crisis política del país del cedro.",
    claves: ["líbano", "libano", "hezbolá", "hezbola", "hezbollah", "beirut"],
  },
};
