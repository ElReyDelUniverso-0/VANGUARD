"use client";
// v416.0 · LOS CONTROLES — indicador y año, sin recargar la página a mano
// Departamento 4 · VANGUARD WORLD DATA
// Cambiar de indicador o de año reescribe la URL (así el enlace se puede
// compartir y el servidor vuelve a pedir la serie). El estado no se guarda en el
// navegador: vive en la dirección.

import { useRouter } from "next/navigation";
import { CATEGORIAS, INDICADORES } from "@/lib/mundial/catalogo";

export function Controles({
  base,
  indicador,
  anio,
  anios,
  extra = {},
}: {
  base: string;
  indicador: string;
  anio: number | null;
  anios: number[];
  extra?: Record<string, string>;
}) {
  const router = useRouter();
  const ir = (nuevoInd: string, nuevoAnio: number | null) => {
    const p = new URLSearchParams({ ...extra, indicador: nuevoInd });
    if (nuevoAnio) p.set("anio", String(nuevoAnio));
    router.push(`${base}?${p.toString()}`);
  };
  return (
    <div className="vx-md-controles">
      <div className="vx-md-campo" style={{ minWidth: 320 }}>
        <label htmlFor="sel-indicador">Indicador ({INDICADORES.length} en el catálogo)</label>
        <select id="sel-indicador" value={indicador} onChange={(e) => ir(e.target.value, anio)}>
          {CATEGORIAS.map((c) => (
            <optgroup key={c.id} label={c.nombre}>
              {INDICADORES.filter((i) => i.categoria === c.id).map((i) => (
                <option key={i.id} value={i.id}>
                  {i.nombre}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
      <div className="vx-md-campo">
        <label htmlFor="sel-anio">Año</label>
        <select id="sel-anio" value={anio ? String(anio) : "reciente"} onChange={(e) => ir(indicador, e.target.value === "reciente" ? null : Number(e.target.value))}>
          <option value="reciente">Último dato de cada país</option>
          {anios.map((a) => (
            <option key={a} value={a}>
              {a} (mismo año para todos)
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
