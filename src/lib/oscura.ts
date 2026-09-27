"use client";

// v59.0 ALEJANDRÍA OSCURA — LA BIBLIOTECA DE ALEJANDRÍA GEOPOLÍTICA
// v60.0 CONOCIMIENTO PROHIBIDO — ampliación: 26 → 43 entradas en 4 colecciones
// (+STARGATE, +GATEWAY, +COINTELPRO, +VENONA, +RADAR, +TANQUE, +FUEGO GRIEGO,
// +GÖBEKLI TEPE, +ETRUSCOS) y nueva colección SALA DE DOCUMENTOS: enlaces
// directos a los archivos desclasificados reales (PDFs y bóvedas de la CIA,
// NARA y el National Security Archive). + QUIZ DE ALEJANDRÍA con XP.
// v61.0 ERUDITOS DEL ABISMO — banco de quiz 24 → 49 preguntas, RACHA DEL
// EXAMEN (días consecutivos con hitos pagados) e INTERROGATORIO: contrarreloj
// de 60 segundos contra TODO el banco con récord personal guardado.
// v62.0 ESCUDOS DEL ABISMO — tercera hornada: 16 preguntas más (49 → 65),
// todas extraídas de las entradas con datos verificados. Y el ESCUDO DE
// RACHA pasa a ser comprable en la TIENDA (más barato que la emergencia).
// Regla de oro: cada teoría lleva veredicto MITO / REAL / PARCIAL y fuente
// real desclasificada. Nada inventado: el miedo real está en los documentos.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// v63.0: los datos vivos ahora en ./oscura-data (server-safe). Re-exportados
// para que TODOS los imports existentes de "@/lib/oscura" sigan funcionando.
import { TEORIAS, ARMAS, CIVILIZACIONES, DOCS } from "./oscura-data";
export { TEORIAS, ARMAS, CIVILIZACIONES, DOCS };
export type { TeoriaOscura, ArmaOscura, CivilizacionOscura, DocumentoOscura, Veredicto, OscuraRarity } from "./oscura-data";

// ====== PROGRESO Y RANGOS ======
export const OSCURA_TOTAL = TEORIAS.length + ARMAS.length + CIVILIZACIONES.length + DOCS.length; // 43

export interface OscuraMilestone {
  at: number;
  coins: number;
  gems: number;
  xp: number;
  label: string;
}

export const OSCURA_MILESTONES: OscuraMilestone[] = [
  { at: 5, coins: 150, gems: 2, xp: 60, label: "LECTOR DE SOMBRAS: 5 entradas absorbidas" },
  { at: 15, coins: 450, gems: 6, xp: 180, label: "ANALISTA DEL ABISMO: 15 entradas" },
  { at: 28, coins: 900, gems: 12, xp: 300, label: "GUARDIÁN DEL ARCHIVO: 28 entradas" },
  { at: 40, coins: 1400, gems: 18, xp: 400, label: "ERUDITO PROHIBIDO: 40 entradas" },
  { at: OSCURA_TOTAL, coins: 2000, gems: 25, xp: 500, label: "ALEJANDRÍA COMPLETA: lo sabes TODO" },
];

