// ============================================================
// v402.2 EL GRÁFICO DE LÍNEAS (components/vanguard/grafico-lineas.tsx)
//
// El hermano del gráfico de barras: donde las barras comparan magnitudes,
// la línea muestra cómo CAMBIA algo a lo largo del tiempo. Aquí no se
// dibuja una tendencia inventada: se dibujan los puntos que la fuente
// tiene, uno por día, y el eje se escala contra el pico real de la serie.
//
// Tres reglas, las mismas de la casa:
//   1. El eje se calcula con el MÁXIMO de la serie (no con un techo redondo
//      que disimule el pico ni con un mínimo que lo exagere).
//   2. Los números se escriben: primer punto, pico y último punto llevan su
//      cifra. Una línea sin cifras es una opinión con curvas.
//   3. Componente de SERVIDOR: cero JavaScript, cero hidratación. El SVG se
//      calcula en el render y viaja ya dibujado.
// ============================================================

export type PuntoLinea = {
  /** etiqueta del eje X, ya formateada («14 nov») */
  etiqueta: string;
  valor: number;
  /** segunda línea opcional del punto («112 cables») */
  nota?: string;
};

export interface GraficoLineasProps {
  puntos: PuntoLinea[];
  titulo?: string;
  volanta?: string;
  /** qué mide la línea, en una frase */
  nota?: string;
  /** unidad para las cifras y los lectores de pantalla */
  unidad: string;
  acento?: string;
  /** alto del lienzo en unidades del viewBox (320 = bajo, 220 = normal) */
  alto?: number;
}

