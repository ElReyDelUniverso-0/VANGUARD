// v420.0 VANGUARD LINGUA — lengua, dialecto, variedad, macrolengua y escritura: cómo se distinguen.
import type { Metadata } from "next";
import Link from "next/link";
import { MarcoLingua } from "@/components/lingua/marco-lingua";
import { Fuentes, Insignia, Migas, type TipoInsignia } from "@/components/lingua/piezas";
import { dialectosDe, escriturasDeCodigo, macrolenguaDe, nombreEscrituraCldr, variedadesDe } from "@/lib/lingua/servidor";
import { RUTAS_LINGUA, rutaEscritura, rutaFamilia, rutaIdioma } from "@/lib/lingua/tipos";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Lengua, dialecto, variedad y escritura: qué es cada cosa · Lingua · VANGUARD",
  description: "Cómo distingue Lingua entre lengua, dialecto, variedad regional, macrolengua, familia y sistema de escritura, con ejemplos reales y los códigos que usa cada estándar.",
  alternates: { canonical: `${SITE_URL}/lingua/conceptos` },
};

export default function Page() {
  const arabe = macrolenguaDe("ara") ?? [];
  const chino = macrolenguaDe("zho") ?? [];
  const dialEs = dialectosDe("stan1288").length;
  const varEs = variedadesDe("es");
  const serbio = escriturasDeCodigo("sr");
  const bloques: { tipo: TipoInsignia; titulo: string; texto: React.ReactNode; ejemplo: React.ReactNode; codigo: string }[] = [
    {
      tipo: "lengua",
      titulo: "Lengua",
      texto:
        "Un sistema de comunicación cuyos hablantes no entienden sin aprendizaje a los de las lenguas vecinas. Glottolog aplica ese criterio de inteligibilidad mutua; la política (tener ejército, Estado o academia) no cuenta.",
      ejemplo: (
        <>
          El <Link href={rutaIdioma("stan1288")}>español</Link> y el <Link href={rutaIdioma("port1283")}>portugués</Link> son lenguas distintas aunque se entiendan en parte; el{" "}
          <Link href={rutaIdioma("hait1244")}>criollo haitiano</Link> es una lengua propia, no «francés mal hablado».
        </>
      ),
      codigo: "Glottocode (stan1288) e ISO 639-3 (spa)",
    },
    {
      tipo: "dialecto",
      titulo: "Dialecto",
      texto: "Una forma de hablar una lengua propia de una zona o de un grupo, inteligible para el resto de hablantes. Todo hablante habla algún dialecto: no hay lengua «sin dialecto».",
      ejemplo: (
        <>
          Glottolog registra {dialEs} dialectos del español, del andaluz al caribeño. Abre la <Link href={rutaIdioma("stan1288")}>ficha del español</Link> para verlos.
        </>
      ),
      codigo: "Glottocode de nivel «dialect»",
    },
    {
      tipo: "variedad",
      titulo: "Variedad regional normalizada",
      texto:
        "Una norma de uso con código técnico propio, la que eligen teclados, correctores y sistemas operativos. No es una categoría lingüística sino un estándar práctico: coincide a veces con un dialecto y a veces abarca varios.",
      ejemplo: (
        <>
          CLDR define {varEs.length} variedades del español con nombre propio: {varEs.map((v) => `${v.nombre} (${v.codigo})`).join(", ")}.
        </>
      ),
      codigo: "Etiqueta BCP 47 (es-419, pt-BR)",
    },
    {
      tipo: "variedad",
      titulo: "Macrolengua",
      texto:
        "Una categoría de ISO 639-3 para grupos de lenguas muy cercanas que en ciertos usos se tratan como una sola, sobre todo cuando comparten una lengua escrita común.",
      ejemplo: (
        <>
          El árabe («ara») agrupa {arabe.length} lenguas individuales (egipcio, marroquí, levantino…) bajo el <Link href={rutaIdioma("stan1318")}>árabe estándar</Link>; el chino («zho»),{" "}
          {chino.length}, entre ellas el <Link href={rutaIdioma("mand1415")}>mandarín</Link> y el <Link href={rutaIdioma("yuec1235")}>cantonés</Link>.
        </>
      ),
      codigo: "ISO 639-3 de tipo «M»",
    },
    {
      tipo: "familia",
      titulo: "Familia lingüística",
      texto:
        "El conjunto de lenguas que descienden de un antepasado común demostrado con el método comparativo. Una lengua sin parientes conocidos es una lengua aislada.",
      ejemplo: (
        <>
          La <Link href={rutaFamilia("indo1319")}>indoeuropea</Link> une el español con el hindi; el <Link href={rutaIdioma("basq1248")}>euskera</Link> es una lengua aislada.
        </>
      ),
      codigo: "Glottocode de nivel «family»",
    },
    {
      tipo: "escritura",
      titulo: "Sistema de escritura",
      texto:
        "La forma de representar una lengua con signos. Es independiente de la lengua: una lengua puede cambiar de escritura o usar varias, y una escritura sirve a lenguas sin parentesco.",
      ejemplo: (
        <>
          El serbio se escribe en {serbio ? [...serbio.p, ...serbio.s].map((s) => nombreEscrituraCldr(s) ?? s).join(" y ") : "cirílico y latino"}; el{" "}
          <Link href={rutaEscritura("Latn")}>alfabeto latino</Link> sirve al español, al suajili, al vietnamita y al turco.
        </>
      ),
      codigo: "ISO 15924 (Latn, Cyrl, Arab)",
    },
  ];
  return (
    <MarcoLingua
      activo={RUTAS_LINGUA.conceptos}
      titulo="Lengua, dialecto, variedad y escritura"
      sub="Cuatro palabras que se usan como sinónimos y no lo son. Lingua las distingue en cada ficha con una etiqueta de color, siguiendo los estándares que usan los lingüistas y la industria."
    >
      <Migas pasos={[{ href: RUTAS_LINGUA.inicio, label: "Lingua" }, { label: "Conceptos" }]} />
      <div style={{ display: "grid", gap: 12 }}>
        {bloques.map((b) => (
          <section key={b.titulo} className="vx-li-caja">
            <p style={{ margin: "0 0 6px" }}>
              <Insignia tipo={b.tipo} />
            </p>
            <h2 style={{ fontSize: 20, textTransform: "none", letterSpacing: 0, color: "var(--pl-tinta)" }}>{b.titulo}</h2>
            <div className="vx-li-texto">
              <p>{b.texto}</p>
              <p style={{ color: "var(--pl-suave)" }}>
                <b>Ejemplo.</b> {b.ejemplo}
              </p>
            </div>
            <p className="vx-li-nota" style={{ margin: 0 }}>
              Código: {b.codigo}
            </p>
          </section>
        ))}
      </div>
      <section className="vx-li-seccion">
        <h2>¿Y los criollos, los pidgins y las lenguas de señas?</h2>
        <div className="vx-li-texto">
          <p>
            Un <b>pidgin</b> es una lengua de contacto sin hablantes nativos. Cuando una generación lo aprende como lengua materna, se convierte en <b>criollo</b>: una lengua completa, como
            el haitiano o el <Link href={rutaIdioma("papi1253")}>papiamento</Link>. Las <b>lenguas de señas</b> son lenguas plenas con gramática propia; la{" "}
            <Link href={rutaIdioma("amer1248")}>lengua de señas americana</Link> no deriva del inglés hablado.
          </p>
        </div>
      </section>
      <section className="vx-li-seccion">
        <h2>Fuentes</h2>
        <Fuentes
          items={[
            { titulo: "Glottolog · principios de clasificación (Glottolog information)", url: "https://glottolog.org/glottolog/glottologinformation" },
            { titulo: "SIL International · ISO 639-3: alcance y tipos de lengua", url: "https://iso639-3.sil.org/about/scope" },
            { titulo: "IETF · BCP 47, etiquetas de idioma", url: "https://www.rfc-editor.org/info/bcp47" },
            { titulo: "Unicode · ISO 15924, códigos de escritura", url: "https://www.unicode.org/iso15924/" },
            { titulo: "Unicode CLDR · datos de idiomas y territorios", url: "https://cldr.unicode.org/" },
          ]}
        />
      </section>
    </MarcoLingua>
  );
}
