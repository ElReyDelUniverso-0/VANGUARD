"use client";

import { useState, useRef, useSyncExternalStore } from "react";
import { useGameStore } from "@/lib/game-store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings as SettingsIcon, Volume2, VolumeX, User, RotateCcw, Shield, AlertTriangle, Download, Upload, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { sfx, setMuted as setSoundMuted } from "@/lib/sound";
import { cn } from "@/lib/utils";
import { LANGS, useLangStore, useT } from "@/lib/i18n";
import { isStrict18, setStrict18, subscribeStrict18 } from "@/lib/safety";
import { Languages } from "lucide-react";

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
