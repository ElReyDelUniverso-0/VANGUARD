// v90.0 ESPEJOS SIN FIN — MOTOR WIKIGUERRA (espejo del formato enciclopedia
// colaborativa: artículo con caja de información, índice, secciones, referencias
// y metadatos de edición). Todos los artículos, personajes y cifras son ficción
// propia del mundo Vanguard.

import { fnv89 } from "./pulsos-data";

export interface Bando {
  lado: string;
  color: string;
  miembros: string[];
  comandantes: string[];
  fuerzas: string;
  bajas: string;
}

export interface WikiSeccion {
  titulo: string;
  parrafos: string[];
}

export interface ArticuloWiki {
  id: string;
  titulo: string;
  extracto: string;
  categorias: string[];
  infobox: { etiqueta: string; valor: string }[];
  bandos: Bando[];
  secciones: WikiSeccion[];
  referencias: string[];
  editores: number;
  ediciones: number;
  protegido: boolean;
  vigilado: boolean;
  estado: string;
  fechaInicio: string;
  lugar: string;
}

function r(seed: string, salt: number): number {
  const h = parseInt(fnv89(seed + ":" + salt).slice(0, 7), 36);
  return (h % 100000) / 100000;
}

function pick<T>(seed: string, salt: number, arr: T[]): T {
  return arr[Math.floor(r(seed, salt) * arr.length)];
}

interface SemillaArticulo {
  id: string;
  titulo: string;
  categorias: string[];
  fechaInicio: string;
  lugar: string;
  bandos: Bando[];
  estadoFijo: string;
  extractos: string[];
}

