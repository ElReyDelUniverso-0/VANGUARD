// v90.0 ESPEJOS SIN FIN — MOTOR MERCADOS (espejo del terminal financiero:
// cinta de cotizaciones, gráficos de línea en vivo, variación diaria y
// "índice de miedo de guerra" ligado a la tensión real de Vanguard).
// Contratos ficticios del mundo Vanguard con precios plausibles.

import { fnv89 } from "./pulsos-data";
import { getTension } from "./tension";

export interface Contrato {
  id: string;
  nombre: string;
  simbolo: string;
  unidad: string;
  base: number; // precio base
  vol: number; // volatilidad relativa por tick
  color: string;
  tipo: "energia" | "agro" | "metal" | "indice" | "divisa";
}

export const CONTRATOS: Contrato[] = [
  { id: "brent", nombre: "Crudo Brent Vanguard", simbolo: "BRT-V", unidad: "$/barril", base: 84.0, vol: 0.011, color: "#FF6B4D", tipo: "energia" },
  { id: "gas", nombre: "Gas TTF del Juego", simbolo: "GAS-V", unidad: "€/MWh", base: 38.5, vol: 0.016, color: "#FFD23D", tipo: "energia" },
  { id: "trigo", nombre: "Trigo del Cinturón", simbolo: "WHT-V", unidad: "$/bushel", base: 6.4, vol: 0.009, color: "#9AE04D", tipo: "agro" },
  { id: "oro", nombre: "Oro de los Refugios", simbolo: "XVG", unidad: "$/onza", base: 2380.0, vol: 0.005, color: "#FFC94D", tipo: "metal" },
  { id: "urano", nombre: "Uranio U3O8", simbolo: "URA-V", unidad: "$/lb", base: 91.0, vol: 0.012, color: "#B48CFF", tipo: "metal" },
  { id: "tierras", nombre: "Cesta Tierras Raras", simbolo: "TRR-V", unidad: "índice", base: 1340.0, vol: 0.014, color: "#4DFFC4", tipo: "metal" },
  { id: "fletes", nombre: "Flete del Cabo (día)", simbolo: "FLT-V", unidad: "$/día", base: 68000, vol: 0.02, color: "#3DDCFF", tipo: "indice" },
  { id: "defensa", nombre: "Índice de Defensa Vanguard", simbolo: "DEF-V", unidad: "puntos", base: 412.0, vol: 0.008, color: "#FF4D6D", tipo: "indice" },
  { id: "nordico", nombre: "Rublo Nórdico", simbolo: "NRB", unidad: "por $", base: 92.5, vol: 0.013, color: "#FF8A3D", tipo: "divisa" },
  { id: "espejo", nombre: "Moneda Espejo", simbolo: "MRR", unidad: "por $", base: 7.24, vol: 0.006, color: "#4DA6FF", tipo: "divisa" },
];

function r(seed: string, salt: number): number {
  const h = parseInt(fnv89(seed + ":" + salt).slice(0, 7), 36);
  return (h % 100000) / 100000;
}

export interface Cotizacion {
  contrato: Contrato;
  precio: number;
  varPct: number; // variación diaria %
  serie: number[]; // 28 puntos para sparkline
  impacto: string; // frase de contexto de guerra
}

// drift de la sesión: la tensión real del juego empuja energía/oro/defensa arriba
function driftDe(tipo: Contrato["tipo"], tension: number): number {
  switch (tipo) {
    case "energia": return (tension - 50) * 0.0022;
    case "metal": return (tension - 50) * 0.0014;
    case "indice": return (tension - 50) * 0.0009;
    case "agro": return (tension - 50) * 0.0011;
    case "divisa": return -(tension - 50) * 0.0016;
    default: return 0;
  }
}

