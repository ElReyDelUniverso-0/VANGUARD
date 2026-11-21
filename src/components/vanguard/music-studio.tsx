"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { Globe2, Music2, Upload, Play, Volume2, Radio, Search, Disc3 } from "lucide-react";
import { MUSICA_REAL, type CategoriaMusica } from "@/lib/musica/catalogo";

type Mode = "catalog" | "mine" | "world";
type Station = { id: string; name: string; country: string; language: string; codec: string; bitrate: number; url: string; homepage: string; tags: string };
type Country = { name: string; iso_3166_1: string; stationcount: number };
type Item = { id: string; name: string; by: string; url: string; note: string; category: string; source?: string; local?: boolean };

const CATEGORIES: { id: CategoriaMusica; title: string; hint: string }[] = [
  { id: "marcha", title: "Guerra y marcha", hint: "bandas, fanfarrias y marchas" },
  { id: "orquesta", title: "Cine y orquesta", hint: "melodía para leer y explorar" },
  { id: "voz", title: "Voces", hint: "grabaciones históricas" },
  { id: "ambiente", title: "Ambiente", hint: "paisajes sonoros tranquilos" },
];
const TAGS = ["Todas", "Noticias", "Música", "Clásica", "Jazz", "Rock", "World"] as const;
const TAG_QUERY: Record<string, string> = { Noticias: "news", Música: "music", Clásica: "classical", Jazz: "jazz", Rock: "rock", World: "world" };
const subscribeAutoNext = (cb: () => void) => {
  window.addEventListener("vanguard:music-auto", cb);
  window.addEventListener("storage", cb);
  return () => { window.removeEventListener("vanguard:music-auto", cb); window.removeEventListener("storage", cb); };
};
const readAutoNext = () => { try { return localStorage.getItem("vg-music-auto-next") !== "false"; } catch { return true; } };

