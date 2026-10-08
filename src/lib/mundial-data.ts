// v90.0 ESPEJOS SIN FIN — MOTOR MUNDIAL (espejo del gran dossier de país:
// ficha institucional por nación con secciones fijas — trasfondo, geografía,
// gente, gobierno, economía, militar — y comparador). Todo el contenido es
// ficticio y propio del mundo Vanguard: nombres de cargos, cifras y dirigentes
// son invención adaptada al juego.

import { fnv89 } from "./pulsos-data";

export interface DossierStat {
  etiqueta: string;
  valor: string;
}

export interface Dossier {
  id: string;
  nombre: string;
  bandera: string;
  capital: string;
  region: string;
  poblacion: string;
  superficie: string;
  riesgo: number; // 0-100 índice Vanguard
  trasfondo: string;
  geografia: DossierStat[];
  gente: DossierStat[];
  gobierno: DossierStat[];
  economia: DossierStat[];
  militar: DossierStat[];
  transnacionales: string[];
  lat: number;
  lng: number;
  acento: string;
  pobM: number; // población cruda en millones (para el comparador)
  pibB: number; // PIB crudo en $B (para el comparador)
}

function r(seed: string, salt: number): number {
  const h = parseInt(fnv89(seed + ":" + salt).slice(0, 7), 36);
  return (h % 100000) / 100000;
}

function pick<T>(seed: string, salt: number, arr: T[]): T {
  return arr[Math.floor(r(seed, salt) * arr.length)];
}

function fmt(n: number): string {
  return n.toLocaleString("es-ES");
}

interface Semilla {
  id: string;
  nombre: string;
  bandera: string;
  capital: string;
  region: string;
  poblacionM: number; // millones
  superficieK: number; // miles km²
  lat: number;
  lng: number;
  acento: string;
  riesgo: number;
  trasfondos: string[];
  gobiernos: string[];
  sectores: string[];
}

