// v92.0 OJO DEL MUNDO — OJO-GEOINT (espejo del dashboard de inteligencia
// geoespacial con IA): capas conmutables, detecciones del núcleo neuronal
// sobre imágenes simuladas, agenda de pases satelitales y cola de tareas
// de geolocalización. Todo ficticio, determinista por tramos de 4 minutos.

import { evaluarNeuronal, bucketMinutos, mulberry32, fnvHash } from "./neurona-core";

export type CapaGeo = { id: string; nombre: string; color: string; activa: boolean; cobertura: number };

export type Deteccion = {
  id: string;
  zona: string;
  tipo: "Convoy" | "Posición de artillería" | "Buque" | "Aeropuerto civil" | "Obra de fortificación" | "Depósito de combustible" | "Radar activado";
  confianza: number;
  neurona: string; // neurona que disparó
  coords: { x: number; y: number };
  pixeles: string; // huella procedural del "recorte de imagen"
  haceMin: number;
  revisadoPor: "NÚCLEO IA" | "ANALISTA HUMANO";
};

export type PaseSatelital = { satelite: string; enMin: number; zona: string; resolucion: string; tipo: "ÓPTICA" | "SAR" | "TÉRMICA" };

export type ColaGeo = { id: string; peticion: string; estado: "EN COLA" | "PROCESANDO" | "LISTO"; progreso: number };

const ZONAS = [
  "Paso de Karvath", "Litoral de Corodia", "Altiplano de Sarn", "Cordillera de Bruma",
  "Planicie de Tarquinia", "Liga de Estrela", "Red de Ostmark", "Cuenca de Odal",
];

const SATELITES = ["CENTINELA-4B", "OJO ALBA-2", "BARÓN-9 SAR", "VIGÍA TÉRMICA-7", "CENTINELA-11A", "OJO ALBA-5"];

const PETICIONES = [
  "Contar hangares en el aeródromo sur",
  "Verificar huella térmica del depósito 12",
  "Geolocalizar convoy de 8 camiones",
  "Comparar movimientos de tierra del último pase",
  "Cruzar AIS apagado con imagen SAR nocturna",
  "Detectar trincheras nuevas al norte del cruce",
];

const CAPAS_BASE: CapaGeo[] = [
  { id: "optica", nombre: "Óptica 30 cm", color: "#FFC94D", activa: true, cobertura: 68 },
  { id: "sar", nombre: "Radar SAR", color: "#4DD8FF", activa: false, cobertura: 84 },
  { id: "termica", nombre: "Térmica nocturna", color: "#FF6B4D", activa: false, cobertura: 41 },
  { id: "adsb", nombre: "ADS-B (aire)", color: "#9AE04D", activa: true, cobertura: 92 },
  { id: "ais", nombre: "AIS (mar)", color: "#4D9DFF", activa: true, cobertura: 77 },
  { id: "luces", nombre: "Luces nocturnas", color: "#C89AFF", activa: false, cobertura: 55 },
];

const TIPOS: Deteccion["tipo"][] = [
  "Convoy", "Posición de artillería", "Buque", "Aeropuerto civil",
  "Obra de fortificación", "Depósito de combustible", "Radar activado",
];

/** Huella procedural del recorte: patrón de "píxeles" para el vignette. */
function huellaPixeles(seed: number): string {
  const rnd = mulberry32(seed);
  const celdas: string[] = [];
  const grid = 8;
  for (let y = 0; y < grid; y++) {
    for (let x = 0; x < grid; x++) {
      const v = rnd();
      if (v > 0.72) celdas.push(`${x},${y},${Math.round(120 + v * 135)}`);
    }
  }
  return celdas.join(";");
}

function generarDetecciones(bucket: number): Deteccion[] {
  const rnd = mulberry32(fnvHash("geoint-" + bucket));
  const n = 7 + Math.floor(rnd() * 5);
  return Array.from({ length: n }, (_, i) => {
    const tipo = TIPOS[Math.floor(rnd() * TIPOS.length)];
    const zona = ZONAS[Math.floor(rnd() * ZONAS.length)];
    const texto = `${tipo} detectado en ${zona} con firma coherente en dos capas`;
    const veredicto = evaluarNeuronal(texto, 1 + Math.floor(rnd() * 3));
    return {
      id: `G-${bucket}-${i}`,
      zona,
      tipo,
      confianza: veredicto.confianza,
      neurona: veredicto.neuronasActivas[0] ?? "militar",
      coords: { x: 8 + rnd() * 84, y: 10 + rnd() * 80 },
      pixeles: huellaPixeles(fnvHash(`pix-${bucket}-${i}`)),
      haceMin: Math.floor(rnd() * 240),
      revisadoPor: (veredicto.confianza > 72 ? "NÚCLEO IA" : "ANALISTA HUMANO") as Deteccion["revisadoPor"],
    };
  }).sort((a, b) => a.haceMin - b.haceMin);
}

function generarPases(bucket: number): PaseSatelital[] {
  const rnd = mulberry32(fnvHash("pases-" + bucket));
  const tipos: PaseSatelital["tipo"][] = ["ÓPTICA", "SAR", "TÉRMICA"];
  return SATELITES.map((satelite, i) => ({
    satelite,
    enMin: 4 + Math.floor(rnd() * 88),
    zona: ZONAS[(bucket + i) % ZONAS.length],
    resolucion: `${[30, 35, 45, 50, 70][Math.floor(rnd() * 5)]} cm`,
    tipo: tipos[i % tipos.length],
  })).sort((a, b) => a.enMin - b.enMin);
}

function generarCola(bucket: number): ColaGeo[] {
  const rnd = mulberry32(fnvHash("cola-" + bucket));
  return PETICIONES.map((p, i) => {
    const r = rnd();
    const estado: ColaGeo["estado"] = r > 0.66 ? "LISTO" : r > 0.33 ? "PROCESANDO" : "EN COLA";
    return {
      id: `T-${bucket}-${i}`,
      peticion: p,
      estado,
      progreso: estado === "LISTO" ? 100 : estado === "PROCESANDO" ? Math.round(r * 90) : 0,
    };
  });
}

export function generarGeoint(base = Date.now()) {
  const bucket = bucketMinutos(4, base);
  const rnd = mulberry32(fnvHash("capas-" + bucket));
  const capas = CAPAS_BASE.map((c) => ({ ...c, cobertura: Math.max(20, Math.min(99, c.cobertura + Math.round((rnd() - 0.5) * 12))) }));
  return {
    bucket,
    capas,
    detecciones: generarDetecciones(bucket),
    pases: generarPases(bucket),
    cola: generarCola(bucket),
    stats: {
      imagenesHoy: 2400 + (bucket % 400),
      km2Cubiertos: 180_000 + (bucket % 900) * 37,
      deteccionesIA: 96 + (bucket % 60),
      verificacionHumana: 34 + (bucket % 25),
    },
  };
}
