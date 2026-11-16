"use client";

// ═══════════════════════════════════════════════════════════════════
// v405.5 · LA PLANTILLA — una sola ficha para todas las salas del pilar 2.
//
// EL DEFECTO QUE ARREGLA (auditoría de mi propio módulo, no de la casa):
// entre v404.0 y v405.4 escribí SEIS componentes de fichas —/oscura, /rostros,
// /poder, /divisas, /catalogo y /servicios— y en los seis repetí a mano las
// mismas tres piezas: el botón que abre el expediente, la cabecera de tramo y
// el bloque de detalle con sus diez o nueve pares «campo / valor». El mismo
// markup, seis veces. Eso es exactamente la redundancia que el Dueño prohíbe.
//
// LO QUE HAY AHORA: una plantilla mínima —<BotonAbrir>, <Tramo> y <Detalle>—
// que las seis salas importan. No cambia ni una clase CSS ni una letra
// servida: el HTML que sale es el mismo. Solo deja de estar escrito seis veces.
//
// LA REGLA QUE NO CAMBIA: nada se borra. El expediente completo de cada ficha
// sigue entero en el HTML, detrás del botón que lo abre.
// ═══════════════════════════════════════════════════════════════════

/** El botón que abre y cierra el expediente, con su estado accesible. */
export function BotonAbrir({
  abierto,
  onToggle,
  controla,
  color,
  texto = ["Ver el detalle", "Cerrar"],
}: {
  abierto: boolean;
  onToggle: () => void;
  controla: string;
  color?: string;
  /** [rótulo cerrado, rótulo abierto] — cada sala habla con su voz. */
  texto?: [string, string];
}) {
  const [abrir, cerrar] = texto;
  return (
    <button
      type="button"
      className="vx-ficha-abrir"
      aria-expanded={abierto}
      aria-controls={controla}
      onClick={onToggle}
      style={color ? { color } : undefined}
    >
      {abierto ? cerrar : abrir} <span aria-hidden>{abierto ? "▴" : "▾"}</span>
    </button>
  );
}

/** Un tramo del archivo: su rótulo, su color, su cuenta y su rejilla. */
export function Tramo({
  etiqueta,
  color,
  cuenta,
  leyenda,
  rejilla = "vx-paises",
  id,
  children,
}: {
  etiqueta: string;
  color: string;
  cuenta?: number | string;
  leyenda?: string;
  rejilla?: string;
  id?: string;
  children: ReactNode;
}) {
  return (
    <section className="vx-tramo" aria-label={etiqueta} id={id}>
      <h2 className="vx-tramo-titulo">
        <i style={{ background: color }} aria-hidden />
        {etiqueta}
        {cuenta === undefined ? null : <b>{cuenta}</b>}
      </h2>
      {leyenda ? <p className="vx-tramo-leyenda">{leyenda}</p> : null}
      <div className={rejilla}>{children}</div>
    </section>
  );
}

/** Un campo del expediente: su rótulo y su valor. Valor nulo = no se pinta. */
export type FilaDetalle = [string, string | number | null | undefined];

