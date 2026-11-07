// ══════════════════════════════════════════════════════════════════════
// v364.0 LA BIBLIOTECA DEL MUNDO — LAS ESTANTERÍAS REALES
// Orden del Dueño: «la biblioteca funciona como un libro de política: las
// constituciones de cada país y las cosas importantes para el mundo
// geopolítico, que uno puede seleccionar y buscar». Y con la ficha elegante
// como la del módulo de misiones: LA CÁTEDRA — misiones diarias que le
// hablan a la persona según su nivel y su regularidad, con el progreso
// marcado AL LADO, porque aquí se aprende POR PUNTOS, como en la escuela.
//
//   · ESTANTERÍA CONSTITUCIONES — fichas reales de las cartas magnas
//     vigentes (país, carta, año, tipo de gobierno, mandato, rasgos).
//   · ESTANTERÍA GEOPOLÍTICA — los tratados, doctrinas y conceptos que
//     mueven el tablero del mundo desde 1648.
//   · HONESTIDAD DE LA CASA — cada ficha es síntesis de consulta; donde
//     el suelo se mueve (transiciones, suspensiones), la ficha lo confiesa
//     en su NOTA. La letra pequeña siempre está en el texto original.
//   · LA REGLA DE PUNTOS PUBLICADA — leer una ficha por primera vez
//     = +XP_POR_FICHA_NUEVA XP · acertar una pregunta del examen del día
//     = +XP_POR_ACIERTO XP · cada misión del día trae su botín al reclamarla.
//   · EL RELOJ DE LA ESCUELA — el examen y las misiones giran con
//     diaDelAnillo() de estrategia-data (ley v324: un solo reloj, cero
//     copias). El día se firma con un gesto real: leer, buscar o examinar.
//   · PERSISTENCIA vg364-biblioteca con storageBlindado + registro en
//     rehidratador.tsx (ley v171/v172/v176 — sin registro, la cerradura
//     bloquea la escritura).
// ══════════════════════════════════════════════════════════════════════

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { storageBlindado } from "@/lib/storage-blindado";
import { diaDelAnillo } from "@/lib/estrategia-data";
// v365: la estantería ARSENAL alimenta el examen del día (pregunta 6) —
// la fuente vive en su propio archivo (biblioteca-armas-data.ts).
import { ARSENAL } from "@/lib/biblioteca-armas-data";

// ── LAS REGLAS DE PUNTOS (publicadas — la ficha las confiesa) ─────
export const XP_POR_FICHA_NUEVA = 15;
export const XP_POR_ACIERTO = 5;
export const MISIONES_AL_DIA = 3;
export const PREGUNTAS_EXAMEN = 6; // v365: la 6ª pregunta gira con el ARSENAL

export type Region = "AMÉRICA" | "EUROPA" | "ASIA" | "ÁFRICA" | "OCEANÍA";
export const REGIONES: Region[] = ["AMÉRICA", "EUROPA", "ASIA", "ÁFRICA", "OCEANÍA"];

export interface Constitucion {
  id: string;        // "const:us"
  pais: string;      // "Estados Unidos"
  iso: string;       // "us" (código de la casa para la bola de país)
  region: Region;
  nombre: string;    // "Constitución de 1787"
  año: number;       // año de la carta vigente
  tipo: string;      // forma de gobierno según el texto
  mandato: string;   // duración del ejecutivo / cámara clave
  rasgos: string[];  // 3 rasgos reales de la carta
  nota?: string;     // honestidad: suelo en movimiento se confiesa
}