const SEMILLAS: Semilla[] = [
  {
    id: "federacion-nordica", nombre: "Federación Nórdica", bandera: "🇳🇮", capital: "Gradoval",
    region: "Europa Oriental / Báltico", poblacionM: 141.2, superficieK: 17075, lat: 57.2, lng: 25.0,
    acento: "#FF6B4D", riesgo: 84,
    trasfondos: [
      "Heredera de un imperio nuclear, la Federación Nórdica mantiene la mayor arsenal estratégico del mundo Vanguard y una doctrina de zonas tampón que la enfrenta a sus vecinos occidentales desde hace tres décadas.",
      "Antigua superpotencia de economía planificada, hoy combina exportaciones energéticas con una economía de guerra que crece al ritmo de sus frentes. Sus bases árticas vigilan el paso del Cabo Norte.",
      "El consejo de seguridad de Gradoval gobierna por decreto desde la crisis del Báltico; los analistas de Vanguard la consideran el actor con mayor capacidad de escalada del tablero.",
    ],
    gobiernos: ["república federal de partido único, poder ejecutivo dominante"],
    sectores: ["gas y crudo 41% del PIB", "industria militar 12%", "granos 9%"],
  },
  {
    id: "union-atlantica", nombre: "Unión Atlántica", bandera: "🇺🇦", capital: "Puerto Alba",
    region: "América del Norte / Atlántico", poblacionM: 335.4, superficieK: 9834, lat: 40.0, lng: -77.0,
    acento: "#4DA6FF", riesgo: 58,
    trasfondos: [
      "Liderazgo de la coalición occidental desde 1949, la Unión Atlántica proyecta once grupos de portaaviones y la red de bases más extensa del planeta Vanguard.",
      "Su economía de servicios y tecnología financia la industria de defensa más grande del mundo; el congreso de Puerto Alba debate cada trimestre el techo de ayuda militar a los frentes aliados.",
      "Elecciones Polarizadas cada cuatro años alternan doctrinas de contención y de retirada — para los analistas, el factor de incertidumbre número uno de la OTAN ficticia del juego.",
    ],
    gobiernos: ["república federal presidencialista, bipartidismo dominante"],
    sectores: ["servicios 68%", "tecnología 14%", "defensa 6%"],
  },
  {
    id: "imperio-central", nombre: "Imperio Central", bandera: "🇨🇳", capital: "Ciudad Espejo",
    region: "Asia Oriental / Indo-Pacífico", poblacionM: 1410.0, superficieK: 9597, lat: 32.0, lng: 110.0,
    acento: "#FFD23D", riesgo: 71,
    trasfondos: [
      "La mayor población y la segunda economía del mundo Vanguard; su astillero civil-militar produce buques a un ritmo que ningún rival iguala.",
      "Reclama el mar de China Meridional casi por completo y sostiene la disputa de Taiwán como su causa central — el escenario de escalada más estudiado por los analistas del juego.",
      "Su cinturón de puertos y ferrocarriles financia infraestructura a cambio de bases: una red que rodea el Índico y desafía el orden atlántico.",
    ],
    gobiernos: ["república popular de partido único, comité permanente"],
    sectores: ["manufactura 39% del PIB", "comercio marítimo 18%", "tecnología 11%"],
  },
  {
    id: "república-donbas", nombre: "República del Donalto", bandera: "🇺🇸", capital: "Karskgrad",
    region: "Europa Oriental", poblacionM: 38.2, superficieK: 604, lat: 48.8, lng: 37.4,
    acento: "#3DDCFF", riesgo: 93,
    trasfondos: [
      "El teatro principal de la guerra del Valle del Karsk: la República del Donalto resiste desde 2022 la presión de la Federación Nórdica sobre un frente que se mueve kilómetro a kilómetro.",
      "Su economía es una economía de trincheras: refinerías de campaña, ferrocarriles militarizados y una diáspora que financia drones por suscripción.",
      "Cada evaluación de campaña de Vanguard comienza por su frente oriental — el país vive con el mapa abierto en la primera página.",
    ],
    gobiernos: ["república parlamentaria en ley marcial"],
    sectores: ["agricultura 15% del PIB", " siderurgia 22%", "defensa 31%"],
  },
  {
    id: "sultanato-ormuz", nombre: "Sultanato de Ormuz", bandera: "🇮🇷", capital: "Bandar Sable",
    region: "Medio Oriente", poblacionM: 89.6, superficieK: 1648, lat: 30.0, lng: 53.0,
    acento: "#B48CFF", riesgo: 80,
    trasfondos: [
      "Guardián del estrecho por el que pasa un quinto del crudo del planeta, el Sultanato juega su mano con lanchas enjambre, proxies costeros y un programa nuclear bajo lupa de inspectores.",
      "Teocracia de consejo: el GUIDE supremo fija la doctrina y los guardias ejecutan la guerra de sombras del Mar Rojo al Levante.",
      "Sus negociaciones llegan siempre con la marea: cada subida del Brent le devuelve poder de negociación en la mesa de Viena ficticia del juego.",
    ],
    gobiernos: ["república teocrática, consejo de guardianes"],
    sectores: ["crudo 44% del PIB", "petroquímica 13%", "balística 4%"],
  },
  {
    id: "confederacion-levante", nombre: "Confederación del Levante", bandera: "🇱🇧", capital: "Puerto Ceniza",
    region: "Medio Oriente", poblacionM: 12.4, superficieK: 22, lat: 33.9, lng: 35.5,
    acento: "#FF8A3D", riesgo: 88,
    trasfondos: [
      "El país más pequeño del dossier y el más castigado: sus frentes internos mezclan milicias, proxies externos y una población civil atrapada entre los tres.",
      "Capital en Puerto Ceniza, la confederación sobrevive de remesas, tráficos y mediaciones — cada alto el fuego firmado aquí se lee en cuatro capitales a la vez.",
      "Para Vanguard es el epicentro de la escalada regional: el tablero del Mar Rojo no se entiende sin su costa.",
    ],
    gobiernos: ["confederación de milicias, gobierno de unidad frágil"],
    sectores: ["remesas 31% del PIB", "tráfico portuario 12%", "ayuda externa 18%"],
  },
  {
    id: "union-subcontinente", nombre: "Unión del Subcontinente", bandera: "🇮🇳", capital: "Yamunagar",
    region: "Asia Meridional", poblacionM: 1428.0, superficieK: 3287, lat: 22.0, lng: 78.0,
    acento: "#9AE04D", riesgo: 63,
    trasfondos: [
      "La democracia más poblada del planeta Vanguard compra armas a todos los bandos y se niega a elegir: su no alineamiento multiplica es una doctrina de balance.",
      "Su frontera norte acumula tres frentes: la Línea de Control con su vecino occidental, la disputa de meseta con el Imperio Central y la insurgencia del corredor noreste.",
      "Economía de servicios digitales en ascenso, con una marina que crece para vigilar el Índico que cruza el comercio mundial.",
    ],
    gobiernos: ["república federal parlamentaria"],
    sectores: ["servicios 54% del PIB", "agricultura 16%", "defensa 3%"],
  },
  {
    id: "estado-indus", nombre: "Estado del Indus", bandera: "🇵🇰", capital: "Raviabad",
    region: "Asia Meridional", poblacionM: 240.5, superficieK: 882, lat: 30.4, lng: 69.4,
    acento: "#4DFFC4", riesgo: 77,
    trasfondos: [
      "Potencia nuclear de arsenal creciente, el Estado del Indus basa su doctrina en la disuasión táctica: cabezas de bajo rendimiento listas para el frente de Cachemira.",
      "Sus servicios militares operan un estado dentro del estado; el gobierno civil negocia con el FMI ficticio del juego mientras el ejército negocia con Gradoval.",
      "Cada crisis de Cachemira empieza con un incidente en la Línea de Control y termina en la sala de crisis de Raviabad — el ciclo está estudiado en tres evaluaciones de Vanguard.",
    ],
    gobiernos: ["república federal militarizada"],
    sectores: ["textil 24% del PIB", "agricultura 23%", "remesas 9%"],
  },
  {
    id: "republica-bosforo", nombre: "República del Bósforo", bandera: "🇹🇷", capital: "Estrecho Dorado",
    region: "Europa / Medio Oriente", poblacionM: 85.7, superficieK: 784, lat: 39.0, lng: 35.0,
    acento: "#FF6BC1", riesgo: 66,
    trasfondos: [
      "Guardiana de los estrechos que separan dos mares y dos alianzas, la República del Bósforo vende drones a quien paga y cierra el paso a quien presiona.",
      "Miembro de la coalición atlántica con la segunda mayor armada — y a la vez mediadora oficial entre la coalición y Gradoval: el equilibrio es su identidad.",
      "Su industria de drones reescribió la guerra del Karsk: cada frente de Vanguard tiene una fila de sus aparatos en el registro de pérdidas.",
    ],
    gobiernos: ["república presidencialista con poder ejecutivo fuerte"],
    sectores: ["industria 27% del PIB", "turismo 11%", "defensa-export 7%"],
  },
  {
    id: "reino-hermitano", nombre: "Reino Hermitano", bandera: "🇰🇵", capital: "Ciudad Juche",
    region: "Asia Oriental", poblacionM: 26.1, superficieK: 121, lat: 40.0, lng: 127.0,
    acento: "#FF4D4D", riesgo: 90,
    trasfondos: [
      "El Estado más cerrado del dossier prueba misiles como otros publican informes: cada lanzamiento sobre el mar de Japón ficticio mueve los mercados de Tokio y Seúl del juego.",
      "Cuarta economía militar per cápita y primera en gasto obligatorio: el Reino Hermitano dedica a sus misiles lo que sus vecinos dedican a sus puertos.",
      "Sus negociaciones son ciclos de provocación y rebaja: Vanguard la vigila con seis señales orbitales y una estación sísmica dedicada.",
    ],
    gobiernos: ["monarquía dinástica de partido único"],
    sectores: ["industria estatal 51% del PIB", "carbón 12%", "export de armas 6%"],
  },
];

