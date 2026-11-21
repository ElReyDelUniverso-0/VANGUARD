import type { CSSProperties } from "react";
import "./experiencia.css";
import { EJES, type Eje, cifrasEcosistema } from "@/lib/experiencia/registro";

/**
 * v436.1 · EL TRÁILER DE FAMILIAS
 * ────────────────────────────────────────────────────────────────────
 * Las diez familias de VANGUARD, presentadas como un tráiler: cada una es
 * una tarjeta con su PORTADA REAL en movimiento, su número y su lema, y
 * sobre todo el tráiler completo de la familia —todas sus experiencias y,
 * para cada módulo que le pertenece, su PORTADA REAL, étiquetada como
 * «módulo»— para que el Dueña vea, en una sola tarjeta, todo lo que hay
 * dentro de cada familia.
 */

const ejeDeFondo = (img: string) =>
  `linear-gradient(180deg, rgba(4, 6, 12, .35) 0%, rgba(4, 6, 12, .78) 100%), url("${img}")`;

export function Ecosistema() {
  const cifras = cifrasEcosistema();

  return (
    <section id="ecosistema" className="vxe-eco" aria-labelledby="vxe-eco-h">
      <div className="vxe-eco-cab">
        <p className="vxe-eco-sello">{cifras.ejes} familias · {cifras.experiencias} experiencias · un solo universo</p>
        <h2 id="vxe-eco-h" className="vxe-eco-titulo">
          Las diez familias, en un tráiler
        </h2>
        <p className="vxe-eco-sub">
          Diez puertas que iluminan el mismo universo. Cada tarjeta es el tráiler de
          una familia: su portada en movimiento y, dentro, todo lo que hay —sus
          experiencias y sus módulos, cada módulo con la cara que le pertenece. Entra
          por donde quieras; todas las rutas terminan en la misma casa.
        </p>
      </div>

      <ul className="vxe-ejes">
        {EJES.map((e: Eje) => (
          <li
            key={e.id}
            className="vxe-eje"
            style={{ ["--eje" as string]: e.color } as unknown as CSSProperties}
          >
            {/* la portada, en movimiento */}
            <div
              className="vxe-eje-portada"
              role="img"
              aria-label={`Portada de ${e.nombre}`}
              style={{ backgroundImage: ejeDeFondo(e.img) }}
            >
              <span className="vxe-eje-num">{e.numero}</span>
              <p className="vxe-eje-lema">{e.lema}</p>
            </div>

            {/* el cuerpo del tráiler */}
            <div className="vxe-eje-corpo">
              <div className="vxe-eje-texto">
                <h3 className="vxe-eje-nombre">{e.nombre}</h3>
                <p className="vxe-eje-promesa">{e.promesa}</p>
                <div className="vxe-eje-cifras">
                  {e.cifras.map((c) => (
                    <span key={c.valor} className="vxe-eje-cifra">
                      <b>{c.valor}</b> {c.etiqueta}
                    </span>
                  ))}
                </div>
              </div>

              {/* el tráiler completo de la familia */}
              <ul className="vxe-eje-exp">
                {e.experiencias.map((x) => (
                  <li key={x.href}>
                    <a href={x.href}>
                      <span className="vxe-eje-exp-nombre">
                        {x.img && (
                          <img
                            className="vxe-eje-exp-img"
                            src={x.img}
                            alt=""
                            aria-hidden="true"
                            loading="lazy"
                          />
                        )}
                        {x.img && <span className="vxe-eje-mod">Módulo</span>}
                        <b>{x.nombre}</b>
                      </span>
                      <span className="vxe-eje-exp-det">{x.detalle}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ul>

      <p className="vxe-eco-pie">
        Todas las familias comparten una sola casa: el{" "}
        <a href="/modulos">cuartel de módulos</a> y su{" "}
        <a href="/ecosistema">mapa del sistema</a>.
      </p>
    </section>
  );
}
