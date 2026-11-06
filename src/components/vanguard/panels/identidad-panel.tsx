"use client";

// ============================================================
// v359.0 VANGUARD ID — LA FIRMA VIVA
// El carnet de identidad del agente: perfil, KNOWLEDGE LEVEL con
// metodología pública, estadísticas REALES del estado de la casa,
// historial de actividad (el log de la tienda, no una copia),
// contenido guardado, privacidad por campo, notificaciones,
// bloqueos y anti-suplantación (nombres reservados + huella).
//
// Cero datos inventados: cada número viene del estado vivo
// (game-store + profile-store) y se muestra con su detalle.
// Móvil primero: una columna, chips que apilan, sin desbordes.
// ============================================================

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useGameStore } from "@/lib/game-store";
import { useProfileStore, BANNERS } from "@/lib/profile-store";
import { Countryball } from "@/components/vanguard/countryball";
import { toast } from "sonner";
import {
  Fingerprint, GraduationCap, Hammer, MessagesSquare, Swords, BarChart3,
  Activity, Bookmark, ShieldCheck, Eye, EyeOff, Bell, Ban, History,
  Share2, Copy, Lock, Unlock, BadgeCheck, ChevronRight, Info,
} from "lucide-react";
import {
  conocimientoLevel, insigniasDe, PESOS_KL, NIVELES_KL,
  METODOLOGIA_KL, LIMITACIONES_ID, PRIVACIDAD_DEFECTO,
  ETIQUETAS_PRIVACIDAD, CATEGORIAS_NOTIF_ID, DESCRIPCION_NOTIF_ID,
  aliasValido, huellaDe, type VisibilidadId, type ClaveNotifId,
  type EntradaKL, type EntradaInsignias,
} from "@/lib/vanguard-id";
import { compartirImagen } from "@/lib/gloria-compartir";
import { APP_VERSION_LABEL } from "@/lib/version";

type VistaId = "carnet" | "nivel" | "actividad" | "guardados" | "privacidad" | "seguridad";

const VISTAS: { id: VistaId; label: string; icon: React.ReactNode }[] = [
  { id: "carnet", label: "CARNET", icon: <Fingerprint className="w-3.5 h-3.5" /> },
  { id: "nivel", label: "NIVEL", icon: <GraduationCap className="w-3.5 h-3.5" /> },
  { id: "actividad", label: "ACTIVIDAD", icon: <Activity className="w-3.5 h-3.5" /> },
  { id: "guardados", label: "GUARDADOS", icon: <Bookmark className="w-3.5 h-3.5" /> },
  { id: "privacidad", label: "PRIVACIDAD", icon: <Eye className="w-3.5 h-3.5" /> },
  { id: "seguridad", label: "SEGURIDAD", icon: <ShieldCheck className="w-3.5 h-3.5" /> },
];

const ICONO_DIM: Record<string, React.ReactNode> = {
  EDUCACION: <GraduationCap className="w-4 h-4 text-cyan-hud" />,
  CONTRIBUCION: <Hammer className="w-4 h-4 text-amber" />,
  CONSTRUCTIVA: <MessagesSquare className="w-4 h-4 text-green-hud" />,
  RETOS: <Swords className="w-4 h-4 text-red-hud" />,
};

const BIO_POR_DEFECTO = "Agente en activo. El mundo, en tiempo real.";

