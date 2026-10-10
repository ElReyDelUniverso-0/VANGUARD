"use client";

// v101.0 EL REGRESO — PILAR 3: LA GENTE CREA Y PARTICIPA (panel)
// GALERÍA DEL DESTINO: los escenarios ¿Y SI...? que la comunidad comparte
// desde el Laboratorio. Cualquiera puede EXPLORARLO (correr la simulación
// determinista al instante), COMENTARLO y MEJORARLO (remix: abre el Lab con
// la misma crisis, perturbación y dosis listas para ajustar y publicar la
// versión mejorada). Etiqueta SIEMPRE: SIMULACIÓN · NO ES PREDICCIÓN.

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Share2, Play, MessageSquare, GitBranch, Heart, Flame, Clock, Trophy, ChevronDown, Send, FlaskConical,
} from "lucide-react";
import { HeroOro } from "@/components/vanguard/hero-oro";
import { useGameStore } from "@/lib/game-store";
import { useAnalista } from "@/lib/analista";
import { toast } from "sonner";
import { navigateTo } from "@/lib/nav";
import { simular, escenarioPorId, PERTURBACIONES, NIVELES_ESCALADA, type ConfigLab, type ResultadoLab } from "@/lib/whatif";
import { Countryball } from "@/components/vanguard/countryball";
import { useT } from "@/lib/i18n";

interface EscItem {
  id: string;
  author: string;
  authorBall: string;
  title: string;
  summary: string;
  specs: string;
  likes: number;
  createdAt: string;
}

interface Specs {
  crisisId: string;
  crisis: string;
  perturbacion: string;
  dosis: number;
  horizonte: number;
  final: string;
  diaFin: number;
  ganador: string;
  mc: { nombre: string; probabilidad: number }[];
  frente: number;
}

interface Comentario { id: string; author: string; authorBall: string; text: string; createdAt: string }

