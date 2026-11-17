import type { Metadata } from "next";
import { PortadaSala } from "@/components/vanguard/portada-sala";
import { FuenteYFecha } from "@/components/vanguard/fuente-y-fecha";
import { EnlacesNucleo } from "@/components/vanguard/enlaces-nucleo";
import { EspacioTrabajo } from "@/components/vanguard/espacio/espacio-trabajo";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";
import type { EnlaceContextual } from "@/lib/nucleo/tipos";
import { CLASES } from "@/lib/espacio/almacen";

// ═══════════════════════════════════════════════════════════════════
// v405.11 · EL ESPACIO DE TRABAJO — /espacio
//
// LA AUDITORÍA: lo guardado y lo personal de la casa estaba en cuatro
// almacenes que no se hablaban — favoritos del riel (vg171-favoritos), uso
// real de las salas (vg195-atajos-usage), orden de herramientas de la
// navegación (vx405.10-navegacion) y el perfil/progreso (profile-store,
// perfil-jugador, game-store). Y no existía NINGÚN sitio donde guardar un
// trabajo: una investigación con sus mapas, un escenario con sus notas.
//
// LA RESPUESTA: una mesa. Proyectos, y dentro de cada uno, piezas y paneles
// reorganizables, sesiones que se continúan, actividad con su fecha y una
// papelera que restaura. Los almacenes viejos NO se tocan: se leen una vez
// para sembrar el primer proyecto (favoritos y salas más usadas).
// ═══════════════════════════════════════════════════════════════════

export const metadata: Metadata = {
  title: "Tu espacio de trabajo · proyectos, sesiones e historial",
  description:
    "El escritorio de VANGUARD: proyectos con mapas, simulaciones, escenarios, herramientas y notas; paneles reorganizables, sesiones guardadas, historial de actividad y recuperación del trabajo. Todo en tu aparato.",
  alternates: { canonical: "/espacio" },
};

const PUERTAS: EnlaceContextual[] = [
  { etiqueta: "EL CENTRO DE MAPAS ▸", ruta: "/mapas", motivo: "añade a tu proyecto los mapas que estés mirando, con su capa y su país", tipoRelacion: "pertenece_a" },
  { etiqueta: "EL TEATRO TÁCTICO ▸", ruta: "/teatro-3d", motivo: "los escenarios y simulaciones que se guardan como piezas del proyecto", tipoRelacion: "pertenece_a" },
  { etiqueta: "LA NAVEGACIÓN ▸", ruta: "/navegacion", motivo: "los diez espacios y sus herramientas: de ahí salen los accesos del proyecto", tipoRelacion: "pertenece_a" },
  { etiqueta: "TU CARNET ▸", ruta: "/perfil", motivo: "tu identidad, tu progreso y tu personalización, junto al trabajo", tipoRelacion: "pertenece_a" },
];