export function fmtPrecio(c: Contrato, p: number): string {
  if (p >= 10000) return p.toLocaleString("es-ES", { maximumFractionDigits: 0 });
  if (p >= 1000) return p.toLocaleString("es-ES", { maximumFractionDigits: 1 });
  return p.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const IMPACTOS: Record<string, string[]> = {
  brent: ["primas de riesgo por el estrecho", "buques desviados al Cabo", "flota fantasma compra a descuento"],
  gas: ["interconexión del frente presionada", "invierno con reservas justas", "LNG redirigido a Asia"],
  trigo: ["cosecha bajo fuego de artillería", "corredor de granos a medias", "reservas africanas en mínimo"],
  oro: ["refugios compran con miedo", "bancos centrales acumulan", "sanciones alimentan al metal"],
  urano: ["reactores piden contrato largo", "enriquecimiento vigilado", "central del frente fuera de línea"],
  tierras: ["export bajo licencia militar", "refinería de tierras raras incendiada", "cesta sube con cada detección"],
  fletes: ["guerra de primas en el estrecho", "aseguradoras suben la póliza bélica", "colas en el canal"],
  defensa: ["pedidos de drones por suscripción", "stock de 155 mm por reponer", "cada frente sube el índice"],
  nordico: ["sanciones con fugas logísticas", "capitales salen por ventanas grises", "banco central defiende el tipo"],
  espejo: ["devaluación controlada oficial", "export compensa la presión", "reservas blindadas"],
};

/**
 * Cotización en el instante dado. Serie determinista por minuto (28 puntos =
 * última media hora); el precio "en vivo" evoluciona cada tick de 3 s.
 */
export function generarMercados(ahora = Date.now()): { cots: Cotizacion[]; miedo: number; sanciones: number } {
  const tension = getTension();
  const min = Math.floor(ahora / 60_000);
  const dia = Math.floor(ahora / 86400_000);
  const cots: Cotizacion[] = CONTRATOS.map((c, ci) => {
    const drift = driftDe(c.tipo, tension);
    // serie: paseo determinista por minuto con reversion al drift
    const serie: number[] = [];
    let p = c.base * (1 + drift * 4);
    for (let i = 27; i >= 0; i--) {
      const m = min - i;
      const rr = (r(`merc90:${c.id}:${m}`, 0) - 0.5) * 2; // -1..1
      const shock = r(`merc90:${c.id}:${m}`, 1) > 0.965 ? (r(`merc90:${c.id}:${m}`, 2) - 0.35) * c.vol * 26 : 0;
      p = p * (1 + rr * c.vol * 0.35 + drift * 0.02 + shock);
      serie.push(p);
    }
    const varDia = ((serie[27] - c.base) / c.base) * 100;
    const impactos = IMPACTOS[c.id] ?? ["presión de mercado general"];
    const impacto = impactos[Math.floor(r(`merc90:${c.id}:${dia}`, 5) * impactos.length)];
    return { contrato: c, precio: serie[27], varPct: varDia, serie, impacto };
  });

  const miedo = Math.max(0, Math.min(100, Math.round(tension * 0.8 + (r("miedo90:" + min, 0) - 0.5) * 6 + 6)));
  const sanciones = 4180 + Math.floor(r("sanc90:" + dia, 0) * 12) + (dia % 7);

  return { cots, miedo, sanciones };
}

// la cinta superior: frases de corredor en vivo
const CINTA_TEMPL = [
  "{sym} +{pct}% — {imp}",
  "{sym} −{pct}% — {imp}",
  "COMPRADOR GRANDE en {sym} — {imp}",
  "{sym} rompe máximo del mes — {imp}",
  "volatilidad {sym} al {n}% — {imp}",
  "primer aviso de margen en {sym} — {imp}",
];

export function frasesCinta(ahora = Date.now()): string[] {
  const { cots } = generarMercados(ahora);
  const min = Math.floor(ahora / 60_000);
  const out: string[] = [];
  for (let i = 0; i < 8; i++) {
    const c = cots[(Math.floor(min / 2) + i) % cots.length];
    const tpl = CINTA_TEMPL[(min + i) % CINTA_TEMPL.length];
    const pct = Math.abs(c.varPct).toFixed(1);
    out.push(
      tpl
        .replace("{sym}", c.contrato.simbolo)
        .replace("{pct}", pct)
        .replace("{n}", (8 + Math.floor(r(`cinta90:${min}:${i}`, 0) * 22)).toString())
        .replace("{imp}", c.impacto)
    );
  }
  return out;
}