const ARTICULOS: SemillaArticulo[] = [
  {
    id: "karsk", titulo: "Guerra del Valle del Karsk", categorias: ["Conflictos en curso", "Europa Oriental", "Guerras del siglo XXI"],
    fechaInicio: "24 de febrero de 2022", lugar: "Valle del Karsk, República del Donalto",
    estadoFijo: "En curso — frente activo que se mueve kilómetro a kilómetro",
    extractos: [
      "La Guerra del Valle del Karsk es el conflicto armado más grande de Europa desde 1945: comenzó con la invasión a gran escala de la República del Donalto por la Federación Nórdica y se convirtió en la guerra de artillería y drones que define la doctrina de toda una generación de ejércitos.",
      "El Valle del Karsk entró en guerra en 2022 cuando la Federación Nórdica lanzó su operación de tres ejes sobre la República del Donalto; lo que sus planificadores esperaban que durara semanas lleva años consumiendo municiones, drones y ciudades enteras.",
    ],
    bandos: [
      {
        lado: "República del Donalto y aliados", color: "#3DDCFF",
        miembros: ["República del Donalto", "Legiones voluntarias internacionales", "Industria de drones comunitaria"],
        comandantes: ["Mariscal A. Verenich", "Coronel O. Dyba — Frente Oriental", "General K. Sova — Defensa Aérea"],
        fuerzas: "≈ 780.000 activos (rotación mensual)",
        bajas: "No verificadas — registro de PÉRDIDAS: 3.214 piezas documentadas del lado azul",
      },
      {
        lado: "Federación Nórdica", color: "#FF6B4D",
        miembros: ["Ejército Nórdico", "Cuerpos de milicia de las repúblicas tampón", "Flota del Báltico"],
        comandantes: ["Generalísimo V. Kalénov", "Coronel General P. Ashin — Eje Sur", "Almirante L. Morev — Flota"],
        fuerzas: "≈ 1.100.000 activos (incl. movilizados)",
        bajas: "No verificadas — registro de PÉRDIDAS: 5.871 piezas documentadas del lado rojo",
      },
    ],
  },
  {
    id: "marrojo", titulo: "Crisis del Mar Rojo", categorias: ["Conflictos en curso", "Medio Oriente", "Comercio marítimo"],
    fechaInicio: "19 de octubre de 2023", lugar: "Bab el-Mandeb, Mar Rojo y golfo de Adén",
    estadoFijo: "En curso — convoyes escoltados, tránsito al 55% de prepandemia",
    extractos: [
      "La Crisis del Mar Rojo comenzó cuando los buques enjambre del Sultanato de Ormuz y sus proxies costeros empezaron a atacar el tráfico comercial en el estrecho de Bab el-Mandeb: la respuesta fue la mayor operación naval multinacional desde la lucha contra la piratería somalí.",
      "Cada semana, el estrecho más estrecho del mundo Vanguard decide si el comercio entre Asia y Europa pasa por el Cabo de Buena Esperanza (12 días más) o se atreve por el canal de los misiles.",
    ],
    bandos: [
      {
        lado: "Coalición de escolta", color: "#4DA6FF",
        miembros: ["Unión Atlántica", "República del Bósforo", "Task Force Índico", "Operación Guardián del Mar"],
        comandantes: ["Vicealmirante R. Calder — Task Force", "Capitán E. Maro — Escolta 44"],
        fuerzas: "≈ 23 buques de guerra en estación",
        bajas: "2 buques dañados, 1 helicóptero perdido — documentados",
      },
      {
        lado: "Eje costero", color: "#B48CFF",
        miembros: ["Guardias de Bandar Sable", "Milicias Hodel", "Brigadas del Litoral"],
        comandantes: ["Almirante M. Sarad", "Emir del Litoral H. Qassim"],
        fuerzas: "≈ 300 lanchas rápidas, enjambres de drones navales",
        bajas: "≈ 140 lanchas y plataformas documentadas destruidas",
      },
    ],
  },
  {
    id: "cachemira", titulo: "Conflicto de Cachemira", categorias: ["Conflictos en curso", "Asia Meridional", "Disputas territoriales"],
    fechaInicio: "22 de octubre de 1947", lugar: "Línea de Control, valle de Cachemira",
    estadoFijo: "En curso — el conflicto activo más antiguo del tablero",
    extractos: [
      "El Conflicto de Cachemira enfrenta a la Unión del Subcontinente con el Estado del Indus desde 1947: tres guerras declaradas, cientos de duelos de artillería en la Línea de Control y dos potencias nucleares mirándose a través de un glaciar.",
      "El glaciar de Siachen, el campo de batalla más alto del mundo, es la metáfora del conflicto entero: una guerra de altitud, heladas y presupuestos que ninguno de los dos bandos puede ganar ni abandonar.",
    ],
    bandos: [
      {
        lado: "Unión del Subcontinente", color: "#9AE04D",
        miembros: ["Ejército de Yamunagar", "Guardia de la LoC"],
        comandantes: ["General D. Mehra — Comando Norte"],
        fuerzas: "≈ 450.000 activos en el comando norte",
        bajas: "Cease-fire violations: 2.100+ incidentes documentados este año",
      },
      {
        lado: "Estado del Indus", color: "#4DFFC4",
        miembros: ["Ejército de Raviabad", "Servicios intermedios"],
        comandantes: ["General S. Anwar — X Cuerpo"],
        fuerzas: "≈ 380.000 activos desplegados",
        bajas: "Cease-fire violations: 1.850+ incidentes documentados este año",
      },
    ],
  },
  {
    id: "taiwan", titulo: "Crisis del Estrecho de Taiping", categorias: ["Conflictos en curso", "Indo-Pacífico", "Grandes potencias"],
    fechaInicio: "escalada activa desde 2022", lugar: "Estrecho de Taiping y línea media",
    estadoFijo: "Sin guerra declarada — mayor riesgo de escalada del Indo-Pacífico",
    extractos: [
      "La Crisis del Estrecho de Taiping es el escenario de escalada más estudiado del planeta Vanguard: cada maniobra del Imperio Central en la isla devuelve una delegación de la Unión Atlántica, y cada cruce de la línea media sube el termómetro del Indo-Pacífico.",
      "No hay disparos — todavía. Hay bloqueos de ejercicio anuales que duran más cada año, invasiones de espacio aéreo que se normalizan, y un contingente de analistas que apuesta en BetNación por la fecha del primer incidente grave.",
    ],
    bandos: [
      {
        lado: "Imperio Central", color: "#FFD23D",
        miembros: ["Ejército Popular de Liberación", "Guardia Costera de Ciudad Espejo", "Milicia marítima gris"],
        comandantes: ["General H. Luan — Teatro Este"],
        fuerzas: "≈ 2.000.000 activos (total), 2 portaaviones operativos",
        bajas: "Sin bajas — incidentes sin disparos documentados: 39 este año",
      },
      {
        lado: "Isla de Taiping y aliados", color: "#4DA6FF",
        miembros: ["Fuerzas de defensa de Taiping", "Unión Atlántica (disuasión extendida)", "Coalición del Pacífico"],
        comandantes: ["Almirante J. Stone — Séptima Flota"],
        fuerzas: "1 portaaviones en rotación permanente + defensa antimisiles",
        bajas: "Sin bajas — tránsitos documentados: 214 este año",
      },
    ],
  },
  {
    id: "sahel", titulo: "Insurgencia del Sahel", categorias: ["Conflictos en curso", "África", "Insurgencias"],
    fechaInicio: "2012 (escalada regional)", lugar: "Corredor del Sahel, del Atlántico al lago Chad",
    estadoFijo: "En curso — el frente más letal para civiles del tablero",
    extractos: [
      "La Insurgencia del Sahel es menos una guerra que una constelación: grupos afiliados al Corredor, juntas militares de turno, mercenarios de sombra y una población rural atrapada entre todos los uniformes.",
      "Cada evaluación de campaña de Vanguard marca el Sahel con la misma advertencia: el frente que no aparece en los mercados pero concentra la mitad de las víctimas civiles documentadas del mundo.",
    ],
    bandos: [
      {
        lado: "Juntas y milicias aliadas", color: "#FF8A3D",
        miembros: ["Consejo de Salvación Nacional", "Grupos de autodefensa", "Cuerpo de sombra de Gradoval"],
        comandantes: ["Capitán I. Toure — Consejo"],
        fuerzas: "≈ 90.000 efectivos combinados",
        bajas: "Registro de víctimas civiles: 8.900+ este año (documentadas)",
      },
      {
        lado: "Corredor del Sahel", color: "#FF4D4D",
        miembros: ["Emirato del Corredor", "Células del lago Chad", "Brigadas del norte"],
        comandantes: ["Emir A. Walid"],
        fuerzas: "≈ 25.000 combatientes estimados",
        bajas: "≈ 3.400 neutralizados documentados este año",
      },
    ],
  },
];

