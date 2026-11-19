// v420.0 VANGUARD LINGUA — comparador de palabras entre idiomas.
import type { Metadata } from "next";
import Link from "next/link";
import { MarcoLingua } from "@/components/lingua/marco-lingua";
import { Migas } from "@/components/lingua/piezas";
import { conceptos, FUENTE_PALABRAS, glottoDeCodigo, lenguaPorId, nombreCodigo, nombreDe } from "@/lib/lingua/servidor";
import { RUTAS_LINGUA, normalizarLingua, rutaIdioma } from "@/lib/lingua/tipos";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Comparador de palabras entre idiomas · Lingua · VANGUARD",
  description: "La misma palabra en las lenguas que elijas, lado a lado: agua, fuego, madre, sol… en lenguas romances, germánicas, eslavas, indígenas americanas y más.",
  alternates: { canonical: `${SITE_URL}/lingua/comparador` },
};

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

const GRUPOS: { id: string; nombre: string; codigos: string[] }[] = [
  { id: "romances", nombre: "Romances", codigos: ["es", "pt", "gl", "ca", "fr", "it", "ro", "la"] },
  { id: "germanicas", nombre: "Germánicas", codigos: ["en", "de", "nl", "sv", "da", "no", "is"] },
  { id: "eslavas", nombre: "Eslavas", codigos: ["ru", "uk", "pl", "cs", "sk", "sl", "sr", "bg"] },
  { id: "america", nombre: "Lenguas de América", codigos: ["es", "qu", "ay", "gn", "nah", "yua", "ht", "pap"] },
  { id: "asia", nombre: "Asia oriental", codigos: ["zh", "ja", "ko", "vi", "th", "id", "tl"] },
  { id: "semiticas", nombre: "Afroasiáticas", codigos: ["ar", "he", "mt", "am", "so", "ha"] },
  { id: "africa", nombre: "Atlántico-Congo", codigos: ["sw", "zu", "xh", "yo", "ig", "wo", "ln"] },
  { id: "india", nombre: "Subcontinente indio", codigos: ["hi", "bn", "ur", "pa", "ta", "te", "sa"] },
];

const BASICOS = ["agua", "fuego", "sol", "luna", "madre", "padre", "mano", "ojo", "uno", "dos", "tres", "noche"];

export default async function Page({ searchParams }: Props) {
  const sp = await searchParams;
  const todos = conceptos();
  const disponibles = new Set(todos.flatMap((c) => Object.keys(c.t)));
  disponibles.add("es");
  const grupo = GRUPOS.find((g) => g.id === sp.g);
  const textoL = typeof sp.l === "string" ? sp.l : "";
  // acepta códigos o nombres en español separados por comas
  const porNombre = new Map([...disponibles].map((c) => [normalizarLingua(nombreCodigo(c)), c]));
  const pedidos = (grupo ? grupo.codigos : textoL ? textoL.split(",") : GRUPOS[0].codigos)
    .map((x) => x.trim())
    .filter(Boolean)
    .map((x) => (disponibles.has(x.toLowerCase()) ? x.toLowerCase() : porNombre.get(normalizarLingua(x)) ?? ""))
    .filter((x, i, a) => x && a.indexOf(x) === i)
    .slice(0, 12);
  const pc = sp.pc;
  const pedidosP = Array.isArray(pc) ? pc : typeof pc === "string" ? [pc] : typeof sp.p === "string" && sp.p ? sp.p.split(",") : BASICOS;
  const filas = todos.filter((c) => pedidosP.includes(c.id));
  const enlaceGrupo = (g: string) => `${RUTAS_LINGUA.comparador}?g=${g}&p=${filas.map((f) => f.id).join(",")}`;

  return (
    <MarcoLingua
      activo={RUTAS_LINGUA.comparador}
      titulo="Comparador de palabras"
      sub="Pon la misma palabra en varias lenguas, una al lado de otra. Los parecidos pueden revelar parentesco (madre, mater, Mutter, mother) o préstamo; las diferencias muestran familias distintas. Todas las formas vienen de Wikcionario."
      fuente={<>{FUENTE_PALABRAS}</>}
    >
      <Migas pasos={[{ href: RUTAS_LINGUA.inicio, label: "Lingua" }, { label: "Comparador" }]} />
      <ul className="vx-li-chips" style={{ marginBottom: 12 }}>
        {GRUPOS.map((g) => (
          <li key={g.id}>
            <Link href={enlaceGrupo(g.id)} aria-current={grupo?.id === g.id ? "true" : undefined}>
              {g.nombre}
            </Link>
          </li>
        ))}
      </ul>
      <form className="vx-li-form" method="get" action={RUTAS_LINGUA.comparador}>
        <label className="ancho">
          Lenguas (códigos o nombres, separados por comas; hasta 12)
          <input name="l" defaultValue={pedidos.join(",")} placeholder="es,en,quechua,japonés" autoComplete="off" />
        </label>
        <fieldset style={{ border: 0, padding: 0, margin: 0, flex: "1 1 100%" }}>
          <legend style={{ fontSize: 12, color: "var(--pl-suave)", marginBottom: 6 }}>Palabras</legend>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px" }}>
            {todos.map((c) => (
              <label key={c.id} style={{ display: "inline-flex", gap: 5, alignItems: "center", flex: "none", fontSize: 14, color: "var(--pl-tinta)" }}>
                <input type="checkbox" name="pc" value={c.id} defaultChecked={pedidosP.includes(c.id)} style={{ width: "auto" }} />
                {c.palabra}
              </label>
            ))}
          </div>
        </fieldset>
        <button className="vx-li-boton" type="submit">
          Comparar
        </button>
      </form>
      <p className="vx-li-nota">{disponibles.size} lenguas tienen al menos una de estas palabras en Wikcionario. Una celda vacía significa que la fuente no recoge esa traducción.</p>

      {pedidos.length && filas.length ? (
        <div className="vx-li-tabla-caja">
          <table className="vx-li-tabla">
            <thead>
              <tr>
                <th>Palabra</th>
                {pedidos.map((c) => {
                  const g = glottoDeCodigo(c);
                  const l = g ? lenguaPorId(g) : undefined;
                  return (
                    <th key={c} style={{ textTransform: "none", letterSpacing: 0 }}>
                      {l ? <Link href={rutaIdioma(l.id)}>{nombreCodigo(c)}</Link> : nombreCodigo(c)}
                      <small style={{ display: "block", fontWeight: 400 }}>{l?.familia ? nombreDe(l.familia) : l?.aislada ? "aislada" : c}</small>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {filas.map((f) => (
                <tr key={f.id}>
                  <td>
                    <Link href={`${RUTAS_LINGUA.diccionario}?p=${encodeURIComponent(f.palabra)}`}>{f.palabra}</Link>
                  </td>
                  {pedidos.map((c) => {
                    if (c === "es") return <td key={c} className="vx-li-palabra">{f.palabra}</td>;
                    const t = f.t[c];
                    return (
                      <td key={c}>
                        {t?.length
                          ? t.slice(0, 3).map(([w, tr, nota], i) => (
                              <span key={i} style={{ display: "block" }}>
                                <span className="vx-li-palabra" lang={c}>
                                  {w}
                                </span>
                                {tr ? <span className="vx-li-tr"> {tr}</span> : null}
                                {nota ? <span className="vx-li-calif">{nota}</span> : null}
                              </span>
                            ))
                          : <span style={{ color: "var(--pl-tenue)" }}>—</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="vx-li-aviso">Elige al menos una lengua con datos y una palabra.</p>
      )}
    </MarcoLingua>
  );
}
