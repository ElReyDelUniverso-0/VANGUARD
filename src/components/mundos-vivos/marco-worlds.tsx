"use client";

// ═══════════════════════════════════════════════════════════════════
// v422.3 VANGUARD WORLDS — EL MARCO DEL MUNDO VIVO
//
// LO QUE NO HACE: no crea un motor nuevo. Reutiliza el globo de la casa
// (GlobeMap3D, el de /mapas y /mundo) y las capas declaradas del Centro
// de Mapas. Aquí viven los mandos del mundo: los mundos (zonas), los
// lugares, las capas, el buscador, la vista plana y las transiciones.
//
// TRES VISTAS, TRES TRANSICIONES:
//  · MUNDO  — el planeta con todos los mundos marcados
//  · ZONA   — vuelo al mundo, sus lugares grandes, los demás a escala
//  · LUGAR  — la ficha del lugar con sus experiencias reales de Vanguard
//
// NAVEGACIÓN: arrastra gira, la rueda acerca, toque trabalha en móvil
// (globe.gl lo soporta nativo). Barra de contexto (Mundo → Zona →
// Lugar) con volver y hint de Esc. Rail izquierdo = mundos, rail
// derecho = lugares o la ficha. Todo el chrome viaja en i18n.
//
// RENDIMIENTO: el globo entra SOLO en el navegador (dynamic ssr:false,
// patrón de la casa); si no hay WebGL o el visitante elige «plano»,
// se despliega la alternativa 2D dibujada en código (SVG) con las
// fronteras reales de país (Natural Earth 110m, la misma fuente del
// Atlas de la casa). El giro automático se detiene con
// prefers-reduced-motion (ley de la casa).
// ═══════════════════════════════════════════════════════════════════

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { useT } from "@/lib/i18n";
import { CATEGORIA_MUNDOS, type PoiMundo, type ZonaMundo } from "@/lib/mundos-vivos/tipos";
import { COUNTRY_FEATURES } from "@/lib/world-geo";
import { geoGraticule10, geoNaturalEarth1, geoPath } from "d3-geo";
import type { CapaCliente } from "@/lib/mapas-payload";

// El globo toca `window` al cargarse: entra SOLO en el navegador, como
// en /mapas y /mundo. La alternativa 2D se despliega antes de que llegue.
const GlobeMap3D = dynamic(
  () => import("@/components/vanguard/globe-map-3d").then((m) => m.GlobeMap3D),
  {
    ssr: false,
    loading: () => (
      <div className="vx-worlds-carga">
        <span className="vx-worlds-carga-punto" />
        <span className="vx-worlds-carga-punto" style={{ animationDelay: "0.2s" }} />
        <span className="vx-worlds-carga-punto" style={{ animationDelay: "0.4s" }} />
      </div>
    ),
  },
);

export interface MarcoWorldsProps {
  payload: {
    zonas: ZonaMundo[];
    cifras: { zonas: number; lugares: number; experiencias: number };
    capas: CapaCliente[];
  };
}

/** Bandera emoji a partir del ISO2 (símbolos regional-indicator, en código). */
function bandera(iso2: string): string {
  const c = iso2.toUpperCase();
  if (c.length !== 2 || !/^[A-Z]{2}$/.test(c)) return "🏳️";
  const cp = (ch: string) => 0x1f1e6 + (ch.charCodeAt(0) - 65);
  return String.fromCodePoint(cp(c[0]), cp(c[1]));
}

/** Detección de WebGL: la alternativa 2D es la ley cuando no hay motor. */
function usoWebgl(): boolean {
  try {
    if (typeof document === "undefined") return true; // SSR: el cliente decide
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
  } catch {
    return false;
  }
}

