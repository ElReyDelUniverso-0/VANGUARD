"use client";
// ═══════════════════════════════════════════════════════════════════
// v420.3 · CONTROLES DEL ATLAS — categoría, país y búsqueda, sin recargar
// Departamento 6 · VANGUARD INFRASTRUCTURE ATLAS
// Cambiar un criterio reescribe la URL (así el enlace se puede compartir
// y el servidor vuelve a responder con la lista). El estado vive en la
// dirección, no en el navegador.
// ═══════════════════════════════════════════════════════════════════

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { CATEGORIAS_INFRA, META_CATEGORIA } from "@/lib/infraestructura/catalogo";

export function ControlesInfra({
  base,
  categorias,
  pais,
  texto,
  paises,
}: {
  base: string;
  categorias: string[];
  pais: string;
  texto: string;
  paises: { iso2: string; nombre: string }[];
}) {
  const router = useRouter();
  const ir = useCallback(
    (nuevas: Record<string, string | string[] | undefined>) => {
      const p = new URLSearchParams();
      for (const [k, v] of Object.entries(nuevas)) {
        if (v === undefined || v === "") continue;
        if (Array.isArray(v)) p.set(k, v.join(","));
        else p.set(k, v);
      }
      const qs = p.toString();
      router.push(qs ? `${base}?${qs}` : base);
    },
    [base, router]
  );

  const toggleCategoria = (categoria: string) => {
    const actuales = categorias.length ? categorias : [];
    const nuevo = actuales.includes(categoria) ? actuales.filter((c) => c !== categoria) : [...actuales, categoria];
    ir({ cat: nuevo.length ? nuevo.join(",") : undefined });
  };

  return (
    <div className="vx-md-controles">
      <div className="vx-md-campo" style={{ minWidth: 320 }}>
        <label htmlFor="sel-pais">País</label>
        <select id="sel-pais" value={pais} onChange={(e) => ir({ pais: e.target.value === "" ? undefined : e.target.value })}>
          <option value="">Todos los países</option>
          {paises
            .slice()
            .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"))
            .map((p) => (
              <option key={p.iso2} value={p.iso2}>
                {p.nombre}
              </option>
            ))}
        </select>
      </div>
      <div className="vx-md-campo" style={{ minWidth: 260 }}>
        <label htmlFor="txt-buscar">Buscar (nombre, ciudad, país, descripción)</label>
        <input
          id="txt-buscar"
          value={texto}
          placeholder="Ej.: puente, Tokio, canal"
          onChange={(e) => ir({ q: e.target.value.trim() === "" ? undefined : e.target.value.trim() })}
        />
      </div>
      <div className="vx-md-campo" style={{ flex: 1, minWidth: 0 }}>
        <label>Categorías ({CATEGORIAS_INFRA.length} en el catálogo)</label>
        <div className="vx-md-chips">
          {CATEGORIAS_INFRA.map((c) => (
            <button
              key={c}
              type="button"
              className="vx-md-chip"
              data-on={categorias.includes(c) ? 1 : 0}
              onClick={() => toggleCategoria(c)}
              title={META_CATEGORIA[c].pregunta}
            >
              {META_CATEGORIA[c].nombre}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
