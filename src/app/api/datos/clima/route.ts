import { NextResponse } from "next/server";
import { fetchConCache } from "@/lib/vanguard/fuentes";

export const dynamic = "force-dynamic";

const CIUDADES: { nombre: string; lat: number; lon: number }[] = [
  { nombre: "Washington D.C.", lat: 38.9, lon: -77.04 },
  { nombre: "Ciudad de México", lat: 19.43, lon: -99.13 },
  { nombre: "Buenos Aires", lat: -34.61, lon: -58.38 },
  { nombre: "Madrid", lat: 40.42, lon: -3.7 },
  { nombre: "Tokio", lat: 35.68, lon: 139.69 },
  { nombre: "Londres", lat: 51.51, lon: -0.13 },
  { nombre: "El Cairo", lat: 30.04, lon: 31.24 },
  { nombre: "Sídney", lat: -33.87, lon: 151.21 },
];

interface Clima {
  ciudad: string;
  tempC: number;
  vientoKmh: number;
  codigo: number;
  condicion: string;
}

const WMO: Record<number, string> = {
  0: "Despejado", 1: "Mayormente despejado", 2: "Parcialmente nublado", 3: "Nublado",
  45: "Niebla", 48: "Niebla helada", 51: "Llovizna ligera", 53: "Llovizna",
  55: "Llovizna densa", 61: "Lluvia ligera", 63: "Lluvia", 65: "Lluvia fuerte",
  71: "Nieve ligera", 73: "Nieve", 75: "Nieve densa", 80: "Chubascos",
  81: "Chubascos fuertes", 82: "Chubascos violentos", 95: "Tormenta", 96: "Tormenta con granizo",
};

function respaldo(): Clima[] {
  const codigos = [0, 2, 3, 61, 80, 95];
  return CIUDADES.map((c, i) => {
    const codigo = codigos[i % codigos.length];
    return {
      ciudad: c.nombre,
      tempC: Math.round(8 + ((i * 37) % 26)),
      vientoKmh: 6 + ((i * 13) % 30),
      codigo,
      condicion: WMO[codigo] ?? "Variable",
    };
  });
}

export async function GET() {
  const query = CIUDADES.map((c) => `${c.lat},${c.lon}`).join("|");
  const { datos, enVivo } = await fetchConCache<Clima[]>(
    "clima",
    `https://api.open-meteo.com/v1/forecast?latitude=${query}&longitude=${query}&current_weather=true`,
    180_000,
    (json) => {
      const j = json as unknown[];
      const lista = Array.isArray(j) ? j : [json];
      return lista.map((entrada, i) => {
        const bloque = entrada as {
          current_weather?: { temperature?: number; windspeed?: number; weathercode?: number };
        };
        const cw = bloque.current_weather ?? {};
        const codigo = cw.weathercode ?? 0;
        return {
          ciudad: CIUDADES[i]?.nombre ?? `Punto ${i + 1}`,
          tempC: Math.round(cw.temperature ?? 0),
          vientoKmh: Math.round(cw.windspeed ?? 0),
          codigo,
          condicion: WMO[codigo] ?? "Variable",
        };
      });
    }
  );
  if (!datos) {
    return NextResponse.json({ enVivo: false, fuente: "SIMULADO", climas: respaldo() });
  }
  return NextResponse.json({ enVivo, fuente: "OPEN-METEO", climas: datos });
}