export const CONSTITUCIONES: Constitucion[] = [
  // ─── AMÉRICA ────────────────────────────────────────────────────
  { id: "const:us", pais: "Estados Unidos", iso: "us", region: "AMÉRICA", nombre: "Constitución de 1787", año: 1787,
    tipo: "República federal presidencialista", mandato: "Presidencial: 4 años",
    rasgos: ["La más antigua por escrito que sigue en vigor (vigente desde 1789)", "27 enmiendas — las diez primeras son la Declaración de Derechos", "Frenos y contrapesos estrictos entre Ejecutivo, Congreso y Cortes"] },
  { id: "const:ca", pais: "Canadá", iso: "ca", region: "AMÉRICA", nombre: "Constitution Act 1867 + 1982", año: 1982,
    tipo: "Monarquía parlamentaria federal", mandato: "Cámara de los Comunes: máx. 4 años",
    rasgos: ["Constitución mixta: dos leyes escritas + convenciones", "Carta Canadiense de Derechos y Libertades (1982)", "La «patriación» de 1982 dio al país su propia fórmula de enmienda"] },
  { id: "const:mx", pais: "México", iso: "mx", region: "AMÉRICA", nombre: "Constitución de 1917", año: 1917,
    tipo: "República federal presidencialista", mandato: "Presidencial: 6 años sin reelección (sexenio)",
    rasgos: ["Nacida de la Revolución Mexicana", "Art. 27 (tierra y recursos) y art. 123 (derechos del trabajo)", "El sexenio: ni un solo presidente ha sido reelegido desde 1917"] },
  { id: "const:ar", pais: "Argentina", iso: "ar", region: "AMÉRICA", nombre: "Constitución de 1853", año: 1853,
    tipo: "República federal presidencialista", mandato: "Presidencial: 4 años",
    rasgos: ["Una de las más antiguas de América", "La reforma de 1994 sumó jefe de gabinete y derechos con jerarquía constitucional", "Los tratados de derechos humanos quedaron con rango casi constitucional"] },
  { id: "const:br", pais: "Brasil", iso: "br", region: "AMÉRICA", nombre: "Constitución de 1988", año: 1988,
    tipo: "República federal presidencialista", mandato: "Presidencial: 4 años",
    rasgos: ["La «Constituição Cidadã»: nacida del fin de la dictadura", "Derechos sociales extensos (salud, educación como deber del Estado)", "Federación de 26 estados + Distrito Federal"] },
  { id: "const:cl", pais: "Chile", iso: "cl", region: "AMÉRICA", nombre: "Constitución de 1980", año: 1980,
    tipo: "República presidencialista unitaria", mandato: "Presidencial: 4 años",
    rasgos: ["Nacida en el régimen militar, profundamente reformada en 2005", "Dos propuestas de nueva carta (2022 y 2023) fueron rechazadas en referéndum", "Tribunal Constitucional y contralor autónomo"] },
  { id: "const:co", pais: "Colombia", iso: "co", region: "AMÉRICA", nombre: "Constitución de 1991", año: 1991,
    tipo: "República presidencialista unitaria descentralizada", mandato: "Presidencial: 4 años",
    rasgos: ["Fruto de una Asamblea Constituyente popular", "La acción de tutela: cualquier persona defiende sus derechos con una carta", "Corte Constitucional con vocación de diálogo social"] },
  { id: "const:pe", pais: "Perú", iso: "pe", region: "AMÉRICA", nombre: "Constitución de 1993", año: 1993,
    tipo: "República presidencialista unitaria", mandato: "Presidencial: 5 años",
    rasgos: ["Sancionada tras el autogolpe de 1992, aprobada en referéndum", "Congreso unicameral de 130 escaños", "Fuerte capítulo económico de libre mercado"] },
  { id: "const:ve", pais: "Venezuela", iso: "ve", region: "AMÉRICA", nombre: "Constitución de 1999 («Bolivariana»)", año: 1999,
    tipo: "República federal presidencialista (según el texto)", mandato: "Presidencial: 6 años",
    rasgos: ["Redactada por la Constituyente convocada por Hugo Chávez", "Referéndum revocatorio a mitad de mandato", "Los poderes «ciudadano» y electoral con rango propio"] },
  { id: "const:ec", pais: "Ecuador", iso: "ec", region: "AMÉRICA", nombre: "Constitución de 2008 (Montecristi)", año: 2008,
    tipo: "República presidencialista unitaria", mandato: "Presidencial: 4 años",
    rasgos: ["Pionera mundial: derechos de la Naturaleza (arts. 71-74)", "Revocación del mandato popular (silla vacía y Recall)", "Consejo de Participación Ciudadana"] },
  { id: "const:bo", pais: "Bolivia", iso: "bo", region: "AMÉRICA", nombre: "Constitución de 2009", año: 2009,
    tipo: "República presidencialista (Estado Plurinacional)", mandato: "Presidencial: 5 años",
    rasgos: ["Estado Plurinacional con 36 naciones y pueblos reconocidos", "Referéndum revocatorio de mandato", "Asamblea Legislativa Plurinacional bicameral"] },
  { id: "const:py", pais: "Paraguay", iso: "py", region: "AMÉRICA", nombre: "Constitución de 1992", año: 1992,
    tipo: "República presidencialista", mandato: "Presidencial: 5 años sin reelección",
    rasgos: ["Primera carta democrática tras la era Stroessner", "Guaraní como lengua oficial junto al español", "Prohibición expresa de la reelección presidencial"] },
  { id: "const:uy", pais: "Uruguay", iso: "uy", region: "AMÉRICA", nombre: "Constitución de 1967", año: 1967,
    tipo: "República presidencialista", mandato: "Presidencial: 5 años",
    rasgos: ["Tradición de democracia directa: cabildo abierto y plebiscitos", "Cortes electorales independientes desde 1924", "Mecanismo de annullamento: el pueblo devuelve leyes al parlamento"] },
  { id: "const:cr", pais: "Costa Rica", iso: "cr", region: "AMÉRICA", nombre: "Constitución de 1949", año: 1949,
    tipo: "República presidencialista unitaria", mandato: "Presidencial: 4 años sin reelección",
    rasgos: ["Abolió el ejército (art. 12) tras la guerra civil de 1948", "Tribunal Supremo de Elecciones autónomo", "El «sábado de gloria» del pacto Figueres-Ulate"] },
  { id: "const:pa", pais: "Panamá", iso: "pa", region: "AMÉRICA", nombre: "Constitución de 1972", año: 1972,
    tipo: "República presidencialista", mandato: "Presidencial: 5 años",
    rasgos: ["Sin ejército permanente (abolido constitucionalmente en 1990)", "La Autoridad del Canal como institución del texto", "Reformada en 1978, 1983 y 2004"] },
  { id: "const:sv", pais: "El Salvador", iso: "sv", region: "AMÉRICA", nombre: "Constitución de 1983", año: 1983,
    tipo: "República presidencialista unitaria", mandato: "Presidencial: 5 años",
    rasgos: ["Escrita al cierre de la guerra civil", "La reforma de 2021 habilitó la reelección presidencial sucesiva", "Corte Suprema de Justicia con salas especializadas"] },
  { id: "const:gt", pais: "Guatemala", iso: "gt", region: "AMÉRICA", nombre: "Constitución de 1985", año: 1985,
    tipo: "República presidencialista unitaria", mandato: "Presidencial: 4 años sin reelección",
    rasgos: ["Puerta de salida de la dictadura militar", "Prohibición expresa de reelección presidencial", "Corte de Constitucionalidad colegiada"] },
  { id: "const:hn", pais: "Honduras", iso: "hn", region: "AMÉRICA", nombre: "Constitución de 1982", año: 1982,
    tipo: "República presidencialista", mandato: "Presidencial: 4 años",
    rasgos: ["El art. 239 y la reelección: foco de las mayores crisis del país (2009, 2017, 2021)", "Cámara de diputados de 128 escaños", "Procuraduría de Derechos Humanos con rango constitucional"] },
  { id: "const:ni", pais: "Nicaragua", iso: "ni", region: "AMÉRICA", nombre: "Constitución de 1987", año: 1987,
    tipo: "República presidencialista", mandato: "Presidencial: 5 años",
    rasgos: ["Reformada en profundidad en 1995, 2005, 2014 y después", "Las reformas sucesivas concentraron poderes en el Ejecutivo", "Cronología de poder civil-militar heredada del sandinismo"] },
  { id: "const:do", pais: "República Dominicana", iso: "do", region: "AMÉRICA", nombre: "Constitución de 2010", año: 2010,
    tipo: "República presidencialista unitaria", mandato: "Presidencial: 4 años",
    rasgos: ["La casa proclamó decenas de cartas desde 1844 — la vigente es la de 2010", "Restableció la reelección con separación de un período", "Tribunal Constitucional propio"] },
  { id: "const:cu", pais: "Cuba", iso: "cu", region: "AMÉRICA", nombre: "Constitución de 2019", año: 2019,
    tipo: "Estado socialista unipartidista", mandato: "Presidencial: 5 años",
    rasgos: ["Sustituyó a la de 1976 tras referéndum", "Creó la figura del Presidente (antes Presidente del Consejo de Estado)", "Reconoce la propiedad privada y la inversión extranjera con límites"] },
  { id: "const:ht", pais: "Haití", iso: "ht", region: "AMÉRICA", nombre: "Constitución de 1987", año: 1987,
    tipo: "República semipresidencialista unitaria", mandato: "Presidencial: 5 años",
    rasgos: ["Aprobada por referéndum tras la caída de Duvalier", "Sin parlamento operativo desde 2020", "Nota honesta: suspendida en la práctica durante la crisis actual"] },
  { id: "const:jm", pais: "Jamaica", iso: "jm", region: "AMÉRICA", nombre: "Constitución de 1962", año: 1962,
    tipo: "Monarquía parlamentaria (Westminster)", mandato: "Cámara: 5 años",
    rasgos: ["Nacida con la independencia del Reino Unido", "Capítulo III completo de derechos fundamentales", "El debate republicano está abierto desde los años 90"] },

  // ─── EUROPA ─────────────────────────────────────────────────────
  { id: "const:gb", pais: "Reino Unido", iso: "gb", region: "EUROPA", nombre: "Constitución no codificada", año: 1689,
    tipo: "Monarquía parlamentaria", mandato: "Cámara de los Comunes: máx. 5 años",
    rasgos: ["Sin una sola carta escrita: estatutos, jurisprudencia y convenciones", "Magna Carta (1215) y Bill of Rights (1689) como piedras angulares", "La soberanía del Parlamento es la regla madre"] },
  { id: "const:fr", pais: "Francia", iso: "fr", region: "EUROPA", nombre: "Constitución de 1958 (Vª República)", año: 1958,
    tipo: "República semipresidencialista unitaria", mandato: "Presidencial: 5 años",
    rasgos: ["Escrita para De Gaulle para terminar con la inestabilidad de la IVª", "El Consejo Constitucional vigila las leyes desde 1958", "El art. 49.3 y la «cohabitación» definen su vida política"] },
  { id: "const:de", pais: "Alemania", iso: "de", region: "EUROPA", nombre: "Ley Fundamental de 1949", año: 1949,
    tipo: "República federal parlamentaria", mandato: "Canciller mientras conserve la confianza (Bundestag: 4 años)",
    rasgos: ["Art. 1: «La dignidad humana es intocable»", "Moción de censura constructiva: no se cae el gobierno sin elegir otro", "Cláusula de eternidad (art. 79.3): la dignidad no se enmienda"] },
  { id: "const:it", pais: "Italia", iso: "it", region: "EUROPA", nombre: "Constitución de 1948", año: 1948,
    tipo: "República parlamentaria", mandato: "Cámara: 5 años",
    rasgos: ["El referéndum de 1946 desterró la monarquía antes de escribirla", "Regionalismo firme y municipios con autonomía", "Tribunal Constitucional y referéndum abrogativo"] },
  { id: "const:es", pais: "España", iso: "es", region: "EUROPA", nombre: "Constitución de 1978", año: 1978,
    tipo: "Monarquía parlamentaria", mandato: "Congreso: 4 años",
    rasgos: ["Cierre de la Transición: aprobada por referéndum con el 87,8% de sí", "El Estado de las autonomías: 17 comunidades y 2 ciudades", "Tribunal Constitucional y Defensor del Pueblo"] },
  { id: "const:pt", pais: "Portugal", iso: "pt", region: "EUROPA", nombre: "Constitución de 1976", año: 1976,
    tipo: "República semipresidencialista", mandato: "Presidencial: 5 años",
    rasgos: ["Nacida de la Revolución de los Claveles (1974)", "Programa inicial de acento socialista, centrado en 1982", "Presidencia con poder real de veto y disolución"] },
  { id: "const:nl", pais: "Países Bajos", iso: "nl", region: "EUROPA", nombre: "Constitución de 1815 (revisión 1983)", año: 1815,
    tipo: "Monarquía parlamentaria", mandato: "Cámara: 4 años",
    rasgos: ["La revisión de 1983 reescribió el capítulo de derechos", "El art. 120: los jueces NO controlan la constitucionalidad de las leyes", "Reforma constitucional en dos lecturas con disolución intermedia"] },
  { id: "const:be", pais: "Bélgica", iso: "be", region: "EUROPA", nombre: "Constitución de 1831", año: 1831,
    tipo: "Monarquía parlamentaria federal", mandato: "Cámara: 4 años",
    rasgos: ["La más antigua de Europa continental que sigue en vigor (con reformas)", "Seis reformas del Estado (1970-2014) la volvieron federal", "El «compromiso belga»: consenso entre flamencos y francófonos"] },
  { id: "const:ch", pais: "Suiza", iso: "ch", region: "EUROPA", nombre: "Constitución federal de 1999", año: 1999,
    tipo: "República federal directorial", mandato: "Consejo Federal: 7 miembros, presidencia rotatoria de 1 año",
    rasgos: ["Democracia directa: cualquier ley puede caer por referéndum", "La de 1848 fundó el Estado moderno; la de 1999 la reescribió", "Cuatro lenguas nacionales y cantones soberanos"] },
  { id: "const:at", pais: "Austria", iso: "at", region: "EUROPA", nombre: "Constitución de 1920 (B-VG)", año: 1920,
    tipo: "República federal parlamentaria", mandato: "Presidencial: 6 años",
    rasgos: ["Obra de Hans Kelsen: aquí nace el Tribunal Constitucional moderno", "Reformada centenares de veces — una de las cartas más vivas", "Proporcionalidad electoral como regla madre"] },
  { id: "const:se", pais: "Suecia", iso: "se", region: "EUROPA", nombre: "Instrumento de Gobierno de 1974", año: 1974,
    tipo: "Monarquía parlamentaria", mandato: "Riksdag: 4 años",
    rasgos: ["Una de las cuatro Leyes Fundamentales del reino", "La Ley de Libertad de Imprenta de 1766, pionera mundial", "El rey reina pero NO gobierna desde 1974"] },
  { id: "const:no", pais: "Noruega", iso: "no", region: "EUROPA", nombre: "Constitución de 1814 (Eidsvoll)", año: 1814,
    tipo: "Monarquía parlamentaria", mandato: "Storting: 4 años",
    rasgos: ["La segunda constitución escrita más antigua en vigor del mundo", "Escrita en semanas tras la caída de Napoleón", "Parlamentarismo consolidado por convención desde 1884"] },
  { id: "const:dk", pais: "Dinamarca", iso: "dk", region: "EUROPA", nombre: "Constitución de 1953", año: 1953,
    tipo: "Monarquía parlamentaria", mandato: "Folketing: 4 años",
    rasgos: ["Suprimió la cámara alta (Landsting): unicameralismo", "Toda reforma exige doble votación + referéndum", "El soberano no actúa sin firma ministerial"] },
  { id: "const:fi", pais: "Finlandia", iso: "fi", region: "EUROPA", nombre: "Constitución de 2000", año: 2000,
    tipo: "República parlamentaria", mandato: "Presidencial: 6 años",
    rasgos: ["Fusionó en un solo texto las cuatro leyes fundamentales anteriores", "Parlamentarismo reforzado: el Eduskunta manda", "Referéndum consultivo posible por mayoría de diputados"] },
  { id: "const:ie", pais: "Irlanda", iso: "ie", region: "EUROPA", nombre: "Constitución de 1937 (Bunreacht na hÉireann)", año: 1937,
    tipo: "República parlamentaria", mandato: "Presidencial: 7 años",
    rasgos: ["Aprobada por plebiscito en 1937, sustituyó al Estado Libre", "Referéndum ciudadano como vía normal de reforma", "El Tribunal Supremo lee derechos «implícitos» en el texto"] },
  { id: "const:is", pais: "Islandia", iso: "is", region: "EUROPA", nombre: "Constitución de 1944", año: 1944,
    tipo: "República parlamentaria", mandato: "Presidencial: 4 años",
    rasgos: ["Adoptada al proclamarse la república, rota con Dinamarca", "El Althing: el parlamento más antiguo de Europa (930)", "La presidencia islandesa es casi ceremonial"] },
  { id: "const:pl", pais: "Polonia", iso: "pl", region: "EUROPA", nombre: "Constitución de 1997", año: 1997,
    tipo: "República parlamentaria", mandato: "Presidencial: 5 años",
    rasgos: ["Primera carta plenamente democrática tras el comunismo", "Censo de derechos sociales amplio", "El papel del Tribunal Constitucional, centro del debate político desde 2015"] },
  { id: "const:cz", pais: "Chequia", iso: "cz", region: "EUROPA", nombre: "Constitución de 1993", año: 1993,
    tipo: "República parlamentaria", mandato: "Presidencial: 5 años (elección directa desde 2013)",
    rasgos: ["Nacida con la disolución pacífica de Checoslovaquia", "Carta de Derechos Fundamentales como parte separada del texto", "Cámara de Diputados de 200 escaños"] },
  { id: "const:sk", pais: "Eslovaquia", iso: "sk", region: "EUROPA", nombre: "Constitución de 1992", año: 1992,
    tipo: "República parlamentaria", mandato: "Presidencial: 5 años",
    rasgos: ["Firmada tres meses antes de la separación de Chequia", "Referéndum vinculante como institución central", "Reforma de 2001 la alineó con la entrada en la UE"] },
  { id: "const:hu", pais: "Hungría", iso: "hu", region: "EUROPA", nombre: "Ley Fundamental de 2011", año: 2011,
    tipo: "República parlamentaria", mandato: "Presidencial: 5 años (por el Parlamento)",
    rasgos: ["Sustituyó a la de 1989 con mayoría de dos tercios", "Preámbulo con autodefinición cristiana-nacional debatida por la UE", "La reforma judicial fue el centro del pulso con Bruselas"] },
  { id: "const:ro", pais: "Rumanía", iso: "ro", region: "EUROPA", nombre: "Constitución de 1991 (revisada 2003)", año: 1991,
    tipo: "República semipresidencialista", mandato: "Presidencial: 5 años (desde la revisión de 2003)",
    rasgos: ["Primera carta postcomunista del país", "La revisión de 2003 la alineó con la UE y alargó el mandato presidencial", "Referéndum de destitución como institución (2007, 2012)"] },
  { id: "const:bg", pais: "Bulgaria", iso: "bg", region: "EUROPA", nombre: "Constitución de 1991", año: 1991,
    tipo: "República parlamentaria", mandato: "Presidencial: 5 años",
    rasgos: ["Grandes Asambleas Nacionales para reformas de fondo (tradición de 1879)", "Presidencia con veto real", "Ciclos electorales muy frecuentes: seis comicios entre 2021 y 2023"] },
  { id: "const:gr", pais: "Grecia", iso: "gr", region: "EUROPA", nombre: "Constitución de 1975", año: 1975,
    tipo: "República parlamentaria", mandato: "Presidencial: 5 años",
    rasgos: ["Fundación de la Tercera República helénica tras la junta", "Revisada en 1986, 2001 y 2019", "El presidente es elegido por el Parlamento"] },
  { id: "const:tr", pais: "Turquía", iso: "tr", region: "EUROPA", nombre: "Constitución de 1982", año: 1982,
    tipo: "República presidencialista (desde 2017)", mandato: "Presidencial: 5 años",
    rasgos: ["Nacida del golpe de 1980, reformada decenas de veces", "El referéndum de 2017 pasó del parlamentarismo al presidencialismo ejecutivo", "Diyanet y Consejo de Seguridad Nacional en el texto"] },
  { id: "const:ru", pais: "Rusia", iso: "ru", region: "EUROPA", nombre: "Constitución de 1993", año: 1993,
    tipo: "República federal semipresidencialista con fuerte poder presidencial", mandato: "Presidencial: 6 años",
    rasgos: ["Nacida de la crisis de 1993, aprobada en referéndum", "Las enmiendas de 2020 reiniciaron el conteo de mandatos del titular", "El Consejo de Seguridad y los «superdistritos» bajo debate"] },
  { id: "const:ua", pais: "Ucrania", iso: "ua", region: "EUROPA", nombre: "Constitución de 1996", año: 1996,
    tipo: "República semipresidencialista unitaria", mandato: "Presidencial: 5 años",
    rasgos: ["Primera carta de la Ucrania independiente", "Las reformas de 2004 y 2014 reequilibraron presidente y parlamento", "El estado de guerra (desde 2022) condiciona su aplicación"] },
  { id: "const:by", pais: "Bielorrusia", iso: "by", region: "EUROPA", nombre: "Constitución de 1994 (reformada 2022)", año: 1994,
    tipo: "República presidencialista", mandato: "Presidencial: 5 años",
    rasgos: ["La reforma de 2022 creó el Congreso Popular de toda Bielorrusia", "El titular quedó fuera del conteo de mandatos", "Neutralidad nuclear y sin bloques escritas en 1994"] },
  { id: "const:lt", pais: "Lituania", iso: "lt", region: "EUROPA", nombre: "Constitución de 1992", año: 1992,
    tipo: "República semipresidencialista", mandato: "Presidencial: 5 años",
    rasgos: ["Aprobada por referéndum el día del 75º aniversario del Estado (1992)", "Prohibición de venta de tierras a extranjeros, luego flexibilizada por la UE", "Referéndum ciudadano como institución central"] },
  { id: "const:lv", pais: "Letonia", iso: "lv", region: "EUROPA", nombre: "Constitución de 1922 (Satversme)", año: 1922,
    tipo: "República parlamentaria", mandato: "Presidencial: 4 años (por el Saeima)",
    rasgos: ["Una de las pocas constituciones de entreguerras restituidas casi intactas (1991-93)", "Presidencia elegida por el parlamento", "El idioma oficial único (letón) en el centro del texto"] },
  { id: "const:ee", pais: "Estonia", iso: "ee", region: "EUROPA", nombre: "Constitución de 1992", año: 1992,
    tipo: "República parlamentaria", mandato: "Presidencial: 5 años",
    rasgos: ["Referéndum de junio de 1992: la ciudadanía por ius sanguinis marcó el debate", "El Riigikogu elige al presidente (con colegio electoral de respaldo)", "Digital-first: el voto por internet desde 2005"] },
  { id: "const:md", pais: "Moldavia", iso: "md", region: "EUROPA", nombre: "Constitución de 1994", año: 1994,
    tipo: "República parlamentaria", mandato: "Presidencial: 4 años",
    rasgos: ["Neutralidad permanente declarada en el texto", "El idioma y la identidad, el eje de la política desde siempre", "La Corte Constitucional decidió la elección directa (2016) y la indirecta (2019)"] },
  { id: "const:si", pais: "Eslovenia", iso: "si", region: "EUROPA", nombre: "Constitución de 1991", año: 1991,
    tipo: "República parlamentaria", mandato: "Presidencial: 5 años",
    rasgos: ["Escrita semanas antes de declarar la independencia", "Referéndum de independencia diciembre 1990: 88% de sí", "Consejo Nacional como cámara de intereses"] },
  { id: "const:hr", pais: "Croacia", iso: "hr", region: "EUROPA", nombre: "Constitución de 1990", año: 1990,
    tipo: "República parlamentaria (semipresidencial en el papel)", mandato: "Presidencial: 5 años",
    rasgos: ["Nacida en el invierno de la disolución yugoslava", "Reformada en 2000-01 hacia el parlamentarismo", "La UE impuso capítulos de cooperación judicial antes de entrar"] },
  { id: "const:rs", pais: "Serbia", iso: "rs", region: "EUROPA", nombre: "Constitución de 2006", año: 2006,
    tipo: "República parlamentaria", mandato: "Presidencial: 5 años",
    rasgos: ["Declara a Kosovo y Metohija parte «con autonomía amplia» de Serbia", "El país no controla de facto ese territorio desde 1999", "Referéndum sobre la constitución: 2006"] },

  // ─── ASIA ───────────────────────────────────────────────────────
  { id: "const:cn", pais: "China", iso: "cn", region: "ASIA", nombre: "Constitución de 1982", año: 1982,
    tipo: "República popular socialista unipartidista", mandato: "Presidencial: 5 años (sin límite desde 2018)",
    rasgos: ["La Asamblea Popular Nacional es el órgano supremo (casi 3.000 delegados)", "La enmienda de 2018 suprimió el límite de dos mandatos presidenciales", "«Socialismo con características chinas» como doctrina oficial"] },
  { id: "const:jp", pais: "Japón", iso: "jp", region: "ASIA", nombre: "Constitución de 1947", año: 1947,
    tipo: "Monarquía parlamentaria (emperador simbólico)", mandato: "Cámara de Representantes: 4 años (disoluble)",
    rasgos: ["Art. 9: renuncia a la guerra como derecho soberano", "Nunca reformada desde 1947 — el art. 96 pide dos tercios + referéndum", "Escrita bajo ocupación, ratificada por parlamento electo"] },
  { id: "const:in", pais: "India", iso: "in", region: "ASIA", nombre: "Constitución de 1950", año: 1950,
    tipo: "República federal parlamentaria", mandato: "Lok Sabha: 5 años",
    rasgos: ["La constitución más larga del mundo por escrito (más de 400 artículos)", "Abolió la intocabilidad y creó reservas para castas y tribus", "Estructura federal con un único código civil pendiente de debate"] },
  { id: "const:kr", pais: "Corea del Sur", iso: "kr", region: "ASIA", nombre: "Constitución de 1987 (Sexta República)", año: 1987,
    tipo: "República presidencialista", mandato: "Presidencial: 5 años, un solo mandato",
    rasgos: ["El mandato único nació de la memoria autoritaria", "Corte Constitucional activa: destitución de la presidenta Park en 2017", "El texto promete la reunificación pacífica en su preámbulo"] },
  { id: "const:kp", pais: "Corea del Norte", iso: "kp", region: "ASIA", nombre: "Constitución socialista (1948/1972, muy revisada)", año: 1972,
    tipo: "Estado socialista con dirección hereditaria", mandato: "Liderazgo hereditario del partido",
    rasgos: ["El texto convive con las «reglas» del partido y los diez principios", "Enmiendas 2009/2012/2016-19 dieron marco a la Comisión de Asuntos de Estado", "La pose nuclear (2012) entró en la constitución"] },
  { id: "const:id", pais: "Indonesia", iso: "id", region: "ASIA", nombre: "Constitución de 1945", año: 1945,
    tipo: "República presidencialista", mandato: "Presidencial: 5 años",
    rasgos: ["La Pancasila (5 principios) como base filosófica del Estado", "Las enmiendas de 1999-2002 recortaron el poder presidencial y crearon el DPD", "El país con más musulmanes del mundo: la religión está en el preámbulo"] },
  { id: "const:pk", pais: "Pakistán", iso: "pk", region: "ASIA", nombre: "Constitución de 1973", año: 1973,
    tipo: "República federal parlamentaria islámica", mandato: "Asamblea Nacional: 5 años",
    rasgos: ["Tercera constitución (tras 1956 y 1962), la única que duró", "El Consejo Islámico Ideológico revisa las leyes", "El art. 6 declara alta traición suspender la constitución — se aplicó a Musharraf"] },
  { id: "const:bd", pais: "Bangladés", iso: "bd", region: "ASIA", nombre: "Constitución de 1972", año: 1972,
    tipo: "República parlamentaria unitaria", mandato: "Parlamento (Jatiya Sangsad): 5 años",
    rasgos: ["Cuatro principios fundadores: nacionalismo, socialismo, democracia y secularismo", "El objetivo del socialismo y el laicismo, modificados por enmiendas sucesivas", "La 15ª enmienda (2011) restauró el sistema parlamentario puro"] },
  { id: "const:lk", pais: "Sri Lanka", iso: "lk", region: "ASIA", nombre: "Constitución de 1978", año: 1978,
    tipo: "República semipresidencialista unitaria", mandato: "Presidencial: 5 años",
    rasgos: ["Presidencia ejecutiva fuerte nacida con J.R. Jayewardene", "La 19ª (2015) recortó poderes, la 20ª (2020) los devolvió, la 21ª (2022) volvió a recortarlos tras la crisis", "El budismo ocupa el «primer lugar» según el art. 9"] },
  { id: "const:np", pais: "Nepal", iso: "np", region: "ASIA", nombre: "Constitución de 2015", año: 2015,
    tipo: "República federal parlamentaria secular", mandato: "Cámara: 5 años",
    rasgos: ["Cerró el ciclo: guerra civil, paz de 2006, fin de la monarquía (2008)", "Laicidad declarada con «protección de la religión ancestral»", "Federación de 7 provincias"] },
  { id: "const:mm", pais: "Myanmar", iso: "mm", region: "ASIA", nombre: "Constitución de 2008", año: 2008,
    tipo: "República parlamentaria con papel militar reservado", mandato: "Presidencial: 5 años",
    rasgos: ["El 25% de los escaños del parlamento está reservado al ejército", "Nota honesta: los militares derribaron al gobierno electo en 2021; el texto sigue siendo la base formal de la junta", "El Ministerio de Defensa y Asuntos Fronterizos lo nombra el comandante"] },
  { id: "const:th", pais: "Tailandia", iso: "th", region: "ASIA", nombre: "Constitución de 2017", año: 2017,
    tipo: "Monarquía parlamentaria con Senado designado", mandato: "Cámara: 4 años",
    rasgos: ["La vigésima constitución desde 1932", "El Senado no electo eligió al primer ministro en 2019 y pesó en 2023-24", "El artículo sobre la monarquía protege la persona del rey con leyes propias"] },
  { id: "const:vn", pais: "Vietnam", iso: "vn", region: "ASIA", nombre: "Constitución de 2013", año: 2013,
    tipo: "República socialista unipartidista", mandato: "Presidencial: 5 años",
    rasgos: ["El Partido Comunista como «fuerza dirigente» en el art. 4", "«Economía de mercado orientada socialista» escrita por primera vez (2013)", "El referéndum previsto por el texto nunca se ha convocado"] },
  { id: "const:ph", pais: "Filipinas", iso: "ph", region: "ASIA", nombre: "Constitución de 1987", año: 1987,
    tipo: "República presidencialista unitaria", mandato: "Presidencial: 6 años sin reelección",
    rasgos: ["Nacida tras la dictadura de Marcos con la memoria de la ley marcial", "Prohibición expresa de reelección presidencial", "Ratificada por referéndum (76,4% de sí)"] },
  { id: "const:my", pais: "Malasia", iso: "my", region: "ASIA", nombre: "Constitución de 1957", año: 1957,
    tipo: "Monarquía federal electiva parlamentaria", mandato: "Dewan Rakyat: 5 años",
    rasgos: ["El Yang di-Pertuan Agong (rey) rota cada 5 años entre los 9 sultanes", "El art. 153 reserva posiciones a los bumiputera — el eje del debate", "Islam como religión de la federación con libertad de culto declarada"] },
  { id: "const:sg", pais: "Singapur", iso: "sg", region: "ASIA", nombre: "Constitución de 1965", año: 1965,
    tipo: "República parlamentaria", mandato: "Presidencial: 6 años",
    rasgos: ["Presidencia electa con poderes de «custodia fiscal» desde 1991", "El PAP gana todas las elecciones desde 1959 — dominio sin violación formal del texto", "El modelo Westminster con miembros no de circunscripción"] },
  { id: "const:il", pais: "Israel", iso: "il", region: "ASIA", nombre: "Sin constitución formal: Leyes Fundamentales", año: 1948,
    tipo: "República parlamentaria", mandato: "Knesset: 4 años",
    rasgos: ["La Declaración de Independencia (1948) prometió una constitución que nunca se completó", "Las Leyes Fundamentales del Knesset hacen de constitución acumulativa", "La reforma judicial de 2023 desató la mayor crisis interna de su historia"] },
  { id: "const:ir", pais: "Irán", iso: "ir", region: "ASIA", nombre: "Constitución de 1979 (revisada 1989)", año: 1979,
    tipo: "República islámica teocrática-electoral", mandato: "Presidencial: 4 años",
    rasgos: ["El Líder Supremo está por encima del presidente y controla el ejército", "El Consejo de Guardianes filtra candidatos y leyes", "La velayat-e faqih (tutela del jurisconsulto) es la pieza maestra"] },
  { id: "const:iq", pais: "Irak", iso: "iq", region: "ASIA", nombre: "Constitución de 2005", año: 2005,
    tipo: "República federal parlamentaria", mandato: "Consejo de Representantes: 4 años",
    rasgos: ["Régimen de facto de reparto confesional (chiíes, sunitas, kurdos)", "El Curdistán iraquí es región autónoma con petrolera propia", "La revisión del texto prometida en 2005 nunca se cerró"] },
  { id: "const:sa", pais: "Arabia Saudita", iso: "sa", region: "ASIA", nombre: "Ley Básica de 1992", año: 1992,
    tipo: "Monarquía absoluta", mandato: "El rey gobierna y legisla",
    rasgos: ["El Corán y la sunna son la «constitución» del reino", "El Consejo de Consulta (Majlis al-Shura) opina pero no legisla", "La Ley Básica se reformó en 2017 para la sucesión del príncipe heredero"] },
  { id: "const:ae", pais: "Emiratos Árabes Unidos", iso: "ae", region: "ASIA", nombre: "Constitución de 1971", año: 1971,
    tipo: "Federación de 7 emiratos monárquicos", mandato: "Presidencia electa por el Consejo Supremo (5 años)",
    rasgos: ["Provisional hasta 1996, año en que se hizo permanente", "Cada emirato conserva su gobierno y su riqueza", "El gobernante de Abu Dabi preside casi siempre la federación"] },
  { id: "const:kw", pais: "Kuwait", iso: "kw", region: "ASIA", nombre: "Constitución de 1962", año: 1962,
    tipo: "Monarquía constitucional", mandato: "Asamblea Nacional: 4 años",
    rasgos: ["El parlamento más combativo del Golfo — disuelto repetidamente", "El emir nombra al gobierno; la asamblea interpela a los ministros", "Una de las constituciones más antiguas de la región"] },
  { id: "const:jo", pais: "Jordania", iso: "jo", region: "ASIA", nombre: "Constitución de 1952", año: 1952,
    tipo: "Monarquía constitucional", mandato: "Cámara de Representantes: 4 años",
    rasgos: ["El rey firma y destituye; el parlamento aprueba", "Las reformas de 2011 crearon la Corte Constitucional y la comisión electoral", "La fiducia del ejército («el ejército del rey») es convención constitucional"] },
  { id: "const:lb", pais: "Líbano", iso: "lb", region: "ASIA", nombre: "Constitución de 1926", año: 1926,
    tipo: "República parlamentaria confesional", mandato: "Presidencial: 6 años (maronita)",
    rasgos: ["La más antigua vigente del mundo árabe", "El Pacto Nacional (1943) reparte cargos por confesión: presidente maronita, PM sunita, portavoz chií", "El Acuerdo de Taif (1989) reequilibró el reparto"] },
  { id: "const:sy", pais: "Siria", iso: "sy", region: "ASIA", nombre: "Constitución de 2012 — en transición", año: 2012,
    tipo: "En transición tras la caída del gobierno de Assad", mandato: "Por definir",
    rasgos: ["La carta de 2012 consagró el partido Baath al frente del Estado", "Nota honesta: tras diciembre de 2024 el país se rige por una declaración constitucional provisional (2025) mientras se escribe la nueva", "La evolución de la transición se seguirá en el módulo"] },
  { id: "const:af", pais: "Afganistán", iso: "af", region: "ASIA", nombre: "Constitución de 2004 — suspendida de facto", año: 2004,
    tipo: "Emirato (tras el regreso talibán de 2021)", mandato: "Por decretos del Emirato",
    rasgos: ["La de 2004 fue la más liberal de la historia del país", "Nota honesta: suspendida desde agosto de 2021; el Emirato gobierna sin texto vigente", "Las mujeres bajo el régimen actual: el mayor retroceso del mundo"] },
  { id: "const:kz", pais: "Kazajistán", iso: "kz", region: "ASIA", nombre: "Constitución de 1995 (reforma 2022)", año: 1995,
    tipo: "República presidencialista", mandato: "Presidencial: 7 años, un solo mandato (desde 2022)",
    rasgos: ["La reforma de 2022 recortó los poderes del titular y limitó los futuros mandatos a uno", "Referéndum de junio de 2022: 77% de sí", "El Mar Caspio y el uranio: riqueza estratégica del texto económico"] },
  { id: "const:kg", pais: "Kirguistán", iso: "kg", region: "ASIA", nombre: "Constitución de 2021", año: 2021,
    tipo: "República presidencialista", mandato: "Presidencial: 5 años",
    rasgos: ["Tercera carta desde la independencia (1993, 2010, 2021)", "La de 2021 volvió a concentrar poderes en el presidente", "La única democracia parlamentaria de Asia Central (2010-2021) reformó su texto"] },

  // ─── ÁFRICA ─────────────────────────────────────────────────────
  { id: "const:za", pais: "Sudáfrica", iso: "za", region: "ÁFRICA", nombre: "Constitución de 1996", año: 1996,
    tipo: "República parlamentaria", mandato: "Presidencial: 5 años (por el Parlamento)",
    rasgos: ["Nacida del fin del apartheid, con Nelson Mandela vivo", "La Corte Constitucional de Johannesburgo es de las más respetadas del mundo", "Doce lenguas oficiales (desde 2023 incluye la lengua de señas)"] },
  { id: "const:ng", pais: "Nigeria", iso: "ng", region: "ÁFRICA", nombre: "Constitución de 1999", año: 1999,
    tipo: "República federal presidencialista", mandato: "Presidencial: 4 años",
    rasgos: ["Cuarta República tras décadas de golpes militares", "El «federal character» reparte cargos entre regiones y religiones", "La sharía penal rige en 12 estados del norte con un Estado federal laico"] },
  { id: "const:eg", pais: "Egipto", iso: "eg", region: "ÁFRICA", nombre: "Constitución de 2014 (enmendada 2019)", año: 2014,
    tipo: "República presidencialista", mandato: "Presidencial: 6 años (era 4)",
    rasgos: ["Escrita tras el derrocamiento de Morsi", "La enmienda de 2019 alargó el mandato presidencial y reforzó al ejército en la política", "El referéndum de 2019: 88,8% de sí con oposición silenciada"] },
  { id: "const:ma", pais: "Marruecos", iso: "ma", region: "ÁFRICA", nombre: "Constitución de 2011", año: 2011,
    tipo: "Monarquía constitucional con poderes reales reforzados", mandato: "Cámara: 5 años",
    rasgos: ["Nacida de las protestas del 20-F (Primavera Árabe)", "El primer ministro sale del partido ganador — pero el rey manda en lo sagrado y en la seguridad", "Referéndum del 1 de julio de 2011: 98,5% de sí"] },
  { id: "const:dz", pais: "Argelia", iso: "dz", region: "ÁFRICA", nombre: "Constitución de 1996 (revisada 2020)", año: 1996,
    tipo: "República semipresidencialista", mandato: "Presidencial: 5 años",
    rasgos: ["La revisión de 2020 restauró el límite de mandatos tras el hirak de 2019", "El ejército («los decisiones») como árbitro histórico", "El gas y el petróleo: capítulo económico estratégico"] },
  { id: "const:tn", pais: "Túnez", iso: "tn", region: "ÁFRICA", nombre: "Constitución de 2022", año: 2022,
    tipo: "República presidencialista", mandato: "Presidencial: 5 años",
    rasgos: ["Sustituyó a la de 2014, la más liberal del mundo árabe post-2011", "La nueva carta recentró el poder en el presidente Kais Saied", "Referéndum con el 30,5% de participación — el dato honesto"] },
  { id: "const:ke", pais: "Kenia", iso: "ke", region: "ÁFRICA", nombre: "Constitución de 2010", año: 2010,
    tipo: "República presidencialista descentralizada", mandato: "Presidencial: 5 años",
    rasgos: ["Escrita para cerrar la violencia electoral de 2007-08 (1.100+ muertos)", "Descentralización en 47 condados con sus gobernadores", "Referéndum de agosto de 2010: 66,9% de sí"] },
  { id: "const:et", pais: "Etiopía", iso: "et", region: "ÁFRICA", nombre: "Constitución de 1995", año: 1995,
    tipo: "República federal parlamentaria de base étnica", mandato: "Presidencia ceremonial (6 años) + primer ministro ejecutivo",
    rasgos: ["El federalismo étnico: estados de «naciones, nacionalidades y pueblos»", "El art. 39 reconoce el derecho de secesión de las naciones", "La guerra de Tigré (2020-22) puso a prueba el modelo"] },
  { id: "const:gh", pais: "Ghana", iso: "gh", region: "ÁFRICA", nombre: "Constitución de 1992", año: 1992,
    tipo: "República presidencialista", mandato: "Presidencial: 4 años",
    rasgos: ["Cuarta República: la alternancia estable empezó en 2000", "La transición de poder más sana del África Occidental", "Consejo de Estado como órgano consultivo"] },
  { id: "const:rw", pais: "Ruanda", iso: "rw", region: "ÁFRICA", nombre: "Constitución de 2003 (revisada 2015)", año: 2003,
    tipo: "República presidencialista", mandato: "Presidencial: 7 años",
    rasgos: ["Nacida tras el genocidio de 1994", "La revisión de 2015 habilitó al presidente Kagame hasta 2034", "El referéndum de 2015: 98% de sí"] },
  { id: "const:cd", pais: "RD del Congo", iso: "cd", region: "ÁFRICA", nombre: "Constitución de 2006", año: 2006,
    tipo: "República semipresidencialista", mandato: "Presidencial: 5 años",
    rasgos: ["Nacida de la transición tras las guerras congoleñas (1996-2003)", "26 provincias descentralizadas", "El cobalto del país sostiene las baterías del mundo — gobernanza frágil"] },

  // ─── OCEANÍA ────────────────────────────────────────────────────
  { id: "const:au", pais: "Australia", iso: "au", region: "OCEANÍA", nombre: "Constitución de 1900", año: 1900,
    tipo: "Monarquía parlamentaria federal", mandato: "Cámara de Representantes: 3 años",
    rasgos: ["Vigente desde el 1 de enero de 1901 (federación de colonias)", "Las reformas exigen referéndum: solo 8 de 45 han pasado", "El referéndum de 2023 (Voz Indígena) fue el 37º rechazo consecutivo"] },
  { id: "const:nz", pais: "Nueva Zelanda", iso: "nz", region: "OCEANÍA", nombre: "Constitución no codificada", año: 1840,
    tipo: "Monarquía parlamentaria", mandato: "Cámara: 3 años",
    rasgos: ["El Tratado de Waitangi (1840) es la piedra del pacto fundacional", "Sin una sola carta escrita: estatutos y convenciones", "Parlamento unicameral desde 1951"] },
  { id: "const:pg", pais: "Papúa Nueva Guinea", iso: "pg", region: "OCEANÍA", nombre: "Constitución de 1975", año: 1975,
    tipo: "República parlamentaria descentralizada", mandato: "Parlamento Nacional: 5 años",
    rasgos: ["Independencia de Australia en 1975 con texto propio", "«Gobernanza melanesia»: consenso, no adversarial", "Un parlamento con 89 circunscripciones abiertas"] },
];

