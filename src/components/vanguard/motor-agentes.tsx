"use client";

// ============================================================
// v133.0 EL ACABADO REAL — EL MOTOR GLOBAL DEL CUERPO
// La orden del Dueño (v131): «agentes que cada cierto tiempo
// pulan Vanguard» — no solo cuando miras la sala de los agentes:
// SIEMPRE. Montado en el layout raíz, el cuerpo late en todas
// las salas desde el primer segundo. instalarMotorAgentes() es
// idempotente (guardia v133): una sola instalación por página.
// v133: la instalación espera a la REHIDRATACIÓN del store
// (skipHydration) — la credencial y la visita se estampan con la
// cerradura del storage ya abierta y el grabado entra en placa.
// ============================================================
import { useEffect } from "react";
import { instalarMotorAgentes, useAgentesLibres } from "@/lib/agentes-autonomos";

export function MotorAgentes() {
  useEffect(() => {
    const instalar = () => instalarMotorAgentes();
    if (useAgentesLibres.persist.hasHydrated()) return instalar();
    const desuscribir = useAgentesLibres.persist.onFinishHydration(instalar);
    return () => { desuscribir(); };
  }, []);
  return null;
}
