"use client";

// ============================================================
// v367.8 EL PARQUE MILITAR — LO QUE YA EXISTE, COPIADO
// (src/lib/3d/activos-militares.ts)
//
// Orden del Dueño, textual: «mejora los uniformes, personajes, vehículos
// militares; no crees nada nuevo, solo copia los mejores que ya existen 3D con
// todo y pégalos a Vanguard, así con el simulador de guerra, así con todo lo
// que hay en Vanguard».
//
// ESTO NO INVENTA NI UN POLÍGONO. Son seis modelos 3D que YA existían, hechos
// por Quaternius y publicados como CC0 1.0 (dominio público). Se copiaron tal
// cual —sin retocar la malla— y viven dentro de la casa, servidos por Vanguard
// desde /assets/3d/militar. Cada ficha dice su autor, su licencia, su archivo
// de origen y el día en que se comprobó (HTTP 200, cabecera «glTF»).
//
// Lo único que la casa aporta encima es el TINTE DE UNIFORME: se toma el color
// de la facción y se aplica a las telas del modelo (nunca a la piel ni al
// visor). Eso es lo que pedía «mejora los uniformes»: el mismo soldado, con el
// uniforme de cada bando.
//
// Doctrina de la casa: si un modelo no abre, la escena NO se queda vacía — se
// pinta la figura procedural de siempre y se dice en la cara.
// ============================================================

export type TipoActivo = "personaje" | "vehiculo" | "mech";

export interface ActivoMilitar {
  id: string;
  nombre: string;
  tipo: TipoActivo;
  /** archivo real dentro de la casa (public/…) */
  archivo: string;
  /** de dónde se copió exactamente */
  origen: string;
  autor: string;
  licencia: string;
  /** tamaño real del archivo en bytes (medido, no estimado) */
  bytes: number;
  /** animaciones que trae el propio modelo (leídas del GLB) */
  animaciones: string[];
  /** materiales del GLB que son TELA (los que se pueden teñir de uniforme) */
  telas: string[];
  /** materiales que NUNCA se tiñen (piel, visor, cristal) */
  intactos: string[];
  /** altura objetivo en unidades de la escena, ya medida en la casa */
  altura: number;
  /** día de comprobación (HTTP + cabecera GLB) */
  comprobado: string;
  /** código HTTP con el que respondió el origen ese día */
  http: number;
}

export const AUTOR_MODELOS = "Quaternius";
export const LICENCIA_MODELOS = "CC0 1.0 (dominio público)";
export const ORIGEN_MODELOS =
  "github.com/trebeljahr/quaternius-showcase (packs oficiales de Quaternius, CC0)";

export const ACTIVOS_MILITARES: ActivoMilitar[] = [
  {
    id: "soldado-swat",
    nombre: "INFANTERÍA DE ASALTO (SWAT)",
    tipo: "personaje",
    archivo: "/assets/3d/militar/soldado-swat.glb",
    origen: "public/glb/modular_men/Swat.glb",
    autor: AUTOR_MODELOS,
    licencia: LICENCIA_MODELOS,
    bytes: 889396,
    animaciones: [],
    telas: ["Swat_Black", "Swat"],
    intactos: ["skin", "visor"],
    altura: 1.8,
    comprobado: "2026-11-12",
    http: 200,
  },
  {
    id: "soldado-obrero",
    nombre: "OPERARIO DE CAMPAÑA (CHALECO)",
    tipo: "personaje",
    archivo: "/assets/3d/militar/soldado-obrero.glb",
    origen: "public/glb/modular_men/Worker.glb",
    autor: AUTOR_MODELOS,
    licencia: LICENCIA_MODELOS,
    bytes: 673480,
    animaciones: [],
    telas: ["Worker_Yellow", "Worker_Vest"],
    intactos: ["skin"],
    altura: 1.78,
    comprobado: "2026-11-12",
    http: 200,
  },
  {
    id: "tanque-1",
    nombre: "CARRO DE COMBATE · MODELO 1",
    tipo: "vehiculo",
    archivo: "/assets/3d/militar/tanque-1.glb",
    origen: "public/glb/tank_pack/Tank.glb",
    autor: AUTOR_MODELOS,
    licencia: LICENCIA_MODELOS,
    bytes: 836728,
    animaciones: ["Tank_Forward", "Tank_Backwards", "Tank_TurningLeft", "Tank_TurningRight"],
    telas: ["Main", "Main_Light", "Main_Dark"],
    intactos: ["Wheels"],
    altura: 2.4,
    comprobado: "2026-11-12",
    http: 200,
  },
  {
    id: "tanque-2",
    nombre: "CARRO DE COMBATE · MODELO 2",
    tipo: "vehiculo",
    archivo: "/assets/3d/militar/tanque-2.glb",
    origen: "public/glb/tank_pack/Tank2.glb",
    autor: AUTOR_MODELOS,
    licencia: LICENCIA_MODELOS,
    bytes: 912836,
    animaciones: ["Tank_Forward", "Tank_Backwards", "Tank_TurningLeft", "Tank_TurningRight"],
    telas: ["Main", "Main_Light"],
    intactos: ["Wheels"],
    altura: 2.6,
    comprobado: "2026-11-12",
    http: 200,
  },
  {
    id: "tanque-3",
    nombre: "CARRO DE COMBATE · MODELO 3",
    tipo: "vehiculo",
    archivo: "/assets/3d/militar/tanque-3.glb",
    origen: "public/glb/tank_pack/Tank3.glb",
    autor: AUTOR_MODELOS,
    licencia: LICENCIA_MODELOS,
    bytes: 890776,
    animaciones: ["Tank_Forward", "Tank_Backwards", "Tank_TurningLeft", "Tank_TurningRight"],
    telas: ["Main", "Main_Light"],
    intactos: ["Wheels"],
    altura: 2.5,
    comprobado: "2026-11-12",
    http: 200,
  },
  {
    id: "mech-leela",
    nombre: "MECH DE APOYO PESADO",
    tipo: "mech",
    archivo: "/assets/3d/militar/mech-leela.glb",
    origen: "public/glb/mech_pack/Leela.glb",
    autor: AUTOR_MODELOS,
    licencia: LICENCIA_MODELOS,
    bytes: 2388704,
    animaciones: ["Idle", "Walk", "Run", "Shoot", "Punch", "Death", "Jump"],
    telas: ["Leela_Texture"],
    intactos: [],
    altura: 5.2,
    comprobado: "2026-11-12",
    http: 200,
  },
];