// sanity de la casa: cada ficha con sus 3 rasgos y su año dentro del rango
// real de las cartas modernas (el dato no puede viajar sucio)
for (const c of CONSTITUCIONES) {
  if (c.rasgos.length < 3) throw new Error(`biblioteca-data: ${c.id} sin 3 rasgos`);
  if (c.año < 1215 || c.año > 2025) throw new Error(`biblioteca-data: ${c.id} año fuera de rango`);
}
export const CONSTITUCIONES_POR_REGION = REGIONES.map((r) => ({
  region: r,
  fichas: CONSTITUCIONES.filter((c) => c.region === r),
}));
export const TOTAL_CONSTITUCIONES = CONSTITUCIONES.length;

// ── ESTANTERÍA GEOPOLÍTICA — los tratados, doctrinas y conceptos ──
export type TipoGeo = "TRATADO" | "DOCTRINA" | "CONCEPTO";
export const TIPOS_GEO: TipoGeo[] = ["TRATADO", "DOCTRINA", "CONCEPTO"];

export interface PiezaGeo {
  id: string;          // "geo:westfalia"
  nombre: string;      // "Paz de Westfalia"
  año: number;
  tipo: TipoGeo;
  resumen: string;     // qué es, en dos frases
  porQueImporta: string; // la consecuencia geopolítica
  pista?: string;      // dato para el examen
}

