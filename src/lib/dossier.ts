// v86.0 CENTINELA GLOBAL — DOSSIER TÁCTICO
// Fichas técnicas de armamento y actores: el "diccionario interactivo" integrado
// en las noticias. Cuando un titular menciona un Iskander o a Hezbolá, el
// comandante hace clic y abre la ficha: alcance, origen, operadores y poder.
// Todo determinista, sin servidor, en español neutro.

export interface FichaArma {
  id: string;
  nombre: string;
  tipo: string;
  origen: string;
  operadores: string;
  desde: string;
  alcance: string;
  specs: string;
  poder: number; // 0-100 (barra)
  precision: number; // 0-100
  estado: string;
  dato: string;
  // keywords que disparan la ficha dentro de un titular
  claves: string[];
}

export interface FichaActor {
  id: string;
  nombre: string;
  clase: string;
  sede: string;
  fundado: string;
  fuerza: string;
  ambito: string;
  poder: number; // 0-100
  cohesion: number; // 0-100
  estado: string;
  dato: string;
  claves: string[];
}

export const ARMAS: FichaArma[] = [
  {
    id: "iskander-m", nombre: "Iskander-M", tipo: "SRBM balístico de corto alcance",
    origen: "Rusia", operadores: "Fuerzas Terrestres de Rusia · despliegue en Bielorrusia y Kaliningrado",
    desde: "2006", alcance: "500 km (variantes reportadas hasta 900)",
    specs: "Mach 6-7 en fase terminal · ojiva 480-700 kg · maniobra evasiva Q",
    poder: 78, precision: 82, estado: "Operativo · usado en Ucrania desde 2022",
    dato: "Vuela en trayectoria cuasibalística que complica la intercepción por Patriot.",
    claves: ["iskander"],
  },
  {
    id: "himars", nombre: "HIMARS", tipo: "Lanzacohetes múltiple sobre camión",
    origen: "EE.UU.", operadores: "Ucrania · EE.UU. · Rumanía · Polonia",
    desde: "2005", alcance: "80 km GMLRS · 300 km ATACMS",
    specs: "6 cohetes 227 mm o 1 misil táctico · tiro-y-muévete en <2 min",
    poder: 64, precision: 91, estado: "Operativo · pieza clave en Ucrania",
    dato: "La primera guerra donde un lanzacohetes de ruedas cambió la logística del frente.",
    claves: ["himars"],
  },
  {
    id: "s-400", nombre: "S-400 Triumf", tipo: "Sistema antiaéreo de largo alcance",
    origen: "Rusia", operadores: "Rusia · Turquía · India · China · Bielorrusia",
    desde: "2007", alcance: "250-400 km según misil",
    specs: "Radar 91N6E · hasta 80 objetivos · 3 capas de misiles",
    poder: 71, precision: 74, estado: "Operativo",
    dato: "Turquía lo compró pese a estar en la OTAN: fue expulsada del programa F-35.",
    claves: ["s-400", "s400", "triumf"],
  },
  {
    id: "patriot", nombre: "Patriot PAC-3", tipo: "Defensa antimisiles de media/larga altura",
    origen: "EE.UU.", operadores: "EE.UU. · OTAN · Ucrania · Arabia Saudí · Japón",
    desde: "1981 (PAC-3: 2001)", alcance: "120-160 km PAC-3 MSE",
    specs: "Hit-to-kill · radar AESA · abate cruceros y balísticos en fase terminal",
    poder: 66, precision: 88, estado: "Operativo · baterías activas en Kiev",
    dato: "Un PAC-3 cuesta más que el drone que derriba: por eso la guerra de attrition es económica.",
    claves: ["patriot", "pac-3"],
  },
  {
    id: "bayraktar", nombre: "Bayraktar TB2", tipo: "Dron de combate (UCAV)",
    origen: "Turquía", operadores: "Turquía · Ucrania · Azerbaiyán · 30+ países",
    desde: "2014", alcance: "300 km · 27 h de autonomía",
    specs: "Munición MAM-L guiada por láser · enlace satelital",
    poder: 42, precision: 86, estado: "Operativo · celebrado en canciones de guerra",
    dato: "Se volvió canción folk en Ucrania y símbolo de la victoria de Azerbaiyán en 2020.",
    claves: ["bayraktar", "tb2"],
  },
  {
    id: "shahed", nombre: "Shahed-136", tipo: "Dron kamikaze (loitering munition)",
    origen: "Irán", operadores: "Irán · Rusia (como 'Geran-2')",
    desde: "2021", alcance: "1.500-2.500 km",
    specs: "Ala delta · motor de pistón · ~50 kg explosivo · $20-50 mil",
    poder: 38, precision: 55, estado: "Operativo · oleadas nocturnas masivas",
    dato: "Cuesta 100 veces menos que el misil que lo intercepta: la guerra de costos.",
    claves: ["shahed", "geran"],
  },
  {
    id: "kinzhal", nombre: "Kinzhal (Kh-47M2)", tipo: "Misil hipersónico aerobalistico",
    origen: "Rusia", operadores: "Aviación rusa (MiG-31K, Tu-22M3)",
    desde: "2018", alcance: "1.500-2.000 km",
    specs: "Hasta Mach 10 afirmado · ojiva convencional o nuclear",
    poder: 84, precision: 70, estado: "Operativo",
    dato: "Ucrania afirmó derribarlo con Patriot: el duelo hipersónico vs hit-to-kill.",
    claves: ["kinzhal", "daguer"],
  },
  {
    id: "kalibr", nombre: "Kalibr 3M14", tipo: "Misil de crucero de lanzamiento naval",
    origen: "Rusia", operadores: "Flota rusa (buques y submarinos)",
    desde: "2012", alcance: "1.500-2.500 km",
    specs: "Vuelo rasante a Mach 0.8, sprint terminal Mach 2.9",
    poder: 76, precision: 80, estado: "Operativo",
    dato: "El 'calibre' que disparó la guerra desde el Caspio, 1.500 km del objetivo.",
    claves: ["kalibr"],
  },
  {
    id: "f-35", nombre: "F-35 Lightning II", tipo: "Caza furtivo multipropósito 5ª generación",
    origen: "EE.UU. (consorcio)", operadores: "EE.UU. · 19 países socios",
    desde: "2016", alcance: "1.200 km combatiendo",
    specs: "Sensor fusion · AN/APG-81 · furtividad all-aspect",
    poder: 88, precision: 90, estado: "Operativo · >1.000 unidades",
    dato: "Es un 'quarterback' aéreo: su valor es ver primero y compartir el campo de batalla.",
    claves: ["f-35", "f35", "lightning"],
  },
  {
    id: "javelin", nombre: "FGM-148 Javelin", tipo: "ATGM portátil antitanque",
    origen: "EE.UU.", operadores: "EE.UU. · Ucrania · 30+ países",
    desde: "1996", alcance: "2.5-4.75 km",
    specs: "Ataque en ascenso top-attack · fire-and-forget",
    poder: 30, precision: 92, estado: "Operativo · icónico en Ucrania 2022",
    dato: "Su modo 'altillo' golpea la torreta, la parte menos blindada del tanque.",
    claves: ["javelin"],
  },
  {
    id: "leopard2", nombre: "Leopard 2", tipo: "Carro de combate principal (MBT)",
    origen: "Alemania", operadores: "Alemania · 20+ países europeos · Ucrania",
    desde: "1979", alcance: "2 km cañón L55 efectivo",
    specs: "L55 120mm liso · MTU 1.500 CV · blindaje compuesto",
    poder: 68, precision: 84, estado: "Operativo",
    dato: "El 'enjambre de Leopards' que Europa cedió a Ucrania cruzó un umbral político.",
    claves: ["leopard"],
  },
  {
    id: "t14", nombre: "T-14 Armata", tipo: "Carro de combate con torreta no tripulada",
    origen: "Rusia", operadores: "Rusia (producción limitada)",
    desde: "2015", alcance: "2 km cañón 2A82",
    specs: "Tripulación en cápsula blindada · AESA Afghanit · APS activa",
    poder: 72, precision: 76, estado: "Despliegue simbólico · costos y dudas",
    dato: "Se prometieron 2.300; hay pocos en campo: la fábrica pesa más que el mito.",
    claves: ["armata", "t-14"],
  },
  {
    id: "su-57", nombre: "Su-57 Felon", tipo: "Caza furtivo 5ª generación",
    origen: "Rusia", operadores: "Rusia (flota pequeña)",
    desde: "2020", alcance: "1.500 km combatiendo",
    specs: "Supermanioobra · N036 Byelka AESA · thrust vectoring",
    poder: 82, precision: 78, estado: "Operativo con uso limitado",
    dato: "OTAN le puso 'Felon' (delincuente): uso raro fuera de la retaguardia.",
    claves: ["su-57", "felon"],
  },
  {
    id: "atacms", nombre: "ATACMS", tipo: "Misil balístico táctico",
    origen: "EE.UU.", operadores: "EE.UU. · Ucrania · Corea del Sur",
    desde: "1991", alcance: "165-300 km",
    specs: "Submuniciones M74 o unitario · guiado GPS/INS",
    poder: 62, precision: 87, estado: "Operativo · usado contra aeródromos",
    dato: "Cada autorización de rango fue una decisión de OTAN con escalada al fondo.",
    claves: ["atacms"],
  },
  {
    id: "lancet", nombre: "Lancet-3", tipo: "Dron kamikaze de reconocimiento atacante",
    origen: "Rusia", operadores: "Rusia",
    desde: "2020", alcance: "40-70 km",
    specs: "X-wing · guiar por TV/termica · 3-5 kg explosivo",
    poder: 28, precision: 80, estado: "Operativo · caza de artillería",
    dato: "Se volvió la amenaza #1 para los obuses del frente en 2023.",
    claves: ["lancet"],
  },
  {
    id: "harop", nombre: "IAI Harop", tipo: "Dron kamikaze de largo alcance",
    origen: "Israel", operadores: "Israel · Azerbaiyán · India",
    desde: "2009", alcance: "1.000 km",
    specs: "Loitering 6 h · ojiva 23 kg · abortable",
    poder: 40, precision: 85, estado: "Operativo",
    dato: "En Nagorno-Karabaj grabó los primeros vídeos de drones 'cazando' SAM.",
    claves: ["harop"],
  },
];

