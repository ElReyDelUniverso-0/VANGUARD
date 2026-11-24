"use client";
// ═══════════════════════════════════════════════════════════════════
// v444.0 · EL MUNDO MUERTO — el visor del esqueleto (cliente)
// Monta la escena three.js con import() (three no viaja con la página),
// enseña la carga, el panel del módulo elegido y una fila de huesos para
// quien no quiera (o no pueda) girar el modelo. Si no hay WebGL, la
// página sigue entera: la lámina de módulos está debajo, en HTML.
// ═══════════════════════════════════════════════════════════════════
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ModuloLigero } from "@/lib/mundo-muerto/modulos";
import type { Escena } from "./escena";

type Estado = "cargando" | "listo" | "error" | "sin3d";

function hayWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export function Esqueleto3D({ modulos }: { modulos: ModuloLigero[] }) {
  const visor = useRef<HTMLDivElement>(null);
  const escena = useRef<Escena | null>(null);
  const [estado, setEstado] = useState<Estado>("cargando");
  const [progreso, setProgreso] = useState(0);
  const [elegido, setElegido] = useState<string | null>(null);

  useEffect(() => {
    const cont = visor.current;
    if (!cont) return;
    if (!hayWebGL()) {
      setEstado("sin3d");
      return;
    }
    let vivo = true;
    const reducido = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    import("./escena")
      .then(({ montarEsqueleto }) => {
        if (!vivo) return;
        escena.current = montarEsqueleto(cont, {
          url: "/mundo-muerto/esqueleto.glb",
          reducido,
          marcas: modulos.map((m, i) => ({ id: m.id, zona: m.zona, numero: i + 1, etiqueta: m.nombre, hueso: m.hueso, color: m.color })),
          alSeleccionar: (id) => setElegido(id),
          alProgreso: (p) => setProgreso(p),
          alListo: () => {
            setEstado("listo");
            const h = decodeURIComponent(window.location.hash.replace("#", ""));
            if (h && modulos.some((m) => m.id === h)) {
              setElegido(h);
              setTimeout(() => escena.current?.enfocar(h), 900);
            }
          },
          alError: () => setEstado("error"),
        });
      })
      .catch(() => vivo && setEstado("error"));
    return () => {
      vivo = false;
      escena.current?.destruir();
      escena.current = null;
    };
  }, [modulos]);

  const elegir = useCallback((id: string | null) => {
    setElegido(id);
    escena.current?.enfocar(id);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") elegir(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [elegir]);

  const i = elegido ? modulos.findIndex((m) => m.id === elegido) : -1;
  const m = i >= 0 ? modulos[i] : null;
  const vecino = (d: number) => modulos[(i + d + modulos.length) % modulos.length].id;

  return (
    <div>
      <div ref={visor} className={`mm-visor${elegido ? " mm-hay-eleccion" : ""}`}>
        {estado !== "sin3d" && (
          <div className={`mm-carga${estado === "listo" ? " fuera" : ""}`} aria-hidden={estado === "listo"}>
            <div>
              <p>{estado === "error" ? "El esqueleto no pudo cargarse" : `Reconstruyendo el esqueleto · ${Math.round(progreso * 100)} %`}</p>
              {estado !== "error" && (
                <div className="mm-carga-barra">
                  <span style={{ width: `${Math.max(4, progreso * 100)}%` }} />
                </div>
              )}
            </div>
          </div>
        )}
        {estado === "sin3d" && (
          <div className="mm-sin3d">
            <p>Tu navegador no puede dibujar el esqueleto en 3D. Los trece módulos están abajo, uno por hueso.</p>
          </div>
        )}
        {estado === "listo" && <div className="mm-pista">Arrastra para girar · pellizca para acercar · toca un hueso</div>}

        <aside
          className={`mm-panel${m ? " abierto" : ""}`}
          style={m ? ({ "--c": m.color } as React.CSSProperties) : undefined}
          aria-hidden={!m}
          aria-live="polite"
        >
          {m && (
            <>
              <button type="button" className="mm-panel-cerrar" onClick={() => elegir(null)} aria-label="Cerrar y volver al esqueleto entero">
                ×
              </button>
              <p className="mm-panel-hueso">
                {String(i + 1).padStart(2, "0")} · {m.hueso}
              </p>
              <h2>{m.nombre}</h2>
              <p className="mm-panel-cifra">{m.cifra}</p>
              <p className="mm-panel-unidad">{m.unidad}</p>
              <p className="mm-panel-frase">{m.frase}</p>
              <Link className="mm-boton" href={`/mundo-muerto/${m.id}`}>
                Entrar al módulo →
              </Link>
              <div className="mm-panel-nav">
                <button type="button" onClick={() => elegir(vecino(-1))}>
                  ↑ Hueso anterior
                </button>
                <button type="button" onClick={() => elegir(vecino(1))}>
                  Hueso siguiente ↓
                </button>
              </div>
            </>
          )}
        </aside>
      </div>

      <nav className="mm-chips" aria-label="Los trece huesos">
        {modulos.map((x, n) => (
          <button
            key={x.id}
            type="button"
            className="mm-chip"
            style={{ "--c": x.color } as React.CSSProperties}
            aria-pressed={elegido === x.id}
            onClick={() => {
              elegir(x.id);
              visor.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            }}
          >
            <span>{String(n + 1).padStart(2, "0")}</span>
            {x.nombre}
          </button>
        ))}
      </nav>
    </div>
  );
}