export const GEOPOLITICA: PiezaGeo[] = [
  { id: "geo:westfalia", nombre: "Paz de Westfalia", año: 1648, tipo: "TRATADO",
    resumen: "El conjunto de acuerdos que cerró la Guerra de los Treinta Años en Europa (Münster y Osnabrück). Reconoció a los Estados como dueños de su territorio y de su fe.",
    porQueImporta: "Aquí nace el sistema internacional moderno: el Estado soberano como pieza del tablero. Todo lo demás se discute DESDE Westfalia.",
    pista: "1648 — el año cero de la soberanía" },
  { id: "geo:viena", nombre: "Congreso de Viena", año: 1815, tipo: "TRATADO",
    resumen: "Las potencias reordenaron Europa tras Napoleón con un pacto de equilibrio entre cinco grandes (Austria, Rusia, Prusia, Reino Unido, Francia).",
    porQueImporta: "El «equilibrio europeo» evitó una guerra general en el continente durante casi un siglo — hasta 1914.",
    pista: "1815 — un siglo de equilibrio" },
  { id: "geo:monroe", nombre: "Doctrina Monroe", año: 1823, tipo: "DOCTRINA",
    resumen: "El presidente Monroe declaró el hemisferio occidental fuera del alcance de nuevas colonias europeas: «América para los americanos».",
    porQueImporta: "El origen del «patio trasero»: EE. UU. se proclamó guardián de América — la lógica detrás de un siglo de intervenciones.",
    pista: "1823 — el patio trasero nace aquí" },
  { id: "geo:versalles", nombre: "Tratado de Versalles", año: 1919, tipo: "TRATADO",
    resumen: "El orden punitivo que cerró la Primera Guerra Mundial: Alemania cargó con la culpa (art. 231), reparaciones y recortes territoriales y militares.",
    porQueImporta: "La humillación alimentó el revanchismo que trajo la Segunda Guerra. Los historiadores lo llaman «la paz que falló».",
    pista: "1919 — el art. 231: la culpa de la guerra" },
  { id: "geo:atlantico", nombre: "Carta del Atlántico", año: 1941, tipo: "TRATADO",
    resumen: "Churchill y Roosevelt firmaron en plena guerra los principios del mundo de posguerra: autodeterminación, libre comercio, seguridad colectiva.",
    porQueImporta: "El borrador de la ONU: de esta carta salen la Carta de 1945 y la descolonización.",
    pista: "1941 — el borrador del mundo nuevo" },
  { id: "geo:onu", nombre: "Carta de las Naciones Unidas", año: 1945, tipo: "TRATADO",
    resumen: "La constitución del mundo: soberanía de los Estados, prohibición general del uso de la fuerza y un Consejo de Seguridad con cinco vetos (EE. UU., URSS/Rusia, Reino Unido, Francia, China).",
    porQueImporta: "La arquitectura que aún sostiene (y bloquea) la paz: el veto congela la geopolítica desde 1945.",
    pista: "1945 — cinco vetos para el mundo" },
  { id: "geo:ddhh", nombre: "Declaración Universal de Derechos Humanos", año: 1948, tipo: "TRATADO",
    resumen: "30 artículos que definen el estándar moral global: vida, igualdad, expresión, trabajo, asilo. No es vinculante por sí misma — pero irradió toda la legislación posterior.",
    porQueImporta: "El idioma común de la crítica: cualquier régimen se mide hoy contra esta declaración.",
    pista: "1948 — 30 artículos, un estándar" },
  { id: "geo:ginebra", nombre: "Convenios de Ginebra", año: 1949, tipo: "TRATADO",
    resumen: "Cuatro convenios que protegen a heridos, náufragos, prisioneros y civiles en la guerra. Casi todos los países del mundo los han ratificado.",
    porQueImporta: "El derecho humanitario: la línea que separa la guerra del crimen — y que sigue violándose frente a la cámara.",
    pista: "1949 — la línea roja de la guerra" },
  { id: "geo:oea", nombre: "Carta de la OEA", año: 1948, tipo: "TRATADO",
    resumen: "La Organización de Estados Americanos: 35 países del hemisferio con la no intervención como norma fundacional.",
    porQueImporta: "El orden interamericano: donde se pelea (y se bloquea) cada crisis de América desde 1948.",
    pista: "1948 — la casa de las Américas" },
  { id: "geo:espacio", nombre: "Tratado del Espacio Ultraterrestre", año: 1967, tipo: "TRATADO",
    resumen: "El espacio no es de nadie: sin armas nucleares en órbita, sin apropiación nacional de la Luna, exploración «en beneficio de todos».",
    porQueImporta: "La única frontera que la humanidad acordó dejar fuera del reparto — hoy puesta a prueba por las constelaciones privadas.",
    pista: "1967 — el espacio para todos" },
  { id: "geo:tnp", nombre: "Tratado de No Proliferación Nuclear (TNP)", año: 1968, tipo: "TRATADO",
    resumen: "Reparte el mundo en dos: las cinco potencias nucleares «legales» (EE. UU., URSS, Reino Unido, Francia, China) y el resto, obligado a no fabricar bombas a cambio de energía pacífica y desarme prometido.",
    porQueImporta: "El pilar del régimen nuclear: India, Pakistán, Israel y Corea del Norte nunca firmaron o se salieron — y ahí sigue la grieta.",
    pista: "1968 — cinco bombas legales, el resto fuera" },
  { id: "geo:helsinki", nombre: "Acta Final de Helsinki", año: 1975, tipo: "TRATADO",
    resumen: "35 países (EE. UU., Canadá y Europa, incluida la URSS) aceptaron fronteras inviolables — pero también un «cesto» de derechos humanos con vigilancia mutua.",
    porQueImporta: "La disidencia soviética nació vigilando que Moscú cumpliera lo firmado: el papel ganó a la geopolítica.",
    pista: "1975 — el papel que carcomió el bloque" },
  { id: "geo:campdavid", nombre: "Acuerdos de Camp David", año: 1978, tipo: "TRATADO",
    resumen: "Carter, Sadat y Begin cerraron la primera paz entre Israel y un país árabe (Egipto): el Sinaí de vuelta a cambio de reconocimiento.",
    porQueImporta: "El molde de toda paz árabe-israelí posterior — y el precio pagado por Sadat con su vida.",
    pista: "1978 — la primera paz árabe-israelí" },
  { id: "geo:oslo", nombre: "Acuerdos de Oslo", año: 1993, tipo: "TRATADO",
    resumen: "Israel y la OLP se reconocieron y trazaron la solución de dos estados en cinco años de transición, firmada en la Casa Blanca.",
    porQueImporta: "El archivo vivo del incumplimiento: los asentamientos crecieron, la transición nunca cerró, y la fórmula Oslo sigue siendo la referencia vacía.",
    pista: "1993 — el apretón de manos que no cerró" },
  { id: "geo:montego", nombre: "Convención de Montego Bay (Derecho del Mar)", año: 1982, tipo: "TRATADO",
    resumen: "La constitución de los océanos: 12 millas de mar territorial, 200 de Zona Económica Exclusiva, libre tránsito por los estrechos y un tribunal propio.",
    porQueImporta: "Cada pulso del Mar de China, cada atolón artificial y cada ruta pesquera se litiga desde este texto.",
    pista: "1982 — 200 millas de poder" },
  { id: "geo:maastricht", nombre: "Tratado de Maastricht", año: 1992, tipo: "TRATADO",
    resumen: "La Unión Europea moderna: ciudadanía europea, los tres pilares y la hoja de ruta del euro con sus criterios de déficit.",
    porQueImporta: "El salto de mercado común a proyecto político — el referéndum danés del «no» (1992) marcó el límite democrático del proyecto.",
    pista: "1992 — nace el euro en el papel" },
  { id: "geo:lisboa", nombre: "Tratado de Lisboa", año: 2007, tipo: "TRATADO",
    resumen: "La UE tras los «no» de Francia y Países Bajos: presidencia estable, alta representante de exteriores y el artículo 50 — la puerta de salida ordenada.",
    porQueImporta: "El art. 50 acabó siendo la ley más usada de la casa: el Brexit lo activó en 2017.",
    pista: "2007 — el art. 50, la puerta de salida" },
  { id: "geo:roma", nombre: "Estatuto de Roma (Corte Penal Internacional)", año: 1998, tipo: "TRATADO",
    resumen: "Crea la Corte Penal Internacional permanente: genocidio, crímenes de guerra y de lesa humanidad ya no tienen asilo si el Estado no juzga.",
    porQueImporta: "El intento más serio de poner al poder bajo la ley — con EE. UU., Rusia y China fuera del Estatuto como grieta fundacional.",
    pista: "1998 — una corte para los poderosos" },
  { id: "geo:paris", nombre: "Acuerdo de París (clima)", año: 2015, tipo: "TRATADO",
    resumen: "196 países acuerdan mantener el calentamiento «bien por debajo de 2°C» con compromisos nacionales (NDC) voluntarios y revisados cada cinco años.",
    porQueImporta: "La primera geopolítica global que no se juega por territorio sino por emisiones — y la honestidad de sus compromisos es el debate.",
    pista: "2015 — 1,5°C como línea de vida" },
  { id: "geo:contencion", nombre: "Doctrina de la Contención (Kennan)", año: 1947, tipo: "DOCTRINA",
    resumen: "El telegrama largo y el artículo «X»: contener la expansión soviética con presión sostenida hasta que el sistema madurara o se ablandara.",
    porQueImporta: "La lógica de la OTAN, del Plan Marshall y de cada proxy de la Guerra Fría — 40 años de estrategia en una idea.",
    pista: "1947 — contener hasta que caiga" },
  { id: "geo:truman", nombre: "Doctrina Truman", año: 1947, tipo: "DOCTRINA",
    resumen: "EE. UU. se compromete a apoyar a los «pueblos libres» resistiendo a minorías armadas o presiones externas — Grecia y Turquía, los primeros casos.",
    porQueImporta: "El punto de partida formal de la Guerra Fría: la seguridad del mundo se convirtió en asunto americano.",
    pista: "1947 — la Guerra Fría se hace oficial" },
  { id: "geo:brezhnev", nombre: "Doctrina Brezhnev", año: 1968, tipo: "DOCTRINA",
    resumen: "La «soberanía limitada»: Moscú puede intervenir en cualquier país socialista donde el sistema «peligre». Tanques de Varsovia en Praga como demostración.",
    porQueImporta: "El límite moral del bloque: cuando la URSS se lo aplicó a sí misma (Afganistán 1979), empezó a morir.",
    pista: "1968 — Praga, la soberanía con correa" },
  { id: "geo:soberania", nombre: "Soberanía", año: 1648, tipo: "CONCEPTO",
    resumen: "El derecho de un Estado a mandar en su territorio sin superior: la pieza maestra que Westfalia convirtió en regla del mundo.",
    porQueImporta: "Todos los debates internacionales (intervenir o no, sancionar o no) son peleas alrededor de esta palabra.",
    pista: "la palabra que manda el tablero" },
  { id: "geo:equilibrio", nombre: "Equilibrio de poder", año: 1815, tipo: "CONCEPTO",
    resumen: "Nadie debe acumular tanto poder como para mandar a todos: la seguridad nace del contrapeso, no de la confianza.",
    porQueImporta: "De Viena a la OTAN: las alianzas existen para que el segundo más fuerte nunca se quede solo.",
    pista: "el contrapeso como política" },
  { id: "geo:disuasion", nombre: "Disuasión nuclear (MAD)", año: 1950, tipo: "CONCEPTO",
    resumen: "La paz por el miedo: si tú me destruyes, yo te destruyo — la destrucción mutua asegurada hace que ningún gobernante racional dispare.",
    porQueImporta: "El mundo sobrevivió a la Guerra Fría con esta lógica — y hoy los arsenales se modernizan sin un marco de control.",
    pista: "la paz que tiembla" },
  { id: "geo:heartland", nombre: "Heartland (Mackinder)", año: 1904, tipo: "CONCEPTO",
    resumen: "«Quien domina el este de Europa domina el Heartland; quien domina el Heartland domina la isla-mundo; quien domina la isla-mundo domina el mundo».",
    porQueImporta: "La geografía como destino: Eurasia sigue siendo el premio mayor — Ucrania y el Indo-Pacífico lo demuestran.",
    pista: "1904 — el mapa como profecía" },
  { id: "geo:maritimo", nombre: "Poder marítimo (Mahan)", año: 1890, tipo: "CONCEPTO",
    resumen: "El control de los mares — rutas, estrechos, flotas, bases — decide el destino de los imperios. La influencia de Mahan llegó a todos los almirantes del siglo XX.",
    porQueImporta: "Ormuz, Malaca, Bab el-Mandeb, Taiwán: la economía mundial sigue colgada de chokes marítimos.",
    pista: "1890 — el mar como autopista del poder" },
  { id: "geo:softpower", nombre: "Soft power (Nye)", año: 1990, tipo: "CONCEPTO",
    resumen: "El poder de convencer sin apretar: cultura, valores, legitimidad. Hollywood, el idioma o la universidad también son política exterior.",
    porQueImporta: "El contrapeso del «hard power»: en la era de las redes, la narrativa es territorio.",
    pista: "1990 — convencer vale más que apretar" },
  { id: "geo:domino", nombre: "Efecto dominó", año: 1954, tipo: "CONCEPTO",
    resumen: "Si un país cae, cae la fila: la lógica que arrastró a EE. UU. a Indochina país por país (Eisenhower, 1954).",
    porQueImporta: "El fantasma de todo conflicto regional: ¿dónde termina la fila? — la pregunta que decide cada intervención.",
    pista: "si cae uno, cae la fila" },
  { id: "geo:geoeconomia", nombre: "Geoeconomía", año: 2010, tipo: "CONCEPTO",
    resumen: "Las armas son aranceles, sanciones, cadenas de suministro y chips: la economía como campo de batalla principal entre grandes potencias.",
    porQueImporta: "La guerra de los semiconductores y las sanciones a Rusia: el tablero ya no es solo militar.",
    pista: "los aranceles como obuses" },
];

