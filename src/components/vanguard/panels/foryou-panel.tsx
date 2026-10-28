"use client";

// ============================================================
// v191.0 PARA TI · EL ALGORITMO — feed vertical estilo TikTok DE VERDAD.
// Mandato del Dueño: «haz que Vanguard tenga un algoritmo como TikTok,
// mejora los videos, los en vivo, los memes; que Vanguard produzca
// contenido nuevo y tenga animaciones con el tiempo».
//
// Lo que cambió respecto al v28 (que solo ordenaba por fecha):
//   ① EL ALGORITMO (lib/algoritmo-feed.ts): puntuación por engaño +
//     frescura + afinidad aprendida (localStorage) − visto-hace-poco,
//     con entrelazado de diversidad. Cada tarjeta explica POR QUÉ está.
//   ② EL PRODUCTOR (lib/productor-vivo.ts): Vanguard produce PULSOS
//     nuevos con el tiempo (efemérides reales, meme del día, cable
//     caliente, confrontas) — el feed JAMÁS vuelve a amanecer vacío.
//   ③ MEJORA MEMES: la galería comunitaria (/api/memes, con sus likes
//     reales) entra al algoritmo como tarjetas propias.
//   ④ MEJORA VIDEOS: los videos de TV Vanguard (views/likes reales)
//     entran al algoritmo — en PARA TI y en RECIENTE.
//   ⑤ DOBLE TOQUE = CORAZÓN (el gesto TikTok) con ráfaga animada.
//   ⑥ TRES VISTAS: PARA TI (algoritmo) · RECIENTE (cronológico) ·
//     EN VIVO (canales oficiales del mundo, mejorados).
//   ⑦ Auto-play mudo del slide activo (política de móviles) — solo el
//     slide activo monta su iframe (rendimiento intacto).
// RENDIMIENTO: IntersectionObserver como v28; nada de librerías nuevas.
// ============================================================

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Heart, MessageSquare, Share2, Coins, ChevronUp, ChevronDown, Flame,
  Radio, ExternalLink, Clapperboard, Music, Image as ImageIcon, Play,
  Sparkles, Laugh, MonitorPlay, Clock, Zap, MousePointerClick,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useGameStore } from "@/lib/game-store";
import { Countryball } from "@/components/vanguard/countryball";
import { SensitiveMedia, UgcComments, parseJSON, type UgcItem } from "@/components/vanguard/creador-parts";
import { NEWS_CHANNELS } from "@/lib/rewards";
import { HeroOro } from "@/components/vanguard/hero-oro";
import { useSala3DContenido, type FilaContenido3D } from "@/components/vanguard/use-sala3d-contenido";
import {
  ordenarAlgoritmo, ordenarReciente, leerPerfil, notaVista, notaLike, notaComentario,
  marcarVista, type TarjetaFeed, type TarjetaPuntuada, type PerfilFeed,
} from "@/lib/algoritmo-feed";
import { primeraHornada, leerCache, latidoProductor } from "@/lib/productor-vivo";
import { TV_VIDEOS, TV_CHANNELS } from "@/lib/social-data";

interface UgcPhoto { src: string; credit?: string }

interface FeedSlide {
  item: UgcItem;
  media: "video" | "audio" | "photo";
  photos: UgcPhoto[];
}

type Vista = "algoritmo" | "reciente" | "vivo";

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

const KIND_LABEL: Record<string, string> = {
  video: "VIDEO", musica: "MÚSICA", sticker: "STICKER", post: "POST",
  meme: "MEME", tv: "TV VANGUARD", pulso: "PULSO", vivo: "EN VIVO",
};

