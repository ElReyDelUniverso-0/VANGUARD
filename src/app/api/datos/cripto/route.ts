import { NextResponse } from "next/server";
import { fetchConCache } from "@/lib/vanguard/fuentes";

export const dynamic = "force-dynamic";

interface Cripto {
  id: string;
  simbolo: string;
  nombre: string;
  precioUsd: number;
  cambio24h: number;
}

const IDS = "bitcoin,ethereum,binancecoin,solana,cardano,ripple";

function respaldo(): Cripto[] {
  const base: [string, string, string, number][] = [
    ["bitcoin", "BTC", "Bitcoin", 67420],
    ["ethereum", "ETH", "Ethereum", 3245],
    ["binancecoin", "BNB", "BNB", 585],
    ["solana", "SOL", "Solana", 172],
    ["cardano", "ADA", "Cardano", 0.62],
    ["ripple", "XRP", "XRP", 0.54],
  ];
  const t = Date.now();
  return base.map(([id, simbolo, nombre, precio], i) => ({
    id,
    simbolo,
    nombre,
    precioUsd: Math.round(precio * (1 + Math.sin(t / 600000 + i) * 0.02) * 100) / 100,
    cambio24h: Math.round(Math.sin(t / 400000 + i * 2) * 600) / 100,
  }));
}

export async function GET() {
  const { datos, enVivo } = await fetchConCache<Cripto[]>(
    "cripto",
    `https://api.coingecko.com/api/v3/simple/price?ids=${IDS}&vs_currencies=usd&include_24hr_change=true`,
    90_000,
    (json) => {
      const j = json as Record<string, { usd: number; usd_24h_change?: number }>;
      const meta: Record<string, [string, string]> = {
        bitcoin: ["BTC", "Bitcoin"],
        ethereum: ["ETH", "Ethereum"],
        binancecoin: ["BNB", "BNB"],
        solana: ["SOL", "Solana"],
        cardano: ["ADA", "Cardano"],
        ripple: ["XRP", "XRP"],
      };
      return Object.entries(j)
        .filter(([id]) => meta[id])
        .map(([id, v]) => ({
          id,
          simbolo: meta[id][0],
          nombre: meta[id][1],
          precioUsd: v.usd,
          cambio24h: Math.round((v.usd_24h_change ?? 0) * 100) / 100,
        }));
    }
  );
  if (!datos) {
    return NextResponse.json({ enVivo: false, fuente: "SIMULADO", criptos: respaldo() });
  }
  return NextResponse.json({ enVivo, fuente: "COINGECKO", criptos: datos });
}
