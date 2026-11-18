// ═══════════════════════════════════════════════════════════════════
// v407.1 · LAS ORGANIZACIONES INTERNACIONALES — quién se sienta con quién
//
// La casa hablaba de la OTAN, los BRICS, la OPEP o el G20 en sus artículos y
// cables, pero no tenía un lugar donde ver QUIÉN está dentro de cada bloque ni
// cuánto pesa junto. Esta tabla lo declara: miembros de pleno derecho (ISO-2),
// fundación, sede y la fuente oficial donde se comprueba.
//
// Reglas:
//   · solo miembros de pleno derecho; observadores, socios e invitados van en
//     la nota, nunca en la lista;
//   · cada bloque lleva su fuente y la fecha en que se revisó la lista;
//   · los cambios recientes (salidas, ingresos, suspensiones) se dicen en la
//     nota para que nadie lea una lista vieja como si fuera de hoy.
// Pura y liviana: sin importar tablas (la usan relaciones.ts y la ficha).
// ═══════════════════════════════════════════════════════════════════

export type TipoOrganizacion = "seguridad" | "economia" | "politica" | "energia" | "integracion";

export interface Organizacion {
  clave: string;
  sigla: string;
  nombre: string;
  tipo: TipoOrganizacion;
  fundacion: number;
  sede: string;
  /** qué hace, en una frase */
  proposito: string;
  /** por qué importa hoy, en una frase (sin opinión: hechos) */
  porQue: string;
  miembros: string[];
  nota: string;
  fuente: { nombre: string; url: string };
}

export const REVISION_ORGANIZACIONES = "2026-11-14";

export const TIPOS_ORGANIZACION: Record<TipoOrganizacion, string> = {
  seguridad: "Seguridad y defensa",
  economia: "Economía y finanzas",
  politica: "Diplomacia y política",
  energia: "Energía",
  integracion: "Integración regional",
};

