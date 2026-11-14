"use client";

// v400.0 — "↑ 3 noticias nuevas" (como X/Twitter). Pregunta cada 3 min si
// hay notas nuevas; NADA se recarga solo (ley v190): el lector decide.
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function AvisoNuevas({ primera }: { primera: string | null }) {
  const router = useRouter();
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!primera) return;
    let vivo = true;
    const mirar = async () => {
      if (document.hidden) return;
      try {
        const r = await fetch("/api/portada", { cache: "no-store" });
        const j = (await r.json()) as { ids?: string[] };
        const ids = j.ids ?? [];
        const idx = ids.indexOf(primera);
        const nuevas = idx === -1 ? Math.min(ids.length, 9) : idx;
        if (vivo) setN(nuevas);
      } catch {}
    };
    const t = window.setInterval(mirar, 180_000);
    return () => {
      vivo = false;
      window.clearInterval(t);
    };
  }, [primera]);

  if (n <= 0) return null;
  return (
    <button
      className="vx-nuevas"
      onClick={() => {
        setN(0);
        window.scrollTo({ top: 0, behavior: "smooth" });
        router.refresh();
      }}
    >
      ↑ {n} {n === 1 ? "noticia nueva" : "noticias nuevas"}
    </button>
  );
}
