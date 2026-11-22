"use client";
// ═══════════════════════════════════════════════════════════════════
// v442.0 · LA OSCURIDAD PROFUNDA — la capa que envuelve toda la casa
//
// ① EL CLIMA DE FONDO: un lienzo fijo, sin eventos de puntero, que se
//    turna entre ocho escenas (lluvia, tormenta, sol, niebla, nieve,
//    estrellas, aurora, brasas) cada 70–140 s con un fundido de 6 s. Muy
//    tenue y con máscara: se siente en los bordes y casi no toca el texto.
// ② LA VIÑETA: la oscuridad que rodea cada página (CSS puro).
// ③ LOS MÓDULOS SALEN DE LA OSCURIDAD: las tarjetas .vx-mod nacen hundidas
//    en sombra y emergen despacio al tocarlas, al pasar el ratón o, en el
//    teléfono, al cruzar el centro de la pantalla; la luz sigue al dedo.
//
// Reglas de la casa: nunca durante la entrada (html[data-vi]), se para con
// la pestaña oculta, en el modo ligero y con las animaciones desactivadas;
// con «reducir movimiento» queda un fotograma quieto. Lienzo a media
// resolución y 30 fps (20 en aparatos modestos). Nada se envía a ningún sitio.
// ═══════════════════════════════════════════════════════════════════
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { ESCENAS, crearEscena, elegirEscena, type Escena, type NombreEscena } from "./escenas";

const RUTAS_SIN_CLIMA = ["/vanguard2", "/teatro-3d"];
const FUNDIDO = 6;

function entradaActiva(H: HTMLElement) {
  const vi = H.getAttribute("data-vi");
  return vi === "a" || vi === "go" || vi === "puerta" || vi === "fin";
}

