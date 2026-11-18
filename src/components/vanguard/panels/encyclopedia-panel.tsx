"use client";

// Vanguard v12 / v406.6 — GRAN ENCICLOPEDIA MUNDIAL & CENTRO DE CONOCIMIENTO GLOBAL
// Fichas estructuradas de 13 grandes disciplinas:
// Países y sus Historias, Geografía Física y Política, Economía y Comercio Global,
// Civilizaciones Antiguas, Ciencia y Tecnología, Organizaciones Internacionales,
// Recursos Naturales y Energía, Cultura y Sociedades, Guerras, Política, Líderes,
// Partidos y Religiones.
//
// Incluye:
// · Buscador universal con filtros instantáneos
// · 4 Modos de visualización: Catálogo de Fichas, Planisferio Interactivo SVG,
//   Matriz de Conexiones Intermodulares y Desafío de Conocimiento (Trivia con XP)
// · Datos estructurados verificados, cronologías, hechos estratégicos ("¿Sabías qué?")
// · Mini-mapas con coordenadas lat/lng
// · Conexiones intermodulares vivas (vanguard:navigate) con Atlas, Países, Wikiguerra,
//   Sala de Guerra, Geoint, Mercados y Biblioteca
// · Consulta en vivo con la API de Wikipedia (/api/wiki)
// · Paridad 3D con useSala3DContenido y Entrada del Día

import { useState, useMemo, useEffect } from "react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import {
  BookOpen, Search, Clock, Sparkles, Globe2, ExternalLink, X, Camera,
  MapPin, Compass, Landmark, Shield, Coins, Cpu, Zap, Building2, Flame,
  Share2, Route, Award, CheckCircle2, ChevronRight, HelpCircle, RotateCcw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { sfx } from "@/lib/sound";
import { useGameStore } from "@/lib/game-store";
import {
  WIKI_ENTRIES, WIKI_CATS, wikiDelDia,
  type WikiEntry, type WikiCat, type ModuloConexion
} from "@/lib/wiki-data";
import { useSala3DContenido } from "../use-sala3d-contenido";
import { HeroOro } from "@/components/vanguard/hero-oro";
import { projectLatLng } from "@/components/vanguard/world-map-svg";
import worldPaths from "@/lib/world-paths.json";

interface WikiExtract {
  title: string;
  extract: string;
  thumbnail?: string;
  url?: string;
}

type ModoVista = "catalogo" | "mapa" | "conexiones" | "desafio";

// Preguntas para el Desafío de Conocimiento Global
interface QuizQuestion {
  id: string;
  pregunta: string;
  opciones: string[];
  correcta: number;
  explicacion: string;
  disciplina: string;
}

