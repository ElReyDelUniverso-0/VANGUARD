"use client";
// v416.0 · EL SELECTOR DEL COMPARADOR — de dos a cuatro países, hasta seis indicadores
// Departamento 4 · VANGUARD WORLD DATA
// Cada cambio reescribe la URL (?paises=do,ht&indicadores=poblacion,pib_pc): el
// servidor vuelve a pedir las series y el enlace queda compartible.

import { useRouter } from "next/navigation";
import { CATEGORIAS, INDICADORES } from "@/lib/mundial/catalogo";

export interface PaisOpcion {
  iso2: string;
  nombre: string;
}

export function SelectorComparador({
  paises,
  elegidos,
  indicadores,
  elegidosInd,
}: {
  paises: PaisOpcion[];
  elegidos: string[];
  indicadores: string[];
  elegidosInd: string[];
}) {
  const router = useRouter();
  const ir = (nuevosPaises: string[], nuevosInd: string[]) => {
    const p = new URLSearchParams({
      paises: nuevosPaises.join(","),
      indicadores: nuevosInd.join(","),
    });
    router.push(`/datos-mundiales/comparar?${p.toString()}`);
  };

  const cambiarPais = (i: number, iso: string) => {
    const copia = [...elegidos];
    if (iso === "") copia.splice(i, 1);
    else copia[i] = iso;
    ir(copia.filter(Boolean), elegidosInd);
  };

  const alternarInd = (id: string) => {
    const dentro = elegidosInd.includes(id);
    const nuevos = dentro ? elegidosInd.filter((x) => x !== id) : [...elegidosInd, id].slice(0, 6);
    if (nuevos.length === 0) return;
    ir(elegidos, nuevos);
  };

  return (
    <>
      <div className="vx-md-controles">
        {[0, 1, 2, 3].map((i) => (
          <div className="vx-md-campo" key={i} style={{ minWidth: 210 }}>
            <label htmlFor={`pais-${i}`}>País {i + 1}{i > 1 ? " (opcional)" : ""}</label>
            <select id={`pais-${i}`} value={elegidos[i] ?? ""} onChange={(e) => cambiarPais(i, e.target.value)}>
              <option value="">—</option>
              {paises.map((p) => (
                <option key={p.iso2} value={p.iso2} disabled={elegidos.includes(p.iso2) && elegidos[i] !== p.iso2}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <h3 className="vx-md-h3" style={{ marginTop: 8 }}>Indicadores (máximo 6)</h3>
      {CATEGORIAS.map((c) => (
        <div key={c.id} style={{ marginBottom: 6 }}>
          <p className="vx-md-meta" style={{ margin: "6px 0 4px" }}>{c.nombre}</p>
          <div className="vx-md-chips">
            {INDICADORES.filter((i) => i.categoria === c.id).map((i) => (
              <button
                key={i.id}
                type="button"
                className="vx-md-chip"
                data-on={elegidosInd.includes(i.id) ? "1" : "0"}
                onClick={() => alternarInd(i.id)}
                title={i.pregunta}
              >
                {i.nombre}
              </button>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
