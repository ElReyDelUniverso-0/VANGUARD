// ============================================================
// VANGUARD v170.0 — EL ALGORITMO «PARA TI»
// Fórmula destilada de lo exitoso del mundo (mecánicas, no código):
//  · TikTok   → afinidad por categorías + exploración forzada + razón visible
//  · YouTube  → historial pesa, «porque viste X»
//  · Google   → momentum de búsquedas/visitas (tendencia)
// Puntaje = afinidad·0.30 + novedad·0.20 + frescura·0.20 +
//           momentum·0.20 + variación·0.10, penalizado con ✖.
// Determinista por sesión (semilla estable), vivo por señales.
// ============================================================

import { SALAS } from "./salas";
import type { Categoria, EstadoAgente, Sala, SenalesAgente, TarjetaRecomendada } from "./tipos";

const HORA = 3_600_000;

function hashCadena(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

// afinidad 0..1: peso de la categoría entre tus likes y vistas
function afinidadCategoria(cat: Categoria, senales: SenalesAgente): number {
  const pesos: Partial<Record<Categoria, number>> = {};
  let total = 0;
  for (const sala of SALAS) {
    const s = senales[sala.id];
    if (!s) continue;
    const p = s.likes * 3 + s.vistas + Math.min(s.tiempoMs / 60_000, 3);
    pesos[sala.categoria] = (pesos[sala.categoria] ?? 0) + p;
    total += p;
  }
  if (total <= 0) return 0;
  return Math.min(1, (pesos[cat] ?? 0) / total);
}

// frescura 0..1: lo visto hace instantes aburre; lo de hace 48h+ vuelve a valer
function factorFrescura(ultimaVistaTs: number): number {
  if (!ultimaVistaTs) return 1;
  const horas = (Date.now() - ultimaVistaTs) / HORA;
  return Math.min(1, horas / 48);
}

// novedad: nunca vista = oro para el descubrimiento
function factorNovedad(vistas: number): number {
  return vistas === 0 ? 1 : 0.25;
}

// momentum 0..1: calidad base + likes tuyos (señal fuerte)
function factorMomentum(sala: Sala, senales: SenalesAgente): number {
  const s = senales[sala.id];
  const senalPropia = s ? Math.min(1, (s.likes * 2 + s.vistas * 0.5) / 6) : 0;
  return Math.min(1, sala.poder / 100 * 0.7 + senalPropia * 0.3);
}

function razonDominante(
  partes: { afinidad: number; novedad: number; frescura: number; momentum: number },
  sala: Sala,
  senales: SenalesAgente
): string {
  const { afinidad, novedad, frescura, momentum } = partes;
  const max = Math.max(afinidad, novedad, frescura, momentum);
  if (novedad === max && novedad >= 0.9) return "Nueva para ti";
  if (afinidad === max && afinidad > 0) return `Porque sigues ${sala.categoria}`;
  if (momentum === max) return "Tendencia de la red";
  if (frescura === max && senales[sala.id]?.vistas) return "Te dejó pendiente";
  return "Selección de la red";
}

export interface ResultadoAlgoritmo {
  tarjetas: TarjetaRecomendada[];
  stats: {
    evaluadas: number;
    ocultas: number;
    exploracion: number;
    afinidadTop: string | null;
  };
}

// feedOrden: lista priorizada de salas. slot 5k+4 (cada 5.º) = exploración
// forzada entre no ocultas menos vistas (la ventana de TikTok al azar sano).
export function calcularFeed(agente: EstadoAgente, semillaSesion: string): ResultadoAlgoritmo {
  const senales = agente.senales;
  const evaluadas: TarjetaRecomendada[] = [];
  let ocultas = 0;

  for (const sala of SALAS) {
    const s = senales[sala.id];
    if (s?.noInteresa) {
      ocultas++;
      continue;
    }
    const afinidad = afinidadCategoria(sala.categoria, senales);
    const novedad = factorNovedad(s?.vistas ?? 0);
    const frescura = factorFrescura(s?.ultimaVistaTs ?? 0);
    const momentum = factorMomentum(sala, senales);
    const variacion = hashCadena(`${semillaSesion}:${sala.id}`);
    const puntaje =
      afinidad * 0.3 + novedad * 0.2 + frescura * 0.2 + momentum * 0.2 + variacion * 0.1;
    evaluadas.push({
      sala,
      puntaje: Math.round(puntaje * 1000) / 1000,
      razon: razonDominante({ afinidad, novedad, frescura, momentum }, sala, senales),
    });
  }

  evaluadas.sort((a, b) => b.puntaje - a.puntaje);

  // exploración forzada: cada 5.ª posición rota una sala poco vista
  const ordenFinal: TarjetaRecomendada[] = [];
  const cola = [...evaluadas];
  let slot = 0;
  while (cola.length > 0) {
    if (slot % 5 === 4) {
      const candidatas = cola
        .filter((t) => (senales[t.sala.id]?.vistas ?? 0) <= 1)
        .sort((a, b) => a.puntaje - b.puntaje);
      const elegida = candidatas[0] ?? cola[cola.length - 1];
      ordenFinal.push({ ...elegida, razon: "Exploración de hoy" });
      cola.splice(cola.indexOf(elegida), 1);
    } else {
      ordenFinal.push(cola.shift() as TarjetaRecomendada);
    }
    slot++;
  }

  // stats para MENTE VIVA y /api/health
  let afinidadTop: string | null = null;
  let mejorPeso = 0;
  const porCategoria: Partial<Record<Categoria, number>> = {};
  for (const sala of SALAS) {
    const s = senales[sala.id];
    if (!s) continue;
    const p = s.likes * 3 + s.vistas;
    porCategoria[sala.categoria] = (porCategoria[sala.categoria] ?? 0) + p;
    if (p > mejorPeso) {
      mejorPeso = p;
      afinidadTop = sala.categoria;
    }
  }

  return {
    tarjetas: ordenFinal,
    stats: {
      evaluadas: evaluadas.length,
      ocultas,
      exploracion: Math.floor(ordenFinal.length / 5),
      afinidadTop,
    },
  };
}

// tendencias: lo más visto/liked de la red local (fila estilo YouTube)
export function calcularTendencias(agente: EstadoAgente): Sala[] {
  return [...SALAS]
    .map((sala) => {
      const s = agente.senales[sala.id];
      return { sala, peso: sala.poder + (s ? s.likes * 12 + s.vistas * 4 : 0) };
    })
    .sort((a, b) => b.peso - a.peso)
    .slice(0, 8)
    .map((x) => x.sala);
}
