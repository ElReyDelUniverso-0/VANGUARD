// v89.0 OPERACIÓN ESPEJO — MOTOR DE PÉRDIDAS CONFIRMADAS (espejo del registro
// visual de bajas materiales más citado del mundo: conteo por tipo y estado,
// solo con evidencia documentada). Determinista por día. Ficción plausible.

import { fnv89 } from "./pulsos-data";

export type EstadoEquipo = "DESTRUIDO" | "DAÑADO" | "ABANDONADO" | "CAPTURADO";

export interface ItemPerdida {
  modelo: string;
  lado: "AZUL" | "ROJO";
  destruido: number;
  danado: number;
  abandonado: number;
  capturado: number;
}

export interface CategoriaPerdida {
  id: string;
  nombre: string;
  icono: string; // id de silueta SVG del panel
  items: ItemPerdida[];
  total: number;
}

const EQUIPO: Record<string, { modelo: string; lado: "AZUL" | "ROJO" }[]> = {
  tanques: [
    { modelo: "T-72B3", lado: "ROJO" },
    { modelo: "T-90M Proryv", lado: "ROJO" },
    { modelo: "T-62MV", lado: "ROJO" },
    { modelo: "Leopard 2A6", lado: "AZUL" },
    { modelo: "M1A2 SEPv3", lado: "AZUL" },
    { modelo: "PT-91 Twardy", lado: "AZUL" },
  ],
  blindados: [
    { modelo: "BMP-2", lado: "ROJO" },
    { modelo: "BTR-82A", lado: "ROJO" },
    { modelo: "MT-LB", lado: "ROJO" },
    { modelo: "M2A3 Bradley", lado: "AZUL" },
    { modelo: "M113A2", lado: "AZUL" },
    { modelo: "CV9035", lado: "AZUL" },
  ],
  artilleria: [
    { modelo: "2S19 Msta-S", lado: "ROJO" },
    { modelo: "D-30 (remolcada)", lado: "ROJO" },
    { modelo: "BM-27 Uragan", lado: "ROJO" },
    { modelo: "M777A2", lado: "AZUL" },
    { modelo: "CAESAR 155mm", lado: "AZUL" },
    { modelo: "PzH 2000", lado: "AZUL" },
  ],
  antiaereo: [
    { modelo: "Pantsir-S1", lado: "ROJO" },
    { modelo: "S-300PS (TEL)", lado: "ROJO" },
    { modelo: "Buk-M3", lado: "ROJO" },
    { modelo: "IRIS-T SLM", lado: "AZUL" },
    { modelo: "Patriot PAC-3 (batería)", lado: "AZUL" },
    { modelo: "Gepard 1A2", lado: "AZUL" },
  ],
  aviacion: [
    { modelo: "Su-25SM", lado: "ROJO" },
    { modelo: "Su-34", lado: "ROJO" },
    { modelo: "Ka-52 Alligator", lado: "ROJO" },
    { modelo: "Mi-8AMTSh", lado: "ROJO" },
    { modelo: "MiG-29 (9.12)", lado: "AZUL" },
    { modelo: "Su-27P", lado: "AZUL" },
  ],
  drones: [
    { modelo: "Shahed-136/Geran-2", lado: "ROJO" },
    { modelo: "Lancet-3", lado: "ROJO" },
    { modelo: "Orion (Inokhodets)", lado: "ROJO" },
    { modelo: "Bayraktar TB2", lado: "AZUL" },
    { modelo: "MQ-9 Reaper", lado: "AZUL" },
    { modelo: "FPV de fabricación local", lado: "AZUL" },
  ],
  naval: [
    { modelo: "Lancha Raptor 03160", lado: "ROJO" },
    { modelo: "Corbeta Buyan-M", lado: "ROJO" },
    { modelo: "Remolcador de flota Proyecto 705", lado: "ROJO" },
    { modelo: "Lancha patrullera Mk II (donada)", lado: "AZUL" },
    { modelo: "Drone naval Magura V5", lado: "AZUL" },
    { modelo: "Buque de desembarco clase Alligator", lado: "AZUL" },
  ],
};

const CATS: { id: string; nombre: string; icono: string }[] = [
  { id: "tanques", nombre: "Tanques", icono: "tanque" },
  { id: "blindados", nombre: "Vehículos blindados", icono: "blindado" },
  { id: "artilleria", nombre: "Artillería", icono: "obus" },
  { id: "antiaereo", nombre: "Sistemas antiaéreos", icono: "radar" },
  { id: "aviacion", nombre: "Aviación y helicópteros", icono: "avion" },
  { id: "drones", nombre: "Drones", icono: "dron" },
  { id: "naval", nombre: "Naval", icono: "buque" },
];

function rnd(seed: string, salt: number): number {
  const h = parseInt(fnv89(seed + ":" + salt).slice(0, 7), 36);
  return (h % 100000) / 100000;
}

export function generarPerdidas(dia: number): CategoriaPerdida[] {
  // el registro SOLO CRECE: día N incluye las pérdidas del día N-1
  let base = 0;
  for (let d = 0; d < 30; d++) base += Math.floor(rnd("perd89:" + d, 99) * 5);

  return CATS.map((cat, ci) => {
    const items = EQUIPO[cat.id].map((eq, ii) => {
      const fame = 0.4 + rnd("perd89f:" + ci + ii, 3) * 1.6; // unos modelos acumulan más
      const scale = (base + dia * 3) * fame * 0.06;
      const destruido = Math.max(1, Math.round(scale * (0.5 + rnd("perd89d:" + dia + ci + ii, 4) * 0.9)));
      const danado = Math.max(0, Math.round(destruido * (0.15 + rnd("perd89x:" + dia + ci + ii, 5) * 0.35)));
      const abandonado = Math.max(0, Math.round(destruido * (0.08 + rnd("perd89a:" + dia + ci + ii, 6) * 0.25)));
      const capturado = Math.max(0, Math.round(destruido * (0.06 + rnd("perd89c:" + dia + ci + ii, 7) * 0.22)));
      return { modelo: eq.modelo, lado: eq.lado, destruido, danado, abandonado, capturado };
    });
    const total = items.reduce((s, it) => s + it.destruido + it.danado + it.abandonado + it.capturado, 0);
    return { ...cat, items, total };
  });
}

export function totalesPorLado(cats: CategoriaPerdida[]): { azul: number; rojo: number } {
  let azul = 0;
  let rojo = 0;
  for (const c of cats) {
    for (const it of c.items) {
      const t = it.destruido + it.danado + it.abandonado + it.capturado;
      if (it.lado === "AZUL") azul += t;
      else rojo += t;
    }
  }
  return { azul, rojo };
}

export const ESTADOS_META: { id: EstadoEquipo; nombre: string; color: string }[] = [
  { id: "DESTRUIDO", nombre: "Destruido", color: "#FF4D4D" },
  { id: "DAÑADO", nombre: "Dañado", color: "#FFB020" },
  { id: "ABANDONADO", nombre: "Abandonado", color: "#9AE04D" },
  { id: "CAPTURADO", nombre: "Capturado", color: "#3DDCFF" },
];
