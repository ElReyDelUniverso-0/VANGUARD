// v419.0 · GET /api/memoria/buscar — el buscador del archivo, para las máquinas
//
//   ?q=declaracion&fuente=loc|ia|commons|todas&tipo=fotografia|mapa|documento|
//   discurso|publicacion|audio&desde=1776&hasta=1783&autor=jefferson&pagina=1
//
// Devuelve los documentos normalizados y, con la misma honestidad que la
// página, qué fuente no contestó. Nada se cachea en la casa: se cachea la
// respuesta de las fuentes una hora.
import { muro, claveCliente } from "@/lib/fortaleza";
import { ok, fallo, conManejo, cacheable, validar } from "@/lib/sistema/contrato";
import { buscarEnArchivo } from "@/lib/memoria/buscar";
import { FUENTES, TIPOS } from "@/lib/memoria/tipos";
import type { FuenteId, TipoDocumento } from "@/lib/memoria/tipos";

export const dynamic = "force-dynamic";

const PUERTAS = ["todas", ...FUENTES] as const;

export const GET = conManejo("/api/memoria/buscar", async (req, t0) => {
  const veredicto = muro(`memoria:${claveCliente(req)}`, 30, 60_000);
  if (!veredicto.permitido) {
    return fallo("MURO", `Demasiadas consultas. Espera ${veredicto.espera} s.`, undefined, { t0 });
  }

  const url = new URL(req.url);
  const q = validar.texto(url.searchParams.get("q"), "q", { max: 160 });
  const fuente = validar.unoDe(url.searchParams.get("fuente"), "fuente", PUERTAS, "todas") ?? "todas";
  const tipo = validar.unoDe(url.searchParams.get("tipo"), "tipo", TIPOS, null);
  const autor = validar.texto(url.searchParams.get("autor"), "autor", { max: 80 });
  const desde = url.searchParams.get("desde");
  const hasta = url.searchParams.get("hasta");
  const pagina = validar.entero(url.searchParams.get("pagina"), "pagina", { min: 1, max: 20, porDefecto: 1 });

  const leerAnio = (valor: string | null, campo: string): number | null => {
    if (!valor) return null;
    const n = Number(valor);
    if (!Number.isInteger(n) || n < 1000 || n > 2100) {
      throw Object.assign(new Error(`«${campo}» debe ser un año entre 1000 y 2100.`), { codigo: "VALIDACION" });
    }
    return n;
  };

  const cosecha = await buscarEnArchivo({
    q,
    fuente: fuente as FuenteId | "todas",
    tipo: (tipo as TipoDocumento | null) ?? null,
    desde: leerAnio(desde, "desde"),
    hasta: leerAnio(hasta, "hasta"),
    autor: autor || null,
    pagina,
  });

  return ok(
    {
      consulta: {
        q: cosecha.consulta.q,
        fuente,
        tipo: cosecha.consulta.tipo,
        desde: cosecha.consulta.desde,
        hasta: cosecha.consulta.hasta,
        autor,
        pagina,
      },
      documentos: cosecha.documentos,
      porFuente: cosecha.porFuente,
      porTipo: cosecha.porTipo,
      decadas: cosecha.decadas,
      avisos: cosecha.avisos,
    },
    { t0, cache: { hits: 0, fallos: 0, claves: 1 }, cabeceras: cacheable(900) }
  );
});
