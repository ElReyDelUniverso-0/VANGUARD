import { NextRequest, NextResponse } from "next/server";
import { claveCliente, muro, sanitizarLinea } from "@/lib/fortaleza";
import { preguntarDocumento } from "@/lib/centro/sintesis";
import type { Documento } from "@/lib/centro/tipos";

// v419.1 · PREGUNTAR A UN DOCUMENTO — sin salir de su texto.
//
// Primero busca los fragmentos del documento que hablan de la pregunta (léxico
// con IDF, determinista). Si hay modelo, redacta la respuesta citando SÓLO esos
// fragmentos y se validan las citas; si no, devuelve el fragmento literal. En
// ningún caso responde con conocimiento externo al documento.
//
// POST { documento: Documento, pregunta: string, sinModelo?: boolean }

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 45;

export async function POST(req: NextRequest) {
  const ip = claveCliente(req);
  const v = muro(`centro-docp:${ip}`, 20, 60_000, 90_000);
  if (!v.permitido) {
    return NextResponse.json({ ok: false, error: `Espera ${v.espera} s.` }, { status: 429 });
  }

  let cuerpo: { documento?: Documento; pregunta?: unknown; sinModelo?: unknown } = {};
  try {
    cuerpo = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Cuerpo inválido" }, { status: 400 });
  }

  const doc = cuerpo.documento;
  if (!doc || typeof doc.texto !== "string" || !Array.isArray(doc.trozos) || !doc.trozos.length) {
    return NextResponse.json({ ok: false, error: "Falta el documento analizado (vuelve a subirlo)." }, { status: 400 });
  }

  const pregunta = sanitizarLinea(cuerpo.pregunta, 300);
  if (pregunta.length < 3) {
    return NextResponse.json({ ok: false, error: "Escribe la pregunta." }, { status: 400 });
  }

  const respuesta = await preguntarDocumento(doc, pregunta, cuerpo.sinModelo !== true);
  return NextResponse.json({ ok: true, ...respuesta });
}
