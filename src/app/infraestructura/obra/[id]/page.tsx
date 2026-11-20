// ═══════════════════════════════════════════════════════════════════
// v420.3 · /infraestructura/obra/[id] — LA FICHA DE UNA OBRA
// Departamento 6 · VANGUARD INFRASTRUCTURE ATLAS
//
// La ficha individual trae los nueve campos que el Dueño exige para cada
// obra: Nombre · País y ubicación · Categoría · Descripción · Fecha
// conocida · Características documentadas · Fotografías autorizadas ·
// Fuente de información · Estado de verificación.
//
// Información pública y apropiada: la ficha describe qué es la obra y
// sus características técnicas publicadas; nada de vulnerabilidades,
// accesos ni detalles operativos de la instalación.
// ═══════════════════════════════════════════════════════════════════
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";
import { SITE_URL } from "@/lib/site";
import { MarcoInfra } from "@/components/infraestructura/marco-infra";
import { CATALOGO_INFRA, META_CATEGORIA, obraPorId } from "@/lib/infraestructura/catalogo";
import {
  nombrePais,
  nombreCategoria,
  formatoFecha,
  formatoUbicacion,
  formatoCoordenadas,
  claseVerificacion,
  etiquetaVerificacion,
} from "@/lib/infraestructura/formato";

export const revalidate = 1800;

export const dynamicParams = false;

export function generateStaticParams() {
  return CATALOGO_INFRA.map((o) => ({ id: o.id }));
}

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const obra = obraPorId(id);
  if (!obra) return { title: "Obra no encontrada | VANGUARD" };
  return {
    title: `${obra.nombre}: ${nombreCategoria(obra.categoria)} en ${nombrePais(obra.pais)} | VANGUARD`,
    description: `${obra.descripcion} Fecha conocida: ${formatoFecha(obra.fecha)}. Características documentadas, fotografías y fuente de información en la ficha del Atlas de infraestructura.`,
    alternates: { canonical: `${SITE_URL}/infraestructura/obra/${obra.id}` },
  };
}

/** Emblema dibujado en código: la casa no carga imágenes externas. */
function emblemaDe(categoria: string): string {
  return nombreCategoria(categoria as never).slice(0, 2);
}

