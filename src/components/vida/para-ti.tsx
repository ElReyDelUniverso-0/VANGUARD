"use client";

// ═══════════════════════════════════════════════════════════════════
// v421.9 · «PARA TI» — la portada deja de ser la misma para todos
//
// Un carril que ordena las puertas REALES de la casa (las de modulos.ts, sin
// un href escrito a mano) según tus impresiones: lo que abres, lo que fijaste
// con la estrella y lo que hace tiempo que no tocas. Cada tarjeta lleva su
// color y su razón («vuelves mucho por aquí», «nunca lo has abierto»).
//
// HONESTIDAD: todo se calcula en el aparato; no hay perfil en la nube y nada
// viaja al servidor. El servidor pinta un orden estable (mismo en cada carga)
// y el aparato lo personaliza al hidratar, así que no hay saltos ni parpadeos.
// ═══════════════════════════════════════════════════════════════════
import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";
import { MODULOS } from "@/components/portada/modulos";
import {
  inicialDe,
  leerJson,
  normalizarSenal,
  puntuar,
  registrarVisto,
  tonoDe,
  type Candidato,
  type Recomendacion,
} from "@/lib/vida/algoritmo";

const CLAVE_VISTOS = "vx421-vida-vistos";
const CLAVE_USO = "vg195-atajos-usage"; // uso real de la casa (lib/nav.ts)
const CLAVE_FAV = "vg171-favoritos"; // estrellas reales (favoritos-store.ts)

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
  return out;
})();

/** Orden de arranque: sin señales, el mismo en el servidor y en el aparato. */
const ARRANQUE: Recomendacion[] = puntuar(CANDIDATOS, {}, 6);

export function ParaTi() {
  const [filas, setFilas] = useState<Recomendacion[]>(ARRANQUE);
  const [listo, setListo] = useState(false);
  const [nombre, setNombre] = useState("invitado");
  const [senales, setSenales] = useState(0);

  // 1) personalizar al hidratar, con las señales reales del aparato
  useEffect(() => {
    let aperturas = 0;
    let vistos: Record<string, number> = {};
    try {
      const uso = normalizarSenal({ uso: leerJson<Record<string, number>>(localStorage.getItem(CLAVE_USO), {}) }).uso ?? {};
      const fav = normalizarSenal({ favoritos: leerJson<unknown>(localStorage.getItem(CLAVE_FAV), null) }).favoritos ?? [];
      vistos = normalizarSenal({ vistos: leerJson<Record<string, number>>(localStorage.getItem(CLAVE_VISTOS), {}) }).vistos ?? {};
      aperturas = Object.values(uso).reduce((a, b) => a + b, 0) + Object.keys(vistos).length;
      const senal = normalizarSenal({ uso, favoritos: fav, vistos, ahora: Date.now() });
      setFilas(puntuar(CANDIDATOS, senal, 6));
      setSenales(aperturas);
    } catch {
      /* sin almacén se queda el orden de arranque: la casa sigue igual */
    }
    setListo(true);

    // 2) el nombre: el de la cuenta si hay sesión; si no, invitado.
    //    (No se adivina ni se lee de claves ajenas: lo dice /api/auth/me.)
    const control = new AbortController();
    fetch("/api/auth/me", { signal: control.signal, headers: { accept: "application/json" } })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { account?: { username?: string } | null } | null) => {
        const u = d?.account?.username;
        if (u) setNombre(String(u).toLowerCase());
      })
      .catch(() => {});
    return () => control.abort();
  }, []);

  /** Anota la impresión al abrir: así el carril aprende de verdad. */
  function anotar(id: string) {
    try {
      const previos = normalizarSenal({ vistos: leerJson<Record<string, number>>(localStorage.getItem(CLAVE_VISTOS), {}) }).vistos ?? {};
      localStorage.setItem(CLAVE_VISTOS, JSON.stringify(registrarVisto(previos, id)));
    } catch {
      /* modo privado: no se aprende, pero se navega igual */
    }
  }

  const t = tonoDe(nombre);

  return (
    <section id="para-ti" className="vx-sec vida-parati" aria-label="Recomendado para ti">
      <div className="vida-parati-cab">
        <div
          className="vida-avatar"
          aria-hidden="true"
          style={{ background: `linear-gradient(135deg, ${t.a}, ${t.b})` }}
        >
          {inicialDe(nombre)}
        </div>
        <div className="vida-parati-texto">
          <p className="vida-parati-sello">
            <span className="vida-punto" style={{ background: t.a }} /> Sección 00 · Para ti
          </p>
          <h2 className="vida-parati-titulo">Hola, {nombre}</h2>
          <p className="vida-parati-sub">
            {listo && senales > 0
              ? `Aprendido de ${senales} ${senales === 1 ? "apertura" : "aperturas"} en este aparato. Nada sale de aquí.`
              : "Tu casa aprende de lo que abres. Nada sale de este aparato."}
          </p>
        </div>
      </div>

      <div className="vida-parati-rejilla" data-listo={listo ? "1" : "0"}>
        {filas.map((f, i) => {
          const c = tonoDe(f.id);
          return (
            <Link
              key={f.id}
              href={f.href}
              className="vida-carta"
              onClick={() => anotar(f.id)}
              style={
                {
                  "--vida-c1": c.a,
                  "--vida-c2": c.b,
                  animationDelay: `${i * 60}ms`,
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
        El orden lo decide tu uso, no un editor.{" "}
        <Link href="/mi-universo">Ver todo lo que has guardado →</Link>
      </p>
    </section>
  );
}
