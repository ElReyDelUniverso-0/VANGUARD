// ═══════════════════════════════════════════════════════════════════
// v407.1 · EL MAPA DE MIEMBROS — los polígonos reales del mapa de los mundos
// (mapa-mundo.json, Natural Earth 110m) con los miembros encendidos. Los
// países demasiado pequeños para tener polígono a esta escala (islas del
// Caribe, del Pacífico…) se marcan con un punto en su coordenada real.
// Server component: SVG estático, cero JS.
// ═══════════════════════════════════════════════════════════════════
import { POLIGONOS_ORDENADOS, LIENZO } from "@/lib/mundos/mapa";
import { proyectar } from "@/lib/mundos/capas";
import { POR_ISO2 } from "@/lib/geo-paises";

export function MapaMiembros({ miembros, titulo }: { miembros: string[]; titulo: string }) {
  const dentro = new Set(miembros);
  const conPoligono = new Set(POLIGONOS_ORDENADOS.filter((p) => p.iso2 && dentro.has(p.iso2)).map((p) => p.iso2 as string));
  const puntos = miembros
    .filter((m) => !conPoligono.has(m))
    .map((m) => POR_ISO2.get(m))
    .filter((g): g is NonNullable<typeof g> => !!g)
    .map((g) => ({ iso2: g.iso2, nombre: g.nombre, xy: proyectar(g.lat, g.lng) }));
  return (
    <svg viewBox={`0 0 ${LIENZO.ancho} ${LIENZO.alto}`} className="vx-pl-mapa" role="img" aria-label={titulo}>
      <title>{titulo}</title>
      {POLIGONOS_ORDENADOS.map((p) => (
        <path key={p.clave} d={p.pais.d} className={p.iso2 && dentro.has(p.iso2) ? "si" : "no"} />
      ))}
      {puntos.map((p) => (
        <circle key={p.iso2} cx={p.xy[0]} cy={p.xy[1]} r={4.5} fill="#5eead4" stroke="#05060b" strokeWidth={1.2}>
          <title>{p.nombre}</title>
        </circle>
      ))}
    </svg>
  );
}
