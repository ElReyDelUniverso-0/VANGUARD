// ============================================================
// v415.0 · VANGUARD SEARCH OPPORTUNITIES — el cliente de Search Console
// (SOLO SERVIDOR · cero dependencias nuevas: firma RS256 con node:crypto)
//
// API oficial: https://developers.google.com/webmaster-tools/v1/searchanalytics/query
//   POST https://searchconsole.googleapis.com/webmasters/v3/sites/{siteUrl}/searchAnalytics/query
//   alcance de solo lectura: https://www.googleapis.com/auth/webmasters.readonly
//   ≤ 25.000 filas por petición (se pagina con startRow) · datos con 2–3 días
//   de retraso · las consultas poco frecuentes llegan anonimizadas (no salen
//   como fila, pero sí suman en los totales por página).
//
// DOS FORMAS DE AUTORIZAR (variables de entorno de Vercel, nunca en el repo):
//   A) Cuenta de servicio (recomendada para un servidor):
//        GSC_SERVICE_ACCOUNT_JSON  → el JSON de la clave tal cual, o en base64
//      o bien  GSC_CLIENT_EMAIL + GSC_PRIVATE_KEY
//      (el correo de la cuenta de servicio se añade como usuario de la
//       propiedad en Search Console → Configuración → Usuarios y permisos).
//   B) OAuth con la cuenta de Google del Dueño:
//        GSC_OAUTH_CLIENT_ID + GSC_OAUTH_CLIENT_SECRET + GSC_OAUTH_REFRESH_TOKEN
//   Propiedad: GSC_SITE_URL (por defecto la casa oficial con barra final, que
//   es la propiedad «prefijo de URL» verificada con la meta de layout.tsx;
//   para una propiedad de dominio: «sc-domain:ejemplo.com»).
//
// SEGURIDAD: este módulo NUNCA devuelve, registra ni concatena el valor de una
// credencial. `configuracion()` solo dice QUÉ variables existen (booleanos).
// ============================================================

import { createSign } from "node:crypto";
import { CASA_OFICIAL } from "@/lib/site";
import type { FilaConsultaPagina, FilaPagina, Totales } from "./tipos";

export const ALCANCE = "https://www.googleapis.com/auth/webmasters.readonly";
const URL_INTERCAMBIO_GOOGLE = "https://oauth2.googleapis.com/token";
const URL_API = "https://searchconsole.googleapis.com/webmasters/v3";
export const MAX_FILAS_POR_PETICION = 25_000;

export type ModoCredencial = "cuenta-servicio" | "oauth";

export interface Configuracion {
  lista: boolean;
  modo: ModoCredencial | null;
  sitio: string;
  /** variables presentes (solo nombres) */
  presentes: string[];
  /** lo que falta para poder conectar */
  faltan: string[];
  /** correo de la cuenta de servicio, enmascarado (para saber cuál añadir) */
  cuentaServicio: string | null;
  /** problema de formato detectado sin llamar a Google */
  aviso: string | null;
}

const VARS = [
  "GSC_SERVICE_ACCOUNT_JSON",
  "GSC_CLIENT_EMAIL",
  "GSC_PRIVATE_KEY",
  "GSC_OAUTH_CLIENT_ID",
  "GSC_OAUTH_CLIENT_SECRET",
  "GSC_OAUTH_REFRESH_TOKEN",
  "GSC_SITE_URL",
] as const;

function env(nombre: (typeof VARS)[number]): string {
  return (process.env[nombre] ?? "").trim();
}

interface CuentaServicio {
  email: string;
  clave: string;
}

