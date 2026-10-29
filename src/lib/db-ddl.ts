import { db } from "@/lib/db";

// ============================================================
// v127.0 LA COMUNIDAD — EL ARREGLO DEL prisma:error
// "Raw query failed. Message: `Execute returned results, which
//  is not allowed in SQLite.`"
//
// El driver libsql que usa Prisma con SQLite devuelve un RESULT SET
// para algunos DDL (CREATE TABLE IF NOT EXISTS...) y Prisma lo rechaza
// en el canal de ejecución ($executeRaw*). El resultado: la primera
// visita tras un arranque en frío podía morir en ensureTable() y no
// contarse (respuesta de fallback ok:false).
//
// SOLUCIÓN: preguntar PRIMERO a sqlite_master (canal de consulta, que
// SÍ admite resultados) si la tabla ya existe — y solo lanzar el CREATE
// cuando de verdad falta. Si el CREATE tropieza con el quirk del driver,
// se verifica si aplicó; solo si la tabla sigue ausente se propaga.
// ============================================================

async function tablaExiste(nombre: string): Promise<boolean> {
  try {
    const rows = (await db.$queryRawUnsafe<{ name: string }[]>(
      `SELECT name FROM sqlite_master WHERE type='table' AND name='${nombre}'`
    )) as { name: string }[];
    return Array.isArray(rows) && rows.length > 0;
  } catch {
    return false;
  }
}

/**
 * Crea una tabla solo si falta, tolerando el quirk del driver libsql
 * ("Execute returned results" en DDL). Igual de idempotente que
 * CREATE TABLE IF NOT EXISTS pero sin ruido de prisma:error ni fallos
 * en frío.
 *
 * @param nombre  nombre de la tabla (solo alfanumérico y guion bajo)
 * @param ddl     el CREATE TABLE completo (se ejecuta una única vez)
 */
export async function asegurarTabla(nombre: string, ddl: string): Promise<void> {
  const segura = /^[A-Za-z_][A-Za-z0-9_]*$/.test(nombre);
  if (!segura) throw new Error(`nombre de tabla inválido: ${nombre}`);

  if (await tablaExiste(nombre)) return; // ya existe: cero trabajo, cero ruido

  try {
    await db.$executeRawUnsafe(ddl);
  } catch {
    // quirk del driver: verificar si el CREATE realmente aplicó
    if (!(await tablaExiste(nombre))) {
      throw new Error(`la tabla ${nombre} no pudo crearse`);
    }
  }
}
