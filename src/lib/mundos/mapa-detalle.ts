// ═══════════════════════════════════════════════════════════════════
// v405.12 · EL MAPA DE UN PAÍS — la ventana de detalle (Natural Earth 50m)
//
// El mapa del índice dibuja el planeta con la geometría de 110m (rápida y
// suficiente de lejos). Un país pequeño en 110m son cuatro puntos. Para la
// ficha de cada país se usa la MISMA proyección con la geometría de 50m
// —la que trae 240 países en vez de 177— recortada a una ventana alrededor
// del país, con sus vecinos dentro para que se vean las fronteras de verdad.
//
// Solo se sirven los polígonos que caen en la ventana: la página de Francia
// no viaja con los 240 países, viaja con los que se ven.
// ═══════════════════════════════════════════════════════════════════

import detalleJson from "./mapa-detalle.json";
import { POR_NUM, POR_ISO2 } from "@/lib/geo-paises";

interface PaisDetalle {
  n: string;
  d: string;
  b: [number, number, number, number];
  c: [number, number];
}

interface ArchivoDetalle {
  fuente: string;
  proyeccion: string;
  ancho: number;
  alto: number;
  paises: Record<string, PaisDetalle>;
  vecinos: Record<string, string[]>;
  rejilla: string;
}

const DETALLE = detalleJson as unknown as ArchivoDetalle;

export interface CapaDetalle {
  clave: string;
  d: string;
  /** "pais" = el protagonista · "vecino" = comparte frontera · "otro" = contexto */
  rol: "pais" | "vecino" | "otro";
  iso2: string | null;
  nombre: string;
}

export interface VistaPais {
  /** viewBox listo para el SVG */
  vb: string;
  ancho: number;
  alto: number;
  /** cuántos polígonos entran en la ventana */
  capas: CapaDetalle[];
  /** el país tiene polígono propio en el mapa de detalle */
  dibujado: boolean;
}

function claveDeIso2(iso2: string): string | null {
  const g = POR_ISO2.get((iso2 ?? "").toLowerCase());
  if (!g) return null;
  const k = String(g.num).padStart(3, "0");
  return DETALLE.paises[k] ? k : null;
}

function solapan(a: [number, number, number, number], b: [number, number, number, number]): boolean {
  return !(a[2] < b[0] || a[0] > b[2] || a[3] < b[1] || a[1] > b[3]);
}

/**
 * La ventana de un país: su encuadre con un 35 % de aire por lado y un mínimo
 * de 45 unidades de ancho, para que un microestado no se quede solo en el
 * centro de un lienzo vacío.
 */
export function vistaDePais(iso2: string): VistaPais | null {
  const clave = claveDeIso2(iso2);
  if (!clave) return null;
  const yo = DETALLE.paises[clave];
  const [x0, y0, x1, y1] = yo.b;
  const w = Math.max(x1 - x0, 1);
  const h = Math.max(y1 - y0, 1);
  const aire = 0.35;
  let ancho = Math.max(w * (1 + aire * 2), 45);
  let alto = Math.max(h * (1 + aire * 2), 45);
  // se respeta la proporción del lienzo (2:1) sin recortar el país
  const razon = 2;
  if (ancho / alto < razon) ancho = alto * razon;
  else alto = ancho / razon;
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  const vx = Math.min(Math.max(cx - ancho / 2, 0), DETALLE.ancho - ancho);
  const vy = Math.min(Math.max(cy - alto / 2, 0), DETALLE.alto - alto);
  const ventana: [number, number, number, number] = [vx, vy, vx + ancho, vy + alto];

  const vecinos = new Set(DETALLE.vecinos[clave] ?? []);
  const entran: CapaDetalle[] = [];
  for (const [k, p] of Object.entries(DETALLE.paises)) {
    if (!solapan(p.b, ventana)) continue;
    const g = POR_NUM.get(k) ?? null;
    entran.push({
      clave: k,
      d: p.d,
      rol: k === clave ? "pais" : vecinos.has(k) ? "vecino" : "otro",
      iso2: g ? g.iso2 : null,
      nombre: g ? g.nombre : p.n,
    });
  }
  // el protagonista el último: se pinta encima de todo
  entran.sort((a, b) => (a.rol === "pais" ? 1 : 0) - (b.rol === "pais" ? 1 : 0));
  return {
    vb: `${vx.toFixed(1)} ${vy.toFixed(1)} ${ancho.toFixed(1)} ${alto.toFixed(1)}`,
    ancho,
    alto,
    capas: entran,
    dibujado: true,
  };
}

/** ¿Este país tiene polígono en el mapa de detalle? (cobertura honesta) */
export function dibujaPais(iso2: string): boolean {
  return claveDeIso2(iso2) !== null;
}

export function coberturaDetalle() {
  return {
    fuente: "Natural Earth vía world-atlas (countries-50m) — la misma proyección del índice",
    paises: Object.keys(DETALLE.paises).length,
    conVecinos: Object.keys(DETALLE.vecinos).length,
    rejilla: DETALLE.rejilla,
  };
}
