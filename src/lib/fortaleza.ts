// Vanguard v102.0 LA CIUDADELA — SEGURIDAD DE ACERO (solo servidor).
// El comandante pidió: "una seguridad de acero impenetrable".
// Muros de la Ciudadela:
//  1. RATE LIMITER en memoria por IP (ventana deslizante) para auth, UGC y
//     cualquier API de escritura — sin dependencias, sin redis.
//  2. SANITIZACIÓN de entradas: recorte de caracteres de control, longitud
//     máxima y normalización — nada crudo entra a la base.
//  3. LOCKOUT progresivo del login (5 fallos → 15 min de muro).
//  4. Todo se combina con lo que ya existía: scrypt + cookie HMAC + agente
//     moderador IA + anti-spam de la comunidad.

// ====== 1. RATE LIMITER EN MEMORIA ======
type Ventana = { hits: number[]; bloqueadoHasta: number };
const MUROS = new Map<string, Ventana>();
const MAX_CLAVES = 5_000; // techo de memoria — si se llena, podamos las viejas

function ventana(clave: string): Ventana {
  let v = MUROS.get(clave);
  if (!v) {
    v = { hits: [], bloqueadoHasta: 0 };
    MUROS.set(clave, v);
    if (MUROS.size > MAX_CLAVES) {
      // poda: tira las ventanas más antiguas (primeras insertadas)
      const it = MUROS.keys();
      for (let i = 0; i < 1_000; i++) {
        const k = it.next().value;
        if (k === undefined) break;
        MUROS.delete(k);
      }
    }
  }
  return v;
}

export interface VeredictoMuro {
  permitido: boolean;
  /** segundos que faltan para volver a intentar (0 si está permitido) */
  espera: number;
}

/**
 * Muro de ventana deslizante: `max` peticiones por `windowMs` por clave
 * (normalmente ip+acción). Si te pasas, muro de `castigoMs` adicional.
 */
export function muro(
  clave: string,
  max: number,
  windowMs: number,
  castigoMs = windowMs
): VeredictoMuro {
  const ahora = Date.now();
  const v = ventana(clave);
  if (v.bloqueadoHasta > ahora) {
    return { permitido: false, espera: Math.ceil((v.bloqueadoHasta - ahora) / 1000) };
  }
  v.hits = v.hits.filter((t) => ahora - t < windowMs);
  v.hits.push(ahora);
  if (v.hits.length > max) {
    v.bloqueadoHasta = ahora + castigoMs;
    v.hits = [];
    return { permitido: false, espera: Math.ceil(castigoMs / 1000) };
  }
  return { permitido: true, espera: 0 };
}

// ====== LOCKOUT DE LOGIN (5 fallos → 15 min) ======
const FALLOS = new Map<string, { n: number; hasta: number }>();
const FALLOS_MAX = 5;
const FALLOS_VENTANA = 15 * 60 * 1000;

export function registrarFalloLogin(clave: string): { bloqueado: boolean; espera: number } {
  const ahora = Date.now();
  const f = FALLOS.get(clave) ?? { n: 0, hasta: 0 };
  if (f.hasta > ahora) {
    return { bloqueado: true, espera: Math.ceil((f.hasta - ahora) / 1000) };
  }
  f.n += 1;
  if (f.n >= FALLOS_MAX) {
    f.hasta = ahora + FALLOS_VENTANA;
    f.n = 0;
    FALLOS.set(clave, f);
    return { bloqueado: true, espera: Math.ceil(FALLOS_VENTANA / 1000) };
  }
  FALLOS.set(clave, f);
  return { bloqueado: false, espera: 0 };
}

export function limpiarFalloLogin(clave: string) {
  FALLOS.delete(clave);
}

/** ¿Esta clave está bajo lockout? (para bloquear ANTES de verificar la contraseña) */
export function enLockout(clave: string): boolean {
  const f = FALLOS.get(clave);
  return !!f && f.hasta > Date.now();
}

// ====== 2. SANITIZACIÓN ======
/** Limpia texto libre: quita caracteres de control y recorta. */
export function sanitizar(s: unknown, maxLen: number): string {
  if (typeof s !== "string") return "";
  return s
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, maxLen);
}

/** Sanitiza línea única (alias, títulos): también tira saltos de línea. */
export function sanitizarLinea(s: unknown, maxLen: number): string {
  return sanitizar(s, maxLen).replace(/[\r\n\t]+/g, " ");
}

// ====== 3. CLAVE DE CLIENTE (IP real detrás del proxy) ======
export function claveCliente(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for") ?? "";
  const real = req.headers.get("x-real-ip") ?? "";
  const ip = (fwd.split(",")[0] || real || "local").trim().slice(0, 45);
  return ip;
}

// ====== ESTADO PÚBLICO DE LA FORTALEZA (para el panel) ======
export function estadoFortaleza() {
  return {
    muros: MUROS.size,
    lockouts: FALLOS.size,
    sellos: [
      { id: "scrypt", label: "Contraseñas con scrypt + salt de 128 bits" },
      { id: "hmac", label: "Sesiones firmadas con HMAC-SHA256 (cookie httpOnly)" },
      { id: "muros", label: "Muros de frecuencia por IP en registro, login y publicaciones" },
      { id: "lockout", label: "Blindaje del login: 5 fallos cierran la puerta 15 minutos" },
      { id: "moderador", label: "Agente moderador IA revisa cada envío de la comunidad" },
      { id: "sanit", label: "Sanitización de entradas en todas las APIs de escritura" },
      { id: "cabeceras", label: "Cabeceras de acero: anti-clickjacking, anti-sniff y política de permisos" },
      { id: "pasaporte", label: "Los juegos de la Ciudadela solo los publica una cuenta firmada" },
    ],
  };
}
