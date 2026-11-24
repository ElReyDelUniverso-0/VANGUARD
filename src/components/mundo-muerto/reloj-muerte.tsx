"use client";
// ═══════════════════════════════════════════════════════════════════
// v444.0 · EL MUNDO MUERTO — el reloj
// Una cuenta honesta: cifra anual de la fuente ÷ segundos del año ×
// segundos que llevas aquí. No es un contador en vivo de muertes reales
// (nadie lo tiene): es el ritmo medio que dicen las fuentes.
// ═══════════════════════════════════════════════════════════════════
import { useEffect, useState } from "react";

const SEG_ANIO = 365.25 * 24 * 3600;

export interface CeldaReloj {
  id: string;
  nombre: string;
  color: string;
  anual: number;
}

function cadaCuanto(anual: number): string {
  const s = SEG_ANIO / anual;
  const f = (n: number) => n.toLocaleString("es-DO", { maximumFractionDigits: n < 10 ? 1 : 0 });
  if (s < 60) return `una cada ${f(s)} s`;
  if (s < 3600) return `una cada ${f(s / 60)} min`;
  return `una cada ${f(s / 3600)} h`;
}

export function RelojMuerte({ celdas }: { celdas: CeldaReloj[] }) {
  const [seg, setSeg] = useState(0);
  useEffect(() => {
    const t0 = performance.now();
    const id = window.setInterval(() => setSeg((performance.now() - t0) / 1000), 500);
    return () => window.clearInterval(id);
  }, []);
  return (
    <div className="mm-reloj-rejilla">
      {celdas.map((c) => (
        <a key={c.id} className="mm-reloj-celda" href={`/mundo-muerto/${c.id}`} style={{ "--c": c.color } as React.CSSProperties}>
          <b suppressHydrationWarning>{Math.floor((c.anual / SEG_ANIO) * seg).toLocaleString("es-DO")}</b>
          <span>
            {c.nombre} · {cadaCuanto(c.anual)}
          </span>
        </a>
      ))}
    </div>
  );
}
