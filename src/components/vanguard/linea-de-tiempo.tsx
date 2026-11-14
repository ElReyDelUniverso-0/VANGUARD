// ============================================================
// v401.2 LA LÍNEA DE TIEMPO (components/vanguard/linea-de-tiempo.tsx)
//
// Pilar 2, tercera tanda. El Dueño lo pidió con estas palabras: «gráficos,
// líneas de tiempo, resúmenes visuales». Hasta hoy la casa contaba la
// historia con párrafos y tablas; aquí se VE.
//
// LO QUE ESTE COMPONENTE HACE CON LOS DATOS: nada. No calcula, no resume, no
// reinterpreta: recibe tramos con su año de inicio y de fin —tal como los
// declara la fuente— y los dibuja en un eje proporcional al tiempo real. Un
// tramo de 118 años ocupa lo que debe ocupar frente a uno de 6. El eje se
// escala con los datos, no con una tabla escrita a mano (guardia v234).
//
// Componente de SERVIDOR: cero JavaScript, cero hidratación. Las barras se
// colocan con dos porcentajes calculados en el render; el navegador solo
// pinta. Lleva su leyenda por era, su escala de siglos y un enlace por tramo
// a la ficha completa — el texto largo sigue existiendo más abajo, como
// profundización opcional.
// ============================================================

export type TramoTiempo = {
  /** id real del tramo (el mismo ancla de su ficha) */
  id: string;
  nombre: string;
  /** año de inicio: negativo = antes de Cristo */
  desde: number;
  /** año de fin */
  hasta: number;
  /** familia del tramo: era, categoría, lo que la fuente declare */
  era: string;
  /** una línea opcional de contexto (ya escrita por la fuente) */
  nota?: string;
};

export interface LineaDeTiempoProps {
  tramos: TramoTiempo[];
  /** color por familia */
  paleta: Record<string, string>;
  /** nombre legible por familia */
  nombres?: Record<string, string>;
  titulo?: string;
  volanta?: string;
  /** qué se está midiendo, en una línea */
  nota?: string;
  /** el año más antiguo y el más reciente SI la fuente los tiene; si no, se derivan */
  desde?: number;
  hasta?: number;
  acento?: string;
}

/** el año compuesto honesto: el negativo es antes de Cristo */
function ano(n: number): string {
  return n < 0 ? `${-n} a. C.` : `${n}`;
}

export function LineaDeTiempo({
  tramos,
  paleta,
  nombres = {},
  titulo = "LA LÍNEA DEL TIEMPO",
  volanta = "EL ARCHIVO, EN UN EJE",
  nota,
  desde,
  hasta,
  acento = "#f59e0b",
}: LineaDeTiempoProps) {
  if (tramos.length === 0) return null;
  const inicio = desde ?? Math.min(...tramos.map((t) => t.desde));
  const fin = hasta ?? Math.max(...tramos.map((t) => t.hasta));
  const span = Math.max(fin - inicio, 1);
  const pos = (a: number) => ((a - inicio) / span) * 100;

  // las décadas/siglos del eje: se derivan del arco real, no se escriben a mano
  const paso = span > 2000 ? 500 : span > 800 ? 200 : span > 300 ? 100 : 50;
  // las marcas del eje, con los DOS extremos incluidos: si el arco empieza en
  // 264 a. C. y la primera marca redonda cae en 0, el primer tramo se quedaría
  // sin referencia. Los extremos se pintan siempre.
  const marcas: number[] = [inicio];
  for (let a = Math.ceil(inicio / paso) * paso; a < fin; a += paso) if (a > inicio) marcas.push(a);
  marcas.push(fin);

  const eras = [...new Set(tramos.map((t) => t.era))];
  const acc = /^#[0-9a-fA-F]{6}$/.test(acento) ? acento : "#f59e0b";

  return (
    <section className="mx-auto max-w-5xl px-5 py-10" aria-labelledby="linea-tiempo-titulo">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em]" style={{ color: acc }}>
            {volanta}
          </p>
          <h2 id="linea-tiempo-titulo" className="mt-1 font-mono text-xl font-black uppercase tracking-tight text-white">
            {titulo}
          </h2>
        </div>
        <p className="font-mono text-[11px] uppercase tracking-widest text-slate-500">
          {ano(inicio)} → {ano(fin)}
        </p>
      </div>

      {nota && <p className="mt-2 max-w-3xl text-[13px] leading-relaxed text-slate-400">{nota}</p>}

      {/* leyenda por familia — derivada de los propios tramos */}
      <div className="mt-4 flex flex-wrap gap-2">
        {eras.map((e) => (
          <span
            key={e}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-slate-400"
          >
            <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: paleta[e] ?? acc }} />
            {nombres[e] ?? e}
          </span>
        ))}
      </div>

      {/* el eje y los tramos */}
      <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
        {/* la escala */}
        <div className="relative mb-4 h-5 border-b border-slate-800">
          {marcas.map((m) => (
            <span
              key={m}
              className="absolute -translate-x-1/2 font-mono text-[9.5px] text-slate-600"
              style={{ left: `${pos(m)}%` }}
            >
              {ano(m)}
            </span>
          ))}
        </div>

        <ol className="space-y-2">
          {tramos.map((t) => {
            const izq = pos(Math.min(t.desde, t.hasta));
            const ancho = Math.max(pos(Math.max(t.desde, t.hasta)) - izq, 0.6);
            const color = paleta[t.era] ?? acc;
            return (
              <li key={t.id} className="group relative grid grid-cols-[minmax(0,9.5rem)_1fr] items-center gap-3 sm:grid-cols-[minmax(0,13rem)_1fr]">
                <a
                  href={`#${t.id}`}
                  className="truncate font-mono text-[11px] text-slate-300 underline-offset-2 hover:text-white hover:underline"
                  title={t.nota ?? t.nombre}
                >
                  {t.nombre}
                </a>
                <div className="relative h-5 rounded bg-slate-900/80">
                  <a
                    href={`#${t.id}`}
                    aria-label={`${t.nombre}: ${ano(t.desde)} a ${ano(t.hasta)}`}
                    className="absolute top-0 flex h-5 items-center justify-center rounded text-[9.5px] font-bold text-black/80 transition group-hover:brightness-110"
                    style={{ left: `${izq}%`, width: `${ancho}%`, backgroundColor: color }}
                    title={`${ano(t.desde)} → ${ano(t.hasta)}`}
                  >
                    <span className="hidden truncate px-1 sm:inline">{ano(t.desde)}–{ano(t.hasta)}</span>
                  </a>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <p className="mt-2 text-[11px] leading-relaxed text-slate-600">
        Cada barra ocupa el tiempo que duró de verdad: la escala se calcula con los años de la fuente, no con una tabla
        dibujada a mano. Un toque en cualquier barra lleva a su ficha completa.
      </p>
    </section>
  );
}
