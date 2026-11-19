// v420.0 VANGUARD LINGUA — GET /api/lingua/buscar?q=
// Búsqueda de lenguas, familias y dialectos en Glottolog 5.4.
import type { NextRequest } from "next/server";
import { cacheable, fallo, ok } from "@/lib/sistema/contrato";
import { muro, claveCliente } from "@/lib/fortaleza";
import { buscarLingua } from "@/lib/lingua/servidor";
import { rutaFamilia, rutaIdioma } from "@/lib/lingua/tipos";

export function GET(req: NextRequest) {
  const t0 = Date.now();
  if (!muro(`lingua-buscar:${claveCliente(req)}`, 60, 60_000).permitido) return fallo("MURO", "Demasiadas búsquedas; espera un momento.");
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
  if (q.length < 2 || q.length > 80) return fallo("VALIDACION", "q debe tener entre 2 y 80 caracteres.");
  const resultados = buscarLingua(q, 20).map((r) => ({ ...r, ruta: r.tipo === "familia" ? rutaFamilia(r.id) : rutaIdioma(r.id) }));
  return ok({ q, resultados, fuente: "Glottolog 5.4 (CC BY 4.0)" }, { t0, cabeceras: cacheable(3600) });
}
