"use client";

// ═══════════════════════════════════════════════════════════════════
// v405.9 · EL CENTRO DE MAPAS — un solo planeta, ocho capas, cero mapas falsos.
//
// LO QUE NO HACE: no crea un motor nuevo. Usa el globo de la casa
// (`GlobeMap3D`, el de /mundo, /atlas y los paneles) al que se le añadió —sin
// romper nada— el pintado POR PAÍS. Aquí solo viven los mandos: capas,
// buscador, zoom, giro, selección y la ficha del país.
//
// NAVEGACIÓN: arrastrar gira, la rueda acerca, doble toque acerca en móvil.
// Además hay botones (acercar · alejar · cenar) y el buscador vuela al país.
// ═══════════════════════════════════════════════════════════════════
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import type { Globe3DMarker, GlobeFlyTo } from "./globe-map-3d";

// El globo entra SOLO en el navegador: three.js y globe.gl tocan `window` al
// cargarse, así que si /mapas se prerenderiza en el build el proceso revienta.
// Es el mismo patrón que /mundo (mundo-3d-vivo.tsx) y capas-globales.tsx.
const GlobeMap3D = dynamic(
  () => import("./globe-map-3d").then((m) => m.GlobeMap3D),
  {
    ssr: false,
    loading: () => (
      <div
        style={{ height: "min(58vh, 520px)", minHeight: 300, display: "grid", placeItems: "center" }}
      >
        <p data-vg-anim-inline="si" className="vx-mapas-pie" style={{ animation: "pulse 1.6s ease-in-out infinite" }}>
          DESPLEGANDO EL PLANETA…
        </p>
      </div>
    ),
  },
);
import { buscarPaises, normalizar, POR_ISO3, type PaisGeo } from "@/lib/geo-paises";
import type { CapaCliente, FichaPais, PayloadMapas } from "@/lib/mapas-payload";

/** Los puntos de una capa, resueltos al formato del globo. */
type PuntoCapa = { id: string; nombre: string; lat: number; lng: number; color: string; tamano: number; etiqueta: string; href?: string; epoca?: string; desde?: number; hasta?: number };

export interface CentroMapasProps {
  payload: PayloadMapas;
  /** los países tocados por cada acontecimiento (id numérico) */
  paisesPorAcontecimiento: Record<string, string[]>;
}

const ALTURAS = [2.6, 2.2, 1.8, 1.5, 1.2, 0.9, 0.65, 0.45] as const;

