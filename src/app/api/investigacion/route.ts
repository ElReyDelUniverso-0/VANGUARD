import { NextRequest, NextResponse } from "next/server";
import {
  TEMAS_INVESTIGACION,
  buscarTemasInvestigacion,
  obtenerTemaInvestigacion,
  metricasInvestigacion,
  type CategoriaInvestigacion,
} from "@/lib/investigacion";

// ═══════════════════════════════════════════════════════════════════
// API /api/investigacion — ACCESO PROGRAMÁTICO A TEMAS SISTÉMICOS
// ═══════════════════════════════════════════════════════════════════

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug") || searchParams.get("id");
  const cat = searchParams.get("cat") as CategoriaInvestigacion | "TODAS" | null;
  const q = searchParams.get("q");
  const statsOnly = searchParams.get("stats") === "1";

  if (statsOnly) {
    return NextResponse.json(metricasInvestigacion(), {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200" },
    });
  }

  if (slug) {
    const tema = obtenerTemaInvestigacion(slug);
    if (!tema) {
      return NextResponse.json({ error: "Tema no encontrado", id: slug }, { status: 404 });
    }
    return NextResponse.json(tema, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200" },
    });
  }

  const temas = buscarTemasInvestigacion({
    categoria: cat ?? "TODAS",
    texto: q ?? undefined,
  });

  return NextResponse.json(
    {
      total: temas.length,
      metricas: metricasInvestigacion(),
      temas,
    },
    {
      headers: { "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600" },
    }
  );
}
