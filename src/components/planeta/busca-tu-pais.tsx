"use client";

// v406.5 · ¿A qué bloques pertenece un país? — buscador instantáneo de
// /organizaciones. Recibe la tabla país → claves de bloque desde el servidor.
import { useMemo, useState } from "react";
import Link from "next/link";

function norm(s: string) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export function BuscaTuPais({
  paises,
  siglas,
}: {
  paises: { iso2: string; nombre: string; orgs: string[] }[];
  siglas: Record<string, string>;
}) {
  const [q, setQ] = useState("República Dominicana");
  const res = useMemo(() => {
    const n = norm(q.trim());
    if (n.length < 2) return [];
    return paises.filter((p) => norm(p.nombre).includes(n) || p.iso2 === n).slice(0, 6);
  }, [q, paises]);
  return (
    <div className="vx-pl-panel">
      <input className="vx-pl-input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ej.: México, Japón, Nigeria…" aria-label="País" />
      <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
        {res.length === 0 && q.trim().length >= 2 ? <p className="vx-pl-vacio">Ningún país coincide.</p> : null}
        {res.map((p) => (
          <div key={p.iso2} style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
            <Link href={`/mundos/${p.iso2}`} style={{ color: "#e7edf5", fontWeight: 600, marginRight: 6, textDecoration: "none" }}>
              {p.nombre}
            </Link>
            {p.orgs.length === 0 ? (
              <span className="vx-pl-vacio">no es miembro pleno de ninguno de los 16 bloques de esta página</span>
            ) : (
              p.orgs.map((o) => (
                <Link key={o} href={`/organizaciones/${o}`} className="vx-pl-chip">
                  {siglas[o] ?? o}
                </Link>
              ))
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
