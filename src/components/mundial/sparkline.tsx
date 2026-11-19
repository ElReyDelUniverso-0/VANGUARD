// v416.0 · MINI-SERIE — la forma de la historia en 46 píxeles de alto
// Departamento 4 · VANGUARD WORLD DATA
// Para la ficha nacional: enseña la tendencia sin ocupar sitio y sin mentir con
// los huecos (se corta cuando falta un año).

export function Sparkline({
  puntos,
  color = "#f5c542",
  ancho = 300,
  alto = 46,
}: {
  puntos: { anio: number; valor: number }[];
  color?: string;
  ancho?: number;
  alto?: number;
}) {
  if (puntos.length < 2) return <p className="vx-md-meta">Serie demasiado corta para dibujar una tendencia ({puntos.length} {puntos.length === 1 ? "año" : "años"} con dato).</p>;
  const anios = puntos.map((p) => p.anio);
  const valores = puntos.map((p) => p.valor);
  const minA = Math.min(...anios);
  const maxA = Math.max(...anios);
  let min = Math.min(...valores);
  let max = Math.max(...valores);
  if (min === max) {
    min -= 1;
    max += 1;
  }
  const x = (a: number) => 3 + ((a - minA) / Math.max(1, maxA - minA)) * (ancho - 6);
  const y = (v: number) => alto - 4 - ((v - min) / (max - min)) * (alto - 8);
  const tramos: string[] = [];
  let actual: string[] = [];
  puntos.forEach((p, i) => {
    if (i > 0 && p.anio - puntos[i - 1].anio > 1) {
      if (actual.length) tramos.push(actual.join(" "));
      actual = [];
    }
    actual.push(`${x(p.anio)},${y(p.valor)}`);
  });
  if (actual.length) tramos.push(actual.join(" "));
  return (
    <svg viewBox={`0 0 ${ancho} ${alto}`} className="vx-md-spark" role="img" aria-label={`Tendencia entre ${minA} y ${maxA}`}>
      {tramos.map((t, i) => (
        <polyline key={i} points={t} fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      ))}
      <circle cx={x(puntos[puntos.length - 1].anio)} cy={y(puntos[puntos.length - 1].valor)} r={2.6} fill={color} />
      <text x={1} y={10} fill="#6f6b63" fontSize={9}>
        {minA}
      </text>
      <text x={ancho - 22} y={10} fill="#6f6b63" fontSize={9}>
        {maxA}
      </text>
    </svg>
  );
}
