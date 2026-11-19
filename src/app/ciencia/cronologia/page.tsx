// ============================================================
// v421.9 CRONOLOGÍA DE DESCUBRIMIENTOS — orden real de los registros.
// Cada entrada declara de qué tipo es: publicación, prepublicación,
// revisión, divulgación, premio (fecha de la ceremonia, no del
// descubrimiento) o hito histórico con su fuente.
// ============================================================
import type { Metadata } from "next";
import Link from "next/link";
import { MarcoCiencia, Migas } from "@/components/ciencia/piezas";
import {
  CRONOLOGIA,
  DISCIPLINAS,
  NIVEL_INFO,
  POR_ID,
  TIPO_INFO,
  disciplinaDe,
  fechaLarga,
  rutaBusqueda,
  rutaIdea,
  rutaPublicacion,
} from "@/lib/ciencia/indice";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Cronología de descubrimientos · Science Frontier",
  description:
    "De 1896 a hoy: publicaciones, prepublicaciones, revisiones, premios e hitos históricos del índice científico, con su tipo y su nivel de evidencia.",
  alternates: { canonical: `${SITE_URL}/ciencia/cronologia` },
};

const ETIQUETA: Record<string, string> = {
  publicacion: "publicación",
  preprint: "prepublicación",
  revision: "revisión",
  divulgacion: "divulgación",
  premio: "premio",
  hito: "hito",
};

export default function Page() {
  const anios = [...new Set(CRONOLOGIA.map((c) => c.fecha.slice(0, 4)))].sort((a, b) => b.localeCompare(a));
  const porAnio = new Map<string, typeof CRONOLOGIA>();
  for (const c of CRONOLOGIA) {
    const k = c.fecha.slice(0, 4);
    porAnio.set(k, [...(porAnio.get(k) ?? []), c]);
  }
  const conFiltro = (disciplina: string) => CRONOLOGIA.filter((c) => !c.disciplinaId || c.disciplinaId === disciplina).length;

  return (
    <MarcoCiencia activa="/ciencia/cronologia">
      <Migas pasos={[{ href: "/ciencia", label: "Science Frontier" }, { label: "Cronología" }]} />
      <p className="vx-sc-volanta">Cronología de descubrimientos</p>
      <h1>
        {CRONOLOGIA.length} entradas,
        <br />
        <em>en el orden en que ocurrieron</em>.
      </h1>
      <p className="vx-sc-sub">
        Una fecha de publicación no es la fecha del descubrimiento: un artículo de 2016 puede describir una señal
        registrada en 2015. Los premios aparecen con la fecha de la ceremonia y lo dicen. Los hitos históricos llevan
        su fuente.
      </p>

      <div className="vx-sc-facetas" role="group" aria-label="Filtrar la cronología por disciplina">
        <span className="vx-sc-kicker" style={{ alignSelf: "center", marginRight: 4 }}>
          Disciplina
        </span>
        <Link href="/ciencia/cronologia" aria-current="true">
          Todas <b>{CRONOLOGIA.length}</b>
        </Link>
        {DISCIPLINAS.map((d) => (
          <Link key={d.id} href={rutaBusqueda({ disciplina: d.id, orden: "antigua" })}>
            {d.nombre} <b>{conFiltro(d.id)}</b>
          </Link>
        ))}
      </div>

      {anios.map((a) => (
        <div className="vx-sc-anio" key={a}>
          <b>{a}</b>
          <ul>
            {(porAnio.get(a) ?? []).map((c) => {
              const pub = POR_ID.get(c.id);
              const disciplina = c.disciplinaId ? disciplinaDe(c.disciplinaId) : null;
              return (
                <li key={`${c.tipo}-${c.id}`}>
                  <time dateTime={c.fecha}>{c.precision === 1 ? "año" : c.fecha.slice(5)}</time>
                  <span
                    style={{
                      fontFamily: "ui-monospace,monospace",
                      fontSize: 10,
                      letterSpacing: ".08em",
                      textTransform: "uppercase",
                      color: c.tipo === "premio" ? "#e8c56a" : c.tipo === "hito" ? "#a78bfa" : "#6d7f94",
                      marginRight: 6,
                    }}
                  >
                    {ETIQUETA[c.tipo] ?? c.tipo}
                  </span>
                  {pub ? (
                    <>
                      <Link href={rutaPublicacion(pub.id)}>{pub.titulo}</Link>{" "}
                      <span className="vx-sc-hueco">
                        · {pub.medio} · {TIPO_INFO[pub.tipo].etiqueta} · {NIVEL_INFO[pub.nivel].etiqueta}
                        {disciplina ? ` · ${disciplina.nombre}` : ""}
                      </span>
                    </>
                  ) : c.tipo === "premio" ? (
                    <span>
                      <Link href={`/ciencia/premios#${c.id}`}>{c.titulo}</Link>{" "}
                      <span className="vx-sc-hueco">· ceremonia anual · {c.nota}</span>
                    </span>
                  ) : (
                    <span>
                      {c.fuente ? (
                        <a href={c.fuente} target="_blank" rel="noopener noreferrer" style={{ color: "#cbd5e1" }}>
                          {c.titulo} ↗
                        </a>
                      ) : (
                        c.titulo
                      )}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      <p className="vx-sc-hueco" style={{ marginTop: 18 }}>
        La cronología incluye solo lo que el índice tiene documentado. No es una historia completa de la ciencia: es
        la historia de estas {CRONOLOGIA.length} entradas.{" "}
        <Link href={rutaIdea("fondo")} style={{ color: "#22d3ee" }}>
          Empezar por el fondo de microondas
        </Link>{" "}
        o{" "}
        <Link href={rutaPublicacion("arrhenius")} style={{ color: "#22d3ee" }}>
          por el artículo más antiguo (1896)
        </Link>
        .
      </p>
    </MarcoCiencia>
  );
}
