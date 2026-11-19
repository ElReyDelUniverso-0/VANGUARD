// v420.0 VANGUARD LINGUA — explorador de sistemas de escritura.
import type { Metadata } from "next";
import Link from "next/link";
import { MarcoLingua } from "@/components/lingua/marco-lingua";
import { Migas } from "@/components/lingua/piezas";
import { escrituras, FUENTE_ESCRITURAS, type Escritura } from "@/lib/lingua/servidor";
import { descendientesDe, raicesEscritura } from "@/lib/lingua/escrituras";
import { DIRECCIONES, RUTAS_LINGUA, TIPOS_ESCRITURA, rutaEscritura } from "@/lib/lingua/tipos";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Sistemas de escritura del mundo · Lingua · VANGUARD",
  description: "34 sistemas de escritura explicados: alfabetos, abyads, abugidas, silabarios y escrituras logográficas, con su origen, su genealogía y caracteres reales de Unicode.",
  alternates: { canonical: `${SITE_URL}/lingua/escrituras` },
};

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

function Rama({ e }: { e: Escritura }) {
  const hijos = descendientesDe(e.codigo);
  return (
    <li>
      <Link href={rutaEscritura(e.codigo)}>
        <span lang="und" style={{ marginRight: 6 }}>
          {e.muestra.slice(0, 3).join("")}
        </span>
        {e.nombre}
      </Link>{" "}
      <span className="vx-li-tr">
        {TIPOS_ESCRITURA[e.tipo]?.nombre ?? e.tipo}
        {e.ancestro && e.ancestro[1] !== "segura" ? ` · filiación ${e.ancestro[1]}` : ""}
      </span>
      {hijos.length ? (
        <ul className="vx-li-lista" style={{ marginTop: 5 }}>
          {hijos.map((h) => (
            <Rama key={h.codigo} e={h} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export default async function Page({ searchParams }: Props) {
  const sp = await searchParams;
  const tipo = typeof sp.tipo === "string" && TIPOS_ESCRITURA[sp.tipo] ? sp.tipo : "";
  const estado = sp.estado === "viva" || sp.estado === "histórica" ? sp.estado : "";
  const todas = escrituras();
  const lista = todas.filter((e) => (!tipo || e.tipo === tipo) && (!estado || e.estado === estado));
  const raices = raicesEscritura();
  const enlace = (t: string, s: string) => {
    const u = new URLSearchParams();
    if (t) u.set("tipo", t);
    if (s) u.set("estado", s);
    const q = u.toString();
    return `${RUTAS_LINGUA.escrituras}${q ? `?${q}` : ""}`;
  };
  return (
    <MarcoLingua
      activo={RUTAS_LINGUA.escrituras}
      titulo="Sistemas de escritura"
      sub="Una lengua no es su escritura: el turco cambió del alfabeto árabe al latino en 1928 sin dejar de ser turco, y el alfabeto latino sirve a cientos de lenguas sin parentesco. Aquí se explica cómo funciona cada sistema, de dónde viene y quién lo usa."
      fuente={<>Fichas editoriales de VANGUARD · {FUENTE_ESCRITURAS}</>}
    >
      <Migas pasos={[{ href: RUTAS_LINGUA.inicio, label: "Lingua" }, { label: "Escrituras" }]} />

      <section>
        <h2 style={{ fontSize: 19, margin: "0 0 8px" }}>Tipos de escritura</h2>
        <div className="vx-li-rejilla tres">
          {Object.entries(TIPOS_ESCRITURA).map(([k, v]) => {
            const n = todas.filter((e) => e.tipo === k).length;
            return (
              <Link key={k} href={enlace(k, estado)} className="vx-li-tarjeta" aria-current={tipo === k ? "true" : undefined} style={tipo === k ? { borderColor: "var(--pl-acento)" } : undefined}>
                <h3>
                  {v.nombre} · {n}
                </h3>
                <p>{v.nota}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="vx-li-seccion">
        <h2>Las escrituras</h2>
        <ul className="vx-li-chips" style={{ marginBottom: 12 }}>
          <li>
            <Link href={enlace(tipo, "")} aria-current={!estado ? "true" : undefined}>
              Todas
            </Link>
          </li>
          <li>
            <Link href={enlace(tipo, "viva")} aria-current={estado === "viva" ? "true" : undefined}>
              En uso
            </Link>
          </li>
          <li>
            <Link href={enlace(tipo, "histórica")} aria-current={estado === "histórica" ? "true" : undefined}>
              Históricas
            </Link>
          </li>
          {tipo ? (
            <li>
              <Link href={enlace("", estado)}>Quitar filtro de tipo</Link>
            </li>
          ) : null}
          <li>
            <Link href={RUTAS_LINGUA.comparar}>Comparar dos escrituras →</Link>
          </li>
        </ul>
        <div className="vx-li-rejilla tres">
          {lista.map((e) => (
            <Link key={e.codigo} href={rutaEscritura(e.codigo)} className="vx-li-tarjeta">
              <span className={`vx-li-glifo${e.direccion === "rtl" ? " vx-li-rtl" : ""}`} lang="und">
                {e.muestra.slice(0, 5).join(" ")}
              </span>
              <h3>{e.nombre}</h3>
              <p>
                {TIPOS_ESCRITURA[e.tipo]?.nombre ?? e.tipo} · {DIRECCIONES[e.direccion] ?? e.direccion}
              </p>
              <small>
                {e.estado === "viva" ? "En uso" : "Histórica"} · {e.epoca} · ISO 15924: {e.codigo}
              </small>
            </Link>
          ))}
        </div>
      </section>

      <section className="vx-li-seccion">
        <h2>Genealogía de las escrituras</h2>
        <p className="vx-li-nota">
          Quién deriva de quién. Las filiaciones marcadas como «probable» o «hipótesis» siguen en discusión entre especialistas; las escrituras inventadas de forma independiente o
          creadas por una persona encabezan su propia rama.
        </p>
        <div className="vx-li-caja">
          <ul className="vx-li-lista">
            {raices.map((e) => (
              <Rama key={e.codigo} e={e} />
            ))}
          </ul>
        </div>
      </section>
    </MarcoLingua>
  );
}
