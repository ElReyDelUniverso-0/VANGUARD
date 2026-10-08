"use client";

import { useEffect, useState } from "react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { Newspaper, ExternalLink, RefreshCw, Radio, Clock, MessageSquare, Send, BadgeCheck, ShieldAlert, Zap, BrainCircuit, Loader2 } from "lucide-react";
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
import { HeroOro } from "@/components/vanguard/hero-oro";
// v82.0 TODO EL MUNDO — teletipo en vivo: cinta de última hora + mensajes constantes
import { TeletipoCinta, TeletipoFeed } from "@/components/vanguard/teletipo-vivo";

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

// v88.0 NEURONA — expediente del analista IA por cable
// v89.0 NEURONAS v2 — expediente enriquecido: confianza, recomendación,
// probabilidades por sentimiento y conexiones temáticas para la red.
interface NeuronaExp {
  resumen: string;
  actores: string[];
  sentimiento: "ESCALADA" | "TENSIÓN" | "ESTABLE" | "DÉTENTE";
  riesgo: number;
  clave: string;
  ia: boolean;
  confianza?: number;
  recomendacion?: string;
  probabilidades?: { escalada: number; tension: number; estable: number; detente: number };
  conexiones?: string[];
}
const NEURONA_SENT_COLOR: Record<NeuronaExp["sentimiento"], string> = {
  ESCALADA: "text-crisis border-crisis-hud bg-crisis-hud/30",
  "TENSIÓN": "text-amber border-amber-hud bg-amber-hud/30",
  ESTABLE: "text-cyan-hud border-cyan-hud/60 bg-cyan-hud/20",
  "DÉTENTE": "text-neon border-neon-hud bg-neon-hud/30",
};

// v89.0 RED NEURONAL — nodos = cables analizados, aristas = actores compartidos
interface NeuronaNodo {
  id: string;
  titulo: string;
  riesgo: number;
  sentimiento: NeuronaExp["sentimiento"];
  actores: string[];
  ts: number;
}
const RED_KEY = "vanguard-neurona-red-v1";
const RED_SENT_HEX: Record<NeuronaExp["sentimiento"], string> = {
  ESCALADA: "#FF3B30",
  "TENSIÓN": "#FFD60A",
  ESTABLE: "#3DDCFF",
  "DÉTENTE": "#00FF87",
};

function cargarRed(): NeuronaNodo[] {
  if (typeof window === "undefined") return [];
  try {
    const arr = JSON.parse(localStorage.getItem(RED_KEY) || "[]");
    return Array.isArray(arr) ? arr.slice(0, 18) : [];
  } catch {
    return [];
  }
}

