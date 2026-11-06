"use client";

// ═══════════════════════════════════════════════════════════════════════════
// EL ESCUDO VIVO — el botón que mira (sala /escudo, complemento de la ley
// v204). UN clic → UN fetch a /api/escudo → el informe del Buscador de Llaves
// pintado a la vista con el catálogo VIVO de familias que el propio script
// declara. Sin efectos, sin intervalos (ley v335): el estado solo cambia con
// la mano del comandante. Las llaves viajan siempre enmascaradas — el informe
// jamás filtra lo que caza.
// ═══════════════════════════════════════════════════════════════════════════

import { useState } from "react";

type FamiliaEscudo = {
  id: string;
  familia: string;
  severidad: string;
  cura: string;
};

type HallazgoEscudo = {
  archivo: string;
  linea: number;
  familia: string;
  severidad: string;
  muestra: string;
  lineaTexto?: string;
  cura?: string;
  permiso?: string;
};

type InformeEscudo = {
  examinados: number;
  familias: FamiliaEscudo[];
  nuevos: HallazgoEscudo[];
  permitidos: HallazgoEscudo[];
  exito: boolean;
};

type RespuestaEscudo = {
  ok: boolean;
  motivo?: string;
  entorno?: string;
  informe?: InformeEscudo;
};

type EstadoEscaner = "reposo" | "mirando" | "informe" | "error";

const chipSeveridad = (sev: string) =>
  sev === "ALTA"
    ? "border-red-500/40 bg-red-500/10 text-red-400"
    : "border-amber-500/40 bg-amber-500/10 text-amber-400";

export function EscudoEscaner() {
  const [estado, setEstado] = useState<EstadoEscaner>("reposo");
  const [informe, setInforme] = useState<InformeEscudo | null>(null);
  const [entorno, setEntorno] = useState("");
  const [motivo, setMotivo] = useState("");

  async function ejecutarEscudo() {
    setEstado("mirando");
    setMotivo("");
    setInforme(null);
    try {
      const respuesta = await fetch("/api/escudo", { cache: "no-store" });
      const datos = (await respuesta.json()) as RespuestaEscudo;
      const informe = datos.informe;
      if (!respuesta.ok || !datos.ok || !informe) {
        setMotivo(datos.motivo || "El escudo no entregó informe.");
        setEstado("error");
        return;
      }
      setInforme(informe);
      setEntorno(datos.entorno || "");
      setEstado("informe");
    } catch {
      setMotivo("El escudo no respondió — ¿está el taller levantado?");
      setEstado("error");
    }
  }

  return (
    <div className="mt-5">
      <button
        onClick={ejecutarEscudo}
        disabled={estado === "mirando"}
        className="inline-flex items-center gap-2 rounded-sm border border-amber-500/50 bg-amber-500/10 px-4 py-2.5 font-mono text-[12px] uppercase tracking-widest text-amber-400 transition-colors hover:border-amber-400 hover:bg-amber-500/20 hover:text-amber-300 disabled:cursor-wait disabled:opacity-60"
      >
        {estado === "mirando" ? "La mirada recorre el árbol…" : "Ejecutar el escudo ▸"}
      </button>
      <p className="mt-2 font-mono text-[10px] text-zinc-600">
        un clic · una mirada · las llaves viajan siempre enmascaradas
      </p>

      {estado === "mirando" && (
        <div className="mt-4 border border-zinc-800 bg-zinc-900/60 rounded-md p-4 font-mono text-[11px] text-zinc-500">
          El Buscador de Llaves revisa el árbol completo (puede tardar unos
          segundos)…
        </div>
      )}

      {estado === "error" && (
        <div className="mt-4 border border-red-500/40 bg-red-500/10 rounded-md p-4 font-mono text-[11px] text-red-300">
          {motivo}
        </div>
      )}

      {estado === "informe" && informe && (
        <div className="mt-4 flex flex-col gap-5">
          {/* veredicto */}
          <div
            className={
              informe.exito
                ? "border border-emerald-500/40 bg-emerald-500/10 rounded-md p-4"
                : "border border-red-500/40 bg-red-500/10 rounded-md p-4"
            }
          >
            <p
              className={
                informe.exito
                  ? "font-mono text-[13px] uppercase tracking-widest text-emerald-400"
                  : "font-mono text-[13px] uppercase tracking-widest text-red-400"
              }
            >
              {informe.exito ? "Veredicto: limpio" : "La casa sangra"}
            </p>
            <p className="mt-1.5 font-mono text-[11px] text-zinc-400">
              {informe.examinados} archivos examinados · {informe.nuevos.length}{" "}
              hallazgos nuevos · {informe.permitidos.length} permitidos (deudas
              declaradas) · entorno: {entorno}
            </p>
          </div>

          {/* catálogo vivo de familias (lo declara el propio script) */}
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber/70">
              Las familias vigiladas — catálogo vivo del script
            </p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {informe.familias.map((f) => (
                <div
                  key={f.id}
                  className="border border-zinc-800 bg-zinc-900/60 rounded-md p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-mono text-[11px] text-zinc-300 leading-snug">
                      {f.familia}
                    </p>
                    <span
                      className={`shrink-0 rounded-sm border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider ${chipSeveridad(f.severidad)}`}
                    >
                      {f.severidad}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[10px] text-zinc-600 leading-relaxed">
                    cura: {f.cura}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* hallazgos nuevos */}
          {informe.nuevos.length > 0 && (
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-red-400">
                Hallazgos nuevos — la casa sangra
              </p>
              <div className="mt-2 flex flex-col gap-2">
                {informe.nuevos.slice(0, 12).map((h, i) => (
                  <div
                    key={`${h.archivo}-${h.linea}-${i}`}
                    className="border border-red-500/30 bg-red-500/5 rounded-md p-3"
                  >
                    <p className="font-mono text-[11px] text-red-300">
                      [{h.severidad}] {h.archivo}:{h.linea} · {h.muestra}
                    </p>
                    <p className="mt-1 text-[10px] text-zinc-500 leading-relaxed">
                      {h.familia}
                    </p>
                    {h.lineaTexto && (
                      <p className="mt-1 font-mono text-[10px] text-zinc-600 break-all">
                        línea: {h.lineaTexto}
                      </p>
                    )}
                  </div>
                ))}
                {informe.nuevos.length > 12 && (
                  <p className="font-mono text-[10px] text-zinc-600">
                    … y {informe.nuevos.length - 12} más (informe completo: npm run escudo)
                  </p>
                )}
              </div>
            </div>
          )}

          {/* permitidos — deudas declaradas */}
          {informe.permitidos.length > 0 && (
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber-400">
                Permitidos — deudas declaradas
              </p>
              <div className="mt-2 flex flex-col gap-2">
                {informe.permitidos.slice(0, 12).map((h, i) => (
                  <div
                    key={`${h.archivo}-${h.linea}-${i}`}
                    className="border border-amber-500/30 bg-amber-500/5 rounded-md p-3"
                  >
                    <p className="font-mono text-[11px] text-amber-300">
                      [{h.severidad}] {h.archivo}:{h.linea} · {h.muestra}
                    </p>
                    {h.permiso && (
                      <p className="mt-1 text-[10px] text-zinc-500 leading-relaxed">
                        permiso: {h.permiso}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