const BANCO_QUIZ: QuizQuestion[] = [
  {
    id: "q-ormuz",
    pregunta: "¿Qué porcentaje aproximado del consumo mundial de petróleo líquido transita a través del Estrecho de Ormuz?",
    opciones: ["Cerca del 5%", "Aproximadamente el 21%", "Más del 60%", "Menos del 2%"],
    correcta: 1,
    explicacion: "Por el Estrecho de Ormuz navegan diariamente unos 21 millones de barriles de crudo y condensados, equivalentes al 21% del consumo global de líquidos de petróleo.",
    disciplina: "Geografía Física y Política",
  },
  {
    id: "q-asml",
    pregunta: "¿Qué corporación europea posee el monopolio tecnológico mundial en la fabricación de máquinas de litografía ultravioleta extrema (EUV) para microchips de vanguardia?",
    opciones: ["Siemens (Alemania)", "ASML (Países Bajos)", "STMicroelectronics (Francia/Italia)", "ARM Holdings (Reino Unido)"],
    correcta: 1,
    explicacion: "ASML, con sede en Veldhoven (Países Bajos), es la única compañía de la Tierra capaz de construir los sistemas de litografía EUV necesarios para procesadores de 5, 3 y 2 nanómetros.",
    disciplina: "Ciencia y Tecnología",
  },
  {
    id: "q-sumeria",
    pregunta: "¿Cuál fue la civilización mesopotámica que inventó la escritura cuneiforme sobre tablillas de arcilla hacia el 3400 a.C.?",
    opciones: ["Los sumerios", "Los asirios", "Los persas aqueménidas", "Los fenicios"],
    correcta: 0,
    explicacion: "Los sumerios desarrollaron en ciudades como Uruk el primer sistema formal de escritura cuneiforme, además de la rueda, el arado y el sistema numérico sexagesimal.",
    disciplina: "Civilizaciones Antiguas",
  },
  {
    id: "q-otan-art5",
    pregunta: "¿En qué circunstancia histórica se ha invocado por única vez el Artículo 5 de defensa colectiva del Tratado de la OTAN?",
    opciones: ["Durante la Crisis de los Misiles en Cuba (1962)", "Tras la caída del Muro de Berlín (1989)", "Tras los atentados del 11 de septiembre de 2001 en EE.UU.", "En la Guerra del Golfo de 1991"],
    correcta: 2,
    explicacion: "El Artículo 5 solo se invocó tras los atentados terroristas del 11 de septiembre de 2001 contra las Torres Gemelas y el Pentágono, activando patrullas aéreas aliadas sobre Norteamérica.",
    disciplina: "Organizaciones Internacionales",
  },
  {
    id: "q-litio",
    pregunta: "¿Qué tres países de América del Sur conforman el denominado 'Triángulo del Litio', que alberga más del 55% de los recursos mundiales de este mineral crítico?",
    opciones: ["Brasil, Perú y Colombia", "Chile, Bolivia y Argentina", "Venezuela, Guyana y Surinam", "Ecuador, Paraguay y Uruguay"],
    correcta: 1,
    explicacion: "El Salar de Atacama (Chile), Salar de Uyuni (Bolivia) y Salar del Hombre Muerto (Argentina) concentran más del 56% de los recursos identificados de litio en salmueras del planeta.",
    disciplina: "Recursos Naturales y Energía",
  },
  {
    id: "q-dolar",
    pregunta: "¿Qué porcentaje aproximado de las reservas asignadas globales en los bancos centrales mundiales está denominado en dólares estadounidenses (USD)?",
    opciones: ["Aproximadamente el 58%", "Menos del 15%", "Cerca del 95%", "Exactamente el 33%"],
    correcta: 0,
    explicacion: "Según datos oficiales del FMI (COFER), el dólar estadounidense representa cerca del 58% de las reservas cambiarias mundiales, seguido por el euro con aproximadamente el 20%.",
    disciplina: "Economía y Comercio Global",
  },
  {
    id: "q-montreux",
    pregunta: "¿Qué tratado internacional de 1936 concede a Turquía la soberanía para regular y en tiempos de guerra cerrar el paso de buques de guerra por el Bósforo y los Dardanelos?",
    opciones: ["El Tratado de Lausana", "La Convención de Montreux", "El Tratado de Sèvres", "El Pacto de Varsovia"],
    correcta: 1,
    explicacion: "La Convención de Montreux de 1936 rige el régimen naval de los estrechos turcos y faculta a Turquía para cerrar el acceso militar beligerante al Mar Negro.",
    disciplina: "Geografía Física y Política",
  },
  {
    id: "q-mansa-musa",
    pregunta: "¿Qué soberano del Imperio de Malí en el siglo XIV es célebre por su legendaria peregrinación a La Meca en 1324 donde repartió tal cantidad de oro que devaluó el metal en el Mediterráneo?",
    opciones: ["Sundiata Keita", "Mansa Musa", "Askia el Grande", "Sonni Alí"],
    correcta: 1,
    explicacion: "Mansa Musa (1312-1337) gobernó el Imperio de Malí en su época de máximo esplendor comercial de oro y sal, consolidando a Tombuctú como capital académica del Sahel.",
    disciplina: "Civilizaciones Antiguas",
  },
];

function loadRead(): string[] {
  try {
    return JSON.parse(localStorage.getItem("vanguard-wiki-read") ?? "[]") as string[];
  } catch {
    return [];
  }
}

