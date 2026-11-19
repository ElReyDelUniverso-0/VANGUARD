// ═══════════════════════════════════════════════════════════════════
// v416.0 · /datos-mundiales/pais/[iso] — LA FICHA DE DATOS NACIONALES
// Departamento 4 · VANGUARD WORLD DATA
//
// La ficha del país que ya existía (/mundos/[iso]) cuenta su historia, sus
// cables y su mapa. Esta es la otra mitad: la hoja de datos. Seis cifras de
// cabecera y, por categoría, todos los indicadores con su valor, su año, su
// fuente, su método y la forma de la serie en miniatura.
//
// Coste controlado: no se piden los 52 indicadores de golpe (serían 52 llamadas
// por visita). Se piden los 6 de cabecera más los de la categoría elegida, en
// paralelo y con caché de una hora en la plataforma.
// ═══════════════════════════════════════════════════════════════════
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SITE_URL } from "@/lib/site";
import { MarcoDatos } from "@/components/mundial/marco-datos";
import { Sparkline } from "@/components/mundial/sparkline";
import { INDICADORES, CATEGORIAS, indicador as buscar, type CategoriaId } from "@/lib/mundial/catalogo";
import { catalogoPaises, seriesDeVarios } from "@/lib/mundial/banco";
import { fmtValor, SIN_DATO } from "@/lib/mundial/formato";
import { explicarSerie } from "@/lib/mundial/explicar";

export const revalidate = 3600;

const CABECERA = ["poblacion", "pib", "pib_pc", "esperanza_vida", "alfabetizacion", "poblacion_urbana"];

