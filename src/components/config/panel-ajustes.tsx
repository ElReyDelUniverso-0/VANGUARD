"use client";

// ═══════════════════════════════════════════════════════════════════
// v435.0 · EL PANEL DE AJUSTES — la cara del sistema de configuración
//
// Tres piezas:
//   · <BotonAjustes />  — el engranaje que va en la cabecera.
//   · <PanelAjustes />  — la hoja que entra por la derecha, montada una vez en
//                         el layout y abierta por evento (Esc la cierra).
//   · <ControlesAjustes /> — los mismos controles, para la página /config.
//
// Todo se aplica al instante (atributos en <html>) y se guarda en el aparato.
// ═══════════════════════════════════════════════════════════════════
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ABRIR,
  POR_DEFECTO,
  type Ajustes,
  abrirAjustes,
  aplicar,
  guardar,
  leer,
  pantallaActual,
  pareceLigero,
} from "@/lib/config/ajustes";

type Opcion<K extends string> = { v: K; t: string; n?: string };

function Grupo<K extends string>({
  titulo,
  opciones,
  valor,
  onElegir,
}: {
  titulo: string;
  opciones: Opcion<K>[];
  valor: K;
  onElegir: (v: K) => void;
}) {
  return (
    <div className="op-ajustes-grupo">
      <p>{titulo}</p>
      <div className="op-ajustes-opciones">
        {opciones.map((o) => (
          <button key={o.v} type="button" data-on={o.v === valor ? "1" : "0"} onClick={() => onElegir(o.v)} title={o.n}>
            {o.t}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ControlesAjustes({ a, set }: { a: Ajustes; set: <K extends keyof Ajustes>(k: K, v: Ajustes[K]) => void }) {
  const ahora = pantallaActual(a);
  const ligeroSiendo = a.ligero === "si" || (a.ligero === "auto" && pareceLigero());
  return (
    <>
      <Grupo
        titulo={`Pantalla · ahora se ve la de ${ahora}`}
        valor={a.pantalla}
        onElegir={(v) => set("pantalla", v)}
        opciones={[
          { v: "auto", t: "Automática", n: "La casa elige según el aparato" },
          { v: "grande", t: "Grande", n: "Maqueta de escritorio, también en un móvil" },
          { v: "pequena", t: "Pequeña", n: "Maqueta de móvil, también en un monitor" },
        ]}
      />
      <Grupo
        titulo={`Rendimiento · modo ligero ${ligeroSiendo ? "encendido" : "apagado"}`}
        valor={a.ligero}
        onElegir={(v) => set("ligero", v)}
        opciones={[
          { v: "auto", t: "Automático", n: "Se enciende solo en aparatos justos" },
          { v: "si", t: "Ligero", n: "Sin animaciones ni desenfoques: lo más rápido" },
          { v: "no", t: "Completo", n: "Todo el movimiento, al máximo" },
        ]}
      />
      <Grupo
        titulo="Animaciones"
        valor={a.anim}
        onElegir={(v) => set("anim", v)}
        opciones={[
          { v: "completas", t: "Completas" },
          { v: "reducidas", t: "Reducidas" },
          { v: "desactivadas", t: "Ninguna" },
        ]}
      />
      <Grupo
        titulo="Densidad"
        valor={a.densidad}
        onElegir={(v) => set("densidad", v)}
        opciones={[
          { v: "comoda", t: "Cómoda" },
          { v: "compacta", t: "Compacta", n: "Más información por pantalla" },
        ]}
      />
      <Grupo
        titulo="Tamaño de letra"
        valor={a.letra}
        onElegir={(v) => set("letra", v)}
        opciones={[
          { v: "normal", t: "Normal" },
          { v: "grande", t: "Grande" },
        ]}
      />
      <Grupo
        titulo="Fondo"
        valor={a.fondo}
        onElegir={(v) => set("fondo", v)}
        opciones={[
          { v: "placas", t: "Placas de sector", n: "Retícula, mira y viñeta" },
          { v: "llano", t: "Llano", n: "Negro limpio, sin capas de fondo" },
        ]}
      />
    </>
  );
}

export function useAjustes() {
  const [a, setA] = useState<Ajustes>(POR_DEFECTO);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    const guardados = leer();
    setA(guardados);
    aplicar(guardados);
    setListo(true);
  }, []);

  // si el aparato cambia de tamaño y la pantalla está en automático, el modo
  // ligero se recalcula solo (no se guarda: es del aparato, no del gusto)
  useEffect(() => {
    const alCambiar = () => {
      if (a.ligero === "auto") aplicar(a);
    };
    window.addEventListener("resize", alCambiar);
    return () => window.removeEventListener("resize", alCambiar);
  }, [a]);

  const set = <K extends keyof Ajustes>(k: K, v: Ajustes[K]) => {
    const nuevo = { ...a, [k]: v };
    setA(nuevo);
    guardar(nuevo);
    aplicar(nuevo);
  };

  const restablecer = () => {
    setA(POR_DEFECTO);
    guardar(POR_BORRAR());
    aplicar(POR_DEFECTO);
  };

  return { a, set, restablecer, listo };
}

function POR_BORRAR() {
  return POR_DEFECTO;
}

export function BotonAjustes() {
  return (
    <button type="button" className="op-ajustes-boton" onClick={abrirAjustes} aria-label="Ajustes de Vanguard" title="Ajustes (pantalla, rendimiento, letra, fondo)">
      <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="12" cy="12" r="3.2" />
        <path d="M12 2.6v2.6M12 18.8v2.6M2.6 12h2.6M18.8 12h2.6M5.3 5.3l1.9 1.9M16.8 16.8l1.9 1.9M18.7 5.3l-1.9 1.9M7.2 16.8l-1.9 1.9" strokeLinecap="round" />
      </svg>
    </button>
  );
}

export function PanelAjustes() {
  const { a, set, restablecer, listo } = useAjustes();
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    const abrir = () => setAbierto((v) => !v);
    window.addEventListener(ABRIR, abrir);
    return () => window.removeEventListener(ABRIR, abrir);
  }, []);

  useEffect(() => {
    if (!abierto) return;
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbierto(false);
    };
    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  }, [abierto]);

  if (!abierto || !listo) return null;

  return (
    <>
      <div className="op-ajustes-velo" onClick={() => setAbierto(false)} aria-hidden="true" />
      <aside className="op-ajustes" role="dialog" aria-modal="true" aria-label="Ajustes de Vanguard">
        <div className="op-ajustes-cab">
          <b>Ajustes de la casa</b>
          <button type="button" onClick={() => setAbierto(false)} aria-label="Cerrar ajustes">
            Cerrar ✕
          </button>
        </div>

        <ControlesAjustes a={a} set={set} />

        <div className="op-ajustes-pie">
          Se guarda solo en este aparato. Nada viaja a un servidor: Vanguard no sabe quién eres.
          <br />
          <button type="button" onClick={restablecer}>
            Restablecer
          </button>
          <br />
          <Link href="/config" onClick={() => setAbierto(false)} style={{ color: "#dfe7ea", display: "inline-block", marginTop: 10 }}>
            Abrir esta página de ajustes →
          </Link>
        </div>
      </aside>
    </>
  );
}
