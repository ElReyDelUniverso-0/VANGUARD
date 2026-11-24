// ═══════════════════════════════════════════════════════════════════
// v444.0 · EL MUNDO MUERTO — mapa de rutas documentadas (server, SVG)
// Fondo: /abandonados/mundo.svg (Natural Earth 110m, equirectangular
// 1000×500). Encima, un arco por ruta documentada en su fuente.
// ═══════════════════════════════════════════════════════════════════
import { proyectarMM, type Ruta } from "@/lib/mundo-muerto/modulos";

export function MapaRutas({ rutas, color, titulo }: { rutas: Ruta[]; color: string; titulo: string }) {
  const pts = rutas.flatMap((r) => [proyectarMM(r.de[0], r.de[1]), proyectarMM(r.a[0], r.a[1])]);
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  const pad = 40;
  let x0 = Math.max(0, Math.min(...xs) - pad);
  let x1 = Math.min(1000, Math.max(...xs) + pad);
  let y0 = Math.max(0, Math.min(...ys) - pad * 1.4);
  let y1 = Math.min(500, Math.max(...ys) + pad);
  // proporción mínima 2:1 para que no quede una tira
  const w = x1 - x0;
  const h = y1 - y0;
  if (w < h * 2) {
    const falta = h * 2 - w;
    x0 = Math.max(0, x0 - falta / 2);
    x1 = Math.min(1000, x1 + falta / 2);
  } else if (h < w / 2.6) {
    const falta = w / 2.6 - h;
    y0 = Math.max(0, y0 - falta / 2);
    y1 = Math.min(500, y1 + falta / 2);
  }
  const extremos = new Map<string, { x: number; y: number }>();
  return (
    <figure className="mm-mapa" style={{ margin: 0 }}>
      <svg viewBox={`${x0.toFixed(1)} ${y0.toFixed(1)} ${(x1 - x0).toFixed(1)} ${(y1 - y0).toFixed(1)}`} role="img" aria-label={titulo}>
        <image href="/abandonados/mundo.svg" x="0" y="0" width="1000" height="500" preserveAspectRatio="none" />
        {rutas.map((r, i) => {
          const a = proyectarMM(r.de[0], r.de[1]);
          const b = proyectarMM(r.a[0], r.a[1]);
          extremos.set(`${a.x},${a.y}`, a);
          extremos.set(`${b.x},${b.y}`, b);
          const mx = (a.x + b.x) / 2;
          const my = (a.y + b.y) / 2;
          const len = Math.hypot(b.x - a.x, b.y - a.y);
          const cy = my - Math.max(6, len * 0.28);
          return (
            <path key={i} className="mm-arco" d={`M${a.x.toFixed(1)},${a.y.toFixed(1)} Q${mx.toFixed(1)},${cy.toFixed(1)} ${b.x.toFixed(1)},${b.y.toFixed(1)}`} stroke={color}>
              <title>{r.etiqueta}</title>
            </path>
          );
        })}
        {[...extremos.values()].map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={2.6} fill={color} stroke="#000" strokeWidth={0.8} />
        ))}
      </svg>
    </figure>
  );
}
