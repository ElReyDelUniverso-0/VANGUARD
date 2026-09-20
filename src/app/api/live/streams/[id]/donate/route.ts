import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { upsertProfile, notify } from "@/lib/contrib-server";

// POST /api/live/streams/[id]/donate — donación de monedas al streamer
// El donante YA pagó con spendCoins en el cliente; aquí registramos y acreditamos.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const amount = Math.max(1, Math.min(10000, parseInt(String(body?.amount ?? 0), 10) || 0));
  if (!body?.from || !amount) return NextResponse.json({ error: "Faltan datos de la donación" }, { status: 400 });

  const stream = await db.liveStream.findUnique({ where: { id } });
  if (!stream) return NextResponse.json({ error: "Stream no encontrado" }, { status: 404 });

  await db.streamDonation.create({
    data: { streamId: id, from: String(body.from).slice(0, 24), to: stream.streamerName, amount, message: String(body.message || "").slice(0, 160) },
  });
  await db.liveChatMessage.create({
    data: {
      streamId: id,
      author: String(body.from).slice(0, 24),
      country: String(body.country || "us").slice(0, 2).toLowerCase(),
      kind: "donation",
      amount,
      content: String(body.message || `ha donado ${amount} monedas`).slice(0, 160),
    },
  });
  // acreditar al streamer (en espera de reclamar)
  const profile = await upsertProfile(stream.streamerName, stream.country);
  await db.contributorProfile.update({
    where: { alias: profile.alias },
    data: { streamEarnings: { increment: amount } },
  });
  if (amount >= 100) {
    await notify(stream.streamerName, `¡MEGADONACIÓN de ${body.from}! 💰 +${amount} monedas`, String(body.message || "").slice(0, 200), "💰");
  }
  return NextResponse.json({ ok: true, amount });
}
