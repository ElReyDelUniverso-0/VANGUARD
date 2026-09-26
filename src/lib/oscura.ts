"use client";

// v59.0 ALEJANDRÍA OSCURA — LA BIBLIOTECA DE ALEJANDRÍA GEOPOLÍTICA
// Tres colecciones: TEORÍAS OSCURAS (mito vs realidad, honestidad total),
// ARMAS (las ideas que crearon las armas que cambiaron el mundo) y
// CIVILIZACIONES PERDIDAS (imperios que desaparecieron y aterraron).
// Regla de oro: cada teoría lleva veredicto MITO / REAL / PARCIAL y fuente
// real desclasificada. Nada inventado: el miedo real está en los documentos.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type Veredicto = "MITO" | "REAL" | "PARCIAL";
export type OscuraRarity = "COMUN" | "RARO" | "EPICO" | "LEGENDARIO";

export interface TeoriaOscura {
  id: string;
  titulo: string;
  veredicto: Veredicto;
  rareza: OscuraRarity;
  origen: string;   // dónde y cuándo nació la historia
  creencia: string; // qué afirma la teoría
  realidad: string; // qué dicen los documentos reales
  url: string;      // fuente real verificada
  fuente: string;   // nombre de la fuente
}

export interface ArmaOscura {
  id: string;
  titulo: string;
  epoca: string;
  idea: string;   // la idea que la creó
  legado: string; // qué cambió en el mundo
  url: string;
  fuente: string;
}

export interface CivilizacionOscura {
  id: string;
  titulo: string;
  epoca: string;
  que: string;    // qué logró
  misterio: string; // cómo/por qué aterró y desapareció
  url: string;
  fuente: string;
}

