"use client";

// v67.0 EL HANGAR — TERMÓMETRO DE TENSIÓN GLOBAL + PROTOCOLO ROJO.
// Un medidor vivo 0-100 que respira con el mundo: deriva temporal con
// caminata aleatoria acotada, empujones por acciones del agente, y dos
// umbrales de emergencia:
//   ≥80 → MODO CRISIS  (interfaz roja pulsante + alarmas + mensajes clasificados)
//   ≥90 → PROTOCOLO ROJO (asunción de mando: x2 monedas 6h + misión global +500ⓒ)
// Estado en localStorage — cero backend, tolerante a storage bloqueado.

export interface TensionState {
  value: number;
  ts: number;
  protocoloUntil: number; // epoch-ms; 0 = nunca activado
  protocoloEarned: number; // ⓒ ganadas durante el protocolo actual
  protocoloBonusClaimed: boolean; // +500ⓒ de la misión global ya pagado
  lastAlertLevel: number; // 0 normal, 80 crisis, 90 protocolo (para no repetir toasts)
}

const KEY = "vanguard-tension-v67";
const CRISIS_AT = 80;
const PROTOCOLO_AT = 90;
export const PROTOCOLO_HOURS = 6;

function load(): TensionState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const j = JSON.parse(raw) as TensionState;
      if (typeof j.value === "number" && j.ts) return j;
    }
  } catch {
    /* storage bloqueado: estado efímero */
  }
  // primer arranque: el mundo nace tenso (el prompt pide urgencia en 10s)
  return { value: 62, ts: Date.now(), protocoloUntil: 0, protocoloEarned: 0, protocoloBonusClaimed: false, lastAlertLevel: 0 };
}

function save(s: TensionState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* noop */
  }
  try {
    window.dispatchEvent(new CustomEvent("vanguard:tension", { detail: s.value }));
  } catch {
    /* noop */
  }
}

// Deriva determinista por minuto transcurrido + jitter acotado.
// El planeta nunca se calma del todo: tiende a la zona 55-85.
export function getTension(): number {
  if (typeof window === "undefined") return 62;
  const s = load();
  const mins = Math.floor((Date.now() - s.ts) / 60000);
  if (mins > 0) {
    let v = s.value;
    for (let i = 0; i < Math.min(mins, 720); i++) {
      const pull = v < 55 ? 0.9 : v > 85 ? -0.7 : (Math.random() - 0.48) * 2.4;
      v = Math.max(15, Math.min(97, v + pull));
    }
    s.value = Math.round(v * 10) / 10;
    s.ts = Date.now();
    save(s);
  }
  return s.value;
}

export function setTension(v: number) {
  const s = load();
  s.value = Math.max(0, Math.min(100, Math.round(v * 10) / 10));
  s.ts = Date.now();
  save(s);
}

/** Empujón de tensión por acciones (predicción fallida +1.5, acierto -1, crisis votada +2...) */
export function bumpTension(delta: number) {
  const s = load();
  s.value = Math.max(10, Math.min(100, s.value + delta));
  s.ts = Date.now();
  save(s);
}

export function isCrisis(): boolean {
  return getTension() >= CRISIS_AT;
}

export function isProtocolo(): boolean {
  const s = load();
  return s.value >= PROTOCOLO_AT || s.protocoloUntil > Date.now();
}

export function protocoloMultiplier(): number {
  const s = load();
  return s.protocoloUntil > Date.now() ? 2 : 1;
}

/** Activa el PROTOCOLO ROJO: x2 monedas durante 6h + abre la misión global. */
export function activateProtocolo(): TensionState {
  const s = load();
  s.protocoloUntil = Date.now() + PROTOCOLO_HOURS * 3600_000;
  s.protocoloEarned = 0;
  s.protocoloBonusClaimed = false;
  s.value = Math.max(s.value, PROTOCOLO_AT);
  save(s);
  return s;
}

/** Suma ganancias al contador del protocolo (llamado desde addCoins). Devuelve el bonus si cruza 300. */
export function trackProtocoloEarnings(amount: number): number {
  const s = load();
  if (s.protocoloUntil <= Date.now() || s.protocoloBonusClaimed) return 0;
  s.protocoloEarned += amount;
  if (s.protocoloEarned >= 300) {
    s.protocoloBonusClaimed = true;
    save(s);
    return 500; // misión global cumplida: +500ⓒ
  }
  save(s);
  return 0;
}

export function protocoloState(): { active: boolean; until: number; earned: number; bonusClaimed: boolean } {
  const s = load();
  return { active: s.protocoloUntil > Date.now(), until: s.protocoloUntil, earned: s.protocoloEarned, bonusClaimed: s.protocoloBonusClaimed };
}

export function markAlertLevel(level: number) {
  const s = load();
  if (s.lastAlertLevel !== level) {
    s.lastAlertLevel = level;
    save(s);
    return true; // nivel NUEVO → permite toast/alarma única
  }
  return false;
}

export const TENSION_THRESHOLDS = { CRISIS_AT, PROTOCOLO_AT };
