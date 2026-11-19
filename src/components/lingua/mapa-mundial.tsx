"use client";
// ═══════════════════════════════════════════════════════════════════
// v420.0 VANGUARD LINGUA — mapa mundial de lenguas (canvas).
// ~8.000 puntos de Glottolog leídos de /idiomas/puntos.json (estático,
// cacheable) y dibujados con la misma proyección que /mapa-mundo.svg.
// ═══════════════════════════════════════════════════════════════════
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { geoMercator } from "d3-geo";
import { PROYECCION_MUNDO } from "@/lib/creadores/tipos";
import { AES_ES, AES_SIN_DATO, rutaFamilia, rutaIdioma } from "@/lib/lingua/tipos";

interface Datos {
  fuente: string;
  familias: [string, string][];
  /** [id, nombre, lat, lon, familiaIdx, aes, categoria] */
  p: [string, string, number, number, number, number, number][];
}

const PROY = geoMercator()
  .rotate(PROYECCION_MUNDO.rotate)
  .center(PROYECCION_MUNDO.center)
  .scale(PROYECCION_MUNDO.scale)
  .translate(PROYECCION_MUNDO.translate);

const PALETA = ["#5eead4", "#f472b6", "#facc15", "#60a5fa", "#fb923c", "#a78bfa", "#4ade80", "#f87171", "#22d3ee", "#e8c56a", "#c084fc", "#94a3b8"];

const VISTAS: { id: string; nombre: string; caja: [number, number, number, number] }[] = [
  { id: "mundo", nombre: "Mundo", caja: [-180, -58, 180, 80] },
  { id: "america", nombre: "América", caja: [-130, -56, -30, 60] },
  { id: "caribe", nombre: "Caribe y Centroamérica", caja: [-94, 7, -59, 27] },
  { id: "africa", nombre: "África", caja: [-20, -36, 53, 38] },
  { id: "europa", nombre: "Europa y Oriente Próximo", caja: [-12, 28, 60, 66] },
  { id: "asia", nombre: "Asia", caja: [60, -10, 150, 55] },
  { id: "papunesia", nombre: "Nueva Guinea y Pacífico", caja: [110, -25, 180, 10] },
  { id: "australia", nombre: "Australia", caja: [110, -45, 157, -9] },
];

function cajaVista(v: (typeof VISTAS)[number]): { x0: number; y0: number; w: number; h: number } {
  // La proyección está girada 10° (rotate [-10, 0]): el antimeridiano del mapa
  // cae en 170° O, así que −180° saltaría al borde derecho. El mundo entero es
  // simplemente el lienzo completo de /mapa-mundo.svg (1000 × 500).
  if (v.id === "mundo") return { x0: 0, y0: 0, w: 1000, h: 500 };
  const [lo0, la0, lo1, la1] = v.caja;
  const a = PROY([lo0, la1]) ?? [0, 0];
  const b = PROY([lo1, la0]) ?? [1000, 500];
  let w = b[0] - a[0];
  let h = b[1] - a[1];
  if (w / h > 2) h = w / 2;
  else w = h * 2;
  const cx = (a[0] + b[0]) / 2;
  const cy = (a[1] + b[1]) / 2;
  return { x0: cx - w / 2, y0: cy - h / 2, w, h };
}

