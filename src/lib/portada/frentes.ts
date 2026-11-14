// v402.0 — los FRENTES ACTIVOS (tablero + visor de briefing) salen de aquí para
// la portada y para el vestíbulo de Conflictos (/guerra-hoy): una sola regla.
import type { GrupoHistoria } from "@/components/portada/historias";
import { CONFLICTOS, REGIONES } from "./clasificar";
import type { Nota } from "./notas";

export function gruposHistorias(notas: Nota[]): GrupoHistoria[] {
  const mapear = (n: Nota) => ({ id: n.id, titulo: n.titulo, resumen: n.resumen, imagen: n.imagen, fuente: n.fuente, fecha: n.fecha });
  const grupos: GrupoHistoria[] = [];
  const hoy = notas.filter((n) => n.imagen).slice(0, 6);
  if (hoy.length) grupos.push({ key: "hoy", nombre: "Hoy", color: "#e8c56a", notas: hoy.map(mapear) });
  CONFLICTOS.map((c) => ({ c, ns: notas.filter((n) => n.conflicto === c.key) }))
    .filter((x) => x.ns.length > 0)
    .sort((a, b) => b.ns.length - a.ns.length)
    .forEach(({ c, ns }) =>
      grupos.push({ key: c.key, nombre: c.nombre, color: REGIONES[c.region].color, notas: ns.slice(0, 6).map(mapear), total: ns.length })
    );
  return grupos;
}
