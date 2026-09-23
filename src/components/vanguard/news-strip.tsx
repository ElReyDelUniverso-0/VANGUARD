"use client";

// v39 — STRIP DE NOTICIAS EN VIVO para cualquier página de mando (/mision).
// Razón de ser: el comandante y los reclutas aterrizan en /mision y no ven
// noticias ahí → "la página no tiene noticias". Mentira: la portada y
// /guerra-hoy siempre las muestran. Este strip garantiza que TODA página
// muestre el frente al instante, con enlace profundo a /guerra-hoy.

import { useEffect, useState } from "react";
import Link from "next/link";
import { Newspaper, Clock, ArrowUpRight } from "lucide-react";

interface Item {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: string;
}

function ago(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "ahora";
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export function NewsStrip() {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    let alive = true;
    fetch("/api/news", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (alive && Array.isArray(d?.items) && d.items.length > 0) {
          setItems(d.items.slice(0, 5));
        }
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  return (
    <section className="hud-panel p-4 md:p-5 mt-6 relative overflow-hidden" aria-label="Últimas noticias en vivo">
      <div className="hairline-gradient absolute top-0 left-0 right-0 opacity-60" aria-hidden />
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Newspaper className="w-4 h-4 text-amber shrink-0" />
          <h2 className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground truncate">
            Últimas noticias del frente — en vivo
          </h2>
        </div>
        <Link
          href="/guerra-hoy"
          className="shrink-0 inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest text-amber hover:text-foreground transition-colors"
        >
          ver todas <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>
      {items.length === 0 ? (
        <p className="mt-3 text-[11px] font-mono text-muted-foreground">Sintonizando el radar…</p>
      ) : (
        <ul className="mt-3 space-y-2.5">
          {items.map((i) => (
            <li key={i.id}>
              <a
                href={i.url && i.url.startsWith("http") ? i.url : "/guerra-hoy"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 group"
              >
                <span className="shrink-0 text-[9px] font-mono text-amber border border-amber-hud/40 px-1.5 py-0.5 uppercase">
                  {i.source}
                </span>
                <span className="flex-1 min-w-0 text-[11px] text-foreground group-hover:text-amber transition-colors truncate">
                  {i.title}
                </span>
                <span className="shrink-0 text-[9px] font-mono text-muted-foreground flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" /> {ago(i.publishedAt)}
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
