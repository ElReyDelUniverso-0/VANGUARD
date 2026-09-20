import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// v27 — BOLSA DE MONEDAS COMUNITARIAS: los jugadores crean SU PROPIA moneda
// y el mercado la cotiza en monedas Vanguard. El precio se mueve con las
// operaciones: comprar sube, vender baja (impacto 0.04% por unidad negociada).
// GET                → mercado completo + mi portafolio (posiciones netas)
// POST { action: "create", creator, code, name, symbol, country, description }
// POST { action: "trade", user, code, side: BUY|SELL, amount } → { cost|gain, price }
const CREATE_COST = 100; // crear moneda cuesta 100 monedas Vanguard (sumidero)
const MAX_CURRENCIES = 60;
const IMPACT = 0.0004;

interface NetPosition { user: string; amount: number }

async function holdingsFor(code: string): Promise<NetPosition[]> {
  const cur = await db.communityCurrency.findUnique({ where: { code }, select: { id: true } });
  if (!cur) return [];
  const trades = await db.currencyTrade.findMany({ where: { currencyId: cur.id }, select: { user: true, side: true, amount: true } });
  const net = new Map<string, number>();
  for (const t of trades) {
    const delta = t.side === "BUY" ? t.amount : -t.amount;
    net.set(t.user, (net.get(t.user) ?? 0) + delta);
  }
  return [...net.entries()].map(([user, amount]) => ({ user, amount })).filter((p) => p.amount > 0);
}

export async function GET() {
  try {
    const [currencies, tradeRows] = await Promise.all([
      db.communityCurrency.findMany({ orderBy: [{ volume: "desc" }, { createdAt: "desc" }], take: MAX_CURRENCIES }),
      db.currencyTrade.findMany({ orderBy: { createdAt: "desc" }, take: 40, include: { currency: { select: { code: true } } } }),
    ]);
    const positions: { user: string; code: string; amount: number }[] = [];
    for (const c of currencies) {
      const hs = await holdingsFor(c.code);
      for (const h of hs) positions.push({ user: h.user, code: c.code, amount: h.amount });
    }
    return NextResponse.json({
      currencies,
      recent: tradeRows.map((t) => ({
        id: t.id, code: t.currency.code, user: t.user, side: t.side, amount: t.amount, price: t.price, createdAt: t.createdAt,
      })),
      positions,
      createCost: CREATE_COST,
    });
  } catch (e) {
    console.error("currencies GET error", e);
    return NextResponse.json({ currencies: [], recent: [], positions: [], createCost: CREATE_COST });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const action = String(body.action || "");

    if (action === "create") {
      const creator = String(body.creator || "ANÓNIMO").slice(0, 24);
      const code = String(body.code || "").trim().toUpperCase().slice(0, 6).replace(/[^A-Z0-9]/g, "");
      const name = String(body.name || "").trim().slice(0, 40);
      const symbol = String(body.symbol || "🪙").slice(0, 4);
      const country = String(body.country || "").slice(0, 2).toLowerCase();
      const description = String(body.description || "").slice(0, 300);
      if (code.length < 2) return NextResponse.json({ error: "El ticker necesita 2-6 letras (ej: QUIM)" }, { status: 400 });
      if (!name) return NextResponse.json({ error: "Ponle nombre a tu moneda" }, { status: 400 });

      const exists = await db.communityCurrency.findUnique({ where: { code } });
      if (exists) return NextResponse.json({ error: `El ticker ${code} ya existe — elige otro` }, { status: 409 });

      const supply = Math.min(Math.max(parseInt(body.supply, 10) || 1_000_000, 10_000), 100_000_000);
      const cur = await db.communityCurrency.create({
        data: { code, name, symbol, country, creator, description, supply, price: 10, basePrice: 10 },
      });
      return NextResponse.json({ currency: cur, cost: CREATE_COST, reward: 0 }, { status: 201 });
    }

    if (action === "trade") {
      const user = String(body.user || "").slice(0, 24);
      const code = String(body.code || "").toUpperCase();
      const side = String(body.side || "").toUpperCase() === "SELL" ? "SELL" : "BUY";
      const amount = Math.max(1, Math.min(parseInt(body.amount, 10) || 0, 1_000_000));
      if (!user) return NextResponse.json({ error: "Falta el usuario" }, { status: 400 });

      const cur = await db.communityCurrency.findUnique({ where: { code } });
      if (!cur) return NextResponse.json({ error: "Moneda no encontrada" }, { status: 404 });

      if (side === "SELL") {
        const hs = await holdingsFor(code);
        const mine = hs.find((h) => h.user === user)?.amount ?? 0;
        if (amount > mine)
          return NextResponse.json({ error: `Solo tienes ${mine} ${code} — no puedes vender más` }, { status: 400 });
      }

      // precio con impacto de mercado (comprar sube, vender baja)
      const impact = 1 + (side === "BUY" ? 1 : -1) * amount * IMPACT;
      const newPrice = Math.min(Math.max(cur.price * impact, 0.5), 10_000);
      const cost = Math.round(cur.price * amount);

      await db.currencyTrade.create({ data: { currencyId: cur.id, user, side, amount, price: cur.price } });
      const updated = await db.communityCurrency.update({
        where: { code },
        data: { price: newPrice, volume: { increment: amount }, trades: { increment: 1 } },
      });
      const holders = (await holdingsFor(code)).length;
      if (holders !== cur.holders)
        await db.communityCurrency.update({ where: { code }, data: { holders } });

      return NextResponse.json({
        ok: true,
        side,
        amount,
        unitPrice: cur.price,
        cost,
        newPrice: updated.price,
        currency: updated,
      });
    }

    return NextResponse.json({ error: "Acción inválida" }, { status: 400 });
  } catch (e) {
    console.error("currencies POST error", e);
    return NextResponse.json({ error: "La bolsa no pudo procesar la operación" }, { status: 500 });
  }
}
