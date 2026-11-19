// ═══════════════════════════════════════════════════════════════════
// v420.3 · /infraestructura/gran-obra — EL CATALÓGO DE GRANDAS OBRAS
// Departamento 6 · VANGUARD INFRASTRUCTURE ATLAS
//
// Las obras más icónicas del Atlas en una sola lista: las que marcan
// hitos de la ingeniería civil. Cada fila enlaza a su ficha, y la tabla
// se ordena por fecha o por categoría.
// ═══════════════════════════════════════════════════════════════════
import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/site";
import { MarcoInfra } from "@/components/infraestructura/marco-infra";
import { CATALOGO_INFRA, CATEGORIAS_INFRA, META_CATEGORIA, estadosVerificacion } from "@/lib/infraestructura/catalogo";
import { nombrePais, nombreCategoria, formatoFecha, claseVerificacion, etiquetaVerificacion } from "@/lib/infraestructura/formato";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Grandes obras: las obras icónicas de la ingeniería civil del Atlas | VANGUARD",
  description:
    "Catálogo de grandes obras del Atlas de infraestructura: aeropuertos, puertos, puentes, túneles, presas y centrales más importantes. Cada gran obra con su fecha, sus características y su fuente.",
  alternates: { canonical: `${SITE_URL}/infraestructura/gran-obra` },
};

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function GranObraPage({ searchParams }: Props) {
  const sp = await searchParams;
  const orden = typeof sp.orden === "string" ? sp.orden : "fecha";
  const cat = typeof sp.cat === "string" ? sp.cat.split(",").filter(Boolean) : [];

  const todas = cat.length > 0 ? CATALOGO_INFRA.filter((o) => cat.includes(o.categoria)) : CATALOGO_INFRA;

  // La lista de grandes obras: obras icónicas, marcadas en su ficha.
  const granObra = todas.filter((o) => o.granObra).length;
  const lista = granObra > 0 ? todas.filter((o) => o.granObra) : todas;

  const ordenadas = [...lista].sort((a, b) => {
    if (orden === "nombre") return a.nombre.localeCompare(b.nombre, "es");
    if (orden === "categoria") {
      const d = a.categoria.localeCompare(b.categoria);
      return d !== 0 ? d : a.nombre.localeCompare(b.nombre, "es");
    }
    // por fecha: las sin fecha van al final
    const fa = a.fecha ?? "9999";
    const fb = b.fecha ?? "9999";
    const d = fa.localeCompare(fb, "es", { numeric: true });
    return d !== 0 ? d : a.nombre.localeCompare(b.nombre, "es");
  });

  const verificacion = estadosVerificacion();

  const qs = (params: Record<string, string>) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) p.set(k, v);
    const s = p.toString();
    return s ? `?${s}` : "";
  };
  const linkCat = (c: string) => {
    const nuevas = cat.includes(c) ? cat.filter((x) => x !== c) : [...cat, c];
    return qs({ orden, ...(nuevas.length ? { cat: nuevas.join(",") } : {}) });
  };
  const linkOrden = (nuevo: string) => qs({ ...(cat.length ? { cat: cat.join(",") } : {}), orden: nuevo });

  return (
    <MarcoInfra
      activo="/infraestructura/gran-obra"
      volanta="MISIÓN 03 · departamento 6 · catálogo de grandes obras"
      titulo="Las grandes obras del Atlas"
      sub={
        <>
          Las obras que marcan hitos de la ingeniería civil, en una sola lista ordenable. Cada fila enlaza a la ficha
          completa, con los nueve campos que el Dueño exige para cada obra.
        </>
      }
      cifras={[
        { valor: lista.length, etiqueta: "obras en la lista", nota: `de las ${CATALOGO_INFRA.length} del Atlas` },
        { valor: CATEGORIAS_INFRA.length, etiqueta: "categorías", nota: "si filtras por categoría, la lista se reduce" },
        { valor: verificacion.confirmado, etiqueta: "verificadas", nota: `${verificacion.documentado} documentadas · ${verificacion["por verificar"]} por verificar` },
        { valor: cat.length, etiqueta: "filtros de categoría", nota: cat.length > 0 ? cat.map((c) => nombreCategoria(c as never)).join(", ") : "todas las categorías" },
      ]}
    >
      <section className="vx-md-panel" aria-labelledby="ctl-gran-obra">
        <h2 className="vx-md-h2" id="ctl-gran-obra">
          Filtros de la lista
        </h2>
        <p className="vx-md-h2-sub">
          Filtra por categoría (puedes combinar varias) y ordena por fecha, por categoría o por nombre. El estado vive en
          la URL: se puede compartir tal cual.
        </p>
        <div className="vx-md-chips">
          {[
            { id: "fecha", label: "Orden: fecha" },
            { id: "nombre", label: "Orden: nombre" },
            { id: "categoria", label: "Orden: categoría" },
          ].map((o) => (
            <Link
              key={o.id}
              href={`/infraestructura/gran-obra${linkOrden(o.id)}`}
              className="vx-md-chip"
              data-on={orden === o.id ? 1 : 0}
              style={{ textDecoration: "none" }}
            >
              {o.label}
            </Link>
          ))}
        </div>
        <div className="vx-md-chips">
          {CATEGORIAS_INFRA.map((c) => (
            <Link
              key={c}
              href={`/infraestructura/gran-obra${linkCat(c)}`}
              className="vx-md-chip"
              data-on={cat.includes(c) ? 1 : 0}
              style={{ textDecoration: "none" }}
            >
              {nombreCategoria(c)}
            </Link>
          ))}
        </div>
        <p className="vx-md-meta">
          Pasar al explorador temático:{" "}
          <Link href="/infraestructura/explorador">todos los grupos</Link> ·{" "}
          <Link href="/infraestructura">al catálogo completo</Link>
        </p>
      </section>

      <section className="vx-md-panel" aria-labelledby="tabla-gran-obra">
        <h2 className="vx-md-h2" id="tabla-gran-obra">
          Lista de grandes obras
        </h2>
        <p className="vx-md-h2-sub">
          {lista.length} obras. Las obras sin fecha documentada van al final de la lista, no se inventan fechas.
        </p>
        <div className="vx-md-tabla-caja">
          <table className="vx-md-tabla">
            <thead>
              <tr>
                <th scope="col">Obra</th>
                <th scope="col">Categoría</th>
                <th scope="col">País</th>
                <th scope="col">Fecha</th>
                <th scope="col">Verificación</th>
              </tr>
            </thead>
            <tbody>
              {ordenadas.map((obra) => (
                <tr key={obra.id}>
                  <td>
                    <Link href={`/infraestructura/obra/${obra.id}`}>{obra.nombre}</Link>
                    <div className="vx-md-meta">{obra.ubicacion.ciudad}</div>
                  </td>
                  <td>{nombreCategoria(obra.categoria)}</td>
                  <td>{nombrePais(obra.pais)}</td>
                  <td>{formatoFecha(obra.fecha)}</td>
                  <td>
                    <span className={claseVerificacion(obra.verificacion)}>{etiquetaVerificacion(obra.verificacion)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="vx-md-meta" style={{ marginTop: 10 }}>
          Categorías disponibles en la lista:{" "}
          {CATEGORIAS_INFRA.map((c) => nombreCategoria(c)).join(" · ")}.
        </p>
      </section>

      <section className="vx-md-panel">
        <h2 className="vx-md-h2">Sobre la lista de grandes obras</h2>
        <ul className="vx-md-lista">
          <li>
            <b>Grandes obras, no rankings arbitrarios.</b> La lista aglutina las obras del Atlas que marcan hitos de la
            ingeniería civil. No hay posiciones: cada obra enlaza a su ficha con sus datos documentados.
          </li>
          <li>
            <b>Fecha conocida, no fecha inventada.</b> Las obras sin fecha documentada aparecen al final de la lista.
          </li>
          <li>
            <b>Verificación declarada.</b> Cada obra trae su estado de verificación: verificada, documentada o por
            verificar. El Atlas no afirma más de lo que la fuente publica.
          </li>
        </ul>
        <p className="vx-md-meta" style={{ marginTop: 10 }}>
          <Link href="/infraestructura">← Volver al Atlas completo</Link>
        </p>
      </section>
    </MarcoInfra>
  );
}
