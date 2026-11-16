"use client";

// ═══════════════════════════════════════════════════════════════════
// v405.4 · LAS TRES SALAS QUE FALTABAN — fichas, tarjetas y el detalle a un toque.
//
// EL NÚMERO QUE MANDA (auditoría en vivo, v405.2):
//   /catalogo      2.090 letras por elemento visual (22.985 letras en 11)
//   /divisas       1.997 (17.969 en 8)
//   /servicios     1.915 (59.363 en 31)  ← la que más letras tiene de la casa
//
// EL PATRÓN (el mismo de /oscura v404.0 y /rostros·/poder v405.2): la pieza
// visual primero, el expediente completo a un toque, y NADA borrado — cada
// campo sigue en el HTML servido, solo que detrás de un botón.
//
// Todo se deriva de sus fuentes: world-data (moneda y tasa reales por país),
// catalogo-real (las piezas ya construidas) y agencias-data /
// agencias-mundo-data (los expedientes de inteligencia). Cero cifras a mano.
// ═══════════════════════════════════════════════════════════════════
import { useState } from "react";

/** El botón de abrir/cerrar, con su estado de accesibilidad. */
export function BotonAbrir({
  abierto,
  onToggle,
  controla,
  color,
  texto,
}: {
  abierto: boolean;
  onToggle: () => void;
  controla: string;
  color?: string;
  texto?: [string, string];
}) {
  const [abrir, cerrar] = texto ?? ["Ver el detalle", "Cerrar"];
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

// ── DIVISAS ────────────────────────────────────────────────────────────
// La barra mide la tasa en ESCALA LOGARÍTMICA (las monedas fuertes valen menos
// de 1 por dólar y otras miles: una escala lineal dejaría 240 países en cero).
// Va con su descripción, no es adorno: es «cuántas unidades de esta moneda
// cuesta un dólar», comparado con el extremo de la serie.
import { WORLD_CURRENCIES_FULL, type WorldCountry } from "@/lib/world-data";

function fmtTasa(v: number): string {
  if (v >= 1000) return v.toLocaleString("es-ES", { maximumFractionDigits: 0 });
  if (v >= 1) return v.toLocaleString("es-ES", { maximumFractionDigits: 2 });
  return v.toLocaleString("es-ES", { maximumFractionDigits: 4 });
}

const TASAS = WORLD_CURRENCIES_FULL.map((c) => c.rate).filter((r) => r > 0);
const MAX_LOG = Math.log10(Math.max(...TASAS) + 1);
const MIN_LOG = Math.log10(Math.min(...TASAS));

function TarjetaDivisa({ c }: { c: WorldCountry }) {
  const [abierto, setAbierto] = useState(false);
  const id = `div-${c.code}`;
  const pos = (Math.log10(c.rate) - MIN_LOG) / (MAX_LOG - MIN_LOG);
  const ancho = Math.max(3, Math.round(pos * 100));

  return (
    <article className={`vx-pais${abierto ? " vx-pais-abierto" : ""}`}>
      <div className="vx-pais-cab">
        <span className="vx-pais-puesto">{c.code.toUpperCase()}</span>
        <h3>{c.name}</h3>
        <span className="vx-pais-gasto">{`${c.curCode} ${c.symbol}`}</span>
      </div>
      <div
        className="vx-peso"
        role="img"
        aria-label={`${c.name}: 1 dólar = ${fmtTasa(c.rate)} ${c.curCode} (${c.curName})`}
      >
        <i style={{ width: `${ancho}%`, background: "#5eead4" }} />
        <b>{fmtTasa(c.rate)}</b>
      </div>
      <BotonAbrir
        abierto={abierto}
        onToggle={() => setAbierto((v) => !v)}
        controla={id}
        color="#5eead4"
        texto={["Ver la moneda", "Cerrar"]}
      />
      {abierto && (
        <div className="vx-ficha-detalle" id={id}>
          <p>
            <b>moneda oficial</b>
            {`${c.curName} (${c.curCode}) · símbolo ${c.symbol}`}
          </p>
          <p>
            <b>tasa de la captura</b>
            {`${fmtTasa(c.rate)} ${c.curCode} por 1 dólar estadounidense`}
          </p>
          <p>
            <b>región</b>
            {c.region}
          </p>
        </div>
      )}
    </article>
  );
}

export function ArchivoDivisas() {
  const regiones: string[] = [];
  for (const c of WORLD_CURRENCIES_FULL) if (!regiones.includes(c.region)) regiones.push(c.region);
  return (
    <div className="vx-archivo-oscuro">
      {regiones.map((reg) => {
        const filas = WORLD_CURRENCIES_FULL.filter((c) => c.region === reg);
        return (
          <section key={reg} className="vx-tramo" aria-label={reg}>
            <h2 className="vx-tramo-titulo">
              <i style={{ background: "#5eead4" }} aria-hidden />
              {reg}
              <b>{filas.length}</b>
            </h2>
            <div className="vx-paises">
              {filas.map((c) => (
                <TarjetaDivisa key={c.code} c={c} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
