"use client";

// Vanguard v14 — INICIO: portada rediseñada.
// 1) NOTICIAS EN PRIMERA FILA (lo primero que se ve al entrar).
// 2) Menú llamativo: tarjetas gigantes de los mundos principales.
// 3) Tensión mundial en vivo + reloj + estado del agente.
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Castle, Radar, Rocket, Swords, Joystick, Fingerprint, Coins, TrendingUp,
  Newspaper, ChevronRight, Menu, Zap, ShieldAlert, Gift, BookOpen,
  SignalHigh,
  Radio, Users, Scale, Flame, Laugh, Palette, Crosshair, MonitorPlay,
  Wand2, Landmark, FolderOpen, Skull, Earth, Search, Network, History, Images,
  Brain, FlaskConical, RefreshCw, GraduationCap, Share2, Hammer, Bot, Crown, Compass, Siren,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { LaunchCountdown } from "@/components/vanguard/launch-countdown";
import { useGameStore } from "@/lib/game-store";
import { getRealtime } from "@/lib/realtime";
import { CONFLICTS } from "@/lib/game-data";
import { navigateTo, openMainMenu } from "@/lib/nav";
import { ManifiestoMundo } from "@/components/vanguard/panels/empleos-panel";
import type { TabKey } from "@/components/vanguard/tab-nav";
// v110.0 MATRIZ 2100 — escenas 3D procedurales (nada plano, nada IA)
import { Escena3D, escenaDePanel, hashDe } from "@/components/vanguard/escenas-3d";
// v116.0 MEGALÓPOLIS — SALA DE LECTURA: los cables se leen DENTRO de Vanguard
import { LectorNoticia, type CableLectura } from "@/components/vanguard/lector-noticia";
// v116.0 — portada 3D viva para el héroe (adiós al <img> plano)
import { PortadaNoticia } from "@/components/vanguard/portada-noticia";
import dynamic from "next/dynamic";
// v191.0 EL ESTRENO — portadas vivas seleccionables + cinemática legal
import { PortadasInicio } from "@/components/vanguard/portadas-inicio";
// v193.0 LA CASA LIGERA — la cinemática viaja en su propio chunk: baja solo
// cuando se va a estrenar (jamás durante la carga, ley v192 intacta)
const CinematicaVanguard = dynamic(() => import("@/components/vanguard/cinematica-vanguard").then((m) => m.CinematicaVanguard), { ssr: false });
// v193.1 VIGO Y LA PUERTA — el personaje de la casa pregunta qué te importa
// y te lleva a tu sala en un toque (la elección queda en TU aparato)
import { PuertaVigo } from "@/components/vanguard/puerta-vigo";
// v195.0 TU LADO — el muelle de atajos que aprende tu uso
import { AtajosVanguard } from "@/components/vanguard/atajos-vanguard";

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

const TAG_HEX: Record<string, string> = {
  ALERTA: "#FF3B30",
  DIPLOMACIA: "#38BDF8",
  ECONOMIA: "#E8C56A",
  HUMANITARIO: "#A855F7",
  ANALISIS: "#3DDC97",
  INFO: "#8A90A8",
};

interface WorldTile {
  tab: TabKey;
  title: string;
  desc: string;
  icon: React.ReactNode;
  hex: string;
}