export const ACTORES: FichaActor[] = [
  {
    id: "otan", nombre: "OTAN", clase: "Alianza militar intergubernamental",
    sede: "Bruselas, Bélgica", fundado: "1949",
    fuerza: "32 países · ~3.5M efectivos activos combinados",
    ambito: "América del Norte + Europa + adhesión en curso",
    poder: 95, cohesion: 74, estado: "Art. 5 activo solo tras 11-S (2001)",
    dato: "El Artículo 5 se invocó UNA vez: por el ataque a EE.UU., no en Europa.",
    claves: ["otan", "nato"],
  },
  {
    id: "wagner", nombre: "Africa Corps (ex Wagner)", clase: "Compañía militar privada estatal",
    sede: "San Petersburgo (origen)", fundado: "2014 · reabsorbido 2023",
    fuerza: "~7.000-20.000 tras la mutiny y purga",
    ambito: "Malí · Sudán · Libia · RCA · Ucrania (legado)",
    poder: 58, cohesion: 42, estado: "Rebranding tras la muerte de Prigozhin",
    dato: "El grupo que marchó sobre Moscú en 24h y se detuvo: la lealtad al Estado se midió.",
    claves: ["wagner", "africa corps", "prigozhin"],
  },
  {
    id: "hezbola", nombre: "Hezbolá", clase: "Partido-milicia y movimiento político",
    sede: "Beirut sur, Líbano", fundado: "1982",
    fuerza: "~20.000-40.000 combatientes · 150.000 cohetes estimados",
    ambito: "Líbano · Siria · influencia regional",
    poder: 72, cohesion: 80, estado: "Desgastado por la campaña 2024-25",
    dato: "Su arsenal de cohetes es el mayor arsenal no estatal del planeta.",
    claves: ["hezbol", "hezbo", "hizbul"],
  },
  {
    id: "huties", nombre: "Ansar Allah (Hutíes)", clase: "Movimiento armado y gobierno de facto",
    sede: "Sanaa, Yemen", fundado: "1990 (como movimiento), armado 2004",
    fuerza: "~200.000 combatientes",
    ambito: "Yemen · Mar Rojo · Bab el-Mandeb",
    poder: 55, cohesion: 78, estado: "Activo · ataques navales al comercio",
    dato: "Con drones y misiles baratos paralizó el 12% del comercio mundial por mar.",
    claves: ["hut", "ansar allah"],
  },
  {
    id: "hamas", nombre: "Hamás", clase: "Movimiento islamista y gobierno de facto",
    sede: "Gaza", fundado: "1987",
    fuerza: "~20.000-30.000 ala armada (pre-2023)",
    ambito: "Franja de Gaza",
    poder: 40, cohesion: 70, estado: "Reorganización tras la guerra 2023-25",
    dato: "La red de túneles bajo Gaza mide cientos de km: el 'metro' de la guerra.",
    claves: ["hamas"],
  },
  {
    id: "fmi-cst", nombre: "OTSC", clase: "Alianza militar post-soviética",
    sede: "Moscú, Rusia", fundado: "2002",
    fuerza: "5 países miembros (Rusia, Bielorrusia, Kazajistán, Kirguistán, Tayikistán)",
    ambito: "Eurasia ex-soviética",
    poder: 48, cohesion: 35, estado: "Debilitada tras Ucrania",
    dato: "Kazajistán la ignoró en 2022: la lealtad post-soviética no es automática.",
    claves: ["otsc", "csto"],
  },
  {
    id: "houthis-navy", nombre: "Guardia Revolucionaria IRGC", clase: "Fuerza armada paralela iraní",
    sede: "Teherán, Irán", fundado: "1979",
    fuerza: "~190.000 activos · rama naval y aeroespacial propias",
    ambito: "Irán · proxies en 5 países",
    poder: 76, cohesion: 84, estado: "Operativo",
    dato: "Diseña y exporta los 'shahed': es fabricante y red de distribución a la vez.",
    claves: ["irgc", "guardia revolucionaria", "pasdaran"],
  },
  {
    id: "kadyrov", nombre: "Fuerzas Kadyrovtsy", clase: "Milicia paramilitar leal a Grozni",
    sede: "Chechenia, Rusia", fundado: "1994 (formación actual 2000s)",
    fuerza: "~7.000-30.000 estimados",
    ambito: "Chechenia · Ucrania (frentes seleccionados)",
    poder: 34, cohesion: 88, estado: "Operativo",
    dato: "Lealtad personal al líder local: un Estado dentro del Estado ruso.",
    claves: ["kadyrov"],
  },
  {
    id: "rsf", nombre: "RSF (Rapid Support Forces)", clase: "Paramilitar sudanés",
    sede: "Khartoum / Darfur", fundado: "2013 (raízes janjaweed)",
    fuerza: "~70.000-100.000",
    ambito: "Sudán · Chad (frontera)",
    poder: 52, cohesion: 58, estado: "En guerra civil contra el Ejército sudanés",
    dato: "El conflicto que desplazó a más personas del planeta en 2024, casi sin cobertura.",
    claves: ["rsf", "rapid support"],
  },
  {
    id: "fpi", nombre: "Brigadas al-Qassam y facciones palestinas", clase: "Coalición de milicias",
    sede: "Gaza", fundado: "1991",
    fuerza: "Fragmentada post-2023",
    ambito: "Gaza · Cisjordania",
    poder: 32, cohesion: 50, estado: "Asedio y reorganización",
    dato: "El nombre viene de un predicador asesinado en 1935: la memoria como reclutamiento.",
    claves: ["qassam"],
  },
];

