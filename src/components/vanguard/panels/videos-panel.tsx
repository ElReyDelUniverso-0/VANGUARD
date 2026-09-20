"use client";

// Vanguard v7 — GlobalVision: emisora de paises con reproduccion REAL.
// Los videos se reproducen de verdad (play, seek, volumen, fullscreen).
// NUEVO v7: PUBLICA TUS PROPIOS VIDEOS (+50 gemas) — subida real a /uploads/videos,
// miniatura automatica, tu canal personal, vistas y likes que crecen en vivo.
import { useEffect, useMemo, useRef, useState } from "react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import {
  Signal, Search, ThumbsUp, ThumbsDown, Share2, BellRing, BellOff,
  Eye, ChevronDown, ChevronUp, History, Flame, Radio, ArrowLeft, BadgeCheck, X, Volume2, Play,
  UploadCloud, Video as VideoIcon, Loader2, Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { useGameStore, type UserVideo } from "@/lib/game-store";
import {
  TV_VIDEOS, TV_CHANNELS, TV_CATEGORIES, formatViews, formatDuration,
  type TvVideo, type TvChannel,
} from "@/lib/social-data";
import { FlagBadge } from "@/components/vanguard/flag-badge";
import { sfx } from "@/lib/sound";
import { toast } from "sonner";
// v19 STICKERS: countryballs en comentarios
import { Countryball, COUNTRYBALLS, renderWithStickers } from "@/components/vanguard/countryball";
import { SmilePlus } from "lucide-react";

const CAT_COLOR: Record<string, string> = {
  COMBATE: "text-red-hud border-red-hud bg-red-hud/20",
  DIPLOMACIA: "text-cyan-hud border-cyan-hud bg-cyan-hud/20",
  TECNOLOGIA: "text-green-hud border-green-hud bg-green-hud/20",
  HUMANITARIO: "text-violet-hud border-violet-hud bg-violet-hud/20",
  HISTORIA: "text-amber border-amber-hud bg-amber-hud/20",
  DIRECTO: "text-red-hud border-red-hud bg-red-hud/50",
};

// canal personal del operador (v7)
const MY_CHANNEL: TvChannel = {
  id: "mi-canal",
  name: "TU CANAL",
  code: "UN",
  subs: 0,
  verified: false,
  tagline: "Tu emisora personal en GlobalVision",
};

// convierte un video del jugador al formato del feed (+vistas vivas)
function userVideoToTv(v: UserVideo, alias: string): TvVideo {
  const elapsedMin = Math.max(0, (Date.now() - v.ts) / 60000);
  const views = 12 + Math.floor(elapsedMin * 9);
  return {
    id: v.id,
    title: v.title,
    desc: v.desc,
    channelId: "mi-canal",
    category: v.category === "DIRECTO" ? "COMBATE" : v.category,
    views,
    likes: Math.floor(views / 7),
    durationSec: v.durationSec || 15,
    daysAgo: 0,
    live: false,
    thumb: v.thumb,
    src: v.src,
    comments: [],
  } as TvVideo;
}

// miniatura automatica del video seleccionado (frame a los ~1s)
function generateThumb(file: File): Promise<{ blob: Blob; durationSec: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const v = document.createElement("video");
    v.preload = "metadata";
    v.muted = true;
    v.src = url;
    const fail = (m: string) => { URL.revokeObjectURL(url); reject(new Error(m)); };
    v.onloadedmetadata = () => {
      v.currentTime = Math.min(1.2, Math.max(0.2, (v.duration || 2) / 3));
    };
    v.onseeked = () => {
      const canvas = document.createElement("canvas");
      const w = 640;
      const scale = w / (v.videoWidth || 640);
      canvas.width = w;
      canvas.height = Math.round((v.videoHeight || 360) * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) return fail("canvas");
      ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          if (blob) resolve({ blob, durationSec: Math.round(v.duration || 10) });
          else fail("blob");
        },
        "image/jpeg",
        0.72
      );
    };
    v.onerror = () => fail("video");
  });
}

async function uploadFile(file: Blob | File, kind: "video" | "thumb"): Promise<string> {
  const fd = new FormData();
  // nombre explicito: los Blob de canvas.toBlob no tienen name y la API
  // valida la extension (si no, devuelve 400 "Formato no permitido")
  const name = kind === "thumb"
    ? "thumb.jpg"
    : (file instanceof File && file.name) || "video.mp4";
  fd.append("file", file, name);
  fd.append("kind", kind);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error ?? "Error de subida");
  return json.url as string;
}