// ====== MENÚ LLAMATIVO: los mundos principales ======
const WORLD_TILES: WorldTile[] = [
  // v172.0 LA AGENCIA CENTRAL — el CENTRO MUNDIAL abre el muro: la missión
  // del Dueño (el mayor centro de noticias, en vivo por impacto + mapa 3D)
  { tab: "centro", title: "CENTRO MUNDIAL DE NOTICIAS", desc: "El mayor centro de noticias del mundo: en vivo POR IMPORTANCIA E IMPACTO, cada cable con su pie de foto e información, y EL MAPA MUNDIAL 3D en primera persona con gráficos de guerra", icon: <Siren className="w-6 h-6" />, hex: "#FF3B30" },
  // v115.0 SINGULARIDAD — el 16º mundo abre el muro: el agente autónomo
  { tab: "arquitecto", title: "ARQUITECTO", desc: "El agente autónomo de Vanguard: se promptea a sí mismo y trabaja sin fin — instala módulos funcionales, compone obras para la radio, firma doctrinas, vigila el frente y nunca se detiene (con o sin tu ayuda)", icon: <Bot className="w-6 h-6" />, hex: "#00FFA3" },
  // v113.0 LETRAS VIVAS — la página de los imposibles
  { tab: "experimental", title: "EXPERIMENTAL", desc: "La página de los imposibles: escribe y mira tus palabras volverse letras 3D de verdad — forja de letras, órbita de palabras y lluvia de letras, todo en vivo y sin imágenes", icon: <FlaskConical className="w-6 h-6" />, hex: "#FF5EDB" },
  // v105.0 LA REDACCIÓN — lo primero del muro: el lugar para LEER el mundo
  { tab: "redaccion", title: "LA REDACCIÓN", desc: "El lugar optimizado para leer el mundo: noticias reales con resumen, el ¿POR QUÉ IMPORTA? de cada pieza, investigación en vivo con fuentes citadas y modo lectura sin interrupciones", icon: <Newspaper className="w-6 h-6" />, hex: "#FFC94D" },
  // v97.0 PANTALLA TOTAL: la plataforma de video de Vanguard abre el muro
  { tab: "pantalla", title: "VANGUARD TV", desc: "El mundo en pases verticales: cámaras en vivo, informes OSINT, explicadores y crónicas — doble tap, suscripciones y sala de proyección", icon: <MonitorPlay className="w-6 h-6" />, hex: "#FFC94D" },
  // v98.0 ORO TOTAL: la búsqueda visual de fotos reales
  { tab: "imagenes", title: "IMÁGENES DE VANGUARD", desc: "La búsqueda visual de la plataforma: fotos reales de lugares estratégicos, sedes del poder, archivo desclasificado, armas históricas y civilizaciones perdidas", icon: <Images className="w-6 h-6" />, hex: "#7FE3FF" },
  // v99.0 MENTE VIVA: el cerebro central — Vanguard se actualiza sola
  { tab: "mente", title: "LA MENTE DE VANGUARD", desc: "El cerebro central de IA: el mundo avanza en pulsos de 5 minutos y ella lo cuenta — habla con ella, pégale un titular y te firma el expediente con proyección", icon: <Brain className="w-6 h-6" />, hex: "#BEF264" },
  // v100.0 LABORATORIO DEL DESTINO: ¿y si...? conectado al Espejo
  { tab: "laboratorio", title: "LABORATORIO DEL DESTINO", desc: "¿Y SI...? Elige una crisis del Espejo, aplica la perturbación con su dosis y mira la guerra moverse día a día: logística, moral, escalada y Monte Carlo de 24 mundos — simulación, no predicción", icon: <FlaskConical className="w-6 h-6" />, hex: "#38BDF8" },
  // v101.0 EL REGRESO — los tres pilares de retención en el muro
  { tab: "cambios", title: "EL MUNDO CAMBIA", desc: "Tu informe de regreso: qué cambió desde tu última visita — pulsos del mundo, noticias reales con su fuente y fecha, y todo lo que rotó hoy. Que nunca sea la misma página de ayer", icon: <RefreshCw className="w-6 h-6" />, hex: "#F5C542" },
  { tab: "analista", title: "PERFIL DE ANALISTA", desc: "Tu progresión con sentido: nivel de analista, 14 insignias que cuentan lo que hiciste, retos semanales de investigación y ELO. Todo computado de acciones reales", icon: <GraduationCap className="w-6 h-6" />, hex: "#FFD166" },
  { tab: "escenarios", title: "GALERÍA DEL DESTINO", desc: "La comunidad comparte sus escenarios ¿Y SI...? del Laboratorio: explóralos corriendo la simulación, coméntalos y MEJÓRALOS con un remix — la gente crea y participa", icon: <Share2 className="w-6 h-6" />, hex: "#FFC94D" },
  // v102.0 LA CIUDADELA — el taller de juegos abre en el muro
  { tab: "taller", title: "TALLER DE JUEGOS", desc: "Crea juegos SIN código con tres motores (quiz, ordena la historia, verdad o mentira), publícalos firmados con tu pasaporte y juega a los de la comunidad en el arcade de la Ciudadela", icon: <Hammer className="w-6 h-6" />, hex: "#FFC94D" },
  // v103.0 MODO AGENTE — la IA que crea dentro de Vanguard
  { tab: "agenteia", title: "MODO AGENTE", desc: "La mente de Vanguard, superpotente: acepta una misión y la ejecuta EN DIRECTO — investiga el frente, abre expedientes reales desclasificados, corre el motor del Laboratorio y PUBLICA su obra firmada: juegos al arcade, escenarios a la Galería, informes con fuentes", icon: <Bot className="w-6 h-6" />, hex: "#BEF264" },
  // v104.0 LA VITRINA — el muro de obras de la comunidad
  { tab: "obras", title: "MURO DE OBRAS", desc: "La vitrina de la comunidad: un muro con TODO lo que la gente crea — juegos, escenarios, encuestas, música, periódicos — con Paseo de la Fama, señales de tus obras y el agente que evalúa cada pieza", icon: <Crown className="w-6 h-6" />, hex: "#FFC94D" },
  { tab: "foryou", title: "PARA TI", desc: "El feed de la comunidad: videos, música y stickers de los jugadores en scroll infinito — como TikTok, pero de guerra", icon: <Flame className="w-6 h-6" />, hex: "#FF3B30" },
  // v195.0 TU LADO — la pregunta de la casa y las redes oficiales
  { tab: "lados", title: "¿DE QUÉ LADO ESTÁS?", desc: "Declara tu bando en los problemas del mundo: el pueblo se parte en % vivo, apuesta por tu lado con cuotas honestas y al cierre EL MUNDO DECIDE", icon: <Scale className="w-6 h-6" />, hex: "#FF4D5E" },
  { tab: "redes", title: "REDES DE VANGUARD", desc: "La casa en el mundo: Telegram oficial vivo, 8 canales más en camino y comparte Vanguard con enlaces reales — +5 monedas por traer gente", icon: <Share2 className="w-6 h-6" />, hex: "#38BDF8" },
  { tab: "mundo", title: "MUNDO DE GUERRA", desc: "Conquista los 24 territorios en el globo 3D contra 3 IA", icon: <Castle className="w-6 h-6" />, hex: "#FF3B30" },
  { tab: "bookmaker", title: "BETNACIÓN", desc: "Cuotas vivas, combinadas y cashout como una casa real", icon: <Coins className="w-6 h-6" />, hex: "#3DDC97" },
  { tab: "bolsa", title: "BOLSA GEOPOLÍTICA", desc: "Invierte en monedas de países: gana o pierde al instante", icon: <TrendingUp className="w-6 h-6" />, hex: "#E8C56A" },
  { tab: "osint", title: "SALA OSINT 3D", desc: "15 capas de inteligencia sobre un globo interactivo", icon: <Radar className="w-6 h-6" />, hex: "#38BDF8" },
  // v94.0 GOOGLES TOTAL: Vanguard como el Google de los problemas geopolíticos
  { tab: "googles", title: "GOOGLES DE VANGUARD", desc: "El Google de los problemas geopolíticos: buscador de todo el mundo Vanguard, tendencias, traductor de 8 idiomas, noticias, académico y alertas", icon: <Search className="w-6 h-6" />, hex: "#FFC94D" },
  // v95.0 EXPEDIENTE TOTAL: el grafo y la máquina del tiempo
  { tab: "grafo", title: "GRAFO MUNDIAL", desc: "La red del conocimiento geopolítico: 150+ entidades del mundo Vanguard conectadas por conflicto, alianza, comercio y ruta, con ficha y veredicto neuronal", icon: <Network className="w-6 h-6" />, hex: "#3DDCFF" },
  { tab: "maquina", title: "MÁQUINA DEL TIEMPO", desc: "Viaja por la historia de cada crisis: el frente del Karsk en vivo día a día, capítulos de Vand, Zenit y Sarn, y cronologías reales del archivo", icon: <History className="w-6 h-6" />, hex: "#FFC94D" },
  // v93.0 VANGUARD EARTH: el googles de Vanguard
  { tab: "tierra", title: "VANGUARD EARTH", desc: "El googles de Vanguard: satélite espía con contactos en vivo, sensores 1-7, cockpit y vuelo cinematográfico por todo el planeta", icon: <Earth className="w-6 h-6" />, hex: "#FFB347" },
  // v57 ARCHIVO SECRETO: expedientes desclasificados coleccionables
  { tab: "expedientes", title: "ARCHIVO SECRETO", desc: "Expedientes desclasificados del FBI, CIA y NARA: ábrelos todos y súbele al rango OJO DE DIOS", icon: <FolderOpen className="w-6 h-6" />, hex: "#A855F7" },
  // v59 ALEJANDRÍA OSCURA: biblioteca geopolítica del miedo · v60: 43 entradas + QUIZ · v61: 49 preguntas, interrogatorio 60s y tablón de eruditos
  { tab: "oscura", title: "ALEJANDRÍA OSCURA", desc: "43 entradas prohibidas: teorías con veredicto real, armas, civilizaciones, documentos desclasificados, QUIZ diario, interrogatorio de 60s y racha con botín", icon: <Skull className="w-6 h-6" />, hex: "#FF3B30" },
  { tab: "detective", title: "ARCHIVOS NACIÓN", desc: "Resuelve casos históricos con pistas y engaños", icon: <Fingerprint className="w-6 h-6" />, hex: "#A855F7" },
  { tab: "dron", title: "DRON STRIKE 3D", desc: "Vuela el dron, marca objetivos y multiplica combos", icon: <Rocket className="w-6 h-6" />, hex: "#FF3B30" },
  { tab: "warsim", title: "SIMULADOR DE GUERRAS", desc: "Cualquier país contra cualquier país, en segundos", icon: <Swords className="w-6 h-6" />, hex: "#FF6B4A" },
  { tab: "envivo", title: "EN VIVO MUNDIAL", desc: "Noticias reales 24/7 + streams de la comunidad con donaciones", icon: <Radio className="w-6 h-6" />, hex: "#FF3B30" },
  { tab: "contribuidores", title: "CONTRIBUIDORES", desc: "7 trabajos remunerados: reporta, escribe, verifica, traduce y gana", icon: <Users className="w-6 h-6" />, hex: "#3DDC97" },
  { tab: "memes", title: "ESTUDIO DE MEMES", desc: "Diseña tu meme geopolítico con 251 países personajes — publícalo y gana", icon: <Laugh className="w-6 h-6" />, hex: "#A855F7" },
  { tab: "creador", title: "ESTUDIO COMUNITARIO", desc: "Sube TU contenido: personajes, armas, juegos, música, noticias y encuestas — la IA modera", icon: <Palette className="w-6 h-6" />, hex: "#A855F7" },
  { tab: "studios", title: "ESTUDIOS CREADORES", desc: "Un estudio para cada sección: noticias con fotos, banderas propias, mapas con flechas, música compuesta in-page, stickers y muro social", icon: <Wand2 className="w-6 h-6" />, hex: "#22D3EE" },
  { tab: "gobierno", title: "GOBIERNO MUNDIAL", desc: "El embajador electo toma el poder: decretos presidenciales, ministros, reclutamiento y poder político por país", icon: <Landmark className="w-6 h-6" />, hex: "#FFD166" },
  { tab: "bolsamonedas", title: "BOLSA DE MONEDAS", desc: "Funda tu propia moneda con ticker y supply — el mercado la cotiza y los jugadores mueven el precio", icon: <Coins className="w-6 h-6" />, hex: "#34C77B" },
  { tab: "armeria", title: "ARMERÍA REAL", desc: "Fotos reales de las armas del conflicto: función, ficha técnica y armado pieza por pieza", icon: <Crosshair className="w-6 h-6" />, hex: "#FF3B30" },
  { tab: "abusos", title: "VERDAD CRUDA", desc: "Crímenes y abusos documentados con fuentes ONU · el lado que prefieren ocultar", icon: <Scale className="w-6 h-6" />, hex: "#FF3B30" },
  { tab: "memorial", title: "MEMORIAL \u2020", desc: "Los que documentaron y cayeron: enciende tu vela por ellos", icon: <Flame className="w-6 h-6" />, hex: "#A855F7" },
  { tab: "arcade", title: "ARCADE", desc: "10 minijuegos con premios en monedas y récords — nuevo RADAR FURIA", icon: <Joystick className="w-6 h-6" />, hex: "#FFD166" },
];

