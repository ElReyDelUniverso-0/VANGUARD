// ====== VANGUARD CAMERA NETWORK ======
// Sistema de camaras de seguridad y vigilancia en vivo con eventos de devastacion.
// El jugador compra camaras (monedas/gemas) y las coloca donde quiera en el mapa.
// Las camaras cercanas a frentes activos capturan eventos y generan intel (monedas) 24/7.

export type CameraTier = "BASICA" | "TERMICA" | "TACTICA" | "PANORAMICA" | "ORBITAL";

export interface CameraModel {
  id: string;
  name: string;
  tier: CameraTier;
  description: string;
  costCoins: number;
  costGems: number;
  // radio de vigilancia en grados (~1 grado = 111 km) — detecta frentes dentro de este radio
  radiusDeg: number;
  // multiplicador de ingresos de intel
  incomeMult: number;
  // monedas maximas acumulables sin recolectar
  capacity: number;
  // velocidad de acumulacion base (monedas por minuto con frente critico en rango)
  coinsPerMin: number;
  // soporta modo vision nocturna / termica
  nightVision: boolean;
  // accesorios / lens description para la ficha
  spec: string;
}

export const CAMERA_MODELS: CameraModel[] = [
  {
    id: "CAM_BASIC",
    name: "VANGUARD GUARD-100",
    tier: "BASICA",
    description: "Camara de vigilancia estandar. Monitorea un radio corto y reporta actividad basica.",
    costCoins: 350,
    costGems: 0,
    radiusDeg: 6,
    incomeMult: 1,
    capacity: 120,
    coinsPerMin: 2.2,
    nightVision: false,
    spec: "1080p · IR 15m · IP66",
  },
  {
    id: "CAM_THERMAL",
    name: "GUARD-THERM 300",
    tier: "TERMICA",
    description: "Sensor termico de campo. Detecta movimiento de columnas y actividades nocturnas.",
    costCoins: 850,
    costGems: 0,
    radiusDeg: 9,
    incomeMult: 1.8,
    capacity: 260,
    coinsPerMin: 4,
    nightVision: true,
    spec: "Termica 640x512 · IR 40m · Zoom x4",
  },
  {
    id: "CAM_TACTIC",
    name: "GUARD-4K TACTICA",
    tier: "TACTICA",
    description: "Unidad 4K de reconocimiento con enlaces cifrados. Doble rango y analisis automatico.",
    costCoins: 1600,
    costGems: 2,
    radiusDeg: 13,
    incomeMult: 2.6,
    capacity: 480,
    coinsPerMin: 7,
    nightVision: true,
    spec: "4K HDR · IA de deteccion · Enlace AES-256",
  },
  {
    id: "CAM_PANO",
    name: "PANORAMICA 360-X",
    tier: "PANORAMICA",
    description: "Cobertura hemisferica completa 360 grados. Vigila varios frentes a la vez.",
    costCoins: 2400,
    costGems: 3,
    radiusDeg: 17,
    incomeMult: 3.4,
    capacity: 720,
    coinsPerMin: 10,
    nightVision: true,
    spec: "360 grados · 12MP · Deteccion multizona",
  },
  {
    id: "CAM_ORBITAL",
    name: "ENLACE ORBITAL V-9",
    tier: "ORBITAL",
    description: "Nodo satelital de elite. Cubre continentes enteros y capta los eventos mas valiosos.",
    costCoins: 4000,
    costGems: 10,
    radiusDeg: 26,
    incomeMult: 5,
    capacity: 1500,
    coinsPerMin: 16,
    nightVision: true,
    spec: "Orbita LEO · SAR + EO · Enlace criptografico militar",
  },
];

export function getCameraModel(id: string): CameraModel {
  return CAMERA_MODELS.find((m) => m.id === id) ?? CAMERA_MODELS[0];
}

// ====== ELITE PASS (modo propietario / monetizacion) ======
export const ELITE_PASS = {
  id: "ELITE_PASS",
  name: "PASE ELITE VANGUARD",
  description:
    "Suscripción de comando: ingresos de cámaras x2, 3 gemas diarias reclamables, 15% de descuento en todas las cámaras y crédito ELITE en tu expediente.",
  costCoins: 2000,
  costGems: 15,
  durationMs: 7 * 24 * 3600 * 1000, // 7 dias
  dailyGems: 3,
  incomeBoost: 2,
  discountPct: 15,
};

// ====== Escenas CCTV disponibles (fotogramas reales de vigilancia) ======
export const CCTV_SCENES = [
  { id: "street-devastation", label: "EJE URBANO" },
  { id: "warehouse-fire", label: "ZONA INDUSTRIAL" },
  { id: "road-crater", label: "RUTA PRINCIPAL" },
  { id: "night-street", label: "PERIMETRO NOCTURNO" },
  { id: "harbor-smoke", label: "PUERTO COMERCIAL" },
  { id: "tanks-square", label: "PLAZA CENTRAL" },
  { id: "bridge-cctv", label: "PUENTE ESTRATEGICO" },
  { id: "border-cctv", label: "CRUCE FRONTERIZO" },
  { id: "power-plant", label: "PLANTA ENERGETICA" },
  { id: "checkpoint-night", label: "PUESTO DE CONTROL" },
];

// ====== Generador procedural de eventos (contenido ilimitado) ======
// Cada plantilla x cada frente x cada turno = combinaciones practicamente infinitas.
export type DevastationKind = "IMPACTO" | "MOVIMIENTO" | "HUMANITARIO" | "CIBERNETICO" | "NAVAL" | "AEREO";

