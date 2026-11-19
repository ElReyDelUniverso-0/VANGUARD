// ═══════════════════════════════════════════════════════════════════
// v420.3 · VANGUARD INFRASTRUCTURE ATLAS — PUENTE
// Grandes puentes documentados en fuentes públicas. Los datos de
// longitud y arquitectura son los publicados por las fuentes.
// ═══════════════════════════════════════════════════════════════════

import { e, type Infraestructura } from "./tipos";

const WIK = (nombre: string) => ({ nombre: `Wikipedia · «${nombre}» (fuente pública)`, url: `https://en.wikipedia.org/wiki/${nombre.replace(/ /g, "_")}`, licencia: "contenido de dominio público / libre" });

export const PUENTES: Infraestructura[] = [
  e("puente-akashi-kaikyo", "Puente Akashi Kaikyō", "puente", "jp", { ciudad: "entre Kobe y Awaji", lat: 34.62, lng: 135.02 },
    "El puente colgante con el vano más largo del mundo. Fue levantado sobre el estrecho de Akashi para conectar Kobe con la isla de Awaji tras el gran terremoto de 1995.",
    "1998",
    [
      { clave: "longitud del vano central", valor: "1.991 m (el vano más largo del mundo)" },
      { clave: "longitud total", valor: "3.911 m" },
    ],
    WIK("Akashi Kaikyo Bridge"), "confirmado", [], true),
  e("puente-golden-gate", "Puente Golden Gate", "puente", "us", { ciudad: "San Francisco", lat: 37.82, lng: -122.48 },
    "El puente colgante más famoso del mundo, que cruza la bahía de San Francisco. Fue inaugurado en 1937 y su color internacional, el orange internacional, lo hace único.",
    "1937",
    [
      { clave: "longitud del vano central", valor: "1.280 m" },
      { clave: "longitud total", valor: "2.737 m" },
      { clave: "altura de las torres", valor: "227 m sobre el agua" },
    ],
    WIK("Golden Gate Bridge"), "confirmado", [], true),
  e("puente-brooklyn", "Puente de Brooklyn", "puente", "us", { ciudad: "Nueva York", lat: 40.71, lng: -73.96 },
    "El primer puente colgante de cable de acero de Estados Unidos, que une Manhattan con Brooklyn. Inaugurado en 1883, fue la mayor obra de ingeniería de su tiempo.",
    "1883",
    [
      { clave: "longitud del vano central", valor: "486,3 m" },
      { clave: "longitud total", valor: "1.825 m" },
      { clave: "material", valor: "acero, el primer puente colgado de cable de acero" },
    ],
    WIK("Brooklyn Bridge"), "confirmado", [], true),
  e("puente-verrazano", "Puente Verrazzano-Narrows", "puente", "us", { ciudad: "Nueva York", lat: 40.61, lng: -74.04 },
    "El puente colgante que cruza el estrecho de Narrows entre Staten Island y Brooklyn. Inaugurado en 1964, su vano fue el más largo del mundo hasta 1981.",
    "1964",
    [
      { clave: "longitud del vano central", valor: "1.298 m" },
      { clave: "longitud total", valor: "4.176 m" },
    ],
    WIK("Verrazzano-Narrows Bridge"), "confirmado", [], true),
  e("puente-tower", "Puente Tower Bridge", "puente", "gb", { ciudad: "Londres", lat: 51.51, lng: -0.07 },
    "El puente basculante más famoso del mundo, que cruza el Támesis frente a la Torre de Londres. Inaugurado en 1894, sus dos torres de ladrillo son un símbolo de Londres.",
    "1894",
    [
      { clave: "abertura", valor: "244 m de longitud de vano" },
      { clave: "altura de las torres", valor: "65 m" },
      { clave: "mecanismo", valor: "puente basculante, se levanta para el tráfico de barcos" },
    ],
    WIK("Tower Bridge"), "confirmado", [], true),
  e("puente-sydney-harbour", "Puente de la Bahía de Sídney", "puente", "au", { ciudad: "Sídney", lat: -33.85, lng: 151.21 },
    "El arco de acero que cruza la bahía de Sídney. Inaugurado en 1932, es el puente de arco más ancho del mundo y uno de los símbolos de la ciudad.",
    "1932",
    [
      { clave: "longitud del arco", valor: "503 m" },
      { clave: "longitud total", valor: "1.149 m" },
      { clave: "altura", valor: "134 m sobre el agua" },
    ],
    WIK("Sydney Harbour Bridge"), "confirmado", [], true),
  e("puente-bosphorus", "Puente del Bósforo", "puente", "tr", { ciudad: "Estambul", lat: 41.08, lng: 29.07 },
    "El primer puente que cruza el Bósforo, inaugurado en 1973. Fue la primera conexión física entre Europa y Asia por carretera, casi un siglo después del puente ferroviario del mismo estrecho.",
    "1973",
    [
      { clave: "longitud total", valor: "1.074 m" },
      { clave: "longitud del vano central", valor: "1.074 m (el vano más largo en su tiempo)" },
    ],
    WIK("Bosphorus Bridge"), "confirmado", [], true),
  e("puente-25-abril", "Puente 25 de Abril", "puente", "pt", { ciudad: "Lisboa", lat: 38.7, lng: -9.13 },
    "El puente colgante que cruza el río Tajo en Lisboa. Inaugurado en 1966, su vano fue el más largo del mundo en su tiempo, y su color rojo evoca el 25 de abril de 1974.",
    "1966",
    [
      { clave: "longitud total", valor: "2.277 m (con el acceso)" },
      { clave: "longitud del vano central", valor: "1.013 m" },
    ],
    WIK("25 de Abril Bridge"), "confirmado", [], true),
  e("puente-vasco-da-gama", "Puente Vasco da Gama", "puente", "pt", { ciudad: "Lisboa", lat: 38.77, lng: -9.03 },
    "El puente atirantado más largo de Europa, inaugurado en 1998. Cruza el río Tajo al norte de Lisboa y se construyó para el Euro 98, al lado de la Expo 98.",
    "1998",
    [
      { clave: "longitud total", valor: "12.345 m (el puente más largo de Europa)" },
      { clave: "pilar", valor: "un pilar de 150 m, el más alto de Europa" },
    ],
    WIK("Vasco da Gama Bridge"), "confirmado", [], true),
  e("puente-milau", "Viaducto de Millau", "puente", "fr", { ciudad: "Millau, los Pirineos", lat: 44.12, lng: 2.57 },
    "El puente atirantado más alto del mundo, inaugurado en 2004. Cruza el valle del Tarn a 343 m de altura, por encima del río y la autopista.",
    "2004",
    [
      { clave: "altura máxima", valor: "343 m (el puente más alto del mundo)" },
      { clave: "longitud total", valor: "2.460 m" },
      { clave: "pilar principal", valor: "340 m, la pierna más alta" },
    ],
    WIK("Millau Viaduct"), "confirmado", [], true),
  e("puente-rialto", "Puente de Rialto", "puente", "it", { ciudad: "Venecia", lat: 45.44, lng: 12.33 },
    "El puente de piedra más antiguo sobre el Canal Grande de Venecia. Construido entre 1588 y 1591, su arco único y sus locales comerciales lo convierten en un icono de la ciudad.",
    "1591",
    [
      { clave: "longitud", valor: "48 m de largo" },
      { clave: "altura", valor: "7,9 m de altura del arco" },
    ],
    WIK("Rialto Bridge"), "confirmado", [], true),
  e("puente-ponte-vecchio", "Ponte Vecchio", "puente", "it", { ciudad: "Florencia", lat: 43.77, lng: 11.25 },
    "El puente medieval más famoso del mundo, que cruza el río Arno en Florencia. Construido en 1345, sigue en pie con sus locales comerciales sobre el puente.",
    "1345",
    [
      { clave: "longitud", valor: "95 m de largo" },
      { clave: "antigüedad", valor: "1345, el puente medieval más antiguo de Florencia" },
    ],
    WIK("Ponte Vecchio"), "confirmado", [], true),
  e("puente-hangzhou-bay", "Puente de la bahía de Hangzhou", "puente", "cn", { ciudad: "Hangzhou (bahía)", lat: 30.4, lng: 120.9 },
    "El puente sobre la bahía de Hangzhou, el puente colgante más largo del mundo en su tiempo. Inaugurado en 2008, une la provincia de Zhejiang con la costa a través de la bahía.",
    "2008",
    [
      { clave: "longitud total", valor: "36 km, el puente de bahía más largo del mundo" },
      { clave: "longitud del vano central", valor: "720 m" },
    ],
    WIK("Hangzhou Bay Bridge"), "confirmado", [], true),
  e("puente-baluarte", "Puente Baluarte", "puente", "mx", { ciudad: "Sinaloa – Durango", lat: 26.65, lng: -107.25 },
    "El puente atirantado más alto del mundo, inaugurado en 2012. Cruza la profunda barranca del Río Chico a 403 m de altura, en la carretera que une Sinaloa con Durango.",
    "2012",
    [
      { clave: "altura", valor: "403 m (el puente atirantado más alto del mundo)" },
      { clave: "longitud del vano central", valor: "320 m" },
    ],
    WIK("Baluarte Bridge"), "confirmado", [], true),
  e("puente-hk-zhuhai-macau", "Puente Hong Kong–Zhuhai–Macau", "puente", "cn", { ciudad: "entre Hong Kong, Zhuhai y Macau", lat: 22.28, lng: 113.77 },
    "El puente marino más largo del mundo, inaugurado en 2018. Combina un túnel submarino con dos puentes atirantados para unir Hong Kong, Zhuhai y Macau sobre el estuario del río Perla.",
    "2018",
    [
      { clave: "longitud total", valor: "55 km, el puente marino más largo del mundo" },
      { clave: "túnel", valor: "6,7 km de túnel submarino" },
      { clave: "construcción", valor: "9 años de obra (2009–2018)" },
    ],
    WIK("Hong Kong–Zhuhai–Macao Bridge"), "confirmado", [], true),
];
