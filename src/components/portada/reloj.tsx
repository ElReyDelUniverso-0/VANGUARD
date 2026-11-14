"use client";

// v401 — el reloj de mando: hora de Santo Domingo + UTC, como en la sala de siempre
import { useEffect, useState } from "react";

function fmt(d: Date, tz: string) {
  return d.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: tz });
}

export function Reloj() {
  const [ahora, setAhora] = useState<Date | null>(null);
  useEffect(() => {
    setAhora(new Date());
    const t = window.setInterval(() => setAhora(new Date()), 20_000);
    return () => window.clearInterval(t);
  }, []);
  return (
    <span className="vx-reloj" aria-label="Hora">
      <b suppressHydrationWarning>{ahora ? fmt(ahora, "UTC") : "--:--"} UTC</b>
      <small suppressHydrationWarning>SDQ {ahora ? fmt(ahora, "America/Santo_Domingo") : "--:--"}</small>
    </span>
  );
}
