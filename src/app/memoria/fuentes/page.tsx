import type { Metadata } from "next";
import Link from "next/link";
import { FUENTES_ARCHIVO, PUERTAS_AUSENTES } from "@/lib/memoria/fuentes";
import { DERECHOS } from "@/lib/memoria/tipos";
import { veredicto } from "@/lib/memoria/derechos";
import { SITE_URL } from "@/lib/site";

// ═══════════════════════════════════════════════════════════════════
// v419.0 · /memoria/fuentes — procedencia, licencias y puertas ausentes
//
// La página que hace honesto al archivo: qué hay detrás de cada fuente, qué
// no cubre, cómo declara derechos, cómo se cita, y qué instituciones
// conocidas NO están y por qué. Sin esta página, un archivo es una caja
// opaca; con ella, se puede auditar desde fuera.
// ═══════════════════════════════════════════════════════════════════

export const metadata: Metadata = {
  title: "Fuentes, procedencia y derechos — Archivo de la memoria",
  description:
    "Qué instituciones sostienen el archivo documental de VANGUARD, qué licencia publica cada una, cómo se cita y qué puertas conocidas no están y por qué.",
  alternates: { canonical: `${SITE_URL}/memoria/fuentes` },
};

export default function FuentesPage() {
  return (
    <main className="vx-mem">
      <div className="vx-mem-caja">
        <header>
          <p className="vx-mem-volanta">Vanguard · Memory Archive</p>
          <h1 className="vx-mem-titulo">Fuentes, procedencia y derechos</h1>
          <p className="vx-mem-sub">
            El archivo no tiene fondos propios: tiene puertas a tres instituciones que publican sus colecciones con
            contrato abierto. No se copian libros ni archivos protegidos; se enlaza la digitalización de quien la
            custodia y se describe lo que esa institución declara.
          </p>
        </header>

        <section className="vx-mem-sec">
          <h2>Las tres puertas</h2>
          <div style={{ display: "grid", gap: 14 }}>
            {FUENTES_ARCHIVO.map((f) => (
              <article key={f.id} className="vx-mem-pieza">
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "baseline" }}>
                  <h3 style={{ margin: 0, fontSize: 17, color: "#fafafa" }}>{f.nombre}</h3>
                  <a className="vx-mem-enlace" href={f.url} target="_blank" rel="noopener noreferrer">
                    {f.url.replace("https://", "")} ↗
                  </a>
                </div>
                <p className="vx-mem-meta">{f.pais} · contrato: {f.contrato}</p>
                <div className="vx-mem-datos">
                  <div>
                    <span className="vx-mem-etq">Qué cubre</span>
                    <span>{f.cubre}</span>
                  </div>
                  <div>
                    <span className="vx-mem-etq">Qué no cubre</span>
                    <span>{f.noCubre}</span>
                  </div>
                  <div>
                    <span className="vx-mem-etq">Derechos</span>
                    <span>{f.derechos}</span>
                  </div>
                  <div>
                    <span className="vx-mem-etq">Filtro por fecha</span>
                    <span>
                      {f.filtraPorFecha
                        ? "sí: la consulta lleva el rango de años"
                        : "no: el archivo pide más resultados y descarta fuera de rango (se dice en cada búsqueda)"}
                    </span>
                  </div>
                  <div>
                    <span className="vx-mem-etq">Cómo se cita</span>
                    <span>{f.citar}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="vx-mem-sec">
          <h2>Las cinco clases de derechos</h2>
          <p className="vx-mem-nota">
            Cada documento del archivo cae en una de estas cinco clases. La clase decide si el archivo publica la imagen
            o solo la ficha y el enlace. La frase literal de la institución se conserva siempre en la ficha.
          </p>
          <div className="vx-mem-datos">
            {DERECHOS.map((d) => {
              const v = veredicto(d);
              return (
                <div key={d}>
                  <span className="vx-mem-etq">{v.etiqueta}</span>
                  <span>
                    {v.explicacion} <strong style={{ color: v.imagenPermitida ? "#86efac" : "#fca5a5" }}>
                      {v.imagenPermitida ? "El archivo publica la imagen." : "El archivo no publica la imagen."}
                    </strong>
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="vx-mem-sec">
          <h2>Puertas que no están</h2>
          <p className="vx-mem-nota">
            Un archivo se conoce también por lo que deja fuera. Estas instituciones son referencia en memoria
            documental y no forman parte de este archivo, por un motivo concreto:
          </p>
          <div className="vx-mem-fuentes">
            {PUERTAS_AUSENTES.map((p) => (
              <div key={p.nombre} className="vx-mem-fuente">
                <strong>{p.nombre}</strong>
                {p.motivo}
                <br />
                <a className="vx-mem-enlace" href={p.url} target="_blank" rel="noopener noreferrer">
                  Ir de todos modos ↗
                </a>
              </div>
            ))}
          </div>
        </section>

        <section className="vx-mem-sec">
          <h2>Reglas del archivo</h2>
          <ul className="vx-mem-lista">
            <li>No se alojan copias: las imágenes se sirven desde el servidor de la institución.</li>
            <li>No se reescriben las descripciones: se citan y se recortan, con enlace al registro original.</li>
            <li>Lo que la fuente no publica se escribe «sin dato». No se interpola, no se completa, no se adivina.</li>
            <li>Una fecha ausente no se convierte en una fecha aproximada: se dice que falta.</li>
            <li>Si una institución no contesta, se escribe su nombre y el motivo; no se convierte en cero resultados.</li>
            <li>La ausencia de licencia no es un permiso: se enlaza, no se publica la imagen.</li>
          </ul>
        </section>

        <div className="vx-mem-pie">
          <p>
            <Link href="/memoria">Portada del archivo</Link> · <Link href="/memoria/buscar">Buscar</Link> ·{" "}
            <Link href="/api/memoria/buscar?q=declaration">Puerta de máquina</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
