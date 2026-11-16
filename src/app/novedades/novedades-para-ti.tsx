"use client";

// ═══════════════════════════════════════════════════════════════════
// v403.8 · «PARA TI» — la tercera mitad de LA PUERTA.
//
// `FeedParaTi` (v170.0) es el feed de descubrimiento de la casa: puntúa las
// salas según lo que el visitante ha abierto, mirado y marcado, y le enseña
// lo que encaja (con exploración, para no encerrarlo en su burbuja). Estaba
// escrito y probado… colgando de `vanguard-app.tsx`, que no importaba nadie.
//
// Este archivo es solo el enchufe: le da al feed el estado del agente y las
// acciones de siempre (abrir, me gusta, no me interesa) y manda «abrir» al
// cuartel con /cuartel?sala=<clave>, que es donde viven las salas.
//
// NADA SE REESCRIBE: el algoritmo, las tarjetas y el sonido siguen siendo
// los de la v170. Solo se les da la luz.
// ═══════════════════════════════════════════════════════════════════
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAgente } from "@/lib/vanguard/agente-store";
import { FeedParaTi } from "@/components/vanguard/feed-para-ti";

export function NovedadesParaTi() {
  const router = useRouter();
  const { agente, montado, abrirSala, darLike, marcarNoInteresa } = useAgente();

  // Semilla de sesión: cambia cada visita, así el feed no repite el mismo orden.
  const semilla = useMemo(() => {
    try {
      const k = "vg-semilla-feed-v4038";
      const guardada = sessionStorage.getItem(k);
      if (guardada) return guardada;
      const nueva = String(Math.floor(Math.random() * 1e9));
      sessionStorage.setItem(k, nueva);
      return nueva;
    } catch {
      return "0";
    }
  }, []);

  return (
    <div className="vx-para-ti">
      <FeedParaTi
        agente={agente}
        semillaSesion={semilla}
        montado={montado}
        sonido={agente.sonido}
        onAbrir={(salaId: string) => {
          abrirSala(salaId);
          router.push(`/cuartel?sala=${salaId}`);
        }}
        onLike={(salaId: string) => darLike(salaId)}
        onNoInteresa={(salaId: string) => marcarNoInteresa(salaId)}
      />
    </div>
  );
}