// sanity de la estantería geopolítica
for (const g of GEOPOLITICA) {
  if (!g.resumen || !g.porQueImporta) throw new Error(`biblioteca-data: ${g.id} sin resumen`);
  if (g.año < 1648 || g.año > 2025) throw new Error(`biblioteca-data: ${g.id} año fuera de rango`);
}
export const TOTAL_GEOPOLITICA = GEOPOLITICA.length;

// ── EL RELÓ DE LA ESCUELA: día con firma es-ES (el mismo de la casa v363) ──
export function diaDeHoy(offsetDias = 0): string {
  try {
    const d = new Date(Date.now() + offsetDias * 86400000);
    return d.toLocaleDateString("es-ES", { year: "numeric", month: "2-digit", day: "2-digit" });
  } catch { return ""; }
}

// ── LA CÁTEDRA: misiones diarias con el reloj de la escuela (ley v324) ──
export interface MisionCatedra {
  codigo: string;    // "LECTOR" | "EXAMEN" | "INVESTIGADOR"
  titulo: string;
  desc: string;
  meta: number;      // meta del día (deriva del reloj, no de un dado)
  xp: number;
  coins: number;
}

export function misionesDeHoy(dia: number): MisionCatedra[] {
  const n = 2 + (dia % 3);      // 2..4 fichas para leer hoy
  const m = 2 + (dia % 2);      // 2..3 aciertos de examen hoy
  const s = 1 + (dia % 3);      // 1..3 búsquedas hoy
  return [
    { codigo: "LECTOR", titulo: `LEE ${n} FICHAS DEL MUNDO`, desc: "Abre fichas de CONSTITUCIONES, GEOPOLÍTICA o ARSENAL — cada ficha nueva cuenta para tu expediente.", meta: n, xp: 30, coins: 40 },
    { codigo: "EXAMEN", titulo: `APUNTA AL EXAMEN: ${m} ACIERTOS`, desc: "Sienta el examen del día en la cátedra y acierta al menos " + m + " preguntas.", meta: m, xp: 40, coins: 30 },
    { codigo: "INVESTIGADOR", titulo: `INVESTIGA ${s} VECES EN EL ÍNDICE`, desc: "Busca países, cartas, tratados o armas en el índice de la biblioteca (Enter cuenta).", meta: s, xp: 20, coins: 20 },
  ];
}

