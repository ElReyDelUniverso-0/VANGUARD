"use client";

// v406.1 · LA FORJA — piezas comunes del ecosistema de creadores.
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { geoMercator } from "d3-geo";
import { INFO_CLASES, esClase, media, PROYECCION_MUNDO, type Punto } from "@/lib/creadores/tipos";
import type { Rol, Accion } from "@/lib/creadores/permisos";
import "./forja.css";

export type Yo = { alias: string | null; rol: Rol; permisos: Accion[]; moderacionActiva: boolean; almacenDuradero: boolean };

export type ObraTarjeta = {
  id: string;
  clase: string;
  autor: string;
  titulo: string;
  resumen: string;
  etiquetas: string[];
  version: number;
  destacada: boolean;
  estado: string;
  valoracion: { suma: number; n: number };
  vistas: number;
  creada: number;
};

/** fetch JSON que nunca lanza: { ok, status, data } */
export async function pedir<T = Record<string, unknown>>(url: string, cuerpo?: unknown): Promise<{ ok: boolean; status: number; data: T & { error?: string; mensaje?: string } }> {
  try {
    const r = await fetch(url, cuerpo === undefined ? { cache: "no-store" } : { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(cuerpo) });
    const data = (await r.json().catch(() => ({}))) as T & { error?: string };
    return { ok: r.ok, status: r.status, data };
  } catch {
    return { ok: false, status: 0, data: { error: "Sin conexión con la casa." } as T & { error?: string } };
  }
}

export function useYo() {
  const [yo, setYo] = useState<Yo | null>(null);
  const recargar = useCallback(async () => {
    const r = await pedir<Yo>("/api/creadores/yo");
    setYo(r.ok ? r.data : { alias: null, rol: "visitante", permisos: ["leer"], moderacionActiva: false, almacenDuradero: false });
  }, []);
  useEffect(() => {
    let vivo = true;
    pedir<Yo>("/api/creadores/yo").then((r) => {
      if (vivo) setYo(r.ok ? r.data : { alias: null, rol: "visitante", permisos: ["leer"], moderacionActiva: false, almacenDuradero: false });
    });
    return () => {
      vivo = false;
    };
  }, []);
  return { yo, recargar };
}

export function haceCuanto(t: number) {
  const m = Math.round((Date.now() - t) / 60000);
  if (m < 1) return "ahora mismo";
  if (m < 60) return `hace ${m} min`;
  const h = Math.round(m / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.round(h / 24);
  return d === 1 ? "ayer" : `hace ${d} días`;
}

export function Estrellas({ suma, n, compacto = false }: { suma: number; n: number; compacto?: boolean }) {
  const m = media(suma, n);
  return (
    <span className="fj-estrellas" aria-label={m === null ? "Sin valoraciones" : `${m} de 5 estrellas, ${n} valoraciones`}>
      <span aria-hidden>★</span> {m === null ? (compacto ? "—" : "Sin valorar") : `${m.toFixed(1)}`}
      {m !== null && <small> ({n})</small>}
    </span>
  );
}

export function Chip({ clase }: { clase: string }) {
  if (!esClase(clase)) return <span className="fj-chip">{clase}</span>;
  const i = INFO_CLASES[clase];
  return (
    <span className="fj-chip" style={{ ["--c" as string]: i.color }}>
      {i.nombre}
    </span>
  );
}

export function TarjetaObra({ o }: { o: ObraTarjeta }) {
  const color = esClase(o.clase) ? INFO_CLASES[o.clase].color : "#e8c56a";
  return (
    <Link href={`/creadores/obra/${o.id}`} className="fj-tarjeta" style={{ ["--c" as string]: color }}>
      <div className="fj-tarjeta-cab">
        <Chip clase={o.clase} />
        {o.destacada && <span className="fj-dest">★ Destacada</span>}
        {o.estado !== "APROBADO" && <span className="fj-estado">{o.estado === "PENDIENTE" ? "En revisión" : o.estado === "RETIRADA" ? "Retirada" : o.estado}</span>}
      </div>
      <h3>{o.titulo}</h3>
      <p>{o.resumen}</p>
      <div className="fj-tarjeta-pie">
        <span>
          por <b>{o.autor}</b>
        </span>
        <Estrellas suma={o.valoracion.suma} n={o.valoracion.n} compacto />
        <span>v{o.version}</span>
      </div>
    </Link>
  );
}

/** el planeta mínimo: retícula + puntos proyectados (equirectangular, sin teselas externas) */
// el mismo Mercator y el mismo dibujo del planeta que la portada (mini-mapa
// v400 + /mapa-mundo.svg); el encuadre se ajusta a los puntos
const PROY = geoMercator()
  .rotate(PROYECCION_MUNDO.rotate)
  .center(PROYECCION_MUNDO.center)
  .scale(PROYECCION_MUNDO.scale)
  .translate(PROYECCION_MUNDO.translate);

export function MiniMapa({ puntos, alto = 220 }: { puntos: Punto[]; alto?: number }) {
  const xy = puntos.map((p) => PROY([p.lon, p.lat]) ?? [500, 250]);
  const xs = xy.map((q) => q[0]);
  const ys = xy.map((q) => q[1]);
  // caja de los puntos + margen, nunca más pequeña que una región (≈ 140×74)
  let vw = Math.max(140, (Math.max(...xs) - Math.min(...xs)) * 1.5 + 40);
  let vh = Math.max(74, (Math.max(...ys) - Math.min(...ys)) * 1.5 + 40);
  if (vw / vh > 1.9) vh = vw / 1.9;
  else vw = vh * 1.9;
  vw = Math.min(1000, vw);
  vh = Math.min(500, vh);
  const cx = (Math.max(...xs) + Math.min(...xs)) / 2;
  const cy = (Math.max(...ys) + Math.min(...ys)) / 2;
  const x0 = Math.max(0, Math.min(1000 - vw, cx - vw / 2));
  const y0 = Math.max(0, Math.min(500 - vh, cy - vh / 2));
  const k = vw / 720; // tamaño de punto y letra constante en pantalla
  return (
    <svg className="fj-mapa" viewBox={`${x0} ${y0} ${vw} ${vh}`} style={{ maxHeight: alto }} role="img" aria-label={`Mapa con ${puntos.length} puntos`}>
      <rect x={0} y={0} width={1000} height={500} fill="#0e1320" />
      <image href="/mapa-mundo.svg" x="0" y="0" width={1000} height={500} />
      {xy.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={10 * k} fill="rgba(110,214,255,0.22)" />
          <circle cx={x} cy={y} r={4.5 * k} fill="#6ed6ff" stroke="#070b12" strokeWidth={1.5 * k} />
          <text x={x + 9 * k} y={y - 8 * k} fill="#f4efe2" fontSize={16 * k} fontFamily="system-ui, sans-serif" stroke="#070b12" strokeWidth={4 * k} paintOrder="stroke">
            {puntos[i].etiqueta}
          </text>
        </g>
      ))}
    </svg>
  );
}

