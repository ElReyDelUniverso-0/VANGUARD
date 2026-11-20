"use client";

// ═══════════════════════════════════════════════════════════════════
// v422.3 · LA ÓRBITA 2 — el menú que se siente como abrir una consola
//
//   · Botón magnético: se inclina hacia el puntero y lleva un anillo cónico
//     girando. Es lo primero que se ve de VIDA, así que tenía que ser un objeto.
//   · Al abrir, un VELO oscurece y desenfoca el resto: la órbita manda.
//   · BUSCADOR: escribes «ma» y quedan Mapa 3D, Mapas, … en el momento.
//   · DOS GRUPOS: los módulos de la casa y tu lado (Mi universo, tu mesa…).
//   · Teclado: Esc cierra, las flechas recorren, Enter entra. Foco devuelto
//     al botón al cerrar (nadie se queda perdido).
//   · Cada puerta que abres ANOTA su impresión: el menú también enseña.
//   · No existe en /vanguard2: ahí manda el 3D.
// ═══════════════════════════════════════════════════════════════════
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { MODULOS } from "@/components/portada/modulos";
import { PALETA } from "@/lib/vida/algoritmo";
import { anotar } from "@/lib/vida/senal";

const EXTRAS = [
  { id: "mi-universo", nombre: "Mi universo", href: "/mi-universo" },
  { id: "arquitectura", nombre: "La arquitectura", href: "/navegacion" },
  { id: "mesa", nombre: "Mi mesa de trabajo", href: "/espacio" },
  { id: "ecosistema", nombre: "El ecosistema", href: "/ecosistema" },
];

type Entrada = { id: string; nombre: string; grupo: string; href: string; acento: string };

const ENTRADAS: Entrada[] = [
  ...MODULOS.map((m, i) => ({
    id: m.id,
    nombre: m.nombre,
    grupo: "Módulos",
    href: m.nav,
    acento: PALETA[i % PALETA.length],
  })),
  ...EXTRAS.map((e, i) => ({
    ...e,
    grupo: "Tu lado",
    acento: PALETA[(MODULOS.length + i) % PALETA.length],
  })),
];