// v75 PLANETA VIVO: portada cinematográfica única por tile — imagen primero,
// con movimiento Ken Burns y colores fuertes (regla de oro del comandante).
// v110.0 MATRIZ 2100: las 30 imágenes planas IA JUBILADAS — cada tile nace
// con su ESCENA 3D procedural (escenaDePanel) que respira e interactúa.

function timeAgo(iso: string): string {
  const d = new Date(iso).getTime();
  if (!Number.isFinite(d)) return "";
  const min = Math.max(1, Math.round((Date.now() - d) / 60000));
  if (min < 60) return `hace ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `hace ${h} h`;
  return `hace ${Math.round(h / 24)} d`;
}

function nextCrisisDate(): Date {
  const now = new Date();
  const d = new Date(now);
  const day = d.getDay(); // 0 domingo
  const daysToSunday = (7 - day) % 7;
  d.setDate(d.getDate() + daysToSunday);
  d.setHours(20, 0, 0, 0);
  if (d.getTime() <= now.getTime()) d.setDate(d.getDate() + 7);
  return d;
}

export function HomePanel() {
  const alias = useGameStore((s) => s.alias);
  const coins = useGameStore((s) => s.coins);
  const level = useGameStore((s) => s.level);
  const streak = useGameStore((s) => s.streak);
  const recordViewNews = useGameStore((s) => s.recordViewNews);
  const account = useGameStore((s) => s.account);
  const launchPackClaimed = useGameStore((s) => s.launchPackClaimed);
  const claimLaunchPack = useGameStore((s) => s.claimLaunchPack);

  // v132.0 LA GRAN AUDITORÍA — el estado arranca VACÍO en servidor Y cliente:
  // leer localStorage en el inicializador de useState hacía que el servidor
  // pintara el placeholder y el visitante recurrente la tarjeta del héroe →
  // React #418 en CADA visita de regreso. La caché se carga en el efecto de
  // abajo (post-hidratación), la portada nunca queda sin noticias igual.
  const [items, setItems] = useState<NewsItem[]>([]);
  const [newsOffline, setNewsOffline] = useState(false);
  const [reloadTick, setReloadTick] = useState(0);
  const [clock, setClock] = useState("");
  const [typed, setTyped] = useState("");
  const [crisisIn, setCrisisIn] = useState("");
  // v116: la SALA DE LECTURA — el cable abierto dentro de la casa
  const [lector, setLector] = useState<CableLectura | null>(null);
  // v191: el cine del estreno (una vez por versión + botón VER CINEMÁTICA)
  const [cine, setCine] = useState(false);

  // tensión mundial = intensidad media de los conflictos activos
  const tension = useMemo(
    () => Math.round(CONFLICTS.reduce((a, c) => a + c.intensity, 0) / Math.max(1, CONFLICTS.length)),
    []
  );
  const tensionColor = tension >= 80 ? "#FF3B30" : tension >= 60 ? "#FF8A3B" : tension >= 40 ? "#E8C56A" : "#3DDC97";

  // noticias (la primera página es la de noticias) — v36: con caché, reintentos
  // (5s/15s/30s) y estado SIN SEÑAL con botón REINTENTAR. Nunca más "sin noticias".
  useEffect(() => {
    let alive = true;
    let retry: ReturnType<typeof setTimeout> | null = null;
    // v132.0: la caché local entra AQUÍ — tras la hidratación de React (la
    // portada pinta las últimas buenas al instante, sin desajuste posible)
    // v195: la lectura pasa a setTimeout 0 (patrón de la casa v132/v193) —
    // setState síncrono dentro del efecto dispara renders en cascada.
    const cacheTimer = setTimeout(() => {
      try {
        const arr = JSON.parse(localStorage.getItem("vanguard-news-cache") || "[]");
        if (Array.isArray(arr) && arr.length > 0) setItems(arr.slice(0, 12));
      } catch { /* sin caché: sigue la carga de red */ }
    }, 0);
    const load = (attempt: number) => {
      fetch("/api/news", { cache: "no-store" })
        .then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.json();
        })
        .then((data) => {
          if (!alive) return;
          if (Array.isArray(data.items) && data.items.length > 0) {
            const top = data.items.slice(0, 20); // v116: más señales en la portada (héroe + 4 + 8 + reserva)
            setItems(top);
            setNewsOffline(false);
            try {
              localStorage.setItem("vanguard-news-cache", JSON.stringify(top));
            } catch {
              /* storage lleno: no pasa nada */
            }
          } else {
            throw new Error("empty");
          }
        })
        .catch(() => {
          if (!alive) return;
          if (attempt < 3) {
            retry = setTimeout(
              () => load(attempt + 1),
              attempt === 0 ? 5_000 : attempt === 1 ? 15_000 : 30_000
            );
          } else {
            setNewsOffline(true); // con caché visible si la hay
          }
        });
    };
    load(0);
    const t = setInterval(() => load(0), 60_000);
    return () => {
      alive = false;
      clearInterval(t);
      clearTimeout(cacheTimer);
      if (retry) clearTimeout(retry);
    };
  }, [reloadTick]);

  // reloj vivo
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setClock(
        d.toLocaleTimeString("es-ES", { hour12: false }) + " local · " +
        d.toLocaleTimeString("es-ES", { hour12: false, timeZone: "UTC" }) + " UTC"
      );
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  // cuenta atrás de la crisis semanal (domingo 20:00)
  useEffect(() => {
    const target = nextCrisisDate();
    const tick = () => {
      const ms = Math.max(0, target.getTime() - Date.now());
      const h = Math.floor(ms / 3_600_000);
      const m = Math.floor((ms % 3_600_000) / 60_000);
      const s = Math.floor((ms % 60_000) / 1000);
      setCrisisIn(`${h}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`);
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  // titulares en modo máquina de escribir
  const headlines = useMemo(
    () => (items.length > 0 ? items.map((i) => i.title) : ["Cargando titulares en vivo…"]),
    [items]
  );
  useEffect(() => {
    let idx = 0;
    let pos = 0;
    let phase: "typing" | "hold" | "erasing" = "typing";
    const t = setInterval(() => {
      const s = headlines[idx % headlines.length] ?? "";
      if (phase === "typing") {
        pos += 1;
        setTyped(s.slice(0, pos));
        if (pos >= s.length) {
          phase = "hold";
          setTimeout(() => {}, 0);
        }
      } else if (phase === "hold") {
        phase = "erasing";
      } else {
        pos -= 4;
        if (pos <= 0) {
          pos = 0;
          idx += 1;
          phase = "typing";
        }
        setTyped((headlines[idx % headlines.length] ?? "").slice(0, Math.max(0, pos)));
      }
    }, 42);
    return () => clearInterval(t);
  }, [headlines]);

  // v116: abrir un cable YA NO manda a otra página — se lee en la SALA DE
  // LECTURA de Vanguard (mandato: "que no te mande a otras páginas")
  const openNews = (n: NewsItem) => {
    recordViewNews(n.id);
    setLector({
      id: n.id,
      title: n.title,
      url: n.url,
      source: n.source,
      publishedAt: n.publishedAt,
      tacticalTag: n.tacticalTag,
      conflictTag: n.conflictTag,
      sourceCountry: n.sourceCountry ?? null,
    });
  };

  const hero = items[0];
  const secondary = items.slice(1, 5);
  // v116: MÁS SEÑALES — 8 cables adicionales en la portada (más noticieros)
  const senales = items.slice(5, 13);

  return (
    <div className="space-y-5">
      {/* v85.0 EL MUNDO DENTRO — manifiesto de identidad */}
      <ManifiestoMundo />

      {/* v52.0 ZONA CERO — la ciudad que cae en vivo */}
      <Link
        href="/zona-cero"
        className="group block border border-red-500/40 bg-gradient-to-r from-red-950/60 via-zinc-950/40 to-transparent rounded-md p-4 hover:border-red-400/80 transition-colors"
      >
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="flex items-center gap-1.5 font-mono text-[9px] tracking-[0.25em] uppercase text-red-300 border border-red-500/50 bg-red-500/10 rounded px-2 py-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block" />
            En vivo
          </span>
          <span className="font-display text-lg sm:text-xl font-black tracking-wide text-soft group-hover:text-red-200 transition-colors">
            ZONA CERO — la ciudad que cae
          </span>
        </div>
        <p className="mt-1.5 text-[12px] text-muted-foreground leading-relaxed">
          Soldados, tanques, jets y drones peleando sin parar sobre una ciudad
          que se destruye de verdad y recuerda tu última visita. Las noticias
          reales de guerra disparan las operaciones.
        </p>
        <p className="mt-1.5 font-mono text-[10px] text-amber uppercase tracking-widest">
          Entrar al teatro de guerra →
        </p>
      </Link>

      {/* v31: cuenta atrás al GRAN ESTRENO MUNDIAL */}
      <LaunchCountdown />

      {/* ====== v191.0 PORTADAS VIVAS — el héroe del inicio ya no es fijo:
          cuatro portadas cinematográficas seleccionables (amanecer, ciudad,
          alerta roja, órbita) + botón VER CINEMÁTICA + prueba de voces.
          El héroe v16 queda jubilado con honor. Cero imágenes pesadas. ====== */}
      <PortadasInicio
        tension={tension}
        tensionColor={tensionColor}
        conflictos={CONFLICTS.length}
        clock={clock}
        level={level}
        coins={coins}
        streak={streak}
        alias={alias || ""}
        onVerCinematica={() => setCine(true)}
      />

      {/* ====== v193.1 LA PUERTA DE VIGO — la entrada que dirige: el centinela
          pregunta qué te importa (guerra hoy / para ti / TV / mapa 3D / memes),
          guarda tu sala en TU aparato y desde entonces ENTRAR es un solo toque.
          Evento interno vanguard:navigate — jamás recarga (ley v190). ====== */}
      <PuertaVigo />

      {/* ====== v195.0 TU LADO — EL MUELLE DE ATAJOS: seis salas de la casa
          a un toque y tu uso real las reordena (vg195-atajos-usage).
          Evento interno vanguard:navigate — jamás recarga (ley v190). ====== */}
      <AtajosVanguard />

      {/* ====== ÚLTIMA HORA — LAS NOTICIAS PRIMERO ====== */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-hud blink-soft" />
            <h2 className="font-display text-sm sm:text-base font-bold tracking-widest uppercase text-gradient nexus-letra">
              Última hora
            </h2>
            <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest hidden sm:inline">
              En vivo · verificación por fuente · GDELT
            </span>
          </div>
          <button
            onClick={() => navigateTo("noticias")}
            className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest text-amber hover:text-foreground transition-colors"
          >
            Todas las noticias <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ticker con máquina de escribir */}
        <div className="hud-panel px-3 py-2 mb-3 flex items-center gap-2 overflow-hidden">
          <Newspaper className="w-4 h-4 text-red-hud shrink-0" />
          <span className="text-[11px] font-mono text-foreground/90 truncate typewriter-caret">
            {typed}
          </span>
        </div>

        {hero ? (
          <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_1fr] gap-3">
            {/* protagonista — v16: con FOTO REAL de la noticia */}
            <motion.article
              key={hero.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="hud-corner p-4 bg-secondary/40 border-l-2 flex flex-col justify-between min-h-[180px] relative overflow-hidden"
              style={{ borderLeftColor: TAG_HEX[hero.tacticalTag ?? "INFO"] }}
            >
              {/* v116: la portada del héroe es una escena 3D VIVA derivada del
                  propio cable — cero <img>, cero píxeles externos (mandato) */}
              <div className="relative h-40 sm:h-52 rounded-sm overflow-hidden mb-3 border border-border/50 bg-black/40">
                <PortadaNoticia id={hero.id} tag={hero.tacticalTag} className="absolute inset-0" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-transparent to-transparent pointer-events-none" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span
                    className="text-[9px] font-mono font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-sm border"
                    style={{ color: TAG_HEX[hero.tacticalTag ?? "INFO"], borderColor: TAG_HEX[hero.tacticalTag ?? "INFO"] + "66" }}
                  >
                    {hero.tacticalTag ?? "INFO"}
                  </span>
                  {hero.conflictTag && (
                    <span className="text-[9px] font-mono uppercase tracking-widest text-cyan-hud">
                      {hero.conflictTag}
                    </span>
                  )}
                  <span className="text-[9px] font-mono text-muted-foreground">
                    {hero.source} · {timeAgo(hero.publishedAt)}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-semibold leading-snug text-foreground">
                  {hero.title}
                </h3>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
                  Fuente verificada por el radar de desinformación
                </span>
                <button
                  onClick={() => openNews(hero)}
                  className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest px-2.5 py-1.5 border border-amber-hud rounded-sm text-amber hover:bg-amber-hud/30 transition-colors"
                >
                  Leer en la sala <BookOpen className="w-3 h-3" />
                </button>
              </div>
            </motion.article>

            {/* secundarias — v16: miniaturas reales */}
            <div className="grid gap-2">
              {secondary.map((n, i) => (
                <motion.button
                  key={n.id}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => openNews(n)}
                  className="text-left hud-panel card-shine p-3 hover:border-amber-hud transition-colors group"
                >
                  <div className="flex items-start gap-2.5">
                    {n.imageUrl ? (
                      <div className="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 overflow-hidden border border-border/60 bg-secondary">
                        {/* v116: miniatura 3D viva — nada de imágenes planas */}
                        <PortadaNoticia id={n.id} tag={n.tacticalTag} className="w-full h-full" />
                      </div>
                    ) : (
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5"
                        style={{ background: TAG_HEX[n.tacticalTag ?? "INFO"] }}
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground truncate">
                          {n.source} · {timeAgo(n.publishedAt)}
                        </span>
                      </div>
                      <div className="text-xs leading-snug text-foreground/90 line-clamp-2 group-hover:text-foreground">
                        {n.title}
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          <div className="hud-panel p-6 text-center text-[11px] font-mono uppercase tracking-widest">
            {newsOffline ? (
              <>
                <div className="text-red-400 font-bold mb-2">SIN SEÑAL DEL RADAR DE NOTICIAS</div>
                <button
                  onClick={() => {
                    setNewsOffline(false);
                    setReloadTick((v) => v + 1);
                  }}
                  className="border border-amber-hud rounded px-3 py-1.5 text-amber hover:bg-amber-hud/20 transition-colors"
                >
                  REINTENTAR CONEXIÓN
                </button>
              </>
            ) : (
              <span className="text-muted-foreground">Conectando con la red de noticias…</span>
            )}
          </div>
        )}
      </div>

      {/* ====== v116 MÁS SEÑALES — más noticieros en la portada, todo dentro ====== */}
      {senales.length > 0 && (
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <SignalHigh className="w-4 h-4 text-electric" />
              <h2 className="font-display text-sm font-bold tracking-widest uppercase text-gradient nexus-letra">
                Más señales
              </h2>
              <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest hidden sm:inline">
                8 cables más · se leen dentro de Vanguard
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {senales.map((n, i) => (
              <motion.button
                key={n.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.05, 0.4) }}
                onClick={() => openNews(n)}
                className="text-left hud-panel card-shine p-3 hover:border-electric-hud transition-colors group"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-1.5 h-1.5 rounded-full shrink-0 blink-soft" style={{ background: TAG_HEX[n.tacticalTag ?? "INFO"] }} />
                  <span className="text-[8.5px] font-mono uppercase tracking-widest text-muted-foreground truncate">
                    {n.source} · {timeAgo(n.publishedAt)}
                  </span>
                </div>
                <div className="text-[11.5px] leading-snug text-foreground/85 line-clamp-3 group-hover:text-foreground">
                  {n.title}
                </div>
                <div className="mt-2 flex items-center gap-1 text-[9px] font-mono uppercase tracking-widest font-bold" style={{ color: TAG_HEX[n.tacticalTag ?? "INFO"] }}>
                  Leer <BookOpen className="w-3 h-3" />
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* ====== PACK DE LANZAMIENTO ====== */}
      {!launchPackClaimed && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="hud-panel neon-border p-4 flex flex-col sm:flex-row sm:items-center gap-3 border-amber-hud"
        >
          <div className="w-11 h-11 rounded-sm border border-amber-hud bg-amber-hud/20 flex items-center justify-center flex-shrink-0">
            <Gift className="w-6 h-6 text-amber" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-display text-sm font-bold tracking-widest text-soft uppercase">
              Pack de Lanzamiento — gratis
            </div>
            <p className="text-[11px] font-mono text-muted-foreground leading-relaxed">
              +1500 monedas · +15 gemas · 2 cajones ELITE · 1 cajón LEGENDARIA · 7 días de Pase ELITE · +500 PX
              {!account && " — crea tu cuenta para reclamarlo y guardar tu progreso en la nube."}
            </p>
          </div>
          <button
            onClick={() => {
              if (!account) {
                window.dispatchEvent(new CustomEvent("vanguard:open-account"));
                return;
              }
              if (claimLaunchPack()) {
                // feedback sencillo: el pack otorga sus recompensas al instante
              }
            }}
            className="px-4 py-2.5 border border-amber-hud bg-amber-hud/40 text-amber rounded-sm text-[11px] font-mono font-bold uppercase tracking-widest hover:bg-amber-hud/60 transition-colors flex-shrink-0"
          >
            {account ? "Reclamar pack" : "Crear cuenta y reclamar"}
          </button>
        </motion.div>
      )}

      {/* ====== v17: GUERRA GLOBAL EN VIVO ====== */}
      <LiveWarCard />

      {/* ====== v105.0 ¿NO SABES QUÉ HACER? — el navegador responde ====== */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        onClick={() => window.dispatchEvent(new CustomEvent("vanguard:navegador"))}
        className="v105-entra w-full text-left rounded-xl border px-4 py-3 flex items-center gap-3 hover:bg-white/[0.04] transition-colors"
        style={{ borderColor: "rgba(255,201,77,0.35)", background: "linear-gradient(90deg, rgba(255,201,77,0.10) 0%, rgba(5,5,8,0.4) 65%)" }}
      >
        <Compass className="w-5 h-5 shrink-0" style={{ color: "#FFC94D" }} />
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[11px] font-bold tracking-wider" style={{ color: "#FFC94D" }}>¿NO SABES QUÉ HACER HOY?</p>
          <p className="text-[11px] text-muted-foreground leading-snug">Ocho intenciones claras — leer, investigar, explorar, jugar, crear — y el navegador te lleva directo, sin buscar en el menú.</p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
      </motion.button>

      {/* ====== MENÚ LLAMATIVO: ELIGE TU CAMPO DE BATALLA ====== */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <h2 className="font-display text-sm sm:text-base font-bold tracking-widest uppercase text-gradient nexus-letra">
            Elige tu campo de batalla
          </h2>
          <button
            onClick={openMainMenu}
            className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest px-3 py-1.5 border border-electric-hud rounded-sm text-electric hover:bg-electric-hud/40 transition-colors"
          >
            <Menu className="w-3.5 h-3.5" /> Menú completo
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {WORLD_TILES.map((t, i) => (
            <motion.button
              key={t.tab}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.4) }}
              whileHover={{ y: -4 }}
              onClick={() => navigateTo(t.tab)}
              className="hud-corner group relative overflow-hidden text-left border rounded-md"
              style={{
                borderColor: `${t.hex}55`,
                background: "rgba(7,7,11,0.92)",
                boxShadow: "0 6px 22px rgba(0,0,0,0.45)",
              }}
              aria-label={`${t.title}: ${t.desc}`}
            >
              {/* v110 ESCENA 3D VIVA — nada plano, nada IA: el mundo se ve en sí */}
              <div className="portada-media relative h-28 sm:h-32 w-full">
                <Escena3D
                  variante={escenaDePanel(t.tab)}
                  acento={t.hex}
                  semilla={hashDe(t.tab)}
                  className="absolute inset-0"
                />
                {/* velo del color fuerte de la sección + fundido al cuerpo */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: `linear-gradient(180deg, ${t.hex}22 0%, transparent 34%, rgba(6,6,10,0.62) 72%, rgba(6,6,10,0.95) 100%)` }}
                  aria-hidden
                />
                <div className="portada-destello" aria-hidden />
              </div>

              <div className="relative z-10 px-4 pb-4 -mt-9">
                <div
                  className="w-11 h-11 rounded-md flex items-center justify-center border mb-2.5 backdrop-blur-sm"
                  style={{
                    borderColor: `${t.hex}88`,
                    color: t.hex,
                    background: `linear-gradient(150deg, ${t.hex}33, rgba(6,6,10,0.9))`,
                    boxShadow: `0 0 20px ${t.hex}44`,
                  }}
                >
                  {t.icon}
                </div>
                <div className="font-display text-xs font-bold tracking-wider text-foreground" style={{ textShadow: `0 0 16px ${t.hex}55` }}>
                  {t.title}
                </div>
                <div className="mt-1 text-[11px] leading-snug text-muted-foreground">
                  {t.desc}
                </div>
                <div className="mt-3 flex items-center gap-1 text-[9px] font-mono uppercase tracking-widest font-bold" style={{ color: t.hex }}>
                  Entrar <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* ====== resto de secciones + crisis semanal ====== */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-3">
        <div className="hud-panel p-4">
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">
            Explora las 9 secciones · 57 subtemas
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { k: "mundo", l: "JUEGO" }, { k: "bolsa", l: "MERCADO" }, { k: "enciclopedia", l: "ARCHIVO MUNDIAL" },
              { k: "briefing", l: "COMANDO" }, { k: "osint", l: "INTELIGENCIA" }, { k: "videos", l: "EMISORA" },
              { k: "crisis", l: "SOCIAL" }, { k: "agente", l: "SISTEMA" }, { k: "mapa", l: "MAPA 3D" },
            ].map((s) => (
              <button
                key={s.l}
                onClick={() => navigateTo(s.k as TabKey)}
                className="px-3 py-2 border border-border/70 rounded-sm text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground hover:border-amber-hud hover:bg-amber-hud/20 transition-colors"
              >
                {s.l}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => navigateTo("crisis")}
          className="hud-corner card-shine p-4 text-left border-red-hud/60 bg-red-hud/10 hover:bg-red-hud/20 transition-colors relative overflow-hidden"
        >
          <div className="absolute -right-6 -bottom-8 w-28 h-28 rounded-full blur-2xl opacity-30 pointer-events-none" style={{ background: "#FF3B30" }} aria-hidden />
          <div className="flex items-center gap-2 mb-1.5">
            <ShieldAlert className="w-4 h-4 text-red-hud" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-red-hud font-bold">
              Próxima crisis global
            </span>
          </div>
          <div className="font-tech text-2xl font-bold text-foreground tabular-nums">{crisisIn || "—"}</div>
          <div className="mt-1 text-[10px] font-mono text-muted-foreground">
            Domingo 20:00 · voto colectivo · +500 monedas al bando ganador
          </div>
        </button>
      </div>

      {/* v116: LA SALA DE LECTURA — el cable abierto dentro de la casa,
          nunca una pestaña externa (mandato del comandante) */}
      <LectorNoticia cable={lector} onCerrar={() => setLector(null)} />

      {/* v191: LA CINEMÁTICA DEL ESTRENO — se auto-estrena UNA sola vez
          (casa despierta y sesión sana) y siempre queda el botón en portada */}
      <CinematicaVanguard abierto={cine} alCerrar={() => setCine(false)} />
    </div>
  );
}

// ============================================================
// v17 — TARJETA GUERRA GLOBAL EN VIVO (portada)
// Se alimenta del socket compartido :3003 — muestra fase, jugadores
// conectados y lider actual de la partida mundial.
// ============================================================
interface MpLiveState {
  phase: "LOBBY" | "REINFORCE" | "WAR" | "ENDED";
  round: number;
  players: Record<string, { id: string; name: string; isBot: boolean }>;
  territories: Record<string, { owner: string | null; troops: number }>;
}

const LIVE_PHASE: Record<string, string> = {
  LOBBY: "Reclutando comandantes",
  REINFORCE: "Despliegue de refuerzos",
  WAR: "¡Batalla en vivo!",
  ENDED: "Partida finalizada",
};

function LiveWarCard() {
  const [live, setLive] = useState<MpLiveState | null>(null);
  // v29: si el servidor de partidas no responde, no mostrar "conectando..." eterno
  const [waited, setWaited] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setWaited(true), 10000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const socket = getRealtime();
    if (!socket) return;
    const on = (s: MpLiveState) => {
      const players = Object.values(s.players ?? {});
      const counts: Record<string, number> = {};
      for (const t of Object.values(s.territories ?? {})) {
        if (t.owner) counts[t.owner] = (counts[t.owner] ?? 0) + 1;
      }
      let leader: string | null = null;
      let leaderN = 0;
      for (const p of players) {
        const c = counts[p.id] ?? 0;
        if (c > leaderN) { leaderN = c; leader = p.name; }
      }
      setLive({
        phase: s.phase,
        round: s.round,
        humans: players.filter((p) => !p.isBot).length,
        leader, leaderN,
      } as MpLiveState & { humans: number; leader: string | null; leaderN: number });
    };
    socket.on("mp:state", on);
    return () => { socket.off("mp:state", on); };
  }, []);

  const extra = live as (MpLiveState & { humans?: number; leader?: string | null; leaderN?: number }) | null;

  return (
    <div className="hud-corner p-3 sm:p-4 relative overflow-hidden border-red-hud/40 bg-red-hud/5">
      <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full blur-3xl opacity-25 pointer-events-none" style={{ background: "#FF3B30" }} aria-hidden />
      <div className="flex items-center gap-3 flex-wrap">
        <span className="flex items-center gap-1.5 text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-1 border border-red-hud text-red-hud bg-red-hud/20 rounded-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-red-hud blink-soft" />
          En vivo
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-xs sm:text-sm font-bold tracking-wider uppercase text-foreground truncate">
            Guerra global — {live ? LIVE_PHASE[live.phase] : waited ? "en espera" : "conectando..."}
            {live && live.phase !== "LOBBY" && live.phase !== "ENDED" && (
              <span className="text-muted-foreground font-mono text-[10px] ml-2">ronda {live.round}</span>
            )}
          </p>
          <p className="text-[10px] font-mono text-muted-foreground truncate">
            {extra
              ? `${extra.humans ?? 0} operador${(extra.humans ?? 0) === 1 ? "" : "es"} conectado${(extra.humans ?? 0) === 1 ? "" : "s"}${extra.leader ? ` · lidera ${extra.leader} con ${extra.leaderN ?? 0} territorios` : " · el mundo esta vacio"}`
              : waited
                ? "la próxima partida abre pronto — salas sociales y en vivo siguen en línea"
                : "sincronizando con el servidor de partidas..."}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => navigateTo("multijugador")}
            className="flex items-center gap-1.5 px-3 py-2 border border-red-hud rounded-sm text-[10px] font-mono font-bold uppercase tracking-widest text-red-hud bg-red-hud/15 hover:bg-red-hud/30 transition-colors"
          >
            <Swords className="w-3.5 h-3.5" /> Unirme a la guerra
          </button>
          <button
            onClick={() => navigateTo("multijugador")}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 border border-electric-hud rounded-sm text-[10px] font-mono font-bold uppercase tracking-widest text-electric bg-electric/15 hover:bg-electric/30 transition-colors"
          >
            <Zap className="w-3.5 h-3.5" /> Duelo 1v1
          </button>
        </div>
      </div>
    </div>
  );
}
