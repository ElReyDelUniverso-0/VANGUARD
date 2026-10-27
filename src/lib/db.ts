import fs from "fs"
import path from "path"
import { PrismaClient } from '@prisma/client'

// v183.1 EL RELEVO — LA BD RESPIRA EN VERCEL:
// la casa corre con SQLite (db/custom.db, 38 modelos, comprometida al repo),
// pero en Vercel el filesystem del lambda es DE SOLO LECTURA y el .env no
// viaja (gitignored): DATABASE_URL no existe allí o apunta a un camino que
// el motor no puede abrir → /api/health reportaba db:"down" y las 48 rutas
// API vivían en fail-soft para siempre. Cura sin servicios externos, fiel a
// la casa SQLite:
//   ① BUSCAR el archivo real: la ruta de DATABASE_URL (los file: relativos
//      se resuelven contra cwd/prisma y cwd, como hace Prisma contra el
//      schema) o los candidatos canónicos db/custom.db y prisma/db/custom.db.
//   ② si el archivo es ESCRIBIBLE (casa local) → se usa tal cual: cero cambio.
//   ③ si es de SOLO LECTURA o no abrible (Vercel) → se copia a /tmp (el único
//      rincón escribible del lambda) y el cliente apunta allí: la BD despierta
//      de verdad (db:"up") con los datos del repo.
//   ④ si no hay archivo → cliente como siempre: las rutas siguen en fail-soft
//      honesto (nunca colgar el boot).
// Ephemeral honesto: cada instancia del lambda tiene su copia — lo comunitario
// vive por-instancia mientras el progreso real del piloto vive en localStorage
// (ley de la casa desde v27).

function primeraExistente(rutas: string[]): string | null {
  for (const r of rutas) {
    try {
      const abs = path.resolve(r)
      if (fs.existsSync(abs) && fs.statSync(abs).size > 0) return abs
    } catch {
      // candidato muerto, siguiente
    }
  }
  return null
}

function resolverDbUrl(): string | undefined {
  try {
    const envUrl = process.env.DATABASE_URL
    const candidatos: string[] = []
    if (envUrl && envUrl.startsWith("file:")) {
      const rel = envUrl.slice(5)
      // Prisma resuelve los file: relativos contra el DIRECTORIO DEL SCHEMA
      candidatos.push(path.join(process.cwd(), "prisma", rel))
      candidatos.push(rel)
    }
    candidatos.push(path.join(process.cwd(), "db", "custom.db"))
    candidatos.push(path.join(process.cwd(), "prisma", "db", "custom.db"))
    const archivo = primeraExistente(candidatos)
    if (!archivo) return undefined

    try {
      fs.accessSync(archivo, fs.constants.W_OK)
      return `file:${archivo}` // casa local: escribible, tal cual
    } catch {
      // Vercel: read-only → copia escribible en /tmp (una vez por instancia)
      const destino = "/tmp/vanguard-custom.db"
      try {
        if (!fs.existsSync(destino) || fs.statSync(destino).size === 0) {
          fs.copyFileSync(archivo, destino)
        }
        // la copia hereda el modo del original (p.ej. 444) y SQLite necesita
        // escribir WAL/journal: la copia SIEMPRE se vuelve escribible
        try {
          fs.chmodSync(destino, 0o644)
        } catch {
          // chmod fallido (FS exótico): el fail-soft de las rutas cubre
        }
        return `file:${destino}`
      } catch {
        return undefined // sin /tmp no hay milagro: fail-soft de siempre
      }
    }
  } catch {
    return undefined
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const urlResuelta = resolverDbUrl()

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    // v27 ESTABILIDAD: log de queries desactivado (llenaba el log y frenaba el server
    // en sesiones largas) — solo errores. WAL + busy_timeout evitan "database is locked"
    // cuando varios paneles poll-ean a la vez.
    log: ['error', 'warn'],
    ...(urlResuelta ? { datasources: { db: { url: urlResuelta } } } : {}),
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