/** prefers-reduced-motion: el giro y las transiciones se detienen. */
function motionReducido(): boolean {
  try {
    return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

export function MarcoWorlds({ payload }: MarcoWorldsProps) {
  const { t } = useT();
  const { zonas, cifras, capas } = payload;

  const [zonaId, setZonaId] = useState<string | null>(null);
  const [lugarId, setLugarId] = useState<string | null>(null);
  const [capaId, setCapaId] = useState<string>(capas[0]?.id ?? "");
  const [consulta, setConsulta] = useState("");
  const [giro, setGiro] = useState(false);
  const [plano, setPlano] = useState(false); // el visitante elige la vista 2D
  const [webgl, setWebgl] = useState(true);
  const [abiertas, setAbiertas] = useState({ zones: true, layers: false });
  const [pantalla, setPantalla] = useState(false); // pantalla completa del escenario

  const nonceVuelo = useRef(0);
  const [vuelo, setVuelo] = useState<{ lat: number; lng: number; altitude: number; nonce: number } | null>(null);
  const nonceZoom = useRef(0);
  const [zoom, setZoom] = useState<{ altitude: number; nonce: number } | null>(null);
  // escalera de altitudes: el mismo ladder del Centro de Mapas
  const ALTURAS = [2.4, 2.0, 1.6, 1.3, 1.0, 0.8, 0.65, 0.5] as const;
  const [indiceAltura, setIndiceAltura] = useState(3);

  const [reducido, setReducido] = useState(false);
  const escenarioRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setWebgl(usoWebgl());
    setReducido(motionReducido());
  }, []);

  // móvil: los rails empiezan colapsados (la pantalla no los soporta todos)
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth <= 900) {
      setAbiertas((a) => ({ ...a, zones: false }));
    }
  }, []);

  // ESC vuelve un paso: lugar → zona → mundo.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (document.fullscreenElement) {
        void document.exitFullscreen().catch(() => {});
        return;
      }
      if (lugarId) setLugarId(null);
      else if (zonaId) setZonaId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lugarId, zonaId]);

  // pantalla completa: seguir el estado real del navegador
  useEffect(() => {
    const onFs = () => setPantalla(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const zona = useMemo(() => zonas.find((z) => z.id === zonaId) ?? null, [zonas, zonaId]);
  const lugaresZona = useMemo(() => zona?.lugares ?? [], [zona]);
  const lugar = useMemo(() => {
    if (!lugarId) return null;
    return zonas.flatMap((z) => z.lugares).find((l) => l.id === lugarId) ?? null;
  }, [zonas, lugarId]);

  const capa = useMemo(() => capas.find((c) => c.id === capaId) ?? capas[0] ?? null, [capas, capaId]);

  const volar = useCallback((lat: number, lng: number, altitud: number) => {
    nonceVuelo.current += 1;
    setVuelo({ lat, lng, altitude: altitud, nonce: nonceVuelo.current });
  }, []);

  const entrarZona = useCallback(
    (z: ZonaMundo) => {
      setZonaId(z.id);
      setLugarId(null);
      volar(z.centro.lat, z.centro.lng, z.centro.altitud);
    },
    [volar],
  );

  const salirZona = useCallback(() => {
    setZonaId(null);
    setLugarId(null);
    nonceVuelo.current += 1;
    setVuelo({ lat: 20, lng: 0, altitude: 1.5, nonce: nonceVuelo.current });
  }, []);

  const abrirLugar = useCallback(
    (p: PoiMundo) => {
      setLugarId(p.id);
      volar(p.lat, p.lng, 0.85);
    },
    [volar],
  );

  // reiniciar la vista: vuelve a volar al estado actual (lugar > zona > mundo)
  const reiniciarVista = useCallback(() => {
    if (lugar) {
      volar(lugar.lat, lugar.lng, 0.85);
    } else if (zona) {
      volar(zona.centro.lat, zona.centro.lng, zona.centro.altitud);
    } else {
      nonceVuelo.current += 1;
      setVuelo({ lat: 20, lng: 0, altitude: 1.5, nonce: nonceVuelo.current });
    }
  }, [lugar, zona, volar]);

  const togglePantalla = useCallback(() => {
    const el = escenarioRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => {});
    } else {
      void el.requestFullscreen?.().catch(() => {});
    }
  }, []);

  const marcadores = useMemo(() => {
    const todo = zonas.flatMap((z) =>
      z.lugares.map((p) => ({
        id: p.id,
        nombre: p.nombre,
        lat: p.lat,
        lng: p.lng,
        color: z.acento,
        alt: 0.02,
        // LOD: el mundo activo se ve grande, con brillo y nombre; los demás, a escala
        size: zonaId === z.id ? 0.3 : 0.14,
        label: zonaId === z.id ? p.nombre : undefined,
        labelTag: zonaId === z.id ? z.nombre : undefined,
        ring: zonaId === z.id,
        ringMax: 3,
        onClick: () => abrirLugar(p),
      })),
    );
    return todo;
  }, [zonas, zonaId, abrirLugar]);

  // coincide con: nombre del lugar, país, ISO2 o la experiencia que linkea
  const lugaresCoinciden = useCallback((p: PoiMundo, q: string) => {
    if (p.nombre.toLowerCase().includes(q)) return true;
    if (p.pais.nombre.toLowerCase().includes(q)) return true;
    if (p.pais.iso2.toLowerCase().includes(q)) return true;
    return p.experiencias.some(
      (e) => e.etiqueta.toLowerCase().includes(q) || e.ruta.toLowerCase().includes(q),
    );
  }, []);

  const resultados = useMemo(() => {
    const q = consulta.trim().toLowerCase();
    const base = lugar ? [] : lugaresZona;
    if (q.length < 2) return base;
    return base.filter((p) => lugaresCoinciden(p, q));
  }, [consulta, lugaresZona, lugar, lugaresCoinciden]);

  const todosLosLugares = useMemo(() => zonas.flatMap((z) => z.lugares), [zonas]);
  const lugaresBusqueda = useMemo(() => {
    const q = consulta.trim().toLowerCase();
    if (q.length < 2) return [];
    return todosLosLugares.filter((p) => lugaresCoinciden(p, q));
  }, [consulta, todosLosLugares, lugaresCoinciden]);

  const mundoDeLugar = useCallback(
    (pid: string) => zonas.find((z) => z.lugares.some((l) => l.id === pid)) ?? null,
    [zonas],
  );

  const categoriaDe = (clave: string) =>
    CATEGORIA_MUNDOS.find((c) => c.clave === clave) ?? CATEGORIA_MUNDOS[0];

  const mostrarGlobo = webgl && !plano;
  const busquedaActiva = consulta.trim().length >= 2;

  // buscador: Enter abre el primer resultado
  const abrirPrimero = (lista: PoiMundo[]) => {
    if (lista.length > 0) abrirLugar(lista[0]);
  };

  return (
    <div className={`vx-worlds ${zonaId ? "vx-worlds-zona" : ""}`}>
      {/* ── CABECERA DEL MUNDO ─────────────────────────────────────── */}
      <header className="vx-worlds-cabecera">
        <div className="vx-worlds-titulo">
          <h2>{t("worlds.titulo")}</h2>
          <p>{t("worlds.subtitulo")}</p>
        </div>
        <div className="vx-worlds-cifras">
          <span><strong>{cifras.zonas}</strong> {t("worlds.cifraZonas")}</span>
          <span><strong>{cifras.lugares}</strong> {t("worlds.cifraLugares")}</span>
          <span><strong>{cifras.experiencias}</strong> {t("worlds.cifraExperiencias")}</span>
        </div>
      </header>

      {/* ── BARRA DE CONTEXTO: MUNDO → ZONA → LUGAR ────────────────── */}
      <nav className="vx-worlds-contexto" aria-label={t("worlds.contexto")}>
        <button
          type="button"
          className={`vx-worlds-contexto-crumb ${!zonaId && !lugarId ? "vx-worlds-contexto-actual" : ""}`}
          onClick={salirZona}
        >
          {t("worlds.todosLosMundos")}
        </button>
        {zonaId && (
          <>
            <span className="vx-worlds-contexto-sep">›</span>
            <button
              type="button"
              className={`vx-worlds-contexto-crumb ${!lugarId ? "vx-worlds-contexto-actual" : ""}`}
              onClick={() => {
                setLugarId(null);
                if (zona) volar(zona.centro.lat, zona.centro.lng, zona.centro.altitud);
              }}
            >
              {zona?.nombre}
            </button>
          </>
        )}
        {lugarId && (
          <>
            <span className="vx-worlds-contexto-sep">›</span>
            <span className="vx-worlds-contexto-crumb vx-worlds-contexto-actual">{lugar?.nombre}</span>
          </>
        )}
        <span className="vx-worlds-contexto-esc">{t("worlds.esc")}</span>
      </nav>

      {/* ── EL GLOBES / EL PLANO ───────────────────────────────────── */}
      <div className="vx-worlds-escenario" ref={escenarioRef}>
        {mostrarGlobo ? (
          <GlobeMap3D
            markers={marcadores}
            height="min(62vh, 620px)"
            minHeight={320}
            autoRotate={giro && !reducido}
            rotateSpeed={0.35}
            viewMode={capa?.textura ?? (capa?.id === "fisico" ? "satelite" : "oscuridad")}
            flyTo={vuelo}
            zoom={zoom}
            countryColors={capa && Object.keys(capa.colores).length > 0 ? capa.colores : null}
            countryValores={capa && Object.keys(capa.valores).length > 0 ? capa.valores : null}
            dimColor={capa?.tipo === "textura" ? "rgba(255,255,255,0.02)" : "rgba(148,163,205,0.10)"}
            ariaLabel={t("worlds.ariaGlobo")}
          />
        ) : (
          <PlanoMundos
            zonas={zonas}
            zonaId={zonaId}
            lugarId={lugarId}
            marcadores={marcadores}
            onZona={entrarZona}
            onLugar={abrirLugar}
            buscador={consulta}
            onBuscar={setConsulta}
            onEnter={(lista) => abrirPrimero(lista)}
            t={t}
          />
        )}

        {/* ── BOTON CAPAS (flotante, dentro del escenario) ────────── */}
        <button
          type="button"
          className={`vx-worlds-flotante ${abiertas.layers ? "vx-worlds-flotante-on" : ""}`}
          onClick={() => setAbiertas((a) => ({ ...a, layers: !a.layers }))}
          aria-pressed={abiertas.layers}
        >
          {t("worlds.capas")}
        </button>

        {/* ── MANDADEROS DEL ESCENERIO ────────────────────────────── */}
        <div className="vx-worlds-mandatos">
          <button
            type="button"
            className="vx-worlds-boton"
            onClick={() => {
              const i = Math.max(0, indiceAltura - 1);
              setIndiceAltura(i);
              nonceZoom.current += 1;
              setZoom({ altitude: ALTURAS[i], nonce: nonceZoom.current });
            }}
            aria-label={t("worlds.acercar")}
          >
            +
          </button>
          <button
            type="button"
            className="vx-worlds-boton"
            onClick={() => {
              const i = Math.min(ALTURAS.length - 1, indiceAltura + 1);
              setIndiceAltura(i);
              nonceZoom.current += 1;
              setZoom({ altitude: ALTURAS[i], nonce: nonceZoom.current });
            }}
            aria-label={t("worlds.alejar")}
          >
            −
          </button>
          <button
            type="button"
            className="vx-worlds-boton"
            onClick={reiniciarVista}
            aria-label={t("worlds.reiniciar")}
            title={t("worlds.reiniciar")}
          >
            ⟲
          </button>
          <button
            type="button"
            className={`vx-worlds-boton ${giro ? "vx-worlds-boton-on" : ""}`}
            onClick={() => setGiro((v) => !v)}
            aria-pressed={giro}
          >
            {t("worlds.girar")}
          </button>
          <button
            type="button"
            className={`vx-worlds-boton ${pantalla ? "vx-worlds-boton-on" : ""}`}
            onClick={togglePantalla}
            aria-pressed={pantalla}
            aria-label={pantalla ? t("worlds.salirPantalla") : t("worlds.pantalla")}
            title={pantalla ? t("worlds.salirPantalla") : t("worlds.pantalla")}
          >
            {pantalla ? "⤢" : "⛶"}
          </button>
          <button
            type="button"
            className={`vx-worlds-boton ${plano ? "vx-worlds-boton-on" : ""}`}
            onClick={() => setPlano((v) => !v)}
            aria-pressed={plano}
          >
            {plano ? t("worlds.modo3d") : t("worlds.modo2d")}
          </button>
        </div>
      </div>

      {/* ── RAIL IZQUIERDO: LOS MUNDOS ───────────────────────────── */}
      <aside className={`vx-worlds-rail vx-worlds-rail-zones ${abiertas.zones ? "" : "vx-worlds-cerrado"}`} aria-label={t("worlds.mundos")}>
        <div className="vx-worlds-rail-cabecera">
          <span>{t("worlds.mundos")}</span>
          <button
            type="button"
            className="vx-worlds-cerrar"
            onClick={() => setAbiertas((a) => ({ ...a, zones: !a.zones }))}
            aria-label={t("worlds.cerrar")}
          >
            ×
          </button>
        </div>
        <button
          type="button"
          className={`vx-worlds-zona ${!zonaId ? "vx-worlds-zona-activa" : ""}`}
          onClick={salirZona}
        >
          <span className="vx-worlds-zona-glifo">🌐</span>
          <span className="vx-worlds-zona-nombre">{t("worlds.todosLosMundos")}</span>
          <span className="vx-worlds-zona-cuenta">{cifras.lugares}</span>
        </button>
        {zonas.map((z) => (
          <button
            key={z.id}
            type="button"
            className={`vx-worlds-zona ${zonaId === z.id ? "vx-worlds-zona-activa" : ""}`}
            onClick={() => entrarZona(z)}
            style={{ ["--vx-acento" as string]: z.acento }}
          >
            <span className="vx-worlds-zona-glifo">{z.glifo}</span>
            <span className="vx-worlds-zona-nombre">{z.nombre}</span>
            <span className="vx-worlds-zona-cuenta">{z.lugares.length}</span>
          </button>
        ))}
      </aside>

      {/* ── RAIL DERECHO: LOS LUGARES / LA FICHA ──────────────────── */}
      <aside className="vx-worlds-rail vx-worlds-rail-lugares" aria-label={lugar ? t("worlds.fichaLugar") : zona ? t("worlds.lugaresDeZona") : t("worlds.lugares")}>
        <div className="vx-worlds-rail-cabecera">
          <span>{lugar ? t("worlds.fichaLugar") : zona ? t("worlds.lugaresDeZona") : t("worlds.lugares")}</span>
        </div>

        {lugar ? (
          <LugarFicha lugar={lugar} zona={zona} t={t} categoriaDe={categoriaDe} />
        ) : zona ? (
          <>
            <div className="vx-worlds-zona-info">
              <strong>{zona.nombre}</strong>
              <p>{zona.lema}</p>
            </div>
            <input
              className="vx-worlds-buscar"
              value={consulta}
              onChange={(e) => setConsulta(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") abrirPrimero(resultados);
              }}
              placeholder={t("worlds.buscar")}
              aria-label={t("worlds.buscar")}
            />
            <div className="vx-worlds-resultados" aria-live="polite">
              {busquedaActiva && (
                <span className="vx-worlds-resultados-cuenta">
                  {t("worlds.resultados", { cuenta: resultados.length })}
                </span>
              )}
            </div>
            <ul className="vx-worlds-lista">
              {resultados.map((p) => (
                <li key={p.id}>
                  <button type="button" className="vx-worlds-lugar" onClick={() => abrirLugar(p)}>
                    <span className="vx-worlds-lugar-cabeza">
                      <span className="vx-worlds-lugar-bandera">{bandera(p.pais.iso2)}</span>
                      <span className="vx-worlds-lugar-nombre">{p.nombre}</span>
                    </span>
                    <span className="vx-worlds-lugar-pais">
                      {p.pais.nombre} · <span className="vx-worlds-lugar-exp">{p.experiencias.length} {t("worlds.expPlural")}</span>
                    </span>
                  </button>
                </li>
              ))}
              {busquedaActiva && resultados.length === 0 && <li className="vx-worlds-vacio">{t("worlds.sinResultados")}</li>}
            </ul>
          </>
        ) : (
          <>
            <input
              className="vx-worlds-buscar"
              value={consulta}
              onChange={(e) => setConsulta(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") abrirPrimero(lugaresBusqueda);
              }}
              placeholder={t("worlds.buscar")}
              aria-label={t("worlds.buscar")}
            />
            <div className="vx-worlds-resultados" aria-live="polite">
              {busquedaActiva && (
                <span className="vx-worlds-resultados-cuenta">
                  {t("worlds.resultados", { cuenta: lugaresBusqueda.length })}
                </span>
              )}
            </div>
            <ul className="vx-worlds-lista">
              {lugaresBusqueda.length > 0
                ? lugaresBusqueda.map((p) => {
                    const zi = mundoDeLugar(p.id);
                    return (
                      <li key={p.id}>
                        <button
                          type="button"
                          className="vx-worlds-lugar"
                          onClick={() => {
                            if (zi) entrarZona(zi);
                            abrirLugar(p);
                          }}
                          style={{ ["--vx-acento" as string]: zi?.acento }}
                        >
                          <span className="vx-worlds-lugar-cabeza">
                            <span className="vx-worlds-lugar-bandera">{bandera(p.pais.iso2)}</span>
                            <span className="vx-worlds-lugar-nombre">{p.nombre}</span>
                          </span>
                          <span className="vx-worlds-lugar-pais">
                            {zi?.nombre ?? p.pais.nombre} · {p.pais.nombre}
                          </span>
                        </button>
                      </li>
                    );
                  })
                : zonas.map((z) => (
                    <li key={z.id}>
                      <button type="button" className="vx-worlds-zona-bloque" onClick={() => entrarZona(z)}>
                        <span className="vx-worlds-zona-glifo">{z.glifo}</span>
                        <span className="vx-worlds-zona-nombre">{z.nombre}</span>
                        <span className="vx-worlds-zona-cuenta">{z.lugares.length}</span>
                      </button>
                    </li>
                  ))}
            </ul>
          </>
        )}
      </aside>

      {/* ── EL PANEL DE CAPAS ──────────────────────────────────────── */}
      <AnimatePresence>
        {abiertas.layers && (
          <motion.div
            className="vx-worlds-capas"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={reducido ? { duration: 0 } : { duration: 0.18 }}
          >
            <div className="vx-worlds-rail-cabecera">
              <span>{t("worlds.capas")}</span>
              <button
                type="button"
                className="vx-worlds-cerrar"
                onClick={() => setAbiertas((a) => ({ ...a, layers: !a.layers }))}
                aria-label={t("worlds.cerrar")}
              >
                ×
              </button>
            </div>
            <ul className="vx-worlds-capa-lista">
              {capas.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    className={`vx-worlds-capa ${capaId === c.id ? "vx-worlds-capa-activa" : ""}`}
                    onClick={() => setCapaId(c.id)}
                  >
                    <span className="vx-worlds-capa-nombre">{c.nombre}</span>
                    <span className="vx-worlds-capa-fuente">{c.fuente}</span>
                  </button>
                </li>
              ))}
            </ul>
            {capa && (
              <div className="vx-worlds-capa-ficha">
                <p><strong>{capa.pregunta}</strong></p>
                <p className="vx-worlds-capa-fuente">{capa.fuente}</p>
                {capa.cobertura && (
                  <p className="vx-worlds-capa-cobertura">
                    {t("worlds.cobertura", {
                      conDato: capa.cobertura.conDato,
                      conPoligono: capa.cobertura.conPoligono,
                    })}
                  </p>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

/** La ficha de un lugar: su mundo, su bandera y sus experiencias reales. */
function LugarFicha({
  lugar,
  zona,
  t,
  categoriaDe,
}: {
  lugar: PoiMundo;
  zona: ZonaMundo | null;
  t: (k: string, v?: Record<string, string | number>) => string;
  categoriaDe: (clave: string) => { etiqueta: string; acento: string };
}) {
  return (
    <motion.div
      className="vx-worlds-lugar-ficha"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
    >
      <div className="vx-worlds-lugar-ficha-cabecera">
        <h3>
          <span className="vx-worlds-lugar-ficha-bandera" aria-hidden="true">{bandera(lugar.pais.iso2)}</span>
          {lugar.nombre}
        </h3>
        <span className="vx-worlds-lugar-ficha-pais">
          {zona ? `${t("worlds.en")} ${zona.nombre} · ` : ""}
          {lugar.pais.nombre} · {lugar.pais.iso2.toUpperCase()}
        </span>
      </div>
      <p className="vx-worlds-lugar-ficha-nota">{lugar.nota}</p>
      <div className="vx-worlds-lugar-ficha-etapa">
        <span className="vx-worlds-lugar-ficha-coordenadas">
          {lugar.lat.toFixed(2)}, {lugar.lng.toFixed(2)}
        </span>
        <span className="vx-worlds-lugar-ficha-cuenta">
          {lugar.experiencias.length} {t("worlds.expPlural")}
        </span>
      </div>
      <div className="vx-worlds-lugar-ficha-experiencias">
        <span className="vx-worlds-lugar-ficha-etiqueta">{t("worlds.experiencias")}</span>
        <ul>
          {lugar.experiencias.map((e, i) => {
            const cat = categoriaDe(e.categoria);
            return (
              <li key={`${e.ruta}-${i}`}>
                <Link href={e.ruta} className="vx-worlds-enlace" style={{ ["--vx-acento" as string]: cat.acento }}>
                  <span className="vx-worlds-enlace-categoria">{cat.etiqueta}</span>
                  <span className="vx-worlds-enlace-etiqueta">{e.etiqueta}</span>
                  <span className="vx-worlds-enlace-motivo">{e.motivo}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </motion.div>
  );
}

/** La alternativa 2D: el mismo mundo dibujado en código (SVG), con las
 *  fronteras reales de país (Natural Earth 110m — la misma fuente del
 *  Atlas 2D de la casa) y los puntos de cada lugar. */
function PlanoMundos({
  zonas,
  zonaId,
  lugarId,
  marcadores,
  onZona,
  onLugar,
  buscador,
  onBuscar,
  onEnter,
  t,
}: {
  zonas: ZonaMundo[];
  zonaId: string | null;
  lugarId: string | null;
  marcadores: { id: string; nombre: string; lat: number; lng: number; color: string; size: number }[];
  onZona: (z: ZonaMundo) => void;
  onLugar: (p: PoiMundo) => void;
  buscador: string;
  onBuscar: (v: string) => void;
  onEnter: (lista: PoiMundo[]) => void;
  t: (k: string, v?: Record<string, string | number>) => string;
}) {
  const lugarPorId = new Map(zonas.flatMap((z) => z.lugares).map((p) => [p.id, p]));

  // proyección Natural Earth (la misma del Atlas 2D de la casa)
  const ANCHO = 960;
  const ALTO = 500;
  const { tracepaises, path, proyecta, reticulado } = useMemo(() => {
    const proyecta = geoNaturalEarth1().fitExtent(
      [
        [8, 8],
        [ANCHO - 8, ALTO - 8],
      ],
      { type: "Sphere" },
    );
    const path = geoPath(proyecta);
    const tracepaises = COUNTRY_FEATURES.map((f) => {
      try {
        const d = path(f) ?? "";
        if (!d) return null;
        return { id: String(f.id ?? ""), nombre: f.properties?.name ?? "", d };
      } catch {
        return null;
      }
    }).filter((x): x is { id: string; nombre: string; d: string } => Boolean(x));
    let reticulado = "";
    try {
      reticulado = path(geoGraticule10()) ?? "";
    } catch {
      /* reticulado opcional */
    }
    return { tracepaises, path, proyecta, reticulado };
  }, []);

  const xy = (lat: number, lng: number): [number, number] | null => {
    try {
      const p = proyecta([lng, lat]);
      return p ? [p[0], p[1]] : null;
    } catch {
      return null;
    }
  };

  // los puntos del mundo activo llevan etiqueta; el resto, solo tooltip
  const puntos = useMemo(() => {
    return marcadores
      .map((m) => {
        const p = xy(m.lat, m.lng);
        return p ? { ...m, x: p[0], y: p[1] } : null;
      })
      .filter(
        (x): x is { id: string; nombre: string; lat: number; lng: number; color: string; size: number; x: number; y: number } =>
          Boolean(x),
      );
  }, [marcadores]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="vx-worlds-plano">
      <svg viewBox={`0 0 ${ANCHO} ${ALTO}`} className="vx-worlds-plano-svg" role="img" aria-label={t("worlds.plano")}>
        <rect x={0} y={0} width={ANCHO} height={ALTO} className="vx-worlds-plano-fondo" />
        {/* el planeta: esfera + reticulado + fronteras reales de país */}
        <path d={path({ type: "Sphere" }) ?? ""} className="vx-worlds-plano-esfera" />
        {reticulado && <path d={reticulado} className="vx-worlds-plano-reticulado" />}
        {tracepaises.map((p) => (
          <path key={p.id || p.nombre} d={p.d} className="vx-worlds-plano-frontera" />
        ))}
        {puntos.map((m) => (
          <g key={m.id} className="vx-worlds-plano-punto-grupo">
            <title>{m.nombre}</title>
            <circle
              cx={m.x}
              cy={m.y}
              r={m.size * 60}
              className={`vx-worlds-plano-punto ${lugarId === m.id ? "vx-worlds-plano-punto-activo" : ""}`}
              style={{ ["--vx-acento" as string]: m.color }}
              onClick={() => {
                const p = lugarPorId.get(m.id);
                if (p) onLugar(p);
              }}
            />
            {(zonaId && m.size > 0.2) && (
              <text
                x={m.x + m.size * 60 + 5}
                y={m.y + 3}
                className="vx-worlds-plano-etiqueta"
                style={{ ["--vx-acento" as string]: m.color }}
              >
                {m.nombre}
              </text>
            )}
          </g>
        ))}
      </svg>
      <div className="vx-worlds-plano-legenda">
        {t("worlds.planoLeyenda")}
      </div>
      <div className="vx-worlds-plano-zonas">
        {zonas.map((z) => (
          <button
            key={z.id}
            type="button"
            className={`vx-worlds-zona ${zonaId === z.id ? "vx-worlds-zona-activa" : ""}`}
            onClick={() => onZona(z)}
            style={{ ["--vx-acento" as string]: z.acento }}
          >
            <span className="vx-worlds-zona-glifo">{z.glifo}</span>
            <span className="vx-worlds-zona-nombre">{z.nombre}</span>
            <span className="vx-worlds-zona-cuenta">{z.lugares.length}</span>
          </button>
        ))}
      </div>
      <input
        className="vx-worlds-buscar vx-worlds-buscar-plano"
        value={buscador}
        onChange={(e) => onBuscar(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            const lista = zonas.flatMap((z) => z.lugares);
            const q = buscador.trim().toLowerCase();
            const coinc = q.length >= 2
              ? lista.filter(
                  (p) =>
                    p.nombre.toLowerCase().includes(q) ||
                    p.pais.nombre.toLowerCase().includes(q) ||
                    p.pais.iso2.toLowerCase().includes(q) ||
                    p.experiencias.some((e) => e.etiqueta.toLowerCase().includes(q) || e.ruta.toLowerCase().includes(q)),
                )
              : [];
            onEnter(coinc);
          }
        }}
        placeholder={t("worlds.buscar")}
        aria-label={t("worlds.buscar")}
      />
    </div>
  );
}
