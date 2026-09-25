import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// v51.2 — GET /api/media/[id] — sirve los bytes de un archivo subido
// (foto de galería, video del estudio, miniatura). Cache inmutable:
// el contenido de un id nunca cambia.

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-z0-9]+$/i.test(id) || id.length > 40) {
    return NextResponse.json({ ok: false, error: "id inválido" }, { status: 400 });
  }
  try {
    const row = await db.mediaFile.findUnique({ where: { id } });
    if (!row) return new NextResponse("No encontrado", { status: 404 });
    const body = new Uint8Array(row.data);
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": row.mime,
        "Content-Length": String(body.byteLength),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Error interno", { status: 500 });
  }
}
