// ═══════════════════════════════════════════════════════════════════
// v441.3 · ABANDONED WORLD — el mapa mundial (server component, SVG)
// Fondo: /abandonados/mundo.svg (Natural Earth 110m vía world-atlas,
// proyección equirectangular 1000×500, ~120 KB, cacheado como estático).
// Encima, un punto por lugar: un <a href="#lugar-id"> que abre su ficha.
// Sin JS de mapas ni world-paths.json en el cliente.
// ═══════════════════════════════════════════════════════════════════
import { LUGARES, META_CATEGORIA, proyectar } from "@/lib/abandonados/lugares";

/** Ventana visible: latitudes ~83°N a ~43°S (todos los lugares caben). */
const VISTA = { x: 0, y: 20, w: 1000, h: 350 };

export function MapaAbandonos({ enlaceFicha = false }: { enlaceFicha?: boolean }) {
  return (
    <figure style={{ margin: 0 }}>
      <div className="aw-mapa-marco">
        <div className="aw-mapa">
          <svg viewBox={`${VISTA.x} ${VISTA.y} ${VISTA.w} ${VISTA.h}`} role="img" aria-label={`Mapa mundial con ${LUGARES.length} lugares abandonados`}>
            <image href="/abandonados/mundo.svg" x="0" y="0" width="1000" height="500" preserveAspectRatio="none" />
            {LUGARES.map((l) => {
              const { x, y } = proyectar(l.lat, l.lon);
              const c = META_CATEGORIA[l.categoria].color;
              const izquierda = x > 880;
              return (
                <a key={l.id} href={enlaceFicha ? `/abandonados/lugar/${l.id}` : `#lugar-${l.id}`} className="aw-pin" data-cat={l.categoria} aria-label={`${l.nombre}, ${l.pais}`}>
                  <title>{`${l.nombre} · ${l.pais}`}</title>
                  <circle className="h" cx={x} cy={y} r={11} />
                  <circle cx={x} cy={y} r={8} fill={c} opacity={0.18} />
                  <circle className="n" cx={x} cy={y} r={4.2} fill={c} />
                  <text x={izquierda ? x - 8 : x + 8} y={y + 3} textAnchor={izquierda ? "end" : "start"}>
                    {l.nombre}
                  </text>
                </a>
              );
            })}
          </svg>
        </div>
      </div>
      <figcaption>
        <div className="aw-leyenda">
          {Object.entries(META_CATEGORIA).map(([k, m]) => (
            <span key={k}>
              <i style={{ background: m.color }} aria-hidden="true" /> {m.nombre}
            </span>
          ))}
        </div>
        <p className="aw-mapa-nota">Pulsa un punto para abrir su ficha. Mapa base: Natural Earth (dominio público). Coordenadas de Wikipedia/Wikidata.</p>
      </figcaption>
    </figure>
  );
}
