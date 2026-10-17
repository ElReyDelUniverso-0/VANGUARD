import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    // v27 ESTABILIDAD: log de queries desactivado (llenaba el log y frenaba el server
    // en sesiones largas) — solo errores. WAL + busy_timeout evitan "database is locked"
    // cuando varios paneles poll-ean a la vez.
    log: ['error', 'warn'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// v27: aplicar pragmas SQLite una sola vez por proceso
let pragmasDone = false
export async function ensureDbPragmas(): Promise<void> {
  if (pragmasDone) return
  pragmasDone = true
  try {
    // v127.0: TODOS los PRAGMA con asignación devuelven una fila en SQLite
    // ("Execute returned results" en el canal de ejecución) — todo por queryRaw
    await db.$queryRawUnsafe("PRAGMA journal_mode=WAL")
    await db.$queryRawUnsafe("PRAGMA busy_timeout=5000")
    await db.$queryRawUnsafe("PRAGMA synchronous=NORMAL")
  } catch {
    // si falla (p.ej. migrando), no rompe el boot
  }
}

void ensureDbPragmas()
