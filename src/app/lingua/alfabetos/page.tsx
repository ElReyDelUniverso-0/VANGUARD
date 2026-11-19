// v420.0 VANGUARD LINGUA — explorador de alfabetos (inventarios CLDR).
import type { Metadata } from "next";
import Link from "next/link";
import { MarcoLingua } from "@/components/lingua/marco-lingua";
import { Insignia, Migas } from "@/components/lingua/piezas";
import { alfabetoDe, alfabetos, escrituraPorCodigo, FUENTE_ALFABETOS, glottoDeCodigo, lenguaPorId, nombreCaracter, nombreCodigo, nombreEscrituraCldr } from "@/lib/lingua/servidor";
import { RUTAS_LINGUA, formatoNumero, rutaEscritura, rutaIdioma } from "@/lib/lingua/tipos";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Alfabetos de 76 idiomas · Lingua · VANGUARD",
  description: "Las letras y signos que usa cada idioma según Unicode CLDR: conjunto principal, letras auxiliares, índice alfabético y cifras, con el nombre Unicode de cada carácter.",
  alternates: { canonical: `${SITE_URL}/lingua/alfabetos` },
};

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

/** escrituras compuestas de CLDR → fichas de la colección */
const COMPUESTAS: Record<string, string[]> = { Jpan: ["Hani", "Hira", "Kana"], Hans: ["Hani"], Hant: ["Hani"], Kore: ["Hang", "Hani"] };

const codigoDe = (c: string) => {
  const cp = c.codePointAt(0) ?? 0;
  return [...c].length === 1 ? `U+${cp.toString(16).toUpperCase().padStart(4, "0")}` : "secuencia";
};

function Glifos({ lista, rtl, titulo, nota }: { lista: string[]; rtl: boolean; titulo: string; nota?: string }) {
  if (!lista.length) return null;
  return (
    <section className="vx-li-seccion">
      <h2>
        {titulo} · {lista.length}
      </h2>
      {nota ? <p className="vx-li-nota">{nota}</p> : null}
      <div className={`vx-li-glifos${rtl ? " vx-li-rtl" : ""}`}>
        {lista.map((c, i) => (
          <div key={`${c}-${i}`} title={nombreCaracter(c) ?? c}>
            <b>{c}</b>
            <small>{codigoDe(c)}</small>
            {nombreCaracter(c) ? <small>{nombreCaracter(c)!.toLowerCase()}</small> : null}
          </div>
        ))}
      </div>
    </section>
  );
}

export default async function Page({ searchParams }: Props) {
  const sp = await searchParams;
  const todos = alfabetos();
  const loc = typeof sp.l === "string" && todos[sp.l] ? sp.l : "es";
  const a = alfabetoDe(loc)!;
  const nombre = nombreCodigo(loc);
  const g = glottoDeCodigo(loc);
  const l = g ? lenguaPorId(g) : undefined;
  const rtl = ["Arab", "Hebr", "Syrc", "Thaa", "Nkoo"].includes(a.escritura);
  const fichas = (COMPUESTAS[a.escritura] ?? [a.escritura]).map((c) => escrituraPorCodigo(c)).filter((x): x is NonNullable<typeof x> => Boolean(x));
  const orden = Object.keys(todos).sort((x, y) => nombreCodigo(x).localeCompare(nombreCodigo(y), "es"));
  return (
    <MarcoLingua
      activo={RUTAS_LINGUA.alfabetos}
      titulo="Alfabetos y conjuntos de caracteres"
      sub="Qué letras y signos necesita cada idioma para escribirse con normalidad, según el repositorio CLDR de Unicode (el que usan los teclados, los correctores y los sistemas operativos)."
      fuente={<>{FUENTE_ALFABETOS} · nombres de carácter: Unicode 15.1</>}
    >
      <Migas pasos={[{ href: RUTAS_LINGUA.inicio, label: "Lingua" }, { label: "Alfabetos" }]} />
      <ul className="vx-li-chips" aria-label="Idiomas">
        {orden.map((k) => (
          <li key={k}>
            <Link href={`${RUTAS_LINGUA.alfabetos}?l=${k}`} aria-current={k === loc ? "true" : undefined}>
              {nombreCodigo(k)}
            </Link>
          </li>
        ))}
      </ul>

      <section className="vx-li-seccion">
        <h2 style={{ fontSize: 24 }}>{nombre}</h2>
        <p style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center", margin: "6px 0" }}>
          <Insignia tipo="escritura" texto={nombreEscrituraCldr(a.escritura) ?? a.escritura} />
          <span className="vx-li-tr">código CLDR {loc}</span>
          {l ? (
            <Link href={rutaIdioma(l.id)} className="vx-li-boton sec" style={{ padding: "5px 10px", fontSize: 13 }}>
              Ficha de la lengua →
            </Link>
          ) : null}
          {fichas.map((f) => (
            <Link key={f.codigo} href={rutaEscritura(f.codigo)} className="vx-li-boton sec" style={{ padding: "5px 10px", fontSize: 13 }}>
              Escritura {f.nombre.toLowerCase()} →
            </Link>
          ))}
        </p>
      </section>

      {a.principal.length ? (
        <Glifos lista={a.principal} rtl={rtl} titulo="Conjunto principal" nota="Los caracteres de uso estándar, en el orden de CLDR (no siempre es el orden alfabético tradicional)." />
      ) : (
        <>
          <p className="vx-li-aviso">
            <b>Conjunto de {formatoNumero(a.total)} caracteres.</b> {nombre} usa un inventario demasiado grande para mostrarlo entero. Abajo ves los primeros 120 del conjunto
            principal de CLDR y, más abajo, el índice que se usa para ordenar.
          </p>
          <Glifos lista={a.muestra} rtl={rtl} titulo="Primeros caracteres del conjunto principal" />
        </>
      )}
      <Glifos lista={a.indice} rtl={rtl} titulo="Índice" nota="Las cabeceras con que se ordenan listas y diccionarios (por ejemplo, los contactos del teléfono)." />
      <Glifos lista={a.auxiliar} rtl={rtl} titulo="Caracteres auxiliares" nota="Aparecen en préstamos, nombres extranjeros o usos especiales, pero no forman parte del alfabeto propio." />
      <Glifos lista={a.numeros} rtl={rtl} titulo="Cifras y signos numéricos" />
    </MarcoLingua>
  );
}