export function ForYouPanel() {
  const addCoins = useGameStore((s) => s.addCoins);
  const alias = useGameStore((s) => s.alias);
  const [vista, setVista] = useState<Vista>("algoritmo");
  const [ugcSlides, setUgcSlides] = useState<FeedSlide[]>([]);
  const [memes, setMemes] = useState<TarjetaFeed[]>([]);
  const [pulsos, setPulsos] = useState<TarjetaFeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(0);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [likeCount, setLikeCount] = useState<Record<string, number>>({});
  const [showComments, setShowComments] = useState<string | null>(null);
  const [burst, setBurst] = useState<{ id: string; x: number; y: number } | null>(null);
  const perfilRef = useRef<PerfilFeed>(leerPerfil());
  const scrollerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<TarjetaPuntuada[]>([]);
  const tapRef = useRef<{ id: string; t: number }>({ id: "", t: 0 });

  // ---------- carga de fuentes (UGC + galería de memes + productor) ----------
  const load = useCallback(async () => {
    try {
      const [results, memesR] = await Promise.all([
        Promise.all(
          FEED_KINDS.map((k) =>
            fetch(`/api/ugc?kind=${k}&sort=recent&limit=25`)
              .then((r) => r.json())
              .catch(() => ({ items: [] }))
          )
        ),
        fetch("/api/memes?sort=top&limit=14")
          .then((r) => r.json())
          .catch(() => ({ memes: [] })),
      ]);
      const all: UgcItem[] = results.flatMap((r: { items?: UgcItem[] }) => r.items ?? []);
      const slides: FeedSlide[] = [];
      for (const it of all) {
        const photos = parseJSON<UgcPhoto[]>(it.photos, []);
        if (it.kind === "video" && ytEmbed(it.videoUrl)) slides.push({ item: it, media: "video", photos });
        else if (it.kind === "musica" && it.audioData) slides.push({ item: it, media: "audio", photos });
        else if (photos.length > 0) slides.push({ item: it, media: "photo", photos });
      }
      slides.sort((a, b) => +new Date(b.item.createdAt) - +new Date(a.item.createdAt));
      setUgcSlides(slides);
      const likes: Record<string, number> = {};
      for (const s of slides) likes[s.item.id] = s.item.likes;
      setLikeCount((m) => ({ ...m, ...likes }));

      // ③ MEJORA MEMES — la galería comunitaria entra al algoritmo
      type MemeRow = { id: string; likes: number; createdAt: string; texto?: string; composicion?: string; autor?: string };
      const filas: MemeRow[] = (memesR?.memes ?? []) as MemeRow[];
      setMemes(filas.map((m) => ({
        id: `meme-${m.id}`,
        tipo: "meme" as const,
        titulo: String(m.texto || m.composicion || "MEME DE LA COMUNIDAD").slice(0, 120).toUpperCase(),
        autor: m.autor || "LA COMUNIDAD",
        ts: +new Date(m.createdAt),
        likes: m.likes ?? 0,
        datos: { memeId: m.id },
      })));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const t = setInterval(() => void load(), 90_000);
    return () => clearInterval(t);
  }, [load]);

  // ② EL PRODUCTOR — primera hornada + latido (produce con el tiempo)
  useEffect(() => {
    setPulsos(leerCache());
    let alive = true;
    void primeraHornada().then((p) => { if (alive && p.length > 0) setPulsos((prev) => [...p, ...prev].slice(0, 40)); });
    const stop = latidoProductor((p) => { if (alive) setPulsos((prev) => [...p, ...prev].slice(0, 40)); });
    return () => { alive = false; stop(); };
  }, []);

  // ④ MEJORA VIDEOS — la TV de Vanguard entra al algoritmo (estática)
  const tvTarjetas = useMemo<TarjetaFeed[]>(
    () => TV_VIDEOS.slice(0, 10).map((v) => ({
      id: `tv-${v.id}`,
      tipo: "tv" as const,
      titulo: v.title.toUpperCase().slice(0, 110),
      autor: TV_CHANNELS.find((c) => c.id === v.channelId)?.name ?? "TV VANGUARD",
      ts: Date.now() - v.daysAgo * 86_400_000,
      likes: v.likes,
      datos: { tv: v },
    })),
    []
  );

  // ---------- el ALGORITMO ordena ----------
  const lista = useMemo<TarjetaPuntuada[]>(() => {
    const ugc: TarjetaFeed[] = ugcSlides.map((s) => ({
      id: `ugc-${s.item.id}`,
      tipo: s.media === "video" ? "video" : s.media === "audio" ? "musica" : "foto",
      titulo: s.item.title.toUpperCase().slice(0, 110),
      autor: s.item.author,
      ts: +new Date(s.item.createdAt),
      likes: s.item.likes,
      bola: s.item.authorBall,
      datos: { slide: s },
    }));
    const todas = [...ugc, ...memes, ...tvTarjetas, ...pulsos];
    const ahora = Date.now();
    return vista === "reciente" ? ordenarReciente(todas) : ordenarAlgoritmo(todas, perfilRef.current, ahora);
  }, [ugcSlides, memes, tvTarjetas, pulsos, vista]);

  listRef.current = lista;

  // ---------- slide activa por IntersectionObserver ----------
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
  }, [lista, vista]);

  // afinidad: la slide activa ensancha el perfil (lo que miras, pesa)
  useEffect(() => {
    const p = lista[active];
    if (!p) return;
    notaVista(p.tarjeta.tipo, p.tarjeta.autor);
    marcarVista(p.tarjeta.id);
  }, [active, lista]);

  const go = useCallback((dir: 1 | -1) => {
    const root = scrollerRef.current;
    if (!root) return;
    const total = (vista === "vivo" ? 0 : lista.length) + 1; // +1 = slide EN VIVO
    const next = Math.min(Math.max(active + dir, 0), total - 1);
    root.scrollTo({ top: next * root.clientHeight, behavior: "smooth" });
  }, [active, lista.length, vista]);

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

  // ---------- acciones ----------
  const toggleLike = async (p: TarjetaPuntuada) => {
    const key = p.tarjeta.id;
    const already = !!liked[key];
    setLiked((m) => ({ ...m, [key]: !already }));
    setLikeCount((m) => ({ ...m, [key]: (m[key] ?? p.tarjeta.likes) + (already ? -1 : 1) }));
    notaLike(p.tarjeta.tipo, p.tarjeta.autor); // el algoritmo aprende del like
    if (p.tarjeta.id.startsWith("ugc-")) {
      try {
        const r = await fetch(`/api/ugc/${p.tarjeta.id.slice(4)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "like", voter: alias || "ANÓNIMO" }),
        });
        const j = await r.json();
        if (typeof j.likes === "number") setLikeCount((m) => ({ ...m, [key]: j.likes }));
        if (j.liked) toast("+2 XP — el algoritmo ya lo sabe");
      } catch { /* offline: queda el estado optimista */ }
    } else {
      if (!already) toast("+2 XP — señal enviada al algoritmo");
    }
  };

  // ⑤ DOBLE TOQUE = CORAZÓN — el gesto TikTok con ráfaga animada
  const toque = (p: TarjetaPuntuada, e: React.MouseEvent) => {
    const ahora = Date.now();
    const prev = tapRef.current;
    tapRef.current = { id: p.tarjeta.id, t: ahora };
    if (prev.id === p.tarjeta.id && ahora - prev.t < 320) {
      tapRef.current = { id: "", t: 0 };
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setBurst({ id: p.tarjeta.id, x: e.clientX - rect.left, y: e.clientY - rect.top });
      window.setTimeout(() => setBurst(null), 900);
      if (!liked[p.tarjeta.id]) void toggleLike(p);
    }
  };

  const claim = (p: TarjetaPuntuada) => {
    try {
      const seen = JSON.parse(localStorage.getItem(CLAIM_KEY) || "{}") as Record<string, number>;
      if (seen[p.tarjeta.id]) { toast("Ya reclamaste monedas por este contenido"); return; }
      seen[p.tarjeta.id] = Date.now();
      const entries = Object.entries(seen).sort((a, b) => b[1] - a[1]).slice(0, 200);
      localStorage.setItem(CLAIM_KEY, JSON.stringify(Object.fromEntries(entries)));
      addCoins(2, `Contenido visto en Para Ti — ${p.tarjeta.titulo.slice(0, 30)}`);
    } catch { /* noop */ }
  };

  const share = async (p: TarjetaPuntuada) => {
    const url = `${window.location.origin}/?tab=foryou`;
    try {
      if (navigator.share) await navigator.share({ title: "VANGUARD · Para Ti", url });
      else await navigator.clipboard.writeText(url);
      toast("Enlace copiado — comparte VANGUARD con el mundo");
    } catch { /* cancelado */ }
  };

  const navegar = useCallback((tab: string) => {
    window.dispatchEvent(new CustomEvent("vanguard:navigate", { detail: tab }));
  }, []);

  // v168: PARIDAD 3D — filas desde EL ALGORITMO (las mismas que pinta el 2D)
  const filas3D = useMemo<FilaContenido3D[]>(() => {
    const filas: FilaContenido3D[] = [
      { t: "EN VIVO AHORA — EL MUNDO", v: "LIVE", color: "#FF4D5E", d: `canales oficiales 24/7 · ${NEWS_CHANNELS.slice(0, 3).map((ch) => ch.name).join(" · ")}`, a: "ir a en vivo" },
    ];
    if (loading) {
      filas.push({ t: "EL ALGORITMO ESTUDIANDO TU GUSTO…", color: "#7AB8FF", d: "enganno + frescura + afinidad — el productor ya está fabricando pulsos" });
      return filas;
    }
    for (const p of lista.slice(0, 10)) {
      filas.push({
        t: `${KIND_LABEL[p.tarjeta.tipo] ?? p.tarjeta.tipo.toUpperCase()} · ${p.tarjeta.titulo}`,
        v: `♥ ${likeCount[p.tarjeta.id] ?? p.tarjeta.likes}`,
        color: liked[p.tarjeta.id] ? "#FF4D5E" : "#7AB8FF",
        d: `@${p.tarjeta.autor} · ${p.porQue}`,
        a: "like",
      });
    }
    return filas;
  }, [lista, liked, likeCount, loading]);
  useSala3DContenido("foryou", "PARA TI", "#FF3B30", `EL ALGORITMO · ${lista.length} tarjetas · el productor fabrica pulsos cada pocos minutos`, filas3D);

  useEffect(() => {
    const onAccion = (e: Event) => {
      const d = (e as CustomEvent<{ tab: string; accion: string; idx: number }>).detail;
      if (d?.tab !== "foryou") return;
      if (d.accion === "ir a en vivo") { navegar("envivo"); return; }
      if (d.accion === "like") {
        const p = lista.slice(0, 10)[d.idx - 1];
        if (p) void toggleLike(p);
      }
    };
    window.addEventListener("vg:sala3d-accion", onAccion);
    return () => window.removeEventListener("vg:sala3d-accion", onAccion);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lista, liked, navegar]);

  // ---------- slide EN VIVO (pinned, mejorada) ----------
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
          onClick={() => navegar("envivo")}
          className="w-full py-2 bg-red-hud/20 hover:bg-red-hud/30 border border-red-hud/50 rounded-sm text-[11px] font-mono uppercase text-red-hud flex items-center justify-center gap-1.5"
        >
          <Radio className="w-3.5 h-3.5" /> Abrir centro EN VIVO
        </button>
      </div>
    </div>
  ), [navegar]);

  // ---------- render de UNA tarjeta según su tipo ----------
  const renderMedia = (p: TarjetaPuntuada, isActive: boolean) => {
    const t = p.tarjeta;
    if (t.id.startsWith("ugc-")) {
      const s = (t.datos?.slide as FeedSlide | undefined);
      if (!s) return null;
      const embed = ytEmbed(s.item.videoUrl);
      if (s.media === "video" && isActive && embed) {
        return (
          <iframe
            src={`${embed}&autoplay=1&mute=1`}
            title={s.item.title}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        );
      }
      if (s.media === "video") {
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <Play className="w-10 h-10 opacity-60" />
            <span className="text-[10px] font-mono uppercase">Toca para reproducir</span>
          </div>
        );
      }
      if (s.media === "audio") {
        return (
          <div className="w-full max-w-xs space-y-3 p-4 text-center">
            <div className="mx-auto w-24 h-24 rounded-full bg-cyan-hud/20 border border-cyan-hud/50 flex items-center justify-center">
              <Music className="w-10 h-10 text-cyan-hud" />
            </div>
            {isActive && <audio controls autoPlay src={s.item.audioData} className="w-full h-9" />}
            {!isActive && <p className="text-[10px] font-mono text-muted-foreground uppercase">Baja para escuchar</p>}
            {s.item.audioGenre && <span className="text-[9px] font-mono px-1.5 py-0.5 bg-cyan-hud/20 text-cyan-hud rounded-sm">{s.item.audioGenre}</span>}
          </div>
        );
      }
      return (
        <div className="w-full h-full grid gap-1 p-2 content-center">
          {s.photos.slice(0, 2).map((ph, pi) => (
            <SensitiveMedia
              key={pi}
              sensitive={s.item.sensitive}
              src={ph.src}
              alt={`${s.item.title} — ${pi + 1}`}
              className="w-full max-h-56 object-contain rounded-sm"
            />
          ))}
        </div>
      );
    }
    if (t.tipo === "tv") {
      const v = t.datos?.tv as (typeof TV_VIDEOS)[number] | undefined;
      if (!v) return null;
      if (isActive && v.src) {
        return (
          <video
            src={v.src}
            poster={v.thumb}
            autoPlay
            muted
            loop
            playsInline
            controls
            className="absolute inset-0 w-full h-full object-cover"
          />
        );
      }
      return (
        <div className="absolute inset-0" onClick={() => navegar("videos")}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={v.thumb} alt={v.title} className="absolute inset-0 w-full h-full object-cover opacity-70" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/40">
            <MonitorPlay className="w-10 h-10 text-amber-hud opacity-80" />
            <span className="text-[10px] font-mono uppercase text-white/80">TV Vanguard · toca para la sala completa</span>
          </div>
        </div>
      );
    }
    if (t.tipo === "meme") {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 bg-gradient-to-b from-violet-950/60 to-black/70" onClick={() => navegar("memes")}>
          <Laugh className="w-12 h-12 text-violet-300 opacity-90" />
          <p className="text-[13px] font-bold text-white/90 text-center leading-snug line-clamp-4">{t.titulo}</p>
          <span className="text-[10px] font-mono uppercase text-violet-300 border border-violet-400/40 px-2 py-1 rounded-sm">Abrir galería de memes</span>
        </div>
      );
    }
    // PULSO — el Productor de Vanguard
    const receta = String((t.datos?.receta as string) ?? "");
    const destino = receta === "confronta" ? "predicciones" : receta === "memedia" ? "memes" : receta === "cable" ? "noticias" : "pulso";
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 bg-gradient-to-b from-amber-950/50 to-black/75" onClick={() => navegar(destino)}>
        <Zap className="w-11 h-11 text-amber-hud opacity-90" />
        <em className="text-[9px] font-mono uppercase tracking-[.3em] text-amber-hud/80 not-italic">El productor de Vanguard</em>
        <p className="text-[13px] font-bold text-white/92 text-center leading-snug">{t.titulo}</p>
        <span className="text-[10px] font-mono uppercase text-amber-hud/90 border border-amber-hud/40 px-2 py-1 rounded-sm flex items-center gap-1">
          <MousePointerClick className="w-3 h-3" /> Abrir módulo
        </span>
      </div>
    );
  };

  const hayContenido = !loading && lista.length > 0;

  return (
    <div className="space-y-2">
      <HeroOro panel="foryou" />
      {/* cabecera con EL ALGORITMO explicado */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-red-hud" />
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest">Para Ti · el algoritmo</h2>
            <p className="text-[9px] font-mono text-muted-foreground">
              engaño + frescura + afinidad · el productor fabrica pulsos solo
            </p>
          </div>
        </div>
        <button
          onClick={() => navegar("creador")}
          className="px-2.5 py-1.5 bg-violet-hud/20 hover:bg-violet-hud/30 border border-violet-hud/50 rounded-sm text-[10px] font-mono uppercase text-violet-300 flex items-center gap-1"
        >
          <Play className="w-3 h-3" /> Publica el tuyo
        </button>
      </div>

      {/* ⑥ TRES VISTAS — el control segmentado estilo TikTok */}
      <div className="flex items-center justify-center gap-1 border-b border-amber-hud/20 pb-1.5">
        {([
          { k: "algoritmo", l: "Para Ti", i: Sparkles },
          { k: "reciente", l: "Reciente", i: Clock },
          { k: "vivo", l: "En Vivo", i: Radio },
        ] as { k: Vista; l: string; i: typeof Sparkles }[]).map(({ k, l, i: Ico }) => (
          <button
            key={k}
            onClick={() => { setVista(k); setActive(0); }}
            className={cn(
              "px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest rounded-sm flex items-center gap-1.5 transition-colors",
              vista === k ? "bg-red-hud/20 text-red-hud border border-red-hud/50" : "text-muted-foreground hover:text-amber border border-transparent"
            )}
          >
            <Ico className="w-3.5 h-3.5" /> {l}
          </button>
        ))}
      </div>

      {loading && (
        <div className="hud-panel p-10 text-center text-[11px] font-mono text-muted-foreground uppercase tracking-widest">
          El algoritmo está estudiando tu gusto...
        </div>
      )}

      {/* VISTA EN VIVO: los canales del mundo, mejorados */}
      {!loading && vista === "vivo" && (
        <div className="hud-panel border-red-hud/40 p-4 space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-hud blink-soft" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-red-hud">Canales oficiales del mundo · 24/7</h3>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {NEWS_CHANNELS.map((ch) => (
              <a
                key={ch.id}
                href={ch.site}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-secondary/50 hover:bg-secondary/80 rounded-sm p-2.5 border border-transparent hover:border-red-hud/40 transition-colors"
              >
                <Countryball code={ch.country} size={24} />
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-bold truncate">{ch.name}</div>
                  <div className="text-[9px] font-mono text-muted-foreground">{ch.perspective} · {ch.lang.toUpperCase()} · directo</div>
                </div>
                <span className="text-[8px] font-mono px-1.5 py-0.5 bg-red-hud/20 text-red-hud rounded-sm uppercase flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-hud blink-soft" /> Live
                </span>
              </a>
            ))}
          </div>
          <button
            onClick={() => navegar("envivo")}
            className="w-full py-2 bg-red-hud/20 hover:bg-red-hud/30 border border-red-hud/50 rounded-sm text-[11px] font-mono uppercase text-red-hud flex items-center justify-center gap-1.5"
          >
            <Radio className="w-3.5 h-3.5" /> Chat, donaciones y predicciones en EN VIVO
          </button>
        </div>
      )}

      {!loading && vista !== "vivo" && hayContenido && (
        <div className="relative">
          <div
            ref={scrollerRef}
            className="snap-y snap-mandatory overflow-y-auto rounded-sm border border-amber-hud/25 bg-black/30"
            style={{ height: "min(72vh, 640px)", scrollBehavior: "smooth" }}
          >
            {liveSlide}
            {lista.map((p, i) => {
              const key = p.tarjeta.id;
              const isActive = active === i + 1;
              const bola = p.tarjeta.bola;
              const esUgc = key.startsWith("ugc-");
              return (
                <div
                  key={key}
                  data-idx={i + 1}
                  className="snap-start h-full w-full shrink-0 flex items-stretch gap-2 p-3"
                >
                  {/* MEDIA (TikTok, con doble toque) */}
                  <div className="flex-1 min-w-0 relative rounded-sm overflow-hidden bg-black/60 border border-amber-hud/20 flex items-center justify-center" onClick={(e) => toque(p, e)}>
                    {renderMedia(p, isActive)}

                    {/* ⑤ ráfaga del corazón con doble toque */}
                    {burst?.id === key && (
                      <Heart className="absolute w-24 h-24 fill-red-hud text-red-hud vg191-corazon pointer-events-none" style={{ left: burst.x - 48, top: burst.y - 48 }} />
                    )}

                    {/* info inferior + ① POR QUÉ (el algoritmo da la cara) */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/85 to-transparent p-2.5 pointer-events-none">
                      <div className="flex items-center gap-1.5">
                        {bola ? <Countryball code={bola} size={20} /> : tIcon(p.tarjeta.tipo)}
                        <span className="text-[10px] font-bold text-white/95 truncate">@{p.tarjeta.autor}</span>
                        <span className="text-[8px] font-mono px-1 py-0.5 bg-white/15 text-white/90 rounded-sm uppercase">
                          {KIND_LABEL[p.tarjeta.tipo] ?? p.tarjeta.tipo}
                        </span>
                      </div>
                      <p className="text-[11px] text-white/90 leading-snug line-clamp-2 mt-0.5">{p.tarjeta.titulo}</p>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <span className="text-[8px] font-mono px-1.5 py-0.5 bg-amber-hud/25 text-amber-hud rounded-sm uppercase tracking-wider">{p.porQue}</span>
                        <span className="text-[9px] font-mono text-white/60">{timeAgo(new Date(p.tarjeta.ts).toISOString())}</span>
                      </div>
                    </div>
                  </div>

                  {/* BARRA DE ACCIONES */}
                  <div className="flex flex-col items-center justify-end gap-3 pb-10 shrink-0 w-12">
                    <button
                      onClick={() => void toggleLike(p)}
                      className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-red-hud active:scale-90 transition-transform"
                      aria-label="Me gusta"
                    >
                      <Heart className={cn("w-6 h-6", liked[key] && "fill-red-hud text-red-hud")} />
                      <span className="text-[9px] font-mono">{likeCount[key] ?? p.tarjeta.likes}</span>
                    </button>
                    {esUgc && (
                      <button
                        onClick={() => { setShowComments(showComments === key ? null : key); notaComentario(p.tarjeta.tipo); }}
                        className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-cyan-hud"
                        aria-label="Comentarios"
                      >
                        <MessageSquare className="w-6 h-6" />
                        <span className="text-[9px] font-mono">💬</span>
                      </button>
                    )}
                    <button
                      onClick={() => claim(p)}
                      className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-amber"
                      aria-label="Reclamar monedas"
                    >
                      <Coins className="w-6 h-6 text-amber-hud" />
                      <span className="text-[9px] font-mono">+2</span>
                    </button>
                    <button
                      onClick={() => void share(p)}
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

          {/* controles de navegación + progreso */}
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
              disabled={active >= lista.length}
              className="w-8 h-8 rounded-full bg-black/50 border border-amber-hud/30 text-amber flex items-center justify-center disabled:opacity-30"
              aria-label="Siguiente publicación"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
          <div className="absolute left-3 top-3 text-[9px] font-mono text-white/70 bg-black/40 px-1.5 py-0.5 rounded-sm pointer-events-none flex items-center gap-1">
            <Flame className="w-3 h-3 text-red-hud" /> {active + 1} / {lista.length + 1} · {vista === "algoritmo" ? "PARA TI" : "RECIENTE"}
          </div>
        </div>
      )}

      {!loading && vista !== "vivo" && lista.length === 0 && (
        <div className="hud-panel p-10 text-center space-y-3">
          <Sparkles className="w-8 h-8 mx-auto text-amber-hud" />
          <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-widest">
            El productor está fabricando los primeros pulsos… un instante
          </p>
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
        El algoritmo vive en TU aparato (localStorage) — nadie más ve tu perfil. Doble toque = corazón.
      </div>
    </div>
  );
}

// icono por tipo para tarjetas sin countryball
function tIcon(tipo: string): React.ReactNode {
  if (tipo === "meme") return <Laugh className="w-4 h-4 text-violet-300" />;
  if (tipo === "tv") return <MonitorPlay className="w-4 h-4 text-amber-hud" />;
  if (tipo === "pulso") return <Zap className="w-4 h-4 text-amber-hud" />;
  if (tipo === "video") return <Clapperboard className="w-4 h-4 text-cyan-hud" />;
  if (tipo === "musica") return <Music className="w-4 h-4 text-cyan-hud" />;
  if (tipo === "foto") return <ImageIcon className="w-4 h-4 text-cyan-hud" />;
  return <Sparkles className="w-4 h-4 text-amber-hud" />;
}
