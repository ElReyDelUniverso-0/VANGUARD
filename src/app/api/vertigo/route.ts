import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { muro, claveCliente } from "@/lib/fortaleza";

// v211.0 EL VÉRTIGO — la gasolina del feed infinito (fórmula TikTok).
// GET /api/vertigo?antes=<ISO> → los 24 cables ANTERIORES al cursor
// (publishedAt < cursor, descendente): el feed pide una página más cuando
// el visitante se acerca al final y OTRA cuando se agota (el cliente
// recicla, así que el feed jamás se acaba — «nunca se queden con más ganas»).
// Muro 30/min por IP: el feed real pide una página cada muchos saltos; 30
// sobra para el humano más veloz y estrangula al scraper. Sin caché:
// datos vivos (ley v125 en espíritu — /api jamás se recicla).

export const dynamic = "force-dynamic";

const LOTE = 24;

export async function GET(req: Request) {
  // v211 corrección de QA: muro() devuelve VeredictoMuro (objeto), no
  // booleano — if(muro(...)) era SIEMPRE verdadero y bloqueaba la API entera.
  const veredictoMuro = muro(`vertigo:${claveCliente(req)}`, 30, 60_000);
  if (!veredictoMuro.permitido) {
    return NextResponse.json(
      { ok: false, error: "El vértigo respira — espera un momento" },
      { status: 429 }
    );
  }
  const url = new URL(req.url);
  const antesRaw = url.searchParams.get("antes") || "";
  const antes = new Date(antesRaw);
  if (!antesRaw || Number.isNaN(antes.getTime())) {
    return NextResponse.json(
      { ok: false, error: "Cursor «antes» requerido (fecha ISO)" },
      { status: 400 }
    );
  }
  try {
    const rows = await db.newsItem.findMany({
      where: { publishedAt: { lt: antes } },
      orderBy: { publishedAt: "desc" },
      take: LOTE,
      select: {
        id: true,
        title: true,
        summary: true,
        source: true,
        imageUrl: true,
        publishedAt: true,
        tacticalTag: true,
        conflictTag: true,
        sourceCountry: true,
      },
    });
    const items = rows.map((r) => ({
      id: r.id,
      t: r.title,
      s: r.summary || "",
      f: r.source,
      img: r.imageUrl || "",
      fecha: r.publishedAt.toISOString(),
      tag: (r.tacticalTag || "INFO").toUpperCase(),
      conflicto: r.conflictTag || "",
      pais: r.sourceCountry || "",
    }));
    return NextResponse.json(
      { ok: true, items, fin: items.length < LOTE },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (e) {
    console.error("vertigo error", e);
    return NextResponse.json(
      { ok: false, items: [], error: "archivo no disponible" },
      { status: 200 }
    );
  }
}
