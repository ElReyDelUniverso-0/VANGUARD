"use client";

// VANGUARD v26 — ESTUDIO COMUNITARIO (COMUNIDAD CREADORA)
// El usuario pidió: "en vez de agregar infinidad de personajes/armas/etc,
// haz que las personas las puedan subir ellas mismas con varias fotos,
// ellos crean la información" + "un agente que analice si ve contenido
// inapropiado lo elimina" + "que uno pueda crear encuestas, noticias".
//
// 7 tipos de contenido: personaje · arma · juego · música · noticia · encuesta · video
// Cada envío pasa por el AGENTE MODERADOR IA (server) antes de publicarse.

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useGameStore } from "@/lib/game-store";
import { sfx } from "@/lib/sound";
import { WORLD_FLAGS } from "@/lib/world-data";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { Countryball } from "@/components/vanguard/countryball";
import {
  BrainCircuit, Send, Sparkles, Loader2, Play, X, Trash2, Inbox, Palette,
} from "lucide-react";
import {
  KIND_META, PhotoUploader, AssemblyEditor, PollEditor, UgcCard, StatusBadge, PartLibraryPicker,
  parseJSON, timeAgo,
  type UgcItem, type UgcPhoto, type AssemblyStep,
} from "@/components/vanguard/creador-parts";

type Section = "crear" | "galeria" | "mios";
type Kind = "personaje" | "arma" | "juego" | "musica" | "noticia" | "encuesta" | "video";

const KINDS: Kind[] = ["personaje", "arma", "juego", "musica", "noticia", "encuesta", "video"];

const LS_LIKES = "vanguard_ugc_likes";
const LS_RATES = "vanguard_ugc_rates";
const LS_POLLS = "vanguard_ugc_polls";

function readSet(key: string): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(key) || "[]") as string[]);
  } catch {
    return new Set();
  }
}
function writeSet(key: string, s: Set<string>) {
  try {
    localStorage.setItem(key, JSON.stringify([...s]));
  } catch { /* noop */ }
}

interface Verdict {
  kind: "ok" | "review" | "rejected";
  title: string;
  reason: string;
  ai: boolean;
}

