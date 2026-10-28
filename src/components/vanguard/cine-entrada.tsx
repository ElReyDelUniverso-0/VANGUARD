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
// Contrato de la casa: UNA VEZ AL DÍA (v178: la clave lleva la fecha — una
// sesión de PWA móvil dura semanas y el cine se volvió invisible; así el
// Dueño ve SU intro GTA cada día que abre Vanguard, sin repetir el mismo día),
// reduced-motion no ve cine, solo transform/opacity (60 FPS móvil),
// tocar avanza, la consola vive detrás (nada se bloquea al saltar).
//
// v187.0 EL CINE HONESTO — el Dueño soltó la pieza que faltaba: «le dije a
// la IA original que al principio haga una cinemática tipo GTA cuando esté
// cargando — desde ese día no ha vuelto a cargar bien vanguard». El cine
// arranca 900ms DESPUÉS de que la casa despierta: el Dueño ve su consola un
// segundo, el cine la tapa entera (placas oscuras + barras de progreso +
// 1.3MB de fotos que en su señal llegan negras) y PARECE otra pantalla de
// carga eterna. El cine no era la carga — pero nadie podía distinguirlo.
// Curas: cartel permanente «LA CASA YA ESTÁ DESPIERTA» + SALTAR GIGANTE en
// la barra letterbox (pulgar) + placas de 1.5s (9s totales) + el cine SE
// CALLA si esta sesión ya sufrió (socorro/vigía/bote) o la casa tardó >12s
// en despertar — nadie que esperó un rescate quiere una pantalla más que
// se pueda confundir con carga.
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

// v178: clave DIARIA — el cine renace cada día nuevo (la sesión de PWA
// móvil es semanal y una vez por sesión eterna = «no hay intro como gta»);
// fecha LOCAL del aparato (en-CA = YYYY-MM-DD), el día del Dueño manda
const CLAVE_SESION = `vg-cine-entrada-v178-${new Date().toLocaleDateString("en-CA")}`;
// v187: placas de 1.5s — 6 placas ≈ 9s totales (antes 2.15s ≈ 13s):
// el cine ya no compite con la paciencia del Dueño ni se disfraza de carga
const CINE_MS = 1500;

// v187.0 EL CINE SE CALLA SI HUBO SUFRIMIENTO — dos preguntas con respuesta
// honesta: ¿esta sesión ya pasó por un rescate? ¿la casa tardó demasiado en
// despertar? Si cualquiera es sí, el cine NO juega hoy: la casa se abre
// directa. Ventana de 10 min para las marcas (vg187-sufrio lo estampa el
// socorrista y el vigía; vg186-n/vg186-t es el contador del bote v186;
// vg155-recarga es el sello de arranque de ESTA carga — su diferencia con
// ahora es el tiempo real que costó llegar a la hidratación).
function sesionSufrio(): boolean {
  try {
    const t = Number(sessionStorage.getItem("vg187-sufrio") || 0);
    if (t && Date.now() - t < 600000) return true;
    const n = Number(sessionStorage.getItem("vg186-n") || 0);
    const tt = Number(sessionStorage.getItem("vg186-t") || 0);
    if (n >= 1 && tt && Date.now() - tt < 600000) return true;
  } catch {}
  return false;
}
function arranqueLento(): boolean {
  try {
    const t0 = Number(sessionStorage.getItem("vg155-recarga") || 0);
    if (t0 && Date.now() - t0 > 12000) return true;
  } catch {}
  return false;
}

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
    // v187.0: sesión sufrida o arranque lento → cine fuera hoy. La casa
    // despierta y BASTA: cero pantallas que se puedan confundir con carga.
    if (sesionSufrio() || arranqueLento()) return;
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
      {/* v187.0 EL CARTEL HONESTO — arriba a la izquierda, permanente:
          nadie volverá a confundir el cine con una pantalla de carga */}
      <div className="vg174-cine-carte" aria-hidden>
        <em>EL CINE DE ENTRADA · {idx + 1} DE {CINE_PLACAS.length}</em>
        <b>LA CASA YA ESTÁ DESPIERTA</b>
      </div>
      <div className="vg174-cine-progreso" aria-hidden>
        {CINE_PLACAS.map((_, i) => (
          <i key={i} data-on={i <= idx ? "1" : "0"} />
        ))}
      </div>
      {/* v187.0 EL SALTO GIGANTE — vive DENTRO de la barra letterbox inferior
          (9vh negros casi vacíos): zona del pulgar, imposible de no ver.
          Sustituye a la píldora «Saltar »» escondida arriba a la derecha. */}
      <button type="button" className="vg174-cine-fuera" onClick={saltar}>
        Saltar el cine »»
      </button>
    </div>,
    document.body,
  );
}
