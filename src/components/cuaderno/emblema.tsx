"use client";
// ═══════════════════════════════════════════════════════════════════
// v431.6 EL CUADERNO · EL EMBLEMA (el logo se edita de verdad)
//
// El Dueño pidió «pueda editar el logo». Aquí está: cinco formas, doce
// iconos dibujados con trazos propios (sin fuentes ni imágenes externas),
// un monograma de hasta tres signos, dos tintas y un lema. El sello se ve
// mientras se cambia —no hay que guardar para verlo— y se puede descargar
// como SVG para usarlo fuera (una camiseta, un PDF, un membrete).
//
// El SVG lo construye el MODELO (emblemaSVG), no este componente: así la
// misma pieza sirve para pintar, para descargar y para las pruebas.
// ═══════════════════════════════════════════════════════════════════

import { useMemo } from "react";
import {
  FORMAS,
  ICONOS,
  TIPO_INFO,
  emblemaSVG,
  limpiarEmblema,
  type Emblema as TEmblema,
  type Forma,
  type Icono,
} from "@/lib/cuaderno/modelo";
import { TINTAS, TINTA_HEX, type Tinta } from "@/lib/cuaderno/pieles";

const NOMBRE_FORMA: Record<Forma, string> = {
  escudo: "Escudo",
  circulo: "Círculo",
  rombo: "Rombo",
  hexagono: "Hexágono",
  sello: "Sello",
};

const NOMBRE_ICONO: Record<Icono, string> = {
  ojo: "Ojo",
  estrella: "Estrella",
  brujula: "Brújula",
  libro: "Libro",
  rayo: "Rayo",
  globo: "Globo",
  ancla: "Ancla",
  pluma: "Pluma",
  llama: "Llama",
  diana: "Diana",
  corona: "Corona",
  onda: "Onda",
};

const NOMBRE_TINTA: Record<Tinta, string> = {
  ambar: "Ámbar",
  cian: "Cian",
  verde: "Verde",
  rojo: "Rojo",
  violeta: "Violeta",
  grafito: "Grafito",
};