export function MapaMundialLenguas({ nombresEs = {} }: { nombresEs?: Record<string, string> }) {
  const [datos, setDatos] = useState<Datos | null>(null);
  const [error, setError] = useState(false);
  const [modo, setModo] = useState<"familia" | "amenaza">("familia");
  const [familia, setFamilia] = useState(-2);
  const [aesFiltro, setAesFiltro] = useState(-2);
  const [vista, setVista] = useState("mundo");
  const [sel, setSel] = useState<number | null>(null);
  const [ancho, setAncho] = useState(960);
  const lienzo = useRef<HTMLCanvasElement>(null);
  const fondo = useRef<HTMLImageElement | null>(null);
  const [fondoListo, setFondoListo] = useState(false);

  useEffect(() => {
    let vivo = true;
    fetch("/idiomas/puntos.json")
      .then((r) => (r.ok ? (r.json() as Promise<Datos>) : Promise.reject(new Error(String(r.status)))))
      .then((d) => {
        if (vivo) setDatos(d);
      })
      .catch(() => {
        if (vivo) setError(true);
      });
    const img = new Image();
    img.onload = () => {
      fondo.current = img;
      if (vivo) setFondoListo(true);
    };
    img.src = "/mapa-mundo.svg";
    return () => {
      vivo = false;
    };
  }, []);

  useEffect(() => {
    const c = lienzo.current;
    if (!c) return;
    const ro = new ResizeObserver((e) => {
      const w = Math.round(e[0]?.contentRect.width ?? 960);
      if (w > 0) setAncho(w);
    });
    ro.observe(c);
    return () => ro.disconnect();
  }, []);

  const xy = useMemo(() => (datos ? datos.p.map((p) => PROY([p[3], p[2]]) ?? [-99, -99]) : []), [datos]);
  const caja = useMemo(() => cajaVista(VISTAS.find((v) => v.id === vista) ?? VISTAS[0]), [vista]);
  const visible = (i: number) => {
    if (!datos) return false;
    const p = datos.p[i];
    if (familia !== -2 && p[4] !== familia) return false;
    if (aesFiltro !== -2 && p[5] !== aesFiltro) return false;
    return true;
  };
  const color = (i: number) => {
    const p = datos!.p[i];
    if (modo === "amenaza") return AES_ES[p[5]]?.color ?? AES_SIN_DATO.color;
    return p[4] >= 0 && p[4] < PALETA.length - 1 ? PALETA[p[4]] : PALETA[PALETA.length - 1];
  };

  useEffect(() => {
    const c = lienzo.current;
    if (!c || !datos) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = ancho;
    const H = Math.round(ancho / 2);
    c.width = W * dpr;
    c.height = H * dpr;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = "#0e1320";
    ctx.fillRect(0, 0, W, H);
    const k = W / caja.w;
    if (fondo.current && fondoListo) {
      ctx.globalAlpha = 0.8;
      ctx.drawImage(fondo.current, -caja.x0 * k, -caja.y0 * k, 1000 * k, 500 * k);
      ctx.globalAlpha = 1;
    }
    const r = Math.max(1.6, Math.min(5, 1.3 * Math.sqrt(k)));
    for (let i = 0; i < xy.length; i++) {
      if (!visible(i)) continue;
      const x = (xy[i][0] - caja.x0) * k;
      const y = (xy[i][1] - caja.y0) * k;
      if (x < -5 || y < -5 || x > W + 5 || y > H + 5) continue;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = color(i);
      ctx.globalAlpha = 0.85;
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (sel !== null && xy[sel]) {
      const x = (xy[sel][0] - caja.x0) * k;
      const y = (xy[sel][1] - caja.y0) * k;
      ctx.beginPath();
      ctx.arc(x, y, r + 5, 0, Math.PI * 2);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }, [datos, xy, caja, ancho, modo, familia, aesFiltro, sel, fondoListo]);

  const tocar = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!datos) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const k = rect.width / caja.w;
    const mx = (e.clientX - rect.left) / k + caja.x0;
    const my = (e.clientY - rect.top) / k + caja.y0;
    let mejor = -1;
    let dmin = (12 / k) ** 2;
    for (let i = 0; i < xy.length; i++) {
      if (!visible(i)) continue;
      const d = (xy[i][0] - mx) ** 2 + (xy[i][1] - my) ** 2;
      if (d < dmin) {
        dmin = d;
        mejor = i;
      }
    }
    setSel(mejor >= 0 ? mejor : null);
  };

  const p = sel !== null && datos ? datos.p[sel] : null;
  const total = datos ? datos.p.filter((_, i) => visible(i)).length : 0;

  return (
    <div>
      <div className="vx-li-form">
        <label>
          Vista
          <select value={vista} onChange={(e) => setVista(e.target.value)}>
            {VISTAS.map((v) => (
              <option key={v.id} value={v.id}>
                {v.nombre}
              </option>
            ))}
          </select>
        </label>
        <label>
          Color
          <select value={modo} onChange={(e) => setModo(e.target.value as "familia" | "amenaza")}>
            <option value="familia">Por familia</option>
            <option value="amenaza">Por estado de amenaza</option>
          </select>
        </label>
        <label>
          Familia
          <select value={familia} onChange={(e) => setFamilia(Number(e.target.value))}>
            <option value={-2}>Todas</option>
            {datos?.familias.map(([id, nombre], i) => (
              <option key={i} value={i}>
                {nombresEs[id] ?? nombre}
              </option>
            ))}
            <option value={-1}>Otras familias y aisladas</option>
          </select>
        </label>
        <label>
          Estado
          <select value={aesFiltro} onChange={(e) => setAesFiltro(Number(e.target.value))}>
            <option value={-2}>Todos</option>
            {AES_ES.map((a, i) => (
              <option key={a.clave} value={i}>
                {a.nombre}
              </option>
            ))}
            <option value={-1}>Sin evaluación</option>
          </select>
        </label>
      </div>
      <div className="vx-li-mapa-caja">
        <canvas ref={lienzo} className="vx-li-mapa-lienzo" onClick={tocar} role="img" aria-label={`Mapa con ${total} lenguas. Toca un punto para ver su nombre.`} />
        {!datos && !error ? <p className="vx-li-cargando" style={{ position: "absolute", top: 8, left: 8 }}>Cargando 8.000 lenguas…</p> : null}
      </div>
      {error ? <p className="vx-li-aviso vx-li-error">No se pudieron cargar los puntos del mapa. Recarga la página.</p> : null}
      <div className="vx-li-mapa-info" aria-live="polite">
        {p ? (
          <div className="vx-li-caja">
            <b style={{ fontSize: 17 }}>{p[1]}</b>{" "}
            <span className="vx-li-tr">
              {datos && p[4] >= 0 ? nombresEs[datos.familias[p[4]][0]] ?? datos.familias[p[4]][1] : "otra familia o aislada"} · {AES_ES[p[5]]?.nombre ?? AES_SIN_DATO.nombre}
            </span>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
              <Link className="vx-li-boton" href={rutaIdioma(p[0])}>
                Abrir ficha
              </Link>
              {p[4] >= 0 && datos ? (
                <Link className="vx-li-boton sec" href={`${rutaFamilia(datos.familias[p[4]][0])}?n=${p[0]}`}>
                  Ver en el árbol
                </Link>
              ) : null}
            </div>
          </div>
        ) : (
          <p className="vx-li-nota">{datos ? `${total.toLocaleString("es-ES")} lenguas en pantalla. Toca un punto para identificarlo.` : ""}</p>
        )}
      </div>
      {datos && modo === "familia" ? (
        <ul className="vx-li-leyenda">
          {datos.familias.slice(0, PALETA.length - 1).map(([id, nombre], i) => (
            <li key={id}>
              <span className="vx-li-punto" style={{ background: PALETA[i] }} />
              <Link href={rutaFamilia(id)}>{nombresEs[id] ?? nombre}</Link>
            </li>
          ))}
          <li>
            <span className="vx-li-punto" style={{ background: PALETA[PALETA.length - 1] }} />
            Resto
          </li>
        </ul>
      ) : null}
      {datos && modo === "amenaza" ? (
        <ul className="vx-li-leyenda">
          {AES_ES.map((a) => (
            <li key={a.clave}>
              <span className="vx-li-punto" style={{ background: a.color }} />
              {a.nombre}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
