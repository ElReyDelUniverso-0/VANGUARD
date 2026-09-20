"use client";

// VANGUARD v26 — ESTUDIO COMUNITARIO · PARTES REUTILIZABLES
// Subcomponentes del flujo UGC: subida de fotos multi, editor de armado,
// editor de encuestas, gate sensible (modo estricto 18+ integrado),
// estrellas de calificación y la tarjeta universal de contenido creado.

import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  ImagePlus, Trash2, ChevronDown, ChevronUp, Play, Star, ThumbsUp, Flag,
  EyeOff, ShieldCheck, Clock, XCircle, GripVertical, Plus, ExternalLink,
  MessageCircle, Send, MousePointerClick, Swords, Landmark,
} from "lucide-react";
import { Countryball } from "@/components/vanguard/countryball";
import { countryName } from "@/lib/world-data";
import { WorldMapSVG } from "@/components/vanguard/world-map-svg";
import { isStrict18 } from "@/lib/safety";
import { useGameStore } from "@/lib/game-store";

// ============ tipos (espejo del API) ============
export interface UgcPhoto {
  src: string;
  credit: string;
}

export interface UgcItem {
  id: string;
  kind: string;
  author: string;
  authorBall: string;
  title: string;
  summary: string;
  body: string;
  photos: string; // JSON UgcPhoto[]
  country: string;
  specs: string; // JSON
  assembly: string; // JSON {pieza,desc}[]
  gameUrl: string;
  gameHtml: string;
  gamePlatform: string;
  audioData: string;
  audioGenre: string;
  pollOptions: string; // JSON {label,votes}[]
  videoUrl: string;
  sensitive: boolean;
  status: string;
  aiVerdict: string;
  aiReason: string;
  aiModerated: boolean;
  plays: number;
  likes: number;
  ratingSum: number;
  ratingCount: number;
  createdAt: string;
}

export const KIND_META: Record<string, { label: string; emoji: string; accent: string }> = {
  personaje: { label: "Personaje", emoji: "🧍", accent: "violet" },
  arma: { label: "Arma", emoji: "🔫", accent: "red" },
  juego: { label: "Juego", emoji: "🎮", accent: "amber" },
  musica: { label: "Música", emoji: "🎵", accent: "cyan" },
  noticia: { label: "Noticia", emoji: "📰", accent: "amber" },
  encuesta: { label: "Encuesta", emoji: "🗳️", accent: "green" },
  video: { label: "Video", emoji: "🎬", accent: "red" },
  // v27 ESTUDIOS CREADORES
  post: { label: "Post", emoji: "💬", accent: "cyan" },
  sticker: { label: "Sticker", emoji: "🌟", accent: "violet" },
  bandera: { label: "Bandera", emoji: "🏳️", accent: "green" },
  mapa: { label: "Mapa", emoji: "🗺️", accent: "amber" },
  decreto: { label: "Decreto", emoji: "📜", accent: "amber" },
};

