// ═══════════════════════════════════════════════════════════════════
// v403.8 · EL MAPA DE LAS SALAS — la segunda mitad de «LA PUERTA».
//
// LO QUE HABÍA: /modulos (47 líneas) enseñaba 46 salas de los módulos y nada
// más. Las otras 155 salas de la casa vivían detrás de una sola ruta
// (/cuartel), sin mapa y sin puerta: el visitante que quería explorar
// VANGUARD tenía una lista larga, no un universo.
//
// LO QUE HACE ESTE: pinta las 155 salas agrupadas en sus 20 constelaciones
// (las mismas secciones que ya organizan el cuartel en tab-nav.tsx, extraídas
// a mapa-salas.ts por scripts/generar-mapa-salas.mjs). Cada sala abre donde
// siempre ha abierto: /cuartel?sala=<clave> (v402.4).
//
// NADA SE MUEVE: no se renombra una sala, no se cambia una pestaña, no se
// toca el cuartel. Esto es un índice, y el índice solo dice la verdad de lo
// que ya existe.
// ═══════════════════════════════════════════════════════════════════
import Link from "next/link";
import { CONSTELACIONES, TOTAL_SALAS } from "@/lib/vanguard/mapa-salas";

const COLOR: Record<string, string> = {
  amber: "#f5a623",
  cyan: "#5eead4",
  red: "#ff4d5e",
  green: "#3ddc97",
  violet: "#b48cff",
  blue: "#7ab8ff",
};

export function MapaConstelaciones() {
  return (
    <div className="vx-constelaciones">
      {CONSTELACIONES.map((c) => {
        const color = COLOR[c.color] ?? "#f5a623";
        return (
          <section key={c.clave} className="vx-constelacion" aria-label={c.nombre}>
            <header>
              <i style={{ background: color }} aria-hidden />
              <h3>{c.nombre}</h3>
              <span>
                {c.salas.length} {c.salas.length === 1 ? "sala" : "salas"}
              </span>
            </header>
            {c.desc && <p className="vx-constelacion-desc">{c.desc}</p>}
            <ul>
              {c.salas.map((s) => (
                <li key={s.clave}>
                  <Link href={`/cuartel?sala=${s.clave}`} title={s.nombre}>
                    {s.corto}
                    <span aria-hidden>→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
      <p className="vx-constelaciones-pie">
        {TOTAL_SALAS} salas en {CONSTELACIONES.length} constelaciones. Todas abren en el cuartel, en su sitio de
        siempre. ¿No sabes dónde está algo? Pulsa <kbd>⌘K</kbd> y búscalo.
      </p>
    </div>
  );
}
