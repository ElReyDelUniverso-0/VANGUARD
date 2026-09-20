"use client";

// Vanguard v12 — ENCICLOPEDIA MUNDIAL: fichas de guerras, politica, lideres
// (con fotos reales), partidos y religiones. Buscador, filtros por categoria,
// detalle con estadisticas, cronologia, datos curiosos y "saber mas" EN VIVO
// via la API de Wikipedia (route /api/wiki).

import { useState, useMemo, useEffect } from "react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { BookOpen, Search, Clock, Sparkles, Globe2, ExternalLink, X, Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { sfx } from "@/lib/sound";
import { useGameStore } from "@/lib/game-store";
import { WIKI_ENTRIES, WIKI_CATS, type WikiEntry, type WikiCat } from "@/lib/wiki-data";

interface WikiExtract { title: string; extract: string; thumbnail?: string; url?: string; }

function loadRead(): string[] {
  try { return JSON.parse(localStorage.getItem("vanguard-wiki-read") ?? "[]") as string[]; } catch { return []; }
}

export function EncyclopediaPanel() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<WikiCat | "TODAS">("TODAS");
  const [detail, setDetail] = useState<WikiEntry | null>(null);
  const [live, setLive] = useState<WikiExtract | null>(null);
  const [liveLoading, setLiveLoading] = useState(false);
  const [readSet, setReadSet] = useState<string[]>([]);
  const addXp = useGameStore((s) => s.addXp);

  useEffect(() => { setReadSet(loadRead()); }, []);

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return WIKI_ENTRIES.filter((e) =>
      (cat === "TODAS" || e.cat === cat) &&
      (!ql || e.title.toLowerCase().includes(ql) || e.subtitle.toLowerCase().includes(ql) || e.desc.toLowerCase().includes(ql))
    );
  }, [q, cat]);

  const openDetail = (e: WikiEntry) => {
    sfx.tab();
    setDetail(e); setLive(null);
    if (!readSet.includes(e.id)) {
      const next = [...readSet, e.id];
      setReadSet(next);
      try { localStorage.setItem("vanguard-wiki-read", JSON.stringify(next)); } catch {}
      addXp(5);
    }
  };

  const fetchLive = async (e: WikiEntry) => {
    setLiveLoading(true); setLive(null);
    try {
      const res = await fetch(`/api/wiki?q=${encodeURIComponent(e.wiki)}`);
      const data = await res.json();
      if (data?.extract) setLive(data as WikiExtract);
      else toast.error("Wikipedia no respondio · intenta de nuevo");
    } catch {
      toast.error("Sin conexion con la API de Wikipedia");
    } finally { setLiveLoading(false); }
  };

  const catCount = (c: WikiCat) => WIKI_ENTRIES.filter((e) => e.cat === c).length;

  return (
    <div className="space-y-3">
      <PanelHeader title="ENCICLOPEDIA MUNDIAL" subtitle="Guerras · politica · lideres · partidos · religiones" icon={<BookOpen className="w-4 h-4" />} color="cyan" />

      {/* buscador + categorias */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <input
          value={q} onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar: WWII, capitalismo, Mandela, islam..."
          className="w-full bg-secondary/40 border border-border/60 rounded-sm pl-8 pr-3 py-2 text-xs font-mono text-foreground placeholder:text-muted-foreground/60"
        />
      </div>
      <div className="flex gap-1.5 flex-wrap">
        <button onClick={() => { sfx.hover(); setCat("TODAS"); }}
          className={cn("px-2 py-1 rounded-sm text-[10px] font-mono uppercase border", cat === "TODAS" ? "border-amber-hud text-amber bg-amber-hud/20" : "border-border/50 text-muted-foreground")}>
          Todas ({WIKI_ENTRIES.length})
        </button>
        {WIKI_CATS.map((c) => (
          <button key={c.cat} onClick={() => { sfx.hover(); setCat(c.cat); }} title={c.desc}
            className={cn("px-2 py-1 rounded-sm text-[10px] font-mono uppercase border", cat === c.cat ? "border-amber-hud text-amber bg-amber-hud/20" : "border-border/50 text-muted-foreground")}>
            {c.label} ({catCount(c.cat)})
          </button>
        ))}
      </div>

      {/* grid de fichas */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {filtered.map((e) => (
          <motion.button
            key={e.id} layout onClick={() => openDetail(e)}
            whileHover={{ y: -2 }}
            className="hud-corner border bg-secondary/20 text-left hover:border-amber-hud/60 transition-colors overflow-hidden"
          >
            <div className="relative h-28 bg-secondary/40">
              {e.img ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={e.img} alt={e.title} className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground/40"><Globe2 className="w-8 h-8" /></div>
              )}
              <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 text-[8px] font-mono font-bold uppercase tracking-widest bg-background/80 text-amber border border-amber-hud/50 rounded-sm">
                {e.cat}
              </span>
              {e.img && (
                <span className="absolute bottom-1.5 right-1.5 px-1 py-0.5 text-[7px] font-mono bg-background/80 text-cyan-hud border border-cyan-hud/40 rounded-sm flex items-center gap-0.5">
                  <Camera className="w-2 h-2" /> REAL
                </span>
              )}
              {readSet?.includes(e.id) && (
                <span className="absolute top-1.5 right-1.5 px-1 py-0.5 text-[7px] font-mono bg-green-hud/30 text-green-hud rounded-sm">LEIDO</span>
              )}
            </div>
            <div className="p-2.5">
              <div className="font-mono text-xs font-bold text-foreground leading-tight">{e.title}</div>
              <div className="text-[10px] font-mono text-muted-foreground mt-0.5 truncate">{e.subtitle} · {e.dates}</div>
            </div>
          </motion.button>
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="hud-corner border p-8 text-center text-xs font-mono text-muted-foreground uppercase">Sin resultados para &quot;{q}&quot;</div>
      )}

      {/* DETALLE */}
      {detail && (
        <div className="fixed inset-0 z-50 bg-background/90 flex items-center justify-center p-3" onClick={() => setDetail(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            className="hud-corner border border-amber-hud bg-background max-w-2xl w-full max-h-[88vh] overflow-y-auto thin-scroll"
            onClick={(ev) => ev.stopPropagation()}
          >
            <div className="relative h-44 bg-secondary/40">
              {detail.img ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={detail.img} alt={detail.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground/40"><Globe2 className="w-10 h-10" /></div>
              )}
              <button onClick={() => setDetail(null)} className="absolute top-2 right-2 p-1.5 bg-background/80 border border-border rounded-sm"><X className="w-4 h-4" /></button>
              <span className="absolute bottom-2 left-2 px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-widest bg-background/80 text-amber border border-amber-hud/50 rounded-sm">{detail.cat}</span>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <h3 className="font-mono text-lg font-bold text-foreground">{detail.title}</h3>
                <p className="text-[11px] font-mono text-muted-foreground">{detail.subtitle} · {detail.dates} · {detail.region}</p>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {detail.stats.map((s) => (
                  <div key={s.label} className="border border-border/50 bg-secondary/20 p-2">
                    <div className="text-[8px] font-mono text-muted-foreground uppercase">{s.label}</div>
                    <div className="text-[11px] font-mono text-foreground">{s.value}</div>
                  </div>
                ))}
              </div>
              <div className="text-xs text-foreground/90 leading-relaxed space-y-2">
                {detail.desc.split("\n\n").map((p, i) => <p key={i}>{p}</p>)}
              </div>
              <div>
                <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber mb-1.5 flex items-center gap-1"><Clock className="w-3 h-3" /> Cronologia</div>
                <div className="space-y-1">
                  {detail.timeline.map((t, i) => (
                    <div key={i} className="flex gap-2 text-[11px] font-mono">
                      <span className="text-cyan-hud font-bold whitespace-nowrap min-w-[72px]">{t.year}</span>
                      <span className="text-foreground/80">{t.text}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber mb-1.5 flex items-center gap-1"><Sparkles className="w-3 h-3" /> Sabias que?</div>
                <ul className="space-y-1">
                  {detail.facts.map((f, i) => (
                    <li key={i} className="text-[11px] font-mono text-foreground/80 flex gap-1.5"><span className="text-amber">▸</span>{f}</li>
                  ))}
                </ul>
              </div>
              {/* WIKIPEDIA EN VIVO */}
              <div className="border-t border-border/40 pt-3">
                {liveLoading ? (
                  <div className="text-[11px] font-mono text-muted-foreground animate-pulse">Consultando la API de Wikipedia en vivo...</div>
                ) : live ? (
                  <div className="border border-cyan-hud/40 bg-cyan-hud/10 p-3">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[9px] font-mono font-bold uppercase text-cyan-hud tracking-widest">EN VIVO · WIKIPEDIA</span>
                      {live.url && (
                        <a href={live.url} target="_blank" rel="noreferrer" className="text-[10px] font-mono text-cyan-hud flex items-center gap-1 hover:underline">
                          abrir original <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    {live.thumbnail && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={live.thumbnail} alt={live.title} className="w-20 h-20 object-cover float-right ml-2 mb-1 border border-cyan-hud/40" />
                    )}
                    <p className="text-[11px] text-foreground/85 leading-relaxed">{live.extract}</p>
                  </div>
                ) : (
                  <Button onClick={() => fetchLive(detail)} className="w-full font-mono text-[11px] uppercase tracking-widest bg-cyan-hud/20 border border-cyan-hud text-cyan-hud hover:bg-cyan-hud/30">
                    <Globe2 className="w-3.5 h-3.5 mr-1.5" /> Saber mas EN VIVO (API Wikipedia)
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