// miniatura de card: si el video publicado no tiene thumb generada, muestra
// el primer fotograma del propio video (preload metadata) en vez de una img rota
function VideoThumb({ video, className }: { video: TvVideo; className?: string }) {
  if (!video.thumb && video.src) {
    return (
      <video
        src={video.src}
        muted
        playsInline
        preload="metadata"
        className={cn("pointer-events-none", className)}
        aria-label={video.title}
      />
    );
  }
  return (
    <img
      src={video.thumb || "/assets/tv/city-skyline.png"}
      alt={video.title}
      loading="lazy"
      className={className}
      onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0"; }}
    />
  );
}

export function PublishVideoDialog({ open, onOpenChange, onPublished }: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onPublished: () => void;
}) {
  const alias = useGameStore((s) => s.alias);
  const publishVideo = useGameStore((s) => s.publishVideo);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState<TvVideo["category"]>("COMBATE");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setFile(null); setPreviewUrl(null); setTitle(""); setDesc(""); setBusy(false); setProgress("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const pickFile = (f: File | null) => {
    if (!f) return;
    if (f.size > 90 * 1024 * 1024) {
      toast.error("Video demasiado grande (max 90 MB)");
      return;
    }
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, "").slice(0, 60));
  };

  const submit = async () => {
    if (!file) return toast.error("Selecciona un video real (MP4/WebM)");
    if (title.trim().length < 3) return toast.error("Ponle un titulo a tu emision");
    setBusy(true);
    try {
      setProgress("Subiendo video...");
      const src = await uploadFile(file, "video");
      let thumb = "";
      let durationSec = 15;
      try {
        setProgress("Generando miniatura...");
        const t = await generateThumb(file);
        thumb = await uploadFile(t.blob, "thumb");
        durationSec = t.durationSec;
      } catch { /* miniatura opcional */ }
      setProgress("Publicando en la emisora...");
      publishVideo({ title, desc, country: "UN", category, src, thumb, durationSec });
      toast.success("¡Emision publicada! +50 GEMAS + 10 XP");
      sfx.unlock();
      reset();
      onOpenChange(false);
      onPublished();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo publicar");
      setBusy(false);
      setProgress("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!busy) { if (!o) reset(); onOpenChange(o); } }}>
      <DialogContent className="max-w-lg bg-background border-amber-hud">
        <DialogHeader>
          <DialogTitle className="font-mono uppercase text-amber tracking-wider text-sm flex items-center gap-2">
            <UploadCloud className="w-4 h-4" /> Publicar video en GlobalVision
          </DialogTitle>
          <DialogDescription className="font-mono text-[11px] text-muted-foreground">
            Sube un video REAL (MP4/WebM, max 90 MB). Recompensa: <b className="text-amber">+50 gemas</b> + 10 XP. Tu canal: <b>{alias || "OPERADOR"}</b>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {/* selector de archivo + preview */}
          {!previewUrl ? (
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full border-2 border-dashed border-amber-hud/40 hover:border-amber-hud hover:bg-amber-hud/10 transition-colors p-8 text-center"
            >
              <VideoIcon className="w-8 h-8 mx-auto mb-2 text-amber" />
              <p className="text-xs font-mono uppercase text-foreground">Selecciona tu video</p>
              <p className="text-[10px] font-mono text-muted-foreground mt-1">MP4 · WebM · MOV — max 90 MB</p>
            </button>
          ) : (
            <div className="border border-border overflow-hidden">
              <video src={previewUrl} controls muted playsInline className="w-full aspect-video bg-black" />
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime,video/*"
            className="hidden"
            aria-label="Archivo de video"
            onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
          />

          <div className="space-y-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titulo de la emision (obligatorio)"
              maxLength={90}
              className="h-9 bg-background/60 border-border font-mono text-xs"
            />
            <Textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Descripcion tactica (opcional)"
              maxLength={300}
              rows={2}
              className="bg-background/60 border-border font-mono text-xs resize-none"
            />
            <div className="flex gap-1 flex-wrap">
              {TV_CATEGORIES.filter((c) => c.id !== "DIRECTO").map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  className={cn(
                    "px-2 py-1 border text-[9px] font-mono uppercase",
                    category === c.id
                      ? "border-red-hud text-red-hud bg-red-hud/20"
                      : "border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={submit}
              disabled={busy}
              className="flex-1 h-9 font-mono text-[11px] uppercase bg-red-hud/80 border border-red-hud text-white hover:bg-red-hud"
            >
              {busy ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5 mr-1" />}
              {busy ? (progress || "Publicando...") : "PUBLICAR (+50 GEMAS)"}
            </Button>
            {file && !busy && (
              <Button
                variant="outline"
                onClick={() => fileRef.current?.click()}
                className="h-9 font-mono text-[10px] uppercase border-border text-muted-foreground"
              >
                Cambiar
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function VideosPanel() {
  const [view, setView] = useState<"feed" | "watch">("feed");
  const [videoId, setVideoId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<string>("TODO");
  const [channelFilter, setChannelFilter] = useState<string | null>(null);
  const [expandedDesc, setExpandedDesc] = useState(false);
  const [commentText, setCommentText] = useState("");

  const videoReactions = useGameStore((s) => s.videoReactions);
  const subscribedChannels = useGameStore((s) => s.subscribedChannels);
  const watchHistory = useGameStore((s) => s.watchHistory);
  const comments = useGameStore((s) => s.comments);
  const reactVideo = useGameStore((s) => s.reactVideo);
  const toggleSubscribe = useGameStore((s) => s.toggleSubscribe);
  const recordWatch = useGameStore((s) => s.recordWatch);
  const addComment = useGameStore((s) => s.addComment);
  const alias = useGameStore((s) => s.alias);
  const myVideos = useGameStore((s) => s.myVideos);
  const [publishOpen, setPublishOpen] = useState(false);
  const [tick, setTick] = useState(0);

  // refresco de vistas vivas de tus videos
  useEffect(() => {
    if (myVideos.length === 0) return;
    const t = setInterval(() => setTick((x) => x + 1), 10000);
    return () => clearInterval(t);
  }, [myVideos.length]);

  const channelOf = (id: string): TvChannel =>
    id === "mi-canal" ? MY_CHANNEL : TV_CHANNELS.find((c) => c.id === id) ?? TV_CHANNELS[0];

  // feed combinado: tus emisiones primero (v7)
  const feedVideos = useMemo(() => {
    void tick; // re-render cada 10s para refrescar vistas
    const mine = myVideos.map((v) => userVideoToTv(v, alias));
    return [...mine, ...TV_VIDEOS];
     
  }, [myVideos, alias, tick]);

  const video = videoId ? feedVideos.find((v) => v.id === videoId) ?? null : null;

  // trending = top por vistas
  const trending = useMemo(
    () => [...TV_VIDEOS].sort((a, b) => b.views - a.views).slice(0, 4),
    []
  );
  const liveNow = useMemo(() => TV_VIDEOS.filter((v) => v.live), []);

  const filtered = useMemo(() => {
    let list = feedVideos;
    if (filter === "MI CANAL") list = list.filter((v) => v.channelId === "mi-canal");
    else {
      if (channelFilter) list = list.filter((v) => v.channelId === channelFilter);
      if (filter === "TRENDING") list = list.filter((v) => trending.includes(v));
      else if (filter === "HISTORIAL") {
        list = watchHistory
          .map((w) => feedVideos.find((v) => v.id === w.videoId))
          .filter((v): v is TvVideo => !!v);
      } else if (filter !== "TODO") list = list.filter((v) => v.category === filter);
    }

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          channelOf(v.channelId).name.toLowerCase().includes(q) ||
          v.desc.toLowerCase().includes(q)
      );
    }
    return list;
  }, [feedVideos, filter, query, watchHistory, trending, channelFilter, channelOf]);

  const openVideo = (id: string) => {
    setVideoId(id);
    setView("watch");
    setExpandedDesc(false);
    setCommentText("");
    recordWatch(id);
    sfx.tab();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ====== WATCH VIEW ======
  if (view === "watch" && video) {
    return <WatchView
      video={video}
      onBack={() => { setView("feed"); setVideoId(null); }}
      onOpen={openVideo}
      channelOf={channelOf}
    />;
  }

  return (
    <div className="space-y-3">
      <PanelHeader
        title="GlobalVision"
        subtitle="La emisora de los paises · reproduccion real · publica tus emisiones y gana gemas"
        icon={<Signal className="w-4 h-4 text-red-hud" />}
        color="red"
        right={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => { setPublishOpen(true); sfx.click(); }}
              className="h-8 px-2.5 font-mono text-[10px] uppercase bg-red-hud/80 border border-red-hud text-white hover:bg-red-hud"
            >
              <UploadCloud className="w-3.5 h-3.5 mr-1" /> PUBLICAR VIDEO
            </Button>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar..."
                className="h-8 w-32 sm:w-48 pl-7 font-mono text-[11px] bg-background/60 border-border"
              />
            </div>
          </div>
        }
      />

      {/* Barra de estado */}
      <div className="hud-corner p-2 flex items-center gap-3 text-[10px] font-mono flex-wrap">
        <span className="text-red-hud flex items-center gap-1 blink-soft">
          <Radio className="w-3 h-3" /> {liveNow.length} EN VIVO
        </span>
        <span className="text-muted-foreground">·</span>
        <span className="text-muted-foreground">{TV_VIDEOS.length} emisiones</span>
        <span className="text-muted-foreground">·</span>
        <span className="text-muted-foreground">{TV_CHANNELS.length} canales de paises</span>
        <span className="text-muted-foreground">·</span>
        <span className="text-amber">{subscribedChannels.length} suscripciones</span>
        {myVideos.length > 0 && (
          <>
            <span className="text-muted-foreground">·</span>
            <span className="text-amber">{myVideos.length} emisiones tuyas</span>
          </>
        )}
        <span className="ml-auto text-green-hud flex items-center gap-1">
          <Volume2 className="w-3 h-3" /> REPRODUCCION REAL
        </span>
      </div>

      <PublishVideoDialog
        open={publishOpen}
        onOpenChange={setPublishOpen}
        onPublished={() => setFilter("MI CANAL")}
      />

      {/* Suscripciones (clic = filtrar por canal) */}
      <div className="flex gap-2 overflow-x-auto thin-scroll pb-1" style={{ scrollbarWidth: "none" }}>
        {TV_CHANNELS.map((ch) => {
          const isSub = subscribedChannels.includes(ch.id);
          const active = channelFilter === ch.id;
          return (
            <button
              key={ch.id}
              onClick={() => setChannelFilter(active ? null : ch.id)}
              title={`${ch.name} · ${formatViews(ch.subs)} suscriptores · clic para filtrar`}
              className={cn(
                "flex items-center gap-1.5 px-2 py-1 border rounded-sm whitespace-nowrap flex-shrink-0 transition-colors",
                active
                  ? "border-amber-hud bg-amber-hud/30"
                  : isSub ? "border-red-hud bg-red-hud/20" : "border-border hover:border-amber-hud/50"
              )}
            >
              <FlagBadge code={ch.code} size="sm" />
              <span className={cn("text-[10px] font-mono uppercase", active ? "text-amber" : isSub ? "text-red-hud" : "text-muted-foreground")}>
                {ch.name}
              </span>
              {isSub ? <BellRing className="w-2.5 h-2.5 text-red-hud" /> : <BellOff className="w-2.5 h-2.5 text-muted-foreground/50" />}
            </button>
          );
        })}
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-1 flex-wrap">
        {["TODO", "MI CANAL", "TRENDING", "HISTORIAL", ...TV_CATEGORIES.map((c) => c.id)].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-2 py-1 border text-[9px] font-mono uppercase flex items-center gap-1",
              filter === f
                ? "border-red-hud text-red-hud bg-red-hud/20"
                : "border-border text-muted-foreground hover:text-foreground",
              f === "MI CANAL" && filter !== f && "border-amber-hud/60 text-amber"
            )}
          >
            {f === "TRENDING" && <Flame className="w-2.5 h-2.5" />}
            {f === "HISTORIAL" && <History className="w-2.5 h-2.5" />}
            {f === "MI CANAL" && <VideoIcon className="w-2.5 h-2.5" />}
            {f === "DIRECTO" && <Radio className="w-2.5 h-2.5" />}
            {f}
          </button>
        ))}
        {channelFilter && (
          <button
            onClick={() => setChannelFilter(null)}
            className="px-2 py-1 border border-amber-hud text-amber bg-amber-hud/20 text-[9px] font-mono uppercase flex items-center gap-1"
          >
            CANAL: {channelOf(channelFilter).name} <X className="w-2.5 h-2.5" />
          </button>
        )}
      </div>

      {/* Grid de videos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((v) => {
          const ch = channelOf(v.channelId);
          return (
            <article
              key={v.id}
              className="hud-corner overflow-hidden hover:bg-secondary/40 transition-colors cursor-pointer group"
              onClick={() => openVideo(v.id)}
            >
              <div className="relative aspect-video bg-secondary/60 overflow-hidden">
                <VideoThumb
                  video={v}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="w-10 h-10 hud-corner border border-amber-hud bg-black/70 flex items-center justify-center">
                    <Play className="w-5 h-5 text-amber" />
                  </span>
                </div>
                <span
                  className={cn(
                    "absolute bottom-1.5 right-1.5 text-[9px] font-mono px-1 py-0.5 font-bold",
                    v.live ? "bg-red-hud text-white blink-soft" : "bg-black/80 text-foreground"
                  )}
                >
                  {v.live ? "EN VIVO" : formatDuration(v.durationSec)}
                </span>
                <span className={cn("absolute top-1.5 left-1.5 text-[8px] font-mono px-1 py-0.5 border uppercase", CAT_COLOR[v.category])}>
                  {v.category}
                </span>
                {v.channelId === "mi-canal" && (
                  <span className="absolute top-1.5 right-1.5 text-[8px] font-mono px-1 py-0.5 border border-amber-hud bg-amber-hud/80 text-black font-bold uppercase">
                    TU VIDEO
                  </span>
                )}
              </div>
              <div className="p-2.5">
                <h3 className="text-xs font-medium text-foreground group-hover:text-amber transition-colors line-clamp-2 leading-snug">
                  {v.title}
                </h3>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <FlagBadge code={ch.code} size="sm" />
                  <span className="text-[10px] font-mono text-muted-foreground uppercase truncate flex items-center gap-0.5">
                    {ch.name}
                    {ch.verified && <BadgeCheck className="w-2.5 h-2.5 text-cyan-hud flex-shrink-0" />}
                  </span>
                </div>
                <p className="text-[9px] font-mono text-muted-foreground mt-1">
                  {formatViews(v.views)} vistas · {v.live ? "transmitiendo" : `hace ${v.daysAgo}d`} · {formatViews(v.likes)} likes
                </p>
              </div>
            </article>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="hud-corner p-8 text-center text-muted-foreground">
          <Signal className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm font-mono">Sin emisiones con ese criterio</p>
        </div>
      )}
    </div>
  );

  // ====== COMPONENTE DE REPRODUCCION REAL ======
  function WatchView({
    video, onBack, onOpen, channelOf,
  }: {
    video: TvVideo;
    onBack: () => void;
    onOpen: (id: string) => void;
    channelOf: (id: string) => TvChannel;
  }) {
    const ch = channelOf(video.channelId);
    const reaction = videoReactions[video.id];
    const isSub = subscribedChannels.includes(ch.id);

    const videoComments = comments[`video:${video.id}`] ?? [];
    const related = TV_VIDEOS.filter(
      (v) => v.id !== video.id && (v.category === video.category || v.channelId === video.channelId)
    ).slice(0, 6);

    const likeCount = video.likes + (reaction === "like" ? 1 : 0);
    const handleShare = () => {
      navigator.clipboard?.writeText(`VANGUARD GlobalVision — ${video.title}`).then(
        () => toast.success("Enlace de emision copiado"),
        () => toast.error("No se pudo copiar")
      );
    };

    return (
      <div className="space-y-3">
        <Button
          size="sm"
          variant="outline"
          onClick={onBack}
          className="h-8 font-mono text-[10px] uppercase border-amber-hud text-amber hover:bg-amber-hud"
        >
          <ArrowLeft className="w-3 h-3 mr-1" /> Volver al feed
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-3">
            {/* REPRODUCTOR REAL */}
            <div className="hud-corner overflow-hidden scanline bg-black">
              <div className="relative aspect-video bg-black">
                <video
                  key={video.id}
                  className="absolute inset-0 w-full h-full"
                  src={video.src}
                  poster={video.thumb || undefined}
                  controls={!video.live}
                  autoPlay={video.live}
                  muted={video.live}
                  loop={video.live}
                  playsInline
                  preload="metadata"
                  aria-label={video.title}
                />
                {/* HUD del reproductor */}
                <div className="absolute top-2 left-2 flex items-center gap-1.5 pointer-events-none">
                  <span className="text-[9px] font-mono px-1.5 py-0.5 bg-black/70 border border-amber-hud/50 text-amber uppercase">
                    4K-OSINT
                  </span>
                  {video.live && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 bg-red-hud text-white font-bold uppercase blink-soft">
                      EN VIVO
                    </span>
                  )}
                </div>
                <span className="absolute top-2 right-2 text-[9px] font-mono px-1.5 py-0.5 bg-black/70 border border-border text-muted-foreground uppercase pointer-events-none">
                  {video.live ? "REC · CAMARA FIJA" : "SENAL CIFRADA"}
                </span>
              </div>
            </div>

            {/* Titulo y stats */}
            <div className="hud-corner p-3">
              <h1 className="text-sm sm:text-base font-bold text-foreground leading-snug">{video.title}</h1>
              <p className="text-[10px] font-mono text-muted-foreground mt-1 flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {video.views.toLocaleString("es")} vistas</span>
                <span>·</span>
                <span>{video.live ? "comenzo hace poco" : `hace ${video.daysAgo} dias`}</span>
                <span>·</span>
                <span className={cn("px-1 border uppercase", CAT_COLOR[video.category])}>{video.category}</span>
              </p>

              {/* Acciones */}
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => { reactVideo(video.id, "like"); sfx.success(); }}
                  className={cn(
                    "h-8 font-mono text-[10px] uppercase",
                    reaction === "like" ? "border-green-hud text-green-hud bg-green-hud/20" : "border-border text-muted-foreground"
                  )}
                >
                  <ThumbsUp className={cn("w-3 h-3 mr-1", reaction === "like" && "fill-current")} /> {formatViews(likeCount)}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => { reactVideo(video.id, "dislike"); sfx.click(); }}
                  className={cn(
                    "h-8 font-mono text-[10px] uppercase",
                    reaction === "dislike" ? "border-red-hud text-red-hud bg-red-hud/20" : "border-border text-muted-foreground"
                  )}
                >
                  <ThumbsDown className={cn("w-3 h-3 mr-1", reaction === "dislike" && "fill-current")} />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleShare}
                  className="h-8 font-mono text-[10px] uppercase border-border text-muted-foreground"
                >
                  <Share2 className="w-3 h-3 mr-1" /> Compartir
                </Button>
                {/* v21.1 ESTUDIO TOTAL: descarga real de la emisión (no en directos) */}
                {!video.live && video.src && (
                  <a href={video.src} download={`vanguard-${video.id}.mp4`} aria-label={`Descargar ${video.title}`}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 font-mono text-[10px] uppercase border-green-hud/50 text-green-hud hover:bg-green-hud/10"
                      onClick={() => toast.success("Descarga iniciada")}
                    >
                      <Download className="w-3 h-3 mr-1" /> Descargar
                    </Button>
                  </a>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const sub = toggleSubscribe(ch.id);
                    toast.success(sub ? `Suscrito a ${ch.name}` : `Suscripcion cancelada: ${ch.name}`);
                    sfx.unlock();
                  }}
                  className={cn(
                    "h-8 font-mono text-[10px] uppercase ml-auto",
                    isSub ? "border-red-hud text-red-hud bg-red-hud/20" : "bg-red-hud/80 border-red-hud text-white hover:bg-red-hud"
                  )}
                >
                  {isSub ? <BellRing className="w-3 h-3 mr-1" /> : <BellOff className="w-3 h-3 mr-1" />}
                  {isSub ? "SUSCRITO" : "SUSCRIBIRSE"}
                </Button>
              </div>
            </div>

            {/* Canal */}
            <div className="hud-corner p-3 flex items-center gap-3">
              <div className="w-10 h-10 hud-corner border border-border bg-secondary/40 flex items-center justify-center flex-shrink-0">
                <FlagBadge code={ch.code} size="md" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-mono font-bold text-foreground uppercase flex items-center gap-1">
                  {ch.name}
                  {ch.verified && <BadgeCheck className="w-3 h-3 text-cyan-hud" />}
                </p>
                <p className="text-[10px] font-mono text-muted-foreground">
                  {formatViews(ch.subs)} suscriptores · {ch.tagline}
                </p>
              </div>
            </div>

            {/* Descripcion */}
            <div className="hud-corner p-3">
              <p className={cn("text-xs text-foreground/90 leading-relaxed", !expandedDesc && "line-clamp-2")}>
                {video.desc}
              </p>
              <button
                onClick={() => setExpandedDesc((e) => !e)}
                className="text-[10px] font-mono text-amber uppercase mt-1 flex items-center gap-0.5"
              >
                {expandedDesc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                {expandedDesc ? "ver menos" : "ver mas"}
              </button>
            </div>

            {/* Comentarios */}
            <div className="hud-corner p-3">
              <p className="text-[11px] font-mono uppercase text-foreground mb-2">
                {video.comments.length + videoComments.length} comentarios · +2 XP por comentar
              </p>
              <div className="flex gap-2 mb-1.5">
                <Input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Anade un comentario tactico... usa stickers [país]"
                  className="h-8 bg-background/60 border-border font-mono text-xs"
                  maxLength={600}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && commentText.trim().length >= 2) {
                      addComment(`video:${video.id}`, commentText);
                      setCommentText("");
                      toast.success("Comentario publicado (+2 XP)");
                      sfx.success();
                    }
                  }}
                />
                <Button
                  size="sm"
                  onClick={() => {
                    if (commentText.trim().length < 2) return toast.error("Comentario muy corto");
                    addComment(`video:${video.id}`, commentText);
                    setCommentText("");
                    toast.success("Comentario publicado (+2 XP)");
                    sfx.success();
                  }}
                  className="h-8 font-mono text-[10px] uppercase bg-amber-hud border border-amber-hud text-amber hover:bg-amber-hud/70"
                >
                  Comentar
                </Button>
              </div>
              {/* v19 SELECTOR DE STICKERS countryball */}
              <div className="flex items-center gap-1 mb-3 overflow-x-auto pb-1">
                <SmilePlus className="w-3.5 h-3.5 text-muted-foreground shrink-0 mr-0.5" aria-hidden />
                {COUNTRYBALLS.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => { setCommentText((t) => (t + ` [cb:${c.code}]`).slice(0, 600)); sfx.click?.(); }}
                    className="shrink-0 p-0.5 rounded-full transition-transform hover:scale-125"
                    title={`Sticker ${c.name}`}
                    aria-label={`Añadir sticker ${c.name}`}
                  >
                    <Countryball code={c.code} size={20} />
                  </button>
                ))}
              </div>
              <div className="space-y-2 max-h-72 overflow-y-auto thin-scroll pr-1">
                {[...videoComments].reverse().map((c) => (
                  <div key={c.id} className="p-2 bg-amber-hud/10 border border-amber-hud/30">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[10px] font-mono text-amber uppercase">{c.author}</span>
                      <span className="text-[9px] font-mono text-muted-foreground">ahora</span>
                    </div>
                    <p className="text-xs text-foreground/90">{renderWithStickers(c.body)}</p>
                  </div>
                ))}
                {video.comments.map((c, i) => (
                  <div key={`seed-${i}`} className="p-2 bg-secondary/40 border border-border/60">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[10px] font-mono text-cyan-hud uppercase">{c.author}</span>
                      <span className="text-[9px] font-mono text-muted-foreground flex items-center gap-1">
                        <ThumbsUp className="w-2.5 h-2.5" /> {c.likes} · hace {c.hoursAgo}h
                      </span>
                    </div>
                    <p className="text-xs text-foreground/90">{renderWithStickers(c.body)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Relacionados */}
          <div className="space-y-2">
            <p className="text-[10px] font-mono uppercase text-muted-foreground tracking-widest">
              Siguiente emision
            </p>
            {related.map((v) => {
              const rch = channelOf(v.channelId);
              return (
                <article
                  key={v.id}
                  onClick={() => onOpen(v.id)}
                  className="hud-corner p-2 flex gap-2 cursor-pointer hover:bg-secondary/40 transition-colors group"
                >
                  <div className="relative w-28 aspect-video flex-shrink-0 overflow-hidden bg-secondary/60">
                    <VideoThumb
                      video={v}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className={cn(
                      "absolute bottom-0.5 right-0.5 text-[8px] font-mono px-0.5 font-bold",
                      v.live ? "bg-red-hud text-white blink-soft" : "bg-black/80 text-foreground"
                    )}>
                      {v.live ? "LIVE" : formatDuration(v.durationSec)}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-[11px] font-medium text-foreground group-hover:text-amber line-clamp-2 leading-snug">
                      {v.title}
                    </h4>
                    <p className="text-[9px] font-mono text-muted-foreground uppercase mt-1 truncate flex items-center gap-1">
                      <FlagBadge code={rch.code} size="sm" /> {rch.name}
                    </p>
                    <p className="text-[9px] font-mono text-muted-foreground">
                      {formatViews(v.views)} vistas
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}