export function OscuridadVanguard() {
  const lienzo = useRef<HTMLCanvasElement>(null);
  const ruta = usePathname() ?? "/";
  const sinClima = RUTAS_SIN_CLIMA.some((r) => ruta.startsWith(r));

  // ─────────── ① el clima ───────────
  useEffect(() => {
    const cv = lienzo.current;
    if (!cv || sinClima) return;
    const H = document.documentElement;
    const ctx = cv.getContext("2d", { alpha: true });
    if (!ctx) return;

    const quieto = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const modesto = H.getAttribute("data-vg-anim") === "reducidas" || (navigator.hardwareConcurrency ?? 8) <= 4;
    const densidad = modesto ? 0.55 : 1;
    const intervalo = 1000 / (modesto ? 20 : 30);
    const ESCALA = modesto ? 0.4 : 0.5;

    let w = 0;
    let h = 0;
    const medir = () => {
      w = Math.max(1, Math.round(window.innerWidth * ESCALA));
      h = Math.max(1, Math.round(window.innerHeight * ESCALA));
      cv.width = w;
      cv.height = h;
      actual?.iniciar(w, h, densidad);
      saliente?.iniciar(w, h, densidad);
    };

    let actual: Escena | null = null;
    let saliente: Escena | null = null;
    let fundido = 1; // 0 → 1 mientras entra la escena nueva
    let cambio = 0;
    let raf = 0;
    let ultimo = 0;
    let t = 0;
    let vivo = false;

    // ?clima=tormenta fuerza la primera escena (para ver una concreta).
    const pedida = new URLSearchParams(window.location.search).get("clima");
    let forzada: NombreEscena | null = pedida && (ESCENAS as string[]).includes(pedida) ? (pedida as NombreEscena) : null;
    const nueva = () => {
      const n = forzada ?? elegirEscena(new Date().getHours(), actual?.nombre);
      forzada = null;
      saliente = actual;
      actual = crearEscena(n);
      actual.iniciar(w, h, densidad);
      fundido = saliente ? 0 : 1;
      cambio = 70 + Math.random() * 70;
      H.setAttribute("data-vg-clima", n);
    };

    const pintar = (dt: number) => {
      ctx.clearRect(0, 0, w, h);
      if (saliente && fundido < 1) saliente.pintar(ctx, w, h, dt, t, 1 - fundido);
      actual?.pintar(ctx, w, h, dt, t, saliente ? fundido : Math.min(1, fundido));
    };

    const bucle = (ahora: number) => {
      raf = requestAnimationFrame(bucle);
      if (ahora - ultimo < intervalo) return;
      const dt = Math.min(0.1, (ahora - ultimo) / 1000 || 0.033);
      ultimo = ahora;
      t += dt;
      cambio -= dt;
      if (fundido < 1) {
        fundido = Math.min(1, fundido + dt / FUNDIDO);
        if (fundido >= 1) saliente = null;
      }
      if (cambio <= 0) nueva();
      pintar(dt);
    };

    const debeCorrer = () =>
      !document.hidden && !entradaActiva(H) && H.getAttribute("data-vx-ligero") !== "1" && H.getAttribute("data-vg-anim") !== "desactivadas";

    const arrancar = () => {
      if (vivo || quieto) return;
      vivo = true;
      ultimo = performance.now();
      raf = requestAnimationFrame(bucle);
    };
    const parar = () => {
      vivo = false;
      cancelAnimationFrame(raf);
    };
    const revisar = () => {
      const ok = debeCorrer();
      cv.dataset.on = ok ? "1" : "0";
      if (!ok) return parar();
      if (quieto) {
        // Un solo fotograma quieto: la atmósfera está, pero no se mueve.
        t = 3;
        pintar(0.016);
        return;
      }
      arrancar();
    };

    medir();
    nueva();
    fundido = 0; // la primera escena también entra con fundido

    let tRes = 0;
    const alRedimensionar = () => {
      clearTimeout(tRes);
      tRes = window.setTimeout(medir, 200);
    };
    window.addEventListener("resize", alRedimensionar, { passive: true });
    document.addEventListener("visibilitychange", revisar);
    const mo = new MutationObserver(revisar);
    mo.observe(H, { attributes: true, attributeFilter: ["data-vi", "data-vx-ligero", "data-vg-anim"] });

    // Arranca cuando el navegador está libre: no compite con la primera pintura.
    const ric = (window as unknown as { requestIdleCallback?: (f: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
    const tArranque = window.setTimeout(() => (ric ? ric(revisar, { timeout: 2500 }) : revisar()), 1200);

    return () => {
      parar();
      clearTimeout(tArranque);
      clearTimeout(tRes);
      window.removeEventListener("resize", alRedimensionar);
      document.removeEventListener("visibilitychange", revisar);
      mo.disconnect();
      H.removeAttribute("data-vg-clima");
    };
  }, [sinClima]);

  // ─────────── ③ los módulos salen de la oscuridad ───────────
  useEffect(() => {
    const H = document.documentElement;
    H.setAttribute("data-vg-oscuridad", "1");
    const tactil = window.matchMedia?.("(hover: none)").matches ?? false;

    const vistos = new IntersectionObserver(
      (es) => {
        for (const e of es) {
          if (e.isIntersecting) {
            (e.target as HTMLElement).dataset.emerge = "1";
            vistos.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.15 }
    );
    // En el teléfono no hay ratón: la tarjeta que cruza el centro se enciende.
    const centro = tactil
      ? new IntersectionObserver(
          (es) => {
            for (const e of es) (e.target as HTMLElement).dataset.luz = e.isIntersecting ? "1" : "0";
          },
          { rootMargin: "-36% 0px -36% 0px", threshold: 0 }
        )
      : null;

    const preparar = (raiz: ParentNode) => {
      raiz.querySelectorAll<HTMLElement>(".vx-mod:not([data-emerge])").forEach((el) => {
        const r = el.getBoundingClientRect();
        // Lo que ya está en pantalla al llegar no se esconde: emerge de inmediato.
        el.dataset.emerge = r.top < window.innerHeight && r.bottom > 0 ? "1" : "0";
        if (el.dataset.emerge === "0") vistos.observe(el);
        centro?.observe(el);
      });
    };
    preparar(document);
    // Tarjetas que llegan tarde (navegación en cliente): una pasada agrupada.
    let tPrep = 0;
    const mo = new MutationObserver((ms) => {
      if (tPrep) return;
      if (!ms.some((m) => m.addedNodes.length > 0)) return;
      tPrep = window.setTimeout(() => {
        tPrep = 0;
        preparar(document);
      }, 300);
    });
    mo.observe(document.body, { childList: true, subtree: true });

    // La luz sigue al dedo o al ratón (una variable CSS por fotograma).
    let raf = 0;
    let objetivo: HTMLElement | null = null;
    let px = 0;
    let py = 0;
    const aplicar = () => {
      raf = 0;
      if (!objetivo) return;
      const r = objetivo.getBoundingClientRect();
      objetivo.style.setProperty("--vg-lx", `${(((px - r.left) / r.width) * 100).toFixed(1)}%`);
      objetivo.style.setProperty("--vg-ly", `${(((py - r.top) / r.height) * 100).toFixed(1)}%`);
    };
    const mover = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest?.(".vx-mod") as HTMLElement | null;
      if (!el) return;
      objetivo = el;
      px = e.clientX;
      py = e.clientY;
      if (e.type === "pointerdown") el.dataset.luz = "1";
      if (!raf) raf = requestAnimationFrame(aplicar);
    };
    document.addEventListener("pointermove", mover, { passive: true });
    document.addEventListener("pointerdown", mover, { passive: true });

    return () => {
      vistos.disconnect();
      centro?.disconnect();
      mo.disconnect();
      clearTimeout(tPrep);
      cancelAnimationFrame(raf);
      document.removeEventListener("pointermove", mover);
      document.removeEventListener("pointerdown", mover);
    };
  }, [ruta]);

  return (
    <>
      <canvas ref={lienzo} className="vg-clima" aria-hidden="true" data-on="0" hidden={sinClima} />
      <div className="vg-sombra" aria-hidden="true" />
    </>
  );
}
