"use client";

// ============================================================
// v367.1 EL OJO DEL DUEÑO — EL PANEL DE LA TORRE (client)
//
// El único componente de la casa que habla con /api/torre. Anota TRES
// sucesos reales que ningún salvavidas puede saber solo:
//   ① ARRANQUE — la casa montó en este aparato, con su tiempo hasta aquí
//      (por TRAMOS: el número exacto no viaja nunca).
//   ② HIDRATA — el hilo principal sigue vivo después del montaje. Ese par
//      arranque/hidrata es LA MÉTRICA de la cortina eterna: la tasa de
//      supervivencia real del aparato del Dueño.
//   ③ ERROR DE HILO / RECHAZO SIN DUEÑO — lo que el navegador cuenta
//      cuando algo se rompe (primero de cada tipo por sesión, no spam).
// Los cuatro botones del embudo están para el QA real: quien recorre la
// casa a mano (tap globo → tab → zona → sala) lo declara y la Torre mide
// dónde se cae la gente de verdad.
//
// Ley de la casa: la telemetría JAMÁS rompe la casa. Todo va en try/catch y
// `keepalive` para que un cierre de pestaña no pierda el último latido.
// ============================================================

import { useCallback, useEffect, useRef, useState } from "react";
import type { ResumenTorre } from "@/lib/torre";

const CLAVE_SESION = "vg-torre-sesion-v1";

type SenalPanel =
  | "arranque"
  | "hidrata"
  | "error-hilo"
  | "rechazo-promesa"
  | "paso-globo"
  | "paso-tab"
  | "paso-zona"
  | "paso-sala";

async function anotar(senal: SenalPanel, ms?: number): Promise<void> {
  try {
    await fetch("/api/torre", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ senal, ms }),
      keepalive: true,
    });
  } catch {
    /* la telemetría falla en silencio: la casa del visitante manda */
  }
}

const PASOS: { senal: SenalPanel; etiqueta: string }[] = [
  { senal: "paso-globo", etiqueta: "GLOBO" },
  { senal: "paso-tab", etiqueta: "TAB" },
  { senal: "paso-zona", etiqueta: "ZONA" },
  { senal: "paso-sala", etiqueta: "SALA" },
];

