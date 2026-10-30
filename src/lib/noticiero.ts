"use client";

// ============================================================
// v203.0 EL NOTICIERO — VANGUARD HABLA DE LAS NOTICIAS, MÁS Y MEJOR.
// El mandato del Dueño: «la voz de Vanguard está bien pero lo que me
// gustaría es que hable más... que hable más de noticias y más».
//
// Qué aporta sobre el Centinela de Impacto (v180, que solo grita
// URGENTE/CRÍTICO con una sola fórmula):
//  ① EL NOTICIERO HABLADO — un digest natural de los cables más
//    pesados del momento con LA ANALISTA (la voz de los briefings):
//    apertura rotatoria, titular principal con país e impacto, dos o
//    tres «también en la agencia» y cierre variado. No suena dos
//    veces igual: 5 aperturas × 4 cierres rotan por hora.
//  ② AUTO CON HONESTIDAD — el noticiero automático pide tres cosas
//    ANTES de abrir la boca: permiso de hablar concedido (v201),
//    interruptor de voz de alertas ON (vg180) y pestaña visible.
//    El noticiero PEDIDO (botón del Centro Mundial) siempre suena:
//    ese toque ya es el permiso.
//  ③ SIN REPETICIÓN — lo auto no repite cables: los ya narrados
//    quedan anotados y solo suena cuando aterran titulares nuevos.
//    Cooldown propio de 4 minutos (independiente del cooldown de
//    las alertas urgentes de 45s) para que la voz viva pero no
//    bombardee. Respeta el MUTE global (hablarAgente lo aplica).
// Leyes intactas: v190 (nada se recarga solo), v189 (nada bloquea),
// semáforo v198 (fuera de salas de noticias el latido respira), pozo
// v197 (misma agua que fichas y GUERRA HOY), permiso v201.
// ============================================================

import { hablarAgente, pararVoces } from "./voces-agentes";

export interface CableNoticiero {
  id: string;
  title?: string;
  paisNombre?: string;
  impacto?: number | string;
  tier?: string;
}

export interface NoticieroOpts {
  /** true = iniciativa de la casa (exige permiso v201 + interruptor v180) */
  auto?: boolean;
  /** cuántos cables entran en el guion (2–6) */
  maximo?: number;
  /** aviso cuando el discurso termina (para apagar el estado del botón) */
  onend?: () => void;
  onerror?: () => void;
}

/** Cooldown del noticiero AUTO — compartido por Centro y Centinela. */
const INTERVALO_AUTO_MS = 4 * 60_000;
/** Impacto mínimo para que un cable merezca ser narrado (ALTO ≥ 40). */
const UMBRAL_NOTICIERO = 40;

let ultimoAutoMs = 0;
const narrados = new Set<string>();

function imp(c: CableNoticiero): number {
  return Number(c.impacto) || 0;
}

function limpia(t: string): string {
  return t.replace(/\s+/g, " ").trim();
}

// ── LA VARIEDAD: el noticiero nunca suena dos veces igual ──
const APERTURAS: ((n: number, paises: number) => string)[] = [
  (n, p) => `Pulso del mundo: ${n} cables en vivo desde ${p} países.`,
  (n, p) => `La agencia informa: ${n} cables activos en ${p} países.`,
  (n) => `Aquí Vanguard, noticiero del planeta. ${n} titulares pesan ahora mismo.`,
  (n, p) => `Situación global: ${n} cables en escucha cubriendo ${p} naciones.`,
  () => `Paso de la madrugada al frente: esto es lo que mueve el mundo.`,
];
const CIERRES: (() => string)[] = [
  () => `Te mantengo al tanto, comandante.`,
  () => `El radar sigue abierto. Vanguard informa.`,
  () => `Seguiré contándote el mundo mientras giras por la casa.`,
  () => `Vanguard vela. Próximo pulso en minutos.`,
];

function elige<T>(arr: T[], semilla: number): T {
  return arr[Math.abs(semilla) % arr.length];
}

/** Arma el guion hablado del noticiero con los cables que merecen voz. */
export function construirGuion(items: CableNoticiero[], maximo = 4): string {
  const candidatos = [...items]
    .filter((c) => (c.title || "").length > 8)
    .sort((a, b) => imp(b) - imp(a))
    .slice(0, Math.max(2, Math.min(6, maximo)));
  if (candidatos.length === 0) return "";

  const paises = new Set(candidatos.map((c) => (c.paisNombre || "").toUpperCase()).filter(Boolean));
  const ahora = Date.now();
  const apertura = elige(APERTURAS, Math.floor(ahora / (60 * 60_000)) + candidatos.length);
  const cierre = elige(CIERRES, Math.floor(ahora / (60 * 60_000)) + 2);

  const principal = candidatos[0];
  const paisP = principal.paisNombre || "el mundo";
  const partePrincipal =
    `Titular principal, desde ${paisP}: ` +
    `${limpia(principal.title || "")}. ` +
    `Impacto ${imp(principal)} sobre 100.`;

  const resto = candidatos.slice(1, 3).map((c) => {
    const pais = c.paisNombre ? `En ${c.paisNombre}, ` : "";
    return `${pais}${limpia(c.title || "")}.`;
  });
  const parteResto = resto.length ? ` También en la agencia: ${resto.join(" ")}` : "";

  return limpia(
    `${apertura(candidatos.length, Math.max(paises.size, 1))} ${partePrincipal}${parteResto} ${cierre()}`
  );
}

/** ¿El interruptor de la voz de alertas (vg180) está ON? */
function vozAlertasOn(): boolean {
  try {
    return localStorage.getItem("vg180-voz-alertas") !== "0";
  } catch {
    return true;
  }
}

/**
 * NARRA EL NOTICIERO con la voz de LA ANALISTA.
 *  · auto=true:  iniciativa de la casa — exige permiso v201, interruptor
 *    v180 ON, pestaña visible, ≥4 min desde el último auto y titulares
 *    NUEVOS (los ya narrados no se repiten). Devuelve false si calla.
 *  · auto=false: el toque del piloto (botón NOTICIERO) — siempre suena.
 */
export function narrarNoticiero(items: CableNoticiero[], opts: NoticieroOpts = {}): boolean {
  const auto = opts.auto === true;
  if (auto && typeof window !== "undefined" && document.hidden) return false;
  if (auto && !vozAlertasOn()) return false;

  const frescos = auto
    ? [...items].filter((c) => imp(c) >= UMBRAL_NOTICIERO && !narrados.has(c.id))
    : [...items].filter((c) => (c.title || "").length > 8);
  frescos.sort((a, b) => imp(b) - imp(a));
  if (frescos.length === 0) return false;
  if (auto && Date.now() - ultimoAutoMs < INTERVALO_AUTO_MS) return false;

  const guion = construirGuion(frescos, opts.maximo ?? (auto ? 4 : 5));
  if (!guion) return false;

  if (auto) {
    ultimoAutoMs = Date.now();
    for (const c of frescos.slice(0, 6)) narrados.add(c.id);
    // la lista no crece para siempre: memoria viva de las últimas horas
    if (narrados.size > 150) {
      const ultimos = [...narrados].slice(-80);
      narrados.clear();
      for (const id of ultimos) narrados.add(id);
    }
  }

  return hablarAgente("analista", guion, {
    automatico: auto,
    onend: opts.onend,
    onerror: opts.onerror,
  });
}

/** Silencia el noticiero en curso (botón, desmonte de la sala). */
export function pararNoticiero(): void {
  pararVoces();
}
