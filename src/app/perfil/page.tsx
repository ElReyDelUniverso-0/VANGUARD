import { SITE_URL as SITE_URL_CASA } from "@/lib/site";
import type { Metadata } from "next";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";
import { EnlacesNucleo } from "@/components/vanguard/enlaces-nucleo";
import { FuenteYFecha } from "@/components/vanguard/fuente-y-fecha";
import { PERSONALIZACION_TOTAL, PIEZAS_CARNET_TOTAL } from "@/lib/perfil-jugador";
import { PerfilJugadorCarga } from "@/components/vanguard/perfil-jugador-carga";
import type { EnlaceContextual } from "@/lib/nucleo/tipos";
import { PortadaSala } from "@/components/vanguard/portada-sala";

// ============================================================
// v367.6 EL PERFIL DEL JUGADOR — /perfil
//
// Orden del Dueño: «haz un perfil que cada jugador debe tener, acceder bien a
// Vanguard, los permisos, código y un perfil con agregar una foto y una
// personalización amplia».
//
// Esta sala no inventa el perfil: lo REÚNE. Lo que ya existía en la casa
// (el store del perfil con banner/marco/bio/país/facción/avatar/firma 3D, el
// alias del game-store, el modal de cuenta, el censo de permisos del núcleo,
// la huella anti-suplantación del carnet v359) se enseña en una sola puerta y
// se le suma lo único que faltaba: la foto y el código del jugador en el mismo
// carnet de seis piezas.
//
// Server component: la cabecera y el pie son de servidor (metadata, JSON-LD,
// procedencia y enlaces al núcleo); el panel es cliente porque trabaja con el
// aparato (foto, almacenamiento local, sesión) y se carga con el envoltorio
// `perfil-jugador-carga.tsx` (dynamic ssr:false vive en un componente de
// cliente, como manda Next 16).
// ============================================================

const SITE_URL = SITE_URL_CASA; // v404.1: una sola fuente del dominio (@/lib/site)

export const metadata: Metadata = {
  title: "El perfil del jugador — carnet, código, permisos y foto",
  description:
    `El carnet de jugador de VANGUARD: alias, foto, bio y tu código estable. La foto se reduce en tu aparato y no se sube a ningún servidor.`,
  alternates: { canonical: `${SITE_URL}/perfil` },
};

const PUERTAS: EnlaceContextual[] = [
  {
    etiqueta: "EL RITUAL DE ENTRADA ▸",
    ruta: "/modo",
    motivo: "«¿qué quieres hacer en Vanguard?» — el modo se guarda en la nube con tu cuenta",
    tipoRelacion: "pertenece_a",
  },
  {
    etiqueta: "EL NÚCLEO ▸",
    ruta: "/nucleo",
    motivo: "el censo real de módulos, cada uno con su permiso (publico / cuenta / dueno)",
    tipoRelacion: "documenta",
  },
  {
    etiqueta: "EL CATÁLOGO DE LO QUE YA EXISTE ▸",
    ruta: "/catalogo",
    motivo: "las piezas reales de la casa, con su archivo de origen",
    tipoRelacion: "pertenece_a",
  },
  {
    etiqueta: "PRIVACIDAD ▸",
    ruta: "/privacidad",
    motivo: "qué guarda la casa de ti, y qué no pide jamás",
    tipoRelacion: "documenta",
  },
];

export default function PerfilPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: "El perfil del jugador — VANGUARD",
    description: `Carnet de ${PIEZAS_CARNET_TOTAL} piezas, código de jugador estable, permisos reales del censo y ${PERSONALIZACION_TOTAL} piezas de personalización; la foto se reduce en el aparato y no se sube a ningún servidor.`,
    url: `${SITE_URL}/perfil`,
    isPartOf: { "@type": "WebSite", name: "VANGUARD", url: SITE_URL },
    inLanguage: "es",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdSeguro(jsonLd) }} />
      <main className="min-h-screen bg-zinc-950 text-zinc-200">
        {/* v402.2 — portada de sala: cifras del carnet (lib/perfil-jugador) */}
        <PortadaSala
          imagen="/ilustraciones/perfil.jpg"
          alt="Taquilla abierta con un uniforme colgado en un vestuario en penumbra"
          volanta="Juego · Mi perfil"
          titulo="El perfil del jugador"
          sumario="Tu carnet de agente: alias, foto, código de jugador estable y los permisos reales de la casa. La foto se reduce en tu aparato y no sale de ahí."
          cifras={[
            { valor: PIEZAS_CARNET_TOTAL, etiqueta: "Piezas del carnet", nota: "las que todo jugador debe tener" },
            { valor: PERSONALIZACION_TOTAL, etiqueta: "Personalización", nota: "piezas para hacerlo tuyo" },
          ]}
          acento="#e8c56a"
        />

        <article className="mx-auto max-w-4xl px-5 pt-8">
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-500">
            Un carnet, no un formulario: {PIEZAS_CARNET_TOTAL} piezas que cada jugador debe tener —alias, foto, bio,
            cuenta, modo elegido y el código guardado—, tu código de jugador estable, los permisos reales del censo de
            la casa y {PERSONALIZACION_TOTAL} piezas de personalización. La foto se reduce en tu propio aparato y se
            queda ahí: no hay subida a ningún servidor.
          </p>
        </article>

        <PerfilJugadorCarga />

        <article className="mx-auto max-w-4xl px-5 pb-10">
          <FuenteYFecha
            fuente="el estado real de la casa (profile-store, game-store, /api/auth/me y el censo del núcleo)"
            nota="Ningún dato de esta sala está escrito a mano: el código sale de la huella anti-suplantación del carnet v359, los permisos del campo `permiso` de cada módulo del censo, la sesión de /api/auth/me, y la personalización del store del perfil. La foto se reduce con el canvas del navegador y se guarda en el aparato."
          />

          <section className="mt-8">
            <EnlacesNucleo enlaces={PUERTAS} titulo="CONECTA CON EL NÚCLEO" />
          </section>
        </article>
      </main>
    </>
  );
}
