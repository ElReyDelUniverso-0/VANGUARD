// ============================================================
// v421.9 VANGUARD SCIENCE FRONTIER — piezas del centro.
// Componentes de servidor: cero JavaScript enviado al navegador.
// El buscador funciona con un formulario GET: la URL es el estado y
// cualquier enlace puede reproducir un resultado.
// ============================================================

import Link from "next/link";
import type { ReactNode } from "react";
import {
  DISCIPLINAS,
  ESTADO_INFO,
  NIVEL_INFO,
  TIPO_INFO,
  disciplinaDe,
  fechaLarga,
  ideaDe,
  publicacionDe,
  rutaBusqueda,
  rutaDisciplina,
  rutaIdea,
  rutaPublicacion,
  type DisciplinaId,
  type FiltrosBusqueda,
  type Idea,
  type NivelEvidencia,
  type Publicacion,
  type TipoPublicacion,
} from "@/lib/ciencia/indice";

export const MENU_CIENCIA = [
  { href: "/ciencia", label: "Centro" },
  { href: "/ciencia/explorador", label: "Explorador" },
  { href: "/ciencia/buscar", label: "Buscador" },
  { href: "/ciencia/cronologia", label: "Cronología" },
  { href: "/ciencia/instituciones", label: "Instituciones" },
  { href: "/ciencia/premios", label: "Premios" },
  { href: "/ciencia/experimentos", label: "Experimentos" },
  { href: "/ciencia/tecnologia", label: "Tecnología" },
  { href: "/ciencia/biblioteca", label: "Biblioteca" },
  { href: "/ciencia/metodo", label: "Método" },
];

