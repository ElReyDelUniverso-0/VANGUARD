"use client";

// ═══════════════════════════════════════════════════════════════════
// v442.0 · LOS SÍMBOLOS VIVOS — EL COMPONENTE
//
// El modelo (src/lib/simbolos-vivos/modelo.ts) decide QUÉ signo es cada
// cosa; el estado (src/lib/simbolos-vivos/estado.ts) decide QUÉ le pasa.
// Este archivo lo pinta: un SVG propio (cero imágenes, cero dependencias)
// con cuatro humores:
//
//   calma       respira (escala + opacidad, GPU)
//   reciente    chispas de «?» que saltan alrededor del signo
//   ira         tiembla, se tiñe de rojo y echa el signo de la ira
//   importante  tiembla suave, echa un anillo de energía, cambia de
//               posición y los ojos de Vanguard miran a los lados
//
// Toda la animación es transform/opacity (60 FPS) y se apaga sola con
// prefers-reduced-motion. El DV (VidaGlobal) se monta UNA vez en el layout.
// ═══════════════════════════════════════════════════════════════════

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { sigiloDe, FORMA_D, type EstadoVida, type Sigilo } from "@/lib/simbolos-vivos/modelo";
import { useVidaStore, estadoDeVida, moduloDeMensaje, moduloDelPulso, PULSO_CICLO } from "@/lib/simbolos-vivos/estado";
import { useGameStore } from "@/lib/game-store";
import { moduloDe } from "@/components/portada/modulos";

// ── la hoja de vida (una sola vez, montada por VidaGlobal) ─────────────
const CSS_VIDA = `
.vsv{position:relative;display:inline-grid;place-items:center;flex:0 0 auto;line-height:0;isolation:isolate}
.vsv-svg{display:block;overflow:visible;transition:color .3s ease}
.vsv[data-estado="calma"] .vsv-svg{animation:vsv-respira 3.8s ease-in-out infinite}
.vsv[data-estado="reciente"] .vsv-svg{animation:vsv-respira 2.1s ease-in-out infinite}
.vsv[data-estado="ira"] .vsv-svg{animation:vsv-tiembla .2s linear infinite;color:#FF3B30}
.vsv[data-estado="importante"]{animation:vsv-cambia 3.4s ease-in-out infinite}
.vsv[data-estado="importante"] .vsv-svg{animation:vsv-tiembla-suave .45s ease-in-out infinite}
.vsv[data-estado="importante"] .vsv-energia{animation:vsv-energia 1.7s ease-out infinite}
.vsv-energia{position:absolute;inset:-3px;border:1.5px solid currentColor;border-radius:50%;opacity:0;pointer-events:none}
.vsv-chispas{position:absolute;inset:-6px;pointer-events:none}
.vsv-chispas i{position:absolute;left:50%;top:-2px;font:700 11px/1 ui-monospace,monospace;font-style:normal;color:#FFC94D;opacity:0;text-shadow:0 0 6px rgba(255,201,77,.85);animation:vsv-chispa 2.3s ease-out infinite}
.vsv-chispas i:nth-child(1){--cx:-13px;animation-delay:0s}
.vsv-chispas i:nth-child(2){--cx:1px;animation-delay:.55s}
.vsv-chispas i:nth-child(3){--cx:-5px;animation-delay:1.1s}
.vsv-ira{position:absolute;top:-7px;right:-9px;color:#FF3B30;filter:drop-shadow(0 0 6px rgba(255,59,48,.85));animation:vsv-ira-salta 1.1s ease-in-out infinite;pointer-events:none}
.vsv-ojo{transform-box:fill-box;transform-origin:center}
.vsv-pupila{transition:transform .25s ease}
.vsv-iris{transition:transform .3s ease}
.vsv[data-estado="importante"] .vsv-pupila{animation:vsv-ojos 1.5s ease-in-out infinite}
.vsv[data-estado="importante"] .vsv-iris{animation:vsv-iris 1.5s ease-in-out infinite}
.vsv[data-estado="ira"] .vsv-ojo{transform:scaleY(.42)}
.vsv[data-estado="ira"] .vsv-pupila{fill:#FF3B30}
.vsv[data-estado="ira"] .vsv-iris{transform:scaleY(.5)}
@keyframes vsv-respira{0%,100%{transform:scale(1);opacity:.9}50%{transform:scale(1.05);opacity:1}}
@keyframes vsv-chispa{0%{opacity:0;transform:translate(var(--cx,0px),7px) scale(.45) rotate(-16deg)}22%{opacity:1}72%{opacity:1}100%{opacity:0;transform:translate(var(--cx,0px),-11px) scale(1.2) rotate(12deg)}}
@keyframes vsv-ira-salta{0%,100%{transform:scale(.85) rotate(-7deg)}50%{transform:scale(1.18) rotate(9deg)}}
@keyframes vsv-energia{0%{opacity:.8;transform:scale(.62)}100%{opacity:0;transform:scale(1.3)}}
@keyframes vsv-ojos{0%,100%{transform:translateX(0)}25%{transform:translateX(-1.8px)}75%{transform:translateX(1.8px)}}
@keyframes vsv-iris{0%,100%{transform:translateX(0)}25%{transform:translateX(-2.4px)}75%{transform:translateX(2.4px)}}
@keyframes vsv-tiembla{0%,100%{transform:translate(0,0) rotate(0deg)}20%{transform:translate(-.9px,.6px) rotate(-1.2deg)}40%{transform:translate(.8px,-.7px) rotate(1deg)}60%{transform:translate(-.7px,-.5px) rotate(-.8deg)}80%{transform:translate(.9px,.6px) rotate(1.2deg)}}
@keyframes vsv-tiembla-suave{0%,100%{transform:translate(0,0) rotate(0deg)}30%{transform:translate(-.7px,.5px) rotate(-.7deg)}65%{transform:translate(.7px,-.5px) rotate(.7deg)}}
@keyframes vsv-cambia{0%,100%{transform:translate(0,0)}30%{transform:translate(1.6px,-1.2px)}60%{transform:translate(-1.4px,1px)}}
@media (prefers-reduced-motion:reduce){.vsv,.vsv-svg,.vsv-chispas i,.vsv-ira,.vsv-energia,.vsv-pupila,.vsv-iris{animation:none!important}}
`;

