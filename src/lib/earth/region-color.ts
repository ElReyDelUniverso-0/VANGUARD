// ═══════════════════════════════════════════════════════════════════
// v416.0 VANGUARD EARTH SYSTEM — EL COLOR DE CADA REGIÓN DEL PLANETA.
//
// Vive aquí, y no en mapas-capas.ts, por la misma razón que guerra-puntos:
// el explorador (/tierra) es un componente de CLIENTE y mapas-capas importa
// la base de datos. La paleta es una constante pura (cliente-seguro) y
// mapas-capas la re-exporta para que el Centro de Mapas no cambie.
// ═══════════════════════════════════════════════════════════════════

export const COLOR_REGION: Record<string, string> = {
  Americas: "#5eead4",
  Europe: "#7fe3ff",
  Africa: "#f5a623",
  Asia: "#b48cff",
  Oceania: "#3ddc97",
  Antarctic: "#8b98ad",
};
