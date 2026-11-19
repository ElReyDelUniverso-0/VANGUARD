"use client";

// ============================================================
// v421.9 EL EXPLORADOR DE DESCUBRIMIENTOS — la experiencia central.
//
// El lector elige un tema, ve la pregunta, recorre los pasos reales de
// la investigación y lee en cada paso QUÉ AÑADIÓ y QUÉ NO DEMUESTRA.
// Todo lo que muestra viene del índice capturado: aquí no se genera
// texto nuevo, solo se ordena y se explica lo ya escrito en la ficha.
//
// Sin servidor: el estado vive en el cliente; cada paso enlaza a su
// ficha completa (que sí se renderiza en el servidor y es indexable).
// ============================================================

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ESTADO_INFO,
  NIVEL_INFO,
  TIPO_INFO,
  disciplinaDe,
  fechaLarga,
  normalizar,
  rutaIdea,
  rutaPublicacion,
  type Idea,
  type Publicacion,
} from "@/lib/ciencia/indice";

type Props = {
  ideas: Idea[];
  publicaciones: Publicacion[];
};

export function ExploradorDescubrimientos({ ideas, publicaciones }: Props) {
  const porId = useMemo(() => new Map(publicaciones.map((p) => [p.id, p])), [publicaciones]);
  const [disciplina, setDisciplina] = useState<string>("todas");
  const [q, setQ] = useState("");
  const [ideaId, setIdeaId] = useState(ideas[0]?.id ?? "");
  const [paso, setPaso] = useState(0);

  const disciplinas = useMemo(() => {
    const vistas = new Map<string, string>();
    for (const i of ideas) {
      const d = disciplinaDe(i.disciplinaId);
      if (d) vistas.set(d.id, d.nombre);
    }
    return [...vistas.entries()];
  }, [ideas]);

  const visibles = useMemo(() => {
    const t = normalizar(q);
    return ideas.filter((i) => {
      if (disciplina !== "todas" && i.disciplinaId !== disciplina) return false;
      if (!t) return true;
      const texto = normalizar(
        [i.pregunta, i.sintesis, ...i.publicaciones.map((id) => porId.get(id)?.titulo ?? "")].join(" ")
      );
      return t.split(" ").every((termino) => termino.length < 2 || texto.includes(termino));
    });
  }, [ideas, disciplina, q, porId]);

  const idea = ideas.find((i) => i.id === ideaId) ?? visibles[0] ?? ideas[0];
  const pasos = idea ? idea.publicaciones.map((id) => porId.get(id)).filter((p): p is Publicacion => Boolean(p)) : [];
  const indice = Math.min(paso, Math.max(pasos.length - 1, 0));
  const actual = pasos[indice];
  const disciplinaActual = idea ? disciplinaDe(idea.disciplinaId) : null;

  function elegir(idea: Idea) {
    setIdeaId(idea.id);
    setPaso(0);
  }

  function mover(delta: number) {
    setPaso((p) => Math.min(Math.max(p + delta, 0), pasos.length - 1));
  }

  if (!idea) {
    return <p className="vx-sc-vacio">El índice no tiene ideas cargadas.</p>;
  }

  return (
    <div className="vx-sc-explorador">
      <aside className="vx-sc-temas" aria-label="Temas del explorador">
        <h2>1 · Elige un tema</h2>
        <div>
          <label htmlFor="sc-explorador-q" className="vx-sc-kicker">
            Filtrar por palabra
          </label>
          <input
            id="sc-explorador-q"
            type="search"
            className="vx-sc-campo"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="grafeno, clima, cerebro…"
            style={{ marginTop: 4 }}
          />
        </div>
        <div className="vx-sc-facetas" style={{ margin: 0 }} role="group" aria-label="Filtrar por disciplina">
          <button
            type="button"
            className="vx-sc-campo"
            style={{ width: "auto", padding: "6px 10px", fontSize: 12, background: disciplina === "todas" ? "rgba(34,211,238,.15)" : "transparent" }}
            aria-pressed={disciplina === "todas"}
            onClick={() => setDisciplina("todas")}
          >
            Todas
          </button>
          {disciplinas.map(([id, nombre]) => (
            <button
              key={id}
              type="button"
              className="vx-sc-campo"
              style={{
                width: "auto",
                padding: "6px 10px",
                fontSize: 12,
                background: disciplina === id ? "rgba(34,211,238,.15)" : "transparent",
              }}
              aria-pressed={disciplina === id}
              onClick={() => setDisciplina(id)}
            >
              {nombre}
            </button>
          ))}
        </div>
        <ul>
          {visibles.map((i) => {
            const d = disciplinaDe(i.disciplinaId);
            return (
              <li key={i.id}>
                <button type="button" aria-pressed={i.id === idea.id} onClick={() => elegir(i)}>
                  {i.pregunta}
                  <small>
                    {d?.nombre} · {i.desde}–{i.hasta} · {ESTADO_INFO[i.estado].etiqueta}
                  </small>
                </button>
              </li>
            );
          })}
          {visibles.length === 0 ? <li style={{ fontSize: 12, color: "#9fb0c4" }}>Ningún tema coincide con ese filtro.</li> : null}
        </ul>
      </aside>

      <div>
        <div className="vx-sc-panel" style={{ marginBottom: 12 }}>
          <p className="vx-sc-kicker" style={{ marginTop: 0, color: disciplinaActual?.color }}>
            {disciplinaActual?.nombre} · {idea.desde}–{idea.hasta}
          </p>
          <h2 style={{ fontSize: "clamp(20px,3.2vw,27px)", lineHeight: 1.22, margin: "2px 0 8px", letterSpacing: "-0.015em" }}>
            {idea.pregunta}
          </h2>
          <p style={{ fontSize: 14.5, lineHeight: 1.62, color: "#d6dfea" }}>{idea.sintesis}</p>
          <div className="vx-sc-sellos">
            <span className="vx-sc-estado" style={{ color: ESTADO_INFO[idea.estado].color }}>
              Estado: {ESTADO_INFO[idea.estado].etiqueta}
            </span>
            <span className="vx-sc-meta">{idea.publicaciones.length} publicaciones</span>
            <Link href={rutaIdea(idea.id)} style={{ color: "#22d3ee", fontSize: 12.5 }}>
              Ver la línea completa con todos los límites →
            </Link>
          </div>
          <p style={{ fontSize: 13, color: "#9fb0c4", marginTop: 8, marginBottom: 0 }}>{idea.estadoDetalle}</p>
        </div>

        <h3 className="vx-sc-kicker" style={{ color: "#6d7f94" }}>
          2 · Recorre los pasos
        </h3>
        <div className="vx-sc-riel" role="group" aria-label="Pasos de la investigación">
          {pasos.map((p, i) => (
            <button
              key={p.id}
              type="button"
              aria-pressed={i === indice}
              onClick={() => setPaso(i)}
            >
              <b>
                {p.fecha.slice(0, 4)} · paso {i + 1}
              </b>
              <span>{TIPO_INFO[p.tipo].etiqueta}</span>
            </button>
          ))}
        </div>

        {actual ? (
          <article className="vx-sc-panel" aria-live="polite" style={{ marginTop: 10 }}>
            <div className="vx-sc-sellos">
              <span style={{ color: TIPO_INFO[actual.tipo].color, border: "1px solid currentColor", borderRadius: 5, padding: "3px 7px", fontFamily: "ui-monospace,monospace", fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase" }}>
                {TIPO_INFO[actual.tipo].etiqueta}
              </span>
              <span style={{ color: actual.nivel === "hipotesis" ? "#fb7185" : "#cbd5e1", border: "1px dashed currentColor", borderRadius: 5, padding: "3px 7px", fontFamily: "ui-monospace,monospace", fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase" }}>
                {NIVEL_INFO[actual.nivel].etiqueta}
              </span>
              <span className="vx-sc-meta">
                <time dateTime={actual.fecha}>{fechaLarga(actual.fecha)}</time>
                <span className="sep">·</span>
                <span>{actual.medio}</span>
              </span>
            </div>
            <h2 style={{ fontSize: 18, margin: "10px 0 4px", lineHeight: 1.35 }}>
              <Link href={rutaPublicacion(actual.id)}>{actual.titulo}</Link>
            </h2>
            <p style={{ fontSize: 12, color: "#6d7f94", fontStyle: "italic", margin: "0 0 8px" }}>{actual.tituloOriginal}</p>
            <p style={{ margin: "0 0 6px", color: "#9fb0c4", fontSize: 12.5 }}>
              {actual.autores.length > 0
                ? `${actual.autores.slice(0, 4).map((a) => a.nombre).join(", ")}${actual.totalAutores > 4 ? ` y ${actual.totalAutores - 4} más` : ""}`
                : "Registro institucional sin autores"}
            </p>
            <p style={{ fontSize: 13, color: "#cbb98a", borderLeft: "2px solid #e8c56a", paddingLeft: 9, margin: "10px 0" }}>
              <b>Qué añadió este paso:</b> {idea.pasos[actual.id]}
            </p>
            <p style={{ fontSize: 14.5, lineHeight: 1.6, color: "#d6dfea" }}>{actual.lectura}</p>
            <p className="vx-sc-cautela">{actual.cautela}</p>
            <div className="vx-sc-meta" style={{ marginTop: 10 }}>
              <Link href={rutaPublicacion(actual.id)} style={{ color: "#22d3ee" }}>
                Ficha completa y datos de la captura →
              </Link>
              <span className="sep">·</span>
              <a href={actual.original} target="_blank" rel="noopener noreferrer" style={{ color: "#22d3ee" }}>
                Publicación original ↗
              </a>
            </div>
            <div className="vx-sc-acciones">
              <button type="button" className="vx-sc-boton secundario" onClick={() => mover(-1)} disabled={indice === 0}>
                ← Paso anterior
              </button>
              <button type="button" className="vx-sc-boton secundario" onClick={() => mover(1)} disabled={indice >= pasos.length - 1}>
                Paso siguiente →
              </button>
              <span className="vx-sc-meta">
                Paso {indice + 1} de {pasos.length}
              </span>
            </div>
          </article>
        ) : null}

        <div className="vx-sc-panel" style={{ marginTop: 12 }}>
          <h2>3 · Lo que todavía no está resuelto</h2>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13.5, lineHeight: 1.6, color: "#9fb0c4" }}>
            {idea.abiertas.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
          <p className="vx-sc-hueco" style={{ marginTop: 8 }}>
            El estado «{ESTADO_INFO[idea.estado].etiqueta}» se refiere a la pregunta completa, no a cada paso: una idea
            demostrada puede contener pasos que fueron hipótesis (y así se marcan).
          </p>
        </div>
      </div>
    </div>
  );
}
