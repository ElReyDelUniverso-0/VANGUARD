"use client";

// ============================================================
// v120.0 GRAN SALTO 3D — LA CIUDAD REINA EN LA PORTADA
// Mandato del comandante: "la ciudad del inicio cambia de región
// y de ciclo de día a noche en tiempo real, letras 3D de verdad".
// El OcasoBanner estático (v71) se jubila: ahora lo primero que
// ve el visitante es la MEGALÓPOLIS VIVA de la casa:
//   · Cielo real: noche, alba, día u ocaso según TU reloj (v116).
//   · Región rotativa: Núcleo Cromo, Distrito Neón, Meseta Solar,
//     Puerto Abierto, Jardines Verticales o Ciudadela — gira sola
//     cada día y aquí gira A MANO con fundido (v117 crossfade).
//   · Clima real del planeta tiñendo la ciudad (v117 meteo).
//   · VANGUARD en LETRAS 3D volumétricas (material BRASA, la
//     identidad dorada) — el título de la casa con volumen real.
// Rendimiento: la escena respira en CSS (transform/opacity), el
// título entra una vez y queda quieto; reduced-motion lo apaga.
// ============================================================

import { useCallback } from "react";
import { RotateCw } from "lucide-react";
import { CiudadInicio } from "./megalopolis";
import { TituloLetras3D } from "./letras-3d";
import { useT } from "@/lib/i18n";
import { useReducedMotion } from "framer-motion";

export function CiudadHero() {
  const { t } = useT();
  const reduced = useReducedMotion();

  // el giro manual consume el mismo evento que la ciudad ya escucha:
  // crossfade de 2.4 s entre skylines (cero flash, cero re-layout)
  const girar = useCallback(() => {
    window.dispatchEvent(new CustomEvent("vanguard:rotar-region"));
  }, []);

  return (
    <div
      className="hud-panel card-shine relative overflow-hidden mb-4 will-change-transform"
      style={{ padding: 0 }}
      data-parallax="0.12"
      aria-label="VANGUARD · la ciudad viva en tiempo real"
    >
      <div className="relative h-[252px] sm:h-[332px]">
        {/* LA CIUDAD VIVA — ciclo día/noche real + región del día + clima */}
        <CiudadInicio acc="#FFC94D" />

        {/* velo de legibilidad sobre el centro (no tapa los chips) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(120% 72% at 50% 34%, rgba(0,0,0,0.40), transparent 68%)" }}
          aria-hidden
        />

        {/* el título de la casa: LETRAS 3D DE VERDAD */}
        <div className="absolute inset-x-0 top-[14%] flex flex-col items-center text-center px-3 pointer-events-none">
          <TituloLetras3D
            texto="VANGUARD"
            acento="#FFC94D"
            material="oro"
            profundidad={7}
            entrada={!reduced}
            etiqueta="VANGUARD"
            className="text-3xl sm:text-6xl"
          />
          <p
            className="font-jet text-[9px] sm:text-xs tracking-[0.35em] mt-2 sm:mt-3 uppercase"
            style={{ color: "rgba(255,225,170,0.92)", textShadow: "0 1px 12px rgba(0,0,0,0.95)" }}
          >
            {t("ciudad120.lema")}
          </p>
        </div>

        {/* GIRAR REGIÓN — la ciudad a mano (la rotación diaria sigue sola) */}
        <button
          onClick={girar}
          title={t("ciudad120.girarHint")}
          aria-label={t("ciudad120.girar")}
          className="absolute right-2 top-2 z-20 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.25em] backdrop-blur-sm transition-colors cursor-pointer"
          style={{
            background: "rgba(0,0,0,0.55)",
            border: "1px solid rgba(255,201,77,0.55)",
            color: "#FFC94D",
            textShadow: "0 1px 6px rgba(0,0,0,0.8)",
          }}
        >
          <RotateCw className="w-3 h-3" />
          <span className="hidden sm:inline">{t("ciudad120.girar")}</span>
        </button>
      </div>
    </div>
  );
}
