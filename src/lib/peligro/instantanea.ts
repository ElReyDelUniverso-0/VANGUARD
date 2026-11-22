// ═══════════════════════════════════════════════════════════════════
// v440.5 · LAS ÚLTIMAS LECTURAS CONOCIDAS
//
// Si una fuente oficial no responde en el momento de abrir la página, aquí
// está lo último que la casa leyó de ella —con su fecha, su enlace y su valor
// exactos—. NUNCA se rellena con una estimación: si no hay instantánea, la
// señal no se pinta.
//
// Todo lo de abajo se copió tal cual de la API oficial el 22 de noviembre de
// 2026 y se comprueba otra vez en cada visita.
// ═══════════════════════════════════════════════════════════════════

export type Instantanea = { valor: number; anio: string };

/** Banco Mundial (WDI), mundo, última lectura disponible por indicador. */
export const BANCO_MUNDIAL: Record<string, Instantanea> = {
  "EN.ATM.PM25.MC.M3": { valor: 32.872382373302, anio: "2023" }, // exposición media anual a PM2,5
  "SN.ITK.DEFC.ZS": { valor: 8.1, anio: "2024" }, // prevalencia de subalimentación
  "SH.H2O.SMDW.ZS": { valor: 73.6686144265244, anio: "2024" }, // agua potable gestionada de forma segura
  "ER.H2O.FWTL.ZS": { valor: 9.0058287959941, anio: "2022" }, // extracción de agua dulce
  "AG.LND.FRST.ZS": { valor: 31.0951828663057, anio: "2023" }, // superficie forestal
  "EN.GHG.CO2.PC.CE.AR5": { valor: 4.69378456136626, anio: "2024" }, // CO₂ per cápita
  "SP.DYN.LE00.IN": { valor: 73.4818184164654, anio: "2024" }, // esperanza de vida
  "EG.ELC.ACCS.ZS": { valor: 91.9264843853681, anio: "2024" }, // acceso a electricidad
};

/** Países de la comparación: los mismos en cada visita, para poder comparar. */
export const PAISES_COMPARACION = ["WLD", "ESP", "USA", "BRA", "IND", "NGA", "DOM"] as const;

/** Últimos partes de la OMS (DON) leídos el 22/11/2026. */
export const BROTES_INSTANTANEA: { titulo: string; fecha: string; url: string }[] = [
  {
    titulo: "Ebola disease caused by Bundibugyo virus — Democratic Republic of the Congo, Kenya and Nigeria",
    fecha: "2026-11-20",
    url: "https://www.who.int/emergencies/disease-outbreak-news/item/2026-DON630",
  },
  {
    titulo: "Chikungunya virus disease — Switzerland",
    fecha: "2026-11-17",
    url: "https://www.who.int/emergencies/disease-outbreak-news/item/2026-DON627",
  },
  {
    titulo: "Middle East respiratory syndrome (MERS) — Qatar",
    fecha: "2026-11-13",
    url: "https://www.who.int/emergencies/disease-outbreak-news/item/2026-DON626",
  },
  {
    titulo: "Ebola disease caused by Bundibugyo virus — Democratic Republic of the Congo, Kenya and Nigeria",
    fecha: "2026-11-06",
    url: "https://www.who.int/emergencies/disease-outbreak-news/item/2026-DON625",
  },
  {
    titulo: "Yellow fever — WHO African Region",
    fecha: "2026-11-06",
    url: "https://www.who.int/emergencies/disease-outbreak-news/item/2026-DON624",
  },
];

/** Cuándo se copiaron estas instantáneas. */
export const INSTANTANEA_FECHA = "2026-11-22";