export function EditorEmblema({
  emblema,
  onCambio,
  onCerrar,
}: {
  emblema: TEmblema;
  onCambio: (cambios: Partial<TEmblema>) => void;
  onCerrar: () => void;
}) {
  const svg = useMemo(() => emblemaSVG(limpiarEmblema(emblema), 132), [emblema]);

  const descargar = () => {
    try {
      const blob = new Blob([emblemaSVG(emblema, 512)], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cuaderno-emblema-${emblema.monograma || "vg"}.svg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } catch {
      /* si el aparato no deja descargar, el sello sigue en pantalla */
    }
  };

  const copiarSVG = async () => {
    try {
      await navigator.clipboard.writeText(emblemaSVG(emblema, 512));
    } catch {
      /* sin portapapeles: se queda en la descarga */
    }
  };

  return (
    <section className="cu-emb" aria-label="Editor del emblema del cuaderno">
      <header className="cu-emb-cab">
        <h3>Tu emblema</h3>
        <button type="button" className="cu-x" onClick={onCerrar} aria-label="Cerrar el editor del emblema">
          ✕
        </button>
      </header>

      <div className="cu-emb-vista">
        <div className="cu-emb-sello" dangerouslySetInnerHTML={{ __html: svg }} aria-hidden />
        <p className="cu-emb-lema">{emblema.lema}</p>
        <p className="cu-emb-nota">
          {NOMBRE_FORMA[emblema.forma]} · {NOMBRE_ICONO[emblema.icono]} · {emblema.monograma}
        </p>
      </div>

      <fieldset className="cu-emb-grupo">
        <legend>Forma</legend>
        <div className="cu-chips">
          {FORMAS.map((f) => (
            <button
              key={f}
              type="button"
              className={emblema.forma === f ? "cu-chip cu-chip--on" : "cu-chip"}
              onClick={() => onCambio({ forma: f })}
              aria-pressed={emblema.forma === f}
            >
              {NOMBRE_FORMA[f]}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="cu-emb-grupo">
        <legend>Icono</legend>
        <div className="cu-iconos">
          {ICONOS.map((ic) => (
            <button
              key={ic}
              type="button"
              className={emblema.icono === ic ? "cu-icono cu-icono--on" : "cu-icono"}
              onClick={() => onCambio({ icono: ic })}
              aria-pressed={emblema.icono === ic}
              title={NOMBRE_ICONO[ic]}
            >
              <span aria-hidden>{SIMBOLO_ICONO[ic]}</span>
              <em>{NOMBRE_ICONO[ic]}</em>
            </button>
          ))}
        </div>
      </fieldset>

      <div className="cu-emb-fila">
        <label className="cu-campo">
          <span>Monograma</span>
          <input
            value={emblema.monograma}
            maxLength={3}
            onChange={(e) => onCambio({ monograma: e.target.value.toUpperCase() })}
            aria-label="Monograma del emblema"
          />
        </label>
        <label className="cu-campo">
          <span>Lema</span>
          <input
            value={emblema.lema}
            maxLength={72}
            onChange={(e) => onCambio({ lema: e.target.value })}
            aria-label="Lema del cuaderno"
          />
        </label>
      </div>

      <div className="cu-emb-fila">
        <label className="cu-campo">
          <span>Icono de tinta</span>
          <select value={emblema.tinta} onChange={(e) => onCambio({ tinta: e.target.value as Tinta })}>
            {TINTAS.map((t) => (
              <option key={t} value={t}>{NOMBRE_TINTA[t]}</option>
            ))}
          </select>
        </label>
        <label className="cu-campo">
          <span>Metal del aro</span>
          <select value={emblema.metal} onChange={(e) => onCambio({ metal: e.target.value as Tinta })}>
            {TINTAS.map((t) => (
              <option key={t} value={t}>{NOMBRE_TINTA[t]}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="cu-emb-acciones">
        <button type="button" className="cu-btn cu-btn--oro" onClick={descargar}>
          Descargar SVG
        </button>
        <button type="button" className="cu-btn" onClick={copiarSVG}>
          Copiar SVG
        </button>
        </div>

      <p className="cu-emb-pie">
        El sello vive en tu aparato, como el resto del cuaderno. Se puede descargar en SVG (512 px) y
        usarlo donde quieras: no lleva imágenes externas ni fuentes de terceros.
      </p>

      <style>{`
        .cu-emb { display: grid; gap: 14px; }
        .cu-emb-cab { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
        .cu-emb-cab h3 { margin: 0; font: 700 13px/1 var(--cu-letra-titulo); letter-spacing: .14em; text-transform: uppercase; color: var(--cu-acento); }
        .cu-emb-vista { display: grid; place-items: center; gap: 8px; padding: 14px; border: 1px solid var(--cu-linea); border-radius: var(--cu-radio); background: var(--cu-fondo-suave); }
        .cu-emb-sello svg { display: block; }
        .cu-emb-lema { margin: 0; font: italic 500 12.5px/1.4 var(--cu-letra); color: var(--cu-tinta-tenue); text-align: center; }
        .cu-emb-nota { margin: 0; font: 600 9.5px/1 ui-monospace, monospace; letter-spacing: .16em; text-transform: uppercase; color: var(--cu-acento); opacity: .8; }
        .cu-emb-grupo { margin: 0; padding: 0; border: 0; display: grid; gap: 8px; }
        .cu-emb-grupo legend { padding: 0; font: 700 9.5px/1 ui-monospace, monospace; letter-spacing: .18em; text-transform: uppercase; color: var(--cu-tinta-tenue); margin-bottom: 6px; }
        .cu-chips { display: flex; flex-wrap: wrap; gap: 6px; }
        .cu-chip { appearance: none; cursor: pointer; border: 1px solid var(--cu-linea); background: transparent; color: var(--cu-tinta); font: 600 11px/1 var(--cu-letra); padding: 7px 10px; border-radius: 999px; }
        .cu-chip--on { background: var(--cu-acento); color: #0b0d12; border-color: transparent; }
        .cu-iconos { display: grid; grid-template-columns: repeat(auto-fill, minmax(58px, 1fr)); gap: 6px; }
        .cu-icono { appearance: none; cursor: pointer; display: grid; justify-items: center; gap: 2px; padding: 8px 4px; border: 1px solid var(--cu-linea); border-radius: 8px; background: transparent; color: var(--cu-tinta); }
        .cu-icono span { font-size: 16px; line-height: 1; }
        .cu-icono em { font: 500 8px/1 var(--cu-letra); font-style: normal; opacity: .7; }
        .cu-icono--on { border-color: var(--cu-acento); background: var(--cu-acento-suave); color: var(--cu-acento); }
        .cu-emb-fila { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .cu-campo { display: grid; gap: 5px; }
        .cu-campo > span { font: 700 9px/1 ui-monospace, monospace; letter-spacing: .16em; text-transform: uppercase; color: var(--cu-tinta-tenue); }
        .cu-campo input, .cu-campo select { appearance: none; width: 100%; padding: 9px 10px; border: 1px solid var(--cu-linea); border-radius: 6px; background: var(--cu-papel); color: var(--cu-tinta); font: 500 12.5px/1.3 var(--cu-letra); }
        .cu-campo input:focus-visible, .cu-campo select:focus-visible { outline: 2px solid var(--cu-acento); outline-offset: 1px; }
        .cu-emb-acciones { display: flex; flex-wrap: wrap; gap: 8px; }
        .cu-emb-pie { margin: 0; font: 400 11.5px/1.5 var(--cu-letra); color: var(--cu-tinta-tenue); }
        .cu-x { appearance: none; cursor: pointer; border: 1px solid var(--cu-linea); background: transparent; color: var(--cu-tinta); width: 26px; height: 26px; border-radius: 50%; }
        .cu-oculto { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
        @media (max-width: 620px) { .cu-emb-fila { grid-template-columns: 1fr; } }
      `}</style>
    </section>
  );
}

/** Un signo por icono para el selector (sin depender de fuentes de iconos). */
const SIMBOLO_ICONO: Record<Icono, string> = {
  ojo: "◉",
  estrella: "★",
  brujula: "✦",
  libro: "▤",
  rayo: "ϟ",
  globo: "◍",
  ancla: "⚓",
  pluma: "✒",
  llama: "♨",
  diana: "◎",
  corona: "♛",
  onda: "≈",
};

/** El sello en pequeño, para la cabecera del cuaderno y para la sala. */
export function SelloCuaderno({ emblema, tam = 40 }: { emblema: TEmblema; tam?: number }) {
  const svg = useMemo(() => emblemaSVG(emblema, tam), [emblema, tam]);
  return <span className="cu-sello" dangerouslySetInnerHTML={{ __html: svg }} aria-hidden />;
}

export const NOMBRES_EMBLEMA = { NOMBRE_FORMA, NOMBRE_ICONO, NOMBRE_TINTA, TIPO_INFO, TINTA_HEX };
