// v406.1 · LA FORJA — capa de servidor (SOLO SERVIDOR).
//
// · Identidad: la sesión firmada de la casa (vg_session, v15/v204). El autor
//   de una obra, de un comentario o de una valoración es SIEMPRE el alias de
//   la sesión — nunca un nombre que mande el navegador.
// · Tablas nuevas con asegurarTabla (v127): versiones, colecciones, reportes,
//   roles y bitácora. custom.db no se toca; en una base nueva nacen solas.
// · La obra es un UgcItem (v26) con specs.forja = 1.
import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import { asegurarTabla } from "@/lib/db-ddl";
import { verifySessionToken, SESSION_COOKIE, OWNER_USERNAME } from "@/lib/auth-server";
import { rolEfectivo, puede, type Rol, type Accion } from "./permisos";
import type { Datos } from "./tipos";

export const nuevoId = () => randomBytes(9).toString("base64url");

// ───────── sesión y rol
function tokenDe(req: Request): string | undefined {
  const c = req.headers.get("cookie") ?? "";
  const par = c
    .split(";")
    .map((x) => x.trim())
    .find((x) => x.startsWith(`${SESSION_COOKIE}=`));
  return par ? decodeURIComponent(par.slice(SESSION_COOKIE.length + 1)) : undefined;
}

/** la casa tiene su propio secreto de sesión (o estamos fuera de producción) */
export function secretoPropio(): boolean {
  return !!process.env.AUTH_SECRET || process.env.NODE_ENV !== "production";
}

/** ¿la base sobrevive a un reinicio? En Vercel la SQLite vive copiada en /tmp (v183.1) */
export function almacenDuradero(): boolean {
  return !process.env.VERCEL;
}

export type Quien = { alias: string | null; rol: Rol; secreto: boolean };

export async function quien(req: Request): Promise<Quien> {
  const alias = verifySessionToken(tokenDe(req));
  const secreto = secretoPropio();
  if (!alias) return { alias: null, rol: "visitante", secreto };
  let guardado: string | null = null;
  try {
    await asegurarTablas();
    const r = await db.$queryRawUnsafe<{ rol: string }[]>(`SELECT rol FROM CreadorRol WHERE alias = ?`, alias);
    guardado = r[0]?.rol ?? null;
  } catch {
    /* sin tabla: creador normal */
  }
  return { alias, rol: rolEfectivo(alias, guardado, alias === OWNER_USERNAME), secreto };
}

export function permite(q: Quien, a: Accion) {
  return puede(q.rol, a, q.secreto);
}

export async function rolDe(alias: string): Promise<Rol> {
  if (alias === OWNER_USERNAME) return "dueno";
  try {
    await asegurarTablas();
    const r = await db.$queryRawUnsafe<{ rol: string }[]>(`SELECT rol FROM CreadorRol WHERE alias = ?`, alias);
    return rolEfectivo(alias, r[0]?.rol ?? null, false);
  } catch {
    return "creador";
  }
}

