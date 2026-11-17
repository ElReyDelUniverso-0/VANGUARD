"use client";

// ═══════════════════════════════════════════════════════════════════
// v405.12 · EL MAPA DE LOS MUNDOS — el tablero de países de la casa
//
// Lo que hace y por qué: el lector elige una MEDIDA (población, gasto
// militar, fronteras…), el mapa se pinta con los valores reales de su ficha
// unificada, y al tocar un país se abre su panel con los puentes a los
// módulos de información y simulación. Sin datos inventados: el país que no
// tiene el dato se pinta apagado y se dice cuántos son.
//
// Se puede usar sin ratón: hay un selector de país (teclado) y todos los
// países están además en la lista de la página. El SVG es decoración
// interactiva, no la única puerta.
// ═══════════════════════════════════════════════════════════════════

import { useMemo, useState } from "react";
import Link from "next/link";
import { colorDeCapa, papelDe, type PayloadMundos, type PaisCliente } from "@/lib/mundos/capas";
import { formatear } from "@/lib/mundos/formato";
import { PUENTES, resolverPuente } from "@/lib/mundos/registro";
import { GuardarEnEspacio } from "./guardar-espacio";

const sinTildes = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export function MapaMundos({ payload }: { payload: PayloadMundos }) {
  const [capaId, setCapaId] = useState<string>(payload.capas[0]?.id ?? "poblacion");
  const [region, setRegion] = useState<string | null>(null);
  const [territorio, setTerritorio] = useState<string | null>(null);
  const [consulta, setConsulta] = useState("");
  const [seleccion, setSeleccion] = useState<string | null>(null);
  const [encima, setEncima] = useState<string | null>(null);
  const [acercado, setAcercado] = useState<string | null>(null);

  const capa = payload.capas.find((c) => c.id === capaId) ?? payload.capas[0];
  const porIso = useMemo(() => new Map(payload.paises.map((p) => [p.iso2, p])), [payload.paises]);
  const pais: PaisCliente | null = seleccion ? porIso.get(seleccion) ?? null : null;

  // ── filtros ──
  const busqueda = sinTildes(consulta.trim());
  const resultados = useMemo(() => {
    if (busqueda.length < 2) return [];
    return payload.paises
      .filter((p) => sinTildes(p.nombre).includes(busqueda) || p.iso2 === busqueda)
      .slice(0, 8);
  }, [busqueda, payload.paises]);

  const encendido = (p: { iso2: string | null; region?: string; territorio?: string | null }) => {
    if (region && p.region !== region) return false;
    if (territorio && p.territorio !== territorio) return false;
    return true;
  };

  const vecinosDeSel = pais ? pais.vecinosIso : [];

  // ── ventana del lienzo (planeta o país acercado) ──
  const ventana = useMemo(() => {
    if (!acercado) return { vb: `0 0 ${payload.lienzo.ancho} ${payload.lienzo.alto}`, w: payload.lienzo.ancho };
    const pol = payload.poligonos.find((p) => p.iso2 === acercado || p.k === acercado);
    if (!pol) return { vb: `0 0 ${payload.lienzo.ancho} ${payload.lienzo.alto}`, w: payload.lienzo.ancho };
    const [x0, y0, x1, y1] = pol.b;
    const w = Math.max(x1 - x0, 14) * 1.9;
    const h = Math.max(y1 - y0, 7) * 1.9;
    const cx = (x0 + x1) / 2;
    const cy = (y0 + y1) / 2;
    return { vb: `${(cx - w / 2).toFixed(1)} ${(cy - h / 2).toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)}`, w };
  }, [acercado, payload]);

  const valorDe = (iso2: string | null) => (iso2 ? capa.datos[iso2] : undefined);
  const textoValor = (iso2: string | null) => {
    const v = valorDe(iso2);
    return v === undefined ? "sin dato en esta capa" : formatear(capa.formato, v);
  };

  const encimaPais = encima ? porIso.get(encima) ?? null : null;

  return (
    <div className="vx-mm">
      {/* ── mandos ── */}
      <div className="vx-mm-mandos">
        <div className="vx-mm-tabs" role="tablist" aria-label="Capa del mapa">
          {payload.capas.map((c) => (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={c.id === capa.id}
              className={"vx-mm-tab" + (c.id === capa.id ? " es-activa" : "")}
              onClick={() => setCapaId(c.id)}
            >
              {c.nombre}
              <span className="vx-mm-tab-cifra">{c.conDato}</span>
            </button>
          ))}
        </div>

        <div className="vx-mm-busca">
          <input
            type="search"
            value={consulta}
            onChange={(e) => setConsulta(e.target.value)}
            placeholder="Buscar país…"
            aria-label="Buscar país en el mapa"
            className="vx-mm-input"
          />
          <select
            className="vx-mm-select"
            aria-label="Ir a un país"
            value={seleccion ?? ""}
            onChange={(e) => {
              setSeleccion(e.target.value || null);
              setAcercado(e.target.value || null);
            }}
          >
            <option value="">Los 249 países…</option>
            {[...payload.paises]
              .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"))
              .map((p) => (
                <option key={p.iso2} value={p.iso2}>
                  {p.nombre}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* resultados del buscador (teclado y ratón) */}
      {resultados.length > 0 ? (
        <ul className="vx-mm-resultados">
          {resultados.map((p) => (
            <li key={p.iso2}>
              <button
                type="button"
                onClick={() => {
                  setSeleccion(p.iso2);
                  setAcercado(p.iso2);
                  setConsulta("");
                }}
              >
                <strong>{p.nombre}</strong> <span>{p.region}</span> · {capa.datos[p.iso2] === undefined ? "sin dato" : formatear(capa.formato, capa.datos[p.iso2])}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <p className="vx-mm-pregunta">
        <span className="vx-mm-pregunta-capa">{capa.nombre}</span> · {capa.pregunta}
      </p>

      {/* ── filtros ── */}
      <div className="vx-mm-filtros">
        <button type="button" className={"vx-mm-chip" + (region === null ? " es-activo" : "")} onClick={() => setRegion(null)}>
          Todas las regiones
        </button>
        {payload.regiones.map((r) => (
          <button
            key={r.clave}
            type="button"
            className={"vx-mm-chip" + (region === r.clave ? " es-activo" : "")}
            onClick={() => setRegion(region === r.clave ? null : r.clave)}
          >
            {r.nombre} <span>{r.cuantos}</span>
          </button>
        ))}
        <select className="vx-mm-select vx-mm-select--ancho" aria-label="Filtrar por macroterritorio" value={territorio ?? ""} onChange={(e) => setTerritorio(e.target.value || null)}>
          <option value="">Los 24 macroterritorios</option>
          {payload.territorios.map((t) => (
            <option key={t.clave} value={t.nombre}>
              {t.nombre} ({t.cuantos})
            </option>
          ))}
        </select>
        {acercado ? (
          <button type="button" className="vx-mm-chip vx-mm-chip--reset" onClick={() => setAcercado(null)}>
            ⤢ Ver el planeta
          </button>
        ) : null}
      </div>

      {/* ── el lienzo ── */}
      <div className="vx-mm-lienzo">
        <svg
          viewBox={ventana.vb}
          className="vx-mm-svg"
          role="img"
          aria-label={`Mapa del planeta coloreado por ${capa.nombre.toLowerCase()}: ${capa.conDato} países con dato`}
        >
          <defs>
            <radialGradient id="vx-mm-oceano" cx="50%" cy="45%" r="70%">
              <stop offset="0%" stopColor="#0a1a26" />
              <stop offset="100%" stopColor="#03070c" />
            </radialGradient>
          </defs>
          <rect x="0" y="0" width={payload.lienzo.ancho} height={payload.lienzo.alto} fill="url(#vx-mm-oceano)" />
          <path d={payload.rejilla} className="vx-mm-rejilla" aria-hidden="true" />

          {payload.poligonos.map((pol) => {
            const p = pol.iso2 ? porIso.get(pol.iso2) : null;
            const papel = papelDe(pol.iso2, seleccion, vecinosDeSel);
            const activo = p ? encendido(p) : true;
            const clase =
              "vx-mm-pais" +
              (papel === "pais" ? " es-pais" : papel === "vecino" ? " es-vecino" : "") +
              (activo ? "" : " es-apagado") +
              (pol.iso2 && pol.iso2 === encima ? " es-encima" : "");
            return (
              <path
                key={pol.k}
                d={pol.d}
                className={clase}
                fill={colorDeCapa(capa, valorDe(pol.iso2))}
                stroke={papel === "pais" ? "#ffe9a8" : papel === "vecino" ? "#e8c56a" : "rgba(150,220,235,0.35)"}
                strokeWidth={papel === "pais" ? 2.4 : papel === "vecino" ? 1.2 : 0.35}
                vectorEffect="non-scaling-stroke"
                onMouseEnter={() => pol.iso2 && setEncima(pol.iso2)}
                onMouseLeave={() => setEncima(null)}
                onClick={() => {
                  if (!pol.iso2) return;
                  setSeleccion(pol.iso2);
                }}
              >
                <title>{p ? `${p.nombre} · ${textoValor(pol.iso2)}` : pol.k}</title>
              </path>
            );
          })}

          {/* puntos: microestados sin polígono en el índice + el país elegido */}
          {payload.paises
            .filter((p) => !p.clave)
            .map((p) => (
              <circle
                key={"pt-" + p.iso2}
                cx={p.xy[0]}
                cy={p.xy[1]}
                r={acercado ? 1.4 : 2.6}
                className={"vx-mm-punto" + (p.iso2 === seleccion ? " es-pais" : "")}
                fill={colorDeCapa(capa, valorDe(p.iso2))}
                onClick={() => setSeleccion(p.iso2)}
              >
                <title>{`${p.nombre} · ${textoValor(p.iso2)}`}</title>
              </circle>
            ))}
        </svg>

        <div className="vx-mm-hover" aria-live="polite">
          {encimaPais ? (
            <>
              <strong>{encimaPais.nombre}</strong>
              <span>{textoValor(encimaPais.iso2)}</span>
            </>
          ) : (
            <span className="vx-mm-hover-ayuda">Toca un país · rueda del ratón y arrastre libres del navegador</span>
          )}
        </div>

        <ul className="vx-mm-leyenda" aria-label="Escala de color">
          {capa.leyenda.map((b, i) => (
            <li key={i}>
              <i style={{ background: b.color }} />
              {b.etiqueta}
            </li>
          ))}
          <li>
            <i style={{ background: "rgba(120,140,160,0.25)" }} />
            sin dato ({capa.sinDato})
          </li>
        </ul>
      </div>

      <p className="vx-mm-fuente">
        Capa: <strong>{capa.nombre}</strong> · {capa.conDato} de {payload.cobertura.global.paises} países con dato · fuente: {capa.fuente}
        {capa.mayor ? ` · máximo: ${capa.mayor.nombre} (${formatear(capa.formato, capa.mayor.valor)})` : ""}
        {capa.menor ? ` · mínimo: ${capa.menor.nombre} (${formatear(capa.formato, capa.menor.valor)})` : ""}
      </p>

      {/* ── panel del país elegido ── */}
      {pais ? (
        <div className="vx-mm-ficha">
          <div className="vx-mm-ficha-cab">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://flagcdn.com/w80/${pais.iso2}.png`}
              alt={`Bandera de ${pais.nombre}`}
              width={56}
              height={38}
              className="vx-mm-bandera"
            />
            <div>
              <h3 className="vx-mm-ficha-titulo">{pais.nombre}</h3>
              <p className="vx-mm-ficha-sub">
                {pais.iso2.toUpperCase()} · {pais.subregion || pais.region}
                {pais.territorio ? ` · ${pais.territorio}` : ""}
              </p>
            </div>
            <button type="button" className="vx-mm-cerrar" onClick={() => setSeleccion(null)} aria-label="Cerrar la ficha del país">
              ✕
            </button>
          </div>

          <dl className="vx-mm-datos">
            <div>
              <dt>Capital</dt>
              <dd>{pais.capital ?? <em>sin dato</em>}</dd>
            </div>
            <div>
              <dt>Población</dt>
              <dd>{pais.poblacion ?? <em>sin dato</em>}</dd>
            </div>
            <div>
              <dt>Superficie</dt>
              <dd>{pais.superficie ?? <em>sin dato</em>}</dd>
            </div>
            <div>
              <dt>Fronteras</dt>
              <dd>{pais.vecinos === null ? <em>sin polígono</em> : `${pais.vecinos} vecinos`}</dd>
            </div>
            <div>
              <dt>En «{capa.nombre}»</dt>
              <dd>{textoValor(pais.iso2)}</dd>
            </div>
            <div>
              <dt>Conflictos abiertos</dt>
              <dd>{pais.conflictos > 0 ? `${pais.conflictos}` : "ninguno sembrado"}</dd>
            </div>
          </dl>

          {pais.vecinosIso.length > 0 ? (
            <p className="vx-mm-vecinos">
              <strong>Fronteras:</strong>{" "}
              {pais.vecinosIso.map((iso2, i) => {
                const n = porIso.get(iso2);
                return (
                  <span key={iso2}>
                    {i > 0 ? " · " : ""}
                    <Link href={`/mundos/${iso2}`}>{n ? n.nombre : iso2.toUpperCase()}</Link>
                  </span>
                );
              })}
            </p>
          ) : null}

          <div className="vx-mm-acciones">
            <Link href={`/mundos/${pais.iso2}`} className="vx-mm-btn vx-mm-btn--oro">
              Ficha completa →
            </Link>
            <button type="button" className="vx-mm-btn" onClick={() => setAcercado(pais.iso2)}>
              Acercar
            </button>
            {PUENTES.filter((p) => ["teatro", "mapas", "conflictos", "divisas"].includes(p.id)).map((p) => (
              <Link key={p.id} href={resolverPuente(p, pais)} className="vx-mm-btn">
                {p.nombre}
              </Link>
            ))}
            <GuardarEnEspacio iso2={pais.iso2} nombre={pais.nombre} nota={`Ficha del país ${pais.nombre} · capa ${capa.nombre}`} />
          </div>
        </div>
      ) : (
        <p className="vx-mm-vacio">
          Elige una medida arriba y toca un país en el mapa, o búscalo por su nombre. Cada país abre su ficha con lo que
          la casa sabe de él —y dice lo que no sabe.
        </p>
      )}
    </div>
  );
}
