import { db } from "@/lib/db";
import { sanitizarLinea } from "@/lib/fortaleza";
import { esDecision, transicion, motivoValido, type Estado } from "@/lib/creadores/moderacion";
import { esRol, puedeActuarSobre, ROLES_ASIGNABLES, NOMBRE_ROL } from "@/lib/creadores/permisos";
import { quien, permite, asegurarTablas, aObra, leerSpecs, rolDe, registrarBitacora, avisar, json, type ObraPublica } from "@/lib/creadores/servidor";

// v406.1 LA FORJA — la mesa de moderación.
// GET  → cola (PENDIENTE), reportes abiertos, comentarios en revisión, roles y bitácora
// POST { accion: "decidir", id, decision, motivo }               (moderar)
//      { accion: "comentario", id, decision: aprobar|eliminar, motivo }
//      { accion: "resolver-reporte", objetivo, motivo }
//      { accion: "rol", alias, rol, motivo }                     (suspender / nombrar)
// Toda decisión exige motivo escrito y queda en la bitácora; el autor recibe aviso.
// FALLO CERRADO: sin AUTH_SECRET en producción, nadie modera (ver permisos.ts).
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const q = await quien(req);
  if (!permite(q, "moderar")) {
    return json({ error: q.secreto ? "Esta mesa es solo para la moderación." : "La moderación está cerrada hasta que la casa tenga su propio AUTH_SECRET.", moderacionActiva: q.secreto }, 403);
  }
  try {
    await asegurarTablas();
    const [cola, reportes, comentarios, roles, bitacora] = await Promise.all([
      db.ugcItem.findMany({ where: { status: { in: ["PENDIENTE", "OCULTO"] }, specs: { contains: '"forja":1' } }, orderBy: { createdAt: "asc" }, take: 100 }),
      db.$queryRawUnsafe<{ objetivo: string; itemId: string; n: number | bigint; motivos: string; ultima: number | bigint }[]>(
        `SELECT objetivo, itemId, COUNT(DISTINCT reporta) AS n, GROUP_CONCAT(motivo) AS motivos, MAX(creada) AS ultima FROM CreadorReporte WHERE resuelto = 0 GROUP BY objetivo, itemId ORDER BY n DESC, ultima DESC LIMIT 100`
      ),
      db.ugcComment.findMany({ where: { status: "PENDIENTE" }, orderBy: { createdAt: "asc" }, take: 100 }),
      db.$queryRawUnsafe<{ alias: string; rol: string; por: string; motivo: string; actualizada: number | bigint }[]>(`SELECT * FROM CreadorRol ORDER BY actualizada DESC LIMIT 100`),
      db.$queryRawUnsafe<{ id: string; actor: string; accion: string; objetivo: string; motivo: string; antes: string; despues: string; creada: number | bigint }[]>(`SELECT * FROM CreadorBitacora ORDER BY creada DESC LIMIT 80`),
    ]);
    const ids = [...new Set(reportes.map((r) => r.itemId))];
    const titulos = new Map((ids.length ? await db.ugcItem.findMany({ where: { id: { in: ids } }, select: { id: true, title: true, status: true } }) : []).map((x) => [x.id, x]));
    return json({
      yo: { alias: q.alias, rol: q.rol, nombra: permite(q, "nombrar") },
      cola: cola.map((f) => ({ ...(aObra(f, true) as ObraPublica), motivoModeracion: f.aiReason })),
      reportes: reportes.map((r) => ({ objetivo: r.objetivo, itemId: r.itemId, titulo: titulos.get(r.itemId)?.title ?? "(obra borrada)", estado: titulos.get(r.itemId)?.status ?? "", n: Number(r.n), motivos: [...new Set(String(r.motivos || "").split(","))], ultima: Number(r.ultima) })),
      comentarios: comentarios.map((c) => ({ id: c.id, itemId: c.itemId, autor: c.author, texto: c.text, motivo: c.aiReason, creada: c.createdAt.getTime() })),
      roles: roles.map((r) => ({ alias: r.alias, rol: r.rol, nombreRol: esRol(r.rol) ? NOMBRE_ROL[r.rol] : r.rol, por: r.por, motivo: r.motivo, actualizada: Number(r.actualizada) })),
      bitacora: bitacora.map((b) => ({ ...b, creada: Number(b.creada) })),
      asignables: ROLES_ASIGNABLES,
    });
  } catch (e) {
    console.error("forja moderación GET", e);
    return json({ error: "La mesa no responde ahora mismo." }, 503);
  }
}

