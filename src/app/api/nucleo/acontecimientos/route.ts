// ============================================================
// v219.0 — API del REGISTRO DE ACONTECIMIENTOS (server-only)
// La lista pública de hechos reales que reúnen noticias, con
// cronología viva del archivo. Muro objeto (ley v211: se juzga
// .permitido). Nada privado: la tabla Acontecimiento es pública
// por diseño (fnt:acontecimientos) y solo expone metadatos
// declarados — jamás notas de usuarios ni fuentes privadas.
// ============================================================

import { NextResponse } from "next/server";
import { muro, claveCliente } from "@/lib/fortaleza";
import { listaAcontecimientos } from "@/lib/nucleo/acontecimientos";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const veredicto = muro(`nucleo-acon:${claveCliente(req)}`, 30, 60_000);
  if (!veredicto.permitido) {
    return NextResponse.json(
      { ok: false, error: "Demasiadas peticiones — respira y vuelve en un minuto." },
      { status: 429 }
    );
  }

  try {
    const lista = await listaAcontecimientos();
    // Conteo vivo de noticias por teatro (regla:teatro). Para los
    // acontecimientos sin teatro, null (honestidad antes que invento).
    const conteos = new Map<string, number>();
    const porTeatro = await db.newsItem.groupBy({
      by: ["conflictTag"],
      _count: { conflictTag: true },
    });
    for (const fila of porTeatro) {
      if (fila.conflictTag) conteos.set(fila.conflictTag, fila._count.conflictTag);
    }
    const hechos = lista.map((a) => ({
      id: a.id,
      slug: a.slug,
      titulo: a.titulo,
      resumen: a.resumen,
      tipo: a.tipo,
      estado: a.estado,
      teatroTag: a.teatroTag,
      paisCodes: a.paisCodes,
      ocurridoDesde: a.ocurridoDesde,
      precisionTemporal: a.precisionTemporal,
      noticiasEnArchivo: (a.teatroTag ? conteos.get(a.teatroTag) : undefined) ?? null,
      ruta: `/nucleo?id=${encodeURIComponent(a.id)}`,
    }));
    return NextResponse.json({
      ok: true,
      total: hechos.length,
      hechos,
      generado: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "El registro de acontecimientos no responde" },
      { status: 503 }
    );
  }
}
