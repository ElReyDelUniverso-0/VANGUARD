"use client";

// ============================================================
// v432.0 UN SOLO MUNDO · ZONA CERO — EL TABLERO DEL OJO
// Una zona oscura; en el centro, el ojo de Vanguard irradiando luz. Tocar el
// ojo abre el buscador de TODA la casa (/api/zona-cero: noticias de hoy,
// países, conocimiento, armas, salas, imágenes). Cada hallazgo se PEGA en la
// Zona Cero: sale disparado del ojo y queda como carta unida a él por un hilo
// de luz. Las cartas:
//   · se arrastran (dedo, ratón, lápiz; flechas del teclado) — el arrastre
//     mueve el DOM directamente y solo guarda al soltar: cero re-render por
//     cada píxel;
//   · al tocarlas abren su FICHA: imagen grande, fuente y crédito, una NOTA
//     propia, sus enlaces y las acciones (abrir, buscar relacionado, enlazar,
//     quitar);
//   · se ENLAZAN entre sí con hilos de oro (constelaciones: un país, un arma
//     y una noticia que cuentan la misma historia).
// El tablero se copia como texto, se exporta y se importa (.json). Vive SOLO
// en este aparato (localStorage): ni cuentas ni servidor guardan lo que
// alguien pega.
// ============================================================

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type KeyboardEvent as KEvent,
  type PointerEvent as PEvent,
} from "react";
import Link from "next/link";
import { OjoVanguard } from "./ojo-vanguard";
import type { FiltroZonaCero, PiezaZonaCero, RespuestaZonaCero } from "@/lib/zona-cero/buscar";
// v431.6: lo que pegas aquí se puede anotar en EL CUADERNO sin perder nada —
// el tablero no se borra, se copia a la pieza del cuaderno que le corresponde.
import { anotarEnCuaderno, type Encargo } from "@/lib/cuaderno/enviar";
import "./zona-cero.css";

const CLAVE = "vx-zona-cero-v1";
const CLAVE_RECIENTES = "vx-zona-cero-recientes";
const MAX_PIEZAS = 40;
const MAX_ENLACES = 80;
const MAX_NOTA = 280;

type Pegada = PiezaZonaCero & { x: number; y: number; t: number; nota?: string };
type Enlace = [string, string];
type Tablero = { piezas: Pegada[]; enlaces: Enlace[] };
type Deshacer = { texto: string; antes: Tablero } | null;

/** De una pieza del tablero a una pieza del cuaderno: su puerta, su origen, su nota. */
function encargoDe(p: PiezaZonaCero & { nota?: string }): Encargo {
  const cuerpo = [p.nota?.trim(), p.sub?.trim(), p.credito ? `Imagen: ${p.credito}` : ""]
    .filter(Boolean)
    .join("\n\n");
  return {
    tipo: "enlace",
    titulo: p.titulo,
    cuerpo,
    ruta: p.ruta,
    fuente: [p.origen, p.fecha].filter(Boolean).join(" · ") || "Zona Cero de Vanguard",
    imagen: p.imagen,
    etiquetas: ["zona-cero", p.clase],
    marca: "bandera",
  };
}

/** Manda una pieza y lo dice con la verdad: cuántas quedan dentro. */
function avisarEnvio(titulo: string, r: { ok: boolean; dentro: number; motivo?: string }) {
  return r.ok
    ? `«${titulo}» quedó anotada en EL CUADERNO (${r.dentro} ${r.dentro === 1 ? "pieza" : "piezas"} dentro).`
    : `No se pudo anotar: ${r.motivo ?? "el aparato no dejó"}.`;
}

const FILTROS: { id: FiltroZonaCero; label: string }[] = [
  { id: "todo", label: "Todo" },
  { id: "noticias", label: "Noticias" },
  { id: "paises", label: "Países" },
  { id: "conocimiento", label: "Conocimiento" },
  { id: "armas", label: "Armas" },
  { id: "salas", label: "Módulos y salas" },
  { id: "imagenes", label: "Con imagen" },
];

/** orden de familias al «Ordenar»: lo parecido queda junto alrededor del ojo */
const ORDEN_CLASE = ["noticia", "pais", "region", "conocimiento", "arma", "sala", "modulo"];

