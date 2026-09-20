"use client";

// ====== RED DE CÁMARAS VANGUARD ======
// Compra cámaras, despliegalas donde quieras en el globo 3D y vigila devastaciones en vivo.
// Las cámaras generan intel (monedas) 24/7 según los frentes cercanos.
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { PanelHeader } from "../panel-header";
import { useGameStore } from "@/lib/game-store";
import { CAMERA_MODELS, CCTV_SCENES, getCameraModel, ELITE_PASS, type CameraModel } from "@/lib/camera-data";
import type { PlacedCamera, CapturedCameraEvent } from "@/lib/game-store";
import { CoordChip } from "../world-map-svg";
import type { Globe3DMarker } from "@/components/vanguard/globe-map-3d";
import { FlagBadge } from "../flag-badge";
import { VIcon } from "../vanguard-icon";
import { CONFLICTS, type ConflictRegion } from "@/lib/game-data";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Video, Coins, Zap, Radar, Crosshair, X, Trash2, Radio, Moon,
  Sun, Crown, Download, MapPin, Activity, PackageOpen, ShieldCheck, Gem,
} from "lucide-react";

// ---------- utilidades CCTV ----------
// v14 — GLOBO 3D de cámaras: reemplaza el mapa plano de despliegue
const GlobeMap3D = dynamic(
  () => import("@/components/vanguard/globe-map-3d").then((m) => m.GlobeMap3D),
  { ssr: false, loading: () => (
    <div className="hud-corner p-10 flex items-center justify-center text-[11px] font-mono text-muted-foreground uppercase tracking-widest">
      Cargando globo 3D...
    </div>
  ) }
);

const LEVEL_HEX_CCTV: Record<string, string> = {
  CRITICO: "#FF3B30",
  TENSION: "#FF8A3B",
  INESTABILIDAD: "#A855F7",
  VIGILANCIA: "#38BDF8",
};

function CamerasGlobe3D({
  conflicts, cameras, selectedCamera, onSelectCamera, pendingSpot, onGlobeClick,
}: {
  conflicts: ConflictRegion[];
  cameras: PlacedCamera[];
  selectedCamera: string | null;
  onSelectCamera: (id: string) => void;
  pendingSpot: { lat: number; lng: number } | null;
  onGlobeClick: (lat: number, lng: number) => void;
}) {
  const markers = useMemo(() => {
    const arr: Globe3DMarker[] = [];
    for (const c of conflicts) {
      arr.push({
        id: `conf-${c.id}`,
        lat: c.lat,
        lng: c.lng,
        color: LEVEL_HEX_CCTV[c.level] ?? "#38BDF8",
        size: 0.3 + (c.intensity / 100) * 0.25,
        alt: 0.03 + (c.intensity / 100) * 0.28,
        label: c.name,
        labelTag: `FRENTE · ${c.level}`,
      });
    }
    for (const cam of cameras) {
      arr.push({
        id: `cam-${cam.id}`,
        lat: cam.lat,
        lng: cam.lng,
        color: cam.id === selectedCamera ? "#FFFFFF" : "#38BDF8",
        size: cam.id === selectedCamera ? 0.5 : 0.32,
        alt: 0.02,
        ring: cam.id === selectedCamera,
        ringMax: 3,
        label: cam.name,
        labelTag: "TU CÁMARA",
        onClick: () => onSelectCamera(cam.id),
      });
    }
    if (pendingSpot) {
      arr.push({
        id: "pending",
        lat: pendingSpot.lat,
        lng: pendingSpot.lng,
        color: "#00FF87",
        size: 0.45,
        alt: 0.05,
        ring: true,
        ringMax: 4,
        label: "Posición elegida — confirma abajo",
        labelTag: "NUEVA CÁMARA",
      });
    }
    return arr;
  }, [conflicts, cameras, selectedCamera, pendingSpot, onSelectCamera]);

  return (
    <GlobeMap3D
      markers={markers}
      onGlobeClick={onGlobeClick}
      height="min(56vh, 520px)"
      minHeight={300}
      autoRotate={false}
      ariaLabel="Globo 3D de despliegue de cámaras de vigilancia"
    />
  );
}