// ── EL SALUDO DE LA CÁTEDRA — le habla según su nivel y su regularidad ──
export function saludoCatedra(alias: string, nivel: number, racha: number, fichasLeidas: number): string {
  const nombre = alias && alias !== "ANÓNIMO" ? `@${alias}` : "agente";
  const bracketNivel =
    nivel <= 3 ? "Aprendiz del archivo" :
    nivel <= 9 ? "Analista junior" :
    nivel <= 19 ? "Analista del mundo" :
    nivel <= 29 ? "Jefe de expedientes" : "Catedrático del tablero";
  const bracketRacha =
    racha === 0 ? "el libro te esperaba — firma tu día leyendo, buscando o examinando" :
    racha <= 2 ? `${racha} ${racha === 1 ? "día" : "días"} de estudio: la constancia empieza igual` :
    racha <= 6 ? `${racha} días seguidos: la cátedra te reconoce` :
    `${racha} días seguidos: racha de erudito — el archivo tiene tu olor`;
  const extra = fichasLeidas >= 50 ? " Tu expediente ya es material de consulta." :
    fichasLeidas >= 20 ? " Vas llenando tu expediente con seriedad." :
    fichasLeidas >= 5 ? " Bien: cada ficha es un punto más." : "";
  return `${bracketNivel} ${nombre} — ${bracketRacha}.${extra}`;
}