export function parseJSON<T>(s: string, fallback: T): T {
  try {
    return JSON.parse(s) as T;
  } catch {
    return fallback;
  }
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "ahora";
  if (m < 60) return `hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  return `hace ${d} d`;
}

// ============ subida de fotos multi (comprime client-side) ============
async function fileToCompressedDataURL(file: File, maxSide = 1024, quality = 0.82): Promise<string> {
  const img = new Image();
  const url = URL.createObjectURL(file);
  await new Promise<void>((res, rej) => {
    img.onload = () => res();
    img.onerror = () => rej(new Error("imagen inválida"));
    img.src = url;
  });
  const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(img.width * scale));
  canvas.height = Math.max(1, Math.round(img.height * scale));
  canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
  URL.revokeObjectURL(url);
  return canvas.toDataURL("image/jpeg", quality);
}

export function PhotoUploader({
  photos,
  onChange,
  max = 6,
}: {
  photos: UgcPhoto[];
  onChange: (p: UgcPhoto[]) => void;
  max?: number;
}) {
  const [busy, setBusy] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setBusy(true);
    try {
      const next = [...photos];
      for (const f of Array.from(files)) {
        if (next.length >= max) break;
        if (!f.type.startsWith("image/")) continue;
        const src = await fileToCompressedDataURL(f);
        next.push({ src, credit: "" });
      }
      onChange(next);
    } catch {
      toast.error("Una imagen no se pudo procesar");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-mono uppercase text-amber flex items-center gap-1">
          <ImagePlus className="w-3 h-3" /> Fotos ({photos.length}/{max})
        </span>
        <span className="text-[9px] font-mono text-muted-foreground">se comprimen solas · la info la escribes tú</span>
      </div>
      {photos.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 mb-2">
          {photos.map((p, i) => (
            <div key={i} className="relative group border border-amber-hud/40 rounded-sm overflow-hidden">
              <img src={p.src} alt={`Foto ${i + 1}`} className="w-full h-16 object-cover" />
              <button
                type="button"
                onClick={() => onChange(photos.filter((_, j) => j !== i))}
                className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-hud/90 text-white rounded-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={`Quitar foto ${i + 1}`}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      {photos.length < max && (
        <label className="flex items-center justify-center gap-2 h-9 border border-dashed border-amber-hud/50 rounded-sm text-[10px] font-mono uppercase text-muted-foreground hover:text-amber hover:border-amber-hud cursor-pointer transition-colors">
          {busy ? "procesando…" : "+ añadir fotos"}
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              handleFiles(e.target.files);
              e.currentTarget.value = "";
            }}
          />
        </label>
      )}
    </div>
  );
}

// ============ editor de pasos de armado (armas) ============
export interface AssemblyStep {
  pieza: string;
  desc: string;
}

export function AssemblyEditor({
  steps,
  onChange,
}: {
  steps: AssemblyStep[];
  onChange: (s: AssemblyStep[]) => void;
}) {
  const update = (i: number, patch: Partial<AssemblyStep>) => {
    onChange(steps.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  };
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase text-amber">Cómo se arma — piezas ({steps.length})</span>
        <button
          type="button"
          onClick={() => steps.length < 12 && onChange([...steps, { pieza: "", desc: "" }])}
          className="text-[10px] font-mono uppercase text-cyan-hud hover:text-amber flex items-center gap-1"
        >
          <Plus className="w-3 h-3" /> paso
        </button>
      </div>
      {steps.map((s, i) => (
        <div key={i} className="flex gap-1.5 items-start">
          <GripVertical className="w-3 h-3 text-muted-foreground mt-2 shrink-0" />
          <div className="flex-1 grid grid-cols-[1fr_2fr] gap-1.5">
            <input
              value={s.pieza}
              onChange={(e) => update(i, { pieza: e.target.value })}
              placeholder="Pieza (cañón, cerrojo…)"
              maxLength={60}
              className="bg-secondary border border-amber-hud/30 rounded-sm px-2 py-1.5 text-[11px] font-mono"
            />
            <input
              value={s.desc}
              onChange={(e) => update(i, { desc: e.target.value })}
              placeholder="Qué hace y cómo encaja"
              maxLength={300}
              className="bg-secondary border border-amber-hud/30 rounded-sm px-2 py-1.5 text-[11px]"
            />
          </div>
          <button
            type="button"
            onClick={() => onChange(steps.filter((_, j) => j !== i))}
            className="mt-1.5 text-muted-foreground hover:text-red-hud"
            aria-label={`Quitar paso ${i + 1}`}
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      ))}
      {steps.length === 0 && (
        <p className="text-[10px] text-muted-foreground font-mono">
          Añade cada pieza importante y su función — así aprenden los demás.
        </p>
      )}
    </div>
  );
}

// ============ editor de encuestas ============
export function PollEditor({
  options,
  onChange,
}: {
  options: string[];
  onChange: (o: string[]) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase text-amber">Opciones ({options.length}/6)</span>
        <button
          type="button"
          onClick={() => options.length < 6 && onChange([...options, ""])}
          className="text-[10px] font-mono uppercase text-cyan-hud hover:text-amber flex items-center gap-1"
        >
          <Plus className="w-3 h-3" /> opción
        </button>
      </div>
      {options.map((o, i) => (
        <div key={i} className="flex gap-1.5">
          <input
            value={o}
            onChange={(e) => onChange(options.map((x, j) => (j === i ? e.target.value : x)))}
            placeholder={`Opción ${i + 1}`}
            maxLength={80}
            className="flex-1 bg-secondary border border-amber-hud/30 rounded-sm px-2 py-1.5 text-[11px]"
          />
          {options.length > 2 && (
            <button
              type="button"
              onClick={() => onChange(options.filter((_, j) => j !== i))}
              className="text-muted-foreground hover:text-red-hud"
              aria-label={`Quitar opción ${i + 1}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

// ============ gate de contenido sensible (respetando MODO ESTRICTO 18+) ============
export function SensitiveMedia({
  sensitive,
  src,
  alt,
  className,
}: {
  sensitive: boolean;
  src: string;
  alt: string;
  className?: string;
}) {
  const [revealed, setRevealed] = useState(false);
  const [strict, setStrictState] = useState(isStrict18());

  if (!sensitive) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt} className={className} loading="lazy" />
    );
  }

  // MODO ESTRICTO: NUNCA se muestra — ni siquiera censurado
  if (strict) {
    return (
      <div className={cn("flex flex-col items-center justify-center gap-1 bg-red-hud/10 border border-red-hud/40", className)} aria-label="Contenido oculto por el modo estricto 18+">
        <EyeOff className="w-5 h-5 text-red-hud" />
        <span className="text-[9px] font-mono uppercase text-red-hud tracking-widest text-center px-2">
          Oculto por tu modo estricto 18+
        </span>
      </div>
    );
  }

  // Modo normal: censura con confirmación explícita
  if (!revealed) {
    return (
      <button
        type="button"
        onClick={() => setRevealed(true)}
        className={cn("relative group bg-secondary overflow-hidden", className)}
        aria-label="Contenido sensible — click para revelar"
      >
        <div className="absolute inset-0 backdrop-blur-md bg-black/40" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
          <span className="text-[10px] font-mono font-bold text-red-hud uppercase tracking-widest">18+ SENSIBLE</span>
          <span className="text-[9px] font-mono text-muted-foreground group-hover:text-foreground">Click para revelar</span>
        </div>
      </button>
    );
  }
  return (
    <button type="button" onClick={() => setRevealed(false)} className={cn("relative", className)} aria-label="Ocultar contenido sensible">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="w-full h-full object-cover" loading="lazy" />
      <span className="absolute top-1 right-1 px-1.5 py-0.5 bg-red-hud/80 text-white text-[8px] font-mono uppercase">18+</span>
    </button>
  );
}

