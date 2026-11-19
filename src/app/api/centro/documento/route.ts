import { NextRequest, NextResponse } from "next/server";
import { claveCliente, muro } from "@/lib/fortaleza";
import { aDocumento, leerArchivo } from "@/lib/centro/documentos";

// v419.1 · LA CÁMARA — el analizador de documentos.
//
// Acepta un archivo (PDF, DOCX, TXT, MD, CSV, JSON) o texto pegado y devuelve
// el documento YA LEÍDO: texto, trozos con página aproximada, calidad de la
// extracción, avisos honestos y entidades (fechas, lugares del atlas real,
// posibles nombres, organizaciones, acontecimientos y cifras).
//
// NO SE GUARDA NADA EN SERVIDOR. Ni el archivo ni el texto: la BD de Vercel es
// efímera (cada instancia tiene su copia en /tmp), así que prometer
// persistencia sería mentir. El documento vuelve al navegador y allí vive, en
// el proyecto del operador. Cuando investiga, el texto viaja con la petición.
//
// POST multipart/form-data  campo «archivo»
// POST application/json      { texto, nombre? }
// → { ok, documento }

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Límite real de Vercel para el cuerpo de una función: 4,5 MB. */
const MAX_BYTES = 4 * 1024 * 1024;
const MAX_PEGADO = 400_000;

export async function POST(req: NextRequest) {
  const ip = claveCliente(req);
  const v = muro(`centro-doc:${ip}`, 20, 60_000, 90_000);
  if (!v.permitido) {
    return NextResponse.json({ ok: false, error: `Demasiados documentos seguidos. Espera ${v.espera} s.` }, { status: 429 });
  }

  const tipo = req.headers.get("content-type") ?? "";

  // ① texto pegado
  if (tipo.includes("application/json")) {
    let cuerpo: { texto?: unknown; nombre?: unknown } = {};
    try {
      cuerpo = await req.json();
    } catch {
      return NextResponse.json({ ok: false, error: "Cuerpo inválido" }, { status: 400 });
    }
    const texto = String(cuerpo.texto ?? "").slice(0, MAX_PEGADO);
    if (texto.trim().length < 40) {
      return NextResponse.json({ ok: false, error: "El texto pegado es demasiado corto para analizarlo (mínimo 40 caracteres)." }, { status: 400 });
    }
    const nombre = String(cuerpo.nombre ?? "Texto pegado").replace(/[<>"\n\r]/g, " ").slice(0, 120) || "Texto pegado";
    const documento = aDocumento({
      nombre,
      tipo: "pegado",
      bytes: Buffer.byteLength(texto, "utf8"),
      texto,
      avisos: [],
    });
    return NextResponse.json({ ok: true, documento });
  }

  // ② archivo
  if (!tipo.includes("multipart/form-data")) {
    return NextResponse.json(
      { ok: false, error: "Envía el archivo como multipart/form-data en el campo «archivo», o texto pegado en JSON." },
      { status: 415 }
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "No se pudo leer el formulario." }, { status: 400 });
  }

  const archivo = form.get("archivo");
  if (!(archivo instanceof File)) {
    return NextResponse.json({ ok: false, error: "Falta el archivo (campo «archivo»)." }, { status: 400 });
  }
  if (archivo.size === 0) {
    return NextResponse.json({ ok: false, error: "El archivo está vacío." }, { status: 400 });
  }
  if (archivo.size > MAX_BYTES) {
    return NextResponse.json(
      {
        ok: false,
        error: `El archivo pesa ${(archivo.size / 1024 / 1024).toFixed(1)} MB y el límite de la función es 4 MB. Divídelo o pega el texto.`,
      },
      { status: 413 }
    );
  }

  const buf = Buffer.from(await archivo.arrayBuffer());
  const nombre = archivo.name.replace(/[<>"\n\r]/g, " ").slice(0, 120) || "documento";
  const documento = leerArchivo(nombre, buf);

  if (!documento.caracteres) {
    return NextResponse.json(
      {
        ok: false,
        error:
          documento.avisos[0] ??
          "No se pudo extraer texto del archivo. La casa no hace OCR: los PDF escaneados necesitan un archivo con capa de texto.",
        avisos: documento.avisos,
      },
      { status: 422 }
    );
  }

  return NextResponse.json({ ok: true, documento });
}