export default function EspacioPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Espacio de trabajo de VANGUARD",
    applicationCategory: "ProductivityApplication",
    operatingSystem: "Web",
    description:
      "Proyectos con piezas (mapas, simulaciones, escenarios, herramientas, investigaciones y notas), paneles reorganizables, sesiones guardadas, historial y recuperación del trabajo.",
    inLanguage: "es",
  };

  return (
    <>
      <main className="mx-auto max-w-[1408px] px-4 pb-16 pt-6 sm:px-6">
        <PortadaSala
          imagen="/ilustraciones/herramientas.jpg"
          alt="Mesa de trabajo con planos, instrumentos y libretas abiertas"
          volanta="LA CASA · TU MESA"
          titulo="TU ESPACIO DE TRABAJO"
          nivel="h1"
          acento="#5eead4"
          sumario="Un proyecto no es una carpeta: es un trabajo con su mapa, su simulación, sus escenarios y sus notas, con los paneles donde tú quieras y una sesión que se continúa mañana. Lo que había suelto —favoritos, uso, herramientas— ya está aquí dentro."
          cifras={[
            { valor: CLASES.length, etiqueta: "tipos de pieza", nota: "mapas, simulaciones, escenarios…" },
            { valor: 6, etiqueta: "paneles", nota: "reorganizables y apagables" },
            { valor: 30, etiqueta: "sesiones", nota: "guardadas por proyecto" },
            { valor: 25, etiqueta: "pasos", nota: "para deshacer" },
          ]}
          puntos={[
            {
              titulo: "TU MESA, TU ORDEN",
              texto:
                "Cada proyecto tiene sus paneles: el trabajo, los accesos, las sesiones, la actividad, el deshacer y la papelera. Se suben, se bajan y se apagan; el orden es tuyo y se guarda.",
            },
            {
              titulo: "NADA SE PIERDE",
              texto:
                "Quitar una pieza la manda a la papelera; archivar un proyecto lo saca de la lista sin borrarlo; y cada paso deja una huella para deshacerlo. Recuperar el trabajo no es una promesa, es un botón.",
            },
            {
              titulo: "LO QUE YA TENÍAS, DENTRO",
              texto:
                "Tus favoritos del riel y las salas que más usas siembran el primer proyecto al entrar. No hay que empezar de cero ni volver a marcar nada.",
            },
          ]}
          nota="Todo se guarda en este aparato (localStorage): proyectos, paneles, sesiones, actividad y papelera. No hay cuentas, así que la casa no puede ver tu mesa — y por eso mismo exportar e importar existe."
        />

        <EspacioTrabajo />

        <section className="mt-12" aria-label="Qué había y qué se ha fusionado">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.24em] text-zinc-400">LO QUE HABÍA, Y DÓNDE ESTÁ AHORA</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full border-collapse text-left font-mono text-[10.5px]">
              <thead>
                <tr className="text-zinc-500">
                  <th className="border-b border-zinc-800 py-1.5 pr-3 uppercase tracking-[0.12em]">almacén que había</th>
                  <th className="border-b border-zinc-800 py-1.5 pr-3 uppercase tracking-[0.12em]">qué guardaba</th>
                  <th className="border-b border-zinc-800 py-1.5 uppercase tracking-[0.12em]">qué hace ahora</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["vg171-favoritos", "los módulos fijados en el riel", "se lee al entrar y siembra el primer proyecto con tus favoritos; el riel sigue igual"],
                  ["vg195-atajos-usage", "cuántas veces abriste cada sala", "se lee al entrar y añade tus salas más usadas como piezas; el contador sigue igual"],
                  ["vx405.10-navegacion", "el orden de las herramientas por espacio", "sigue mandando en la barra; sus herramientas se pueden añadir a un proyecto desde el panel de accesos"],
                  ["profile-store / perfil-jugador", "personalización, carnet y progreso", "no se toca: /perfil sigue siendo tu identidad; la mesa es tu trabajo"],
                  ["— (no existía)", "un trabajo con sus piezas y sus sesiones", "esto: proyectos, piezas, paneles, sesiones, actividad y papelera"],
                ].map(([a, b, c]) => (
                  <tr key={a} className="align-top">
                    <td className="border-b border-zinc-900 py-1.5 pr-3 text-teal-300">{a}</td>
                    <td className="border-b border-zinc-900 py-1.5 pr-3 text-zinc-400">{b}</td>
                    <td className="border-b border-zinc-900 py-1.5 text-zinc-500">{c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <FuenteYFecha
          fuente="Almacenes reales del repositorio: src/lib/favoritos-store.ts (vg171-favoritos), src/lib/nav.ts (vg195-atajos-usage), src/lib/navegacion/paneles.ts (vx405.10-navegacion), src/lib/profile-store.ts y src/lib/perfil-jugador.ts · registro de herramientas de src/lib/navegacion/espacios.ts"
          nota="La mesa no inventa datos: lee los almacenes que ya existían (sin modificarlos) y guarda tu trabajo en el aparato. El panel de papelera y el de deshacer existen precisamente para que un clic equivocado no cueste nada."
        />

        <section className="mt-10 pb-10">
          <EnlacesNucleo enlaces={PUERTAS} titulo="CONECTA CON EL NÚCLEO" />
        </section>
      </main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdSeguro(jsonLd) }} />
    </>
  );
}
