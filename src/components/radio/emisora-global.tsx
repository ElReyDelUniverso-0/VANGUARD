"use client";
// ═══════════════════════════════════════════════════════════════════
// v431.5 · LA EMISORA DE LA CASA — la voz, en todas partes.
//
// POR QUÉ: el Dueño, textual: «pero la voz está en otro lado, está en Cuartel
// y ¿por qué no las agregas a Vanguard normal?». Tenía razón: la voz vivía en
// /radio y en el Cuartel, y en la portada no había voz. Ahora la emisora se
// monta UNA vez en el layout y suena en toda la casa: empezarla en la portada
// y seguir navegando al Cuartel sin que se corte.
//
// QUÉ ES Y QUÉ NO ES:
//   · ES la misma emisión de siempre: pide el programa a /api/radio/programa
//     (una sola construcción, en el servidor) y lo lee con `usaEmision`, el
//     MISMO encadenado de bloques que usa el estudio. Un solo código.
//   · NO es una segunda radio: en /radio, en /voz y en las salas inmersivas se
//     aparta, porque ahí la voz la lleva la sala. Una sola voz manda.
//   · NO manda nada a ningún sitio: no hay cuenta ni audio saliendo; el texto
//     del programa se pide una vez y se queda en el aparato.
// ═══════════════════════════════════════════════════════════════════

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { avisosDelAparato, leerGustos, type GustosVoz } from "@/lib/voz/decir";
import type { BloqueGuion } from "@/lib/radio/guion";
import { usaEmision } from "@/lib/radio/usa-emision";
import { idiomaActual } from "@/lib/voz/idiomas";

type Programa = {
  titulo: string;
  bloques: BloqueGuion[];
  duracionMs: number;
  asuntos: number;
  generadoEn: string;
};

const RUTAS_SIN_EMISORA = ["/radio", "/voz", "/vanguard2"];
const MINUTOS = [2, 5, 10, 15];