function sceneForCamera(camId: string, tick: number) {
  const h = Array.from(camId).reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7);
  const idx = (Math.abs(h) + tick) % CCTV_SCENES.length;
  return CCTV_SCENES[idx];
}

function fmtClock(ts: number) {
  const d = new Date(ts);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

function fmtDate(ts: number) {
  const d = new Date(ts);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function nearestConflict(lat: number, lng: number) {
  let best = CONFLICTS[0];
  let bestD = Infinity;
  for (const c of CONFLICTS) {
    const d = Math.sqrt((c.lat - lat) ** 2 + (c.lng - lng) ** 2);
    if (d < bestD) {
      bestD = d;
      best = c;
    }
  }
  return { conflict: best, dist: bestD };
}

// ---------- overlay CCTV ----------
function CctvOverlay({ cam, night }: { cam: PlacedCamera; night: boolean }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <>
      {/* scanlines */}
      <div className="absolute inset-0 pointer-events-none scanline opacity-60" />
      {/* vignette */}
      <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: "inset 0 0 90px 24px rgba(0,0,0,0.75)" }} />
      {/* night tint */}
      {night && <div className="absolute inset-0 pointer-events-none bg-green-hud/25 mix-blend-overlay" />}
      {/* HUD data */}
      <div className="absolute top-2 left-2 flex items-center gap-2 text-[10px] font-mono">
        <span className="flex items-center gap-1 text-red-hud font-bold">
          <span className="w-2 h-2 rounded-full bg-red-hud blink-soft" /> REC
        </span>
        <span className="text-foreground/90 bg-black/50 px-1.5 py-0.5 rounded-sm">{cam.id}</span>
      </div>
      <div className="absolute top-2 right-2 text-right text-[10px] font-mono text-foreground/90 bg-black/50 px-1.5 py-0.5 rounded-sm">
        <div>{fmtDate(now)} {fmtClock(now)}</div>
        <div className="text-cyan-hud">{night ? "MODO NOCTURNO" : "VIS ESTANDAR"}</div>
      </div>
      <div className="absolute bottom-2 left-2 text-[10px] font-mono text-foreground/80 bg-black/50 px-1.5 py-0.5 rounded-sm">
        <div className="text-amber">{cam.name}</div>
        <CoordChip lat={cam.lat} lng={cam.lng} />
      </div>
      {/* reticula */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30">
        <div className="w-16 h-16 border border-foreground/60 rounded-sm" />
      </div>
    </>
  );
}