/** Lee la cuenta de servicio de cualquiera de sus dos formas. Nunca lanza con el valor dentro. */
function leerCuentaServicio(): { cuenta: CuentaServicio | null; aviso: string | null } {
  const crudo = env("GSC_SERVICE_ACCOUNT_JSON");
  if (crudo) {
    let texto = crudo;
    if (!texto.startsWith("{")) {
      try {
        texto = Buffer.from(texto, "base64").toString("utf8");
      } catch {
        return { cuenta: null, aviso: "GSC_SERVICE_ACCOUNT_JSON no es JSON ni base64 válido." };
      }
    }
    try {
      const j = JSON.parse(texto) as { client_email?: string; private_key?: string };
      if (!j.client_email || !j.private_key) {
        return { cuenta: null, aviso: "GSC_SERVICE_ACCOUNT_JSON no trae client_email y private_key." };
      }
      return { cuenta: { email: j.client_email, clave: j.private_key.replace(/\\n/g, "\n") }, aviso: null };
    } catch {
      return { cuenta: null, aviso: "GSC_SERVICE_ACCOUNT_JSON no se pudo leer como JSON." };
    }
  }
  const email = env("GSC_CLIENT_EMAIL");
  const clave = env("GSC_PRIVATE_KEY").replace(/\\n/g, "\n");
  if (email && clave) {
    if (!clave.includes("PRIVATE KEY")) return { cuenta: null, aviso: "GSC_PRIVATE_KEY no tiene formato PEM (la cabecera «BEGIN … PRIVATE KEY» entre guiones, tal como viene en el JSON de Google)." };
    return { cuenta: { email, clave }, aviso: null };
  }
  return { cuenta: null, aviso: null };
}

function enmascarar(email: string): string {
  const [u, d] = email.split("@");
  if (!d) return "***";
  return `${u.slice(0, 4)}…@${d}`;
}

export function sitioConfigurado(): string {
  return env("GSC_SITE_URL") || `${CASA_OFICIAL.replace(/\/+$/, "")}/`;
}

export function configuracion(): Configuracion {
  const presentes = VARS.filter((v) => env(v) !== "");
  const { cuenta, aviso } = leerCuentaServicio();
  const oauth = !!(env("GSC_OAUTH_CLIENT_ID") && env("GSC_OAUTH_CLIENT_SECRET") && env("GSC_OAUTH_REFRESH_TOKEN"));
  const modo: ModoCredencial | null = cuenta ? "cuenta-servicio" : oauth ? "oauth" : null;
  const faltan: string[] = [];
  if (!modo) {
    faltan.push("GSC_SERVICE_ACCOUNT_JSON (o GSC_CLIENT_EMAIL + GSC_PRIVATE_KEY)");
    faltan.push("— o bien — GSC_OAUTH_CLIENT_ID + GSC_OAUTH_CLIENT_SECRET + GSC_OAUTH_REFRESH_TOKEN");
  }
  return {
    lista: modo !== null,
    modo,
    sitio: sitioConfigurado(),
    presentes: [...presentes],
    faltan,
    cuentaServicio: cuenta ? enmascarar(cuenta.email) : null,
    aviso,
  };
}

// ── errores legibles ────────────────────────────────────────────

export class ErrorGoogle extends Error {
  constructor(
    public paso: "token" | "api",
    public estado: number,
    mensaje: string,
    public motivoGoogle: string | null
  ) {
    super(mensaje);
  }
}

function explicar(paso: "token" | "api", estado: number, motivo: string | null): string {
  const m = (motivo ?? "").toLowerCase();
  if (paso === "token") {
    if (m.includes("invalid_grant")) return "Google rechazó la credencial (invalid_grant): la clave está revocada, el reloj no cuadra o el refresh token caducó.";
    if (m.includes("invalid_client") || m.includes("unauthorized_client")) return "Google no reconoce el cliente OAuth / la cuenta de servicio (invalid_client).";
    return `Google no entregó el token de acceso (HTTP ${estado}).`;
  }
  if (estado === 401) return "El token no sirve para Search Console (HTTP 401).";
  if (estado === 403) {
    if (m.includes("has not been used") || m.includes("disabled")) return "La API de Google Search Console no está activada en el proyecto de Google Cloud (HTTP 403).";
    return "La credencial no tiene permiso sobre esa propiedad (HTTP 403): añade el correo de la cuenta de servicio como usuario en Search Console → Configuración → Usuarios y permisos.";
  }
  if (estado === 404) return "Esa propiedad no existe para esta credencial (HTTP 404): revisa GSC_SITE_URL (barra final, http/https, o «sc-domain:»).";
  if (estado === 429) return "Cuota de la API agotada por ahora (HTTP 429).";
  return `Search Console respondió HTTP ${estado}.`;
}

