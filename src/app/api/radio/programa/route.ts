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
//
// ── v437.0 · EL PROGRAMA EN TU IDIOMA ──────────────────────────────────────
// `?lang=en|pt|fr|de|it|ru|zh` elige el MARCA (lo que la casa dice: sintonía,
// cifras, puentes, cierre). Los cables se leen como se publicaron y la respuesta
// lo declara en `idiomaDeLosCables: "fuente"`. Un código que la casa no tiene no
// rompe nada: cae a español y se devuelve `idiomaPedido` para que se vea.
// ═══════════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { APP_VERSION } from "@/lib/version";
import { obtenerNotas, type Nota } from "@/lib/portada/notas";
import { construirPrograma, type EstiloRadio } from "@/lib/radio/guion";
import { ORDEN_IDIOMAS, esIdiomaVoz, idiomaVoz, type IdiomaVozId } from "@/lib/voz/idiomas";
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
  const langBruto = (url.searchParams.get("lang") || "es").slice(0, 2).toLowerCase();
  const idioma: IdiomaVozId = esIdiomaVoz(langBruto) ? langBruto : "es";

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
    idioma,
  });
  const e = estadisticas(notas, ahora);

  return NextResponse.json(
    {
      ok: true,
      // v437.1 · la versión la dice la casa, no una cadena copiada a mano
      version: APP_VERSION,
      estilo,
      idioma,
      idiomaPedido: langBruto,
      idiomaNativo: idiomaVoz(idioma).nativo,
      bcp47: idiomaVoz(idioma).bcp47,
      idiomasDisponibles: ORDEN_IDIOMAS,
      // los cables NO se traducen: viajan en el idioma en que se publicaron
      idiomaDeLosCables: "fuente",
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