export function TorrePanel({ inicial }: { inicial: ResumenTorre }) {
  const [parte, setParte] = useState<ResumenTorre>(inicial);
  const [ms, setMs] = useState<number | null>(null);
  const [refrescando, setRefrescando] = useState(false);
  const yaAvisado = useRef<{ error: boolean; rechazo: boolean }>({ error: false, rechazo: false });

  // ①② El latido de arranque y la prueba de vida del hilo
  useEffect(() => {
    let msArranque: number | null = null;
    try {
      const nav = performance.getEntriesByType("navigation")[0] as
        | PerformanceNavigationTiming
        | undefined;
      msArranque = nav && nav.duration > 0 ? nav.duration : performance.now();
    } catch {
      msArranque = null;
    }
    const medido = typeof msArranque === "number" ? Math.round(msArranque) : null;
    setMs(medido);

    let yaContado = false;
    try {
      yaContado = sessionStorage.getItem(CLAVE_SESION) === "1";
    } catch {
      yaContado = false;
    }
    if (yaContado) return;
    try {
      sessionStorage.setItem(CLAVE_SESION, "1");
    } catch {
      /* sin almacenamiento: se cuenta igual, una vez por montaje */
    }
    void anotar("arranque", medido ?? undefined);
    void anotar("hidrata");
  }, []);

  // ③ Los dos avisos que el navegador regala (uno de cada por sesión)
  useEffect(() => {
    const alError = () => {
      if (yaAvisado.current.error) return;
      yaAvisado.current.error = true;
      void anotar("error-hilo");
    };
    const alRechazo = () => {
      if (yaAvisado.current.rechazo) return;
      yaAvisado.current.rechazo = true;
      void anotar("rechazo-promesa");
    };
    window.addEventListener("error", alError);
    window.addEventListener("unhandledrejection", alRechazo);
    return () => {
      window.removeEventListener("error", alError);
      window.removeEventListener("unhandledrejection", alRechazo);
    };
  }, []);

  const refrescar = useCallback(async () => {
    setRefrescando(true);
    try {
      const r = await fetch("/api/torre", { cache: "no-store" });
      const datos = (await r.json()) as ResumenTorre;
      if (datos && datos.version) setParte(datos);
    } catch {
      /* se queda el parte anterior: mejor viejo y verdadero que inventado */
    } finally {
      setRefrescando(false);
    }
  }, []);

  const pisar = useCallback(
    async (senal: SenalPanel) => {
      await anotar(senal);
      void refrescar();
    },
    [refrescar],
  );

  const sv = parte.supervivencia;
  const maxTramo = Math.max(1, ...parte.tramos.map((t) => t.total));

  return (
    <div className="flex flex-col gap-5">
      {/* ── LA MÉTRICA MADRE: ¿cuántas casas llegan vivas al final del montaje? ── */}
      <section className="rounded-md border border-amber-500/30 bg-amber-500/5 p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber-400">
          SUPERVIVENCIA DEL ARRANQUE · lo que ninguna ronda anterior podía ver
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Dato etiqueta="ARRANQUES" valor={sv.arranques} />
          <Dato etiqueta="HIDRATADAS" valor={sv.hidratadas} />
          <Dato etiqueta="ERRORES DE HILO" valor={sv.erroresHilo} alerta={sv.erroresHilo > 0} />
          <Dato
            etiqueta="TASA DE SUPERVIVENCIA"
            valor={sv.tasaHidratacion === null ? "—" : `${sv.tasaHidratacion}%`}
            alerta={sv.tasaHidratacion !== null && sv.tasaHidratacion < 90}
          />
        </div>
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">
          {sv.tasaHidratacion === null
            ? "Sin datos todavía: la Torre no inventa ceros."
            : sv.tasaHidratacion >= 98
              ? "La casa llega viva al final del montaje en casi todos los aparatos."
              : "Hay aparatos que arrancan y no hidratan: eso es exactamente la cortina eterna, medida por primera vez."}
        </p>
      </section>

      {/* ── LOS TRAMOS DE ARRANQUE ── */}
      <section className="rounded-md border border-zinc-800 bg-zinc-900/40 p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber/70">
          ARRANQUE REAL · tramos medidos en el aparato (nunca el número exacto)
        </p>
        <ul className="mt-3 flex flex-col gap-1.5">
          {parte.tramos.map((t) => (
            <li key={t.clave} className="flex items-center gap-2">
              <span className="w-20 shrink-0 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                {t.clave}
              </span>
              <span className="h-2 flex-1 overflow-hidden rounded-sm bg-zinc-800">
                <span
                  className="block h-full bg-amber-hud"
                  style={{ width: `${Math.round((t.total / maxTramo) * 100)}%` }}
                />
              </span>
              <span className="w-14 shrink-0 text-right font-mono text-[10px] text-zinc-400">
                {t.total}
              </span>
            </li>
          ))}
        </ul>
        {ms !== null ? (
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">
            ESTE APARATO · {ms} ms hasta el montaje (solo el tramo viajó al servidor)
          </p>
        ) : null}
      </section>

      {/* ── EL EMBUDO: dónde se cae la gente de verdad ── */}
      <section className="rounded-md border border-zinc-800 bg-zinc-900/40 p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber/70">
          EL EMBUDO DEL CAMINO REAL · tap globo → tab → zona → sala
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {PASOS.map((p) => {
            const fila = parte.embudo.find((e) => e.clave === p.senal);
            return (
              <button
                key={p.senal}
                type="button"
                onClick={() => void pisar(p.senal)}
                className="inline-flex items-center gap-2 rounded-sm border border-zinc-700 bg-zinc-900 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-zinc-300 transition-colors hover:border-amber-hud hover:text-amber"
                title="Declara que pisaste este escalón (QA real en el aparato)"
              >
                {p.etiqueta}
                <span className="text-amber">{fila?.total ?? 0}</span>
                <span className="text-zinc-600">/ hoy {fila?.hoy ?? 0}</span>
              </button>
            );
          })}
        </div>
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">
          Un escalón con menos pasos que el anterior es un bug del camino, no una opinión.
        </p>
      </section>

      {/* ── LOS CINCO SALVAVIDAS ── */}
      <section className="rounded-md border border-zinc-800 bg-zinc-900/40 p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber/70">
          LOS CINCO SALVAVIDAS · ¿alguno ha actuado de verdad?
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {parte.salvavidas.map((s) => (
            <div
              key={s.senal}
              className="rounded-sm border border-zinc-800 bg-zinc-950/60 px-3 py-2"
            >
              <p className="font-mono text-[11px] uppercase tracking-widest text-zinc-200">
                {s.nombre}
              </p>
              <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-zinc-600">
                {s.origen}
              </p>
              <p className="mt-1 font-mono text-lg text-amber">
                {s.total}
                <span className="ml-2 text-[10px] uppercase text-zinc-500">hoy {s.hoy}</span>
              </p>
            </div>
          ))}
        </div>
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">
          Un cero aquí no es un fracaso: es un salvavidas que aún no ha tenido que salvar a
          nadie. La lib exporta `anotarSenal()` para conectarlos en su próxima ronda.
        </p>
      </section>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => void refrescar()}
          disabled={refrescando}
          className="rounded-sm border border-amber-500/40 bg-amber-500/10 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-amber-300 transition-colors hover:bg-amber-500/20 disabled:opacity-40"
        >
          {refrescando ? "LEYENDO…" : "ACTUALIZAR LA TORRE"}
        </button>
        <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-zinc-600">
          leído {parte.consultadoEn}
        </span>
      </div>
    </div>
  );
}

function Dato({
  etiqueta,
  valor,
  alerta = false,
}: {
  etiqueta: string;
  valor: number | string;
  alerta?: boolean;
}) {
  return (
    <div>
      <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-500">{etiqueta}</p>
      <p className={`font-mono text-xl ${alerta ? "text-red-400" : "text-zinc-100"}`}>{valor}</p>
    </div>
  );
}