export async function POST(req: Request) {
  const q = await quien(req);
  if (!q.alias || !permite(q, "moderar")) return json({ error: q.secreto ? "Solo la moderación puede hacer esto." : "La moderación está cerrada hasta que la casa tenga su propio AUTH_SECRET." }, 403);
  let b: Record<string, unknown>;
  try {
    b = (await req.json()) as Record<string, unknown>;
  } catch {
    return json({ error: "Envío ilegible." }, 400);
  }
  const motivo = motivoValido(b.motivo);
  if (!motivo) return json({ error: "Escribe el motivo (4 caracteres o más): queda en la bitácora y se le enseña al autor." }, 400);
  try {
    await asegurarTablas();
    const accion = String(b.accion || "");

    if (accion === "decidir") {
      const id = String(b.id || "").slice(0, 40);
      const d = b.decision;
      if (!esDecision(d)) return json({ error: "Decisión desconocida." }, 400);
      const f = await db.ugcItem.findUnique({ where: { id } });
      const specs = f ? leerSpecs(f.specs) : null;
      if (!f || !specs) return json({ error: "Esa obra no existe." }, 404);
      const rolAutor = await rolDe(f.author);
      if (f.author === q.alias && q.rol !== "dueno") return json({ error: "No puedes moderar tu propia obra: que la revise otra persona." }, 403);
      if (f.author !== q.alias && !puedeActuarSobre(q.rol, rolAutor)) return json({ error: "No puedes moderar la obra de otro moderador." }, 403);
      const siguiente = transicion(f.status as Estado, d);
      if (!siguiente) return json({ error: `«${d}» no aplica a una obra en estado ${f.status}.` }, 409);
      const data: { status: string; specs?: string } = { status: siguiente };
      if (d === "destacar" || d === "quitar-destacado") data.specs = JSON.stringify({ ...specs, destacada: d === "destacar" });
      await db.ugcItem.update({ where: { id }, data });
      if (d === "aprobar" || d === "restaurar" || d === "ocultar" || d === "eliminar") {
        await db.$executeRawUnsafe(`UPDATE CreadorReporte SET resuelto = 1 WHERE objetivo = ?`, `obra:${id}`);
      }
      await registrarBitacora(q.alias, d, `obra:${id}`, motivo, f.status, siguiente);
      const textos: Record<string, string> = {
        aprobar: "ya está publicada",
        ocultar: "ha sido ocultada por la moderación",
        eliminar: "ha sido rechazada por la moderación",
        restaurar: "vuelve a estar publicada",
        destacar: "ha sido DESTACADA por la moderación",
        "quitar-destacado": "ya no está destacada",
      };
      await avisar(f.author, `«${f.title}» ${textos[d]}`, `Motivo: ${motivo}`, d === "destacar" ? "🏅" : "🛡️");
      return json({ ok: true, estado: siguiente, mensaje: "Hecho. Queda en la bitácora." });
    }

    if (accion === "comentario") {
      const id = String(b.id || "").slice(0, 40);
      const d = b.decision === "aprobar" ? "APROBADO" : b.decision === "eliminar" ? "ELIMINADO" : null;
      if (!d) return json({ error: "Decisión desconocida." }, 400);
      const c = await db.ugcComment.findUnique({ where: { id } });
      if (!c) return json({ error: "Ese comentario no existe." }, 404);
      await db.ugcComment.update({ where: { id }, data: { status: d } });
      await db.$executeRawUnsafe(`UPDATE CreadorReporte SET resuelto = 1 WHERE objetivo = ?`, `comentario:${id}`);
      await registrarBitacora(q.alias, `comentario-${d === "APROBADO" ? "aprobar" : "eliminar"}`, `comentario:${id}`, motivo, c.status, d);
      if (d === "ELIMINADO") await avisar(c.author, "Un comentario tuyo fue retirado", `Motivo: ${motivo}`, "🛡️");
      return json({ ok: true, mensaje: "Hecho." });
    }

    if (accion === "resolver-reporte") {
      const objetivo = String(b.objetivo || "").slice(0, 60);
      await db.$executeRawUnsafe(`UPDATE CreadorReporte SET resuelto = 1 WHERE objetivo = ?`, objetivo);
      await registrarBitacora(q.alias, "reporte-desestimado", objetivo, motivo);
      return json({ ok: true, mensaje: "Reporte cerrado sin cambios." });
    }

    if (accion === "rol") {
      const alias = sanitizarLinea(b.alias, 16).toUpperCase();
      const nuevo = b.rol;
      if (!/^[A-Z0-9_]{3,16}$/.test(alias)) return json({ error: "Alias inválido." }, 400);
      if (!esRol(nuevo) || !ROLES_ASIGNABLES.includes(nuevo)) return json({ error: "Rol no asignable." }, 400);
      if (alias === q.alias) return json({ error: "No puedes cambiar tu propio rol." }, 403);
      const actual = await rolDe(alias);
      if (!puedeActuarSobre(q.rol, actual)) return json({ error: "No tienes autoridad sobre esa cuenta." }, 403);
      // el moderador solo suspende o levanta suspensiones; nombrar es del dueño
      const esNombrar = nuevo === "moderador" || nuevo === "verificado" || actual === "moderador" || actual === "verificado";
      if (esNombrar ? !permite(q, "nombrar") : !permite(q, "suspender")) return json({ error: "Solo el dueño nombra o retira verificados y moderadores." }, 403);
      await db.$executeRawUnsafe(
        `INSERT INTO CreadorRol (alias, rol, por, motivo, actualizada) VALUES (?, ?, ?, ?, ?) ON CONFLICT(alias) DO UPDATE SET rol = excluded.rol, por = excluded.por, motivo = excluded.motivo, actualizada = excluded.actualizada`,
        alias,
        nuevo,
        q.alias,
        motivo,
        Date.now()
      );
      await registrarBitacora(q.alias, "rol", `creador:${alias}`, motivo, actual, nuevo);
      await avisar(alias, nuevo === "suspendido" ? "Tu cuenta de creador está suspendida" : `Ahora eres: ${NOMBRE_ROL[nuevo]}`, `Motivo: ${motivo}`, nuevo === "suspendido" ? "⛔" : "🏅");
      return json({ ok: true, mensaje: `${alias} → ${NOMBRE_ROL[nuevo]}.` });
    }
    return json({ error: "Acción desconocida." }, 400);
  } catch (e) {
    console.error("forja moderación POST", e);
    return json({ error: "La base no respondió." }, 503);
  }
}