export function BarraCiencia({ activa }: { activa?: string }) {
  const encendido = activa ?? "/ciencia";
  return (
    <div className="vx-sc-barra">
      <div className="vx-sc-barra-caja">
        <Link className="vx-sc-marca" href="/ciencia" aria-label="VANGUARD Science Frontier">
          <span className="vx-sc-sello" aria-hidden="true">
            S
          </span>
          <span>
            <b>SCIENCE FRONTIER</b>
            <span>VANGUARD · centro científico</span>
          </span>
        </Link>
        <nav className="vx-sc-menu" aria-label="Secciones del centro científico">
          {MENU_CIENCIA.map((m) => (
            <Link key={m.href} href={m.href} aria-current={encendido === m.href ? "page" : undefined}>
              {m.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}

export function Migas({ pasos }: { pasos: { href?: string; label: string }[] }) {
  return (
    <nav className="vx-sc-migas" aria-label="Ruta de navegación">
      {pasos.map((p, i) => (
        <span key={`${p.label}-${i}`}>
          {p.href ? <Link href={p.href}>{p.label}</Link> : <span aria-current="page">{p.label}</span>}
          {i < pasos.length - 1 ? <span aria-hidden="true"> › </span> : null}
        </span>
      ))}
    </nav>
  );
}

export function SelloTipo({ tipo }: { tipo: TipoPublicacion }) {
  const info = TIPO_INFO[tipo];
  return (
    <span className="vx-sc-sello-tipo" style={{ color: info.color }} title={info.detalle}>
      {info.etiqueta}
    </span>
  );
}

export function SelloNivel({ nivel }: { nivel: NivelEvidencia }) {
  const info = NIVEL_INFO[nivel];
  const color = nivel === "hipotesis" ? "#fb7185" : nivel === "registro" ? "#94a3b8" : "#cbd5e1";
  return (
    <span className="vx-sc-sello-nivel" data-fuerza={info.fuerza} style={{ color }} title={info.detalle}>
      {info.etiqueta}
    </span>
  );
}

export function EstadoIdea({ estado }: { estado: Idea["estado"] }) {
  const info = ESTADO_INFO[estado];
  return (
    <span className="vx-sc-estado" style={{ color: info.color }} title={info.detalle}>
      {info.etiqueta}
    </span>
  );
}

/** Lista de autores con el total real cuando hay más de los mostrados. */
export function Autores({ p, max = 6 }: { p: Publicacion; max?: number }) {
  if (p.autores.length === 0) return <span className="vx-sc-hueco">Sin autores en el registro ({p.medio})</span>;
  const visibles = p.autores.slice(0, max);
  return (
    <div className="vx-sc-autores">
      {visibles.map((a) => (
        <span key={a.nombre}>{a.nombre}</span>
      ))}
      {p.totalAutores > visibles.length ? <span>y {p.totalAutores - visibles.length} más</span> : null}
    </div>
  );
}

/** La ficha que se repite en buscador, idea, disciplina y biblioteca. */
export function TarjetaPublicacion({ p }: { p: Publicacion }) {
  const idea = ideaDe(p.ideaId);
  return (
    <article className="vx-sc-ficha">
      <div className="vx-sc-sellos">
        <SelloTipo tipo={p.tipo} />
        <SelloNivel nivel={p.nivel} />
        <span className="vx-sc-meta">
          <time dateTime={p.fecha}>{fechaLarga(p.fecha)}</time>
        </span>
      </div>
      <h3>
        <Link href={rutaPublicacion(p.id)}>{p.titulo}</Link>
      </h3>
      {p.tituloOriginal !== p.titulo ? <p className="vx-sc-orig">{p.tituloOriginal}</p> : null}
      <div className="vx-sc-meta">
        <span>{p.medio}</span>
        <span className="sep">·</span>
        <span>
          {p.autores[0]?.nombre ?? "sin autor registrado"}
          {p.totalAutores > 1 ? ` +${p.totalAutores - 1}` : ""}
        </span>
        {idea ? (
          <>
            <span className="sep">·</span>
            <Link href={rutaIdea(idea.id)} style={{ color: "#22d3ee", textDecoration: "none" }}>
              {idea.pregunta}
            </Link>
          </>
        ) : null}
      </div>
      <p>{p.lectura}</p>
      <p className="vx-sc-cautela">Límite: {p.cautela}</p>
      <div className="vx-sc-meta">
        <a href={p.original} target="_blank" rel="noopener noreferrer" style={{ color: "#22d3ee" }}>
          Publicación original ({p.idTipo === "doi" ? "DOI" : p.idTipo === "arxiv" ? "arXiv" : "sitio"}) ↗
        </a>
        <span className="sep">·</span>
        <Link href={rutaPublicacion(p.id)} style={{ color: "#9fb0c4" }}>
          Ficha completa
        </Link>
      </div>
    </article>
  );
}

/** Buscador por formulario: sin JavaScript, compartible, indexable. */
export function BuscadorCiencia({ f, compacto = false }: { f: FiltrosBusqueda; compacto?: boolean }) {
  return (
    <div className="vx-sc-buscador">
      <form action="/ciencia/buscar" method="get" role="search">
        <div>
          <label htmlFor="sc-q">Buscar publicaciones, autores o temas</label>
          <input
            id="sc-q"
            type="search"
            name="q"
            defaultValue={f.q ?? ""}
            placeholder="p. ej. ondas gravitacionales, grafeno, presión arterial, Perelman…"
            autoComplete="off"
          />
        </div>
        {compacto ? null : (
          <>
            <div>
              <label htmlFor="sc-disciplina">Disciplina</label>
              <select id="sc-disciplina" className="vx-sc-campo" name="disciplina" defaultValue={f.disciplina ?? ""}>
                <option value="">Todas</option>
                {DISCIPLINAS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="sc-orden">Orden</label>
              <select id="sc-orden" className="vx-sc-campo" name="orden" defaultValue={f.orden ?? ""}>
                <option value="">Relevancia</option>
                <option value="reciente">Más reciente</option>
                <option value="antigua">Más antigua</option>
                <option value="autores">Primer autor (A–Z)</option>
              </select>
            </div>
          </>
        )}
        <div style={{ alignSelf: "end" }}>
          <button className="vx-sc-boton" type="submit">
            Buscar
          </button>
        </div>
      </form>
      <div className="vx-sc-ejemplos" aria-label="Búsquedas de ejemplo">
        {["ondas gravitacionales", "exoplaneta", "grafeno", "presión arterial", "flujo de Ricci", "microondas"].map((t) => (
          <Link key={t} href={rutaBusqueda({ q: t })}>
            {t}
          </Link>
        ))}
      </div>
    </div>
  );
}

/** Filtros completos de la página de resultados: facetas enlazables. */
export function Facetas({
  f,
  facetas,
}: {
  f: FiltrosBusqueda;
  facetas: { disciplina: Record<string, number>; tipo: Record<string, number>; nivel: Record<string, number> };
}) {
  const con = (cambio: Partial<FiltrosBusqueda>) => rutaBusqueda({ ...f, ...cambio });
  const grupos: { clave: keyof typeof facetas; titulo: string; etiqueta: (k: string) => string }[] = [
    { clave: "disciplina", titulo: "Disciplina", etiqueta: (k) => disciplinaDe(k)?.nombre ?? k },
    { clave: "tipo", titulo: "Tipo editorial", etiqueta: (k) => TIPO_INFO[k as TipoPublicacion]?.etiqueta ?? k },
    { clave: "nivel", titulo: "Nivel de evidencia", etiqueta: (k) => NIVEL_INFO[k as NivelEvidencia]?.etiqueta ?? k },
  ];
  return (
    <div>
      {grupos.map((g) => (
        <div className="vx-sc-facetas" key={g.clave} role="group" aria-label={`Filtrar por ${g.titulo}`}>
          <span className="vx-sc-kicker" style={{ alignSelf: "center", marginRight: 4 }}>
            {g.titulo}
          </span>
          <Link href={con({ [g.clave]: undefined } as Partial<FiltrosBusqueda>)} aria-current={!f[g.clave] ? "true" : undefined}>
            Todo <b>{Object.values(facetas[g.clave]).reduce((a, b) => a + b, 0)}</b>
          </Link>
          {Object.entries(facetas[g.clave])
            .sort((a, b) => b[1] - a[1])
            .map(([k, n]) => (
              <Link key={k} href={con({ [g.clave]: k } as Partial<FiltrosBusqueda>)} aria-current={f[g.clave] === k ? "true" : undefined}>
                {g.etiqueta(k)} <b>{n}</b>
              </Link>
            ))}
        </div>
      ))}
    </div>
  );
}

export function TarjetaIdea({ idea, conPista = true }: { idea: Idea; conPista?: boolean }) {
  const disciplina = disciplinaDe(idea.disciplinaId);
  const total = idea.publicaciones.length;
  return (
    <Link className="vx-sc-idea" href={rutaIdea(idea.id)}>
      <div className="vx-sc-sellos">
        <span className="vx-sc-kicker" style={{ color: disciplina?.color }}>
          {disciplina?.nombre}
        </span>
        <EstadoIdea estado={idea.estado} />
      </div>
      <h3>{idea.pregunta}</h3>
      <p>{idea.sintesis.length > 210 ? `${idea.sintesis.slice(0, 207).trimEnd()}…` : idea.sintesis}</p>
      <div className="vx-sc-meta">
        <span>
          {total} publicaciones · {idea.desde}–{idea.hasta}
        </span>
      </div>
      {conPista ? (
        <div className="vx-sc-pista" aria-hidden="true">
          {Array.from({ length: Math.max(total, 4) }).map((_, i) => (
            <i key={i} data-on={i < total ? "1" : "0"} />
          ))}
        </div>
      ) : null}
    </Link>
  );
}

/** La línea de evolución: cada paso con su fecha, su tipo y qué añadió. */
export function LineaEvolucion({ idea, abierta = false }: { idea: Idea; abierta?: boolean }) {
  const pubs = idea.publicaciones.map((id) => publicacionDe(id)).filter((p): p is Publicacion => Boolean(p));
  return (
    <div className="vx-sc-evolucion">
      <p className="vx-sc-kicker" style={{ marginTop: 0 }}>
        Línea de evolución · {pubs.length} pasos
      </p>
      <ol className="vx-sc-pasos">
        {pubs.map((p) => (
          <li key={p.id}>
            <time dateTime={p.fecha}>{fechaLarga(p.fecha)}</time>
            <h4>
              <Link href={rutaPublicacion(p.id)}>{p.titulo}</Link>
            </h4>
            <div className="vx-sc-sellos" style={{ marginBottom: 5 }}>
              <SelloTipo tipo={p.tipo} />
              <SelloNivel nivel={p.nivel} />
              <span className="vx-sc-meta">{p.medio}</span>
            </div>
            <p>{idea.pasos[p.id]}</p>
            <details className="vx-sc-detalle" open={abierta}>
              <summary>Qué mide y qué no</summary>
              <p style={{ marginTop: 6 }}>{p.lectura}</p>
              <p className="vx-sc-cautela">Límite: {p.cautela}</p>
              <div className="vx-sc-meta" style={{ marginTop: 5 }}>
                <Link href={rutaPublicacion(p.id)}>Ficha completa</Link>
                <span className="sep">·</span>
                <a href={p.original} target="_blank" rel="noopener noreferrer">
                  Original ↗
                </a>
              </div>
            </details>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Enlaces cruzados a las disciplinas: la puerta de entrada por materia. */
export function ListaDisciplinas({ compacta = false }: { compacta?: boolean }) {
  return (
    <div className="vx-sc-lista doble">
      {DISCIPLINAS.map((d) => (
        <Link className="vx-sc-ficha" key={d.id} href={rutaDisciplina(d.id)}>
          <div className="vx-sc-sellos">
            <span className="vx-sc-kicker" style={{ color: d.color }}>
              {d.id}
            </span>
          </div>
          <h3>{d.nombre}</h3>
          {compacta ? null : <p>{d.descripcion}</p>}
          <div className="vx-sc-meta">
            <span>Ver publicaciones por fecha →</span>
          </div>
        </Link>
      ))}
    </div>
  );
}

export function Seccion({
  titulo,
  kicker,
  href,
  children,
}: {
  titulo: string;
  kicker?: string;
  href?: string;
  children: ReactNode;
}) {
  return (
    <section className="vx-sc-seccion" aria-labelledby={`sec-${titulo.replace(/\s+/g, "-")}`}>
      <header>
        <div>
          {kicker ? <p className="vx-sc-kicker" style={{ margin: "0 0 3px" }}>{kicker}</p> : null}
          <h2 id={`sec-${titulo.replace(/\s+/g, "-")}`}>{titulo}</h2>
        </div>
        {href ? <Link href={href}>Ver todo →</Link> : null}
      </header>
      {children}
    </section>
  );
}

/** La carcasa común: barra, columna y pie. Cada página declara su pestaña. */
export function MarcoCiencia({ activa, children }: { activa?: string; children: ReactNode }) {
  return (
    <div className="vx-sc">
      <BarraCiencia activa={activa} />
      <div className="vx-sc-caja">
        {children}
        <PieCiencia />
      </div>
    </div>
  );
}

export function PieCiencia() {
  return (
    <footer className="vx-sc-pie">
      <nav aria-label="Otras puertas de la casa">
        <Link href="/conocimiento">Conocimiento global</Link>
        <Link href="/conocimiento/enciclopedia">Enciclopedia</Link>
        <Link href="/datos">Catálogo de datos</Link>
        <Link href="/calidad">Sala de la calidad</Link>
        <Link href="/novedades">Novedades</Link>
      </nav>
      <p style={{ margin: 0 }}>
        SCIENCE FRONTIER no produce artículos educativos: indexa publicaciones reales y explica cada paso. Los
        metadatos se capturaron de Crossref, arXiv, Europe PMC y NobelPrize.org el 2026-11-18; cada ficha guarda su
        enlace original y la huella de la respuesta. Las lecturas y los límites son editoriales de VANGUARD.
      </p>
    </footer>
  );
}

export function DisciplinaEnlace({ id }: { id: DisciplinaId }) {
  const d = disciplinaDe(id);
  if (!d) return null;
  return (
    <Link href={rutaDisciplina(d.id)} style={{ color: d.color, textDecoration: "none" }}>
      {d.nombre}
    </Link>
  );
}
