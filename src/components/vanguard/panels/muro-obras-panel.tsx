"use client";

// Vanguard v104.0 LA VITRINA — MURO DE OBRAS DE LA COMUNIDAD.
// El comandante pidió: "mejora la obra de la comunidad". Este panel es la
// vitrina unificada de TODO lo que la gente crea dentro de Vanguard —
// juegos, escenarios ¿Y SI...?, encuestas, música, periódicos, posts,
// noticias, banderas, mapas, personajes, armas, stickers y videos — con
// tres mejoras estructurales sobre el pilar 3:
//   1) PASEO DE LA FAMA: podio de creadores computado de acciones reales
//      (me gusta ×3 + jugadas ×2 + obras ×5 — fórmula explicable).
//   2) SEÑALES EN TUS OBRAS: cuando alguien da me gusta o comenta tu obra,
//      la vitrina te lo cuenta al volver (snapshot honesto en localStorage).
//   3) EL AGENTE EVALÚA: MENTE·VANGUARD lee la obra y publica su crítica
//      firmada — 1 fortaleza concreta + 1 mejora accionable + veredicto.
// Cada obra se JUEGA, se SIMULA, se REMEZCLA (Taller o Laboratorio), se
// COMPARTE, se COMENTA y se REPORTA. Feed unificado tipo muro con filtros
// por tipo y 4 órdenes (recientes / me gusta / jugadas / valoradas).

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid, Crown, Bell, Gamepad2, FlaskConical, Music2, Newspaper, Vote,
  MessageSquare, Heart, Share2, Flag, Bot, Send, Clock, Play, ChevronDown,
  GitBranch, Star, Users, FileText, Video, Map as MapIcon, Palette, Sticker,
  Sparkles, Swords, PersonStanding, Wrench,
} from "lucide-react";
import { HeroOro } from "@/components/vanguard/hero-oro";
import { useSala3DContenido, type FilaContenido3D } from "@/components/vanguard/use-sala3d-contenido";
import { useGameStore } from "@/lib/game-store";
import { useAnalista } from "@/lib/analista";
import { toast } from "sonner";
import { navigateTo } from "@/lib/nav";
import { simular, escenarioPorId, PERTURBACIONES, NIVELES_ESCALADA, type ConfigLab, type ResultadoLab } from "@/lib/whatif";
import { GameRuntime } from "@/components/vanguard/game-runtime";
import { Countryball } from "@/components/vanguard/countryball";
import { useT } from "@/lib/i18n";
import type { JuegoDef, MotorJuego } from "@/lib/juegos";

interface UgcRow {
  id: string;
  kind: string;
  author: string;
  authorBall: string;
  title: string;
  summary: string;
  body: string;
  photos: string;
  specs: string;
  country: string;
  gameUrl: string;
  gameHtml: string;
  audioData: string;
  audioGenre: string;
  pollOptions: string;
  videoUrl: string;
  plays: number;
  likes: number;
  ratingSum: number;
  ratingCount: number;
  createdAt: string;
}

interface Comentario { id: string; author: string; authorBall: string; text: string; createdAt: string }

interface CreadorFama { author: string; obras: number; likes: number; plays: number; fama: number }

interface SpecsEsc {
  crisisId: string; crisis: string; perturbacion: string; dosis: number;
  horizonte: number; final: string; diaFin: number; ganador: string;
  mc?: { nombre: string; probabilidad: number }[]; frente?: number;
}

// ---- helpers ----
const KEY_SEN = "vg-vitrina-senales-v104";

const KIND_META: Record<string, { icon: React.ReactNode; label: string }> = {
  juego: { icon: <Gamepad2 className="h-3 w-3" />, label: "JUEGO" },
  escenario: { icon: <FlaskConical className="h-3 w-3" />, label: "ESCENARIO" },
  encuesta: { icon: <Vote className="h-3 w-3" />, label: "ENCUESTA" },
  musica: { icon: <Music2 className="h-3 w-3" />, label: "MÚSICA" },
  periodico: { icon: <Newspaper className="h-3 w-3" />, label: "PERIÓDICO" },
  noticia: { icon: <FileText className="h-3 w-3" />, label: "NOTICIA" },
  post: { icon: <MessageSquare className="h-3 w-3" />, label: "POST" },
  bandera: { icon: <Sparkles className="h-3 w-3" />, label: "BANDERA" },
  mapa: { icon: <MapIcon className="h-3 w-3" />, label: "MAPA" },
  personaje: { icon: <PersonStanding className="h-3 w-3" />, label: "PERSONAJE" },
  arma: { icon: <Swords className="h-3 w-3" />, label: "ARMA" },
  sticker: { icon: <Sticker className="h-3 w-3" />, label: "STICKER" },
  video: { icon: <Video className="h-3 w-3" />, label: "VIDEO" },
};
const ORDEN_KINDS = ["juego", "escenario", "encuesta", "musica", "periodico", "noticia", "post", "bandera", "mapa", "personaje", "arma", "sticker", "video"];

function parsePhotos(raw: string): { src: string; credit: string }[] {
  try { const p = JSON.parse(raw); return Array.isArray(p) ? p.filter((x) => x?.src) : []; } catch { return []; }
}
function parsePoll(raw: string): { label: string; votes: number }[] {
  try { const p = JSON.parse(raw); return Array.isArray(p) ? p : []; } catch { return []; }
}
function parseJuegoDef(specs: string): JuegoDef | null {
  try { const d = JSON.parse(specs) as JuegoDef; return d?.engine ? d : null; } catch { return null; }
}
function parseEsc(specs: string): SpecsEsc | null {
  try { const s = JSON.parse(specs) as SpecsEsc; return s?.crisisId && s?.perturbacion ? s : null; } catch { return null; }
}
function parsePeriodico(body: string): { accent?: string; articles?: { t: string; c: string; tone: string }[] } | null {
  try { const p = JSON.parse(body); return p?.articles?.length ? p : null; } catch { return null; }
}
function tiempoRel(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const h = Math.floor(ms / 3600_000);
  if (h < 1) return "ahora";
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}
function esTaller(specs: string): boolean {
  const d = parseJuegoDef(specs);
  return !!d && ["quiz", "ordena", "vof"].includes(d.engine);
}