// ───────── tablas propias
let listas: Promise<void> | null = null;
export function asegurarTablas(): Promise<void> {
  if (!listas) {
    listas = (async () => {
      await asegurarTabla(
        "CreadorVersion",
        `CREATE TABLE IF NOT EXISTS CreadorVersion (id TEXT PRIMARY KEY, itemId TEXT NOT NULL, n INTEGER NOT NULL, titulo TEXT NOT NULL, resumen TEXT NOT NULL DEFAULT '', cuerpo TEXT NOT NULL DEFAULT '', datos TEXT NOT NULL DEFAULT '{}', nota TEXT NOT NULL DEFAULT '', autor TEXT NOT NULL, estado TEXT NOT NULL DEFAULT 'APROBADO', creada BIGINT NOT NULL)`
      );
      await asegurarTabla(
        "CreadorColeccion",
        `CREATE TABLE IF NOT EXISTS CreadorColeccion (id TEXT PRIMARY KEY, dueno TEXT NOT NULL, titulo TEXT NOT NULL, descripcion TEXT NOT NULL DEFAULT '', publica INTEGER NOT NULL DEFAULT 1, creada BIGINT NOT NULL, actualizada BIGINT NOT NULL)`
      );
      await asegurarTabla(
        "CreadorColeccionObra",
        `CREATE TABLE IF NOT EXISTS CreadorColeccionObra (coleccionId TEXT NOT NULL, itemId TEXT NOT NULL, agregada BIGINT NOT NULL, PRIMARY KEY (coleccionId, itemId))`
      );
      await asegurarTabla(
        "CreadorReporte",
        `CREATE TABLE IF NOT EXISTS CreadorReporte (id TEXT PRIMARY KEY, objetivo TEXT NOT NULL, itemId TEXT NOT NULL, reporta TEXT NOT NULL, motivo TEXT NOT NULL, detalle TEXT NOT NULL DEFAULT '', creada BIGINT NOT NULL, resuelto INTEGER NOT NULL DEFAULT 0, UNIQUE (objetivo, reporta))`
      );
      await asegurarTabla(
        "CreadorRol",
        `CREATE TABLE IF NOT EXISTS CreadorRol (alias TEXT PRIMARY KEY, rol TEXT NOT NULL, por TEXT NOT NULL, motivo TEXT NOT NULL DEFAULT '', actualizada BIGINT NOT NULL)`
      );
      await asegurarTabla(
        "CreadorBitacora",
        `CREATE TABLE IF NOT EXISTS CreadorBitacora (id TEXT PRIMARY KEY, actor TEXT NOT NULL, accion TEXT NOT NULL, objetivo TEXT NOT NULL, motivo TEXT NOT NULL DEFAULT '', antes TEXT NOT NULL DEFAULT '', despues TEXT NOT NULL DEFAULT '', creada BIGINT NOT NULL)`
      );
    })().catch((e) => {
      listas = null; // el próximo intento vuelve a probar
      throw e;
    });
  }
  return listas;
}

// ───────── la obra (UgcItem con specs.forja)
export type Specs = { forja: 1; datos: Datos; etiquetas: string[]; v: number; destacada?: boolean };

export function leerSpecs(s: string | null | undefined): Specs | null {
  try {
    const o = JSON.parse(s || "{}");
    return o && o.forja === 1 ? (o as Specs) : null;
  } catch {
    return null;
  }
}

type FilaUgc = {
  id: string;
  kind: string;
  author: string;
  title: string;
  summary: string;
  body: string;
  specs: string;
  status: string;
  aiVerdict: string;
  aiReason: string;
  likes: number;
  plays: number;
  ratingSum: number;
  ratingCount: number;
  createdAt: Date;
};

export type ObraPublica = {
  id: string;
  clase: string;
  autor: string;
  titulo: string;
  resumen: string;
  cuerpo?: string;
  datos?: Datos;
  etiquetas: string[];
  version: number;
  destacada: boolean;
  estado: string;
  valoracion: { suma: number; n: number };
  vistas: number;
  creada: number;
  motivoModeracion?: string;
};

export function aObra(f: FilaUgc, completa = false): ObraPublica | null {
  const s = leerSpecs(f.specs);
  if (!s) return null;
  return {
    id: f.id,
    clase: f.kind,
    autor: f.author,
    titulo: f.title,
    resumen: f.summary,
    ...(completa ? { cuerpo: f.body, datos: s.datos } : {}),
    etiquetas: s.etiquetas ?? [],
    version: s.v ?? 1,
    destacada: !!s.destacada,
    estado: f.status,
    valoracion: { suma: f.ratingSum, n: f.ratingCount },
    vistas: f.plays,
    creada: new Date(f.createdAt).getTime(),
  };
}

export async function registrarBitacora(actor: string, accion: string, objetivo: string, motivo: string, antes = "", despues = "") {
  try {
    await asegurarTablas();
    await db.$executeRawUnsafe(
      `INSERT INTO CreadorBitacora (id, actor, accion, objetivo, motivo, antes, despues, creada) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      nuevoId(),
      actor,
      accion,
      objetivo,
      motivo,
      antes,
      despues,
      Date.now()
    );
  } catch (e) {
    console.error("forja bitácora", e);
  }
}

/** aviso al autor en la campana de la casa (ContribNotification, v23) */
export async function avisar(alias: string, title: string, body: string, icon = "⚒️") {
  try {
    await db.contribNotification.create({ data: { alias, title: title.slice(0, 120), body: body.slice(0, 400), icon } });
  } catch {
    /* sin campana: no rompe la acción */
  }
}

export const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