// ============ estrellas de calificación ============
export function StarRating({
  ratingSum,
  ratingCount,
  onRate,
  myRating,
}: {
  ratingSum: number;
  ratingCount: number;
  onRate?: (v: number) => void;
  myRating?: number;
}) {
  const [hover, setHover] = useState(0);
  const avg = ratingCount ? ratingSum / ratingCount : 0;
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!onRate || !!myRating}
          onClick={() => onRate?.(n)}
          onMouseEnter={() => onRate && !myRating && setHover(n)}
          onMouseLeave={() => setHover(0)}
          aria-label={`Calificar con ${n} estrellas`}
          className={cn(
            "transition-colors",
            onRate && !myRating ? "hover:scale-110 cursor-pointer" : "cursor-default"
          )}
        >
          <Star
            className={cn(
              "w-3.5 h-3.5",
              (hover || myRating || Math.round(avg)) >= n ? "fill-amber text-amber" : "text-muted-foreground/50"
            )}
          />
        </button>
      ))}
      <span className="text-[9px] font-mono text-muted-foreground ml-0.5">
        {ratingCount ? `${avg.toFixed(1)} (${ratingCount})` : "sin calificar"}
      </span>
    </div>
  );
}

// ============ tarjeta universal de contenido creado ============
const STATUS_META: Record<string, { icon: React.ReactNode; cls: string; label: string }> = {
  APROBADO: { icon: <ShieldCheck className="w-3 h-3" />, cls: "text-green-hud border-green-hud/50", label: "APROBADO POR IA" },
  PENDIENTE: { icon: <Clock className="w-3 h-3" />, cls: "text-amber border-amber-hud/50", label: "EN REVISIÓN" },
  ELIMINADO: { icon: <XCircle className="w-3 h-3" />, cls: "text-red-hud border-red-hud/50", label: "ELIMINADO POR IA" },
};

export function StatusBadge({ status, reason, ai }: { status: string; reason?: string; ai?: boolean }) {
  const meta = STATUS_META[status];
  if (!meta) return null;
  return (
    <div className={cn("inline-flex flex-col gap-0.5 px-1.5 py-0.5 border rounded-sm", meta.cls)}>
      <span className="flex items-center gap-1 text-[8px] font-mono font-bold uppercase tracking-widest">
        {meta.icon} {meta.label} {ai ? "· AGENTE IA" : ""}
      </span>
      {reason && <span className="text-[8px] opacity-80 max-w-[260px]">{reason}</span>}
    </div>
  );
}

