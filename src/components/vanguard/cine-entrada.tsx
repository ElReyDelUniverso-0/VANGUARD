"use client";

// ============================================================
// v177.0 EL CINE DE LA CASA — la entrada GTA de noticias al ARRANQUE.
// Port del cine v174 (nació con la ceremonia del mundo 3D retirado;
// el Dueño ordenó «adiós al modo 3D» y el cine renace en la puerta 2D).
// Mandato original: «intros hermosas, diferentes, como las de GTA pero
// de noticias, personajes» — 6 placas a pantalla completa: foto real
// con duotono del acento de CADA conflicto, tipografía condensada en
// itálica (Rajdhani), ceja de agencia, dato duro, Ken Burns, barras de
// cine letterbox, progreso GTA y SALTAR siempre a la vista.
// Contrato de la casa: una vez por sesión (vg-cine-entrada-v177),
// reduced-motion no ve cine, solo transform/opacity (60 FPS móvil),
// tocar avanza, la consola vive detrás (nada se bloquea al saltar).
// ============================================================
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { sfx } from "@/lib/sound";

// el guard de montaje canónico (la regla set-state-in-effect prohíbe el
// setState en effect; lección v176 de la casa): false en servidor/hidratación,
// true en el cliente — sin mismatch, sin cascada
const sinSuscripcion = () => () => {};
const esCliente = () => true;
const esServidor = () => false;

const CLAVE_SESION = "vg-cine-entrada-v177";
const CINE_MS = 2150;

const CINE_PLACAS: { foto: string; ceja: string; titulo: string; tituloAcc: string; sub: string; dato: string; acento: string }[] = [
  { foto: "/assets/real/tanks-1.jpg", ceja: "VANGUARD · CONFLICTOS EN VIVO", titulo: "RUSIA —", tituloAcc: "UCRANIA", sub: "El frente que no duerme", dato: "1.100+ KM DE FRENTE · DÍA 1.350+", acento: "#e8c476" },
  { foto: "/assets/real/missile-1.jpg", ceja: "VANGUARD · ORIENTE MEDIO", titulo: "LA REGIÓN", tituloAcc: "EN LLAMAS", sub: "Tres teatros abiertos a la vez", dato: "GAZA · LÍBANO · MAR ROJO", acento: "#ff5a3c" },
  { foto: "/assets/real/carrier-1.jpg", ceja: "VANGUARD · GEOESTRATEGIA", titulo: "LA RUTA", tituloAcc: "DEL PETRÓLEO", sub: "El estrecho que sostiene al mundo", dato: "12% DEL COMERCIO MUNDIAL EN JUEGO", acento: "#4fc3f7" },
  { foto: "/imagenes-reales/kremlin.jpg", ceja: "VANGUARD · EL PODER", titulo: "QUIÉN MANDA", tituloAcc: "EN EL MUNDO", sub: "Líderes, alianzas y tratados rotos", dato: "EL DINERO DETRÁS DE CADA GUERRA", acento: "#b388ff" },
  { foto: "/assets/real/city-1.jpg", ceja: "VANGUARD · EL MUNDO", titulo: "NO DUERME.", tituloAcc: "REPORTA.", sub: "Hora a hora, con fuente y contexto", dato: "NOTICIAS EN VIVO · 24/7 · EN 3D", acento: "#00f0ff" },
  { foto: "/assets/real/jet-1.jpg", ceja: "VANGUARD · TU TURNO", titulo: "EL CENTRO", tituloAcc: "DE NOTICIAS", sub: "Del planeta, en primera persona", dato: "TOCA PARA DESPLEGAR LA CASA", acento: "#e8c476" },
];

export function CineEntrada() {
  const montado = useSyncExternalStore(sinSuscripcion, esCliente, esServidor);
  const [enPantalla, setEnPantalla] = useState(false);
  const [saliendo, setSaliendo] = useState(false);
  const [idx, setIdx] = useState(0);
  const finRef = useRef(false);

  useEffect(() => {
    if (!montado) return;
    // reduced-motion: el cine no es para todos los aparatos — entrar directo
    let reducido = false;
    try { reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch {}
    let visto = false;
    try { visto = sessionStorage.getItem(CLAVE_SESION) === "1"; } catch {}
    if (reducido || visto) return;
    // el arranque respira primero: la Casa pinta, la cortina se funde,
    // y ENTONCES se apagan las luces del cine (como en una sala oscura)
    const t = window.setTimeout(() => {
      setEnPantalla(true);
      try { sessionStorage.setItem(CLAVE_SESION, "1"); } catch {}
    }, 900);
    return () => window.clearTimeout(t);
  }, [montado]);

  const fin = useCallback(() => {
    if (finRef.current) return;
    finRef.current = true;
    setSaliendo(true);
    window.setTimeout(() => setEnPantalla(false), 480);
  }, []);

  const avanzar = useCallback(() => {
    setIdx((i) => {
      if (i >= CINE_PLACAS.length - 1) { fin(); return i; }
      return i + 1;
    });
  }, [fin]);

  // auto-avance — cada placa respira CINE_MS y pasa sola (GTA-style)
  useEffect(() => {
    if (!enPantalla || saliendo) return;
    const id = window.setTimeout(avanzar, CINE_MS);
    return () => window.clearTimeout(id);
  }, [enPantalla, saliendo, idx, avanzar]);

  const tocar = useCallback(() => {
    if (saliendo) return;
    try { sfx.click(); } catch {}
    avanzar();
  }, [avanzar, saliendo]);

  const saltar = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    try { sfx.click(); } catch {}
    fin();
  }, [fin]);

  if (!montado || !enPantalla) return null;
  const placa = CINE_PLACAS[Math.min(idx, CINE_PLACAS.length - 1)];

  // PORTAL AL BODY (lección v116 de la casa): dentro del árbol de la Casa el
  // z-96 heredaba un stacking context ajeno y los widgets flotantes (z 30-46)
  // pintaban ENCIMA del cine — el portal + z-300 (la banda de la familia GTA)
  // lo pone sobre toda la consola, bajo la cortina de arranque (2147483000)
  return createPortal(
    <div className={`vg174-cine${saliendo ? " vg174-saliendo" : ""}`} onClick={tocar} role="presentation">
      <div className="vg174-cine-card" key={idx} style={{ "--vg174acc": placa.acento } as React.CSSProperties}>
        <div className="vg174-cine-foto" style={{ backgroundImage: `url(${placa.foto})` }} aria-hidden />
        <div className="vg174-cine-lava" aria-hidden />
        <div className="vg174-cine-txt">
          <em>{placa.ceja}</em>
          <strong>
            {placa.titulo} <b>{placa.tituloAcc}</b>
          </strong>
          <span>{placa.sub}</span>
        </div>
        <i className="vg174-cine-dato" aria-hidden>{placa.dato}</i>
      </div>
      <div className="vg174-cine-barras" aria-hidden><i /><i /></div>
      <div className="vg174-cine-progreso" aria-hidden>
        {CINE_PLACAS.map((_, i) => (
          <i key={i} data-on={i <= idx ? "1" : "0"} />
        ))}
      </div>
      <button type="button" className="vg174-cine-saltar" onClick={saltar}>
        Saltar »
      </button>
    </div>,
    document.body,
  );
}