// ── EL EXAMEN DEL DÍA — determinista con el reloj de la escuela ──
// preguntas 100% derivadas de las tres estanterías: cero datos inventados.
export interface PreguntaExamen {
  id: string;
  tipo: "CONSTITUCION" | "GEO" | "ARSENAL";
  enunciado: string;
  opciones: string[];
  correcta: number;
  pista: string;    // dónde estudiarla
}

// PRNG determinista (mulberry32) — el mismo examen para toda la escuela ese día
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function barajar<T>(arr: T[], rnd: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function examenDelDia(dia: number): PreguntaExamen[] {
  const rnd = mulberry32((dia * 2654435761) >>> 0 || 7);
  const preguntas: PreguntaExamen[] = [];
  const paises = barajar(CONSTITUCIONES, rnd);
  const geos = barajar(GEOPOLITICA, rnd);
  const distractoresAnios = CONSTITUCIONES.map((c) => c.año);

  // [1] ¿de qué año es la carta de [país]?
  {
    const c = paises[0];
    const otras = distractoresAnios.filter((a) => a !== c.año && Math.abs(a - c.año) >= 10);
    const opciones = barajar([c.año, ...otras.slice(0, 3)], rnd);
    preguntas.push({
      id: "ex:const-anio",
      tipo: "CONSTITUCION",
      enunciado: `¿En qué año se sancionó la carta vigente de ${c.pais}?`,
      opciones: opciones.map(String),
      correcta: opciones.indexOf(c.año),
      pista: `CONSTITUCIONES › ${c.region} › ${c.pais}`,
    });
  }
  // [2] ¿qué carta rige [país]?
  {
    const c = paises[1];
    const otras = CONSTITUCIONES.filter((x) => x.id !== c.id).map((x) => x.nombre);
    const opciones = barajar([c.nombre, ...barajar(otras, rnd).slice(0, 3)], rnd);
    preguntas.push({
      id: "ex:const-nombre",
      tipo: "CONSTITUCION",
      enunciado: `¿Qué carta constitucional rige hoy en ${c.pais}?`,
      opciones,
      correcta: opciones.indexOf(c.nombre),
      pista: `CONSTITUCIONES › ${c.region} › ${c.pais}`,
    });
  }
  // [3] ¿qué tipo de gobierno tiene [país]?
  {
    const c = paises[2];
    const otras = CONSTITUCIONES.filter((x) => x.id !== c.id && x.tipo !== c.tipo).map((x) => x.tipo);
    const opciones = barajar([c.tipo, ...barajar([...new Set(otras)], rnd).slice(0, 3)], rnd);
    preguntas.push({
      id: "ex:const-tipo",
      tipo: "CONSTITUCION",
      enunciado: `¿Qué forma de gobierno declara el texto vigente de ${c.pais}?`,
      opciones,
      correcta: opciones.indexOf(c.tipo),
      pista: `CONSTITUCIONES › ${c.region} › ${c.pais}`,
    });
  }
  // [4] ¿de qué año es [pieza geopolítica]?
  {
    const g = geos[0];
    const otras = GEOPOLITICA.filter((x) => x.id !== g.id).map((x) => x.año);
    const opciones = barajar([g.año, ...barajar([...new Set(otras)], rnd).slice(0, 3)], rnd);
    preguntas.push({
      id: "ex:geo-anio",
      tipo: "GEO",
      enunciado: `¿De qué año es ${g.nombre}?`,
      opciones: opciones.map(String),
      correcta: opciones.indexOf(g.año),
      pista: `GEOPOLÍTICA › ${g.tipo} › ${g.nombre}`,
    });
  }
  // [5] ¿qué documento/casó corresponde a este dato?
  {
    const g = geos[1];
    const otras = GEOPOLITICA.filter((x) => x.id !== g.id).map((x) => x.nombre);
    const opciones = barajar([g.nombre, ...barajar(otras, rnd).slice(0, 3)], rnd);
    preguntas.push({
      id: "ex:geo-nombre",
      tipo: "GEO",
      enunciado: `¿Qué pieza de la estantería geopolítica lleva esta pista: «${g.pista ?? g.porQueImporta.slice(0, 48)}»?`,
      opciones,
      correcta: opciones.indexOf(g.nombre),
      pista: `GEOPOLÍTICA › ${g.tipo}`,
    });
  }
  // [6] ¿a qué familia pertenece esta pieza del ARSENAL? (v365)
  {
    const a = barajar(ARSENAL, rnd)[0];
    const otras = ARSENAL.filter((x) => x.id !== a.id && x.familia !== a.familia).map((x) => x.familia);
    const opciones = barajar([a.familia, ...barajar([...new Set(otras)], rnd).slice(0, 3)], rnd);
    preguntas.push({
      id: "ex:ars-familia",
      tipo: "ARSENAL",
      enunciado: `¿A qué familia del arsenal pertenece ${a.nombre}?`,
      opciones,
      correcta: opciones.indexOf(a.familia),
      pista: `ARSENAL › ${a.familia} › ${a.nombre}`,
    });
  }
  return preguntas;
}

// ── LA CÁTEDRA POR PUNTOS: niveles del lector (regla publicada) ──
export function nivelLector(fichasLeidas: number): { titulo: string; umbral: number } {
  if (fichasLeidas >= 60) return { titulo: "CATEDRÁTICO", umbral: 60 };
  if (fichasLeidas >= 35) return { titulo: "ERUDITO", umbral: 35 };
  if (fichasLeidas >= 20) return { titulo: "ESTUDIOSO", umbral: 20 };
  if (fichasLeidas >= 8) return { titulo: "LECTOR SERIO", umbral: 8 };
  if (fichasLeidas >= 1) return { titulo: "APRENDIZ DE LECTOR", umbral: 1 };
  return { titulo: "LIBRO VIRGEN", umbral: 0 };
}

// ── EL ESTADO DEL ESTUDIO — persistencia vg364-biblioteca ──
interface MisionesDia { dia: string; progreso: Record<string, number>; reclamadas: string[] }
interface EstudioDia { ultimoDia: string; racha: number; diasTotales: number; busquedasHoy: number }

interface EstudioBibliotecaState {
  leidas: Record<string, number>;               // id de ficha → ts de primera lectura
  examen: { aciertos: number; errores: number; puntadas: Record<string, true> };
  estudio: EstudioDia;
  misiones: MisionesDia;
  // acciones — el día se firma con un gesto real (cero efectos: la racha
  // cuenta días de estudio, no días de mirar)
  leer: (id: string) => boolean;                 // true si era la primera vez
  firmarBusqueda: () => void;                    // +1 búsqueda hoy (Enter en el índice)
  acierto: (preguntaId: string) => boolean;      // true si puntúa (primera por pregunta)
  fallo: (preguntaId: string) => void;
  reclamar: (codigo: string) => MisionCatedra | null; // devuelve el botín si procede
  reiniciar: () => void;
}

export const useEstudioBiblioteca = create<EstudioBibliotecaState>()(
  persist(
    (set, get) => {
      // la firma del día: racha + misiones se rollan en el primer gesto
      const firmar = (cambio: Partial<EstudioDia> = {}) => {
        const hoy = diaDeHoy();
        const ayer = diaDeHoy(-1);
        const e = get().estudio;
        const est: EstudioDia = { ...e, ...cambio };
        if (e.ultimoDia !== hoy) {
          est.ultimoDia = hoy;
          est.racha = e.ultimoDia === ayer ? e.racha + 1 : 1;
          est.diasTotales = e.diasTotales + 1;
          est.busquedasHoy = cambio.busquedasHoy ?? 0;
        }
        const m = get().misiones;
        const misiones: MisionesDia = m.dia === hoy ? m : { dia: hoy, progreso: {}, reclamadas: [] };
        return { estudio: est, misiones };
      };
      return {
        leidas: {},
        examen: { aciertos: 0, errores: 0, puntadas: {} },
        estudio: { ultimoDia: "", racha: 0, diasTotales: 0, busquedasHoy: 0 },
        misiones: { dia: "", progreso: {}, reclamadas: [] },

        leer: (id) => {
          try {
            const k = (id || "").slice(0, 40);
            if (!k) return false;
            let primera = false;
            set((st) => {
              const firmado = firmar();
              if (st.leidas[k]) return { ...firmado }; // el sello conserva la primera fecha
              primera = true;
              const leidas = { ...st.leidas, [k]: Date.now() };
              const prog = firmado.misiones.dia === diaDeHoy() ? firmado.misiones : { dia: diaDeHoy(), progreso: {}, reclamadas: [] };
              return {
                ...firmado,
                leidas,
                misiones: { ...prog, progreso: { ...prog.progreso, LECTOR: (prog.progreso["LECTOR"] ?? 0) + 1 } },
              };
            });
            return primera;
          } catch { return false; }
        },

        firmarBusqueda: () => {
          try {
            set((st) => {
              const firmado = firmar();
              const hoy = diaDeHoy();
              const prog = firmado.misiones.dia === hoy ? firmado.misiones : { dia: hoy, progreso: {}, reclamadas: [] };
              return {
                ...firmado,
                estudio: { ...firmado.estudio, busquedasHoy: (firmado.estudio.busquedasHoy ?? 0) + 1 },
                misiones: { ...prog, progreso: { ...prog.progreso, INVESTIGADOR: (prog.progreso["INVESTIGADOR"] ?? 0) + 1 } },
              };
            });
          } catch { /* la búsqueda jamás tumba la biblioteca */ }
        },

        acierto: (preguntaId) => {
          try {
            let puntua = false;
            set((st) => {
              const firmado = firmar();
              if (st.examen.puntadas[preguntaId]) return { ...firmado };
              puntua = true;
              const hoy = diaDeHoy();
              const prog = firmado.misiones.dia === hoy ? firmado.misiones : { dia: hoy, progreso: {}, reclamadas: [] };
              return {
                ...firmado,
                examen: { aciertos: st.examen.aciertos + 1, errores: st.examen.errores, puntadas: { ...st.examen.puntadas, [preguntaId]: true } },
                misiones: { ...prog, progreso: { ...prog.progreso, EXAMEN: (prog.progreso["EXAMEN"] ?? 0) + 1 } },
              };
            });
            return puntua;
          } catch { return false; }
        },

        fallo: (preguntaId) => {
          try {
            set((st) => {
              const firmado = firmar();
              return { ...firmado, examen: { ...st.examen, errores: st.examen.errores + 1 } };
            });
          } catch { /* el fallo también enseña */ }
        },

        reclamar: (codigo) => {
          try {
            const hoy = diaDeHoy();
            const m = get().misiones;
            const dia = m.dia === hoy ? m : { dia: hoy, progreso: {}, reclamadas: [] };
            const mision = misionesDeHoy(diaDelAnillo()).find((x) => x.codigo === codigo);
            if (!mision) return null;
            if (dia.reclamadas.includes(codigo)) return null;
            if ((dia.progreso[codigo] ?? 0) < mision.meta) return null;
            set((st) => {
              const firmado = firmar();
              return {
                ...firmado,
                misiones: { ...firmado.misiones, reclamadas: [...firmado.misiones.reclamadas, codigo] },
              };
            });
            return mision;
          } catch { return null; }
        },

        reiniciar: () => set({
          leidas: {},
          examen: { aciertos: 0, errores: 0, puntadas: {} },
          estudio: { ultimoDia: "", racha: 0, diasTotales: 0, busquedasHoy: 0 },
          misiones: { dia: "", progreso: {}, reclamadas: [] },
        }),
      };
    },
    {
      name: "vg364-biblioteca",
      storage: createJSONStorage(() => storageBlindado),
    },
  ),
);

// el sello legible de lectura (mismo formato que la casa usa desde v176)
export function selloLectura(ts: number): string {
  try {
    return new Date(ts).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
  } catch { return ""; }
}
