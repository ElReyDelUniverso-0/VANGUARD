import type { Metadata } from "next";
import Link from "next/link";
import { ACONTECIMIENTOS, extensionTemporal } from "@/lib/memoria/acontecimientos";
import { COLECCIONES_MEMORIA, PERIODOS } from "@/lib/memoria/colecciones";
import { FUENTES_ARCHIVO, PUERTAS_AUSENTES } from "@/lib/memoria/fuentes";
import { SITE_URL } from "@/lib/site";
import { BuscadorMemoria } from "@/components/memoria/buscador-memoria";
import "../memoria/memoria.css";

// ═══════════════════════════════════════════════════════════════════
// v419.0 · MEMORY ARCHIVE — la portada del archivo documental
//
// No es otra enciclopedia: es un archivo. Nada de lo que se enseña aquí lo
// escribe la casa: cada documento vive en la Library of Congress, en el
// Internet Archive o en Wikimedia Commons, y aquí se cataloga con su
// procedencia, su fecha y —lo que manda— su estado de derechos.
//
// Esta portada es un componente de servidor: cero JavaScript de cliente
// salvo el visor de las fichas. Seis puertas: buscar, acontecimientos,
// colecciones, períodos, fuentes y la política de derechos.
// ═══════════════════════════════════════════════════════════════════

export const metadata: Metadata = {
  title: "Archivo de la memoria — documentos, fotografías y mapas históricos",
  description:
    "Archivo documental de VANGUARD: documentos originales, fotografías históricas y mapas antiguos de la Library of Congress, el Internet Archive y Wikimedia Commons, con su procedencia, su fecha y su estado de derechos. Cada acontecimiento lleva a sus documentos.",
  alternates: { canonical: `${SITE_URL}/memoria` },
  openGraph: {
    title: "Archivo de la memoria — VANGUARD",
    description:
      "Documentos originales, fotografías y mapas con procedencia y derechos declarados. Abre un acontecimiento y encuentra sus documentos.",
    url: `${SITE_URL}/memoria`,
    type: "website",
  },
};

const EXTENSION = extensionTemporal();

