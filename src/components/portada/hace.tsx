"use client";

// v400.0 — "hace 3 min" que se actualiza solo cada minuto (sin recargar nada)
import { useEffect, useState } from "react";
import { haceTexto } from "@/lib/portada/clasificar";

export function Hace({ iso }: { iso: string }) {
  const [ahora, setAhora] = useState<number | null>(null);
  useEffect(() => {
    setAhora(Date.now());
    const t = window.setInterval(() => setAhora(Date.now()), 60_000);
    return () => window.clearInterval(t);
  }, []);
  return (
    <time dateTime={iso} suppressHydrationWarning>
      {haceTexto(iso, ahora ?? undefined)}
    </time>
  );
}