interface Props {
  params: Promise<{ iso: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { iso } = await params;
  const paises = await catalogoPaises();
  const p = paises.find((x) => x.iso2 === iso.toLowerCase());
  const nombre = p?.nombre ?? iso.toUpperCase();
  return {
    title: `Datos de ${nombre}: población, economía, salud y educación con fuente | VANGUARD`,
    description: `Hoja de datos de ${nombre}: 52 indicadores del Banco Mundial con su año, su unidad, su fuente y su método. Sin estimaciones propias.`,
    alternates: { canonical: `${SITE_URL}/datos-mundiales/pais/${iso.toLowerCase()}` },
  };
}

export default async function FichaPaisPage({ params, searchParams }: Props) {
  const { iso } = await params;
  const sp = await searchParams;
  const codigo = iso.toLowerCase();
  if (!/^[a-z]{2}$/.test(codigo)) notFound();

  const catCruda = typeof sp.cat === "string" ? sp.cat : "economia";
  const categoria = (CATEGORIAS.find((c) => c.id === catCruda)?.id ?? "economia") as CategoriaId;

  const paises = await catalogoPaises();
  const pais = paises.find((p) => p.iso2 === codigo);
  if (!pais) notFound();

  const deCategoria = INDICADORES.filter((i) => i.categoria === categoria);
  const idsCabecera = CABECERA.filter((id) => !deCategoria.some((i) => i.id === id));
  const listaInd = [...deCategoria, ...idsCabecera.map((id) => buscar(id)).filter((x): x is NonNullable<typeof x> => Boolean(x))];

  const porIndicador = await Promise.all(
    listaInd.map(async (ind) => ({ ind, serie: (await seriesDeVarios([codigo], ind, 1990))[0] }))
  );

  const cabecera = porIndicador.filter((x) => CABECERA.includes(x.ind.id));
  const categoriaBloque = porIndicador.filter((x) => x.ind.categoria === categoria);

  return (
    <MarcoDatos
      activo="/datos-mundiales/pais/do"
      volanta={`Mundo en cifras · Ficha nacional · ${pais.region}`}
      titulo={pais.nombre}
      sub={
        <>
          {pais.renta} · capital {pais.capital || "sin dato"} · código ISO {pais.iso2.toUpperCase()} / {pais.iso3}. Todos los valores provienen del
          Banco Mundial con el año pegado; lo que no publica se escribe <b>sin dato</b>.
          <Link
            href={`/inteligencia?q=${encodeURIComponent(`¿Qué dicen las fuentes sobre ${pais.nombre}: economía, población y postura exterior?`)}`}
            className="vx-md-chip-investigar"
            style={{ display: "inline-flex", marginTop: 8, minHeight: 32, alignItems: "center", gap: 6, fontFamily: "ui-monospace, monospace", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.12em" }}
          >
            Investigar este país en la Cámara →
          </Link>
        </>
      }
      cifras={cabecera.map(({ ind, serie }) => ({
        valor: serie?.ultimo ? fmtValor(serie.ultimo.valor, ind) : SIN_DATO,
        etiqueta: ind.nombre,
        nota: `${ind.unidad} · dato de ${serie?.ultimo?.anio ?? "—"} · ${serie?.puntos.length ?? 0} años con dato`,
      }))}
    >
      <p><Link href={`/organizaciones/redes?pais=${codigo}`}>Ver relaciones institucionales documentadas de {pais.nombre} →</Link></p>
      <section className="vx-md-panel">
        <h2 className="vx-md-h2">Explorar por categoría</h2>
        <p className="vx-md-h2-sub">
          Cada categoría trae todos sus indicadores con su serie completa. La cabecera de arriba siempre enseña las mismas seis cifras para poder
          comparar fichas entre países.
        </p>
        <div className="vx-md-chips">
          {CATEGORIAS.map((c) => (
            <Link
              key={c.id}
              href={`/datos-mundiales/pais/${codigo}?cat=${c.id}`}
              className="vx-md-chip"
              data-on={c.id === categoria ? "1" : "0"}
              style={{ textDecoration: "none" }}
            >
              {c.nombre} · {INDICADORES.filter((i) => i.categoria === c.id).length}
            </Link>
          ))}
        </div>
      </section>

      <section className="vx-md-panel">
        <h2 className="vx-md-h2">
          {CATEGORIAS.find((c) => c.id === categoria)?.nombre} en {pais.nombre}
        </h2>
        <p className="vx-md-h2-sub">{CATEGORIAS.find((c) => c.id === categoria)?.resumen}</p>
        <div className="vx-md-rejilla vx-md-2">
          {categoriaBloque.map(({ ind, serie }) => (
            <article className="vx-md-ficha-ind" key={ind.id}>
              <header>
                <h3>{ind.nombre}</h3>
                <span className="valor">{serie?.ultimo ? fmtValor(serie.ultimo.valor, ind) : SIN_DATO}</span>
              </header>
              <p className="vx-md-meta">
                {ind.pregunta} · {ind.unidad} · año {serie?.ultimo?.anio ?? "sin dato"} · código {ind.codigo}
              </p>
              {serie && serie.puntos.length >= 2 ? <Sparkline puntos={serie.puntos} /> : null}
              <p>{ind.metodo}</p>
              <p className="vx-md-meta">
                {serie?.puntos.length ? explicarSerie(serie.puntos, ind, pais.nombre) : `${pais.nombre}: la fuente no publica este indicador.`}
              </p>
              <p className="vx-md-meta">
                Fuente: {ind.fuente} · {ind.licencia} ·{" "}
                <a href={ind.urlDefinicion} target="_blank" rel="noreferrer noopener" style={{ color: "#5eead4" }}>
                  definición
                </a>{" "}
                ·{" "}
                <Link href={`/datos-mundiales/comparar?paises=${codigo},do&indicadores=${ind.id}`} style={{ color: "#5eead4" }}>
                  comparar
                </Link>
              </p>
            </article>
          ))}
        </div>
      </section>

      {cabecera.length ? (
        <section className="vx-md-panel">
          <h2 className="vx-md-h2">Las seis cifras de cabecera</h2>
          <p className="vx-md-h2-sub">Las mismas en todas las fichas: así dos países se pueden poner uno al lado del otro sin cambiar de página.</p>
          <div className="vx-md-rejilla vx-md-2">
            {cabecera.map(({ ind, serie }) => (
              <article className="vx-md-ficha-ind" key={ind.id}>
                <header>
                  <h3>{ind.nombre}</h3>
                  <span className="valor">{serie?.ultimo ? fmtValor(serie.ultimo.valor, ind) : SIN_DATO}</span>
                </header>
                <p className="vx-md-meta">
                  {ind.unidad} · año {serie?.ultimo?.anio ?? "sin dato"}
                </p>
                {serie && serie.puntos.length >= 2 ? <Sparkline puntos={serie.puntos} color="#5eead4" /> : null}
                <p className="vx-md-meta">{ind.metodo}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="vx-md-panel">
        <h2 className="vx-md-h2">Otras puertas de este país</h2>
        <div className="vx-md-rejilla vx-md-4">
          <Link href={`/mundos/${codigo}`} className="vx-md-cifra" style={{ textDecoration: "none" }}>
            <b>Ficha</b>
            <span>Historia y cables</span>
            <small>La ficha narrativa del país: memoria, conflictos y noticias del día.</small>
          </Link>
          <Link href={`/datos-mundiales/comparar?paises=${codigo},do`} className="vx-md-cifra" style={{ textDecoration: "none" }}>
            <b>Comparar</b>
            <span>Con otro país</span>
            <small>Ponlo al lado de cualquier otro con hasta seis indicadores.</small>
          </Link>
          <Link href={`/datos-mundiales?indicador=poblacion`} className="vx-md-cifra" style={{ textDecoration: "none" }}>
            <b>Ranking</b>
            <span>Su puesto en el mundo</span>
            <small>Ordena el planeta entero por cualquier indicador y busca su fila.</small>
          </Link>
          <Link href={`/datos-mundiales/panel?indicador=${categoriaBloque[0]?.ind.id ?? "poblacion"}`} className="vx-md-cifra" style={{ textDecoration: "none" }}>
            <b>Panel</b>
            <span>Su región en el mundo</span>
            <small>La serie del planeta y de los agregados regionales del Banco Mundial.</small>
          </Link>
        </div>
      </section>
    </MarcoDatos>
  );
}
