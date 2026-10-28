"use client";

// Vanguard v15 — MODAL DE CUENTA: registro, inicio de sesión y perfil
// con guardado en la nube. La cuenta DUENO (propietario) tiene acceso total.
// v195.0 TU LADO — EL REGISTRO QUE PREGUNTA: al crear cuenta, la casa te
// hace SU pregunta («¿de qué lado estás?» en 3 problemas del mundo vivo)
// y te deja elegir tu BANDERA — entras con identidad (+5 monedas por voto).
// Se puede saltar SIEMPRE: pedir tu lado jamás bloquea la entrada.
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useGameStore } from "@/lib/game-store";
import { useProfileStore, FACTIONS } from "@/lib/profile-store";
import { LADOS } from "@/lib/lados-data";
import { navigateTo } from "@/lib/nav";
import { Countryball } from "@/components/vanguard/countryball";
import { countryName } from "@/lib/world-data";
import { toast } from "sonner";
import { Crown, LogIn, UserPlus, LogOut, Cloud, CloudUpload, Gift, Eye, EyeOff, Gem, Trophy, Swords, ShieldCheck, Scale, Check, Flag } from "lucide-react";

type Mode = "LOGIN" | "REGISTER" | "PROFILE" | "ONBOARD";

export function AccountModal({ open, onClose, gate, contenedor }: { open: boolean; onClose: () => void; gate?: string | null; contenedor?: HTMLElement | null }) {
  // v102.0 LA CIUDADELA — modo GATE: el modal se abre PIDIENDO pasaporte
  // (lo dispara cualquier panel que necesite cuenta para publicar). Con gate
  // activo y sin sesión, la pestaña REGISTER sale primero con el motivo.
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
  // v102: con gate activo y sin sesión, el registro sale primero.
  const mode: Mode = modeOverride ?? (account ? "PROFILE" : gate ? "REGISTER" : "LOGIN");

  const authLogin = useGameStore((s) => s.authLogin);
  const authRegister = useGameStore((s) => s.authRegister);
  const authLogout = useGameStore((s) => s.authLogout);
  const claimLaunchPack = useGameStore((s) => s.claimLaunchPack);
  const pushCloudSave = useGameStore((s) => s.pushCloudSave);
  const votarLado = useGameStore((s) => s.votarLado);
  const setFavFaction = useProfileStore((s) => s.setFavFaction);

  // v195 TU LADO — el onboarding tras crear cuenta
  const [paso, setPaso] = useState(0); // 0-2: problemas · 3: bandera · 4: fin
  const problemasOnboard = LADOS.slice(0, 3);
  const banderas = FACTIONS;

  const handleOpenChange = (v: boolean) => {
    if (v) {
      setError(null);
    } else {
      setModeOverride(null);
      setError(null);
      setPaso(0);
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
        // v195 TU LADO: la casa hace su pregunta antes de dejarte entrar
        setModeOverride("ONBOARD");
        setPaso(0);
        setUsername("");
        setPassword("");
        return; // no cerramos: el onboarding toma la mano
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

  // v195 TU LADO — flujos del onboarding
  const elegirLado = (problemaId: string, lado: "A" | "B") => {
    if (votarLado(problemaId, lado)) {
      toast.success("Bando declarado: +5 monedas");
    }
    setPaso((p) => p + 1);
  };

  const elegirBandera = (f: string) => {
    setFavFaction(f);
    toast.success(`Tu bandera: ${f}`);
    setPaso((p) => p + 1);
  };

  const saltarOnboard = () => {
    setModeOverride(null);
    setPaso(0);
    onClose();
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
      <DialogContent contenedor={contenedor} className="hud-panel border-amber-hud max-w-sm" aria-describedby="acc-desc">
        <DialogHeader>
          <DialogTitle className="font-display tracking-widest uppercase text-sm text-soft">
            {mode === "ONBOARD"
              ? "¿DE QUÉ LADO ESTÁS?"
              : gate && !account
                ? "PASAPORTE DE LA CIUDADELA"
                : mode === "PROFILE"
                  ? "Mi cuenta"
                  : mode === "LOGIN"
                    ? "Iniciar sesión"
                    : "Crear cuenta"}
          </DialogTitle>
          <DialogDescription id="acc-desc" className="text-[11px] text-muted-foreground">
            {mode === "ONBOARD" ? (
              "La casa te pregunta tu bando: entras con identidad — tu progreso ya vive en la nube."
            ) : gate && !account ? (
              gate
            ) : mode === "PROFILE" ? (
              "Tu progreso se guarda automáticamente en la nube."
            ) : (
              "Cuentas con guardado en la nube: tu progreso te sigue a cualquier dispositivo."
            )}
          </DialogDescription>
        </DialogHeader>

        {mode === "ONBOARD" ? (
          /* v195 TU LADO — el registro te pregunta tu bando */
          <div className="space-y-3" data-vg195-onboard={paso}>
            {paso < 3 ? (() => {
              const p = problemasOnboard[paso];
              return (
                <>
                  <div className="flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-widest text-amber">
                    <Scale className="w-3.5 h-3.5" />
                    Pregunta {paso + 1} de 3
                  </div>
                  <h4 className="font-display text-[15px] font-bold tracking-wide text-foreground leading-snug">
                    {p.pregunta}
                  </h4>
                  <p className="text-[10px] font-mono text-muted-foreground leading-relaxed">{p.contexto}</p>
                  <div className="grid grid-cols-1 gap-2">
                    {(["A", "B"] as const).map((lado) => {
                      const esA = lado === "A";
                      const color = esA ? p.colorA : p.colorB;
                      return (
                        <button
                          key={lado}
                          onClick={() => elegirLado(p.id, lado)}
                          className="text-left rounded-sm border bg-black/30 p-2.5 min-h-[46px] transition-colors hover:bg-black/60"
                          style={{ borderColor: `${color}55` }}
                        >
                          <span className="font-display text-[12px] font-bold tracking-wide" style={{ color }}>
                            {esA ? p.ladoA : p.ladoB}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </>
              );
            })() : paso === 3 ? (
              <>
                <div className="flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-widest text-amber">
                  <Flag className="w-3.5 h-3.5" />
                  Elige tu bandera
                </div>
                <p className="text-[10px] font-mono text-muted-foreground leading-relaxed">
                  Tu bandera se luce en tu perfil y en la comunidad — puedes cambiarla cuando quieras.
                </p>
                <div className="grid grid-cols-1 gap-1.5 max-h-56 overflow-y-auto">
                  {banderas.map((f) => (
                    <button
                      key={f}
                      onClick={() => elegirBandera(f)}
                      className="text-left rounded-sm border border-border/50 bg-black/30 px-2.5 py-2 font-mono text-[11px] uppercase tracking-wider text-foreground transition-colors hover:bg-black/60"
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-green-hud">
                  <Check className="w-5 h-5" />
                  <span className="font-display text-sm font-bold uppercase tracking-widest">Tu lado está declarado</span>
                </div>
                <p className="text-[10px] font-mono text-muted-foreground leading-relaxed">
                  Ya eres parte del pueblo de Vanguard: tus bandos viven en TU aparato, tus monedas en tu cuenta
                  y tu progreso en la nube. En la sala ¿DE QUÉ LADO ESTÁS? hay más problemas del mundo esperando tu bando.
                </p>
                <div className="grid grid-cols-1 gap-2">
                  <Button
                    onClick={() => { saltarOnboard(); navigateTo("lados"); }}
                    className="w-full font-mono uppercase tracking-widest bg-amber-hud/40 border border-amber-hud text-amber hover:bg-amber-hud/60"
                  >
                    <Scale className="w-4 h-4 mr-1.5" /> Ir a ¿de qué lado estás?
                  </Button>
                  <Button
                    onClick={saltarOnboard}
                    variant="outline"
                    className="w-full font-mono uppercase tracking-widest border-border text-foreground hover:bg-secondary"
                  >
                    Entrar a Vanguard
                  </Button>
                </div>
              </>
            )}
            {paso < 4 && (
              <button
                onClick={saltarOnboard}
                className="w-full text-center text-[9px] font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
              >
                Saltar por ahora — decidiré dentro
              </button>
            )}
          </div>
        ) : gate && !account ? (
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
