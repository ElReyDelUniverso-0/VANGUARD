// v407.0 · GET /api/sistema/datos — el catálogo central de datos
import { muro, claveCliente } from "@/lib/fortaleza";
import { ok, fallo, conManejo, cacheable } from "@/lib/sistema/contrato";
import { MODELOS_DATO, coberturaCatalogo, mapaDeModelos } from "@/lib/datos/catalogo";

export const dynamic = "force-dynamic";

export const GET = conManejo("/api/sistema/datos", async (req, t0) => {
  const veredicto = muro(`sistema-datos:${claveCliente(req)}`, 60, 60_000);
  if (!veredicto.permitido) return fallo("MURO", `Demasiadas peticiones. Espera ${veredicto.espera} s.`, undefined, { t0 });

  const url = new URL(req.url);
  const id = (url.searchParams.get("modelo") ?? "").trim();
  if (id) {
    const m = mapaDeModelos().get(id);
    if (!m) {
      return fallo("NO_ENCONTRADO", "Ese modelo no está en el catálogo.", {
        modelos: MODELOS_DATO.map((x) => x.id),
      }, { t0 });
    }
    return ok(m, { t0, cabeceras: cacheable(300) });
  }
  return ok({ modelos: MODELOS_DATO, cobertura: coberturaCatalogo() }, { t0, cabeceras: cacheable(300) });
});
