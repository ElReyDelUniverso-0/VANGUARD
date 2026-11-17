import { db } from "@/lib/db";
import { muro, claveCliente, sanitizar, sanitizarLinea } from "@/lib/fortaleza";
import { LIM } from "@/lib/creadores/tipos";
import { quien, permite, asegurarTablas, nuevoId, aObra, leerSpecs, json, type ObraPublica } from "@/lib/creadores/servidor";

// v406.1 LA FORJA — colecciones: cualquier creador reúne obras (suyas o ajenas) en una lista con nombre.
// GET ?id=        → la colección + sus obras visibles
// GET ?dueno=     → las colecciones de un creador (las privadas solo para su dueño)
// GET             → las colecciones públicas más recientes
// POST { accion: "crear" | "editar" | "borrar" | "agregar" | "quitar", ... }
export const dynamic = "force-dynamic";

type FilaCol = { id: string; dueno: string; titulo: string; descripcion: string; publica: number | bigint; creada: number | bigint; actualizada: number | bigint; obras?: number | bigint };
const aCol = (c: FilaCol) => ({ id: c.id, dueno: c.dueno, titulo: c.titulo, descripcion: c.descripcion, publica: Number(c.publica) === 1, creada: Number(c.creada), actualizada: Number(c.actualizada), obras: Number(c.obras ?? 0) });

export async function GET(req: Request) {
  try {
    await asegurarTablas();
    const q = await quien(req);
    const u = new URL(req.url);
    const id = (u.searchParams.get("id") || "").slice(0, 20);
    const dueno = (u.searchParams.get("dueno") || "").toUpperCase().slice(0, 16);
    const CUENTA = `(SELECT COUNT(*) FROM CreadorColeccionObra o WHERE o.coleccionId = c.id) AS obras`;
    if (id) {
      const c = (await db.$queryRawUnsafe<FilaCol[]>(`SELECT c.*, ${CUENTA} FROM CreadorColeccion c WHERE c.id = ?`, id))[0];
      if (!c || (Number(c.publica) !== 1 && c.dueno !== q.alias)) return json({ error: "Esa colección no existe o es privada." }, 404);
      const ids = (await db.$queryRawUnsafe<{ itemId: string }[]>(`SELECT itemId FROM CreadorColeccionObra WHERE coleccionId = ? ORDER BY agregada DESC`, id)).map((r) => r.itemId);
      const filas = ids.length ? await db.ugcItem.findMany({ where: { id: { in: ids }, status: "APROBADO" } }) : [];
      const orden = new Map(ids.map((x, i) => [x, i]));
      const obras = filas
        .map((f) => aObra(f))
        .filter((o): o is ObraPublica => !!o)
        .sort((a, b) => (orden.get(a.id) ?? 0) - (orden.get(b.id) ?? 0));
      return json({ coleccion: aCol(c), obras, ocultas: ids.length - obras.length, esDueno: c.dueno === q.alias });
    }
    const filas = dueno
      ? await db.$queryRawUnsafe<FilaCol[]>(`SELECT c.*, ${CUENTA} FROM CreadorColeccion c WHERE c.dueno = ? ${dueno === q.alias ? "" : "AND c.publica = 1"} ORDER BY c.actualizada DESC LIMIT 60`, dueno)
      : await db.$queryRawUnsafe<FilaCol[]>(`SELECT c.*, ${CUENTA} FROM CreadorColeccion c WHERE c.publica = 1 ORDER BY c.actualizada DESC LIMIT 24`);
    return json({ colecciones: filas.map(aCol).filter((c) => dueno || c.obras > 0) });
  } catch (e) {
    console.error("forja colecciones GET", e);
    return json({ colecciones: [], error: "Las colecciones no responden ahora mismo." });
  }
}

