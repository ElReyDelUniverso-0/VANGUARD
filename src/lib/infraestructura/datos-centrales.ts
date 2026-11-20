// ═══════════════════════════════════════════════════════════════════
// v420.3 · VANGUARD INFRASTRUCTURE ATLAS — CENTRAL ENERGÉTICA
// Grandes centrales eléctricas documentadas en fuentes públicas. Sólo
// datos de potencia y tecnología publicadas; nada operativo o sensible.
// ═══════════════════════════════════════════════════════════════════

import { e, type Infraestructura } from "./tipos";

const WIK = (nombre: string) => ({ nombre: `Wikipedia · «${nombre}» (fuente pública)`, url: `https://en.wikipedia.org/wiki/${nombre.replace(/ /g, "_")}`, licencia: "contenido de dominio público / libre" });

export const CENTRALES: Infraestructura[] = [
  e("central-three-gorges", "Central hidroeléctrica de las Tres Gargantas", "central-energetica", "cn", { ciudad: "Yichang, Hubei", lat: 30.82, lng: 111.0 },
    "La central hidroeléctrica más grande del mundo por capacidad instalada. Se levanta sobre el río Yangtsé y, junto a su presa, domina el control de las inundaciones del río más largo de China.",
    "2003",
    [
      { clave: "capacidad instalada", valor: "22.500 MW (la mayor del mundo)" },
      { clave: "generadores", valor: "34 unidades" },
      { clave: "producción anual", valor: "≈ 88.200 GWh" },
    ],
    WIK("Three Gorges Dam"), "confirmado", [], true),
  e("central-itaipu", "Central de Itaipu", "central-energetica", "br", { ciudad: "Foz do Iguaçu, Paraná", lat: -25.5, lng: -54.44 },
    "La segunda central hidroeléctrica más grande del mundo por capacidad instalada, en la frontera entre Brasil y Paraguay. Su presa de hormigón comparte el río Paraná con la presa de la Amistad.",
    "1984",
    [
      { clave: "capacidad instalada", valor: "14.000 MW" },
      { clave: "generadores", valor: "20 unidades" },
      { clave: "producción anual", valor: "≈ 90.000 GWh (récords de producción)" },
    ],
    WIK("Itaipu Dam"), "confirmado", [], true),
  e("central-yangtze-baihe", "Central de Baihetan", "central-energetica", "cn", { ciudad: "Jinsha, Yunnan/Sichuan", lat: 26.66, lng: 102.88 },
    "La presa más alta del mundo y una de las centrales hidroeléctricas más grandes. Inaugurada en 2021, domina el río Jinsha, el afluente superior del Yangtsé.",
    "2021",
    [
      { clave: "capacidad instalada", valor: "16.000 MW" },
      { clave: "altura de la presa", valor: "289 m, la presa más alta del mundo" },
    ],
    WIK("Baihetan Dam"), "confirmado", [], true),
  e("central-nuclear-palo-verde", "Central nuclear de Palo Verde", "central-energetica", "us", { ciudad: "Wintersburg, Arizona", lat: 33.21, lng: -112.54 },
    "La central nuclear más grande de Estados Unidos. Tres reactores de agua a presión producen electricidad para gran parte del suroeste del país.",
    "1985",
    [
      { clave: "capacidad instalada", valor: "≈ 3.930 MW (la central nuclear más grande de Estados Unidos)" },
      { clave: "reactores", valor: "3 reactores de agua a presión" },
    ],
    WIK("Palo Verde Nuclear Generating Station"), "confirmado", [], true),
  e("central-solar-bhadla", "Parque solar de Bhadla", "central-energetica", "in", { ciudad: "Bhadla, Rajastán", lat: 27.0, lng: 72.45 },
    "El parque solar más grande del mundo, en el desierto de Rajastán. Compone centrales de distintos tecnologías fotovoltaicas y concentradas.",
    "2015",
    [
      { clave: "capacidad", valor: "≈ 2.250 MW (el parque solar más grande del mundo)" },
      { clave: "superficie", valor: "≈ 57 km²" },
    ],
    WIK("Bhadla Solar Park"), "confirmado", [], true),
  e("central-solar-noor-ouarzazate", "Parque solar Noor Ouarzazate", "central-energetica", "ma", { ciudad: "Ouarzazate", lat: 31.08, lng: -7.38 },
    "El complejo solar de Ouarzazate, en el desierto marroquí. Compone centrales fotovoltaicas, de energía solar termoeléctrica y de almacenamiento, para abastecer la electricidad al país.",
    "2016",
    [
      { clave: "capacidad", valor: "≈ 580 MW (Noor IV, la fase más grande)" },
      { clave: "tecnología", valor: "fotovoltaica, termosolar y almacenamiento" },
    ],
    WIK("Noor Ouarzazate Solar Complex"), "confirmado", [], true),
  e("central-eolica-offshore-hornsea", "Parque eólico Hornsea", "central-energetica", "gb", { ciudad: "mar del Norte, Yorkshire", lat: 53.55, lng: 2.0 },
    "El parque eólico marino más grande del mundo, al este de Inglaterra. Suma dos fases y su energía se transmite a la costa por cables submarinos.",
    "2020",
    [
      { clave: "capacidad", valor: "≈ 1.219 MW (Hornsea 1+2, el parque eólico marino más grande del mundo)" },
      { clave: "turbinas", valor: "hasta 200 aerogeneradores" },
    ],
    WIK("Hornsea Wind Farm"), "confirmado", [], true),
  e("central-eolica-offshore-walney", "Parque eólico Walney", "central-energetica", "gb", { ciudad: "mar del Norte, Cumbria", lat: 54.0, lng: -3.6 },
    "El parque eólico marino de Walney, en el mar del Norte. Sumando sus fases, fue el parque eólico marino más grande del mundo antes de Hornsea.",
    "2011",
    [
      { clave: "capacidad", valor: "≈ 659 MW (Walney 1+2, récord histórico)" },
      { clave: "ubicación", valor: "mar del Norte, frente a Cumbria" },
    ],
    WIK("Walney Wind Farm"), "confirmado", [], true),
  e("central-nuclear-olkiluoto-3", "Central nuclear de Olkiluoto 3", "central-energetica", "fi", { ciudad: "Eurajoki, Finlandia", lat: 61.35, lng: 21.48 },
    "El tercer reactor de la central de Olkiluoto, un reactor EPR. Su entrada en servicio comercial en 2023 marcó la vuelta de Finlandia a la nuclear y el primer EPR en entrar en operación en Europa continental.",
    "2023",
    [
      { clave: "capacidad instalada", valor: "≈ 1.600 MW" },
      { clave: "reactores", valor: "1 reactor EPR (núcleo de la central)" },
    ],
    WIK("Olkiluoto 3"), "confirmado", [], true),
  e("central-geotermal-hellishei", "Central geotérmica de Hellisheiði", "central-energetica", "is", { ciudad: "Hellisheiði, Islandia", lat: 63.98, lng: -21.44 },
    "La segunda central geotérmica más grande de Islandia. Produce electricidad y agua caliente para Reikiavik a partir del calor volcánico del país.",
    "2006",
    [
      { clave: "capacidad", valor: "303 MW de electricidad" },
      { clave: "calor", valor: "agua caliente para Reikiavik" },
    ],
    WIK("Hellisheiði Power Station"), "confirmado", [], true),
  e("central-hidraulica-napier", "Central de Robert Moses (Robert Moses Niagara)", "central-energetica", "us", { ciudad: "Niagara Falls, Nueva York", lat: 43.08, lng: -79.06 },
    "La central hidroeléctrica de Robert Moses, junto a las cataratas del Niágara. Inaugurada en 1961, es una de las centrales hidroeléctricas más grandes de Estados Unidos.",
    "1961",
    [
      { clave: "capacidad instalada", valor: "≈ 2.420 MW" },
      { clave: "ubicación", valor: "en las cataratas del Niágara, Nueva York" },
    ],
    WIK("Robert Moses Niagara Power Plant"), "confirmado", [], true),
  e("central-eolica-onshore-whitelee", "Parque eólico de Whitelee", "central-energetica", "gb", { ciudad: "Renfrewshire, Escocia", lat: 55.8, lng: -4.5 },
    "El parque eólico terrestre más grande de Europa en su tiempo, en las colinas de Renfrewshire. Es el ejemplo de la energía eólica terrestre que produce electricidad para la red británica.",
    "2009",
    [
      { clave: "capacidad", valor: "539 MW (el parque eólico terrestre más grande de Europa en su tiempo)" },
      { clave: "turbinas", valor: "222 aerogeneradores" },
    ],
    WIK("Whitelee Wind Farm"), "confirmado", [], true),
  e("central-solar-tengger", "Parque solar del desierto de Tengger", "central-energetica", "cn", { ciudad: "Ningxia, desierto de Tengger", lat: 38.4, lng: 105.5 },
    "Uno de los mayores parques solares de China, en el desierto de Tengger. El proyecto combina parques fotovoltaicos gigantes con la reforestación y la reducción del desierto.",
    "2022",
    [
      { clave: "capacidad", valor: "≈ 1.600 MW (una de las mayores centrales solares del mundo)" },
      { clave: "ubicación", valor: "desierto de Tengger, Mongolia Interior / Ningxia" },
    ],
    WIK("Tengger Desert Solar Park"), "documentado", [], true),
  e("central-nuclear-taioshan", "Central nuclear de Taishan", "central-energetica", "cn", { ciudad: "Taishan, Guangdong", lat: 22.03, lng: 113.03 },
    "La primera central nuclear de tercera generación de China, con reactores EPR. Inaugurada comercialmente en 2018, es una de las centrales nucleares más grandes del país.",
    "2018",
    [
      { clave: "capacidad instalada", valor: "≈ 3.490 MW" },
      { clave: "reactores", valor: "2 reactores EPR" },
    ],
    WIK("Taishan Nuclear Power Plant"), "confirmado", [], true),
  e("central-eolica-offshore-wir", "Parque eólico de Rampion", "central-energetica", "gb", { ciudad: "mar del Norte, Sussex", lat: 50.2, lng: 0.5 },
    "El primer parque eólico marino de Inglaterra, frente a la costa de Sussex. Sus aerogeneradores generan electricidad para miles de hogares.",
    "2018",
    [
      { clave: "capacidad", valor: "400 MW" },
      { clave: "turbinas", valor: "116 aerogeneradores" },
    ],
    WIK("Rampion Wind Farm"), "confirmado", [], true),
];