/** aviso honesto: en producción la base vive en /tmp de cada instancia */
export function AvisoAlmacen({ yo }: { yo: Yo | null }) {
  if (!yo || yo.almacenDuradero) return null;
  return (
    <p className="fj-aviso" role="note">
      <b>Fase de prueba.</b> Hasta que VANGUARD conecte su base permanente, lo publicado aquí puede borrarse cuando el servidor se reinicia. Tu borrador y una copia de cada obra que publiques se guardan también en este aparato.
    </p>
  );
}

/** entrar o crear cuenta sin salir de La Forja (usa /api/auth de siempre) */
export function Acceso({ alEntrar, texto = "Entra para publicar, comentar y valorar" }: { alEntrar: () => void; texto?: string }) {
  const [modo, setModo] = useState<"entrar" | "crear">("entrar");
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [error, setError] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setOcupado(true);
    setError("");
    const r = await pedir<{ ok?: boolean }>(modo === "entrar" ? "/api/auth/login" : "/api/auth/register", { username: u.trim().toUpperCase(), password: p });
    setOcupado(false);
    if (r.ok && r.data.ok !== false) alEntrar();
    else setError(r.data.error || "No se pudo entrar.");
  };
  return (
    <form className="fj-acceso" onSubmit={enviar}>
      <p className="fj-acceso-t">{texto}</p>
      <div className="fj-tabs" role="tablist">
        <button type="button" role="tab" aria-selected={modo === "entrar"} onClick={() => setModo("entrar")}>
          Entrar
        </button>
        <button type="button" role="tab" aria-selected={modo === "crear"} onClick={() => setModo("crear")}>
          Crear cuenta
        </button>
      </div>
      <label>
        Alias
        <input value={u} onChange={(e) => setU(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "").slice(0, 16))} autoComplete="username" required minLength={3} placeholder="TU_ALIAS" />
      </label>
      <label>
        Contraseña
        <input type="password" value={p} onChange={(e) => setP(e.target.value)} autoComplete={modo === "entrar" ? "current-password" : "new-password"} required minLength={modo === "crear" ? 6 : 4} />
      </label>
      {error && <p className="fj-error">{error}</p>}
      <button className="fj-btn fj-btn-oro" disabled={ocupado}>
        {ocupado ? "…" : modo === "entrar" ? "Entrar" : "Crear mi cuenta de creador"}
      </button>
    </form>
  );
}

export function Cargando({ texto = "Cargando…" }: { texto?: string }) {
  return (
    <p className="fj-cargando" role="status">
      {texto}
    </p>
  );
}

// ───────── copia local de las obras propias (por si la base se reinicia)
const CLAVE_TALLER = "vg-forja-taller-v1";
export type CopiaLocal = { id: string; clase: string; titulo: string; guardada: number; obra: unknown };
export function leerTaller(): CopiaLocal[] {
  try {
    const x = JSON.parse(localStorage.getItem(CLAVE_TALLER) || "[]");
    return Array.isArray(x) ? x.slice(0, 40) : [];
  } catch {
    return [];
  }
}
export function guardarEnTaller(c: CopiaLocal) {
  try {
    const l = [c, ...leerTaller().filter((x) => x.id !== c.id)].slice(0, 40);
    localStorage.setItem(CLAVE_TALLER, JSON.stringify(l));
  } catch {
    /* aparato lleno o privado */
  }
}