export function activoPorId(id: string): ActivoMilitar | null {
  return ACTIVOS_MILITARES.find((a) => a.id === id) ?? null;
}

export function activosPorTipo(tipo: TipoActivo): ActivoMilitar[] {
  return ACTIVOS_MILITARES.filter((a) => a.tipo === tipo);
}

export function cuentaActivos(): Record<TipoActivo, number> {
  return {
    personaje: activosPorTipo("personaje").length,
    vehiculo: activosPorTipo("vehiculo").length,
    mech: activosPorTipo("mech").length,
  };
}

export function bytesTotales(): number {
  return ACTIVOS_MILITARES.reduce((s, a) => s + a.bytes, 0);
}

// ── LOS UNIFORMES ────────────────────────────────────────────
//
// El tinte no cambia el modelo: cambia el color de su tela. Seis uniformes
// reales de la casa, cada uno con su color de tela y su color de chaleco.

export type FaccionId =
  | "otan"
  | "rusia"
  | "desierto"
  | "urbano"
  | "insurgente"
  | "onu";

export interface Uniforme {
  id: FaccionId;
  nombre: string;
  /** color de la tela principal (uniforme) */
  tela: string;
  /** color del chaleco / correaje */
  chaleco: string;
  /** color del vehículo (carrocería) */
  carroceria: string;
  /** por qué ese color, en una línea honesta */
  nota: string;
}

export const UNIFORMES: Record<FaccionId, Uniforme> = {
  otan: {
    id: "otan",
    nombre: "OTAN · VERDE OLIVA",
    tela: "#4a5a3a",
    chaleco: "#2f3a26",
    carroceria: "#46523a",
    nota: "verde oliva con correaje oscuro: el patrón de campaña más extendido del bloque occidental",
  },
  rusia: {
    id: "rusia",
    nombre: "BLOQUE ORIENTAL · CAQUI",
    tela: "#5d5b3c",
    chaleco: "#3b3a26",
    carroceria: "#54523a",
    nota: "caqui terroso: el color de campaña del bloque oriental",
  },
  desierto: {
    id: "desierto",
    nombre: "DESIERTO · ARENA",
    tela: "#b9a37a",
    chaleco: "#8d7a55",
    carroceria: "#a9926a",
    nota: "arena clara para teatro abierto: menos contraste contra el suelo y el polvo",
  },
  urbano: {
    id: "urbano",
    nombre: "URBANO · GRIS",
    tela: "#5a5f66",
    chaleco: "#3a3e44",
    carroceria: "#565b62",
    nota: "gris de ciudad: el uniforme que se pierde entre hormigón y escombros",
  },
  insurgente: {
    id: "insurgente",
    nombre: "IRREGULAR · MARRÓN",
    tela: "#6b5741",
    chaleco: "#463829",
    carroceria: "#5f4d3a",
    nota: "marrón sin insignia: milicia irregular, sin patrón industrial",
  },
  onu: {
    id: "onu",
    nombre: "CASCO AZUL",
    tela: "#3f5f8a",
    chaleco: "#2b4260",
    carroceria: "#c9cfd6",
    nota: "azul de misión de paz con vehículo blanco: el color que se ve de lejos a propósito",
  },
};

export const FACCCIONES_ORDEN: FaccionId[] = ["otan", "rusia", "desierto", "urbano", "insurgente", "onu"];

/** Paleta de las figuras de respaldo (si un modelo no abre, se pinta esto). */
export const COLOR_RESPALDO = { cuerpo: 0x6b7280, tela: 0x4a5a3a, acero: 0x374151 };
