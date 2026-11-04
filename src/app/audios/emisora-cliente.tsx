"use client";

// v217.0 LA EMISORA — cliente del parte hablado: ELIGE LA VOZ (6 voces del
// Consejo) y pone el parte de guerra AL AIRE con el motor v196 (anti-traba,
// respeta MUTE). Cero setState en effects (ley v176): los chips son estado
// de interacción pura, nada se autoejecuta al montar.
// v234.0 LA ONDA — las tarjetas de frente dejan de ser datos muertos: el
// nombre abre LA SALA REAL del teatro (/conflicto/[tag] — el parte solo
// incluye teatros con cables, la puerta nunca 404), el ÚLTIMO HECHO se
// muestra y abre SU cable (/noticia/[id] con el id real de la consulta),
// y cada frente gana la onda corta al globo (/mundo?teatro=). Puertas
// honestas: sin titular no hay puerta, jamás se finge.
import { useState } from "react";
import Link from "next/link";
import { VOCES_ROSTER, hablarAgente, pararVoces, type VozAgenteId } from "@/lib/voces-agentes";
import type { TeatroDelParte } from "@/lib/emisor-guerra";

const CLAVES: VozAgenteId[] = ["comandante", "corresponsal", "narrador", "centinela", "analista", "assist"];

export function EmisoraCliente({ textoParte, teatros }: { textoParte: string; teatros: TeatroDelParte[] }) {
  const [voz, setVoz] = useState<VozAgenteId>("comandante");
  const [alAire, setAlAire] = useState(false);

  const probar = (id: VozAgenteId) => {
    setVoz(id);
    pararVoces();
    hablarAgente(id, VOCES_ROSTER[id].frase);
  };

  const ponerAlAire = () => {
    if (alAire) {
      pararVoces();
      setAlAire(false);
      return;
    }
    setAlAire(true);
    const ok = hablarAgente(voz, textoParte, { onend: () => setAlAire(false), onerror: () => setAlAire(false) });
    if (!ok) setAlAire(false);
  };

  return (
    <section className="mt-6 rounded-xl border border-[#ff2a3c]/25 bg-[#0a0a10] p-5">
      <div className="flex flex-wrap items-center gap-2">
        {CLAVES.map((id) => {
          const v = VOCES_ROSTER[id];
          const activa = voz === id;
          return (
            <button
              key={id}
              onClick={() => probar(id)}
              className={`rounded-lg border px-3 py-2 text-left text-xs transition ${
                activa
                  ? "border-[#ff2a3c] bg-[#ff2a3c]/15 text-[#f5f3ee]"
                  : "border-white/10 bg-white/[.03] text-[#b9b4aa] hover:border-white/25"
              }`}
              title={v.rol}
            >
              <span className="block font-bold tracking-widest" style={{ color: v.color }}>
                ▶ {v.nombre}
              </span>
              <span className="block text-[10px] opacity-70">{v.rol}</span>
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-[11px] text-[#6b665e]">
        Toca una voz para probarla y dejarla elegida. Tu velocidad y tono se afinan en VG-ASSIST (el orbe) y quedan
        grabados.
      </p>

      <button
        onClick={ponerAlAire}
        className={`mt-4 w-full rounded-lg px-4 py-3.5 text-sm font-black tracking-[0.2em] transition ${
          alAire
            ? "bg-[#ff2a3c] text-black animate-pulse"
            : "bg-[#ff2a3c]/15 text-[#ff2a3c] border border-[#ff2a3c]/50 hover:bg-[#ff2a3c]/25"
        }`}
      >
        {alAire ? "◼ CORTAR EMISIÓN" : "📡 PARTE DE GUERRA COMPLETO — AL AIRE"}
      </button>

      <div className="mt-4 space-y-2">
        {teatros.slice(0, 6).map((t) => (
          <div key={t.tag} className="rounded-lg border border-white/10 bg-white/[.02] p-3">
            <div className="flex items-center justify-between gap-2">
              {/* v234.0 — el frente abre su sala real (siempre tiene cables:
               * el parte solo incluye teatros con registro en 24 h) */}
              <Link
                href={`/conflicto/${t.tag}`}
                className="text-sm font-bold tracking-wide hover:text-[#ff2a3c] transition-colors underline decoration-white/10 underline-offset-4 hover:decoration-[#ff2a3c]/60"
                title={`La sala real del frente: ${t.nombre} en /conflicto/${t.tag}`}
              >
                {t.nombre}
              </Link>
              <span className="shrink-0 rounded-full border border-[#ff2a3c]/40 px-2 py-0.5 text-[10px] text-[#ff2a3c]">
                {t.cables} cables/24h
              </span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-[#b9b4aa]">{t.dossier}</p>
            {/* v234.0 — el último hecho narrado, ahora a la vista y con puerta */}
            {t.ultimoTitular && t.ultimoId && (
              <Link
                href={`/noticia/${t.ultimoId}`}
                className="mt-1.5 block truncate text-[11px] italic text-[#8d8779] hover:text-[#ffd34d] transition-colors"
                title={`Último hecho del frente — abrir el cable: ${t.ultimoTitular}`}
              >
                ⏱ Último hecho: {t.ultimoTitular} ▸
              </Link>
            )}
            <Link
              href={`/mundo?teatro=${encodeURIComponent(t.tag)}`}
              className="mt-1.5 inline-block font-mono text-[10px] uppercase tracking-widest text-[#7a94b8] hover:text-[#ffd34d] transition-colors"
              title={`Ver ${t.nombre} en el globo 3D EN VIVO`}
            >
              ver en el mundo 3D ▸
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
