"use client";

// ═══════════════════════════════════════════════════════════════════
// v416.0 VANGUARD EARTH SYSTEM — EL EXPLORADOR MUNDIAL.
//
// Una sola sala, un solo planeta, todas las lecturas. No es un mapa nuevo:
// es el lugar donde se encuentran el globo de la casa (globe.gl), el atlas
// plano, las capas del centro de mapas, el catálogo de lugares, los
// recorridos guiados, el comparador territorial y el mapa histórico.
//
// REGLA DE DISEÑO: lo que el visitante elige en una vista, la otra lo
// hereda. La transición 2D↔3D no reinicia la selección ni la capa: cambia
// solo el ángulo. Y en un aparato de baja potencia, la vista plana entra
// sola (la decide el presupuesto 3D de la casa, no una suposición).
//
// Cero datos nuevos escritos a mano: regiones, fichas, guerras, lugares y
// teatros salen de sus fuentes; los hitos físicos de earth/hitos.ts.
// ═══════════════════════════════════════════════════════════════════

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Plus, Minus, RotateCcw, Home, Search, Ruler, Bookmark, Trash2,
  Globe2, Map as MapIcon, GitCompareArrows, Route, History, Layers, Crosshair,
} from "lucide-react";
import type { Globe3DMarker, GlobeFlyTo } from "@/components/vanguard/globe-map-3d";
import { MapaAtlas2D } from "./mapa-atlas-2d";
import {
  CAPAS_EARTH, capaEarthPorId, hitosDeCapa, puntosDeCapa,
  COLORES_REGION, LEYENDA_REGION, type CapaEarthId, type PuntoAcontecimiento,
} from "@/lib/earth/capas";
import { COLOR_HITO, HITOS, type Hito } from "@/lib/earth/hitos";
import { PAISES_GEO, POR_NUM, buscarPaises, type PaisGeo } from "@/lib/geo-paises";
import { fichaPais, regionEnEspanol } from "@/lib/mundos/ficha";
import { distanciaKm, LUGARES, CRONICAS } from "@/lib/tierra-data";
import { PUNTOS_HISTORICOS } from "@/lib/earth/guerra-puntos";
import { presupuesto3D } from "@/lib/3d/vivo";
import { useT } from "@/lib/i18n";
import { PanelLugares, Recorridos, ComparadorTerritorial, HistoriaCapa, type Vuelo } from "./paneles-earth";

const GlobeMap3D = dynamic(
  () => import("@/components/vanguard/globe-map-3d").then((m) => m.GlobeMap3D),
  {
    ssr: false,
    loading: () => (
      <div className="earth-cargando">
        <p>DESPLEGANDO EL PLANETA…</p>
      </div>
    ),
  },
);

// ── lugares guardados por el visitante (viven en su aparato, no en la nube) ──
interface Guardado {
  id: string;
  lat: number;
  lng: number;
  nombre: string;
}
const CLAVE_GUARDADOS = "vanguard-earth-lugares";

function cargarGuardados(): Guardado[] {
  try {
    const raw = window.localStorage.getItem(CLAVE_GUARDADOS);
    if (!raw) return [];
    const p = JSON.parse(raw);
    return Array.isArray(p) ? p.filter((g) => g && Number.isFinite(g.lat) && Number.isFinite(g.lng)) : [];
  } catch {
    return [];
  }
}

const ALTURAS = [2.6, 2.2, 1.8, 1.5, 1.2, 0.9, 0.65, 0.45] as const;

type SubVista = "explorar" | "lugares" | "recorridos" | "comparar" | "historia";

export interface ObjetivoEarth {
  lat: number;
  lng: number;
  pais?: string;
  nombre?: string;
}