function EstilosVida() {
  return <style dangerouslySetInnerHTML={{ __html: CSS_VIDA }} />;
}

// ── las piezas del signo ───────────────────────────────────────────────
function FormaSigilo({ sig }: { sig: Sigilo }) {
  return <path d={FORMA_D[sig.forma]} />;
}

function OjosVanguard() {
  return (
    <g className="vsv-ojos" strokeWidth="1.5">
      <g className="vsv-ojo">
        <circle cx="16.5" cy="20" r="3.6" />
        <circle className="vsv-pupila" cx="16.5" cy="20" r="1.5" fill="currentColor" stroke="none" />
      </g>
      <g className="vsv-ojo">
        <circle cx="31.5" cy="20" r="3.6" />
        <circle className="vsv-pupila" cx="31.5" cy="20" r="1.5" fill="currentColor" stroke="none" />
      </g>
    </g>
  );
}

function IrisVanguard() {
  return (
    <g className="vsv-iris">
      <circle cx="24" cy="24" r="7" />
      <circle className="vsv-pupila" cx="24" cy="24" r="2.6" fill="currentColor" stroke="none" />
    </g>
  );
}

export interface SimboloVivoProps {
  id: string;
  tam?: number;
  estado: EstadoVida;
  /** ojos de Vanguard (por defecto, los que llevan signo y tamaño) */
  ojos?: boolean;
  className?: string;
  /** si se da, el signo se anuncia con esa etiqueta */
  titulo?: string;
}

