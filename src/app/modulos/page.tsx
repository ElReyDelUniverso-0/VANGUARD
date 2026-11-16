// ============================================================
// v402.6 LOS NUEVE MÓDULOS — /modulos: el índice de la casa.
// Todo lo que Vanguard tiene además de noticias, módulo a módulo.
// ============================================================
import type { Metadata } from "next";
import Link from "next/link";
import { ModulosRejilla } from "@/components/portada/modulos-rejilla";
import { BotonMundos } from "@/components/mundos/puerta-mundos";
import { MODULOS, MODULOS_PUBLICOS } from "@/components/portada/modulos";
// v403.8 LA PUERTA: el mapa de TODAS las salas de la casa, no solo las 46 de
// los módulos. Las 155 del cuartel, en sus 20 constelaciones, con su puerta.
import { MapaConstelaciones } from "@/components/vanguard/mapa-constelaciones";
import { CONSTELACIONES, TOTAL_SALAS } from "@/lib/vanguard/mapa-salas";

const SALAS = MODULOS_PUBLICOS.reduce((t, m) => t + m.pestanas.length, 0);

export const metadata: Metadata = {
  title: "Los módulos de Vanguard — mucho más que noticias",
  description: `Los ${MODULOS_PUBLICOS.length} módulos de Vanguard y sus ${SALAS} salas: conflictos, mapa 3D, conocimiento, secretos, arsenal, datos vivos, medios y juego.`,
  alternates: { canonical: "/modulos" },
};

export default function Modulos() {
  const estado = MODULOS.find((m) => m.id === "estado");
  return (
    <main className="vx vx-modulos">
      <section className="vx-sec vx-modulos-cab">
        <div className="vx-wrap">
          <span className="vx-sello">Índice de la casa</span>
          <h1>Mucho más que noticias</h1>
          <p>
            {MODULOS_PUBLICOS.length} módulos y {SALAS} salas para entender el mundo: elige por dónde entrar.
          </p>
          <div style={{ marginTop: 16 }}>
            <BotonMundos />
          </div>
        </div>
      </section>
      <section className="vx-sec" aria-label="Mapa de todas las salas" id="mapa">
        <div className="vx-wrap">
          <span className="vx-sello">El mapa completo</span>
          <h2>Las {TOTAL_SALAS} salas de la casa</h2>
          <p>
            Todo lo que VANGUARD tiene por dentro, en {CONSTELACIONES.length} constelaciones. Cada sala abre en el
            cuartel, donde siempre ha vivido — ahora con mapa.
          </p>
          <MapaConstelaciones />
        </div>
      </section>
      <section className="vx-sec" aria-label="Módulos">
        <div className="vx-wrap">
          <ModulosRejilla />
          {estado && (
            <p className="vx-modulos-pie">
              ¿Quieres ver la casa por dentro? <Link href="/modulo/estado">{estado.nombre}</Link> · {estado.pestanas.length} salas
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
