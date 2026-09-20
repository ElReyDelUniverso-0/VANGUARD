"use client";

// VANGUARD v27 — ESTUDIOS CREADORES
// Un estudio COMPLETO para cada sección de la página: aquí la comunidad no
// solo consume, CREA. Noticias con fotos propias, banderas propias, mapas
// propios con flechas, música compuesta DENTRO de la página, stickers y
// posts de comunidad. Todo pasa por el AGENTE MODERADOR IA y todo es
// comentable. Lo inapropiado se elimina solo, con motivo.

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Newspaper, Flag as FlagIcon, Map as MapIcon, Music4, Sticker, MessagesSquare,
  Send, Plus, Minus, Play, Square, Loader2, Trash2, Wand2, Users, ShieldCheck,
} from "lucide-react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { Countryball } from "@/components/vanguard/countryball";
import { WORLD_FLAGS, countryName } from "@/lib/world-data";
import { useGameStore } from "@/lib/game-store";
import { sfx } from "@/lib/sound";
import { cn } from "@/lib/utils";
import {
  UgcCard, PhotoUploader, KIND_META,
  FlagRender, defaultFlagDesign, FLAG_SYMBOLS, FLAG_PALETTE, type FlagDesign,
  MapRender, type MapDesign, type MapItem, MAP_COLORS, MAP_ICONS,
  type UgcItem, type UgcPhoto,
} from "@/components/vanguard/creador-parts";
import {
  STUDIO_GENRES, emptyPattern, playPreview, stopPreview, renderToWav, type StudioPattern,
} from "@/lib/music-studio";

type StudioTab = "noticias" | "banderas" | "mapas" | "musica" | "stickers" | "comunidad";

const LS_STUDIO_LIKES = "vanguard_studio_likes";
const LS_STUDIO_RATES = "vanguard_studio_rates";
const LS_STUDIO_POLLS = "vanguard_studio_polls";

function readSet(key: string): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(key) || "[]") as string[]);
  } catch {
    return new Set();
  }
}

const NOTE_CYCLE = [-1, 0, 3, 5, 7, 10, 12, 15, 17];

