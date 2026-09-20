"use client";

// Vanguard v6.2 — Foros de la red: orden (recientes/calientes/top), busqueda,
// likes en respuestas y badge de mejor respuesta.
// v24 — MEJORA DE FOROS Y DENUNCIAS: pestaña DENUNCIAS con evidencia,
// estados de seguimiento (recibida → investigación → verificada), apoyo
// comunitario y peso x2 del voto de embajadores.
import { useEffect, useMemo, useState } from "react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import {
  MessagesSquare, Pin, Eye, ThumbsUp, MessageSquarePlus, CornerDownRight, Hash,
  Flame, Trophy, Clock, Search, Award, Scale, ShieldAlert, MapPin, Gavel,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useGameStore } from "@/lib/game-store";
import { FORUM_SEED, FORUM_CATEGORIES, FORUM_CAT_COLOR, hoursAgoToText, formatViews } from "@/lib/social-data";
import { toast } from "sonner";

interface ThreadView {
  id: string;
  title: string;
  category: string;
  body: string;
  author: string;
  ts: number;
  likes: number;
  views: number;
  pinned: boolean;
  own: boolean;
  seedLikes: number;
  replyCount: number;
}

type SortMode = "RECIENTES" | "CALIENTES" | "TOP";

type ForumMode = "HILOS" | "DENUNCIAS";

interface Denuncia {
  id: string;
  author: string;
  country: string;
  category: string;
  title: string;
  detail: string;
  evidenceUrl: string;
  location: string;
  status: string;
  upvotes: number;
  votes: { voter: string }[];
}

const DENUNCIA_CATEGORIES = ["CRIMEN_GUERRA", "ABUSO", "DESINFORMACION", "CUENTA_FALSA", "CONTENIDO_INVALIDO", "OTRO"];
const DENUNCIA_STATUS: Record<string, { label: string; color: string }> = {
  RECIBIDA: { label: "recibida", color: "border-border text-muted-foreground" },
  INVESTIGACION: { label: "en investigación", color: "border-amber-hud text-amber bg-amber-hud/10" },
  VERIFICADA: { label: "verificada", color: "border-green-hud text-green-hud bg-green-hud/10" },
  DESCARTADA: { label: "descartada", color: "border-red-hud text-red-hud" },
};

