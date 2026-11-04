// ============================================================
// v224.0 EL ESTRATEGA — API DEL ESCENARIO (server-only)
//   GET  → el catálogo (escena, supuestos, variables, límites)
//          + el escenario ejecutado con los pesos por defecto.
//   POST → { variables: { pesoTiempo?, pesoCobertura?, … } }
//          pesos validados contra el catálogo: clave desconocida,
//          no numérica o fuera de rango → 400 con los errores
//          declarados. NADA de código de usuarios: solo números
//          en rango (ley del mandato).
// Muro objeto (ley v211: se juzga .permitido). Nada privado:
// solo datos documentados del repo y del Banco Mundial.
// ============================================================

import { NextResponse } from "next/server";
import { muro, claveCliente } from "@/lib/fortaleza";
import { catalogoSimulacion, ejecutarEscenario } from "@/lib/nucleo/simulacion";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const veredicto = muro(`nucleo-sim:${claveCliente(req)}`, 30, 60_000);
  if (!veredicto.permitido) {
    return NextResponse.json(
      { ok: false, error: "Demasiadas peticiones — respira y vuelve en un minuto." },
      { status: 429 }
    );
  }
  try {
    const escenario = await ejecutarEscenario(undefined); // pesos por defecto
    if (!escenario.ok) {
      return NextResponse.json({ ok: false, error: "El escenario no pudo ejecutarse" }, { status: 500 });
    }
    return NextResponse.json({ ...escenario, catalogo: catalogoSimulacion() });
  } catch {
    return NextResponse.json(
      { ok: false, error: "El escenario no responde — los datos vivos fallaron" },
      { status: 503 }
    );
  }
}

export async function POST(req: Request) {
  const veredicto = muro(`nucleo-sim:${claveCliente(req)}`, 30, 60_000);
  if (!veredicto.permitido) {
    return NextResponse.json(
      { ok: false, error: "Demasiadas peticiones — respira y vuelve en un minuto." },
      { status: 429 }
    );
  }

  // El cuerpo llega crudo: la validación VIVE en la lib (misma regla
  // para API y página), el route solo la sirve con su 400 honesto.
  let cuerpo: unknown = undefined;
  try {
    cuerpo = await req.json();
  } catch {
    cuerpo = undefined; // sin cuerpo → pesos por defecto (honesto)
  }
  const variables = (cuerpo as { variables?: unknown } | null)?.variables ?? undefined;

  try {
    const escenario = await ejecutarEscenario(variables);
    if (!escenario.ok) {
      return NextResponse.json(escenario, { status: 400 }); // errores declarados
    }
    return NextResponse.json(escenario);
  } catch {
    return NextResponse.json(
      { ok: false, error: "El escenario no responde — los datos vivos fallaron" },
      { status: 503 }
    );
  }
}