/** sin acentos, en minúsculas: «mapa» encuentra «Mapa 3D» */
const plano = (t: string) =>
  t
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export function Orbita() {
  const ruta = usePathname();
  const [abierto, setAbierto] = useState(false);
  const [q, setQ] = useState("");
  const caja = useRef<HTMLDivElement>(null);
  const boton = useRef<HTMLButtonElement>(null);
  const busca = useRef<HTMLInputElement>(null);

  const lista = useMemo(() => {
    const t = plano(q.trim());
    if (!t) return ENTRADAS;
    return ENTRADAS.filter((e) => plano(e.nombre + " " + e.href + " " + e.grupo).includes(t));
  }, [q]);

  const grupos = useMemo(() => {
    const out: { nombre: string; items: Entrada[] }[] = [];
    for (const e of lista) {
      const g = out.find((x) => x.nombre === e.grupo);
      if (g) g.items.push(e);
      else out.push({ nombre: e.grupo, items: [e] });
    }
    return out;
  }, [lista]);

  // cerrar al cambiar de sala
  useEffect(() => {
    setAbierto(false);
    setQ("");
  }, [ruta]);

  // abierto: Esc, clic fuera y flechas
  useEffect(() => {
    if (!abierto) return;
    const t = window.setTimeout(() => busca.current?.focus(), 70);
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAbierto(false);
        boton.current?.focus();
        return;
      }
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      const enlaces = caja.current?.querySelectorAll<HTMLAnchorElement>(".vida-orbita-lista a");
      if (!enlaces || enlaces.length === 0) return;
      e.preventDefault();
      const actual = document.activeElement as HTMLElement | null;
      const i = actual ? Array.from(enlaces).indexOf(actual as HTMLAnchorElement) : -1;
      const siguiente = e.key === "ArrowDown" ? (i + 1) % enlaces.length : (i - 1 + enlaces.length) % enlaces.length;
      enlaces[siguiente]?.focus();
    };
    const fuera = (e: PointerEvent) => {
      if (caja.current && !caja.current.contains(e.target as Node)) setAbierto(false);
    };
    window.addEventListener("keydown", tecla);
    window.addEventListener("pointerdown", fuera);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", tecla);
      window.removeEventListener("pointerdown", fuera);
    };
  }, [abierto]);

  // el imán: el botón se inclina hacia el puntero
  function imantar(e: React.PointerEvent<HTMLButtonElement>) {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
    const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
    el.style.setProperty("--vida-mag-x", `${(dx * 9).toFixed(2)}px`);
    el.style.setProperty("--vida-mag-y", `${(dy * 9).toFixed(2)}px`);
  }
  function soltar(e: React.PointerEvent<HTMLButtonElement>) {
    e.currentTarget.style.setProperty("--vida-mag-x", "0px");
    e.currentTarget.style.setProperty("--vida-mag-y", "0px");
  }

  if (ruta?.startsWith("/vanguard2")) return null;

  return (
    <div className="vida-orbita" data-abierta={abierto ? "1" : "0"} ref={caja}>
      {abierto && <div className="vida-orbita-velo" aria-hidden="true" />}

      {abierto && (
        <nav className="vida-orbita-anillo" aria-label="Todas las puertas de Vanguard">
          <div className="vida-orbita-cab">
            <p>
              ¿A dónde vamos? <span>{lista.length} puertas</span>
            </p>
            <input
              ref={busca}
              className="vida-orbita-busca"
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Escribe: mapa, datos, juego…"
              aria-label="Buscar una puerta de la casa"
              autoComplete="off"
            />
          </div>

          <div className="vida-orbita-lista">
            {grupos.length === 0 && <p className="vida-orbita-vacio">Nada con ese nombre. Prueba «mapa» o «datos».</p>}
            {grupos.map((g) => (
              <div key={g.nombre}>
                <p className="vida-orbita-grupo">{g.nombre}</p>
                {g.items.map((e, i) => (
                  <Link
                    key={e.id}
                    href={e.href}
                    onClick={() => {
                      anotar(e.id);
                      setAbierto(false);
                    }}
                    style={{ animationDelay: `${i * 18}ms` }}
                  >
                    <span className="vida-orbita-punto" style={{ background: e.acento, boxShadow: `0 0 18px -4px ${e.acento}` }}>
                      {e.nombre.charAt(0)}
                    </span>
                    <span>{e.nombre}</span>
                    <em>{e.href}</em>
                  </Link>
                ))}
              </div>
            ))}
          </div>

          <div className="vida-orbita-pie">
            <span>
              <kbd className="vida-kbd">Esc</kbd> cierra · <kbd className="vida-kbd">↑↓</kbd> recorre
            </span>
            <span>aprende de ti</span>
          </div>
        </nav>
      )}

      <button
        ref={boton}
        type="button"
        className="vida-orbita-boton"
        aria-expanded={abierto}
        aria-label={abierto ? "Cerrar el menú de puertas" : "Abrir el menú de puertas"}
        title={abierto ? "Cerrar (Esc)" : "Todas las puertas (aquí, a un toque)"}
        onPointerMove={imantar}
        onPointerLeave={soltar}
        onClick={() => setAbierto((v) => !v)}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true" fill="none">
          <circle cx="12" cy="12" r="2.5" fill="currentColor" />
          <circle cx="12" cy="3.4" r="1.8" fill="currentColor" opacity=".95" />
          <circle cx="12" cy="20.6" r="1.8" fill="currentColor" opacity=".95" />
          <circle cx="3.4" cy="12" r="1.8" fill="currentColor" opacity=".7" />
          <circle cx="20.6" cy="12" r="1.8" fill="currentColor" opacity=".7" />
          <circle cx="12" cy="12" r="8.3" stroke="currentColor" strokeOpacity=".55" strokeWidth="1.1" strokeDasharray="2 3" />
        </svg>
      </button>
    </div>
  );
}
