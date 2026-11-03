import { NextResponse } from "next/server";
import { fetchConCache } from "@/lib/vanguard/fuentes";

export const dynamic = "force-dynamic";

interface Sismo {
  id: string;
  lugar: string;
  magnitud: number;
  profundidadKm: number;
  haceMin: number;
  tsunami: boolean;
}

function respaldo(): Sismo[] {
  const ahora = Date.now();
  return [
    { id: "sim-1", lugar: "Frente costero de Valparaíso, Chile", magnitud: 5.4, profundidadKm: 32, haceMin: 18, tsunami: false },
    { id: "sim-2", lugar: "Anatolia oriental, Turquía", magnitud: 4.9, profundidadKm: 10, haceMin: 47, tsunami: false },
    { id: "sim-3", lugar: "Fosa de las Ryukyu, Japón", magnitud: 5.1, profundidadKm: 55, haceMin: 73, tsunami: false },
    { id: "sim-4", lugar: "Cordillera de los Andes, Perú", magnitud: 4.6, profundidadKm: 110, haceMin: 120, tsunami: false },
    { id: "sim-5", lugar: "Falla de San Andrés, California", magnitud: 4.5, profundidadKm: 8, haceMin: 190, tsunami: false },
  ].map((s) => ({ ...s, id: `${s.id}-${ahora}` }));
}

export async function GET() {
  const { datos, enVivo } = await fetchConCache<Sismo[]>(
    "sismos",
    "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson",
    120_000,
    (json) => {
      const j = json as {
        features: {
          id: string;
          properties: { place: string; mag: number; time: number; tsunami: number };
          geometry: { coordinates: [number, number, number] };
        }[];
      };
      return j.features.slice(0, 12).map((f) => ({
        id: f.id,
        lugar: f.properties.place ?? "Posición sin nombre",
        magnitud: Math.round((f.properties.mag ?? 0) * 10) / 10,
        profundidadKm: Math.round(f.geometry.coordinates[2] ?? 0),
        haceMin: Math.max(0, Math.round((Date.now() - f.properties.time) / 60000)),
        tsunami: f.properties.tsunami === 1,
      }));
    }
  );
  if (!datos) {
    return NextResponse.json({ enVivo: false, fuente: "SIMULADO", sismos: respaldo() });
  }
  return NextResponse.json({ enVivo, fuente: "USGS", sismos: datos });
}
