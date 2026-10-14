// ============================================================
// v110.0 MATRIZ 2100 — BITÁCORA DE VANGUARD
// "Configura las secciones ACTUALIZACIONES que nunca se pusieron"
// — RESUELTO: registro oficial y honesto de la evolución del
// sistema, de la era 1800 a la MATRIZ 2100. Fuente: historial
// real de despliegues. Se pinta en CAMBIOS y en AYUDA.
// v111.0 MÁQUINA DEL TIEMPO — la bitácora se ALIMENTA SOLA:
// version.ts es la fuente única; si la versión en marcha no
// tiene entrada, bitacoraViva() la antepone automáticamente
// (ningún release volverá a ser invisible en la bitácora).
// ============================================================

import { APP_VERSION, APP_CODENAME } from "@/lib/version";

export interface EntradaBitacora {
  version: string;
  nombre: string;
  hitos: string[];
  /** etiqueta de familia para el color */
  tipo: "nav" | "musica" | "mundo" | "ia" | "tecno" | "reten";
}

export const BITACORA: EntradaBitacora[] = [
  {
    version: "v113.0",
    nombre: "LETRAS VIVAS",
    tipo: "tecno",
    hitos: [
      "MOTOR DE LETRAS 3D: cada letra de la casa tiene VOLUMEN real — capas extruidas en preserve-3d, 5 materiales (HOLOGRAMA, NEÓN, CROMO, MATRIZ y la BRASA dorada) y tilt con la persona vía el Motor 3D",
      "TODOS LOS HÉROES visten letras 3D: el título grande de cada sala se extruye por capas y se inclina contigo (mandato: todo sea 3D letras)",
      "EXPERIMENTAL — LA PÁGINA DE LOS IMPOSIBLES: el 15º mundo con la FORJA DE LETRAS (escribe → volumen 3D vivo, material, profundidad, giro orbital y arrastre), la ÓRBITA DE PALABRAS y la LLUVIA DE LETRAS con TU alfabeto",
      "GIROSCOPIO CON VISTA PREVIA EN VIVO: un cubo 3D en Ajustes respira tu mano (o tu móvil) y muestra tu calibración al segundo",
      "RADIO: la PRÓXIMA OBRA ya se ve en la píldora — con SESIÓN INTELIGENTE manda la familia de la hora",
      "ARREGLO: las etiquetas nueva/observatorio de los diccionarios ruso y chino estaban intercambiadas — Rusia y China leen su idioma",
    ],
  },
  {
    version: "v112.0",
    nombre: "SOLSTICIO",
    tipo: "tecno",
    hitos: [
      "ERA POR SALA: presets que visten cada sala de su época al entrar — la MURALLA en 1950, el AUDITORIO en 2100 — y devuelven la casa a su era al salir",
      "ARRASTRAR EL CHIP DE GRUPO: el grupo completo (chip + sus pestañas) viaja por la franja de cromo con pulsación larga en móvil",
      "ESTUDIO DEL CREADOR CON INSTRUMENTOS V4: campana FM, cristal y metal, pad con séptimas, sub-bajo y cadena de estudio en las composiciones publicables",
      "GIROSCOPIO CON CALIBRACIÓN FINA: tu pose de reposo es el cero (mediana de 700 ms) — y el defecto del listener siempre-activo de v111 queda cazado",
      "MURALLA con TERMINADOR SOLAR REAL (declinación + ecuación del tiempo) y las 10 PATRULLAS cruzando el planeta en vivo",
      "SESIÓN CONTINUA INTELIGENTE: la radio encadena la familia que pide la hora — alba→ambiente · día→vanguard · noche→guerra · madrugada→ambiente",
    ],
  },
  {
    version: "v111.0",
    nombre: "MÁQUINA DEL TIEMPO",
    tipo: "tecno",
    hitos: [
      "MÁQUINA DEL TIEMPO 1950→2100: toda la casa viaja de era — CRT verde, terminal ámbar, presentes y MATRIZ HOLO",
      "GIROSCOPIO: en el móvil la matriz se inclina con tu mano (permiso iOS en Ajustes)",
      "Los 14 mundos del MENÚ con profundidad 3D real heredando las escenas holo",
      "RADIO: ECUALIZADOR de 3 bandas ±12 dB + SESIÓN CONTINUA (encadena obras sin cortes) + cada obra con su mini-escena 3D",
      "BITÁCORA AUTO-ALIMENTADA desde version.ts · MURALLA con mapa sísmico en canvas · CONSEJO se reconvoca solo",
    ],
  },
  {
    version: "v110.0",
    nombre: "MATRIZ 2100",
    tipo: "tecno",
    hitos: [
      "MOTOR 3D: todo lo plano se vuelve escena holográfica viva (15 variantes) que se inclina con tu puntero",
      "PORTADA 3D en CADA noticia — nunca más un cable sin portada, funciona sin red",
      "OJO DE DIOS con escena orbital viva · CÁMARAS con KIT DE BIENVENIDA gratis (3 cámaras al entrar)",
      "TECNOLOGÍA 3D personalizable en Ajustes: intensidad, tilt, paralaje, rejilla",
      "BITÁCORA DE VANGUARD: las actualizaciones por fin visibles para todos",
    ],
  },
  {
    version: "v109.0",
    nombre: "ORQUESTA DE ORO",
    tipo: "musica",
    hitos: [
      "Motor de música v4: cadena de estudio (reverb de sala, chorus, ping-pong, compresor + limitador)",
      "Melodías que respiran: motivo → variante → puente → cadencia, humanizadas",
      "4 insignias nuevas + MODO AUDITORIO a pantalla completa con espectro de 32 barras",
    ],
  },
  {
    version: "v108.0",
    nombre: "LA CIUDAD VIVA",
    tipo: "nav",
    hitos: [
      "El mega-menú se vuelve una ciudad nocturna con portadas reales en CSS para cada mundo",
      "VITRINA DE SALAS: ves qué hay en cada subsección antes de entrar",
      "Fijar, renombrar, duplicar y previsualizar pestañas + MODO INMERSIÓN (tecla F)",
    ],
  },
  {
    version: "v107.0",
    nombre: "GRUPOS DE CROMO",
    tipo: "nav",
    hitos: [
      "Arrastra pestañas para reordenarlas (ratón al instante, móvil con pulsación larga)",
      "Grupos de pestañas con color como Chrome: chip contraíble, renombrable, recoloreable",
      "Los personajes del CONSEJO hablan con el modelo fuerte en producción",
    ],
  },
  {
    version: "v106.0",
    nombre: "PESTAÑAS DE CROMO",
    tipo: "nav",
    hitos: [
      "Cada vista es una pestaña que se abre, se elige y se cierra",
      "La NUEVA PESTAÑA trae ómnibox para buscar en todo el índice",
      "Muralla de Vigilancia en el Observatorio con USGS e ISS en vivo",
    ],
  },
  {
    version: "v105.0",
    nombre: "LA MENTE BLINDADA",
    tipo: "ia",
    hitos: [
      "Carrera de IA en paralelo (gateway privado ∥ núcleo público) con memoria de caída",
      "IA embebida de RESERVA en tu navegador: la sala nunca calla",
    ],
  },
  {
    version: "v104.0",
    nombre: "LA VITRINA",
    tipo: "mundo",
    hitos: [
      "Obras de la comunidad con fama real, comentarios y evaluación del agente",
      "Repeticiones de simulación y talleres con precarga",
    ],
  },
  {
    version: "v101.0",
    nombre: "EL REGRESO",
    tipo: "reten",
    hitos: [
      "Informe de regreso: qué cambió en el mundo desde tu última visita",
      "Tres corrientes: pulsos del mundo, noticias reales y expediente del día",
    ],
  },
  {
    version: "v89.0",
    nombre: "RED NEURONAL",
    tipo: "tecno",
    hitos: ["La red neuronal de Vanguard visible y entrenable desde NOTICIAS"],
  },
  {
    version: "v87.0",
    nombre: "SIGNOS VITALES",
    tipo: "mundo",
    hitos: ["Población que nace, tensiones que respiran y ECG planetario que nunca para"],
  },
  {
    version: "v82.0",
    nombre: "TODO EL MUNDO",
    tipo: "mundo",
    hitos: ["Teletipo en vivo: cinta de última hora + mensajes constantes en NOTICIAS"],
  },
  {
    version: "v78.0",
    nombre: "MENÚ DE CINE",
    tipo: "nav",
    hitos: ["El menú de Vanguard se vuelve cinematográfico: ken-burns, destellos, horizonte"],
  },
  {
    version: "v73.0",
    nombre: "REGLA DE ORO",
    tipo: "nav",
    hitos: ["Héroe universal en cada sala: título grande, escena y texto fácil"],
  },
  {
    version: "v72.0",
    nombre: "INFINITA VERDADES",
    tipo: "mundo",
    hitos: ["El mayor centro de noticias de Vanguard con título épico universal"],
  },
  {
    version: "v56.0",
    nombre: "MURO INFINITO",
    tipo: "mundo",
    hitos: ["Carga por lotes del archivo histórico completo en el OJO DE DIOS"],
  },
  {
    version: "v55.0",
    nombre: "TEMPORADA CERO",
    tipo: "reten",
    hitos: [
      "Pase de temporada de 30 días, combo por permanencia y cofres por rareza",
      "Informe de Ausencia con datos reales del pulso del mundo",
    ],
  },
];

export const BITACORA_COLOR: Record<EntradaBitacora["tipo"], string> = {
  nav: "#FF8A2A",
  musica: "#FFC53D",
  mundo: "#5EEAD4",
  ia: "#A8C7FF",
  tecno: "#34C759",
  reten: "#FF3B30",
};

// ── v111: ALIMENTACIÓN AUTOMÁTICA — la versión en marcha SIEMPRE está ──
// Si el release actual no tiene entrada escrita a mano, la bitácora la genera
// (título = codename de version.ts, hito honesto de publicación).
export function bitacoraViva(): EntradaBitacora[] {
  const yaEsta = BITACORA.some((e) => e.version === APP_VERSION);
  if (yaEsta) return BITACORA;
  return [
    {
      version: APP_VERSION,
      nombre: APP_CODENAME,
      tipo: "tecno",
      hitos: [
        `${APP_VERSION} · ${APP_CODENAME} — publicado y en marcha (entrada automática de la bitácora viva)`,
        "Los hitos detallados se escriben con cada ronda — esta línea garantiza que ningún release sea invisible",
      ],
    },
    ...BITACORA,
  ];
}
