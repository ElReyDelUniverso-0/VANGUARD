"use client";

// ═══════════════════════════════════════════════════════════════════
// v407.1 · EL COMPARADOR (cliente) — elige países, compáralos, compártelo.
// Sin red: la tabla llega en el HTML. Los puestos mundiales se calculan
// aquí con la misma regla que /rankings (mayor = puesto 1).
// ═══════════════════════════════════════════════════════════════════
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { INDICADORES, fmt, veces, type FilaPlaneta, type IdIndicador } from "@/lib/planeta/indicadores";
import { GuardarPieza } from "./guardar";

const MAX = 4;

const ATAJOS: { nombre: string; p: string[] }[] = [
  { nombre: "La isla: RD y Haití", p: ["do", "ht"] },
  { nombre: "Caribe hispano", p: ["do", "cu", "pr"] },
  { nombre: "Los tres gigantes", p: ["cn", "in", "us"] },
  { nombre: "Rusia y Ucrania", p: ["ru", "ua"] },
  { nombre: "Israel e Irán", p: ["il", "ir"] },
  { nombre: "Las dos Coreas", p: ["kr", "kp"] },
  { nombre: "Nigeria y Japón", p: ["ng", "jp"] },
  { nombre: "México, Brasil, Argentina", p: ["mx", "br", "ar"] },
];

function norm(s: string) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function leerURL(validos: Set<string>): string[] {
  try {
    const p = new URLSearchParams(window.location.search).get("p");
    if (!p) return [];
    return [...new Set(p.toLowerCase().split(/[,\s]+/).filter((x) => validos.has(x)))].slice(0, MAX);
  } catch {
    return [];
  }
}

