import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { streamBonusCoins } from "@/lib/rewards";
import { upsertProfile, notify } from "@/lib/contrib-server";

// GET /api/live/streams/[id] — detalle de stream
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const stream = await db.liveStream.findUnique({
    where: { id },
    include: { _count: { select: { chat: true, donations: true } } },
  });
  if (!stream) return NextResponse.json({ error: "Stream no encontrado" }, { status: 404 });
  const donations = await db.streamDonation.aggregate({
    where: { streamId: id },
    _sum: { amount: true },
    _count: true,
  });
  return NextResponse.json({ stream, donated: donations._sum.amount ?? 0, donationsCount: donations._count });
}

// PATCH /api/live/streams/[id] — acciones: join | leave | end | poll-create | poll-vote
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const action = body?.action;
  const stream = await db.liveStream.findUnique({ where: { id } });
  if (!stream) return NextResponse.json({ error: "Stream no encontrado" }, { status: 404 });

  if (action === "join") {
    const updated = await db.liveStream.update({
      where: { id },
      data: {
        viewers: { increment: 1 },
        totalViews: { increment: 1 },
        peakViewers: { set: Math.max(stream.peakViewers, stream.viewers + 1) },
      },
    });
    return NextResponse.json({ stream: updated });
  }

  if (action === "leave") {
    const updated = await db.liveStream.update({
      where: { id },
      data: { viewers: { decrement: 1 } },
    });
    if (updated.viewers < 0) await db.liveStream.update({ where: { id }, data: { viewers: 0 } });
    return NextResponse.json({ stream: { ...updated, viewers: Math.max(0, updated.viewers) } });
  }

  if (action === "end") {
    if (stream.status === "ended") return NextResponse.json({ stream });
    const minutes = Math.max(1, Math.round((Date.now() - new Date(stream.startedAt).getTime()) / 60000));
    // audiencia media estimada: total de entradas / bloques de 5 min
    const avgViewers = Math.max(1, Math.round(stream.totalViews / Math.max(1, minutes / 5)));
    const bonus = streamBonusCoins(avgViewers, minutes);
    await db.liveStream.update({
      where: { id },
      data: { status: "ended", endedAt: new Date(), viewers: 0, durationMin: minutes, earnedCoins: bonus },
    });
    await db.streamReplay.create({
      data: {
        title: stream.title,
        streamerName: stream.streamerName,
        category: stream.category,
        durationMin: minutes,
        peakViewers: stream.peakViewers,
      },
    });
    const profile = await upsertProfile(stream.streamerName, stream.country);
    await db.contributorProfile.update({
      where: { alias: profile.alias },
      data: { streamMinutes: { increment: minutes }, streamEarnings: { increment: bonus } },
    });
    await notify(
      stream.streamerName,
      `Directo finalizado · +${bonus} monedas en espera 🎥`,
      `${minutes} min · pico de ${stream.peakViewers} espectadores. Reclama tus ganancias en MI DIRECTO.`,
      "🔴"
    );
    const updated = await db.liveStream.findUnique({ where: { id } });
    return NextResponse.json({ stream: updated, bonus, minutes });
  }

  if (action === "poll-create") {
    // normaliza opciones: acepta ["Sí","No"] o [{k:"A",t:"Sí"},...] → siempre [{k,t}]
    const raw = Array.isArray(body.options) ? body.options.slice(0, 4) : [];
    const normalized = raw.map((o: unknown, i: number) =>
      typeof o === "string"
        ? { k: String.fromCharCode(65 + i), t: o.slice(0, 60) }
        : { k: String((o as { k?: string })?.k ?? String.fromCharCode(65 + i)).slice(0, 4), t: String((o as { t?: string })?.t ?? "").slice(0, 60) }
    );
    const updated = await db.liveStream.update({
      where: { id },
      data: {
        pollQuestion: String(body.question || "").slice(0, 200),
        pollOptions: JSON.stringify(normalized),
        pollVotes: "{}",
      },
    });
    await db.liveChatMessage.create({
      data: { streamId: id, author: "SISTEMA", country: "un", kind: "system", content: `🎯 NUEVA PREDICCIÓN: ${updated.pollQuestion}` },
    });
    return NextResponse.json({ stream: updated });
  }

  if (action === "poll-vote") {
    const votes = JSON.parse(stream.pollVotes || "{}") as Record<string, string[]>;
    const voter = String(body.voter || "Anónimo").slice(0, 24);
    for (const k of Object.keys(votes)) votes[k] = (votes[k] || []).filter((v) => v !== voter);
    const opt = String(body.option || "A").slice(0, 4);
    votes[opt] = [...(votes[opt] || []), voter];
    const updated = await db.liveStream.update({ where: { id }, data: { pollVotes: JSON.stringify(votes) } });
    return NextResponse.json({ stream: updated });
  }

  return NextResponse.json({ error: "Acción desconocida" }, { status: 400 });
}
