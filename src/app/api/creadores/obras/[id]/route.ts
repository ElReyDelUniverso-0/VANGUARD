import { db } from "@/lib/db";
import { moderateUgc } from "@/lib/ai-moderate";
import { muro, claveCliente, sanitizar } from "@/lib/fortaleza";
import { validarObra, cambioEntre, LIM } from "@/lib/creadores/tipos";
import { estadoPorVeredicto, visiblePara, esMotivo, debeIrACola, UMBRAL_REPORTES, type Estado } from "@/lib/creadores/moderacion";
import { quien, permite, asegurarTablas, nuevoId, aObra, leerSpecs, rolDe, registrarBitacora, avisar, json, type Specs } from "@/lib/creadores/servidor";

// v406.1 LA FORJA — una obra.
// GET  → la obra + versiones + comentarios + mi valoración + mis colecciones
// POST { accion: "version" | "valorar" | "comentar" | "reportar" | "retirar" | "volver-a-version", ... }
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };
type FilaVersion = { id: string; n: number; titulo: string; resumen: string; cuerpo: string; datos: string; nota: string; autor: string; estado: string; creada: number | bigint };

async function cargar(id: string) {
  const f = await db.ugcItem.findUnique({ where: { id } });
  if (!f || !leerSpecs(f.specs)) return null;
  return f;
}

