import { NextResponse } from "next/server";
import { fetchConCache } from "@/lib/vanguard/fuentes";

export const dynamic = "force-dynamic";

interface Curiosidad {
  fuente: string;
  tipo: "efemeride" | "destacada";
  texto: string;
}

function respaldo(): Curiosidad[] {
  return [
    {
      fuente: "ARCHIVO VANGUARD",
      tipo: "destacada",
      texto:
        "El primer mensaje transmitido por internet fue «LO» — el operador quiso escribir LOGIN y la red se cayó a las dos letras. Ese accidente de 1969 fue la primera palabra de este mundo.",
    },
    {
      fuente: "ARCHIVO VANGUARD",
      tipo: "destacada",
      texto:
        "Los_services de inteligencia llaman «cable» a un informe urgente porque en el siglo XIX viajaban literalmente por cables telegráficos bajo el mar. Vanguard hereda el nombre.",
    },
  ];
}

export async function GET() {
  const dia = new Date();
  const mes = String(dia.getMonth() + 1).padStart(2, "0");
  const diaMes = String(dia.getDate()).padStart(2, "0");
  const { datos, enVivo } = await fetchConCache<Curiosidad[]>(
    `curiosidad-${mes}-${diaMes}`,
    `https://api.wikimedia.org/feed/v1/wikipedia/es/onthisday/events/${mes}/${diaMes}`,
    3600_000,
    (json) => {
      const j = json as { events?: { text: string; year: number }[] };
      const eventos = (j.events ?? []).slice(0, 8).map((e) => ({
        fuente: `WIKIPEDIA · ${e.year}`,
        tipo: "efemeride" as const,
        texto: e.text,
      }));
      if (eventos.length === 0) throw new Error("sin efemérides");
      return eventos;
    }
  );
  if (!datos || datos.length === 0) {
    return NextResponse.json({ enVivo: false, fuente: "SIMULADO", curiosidades: respaldo() });
  }
  return NextResponse.json({ enVivo, fuente: "WIKIPEDIA", curiosidades: datos });
}
