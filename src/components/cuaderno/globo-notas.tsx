"use client";
// ═══════════════════════════════════════════════════════════════════
// v431.6 EL CUADERNO · EL MAPA 3D DE TODO
//
// «poner mapas 3D de todo»: cada pieza con coordenadas es un punto del
// planeta; las piezas unidas por un hilo son arcos sobre el globo. Un toque
// en el globo devuelve latitud y longitud y el cuaderno las usa para fijar
// allí la pieza que tengas en la mano (o una nueva).
//
// NO se escribe otro globo: se monta el MISMO GlobeMap3D de la casa
// (globe.gl + polígonos reales de Natural Earth + texturas de la casa), que
// ya respeta su presupuesto 3D y se congela fuera de pantalla. Duplicar el
// motor sería el defecto que la casa ya pagó una vez.
// ═══════════════════════════════════════════════════════════════════

import { useMemo } from "react";
import dynamic from "next/dynamic";
import type { Globe3DArc, Globe3DMarker } from "@/components/vanguard/globe-map-3d";
import { TINTA_HEX, type Tinta } from "@/lib/cuaderno/pieles";
import type { Cuaderno, Pieza } from "@/lib/cuaderno/modelo";

// globe.gl lee `window` al cargarse: el módulo se pide sólo en el navegador,
// igual que en los paneles de la casa (si no, la sala no se puede prerenderizar).
const GlobeMap3D = dynamic(() => import("@/components/vanguard/globe-map-3d").then((m) => m.GlobeMap3D), {
  ssr: false,
  loading: () => (
    <div
      className="cu-globo-cargando"
      style={{
        height: 420,
        display: "grid",
        placeItems: "center",
        font: "500 11px/1.4 ui-monospace, monospace",
        letterSpacing: ".14em",
        textTransform: "uppercase",
        color: "#9fb0cf",
      }}
    >
      Encendiendo el planeta…
    </div>
  ),
});

/** 20 colores de región, para que dos países vecinos no se confundan. */
const COLORES = ["#e8c56a", "#22d3ee", "#4ade80", "#f87171", "#c084fc", "#fbbf24", "#38bdf8", "#a3e635"];

export type PuntoGlobo = { lat: number; lng: number; lugar?: string };

export function GloboNotas({
  cuaderno,
  seleccion,
  onPunto,
  onAbrir,
}: {
  cuaderno: Cuaderno;
  seleccion: string | null;
  /** un toque en el globo: lat/lng del sitio elegido */
  onPunto?: (p: PuntoGlobo) => void;
  /** un toque en un marcador: abre esa pieza */
  onAbrir?: (id: string) => void;
}) {
  const conSitio = useMemo(
    () => cuaderno.piezas.filter((p) => typeof p.lat === "number" && typeof p.lng === "number"),
    [cuaderno.piezas]
  );

  const markers = useMemo<Globe3DMarker[]>(
    () =>
      conSitio.map((p, i) => ({
        id: p.id,
        lat: p.lat as number,
        lng: p.lng as number,
        color: TINTA_HEX[(p.tinta ?? "ambar") as Tinta] ?? COLORES[i % COLORES.length],
        size: p.id === seleccion ? 0.85 : 0.5,
        ring: true,
        ringMax: p.id === seleccion ? 8 : 4,
        label: p.titulo,
        labelTag: p.lugar ?? "",
        onClick: () => onAbrir?.(p.id),
      })),
    [conSitio, seleccion, onAbrir]
  );

  // los hilos del cuaderno, sobre el planeta: sólo si las dos puntas tienen sitio
  const arcs = useMemo<Globe3DArc[]>(() => {
    const porId = new Map(conSitio.map((p) => [p.id, p]));
    const salida: Globe3DArc[] = [];
    for (const [a, b] of cuaderno.enlaces) {
      const A = porId.get(a);
      const B = porId.get(b);
      if (!A || !B) continue;
      salida.push({
        startLat: A.lat as number,
        startLng: A.lng as number,
        endLat: B.lat as number,
        endLng: B.lng as number,
        color: ["#e8c56a", "#22d3ee"],
        stroke: 0.5,
        dashTime: 1800,
      });
    }
    return salida;
  }, [cuaderno.enlaces, conSitio]);

  const sinSitio = cuaderno.piezas.length - conSitio.length;

  return (
    <div className="cu-globo">
      <div className="cu-globo-lienzo">
        <GlobeMap3D
          markers={markers}
          arcs={arcs}
          height="min(62vh, 560px)"
          minHeight={320}
          autoRotate={markers.length === 0}
          rotateSpeed={0.35}
          atmosphereColor="#E8C56A"
          viewMode="oscuridad"
          bordes
          graticulas
          ariaLabel="Mapa 3D de las piezas del cuaderno"
          onGlobeClick={(lat: number, lng: number) =>
            onPunto?.({ lat: Math.round(lat * 1e4) / 1e4, lng: Math.round(lng * 1e4) / 1e4 })
          }
        />
        <p className="cu-globo-pista">
          Toca el planeta para fijar un lugar · {conSitio.length} de {cuaderno.piezas.length} piezas están en el mapa
        </p>
      </div>

      <aside className="cu-globo-lado">
        <h3>En el planeta</h3>
        {conSitio.length === 0 ? (
          <p className="cu-vacio-lado">
            Ninguna pieza tiene lugar todavía. Abre una pieza, escribe dónde pasa y pulsa «Fijar en el mapa»;
            o toca el globo y te propongo el sitio.
          </p>
        ) : (
          <ul className="cu-globo-lista">
            {conSitio.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  className={p.id === seleccion ? "cu-globo-fila cu-globo-fila--on" : "cu-globo-fila"}
                  onClick={() => onAbrir?.(p.id)}
                >
                  <span className="cu-globo-punto" style={{ background: TINTA_HEX[p.tinta as Tinta] }} aria-hidden />
                  <span className="cu-globo-nombre">{p.titulo}</span>
                  <span className="cu-globo-coord">
                    {p.lugar ? p.lugar : `${(p.lat as number).toFixed(2)}, ${(p.lng as number).toFixed(2)}`}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {sinSitio > 0 ? (
          <p className="cu-globo-pie">
            {sinSitio} {sinSitio === 1 ? "pieza" : "piezas"} sin coordenadas: se quedan en la lista y en el
            tablero, no se inventan un sitio.
          </p>
        ) : null}
      </aside>
    </div>
  );
}

/** ¿Esta pieza puede ir al globo? (lo usa el editor para no prometer de más) */
export function puedeIrAlGlobo(p: Pieza): boolean {
  return typeof p.lat === "number" && typeof p.lng === "number";
}
