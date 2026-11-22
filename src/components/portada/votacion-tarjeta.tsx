// ════════════════════════════════════════════════════════════════════
// v439.6 · LA VOTACIÓN DEL MUNDO — tarjeta de la portada
// Muestra la pregunta del día + el tablero base (determinista) + la
// puerta a la sala completa. El voto real del piloto solo se muestra
// tras montar (sin desajuste de hydration).
// ════════════════════════════════════════════════════════════════════
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  votacionDelDia,
  resultadosBase,
  aplicarVoto,
  leerTuVotacion,
  diaClave,
} from "@/lib/votacion-dia";

export function VotacionTarjeta() {
  const [votacion] = useState(() => votacionDelDia());
  const [base] = useState(() => resultadosBase(votacion));
  const [indice, setIndice] = useState<number | null>(null);

  useEffect(() => {
    const guardada = leerTuVotacion();
    if (guardada && guardada.clave === diaClave()) {
      setIndice(guardada.indice);
    }
  }, []);

  const tablero = indice === null ? base : aplicarVoto(base, indice);

  return (
    <section className="vx-sec vxp-ancla" id="votacion" aria-label="La votación del mundo">
      <div className="vx-wrap">
        <div className="vx-vot-card">
          <div className="vx-vot-enc">
            <span className="vx-sello">VOTACIÓN DEL MUNDO · {diaClave()}</span>
            <h2 className="vx-vot-q">{votacion.pregunta}</h2>
            <p className="vx-vot-sub">Una pregunta para todo el planeta. El tablero es el mismo para todos, por fecha: sólido y predecible.</p>
          </div>

          <div className="vx-vot-board" role="list">
            {tablero.resultados.map((r, i) => (
              <div
                key={r.texto}
                className={`vx-vot-opt${indice === i ? " vx-vot-opt--Tuyo" : ""}${r.texto === tablero.ganador ? " vx-vot-opt--Gano" : ""}`}
                role="listitem"
              >
                <button
                  type="button"
                  className="vx-vot-boton"
                  onClick={() => {
                    if (indice === null) setIndice(i);
                  }}
                  aria-pressed={indice === i}
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
              {tablero.total.toLocaleString("es-ES")} votos planetarios ·
              líder: <b>{tablero.ganador}</b> (+{tablero.margen} pts)
            </span>
            {indice === null ? (
              <span className="vx-vot-anim">toca una opción para sumar tu voto</span>
            ) : (
              <span className="vx-vot-anim">tu voto sumado · grazie, piloto</span>
            )}
          </div>

          <Link className="vx-vot-entrar" href="/votacion">
            Ver la sala de la votación
          </Link>
        </div>
      </div>
    </section>
  );
}