// ============ COLECCIÓN 1: TEORÍAS OSCURAS (10) ============
export const TEORIAS: TeoriaOscura[] = [
  {
    id: "t-reptilianos",
    titulo: "REPTILIANOS: la élite cambiapieles",
    veredicto: "MITO",
    rareza: "LEGENDARIO",
    origen: "Nació en la ciencia-ficción de 1934 («La sombra del rey» de Robert E. Howard) y la relanzó David Icke en 1998 ante miles de personas en Londres.",
    creencia: "Que dirigentes, reyes y presidentes son en realidad reptiles gigantes con piel humana que beben sangre y controlan el mundo desde tuneles subterráneos.",
    realidad: "NINGUNA foto real existe jamás: ni una sola pieza de evidencia en 90 años. Lo que sí es real: la CIA desclasificó sus archivos OVNI y el avión espía U-2 explic medio milenio de avistamientos «reptilianos/aliens» — gente viendo cosas que no reconocía a 20 km de altura.",
    url: "https://www.cia.gov/readingroom/collection/ufo-collection",
    fuente: "CIA Reading Room · Colección OVNI",
  },
  {
    id: "t-mkultra",
    titulo: "MK-ULTRA: control mental de la CIA",
    veredicto: "REAL",
    rareza: "LEGENDARIO",
    origen: "1953, dirección de la CIA en Langley. Destruido el 90% de los archivos en 1973 por orden del director Helms… pero sobrevivieron 20.000 páginas mal archivadas.",
    creencia: "Que la CIA experimentó con mentes humanas para crear asesinos hipnotizados y robots diplomáticos.",
    realidad: "Confirmado por el propio Senado de EE.UU. (comite Church, 1975): LSD a ciudadanos sin saberlo, electroshocks, tortura sensorial en universidades, hospitales y prisiones. Puedes leer las páginas que sobrevivieron, hoy públicas.",
    url: "https://www.cia.gov/readingroom/collection/mkultra",
    fuente: "CIA Reading Room · Colección MK-ULTRA",
  },
  {
    id: "t-paperclip",
    titulo: "OPERACIÓN PAPERCLIP: los científicos nazis de EE.UU.",
    veredicto: "REAL",
    rareza: "EPICO",
    origen: "1945, los últimos días de la 2ª Guerra Mundial. Un programón secreto metió a 1.600 científicos alemanes en aviones hacia EE.UU.",
    creencia: "Que EE.UU. rescató criminales de guerra para robar su tecnología.",
    realidad: "Confirmado: Wernher von Braun (padre del Saturno V que llevó al hombre a la Luna) era oficial de las SS. El expediente completo está en los Archivos Nacionales; su contenido aterró al mundo cuando se desclasificó.",
    url: "https://www.archives.gov/research/military",
    fuente: "NARA · Registros militares",
  },
  {
    id: "t-area51",
    titulo: "ÁREA 51: el lago seco de los «platillos»",
    veredicto: "PARCIAL",
    rareza: "EPICO",
    origen: "Nevada, 1955. Los mapas marcaban solo un lago seco: Groom Lake. El Gobierno negó su existencia durante décadas… hasta desclasificarla en 2013.",
    creencia: "Que allí guardan alienígenas capturados y navegan naves invertidas.",
    realidad: "Lo desclasificado es casi mejor: allí voló el U-2 y el A-12 OXCART, aviones espía tan extraños que LA CIA admite que explicaron la mitad de los avistamientos OVNI de los años 50. No hay alienígenas: hay ingeniería que parecía de otro planeta.",
    url: "https://www.cia.gov/readingroom/collection/ufo-collection",
    fuente: "CIA Reading Room · U-2 y OVNI",
  },
  {
    id: "t-haarp",
    titulo: "HAARP: la antena que desperta terremotos",
    veredicto: "PARCIAL",
    rareza: "RARO",
    origen: "Alaska, 1993. 180 antenas de 22 metros clavadas en la tundra, capaces de calentar la ionosfera con 3.6 megavatios.",
    creencia: "Que es un arma climática que lanza huracanes, terremotos y controla mentes a distancia.",
    realidad: "La instalación es real y está abierta al público en visitas científicas (Universidad de Alaska). Estudia la ionosfera, no provoca catástrofes: su energía es millones de veces menor que la de un solo huracán natural.",
    url: "https://www.gi.alaska.edu/haarp",
    fuente: "Universidad de Alaska · HAARP oficial",
  },
  {
    id: "t-bermudas",
    titulo: "TRIÁNGULO DE LAS BERMUDAS: el cementerio de barcos",
    veredicto: "MITO",
    rareza: "RARO",
    origen: "Artículos de revistas sensacionalistas de los años 50-60 que encadenaron naufragios dispersos en un triángulo imaginario.",
    creencia: "Que un vórtice, magnetismo anormal o algo peor traga barcos y aviones sin explicación.",
    realidad: "La NOAA y los aseguradores Lloyd's de Londres lo cerraron: la zona no es más peligrosa que el resto del océano y las desapariciones tienen causas normales (meteorología, error humano). El mito vendió millones de libros.",
    url: "https://oceanservice.noaa.gov/facts/bermudatri.html",
    fuente: "NOAA · Ocean Service",
  },
  {
    id: "t-now",
    titulo: "NUEVO ORDEN MUNDIAL: el gobierno único",
    veredicto: "MITO",
    rareza: "COMUN",
    origen: "Discurso de George H. W. Bush en 1990 tras la Guerra Fría; antes ya sonaba en retórica de entreguerras.",
    creencia: "Que una casta global secreta (Bilderberg, Illuminati, Davos) planea un gobierno mundial único con moneda única y control total.",
    realidad: "Las reuniones existen, los organismos internacionales existen — pero cada país sigue actuando por su cuenta: guerras comerciales, invasiones y vetos en la ONU demuestran que nadie controla nada. La desunión es lo único constante.",
    url: "https://www.archives.gov/research/foreign-policy",
    fuente: "NARA · Política exterior",
  },
  {
    id: "t-doomsday",
    titulo: "LA BÓVEDA DEL FIN DEL MUNDO",
    veredicto: "REAL",
    rareza: "EPICO",
    origen: "Svalbard, Ártico noruego, 2008. A 1.300 km del Polo Norte, dentro de una montaña de permafrost.",
    creencia: "Que es una instalación secreta de clonación o refugio de élites.",
    realidad: "Es la Bóveda Global de Semillas: más de 1,2 millones de semillas de cultivos de casi todos los países, guardadas contra catástrofes globales. Junto a ella, los archivos de la Bóveda Nuclear documentan cómo cerca de estuvimos de aniquilarnos.",
    url: "https://nsarchive.gmu.edu",
    fuente: "National Security Archive · Nuclear Vault",
  },
  {
    id: "t-jfk",
    titulo: "JFK: los archivos que tardaron 60 años",
    veredicto: "PARCIAL",
    rareza: "LEGENDARIO",
    origen: "Dallas, 22 de noviembre de 1963. 5 millones de documentos federales, miles marcados «SECRETO» durante generaciones.",
    creencia: "Que una conspiración de la CIA, la mafia o Lyndon Johnson asesinó al presidente.",
    realidad: "Decenas de miles de páginas ya están públicas en el portal JFK de NARA y siguen liberándose por lotes. Han salido planes secretos reales (Operación Northwoods propuso atentados falsos como pretexto para invadir Cuba, rechazada). El 100% no está liberado.",
    url: "https://www.archives.gov/research/jfk",
    fuente: "NARA · Asesinato de JFK",
  },
  {
    id: "t-uap",
    titulo: "UAP: los videos que el Pentágono confirmó",
    veredicto: "PARCIAL",
    rareza: "EPICO",
    origen: "2004-2021, portaviones EE.UU. en el Pacífico. Videos filtrados que el propio Departamento de Defensa validó como auténticos en 2020.",
    creencia: "Que son naves de otros mundos observando a la humanidad.",
    realidad: "Los videos son reales y oficiales; los objetos no identificados también. La conclusión oficial es más inquietante: «no sabemos qué son». La Oficina AARO sigue investigando sin encontrar ni aliens ni secretos soviéticos. El vacío de respuestas es real.",
    url: "https://www.theblackvault.com",
    fuente: "The Black Vault · Archivo UAP/OVNI",
  },
];

