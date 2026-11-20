// ═══════════════════════════════════════════════════════════════════
// v422.1 REBIRTH · LA ENTRADA — qué es Vanguard, dicho en cinco segundos.
//
// PROBLEMA: al abrir la portada lo primero que se veía era un teletipo, un
// bloque de historias y —tres secciones más abajo— el héroe que explicaba qué
// es la casa. Quien llegaba de un enlace no sabía dónde estaba.
//
// QUÉ HACE: una composición de entrada (cosmos + arquitectura, sin
// glassmorphism y sin vídeos) con una frase, tres acciones y cuatro cifras
// REALES derivadas de los datos de la casa. La animación de entrada es CSS,
// se ejecuta una sola vez y se apaga con `prefers-reduced-motion`; no hay
// JavaScript de cliente ni recursos externos.
//
// ACCESIBILIDAD: es una `section` con `aria-labelledby`, el titular es el
// `h1` único de la portada, y hay un enlace «saltar al contenido» real.
// ═══════════════════════════════════════════════════════════════════

import Link from "next/link";
import { cifrasEcosistema } from "@/lib/experiencia/registro";

export function Entrada({ cables }: { cables: number }) {
  const c = cifrasEcosistema();

  return (
    <section className="vxe-ent" aria-labelledby="vxe-ent-titulo">
      {/* capas de profundidad: puro CSS, cero imágenes de fondo pesadas */}
      <div className="vxe-ent-cosmos" aria-hidden>
        <span className="vxe-ent-estrella vxe-ent-e1" />
        <span className="vxe-ent-estrella vxe-ent-e2" />
        <span className="vxe-ent-estrella vxe-ent-e3" />
        <span className="vxe-ent-horizonte" />
      </div>

      <div className="vxe-ent-caja">
        <p className="vxe-ent-sello">
          <span className="vxe-ent-punto" aria-hidden />
          VANGUARD · EL MUNDO EN TIEMPO REAL
          {cables > 0 ? <span className="vxe-ent-cables"> · {cables} cables abiertos ahora</span> : null}
        </p>

        <h1 id="vxe-ent-titulo" className="vxe-ent-titulo">
          Un universo digital.
          <br />
          <em>Diez formas de entrar.</em>
        </h1>

        <p className="vxe-ent-lema">
          Actualidad, geografía, historia, ciencia, economía y datos, educación, simulaciones,
          narrativa, investigación y los mundos que se crean aquí. Una sola casa, con la fuente a
          la vista y la misma barra en todas partes.
        </p>

        <div className="vxe-ent-acciones">
          <a className="vxe-btn vxe-btn--oro" href="#ecosistema">
            Explorar el ecosistema
          </a>
          <a className="vxe-btn vxe-btn--linea" href="#ahora">
            Lo que pasa ahora
          </a>
          <Link className="vxe-btn vxe-btn--fantasma" href="/cuartel">
            El Cuartel
          </Link>
        </div>

        <dl className="vxe-ent-cifras">
          <div>
            <dt>familias</dt>
            <dd>{c.ejes}</dd>
          </div>
          <div>
            <dt>experiencias</dt>
            <dd>{c.experiencias}</dd>
          </div>
          <div>
            <dt>países con ficha</dt>
            <dd>{c.paises}</dd>
          </div>
          <div>
            <dt>publicaciones con DOI</dt>
            <dd>{c.publicaciones}</dd>
          </div>
          <div>
            <dt>lecciones</dt>
            <dd>{c.lecciones}</dd>
          </div>
        </dl>
      </div>

      <a className="vxe-ent-bajar" href="#ecosistema" aria-label="Bajar al ecosistema">
        <span aria-hidden>↓</span>
        <em>el ecosistema</em>
      </a>
    </section>
  );
}
