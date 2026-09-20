"use client";

// VANGUARD v28 — PARA TI · feed vertical estilo TikTok/YouTube.
// El contenido es 100% de la comunidad (UGC): videos con link de YouTube,
// música subida, stickers y posts con fotos — mezclados en un scroll
// vertical con snap, barra de acciones (like / comentarios / compartir /
// monedas) y diapositiva EN VIVO con los canales oficiales del mundo.
// RENDIMIENTO: solo la diapositiva activa monta su iframe de YouTube.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Heart, MessageSquare, Share2, Coins, ChevronUp, ChevronDown, Flame,
  Radio, ExternalLink, Clapperboard, Music, Image as ImageIcon, Play,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useGameStore } from "@/lib/game-store";
import { Countryball } from "@/components/vanguard/countryball";
import { SensitiveMedia, UgcComments, parseJSON, type UgcItem } from "@/components/vanguard/creador-parts";
import { NEWS_CHANNELS } from "@/lib/rewards";

interface UgcPhoto { src: string; credit?: string }

interface FeedSlide {
  item: UgcItem;
  media: "video" | "audio" | "photo";
  photos: UgcPhoto[];
}

const FEED_KINDS = ["video", "musica", "sticker", "post"] as const;
const CLAIM_KEY = "vanguard_foryou_claimed";

function ytEmbed(url: string): string {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/live\/)([\w-]{6,})/);
  return m ? `https://www.youtube.com/embed/${m[1]}?rel=0` : "";
}

