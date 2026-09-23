"use client";

// v39.1 CADA VISITA CUENTA — ping de jugador sin dependencia de socket.
// Se monta en TODA página de aterrizaje (/mision, /guerra-hoy) para que el
// visitante cuente como jugador al instante, aunque el socket de Render siga
// despertando. Llamar a ensurePlayerCounted() es idempotente (gate de sesión
// + dedupe server-side por UID), así que nunca infla el contador global.

import { useEffect } from "react";
import { ensurePlayerCounted } from "@/lib/realtime";

export function PlayerPing() {
  useEffect(() => {
    ensurePlayerCounted();
  }, []);
  return null;
}
