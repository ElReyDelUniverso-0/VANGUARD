// Vanguard v15 — Autenticación de cuentas (SOLO SERVIDOR).
// scrypt para contraseñas, cookie de sesión firmada con HMAC-SHA256,
// y cuenta del PROPIETARIO (DUENO) con acceso total pre-creada.
// v204.0 EL ESCUDO — auditoría de seguridad: el secreto de reserva público
// se ROTÓ (el anterior quedó quemado en el histórico de git), la firma de
// sesión se compara en tiempo constante, la cookie viaja `secure` en
// producción y existe `firmaBorrado` (permiso de eliminar sin guardar nada).
// ACCIÓN DEL DUEÑO: define AUTH_SECRET y OWNER_PASSWORD en Vercel
// (Settings → Environment Variables) para que ni estos valores de reserva
// ni los que vengan después sirvan a un atacante.
import { scryptSync, randomBytes, timingSafeEqual, createHmac } from "crypto";
import { db } from "@/lib/db";

const SECRET = process.env.AUTH_SECRET ?? "vg-escudo-204-reserva-rotada-2026-11-xQ7";
export const SESSION_COOKIE = "vg_session";
export const SESSION_DAYS = 30;

if (!process.env.AUTH_SECRET && process.env.NODE_ENV === "production") {
  console.warn("CIUDADELA: AUTH_SECRET no definido — usando clave de reserva. Define AUTH_SECRET en las variables de entorno de Vercel.");
}

// Cuenta del propietario: TODO desbloqueado + dinero infinito.
export const OWNER_USERNAME = "DUENO";
// v204 EL ESCUDO: la contraseña de reserva se rotó (la anterior era pública
// en el repo). Si defines OWNER_PASSWORD en el entorno, esa manda y la cuenta
// se resincroniza sola en el arranque (ver ensureOwnerAccount).
export const OWNER_PASSWORD = process.env.OWNER_PASSWORD ?? "escudo204-comandante";

// ====== contraseñas ======
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

// ====== token de sesión: username.exp.firma ======
function sign(payload: string): string {
  return createHmac("sha256", SECRET).update(payload).digest("hex").slice(0, 32);
}

export function createSessionToken(username: string): string {
  const exp = Date.now() + SESSION_DAYS * 24 * 3600 * 1000;
  const payload = `${username}.${exp}`;
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined | null): string | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [username, expStr, sig] = parts;
  const payload = `${username}.${expStr}`;
  // v204 EL ESCUDO: comparación en tiempo constante — la firma es un secreto
  const esperada = Buffer.from(sign(payload), "hex");
  const recibida = Buffer.from(sig, "hex");
  if (recibida.length !== esperada.length || !timingSafeEqual(recibida, esperada)) return null;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < Date.now()) return null;
  return username;
}

// v204 EL ESCUDO — firma de acción de borrado: el servidor puede verificar un
// permiso de eliminar SIN guardar nada en la base (HMAC con el secreto de
// sesión). La recibe el cliente al publicar y la presenta al borrar.
export function firmaBorrado(ref: string): string {
  return createHmac("sha256", SECRET).update(`accion-borrar:${ref}`).digest("hex").slice(0, 32);
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production", // v204: solo viaja por HTTPS en producción
    path: "/",
    maxAge: SESSION_DAYS * 24 * 3600,
  };
}

// ====== validación de nombre de cuenta ======
const RESERVED = new Set(["DUENO", "ADMIN", "SISTEMA", "VANGUARD"]);
export function validateUsername(username: string): string | null {
  if (!/^[A-Z0-9_]{3,16}$/.test(username)) {
    return "El nombre debe tener 3-16 caracteres (letras, números o _).";
  }
  if (RESERVED.has(username)) return "Ese nombre está reservado.";
  return null;
}

export function validatePassword(password: string): string | null {
  if (typeof password !== "string" || password.length < 4 || password.length > 64) {
    return "La contraseña debe tener entre 4 y 64 caracteres.";
  }
  return null;
}

// ====== cuenta del propietario (se crea sola la primera vez) ======
export async function ensureOwnerAccount() {
  const existing = await db.account.findUnique({ where: { username: OWNER_USERNAME } });
  if (existing) {
    // v204 EL ESCUDO: si OWNER_PASSWORD está definido en el entorno, el
    // entorno manda — la cuenta del DUEÑO se resincroniza (solo escribe si
    // la contraseña cambió de verdad).
    const desdeEntorno = process.env.OWNER_PASSWORD;
    if (desdeEntorno && !verifyPassword(desdeEntorno, existing.passHash)) {
      try {
        return await db.account.update({
          where: { username: OWNER_USERNAME },
          data: { passHash: hashPassword(desdeEntorno) },
        });
      } catch {
        return existing; // la base no coopera: seguimos con lo que hay
      }
    }
    return existing;
  }
  return db.account.create({
    data: {
      username: OWNER_USERNAME,
      passHash: hashPassword(OWNER_PASSWORD),
      isOwner: true,
    },
  });
}

export interface AccountPublic {
  username: string;
  isOwner: boolean;
}

export function publicAccount(a: { username: string; isOwner: boolean }): AccountPublic {
  return { username: a.username, isOwner: a.isOwner };
}

// v207.0 INFINITO — EL DUEÑO ES ILIMITADO: la sesión firmada del propietario
// cruza los muros anti-flood (los muros existen para el spam, no para su rey).
// Acepta Request normal (lee la cabecera cookie) y NextRequest (req.cookies).
export function sesionDuenoReq(req: Request): boolean {
  try {
    const viaObjeto = (req as Request & { cookies?: { get?: (n: string) => { value?: string } | undefined } }).cookies;
    const cruda = viaObjeto?.get?.(SESSION_COOKIE)?.value;
    const token =
      cruda ??
      (req.headers
        .get("cookie")
        ?.split(";")
        .map((c) => c.trim())
        .find((c) => c.startsWith(`${SESSION_COOKIE}=`))
        ?.slice(SESSION_COOKIE.length + 1) ??
        undefined);
    if (!token) return false;
    return verifySessionToken(decodeURIComponent(token)) === OWNER_USERNAME;
  } catch {
    return false;
  }
}
