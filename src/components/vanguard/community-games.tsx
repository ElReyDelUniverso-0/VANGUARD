"use client";

// VANGUARD v31 — JUEGOS DE LA COMUNIDAD: vitrina pública de juegos publicados
// por los usuarios desde el Estudio Comunitario (UgcItem kind:"juego").
// · Feed público (solo APROBADO por el agente moderador IA)
// · Jugar en sandbox (HTML propio con srcDoc o URL externa)
// · Contador de jugadas vía PATCH /api/ugc/[id] {action:"play"}
import { useCallback, useEffect, useState } from "react";
import { Gamepad2, Play, RefreshCw, X, Trophy, Clock, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface UgcGame {
  id: string;
  title: string;
  author: string;
  gameUrl: string | null;
  gameHtml: string | null;
  plays: number;
  likes: number;
  createdAt: string;
}

type Sort = "plays" | "recent" | "top";

export function CommunityGames() {
  const [items, setItems] = useState<UgcGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<Sort>("plays");
  const [playing, setPlaying] = useState<UgcGame | null>(null);

  const load = useCallback(async (s: Sort) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/ugc?kind=juego&sort=${s}&limit=24`, { cache: "no-store" });
      const json = (await res.json()) as { items?: UgcGame[] };
      setItems(Array.isArray(json.items) ? json.items : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(sort);
  }, [load, sort]);

  const play = async (g: UgcGame) => {
    setPlaying(g);
    // cuenta la jugada (fire-and-forget; el modal se abre ya)
    try {
      await fetch(`/api/ugc/${g.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "play" }),
      });
      setItems((prev) => prev.map((x) => (x.id === g.id ? { ...x, plays: x.plays + 1 } : x)));
    } catch {
      /* noop */
    }
  };

  const SORTS: { id: Sort; label: string; icon: React.ReactNode }[] = [
    { id: "plays", label: "Más jugados", icon: <Flame className="w-3 h-3" /> },
    { id: "top", label: "Más likes", icon: <Trophy className="w-3 h-3" /> },
    { id: "recent", label: "Recientes", icon: <Clock className="w-3 h-3" /> },
  ];

  return (
    <div className="hud-corner border-violet-hud/60 bg-secondary/20">
      <div className="p-3 border-b border-violet-hud/30 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <Gamepad2 className="w-4 h-4 text-violet-hud flex-shrink-0" />
          <div className="min-w-0">
            <div className="text-xs font-mono font-bold text-violet-hud uppercase tracking-wider">
              Juegos de la comunidad
            </div>
            <div className="text-[9px] font-mono text-muted-foreground">
              Publicados por los jugadores · publica el tuyo desde CREADOR → Estudio Comunitario
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {SORTS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSort(s.id)}
              className={cn(
                "flex items-center gap-1 text-[9px] font-mono uppercase px-2 py-1 border rounded-sm transition-colors",
                sort === s.id
                  ? "border-violet-hud bg-violet-hud/30 text-violet-hud"
                  : "border-border/60 text-muted-foreground hover:text-violet-hud",
              )}
            >
              {s.icon} {s.label}
            </button>
          ))}
          <button
            onClick={() => load(sort)}
            aria-label="Recargar juegos de la comunidad"
            className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-violet-hud"
          >
            <RefreshCw className={cn("w-3 h-3", loading && "animate-spin")} />
          </button>
        </div>
      </div>

      <div className="p-2">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 border border-border/40 bg-secondary/30 animate-pulse rounded-sm" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-[11px] font-mono text-muted-foreground mb-1">
              Todavía no hay juegos publicados. ¡Sé el primero!
            </p>
            <p className="text-[9px] font-mono text-muted-foreground/70">
              Ve a la sección CREADORES → Estudio Comunitario → tipo JUEGO → pega tu HTML o una URL
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {items.map((g) => (
              <button
                key={g.id}
                onClick={() => play(g)}
                className="hud-corner border border-violet-hud/40 bg-background/60 p-2.5 text-left hover:border-violet-hud hover:bg-violet-hud/10 transition-colors group"
              >
                <div className="flex items-center gap-1 mb-1">
                  <Play className="w-3 h-3 text-violet-hud" />
                  <span className="text-[11px] font-mono font-bold text-foreground truncate group-hover:text-violet-hud">
                    {g.title || "JUEGO SIN TÍTULO"}
                  </span>
                </div>
                <div className="text-[9px] font-mono text-muted-foreground">
                  por @{g.author} · {g.plays} jugadas · ♥ {g.likes}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* modal JUGAR (sandbox con fullscreen) */}
      {playing && (
        <div
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-2 sm:p-6"
          onClick={() => setPlaying(null)}
        >
          <div
            className="hud-panel border-violet-hud w-full max-w-4xl max-h-full flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-violet-hud/30">
              <div className="min-w-0">
                <div className="text-xs font-mono font-bold text-violet-hud truncate">
                  🎮 {playing.title || "JUEGO DE LA COMUNIDAD"}
                </div>
                <div className="text-[9px] font-mono text-muted-foreground">
                  por @{playing.author} · {playing.plays} jugadas
                </div>
              </div>
              <button
                onClick={() => setPlaying(null)}
                className="text-muted-foreground hover:text-red-hud"
                aria-label="Cerrar juego"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 min-h-[50vh]">
              {playing.gameHtml ? (
                <iframe
                  title={playing.title || "Juego"}
                  sandbox="allow-scripts allow-pointer-lock"
                  allow="fullscreen; pointer-lock"
                  srcDoc={playing.gameHtml}
                  className="w-full h-[62vh] bg-black"
                />
              ) : (
                <iframe
                  title={playing.title || "Juego"}
                  src={playing.gameUrl ?? "about:blank"}
                  sandbox="allow-scripts allow-same-origin allow-pointer-lock"
                  allow="fullscreen; pointer-lock"
                  className="w-full h-[62vh] bg-black"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
