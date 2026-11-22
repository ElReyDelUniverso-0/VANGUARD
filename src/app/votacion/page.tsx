// ════════════════════════════════════════════════════════════════════
// v439.6 · LA VOTACIÓN DEL MUNDO — sala completa
// Una pregunta geopolítica del día para todo el planeta. Determinista
// y predecible: el tablero base es el mismo para todos por fecha, y
// la pregunta de mañana ya se sabe hoy. El voto del piloto suma uno
// real (una vez por día, localStorage) — la casa no infla.
// ════════════════════════════════════════════════════════════════════
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  votacionDelDia,
  resultadosBase,
  aplicarVoto,
  votacionDeManana,
  leerTuVotacion,
  guardarTuVotacion,
  diaClave,
  type TuVotacion,
} from "@/lib/votacion-dia";

export default function PageVotacion() {
  const [votacion] = useState(() => votacionDelDia());
  const [base] = useState(() => resultadosBase(votacion));
  const [tu, setTu] = useState<TuVotacion>(null);
  const [lista, setLista] = useState<TuVotacion>(null);
  const [manana] = useState(() => votacionDeManana());

  useEffect(() => {
    const guardada = leerTuVotacion();
    if (guardada && guardada.clave === diaClave()) {
      setTu(guardada);
      setLista(guardada);
    }
  }, []);

  const tablero = lista ? aplicarVoto(base, lista.indice) : base;
  const yaVoto = Boolean(tu);

  const votar = (i: number) => {
    if (lista) return; // una vez por día
    guardarTuVotacion(diaClave(), i);
    setTu({ clave: diaClave(), indice: i });
    setLista({ clave: diaClave(), indice: i });
  };

  return (
    <main className="vx-sec vx-vot-sala">
      <div className="vx-wrap">
        <div className="vx-vot-crumb">
          <Link href="/">← Casa</Link>
          <span>· sala</span>
          <span>VOTACIÓN DEL MUNDO</span>
        </div>

        <div className="vx-vot-enc vx-vot-enc--grande">
          <span className="vx-sello">VOTACIÓN DEL MUNDO · {diaClave()}</span>
          <h1 className="vx-vot-q">{votacion.pregunta}</h1>
          <p className="vx-vot-sub">
            Una pregunta para todo el planeta. El tablero base es el mismo para
            todos, derivado determinísticamente de la fecha: sólido, predecible y
            sin inflar. Tu voto suma uno real, una vez por día.
          </p>
        </div>

        <div className="vx-vot-board vx-vot-board--grande" role="list">
          {tablero.resultados.map((r, i) => (
            <div
              key={r.texto}
              className={`vx-vot-opt${lista?.indice === i ? " vx-vot-opt--Tuyo" : ""}${r.texto === tablero.ganador ? " vx-vot-opt--Gano" : ""}`}
              role="listitem"
            >
              <button
                type="button"
                className="vx-vot-boton"
                onClick={() => votar(i)}
                disabled={lista !== null}
                aria-pressed={lista?.indice === i}
              >
                <span className="vx-vot-txt">{r.texto}</span>
                <span className="vx-vot-pct">{r.pct}%</span>
              </button>
              <div className="vx-vot-barra" aria-hidden>
                <span style={{ width: `${r.pct}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="vx-vot-pie">
          <span>
            <b>{tablero.total.toLocaleString("es-ES")}</b> votos planetarios ·
            líder del día: <b>{tablero.ganador}</b> (+{tablero.margen} pts sobre el segundo)
          </span>
          {yaVoto ? (
            <span className="vx-vot-anim">Tu voto ya está contado · gracias, piloto.</span>
          ) : (
            <span className="vx-vot-anim">Toca una opción: tu voto suma uno, una vez por día.</span>
          )}
        </div>

        <div className="vx-vot-doble">
          <div className="vx-vot-manana">
            <span className="vx-sello">Próxima votación · predecible</span>
            <p className="vx-vot-q-sm">{manana.pregunta}</p>
            <p className="vx-vot-sub">
              La pregunta de mañana ya se sabe hoy: la casa calcula la fecha
              con antelación. Nadie se queda fuera del debate.
            </p>
          </div>
          <div className="vx-vot-reglas">
            <span className="vx-sello">Cómo funciona</span>
            <ul>
              <li>Una pregunta por día, para todo el planeta.</li>
              <li>El tablero es determinista: igual para todos, por fecha.</li>
              <li>Un voto por piloto y por día, guardado solo en tu navegador.</li>
              <li>El resultado de mañana ya se puede ver hoy: sólido y predecible.</li>
            </ul>
          </div>
        </div>

        <p className="vx-vot-pie-fin">
          <Link href="/">Volver a la casa</Link>
        </p>
      </div>
    </main>
  );
}
