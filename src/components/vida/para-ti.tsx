"use client";

// ═══════════════════════════════════════════════════════════════════
// v422.3 · «PARA TI» 2 — el carril que aprende, ahora con ruleta
//
// · Las puertas salen del registro real (modulos.ts): ni un href a mano.
// · El orden lo decide TU uso (lib/vida/algoritmo), y cada tarjeta dice
//   por qué está ahí.
// · Tarjetas con inclinación 3D y foco de luz que sigue al ratón.
// · RULETA («Sorpréndeme»): la sorpresa con memoria — nunca repite lo que ya
//   estás viendo ni lo que abriste hace una hora, y prefiere lo que nunca
//   tocaste. Rueda los nombres 500 ms y aterriza.
// · MEDIDOR vivo: cuántas puertas distintas y cuántas aperturas ha aprendido.
// · «Borrar lo aprendido»: el visitante manda (y se puede deshacer volviendo).
//
// HONESTIDAD: todo en el aparato. El servidor pinta un orden estable y el
// aparato lo personaliza al hidratar: sin saltos, sin parpadeos.
// ═══════════════════════════════════════════════════════════════════
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as PunteroReact } from "react";
import { MODULOS } from "@/components/portada/modulos";
import {
  elegirSorprendente,
  inicialDe,
  puntuar,
  tonoDe,
  type Candidato,
  type Recomendacion,
} from "@/lib/vida/algoritmo";
import { anotar, cuantoAprendido, olvidarTodo, senalActual } from "@/lib/vida/senal";

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

export function ParaTi() {
  const [filas, setFilas] = useState<Recomendacion[]>(ARRANQUE);
  const [listo, setListo] = useState(false);
  const [nombre, setNombre] = useState("invitado");
  const [medidor, setMedidor] = useState({ puertas: 0, aperturas: 0, recientes: 0 });
  const [cuantos, setCuantos] = useState(6);
  const [suerte, setSuerte] = useState<Recomendacion | null>(null);
  const [rodando, setRodando] = useState<string | null>(null);
  const ruletaTimer = useRef<number | null>(null);

  const recomputar = () => {
    const senal = senalActual();
    setFilas(puntuar(CANDIDATOS, senal, cuantos));
    setMedidor(cuantoAprendido());
  };

  // 1) personalizar al hidratar
  useEffect(() => {
    try {
      recomputar();
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
    recomputar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cuantos, listo]);

  /** Inclinación 3D + foco: se escribe en el estilo del elemento, sin re-render. */
  function inclinar(e: PunteroReact<HTMLAnchorElement>) {
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
  function desinclinar(e: PunteroReact<HTMLAnchorElement>) {
    const el = e.currentTarget;
    el.style.setProperty("--vida-tx", "0deg");
    el.style.setProperty("--vida-ty", "0deg");
  }

  /** Anota la impresión al abrir: así el carril aprende de verdad. */
  function abrir(id: string) {
    anotar(id);
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
    recomputar();
  }

  const t = tonoDe(nombre);

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

      {suerte && (
        <Link
          href={suerte.href}
          className="vida-carta"
          data-suerte="1"
          data-num="✦"
          onClick={() => abrir(suerte.id)}
          style={
            {
              "--vida-c1": "#ffd166",
              "--vida-c2": "#ff4d8d",
              marginBottom: "13px",
            } as CSSProperties
          }
        >
          <span className="vida-carta-num" aria-hidden="true">
            LA RULETA DICE
          </span>
          <span className="vida-carta-nombre">{suerte.nombre}</span>
          <span className="vida-carta-grupo">{suerte.grupo}</span>
          <span className="vida-carta-razon">{suerte.razon}</span>
        </Link>
      )}

      <div className="vida-parati-rejilla" data-listo={listo ? "1" : "0"}>
        {filas.map((f, i) => {
          const c = tonoDe(f.id);
          return (
            <Link
              key={f.id}
              href={f.href}
              className="vida-carta"
              data-num={String(i + 1).padStart(2, "0")}
              onClick={() => abrir(f.id)}
              onPointerMove={inclinar}
              onPointerLeave={desinclinar}
              style={
                {
                  "--vida-c1": c.a,
                  "--vida-c2": c.b,
                  animationDelay: `${i * 55}ms`,
                } as CSSProperties
              }
            >
              <span className="vida-carta-num" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="vida-carta-nombre">{f.nombre}</span>
              <span className="vida-carta-grupo">{f.grupo}</span>
              <span className="vida-carta-razon">{f.razon}</span>
            </Link>
          );
        })}
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
