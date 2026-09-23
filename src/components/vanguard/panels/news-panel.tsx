"use client";

import { useEffect, useState } from "react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { Newspaper, ExternalLink, RefreshCw, Radio, Clock, MessageSquare, Send, BadgeCheck, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGameStore } from "@/lib/game-store";
import { Skeleton } from "@/components/ui/skeleton";
import { Flag } from "@/lib/flags";
import { countryName } from "@/lib/world-data";
import { renderWithStickers } from "@/components/vanguard/countryball";
import { toast } from "sonner";
import { useT } from "@/lib/i18n";

interface NewsItem {
  id: string;
  title: string;
  url: string;
  source: string;
  imageUrl: string | null;
  publishedAt: string;
  tacticalTag: string | null;
  conflictTag: string | null;
  sourceCountry?: string | null;
}

// v13 — credibilidad por fuente (agencias primarias vs agregadores)
const SOURCE_CRED: Record<string, number> = {
  reuters: 97, ap: 96, "associated press": 96, bbc: 93, "bbc news": 93, "the guardian": 89,
  "ny times": 88, "new york times": 88, dw: 87, "france 24": 86, "al jazeera": 84, cnn: 81,
  "google news": 72, gnews: 72, "wikipedia": 75,
};
function veracityOf(source: string): number {
  const s = (source || "").toLowerCase();
  for (const key of Object.keys(SOURCE_CRED)) {
    if (s.includes(key)) return SOURCE_CRED[key];
  }
  return 55;
}

const tagColor: Record<string, string> = {
  ALERTA: "text-red-hud border-red-hud bg-red-hud/50",
  DIPLOMACIA: "text-cyan-hud border-cyan-hud bg-cyan-hud/50",
  ECONOMIA: "text-amber border-amber-hud bg-amber-hud/50",
  HUMANITARIO: "text-violet-hud border-violet-hud bg-violet-hud/50",
  ANALISIS: "text-green-hud border-green-hud bg-green-hud/50",
  INFO: "text-muted-foreground border-border bg-secondary",
};

const VOTE_KEY = "vanguard-news-votes-v13";
type VoteMap = Record<string, "REAL" | "FAKE">;

