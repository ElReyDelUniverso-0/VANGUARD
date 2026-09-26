"use client";

// v57.0 ARCHIVO SECRETO — EXPEDIENTES DESCLASIFICADOS
// Colección de expedientes REALES ya desclasificados por agencias oficiales:
// FBI Vault, CIA Reading Room, National Security Archive, NARA y The Black Vault.
// Todo es material PÚBLICO y LEGAL (salas de lectura FOIA). La emoción está en
// la presentación de dossier + la mecánica de colección con recompensas.
// Enlaces FBI: funcionan en móviles/navegadores reales (Akamai solo bloquea bots).

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type Agencia = "FBI" | "CIA" | "NSARCHIVE" | "NARA" | "BLACKVAULT";
export type SecRarity = "COMUN" | "RARO" | "EPICO" | "LEGENDARIO";

export interface Expediente {
  id: string;
  titulo: string;
  agencia: Agencia;
  year: string; // año de desclasificación / época
  clasificacion: string; // nivel de secreto ORIGINAL (ya desclasificado)
  cat: string; // categoría temática
  rareza: SecRarity;
  desc: string;
  url: string;
  fallbackUrl?: string; // enlace espejo verificado si el principal cae
}

export const EXPEDIENTES: Expediente[] = [
  // ===== CIA READING ROOM (enlaces verificados 200) =====
  {
    id: "cia-stargate",
    titulo: "Proyecto STARGATE: psíquicos al servicio de la inteligencia",
    agencia: "CIA",
    year: "1978–1995",
    clasificacion: "SECRETO",
    cat: "PSI-OP",
    rareza: "EPICO",
    desc: "Durante 17 años el gobierno de EE.UU. financió 'visores remotos': espías que intentaban ver bases enemigas con la mente. 20 millones de dólares y 89,000 páginas desclasificadas. Veredicto de la CIA: no sirvió... o eso dice el expediente.",
    url: "https://www.cia.gov/readingroom/collection/stargate",
    fallbackUrl: "https://www.cia.gov/readingroom/",
  },
  {
    id: "cia-ufo",
    titulo: "Expedientes OVNI de la CIA: los avistamientos que estudió en secreto",
    agencia: "CIA",
    year: "1947–1990s",
    clasificacion: "CONFIDENCIAL",
    cat: "OVNI",
    rareza: "LEGENDARIO",
    desc: "La colección oficial de avistamientos que la agencia recogió durante décadas de la Guerra Fría. En 2016 el tuit de la CIA lo confirmó: 'sí, tenemos los OVNI'. Aquí están, catalogados y liberados.",
    url: "https://www.cia.gov/readingroom/collection/ufo-collection",
    fallbackUrl: "https://www.cia.gov/readingroom/",
  },
  {
    id: "cia-gateway",
    titulo: "Documento GATEWAY: el informe que la CIA escribió sobre la conciencia",
    agencia: "CIA",
    year: "1983",
    clasificacion: "NO CLASIFICADO (antes reservado)",
    cat: "PSI-OP",
    rareza: "EPICO",
    desc: "Un análisis de 29 páginas sobre cómo 'trascender el espacio-tiempo' con la mente, guardado en los archivos internos de la agencia. Se volvió el documento más leído de toda la sala de lectura. Juzga tú mismo qué descubrieron.",
    url: "https://www.cia.gov/readingroom/docs/cia-rdp96-00788r001900760001-9.pdf",
    fallbackUrl: "https://www.cia.gov/readingroom/collection/stargate",
  },
  {
    id: "cia-pdb",
    titulo: "Informes diarios que solo leía el Presidente (1961–1969)",
    agencia: "CIA",
    year: "1961–1969",
    clasificacion: "TOP SECRET",
    cat: "GUERRA FRÍA",
    rareza: "LEGENDARIO",
    desc: "El documento más secreto de EE.UU. en su época: el resumen de inteligencia que cada mañana llegaba a la mesa de Kennedy y Johnson. Crisis de misiles, Vietnam, Berlín... cada página fue TOP SECRET absoluto.",
    url: "https://www.cia.gov/readingroom/collection/presidential-daily-briefings-1961-1969",
    fallbackUrl: "https://www.cia.gov/readingroom/",
  },
  {
    id: "cia-german",
    titulo: "Inteligencia extranjera alemana: de Gehlen a la Stasi",
    agencia: "CIA",
    year: "1945–1990",
    clasificacion: "SECRETO",
    cat: "ESPIONAJE",
    rareza: "RARO",
    desc: "Los expedientes sobre los servicios de espionaje alemanes que la CIA vigiló, reclutó y temió durante toda la Guerra Fría: la red Gehlen, la HVA de Markus Wolf y sus agentes dobles.",
    url: "https://www.cia.gov/readingroom/collection/german-foreign-intelligence",
    fallbackUrl: "https://www.cia.gov/readingroom/",
  },
  {
    id: "cia-invisible",
    titulo: "Escritura invisible: el arsenal secreto de la tinta espía",
    agencia: "CIA",
    year: "1917–1970s",
    clasificacion: "SECRETO",
    cat: "TÉCNICA",
    rareza: "RARO",
    desc: "Química espía pura: fórmulas de tintas invisibles, reveladores y micro puntos usados por agentes reales en ambas guerras mundiales. Parte de la colección quedó liberada en los años 70 bajo presión del Congreso.",
    url: "https://www.cia.gov/readingroom/collection/secret-writing",
    fallbackUrl: "https://www.cia.gov/readingroom/",
  },
  {
    id: "cia-coldwar",
    titulo: "Colección Guerra Fría: el frente secreto completo",
    agencia: "CIA",
    year: "1947–1991",
    clasificacion: "MIXTO",
    cat: "GUERRA FRÍA",
    rareza: "COMUN",
    desc: "La puerta de entrada a medio siglo de operaciones encubiertas: golpes de estado, radiodifusión clandestina, espías dobles y la paranoia mutuamente asegurada. Todo desclasificado por el programa CREST.",
    url: "https://www.cia.gov/readingroom/collection/cold-war-era",
    fallbackUrl: "https://www.cia.gov/readingroom/",
  },
  {
    id: "cia-crest",
    titulo: "Sala de lectura CREST: millones de páginas, acceso libre",
    agencia: "CIA",
    year: "1941–hoy",
    clasificacion: "DESCLASIFICADO",
    cat: "ARCHIVO",
    rareza: "COMUN",
    desc: "El archivo madre: más de un millón de documentos desclasificados buscables en línea, sin censura de catálogo. Si la CIA alguna vez escribió algo y dejó de protegerlo, termina aquí.",
    url: "https://www.cia.gov/readingroom/",
  },

  // ===== FAMOUS FOLLOWS: documentos de NARA (verificados 200) =====
  {
    id: "nara-jfk",
    titulo: "Expedientes del asesinato de JFK: la colección que el mundo espera",
    agencia: "NARA",
    year: "1963–2020s",
    clasificacion: "TOP SECRET → LIBERADO",
    cat: "HISTORIA",
    rareza: "LEGENDARIO",
    desc: "5 millones de páginas sobre el magnicidio de Dallas. Liberadas por lotes desde 2017 tras la ley JFK Records Act; cada ola de desclasificación hizo titulares en el planeta entero. El expediente secreto más famoso de la historia.",
    url: "https://www.archives.gov/research/jfk",
    fallbackUrl: "https://www.archives.gov/",
  },
  {
    id: "nara-military",
    titulo: "Historia militar desclasificada de EE.UU.",
    agencia: "NARA",
    year: "1775–hoy",
    clasificacion: "MIXTO",
    cat: "MILITAR",
    rareza: "RARO",
    desc: "Registros operativos, fotos, mapas y órdenes de todas las guerras estadounidenses: lo que los generales escribieron cuando pensaban que nadie lo leería.",
    url: "https://www.archives.gov/research/military",
    fallbackUrl: "https://www.archives.gov/",
  },
  {
    id: "nara-foreign",
    titulo: "Política exterior secreta: cables y tratados liberados",
    agencia: "NARA",
    year: "1776–hoy",
    clasificacion: "MIXTO",
    cat: "DIPLOMACIA",
    rareza: "RARO",
    desc: "La maquinaria diplomática oculta de Washington: telegramas, acuerdos y decisiones que definieron guerras y alianzas, hoy abiertos al público en los Archivos Nacionales.",
    url: "https://www.archives.gov/research/foreign-policy",
    fallbackUrl: "https://www.archives.gov/",
  },
  {
    id: "nara-milestone",
    titulo: "Documentos hito: los papeles que fundaron (y delataron) a las potencias",
    agencia: "NARA",
    year: "1492–hoy",
    clasificacion: "HISTÓRICO",
    cat: "HISTORIA",
    rareza: "COMUN",
    desc: "La colección permanente de documentos que cambiaron el mundo: cartas reales, tratados secretos y actas de fundación conservadas en pergamino. El origen de todo lo demás de este archivo.",
    url: "https://www.archives.gov/milestone-documents",
    fallbackUrl: "https://www.archives.gov/",
  },
  {
    id: "nara-founding",
    titulo: "Los papeles fundacionales originales",
    agencia: "NARA",
    year: "1776–1791",
    clasificacion: "PÚBLICO DESDE 1789",
    cat: "HISTORIA",
    rareza: "COMUN",
    desc: "Declaración de Independencia, Constitución y Carta de Derechos en su forma original. El primer 'expediente desclasificado' de la historia moderna: la revolución dejó de ser secreta al firmarla.",
    url: "https://www.archives.gov/founding-docs",
    fallbackUrl: "https://www.archives.gov/",
  },

  // ===== FBI VAULT (clásicos estables; Akamai solo bloquea bots, no móviles) =====
  {
    id: "fbi-capone",
    titulo: "Al Capone: el expediente del gángster que la ley no podía tocar",
    agencia: "FBI",
    year: "1920s–1947",
    clasificacion: "DESCLASIFICADO",
    cat: "CRIMEN",
    rareza: "RARO",
    desc: "El cerebro de la mafia de Chicago bajo lupa del FBI: chivatazos, seguimientos y la caída por impuestos. El Vault del FBI conserva el dossier completo del enemigo público número uno.",
    url: "https://vault.fbi.gov/al-capone",
    fallbackUrl: "https://www.fbi.gov/history",
  },
  {
    id: "fbi-bonnie",
    titulo: "Bonnie y Clyde: la pareja que humilló a la ley",
    agencia: "FBI",
    year: "1932–1934",
    clasificacion: "DESCLASIFICADO",
    cat: "CRIMEN",
    rareza: "RARO",
    desc: "Asaltos a bancos, fugas imposibles y una cacería interestatal que terminó a tiros en Louisiana. Los informes originales de la época, con autopsias y balística, siguen abiertos en el Vault.",
    url: "https://vault.fbi.gov/bonnie-and-clyde",
    fallbackUrl: "https://www.fbi.gov/history",
  },
  {
    id: "fbi-mlk",
    titulo: "Martin Luther King Jr.: el archivo de la vigilancia al premio Nobel",
    agencia: "FBI",
    year: "1963–1968",
    clasificacion: "DESCLASIFICADO (caso COINTELPRO)",
    cat: "VIGILANCIA",
    rareza: "EPICO",
    desc: "Uno de los expedientes más incómodos de la historia del FBI: el programa COINTELPRO espió, grabó y presionó al líder de los derechos civiles. Lo desclasificado obligó a reformar toda la vigilancia interna de EE.UU.",
    url: "https://vault.fbi.gov/martin-luther-king-jr",
    fallbackUrl: "https://vault.fbi.gov/cointelpro",
  },
  {
    id: "fbi-unabomber",
    titulo: "UNABOMBER: cazar a un matemático que escribía manifiestos",
    agencia: "FBI",
    year: "1978–1996",
    clasificacion: "DESCLASIFICADO",
    cat: "CRIMEN",
    rareza: "EPICO",
    desc: "17 bombas, 17 años y el perfil lingüístico que lo delató: la comparación del texto de su manifiesto con la tesis de Kaczynski. El caso abrió la era de la forense lingüística moderna.",
    url: "https://vault.fbi.gov/unabomber",
    fallbackUrl: "https://www.fbi.gov/history",
  },
  {
    id: "fbi-tesla",
    titulo: "Nikola Tesla: el genio que murió bajo custodia federal",
    agencia: "FBI",
    year: "1943",
    clasificacion: "DESCLASIFICADO",
    cat: "CIENCIA",
    rareza: "LEGENDARIO",
    desc: "Al morir Tesla en Nueva York, la Oficina de Custodia de Propiedad Extranjera selló su hotel y sus papeles. Lo que el FBI tiene del genio alimentó 80 años de mitos sobre armas de rayos y energía libre.",
    url: "https://vault.fbi.gov/nikola-tesla",
    fallbackUrl: "https://vault.fbi.gov/",
  },
  {
    id: "fbi-911",
    titulo: "PENTTBOM: la mayor investigación en la historia del FBI",
    agencia: "FBI",
    year: "2001",
    clasificacion: "PARCIALMENTE DESCLASIFICADO",
    cat: "TERRORISMO",
    rareza: "EPICO",
    desc: "El expediente del 11-S: 500,000 pistas de análisis y decenas de miles de entrevistas. Las páginas liberadas muestran cómo se reescribió la seguridad mundial en 72 horas.",
    url: "https://vault.fbi.gov/9-11-investigation",
    fallbackUrl: "https://vault.fbi.gov/",
  },
  {
    id: "fbi-ufo",
    titulo: "OVNI en el Vault del FBI: el caso Roswell y sus informes",
    agencia: "FBI",
    year: "1947–1950s",
    clasificacion: "DESCLASIFICADO",
    cat: "OVNI",
    rareza: "LEGENDARIO",
    desc: "El memorándum del agente del FBI de 1950 que registró 'tres platillos volantes con cuerpos de tres pies' es el documento más pedido del archivo. El Vault conserva la cacería de informes que siguió a Roswell.",
    url: "https://vault.fbi.gov/ufo",
    fallbackUrl: "https://www.theblackvault.com/documentarchive/",
  },

  // ===== NATIONAL SECURITY ARCHIVE (verificados 200) =====
  {
    id: "nsa-nuclear",
    titulo: "La Bóveda Nuclear: cómo el mundo planeó su propia aniquilación",
    agencia: "NSARCHIVE",
    year: "1945–1990s",
    clasificacion: "TOP SECRET → LIBERADO",
    cat: "MILITAR",
    rareza: "EPICO",
    desc: "El National Security Archive reconstruyó con documentos liberados los planes nucleares secretos: objetivos, cifras de muertes estimadas y el puente entre la disuasión y el error fatal.",
    url: "https://nsarchive.gwu.edu/project/nuclear-vault",
    fallbackUrl: "https://nsarchive.gwu.edu/",
  },
  {
    id: "nsa-home",
    titulo: "El Archivo de Seguridad Nacional: 40 años arrancando secretos por FOIA",
    agencia: "NSARCHIVE",
    year: "1985–hoy",
    clasificacion: "INVESTIGACIÓN",
    cat: "ARCHIVO",
    rareza: "COMUN",
    desc: "La ONG que ha liberado millones de páginas usando la Ley de Libertad de Información: golpes de estado, diplomacia secreta y guerras ocultas, cada expediente con su historia legal detrás.",
    url: "https://nsarchive.gwu.edu/",
  },

  // ===== THE BLACK VAULT (verificado 200) =====
  {
    id: "bv-home",
    titulo: "The Black Vault: el archivo FOIA más grande construido por una sola persona",
    agencia: "BLACKVAULT",
    year: "1996–hoy",
    clasificacion: "LIBERADO POR FOIA",
    cat: "ARCHIVO",
    rareza: "LEGENDARIO",
    desc: "John Greenewald empezó a pedir expedientes a los 15 años y hoy administra más de 3 millones de páginas desclasificadas: OVNI, biodefensa, CIA, FBI, militares... la mina definitiva del OSINT civil.",
    url: "https://www.theblackvault.com/documentarchive/",
  },
];

