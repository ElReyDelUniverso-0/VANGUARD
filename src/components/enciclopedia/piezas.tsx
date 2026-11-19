// v417.0 VANGUARD KNOWLEDGE — piezas de servidor de la Enciclopedia (cero JS).
import Link from "next/link";
import { categoriaDe, imagenDe, rutaArticulo, minutosLectura, type Articulo } from "@/lib/enciclopedia/indice";

/** Figura con atribución completa: autor, licencia y página de origen. */
export function Figura({ clave, alt, pie, prioridad = false }: { clave: string; alt: string; pie: string; prioridad?: boolean }) {
  const img = imagenDe(clave);
  if (!img) return null;
  return (
    <figure className="vx-en-fig">
      <img
        src={img.archivo}
        alt={alt}
        width={img.ancho}
        height={img.alto}
        loading={prioridad ? "eager" : "lazy"}
        decoding="async"
      />
      <figcaption>
        {pie}
        <Credito clave={clave} />
      </figcaption>
    </figure>
  );
}

export function Credito({ clave }: { clave: string }) {
  const img = imagenDe(clave);
  if (!img) return null;
  return (
    <span className="vx-en-credito">
      Imagen: {img.autor} ·{" "}
      {img.licenciaUrl ? (
        <a href={img.licenciaUrl} target="_blank" rel="noopener noreferrer license">
          {img.licencia}
        </a>
      ) : (
        img.licencia
      )}{" "}
      ·{" "}
      <a href={img.origen} target="_blank" rel="noopener noreferrer">
        Wikimedia Commons
      </a>
    </span>
  );
}

export function TarjetaArticulo({ a, mostrarCategoria = true }: { a: Articulo; mostrarCategoria?: boolean }) {
  const img = imagenDe(a.imagenes[0]?.clave ?? "");
  const cat = categoriaDe(a.categoria);
  return (
    <Link href={rutaArticulo(a.slug)} className="vx-en-tarjeta-img">
      {img ? (
        <img src={img.archivo} alt="" width={img.ancho} height={img.alto} loading="lazy" decoding="async" />
      ) : null}
      <div>
        {mostrarCategoria && cat ? (
          <span className="vx-en-cat" style={{ color: cat.color }}>
            {cat.nombre}
          </span>
        ) : null}
        <h3>{a.titulo}</h3>
        <p>{a.bajada}</p>
        <p style={{ fontSize: 12, marginTop: 8, color: "var(--pl-tenue)" }}>
          {minutosLectura(a)} min de lectura · {a.fuentes.length} fuentes
        </p>
      </div>
    </Link>
  );
}

export function Buscador({ q = "", autoFocus = false }: { q?: string; autoFocus?: boolean }) {
  return (
    <form action="/conocimiento/enciclopedia/buscar" method="get" role="search" className="vx-en-buscador">
      <label htmlFor="vx-en-q" className="sr-only">
        Buscar en la enciclopedia
      </label>
      <input
        id="vx-en-q"
        name="q"
        type="search"
        defaultValue={q}
        placeholder="Busca un tema: Amazonía, taínos, monzón, Hammurabi…"
        maxLength={80}
        autoFocus={autoFocus}
        enterKeyHint="search"
      />
      <button type="submit">Buscar</button>
    </form>
  );
}

export function Migas({ pasos }: { pasos: { href?: string; label: string }[] }) {
  return (
    <nav className="vx-en-migas" aria-label="Ruta de navegación">
      {pasos.map((p, i) => (
        <span key={i}>
          {p.href ? <Link href={p.href}>{p.label}</Link> : <span aria-current="page">{p.label}</span>}
          {i < pasos.length - 1 ? <span aria-hidden="true"> › </span> : null}
        </span>
      ))}
    </nav>
  );
}
