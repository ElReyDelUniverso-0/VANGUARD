"use client";

// ============================================================
// v367.6 EL PERFIL DEL JUGADOR — EL CARNET QUE TODOS DEBEN TENER
// (src/components/vanguard/perfil-jugador.tsx)
//
// Orden del Dueño: «haz un perfil que cada jugador debe tener, acceder bien a
// Vanguard, los permisos, código y un perfil con agregar una foto y una
// personalización amplia».
//
// Qué es esto y qué NO es:
//   · NO es un motor nuevo: es la PUERTA ÚNICA a lo que ya existía — el store
//     del perfil (banner, marco, bio, país, facción, avatar, firma 3D), el
//     alias del game-store, el censo de permisos del núcleo, la sesión real de
//     /api/auth/me y el modal de cuenta de la casa tal cual.
//   · SÍ agrega tres cosas que el Dueño pidió y no estaban juntas: la FOTO
//     (reducida en el aparato, nunca subida), el CÓDIGO del jugador (la misma
//     huella anti-suplantación del carnet v359) y el CARNET de seis piezas que
//     dice, sin adornos, qué le falta a cada jugador para estar completo.
//
// Leyes: cero cuenta fingida (si no hay sesión, se dice), cero foto fuera del
// aparato, cero cifras inventadas (todo se cuenta al pintar).
// ============================================================

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { sfx } from "@/lib/sound";
import { useProfileStore, BANNERS, FRAMES, FACTIONS, type BannerStyle, type FrameStyle } from "@/lib/profile-store";
import { useGameStore } from "@/lib/game-store";
import { Countryball } from "@/components/vanguard/countryball";
import { Flag } from "@/lib/flags";
import { WORLD_FLAGS, countryName } from "@/lib/world-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Fingerprint, Camera, Trash2, Copy, Check, ShieldCheck, Lock, Unlock,
  KeyRound, UserCog, Palette, DoorOpen, Image as ImageIcon, AlertTriangle, Loader2,
} from "lucide-react";
import {
  NIVELES_ACCESO, ETIQUETA_NIVEL, ETIQUETA_PERMISO, LIMITES_FOTO, PERSONALIZACION,
  PERSONALIZACION_TOTAL, PIEZAS_CARNET_TOTAL, carnetDe, codigoJugador, cuentaPorPermiso,
  fotoCabe, bytesDeDataUrl, nivelDeAcceso, progresoCarnet, puedeAbrir, puertasDelCenso,
  semillaDeJugador, type NivelAcceso,
} from "@/lib/perfil-jugador";

// La puerta de la cuenta es la MISMA de la casa (no se reescribe): se monta
// como la monta la portada, sin SSR.
const AccountModal = dynamic(() => import("@/components/vanguard/account-modal").then((m) => m.AccountModal), { ssr: false });

const LS_CODIGO = "vg3676-codigo-copiado";

type VistaId = "carnet" | "foto" | "personalizacion" | "permisos" | "acceso";

const VISTAS: { id: VistaId; label: string; icon: React.ReactNode }[] = [
  { id: "carnet", label: "CARNET", icon: <Fingerprint className="w-3.5 h-3.5" /> },
  { id: "foto", label: "FOTO", icon: <Camera className="w-3.5 h-3.5" /> },
  { id: "personalizacion", label: "PERSONALIZAR", icon: <Palette className="w-3.5 h-3.5" /> },
  { id: "permisos", label: "PERMISOS", icon: <ShieldCheck className="w-3.5 h-3.5" /> },
  { id: "acceso", label: "ACCESO", icon: <DoorOpen className="w-3.5 h-3.5" /> },
];