const SEC_TEMPL: { titulo: string; generador: (seed: string) => string[] }[] = [
  {
    titulo: "Antecedentes",
    generador: (seed) => [
      pick(seed, 40, [
        "Las raíces del conflicto se remontan a la partición de los imperios tras la guerra fría ficticia del juego: fronteras trazadas a regla y compás que ningún gobierno posterior aceptó por completo.",
        "Los antecedentes inmediatos combinan una crisis de precios de la energía con una cadena de incidentes fronterizos que los servicios de inteligencia de ambos bandos consideraron ensayos generales.",
      ]),
      pick(seed, 41, [
        "Entre 2014 y 2021 el frente se ensayó en formato pequeño: guerras congeladas, repúblicas no reconocidas y una escalada que siempre se detuvo un escalón antes del abismo.",
        "Los acuerdos de alto el fuego previos fallaron por el mismo motivo que citan todos los informes: ningún bando controlaba del todo a sus propias fracciones.",
      ]),
    ],
  },
  {
    titulo: "Cronología del frente",
    generador: (seed) => [
      `El ${pick(seed, 42, ["invierno", "otoño", "primavera", "verano"])} del frente quedó marcado por ${pick(seed, 43, ["la primera batalla de artillería de largo alcance", "el primer uso masivo de drones de campaña", "el primer asalto urbano prolongado", "el primer bloqueo naval de la crisis"])}: los analistas fechan allí el cambio de doctrina.`,
      pick(seed, 44, [
        "La cronología registrada por Vanguard muestra tres patrones: ofensivas en seco que se agotan a los tres días, contraataques locales que recuperan terreno y lo pierden, y una guerra de logística donde el ferrocarril vale más que la brigada.",
        "El ritmo del frente es estacional: el barro lo congela, el invierno lo endurece y cada ventana climática abre dos semanas de tierras que cambian de mano.",
      ]),
    ],
  },
  {
    titulo: "Impacto humanitario",
    generador: (seed) => [
      `Las agencias del juego documentan ${fmt(r(seed, 45) * 8 + 1)} millones de desplazados internos y ${fmt(r(seed, 46) * 2 + 0.2)} millones de refugiados en países vecinos: la mitad de la población civil del área de conflicto necesita asistencia según la oficina humanitaria ficticia de Vanguard.`,
      pick(seed, 47, [
        "Los corredores humanitarios abren y cierran al ritmo de los alto el fuego tregua a tregua; el costo de cada cierre se mide en convoyes que no llegan y hospitales que funcionan a medias.",
        "El registro de PÉRDIDAS documenta el costo material; este sección documenta el que no se repara con presupuesto: escuelas cerradas, cosechas quemadas y generaciones educadas en refugios.",
      ]),
    ],
  },
  {
    titulo: "Reacciones internacionales",
    generador: (seed) => [
      pick(seed, 48, [
        "La reacción internacional se organizó en tres bloques: coalición de sanciones, bloque de neutralidad armada y un eje de apoyos silenciosos que entrega componentes sin bandera.",
        "Cada paquete de sanciones generó su contramedida logística: flotas fantasma, terceros países intermediarios y un mercado gris que los analistas rastrean por transpondedores apagados.",
      ]),
      pick(seed, 49, [
        "En la sala de crisis de Vanguard la diplomacia corre en paralelo: mediaciones rotativas, intercambios de prisioneros como únicos gestos estables y cumbres que se anuncian y se cancelan con la misma nota de prensa.",
        "El Consejo de Seguridad ficticio del juego vota a ritmo mensual; el veto permanente garantiza que la guerra diplomática termine en empate técnico mientras el frente real se mueve.",
      ]),
    ],
  },
];

