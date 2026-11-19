// v420.0 VANGUARD LINGUA — GET /api/lingua/arbol?id=<glottocode>
// Devuelve los hijos inmediatos de un nodo del árbol (familias, lenguas y
// dialectos) y su detalle (resumen, puntos del mapa, ficha histórica).
import type { NextRequest } from "next/server";
import { cacheable, fallo, ok } from "@/lib/sistema/contrato";
import { muro, claveCliente } from "@/lib/fortaleza";
import { detalleArbol, hijosArbol } from "@/lib/lingua/arbol";

export function GET(req: NextRequest) {
  const t0 = Date.now();
  if (!muro(`lingua-arbol:${claveCliente(req)}`, 120, 60_000).permitido) return fallo("MURO", "Demasiadas consultas al árbol; espera un momento.");
  const id = req.nextUrl.searchParams.get("id") ?? "";
  if (!/^[a-z0-9]{4}\d{4}$/.test(id)) return fallo("VALIDACION", "id debe ser un glottocode (cuatro caracteres y cuatro cifras).");
  const detalle = detalleArbol(id);
  if (!detalle) return fallo("NO_ENCONTRADO", "Ese glottocode no está en Glottolog 5.4.");
  return ok({ detalle, hijos: hijosArbol(id) }, { t0, cabeceras: cacheable(3600) });
}
