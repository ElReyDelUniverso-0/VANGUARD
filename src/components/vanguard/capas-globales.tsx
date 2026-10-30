"use client";

// v194.0 LA CASA PESO PLUMA — LAS CAPAS GLOBALES EN DIFERIDO.
// Los 5 motores de ambiente vivían como imports ESTÁTICOS del layout:
// su código (y el de todo lo que arrastran) viajaba en el bundle inicial
// de TODAS las rutas, peleándose con la hidratación en señal lenta.
// Ahora nacen aquí, en chunks aparte que solo bajan cuando el hilo queda
// idle tras __vgvivo (MontajeTardio). La casa despierta primero; el
// ambiente llega después. Nada cambia en red rápida.
import dynamic from "next/dynamic";
import { MontajeTardio } from "@/components/vanguard/montaje-tardio";

const MotorAgentes = dynamic(
  () => import("@/components/vanguard/motor-agentes").then((m) => m.MotorAgentes),
  { ssr: false }
);
const MotorNexus = dynamic(
  () => import("@/components/vanguard/motor-nexus").then((m) => m.MotorNexus),
  { ssr: false }
);
const RetentionLayer = dynamic(
  () => import("@/components/vanguard/retention-layer").then((m) => m.RetentionLayer),
  { ssr: false }
);
const PulsoAuto = dynamic(
  () => import("@/components/vanguard/pulso-auto").then((m) => m.PulsoAuto),
  { ssr: false }
);
const RegresoBanner = dynamic(
  () => import("@/components/vanguard/regreso-banner").then((m) => m.RegresoBanner),
  { ssr: false }
);
// v207.0 INFINITO: el corazón que mira el repo y ofrece la recarga opt-in
const AutoActualizacion = dynamic(
  () => import("@/components/vanguard/auto-actualizacion").then((m) => m.AutoActualizacion),
  { ssr: false }
);

export function CapasGlobales() {
  return (
    <MontajeTardio>
      {/* v133.0: el cuerpo de agentes autónomos — la Casa se pule sola
          en cualquier sala, sin que nadie tenga que visitar su sala */}
      <MotorAgentes />
      {/* v135.0 NEXUS-HYPNOS: el pulso del planeta viste la Casa entera */}
      <MotorNexus />
      {/* v55.0 TEMPORADA CERO: capa global de retención en TODAS las páginas */}
      <RetentionLayer />
      {/* v99.0 MENTE VIVA: el pulso autónomo — Vanguard se actualiza sola */}
      <PulsoAuto />
      {/* v101.0 EL REGRESO — PILAR 1: el mundo cambió mientras no mirabas */}
      <RegresoBanner />
      {/* v207.0 INFINITO: Vanguard se actualiza sola — aviso opt-in, nada se recarga sin permiso (v190) */}
      <AutoActualizacion />
    </MontajeTardio>
  );
}
