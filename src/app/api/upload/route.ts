import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// v51.2 — POST /api/upload — subida real de archivos de la comunidad.
// Faltaba esta ruta: gallery-panel, estudio-panel y videos-panel la llamaban
// y siempre caían en 404 ("No se pudo publicar").
// Vercel no tiene disco persistente → los bytes se guardan en Postgres
// (tabla MediaFile) y se sirven via GET /api/media/[id].
// Techo duro 4 MB (límite de body en Vercel Hobby ≈ 4.5 MB).

const MAX_BYTES = 4 * 1024 * 1024;

const ALLOWED: Record<string, { mime: string; ext: string }> = {
  "image/jpeg": { mime: "image/jpeg", ext: "jpg" },
  "image/png": { mime: "image/png", ext: "png" },
  "image/webp": { mime: "image/webp", ext: "webp" },
  "video/webm": { mime: "video/webm", ext: "webm" },
  "video/mp4": { mime: "video/mp4", ext: "mp4" },
};

const KINDS = new Set(["photo", "video", "thumb"]);

export async function POST(req: Request) {
  try {
    const fd = await req.formData();
    const file = fd.get("file");
    const kindRaw = String(fd.get("kind") || "photo");
    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: "Falta el archivo" }, { status: 400 });
    }
    const kind = KINDS.has(kindRaw) ? kindRaw : "photo";
    const meta = ALLOWED[file.type];
    if (!meta) {
      return NextResponse.json(
        { ok: false, error: "Formato no permitido (usa JPG/PNG/WEBP o MP4/WEBM)" },
        { status: 400 }
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { ok: false, error: "Archivo demasiado grande (max 4 MB)" },
        { status: 413 }
      );
    }
    const buf = Buffer.from(await file.arrayBuffer());
    if (buf.length === 0) {
      return NextResponse.json({ ok: false, error: "Archivo vacío" }, { status: 400 });
    }
    const row = await db.mediaFile.create({
      data: { kind, mime: meta.mime, ext: meta.ext, bytes: buf.length, data: buf },
    });
    return NextResponse.json({ ok: true, url: `/api/media/${row.id}`, bytes: buf.length });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Error de subida" },
      { status: 500 }
    );
  }
}