const limitar = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const claveEnlace = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`);

/** Órbita de ángulo áureo: cada pieza nueva cae en un hueco distinto alrededor del ojo. */
function posicionInicial(i: number): { x: number; y: number } {
  const a = (i * 137.508 * Math.PI) / 180 - Math.PI / 2;
  const rx = 36 + (i % 3) * 4;
  const ry = 34 + (i % 4) * 3;
  return { x: limitar(50 + rx * Math.cos(a), 9, 91), y: limitar(50 + ry * Math.sin(a), 9, 91) };
}

function valida(p: unknown): p is Pegada {
  const o = p as Pegada;
  return (
    !!o &&
    typeof o.id === "string" &&
    typeof o.titulo === "string" &&
    typeof o.ruta === "string" &&
    o.ruta.startsWith("/") &&
    !o.ruta.startsWith("//") &&
    Number.isFinite(o.x) &&
    Number.isFinite(o.y)
  );
}

/** Limpia cualquier tablero (guardado o importado): piezas válidas, enlaces entre piezas que existen. */
function sanear(crudo: unknown): Tablero {
  const obj = Array.isArray(crudo) ? { piezas: crudo, enlaces: [] } : (crudo as Partial<Tablero> | null);
  const piezas = (Array.isArray(obj?.piezas) ? obj.piezas : [])
    .filter(valida)
    .slice(0, MAX_PIEZAS)
    .map((p) => ({
      ...p,
      x: limitar(p.x, 3, 97),
      y: limitar(p.y, 3, 97),
      t: Number.isFinite(p.t) ? p.t : 0,
      nota: typeof p.nota === "string" ? p.nota.slice(0, MAX_NOTA) : undefined,
      imagen: typeof p.imagen === "string" && /^(https:\/\/|\/)/.test(p.imagen) && !p.imagen.startsWith("//") ? p.imagen : undefined,
    }));
  const ids = new Set(piezas.map((p) => p.id));
  const vistos = new Set<string>();
  const enlaces = (Array.isArray(obj?.enlaces) ? obj.enlaces : [])
    .filter((e): e is Enlace => Array.isArray(e) && e.length === 2 && ids.has(e[0]) && ids.has(e[1]) && e[0] !== e[1])
    .filter((e) => {
      const k = claveEnlace(e[0], e[1]);
      if (vistos.has(k)) return false;
      vistos.add(k);
      return true;
    })
    .slice(0, MAX_ENLACES);
  return { piezas, enlaces };
}

function leer(): Tablero {
  try {
    return sanear(JSON.parse(localStorage.getItem(CLAVE) ?? "[]"));
  } catch {
    return { piezas: [], enlaces: [] };
  }
}

function guardar(t: Tablero) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify({ v: 2, ...t }));
  } catch {
    /* modo privado o disco lleno: el tablero dura lo que dure la pestaña */
  }
}

function leerRecientes(): string[] {
  try {
    const r = JSON.parse(localStorage.getItem(CLAVE_RECIENTES) ?? "[]");
    return Array.isArray(r) ? r.filter((x) => typeof x === "string").slice(0, 6) : [];
  } catch {
    return [];
  }
}

/** Las primeras palabras con sustancia de un título: semilla de «buscar relacionado». */
function semilla(titulo: string): string {
  return titulo
    .replace(/[«»"“”().,:;!?¿¡|·—-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3)
    .slice(0, 3)
    .join(" ");
}

function fechaCorta(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("es", { day: "numeric", month: "short", year: "numeric" });
}

/** Huecos candidatos alrededor del ojo: tres órbitas elípticas, 12 ángulos cada una. */
const HUECOS: { x: number; y: number }[] = Array.from({ length: 36 }, (_, i) => {
  const anillo = i % 3;
  const a = ((Math.floor(i / 3) * 30 + anillo * 10) * Math.PI) / 180 - Math.PI / 2;
  const rx = [40, 31, 44][anillo];
  const ry = [38, 30, 44][anillo];
  return { x: 50 + rx * Math.cos(a), y: 50 + ry * Math.sin(a) };
});

/**
 * El hueco más libre para una carta nueva: de los candidatos, el que queda más
 * lejos (en píxeles reales, contando el tamaño de la carta) de las ya puestas
 * y del iris del ojo. Sin medidas todavía, cae en la órbita áurea de siempre.
 */
function huecoLibre(puestas: { x: number; y: number }[], dim: { w: number; h: number } | null, i: number, densa: boolean) {
  if (!dim || !dim.w || !dim.h) return posicionInicial(i);
  const { mx, my } = medidas(dim.w, densa);
  const bx = ((mx + 4) / dim.w) * 100;
  const by = ((my + 4) / dim.h) * 100;
  let mejor = HUECOS[0];
  let puntos = -Infinity;
  for (const h of HUECOS) {
    const c = { x: limitar(h.x, bx, 100 - bx), y: limitar(h.y, by, 100 - by) };
    // distancia normalizada al tamaño de la carta (1 = se tocan los bordes)
    let cerca = Infinity;
    for (const o of puestas) {
      const dx = (Math.abs(c.x - o.x) / 100) * dim.w / (2 * mx);
      const dy = (Math.abs(c.y - o.y) / 100) * dim.h / (2 * my);
      cerca = Math.min(cerca, Math.max(dx, dy));
    }
    // el iris (centro) penaliza: la carta no debe tapar la pupila
    const iris = Math.max((Math.abs(c.x - 50) / 100) * dim.w / (mx + 60), (Math.abs(c.y - 50) / 100) * dim.h / (my + 50));
    const valor = Math.min(cerca, 3) + Math.min(iris, 1.2) * 0.8;
    if (valor > puntos) {
      puntos = valor;
      mejor = c;
    }
  }
  return mejor;
}

/** medidas de una carta (mitad de ancho / alto, px) según el tablero y la densidad */
function medidas(ancho: number, densa: boolean): { mx: number; my: number } {
  if (densa) return ancho >= 900 ? { mx: 66, my: 52 } : { mx: 56, my: 46 };
  return ancho >= 900 ? { mx: 90, my: 76 } : { mx: 74, my: 66 };
}

function Miniatura({ p, clase }: { p: PiezaZonaCero; clase: string }) {
  const [rota, setRota] = useState(false);
  if (!p.imagen || rota) {
    return (
      <span className={`${clase} zc-sin-img`} aria-hidden>
        {p.titulo.slice(0, 1).toUpperCase()}
      </span>
    );
  }
  return (
    <img
      className={clase}
      src={p.imagen}
      alt=""
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      draggable={false}
      onError={() => setRota(true)}
    />
  );
}

export function NucleoZonaCero() {
  const [tab, setTab] = useState<Tablero>({ piezas: [], enlaces: [] });
  const [listo, setListo] = useState(false);
  const [abierto, setAbierto] = useState(false);
  const [q, setQ] = useState("");
  const [filtro, setFiltro] = useState<FiltroZonaCero>("todo");
  const [res, setRes] = useState<RespuestaZonaCero | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [despierta, setDespierta] = useState(false);
  const [aviso, setAviso] = useState("");
  const [sel, setSel] = useState<string | null>(null);
  const [enlazando, setEnlazando] = useState<string | null>(null);
  const [recien, setRecien] = useState<string | null>(null);
  const [activo, setActivo] = useState(0);
  const [recientes, setRecientes] = useState<string[]>([]);
  const [dim, setDim] = useState<{ w: number; h: number } | null>(null);
  const [deshacer, setDeshacer] = useState<Deshacer>(null);

  const tablero = useRef<HTMLDivElement | null>(null);
  const hilos = useRef<SVGSVGElement | null>(null);
  const ojo = useRef<HTMLButtonElement | null>(null);
  const entrada = useRef<HTMLInputElement | null>(null);
  const lista = useRef<HTMLUListElement | null>(null);
  const archivo = useRef<HTMLInputElement | null>(null);
  const cuadro = useRef(0);
  const arrastre = useRef<{ id: string; ox: number; oy: number; sx: number; sy: number; caja: DOMRect; movio: boolean; x: number; y: number } | null>(null);
  const tDeshacer = useRef(0);

  const { piezas, enlaces } = tab;
  const densa = piezas.length > (!dim ? 8 : dim.w >= 900 ? 14 : dim.w >= 600 ? 8 : 4);

  // ── tablero guardado (solo cliente) ──
  useEffect(() => {
    setTab(leer());
    setRecientes(leerRecientes());
    setListo(true);
  }, []);
  useEffect(() => {
    if (listo) guardar(tab);
  }, [tab, listo]);

  // ── medidas del tablero (para que cartas e hilos nunca se salgan) ──
  useEffect(() => {
    const el = tablero.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([e]) => setDim({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /** centro visible de una pieza, en % del tablero, ya acotado a sus bordes */
  const centro = useCallback(
    (x: number, y: number) => {
      if (!dim || !dim.w || !dim.h) return { x, y };
      const { mx, my } = medidas(dim.w, densa);
      const bx = Math.min(50, ((mx + 4) / dim.w) * 100);
      const by = Math.min(50, ((my + 4) / dim.h) * 100);
      return { x: limitar(x, bx, 100 - bx), y: limitar(y, by, 100 - by) };
    },
    [dim, densa],
  );

  // ── la pupila sigue al puntero (variables CSS, sin re-render) ──
  const mirar = useCallback((e: PEvent<HTMLDivElement>) => {
    if (cuadro.current) return;
    const { clientX, clientY } = e;
    cuadro.current = requestAnimationFrame(() => {
      cuadro.current = 0;
      const el = ojo.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const dx = (clientX - (r.left + r.width / 2)) / (window.innerWidth / 2);
      const dy = (clientY - (r.top + r.height / 2)) / (window.innerHeight / 2);
      el.style.setProperty("--ojo-x", limitar(dx, -1, 1).toFixed(3));
      el.style.setProperty("--ojo-y", limitar(dy, -1, 1).toFixed(3));
    });
  }, []);
  useEffect(
    () => () => {
      cancelAnimationFrame(cuadro.current);
      window.clearTimeout(tDeshacer.current);
    },
    [],
  );

  // ── el buscador: destacados al abrir, búsqueda con pausa al escribir ──
  useEffect(() => {
    if (!abierto) return;
    const ctl = new AbortController();
    const pausa = q.trim().length >= 2 ? 280 : 0;
    const t = window.setTimeout(async () => {
      setCargando(true);
      setError(null);
      try {
        const r = await fetch(`/api/zona-cero?q=${encodeURIComponent(q.trim())}&filtro=${filtro}`, { signal: ctl.signal });
        const j = (await r.json()) as { ok: boolean; datos?: RespuestaZonaCero; error?: { mensaje?: string } };
        if (!j.ok || !j.datos) throw new Error(j.error?.mensaje ?? "La Zona Cero no respondió.");
        setRes(j.datos);
        setActivo(0);
      } catch (e) {
        if (!ctl.signal.aborted) setError(e instanceof Error ? e.message : "La Zona Cero no respondió.");
      } finally {
        if (!ctl.signal.aborted) setCargando(false);
      }
    }, pausa);
    return () => {
      window.clearTimeout(t);
      ctl.abort();
    };
  }, [q, filtro, abierto]);

  const recordar = useCallback((consulta: string) => {
    const c = consulta.trim();
    if (c.length < 2) return;
    setRecientes((r) => {
      const nuevo = [c, ...r.filter((x) => x.toLowerCase() !== c.toLowerCase())].slice(0, 6);
      try {
        localStorage.setItem(CLAVE_RECIENTES, JSON.stringify(nuevo));
      } catch {
        /* sin almacenamiento: los recientes duran la pestaña */
      }
      return nuevo;
    });
  }, []);

  const despertar = useCallback(() => {
    setDespierta(true);
    window.setTimeout(() => setDespierta(false), 900);
  }, []);

  const abrir = useCallback(
    (consulta?: string) => {
      despertar();
      if (consulta !== undefined) setQ(consulta);
      setAbierto(true);
    },
    [despertar],
  );

  const cerrar = useCallback(() => {
    setAbierto(false);
    window.setTimeout(() => ojo.current?.focus({ preventScroll: true }), 0);
  }, []);

  // modal abierto: foco en la caja, Escape cierra, la página no se desplaza detrás
  useEffect(() => {
    if (!abierto) return;
    const t = window.setTimeout(() => entrada.current?.focus({ preventScroll: true }), 60);
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") cerrar();
    };
    const html = document.documentElement;
    const antes = html.style.overflow;
    html.style.overflow = "hidden";
    window.addEventListener("keydown", tecla);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", tecla);
      html.style.overflow = antes;
    };
  }, [abierto, cerrar]);

  // atajo «/»: abre el ojo desde cualquier punto de la página (si no se está escribiendo)
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      e.preventDefault();
      abrir();
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [abrir]);

  // ── cambios del tablero con «deshacer» ──
  const conDeshacer = useCallback((texto: string, antes: Tablero) => {
    window.clearTimeout(tDeshacer.current);
    setDeshacer({ texto, antes });
    tDeshacer.current = window.setTimeout(() => setDeshacer(null), 7000);
  }, []);

  const pegar = useCallback(
    (p: PiezaZonaCero) => {
      if (piezas.some((x) => x.id === p.id)) {
        const antes = tab;
        setTab({ piezas: piezas.filter((x) => x.id !== p.id), enlaces: enlaces.filter((e) => !e.includes(p.id)) });
        setAviso(`Quitada de la Zona Cero: ${p.titulo}`);
        conDeshacer("Pieza quitada", antes);
        return;
      }
      if (piezas.length >= MAX_PIEZAS) {
        setAviso(`La Zona Cero admite ${MAX_PIEZAS} piezas: quita alguna para pegar más.`);
        return;
      }
      const densaLuego = piezas.length + 1 > (!dim ? 8 : dim.w >= 900 ? 14 : dim.w >= 600 ? 8 : 4);
      const sitio = huecoLibre(piezas, dim, piezas.length, densaLuego);
      setTab({ piezas: [...piezas, { ...p, ...sitio, t: Date.now() }], enlaces });
      setRecien(p.id);
      window.setTimeout(() => setRecien((r) => (r === p.id ? null : r)), 1000);
      despertar();
      recordar(q);
      setAviso(`Pegada en la Zona Cero: ${p.titulo}`);
    },
    [piezas, enlaces, tab, q, dim, conDeshacer, despertar, recordar],
  );

  const quitar = useCallback(
    (id: string) => {
      const p = piezas.find((x) => x.id === id);
      if (!p) return;
      const antes = tab;
      setTab({ piezas: piezas.filter((x) => x.id !== id), enlaces: enlaces.filter((e) => !e.includes(id)) });
      setSel((s) => (s === id ? null : s));
      setAviso(`Quitada de la Zona Cero: ${p.titulo}`);
      conDeshacer("Pieza quitada", antes);
    },
    [piezas, enlaces, tab, conDeshacer],
  );

  const vaciar = useCallback(() => {
    const antes = tab;
    setTab({ piezas: [], enlaces: [] });
    setSel(null);
    setEnlazando(null);
    setAviso("Zona Cero vacía.");
    conDeshacer("Zona Cero vacía", antes);
  }, [tab, conDeshacer]);

  const ordenar = useCallback(() => {
    const rango = (c: string) => {
      const i = ORDEN_CLASE.indexOf(c);
      return i < 0 ? ORDEN_CLASE.length : i;
    };
    const orden = [...piezas].sort((a, b) => rango(a.clase) - rango(b.clase) || a.t - b.t);
    const puestas: { x: number; y: number }[] = [];
    const pos = new Map<string, { x: number; y: number }>();
    orden.forEach((p, i) => {
      const c = huecoLibre(puestas, dim, i, densa);
      puestas.push(c);
      pos.set(p.id, c);
    });
    const antes = tab;
    setTab({ piezas: piezas.map((p) => ({ ...p, ...pos.get(p.id)! })), enlaces });
    setAviso("Piezas repartidas por familia alrededor del ojo.");
    conDeshacer("Piezas reordenadas", antes);
  }, [piezas, enlaces, tab, dim, densa, conDeshacer]);

  const anotar = useCallback((id: string, nota: string) => {
    setTab((t) => ({ ...t, piezas: t.piezas.map((p) => (p.id === id ? { ...p, nota: nota.slice(0, MAX_NOTA) } : p)) }));
  }, []);

  const alternarEnlace = useCallback(
    (a: string, b: string) => {
      if (a === b) return;
      const k = claveEnlace(a, b);
      const existe = enlaces.some((e) => claveEnlace(e[0], e[1]) === k);
      if (!existe && enlaces.length >= MAX_ENLACES) {
        setAviso(`Máximo ${MAX_ENLACES} enlaces.`);
        return;
      }
      setTab({ piezas, enlaces: existe ? enlaces.filter((e) => claveEnlace(e[0], e[1]) !== k) : [...enlaces, [a, b]] });
      const ta = piezas.find((p) => p.id === a)?.titulo ?? "";
      const tb = piezas.find((p) => p.id === b)?.titulo ?? "";
      setAviso(existe ? `Enlace deshecho entre «${ta}» y «${tb}».` : `Enlazadas: «${ta}» ↔ «${tb}».`);
    },
    [piezas, enlaces],
  );

  /** toque sobre una carta: elegirla, o cerrar el enlace si se estaba enlazando */
  const tocar = useCallback(
    (id: string) => {
      if (enlazando) {
        if (enlazando !== id) alternarEnlace(enlazando, id);
        // se vuelve a la ficha de ORIGEN: así se encadenan varios enlaces desde una pieza
        setSel(enlazando);
        setEnlazando(null);
        return;
      }
      setSel((s) => (s === id ? null : id));
    },
    [enlazando, alternarEnlace],
  );

  // ── arrastre: DOM directo mientras se mueve, estado solo al soltar ──
  const pintar = useCallback(
    (id: string, x: number, y: number) => {
      const c = centro(x, y);
      const el = tablero.current?.querySelector<HTMLElement>(`[data-pid="${CSS.escape(id)}"]`);
      if (el) {
        el.style.left = `${c.x}%`;
        el.style.top = `${c.y}%`;
      }
      const svg = hilos.current;
      if (!svg) return;
      svg.querySelectorAll<SVGLineElement>(`[data-a="${CSS.escape(id)}"]`).forEach((l) => {
        l.setAttribute("x1", String(c.x));
        l.setAttribute("y1", String(c.y));
      });
      svg.querySelectorAll<SVGLineElement>(`[data-b="${CSS.escape(id)}"]`).forEach((l) => {
        l.setAttribute("x2", String(c.x));
        l.setAttribute("y2", String(c.y));
      });
    },
    [centro],
  );

  const alBajar = useCallback(
    (e: PEvent<HTMLLIElement>, id: string) => {
      if (e.button !== 0 || (e.target as HTMLElement).closest("a,button")) return;
      const caja = tablero.current?.getBoundingClientRect();
      if (!caja) return;
      const carta = e.currentTarget.getBoundingClientRect();
      const p = piezas.find((x) => x.id === id);
      arrastre.current = {
        id,
        ox: e.clientX - (carta.left + carta.width / 2),
        oy: e.clientY - (carta.top + carta.height / 2),
        sx: e.clientX,
        sy: e.clientY,
        caja,
        movio: false,
        x: p?.x ?? 50,
        y: p?.y ?? 50,
      };
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [piezas],
  );
  const alMover = useCallback(
    (e: PEvent<HTMLLIElement>) => {
      const a = arrastre.current;
      if (!a) return;
      if (!a.movio) {
        if (Math.hypot(e.clientX - a.sx, e.clientY - a.sy) < 6) return;
        a.movio = true;
        e.currentTarget.dataset.arrastrando = "1";
      }
      a.x = limitar(((e.clientX - a.ox - a.caja.left) / a.caja.width) * 100, 3, 97);
      a.y = limitar(((e.clientY - a.oy - a.caja.top) / a.caja.height) * 100, 3, 97);
      pintar(a.id, a.x, a.y);
    },
    [pintar],
  );
  const alSoltar = useCallback(
    (e: PEvent<HTMLLIElement>, cancelado = false) => {
      const a = arrastre.current;
      arrastre.current = null;
      delete e.currentTarget.dataset.arrastrando;
      if (!a) return;
      if (a.movio) {
        const c = centro(a.x, a.y); // se guarda lo que se ve
        setTab((t) => ({ ...t, piezas: t.piezas.map((p) => (p.id === a.id ? { ...p, x: c.x, y: c.y } : p)) }));
      } else if (!cancelado) {
        tocar(a.id);
      }
    },
    [centro, tocar],
  );

  const alTecla = useCallback(
    (e: KEvent<HTMLLIElement>, id: string) => {
      if (e.target !== e.currentTarget) return;
      const paso = e.shiftKey ? 6 : 2;
      const d: Record<string, [number, number]> = {
        ArrowLeft: [-paso, 0],
        ArrowRight: [paso, 0],
        ArrowUp: [0, -paso],
        ArrowDown: [0, paso],
      };
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        quitar(id);
        return;
      }
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        tocar(id);
        return;
      }
      const m = d[e.key];
      if (!m) return;
      e.preventDefault();
      setTab((t) => ({
        ...t,
        piezas: t.piezas.map((p) => {
          if (p.id !== id) return p;
          const c = centro(p.x + m[0], p.y + m[1]);
          return { ...p, x: c.x, y: c.y };
        }),
      }));
    },
    [quitar, tocar, centro],
  );

  // ficha abierta: Escape la cierra (o cancela el enlace en curso)
  useEffect(() => {
    if (!sel && !enlazando) return;
    const tecla = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || abierto) return;
      if (enlazando) setEnlazando(null);
      else setSel(null);
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [sel, enlazando, abierto]);

  // ── compartir: texto, exportar, importar ──
  const comoTexto = useCallback(() => {
    const base = window.location.origin;
    const nombre = new Map(piezas.map((p) => [p.id, p.titulo]));
    const lineas = [`ZONA CERO · Vanguard — ${new Date().toLocaleDateString("es", { dateStyle: "long" })}`, ""];
    piezas.forEach((p, i) => {
      lineas.push(`${i + 1}. [${p.etiqueta}] ${p.titulo}`);
      lineas.push(`   ${base}${p.ruta}`);
      if (p.credito) lineas.push(`   ${p.credito}`);
      if (p.nota) lineas.push(`   Nota: ${p.nota}`);
    });
    if (enlaces.length) {
      lineas.push("", "Enlaces:");
      for (const [a, b] of enlaces) lineas.push(`   ${nombre.get(a)} ↔ ${nombre.get(b)}`);
    }
    return lineas.join("\n");
  }, [piezas, enlaces]);

  const copiar = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(comoTexto());
      setAviso("Tu Zona Cero se copió como texto, con sus enlaces.");
    } catch {
      setAviso("El navegador no dejó copiar. Usa «Exportar».");
    }
  }, [comoTexto]);

  const exportar = useCallback(() => {
    const blob = new Blob([JSON.stringify({ app: "vanguard-zona-cero", v: 2, fecha: new Date().toISOString(), ...tab }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `zona-cero-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 2000);
    setAviso("Zona Cero exportada.");
  }, [tab]);

  const importar = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      e.target.value = "";
      if (!f) return;
      if (f.size > 400_000) {
        setAviso("Ese archivo es demasiado grande para una Zona Cero.");
        return;
      }
      try {
        const nuevo = sanear(JSON.parse(await f.text()));
        if (!nuevo.piezas.length) throw new Error("vacío");
        const ids = new Set(piezas.map((p) => p.id));
        const suma = [...piezas, ...nuevo.piezas.filter((p) => !ids.has(p.id))].slice(0, MAX_PIEZAS);
        const antes = tab;
        setTab(sanear({ piezas: suma, enlaces: [...enlaces, ...nuevo.enlaces] }));
        setAviso(`Importadas ${suma.length - piezas.length} piezas nuevas.`);
        conDeshacer("Importación hecha", antes);
      } catch {
        setAviso("Ese archivo no es una Zona Cero de Vanguard.");
      }
    },
    [piezas, enlaces, tab, conDeshacer],
  );

  // ── teclado del buscador: ↑ ↓ eligen, Enter pega ──
  const alTeclaBuscar = useCallback(
    (e: KEvent<HTMLInputElement>) => {
      const n = res?.piezas.length ?? 0;
      if (!n) return;
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const sig = (activo + (e.key === "ArrowDown" ? 1 : -1) + n) % n;
        setActivo(sig);
        lista.current?.children[sig]?.scrollIntoView({ block: "nearest" });
      } else if (e.key === "Enter") {
        e.preventDefault();
        const p = res?.piezas[activo];
        if (p) pegar(p);
      }
    },
    [res, activo, pegar],
  );

  const estado = cargando
    ? "El ojo está mirando…"
    : error
      ? error
      : res
        ? res.modo === "destacados"
          ? "Destacados de hoy en Vanguard. Escribe para buscar en toda la casa."
          : `${res.piezas.length} ${res.piezas.length === 1 ? "hallazgo" : "hallazgos"} para «${res.q}»`
        : "";

  const posiciones = useMemo(() => new Map(piezas.map((p) => [p.id, centro(p.x, p.y)])), [piezas, centro]);
  const elegida = sel ? piezas.find((p) => p.id === sel) ?? null : null;
  const enlacesDe = useCallback(
    (id: string) => enlaces.filter((e) => e.includes(id)).map((e) => (e[0] === id ? e[1] : e[0])),
    [enlaces],
  );
  const vecinos = new Set(elegida ? enlacesDe(elegida.id) : []);
  const nombreDe = (id: string) => piezas.find((p) => p.id === id)?.titulo ?? "";

  return (
    <section className="zc" aria-labelledby="zc-titulo" data-mirando={cargando && abierto ? "1" : "0"}>
      <div className="zc-cielo" aria-hidden />
      <div className="zc-rayos" aria-hidden />

      <header className="zc-cab">
        <p className="zc-kicker">
          <span aria-hidden>◆</span> El centro de Vanguard
        </p>
        <h1 id="zc-titulo" className="zc-titulo">
          Zona Cero
        </h1>
        <p className="zc-bajada">
          Toca el ojo y busca en toda la casa: noticias de hoy, países, conocimiento, armas, módulos e imágenes. Pega lo que encuentres, anótalo y únelo con hilos de oro.
        </p>
      </header>

      <div ref={tablero} className="zc-tablero" data-densa={densa ? "1" : "0"} data-enlazando={enlazando ? "1" : "0"} onPointerMove={mirar}>
        <svg ref={hilos} className="zc-hilos" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
          {piezas.map((p) => {
            const c = posiciones.get(p.id)!;
            return <line key={p.id} data-b={p.id} x1="50" y1="50" x2={c.x} y2={c.y} className="zc-hilo" data-luz={sel === p.id ? "1" : "0"} vectorEffect="non-scaling-stroke" />;
          })}
          {enlaces.map(([a, b]) => {
            const ca = posiciones.get(a);
            const cb = posiciones.get(b);
            if (!ca || !cb) return null;
            return (
              <line
                key={claveEnlace(a, b)}
                data-a={a}
                data-b={b}
                x1={ca.x}
                y1={ca.y}
                x2={cb.x}
                y2={cb.y}
                className="zc-enlace"
                data-luz={sel === a || sel === b ? "1" : "0"}
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
        </svg>

        <button
          ref={ojo}
          type="button"
          className="zc-ojo"
          data-despierta={despierta ? "1" : "0"}
          onClick={() => abrir()}
          aria-haspopup="dialog"
          aria-expanded={abierto}
          aria-keyshortcuts="/"
          aria-label="El ojo de Vanguard: abrir el buscador de toda la casa (atajo: barra /)"
        >
          <span className="zc-ojo-pulso" aria-hidden />
          <span className="zc-ojo-pulso b" aria-hidden />
          <OjoVanguard className="zc-ojo-svg" />
        </button>
        <p className="zc-toca" aria-hidden>
          {piezas.length ? "Toca el ojo para buscar más" : "Toca el ojo"}
        </p>

        {listo && piezas.length === 0 && (
          <div className="zc-semillas">
            <span>Prueba:</span>
            {["Ucrania", "Drones", "Japón", "Placas tectónicas"].map((s) => (
              <button key={s} type="button" onClick={() => abrir(s)}>
                {s}
              </button>
            ))}
          </div>
        )}

        <ul className="zc-cartas" aria-label="Piezas pegadas en la Zona Cero">
          {piezas.map((p) => {
            const c = posiciones.get(p.id)!;
            const nace = recien === p.id && dim ? dim : null;
            const estilo = {
              left: `${c.x}%`,
              top: `${c.y}%`,
              ...(nace ? { "--nx": `${((50 - c.x) / 100) * nace.w}px`, "--ny": `${((50 - c.y) / 100) * nace.h}px` } : null),
            } as CSSProperties;
            return (
              <li
                key={p.id}
                data-pid={p.id}
                className="zc-carta"
                data-clase={p.clase}
                data-sel={sel === p.id ? "1" : vecinos.has(p.id) ? "v" : "0"}
                data-nace={nace ? "1" : "0"}
                data-nota={p.nota ? "1" : "0"}
                style={estilo}
                tabIndex={0}
                role="button"
                aria-pressed={sel === p.id}
                aria-label={`${p.etiqueta}: ${p.titulo}${p.nota ? ". Con nota" : ""}. Intro para abrir su ficha, flechas para mover, Suprimir para quitar.`}
                onPointerDown={(e) => alBajar(e, p.id)}
                onPointerMove={alMover}
                onPointerUp={(e) => alSoltar(e)}
                onPointerCancel={(e) => alSoltar(e, true)}
                onKeyDown={(e) => alTecla(e, p.id)}
              >
                <Miniatura p={p} clase="zc-carta-img" />
                <span className="zc-carta-et">{p.etiqueta}</span>
                <b className="zc-carta-t">{p.titulo}</b>
                {p.nota && (
                  <span className="zc-carta-nota" aria-hidden title={p.nota}>
                    ✎
                  </span>
                )}
              </li>
            );
          })}
        </ul>

        {enlazando && (
          <div className="zc-banda" role="status">
            <span>Toca otra pieza para unirla con «{nombreDe(enlazando)}»</span>
            <button type="button" onClick={() => setEnlazando(null)}>
              Cancelar
            </button>
          </div>
        )}
      </div>

      {/* la ficha de la pieza elegida */}
      {elegida && !enlazando && (
        <aside className="zc-ficha" aria-label={`Ficha: ${elegida.titulo}`} key={elegida.id}>
          <button type="button" className="zc-ficha-cerrar" onClick={() => setSel(null)} aria-label="Cerrar la ficha">
            ×
          </button>
          <Miniatura p={elegida} clase="zc-ficha-img" />
          <div className="zc-ficha-cuerpo">
            <span className="zc-res-et">{elegida.etiqueta}</span>
            <h2 className="zc-ficha-t">{elegida.titulo}</h2>
            {elegida.sub && <p className="zc-ficha-sub">{elegida.sub}</p>}
            <p className="zc-ficha-meta">
              {[elegida.credito, fechaCorta(elegida.fecha)].filter(Boolean).join(" · ")}
            </p>
            <label className="zc-ficha-nota">
              <span>Tu nota</span>
              <textarea
                value={elegida.nota ?? ""}
                onChange={(e) => anotar(elegida.id, e.target.value)}
                placeholder="Por qué importa, qué falta comprobar…"
                maxLength={MAX_NOTA}
                rows={2}
              />
              <small>{(elegida.nota ?? "").length}/{MAX_NOTA}</small>
            </label>
            {vecinos.size > 0 && (
              <div className="zc-ficha-enl">
                <span>Unida a</span>
                {[...vecinos].map((v) => (
                  <button key={v} type="button" onClick={() => setSel(v)}>
                    {nombreDe(v)}
                  </button>
                ))}
              </div>
            )}
            <div className="zc-ficha-acc">
              <Link href={elegida.ruta} className="zc-pegar">
                Abrir →
              </Link>
              <button type="button" className="zc-abrir" onClick={() => abrir(semilla(elegida.titulo) || elegida.titulo)}>
                ✦ Relacionado
              </button>
              {piezas.length > 1 && (
                <button
                  type="button"
                  className="zc-abrir"
                  onClick={() => {
                    setEnlazando(elegida.id);
                    setAviso(`Toca otra pieza para unirla con «${elegida.titulo}».`);
                  }}
                >
                  ⟷ Enlazar
                </button>
              )}
              <button type="button" className="zc-abrir zc-quitar" onClick={() => quitar(elegida.id)}>
                Quitar
              </button>
            </div>
          </div>
        </aside>
      )}

      <div className="zc-pie">
        <p>
          {piezas.length
            ? `${piezas.length} ${piezas.length === 1 ? "pieza" : "piezas"}${enlaces.length ? ` · ${enlaces.length} ${enlaces.length === 1 ? "enlace" : "enlaces"}` : ""} en tu Zona Cero`
            : "Tu Zona Cero está vacía: toca el ojo para empezar"}
          <span> · se guarda solo en este aparato</span>
        </p>
        <div className="zc-pie-acc">
          {piezas.length > 1 && (
            <button type="button" onClick={ordenar}>
              Ordenar
            </button>
          )}
          {piezas.length > 0 && (
            <>
              <button type="button" onClick={copiar}>
                Copiar
              </button>
              <button type="button" onClick={exportar}>
                Exportar
              </button>
              <button
                type="button"
                onClick={() => {
                  let dentro = 0;
                  let fallos = 0;
                  for (const p of piezas) {
                    const r = anotarEnCuaderno(encargoDe(p));
                    if (r.ok) dentro = r.dentro;
                    else fallos += 1;
                  }
                  setAviso(
                    fallos === 0
                      ? `Las ${piezas.length} piezas están en EL CUADERNO (${dentro} dentro). El tablero sigue aquí.`
                      : `${piezas.length - fallos} piezas pasaron al Cuaderno; ${fallos} no pudieron.`
                  );
                }}
                title="Copiar todo este tablero a EL CUADERNO (el tablero no se toca)"
              >
                Al Cuaderno ↦
              </button>
            </>
          )}
          <button type="button" onClick={() => archivo.current?.click()}>
            Importar
          </button>
          <input ref={archivo} type="file" accept="application/json,.json" hidden onChange={importar} />
          {piezas.length > 0 && (
            <button type="button" onClick={vaciar}>
              Vaciar
            </button>
          )}
          <a href="#teatro-global" className="zc-bajar">
            Teatro Global <span aria-hidden>↓</span>
          </a>
        </div>
      </div>

      {piezas.length > 0 && (
        <details className="zc-lista">
          <summary>Ver tu Zona Cero como lista</summary>
          <ol>
            {piezas.map((p) => (
              <li key={p.id}>
                <span className="zc-lista-et">{p.etiqueta}</span>
                <Link href={p.ruta}>{p.titulo}</Link>
                {p.nota && <em className="zc-lista-nota">— {p.nota}</em>}
                <button
                  type="button"
                  onClick={() => setAviso(avisarEnvio(p.titulo, anotarEnCuaderno(encargoDe(p))))}
                  aria-label={`Anotar ${p.titulo} en EL CUADERNO`}
                >
                  Al Cuaderno
                </button>
                <button type="button" onClick={() => quitar(p.id)} aria-label={`Quitar ${p.titulo}`}>
                  Quitar
                </button>
              </li>
            ))}
          </ol>
        </details>
      )}

      {deshacer && (
        <div className="zc-tostada" role="status">
          <span>{deshacer.texto}</span>
          <button
            type="button"
            onClick={() => {
              setTab(deshacer.antes);
              setDeshacer(null);
              setAviso("Hecho: se deshizo el último cambio.");
            }}
          >
            Deshacer
          </button>
        </div>
      )}

      {abierto && (
        <div className="zc-buscador" role="dialog" aria-modal="true" aria-label="Buscar en todo Vanguard" onClick={cerrar}>
          <div className="zc-caja" onClick={(e) => e.stopPropagation()}>
            <div className="zc-caja-cab">
              <OjoVanguard className="zc-mini-ojo" />
              <input
                ref={entrada}
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={alTeclaBuscar}
                placeholder="Un país, una guerra, un arma, una sala…"
                aria-label="Buscar en todo Vanguard"
                aria-controls="zc-resultados"
                aria-activedescendant={res?.piezas[activo] ? `zc-r-${activo}` : undefined}
                enterKeyHint="search"
                maxLength={64}
                autoComplete="off"
              />
              <button type="button" className="zc-cerrar" onClick={cerrar} aria-label="Cerrar el buscador">
                ×
              </button>
            </div>
            <div className="zc-filtros" role="group" aria-label="Filtrar hallazgos">
              {FILTROS.map((f) => (
                <button key={f.id} type="button" aria-pressed={filtro === f.id} onClick={() => setFiltro(f.id)}>
                  {f.label}
                </button>
              ))}
            </div>
            {q.trim().length < 2 && recientes.length > 0 && (
              <div className="zc-recientes">
                <span>Recientes</span>
                {recientes.map((r) => (
                  <button key={r} type="button" onClick={() => setQ(r)}>
                    {r}
                  </button>
                ))}
              </div>
            )}
            <p className="zc-estado" aria-live="polite">
              {estado}
              {res && res.piezas.length > 0 && <span className="zc-pista"> · ↑ ↓ para elegir, Intro para pegar</span>}
            </p>
            <ul className="zc-resultados" id="zc-resultados" ref={lista} data-cargando={cargando ? "1" : "0"}>
              {res?.piezas.map((p, i) => {
                const ya = piezas.some((x) => x.id === p.id);
                return (
                  <li key={p.id} id={`zc-r-${i}`} className="zc-res" data-clase={p.clase} data-activo={i === activo ? "1" : "0"} onPointerEnter={() => setActivo(i)}>
                    <Miniatura p={p} clase="zc-res-img" />
                    <div className="zc-res-txt">
                      <span className="zc-res-et">{p.etiqueta}</span>
                      <b>{p.titulo}</b>
                      <span className="zc-res-sub">{p.sub}</span>
                      {p.credito && <span className="zc-res-cred">{p.credito}</span>}
                    </div>
                    <div className="zc-res-acc">
                      <button type="button" className="zc-pegar" data-ya={ya ? "1" : "0"} aria-pressed={ya} onClick={() => pegar(p)}>
                        {ya ? "✓ Pegada" : "✦ Pegar"}
                      </button>
                      <Link href={p.ruta} className="zc-abrir" onClick={() => setAbierto(false)}>
                        Abrir →
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
            {res && !cargando && !error && res.piezas.length === 0 && (
              <p className="zc-vacio">Nada con ese filtro. Prueba «Todo» u otra palabra.</p>
            )}
            <p className="zc-caja-pie">
              {piezas.length} / {MAX_PIEZAS} piezas pegadas
              <button type="button" onClick={cerrar}>
                Ver mi Zona Cero
              </button>
            </p>
          </div>
        </div>
      )}

      <p className="sr-only" aria-live="polite">
        {aviso}
      </p>
    </section>
  );
}