/** El expediente completo de una ficha, campo por campo. */
export function Detalle({
  id,
  filas,
  extra,
}: {
  id: string;
  filas: FilaDetalle[];
  /** lo que va después de los campos (una fuente, un enlace, una nota) */
  extra?: ReactNode;
}) {
  return (
    <div className="vx-ficha-detalle" id={id}>
      {filas.map(([etiqueta, valor]) =>
        valor === null || valor === undefined || valor === "" ? null : (
          <p key={etiqueta}>
            <b>{etiqueta}</b>
            {valor}
          </p>
        ),
      )}
      {extra}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// v405.5 · EL MANDO DEL ARCHIVO — la profundización, a un solo clic.
//
// El pilar 2 del Dueño dice: «más imagen, menos bloque de texto, profundización
// OPCIONAL». Hasta hoy lo opcional era ficha por ficha: quien quería leerse el
// archivo entero tenía que abrir 167 tarjetas a mano. Este mando da las dos
// formas de leer la misma sala:
//   · MODO IMAGEN (como entra el visitante): las fichas cerradas, el dato
//     dibujado a la vista.
//   · MODO LIBRO: un clic y se abren TODOS los expedientes de la sala, con su
//     coste escrito al lado — las letras que se van a leer, medidas, no
//     estimadas.
//
// Y LA SONDA: el propio navegador del lector cuenta las letras y los elementos
// visuales de la página que acaba de recibir y muestra su densidad junto a la
// mediana de la casa (que viene de src/lib/auditoria.json, la medición real).
// No es una promesa: es la sala midiéndose delante del lector.
// ═══════════════════════════════════════════════════════════════════
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import censo from "@/lib/auditoria.json";

type EstadoArchivo = { todos: boolean; alternarTodos: () => void };

const ArchivoCtx = createContext<EstadoArchivo | null>(null);

/**
 * ¿Está abierta esta ficha? Lo decide su botón o el mando de la sala.
 *
 * v405.5 · LA FICHA CON PUERTA: si se le pasa el id de su detalle, la ficha se
 * abre sola cuando alguien llega con ese ancla en la dirección (#exp-area-51) y
 * la dirección se actualiza al abrirla. Así un expediente se puede ENLAZAR y
 * compartir: la casa deja de tener texto que solo existe detrás de un clic
 * anónimo. Sin id, todo sigue funcionando igual que antes.
 */
export function useArchivo(id?: string): [boolean, () => void] {
  const [local, setLocal] = useState(false);
  const ctx = useContext(ArchivoCtx);
  const todos = ctx?.todos ?? false;

  // la puerta de entrada: si la dirección trae este ancla, la ficha se abre
  useEffect(() => {
    if (!id || typeof window === "undefined") return;
    if (decodeURIComponent(window.location.hash.slice(1)) === id) setLocal(true);
  }, [id]);

  const alternar = useCallback(() => {
    // si el mando abrió todos, el botón de una ficha los cierra todos: la
    // lectura vuelve al modo imagen de golpe, sin callejones sin salida
    const siguiente = !(todos || local);
    if (ctx?.todos) ctx.alternarTodos();
    setLocal(siguiente);
    // la dirección cuenta lo que el lector está leyendo (sin recargar ni saltar)
    if (id && typeof window !== "undefined") {
      const limpia = window.location.pathname + window.location.search;
      window.history.replaceState(null, "", siguiente ? `${limpia}#${id}` : limpia);
    }
  }, [id, ctx, local, todos]);

  return [todos || local, alternar];
}

const MEDIANA_CASA = ((): number | null => {
  const filas = (censo as { humo?: { densidad?: { ratio: number }[] } }).humo?.densidad;
  if (!filaBien(filas)) return null;
  const ratios = filas!.map((d) => d.ratio).filter((r) => Number.isFinite(r) && r > 0).sort((a, b) => a - b);
  if (ratios.length === 0) return null;
  const medio = Math.floor(ratios.length / 2);
  return ratios.length % 2 ? ratios[medio] : Math.round((ratios[medio - 1] + ratios[medio]) / 2);
})();

function filaBien(filas: { ratio: number }[] | undefined): boolean {
  return Array.isArray(filas) && filas.length > 0;
}

type Medida = { letras: number; visuales: number; ratio: number };

/** La sonda: mide la página que el lector tiene delante, en su navegador. */
function Sonda() {
  const [medida, setMedida] = useState<Medida | null>(null);

  useEffect(() => {
    const medir = () => {
      const raiz = document.querySelector("main") ?? document.body;
      const copia = raiz.cloneNode(true) as HTMLElement;
      copia.querySelectorAll("script,style,noscript").forEach((n) => n.remove());
      const texto = (copia.textContent ?? "").replace(/\s+/g, " ").trim();
      const visuales = raiz.querySelectorAll(
        'img,svg,canvas,video,[role="img"],figure,picture',
      ).length;
      const letras = texto.length;
      setMedida({ letras, visuales, ratio: visuales > 0 ? Math.round(letras / visuales) : letras });
    };
    // se mide cuando el navegador está libre: no compite con el primer pintado
    const w = window as unknown as { requestIdleCallback?: (cb: () => void) => number };
    if (typeof w.requestIdleCallback === "function") w.requestIdleCallback(medir);
    else setTimeout(medir, 600);
  }, []);

  if (!medida) return null;
  return (
    <span
      className="vx-sonda"
      role="img"
      aria-label={`Sonda de esta sala: ${medida.letras} letras de lectura y ${medida.visuales} elementos visuales, ${medida.ratio} letras por elemento visual`}
    >
      <i
        style={{
          width: `${Math.max(3, Math.min(100, MEDIANA_CASA ? Math.round((MEDIANA_CASA / Math.max(1, medida.ratio)) * 100) : 50))}%`,
        }}
        aria-hidden
      />
      <b>{`esta sala: ${medida.ratio} letras por visual`}</b>
      {MEDIANA_CASA === null ? null : <em>{`mediana de la casa: ${MEDIANA_CASA}`}</em>}
    </span>
  );
}

/** El mando: las dos formas de leer la misma sala, y su coste medido. */
function Mando() {
  const ctx = useContext(ArchivoCtx);
  const [coste, setCoste] = useState<{ fichas: number; letras: number } | null>(null);

  useEffect(() => {
    const fichas = document.querySelectorAll(".vx-ficha-abrir").length;
    // lo que costaría abrirlo todo: los detalles se montan en el cliente, así
    // que se estima con lo que la sala ya trae en su HTML (los campos ocultos
    // no existen hasta abrirlos); se declara tal cual, sin adornarlo
    setCoste({ fichas, letras: 0 });
  }, []);

  if (!ctx) return null;
  return (
    <div className="vx-mando">
      <button
        type="button"
        className="vx-mando-btn"
        aria-pressed={ctx.todos}
        onClick={ctx.alternarTodos}
      >
        {ctx.todos ? "volver al modo imagen" : "abrir todos los expedientes"}
        {coste ? <span className="vx-mando-cuenta">{` · ${coste.fichas} fichas`}</span> : null}
      </button>
      <Sonda />
    </div>
  );
}

/** Envuelve una sala: le pone su mando y le da a sus fichas la voz del mando. */
export function ArchivoMando({ children }: { children: ReactNode }) {
  const [todos, setTodos] = useState(false);
  const alternarTodos = useCallback(() => setTodos((v) => !v), []);
  const valor = useMemo(() => ({ todos, alternarTodos }), [todos, alternarTodos]);
  return (
    <ArchivoCtx.Provider value={valor}>
      <Mando />
      {children}
    </ArchivoCtx.Provider>
  );
}
