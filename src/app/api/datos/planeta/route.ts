import { NextResponse } from "next/server";
import { fetchConCache } from "@/lib/vanguard/fuentes";

export const dynamic = "force-dynamic";

interface EventoPlaneta {
  id: string;
  titulo: string;
  categoria: string;
  fecha: string;
}

function respaldo(): EventoPlaneta[] {
  return [
    { id: "sim-e1", titulo: "Erupción volcánica monitoreada por satélite", categoria: "Volcanes", fecha: "hoy" },
    { id: "sim-e2", titulo: "Incendio forestal de gran escala detectado", categoria: "Incendios", fecha: "hoy" },
    { id: "sim-e3", titulo: "Tormenta severa con alerta marítima", categoria: "Tormentas severas", fecha: "ayer" },
    { id: "sim-e4", titulo: "Retroceso glaciar registrado por EONET", categoria: "Hielo", fecha: "ayer" },
  ];
}

export async function GET() {
  const { datos, enVivo } = await fetchConCache<EventoPlaneta[]>(
    "planeta",
    "https://eonet.gsfc.nasa.gov/api/v3/events?limit=10&days=10",
    300_000,
    (json) => {
      const j = json as {
        events: {
          id: string;
          title: string;
          categories: { title: string }[];
          geometry: { date: string }[];
        }[];
      };
      return j.events.slice(0, 10).map((e) => ({
        id: e.id,
        titulo: e.title,
        categoria: e.categories?.[0]?.title ?? "Evento natural",
        fecha: e.geometry?.[0]?.date?.slice(0, 10) ?? "",
      }));
    }
  );
  if (!datos) {
    return NextResponse.json({ enVivo: false, fuente: "SIMULADO", eventos: respaldo() });
  }
  return NextResponse.json({ enVivo, fuente: "NASA EONET", eventos: datos });
}
