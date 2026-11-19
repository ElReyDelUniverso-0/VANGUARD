// ═══════════════════════════════════════════════════════════════════
// v420.0 VANGUARD LINGUA — portada del centro mundial de lenguas.
// ═══════════════════════════════════════════════════════════════════
import type { Metadata } from "next";
import Link from "next/link";
import { MarcoLingua } from "@/components/lingua/marco-lingua";
import { BarraAes, Cifras, Insignia } from "@/components/lingua/piezas";
import { cifrasLingua, familiasRaiz, nombreNodo, resumir, todasLasLenguas } from "@/lib/lingua/servidor";
import { RUTAS_LINGUA, formatoNumero, rutaFamilia, rutaIdioma, rutaPais } from "@/lib/lingua/tipos";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Lingua · Centro mundial de lenguas · VANGUARD",
  description:
    "Explora las lenguas del mundo: catálogo de más de 8.000 lenguas, árbol interactivo de familias, sistemas de escritura, alfabetos, diccionario multilingüe, expresiones, pronunciación con grabaciones reales y lenguas en peligro.",
  alternates: { canonical: `${SITE_URL}/lingua` },
};

const MODULOS: { href: string; titulo: string; texto: string; glifo: string }[] = [
  { href: RUTAS_LINGUA.familias, titulo: "Árbol de familias", texto: "Elige una familia y recorre sus ramas hasta cada lengua y dialecto, con su mapa y su estado.", glifo: "🌳" },
  { href: RUTAS_LINGUA.idiomas, titulo: "Catálogo de idiomas", texto: "Busca y filtra por macroárea, familia, país, tipo de lengua o grado de amenaza.", glifo: "📚" },
  { href: RUTAS_LINGUA.mapa, titulo: "Mapa de lenguas", texto: "Cada punto es una lengua en su ubicación de referencia. Colorea por familia o por amenaza.", glifo: "🗺️" },
  { href: RUTAS_LINGUA.regiones, titulo: "Lenguas por región", texto: "Colecciones por macroárea y por país, con la población hablante según CLDR.", glifo: "🧭" },
  { href: RUTAS_LINGUA.peligro, titulo: "Lenguas en peligro", texto: "Qué lenguas dejan de transmitirse, dónde se concentran y cuáles ya se extinguieron.", glifo: "🕯️" },
  { href: RUTAS_LINGUA.escrituras, titulo: "Sistemas de escritura", texto: "34 escrituras explicadas: tipo, origen, dirección, genealogía y caracteres reales de Unicode.", glifo: "𓂀" },
  { href: RUTAS_LINGUA.comparar, titulo: "Comparar escrituras", texto: "Dos escrituras frente a frente: cómo funcionan, de dónde vienen y qué lenguas las usan.", glifo: "⇄" },
  { href: RUTAS_LINGUA.alfabetos, titulo: "Alfabetos", texto: "El inventario de caracteres de 76 idiomas según Unicode CLDR, con el nombre de cada signo.", glifo: "Aα" },
  { href: RUTAS_LINGUA.diccionario, titulo: "Diccionario multilingüe", texto: "Busca cualquier palabra en Wikcionario: definición, etimología y traducciones atestiguadas.", glifo: "📖" },
  { href: RUTAS_LINGUA.comparador, titulo: "Comparador de palabras", texto: "La misma palabra en las lenguas que elijas, lado a lado, para ver parentescos.", glifo: "≈" },
  { href: RUTAS_LINGUA.expresiones, titulo: "Biblioteca de expresiones", texto: "Saludos, cortesía, viaje y afecto en cientos de lenguas, con sus matices de uso.", glifo: "💬" },
  { href: RUTAS_LINGUA.pronunciacion, titulo: "Pronunciación", texto: "Grabaciones reales de Wikimedia Commons y transcripción AFI de Wikcionario. Nada sintetizado.", glifo: "🔊" },
  { href: RUTAS_LINGUA.traductor, titulo: "Traductor", texto: "Traducción automática con MyMemory, identificada como tal y con su grado de coincidencia.", glifo: "🌐" },
];