export function Comparador({ filas, orgs }: { filas: FilaPlaneta[]; orgs: { clave: string; sigla: string; miembros: string[] }[] }) {
  const porIso = useMemo(() => new Map(filas.map((f) => [f.iso2, f])), [filas]);
  const [sel, setSel] = useState<string[]>(["do", "ht"]);
  const [q, setQ] = useState("");
  const [copiado, setCopiado] = useState(false);

  // la comparación del enlace manda (si trae países válidos)
  useEffect(() => {
    const aplicar = () => {
      const desdeURL = leerURL(new Set(porIso.keys()));
      if (desdeURL.length > 0) setSel(desdeURL);
    };
    aplicar();
  }, [porIso]);

  // y el enlace sigue a la comparación, sin recargar
  useEffect(() => {
    try {
      const u = new URL(window.location.href);
      if (sel.length) u.searchParams.set("p", sel.join(","));
      else u.searchParams.delete("p");
      window.history.replaceState(null, "", u.pathname + u.search);
    } catch {
      /* sin history: no pasa nada */
    }
  }, [sel]);

  const puestos = useMemo(() => {
    const out = {} as Record<IdIndicador, Map<string, number>>;
    for (const ind of INDICADORES) {
      const orden = filas.filter((f) => f.v[ind.id] !== null).sort((a, b) => (b.v[ind.id] as number) - (a.v[ind.id] as number));
      out[ind.id] = new Map(orden.map((f, i) => [f.iso2, i + 1]));
    }
    return out;
  }, [filas]);

  const sugerencias = useMemo(() => {
    const n = norm(q.trim());
    if (n.length < 2) return [];
    return filas.filter((f) => !sel.includes(f.iso2) && (norm(f.nombre).includes(n) || f.iso2 === n || norm(f.iso3) === n)).slice(0, 6);
  }, [q, filas, sel]);

  const elegidos = sel.map((s) => porIso.get(s)).filter((f): f is FilaPlaneta => !!f);
  const base = elegidos[0];

  function añadir(iso2: string) {
    setSel((s) => (s.includes(iso2) || s.length >= MAX ? s : [...s, iso2]));
    setQ("");
  }
  function quitar(iso2: string) {
    setSel((s) => s.filter((x) => x !== iso2));
  }
  async function copiar() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 2000);
    } catch {
      /* el navegador no deja: el enlace sigue en la barra */
    }
  }

  const comunes = elegidos.length >= 2 ? orgs.filter((o) => elegidos.every((f) => o.miembros.includes(f.iso2))) : [];

  return (
    <div style={{ marginTop: 16 }}>
      <div className="vx-pl-panel">
        <div className="vx-pl-sel" aria-label="Países elegidos">
          {elegidos.map((f) => (
            <span key={f.iso2} className="vx-pl-sel-pais">
              <img src={`https://flagcdn.com/w40/${f.iso2}.png`} alt="" width={20} height={14} style={{ borderRadius: 2 }} />
              {f.nombre}
              <button type="button" onClick={() => quitar(f.iso2)} aria-label={`Quitar ${f.nombre}`}>
                ×
              </button>
            </span>
          ))}
          {elegidos.length === 0 ? <span className="vx-pl-vacio">Elige al menos dos países.</span> : null}
        </div>
        {sel.length < MAX ? (
          <>
            <input
              className="vx-pl-input"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && sugerencias[0]) añadir(sugerencias[0].iso2);
              }}
              placeholder={`Añade un país (${sel.length}/${MAX}): escribe su nombre…`}
              aria-label="Añadir país"
            />
            {sugerencias.length > 0 ? (
              <div className="vx-pl-sugerencias">
                {sugerencias.map((f) => (
                  <button key={f.iso2} type="button" onClick={() => añadir(f.iso2)}>
                    {f.nombre} <span style={{ color: "#6b7c90" }}>· {f.subEs}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </>
        ) : (
          <p className="vx-pl-vacio">Máximo {MAX} países: quita uno para añadir otro.</p>
        )}
        <div className="vx-pl-fila" style={{ marginTop: 12 }}>
          <span className="vx-pl-vacio">Atajos:</span>
          {ATAJOS.filter((a) => a.p.every((x) => porIso.has(x))).map((a) => (
            <button key={a.nombre} type="button" className="vx-pl-btn" onClick={() => setSel(a.p)}>
              {a.nombre}
            </button>
          ))}
        </div>
      </div>

      {elegidos.length >= 1 ? (
        <>
          <div className="vx-pl-fila" style={{ marginTop: 14 }}>
            <button type="button" className="vx-pl-btn" onClick={copiar}>
              {copiado ? "Enlace copiado ✓" : "Copiar enlace de esta comparación"}
            </button>
            {elegidos.length >= 2 ? (
              <GuardarPieza
                titulo={`Comparación · ${elegidos.map((f) => f.nombre).join(" / ")}`}
                href={`/comparador?p=${sel.join(",")}`}
                nota={`Comparador internacional: ${elegidos.map((f) => `${f.nombre} ${fmt("pob", f.v.pob)}`).join(" · ")}`}
                etiquetas={["comparador", ...sel]}
              />
            ) : null}
          </div>

          <section className="vx-pl-sec">
            <div className="vx-pl-tabla-caja">
              <table className="vx-pl-tabla">
                <thead>
                  <tr>
                    <th>Indicador</th>
                    {elegidos.map((f) => (
                      <th key={f.iso2} className="n">
                        <Link href={`/mundos/${f.iso2}`} style={{ color: "inherit" }}>
                          {f.nombre}
                        </Link>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {INDICADORES.map((ind) => {
                    const vals = elegidos.map((f) => f.v[ind.id]);
                    const conDato = vals.filter((v): v is number => v !== null);
                    const max = conDato.length >= 2 ? Math.max(...conDato) : null;
                    return (
                      <tr key={ind.id}>
                        <td>
                          <Link href={`/rankings/${ind.id}`} style={{ color: "inherit" }} title={ind.fuente}>
                            {ind.nombre}
                          </Link>
                          <span className="vx-pl-rel">{ind.pregunta}</span>
                        </td>
                        {elegidos.map((f, i) => {
                          const v = f.v[ind.id];
                          const p = puestos[ind.id].get(f.iso2);
                          const anio = ind.anioDe ? f.anios[ind.anioDe] : undefined;
                          const rel = i > 0 && base ? veces(v, base.v[ind.id]) : null;
                          return (
                            <td key={f.iso2} className="n">
                              <span className={max !== null && v === max ? "vx-pl-gana" : undefined}>{fmt(ind.id, v)}</span>
                              {anio ? <span className="vx-pl-anio">{anio}</span> : null}
                              <span className="vx-pl-rel">
                                {p ? `puesto ${p} de ${puestos[ind.id].size}` : "sin puesto"}
                                {rel ? ` · ${rel} de ${base.nombre}` : ""}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                  <tr>
                    <td>
                      Región
                      <span className="vx-pl-rel">subregión de Naciones Unidas</span>
                    </td>
                    {elegidos.map((f) => (
                      <td key={f.iso2} className="n">
                        <Link href={`/regiones/${f.subSlug}`} style={{ color: "#5eead4" }}>
                          {f.subEs}
                        </Link>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td>
                      Bloques
                      <span className="vx-pl-rel">miembro pleno de</span>
                    </td>
                    {elegidos.map((f) => {
                      const suyos = orgs.filter((o) => o.miembros.includes(f.iso2));
                      return (
                        <td key={f.iso2} className="n" style={{ whiteSpace: "normal" }}>
                          {suyos.length === 0
                            ? "—"
                            : suyos.map((o) => (
                                <Link key={o.clave} href={`/organizaciones/${o.clave}`} className="vx-pl-chip">
                                  {o.sigla}
                                </Link>
                              ))}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="vx-pl-h2-sub" style={{ marginTop: 8 }}>
              Resaltado, quien encabeza cada fila. «2,3×» o «45 %» se lee respecto de {base ? base.nombre : "el primer país"}: cambia el orden quitando y
              volviendo a añadir países.
              {comunes.length > 0 ? <> Comparten: {comunes.map((o) => o.sigla).join(", ")}.</> : null}
            </p>
          </section>
        </>
      ) : null}
    </div>
  );
}