export function CentroMapas({ payload, paisesPorAcontecimiento }: CentroMapasProps) {
  const [capaId, setCapaId] = useState<string>("economico");
  const [consulta, setConsulta] = useState("");
  const [seleccion, setSeleccion] = useState<string | null>(null); // num ISO
  const [indiceAltura, setIndiceAltura] = useState(3);
  const [giro, setGiro] = useState(false);
  const [vuelo, setVuelo] = useState<GlobeFlyTo | null>(null);
  const [zoom, setZoom] = useState<{ altitude: number; nonce: number } | null>(null);
  const nonceZoom = useRef(0);
  const [era, setEra] = useState<string | null>(null);
  const [acontecimientoActivo, setAcontecimientoActivo] = useState<string | null>(null);
  const nonce = useRef(0);

  const capa = useMemo(() => payload.capas.find((c) => c.id === capaId) ?? payload.capas[0], [payload.capas, capaId]);
  const ficha = seleccion ? payload.fichas[seleccion] ?? null : null;

  const resultados = useMemo(() => (consulta.trim().length >= 2 ? buscarPaises(consulta, 6) : []), [consulta]);

  const volar = useCallback((lat: number, lng: number, altura = 1.1) => {
    nonce.current += 1;
    setVuelo({ lat, lng, altitude: altura, nonce: nonce.current });
  }, []);

  // ── los puntos que se encienden con la capa activa ────────────────
  const puntos: PuntoCapa[] = useMemo(() => {
    if (capa.tipo === "puntos" && capa.id === "historico") {
      return payload.historicos.filter((p) => !era || p.epoca === era);
    }
    if (capa.tipo === "puntos" && capa.id === "acontecimientos") {
      return payload.acontecimientos;
    }
    // en las capas de datos, los países con acontecimiento siguen latiendo
    return payload.acontecimientos.map((p) => ({ ...p, tamano: 0.22 }));
  }, [capa, era, payload.historicos, payload.acontecimientos]);

  const marcadores: Globe3DMarker[] = useMemo(
    () =>
      puntos.map((p) => ({
        id: p.id,
        lat: p.lat,
        lng: p.lng,
        color: p.color,
        size: p.tamano,
        alt: 0.02,
        labelTag: capa.id === "historico" ? "GUERRA DEL ARCHIVO" : "TEATRO VIVO",
        label: p.etiqueta,
        ring: capa.id === "acontecimientos",
        ringMax: 3,
        onClick: () => {
          if (capa.id === "historico") {
            setSeleccion(null);
            volar(p.lat, p.lng, 0.9);
            return;
          }
          setAcontecimientoActivo(p.id);
          volar(p.lat, p.lng, 0.9);
        },
      })),
    [puntos, capa.id, volar],
  );

  // ── el color por país de la capa activa (+ los países del acontecimiento) ──
  const colores = useMemo(() => {
    if (acontecimientoActivo) {
      const nums = paisesPorAcontecimiento[acontecimientoActivo] ?? [];
      const out: Record<string, string> = { ...capa.colores };
      for (const n of nums) out[n] = "rgba(255,77,94,0.88)";
      return out;
    }
    return capa.colores;
  }, [capa.colores, acontecimientoActivo, paisesPorAcontecimiento]);

  const valores = capa.valores;

  const alElegirPais = useCallback(
    (num: string) => {
      setSeleccion(num);
      const f = payload.fichas[num];
      if (f) {
        volar(f.lat, f.lng, 0.8);
        setGiro(false);
      }
    },
    [payload.fichas, volar],
  );

  const alClicGlobo = useCallback((isoNum: string) => {
    if (isoNum) alElegirPais(isoNum);
  }, [alElegirPais]);

  return (
    <section className="vx-mapas" aria-label="Centro de exploración geográfica">
      {/* ── la tira de capas ─────────────────────────────────────── */}
      <div className="vx-capas" role="tablist" aria-label="Capas del planeta">
        {payload.capas.map((c) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={c.id === capa.id}
            className="vx-capa"
            onClick={() => {
              setCapaId(c.id);
              setAcontecimientoActivo(null);
            }}
          >
            <b>{c.nombre.replace("MAPA ", "")}</b>
            <span>{c.tipo === "coropleta" ? `${c.cobertura.conPoligono} países` : c.tipo === "puntos" ? "puntos" : c.tipo === "textura" ? "textura" : `${c.categorias?.length ?? 0} bloques`}</span>
          </button>
        ))}
      </div>

      {/* ── el planeta ───────────────────────────────────────────── */}
      <div className="vx-mapa-marco">
        <GlobeMap3D
          height="min(64vh, 620px)"
          minHeight={320}
          ariaLabel={`Planeta 3D — ${capa.nombre}`}
          viewMode={capa.textura ?? (capa.id === "fisico" ? "satelite" : "oscuridad")}
          autoRotate={giro}
          rotateSpeed={0.35}
          markers={marcadores}
          flyTo={vuelo}
          zoom={zoom}
          countryColors={Object.keys(colores).length > 0 ? colores : null}
          countryValores={Object.keys(valores).length > 0 ? valores : null}
          onCountryClick={alClicGlobo}
          onGlobeClick={(lat, lng) => {
            // tocar el planeta vuela a ese punto: navegación sin buscar el nombre
            volar(lat, lng, Math.max(0.5, ALTURAS[indiceAltura] * 0.6));
            setSeleccion(null);
          }}
          dimColor={capa.tipo === "textura" ? "rgba(255,255,255,0.02)" : "rgba(148,163,205,0.10)"}
        />

        {/* mandos flotantes: zoom, giro, cenar */}
        <div className="vx-zoom" role="group" aria-label="Controles del planeta">
          <button
            type="button"
            onClick={() => {
              const i = Math.max(0, indiceAltura - 1);
              setIndiceAltura(i);
              nonceZoom.current += 1;
              setZoom({ altitude: ALTURAS[i], nonce: nonceZoom.current });
            }}
            aria-label="Acercar"
            title="Acercar"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => {
              const i = Math.min(ALTURAS.length - 1, indiceAltura + 1);
              setIndiceAltura(i);
              nonceZoom.current += 1;
              setZoom({ altitude: ALTURAS[i], nonce: nonceZoom.current });
            }}
            aria-label="Alejar"
            title="Alejar"
          >
            −
          </button>
          <button
            type="button"
            onClick={() => {
              setGiro((g) => !g);
            }}
            aria-pressed={giro}
            aria-label="Girar solo"
            title="Girar solo"
          >
            ↻
          </button>
          <button
            type="button"
            onClick={() => {
              setSeleccion(null);
              setAcontecimientoActivo(null);
              setIndiceAltura(3);
              nonceZoom.current += 1;
              setZoom({ altitude: ALTURAS[3], nonce: nonceZoom.current });
              volar(20, 0, ALTURAS[3]);
            }}
            aria-label="Volver al planeta entero"
            title="Volver al planeta entero"
          >
            ⌂
          </button>
        </div>

        {/* el buscador: vuela al país */}
        <div className="vx-buscador-mapa">
          <input
            type="search"
            value={consulta}
            onChange={(e) => setConsulta(e.target.value)}
            placeholder="Buscar un país…"
            aria-label="Buscar un país en el planeta"
            spellCheck={false}
          />
          {resultados.length > 0 && (
            <ul>
              {resultados.map((p: PaisGeo) => (
                <li key={p.iso3}>
                  <button
                    type="button"
                    onClick={() => {
                      setConsulta("");
                      volar(p.lat, p.lng, 0.7);
                      const num = [...Object.entries(payload.fichas)].find(([, f]) => f.iso3 === p.iso3)?.[0];
                      if (num) setSeleccion(num);
                      else setSeleccion(null);
                    }}
                  >
                    <b>{p.nombre}</b>
                    <span>{`${p.region}${p.subregion ? ` · ${p.subregion}` : ""}`}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* la escala de la capa */}
        {capa.escala && (
          <div className="vx-escala" aria-label={`Escala de ${capa.nombre}`}>
            <span>{capa.escala.minTexto}</span>
            <i aria-hidden />
            <span>{capa.escala.maxTexto}</span>
            <em>{capa.escala.unidad}</em>
          </div>
        )}
        {capa.tipo === "textura" && <div className="vx-escala"><em>{capa.fuente}</em></div>}
      </div>

      {/* ── la capa, explicada con su fuente ─────────────────────── */}
      <div className="vx-capa-nota">
        <h3>{capa.nombre}</h3>
        <p>{capa.pregunta}</p>
        <small>
          {`fuente: ${capa.fuente}`}
          {capa.tipo === "coropleta" ? ` · ${capa.cobertura.conPoligono} de ${capa.cobertura.conDato} países con polígono propio` : ""}
        </small>
      </div>

      {/* ── filtros de las capas de puntos ───────────────────────── */}
      {capa.id === "historico" && (
        <div className="vx-filtros" role="group" aria-label="Época de la guerra">
          <button type="button" aria-pressed={era === null} onClick={() => setEra(null)}>
            todas
          </button>
          {payload.epocasHistoricas.map((e) => (
            <button key={e.clave} type="button" aria-pressed={era === e.clave} onClick={() => setEra(e.clave)}>
              {e.etiqueta}
            </button>
          ))}
        </div>
      )}

      {/* ── la ficha del país elegido ────────────────────────────── */}
      {ficha ? (
        <article className="vx-pais-ficha" aria-live="polite">
          <header>
            <span className="mono">{`${ficha.iso3} · ${ficha.iso2.toUpperCase()}`}</span>
            <h3>{ficha.nombre}</h3>
            <p>{`${ficha.region}${ficha.subregion ? ` · ${ficha.subregion}` : ""} · ${ficha.lat.toFixed(2)}°, ${ficha.lng.toFixed(2)}°`}</p>
          </header>

          <dl>
            {payload.capas
              .filter((c) => ficha.valores[c.id])
              .map((c) => (
                <div key={c.id}>
                  <dt>{c.nombre.replace("MAPA ", "")}</dt>
                  <dd>{ficha.valores[c.id]}</dd>
                </div>
              ))}
            {Object.keys(ficha.valores).length === 0 && (
              <div>
                <dt>datos</dt>
                <dd>este país no aparece todavía en las fuentes de la casa — se declara, no se inventa</dd>
              </div>
            )}
          </dl>

          {ficha.acontecimientos.length > 0 && (
            <div className="vx-pais-acon">
              <h4>acontecimientos en el núcleo</h4>
              <ul>
                {ficha.acontecimientos.map((a) => (
                  <li key={a.slug}>
                    <Link href={a.href}>{a.titulo}</Link>
                    <span>{a.estado}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="vx-pais-acciones">
            <button type="button" onClick={() => volar(ficha.lat, ficha.lng, 0.55)}>
              acercar
            </button>
            <Link href={`/poder`}>ver su gasto en /poder</Link>
            <Link href={`/atlas`}>ver su ficha en /atlas</Link>
          </div>
        </article>
      ) : (
        <p className="vx-pais-vacio">
          Toca un país en el planeta (o búscalo arriba) y aquí aparecerá su ficha: sus datos reales en cada capa
          y los acontecimientos del núcleo que lo tocan.
        </p>
      )}

      {/* ── el acontecimiento elegido ───────────────────────────── */}
      {acontecimientoActivo && (
        <article className="vx-acon-ficha" aria-live="polite">
          {(() => {
            const a = payload.acontecimientos.find((p) => p.id === acontecimientoActivo);
            if (!a) return null;
            const paises = (paisesPorAcontecimiento[a.id] ?? [])
              .map((n) => payload.fichas[n]?.nombre)
              .filter(Boolean);
            return (
              <>
                <header>
                  <span className="mono">{a.epoca?.toUpperCase() ?? "TEATRO"}</span>
                  <h3>{a.nombre}</h3>
                </header>
                <p>{a.etiqueta}</p>
                {paises.length > 0 && <p className="vx-acon-paises">{`países implicados: ${paises.join(" · ")}`}</p>}
                <button type="button" onClick={() => setAcontecimientoActivo(null)}>
                  apagar el resaltado
                </button>
              </>
            );
          })()}
        </article>
      )}

      {/* ── la carrera del buscador: países por nombre, sin acentos ── */}
      <p className="vx-mapas-pie">
        {`${payload.totales.paises} países con identidad ISO · ${payload.totales.guerras} guerras del archivo · ${payload.totales.acontecimientos} acontecimientos vivos · ${payload.totales.conMoneda} monedas · ${payload.totales.conGasto} países con gasto militar medido`}
      </p>
    </section>
  );
}

/** El buscador de países suelto, para otras salas (no duplica el del mapa). */
export function normalizarConsulta(t: string) {
  return normalizar(t);
}

export function paisPorIso3(iso3: string) {
  return POR_ISO3.get(iso3) ?? null;
}
