"use client";

import { useState, useRef, useSyncExternalStore } from "react";
import { useGameStore } from "@/lib/game-store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings as SettingsIcon, Volume2, VolumeX, User, RotateCcw, Shield, AlertTriangle, Download, Upload, EyeOff, Boxes, Hourglass, Crosshair, Landmark, Box } from "lucide-react";
import { toast } from "sonner";
import { sfx, setMuted as setSoundMuted } from "@/lib/sound";
import { cn } from "@/lib/utils";
import { LANGS, useLangStore, useT } from "@/lib/i18n";
import { isStrict18, setStrict18, subscribeStrict18 } from "@/lib/safety";
import { Languages } from "lucide-react";
// v110.0 MATRIZ 2100 — TECNOLOGÍA 3D personalizable (el usuario manda en la matriz)
// v111.0 MÁQUINA DEL TIEMPO — giroscopio (iOS pide permiso con gesto) + era 1950→2100
// v112.0 SOLSTICIO — presets de era POR SALA + calibración fina del giroscopio
import { useEstilo3D, ERAS, SALAS_ERA, type EraKey } from "@/lib/estilo3d";

// v114: las SALAS + SUB-SALAS viven en estilo3d.ts (el Motor y los Ajustes
// comparten el mismo registro — "· SALA AUD" y "· COLECCIÓN" visten su era).
const CICLO_ERA: (EraKey | null)[] = [null, "1950", "1980", "2020", "2100"];

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { alias, setAlias, muted, setMuted, resetProgress, hudTheme, ownedCosmetics, setHudTheme, exportProgress, importProgress } = useGameStore();
  const { t: tr } = useT();
  const lang = useLangStore((s) => s.lang);
  const setLang = useLangStore((s) => s.setLang);
  const [newAlias, setNewAlias] = useState(alias);
  const [confirmReset, setConfirmReset] = useState(false);
  // v26: modo estricto 18+ leído en VIVO (useSyncExternalStore reacciona al cambio)
  const strict18 = useSyncExternalStore(
    (cb) => subscribeStrict18(cb),
    () => isStrict18(),
    () => false
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  // v110: ajustes del motor 3D (persistidos)
  const m3d = useEstilo3D();
  // v111: ¿el aparato expone giroscopio? (móvil sí, escritorio no)
  const [hayGyro] = useState(() => typeof window !== "undefined" && "DeviceOrientationEvent" in window);

  // v111 GIROSCOPIO: iOS 13+ exige pedir permiso desde un gesto del usuario
  const activarGiro = async () => {
    sfx.click();
    const DOE = typeof window !== "undefined"
      ? (window.DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> } | undefined)
      : undefined;
    if (DOE && typeof DOE.requestPermission === "function") {
      try {
        const p = await DOE.requestPermission();
        if (p === "granted") {
          m3d.setGiroscopio(true);
          sfx.unlock();
          toast.success(tr("gyro111.ok"), { description: tr("gyro111.okDesc") });
        } else {
          m3d.setGiroscopio(false);
          toast.error(tr("gyro111.denegado"));
        }
      } catch {
        toast.error(tr("gyro111.denegado"));
      }
      return;
    }
    // Android/escritorio: sin ceremonia — el toggle manda
    const nxt = !m3d.giroscopio;
    m3d.setGiroscopio(nxt);
    if (nxt) toast.success(tr("gyro111.ok"), { description: tr("gyro111.okDesc") });
  };

  // v112 CALIBRACIÓN FINA: TU pose de reposo es el cero. Un toque, 700 ms de
  // lectura (mediana de gamma/beta) y el motor resta esos offsets para siempre.
  const [calibrando, setCalibrando] = useState(false);
  const calibrarPose = () => {
    sfx.click();
    if (calibrando) return;
    setCalibrando(true);
    const muestras: { g: number; b: number }[] = [];
    const onMuestra = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      muestras.push({ g: e.gamma, b: e.beta });
    };
    window.addEventListener("deviceorientation", onMuestra, { passive: true });
    setTimeout(() => {
      window.removeEventListener("deviceorientation", onMuestra);
      setCalibrando(false);
      if (muestras.length < 4) {
        toast.error(tr("gyro111.denegado"));
        return;
      }
      muestras.sort((a, b) => a.g - b.g);
      const g = muestras[Math.floor(muestras.length / 2)].g;
      muestras.sort((a, b) => a.b - b.b);
      const b = muestras[Math.floor(muestras.length / 2)].b;
      m3d.setGyroCal(g, b - 30); // 30° = teléfono en mano (el mismo reposo del motor)
      sfx.unlock();
      toast.success(tr("gyro112.ok"), { description: `${tr("gyro112.calibrar")}: γ ${g.toFixed(0)}° · β ${(b - 30).toFixed(0)}°` });
    }, 700);
  };

  const elegirEra = (e: EraKey) => {
    m3d.setEra(e);
    sfx.unlock();
    toast.success(`${tr("era111.titulo")}: ${tr(`era111.e${e}`)}`);
  };

  // v112: ciclar el preset de una sala AUTO → 1950 → 1980 → 2020 → 2100 → AUTO
  const ciclarPreset = (sala: string) => {
    const actual = m3d.presetsEra[sala] ?? null;
    const idx = CICLO_ERA.indexOf(actual);
    const nxt = CICLO_ERA[(idx + 1) % CICLO_ERA.length];
    m3d.setPresetEra(sala, nxt);
    sfx.click();
  };

  const handleToggleStrict18 = (v: boolean) => {
    setStrict18(v);
    sfx.click();
    toast.success(
      v ? "Modo estricto 18+ ACTIVADO" : "Modo estricto 18+ desactivado",
      { description: v ? "Ningún contenido sensible se mostrará — ni siquiera censurado" : "El contenido sensible vuelve a mostrarse con advertencia y censura" }
    );
  };

  const handleSaveAlias = () => {
    if (!newAlias.trim()) {
      toast.error("El alias no puede estar vacio");
      return;
    }
    setAlias(newAlias);
    sfx.click();
    toast.success(`Alias actualizado: ${newAlias.trim().toUpperCase()}`);
  };

  const handleToggleMute = (m: boolean) => {
    setMuted(m);
    setSoundMuted(m);
    if (!m) sfx.click();
    toast.success(m ? "Sonido desactivado" : "Sonido activado");
  };

  const handleSetTheme = (t: "AMBER" | "RED" | "CYAN") => {
    if (!ownedCosmetics.includes(t)) {
      toast.error("Tema no desbloqueado", { description: "Compra el tema en la tienda con gemas" });
      return;
    }
    setHudTheme(t);
    sfx.unlock();
    toast.success(`Tema HUD: ${t}`);
  };

  const handleReset = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      toast.warning("Confirma reseteo del progreso", { description: "Click otra vez para confirmar" });
      return;
    }
    resetProgress();
    setConfirmReset(false);
    onOpenChange(false);
    sfx.error();
    toast.success("Progreso reiniciado", { description: "Vuelves a ser RECLUTA con 250 monedas" });
    setTimeout(() => window.location.reload(), 800);
  };

  const handleExport = () => {
    const json = exportProgress();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vanguard-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    sfx.success();
    toast.success("Progreso exportado", { description: "Archivo JSON descargado" });
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const json = ev.target?.result as string;
      const ok = importProgress(json);
      if (ok) {
        sfx.levelUp();
        toast.success("Progreso importado", { description: "Datos restaurados correctamente" });
        setTimeout(() => window.location.reload(), 800);
      } else {
        sfx.error();
        toast.error("Archivo invalido", { description: "No se pudo importar el progreso" });
      }
    };
    reader.readAsText(file);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!fixed hud-panel border-amber-hud sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-mono text-amber flex items-center gap-2">
            <SettingsIcon className="w-5 h-5" /> Ajustes de comando
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Personaliza tu experiencia de operador
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Alias */}
          <div className="space-y-2">
            <Label className="text-xs font-mono uppercase text-amber flex items-center gap-1">
              <User className="w-3 h-3" /> Identificador de agente
            </Label>
            <div className="flex gap-2">
              <Input
                value={newAlias}
                onChange={(e) => setNewAlias(e.target.value)}
                maxLength={24}
                placeholder="AGENTE-XXXX"
                className="font-mono bg-secondary border-amber-hud/40"
              />
              <Button
                onClick={handleSaveAlias}
                size="sm"
                className="bg-amber-hud text-amber hover:bg-amber-hud/80 font-mono uppercase whitespace-nowrap"
              >
                Guardar
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground font-mono">Max 24 caracteres · se muestra en el HUD</p>
          </div>

          {/* Sound */}
          <div className="hud-corner p-3 bg-secondary/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {muted ? <VolumeX className="w-4 h-4 text-muted-foreground" /> : <Volume2 className="w-4 h-4 text-amber" />}
                <div>
                  <div className="text-xs font-mono font-bold text-foreground">{tr("settings.sound")}</div>
                  <div className="text-[10px] text-muted-foreground">{tr("settings.soundDesc")}</div>
                </div>
              </div>
              <Switch checked={!muted} onCheckedChange={(c) => handleToggleMute(!c)} />
            </div>
          </div>

          {/* v110.0 MATRIZ 2100 — TECNOLOGÍA 3D: la matrix responde a TU mano */}
          <div className={cn("hud-corner p-3 bg-secondary/30", !m3d.activo && "opacity-70")}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Boxes className={cn("w-4 h-4", m3d.activo ? "text-emerald-400" : "text-muted-foreground")} />
                <div>
                  <div className="text-xs font-mono font-bold text-foreground">TECNOLOGÍA 3D · MATRIZ 2100</div>
                  <div className="text-[10px] text-muted-foreground">
                    Escenas holográficas que se inclinan contigo — todo Vanguard en profundidad
                  </div>
                </div>
              </div>
              <Switch checked={m3d.activo} onCheckedChange={(c) => { m3d.setActivo(c); sfx.click(); }} />
            </div>
            {m3d.activo && (
              <div className="mt-3 space-y-2.5">
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase text-muted-foreground">
                    <span>Intensidad de profundidad</span>
                    <span className="text-emerald-400 tabular-nums">{m3d.intensidad}%</span>
                  </div>
                  <input
                    type="range" min={0} max={100} step={5} value={m3d.intensidad}
                    onChange={(e) => m3d.setIntensidad(Number(e.target.value))}
                    className="mt-1 w-full accent-emerald-400"
                    aria-label="Intensidad 3D"
                  />
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {([
                    ["inclinar", "SEGUIR AL PUNTERO"],
                    ["paralaje", "PARALAJE GLOBAL"],
                    ["rejilla", "SUELO HOLOGRAFICO"],
                    ["sellosVivos", "RELOJ EN VIVO"],
                  ] as const).map(([k, lbl]) => (
                    <button
                      key={k}
                      onClick={() => { m3d[`set${k[0].toUpperCase()}${k.slice(1)}` as "setInclinar" | "setParalaje" | "setRejilla" | "setSellosVivos"](!m3d[k]); sfx.click(); }}
                      className={cn(
                        "h-7 hud-corner text-[9px] font-mono uppercase transition-all",
                        m3d[k]
                          ? "border-emerald-400/60 text-emerald-300 bg-emerald-400/10"
                          : "border-border text-muted-foreground"
                      )}
                    >
                      {m3d[k] ? "■ " : "□ "}{lbl}
                    </button>
                  ))}
                </div>

                {/* v111 GIROSCOPIO — el móvil inclina la matriz con la mano */}
                {hayGyro && (
                  <>
                    <button
                      onClick={activarGiro}
                      className={cn(
                        "w-full h-8 hud-corner text-[9px] font-mono uppercase tracking-widest transition-all",
                        m3d.giroscopio
                          ? "border-emerald-400/60 text-emerald-300 bg-emerald-400/10"
                          : "border-border text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {m3d.giroscopio ? "■ " : "□ "}{tr("gyro111.activar")}
                    </button>
                    {/* v112 CALIBRACIÓN FINA — tu pose de reposo es el cero */}
                    {m3d.giroscopio && (
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          onClick={calibrarPose}
                          className={cn(
                            "h-8 hud-corner text-[9px] font-mono uppercase tracking-widest transition-all flex items-center justify-center gap-1.5",
                            calibrando
                              ? "border-amber-hud text-amber bg-amber-hud/20 blink-soft"
                              : "border-emerald-400/40 text-emerald-300/90 bg-emerald-400/5 hover:bg-emerald-400/15"
                          )}
                        >
                          <Crosshair className="w-3 h-3" />
                          {calibrando ? "···" : tr("gyro112.calibrar")}
                        </button>
                        <button
                          onClick={() => { m3d.setGyroCal(0, 0); sfx.click(); toast.info(tr("gyro112.reset")); }}
                          className="h-8 hud-corner text-[9px] font-mono uppercase tracking-widest border-border text-muted-foreground hover:text-foreground transition-all flex items-center justify-center gap-1.5"
                        >
                          <RotateCcw className="w-3 h-3" />
                          {tr("gyro112.reset")}
                        </button>
                      </div>
                    )}
                  </>
                )}

                {/* v113 VISTA PREVIA EN VIVO — el cubo respira tu mano/giroscopio.
                    Puro CSS calc sobre las vars del Motor (--vg-mx/--vg-my): la
                    calibración ya viene aplicada, cero re-render, 60 FPS. */}
                <div className="mt-2.5 pt-2.5 border-t border-white/5">
                  <div className="text-[10px] font-mono uppercase text-muted-foreground mb-1.5 flex items-center gap-1.5">
                    <Box className="w-3 h-3 text-emerald-400" />
                    {tr("ajustes113.cubo.titulo")}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative h-[86px] w-[86px] shrink-0 grid place-items-center rounded-md border border-emerald-400/25 bg-emerald-400/[0.04]" style={{ perspective: "260px" }}>
                      <div
                        className="relative"
                        style={{
                          width: 40, height: 40, transformStyle: "preserve-3d",
                          transform: "rotateX(calc(-18deg + var(--vg-my, 0) * -34deg * var(--vg-3d-i, 1))) rotateY(calc(var(--vg-mx, 0) * 42deg * var(--vg-3d-i, 1)))",
                          transition: "transform 0.06s linear",
                        }}
                      >
                        {([
                          ["rotateY(0deg)", "rgba(52,211,153,0.30)"],
                          ["rotateY(90deg)", "rgba(52,211,153,0.22)"],
                          ["rotateY(180deg)", "rgba(52,211,153,0.30)"],
                          ["rotateY(270deg)", "rgba(52,211,153,0.22)"],
                          ["rotateX(90deg)", "rgba(52,211,153,0.40)"],
                          ["rotateX(-90deg)", "rgba(52,211,153,0.40)"],
                        ] as const).map(([tf, bg], i) => (
                          <span key={i} aria-hidden className="absolute inset-0 border border-emerald-300/50" style={{ transform: `${tf} translateZ(20px)`, background: bg }} />
                        ))}
                      </div>
                      {/* retícula de calibración: el punto = tu cero */}
                      <span aria-hidden className="pointer-events-none absolute h-3 w-3 rounded-full border border-emerald-300/40" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-mono text-muted-foreground leading-snug">{tr("ajustes113.cubo.desc")}</p>
                      {m3d.giroscopio && (
                        <p className="mt-1 font-mono text-[9px] tabular-nums text-emerald-300/90">
                          CERO X {m3d.gyroCal.x >= 0 ? "+" : ""}{m3d.gyroCal.x.toFixed(2)} · Y {m3d.gyroCal.y >= 0 ? "+" : ""}{m3d.gyroCal.y.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* v111 MÁQUINA DEL TIEMPO — la era visual de toda la casa */}
                <div className="pt-1">
                  <div className="text-[10px] font-mono uppercase text-muted-foreground mb-1.5 flex items-center gap-1.5">
                    <Hourglass className="w-3 h-3 text-amber" />
                    {tr("era111.titulo")}
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {((Object.keys(ERAS) as EraKey[])).map((e) => (
                      <button
                        key={e}
                        onClick={() => elegirEra(e)}
                        className={cn(
                          "h-8 hud-corner text-[9px] font-mono font-bold uppercase transition-all",
                          m3d.era === e
                            ? "border-amber-hud text-amber bg-amber-hud/25 glow-amber"
                            : "border-border text-muted-foreground hover:text-foreground hover:border-amber-hud/50"
                        )}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                  <p className="text-[9px] font-mono text-muted-foreground mt-1.5 leading-snug">
                    {tr(`era111.e${m3d.era}`)} — {tr("era111.desc")}
                  </p>

                  {/* v112 PRESETS DE ERA POR SALA — la MURALLA en 1950, el AUDITORIO en 2100 */}
                  <div className="mt-3 pt-2.5 border-t border-white/5">
                    <div className="flex items-center justify-between mb-1.5 gap-2">
                      <div className="text-[10px] font-mono uppercase text-muted-foreground flex items-center gap-1.5">
                        <Landmark className="w-3 h-3 text-amber" />
                        {tr("preset112.titulo")}
                      </div>
                      <button
                        onClick={() => { m3d.setPresetsOn(!m3d.presetsOn); sfx.click(); }}
                        className={cn(
                          "px-2 py-1 rounded-sm text-[8px] font-mono font-bold uppercase tracking-widest border transition-all",
                          m3d.presetsOn
                            ? "border-amber-hud text-amber bg-amber-hud/25"
                            : "border-border text-muted-foreground hover:text-foreground"
                        )}
                        aria-pressed={m3d.presetsOn}
                      >
                        {m3d.presetsOn ? "■ ON" : "□ OFF"}
                      </button>
                    </div>
                    <p className="text-[9px] font-mono text-muted-foreground leading-snug mb-1.5">{tr("preset112.desc")}</p>
                    <p className="text-[9px] font-mono text-amber/70 leading-snug mb-1.5">{tr("preset114.sub")}</p>
                    <div className="flex gap-1 overflow-x-auto thin-scroll pb-1" style={{ scrollbarWidth: "none" }}>
                      {SALAS_ERA.map((s) => {
                        const pre = m3d.presetsEra[s.key];
                        return (
                          <button
                            key={s.key}
                            onClick={() => ciclarPreset(s.key)}
                            title={`${s.nombre}: ${pre ?? tr("preset112.auto")}`}
                            className={cn(
                              "shrink-0 w-[58px] px-1 py-1 rounded-sm border text-center transition-all",
                              s.sub && "opacity-90",
                              pre && m3d.presetsOn
                                ? "border-amber-hud/70 text-amber bg-amber-hud/15"
                                : "border-border/70 text-muted-foreground hover:text-foreground hover:border-amber-hud/40"
                            )}
                          >
                            <span className={cn("block text-[8px] font-mono font-bold uppercase tracking-wide truncate", s.sub && "italic")}>{s.nombre}</span>
                            <span className="block text-[8px] font-mono tabular-nums opacity-80">{pre ?? tr("preset112.auto")}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* v26: MODO ESTRICTO 18+ — el usuario pidió no ver NINGUNA foto censurada */}
          <div className={cn("hud-corner p-3 bg-secondary/30", strict18 && "border-red-hud/60 bg-red-hud/10")}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <EyeOff className={cn("w-4 h-4", strict18 ? "text-red-hud" : "text-muted-foreground")} />
                <div>
                  <div className="text-xs font-mono font-bold text-foreground">Modo estricto 18+</div>
                  <div className="text-[10px] text-muted-foreground">
                    Nunca mostrar contenido sensible — se oculta por completo, sin censuras ni pasos extra
                  </div>
                </div>
              </div>
              <Switch checked={strict18} onCheckedChange={handleToggleStrict18} />
            </div>
          </div>

          {/* v21: Idioma */}
          <div className="space-y-2">
            <Label className="text-xs font-mono uppercase text-amber flex items-center gap-1">
              <Languages className="w-3 h-3" /> {tr("hud.language")}
            </Label>
            <div className="grid grid-cols-4 gap-1.5">
              {LANGS.map((l) => (
                <button
                  key={l.id}
                  onClick={() => {
                    setLang(l.id);
                    sfx.click();
                    toast.success(`${tr("hud.language")}: ${l.native}`);
                  }}
                  className={cn(
                    "h-8 hud-corner text-[10px] font-mono uppercase transition-all",
                    lang === l.id
                      ? "border-amber-hud text-amber bg-amber-hud/30 glow-amber font-bold"
                      : "border-border text-muted-foreground hover:text-foreground hover:border-amber-hud/50"
                  )}
                >
                  {l.glyph}
                </button>
              ))}
            </div>
          </div>

          {/* HUD Theme */}
          <div className="space-y-2">
            <Label className="text-xs font-mono uppercase text-amber flex items-center gap-1">
              <Shield className="w-3 h-3" /> Tema HUD
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {(["AMBER", "RED", "CYAN"] as const).map((t) => {
                const owned = ownedCosmetics.includes(t);
                const active = hudTheme === t;
                return (
                  <button
                    key={t}
                    onClick={() => handleSetTheme(t)}
                    disabled={!owned}
                    className={cn(
                      "p-2 hud-corner text-center text-[10px] font-mono uppercase transition-all",
                      active && "glow-amber",
                      owned
                        ? t === "AMBER"
                          ? "border-amber-hud text-amber hover:bg-amber-hud/30"
                          : t === "RED"
                          ? "border-red-hud text-red-hud hover:bg-red-hud/30"
                          : "border-cyan-hud text-cyan-hud hover:bg-cyan-hud/30"
                        : "border-border text-muted-foreground opacity-50"
                    )}
                  >
                    <div className={cn(
                      "w-full h-2 rounded-sm mb-1",
                      t === "AMBER" ? "bg-amber" : t === "RED" ? "bg-red-hud" : "bg-cyan-hud"
                    )} />
                    {t}
                    {!owned && <div className="text-[8px] mt-0.5"> bloqueado</div>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Backup: Export/Import */}
          <div className="space-y-2">
            <Label className="text-xs font-mono uppercase text-amber flex items-center gap-1">
              <Shield className="w-3 h-3" /> Copia de seguridad
            </Label>
            <p className="text-[10px] text-muted-foreground font-mono">
              Exporta tu progreso a un archivo JSON o importa un backup anterior.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={handleExport}
                size="sm"
                className="h-8 bg-amber-hud/30 border border-amber-hud text-amber hover:bg-amber-hud/50 font-mono uppercase text-[10px]"
              >
                <Download className="w-3 h-3 mr-1" /> Exportar
              </Button>
              <Button
                onClick={handleImportClick}
                size="sm"
                className="h-8 bg-cyan-hud/30 border border-cyan-hud text-cyan-hud hover:bg-cyan-hud/50 font-mono uppercase text-[10px]"
              >
                <Upload className="w-3 h-3 mr-1" /> Importar
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleImportFile}
              className="hidden"
            />
          </div>

          {/* Reset */}
          <div className="hud-corner p-3 bg-red-hud/10 border-red-hud/50">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-hud" />
              <div className="text-xs font-mono font-bold text-red-hud uppercase">Zona peligrosa</div>
            </div>
            <p className="text-[10px] text-muted-foreground mb-2">
              Resetear progreso borra: monedas, gemas, nivel, misiones, logros, racha e inventario. Esta accion es irreversible.
            </p>
            <Button
              onClick={handleReset}
              variant="outline"
              size="sm"
              className={cn(
                "w-full font-mono uppercase",
                confirmReset
                  ? "bg-red-hud text-white border-red-hud blink-soft"
                  : "border-red-hud text-red-hud hover:bg-red-hud/30"
              )}
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              {confirmReset ? "Confirmar reseteo (irreversible)" : "Resetear progreso"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
