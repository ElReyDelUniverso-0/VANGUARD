// v443.3 LA CASA LIGERA — caché incremental de OpenNext sobre D1.
//
// POR QUÉ: en *.workers.dev la Cache API de Cloudflare no guarda nada, así que
// las páginas ISR salían SIEMPRE «STALE» y se re-renderizaban en cada visita
// (y los 10 ms de CPU del plan gratis daban 503). D1 (gratis: 5 M lecturas y
// 100 k escrituras al día) guarda lo regenerado, comprimido con gzip.
//
// Lectura: D1 → si no hay, lo prerenderizado en el build (assets estáticos).
// Escritura: D1 (las filas llevan el id del build; las de builds viejos se
// barren de vez en cuando). Todo fallo es silencioso: nunca tumba una visita.
import { getCloudflareContext } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

type D1Like = {
  prepare(sql: string): {
    bind(...v: unknown[]): {
      first<T = Record<string, unknown>>(): Promise<T | null>;
      run(): Promise<unknown>;
    };
  };
};

const TABLA = "occache";
const MAX_BYTES = 1_900_000;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const base: any = staticAssetsIncrementalCache;

function d1(): D1Like | null {
  try {
    const env = getCloudflareContext().env as unknown as Record<string, unknown>;
    return (env.DB as D1Like) ?? null;
  } catch {
    return null;
  }
}

function buildId(): string {
  return process.env.OPEN_NEXT_BUILD_ID ?? process.env.NEXT_BUILD_ID ?? "sin-build";
}

async function gzip(texto: string): Promise<Uint8Array> {
  const s = new Blob([texto]).stream().pipeThrough(new CompressionStream("gzip"));
  return new Uint8Array(await new Response(s).arrayBuffer());
}

async function gunzip(bytes: Uint8Array): Promise<string> {
  const s = new Blob([bytes as unknown as BlobPart]).stream().pipeThrough(new DecompressionStream("gzip"));
  return await new Response(s).text();
}

function aBytes(v: unknown): Uint8Array | null {
  if (!v) return null;
  if (v instanceof Uint8Array) return v;
  if (v instanceof ArrayBuffer) return new Uint8Array(v);
  if (Array.isArray(v)) return new Uint8Array(v as number[]);
  return null;
}

class CacheD1 {
  // Mismo nombre que la caché de assets: así «populate-cache» sigue copiando
  // lo prerenderizado a los assets (que es nuestra reserva de lectura).
  name: string = base.name;

  async get(key: string, cacheType?: string) {
    const db = d1();
    if (db) {
      try {
        const fila = await db
          .prepare(`SELECT v, lm FROM ${TABLA} WHERE k = ?`)
          .bind(`${buildId()}|${cacheType ?? "cache"}|${key}`)
          .first<{ v: unknown; lm: number }>();
        const bytes = aBytes(fila?.v);
        if (fila && bytes) {
          return { value: JSON.parse(await gunzip(bytes)), lastModified: Number(fila.lm) };
        }
      } catch {
        // D1 caído o tabla ausente: se cae a lo prerenderizado
      }
    }
    return base.get(key, cacheType);
  }

  async set(key: string, value: unknown, cacheType?: string) {
    const db = d1();
    if (!db) return;
    try {
      const bytes = await gzip(JSON.stringify(value));
      if (bytes.byteLength > MAX_BYTES) return;
      const b = buildId();
      await db
        .prepare(`INSERT OR REPLACE INTO ${TABLA} (k, b, v, lm) VALUES (?, ?, ?, ?)`)
        .bind(`${b}|${cacheType ?? "cache"}|${key}`, b, bytes, Date.now())
        .run();
      if (Math.random() < 0.02) {
        await db.prepare(`DELETE FROM ${TABLA} WHERE b != ?`).bind(b).run();
      }
    } catch {
      // sin escritura no pasa nada: la próxima visita lo vuelve a intentar
    }
  }

  async delete(key: string) {
    const db = d1();
    if (!db) return;
    try {
      await db.prepare(`DELETE FROM ${TABLA} WHERE k LIKE ?`).bind(`%|${key}`).run();
    } catch {
      // silencioso
    }
  }
}

export default new CacheD1();