function fmt(n: number): string {
  if (n >= 1) return n.toFixed(1).replace(".", ",");
  return n.toFixed(2).replace(".", ",");
}

export function generarArticulo(id: string, dia = Math.floor(Date.now() / 86400_000)): ArticuloWiki {
  const s = ARTICULOS.find((a) => a.id === id) ?? ARTICULOS[0];
  const seed = "wiki90:" + s.id + ":" + dia;
  const editores = 120 + Math.floor(r(seed, 1) * 890);
  const ediciones = 1400 + Math.floor(r(seed, 2) * 12000);
  const mins = 3 + Math.floor(r(seed, 3) * 240);

  const secciones: WikiSeccion[] = SEC_TEMPL.map((t) => ({
    titulo: t.titulo,
    parrafos: t.generador(seed),
  }));

  const refs = [
    `Evaluación de Campaña de Vanguard, día ${dia % 14 + 1} — sección dedicada al teatro`,
    `Cable de la Agencia VANGUARD verificado por la Mesa de Verificación (sello doble)`,
    `Registro de PÉRDIDAS — evidencia fotográfica verificada por la comunidad`,
    `Reporte local corregido por 3 editores — debate en la página de discusión`,
    `Datos del dossier MUNDIAL de la nación implicada (última actualización)`,
    `Canal OSINT contrastado con cable primario — sello "coincide con el mundo"`,
  ];

  return {
    id: s.id,
    titulo: s.titulo,
    extracto: pick(seed, 0, s.extractos),
    categorias: s.categorias,
    infobox: [
      { etiqueta: "Estado actual", valor: s.estadoFijo },
      { etiqueta: "Comenzó", valor: s.fechaInicio },
      { etiqueta: "Lugar", valor: s.lugar },
      { etiqueta: "Ganador", valor: "en disputa — sin resolución" },
      { etiqueta: "Índice de riesgo Vanguard", valor: `${Math.floor(55 + r(seed, 5) * 43)}/100` },
    ],
    bandos: s.bandos,
    secciones,
    referencias: refs.slice(0, 4 + Math.floor(r(seed, 6) * 3)),
    editores,
    ediciones,
    protegido: r(seed, 7) > 0.5,
    vigilado: r(seed, 8) > 0.3,
    estado: s.estadoFijo,
    fechaInicio: s.fechaInicio,
    lugar: s.lugar,
  };
}

export function haceEdicion(mins: number): string {
  if (mins < 60) return `hace ${mins} min`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `hace ${h} h`;
  return `hace ${Math.floor(h / 24)} d`;
}

export const WIKI_IDS = ARTICULOS.map((a) => a.id);

// discusión de la página de charla (v90: da vida de comunidad al artículo)
export interface NotaCharla {
  usuario: string;
  sello: "OPERADOR" | "ANALISTA" | "BOT";
  tema: string;
  respuestas: number;
}

const TEMAS = [
  "el número de bajas de la infobox contradice el registro de PÉRDIDAS — abrir hilo",
  "el mapa de control necesita actualización: la línea se movió 2 km según la evaluación",
  "propuesta de renombrar la sección 'Cronología del frente' por 'Cronología'",
  "fuente primaria dudosa en el párrafo 3: pedida segunda verificación",
  "añadir sección de economía de guerra — hay datos del dossier MUNDIAL",
  "los comandantes del eje sur necesitan cita: hay foto del registro de PÉRDIDAS",
  "formato de la caja de información discutido en el proyecto: estilo estándar",
  "el índice de riesgo Vanguard usa una escala nueva — documentar en la nota metodológica",
];

export function generarCharla(id: string, dia = Math.floor(Date.now() / 86400_000)): NotaCharla[] {
  const seed = "wikicharla90:" + id + ":" + dia;
  const n = 3 + Math.floor(r(seed, 0) * 3);
  const out: NotaCharla[] = [];
  for (let i = 0; i < n; i++) {
    out.push({
      usuario: pick(seed, 10 + i, ["Cartógrafo-9", "AnalistaVerde", "FrentesBot", "Corresponsal_K", "EditorLitoral", "DronDoc", "Verifica-IA", "MesaOryx"]),
      sello: pick(seed, 20 + i, ["OPERADOR", "ANALISTA", "BOT"] as const),
      tema: pick(seed, 30 + i, TEMAS),
      respuestas: Math.floor(r(seed, 40 + i) * 24),
    });
  }
  return out;
}
