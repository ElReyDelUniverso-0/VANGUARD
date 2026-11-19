import { NextRequest, NextResponse } from "next/server";
import { claveCliente, muro, sanitizarLinea } from "@/lib/fortaleza";
import { buscarFuentes, censoCorpus, fuentesVivas } from "@/lib/centro/corpus";
import type { ViaFuente } from "@/lib/centro/tipos";

// v419.1 · LA CÁMARA DE INTELIGENCIA — paso 1: encontrar de dónde citar.
//
// NO usa modelo. Devuelve las fuentes de la casa que hablan de la pregunta,
// con la muestra de lo que se va a citar, para que el operador ELIJA antes de
// gastar una llamada de modelo. Eso es lo que hace un investigador: primero
// selecciona el material, después pregunta.
//
// POST { pregunta: string, vias?: ViaFuente[], vivo?: boolean }
// → { ok, candidatas: FuenteCandidata[], vivas: FuenteCandidata[], censo, avisos }

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const VIAS: ViaFuente[] = ["dossier", "enciclopedia", "pais", "concepto", "teatro", "noticia", "modulo", "documento"];

export async function POST(req: NextRequest) {
  const ip = claveCliente(req);
  const v = muro(`centro-buscar:${ip}`, 40, 60_000);
  if (!v.permitido) {
    return NextResponse.json({ ok: false, error: `Demasiadas búsquedas. Espera ${v.espera} s.` }, { status: 429 });
  }

  let cuerpo: { pregunta?: unknown; vias?: unknown; vivo?: unknown } = {};
  try {
    cuerpo = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Cuerpo inválido" }, { status: 400 });
  }

  const pregunta = sanitizarLinea(cuerpo.pregunta, 400);
  if (pregunta.length < 3) {
    return NextResponse.json({ ok: false, error: "Escribe una pregunta de al menos 3 caracteres." }, { status: 400 });
  }

  const vias = Array.isArray(cuerpo.vias) ? (cuerpo.vias as string[]).filter((x): x is ViaFuente => VIAS.includes(x as ViaFuente)) : [];

  const candidatas = buscarFuentes(pregunta, { vias: vias.length ? vias : undefined, limite: 14 });
  const vivas = cuerpo.vivo === false ? [] : await fuentesVivas(pregunta, 6);

  const avisos: string[] = [];
  if (!candidatas.length && !vivas.length) {
    avisos.push(
      "Ninguna fuente de la casa habla de esto con esas palabras. Prueba otros términos, restringe menos vías o sube un documento tuyo."
    );
  }

  return NextResponse.json({
    ok: true,
    pregunta,
    candidatas,
    vivas,
    censo: censoCorpus(),
    avisos,
  });
}

export async function GET() {
  // el censo es lo que la interfaz enseña como «de dónde puede citar»
  return NextResponse.json({ ok: true, censo: censoCorpus(), vias: VIAS });
}
