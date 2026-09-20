import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { moderateUgc } from "@/lib/ai-moderate";

// v26 — COMUNIDAD CREADORA: todo lo sube la gente.
// GET  ?kind=&sort=recent|top|rating&author=&limit=   → lista + stats
// POST → crear contenido con AGENTE MODERADOR IA integrado:
//        LIMPIO→APROBADO · SOSPECHOSO→PENDIENTE · INAPROPIADO→ELIMINADO
// Anti-spam: 12 envíos/día por autor, 45s entre envíos, límites por tipo.

export const dynamic = "force-dynamic";

// v27 ESTUDIOS CREADORES: + post (comunidad), sticker, bandera, mapa
const KINDS = [
  "personaje", "arma", "juego", "musica", "noticia", "encuesta", "video",
  "post", "sticker", "bandera", "mapa",
];
const COMPO_KINDS = ["bandera", "mapa"]; // composición JSON re-renderizable
const MAX_COMPO = 12_000; // JSON de composición de bandera/mapa
const MAX_PER_DAY = 12;
const GAP_MS = 45_000;
const MAX_PHOTOS = 6;
const MAX_PHOTO_BLOB = 900_000; // ~900KB por foto comprimida client-side
const MAX_AUDIO = 3_200_000; // ~3MB de audio
const MAX_GAME_HTML = 60_000; // HTML de juego propio, sandbox

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const kind = url.searchParams.get("kind") || "";
    const sort = url.searchParams.get("sort") || "recent";
    const author = url.searchParams.get("author") || "";
    const mine = url.searchParams.get("mine") === "1";
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "40", 10) || 40, 80);

    const where: Record<string, unknown> = {};
    // el feed público solo muestra APROBADO; "mis envíos" muestra todo (el autor revisa su cola)
    if (mine && author) where.author = author;
    else where.status = "APROBADO";
    if (kind && KINDS.includes(kind)) where.kind = kind;

    let orderBy;
    if (sort === "top") orderBy = [{ likes: "desc" as const }, { createdAt: "desc" as const }];
    else if (sort === "rating") orderBy = [{ ratingSum: "desc" as const }, { createdAt: "desc" as const }];
    else if (sort === "plays") orderBy = [{ plays: "desc" as const }, { createdAt: "desc" as const }];
    else orderBy = { createdAt: "desc" as const };

    const [items, total, today, pending, byKind] = await Promise.all([
      db.ugcItem.findMany({ where, orderBy, take: limit }),
      db.ugcItem.count({ where: { status: "APROBADO" } }),
      db.ugcItem.count({ where: { status: "APROBADO", createdAt: { gte: new Date(Date.now() - 24 * 3600_000) } } }),
      db.ugcItem.count({ where: { status: "PENDIENTE" } }),
      db.ugcItem.groupBy({ by: ["kind"], where: { status: "APROBADO" }, _count: { kind: true } }),
    ]);

    const kinds: Record<string, number> = {};
    byKind.forEach((g) => (kinds[g.kind] = g._count.kind));

    return NextResponse.json({ items, stats: { total, today, pending, kinds } });
  } catch (e) {
    console.error("ugc GET error", e);
    return NextResponse.json({ items: [], stats: { total: 0, today: 0, pending: 0, kinds: {} } }, { status: 200 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const author = String(body.author || "ANÓNIMO").slice(0, 24);
    const kind = String(body.kind || "");
    const title = String(body.title || "").trim().slice(0, 120);
    if (!KINDS.includes(kind)) return NextResponse.json({ error: "Tipo de contenido inválido" }, { status: 400 });
    if (!title || title.length < 3) return NextResponse.json({ error: "Ponle un título de al menos 3 letras" }, { status: 400 });

    const summary = String(body.summary || "").slice(0, 300);
    const info = String(body.body || "").slice(0, 6000);
    const country = String(body.country || "").slice(0, 2).toLowerCase();
    const authorBall = String(body.authorBall || country || "us").slice(0, 2).toLowerCase();

    // ---- validaciones por tipo ----
    let photos = Array.isArray(body.photos) ? body.photos : [];
    photos = photos.slice(0, MAX_PHOTOS).map((p: { src?: unknown; credit?: unknown }) => ({
      src: String(p.src || ""),
      credit: String(p.credit || "").slice(0, 80),
    }));
    if (photos.some((p: { src: string }) => p.src.length > MAX_PHOTO_BLOB))
      return NextResponse.json({ error: "Una foto pesa demasiado — usa una imagen más pequeña" }, { status: 413 });

    // v27: bandera/mapa guardan su composición JSON en `specs` (cap mayor)
    const specCap = COMPO_KINDS.includes(kind) ? MAX_COMPO : 1200;
    let specs = typeof body.specs === "string" ? body.specs : JSON.stringify(body.specs ?? {});
    if (specs.length > specCap) specs = COMPO_KINDS.includes(kind) ? "{}" : "{}";

    // v27 validaciones por tipo nuevo
    if (kind === "sticker" && photos.length === 0)
      return NextResponse.json({ error: "Un sticker necesita al menos una imagen" }, { status: 400 });
    if (kind === "post" && !info && photos.length === 0)
      return NextResponse.json({ error: "Escribe algo o sube una foto para publicar en la comunidad" }, { status: 400 });
    if (COMPO_KINDS.includes(kind) && specs === "{}")
      return NextResponse.json({ error: "El diseño llegó vacío — rehusa el editor" }, { status: 400 });
    let assembly = Array.isArray(body.assembly) ? body.assembly.slice(0, 12) : [];
    assembly = JSON.stringify(
      assembly.map((a: { pieza?: unknown; desc?: unknown }) => ({
        pieza: String(a.pieza || "").slice(0, 60),
        desc: String(a.desc || "").slice(0, 300),
      }))
    );

    const gameUrl = String(body.gameUrl || "").slice(0, 500);
    const gameHtml = String(body.gameHtml || "");
    if (gameHtml.length > MAX_GAME_HTML)
      return NextResponse.json({ error: "El HTML del juego supera 60KB — simplifícalo" }, { status: 413 });
    if (gameUrl && !/^https:\/\//i.test(gameUrl))
      return NextResponse.json({ error: "La URL del juego debe empezar por https://" }, { status: 400 });

    const audioData = String(body.audioData || "");
    if (audioData.length > MAX_AUDIO)
      return NextResponse.json({ error: "El audio supera 3MB — sube una versión más corta" }, { status: 413 });

    let pollOptions = Array.isArray(body.pollOptions) ? body.pollOptions.slice(0, 6) : [];
    pollOptions = JSON.stringify(pollOptions.map((o: { label?: unknown }) => ({ label: String(o.label || "").slice(0, 80), votes: 0 })));
    if (kind === "encuesta" && JSON.parse(pollOptions).length < 2)
      return NextResponse.json({ error: "Una encuesta necesita al menos 2 opciones" }, { status: 400 });
    if (kind === "musica" && !audioData)
      return NextResponse.json({ error: "Sube el archivo de música (MP3/WAV/OGG hasta 3MB)" }, { status: 400 });
    if (kind === "juego" && !gameUrl && !gameHtml)
      return NextResponse.json({ error: "Pega la URL del juego o el HTML del juego propio" }, { status: 400 });
    if (kind === "noticia" && info.length < 80)
      return NextResponse.json({ error: "Una noticia necesita al menos 80 caracteres de información" }, { status: 400 });

    const sensitive = body.sensitive === true;

    // ---- anti-spam ----
    const [last, dayCount] = await Promise.all([
      db.ugcItem.findFirst({ where: { author }, orderBy: { createdAt: "desc" } }),
      db.ugcItem.count({ where: { author, createdAt: { gte: new Date(Date.now() - 24 * 3600_000) } } }),
    ]);
    if (last && Date.now() - last.createdAt.getTime() < GAP_MS)
      return NextResponse.json({ error: "Espera 45s entre envíos — el agente está analizando" }, { status: 429 });
    if (dayCount >= MAX_PER_DAY)
      return NextResponse.json({ error: "Límite de 12 envíos por día alcanzado — mañana más" }, { status: 429 });

    // ---- AGENTE MODERADOR IA ----
    const mod = await moderateUgc({ kind, title, summary, body: info });
    const status = mod.verdict === "LIMPIO" ? "APROBADO" : mod.verdict === "SOSPECHOSO" ? "PENDIENTE" : "ELIMINADO";

    const item = await db.ugcItem.create({
      data: {
        kind,
        author,
        authorBall: authorBall || "us",
        title,
        summary,
        body: info,
        photos: JSON.stringify(photos),
        country,
        specs,
        assembly,
        gameUrl,
        gameHtml,
        gamePlatform: String(body.gamePlatform || "pc").slice(0, 8),
        audioData,
        audioGenre: String(body.audioGenre || "").slice(0, 40),
        pollOptions,
        videoUrl: String(body.videoUrl || "").slice(0, 500),
        sensitive,
        status,
        aiVerdict: mod.verdict,
        aiReason: mod.reason,
        aiModerated: mod.ai,
      },
    });

    // si fue eliminado por la IA, no lo dejamos en la base ensuciando:
    // borramos y devolvemos el veredicto para que el autor vea el motivo.
    if (status === "ELIMINADO") {
      await db.ugcItem.delete({ where: { id: item.id } });
      return NextResponse.json(
        { eliminated: true, verdict: mod.verdict, reason: mod.reason, ai: mod.ai, reward: 0 },
        { status: 202 }
      );
    }

    return NextResponse.json({ item, verdict: mod.verdict, reason: mod.reason, ai: mod.ai, reward: 30 }, { status: 201 });
  } catch (e) {
    console.error("ugc POST error", e);
    return NextResponse.json({ error: "El estudio no pudo procesar el envío" }, { status: 500 });
  }
}