export function ExploradorMundial({
  objetivo,
  acontecimientos = [],
}: {
  objetivo?: ObjetivoEarth | null;
  /** teatros vivos, calculados en el servidor (el núcleo no entra en el cliente) */
  acontecimientos?: PuntoAcontecimiento[];
}) {
  const { t } = useT();
  const equipoBajo = useMemo(() => {
    if (typeof window === "undefined") return false;
    try {
      return presupuesto3D().clase === "bajo";
    } catch {
      return false;
    }
  }, []);

  const [vista, setVista] = useState<"3d" | "2d">(equipoBajo ? "2d" : "3d");
  const [ligero, setLigero] = useState(equipoBajo);
  const [sub, setSub] = useState<SubVista>("explorar");
  const [capaId, setCapaId] = useState<CapaEarthId>("regiones");
  const [consulta, setConsulta] = useState("");
  const [seleccion, setSeleccion] = useState<PaisGeo | null>(null);
  const [giro, setGiro] = useState(false);
  const [vuelo, setVuelo] = useState<GlobeFlyTo | null>(null);
  const [zoom, setZoom] = useState<{ altitude: number; nonce: number } | null>(null);
  const [indiceAltura, setIndiceAltura] = useState(3);
  const [punto, setPunto] = useState<{ lat: number; lng: number } | null>(null);
  const [medir, setMedir] = useState(false);
  const [medida, setMedida] = useState<{ id: number; lat: number; lng: number }[]>([]);
  const [guardados, setGuardados] = useState<Guardado[]>([]);
  const [comparacion, setComparacion] = useState<{ a: string | null; b: string | null }>({ a: null, b: null });
  const nonce = useRef(0);
  const nonceZoom = useRef(0);

  const capa = capaEarthPorId(capaId);
  const ficha = seleccion ? fichaPais(seleccion.iso2) : null;

  // ── Persistencia de lugares guardados ──────────────────────────────
  useEffect(() => {
    setGuardados(cargarGuardados());
  }, []);
  const guardar = useCallback((lat: number, lng: number, nombre: string) => {
    setGuardados((prev) => {
      if (prev.some((g) => Math.abs(g.lat - lat) < 0.05 && Math.abs(g.lng - lng) < 0.05)) return prev;
      const next = [...prev, { id: `${Date.now()}`, lat, lng, nombre }].slice(-40);
      try {
        window.localStorage.setItem(CLAVE_GUARDADOS, JSON.stringify(next));
      } catch {
        /* sin almacenamiento: el lugar vive solo en memoria */
      }
      return next;
    });
  }, []);
  const quitarGuardado = useCallback((id: string) => {
    setGuardados((prev) => {
      const next = prev.filter((g) => g.id !== id);
      try {
        window.localStorage.setItem(CLAVE_GUARDADOS, JSON.stringify(next));
      } catch {
        /* noop */
      }
      return next;
    });
  }, []);

  // ── vuelo ──────────────────────────────────────────────────────────
  const volar = useCallback((lat: number, lng: number, alt = 1.1) => {
    nonce.current += 1;
    setVuelo({ lat, lng, altitude: alt, nonce: nonce.current });
  }, []);
  const volarCb = useCallback<Vuelo>((lat, lng, alt) => volar(lat, lng, alt), [volar]);

  // ── objetivo inicial (vínculos desde /mundos y /atlas) ─────────────
  useEffect(() => {
    if (!objetivo) return;
    volar(objetivo.lat, objetivo.lng, 0.85);
    const pais = objetivo.pais ? POR_NUM.get(objetivo.pais) ?? POR_NUM.get(String(objetivo.pais).padStart(3, "0")) : null;
    if (pais) setSeleccion(pais);
    else if (objetivo.nombre) setConsulta(objetivo.nombre);
    // solo al montar: el objetivo manda una vez
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── resultados del buscador ────────────────────────────────────────
  const resultados = useMemo(() => (consulta.trim().length >= 2 ? buscarPaises(consulta, 6) : []), [consulta]);

  // ── lo que la capa enciende ────────────────────────────────────────
  const hitos: Hito[] = useMemo(() => {
    const h = hitosDeCapa(capa);
    return ligero ? h.slice(0, 14) : h;
  }, [capa, ligero]);

  const puntos = useMemo(() => {
    // la capa de teatros la resuelve el servidor; el resto, sus fuentes
    const crudos = (capa.puntos === "acontecimientos" ? acontecimientos : puntosDeCapa(capa)) as unknown[];
    const out: { id: string; nombre: string; lat: number; lng: number; color: string; tamano: number; etiqueta: string; href?: string }[] = [];
    for (const c of crudos) {
      const p = c as Record<string, unknown>;
      const nombre = String(p.nombre ?? p.id ?? "");
      const color = String(p.color ?? "#FFD166");
      const etiqueta = String(p.etiqueta ?? p.nota ?? nombre);
      out.push({
        id: String(p.id ?? nombre),
        nombre,
        lat: Number(p.lat),
        lng: Number(p.lng),
        color,
        tamano: Number(p.tamano ?? 0.4),
        etiqueta,
        href: p.href ? String(p.href) : undefined,
      });
    }
    return ligero ? out.slice(0, 20) : out;
  }, [capa, ligero, acontecimientos]);

  // ── marcadores del globo ───────────────────────────────────────────
  const marcadores: Globe3DMarker[] = useMemo(() => {
    const out: Globe3DMarker[] = [];
    for (const p of puntos) {
      out.push({
        id: p.id,
        lat: p.lat,
        lng: p.lng,
        color: p.color,
        size: p.tamano,
        alt: 0.03,
        labelTag: capa.nombre,
        label: p.etiqueta,
        ring: capa.puntos === "acontecimientos",
        ringMax: 3,
        onClick: () => {
          volar(p.lat, p.lng, 0.9);
          if (p.href) {
            // los teatros vivos llevan puerta: se abre dentro de Vanguard
            window.open(p.href, "_self");
          }
        },
      });
    }
    for (const h of hitos) {
      out.push({
        id: `h-${h.id}`,
        lat: h.lat,
        lng: h.lng,
        color: COLOR_HITO[h.tipo],
        size: 0.34,
        alt: 0.02,
        labelTag: h.tipo.toUpperCase(),
        label: h.nombre,
        onClick: () => volar(h.lat, h.lng, 0.8),
      });
    }
    for (const g of guardados) {
      out.push({
        id: `g-${g.id}`,
        lat: g.lat,
        lng: g.lng,
        color: "#FFD166",
        size: 0.5,
        alt: 0.05,
        labelTag: "GUARDADO",
        label: g.nombre,
        onClick: () => volar(g.lat, g.lng, 0.7),
      });
    }
    medida.forEach((m, i) => {
      out.push({
        id: `m-${m.id}`,
        lat: m.lat,
        lng: m.lng,
        color: "#FF7A52",
        size: 0.5,
        alt: 0.04,
        labelTag: "MEDIDA",
        label: i === 0 ? "punto A" : "punto B",
        onClick: () => volar(m.lat, m.lng, 0.8),
      });
    });
    return out;
  }, [puntos, hitos, guardados, medida, volar, capa.nombre]);

  // ── medición: dos toques y la casa dice los kilómetros ─────────────
  const distancia = medida.length === 2 ? distanciaKm(medida[0].lat, medida[0].lng, medida[1].lat, medida[1].lng) : null;

  const alClicGlobo = useCallback(
    (lat: number, lng: number) => {
      setPunto({ lat, lng });
      if (medir) {
        setMedida((prev) => {
          if (prev.length >= 2) return [{ id: Date.now(), lat, lng }];
          return [...prev, { id: Date.now(), lat, lng }];
        });
        return;
      }
      volar(lat, lng, Math.max(0.5, ALTURAS[indiceAltura] * 0.6));
      setSeleccion(null);
    },
    [medir, indiceAltura, volar],
  );

  const alClicPais = useCallback(
    (num: string) => {
      const pais = POR_NUM.get(num) ?? null;
      if (pais) {
        setSeleccion(pais);
        volar(pais.lat, pais.lng, 0.8);
        setGiro(false);
      }
    },
    [volar],
  );

  const elegirDeBusqueda = useCallback(
    (p: PaisGeo) => {
      setConsulta("");
      setSeleccion(p);
      volar(p.lat, p.lng, 0.7);
    },
    [volar],
  );

  const cambiarAltura = useCallback((delta: number) => {
    setIndiceAltura((i) => {
      const n = Math.max(0, Math.min(ALTURAS.length - 1, i + delta));
      nonceZoom.current += 1;
      setZoom({ altitude: ALTURAS[n], nonce: nonceZoom.current });
      return n;
    });
  }, []);

  const volverAlPlaneta = useCallback(() => {
    setSeleccion(null);
    setIndiceAltura(3);
    nonceZoom.current += 1;
    setZoom({ altitude: ALTURAS[3], nonce: nonceZoom.current });
    volar(20, 0, ALTURAS[3]);
  }, [volar]);

  const irAComparar = useCallback((iso3: string) => {
    setComparacion((c) => ({ ...c, a: iso3 }));
    setSub("comparar");
  }, []);

  return (
    <section className="earth" aria-label="VANGUARD EARTH SYSTEM — explorador geográfico">
      {/* ── las cinco salas del sistema ─────────────────────────────── */}
      <nav className="earth-subnav" aria-label="Vistas del sistema">
        {(
          [
            ["explorar", t("earth.explorar"), Globe2],
            ["lugares", t("earth.lugares"), Bookmark],
            ["recorridos", t("earth.recorridos"), Route],
            ["comparar", t("earth.comparar"), GitCompareArrows],
            ["historia", t("earth.historia"), History],
          ] as const
        ).map(([id, etiqueta, Icono]) => (
          <button
            key={id}
            type="button"
            className={sub === id ? "on" : ""}
            onClick={() => setSub(id)}
            aria-pressed={sub === id}
          >
            <Icono className="w-3.5 h-3.5" aria-hidden />
            {etiqueta}
          </button>
        ))}
        <span className="earth-modo" title="En un aparato de baja potencia el sistema entra solo en vista plana">
          {t(equipoBajo ? "earth.modoBajo" : "earth.modoCompleto")}
        </span>
      </nav>

      {sub === "explorar" && (
        <>
          {/* ── la tira de capas ──────────────────────────────────── */}
          <div className="earth-capas" role="tablist" aria-label="Capas del planeta">
            {CAPAS_EARTH.map((c) => (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={c.id === capaId}
                className={c.id === capaId ? "on" : ""}
                onClick={() => setCapaId(c.id)}
              >
                <b>{c.nombre}</b>
                <span>{c.hitos.length > 0 ? `${c.hitos.length} hitos` : c.puntos ? "puntos" : c.regiones ? `${PAISES_GEO.length} países` : c.bordes ? "trazado" : "textura"}</span>
              </button>
            ))}
          </div>

          {/* ── el planeta ────────────────────────────────────────── */}
          <div className="earth-marco">
            {vista === "3d" ? (
              <GlobeMap3D
                height="min(62vh, 600px)"
                minHeight={320}
                ariaLabel={`Planeta 3D — ${capa.nombre}`}
                viewMode={capa.viewMode}
                autoRotate={giro && !ligero}
                rotateSpeed={0.32}
                markers={marcadores}
                flyTo={vuelo}
                zoom={zoom}
                countryColors={capa.regiones ? COLORES_REGION : null}
                bordes={capa.bordes}
                graticulas={capa.bordes}
                onCountryClick={alClicPais}
                onGlobeClick={alClicGlobo}
                dimColor={capa.viewMode === "satelite" ? "rgba(148,163,205,0.05)" : "rgba(148,163,205,0.10)"}
              />
            ) : (
              <MapaAtlas2D
                colores={capa.regiones ? COLORES_REGION : null}
                hitos={hitos}
                puntos={puntos.map((p) => ({ id: p.id, nombre: p.nombre, lat: p.lat, lng: p.lng, color: p.color, tamano: p.tamano }))}
                seleccionado={seleccion?.num ?? null}
                graticula={capa.bordes}
                onCountryClick={alClicPais}
                onPuntoClick={(p) => volar(p.lat, p.lng, 0.9)}
                altura={440}
                ariaLabel={`Atlas 2D — ${capa.nombre}`}
              />
            )}

            {/* mandos */}
            <div className="earth-mandos" role="group" aria-label="Controles del planeta">
              <button type="button" onClick={() => cambiarAltura(-1)} aria-label="Acercar" title="Acercar">
                <Plus className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => cambiarAltura(1)} aria-label="Alejar" title="Alejar">
                <Minus className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => setGiro((g) => !g)} aria-pressed={giro} aria-label="Girar solo" title="Girar solo">
                <RotateCcw className="w-4 h-4" />
              </button>
              <button type="button" onClick={volverAlPlaneta} aria-label="Volver al planeta entero" title="Volver al planeta entero">
                <Home className="w-4 h-4" />
              </button>
              <button
                type="button"
                className={medir ? "on" : ""}
                onClick={() => {
                  setMedir((m) => !m);
                  setMedida([]);
                }}
                aria-pressed={medir}
                aria-label="Medir distancia entre dos puntos"
                title="Medir distancia entre dos puntos"
              >
                <Ruler className="w-4 h-4" />
              </button>
              <button
                type="button"
                className={vista === "2d" ? "on" : ""}
                onClick={() => setVista((v) => (v === "3d" ? "2d" : "3d"))}
                aria-label="Cambiar entre planeta 3D y atlas 2D"
                title="Cambiar entre planeta 3D y atlas 2D"
              >
                {vista === "3d" ? <MapIcon className="w-4 h-4" /> : <Globe2 className="w-4 h-4" />}
              </button>
              <button
                type="button"
                className={ligero ? "on" : ""}
                onClick={() => setLigero((l) => !l)}
                aria-pressed={ligero}
                aria-label="Modo ligero: menos marcadores y sin giro automático"
                title="Modo ligero: menos marcadores y sin giro automático"
              >
                <Layers className="w-4 h-4" />
              </button>
            </div>

            {/* el buscador */}
            <div className="earth-buscador">
              <Search className="w-3.5 h-3.5" aria-hidden />
              <input
                type="search"
                value={consulta}
                onChange={(e) => setConsulta(e.target.value)}
                placeholder={t("earth.buscar")}
                aria-label={t("earth.buscar")}
                spellCheck={false}
              />
              {resultados.length > 0 && (
                <ul>
                  {resultados.map((p) => (
                    <li key={p.iso3}>
                      <button type="button" onClick={() => elegirDeBusqueda(p)}>
                        <b>{p.nombre}</b>
                        <span>{`${regionEnEspanol(p.region)}${p.subregion ? ` · ${p.subregion}` : ""}`}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* la lectura del último toque: coordenadas */}
            {punto && (
              <div className="earth-coordenadas" aria-live="polite">
                <Crosshair className="w-3 h-3" aria-hidden />
                {`${punto.lat.toFixed(3)}°, ${punto.lng.toFixed(3)}°`}
                {medir && <span>{`· toca un ${medida.length === 0 ? "primer" : "segundo"} punto`}</span>}
                {distancia !== null && <strong>{`${distancia.toLocaleString("es-ES", { maximumFractionDigits: 0 })} km`}</strong>}
              </div>
            )}

            {medir && medida.length > 0 && (
              <button type="button" className="earth-medida-limpiar" onClick={() => setMedida([])}>
                <Trash2 className="w-3 h-3" /> borrar medición
              </button>
            )}
          </div>

          {/* ── la capa, explicada ────────────────────────────────── */}
          <div className="earth-capa-nota">
            <h3>{capa.nombre}</h3>
            <p>{capa.volanta}</p>
            {capa.regiones && (
              <div className="earth-leyenda">
                {LEYENDA_REGION.map((r) => (
                  <span key={r.clave}>
                    <i style={{ background: r.color }} aria-hidden />
                    {r.etiqueta}
                  </span>
                ))}
              </div>
            )}
            {capa.hitos.length > 0 && (
              <div className="earth-leyenda">
                {capa.hitos.map((t) => (
                  <span key={t}>
                    <i style={{ background: COLOR_HITO[t] }} aria-hidden />
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ── la ficha del país ─────────────────────────────────── */}
          {ficha ? (
            <article className="earth-ficha" aria-live="polite">
              <header>
                <span className="mono">{`${ficha.iso3} · ${ficha.iso2.toUpperCase()}`}</span>
                <h3>{ficha.nombre}</h3>
                <p>{`${regionEnEspanol(ficha.region)}${ficha.subregion ? ` · ${ficha.subregion}` : ""} · ${ficha.lat.toFixed(2)}°, ${ficha.lng.toFixed(2)}°`}</p>
              </header>
              <dl>
                <div>
                  <dt>capital</dt>
                  <dd>{ficha.atlas?.capital ?? "sin dato"}</dd>
                </div>
                <div>
                  <dt>población</dt>
                  <dd>{ficha.poblacion === null ? "sin dato" : ficha.poblacion.toLocaleString("es-ES")}</dd>
                </div>
                <div>
                  <dt>superficie</dt>
                  <dd>{ficha.superficie === null ? "sin dato" : `${ficha.superficie.toLocaleString("es-ES")} km²`}</dd>
                </div>
                <div>
                  <dt>densidad</dt>
                  <dd>{ficha.densidad === null ? "sin dato" : `${ficha.densidad.toLocaleString("es-ES", { maximumFractionDigits: 1 })} hab/km²`}</dd>
                </div>
                <div>
                  <dt>moneda</dt>
                  <dd>{ficha.moneda ? `${ficha.moneda.nombre} (${ficha.moneda.codigo})` : "sin dato"}</dd>
                </div>
                <div>
                  <dt>gasto militar</dt>
                  <dd>
                    {ficha.militar
                      ? `US$ ${(ficha.militar.gasto / 1e9).toLocaleString("es-ES", { maximumFractionDigits: 1 })} mil M · ${ficha.militar.puesto}/${ficha.militar.de}`
                      : "sin dato"}
                  </dd>
                </div>
              </dl>
              <div className="earth-ficha-acciones">
                <button type="button" onClick={() => volar(ficha.lat, ficha.lng, 0.55)}>
                  acercar
                </button>
                <button type="button" onClick={() => guardar(ficha.lat, ficha.lng, ficha.nombre)}>
                  <Bookmark className="w-3 h-3" /> guardar
                </button>
                <button type="button" onClick={() => irAComparar(ficha.iso3)}>
                  <GitCompareArrows className="w-3 h-3" /> comparar
                </button>
                <Link href={`/mundos/${ficha.iso2}`}>ficha completa</Link>
                <Link href="/atlas">al atlas</Link>
              </div>
            </article>
          ) : (
            <p className="earth-vacio">
              Toca un país en el planeta —o búscalo arriba— y aquí aparecerá su ficha geográfica: capital, población,
              superficie, moneda y gasto, con la puerta a su ficha completa.
            </p>
          )}

          {/* ── lugares guardados ─────────────────────────────────── */}
          {guardados.length > 0 && (
            <div className="earth-guardados">
              <h4>
                <Bookmark className="w-3.5 h-3.5" aria-hidden /> tus lugares guardados · {guardados.length}
              </h4>
              <ul>
                {guardados.map((g) => (
                  <li key={g.id}>
                    <button type="button" onClick={() => volar(g.lat, g.lng, 0.7)}>
                      <b>{g.nombre}</b>
                      <span>{`${g.lat.toFixed(2)}°, ${g.lng.toFixed(2)}°`}</span>
                    </button>
                    <button type="button" className="earth-quitar" onClick={() => quitarGuardado(g.id)} aria-label={`Quitar ${g.nombre}`}>
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {sub === "lugares" && (
        <PanelLugares onVolar={volarCb} onGuardar={(lat, lng, nombre) => guardar(lat, lng, nombre)} />
      )}
      {sub === "recorridos" && <Recorridos onVolar={volarCb} />}
      {sub === "comparar" && (
        <ComparadorTerritorial
          onVolar={volarCb}
          inicialA={comparacion.a}
          inicialB={comparacion.b}
        />
      )}
      {sub === "historia" && <HistoriaCapa onVolar={volarCb} />}

      <p className="earth-pie-general">
        {`${PAISES_GEO.length} países con identidad ISO · ${HITOS.length} hitos geográficos · ${LUGARES.length} lugares vigilados · ${CRONICAS.length} recorridos guiados · ${PUNTOS_HISTORICOS.length} guerras del archivo · fuentes: Natural Earth, ISO 3166-1, Banco Mundial, game-data y el censo de la casa`}
      </p>
    </section>
  );
}
