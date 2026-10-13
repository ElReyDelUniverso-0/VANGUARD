// ============================================================
// v110.0 MATRIZ 2100 — BITÁCORA DE VANGUARD
// "Configura las secciones ACTUALIZACIONES que nunca se pusieron"
// — RESUELTO: registro oficial y honesto de la evolución del
// sistema, de la era 1800 a la MATRIZ 2100. Fuente: historial
// real de despliegues. Se pinta en CAMBIOS y en AYUDA.
// ============================================================

export interface EntradaBitacora {
  version: string;
  nombre: string;
  hitos: string[];
  /** etiqueta de familia para el color */
  tipo: "nav" | "musica" | "mundo" | "ia" | "tecno" | "reten";
}

export const BITACORA: EntradaBitacora[] = [
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