export function EscenariosPanel() {
  const { t } = useT();
  const alias = useGameStore((s) => s.alias);
  const [orden, setOrden] = useState<"top" | "recent">("top");
  const [items, setItems] = useState<EscItem[] | null>(null);
  const [simulados, setSimulados] = useState<Record<string, ResultadoLab>>({});
  const [comentariosAbiertos, setComentariosAbiertos] = useState<Record<string, Comentario[]>>({});
  const [textoComentario, setTextoComentario] = useState<Record<string, string>>({});

  useEffect(() => {
    let vivo = true;
    (async () => {
      try {
        const res = await fetch(`/api/ugc?kind=escenario&sort=${orden}&limit=40`);
        const data = await res.json();
        if (vivo) setItems(data.items || []);
      } catch {
        if (vivo) setItems([]);
      }
    })();
    return () => { vivo = false; };
  }, [orden]);

  const specsDe = (it: EscItem): Specs | null => {
    try {
      const s = JSON.parse(it.specs) as Specs;
      if (!s.crisisId || !s.perturbacion) return null;
      return s;
    } catch { return null; }
  };

  const pertNombre = (id: string) => PERTURBACIONES.find((p) => p.id === id)?.nombre ?? id;
  const pertColor = (id: string) => PERTURBACIONES.find((p) => p.id === id)?.color ?? "#8A90A8";
  const colorFinal = (ganador: string) =>
    ganador === "B" ? "#FF6B4D" : ganador === "A" ? "#3DDCFF" : ganador === "N" ? "#FF0055" : ganador === "P" ? "#4ADE80" : "#FFD166";

  const simularAqui = (it: EscItem) => {
    const s = specsDe(it);
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
      toast(`Simulación local: ${r.fin.nombre} (día ${r.fin.dia})`, { duration: 3000, icon: "🎬" });
    } catch { toast.error("No se pudo reproducir el escenario"); }
  };

  const mejorarlo = (it: EscItem) => {
    const s = specsDe(it);
    if (!s) return;
    try {
      sessionStorage.setItem("vg-whatif-remix", JSON.stringify({ ...s, autor: it.author }));
    } catch { /* noop */ }
    navigateTo("laboratorio" as never);
  };

  const like = async (it: EscItem) => {
    try {
      const res = await fetch(`/api/ugc/${it.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "like", voter: alias || "ANÓNIMO" }),
      });
      const data = await res.json();
      setItems((lst) => lst ? lst.map((x) => (x.id === it.id ? { ...x, likes: data.likes ?? x.likes } : x)) : lst);
      if (data.liked) toast("+1 al escenario", { duration: 1400, icon: "❤️" });
    } catch { /* noop */ }
  };

  const abrirComentarios = async (it: EscItem) => {
    if (comentariosAbiertos[it.id]) {
      setComentariosAbiertos((m) => { const n = { ...m }; delete n[it.id]; return n; });
      return;
    }
    try {
      const res = await fetch(`/api/ugc/comments?itemId=${it.id}`);
      const data = await res.json();
      setComentariosAbiertos((m) => ({ ...m, [it.id]: data.comments || [] }));
    } catch { setComentariosAbiertos((m) => ({ ...m, [it.id]: [] })); }
  };

  const enviarComentario = async (it: EscItem) => {
    const text = (textoComentario[it.id] || "").trim();
    if (text.length < 2) return;
    try {
      const res = await fetch("/api/ugc/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: it.id, author: alias || "ANÓNIMO", authorBall: "un", text }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "No se pudo comentar"); return; }
      setComentariosAbiertos((m) => ({ ...m, [it.id]: [data.comment, ...(m[it.id] || [])] }));
      setTextoComentario((m) => ({ ...m, [it.id]: "" }));
      toast("Comentario publicado", { duration: 1600, icon: "💬" });
    } catch { toast.error("Error de red al comentar"); }
  };

  const total = items?.length ?? 0;

  return (
    <div className="mx-auto max-w-6xl px-3 pb-24 pt-2 sm:px-4">
      <HeroOro panel="escenarios" />

      {/* cabecera */}
      <motion.div
        className="v101-panel mt-3 flex flex-wrap items-center gap-2 rounded-2xl border border-[#FFC94D]/25 bg-[#FFC94D]/5 p-3"
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
      >
        <Share2 className="h-4 w-4 text-[#FFC94D]" />
        <span className="text-[11px] font-black uppercase tracking-widest text-[#FFC94D]">
          {t("escen.explora")} · {t("escen.comenta")} · {t("escen.mejora")}
        </span>
        <div className="ml-auto flex gap-1">
          {(["top", "recent"] as const).map((o) => (
            <button
              key={o}
              onClick={() => setOrden(o)}
              aria-pressed={orden === o}
              className={`rounded-lg border px-2.5 py-1 text-[9px] font-black uppercase tracking-wider transition ${orden === o ? "border-[#FFC94D]/60 bg-[#FFC94D]/15 text-[#FFC94D]" : "border-white/10 text-white/40 hover:text-white/70"}`}
            >
              {o === "top" ? t("escen.top") : t("escen.recientes")}
            </button>
          ))}
        </div>
        <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-2.5 py-1 text-[9px] font-black tracking-wider text-amber-300">
          SIMULACIÓN · NO ES PREDICCIÓN
        </span>
      </motion.div>

      {/* estado vacío */}
      {items !== null && total === 0 && (
        <motion.div
          className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-6 text-center"
          initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
        >
          <FlaskConical className="mx-auto h-8 w-8 text-white/25" />
          <p className="mt-2 text-[12px] font-bold text-white/70">{t("escen.vacioTitulo")}</p>
          <p className="mt-1 text-[10px] text-white/40">{t("escen.vacioCuerpo")}</p>
          <button
            onClick={() => navigateTo("laboratorio" as never)}
            className="v101-cta mt-3 inline-flex items-center gap-1.5 rounded-xl border border-sky-400/50 bg-sky-400/10 px-4 py-2 text-[10px] font-black uppercase tracking-wider text-sky-300 transition hover:bg-sky-400/20 active:scale-95"
          >
            <FlaskConical className="h-3.5 w-3.5" /> {t("escen.irLab")}
          </button>
        </motion.div>
      )}

      {/* galería */}
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {items?.map((it, i) => {
          const s = specsDe(it);
          const r = simulados[it.id];
          const coms = comentariosAbiertos[it.id];
          return (
            <motion.article
              key={it.id}
              className="v101-entra overflow-hidden rounded-2xl border border-white/10 bg-black/40"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.05, 0.6), duration: 0.4 }}
            >
              <div className="p-3.5">
                <div className="flex items-center gap-2">
                  <Countryball code={it.authorBall || "un"} size={22} />
                  <span className="text-[10px] font-black text-white/70">{it.author}</span>
                  <span className="text-[9px] font-mono text-white/30">
                    <Clock className="mr-0.5 inline h-2.5 w-2.5" />
                    {new Date(it.createdAt).toLocaleDateString("es", { day: "2-digit", month: "short" })}
                  </span>
                  <button onClick={() => like(it)} className="ml-auto flex items-center gap-1 rounded-lg border border-red-400/25 bg-red-400/8 px-2 py-0.5 text-[9px] font-black text-red-300 transition hover:bg-red-400/18 active:scale-95" aria-label="like">
                    <Heart className="h-3 w-3" /> {it.likes}
                  </button>
                </div>

                <h3 className="mt-1.5 text-[13px] font-black leading-tight text-white/90">{it.title}</h3>
                <p className="mt-1 text-[10.5px] leading-snug text-white/55">{it.summary}</p>

                {s && (
                  <>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <span className="rounded-md border border-white/12 bg-white/5 px-1.5 py-0.5 text-[8.5px] font-black uppercase tracking-wider text-white/60">
                        {escenarioPorId(s.crisisId)?.nombre ?? s.crisis}
                      </span>
                      <span className="rounded-md px-1.5 py-0.5 text-[8.5px] font-black uppercase tracking-wider" style={{ color: pertColor(s.perturbacion), border: `1px solid ${pertColor(s.perturbacion)}44` }}>
                        {pertNombre(s.perturbacion)}
                      </span>
                      <span className="flex items-center gap-0.5" title={`dosis ${s.dosis}/5`}>
                        {[1, 2, 3, 4, 5].map((d) => (
                          <span key={d} className={`h-1.5 w-1.5 rounded-full ${d <= s.dosis ? "bg-[#FFC94D]" : "bg-white/15"}`} />
                        ))}
                      </span>
                      <span className="rounded-md border border-white/12 px-1.5 py-0.5 text-[8.5px] font-mono text-white/45">{s.horizonte}d</span>
                    </div>

                    <div className="mt-2 flex items-center gap-2 rounded-lg border p-2" style={{ borderColor: `${colorFinal(s.ganador)}44`, background: `${colorFinal(s.ganador)}0d` }}>
                      <Trophy className="h-3.5 w-3.5 flex-shrink-0" style={{ color: colorFinal(s.ganador) }} />
                      <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: colorFinal(s.ganador) }}>
                        {s.final} · {t("escen.dia")} {s.diaFin}
                      </span>
                      {typeof s.frente === "number" && (
                        <span className="ml-auto text-[9px] font-mono text-white/40">frente {Math.round(s.frente)}%</span>
                      )}
                    </div>

                    {Array.isArray(s.mc) && s.mc.length > 0 && (
                      <div className="mt-2 grid grid-cols-3 gap-1.5">
                        {s.mc.slice(0, 3).map((m) => (
                          <div key={m.nombre} className="rounded-md border border-white/8 bg-black/30 px-1.5 py-1 text-center">
                            <div className="text-[10px] font-black tabular-nums text-white/75">{m.probabilidad}%</div>
                            <div className="truncate text-[7.5px] font-bold uppercase tracking-wider text-white/35">{m.nombre}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* resultado en vivo si se simuló aquí */}
                <AnimatePresence>
                  {r && (
                    <motion.div
                      className="v101-entra mt-2 rounded-lg border border-sky-400/30 bg-sky-400/6 p-2.5"
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    >
                      <div className="flex items-center gap-2">
                        <Play className="h-3 w-3 text-sky-300" />
                        <span className="text-[9px] font-black uppercase tracking-wider text-sky-300">
                          {t("escen.reproducido")} · {r.fin.nombre} ({t("escen.dia")} {r.fin.dia})
                        </span>
                      </div>
                      <div className="mt-1.5 grid grid-cols-3 gap-1.5 text-center">
                        <MiniDato label={t("escen.frente")} v={`${Math.round(r.serie[r.serie.length - 1].frente)}%`} />
                        <MiniDato label={t("escen.bajas")} v={`${r.deltas.bajas >= 0 ? "+" : ""}${Math.round(r.deltas.bajas)}%`} />
                        <MiniDato label={t("escen.duracion")} v={`${r.deltas.duracion >= 0 ? "+" : ""}${Math.round(r.deltas.duracion)}d`} />
                      </div>
                      <div className="mt-1.5 flex items-center gap-1 text-[8.5px] font-mono text-white/35">
                        <Flame className="h-2.5 w-2.5" style={{ color: NIVELES_ESCALADA[r.serie[r.serie.length - 1].escalada - 1].color }} />
                        {t("escen.escalada")} {r.serie[r.serie.length - 1].escalada} · {NIVELES_ESCALADA[r.serie[r.serie.length - 1].escalada - 1].nombre}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* acciones: explorar · comentar · mejorar */}
                <div className="mt-2.5 grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => simularAqui(it)}
                    className="flex items-center justify-center gap-1 rounded-lg border border-sky-400/40 bg-sky-400/10 px-2 py-1.5 text-[9px] font-black uppercase tracking-wider text-sky-300 transition hover:bg-sky-400/20 active:scale-95"
                  >
                    <Play className="h-3 w-3" /> {t("escen.simular")}
                  </button>
                  <button
                    onClick={() => abrirComentarios(it)}
                    className="flex items-center justify-center gap-1 rounded-lg border border-white/15 bg-white/5 px-2 py-1.5 text-[9px] font-black uppercase tracking-wider text-white/60 transition hover:bg-white/10 active:scale-95"
                  >
                    <MessageSquare className="h-3 w-3" /> {t("escen.comentar")}
                  </button>
                  <button
                    onClick={() => mejorarlo(it)}
                    className="flex items-center justify-center gap-1 rounded-lg border border-[#FFC94D]/45 bg-[#FFC94D]/10 px-2 py-1.5 text-[9px] font-black uppercase tracking-wider text-[#FFC94D] transition hover:bg-[#FFC94D]/20 active:scale-95"
                  >
                    <GitBranch className="h-3 w-3" /> {t("escen.mejorar")}
                  </button>
                </div>
              </div>

              {/* comentarios */}
              <AnimatePresence>
                {coms && (
                  <motion.div
                    className="border-t border-white/8 bg-black/30 p-3"
                    initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  >
                    <div className="flex gap-1.5">
                      <input
                        value={textoComentario[it.id] || ""}
                        onChange={(e) => setTextoComentario((m) => ({ ...m, [it.id]: e.target.value.slice(0, 400) }))}
                        onKeyDown={(e) => { if (e.key === "Enter") enviarComentario(it); }}
                        placeholder={t("escen.comentarioFrase")}
                        className="h-8 flex-1 rounded-lg border border-white/12 bg-black/40 px-2 text-[10px] text-white/85 outline-none placeholder:text-white/25 focus:border-[#FFC94D]/50"
                        aria-label={t("escen.comentar")}
                      />
                      <button
                        onClick={() => enviarComentario(it)}
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
                          <div className="min-w-0 rounded-lg border border-white/8 bg-white/4 px-2 py-1">
                            <span className="text-[9px] font-black text-white/60">{c.author}</span>
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

      <p className="mt-4 text-center text-[10px] font-semibold text-white/25">{t("escen.pie")}</p>
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