export function PerfilJugador() {
  const perfil = useProfileStore();
  const alias = useGameStore((s) => s.alias);
  const account = useGameStore((s) => s.account);
  const level = useGameStore((s) => s.level);

  const [vista, setVista] = useState<VistaId>("carnet");
  const [bioLocal, setBioLocal] = useState(perfil.bio);
  const [qPais, setQPais] = useState("");
  const [qAvatar, setQAvatar] = useState("");
  const [codigoCopiado, setCodigoCopiado] = useState(false);
  const [cuentaAbierta, setCuentaAbierta] = useState(false);
  const [me, setMe] = useState<{ username: string; isOwner: boolean; modo: string } | null>(null);
  const [meListo, setMeListo] = useState(false);
  const [trabajandoFoto, setTrabajandoFoto] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  // ── la sesión REAL: se pregunta a la casa, no se supone ──
  useEffect(() => {
    let vivo = true;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (!vivo) return;
        setMe(d?.account ?? null);
      })
      .catch(() => {
        if (vivo) setMe(null);
      })
      .finally(() => {
        if (vivo) setMeListo(true);
      });
    return () => {
      vivo = false;
    };
  }, []);

  // ── ¿copió ya su código? (vive en el aparato) ──
  useEffect(() => {
    try {
      setCodigoCopiado(localStorage.getItem(LS_CODIGO) === "1");
    } catch {
      /* modo privado */
    }
  }, []);

  const haySesion = !!me || !!account;
  const username = me?.username ?? account?.username ?? null;
  const isOwner = !!(me?.isOwner ?? account?.isOwner);
  const modo = me?.modo ?? "";

  const codigo = useMemo(() => codigoJugador(semillaDeJugador({ username, alias })), [username, alias]);
  const carnet = useMemo(
    () => carnetDe({ alias, foto: perfil.foto, bio: perfil.bio, haySesion, modo, codigoCopiado }),
    [alias, perfil.foto, perfil.bio, haySesion, modo, codigoCopiado],
  );
  const progreso = useMemo(() => progresoCarnet(carnet), [carnet]);
  const nivel: NivelAcceso = useMemo(
    () => nivelDeAcceso({ haySesion, isOwner, carnetCompleto: progreso.hechos >= PIEZAS_CARNET_TOTAL }),
    [haySesion, isOwner, progreso.hechos],
  );
  const permisos = useMemo(() => cuentaPorPermiso(), []);
  const puertas = useMemo(() => puertasDelCenso(), []);
  const cerradas = useMemo(() => puertas.filter((p) => !puedeAbrir(p.permiso, nivel)), [puertas, nivel]);

  const paises = useMemo(() => {
    const q = qPais.trim().toLowerCase();
    const lista = q
      ? WORLD_FLAGS.filter((c) => c.code.toLowerCase().includes(q) || countryName(c.code).toLowerCase().includes(q))
      : WORLD_FLAGS;
    return lista.slice(0, 24);
  }, [qPais]);

  const avatares = useMemo(() => {
    const q = qAvatar.trim().toLowerCase();
    const lista = q
      ? WORLD_FLAGS.filter((c) => c.code.toLowerCase().includes(q) || countryName(c.code).toLowerCase().includes(q))
      : WORLD_FLAGS;
    return lista.slice(0, 18);
  }, [qAvatar]);

  // ── LA FOTO: se reduce AQUÍ, en el aparato, y nunca sale de él ──
  const tomarFoto = useCallback(
    async (file: File) => {
      if (!LIMITES_FOTO.tipos.includes(file.type)) {
        toast.error("Ese archivo no es una imagen que el carnet acepte", {
          description: `Se aceptan ${LIMITES_FOTO.tipos.join(", ")}`,
        });
        return;
      }
      setTrabajandoFoto(true);
      try {
        const dataUrl = await new Promise<string>((res, rej) => {
          const fr = new FileReader();
          fr.onload = () => res(String(fr.result));
          fr.onerror = () => rej(new Error("no se pudo leer el archivo"));
          fr.readAsDataURL(file);
        });
        const img = await new Promise<HTMLImageElement>((res, rej) => {
          const i = new Image();
          i.onload = () => res(i);
          i.onerror = () => rej(new Error("la imagen no abre"));
          i.src = dataUrl;
        });
        const lado = Math.max(img.width, img.height) || 1;
        const escala = Math.min(1, LIMITES_FOTO.ladoMax / lado);
        const w = Math.max(1, Math.round(img.width * escala));
        const h = Math.max(1, Math.round(img.height * escala));
        const c = document.createElement("canvas");
        c.width = w;
        c.height = h;
        const ctx = c.getContext("2d");
        if (!ctx) throw new Error("este aparato no deja reducir la imagen");
        ctx.drawImage(img, 0, 0, w, h);
        const salida = c.toDataURL(LIMITES_FOTO.formatoSalida, LIMITES_FOTO.calidadSalida);
        if (!fotoCabe(salida)) {
          throw new Error(
            `la foto reducida ocupa ${Math.round(bytesDeDataUrl(salida) / 1024)} KB y el tope del aparato es ${Math.round(
              LIMITES_FOTO.maxBytesDataUrl / 1024,
            )} KB`,
          );
        }
        perfil.setFoto(salida);
        sfx.click();
        toast.success("Foto puesta", {
          description: "Se redujo en tu aparato y se guardó aquí. No ha subido a ningún servidor.",
        });
      } catch (e) {
        toast.error("No se pudo poner la foto", {
          description: e instanceof Error ? e.message : "motivo desconocido",
        });
      } finally {
        setTrabajandoFoto(false);
      }
    },
    [perfil],
  );

  const copiarCodigo = async () => {
    try {
      await navigator.clipboard.writeText(codigo);
      setCodigoCopiado(true);
      try {
        localStorage.setItem(LS_CODIGO, "1");
      } catch {
        /* modo privado */
      }
      sfx.click();
      toast.success("Código copiado", {
        description: "Guárdalo fuera de Vanguard: es tu matrícula de jugador, no una contraseña.",
      });
    } catch {
      toast.error("El aparato no dejó copiar", {
        description: "Selecciona el código con el dedo y cópialo a mano.",
      });
    }
  };

  const guardarBio = () => {
    perfil.setBio(bioLocal.slice(0, 120));
    sfx.click();
    toast.success("Bio guardada", { description: "Se lee en tu carnet y en el perfil del agente." });
  };

  const nivelInfo = ETIQUETA_NIVEL[nivel];
  const anillo = FRAMES[perfil.frame].ring;

  return (
    <div className="mx-auto w-full max-w-3xl px-3 py-4 sm:px-5">
      {/* ══ CABECERA DEL CARNET ══ */}
      <section className="hud-panel border-amber-hud/50 overflow-hidden rounded-sm">
        <div className="h-20 sm:h-24" style={{ background: BANNERS[perfil.banner].css }} aria-hidden />
        <div className="-mt-10 px-3 pb-3 sm:-mt-12 sm:px-4">
          <div className="flex items-end gap-3">
            <div
              className="shrink-0 rounded-sm bg-zinc-950 p-0.5"
              style={{ boxShadow: anillo === "none" ? undefined : anillo }}
            >
              {perfil.foto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={perfil.foto}
                  alt={`Foto de ${alias || "jugador"}`}
                  width={72}
                  height={72}
                  className="h-[72px] w-[72px] rounded-sm object-cover"
                />
              ) : (
                <Countryball code={perfil.cbAvatar} size={72} />
              )}
            </div>
            <div className="min-w-0 flex-1 pb-1">
              <p className="truncate font-mono text-sm font-bold uppercase tracking-widest text-amber">
                {alias || "SIN ALIAS"}
              </p>
              <p className="truncate font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                {username ? `cuenta ${username}` : "sin cuenta · perfil de este aparato"} · nivel {level}
              </p>
              <p className={cn("font-mono text-[9px] uppercase tracking-[0.18em]", nivelInfo.color)}>
                {nivelInfo.nombre}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-muted-foreground">carnet</p>
              <p className="font-mono text-lg font-bold text-amber">
                {progreso.hechos}/{progreso.total}
              </p>
              <p className="font-mono text-[8px] uppercase tracking-[0.12em] text-muted-foreground">
                {progreso.porcentaje}%
              </p>
            </div>
          </div>
          <p className="mt-2 line-clamp-2 font-mono text-[10px] leading-relaxed text-foreground/70">
            {perfil.bio || "Sin bio todavía."}
          </p>
          {perfil.firma ? (
            <p className="mt-1 font-mono text-[8px] uppercase tracking-[0.16em] text-muted-foreground">
              firma 3D forjada: «{perfil.firma.texto}»
            </p>
          ) : null}
        </div>
      </section>

      {/* ══ PESTAÑAS ══ */}
      <div className="mt-3 flex flex-wrap gap-1" role="tablist" aria-label="Secciones del perfil del jugador">
        {VISTAS.map((v) => (
          <button
            key={v.id}
            role="tab"
            aria-selected={vista === v.id}
            onClick={() => {
              setVista(v.id);
              sfx.click();
            }}
            className={cn(
              "inline-flex items-center gap-1 rounded-sm border px-2 py-1 font-mono text-[9px] uppercase tracking-[0.16em] transition-colors",
              vista === v.id
                ? "border-amber bg-amber-hud/20 text-amber"
                : "border-zinc-800 text-muted-foreground hover:border-amber-hud/50 hover:text-amber/80",
            )}
          >
            {v.icon}
            {v.label}
          </button>
        ))}
      </div>

      {/* ══ CARNET ══ */}
      {vista === "carnet" && (
        <section className="mt-3 space-y-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-amber/80">
            LO QUE CADA JUGADOR DEBE TENER · {progreso.hechos} de {progreso.total}
          </p>
          <ol className="space-y-1.5">
            {carnet.map((p) => (
              <li
                key={p.id}
                className={cn(
                  "flex items-start gap-2 rounded-sm border px-2.5 py-1.5",
                  p.hecho ? "border-green-hud/40 bg-green-hud/5" : "border-amber-hud/30 bg-zinc-900/40",
                )}
              >
                <span className="mt-0.5 shrink-0">
                  {p.hecho ? <Check className="w-3.5 h-3.5 text-green-hud" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-foreground/90">{p.nombre}</p>
                  <p className="font-mono text-[9px] leading-relaxed text-muted-foreground">{p.detalle}</p>
                </div>
                {!p.hecho ? (
                  <Link
                    href={p.puerta}
                    className="shrink-0 self-center rounded-sm border border-amber-hud/40 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.14em] text-amber hover:bg-amber-hud/20"
                  >
                    ir
                  </Link>
                ) : null}
              </li>
            ))}
          </ol>

          {/* EL CÓDIGO */}
          <div className="rounded-sm border border-amber-hud/40 bg-zinc-900/50 px-2.5 py-2">
            <div className="flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-amber" />
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-amber/80">tu código de jugador</p>
            </div>
            <div className="mt-1 flex items-center justify-between gap-2">
              <code className="select-all font-mono text-lg font-bold tracking-widest text-amber">{codigo}</code>
              <button
                onClick={copiarCodigo}
                className="inline-flex items-center gap-1 rounded-sm border border-amber-hud/50 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-amber hover:bg-amber-hud/20"
              >
                {codigoCopiado ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {codigoCopiado ? "copiado" : "copiar"}
              </button>
            </div>
            <p className="mt-1 font-mono text-[8.5px] leading-relaxed text-muted-foreground">
              Sale de la misma huella anti-suplantación del carnet de la casa: misma persona, mismo código. No es una
              contraseña — no sirve para entrar, sirve para que dos jugadores comprueben que hablan con el mismo.
            </p>
          </div>
        </section>
      )}

      {/* ══ FOTO ══ */}
      {vista === "foto" && (
        <section className="mt-3 space-y-3">
          <div className="flex flex-wrap items-center gap-3 rounded-sm border border-zinc-800 bg-zinc-900/40 p-3">
            <div className="shrink-0 rounded-sm bg-zinc-950 p-0.5" style={{ boxShadow: anillo === "none" ? undefined : anillo }}>
              {perfil.foto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={perfil.foto} alt="Tu foto actual" width={96} height={96} className="h-24 w-24 rounded-sm object-cover" />
              ) : (
                <Countryball code={perfil.cbAvatar} size={96} />
              )}
            </div>
            <div className="min-w-0 flex-1 space-y-1.5">
              <input
                ref={fileRef}
                type="file"
                accept={LIMITES_FOTO.tipos.join(",")}
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void tomarFoto(f);
                  e.target.value = "";
                }}
              />
              <Button
                onClick={() => fileRef.current?.click()}
                disabled={trabajandoFoto}
                className="w-full gap-1.5 rounded-sm bg-amber-hud/30 font-mono text-[10px] uppercase tracking-widest text-amber hover:bg-amber-hud/60"
              >
                {trabajandoFoto ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImageIcon className="w-3.5 h-3.5" />}
                {perfil.foto ? "cambiar la foto" : "agregar una foto"}
              </Button>
              {perfil.foto ? (
                <Button
                  onClick={() => {
                    perfil.setFoto(null);
                    toast.info("Foto quitada", { description: "El carnet vuelve al avatar de la casa." });
                  }}
                  className="w-full gap-1.5 rounded-sm border border-red-hud/50 bg-transparent font-mono text-[10px] uppercase tracking-widest text-red-hud hover:bg-red-hud/10"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  quitar la foto
                </Button>
              ) : null}
            </div>
          </div>
          <div className="rounded-sm border border-zinc-800 px-2.5 py-2">
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">cómo se trata tu foto</p>
            <ul className="mt-1 space-y-0.5 font-mono text-[9px] leading-relaxed text-zinc-500">
              <li>· se reduce en tu propio aparato a {LIMITES_FOTO.ladoMax} px de lado, JPEG {LIMITES_FOTO.calidadSalida}</li>
              <li>· se guarda en este aparato (almacenamiento local del navegador), como el resto del perfil</li>
              <li>· NO se sube a ningún servidor de Vanguard ni viaja en tu save de la nube</li>
              <li>· tope real: {Math.round(LIMITES_FOTO.maxBytesDataUrl / 1024)} KB — si tu foto no cabe, se avisa con el peso exacto</li>
              <li>· si borras los datos del navegador, la foto desaparece: no hay copia en ningún otro sitio</li>
            </ul>
          </div>
        </section>
      )}

      {/* ══ PERSONALIZACIÓN ══ */}
      {vista === "personalizacion" && (
        <section className="mt-3 space-y-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-amber/80">
            PERSONALIZACIÓN AMPLIA · {PERSONALIZACION_TOTAL} piezas de la casa
          </p>

          {/* banner */}
          <div className="rounded-sm border border-zinc-800 bg-zinc-900/40 p-2.5">
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">banner</p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {(Object.keys(BANNERS) as BannerStyle[]).map((b) => (
                <button
                  key={b}
                  onClick={() => {
                    perfil.setBanner(b);
                    sfx.click();
                  }}
                  className={cn(
                    "h-8 w-16 rounded-sm border-2",
                    perfil.banner === b ? "border-amber" : "border-transparent",
                  )}
                  style={{ background: BANNERS[b].css }}
                  aria-label={BANNERS[b].label}
                  title={BANNERS[b].label}
                />
              ))}
            </div>
          </div>

          {/* marco */}
          <div className="rounded-sm border border-zinc-800 bg-zinc-900/40 p-2.5">
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">marco del avatar</p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {(Object.keys(FRAMES) as FrameStyle[]).map((f) => (
                <button
                  key={f}
                  onClick={() => {
                    perfil.setFrame(f);
                    sfx.click();
                  }}
                  className={cn(
                    "rounded-sm border px-2 py-1 font-mono text-[9px] uppercase tracking-widest",
                    perfil.frame === f ? "border-amber text-amber" : "border-zinc-700 text-muted-foreground",
                  )}
                >
                  {FRAMES[f].label}
                </button>
              ))}
            </div>
          </div>

          {/* bio */}
          <div className="rounded-sm border border-zinc-800 bg-zinc-900/40 p-2.5">
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">bio (máx. 120)</p>
            <div className="mt-1 flex gap-1.5">
              <Input
                value={bioLocal}
                onChange={(e) => setBioLocal(e.target.value)}
                maxLength={120}
                placeholder="Tu frase de agente"
                className="rounded-sm border-zinc-700 bg-zinc-950 font-mono text-[11px]"
              />
              <Button
                onClick={guardarBio}
                className="shrink-0 rounded-sm bg-amber-hud/30 font-mono text-[9px] uppercase tracking-widest text-amber hover:bg-amber-hud/60"
              >
                <Check className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* facción */}
          <div className="rounded-sm border border-zinc-800 bg-zinc-900/40 p-2.5">
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">facción declarada</p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {FACTIONS.map((f) => (
                <button
                  key={f}
                  onClick={() => {
                    perfil.setFavFaction(f);
                    sfx.click();
                  }}
                  className={cn(
                    "rounded-sm border px-2 py-1 font-mono text-[9px] uppercase tracking-wider",
                    perfil.favFaction === f ? "border-amber text-amber" : "border-zinc-700 text-muted-foreground",
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* país favorito */}
          <div className="rounded-sm border border-zinc-800 bg-zinc-900/40 p-2.5">
            <div className="flex items-center justify-between gap-2">
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">país favorito</p>
              <span className="flex items-center gap-1 font-mono text-[9px] text-amber">
                <Flag code={perfil.favCountry} size={14} />
                {countryName(perfil.favCountry)}
              </span>
            </div>
            <Input
              value={qPais}
              onChange={(e) => setQPais(e.target.value)}
              placeholder="buscar país…"
              className="mt-1 rounded-sm border-zinc-700 bg-zinc-950 font-mono text-[11px]"
            />
            <div className="mt-1 flex flex-wrap gap-1">
              {paises.map((c) => (
                <button
                  key={c.code}
                  onClick={() => {
                    perfil.setFavCountry(c.code);
                    sfx.click();
                  }}
                  className={cn(
                    "rounded-sm border p-0.5",
                    perfil.favCountry === c.code ? "border-amber" : "border-zinc-800 hover:border-amber-hud/50",
                  )}
                  title={countryName(c.code)}
                >
                  <Flag code={c.code} size={18} />
                </button>
              ))}
            </div>
          </div>

          {/* avatar countryball */}
          <div className="rounded-sm border border-zinc-800 bg-zinc-900/40 p-2.5">
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">avatar countryball</p>
            <Input
              value={qAvatar}
              onChange={(e) => setQAvatar(e.target.value)}
              placeholder="buscar país…"
              className="mt-1 rounded-sm border-zinc-700 bg-zinc-950 font-mono text-[11px]"
            />
            <div className="mt-1 flex flex-wrap gap-1.5">
              {avatares.map((c) => (
                <button
                  key={c.code}
                  onClick={() => {
                    perfil.setCbAvatar(c.code);
                    sfx.click();
                  }}
                  className={cn(
                    "rounded-sm border p-0.5",
                    perfil.cbAvatar === c.code ? "border-amber" : "border-zinc-800 hover:border-amber-hud/50",
                  )}
                  title={countryName(c.code)}
                >
                  <Countryball code={c.code} size={28} />
                </button>
              ))}
            </div>
          </div>

          {/* inventario honesto: qué se puede tocar y dónde vive */}
          <details className="rounded-sm border border-zinc-800 px-2.5 py-2">
            <summary className="cursor-pointer font-mono text-[9px] uppercase tracking-[0.18em] text-amber/80">
              las {PERSONALIZACION_TOTAL} piezas y el archivo que las guarda
            </summary>
            <ul className="mt-1.5 space-y-1">
              {PERSONALIZACION.map((p) => (
                <li key={p.id} className="font-mono text-[9px] leading-relaxed text-zinc-500">
                  <span className="text-foreground/80">{p.nombre}</span> — {p.detalle}
                  <span className="block text-[8px] text-zinc-600" title={p.vive}>
                    {p.vive}
                  </span>
                </li>
              ))}
            </ul>
          </details>
        </section>
      )}

      {/* ══ PERMISOS ══ */}
      {vista === "permisos" && (
        <section className="mt-3 space-y-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-amber/80">
            LO QUE PUEDES ABRIR CON TU NIVEL · {nivelInfo.nombre}
          </p>
          <p className="font-mono text-[9px] leading-relaxed text-muted-foreground">{nivelInfo.lema}</p>

          <div className="flex flex-wrap gap-1.5">
            {NIVELES_ACCESO.map((n) => (
              <span
                key={n}
                className={cn(
                  "inline-flex items-center gap-1 rounded-sm border px-2 py-1 font-mono text-[8px] uppercase tracking-[0.14em]",
                  n === nivel ? "border-amber text-amber" : "border-zinc-800 text-zinc-600",
                )}
                title={ETIQUETA_NIVEL[n].lema}
              >
                {n === nivel ? <Unlock className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
                {ETIQUETA_NIVEL[n].nombre}
              </span>
            ))}
          </div>

          <div className="grid gap-1.5 sm:grid-cols-3">
            {(["publico", "cuenta", "dueno"] as const).map((p) => (
              <div key={p} className="rounded-sm border border-zinc-800 bg-zinc-900/40 px-2 py-1.5">
                <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-muted-foreground">
                  {ETIQUETA_PERMISO[p].nombre} · {permisos[p]}
                </p>
                <p className="font-mono text-[8px] text-zinc-600">{ETIQUETA_PERMISO[p].lema}</p>
                <p className={cn("font-mono text-[9px] uppercase", puedeAbrir(p, nivel) ? "text-green-hud" : "text-red-hud")}>
                  {puedeAbrir(p, nivel) ? "abierto para ti" : "cerrado para ti"}
                </p>
              </div>
            ))}
          </div>

          {cerradas.length > 0 ? (
            <div className="rounded-sm border border-amber-hud/30 px-2.5 py-2">
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-amber/80">
                puertas que aún no abre tu nivel ({cerradas.length})
              </p>
              <ul className="mt-1 space-y-0.5">
                {cerradas.map((p) => (
                  <li key={p.id} className="font-mono text-[9px] text-zinc-500">
                    · {p.nombre} <span className="text-zinc-600">({ETIQUETA_PERMISO[p.permiso].nombre})</span>
                  </li>
                ))}
              </ul>
              <p className="mt-1 font-mono text-[8.5px] leading-relaxed text-zinc-600">
                Los permisos NO se escriben a mano aquí: se leen del censo real del núcleo
                (<code>src/lib/nucleo/registro.ts</code>, campo <code>permiso</code> de cada módulo). Si un módulo cambia
                de permiso en el censo, esta pantalla cambia sola.
              </p>
            </div>
          ) : (
            <p className="font-mono text-[9px] text-green-hud">Abres todas las puertas del censo. Nada te queda cerrado.</p>
          )}

          <details className="rounded-sm border border-zinc-800 px-2.5 py-2">
            <summary className="cursor-pointer font-mono text-[9px] uppercase tracking-[0.18em] text-amber/80">
              las {puertas.length} puertas del censo, una por una
            </summary>
            <ul className="mt-1.5 grid gap-x-3 gap-y-0.5 sm:grid-cols-2">
              {puertas.map((p) => {
                const abre = puedeAbrir(p.permiso, nivel);
                return (
                  <li key={p.id} className="flex items-baseline gap-1 font-mono text-[8.5px]">
                    {abre ? (
                      <Check className="w-2.5 h-2.5 shrink-0 text-green-hud" />
                    ) : (
                      <Lock className="w-2.5 h-2.5 shrink-0 text-zinc-600" />
                    )}
                    {p.ruta.includes("[") ? (
                      <span className="truncate text-zinc-500">{p.nombre}</span>
                    ) : (
                      <Link href={p.ruta} className="truncate text-zinc-400 hover:text-amber">
                        {p.nombre}
                      </Link>
                    )}
                    <span className="ml-auto shrink-0 text-[7.5px] uppercase text-zinc-700">{p.permiso}</span>
                  </li>
                );
              })}
            </ul>
          </details>
        </section>
      )}

      {/* ══ ACCESO ══ */}
      {vista === "acceso" && (
        <section className="mt-3 space-y-2">
          <div
            className={cn(
              "rounded-sm border px-2.5 py-2",
              haySesion ? "border-green-hud/40 bg-green-hud/5" : "border-amber-hud/40 bg-amber-hud/5",
            )}
          >
            <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/90">
              {haySesion ? <ShieldCheck className="w-3.5 h-3.5 text-green-hud" /> : <Lock className="w-3.5 h-3.5 text-amber" />}
              {meListo ? (haySesion ? `sesión iniciada: ${username}` : "sin sesión: entras como invitado") : "comprobando la sesión…"}
            </p>
            <p className="mt-1 font-mono text-[9px] leading-relaxed text-muted-foreground">
              {haySesion
                ? isOwner
                  ? "Esta es la cuenta del propietario: abre también las puertas marcadas DUEÑO."
                  : "Tu partida y tu modo se guardan en la nube de la casa. El perfil (foto, banner, bio) vive en tu aparato."
                : "Sin cuenta puedes ver todo lo público, pero no guardar tu partida en la nube ni entrar a lo que pide cuenta. La puerta de la cuenta es la misma de siempre — no hay otra."}
            </p>
            {modo ? (
              <p className="mt-1 font-mono text-[8.5px] uppercase tracking-[0.14em] text-amber/80">tu modo elegido: {modo}</p>
            ) : null}
            <div className="mt-2 flex flex-wrap gap-1.5">
              <button
                onClick={() => {
                  setCuentaAbierta(true);
                  sfx.click();
                }}
                className="inline-flex items-center gap-1 rounded-sm border border-amber-hud/50 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-amber hover:bg-amber-hud/20"
              >
                <UserCog className="w-3 h-3" />
                {haySesion ? "mi cuenta" : "entrar o crear cuenta"}
              </button>
              <Link
                href="/modo"
                className="inline-flex items-center gap-1 rounded-sm border border-zinc-700 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground hover:text-amber"
              >
                <DoorOpen className="w-3 h-3" />
                el ritual de entrada
              </Link>
              <Link
                href="/nucleo"
                className="inline-flex items-center gap-1 rounded-sm border border-zinc-700 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground hover:text-amber"
              >
                <ShieldCheck className="w-3 h-3" />
                el censo y sus permisos
              </Link>
            </div>
          </div>

          <div className="rounded-sm border border-zinc-800 px-2.5 py-2">
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">qué guarda la casa de ti</p>
            <ul className="mt-1 space-y-0.5 font-mono text-[9px] leading-relaxed text-zinc-500">
              <li>· en la nube, si tienes cuenta: tu nombre de agente, tu partida y el modo que elegiste</li>
              <li>· en tu aparato: foto, banner, marco, bio, país, facción, avatar y firma 3D</li>
              <li>· nunca: correo, teléfono, ubicación ni contactos — la casa no los pide</li>
            </ul>
            <Link href="/privacidad" className="mt-1 inline-block font-mono text-[9px] uppercase tracking-widest text-amber hover:underline">
              la política de privacidad entera ▸
            </Link>
          </div>
        </section>
      )}

      <AccountModal open={cuentaAbierta} onClose={() => setCuentaAbierta(false)} />
    </div>
  );
}

export default PerfilJugador;
