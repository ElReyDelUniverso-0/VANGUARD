// ═══════════════════════════════════════════════════════════════════
// v420.3 · /infraestructura/explorador — EL EXPLORADOR DEL ATLAS
// Departamento 6 · VANGUARD INFRASTRUCTURE ATLAS
//
// Qué resuelve: recorrer el catálogo por grandes grupos de infraestructura
// (transporte, energía y agua, arquitectura y servicios), con subfiltros
// por categoría y tabla ordenable de obras. Es la puerta de entrada
// temática del Atlas.
// ═══════════════════════════════════════════════════════════════════
import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/site";
import { MarcoInfra } from "@/components/infraestructura/marco-infra";
import { ControlesInfra } from "@/components/infraestructura/controles-infra";
import {
  CATALOGO_INFRA,
  CATEGORIAS_INFRA,
  META_CATEGORIA,
  filtrarCatalogo,
  cifrasPorPais,
} from "@/lib/infraestructura/catalogo";
import { nombrePais, nombreCategoria, formatoFecha, claseVerificacion, etiquetaVerificacion } from "@/lib/infraestructura/formato";
import { POR_ISO2 } from "@/lib/geo-paises";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Explorador de infraestructura: transporte, energía y arquitectura | VANGUARD",
  description:
    "Recorre el Atlas de infraestructura por grandes grupos: transporte (aeropuertos, puertos, ferrocarril, puentes, túneles), energía y agua (centrales, presas, sistemas hídricos) y arquitectura y servicios (educación, sanitaria, edificios emblemáticos).",
  alternates: { canonical: `${SITE_URL}/infraestructura/explorador` },
};