export function UgcCard({
  item,
  myVote,
  onLike,
  onRate,
  onPlay,
  onVotePoll,
  onClassify,
  onReport,
  onDelete,
}: {
  item: UgcItem;
  myVote: boolean;
  onLike?: (item: UgcItem) => void;
  onRate?: (item: UgcItem, v: number) => void;
  onPlay?: (item: UgcItem) => void;
  onVotePoll?: (item: UgcItem, idx: number) => void;
  onClassify?: (item: UgcItem, label: string) => void;
  onReport?: (item: UgcItem) => void;
  onDelete?: (item: UgcItem) => void;
}) {
  const alias = useGameStore((s) => s.alias);
  const [expanded, setExpanded] = useState(false);
  const photos = parseJSON<UgcPhoto[]>(item.photos, []);
  const specs = parseJSON<Record<string, string>>(item.specs, {});
  const assembly = parseJSON<AssemblyStep[]>(item.assembly, []);
  const polls = parseJSON<{ label: string; votes: number }[]>(item.pollOptions, []);
  const meta = KIND_META[item.kind] ?? { label: item.kind, emoji: "📦", accent: "amber" };
  const totalVotes = polls.reduce((a, p) => a + p.votes, 0);
  const ytEmbed = (() => {
    const m = item.videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{6,})/);
    return m ? `https://www.youtube.com/embed/${m[1]}` : item.videoUrl || "";
  })();

  return (
    <div className="hud-panel border-amber-hud/40 p-3 flex flex-col gap-2">
      {/* cabecera */}
      <div className="flex items-start gap-2">
        <Countryball code={item.authorBall} size={28} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-foreground truncate">{item.title}</span>
            <span className="text-[8px] font-mono uppercase px-1 py-0.5 bg-secondary rounded-sm text-muted-foreground shrink-0">
              {meta.emoji} {meta.label}
            </span>
            {item.sensitive && (
              <span className="text-[8px] font-mono px-1 py-0.5 bg-red-hud/30 text-red-hud rounded-sm shrink-0">18+</span>
            )}
          </div>
          <div className="text-[9px] font-mono text-muted-foreground">
            @{item.author} · {item.country ? countryName(item.country) || item.country : "mundo"} · {timeAgo(item.createdAt)}
            {item.kind === "juego" && ` · ${item.plays} jugadas`}
            {item.kind === "musica" && item.audioGenre && ` · ${item.audioGenre}`}
          </div>
        </div>
        {item.status !== "APROBADO" && <StatusBadge status={item.status} reason={item.aiReason} ai={item.aiModerated} />}
      </div>

      {/* fotos (respeta modo estricto 18+) */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-1">
          {photos.slice(0, 3).map((p, i) => (
            <SensitiveMedia
              key={i}
              sensitive={item.sensitive}
              src={p.src}
              alt={`${item.title} — foto ${i + 1}`}
              className={cn("w-full object-cover rounded-sm border border-amber-hud/20", photos.length === 1 ? "h-36 col-span-3" : "h-20")}
            />
          ))}
        </div>
      )}

      {/* resumen + cuerpo expandible */}
      {item.summary && <p className="text-[11px] text-foreground/90 leading-snug">{item.summary}</p>}
      {item.body && (
        <div>
          <p className={cn("text-[11px] text-muted-foreground leading-snug whitespace-pre-line", !expanded && "line-clamp-2")}>
            {item.body}
          </p>
          {item.body.length > 140 && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="text-[9px] font-mono uppercase text-cyan-hud hover:text-amber flex items-center gap-0.5"
            >
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {expanded ? "menos" : "leer toda la info"}
            </button>
          )}
        </div>
      )}

      {/* ARMA: specs + armado */}
      {item.kind === "arma" && Object.keys(specs).length > 0 && (
        <div className="grid grid-cols-2 gap-1">
          {Object.entries(specs).map(([k, v]) =>
            v ? (
              <div key={k} className="bg-secondary/50 rounded-sm px-1.5 py-1">
                <div className="text-[8px] font-mono uppercase text-muted-foreground">{k}</div>
                <div className="text-[10px] font-mono text-foreground">{v}</div>
              </div>
            ) : null
          )}
        </div>
      )}
      {item.kind === "arma" && assembly.length > 0 && (
        <details className="bg-secondary/30 rounded-sm">
          <summary className="text-[10px] font-mono uppercase text-amber px-2 py-1 cursor-pointer">
            Cómo se arma ({assembly.length} piezas)
          </summary>
          <ol className="px-3 pb-2 space-y-1">
            {assembly.map((s, i) => (
              <li key={i} className="text-[10px] text-foreground/90">
                <span className="font-mono text-amber">{i + 1}. {s.pieza}</span> — {s.desc}
              </li>
            ))}
          </ol>
        </details>
      )}

      {/* JUEGO: jugar inline */}
      {item.kind === "juego" && (
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onPlay?.(item)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-hud/40 border border-amber-hud text-amber rounded-sm text-[10px] font-mono uppercase font-bold hover:bg-amber-hud/70 transition-colors"
          >
            <Play className="w-3.5 h-3.5" /> Jugar ahora
          </button>
          <span className="text-[9px] font-mono text-muted-foreground uppercase">
            {item.gamePlatform === "movil" ? "📱 móvil" : item.gamePlatform === "ambos" ? "📱💻 pc+móvil" : "💻 pc"}
            {item.gameUrl && (
              <a href={item.gameUrl} target="_blank" rel="noreferrer" className="ml-1.5 text-cyan-hud inline-flex items-center gap-0.5">
                original <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}
          </span>
        </div>
      )}

      {/* MÚSICA: reproductor + clasificación */}
      {item.kind === "musica" && item.audioData && (
        <div className="space-y-1">
          <audio controls preload="none" src={item.audioData} className="w-full h-8" onPlay={() => onPlay?.(item)} />
          <div className="flex gap-1 flex-wrap items-center">
            {["épica", "triste", "marcha", "tensión", "ambiental", "himno"].map((g) => (
              <button
                key={g}
                onClick={() => onClassify?.(item, g)}
                className="px-1.5 py-0.5 text-[9px] font-mono uppercase border border-cyan-hud/40 text-cyan-hud rounded-sm hover:bg-cyan-hud/20"
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* VIDEO: embed */}
      {item.kind === "video" && ytEmbed && (
        <div className="aspect-video w-full">
          <iframe
            src={ytEmbed}
            title={item.title}
            allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture"
            allowFullScreen
            className="w-full h-full border border-amber-hud/30 rounded-sm"
            sandbox="allow-scripts allow-same-origin allow-presentation"
          />
        </div>
      )}

      {/* ENCUESTA: votación */}
      {item.kind === "encuesta" && polls.length > 0 && (
        <div className="space-y-1">
          {polls.map((p, i) => {
            const pct = totalVotes ? Math.round((p.votes / totalVotes) * 100) : 0;
            return (
              <button
                key={i}
                onClick={() => onVotePoll?.(item, i)}
                className="w-full text-left group relative overflow-hidden bg-secondary/40 border border-amber-hud/30 rounded-sm px-2 py-1.5 hover:border-amber-hud"
              >
                <div className="absolute inset-y-0 left-0 bg-amber-hud/20 transition-all" style={{ width: `${pct}%` }} />
                <div className="relative flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono text-foreground">{p.label}</span>
                  <span className="text-[9px] font-mono text-amber shrink-0">{pct}% · {p.votes}</span>
                </div>
              </button>
            );
          })}
          <div className="text-[8px] font-mono text-muted-foreground uppercase">{totalVotes} votos · 1 voto por agente</div>
        </div>
      )}

      {/* BANDERA: render desde la composición JSON (v27) */}
      {item.kind === "bandera" && Object.keys(specs).length > 0 && (
        <div className="flex justify-center py-1">
          <FlagRender design={specs as unknown as FlagDesign} width={190} />
        </div>
      )}

      {/* MAPA: render de flechas/marcadores (v27) */}
      {item.kind === "mapa" && Object.keys(specs).length > 0 && (
        <div className="py-1">
          <MapRender design={specs as unknown as MapDesign} />
        </div>
      )}

      {/* STICKER: imagen grande única */}
      {item.kind === "sticker" && photos.length > 0 && (
        <div className="flex justify-center">
          <SensitiveMedia
            sensitive={item.sensitive}
            src={photos[0].src}
            alt={item.title}
            className="h-40 w-40 object-contain rounded-sm border border-violet-hud/40 bg-secondary/30"
          />
        </div>
      )}

      {/* DECRETO: sello presidencial */}
      {item.kind === "decreto" && (
        <div className="flex items-center gap-2 border border-amber-hud/50 bg-amber-hud/10 rounded-sm px-2 py-1.5">
          <Landmark className="w-5 h-5 text-amber shrink-0" />
          <div className="text-[9px] font-mono uppercase text-amber leading-tight">
            Decreto presidencial de {countryName(item.country) || item.country}
            <div className="text-muted-foreground normal-case">Documento oficial del gobierno — fijado por poder político</div>
          </div>
        </div>
      )}

      {/* acciones */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-amber-hud/20">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onLike?.(item)}
            className={cn(
              "flex items-center gap-1 text-[10px] font-mono transition-colors",
              myVote ? "text-red-hud" : "text-muted-foreground hover:text-amber"
            )}
          >
            <ThumbsUp className={cn("w-3.5 h-3.5", myVote && "fill-red-hud")} /> {item.likes}
          </button>
          {(item.kind === "musica" || item.kind === "juego") && (
            <StarRating ratingSum={item.ratingSum} ratingCount={item.ratingCount} onRate={onRate ? (v) => onRate(item, v) : undefined} />
          )}
          <UgcComments itemId={item.id} />
        </div>
        <div className="flex items-center gap-1.5">
          {item.author === alias && onDelete && (
            <button onClick={() => onDelete(item)} className="text-[9px] font-mono uppercase text-muted-foreground hover:text-red-hud">
              borrar
            </button>
          )}
          {onReport && item.author !== alias && (
            <button onClick={() => onReport(item)} className="text-muted-foreground hover:text-red-hud" aria-label="Reportar contenido">
              <Flag className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============ v27 COMENTARIOS (la comunidad comenta TODO) ============
interface UgcCommentRow {
  id: string;
  author: string;
  authorBall: string;
  text: string;
  createdAt: string;
}

export function UgcComments({ itemId }: { itemId: string }) {
  const alias = useGameStore((s) => s.alias);
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<UgcCommentRow[] | null>(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const res = await fetch(`/api/ugc/comments?itemId=${itemId}`, { cache: "no-store" });
      const data = await res.json();
      setRows(data.comments ?? []);
    } catch {
      setRows([]);
    }
  };

  const send = async () => {
    if (!text.trim() || busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/ugc/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, author: alias || "ANÓNIMO", text }),
      });
      const data = await res.json();
      if (data.eliminated) {
        toast.error(`ELIMINADO POR EL AGENTE IA — ${data.reason ?? "contenido inapropiado"}`);
      } else if (res.ok) {
        toast.success("Comentario publicado");
        setText("");
        await load();
      } else {
        toast.error(data.error ?? "No se pudo comentar");
      }
    } catch {
      toast.error("Sin conexión con el estudio");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-w-0">
      <button
        onClick={() => {
          setOpen((v) => !v);
          if (!open && rows === null) void load();
        }}
        className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground hover:text-cyan-hud transition-colors"
      >
        <MessageCircle className="w-3.5 h-3.5" /> {rows?.length ?? "…"}
      </button>
      {open && (
        <div className="mt-2 space-y-1.5 w-full">
          {rows === null && <div className="text-[9px] font-mono text-muted-foreground">cargando comentarios…</div>}
          {rows?.length === 0 && <div className="text-[9px] font-mono text-muted-foreground">Sé el primero en comentar</div>}
          {rows?.map((c) => (
            <div key={c.id} className="flex items-start gap-1.5 bg-secondary/40 rounded-sm px-1.5 py-1">
              <Countryball code={c.authorBall} size={16} />
              <div className="min-w-0">
                <span className="text-[9px] font-mono text-amber">@{c.author}</span>{" "}
                <span className="text-[10px] text-foreground/90 break-words">{c.text}</span>
              </div>
            </div>
          ))}
          <div className="flex gap-1">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void send()}
              placeholder="Escribe tu comentario… (el agente IA lo revisa)"
              maxLength={500}
              className="flex-1 min-w-0 bg-secondary border border-amber-hud/30 rounded-sm px-2 py-1 text-[10px]"
            />
            <button
              onClick={() => void send()}
              disabled={busy || !text.trim()}
              className="px-2 bg-cyan-hud/30 border border-cyan-hud rounded-sm text-cyan-hud disabled:opacity-40"
              aria-label="Enviar comentario"
            >
              <Send className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============ v27 BANDERAS — composición + render ============
export interface FlagDesign {
  dir: "h" | "v"; // franjas horizontales o verticales
  colors: string[]; // 1-5 franjas
  circle: string; // color del disco central ("" = sin disco)
  symbol: string; // emoji/símbolo central (★ ☭ ⚒ ✚ ☀ ⚙ ⚜ 🦅 …)
  symbolColor: string;
  text: string; // lema corto
  textColor: string;
}

export const FLAG_SYMBOLS = ["", "★", "☭", "⚒", "✚", "☀", "⚙", "⚜", "🦅", "🌙", "⚔", "🕊", "🔥", "👑", "🔱", "🌍"];
export const FLAG_PALETTE = ["#000000", "#ffffff", "#c8102e", "#0038a8", "#006233", "#fcd116", "#ff7f00", "#750785", "#6d4c41", "#009688"];

export function defaultFlagDesign(): FlagDesign {
  return {
    dir: "h",
    colors: ["#c8102e", "#fcd116", "#006233"],
    circle: "",
    symbol: "★",
    symbolColor: "#ffffff",
    text: "",
    textColor: "#ffffff",
  };
}

export function FlagRender({ design, width = 200 }: { design: FlagDesign; width?: number }) {
  const d = { ...defaultFlagDesign(), ...design };
  const colors = (d.colors?.length ? d.colors : ["#333"]).slice(0, 5);
  const h = Math.round(width * 0.66);
  return (
    <div
      className="relative overflow-hidden rounded-[3px] border border-black/40 shadow-md shrink-0"
      style={{ width, height: h, display: "flex", flexDirection: d.dir === "h" ? "column" : "row" }}
      aria-label="bandera diseñada por la comunidad"
    >
      {colors.map((c, i) => (
        <div key={i} style={{ flex: 1, background: c }} />
      ))}
      {d.circle && (
        <div
          className="absolute rounded-full"
          style={{
            width: h * 0.52,
            height: h * 0.52,
            background: d.circle,
            left: "50%",
            top: "50%",
            transform: "translate(-50%,-50%)",
          }}
        />
      )}
      {d.symbol && (
        <div
          className="absolute inset-0 flex items-center justify-center select-none"
          style={{ color: d.symbolColor, fontSize: h * 0.42, lineHeight: 1, textShadow: "0 1px 3px rgba(0,0,0,.45)" }}
        >
          {d.symbol}
        </div>
      )}
      {d.text && (
        <div
          className="absolute left-0 right-0 flex justify-center select-none"
          style={{ bottom: h * 0.06, color: d.textColor, fontSize: Math.max(9, h * 0.13), fontWeight: 800, textShadow: "0 1px 2px rgba(0,0,0,.6)" }}
        >
          {d.text.slice(0, 24)}
        </div>
      )}
    </div>
  );
}

// ============ v27 MAPAS — composición (flechas, marcadores, etiquetas) + render ============
export interface MapItem {
  id: string;
  type: "arrow" | "marker" | "label" | "zone";
  x: number; // % del ancho
  y: number; // % del alto
  x2?: number; // destino de flecha (%)
  y2?: number;
  color: string;
  text?: string;
  icon?: string;
}

export interface MapDesign {
  items: MapItem[];
  title: string;
}

export const MAP_COLORS = ["#ef4444", "#f59e0b", "#22d3ee", "#a855f7", "#22c55e", "#ffffff"];
export const MAP_ICONS = ["⚔", "🚩", "🎯", "🛡", "✈", "🚀", "🔥", "⚓"];

// Render del mapa editado: capa base SVG del mundo + overlay de la composición.
export function MapRender({ design, height = 300 }: { design: MapDesign; height?: number }) {
  const d: MapDesign = {
    items: Array.isArray(design?.items) ? design.items : [],
    title: design?.title ?? "",
  };
  return (
    <div className="relative w-full overflow-hidden rounded-sm border border-amber-hud/30 bg-[#0a1520]" style={{ aspectRatio: "2 / 1", maxHeight: height }}>
      <div className="absolute inset-0 opacity-60 [&_svg]:w-full [&_svg]:h-full">
        <WorldMapBase />
      </div>
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 62" preserveAspectRatio="none">
        {d.items.map((it) => {
          const X = (it.x / 100) * 100;
          const Y = (it.y / 100) * 62;
          if (it.type === "arrow" && it.x2 !== undefined && it.y2 !== undefined) {
            const X2 = (it.x2 / 100) * 100;
            const Y2 = (it.y2 / 100) * 62;
            const ang = (Math.atan2(Y2 - Y, X2 - X) * 180) / Math.PI;
            return (
              <g key={it.id} id={`mapitem-${it.id}`}>
                <line x1={X} y1={Y} x2={X2} y2={Y2} stroke={it.color} strokeWidth={0.9} strokeLinecap="round" opacity={0.9} />
                <polygon
                  points={`0,-1.6 3,0 0,1.6`}
                  fill={it.color}
                  transform={`translate(${X2},${Y2}) rotate(${ang})`}
                />
              </g>
            );
          }
          if (it.type === "zone") {
            return <ellipse key={it.id} id={`mapitem-${it.id}`} cx={X} cy={Y} rx={5} ry={3} fill={it.color} opacity={0.22} stroke={it.color} strokeWidth={0.4} strokeDasharray="1.6 1.2" />;
          }
          return null;
        })}
      </svg>
      {d.items
        .filter((it) => it.type === "marker" || it.type === "label")
        .map((it) => (
          <div
            key={it.id}
            id={`mapitem-${it.id}`}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-0.5 select-none"
            style={{ left: `${it.x}%`, top: `${it.y}%` }}
          >
            {it.type === "marker" && <span style={{ fontSize: 13, filter: "drop-shadow(0 1px 2px rgba(0,0,0,.7))" }}>{it.icon || "🚩"}</span>}
            {it.text && (
              <span
                className="text-[9px] font-mono font-bold px-1 rounded-sm whitespace-nowrap"
                style={{ color: it.color, background: "rgba(0,0,0,.55)", border: `1px solid ${it.color}66` }}
              >
                {it.text.slice(0, 28)}
              </span>
            )}
          </div>
        ))}
      {d.title && (
        <div className="absolute bottom-1 right-1.5 text-[9px] font-mono text-amber bg-black/60 px-1.5 py-0.5 rounded-sm">{d.title}</div>
      )}
    </div>
  );
}

// Capa base mínima del mundo para el render (usa el mismo world-svg del proyecto)
export function WorldMapBase() {
  return <WorldMapSVG showGrid={false} showFronts={false} showSat={false} />;
}

// ============ v27 BIBLIOTECA DE PIEZAS DE ARMAS (forja completa) ============
export const PART_LIBRARY: { group: string; parts: string[] }[] = [
  {
    group: "Núcleo",
    parts: ["Cañón", "Cerrojo", "Recámara", "Culata", "Guardamanos", "Ánima rayada", "Gatillo", "Cargador", "Muelle recuperador", "Émbolo de gas"],
  },
  {
    group: "Óptica y mira",
    parts: ["Mira holográfica", "Visor telescópico 4x", "Visor térmico", "Puntero láser", "Miras de hierro", "Visor nocturno PNV"],
  },
  {
    group: "Drones",
    parts: ["Motor brushless", "Hélices 5\"", "Batería LiPo 6S", "Cámara FPV", "Antena patch", "Controladora de vuelo", "Cabeza de guerra PG-7", "GPS module", "Estación de control"],
  },
  {
    group: "Accesorios",
    parts: ["Bípode", "Supresor", "Cinturón táctico", "Correa de transporte", "Raíl Picatinny", "Lanzagranadas", "Cantina", "Chaleco balístico"],
  },
];

export function PartLibraryPicker({ onPick }: { onPick: (part: string) => void }) {
  return (
    <div className="border border-amber-hud/30 rounded-sm p-2 bg-secondary/30">
      <div className="text-[9px] font-mono uppercase text-muted-foreground flex items-center gap-1 mb-1.5">
        <MousePointerClick className="w-3 h-3" /> Biblioteca de piezas — 1 click para añadir el paso
      </div>
      <div className="space-y-1.5">
        {PART_LIBRARY.map((g) => (
          <div key={g.group}>
            <div className="text-[8px] font-mono uppercase text-amber mb-0.5 flex items-center gap-1">
              <Swords className="w-2.5 h-2.5" /> {g.group}
            </div>
            <div className="flex flex-wrap gap-1">
              {g.parts.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => onPick(p)}
                  className="px-1.5 py-0.5 text-[9px] font-mono bg-secondary border border-amber-hud/25 rounded-sm hover:border-amber-hud hover:bg-amber-hud/20 transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
