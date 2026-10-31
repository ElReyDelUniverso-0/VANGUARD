import { NextResponse, after } from "next/server";
import { instantaneaPulso } from "@/lib/pulso";
import { muro, claveCliente } from "@/lib/fortaleza";

// v213.0 EL PULSO — el latido JSON de la sala EN VIVO.
// GET /api/pulso → { ok, items, calientes, stats } sin caché jamás
// (ley v125 en espíritu: /api son datos vivos).
//
// «EL PRIMERO EN DAR NOTICIAS»: cada sondeo de la sala (cada 30 s por
// visitante) MIRA la hora del cable más nuevo — si lleva más de 4 min
// sin entrar nada, este mismo latido manda a la redacción a la calle
// (GDELT + 15 medios RSS en paralelo vía /api/news, con su candado
// anti-estampida de 3 min). El muro 40/min sobra para el humano más
// veloz (2/min) y estrangula al scraper.

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(req: Request) {
  // v211 lección heredada: muro() devuelve VeredictoMuro (objeto), no booleano
  const veredictoMuro = muro(`pulso:${claveCliente(req)}`, 40, 60_000);
  if (!veredictoMuro.permitido) {
    return NextResponse.json(
      { ok: false, error: "El pulso respira — espera un momento" },
      { status: 429 }
    );
  }
  try {
    const snap = await instantaneaPulso();
    // la redacción sale a la calle SOLO cuando hace falta (candado interno
    // de /api/news evita estampidas; este disparo es best-effort y mudo)
    const fresco = snap.stats.frescoMin;
    if (fresco === null || fresco > 4) {
      after(async () => {
        try {
          await fetch(new URL("/api/news?limit=5", req.url), { cache: "no-store" });
        } catch { /* el próximo latido vuelve a intentarlo */ }
      });
    }
    return NextResponse.json(
      { ok: true, ...snap },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (e) {
    console.error("pulso error", e);
    return NextResponse.json(
      { ok: false, items: [], calientes: [], error: "instantánea no disponible" },
      { status: 200 }
    );
  }
}