const GEO_TEMPL = [
  "costa total", "punto más alto", "recursos clave", "clima dominante", "riesgo natural",
];
const CLIMAS = ["continental extremo", "mediterráneo seco", "monzónico", "árido de sierra", "oceánico frío"];
const RECURSOS = ["crudo y gas", "tierras raras", "trigo cinturón negro", "litio de salares", "uranio profundo", "aguas fluviales"];
const RIESGOS_NAT = ["sísmico alto", "sequía recurrente", "inundaciones de delta", "tormentas árticas", "incendios de estepa"];

export function generarDossier(id: string, dia = Math.floor(Date.now() / 86400_000)): Dossier {
  const s = SEMILLAS.find((x) => x.id === id) ?? SEMILLAS[0];
  const seed = "mundial90:" + s.id + ":" + dia;
  const pop = s.poblacionM * (1 + (r(seed, 1) - 0.5) * 0.004);
  const mediana = 28 + Math.floor(r(seed, 2) * 18);
  const urban = 58 + Math.floor(r(seed, 3) * 32);
  const alfabet = 88 + Math.floor(r(seed, 4) * 11);
  const pib = (s.poblacionM * (0.9 + r(seed, 5) * 3.2)).toFixed(2);
  const crec = ((r(seed, 6) - 0.35) * 6).toFixed(1);
  const infl = (2 + r(seed, 7) * 38).toFixed(1);
  const milPib = (1.2 + r(seed, 8) * 7.5).toFixed(1);
  const activos = Math.floor(s.poblacionM * 0.8 * (1 + r(seed, 9) * 3));
  const riesgo = Math.min(99, Math.max(5, s.riesgo + Math.round((r(seed, 10) - 0.5) * 8)));

  return {
    id: s.id, nombre: s.nombre, bandera: s.bandera, capital: s.capital, region: s.region,
    poblacion: `${fmt(Math.round(pop))} M hab. (est.)`,
    superficie: `${fmt(s.superficieK * 1000)} km²`,
    riesgo,
    lat: s.lat, lng: s.lng, acento: s.acento,
    pobM: Math.round(pop * 10) / 10,
    pibB: parseFloat(pib),
    trasfondo: pick(seed, 20, s.trasfondos),
    geografia: [
      { etiqueta: "área total", valor: `${fmt(s.superficieK * 1000)} km²` },
      { etiqueta: "costa", valor: `${fmt(Math.floor(s.superficieK * (1.2 + r(seed, 11) * 2)))} km` },
      { etiqueta: "clima", valor: pick(seed, 12, CLIMAS) },
      { etiqueta: "recursos clave", valor: pick(seed, 13, RECURSOS) },
      { etiqueta: "riesgo natural", valor: pick(seed, 14, RIESGOS_NAT) },
    ],
    gente: [
      { etiqueta: "población", valor: `${fmt(Math.round(pop))} M` },
      { etiqueta: "mediana de edad", valor: `${mediana} años` },
      { etiqueta: "urbanización", valor: `${urban}%` },
      { etiqueta: "alfabetización", valor: `${alfabet}%` },
      { etiqueta: "refugiados salientes", valor: fmt(Math.floor(r(seed, 15) * s.poblacionM * 0.09 * 1000) * 1000) },
    ],
    gobierno: [
      { etiqueta: "forma de estado", valor: s.gobiernos[0] },
      { etiqueta: "capital", valor: s.capital },
      { etiqueta: "dependencia", valor: `${Math.floor(1 + r(seed, 16) * 12)} divisiones administrativas` },
      { etiqueta: "sistema legal", valor: pick(seed, 17, ["civil continental", "mixto con ley marcial", "consuetudinario reformado"]) },
      { etiqueta: "último comicio", valor: `${2019 + Math.floor(r(seed, 18) * 5)}` },
    ],
    economia: [
      { etiqueta: "PIB nominal", valor: `$${pib} B` },
      { etiqueta: "crecimiento", valor: `${crec}% anual` },
      { etiqueta: "inflación", valor: `${infl}%` },
      { etiqueta: "sectores", valor: s.sectores.join(" · ") },
      { etiqueta: "comercio marítimo", valor: `${Math.floor(r(seed, 19) * 60 + 10)}% de su comercio` },
    ],
    militar: [
      { etiqueta: "gasto militar", valor: `${milPib}% del PIB` },
      { etiqueta: "personal activo", valor: fmt(activos) },
      { etiqueta: "reserva", valor: fmt(Math.floor(activos * (1.5 + r(seed, 21)))) },
      { etiqueta: "arsenal estratégico", valor: s.riesgo > 70 ? "declarado · disuasión activa" : "no declarado / disuasión extendida" },
      { etiqueta: "alistamiento", valor: pick(seed, 22, ["servicio obligatorio 12 meses", "voluntariado profesional", "mixto con reservas móviles"]) },
    ],
    transnacionales: [
      pick(seed, 30, ["tráfico de armas ligera por corredores no vigilados", "reflujo de combatientes extranjeros", "contrabando de crudo por flota fantasma"]),
      pick(seed, 31, ["ciberoperaciones contra infraestructura crítica vecina", "campañas de desinformación transfronterizas", "espionaje industrial por vía satelital"]),
      pick(seed, 32, ["presión migratoria en las fronteras del frente", "crisis de agua compartida con cuenca vecina", "sanciones con fugas por terceros países"]),
    ],
  };
}

export const MUNDIAL_IDS = SEMILLAS.map((s) => s.id);

export function nombreDe(id: string): string {
  return SEMILLAS.find((s) => s.id === id)?.nombre ?? id;
}
