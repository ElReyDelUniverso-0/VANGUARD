// ============================================================
// v402.5 EL EJE DEL DÍA (components/vanguard/eje-del-dia.tsx)
//
// El defecto que esta pieza arregla, dicho con su número: al meter las
// efemérides del día en /historia (v402.4) la sala pasó de 1.117 a 1.305
// letras por elemento visual. La causa era simple y fea: diez hechos contados
// como diez párrafos. El pilar 2 del Dueño pide lo contrario —«más imágenes y
// menos bloques interminables de texto»— así que aquí los mismos diez hechos
// se dibujan donde de verdad significan algo: en un EJE DE TIEMPO.
//
// Qué hace con los datos: nada. No calcula, no resume, no reinterpreta. Recibe
// el año y el texto tal como los publica la fuente (Wikimedia, CC BY-SA 4.0) y
// coloca cada hecho en su lugar exacto entre el más antiguo y HOY. La línea
// que va de 565 a este año no está dibujada a mano: su escala sale del arco
// real de la fuente (guardia v234).
//
// Componente de SERVIDOR: cero JavaScript, cero hidratación. Cada hecho es un
// punto absoluto con su porcentaje calculado en el render; el navegador solo
// pinta. Debajo del eje queda el texto corto de cada hecho —la profundización
// sigue existiendo— y el punto lleva su aria-label completo para quien no ve
// el dibujo.
// ============================================================

export type HechoDelDia = {
  /** año declarado por la fuente; null si no lo declara */
  year: number | null;
  /** el texto tal como lo entrega la fuente */
  texto: string;
};

export interface EjeDelDiaProps {
  eventos: HechoDelDia[];
  titulo?: string;
  volanta?: string;
  /** qué se está midiendo, en una línea */
  nota?: string;
  acento?: string;
  /** id del título: permite dos ejes en la misma página sin pisarse */
  id?: string;
  /** recorte del texto de cada hecho (por defecto 92 caracteres) */
  recorte?: number;
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

export function EjeDelDia({
  eventos,
  titulo = "UN DÍA COMO HOY, EN UN EJE",
  volanta = "LA MEMORIA · EL EJE DEL DÍA",
  nota,
  acento = "#f59e0b",
  id = "eje-dia-titulo",
  recorte = 92,
}: EjeDelDiaProps) {
  const conAno = eventos.filter((e) => typeof e.year === "number" && Number.isFinite(e.year));
  if (conAno.length === 0) return null;

  const acc = /^#[0-9a-fA-F]{6}$/.test(acento) ? acento : "#f59e0b";
  const hoy = new Date().getUTCFullYear();
  const anos = conAno.map((e) => e.year as number);
  const inicio = Math.min(...anos, hoy);
  const fin = Math.max(...anos, hoy);
  const span = Math.max(fin - inicio, 1);
  const pos = (a: number) => clamp(((a - inicio) / span) * 100, 0, 100);

  // marcas del eje derivadas del arco real: inicio, hoy y pasos redondos dentro
  const paso = span > 1500 ? 500 : span > 600 ? 250 : span > 200 ? 100 : 50;
  const marcas = new Set<number>([inicio, hoy]);
  for (let a = Math.ceil(inicio / paso) * paso; a < fin; a += paso) marcas.add(a);
  const marcasOrden = [...marcas].sort((a, b) => a - b);

  // ordenados del más antiguo al más reciente, como se lee un eje
  const orden = conAno
    .slice()
    .sort((a, b) => (a.year as number) - (b.year as number));

  return (
    <section className="mx-auto max-w-5xl px-5 py-10" aria-labelledby={id}>
      <p className="font-mono text-[10px] uppercase tracking-[0.3em]" style={{ color: acc }}>
        {volanta}
      </p>
      <h2 id={id} className="mt-1 font-mono text-xl font-black uppercase tracking-tight text-white">
        {titulo}
      </h2>
      {nota ? (
        <p className="mt-2 max-w-3xl text-[13px] leading-relaxed text-slate-400">{nota}</p>
      ) : null}

      {/* ── el eje: cada hecho en su año, la escala sale de la fuente ── */}
      <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
        <div className="relative h-[74px]">
          {/* la línea del tiempo */}
          <div className="absolute left-0 right-0 top-[46px] h-px bg-slate-700" />
          {/* el extremo de hoy */}
          <div className="absolute right-0 top-[40px] h-3 w-px bg-slate-500" />
          <span className="absolute -top-1 right-0 -translate-x-1/2 whitespace-nowrap font-mono text-[9.5px] uppercase tracking-widest text-slate-400">
            hoy
          </span>

          {/* las marcas del eje */}
          {marcasOrden.map((m) => (
            <span
              key={`m-${m}`}
              className="absolute top-[46px] h-2 w-px bg-slate-800"
              style={{ left: `${pos(m)}%` }}
            />
          ))}

          {/* los hechos */}
          {orden.map((e, i) => (
            <div
              key={`e-${e.year}-${i}`}
              className="absolute top-0 -translate-x-1/2"
              style={{ left: `${pos(e.year as number)}%` }}
              title={`${e.year} — ${e.texto}`}
            >
              <span
                className="block whitespace-nowrap font-mono text-[10px] font-bold tabular-nums"
                style={{ color: acc }}
              >
                {e.year}
              </span>
              <span
                className="mx-auto mt-1 block h-[18px] w-px"
                style={{ backgroundColor: `${acc}99` }}
              />
              <span
                className="mx-auto block h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: acc }}
                role="img"
                aria-label={`${e.year}: ${e.texto}`}
              />
            </div>
          ))}
        </div>

        {/* las marcas de año, debajo de la línea */}
        <div className="relative mt-1 h-4">
          {marcasOrden.map((m) => (
            <span
              key={`l-${m}`}
              className="absolute -translate-x-1/2 whitespace-nowrap font-mono text-[9px] text-slate-500"
              style={{ left: `${pos(m)}%` }}
            >
              {m}
            </span>
          ))}
        </div>
      </div>

      {/* ── la profundización: el texto de cada hecho, corto, debajo ── */}
      <ol className="mt-3 grid gap-1.5 sm:grid-cols-2">
        {orden.map((e, i) => (
          <li
            key={`t-${e.year}-${i}`}
            className="flex gap-2 rounded border border-slate-800/70 bg-slate-950/40 px-2 py-1"
          >
            <span
              className="shrink-0 font-mono text-[11px] font-black tabular-nums"
              style={{ color: acc }}
            >
              {e.year}
            </span>
            <span className="min-w-0 text-[11.5px] leading-snug text-slate-400">
              {e.texto.length > recorte ? `${e.texto.slice(0, recorte).trimEnd()}…` : e.texto}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
