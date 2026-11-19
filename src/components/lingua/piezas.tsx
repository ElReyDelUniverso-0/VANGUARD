// ═══════════════════════════════════════════════════════════════════
// v420.0 VANGUARD LINGUA — piezas de servidor (cero JS en el cliente).
// ═══════════════════════════════════════════════════════════════════
import Link from "next/link";
import type { ReactNode } from "react";
import { geoMercator } from "d3-geo";
import { PROYECCION_MUNDO } from "@/lib/creadores/tipos";
import { AES_ES, AES_SIN_DATO, RUTAS_LINGUA, formatoNumero } from "@/lib/lingua/tipos";

export const SECCIONES_LINGUA: { href: string; label: string }[] = [
  { href: RUTAS_LINGUA.inicio, label: "Inicio" },
  { href: RUTAS_LINGUA.idiomas, label: "Catálogo" },
  { href: RUTAS_LINGUA.familias, label: "Árbol de familias" },
  { href: RUTAS_LINGUA.mapa, label: "Mapa" },
  { href: RUTAS_LINGUA.regiones, label: "Regiones" },
  { href: RUTAS_LINGUA.peligro, label: "En peligro" },
  { href: RUTAS_LINGUA.escrituras, label: "Escrituras" },
  { href: RUTAS_LINGUA.alfabetos, label: "Alfabetos" },
  { href: RUTAS_LINGUA.diccionario, label: "Diccionario" },
  { href: RUTAS_LINGUA.comparador, label: "Comparador" },
  { href: RUTAS_LINGUA.expresiones, label: "Expresiones" },
  { href: RUTAS_LINGUA.pronunciacion, label: "Pronunciación" },
  { href: RUTAS_LINGUA.traductor, label: "Traductor" },
  { href: RUTAS_LINGUA.conceptos, label: "Lengua, dialecto, variedad" },
];

export function NavLingua({ activo }: { activo: string }) {
  return (
    <nav className="vx-li-nav" aria-label="Secciones de Lingua">
      {SECCIONES_LINGUA.map((s) => (
        <Link key={s.href} href={s.href} aria-current={activo === s.href ? "page" : undefined}>
          {s.label}
        </Link>
      ))}
    </nav>
  );
}

export function Migas({ pasos }: { pasos: { href?: string; label: string }[] }) {
  return (
    <nav className="vx-li-migas" aria-label="Ruta">
      {pasos.map((p, i) => (
        <span key={i}>
          {p.href ? <Link href={p.href}>{p.label}</Link> : <span aria-current="page">{p.label}</span>}
          {i < pasos.length - 1 ? " ›" : ""}
        </span>
      ))}
    </nav>
  );
}

export type TipoInsignia = "lengua" | "familia" | "dialecto" | "variedad" | "escritura" | "pseudo";
const TEXTO_INSIGNIA: Record<TipoInsignia, string> = {
  lengua: "Lengua",
  familia: "Familia",
  dialecto: "Dialecto",
  variedad: "Variedad",
  escritura: "Escritura",
  pseudo: "Agrupación",
};
export function Insignia({ tipo, texto }: { tipo: TipoInsignia; texto?: string }) {
  return <span className={`vx-li-insignia ${tipo}`}>{texto ?? TEXTO_INSIGNIA[tipo]}</span>;
}

export function Cifras({ items }: { items: { valor: ReactNode; label: string }[] }) {
  return (
    <div className="vx-li-cifras">
      {items.map((c) => (
        <div key={c.label}>
          <b>{c.valor}</b>
          <span>{c.label}</span>
        </div>
      ))}
    </div>
  );
}

export function PuntoAes({ aes }: { aes: number }) {
  const a = AES_ES[aes];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span className="vx-li-punto" style={{ background: a?.color ?? AES_SIN_DATO.color }} aria-hidden />
      {a?.nombre ?? AES_SIN_DATO.nombre}
    </span>
  );
}

/** barra apilada del estado de amenaza */
export function BarraAes({ aes, sinAes, enlaces }: { aes: number[]; sinAes: number; enlaces?: (i: number) => string }) {
  const total = aes.reduce((s, x) => s + x, 0) + sinAes;
  if (!total) return null;
  return (
    <div>
      <div className="vx-li-barra" role="img" aria-label="Distribución por estado de amenaza">
        {aes.map((n, i) => (n ? <span key={i} style={{ width: `${(n / total) * 100}%`, background: AES_ES[i].color }} title={`${AES_ES[i].nombre}: ${n}`} /> : null))}
        {sinAes ? <span style={{ width: `${(sinAes / total) * 100}%`, background: AES_SIN_DATO.color }} title={`${AES_SIN_DATO.nombre}: ${sinAes}`} /> : null}
      </div>
      <ul className="vx-li-leyenda">
        {aes.map((n, i) =>
          n ? (
            <li key={i}>
              <span className="vx-li-punto" style={{ background: AES_ES[i].color }} aria-hidden />
              {enlaces ? <Link href={enlaces(i)}>{AES_ES[i].nombre}</Link> : AES_ES[i].nombre}: <b>{formatoNumero(n)}</b>
            </li>
          ) : null,
        )}
        {sinAes ? (
          <li>
            <span className="vx-li-punto" style={{ background: AES_SIN_DATO.color }} aria-hidden />
            {AES_SIN_DATO.nombre}: <b>{formatoNumero(sinAes)}</b>
          </li>
        ) : null}
      </ul>
    </div>
  );
}

