import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

// v30 FIX CRÍTICO: /api/upload era llamada por 3 paneles (galería de fotos,
// estudio de video y videos) pero la ruta NO EXISTÍA → 404 al publicar media.
// Recreada con el contrato original: FormData { file, kind } → { ok, url }.
// kind: photo → public/uploads/fotos · video → public/uploads/videos ·
//       thumb → public/uploads/thumbs
// NOTA serverless: en Vercel el FS es de solo lectura — el error se devuelve
// con mensaje claro; el Paso PRO (Supabase Storage) reemplaza este destino.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DIRS: Record<string, string> = {
  photo: "fotos",
  video: "videos",
  thumb: "thumbs",
};

const EXT_OK: Record<string, string[]> = {
  photo: [".jpg", ".jpeg", ".png", ".webp"],
  video: [".mp4", ".webm", ".mov"],
  thumb: [".jpg", ".jpeg", ".png", ".webp"],
};

const MAX_BYTES: Record<string, number> = {
  photo: 6 * 1024 * 1024,
  thumb: 3 * 1024 * 1024,
  video: 60 * 1024 * 1024,
};

function fail(error: string, status = 400) {
  return NextResponse.json({ ok: false, error }, { status });
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const rawKind = String(form.get("kind") || "photo");
    const kind = rawKind in DIRS ? rawKind : null;
    if (!kind) return fail("kind no válido (photo | video | thumb)");

    const file = form.get("file");
    if (!(file instanceof File)) return fail("Falta el archivo");

    const origName = (file.name || "").toLowerCase();
    const ext = path.extname(origName) || (kind === "video" ? ".webm" : ".jpg");
    if (!EXT_OK[kind].includes(ext)) return fail("Formato no permitido");
    if (file.size <= 0) return fail("Archivo vacío");
    if (file.size > MAX_BYTES[kind]) return fail("Archivo demasiado grande");

    const dir = path.join(process.cwd(), "public", "uploads", DIRS[kind]);
    await mkdir(dir, { recursive: true });

    // Nombre generado por el servidor (nunca se usa el nombre del cliente)
    const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`;
    const bytes = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(dir, stamp), bytes);

    return NextResponse.json({
      ok: true,
      url: `/uploads/${DIRS[kind]}/${stamp}`,
      bytes: bytes.length,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error desconocido";
    return fail(`No se pudo guardar el archivo (${msg})`, 500);
  }
}