export default function Page() {
  const c = cifrasLingua();
  const { reales } = familiasRaiz();
  const top = reales.slice(0, 10);
  const r = resumir(todasLasLenguas());
  const json = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "VANGUARD Lingua · Centro mundial de lenguas",
    url: `${SITE_URL}/lingua`,
    inLanguage: "es",
    about: { "@type": "Thing", name: "Lenguas del mundo" },
    isBasedOn: ["https://glottolog.org/", "https://cldr.unicode.org/", "https://es.wiktionary.org/"],
  };
  return (
    <MarcoLingua
      activo={RUTAS_LINGUA.inicio}
      titulo="Lingua: las lenguas del mundo"
      sub="Un centro para explorar cómo habla y escribe la humanidad: de qué familia viene cada lengua, dónde se habla, cómo se escribe, cuánto peligro corre y cómo se dicen las cosas en ella. Con datos abiertos y citados, sin traducciones ni pronunciaciones inventadas."
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdSeguro(json) }} />
      <form className="vx-li-form" action={RUTAS_LINGUA.idiomas} method="get" role="search">
        <label className="ancho">
          Busca una lengua, un código ISO o un glottocode
          <input name="q" type="search" placeholder="quechua, wolof, eus, hait1244…" autoComplete="off" />
        </label>
        <button className="vx-li-boton" type="submit">
          Buscar
        </button>
      </form>

      <Cifras
        items={[
          { valor: formatoNumero(c.lenguas), label: "lenguas catalogadas (Glottolog)" },
          { valor: formatoNumero(c.familias), label: "familias genealógicas" },
          { valor: formatoNumero(c.aisladas), label: "lenguas aisladas" },
          { valor: formatoNumero(c.dialectos), label: "dialectos registrados" },
          { valor: formatoNumero(c.amenazadas), label: "lenguas amenazadas a casi extintas" },
          { valor: formatoNumero(c.extintas), label: "lenguas extintas documentadas" },
          { valor: formatoNumero(c.senas), label: "lenguas de señas" },
          { valor: c.escrituras, label: "sistemas de escritura explicados" },
        ]}
      />
      <p className="vx-li-nota">
        ¿Por qué {formatoNumero(c.lenguas)} y no unas 7.000? Ethnologue cuenta lenguas <em>vivas</em> (7.159 en su edición de 2025); Glottolog cataloga también las extintas de las que hay
        registro ({formatoNumero(c.extintas)}), las de señas y otras categorías. Ambos criterios son legítimos: aquí verás siempre de qué fuente sale cada cifra.
      </p>

      <section className="vx-li-seccion">
        <h2>Explora</h2>
        <div className="vx-li-rejilla tres">
          {MODULOS.map((m) => (
            <Link key={m.href} href={m.href} className="vx-li-tarjeta">
              <span className="vx-li-glifo" aria-hidden>
                {m.glifo}
              </span>
              <h3>{m.titulo}</h3>
              <p>{m.texto}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="vx-li-seccion">
        <h2>Lengua, dialecto, variedad y escritura no son lo mismo</h2>
        <p className="vx-li-nota">Lingua mantiene la distinción en cada ficha, con una etiqueta de color.</p>
        <div className="vx-li-distinciones">
          <div className="vx-li-tarjeta">
            <Insignia tipo="lengua" />
            <h3 style={{ marginTop: 8 }}>Lengua</h3>
            <p>Sistema de comunicación con identidad propia. Glottolog la separa de sus vecinas por inteligibilidad mutua limitada.</p>
          </div>
          <div className="vx-li-tarjeta">
            <Insignia tipo="dialecto" />
            <h3 style={{ marginTop: 8 }}>Dialecto</h3>
            <p>Forma de hablar una lengua propia de una zona o grupo, inteligible para el resto de sus hablantes.</p>
          </div>
          <div className="vx-li-tarjeta">
            <Insignia tipo="variedad" />
            <h3 style={{ marginTop: 8 }}>Variedad</h3>
            <p>Norma regional reconocida en estándares técnicos (es-MX, pt-BR, en-GB), con su propia ortografía o léxico.</p>
          </div>
          <div className="vx-li-tarjeta">
            <Insignia tipo="escritura" />
            <h3 style={{ marginTop: 8 }}>Sistema de escritura</h3>
            <p>Forma de representar una lengua con signos. Una lengua puede tener varias (serbio: cirílico y latino) y una escritura sirve a cientos de lenguas.</p>
          </div>
        </div>
        <p style={{ marginTop: 10 }}>
          <Link href={RUTAS_LINGUA.conceptos} className="vx-li-boton sec">
            Cómo distinguimos cada concepto →
          </Link>
        </p>
      </section>

      <section className="vx-li-seccion">
        <h2>Las familias más grandes</h2>
        <p className="vx-li-nota">Número de lenguas según Glottolog 5.4. Toca una para abrir su árbol.</p>
        <div className="vx-li-tabla-caja">
          <table className="vx-li-tabla">
            <thead>
              <tr>
                <th>Familia</th>
                <th className="num">Lenguas</th>
              </tr>
            </thead>
            <tbody>
              {top.map((f) => (
                <tr key={f.nodo.id}>
                  <td>
                    <Link href={rutaFamilia(f.nodo.id)}>{nombreNodo(f.nodo)}</Link>
                    <small>{f.nodo.nombre}</small>
                  </td>
                  <td className="num">{formatoNumero(f.n)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="vx-li-seccion">
        <h2>Cuántas lenguas están en peligro</h2>
        <p className="vx-li-nota">Estado agregado de amenaza (AES) de Glottolog para las {formatoNumero(r.n)} lenguas del catálogo.</p>
        <BarraAes aes={r.aes} sinAes={r.sinAes} enlaces={(i) => `${RUTAS_LINGUA.peligro}?aes=${i}`} />
      </section>

      <section className="vx-li-seccion">
        <h2>Empieza por aquí</h2>
        <ul className="vx-li-chips">
          <li><Link href={rutaPais("do")}>Lenguas de la República Dominicana</Link></li>
          <li><Link href={rutaIdioma("stan1288")}>Español</Link></li>
          <li><Link href={rutaIdioma("hait1244")}>Criollo haitiano</Link></li>
          <li><Link href={rutaIdioma("tain1254")}>Taíno</Link></li>
          <li><Link href={rutaIdioma("basq1248")}>Euskera, lengua aislada</Link></li>
          <li><Link href={rutaFamilia("indo1319")}>Árbol indoeuropeo</Link></li>
          <li><Link href={rutaFamilia("araw1281")}>Familia arahuaca</Link></li>
          <li><Link href="/conocimiento/enciclopedia/lenguas-del-mundo">Enciclopedia: lenguas del mundo</Link></li>
          <li><Link href="/conocimiento/enciclopedia/escritura">Enciclopedia: la escritura</Link></li>
        </ul>
      </section>
    </MarcoLingua>
  );
}
