// ═══════════════════════════════════════════════════════════════════
// v421.8 · MY UNIVERSE — EL ALMACÉN (y por qué es local)
//
// LO QUE SE MIDIÓ ANTES DE ESCRIBIR ESTO (2026-11-20):
//   · Hay autenticación real: cookie `vg_session` firmada con HMAC, modelo
//     `Account` en Prisma, /api/auth/{register,login,me,save}.
//   · Pero la base de producción NO es duradera: `src/lib/db.ts` sirve SQLite
//     comprometida en el repo y, como el filesystem del lambda en Vercel es de
//     SOLO LECTURA, la copia a /tmp — y /tmp es por instancia. Cada arranque en
//     frío vuelve al archivo del repo. El `saveJson` de las cuentas vive ahí.
//
// POR ESO: el espacio personal se guarda en ESTE DISPOSITIVO, con una clave
// por cuenta (`vx421-my-universo:<USUARIO>`), y se puede exportar a un archivo
// para llevarlo a otro sitio. NO se dice «guardado en la nube» en ningún
// estado de la interfaz, porque no lo está. `/api/mi-universo` existe para
// decir la verdad y para que el día que haya base durable solo cambie un flag.
//
// Lo que sí se puede prometer: nada se pierde por cerrar el navegador, dos
// cuentas en el mismo aparato no se mezclan, un invitado puede reclamar su
// espacio al registrarse, y un JSON roto no puede romper nada (se valida).
// ═══════════════════════════════════════════════════════════════════
import {
  CLAVE_LOCAL,
  MAX_PIEZAS,
  espacioNuevo,
  deserializar,
  serializar,
  type Espacio,
} from "./modelo";

export type Origen = "dispositivo" | "nuevo" | "legado";

export type Capacidad = {
  /** ¿hay sesión de cuenta en este navegador? */
  autenticado: boolean;
  usuario: string | null;
  /** ¿el servidor puede guardar de forma DURADERA? (medido, no prometido) */
  nube: boolean;
  motivo: string;
  detalle: string;
};

const hayVentana = (): boolean => typeof window !== "undefined" && !!window.localStorage;

/** Un espacio por cuenta en este aparato: dos cuentas no se mezclan. */
export const claveDe = (usuario: string | null): string =>
  `${CLAVE_LOCAL}:${(usuario ?? "invitado").toUpperCase()}`;

export type Cargado = { espacio: Espacio; origen: Origen; guardado: string | null };

/** Lee del aparato. Si no hay nada válido, devuelve un espacio nuevo vacío. */
export function cargar(usuario: string | null, clavesIniciales: string[]): Cargado {
  if (!hayVentana()) return { espacio: espacioNuevo("Mi universo", clavesIniciales), origen: "nuevo", guardado: null };
  try {
    const crudo = window.localStorage.getItem(claveDe(usuario));
    if (!crudo) {
      // el invitado hereda lo que hubiera guardado antes de que existieran las
      // cuentas en este aparato (nada se tira)
      const previo = window.localStorage.getItem(CLAVE_LOCAL);
      const rescatado = previo ? deserializar(previo) : null;
      if (rescatado) return { espacio: rescatado, origen: "legado", guardado: previo ? "heredado" : null };
      return { espacio: espacioNuevo("Mi universo", clavesIniciales), origen: "nuevo", guardado: null };
    }
    const espacio = deserializar(crudo);
    if (!espacio) return { espacio: espacioNuevo("Mi universo", clavesIniciales), origen: "nuevo", guardado: null };
    return { espacio, origen: "dispositivo", guardado: crudo };
  } catch {
    return { espacio: espacioNuevo("Mi universo", clavesIniciales), origen: "nuevo", guardado: null };
  }
}

export type ResultadoGuardado = { ok: boolean; bytes: number; cuando: string; error?: string };

/** Escribe en el aparato. Devuelve cuántos bytes y cuándo, para poder decirlo. */
export function guardar(usuario: string | null, espacio: Espacio): ResultadoGuardado {
  const cuando = new Date().toISOString();
  if (!hayVentana()) return { ok: false, bytes: 0, cuando, error: "sin almacenamiento en este contexto" };
  try {
    const texto = serializar({ ...espacio, actualizado: cuando });
    if (espacio.nucleos[espacio.activo]?.piezas.length > MAX_PIEZAS) {
      return { ok: false, bytes: 0, cuando, error: "demasiadas piezas" };
    }
    window.localStorage.setItem(claveDe(usuario), texto);
    return { ok: true, bytes: texto.length, cuando };
  } catch (e) {
    // cuota llena o modo privado: se dice, no se finge
    return { ok: false, bytes: 0, cuando, error: e instanceof Error ? e.message : "no se pudo guardar" };
  }
}

export function borrar(usuario: string | null): void {
  if (!hayVentana()) return;
  try {
    window.localStorage.removeItem(claveDe(usuario));
  } catch {
    /* nada que hacer */
  }
}

/**
 * RECLAMAR — al entrar con una cuenta, el espacio de invitado de este aparato
 * pasa a la cuenta si la cuenta todavía no tiene el suyo. Nunca sobrescribe.
 */
export function reclamar(usuario: string | null): boolean {
  if (!hayVentana() || !usuario) return false;
  try {
    const cuenta = window.localStorage.getItem(claveDe(usuario));
    if (cuenta) return false;
    const invitado = window.localStorage.getItem(claveDe(null));
    if (!invitado || !deserializar(invitado)) return false;
    window.localStorage.setItem(claveDe(usuario), invitado);
    return true;
  } catch {
    return false;
  }
}

/** ¿Quién soy y puede el servidor guardar de verdad? Pregunta a la casa. */
export async function capacidad(): Promise<Capacidad> {
  try {
    const r = await fetch("/api/mi-universo", { cache: "no-store" });
    if (!r.ok) throw new Error(String(r.status));
    const j = (await r.json()) as Partial<Capacidad>;
    return {
      autenticado: j.autenticado === true,
      usuario: typeof j.usuario === "string" ? j.usuario : null,
      nube: j.nube === true,
      motivo: typeof j.motivo === "string" ? j.motivo : "",
      detalle: typeof j.detalle === "string" ? j.detalle : "",
    };
  } catch {
    return {
      autenticado: false,
      usuario: null,
      nube: false,
      motivo: "no se pudo preguntar",
      detalle: "La casa no respondió a la comprobación de almacenamiento; se usa este dispositivo.",
    };
  }
}

/** Exportar: un archivo con el espacio entero, para llevarlo a otro aparato. */
export function descargarArchivo(espacio: Espacio, usuario: string | null): string {
  const nombre = `mi-universo-${(usuario ?? "invitado").toLowerCase()}-${new Date().toISOString().slice(0, 10)}.json`;
  const texto = serializar(espacio);
  if (typeof window !== "undefined") {
    const url = URL.createObjectURL(new Blob([texto], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = nombre;
    a.click();
    URL.revokeObjectURL(url);
  }
  return nombre;
}

/** Importar: se valida con el mismo deserializador que el guardado local. */
export const leerArchivo = (texto: string): Espacio | null => deserializar(texto);

export const bytesDe = (espacio: Espacio): number => serializar(espacio).length;
