// v419.0 · GET /api/memoria/documento?fuente=loc&id=mtjbib000159
//
// La ficha completa de una pieza: metadatos, caras digitalizadas, notas,
// materias, los límites declarados y —referencia cruzada— los expedientes de
// la casa que la citan.
import { muro, claveCliente } from "@/lib/fortaleza";
import { ok, fallo, conManejo, cacheable, validar } from "@/lib/sistema/contrato";
import { obtenerDocumento, acontecimientosQueLoCitan, documentosVecinos } from "@/lib/memoria/documento";
import { FUENTES } from "@/lib/memoria/tipos";
import type { FuenteId } from "@/lib/memoria/tipos";

export const dynamic = "force-dynamic";

export const GET = conManejo("/api/memoria/documento", async (req, t0) => {
  const veredicto = muro(`memoria-doc:${claveCliente(req)}`, 60, 60_000);
  if (!veredicto.permitido) {
    return fallo("MURO", `Demasiadas consultas. Espera ${veredicto.espera} s.`, undefined, { t0 });
  }

  const url = new URL(req.url);
  const fuente = validar.unoDe(url.searchParams.get("fuente"), "fuente", FUENTES, null);
  const id = validar.texto(url.searchParams.get("id"), "id", { max: 120, requerido: true });
  if (!fuente) return fallo("VALIDACION", "«fuente» debe ser loc, ia o commons.", { campo: "fuente" }, { t0 });

  const ficha = await obtenerDocumento(fuente, id);
  if (!ficha) {
    return fallo("NO_ENCONTRADO", "La fuente no devuelve esta pieza, o no existe.", { fuente, id }, { t0 });
  }

  return ok(
    {
      documento: ficha,
      citadoEn: acontecimientosQueLoCitan(fuente as FuenteId, id),
      vecinos: documentosVecinos(fuente as FuenteId, id),
      claveArchivo: `${fuente}:${id}`,
    },
    { t0, cache: { hits: 0, fallos: 0, claves: 1 }, cabeceras: cacheable(3600) }
  );
});
