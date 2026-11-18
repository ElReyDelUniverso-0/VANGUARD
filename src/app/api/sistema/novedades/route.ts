// v407.0 · GET /api/sistema/novedades — el sistema de actualizaciones
//
// Qué cambió (bitácora), cuántas puertas tiene la casa (censo) y qué se movió
// en las últimas 24 h por teatro (BD real). Si la BD no responde, lo dice: la
// novedad del producto no depende del archivo de noticias.
import { muro, claveCliente } from "@/lib/fortaleza";
import { ok, fallo, conManejo, cacheable } from "@/lib/sistema/contrato";
import { APP_VERSION, APP_CODENAME } from "@/lib/version";
import { BITACORA } from "@/lib/bitacora";
import { MODULOS_NUCLEO, CATEGORIAS_MODULO } from "@/lib/nucleo/registro";

export const dynamic = "force-dynamic";

export const GET = conManejo("/api/sistema/novedades", async (req, t0) => {
  const veredicto = muro(`sistema-nov:${claveCliente(req)}`, 30, 60_000);
  if (!veredicto.permitido) return fallo("MURO", `Demasiadas peticiones. Espera ${veredicto.espera} s.`, undefined, { t0 });

  const porCategoria = CATEGORIAS_MODULO.map((c) => ({
    categoria: c,
    modulos: MODULOS_NUCLEO.filter((m) => m.categoria === c).length,
  }));

  let senales: { teatro: string; n: number; ultimo: string | null }[] = [];
  let bdEstado = "sin consultar";
  try {
    const reloj = new Promise<never>((_, rechaza) =>
      setTimeout(() => rechaza(new Error("la base de datos no respondió en 3,5 s")), 3500)
    );
    const consulta = (async () => {
      const { db } = await import("@/lib/db");
      const desde = new Date(Date.now() - 24 * 3600_000);
      const filas = await db.newsItem.groupBy({
        by: ["conflictTag"],
        where: { publishedAt: { gte: desde } },
        _count: { _all: true },
        _max: { publishedAt: true },
      });
      return filas;
    })();
    const filas = (await Promise.race([consulta, reloj])) as {
      conflictTag: string | null;
      _count: { _all: number };
      _max: { publishedAt: Date | null };
    }[];
    senales = filas
      .filter((f) => !!f.conflictTag)
      .map((f) => ({
        teatro: String(f.conflictTag),
        n: f._count?._all ?? 0,
        ultimo: f._max?.publishedAt ? new Date(f._max.publishedAt).toISOString() : null,
      }))
      .sort((a, b) => b.n - a.n);
    bdEstado = "consultada";
  } catch (e) {
    bdEstado = e instanceof Error ? e.message.slice(0, 120) : "la base de datos no respondió";
  }

  return ok(
    {
      version: APP_VERSION,
      nombre: APP_CODENAME,
      bitacora: BITACORA.slice(0, 4).map((b) => ({ version: b.version, nombre: b.nombre, hitos: b.hitos.slice(0, 4) })),
      censo: { total: MODULOS_NUCLEO.length, porCategoria },
      senales,
      bdEstado,
      ventana: "24 h",
    },
    {
      t0,
      cabeceras: cacheable(60),
      nota:
        bdEstado === "consultada"
          ? "Señales reales del archivo de cables en las últimas 24 h."
          : "Las señales no están disponibles: se devuelve el resto de novedades sin inventar cifras.",
    }
  );
});