export const ORGANIZACIONES: Organizacion[] = [
  {
    clave: "consejo-seguridad",
    sigla: "P5",
    nombre: "Consejo de Seguridad de la ONU · miembros permanentes",
    tipo: "seguridad",
    fundacion: 1945,
    sede: "Nueva York",
    proposito: "Los cinco países con asiento permanente y derecho de veto en el órgano que autoriza sanciones y misiones de paz.",
    porQue: "Un solo veto basta para frenar cualquier resolución: por eso las guerras con una potencia implicada rara vez tienen respuesta del Consejo.",
    miembros: ["us", "gb", "fr", "ru", "cn"],
    nota: "El Consejo tiene además 10 miembros no permanentes elegidos por dos años, que rotan y no se listan aquí.",
    fuente: { nombre: "Naciones Unidas · Consejo de Seguridad", url: "https://www.un.org/securitycouncil/es/content/current-members" },
  },
  {
    clave: "otan",
    sigla: "OTAN",
    nombre: "Organización del Tratado del Atlántico Norte",
    tipo: "seguridad",
    fundacion: 1949,
    sede: "Bruselas",
    proposito: "Alianza militar de defensa colectiva: un ataque contra un miembro se considera un ataque contra todos (artículo 5).",
    porQue: "Finlandia (2023) y Suecia (2024) entraron tras la invasión rusa de Ucrania; la alianza pasó de 30 a 32 miembros.",
    miembros: ["al", "be", "bg", "ca", "hr", "cz", "dk", "ee", "fi", "fr", "de", "gr", "hu", "is", "it", "lv", "lt", "lu", "me", "nl", "mk", "no", "pl", "pt", "ro", "sk", "si", "es", "se", "tr", "gb", "us"],
    nota: "32 miembros. Ucrania no es miembro: tiene un consejo OTAN-Ucrania.",
    fuente: { nombre: "OTAN · países miembros", url: "https://www.nato.int/cps/en/natohq/topics_52044.htm" },
  },
  {
    clave: "union-europea",
    sigla: "UE",
    nombre: "Unión Europea",
    tipo: "integracion",
    fundacion: 1993,
    sede: "Bruselas",
    proposito: "Unión política y económica con mercado único, moneda común en 20 de sus países y leyes que obligan a todos.",
    porQue: "Es el mayor bloque comercial del planeta y negocia como una sola voz en comercio, sanciones y clima.",
    miembros: ["at", "be", "bg", "hr", "cy", "cz", "dk", "ee", "fi", "fr", "de", "gr", "hu", "ie", "it", "lv", "lt", "lu", "mt", "nl", "pl", "pt", "ro", "sk", "si", "es", "se"],
    nota: "27 miembros desde la salida del Reino Unido (31-ene-2020). Fundación: Tratado de Maastricht (1993), heredera de la CEE de 1957.",
    fuente: { nombre: "Unión Europea · países", url: "https://european-union.europa.eu/principles-countries-history/eu-countries_es" },
  },
  {
    clave: "g7",
    sigla: "G7",
    nombre: "Grupo de los Siete",
    tipo: "economia",
    fundacion: 1975,
    sede: "Sin sede: presidencia rotatoria",
    proposito: "Foro de las siete grandes economías industrializadas de tradición democrática.",
    porQue: "Coordina sanciones, ayuda y posiciones económicas de Occidente; la UE participa sin ser miembro.",
    miembros: ["us", "ca", "gb", "fr", "de", "it", "jp"],
    nota: "La Unión Europea asiste a todas las cumbres sin ser miembro. Rusia fue suspendida del entonces G8 en 2014.",
    fuente: { nombre: "Wikipedia · G7", url: "https://es.wikipedia.org/wiki/G7" },
  },
  {
    clave: "g20",
    sigla: "G20",
    nombre: "Grupo de los Veinte",
    tipo: "economia",
    fundacion: 1999,
    sede: "Sin sede: presidencia rotatoria",
    proposito: "Foro de las principales economías desarrolladas y emergentes para coordinar la economía mundial.",
    porQue: "Estados Unidos preside el G20 en 2026; la cumbre de líderes está prevista en Doral (Miami) los días 14 y 15 de diciembre.",
    miembros: ["ar", "au", "br", "ca", "cn", "fr", "de", "in", "id", "it", "jp", "kr", "mx", "ru", "sa", "za", "tr", "gb", "us"],
    nota: "19 países más dos bloques que no se cuentan aquí como países: la Unión Europea y la Unión Africana (desde 2023).",
    fuente: { nombre: "Wikipedia · G20", url: "https://es.wikipedia.org/wiki/G-20" },
  },
  {
    clave: "brics",
    sigla: "BRICS",
    nombre: "BRICS",
    tipo: "economia",
    fundacion: 2009,
    sede: "Sin sede: presidencia rotatoria",
    proposito: "Grupo de grandes economías emergentes que busca más peso en las finanzas y la gobernanza mundial.",
    porQue: "Se amplió en 2024 y 2025; India lo presidió en 2026 (cumbre de Nueva Delhi) y China lo presidirá en 2027.",
    miembros: ["br", "ru", "in", "cn", "za", "eg", "et", "ir", "ae", "id"],
    nota: "10 miembros plenos. Arabia Saudita fue invitada en 2023 pero no ha formalizado su ingreso y no se cuenta aquí. Hay además una categoría de «países socios» que no son miembros.",
    fuente: { nombre: "Wikipedia · BRICS", url: "https://es.wikipedia.org/wiki/BRICS" },
  },
  {
    clave: "opep",
    sigla: "OPEP",
    nombre: "Organización de Países Exportadores de Petróleo",
    tipo: "energia",
    fundacion: 1960,
    sede: "Viena",
    proposito: "Coordina la producción de petróleo de sus miembros para influir en el precio del crudo.",
    porQue: "Emiratos Árabes Unidos salió de la OPEP y de la OPEP+ el 1 de mayo de 2026; Angola se había ido en enero de 2024.",
    miembros: ["dz", "cg", "gq", "ga", "ir", "iq", "kw", "ly", "ng", "sa", "ve"],
    nota: "11 miembros tras la salida de Emiratos (1-may-2026). La OPEP+ añade productores aliados como Rusia, que no son miembros de la OPEP.",
    fuente: { nombre: "OPEP · países miembros", url: "https://www.opec.org/opec_web/en/about_us/25.htm" },
  },
  {
    clave: "ocs",
    sigla: "OCS",
    nombre: "Organización de Cooperación de Shanghái",
    tipo: "seguridad",
    fundacion: 2001,
    sede: "Pekín",
    proposito: "Organización euroasiática de seguridad, economía y política liderada por China y Rusia.",
    porQue: "Reúne a cuatro potencias nucleares (China, Rusia, India y Pakistán) y a Irán; Bielorrusia entró en 2024.",
    miembros: ["cn", "ru", "in", "pk", "kz", "kg", "tj", "uz", "ir", "by"],
    nota: "10 miembros. Mongolia y Afganistán figuran como observadores, no como miembros.",
    fuente: { nombre: "Wikipedia · Organización de Cooperación de Shanghái", url: "https://es.wikipedia.org/wiki/Organizaci%C3%B3n_de_Cooperaci%C3%B3n_de_Shangh%C3%A1i" },
  },
  {
    clave: "asean",
    sigla: "ASEAN",
    nombre: "Asociación de Naciones del Sudeste Asiático",
    tipo: "integracion",
    fundacion: 1967,
    sede: "Yakarta",
    proposito: "Integración económica y política del sudeste asiático, entre China, India y Australia.",
    porQue: "Timor Oriental se convirtió en su miembro número 11 el 26 de octubre de 2025, en Kuala Lumpur.",
    miembros: ["bn", "kh", "id", "la", "my", "mm", "ph", "sg", "th", "vn", "tl"],
    nota: "11 miembros desde el ingreso de Timor Oriental (26-oct-2025).",
    fuente: { nombre: "Gobierno de Timor-Leste · ingreso en la ASEAN", url: "https://vmap.gov.tl/en/2025/10/26/timor-leste-officially-becomes-the-11th-member-of-asean/" },
  },
  {
    clave: "union-africana",
    sigla: "UA",
    nombre: "Unión Africana",
    tipo: "politica",
    fundacion: 2002,
    sede: "Adís Abeba",
    proposito: "Organización de todos los estados africanos: paz y seguridad, integración y desarrollo del continente.",
    porQue: "Es miembro del G20 desde 2023 y suspende a los países donde hay golpes de Estado.",
    miembros: ["dz", "ao", "bj", "bw", "bf", "bi", "cv", "cm", "cf", "td", "km", "cg", "cd", "ci", "dj", "eg", "gq", "er", "sz", "et", "ga", "gm", "gh", "gn", "gw", "ke", "ls", "lr", "ly", "mg", "mw", "ml", "mr", "mu", "ma", "mz", "na", "ne", "ng", "rw", "eh", "st", "sn", "sc", "sl", "so", "za", "ss", "sd", "tz", "tg", "tn", "ug", "zm", "zw"],
    nota: "55 miembros, incluida la República Árabe Saharaui Democrática (Sahara Occidental). Varios estados están suspendidos temporalmente tras golpes militares; la UA los sigue contando como miembros.",
    fuente: { nombre: "Unión Africana · estados miembros", url: "https://au.int/en/member_states/countryprofiles2" },
  },
  {
    clave: "liga-arabe",
    sigla: "Liga Árabe",
    nombre: "Liga de los Estados Árabes",
    tipo: "politica",
    fundacion: 1945,
    sede: "El Cairo",
    proposito: "Coordinación política, económica y cultural de los estados de lengua árabe.",
    porQue: "Readmitió a Siria en 2023 tras doce años de suspensión; Palestina es miembro de pleno derecho.",
    miembros: ["dz", "bh", "km", "dj", "eg", "iq", "jo", "kw", "lb", "ly", "mr", "ma", "om", "ps", "qa", "sa", "so", "sd", "sy", "tn", "ae", "ye"],
    nota: "22 miembros.",
    fuente: { nombre: "Wikipedia · Liga Árabe", url: "https://es.wikipedia.org/wiki/Liga_%C3%81rabe" },
  },
  {
    clave: "mercosur",
    sigla: "Mercosur",
    nombre: "Mercado Común del Sur",
    tipo: "integracion",
    fundacion: 1991,
    sede: "Montevideo",
    proposito: "Unión aduanera sudamericana con arancel externo común.",
    porQue: "Bolivia pasó a ser miembro pleno en 2024; el acuerdo comercial con la Unión Europea marca la agenda del bloque.",
    miembros: ["ar", "br", "py", "uy", "bo"],
    nota: "5 miembros plenos. Venezuela está suspendida desde 2016 y no se cuenta. Chile, Colombia, Ecuador, Perú, Guyana y Surinam son estados asociados.",
    fuente: { nombre: "Mercosur · países", url: "https://www.mercosur.int/quienes-somos/paises-del-mercosur/" },
  },
  {
    clave: "comunidad-andina",
    sigla: "CAN",
    nombre: "Comunidad Andina",
    tipo: "integracion",
    fundacion: 1969,
    sede: "Lima",
    proposito: "Integración económica de los países andinos, con libre circulación de mercancías y personas.",
    porQue: "Es el bloque de integración más antiguo de Sudamérica todavía en funcionamiento.",
    miembros: ["bo", "co", "ec", "pe"],
    nota: "4 miembros. Venezuela salió en 2006; Chile, en 1976.",
    fuente: { nombre: "Comunidad Andina", url: "https://www.comunidadandina.org/quienes-somos/" },
  },
  {
    clave: "sica",
    sigla: "SICA",
    nombre: "Sistema de la Integración Centroamericana",
    tipo: "integracion",
    fundacion: 1991,
    sede: "San Salvador",
    proposito: "El marco de integración de Centroamérica, del que la República Dominicana es miembro pleno.",
    porQue: "Es el bloque regional al que pertenece la República Dominicana junto a sus socios centroamericanos.",
    miembros: ["bz", "cr", "sv", "gt", "hn", "ni", "pa", "do"],
    nota: "8 miembros. La República Dominicana es miembro pleno desde 2013.",
    fuente: { nombre: "SICA · países miembros", url: "https://www.sica.int/sica/paises-miembros" },
  },
  {
    clave: "caricom",
    sigla: "CARICOM",
    nombre: "Comunidad del Caribe",
    tipo: "integracion",
    fundacion: 1973,
    sede: "Georgetown",
    proposito: "Integración económica y coordinación política de los estados del Caribe.",
    porQue: "Haití es miembro pleno: la CARICOM es uno de los foros que más ha trabajado sobre la crisis haitiana.",
    miembros: ["ag", "bs", "bb", "bz", "dm", "gd", "gy", "ht", "jm", "ms", "kn", "lc", "vc", "sr", "tt"],
    nota: "15 miembros plenos (Montserrat es territorio británico). La República Dominicana no es miembro: tiene un acuerdo de libre comercio con la CARICOM.",
    fuente: { nombre: "CARICOM · estados miembros", url: "https://caricom.org/member-states-and-associate-members/" },
  },
  {
    clave: "t-mec",
    sigla: "T-MEC",
    nombre: "Tratado entre México, Estados Unidos y Canadá",
    tipo: "economia",
    fundacion: 2020,
    sede: "Sin sede: secretariado en cada país",
    proposito: "El acuerdo de libre comercio de Norteamérica, sucesor del TLCAN de 1994.",
    porQue: "Su revisión obligatoria está prevista para 2026: seis años después de su entrada en vigor.",
    miembros: ["us", "mx", "ca"],
    nota: "3 miembros. Entró en vigor el 1 de julio de 2020.",
    fuente: { nombre: "USTR · T-MEC (USMCA)", url: "https://ustr.gov/trade-agreements/free-trade-agreements/united-states-mexico-canada-agreement" },
  },
];

export function organizacionDe(clave: string): Organizacion | null {
  return ORGANIZACIONES.find((o) => o.clave === clave) ?? null;
}

/** Las organizaciones de las que un país es miembro pleno. */
export function organizacionesDePais(iso2: string): Organizacion[] {
  const k = iso2.toLowerCase();
  return ORGANIZACIONES.filter((o) => o.miembros.includes(k));
}

/** Cuántos miembros comparten dos organizaciones (para «solapamientos»). */
export function compartidos(a: Organizacion, b: Organizacion): string[] {
  return a.miembros.filter((m) => b.miembros.includes(m));
}
