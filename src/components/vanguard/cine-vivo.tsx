"use client";

// VANGUARD v96.0 · GOOGLE VIVO — MOTOR CINE VIVO
// Tres capas globales que hacen que TODO el juego respire animación:
//   1. IMÁGENES ÉPICAS: toda imagen que entra en viewport se estrena con
//      escala + desenfoque + saturación (clase .img-in auto-aplicada).
//   2. REVEALS: cualquier elemento con .rv/.rv-l/.rv-r/.rv-z/.rv-clip
//      se revela al entrar en pantalla (con stagger vía --rvd).
//   3. PARALLAX: elementos con data-parallax="0.2" se desplazan al hacer
//      scroll (rAF + transform, cero re-render).
// Un MutationObserver vigila el DOM: los paneles con carga perezosa también
// reciben su estreno cuando aparecen. Respeta prefers-reduced-motion.
import { useEffect } from "react";

const REDUCED = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function CineVivo() {
  useEffect(() => {
    if (REDUCED()) return;

    // ── observadores compartidos ──
    const imgIO = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const el = e.target as HTMLElement;
            el.classList.add("img-in");
            imgIO.unobserve(el);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
    );

    const rvIO = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const el = e.target as HTMLElement;
            el.classList.add("in");
            rvIO.unobserve(el);
          }
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.08 }
    );

    const procesados = new WeakSet<Element>();

    const escanear = () => {
      // 1. imágenes: estreno épico (excepto logos/iconos svg y ya estrenadas)
      document.querySelectorAll("main img:not(.img-in):not(.no-cine)").forEach((img) => {
        if (procesados.has(img)) return;
        procesados.add(img);
        // las imágenes ya visibles al cargar estrenan igual, con un micro-delay escalonado
        imgIO.observe(img);
      });
      // 2. reveals declarados
      document.querySelectorAll(".rv:not(.in), .rv-l:not(.in), .rv-r:not(.in), .rv-z:not(.in), .rv-clip:not(.in)").forEach((el) => {
        if (procesados.has(el)) return;
        procesados.add(el);
        rvIO.observe(el);
      });
    };

    // primer barrido (los paneles dinámicos pueden llegar tarde)
    escanear();
    const t1 = setTimeout(escanear, 400);
    const t2 = setTimeout(escanear, 1200);

    // vigilancia de DOM: paneles con carga perezosa y contenido nuevo
    const mo = new MutationObserver(() => escanear());
    mo.observe(document.body, { childList: true, subtree: true });

    // ── parallax por scroll (rAF, solo transform) ──
    let ticking = false;
    let parallaxEls: { el: HTMLElement; f: number }[] = [];
    const recolectar = () => {
      parallaxEls = Array.from(document.querySelectorAll<HTMLElement>("[data-parallax]")).map((el) => ({
        el,
        f: parseFloat(el.dataset.parallax || "0.15") || 0.15,
      }));
    };
    recolectar();
    const moP = new MutationObserver(recolectar);
    moP.observe(document.body, { childList: true, subtree: true });

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const vh = window.innerHeight;
        for (const { el, f } of parallaxEls) {
          const r = el.getBoundingClientRect();
          if (r.bottom < -80 || r.top > vh + 80) continue;
          const centro = (r.top + r.height / 2 - vh / 2) / vh; // -0.5..0.5 aprox
          el.style.transform = `translate3d(0, ${(-centro * f * 120).toFixed(1)}px, 0)`;
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      imgIO.disconnect();
      rvIO.disconnect();
      mo.disconnect();
      moP.disconnect();
      window.removeEventListener("scroll", onScroll);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return null;
}