// ============ COLECCIÓN 2: ARMAS — IDEAS QUE CREARON MONSTRUOS (8) ============
export const ARMAS: ArmaOscura[] = [
  {
    id: "a-arco",
    titulo: "EL ARCO COMPUESTO: la primera arma de precisión",
    epoca: "~3000 a.C., estepas de Asia",
    idea: "Doblar madera, cuerno y tendón en capas: guardar energía muscular en un objeto del tamaño de un brazo.",
    legado: "Un arquero a caballo pudo tumbar imperios enteros antes de que el enemigo cerrara distancia. Los mongoles conquistaron el mayor imperio terrestre de la historia con esta idea.",
    url: "https://airandspace.si.edu",
    fuente: "Smithsonian · Air & Space",
  },
  {
    id: "a-falange",
    titulo: "LA FALANGE: cuando el orden mata al caos",
    epoca: "Siglo VII a.C., Grecia",
    idea: "Convertir individuos en UNA sola máquina: lanzas de 6 metros, escudos que se solapan, avanzar como un muro.",
    legado: "Demostró que la disciplina vale más que el valor. Alejo de Macedonia la mejoró con caballería y aterrorizó dos continentes hasta Roma.",
    url: "https://www.worldhistory.org",
    fuente: "World History Encyclopedia",
  },
  {
    id: "a-polvora",
    titulo: "LA PÓLVORA: el accidente que acabó con los castillos",
    epoca: "Siglo IX, China",
    idea: "Alquimistas chinos buscaban el elixir de la inmortalidad… y mezclaron salitre, azufre y carbón.",
    legado: "La búsqueda de vida eterna produjo el instrumento de muerte masiva. Murallas de 10 metros, invencibles durante 3.000 años, se volvieron inútiles en 50.",
    url: "https://www.worldhistory.org",
    fuente: "World History Encyclopedia",
  },
  {
    id: "a-enigma",
    titulo: "ENIGMA: la máquina que hablaba sola",
    epoca: "1932-1945, Alemania",
    idea: "Rotores eléctricos que cambiaban el alfabeto cada pulsación: 158 quintillones de claves posibles al día.",
    legado: "Quebrar su código en Bletchley Park (Alan Turing) acortó la guerra años y fundió la informática moderna. Tu teléfono existe por una máquina de descifrar la muerte.",
    url: "https://airandspace.si.edu",
    fuente: "Smithsonian · Air & Space",
  },
  {
    id: "a-v2",
    titulo: "EL V-2: el primer objeto humano en el espacio",
    epoca: "1944, Peenemünde",
    idea: "Un cohete de 12 toneladas con guía inercial que caía más rápido que el sonido: no había sirena posible.",
    legado: "Disparado a Londres sin poder ser frenado. Sus ingenieros acabaron en la NASA (Paperclip): el mismo cohete que aterrorizó a Europa puso al hombre en la Luna 25 años después.",
    url: "https://www.archives.gov/research/military",
    fuente: "NARA · Registros militares",
  },
  {
    id: "a-atomica",
    titulo: "LA BOMBA ATÓMICA: la energía de las estrellas en una ciudad",
    epoca: "1942-1945, Proyecto Manhattan",
    idea: "Quebrar el núcleo del átomo (fisión) libera la fuerza que mantiene unida la materia.",
    legado: "6 de agosto de 1945: una sola arma vaporizó una ciudad. Desde entonces, el mundo vive bajo 12.000 armas en alerta y una bóveda de archivos que documenta cuántas veces estuvimos a minutos del fin.",
    url: "https://nsarchive.gmu.edu",
    fuente: "National Security Archive",
  },
  {
    id: "a-gps",
    titulo: "EL GPS: una red militar que te guía",
    epoca: "1978-1995, EE.UU.",
    idea: "24 satélites con relojes atómicos: si conoces el retraso de la señal de 4 de ellos, sabes DÓNDE estás al centímetro.",
    legado: "Nació para apuntar misiles. Hoy decide tu ruta, tu comida a domicilio y tu banca. Un arma que se convirtió en sistema nervioso del planeta — y que el ejército puede degradar en guerra.",
    url: "https://airandspace.si.edu",
    fuente: "Smithsonian · Air & Space",
  },
  {
    id: "a-dron",
    titulo: "EL DRON: la guerra convertida en pantalla",
    epoca: "1995-hoy",
    idea: "Separar el pilotaje del peligro: matar desde otro continente vía satélite, con retraso de 2 segundos.",
    legado: "Cambiaron la guerra y la ética: operadores vuelven a casa a cenar tras una misión. En Vanguard los pilotas tú mismo en DRON DE GUERRA… aquí, sin consecuencias reales.",
    url: "https://www.archives.gov/research/foreign-policy",
    fuente: "NARA · Política exterior",
  },
];

