// ═══════════════════════════════════════════════════════════════════
// v420.3 · VANGUARD INFRASTRUCTURE ATLAS — PRESA
// Grandes presas y embalses, documentados en fuentes públicas. Las
// cifras son las publicadas por las fuentes (algunas en rango).
// ═══════════════════════════════════════════════════════════════════

import { e, type Infraestructura } from "./tipos";

const WIK = (nombre: string) => ({ nombre: `Wikipedia · «${nombre}» (fuente pública)`, url: `https://en.wikipedia.org/wiki/${nombre.replace(/ /g, "_")}`, licencia: "contenido de dominio público / libre" });

export const PRESAS: Infraestructura[] = [
  e("presa-aswan", "Presa alta de Aswán", "presa", "eg", { ciudad: "Aswán", lat: 24.09, lng: 32.86 },
    "La presa que represó el río Nilo a finales de la década de 1960, creando el lago Naser. Cambió la hidrología del Nilo y sigue generando electricidad para Egipto.",
    "1970",
    [
      { clave: "altura", valor: "111 m" },
      { clave: "embalse (lago Naser)", valor: "≈ 500 km³, uno de los embalses más grandes del mundo" },
    ],
    WIK("Aswan High Dam"), "confirmado", [], true),
  e("presa-hoover", "Presa Hoover", "presa", "us", { ciudad: "Black Canyon, río Colorado", lat: 36.02, lng: -114.74 },
    "La presa de hormigón por gravedad más famosa del mundo, que represa el río Colorado para crear el lago Mead. Inaugurada en 1936, fue una obra de la ingeniería del siglo XX.",
    "1936",
    [
      { clave: "altura", valor: "221 m" },
      { clave: "embalse (lago Mead)", valor: "≈ 32 km³, el embalse más grande de Estados Unidos" },
    ],
    WIK("Hoover Dam"), "confirmado", [], true),
  e("presa-grand-coulee", "Presa Grand Coulee", "presa", "us", { ciudad: "Coulee Dam, río Columbia", lat: 47.96, lng: -119.03 },
    "La presa de hormigón más grande de Estados Unidos, en el río Columbia. Inaugurada en 1942, sigue siendo la principal fuente de electricidad hidroeléctrica del país.",
    "1942",
    [
      { clave: "altura", valor: "168 m" },
      { clave: "longitud", valor: "1.592 m" },
    ],
    WIK("Grand Coulee Dam"), "confirmado", [], true),
  e("presa-kariba", "Presa de Kariba", "presa", "zw", { ciudad: "kariba, río Zambeze", lat: -16.56, lng: 28.7 },
    "La presa de varios arcos más alta del mundo, que represa el río Zambeze entre Zambia y Zimbabue. Creó el lago Kariba, el embalse artificial más grande por volumen.",
    "1959",
    [
      { clave: "altura", valor: "131 m (presa de arco)" },
      { clave: "embalse (lago Kariba)", valor: "≈ 180 km³, el embalse artificial más grande del mundo" },
    ],
    WIK("Kariba Dam"), "confirmado", [], true),
  e("presa-oroville", "Presa Oroville", "presa", "us", { ciudad: "Oroville, California", lat: 39.54, lng: -121.57 },
    "La presa de tierra más alta de Estados Unidos, en el río Feather. Su embalse, el lago Oroville, es el mayor de California.",
    "1968",
    [
      { clave: "altura", valor: "230 m (la presa de tierra más alta de Estados Unidos)" },
      { clave: "embalse", valor: "≈ 4,1 km³ (lago Oroville)" },
    ],
    WIK("Oroville Dam"), "confirmado", [], true),
  e("presa-nagarjuna", "Presa Nagarjuna Sagar", "presa", "in", { ciudad: "Nalgonda, Telangana", lat: 16.7, lng: 79.43 },
    "La presa de hormigón más grande del mundo en su tiempo, que represa el río Krishna. Inaugurada en 1967, sigue siendo el embalsé más grande de India.",
    "1967",
    [
      { clave: "altura", valor: "91 m" },
      { clave: "embalse", valor: "≈ 11,4 km³, el embalse más grande de India" },
    ],
    WIK("Nagarjuna Sagar Dam"), "confirmado", [], true),
  e("presa-akosombo", "Presa de Akosombo", "presa", "gh", { ciudad: "Akosombo, río Volta", lat: 6.42, lng: -0.3 },
    "La presa que represa el río Volta para crear el lago Volta, el embalse artificial más grande del mundo por superficie. Inaugurada en 1965.",
    "1965",
    [
      { clave: "embalse (lago Volta)", valor: "≈ 8.500 km², el embalse más grande del mundo por superficie" },
      { clave: "altura", valor: "114 m" },
    ],
    WIK("Akosombo Dam"), "confirmado", [], true),
  e("presa-tarbela", "Presa de Tarbela", "presa", "pk", { ciudad: "Tarbela, río Indo", lat: 34.4, lng: 73.47 },
    "La presa de tierra más grande del mundo por volumen, en el río Indo. Inaugurada en 1974, su embalsé sigue siendo la principal reserva de agua y energía de Pakistán.",
    "1974",
    [
      { clave: "volumen de la presa", valor: "≈ 153.000.000 m³ (la presa de tierra más grande del mundo)" },
      { clave: "embalse", valor: "≈ 14,3 km³" },
    ],
    WIK("Tarbela Dam"), "confirmado", [], true),
  e("presa-kurobe", "Presa de Kurobe", "presa", "jp", { ciudad: "Kurobe, isla de Honshu", lat: 36.43, lng: 137.66 },
    "La presa de hormigón por gravedad más alta de Japón, en el río Kurobe. Su construcción, terminada en 1963, fue una de las obras de ingeniería más difíciles del país.",
    "1963",
    [
      { clave: "altura", valor: "186 m (la presa más alta de Japón)" },
      { clave: "embalse", valor: "lago Kurobe" },
    ],
    WIK("Kurobe Dam"), "confirmado", [], true),
  e("presa-glen-canyon", "Presa de Glen Canyon", "presa", "us", { ciudad: "Page, Arizona", lat: 36.93, lng: -111.48 },
    "La presa de hormigón por gravedad que represa el río Colorado en el norte de Arizona. Inaugurada en 1963, creó el lago Powell y es una de las presas más grandes de Estados Unidos.",
    "1963",
    [
      { clave: "altura", valor: "216 m" },
      { clave: "embalse (lago Powell)", valor: "≈ 33 km³" },
    ],
    WIK("Glen Canyon Dam"), "confirmado", [], true),
  e("presa-shasta", "Presa de Shasta", "presa", "us", { ciudad: "Redding, California", lat: 40.98, lng: -122.48 },
    "La presa que represa el río Sacramento en el norte de California. Inaugurada en 1945, es la segunda presa más grande de Estados Unidos y el corazón del sistema hídrico del estado.",
    "1945",
    [
      { clave: "altura", valor: "183 m" },
      { clave: "embalse (lago Shasta)", valor: "≈ 5,6 km³" },
    ],
    WIK("Shasta Dam"), "confirmado", [], true),
];