const GRUPOS = [
  { id: "transporte", nombre: "Transporte", descripcion: "Aeropuertos, puertos, ferrocarril, puentes y túneles: cómo se mueve el planeta." },
  { id: "energia", nombre: "Energía y agua", descripcion: "Centrales energéticas, presas y sistemas de agua: cómo produce y distribuye el planeta." },
  { id: "arquitectura", nombre: "Arquitectura y servicios", descripcion: "Educación, sanitaria y edificios emblemáticos: las obras que levanta el planeta." },
] as const;

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ExploradorPage({ searchParams }: Props) {
  const sp = await searchParams;
  const grupoRaw = typeof sp.grupo === "string" ? sp.grupo : "transporte";
  const grupo: "transporte" | "energia" | "arquitectura" =
    grupoRaw === "energia" || grupoRaw === "arquitectura" ? grupoRaw : "transporte";
  const cat = typeof sp.cat === "string" ? sp.cat.split(",").filter(Boolean) : [];
  const pais = typeof sp.pais === "string" ? sp.pais : "";
  const texto = typeof sp.q === "string" ? sp.q : "";

  const obras = filtrarCatalogo({ categorias: cat, pais: pais || undefined, grupo, texto });
  const categoriasDelGrupo = CATEGORIAS_INFRA.filter((c) => META_CATEGORIA[c].explorador === grupo);
  const paisesCatalogo = cifrasPorPais()
    .map((c) => ({ iso2: c.iso2, nombre: POR_ISO2.get(c.iso2)?.nombre ?? c.iso2 }))
    .sort((a, b) => b.nombre.localeCompare(a.nombre, "es"));

  const orden = (obra: (typeof obras)[number]) => obra.nombre;
  const ordenadas = [...obras].sort((a, b) => orden(a).localeCompare(orden(b), "es"));

  const meta = GRUPOS.find((g) => g.id === grupo) ?? GRUPOS[0];

  return (
    <MarcoInfra
      activo="/infraestructura/explorador"
      volanta="MISIÓN 03 · departamento 6 · explorador temático"
      titulo="Explorador de infraestructura"
      sub={
        <>
          Cinco categorías de transporte, tres de energía y agua, y tres de arquitectura y servicios. Cada grupo
          agrupa obras reales y documentadas; el explorador filtra dentro del grupo por categoría, país y texto.
        </>
      }
      cifras={[
        { valor: CATALOGO_INFRA.length, etiqueta: "obras en total", nota: "todas documentadas en fuentes públicas" },
        { valor: GRUPOS.length, etiqueta: "grupos temáticos", nota: "transporte · energía y agua · arquitectura y servicios" },
        { valor: categoriasDelGrupo.length, etiqueta: "categorías en este grupo", nota: meta.descripcion },
        { valor: obras.length, etiqueta: "obras en este grupo", nota: `${paisesCatalogo.length} países representados` },
      ]}
    >
      <section className="vx-md-panel" aria-labelledby="grupos-atlas">
        <h2 className="vx-md-h2" id="grupos-atlas">
          El explorador por grupos
        </h2>
        <p className="vx-md-h2-sub">
          Los grupos recorren el Atlas por tema. Selecciona uno: las categorías y obras que entran en el grupo aparecen
          abajo, con sus filtros.
        </p>
        <nav className="vx-md-barra" aria-label="Grupos de explorador">
          {GRUPOS.map((g) => (
            <Link key={g.id} href={`/infraestructura/explorador?grupo=${g.id}`} aria-current={grupo === g.id ? "page" : undefined}>
              {g.nombre}
            </Link>
          ))}
        </nav>
      </section>

      <section className="vx-md-panel" aria-labelledby="ctl-explorador">
        <h2 className="vx-md-h2" id="ctl-explorador">
          Filtros del grupo «{meta.nombre}»
        </h2>
        <p className="vx-md-h2-sub">{meta.descripcion}</p>
        <ControlesInfra base="/infraestructura/explorador" categorias={cat} pais={pais} texto={texto} paises={paisesCatalogo} />
        <p className="vx-md-meta">
          {obras.length} obras · categorías del grupo:{" "}
          {categoriasDelGrupo.map((c) => nombreCategoria(c)).join(", ")}
        </p>
      </section>

      <section className="vx-md-panel" aria-labelledby="obras-grupo">
        <h2 className="vx-md-h2" id="obras-grupo">
          Obras del grupo
        </h2>
        <p className="vx-md-h2-sub">
          La lista completa del grupo con los filtros activos, ordenada por nombre. Cada fila enlaza a la ficha de la obra.
        </p>
        {ordenadas.length === 0 ? (
          <div className="vx-md-aviso">
            Con estos filtros no hay obras en el grupo «{meta.nombre}». Quita un filtro o cambia el grupo — o
            <Link href="/infraestructura/explorador" style={{ color: "var(--teal)" }}> mira todos los grupos</Link>.
          </div>
        ) : (
          <div className="vx-md-tabla-caja">
            <table className="vx-md-tabla">
              <thead>
                <tr>
                  <th scope="col">Obra</th>
                  <th scope="col">Categoría</th>
                  <th scope="col">País</th>
                  <th scope="col">Ubicación</th>
                  <th scope="col">Fecha</th>
                  <th scope="col">Verificación</th>
                </tr>
              </thead>
              <tbody>
                {ordenadas.map((obra) => (
                  <tr key={obra.id}>
                    <td>
                      <Link href={`/infraestructura/obra/${obra.id}`}>{obra.nombre}</Link>
                    </td>
                    <td>{nombreCategoria(obra.categoria)}</td>
                    <td>{nombrePais(obra.pais)}</td>
                    <td>{obra.ubicacion.ciudad}</td>
                    <td>{formatoFecha(obra.fecha)}</td>
                    <td>
                      <span className={claseVerificacion(obra.verificacion)}>{etiquetaVerificacion(obra.verificacion)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="vx-md-panel">
        <h2 className="vx-md-h2">Qué tiene cada grupo</h2>
        <div className="vx-md-rejilla vx-md-3">
          {GRUPOS.map((g) => {
            const cats = CATEGORIAS_INFRA.filter((c) => META_CATEGORIA[c].explorador === g.id);
            const total = CATALOGO_INFRA.filter((o) => META_CATEGORIA[o.categoria].explorador === g.id).length;
            return (
              <div className="vx-md-ficha-ind" key={g.id}>
                <header>
                  <h3>{g.nombre}</h3>
                  <span className="vx-md-meta">{total} obras</span>
                </header>
                <p style={{ margin: "8px 0 0", fontSize: 13, color: "#b9b3a4", lineHeight: 1.6 }}>{g.descripcion}</p>
                <p className="vx-md-meta" style={{ marginTop: 10 }}>
                  {cats.map((c) => nombreCategoria(c)).join(" · ")}
                </p>
                <p style={{ margin: "10px 0 0", fontSize: 13 }}>
                  <Link href={`/infraestructura/explorador?grupo=${g.id}`} style={{ color: "var(--teal)" }}>
                    Entrar al grupo →
                  </Link>
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </MarcoInfra>
  );
}
