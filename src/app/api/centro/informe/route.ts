import { NextRequest, NextResponse } from "next/server";
import { claveCliente, muro } from "@/lib/fortaleza";
import { construirInforme } from "@/lib/centro/sintesis";
import type { Investigacion } from "@/lib/centro/tipos";

// v419.1 · LA CÁMARA — paso 3: convertir una investigación en informe estructurado.
//
// El informe NO vuelve a inventar: recibe la investigación ya validada y la
// ordena en secciones (resumen, hechos con fuente, interpretación provisional,
// no confirmado, contradicciones, lagunas, cronología detectada y bibliografía).
// Si hay modelo, sólo redacta resumen/contexto/lectura; las tres casillas y la
// bibliografía se montan con datos, no con prosa.
//
// POST { investigacion: Investigacion } → { ok, informe }

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const ip = claveCliente(req);
  const v = muro(`centro-informe:${ip}`, 10, 60_000, 120_000);
  if (!v.permitido) {
    return NextResponse.json({ ok: false, error: `Espera ${v.espera} s antes de generar otro informe.` }, { status: 429 });
  }

  let cuerpo: { investigacion?: Investigacion } = {};
  try {
    cuerpo = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Cuerpo inválido" }, { status: 400 });
  }

  const inv = cuerpo.investigacion;
  if (!inv || typeof inv.pregunta !== "string" || !Array.isArray(inv.afirmaciones)) {
    return NextResponse.json({ ok: false, error: "Falta la investigación que convertir en informe." }, { status: 400 });
  }
  if (inv.afirmaciones.length === 0 && !inv.sintesis) {
    return NextResponse.json(
      { ok: false, error: "Una investigación sin afirmaciones ni síntesis no produce informe. Investiga primero." },
      { status: 409 }
    );
  }

  const informe = await construirInforme(inv);
  return NextResponse.json({ ok: true, informe });
}