const RANKS_OSCURA: { at: number; name: string }[] = [
  { at: 0, name: "RECLUTA OSCURO" },
  { at: 2, name: "LECTOR DE SOMBRAS" },
  { at: 6, name: "ANALISTA DEL ABISMO" },
  { at: 12, name: "ARCHIVISTA DE ALEJANDRÍA" },
  { at: 20, name: "GUARDIÁN DEL ARCHIVO" },
  { at: 30, name: "ERUDITO PROHIBIDO" },
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
    ...DOCS.map((d) => ({ id: d.id, titulo: d.titulo, coleccion: "DOCUMENTOS" })),
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

// ====== v60.0 QUIZ DE ALEJANDRÍA (ampliado en v61.0 y v62.0) ======
// 65 preguntas extraídas de las propias entradas de la biblioteca.
// Cada día el archivo elige 6 (determinista por seed UTC). Acierto = botín
// que viaja a TEMPORADA/SEMANA por el espejo XP global. Completar el set
// diario libera el BOTÍN DEL DÍA y mantiene la RACHA DEL EXAMEN (hitos en
// 3/7/14/30 días consecutivos). Solo se paga la primera vez por pregunta
// y por día: el conocimiento no se cobra dos veces.
// v61.0 INTERROGATORIO: contrarreloj de 60 s contra TODO el banco —
// recompensa menor por acierto, récord personal guardado para siempre.

export interface QuizQuestion {
  id: string;
  q: string;
  opts: [string, string, string];
  correct: 0 | 1 | 2;
}

export const QUIZ_BANK: QuizQuestion[] = [
  { id: "q-rept-veredicto", q: "Según la biblioteca, ¿qué veredicto tiene la tarjeta REPTILIANOS?", opts: ["MITO — nunca existió una sola foto real", "REAL — hay evidencia oficial", "PARCIAL — sigue en estudio"], correct: 0 },
  { id: "q-rept-icke", q: "¿Quién relanzó el mito reptiliano en 1998 ante miles de personas?", opts: ["Erich von Däniken", "David Icke", "Zecharia Sitchin"], correct: 1 },
  { id: "q-u2", q: "¿Qué avión espía explicó miles de avistamientos OVNI de los años 50?", opts: ["El SR-71", "El B-2 Spirit", "El U-2"], correct: 2 },
  { id: "q-mkultra-pct", q: "MK-ULTRA: ¿qué porcentaje de archivos destruyó el director Helms en 1973?", opts: ["~90%", "~50%", "~25%"], correct: 0 },
  { id: "q-mkultra-church", q: "¿Qué comité del Senado de EE.UU. confirmó MK-ULTRA en 1975?", opts: ["Comité McCarthy", "Comité Church", "Comité Warren"], correct: 1 },
  { id: "q-paperclip-n", q: "Operación Paperclip: ¿cuántos científicos alemanes llegó a EE.UU.?", opts: ["~160", "~1.600", "~16.000"], correct: 1 },
  { id: "q-vonbraun", q: "¿Qué científico de Paperclip era oficial de las SS y acabó llevando al hombre a la Luna?", opts: ["Wernher von Braun", "Kurt Blome", "Hubertus Strughold"], correct: 0 },
  { id: "q-area51-year", q: "¿En qué año desclasificó el Gobierno de EE.UU. la existencia del Área 51?", opts: ["1991", "2001", "2013"], correct: 2 },
  { id: "q-haarp-antenas", q: "HAARP: ¿cuántas antenas de 22 metros hay en Alaska?", opts: ["18", "180", "1.800"], correct: 1 },
  { id: "q-bermudas-quien", q: "¿Qué agencia cerró científicamente el mito del Triángulo de las Bermudas?", opts: ["La NASA", "La NOAA", "La ESA"], correct: 1 },
  { id: "q-nwo-quien", q: "¿Quién pronunció el discurso del «Nuevo Orden Mundial» en 1990?", opts: ["Ronald Reagan", "George H. W. Bush", "Mijaíl Gorbachov"], correct: 1 },
  { id: "q-svalbard", q: "¿Qué guarda la bóveda de Svalbard (Ártico)?", opts: ["Más de 1,2 millones de semillas", "Oro del FMI", "Servidores de la NSA"], correct: 0 },
  { id: "q-northwoods", q: "¿Qué proponía el plan Northwoods (rechazado)?", opts: ["Atentados falsos como pretexto para invadir Cuba", "Invadir México", "Bombardear Vietnam"], correct: 0 },
  { id: "q-uap-veredicto", q: "¿Qué dijo oficialmente el Pentágono sobre los videos UAP filtrados?", opts: ["Que son falsificaciones", "Que son auténticos y «no sabemos qué son»", "Que son drones chinos"], correct: 1 },
  { id: "q-stargate-coste", q: "Proyecto STARGATE: ¿cuánto gastó el gobierno en psíquicos?", opts: ["~2 millones $", "~22 millones $", "~2.200 millones $"], correct: 1 },
  { id: "q-stargate-cierre", q: "¿Por qué se cerró el proyecto STARGATE en 1995?", opts: ["Filtración a la prensa", "Nunca produjo inteligencia utilizable", "Falta de presupuesto militar"], correct: 1 },
  { id: "q-polvora-elixir", q: "La pólvora nació cuando alquimistas chinos buscaban…", opts: ["el elixir de la inmortalidad", "pintura impermeable", "medicina para caballos"], correct: 0 },
  { id: "q-enigma-turing", q: "¿Quién quebró el código Enigma en Bletchley Park?", opts: ["Alan Turing", "Claude Shannon", "John von Neumann"], correct: 0 },
  { id: "q-v2-ciudad", q: "El V-2 caía más rápido que el sonido: no había sirena posible. ¿Qué ciudad sufrió sus impactos?", opts: ["París", "Londres", "Moscú"], correct: 1 },
  { id: "q-gps-origen", q: "El GPS nació militar para…", opts: ["apuntar misiles", "guiar barcos mercantes", "mapas turísticos"], correct: 0 },
  { id: "q-falange-clave", q: "La falange griega demostró que vale más que el valor individual…", opts: ["la disciplina", "la caballería", "la numería"], correct: 0 },
  { id: "q-indus-escritura", q: "Del Valle del Indus NO se ha podido descifrar en 100 años…", opts: ["su escritura", "su calendario", "su moneda"], correct: 0 },
  { id: "q-mali-oro", q: "Mansá Musa devaluó el oro de una ciudad al gastar: ¿cuál?", opts: ["Tombuctú", "El Cairo", "Fez"], correct: 1 },
  { id: "q-rapanui-escritura", q: "¿Cómo se llama la escritura aún sin descifrar de Rapa Nui?", opts: ["rongorongo", "cuneiforme", "lineal A"], correct: 0 },
  // v61.0 ERUDITOS DEL ABISMO — segunda hornada: 25 preguntas más (banco 49)
  { id: "q-venona-agencia", q: "VENONA: ¿qué agencia descifró en secreto miles de cables soviéticos?", opts: ["La NSA", "El FBI", "La KGB"], correct: 0 },
  { id: "q-venona-anio", q: "¿En qué año desclasificó la NSA los cables VENONA completos?", opts: ["1975", "1995", "2013"], correct: 1 },
  { id: "q-cointelpro-robo", q: "¿Cómo se destapó COINTELPRO ante la prensa?", opts: ["Una filtración del Senado", "Un grupo activista robó 1.000 documentos en Media (Pensilvania)", "Una confesión de Hoover"], correct: 1 },
  { id: "q-cointelpro-hoover", q: "¿Qué director del FBI dirigió COINTELPRO de 1956 a 1971?", opts: ["J. Edgar Hoover", "Allen Dulles", "William Casey"], correct: 0 },
  { id: "q-gateway-anio", q: "¿De qué año es el informe GATEWAY que la CIA archivó?", opts: ["1963", "1983", "1999"], correct: 1 },
  { id: "q-stargate-lugar", q: "Los psíquicos de STARGATE tuvieron laboratorios en…", opts: ["Stanford y Fort Meade", "West Point y Langley", "MIT y Los Álamos"], correct: 0 },
  { id: "q-stargate-veredicto", q: "¿Qué concluyó la evaluación final de 1995 sobre STARGATE?", opts: ["Que funcionaba al 80%", "Que nunca produjo inteligencia utilizable", "Que había que ampliarlo"], correct: 1 },
  { id: "q-radar-batalla", q: "¿Qué batalla se ganó con torres de radar y no con aviones?", opts: ["Midway", "La Batalla de Bretaña", "El Alamein"], correct: 1 },
  { id: "q-radar-estaciones", q: "¿Cuántas estaciones de radar detectaban la Luftwaffe a 160 km?", opts: ["5", "21", "120"], correct: 1 },
  { id: "q-tanque-debut", q: "¿En qué batalla debutó el tanque en 1916?", opts: ["Verdún", "El Somme", "Gallípoli"], correct: 1 },
  { id: "q-fuego-agua", q: "¿Qué hacía de aterradora al fuego griego?", opts: ["Arde incluso sobre el mar", "Explota bajo la arena", "Convierte en piedra"], correct: 0 },
  { id: "q-fuego-perdido", q: "¿Qué pasó con la fórmula del fuego griego?", opts: ["La heredó Venecia", "Se perdió para siempre", "Napoleón la recuperó"], correct: 1 },
  { id: "q-gobekli-piramides", q: "GÖBEKLI TEPE es 7.000 años más antiguo que…", opts: ["las pirámides", "Stonehenge", "la Gran Muralla"], correct: 0 },
  { id: "q-gobekli-entierro", q: "¿Qué hicieron sus constructores con GÖBEKLI TEPE?", opts: ["Lo vendieron a Roma", "Lo enterraron todo con cuidado, nadie sabe por qué", "Lo dejaron caer en ruinas"], correct: 1 },
  { id: "q-etruscos-palabras", q: "Del idioma etrusco solo sabemos leer unas…", opts: ["20 palabras", "200 palabras", "2.000 palabras"], correct: 1 },
  { id: "q-tartessos-rio", q: "¿Bajo qué río se busca a Tartessos desde hace siglos?", opts: ["El Tajo", "El Ebro", "El Guadalquivir"], correct: 2 },
  { id: "q-minoica-volcan", q: "¿Qué erupción quebró la civilización minoica?", opts: ["El Vesubio", "Santorini (4× Krakatoa)", "El Krakatoa"], correct: 1 },
  { id: "q-nabateos-anio", q: "¿En qué año redescubrió Occidente Petra?", opts: ["1666", "1812", "1912"], correct: 1 },
  { id: "q-khmer-hidra", q: "¿Cuántos km² regaba el sistema hidráulico de Angkor?", opts: ["100", "1.000", "10.000"], correct: 1 },
  { id: "q-indus-armas", q: "¿Qué es rarísimo en las ciudades del Valle del Indus?", opts: ["Casi cero armas encontradas", "Sin alcantarillado", "Sin edificios"], correct: 0 },
  { id: "q-sumeria-gilgamesh", q: "Las tablillas de Ur contienen un diluvio anterior al bíblico en la epopeya de…", opts: ["Gilgamesh", "Hammurabi", "Nabucodonosor"], correct: 0 },
  { id: "q-enigma-claves", q: "¿Cuántas claves posibles al día tenía la máquina Enigma?", opts: ["158 quintillones", "158 millones", "1.58 billones"], correct: 0 },
  { id: "q-gps-satelites", q: "El GPS militar original usaba 24 satélites con…", opts: ["relojes atómicos", "espejos solares", "cámaras espía"], correct: 0 },
  { id: "q-atomic-alerta", q: "¿Cuántas armas nucleares siguen en alerta hoy según la biblioteca?", opts: ["~1.200", "~12.000", "~120.000"], correct: 1 },
  { id: "q-pdb-que", q: "¿Qué era el PDB que Kennedy leía cada mañana?", opts: ["El informe diario de inteligencia del presidente", "La agenda diplomática", "El boletín de bolsa"], correct: 0 },
  // v62.0 ESCUDOS DEL ABISMO — tercera hornada: 16 preguntas más (banco 65),
  // todas verificadas contra el texto de las 43 entradas.
  { id: "q-mkultra-lsd", q: "MK-ULTRA: ¿qué droga administró la CIA a ciudadanos sin que lo supieran?", opts: ["Adrenalina", "LSD", "Cafeína pura"], correct: 1 },
  { id: "q-area51-lago", q: "¿Cómo se llama el lago seco donde nació el Área 51?", opts: ["Groom Lake", "Lago Powell", "Badwater"], correct: 0 },
  { id: "q-haarp-megavatios", q: "¿Con cuánta potencia calienta HAARP la ionosfera?", opts: ["36 megavatios", "0,36 megavatios", "3,6 megavatios"], correct: 2 },
  { id: "q-bermudas-lloyd", q: "Además de la NOAA, ¿quién cerró el mito del Triángulo de las Bermudas?", opts: ["Lloyd's de Londres", "Lloyd's de Nassau", "Allianz Marítima"], correct: 0 },
  { id: "q-jfk-millones", q: "¿Cuántos documentos federales guarda el caso JFK?", opts: ["50.000", "500", "5 millones"], correct: 2 },
  { id: "q-gateway-hemisync", q: "¿Qué técnica de ondas cerebrales analiza el informe GATEWAY?", opts: ["Electroshock profundo", "Hemi-Sync", "Luz estroboscópica"], correct: 1 },
  { id: "q-arco-mongoles", q: "¿Qué pueblo conquistó el mayor imperio terrestre de la historia con el arco compuesto?", opts: ["Los mongoles", "Los romanos", "Los vikingos"], correct: 0 },
  { id: "q-polvora-mezcla", q: "¿Qué mezcla produce la pólvora?", opts: ["Sal y petróleo", "Cal y agua", "Salitre, azufre y carbón"], correct: 2 },
  { id: "q-tanque-blitz", q: "En 1940 la Blitzkrieg fue la idea del tanque corriendo a…", opts: ["4 km/h", "40 km/h", "400 km/h"], correct: 1 },
  { id: "q-fuego-asedios", q: "¿De cuántos asedios navales colosales salvó Constantinopla el fuego griego?", opts: ["Dos", "Ninguno: la ciudad cayó", "Veinte"], correct: 0 },
  { id: "q-sumeria-invento", q: "Además de la escritura, los sumerios inventaron…", opts: ["El papel", "La brújula", "La rueda"], correct: 2 },
  { id: "q-minoica-isla", q: "¿En qué isla floreció la primera potencia naval europea?", opts: ["Creta", "Chipre", "Sicilia"], correct: 0 },
  { id: "q-tartessos-rey", q: "Según Heródoto, ¿cómo se llamaba el rey de Tartessos que vivió 120 años?", opts: ["Viriate", "Argantonio", "Aníbal"], correct: 1 },
  { id: "q-rapanui-moais", q: "¿Cuántos moáis levantó Rapa Nui?", opts: ["850", "85", "8.500"], correct: 0 },
  { id: "q-gobekli-pilares", q: "¿Cuánto pesan los pilares de Göbekli Tepe?", opts: ["1,6 toneladas", "160 toneladas", "16 toneladas"], correct: 2 },
  { id: "q-venona-secreto", q: "VENONA: ¿cuánto tiempo se mantuvo en secreto el descifrado?", opts: ["Décadas — ni el presidente conocía el alcance", "Solo 5 años", "Nunca fue secreto"], correct: 0 },
];

export const QUIZ_PER_DAY = 6;
export const QUIZ_REWARD = { coins: 10, xp: 6 };           // por acierto
export const QUIZ_DAILY_BONUS = { coins: 50, gems: 2, xp: 30 }; // set completo

// v61.0 RACHA DEL EXAMEN: días consecutivos completando el set. Al cobrar el
// botín del día, si ayer también se cobró, la racha crece; si no, vuelve a 1.
export interface QuizStreakMilestone { at: number; coins: number; gems: number; xp: number }
export const QUIZ_STREAK_MILESTONES: QuizStreakMilestone[] = [
  { at: 3,  coins: 100,  gems: 1,  xp: 50 },
  { at: 7,  coins: 250,  gems: 3,  xp: 120 },
  { at: 14, coins: 500,  gems: 5,  xp: 250 },
  { at: 30, coins: 1500, gems: 15, xp: 600 },
];

// v61.0 INTERROGATORIO: contrarreloj contra el banco completo.
export const INTERRO_SECONDS = 60;
export const INTERRO_REWARD = { coins: 8, xp: 5 }; // por acierto (menor que el set diario)

export function dayKeyUtc(d = new Date()): string {
  return d.toISOString().slice(0, 10); // "2026-09-27"
}

// Set diario determinista: 6 preguntas distintas cada día (seed UTC estable)
export function quizSetOfDay(): QuizQuestion[] {
  const day = Math.floor(Date.now() / 86400000);
  const start = (day * 7) % QUIZ_BANK.length;
  const out: QuizQuestion[] = [];
  for (let i = 0; i < QUIZ_PER_DAY; i++) out.push(QUIZ_BANK[(start + i) % QUIZ_BANK.length]);
  return out;
}

// ====== STORE PERSISTENTE ======
interface OscuraState {
  readIds: string[];
  claimedMilestones: number[];
  // v60.0 QUIZ
  quizSolved: string[];       // aciertos históricos (ids de pregunta, nunca repetibles)
  quizDayKey: string;         // día del set actual
  quizSolvedToday: string[];  // aciertos del set de HOY
  quizBonusDay: string;       // día en que se cobró el botín del set completo
  // v61.0 racha + interrogatorio
  quizStreak: number;         // días consecutivos completando el examen
  quizLastClaim: string;      // último día UTC en que se cobró el botín
  bestInterrogatorio: number; // récord personal de aciertos en 60 s
  registerRead: (id: string) => boolean; // true si es nueva
  claimMilestone: (at: number) => boolean;
  solveQuiz: (id: string) => boolean;    // true si es nuevo acierto de HOY
  claimQuizBonus: () => { ok: boolean; streak: number; milestone: number }; // v61: paga y devuelve racha
  setBestInterrogatorio: (n: number) => boolean; // true si hay récord nuevo
  resetProgress: () => void;
}

export const useOscura = create<OscuraState>()(
  persist(
    (set, get) => ({
      readIds: [],
      claimedMilestones: [],
      quizSolved: [],
      quizDayKey: "",
      quizSolvedToday: [],
      quizBonusDay: "",
      quizStreak: 0,
      quizLastClaim: "",
      bestInterrogatorio: 0,

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

      // v60.0: marca un acierto del set diario. Si cambia el día UTC,
      // rota el set (quizSolvedToday se vacía). Devuelve true si el acierto
      // es NUEVO hoy (paga botín una sola vez por pregunta/día).
      solveQuiz: (id) => {
        const today = dayKeyUtc();
        if (get().quizDayKey !== today) {
          set({ quizDayKey: today, quizSolvedToday: [] });
        }
        if (get().quizSolvedToday.includes(id)) return false;
        set({
          quizSolvedToday: [...get().quizSolvedToday, id],
          quizSolved: get().quizSolved.includes(id)
            ? get().quizSolved
            : [...get().quizSolved, id],
        });
        return true;
      },

      // v60.0: botín por completar el set diario (idempotente por día UTC).
      // v61.0: además actualiza la RACHA (ayer cobrado → +1; si no → 1) y
      // devuelve el hito de racha alcanzado (3/7/14/30) para que el panel pague.
      claimQuizBonus: () => {
        const today = dayKeyUtc();
        const st = get();
        if (st.quizBonusDay === today) return { ok: false, streak: st.quizStreak, milestone: 0 };
        if (st.quizDayKey !== today || st.quizSolvedToday.length < QUIZ_PER_DAY)
          return { ok: false, streak: st.quizStreak, milestone: 0 };
        const yesterday = dayKeyUtc(new Date(Date.now() - 86400000));
        const streak = st.quizLastClaim === yesterday ? st.quizStreak + 1 : 1;
        const milestone = QUIZ_STREAK_MILESTONES.some((m) => m.at === streak) ? streak : 0;
        set({ quizBonusDay: today, quizStreak: streak, quizLastClaim: today });
        return { ok: true, streak, milestone };
      },

      // v61.0: récord personal del INTERROGATORIO (aciertos en 60 s)
      setBestInterrogatorio: (n) => {
        if (n <= get().bestInterrogatorio) return false;
        set({ bestInterrogatorio: n });
        return true;
      },

      resetProgress: () => set({ readIds: [], claimedMilestones: [], quizSolved: [], quizDayKey: "", quizSolvedToday: [], quizBonusDay: "", quizStreak: 0, quizLastClaim: "", bestInterrogatorio: 0 }),
    }),
    {
      name: "vg_oscura_v59",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