async function leerMotivo(r: Response): Promise<string | null> {
  try {
    const j = (await r.json()) as { error?: string | { message?: string; status?: string }; error_description?: string };
    if (typeof j.error === "string") return `${j.error}${j.error_description ? `: ${j.error_description}` : ""}`.slice(0, 240);
    if (j.error && typeof j.error === "object") return `${j.error.status ?? ""} ${j.error.message ?? ""}`.trim().slice(0, 240);
  } catch {
    /* sin cuerpo JSON */
  }
  return null;
}

// ── token ───────────────────────────────────────────────────────

let TOKEN: { valor: string; expira: number } | null = null;

function b64url(x: Buffer | string): string {
  return Buffer.from(x).toString("base64").replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
}

/** JWT RS256 de la cuenta de servicio (RFC 7523), firmado con node:crypto. */
export function firmarJwt(email: string, clavePem: string, ahoraS = Math.floor(Date.now() / 1000)): string {
  const cabecera = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const cuerpo = b64url(JSON.stringify({ iss: email, scope: ALCANCE, aud: URL_INTERCAMBIO_GOOGLE, iat: ahoraS, exp: ahoraS + 3600 }));
  const firmador = createSign("RSA-SHA256");
  firmador.update(`${cabecera}.${cuerpo}`);
  return `${cabecera}.${cuerpo}.${b64url(firmador.sign(clavePem))}`;
}

async function pedirToken(cuerpo: URLSearchParams): Promise<string> {
  const r = await fetch(URL_INTERCAMBIO_GOOGLE, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: cuerpo.toString(),
    signal: AbortSignal.timeout(12_000),
    cache: "no-store",
  });
  if (!r.ok) {
    const motivo = await leerMotivo(r);
    throw new ErrorGoogle("token", r.status, explicar("token", r.status, motivo), motivo);
  }
  const j = (await r.json()) as { access_token?: string; expires_in?: number };
  if (!j.access_token) throw new ErrorGoogle("token", r.status, "Google respondió sin access_token.", null);
  TOKEN = { valor: j.access_token, expira: Date.now() + Math.max(60, (j.expires_in ?? 3600) - 120) * 1000 };
  return j.access_token;
}

export async function tokenDeAcceso(): Promise<string> {
  if (TOKEN && TOKEN.expira > Date.now()) return TOKEN.valor;
  const { cuenta } = leerCuentaServicio();
  if (cuenta) {
    return pedirToken(
      new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: firmarJwt(cuenta.email, cuenta.clave) })
    );
  }
  if (env("GSC_OAUTH_CLIENT_ID") && env("GSC_OAUTH_CLIENT_SECRET") && env("GSC_OAUTH_REFRESH_TOKEN")) {
    return pedirToken(
      new URLSearchParams({
        grant_type: "refresh_token",
        client_id: env("GSC_OAUTH_CLIENT_ID"),
        client_secret: env("GSC_OAUTH_CLIENT_SECRET"),
        refresh_token: env("GSC_OAUTH_REFRESH_TOKEN"),
      })
    );
  }
  throw new ErrorGoogle("token", 0, "No hay credenciales de Search Console configuradas.", null);
}

// ── llamadas ────────────────────────────────────────────────────

