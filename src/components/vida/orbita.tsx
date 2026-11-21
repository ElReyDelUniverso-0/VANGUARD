"use client";

// ═══════════════════════════════════════════════════════════════════
// v431.1 · LA ÓRBITA 3 — ahora recuerda dónde estabas
//
//   · Botón magnético con anillo cónico; al abrir, un VELO desenfoca la casa.
//   · BUSCADOR en vivo («ma» → Mapa 3D, Mapas…), sin acentos y sin mayúsculas.
//   · ARRIBA: «seguir donde lo dejaste» y las tres últimas puertas, con su
//     tiempo en palabras («hace 2 h»). La casa te devuelve el hilo.
//   · Tus estrellas salen marcadas en la lista (★) y pesan en el algoritmo.
//   · Teclado: Esc cierra y devuelve el foco al botón, ↑↓ recorren, Enter entra.
//     La tecla «/» abre la órbita desde cualquier sala (si no estás escribiendo).
//   · Cada puerta abierta ANOTA su impresión: el menú también enseña.
//   · No existe en /vanguard2: ahí manda el 3D.
// ═══════════════════════════════════════════════════════════════════
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type PointerEvent as PunteroReact } from "react";
// v432.0 ORDEN ÚNICO: la terminal ya no lleva su propia lista de módulos (se
// pisaba con la cabecera). Lee el mismo árbol que el índice /orden: siete
// divisiones, cada módulo con su código D-x-M0y. Una sola verdad, dos puertas.
import { ARBOL } from "@/lib/operacion/orden";
import { PALETA, haceCuanto } from "@/lib/vida/algoritmo";
import { anotar, misFavoritos, recientes } from "@/lib/vida/senal";

const EXTRAS = [
  { id: "mi-universo", nombre: "Mi universo", href: "/mi-universo" },
  { id: "arquitectura", nombre: "La arquitectura", href: "/navegacion" },
  { id: "mesa", nombre: "Mi mesa de trabajo", href: "/espacio" },
  { id: "ecosistema", nombre: "El ecosistema", href: "/ecosistema" },
];

type Entrada = { id: string; nombre: string; grupo: string; href: string; acento: string; codigo: string };

const ENTRADAS: Entrada[] = [
  // Cada módulo cae bajo SU división (D-I… D-VII) y con su código completo.
  // Así la terminal se lee de arriba abajo, como un documento, y ningún botón
  // compite con otro: no hay dos listas paralelas, hay un solo orden.
  ...ARBOL.flatMap((d, di) =>
    d.modulosResueltos.map((m, mi) => ({
      id: m.id,
      nombre: m.nombre,
      grupo: `${d.codigo} · ${d.nombre}`,
      href: m.nav,
      acento: PALETA[(di + mi) % PALETA.length],
      codigo: m.codigo,
    })),
  ),
  ...EXTRAS.map((e, i) => ({
    ...e,
    grupo: "Tu lado",
    acento: PALETA[(ARBOL.length + i) % PALETA.length],
    codigo: `T-${String(i + 1).padStart(2, "0")}`,
  })),
];

const POR_ID = new Map(ENTRADAS.map((e) => [e.id, e]));

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
  const [vuelta, setVuelta] = useState<{ id: string; hace: number }[]>([]);
  const [estrellas, setEstrellas] = useState<string[]>([]);
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

  // al abrir se lee la memoria del aparato (nunca en el servidor)
  const abrir = () => {
    const ahora = Date.now();
    // las tres últimas, de la más reciente a la más vieja (y con nombre real)
    const recien = recientes(3, ahora).filter((r) => POR_ID.has(r.id) || POR_ID.has(r.id.split("/")[0]));
    setVuelta(recien);
    setEstrellas(misFavoritos());
    setAbierto(true);
  };

  // cerrar al cambiar de sala
  useEffect(() => {
    setAbierto(false);
    setQ("");
  }, [ruta]);

  // abierto: Esc, clic fuera, flechas y foco al buscador
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
      const enlaces = caja.current?.querySelectorAll<HTMLAnchorElement>(".vida-orbita-anillo a");
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

  // «/» abre la órbita desde cualquier sala (salvo que estés escribiendo)
  useEffect(() => {
    const atajo = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      const escribiendo = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      if (escribiendo || abierto) return;
      e.preventDefault();
      abrir();
    };
    window.addEventListener("keydown", atajo);
    return () => window.removeEventListener("keydown", atajo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto]);

  // el imán: el botón se inclina hacia el puntero
  function imantar(e: PunteroReact<HTMLButtonElement>) {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
    const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
    el.style.setProperty("--vida-mag-x", `${(dx * 9).toFixed(2)}px`);
    el.style.setProperty("--vida-mag-y", `${(dy * 9).toFixed(2)}px`);
  }
  function soltar(e: PunteroReact<HTMLButtonElement>) {
    e.currentTarget.style.setProperty("--vida-mag-x", "0px");
    e.currentTarget.style.setProperty("--vida-mag-y", "0px");
  }

  if (ruta?.startsWith("/vanguard2")) return null;

  const nombreDe = (id: string) => POR_ID.get(id)?.nombre ?? POR_ID.get(id.split("/")[0])?.nombre ?? id;

  return (
    <div className="vida-orbita" data-abierta={abierto ? "1" : "0"} ref={caja}>
      {abierto && <div className="vida-orbita-velo" aria-hidden="true" />}

      {abierto && (
        <nav
          className="vida-orbita-anillo"
          role="dialog"
          aria-modal="false"
          aria-label="Todas las puertas de Vanguard"
        >
          <div className="vida-orbita-cab">
            <p>
              Terminal de mando <span aria-live="polite">{lista.length} puertas</span>
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

          {!q.trim() && vuelta.length > 0 && (
            <div className="vida-orbita-recientes">
              <p>Último contacto</p>
              {vuelta.map((r) => {
                const e = POR_ID.get(r.id) ?? POR_ID.get(r.id.split("/")[0]);
                if (!e) return null;
                return (
                  <Link key={r.id} href={e.href} onClick={() => anotar(e.id)}>
                    <i aria-hidden="true" />
                    <span>{e.nombre}</span>
                    <span>{haceCuanto(r.hace)}</span>
                  </Link>
                );
              })}
            </div>
          )}

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
                    <span className="vida-orbita-punto" title={e.codigo}>
                      {e.codigo}
                    </span>
                    <span>{e.nombre}</span>
                    <em>{estrellas.includes(e.id) ? "★" : e.href}</em>
                  </Link>
                ))}
              </div>
            ))}
          </div>

          <div className="vida-orbita-pie">
            <span>
              <kbd className="vida-kbd">Esc</kbd> cierra · <kbd className="vida-kbd">↑↓</kbd> recorre
            </span>
            <Link href="/orden" className="vida-orbita-todo" onClick={() => setAbierto(false)}>
              Índice completo · todas las salas
            </Link>
            <span>
              <kbd className="vida-kbd">/</kbd> abre · registro activo
            </span>
          </div>
        </nav>
      )}

      <button
        ref={boton}
        type="button"
        className="vida-orbita-boton"
        aria-expanded={abierto}
        aria-label={abierto ? "Cerrar la terminal de mando" : "Abrir la terminal de mando"}
        title={abierto ? "Cerrar (Esc)" : "Terminal de mando (o pulsa /)"}
        onPointerMove={imantar}
        onPointerLeave={soltar}
        onClick={() => (abierto ? setAbierto(false) : abrir())}
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
