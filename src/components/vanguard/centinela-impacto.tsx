"use client";

// v180.0 VANGUARD AUTOMÁTICO — EL CENTINELA DE IMPACTO.
// El mandato del Dueño: «que no necesite que una persona necesariamente
// esté buscando, porque se puede perder». Aquí las noticias te BUSCAN:
// este radar vive en toda la app, sondea el centro mundial cada 60s,
// compara con lo ya visto (localStorage vg180-vistos, dedupe real) y cuando
// aterriza un cable NUEVO URGENTE o CRÍTICO:
//   · toast con el titular real (siempre — los ojos no duermen)
//   · VG-ASSIST lo ANUNCIA POR VOZ (vg:asistente-anunciar — apagable:
//     vg180-voz-alertas, honesto: la voz se puede callar, el radar no)
// Primera vuelta: siembra silenciosa (no spamea el archivo entero al
// arrancar) — solo anuncia lo que LLEGA DESPUÉS de abrir la Casa.

import { useEffect } from "react";
import { toast } from "sonner";
import { pedirNoticias } from "@/lib/noticias-cache";

const LS_VISTOS = "vg180-vistos";
const LS_VOZ = "vg180-voz-alertas";
const CADA_MS = 60_000;
const COOLDOWN_MS = 45_000; // máx 1 anuncio de voz cada 45s (nada de bombardeo)
const UMBRAL = 64; // CRÍTICO ≥64 (URGENTE ≥80 entra sobrado)

function leeVistos(): Set<string> {
  try {
    const arr = JSON.parse(localStorage.getItem(LS_VISTOS) || "[]");
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function guardaVistos(v: Set<string>) {
  try {
    localStorage.setItem(LS_VISTOS, JSON.stringify([...v].slice(-300)));
  } catch {}
}

export function CentinelaImpacto() {
  useEffect(() => {
    let muerto = false;
    let ultimoAnuncio = 0;
    let sembrado = false;
    const vistos = leeVistos();

    const vozAlertas = () => {
      try {
        return localStorage.getItem(LS_VOZ) !== "0";
      } catch {
        return true;
      }
    };

    const anuncia = (pais: string, titulo: string, impacto: number, tier: string) => {
      const esUrgente = impacto >= 80;
      const sello = esUrgente ? "URGENTE" : "CRÍTICO";
      toast(`${sello} · ${pais}`, {
        description: titulo.slice(0, 120),
        duration: esUrgente ? 12000 : 8000,
      });
      // voz: solo si el piloto la tiene encendida y el cooldown respira
      if (!vozAlertas()) return;
      const ahora = Date.now();
      if (ahora - ultimoAnuncio < COOLDOWN_MS) return;
      ultimoAnuncio = ahora;
      try {
        window.dispatchEvent(
          new CustomEvent("vg:asistente-anunciar", {
            detail: {
              texto:
                `Alerta ${sello.toLowerCase()}. ${pais}. ` +
                titulo.slice(0, 110) +
                `. Impacto ${impacto}. Abriendo el centro mundial.`,
              auto: true,
            },
          })
        );
        void tier;
      } catch {}
    };

    const sondea = async () => {
      if (muerto || document.hidden) return; // pestaña oculta: el radar respira
      try {
        // v196: por el pozo único (balde CENTRO) — el Centinela bebe la misma
        // agua que las fichas y GUERRA HOY; si es fresca, cero red
        const items = (await pedirNoticias(false, "centro")) as {
          id: string;
          title?: string;
          paisNombre?: string;
          impacto?: number | string;
          tier?: string;
        }[];
        if (!items.length) return;

        if (!sembrado) {
          // primera vuelta: SIEMBRA SILENCIOSA — el archivo que ya estaba no
          // es "noticia nueva para ti", es el mundo girando antes de llegar
          for (const c of items) vistos.add(c.id);
          guardaVistos(vistos);
          sembrado = true;
          return;
        }

        const frescos: { id: string; pais: string; titulo: string; imp: number; tier: string }[] = [];
        for (const c of items) {
          if (vistos.has(c.id)) continue;
          vistos.add(c.id);
          const imp = Number(c.impacto) || 0;
          if (imp >= UMBRAL) {
            frescos.push({
              id: c.id,
              pais: c.paisNombre || "MUNDO",
              titulo: c.title || c.paisNombre || "Cable en vivo",
              imp,
              tier: c.tier || "alto",
            });
          }
        }
        guardaVistos(vistos);
        // el más pesado primero; máximo 2 toasts por sondeo (nada de spam)
        frescos.sort((a, b) => b.imp - a.imp);
        for (const f of frescos.slice(0, 2)) anuncia(f.pais, f.titulo, f.imp, f.tier);
      } catch {
        // red dormida: el radar reintenta en el próximo ciclo, sin ruido
      }
    };

    sondea();
    const t = setInterval(sondea, CADA_MS);
    return () => {
      muerto = true;
      clearInterval(t);
    };
  }, []);

  return null; // el radar no se ve — se siente: las noticias llegan solas
}