function guardarNodo(n: NeuronaNodo): NeuronaNodo[] {
  const red = cargarRed().filter((x) => x.titulo !== n.titulo);
  const nueva = [n, ...red].slice(0, 18);
  try {
    localStorage.setItem(RED_KEY, JSON.stringify(nueva));
  } catch {
    /* noop */
  }
  return nueva;
}

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
  // v88.0 NEURONA: expedientes por cable (undefined = sin pedir, "loading" = cargando)
  const [neuronaOpen, setNeuronaOpen] = useState<string | null>(null);
  const [neurona, setNeurona] = useState<Record<string, NeuronaExp | "loading">>({});
  // v89.0 RED NEURONAL
  const [red, setRed] = useState<NeuronaNodo[]>([]);
  const [redAbierta, setRedAbierta] = useState(false);
  const [entrenando, setEntrenando] = useState(false);
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
    setRed(cargarRed());
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

  // v88.0 NEURONA: pedir el expediente del analista IA (con caché del servidor)
  const analizarNeurona = async (item: NewsItem) => {
    if (neuronaOpen === item.id) {
      setNeuronaOpen(null);
      return;
    }
    setNeuronaOpen(item.id);
    if (neurona[item.id] && neurona[item.id] !== "loading") return;
    setNeurona((m) => ({ ...m, [item.id]: "loading" }));
    try {
      const res = await fetch("/api/neurona", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: item.title, source: item.source }),
      });
      const data = await res.json();
      if (data?.ok) {
        const exp: NeuronaExp = {
          resumen: data.resumen, actores: data.actores || [],
          sentimiento: data.sentimiento, riesgo: data.riesgo,
          clave: data.clave, ia: data.ia === true,
          confianza: typeof data.confianza === "number" ? data.confianza : undefined,
          recomendacion: typeof data.recomendacion === "string" ? data.recomendacion : undefined,
          probabilidades: data.probabilidades ?? undefined,
          conexiones: Array.isArray(data.conexiones) ? data.conexiones : undefined,
        };
        setNeurona((m) => ({ ...m, [item.id]: exp }));
        // v89.0: la red crece con cada expediente — nodo + sinapsis nuevas
        const previa = cargarRed();
        const nueva = guardarNodo({
          id: item.id,
          titulo: item.title,
          riesgo: exp.riesgo,
          sentimiento: exp.sentimiento,
          actores: exp.actores,
          ts: Date.now(),
        });
        setRed(nueva);
        const sinapsisNuevas = contarSinapsis(nueva) - contarSinapsis(previa);
        if (sinapsisNuevas > 0) toast.success(`NEURONA firmó el expediente · +${sinapsisNuevas} sinapsis en la red`);
      } else {
        setNeurona((m) => ({ ...m, [item.id]: undefined as unknown as NeuronaExp }));
        toast.error("NEURONA no pudo procesar el cable");
      }
    } catch {
      setNeurona((m) => ({ ...m, [item.id]: undefined as unknown as NeuronaExp }));
      toast.error("Sin conexión con NEURONA");
    }
  };

  // v89.0 ENTRENAR RED: analiza en batch los 3 cables superiores sin expediente
  const entrenarRed = async () => {
    if (entrenando) return;
    const pendientes = items.filter((i) => !neurona[i.id]).slice(0, 3);
    if (pendientes.length === 0) {
      toast("La red ya leyó todos los cables disponibles");
      return;
    }
    setEntrenando(true);
    try {
      const res = await fetch("/api/neurona", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titles: pendientes.map((p) => p.title) }),
      });
      const data = await res.json();
      if (data?.ok && Array.isArray(data.expedientes)) {
        const mm = { ...neurona };
        let nueva = cargarRed();
        const previaSin = contarSinapsis(nueva);
        pendientes.forEach((p: NewsItem, i: number) => {
          const e = data.expedientes[i];
          if (!e) return;
          mm[p.id] = {
            resumen: e.resumen, actores: e.actores || [], sentimiento: e.sentimiento,
            riesgo: e.riesgo, clave: e.clave, ia: true,
            confianza: e.confianza, recomendacion: e.recomendacion,
            probabilidades: e.probabilidades, conexiones: e.conexiones,
          };
          nueva = guardarNodo({ id: p.id, titulo: p.title, riesgo: e.riesgo, sentimiento: e.sentimiento, actores: e.actores || [], ts: Date.now() });
        });
        setNeurona(mm);
        setRed(nueva);
        const nuevasSin = contarSinapsis(nueva) - previaSin;
        toast.success(`Entrenamiento completo · ${pendientes.length} neuronas nuevas · +${nuevasSin} sinapsis`);
      } else {
        toast.error("El núcleo no respondió al entrenamiento");
      }
    } catch {
      toast.error("Sin conexión con NEURONA");
    } finally {
      setEntrenando(false);
    }
  };

  const filtered = filter === "ALL" ? items : items.filter((i) => i.tacticalTag === filter);
  const tags = ["ALL", "ALERTA", "DIPLOMACIA", "ECONOMIA", "HUMANITARIO", "ANALISIS"];
  // v82.0: cables de las últimas 2h = ÚLTIMA HORA (borde rojo pulsante)
  const esUltimaHora = (iso: string) => Date.now() - new Date(iso).getTime() < 2 * 3600_000;

  return (
    <div className="space-y-3">
      <HeroOro panel="noticias" />
      <PanelHeader
        title="Noticias en vivo"
        subtitle={`Cables automaticos · fuente: ${source || "..."}`}
        icon={<Newspaper className="w-4 h-4 text-amber" />}
        color="amber"
        right={
          <Button
            size="sm"
            onClick={() => void load()}
            disabled={loading}
            variant="outline"
            className="h-8 font-mono text-[10px] uppercase border-amber-hud text-amber hover:bg-amber-hud"
          >
            <RefreshCw className={cn("w-3 h-3 mr-1", loading && "animate-spin")} /> Refrescar
          </Button>
        }
      />

      {/* v82.0 TELETIPO EN VIVO — cinta de última hora con cables reales + interceptos */}
      <TeletipoCinta />

      {/* v89.0 RED NEURONAL DE VANGUARD — la tecnología nativa, ahora visible */}
      <RedNeuronal
        red={red}
        abierta={redAbierta}
        onToggle={() => setRedAbierta((v) => !v)}
        entrenando={entrenando}
        onEntrenar={() => void entrenarRed()}
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

      {/* v82.0: cable de mensajes en vivo (columna izquierda) + lista de cables */}
      <div className="grid lg:grid-cols-[320px_1fr] gap-3 items-start">
        <TeletipoFeed max={12} intervaloMs={4800} className="lg:sticky lg:top-2" titulo="MENSAJES EN VIVO" />

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
                className={cn(
                  "hud-corner p-3 hover:bg-secondary/40 transition-colors cursor-pointer group relative",
                  esUltimaHora(item.publishedAt) && "border-l-2 border-l-crisis shadow-[inset_2px_0_0_rgba(255,59,48,0.35)]"
                )}
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
                      {esUltimaHora(item.publishedAt) && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 border border-crisis-hud text-crisis bg-crisis-hud/30 uppercase font-bold flex items-center gap-1 blink-soft">
                          <Zap className="w-3 h-3" /> última hora
                        </span>
                      )}
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
                          onClick={(e) => { e.stopPropagation(); void analizarNeurona(item); }}
                          className={cn(
                            "flex items-center gap-1 text-[10px] font-mono uppercase transition-colors border px-1.5 py-0.5",
                            neuronaOpen === item.id ? "border-violet-hud text-violet-hud bg-violet-hud/20" : "border-violet-hud/50 text-violet-hud hover:bg-violet-hud/20"
                          )}
                        >
                          <BrainCircuit className="w-3 h-3" /> neurona
                        </button>
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

                    {/* v88.0 NEURONA: expediente del analista IA */}
                    {neuronaOpen === item.id && (
                      <div className="mt-2 pt-2 border-t border-violet-hud/30" onClick={(e) => e.stopPropagation()}>
                        {neurona[item.id] === "loading" && (
                          <div className="flex items-center gap-2 text-[10px] font-mono uppercase text-violet-hud">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> neurona analizando el cable…
                          </div>
                        )}
                        {neurona[item.id] && neurona[item.id] !== "loading" && (() => {
                          const exp = neurona[item.id] as NeuronaExp;
                          return (
                            <div className="space-y-2">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[8px] font-mono font-black uppercase tracking-widest text-violet-hud flex items-center gap-1">
                                  <BrainCircuit className="w-3 h-3" /> expediente neurona
                                </span>
                                <span className={cn("text-[8px] font-mono uppercase px-1.5 py-0.5 border", NEURONA_SENT_COLOR[exp.sentimiento])}>
                                  {exp.sentimiento}
                                </span>
                                <span className="text-[8px] font-mono uppercase px-1.5 py-0.5 border border-border text-muted-foreground">
                                  {exp.ia ? "núcleo IA" : "analista local"}
                                </span>
                              </div>
                              <p className="text-[11px] leading-snug text-foreground/90">{exp.resumen}</p>
                              <div>
                                <div className="flex justify-between text-[8px] font-mono uppercase text-muted-foreground mb-0.5">
                                  <span>riesgo de escalada</span>
                                  <span className={exp.riesgo >= 70 ? "text-crisis font-bold" : exp.riesgo >= 45 ? "text-amber" : "text-neon"}>{exp.riesgo}/100</span>
                                </div>
                                <div className="h-1.5 bg-secondary overflow-hidden">
                                  <div
                                    className="h-full transition-all"
                                    style={{ width: `${exp.riesgo}%`, background: exp.riesgo >= 70 ? "#FF3B30" : exp.riesgo >= 45 ? "#FFD60A" : "#00FF87" }}
                                  />
                                </div>
                              </div>
                              {exp.actores.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {exp.actores.map((a) => (
                                    <span key={a} className="text-[8px] font-mono uppercase px-1.5 py-0.5 border border-violet-hud/50 text-violet-hud">{a}</span>
                                  ))}
                                </div>
                              )}
                              <div className="p-1.5 bg-violet-hud/10 border border-violet-hud/30 text-[10px] text-foreground/90 leading-snug">
                                <span className="font-mono text-[8px] uppercase text-violet-hud font-black">clave: </span>{exp.clave}
                              </div>
                              {/* v89.0 NEURONAS v2 — capa de decisión del operador */}
                              {typeof exp.confianza === "number" && (
                                <div>
                                  <div className="flex justify-between text-[8px] font-mono uppercase text-muted-foreground mb-0.5">
                                    <span>confianza del análisis</span>
                                    <span className="text-violet-hud font-bold">{exp.confianza}%</span>
                                  </div>
                                  <div className="h-1 bg-secondary overflow-hidden">
                                    <div className="h-full bg-violet-hud transition-all" style={{ width: `${exp.confianza}%` }} />
                                  </div>
                                </div>
                              )}
                              {exp.probabilidades && (
                                <div className="grid grid-cols-4 gap-1">
                                  {([["escalada", exp.probabilidades.escalada, "#FF3B30"], ["tensión", exp.probabilidades.tension, "#FFD60A"], ["estable", exp.probabilidades.estable, "#3DDCFF"], ["détente", exp.probabilidades.detente, "#00FF87"]] as const).map(([k, v, c]) => (
                                    <div key={k} className="border border-border/60 p-1">
                                      <p className="text-[7px] font-mono uppercase text-muted-foreground text-center leading-none mb-0.5">{k}</p>
                                      <p className="text-[10px] font-mono font-bold text-center" style={{ color: c }}>{v}%</p>
                                      <div className="h-0.5 bg-secondary mt-0.5">
                                        <div className="h-full transition-all" style={{ width: `${v}%`, background: c }} />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {exp.recomendacion && (
                                <div className="p-1.5 border-l-2 border-violet-hud bg-background/60 text-[10px] text-foreground/85 leading-snug">
                                  <span className="font-mono text-[8px] uppercase text-violet-hud font-black">acción del operador: </span>{exp.recomendacion}
                                </div>
                              )}
                              {exp.conexiones && exp.conexiones.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {exp.conexiones.map((c) => (
                                    <span key={c} className="text-[8px] font-mono uppercase px-1.5 py-0.5 border border-border text-muted-foreground">↳ {c}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
})()}
                      </div>
                    )}

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

// ---------- v89.0 RED NEURONAL DE VANGUARD ----------
// El cerebro de la plataforma hecho visible: cada cable que NEURONA firmó es
// una neurona; dos neuronas comparten sinapsis cuando detectan al mismo
// actor. Los impulsos viajan por las aristas y la red CRECE mientras lees.

function contarSinapsis(red: NeuronaNodo[]): number {
  let n = 0;
  for (let i = 0; i < red.length; i++) {
    for (let j = i + 1; j < red.length; j++) {
      if (red[i].actores.some((a) => red[j].actores.includes(a))) n++;
    }
  }
  return n;
}

function layoutRed(red: NeuronaNodo[]): { x: number; y: number }[] {
  // espiral de ángulo áureo — orgánica, nunca en fila
  return red.map((_, i) => {
    const r = 30 + 36 * Math.sqrt(i);
    const th = i * 2.39996323;
    return { x: 190 + r * Math.cos(th), y: 112 + r * Math.sin(th) * 0.72 };
  });
}

function RedNeuronal({
  red,
  abierta,
  onToggle,
  entrenando,
  onEntrenar,
}: {
  red: NeuronaNodo[];
  abierta: boolean;
  onToggle: () => void;
  entrenando: boolean;
  onEntrenar: () => void;
}) {
  const sinapsis = contarSinapsis(red);
  const riesgoMedio = red.length > 0 ? Math.round(red.reduce((s, n) => s + n.riesgo, 0) / red.length) : 0;
  const pos = layoutRed(red);

  const aristas: { i: number; j: number; actor: string }[] = [];
  for (let i = 0; i < red.length; i++) {
    for (let j = i + 1; j < red.length; j++) {
      const actor = red[i].actores.find((a) => red[j].actores.includes(a));
      if (actor) aristas.push({ i, j, actor });
    }
  }

  return (
    <div className="hud-corner border border-violet-hud/50 bg-violet-hud/5 overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-violet-hud/10 transition-colors">
        <BrainCircuit className={cn("w-4 h-4 text-violet-hud", (abierta || entrenando) && "v89-pulsa")} />
        <div className="text-left flex-1 min-w-0">
          <p className="text-[11px] font-mono font-black uppercase tracking-widest text-violet-hud leading-none">
            red neuronal de vanguard <span className="text-[8px] font-normal text-muted-foreground normal-case">· tecnología nativa v89</span>
          </p>
          <p className="text-[9px] font-mono text-muted-foreground mt-0.5 truncate">
            {red.length} neuronas · {sinapsis} sinapsis · riesgo medio {riesgoMedio} — cada expediente que firmas hace crecer el cerebro
          </p>
        </div>
        <span className="text-[9px] font-mono uppercase px-2 py-1 border border-violet-hud/60 text-violet-hud">
          {abierta ? "ocultar" : "abrir red"}
        </span>
      </button>

      {abierta && (
        <div className="px-3 pb-3">
          <div className="relative border border-violet-hud/30 bg-background/70 overflow-hidden">
            {/* fondo sináptico */}
            <div className="absolute inset-0 v89-synapse-bg pointer-events-none" aria-hidden />
            {red.length === 0 ? (
              <div className="p-6 text-center">
                <BrainCircuit className="w-8 h-8 mx-auto text-violet-hud/50 mb-2 v89-pulsa" />
                <p className="text-[11px] font-mono uppercase text-muted-foreground mb-3">
                  la red está en blanco — entrénala con los cables de hoy
                </p>
                <button
                  onClick={onEntrenar}
                  disabled={entrenando}
                  className="text-[10px] font-mono uppercase px-3 py-1.5 border border-violet-hud text-violet-hud hover:bg-violet-hud/20 active:scale-95 transition-all disabled:opacity-50"
                >
                  {entrenando ? "leyendo cables…" : "⚡ entrenar red con 3 cables"}
                </button>
              </div>
            ) : (
              <>
                <svg viewBox="0 0 380 224" className="w-full h-auto max-h-[280px]">
                  {/* aristas */}
                  {aristas.map((e, idx) => {
                    const a = pos[e.i];
                    const b = pos[e.j];
                    const id = `ne89-${idx}`;
                    return (
                      <g key={id}>
                        <path id={id} d={`M ${a.x} ${a.y} L ${b.x} ${b.y}`} stroke="#B48CFF" strokeWidth="0.7" opacity="0.4" className="v89-sinapsis" />
                        <circle r="2" fill="#E4D4FF">
                          <animateMotion dur={`${1.4 + (idx % 5) * 0.35}s`} repeatCount="indefinite" path={`M ${a.x} ${a.y} L ${b.x} ${b.y}`} />
                        </circle>
                      </g>
                    );
                  })}
                  {/* neuronas */}
                  {red.map((n, i) => {
                    const p = pos[i];
                    const r = 7 + (n.riesgo / 100) * 9;
                    const c = RED_SENT_HEX[n.sentimiento];
                    return (
                      <g key={n.id + i}>
                        <circle cx={p.x} cy={p.y} r={r + 3} fill={c} opacity="0.12" />
                        <circle cx={p.x} cy={p.y} r={r} fill={`${c}33`} stroke={c} strokeWidth="1.4" className="v89-pin" />
                        <text x={p.x} y={p.y + 2.5} textAnchor="middle" fontSize="7.5" fill={c} fontFamily="monospace" fontWeight="bold">
                          {n.riesgo}
                        </text>
                        <text x={p.x} y={p.y + r + 9} textAnchor="middle" fontSize="6" fill="#9aa0a6" fontFamily="monospace">
                          {n.titulo.slice(0, 24)}
                        </text>
                      </g>
                    );
                  })}
                </svg>
                <div className="flex items-center gap-2 flex-wrap px-1 pt-1.5 border-t border-violet-hud/20">
                  <span className="text-[8px] font-mono uppercase text-muted-foreground">
                    tamaño = riesgo · color = sentimiento · línea = actor compartido
                  </span>
                  <button
                    onClick={onEntrenar}
                    disabled={entrenando}
                    className="ml-auto text-[9px] font-mono uppercase px-2 py-1 border border-violet-hud text-violet-hud hover:bg-violet-hud/20 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {entrenando ? "entrenando…" : "⚡ entrenar +3"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
