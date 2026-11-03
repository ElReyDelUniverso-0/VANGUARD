"use client";

// ============================================================
// VANGUARD v170.0 — BUSCADOR UNIVERSAL (fórmula Google)
// ⌘K / Ctrl+K: búsqueda instantánea por nombre, tagline,
// descripción, categoría y tags. Ranking por coincidencia.
// ============================================================

import { useEffect, useMemo, useState } from "react";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { CATEGORIAS, type Sala } from "@/lib/vanguard/tipos";
import { SALAS } from "@/lib/vanguard/salas";
import { sfxClick } from "@/lib/vanguard/sonido";

interface PropsBuscador {
  abierto: boolean;
  onAbrir: () => void;
  onCerrar: () => void;
  onAbrirSala: (salaId: string) => void;
}

function puntuar(sala: Sala, q: string): number {
  const term = q.toLowerCase().trim();
  if (!term) return 0;
  let puntos = 0;
  const nombre = sala.nombre.toLowerCase();
  if (nombre.startsWith(term)) puntos += 60;
  if (nombre.includes(term)) puntos += 40;
  if (sala.tagline.toLowerCase().includes(term)) puntos += 18;
  if (sala.descripcion.toLowerCase().includes(term)) puntos += 10;
  if (sala.categoria.toLowerCase().includes(term)) puntos += 14;
  if (sala.tags.some((t) => t.includes(term))) puntos += 22;
  puntos += sala.poder / 100; // desempate por calidad
  return puntos;
}

export function Buscador({ abierto, onAbrir, onCerrar, onAbrirSala }: PropsBuscador) {
  const [q, setQ] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (abierto) onCerrar(); else { sfxClick(); onAbrir(); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    }, [abierto]);

  const resultados = useMemo(() => {
    if (!q.trim()) return SALAS.slice(0, 8);
    return SALAS.map((s) => ({ sala: s, p: puntuar(s, q) }))
      .filter((x) => x.p > 0)
      .sort((a, b) => b.p - a.p)
      .slice(0, 10)
      .map((x) => x.sala);
  }, [q]);

  return (
    <CommandDialog open={abierto} onOpenChange={(o) => !o && onCerrar()}>
      <CommandInput placeholder="Busca en la red: salas, temas, tags…" value={q} onValueChange={setQ} />
      <CommandList>
        <CommandEmpty>
          <span className="text-xs text-white/50">Ninguna sala responde a «{q}». Prueba con «cripto», «guerra», «nasa»…</span>
        </CommandEmpty>
        <CommandGroup heading={q.trim() ? `MEJORES COINCIDENCIAS (${resultados.length})` : "SUGERENCIAS DE LA RED"}>
          {resultados.map((sala) => {
            const cat = CATEGORIAS[sala.categoria];
            return (
              <CommandItem
                key={sala.id}
                value={`${sala.nombre} ${sala.tags.join(" ")}`}
                onSelect={() => {
                  sfxClick();
                  onAbrirSala(sala.id);
                  onCerrar();
                  setQ("");
                }}
                className="gap-3"
              >
                <span className="text-lg">{sala.icono}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-black tracking-wide text-white">{sala.nombre}</span>
                  <span className="block truncate text-[10px] text-white/45">{sala.tagline}</span>
                </span>
                <span className={`shrink-0 text-[9px] font-bold tracking-widest ${cat.texto}`}>{cat.etiqueta}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
      <div className="border-t border-white/10 px-4 py-2 text-[9px] tracking-widest text-white/30">
        ESC PARA CERRAR · ⌘K PARA VOLVER AQUÍ · EL BUSCADOR REGISTRO TU SEÑAL EN EL ALGORITMO
      </div>
    </CommandDialog>
  );
}