// ===== MILETOS DE COLECCIÓN =====
export interface SecMilestone {
  at: number;
  coins: number;
  gems: number;
  seasonXp: number;
  label: string;
}
export const SEC_MILESTONES: SecMilestone[] = [
  { at: 3, coins: 120, gems: 0, seasonXp: 40, label: "3 expedientes abiertos" },
  { at: 6, coins: 250, gems: 2, seasonXp: 60, label: "6 expedientes: analista certificado" },
  { at: 10, coins: 400, gems: 3, seasonXp: 90, label: "10 expedientes: agente encubierto" },
  { at: 15, coins: 600, gems: 5, seasonXp: 120, label: "15 expedientes: director adjunto" },
  { at: 21, coins: 900, gems: 8, seasonXp: 150, label: "21 expedientes: bóveda casi vacía" },
  { at: EXPEDIENTES.length, coins: 2000, gems: 30, seasonXp: 500, label: "ARCHIVO COMPLETO: eres el OJO DE DIOS" },
];

// ===== RANGOS DE INTELIGENCIA (por expedientes leídos) =====
const RANK_STEPS: { at: number; rank: string }[] = [
  { at: 0, rank: "RECLUTA" },
  { at: 1, rank: "VIGÍA" },
  { at: 3, rank: "ANALISTA" },
  { at: 6, rank: "OPERATIVO" },
  { at: 10, rank: "AGENTE ENCUBIERTO" },
  { at: 15, rank: "DIRECTOR ADJUNTO" },
  { at: 21, rank: "DIRECTOR DEL ARCHIVO" },
];

