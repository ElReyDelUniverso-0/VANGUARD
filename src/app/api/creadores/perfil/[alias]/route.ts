import { db } from "@/lib/db";
import { CLASES } from "@/lib/creadores/tipos";
import { insignias, fama, rango } from "@/lib/creadores/reconocimiento";
import { NOMBRE_ROL } from "@/lib/creadores/permisos";
import { quien, asegurarTablas, aObra, leerSpecs, rolDe, json, type ObraPublica } from "@/lib/creadores/servidor";

// v406.1 LA FORJA — la página de un creador: obras, colecciones, insignias, fama y rango.
// Todo se calcula de lo que la comunidad puede comprobar en la propia página.
// También cuenta lo que ese alias ya hizo en los estudios del cuartel (UgcItem sin forja).
export const dynamic = "force-dynamic";

export async function GET(req: Request, ctx: { params: Promise<{ alias: string }> }) {
  const alias = (await ctx.params).alias.toUpperCase().replace(/[^A-Z0-9_]/g, "").slice(0, 16);
  if (alias.length < 3) return json({ error: "Alias inválido." }, 400);
  try {
    await asegurarTablas();
    const q = await quien(req);
    const propio = q.alias === alias;
    const [filas, comentarios, cols, rol, otras] = await Promise.all([
      db.ugcItem.findMany({ where: { author: alias, kind: { in: [...CLASES] }, specs: { contains: '"forja":1' } }, orderBy: { createdAt: "desc" }, take: 200 }),
      db.ugcComment.count({ where: { author: alias, status: "APROBADO" } }),
      db.$queryRawUnsafe<{ id: string; titulo: string; descripcion: string; publica: number | bigint; obras: number | bigint }[]>(
        `SELECT c.id, c.titulo, c.descripcion, c.publica, (SELECT COUNT(*) FROM CreadorColeccionObra o WHERE o.coleccionId = c.id) AS obras FROM CreadorColeccion c WHERE c.dueno = ? ORDER BY c.actualizada DESC LIMIT 40`,
        alias
      ),
      rolDe(alias),
      db.ugcItem.groupBy({ by: ["kind"], where: { author: alias, status: "APROBADO", NOT: { specs: { contains: '"forja":1' } } }, _count: { kind: true } }),
    ]);
    const historial = {
      obras: filas.map((f) => {
        const s = leerSpecs(f.specs);
        return { clase: f.kind, estado: f.status, version: s?.v ?? 1, ratingSum: f.ratingSum, ratingCount: f.ratingCount, destacada: !!s?.destacada, fuentes: s?.datos?.fuentes?.length ?? 0, creada: f.createdAt.getTime() };
      }),
      comentariosAprobados: comentarios,
      coleccionesPublicas: cols.filter((c) => Number(c.publica) === 1).map((c) => ({ obras: Number(c.obras) })),
      rol,
    };
    const f = fama(historial);
    const visibles = filas.filter((x) => x.status === "APROBADO" || (propio && x.status !== "ELIMINADO"));
    const obras = visibles.map((x) => aObra(x)).filter((o): o is ObraPublica => !!o);
    const existe = filas.length > 0 || cols.length > 0 || comentarios > 0 || otras.length > 0 || propio;
    if (!existe) return json({ error: "Este creador todavía no ha publicado nada (o la base se reinició)." }, 404);
    return json({
      alias,
      rol,
      nombreRol: NOMBRE_ROL[rol],
      fama: f,
      rango: rango(f),
      insignias: insignias(historial),
      obras,
      colecciones: cols
        .filter((c) => propio || Number(c.publica) === 1)
        .map((c) => ({ id: c.id, titulo: c.titulo, descripcion: c.descripcion, publica: Number(c.publica) === 1, obras: Number(c.obras) })),
      cifras: {
        publicadas: historial.obras.filter((o) => o.estado === "APROBADO").length,
        valoraciones: historial.obras.reduce((s, o) => s + o.ratingCount, 0),
        estrellas: historial.obras.reduce((s, o) => s + o.ratingSum, 0),
        comentarios,
      },
      estudios: otras.map((o) => ({ clase: o.kind, n: o._count.kind })),
      propio,
    });
  } catch (e) {
    console.error("forja perfil", e);
    return json({ error: "El perfil no responde ahora mismo." }, 503);
  }
}