export async function POST(req: Request) {
  const q = await quien(req);
  if (!q.alias) return json({ error: "Entra con tu cuenta para crear colecciones." }, 401);
  if (!permite(q, "coleccionar")) return json({ error: "Tu cuenta no puede crear colecciones." }, 403);
  if (!muro(`forja-col:${claveCliente(req)}`, 60, 60_000).permitido) return json({ error: "Demasiadas acciones seguidas." }, 429);
  let b: Record<string, unknown>;
  try {
    b = (await req.json()) as Record<string, unknown>;
  } catch {
    return json({ error: "Envío ilegible." }, 400);
  }
  try {
    await asegurarTablas();
    const accion = String(b.accion || "");
    const ahora = Date.now();
    if (accion === "crear") {
      const titulo = sanitizarLinea(b.titulo, LIM.coleccionTitulo);
      if (titulo.length < 3) return json({ error: "Ponle un nombre de al menos 3 caracteres." }, 400);
      const n = Number((await db.$queryRawUnsafe<{ n: number | bigint }[]>(`SELECT COUNT(*) AS n FROM CreadorColeccion WHERE dueno = ?`, q.alias))[0]?.n ?? 0);
      if (n >= 40) return json({ error: "Tienes 40 colecciones: borra alguna antes de crear otra." }, 409);
      const id = nuevoId();
      await db.$executeRawUnsafe(
        `INSERT INTO CreadorColeccion (id, dueno, titulo, descripcion, publica, creada, actualizada) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        id,
        q.alias,
        titulo,
        sanitizar(b.descripcion, LIM.coleccionDesc),
        b.publica === false ? 0 : 1,
        ahora,
        ahora
      );
      if (typeof b.itemId === "string") await agregar(id, b.itemId, ahora);
      return json({ ok: true, id, mensaje: "Colección creada." }, 201);
    }
    const id = String(b.id || "").slice(0, 20);
    const c = (await db.$queryRawUnsafe<{ dueno: string }[]>(`SELECT dueno FROM CreadorColeccion WHERE id = ?`, id))[0];
    if (!c) return json({ error: "Esa colección no existe." }, 404);
    if (c.dueno !== q.alias) return json({ error: "Solo su dueño puede cambiarla." }, 403);
    switch (accion) {
      case "editar": {
        const titulo = sanitizarLinea(b.titulo, LIM.coleccionTitulo);
        if (titulo.length < 3) return json({ error: "El nombre necesita 3 caracteres o más." }, 400);
        await db.$executeRawUnsafe(`UPDATE CreadorColeccion SET titulo = ?, descripcion = ?, publica = ?, actualizada = ? WHERE id = ?`, titulo, sanitizar(b.descripcion, LIM.coleccionDesc), b.publica === false ? 0 : 1, ahora, id);
        return json({ ok: true, mensaje: "Colección actualizada." });
      }
      case "borrar": {
        await db.$executeRawUnsafe(`DELETE FROM CreadorColeccionObra WHERE coleccionId = ?`, id);
        await db.$executeRawUnsafe(`DELETE FROM CreadorColeccion WHERE id = ?`, id);
        return json({ ok: true, mensaje: "Colección borrada. Las obras siguen intactas." });
      }
      case "agregar": {
        const r = await agregar(id, String(b.itemId || ""), ahora);
        return r ? json({ error: r }, 400) : json({ ok: true, mensaje: "Añadida a la colección." });
      }
      case "quitar": {
        await db.$executeRawUnsafe(`DELETE FROM CreadorColeccionObra WHERE coleccionId = ? AND itemId = ?`, id, String(b.itemId || ""));
        await db.$executeRawUnsafe(`UPDATE CreadorColeccion SET actualizada = ? WHERE id = ?`, ahora, id);
        return json({ ok: true, mensaje: "Quitada de la colección." });
      }
    }
    return json({ error: "Acción desconocida." }, 400);
  } catch (e) {
    console.error("forja colecciones POST", e);
    return json({ error: "La base no respondió." }, 503);
  }
}

async function agregar(coleccionId: string, itemId: string, ahora: number): Promise<string | null> {
  const f = await db.ugcItem.findUnique({ where: { id: itemId.slice(0, 40) }, select: { id: true, specs: true, status: true } });
  if (!f || !leerSpecs(f.specs) || f.status !== "APROBADO") return "Solo se coleccionan obras publicadas de La Forja.";
  const n = Number((await db.$queryRawUnsafe<{ n: number | bigint }[]>(`SELECT COUNT(*) AS n FROM CreadorColeccionObra WHERE coleccionId = ?`, coleccionId))[0]?.n ?? 0);
  if (n >= LIM.obrasPorColeccion) return `Una colección admite ${LIM.obrasPorColeccion} obras.`;
  await db.$executeRawUnsafe(`INSERT OR IGNORE INTO CreadorColeccionObra (coleccionId, itemId, agregada) VALUES (?, ?, ?)`, coleccionId, f.id, ahora);
  await db.$executeRawUnsafe(`UPDATE CreadorColeccion SET actualizada = ? WHERE id = ?`, ahora, coleccionId);
  return null;
}
