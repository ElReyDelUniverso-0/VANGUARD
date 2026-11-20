// ═══════════════════════════════════════════════════════════════════
// v422.1 REBIRTH · EL ECOSISTEMA — las diez familias de la casa, en una
// sola composición y con sus puertas reales.
//
// SUSTITUYE a tres front doors que competían en la portada:
//   · «AreasRejilla» (8 áreas) — escribía sus enlaces a mano,
//   · la rejilla de módulos (9 módulos) — solo cubría lo que ya era módulo,
//   · y el directorio — verdad, pero a dos clics de distancia.
// Las tres siguen existiendo como componentes (no se borra nada); lo que
// cambia es que la PORTADA lee ahora una sola lista: `lib/experiencia/registro`.
//
// CÓMO SE LEE: cada eje es una fila —número, nombre, promesa y sus cuatro
// experiencias reales. La ilustración es la de verdad (`public/ilustraciones`),
// atenuada, para dar profundidad sin tapar el texto. Nada de tarjetas
// flotantes ni de cristal: un filete, un número y una imagen.
// ═══════════════════════════════════════════════════════════════════

import Link from "next/link";
import { EJES } from "@/lib/experiencia/registro";

export function Ecosistema({ cabecera = true }: { cabecera?: boolean } = {}) {
  return (
    <section id="ecosistema" className="vxe-eco vxp-ancla" aria-labelledby="vxe-eco-titulo">
      {cabecera && (
      <header className="vxe-eco-cab">
        <p className="vxe-eco-sello">Sección 01 · El ecosistema</p>
        <h2 id="vxe-eco-titulo" className="vxe-eco-titulo">
          Diez familias, una sola casa
        </h2>
        <p className="vxe-eco-sub">
          Cada familia tiene su puerta, sus salas y sus cifras. Ninguna es un menú: todas se abren
          con la barra de la casa arriba y tu recorrido guardado en el aparato.
        </p>
      </header>
      )}

      <ol className="vxe-ejes">
        {EJES.map((eje) => (
          <li key={eje.id} className="vxe-eje" style={{ ["--eje" as string]: eje.color }}>
            <Link href={eje.puerta} className="vxe-eje-puerta">
              <span className="vxe-eje-fondo" style={{ backgroundImage: `url(${eje.img})` }} aria-hidden />
              <span className="vxe-eje-num" aria-hidden>
                {eje.numero}
              </span>

              <span className="vxe-eje-texto">
                <span className="vxe-eje-nombre">{eje.nombre}</span>
                <span className="vxe-eje-lema">{eje.lema}</span>
                <span className="vxe-eje-promesa">{eje.promesa}</span>
                {eje.cifras.length > 0 && (
                  <span className="vxe-eje-cifras">
                    {eje.cifras.map((c) => (
                      <span key={c.etiqueta} className="vxe-eje-cifra">
                        <b>{c.valor}</b> {c.etiqueta}
                      </span>
                    ))}
                  </span>
                )}
              </span>

              <span className="vxe-eje-entrar" aria-hidden>
                Entrar <i>→</i>
              </span>
            </Link>

            <ul className="vxe-eje-exp" aria-label={`Experiencias de ${eje.nombre}`}>
              {eje.experiencias.map((x) => (
                <li key={x.href}>
                  <Link href={x.href}>
                    <b>{x.nombre}</b>
                    <span>{x.detalle}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>

      <footer className="vxe-eco-pie">
        <p>
          ¿Buscas una sala concreta y no sabes en qué familia cae?{" "}
          <Link href="/directorio">El directorio</Link> tiene el índice completo, y{" "}
          <Link href="/nucleo">el Núcleo</Link> busca dentro de todas a la vez.
        </p>
      </footer>
    </section>
  );
}
