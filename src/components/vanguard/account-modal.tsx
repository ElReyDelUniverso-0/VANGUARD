"use client";

// Vanguard v15 — MODAL DE CUENTA: registro, inicio de sesión y perfil
// con guardado en la nube. La cuenta DUENO (propietario) tiene acceso total.
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useGameStore } from "@/lib/game-store";
import { useProfileStore } from "@/lib/profile-store";
import { Countryball } from "@/components/vanguard/countryball";
import { countryName } from "@/lib/world-data";
import { toast } from "sonner";
import { Crown, LogIn, UserPlus, LogOut, Cloud, CloudUpload, Gift, Eye, EyeOff, Gem, Trophy, Swords } from "lucide-react";

type Mode = "LOGIN" | "REGISTER" | "PROFILE";

export function AccountModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const account = useGameStore((s) => s.account);
  const coins = useGameStore((s) => s.coins);
  const gems = useGameStore((s) => s.gems);
  const level = useGameStore((s) => s.level);
  const rank = useGameStore((s) => s.rank);
  const launchPackClaimed = useGameStore((s) => s.launchPackClaimed);
  const cloudSaveAt = useGameStore((s) => s.cloudSaveAt);
  const mpStats = useGameStore((s) => s.mpStats);
  // v21 pulido: identidad unificada con la personalización del perfil
  const cbAvatar = useProfileStore((s) => s.cbAvatar);
  const favFaction = useProfileStore((s) => s.favFaction);

  const [modeOverride, setModeOverride] = useState<Mode | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false); // v21: visibilidad de contraseña
  const [confirmLogout, setConfirmLogout] = useState(false); // v21: cierre en 2 pasos
  // modo derivado: perfil si hay sesión; si no, login. modeOverride permite alternar.
  const mode: Mode = modeOverride ?? (account ? "PROFILE" : "LOGIN");

  const authLogin = useGameStore((s) => s.authLogin);
  const authRegister = useGameStore((s) => s.authRegister);
  const authLogout = useGameStore((s) => s.authLogout);
  const claimLaunchPack = useGameStore((s) => s.claimLaunchPack);
  const pushCloudSave = useGameStore((s) => s.pushCloudSave);

  const handleOpenChange = (v: boolean) => {
    if (v) {
      setError(null);
    } else {
      setModeOverride(null);
      setError(null);
      onClose();
    }
  };

  const submit = async () => {
    setBusy(true);
    setError(null);
    const res =
      mode === "LOGIN"
        ? await authLogin(username, password)
        : await authRegister(username, password);
    setBusy(false);
    if (res.ok) {
      const isOwner = useGameStore.getState().account?.isOwner;
      if (mode === "REGISTER") {
        toast.success("¡Cuenta creada! +300 monedas de bienvenida");
        claimLaunchPack();
        toast("PACK DE LANZAMIENTO reclamado: +1500 mon, +15 gemas, 3 cajones y ELITE 7 días");
      } else {
        toast.success(isOwner ? "Acceso total de propietario concedido" : `Bienvenido, ${username.toUpperCase()}`);
      }
      setUsername("");
      setPassword("");
      setModeOverride(null);
      onClose();
    } else {
      setError(res.error ?? "Error desconocido");
    }
  };

  const doLogout = async () => {
    // v21: confirmación en 2 pasos para evitar cierres accidentales
    if (!confirmLogout) {
      setConfirmLogout(true);
      setTimeout(() => setConfirmLogout(false), 3500);
      return;
    }
    await authLogout();
    toast("Sesión cerrada · tu progreso quedó guardado en la nube");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="hud-panel border-amber-hud max-w-sm" aria-describedby="acc-desc">
        <DialogHeader>
          <DialogTitle className="font-display tracking-widest uppercase text-sm text-soft">
            {mode === "PROFILE" ? "Mi cuenta" : mode === "LOGIN" ? "Iniciar sesión" : "Crear cuenta"}
          </DialogTitle>
          <DialogDescription id="acc-desc" className="text-[11px] text-muted-foreground">
            {mode === "PROFILE"
              ? "Tu progreso se guarda automáticamente en la nube."
              : "Cuentas con guardado en la nube: tu progreso te sigue a cualquier dispositivo."}
          </DialogDescription>
        </DialogHeader>

        {mode !== "PROFILE" ? (
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground" htmlFor="acc-user">
                Nombre de cuenta
              </label>
              <Input
                id="acc-user"
                value={username}
                onChange={(e) => setUsername(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ""))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && username && password) submit();
                }}
                placeholder="COMANDANTE_1"
                maxLength={16}
                className="font-mono mt-1 bg-secondary/60 border-border"
                autoComplete="username"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground" htmlFor="acc-pass">
                Contraseña
              </label>
              <div className="relative mt-1">
                <Input
                  id="acc-pass"
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && username && password) submit();
                  }}
                  placeholder="••••••••"
                  maxLength={64}
                  className="font-mono bg-secondary/60 border-border pr-10"
                  autoComplete={mode === "LOGIN" ? "current-password" : "new-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {mode === "REGISTER" && (
                <div className="text-[9px] font-mono text-muted-foreground/70 mt-1">mínimo 4 caracteres · solo letras y números</div>
              )}
            </div>

            {error && (
              <div className="text-[11px] font-mono text-red-hud border border-red-hud/50 bg-red-hud/10 px-2 py-1.5 rounded-sm">
                {error}
              </div>
            )}

            <Button
              onClick={submit}
              disabled={busy || username.length < 3 || password.length < 4}
              className="w-full font-mono uppercase tracking-widest bg-amber-hud/40 border border-amber-hud text-amber hover:bg-amber-hud/60"
            >
              {busy ? "Conectando…" : mode === "LOGIN" ? (
                <><LogIn className="w-4 h-4 mr-1.5" /> Entrar</>
              ) : (
                <><UserPlus className="w-4 h-4 mr-1.5" /> Crear cuenta (+300 mon)</>
              )}
            </Button>

            <button
              onClick={() => {
                setModeOverride(mode === "LOGIN" ? "REGISTER" : "LOGIN");
                setError(null);
              }}
              className="w-full text-center text-[10px] font-mono uppercase tracking-widest text-electric hover:text-foreground transition-colors"
            >
              {mode === "LOGIN" ? "¿Sin cuenta? Crear una ahora" : "Ya tengo cuenta · iniciar sesión"}
            </button>

            <div className="text-[9px] font-mono text-muted-foreground/70 leading-relaxed border-t border-border/40 pt-2">
              Al crear cuenta recibes el Pack de Lanzamiento: +1500 monedas, +15 gemas, 3 cajones y 7 días de Pase ELITE.
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* identidad — v21: avatar countryball real del perfil */}
            <div className="hud-corner p-3 bg-secondary/40 flex items-center gap-3">
              <div className={cn(
                "relative w-11 h-11 rounded-sm border flex items-center justify-center flex-shrink-0",
                account?.isOwner ? "border-amber-hud bg-amber-hud/20" : "border-cyan-hud/50 bg-cyan-hud/10"
              )}>
                <Countryball code={cbAvatar} size={34} />
                {account?.isOwner && (
                  <Crown className="absolute -top-2 -right-2 w-4 h-4 text-amber drop-shadow" />
                )}
              </div>
              <div className="min-w-0">
                <div className="font-display text-sm font-bold tracking-widest text-foreground truncate">
                  {account?.username}
                </div>
                <div className={cn("text-[10px] font-mono uppercase tracking-widest truncate", account?.isOwner ? "text-amber" : "text-cyan-hud")}>
                  {account?.isOwner ? "PROPIETARIO · ACCESO TOTAL" : favFaction}
                </div>
                <div className="text-[9px] font-mono text-muted-foreground/70 uppercase truncate">
                  avatar: {countryName(cbAvatar) || cbAvatar.toUpperCase()}
                </div>
              </div>
            </div>

            {/* estado — v21: fila ampliada con gemas y estadísticas multijugador */}
            <div className="grid grid-cols-3 gap-2">
              <div className="hud-corner p-2 bg-secondary/40 text-center">
                <div className="text-[9px] font-mono uppercase text-muted-foreground">Nivel</div>
                <div className="text-sm font-mono font-bold text-foreground">{level}</div>
              </div>
              <div className="hud-corner p-2 bg-secondary/40 text-center">
                <div className="text-[9px] font-mono uppercase text-muted-foreground">Rango</div>
                <div className="text-[11px] font-mono font-bold text-amber truncate">{rank}</div>
              </div>
              <div className="hud-corner p-2 bg-secondary/40 text-center">
                <div className="text-[9px] font-mono uppercase text-muted-foreground">Bóveda</div>
                <div className="text-sm font-mono font-bold text-foreground">
                  {account?.isOwner ? "∞" : coins.toLocaleString("es")}
                </div>
              </div>
              <div className="hud-corner p-2 bg-secondary/40 text-center">
                <div className="text-[9px] font-mono uppercase text-muted-foreground">Gemas</div>
                <div className="text-sm font-mono font-bold text-cyan-hud flex items-center justify-center gap-1">
                  <Gem className="w-3 h-3" /> {account?.isOwner ? "∞" : gems.toLocaleString("es")}
                </div>
              </div>
              <div className="hud-corner p-2 bg-secondary/40 text-center">
                <div className="text-[9px] font-mono uppercase text-muted-foreground">Victorias MP</div>
                <div className="text-sm font-mono font-bold text-green-hud flex items-center justify-center gap-1">
                  <Trophy className="w-3 h-3" /> {mpStats.wins}
                </div>
              </div>
              <div className="hud-corner p-2 bg-secondary/40 text-center">
                <div className="text-[9px] font-mono uppercase text-muted-foreground">Partidas MP</div>
                <div className="text-sm font-mono font-bold text-foreground flex items-center justify-center gap-1">
                  <Swords className="w-3 h-3" /> {mpStats.games}
                </div>
              </div>
            </div>

            {account?.isOwner && (
              <div className="text-[10px] font-mono text-amber border border-amber-hud/50 bg-amber-hud/10 px-2 py-1.5 rounded-sm leading-relaxed">
                Modo propietario: dinero y gemas infinitos, Pase ELITE permanente, todos los logros,
                briefings y cosméticos desbloqueados.
              </div>
            )}

            {/* nube */}
            <div className="flex items-center justify-between gap-2 text-[10px] font-mono text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                {cloudSaveAt ? <CloudUpload className="w-3.5 h-3.5 text-green-hud" /> : <Cloud className="w-3.5 h-3.5" />}
                {cloudSaveAt ? `Guardado en la nube · ${new Date(cloudSaveAt).toLocaleTimeString("es-ES")}` : "Guardado en la nube pendiente"}
              </span>
              <button
                onClick={async () => {
                  await pushCloudSave();
                  toast.success("Progreso guardado en la nube");
                }}
                className="text-electric hover:text-foreground uppercase tracking-widest"
              >
                Guardar ahora
              </button>
            </div>

            {/* pack de lanzamiento */}
            <div className={cn(
              "hud-corner p-3 border",
              launchPackClaimed ? "border-green-hud/50 bg-green-hud/10" : "border-amber-hud bg-amber-hud/10"
            )}>
              <div className="flex items-center gap-2 mb-1">
                <Gift className={cn("w-4 h-4", launchPackClaimed ? "text-green-hud" : "text-amber")} />
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-foreground">
                  Pack de Lanzamiento
                </span>
              </div>
              <p className="text-[10px] font-mono text-muted-foreground leading-relaxed mb-2">
                +1500 monedas · +15 gemas · 2 cajones ELITE · 1 cajón LEGENDARIA · 7 días de ELITE · +500 PX
              </p>
              {launchPackClaimed ? (
                <div className="text-[10px] font-mono uppercase tracking-widest text-green-hud">Reclamado ✓</div>
              ) : (
                <Button
                  onClick={() => {
                    if (claimLaunchPack()) toast.success("Pack de Lanzamiento reclamado");
                  }}
                  className="w-full font-mono uppercase tracking-widest bg-amber-hud/40 border border-amber-hud text-amber hover:bg-amber-hud/60"
                >
                  <Gift className="w-4 h-4 mr-1.5" /> Reclamar ahora
                </Button>
              )}
            </div>

            <Button
              onClick={doLogout}
              variant="outline"
              className={cn(
                "w-full font-mono uppercase tracking-widest border-red-hud/60 text-red-hud hover:bg-red-hud/20",
                confirmLogout && "border-red-hud bg-red-hud/20 animate-pulse"
              )}
            >
              <LogOut className="w-4 h-4 mr-1.5" />
              {confirmLogout ? "¿Seguro? Toca de nuevo para cerrar" : "Cerrar sesión"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