// ============ COLECCIÓN 3: CIVILIZACIONES PERDIDAS (8) ============
export const CIVILIZACIONES: CivilizacionOscura[] = [
  {
    id: "c-sumeria",
    titulo: "SUMERIA: los primeros que lo escribieron todo",
    epoca: "4500-1900 a.C., Mesopotamia",
    que: "Inventaron la escritura (cuneiforme), la rueda, las ciudades, la escuela, la cerveza y el primer código legal escrito.",
    misterio: "Su capital, Ur, quedó enterrada por las arenas durante 2.000 años. Sus tablillas contienen el EPIC de Gilgamesh… con un diluvio que destruye el mundo siglos antes del relato bíblico.",
    url: "https://www.worldhistory.org",
    fuente: "World History Encyclopedia",
  },
  {
    id: "c-indus",
    titulo: "EL VALLE DEL INDUS: la civilización sin rostro",
    epoca: "3300-1300 a.C., Pakistán/India",
    que: "5 millones de personas en ciudades con alcantarillado perfecto, estandarización de pesos… y paz: casi cero armas encontradas.",
    misterio: "Su escritura NO ha podido ser descifrada en 100 años. Nadie sabe cómo se llamaban, quién gobernaba ni qué idioma hablaban. Toda una civilización muda para siempre.",
    url: "https://www.worldhistory.org",
    fuente: "World History Encyclopedia",
  },
  {
    id: "c-tartessos",
    titulo: "TARTESSOS: la Atlántida española",
    epoca: "Siglo IX-VI a.C., Andalucía",
    que: "Reino de minas de plata y oro en el suroeste de Iberia que fascinó a griegos y fenicios. Heródoto lo describió con el rey Argantonio que vivió 120 años.",
    misterio: "Desapareció de los mapas en un siglo, sin guerra documentada. Aristóteles ya lo llamaba «ciudad perdida»; los buscadores lo persiguen desde entonces bajo el Guadalquivir.",
    url: "https://www.worldhistory.org",
    fuente: "World History Encyclopedia",
  },
  {
    id: "c-minoica",
    titulo: "MINOICA: el laberinto del Minotauro era real",
    epoca: "3000-1450 a.C., Creta",
    que: "La primera potencia naval europea: palacios de 1.300 habitaciones (Cnossos), frescos de delfines, mujeres sacerdotisas con estatus alto.",
    misterio: "La erupción de Santorini (4× la de Krakatoa) la quebró; luego invasores micénicos acabaron el resto. El mito del Minotauro en el laberinto es la memoria de aquel palacio-enigma.",
    url: "https://www.worldhistory.org",
    fuente: "World History Encyclopedia",
  },
  {
    id: "c-nabateos",
    titulo: "NABATEA: Petra, la ciudad tallada en roca",
    epoca: "Siglo IV a.C.-106 d.C., Jordania",
    que: "Caravanas de incienso que hicieron rico al desierto. En piedra sin agua construyeron un oasis con presas, cisternas y canales de precisión milimétrica.",
    misterio: "Roma la absorbió y el comercio la abandonó; los terremotos sellaron sus puertas. Occidente la olvidó 700 años: solo los beduinos sabían que existía hasta 1812.",
    url: "https://www.worldhistory.org",
    fuente: "World History Encyclopedia",
  },
  {
    id: "c-khmer",
    titulo: "KHMER: Angkor, la ciudad-planetaria",
    epoca: "802-1431 d.C., Camboya",
    que: "Angkor Wat, el edificio religioso más grande del planeta, alineado con el solsticio; un sistema hidráulico de 1.000 km² que alimentó a un millón de personas.",
    misterio: "Colapsó en décadas: sequías megacíclicas y las canales se taponaron. Los árboles se comieron los templos y Europa no la creyó hasta el siglo XIX.",
    url: "https://www.worldhistory.org",
    fuente: "World History Encyclopedia",
  },
  {
    id: "c-mali",
    titulo: "MALI: el hombre más rico de la historia",
    epoca: "1235-1600 d.C., África Occidental",
    que: "Mansá Musa infló la economía de El Cairo solo de pasar de compras: repartió TANTO oro que lo devaluó 12 años. Su biblioteca de Tombuctú guardaba manuscritos de astrofísica medieval.",
    misterio: "Tombuctú, leyenda de riquezas, terminó saqueada y sus libros enterrados en arena por familias que aún hoy los ocultan. La biblioteca más preciada del mundo cabe en cajas de madera.",
    url: "https://www.worldhistory.org",
    fuente: "World History Encyclopedia",
  },
  {
    id: "c-rapanui",
    titulo: "RAPA NUI: la isla que se quedó sola",
    epoca: "1200-1722 d.C., Pacífico",
    que: "850 moáis de hasta 82 toneladas «caminados» por islas sin árboles ni ruedas, con una escritura (rongorongo) aún sin descifrar.",
    misterio: "El aislamiento extremo del planeta: 2.000 km al vecino más cercano. Cuando llegó el primer barco, los moáis ya estaban derribados y la población diezmada. ¿Colapso ecológico, esclavitud, enfermedad? El debate sigue ardiendo.",
    url: "https://www.worldhistory.org",
    fuente: "World History Encyclopedia",
  },
];

