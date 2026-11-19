// v416.0 · BARRAS COMPARATIVAS — dos a cuatro países, un indicador, un año cada uno
// Departamento 4 · VANGUARD WORLD DATA
// La barra es proporcional al valor; el año va escrito en la fila para que nadie
// compare 2024 con 2019 sin verlo. Si un país no tiene dato, no hay barra: se dice.

import type { Indicador } from "@/lib/mundial/catalogo";
import { fmtValor, SIN_DATO } from "@/lib/mundial/formato";

export interface Barra {
  iso: string;
  nombre: string;
  valor: number | null;
  anio: number | null;
  color: string;
}

export function GraficoBarras({ barras, indicador }: { barras: Barra[]; indicador: Indicador }) {
  const conDato = barras.filter((b) => b.valor !== null && Number.isFinite(b.valor));
  if (conDato.length === 0) return <p className="vx-md-sin">Ninguno de los países elegidos publica este indicador.</p>;
  const max = Math.max(...conDato.map((b) => Math.abs(b.valor as number))) || 1;
  return (
    <div className="vx-md-barras">
      {barras.map((b) => {
        const pct = b.valor === null ? 0 : Math.max(1.5, (Math.abs(b.valor) / max) * 100);
        return (
          <div className="vx-md-barra-fila" key={b.iso}>
            <span>
              {b.nombre} <span className="vx-md-meta">{b.anio ? `(${b.anio})` : ""}</span>
            </span>
            <span className="vx-md-barra-pista">
              <span className="vx-md-barra-relleno" style={{ width: `${pct}%`, background: b.color }} />
            </span>
            <b>{b.valor === null ? SIN_DATO : fmtValor(b.valor, indicador)}</b>
          </div>
        );
      })}
    </div>
  );
}