// ---------- feed en vivo (modal) ----------
function LiveFeedModal({ cam, open, onOpenChange }: { cam: PlacedCamera | null; open: boolean; onOpenChange: (o: boolean) => void }) {
  const registerCameraEvent = useGameStore((s) => s.registerCameraEvent);
  const isElite = useGameStore((s) => s.isElite);
  const model = cam ? getCameraModel(cam.modelId) : null;
  const [tick, setTick] = useState(0);
  const [night, setNight] = useState(false);
  const [event, setEvent] = useState<CapturedCameraEvent | null>(null);
  const [flash, setFlash] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [lastCamId, setLastCamId] = useState<string | null>(null);
  const camKey = cam?.id ?? null;

  // reinicia el feed cuando cambia la camara (patron de ajuste durante render)
  if (camKey !== lastCamId) {
    setLastCamId(camKey);
    setEvent(null);
    setTick(0);
  }

  // generador de eventos en vivo: cada 7s hay probabilidad de captar devastacion
  useEffect(() => {
    if (!open || !cam) return;
    timerRef.current = setInterval(() => {
      setTick((t) => t + 1);
      if (Math.random() < 0.55) {
        setFlash(true);
        setTimeout(() => setFlash(false), 350);
        const ev = registerCameraEvent(cam.id);
        if (ev) setEvent(ev);
      }
    }, 7000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [open, cam, registerCameraEvent]);

  const zone = useMemo(() => (cam ? nearestConflict(cam.lat, cam.lng) : null), [cam]);
  const inRange = zone && model && zone.dist <= model.radiusDeg;
  const scene = cam ? sceneForCamera(cam.id, tick) : null;

  if (!cam || !model) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!fixed hud-panel border-cyan-hud sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="font-mono text-cyan-hud flex items-center gap-2">
            <Video className="w-5 h-5" /> TRANSMISION EN VIVO — {cam.name}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground font-mono text-[11px]">
            {model.name} · {model.spec} {isElite() && <span className="text-amber ml-1">ELITE x2</span>}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {/* pantalla */}
          <div className={cn("relative rounded-sm overflow-hidden hud-corner border-cyan-hud/60 bg-black", flash && "ring-2 ring-red-hud")}>
            { }
            <img
              src={`/assets/cctv/${scene?.id}.png`}
              alt={`Vista en vivo de ${cam.name}`}
              className="w-full block object-cover"
              style={{ aspectRatio: "16/9", filter: night ? "grayscale(1) brightness(1.15) hue-rotate(60deg) saturate(2.2)" : "saturate(0.85) contrast(1.05)" }}
              draggable={false}
            />
            <CctvOverlay cam={cam} night={night} />

            {/* bandera de zona */}
            <div className="absolute bottom-2 right-2 flex items-center gap-1.5 bg-black/60 px-1.5 py-1 rounded-sm">
              {inRange && zone ? (
                <>
                  <FlagBadge code={zone.conflict.flag} />
                  <span className="text-[9px] font-mono text-red-hud font-bold">FRENTE EN RANGO</span>
                </>
              ) : (
                <span className="text-[9px] font-mono text-muted-foreground">SIN FRENTE EN RANGO · INTEL BASICA</span>
              )}
            </div>

            {/* evento detectado */}
            <AnimatePresence>
              {event && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute inset-x-3 bottom-3 border border-red-hud bg-black/85 px-3 py-2 rounded-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-[10px] font-mono text-red-hud font-bold flex items-center gap-1">
                        <Zap className="w-3 h-3" /> DEVASTACION DETECTADA
                      </div>
                      <div className="text-xs font-mono text-foreground truncate">{event.title}</div>
                      <div className="text-[10px] text-muted-foreground truncate">{event.detail}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs font-mono text-amber font-bold">+{event.coins} MON</div>
                      <div className="text-[10px] font-mono text-cyan-hud">+{event.xp} XP</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* controles */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              {model.nightVision ? (
                <Button size="sm" variant="outline" onClick={() => setNight((n) => !n)} className="font-mono text-[11px] h-8 border-cyan-hud/50 text-cyan-hud">
                  {night ? <Sun className="w-3.5 h-3.5 mr-1" /> : <Moon className="w-3.5 h-3.5 mr-1" />}
                  {night ? "VIS ESTANDAR" : "VISION NOCTURNA"}
                </Button>
              ) : (
                <span className="text-[10px] font-mono text-muted-foreground border border-border px-2 py-1.5 rounded-sm">SENSOR NOCTURNO NO DISPONIBLE EN ESTE MODELO</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
              <span className="flex items-center gap-1"><Activity className="w-3 h-3 text-cyan-hud" /> EVENTOS CAPTADOS: {cam.eventsCaught}</span>
              <span className="flex items-center gap-1"><Coins className="w-3 h-3 text-amber" /> TOTAL: {cam.totalEarned}</span>
            </div>
          </div>

          {/* zona monitoreada */}
          <div className="hud-corner p-2.5 bg-secondary/40 text-[11px] font-mono">
            <span className="text-muted-foreground">ZONA MAS CERCANA: </span>
            <span className="text-foreground">{zone?.conflict.name}</span>
            <span className="text-muted-foreground"> · DISTANCIA {zone ? zone.dist.toFixed(1) : "?"}° · RADIO ACTIVO {model.radiusDeg}° · {inRange ? <span className="text-green-hud">COBRANDO TARIFA PLENA</span> : <span className="text-amber">TARIFA REDUCIDA 15%</span>}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------- panel principal ----------
export function CamerasPanel() {
  const cameras = useGameStore((s) => s.cameras);
  const eventsLog = useGameStore((s) => s.cameraEventsLog);
  const totalIncome = useGameStore((s) => s.cameraTotalIncome);
  const totalEvents = useGameStore((s) => s.cameraTotalEvents);
  const coins = useGameStore((s) => s.coins);
  const gems = useGameStore((s) => s.gems);
  const placeCamera = useGameStore((s) => s.placeCamera);
  const removeCamera = useGameStore((s) => s.removeCamera);
  const collectCamera = useGameStore((s) => s.collectCamera);
  const collectAllCameras = useGameStore((s) => s.collectAllCameras);
  const cameraIncomeRate = useGameStore((s) => s.cameraIncomeRate);
  const cameraPending = useGameStore((s) => s.cameraPending);
  const isElite = useGameStore((s) => s.isElite);
  const eliteUntil = useGameStore((s) => s.eliteUntil);
  const eliteLastClaimDate = useGameStore((s) => s.eliteLastClaimDate);
  const activateElite = useGameStore((s) => s.activateElite);
  const claimEliteDaily = useGameStore((s) => s.claimEliteDaily);

  const [deployModel, setDeployModel] = useState<CameraModel | null>(null);
  const [pendingSpot, setPendingSpot] = useState<{ lat: number; lng: number } | null>(null);
  const [camName, setCamName] = useState("");
  const [liveCamId, setLiveCamId] = useState<string | null>(null);
  const [pendingTotal, setPendingTotal] = useState(0);
  const [tickT, setTickT] = useState(0);

  // refresco de ingresos acumulados cada 4s
  useEffect(() => {
    const t = setInterval(() => {
      setTickT((x) => x + 1);
      const s = useGameStore.getState();
      setPendingTotal(s.cameras.reduce((acc, c) => acc + s.cameraPending(c), 0));
    }, 4000);
    return () => clearInterval(t);
  }, []);

  const elite = isElite();

  const handleMapClick = useCallback(
    (lat: number, lng: number) => {
      if (deployModel) setPendingSpot({ lat, lng });
    },
    [deployModel]
  );

  const confirmDeploy = () => {
    if (!deployModel || !pendingSpot) return;
    const res = placeCamera(deployModel.id, pendingSpot.lat, pendingSpot.lng, camName || undefined);
    if (res.ok) {
      toast.success("Cámara desplegada", { description: `${deployModel.name} operando en LAT ${pendingSpot.lat.toFixed(1)} / LNG ${pendingSpot.lng.toFixed(1)}` });
      setPendingSpot(null);
      setDeployModel(null);
      setCamName("");
    } else {
      toast.error("Despliegue rechazado", { description: res.reason });
    }
  };

  const liveCam = cameras.find((c) => c.id === liveCamId) ?? null;

  const rateSum = cameras.reduce((acc, c) => acc + cameraIncomeRate(c), 0);

  return (
    <div className="space-y-4">
      <PanelHeader
        title="Red de cámaras de vigilancia"
        subtitle="Compra, despliega donde quieras en el globo 3D y cobra intel 24/7 · mira devastaciones en vivo"
        icon={<Video className="w-4 h-4 text-cyan-hud" />}
        color="cyan"
        right={
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono px-2 py-1 border border-cyan-hud/50 text-cyan-hud rounded-sm">
              {cameras.length} ACTIVAS
            </span>
            <button
              onClick={() => {
                const got = collectAllCameras();
                if (got > 0) toast.success(`Intel recolectada: +${got} monedas`);
                else toast.info("Sin intel pendiente");
              }}
              className="flex items-center gap-1 px-2 py-1 border rounded-sm text-[10px] font-mono font-bold uppercase border-amber-hud bg-amber-hud/40 text-amber"
            >
              <Download className="w-3 h-3" /> COBRAR TODO ({pendingTotal})
            </button>
          </div>
        }
      />

      {/* ===== banner ELITE ===== */}
      <div className={cn("hud-corner p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3", elite ? "border-amber-hud bg-amber-hud/10" : "border-violet-hud/50")}>
        <div className="flex items-start gap-3 min-w-0">
          <div className={cn("w-10 h-10 rounded-sm border flex items-center justify-center flex-shrink-0", elite ? "border-amber-hud bg-amber-hud/20" : "border-violet-hud/50 bg-violet-hud/10")}>
            <Crown className={cn("w-5 h-5", elite ? "text-amber" : "text-violet-hud")} />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-mono font-bold text-foreground flex items-center gap-2 flex-wrap">
              PASE ELITE VANGUARD
              {elite && <span className="text-[9px] px-1.5 py-0.5 border border-amber-hud text-amber rounded-sm">ACTIVO · x2 INGRESOS</span>}
            </div>
            <div className="text-[11px] text-muted-foreground font-mono">
              Ingresos de cámaras x2 · {ELITE_PASS.dailyGems} gemas diarias · {ELITE_PASS.discountPct}% descuento en cámaras · credencial de comando
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {elite ? (
            <>
              <span className="text-[10px] font-mono text-muted-foreground hidden sm:block">
                VENCE: {eliteUntil ? fmtDate(eliteUntil) : "-"}
              </span>
              <button
                onClick={() => {
                  const ok = claimEliteDaily();
                  if (ok) toast.success(`Beneficio ELITE: +${ELITE_PASS.dailyGems} gemas`);
                  else toast.info("Gemas diarias ya reclamadas hoy");
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 border rounded-sm text-[10px] font-mono font-bold border-amber-hud bg-amber-hud/30 text-amber"
              >
                <Gem className="w-3.5 h-3.5" /> RECLAMAR {eliteLastClaimDate ? "(HOY: HECHO)" : "3 GEMAS"}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  if (activateElite("COINS")) toast.success("PASE ELITE activado — ingresos x2 durante 7 dias");
                  else toast.error("Monedas insuficientes");
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 border rounded-sm text-[10px] font-mono font-bold border-amber-hud bg-amber-hud/30 text-amber"
              >
                <Coins className="w-3.5 h-3.5" /> {ELITE_PASS.costCoins}
              </button>
              <button
                onClick={() => {
                  if (activateElite("GEMS")) toast.success("PASE ELITE activado — ingresos x2 durante 7 dias");
                  else toast.error("Gemas insuficientes");
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 border rounded-sm text-[10px] font-mono font-bold border-violet-hud bg-violet-hud/30 text-violet-hud"
              >
                <Gem className="w-3.5 h-3.5" /> {ELITE_PASS.costGems}
              </button>
            </>
          )}
        </div>
      </div>

      {/* ===== stats ===== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <StatBox icon={<Video className="w-4 h-4 text-cyan-hud" />} label="Camaras activas" value={String(cameras.length)} />
        <StatBox icon={<Coins className="w-4 h-4 text-amber" />} label="Intel/min global" value={`${rateSum.toFixed(1)}`} />
        <StatBox icon={<Download className="w-4 h-4 text-amber" />} label="Pendiente" value={`${pendingTotal}`} />
        <StatBox icon={<Zap className="w-4 h-4 text-red-hud" />} label="Eventos captados" value={`${totalEvents} · ${totalIncome} MON`} />
      </div>

      {/* ===== tienda de camaras ===== */}
      <div className="hud-corner">
        <div className="p-3 border-b border-amber-hud/30 bg-secondary/50 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono text-muted-foreground uppercase">Arsenal de vigilancia — elige tu equipo</div>
            <div className="text-xs font-mono text-amber">Cada camara genera intel pasiva segun los frentes cercanos</div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono">
            <span className="text-amber">{coins} MON</span>
            <span className="text-violet-hud">{gems} GEM</span>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 p-3">
          {CAMERA_MODELS.map((m) => {
            const disc = elite ? ELITE_PASS.discountPct : 0;
            const cc = Math.round(m.costCoins * (1 - disc / 100));
            const cg = Math.round(m.costGems * (1 - disc / 100));
            const affordable = coins >= cc && gems >= cg;
            const deploying = deployModel?.id === m.id;
            return (
              <div key={m.id} className={cn("hud-corner p-3 bg-secondary/40 flex flex-col gap-2", deploying && "ring-1 ring-cyan-hud")}>
                <div className="flex items-center justify-between">
                  <VIcon k={m.tier === "ORBITAL" ? "satellite" : m.tier === "BASICA" ? "camera" : "cctv"} className="w-5 h-5 text-cyan-hud" />
                  <span className="text-[9px] font-mono px-1.5 py-0.5 border border-cyan-hud/40 text-cyan-hud rounded-sm">{m.tier}</span>
                </div>
                <div className="text-xs font-mono font-bold text-foreground">{m.name}</div>
                <div className="text-[10px] text-muted-foreground leading-snug flex-1">{m.description}</div>
                <div className="text-[9px] font-mono text-muted-foreground space-y-0.5">
                  <div className="flex items-center gap-1"><Radar className="w-3 h-3 text-cyan-hud" /> RADIO {m.radiusDeg}° · CAP {m.capacity}</div>
                  <div className="flex items-center gap-1"><Coins className="w-3 h-3 text-amber" /> {m.coinsPerMin} MON/MIN BASE · x{m.incomeMult}</div>
                  {m.nightVision && <div className="flex items-center gap-1"><Moon className="w-3 h-3 text-green-hud" /> VISION NOCTURNA</div>}
                </div>
                <div className="flex items-center justify-between gap-1">
                  <div className="text-[11px] font-mono font-bold">
                    {cc > 0 && <span className="text-amber">{cc} MON</span>}
                    {cc > 0 && cg > 0 && <span className="text-muted-foreground"> + </span>}
                    {cg > 0 && <span className="text-violet-hud">{cg} GEM</span>}
                    {disc > 0 && <span className="text-[9px] text-green-hud ml-1">-{disc}%</span>}
                  </div>
                  <button
                    onClick={() => {
                      setDeployModel(deploying ? null : m);
                      setPendingSpot(null);
                    }}
                    className={cn(
                      "text-[10px] font-mono font-bold px-2 py-1 border rounded-sm flex items-center gap-1",
                      deploying ? "border-cyan-hud bg-cyan-hud/40 text-cyan-hud" : affordable ? "border-amber-hud bg-amber-hud/30 text-amber" : "border-border text-muted-foreground"
                    )}
                  >
                    <MapPin className="w-3 h-3" /> {deploying ? "EQUIPADA" : "DESPLEGAR"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== mapa de despliegue ===== */}
      <div className={cn("hud-corner relative overflow-hidden", deployModel && "ring-1 ring-cyan-hud")}>
        <div className="p-3 border-b border-amber-hud/30 bg-secondary/50 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[10px] font-mono text-muted-foreground uppercase">
              {deployModel ? `MODO DESPLIEGUE — ${deployModel.name}` : "Red de vigilancia global"}
            </div>
            <div className="text-xs font-mono text-amber truncate">
              {deployModel
                ? "Haz clic en cualquier punto del globo para instalar tu cámara"
                : "Tus cámaras aparecen en cian · pulsa una para verla"}
            </div>
          </div>
          {deployModel && (
            <button onClick={() => { setDeployModel(null); setPendingSpot(null); }} className="text-[10px] font-mono px-2 py-1 border border-red-hud/50 text-red-hud rounded-sm flex-shrink-0">
              CANCELAR
            </button>
          )}
        </div>
        <div className="p-2">
          <CamerasGlobe3D
            conflicts={CONFLICTS}
            cameras={cameras}
            selectedCamera={liveCamId}
            onSelectCamera={(id) => setLiveCamId(id)}
            pendingSpot={pendingSpot}
            onGlobeClick={handleMapClick}
          />
        </div>
      </div>

      {/* ===== confirmacion de despliegue ===== */}
      <AnimatePresence>
        {deployModel && pendingSpot && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="hud-corner p-4 border-cyan-hud"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-mono font-bold text-cyan-hud flex items-center gap-1.5">
                <Crosshair className="w-4 h-4" /> CONFIRMAR INSTALACIÓN — {deployModel.name}
              </div>
              <button onClick={() => setPendingSpot(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid sm:grid-cols-3 gap-2 mb-3">
              <div className="hud-corner p-2 bg-secondary/40">
                <div className="text-[9px] font-mono text-muted-foreground uppercase">Posición</div>
                <CoordChip lat={pendingSpot.lat} lng={pendingSpot.lng} />
              </div>
              <div className="hud-corner p-2 bg-secondary/40">
                <div className="text-[9px] font-mono text-muted-foreground uppercase">Zona cercana</div>
                {(() => {
                  const z = nearestConflict(pendingSpot.lat, pendingSpot.lng);
                  const inRange = z.dist <= deployModel.radiusDeg;
                  return (
                    <div className="flex items-center gap-1.5">
                      <FlagBadge code={z.conflict.flag} />
                      <span className={cn("text-[10px] font-mono truncate", inRange ? "text-green-hud" : "text-amber")}>
                        {z.conflict.name} {inRange ? "· EN RANGO" : "· FUERA"}
                      </span>
                    </div>
                  );
                })()}
              </div>
              <div className="hud-corner p-2 bg-secondary/40">
                <div className="text-[9px] font-mono text-muted-foreground uppercase">Costo {elite ? "(ELITE -15%)" : ""}</div>
                <div className="text-[11px] font-mono font-bold">
                  {Math.round(deployModel.costCoins * (1 - (elite ? 15 : 0) / 100)) > 0 && <span className="text-amber">{Math.round(deployModel.costCoins * (1 - (elite ? 15 : 0) / 100))} MON</span>}
                  {deployModel.costGems > 0 && <span className="text-violet-hud"> {Math.round(deployModel.costGems * (1 - (elite ? 15 : 0) / 100))} GEM</span>}
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Input
                value={camName}
                onChange={(e) => setCamName(e.target.value)}
                placeholder="Nombre de la camara (opcional) — ej: TORRE NORTE"
                className="h-8 bg-secondary border-cyan-hud/40 font-mono text-xs flex-1"
              />
              <Button size="sm" onClick={confirmDeploy} className="font-mono text-[11px] h-8 bg-cyan-hud/30 border border-cyan-hud text-cyan-hud hover:bg-cyan-hud/50">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" /> INSTALAR CAMARA
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== mis camaras ===== */}
      <div className="hud-corner">
        <div className="p-3 border-b border-amber-hud/30 bg-secondary/50">
          <div className="text-[10px] font-mono text-muted-foreground uppercase">Tus nodos de vigilancia</div>
          <div className="text-xs font-mono text-amber">Pulsa VER EN VIVO para vigilar en directo</div>
        </div>
        {cameras.length === 0 ? (
          <div className="p-8 text-center">
            <PackageOpen className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <div className="text-xs font-mono text-muted-foreground">Sin camaras desplegadas. Elige un modelo arriba y pulsa DESPLEGAR.</div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 p-3">
            {cameras.map((cam) => {
              const model = getCameraModel(cam.modelId);
              const pending = cameraPending(cam);
              const rate = cameraIncomeRate(cam);
              const scene = sceneForCamera(cam.id, Math.floor(tickT / 6));
              return (
                <div key={cam.id} className="hud-corner overflow-hidden bg-secondary/30">
                  <div className="relative">
                    { }
                    <img
                      src={`/assets/cctv/${scene.id}.png`}
                      alt={`Vista de ${cam.name}`}
                      className="w-full block object-cover"
                      style={{ aspectRatio: "16/10", filter: "saturate(0.8) contrast(1.05)" }}
                      draggable={false}
                    />
                    <div className="absolute inset-0 scanline opacity-50 pointer-events-none" />
                    <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: "inset 0 0 60px 12px rgba(0,0,0,0.7)" }} />
                    <div className="absolute top-1.5 left-1.5 flex items-center gap-1 text-[9px] font-mono text-red-hud font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-hud blink-soft" /> REC
                    </div>
                    <div className="absolute top-1.5 right-1.5 text-[9px] font-mono text-foreground/90 bg-black/60 px-1 rounded-sm">{fmtClock(Date.now())}</div>
                    <div className="absolute bottom-1.5 left-1.5 text-[9px] font-mono text-foreground/90 bg-black/60 px-1 rounded-sm">{cam.id} · {model.tier}</div>
                  </div>
                  <div className="p-2.5 space-y-2">
                    <div className="flex items-center justify-between gap-1">
                      <div className="text-xs font-mono font-bold text-foreground truncate">{cam.name}</div>
                      <span className="text-[9px] font-mono text-cyan-hud flex-shrink-0">{rate.toFixed(1)}/MIN</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Radio className="w-3 h-3 text-cyan-hud" /> {cam.eventsCaught} EV · {cam.totalEarned} MON
                      </span>
                      <span className="text-amber">+{pending} LISTO</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setLiveCamId(cam.id)}
                        className="flex-1 text-[10px] font-mono font-bold px-2 py-1.5 border border-cyan-hud bg-cyan-hud/20 text-cyan-hud rounded-sm flex items-center justify-center gap-1"
                      >
                        <Video className="w-3 h-3" /> VER EN VIVO
                      </button>
                      <button
                        onClick={() => {
                          const got = collectCamera(cam.id);
                          if (got > 0) toast.success(`${cam.id}: +${got} monedas de intel`);
                          else toast.info("Acumula 0 monedas: espera un momento");
                        }}
                        className="flex-1 text-[10px] font-mono font-bold px-2 py-1.5 border border-amber-hud bg-amber-hud/20 text-amber rounded-sm flex items-center justify-center gap-1"
                      >
                        <Download className="w-3 h-3" /> COBRAR
                      </button>
                      <button
                        onClick={() => {
                          removeCamera(cam.id);
                          toast.info(`${cam.id} retirada — rescate del 40% acreditado`);
                        }}
                        className="px-2 py-1.5 border border-red-hud/40 text-red-hud rounded-sm"
                        title="Retirar camara (40% rescate)"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ===== registro de eventos capturados ===== */}
      <div className="hud-corner">
        <div className="p-3 border-b border-amber-hud/30 bg-secondary/50">
          <div className="text-[10px] font-mono text-muted-foreground uppercase">Archivo de devastaciones capturadas</div>
          <div className="text-xs font-mono text-amber">{eventsLog.length} eventos registrados por tu red</div>
        </div>
        <div className="max-h-72 overflow-y-auto thin-scroll divide-y divide-border/40">
          {eventsLog.length === 0 ? (
            <div className="p-6 text-center text-xs font-mono text-muted-foreground">
              Abre una camara EN VIVO cerca de un frente activo para captar devastaciones.
            </div>
          ) : (
            eventsLog.map((ev) => (
              <div key={ev.id} className="p-2.5 flex items-start gap-2.5">
                <div className={cn(
                  "w-7 h-7 rounded-sm border flex items-center justify-center flex-shrink-0",
                  ev.severity === 3 ? "border-red-hud bg-red-hud/20" : ev.severity === 2 ? "border-amber-hud bg-amber-hud/20" : "border-cyan-hud bg-cyan-hud/20"
                )}>
                  <VIcon k="zap" className="w-3.5 h-3.5 text-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-mono text-foreground truncate">{ev.title}</div>
                  <div className="text-[10px] text-muted-foreground truncate">{ev.detail}</div>
                  <div className="text-[9px] font-mono text-muted-foreground mt-0.5">
                    {ev.cameraName} · {fmtDate(ev.ts)} {fmtClock(ev.ts)}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-[10px] font-mono text-amber font-bold">+{ev.coins}</div>
                  <div className="text-[9px] font-mono text-cyan-hud">+{ev.xp} XP</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <LiveFeedModal cam={liveCam} open={!!liveCam} onOpenChange={(o) => !o && setLiveCamId(null)} />
    </div>
  );
}

function StatBox({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="hud-corner p-2.5 bg-secondary/40 flex items-center gap-2">
      <div className="flex-shrink-0">{icon}</div>
      <div className="min-w-0">
        <div className="text-[9px] font-mono text-muted-foreground uppercase truncate">{label}</div>
        <div className="text-xs font-mono font-bold text-foreground truncate">{value}</div>
      </div>
    </div>
  );
}
