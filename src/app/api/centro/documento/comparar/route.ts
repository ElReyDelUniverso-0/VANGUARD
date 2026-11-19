import { NextRequest, NextResponse } from "next/server";
import { claveCliente, muro } from "@/lib/fortaleza";
import { compararDocumentos } from "@/lib/centro/sintesis";
import type { Documento } from "@/lib/centro/tipos";

// v419.1 · COMPARADOR Y DETECTOR DE CONTRADICCIONES — dos documentos, cara a cara.
//
// Determinista del todo: solapamiento léxico (Jaccard), temas comunes con su
// extracto en cada documento, temas exclusivos de cada uno, entidades
// compartidas y exclusivas, y choques comprobables (cifra, fecha, atribución,
// polaridad). No hay modelo aquí: si se contradicen, se puede comprobar a mano.
//
// POST { a: Documento, b: Documento } → { ok, comparacion }

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 45;

export async function POST(req: NextRequest) {
  const ip = claveCliente(req);
  const v = muro(`centro-cmp:${ip}`, 20, 60_000, 90_000);
  if (!v.permitido) {
    return NextResponse.json({ ok: false, error: `Espera ${v.espera} s.` }, { status: 429 });
  }

  let cuerpo: { a?: Documento; b?: Documento } = {};
  try {
    cuerpo = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Cuerpo inválido" }, { status: 400 });
  }

  const { a, b } = cuerpo;
  const valido = (d?: Documento) => d && typeof d.texto === "string" && Array.isArray(d.trozos) && d.trozos.length > 0;
  if (!valido(a) || !valido(b)) {
    return NextResponse.json({ ok: false, error: "Hacen falta dos documentos analizados." }, { status: 400 });
  }
  if (a!.id === b!.id) {
    return NextResponse.json({ ok: false, error: "Es el mismo documento dos veces. Elige dos distintos." }, { status: 400 });
  }

  const comparacion = compararDocumentos(a!, b!);
  return NextResponse.json({ ok: true, comparacion });
}