const PROY = geoMercator()
  .rotate(PROYECCION_MUNDO.rotate)
  .center(PROYECCION_MUNDO.center)
  .scale(PROYECCION_MUNDO.scale)
  .translate(PROYECCION_MUNDO.translate);

export interface PuntoMapa {
  lat: number;
  lon: number;
  color?: string;
  titulo?: string;
  href?: string;
  /** resaltado (más grande y con etiqueta) */
  foco?: boolean;
}

/** mapa SVG del mundo con puntos (misma proyección que /mapa-mundo.svg) */
export function MapaPuntos({ puntos, etiqueta, encuadre = true }: { puntos: PuntoMapa[]; etiqueta: string; encuadre?: boolean }) {
  const xy = puntos.map((p) => PROY([p.lon, p.lat]) ?? [500, 250]);
  let x0 = 0;
  let y0 = 0;
  let vw = 1000;
  let vh = 500;
  if (encuadre && xy.length) {
    const xs = xy.map((q) => q[0]);
    const ys = xy.map((q) => q[1]);
    vw = Math.max(160, (Math.max(...xs) - Math.min(...xs)) * 1.3 + 60);
    vh = Math.max(80, (Math.max(...ys) - Math.min(...ys)) * 1.3 + 60);
    if (vw / vh > 2) vh = vw / 2;
    else vw = vh * 2;
    vw = Math.min(1000, vw);
    vh = Math.min(500, vh);
    const cx = (Math.max(...xs) + Math.min(...xs)) / 2;
    const cy = (Math.max(...ys) + Math.min(...ys)) / 2;
    x0 = Math.max(0, Math.min(1000 - vw, cx - vw / 2));
    y0 = Math.max(0, Math.min(500 - vh, cy - vh / 2));
  }
  const k = vw / 1000;
  return (
    <svg className="vx-li-mapa" viewBox={`${x0.toFixed(1)} ${y0.toFixed(1)} ${vw.toFixed(1)} ${vh.toFixed(1)}`} role="img" aria-label={etiqueta}>
      <rect x={0} y={0} width={1000} height={500} fill="#0e1320" />
      <image href="/mapa-mundo.svg" x="0" y="0" width={1000} height={500} opacity={0.75} />
      {xy.map(([x, y], i) => {
        const p = puntos[i];
        const r = (p.foco ? 7 : 3.2) * Math.max(k, 0.18);
        const c = (
          <circle cx={x.toFixed(1)} cy={y.toFixed(1)} r={r.toFixed(2)} fill={p.color ?? "#5eead4"} fillOpacity={p.foco ? 1 : 0.85} stroke="#05060b" strokeWidth={(0.8 * Math.max(k, 0.18)).toFixed(2)}>
            {p.titulo ? <title>{p.titulo}</title> : null}
          </circle>
        );
        return p.href ? (
          <a key={i} href={p.href}>
            {c}
          </a>
        ) : (
          <g key={i}>{c}</g>
        );
      })}
    </svg>
  );
}

export function Fuentes({ items }: { items: { titulo: string; url: string; nota?: string }[] }) {
  return (
    <ol className="vx-li-fuentes">
      {items.map((f) => (
        <li key={f.url + f.titulo}>
          <a href={f.url} target="_blank" rel="noopener noreferrer">
            {f.titulo}
          </a>
          {f.nota ? ` · ${f.nota}` : ""}
        </li>
      ))}
    </ol>
  );
}

export function Paginas({ total, pagina, porPagina, base }: { total: number; pagina: number; porPagina: number; base: (p: number) => string }) {
  const paginas = Math.max(1, Math.ceil(total / porPagina));
  if (paginas <= 1) return null;
  const ventana = [1, pagina - 2, pagina - 1, pagina, pagina + 1, pagina + 2, paginas].filter((p, i, a) => p >= 1 && p <= paginas && a.indexOf(p) === i).sort((a, b) => a - b);
  return (
    <nav className="vx-li-paginas" aria-label="Páginas">
      {pagina > 1 ? <Link href={base(pagina - 1)}>← Anterior</Link> : null}
      {ventana.map((p, i) => (
        <span key={p}>
          {i > 0 && p - ventana[i - 1] > 1 ? "… " : ""}
          {p === pagina ? <b>{p}</b> : <Link href={base(p)}>{p}</Link>}
        </span>
      ))}
      {pagina < paginas ? <Link href={base(pagina + 1)}>Siguiente →</Link> : null}
      <span>
        · {formatoNumero(total)} resultados
      </span>
    </nav>
  );
}

/** bandera emoji a partir del ISO-2 (sin imágenes externas) */
export function bandera(iso2: string): string {
  if (!/^[A-Za-z]{2}$/.test(iso2)) return "";
  return String.fromCodePoint(...iso2.toUpperCase().split("").map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}