export function MusicStudio() {
  const audio = useRef<HTMLAudioElement>(null);
  const localUrls = useRef<string[]>([]);
  const queueRef = useRef<Item[]>([]);
  const [mode, setMode] = useState<Mode>("catalog");
  const [category, setCategory] = useState<CategoriaMusica>("marcha");
  const [current, setCurrent] = useState<Item | null>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.72);
  const autoNext = useSyncExternalStore(subscribeAutoNext, readAutoNext, () => true);
  const [localTracks, setLocalTracks] = useState<Item[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [country, setCountry] = useState("DO");
  const [stations, setStations] = useState<Station[]>([]);
  const [tag, setTag] = useState("Todas");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    fetch("/api/radio-global?kind=countries", { cache: "force-cache" })
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((data: Country[]) => {
        setCountries(data);
        if (!data.some((x) => x.iso_3166_1 === "DO")) setCountry("US");
      })
      .catch(() => setError("No se pudo cargar la lista mundial ahora mismo."));
    return () => { for (const u of localUrls.current) URL.revokeObjectURL(u); };
  }, []);

  useEffect(() => {
    if (mode !== "world" || !country) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setBusy(true); setError("");
      const p = new URLSearchParams({ country });
      const tagValue = TAG_QUERY[tag];
      if (tagValue) p.set("tag", tagValue);
      if (query.trim()) p.set("q", query.trim());
      fetch(`/api/radio-global?${p}`, { signal: controller.signal })
        .then((r) => r.ok ? r.json() : r.json().then((j) => Promise.reject(new Error(j.error))))
        .then((data: Station[]) => setStations(data))
        .catch((e: unknown) => { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : "Falló la búsqueda de emisoras."); })
        .finally(() => { if (!controller.signal.aborted) setBusy(false); });
    }, 280);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [mode, country, tag, query]);

  const catalog = useMemo(() => MUSICA_REAL.filter((x) => x.categoria === category).map((x): Item => ({
    id: x.id, name: x.nombre, by: x.autor, url: x.url, note: `${x.licencia} · ${x.descripcion}`, category: x.categoria, source: x.fuente,
  })), [category]);

  const startItem = useCallback((item: Item, list: Item[], index: number) => {
    const el = audio.current;
    if (!el) return;
    queueRef.current = list;
    el.pause();
    el.src = item.url;
    el.volume = volume;
    el.load();
    setCurrent(item);
    setError(""); setNotice(""); setMode(item.category === "radio" ? "world" : item.local ? "mine" : "catalog");
    void el.play().then(() => setPlaying(true)).catch(() => {
      setPlaying(false);
      setNotice("El navegador o la emisora bloqueó el inicio. Pulsa reproducir en el control de audio.");
    });
    el.dataset.queueIndex = String(index);
  }, [volume]);

  const next = useCallback(() => {
    const el = audio.current;
    const q = queueRef.current;
    if (!autoNext || !el || q.length < 2) { setPlaying(false); return; }
    const idx = Number(el.dataset.queueIndex ?? "0");
    const nextIndex = (idx + 1) % q.length;
    startItem(q[nextIndex], q, nextIndex);
  }, [autoNext, startItem]);

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const added = Array.from(files).filter((f) => f.type.startsWith("audio/"));
    if (!added.length) { setNotice("Elige archivos de audio (MP3, M4A, WAV, OGG o FLAC). No se envían al servidor."); return; }
    const items = added.map((f, i): Item => {
      const url = URL.createObjectURL(f); localUrls.current.push(url);
      return { id: `local-${Date.now()}-${i}`, name: f.name.replace(/\.[^.]+$/, ""), by: "Tu dispositivo", url, note: "Archivo local: privado, no se sube a Vanguard.", category: "local", local: true };
    });
    setLocalTracks((prev) => [...prev, ...items]);
    setNotice(`${items.length} pista${items.length === 1 ? "" : "s"} añadida${items.length === 1 ? "" : "s"}. Al cerrar la página tendrás que seleccionarla otra vez.`);
  };

  const playList = (list: Item[], index: number) => startItem(list[index], list, index);
  const stop = () => { audio.current?.pause(); setPlaying(false); };
  const setAuto = (value: boolean) => {
    try { localStorage.setItem("vg-music-auto-next", String(value)); } catch { /* optional */ }
    window.dispatchEvent(new Event("vanguard:music-auto"));
  };
  const playStation = (s: Station, list: Station[], index: number) => {
    const item: Item = { id: s.id, name: s.name, by: `${s.country}${s.language ? ` · ${s.language}` : ""}`, url: s.url, note: `${s.codec || "audio"}${s.bitrate ? ` · ${s.bitrate} kbps` : ""}${s.tags ? ` · ${s.tags}` : ""}`, category: "radio", source: s.homepage };
    playList(list.map((x): Item => ({ id: x.id, name: x.name, by: x.country, url: x.url, note: x.tags, category: "radio", source: x.homepage })), index);
    setCurrent(item);
  };

  const modeButton = (id: Mode, label: string, icon: ReactNode) => (
    <button key={id} type="button" onClick={() => { setMode(id); setError(""); }} aria-pressed={mode === id}
      className={`inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 text-sm font-semibold transition ${mode === id ? "border-amber-300/50 bg-amber-200/10 text-amber-100" : "border-white/10 bg-white/[.03] text-zinc-400 hover:border-white/25 hover:text-white"}`}>
      {icon}{label}
    </button>
  );

  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#0a0b10] text-zinc-100 shadow-[0_24px_90px_rgba(0,0,0,.35)]">
      <header className="border-b border-white/10 bg-[radial-gradient(ellipse_at_85%_0%,rgba(217,160,74,.16),transparent_45%),linear-gradient(120deg,#11131a,#090a0e)] px-5 py-7 sm:px-8">
        <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.24em] text-amber-200/70"><Disc3 size={15}/> VANGUARD · SONIDO A TU MANERA</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Elige qué quieres escuchar.</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">Música real, emisoras de cualquier país y tus propios archivos. Sin melodías sintéticas que se estiren o se deformen.</p>
      </header>
      <div className="space-y-6 p-4 sm:p-7">
        <div className="flex flex-wrap gap-2">
          {modeButton("catalog", "Catálogo", <Music2 size={16}/>)}
          {modeButton("mine", "Mi música", <Upload size={16}/>)}
          {modeButton("world", "Radios del mundo", <Globe2 size={16}/>)}
        </div>

        <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/[.025] p-4 sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[.2em] text-amber-200/60">EN REPRODUCCIÓN</p>
            <p className="mt-1 truncate text-base font-semibold">{current?.name ?? "Nada sonando todavía"}</p>
            <p className="truncate text-xs text-zinc-500">{current?.by ?? "Escoge una pista o una emisora"}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-zinc-400" title="Continuar automáticamente al terminar">
              <input type="checkbox" checked={autoNext} onChange={(e) => setAuto(e.target.checked)} className="accent-amber-300"/> Continuar
            </label>
            <label className="flex items-center gap-2 text-zinc-400" aria-label="Volumen"><Volume2 size={15}/><input type="range" min="0" max="1" step=".02" value={volume} onChange={(e) => { const v = Number(e.target.value); setVolume(v); if (audio.current) audio.current.volume = v; }} className="w-24 accent-amber-300"/></label>
          </div>
          <audio ref={audio} controls preload="none" className="h-11 w-full sm:col-span-2" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={next} onError={() => { if (current) setNotice(`No conectó con «${current.name}». Prueba otra emisora o pista.`); setPlaying(false); }}/>
          {notice && <p role="status" className="text-xs text-amber-200 sm:col-span-2">{notice}</p>}
          {current?.source && <a href={current.source} target="_blank" rel="noreferrer" className="text-xs text-zinc-500 underline decoration-white/20 underline-offset-4 hover:text-zinc-200 sm:col-span-2">Ver fuente de esta grabación/emisora ↗</a>}
        </div>

        {mode === "catalog" && <div className="space-y-4">
          <p className="text-sm text-zinc-400">Toca una familia; luego una pista. «Continuar» viene activado para que la selección siga sola después del primer toque.</p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{CATEGORIES.map((c) => <button key={c.id} onClick={() => setCategory(c.id)} aria-pressed={category === c.id} className={`rounded-xl border p-3 text-left ${category === c.id ? "border-amber-200/40 bg-amber-200/[.07]" : "border-white/10 bg-white/[.02] hover:bg-white/[.05]"}`}><span className="block text-sm font-semibold">{c.title}</span><span className="mt-1 block text-xs text-zinc-500">{c.hint}</span></button>)}</div>
          <div className="grid gap-2 md:grid-cols-2">{catalog.map((p, i) => <article key={p.id} className={`rounded-xl border p-4 ${current?.id === p.id ? "border-amber-200/40 bg-amber-200/[.06]" : "border-white/10 bg-black/20"}`}><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="truncate text-sm font-semibold">{p.name}</h3><p className="mt-1 text-xs text-zinc-500">{p.by}</p></div><button onClick={() => playList(catalog, i)} className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg bg-amber-200 px-3 text-xs font-bold text-zinc-950 hover:bg-amber-100"><Play size={14}/> Escuchar</button></div><p className="mt-2 text-xs leading-5 text-zinc-500">{p.note}</p></article>)}</div>
          <p className="text-[11px] leading-5 text-zinc-600">Grabaciones de dominio público/CC0 de archivo; la ficha y licencia se abren desde la fuente. Las listas automáticas se encadenan solo tras pulsar reproducir, por las reglas de sonido del navegador.</p>
        </div>}

        {mode === "mine" && <div className="space-y-4">
          <div className="rounded-2xl border border-dashed border-amber-200/30 bg-amber-100/[.03] p-5"><label className="flex cursor-pointer flex-col items-center gap-2 text-center"><Upload className="text-amber-200"/><span className="font-semibold">Añade tus canciones desde este dispositivo</span><span className="text-xs text-zinc-500">MP3, M4A, WAV, OGG, FLAC · selección múltiple · no se suben a Vanguard</span><input type="file" accept="audio/*,.mp3,.m4a,.wav,.ogg,.flac" multiple className="sr-only" onChange={(e) => { addFiles(e.target.files); e.currentTarget.value = ""; }}/></label></div>
          {localTracks.length === 0 ? <p className="text-center text-sm text-zinc-500">Todavía no añadiste archivos. Tu música permanece privada en el aparato.</p> : <div className="grid gap-2 sm:grid-cols-2">{localTracks.map((t, i) => <div key={t.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 p-3"><div className="min-w-0"><p className="truncate text-sm font-medium">{t.name}</p><p className="text-xs text-zinc-500">Solo en este dispositivo</p></div><button onClick={() => playList(localTracks, i)} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/15 px-3 text-xs hover:bg-white/10"><Play size={14}/> Tocar</button></div>)}</div>}
        </div>}

        {mode === "world" && <div className="space-y-4">
          <p className="text-sm text-zinc-400">Busca emisoras en el directorio global, filtra por país y tipo. Son radios reales; el nombre, país, idioma y género vienen del directorio.</p>
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(220px,1fr)]">
            <label className="relative"><span className="sr-only">Buscar emisora</span><Search size={16} className="absolute left-3 top-3 text-zinc-500"/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar emisora…" className="h-11 w-full rounded-xl border border-white/10 bg-black/30 pl-10 pr-3 text-sm outline-none focus:border-amber-200/50"/></label>
            <label><span className="sr-only">País</span><select value={country} onChange={(e) => setCountry(e.target.value)} className="h-11 w-full rounded-xl border border-white/10 bg-[#101116] px-3 text-sm text-zinc-100">{countries.map((c) => <option key={c.iso_3166_1} value={c.iso_3166_1}>{c.name} · {c.stationcount.toLocaleString()} emisoras</option>)}</select></label>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">{TAGS.map((x) => <button key={x} onClick={() => setTag(x)} aria-pressed={tag === x} className={`min-h-9 shrink-0 rounded-full border px-3 text-xs ${tag === x ? "border-amber-200/40 bg-amber-200/10 text-amber-100" : "border-white/10 text-zinc-500 hover:text-white"}`}>{x}</button>)}</div>
          {busy && <p className="text-xs text-zinc-500">Buscando emisoras verificadas por el directorio…</p>}
          {error && <p role="alert" className="rounded-xl border border-red-400/20 bg-red-400/5 p-3 text-sm text-red-200">{error}</p>}
          {!busy && !error && stations.length === 0 && <p className="rounded-xl border border-white/10 p-4 text-sm text-zinc-500">No hay coincidencias con esos filtros. Prueba «Todas» o cambia de país.</p>}
          <div className="grid gap-2 md:grid-cols-2">{stations.map((s, i) => <article key={s.id} className={`rounded-xl border p-4 ${current?.id === s.id ? "border-emerald-200/40 bg-emerald-200/[.04]" : "border-white/10 bg-black/20"}`}><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="truncate text-sm font-semibold">{s.name}</h3><p className="mt-1 truncate text-xs text-zinc-500">{[s.country, s.language, s.codec, s.bitrate ? `${s.bitrate} kbps` : ""].filter(Boolean).join(" · ")}</p><p className="mt-2 line-clamp-2 text-xs text-zinc-600">{s.tags || "Emisora de radio"}</p></div><button onClick={() => playStation(s, stations, i)} className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg border border-emerald-200/30 px-3 text-xs text-emerald-100 hover:bg-emerald-100/10"><Radio size={14}/> Sintonizar</button></div></article>)}</div>
          <p className="text-[11px] leading-5 text-zinc-600">Las emisoras proceden de Radio Browser. La disponibilidad del stream depende de cada radio; si una falla, elige otra. No activamos audio al abrir la página: primero hace falta un toque tuyo.</p>
        </div>}
      </div>
    </section>
  );
}