export async function GET(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  try {
    await asegurarTablas();
    const q = await quien(req);
    const f = await cargar(id);
    if (!f) return json({ error: "Esa obra no existe (o la base se reinició)." }, 404);
    const modera = permite(q, "moderar");
    const esAutor = q.alias === f.author;
    if (!visiblePara(f.status as Estado, { esAutor, modera })) return json({ error: "Esta obra no está visible." }, 404);

    const obra = aObra(f, true)!;
    if (esAutor || modera) obra.motivoModeracion = f.aiReason || undefined;
    const versiones = (await db.$queryRawUnsafe<FilaVersion[]>(`SELECT * FROM CreadorVersion WHERE itemId = ? ORDER BY n DESC LIMIT 50`, id)).map((v, i, arr) => {
      const previa = arr[i + 1];
      return {
        n: Number(v.n),
        titulo: v.titulo,
        nota: v.nota,
        creada: Number(v.creada),
        cambios: previa ? cambioEntre(previa, v) : ["primera versión"],
        ...(esAutor || modera ? { resumen: v.resumen, cuerpo: v.cuerpo, datos: v.datos } : {}),
      };
    });
    const comentarios = await db.ugcComment.findMany({
      where: { itemId: id, ...(modera ? { status: { not: "ELIMINADO" } } : { OR: [{ status: "APROBADO" }, ...(q.alias ? [{ author: q.alias, status: "PENDIENTE" }] : [])] }) },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    let miValoracion = 0;
    let misColecciones: { id: string; titulo: string; contiene: boolean }[] = [];
    if (q.alias) {
      const v = await db.ugcVote.findUnique({ where: { itemId_voter_kind: { itemId: id, voter: q.alias, kind: "rating" } } });
      miValoracion = v?.value ?? 0;
      misColecciones = (
        await db.$queryRawUnsafe<{ id: string; titulo: string; contiene: number | bigint }[]>(
          `SELECT c.id, c.titulo, (SELECT COUNT(*) FROM CreadorColeccionObra o WHERE o.coleccionId = c.id AND o.itemId = ?) AS contiene FROM CreadorColeccion c WHERE c.dueno = ? ORDER BY c.actualizada DESC LIMIT 30`,
          id,
          q.alias
        )
      ).map((c) => ({ id: c.id, titulo: c.titulo, contiene: Number(c.contiene) > 0 }));
    }
    // una vista por petición de lectura ajena (sin contar al autor), con muro por IP
    if (!esAutor && muro(`forja-vista:${claveCliente(req)}:${id}`, 1, 3600_000).permitido) {
      db.ugcItem.update({ where: { id }, data: { plays: { increment: 1 } } }).catch(() => {});
    }
    return json({
      obra,
      versiones,
      comentarios: comentarios.map((c) => ({ id: c.id, autor: c.author, texto: c.text, estado: c.status, creada: c.createdAt.getTime() })),
      miValoracion,
      misColecciones,
      yo: { alias: q.alias, rol: q.rol, esAutor, modera },
    });
  } catch (e) {
    console.error("forja obra GET", e);
    return json({ error: "La obra no responde ahora mismo." }, 503);
  }
}

export async function POST(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const q = await quien(req);
  if (!q.alias) return json({ error: "Entra con tu cuenta para participar." }, 401);
  const m = muro(`forja-acc:${claveCliente(req)}`, 40, 60_000);
  if (!m.permitido) return json({ error: "Demasiadas acciones seguidas. Respira un momento." }, 429);
  let b: Record<string, unknown>;
  try {
    b = (await req.json()) as Record<string, unknown>;
  } catch {
    return json({ error: "Envío ilegible." }, 400);
  }
  try {
    await asegurarTablas();
    const f = await cargar(id);
    if (!f) return json({ error: "Esa obra no existe (o la base se reinició)." }, 404);
    const esAutor = q.alias === f.author;
    const specs = leerSpecs(f.specs)!;
    const accion = String(b.accion || "");

    switch (accion) {
      // ── una versión nueva (solo su autor): la anterior queda en la historia
      case "version":
      case "volver-a-version": {
        if (!esAutor || !permite(q, "versionar")) return json({ error: "Solo su autor puede publicar versiones nuevas." }, 403);
        if (f.status === "OCULTO" || f.status === "ELIMINADO") return json({ error: "La moderación retiró esta obra: no admite versiones hasta que se revise." }, 403);
        if (!muro(`forja-ver:${q.alias}`, 10, 3600_000).permitido) return json({ error: "Muchas versiones en una hora. Vuelve en un rato." }, 429);
        let entrada: unknown = b;
        if (accion === "volver-a-version") {
          const n = Number(b.n);
          const v = (await db.$queryRawUnsafe<FilaVersion[]>(`SELECT * FROM CreadorVersion WHERE itemId = ? AND n = ?`, id, n))[0];
          if (!v) return json({ error: "Esa versión no existe." }, 404);
          let datos: unknown = {};
          try {
            datos = JSON.parse(v.datos);
          } catch {
            /* datos vacíos */
          }
          entrada = { clase: f.kind, titulo: v.titulo, resumen: v.resumen, cuerpo: v.cuerpo, datos, etiquetas: specs.etiquetas, nota: `Vuelve a la versión ${n}` };
        }
        const { obra, error } = validarObra({ ...(entrada as object), clase: f.kind });
        if (!obra) return json({ error }, 400);
        const nota = sanitizar((entrada as Record<string, unknown>).nota, LIM.nota) || "Sin nota";
        const textoDatos = JSON.stringify(obra.datos);
        const mod = await moderateUgc({ kind: f.kind, title: obra.titulo, summary: obra.resumen, body: `${obra.cuerpo}\n${textoDatos}`.slice(0, 6000) });
        const estado = estadoPorVeredicto(mod.verdict, q.rol === "verificado" || q.rol === "moderador" || q.rol === "dueno");
        if (estado === "ELIMINADO") return json({ error: `La versión no se publica: ${mod.reason || "incumple las normas"}. La versión anterior sigue visible.` }, 422);
        const v = (specs.v ?? 1) + 1;
        const nuevos: Specs = { ...specs, datos: obra.datos, etiquetas: obra.etiquetas, v };
        await db.ugcItem.update({
          where: { id },
          data: { title: obra.titulo, summary: obra.resumen, body: obra.cuerpo, specs: JSON.stringify(nuevos), status: f.status === "RETIRADA" ? "RETIRADA" : estado === "PENDIENTE" ? "PENDIENTE" : f.status, aiVerdict: mod.verdict, aiReason: mod.reason, aiModerated: mod.ai },
        });
        await db.$executeRawUnsafe(
          `INSERT INTO CreadorVersion (id, itemId, n, titulo, resumen, cuerpo, datos, nota, autor, estado, creada) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          nuevoId(),
          id,
          v,
          obra.titulo,
          obra.resumen,
          obra.cuerpo,
          textoDatos,
          nota,
          q.alias,
          estado,
          Date.now()
        );
        return json({ ok: true, version: v, estado, mensaje: estado === "PENDIENTE" ? `Versión ${v} guardada; pasa por revisión humana antes de mostrarse.` : `Versión ${v} publicada.` });
      }

      // ── valorar 1–5 (una por cuenta, nunca la propia)
      case "valorar": {
        if (!permite(q, "valorar")) return json({ error: "Tu cuenta no puede valorar." }, 403);
        if (esAutor) return json({ error: "No puedes valorar tu propia obra." }, 403);
        if (f.status !== "APROBADO") return json({ error: "Solo se valoran obras publicadas." }, 409);
        const valor = Math.round(Number(b.valor));
        if (!(valor >= 1 && valor <= 5)) return json({ error: "La valoración va de 1 a 5." }, 400);
        const previo = await db.ugcVote.findUnique({ where: { itemId_voter_kind: { itemId: id, voter: q.alias, kind: "rating" } } });
        if (previo) {
          await db.ugcVote.update({ where: { id: previo.id }, data: { value: valor } });
          await db.ugcItem.update({ where: { id }, data: { ratingSum: { increment: valor - previo.value } } });
        } else {
          await db.ugcVote.create({ data: { itemId: id, voter: q.alias, kind: "rating", value: valor } });
          await db.ugcItem.update({ where: { id }, data: { ratingSum: { increment: valor }, ratingCount: { increment: 1 } } });
        }
        const nueva = await db.ugcItem.findUnique({ where: { id }, select: { ratingSum: true, ratingCount: true } });
        return json({ ok: true, valoracion: { suma: nueva?.ratingSum ?? 0, n: nueva?.ratingCount ?? 0 }, miValoracion: valor });
      }

      // ── comentar (firmado y moderado)
      case "comentar": {
        if (!permite(q, "comentar")) return json({ error: q.rol === "suspendido" ? "Tu cuenta está suspendida." : "No puedes comentar." }, 403);
        if (f.status !== "APROBADO" && !esAutor) return json({ error: "Esta obra no admite comentarios ahora." }, 409);
        if (!muro(`forja-com:${q.alias}`, 10, 300_000).permitido) return json({ error: "Muchos comentarios seguidos. Espera unos minutos." }, 429);
        const texto = sanitizar(b.texto, LIM.comentario);
        if (texto.length < 2) return json({ error: "Escribe algo antes de enviar." }, 400);
        const mod = await moderateUgc({ kind: "comentario", title: "", body: texto });
        if (mod.verdict === "INAPROPIADO") return json({ error: `Comentario no publicado: ${mod.reason || "incumple las normas"}.` }, 422);
        const estado = mod.verdict === "SOSPECHOSO" && q.rol !== "verificado" && q.rol !== "moderador" && q.rol !== "dueno" ? "PENDIENTE" : "APROBADO";
        const c = await db.ugcComment.create({ data: { itemId: id, author: q.alias, authorBall: "un", text: texto, status: estado, aiVerdict: mod.verdict, aiReason: mod.reason } });
        if (estado === "APROBADO" && !esAutor) await avisar(f.author, `Nuevo comentario en «${f.title}»`, `${q.alias}: ${texto.slice(0, 160)}`, "💬");
        return json({ ok: true, comentario: { id: c.id, autor: c.author, texto: c.text, estado, creada: c.createdAt.getTime() }, mensaje: estado === "PENDIENTE" ? "Tu comentario espera revisión." : "Comentario publicado." });
      }

      // ── reportar una obra o un comentario (una vez por cuenta)
      case "reportar": {
        if (!permite(q, "reportar")) return json({ error: "Tu cuenta no puede reportar." }, 403);
        if (!esMotivo(b.motivo)) return json({ error: "Elige el motivo del reporte." }, 400);
        const comentarioId = typeof b.comentario === "string" ? b.comentario.slice(0, 40) : "";
        const objetivo = comentarioId ? `comentario:${comentarioId}` : `obra:${id}`;
        if (!comentarioId && esAutor) return json({ error: "No puedes reportar tu propia obra." }, 403);
        const detalle = sanitizar(b.detalle, 300);
        // INSERT OR IGNORE: el UNIQUE (objetivo, reporta) hace que cada cuenta
        // cuente una sola vez; 0 filas = ya lo había reportado (sin ruido en el log)
        {
          const filas = await db.$executeRawUnsafe(
            `INSERT OR IGNORE INTO CreadorReporte (id, objetivo, itemId, reporta, motivo, detalle, creada) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            nuevoId(),
            objetivo,
            id,
            q.alias,
            b.motivo,
            detalle,
            Date.now()
          );
          if (filas === 0) return json({ ok: true, mensaje: "Ya habías reportado esto. La moderación lo tiene." });
        }
        const n = Number((await db.$queryRawUnsafe<{ n: number | bigint }[]>(`SELECT COUNT(DISTINCT reporta) AS n FROM CreadorReporte WHERE objetivo = ? AND resuelto = 0`, objetivo))[0]?.n ?? 0);
        let enCola = false;
        if (comentarioId) {
          if (n >= UMBRAL_REPORTES) {
            await db.ugcComment.updateMany({ where: { id: comentarioId, itemId: id, status: "APROBADO" }, data: { status: "PENDIENTE" } });
            enCola = true;
          }
        } else if (f.status === "APROBADO") {
          const rolAutor = await rolDe(f.author);
          if (debeIrACola(n, rolAutor === "verificado" || rolAutor === "moderador" || rolAutor === "dueno")) {
            await db.ugcItem.update({ where: { id }, data: { status: "PENDIENTE" } });
            await registrarBitacora("SISTEMA", "a-cola-por-reportes", objetivo, `${n} reportes distintos`, "APROBADO", "PENDIENTE");
            await avisar(f.author, `«${f.title}» pasa a revisión`, "Varias personas la reportaron. La moderación la revisará y te avisará.", "🛡️");
            enCola = true;
          }
        }
        return json({ ok: true, enCola, mensaje: enCola ? "Gracias. Con tu reporte pasa a revisión de la moderación." : "Gracias. La moderación lo revisará." });
      }

      // ── retirar lo propio (reversible: volver a publicar con una versión nueva no; el moderador puede restaurar)
      case "retirar": {
        if (!esAutor || !permite(q, "retirar")) return json({ error: "Solo su autor puede retirarla." }, 403);
        await db.ugcItem.update({ where: { id }, data: { status: "RETIRADA" } });
        await registrarBitacora(q.alias, "retirar-propia", `obra:${id}`, "El autor la retiró", f.status, "RETIRADA");
        return json({ ok: true, mensaje: "Retirada. Ya no aparece en la vitrina." });
      }
      case "republicar": {
        if (!esAutor || f.status !== "RETIRADA") return json({ error: "Solo su autor puede volver a publicar una obra retirada." }, 403);
        await db.ugcItem.update({ where: { id }, data: { status: "APROBADO" } });
        await registrarBitacora(q.alias, "republicar-propia", `obra:${id}`, "El autor la volvió a publicar", "RETIRADA", "APROBADO");
        return json({ ok: true, mensaje: "De vuelta en la vitrina." });
      }
    }
    return json({ error: "Acción desconocida." }, 400);
  } catch (e) {
    console.error("forja obra POST", e);
    return json({ error: "La base no respondió. Inténtalo de nuevo." }, 503);
  }
}