// ====== PROGRESO Y RANGOS ======
export const OSCURA_TOTAL = TEORIAS.length + ARMAS.length + CIVILIZACIONES.length; // 26

export interface OscuraMilestone {
  at: number;
  coins: number;
  gems: number;
  xp: number;
  label: string;
}

export const OSCURA_MILESTONES: OscuraMilestone[] = [
  { at: 5, coins: 150, gems: 2, xp: 60, label: "LECTOR DE SOMBRAS: 5 entradas absorbidas" },
  { at: 12, coins: 400, gems: 5, xp: 150, label: "ANALISTA DEL ABISMO: 12 entradas" },
  { at: 20, coins: 800, gems: 10, xp: 250, label: "GUARDIÁN DEL ARCHIVO: 20 entradas" },
  { at: OSCURA_TOTAL, coins: 1500, gems: 20, xp: 400, label: "ALEJANDRÍA COMPLETA: lo sabes TODO" },
];

const RANKS_OSCURA: { at: number; name: string }[] = [
  { at: 0, name: "RECLUTA OSCURO" },
  { at: 2, name: "LECTOR DE SOMBRAS" },
  { at: 6, name: "ANALISTA DEL ABISMO" },
  { at: 12, name: "ARCHIVISTA DE ALEJANDRÍA" },
  { at: 19, name: "GUARDIÁN DEL ARCHIVO" },
  { at: OSCURA_TOTAL, name: "OJO QUE TODO LO LEE" },
];

