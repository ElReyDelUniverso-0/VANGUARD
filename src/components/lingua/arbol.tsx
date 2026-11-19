"use client";
// ═══════════════════════════════════════════════════════════════════
// v420.0 VANGUARD LINGUA — el árbol interactivo de lenguas.
// El servidor pinta la primera vista (con la ruta hasta el nodo pedido
// ya abierta); cada rama nueva se pide a /api/lingua/arbol al tocarla.
// El panel muestra lo que hay bajo el nodo elegido: ramas, lenguas,
// distribución en el mapa, estado de amenaza y, en las grandes
// familias, su historia y sus relaciones.
// ═══════════════════════════════════════════════════════════════════
import Link from "next/link";
import { useCallback, useMemo, useRef, useState } from "react";
import { geoMercator } from "d3-geo";
import type { DetalleArbol, HijoArbol } from "@/lib/lingua/arbol";
import { PROYECCION_MUNDO } from "@/lib/creadores/tipos";
import { AES_ES, AES_SIN_DATO, formatoNumero, rutaFamilia, rutaIdioma, rutaPais, RUTAS_LINGUA } from "@/lib/lingua/tipos";

const PROY = geoMercator()
  .rotate(PROYECCION_MUNDO.rotate)
  .center(PROYECCION_MUNDO.center)
  .scale(PROYECCION_MUNDO.scale)
  .translate(PROYECCION_MUNDO.translate);

const colorAes = (i: number) => AES_ES[i]?.color ?? AES_SIN_DATO.color;
const TXT_TIPO = { familia: "Familia o rama", lengua: "Lengua", dialecto: "Dialecto" } as const;

interface Props {
  raiz: string;
  nombreRaiz: string;
  hijosIniciales: Record<string, HijoArbol[]>;
  abiertosIniciales: string[];
  seleccionInicial: string;
  detalleInicial: DetalleArbol;
}

