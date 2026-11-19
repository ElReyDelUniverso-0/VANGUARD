// ═══════════════════════════════════════════════════════════════════
// v420.3 · VANGUARD INFRASTRUCTURE ATLAS — FERROCARRIL
// Grandes estaciones, líneas y redes ferroviarias, documentados en fuentes
// públicas. Nada de detalles operativos sensibles de las redes.
// ═══════════════════════════════════════════════════════════════════

import { e, type Infraestructura } from "./tipos";

const WIK = (nombre: string) => ({ nombre: `Wikipedia · «${nombre}» (fuente pública)`, url: `https://en.wikipedia.org/wiki/${nombre.replace(/ /g, "_")}`, licencia: "contenido de dominio público / libre" });

export const FERROCARRILES: Infraestructura[] = [
  e("ferrocarril-transiberiano", "Ferrocarril Transiberiano", "ferrocarril", "ru", { ciudad: "Moscú – Vladivostok", lat: 55.75, lng: 104.3 },
    "La línea ferroviaria más larga del mundo, que une Moscú con Vladivostok a lo largo de la estepa asiática. Su construcción, iniciada en 1891, unió por tren el imperio ruso de oeste a este.",
    "1916",
    [
      { clave: "longitud", valor: "≈ 9.289 km" },
      { clave: "desplazamiento", valor: "7 tiempos de oeste a este" },
    ],
    WIK("Trans-Siberian Railway"), "confirmado", [], true),
  e("ferrocarril-oriente-expreso", "Orient Express (servicio histórico)", "ferrocarril", "fr", { ciudad: "Paris – Estambul", lat: 48.85, lng: 2.35 },
    "El servicio ferroviario de lujo más famoso del mundo, que cruzaba Europa desde París hasta Estambul. El tráfico regular terminó en 2009, pero el nombre sigue siendo el símbolo del ferrocarril transfronterizo.",
    "1883",
    [
      { clave: "recorrido histórico", valor: "París – Estambul, por Stuttgart, Múnich, Viena y Budapest" },
      { clave: "fin del tráfico regular", valor: "2009 (el nombre persiste en servicios turísticos)" },
    ],
    WIK("Orient Express"), "confirmado", [], true),
  e("ferrocarril-eurostar", "Eurostar", "ferrocarril", "fr", { ciudad: "Londres – París / Bruselas", lat: 51.47, lng: 2.35 },
    "El servicio ferroviario de alta velocidad que une Gran Bretaña con el continente a través del túnel del Canal. El tráfico a través del túnel comenzó en 1994.",
    "1994",
    [
      { clave: "túnel", valor: "túnel del Canal de la Mancha" },
      { clave: "velocidad", valor: "300 km/h en el continente" },
    ],
    WIK("Eurostar"), "confirmado", [], true),
  e("ferrocarril-tgv-lGV", "Red TGV francesa y LGV", "ferrocarril", "fr", { ciudad: "París – regiones de Francia", lat: 48.85, lng: 2.35 },
    "La red de alta velocidad francesa, la primera del mundo en servicio comercial. La línea Paris–Lyon, que abrió en 1981, inauguró la era del tren de alta velocidad.",
    "1981",
    [
      { clave: "velocidad", valor: "hasta 320 km/h" },
      { clave: "primera línea", valor: "Paris–Lyon, 1981" },
    ],
    WIK("TGV"), "confirmado", [], true),
  e("ferrocarril-shinkansen", "Shinkansen (red de alta velocidad japonesa)", "ferrocarril", "jp", { ciudad: "Tokio – regiones de Japón", lat: 35.68, lng: 139.69 },
    "La primera red de tren de alta velocidad del mundo, que abrió en 1964 con la línea Tokio–Osaka. Desde entonces se ha extendido por todo el país como el nudo ferroviario de Japón.",
    "1964",
    [
      { clave: "velocidad", valor: "hasta 320 km/h" },
      { clave: "primera línea", valor: "Tokio–Osaka, 1964" },
    ],
    WIK("Shinkansen"), "confirmado", [], true),
  e("ferrocarril-shanghai-maglev", "Tren de levitación magnética de Shanghái", "ferrocarril", "cn", { ciudad: "Shanghái", lat: 31.2, lng: 121.42 },
    "El primer tren de levitación magnética de transporte comercial del mundo. Une el centro de Shanghái con el aeropuerto de Pudong y circula a la velocidad de crucero de 431 km/h.",
    "2004",
    [
      { clave: "velocidad", valor: "431 km/h en la comercial" },
      { clave: "longitud", valor: "≈ 30 km, Pudong – Longyang Road" },
    ],
    WIK("Shanghai Maglev Train"), "confirmado", [], true),
  e("ferrocarril-bernina", "Línea del Bernina (Ferrocarril del Bernina)", "ferrocarril", "ch", { ciudad: "St. Moritz – Tirano", lat: 46.5, lng: 9.9 },
    "La línea ferroviaria de vía métrica que cruza los Alpes entre St. Moritz (Suiza) y Tirano (Italia). Inaugurada en 1910, forma parte del Patrimonio de la Humanidad de la UNESCO.",
    "1910",
    [
      { clave: "altura máxima", valor: "2.253 m (Bernina Pass, la vía de tren más alta de los Alpes)" },
      { clave: "patrimonio", valor: "UNESCO, junto con la línea Albula" },
    ],
    WIK("Bernina Line"), "confirmado", [], true),
  e("ferrocarril-california-high-speed", "California High-Speed Rail", "ferrocarril", "us", { ciudad: "California", lat: 36.78, lng: -119.42 },
    "La red ferroviaria de alta velocidad de California, en construcción. Su trazado proyectado une San Francisco con Los Ángeles y Sacramento a través del Valle Central.",
    null,
    [
      { clave: "proyecto", valor: "San Francisco – Los Ángeles, en construcción" },
      { clave: "velocidad", valor: "hasta 350 km/h en el diseño" },
    ],
    WIK("California High-Speed Rail"), "documentado", [], true),
  e("ferrocarril-bharatiya-rail", "Indian Railways (red nacional)", "ferrocarril", "in", { ciudad: "todo el país", lat: 28.61, lng: 77.21 },
    "La red ferroviaria más grande de Asia y una de las más grandes del mundo por kilometraje. Nació en el siglo XIX y sigue siendo el principal modo de transporte de masas de India.",
    "1853",
    [
      { clave: "kilometraje", valor: "≈ 130.000 km de línea" },
      { clave: "pasajeros diarios", valor: "hasta 30 millones de viajeros al día" },
    ],
    WIK("Indian Railways"), "confirmado", [], true),
  e("ferrocarril-transiberiano-chine", "Red ferroviaria de China (alta velocidad)", "ferrocarril", "cn", { ciudad: "todo el país", lat: 35.0, lng: 105.0 },
    "La red de tren de alta velocidad más larga del mundo. La primera línea de alta velocidad, Pekín–Tianjin, abrió en 2008 y desde entonces la red se ha extendido por todo el país.",
    "2008",
    [
      { clave: "kilometraje de alta velocidad", valor: "≈ 45.000 km (la red de alta velocidad más larga del mundo)" },
      { clave: "velocidad", valor: "hasta 350 km/h" },
    ],
    WIK("China Railway High-Speed"), "confirmado", [], true),
  e("ferrocarril-cheshire", "Ferrocarril subterráneo de Chattanooga", "ferrocarril", "us", { ciudad: "Chattanooga, Tennessee", lat: 35.08, lng: -85.31 },
    "El primer sistema ferroviario de alta velocidad subterráneo de Estados Unidos. Sus vagones suben y bajan por tuneles bajo el centro de la ciudad para conectar la terminal con las líneas principales.",
    "1987",
    [
      { clave: "velocidad", valor: "40 km/h en los túneles subterráneos" },
      { clave: "longitud", valor: "≈ 2,7 km de túneles" },
    ],
    WIK("Chattanooga Tunnel"), "confirmado", [], true),
  e("ferrocarril-grand-central", "Grand Central Terminal", "ferrocarril", "us", { ciudad: "Nueva York", lat: 40.75, lng: -73.98 },
    "La terminal ferroviaria más famosa de Estados Unidos, inaugurada en 1913. Su gran bóveda celestial y su reloj de la atrio son iconos de la ciudad de Nueva York.",
    "1913",
    [
      { clave: "plataformas", valor: "41" },
      { clave: "vías", valor: "67" },
    ],
    WIK("Grand Central Terminal"), "confirmado", [], true),
  e("ferrocarril-st-pancras", "Estación de St Pancras", "ferrocarril", "gb", { ciudad: "Londres", lat: 51.53, lng: -0.13 },
    "La estación de tren más icónica de Londres, inaugurada en 1868. Su falsa cúpula de vidrio de la década de 1860 se reconstruyó en la renovación de 2007, que recuperó el acesso a la ciudad.",
    "1868",
    [
      { clave: "plataformas", valor: "12" },
      { clave: "servicios", valor: "Eurostar a Europa continental" },
    ],
    WIK("St Pancras railway station"), "confirmado", [], true),
  e("ferrocarril-tokyo-station", "Estación de Tokio", "ferrocarril", "jp", { ciudad: "Tokio", lat: 35.68, lng: 139.77 },
    "La principal estación de tren de Tokio, inaugurada en 1914. Su fachada de ladrillo rojo, restaurada en la década de 2010, es uno de los monumentos más fotografiados de la ciudad.",
    "1914",
    [
      { clave: "líneas", valor: "una treintena de líneas locales y nacionales" },
      { clave: "plataformas", valor: "más de 30" },
    ],
    WIK("Tokyo Station"), "confirmado", [], true),
  e("ferrocarril-chhatrapati-shivaji", "Estación de Chhatrapati Shivaji Terminus", "ferrocarril", "in", { ciudad: "Mumbai", lat: 18.94, lng: 72.84 },
    "La estación de tren más grande de India, inaugurada en 1888. Su fachada de arquitectura victoriana y su cúpula de hierro son un icono de Bombay y un Patrimonio de la Humanidad de la UNESCO.",
    "1888",
    [
      { clave: "plataformas", valor: "18" },
      { clave: "patrimonio", valor: "UNESCO, 2004" },
    ],
    WIK("Chhatrapati Shivaji Terminus"), "confirmado", [], true),
  e("ferrocarril-transcanadian", "Ferrocarril Canadiense del Pacífico (red)", "ferrocarril", "ca", { ciudad: "todo Canadá", lat: 56.13, lng: -106.35 },
    "La red ferroviaria que une las costas de Canadá por primera vez, con su línea de 7.000 km de 1912. Fue el primer ferrocarril transcontinental de Canadá y sigue siendo el nudo del país.",
    "1912",
    [
      { clave: "longitud", valor: "≈ 7.000 km de red" },
      { clave: "unión", valor: "Vancouver a Montreal, primera conexión transcontinental" },
    ],
    WIK("Canadian Pacific Railway"), "confirmado", [], true),
];