export function CreadorPanel() {
  const alias = useGameStore((s) => s.alias);
  const addCoins = useGameStore((s) => s.addCoins);
  const addXp = useGameStore((s) => s.addXp);

  const [section, setSection] = useState<Section>("crear");
  const [kind, setKind] = useState<Kind>("personaje");
  const [items, setItems] = useState<UgcItem[]>([]);
  const [stats, setStats] = useState<{ total: number; today: number; pending: number; kinds: Record<string, number> }>({ total: 0, today: 0, pending: 0, kinds: {} });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [filterKind, setFilterKind] = useState<string>("todos");
  const [sort, setSort] = useState("recent");
  const [playing, setPlaying] = useState<UgcItem | null>(null);

  // mis votos locales (coherentes con el enforcement server-side)
  const [myLikes, setMyLikes] = useState<Set<string>>(new Set());
  const [myRates, setMyRates] = useState<Record<string, number>>({});
  const [myPolls, setMyPolls] = useState<Set<string>>(new Set());

  // ---- formulario ----
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [body, setBody] = useState("");
  const [country, setCountry] = useState("");
  const [photos, setPhotos] = useState<UgcPhoto[]>([]);
  const [sensitive, setSensitive] = useState(false);
  const [specs, setSpecs] = useState<Record<string, string>>({ origen: "", calibre: "", peso: "", alcance: "", usuarios: "" });
  const [assembly, setAssembly] = useState<AssemblyStep[]>([]);
  const [gameUrl, setGameUrl] = useState("");
  const [gameHtml, setGameHtml] = useState("");
  const [gamePlatform, setGamePlatform] = useState("pc");
  const [audioData, setAudioData] = useState("");
  const [audioName, setAudioName] = useState("");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  const [videoUrl, setVideoUrl] = useState("");

  const loadItems = useCallback(async (k: string, s: string, mine: boolean) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ sort: s, limit: "60" });
      if (k !== "todos") params.set("kind", k);
      if (mine) {
        params.set("mine", "1");
        params.set("author", alias || "");
      }
      const res = await fetch(`/api/ugc?${params.toString()}`);
      const data = await res.json();
      setItems(data.items || []);
      if (!mine) setStats(data.stats || stats);
    } catch {
      toast.error("No se pudo cargar la galería");
    } finally {
      setLoading(false);
    }
  }, [alias]);

  useEffect(() => {
    setMyLikes(readSet(LS_LIKES));
    try {
      setMyRates(JSON.parse(localStorage.getItem(LS_RATES) || "{}"));
    } catch { setMyRates({}); }
    setMyPolls(readSet(LS_POLLS));
  }, []);

  useEffect(() => {
    loadItems(filterKind, sort, section === "mios");
  }, [filterKind, sort, section, loadItems]);

  const resetForm = () => {
    setTitle(""); setSummary(""); setBody(""); setCountry(""); setPhotos([]);
    setSensitive(false); setSpecs({ origen: "", calibre: "", peso: "", alcance: "", usuarios: "" });
    setAssembly([]); setGameUrl(""); setGameHtml(""); setGamePlatform("pc");
    setAudioData(""); setAudioName(""); setPollOptions(["", ""]); setVideoUrl("");
  };

  const handleAudio = (f: File | null) => {
    if (!f) return;
    if (f.size > 2_400_000) {
      toast.error("Audio demasiado pesado (máx ~2.4MB)", { description: "Recórtalo o sube una versión MP3" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setAudioData(String(reader.result || ""));
      setAudioName(f.name);
    };
    reader.readAsDataURL(f);
  };

  const submit = async () => {
    if (!title.trim() || title.trim().length < 3) {
      toast.error("Ponle un título a tu creación");
      return;
    }
    setSubmitting(true);
    setVerdict(null);
    try {
      const res = await fetch("/api/ugc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: alias || "ANÓNIMO",
          kind,
          title,
          summary,
          body,
          country,
          authorBall: country || "us",
          photos,
          sensitive,
          specs,
          assembly: assembly.filter((a) => a.pieza.trim()),
          gameUrl,
          gameHtml,
          gamePlatform,
          audioData,
          pollOptions: pollOptions.filter((o) => o.trim()).map((o) => ({ label: o })),
          videoUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "El agente rechazó el envío");
        return;
      }
      if (data.eliminated) {
        sfx.error();
        setVerdict({ kind: "rejected", title: "ELIMINADO POR EL AGENTE IA", reason: data.reason, ai: data.ai });
        return;
      }
      sfx.reward();
      addCoins(30, "Contenido comunitario publicado");
      addXp?.(15);
      if (data.verdict === "SOSPECHOSO") {
        setVerdict({ kind: "review", title: "EN REVISIÓN (PENDIENTE)", reason: data.reason, ai: data.ai });
        toast.warning("Tu envío pasa a revisión", { description: data.reason });
      } else {
        setVerdict({ kind: "ok", title: "¡PUBLICADO!", reason: data.reason || "El agente IA lo aprobó", ai: data.ai });
        toast.success("+30 monedas — publicación aprobada por el agente IA");
      }
      resetForm();
      loadItems(filterKind, sort, false);
    } catch {
      toast.error("Error de red al publicar");
    } finally {
      setSubmitting(false);
    }
  };

  // ---- acciones de interacción ----
  const toggleLike = async (item: UgcItem) => {
    const next = new Set(myLikes);
    if (next.has(item.id)) next.delete(item.id);
    else next.add(item.id);
    setMyLikes(next);
    writeSet(LS_LIKES, next);
    try {
      const res = await fetch(`/api/ugc/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "like", voter: alias || "ANÓNIMO" }),
      });
      const data = await res.json();
      if (data.liked) addXp?.(2);
      setItems((arr) => arr.map((i) => (i.id === item.id ? { ...i, likes: data.likes } : i)));
    } catch { /* noop */ }
  };

  const rate = async (item: UgcItem, value: number) => {
    if (myRates[item.id]) return;
    const next = { ...myRates, [item.id]: value };
    setMyRates(next);
    try {
      localStorage.setItem(LS_RATES, JSON.stringify(next));
    } catch { /* noop */ }
    try {
      const res = await fetch(`/api/ugc/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "rate", voter: alias || "ANÓNIMO", value }),
      });
      const data = await res.json();
      if (res.ok) {
        addXp?.(3);
        sfx.reward();
        setItems((arr) => arr.map((i) => (i.id === item.id ? { ...i, ratingSum: data.ratingSum, ratingCount: data.ratingCount } : i)));
      } else {
        toast.warning(data.error || "Ya calificaste");
      }
    } catch { /* noop */ }
  };

  const votePoll = async (item: UgcItem, optionIdx: number) => {
    if (myPolls.has(item.id)) {
      toast.warning("Ya votaste en esta encuesta");
      return;
    }
    try {
      const res = await fetch(`/api/ugc/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "votePoll", voter: alias || "ANÓNIMO", optionIdx }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.warning(data.error || "No se pudo votar");
        if (data.error?.includes("Ya votaste")) {
          const s = new Set(myPolls);
          s.add(item.id);
          setMyPolls(s);
          writeSet(LS_POLLS, s);
        }
        return;
      }
      const s = new Set(myPolls);
      s.add(item.id);
      setMyPolls(s);
      writeSet(LS_POLLS, s);
      addXp?.(3);
      sfx.click();
      setItems((arr) => arr.map((i) => (i.id === item.id ? { ...i, pollOptions: JSON.stringify(data.pollOptions) } : i)));
    } catch { /* noop */ }
  };

  const classify = async (item: UgcItem, label: string) => {
    try {
      const res = await fetch(`/api/ugc/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "classify", voter: alias || "ANÓNIMO", label }),
      });
      if (res.ok) {
        addXp?.(2);
        toast.success(`Clasificado como "${label}" — la comunidad decide el género`);
      }
    } catch { /* noop */ }
  };

  const play = (item: UgcItem) => {
    setPlaying(item);
    sfx.click();
    fetch(`/api/ugc/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "play" }),
    }).then((r) => r.json())
      .then((d) => setItems((arr) => arr.map((i) => (i.id === item.id ? { ...i, plays: d.plays ?? i.plays } : i))))
      .catch(() => {});
  };

  const report = async (item: UgcItem) => {
    try {
      const res = await fetch(`/api/ugc/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "report", voter: alias || "ANÓNIMO" }),
      });
      const data = await res.json();
      if (data.eliminated) {
        toast.success("El agente IA lo revisó y lo ELIMINÓ", { description: data.reason });
        setItems((arr) => arr.filter((i) => i.id !== item.id));
      } else if (res.ok) {
        toast.warning("Enviado a revisión del agente IA", { description: data.reason });
        setItems((arr) => arr.filter((i) => i.id !== item.id));
      }
    } catch { /* noop */ }
  };

  const remove = async (item: UgcItem) => {
    try {
      const res = await fetch(`/api/ugc/${item.id}?author=${encodeURIComponent(alias || "")}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Envío eliminado");
        setItems((arr) => arr.filter((i) => i.id !== item.id));
      } else {
        toast.error("Solo el autor puede eliminar");
      }
    } catch { /* noop */ }
  };

  const kindLabel = KIND_META[kind];

  return (
    <div className="space-y-4">
      <PanelHeader
        title="ESTUDIO COMUNITARIO"
        subtitle="TODO LO SUBE LA GENTE — personajes, armas, juegos, música, noticias, encuestas y videos con tus fotos y tu información"
        icon={<Palette className="w-5 h-5 text-violet-hud" />}
        color="violet"
      />

      {/* AGENTE MODERADOR IA — explicación */}
      <div className="hud-panel p-3 border-violet-hud/50 bg-violet-hud/5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-sm bg-violet-hud/20 border border-violet-hud/50 flex items-center justify-center shrink-0">
            <BrainCircuit className="w-5 h-5 text-violet-hud" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-mono font-bold text-violet-hud uppercase tracking-widest">Agente Moderador IA activo</div>
            <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
              Cada envío lo analiza un agente de IA antes de publicarse: si está limpio se publica al instante (+30 monedas),
              si es dudoso pasa a revisión y si es inapropiado se <span className="text-red-hud">elimina automáticamente</span> con su motivo.
              La comunidad además puede clasificar y reportar.
            </p>
          </div>
        </div>
      </div>

      {/* tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {([
          ["crear", "CREAR", <Sparkles className="w-3 h-3" key="a" />],
          ["galeria", "GALERÍA DE LA COMUNIDAD", <Inbox className="w-3 h-3" key="b" />],
          ["mios", "MIS ENVÍOS", <Send className="w-3 h-3" key="c" />],
        ] as [Section, string, React.ReactNode][]).map(([s, label, icon]) => (
          <button
            key={s}
            onClick={() => { setSection(s); sfx.click(); }}
            className={cn(
              "px-3 py-1.5 rounded-sm text-[10px] font-mono font-bold uppercase tracking-wider border transition-colors flex items-center gap-1.5",
              section === s ? "border-violet-hud text-violet-hud bg-violet-hud/20" : "border-border/60 text-muted-foreground hover:text-foreground"
            )}
          >
            {icon} {label}
            {s === "galeria" && stats.total > 0 && <span className="text-[9px] opacity-70">({stats.total})</span>}
          </button>
        ))}
      </div>

      {/* veredicto del agente */}
      {verdict && (
        <div
          className={cn(
            "hud-panel p-3 flex items-start gap-2",
            verdict.kind === "ok" && "border-green-hud/60 bg-green-hud/10",
            verdict.kind === "review" && "border-amber-hud/60 bg-amber-hud/10",
            verdict.kind === "rejected" && "border-red-hud/60 bg-red-hud/10"
          )}
        >
          <BrainCircuit className="w-5 h-5 shrink-0 mt-0.5 text-violet-hud" />
          <div>
            <div className="text-xs font-mono font-bold uppercase">{verdict.title}</div>
            <div className="text-[11px] text-muted-foreground">{verdict.reason} {verdict.ai ? "" : "(filtro local — IA no disponible)"}</div>
          </div>
          <button onClick={() => setVerdict(null)} className="ml-auto text-muted-foreground hover:text-foreground" aria-label="Cerrar veredicto">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ============ CREAR ============ */}
      {section === "crear" && (
        <div className="space-y-3">
          {/* selector de tipo */}
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
            {KINDS.map((k) => {
              const m = KIND_META[k];
              return (
                <button
                  key={k}
                  onClick={() => { setKind(k); sfx.click(); setVerdict(null); }}
                  className={cn(
                    "hud-corner p-2 text-center transition-all",
                    kind === k ? "border-violet-hud bg-violet-hud/20 glow-amber" : "border-border/60 hover:border-amber-hud/50"
                  )}
                >
                  <div className="text-lg leading-none">{m.emoji}</div>
                  <div className={cn("text-[9px] font-mono uppercase mt-1", kind === k ? "text-violet-hud font-bold" : "text-muted-foreground")}>
                    {m.label}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="hud-panel p-4 space-y-3">
            <div className="text-[10px] font-mono uppercase tracking-widest text-violet-hud">
              {kindLabel.emoji} Crear {kindLabel.label} — tú pones las fotos y la información
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-mono uppercase text-amber">Título *</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={120}
                  placeholder={kind === "arma" ? "AK-47 (según tu conocimiento)" : kind === "personaje" ? "El país-personaje que inventaste" : "Título de tu creación"}
                  className="w-full mt-1 bg-secondary border border-amber-hud/30 rounded-sm px-2 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase text-amber">País asociado</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full mt-1 bg-secondary border border-amber-hud/30 rounded-sm px-2 py-2 text-sm max-w-full"
                >
                  <option value="">— Mundial / sin país —</option>
                  {WORLD_FLAGS.map((c) => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase text-amber">Resumen corto</label>
              <input
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                maxLength={300}
                placeholder="Una línea que enganche"
                className="w-full mt-1 bg-secondary border border-amber-hud/30 rounded-sm px-2 py-2 text-sm"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase text-amber">
                {kind === "noticia" ? "Tu noticia (quiénes, qué, dónde, cuándo)" : "Información completa — la escribes tú"}
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                maxLength={6000}
                rows={4}
                placeholder={
                  kind === "arma"
                    ? "Para qué sirve, historia, datos curiosos, cómo se usa en los conflictos actuales…"
                    : kind === "noticia"
                    ? "Escribe la noticia con tus palabras. Si tienes fuente, ponla al final."
                    : "Todo lo que quieras contar"
                }
                className="w-full mt-1 bg-secondary border border-amber-hud/30 rounded-sm px-2 py-2 text-sm leading-snug"
              />
              <div className="text-[9px] font-mono text-muted-foreground text-right">{body.length}/6000</div>
            </div>

            <PhotoUploader photos={photos} onChange={setPhotos} />

            {/* campos por tipo */}
            {kind === "arma" && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                  {(["origen", "calibre", "peso", "alcance", "usuarios"] as const).map((k) => (
                    <div key={k}>
                      <label className="text-[9px] font-mono uppercase text-muted-foreground">{k}</label>
                      <input
                        value={specs[k]}
                        onChange={(e) => setSpecs((s) => ({ ...s, [k]: e.target.value }))}
                        placeholder={k === "origen" ? "URSS 1947" : k === "calibre" ? "7.62mm" : k === "alcance" ? "350m" : "—"}
                        className="w-full bg-secondary border border-amber-hud/30 rounded-sm px-2 py-1.5 text-[11px] font-mono"
                      />
                    </div>
                  ))}
                </div>
                <PartLibraryPicker onPick={(part) => {
                  if (assembly.length < 12 && !assembly.some((a) => a.pieza === part)) {
                    setAssembly([...assembly, { pieza: part, desc: "" }]);
                  } else if (assembly.some((a) => a.pieza === part)) {
                    toast.warning(`${part} ya está en el armado`);
                  } else {
                    toast.warning("Máximo 12 pasos — combina piezas si hace falta");
                  }
                }} />
                <AssemblyEditor steps={assembly} onChange={setAssembly} />
              </>
            )}

            {kind === "juego" && (
              <div className="space-y-2">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono uppercase text-amber">URL del juego (PC/móvil)</label>
                    <input
                      value={gameUrl}
                      onChange={(e) => setGameUrl(e.target.value)}
                      placeholder="https://mi-juego.vercel.app"
                      className="w-full mt-1 bg-secondary border border-amber-hud/30 rounded-sm px-2 py-2 text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase text-amber">Plataforma</label>
                    <select value={gamePlatform} onChange={(e) => setGamePlatform(e.target.value)} className="w-full mt-1 bg-secondary border border-amber-hud/30 rounded-sm px-2 py-2 text-sm">
                      <option value="pc">💻 PC</option>
                      <option value="movil">📱 Móvil</option>
                      <option value="ambos">📱💻 Ambos</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase text-amber">…o pega el HTML de tu juego propio (máx 60KB)</label>
                  <textarea
                    value={gameHtml}
                    onChange={(e) => setGameHtml(e.target.value)}
                    rows={3}
                    maxLength={60000}
                    placeholder="<canvas id=c></canvas><script>…tu juego en un archivo…</script>"
                    className="w-full mt-1 bg-secondary border border-amber-hud/30 rounded-sm px-2 py-2 text-[11px] font-mono"
                  />
                  <div className="text-[9px] font-mono text-muted-foreground text-right">{(gameHtml.length / 1024).toFixed(1)}KB / 60KB</div>
                </div>
                <p className="text-[9px] font-mono text-muted-foreground">
                  Al publicar, el juego queda jugable DENTRO de la página para todos los agentes.
                </p>
              </div>
            )}

            {kind === "musica" && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase text-amber">Tu música (MP3/WAV/OGG hasta 2.4MB)</label>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => handleAudio(e.target.files?.[0] ?? null)}
                  className="w-full text-[11px] font-mono text-muted-foreground file:mr-2 file:px-2 file:py-1 file:border file:border-amber-hud/40 file:rounded-sm file:font-mono file:text-[10px] file:uppercase file:text-amber file:bg-secondary"
                />
                {audioData && (
                  <div className="flex items-center gap-2">
                    <audio controls src={audioData} className="flex-1 h-8" />
                    <button onClick={() => { setAudioData(""); setAudioName(""); }} className="text-muted-foreground hover:text-red-hud" aria-label="Quitar audio">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {audioName && <p className="text-[9px] font-mono text-muted-foreground">{audioName}</p>}
                <p className="text-[9px] font-mono text-muted-foreground">
                  Los jugadores la escucharán, la calificarán con estrellas y le pondrán género (épica, marcha, tensión…).
                </p>
              </div>
            )}

            {kind === "encuesta" && <PollEditor options={pollOptions} onChange={setPollOptions} />}

            {kind === "video" && (
              <div>
                <label className="text-[10px] font-mono uppercase text-amber">Link de YouTube (tu directo o tu video)</label>
                <input
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=…"
                  className="w-full mt-1 bg-secondary border border-amber-hud/30 rounded-sm px-2 py-2 text-sm font-mono"
                />
                <p className="text-[9px] font-mono text-muted-foreground mt-1">
                  Que sea idea tuya: análisis, crónica desde tu ciudad, gameplay de conquista… se reproduce aquí dentro.
                </p>
              </div>
            )}

            {/* sensible */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={sensitive} onChange={(e) => setSensitive(e.target.checked)} className="accent-red-hud" />
              <span className="text-[10px] font-mono uppercase text-red-hud">
                Marcar 18+ (contenido fuerte — con el modo estricto activo nadie lo verá)
              </span>
            </label>

            <button
              onClick={submit}
              disabled={submitting}
              className={cn(
                "w-full h-10 rounded-sm font-mono font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all",
                submitting
                  ? "bg-secondary text-muted-foreground"
                  : "bg-violet-hud/40 border border-violet-hud text-violet-hud hover:bg-violet-hud/60"
              )}
            >
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> El agente IA está analizando…</> : <><Send className="w-4 h-4" /> Enviar al agente IA y publicar (+30 🪙)</>}
            </button>
          </div>
        </div>
      )}

      {/* ============ GALERÍA / MIS ENVÍOS ============ */}
      {section !== "crear" && (
        <div className="space-y-3">
          {section === "galeria" && (
            <div className="flex gap-1.5 flex-wrap items-center">
              <button
                onClick={() => setFilterKind("todos")}
                className={cn("px-2 py-1 text-[10px] font-mono uppercase rounded-sm border", filterKind === "todos" ? "border-amber-hud text-amber bg-amber-hud/20" : "border-border/60 text-muted-foreground")}
              >
                Todos
              </button>
              {KINDS.map((k) => (
                <button
                  key={k}
                  onClick={() => setFilterKind(k)}
                  className={cn("px-2 py-1 text-[10px] font-mono uppercase rounded-sm border", filterKind === k ? "border-amber-hud text-amber bg-amber-hud/20" : "border-border/60 text-muted-foreground hover:text-foreground")}
                >
                  {KIND_META[k].emoji} {KIND_META[k].label}
                  {stats.kinds[k] ? ` (${stats.kinds[k]})` : ""}
                </button>
              ))}
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="ml-auto bg-secondary border border-amber-hud/30 rounded-sm px-2 py-1 text-[10px] font-mono uppercase"
              >
                <option value="recent">Recientes</option>
                <option value="top">Más likes</option>
                <option value="rating">Mejor calificados</option>
                <option value="plays">Más jugados/escuchados</option>
              </select>
            </div>
          )}
          {section === "mios" && (
            <p className="text-[10px] font-mono text-muted-foreground">
              Tu cola personal — aquí ves también lo que el agente dejó EN REVISIÓN o ELIMINÓ (con el motivo).
            </p>
          )}

          {loading ? (
            <div className="hud-panel p-8 flex items-center justify-center gap-2 text-[11px] font-mono uppercase text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> cargando…
            </div>
          ) : items.length === 0 ? (
            <div className="hud-panel p-8 text-center">
              <div className="text-2xl mb-2">{section === "mios" ? "📭" : "🌱"}</div>
              <div className="text-xs font-mono uppercase text-muted-foreground">
                {section === "mios" ? "Todavía no has enviado nada — ¡sé el primero!" : "Vacío por ahora — crea algo en CREAR"}
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
              {items.map((item) => (
                <UgcCard
                  key={item.id}
                  item={item}
                  myVote={myLikes.has(item.id)}
                  onLike={toggleLike}
                  onRate={rate}
                  onPlay={play}
                  onVotePoll={votePoll}
                  onClassify={classify}
                  onReport={report}
                  onDelete={remove}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* modal JUGAR (sandbox) */}
      {playing && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-2 sm:p-6" onClick={() => setPlaying(null)}>
          <div className="hud-panel border-amber-hud w-full max-w-4xl max-h-full flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-amber-hud/30">
              <div className="min-w-0">
                <div className="text-xs font-mono font-bold text-amber truncate">🎮 {playing.title}</div>
                <div className="text-[9px] font-mono text-muted-foreground">por @{playing.author} · {playing.plays} jugadas</div>
              </div>
              <button onClick={() => setPlaying(null)} className="text-muted-foreground hover:text-red-hud" aria-label="Cerrar juego">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 min-h-[50vh]">
              {playing.gameHtml ? (
                <iframe
                  title={playing.title}
                  sandbox="allow-scripts allow-pointer-lock"
                  srcDoc={playing.gameHtml}
                  className="w-full h-[60vh] bg-black"
                />
              ) : (
                <iframe
                  title={playing.title}
                  src={playing.gameUrl}
                  sandbox="allow-scripts allow-same-origin allow-pointer-lock"
                  className="w-full h-[60vh] bg-black"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* stats footer */}
      <div className="hud-panel p-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[9px] font-mono uppercase text-muted-foreground">
        <span className="text-violet-hud font-bold">COMUNIDAD CREADORA</span>
        <span>{stats.total} publicaciones</span>
        <span>+{stats.today} hoy</span>
        {stats.pending > 0 && <span className="text-amber">⏳ {stats.pending} en revisión</span>}
        <span className="ml-auto">+30 🪙 por publicar · +15 XP · recompensa sonora 🎵 en cada premio</span>
      </div>
    </div>
  );
}
