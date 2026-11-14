"use client";

// v400.0 LAS HISTORIAS — un círculo por frente activo. Al tocar: pantallas
// verticales (foto + titular + una línea), se pasan con un toque o solas a
// los 6 s. Anillo de color = hay novedades · gris = ya lo viste.
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { haceTexto } from "@/lib/portada/clasificar";
import { IcoCerrar, IcoFlecha } from "./iconos";

export type HistoriaNota = { id: string; titulo: string; resumen: string; imagen: string | null; fuente: string; fecha: string };
export type GrupoHistoria = { key: string; nombre: string; color: string; notas: HistoriaNota[]; total?: number };

function severidad(n: number): { nivel: number; color: string } {
  if (n >= 12) return { nivel: 5, color: "#ff3b30" };
  if (n >= 7) return { nivel: 4, color: "#ff6a3d" };
  if (n >= 4) return { nivel: 3, color: "#f59e0b" };
  if (n >= 2) return { nivel: 2, color: "#e8c56a" };
  return { nivel: 1, color: "#38bdf8" };
}

const CLAVE = "vx400-historias-vistas";

function leerVistas(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(CLAVE) || "{}");
  } catch {
    return {};
  }
}

export function Historias({ grupos }: { grupos: GrupoHistoria[] }) {
  const [vistas, setVistas] = useState<Record<string, string>>({});
  const [abierto, setAbierto] = useState<number | null>(null);
  const [paso, setPaso] = useState(0);

  useEffect(() => setVistas(leerVistas()), []);

  const marcar = useCallback((g: GrupoHistoria) => {
    const v = { ...leerVistas(), [g.key]: g.notas[0]?.id ?? "" };
    try {
      localStorage.setItem(CLAVE, JSON.stringify(v));
    } catch {}
    setVistas(v);
  }, []);

  const cerrar = useCallback(() => setAbierto(null), []);

  const siguiente = useCallback(() => {
    if (abierto === null) return;
    const g = grupos[abierto];
    if (paso < g.notas.length - 1) setPaso(paso + 1);
    else if (abierto < grupos.length - 1) {
      marcar(grupos[abierto + 1]);
      setAbierto(abierto + 1);
      setPaso(0);
    } else cerrar();
  }, [abierto, paso, grupos, marcar, cerrar]);

  const anterior = useCallback(() => {
    if (abierto === null) return;
    if (paso > 0) setPaso(paso - 1);
    else if (abierto > 0) {
      setAbierto(abierto - 1);
      setPaso(0);
    }
  }, [abierto, paso]);

  // avance automático
  useEffect(() => {
    if (abierto === null) return;
    const t = window.setTimeout(siguiente, 6000);
    return () => window.clearTimeout(t);
  }, [abierto, paso, siguiente]);

  // teclado + bloqueo de scroll
  useEffect(() => {
    if (abierto === null) return;
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") cerrar();
      if (e.key === "ArrowRight") siguiente();
      if (e.key === "ArrowLeft") anterior();
    };
    window.addEventListener("keydown", k);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", k);
      document.body.style.overflow = prev;
    };
  }, [abierto, cerrar, siguiente, anterior]);

  if (!grupos.length) return null;

  const g = abierto !== null ? grupos[abierto] : null;
  const n = g ? g.notas[paso] : null;

  return (
    <>
      <div className="vx-frentes" role="list" aria-label="Frentes activos">
        {grupos.map((gr, i) => {
          const visto = vistas[gr.key] && vistas[gr.key] === gr.notas[0]?.id;
          const total = gr.total ?? gr.notas.length;
          const sev = gr.key === "hoy" ? { nivel: 5, color: "#e8c56a" } : severidad(total);
          return (
            <button
              key={gr.key}
              role="listitem"
              className="vx-frente vx-mira"
              data-visto={visto ? "1" : "0"}
              style={{ ["--vx-sev" as string]: sev.color }}
              onClick={() => {
                marcar(gr);
                setAbierto(i);
                setPaso(0);
              }}
              aria-label={`Briefing de ${gr.nombre}: ${total} cables`}
            >
              <span className="vx-frente-top">
                <span className="vx-frente-n">{gr.nombre}</span>
                <span className="vx-punto" style={{ background: sev.color }} />
              </span>
              <span className="vx-frente-c">
                {gr.key === "hoy" ? "BRIEFING DEL DÍA" : `${total} ${total === 1 ? "CABLE" : "CABLES"} · 72 H`}
              </span>
              <span className="vx-frente-barra" aria-hidden>
                {[1, 2, 3, 4, 5].map((k) => (
                  <i key={k} data-on={k <= sev.nivel ? "1" : "0"} />
                ))}
              </span>
            </button>
          );
        })}
      </div>

      {g && n && (
        <div className="vx-visor" role="dialog" aria-modal="true" aria-label={`Historias: ${g.nombre}`} onClick={cerrar}>
          <div className="vx-visor-c vx-mira" onClick={(e) => e.stopPropagation()}>
            <div
              key={n.id}
              className="vx-visor-img vx-entra"
              style={
                n.imagen
                  ? { backgroundImage: `url("${n.imagen}")` }
                  : { background: `radial-gradient(120% 80% at 80% 10%, ${g.color}88, transparent 60%), linear-gradient(160deg,#151c2c,#0b0f17)` }
              }
            />
            <div className="vx-visor-barras">
              {g.notas.map((x, i) => (
                <span key={x.id + paso} data-e={i < paso ? "hecho" : i === paso ? "ahora" : "no"}>
                  <i />
                </span>
              ))}
            </div>
            <div className="vx-visor-top">
              <span className="vx-tag" style={{ color: "#fff" }}>
                <i style={{ background: g.color }} /> {g.nombre} · CABLE {paso + 1}/{g.notas.length}
              </span>
              <button className="vx-ico" onClick={cerrar} aria-label="Cerrar historias">
                <IcoCerrar />
              </button>
            </div>
            <button className="vx-visor-zona" style={{ left: 0 }} onClick={anterior} aria-label="Anterior" />
            <button className="vx-visor-zona" style={{ right: 0 }} onClick={siguiente} aria-label="Siguiente" />
            <div className="vx-visor-txt">
              <span className="vx-meta">
                <b>{n.fuente}</b> · {haceTexto(n.fecha)}
              </span>
              <h3>{n.titulo}</h3>
              {n.resumen && <p>{n.resumen.length > 170 ? n.resumen.slice(0, 167) + "…" : n.resumen}</p>}
              <Link href={`/lectura/${n.id}`} className="vx-btn" style={{ position: "relative", zIndex: 4 }}>
                Leer la nota <IcoFlecha className="" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