export function ArbolLenguas({ raiz, nombreRaiz, hijosIniciales, abiertosIniciales, seleccionInicial, detalleInicial }: Props) {
  const [hijos, setHijos] = useState<Record<string, HijoArbol[]>>(hijosIniciales);
  const [abiertos, setAbiertos] = useState<Set<string>>(() => new Set(abiertosIniciales));
  const [seleccion, setSeleccion] = useState(seleccionInicial);
  const [detalles, setDetalles] = useState<Record<string, DetalleArbol>>({ [detalleInicial.id]: detalleInicial });
  const [cargando, setCargando] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const pedir = useCallback(async (id: string) => {
    const r = await fetch(`/api/lingua/arbol?id=${encodeURIComponent(id)}`);
    const j = (await r.json()) as { ok: boolean; datos?: { detalle: DetalleArbol; hijos: HijoArbol[] }; error?: { mensaje: string } };
    if (!j.ok || !j.datos) throw new Error(j.error?.mensaje ?? "No se pudo cargar la rama.");
    return j.datos;
  }, []);

  const elegir = useCallback(
    async (id: string, alternar: boolean) => {
      setSeleccion(id);
      setError(null);
      if (typeof window !== "undefined") window.history.replaceState(null, "", `${rutaFamilia(raiz)}?n=${id}`);
      const teniaHijos = Boolean(hijos[id]);
      if (alternar && teniaHijos) {
        setAbiertos((prev) => {
          const s = new Set(prev);
          if (s.has(id)) s.delete(id);
          else s.add(id);
          return s;
        });
      }
      if (detalles[id] && teniaHijos) return;
      setCargando(id);
      try {
        const d = await pedir(id);
        setDetalles((prev) => ({ ...prev, [id]: d.detalle }));
        setHijos((prev) => ({ ...prev, [id]: d.hijos }));
        if (alternar && !teniaHijos) setAbiertos((prev) => new Set(prev).add(id));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error de red.");
      } finally {
        setCargando(null);
      }
    },
    [detalles, hijos, pedir, raiz],
  );

  const detalle = detalles[seleccion];

  const rama = (id: string, nivel: number): React.ReactNode => {
    const lista = hijos[id];
    if (!lista) return null;
    if (!lista.length) return null;
    return (
      <ul role={nivel === 0 ? "tree" : "group"} aria-label={nivel === 0 ? `Árbol de ${nombreRaiz}` : undefined}>
        {lista.map((h) => {
          const abierto = abiertos.has(h.id);
          const desplegable = h.n > 0;
          return (
            <li key={h.id} role="treeitem" aria-expanded={desplegable ? abierto : undefined} aria-selected={seleccion === h.id}>
              <button type="button" className={`vx-li-nodo ${h.tipo}`} aria-current={seleccion === h.id ? "true" : undefined} aria-expanded={desplegable ? abierto : undefined} onClick={() => elegir(h.id, true)}>
                <span className="flecha" aria-hidden>
                  {desplegable ? (abierto ? "▾" : "▸") : "·"}
                </span>
                {h.tipo === "lengua" ? <span className="vx-li-punto" style={{ background: colorAes(h.aes ?? -1) }} aria-hidden /> : null}
                <span className="nombre">{h.nombre}</span>
                <span className="cuenta">
                  {h.tipo === "familia" ? `${formatoNumero(h.n)} leng.` : h.n ? `${h.n} dial.` : ""}
                </span>
              </button>
              {cargando === h.id && !hijos[h.id] ? <div className="vx-li-cargando">Cargando…</div> : null}
              {abierto ? rama(h.id, nivel + 1) : null}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="vx-li-arbol-caja">
      <div className="vx-li-arbol">
        <button type="button" className="vx-li-nodo familia" aria-current={seleccion === raiz ? "true" : undefined} onClick={() => elegir(raiz, false)}>
          <span className="flecha" aria-hidden>
            ◆
          </span>
          <span className="nombre">
            <b>{nombreRaiz}</b>
          </span>
        </button>
        {rama(raiz, 0)}
      </div>
      <div className="vx-li-arbol-panel" ref={panelRef} aria-live="polite">
        {error ? <p className="vx-li-aviso vx-li-error">{error}</p> : null}
        {detalle ? <Panel d={detalle} raiz={raiz} onElegir={(id) => elegir(id, false)} /> : <p className="vx-li-cargando">Cargando…</p>}
      </div>
    </div>
  );
}

function Panel({ d, raiz, onElegir }: { d: DetalleArbol; raiz: string; onElegir: (id: string) => void }) {
  const total = d.aes.reduce((s, x) => s + x, 0) + d.sinAes;
  return (
    <div className="vx-li-caja">
      <p style={{ margin: "0 0 6px" }}>
        <span className={`vx-li-insignia ${d.pseudo ? "pseudo" : d.tipo}`}>{d.pseudo ? "Agrupación no genealógica" : TXT_TIPO[d.tipo]}</span>
      </p>
      <h2 style={{ fontSize: 22, textTransform: "none", letterSpacing: 0, color: "var(--pl-tinta)", margin: "0 0 2px" }}>{d.nombre}</h2>
      {d.original !== d.nombre ? <p className="vx-li-nota" style={{ margin: 0 }}>Glottolog: {d.original} · {d.id}</p> : <p className="vx-li-nota" style={{ margin: 0 }}>{d.id}</p>}
      {d.linaje.length ? (
        <p className="vx-li-nota" style={{ marginTop: 8 }}>
          {d.linaje.map((p, i) => (
            <span key={p.id}>
              {i ? " › " : ""}
              <button type="button" onClick={() => onElegir(p.id)} style={{ background: "none", border: 0, padding: 0, color: "var(--pl-suave)", textDecoration: "underline", cursor: "pointer", font: "inherit" }}>
                {p.nombre}
              </button>
            </span>
          ))}
        </p>
      ) : null}
      {d.nota ? <p className="vx-li-aviso">{d.nota}</p> : null}

      {d.tipo === "familia" ? (
        <div className="vx-li-cifras" style={{ margin: "10px 0" }}>
          <div>
            <b>{formatoNumero(d.nLenguas)}</b>
            <span>lenguas</span>
          </div>
          <div>
            <b>{formatoNumero(d.nDialectos)}</b>
            <span>dialectos</span>
          </div>
        </div>
      ) : (
        <dl className="vx-li-datos" style={{ margin: "10px 0" }}>
          {d.lengua ? (
            <>
              <div>
                <dt>Tipo</dt>
                <dd>{d.lengua.categoria}</dd>
              </div>
              <div>
                <dt>Estado de la lengua</dt>
                <dd>
                  <span className="vx-li-punto" style={{ background: colorAes(d.lengua.aes) }} /> {AES_ES[d.lengua.aes]?.nombre ?? AES_SIN_DATO.nombre}
                </dd>
              </div>
              {d.lengua.iso ? (
                <div>
                  <dt>ISO 639-3</dt>
                  <dd>{d.lengua.iso}</dd>
                </div>
              ) : null}
            </>
          ) : null}
          <div>
            <dt>{d.tipo === "lengua" ? "Dialectos" : "Subdialectos"}</dt>
            <dd>{d.nDialectos}</dd>
          </div>
        </dl>
      )}

      {total > 1 ? (
        <>
          <h3 style={{ fontSize: 12.5, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--pl-acento)", margin: "14px 0 4px" }}>Estado de amenaza</h3>
          <div className="vx-li-barra">
            {d.aes.map((n, i) => (n ? <span key={i} style={{ width: `${(n / total) * 100}%`, background: AES_ES[i].color }} title={`${AES_ES[i].nombre}: ${n}`} /> : null))}
            {d.sinAes ? <span style={{ width: `${(d.sinAes / total) * 100}%`, background: AES_SIN_DATO.color }} /> : null}
          </div>
          <ul className="vx-li-leyenda">
            {d.aes.map((n, i) =>
              n ? (
                <li key={i}>
                  <span className="vx-li-punto" style={{ background: AES_ES[i].color }} />
                  {AES_ES[i].nombre}: <b>{n}</b>
                </li>
              ) : null,
            )}
          </ul>
        </>
      ) : null}

      {d.puntos.length ? <MiniMapa puntos={d.puntos} etiqueta={`Distribución de ${d.nombre}`} /> : null}

      {d.macro.length && d.tipo === "familia" ? (
        <p className="vx-li-nota" style={{ marginTop: 8 }}>
          <b>Macroáreas:</b> {d.macro.map(([m, n]) => `${m} (${n})`).join(" · ")}
        </p>
      ) : null}
      {d.paises.length ? (
        <p className="vx-li-nota">
          <b>{d.tipo === "familia" ? "Países con más lenguas:" : "Países:"}</b>{" "}
          {d.paises.map(([iso, nombre, n], i) => (
            <span key={iso}>
              {i ? ", " : ""}
              <Link href={rutaPais(iso)}>{nombre}</Link>
              {d.tipo === "familia" ? ` (${n})` : ""}
            </span>
          ))}
        </p>
      ) : null}

      {d.ficha ? (
        <div style={{ marginTop: 14 }}>
          <h3 style={{ fontSize: 12.5, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--pl-oro)", margin: "0 0 8px" }}>Historia y relaciones</h3>
          <dl className="vx-li-datos">
            {d.ficha.protolengua ? (
              <div>
                <dt>Protolengua</dt>
                <dd>{d.ficha.protolengua}</dd>
              </div>
            ) : null}
            {d.ficha.antiguedad ? (
              <div>
                <dt>Antigüedad estimada</dt>
                <dd>{d.ficha.antiguedad}</dd>
              </div>
            ) : null}
            {d.ficha.origen ? (
              <div>
                <dt>Origen</dt>
                <dd>{d.ficha.origen}</dd>
              </div>
            ) : null}
            {d.ficha.testimonios ? (
              <div>
                <dt>Primeros testimonios escritos</dt>
                <dd>{d.ficha.testimonios}</dd>
              </div>
            ) : null}
          </dl>
          <div className="vx-li-texto" style={{ marginTop: 10 }}>
            {d.ficha.texto.map((p, i) => (
              <p key={i} style={{ fontSize: 14.5 }}>
                {p}
              </p>
            ))}
          </div>
          <ol className="vx-li-fuentes">
            {d.ficha.fuentes.map((f) => (
              <li key={f.url}>
                <a href={f.url} target="_blank" rel="noopener noreferrer">
                  {f.titulo}
                </a>
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      <p style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
        {d.tipo === "familia" ? (
          <>
            <Link className="vx-li-boton sec" href={`${RUTAS_LINGUA.idiomas}?familia=${d.id}`}>
              Lenguas en el catálogo
            </Link>
            {d.id !== raiz ? (
              <Link className="vx-li-boton sec" href={rutaFamilia(d.id)}>
                Abrir como árbol propio
              </Link>
            ) : null}
          </>
        ) : (
          <Link className="vx-li-boton" href={rutaIdioma(d.id)}>
            Abrir la ficha completa →
          </Link>
        )}
      </p>
    </div>
  );
}

function MiniMapa({ puntos, etiqueta }: { puntos: [number, number, number][]; etiqueta: string }) {
  const caja = useMemo(() => {
    const xy = puntos.map(([lat, lon]) => PROY([lon, lat]) ?? [500, 250]);
    const xs = xy.map((q) => q[0]);
    const ys = xy.map((q) => q[1]);
    let vw = Math.max(160, (Math.max(...xs) - Math.min(...xs)) * 1.3 + 60);
    let vh = Math.max(80, (Math.max(...ys) - Math.min(...ys)) * 1.3 + 60);
    if (vw / vh > 2) vh = vw / 2;
    else vw = vh * 2;
    vw = Math.min(1000, vw);
    vh = Math.min(500, vh);
    const cx = (Math.max(...xs) + Math.min(...xs)) / 2;
    const cy = (Math.max(...ys) + Math.min(...ys)) / 2;
    const x0 = Math.max(0, Math.min(1000 - vw, cx - vw / 2));
    const y0 = Math.max(0, Math.min(500 - vh, cy - vh / 2));
    return { xy, x0, y0, vw, vh };
  }, [puntos]);
  const k = Math.max(caja.vw / 1000, 0.18);
  const foco = puntos.length === 1;
  return (
    <svg className="vx-li-mapa" style={{ marginTop: 12 }} viewBox={`${caja.x0.toFixed(1)} ${caja.y0.toFixed(1)} ${caja.vw.toFixed(1)} ${caja.vh.toFixed(1)}`} role="img" aria-label={etiqueta}>
      <rect x={0} y={0} width={1000} height={500} fill="#0e1320" />
      <image href="/mapa-mundo.svg" x="0" y="0" width={1000} height={500} opacity={0.75} />
      {caja.xy.map(([x, y], i) => (
        <circle key={i} cx={x.toFixed(1)} cy={y.toFixed(1)} r={((foco ? 7 : 3.2) * k).toFixed(2)} fill={colorAes(puntos[i][2])} fillOpacity={0.9} stroke="#05060b" strokeWidth={(0.8 * k).toFixed(2)} />
      ))}
    </svg>
  );
}
