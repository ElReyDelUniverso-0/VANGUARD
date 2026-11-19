"use client";
// v416.0 · LA TABLA QUE SE ORDENA — el ranking con su metodología al lado
// Departamento 4 · VANGUARD WORLD DATA
// Ordenable por cualquier columna, filtrable por región y por nombre. Cuando el
// ranking es «reciente» (cada país con su último dato), la columna de año queda
// visible: es la única forma honesta de enseñar una tabla con años mezclados.

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Indicador } from "@/lib/mundial/catalogo";
import { fmtValor, fmtAnio } from "@/lib/mundial/formato";

export interface Fila {
  iso: string;
  pais: string;
  region: string;
  renta: string;
  valor: number;
  anio: number;
}

type Clave = "pais" | "region" | "renta" | "valor" | "anio";

export function TablaRanking({
  filas,
  indicador,
  regiones,
  modo,
}: {
  filas: Fila[];
  indicador: Indicador;
  regiones: string[];
  modo: "fijo" | "reciente";
}) {
  const [orden, setOrden] = useState<Clave>("valor");
  const [asc, setAsc] = useState(indicador.sentido === "bajo");
  const [region, setRegion] = useState("todas");
  const [busca, setBusca] = useState("");

  const visibles = useMemo(() => {
    const f = filas.filter(
      (x) => (region === "todas" || x.region === region) && (busca.trim() === "" || x.pais.toLowerCase().includes(busca.trim().toLowerCase()))
    );
    const factor = asc ? 1 : -1;
    return [...f].sort((a, b) => {
      if (orden === "valor") return (a.valor - b.valor) * factor;
      if (orden === "anio") return (a.anio - b.anio) * factor;
      const va = orden === "pais" ? a.pais : orden === "region" ? a.region : a.renta;
      const vb = orden === "pais" ? b.pais : orden === "region" ? b.region : b.renta;
      return va.localeCompare(vb, "es") * factor;
    });
  }, [filas, orden, asc, region, busca]);

  const clic = (c: Clave) => {
    if (c === orden) setAsc(!asc);
    else {
      setOrden(c);
      setAsc(c === "valor" ? indicador.sentido === "bajo" : true);
    }
  };

  const flecha = (c: Clave) => (orden === c ? (asc ? " ▲" : " ▼") : "");

  return (
    <>
      <div className="vx-md-controles">
        <div className="vx-md-campo">
          <label htmlFor="filtro-region">Región</label>
          <select id="filtro-region" value={region} onChange={(e) => setRegion(e.target.value)}>
            <option value="todas">Todas ({filas.length})</option>
            {regiones.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div className="vx-md-campo">
          <label htmlFor="filtro-pais">Buscar país</label>
          <input id="filtro-pais" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="dominican…" />
        </div>
        <p className="vx-md-meta" style={{ marginLeft: "auto" }}>
          {visibles.length} países con dato · {modo === "reciente" ? "cada fila con su año" : "todas las filas del mismo año"}
        </p>
      </div>

      <div className="vx-md-tabla-caja">
        <table className="vx-md-tabla">
          <thead>
            <tr>
              <th onClick={() => clic("pais")}>País{flecha("pais")}</th>
              <th onClick={() => clic("region")}>Región{flecha("region")}</th>
              <th onClick={() => clic("renta")}>Nivel de renta{flecha("renta")}</th>
              <th className="num" onClick={() => clic("valor")}>
                {indicador.corto} ({indicador.unidad}){flecha("valor")}
              </th>
              <th className="num" onClick={() => clic("anio")}>
                Año{flecha("anio")}
              </th>
              <th className="num">Puesto</th>
            </tr>
          </thead>
          <tbody>
            {visibles.map((f, i) => (
              <tr key={f.iso}>
                <td>
                  <Link href={`/datos-mundiales/pais/${f.iso}`} className="vx-md-pais">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`https://flagcdn.com/w20/${f.iso}.png`} alt="" width={18} height={12} loading="lazy" />
                    {f.pais}
                  </Link>
                </td>
                <td className="vx-md-meta">{f.region}</td>
                <td className="vx-md-meta">{f.renta}</td>
                <td className="num">{fmtValor(f.valor, indicador)}</td>
                <td className="num vx-md-meta">{fmtAnio(f.anio)}</td>
                <td className="num vx-md-meta">{i + 1}</td>
              </tr>
            ))}
            {visibles.length === 0 ? (
              <tr>
                <td colSpan={6} className="vx-md-sin">
                  Ningún país de esa región publica este indicador en la fuente.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </>
  );
}