function mmss(ms: number): string {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function msDe(b: { texto: string; pausaMs: number }): number {
  return Math.round((b.texto.length / 14) * 1000) + b.pausaMs;
}

export function EmisoraGlobal() {
  const ruta = usePathname() || "/";
  const oculta = RUTAS_SIN_EMISORA.some((r) => ruta === r || ruta.startsWith(r + "/"));
  const [abierta, setAbierta] = useState(false);
  const [minutos, setMinutos] = useState(5);
  const [programa, setPrograma] = useState<Programa | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [gustos, setGustos] = useState<GustosVoz | null>(null);
  const [aviso, setAviso] = useState("");
  const pedido = useRef(0);
  // cuando se pide el programa desde el play, el arranque espera a que los
  // bloques estén EN PANTALLA (el estado llega un render después del fetch)
  const arrancarAlLlegar = useRef(false);

  const bloques = programa?.bloques ?? [];
  const emision = usaEmision(bloques, gustos ?? { persona: "locutora", vozURI: null, rate: 1, pitch: 1, volumen: 0.95, pausas: true });

  // los gustos de la casa se leen al montar (y cuando cambia la pestaña)
  useEffect(() => {
    setGustos(leerGustos());
    setAviso(avisosDelAparato("es")[0] ?? "");
    const alVolver = () => setGustos(leerGustos());
    window.addEventListener("focus", alVolver);
    return () => window.removeEventListener("focus", alVolver);
  }, []);

  const pedir = useCallback(
    async (min: number, motivo: "abrir" | "cambiar" | "sonar") => {
      const marca = ++pedido.current;
      setCargando(true);
      setError("");
      try {
        // v437.0 · el programa se pide en el idioma de la casa
        const r = await fetch(`/api/radio/programa?min=${min}&lang=${idiomaActual()}`, {
          headers: { accept: "application/json" },
        });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const j = (await r.json()) as { ok: boolean; programa: Programa };
        if (marca !== pedido.current) return null;
        setPrograma(j.programa);
        if (motivo === "sonar") return j.programa;
        return j.programa;
      } catch (e) {
        if (marca === pedido.current) setError(`No he podido traer el programa (${(e as Error).message}).`);
        return null;
      } finally {
        if (marca === pedido.current) setCargando(false);
      }
    },
    []
  );

  const alternar = useCallback(async () => {
    if (emision.sonando) {
      emision.parar();
      return;
    }
    setAbierta(true);
    if (!programa) {
      arrancarAlLlegar.current = true;
      await pedir(minutos, "sonar");
      return;
    }
    // arranca en el bloque 0 (el programa es de hoy; no se reanuda a ciegas)
    emision.empezar(0);
  }, [emision, minutos, pedir, programa]);

  // el play pedido antes de tener el programa arranca en cuanto llegan los bloques
  useEffect(() => {
    if (!arrancarAlLlegar.current || bloques.length === 0) return;
    arrancarAlLlegar.current = false;
    emision.empezar(0);
  }, [bloques.length, emision]);

  // al cambiar de ruta a una sala con voz propia, se calla (una sola voz manda)
  const parar = emision.parar;
  useEffect(() => {
    if (oculta) parar();
  }, [oculta, parar]);

  const frase = emision.frase?.texto ?? (programa?.bloques[0]?.texto ?? "");
  const bloque = programa?.bloques[Math.max(0, emision.bloqueActual)];
  const total = useMemo(() => bloques.reduce((ms, b) => ms + msDe(b), 0), [bloques]);
  const gastado = useMemo(
    () => bloques.slice(0, Math.max(0, emision.bloqueActual)).reduce((ms, b) => ms + msDe(b), 0),
    [bloques, emision.bloqueActual]
  );

  if (oculta) return null;

  return (
    <div className={abierta ? "vxe-emisora vxe-emisora--abierta" : "vxe-emisora"}>
      {/* ── el panel (solo cuando se abre) ── */}
      {abierta ? (
        <section className="vxe-emisora-panel" aria-label="La emisora de la casa">
          <header className="vxe-emisora-cab">
            <span className={emision.sonando ? "vxe-emisora-aire vxe-emisora-aire--on" : "vxe-emisora-aire"}>
              <span className="vxe-emisora-punto" aria-hidden />
              {emision.sonando ? "EN EL AIRE" : "EN SILENCIO"}
            </span>
            <button type="button" className="vxe-emisora-cerrar" onClick={() => setAbierta(false)} aria-label="Cerrar la emisora">
              ✕
            </button>
          </header>

          <p className="vxe-emisora-titulo">
            {programa ? programa.titulo : cargando ? "Preparando el programa…" : "Radio Vanguard"}
            {programa ? <span className="vxe-emisora-dur"> · {mmss(total)}</span> : null}
          </p>

          <p className="vxe-emisora-frase" aria-live="polite">
            {emision.sonando && emision.frase ? emision.frase.texto : bloque?.texto ?? frase}
          </p>

          {bloques.length > 0 ? (
            <div className="vxe-emisora-rail" role="group" aria-label="Bloques del programa">
              {bloques.map((b, i) => (
                <button
                  key={b.id}
                  type="button"
                  className={
                    i === emision.bloqueActual
                      ? "vxe-emisora-tramo vxe-emisora-tramo--activo"
                      : "vxe-emisora-tramo"
                  }
                  style={{ flexGrow: Math.max(1, Math.round(msDe(b) / 1000)) }}
                  onClick={() => emision.empezar(i)}
                  aria-label={`Ir al bloque ${i + 1}: ${b.tipo}`}
                  title={`${b.tipo} · ${mmss(msDe(b))}`}
                />
              ))}
            </div>
          ) : null}

          <div className="vxe-emisora-controles">
            <button type="button" className="vxe-emisora-btn vxe-emisora-btn--play" onClick={alternar}>
              {emision.sonando ? "◼ Detener" : "▶ Escuchar aquí"}
            </button>
            <button
              type="button"
              className="vxe-emisora-btn"
              onClick={() => emision.saltar(-1)}
              disabled={emision.bloqueActual <= 0}
              aria-label="Bloque anterior"
            >
              ◀
            </button>
            <button
              type="button"
              className="vxe-emisora-btn"
              onClick={() => emision.saltar(1)}
              disabled={emision.bloqueActual < 0 || emision.bloqueActual >= bloques.length - 1}
              aria-label="Bloque siguiente"
            >
              ▶
            </button>
            <label className="vxe-emisora-min">
              <span className="vxe-emisora-oculto">Duración</span>
              <select
                value={minutos}
                onChange={(e) => {
                  const m = Number(e.target.value);
                  setMinutos(m);
                  emision.parar();
                  void pedir(m, "cambiar");
                }}
              >
                {MINUTOS.map((m) => (
                  <option key={m} value={m}>{m} min</option>
                ))}
              </select>
            </label>
            <a className="vxe-emisora-enlace" href="/radio">Estudio completo ↗</a>
          </div>

          {programa ? (
            <p className="vxe-emisora-pie">
              {programa.asuntos} asuntos · bloque {Math.max(0, emision.bloqueActual) + 1} de {bloques.length}
              {total ? ` · quedan ${mmss(Math.max(0, total - gastado))}` : ""}
            </p>
          ) : null}

          {error ? <p className="vxe-emisora-aviso">{error}</p> : null}
          {emision.sinVoz && aviso ? <p className="vxe-emisora-aviso">{aviso}</p> : null}
          {!programa && !cargando && !error ? (
            <p className="vxe-emisora-pie">Pulsa «Escuchar aquí» y la casa te lee el día sin salir de esta sala.</p>
          ) : null}
        </section>
      ) : null}

      {/* ── la píldora: siempre a mano, en toda la casa ── */}
      <div className="vxe-emisora-pill">
        <button
          type="button"
          className="vxe-emisora-lanzar"
          onClick={alternar}
          aria-label={emision.sonando ? "Detener la radio" : "Escuchar la radio de la casa"}
          title={emision.sonando ? "Detener" : "Escuchar el programa del día aquí mismo"}
        >
          <span className={emision.sonando ? "vxe-emisora-punto vxe-emisora-punto--on" : "vxe-emisora-punto"} aria-hidden />
          {emision.sonando ? "◼" : "▶"}
        </button>
        <button type="button" className="vxe-emisora-texto" onClick={() => setAbierta((a) => !a)}>
          <span className="vxe-emisora-sello">{emision.sonando ? "RADIO · EN EL AIRE" : "RADIO VANGUARD"}</span>
          <span className="vxe-emisora-linea">{emision.sonando && emision.frase ? emision.frase.texto : frase || "La voz de la casa"}</span>
        </button>
      </div>
    </div>
  );
}
