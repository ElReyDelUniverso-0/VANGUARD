// ============================================================
// v421.9 BIBLIOTECA CIENTÍFICA — estanterías curadas + mi estantería.
// Sin cuenta: lo guardado vive en el navegador. Las estanterías son
// recorridos editoriales por las mismas fichas, no contenido nuevo.
// ============================================================
import type { Metadata } from "next";
import Link from "next/link";
import { MarcoCiencia, Migas, SelloNivel, SelloTipo } from "@/components/ciencia/piezas";
import { MiEstanteria, type LecturaMinima } from "@/components/ciencia/biblioteca";
import {
  CAPTURA,
  ESTANTERIAS,
  PUBLICACIONES,
  fechaLarga,
  publicacionDe,
  rutaPublicacion,
} from "@/lib/ciencia/indice";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Biblioteca científica · Science Frontier",
  description:
    "Cinco estanterías curadas para recorrer el índice, la lista completa por fecha y tu propia estantería guardada en el navegador.",
  alternates: { canonical: `${SITE_URL}/ciencia/biblioteca` },
};

export default function Page() {
  const lecturas: LecturaMinima[] = PUBLICACIONES.map((p) => ({
    id: p.id,
    titulo: p.titulo,
    anio: p.anio,
    medio: p.medio,
    tipo: p.tipo,
    nivelEtiqueta: p.nivelEtiqueta,
  }));
  const porFecha = [...PUBLICACIONES].sort((a, b) => b.fecha.localeCompare(a.fecha));

  return (
    <MarcoCiencia activa="/ciencia/biblioteca">
      <Migas pasos={[{ href: "/ciencia", label: "Science Frontier" }, { label: "Biblioteca" }]} />
      <p className="vx-sc-volanta">Biblioteca científica</p>
      <h1>
        Estanterías para
        <br />
        <em>leer con orden</em>.
      </h1>
      <p className="vx-sc-sub">
        {ESTANTERIAS.length} recorridos curados —que cruzan ideas y disciplinas—, la lista completa por fecha y tu
        estantería personal. Todo apunta a las mismas fichas: aquí no se duplica nada.
      </p>

      <div className="vx-sc-ficha-detalle">
        <div>
          {ESTANTERIAS.map((e) => (
            <section className="vx-sc-panel" key={e.id} style={{ marginBottom: 12 }} id={e.id}>
              <h2>{e.nombre}</h2>
              <p>{e.descripcion}</p>
              <div style={{ display: "grid", gap: 8 }}>
                {e.publicaciones.map((pid) => {
                  const p = publicacionDe(pid);
                  if (!p) return null;
                  return (
                    <div key={pid} style={{ borderTop: "1px dotted rgba(148,175,205,.18)", paddingTop: 6 }}>
                      <div className="vx-sc-meta" style={{ flexWrap: "wrap", gap: 6 }}>
                        <SelloTipo tipo={p.tipo} />
                        <SelloNivel nivel={p.nivel} />
                        <time dateTime={p.fecha} className="vx-sc-hueco">
                          {fechaLarga(p.fecha)}
                        </time>
                      </div>
                      <Link href={rutaPublicacion(pid)} style={{ color: "#e7eef7", textDecoration: "none", fontSize: 14 }}>
                        {p.titulo}
                      </Link>
                      <p style={{ margin: "2px 0 0", fontSize: 12.5 }}>{p.medio}</p>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}

          <section className="vx-sc-panel">
            <h2>Índice completo por fecha</h2>
            <div className="vx-sc-tabla-envoltura">
              <table className="vx-sc-tabla">
                <caption style={{ textAlign: "left", padding: "8px 11px", fontSize: 12, color: "#9fb0c4" }}>
                  {porFecha.length} registros capturados el {CAPTURA}. El tipo y el nivel van en columnas separadas a
                  propósito.
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Fecha</th>
                    <th scope="col">Publicación</th>
                    <th scope="col">Medio</th>
                    <th scope="col">Tipo</th>
                    <th scope="col">Evidencia</th>
                  </tr>
                </thead>
                <tbody>
                  {porFecha.map((p) => (
                    <tr key={p.id}>
                      <td style={{ whiteSpace: "nowrap", fontFamily: "ui-monospace,monospace", fontSize: 11.5 }}>{p.fecha}</td>
                      <td>
                        <Link href={rutaPublicacion(p.id)}>{p.titulo}</Link>
                      </td>
                      <td style={{ color: "#9fb0c4" }}>{p.medio}</td>
                      <td style={{ color: "#9fb0c4" }}>{p.tipo}</td>
                      <td style={{ color: "#9fb0c4" }}>{p.nivelEtiqueta}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <aside className="vx-sc-lateral">
          <MiEstanteria lecturas={lecturas} />
        </aside>
      </div>
    </MarcoCiencia>
  );
}
