// ═══════════════════════════════════════════════════════════════════
// v437.2 · /mercado — EL MERCADO DE VANGUARD
//
// Orden del Dueño, textual: «haz que la presentación sea un módulo aparte donde
// se llame el mercado de vanguard, que tenga estética de mercado, donde presente
// cada módulo con su agente de la casa enseñándolo, interactivo, con una música
// clásica sencilla y que se te quede en la cabeza… enseña cada módulo
// perfectamente con sus secciones… y quítalos del menú principal».
//
// Esta página es el módulo: portada con foto real de un bazar, cuatro cifras
// derivadas y la plaza entera debajo. Todo lo que se ve sale de
// `lib/experiencia/registro` (la fuente única de las diez familias) más los
// mercaderes de `lib/mercado/puestos`: no hay una segunda lista de módulos.
// ═══════════════════════════════════════════════════════════════════

// v440.3 · LA PIEL DEL MERCADO, POR FIN EN EL MERCADO.
// `components/mercado/mercado.css` sólo se importaba desde `MercadoPortada`,
// que vive en la portada de la casa: al entrar en /mercado el navegador no
// bajaba ni una línea de esa hoja. La plaza entera —toldos, mostrador, cesta,
// buscador— se servía como texto plano. Se importa aquí, que es donde se usa.
import "@/components/mercado/mercado.css";

import type { Metadata } from "next";
import Link from "next/link";
import { PortadaSala } from "@/components/vanguard/portada-sala";
import { MercadoCliente } from "@/components/mercado/mercado-cliente";
import { VitrinaModulos } from "@/components/mercado/vitrina";
import { PUESTOS, cifrasMercado, puestoDelDia } from "@/lib/mercado/puestos";
import { DURACION_VUELTA_SUAVE, BPM_SUAVE } from "@/lib/mercado/musica-suave";
import { cifrasVitrina } from "@/lib/mercado/vitrina";
import { pregonDelDia } from "@/lib/mercado/pregon";
import { APP_VERSION_LABEL } from "@/lib/version";

export const metadata: Metadata = {
  title: "El mercado de Vanguard · los módulos de la casa, uno detrás de otro",
  description:
    "El escaparate de Vanguard: los cuatro módulos y todas sus salas con su descripción, rotando sin parar, y la plaza con sus diez puestos. Música suave.",
  alternates: { canonical: "/mercado" },
};

export default function MercadoPage() {
  const cifras = cifrasMercado();
  const vitrina = cifrasVitrina();
  const delDia = puestoDelDia();
  const pregon = pregonDelDia();

  return (
    <main className="pm-pagina">
      <PortadaSala ruta="/mercado"
        imagen="/imagenes-reales/estambul.jpg"
        alt="Puestos de un bazar cubierto, con sus toldos y sus mercaderes atendiendo"
        volanta="Módulo · el mercado"
        titulo="El mercado de Vanguard"
        sumario="Los módulos de Vanguard, uno detrás de otro y con lo que hace cada sala, pasando sin parar hasta que los hayas visto todos. Debajo, la plaza: diez puestos, un agente en cada uno y todas sus secciones. Música suave, sin prisa."
        cifras={[
          { valor: cifras.puestos, etiqueta: "puestos", nota: "uno por familia" },
          { valor: cifras.mercaderes, etiqueta: "mercaderes", nota: "con nombre y oficio" },
          { valor: vitrina.salas, etiqueta: "salas en el escaparate", nota: "de los cuatro módulos" },
          { valor: `${BPM_SUAVE} ppm`, etiqueta: "música suave", nota: `${DURACION_VUELTA_SUAVE.toFixed(0)} s la vuelta` },
        ]}
        acento="#e8c56a"
        nota="Cada ficha del escaparate es una ruta que existe y su descripción es la de la casa: el mercado no escribe carteles nuevos, los recoge."
      />

      {/* v440.3 · lo primero que se ve: los módulos de la casa, con su
          descripción, pasando sin parar. La plaza viene después. */}
      <VitrinaModulos />

      <MercadoCliente version={APP_VERSION_LABEL} />

      <footer className="pm-pie">
        <span>
          Hoy atiende el puesto {delDia.numero} · {delDia.nombre}, con {delDia.agente.nombre},{" "}
          {delDia.agente.oficio}. Y el pregón de hoy dice: «{pregon.texto}»
        </span>
        <Link href="/mercado#plaza">volver a la plaza ↑</Link>
      </footer>

      {/* el índice completo sigue existiendo para quien quiera la lista seca */}
      <noscript>
        <ul className="pm-secciones">
          {PUESTOS.map((p) => (
            <li key={p.id} className="pm-seccion">
              <span className="pm-seccion-txt">
                <Link href={p.puerta}>{p.nombre}</Link>
                <p>
                  {p.agente.nombre}, {p.agente.oficio} · {p.secciones.length} secciones
                </p>
              </span>
            </li>
          ))}
        </ul>
      </noscript>
    </main>
  );
}
