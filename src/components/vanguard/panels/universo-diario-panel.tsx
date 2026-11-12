"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Coins,
  Compass,
  Crown,
  Flame,
  Globe2,
  Home,
  Layers,
  MapPin,
  Music,
  Palette,
  Pause,
  Play,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Trophy,
  Volume2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { HeroOro } from "@/components/vanguard/hero-oro";
import { useGameStore } from "@/lib/game-store";
import {
  CARTAS_UNIVERSALES,
  CATEGORIAS_COLECCION,
  CATEGORIAS_MARKETPLACE,
  EVENTOS_SEMANALES,
  FUENTES_VANGUARD_CREDITS,
  ITEMS_MARKETPLACE,
  RAREZAS_UNIVERSALES,
  obtenerPaqueteDiario,
  type CartaUniversal,
  type CategoriaColeccion,
  type CategoriaMarketplace,
} from "@/lib/universo-diario-data";
import {
  asegurarUniversoHidratado,
  useUniversoStore,
} from "@/lib/universo-store";
import { CartaVanguard3D } from "@/components/vanguard/cartas/carta-vanguard-3d";

export type VistaUniverso = "hoy" | "colecciones" | "creditos" | "marketplace" | "base";

export function UniversoDiarioPanel({
  initialVista = "hoy",
  initialCategoria = "todas",
}: {
  initialVista?: VistaUniverso;
  initialCategoria?: CategoriaColeccion | "todas";
} = {}) {
  const [vista, setVista] = useState<VistaUniverso>(initialVista);
  const [catCol, setCatCol] = useState<CategoriaColeccion | "todas">(initialCategoria);
  const [catMarket, setCatMarket] = useState<CategoriaMarketplace | "todas">("todas");
  const [busqCol, setBusqCol] = useState("");
  const [offsetDia, setOffsetDia] = useState(0); // 0 = hoy, 1 = ayer, 2 = hace 2 días (Cero FOMO)
  const [cartaActiva, setCartaActiva] = useState<CartaUniversal | null>(null);
  const [opcionQuizDia, setOpcionQuizDia] = useState<number | null>(null);
  const [opcionCartaQuiz, setOpcionCartaQuiz] = useState<number | null>(null);
  const [pistaSonando, setPistaSonando] = useState<string | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioTimerRef = useRef<number | null>(null);

  const coins = useGameStore((s) => s.coins);
  const alias = useGameStore((s) => s.alias);
  const cartas = useUniversoStore((s) => s.cartas);
  const vitrina = useUniversoStore((s) => s.vitrina);
  const poseidos = useUniversoStore((s) => s.poseidos);
  const equipado = useUniversoStore((s) => s.equipado);
  const misionesDia = useUniversoStore((s) => s.misionesDia);
  const desafiosDia = useUniversoStore((s) => s.desafiosDia);
  const recompensasDia = useUniversoStore((s) => s.recompensasDia);
  const competicionesDia = useUniversoStore((s) => s.competicionesDia);
  const investigacionesCompletadas = useUniversoStore((s) => s.investigacionesCompletadas);
  const contenidosCreados = useUniversoStore((s) => s.contenidosCreados);
  const historialVC = useUniversoStore((s) => s.historialVC);

  const desbloquearCarta = useUniversoStore((s) => s.desbloquearCarta);
  const mejorarCarta = useUniversoStore((s) => s.mejorarCarta);
  const verificarEstudioCarta = useUniversoStore((s) => s.verificarEstudioCarta);
  const alternarVitrina = useUniversoStore((s) => s.alternarVitrina);
  const comprarItemMarketplace = useUniversoStore((s) => s.comprarItemMarketplace);
  const actualizarBasePersonal = useUniversoStore((s) => s.actualizarBasePersonal);
  const completarMisionDia = useUniversoStore((s) => s.completarMisionDia);
  const responderDesafioDia = useUniversoStore((s) => s.responderDesafioDia);
  const reclamarCartaDia = useUniversoStore((s) => s.reclamarCartaDia);
  const completarCompeticionDia = useUniversoStore((s) => s.completarCompeticionDia);
  const registrarInvestigacionOContenido = useUniversoStore((s) => s.registrarInvestigacionOContenido);

  useEffect(() => {
    asegurarUniversoHidratado();
  }, []);

  // Limpiar audio WebAudio al desmontar
  useEffect(() => {
    return () => {
      if (audioTimerRef.current) window.clearInterval(audioTimerRef.current);
      try { audioCtxRef.current?.close(); } catch { /* noop */ }
    };
  }, []);

  const detenerMusica = () => {
    if (audioTimerRef.current) {
      window.clearInterval(audioTimerRef.current);
      audioTimerRef.current = null;
    }
    try { audioCtxRef.current?.close(); } catch { /* noop */ }
    audioCtxRef.current = null;
    setPistaSonando(null);
  };

  const alternarMusica = (itemId: string, acordes: number[]) => {
    if (pistaSonando === itemId) {
      detenerMusica();
      return;
    }
    detenerMusica();
    try {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AC();
      audioCtxRef.current = ctx;
      let step = 0;
      const tocarNota = () => {
        if (!audioCtxRef.current) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(acordes[step % acordes.length], ctx.currentTime);
        gain.gain.setValueAtTime(0.001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.055, ctx.currentTime + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.0008, ctx.currentTime + 1.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 1.35);
        step += 1;
      };
      tocarNota();
      audioTimerRef.current = window.setInterval(tocarNota, 1200);
      setPistaSonando(itemId);
    } catch {
      toast.error("El navegador bloqueó el sintetizador de audio.");
    }
  };

  const paqueteDia = useMemo(() => obtenerPaqueteDiario(offsetDia), [offsetDia]);
  const cartaDia = useMemo(
    () => CARTAS_UNIVERSALES.find((c) => c.id === paqueteDia.cartaRecompensaId) ?? CARTAS_UNIVERSALES[0],
    [paqueteDia]
  );

  const totalDesbloqueadas = Object.keys(cartas).length;
  const totalEstudiadas = Object.values(cartas).filter((c) => c.estudiada).length;
  const sumaNiveles = Object.values(cartas).reduce((s, c) => s + c.nivel, 0);

  const cartasFiltradas = useMemo(() => {
    const q = busqCol.trim().toLowerCase();
    return CARTAS_UNIVERSALES.filter((c) => {
      if (catCol !== "todas" && c.categoria !== catCol) return false;
      if (!q) return true;
      return (
        c.titulo.toLowerCase().includes(q) ||
        c.subtitulo.toLowerCase().includes(q) ||
        c.resumenEducativo.toLowerCase().includes(q) ||
        c.serie.toLowerCase().includes(q)
      );
    });
  }, [catCol, busqCol]);

  const itemsMarketFiltrados = useMemo(
    () =>
      catMarket === "todas"
        ? ITEMS_MARKETPLACE
        : ITEMS_MARKETPLACE.filter((i) => i.categoria === catMarket),
    [catMarket]
  );

  const avatarObj = ITEMS_MARKETPLACE.find((i) => i.id === equipado.avatarId);
  const insigniaObj = ITEMS_MARKETPLACE.find((i) => i.id === equipado.insigniaId);

  const compartirAlbum = () => {
    const texto = `VANGUARD · THE DAILY UNIVERSE (${alias || "AGENTE"}): ${totalDesbloqueadas}/${CARTAS_UNIVERSALES.length} cartas coleccionadas · ${totalEstudiadas} investigaciones certificadas · Poder de álbum Nv.${sumaNiveles} · ${coins} VC.`;
    navigator.clipboard?.writeText(texto);
    toast.success("Resumen de tu colección copiado al portapapeles para compartir.");
  };

  return (
    <div className="space-y-5">
      <HeroOro panel="universo" />

      {/* ══ BARRA MAESTRA: THE DAILY UNIVERSE + VANGUARD CREDITS (VC) ══ */}
      <div className="hud-panel border-[#FFC94D]/55 bg-gradient-to-r from-[#FFC94D]/15 via-black/80 to-violet-950/35 p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded bg-[#FFC94D] text-black font-mono text-[10px] font-black tracking-widest flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> VANGUARD · THE DAILY UNIVERSE
              </span>
              {insigniaObj && (
                <span
                  className="px-2 py-0.5 rounded border font-mono text-[10px] font-bold"
                  style={{ borderColor: insigniaObj.color, color: insigniaObj.color }}
                >
                  {insigniaObj.insigniaTexto}
                </span>
              )}
              {avatarObj && (
                <span className="px-2 py-0.5 rounded bg-white/10 font-mono text-[10px] text-cyan-hud">
                  TRAJE: {avatarObj.avatarCodigo}
                </span>
              )}
            </div>
            <h2 className="font-display text-base sm:text-xl font-black tracking-wide text-foreground">
              ECONOMÍA DE RECOMPENSAS, COLECCIONES MUNDIALES Y EXPERIENCIAS DIGITALES
            </h2>
          </div>

          {/* Tarjetas rápidas de estado */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <div className="px-3 py-1.5 rounded bg-black/70 border border-[#FFC94D]/60 flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-amber" />
              <span className="text-muted-foreground">VC:</span>
              <span className="font-black text-amber">{coins.toLocaleString()}</span>
            </div>
            <div className="px-3 py-1.5 rounded bg-black/70 border border-cyan-hud/45 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-cyan-hud" />
              <span className="text-muted-foreground">ÁLBUM:</span>
              <span className="font-black text-cyan-hud">
                {totalDesbloqueadas}/{CARTAS_UNIVERSALES.length}
              </span>
            </div>
            <div className="px-3 py-1.5 rounded bg-black/70 border border-green-hud/45 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-green-hud" />
              <span className="text-muted-foreground">ESTUDIO:</span>
              <span className="font-black text-green-hud">{totalEstudiadas}</span>
            </div>
          </div>
        </div>

        {/* Selector de las 5 áreas del Daily Universe */}
        <div className="flex flex-wrap gap-1.5 font-mono text-xs pt-1">
          {(
            [
              { id: "hoy", label: "1. SISTEMA DIARIO & SEMANAL", icon: Calendar },
              { id: "colecciones", label: `2. VANGUARD COLLECTIONS (${totalDesbloqueadas}/${CARTAS_UNIVERSALES.length})`, icon: Layers },
              { id: "creditos", label: "3. VANGUARD CREDITS (VC)", icon: Coins },
              { id: "marketplace", label: "4. MARKETPLACE ÉTICO (7 CAT.)", icon: ShoppingBag },
              { id: "base", label: `5. MI BASE PERSONAL (${vitrina.length}/6)`, icon: Home },
            ] as const
          ).map((t) => {
            const Icon = t.icon;
            const act = vista === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setVista(t.id)}
                className={cn(
                  "px-3 py-2 rounded font-bold flex items-center gap-1.5 transition-colors",
                  act
                    ? "bg-[#FFC94D] text-black"
                    : "border border-white/15 bg-black/50 text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-3.5 h-3.5" /> {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* VISTA 1: EL SISTEMA DIARIO & SEMANAL (SIN MIEDO / CERO FOMO)        */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {vista === "hoy" && (
        <div className="space-y-5">
          {/* Selector de día anti-FOMO */}
          <div className="hud-panel p-3.5 border-cyan-hud/40 flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="font-mono text-xs font-bold text-cyan-hud flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> SIN MIEDO A PERDER RECOMPENSAS (ARCHIVO ACCESIBLE)
              </div>
              <p className="text-xs text-muted-foreground">
                Cada día VANGUARD renueva su contenido. Si no pudiste entrar ayer, selecciona la jornada del archivo y complétala igual.
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5 font-mono text-xs">
              {[
                { off: 0, label: `HOY (${obtenerPaqueteDiario(0).etiquetaDia})` },
                { off: 1, label: "AYER (ARCHIVO)" },
                { off: 2, label: "HACE 2 DÍAS" },
              ].map((d) => (
                <button
                  key={d.off}
                  type="button"
                  onClick={() => {
                    setOffsetDia(d.off);
                    setOpcionQuizDia(null);
                  }}
                  className={cn(
                    "px-2.5 py-1.5 rounded font-bold",
                    offsetDia === d.off
                      ? "bg-[#38BDF8] text-black"
                      : "border border-white/15 text-muted-foreground hover:text-foreground"
                  )}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Las 6 experiencias diarias exactas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {/* 1. Misión mundial */}
            <div className="hud-panel p-4 border-[#FFC94D]/45 space-y-2.5 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className="px-2 py-0.5 rounded bg-[#FFC94D] text-black font-black">1. MISIÓN MUNDIAL</span>
                  <span className="text-amber font-bold">+{paqueteDia.mision.recompensaVC} VC</span>
                </div>
                <h3 className="text-sm font-bold text-foreground">{paqueteDia.mision.titulo}</h3>
                <p className="text-xs text-muted-foreground">{paqueteDia.mision.descripcion}</p>
              </div>
              <div className="flex flex-wrap gap-1.5 font-mono text-[11px] pt-2 border-t border-white/10">
                <Link
                  href={paqueteDia.mision.rutaDestino}
                  className="px-2.5 py-1.5 rounded bg-[#38BDF8] text-black font-bold"
                >
                  {paqueteDia.mision.accionLabel}
                </Link>
                <button
                  type="button"
                  disabled={!!misionesDia[paqueteDia.etiquetaDia]}
                  onClick={() => {
                    const ok = completarMisionDia(
                      paqueteDia.etiquetaDia,
                      paqueteDia.mision.recompensaVC,
                      paqueteDia.mision.titulo
                    );
                    if (ok) toast.success(`¡Misión completada! +${paqueteDia.mision.recompensaVC} VC`);
                  }}
                  className={cn(
                    "px-2.5 py-1.5 rounded font-bold",
                    misionesDia[paqueteDia.etiquetaDia]
                      ? "bg-green-hud/20 text-green-hud border border-green-hud/45"
                      : "bg-[#FFC94D] text-black hover:bg-[#ffd66b]"
                  )}
                >
                  {misionesDia[paqueteDia.etiquetaDia] ? "✓ COMPLETADA" : "COBRAR MISIÓN"}
                </button>
              </div>
            </div>

            {/* 2. Acontecimiento importante explicado */}
            <div className="hud-panel p-4 border-cyan-hud/40 space-y-2.5 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className="px-2 py-0.5 rounded bg-[#38BDF8] text-black font-black">2. HECHO EXPLICADO</span>
                  <span className="text-cyan-hud">{paqueteDia.acontecimiento.fechaReferencia}</span>
                </div>
                <h3 className="text-sm font-bold text-foreground">{paqueteDia.acontecimiento.titulo}</h3>
                <p className="text-xs text-muted-foreground">{paqueteDia.acontecimiento.contexto}</p>
                <p className="text-xs text-amber/90 border-l-2 border-[#FFC94D] pl-2">
                  Por qué importa: {paqueteDia.acontecimiento.porQueImporta}
                </p>
              </div>
              <div className="pt-2 border-t border-white/10 font-mono text-[11px]">
                <Link
                  href={paqueteDia.acontecimiento.rutaRelacionada}
                  className="text-cyan-hud underline hover:text-foreground"
                >
                  Abrir herramienta vinculada →
                </Link>
              </div>
            </div>

            {/* 3. Desafío de conocimientos */}
            <div className="hud-panel p-4 border-green-hud/40 space-y-2.5 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className="px-2 py-0.5 rounded bg-[#3DDC97] text-black font-black">3. DESAFÍO DE SABER</span>
                  <span className="text-green-hud font-bold">+{paqueteDia.desafio.recompensaVC} VC</span>
                </div>
                <h3 className="text-xs font-bold text-foreground leading-snug">{paqueteDia.desafio.pregunta}</h3>
                <div className="space-y-1">
                  {paqueteDia.desafio.opciones.map((op, i) => (
                    <button
                      key={op}
                      type="button"
                      disabled={!!desafiosDia[paqueteDia.etiquetaDia]}
                      onClick={() => {
                        setOpcionQuizDia(i);
                        const ok = i === paqueteDia.desafio.correcta;
                        const r = responderDesafioDia(
                          paqueteDia.etiquetaDia,
                          ok,
                          paqueteDia.desafio.recompensaVC
                        );
                        if (ok) toast.success(r.msg);
                        else toast.error(r.msg);
                      }}
                      className={cn(
                        "w-full text-left px-2.5 py-1.5 rounded border text-xs transition-colors",
                        desafiosDia[paqueteDia.etiquetaDia] && i === paqueteDia.desafio.correcta
                          ? "border-green-hud bg-green-hud/20 text-green-hud font-bold"
                          : opcionQuizDia === i && i !== paqueteDia.desafio.correcta
                            ? "border-red-hud bg-red-hud/15 text-red-hud"
                            : "border-white/15 bg-black/40 text-foreground hover:border-white/35"
                      )}
                    >
                      {op}
                    </button>
                  ))}
                </div>
                {desafiosDia[paqueteDia.etiquetaDia] && (
                  <p className="text-[11px] text-green-hud">{paqueteDia.desafio.explicacion}</p>
                )}
              </div>
            </div>

            {/* 4. Recompensa coleccionable del día */}
            <div className="hud-panel p-4 border-violet-400/45 space-y-2.5 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className="px-2 py-0.5 rounded bg-violet-400 text-black font-black">4. CARTA DEL DÍA</span>
                  <span className="text-violet-300 font-bold">{cartaDia.serie}</span>
                </div>
                <h3 className="text-sm font-bold text-foreground">{cartaDia.titulo}</h3>
                <p className="text-xs text-muted-foreground">{cartaDia.resumenEducativo}</p>
              </div>
              <div className="pt-2 border-t border-white/10 flex flex-wrap gap-2 font-mono text-[11px]">
                <button
                  type="button"
                  disabled={!!recompensasDia[paqueteDia.etiquetaDia]}
                  onClick={() => {
                    const r = reclamarCartaDia(paqueteDia.etiquetaDia, cartaDia.id);
                    if (r.ok) toast.success(r.msg);
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded font-black",
                    recompensasDia[paqueteDia.etiquetaDia]
                      ? "bg-green-hud/20 text-green-hud border border-green-hud/45"
                      : "bg-[#FFC94D] text-black hover:bg-[#ffd66b]"
                  )}
                >
                  {recompensasDia[paqueteDia.etiquetaDia] ? "✓ RECLAMADA" : "RECLAMAR CARTA GRATIS"}
                </button>
                <button
                  type="button"
                  onClick={() => setVista("colecciones")}
                  className="px-2.5 py-1.5 rounded border border-white/15 text-foreground hover:bg-white/10"
                >
                  Ver álbum
                </button>
              </div>
            </div>

            {/* 5. Competición del día */}
            <div className="hud-panel p-4 border-red-hud/40 space-y-2.5 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className="px-2 py-0.5 rounded bg-[#FF3B30] text-white font-black">5. COMPETICIÓN</span>
                  <span className="text-amber font-bold">+{paqueteDia.competicion.recompensaVC} VC</span>
                </div>
                <h3 className="text-sm font-bold text-foreground">{paqueteDia.competicion.titulo}</h3>
                <p className="text-xs text-muted-foreground">{paqueteDia.competicion.meta}</p>
              </div>
              <div className="pt-2 border-t border-white/10 flex flex-wrap gap-1.5 font-mono text-[11px]">
                <Link
                  href="/novedades?funcion=duelo-relampago"
                  className="px-2.5 py-1.5 rounded border border-white/20 text-foreground hover:bg-white/10"
                >
                  Ir a Arena Relámpago
                </Link>
                <button
                  type="button"
                  disabled={!!competicionesDia[paqueteDia.etiquetaDia]}
                  onClick={() => {
                    const ok = completarCompeticionDia(
                      paqueteDia.etiquetaDia,
                      paqueteDia.competicion.recompensaVC,
                      paqueteDia.competicion.titulo
                    );
                    if (ok) toast.success(`¡Participación registrada! +${paqueteDia.competicion.recompensaVC} VC`);
                  }}
                  className={cn(
                    "px-2.5 py-1.5 rounded font-black",
                    competicionesDia[paqueteDia.etiquetaDia]
                      ? "bg-green-hud/20 text-green-hud border border-green-hud/45"
                      : "bg-[#FFC94D] text-black hover:bg-[#ffd66b]"
                  )}
                >
                  {competicionesDia[paqueteDia.etiquetaDia] ? "✓ COMPLETADA" : "REGISTRAR MARCA"}
                </button>
              </div>
            </div>

            {/* 6. Experiencia cambiante diaria */}
            <div className="hud-panel p-4 border-amber-hud/40 space-y-2.5 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className="px-2 py-0.5 rounded bg-[#FF8A3D] text-black font-black">6. EXPERIENCIA DEL DÍA</span>
                  <span className="text-amber">ROTACIÓN DIARIA</span>
                </div>
                <h3 className="text-sm font-bold text-foreground">{paqueteDia.experiencia.titulo}</h3>
                <p className="text-xs text-muted-foreground">{paqueteDia.experiencia.descripcion}</p>
              </div>
              <div className="pt-2 border-t border-white/10 font-mono text-[11px]">
                <Link
                  href={paqueteDia.experiencia.ruta}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-[#FFC94D] text-black font-black hover:bg-[#ffd66b]"
                >
                  <Compass className="w-3.5 h-3.5" /> Iniciar Experiencia →
                </Link>
              </div>
            </div>
          </div>

          {/* Bloque Semanal (5 pilares) */}
          <div className="hud-panel p-4 border-white/15 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-mono text-xs sm:text-sm font-bold text-amber uppercase tracking-wider flex items-center gap-1.5">
                <Trophy className="w-4 h-4" /> AGENDA SEMANAL VANGUARD (COLECCIONES, ESCENARIOS, TORNEOS Y EVENTOS)
              </h3>
              <span className="font-mono text-[10px] text-muted-foreground">Renovación semanal limpia</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5">
              {EVENTOS_SEMANALES.map((ev) => (
                <div key={ev.id} className="p-3 rounded-lg bg-black/50 border border-white/12 flex flex-col justify-between gap-2">
                  <div className="space-y-1">
                    <span
                      className="inline-block px-1.5 py-0.5 rounded font-mono text-[9px] font-black text-black"
                      style={{ background: ev.color }}
                    >
                      {ev.tipo}
                    </span>
                    <div className="text-xs font-bold text-foreground leading-snug">{ev.titulo}</div>
                    <p className="text-[11px] text-muted-foreground leading-snug">{ev.descripcion}</p>
                  </div>
                  <div className="pt-2 border-t border-white/10 space-y-1 font-mono text-[10px]">
                    <div className="text-amber font-bold">{ev.recompensa}</div>
                    <Link href={ev.ruta} className="text-cyan-hud underline block">
                      Entrar al evento →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* VISTA 2: VANGUARD COLLECTIONS (8 COLECCIONES · CARTAS 3D MEJORADAS) */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {vista === "colecciones" && (
        <div className="space-y-4">
          {/* Resumen progreso por las 8 categorías */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {CATEGORIAS_COLECCION.map((cat) => {
              const delGrupo = CARTAS_UNIVERSALES.filter((c) => c.categoria === cat.id);
              const nTengo = delGrupo.filter((c) => !!cartas[c.id]).length;
              const act = catCol === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCatCol(act ? "todas" : cat.id)}
                  className={cn(
                    "p-2.5 rounded-lg border text-left transition-all",
                    act ? "bg-white/10 border-[#FFC94D]" : "bg-black/45 border-white/12 hover:border-white/30"
                  )}
                >
                  <div className="font-mono text-[9px] font-black uppercase truncate" style={{ color: cat.color }}>
                    {cat.titulo}
                  </div>
                  <div className="font-mono text-sm font-black text-foreground mt-0.5">
                    {nTengo}/{delGrupo.length}
                  </div>
                  <div className="h-1 rounded bg-white/10 mt-1 overflow-hidden">
                    <div
                      className="h-full"
                      style={{
                        width: `${Math.round((nTengo / Math.max(1, delGrupo.length)) * 100)}%`,
                        background: cat.color,
                      }}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <input
              value={busqCol}
              onChange={(e) => setBusqCol(e.target.value)}
              placeholder="Buscar carta por país, civilización, monumento, científico, misión espacial..."
              className="flex-1 min-w-[230px] px-3 py-2 rounded bg-black/60 border border-white/15 font-mono text-xs text-foreground"
            />
            <button
              type="button"
              onClick={compartirAlbum}
              className="px-3 py-2 rounded bg-[#38BDF8] text-black font-mono text-xs font-black flex items-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" /> Compartir Álbum
            </button>
          </div>

          {/* Parrilla de cartas mejoradas 3D Holo-Foil */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {cartasFiltradas.map((c) => {
              const est = cartas[c.id];
              const metaRareza = RAREZAS_UNIVERSALES[c.rareza];
              const metaCat = CATEGORIAS_COLECCION.find((x) => x.id === c.categoria);
              return (
                <CartaVanguard3D
                  key={c.id}
                  serie={c.serie}
                  titulo={c.titulo}
                  subtitulo={c.subtitulo}
                  categoriaLabel={metaCat?.titulo ?? c.categoria}
                  rarezaLabel={metaRareza.label}
                  rarezaHex={metaRareza.hex}
                  resumen={c.resumenEducativo}
                  pieMeta={c.epocaOLugar}
                  nivel={est?.nivel ?? 1}
                  desbloqueada={!!est}
                  estudiada={!!est?.estudiada}
                  enVitrina={vitrina.includes(c.id)}
                  costoDesbloqueoVC={c.costoVC}
                  onClick={() => {
                    if (!est) {
                      const r = desbloquearCarta(c.id);
                      if (r.ok) {
                        toast.success(r.msg);
                        setCartaActiva(c);
                        setOpcionCartaQuiz(null);
                      } else {
                        toast.error(r.msg);
                      }
                    } else {
                      setCartaActiva(c);
                      setOpcionCartaQuiz(null);
                    }
                  }}
                  onMejorar={() => {
                    const r = mejorarCarta(c.id);
                    if (r.ok) toast.success(r.msg);
                    else toast.error(r.msg);
                  }}
                  onVitrina={() => {
                    const r = alternarVitrina(c.id);
                    if (r.ok) toast.success(r.msg);
                    else toast.error(r.msg);
                  }}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* VISTA 3: VANGUARD CREDITS (MONEDA VIRTUAL INTERNA Y ACTIVIDADES)    */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {vista === "creditos" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="hud-panel p-4 border-[#FFC94D]/55 space-y-1">
              <div className="font-mono text-[10px] text-muted-foreground">SALDO ACTUAL VANGUARD CREDITS</div>
              <div className="font-mono text-2xl font-black text-amber">{coins.toLocaleString()} VC</div>
              <div className="text-[11px] text-muted-foreground">Sincronizado en tiempo real con tu cuenta HUD</div>
            </div>
            <div className="hud-panel p-4 border-cyan-hud/45 space-y-1">
              <div className="font-mono text-[10px] text-muted-foreground">INVESTIGACIONES CERTIFICADAS</div>
              <div className="font-mono text-2xl font-black text-cyan-hud">
                {investigacionesCompletadas + totalEstudiadas}
              </div>
              <div className="text-[11px] text-muted-foreground">Certificados educativos completados en cartas y análisis</div>
            </div>
            <div className="hud-panel p-4 border-green-hud/45 space-y-1">
              <div className="font-mono text-[10px] text-muted-foreground">CONTENIDO / APORTES REGISTRADOS</div>
              <div className="font-mono text-2xl font-black text-green-hud">{contenidosCreados}</div>
              <div className="text-[11px] text-muted-foreground">Briefings e informes elaborados en la plataforma</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Las 7 fuentes activas de VC */}
            <div className="hud-panel p-4 border-white/15 space-y-2.5">
              <h3 className="font-mono text-xs font-bold text-amber uppercase tracking-wider">
                CÓMO GANAR VANGUARD CREDITS (SIN COMPRAR VENTAJAS)
              </h3>
              {FUENTES_VANGUARD_CREDITS.map((f) => (
                <div key={f.id} className="p-2.5 rounded bg-black/50 border border-white/10 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-foreground">{f.titulo}</div>
                    <div className="text-[11px] text-muted-foreground">{f.descripcion}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 font-mono text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-[#FFC94D]/20 text-amber font-black">{f.rangoVC}</span>
                    <Link href={f.ruta} className="px-2.5 py-1 rounded bg-[#38BDF8] text-black font-bold">
                      Ir →
                    </Link>
                  </div>
                </div>
              ))}
              <div className="pt-2 flex flex-wrap gap-2 font-mono text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    registrarInvestigacionOContenido("contenido", "Briefing o creación editorial registrada", 50);
                    toast.success("Aporte de contenido registrado: +50 VC y +25 XP");
                  }}
                  className="px-3 py-1.5 rounded bg-[#FFC94D] text-black font-black hover:bg-[#ffd66b]"
                >
                  + Registrar Aporte de Contenido (+50 VC)
                </button>
              </div>
            </div>

            {/* Historial transparente de movimientos */}
            <div className="hud-panel p-4 border-white/15 space-y-2.5">
              <h3 className="font-mono text-xs font-bold text-cyan-hud uppercase tracking-wider">
                LIBRO MAYOR DE MOVIMIENTOS (VC)
              </h3>
              <div className="space-y-1.5 max-h-80 overflow-y-auto thin-scroll">
                {historialVC.map((h) => (
                  <div key={h.id} className="p-2 rounded bg-black/45 border border-white/10 flex items-center justify-between gap-2 font-mono text-[11px]">
                    <div className="min-w-0">
                      <div className="text-foreground truncate">{h.concepto}</div>
                      <div className="text-[10px] text-muted-foreground">{h.fecha} · {h.tipo}</div>
                    </div>
                    <span
                      className={cn(
                        "font-black shrink-0",
                        h.montoVC > 0 ? "text-green-hud" : h.montoVC < 0 ? "text-amber" : "text-muted-foreground"
                      )}
                    >
                      {h.montoVC > 0 ? `+${h.montoVC}` : h.montoVC} VC
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* VISTA 4: VANGUARD MARKETPLACE ÉTICO (7 CATEGORÍAS EXACTAS)           */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {vista === "marketplace" && (
        <div className="space-y-4">
          <div className="hud-panel p-3.5 border-green-hud/45 bg-green-hud/10 flex flex-wrap items-center justify-between gap-2">
            <div className="font-mono text-xs text-green-hud font-bold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> COMPROMISO MARKETPLACE ÉTICO VANGUARD
            </div>
            <p className="text-xs text-muted-foreground">
              Cero ventajas competitivas de pago · Cero cajas aleatorias pagadas · Personalización, arte, escenarios, música y experiencias digitales.
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
            <button
              type="button"
              onClick={() => setCatMarket("todas")}
              className={cn(
                "px-2.5 py-1.5 rounded font-bold",
                catMarket === "todas" ? "bg-[#FFC94D] text-black" : "border border-white/15 text-muted-foreground"
              )}
            >
              TODAS (7 CATEGORÍAS)
            </button>
            {CATEGORIAS_MARKETPLACE.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCatMarket(c.id)}
                className={cn(
                  "px-2.5 py-1.5 rounded font-bold",
                  catMarket === c.id ? "bg-[#38BDF8] text-black" : "border border-white/15 text-muted-foreground hover:text-foreground"
                )}
              >
                {c.titulo}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {itemsMarketFiltrados.map((it) => {
              const tengo = !!poseidos[it.id] || it.precioVC === 0;
              const esEquipado =
                equipado.avatarId === it.id ||
                equipado.insigniaId === it.id ||
                (it.temaCss && equipado.temaCss === it.temaCss) ||
                equipado.mundoId === it.id ||
                equipado.musicaId === it.id ||
                (it.estiloBase && equipado.baseEstilo === it.estiloBase);
              return (
                <div
                  key={it.id}
                  className={cn(
                    "hud-panel p-4 flex flex-col justify-between gap-3",
                    esEquipado ? "border-[#FFC94D] bg-amber-hud/10" : "border-white/15"
                  )}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2 font-mono text-[10px]">
                      <span className="px-2 py-0.5 rounded font-black text-black" style={{ background: it.color }}>
                        {it.badge}
                      </span>
                      <span className="text-muted-foreground">{it.modelo}</span>
                    </div>
                    <h4 className="text-sm font-bold text-foreground">{it.nombre}</h4>
                    <p className="text-xs text-muted-foreground">{it.descripcion}</p>
                    {it.precioUsdRef && (
                      <div className="font-mono text-[10px] text-cyan-hud">Referencia futura: {it.precioUsdRef}</div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-white/10 flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
                    <button
                      type="button"
                      onClick={() => {
                        const r = comprarItemMarketplace(it.id);
                        if (r.ok) toast.success(r.msg);
                        else toast.error(r.msg);
                      }}
                      className={cn(
                        "px-3 py-1.5 rounded font-black",
                        esEquipado
                          ? "bg-green-hud/25 text-green-hud border border-green-hud/50"
                          : tengo
                            ? "bg-[#38BDF8] text-black"
                            : "bg-[#FFC94D] text-black hover:bg-[#ffd66b]"
                      )}
                    >
                      {esEquipado
                        ? "✓ EQUIPADO"
                        : tengo
                          ? "EQUIPAR AHORA"
                          : `DESBLOQUEAR · ${it.precioVC} VC`}
                    </button>

                    {it.acordes && (
                      <button
                        type="button"
                        onClick={() => alternarMusica(it.id, it.acordes!)}
                        className="px-2.5 py-1.5 rounded border border-violet-400/50 text-violet-300 hover:bg-violet-400/15 flex items-center gap-1"
                      >
                        {pistaSonando === it.id ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                        {pistaSonando === it.id ? "Pausar" : "Escuchar"}
                      </button>
                    )}

                    {it.coords3D && (
                      <Link
                        href={`/teatro-3d?modulo=mundial&lat=${it.coords3D.lat}&lng=${it.coords3D.lng}&nombre=${encodeURIComponent(it.coords3D.nombre)}`}
                        className="px-2.5 py-1.5 rounded border border-cyan-hud/45 text-cyan-hud hover:bg-cyan-hud/15"
                      >
                        Abrir en 3D →
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* VISTA 5: MI BASE PERSONAL (ESPACIO PRIVADO + VITRINA DE CARTAS)     */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {vista === "base" && (
        <div className="space-y-4">
          <div
            className="hud-panel p-5 space-y-4 relative overflow-hidden"
            style={{
              borderColor: equipado.baseIluminacion || "#FFC94D",
              background:
                equipado.baseEstilo === "galeria-oro"
                  ? "radial-gradient(circle at 80% 10%, rgba(255,201,77,0.18), rgba(8,8,14,0.95) 60%)"
                  : equipado.baseEstilo === "santuario-neon"
                    ? "radial-gradient(circle at 80% 10%, rgba(232,121,249,0.20), rgba(6,8,18,0.95) 60%)"
                    : "radial-gradient(circle at 80% 10%, rgba(56,189,248,0.18), rgba(5,8,16,0.95) 60%)",
            }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.28em]" style={{ color: equipado.baseIluminacion }}>
                  ESPACIO PRIVADO PERSONALIZABLE · ESTILO {equipado.baseEstilo.toUpperCase()}
                </div>
                <h3 className="font-display text-lg sm:text-2xl font-black text-foreground">
                  {equipado.nombreBase || "Bóveda Polar #01"}
                </h3>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  value={equipado.nombreBase}
                  onChange={(e) => actualizarBasePersonal({ nombreBase: e.target.value })}
                  maxLength={34}
                  placeholder="Nombre de tu Base Personal..."
                  className="px-3 py-1.5 rounded bg-black/60 border border-white/20 font-mono text-xs text-foreground"
                />
                {["#FFC94D", "#38BDF8", "#00FFA3", "#E879F9", "#FF4D5A"].map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    aria-label={`Luz ${hex}`}
                    onClick={() => actualizarBasePersonal({ baseIluminacion: hex })}
                    className={cn(
                      "w-6 h-6 rounded-full border-2",
                      equipado.baseIluminacion === hex ? "border-white scale-110" : "border-white/25"
                    )}
                    style={{ background: hex }}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
              <div className="p-2.5 rounded bg-black/55 border border-white/10">
                <div className="text-[10px] text-muted-foreground">AVATAR EQUIPADO</div>
                <div className="font-bold text-foreground mt-0.5">{avatarObj?.nombre ?? "Estándar"}</div>
              </div>
              <div className="p-2.5 rounded bg-black/55 border border-white/10">
                <div className="text-[10px] text-muted-foreground">INSIGNIA ACTIVA</div>
                <div className="font-bold text-amber mt-0.5">{insigniaObj?.insigniaTexto ?? "Sin equipar"}</div>
              </div>
              <div className="p-2.5 rounded bg-black/55 border border-white/10">
                <div className="text-[10px] text-muted-foreground">TEMA VISUAL</div>
                <div className="font-bold text-cyan-hud mt-0.5 uppercase">{equipado.temaCss}</div>
              </div>
              <div className="p-2.5 rounded bg-black/55 border border-white/10">
                <div className="text-[10px] text-muted-foreground">PODER DE ÁLBUM</div>
                <div className="font-bold text-green-hud mt-0.5">Nv. {sumaNiveles} acumulado</div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <h4 className="font-mono text-xs font-bold text-amber uppercase tracking-wider flex items-center gap-1.5">
              <Star className="w-4 h-4" /> VITRINA DE CARTAS EXHIBIDAS ({vitrina.length}/6)
            </h4>
            <button
              type="button"
              onClick={() => setVista("colecciones")}
              className="font-mono text-xs text-cyan-hud underline"
            >
              Elegir o mejorar cartas →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {vitrina.map((id) => {
              const c = CARTAS_UNIVERSALES.find((x) => x.id === id);
              const est = cartas[id];
              if (!c || !est) return null;
              const metaRareza = RAREZAS_UNIVERSALES[c.rareza];
              const metaCat = CATEGORIAS_COLECCION.find((x) => x.id === c.categoria);
              return (
                <CartaVanguard3D
                  key={c.id}
                  serie={c.serie}
                  titulo={c.titulo}
                  subtitulo={c.subtitulo}
                  categoriaLabel={metaCat?.titulo ?? c.categoria}
                  rarezaLabel={metaRareza.label}
                  rarezaHex={metaRareza.hex}
                  resumen={c.resumenEducativo}
                  pieMeta={c.datoCurioso}
                  nivel={est.nivel}
                  desbloqueada
                  estudiada={est.estudiada}
                  enVitrina
                  onClick={() => {
                    setCartaActiva(c);
                    setOpcionCartaQuiz(null);
                  }}
                  onMejorar={() => {
                    const r = mejorarCarta(c.id);
                    if (r.ok) toast.success(r.msg);
                    else toast.error(r.msg);
                  }}
                  onVitrina={() => alternarVitrina(c.id)}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* MODAL DE ESTUDIO EDUCATIVO + VERIFICACIÓN DE CARTA                  */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {cartaActiva && (
        <div
          className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label={`Expediente de carta ${cartaActiva.titulo}`}
          onClick={(e) => {
            if (e.target === e.currentTarget) setCartaActiva(null);
          }}
        >
          <div className="w-full max-w-xl rounded-xl border border-[#FFC94D]/60 bg-[#080b14] p-5 space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-mono text-[10px] text-cyan-hud">
                  {cartaActiva.serie} · {cartaActiva.epocaOLugar}
                </div>
                <h3 className="font-display text-xl font-black text-foreground">{cartaActiva.titulo}</h3>
                <div className="font-mono text-xs text-amber">{cartaActiva.subtitulo}</div>
              </div>
              <button
                type="button"
                onClick={() => setCartaActiva(null)}
                className="w-8 h-8 rounded border border-white/20 text-foreground flex items-center justify-center"
                aria-label="Cerrar detalle de carta"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
              {cartaActiva.resumenEducativo}
            </p>
            <div className="p-3 rounded-lg bg-amber-hud/10 border border-amber-hud/35 text-xs text-amber/95">
              <strong className="font-mono uppercase text-[10px] block mb-1">Dato Curioso Verificado:</strong>
              {cartaActiva.datoCurioso}
            </div>

            {/* Verificación educativa para ganar VC */}
            <div className="p-3.5 rounded-lg bg-black/55 border border-cyan-hud/35 space-y-2">
              <div className="flex items-center justify-between font-mono text-[10px]">
                <span className="text-cyan-hud font-bold">CERTIFICAR INVESTIGACIÓN EDUCATIVA</span>
                <span className="text-green-hud font-bold">
                  +{cartaActiva.preguntaVerificacion.recompensaVC + RAREZAS_UNIVERSALES[cartaActiva.rareza].bonoEstudioVC} VC
                </span>
              </div>
              <div className="text-xs font-bold text-foreground">{cartaActiva.preguntaVerificacion.enunciado}</div>
              <div className="space-y-1.5">
                {cartaActiva.preguntaVerificacion.opciones.map((op, i) => {
                  const est = cartas[cartaActiva.id];
                  const hecha = !!est?.estudiada;
                  return (
                    <button
                      key={op}
                      type="button"
                      disabled={hecha}
                      onClick={() => {
                        setOpcionCartaQuiz(i);
                        const r = verificarEstudioCarta(cartaActiva.id, i);
                        if (r.acierto) toast.success(r.msg);
                        else toast.error(r.msg);
                      }}
                      className={cn(
                        "w-full text-left px-3 py-1.5 rounded border text-xs transition-colors",
                        hecha && i === cartaActiva.preguntaVerificacion.correcta
                          ? "border-green-hud bg-green-hud/20 text-green-hud font-bold"
                          : opcionCartaQuiz === i && !hecha
                            ? "border-red-hud bg-red-hud/15 text-red-hud"
                            : "border-white/15 hover:border-white/35 text-foreground"
                      )}
                    >
                      {op}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10 font-mono text-xs">
              {cartaActiva.lat != null && cartaActiva.lng != null ? (
                <Link
                  href={`/teatro-3d?modulo=mundial&lat=${cartaActiva.lat}&lng=${cartaActiva.lng}&nombre=${encodeURIComponent(cartaActiva.titulo)}`}
                  className="px-3 py-1.5 rounded bg-[#FFC94D] text-black font-black flex items-center gap-1"
                >
                  <MapPin className="w-3.5 h-3.5" /> Explorar lugar en 3D/2D →
                </Link>
              ) : (
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Globe2 className="w-3.5 h-3.5" /> Colección Universal VANGUARD
                </span>
              )}
              <button
                type="button"
                onClick={() => {
                  const r = mejorarCarta(cartaActiva.id);
                  if (r.ok) toast.success(r.msg);
                  else toast.error(r.msg);
                }}
                className="px-3 py-1.5 rounded bg-[#38BDF8] text-black font-black"
              >
                Mejorar Carta (Nv. {(cartas[cartaActiva.id]?.nivel ?? 1)})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
