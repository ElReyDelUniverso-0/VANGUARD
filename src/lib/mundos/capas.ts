// ═══════════════════════════════════════════════════════════════════
// v405.12 · LO QUE VIAJA AL NAVEGADOR — tipos, colores y proyección
//
// Este archivo es el ÚNICO del sistema de mundos que entra en el paquete del
// cliente. Por eso no importa ni una tabla: ni censo, ni atlas, ni mapas. Solo
// tipos, la regla de color de las capas y la proyección en cuatro líneas con
// la que se colocan los puntos (capitales y microestados sin polígono).
//
// La proyección está VERIFICADA contra la que generó los polígonos
// (azimuthal de área igual · rotate[-10,0] · center[0,20] · scale 155 ·
// translate[500,295]): error máximo 0,000 px en la prueba test-mundos.js.
// ═══════════════════════════════════════════════════════════════════

import type { FormatoMedida } from "./formato";

export interface PoligonoCliente {
  k: string;
  d: string;
  iso2: string | null;
  b: [number, number, number, number];
  c: [number, number];
}

export interface PaisCliente {
  iso2: string;
  nombre: string;
  region: string;
  subregion: string;
  territorio: string | null;
  capital: string | null;
  poblacion: string | null;
  superficie: string | null;
  vecinos: number | null;
  /** ISO-2 de los países con los que comparte frontera terrestre (topología real) */
  vecinosIso: string[];
  conflictos: number;
  lat: number;
  lng: number;
  /** punto proyectado del centro del país (para países sin polígono y capitales) */
  xy: [number, number];
  clave: string | null;
}

export interface BandaLeyenda {
  etiqueta: string;
  color: string;
}

export interface CapaCliente {
  id: string;
  nombre: string;
  pregunta: string;
  fuente: string;
  formato: FormatoMedida;
  sentido: "mayor" | "menor";
  datos: Record<string, number>;
  cortes: number[];
  colores: string[];
  leyenda: BandaLeyenda[];
  conDato: number;
  sinDato: number;
  mayor: { iso2: string; nombre: string; valor: number } | null;
  menor: { iso2: string; nombre: string; valor: number } | null;
}

export interface PayloadMundos {
  lienzo: { ancho: number; alto: number };
  rejilla: string;
  poligonos: PoligonoCliente[];
  paises: PaisCliente[];
  capas: CapaCliente[];
  territorios: { clave: string; nombre: string; cuantos: number }[];
  regiones: { clave: string; nombre: string; cuantos: number }[];
  cobertura: {
    mapa: { fuente: string; proyeccion: string; conPoligono: number; conIso: number; conVecinos: number; territorios: number };
    global: {
      paises: number;
      conAtlas: number;
      conMoneda: number;
      conMilitar: number;
      conPersonas: number;
      personas: number;
      regiones: { clave: string; nombre: string; paises: number; conAtlas: number; conMilitar: number }[];
    };
  };
}

// ── LA PROYECCIÓN (azimuthal de área igual, idéntica al mapa generado) ──
const RAD = Math.PI / 180;
const K = 155;

function bruto(lat: number, lng: number): [number, number] {
  const phi = lat * RAD;
  const lam = lng * RAD;
  const den = 1 + Math.cos(phi) * Math.cos(lam);
  if (den <= 0) return [0, 0];
  const d = Math.sqrt(2 / den);
  return [d * Math.cos(phi) * Math.sin(lam), -d * Math.sin(phi)];
}

const CENTRO = bruto(20, 0);
const OFF: [number, number] = [500 - K * CENTRO[0], 295 - K * CENTRO[1]];

/** lat/lng reales → píxel del lienzo 1000×500. */
export function proyectar(lat: number, lng: number): [number, number] {
  const [x, y] = bruto(lat, lng - 10);
  return [x * K + OFF[0], y * K + OFF[1]];
}

/** El color de un país en una capa, con la MISMA regla que la leyenda. */
export function colorDeCapa(capa: CapaCliente, valor: number | null | undefined): string {
  if (valor === null || valor === undefined || !Number.isFinite(valor)) return "rgba(120,140,160,0.16)";
  let i = 0;
  while (i < capa.cortes.length && valor > capa.cortes[i]) i++;
  return capa.colores[Math.min(i, capa.colores.length - 1)];
}

/** ¿Este polígono es el elegido, un vecino suyo, o contexto apagado? */
export function papelDe(iso2: string | null, seleccion: string | null, vecinos: string[]): "pais" | "vecino" | "otro" {
  if (!seleccion) return "otro";
  if (iso2 === seleccion) return "pais";
  if (iso2 && vecinos.includes(iso2)) return "vecino";
  return "otro";
}
