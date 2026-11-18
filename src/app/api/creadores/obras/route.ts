import { db } from "@/lib/db";
import { moderateUgc } from "@/lib/ai-moderate";
import { muro, claveCliente } from "@/lib/fortaleza";
import { CLASES, esClase, validarObra } from "@/lib/creadores/tipos";
import { estadoPorVeredicto } from "@/lib/creadores/moderacion";
import { quien, permite, asegurarTablas, nuevoId, aObra, json, type Specs, type ObraPublica } from "@/lib/creadores/servidor";

// v406.1 LA FORJA — las obras.
// GET  ?clase=&orden=recientes|valoradas|destacadas&autor=&q=&limite=
//      → solo APROBADO (y, si autor = tú, también tu cola: «mis obras»)
// POST { clase, titulo, resumen, cuerpo, datos, etiquetas } — exige cuenta firmada
//      → agente moderador → APROBADO | PENDIENTE | ELIMINADO + versión 1
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const u = new URL(req.url);
    const clase = u.searchParams.get("clase") || "";
    const orden = u.searchParams.get("orden") || "recientes";
    const autor = (u.searchParams.get("autor") || "").toUpperCase().slice(0, 16);
    const texto = (u.searchParams.get("q") || "").trim().toLowerCase().slice(0, 60);
    const limite = Math.min(Math.max(parseInt(u.searchParams.get("limite") || "24", 10) || 24, 1), 60);
    const q = await quien(req);
    const propias = !!autor && autor === q.alias;

    const filas = await db.ugcItem.findMany({
      where: {
        kind: esClase(clase) ? clase : { in: [...CLASES] },
        specs: { contains: '"forja":1' },
        ...(autor ? { author: autor } : {}),
        ...(propias ? { status: { not: "ELIMINADO" } } : { status: "APROBADO" }),
      },
      orderBy: orden === "valoradas" ? [{ ratingSum: "desc" }, { createdAt: "desc" }] : [{ createdAt: "desc" }],
      take: 300,
    });
    let obras = filas.map((f) => aObra(f)).filter((o): o is ObraPublica => !!o);
    if (texto) obras = obras.filter((o) => `${o.titulo} ${o.resumen} ${o.etiquetas.join(" ")} ${o.autor}`.toLowerCase().includes(texto));
    if (orden === "destacadas") obras = obras.filter((o) => o.destacada);
    if (orden === "valoradas") obras.sort((a, b) => b.valoracion.suma / Math.max(1, b.valoracion.n) - a.valoracion.suma / Math.max(1, a.valoracion.n) || b.valoracion.n - a.valoracion.n);
    const porClase = Object.fromEntries(CLASES.map((c) => [c, filas.filter((f) => f.kind === c && f.status === "APROBADO").length]));
    return json({ obras: obras.slice(0, limite), total: obras.length, porClase });
  } catch (e) {
    console.error("forja obras GET", e);
    return json({ obras: [], total: 0, porClase: {}, error: "La vitrina no responde ahora mismo." });
  }
}

export async function POST(req: Request) {
  const q = await quien(req);
  if (!q.alias) return json({ error: "Entra con tu cuenta para publicar: así tu obra queda firmada con tu nombre." }, 401);
  if (!permite(q, "publicar")) return json({ error: q.rol === "suspendido" ? "Tu cuenta está suspendida: puedes leer, pero no publicar." : "No tienes permiso para publicar." }, 403);
  const m1 = muro(`forja-pub:${claveCliente(req)}`, 12, 3600_000);
  const m2 = muro(`forja-pub-a:${q.alias}`, 8, 3600_000);
  if (!m1.permitido || !m2.permitido) return json({ error: "Has publicado mucho en poco tiempo. Vuelve en un rato." }, 429);

  let cuerpo: unknown;
  try {
    cuerpo = await req.json();
  } catch {
    return json({ error: "Envío ilegible." }, 400);
  }
  const { obra, error } = validarObra(cuerpo);
  if (!obra) return json({ error }, 400);

  try {
    await asegurarTablas();
    const textoDatos = JSON.stringify(obra.datos);
    const mod = await moderateUgc({ kind: obra.clase, title: obra.titulo, summary: obra.resumen, body: `${obra.cuerpo}\n${textoDatos}`.slice(0, 6000) });
    const estado = estadoPorVeredicto(mod.verdict, q.rol === "verificado" || q.rol === "moderador" || q.rol === "dueno");
    const specs: Specs = { forja: 1, datos: obra.datos, etiquetas: obra.etiquetas, v: 1 };
    const item = await db.ugcItem.create({
      data: {
        kind: obra.clase,
        author: q.alias,
        authorBall: "un",
        title: obra.titulo,
        summary: obra.resumen,
        body: obra.cuerpo,
        specs: JSON.stringify(specs),
        status: estado,
        aiVerdict: mod.verdict,
        aiReason: mod.reason,
        aiModerated: mod.ai,
      },
    });
    await db.$executeRawUnsafe(
      `INSERT INTO CreadorVersion (id, itemId, n, titulo, resumen, cuerpo, datos, nota, autor, estado, creada) VALUES (?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?)`,
      nuevoId(),
      item.id,
      obra.titulo,
      obra.resumen,
      obra.cuerpo,
      textoDatos,
      "Primera versión",
      q.alias,
      estado,
      Date.now()
    );
    const mensaje =
      estado === "APROBADO"
        ? "Publicada. Ya está en la vitrina."
        : estado === "PENDIENTE"
          ? "Recibida. El agente moderador pidió una revisión humana antes de mostrarla."
          : `No se ha publicado: ${mod.reason || "incumple las normas de la comunidad"}.`;
    return json({ ok: estado !== "ELIMINADO", id: item.id, estado, mensaje }, estado === "ELIMINADO" ? 422 : 201);
  } catch (e) {
    console.error("forja obras POST", e);
    return json({ error: "La base no pudo guardar la obra. Tu borrador sigue en este aparato." }, 503);
  }
}
