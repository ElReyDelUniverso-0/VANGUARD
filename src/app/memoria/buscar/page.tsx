import type { Metadata } from "next";
import Link from "next/link";
import { buscarEnArchivo } from "@/lib/memoria/buscar";
import { FUENTES, TIPOS, type FuenteId, type TipoDocumento } from "@/lib/memoria/tipos";
import { SITE_URL } from "@/lib/site";
import { BuscadorMemoria, Cronologia } from "@/components/memoria/buscador-memoria";
import { TarjetaDocumento } from "@/components/memoria/tarjeta-documento";
import "../../memoria/memoria.css";

// ═══════════════════════════════════════════════════════════════════
// v419.0 · /memoria/buscar — la consulta
//
// Todo lo que se enseña viene de las fuentes en este momento. Si una fuente
// no contesta, se escribe su nombre y el motivo: no se convierte en un «0
// resultados» que sería falso.
// ═══════════════════════════════════════════════════════════════════

export const metadata: Metadata = {
  title: "Buscar en el archivo — documentos, fotografías y mapas",
  description:
    "Busca a la vez en la Library of Congress, el Internet Archive y Wikimedia Commons. Filtros por tipo, autor, fuente y rango de años, con el estado de derechos de cada documento.",
  alternates: { canonical: `${SITE_URL}/memoria/buscar` },
  robots: { index: false, follow: true },
};

type Params = Record<string, string | string[] | undefined>;

function uno(v: string | string[] | undefined): string {
  return Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
}

function anio(v: string): number | null {
  const n = Number(v);
  return Number.isInteger(n) && n >= 1000 && n <= 2100 ? n : null;
}

export default async function BuscarMemoriaPage({ searchParams }: { searchParams: Promise<Params> }) {
  const sp = await searchParams;
  const q = uno(sp.q).slice(0, 160);
  const autor = uno(sp.autor).slice(0, 80);
  const fuenteCruda = uno(sp.fuente);
  const tipoCrudo = uno(sp.tipo);
  const desdeTxt = uno(sp.desde);
  const hastaTxt = uno(sp.hasta);
  const paginaTxt = uno(sp.pagina);

  const fuente: FuenteId | "todas" = FUENTES.includes(fuenteCruda as FuenteId) ? (fuenteCruda as FuenteId) : "todas";
  const tipo = TIPOS.includes(tipoCrudo as TipoDocumento) ? (tipoCrudo as TipoDocumento) : null;
  const desde = anio(desdeTxt);
  const hasta = anio(hastaTxt);
  const pagina = Math.min(10, Math.max(1, Number(paginaTxt) || 1));

  const hayConsulta = Boolean(q || autor || tipo || desde || hasta || fuente !== "todas");
  const cosecha = hayConsulta
    ? await buscarEnArchivo({ q, autor: autor || null, fuente, tipo, desde, hasta, pagina })
    : null;

  const titulo = q || autor ? `«${[q, autor].filter(Boolean).join(" ")}»` : "todo el archivo";

  return (
    <main className="vx-mem">
      <div className="vx-mem-caja">
        <header>
          <p className="vx-mem-volanta">Vanguard · Memory Archive</p>
          <h1 className="vx-mem-titulo">Buscar en el archivo</h1>
          <p className="vx-mem-sub">
            {hayConsulta
              ? `Consulta: ${titulo}${desde || hasta ? ` · ${desde ?? "…"}–${hasta ?? "…"}` : ""}${tipo ? ` · ${tipo}` : ""}.`
              : "Escribe qué buscas. Se consultan las tres instituciones a la vez y cada documento conserva su procedencia."}
          </p>
        </header>

        <BuscadorMemoria
          valores={{
            q,
            autor,
            fuente,
            tipo: tipo ?? "",
            desde: desdeTxt,
            hasta: hastaTxt,
          }}
        />

        {!cosecha ? (
          <section className="vx-mem-sec">
            <p className="vx-mem-nota">
              Sin consulta no hay resultados que enseñar, y el archivo no rellena la página con lo más visto: eso sería
              inventar una selección que nadie ha hecho. Prueba con un tema («declaration», «map of america»), un autor
              («Lincoln») o un período.
            </p>
          </section>
        ) : (
          <>
            <div className="vx-mem-fuentes">
              {cosecha.porFuente.map((f) => (
                <div key={f.fuente} className="vx-mem-fuente" data-estado={f.error ? "error" : "ok"}>
                  <strong>{f.nombre}</strong>
                  {f.error ? `no contestó · ${f.error}` : `${f.cuantos} documentos${f.total !== null ? ` de ${f.total.toLocaleString("es")}` : ""}`}
                </div>
              ))}
            </div>

            {cosecha.avisos.length ? (
              <ul className="vx-mem-avisos">
                {cosecha.avisos.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            ) : null}

            {cosecha.decadas.length ? (
              <section className="vx-mem-sec">
                <h2>Cronología de lo encontrado</h2>
                <p className="vx-mem-nota">Cada barra es una década con documentos en esta consulta. Púlsala para quedarte en esos diez años.</p>
                <Cronologia decadas={cosecha.decadas} q={[q, autor].filter(Boolean).join(" ")} desde={fuente !== "todas" ? fuente : undefined} />
              </section>
            ) : null}

            <section className="vx-mem-sec">
              <h2>Documentos</h2>
              {cosecha.documentos.length === 0 ? (
                <p className="vx-mem-nota">
                  Ninguna fuente devolvió documentos con estos filtros. No es un error: es lo que hay. Prueba a quitar el
                  tipo o a ampliar los años.
                </p>
              ) : (
                <div className="vx-mem-rejilla">
                  {cosecha.documentos.map((d) => (
                    <TarjetaDocumento key={d.clave} documento={d} />
                  ))}
                </div>
              )}
            </section>

            <nav className="vx-mem-sec" aria-label="Paginación">
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {pagina > 1 ? (
                  <Link className="vx-mem-boton vx-mem-boton--fantasma" href={urlPagina({ q, autor, fuente, tipo, desde: desdeTxt, hasta: hastaTxt, pagina: pagina - 1 })}>
                    ← Página anterior
                  </Link>
                ) : null}
                <Link className="vx-mem-boton vx-mem-boton--fantasma" href={urlPagina({ q, autor, fuente, tipo, desde: desdeTxt, hasta: hastaTxt, pagina: pagina + 1 })}>
                  Página siguiente →
                </Link>
              </div>
            </nav>
          </>
        )}

        <div className="vx-mem-pie">
          <p>
            Los documentos se sirven desde su institución. El archivo no aloja copias ni reescribe descripciones.{" "}
            <Link href="/memoria">Volver a la portada del archivo</Link> · <Link href="/memoria/fuentes">Fuentes y derechos</Link>
          </p>
        </div>
      </div>
    </main>
  );
}

function urlPagina(v: {
  q: string;
  autor: string;
  fuente: FuenteId | "todas";
  tipo: TipoDocumento | null;
  desde: string;
  hasta: string;
  pagina: number;
}): string {
  const p = new URLSearchParams();
  if (v.q) p.set("q", v.q);
  if (v.autor) p.set("autor", v.autor);
  if (v.fuente !== "todas") p.set("fuente", v.fuente);
  if (v.tipo) p.set("tipo", v.tipo);
  if (v.desde) p.set("desde", v.desde);
  if (v.hasta) p.set("hasta", v.hasta);
  if (v.pagina > 1) p.set("pagina", String(v.pagina));
  return `/memoria/buscar?${p.toString()}`;
}
