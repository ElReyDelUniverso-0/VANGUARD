// ═══════════════════════════════════════════════════════════════════
// v431.5 · /api/radio/programa — el programa del día, servido una vez
//
// POR QUÉ EXISTE: la emisora global vive en el layout y suena en TODA la
// casa. Si cada pantalla construyera el guion por su cuenta, la portada, el
// Cuartel y la radio podrían leer días distintos. Aquí se arma UNA vez, en el
// servidor, con los mismos cables reales (`obtenerNotas`) y el mismo guion
// (`construirPrograma`), y se sirve con caché de 5 minutos.
//
// Contrato de la casa: si no hay cables, se dice con `cables: 0` — no se
// inventa ni se rellena. El audio nunca sale de aquí: esto es texto.
// ═══════════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { obtenerNotas, type Nota } from "@/lib/portada/notas";
import { construirPrograma, type EstiloRadio } from "@/lib/radio/guion";
import { estadisticas } from "@/lib/radio/agrupar";

export const revalidate = 300;

const ESTILOS: EstiloRadio[] = ["serena", "cercana", "filosa"];
const MINUTOS = [2, 5, 10, 15];

export async function GET(req: Request) {
  const url = new URL(req.url);
  const minBruto = Number(url.searchParams.get("min"));
  const min = MINUTOS.includes(minBruto) ? minBruto : 5;
  const estiloBruto = url.searchParams.get("estilo") as EstiloRadio | null;
  const estilo = estiloBruto && ESTILOS.includes(estiloBruto) ? estiloBruto : "cercana";

  let notas: Nota[] = [];
  try {
    notas = await obtenerNotas();
  } catch {
    notas = [];
  }

  const ahora = Date.now();
  const programa = construirPrograma(notas, {
    estilo,
    objetivoMs: min * 60_000,
    conResumen: true,
    conFuentes: true,
    ahora,
  });
  const e = estadisticas(notas, ahora);

  return NextResponse.json(
    {
      ok: true,
      version: "v431.5",
      estilo,
      minutos: min,
      programa,
      cifras: {
        cables: e.cables,
        asuntos: e.asuntos,
        medios: e.medios,
        repetidos: e.repetidos,
        regiones: e.regiones.length,
        regionTop: e.regiones[0] ?? null,
      },
    },
    {
      headers: {
        "cache-control": "public, s-maxage=300, stale-while-revalidate=900",
      },
    }
  );
}