export function NewsPanel() {
  const [items, setItems] = useState<NewsItem[]>(() => {
    // v36: caché local — el panel abre con las últimas buenas aunque la red falle
    if (typeof window === "undefined") return [];
    try {
      const arr = JSON.parse(localStorage.getItem("vanguard-news-cache") || "[]");
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState("");
  const [filter, setFilter] = useState<string>("ALL");
  const [commentOpen, setCommentOpen] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const recordViewNews = useGameStore((s) => s.recordViewNews);
  const addCoins = useGameStore((s) => s.addCoins);
  const comments = useGameStore((s) => s.comments);
  const addComment = useGameStore((s) => s.addComment);
  const alias = useGameStore((s) => s.alias);
  const [votes, setVotes] = useState<VoteMap>({});
  const { t } = useT();
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    try {
      setVotes(JSON.parse(localStorage.getItem(VOTE_KEY) ?? "") as VoteMap);
    } catch {
      setVotes({});
    }
  }, []);

  const voteVerdict = (id: string, v: "REAL" | "FAKE", veracity: number) => {
    if (votes[id]) return;
    const ns = { ...votes, [id]: v };
    setVotes(ns);
    localStorage.setItem(VOTE_KEY, JSON.stringify(ns));
    addCoins(5, "NOTICIAS: veredicto comunitario");
    const agree = (v === "REAL" && veracity >= 60) || (v === "FAKE" && veracity < 60);
    if (agree) toast.success("Veredicto alineado con la IA · +5 mon");
    else toast("Veredicto registrado — la IA discrepa de ti");
  };

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/news", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const list = Array.isArray(data.items) ? data.items : [];
      if (list.length === 0) throw new Error("empty");
      setItems(list);
      setSource(data.source ?? "");
      setLastUpdated(new Date());
      try {
        localStorage.setItem("vanguard-news-cache", JSON.stringify(list.slice(0, 12)));
      } catch {
        /* noop */
      }
    } catch {
      // v36: con caché ya visible no asustamos con toast en cada reintento;
      // solo avisamos si el panel seguiría totalmente vacío.
      if (!silent && items.length === 0) {
        toast.error("Radar sin señal — mostrando últimas guardadas");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // auto-refresh every 60s (silent: sin spinner ni toasts si la red parpadea)
    const t = setInterval(() => load(true), 60_000);
    return () => clearInterval(t);
  }, []);

  const handleOpen = (item: NewsItem) => {
    recordViewNews(item.id);
    if (item.url && item.url.startsWith("http")) {
      window.open(item.url, "_blank", "noopener,noreferrer");
    }
  };

  const submitComment = (id: string) => {
    if (commentText.trim().length < 2) {
      toast.error("Comentario muy corto");
      return;
    }
    addComment(`news:${id}`, commentText);
    setCommentText("");
    toast.success("Comentario publicado (+2 XP)");
  };

  const commentsFor = (id: string) => comments[`news:${id}`] ?? [];

  const filtered = filter === "ALL" ? items : items.filter((i) => i.tacticalTag === filter);
  const tags = ["ALL", "ALERTA", "DIPLOMACIA", "ECONOMIA", "HUMANITARIO", "ANALISIS"];

  return (
    <div className="space-y-3">
      <PanelHeader
        title="Noticias en vivo"
        subtitle={`Cables automaticos · fuente: ${source || "..."}`}
        icon={<Newspaper className="w-4 h-4 text-amber" />}
        color="amber"
        right={
          <Button
            size="sm"
            onClick={load}
            disabled={loading}
            variant="outline"
            className="h-8 font-mono text-[10px] uppercase border-amber-hud text-amber hover:bg-amber-hud"
          >
            <RefreshCw className={cn("w-3 h-3 mr-1", loading && "animate-spin")} /> Refrescar
          </Button>
        }
      />

      {/* Status bar */}
      <div className="hud-corner p-2 flex items-center gap-3 text-[10px] font-mono">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-hud blink-soft" />
          <span className="text-green-hud">LIVE</span>
        </div>
        {/* v21: indicador de AUTO-ACTUALIZACIÓN infinita */}
        <div className="flex items-center gap-1.5" title={t("news.autoOn")}>
          <span className="px-1.5 py-0.5 border border-electric-hud text-electric bg-electric/10 uppercase font-bold tracking-widest">
            <RefreshCw className={cn("w-2.5 h-2.5 inline mr-1", loading && "animate-spin")} />{t("news.auto")}
          </span>
          {lastUpdated && (
            <span className="text-muted-foreground hidden sm:inline">
              {t("news.updated")} {lastUpdated.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          )}
        </div>
        <span className="text-muted-foreground">·</span>
        <span className="text-muted-foreground">{items.length} cables</span>
        <span className="text-muted-foreground">·</span>
        <span className="flex items-center gap-1 text-amber">
          <Radio className="w-3 h-3" /> actualizacion auto 60s
        </span>
        <div className="ml-auto flex items-center gap-1">
          {tags.map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={cn(
                "px-1.5 py-0.5 border text-[9px] uppercase",
                filter === t
                  ? "border-amber-hud text-amber bg-amber-hud/50"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="grid gap-2">
        {loading && items.length === 0
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="hud-corner p-3">
                <Skeleton className="h-3 w-2/3 bg-secondary mb-2" />
                <Skeleton className="h-3 w-1/2 bg-secondary mb-1" />
                <Skeleton className="h-3 w-1/3 bg-secondary" />
              </div>
            ))
          : filtered.map((item, idx) => (
              <article
                key={item.id}
                className="hud-corner p-3 hover:bg-secondary/40 transition-colors cursor-pointer group"
                onClick={() => handleOpen(item)}
              >
                <div className="flex items-start gap-3">
                  {item.imageUrl ? (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 overflow-hidden hud-corner border-amber-hud/40 bg-secondary">
                      <img
                        src={item.imageUrl}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 hud-corner bg-secondary/40 flex items-center justify-center">
                      <Newspaper className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      {(() => {
                        const v = veracityOf(item.source);
                        return v >= 80 ? (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 border border-neon-hud text-neon bg-neon-hud/40 uppercase flex items-center gap-1">
                            <BadgeCheck className="w-3 h-3" /> verificada {v}%
                          </span>
                        ) : v >= 60 ? (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 border border-amber-hud text-amber bg-amber-hud/40 uppercase flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3" /> dudosa {v}%
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 border border-crisis-hud text-crisis bg-crisis-hud/40 uppercase flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3" /> no verificada {v}%
                          </span>
                        );
                      })()}
                      {item.tacticalTag && (
                        <span className={cn("text-[9px] font-mono px-1.5 py-0.5 border uppercase", tagColor[item.tacticalTag] || tagColor.INFO)}>
                          {item.tacticalTag}
                        </span>
                      )}
                      {item.conflictTag && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 border border-violet-hud text-violet-hud bg-violet-hud/30 uppercase">
                          #{item.conflictTag}
                        </span>
                      )}
                      {item.sourceCountry && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 border border-border text-muted-foreground uppercase flex items-center gap-1" title={`País del conflicto: ${countryName(item.sourceCountry)}`}>
                          <Flag code={item.sourceCountry} size={14} title={countryName(item.sourceCountry)} />
                          {countryName(item.sourceCountry)}
                        </span>
                      )}
                      <span className="text-[9px] font-mono text-muted-foreground ml-auto flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        {timeAgo(item.publishedAt)}
                      </span>
                    </div>
                    <h3 className="text-sm font-medium text-foreground group-hover:text-amber transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    {/* barra de credibilidad + voto Real/Fake (v13) */}
                    <div className="mt-1.5">
                      <div className="h-1 bg-secondary overflow-hidden max-w-56">
                        <div
                          className="h-full"
                          style={{
                            width: `${veracityOf(item.source)}%`,
                            background: veracityOf(item.source) >= 80 ? "#00FF87" : veracityOf(item.source) >= 60 ? "#FFD60A" : "#FF3B30",
                          }}
                        />
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        {votes[item.id] ? (
                          <span className="text-[9px] font-mono text-muted-foreground uppercase">
                            tu voto: <span className={votes[item.id] === "REAL" ? "text-neon" : "text-crisis"}>{votes[item.id]}</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <span className="text-[9px] font-mono text-muted-foreground uppercase">¿real o fake?</span>
                            <button
                              onClick={(e) => { e.stopPropagation(); voteVerdict(item.id, "REAL", veracityOf(item.source)); }}
                              className="text-[9px] font-mono uppercase px-1.5 py-0.5 border border-neon-hud text-neon hover:bg-neon-hud/30"
                            >
                              real +5
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); voteVerdict(item.id, "FAKE", veracityOf(item.source)); }}
                              className="text-[9px] font-mono uppercase px-1.5 py-0.5 border border-crisis-hud text-crisis hover:bg-crisis-hud/30"
                            >
                              fake +5
                            </button>
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[10px] font-mono text-muted-foreground uppercase">
                        {item.source} · cable #{String(idx + 1).padStart(3, "0")}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCommentOpen(commentOpen === item.id ? null : item.id);
                          }}
                          className={cn(
                            "flex items-center gap-1 text-[10px] font-mono uppercase transition-colors",
                            commentOpen === item.id ? "text-amber" : "text-muted-foreground hover:text-amber"
                          )}
                        >
                          <MessageSquare className="w-3 h-3" />
                          {commentsFor(item.id).length > 0 ? commentsFor(item.id).length : "comentar"}
                        </button>
                        <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-amber" />
                      </div>
                    </div>

                    {/* Comentarios del cable */}
                    {commentOpen === item.id && (
                      <div
                        className="mt-2 pt-2 border-t border-amber-hud/20"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex gap-1.5 mb-2">
                          <Input
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder={`Comentar como ${alias || "OPERADOR"}... (+2 XP)`}
                            className="h-7 bg-background/60 border-border font-mono text-[11px]"
                            maxLength={600}
                            onKeyDown={(e) => e.key === "Enter" && submitComment(item.id)}
                          />
                          <Button
                            size="sm"
                            onClick={() => submitComment(item.id)}
                            className="h-7 px-2 bg-amber-hud border border-amber-hud text-amber hover:bg-amber-hud/70"
                            aria-label="Publicar comentario"
                          >
                            <Send className="w-3 h-3" />
                          </Button>
                        </div>
                        {commentsFor(item.id).length > 0 && (
                          <div className="space-y-1.5 max-h-40 overflow-y-auto thin-scroll pr-1">
                            {[...commentsFor(item.id)].reverse().map((c) => (
                              <div key={c.id} className="p-1.5 bg-secondary/40 border border-border/60">
                                <span className="text-[9px] font-mono text-amber uppercase">{c.author}</span>
                                <p className="text-[11px] text-foreground/90 leading-snug">{renderWithStickers(c.body)}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}
      </div>

      {!loading && filtered.length === 0 && (
        <div className="hud-corner p-8 text-center text-muted-foreground">
          <Newspaper className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm font-mono">Sin cables en este filtro</p>
        </div>
      )}
    </div>
  );
}

function timeAgo(iso: string) {
  const date = new Date(iso);
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "ahora";
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}