export default async function ObraPage({ params }: Props) {
  const { id } = await params;
  const obra = obraPorId(id);
  if (!obra) notFound();
  // v421.3 — aquí NO va la redirección de las variantes con acento: esta
  // sala declara dynamicParams = false, así que Next responde 404 antes de
  // ejecutar estas líneas. Esas variantes las cierra next.config.ts (301 de
  // borde). El obraPorId tolerante se queda como red de seguridad.

  const paisGeo = nombrePais(obra.pais);
  const grupo = META_CATEGORIA[obra.categoria].explorador;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Building",
    name: obra.nombre,
    description: obra.descripcion,
    category: nombreCategoria(obra.categoria),
    location: {
      "@type": "Place",
      name: obra.ubicacion.ciudad,
      address: {
        "@type": "PostalAddress",
        addressLocality: obra.ubicacion.ciudad,
        addressCountry: obra.pais.toUpperCase(),
      },
      geo: { "@type": "GeoCoordinates", latitude: obra.ubicacion.lat, longitude: obra.ubicacion.lng },
    },
    identifier: obra.id,
    ...(obra.fecha ? { dateCreated: obra.fecha } : {}),
    isPartOf: { "@type": "WebSite", name: "VANGUARD", url: SITE_URL },
    url: `${SITE_URL}/infraestructura/obra/${obra.id}`,
  };

  return (
    <MarcoInfra
      activo="/infraestructura"
      volanta={`MISIÓN 03 · ficha de obra · ${nombreCategoria(obra.categoria)}`}
      titulo={obra.nombre}
      sub={
        <>
          Ficha del Atlas de infraestructura: una obra real y documentada. Todos los campos de la ficha son los que el
          Dueño exige, y los datos son los publicados por la fuente citada — nada inventado.
        </>
      }
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdSeguro(jsonLd) }} />

      <article className="vx-ficha-infra">
        <header>
          <span className="vx-obra-tag">
            <span className="vx-categ">{nombreCategoria(obra.categoria)}</span> ·{" "}
            <span className="vx-país">{paisGeo}</span>
          </span>
          <h1>{obra.nombre}</h1>
          <div className="vx-ficha-meta">
            <span className={claseVerificacion(obra.verificacion)}>{etiquetaVerificacion(obra.verificacion)}</span>
            <span className="vx-md-meta">{formatoUbicacion(obra.ubicacion.ciudad, obra.pais)}</span>
          </div>
        </header>

        <div className="vx-ficha-blk">
          <h2>Descripción</h2>
          <p style={{ margin: 0, color: "#c9c3b4", fontSize: 14.5, lineHeight: 1.7 }}>{obra.descripcion}</p>
        </div>

        <div className="vx-ficha-blk">
          <h2>Datos de la obra</h2>
          <div className="vx-ficha-carac-grid">
            <div className="vx-ficha-carac">
              <b>País</b>
              <span>
                <Link href={`/infraestructura?pais=${obra.pais}`} style={{ color: "var(--teal)" }}>
                  {paisGeo}
                </Link>{" "}
                <span className="vx-md-meta">({obra.pais.toUpperCase()})</span>
              </span>
            </div>
            <div className="vx-ficha-carac">
              <b>Ubicación</b>
              <span>{obra.ubicacion.ciudad}</span>
            </div>
            <div className="vx-ficha-carac">
              <b>Coordenadas</b>
              <span>{formatoCoordenadas(obra.ubicacion.lat, obra.ubicacion.lng)}</span>
            </div>
            <div className="vx-ficha-carac">
              <b>Categoría</b>
              <span>{nombreCategoria(obra.categoria)}</span>
            </div>
            <div className="vx-ficha-carac">
              <b>Fecha conocida</b>
              <span>{obra.fecha ? obra.fecha : <span className="vx-md-sin">sin dato documentado</span>}</span>
            </div>
            <div className="vx-ficha-carac">
              <b>Estado de verificación</b>
              <span>
                <span className={claseVerificacion(obra.verificacion)}>{etiquetaVerificacion(obra.verificacion)}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="vx-ficha-blk">
          <h2>Características documentadas</h2>
          {obra.caracteristicas.length === 0 ? (
            <p className="vx-md-sin">No hay características técnicas publicadas en la fuente. La casa no inventa cifras.</p>
          ) : (
            <div className="vx-ficha-carac-grid">
              {obra.caracteristicas.map((c) => (
                <div className="vx-ficha-carac" key={c.clave}>
                  <b>{c.clave}</b>
                  <span>{c.valor}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="vx-ficha-blk">
          <h2>Fotografías autorizadas</h2>
          {obra.fotos.length === 0 ? (
            <div className="vx-ficha-fotos">
              <div className="vx-ficha-foto">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <circle cx="8.5" cy="10.5" r="1.8" />
                  <path d="M21 15.5l-4.6-4.3a1.4 1.4 0 0 0-2 .1L8 15.5" />
                </svg>
                <span>Sin fotografías autorizadas</span>
                <span className="vx-md-meta">La casa no carga imágenes externas</span>
              </div>
              <div className="vx-ficha-foto">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                  <path d="M12 2l2.9 6.2 6.8.6-5.1 4.5 1.5 6.7L12 17.2 6.9 20l1.5-6.7L2.5 8.8l6.8-.6z" />
                </svg>
                <span>Emblema: {emblemaDe(obra.categoria)}</span>
                <span className="vx-md-meta">dibujado en código</span>
              </div>
            </div>
          ) : (
            <div className="vx-ficha-fotos">
              {obra.fotos.map((f) => (
                <div className="vx-ficha-foto" key={f}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <circle cx="8.5" cy="10.5" r="1.8" />
                    <path d="M21 15.5l-4.6-4.3a1.4 1.4 0 0 0-2 .1L8 15.5" />
                  </svg>
                  <span>{f}</span>
                  <span className="vx-md-meta">fotografía autorizada</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="vx-ficha-blk">
          <h2>Fuente de información</h2>
          <div className="vx-md-aviso teal">
            <b>{obra.fuente.nombre}</b>
            <br />
            <a href={obra.fuente.url} target="_blank" rel="noreferrer noopener">
              {obra.fuente.url}
            </a>
            {obra.fuente.licencia ? (
              <>
                <br />
                Licencia: {obra.fuente.licencia}
              </>
            ) : null}
          </div>
          <p className="vx-md-meta">
            Los datos de esta ficha son los publicados por esta fuente. La casa no reproduce contenido: solo cita la
            fuente pública y resume sus datos documentados.
          </p>
        </div>
      </article>

      <section className="vx-md-panel">
        <h2 className="vx-md-h2">Sigue por aquí</h2>
        <div className="vx-md-rejilla vx-md-4">
          <Link href="/infraestructura" className="vx-md-cifra" style={{ textDecoration: "none" }}>
            <b>Atlas</b>
            <span>Catálogo completo</span>
            <small>Todas las obras del Atlas con sus filtros y cifras por categoría.</small>
          </Link>
          <Link href={`/infraestructura?cat=${obra.categoria}`} className="vx-md-cifra" style={{ textDecoration: "none" }}>
            <b>Categoría</b>
            <span>{nombreCategoria(obra.categoria)}</span>
            <small>Otras obras de la misma categoría del catálogo.</small>
          </Link>
          <Link
            href={`/infraestructura/explorador?grupo=${grupo}`}
            className="vx-md-cifra"
            style={{ textDecoration: "none" }}
          >
            <b>Grupo</b>
            <span>
              {grupo === "transporte" ? "Transporte" : grupo === "energia" ? "Energía y agua" : "Arquitectura y servicios"}
            </span>
            <small>El explorador temático donde entra esta categoría.</small>
          </Link>
          <Link href="/infraestructura/gran-obra" className="vx-md-cifra" style={{ textDecoration: "none" }}>
            <b>Grandes obras</b>
            <span>Catálogo de grandes obras</span>
            <small>Las obras más icónicas del Atlas en una sola lista.</small>
          </Link>
        </div>
      </section>
    </MarcoInfra>
  );
}
