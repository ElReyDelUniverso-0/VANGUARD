"use client";

// ═══════════════════════════════════════════════════════════════════
// v431.1 · «PARA TI» 3 — el carril que aprende (y ahora se deja marcar)
//
// · Las puertas salen del registro real (modulos.ts): ni un href a mano.
// · El orden lo decide TU uso; cada tarjeta dice por qué está ahí y, si la
//   abriste antes, CUÁNDO («lo abriste hace 2 h»).
// · ESTRELLA propia por tarjeta: la marca pesa +6 en el algoritmo (la de la
//   casa, `vg171-favoritos`, sigue pesando +8 y manda). Botón de verdad, no
//   un botón dentro de un enlace: HTML válido y sin robarle el toque a la
//   tarjeta.
// · ARRANQUE: si el aparato no ha aprendido nada, tres puertas para empezar.
// · RULETA («Sorpréndeme») con memoria + medidor vivo + borrar lo aprendido.
//
// HONESTIDAD: todo en el aparato. El servidor pinta un orden estable y el
// aparato lo personaliza al hidratar: sin saltos ni parpadeos.
// ═══════════════════════════════════════════════════════════════════
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as PunteroReact } from "react";
import { MODULOS } from "@/components/portada/modulos";
import {
  elegirSorprendente,
  haceCuanto,
  inicialDe,
  puntuar,
  tonoDe,
  type Candidato,
  type Recomendacion,
} from "@/lib/vida/algoritmo";
import {
  alternarFavorito,
  anotar,
  cuantoAprendido,
  misFavoritos,
  olvidarTodo,
  senalActual,
} from "@/lib/vida/senal";

/** Las puertas salen del registro; si una sala se repite, se queda la primera. */
const CANDIDATOS: Candidato[] = (() => {
  const ya = new Set<string>();
  const out: Candidato[] = [];
  const meter = (id: string, nombre: string, href: string, grupo: string) => {
    if (ya.has(href)) return;
    ya.add(href);
    out.push({ id, nombre, href, grupo });
  };
  for (const m of MODULOS) {
    meter(m.id, m.nombre, m.nav, m.nombre);
    for (const p of m.pestanas) meter(`${m.id}/${p.href}`, p.label, p.href, m.nombre);
  }
  meter("mi-universo", "Mi universo", "/mi-universo", "Tu lado");
  meter("arquitectura", "La arquitectura", "/navegacion", "La casa");
  meter("mesa", "Mi mesa de trabajo", "/espacio", "Tu lado");
  meter("ecosistema", "El ecosistema", "/ecosistema", "La casa");
  return out;
})();

/** Orden de arranque: sin señales, idéntico en el servidor y en el aparato. */
const ARRANQUE: Recomendacion[] = puntuar(CANDIDATOS, {}, 6);

/** Las tres puertas del que llega nuevo, buscadas en el registro (nunca a mano). */
const PARA_EMPEZAR: Candidato[] = ["conflictos", "mapa", "datos"]
  .map((id) => CANDIDATOS.find((c) => c.id === id))
  .filter((c): c is Candidato => Boolean(c));

