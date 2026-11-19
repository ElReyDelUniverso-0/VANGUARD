// ═══════════════════════════════════════════════════════════════════
// v420.3 · VANGUARD INFRASTRUCTURE ATLAS — AGUA
// Grandes plantas de tratamiento de agua y sistemas de abastecimiento,
// documentados en fuentes públicas. Nada de detalles operativos sensibles.
// ═══════════════════════════════════════════════════════════════════

import { e, type Infraestructura } from "./tipos";

const WIK = (nombre: string) => ({ nombre: `Wikipedia · «${nombre}» (fuente pública)`, url: `https://en.wikipedia.org/wiki/${nombre.replace(/ /g, "_")}`, licencia: "contenido de dominio público / libre" });

export const AGUA: Infraestructura[] = [
  e("agua-new-york-city", "Sistema de abastecimiento de Nueva York", "agua", "us", { ciudad: "Nueva York", lat: 40.71, lng: -74.01 },
    "El sistema de agua de la ciudad de Nueva York, uno de los más grandes del mundo. Desde el siglo XIX capta agua de ríos y embalses en los estados vecinos y la entrega a la ciudad con filtración y desinfección.",
    "1842",
    [
      { clave: "capacidad", valor: "≈ 1.300 millones de litros al día (años recientes)" },
      { clave: "origen", valor: "embalses de las montañas de Catskill y Delaware" },
      { clave: "tratamiento", valor: "filtración y desinfección (sin cloro en exceso)" },
    ],
    WIK("New York City water supply system"), "confirmado", [], true),
  e("agua-los-angeles-aqueduct", "Acueducto de Los Ángeles", "agua", "us", { ciudad: "Los Ángeles", lat: 34.05, lng: -118.24 },
    "El sistema de abastecimiento que lleva agua a Los Ángeles desde las montañas del este. El acueducto de Los Ángeles, terminado en 1913, fue una de las obras de ingeniería hidráulica más grandes de su tiempo.",
    "1913",
    [
      { clave: "longitud", valor: "≈ 375 km del acueducto principal" },
      { clave: "origen", valor: "río Owens, en la Sierra Nevada" },
    ],
    WIK("Los Angeles Aqueduct"), "confirmado", [], true),
  e("agua-las-vegas-river", "Sistema de agua de Las Vegas", "agua", "us", { ciudad: "Las Vegas, Nevada", lat: 36.17, lng: -115.14 },
    "El sistema de agua que abastece a Las Vegas, dependiente del lago Mead. El lago, formado por la presa Hoover, es la principal reserva de la ciudad en el desierto.",
    "1937",
    [
      { clave: "origen", valor: "lago Mead, alimentado por el río Colorado" },
      { clave: "dependencia", valor: "el lago Mead es la reserva principal" },
    ],
    WIK("Las Vegas Valley Water District"), "documentado", [], true),
  e("agua-delhi-mckenzie", "Planta de tratamiento de Delhi (Malvan)", "agua", "in", { ciudad: "Nueva Delhi", lat: 28.61, lng: 77.21 },
    "La planta de tratamiento de agua que abastece a Nueva Delhi. Es una de las plantas de tratamiento más grandes de Asia, con una capacidad muy grande de filtración.",
    "1930",
    [
      { clave: "capacidad", valor: "≈ 700 millones de litros al día" },
      { clave: "origen", valor: "río Yamuna" },
    ],
    WIK("Delhi water supply"), "por verificar", [], true),
  e("agua-shanghai-qingpu", "Planta de agua de Qingpu (Shanghái)", "agua", "cn", { ciudad: "Shanghái", lat: 31.15, lng: 121.12 },
    "La planta de tratamiento de agua que abastece a Shanghái, incluida la zona de Qingpu. Es una de las plantas de tratamiento más grandes del mundo.",
    "2016",
    [
      { clave: "capacidad", valor: "≈ 2.4 millones de m³ al día (la planta más grande del mundo)" },
      { clave: "ubicación", valor: "Qingpu, en el distrito de Songjiang" },
    ],
    WIK("Qingpu Water Treatment Plant"), "por verificar", [], true),
  e("agua-durban-umbilo", "Planta de Umbilo (Durban)", "agua", "za", { ciudad: "Durban", lat: -29.85, lng: 31.03 },
    "La planta de tratamiento de agua que abastece a Durban, la mayor ciudad de KwaZulu-Natal. Es una de las plantas de tratamiento más grandes de Sudáfrica.",
    "1990",
    [
      { clave: "capacidad", valor: "≈ 200 millones de litros al día" },
      { clave: "ubicación", valor: "río Umbilo, al norte de Durban" },
    ],
    WIK("Umbilo Water Treatment Plant"), "por verificar", [], true),
  e("agua-philadelphia-baines", "Planta de tratamiento de Filadelfia", "agua", "us", { ciudad: "Filadelfia, Pensilvania", lat: 39.95, lng: -75.16 },
    "El sistema de agua de Filadelfia, uno de los más antiguos de Estados Unidos. Sus plantas filtran y tratan agua del río Delaware para la ciudad.",
    "1895",
    [
      { clave: "capacidad", valor: "≈ 450 millones de litros al día" },
      { clave: "origen", valor: "río Delaware" },
    ],
    WIK("Philadelphia Water Department"), "por verificar", [], true),
  e("agua-singapur-newater", "Sistema NEWater de Singapur", "agua", "sg", { ciudad: "Singapur", lat: 1.35, lng: 103.82 },
    "El sistema de reutilización de agua de Singapur, que recicla aguas residuales tratadas para la industria y rellena los embalses. Es un referente mundial de la reutilización del agua.",
    "2003",
    [
      { clave: "capacidad", valor: "hasta el 40 % de la demanda de Singapur" },
      { clave: "tecnología", valor: "microfiltración, ósmosis inversa y ultravioleta" },
    ],
    WIK("NEWater"), "confirmado", [], true),
  e("agua-cape-town-voelklip", "Plantas de tratamiento del Cabo", "agua", "za", { ciudad: "Ciudad del Cabo", lat: -33.93, lng: 18.42 },
    "Las plantas de tratamiento que abastecen a Ciudad del Cabo, entre ellas Voëlklip. El sistema del Cabo tuvo que racionar agua durante la gran sequía de los años 2010.",
    "1970",
    [
      { clave: "capacidad", valor: "≈ 700 millones de litros al día (pico del sistema)" },
      { clave: "sequía", valor: "2015–2018, la ciudad racionó agua" },
    ],
    WIK("Cape Town water supply"), "por verificar", [], true),
  e("agua-sao-paulo-cantareira", "Sistema Cantareira (São Paulo)", "agua", "br", { ciudad: "São Paulo", lat: -23.55, lng: -46.63 },
    "El sistema de abastecimiento que abastece a la ciudad de São Paulo. El sistema Cantareira, entre los estados de São Paulo y Minas Gerais, es una de las mayores fuentes de agua del país.",
    "1910",
    [
      { clave: "capacidad", valor: "≈ 33 millones de m³ al día" },
      { clave: "origen", valor: "río Paraíba do Sul" },
    ],
    WIK("Cantareira System"), "por verificar", [], true),
  e("agua-rio-de-janeiro-itaguai", "Sistema de agua de Río de Janeiro", "agua", "br", { ciudad: "Río de Janeiro", lat: -22.9, lng: -43.17 },
    "El sistema de agua que abastece a Río de Janeiro. Las plantas del sistema, entre ellas Itaguaí, filtran y tratan el agua de las fuentes de la región metropolitana.",
    "1975",
    [
      { clave: "capacidad", valor: "≈ 38 millones de m³ al día (pico del sistema)" },
      { clave: "origen", valor: "ríos y embalses de la región" },
    ],
    WIK("Rio de Janeiro water supply"), "por verificar", [], true),
  e("agua-london-thames", "Sistema de agua de Londres (Thames Water)", "agua", "gb", { ciudad: "Londres", lat: 51.51, lng: -0.13 },
    "El sistema de abastecimiento de Londres, operado por Thames Water. Capta agua del río Thames y de embalses en el interior y la trata para la ciudad más grande de Europa.",
    "1855",
    [
      { clave: "capacidad", valor: "≈ 2.500 millones de litros al día" },
      { clave: "origen", valor: "río Thames y embalses del sur de Inglaterra" },
    ],
    WIK("Thames Water"), "confirmado", [], true),
];