export type Ficha = (FichaArma & { clase: "arma" }) | (FichaActor & { clase: "actor" });

function asArma(a: FichaArma): Ficha {
  return { ...a, clase: "arma" };
}
function asActor(a: FichaActor): Ficha {
  return { ...a, clase: "actor" };
}

function normalizar(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/** Detecta fichas mencionadas en un texto (titular/resumen). Determinista. */
export function detectarFichas(texto: string): Ficha[] {
  const t = ` ${normalizar(texto)} `;
  const out: Ficha[] = [];
  for (const a of ARMAS) {
    if (a.claves.some((k) => t.includes(` ${k} `) || t.includes(`${k}s `) || t.includes(` ${k},`) || t.includes(` ${k}.`) || t.includes(` ${k}:`))) {
      out.push(asArma(a));
    }
  }
  for (const ac of ACTORES) {
    if (ac.claves.some((k) => t.includes(` ${k} `) || t.includes(`${k}s `) || t.includes(` ${k},`) || t.includes(` ${k}.`) || t.includes(` ${k}:`))) {
      out.push(asActor(ac));
    }
  }
  return out;
}

export function buscarFichas(q: string): Ficha[] {
  const nq = normalizar(q.trim());
  const todas: Ficha[] = [
    ...ARMAS.map(asArma),
    ...ACTORES.map(asActor),
  ];
  if (!nq) return todas;
  return todas.filter((f) => normalizar(f.nombre).includes(nq) || normalizar(f.clase === "arma" ? f.tipo : f.ambito).includes(nq) || normalizar(f.clase === "arma" ? f.origen : f.sede).includes(nq));
}
