"use client";
// ═══════════════════════════════════════════════════════════════════
// v440.3 · VANGUARD CINEMATIC EXPERIENCE — el disparador.
//
// Pesa poco y vive en toda la casa. Decide CUÁNDO toca cada pieza y solo
// entonces carga la escena (import() perezoso). Cada experiencia tiene su
// momento y nunca coinciden:
//
//   1 · EL DESPERTAR DEL OJO ........ la primera vez que entras en una sala
//                                      especial (Zona Cero, Espía, Oscura…).
//                                      Después queda el ojo centinela.
//   2 · EL NACIMIENTO DE LA V ........ al completar algo importante: 5, 12,
//                                      25, 45 y 70 salas descubiertas, o un
//                                      módulo que avisa con «vg:logro».
//   3 · EL PLANETA VANGUARD .......... al entrar en mapas / exploración global
//                                      (una vez por semana).
//   4 · EL RADAR DE LOS ACONTECIMIENTOS cuando hay novedad real: una versión
//                                      nueva de la casa desde tu última visita.
//   5 · EL UNIVERSO DE LOS MÓDULOS ... al explorar el catálogo (/modulos,
//                                      /catalogo), cada tres días.
//   + DESTELLOS: tras minutos explorando, sorpresas pequeñas nunca vistas.
//
// Topes: nunca durante la entrada, 90 s mínimo entre piezas, 3 por sesión.
// `?cine=ojo|v|planeta|radar|portales|d-anillo…` fuerza una (pruebas).
// Movimiento reducido o «animaciones desactivadas» elegidas a mano: no hay
// película; el radar deja una tarjeta quieta con las novedades.
// ═══════════════════════════════════════════════════════════════════
import { useCallback, useEffect, useRef, useState, type ComponentType } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { DatosCine, ExtraCine, FinCine, Material, PortalCine, TipoDestello, TipoEscena } from "./tipos";
import type { EscenaProps } from "./cine-escena";

const CLAVE = "vg-cine:v1";
const ESPECIALES = ["/zona-cero", "/espia", "/oscura", "/servicios", "/informacion"];
const MAPAS = ["/mapas", "/mundo", "/mundos", "/worlds", "/atlas", "/tierra"];
const CATALOGO = ["/modulos", "/catalogo"];
const HITOS = [5, 12, 25, 45, 70];
const DESTELLOS: TipoDestello[] = ["d-anillo", "d-ojo", "d-v", "d-radar", "d-portal"];
const DIA = 86400000;
const COLORES: Record<string, string> = {
  redaccion: "232,110,90",
  mundo: "110,200,235",
  saber: "175,145,240",
  casa: "232,197,106",
};
const MATERIAL: Record<string, Material> = { saber: "metal", mundo: "cristal", redaccion: "lineas", casa: "particulas" };

type Estado = { r: Record<string, 1>; h: Record<string, number>; v?: string; u?: number; d?: number };
function leer(): Estado {
  try {
    const e = JSON.parse(localStorage.getItem(CLAVE) || "{}") as Partial<Estado>;
    return { r: e.r ?? {}, h: e.h ?? {}, v: e.v, u: e.u, d: e.d };
  } catch {
    return { r: {}, h: {} };
  }
}
function guardar(e: Estado) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(e));
  } catch {
    /* sin almacenamiento la casa sigue igual */
  }
}
function ses(k: string, v?: number): number {
  try {
    if (v != null) sessionStorage.setItem("vg-cine:" + k, String(v));
    return Number(sessionStorage.getItem("vg-cine:" + k) || 0);
  } catch {
    return 0;
  }
}
const coincide = (ruta: string, base: string) => ruta === base || ruta.startsWith(base + "/");

/** ¿quiere quietud? movimiento reducido del sistema o elección explícita en Ajustes */
function quieto(): boolean {
  try {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
    const c = JSON.parse(localStorage.getItem("vx435-config") || "{}") as { anim?: string; ligero?: string };
    return c.anim === "desactivadas" || c.ligero === "si";
  } catch {
    return false;
  }
}
function introActiva(): boolean {
  const v = document.documentElement.getAttribute("data-vi");
  return !!v && v !== "fuera";
}

type Activa = { tipo: TipoEscena; material?: Material; extra?: ExtraCine };