export function oscuraRank(reads: number): string {
  let rank = RANKS_OSCURA[0].name;
  for (const r of RANKS_OSCURA) if (reads >= r.at) rank = r.name;
  return rank;
}

export function nextOscuraRankAt(reads: number): { rank: string; at: number } | null {
  for (const r of RANKS_OSCURA) if (reads < r.at) return { rank: r.name, at: r.at };
  return null;
}

// Entrada destacada del día (x1.5 botín) — seed UTC estable
export function entradaDelDia(): { titulo: string; coleccion: string; id: string } {
  const day = Math.floor(Date.now() / 86400000);
  const pool = [
    ...TEORIAS.map((t) => ({ id: t.id, titulo: t.titulo, coleccion: "TEORÍAS" })),
    ...ARMAS.map((a) => ({ id: a.id, titulo: a.titulo, coleccion: "ARMAS" })),
    ...CIVILIZACIONES.map((c) => ({ id: c.id, titulo: c.titulo, coleccion: "CIVILIZACIONES" })),
  ];
  return pool[day % pool.length];
}

export function isEntradaDelDia(id: string): boolean {
  return entradaDelDia().id === id;
}

export function lecturaOscuraReward(isDaily: boolean): { coins: number; xp: number } {
  const base = { coins: 12, xp: 8 };
  return isDaily
    ? { coins: Math.round(base.coins * 1.5), xp: Math.round(base.xp * 1.5) }
    : base;
}

// ====== STORE PERSISTENTE ======
interface OscuraState {
  readIds: string[];
  claimedMilestones: number[];
  registerRead: (id: string) => boolean; // true si es nueva
  claimMilestone: (at: number) => boolean;
  resetProgress: () => void;
}

export const useOscura = create<OscuraState>()(
  persist(
    (set, get) => ({
      readIds: [],
      claimedMilestones: [],

      registerRead: (id) => {
        if (get().readIds.includes(id)) return false;
        set({ readIds: [...get().readIds, id] });
        return true;
      },

      claimMilestone: (at) => {
        if (get().claimedMilestones.includes(at)) return false;
        set({ claimedMilestones: [...get().claimedMilestones, at] });
        return true;
      },

      resetProgress: () => set({ readIds: [], claimedMilestones: [] }),
    }),
    {
      name: "vg_oscura_v59",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
