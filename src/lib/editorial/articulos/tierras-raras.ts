import type { Articulo } from "../tipos";

export const tierrasRaras: Articulo = {
  slug: "tierras-raras-que-son-y-por-que-china-tiene-la-llave",
  titulo: "Tierras raras: qué son, para qué sirven y por qué China tiene la llave",
  entradilla:
    "Diecisiete elementos químicos que casi nadie sabe nombrar están en los motores de los coches eléctricos, en los aerogeneradores y en los misiles. Pekín controla su refinado y lo ha convertido en un arma comercial, con una tregua que vence el 10 de enero de 2027.",
  area: "recursos",
  tipo: "permanente",
  publicado: "2026-11-18",
  revisado: "2026-11-18",
  revisarCada: 30,
  hito: { fecha: "2027-01-10", que: "fin de la suspensión china de controles a la exportación (Anuncio 58/2026)" },
  imagen: "/imagenes-reales/satelite.jpg",
  claves: [
    "Son 17 elementos: los 15 lantánidos más el escandio y el itrio. No son escasos; lo difícil es separarlos y refinarlos.",
    "China extrajo 270.000 de las 390.000 toneladas mundiales de 2024 (USGS) y, según la AIE, concentra en torno al 91 % del refinado.",
    "Pekín ha prorrogado hasta el 10 de enero de 2027 la suspensión de sus controles de octubre de 2025; los de abril de 2025 siguen vigentes.",
  ],
  cuerpo: [
    { t: "h2", x: "Qué son", id: "que-son" },
    {
      t: "p",
      x: "Las tierras raras son un grupo de 17 elementos de la tabla periódica: los quince lantánidos (del lantano al lutecio), más el escandio y el itrio, que comparten propiedades químicas. Su nombre engaña: varios son más abundantes en la corteza terrestre que el plomo. Lo raro es encontrarlos concentrados en yacimientos rentables y, sobre todo, separarlos entre sí, porque se comportan de forma casi idéntica y su refinado exige procesos químicos largos, caros y contaminantes.",
    },
    {
      t: "p",
      x: "Se suelen dividir en ligeras (como el neodimio o el praseodimio) y pesadas (como el disprosio o el terbio), más escasas y más difíciles de sustituir.",
    },
    { t: "h2", x: "Para qué sirven", id: "usos" },
    {
      t: "lista",
      items: [
        "Imanes permanentes de neodimio-hierro-boro, los más potentes que existen: motores de coches eléctricos, aerogeneradores, discos duros, altavoces y drones. El disprosio y el terbio les permiten resistir altas temperaturas.",
        "Defensa: sistemas de guiado de misiles, radares, motores de aviones de combate y equipos de visión nocturna.",
        "Catalizadores para refinar petróleo y para los tubos de escape (cerio y lantano).",
        "Pantallas, láseres y fibra óptica (europio, itrio, erbio).",
      ],
    },
    { t: "h2", x: "Quién las produce", id: "produccion" },
    {
      t: "tabla",
      cab: ["País", "Producción minera 2024 (t de óxidos)", "Reservas (t)"],
      filas: [
        ["China", "270.000", "44.000.000"],
        ["Estados Unidos", "45.000", "1.900.000"],
        ["Birmania (Myanmar)", "31.000", "sin dato"],
        ["Australia", "13.000", "5.700.000"],
        ["Nigeria", "13.000", "sin dato"],
        ["Tailandia", "13.000", "4.500"],
        ["India", "2.900", "6.900.000"],
        ["Rusia", "2.500", "3.800.000"],
        ["Brasil", "20", "21.000.000"],
        ["Total mundial (redondeado)", "390.000", "más de 90.000.000"],
      ],
      nota: "Fuente: USGS, Mineral Commodity Summaries 2025 (cifras estimadas de 2024).",
    },
    {
      t: "p",
      x: "La mina es solo la mitad de la historia. Aunque China extrae algo menos de tres cuartas partes del total, su dominio está en el procesamiento: la Agencia Internacional de la Energía calcula que en 2024 concentró el 61 % de la extracción mundial y en torno al 91 % de la capacidad de refinado y procesamiento de las principales tierras raras. Gran parte del mineral extraído en Birmania o incluso en EE. UU. acaba refinándose en China. Brasil es el caso inverso: la segunda reserva del planeta y una producción casi nula.",
    },
    { t: "h2", x: "Cómo se convirtieron en un arma comercial", id: "arma" },
    {
      t: "lista",
      numerada: true,
      items: [
        "Abril de 2025: China exige licencias para exportar siete tierras raras medias y pesadas: samario, gadolinio, terbio, disprosio, lutecio, escandio e itrio. Varios fabricantes de automóviles llegaron a parar líneas de producción por falta de imanes.",
        "Octubre de 2025: Pekín amplía los controles con seis anuncios (55 a 58, 61 y 62 de 2025) que alcanzan a otros elementos, a la tecnología de refinado, a las baterías de litio, al grafito y a productos fabricados fuera de China con tierras raras chinas.",
        "Noviembre de 2025: tras la reunión de Xi Jinping y Donald Trump en Corea del Sur, China suspende durante un año los controles de octubre.",
        "9 de noviembre de 2026: el Anuncio 58/2026 prorroga esa suspensión desde el 11 de noviembre de 2026 hasta el 10 de enero de 2027, junto con la del arancel adicional del 24 % y las tasas portuarias a buques vinculados a EE. UU.",
      ],
    },
    {
      t: "aviso",
      x: "La prórroga no levanta los controles de abril de 2025: las licencias para el samario, el gadolinio, el terbio, el disprosio, el lutecio, el escandio y el itrio siguen vigentes. Vanguard revisará esta pieza antes del 10 de enero de 2027.",
    },
    { t: "h2", x: "La respuesta del resto del mundo", id: "respuesta" },
    {
      t: "p",
      x: "EE. UU., la Unión Europea, Japón y Australia financian minas, plantas de separación y reservas estratégicas, y estudian imanes que necesiten menos tierras raras pesadas, además del reciclaje de los imanes de aparatos viejos. Pero levantar una cadena de refinado lleva años: hasta entonces, la dependencia seguirá siendo una palanca en cada negociación con Pekín.",
    },
  ],
  fuentes: [
    { nombre: "USGS · Mineral Commodity Summaries 2025: Rare Earths", url: "https://pubs.usgs.gov/periodicals/mcs2025/mcs2025-rare-earths.pdf", tipo: "primaria", fecha: "2025-01" },
    { nombre: "Proactivo · China extiende hasta enero la suspensión de controles a tierras raras", url: "https://proactivo.com.pe/china-extiende-suspension-de-controles-a-tierras-raras-hasta-2027/", tipo: "secundaria", fecha: "2026-11-11" },
    { nombre: "Chemical Week · China extends rare earths export suspension to January 2027 (datos de la AIE)", url: "https://chemweek.mydigitalpublication.com/articles/china-extends-rare-earths-export-suspension-to-january-2027", tipo: "secundaria", fecha: "2026-11-13" },
    { nombre: "Rare Earth Exchanges · MOFCOM extends six export-control suspensions to January 10, 2027", url: "https://rareearthexchanges.com/news/china-mofcom-export-controls-suspension-2027/", tipo: "secundaria", fecha: "2026-11-09" },
    { nombre: "Wikipedia · Tierras raras", url: "https://es.wikipedia.org/wiki/Tierras_raras", tipo: "secundaria" },
  ],
  enlaces: [
    { href: "/mundos/cn", label: "Ficha de China" },
    { href: "/mundos/br", label: "Ficha de Brasil" },
    { href: "/pulso-mundial", label: "Pulso mundial" },
  ],
  salas: ["tierra", "observatorio"],
  etiquetas: ["tierras raras", "minerales críticos", "China", "comercio", "imanes", "coche eléctrico"],
  informe: "Pulso mundial (/pulso-mundial) · revisión obligatoria antes del 10-ene-2027",
  complementa: "Tema nuevo: ninguna sala explicaba los minerales críticos",
  cambios: [{ fecha: "2026-11-18", nota: "Publicación con datos del USGS (2024) y el Anuncio 58/2026 del MOFCOM." }],
};
