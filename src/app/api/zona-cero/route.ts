// v432.0 UN SOLO MUNDO · ZONA CERO — GET /api/zona-cero?q=…&filtro=…
// El buscador del ojo: las fuentes públicas del Núcleo + Arsenal + salas de
// los módulos, con imagen cuando la casa la tiene con crédito. Sin q (o con
// menos de 2 letras) devuelve los destacados del día. Contrato de la casa.
import { conManejo, fallo, ok } from "@/lib/sistema/contrato";
import { muro, claveCliente } from "@/lib/fortaleza";
import { buscarZonaCero } from "@/lib/zona-cero/buscar";

export const dynamic = "force-dynamic";

export const GET = conManejo("zona-cero.buscar", async (req, t0) => {
  if (!muro(`zona-cero:${claveCliente(req)}`, 40, 60_000).permitido) {
    return fallo("MURO", "Demasiadas búsquedas seguidas; espera unos segundos.", undefined, { t0 });
  }
  const url = new URL(req.url);
  const datos = await buscarZonaCero(url.searchParams.get("q") ?? "", url.searchParams.get("filtro") ?? "todo");
  return ok(datos, { t0 });
});