/** El signo pintado, con el humor que le digas. */
export function SimboloVivo({ id, tam = 40, estado, ojos, className, titulo }: SimboloVivoProps) {
  const sig = sigiloDe(id);
  const conOjos = ojos ?? sig.ojo;
  const Ira = Math.max(12, Math.round(tam * 0.44));
  return (
    <span
      className={`vsv${className ? ` ${className}` : ""}`}
      data-estado={estado}
      style={{ color: sig.acento }}
      role={titulo ? "img" : undefined}
      aria-label={titulo}
      aria-hidden={titulo ? undefined : true}
    >
      <svg
        className="vsv-svg"
        viewBox="0 0 48 48"
        width={tam}
        height={tam}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <g transform={`rotate(${sig.giro} 24 24)`}>
          <FormaSigilo sig={sig} />
          {sig.piezas.map((p, i) => (
            <path
              key={i}
              d={p.d}
              transform={p.transform}
              fill={p.relleno ? "currentColor" : "none"}
              stroke={p.relleno ? "none" : undefined}
            />
          ))}
          {sig.forma === "ojo" && <IrisVanguard />}
        </g>
        {conOjos && <OjosVanguard />}
      </svg>
      {estado === "reciente" && (
        <span className="vsv-chispas" aria-hidden="true">
          <i>?</i>
          <i>?</i>
          <i>?</i>
        </span>
      )}
      {estado === "importante" && <span className="vsv-energia" aria-hidden="true" />}
      {estado === "ira" && (
        <svg
          className="vsv-ira"
          viewBox="0 0 16 16"
          width={Ira}
          height={Ira}
          aria-hidden="true"
          fill="currentColor"
        >
          <path d="M8.5 0.5 L4 8.5 H7 L5.5 15.5 L12 7 H8.5 Z" />
        </svg>
      )}
    </span>
  );
}

// ── el hook: el humor real de un signo ─────────────────────────────────
export function useEstadoVivo(id: string): EstadoVida {
  const vida = useVidaStore();
  const progreso = useGameStore((s) => s.dailyChallengeProgress);
  const reclamadas = useGameStore((s) => s.dailyChallengeClaimed);
  return estadoDeVida(id, vida, {
    dailyChallengeProgress: progreso,
    dailyChallengeClaimed: reclamadas,
  });
}

/** Isla cliente: el signo con su vida dentro (para componentes de servidor). */
export function SigiloVivo({
  id,
  tam = 40,
  ojos,
  className,
  titulo,
}: {
  id: string;
  tam?: number;
  ojos?: boolean;
  className?: string;
  titulo?: string;
}) {
  const estado = useEstadoVivo(id);
  return <SimboloVivo id={id} tam={tam} estado={estado} ojos={ojos} className={className} titulo={titulo} />;
}

// ── el corazón: se monta UNA vez y da vida a toda la casa ──────────────
export function VidaGlobal() {
  const ruta = usePathname();

  // cada sala por la que pasa el piloto deja huella (visita real)
  useEffect(() => {
    const t = useVidaStore.getState();
    t.visitar(ruta);
    const m = moduloDe(ruta);
    if (m) t.visitar(m.id);
  }, [ruta]);

  // el reloj de la casa: pulso determinista + eventos de la bitácora
  useEffect(() => {
    const latir = () => {
      const ahora = Date.now();
      const s = useVidaStore.getState();
      const ciclo = Math.floor(ahora / PULSO_CICLO);
      if (Math.floor(s.pulso / PULSO_CICLO) !== ciclo) {
        useVidaStore.getState().marcarImportante(moduloDelPulso(ciclo), ahora);
      }
      const g = useGameStore.getState();
      const ultimo = g.log?.[0];
      if (ultimo && ultimo.ts !== s.vistoLog) {
        useVidaStore.setState({ vistoLog: ultimo.ts });
        const mod = moduloDeMensaje(ultimo.msg ?? "");
        if (mod) useVidaStore.getState().marcarImportante(mod, ahora);
      }
      useVidaStore.setState({ ahora });
    };
    latir();
    const t = setInterval(latir, 5000);
    return () => clearInterval(t);
  }, []);

  return <EstilosVida />;
}
