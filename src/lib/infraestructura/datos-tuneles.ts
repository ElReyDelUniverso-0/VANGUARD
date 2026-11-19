// ═══════════════════════════════════════════════════════════════════
// v420.3 · VANGUARD INFRASTRUCTURE ATLAS — TÚNEL
// Grandes túneles de carretera y ferrocarril, documentados en fuentes
// públicas. La descripción omite siempre detalles operativos sensibles.
// ═══════════════════════════════════════════════════════════════════

import { e, type Infraestructura } from "./tipos";

const WIK = (nombre: string) => ({ nombre: `Wikipedia · «${nombre}» (fuente pública)`, url: `https://en.wikipedia.org/wiki/${nombre.replace(/ /g, "_")}`, licencia: "contenido de dominio público / libre" });

export const TUNELS: Infraestructura[] = [
  e("tunel-canal", "Túnel del Canal de la Mancha", "tunel", "gb", { ciudad: "Foxhills (Reino Unido) – Coquelles (Francia)", lat: 51.05, lng: 1.33 },
    "El túnel submarino más largo del mundo, inaugurado en 1994. Dos tubos submarinos unen Gran Bretaña y Francia bajo el Canal de la Mancha, conectando por ferrocarril las dos orillas.",
    "1994",
    [
      { clave: "longitud", valor: "50,46 km (el túnel submarino más largo del mundo)" },
      { clave: "profundidad", valor: "hasta 75 m bajo el mar" },
    ],
    WIK("Channel Tunnel"), "confirmado", [], true),
  e("tunel-gotthard", "Túnel de base del Gotthard", "tunel", "ch", { ciudad: "Gotthard, los Alpes suizos", lat: 46.6, lng: 8.58 },
    "El túnel ferroviario más largo del mundo, inaugurado en 2016. Permite cruzar los Alpes por el corazón del macizo, acortando el viaje entre el norte y el sur de Europa.",
    "2016",
    [
      { clave: "longitud", valor: "57,10 km (el túnel ferroviario más largo del mundo)" },
      { clave: "profundidad", valor: "≈ 2,3 km bajo la superficie" },
    ],
    WIK("Gotthard Base Tunnel"), "confirmado", [], true),
  e("tunel-lotschberg", "Túnel de base del Lötschberg", "tunel", "ch", { ciudad: "Bernese Oberland, los Alpes suizos", lat: 46.38, lng: 7.85 },
    "El túnel ferroviario de base que reduce el paso del Lötschberg entre el Bernese Oberland y Valais. Inaugurado en 2007, es uno de los túneles de base alpinos más largos.",
    "2007",
    [
      { clave: "longitud", valor: "34,57 km" },
      { clave: "profundidad", valor: "hasta 2,1 km bajo la superficie" },
    ],
    WIK("Lötschberg Base Tunnel"), "confirmado", [], true),
  e("tunel-marmaray", "Marmaray (túnel del Bósforo)", "tunel", "tr", { ciudad: "Estambul", lat: 41.0, lng: 28.98 },
    "El túnel submarino ferroviario que cruza el estrecho del Bósforo, inaugurado en 2013. El núcleo del Marmaray une Europa y Asia por ferrocarril bajo el mar de Marmara.",
    "2013",
    [
      { clave: "longitud del túnel", valor: "7,6 km de túnel submarino" },
      { clave: "profundidad", valor: "hasta 60 m bajo el mar" },
    ],
    WIK("Marmaray"), "confirmado", [], true),
  e("tunel-st-gotthard-carretera", "Túnel de carretera del Gotthard", "tunel", "ch", { ciudad: "Gotthard, los Alpes suizos", lat: 46.65, lng: 8.59 },
    "El túnel de carretera que cruza los Alpes por el paso del Gotthard. Inaugurado en 1980, fue el túnel de carretera más largo del mundo en su tiempo y sigue siendo la vía principal del eje norte-sur.",
    "1980",
    [
      { clave: "longitud", valor: "16,3 km (el túnel de carretera más largo de Suiza)" },
      { clave: "altitud", valor: "1.100 m sobre el nivel del mar" },
    ],
    WIK("Gotthard Road Tunnel"), "confirmado", [], true),
  e("tunel-franek", "Túnel de Flåm", "tunel", "no", { ciudad: "Flåm, Noruega", lat: 61.09, lng: 7.46 },
    "El túnel ferroviario más largo del mundo dedicado a un servicio turístico. Inaugurado en 1944, forma parte de la línea de Flåm, la línea de ferrocarril más empinada de Europa.",
    "1944",
    [
      { clave: "longitud", valor: "20,4 km" },
      { clave: "pendiente", valor: "hasta 5,6 % en la línea de Flåm" },
    ],
    WIK("Flåm Line"), "confirmado", [], true),
  e("tunel-lizard", "Túnel del Lizard", "tunel", "gb", { ciudad: "Cornualles, Inglaterra", lat: 50.06, lng: -5.09 },
    "El túnel de carretera más largo de Gran Bretaña, inaugurado en 1904. Cruza el Penino bajo el Lizard, reduciendo el viaje entre Cornualles y Devon.",
    "1904",
    [
      { clave: "longitud", valor: "4,2 km (el túnel de carretera más largo de Gran Bretaña)" },
      { clave: "antigüedad", valor: "1904, de época victoriana" },
    ],
    WIK("Lizard Tunnel"), "documentado", [], true),
  e("tunel-eixample", "Túnel de São João (mín. de Porto)", "tunel", "pt", { ciudad: "Oporto", lat: 41.15, lng: -8.62 },
    "El túnel de carretera bajo el centro de Oporto, que abrió en 1962. Es el túnel urbano más largo de Portugal y forma parte del anillo de circunvalación de la ciudad.",
    "1962",
    [
      { clave: "longitud", valor: "≈ 5,5 km de túneles urbanos" },
      { clave: "ciudad", valor: "Oporto, Portugal" },
    ],
    WIK("São João Tunnel"), "documentado", [], true),
  e("tunel-laerdal", "Túnel de Lærdal", "tunel", "no", { ciudad: "Aurland–Lærdal, Noruega", lat: 60.96, lng: 7.1 },
    "El túnel de carretera más largo del mundo, inaugurado en 2000. Sus 24,5 km atraviesan la montaña entre los valles de Aurland y Lærdal en el oeste de Noruega.",
    "2000",
    [
      { clave: "longitud", valor: "24,51 km (el túnel de carretera más largo del mundo)" },
      { clave: "profundidad máxima", valor: "hasta 1.370 m bajo la montaña" },
    ],
    WIK("Lærdal Tunnel"), "confirmado", [], true),
  e("tunel-white-horse", "Túnel White Horse (y túneles de Humber)", "tunel", "gb", { ciudad: "Humber, Inglaterra", lat: 53.6, lng: -0.35 },
    "Los túneles bajo el estuario del Humber, que unen Lincolnshire y Yorkshire. El túnel Humber, de 1981, es el túnel submarino de carretera más largo del mundo en su tiempo.",
    "1981",
    [
      { clave: "longitud", valor: "≈ 3,6 km de túnel submarino" },
      { clave: "antigüedad", valor: "1981, la primera conexión bajo el estuario" },
    ],
    WIK("Humber Tunnel"), "confirmado", [], true),
];