export function CineDisparador({ datos }: { datos: DatosCine }) {
  const ruta = (usePathname() || "/").replace(/(.)\/$/, "$1");
  const router = useRouter();
  const [activa, setActiva] = useState<Activa | null>(null);
  const [Comp, setComp] = useState<ComponentType<EscenaProps> | null>(null);
  const [aviso, setAviso] = useState<{ titulo: string; lineas: { txt: string; href?: string }[] } | null>(null);
  const [centinela, setCentinela] = useState(false);
  const ocupada = useRef(false);
  const permitido = useRef<boolean | null>(null);

  const todas = datos.modulos.flatMap((m) => m.salas);
  const salaDe = useCallback((r: string) => todas.find((h) => coincide(r, h)), [todas]);

  const esPermitido = () => {
    if (permitido.current != null) return permitido.current;
    let ok = true;
    try {
      const q = new URLSearchParams(location.search);
      const forz = q.has("cine");
      if (q.has("sin-cine")) ok = false;
      if (!forz && navigator.webdriver) ok = false;
      if (window.top !== window.self) ok = false;
      if (/^\/(embed|trailer)/.test(location.pathname)) ok = false;
      if (/bot|crawl|spider|lighthouse/i.test(navigator.userAgent)) ok = false;
    } catch {
      ok = false;
    }
    permitido.current = ok;
    return ok;
  };

  /** cuántas salas reales llevas descubiertas */
  const cuenta = (e: Estado) => Object.keys(e.r).length;

  const portales = useCallback((e: Estado): { lista: PortalCine[]; objetivo: number } => {
    const lista = datos.modulos.map((m) => {
      const vistas = m.salas.filter((h) => e.r[h]).length;
      const tono: PortalCine["tono"] = vistas === 0 ? "vacio" : m.actualizado ? "nuevo" : "visto";
      const estado = vistas === 0 ? "SIN EXPLORAR" : m.actualizado ? "ACTUALIZADO" : `${vistas}/${m.salas.length} SALAS`;
      return { nombre: m.nombre, nav: m.nav, estado, tono, color: COLORES[m.id] ?? COLORES.casa, vistas, total: m.salas.length };
    });
    let objetivo = lista.findIndex((p) => p.tono === "vacio");
    if (objetivo < 0) objetivo = lista.findIndex((p) => p.tono === "nuevo");
    if (objetivo < 0) {
      let min = Infinity;
      lista.forEach((p, i) => {
        const r = p.vistas / Math.max(1, p.total);
        if (r < min) {
          min = r;
          objetivo = i;
        }
      });
    }
    return { lista: lista.map(({ nombre, nav, estado, tono, color }) => ({ nombre, nav, estado, tono, color })), objetivo: Math.max(0, objetivo) };
  }, [datos.modulos]);

  /** lanza una pieza si toca; devuelve false si hay que esperar */
  const lanzar = useCallback(
    async (tipo: TipoEscena, op: { clave?: string; forzada?: boolean; material?: Material; extra?: ExtraCine } = {}) => {
      if (ocupada.current) return false;
      if (introActiva()) return false;
      const mini = tipo.startsWith("d-");
      const e = leer();
      const ahora = Date.now();
      if (!op.forzada) {
        if (!mini && e.u && ahora - e.u < 90000) return false;
        if (!mini && ses("n") >= 3) return false;
      }
      if (op.clave) e.h[op.clave] = ahora;
      if (!mini) {
        e.u = ahora;
        ses("n", ses("n") + 1);
      } else e.d = ahora;
      if (tipo === "radar") e.v = datos.version;
      guardar(e);
      if (quieto()) {
        // sin película: solo el radar deja su información, quieta
        if (tipo === "radar")
          setAviso({
            titulo: "Novedades de VANGUARD",
            lineas: datos.novedades.map((n) => ({ txt: `${n.version} · ${n.nombre}`, href: "/novedades" })),
          });
        return true;
      }
      ocupada.current = true;
      try {
        window.dispatchEvent(new CustomEvent("vg-cine:evento", { detail: { tipo } }));
        const m = await import("./cine-escena");
        setComp(() => m.default);
        setActiva({ tipo, material: op.material, extra: op.extra });
      } catch {
        ocupada.current = false;
      }
      return true;
    },
    [datos.novedades, datos.version],
  );

  /** reintenta hasta que la entrada termine y haya hueco */
  const intentar = useCallback(
    (tipo: TipoEscena, op: Parameters<typeof lanzar>[1], espera: number) => {
      let vivo = true;
      let n = 0;
      let id = 0;
      const prueba = async () => {
        if (!vivo) return;
        const ok = await lanzar(tipo, op);
        if (!ok && vivo && n++ < 25 && (introActiva() || ocupada.current)) id = window.setTimeout(prueba, 1500);
      };
      id = window.setTimeout(prueba, espera);
      return () => {
        vivo = false;
        clearTimeout(id);
      };
    },
    [lanzar],
  );

  // cada cambio de sala: registra la visita y mira si toca una pieza
  useEffect(() => {
    if (!esPermitido()) return;
    const e = leer();
    const sala = salaDe(ruta);
    if (sala && !e.r[sala]) {
      e.r[sala] = 1;
      guardar(e);
    }
    const esp = ESPECIALES.find((p) => coincide(ruta, p));
    setCentinela(!!esp && !!e.h["ojo:" + esp]);
    const q = new URLSearchParams(location.search).get("cine") as TipoEscena | null;
    const mod = datos.modulos.find((m) => m.salas.some((h) => coincide(ruta, h)));
    const material = MATERIAL[mod?.id ?? ""] ?? "metal";
    const etiquetas = todasEtiquetas(datos, mod?.id);
    if (q) {
      const ex: ExtraCine = { cuenta: cuenta(e), total: todas.length, etiquetas };
      if (q === "portales") {
        const p = portales(e);
        ex.portales = p.lista;
        ex.objetivo = p.objetivo;
      }
      if (q === "d-portal") {
        const p = portales(e);
        ex.modulo = { nombre: p.lista[p.objetivo].nombre, nav: p.lista[p.objetivo].nav };
      }
      return intentar(q, { forzada: true, material, extra: ex }, 900);
    }
    if (esp && !e.h["ojo:" + esp]) return intentar("ojo", { clave: "ojo:" + esp, extra: { etiquetas } }, 1200);
    if (MAPAS.some((p) => coincide(ruta, p)) && !(e.h.planeta && Date.now() - e.h.planeta < 7 * DIA))
      return intentar("planeta", { clave: "planeta" }, 600);
    if (CATALOGO.includes(ruta) && !(e.h.portales && Date.now() - e.h.portales < 3 * DIA)) {
      const p = portales(e);
      return intentar("portales", { clave: "portales", extra: { portales: p.lista, objetivo: p.objetivo } }, 900);
    }
    const n = cuenta(e);
    const hito = HITOS.filter((h) => n >= h && !e.h["v:" + h]).pop();
    if (hito) return intentar("v", { clave: "v:" + hito, material, extra: { cuenta: n } }, 2500);
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ruta]);

  // el reloj de exploración: radar de novedades y destellos
  useEffect(() => {
    if (!esPermitido()) return;
    const cargada = Date.now();
    const id = window.setInterval(() => {
      if (document.hidden) return;
      const tiempo = ses("t", ses("t") + 5);
      if (ocupada.current || introActiva()) return;
      const e = leer();
      const ahora = Date.now();
      const clave = "radar:" + datos.version;
      if (!e.h[clave] && datos.novedades.length) {
        const nueva = !!e.v && e.v !== datos.version;
        if ((nueva && ahora - cargada > 15000) || (!e.v && tiempo >= 240)) {
          void lanzar("radar", { clave });
          return;
        }
      }
      // destellos: tras 3 min, uno cada 2,5–4 min, máx. 4 por sesión
      if (tiempo < 180 || ses("d") >= 4) return;
      if (e.u && ahora - e.u < 60000) return;
      const espera = 150000 + (ses("dj") || (ses("dj", Math.floor(Math.random() * 90000)) as number));
      if (e.d && ahora - e.d < espera) return;
      const nuevos = DESTELLOS.filter((d) => !e.h[d]);
      const tipo = nuevos.length ? nuevos[0] : DESTELLOS[Math.floor(Math.random() * DESTELLOS.length)];
      const extra: ExtraCine = { cuenta: cuenta(e), total: todas.length };
      if (tipo === "d-portal") {
        const p = portales(e);
        const o = p.lista[p.objetivo];
        if (o.tono === "vacio") extra.modulo = { nombre: o.nombre, nav: o.nav };
      }
      ses("d", ses("d") + 1);
      ses("dj", Math.floor(Math.random() * 90000));
      void lanzar(tipo, { clave: tipo, extra });
    }, 5000);
    // los módulos pueden avisar de un logro real: window.dispatchEvent(new CustomEvent("vg:logro", {detail:{id, texto}}))
    const logro = (ev: Event) => {
      const d = (ev as CustomEvent<{ id?: string; texto?: string }>).detail ?? {};
      const clave = "logro:" + (d.id ?? location.pathname);
      const e = leer();
      if (e.h[clave]) return;
      const mod = datos.modulos.find((m) => m.salas.some((h) => coincide(location.pathname, h)));
      void lanzar("v", { clave, material: MATERIAL[mod?.id ?? ""] ?? "metal", extra: { cuenta: cuenta(e), texto: d.texto } });
    };
    window.addEventListener("vg:logro", logro);
    return () => {
      clearInterval(id);
      window.removeEventListener("vg:logro", logro);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fin = (r?: FinCine) => {
    const era = activa?.tipo;
    setActiva(null);
    ocupada.current = false;
    if (era === "ojo") {
      const esp = ESPECIALES.find((p) => coincide(location.pathname, p));
      if (esp) setCentinela(true);
    }
    if (r?.ir) router.push(r.ir);
    else if (era === "portales" && activa?.extra?.portales) {
      const o = activa.extra.portales[activa.extra.objetivo ?? 0];
      if (o) setAviso({ titulo: "La cámara te deja en la puerta", lineas: [{ txt: `Entrar en ${o.nombre} →`, href: o.nav }] });
    }
  };

  // el aviso se va solo
  useEffect(() => {
    if (!aviso) return;
    const id = window.setTimeout(() => setAviso(null), 9000);
    return () => clearTimeout(id);
  }, [aviso]);

  return (
    <>
      {activa && Comp && <Comp tipo={activa.tipo} datos={datos} material={activa.material} extra={activa.extra} onFin={fin} />}
      {aviso && (
        <div className="vc-aviso" role="status">
          <b>{aviso.titulo}</b>
          {aviso.lineas.map((l, i) =>
            l.href ? (
              <a
                key={i}
                href={l.href}
                onClick={(ev) => {
                  ev.preventDefault();
                  setAviso(null);
                  router.push(l.href as string);
                }}
              >
                {l.txt}
              </a>
            ) : (
              <span key={i}>{l.txt}</span>
            ),
          )}
          <button type="button" aria-label="Cerrar" onClick={() => setAviso(null)}>
            ×
          </button>
        </div>
      )}
      {centinela && !activa && (
        <OjoCentinela
          onClick={() => {
            const esp = ESPECIALES.find((p) => coincide(location.pathname, p));
            const mod = datos.modulos.find((m) => m.salas.some((h) => coincide(location.pathname, h)));
            void lanzar("ojo", { forzada: true, extra: { etiquetas: todasEtiquetas(datos, mod?.id) }, clave: esp ? "ojo:" + esp : undefined });
          }}
        />
      )}
    </>
  );
}

/** las etiquetas reales de las salas del módulo (o de todos) para orbitar el ojo */
function todasEtiquetas(d: DatosCine, id?: string): string[] {
  const m = d.modulos.find((x) => x.id === id);
  const fuente = m ? [m] : d.modulos;
  return fuente.map((x) => x.nombre).concat(d.ventanas.map((v) => v.label)).slice(0, 8);
}

// ── el ojo centinela: queda en las salas especiales y reacciona ─────
function OjoCentinela({ onClick }: { onClick: () => void }) {
  const iris = useRef<SVGGElement>(null);
  const ojo = useRef<SVGGElement>(null);
  const aro = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const quietud = quieto();
    let raf = 0;
    let mx = 0;
    const mover = (e: PointerEvent) => {
      if (quietud) return;
      mx = cl2((e.clientX / window.innerWidth) * 2 - 1);
      if (!raf)
        raf = requestAnimationFrame(() => {
          raf = 0;
          iris.current?.setAttribute("transform", `translate(${(mx * 6).toFixed(1)} 0)`);
        });
    };
    // parpadeo con WAAPI: el modo ligero no lo toca
    let id = 0;
    const parpadea = () => {
      if (!quietud && ojo.current?.animate)
        ojo.current.animate([{ transform: "scaleY(1)" }, { transform: "scaleY(.08)" }, { transform: "scaleY(1)" }], { duration: 260, easing: "ease-in-out" });
      id = window.setTimeout(parpadea, 3500 + Math.random() * 4000);
    };
    id = window.setTimeout(parpadea, 2500);
    // reacciona a los acontecimientos de la casa (novedad, logro, pieza)
    const evento = () => {
      aro.current?.animate?.([{ transform: "scale(.6)", opacity: 0.9 }, { transform: "scale(2.4)", opacity: 0 }], { duration: 900, easing: "ease-out" });
    };
    window.addEventListener("pointermove", mover, { passive: true });
    window.addEventListener("vg-cine:evento", evento);
    window.addEventListener("vg:logro", evento);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(id);
      window.removeEventListener("pointermove", mover);
      window.removeEventListener("vg-cine:evento", evento);
      window.removeEventListener("vg:logro", evento);
    };
  }, []);
  return (
    <button type="button" className="vc-centinela" onClick={onClick} aria-label="El ojo de Vanguard observa esta sala · repetir El despertar del ojo" title="El ojo de Vanguard observa esta sala">
      <span ref={aro} className="vc-centinela-aro" aria-hidden="true" />
      <svg viewBox="80 180 360 160" width="46" height="22" aria-hidden="true">
        <g ref={ojo} style={{ transformOrigin: "260px 260px" }}>
          <path d="M98 260 Q260 118 422 260 Q260 402 98 260Z" fill="#07090d" stroke="#e8c56a" strokeWidth="14" strokeLinejoin="round" />
          <g ref={iris}>
            <circle cx="260" cy="260" r="62" fill="#e8c56a" />
            <circle cx="260" cy="260" r="30" fill="#050608" />
          </g>
        </g>
      </svg>
    </button>
  );
}
const cl2 = (x: number) => (x < -1 ? -1 : x > 1 ? 1 : x);
