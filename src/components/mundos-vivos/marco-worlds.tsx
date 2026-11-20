"use client";

// ═══════════════════════════════════════════════════════════════════
// v422.0 VANGUARD WORLDS — EL MARCO DEL MUNDO VIVO
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
// (globe.gl lo soporta nativo). Rail izquierdo = mundos, rail derecho =
// lugares o la ficha. ESC vuelve un paso. Todo el chrome viaja en i18n.
//
// RENDIMIENTO: el globo entra SOLO en el navegador (dynamic ssr:false,
// patrón de la casa); si no hay WebGL o el visitante elige «plano»,
// se despliega la alternativa 2D dibujada en código (SVG). El giro
// automático se detiene con prefers-reduced-motion (ley de la casa).
// ═══════════════════════════════════════════════════════════════════

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { useT } from "@/lib/i18n";
import { CATEGORIA_MUNDOS, type PoiMundo, type ZonaMundo } from "@/lib/mundos-vivos/tipos";
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

  const nonceVuelo = useRef(0);
  const [vuelo, setVuelo] = useState<{ lat: number; lng: number; altitude: number; nonce: number } | null>(null);
  const nonceZoom = useRef(0);
  const [zoom, setZoom] = useState<{ altitude: number; nonce: number } | null>(null);

  const reducido = useMemo(() => motionReducido(), []);

  useEffect(() => {
    setWebgl(usoWebgl());
  }, []);

  // ESC vuelve un paso: lugar → zona → mundo.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (lugarId) setLugarId(null);
      else if (zonaId) setZonaId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lugarId, zonaId]);

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

  const marcadores = useMemo(() => {
    const todo = zonas.flatMap((z) =>
      z.lugares.map((p) => ({
        id: p.id,
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

  const resultados = useMemo(() => {
    const q = consulta.trim().toLowerCase();
    const base = lugar ? [] : lugaresZona;
    if (q.length < 2) return base;
    return base.filter(
      (p) =>
        p.nombre.toLowerCase().includes(q) ||
        p.pais.nombre.toLowerCase().includes(q) ||
        p.pais.iso2.toLowerCase().includes(q),
    );
  }, [consulta, lugaresZona, lugar]);

  const todosLosLugares = useMemo(() => zonas.flatMap((z) => z.lugares), [zonas]);
  const lugaresBusqueda = useMemo(() => {
    const q = consulta.trim().toLowerCase();
    if (q.length < 2) return [];
    return todosLosLugares.filter(
      (p) =>
        p.nombre.toLowerCase().includes(q) ||
        p.pais.nombre.toLowerCase().includes(q) ||
        p.pais.iso2.toLowerCase().includes(q),
    );
  }, [consulta, todosLosLugares]);

  const categoriaDe = (clave: string) =>
    CATEGORIA_MUNDOS.find((c) => c.clave === clave) ?? CATEGORIA_MUNDOS[0];

  const mostrarGlobo = webgl && !plano;

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

      {/* ── EL GLOBES / EL PLANO ───────────────────────────────────── */}
      <div className="vx-worlds-escenario">
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
            countryAltitude={capa?.tipo === "coropleta" ? 0.012 : 0}
            bordes={capa?.tipo !== "textura"}
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
            t={t}
          />
        )}

        {/* ── MANDADEROS DEL ESCENERIO ────────────────────────────── */}
        <div className="vx-worlds-mandatos">
          <button
            type="button"
            className="vx-worlds-boton"
            onClick={() => {
              nonceZoom.current += 1;
              setZoom({ altitude: 1.9, nonce: nonceZoom.current });
            }}
            aria-label={t("worlds.acercar")}
          >
            +
          </button>
          <button
            type="button"
            className="vx-worlds-boton"
            onClick={() => {
              nonceZoom.current += 1;
              setZoom({ altitude: 0.6, nonce: nonceZoom.current });
            }}
            aria-label={t("worlds.alejar")}
          >
            −
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
            className={`vx-worlds-boton ${plano ? "vx-worlds-boton-on" : ""}`}
            onClick={() => setPlano((v) => !v)}
            aria-pressed={plano}
          >
            {plano ? t("worlds.modo3d") : t("worlds.modo2d")}
          </button>
        </div>
      </div>

      {/* ── RAIL IZQUIERDO: LOS MUNDOS ───────────────────────────── */}
      <aside className={`vx-worlds-rail vx-worlds-rail-zones ${abiertas.zones ? "" : "vx-worlds-cerrado"}`}>
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
      <aside className="vx-worlds-rail vx-worlds-rail-lugares">
        <div className="vx-worlds-rail-cabecera">
          <span>{lugar ? t("worlds.fichaLugar") : zona ? t("worlds.lugaresDeZona") : t("worlds.lugares")}</span>
        </div>

        {lugar ? (
          <LugarFicha lugar={lugar} t={t} categoriaDe={categoriaDe} />
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
              placeholder={t("worlds.buscar")}
              aria-label={t("worlds.buscar")}
            />
            <ul className="vx-worlds-lista">
              {resultados.map((p) => (
                <li key={p.id}>
                  <button type="button" className="vx-worlds-lugar" onClick={() => abrirLugar(p)}>
                    <span className="vx-worlds-lugar-nombre">{p.nombre}</span>
                    <span className="vx-worlds-lugar-pais">{p.pais.nombre}</span>
                  </button>
                </li>
              ))}
              {resultados.length === 0 && <li className="vx-worlds-vacio">{t("worlds.sinResultados")}</li>}
            </ul>
          </>
        ) : (
          <>
            <input
              className="vx-worlds-buscar"
              value={consulta}
              onChange={(e) => setConsulta(e.target.value)}
              placeholder={t("worlds.buscar")}
              aria-label={t("worlds.buscar")}
            />
            <ul className="vx-worlds-lista">
              {lugaresBusqueda.length > 0
                ? lugaresBusqueda.map((p) => {
                    const zi = zonas.find((z) => z.lugares.some((l) => l.id === p.id));
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
                          <span className="vx-worlds-lugar-nombre">{p.nombre}</span>
                          <span className="vx-worlds-lugar-pais">{p.pais.nombre}</span>
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

      {/* ── BOTON CAPAS (flotante) ────────────────────────────────── */}
      <button
        type="button"
        className={`vx-worlds-flotante ${abiertas.layers ? "vx-worlds-flotante-on" : ""}`}
        onClick={() => setAbiertas((a) => ({ ...a, layers: !a.layers, zones: a.zones }))}
        aria-pressed={abiertas.layers}
      >
        {t("worlds.capas")}
      </button>
    </div>
  );
}

/** La ficha de un lugar: sus experiencias reales de Vanguard. */
function LugarFicha({
  lugar,
  t,
  categoriaDe,
}: {
  lugar: PoiMundo;
  t: (k: string, v?: Record<string, string | number>) => string;
  categoriaDe: (clave: string) => { etiqueta: string; acento: string };
}) {
  return (
    <div className="vx-worlds-lugar-ficha">
      <div className="vx-worlds-lugar-ficha-cabecera">
        <h3>{lugar.nombre}</h3>
        <span className="vx-worlds-lugar-ficha-pais">{lugar.pais.nombre} · {lugar.pais.iso2.toUpperCase()}</span>
      </div>
      <p className="vx-worlds-lugar-ficha-nota">{lugar.nota}</p>
      <div className="vx-worlds-lugar-ficha-etapa">
        <span className="vx-worlds-lugar-ficha-coordenadas">
          {lugar.lat.toFixed(2)}, {lugar.lng.toFixed(2)}
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
    </div>
  );
}

/** La alternativa 2D: el mismo mundo dibujado en código (SVG), sin WebGL. */
function PlanoMundos({
  zonas,
  zonaId,
  lugarId,
  marcadores,
  onZona,
  onLugar,
  buscador,
  onBuscar,
  t,
}: {
  zonas: ZonaMundo[];
  zonaId: string | null;
  lugarId: string | null;
  marcadores: { id: string; lat: number; lng: number; color: string; size: number }[];
  onZona: (z: ZonaMundo) => void;
  onLugar: (p: PoiMundo) => void;
  buscador: string;
  onBuscar: (v: string) => void;
  t: (k: string, v?: Record<string, string | number>) => string;
}) {
  const lugarPorId = new Map(zonas.flatMap((z) => z.lugares).map((p) => [p.id, p]));
  // proyección equirectangular: x = lng, y = -lat (el norte arriba)
  const W = 1000;
  const H = 500;
  const px = (lng: number) => ((lng + 180) / 360) * W;
  const py = (lat: number) => ((90 - lat) / 180) * H;

  return (
    <div className="vx-worlds-plano">
      <svg viewBox={`0 0 ${W} ${H}`} className="vx-worlds-plano-svg" role="img" aria-label={t("worlds.plano")}>
        <rect x={0} y={0} width={W} height={H} className="vx-worlds-plano-fondo" />
        {[-60, -30, 0, 30, 60].map((lat) => (
          <line key={`la-${lat}`} x1={0} y1={py(lat)} x2={W} y2={py(lat)} className="vx-worlds-plano-malla" />
        ))}
        {[-120, -60, 0, 60, 120].map((lng) => (
          <line key={`lo-${lng}`} x1={px(lng)} y1={0} x2={px(lng)} y2={H} className="vx-worlds-plano-malla" />
        ))}
        {marcadores.map((m) => (
          <g key={m.id} className="vx-worlds-plano-punto-grupo">
            <circle
              cx={px(m.lng)}
              cy={py(m.lat)}
              r={m.size * 60}
              className={`vx-worlds-plano-punto ${lugarId === m.id ? "vx-worlds-plano-punto-activo" : ""}`}
              style={{ ["--vx-acento" as string]: m.color }}
              onClick={() => {
                const p = lugarPorId.get(m.id);
                if (p) onLugar(p);
              }}
            />
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
        placeholder={t("worlds.buscar")}
        aria-label={t("worlds.buscar")}
      />
    </div>
  );
}