export function ParaTi() {
  const [filas, setFilas] = useState<Recomendacion[]>(ARRANQUE);
  const [listo, setListo] = useState(false);
  const [nombre, setNombre] = useState("invitado");
  const [medidor, setMedidor] = useState({ puertas: 0, aperturas: 0, recientes: 0 });
  const [cuantos, setCuantos] = useState(6);
  const [suerte, setSuerte] = useState<Recomendacion | null>(null);
  const [rodando, setRodando] = useState<string | null>(null);
  const [mios, setMios] = useState<string[]>([]);
  const [vistos, setVistos] = useState<Record<string, number>>({});
  const [ahora, setAhora] = useState(0);
  const ruletaTimer = useRef<number | null>(null);

  const recomputar = (cuantosAhora = cuantos) => {
    const senal = senalActual();
    setFilas(puntuar(CANDIDATOS, senal, cuantosAhora));
    setMedidor(cuantoAprendido());
    setMios(misFavoritos());
    setVistos(senal.vistos ?? {});
    setAhora(senal.ahora ?? Date.now());
  };

  // 1) personalizar al hidratar
  useEffect(() => {
    try {
      recomputar(6);
    } catch {
      /* sin almacén se queda el orden de arranque: la casa sigue igual */
    }
    setListo(true);

    // 2) el nombre: el de la cuenta si hay sesión (no se adivina)
    const control = new AbortController();
    fetch("/api/auth/me", { signal: control.signal, headers: { accept: "application/json" } })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { account?: { username?: string } | null } | null) => {
        const u = d?.account?.username;
        if (u) setNombre(String(u).toLowerCase());
      })
      .catch(() => {});
    return () => {
      control.abort();
      if (ruletaTimer.current) window.clearInterval(ruletaTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!listo) return;
    recomputar(cuantos);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cuantos, listo]);

  /** Inclinación 3D + foco: se escribe en el estilo del elemento, sin re-render. */
  function inclinar(e: PunteroReact<HTMLElement>) {
    if (typeof window.matchMedia !== "function") return;
    if (window.matchMedia("(hover: none)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--vida-tx", `${((px - 0.5) * 9).toFixed(2)}deg`);
    el.style.setProperty("--vida-ty", `${((0.5 - py) * 7).toFixed(2)}deg`);
    el.style.setProperty("--vida-mx", `${(px * 100).toFixed(1)}%`);
    el.style.setProperty("--vida-my", `${(py * 100).toFixed(1)}%`);
  }
  function desinclinar(e: PunteroReact<HTMLElement>) {
    const el = e.currentTarget;
    el.style.setProperty("--vida-tx", "0deg");
    el.style.setProperty("--vida-ty", "0deg");
  }

  /** La ruleta: 500 ms de nombres pasando y aterriza en una puerta que sorprenda. */
  function girar() {
    if (ruletaTimer.current) window.clearInterval(ruletaTimer.current);
    const senal = senalActual();
    const enPantalla = filas.map((f) => f.id);
    const elegido = elegirSorprendente(CANDIDATOS, senal, enPantalla, Date.now());
    if (!elegido) return;

    const nombres = CANDIDATOS.map((c) => c.nombre);
    let vueltas = 0;
    setSuerte(null);
    ruletaTimer.current = window.setInterval(() => {
      vueltas++;
      setRodando(nombres[Math.floor(Math.random() * nombres.length)]);
      if (vueltas >= 9) {
        if (ruletaTimer.current) window.clearInterval(ruletaTimer.current);
        ruletaTimer.current = null;
        setRodando(null);
        setSuerte(elegido);
      }
    }, 55);
  }

  function borrar() {
    olvidarTodo();
    setSuerte(null);
    recomputar(cuantos);
  }

  function marcar(id: string) {
    alternarFavorito(id);
    recomputar(cuantos);
  }

  const t = tonoDe(nombre);
  const nuevo = listo && medidor.aperturas === 0;

  const tarjeta = (f: Recomendacion, i: number, extra?: { suerte?: boolean }) => {
    const c = tonoDe(f.id);
    const marca = vistos[f.id] ?? vistos[f.href];
    const cuando = marca !== undefined && ahora > 0 ? haceCuanto(ahora - marca) : null;
    const esMio = mios.includes(f.id) || mios.includes(f.href);
    return (
      <article
        key={`${f.id}${extra?.suerte ? "-suerte" : ""}`}
        className="vida-carta"
        data-num={extra?.suerte ? "✦" : String(i + 1).padStart(2, "0")}
        data-suerte={extra?.suerte ? "1" : undefined}
        onPointerMove={inclinar}
        onPointerLeave={desinclinar}
        style={
          {
            "--vida-c1": extra?.suerte ? "#ffd166" : c.a,
            "--vida-c2": extra?.suerte ? "#ff4d8d" : c.b,
            animationDelay: `${i * 55}ms`,
            ...(extra?.suerte ? { marginBottom: "13px" } : {}),
          } as CSSProperties
        }
      >
        <Link href={f.href} className="vida-carta-enlace" onClick={() => anotar(f.id)}>
          <span className="vida-carta-num" aria-hidden="true">
            {extra?.suerte ? "LA RULETA DICE" : String(i + 1).padStart(2, "0")}
          </span>
          <span className="vida-carta-nombre">{f.nombre}</span>
          <span className="vida-carta-grupo">{f.grupo}</span>
          {cuando && <span className="vida-carta-hace">{cuando}</span>}
          <span className="vida-carta-razon">{f.razon}</span>
        </Link>
        <button
          type="button"
          className="vida-estrella"
          aria-pressed={esMio}
          aria-label={esMio ? `Quitar ${f.nombre} de tus estrellas` : `Marcar ${f.nombre} con estrella`}
          title={esMio ? "Quitar la estrella" : "Poner estrella (pesa en el orden)"}
          onClick={() => marcar(f.id)}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true" fill={esMio ? "currentColor" : "none"}>
            <path
              d="M12 3.6l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8L3.5 9.8l5.9-.9L12 3.6z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </article>
    );
  };

  return (
    <section id="para-ti" className="vx-sec vida-parati" aria-label="Recomendado para ti" data-vida-ver>
      <div className="vida-parati-cab">
        <div className="vida-avatar" aria-hidden="true" style={{ background: `linear-gradient(135deg, ${t.a}, ${t.b})` }}>
          {inicialDe(nombre)}
        </div>
        <div className="vida-parati-texto">
          <p className="vida-parati-sello">
            <span className="vida-punto" style={{ background: t.a, color: t.a }} /> Sección 00 · Para ti
          </p>
          <h2 className="vida-parati-titulo">Hola, {nombre}</h2>
          <p className="vida-parati-sub">
            {listo && medidor.aperturas > 0
              ? `He aprendido de ${medidor.puertas} ${medidor.puertas === 1 ? "puerta" : "puertas"} y ${medidor.aperturas} ${medidor.aperturas === 1 ? "apertura" : "aperturas"} en este aparato. Nada sale de aquí.`
              : "Toca una tarjeta o dale a la ruleta: la casa aprende de lo que abres. Nada sale de este aparato."}
          </p>
        </div>
        <div className="vida-parati-acciones">
          {medidor.aperturas > 0 && (
            <span className="vida-medidor">
              <b>{medidor.puertas}</b> puertas · <b>{medidor.aperturas}</b> aperturas
            </span>
          )}
          <button type="button" className="vida-ruleta" onClick={girar} aria-label="Sorpréndeme con una puerta de la casa">
            <span className="vida-ruleta-icono" aria-hidden="true">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" />
                <circle cx="12" cy="12" r="2.4" fill="currentColor" />
              </svg>
            </span>
            {rodando ? rodando : "Sorpréndeme"}
          </button>
        </div>
      </div>

      {nuevo && PARA_EMPEZAR.length > 0 && (
        <div className="vida-arranque">
          <p>¿Primera vez? Empieza por aquí →</p>
          {PARA_EMPEZAR.map((c) => (
            <Link key={c.id} href={c.href} className="vida-sugerencia" onClick={() => anotar(c.id)}>
              <i aria-hidden="true" />
              {c.nombre}
            </Link>
          ))}
        </div>
      )}

      {suerte && tarjeta(suerte, 0, { suerte: true })}

      <div className="vida-parati-rejilla" data-listo={listo ? "1" : "0"}>
        {filas.map((f, i) => tarjeta(f, i))}
      </div>

      <p className="vida-parati-pie">
        <span>El orden lo decide tu uso, no un editor.</span>
        <button type="button" onClick={() => setCuantos((n) => (n === 6 ? 12 : 6))}>
          {cuantos === 6 ? "Ver doce puertas" : "Ver solo seis"}
        </button>
        <Link href="/mi-universo">Lo que he guardado →</Link>
        {medidor.aperturas > 0 && (
          <button type="button" onClick={borrar}>
            Borrar lo aprendido
          </button>
        )}
      </p>
    </section>
  );
}