// ============ feed UGC reutilizable por estudio ============
function useUgcFeed(kind: string) {
  const alias = useGameStore((s) => s.alias);
  const addCoins = useGameStore((s) => s.addCoins);
  const addXp = useGameStore((s) => s.addXp);
  const [items, setItems] = useState<UgcItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [myLikes, setMyLikes] = useState<Set<string>>(new Set());
  const [myRates, setMyRates] = useState<Record<string, number>>({});
  const [myPolls, setMyPolls] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/ugc?kind=${kind}&sort=recent&limit=40`);
      const data = await res.json();
      setItems(data.items || []);
    } catch {
      toast.error("No se pudo cargar el estudio");
    } finally {
      setLoading(false);
    }
  }, [kind]);

  useEffect(() => {
    setMyLikes(readSet(LS_STUDIO_LIKES));
    try {
      setMyRates(JSON.parse(localStorage.getItem(LS_STUDIO_RATES) || "{}") as Record<string, number>);
    } catch {
      setMyRates({});
    }
    setMyPolls(readSet(LS_STUDIO_POLLS));
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const toggleLike = async (item: UgcItem) => {
    const next = new Set(myLikes);
    if (next.has(item.id)) next.delete(item.id);
    else next.add(item.id);
    setMyLikes(next);
    try {
      localStorage.setItem(LS_STUDIO_LIKES, JSON.stringify([...next]));
    } catch { /* noop */ }
    try {
      const res = await fetch(`/api/ugc/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "like", voter: alias || "ANÓNIMO" }),
      });
      const data = await res.json();
      if (data.liked) addXp(2);
      setItems((arr) => arr.map((i) => (i.id === item.id ? { ...i, likes: data.likes } : i)));
    } catch { /* noop */ }
  };

  const rate = async (item: UgcItem, value: number) => {
    if (myRates[item.id]) return;
    const next = { ...myRates, [item.id]: value };
    setMyRates(next);
    try {
      localStorage.setItem(LS_STUDIO_RATES, JSON.stringify(next));
    } catch { /* noop */ }
    try {
      const res = await fetch(`/api/ugc/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "rate", voter: alias || "ANÓNIMO", value }),
      });
      const data = await res.json();
      if (res.ok) {
        addXp(3);
        sfx.reward();
        setItems((arr) => arr.map((i) => (i.id === item.id ? { ...i, ratingSum: data.ratingSum, ratingCount: data.ratingCount } : i)));
      } else {
        toast.warning(data.error || "Ya calificaste");
      }
    } catch { /* noop */ }
  };

  const votePoll = async (item: UgcItem, optionIdx: number) => {
    if (myPolls.has(item.id)) return;
    try {
      const res = await fetch(`/api/ugc/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "votePoll", voter: alias || "ANÓNIMO", optionIdx }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.warning(data.error || "No se pudo votar");
        return;
      }
      const s = new Set(myPolls);
      s.add(item.id);
      setMyPolls(s);
      try {
        localStorage.setItem(LS_STUDIO_POLLS, JSON.stringify([...s]));
      } catch { /* noop */ }
      addXp(3);
      setItems((arr) => arr.map((i) => (i.id === item.id ? { ...i, pollOptions: JSON.stringify(data.pollOptions) } : i)));
    } catch { /* noop */ }
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
        void load();
      } else if (res.ok) {
        toast.warning("Enviado a revisión del agente IA", { description: data.reason });
      }
    } catch { /* noop */ }
  };

  const remove = async (item: UgcItem) => {
    try {
      const res = await fetch(`/api/ugc/${item.id}?author=${encodeURIComponent(alias || "")}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Eliminado");
        setItems((arr) => arr.filter((i) => i.id !== item.id));
      } else {
        toast.error("Solo el autor puede eliminar");
      }
    } catch { /* noop */ }
  };

  return { alias, addCoins, items, loading, myLikes, myRates, myPolls, reload: load, toggleLike, rate, votePoll, report, remove, setItems };
}

// ============ publicar con el AGENTE IA ============
async function publishUgc(payload: Record<string, unknown>): Promise<boolean> {
  try {
    const res = await fetch("/api/ugc", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.eliminated) {
      toast.error(`ELIMINADO POR EL AGENTE IA — ${data.reason ?? "contenido inapropiado"}`);
      sfx.error();
      return false;
    }
    if (!res.ok) {
      toast.error(data.error || "El estudio rechazó el envío");
      sfx.error();
      return false;
    }
    sfx.reward();
    const ver = data.verdict === "LIMPIO" ? "contenido apropiado ✓" : data.verdict === "SOSPECHOSO" ? "en revisión humana" : "";
    toast.success(`¡PUBLICADO! ${payload.title ? String(payload.title).slice(0, 40) : ""}`, {
      description: `+${data.reward} monedas · Agente IA: ${ver}`,
    });
    return true;
  } catch {
    toast.error("Sin conexión con el estudio");
    return false;
  }
}

// ============ país: select con 251 países ============
function CountrySelect({ value, onChange, label }: { value: string; onChange: (c: string) => void; label: string }) {
  return (
    <label className="block">
      <span className="text-[9px] font-mono uppercase text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-secondary border border-amber-hud/30 rounded-sm px-2 py-1.5 text-[11px]"
      >
        <option value="">🌍 Mundo</option>
        {WORLD_FLAGS.map((f) => (
          <option key={f.code} value={f.code}>{f.name}</option>
        ))}
      </select>
    </label>
  );
}

const NEWS_CATS = ["CONFLICTO", "POLÍTICA", "ECONOMÍA", "SOCIEDAD", "TECNOLOGÍA", "DENUNCIA"];

// ============ ESTUDIO DE NOTICIAS ============
function NoticiasStudio() {
  const alias = useGameStore((s) => s.alias);
  const feed = useUgcFeed("noticia");
  const [title, setTitle] = useState("");
  const [cat, setCat] = useState("CONFLICTO");
  const [country, setCountry] = useState("");
  const [body, setBody] = useState("");
  const [photos, setPhotos] = useState<UgcPhoto[]>([]);
  const [sensitive, setSensitive] = useState(false);
  const [busy, setBusy] = useState(false);

  const canPost = title.trim().length >= 5 && body.trim().length >= 80 && !busy;

  const publish = async () => {
    if (!canPost) return;
    setBusy(true);
    const ok = await publishUgc({
      kind: "noticia", author: alias || "ANÓNIMO", title: `[${cat}] ${title.trim()}`,
      summary: body.trim().slice(0, 180), body: body.trim(), country, photos, sensitive,
    });
    setBusy(false);
    if (ok) {
      setTitle(""); setBody(""); setPhotos([]); setSensitive(false);
      void feed.reload();
    }
  };

  return (
    <div className="grid lg:grid-cols-[380px_1fr] gap-4">
      <div className="space-y-2.5 hud-panel p-3 border-amber-hud/40">
        <div className="flex items-center gap-2">
          <Newspaper className="w-4 h-4 text-amber" />
          <h3 className="text-[12px] font-bold uppercase text-amber tracking-wide">Estudio de Noticias</h3>
        </div>
        <p className="text-[10px] text-muted-foreground leading-snug">
          Escribe TU noticia del mundo con tus propias fotos. El agente IA la analiza al instante: si es apropiada se
          publica en el canal comunitario. La comunidad puede comentarla y reportarla — lo falso o inapropiado se elimina.
        </p>
        <input
          value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100}
          placeholder="Titular de la noticia…"
          className="w-full bg-secondary border border-amber-hud/30 rounded-sm px-2 py-1.5 text-[11px] font-mono"
        />
        <div className="flex gap-1 flex-wrap">
          {NEWS_CATS.map((c) => (
            <button key={c} onClick={() => setCat(c)}
              className={cn("px-1.5 py-0.5 text-[9px] font-mono border rounded-sm transition-colors",
                cat === c ? "bg-amber-hud/40 border-amber-hud text-amber" : "border-amber-hud/25 text-muted-foreground hover:border-amber-hud")}>
              {c}
            </button>
          ))}
        </div>
        <CountrySelect label="País de la noticia" value={country} onChange={setCountry} />
        <div>
          <textarea
            value={body} onChange={(e) => setBody(e.target.value)} maxLength={4000} rows={5}
            placeholder="Desarrolla la información: qué pasó, dónde, cuándo, quién lo confirma…"
            className="w-full bg-secondary border border-amber-hud/30 rounded-sm px-2 py-1.5 text-[11px] leading-snug"
          />
          <div className={cn("text-[9px] font-mono mt-0.5", body.trim().length >= 80 ? "text-green-hud" : "text-muted-foreground")}>
            {body.trim().length}/80 mínimo · {body.length} caracteres
          </div>
        </div>
        <PhotoUploader photos={photos} onChange={setPhotos} max={6} />
        <label className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
          <input type="checkbox" checked={sensitive} onChange={(e) => setSensitive(e.target.checked)} className="accent-red-hud" />
          Marcar 18+ (imágenes fuertes — se pide confirmación antes de verlas)
        </label>
        <button
          onClick={() => void publish()} disabled={!canPost}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-amber-hud/40 border border-amber-hud text-amber rounded-sm text-[11px] font-mono uppercase font-bold hover:bg-amber-hud/70 disabled:opacity-40 transition-colors"
        >
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          Publicar noticia (+30 monedas)
        </button>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-mono uppercase text-cyan-hud flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" /> Canal comunitario — noticias de los jugadores
          </h3>
          <button onClick={() => void feed.reload()} className="text-[9px] font-mono uppercase text-muted-foreground hover:text-amber">
            actualizar
          </button>
        </div>
        {feed.loading && <div className="text-[10px] font-mono text-muted-foreground">cargando noticias…</div>}
        {!feed.loading && feed.items.length === 0 && (
          <div className="hud-panel p-4 text-center text-[11px] text-muted-foreground">
            Aún no hay noticias de la comunidad — sé el primer corresponsal.
          </div>
        )}
        <div className="grid md:grid-cols-2 gap-2">
          {feed.items.map((it) => (
            <UgcCard key={it.id} item={it} myVote={feed.myLikes.has(it.id)}
              onLike={feed.toggleLike} onReport={feed.report} onDelete={feed.remove} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ============ ESTUDIO DE BANDERAS ============
function BanderasStudio() {
  const alias = useGameStore((s) => s.alias);
  const feed = useUgcFeed("bandera");
  const [design, setDesign] = useState<FlagDesign>(defaultFlagDesign());
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (patch: Partial<FlagDesign>) => setDesign((d) => ({ ...d, ...patch }));

  const setColorAt = (i: number, c: string) => {
    const colors = [...design.colors];
    colors[i] = c;
    set({ colors });
  };
  const addStripe = () => design.colors.length < 5 && set({ colors: [...design.colors, FLAG_PALETTE[3]] });
  const delStripe = () => design.colors.length > 1 && set({ colors: design.colors.slice(0, -1) });

  const publish = async () => {
    if (!name.trim() || busy) return;
    setBusy(true);
    const ok = await publishUgc({
      kind: "bandera", author: alias || "ANÓNIMO", title: name.trim().slice(0, 100),
      summary: `Bandera propia de la comunidad`, country,
      specs: JSON.stringify(design), sensitive: false,
    });
    setBusy(false);
    if (ok) {
      setName("");
      void feed.reload();
    }
  };

  return (
    <div className="grid lg:grid-cols-[380px_1fr] gap-4">
      <div className="space-y-2.5 hud-panel p-3 border-green-hud/40">
        <div className="flex items-center gap-2">
          <FlagIcon className="w-4 h-4 text-green-hud" />
          <h3 className="text-[12px] font-bold uppercase text-green-hud tracking-wide">Crea tu propia Bandera</h3>
        </div>
        <p className="text-[10px] text-muted-foreground leading-snug">
          Franjas, disco, símbolo y lema: diseña la bandera de tu nación, tu facción o tu comunidad y publícala a la
          galería mundial. Se guarda como diseño vivo — cualquiera la ve renderizada exactamente igual.
        </p>
        <div className="flex justify-center bg-secondary/40 rounded-sm p-3">
          <FlagRender design={design} width={200} />
        </div>
        <div className="flex gap-1">
          <button onClick={() => set({ dir: "h" })} className={cn("flex-1 px-2 py-1 text-[10px] font-mono border rounded-sm", design.dir === "h" ? "border-green-hud text-green-hud bg-green-hud/20" : "border-muted text-muted-foreground")}>franjas horizontales</button>
          <button onClick={() => set({ dir: "v" })} className={cn("flex-1 px-2 py-1 text-[10px] font-mono border rounded-sm", design.dir === "v" ? "border-green-hud text-green-hud bg-green-hud/20" : "border-muted text-muted-foreground")}>verticales</button>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono uppercase text-muted-foreground">Franjas ({design.colors.length}/5)</span>
            <div className="flex gap-1">
              <button onClick={addStripe} disabled={design.colors.length >= 5} className="text-green-hud disabled:opacity-30" aria-label="Añadir franja"><Plus className="w-3.5 h-3.5" /></button>
              <button onClick={delStripe} disabled={design.colors.length <= 1} className="text-red-hud disabled:opacity-30" aria-label="Quitar franja"><Minus className="w-3.5 h-3.5" /></button>
            </div>
          </div>
          {design.colors.map((c, i) => (
            <div key={i} className="flex items-center gap-1 flex-wrap">
              <span className="text-[9px] font-mono text-muted-foreground w-5">#{i + 1}</span>
              {FLAG_PALETTE.map((p) => (
                <button key={p} onClick={() => setColorAt(i, p)}
                  className={cn("w-4.5 h-4.5 w-[18px] h-[18px] rounded-sm border", c === p ? "border-amber scale-110" : "border-black/40")}
                  style={{ background: p }} aria-label={`color ${p}`} />
              ))}
            </div>
          ))}
        </div>
        <div>
          <span className="text-[9px] font-mono uppercase text-muted-foreground">Símbolo central</span>
          <div className="flex gap-1 flex-wrap mt-0.5">
            {FLAG_SYMBOLS.map((s, i) => (
              <button key={i} onClick={() => set({ symbol: s })}
                className={cn("w-7 h-7 text-sm border rounded-sm", design.symbol === s ? "border-green-hud bg-green-hud/20" : "border-amber-hud/25 hover:border-green-hud")}>
                {s || "∅"}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[9px] font-mono uppercase text-muted-foreground">Disco:</span>
          <button onClick={() => set({ circle: "" })} className={cn("px-1.5 py-0.5 text-[9px] font-mono border rounded-sm", !design.circle ? "border-green-hud text-green-hud" : "border-muted text-muted-foreground")}>sin disco</button>
          {FLAG_PALETTE.map((p) => (
            <button key={p} onClick={() => set({ circle: p })}
              className={cn("w-4 h-4 rounded-full border", design.circle === p ? "border-amber scale-110" : "border-black/40")}
              style={{ background: p }} aria-label={`disco ${p}`} />
          ))}
        </div>
        <div className="flex gap-1.5">
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} placeholder="Nombre de tu bandera (República del Sol…)"
            className="flex-1 min-w-0 bg-secondary border border-green-hud/30 rounded-sm px-2 py-1.5 text-[11px]" />
          <button onClick={() => void publish()} disabled={!name.trim() || busy}
            className="px-3 bg-green-hud/40 border border-green-hud text-green-hud rounded-sm text-[10px] font-mono uppercase font-bold disabled:opacity-40">
            {busy ? "…" : "Publicar"}
          </button>
        </div>
        <CountrySelect label="Nación asociada" value={country} onChange={setCountry} />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-mono uppercase text-cyan-hud flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" /> Galería de banderas de la comunidad
          </h3>
          <button onClick={() => void feed.reload()} className="text-[9px] font-mono uppercase text-muted-foreground hover:text-amber">actualizar</button>
        </div>
        {feed.loading && <div className="text-[10px] font-mono text-muted-foreground">cargando banderas…</div>}
        {!feed.loading && feed.items.length === 0 && (
          <div className="hud-panel p-4 text-center text-[11px] text-muted-foreground">Nadie ha izado una bandera todavía — diseña la primera.</div>
        )}
        <div className="grid md:grid-cols-2 gap-2">
          {feed.items.map((it) => (
            <UgcCard key={it.id} item={it} myVote={feed.myLikes.has(it.id)}
              onLike={feed.toggleLike} onReport={feed.report} onDelete={feed.remove} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ============ ESTUDIO DE MAPAS (flechas, marcadores, zonas) ============
const MAP_TOOLS: { id: MapItem["type"]; label: string; hint: string }[] = [
  { id: "arrow", label: "Flecha de avance", hint: "1er click: origen · 2º click: destino" },
  { id: "marker", label: "Marcador", hint: "click donde colocar el icono" },
  { id: "label", label: "Etiqueta", hint: "click para fijar el texto" },
  { id: "zone", label: "Zona de control", hint: "click para centrar la zona" },
];

function MapasStudio() {
  const alias = useGameStore((s) => s.alias);
  const feed = useUgcFeed("mapa");
  const [items, setItems] = useState<MapItem[]>([]);
  const [tool, setTool] = useState<MapItem["type"]>("arrow");
  const [color, setColor] = useState(MAP_COLORS[0]);
  const [icon, setIcon] = useState(MAP_ICONS[0]);
  const [labelText, setLabelText] = useState("");
  const [title, setTitle] = useState("");
  const [arrowStart, setArrowStart] = useState<{ x: number; y: number } | null>(null);
  const [busy, setBusy] = useState(false);

  const activeTool = MAP_TOOLS.find((t) => t.id === tool)!;

  const onMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 1000) / 10;
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 1000) / 10;
    if (tool === "arrow") {
      if (!arrowStart) {
        setArrowStart({ x, y });
        return;
      }
      setItems((arr) => [...arr, { id: `a${Date.now()}`, type: "arrow", x: arrowStart.x, y: arrowStart.y, x2: x, y2: y, color }]);
      setArrowStart(null);
      return;
    }
    if (tool === "marker") {
      setItems((arr) => [...arr, { id: `m${Date.now()}`, type: "marker", x, y, color, icon }]);
      return;
    }
    if (tool === "zone") {
      setItems((arr) => [...arr, { id: `z${Date.now()}`, type: "zone", x, y, color }]);
      return;
    }
    // label
    if (!labelText.trim()) {
      toast.warning("Escribe el texto de la etiqueta antes de fijarla");
      return;
    }
    setItems((arr) => [...arr, { id: `l${Date.now()}`, type: "label", x, y, color, text: labelText.trim().slice(0, 28) }]);
    setLabelText("");
  };

  const preview: MapDesign = { items, title: title || "Mapa de la comunidad" };
  const publish = async () => {
    if (items.length === 0 || busy) return;
    setBusy(true);
    const ok = await publishUgc({
      kind: "mapa", author: alias || "ANÓNIMO",
      title: title.trim() || "Mapa táctico de la comunidad",
      summary: `${items.length} elementos dibujados sobre el mapa del mundo`,
      specs: JSON.stringify(preview), sensitive: false,
    });
    setBusy(false);
    if (ok) {
      setItems([]); setTitle(""); setArrowStart(null);
      void feed.reload();
    }
  };

  return (
    <div className="grid lg:grid-cols-[380px_1fr] gap-4">
      <div className="space-y-2.5 hud-panel p-3 border-amber-hud/40">
        <div className="flex items-center gap-2">
          <MapIcon className="w-4 h-4 text-amber" />
          <h3 className="text-[12px] font-bold uppercase text-amber tracking-wide">Editor de Mapas</h3>
        </div>
        <p className="text-[10px] text-muted-foreground leading-snug">
          Dibuja sobre el mapa del mundo: flechas de avance, marcadores de batalla, zonas de control y etiquetas.
          Publica tu análisis táctico — la galería lo re-renderiza en vivo desde tu diseño.
        </p>
        <div className="grid grid-cols-2 gap-1">
          {MAP_TOOLS.map((t) => (
            <button key={t.id} onClick={() => { setTool(t.id); setArrowStart(null); }}
              className={cn("px-2 py-1.5 text-[10px] font-mono border rounded-sm text-left transition-colors",
                tool === t.id ? "border-amber-hud text-amber bg-amber-hud/20" : "border-amber-hud/25 text-muted-foreground hover:border-amber-hud")}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="text-[9px] font-mono text-cyan-hud">→ {activeTool.hint}</div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[9px] font-mono uppercase text-muted-foreground">Color:</span>
          {MAP_COLORS.map((c) => (
            <button key={c} onClick={() => setColor(c)}
              className={cn("w-4.5 h-4.5 w-[18px] h-[18px] rounded-sm border", color === c ? "border-amber scale-110" : "border-black/40")}
              style={{ background: c }} aria-label={`color ${c}`} />
          ))}
        </div>
        {tool === "marker" && (
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-[9px] font-mono uppercase text-muted-foreground">Icono:</span>
            {MAP_ICONS.map((m) => (
              <button key={m} onClick={() => setIcon(m)}
                className={cn("w-7 h-7 text-sm border rounded-sm", icon === m ? "border-amber-hud bg-amber-hud/20" : "border-amber-hud/25")}>
                {m}
              </button>
            ))}
          </div>
        )}
        {tool === "label" && (
          <input value={labelText} onChange={(e) => setLabelText(e.target.value)} maxLength={28}
            placeholder="Texto de la etiqueta (Frente Este…)"
            className="w-full bg-secondary border border-amber-hud/30 rounded-sm px-2 py-1.5 text-[11px]" />
        )}
        <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={60}
          placeholder="Título del mapa (Ofensiva del Donbás…)"
          className="w-full bg-secondary border border-amber-hud/30 rounded-sm px-2 py-1.5 text-[11px]" />
        {arrowStart && (
          <div className="text-[9px] font-mono text-amber">origen fijado en {arrowStart.x}%·{arrowStart.y}% — click en el destino</div>
        )}
        {items.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {items.map((it, i) => (
              <button key={it.id} onClick={() => setItems((arr) => arr.filter((x) => x.id !== it.id))}
                className="flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-mono bg-secondary border border-amber-hud/25 rounded-sm hover:border-red-hud hover:text-red-hud"
                aria-label={`quitar elemento ${i + 1}`}>
                <Trash2 className="w-2.5 h-2.5" />
                {it.type === "arrow" ? "flecha" : it.type === "zone" ? "zona" : it.text || it.icon || it.type}
              </button>
            ))}
          </div>
        )}
        <button onClick={() => void publish()} disabled={items.length === 0 || busy}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-amber-hud/40 border border-amber-hud text-amber rounded-sm text-[11px] font-mono uppercase font-bold hover:bg-amber-hud/70 disabled:opacity-40 transition-colors">
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          Publicar mapa (+30 monedas)
        </button>
      </div>
      <div className="space-y-3">
        <div className="space-y-2">
          <div
            className="relative w-full border border-amber-hud/40 rounded-sm overflow-hidden cursor-crosshair"
            style={{ aspectRatio: "2 / 1" }}
            onClick={onMapClick}
          >
            <MapRender design={preview} />
          </div>
          <div className="text-[9px] font-mono text-muted-foreground text-center">
            vista previa en vivo · {items.length} elementos · click sobre el mapa para dibujar
          </div>
        </div>
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-mono uppercase text-cyan-hud flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" /> Mapas de la comunidad
          </h3>
          <button onClick={() => void feed.reload()} className="text-[9px] font-mono uppercase text-muted-foreground hover:text-amber">actualizar</button>
        </div>
        <div className="grid md:grid-cols-2 gap-2">
          {feed.items.map((it) => (
            <UgcCard key={it.id} item={it} myVote={feed.myLikes.has(it.id)}
              onLike={feed.toggleLike} onReport={feed.report} onDelete={feed.remove} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ============ ESTUDIO DE MÚSICA (componer + render WAV dentro de la página) ============
function MusicaStudio() {
  const alias = useGameStore((s) => s.alias);
  const feed = useUgcFeed("musica");
  const [pat, setPat] = useState<StudioPattern>(() => emptyPattern("marcha"));
  const [playing, setPlaying] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [trackName, setTrackName] = useState("");

  const set = (patch: Partial<StudioPattern>) => setPat((p) => ({ ...p, ...patch }));
  const toggleDrum = (row: "kick" | "snare" | "hat", i: number) =>
    setPat((p) => ({ ...p, [row]: p[row].map((v, j) => (j === i ? !v : v)) }));
  const cycleNote = (row: "bass" | "lead", i: number) =>
    setPat((p) => ({
      ...p,
      [row]: p[row].map((v, j) => {
        if (j !== i) return v;
        const idx = NOTE_CYCLE.indexOf(v);
        return NOTE_CYCLE[(idx + 1) % NOTE_CYCLE.length];
      }),
    }));

  const play = () => {
    setPlaying(true);
    playPreview(pat, () => setPlaying(false));
  };
  const stop = () => {
    stopPreview();
    setPlaying(false);
  };

  const renderAndPublish = async () => {
    if (!trackName.trim() || rendering) return;
    setRendering(true);
    try {
      const wav = await renderToWav(pat, 4);
      const ok = await publishUgc({
        kind: "musica", author: alias || "ANÓNIMO",
        title: trackName.trim(), summary: `Composición creada en el Estudio de Música de VANGUARD · ${pat.bpm} BPM`,
        audioData: wav, audioGenre: "estudio", sensitive: false,
      });
      if (ok) {
        setTrackName("");
        void feed.reload();
      }
    } catch {
      toast.error("No se pudo renderizar el audio en este navegador");
    } finally {
      setRendering(false);
    }
  };

  const noteLabel = (v: number) => (v < 0 ? "" : String(v));

  return (
    <div className="grid lg:grid-cols-[380px_1fr] gap-4">
      <div className="space-y-2.5 hud-panel p-3 border-cyan-hud/40">
        <div className="flex items-center gap-2">
          <Music4 className="w-4 h-4 text-cyan-hud" />
          <h3 className="text-[12px] font-bold uppercase text-cyan-hud tracking-wide">Estudio de Música</h3>
        </div>
        <p className="text-[10px] text-muted-foreground leading-snug">
          Compón TU música de conflicto dentro de la página: 16 pasos × 5 pistas, BPM y ondas. Escucha la vista previa y
          publícala — se renderiza a WAV real en tu navegador y la comunidad la califica.
        </p>
        <div className="flex gap-1 flex-wrap">
          {STUDIO_GENRES.map((g) => (
            <button key={g.id} onClick={() => setPat(g.build())} title={g.desc}
              className="px-1.5 py-0.5 text-[9px] font-mono border border-cyan-hud/30 text-cyan-hud rounded-sm hover:bg-cyan-hud/20">
              {g.name}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-[64px_1fr] gap-x-2 gap-y-1 items-center">
          {(["kick", "snare", "hat"] as const).map((row) => (
            <div key={row} className="contents">
              <span className="text-[9px] font-mono uppercase text-muted-foreground">{row === "kick" ? "bombo" : row === "snare" ? "caja" : "hi-hat"}</span>
              <div className="grid grid-cols-[repeat(16,minmax(0,1fr))] gap-[2px]">
                {pat[row].map((on, i) => (
                  <button key={i} onClick={() => toggleDrum(row, i)}
                    className={cn("h-4 rounded-[2px] border transition-colors", i % 4 === 0 ? "border-cyan-hud/50" : "border-cyan-hud/20",
                      on ? "bg-cyan-hud" : "bg-secondary/60 hover:bg-secondary")} aria-label={`${row} paso ${i + 1}`} />
                ))}
              </div>
            </div>
          ))}
          {(["bass", "lead"] as const).map((row) => (
            <div key={row} className="contents">
              <span className="text-[9px] font-mono uppercase text-muted-foreground">{row === "bass" ? "bajo" : "melodía"}</span>
              <div className="grid grid-cols-[repeat(16,minmax(0,1fr))] gap-[2px]">
                {pat[row].map((v, i) => (
                  <button key={i} onClick={() => cycleNote(row, i)}
                    className={cn("h-4 rounded-[2px] border text-[7px] font-mono flex items-center justify-center", i % 4 === 0 ? "border-amber-hud/50" : "border-amber-hud/20",
                      v >= 0 ? "bg-amber-hud text-black font-bold" : "bg-secondary/60 text-muted-foreground hover:bg-secondary")}
                    aria-label={`${row} paso ${i + 1}`}>
                    {noteLabel(v)}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-1.5">
          <label className="block">
            <span className="text-[9px] font-mono uppercase text-muted-foreground">BPM: {pat.bpm}</span>
            <input type="range" min={50} max={140} value={pat.bpm} onChange={(e) => set({ bpm: parseInt(e.target.value, 10) })} className="w-full accent-cyan-hud" />
          </label>
          <div className="flex gap-2">
            <label className="flex-1">
              <span className="text-[9px] font-mono uppercase text-muted-foreground">Onda melodía</span>
              <select value={pat.wave} onChange={(e) => set({ wave: e.target.value as OscillatorType })} className="w-full bg-secondary border border-cyan-hud/30 rounded-sm px-1 py-1 text-[10px]">
                <option value="sawtooth">Sierra (épica)</option>
                <option value="square">Cuadrada (chiptune)</option>
                <option value="sine">Senoidal (melancólica)</option>
                <option value="triangle">Triangular (suave)</option>
              </select>
            </label>
            <label className="flex-1">
              <span className="text-[9px] font-mono uppercase text-muted-foreground">Tonalidad</span>
              <select value={pat.root} onChange={(e) => set({ root: parseInt(e.target.value, 10) })} className="w-full bg-secondary border border-cyan-hud/30 rounded-sm px-1 py-1 text-[10px]">
                <option value="82">Grave (Sol2)</option>
                <option value="98">Media (Sol2+)</option>
                <option value="110">Estándar (La2)</option>
                <option value="123">Aguda (Si2)</option>
              </select>
            </label>
          </div>
        </div>
        <div className="flex gap-1.5">
          {playing ? (
            <button onClick={stop} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-hud/30 border border-red-hud text-red-hud rounded-sm text-[11px] font-mono uppercase font-bold">
              <Square className="w-3.5 h-3.5" /> Detener
            </button>
          ) : (
            <button onClick={play} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-cyan-hud/30 border border-cyan-hud text-cyan-hud rounded-sm text-[11px] font-mono uppercase font-bold">
              <Play className="w-3.5 h-3.5" /> Escuchar
            </button>
          )}
        </div>
        <div className="flex gap-1.5">
          <input value={trackName} onChange={(e) => setTrackName(e.target.value)} maxLength={60}
            placeholder="Título de tu pista (Marcha del Frente Este…)"
            className="flex-1 min-w-0 bg-secondary border border-cyan-hud/30 rounded-sm px-2 py-1.5 text-[11px]" />
          <button onClick={() => void renderAndPublish()} disabled={!trackName.trim() || rendering}
            className="px-3 flex items-center gap-1.5 bg-cyan-hud/40 border border-cyan-hud text-cyan-hud rounded-sm text-[10px] font-mono uppercase font-bold disabled:opacity-40">
            {rendering ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
            Render
          </button>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-mono uppercase text-cyan-hud flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" /> Música hecha por los jugadores — escucha y califica
          </h3>
          <button onClick={() => void feed.reload()} className="text-[9px] font-mono uppercase text-muted-foreground hover:text-amber">actualizar</button>
        </div>
        {feed.loading && <div className="text-[10px] font-mono text-muted-foreground">cargando pistas…</div>}
        {!feed.loading && feed.items.length === 0 && (
          <div className="hud-panel p-4 text-center text-[11px] text-muted-foreground">Aún no hay composiciones — arma la primera marcha.</div>
        )}
        <div className="grid md:grid-cols-2 gap-2">
          {feed.items.map((it) => (
            <UgcCard key={it.id} item={it} myVote={feed.myLikes.has(it.id)}
              onLike={feed.toggleLike} onRate={feed.rate} onReport={feed.report} onDelete={feed.remove} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ============ ESTUDIO DE STICKERS ============
function StickersStudio() {
  const alias = useGameStore((s) => s.alias);
  const feed = useUgcFeed("sticker");
  const [title, setTitle] = useState("");
  const [photos, setPhotos] = useState<UgcPhoto[]>([]);
  const [busy, setBusy] = useState(false);

  const publish = async () => {
    if (photos.length === 0 || busy) return;
    setBusy(true);
    const ok = await publishUgc({
      kind: "sticker", author: alias || "ANÓNIMO",
      title: title.trim() || "Sticker de la comunidad",
      summary: "Sticker subido por la comunidad", photos, sensitive: false,
    });
    setBusy(false);
    if (ok) {
      setTitle(""); setPhotos([]);
      void feed.reload();
    }
  };

  return (
    <div className="grid lg:grid-cols-[380px_1fr] gap-4">
      <div className="space-y-2.5 hud-panel p-3 border-violet-hud/40">
        <div className="flex items-center gap-2">
          <Sticker className="w-4 h-4 text-violet-hud" />
          <h3 className="text-[12px] font-bold uppercase text-violet-hud tracking-wide">Stickers de la Comunidad</h3>
        </div>
        <p className="text-[10px] text-muted-foreground leading-snug">
          Sube tus stickers geopolíticos (countryballs, caritas, placas). Se muestran en la galería social y el agente IA
          filtra lo inapropiado al instante. Las imágenes se comprimen solas — no te preocupes del peso.
        </p>
        <PhotoUploader photos={photos} onChange={setPhotos} max={3} />
        <div className="flex gap-1.5">
          <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={60}
            placeholder="Nombre del sticker (Krai Feliz…)"
            className="flex-1 min-w-0 bg-secondary border border-violet-hud/30 rounded-sm px-2 py-1.5 text-[11px]" />
          <button onClick={() => void publish()} disabled={photos.length === 0 || busy}
            className="px-3 bg-violet-hud/40 border border-violet-hud text-violet-hud rounded-sm text-[10px] font-mono uppercase font-bold disabled:opacity-40">
            {busy ? "…" : "Subir"}
          </button>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-mono uppercase text-cyan-hud flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" /> Paquete comunitario ({feed.items.length})
          </h3>
          <button onClick={() => void feed.reload()} className="text-[9px] font-mono uppercase text-muted-foreground hover:text-amber">actualizar</button>
        </div>
        {feed.loading && <div className="text-[10px] font-mono text-muted-foreground">cargando stickers…</div>}
        {!feed.loading && feed.items.length === 0 && (
          <div className="hud-panel p-4 text-center text-[11px] text-muted-foreground">El paquete está vacío — sube el primer sticker.</div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {feed.items.map((it) => (
            <UgcCard key={it.id} item={it} myVote={feed.myLikes.has(it.id)}
              onLike={feed.toggleLike} onReport={feed.report} onDelete={feed.remove} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ============ COMUNIDAD: posts con fotos + comentarios ============
function ComunidadStudio() {
  const alias = useGameStore((s) => s.alias);
  const feed = useUgcFeed("post");
  const [text, setText] = useState("");
  const [photos, setPhotos] = useState<UgcPhoto[]>([]);
  const [sensitive, setSensitive] = useState(false);
  const [busy, setBusy] = useState(false);

  const publish = async () => {
    if ((!text.trim() && photos.length === 0) || busy) return;
    setBusy(true);
    const ok = await publishUgc({
      kind: "post", author: alias || "ANÓNIMO",
      title: text.trim().slice(0, 60) || "Post con fotos",
      summary: text.trim().slice(0, 180),
      body: text.trim(), photos, sensitive,
    });
    setBusy(false);
    if (ok) {
      setText(""); setPhotos([]); setSensitive(false);
      void feed.reload();
    }
  };

  return (
    <div className="grid lg:grid-cols-[380px_1fr] gap-4">
      <div className="space-y-2.5 hud-panel p-3 border-cyan-hud/40">
        <div className="flex items-center gap-2">
          <MessagesSquare className="w-4 h-4 text-cyan-hud" />
          <h3 className="text-[12px] font-bold uppercase text-cyan-hud tracking-wide">Publica en la Comunidad</h3>
        </div>
        <p className="text-[10px] text-muted-foreground leading-snug">
          Di lo que ves en el mundo con fotos y videos de tu entorno. Todo lo que los jugadores ven lo pueden subir:
          posts con imágenes, comentarios en cualquier contenido y reportes al agente IA para eliminar lo inapropiado.
        </p>
        <textarea value={text} onChange={(e) => setText(e.target.value)} maxLength={600} rows={4}
          placeholder="¿Qué está pasando en tu zona? Cuéntalo con fotos…"
          className="w-full bg-secondary border border-cyan-hud/30 rounded-sm px-2 py-1.5 text-[11px] leading-snug" />
        <PhotoUploader photos={photos} onChange={setPhotos} max={6} />
        <label className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
          <input type="checkbox" checked={sensitive} onChange={(e) => setSensitive(e.target.checked)} className="accent-red-hud" />
          Marcar 18+ (se pedirá confirmación para verlo)
        </label>
        <button onClick={() => void publish()} disabled={(!text.trim() && photos.length === 0) || busy}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-cyan-hud/40 border border-cyan-hud text-cyan-hud rounded-sm text-[11px] font-mono uppercase font-bold disabled:opacity-40 transition-colors">
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          Publicar post (+30 monedas)
        </button>
        <div className="border-t border-amber-hud/20 pt-2 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-green-hud shrink-0 mt-0.5" />
          <p className="text-[9px] text-muted-foreground leading-snug">
            AGENTE IA ACTIVO 24/7: cada post, comentario, foto y sticker pasa por el agente moderador. Si detecta
            contenido inapropiado, lo elimina solo y le informa el motivo al autor.
          </p>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-mono uppercase text-cyan-hud flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" /> Muro de la comunidad — comenta todo
          </h3>
          <button onClick={() => void feed.reload()} className="text-[9px] font-mono uppercase text-muted-foreground hover:text-amber">actualizar</button>
        </div>
        {feed.loading && <div className="text-[10px] font-mono text-muted-foreground">cargando muro…</div>}
        {!feed.loading && feed.items.length === 0 && (
          <div className="hud-panel p-4 text-center text-[11px] text-muted-foreground">El muro está limpio — publica el primer post.</div>
        )}
        <div className="space-y-2 max-w-2xl">
          {feed.items.map((it) => (
            <UgcCard key={it.id} item={it} myVote={feed.myLikes.has(it.id)}
              onLike={feed.toggleLike} onReport={feed.report} onDelete={feed.remove} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ============ PANEL PRINCIPAL ============
const STUDIO_TABS: { id: StudioTab; label: string }[] = [
  { id: "noticias", label: "Noticias" },
  { id: "banderas", label: "Banderas" },
  { id: "mapas", label: "Mapas" },
  { id: "musica", label: "Música" },
  { id: "stickers", label: "Stickers" },
  { id: "comunidad", label: "Comunidad" },
];

export function StudiosPanel() {
  const [tab, setTab] = useState<StudioTab>("noticias");

  return (
    <div className="space-y-4">
      <PanelHeader
        title="ESTUDIOS CREADORES"
        subtitle="Un estudio completo para cada sección: noticias, banderas, mapas, música, stickers y comunidad — todo lo sube la gente y el agente IA lo modera"
        icon={<Wand2 className="w-5 h-5" />}
        color="violet"
      />
      <div className="flex gap-1 flex-wrap">
        {STUDIO_TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn("px-2.5 py-1.5 text-[10px] font-mono uppercase border rounded-sm transition-colors flex items-center gap-1.5",
              tab === t.id ? "border-amber-hud text-amber bg-amber-hud/20 font-bold" : "border-amber-hud/25 text-muted-foreground hover:border-amber-hud/60")}>
            <span>{KIND_META[t.id]?.emoji}</span>
            {t.label}
          </button>
        ))}
      </div>
      {tab === "noticias" && <NoticiasStudio />}
      {tab === "banderas" && <BanderasStudio />}
      {tab === "mapas" && <MapasStudio />}
      {tab === "musica" && <MusicaStudio />}
      {tab === "stickers" && <StickersStudio />}
      {tab === "comunidad" && <ComunidadStudio />}
    </div>
  );
}
