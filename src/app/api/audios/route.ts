// ============================================================
// v217.0 LA EMISORA — /api/audios: los comandantes mandan su voz
// a Vanguard y la casa la guarda y la expone. Reglas de la casa:
// muro objeto (ley v211), sanitización (v204), bytes en MediaFile
// (techo duro 4 MB) y rótulo en AudioComandante. El audio lo
// graba el propio aparato (MediaRecorder ≤ 90 s) y viaja en
// base64. Sin terceros, sin coste.
// ============================================================
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { muro, claveCliente, sanitizarLinea } from "@/lib/fortaleza";

const TECHO_BYTES = 3_000_000; // 3 MB de audio ≈ 90 s de webm opus
const TECHO_SEG = 90;

export async function GET() {
  try {
    const [lista, total] = await Promise.all([
      db.audioComandante.findMany({ orderBy: { createdAt: "desc" }, take: 30 }),
      db.audioComandante.count(),
    ]);
    return NextResponse.json({
      ok: true,
      total,
      audios: lista.map((a) => ({
        id: a.id,
        autor: a.autor,
        titulo: a.titulo,
        duracion: a.duracion,
        url: `/api/media/${a.mediaId}`,
        creado: a.createdAt,
      })),
    });
  } catch {
    return NextResponse.json({ ok: false, error: "El muro de audios no responde." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const veredicto = muro(`audios:${claveCliente(req)}`, 10, 3600_000);
  if (!veredicto.permitido) {
    return NextResponse.json(
      { ok: false, error: `Demasiados envíos desde tu conexión. Vuelve en ${Math.ceil(veredicto.espera / 60)} min.` },
      { status: 429 }
    );
  }
  try {
    const body = await req.json().catch(() => ({}));
    const autor = (sanitizarLinea(body.autor ?? "", 24).trim() || "INVITADO").toUpperCase();
    const titulo = sanitizarLinea(body.titulo ?? "", 120).trim();
    const duracion = Math.max(1, Math.min(TECHO_SEG, Number(body.duracion) || 1));
    const base64: string = typeof body.audio === "string" ? body.audio : "";

    if (!titulo) {
      return NextResponse.json({ ok: false, error: "Dile a Vanguard qué lleva tu audio (un título)." }, { status: 400 });
    }
    if (!base64) {
      return NextResponse.json({ ok: false, error: "No llegó ningún audio." }, { status: 400 });
    }
    const buf = Buffer.from(base64, "base64");
    if (buf.length < 800 || buf.length > TECHO_BYTES) {
      return NextResponse.json(
        { ok: false, error: `El audio pesa ${(buf.length / 1024).toFixed(0)} KB — se admite de 1 KB a 3 MB (90 s).` },
        { status: 400 }
      );
    }

    const media = await db.mediaFile.create({
      data: { kind: "audio", mime: "audio/webm", ext: "webm", bytes: buf.length, data: buf },
    });
    const fila = await db.audioComandante.create({
      data: { autor, titulo, duracion, mediaId: media.id },
    });
    return NextResponse.json({
      ok: true,
      id: fila.id,
      url: `/api/media/${media.id}`,
      aviso: "Audio recibido. Ya suena en el muro de la Emisora.",
    });
  } catch {
    return NextResponse.json({ ok: false, error: "La emisora no pudo guardar tu audio." }, { status: 500 });
  }
}