export interface EventTemplate {
  kind: DevastationKind;
  title: string;      // {zona} se reemplaza por el nombre del frente
  detail: string;
  severity: 1 | 2 | 3; // 1 baja · 2 media · 3 critica
  baseCoins: number;
  baseXp: number;
}

export const EVENT_TEMPLATES: EventTemplate[] = [
  { kind: "IMPACTO", title: "Impacto de obus en {zona}", detail: "Camara registra detonacion y dano estructural en bloque residencial. Humo denso visible en frame 04.", severity: 3, baseCoins: 22, baseXp: 9 },
  { kind: "IMPACTO", title: "Detonacion de dron sobre {zona}", detail: "Explosion aerea seguida de incendio secundario. Onda expansiva captada por microfono ambiental.", severity: 2, baseCoins: 16, baseXp: 7 },
  { kind: "IMPACTO", title: "Crater nuevo en via de {zona}", detail: "Deformacion de asfalto de 6m con debris proyectado a 40m. Trafico detenido.", severity: 2, baseCoins: 14, baseXp: 6 },
  { kind: "IMPACTO", title: "Incendio extendido en {zona}", detail: "Frente de fuego avanza entre estructuras. Columna de humo negro visible a kilometros.", severity: 3, baseCoins: 20, baseXp: 8 },
  { kind: "MOVIMIENTO", title: "Columna blindada cruza {zona}", detail: "9 vehiculos de oruga en direccion norte. Separacion tactica de 50m entre unidades.", severity: 2, baseCoins: 15, baseXp: 7 },
  { kind: "MOVIMIENTO", title: "Convoy logistico en {zona}", detail: "Camiones de suministro con escolta ligera. Patron de reabastecimiento identificado.", severity: 1, baseCoins: 9, baseXp: 4 },
  { kind: "MOVIMIENTO", title: "Personal no identificado en {zona}", detail: "Grupo de 4-6 figuras con equipo pesado evita puestos fijos. Patron de infiltracion.", severity: 2, baseCoins: 13, baseXp: 6 },
  { kind: "MOVIMIENTO", title: "Retirada tactica observada en {zona}", detail: "Unidades abandonan posición en formación dispersa. Equipamiento dejado atrás.", severity: 1, baseCoins: 10, baseXp: 5 },
  { kind: "HUMANITARIO", title: "Flujo de desplazados en {zona}", detail: "Mas de 60 civiles con pertenencias moviendose al oeste. Necesidades criticas reportadas.", severity: 2, baseCoins: 11, baseXp: 5 },
  { kind: "HUMANITARIO", title: "Convoy de ayuda entra a {zona}", detail: "5 camiones con suministros medicos escoltados. Distribucion coordinada.", severity: 1, baseCoins: 8, baseXp: 4 },
  { kind: "HUMANITARIO", title: "Colapso estructural en {zona}", detail: "Edificio parcialmente derrumbado. Equipos de rescate acudiendo al punto.", severity: 3, baseCoins: 18, baseXp: 8 },
  { kind: "CIBERNETICO", title: "Interferencia GPS en {zona}", detail: "Señal de navegación degradada al 80 por ciento durante 12 minutos. Jamming direccional.", severity: 2, baseCoins: 12, baseXp: 6 },
  { kind: "CIBERNETICO", title: "Ping hostil contra infraestructura de {zona}", detail: "Sondeo de red contra subestacion detectado. Origen enmascarado con proxy.", severity: 2, baseCoins: 14, baseXp: 7 },
  { kind: "NAVAL", title: "Embarcaciones rapidas cerca de {zona}", detail: "3 lanchas en formacion de ataque simulando maniobras. Cambios de rumbo erraticos.", severity: 2, baseCoins: 15, baseXp: 7 },
  { kind: "NAVAL", title: "Minas a la deriva detectadas en {zona}", detail: "Objetos flotantes con perfil de mina naval marcados. Zona de exclusion sugerida.", severity: 3, baseCoins: 20, baseXp: 9 },
  { kind: "AEREO", title: "Sobrevuelo de caza sobre {zona}", detail: "2 aeronaves a alta velocidad con estelas de condensacion. Estampido sonico registrado.", severity: 1, baseCoins: 10, baseXp: 5 },
  { kind: "AEREO", title: "Dron de reconocimiento en {zona}", detail: "Aeronave no tripulada orbitando a media altura durante 40 minutos.", severity: 1, baseCoins: 9, baseXp: 4 },
  { kind: "AEREO", title: "Lanzamiento de municion desde aeronave en {zona}", detail: "Caida guiada confirmada por dos angulos. Impacto en infraestructura.", severity: 3, baseCoins: 24, baseXp: 10 },
];

// genera un evento procedural determinista+aleatorio para una camara
export function generateEvent(conflictName: string, seedTick: number) {
  const t = EVENT_TEMPLATES[Math.floor(Math.random() * EVENT_TEMPLATES.length)];
  const jitter = 0.75 + Math.random() * 0.6; // variacion de recompensas
  return {
    id: `EV-${seedTick}-${Math.floor(Math.random() * 100000)}`,
    title: t.title.replace("{zona}", conflictName),
    detail: t.detail,
    kind: t.kind,
    severity: t.severity,
    coins: Math.max(4, Math.round(t.baseCoins * jitter)),
    xp: Math.max(2, Math.round(t.baseXp * jitter)),
    ts: Date.now(),
    conflictName,
  };
}

export const KIND_LABEL: Record<DevastationKind, string> = {
  IMPACTO: "IMPACTO",
  MOVIMIENTO: "MOVIMIENTO",
  HUMANITARIO: "HUMANITARIO",
  CIBERNETICO: "CIBERNETICO",
  NAVAL: "NAVAL",
  AEREO: "AEREO",
};
