// Vanguard v15 — Autenticación de cuentas (SOLO SERVIDOR).
// scrypt para contraseñas, cookie de sesión firmada con HMAC-SHA256,
// y cuenta del PROPIETARIO (DUENO) con acceso total pre-creada.
import { scryptSync, randomBytes, timingSafeEqual, createHmac } from "crypto";
import { db } from "@/lib/db";

const SECRET = process.env.AUTH_SECRET ?? "vanguard-launch-2026-secreto-del-comandante";
export const SESSION_COOKIE = "vg_session";
export const SESSION_DAYS = 30;

// Cuenta del propietario: TODO desbloqueado + dinero infinito.
export const OWNER_USERNAME = "DUENO";
export const OWNER_PASSWORD = process.env.OWNER_PASSWORD ?? "vanguard2026";

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
  if (sign(payload) !== sig) return null;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < Date.now()) return null;
  return username;
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
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
  if (existing) return existing;
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