export function IdentidadPanel() {
  const [vista, setVista] = useState<VistaId>("carnet");

  // ── estado real de la casa ──
  const alias = useGameStore((s) => s.alias);
  const streak = useGameStore((s) => s.streak);
  const quizCorrect = useGameStore((s) => s.quizCorrect);
  const quizAnswered = useGameStore((s) => s.quizAnswered);
  const readBriefings = useGameStore((s) => s.readBriefings);
  const missionProgress = useGameStore((s) => s.missionProgress);
  const unlockedAchievements = useGameStore((s) => s.unlockedAchievements);
  const forumThreads = useGameStore((s) => s.forumThreads);
  const forumReplies = useGameStore((s) => s.forumReplies);
  const forumLikedIds = useGameStore((s) => s.forumLikedIds);
  const forumLikedReplies = useGameStore((s) => s.forumLikedReplies);
  const pollVotes = useGameStore((s) => s.pollVotes);
  const comments = useGameStore((s) => s.comments);
  const videoReactions = useGameStore((s) => s.videoReactions);
  const desafioHistorial = useGameStore((s) => s.desafioHistorial);
  const wargameStats = useGameStore((s) => s.wargameStats);
  const dailyChallengeClaimed = useGameStore((s) => s.dailyChallengeClaimed);
  const mpStats = useGameStore((s) => s.mpStats);
  const marketTrades = useGameStore((s) => s.marketTrades);
  const marketFavorites = useGameStore((s) => s.marketFavorites);
  const ownedAvatars = useGameStore((s) => s.ownedAvatars);
  const cameras = useGameStore((s) => s.cameras);
  const unlockedBriefings = useGameStore((s) => s.unlockedBriefings);
  const subscribedChannels = useGameStore((s) => s.subscribedChannels);
  const log = useGameStore((s) => s.log);
  const idPrivacidad = useGameStore((s) => s.idPrivacidad);
  const idBloqueados = useGameStore((s) => s.idBloqueados);
  const idNotif = useGameStore((s) => s.idNotif);
  const idHuella = useGameStore((s) => s.idHuella);
  const idAliasHistorial = useGameStore((s) => s.idAliasHistorial);
  const setIdPrivacidad = useGameStore((s) => s.setIdPrivacidad);
  const bloquearAlias = useGameStore((s) => s.bloquearAlias);
  const desbloquearAlias = useGameStore((s) => s.desbloquearAlias);
  const toggleNotifId = useGameStore((s) => s.toggleNotifId);
  const asegurarHuella = useGameStore((s) => s.asegurarHuella);
  const registrarAliasCambio = useGameStore((s) => s.registrarAliasCambio);

  const cbAvatar = useProfileStore((s) => s.cbAvatar);
  const banner = useProfileStore((s) => s.banner);
  const bio = useProfileStore((s) => s.bio);
  const favFaction = useProfileStore((s) => s.favFaction);

  // la huella nace en el primer montaje del panel (vía getState — sin
  // dependencias que vigilar, sin directivas, cero efectos globales)
  useEffect(() => {
    const { idHuella: huella, asegurarHuella: asegurar } = useGameStore.getState();
    if (!huella) asegurar();
  }, []);

  // ── derivados REALES (memo sobre el estado, cero invenciones) ──
  const misionesCompletadas = useMemo(
    () => Object.values(missionProgress).filter((m) => m.completed).length,
    [missionProgress]
  );
  const respuestasForo = useMemo(
    () => Object.values(forumReplies).reduce((a, arr) => a + arr.filter((r) => r.author === alias).length, 0),
    [forumReplies, alias]
  );
  const comentariosDados = useMemo(
    () => Object.values(comments).reduce((a, arr) => a + arr.filter((c) => c.author === alias).length, 0),
    [comments, alias]
  );
  const likesDados = forumLikedIds.length + forumLikedReplies.length + Object.keys(videoReactions).length;

  const entradaKL: EntradaKL = useMemo(
    () => ({
      quizCorrect,
      quizAnswered: quizAnswered.length,
      readBriefings: readBriefings.length,
      misionesCompletadas,
      logrosDesbloqueados: unlockedAchievements.length,
      respuestasForo,
      votosEncuestas: Object.keys(pollVotes).length,
      comentariosDados,
      likesDados,
      hilosPropios: forumThreads.length,
      semanasDesafio: desafioHistorial.length,
      wargamesGanadas: wargameStats.ganadas,
      retosDiariosClaimed: dailyChallengeClaimed.length,
      mpVictorias: mpStats.wins,
    }),
    [quizCorrect, quizAnswered, readBriefings, misionesCompletadas, unlockedAchievements,
      respuestasForo, pollVotes, comentariosDados, likesDados, forumThreads,
      desafioHistorial, wargameStats, dailyChallengeClaimed, mpStats]
  );
  const kl = useMemo(() => conocimientoLevel(entradaKL), [entradaKL]);

  const entradaInsignias: EntradaInsignias = useMemo(
    () => ({
      streak,
      quizCorrect,
      readBriefings: readBriefings.length,
      misionesCompletadas,
      votosEncuestas: Object.keys(pollVotes).length,
      respuestasForo,
      semanasDesafio: desafioHistorial.length,
      wargamesGanadas: wargameStats.ganadas,
      mpVictorias: mpStats.wins,
      operacionesMercado: marketTrades.length,
      avataresPoseidos: ownedAvatars.length,
      camarasColocadas: cameras.length,
      bioEditada: bio !== BIO_POR_DEFECTO,
    }),
    [streak, quizCorrect, readBriefings, misionesCompletadas, pollVotes, respuestasForo,
      desafioHistorial, wargameStats, mpStats, marketTrades, ownedAvatars, cameras, bio]
  );
  const insignias = useMemo(() => insigniasDe(entradaInsignias), [entradaInsignias]);

  // ── carnet compartible (canvas nativo, cero dependencias) ──
  async function compartirCarnet() {
    try {
      const c = document.createElement("canvas");
      c.width = 800; c.height = 450;
      const ctx = c.getContext("2d");
      if (!ctx) throw new Error("sin canvas");
      // fondo: el banner del agente
      const grad = ctx.createLinearGradient(0, 0, 800, 450);
      grad.addColorStop(0, "#0A0A0F");
      grad.addColorStop(1, "#1a1a2e");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 800, 450);
      ctx.fillStyle = "#E8C56A";
      ctx.font = "bold 30px sans-serif";
      ctx.fillText("VANGUARD ID", 40, 60);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 44px sans-serif";
      ctx.fillText(alias.slice(0, 20), 40, 130);
      ctx.font = "22px sans-serif";
      ctx.fillStyle = "#E8C56A";
      ctx.fillText(`KNOWLEDGE LEVEL ${kl.nivel} · ${kl.nombreNivel}`, 40, 180);
      ctx.fillStyle = "rgba(255,255,255,0.75)";
      ctx.font = "18px sans-serif";
      const lineas = [
        `Educación ${Math.round(kl.dimensiones[0].valor)} · Contribución ${Math.round(kl.dimensiones[1].valor)} · Constructiva ${Math.round(kl.dimensiones[2].valor)} · Retos ${Math.round(kl.dimensiones[3].valor)}`,
        `Huella ${idHuella || "—"}`,
        `Insignias ${insignias.filter((i) => i.conseguido).length}/${insignias.length} · ${APP_VERSION_LABEL}`,
      ];
      lineas.forEach((l, i) => ctx.fillText(l, 40, 230 + i * 34));
      ctx.fillStyle = "rgba(255,255,255,0.45)";
      ctx.font = "14px sans-serif";
      ctx.fillText("Índice de conocimiento — no mide popularidad. Pesos públicos en la casa.", 40, 400);
      const dataUrl = c.toDataURL("image/png");
      const via = await compartirImagen(dataUrl, "vanguard-id.png");
      if (via === "no") {
        await navigator.clipboard.writeText(
          `VANGUARD ID — ${alias} · KNOWLEDGE LEVEL ${kl.nivel} (${kl.nombreNivel}) · huella ${idHuella}`
        );
        toast("El carnet se copió como texto (el aparato no compartió imagen)");
      } else {
        toast(via === "share" ? "Carnet compartido" : "Carnet descargado");
      }
    } catch {
      toast("No se pudo pintar el carnet — tus datos no salen del aparato sin permiso");
    }
  }

  return (
    <div className="space-y-4 max-w-full overflow-x-hidden">
      {/* encabezado */}
      <div className="flex items-center gap-2 flex-wrap">
        <Fingerprint className="w-5 h-5 text-amber" />
        <h2 className="text-lg font-bold text-white tracking-wide">VANGUARD ID</h2>
        <span className="text-[10px] uppercase tracking-widest text-white/40">la firma viva · {APP_VERSION_LABEL}</span>
      </div>

      {/* pestañas de vista */}
      <div className="flex gap-1.5 flex-wrap">
        {VISTAS.map((v) => (
          <button
            key={v.id}
            onClick={() => setVista(v.id)}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold tracking-wider border transition-colors",
              vista === v.id
                ? "bg-amber/15 border-amber/50 text-amber"
                : "bg-white/5 border-white/10 text-white/60 hover:text-white"
            )}
          >
            {v.icon}{v.label}
          </button>
        ))}
      </div>

      {vista === "carnet" && (
        <VistaCarnet
          alias={alias} cbAvatar={cbAvatar} banner={banner} bio={bio} favFaction={favFaction}
          kl={kl} insignias={insignias} idHuella={idHuella} idPrivacidad={idPrivacidad}
          onCompartir={compartirCarnet}
        />
      )}
      {vista === "nivel" && <VistaNivel kl={kl} />}
      {vista === "actividad" && <VistaActividad log={log} />}
      {vista === "guardados" && (
        <VistaGuardados
          unlockedBriefings={unlockedBriefings} readBriefings={readBriefings}
          marketFavorites={marketFavorites} subscribedChannels={subscribedChannels}
          forumLikedIds={forumLikedIds.length} desafioHistorial={desafioHistorial.length}
        />
      )}
      {vista === "privacidad" && (
        <VistaPrivacidad idPrivacidad={idPrivacidad} setIdPrivacidad={setIdPrivacidad} />
      )}
      {vista === "seguridad" && (
        <VistaSeguridad
          alias={alias} idBloqueados={idBloqueados} idNotif={idNotif}
          idHuella={idHuella} idAliasHistorial={idAliasHistorial}
          bloquearAlias={bloquearAlias} desbloquearAlias={desbloquearAlias}
          toggleNotifId={toggleNotifId} registrarAliasCambio={registrarAliasCambio}
        />
      )}
    </div>
  );
}

