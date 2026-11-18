// v407.0 · GET /api/sistema/endpoints — el catálogo de la casa, servido como JSON
//
// Qué hay y qué está documentado de verdad. Los endpoints nuevos usan el
// contrato de `sistema/contrato.ts`; los antiguos siguen con el suyo (no se
// toca ninguno: compatibilidad hacia atrás).
import { muro, claveCliente } from "@/lib/fortaleza";
import { ok, fallo, conManejo, cacheable, validar } from "@/lib/sistema/contrato";
import { ENDPOINTS_DOCUMENTADOS, RUTAS_INVENTARIADAS, coberturaApi, GRUPOS_API } from "@/lib/api/catalogo";

export const dynamic = "force-dynamic";

export const GET = conManejo("/api/sistema/endpoints", async (req, t0) => {
  const veredicto = muro(`sistema-endpoints:${claveCliente(req)}`, 60, 60_000);
  if (!veredicto.permitido) return fallo("MURO", `Demasiadas peticiones. Espera ${veredicto.espera} s.`, undefined, { t0 });

  const url = new URL(req.url);
  const grupo = validar.unoDe(url.searchParams.get("grupo"), "grupo", GRUPOS_API, null);

  const documentados = grupo
    ? ENDPOINTS_DOCUMENTADOS.filter((e) => e.grupo === grupo)
    : ENDPOINTS_DOCUMENTADOS;

  return ok(
    {
      grupos: [...GRUPOS_API],
      documentados,
      inventariados: RUTAS_INVENTARIADAS,
      cobertura: coberturaApi(),
      contrato: {
        forma: "{ ok, api, version, datos, meta }",
        errores: ["VALIDACION", "NO_ENCONTRADO", "MURO", "PERMISO", "PROVEEDOR", "INTERNO"],
        nota:
          "Los endpoints documentados tienen contrato revisado. Los inventariados existen (las pruebas comprueban la ruta) pero su contrato NO se ha verificado.",
      },
    },
    { t0, cabeceras: cacheable(300) }
  );
});
