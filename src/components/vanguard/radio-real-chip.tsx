"use client";

// ============================================================
// v367.5 EL CHIP DE LA MÚSICA REAL (radio-real-chip.tsx)
//
// Un solo control, pequeño, que se monta en el reproductor global de la casa
// —el que vive en la portada y sigue sonando mientras el piloto navega— para
// que la música REAL del catálogo (dominio público y CC0) suene ALEATORIA en
// todo el Vanguard público con un toque.
//
// Se declara lo que es: enlace externo (archive.org), licencia a la vista y
// el aviso de que los navegadores exigen un toque para empezar. Si una pista
// falla, el motor salta solo y lo dice aquí mismo.
// ============================================================

import { useEffect, useState } from "react";
import Link from "next/link";
import { Play, Square, SkipForward, Music4 } from "lucide-react";
import {
  alCambiarRadioReal,
  armarRadioReal,
  encenderRadioReal,
  estadoRadioReal,
  pararRadioReal,
  saltarPistaReal,
  type EstadoRadioReal,
} from "@/lib/musica/radio-real";

export function RadioRealChip({ compacto = false }: { compacto?: boolean } = {}) {
  const [e, setE] = useState<EstadoRadioReal>(() => ({
    activa: false,
    pista: null,
    indice: 0,
    total: 0,
    fallosSeguidos: 0,
    aviso: "",
  }));

  useEffect(() => alCambiarRadioReal(setE), []);

  // v367.5 «que la música esté ya ahí»: se arma para el primer gesto del
  // piloto (los navegadores no dejan sonar antes). Si la paró a mano, manda
  // su decisión y no se enciende.
  useEffect(() => {
    armarRadioReal();
  }, []);

  const pista = e.pista;

  // ── FORMA COMPACTA: la que vive en la píldora de la portada, siempre a la
  //    vista (es la que cumple «que la música esté ya ahí al abrir»).
  if (compacto) {
    return (
      <div
        className="flex items-center gap-1 px-2 py-1 border-t border-amber-hud/20"
        data-vg-radio-real
        title="Música real de dominio público y CC0 (archive.org), en orden aleatorio"
      >
        <Music4 size={10} className={e.activa ? "text-amber blink-soft shrink-0" : "text-muted-foreground shrink-0"} />
        <span className="text-[7.5px] font-mono uppercase tracking-[0.18em] text-amber/80 shrink-0">real</span>
        <span className="min-w-0 flex-1 text-[8.5px] font-mono text-foreground/75 truncate">
          {e.activa && pista ? `${pista.nombre} · ${pista.licencia}` : `${e.total || 13} pistas libres · al azar`}
        </span>
        <button
          type="button"
          onClick={() => (estadoRadioReal().activa ? pararRadioReal() : encenderRadioReal())}
          aria-label={e.activa ? "Parar la música real" : "Encender la música real, en orden aleatorio"}
          className="shrink-0 w-5 h-5 flex items-center justify-center border border-amber-hud/40 rounded-sm text-amber hover:bg-amber-hud/20"
        >
          {e.activa ? <Square size={8} /> : <Play size={8} />}
        </button>
        {e.activa ? (
          <button
            type="button"
            onClick={() => saltarPistaReal()}
            aria-label="Otra pista al azar"
            className="shrink-0 w-5 h-5 flex items-center justify-center border border-amber-hud/30 rounded-sm text-foreground/70 hover:bg-amber-hud/20"
          >
            <SkipForward size={8} />
          </button>
        ) : null}
        {e.aviso ? <span className="shrink-0 text-[8px] text-amber" title={e.aviso}>⚠</span> : null}
      </div>
    );
  }

  return (
    <div
      className="hud-panel border-amber-hud/50 rounded-sm px-3 py-2"
      data-vg-radio-real
      title="Música real de dominio público y CC0, servida desde archive.org"
    >
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <Music4 size={13} className="shrink-0 text-amber" />
          <div className="min-w-0">
            <p className="text-[9px] font-mono uppercase tracking-[0.22em] text-amber/80">
              MÚSICA REAL · ALEATORIA{e.total ? ` · ${e.total} pistas` : ""}
            </p>
            <p className="text-[10px] font-mono text-foreground/80 truncate">
              {e.activa && pista
                ? `▸ ${pista.nombre} — ${pista.autor}`
                : "Dominio público y CC0. Un toque y suena en toda la casa."}
            </p>
            {e.activa && pista ? (
              <p className="text-[8px] font-mono uppercase tracking-[0.12em] text-muted-foreground/70 truncate">
                {pista.licencia} · {pista.categoria} · fuente archive.org
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => (estadoRadioReal().activa ? pararRadioReal() : encenderRadioReal())}
            className="inline-flex items-center gap-1 px-2 py-1 border border-amber-hud/50 rounded-sm text-[9px] font-mono uppercase tracking-widest text-amber hover:bg-amber-hud/20"
          >
            {e.activa ? <Square size={10} /> : <Play size={10} />}
            {e.activa ? "parar" : "activar"}
          </button>
          {e.activa ? (
            <button
              type="button"
              onClick={() => saltarPistaReal()}
              title="Otra pista al azar"
              className="inline-flex items-center gap-1 px-2 py-1 border border-amber-hud/40 rounded-sm text-[9px] font-mono uppercase tracking-widest text-foreground/80 hover:bg-amber-hud/20"
            >
              <SkipForward size={10} />
            </button>
          ) : null}
          <Link
            href="/musica"
            className="px-2 py-1 border border-amber-hud/30 rounded-sm text-[8px] font-mono uppercase tracking-widest text-muted-foreground hover:text-amber"
          >
            sala
          </Link>
        </div>
      </div>

      {e.aviso ? (
        <p className="mt-1 text-[8.5px] font-mono leading-relaxed text-amber/90">⚠ {e.aviso}</p>
      ) : null}
    </div>
  );
}

export default RadioRealChip;
