// ═══════════════════════════════════════════════════════════════════
// v403.9 · CADA CONSTELACIÓN TIENE SU PUERTA — /constelacion/[clave]
//
// EL AGUJERO QUE CIERRA: en la v403.8 el mapa de las 155 salas ya existía,
// pero era una sola página larga: quien quería las 18 salas de INTEL tenía que
// bajar por todo el mapa. Las 20 constelaciones eran una lista, no un sitio.
//
// ESTA PÁGINA: una ruta propia por constelación (20 rutas estáticas, generadas
// de mapa-salas.ts — la misma fuente del mapa y del buscador ⌘K). Cada sala
// sigue abriendo donde siempre: /cuartel?sala=<clave>. No se crea ni una sala
// nueva, no se renombra nada: solo se le da puerta a lo que ya estaba.
//
// v405.6 LAS PUERTAS DE LAS SALAS: cada sala enlaza además a su puerta pública
// /sala/<clave> — así Google descubre las 155 desde aquí.
// ═══════════════════════════════════════════════════════════════════
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CONSTELACIONES, TOTAL_SALAS } from "@/lib/vanguard/mapa-salas";

const COLOR: Record<string, string> = {
  amber: "#f5a623",
  cyan: "#5eead4",
  red: "#ff4d5e",
  green: "#3ddc97",
  violet: "#b48cff",
  blue: "#7ab8ff",
};

export function generateStaticParams() {
  return CONSTELACIONES.map((c) => ({ clave: c.clave }));
}

export async function generateMetadata({ params }: { params: Promise<{ clave: string }> }): Promise<Metadata> {
  const { clave } = await params;
  const c = CONSTELACIONES.find((x) => x.clave === clave);
  if (!c) return { title: "Constelación no encontrada" };
  const n = c.salas.length;
  return {
    title: `${c.nombre} — ${n} ${n === 1 ? "sala" : "salas"} de VANGUARD`,
    description: `${c.nombre}: ${c.desc}. ${n} ${n === 1 ? "sala" : "salas"} que abren directamente en el cuartel.`,
    alternates: { canonical: `/constelacion/${c.clave}` },
  };
}

export default async function Constelacion({ params }: { params: Promise<{ clave: string }> }) {
  const { clave } = await params;
  const c = CONSTELACIONES.find((x) => x.clave === clave);
  if (!c) notFound();
  const color = COLOR[c.color] ?? "#f5a623";
  const hermanas = CONSTELACIONES.filter((x) => x.clave !== c.clave);

  return (
    <main className="vx vx-constelacion-pagina">
      <section className="vx-sec">
        <div className="vx-wrap">
          <p className="vx-migas">
            <Link href="/modulos#mapa">El mapa de las {TOTAL_SALAS} salas</Link>
            <span aria-hidden>›</span>
            <span style={{ color }}>{c.nombre}</span>
          </p>
          <span className="vx-sello" style={{ borderColor: color, color }}>
            Constelación · {c.salas.length} {c.salas.length === 1 ? "sala" : "salas"}
          </span>
          <h1>{c.nombre}</h1>
          <p className="vx-const-desc">{c.desc}</p>

          <ul className="vx-const-salas">
            {c.salas.map((s) => (
              <li key={s.clave}>
                {/* v405.6: el nombre lleva a la puerta pública de la sala
                    (/sala/<clave>, la que Google puede leer); «Abrir» sigue
                    entrando directo al cuartel, como siempre. */}
                <div className="vx-const-sala">
                  <Link href={`/sala/${s.clave}`} className="vx-const-sala-titulo">
                    <span className="vx-const-sala-corto" style={{ borderColor: `${color}55` }}>
                      {s.corto}
                    </span>
                    <span className="vx-const-sala-nombre">
                      {s.nombre}
                    </span>
                  </Link>
                  <span className="vx-const-sala-pie">
                    <Link href={`/sala/${s.clave}`} className="vx-const-sala-ficha">
                      Qué es
                    </Link>
                    <Link href={`/cuartel?sala=${s.clave}`} className="vx-const-sala-abrir" style={{ color, textDecoration: "none" }}>
                      Abrir <span aria-hidden>→</span>
                    </Link>
                  </span>
                </div>
              </li>
            ))}
          </ul>

          <p className="vx-const-pie">
            ¿No es lo que buscabas? Pulsa <kbd>⌘K</kbd> y escribe una palabra: el buscador mira las {TOTAL_SALAS}{" "}
            salas a la vez, sin que sepas dónde vive nada.
          </p>
        </div>
      </section>

      <section className="vx-sec" aria-label="Las otras constelaciones">
        <div className="vx-wrap">
          <h2 className="vx-const-h2">Las otras {hermanas.length} constelaciones</h2>
          <ul className="vx-const-nav">
            {hermanas.map((h) => (
              <li key={h.clave}>
                <Link href={`/constelacion/${h.clave}`}>
                  <i style={{ background: COLOR[h.color] ?? "#f5a623" }} aria-hidden />
                  {h.corto}
                  <b>{h.salas.length}</b>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
