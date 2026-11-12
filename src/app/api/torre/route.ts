// ============================================================
// v367.1 EL OJO DEL DUEÑO — /api/torre
//   POST  → el aparato del visitante anota UNA señal (anónima)
//   GET   → el parte de la Torre (lo que la sala pinta)
//
// Ley v211 (muro por objeto) y ley de la casa (validar y limitar en el
// SERVIDOR): la señal entra por whitelist cerrada, el número de ms solo se
// acepta como número finito y se guarda por TRAMOS, y el muro corta a quien
// intente usar la Torre de ariete. Ni IP ni user-agent se guardan: solo se
// usan en memoria para el muro (claveCliente) y se descartan.
// ============================================================
import { NextResponse } from "next/server";
import { anotarSenal, esSenalTorre, leerTorre } from "@/lib/torre";
import { muro, claveCliente } from "@/lib/fortaleza";

export const dynamic = "force-dynamic";

// POST — anotar una señal del aparato (una por suceso; el panel trae cerradura)
export async function POST(req: Request) {
  const veredicto = muro(`torre-post:${claveCliente(req)}`, 120, 60_000);
  if (!veredicto.permitido) {
    return NextResponse.json(
      { ok: false, error: "Demasiadas señales — la Torre descansa un momento." },
      { status: 429 },
    );
  }

  let cuerpo: unknown = null;
  try {
    cuerpo = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Cuerpo ilegible." }, { status: 400 });
  }

  const datos = (cuerpo ?? {}) as { senal?: unknown; ms?: unknown };
  if (!esSenalTorre(datos.senal)) {
    return NextResponse.json(
      { ok: false, error: "Señal desconocida — la Torre no anota lo que no entiende." },
      { status: 400 },
    );
  }

  const ms =
    typeof datos.ms === "number" && Number.isFinite(datos.ms) && datos.ms >= 0 && datos.ms < 600_000
      ? datos.ms
      : null;

  try {
    await anotarSenal(datos.senal, ms);
    return NextResponse.json(
      { ok: true, senal: datos.senal, medido: ms !== null },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    // fail-soft honesto: la telemetría NUNCA puede romper la casa del visitante
    return NextResponse.json({ ok: false, error: "La Torre no pudo anotar." }, { status: 200 });
  }
}

// GET — el parte completo
export async function GET(req: Request) {
  const veredicto = muro(`torre-get:${claveCliente(req)}`, 60, 60_000);
  if (!veredicto.permitido) {
    return NextResponse.json(
      { ok: false, error: "Demasiadas lecturas — espera unos segundos." },
      { status: 429 },
    );
  }
  const resumen = await leerTorre();
  return NextResponse.json(resumen, { headers: { "Cache-Control": "no-store" } });
}