export function intelRank(reads: number): string {
  let rank = RANK_STEPS[0].rank;
  for (const s of RANK_STEPS) if (reads >= s.at) rank = s.rank;
  return rank;
}

export function nextRankAt(reads: number): { rank: string; at: number } | null {
  for (const s of RANK_STEPS) if (reads < s.at) return { rank: s.rank, at: s.at };
  return null;
}

// ===== EXPEDIENTE DEL DÍA (doble recompensa, seed por fecha UTC) =====
export function expedienteDelDia(): Expediente {
  const day = Math.floor(Date.now() / 86400000);
  return EXPEDIENTES[day % EXPEDIENTES.length];
}

export function isExpedienteDelDia(id: string): boolean {
  return expedienteDelDia().id === id;
}

// ===== RECOMPENSAS POR LECTURA =====
export function lecturaReward(exp: Expediente, isDaily: boolean): { coins: number; gems: number; seasonXp: number } {
  const base = { coins: 60, gems: 0, seasonXp: 45 };
  if (exp.rareza === "RARO") { base.coins = 90; base.seasonXp = 60; }
  if (exp.rareza === "EPICO") { base.coins = 140; base.gems = 1; base.seasonXp = 80; }
  if (exp.rareza === "LEGENDARIO") { base.coins = 220; base.gems = 2; base.seasonXp = 110; }
  if (isDaily) { base.coins = Math.round(base.coins * 1.5); base.seasonXp = Math.round(base.seasonXp * 1.5); }
  return base;
}