function timeAgo(ts: string): string {
  const d = Date.now() - new Date(ts).getTime();
  const m = Math.floor(d / 60000);
  if (m < 1) return "ahora";
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} h`;
  return `${Math.floor(h / 24)} d`;
}

const KIND_ICON: Record<string, React.ReactNode> = {
  video: <Clapperboard className="w-3 h-3" />,
  musica: <Music className="w-3 h-3" />,
  sticker: <ImageIcon className="w-3 h-3" />,
  post: <ImageIcon className="w-3 h-3" />,
};
const KIND_LABEL: Record<string, string> = {
  video: "VIDEO", musica: "MÚSICA", sticker: "STICKER", post: "POST",
};

export function ForYouPanel() {
  const addCoins = useGameStore((s) => s.addCoins);
  const alias = useGameStore((s) => s.alias);
  const [slides, setSlides] = useState<FeedSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(0);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [likeCount, setLikeCount] = useState<Record<string, number>>({});
  const [showComments, setShowComments] = useState<string | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const slidesRef = useRef<FeedSlide[]>([]);
  slidesRef.current = slides;

  const load = useCallback(async () => {
    try {
      const results = await Promise.all(
        FEED_KINDS.map((k) =>
          fetch(`/api/ugc?kind=${k}&sort=recent&limit=25`)
            .then((r) => r.json())
            .catch(() => ({ items: [] }))
        )
      );
      const all: UgcItem[] = results.flatMap((r: { items?: UgcItem[] }) => r.items ?? []);
      const slides: FeedSlide[] = [];
      for (const it of all) {
        const photos = parseJSON<UgcPhoto[]>(it.photos, []);
        if (it.kind === "video" && ytEmbed(it.videoUrl)) slides.push({ item: it, media: "video", photos });
        else if (it.kind === "musica" && it.audioData) slides.push({ item: it, media: "audio", photos });
        else if (photos.length > 0) slides.push({ item: it, media: "photo", photos });
      }
      slides.sort((a, b) => +new Date(b.item.createdAt) - +new Date(a.item.createdAt));
      setSlides(slides);
      const likes: Record<string, number> = {};
      for (const s of slides) likes[s.item.id] = s.item.likes;
      setLikeCount(likes);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 60000); // refresco suave del feed
    return () => clearInterval(t);
  }, [load]);

  // detectar la diapositiva activa con IntersectionObserver
  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && e.intersectionRatio > 0.6) {
            const idx = Number((e.target as HTMLElement).dataset.idx ?? 0);
            setActive(idx);
          }
        }
      },
      { root, threshold: [0.6] }
    );
    root.querySelectorAll("[data-idx]").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [slides]);

  const go = useCallback((dir: 1 | -1) => {
    const root = scrollerRef.current;
    if (!root) return;
    const next = Math.min(Math.max(active + dir, 0), slidesRef.current.length); // length = slide EN VIVO + feed
    root.scrollTo({ top: next * root.clientHeight, behavior: "smooth" });
  }, [active]);

  // flechas del teclado
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const tgt = e.target as HTMLElement;
      if (tgt.tagName === "INPUT" || tgt.tagName === "TEXTAREA") return;
      if (e.key === "ArrowDown") { e.preventDefault(); go(1); }
      if (e.key === "ArrowUp") { e.preventDefault(); go(-1); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [go]);

  const toggleLike = async (item: UgcItem) => {
    const already = liked[item.id];
    setLiked((m) => ({ ...m, [item.id]: !already }));
    setLikeCount((m) => ({ ...m, [item.id]: (m[item.id] ?? item.likes) + (already ? -1 : 1) }));
    try {
      const r = await fetch(`/api/ugc/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "like", voter: alias || "ANÓNIMO" }),
      });
      const j = await r.json();
      if (typeof j.likes === "number") setLikeCount((m) => ({ ...m, [item.id]: j.likes }));
      if (j.liked) toast("+2 XP — te gusta este contenido");
    } catch { /* offline: queda el estado optimista */ }
  };

  const claim = (item: UgcItem) => {
    try {
      const seen = JSON.parse(localStorage.getItem(CLAIM_KEY) || "{}") as Record<string, number>;
      if (seen[item.id]) { toast("Ya reclamaste monedas por este contenido"); return; }
      seen[item.id] = Date.now();
      // guarda solo los últimos 200 para no crecer sin límite
      const entries = Object.entries(seen).sort((a, b) => b[1] - a[1]).slice(0, 200);
      localStorage.setItem(CLAIM_KEY, JSON.stringify(Object.fromEntries(entries)));
      addCoins(2, `Contenido visto en Para Ti — ${item.title.slice(0, 30)}`);
    } catch { /* noop */ }
  };

  const share = async (item: UgcItem) => {
    const url = `${window.location.origin}/?ugc=${item.id}`;
    try {
      if (navigator.share) await navigator.share({ title: item.title, url });
      else await navigator.clipboard.writeText(url);
      toast("Enlace copiado — comparte VANGUARD con el mundo");
    } catch { /* cancelado */ }
  };

  // ====== DIAPOSITIVAS ======
  const liveSlide = useMemo(() => (
    <div className="snap-start h-full w-full shrink-0 flex items-center justify-center p-3">
      <div className="hud-panel border-red-hud/50 p-4 w-full max-w-md space-y-3 overflow-y-auto max-h-full">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-hud blink-soft" />
          <h3 className="text-sm font-bold uppercase tracking-widest text-red-hud">En vivo ahora — el mundo</h3>
        </div>
        <p className="text-[10px] font-mono text-muted-foreground">
          Canales oficiales transmitiendo 24/7. Abre EN VIVO para chat, donaciones y predicciones.
        </p>
        <div className="grid grid-cols-1 gap-2">
          {NEWS_CHANNELS.slice(0, 3).map((ch) => (
            <div key={ch.id} className="flex items-center gap-2 bg-secondary/50 rounded-sm p-2">
              <Countryball code={ch.country} size={22} />
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-bold truncate">{ch.name}</div>
                <div className="text-[9px] font-mono text-muted-foreground">{ch.perspective} · {ch.lang.toUpperCase()}</div>
              </div>
              <span className="text-[8px] font-mono px-1 py-0.5 bg-red-hud/20 text-red-hud rounded-sm uppercase">Live</span>
            </div>
          ))}
        </div>
        <button
          onClick={() => window.dispatchEvent(new CustomEvent("vanguard:navigate", { detail: "envivo" }))}
          className="w-full py-2 bg-red-hud/20 hover:bg-red-hud/30 border border-red-hud/50 rounded-sm text-[11px] font-mono uppercase text-red-hud flex items-center justify-center gap-1.5"
        >
          <Radio className="w-3.5 h-3.5" /> Abrir centro EN VIVO
        </button>
      </div>
    </div>
  ), []);

  return (
    <div className="space-y-2">
      {/* cabecera TikTok-style */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-red-hud" />
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest">Para Ti</h2>
            <p className="text-[9px] font-mono text-muted-foreground">
              Scroll infinito de la comunidad · {slides.length} publicaciones · ↑↓ o desliza
            </p>
          </div>
        </div>
        <button
          onClick={() => window.dispatchEvent(new CustomEvent("vanguard:navigate", { detail: "creador" }))}
          className="px-2.5 py-1.5 bg-violet-hud/20 hover:bg-violet-hud/30 border border-violet-hud/50 rounded-sm text-[10px] font-mono uppercase text-violet-300 flex items-center gap-1"
        >
          <Play className="w-3 h-3" /> Publica el tuyo
        </button>
      </div>

      {loading && (
        <div className="hud-panel p-10 text-center text-[11px] font-mono text-muted-foreground uppercase tracking-widest">
          Cargando el feed de la comunidad...
        </div>
      )}

      {!loading && slides.length === 0 && (
        <div className="hud-panel p-10 text-center space-y-3">
          <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-widest">
            El feed está vacío — sé el primero en publicar
          </p>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("vanguard:navigate", { detail: "creador" }))}
            className="px-4 py-2 bg-violet-hud/20 border border-violet-hud/50 rounded-sm text-[11px] font-mono uppercase text-violet-300"
          >
            Ir al Estudio Comunitario
          </button>
        </div>
      )}

      {!loading && slides.length > 0 && (
        <div className="relative">
          <div
            ref={scrollerRef}
            className="snap-y snap-mandatory overflow-y-auto rounded-sm border border-amber-hud/25 bg-black/30"
            style={{ height: "min(72vh, 640px)", scrollBehavior: "smooth" }}
          >
            {liveSlide}
            {slides.map((s, i) => {
              const it = s.item;
              const isActive = active === i + 1;
              const embed = ytEmbed(it.videoUrl);
              return (
                <div
                  key={it.id}
                  data-idx={i + 1}
                  className="snap-start h-full w-full shrink-0 flex items-stretch gap-2 p-3"
                >
                  {/* MEDIA (9:16) */}
                  <div className="flex-1 min-w-0 relative rounded-sm overflow-hidden bg-black/60 border border-amber-hud/20 flex items-center justify-center">
                    {s.media === "video" && isActive && embed ? (
                      <iframe
                        src={`${embed}&autoplay=1&mute=0`}
                        title={it.title}
                        className="absolute inset-0 w-full h-full"
                        allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
                        allowFullScreen
                      />
                    ) : s.media === "video" ? (
                      <button
                        onClick={() => setActive(i + 1) || scrollerRef.current?.scrollTo({ top: (i + 1) * (scrollerRef.current?.clientHeight ?? 0), behavior: "smooth" })}
                        className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-amber"
                        aria-label="Reproducir"
                      >
                        <Play className="w-10 h-10 opacity-60" />
                        <span className="text-[10px] font-mono uppercase">Toca para reproducir</span>
                      </button>
                    ) : s.media === "audio" ? (
                      <div className="w-full max-w-xs space-y-3 p-4 text-center">
                        <div className="mx-auto w-24 h-24 rounded-full bg-cyan-hud/20 border border-cyan-hud/50 flex items-center justify-center">
                          <Music className="w-10 h-10 text-cyan-hud" />
                        </div>
                        {isActive && <audio controls autoPlay src={it.audioData} className="w-full h-9" />}
                        {!isActive && <p className="text-[10px] font-mono text-muted-foreground uppercase">Baja para escuchar</p>}
                        {it.audioGenre && <span className="text-[9px] font-mono px-1.5 py-0.5 bg-cyan-hud/20 text-cyan-hud rounded-sm">{it.audioGenre}</span>}
                      </div>
                    ) : (
                      <div className="w-full h-full grid gap-1 p-2 content-center">
                        {s.photos.slice(0, 2).map((p, pi) => (
                          <SensitiveMedia
                            key={pi}
                            sensitive={it.sensitive}
                            src={p.src}
                            alt={`${it.title} — ${pi + 1}`}
                            className="w-full max-h-56 object-contain rounded-sm"
                          />
                        ))}
                      </div>
                    )}

                    {/* info inferior superpuesta */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/85 to-transparent p-2.5 pointer-events-none">
                      <div className="flex items-center gap-1.5">
                        <Countryball code={it.authorBall} size={20} />
                        <span className="text-[10px] font-bold text-white/95 truncate">@{it.author}</span>
                        <span className="text-[8px] font-mono px-1 py-0.5 bg-white/15 text-white/90 rounded-sm uppercase flex items-center gap-0.5">
                          {KIND_ICON[it.kind]} {KIND_LABEL[it.kind] ?? it.kind}
                        </span>
                        {it.sensitive && <span className="text-[8px] font-mono px-1 py-0.5 bg-red-hud/40 text-white rounded-sm">18+</span>}
                      </div>
                      <p className="text-[11px] text-white/90 leading-snug line-clamp-2 mt-0.5">{it.title}</p>
                      <p className="text-[9px] font-mono text-white/60">{timeAgo(it.createdAt)}{it.country ? ` · ${it.country.toUpperCase()}` : ""}</p>
                    </div>
                  </div>

                  {/* BARRA DE ACCIONES */}
                  <div className="flex flex-col items-center justify-end gap-3 pb-10 shrink-0 w-12">
                    <button
                      onClick={() => toggleLike(it)}
                      className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-red-hud"
                      aria-label="Me gusta"
                    >
                      <Heart className={cn("w-6 h-6", liked[it.id] && "fill-red-hud text-red-hud")} />
                      <span className="text-[9px] font-mono">{likeCount[it.id] ?? it.likes}</span>
                    </button>
                    <button
                      onClick={() => setShowComments(showComments === it.id ? null : it.id)}
                      className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-cyan-hud"
                      aria-label="Comentarios"
                    >
                      <MessageSquare className="w-6 h-6" />
                      <span className="text-[9px] font-mono">💬</span>
                    </button>
                    <button
                      onClick={() => claim(it)}
                      className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-amber"
                      aria-label="Reclamar monedas"
                    >
                      <Coins className="w-6 h-6 text-amber-hud" />
                      <span className="text-[9px] font-mono">+2</span>
                    </button>
                    <button
                      onClick={() => share(it)}
                      className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-green-hud"
                      aria-label="Compartir"
                    >
                      <Share2 className="w-6 h-6" />
                      <span className="text-[9px] font-mono">↗</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* controles de navegación */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-1">
            <button
              onClick={() => go(-1)}
              disabled={active === 0}
              className="w-8 h-8 rounded-full bg-black/50 border border-amber-hud/30 text-amber flex items-center justify-center disabled:opacity-30"
              aria-label="Publicación anterior"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => go(1)}
              disabled={active >= slides.length}
              className="w-8 h-8 rounded-full bg-black/50 border border-amber-hud/30 text-amber flex items-center justify-center disabled:opacity-30"
              aria-label="Siguiente publicación"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
          <div className="absolute left-3 top-3 text-[9px] font-mono text-white/70 bg-black/40 px-1.5 py-0.5 rounded-sm pointer-events-none">
            {active + 1} / {slides.length + 1}
          </div>
        </div>
      )}

      {/* comentarios desplegables */}
      {showComments && (
        <div className="hud-panel border-amber-hud/40 p-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-[10px] font-mono uppercase text-amber tracking-widest">Comentarios de la comunidad</h4>
            <button onClick={() => setShowComments(null)} className="text-[9px] font-mono text-muted-foreground hover:text-red-hud uppercase">
              Cerrar
            </button>
          </div>
          <UgcComments itemId={showComments} />
        </div>
      )}

      <div className="flex items-center gap-2 text-[9px] font-mono text-muted-foreground">
        <ExternalLink className="w-3 h-3" />
        Todo el contenido del feed lo publican jugadores como tú — el agente IA modera cada envío.
      </div>
    </div>
  );
}