export default function MemoriaPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Archivo de la memoria — VANGUARD",
    description:
      "Archivo documental con documentos, fotografías y mapas históricos de tres instituciones públicas, con procedencia y estado de derechos.",
    url: `${SITE_URL}/memoria`,
    isPartOf: { "@type": "WebSite", name: "VANGUARD", url: SITE_URL },
    about: ACONTECIMIENTOS.map((a) => ({ "@type": "Event", name: a.titulo, startDate: String(a.desde) })),
  };

  return (
    <main className="vx-mem">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="vx-mem-caja">
        <header>
          <p className="vx-mem-volanta">Vanguard · Memory Archive</p>
          <h1 className="vx-mem-titulo">Archivo de la memoria</h1>
          <p className="vx-mem-sub">
            El archivo no guarda copias: guarda puertas. Cada documento, fotografía o mapa de esta casa se consulta
            en la institución que lo custodia —la Library of Congress, el Internet Archive o Wikimedia Commons— y se
            enseña con su fecha, su procedencia y su estado de derechos. Cuando la fuente no autoriza la imagen, aquí
            no se publica: se enlaza y se dice por qué.
          </p>
        </header>

        <BuscadorMemoria valores={{ q: "", autor: "", fuente: "todas", tipo: "", desde: "", hasta: "" }} />
        <p className="vx-mem-nota" style={{ marginTop: 10 }}>
          Consulta en vivo las tres fuentes a la vez. Se puede buscar por texto, por autor, por tipo de documento,
          por fuente y por rango de años.{" "}
          <Link className="vx-mem-enlace" href="/memoria/fuentes">
            Qué hay detrás de cada puerta
          </Link>
          .
        </p>

        <section className="vx-mem-sec">
          <h2>Acontecimientos con sus documentos</h2>
          <p className="vx-mem-nota">
            Abre un acontecimiento histórico y aparecen los documentos originales que lo sostienen: borradores,
            facsímiles, fotografías y mapas, cada uno con su papel en el expediente y su enlace a la institución.
            Entre {EXTENSION.desde} y {EXTENSION.hasta} hay {ACONTECIMIENTOS.length} expedientes abiertos.
          </p>
          <div className="vx-mem-rejilla vx-mem-rejilla--ancha">
            {ACONTECIMIENTOS.map((a) => (
              <Link key={a.slug} href={`/memoria/acontecimiento/${a.slug}`} className="vx-mem-tarjeta" style={{ padding: 14, gap: 8 }}>
                <p className="vx-mem-meta">{a.volanta}</p>
                <h3 style={{ margin: 0, fontSize: 16, lineHeight: 1.3, color: "#fafafa" }}>{a.titulo}</h3>
                <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, color: "#a1a1aa" }}>{a.resumen}</p>
                <p className="vx-mem-meta" style={{ marginTop: "auto" }}>
                  {a.piezas.length} piezas fijadas · {a.consultas.length} búsquedas declaradas
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="vx-mem-sec">
          <h2>Colecciones temáticas</h2>
          <p className="vx-mem-nota">
            Una colección aquí es una consulta declarada, no una lista de folios copiada a mano: se dice qué se busca,
            en qué fuentes y con qué filtros, y los documentos que salen son los que la institución publica hoy.
          </p>
          <div className="vx-mem-rejilla">
            {COLECCIONES_MEMORIA.map((c) => (
              <Link key={c.slug} href={`/memoria/coleccion/${c.slug}`} className="vx-mem-tarjeta" style={{ padding: 14, gap: 8 }}>
                <h3 style={{ margin: 0, fontSize: 14.5, lineHeight: 1.35, color: "#fafafa" }}>{c.titulo}</h3>
                <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.5, color: "#e8c56a" }}>{c.pregunta}</p>
                <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.55, color: "#a1a1aa" }}>{c.intro}</p>
                <p className="vx-mem-meta" style={{ marginTop: "auto" }}>
                  {c.desde ?? "sin límite"}–{c.hasta ?? "hoy"} · {c.fuentes.length} fuentes
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="vx-mem-sec">
          <h2>Explorar por siglo</h2>
          <p className="vx-mem-nota">El archivo por períodos: documentos, fotografías y mapas de cada siglo, con la fecha que declara la fuente.</p>
          <div className="vx-mem-fuentes">
            {PERIODOS.map((p) => (
              <Link key={p.slug} href={`/memoria/periodo/${p.slug}`} className="vx-mem-fuente" style={{ textDecoration: "none" }}>
                <strong>{p.titulo}</strong>
                {p.desde}–{p.hasta}
              </Link>
            ))}
          </div>
        </section>

        <section className="vx-mem-sec">
          <h2>Las puertas del archivo</h2>
          <p className="vx-mem-nota">
            Tres instituciones, tres contratos públicos, tres formas de declarar derechos. Cada ficha dice de dónde
            viene y qué permite.
          </p>
          <div className="vx-mem-fuentes">
            {FUENTES_ARCHIVO.map((f) => (
              <div key={f.id} className="vx-mem-fuente">
                <strong>{f.nombre}</strong>
                {f.pais}
                <br />
                <a href={f.url} target="_blank" rel="noopener noreferrer" className="vx-mem-enlace">
                  Ir a la institución ↗
                </a>
              </div>
            ))}
            {PUERTAS_AUSENTES.map((p) => (
              <div key={p.nombre} className="vx-mem-fuente" data-estado="fuera">
                <strong>{p.nombre}</strong>
                no incluida: {p.motivo}
              </div>
            ))}
          </div>
        </section>

        <div className="vx-mem-pie">
          <p>
            El archivo no copia libros ni archivos protegidos: enlaza la digitalización de quien la custodia y describe
            lo que esa institución publica. Las imágenes se sirven desde el servidor de la institución, no desde esta
            casa.{" "}
            <Link href="/memoria/fuentes">Política de procedencia y derechos</Link> ·{" "}
            <Link href="/memoria/comparar">Comparar dos documentos</Link> ·{" "}
            <Link href="/api/memoria/buscar?q=declaration">Puerta de máquina</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
