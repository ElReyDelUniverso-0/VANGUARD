"use client";

// ═══════════════════════════════════════════════════════════════════════════
// v436.2 · LOS DOS INTERRUPTORES — sonido y movimiento, a mano y recordados
//
// Aparecen donde el Dueño los busca (el panel del descubrimiento y el hub
// /descubrir), pero valen para toda la casa: lo que se apaga aquí se apaga
// también en las 380 salas, porque el CSS y el audio leen lo mismo.
// ═══════════════════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { ponerSonido, suena } from "@/lib/sonido/tocar";
import {
  EVENTO, POR_DEFECTO, leer, ponerMovimiento,
  type Movimiento, type Preferencias,
} from "@/lib/interfaz/vivo";

const MOVS: { id: Movimiento; nombre: string; nota: string }[] = [
  { id: "auto", nombre: "auto", nota: "como pida el sistema" },
  { id: "suave", nombre: "suave", nota: "entra y sale, sin bucles" },
  { id: "quieto", nombre: "quieto", nota: "nada se mueve" },
];

export function AjustesVivo({ compacto = false }: { compacto?: boolean }) {
  const [p, setP] = useState<Preferencias>(POR_DEFECTO);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    setP(leer());
    setListo(true);
    const alCambiar = (e: Event) => {
      const d = (e as CustomEvent<Preferencias>).detail;
      if (d && typeof d === "object") setP(d);
    };
    window.addEventListener(EVENTO, alCambiar);
    return () => window.removeEventListener(EVENTO, alCambiar);
  }, []);

  const cambiarSonido = () => {
    const nuevo = ponerSonido(!p.sonido);
    setP(nuevo);
  };

  const cambiarMovimiento = (m: Movimiento) => {
    const nuevo = ponerMovimiento(p, m);
    setP(nuevo);
    suena("pestana");
  };

  return (
    <div className={compacto ? "vv-ajustes vv-compacto" : "vv-ajustes"}>
      <div className="vv-ajuste">
        <button
          type="button"
          className={p.sonido ? "vv-switch on" : "vv-switch"}
          role="switch"
          aria-checked={p.sonido}
          onClick={cambiarSonido}
          disabled={!listo}
        >
          <span className="vv-switch-punto" aria-hidden />
          <span className="vv-switch-txt">
            <b>Sonido</b>
            <em>{p.sonido ? "cada acción tiene el suyo" : "en silencio"}</em>
          </span>
        </button>
      </div>

      <div className="vv-ajuste vv-ajuste-largo">
        <span className="vv-rotulo">Movimiento</span>
        <div className="vv-segmento" role="radiogroup" aria-label="Movimiento">
          {MOVS.map((m) => (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={p.movimiento === m.id}
              className={p.movimiento === m.id ? "on" : ""}
              onClick={() => cambiarMovimiento(m.id)}
              title={m.nota}
              disabled={!listo}
            >
              {m.nombre}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
