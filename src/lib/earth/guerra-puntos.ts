// ═══════════════════════════════════════════════════════════════════
// v416.0 VANGUARD EARTH SYSTEM — LOS PUNTOS DE LAS GUERRAS DEL ARCHIVO.
//
// Vive aquí, y no en mapas-capas.ts, por una razón de peso: el explorador
// (/tierra) es un componente de CLIENTE y mapas-capas importa el núcleo de
// acontecimientos, que a su vez importa la base de datos (fs/Prisma). Si los
// puntos de guerra vivieran allí, el globo del explorador arrastraría la BD
// al navegador. Esta copia es la misma declaración con la misma fuente
// (game-data.ts · HISTORICAL_WARS), y mapas-capas la re-exporta para que el
// resto de la casa no cambie ni una línea.
// ═══════════════════════════════════════════════════════════════════

import { HISTORICAL_WARS } from "@/lib/game-data";

export interface PuntoMapa {
  id: string;
  nombre: string;
  lat: number;
  lng: number;
  color: string;
  tamano: number;
  etiqueta: string;
  /** a dónde lleva su ficha (si tiene puerta) */
  href?: string;
  /** época o estado, para el filtro de la capa */
  epoca?: string;
  desde?: number;
  hasta?: number;
}

const ERA_COLOR: Record<string, string> = {
  ANTIGUA: "#e8c56a",
  EDAD_MEDIA: "#f5a623",
  MODERNA: "#3ddc97",
  CONTEMPORANEA: "#ff7a52",
};

export const PUNTOS_HISTORICOS: PuntoMapa[] = HISTORICAL_WARS.map((g) => ({
  id: g.id,
  nombre: g.name,
  lat: g.lat,
  lng: g.lng,
  color: ERA_COLOR[g.era] ?? "#e8c56a",
  tamano: 0.35,
  etiqueta: `${g.name} · ${g.yearStart < 0 ? `${-g.yearStart} a. C.` : g.yearStart} – ${g.yearEnd < 0 ? `${-g.yearEnd} a. C.` : g.yearEnd} · ${g.region}`,
  epoca: g.era,
  desde: g.yearStart,
  hasta: g.yearEnd,
}));
