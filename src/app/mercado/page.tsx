// ═══════════════════════════════════════════════════════════════════
// v437.2 · /mercado — EL MERCADO DE VANGUARD
//
// Orden del Dueño, textual: «haz que la presentación sea un módulo aparte donde
// se llame el mercado de vanguard, que tenga estética de mercado, donde presente
// cada módulo con un personaje enseñando cada uno, interactúe, con una música
// clásica sencilla y que se te quede en la cabeza… enseña cada módulo
// perfectamente con sus secciones… y quítalos del menú principal».
//
// Esta página es el módulo: portada con foto real de un bazar, cuatro cifras
// derivadas y la plaza entera debajo. Todo lo que se ve sale de
// `lib/experiencia/registro` (la fuente única de las diez familias) más los
// mercaderes de `lib/mercado/puestos`: no hay una segunda lista de módulos.
// ═══════════════════════════════════════════════════════════════════

import type { Metadata } from "next";
import Link from "next/link";
import { PortadaSala } from "@/components/vanguard/portada-sala";
import { MercadoCliente } from "@/components/mercado/mercado-cliente";
import { PUESTOS, cifrasMercado, puestoDelDia } from "@/lib/mercado/puestos";
import { DURACION_VUELTA, BPM } from "@/lib/mercado/musica";
import { pregonDelDia } from "@/lib/mercado/pregon";

export const metadata: Metadata = {
  title: "El mercado de Vanguard · las diez familias, puesto a puesto",
  description:
    "Diez puestos, diez mercaderes y todas las secciones de cada familia de Vanguard, con su música de plaza. Abre un puesto y mira lo que vende.",
  alternates: { canonical: "/mercado" },
};

export default function MercadoPage() {
  const cifras = cifrasMercado();
  const delDia = puestoDelDia();
  const pregon = pregonDelDia();

  return (
    <main className="pm-pagina">
      <PortadaSala
        imagen="/imagenes-reales/estambul.jpg"
        alt="Puestos de un bazar cubierto, con sus toldos y sus mercaderes atendiendo"
        volanta="Módulo · el mercado"
        titulo="El mercado de Vanguard"
        sumario="Las diez familias de la casa, cada una en su puesto y con su mercader: abre uno y te enseña su puerta y todas sus secciones. Música de plaza, corta y tarareable."
        cifras={[
          { valor: cifras.puestos, etiqueta: "puestos", nota: "uno por familia" },
          { valor: cifras.mercaderes, etiqueta: "mercaderes", nota: "con nombre y oficio" },
          { valor: cifras.secciones, etiqueta: "secciones", nota: "rutas reales" },
          { valor: `${BPM} ppm`, etiqueta: "la contradanza", nota: `${DURACION_VUELTA.toFixed(1)} s la vuelta` },
        ]}
        acento="#e8c56a"
        nota="Cada sección es una ruta que existe: la prueba del mercado recorre las rutas y comprueba una a una que están en src/app."
      />

      <MercadoCliente />

      <footer className="pm-pie">
        <span>
          Hoy atiende el puesto {delDia.numero} · {delDia.nombre}, con {delDia.personaje.nombre},{" "}
          {delDia.personaje.oficio}. Y el pregón de hoy dice: «{pregon.texto}»
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
                  {p.personaje.nombre}, {p.personaje.oficio} · {p.secciones.length} secciones
                </p>
              </span>
            </li>
          ))}
        </ul>
      </noscript>
    </main>
  );
}
