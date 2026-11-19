// ═══════════════════════════════════════════════════════════════════
// v420.3 · /infraestructura — EL ATLAS MUNDIAL DE INFRAESTRUCTURA
// Departamento 6 · VANGUARD INFRASTRUCTURE ATLAS
//
// Qué resuelve: un catálogo mundial de obras de infraestructura civil —
// aeropuertos, puertos, ferrocarril, puentes, túneles, centrales, presas,
// agua, educación, sanitaria y edificios emblemáticos — cada una con sus
// nueve campos obligados (Nombre, País y ubicación, Categoría, Descripción,
// Fecha conocida, Características documentadas, Fotografías autorizadas,
// Fuente de información, Estado de verificación). Explorador con filtros por
// categoría, país y texto, y fichas individuales.
//
// Información pública y apropiada: nada de vulnerabilidades, accesos ni
// detalles operativos de ninguna instalación.
// ═══════════════════════════════════════════════════════════════════
import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/site";
import { MarcoInfra } from "@/components/infraestructura/marco-infra";
import { ControlesInfra } from "@/components/infraestructura/controles-infra";
import {
  CATALOGO_INFRA,
  CIFRAS_ATLAS,
  cifrasPorCategoria,
  cifrasPorPais,
  filtrarCatalogo,
  META_CATEGORIA,
} from "@/lib/infraestructura/catalogo";
import { nombrePais, nombreCategoria, formatoFecha, claseVerificacion, etiquetaVerificacion } from "@/lib/infraestructura/formato";
import { POR_ISO2 } from "@/lib/geo-paises";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Atlas de infraestructura mundial: aeropuertos, puertos, puentes, presas y grandes obras | VANGUARD",
  description:
    "Catálogo mundial de infraestructura civil documentada: aeropuertos, puertos, ferrocarril, puentes, túneles, centrales energéticas, presas, agua, educación, sanitaria y edificios emblemáticos. Cada obra con su categoría, su fecha, sus características y su fuente.",
  alternates: { canonical: `${SITE_URL}/infraestructura` },
};

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AtlasPage({ searchParams }: Props) {
  const sp = await searchParams;
  const cat = typeof sp.cat === "string" ? sp.cat.split(",").filter(Boolean) : [];
  const pais = typeof sp.pais === "string" ? sp.pais : "";
  const texto = typeof sp.q === "string" ? sp.q : "";

  const obras = filtrarCatalogo({ categorias: cat, pais: pais || undefined, texto });
  const categorias = cifrasPorCategoria();
  const paisesCatalogo = cifrasPorPais()
    .map((c) => {
      const geo = POR_ISO2.get(c.iso2);
      return { iso2: c.iso2, nombre: geo?.nombre ?? c.iso2, cantidad: c.cantidad };
    })
    .sort((a, b) => b.cantidad - a.cantidad);
  const maxCantidad = Math.max(1, ...categorias.map((c) => c.cantidad));

  return (
    <MarcoInfra
      activo="/infraestructura"
      volanta="MISIÓN 03 · departamento 6 · infraestructura civil"
      titulo="Atlas de infraestructura del planeta"
      sub={
        <>
          Cada obra de la lista es un trabajo real, documentado en fuentes públicas. La ficha trae los nueve campos que el
          Dueño exige: nombre, país y ubicación, categoría, descripción, fecha conocida, características documentadas,
          fotografías autorizadas, fuente de información y estado de verificación. Nada de vulnerabilidades ni detalles
          operativos: solo hechos públicos y apropiados.
        </>
      }
      cifras={[
        { valor: CIFRAS_ATLAS.obras, etiqueta: "obras en el catálogo", nota: "distribuidas en 11 categorías de infraestructura civil" },
        { valor: CIFRAS_ATLAS.categorias, etiqueta: "categorías", nota: "aeropuertos, puertos, ferrocarril, puentes, túneles, energía, agua, educación, sanitaria, edificios" },
        { valor: CIFRAS_ATLAS.paises, etiqueta: "países representados", nota: "cifras por categoría abajo" },
        { valor: CIFRAS_ATLAS.confirmadas, etiqueta: "obras verificadas", nota: "las restantes: documentadas o por verificar" },
      ]}
    >
      <section className="vx-md-panel" aria-labelledby="ctl-atlas">
        <h2 className="vx-md-h2" id="ctl-atlas">
          Explorador: filtra por categoría, país o texto
        </h2>
        <p className="vx-md-h2-sub">
          El estado vive en la URL: lo que ves se puede compartir tal cual. Si una categoría no tiene obras con los
          filtros activos, la lista lo dice, no inventa fichas.
        </p>
        <ControlesInfra base="/infraestructura" categorias={cat} pais={pais} texto={texto} paises={paisesCatalogo} />
        <p className="vx-md-meta">
          {obras.length} de {CATALOGO_INFRA.length} obras · {cat.length > 0 ? `categorías: ${cat.map((c) => (META_CATEGORIA as Record<string, { nombre: string }>)[c]?.nombre ?? c).join(", ")}` : "todas las categorías"} · {pais ? `país: ${nombrePais(pais)}` : "todos los países"}
          {texto ? ` · búsqueda: «${texto}»` : ""}
        </p>
      </section>

      <section className="vx-md-panel" aria-labelledby="cat-atlas">
        <h2 className="vx-md-h2" id="cat-atlas">
          Cifras por categoría
        </h2>
        <p className="vx-md-h2-sub">
          Las categorías agrupan el catálogo. Las barras muestran el número de obras de cada una; cada barra enlaza con el
          explorador preaplicado en esa categoría.
        </p>
        <div className="vx-md-barras">
          {categorias.map((c) => (
            <Link key={c.categoria} href={`/infraestructura?cat=${c.categoria}`} className="vx-md-barra-fila" style={{ textDecoration: "none", color: "inherit" }}>
              <span>{c.meta.nombre}</span>
              <span className="vx-md-barra-pista">
                <span
                  className="vx-md-barra-relleno"
                  style={{ width: `${Math.max(6, Math.round((c.cantidad / maxCantidad) * 100))}%`, background: "var(--oro)" }}
                />
              </span>
              <b>{c.cantidad}</b>
            </Link>
          ))}
        </div>
        <p className="vx-md-meta" style={{ marginTop: 12 }}>
          Grupos de explorador:{" "}
          <Link href="/infraestructura/explorador?grupo=transporte">Transporte</Link> ·{" "}
          <Link href="/infraestructura/explorador?grupo=energia">Energía y agua</Link> ·{" "}
          <Link href="/infraestructura/explorador?grupo=arquitectura">Arquitectura y servicios</Link>
        </p>
      </section>

      <section className="vx-md-panel" aria-labelledby="obras-atlas">
        <h2 className="vx-md-h2" id="obras-atlas">
          Obras del catálogo
        </h2>
        <p className="vx-md-h2-sub">
          Cada tarjeta abre la ficha completa. Las características que aparecen en la tarjeta son las documentadas; el
          resto de la ficha las amplía.
        </p>
        {obras.length === 0 ? (
          <div className="vx-md-aviso">
            Con estos filtros no hay obras. Añade otra categoría, quita el país o cambia el texto de búsqueda — o
            <Link href="/infraestructura" style={{ color: "var(--teal)" }}> mira el catálogo completo</Link>.
          </div>
        ) : (
          <div className="vx-md-rejilla vx-md-3">
            {obras.map((obra) => (
              <article className="vx-obra-tarjeta" key={obra.id}>
                <span className="vx-obra-tag">
                  <span className="vx-categ">{nombreCategoria(obra.categoria)}</span> ·{" "}
                  <span className="vx-país">{nombrePais(obra.pais)}</span> ·{" "}
                  <span className="vx-fecha">{formatoFecha(obra.fecha)}</span>
                </span>
                <h3>
                  <Link href={`/infraestructura/obra/${obra.id}`}>{obra.nombre}</Link>
                </h3>
                <p className="vx-obra-desc">{obra.descripcion}</p>
                <div className="vx-obra-caracs">
                  {obra.caracteristicas.slice(0, 3).map((c) => (
                    <span className="vx-obra-carac" key={c.clave}>
                      <b>{c.clave}:</b> {c.valor}
                    </span>
                  ))}
                </div>
                <p className="vx-md-meta" style={{ marginTop: 4 }}>
                  <span className={claseVerificacion(obra.verificacion)}>{etiquetaVerificacion(obra.verificacion)}</span> · {obra.ubicacion.ciudad}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="vx-md-panel">
        <h2 className="vx-md-h2">Por países y por grandes obras</h2>
        <p className="vx-md-h2-sub">
          El catálogo puede recorrerse de dos maneras más: por país, para ver qué obras documenta el Atlas de cada uno;
          y por grandes obras, el selector de las más icónicas.
        </p>
        <div className="vx-md-rejilla vx-md-2">
          <div>
            <h3 className="vx-md-h3">Obras por país</h3>
            <div className="vx-md-rejilla vx-md-2">
              {paisesCatalogo.slice(0, 12).map((p) => (
                <Link key={p.iso2} href={`/infraestructura?pais=${p.iso2}`} className="vx-md-ficha-ind" style={{ textDecoration: "none" }}>
                  <header>
                    <h3>{p.nombre}</h3>
                    <span className="vx-md-meta">{p.iso2}</span>
                  </header>
                  <p style={{ margin: "8px 0 0", fontSize: 13, color: "#b9b3a4" }}>{p.cantidad} obras documentadas</p>
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h3 className="vx-md-h3">Grandes obras</h3>
            <div className="vx-md-aviso teal">
              <b>Catálogo de grandes obras:</b> las obras icónicas del Atlas en una sola lista, ordenadas por fecha y
              categoría. <Link href="/infraestructura/gran-obra">Ir al catálogo de grandes obras →</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="vx-md-panel">
        <h2 className="vx-md-h2">Cómo se lee el Atlas (y qué no promete)</h2>
        <ul className="vx-md-lista">
          <li>
            <b>Cada obra es real y documentada.</b> No hay fichas inventadas: si algo no está documentado, la ficha lo deja
            como <span className="vx-md-sin">sin dato documentado</span>.
          </li>
          <li>
            <b>Fecha conocida, no fecha inventada.</b> El campo «Fecha conocida» trae la fecha publicada por la fuente o
            «sin dato documentado» cuando no hay fecha pública fiable.
          </li>
          <li>
            <b>Fotografías solo autorizadas y en la casa.</b> La casa no carga imágenes externas: mientras no haya
            fotografías autorizadas en el repo, la ficha lo dice y dibuja su emblema en código.
          </li>
          <li>
            <b>Información pública y apropiada, siempre.</b> El Atlas describe qué es cada obra, dónde queda y características
            técnicas publicadas. Ninguna vulnerabilidad, acceso o detalle operativo de ninguna instalación.
          </li>
          <li>
            <b>Fuente declarada en cada ficha.</b> Cada obra cita la fuente pública de sus datos con su licencia. Los
            datos no se mezclan entre fuentes en una misma ficha.
          </li>
        </ul>
      </section>
    </MarcoInfra>
  );
}
