import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/site";
import { Marco } from "@/components/planeta/marco";
import { COLECCIONES, TEMA_POR_ID } from "@/lib/planeta/directorio";

// ═══════════════════════════════════════════════════════════════════
// v407.1 · /colecciones — RECORRIDOS GUIADOS
// Cada colección responde una pregunta enlazando salas que ya existen, en
// orden y con el porqué de cada parada. Las rutas se verifican en
// scripts/pruebas-nucleo.mjs: ninguna parada lleva a una página vacía.
// ═══════════════════════════════════════════════════════════════════

export const metadata: Metadata = {
  title: "Colecciones de Vanguard: recorridos guiados por temas | VANGUARD",
  description:
    "Recorridos de cinco a siete paradas para entender una guerra, situar a tu país en el mundo, saber quién manda en el planeta o aprender a verificar.",
  alternates: { canonical: `${SITE_URL}/colecciones` },
};

export default function ColeccionesPage() {
  return (
    <Marco
      ruta="/colecciones"
      volanta="Vanguard · Colecciones"
      titulo="Recorridos guiados"
      sub="¿No sabes por dónde empezar? Cada colección parte de una pregunta y te lleva, parada a parada, por las salas que la responden."
      fuente={<>Las colecciones enlazan solo salas que existen en la casa (src/lib/planeta/directorio.ts, verificado por scripts/pruebas-nucleo.mjs).</>}
    >
      <section className="vx-pl-sec">
        <div className="vx-pl-rejilla" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
          {COLECCIONES.map((c) => {
            const t = TEMA_POR_ID.get(c.tema);
            return (
              <Link key={c.clave} href={`/colecciones/${c.clave}`} className="vx-pl-tarjeta" style={{ borderLeft: `3px solid ${t?.color ?? "#5eead4"}` }}>
                <h3>{c.titulo}</h3>
                <p>{c.pregunta}</p>
                <p style={{ marginTop: 6 }}>{c.intro}</p>
                <p className="vx-pl-meta">
                  {c.paradas.length} paradas · unos {c.minutos} minutos · {t?.nombre}
                </p>
              </Link>
            );
          })}
        </div>
      </section>
    </Marco>
  );
}