export function EncyclopediaPanel() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<WikiCat | "TODAS">("TODAS");
  const [modo, setModo] = useState<ModoVista>("catalogo");
  const [detail, setDetail] = useState<WikiEntry | null>(null);
  const [live, setLive] = useState<WikiExtract | null>(null);
  const [liveLoading, setLiveLoading] = useState(false);
  const [readSet, setReadSet] = useState<string[]>([]);
  const addXp = useGameStore((s) => s.addXp);

  // Estado del Desafío / Trivia
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizDone, setQuizDone] = useState(false);

  useEffect(() => {
    setReadSet(loadRead());
  }, []);

  const delDia = useMemo(() => wikiDelDia(), []);

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return WIKI_ENTRIES.filter((e) => {
      const matchCat = cat === "TODAS" || e.cat === cat;
      const matchQuery =
        !ql ||
        e.title.toLowerCase().includes(ql) ||
        e.subtitle.toLowerCase().includes(ql) ||
        e.desc.toLowerCase().includes(ql) ||
        e.region.toLowerCase().includes(ql) ||
        (e.mapaContexto && e.mapaContexto.toLowerCase().includes(ql));
      return matchCat && matchQuery;
    });
  }, [q, cat]);

  // Entradas con coordenadas geográficas para el mapa interactivo
  const entradasGeolocalizadas = useMemo(() => {
    return WIKI_ENTRIES.filter((e) => e.coordenadas != null).map((e) => {
      const { lat, lng } = e.coordenadas!;
      const xy = projectLatLng(lat, lng);
      return { entry: e, xy };
    }).filter((p) => p.xy.x > 0 && p.xy.x < 1000);
  }, []);

  // Paridad 3D: alimenta la sala 3D con la riqueza de las 13 categorías
  useSala3DContenido(
    "encyclopedia",
    "Enciclopedia Mundial",
    "#00F0FF",
    `${readSet.length}/${WIKI_ENTRIES.length} DOSSIERS DOMINADOS · +15 XP POR APRENDIZAJE`,
    [
      ...filtered.slice(0, 6).map((e) => ({
        t: e.title,
        v: e.dates?.slice(0, 16) || e.cat,
        img: e.img || undefined,
        p: Math.round((readSet.length / Math.max(1, WIKI_ENTRIES.length)) * 100),
        color: readSet.includes(e.id) ? "#3DDC84" : "#00F0FF",
        d: `${e.subtitle} · ${e.region}`,
      })),
      {
        t: `★ DOSSIER DEL DÍA: ${delDia.title.toUpperCase()}`,
        v: delDia.dates?.slice(0, 14) || "",
        p: Math.round((readSet.length / Math.max(1, WIKI_ENTRIES.length)) * 100),
        color: "#F5C542",
        d: `${delDia.subtitle} · ${delDia.region} · rotación continua de la escuela`,
        a: "abrir entrada del día",
      },
    ],
  );

  const openDetail = (e: WikiEntry) => {
    sfx.tab();
    setDetail(e);
    setLive(null);
    if (!readSet.includes(e.id)) {
      const next = [...readSet, e.id];
      setReadSet(next);
      try {
        localStorage.setItem("vanguard-wiki-read", JSON.stringify(next));
      } catch {}
      addXp(15);
      toast.success(`Dossier estudiado: ${e.title}`, {
        description: "+15 XP de Inteligencia añadidos a tu perfil militar.",
      });
    }
  };

  const fetchLive = async (e: WikiEntry) => {
    setLiveLoading(true);
    setLive(null);
    try {
      const res = await fetch(`/api/wiki?q=${encodeURIComponent(e.wiki)}`);
      const data = await res.json();
      if (data?.extract) setLive(data as WikiExtract);
      else toast.error("Wikipedia no respondió · reintenta en breve");
    } catch {
      toast.error("Sin conexión con la API de Wikipedia");
    } finally {
      setLiveLoading(false);
    }
  };

  const navigateToModule = (modulo: string, label: string) => {
    sfx.click();
    window.dispatchEvent(new CustomEvent("vanguard:navigate", { detail: modulo }));
    toast.info(`Desplegando módulo ${label.toUpperCase()}`, {
      description: "Transición directa en el Centro de Mando Cuartel.",
    });
  };

  const answerQuiz = (optionIdx: number) => {
    if (quizAnswered !== null) return;
    setQuizAnswered(optionIdx);
    const q = BANCO_QUIZ[quizIdx];
    if (optionIdx === q.correcta) {
      sfx.success();
      setQuizScore((s) => s + 1);
      toast.success("¡Respuesta Correcta!", { description: "+10 XP por verificación táctica." });
      addXp(10);
    } else {
      sfx.error();
      toast.error("Respuesta Incorrecta", { description: "Revisa la explicación en la ficha." });
    }
  };

  const nextQuiz = () => {
    if (quizIdx + 1 < BANCO_QUIZ.length) {
      setQuizIdx((i) => i + 1);
      setQuizAnswered(null);
    } else {
      setQuizDone(true);
      addXp(25);
      toast.success("¡Desafío Global Completado!", { description: "+25 XP de bonificación por maestría." });
    }
  };

  const resetQuiz = () => {
    setQuizIdx(0);
    setQuizAnswered(null);
    setQuizScore(0);
    setQuizDone(false);
  };

  useEffect(() => {
    const onAccion = (e: Event) => {
      const d = (e as CustomEvent<{ tab: string; accion: string; idx: number }>).detail;
      if (d?.tab !== "encyclopedia" || d.accion !== "abrir entrada del día") return;
      openDetail(delDia);
    };
    window.addEventListener("vg:sala3d-accion", onAccion);
    return () => window.removeEventListener("vg:sala3d-accion", onAccion);
  }, [delDia, readSet]);

  const catCount = (c: WikiCat) => WIKI_ENTRIES.filter((e) => e.cat === c).length;

  return (
    <div className="space-y-3.5">
      <HeroOro panel="enciclopedia" />

      {/* HEADER DE MANDO ENCICLOPÉDICO */}
      <PanelHeader
        title="CENTRO DE CONOCIMIENTO GLOBAL & ENCICLOPEDIA MUNDIAL"
        subtitle={`${WIKI_ENTRIES.length} dossiers estratégicos · civilizaciones · geografía · economía · ciencia · tratados · energía`}
        icon={<BookOpen className="w-4 h-4 text-cyan-hud" />}
        color="cyan"
        right={
          <div className="font-mono text-[10px] text-muted-foreground flex items-center gap-2">
            <span className="text-cyan-hud font-bold">{readSet.length}/{WIKI_ENTRIES.length} DOMINADOS</span>
            <span>·</span>
            <span className="text-green-hud flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-hud animate-pulse" /> +15 XP / LECTURA
            </span>
          </div>
        }
      />

      {/* BARRA DE VISTAS OPERATIVAS */}
      <div className="flex items-center justify-between gap-2 border border-border/60 bg-secondary/30 p-1.5 rounded-sm flex-wrap">
        <div className="flex items-center gap-1">
          <button
            onClick={() => { sfx.tab(); setModo("catalogo"); }}
            className={cn(
              "px-3 py-1.5 text-xs font-mono uppercase font-bold rounded-sm flex items-center gap-1.5 transition-all",
              modo === "catalogo" ? "bg-cyan-hud/20 text-cyan-hud border border-cyan-hud/60 shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <BookOpen className="w-3.5 h-3.5" /> Fichas ({filtered.length})
          </button>
          <button
            onClick={() => { sfx.tab(); setModo("mapa"); }}
            className={cn(
              "px-3 py-1.5 text-xs font-mono uppercase font-bold rounded-sm flex items-center gap-1.5 transition-all",
              modo === "mapa" ? "bg-amber-hud/20 text-amber border border-amber-hud/60 shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Globe2 className="w-3.5 h-3.5" /> Mapa Interactivo ({entradasGeolocalizadas.length} Puntos)
          </button>
          <button
            onClick={() => { sfx.tab(); setModo("conexiones"); }}
            className={cn(
              "px-3 py-1.5 text-xs font-mono uppercase font-bold rounded-sm flex items-center gap-1.5 transition-all",
              modo === "conexiones" ? "bg-purple-500/20 text-purple-400 border border-purple-500/60 shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Route className="w-3.5 h-3.5" /> Conexiones Intermodulares
          </button>
          <button
            onClick={() => { sfx.tab(); setModo("desafio"); }}
            className={cn(
              "px-3 py-1.5 text-xs font-mono uppercase font-bold rounded-sm flex items-center gap-1.5 transition-all",
              modo === "desafio" ? "bg-green-500/20 text-green-400 border border-green-500/60 shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Award className="w-3.5 h-3.5" /> Desafío Global
          </button>
        </div>

        {/* Buscador Rápido integrado */}
        <div className="relative min-w-[240px] flex-1 max-w-md">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar: Ormuz, TSMC, Sumeria, OTAN, Litio, Egipto..."
            className="w-full bg-background/80 border border-border/70 rounded-sm pl-8 pr-3 py-1.5 text-xs font-mono text-foreground placeholder:text-muted-foreground/60 focus:border-cyan-hud focus:outline-none"
          />
          {q && (
            <button onClick={() => setQ("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* FILTROS POR DISCIPLINA (PILLS) */}
      <div className="flex gap-1.5 flex-wrap items-center overflow-x-auto pb-1 thin-scroll">
        <button
          onClick={() => { sfx.hover(); setCat("TODAS"); }}
          className={cn(
            "px-2.5 py-1 rounded-sm text-[10px] font-mono uppercase border transition-all whitespace-nowrap",
            cat === "TODAS" ? "border-amber-hud text-amber bg-amber-hud/20 font-bold" : "border-border/50 text-muted-foreground hover:border-border"
          )}
        >
          Todas ({WIKI_ENTRIES.length})
        </button>
        {WIKI_CATS.map((c) => {
          const count = catCount(c.cat);
          const active = cat === c.cat;
          return (
            <button
              key={c.cat}
              onClick={() => { sfx.hover(); setCat(c.cat); }}
              title={c.desc}
              className={cn(
                "px-2.5 py-1 rounded-sm text-[10px] font-mono uppercase border transition-all whitespace-nowrap flex items-center gap-1.5",
                active
                  ? "border-cyan-hud text-cyan-hud bg-cyan-hud/20 font-bold shadow-sm"
                  : "border-border/50 text-muted-foreground hover:text-foreground hover:border-border"
              )}
            >
              <span>{c.label}</span>
              <span className={cn("text-[9px] px-1 py-0.2 rounded-full", active ? "bg-cyan-hud text-black font-bold" : "bg-secondary text-muted-foreground")}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ENTRADA DEL DÍA (ROTACIÓN CONSTANTE) */}
      <div className="hud-corner border border-amber-hud/40 bg-amber-hud/5 p-3 relative overflow-hidden" aria-label="Dossier del día">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[9px] font-mono uppercase font-bold tracking-widest text-amber flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber" /> DOSSIER DEL DÍA
            </span>
            <span className="text-xs font-bold font-mono uppercase text-foreground">{delDia.title}</span>
            <span className="text-[10px] font-mono text-muted-foreground">· {delDia.subtitle} · {delDia.region}</span>
          </div>
          <button
            onClick={() => openDetail(delDia)}
            className="text-[10px] font-mono uppercase font-bold px-2.5 py-1 border border-amber-hud bg-amber-hud/20 text-amber hover:bg-amber-hud/30 transition-all rounded-sm flex items-center gap-1"
          >
            Abrir Dossier →
          </button>
        </div>
        <p className="text-[11px] text-muted-foreground leading-snug mt-1.5 line-clamp-2">
          {delDia.desc.split("\n\n")[0]}
        </p>
        <div className="flex items-center gap-2 flex-wrap mt-2">
          <span className="text-[8px] font-mono uppercase px-1.5 py-0.5 border border-amber-hud/50 text-amber bg-background">
            {delDia.cat}
          </span>
          {delDia.stats.slice(0, 3).map((s) => (
            <span key={s.label} className="text-[8px] font-mono uppercase px-1.5 py-0.5 border border-border bg-background text-muted-foreground">
              {s.label}: <strong className="text-foreground">{s.value}</strong>
            </span>
          ))}
          <span className="ml-auto text-[9px] font-mono uppercase" style={{ color: readSet.includes(delDia.id) ? "#3DDC84" : undefined }}>
            {readSet.includes(delDia.id) ? "✓ Estudiado (+15 XP registrados)" : "★ Sin estudiar · +15 XP disponibles"}
          </span>
        </div>
      </div>

      {/* VISTA 1: CATÁLOGO DE FICHAS */}
      {modo === "catalogo" && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {filtered.map((e) => {
            const isRead = readSet.includes(e.id);
            return (
              <motion.button
                key={e.id}
                layout
                onClick={() => openDetail(e)}
                whileHover={{ y: -2 }}
                className={cn(
                  "hud-corner border text-left transition-all overflow-hidden relative group flex flex-col justify-between",
                  isRead ? "border-border/60 bg-secondary/15 hover:border-cyan-hud/50" : "border-border/80 bg-secondary/25 hover:border-amber-hud/70 shadow-sm"
                )}
              >
                <div>
                  <div className="relative h-32 bg-secondary/40 overflow-hidden">
                    {e.img ? (
                      <img
                        src={e.img}
                        alt={e.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/40 bg-gradient-to-b from-secondary/50 to-background">
                        <Globe2 className="w-10 h-10 mb-1" />
                        <span className="text-[8px] font-mono uppercase tracking-widest">{e.cat}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />

                    <span className="absolute top-2 left-2 px-1.5 py-0.5 text-[8px] font-mono font-bold uppercase tracking-widest bg-background/90 text-amber border border-amber-hud/50 rounded-sm">
                      {e.id === delDia.id ? "★ " : ""}{e.cat.replace("_", " ")}
                    </span>

                    {e.coordenadas && (
                      <span className="absolute bottom-2 left-2 px-1.5 py-0.5 text-[8px] font-mono bg-background/80 text-cyan-hud border border-cyan-hud/40 rounded-sm flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5" /> GEO
                      </span>
                    )}

                    {isRead ? (
                      <span className="absolute top-2 right-2 px-1.5 py-0.5 text-[8px] font-mono bg-green-500/20 text-green-400 border border-green-500/40 rounded-sm font-bold flex items-center gap-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5" /> LEÍDO
                      </span>
                    ) : (
                      <span className="absolute top-2 right-2 px-1.5 py-0.5 text-[8px] font-mono bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded-sm font-bold">
                        +15 XP
                      </span>
                    )}
                  </div>

                  <div className="p-3 space-y-1.5">
                    <div className="font-mono text-xs font-bold text-foreground leading-snug group-hover:text-cyan-hud transition-colors">
                      {e.title}
                    </div>
                    <div className="text-[10px] font-mono text-muted-foreground truncate">
                      {e.subtitle}
                    </div>
                    <div className="text-[9px] font-mono text-muted-foreground/70 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" /> {e.dates} · {e.region}
                    </div>

                    <p className="text-[10px] text-foreground/80 line-clamp-2 leading-relaxed pt-1">
                      {e.desc.split("\n\n")[0]}
                    </p>
                  </div>
                </div>

                {/* Pie de tarjeta con conexiones */}
                <div className="p-3 pt-0 border-t border-border/30 mt-2 flex items-center justify-between text-[9px] font-mono text-muted-foreground">
                  <span className="text-cyan-hud/80 flex items-center gap-1">
                    {e.conexionesModulos?.length ? `${e.conexionesModulos.length} enlaces` : "Dossier"}
                  </span>
                  <span className="text-amber flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                    Explorar <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}

      {/* VISTA 2: MAPA INTERACTIVO GLOBAL */}
      {modo === "mapa" && (
        <div className="hud-corner border border-border/80 bg-secondary/20 p-3 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="font-mono text-xs font-bold text-foreground uppercase tracking-widest flex items-center gap-1.5">
                <Globe2 className="w-4 h-4 text-cyan-hud" /> Planisferio Interactivo del Conocimiento
              </h3>
              <p className="text-[10px] font-mono text-muted-foreground">
                Proyección cartográfica de los puntos estratégicos mundiales. Haz clic en cualquier marcador para abrir el dossier completo.
              </p>
            </div>
            <div className="flex items-center gap-2 font-mono text-[9px]">
              <span className="flex items-center gap-1 text-cyan-hud"><span className="w-2 h-2 rounded-full bg-cyan-hud" /> Geografía & Chokepoints</span>
              <span className="flex items-center gap-1 text-amber"><span className="w-2 h-2 rounded-full bg-amber" /> Civilizaciones</span>
              <span className="flex items-center gap-1 text-purple-400"><span className="w-2 h-2 rounded-full bg-purple-400" /> Potencias</span>
            </div>
          </div>

          <div className="relative border border-border/60 rounded bg-[#060a0f] overflow-hidden">
            <svg viewBox="0 0 1000 500" className="w-full h-auto block" role="img" aria-label="Mapa mundial de conocimiento">
              <path d={worldPaths.graticulePath} fill="none" stroke="#1a2a3a" strokeWidth="0.5" />
              <path d={worldPaths.landPath} fill="#0e1a24" stroke="#2a4a5a" strokeWidth="0.6" />
              <path d={worldPaths.borderPath} fill="none" stroke="#1e3446" strokeWidth="0.5" />

              {/* Pines interactivos sobre el planisferio */}
              {entradasGeolocalizadas.map(({ entry, xy }) => {
                const color =
                  entry.cat === "GEOGRAFIA" ? "#00F0FF" :
                  entry.cat === "CIVILIZACIONES" ? "#F5C542" :
                  entry.cat === "PAISES_HISTORIA" ? "#C9A0FF" :
                  entry.cat === "ORGANIZACIONES" ? "#3DDC84" : "#FF5E7E";

                return (
                  <g
                    key={entry.id}
                    className="cursor-pointer group"
                    onClick={() => openDetail(entry)}
                  >
                    <circle cx={xy.x} cy={xy.y} r="5" fill={color} fillOpacity="0.4" className="animate-ping" />
                    <circle cx={xy.x} cy={xy.y} r="3.5" fill={color} stroke="#000" strokeWidth="0.8" />
                    <text
                      x={xy.x}
                      y={xy.y - 7}
                      fontSize="8"
                      fill="#fff"
                      fontFamily="monospace"
                      fontWeight="bold"
                      textAnchor="middle"
                      className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 px-1 py-0.5"
                    >
                      {entry.title.split(":")[0]}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-2 pt-1">
            {entradasGeolocalizadas.slice(0, 8).map(({ entry }) => (
              <button
                key={entry.id}
                onClick={() => openDetail(entry)}
                className="p-2 border border-border/50 bg-background/60 rounded text-left hover:border-cyan-hud transition-colors flex items-center justify-between"
              >
                <div className="truncate">
                  <div className="font-mono text-[10px] font-bold text-foreground truncate">{entry.title.split(":")[0]}</div>
                  <div className="font-mono text-[8px] text-muted-foreground">{entry.cat}</div>
                </div>
                <ChevronRight className="w-3 h-3 text-cyan-hud shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* VISTA 3: MATRIZ DE CONEXIONES INTERMODULARES */}
      {modo === "conexiones" && (
        <div className="hud-corner border border-border/80 bg-secondary/20 p-4 space-y-4">
          <div>
            <h3 className="font-mono text-xs font-bold text-foreground uppercase tracking-widest flex items-center gap-1.5">
              <Route className="w-4 h-4 text-purple-400" /> Matriz de Interconexión del Conocimiento
            </h3>
            <p className="text-[10px] font-mono text-muted-foreground">
              Vanguard no aísla el saber: cada dossier se conecta orgánicamente con simuladores, radares de potencias, mercados y archivos de inteligencia.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { id: "atlas", titulo: "ATLAS MUNDIAL", desc: "84 naciones soberanas, capitales, husos horarios vivos y 78 figuras clave de poder en el planeta.", icon: <Compass className="w-4 h-4 text-cyan-hud" />, color: "cyan" },
              { id: "paises", titulo: "CENTRO DE PAÍSES & RADAR", desc: "24 potencias mundiales con radar de 6 ejes, presupuestos de defensa y balanza bilateral.", icon: <Globe2 className="w-4 h-4 text-amber" />, color: "amber" },
              { id: "wikiguerra", titulo: "WIKIGUERRA", desc: "Enciclopedia profunda de las batallas, operaciones tácticas y doctrinas bélicas de la historia.", icon: <Shield className="w-4 h-4 text-red-400" />, color: "red" },
              { id: "salaguerra", titulo: "SALA DE GUERRA TÁCTICA", desc: "Monitoreo en tiempo real de frentes activos, despliegues navales y alerta temprana nuclear.", icon: <Flame className="w-4 h-4 text-orange-400" />, color: "orange" },
              { id: "mercados", titulo: "MERCADOS & ENERGÍA", desc: "Cotizaciones en vivo del crudo Brent/WTI, gas TTF, metales críticos, bonos soberanos e inflación.", icon: <Coins className="w-4 h-4 text-green-400" />, color: "green" },
              { id: "geoint", titulo: "INTELIGENCIA GEOESPACIAL", desc: "Observación orbital por satélite, cuencas hídricas, radares SAR y análisis de infraestructuras.", icon: <Building2 className="w-4 h-4 text-blue-400" />, color: "blue" },
            ].map((m) => (
              <div key={m.id} className="border border-border/60 bg-background/80 p-3 rounded flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    {m.icon}
                    <h4 className="font-mono text-xs font-bold text-foreground">{m.titulo}</h4>
                  </div>
                  <p className="text-[10px] font-mono text-muted-foreground leading-relaxed">{m.desc}</p>
                </div>
                <Button
                  onClick={() => navigateToModule(m.id, m.titulo)}
                  className="mt-3 w-full text-[10px] font-mono uppercase bg-secondary hover:bg-secondary/80 text-foreground border border-border/80 h-7"
                >
                  Abrir Módulo →
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VISTA 4: DESAFÍO GLOBAL DE CONOCIMIENTO */}
      {modo === "desafio" && (
        <div className="hud-corner border border-green-500/40 bg-secondary/20 p-4 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2 border-b border-border/50 pb-3">
            <div>
              <h3 className="font-mono text-xs font-bold text-foreground uppercase tracking-widest flex items-center gap-1.5">
                <Award className="w-4 h-4 text-green-400" /> Desafío de Inteligencia y Conocimiento
              </h3>
              <p className="text-[10px] font-mono text-muted-foreground">
                Comprueba tu maestría táctica en historia, geopolítica, energía y civilizaciones. +10 XP por acierto.
              </p>
            </div>
            <div className="font-mono text-xs font-bold text-green-400 border border-green-500/40 px-2.5 py-1 rounded bg-green-500/10">
              ACIERTOS: {quizScore} / {BANCO_QUIZ.length}
            </div>
          </div>

          {!quizDone ? (
            <div className="space-y-4 max-w-xl mx-auto py-2">
              <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                <span className="uppercase text-cyan-hud font-bold">{BANCO_QUIZ[quizIdx].disciplina}</span>
                <span>Pregunta {quizIdx + 1} de {BANCO_QUIZ.length}</span>
              </div>

              <div className="font-mono text-sm font-bold text-foreground leading-snug p-3 bg-background border border-border/70 rounded">
                {BANCO_QUIZ[quizIdx].pregunta}
              </div>

              <div className="grid gap-2">
                {BANCO_QUIZ[quizIdx].opciones.map((opt, i) => {
                  let estilo = "border-border/60 bg-secondary/30 hover:border-cyan-hud/60";
                  if (quizAnswered !== null) {
                    if (i === BANCO_QUIZ[quizIdx].correcta) {
                      estilo = "border-green-500 bg-green-500/20 text-green-400 font-bold";
                    } else if (i === quizAnswered) {
                      estilo = "border-red-500 bg-red-500/20 text-red-400";
                    } else {
                      estilo = "border-border/30 opacity-50";
                    }
                  }

                  return (
                    <button
                      key={i}
                      disabled={quizAnswered !== null}
                      onClick={() => answerQuiz(i)}
                      className={cn(
                        "p-3 rounded text-left font-mono text-xs border transition-all flex items-center justify-between",
                        estilo
                      )}
                    >
                      <span>{opt}</span>
                      {quizAnswered !== null && i === BANCO_QUIZ[quizIdx].correcta && (
                        <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {quizAnswered !== null && (
                <div className="p-3 bg-secondary/50 border border-border/80 rounded space-y-2 animate-fadeIn">
                  <p className="text-[11px] font-mono text-foreground/90 leading-relaxed">
                    💡 <strong className="text-cyan-hud">Explicación Táctica:</strong> {BANCO_QUIZ[quizIdx].explicacion}
                  </p>
                  <Button
                    onClick={nextQuiz}
                    className="w-full font-mono text-xs uppercase bg-cyan-hud text-black font-bold hover:bg-cyan-hud/90 h-8"
                  >
                    {quizIdx + 1 < BANCO_QUIZ.length ? "Siguiente Pregunta →" : "Ver Resultados Finales →"}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 space-y-4 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-500 mx-auto flex items-center justify-center text-green-400">
                <Award className="w-8 h-8" />
              </div>
              <h4 className="font-mono text-lg font-bold text-foreground">¡DESAFÍO COMPLETADO!</h4>
              <p className="text-xs font-mono text-muted-foreground">
                Puntuación final: <strong className="text-green-400">{quizScore} de {BANCO_QUIZ.length}</strong> respuestas correctas.
              </p>
              <Button
                onClick={resetQuiz}
                className="font-mono text-xs uppercase bg-secondary border border-border/80 text-foreground hover:bg-secondary/80"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Reintentar Desafío
              </Button>
            </div>
          )}
        </div>
      )}

      {/* MODAL DETALLE EXHAUSTIVO (FICHA DE CONOCIMIENTO) */}
      <AnimatePresence>
        {detail && (
          <div
            className="fixed inset-0 z-50 bg-background/90 flex items-center justify-center p-3"
            onClick={() => setDetail(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="hud-corner border border-amber-hud bg-background max-w-2xl w-full max-h-[90vh] overflow-y-auto thin-scroll shadow-2xl"
              onClick={(ev) => ev.stopPropagation()}
            >
              {/* IMAGEN DE PORTADA / ENCABEZADO */}
              <div className="relative h-48 bg-secondary/40">
                {detail.img ? (
                  <img src={detail.img} alt={detail.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground/40 bg-gradient-to-b from-secondary to-background">
                    <Globe2 className="w-12 h-12" />
                  </div>
                )}
                <button
                  onClick={() => setDetail(null)}
                  className="absolute top-2.5 right-2.5 p-1.5 bg-background/80 hover:bg-background border border-border rounded-sm transition-all"
                >
                  <X className="w-4 h-4 text-foreground" />
                </button>
                <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-widest bg-background/90 text-amber border border-amber-hud/60 rounded-sm">
                  {detail.cat.replace("_", " ")}
                </span>
                {detail.coordenadas && (
                  <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 text-[9px] font-mono bg-background/90 text-cyan-hud border border-cyan-hud/60 rounded-sm flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {detail.coordenadas.lat.toFixed(2)}°, {detail.coordenadas.lng.toFixed(2)}°
                  </span>
                )}
              </div>

              {/* CUERPO PRINCIPAL DEL DOSSIER */}
              <div className="p-4 space-y-4">
                <div>
                  <h3 className="font-mono text-lg font-bold text-foreground leading-tight">{detail.title}</h3>
                  <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
                    {detail.subtitle} · {detail.dates} · {detail.region}
                  </p>
                </div>

                {/* CONTEXTO GEOGRÁFICO */}
                {detail.mapaContexto && (
                  <div className="p-2.5 bg-cyan-hud/10 border border-cyan-hud/30 rounded text-xs font-mono text-foreground/90 flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-cyan-hud shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-cyan-hud uppercase text-[9px] block">Contexto Geoestratégico:</strong>
                      <span>{detail.mapaContexto}</span>
                    </div>
                  </div>
                )}

                {/* ESTADÍSTICAS ESTRUCTURADAS */}
                <div className="grid grid-cols-2 gap-2">
                  {detail.stats.map((s) => (
                    <div key={s.label} className="border border-border/60 bg-secondary/20 p-2 rounded">
                      <div className="text-[8px] font-mono text-muted-foreground uppercase">{s.label}</div>
                      <div className="text-xs font-mono font-bold text-foreground">{s.value}</div>
                    </div>
                  ))}
                </div>

                {/* TEXTO DESCRIPTIVO RIGUROSO */}
                <div className="text-xs text-foreground/90 leading-relaxed space-y-2 border-t border-b border-border/40 py-3">
                  {detail.desc.split("\n\n").map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>

                {/* DATOS CLAVE TABULADOS */}
                {detail.datosClave && detail.datosClave.length > 0 && (
                  <div>
                    <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-hud mb-2 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5" /> Indicadores & Impacto Global Verificado
                    </div>
                    <div className="space-y-1.5">
                      {detail.datosClave.map((dc, i) => (
                        <div key={i} className="p-2 border border-border/50 bg-secondary/15 rounded flex items-start justify-between gap-3 text-[11px] font-mono">
                          <div>
                            <span className="text-foreground font-bold">{dc.indicador}:</span>{" "}
                            <span className="text-cyan-hud font-bold">{dc.valor}</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground text-right">{dc.impactoGlobal}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* CRONOLOGÍA DE HITOS */}
                <div>
                  <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber mb-2 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Cronología Táctica
                  </div>
                  <div className="space-y-1.5">
                    {detail.timeline.map((t, i) => (
                      <div key={i} className="flex gap-2.5 text-[11px] font-mono">
                        <span className="text-cyan-hud font-bold whitespace-nowrap min-w-[75px]">{t.year}</span>
                        <span className="text-foreground/85">{t.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* HECHOS Y SECRETOS ESTRATÉGICOS */}
                <div>
                  <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber mb-2 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Hechos Clave & Secretos Estratégicos
                  </div>
                  <ul className="space-y-1.5">
                    {detail.facts.map((f, i) => (
                      <li key={i} className="text-[11px] font-mono text-foreground/80 flex gap-2">
                        <span className="text-amber">▸</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CONEXIONES CON OTROS MÓDULOS DE VANGUARD */}
                {detail.conexionesModulos && detail.conexionesModulos.length > 0 && (
                  <div className="border border-purple-500/30 bg-purple-500/5 p-3 rounded space-y-2">
                    <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-purple-400 flex items-center gap-1">
                      <Route className="w-3.5 h-3.5" /> Conexiones Vivas en Vanguard
                    </div>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {detail.conexionesModulos.map((cm, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setDetail(null);
                            navigateToModule(cm.modulo, cm.label);
                          }}
                          className="p-2 border border-purple-500/40 bg-background/80 hover:bg-purple-500/20 text-left rounded transition-all group"
                        >
                          <div className="font-mono text-[10px] font-bold text-foreground group-hover:text-purple-300 flex items-center justify-between">
                            <span>{cm.label}</span>
                            <ChevronRight className="w-3 h-3 text-purple-400 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                          <div className="font-mono text-[8px] text-muted-foreground mt-0.5">{cm.explicacion}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* WIKIPEDIA EN VIVO (API PROXY) */}
                <div className="border-t border-border/40 pt-3">
                  {liveLoading ? (
                    <div className="text-[11px] font-mono text-muted-foreground animate-pulse flex items-center gap-2">
                      <Globe2 className="w-3.5 h-3.5 text-cyan-hud animate-spin" />
                      Consultando la API de Wikipedia en tiempo real...
                    </div>
                  ) : live ? (
                    <div className="border border-cyan-hud/40 bg-cyan-hud/10 p-3 rounded">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[9px] font-mono font-bold uppercase text-cyan-hud tracking-widest flex items-center gap-1">
                          <Globe2 className="w-3 h-3" /> WIKIPEDIA EN VIVO
                        </span>
                        {live.url && (
                          <a
                            href={live.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] font-mono text-cyan-hud flex items-center gap-1 hover:underline"
                          >
                            abrir fuente original <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      {live.thumbnail && (
                        <img
                          src={live.thumbnail}
                          alt={live.title}
                          className="w-20 h-20 object-cover float-right ml-2 mb-1 border border-cyan-hud/40 rounded"
                        />
                      )}
                      <p className="text-[11px] text-foreground/85 leading-relaxed">{live.extract}</p>
                    </div>
                  ) : (
                    <Button
                      onClick={() => fetchLive(detail)}
                      className="w-full font-mono text-[11px] uppercase tracking-widest bg-cyan-hud/20 border border-cyan-hud text-cyan-hud hover:bg-cyan-hud/30"
                    >
                      <Globe2 className="w-3.5 h-3.5 mr-1.5" /> Contrastar con Wikipedia en Vivo (/api/wiki)
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
