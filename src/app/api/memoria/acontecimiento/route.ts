// v419.0 · GET /api/memoria/acontecimiento?slug=muro-de-berlin
//
// Un expediente completo: el resumen, las piezas fijadas ya resueltas contra
// su fuente (con título, fecha y derechos reales), los documentos que
// aportan las consultas declaradas y lo que el expediente NO tiene.
import { muro, claveCliente } from "@/lib/fortaleza";
import { ok, fallo, conManejo, cacheable, validar } from "@/lib/sistema/contrato";
import { ACONTECIMIENTOS, acontecimiento } from "@/lib/memoria/acontecimientos";
import { buscarEnArchivo } from "@/lib/memoria/buscar";
import { obtenerDocumento } from "@/lib/memoria/documento";
import type { Documento, FichaDocumento } from "@/lib/memoria/tipos";

export const dynamic = "force-dynamic";

export const GET = conManejo("/api/memoria/acontecimiento", async (req, t0) => {
  const veredicto = muro(`memoria-ac:${claveCliente(req)}`, 20, 60_000);
  if (!veredicto.permitido) {
    return fallo("MURO", `Demasiadas consultas. Espera ${veredicto.espera} s.`, undefined, { t0 });
  }

  const url = new URL(req.url);
  const slug = validar.texto(url.searchParams.get("slug"), "slug", { max: 80 });
  if (!slug) {
    return ok(
      {
        acontecimientos: ACONTECIMIENTOS.map((a) => ({
          slug: a.slug,
          titulo: a.titulo,
          volanta: a.volanta,
          desde: a.desde,
          hasta: a.hasta,
          piezas: a.piezas.length,
        })),
      },
      { t0, cache: { hits: 0, fallos: 0, claves: 1 }, cabeceras: cacheable(3600) }
    );
  }

  const ac = acontecimiento(slug);
  if (!ac) return fallo("NO_ENCONTRADO", "No hay ningún expediente con ese nombre.", { slug }, { t0 });

  const fijadas = await Promise.all(
    ac.piezas.map(async (p) => {
      const ficha: FichaDocumento | null = await obtenerDocumento(p.fuente, p.id);
      return {
        papel: p.papel,
        fuente: p.fuente,
        id: p.id,
        disponible: fichasDisponible(ficha),
        documento: ficha,
        urlFuente: ficha?.urlOriginal ?? enlaceFuente(p.fuente, p.id),
      };
    })
  );

  const cosechas = await Promise.all(
    ac.consultas.map((c) =>
      buscarEnArchivo({
        q: c.q,
        fuente: c.fuente,
        tipo: c.tipo ?? null,
        desde: c.desde ?? null,
        hasta: c.hasta ?? null,
        limite: 8,
      })
    )
  );

  const hallazgos: Array<{ nota: string; fuente: string; documentos: Documento[]; avisos: string[] }> = ac.consultas.map(
    (c, i) => ({
      nota: c.nota,
      fuente: c.fuente,
      documentos: cosechas[i].documentos,
      avisos: cosechas[i].avisos,
    })
  );

  return ok(
    {
      acontecimiento: {
        slug: ac.slug,
        titulo: ac.titulo,
        volanta: ac.volanta,
        desde: ac.desde,
        hasta: ac.hasta,
        paises: ac.paises,
        resumen: ac.resumen,
        contexto: ac.contexto,
        noEsta: ac.noEsta,
        referencias: ac.referencias,
      },
      piezas: fijadas,
      hallazgos,
    },
    { t0, cache: { hits: 0, fallos: 0, claves: 1 }, cabeceras: cacheable(1800) }
  );
});

function fichasDisponible(f: FichaDocumento | null): boolean {
  return !!f;
}

function enlaceFuente(fuente: string, id: string): string {
  if (fuente === "loc") return `https://www.loc.gov/item/${id}/`;
  if (fuente === "ia") return `https://archive.org/details/${id}`;
  return `https://commons.wikimedia.org/?curid=${id}`;
}