async function llamar<T>(ruta: string, init: { method: "GET" | "POST"; cuerpo?: unknown }, intento = 0): Promise<T> {
  const token = await tokenDeAcceso();
  const r = await fetch(`${URL_API}${ruta}`, {
    method: init.method,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: init.cuerpo ? JSON.stringify(init.cuerpo) : undefined,
    signal: AbortSignal.timeout(25_000),
    cache: "no-store",
  });
  if (r.ok) return (await r.json()) as T;
  // solo se reintentan los fallos «de clima» (429/5xx); un 403 es configuración
  if ((r.status === 429 || r.status >= 500) && intento < 2) {
    await new Promise((res) => setTimeout(res, 800 * 2 ** intento));
    return llamar<T>(ruta, init, intento + 1);
  }
  if (r.status === 401) TOKEN = null;
  const motivo = await leerMotivo(r);
  throw new ErrorGoogle("api", r.status, explicar("api", r.status, motivo), motivo);
}

export interface SitioGoogle {
  siteUrl: string;
  permissionLevel: string;
}

/** Las propiedades que esta credencial puede leer. */
export async function listarSitios(): Promise<SitioGoogle[]> {
  const j = await llamar<{ siteEntry?: SitioGoogle[] }>("/sites", { method: "GET" });
  return j.siteEntry ?? [];
}

interface FilaApi {
  keys?: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface Periodo {
  inicio: string;
  fin: string;
  dias: number;
}

/** Periodo cerrado que termina hace 3 días (los últimos días aún no son finales). */
export function periodo(dias: number, hoy = new Date()): Periodo {
  const fin = new Date(Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth(), hoy.getUTCDate() - 3));
  const inicio = new Date(fin.getTime() - (dias - 1) * 86_400_000);
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  return { inicio: iso(inicio), fin: iso(fin), dias };
}

async function consultar(
  sitio: string,
  p: Periodo,
  dimensiones: ("query" | "page" | "date")[],
  maxFilas: number
): Promise<FilaApi[]> {
  const filas: FilaApi[] = [];
  let desde = 0;
  while (filas.length < maxFilas) {
    const limite = Math.min(MAX_FILAS_POR_PETICION, maxFilas - filas.length);
    const j = await llamar<{ rows?: FilaApi[] }>(`/sites/${encodeURIComponent(sitio)}/searchAnalytics/query`, {
      method: "POST",
      cuerpo: { startDate: p.inicio, endDate: p.fin, ...(dimensiones.length ? { dimensions: dimensiones } : {}), type: "web", rowLimit: limite, startRow: desde, dataState: "final" },
    });
    const lote = j.rows ?? [];
    filas.push(...lote);
    if (lote.length < limite || dimensiones.length === 0) break;
    desde += lote.length;
  }
  return filas;
}

export async function totalesDelSitio(sitio: string, p: Periodo): Promise<Totales> {
  const [f] = await consultar(sitio, p, [], 1);
  return f ? { clics: f.clicks, impresiones: f.impressions, ctr: f.ctr, posicion: f.position } : { clics: 0, impresiones: 0, ctr: 0, posicion: 0 };
}

export async function filasConsultaPagina(sitio: string, p: Periodo, maxFilas = 25_000): Promise<FilaConsultaPagina[]> {
  const filas = await consultar(sitio, p, ["query", "page"], maxFilas);
  return filas.map((f) => ({
    consulta: f.keys?.[0] ?? "",
    pagina: f.keys?.[1] ?? "",
    clics: f.clicks,
    impresiones: f.impressions,
    ctr: f.ctr,
    posicion: f.position,
  }));
}

export async function filasPorPagina(sitio: string, p: Periodo, maxFilas = 5_000): Promise<FilaPagina[]> {
  const filas = await consultar(sitio, p, ["page"], maxFilas);
  return filas.map((f) => ({ pagina: f.keys?.[0] ?? "", clics: f.clicks, impresiones: f.impressions, ctr: f.ctr, posicion: f.position }));
}