export function MuroObrasPanel() {
  const { t } = useT();
  const alias = useGameStore((s) => s.alias);
  const account = useGameStore((s) => s.account);
  const miAutor = account?.username || alias || "";

  const [kinds, setKinds] = useState<Record<string, number>>({});
  const [comentariosCount, setComentariosCount] = useState<Record<string, number>>({});
  const [filtro, setFiltro] = useState<string>("todo");
  const [orden, setOrden] = useState<"recent" | "top" | "plays" | "rating">("recent");
  const [items, setItems] = useState<UgcRow[] | null>(null);
  const [fama, setFama] = useState<CreadorFama[] | null>(null);
  const [senales, setSenales] = useState<{ total: number; obras: { id: string; title: string; delta: number }[] } | null>(null);

  const [likesMios, setLikesMios] = useState<Record<string, boolean>>({});
  const [pulsos, setPulsos] = useState<Record<string, boolean>>({});
  const [simulados, setSimulados] = useState<Record<string, ResultadoLab>>({});
  const [jugandoId, setJugandoId] = useState<string | null>(null);
  const [opinando, setOpinando] = useState<string | null>(null);
  const [opinadas, setOpinadas] = useState<Record<string, string>>({}); // id → veredicto
  const [comsAbiertos, setComsAbiertos] = useState<Record<string, Comentario[]>>({});
  const [textoCom, setTextoCom] = useState<Record<string, string>>({});
  const [votadas, setVotadas] = useState<Record<string, { label: string; votes: number }[]>>({});
  const [votosHechos, setVotosHechos] = useState<Record<string, boolean>>({});

  // ---- carga principal ----
  const cargar = useCallback(async (f: string, o: string) => {
    try {
      const kind = f !== "todo" ? `&kind=${f}` : "";
      const res = await fetch(`/api/ugc?sort=${o}${kind}&limit=48`, { cache: "no-store" });
      const data = await res.json();
      setItems(Array.isArray(data.items) ? data.items : []);
      if (data.stats?.kinds) setKinds(data.stats.kinds);
      if (data.comentarios) setComentariosCount(data.comentarios);
    } catch { setItems([]); }
  }, []);

  useEffect(() => {
    // patrón v102: la carga sale del cuerpo sincrónico del efecto (setTimeout 0)
    const id = setTimeout(() => { void cargar(filtro, orden); }, 0);
    return () => clearTimeout(id);
  }, [filtro, orden, cargar]);

  // ---- paseo de la fama ----
  useEffect(() => {
    let vivo = true;
    (async () => {
      try {
        const res = await fetch("/api/creadores/fama?limit=8", { cache: "no-store" });
        const data = await res.json();
        if (vivo) setFama(Array.isArray(data.creadores) ? data.creadores : []);
      } catch { if (vivo) setFama([]); }
    })();
    return () => { vivo = false; };
  }, [items?.length]);

  // ---- señales en tus obras (snapshot honesto localStorage) ----
  useEffect(() => {
    let vivo = true;
    if (!miAutor) {
      (async () => { await Promise.resolve(); if (vivo) setSenales(null); })();
      return () => { vivo = false; };
    }
    (async () => {
      try {
        const res = await fetch(`/api/ugc?mine=1&author=${encodeURIComponent(miAutor)}&limit=80`, { cache: "no-store" });
        const data = await res.json();
        if (!vivo) return;
        const mias: UgcRow[] = Array.isArray(data.items) ? data.items : [];
        const comentarios = (data.comentarios || {}) as Record<string, number>;
        let snap: Record<string, { l: number; c: number }> = {};
        try { snap = JSON.parse(localStorage.getItem(KEY_SEN) || "{}"); } catch { /* noop */ }
        const obras: { id: string; title: string; delta: number }[] = [];
        let total = 0;
        for (const it of mias) {
          const ahora = it.likes + (comentarios[it.id] || 0);
          const antes = snap[it.id];
          if (antes && ahora > antes.l + antes.c) {
            const delta = ahora - (antes.l + antes.c);
            total += delta;
            obras.push({ id: it.id, title: it.title, delta });
          }
        }
        setSenales({ total, obras: obras.slice(0, 3) });
      } catch { if (vivo) setSenales(null); }
    })();
    return () => { vivo = false; };
  }, [miAutor, items?.length]);

  const marcarVistas = () => {
    try {
      const snap: Record<string, { l: number; c: number }> = {};
      for (const it of items || []) {
        if (it.author === miAutor) snap[it.id] = { l: it.likes, c: comentariosCount[it.id] || 0 };
      }
      localStorage.setItem(KEY_SEN, JSON.stringify(snap));
    } catch { /* noop */ }
    setSenales((s) => (s ? { ...s, total: 0 } : s));
    toast(t("obras.vistas"), { duration: 1600, icon: "✓" });
  };

  // ---- acciones ----
  const pedirPasaporte = (motivo: string) => {
    window.dispatchEvent(new CustomEvent("vanguard:pasaporte", { detail: { motivo } }));
  };

  const like = async (it: UgcRow) => {
    const voter = miAutor || "ANÓNIMO";
    try {
      const res = await fetch(`/api/ugc/${it.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "like", voter }),
      });
      const data = await res.json();
      setItems((lst) => (lst ? lst.map((x) => (x.id === it.id ? { ...x, likes: data.likes ?? x.likes } : x)) : lst));
      if (data.liked) {
        setLikesMios((m) => ({ ...m, [it.id]: true }));
        setPulsos((m) => ({ ...m, [it.id]: true }));
        setTimeout(() => setPulsos((m) => ({ ...m, [it.id]: false })), 600);
      } else {
        setLikesMios((m) => ({ ...m, [it.id]: false }));
      }
    } catch { /* noop */ }
  };

  const opinar = async (it: UgcRow) => {
    if (opinando) return;
    setOpinando(it.id);
    try {
      const res = await fetch("/api/agente/opinar", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: it.id }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || t("obras.opinaFallo")); return; }
      if (data.yaEvaluada) {
        toast(t("obras.opinada"), { duration: 2200, icon: "🧠" });
      } else {
        toast(`${t("obras.opinaHecha")} — ${data.veredicto}`, { duration: 2600, icon: "🧠" });
      }
      if (data.comment) {
        setComsAbiertos((m) => ({ ...m, [it.id]: [data.comment, ...(m[it.id] || [])] }));
        setComentariosCount((m) => ({ ...m, [it.id]: (m[it.id] || 0) + (data.yaEvaluada ? 0 : 1) }));
      }
      if (data.veredicto) setOpinadas((m) => ({ ...m, [it.id]: data.veredicto }));
    } catch { toast.error(t("obras.opinaFallo")); }
    setOpinando(null);
  };

  const compartir = async (it: UgcRow) => {
    const texto = `${it.title} — obra de la comunidad en VANGUARD`;
    try {
      if (navigator.share) { await navigator.share({ title: it.title, text: texto }); return; }
      await navigator.clipboard.writeText(texto);
      toast(t("obras.copiado"), { duration: 1500, icon: "⧉" });
    } catch { /* cancelado */ }
  };

  const reportar = async (it: UgcRow) => {
    try {
      const res = await fetch(`/api/ugc/${it.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "report", voter: miAutor || "ANÓNIMO" }),
      });
      const data = await res.json();
      if (data.eliminated) {
        setItems((lst) => (lst ? lst.filter((x) => x.id !== it.id) : lst));
        toast(t("obras.eliminada"), { duration: 2400, icon: "🛡" });
      } else {
        toast(t("obras.reportada"), { duration: 2200, icon: "🛡" });
      }
    } catch { /* noop */ }
  };

  const abrirComs = async (it: UgcRow) => {
    if (comsAbiertos[it.id]) {
      setComsAbiertos((m) => { const n = { ...m }; delete n[it.id]; return n; });
      return;
    }
    try {
      const res = await fetch(`/api/ugc/comments?itemId=${it.id}`);
      const data = await res.json();
      setComsAbiertos((m) => ({ ...m, [it.id]: data.comments || [] }));
    } catch { setComsAbiertos((m) => ({ ...m, [it.id]: [] })); }
  };

  const enviarCom = async (it: UgcRow) => {
    const text = (textoCom[it.id] || "").trim();
    if (text.length < 2) return;
    try {
      const res = await fetch("/api/ugc/comments", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: it.id, author: miAutor || "ANÓNIMO", authorBall: "un", text }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "—"); return; }
      setComsAbiertos((m) => ({ ...m, [it.id]: [data.comment, ...(m[it.id] || [])] }));
      setComentariosCount((m) => ({ ...m, [it.id]: (m[it.id] || 0) + 1 }));
      setTextoCom((m) => ({ ...m, [it.id]: "" }));
      useAnalista.getState().registrar("creacion");
      toast(t("obras.comHecho"), { duration: 1500, icon: "💬" });
    } catch { toast.error("—"); }
  };

  const simularEsc = (it: UgcRow) => {
    const s = parseEsc(it.specs);
    if (!s) return;
    try {
      const cfg: ConfigLab = {
        crisisId: s.crisisId,
        perturbacion: s.perturbacion as ConfigLab["perturbacion"],
        dosis: Math.max(1, Math.min(5, Number(s.dosis) || 3)),
        horizonte: ([90, 180, 240] as const).includes(s.horizonte as 90 | 180 | 240) ? (s.horizonte as 90 | 180 | 240) : 180,
      };
      const r = simular(cfg);
      setSimulados((m) => ({ ...m, [it.id]: r }));
      useAnalista.getState().registrar("lab");
      toast(`${t("escen.reproducido")}: ${r.fin.nombre} (día ${r.fin.dia})`, { duration: 2800, icon: "🎬" });
    } catch { toast.error(t("obras.simFallo")); }
  };

  const remezclarEsc = (it: UgcRow) => {
    const s = parseEsc(it.specs);
    if (!s) return;
    try { sessionStorage.setItem("vg-whatif-remix", JSON.stringify({ ...s, autor: it.author })); } catch { /* noop */ }
    navigateTo("laboratorio" as never);
  };

  const remezclarJuego = (it: UgcRow) => {
    const def = parseJuegoDef(it.specs);
    if (!def) return;
    try {
      sessionStorage.setItem("vg-taller-remix", JSON.stringify({ def, titulo: it.title, resumen: it.summary, autor: it.author }));
    } catch { /* noop */ }
    navigateTo("taller" as never);
  };

  const votarEncuesta = async (it: UgcRow, idx: number) => {
    if (votosHechos[it.id]) return;
    try {
      const res = await fetch(`/api/ugc/${it.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "votePoll", optionIdx: idx, voter: miAutor || "ANÓNIMO" }),
      });
      const data = await res.json();
      if (res.status === 409) { setVotosHechos((m) => ({ ...m, [it.id]: true })); toast(t("obras.yaVotada"), { duration: 1800, icon: "✓" }); return; }
      if (!res.ok) return;
      setVotosHechos((m) => ({ ...m, [it.id]: true }));
      setVotadas((m) => ({ ...m, [it.id]: data.pollOptions || [] }));
      toast(t("obras.votoHecho"), { duration: 1400, icon: "✓" });
    } catch { /* noop */ }
  };

  const jugarGame = (it: UgcRow) => {
    setJugandoId((id) => (id === it.id ? null : it.id));
    if (jugandoId !== it.id) {
      fetch(`/api/ugc/${it.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "play" }),
      }).then((r) => r.json()).then((d) => {
        if (typeof d.plays === "number") setItems((lst) => (lst ? lst.map((x) => (x.id === it.id ? { ...x, plays: d.plays } : x)) : lst));
      }).catch(() => { /* noop */ });
    }
  };

  // ---- memoria derivada ----
  const totalObras = useMemo(() => Object.values(kinds).reduce((a, b) => a + b, 0), [kinds]);
  const podio = fama?.slice(0, 3) ?? [];
  const resto = fama?.slice(3) ?? [];

  // v168: PARIDAD 2D→3D — la sala OBRAS emite la vitrina real: señales en tus
  // obras, podio de la fama, filtros por tipo y las obras del muro.
  const listaFiltros = useMemo(
    () => ["todo", ...ORDEN_KINDS.filter((k) => (kinds[k] || 0) > 0)].slice(0, 5),
    [kinds],
  );
  const filas3D = useMemo<FilaContenido3D[]>(() => {
    const filas: FilaContenido3D[] = [];
    if (!miAutor) {
      filas.push({
        t: "CREA TU PASAPORTE PARA PUBLICAR",
        v: "CUENTA",
        color: "#FFC94D",
        d: "con cuenta puedes publicar obras, recibir señales y subir al podio",
        a: "crear pasaporte",
      });
    } else if (senales && senales.total > 0) {
      filas.push({
        t: `SEÑALES EN TUS OBRAS · ${senales.total}`,
        v: "+NUEVAS",
        color: "#FF6B60",
        d: senales.obras.map((o) => `“${o.title.slice(0, 26)}” +${o.delta}`).join(" · ") || "me gusta y comentarios nuevos en tus obras",
        a: "marcar vistas",
      });
    } else {
      filas.push({
        t: "SEÑALES EN TUS OBRAS",
        v: "AL DÍA",
        color: "#7AB8FF",
        d: "cuando alguien dé me gusta o comente tu obra, la vitrina te lo contará al volver",
      });
    }
    const coloresPodio = ["#FFC94D", "#C9D1E8", "#E0A458"];
    for (const [i, c] of podio.entries()) {
      filas.push({
        t: `${i + 1} · ${c.author}`,
        v: `${c.fama} FAMA`,
        p: Math.min(100, Math.round((c.fama / Math.max(1, podio[0]?.fama ?? 1)) * 100)),
        color: coloresPodio[i],
        d: `${c.obras} obras · ${c.likes} me gusta · ${c.plays} jugadas · fama = me gusta ×3 + jugadas ×2 + obras ×5`,
      });
    }
    for (const k of listaFiltros) {
      filas.push({
        t: k === "todo" ? "TODO EL MURO" : KIND_META[k]?.label ?? k,
        v: k === "todo" ? String(totalObras) : String(kinds[k] ?? 0),
        color: filtro === k ? "#FFC94D" : "#7AB8FF",
        d: k === "todo" ? "todas las obras de la comunidad sin filtrar" : "filtra el muro por este tipo de obra",
        a: "filtrar tipo",
      });
    }
    for (const it of (items ?? []).slice(0, 3)) {
      filas.push({
        t: it.title,
        v: KIND_META[it.kind]?.label ?? it.kind,
        img: parsePhotos(it.photos)[0]?.src,
        color: "#FFC94D",
        d: `${it.author} · ${tiempoRel(it.createdAt)} · ${it.likes} me gusta · ${it.plays} jugadas${it.summary ? ` · ${it.summary.slice(0, 60)}` : ""}`.trim(),
        a: it.kind === "juego" && parseJuegoDef(it.specs) ? "jugar obra" : "me gusta",
      });
    }
    return filas;
  }, [miAutor, senales, podio, listaFiltros, kinds, totalObras, filtro, items]);
  // v168: el raycast 3D ejecuta las MISMAS acciones del muro 2D.
  // offsets: señales 0 · podio 1-3 · filtros siguientes · obras al final.
  useEffect(() => {
    const onAccion = (e: Event) => {
      const det = (e as CustomEvent<{ tab: string; accion: string; idx: number }>).detail;
      if (det?.tab !== "obras") return;
      if (det.accion === "crear pasaporte") {
        pedirPasaporte(t("obras.pideCuentaMotivo"));
        return;
      }
      if (det.accion === "marcar vistas") {
        marcarVistas();
        return;
      }
      if (det.accion === "filtrar tipo") {
        const k = listaFiltros[det.idx - 1 - Math.min(podio.length, 3)];
        if (k) setFiltro(k);
        return;
      }
      const offsetObras = 1 + Math.min(podio.length, 3) + listaFiltros.length;
      const it = (items ?? []).slice(0, 3)[det.idx - offsetObras];
      if (!it) return;
      if (det.accion === "me gusta") void like(it);
      else if (det.accion === "jugar obra") jugarGame(it);
    };
    window.addEventListener("vg:sala3d-accion", onAccion);
    return () => window.removeEventListener("vg:sala3d-accion", onAccion);
  }, [items, podio, listaFiltros, miAutor, senales, jugandoId]);
  useSala3DContenido(
    "obras",
    "MURO DE OBRAS",
    "#FFC94D",
    `La vitrina de la comunidad · ${totalObras} obras en el muro${senales?.total ? ` · ${senales.total} señales nuevas` : ""}`,
    filas3D,
  );

  // ================= RENDER =================
  return (
    <div className="mx-auto max-w-6xl px-3 pb-24 pt-2 sm:px-4">
      <HeroOro panel="obras" />

      {/* ---- PASEO DE LA FAMA ---- */}
      <motion.section
        className="v104-panel mt-3 rounded-2xl border border-[#FFC94D]/25 bg-[#FFC94D]/4 p-3"
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-2">
          <Crown className="h-4 w-4 text-[#FFC94D]" />
          <span className="text-[11px] font-black uppercase tracking-widest text-[#FFC94D]">{t("obras.famaTitulo")}</span>
          <span className="ml-auto hidden text-[9px] font-semibold text-white/35 sm:block">{t("obras.famaSub")}</span>
        </div>
        {fama && fama.length === 0 && (
          <p className="mt-2 text-[10px] text-white/40">{t("obras.famaVacia")}</p>
        )}
        {podio.length > 0 && (
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {podio.map((c, i) => {
              const colores = ["#FFC94D", "#C9D1E8", "#E0A458"];
              return (
                <motion.div
                  key={c.author}
                  className={`v104-podio relative overflow-hidden rounded-xl border p-2.5 ${i === 0 ? "sm:order-first" : ""}`}
                  style={{ borderColor: `${colores[i]}55`, background: `${colores[i]}0d` }}
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.08 * i, duration: 0.35 }}
                >
                  <div className="flex items-center gap-2">
                    <span className="v104-rango flex h-6 w-6 items-center justify-center rounded-lg text-[11px] font-black" style={{ color: colores[i], border: `1px solid ${colores[i]}66` }}>
                      {i + 1}
                    </span>
                    <span className="truncate text-[11px] font-black text-white/85">{c.author}</span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2 text-[9px] font-bold text-white/45">
                    <span className="flex items-center gap-0.5"><Heart className="h-2.5 w-2.5 text-red-300" />{c.likes}</span>
                    <span className="flex items-center gap-0.5"><Play className="h-2.5 w-2.5 text-sky-300" />{c.plays}</span>
                    <span className="flex items-center gap-0.5"><LayoutGrid className="h-2.5 w-2.5 text-white/40" />{c.obras}</span>
                    <span className="ml-auto font-black tabular-nums" style={{ color: colores[i] }}>{c.fama}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
        {resto.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {resto.map((c, i) => (
              <span key={c.author} className="rounded-full border border-white/10 bg-white/4 px-2 py-0.5 text-[9px] font-bold text-white/50">
                {i + 4}. {c.author} · <span className="tabular-nums text-[#FFC94D]/70">{c.fama}</span>
              </span>
            ))}
          </div>
        )}
      </motion.section>

      {/* ---- SEÑALES EN TUS OBRAS ---- */}
      <AnimatePresence>
        {miAutor && senales && (
          <motion.section
            className={`mt-2 flex flex-wrap items-center gap-2 rounded-2xl border p-3 ${senales.total > 0 ? "border-rose-400/35 bg-rose-400/8" : "border-white/10 bg-black/30"}`}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          >
            <Bell className={`h-4 w-4 ${senales.total > 0 ? "text-rose-300 v104-latido" : "text-white/30"}`} />
            {senales.total > 0 ? (
              <>
                <span className="text-[11px] font-black text-rose-200">
                  {t("obras.senTitulo")} · {senales.total}
                </span>
                <span className="hidden text-[9.5px] text-white/45 sm:block">
                  {senales.obras.map((o) => `“${o.title.slice(0, 26)}” +${o.delta}`).join(" · ")}
                </span>
                <button
                  onClick={marcarVistas}
                  className="ml-auto rounded-lg border border-rose-400/40 bg-rose-400/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-rose-200 transition hover:bg-rose-400/20 active:scale-95"
                >
                  {t("obras.vistas")}
                </button>
              </>
            ) : (
              <span className="text-[10px] font-semibold text-white/40">{t("obras.senVacio")}</span>
            )}
          </motion.section>
        )}
        {!miAutor && (
          <motion.section
            className="mt-2 flex items-center gap-2 rounded-2xl border border-white/10 bg-black/30 p-3"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          >
            <Users className="h-4 w-4 text-white/35" />
            <span className="text-[10px] font-semibold text-white/45">{t("obras.pideCuenta")}</span>
            <button
              onClick={() => pedirPasaporte(t("obras.pideCuentaMotivo"))}
              className="ml-auto rounded-lg border border-[#FFC94D]/45 bg-[#FFC94D]/12 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-[#FFC94D] transition hover:bg-[#FFC94D]/22 active:scale-95"
            >
              {t("obras.pideCuentaCta")}
            </button>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ---- FILTROS + ÓRDENES ---- */}
      <div className="v101-panel mt-3 flex flex-wrap items-center gap-1.5 rounded-2xl border border-white/10 bg-black/35 p-2.5">
        <button
          onClick={() => setFiltro("todo")}
          className={`flex items-center gap-1 rounded-lg border px-2 py-1 text-[9px] font-black uppercase tracking-wider transition ${filtro === "todo" ? "border-[#FFC94D]/60 bg-[#FFC94D]/15 text-[#FFC94D]" : "border-white/10 text-white/40 hover:text-white/70"}`}
        >
          <LayoutGrid className="h-3 w-3" /> {t("obras.todo")} · {totalObras}
        </button>
        {ORDEN_KINDS.filter((k) => (kinds[k] || 0) > 0).map((k) => (
          <button
            key={k}
            onClick={() => setFiltro(k)}
            className={`flex items-center gap-1 rounded-lg border px-2 py-1 text-[9px] font-black uppercase tracking-wider transition ${filtro === k ? "border-[#FFC94D]/60 bg-[#FFC94D]/15 text-[#FFC94D]" : "border-white/10 text-white/40 hover:text-white/70"}`}
          >
            {KIND_META[k]?.icon} {KIND_META[k]?.label ?? k} · {kinds[k]}
          </button>
        ))}
        <div className="ml-auto flex gap-1">
          {([["recent", t("obras.sortRec")], ["top", t("obras.sortMg")], ["plays", t("obras.sortJug")], ["rating", t("obras.sortVal")]] as const).map(([o, label]) => (
            <button
              key={o}
              onClick={() => setOrden(o as typeof orden)}
              aria-pressed={orden === o}
              className={`rounded-lg border px-2 py-1 text-[9px] font-black uppercase tracking-wider transition ${orden === o ? "border-[#FFC94D]/60 bg-[#FFC94D]/15 text-[#FFC94D]" : "border-white/10 text-white/35 hover:text-white/60"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ---- ESTADO VACÍO ---- */}
      {items !== null && items.length === 0 && (
        <motion.div
          className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-6 text-center"
          initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
        >
          <Palette className="mx-auto h-8 w-8 text-white/25" />
          <p className="mt-2 text-[12px] font-bold text-white/70">{t("obras.vaciaFiltro")}</p>
          <p className="mt-1 text-[10px] text-white/40">{t("obras.vaciaCuerpo")}</p>
        </motion.div>
      )}

      {/* ---- MURO DE OBRAS ---- */}
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {items?.map((it, i) => {
          const meta = KIND_META[it.kind];
          const esc = parseEsc(it.specs);
          const jdef = it.kind === "juego" ? parseJuegoDef(it.specs) : null;
          const fotos = parsePhotos(it.photos);
          const poll = votadas[it.id] || (it.kind === "encuesta" ? parsePoll(it.pollOptions) : []);
          const paper = it.kind === "periodico" ? parsePeriodico(it.body) : null;
          const sim = simulados[it.id];
          const coms = comsAbiertos[it.id];
          const nComs = comentariosCount[it.id] || 0;
          const colorFinal = (g: string) => (g === "B" ? "#FF6B4D" : g === "A" ? "#3DDCFF" : g === "N" ? "#FF0055" : g === "P" ? "#4ADE80" : "#FFD166");
          return (
            <motion.article
              key={it.id}
              className="v101-entra overflow-hidden rounded-2xl border border-white/10 bg-black/40"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.5), duration: 0.38 }}
            >
              <div className="p-3.5">
                {/* cabecera de obra */}
                <div className="flex items-center gap-2">
                  <Countryball code={it.authorBall || "un"} size={22} />
                  <span className="truncate text-[10px] font-black text-white/75">{it.author}</span>
                  <span className="rounded-md border border-white/12 bg-white/5 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-white/50">
                    {meta?.icon} {meta?.label ?? it.kind.toUpperCase()}
                  </span>
                  <span className="text-[9px] font-mono text-white/30">
                    <Clock className="mr-0.5 inline h-2.5 w-2.5" />{tiempoRel(it.createdAt)}
                  </span>
                  <button
                    onClick={() => like(it)}
                    className={`ml-auto flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[9px] font-black transition active:scale-95 ${pulsos[it.id] ? "v104-pulso border-red-400/60 bg-red-400/20" : "border-red-400/25 bg-red-400/8 hover:bg-red-400/18"} text-red-300`}
                    aria-label="like"
                  >
                    <Heart className={`h-3 w-3 ${likesMios[it.id] ? "fill-red-400" : ""}`} /> {it.likes}
                  </button>
                </div>

                <h3 className="mt-1.5 text-[13px] font-black leading-tight text-white/90">{it.title}</h3>
                {it.summary && <p className="mt-1 text-[10.5px] leading-snug text-white/55">{it.summary}</p>}

                {/* --- vistas por tipo --- */}
                {it.kind === "escenario" && esc && (
                  <div className="mt-2 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="rounded-md border border-white/12 bg-white/5 px-1.5 py-0.5 text-[8.5px] font-black uppercase tracking-wider text-white/60">
                        {escenarioPorId(esc.crisisId)?.nombre ?? esc.crisis}
                      </span>
                      <span className="rounded-md px-1.5 py-0.5 text-[8.5px] font-black uppercase tracking-wider" style={{ color: PERTURBACIONES.find((p) => p.id === esc.perturbacion)?.color ?? "#8A90A8", border: `1px solid ${PERTURBACIONES.find((p) => p.id === esc.perturbacion)?.color ?? "#8A90A8"}44` }}>
                        {PERTURBACIONES.find((p) => p.id === esc.perturbacion)?.nombre ?? esc.perturbacion}
                      </span>
                      <span className="flex items-center gap-0.5" title={`dosis ${esc.dosis}/5`}>
                        {[1, 2, 3, 4, 5].map((d) => (
                          <span key={d} className={`h-1.5 w-1.5 rounded-full ${d <= esc.dosis ? "bg-[#FFC94D]" : "bg-white/15"}`} />
                        ))}
                      </span>
                      <span className="rounded-md border border-white/12 px-1.5 py-0.5 text-[8.5px] font-mono text-white/45">{esc.horizonte}d</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg border p-2" style={{ borderColor: `${colorFinal(esc.ganador)}44`, background: `${colorFinal(esc.ganador)}0d` }}>
                      <Star className="h-3.5 w-3.5 flex-shrink-0" style={{ color: colorFinal(esc.ganador) }} />
                      <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: colorFinal(esc.ganador) }}>
                        {esc.final} · {t("escen.dia")} {esc.diaFin}
                      </span>
                    </div>
                  </div>
                )}

                {it.kind === "escenario" && sim && (
                  <div className="v101-entra mt-2 rounded-lg border border-sky-400/30 bg-sky-400/6 p-2.5">
                    <div className="flex items-center gap-2">
                      <Play className="h-3 w-3 text-sky-300" />
                      <span className="text-[9px] font-black uppercase tracking-wider text-sky-300">
                        {t("escen.reproducido")} · {sim.fin.nombre} ({t("escen.dia")} {sim.fin.dia})
                      </span>
                    </div>
                    <div className="mt-1.5 grid grid-cols-3 gap-1.5 text-center">
                      <MiniDato label={t("escen.frente")} v={`${Math.round(sim.serie[sim.serie.length - 1].frente)}%`} />
                      <MiniDato label={t("escen.bajas")} v={`${sim.deltas.bajas >= 0 ? "+" : ""}${Math.round(sim.deltas.bajas)}%`} />
                      <MiniDato label={t("escen.duracion")} v={`${sim.deltas.duracion >= 0 ? "+" : ""}${Math.round(sim.deltas.duracion)}d`} />
                    </div>
                  </div>
                )}

                {it.kind === "encuesta" && poll.length >= 2 && (
                  <div className="mt-2 space-y-1">
                    {poll.map((o, idx) => {
                      const totalV = poll.reduce((a, b) => a + b.votes, 0);
                      const pct = totalV ? Math.round((o.votes / totalV) * 100) : 0;
                      return (
                        <button
                          key={idx}
                          onClick={() => votarEncuesta(it, idx)}
                          disabled={!!votosHechos[it.id]}
                          className="relative w-full overflow-hidden rounded-lg border border-white/10 bg-white/4 px-2 py-1.5 text-left transition hover:border-[#FFC94D]/40 disabled:cursor-default"
                        >
                          <motion.span
                            className="absolute inset-y-0 left-0 bg-[#FFC94D]/12"
                            initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }}
                          />
                          <span className="relative flex items-center justify-between">
                            <span className="text-[10px] font-bold text-white/75">{o.label}</span>
                            <span className="text-[9px] font-black tabular-nums text-[#FFC94D]/80">{pct}%</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {it.kind === "musica" && it.audioData && (
                  <audio controls src={it.audioData} className="mt-2 h-9 w-full" preload="none" />
                )}

                {it.kind === "video" && it.videoUrl && (
                  <a
                    href={it.videoUrl} target="_blank" rel="noopener noreferrer"
                    className="mt-2 flex items-center gap-2 rounded-lg border border-fuchsia-400/30 bg-fuchsia-400/8 px-2.5 py-2 text-[10px] font-black uppercase tracking-wider text-fuchsia-200 transition hover:bg-fuchsia-400/16"
                  >
                    <Video className="h-3.5 w-3.5" /> {t("obras.verVideo")}
                  </a>
                )}

                {paper && (
                  <div className="mt-2 rounded-lg border border-white/12 bg-white/4 p-2">
                    {paper.articles?.slice(0, 2).map((a, idx) => (
                      <p key={idx} className={`text-[10px] font-black leading-snug ${idx === 0 ? "text-white/85" : "text-white/55"}`}>
                        ▪ {a.t}
                      </p>
                    ))}
                  </div>
                )}

                {fotos.length > 0 && (
                  <div className="mt-2 flex gap-1.5">
                    {fotos.slice(0, 2).map((f, idx) => (
                      <img key={idx} src={f.src} alt={it.title} className="h-20 w-1/2 rounded-lg border border-white/10 object-cover" loading="lazy" />
                    ))}
                  </div>
                )}

                {!["juego", "escenario", "encuesta", "musica", "periodico", "video"].includes(it.kind) && it.body && !paper && (
                  <p className="mt-2 line-clamp-3 rounded-lg border border-white/8 bg-white/3 p-2 text-[10px] leading-snug text-white/55">{it.body.slice(0, 220)}</p>
                )}

                {it.kind === "juego" && (
                  <div className="mt-2 flex items-center gap-2 text-[9px] font-bold text-white/40">
                    <Play className="h-3 w-3 text-sky-300" />
                    <span className="tabular-nums">{it.plays} {t("obras.jugadas")}</span>
                    {jdef && <span className="rounded-md border border-white/12 px-1.5 py-0.5 uppercase tracking-wider">{jdef.engine}</span>}
                    {!jdef && !esTaller(it.specs) && <span className="rounded-md border border-white/12 px-1.5 py-0.5 uppercase tracking-wider">{t("obras.legacy")}</span>}
                  </div>
                )}

                {opinadas[it.id] && (
                  <div className="mt-2 flex items-center gap-1.5 rounded-lg border border-lime-400/35 bg-lime-400/8 px-2 py-1">
                    <Bot className="h-3 w-3 text-lime-300" />
                    <span className="text-[9px] font-black uppercase tracking-wider text-lime-200">{t("obras.firmaMente")} — {opinadas[it.id]}</span>
                  </div>
                )}

                {/* --- acciones --- */}
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  {it.kind === "juego" && (
                    <button
                      onClick={() => jugarGame(it)}
                      className="flex items-center gap-1 rounded-lg border border-rose-400/45 bg-rose-400/12 px-2.5 py-1.5 text-[9px] font-black uppercase tracking-wider text-rose-200 transition hover:bg-rose-400/22 active:scale-95"
                    >
                      {jugandoId === it.id ? <ChevronDown className="h-3 w-3" /> : <Gamepad2 className="h-3 w-3" />}
                      {jugandoId === it.id ? t("obras.cerrarJuego") : t("obras.jugar")}
                    </button>
                  )}
                  {jdef && (
                    <button
                      onClick={() => remezclarJuego(it)}
                      className="flex items-center gap-1 rounded-lg border border-[#FFC94D]/45 bg-[#FFC94D]/10 px-2.5 py-1.5 text-[9px] font-black uppercase tracking-wider text-[#FFC94D] transition hover:bg-[#FFC94D]/20 active:scale-95"
                    >
                      <Wrench className="h-3 w-3" /> {t("obras.remezclar")}
                    </button>
                  )}
                  {it.kind === "escenario" && (
                    <>
                      <button
                        onClick={() => simularEsc(it)}
                        className="flex items-center gap-1 rounded-lg border border-sky-400/40 bg-sky-400/10 px-2.5 py-1.5 text-[9px] font-black uppercase tracking-wider text-sky-300 transition hover:bg-sky-400/20 active:scale-95"
                      >
                        <Play className="h-3 w-3" /> {t("escen.simular")}
                      </button>
                      <button
                        onClick={() => remezclarEsc(it)}
                        className="flex items-center gap-1 rounded-lg border border-[#FFC94D]/45 bg-[#FFC94D]/10 px-2.5 py-1.5 text-[9px] font-black uppercase tracking-wider text-[#FFC94D] transition hover:bg-[#FFC94D]/20 active:scale-95"
                      >
                        <GitBranch className="h-3 w-3" /> {t("escen.mejorar")}
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => abrirComs(it)}
                    className="flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-[9px] font-black uppercase tracking-wider text-white/60 transition hover:bg-white/10 active:scale-95"
                  >
                    <MessageSquare className="h-3 w-3" /> {t("escen.comentar")}{nComs > 0 ? ` · ${nComs}` : ""}
                  </button>
                  <button
                    onClick={() => opinar(it)}
                    disabled={opinando === it.id}
                    className="flex items-center gap-1 rounded-lg border border-lime-400/40 bg-lime-400/10 px-2.5 py-1.5 text-[9px] font-black uppercase tracking-wider text-lime-200 transition hover:bg-lime-400/20 active:scale-95 disabled:opacity-60"
                  >
                    <Bot className={`h-3 w-3 ${opinando === it.id ? "v104-latido" : ""}`} />
                    {opinando === it.id ? t("obras.opinando") : t("obras.opinar")}
                  </button>
                  <button
                    onClick={() => compartir(it)}
                    className="flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-[9px] font-black uppercase tracking-wider text-white/55 transition hover:bg-white/10 active:scale-95"
                  >
                    <Share2 className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => reportar(it)}
                    className="ml-auto flex items-center gap-1 rounded-lg border border-white/10 px-2 py-1.5 text-[8.5px] font-black uppercase tracking-wider text-white/30 transition hover:border-red-400/30 hover:text-red-300 active:scale-95"
                  >
                    <Flag className="h-2.5 w-2.5" /> {t("obras.reportar")}
                  </button>
                </div>

                {/* --- juego en vivo --- */}
                <AnimatePresence>
                  {it.kind === "juego" && jugandoId === it.id && (
                    <motion.div
                      className="v101-entra mt-2 rounded-xl border border-rose-400/25 bg-black/50 p-2"
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    >
                      {jdef ? (
                        <GameRuntime def={jdef} idJuego={it.id} compacto />
                      ) : it.gameHtml ? (
                        <iframe
                          title={it.title}
                          srcDoc={it.gameHtml}
                          sandbox="allow-scripts"
                          className="h-80 w-full rounded-lg border border-white/10 bg-black"
                        />
                      ) : (
                        <p className="p-2 text-center text-[10px] text-white/40">{t("obras.juegoExterno")}</p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* --- comentarios --- */}
              <AnimatePresence>
                {coms && (
                  <motion.div
                    className="border-t border-white/8 bg-black/30 p-3"
                    initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  >
                    <div className="flex gap-1.5">
                      <input
                        value={textoCom[it.id] || ""}
                        onChange={(e) => setTextoCom((m) => ({ ...m, [it.id]: e.target.value.slice(0, 400) }))}
                        onKeyDown={(e) => { if (e.key === "Enter") void enviarCom(it); }}
                        placeholder={t("escen.comentarioFrase")}
                        className="h-8 flex-1 rounded-lg border border-white/12 bg-black/40 px-2 text-[10px] text-white/85 outline-none placeholder:text-white/25 focus:border-[#FFC94D]/50"
                        aria-label={t("escen.comentar")}
                      />
                      <button
                        onClick={() => void enviarCom(it)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#FFC94D]/50 bg-[#FFC94D]/15 text-[#FFC94D] transition hover:bg-[#FFC94D]/25 active:scale-95"
                        aria-label={t("escen.enviar")}
                      >
                        <Send className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="mt-2 space-y-1.5">
                      {coms.length === 0 && <p className="text-[9px] text-white/30">{t("escen.sinComentarios")}</p>}
                      {coms.map((c) => (
                        <div key={c.id} className="flex items-start gap-1.5">
                          <Countryball code={c.authorBall || "un"} size={16} />
                          <div className={`min-w-0 rounded-lg border px-2 py-1 ${c.author === "MENTE·VANGUARD" ? "border-lime-400/35 bg-lime-400/6" : "border-white/8 bg-white/4"}`}>
                            <span className={`text-[9px] font-black ${c.author === "MENTE·VANGUARD" ? "text-lime-300" : "text-white/60"}`}>{c.author}</span>
                            <p className="text-[10px] leading-snug text-white/75">{c.text}</p>
                          </div>
                        </div>
                      ))}
                      {coms.length > 0 && (
                        <p className="pt-0.5 text-center text-[8px] font-black uppercase tracking-wider text-white/25">
                          <ChevronDown className="inline h-2.5 w-2.5" /> {coms.length} {t("escen.comentarios")}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.article>
          );
        })}
      </div>

      <p className="mt-4 text-center text-[10px] font-semibold text-white/25">{t("obras.pie")}</p>
    </div>
  );
}

function MiniDato({ label, v }: { label: string; v: string }) {
  return (
    <div className="rounded-md border border-white/8 bg-black/30 py-1">
      <div className="text-[10px] font-black tabular-nums text-white/75">{v}</div>
      <div className="text-[7.5px] font-bold uppercase tracking-wider text-white/35">{label}</div>
    </div>
  );
}