export function GraficoLineas({
  puntos,
  titulo = "LA SERIE EN EL TIEMPO",
  volanta = "EL ARCHIVO · GRÁFICO",
  nota,
  unidad,
  acento = "#22d3ee",
  alto = 220,
}: GraficoLineasProps) {
  if (puntos.length === 0) return null;
  const acc = /^#[0-9a-fA-F]{6}$/.test(acento) ? acento : "#22d3ee";

  const valores = puntos.map((p) => p.valor);
  const maximo = Math.max(...valores);
  const minimo = Math.min(...valores);
  const total = valores.reduce((a, b) => a + b, 0);
  const indicePico = valores.indexOf(maximo);

  // geometría: el lienzo deja aire arriba (para la cifra del pico) y abajo
  // (para las etiquetas del eje). Ancho fijo 720 → escala por CSS.
  const W = 720;
  const H = alto;
  const padX = 14;
  const padTop = 26;
  const padBottom = 22;
  const utilW = W - padX * 2;
  const utilH = H - padTop - padBottom;
  const paso = puntos.length > 1 ? utilW / (puntos.length - 1) : 0;
  const x = (i: number) => padX + (puntos.length > 1 ? i * paso : utilW / 2);
  const y = (v: number) => padTop + utilH - (maximo > 0 ? (v / maximo) * utilH : 0);

  const linea = puntos.map((p, i) => `${x(i).toFixed(1)},${y(p.valor).toFixed(1)}`).join(" ");
  const area = `${padX},${padTop + utilH} ${linea} ${(padX + utilW).toFixed(1)},${padTop + utilH}`;

  const cifra = (v: number) => `${v.toLocaleString("es")} ${unidad}`;
  const descripcion =
    `Serie de ${puntos.length} ${puntos.length === 1 ? "punto" : "puntos"}: ` +
    `máximo ${cifra(maximo)} el ${puntos[indicePico].etiqueta}, ` +
    `mínimo ${cifra(minimo)}, total ${cifra(total)}.`;

  return (
    <section className="mx-auto max-w-5xl px-5 py-10" aria-labelledby="grafico-linea-titulo">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.3em]" style={{ color: acc }}>
          {volanta}
        </p>
        <h2
          id="grafico-linea-titulo"
          className="mt-1 font-mono text-xl font-black uppercase tracking-tight text-white"
        >
          {titulo}
        </h2>
        {nota && <p className="mt-2 max-w-3xl text-[13px] leading-relaxed text-slate-400">{nota}</p>}
      </div>

      <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
        <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
            escala · el pico de la serie = {cifra(maximo)} ({puntos[indicePico].etiqueta})
          </p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
            total en el tramo · {cifra(total)}
          </p>
        </div>

        {maximo > 0 ? (
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="h-auto w-full"
            role="img"
            aria-label={descripcion}
            preserveAspectRatio="none"
          >
            {/* la rejilla: base, mitad y techo del pico — tres líneas, ninguna inventada */}
            {[0, 0.5, 1].map((f) => (
              <line
                key={f}
                x1={padX}
                x2={W - padX}
                y1={padTop + utilH - utilH * f}
                y2={padTop + utilH - utilH * f}
                stroke="#1e293b"
                strokeWidth={f === 0 ? 1.2 : 0.8}
                strokeDasharray={f === 0 ? undefined : "3 4"}
              />
            ))}

            {/* el área bajo la línea: da cuerpo sin tapar la rejilla */}
            <polygon points={area} fill={acc} opacity={0.12} />

            <polyline
              points={linea}
              fill="none"
              stroke={acc}
              strokeWidth={2.2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* los puntos: uno por día con dato, sin inventar los que faltan */}
            {puntos.map((p, i) => (
              <circle
                key={`${p.etiqueta}-${i}`}
                cx={x(i)}
                cy={y(p.valor)}
                r={i === indicePico ? 4 : 2.2}
                fill={i === indicePico ? "#ffffff" : acc}
                stroke={acc}
                strokeWidth={i === indicePico ? 2 : 0}
              />
            ))}

            {/* la cifra del pico, arriba y sin tapar la línea */}
            <text
              x={Math.min(Math.max(x(indicePico), padX + 18), W - padX - 18)}
              y={Math.max(y(maximo) - 9, 12)}
              textAnchor="middle"
              fill="#ffffff"
              fontSize="11"
              fontFamily="ui-monospace, monospace"
              fontWeight="700"
            >
              {maximo.toLocaleString("es")}
            </text>

            {/* eje X: primero, medio y último — el resto de días ya están en los puntos */}
            {[0, Math.floor((puntos.length - 1) / 2), puntos.length - 1]
              .filter((i, k, arr) => arr.indexOf(i) === k)
              .map((i) => (
                <text
                  key={`x-${i}`}
                  x={Math.min(Math.max(x(i), padX + 12), W - padX - 12)}
                  y={H - 6}
                  textAnchor={i === 0 ? "start" : i === puntos.length - 1 ? "end" : "middle"}
                  fill="#64748b"
                  fontSize="10"
                  fontFamily="ui-monospace, monospace"
                >
                  {puntos[i].etiqueta}
                </text>
              ))}
          </svg>
        ) : (
          <p className="py-6 text-center font-mono text-[11px] uppercase tracking-widest text-slate-500">
            la fuente no tiene ningún registro en este tramo: la línea no se dibuja para no fingir un cero
          </p>
        )}

        {/* la cifra del último día, siempre escrita: es la que el lector viene a buscar */}
        <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2 border-t border-slate-800 pt-2">
          <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
            mínimo del tramo · {cifra(minimo)}
          </p>
          <p className="font-mono text-[11px] text-slate-300">
            último punto · <span className="font-bold text-white">{puntos[puntos.length - 1].etiqueta}</span>{" "}
            · {cifra(puntos[puntos.length - 1].valor)}
          </p>
        </div>

        {puntos[indicePico].nota && (
          <p className="mt-1 font-mono text-[10px] text-slate-500">pico · {puntos[indicePico].nota}</p>
        )}
      </div>

      <p className="mt-2 text-[11px] leading-relaxed text-slate-600">
        Cada punto es un día con dato de la fuente; los días sin registro no se rellenan. El eje se escala contra el
        pico real de la serie: si la línea se aplana, es porque el dato se aplanó.
      </p>
    </section>
  );
}
