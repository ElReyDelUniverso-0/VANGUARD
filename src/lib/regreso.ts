"use client";

// v101.0 EL REGRESO — PILAR 1: EL MUNDO CAMBIA
// Motor del INFORME DE REGRESO: qué cambió en Vanguard desde la última visita,
// con fechas y fuentes verificables. Tres corrientes:
//   1) PULSOS DEL MUNDO  — los eventos deterministas de LA MENTE (MUNDO VANGUARD · SIM)
//   2) NOTICIAS REALES   — el archivo de /api/news con dominio y fecha (FUENTE REAL)
//   3) ROTARON HOY       — expediente del día, entrada oscura, reto del creador
// HONESTIDAD: cada elemento lleva su etiqueta. Nada de urgencia falsa: si no
// cambió nada, el informe lo dice. Sin notificaciones engañosas.

import { eventosPulso, pulsoActual, type EventoPulso } from "./mente-data";
import { expedienteDelDia } from "./expedientes";
import { entradaDelDia } from "./oscura";

const PULSO_MIN = 5;
const MAX_PULSOS = 96; // techo de seguridad: 8 horas escaneadas por informe

export interface CambioRotacion {
  id: string;
  tipo: "rotacion";
  etiqueta: string; // "MUNDO VANGUARD · SIM"
  titulo: string;
  detalle: string;
  fecha: string; // ISO del día de vigencia
  icono: string;
  acento: string;
}

export interface InformeRotaciones {
  expediente: { titulo: string; agencia: string; id: string };
  oscura: { titulo: string; coleccion: string; id: string };
}

export interface InformeRegreso {
  firstVisit: boolean; // primera visita — no hay delta, pero sí portada
  awayMs: number; // ms ausente (0 si firstVisit)
  total: number; // nº total de cambios (pulsos + noticias + rotaciones)
  pulsos: EventoPulso[]; // eventos del mundo desde la última visita (cap 90)
  pulsosEscaneados: number; // cuántos pulsos de 5 min se escanearon
  riesgoMedio: number; // riesgo medio del periodo
  rotaciones: InformeRotaciones; // los diarios que rotaron hoy
  visitCount: number;
}

/** Escanea los pulsos generados desde `lastVisit` (epoch ms). Determinista. */
export function pulsosDesde(lastVisit: number, now = Date.now()): {
  eventos: EventoPulso[];
  escaneados: number;
  riesgoMedio: number;
} {
  const actual = pulsoActual(now);
  const hace = lastVisit > 0 ? Math.floor(lastVisit / (PULSO_MIN * 60_000)) : actual;
  const span = Math.max(1, actual - hace);
  const escaneados = Math.min(span, MAX_PULSOS);
  const desde = actual - escaneados + 1;
  const eventos: EventoPulso[] = [];
  for (let b = desde; b <= actual; b++) {
    for (const ev of eventosPulso(b)) eventos.push(ev);
  }
  const riesgoMedio = eventos.length
    ? Math.round(eventos.reduce((a, e) => a + e.riesgo, 0) / eventos.length)
    : 0;
  // los más recientes primero, cap 90 para no tumbar el DOM
  return { eventos: eventos.slice(-90).reverse(), escaneados, riesgoMedio };
}

/** Los diarios que rotaron hoy (siempre presentes, con su fecha de vigencia). */
export function rotacionesHoy(): InformeRotaciones {
  const exp = expedienteDelDia();
  const osc = entradaDelDia();
  return {
    expediente: { titulo: exp.titulo, agencia: exp.agencia, id: exp.id },
    oscura: { titulo: osc.titulo, coleccion: osc.coleccion, id: osc.id },
  };
}

/** Informe completo para la capa global y el panel EL MUNDO CAMBIA. */
export function informeRegreso(lastVisit: number, visitCount = 0): InformeRegreso {
  const now = Date.now();
  const firstVisit = !lastVisit || lastVisit <= 0;
  const awayMs = firstVisit ? 0 : Math.max(0, now - lastVisit);
  const { eventos, escaneados, riesgoMedio } = pulsosDesde(lastVisit, now);
  return {
    firstVisit,
    awayMs,
    total: eventos.length,
    pulsos: eventos,
    pulsosEscaneados: escaneados,
    riesgoMedio,
    rotaciones: rotacionesHoy(),
    visitCount,
  };
}

/** "hace 3 días", "hace 7 h", "mientras no mirabas"... */
export function ausenciaTxt(ms: number): string {
  if (ms <= 0) return "primera vez";
  const h = ms / 3_600_000;
  if (h < 1) return `hace ${Math.max(1, Math.round(ms / 60_000))} min`;
  if (h < 24) return `hace ${Math.round(h)} h`;
  return `hace ${Math.floor(h / 24)} d`;
}

// ============================================================
// ESTADO DE REGRESO — para no repetir el banner en la misma visita
// ============================================================
export interface RegresoState {
  seenForVisit: number; // visitCount en el que el banner ya se vio
  markSeen: (visitCount: number) => void;
}

// el banner vive en regreso-banner.tsx con useState + localStorage directo
export const REGRESO_LS = "vg-regreso-v101";