// ── CARNET ───────────────────────────────────────────────────

function VistaCarnet({
  alias, cbAvatar, banner, bio, favFaction, kl, insignias, idHuella, idPrivacidad, onCompartir,
}: {
  alias: string; cbAvatar: string; banner: string; bio: string; favFaction: string;
  kl: ReturnType<typeof conocimientoLevel>;
  insignias: ReturnType<typeof insigniasDe>;
  idHuella: string; idPrivacidad: typeof PRIVACIDAD_DEFECTO;
  onCompartir: () => void;
}) {
  const conseguidas = insignias.filter((i) => i.conseguido);
  return (
    <div className="space-y-4">
      <div
        className="rounded-2xl border border-amber/30 overflow-hidden"
        style={{ background: BANNERS[banner as keyof typeof BANNERS]?.css ?? BANNERS.aurora.css }}
      >
        <div className="p-4 sm:p-5 bg-black/35">
          <div className="flex items-start gap-4 flex-wrap">
            <div className="shrink-0 rounded-xl bg-black/50 p-1" style={{ boxShadow: "0 0 0 2px #E8C56A55" }}>
              <Countryball code={cbAvatar} className="w-16 h-16 sm:w-20 sm:h-20" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-xl sm:text-2xl font-black text-white truncate max-w-full">{alias}</p>
                <span className="px-2 py-0.5 rounded-md bg-amber/20 border border-amber/40 text-amber text-[10px] font-black tracking-wider whitespace-nowrap">
                  KL {kl.nivel} · {kl.nombreNivel}
                </span>
              </div>
              {idPrivacidad.mostrarBio && (
                <p className="text-xs text-white/70 mt-1 line-clamp-2">{bio}</p>
              )}
              {idPrivacidad.mostrarFaccion && (
                <p className="text-[11px] text-white/50 mt-1">{favFaction}</p>
              )}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="text-[10px] text-white/50">HUELLA</span>
                <code className="text-[11px] text-cyan-hud tracking-widest">{idHuella || "—"}</code>
                <button
                  onClick={() => { navigator.clipboard.writeText(idHuella); toast("Huella copiada"); }}
                  className="text-white/40 hover:text-white"
                  aria-label="copiar huella"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button size="sm" onClick={onCompartir} className="bg-amber text-black hover:bg-amber/85 font-bold">
          <Share2 className="w-4 h-4 mr-1.5" /> COMPARTIR CARNET
        </Button>
        <span className="text-[10px] text-white/40 self-center max-w-[220px] leading-tight">
          {ETIQUETAS_PRIVACIDAD[idPrivacidad.visibilidad]}
        </span>
      </div>

      <div>
        <p className="text-[11px] font-bold tracking-widest text-white/50 mb-2">
          INSIGNIAS ({conseguidas.length}/{insignias.length}) — derivadas del estado real
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {insignias.map((i) => (
            <div
              key={i.id}
              className={cn(
                "rounded-xl border p-2.5",
                i.conseguido ? "border-amber/40 bg-amber/5" : "border-white/10 bg-white/[0.03]"
              )}
            >
              <div className="flex items-center gap-2">
                {i.conseguido
                  ? <BadgeCheck className="w-4 h-4 text-amber shrink-0" />
                  : <Lock className="w-3.5 h-3.5 text-white/30 shrink-0" />}
                <p className={cn("text-[11px] font-black tracking-wider truncate", i.conseguido ? "text-amber" : "text-white/50")}>
                  {i.nombre}
                </p>
              </div>
              <p className="text-[10px] text-white/50 mt-0.5">{i.descripcion}</p>
              <div className="h-1 rounded-full bg-white/10 mt-1.5 overflow-hidden">
                <div className="h-full bg-amber" style={{ width: `${Math.round(i.progreso * 100)}%` }} />
              </div>
              <p className="text-[9px] text-white/40 mt-1">{i.detalle}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── NIVEL (KNOWLEDGE LEVEL) ──────────────────────────────────

function VistaNivel({ kl }: { kl: ReturnType<typeof conocimientoLevel> }) {
  const totalPesos = Object.values(PESOS_KL).reduce((a, b) => a + b, 0);
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-cyan-hud/30 bg-cyan-hud/5 p-4">
        <div className="flex items-end gap-3 flex-wrap">
          <p className="text-5xl font-black text-white leading-none">{kl.puntaje.toFixed(1)}</p>
          <div className="pb-1">
            <p className="text-[10px] tracking-widest text-white/50">KNOWLEDGE LEVEL</p>
            <p className="text-sm font-black text-cyan-hud">NIVEL {kl.nivel} · {kl.nombreNivel}</p>
          </div>
        </div>
        {kl.minSiguiente !== null && (
          <p className="text-[11px] text-white/50 mt-2 flex items-center gap-1">
            <ChevronRight className="w-3 h-3" />
            Siguiente nivel en {Math.max(0, kl.minSiguiente - kl.puntaje).toFixed(1)} puntos
            (umbral {kl.minSiguiente})
          </p>
        )}
      </div>

      {/* pesos publicados */}
      <div className="flex items-center gap-2 flex-wrap text-[10px] text-white/50">
        <Info className="w-3 h-3" />
        <span>Pesos publicados: Educación {PESOS_KL.EDUCACION} · Contribución {PESOS_KL.CONTRIBUCION} · Constructiva {PESOS_KL.CONSTRUCTIVA} · Retos {PESOS_KL.RETOS} — suma exacta {totalPesos}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {kl.dimensiones.map((d) => (
          <div key={d.clave} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                {ICONO_DIM[d.clave]}
                <p className="text-[11px] font-bold text-white truncate">{d.nombre}</p>
              </div>
              <p className="text-sm font-black text-amber shrink-0">
                {d.valor.toFixed(0)}<span className="text-white/30 text-[10px]"> ×{d.peso}</span>
              </p>
            </div>
            <div className="h-1.5 rounded-full bg-white/10 mt-2 overflow-hidden">
              <div className="h-full bg-cyan-hud" style={{ width: `${Math.round(d.valor)}%` }} />
            </div>
            <div className="mt-2 space-y-1">
              {d.desglose.map((p) => (
                <p key={p.etiqueta} className="text-[10px] text-white/45 flex justify-between gap-2">
                  <span className="truncate">{p.etiqueta}</span>
                  <span className="shrink-0">{p.valor}/{p.techo}</span>
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* metodología — plegada, server de la verdad */}
      <details className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
        <summary className="text-[11px] font-bold tracking-widest text-amber cursor-pointer">
          METODOLOGÍA DEL ÍNDICE (pesos y fórmula, auditable en la fuente)
        </summary>
        <ul className="mt-2 space-y-1.5">
          {METODOLOGIA_KL.map((m, i) => (
            <li key={i} className="text-[11px] text-white/60 leading-relaxed">· {m}</li>
          ))}
        </ul>
      </details>
      <details className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
        <summary className="text-[11px] font-bold tracking-widest text-white/60 cursor-pointer">
          LÍMITES DE ESTE CARNET (lo que la casa confiesa)
        </summary>
        <ul className="mt-2 space-y-1.5">
          {LIMITACIONES_ID.map((m, i) => (
            <li key={i} className="text-[11px] text-white/60 leading-relaxed">· {m}</li>
          ))}
        </ul>
      </details>

      <details className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
        <summary className="text-[11px] font-bold tracking-widest text-white/60 cursor-pointer">
          ESCALAFÓN COMPLETO ({NIVELES_KL.length} niveles, umbrales públicos)
        </summary>
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1">
          {NIVELES_KL.map((n) => (
            <p key={n.nivel} className={cn("text-[11px] flex justify-between", kl.nivel === n.nivel ? "text-amber font-bold" : "text-white/50")}>
              <span>{n.nivel}. {n.nombre}</span>
              <span>≥ {n.min}</span>
            </p>
          ))}
        </div>
      </details>
    </div>
  );
}

// ── ACTIVIDAD (el log real de la tienda) ─────────────────────

function VistaActividad({ log }: { log: { ts: number; msg: string; delta?: number }[] }) {
  const cola = log.slice(0, 40);
  return (
    <div className="space-y-2">
      <p className="text-[11px] text-white/50">
        Historial de actividad REAL (el log de la casa, se escribe cuando algo ocurre — {log.length} eventos en este aparato).
        Este historial es PRIVADO por defecto: solo viaja si lo marcas público en PRIVACIDAD.
      </p>
      {cola.length === 0 && (
        <p className="text-[11px] text-white/40 rounded-xl border border-white/10 bg-white/[0.03] p-3">
          Sin eventos todavía — lee un briefing o completa una misión y el log empezará a hablar.
        </p>
      )}
      <div className="rounded-xl border border-white/10 bg-white/[0.03] divide-y divide-white/5 max-h-[420px] overflow-y-auto">
        {cola.map((e, i) => (
          <p key={i} className="px-3 py-2 text-[11px] text-white/70 break-words">
            <span className="text-white/35 mr-1.5">{new Date(e.ts).toLocaleDateString()}</span>{e.msg}
          </p>
        ))}
      </div>
    </div>
  );
}

// ── GUARDADOS (contenido guardado real) ──────────────────────

function VistaGuardados({
  unlockedBriefings, readBriefings, marketFavorites, subscribedChannels, forumLikedIds, desafioHistorial,
}: {
  unlockedBriefings: string[]; readBriefings: string[]; marketFavorites: string[];
  subscribedChannels: string[]; forumLikedIds: number; desafioHistorial: number;
}) {
  const filas = [
    { etiqueta: "Briefings desbloqueados", valor: unlockedBriefings.length, nota: "la colección comprada del archivo" },
    { etiqueta: "Briefings leídos", valor: readBriefings.length, nota: "alimenta la dimensión EDUCACIÓN" },
    { etiqueta: "Tickers favoritos (bolsa)", valor: marketFavorites.length, nota: marketFavorites.slice(0, 8).join(" · ") || "sin favoritos" },
    { etiqueta: "Canales suscritos", valor: subscribedChannels.length, nota: subscribedChannels.slice(0, 8).join(" · ") || "sin suscripciones" },
    { etiqueta: "Hilos del foro con like", valor: forumLikedIds, nota: "tu devolución a la comunidad" },
    { etiqueta: "Semanas WORLD CHALLENGE", valor: desafioHistorial, nota: "el salón de los fantasmas" },
  ];
  return (
    <div className="space-y-2">
      <p className="text-[11px] text-white/50">
        Lo que guardaste en la casa — cada número es el estado real de este aparato.
        La lista de favoritos es PRIVADA por defecto (PRIVACIDAD → favoritos OFF).
      </p>
      <div className="rounded-xl border border-white/10 divide-y divide-white/5">
        {filas.map((f) => (
          <div key={f.etiqueta} className="px-3 py-2.5 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-white truncate">{f.etiqueta}</p>
              <p className="text-[10px] text-white/40 truncate">{f.nota}</p>
            </div>
            <p className="text-lg font-black text-amber shrink-0">{f.valor}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── PRIVACIDAD ───────────────────────────────────────────────

function VistaPrivacidad({
  idPrivacidad, setIdPrivacidad,
}: {
  idPrivacidad: typeof PRIVACIDAD_DEFECTO;
  setIdPrivacidad: (p: Partial<typeof PRIVACIDAD_DEFECTO>) => void;
}) {
  const campos: { clave: keyof typeof PRIVACIDAD_DEFECTO; etiqueta: string; nota: string }[] = [
    { clave: "mostrarNivel", etiqueta: "Nivel KL", nota: "el nivel y su nombre en el carnet" },
    { clave: "mostrarStats", etiqueta: "Estadísticas", nota: "los contadores de la casa" },
    { clave: "mostrarActividad", etiqueta: "Actividad", nota: "tu historial reciente (OFF por defecto)" },
    { clave: "mostrarBio", etiqueta: "Bio", nota: "la frase que firmaste" },
    { clave: "mostrarFaccion", etiqueta: "Facción", nota: "tu lado declarado" },
    { clave: "mostrarFavoritos", etiqueta: "Favoritos", nota: "tus gustos guardados (OFF por defecto)" },
  ];
  return (
    <div className="space-y-3">
      <p className="text-[11px] text-white/50">
        Tú decides qué muestra el carnet. La casa jamás pide ubicación, correo, teléfono
        ni datos de pago — y este panel no los toca.
      </p>
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 space-y-2">
        <p className="text-[11px] font-bold tracking-widest text-white/60">VISIBILIDAD DEL CARNET</p>
        {(Object.keys(ETIQUETAS_PRIVACIDAD) as VisibilidadId[]).map((v) => (
          <button
            key={v}
            onClick={() => setIdPrivacidad({ visibilidad: v })}
            className={cn(
              "w-full text-left px-3 py-2 rounded-lg border text-[11px] transition-colors",
              idPrivacidad.visibilidad === v
                ? "border-amber/50 bg-amber/10 text-amber"
                : "border-white/10 bg-white/[0.02] text-white/60 hover:text-white"
            )}
          >
            <span className="font-black tracking-wider">{v}</span>
            <span className="block text-[10px] opacity-70 mt-0.5">{ETIQUETAS_PRIVACIDAD[v]}</span>
          </button>
        ))}
      </div>
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 space-y-2">
        <p className="text-[11px] font-bold tracking-widest text-white/60">CAMPOS PÚBLICOS</p>
        {campos.map((c) => {
          const on = idPrivacidad[c.clave] as boolean;
          return (
            <button
              key={c.clave}
              onClick={() => setIdPrivacidad({ [c.clave]: !on })}
              className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg border border-white/10 bg-white/[0.02] text-left"
            >
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-white truncate">{c.etiqueta}</p>
                <p className="text-[10px] text-white/40 truncate">{c.nota}</p>
              </div>
              {on
                ? <Eye className="w-4 h-4 text-green-hud shrink-0" />
                : <EyeOff className="w-4 h-4 text-white/30 shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── SEGURIDAD ────────────────────────────────────────────────

function VistaSeguridad({
  alias, idBloqueados, idNotif, idHuella, idAliasHistorial,
  bloquearAlias, desbloquearAlias, toggleNotifId, registrarAliasCambio,
}: {
  alias: string; idBloqueados: string[]; idNotif: Record<ClaveNotifId, boolean>;
  idHuella: string; idAliasHistorial: { alias: string; fecha: number }[];
  bloquearAlias: (a: string) => void; desbloquearAlias: (a: string) => void;
  toggleNotifId: (k: ClaveNotifId) => void;
  registrarAliasCambio: (a: string) => void;
}) {
  const [nuevoBloqueo, setNuevoBloqueo] = useState("");
  const [nuevoAlias, setNuevoAlias] = useState(alias);

  function firmarAlias() {
    const v = aliasValido(nuevoAlias);
    if (!v.ok) { toast(v.motivo ?? "Alias inválido"); return; }
    if (nuevoAlias.trim() === alias) { toast("Ese ya es tu alias"); return; }
    registrarAliasCambio(nuevoAlias.trim());
    toast(`Firmado: ${anteriorHistoria(idAliasHistorial)} → ${nuevoAlias.trim()}`);
  }

  return (
    <div className="space-y-3">
      {/* identidad verificable */}
      <div className="rounded-xl border border-cyan-hud/30 bg-cyan-hud/5 p-3">
        <p className="text-[11px] font-bold tracking-widest text-cyan-hud flex items-center gap-1.5">
          <Fingerprint className="w-3.5 h-3.5" /> HUELLA DE IDENTIDAD
        </p>
        <code className="block text-lg font-black text-white tracking-[0.2em] mt-1">{idHuella || "—"}</code>
        <p className="text-[10px] text-white/50 mt-1 leading-relaxed">
          Código estable de por vida: dos agentes de confianza pueden comparar huellas
          para verificar que hablan con la misma persona, aunque el alias cambie.
          La casa no lo regenera jamás.
        </p>
      </div>

      {/* cambio de alias con historia */}
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 space-y-2">
        <p className="text-[11px] font-bold tracking-widest text-white/60 flex items-center gap-1.5">
          <History className="w-3.5 h-3.5" /> FIRMAR NUEVO ALIAS
        </p>
        <div className="flex gap-2">
          <Input
            value={nuevoAlias}
            onChange={(e) => setNuevoAlias(e.target.value)}
            className="h-8 text-xs bg-black/40"
            maxLength={20}
            placeholder="tu nuevo alias"
          />
          <Button size="sm" onClick={firmarAlias} className="bg-amber text-black hover:bg-amber/85 font-bold shrink-0">
            FIRMAR
          </Button>
        </div>
        <p className="text-[10px] text-white/40 leading-relaxed">
          Los roles oficiales (DUENO, ADMIN, VANGUARD, MODERADOR…) están reservados:
          nadie puede firmarlos. Cada cambio queda en tu historia de alias — la suplantación
          deja rastro.
        </p>
        {idAliasHistorial.length > 0 && (
          <div className="pt-1 space-y-1">
            {idAliasHistorial.slice().reverse().map((h, i) => (
              <p key={i} className="text-[10px] text-white/50">
                {new Date(h.fecha).toLocaleDateString()} — firmó <span className="text-white/80">{h.alias}</span>
              </p>
            ))}
          </div>
        )}
      </div>

      {/* bloqueos */}
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 space-y-2">
        <p className="text-[11px] font-bold tracking-widest text-white/60 flex items-center gap-1.5">
          <Ban className="w-3.5 h-3.5" /> AGENTES BLOQUEADOS ({idBloqueados.length})
        </p>
        <div className="flex gap-2">
          <Input
            value={nuevoBloqueo}
            onChange={(e) => setNuevoBloqueo(e.target.value)}
            className="h-8 text-xs bg-black/40"
            placeholder="alias a bloquear"
            maxLength={20}
          />
          <Button
            size="sm"
            variant="outline"
            className="border-red-hud/40 text-red-hud hover:bg-red-hud/10 font-bold shrink-0"
            onClick={() => {
              const a = nuevoBloqueo.trim();
              if (!a) return;
              if (a === alias) { toast("No puedes bloquearte a ti mismo"); return; }
              bloquearAlias(a);
              setNuevoBloqueo("");
              toast(`${a} bloqueado`);
            }}
          >
            BLOQUEAR
          </Button>
        </div>
        {idBloqueados.length === 0 ? (
          <p className="text-[10px] text-white/40">Nadie bloqueado — tu comunidad empieza limpia.</p>
        ) : (
          <div className="space-y-1">
            {idBloqueados.map((b) => (
              <div key={b} className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/5">
                <p className="text-[11px] text-white/70 truncate">{b}</p>
                <button
                  onClick={() => { desbloquearAlias(b); toast(`${b} desbloqueado`); }}
                  className="text-white/40 hover:text-green-hud shrink-0"
                  aria-label={`desbloquear ${b}`}
                >
                  <Unlock className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
        <p className="text-[10px] text-white/40 leading-relaxed">
          Bloquear es local y silencioso: el bloqueado no se entera, no hay contra-ataque posible.
          Para conductas graves usa además la denuncia del módulo correspondiente (la moderación
          humana de la casa vive en el Núcleo).
        </p>
      </div>

      {/* notificaciones */}
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 space-y-2">
        <p className="text-[11px] font-bold tracking-widest text-white/60 flex items-center gap-1.5">
          <Bell className="w-3.5 h-3.5" /> NOTIFICACIONES
        </p>
        {CATEGORIAS_NOTIF_ID.map((k) => (
          <button
            key={k}
            onClick={() => toggleNotifId(k)}
            className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg border border-white/10 bg-white/[0.02] text-left"
          >
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-white uppercase truncate">{k}</p>
              <p className="text-[10px] text-white/40 truncate">{DESCRIPCION_NOTIF_ID[k]}</p>
            </div>
            <span className={cn("text-[10px] font-black px-2 py-0.5 rounded-md shrink-0",
              idNotif[k] ? "bg-green-hud/15 text-green-hud" : "bg-white/10 text-white/40")}>
              {idNotif[k] ? "ON" : "OFF"}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function anteriorHistoria(h: { alias: string; fecha: number }[]): string {
  return h.length > 0 ? h[h.length - 1].alias : "sin alias previo";
}
