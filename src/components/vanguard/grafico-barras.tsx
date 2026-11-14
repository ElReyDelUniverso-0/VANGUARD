// ============================================================
// v401.3 EL GRÁFICO DE BARRAS (components/vanguard/grafico-barras.tsx)
//
// El Dueño lo pidió así: «gráficos». Aquí hay uno que no miente: cada barra
// se mide contra el valor MAYOR de su propia serie, no contra un máximo
// inventado. Si el mayor son 75.000.000 de muertos, ese es el 100 % del
// ancho y el resto se dibuja en proporción real — 2.500.000 se ve pequeño
// porque es pequeño.
//
// Componente de SERVIDOR: cero JavaScript, cero hidratación. Las barras son
// dos `<div>` con un porcentaje calculado en el render. El número va SIEMPRE
// escrito al lado de la barra (accesibilidad y honestidad: una barra sin
// cifra es una opinión dibujada).
// ============================================================

export type BarraGrafico = {
  etiqueta: string;
  valor: number;
  /** la cifra ya formateada tal como la quiere leer la sala */
  texto?: string;
  /** segunda línea: tasa, nota o año de la fuente */
  nota?: string;
  color?: string;
  /** enlace opcional a la ficha de donde sale el dato */
  href?: string;
};

export interface GraficoBarrasProps {
  barras: BarraGrafico[];
  titulo?: string;
  volanta?: string;
  /** qué mide el eje, en una línea */
  nota?: string;
  /** unidad para los lectores de pantalla («muertes», «millones»…) */
  unidad: string;
  acento?: string;
  /** etiqueta del máximo de la serie (por defecto, «= la mayor de la serie») */
  etiquetaMaximo?: string;
}

export function GraficoBarras({
  barras,
  titulo = "LAS CIFRAS EN UNA ESCALA",
  volanta = "EL ARCHIVO · GRÁFICO",
  nota,
  unidad,
  acento = "#ef4444",
  etiquetaMaximo = "la mayor de la serie",
}: GraficoBarrasProps) {
  if (barras.length === 0) return null;
  const maximo = Math.max(...barras.map((b) => b.valor));
  const acc = /^#[0-9a-fA-F]{6}$/.test(acento) ? acento : "#ef4444";

  return (
    <section className="mx-auto max-w-5xl px-5 py-10" aria-labelledby="grafico-titulo">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.3em]" style={{ color: acc }}>
          {volanta}
        </p>
        <h2 id="grafico-titulo" className="mt-1 font-mono text-xl font-black uppercase tracking-tight text-white">
          {titulo}
        </h2>
        {nota && <p className="mt-2 max-w-3xl text-[13px] leading-relaxed text-slate-400">{nota}</p>}
      </div>

      {/* la escala: solo el máximo, porque es el único que se puede afirmar sin inventar */}
      <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
        <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-slate-500">
          escala · la barra más larga = {maximo.toLocaleString("es")} {unidad} ({etiquetaMaximo})
        </p>
        <ul className="space-y-3">
          {barras.map((b) => {
            const pct = maximo > 0 ? Math.max((b.valor / maximo) * 100, 0.8) : 0.8;
            const color = b.color && /^#[0-9a-fA-F]{6}$/.test(b.color) ? b.color : acc;
            const cifra = b.texto ?? `${b.valor.toLocaleString("es")} ${unidad}`;
            const contenido = (
              <>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="truncate font-mono text-[11.5px] text-slate-300">{b.etiqueta}</span>
                  <span className="shrink-0 font-mono text-[11.5px] font-bold text-white">{cifra}</span>
                </div>
                <div
                  className="mt-1 h-4 rounded-sm bg-slate-900"
                  role="img"
                  aria-label={`${b.etiqueta}: ${cifra} (${Math.round(pct)}% de la mayor de la serie)`}
                >
                  <div className="h-4 rounded-sm" style={{ width: `${pct}%`, backgroundColor: color }} />
                </div>
                {b.nota && <div className="mt-0.5 font-mono text-[10px] text-slate-500">{b.nota}</div>}
              </>
            );
            return (
              <li key={b.etiqueta}>
                {b.href ? (
                  <a href={b.href} className="block rounded transition hover:brightness-110">
                    {contenido}
                  </a>
                ) : (
                  contenido
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <p className="mt-2 text-[11px] leading-relaxed text-slate-600">
        Cada barra se mide contra la mayor de su serie, no contra un techo inventado: si una cifra se ve pequeña, es
        porque es pequeña. Los números salen de la fuente de la sala y se formatean en el render.
      </p>
    </section>
  );
}