// ---------- v24: sección de DENUNCIAS con DB ----------
function DenunciasSection() {
  const alias = useGameStore((s) => s.alias);
  const level = useGameStore((s) => s.level);
  const addXp = useGameStore((s) => s.addXp);
  const [items, setItems] = useState<Denuncia[]>([]);
  const [stats, setStats] = useState<{ total: number; verificadas: number; investigacion: number; recibidas: number } | null>(null);
  const [creating, setCreating] = useState(false);
  const [cat, setCat] = useState("ABUSO");
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [evidence, setEvidence] = useState("");
  const [location, setLocation] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const load = () => {
    fetch(`/api/denuncias${filterStatus ? `?status=${filterStatus}` : ""}`)
      .then((r) => r.json())
      .then((d) => {
        setItems(d.items ?? []);
        setStats(d.stats ?? null);
      })
      .catch(() => undefined);
  };

  useEffect(load, [filterStatus]);

  const submit = async () => {
    if (title.trim().length < 8 || detail.trim().length < 20) {
      toast.error("Título (8+) y detalle (20+) obligatorios");
      return;
    }
    try {
      const res = await fetch("/api/denuncias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author: alias || "OPERADOR", category: cat, title, detail, evidenceUrl: evidence, location }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error");
      toast.success("⚖️ Denuncia registrada · +3 monedas, +5 XP");
      addXp(5);
      useGameStore.getState().addCoins(3, "Denuncia en foros");
      setCreating(false);
      setTitle(""); setDetail(""); setEvidence(""); setLocation("");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al enviar");
    }
  };

  const upvote = async (d: Denuncia) => {
    if (d.votes.some((v) => v.voter === (alias || ""))) {
      toast.error("Ya apoyaste esta denuncia");
      return;
    }
    try {
      const res = await fetch(`/api/denuncias/${d.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "vote", voter: alias || "OPERADOR" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error");
      toast.success(`👍 Apoyo registrado (${data.upvotes}) · el voto de un embajador vale x2 en moderación`);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    }
  };

  return (
    <div className="space-y-3">
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-4 gap-2">
          {[
            { n: stats.total, l: "denuncias", c: "text-foreground" },
            { n: stats.recibidas, l: "recibidas", c: "text-muted-foreground" },
            { n: stats.investigacion, l: "en investigación", c: "text-amber" },
            { n: stats.verificadas, l: "verificadas", c: "text-green-hud" },
          ].map((s) => (
            <div key={s.l} className="hud-corner p-2.5 text-center">
              <p className={`font-mono text-lg font-bold leading-none ${s.c}`}>{s.n}</p>
              <p className="text-[9px] font-mono text-muted-foreground uppercase mt-1">{s.l}</p>
            </div>
          ))}
        </div>
      )}

      <div className="hud-corner p-2 flex items-center gap-2 flex-wrap">
        <span className="text-[10px] font-mono uppercase text-muted-foreground flex items-center gap-1">
          <Gavel className="w-3.5 h-3.5" /> denuncias verificables · tu voto pesa {level >= 5 ? "x2 (nivel 5+)" : "x1"}
        </span>
        <div className="ml-auto flex items-center gap-1 flex-wrap">
          {["", "RECIBIDA", "INVESTIGACION", "VERIFICADA"].map((s) => (
            <button
              key={s || "todas"}
              onClick={() => setFilterStatus(s)}
              className={cn(
                "px-1.5 py-0.5 border text-[9px] font-mono uppercase",
                filterStatus === s ? "border-amber-hud text-amber bg-amber-hud/20" : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {s ? DENUNCIA_STATUS[s].label : "todas"}
            </button>
          ))}
          <Button
            size="sm"
            onClick={() => setCreating(true)}
            className="h-7 ml-1 font-mono text-[10px] uppercase bg-red-hud/30 border border-red-hud text-red-hud hover:bg-red-hud/50"
          >
            <ShieldAlert className="w-3 h-3 mr-1" /> Nueva denuncia
          </Button>
        </div>
      </div>

      <div className="grid gap-2">
        {items.map((d) => {
          const st = DENUNCIA_STATUS[d.status] ?? DENUNCIA_STATUS.RECIBIDA;
          const voted = d.votes.some((v) => v.voter === (alias || ""));
          return (
            <article key={d.id} className="hud-corner p-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 flex-shrink-0 hud-corner bg-secondary/40 flex items-center justify-center border border-border">
                  <Scale className="w-4 h-4 text-amber" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <span className="text-[9px] font-mono px-1.5 py-0.5 border border-amber-hud/50 text-amber uppercase">{d.category}</span>
                    <span className={cn("text-[9px] font-mono px-1.5 py-0.5 border uppercase", st.color)}>{st.label}</span>
                    {d.location && (
                      <span className="text-[9px] font-mono text-muted-foreground uppercase flex items-center gap-0.5">
                        <MapPin className="w-2.5 h-2.5" /> {d.location}
                      </span>
                    )}
                    <span className="text-[9px] font-mono text-muted-foreground ml-auto">por {d.author}</span>
                  </div>
                  <h3 className="text-sm font-bold text-foreground leading-tight">{d.title}</h3>
                  <p className="text-[11px] text-muted-foreground leading-relaxed mt-1 line-clamp-3 whitespace-pre-line">{d.detail}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <button
                      onClick={() => upvote(d)}
                      className={cn(
                        "flex items-center gap-1 px-2 py-1 border font-mono text-[9px] uppercase transition-colors",
                        voted ? "border-green-hud text-green-hud bg-green-hud/20" : "border-border text-muted-foreground hover:border-amber-hud hover:text-amber"
                      )}
                    >
                      <ThumbsUp className={cn("w-3 h-3", voted && "fill-current")} /> apoyo · {d.upvotes}
                    </button>
                    {d.evidenceUrl && (
                      <a href={d.evidenceUrl} target="_blank" rel="noreferrer" className="text-[9px] font-mono uppercase text-cyan-hud hover:underline">
                        ver evidencia →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
        {items.length === 0 && (
          <div className="hud-corner p-8 text-center text-muted-foreground">
            <Scale className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-mono">Sin denuncias con ese estado</p>
          </div>
        )}
      </div>

      {/* Modal crear denuncia */}
      {creating && (
        <Dialog open={creating} onOpenChange={setCreating}>
          <DialogContent className="!fixed hud-panel border-red-hud sm:max-w-lg max-h-[88vh] overflow-y-auto thin-scroll">
            <DialogHeader>
              <DialogTitle className="font-mono text-red-hud flex items-center gap-2 text-sm uppercase">
                <ShieldAlert className="w-4 h-4" /> Nueva denuncia verificable
              </DialogTitle>
              <DialogDescription className="text-[10px] font-mono uppercase">
                Recompensa: +3 monedas, +5 XP · anti-spam: 5/día
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <div className="flex gap-1 flex-wrap">
                {DENUNCIA_CATEGORIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCat(c)}
                    className={cn(
                      "px-1.5 py-1 border text-[9px] font-mono uppercase",
                      cat === c ? "border-red-hud text-red-hud bg-red-hud/20" : "border-border text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título de la denuncia (min. 8)" className="bg-background/60 border-border font-mono text-xs" maxLength={140} />
              <Textarea value={detail} onChange={(e) => setDetail(e.target.value)} placeholder="Qué pasó, quién, cuándo... (min. 20)" className="min-h-[100px] bg-background/60 border-border font-mono text-xs" maxLength={3000} />
              <Input value={evidence} onChange={(e) => setEvidence(e.target.value)} placeholder="URL de evidencia (foto, video, informe)" className="bg-background/60 border-border font-mono text-xs" maxLength={400} />
              <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Ubicación (ciudad, región)" className="bg-background/60 border-border font-mono text-xs" maxLength={120} />
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="outline" onClick={() => setCreating(false)} className="h-7 font-mono text-[10px] uppercase">Cancelar</Button>
                <Button size="sm" onClick={submit} className="h-7 font-mono text-[10px] uppercase bg-red-hud/30 border border-red-hud text-red-hud hover:bg-red-hud/50">Enviar denuncia</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export function ForumPanel() {
  const [mode, setMode] = useState<ForumMode>("HILOS");
  const [filter, setFilter] = useState<string>("TODOS");
  const [sort, setSort] = useState<SortMode>("RECIENTES");
  const [query, setQuery] = useState("");
  const [openThread, setOpenThread] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCat, setNewCat] = useState<string>("OSINT");
  const [newBody, setNewBody] = useState("");
  const [replyText, setReplyText] = useState("");

  const alias = useGameStore((s) => s.alias);
  const forumThreads = useGameStore((s) => s.forumThreads);
  const forumReplies = useGameStore((s) => s.forumReplies);
  const forumLikedIds = useGameStore((s) => s.forumLikedIds);
  const forumLikedReplies = useGameStore((s) => s.forumLikedReplies);
  const createThread = useGameStore((s) => s.createThread);
  const replyThread = useGameStore((s) => s.replyThread);
  const likeThread = useGameStore((s) => s.likeThread);
  const likeReply = useGameStore((s) => s.likeReply);
  const viewThread = useGameStore((s) => s.viewThread);

  const threads: ThreadView[] = useMemo(() => {
    const own = forumThreads.map((t) => ({
      id: t.id, title: t.title, category: t.category, body: t.body, author: t.author,
      ts: t.ts, likes: t.likes, views: t.views, pinned: false, own: true,
      seedLikes: t.likes, replyCount: t.replies.length,
    }));
    const seeds = FORUM_SEED.map((t) => ({
      id: t.id, title: t.title, category: t.category as string, body: t.body, author: t.author,
      ts: Date.now() - t.hoursAgo * 3600_000, likes: t.likes + (forumLikedIds.includes(t.id) ? 1 : 0),
      views: t.views, pinned: !!t.pinned, own: false,
      seedLikes: t.likes, replyCount: t.replies.length + (forumReplies[t.id]?.length ?? 0),
    }));
    const all = [...own, ...seeds];
    return all.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.ts - a.ts);
  }, [forumThreads, forumReplies, forumLikedIds]);

  const filtered = useMemo(() => {
    let list = filter === "TODOS" ? threads : threads.filter((t) => t.category === filter);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (t) => t.title.toLowerCase().includes(q) || t.body.toLowerCase().includes(q) || t.author.toLowerCase().includes(q)
      );
    }
    // los fijados siempre arriba; el resto segun el modo elegido
    const hot = (t: ThreadView) => t.likes * 3 + t.replyCount * 5 + t.views / 80 + (Date.now() - t.ts) / -7200_000;
    const sorted = [...list].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      if (sort === "CALIENTES") return hot(b) - hot(a);
      if (sort === "TOP") return b.likes - a.likes || b.replyCount - a.replyCount;
      return b.ts - a.ts; // RECIENTES
    });
    return sorted;
  }, [threads, filter, query, sort]);

  const totalReplies = threads.reduce((n, t) => n + t.replyCount, 0);
  const ownCount = threads.filter((t) => t.own).length;

  const thread = threads.find((t) => t.id === openThread) ?? null;

  const seedReplies = useMemo(() => {
    if (!thread) return [];
    const seed = FORUM_SEED.find((s) => s.id === thread.id);
    if (!seed) return [];
    return seed.replies.map((r, i) => ({
      id: `seed-${seed.id}-${i}`,
      author: r.author, body: r.body, likes: r.likes,
      ts: Date.now() - r.hoursAgo * 3600_000,
    }));
  }, [thread]);

  const userReplies = useMemo(() => {
    if (!thread) return [];
    if (thread.own) return [];
    return forumReplies[thread.id] ?? [];
  }, [thread, forumReplies]);

  const ownReplies = useMemo(() => {
    if (!thread || !thread.own) return [];
    return forumThreads.find((t) => t.id === thread.id)?.replies ?? [];
  }, [thread, forumThreads]);

  const allReplies = [...seedReplies, ...userReplies, ...ownReplies].sort((a, b) => a.ts - b.ts);

  // mejor respuesta: la de mas likes (si tiene al menos 1 like y hay 2+ respuestas)
  const bestReplyId = useMemo(() => {
    if (allReplies.length < 2) return null;
    let best = null as null | { id: string; likes: number };
    for (const r of allReplies) {
      const total = r.likes + (forumLikedReplies.includes(r.id) ? 1 : 0);
      if (!best || total > best.likes) best = { id: r.id, likes: total };
    }
    return best && best.likes > 0 ? best.id : null;
  }, [allReplies, forumLikedReplies]);

  const openThreadDialog = (id: string) => {
    setOpenThread(id);
    viewThread(id);
  };

  const handleCreate = () => {
    if (newTitle.trim().length < 8) {
      toast.error("El titulo necesita al menos 8 caracteres");
      return;
    }
    if (newBody.trim().length < 20) {
      toast.error("El cuerpo del hilo necesita al menos 20 caracteres");
      return;
    }
    createThread(newTitle, newCat, newBody);
    toast.success("Hilo publicado: +8 monedas, +5 XP");
    setNewTitle("");
    setNewBody("");
    setCreating(false);
  };

  const handleReply = () => {
    if (!thread || replyText.trim().length < 3) {
      toast.error("Escribe una respuesta mas larga");
      return;
    }
    replyThread(thread.id, replyText);
    toast.success("Respuesta publicada: +3 monedas, +2 XP");
    setReplyText("");
  };

  const isLiked = (t: ThreadView) => !t.own && forumLikedIds.includes(t.id);

  return (
    <div className="space-y-3">
      <PanelHeader
        title="Foros de la red"
        subtitle={`${threads.length} hilos · ${totalReplies} respuestas · operador: ${alias || "SIN REGISTRO"}`}
        icon={<MessagesSquare className="w-4 h-4 text-cyan-hud" />}
        color="cyan"
        right={
          <div className="flex items-center gap-1.5">
            <div className="flex items-center">
              {(["HILOS", "DENUNCIAS"] as ForumMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={cn(
                    "px-2 py-1 border text-[9px] font-mono uppercase transition-colors first:border-r-0",
                    mode === m
                      ? m === "DENUNCIAS" ? "border-red-hud text-red-hud bg-red-hud/20" : "border-cyan-hud text-cyan-hud bg-cyan-hud/20"
                      : "border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  {m === "HILOS" ? "hilos" : "⚖️ denuncias"}
                </button>
              ))}
            </div>
            <Button
              size="sm"
              onClick={() => setCreating(true)}
              className="h-8 font-mono text-[10px] uppercase bg-amber-hud border border-amber-hud text-amber hover:bg-amber-hud/70"
            >
              <MessageSquarePlus className="w-3 h-3 mr-1" /> Nuevo hilo
            </Button>
          </div>
        }
      />

      {mode === "DENUNCIAS" ? (
        <DenunciasSection />
      ) : (
      <>

      {/* Busqueda + orden */}
      <div className="hud-corner p-2 flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[160px]">
          <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar hilo, cuerpo o autor..."
            className="h-8 pl-7 bg-background/60 border-border font-mono text-[11px]"
          />
        </div>
        <div className="flex items-center gap-1">
          {([
            { id: "RECIENTES" as SortMode, icon: Clock },
            { id: "CALIENTES" as SortMode, icon: Flame },
            { id: "TOP" as SortMode, icon: Trophy },
          ]).map(({ id, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSort(id)}
              className={cn(
                "px-2 py-1 border text-[9px] font-mono uppercase flex items-center gap-1",
                sort === id
                  ? "border-cyan-hud text-cyan-hud bg-cyan-hud/20"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-2.5 h-2.5" /> {id}
            </button>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div className="hud-corner p-2 flex items-center gap-3 text-[10px] font-mono flex-wrap">
        <span className="text-green-hud">REDES ACTIVAS</span>
        <span className="text-muted-foreground">·</span>
        <span className="text-muted-foreground">{ownCount} hilos propios</span>
        <span className="text-muted-foreground">·</span>
        <span className="text-amber">+8 monedas por hilo · +3 por respuesta</span>
        <div className="ml-auto flex items-center gap-1 flex-wrap">
          {["TODOS", ...FORUM_CATEGORIES].map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={cn(
                "px-1.5 py-0.5 border text-[9px] uppercase",
                filter === c
                  ? "border-cyan-hud text-cyan-hud bg-cyan-hud/30"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Thread list */}
      <div className="grid gap-2">
        {filtered.map((t) => {
          const catColor = FORUM_CAT_COLOR[t.category as keyof typeof FORUM_CAT_COLOR] ?? FORUM_CAT_COLOR.OSINT;
          return (
            <article
              key={t.id}
              className="hud-corner p-3 hover:bg-secondary/40 transition-colors cursor-pointer group"
              onClick={() => openThreadDialog(t.id)}
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 flex-shrink-0 hud-corner bg-secondary/40 flex items-center justify-center border border-border">
                  <MessagesSquare className={cn("w-4 h-4", t.own ? "text-amber" : "text-cyan-hud")} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    {t.pinned && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 border border-amber-hud text-amber bg-amber-hud/30 uppercase flex items-center gap-0.5">
                        <Pin className="w-2.5 h-2.5" /> FIJADO
                      </span>
                    )}
                    <span className={cn("text-[9px] font-mono px-1.5 py-0.5 border uppercase", catColor)}>
                      {t.category}
                    </span>
                    {t.own && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 border border-amber-hud text-amber uppercase">
                        TU HILO
                      </span>
                    )}
                    <span className="text-[9px] font-mono text-muted-foreground ml-auto">
                      {hoursAgoToText((Date.now() - t.ts) / 3600_000)}
                    </span>
                  </div>
                  <h3 className="text-sm font-medium text-foreground group-hover:text-amber transition-colors line-clamp-1">
                    {t.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{t.body}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] font-mono text-muted-foreground">
                    <span className="uppercase">por {t.author}</span>
                    <span className="flex items-center gap-1"><CornerDownRight className="w-3 h-3" /> {t.replyCount}</span>
                    <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> {t.likes}</span>
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {formatViews(t.views)}</span>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="hud-corner p-8 text-center text-muted-foreground">
          <MessagesSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm font-mono">Sin hilos con ese criterio</p>
        </div>
      )}

      {/* Dialog: ver hilo + responder */}
      <Dialog open={!!openThread} onOpenChange={(o) => !o && setOpenThread(null)}>
        <DialogContent className="!fixed hud-panel border-cyan-hud sm:max-w-2xl max-h-[88vh] overflow-y-auto thin-scroll">
          <DialogHeader>
            <DialogTitle className="font-mono text-cyan-hud flex items-center gap-2 text-sm uppercase">
              <MessagesSquare className="w-4 h-4" /> Hilo de la red
            </DialogTitle>
            <DialogDescription className="text-[10px] font-mono uppercase">
              por {thread?.author} · {thread?.views} lecturas · {thread?.category}
            </DialogDescription>
          </DialogHeader>
          {thread && (
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-bold text-foreground leading-snug">{thread.title}</h3>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed whitespace-pre-wrap">{thread.body}</p>
                <div className="flex items-center gap-2 mt-2">
                  {!thread.own && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => likeThread(thread.id)}
                      className={cn(
                        "h-7 font-mono text-[10px] uppercase",
                        isLiked(thread) ? "border-cyan-hud text-cyan-hud bg-cyan-hud/30" : "border-border text-muted-foreground"
                      )}
                    >
                      <ThumbsUp className={cn("w-3 h-3 mr-1", isLiked(thread) && "fill-current")} /> {thread.likes}
                    </Button>
                  )}
                  <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                    <Hash className="w-3 h-3" /> {thread.id}
                  </span>
                </div>
              </div>

              <div className="border-t border-amber-hud/20 pt-2">
                <p className="text-[10px] font-mono uppercase text-muted-foreground mb-2">
                  {allReplies.length} respuestas · dale like a la que aporte
                </p>
                <div className="space-y-2 max-h-64 overflow-y-auto thin-scroll pr-1">
                  {allReplies.map((r) => {
                    const liked = forumLikedReplies.includes(r.id);
                    const total = r.likes + (liked ? 1 : 0);
                    const isBest = r.id === bestReplyId;
                    return (
                      <div key={r.id} className={cn(
                        "p-2 border",
                        isBest ? "bg-amber-hud/15 border-amber-hud/50" : "bg-secondary/40 border-border/60"
                      )}>
                        <div className="flex items-center justify-between mb-1 gap-2">
                          <span className="text-[10px] font-mono text-cyan-hud uppercase flex items-center gap-1 min-w-0">
                            {r.author}
                            {isBest && (
                              <span className="text-[8px] px-1 py-0.5 border border-amber-hud text-amber bg-amber-hud/30 uppercase flex items-center gap-0.5 flex-shrink-0">
                                <Award className="w-2.5 h-2.5" /> MEJOR RESPUESTA
                              </span>
                            )}
                          </span>
                          <button
                            onClick={() => likeReply(r.id)}
                            aria-label="Me gusta esta respuesta"
                            className={cn(
                              "flex items-center gap-1 text-[9px] font-mono px-1 py-0.5 border rounded-sm flex-shrink-0 transition-colors",
                              liked ? "border-cyan-hud text-cyan-hud bg-cyan-hud/20" : "border-border/60 text-muted-foreground hover:text-cyan-hud"
                            )}
                          >
                            <ThumbsUp className={cn("w-2.5 h-2.5", liked && "fill-current")} /> {total}
                          </button>
                        </div>
                        <p className="text-xs text-foreground/90 leading-relaxed">{r.body}</p>
                      </div>
                    );
                  })}
                  {allReplies.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-3 font-mono uppercase">
                      Nadie ha respondido. Se el primero.
                    </p>
                  )}
                </div>
              </div>

              <div className="border-t border-amber-hud/20 pt-2">
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Responder como ${alias || "OPERADOR"}... (+3 monedas, +2 XP)`}
                  className="min-h-[60px] bg-background/60 border-border font-mono text-xs"
                />
                <div className="flex justify-end mt-1.5">
                  <Button
                    size="sm"
                    onClick={handleReply}
                    className="h-7 font-mono text-[10px] uppercase bg-amber-hud border border-amber-hud text-amber hover:bg-amber-hud/70"
                  >
                    Publicar respuesta
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog: crear hilo */}
      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent className="!fixed hud-panel border-amber-hud sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-mono text-amber flex items-center gap-2 text-sm uppercase">
              <MessageSquarePlus className="w-4 h-4" /> Nuevo hilo
            </DialogTitle>
            <DialogDescription className="text-[10px] font-mono uppercase">
              Recompensa: +8 monedas, +5 XP
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Titulo del hilo (min. 8 caracteres)"
              className="bg-background/60 border-border font-mono text-xs"
              maxLength={120}
            />
            <div className="flex gap-1 flex-wrap">
              {FORUM_CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setNewCat(c)}
                  className={cn(
                    "px-2 py-1 border text-[9px] font-mono uppercase",
                    newCat === c
                      ? FORUM_CAT_COLOR[c]
                      : "border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
            <Textarea
              value={newBody}
              onChange={(e) => setNewBody(e.target.value)}
              placeholder="Desarrolla tu analisis, rumor o reporte... (min. 20 caracteres)"
              className="min-h-[100px] bg-background/60 border-border font-mono text-xs"
              maxLength={2000}
            />
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => setCreating(false)} className="h-7 font-mono text-[10px] uppercase">
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleCreate}
                className="h-7 font-mono text-[10px] uppercase bg-amber-hud border border-amber-hud text-amber hover:bg-amber-hud/70"
              >
                Publicar hilo
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </>
      )}
    </div>
  );
}