// ===== STORE PERSISTENTE (colección del jugador) =====
interface ExpedState {
  readIds: string[];
  claimedMilestones: number[];
  markRead: (id: string) => { already: boolean };
  claimMilestone: (at: number) => boolean;
  resetAll: () => void;
}

export const useExpedientes = create<ExpedState>()(
  persist(
    (set, get) => ({
      readIds: [],
      claimedMilestones: [],
      markRead: (id) => {
        if (get().readIds.includes(id)) return { already: true };
        set({ readIds: [...get().readIds, id] });
        return { already: false };
      },
      claimMilestone: (at) => {
        if (get().claimedMilestones.includes(at)) return false;
        set({ claimedMilestones: [...get().claimedMilestones, at] });
        return true;
      },
      resetAll: () => set({ readIds: [], claimedMilestones: [] }),
    }),
    { name: "vg_expedientes_v57", storage: createJSONStorage(() => localStorage) }
  )
);

export const AGENCIA_STYLE: Record<Agencia, { label: string; cls: string }> = {
  FBI: { label: "FBI VAULT", cls: "border-amber-hud text-amber bg-amber-hud/15" },
  CIA: { label: "CIA READING ROOM", cls: "border-cyan-hud text-cyan-hud bg-cyan-hud/15" },
  NSARCHIVE: { label: "NAT. SECURITY ARCHIVE", cls: "border-violet-hud text-violet-hud bg-violet-hud/15" },
  NARA: { label: "ARCHIVOS NACIONALES", cls: "border-green-hud text-green-hud bg-green-hud/15" },
  BLACKVAULT: { label: "THE BLACK VAULT", cls: "border-red-hud text-red-hud bg-red-hud/15" },
};

export const RARITY_STYLE: Record<SecRarity, string> = {
  COMUN: "text-slate-300 border-slate-500",
  RARO: "text-cyan-hud border-cyan-hud",
  EPICO: "text-violet-hud border-violet-hud",
  LEGENDARIO: "text-amber border-amber",
};
