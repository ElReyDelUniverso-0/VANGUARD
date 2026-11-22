import type { Metadata } from "next";
import { PortadaSala } from "@/components/vanguard/portada-sala";
import { FuenteYFecha } from "@/components/vanguard/fuente-y-fecha";
import { EnlacesNucleo } from "@/components/vanguard/enlaces-nucleo";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";
import { ExploradorMundial, type ObjetivoEarth } from "@/components/earth/explorador-mundial";
import { PAISES_GEO } from "@/lib/geo-paises";
import { HITOS } from "@/lib/earth/hitos";
import { LUGARES, CRONICAS } from "@/lib/tierra-data";
import { PUNTOS_HISTORICOS, PUNTOS_ACONTECIMIENTOS } from "@/lib/mapas-capas";
import "@/components/earth/earth.css";

// ═══════════════════════════════════════════════════════════════════
// v416.0 · /tierra — VANGUARD EARTH SYSTEM.
//
// El ecosistema geográfico de la casa: un solo planeta con todas las
// lecturas conectadas. Entra por aquí el visitante que quiere explorar el
// mundo sin sentirse limitado a un mapa estático — y entran también las
// fichas de país, que vuelan hasta su propio lugar con ?volar=lat,lng.
//
// La página es de SERVIDOR a propósito: la portada, las cifras y el destino
// inicial se sirven en el HTML; el explorador (globo 3D incluido) baja en su
// propio chunk, como en /mapas y /mundo.
// ═══════════════════════════════════════════════════════════════════

export const metadata: Metadata = {
  title: "VANGUARD EARTH SYSTEM · el planeta entero, capa por capa",
  description:
    "El ecosistema geográfico de VANGUARD: explorador mundial en 3D y 2D, capas conmutables (regiones, relieve, ríos, montañas, océanos, desiertos, fronteras), catálogo de lugares, recorridos guiados, comparador territorial, mediciones con coordenadas y el mapa histórico del archivo.",
  alternates: { canonical: "/tierra" },
};

const PUERTAS = [
  { etiqueta: "EL CENTRO DE MAPAS ▸", ruta: "/mapas", motivo: "ocho capas de datos reales sobre el mismo globo", tipoRelacion: "pertenece_a" },
  { etiqueta: "EL MAPA DE LOS MUNDOS ▸", ruta: "/mundos", motivo: "los 249 países con ficha y fronteras; cada uno vuela hasta aquí", tipoRelacion: "pertenece_a" },
  { etiqueta: "EL ATLAS ▸", ruta: "/atlas", motivo: "la ficha larga de cada país", tipoRelacion: "pertenece_a" },
  { etiqueta: "EL MUNDO 3D ▸", ruta: "/mundo", motivo: "el globo de las guerras vivas", tipoRelacion: "pertenece_a" },
  { etiqueta: "VANGUARD EARTH ▸", ruta: "/cuartel", motivo: "el satélite espía con sensores, cockpit y contactos en vivo", tipoRelacion: "pertenece_a" },
] as const;

interface Props {
  searchParams: Promise<{ volar?: string; pais?: string }>;
}

function objetivoDe(searchParams: { volar?: string; pais?: string }): ObjetivoEarth | null {
  const raw = searchParams?.volar;
  if (!raw) return null;
  const [lat, lng] = raw.split(",").map((n) => Number(n.trim()));
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat, lng, pais: searchParams.pais };
}

export default async function TierraPage({ searchParams }: Props) {
  const params = await searchParams;
  const objetivo = objetivoDe(params);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "VANGUARD EARTH SYSTEM",
    applicationCategory: "GeographyApplication",
    operatingSystem: "Web",
    inLanguage: "es",
    description:
      "Explorador geográfico conectado: globo 3D y atlas 2D con capas de regiones, relieve, ríos, montañas, océanos, desiertos, fronteras, lugares, recorridos, comparador territorial y mapa histórico.",
    featureList: [
      "Explorador mundial 3D/2D",
      "Capas geográficas conmutables",
      "Catálogo de lugares y hitos",
      "Recorridos guiados por el planeta",
      "Comparador territorial entre naciones",
      "Medición de distancias y coordenadas",
      "Mapa histórico de las guerras del archivo",
    ],
  };

  return (
    <main className="mx-auto max-w-[1408px] px-4 pb-16 pt-6 sm:px-6">
      <PortadaSala ruta="/tierra"
        imagen="/imagenes-reales/satelite.jpg"
        alt="El planeta visto desde el espacio, con la luz del amanecer sobre el horizonte"
        volanta="LA CASA · GEOGRAFÍA"
        titulo="VANGUARD EARTH SYSTEM"
        nivel="h1"
        acento="#4DC9FF"
        sumario="Un solo planeta y todas las formas de mirarlo: regiones, relieve real, ríos, montañas, océanos, desiertos y fronteras en capas conmutables; lugares vigilados, recorridos guiados, comparador territorial y el mapa histórico del archivo. En 3D o en atlas 2D, con el mismo destino."
        cifras={[
          { valor: PAISES_GEO.length, etiqueta: "países", nota: "con identidad ISO" },
          { valor: HITOS.length, etiqueta: "hitos", nota: "ríos, cumbres, mares" },
          { valor: LUGARES.length, etiqueta: "lugares", nota: "vigilados" },
          { valor: CRONICAS.length, etiqueta: "recorridos", nota: "guiados" },
          { valor: PUNTOS_HISTORICOS.length, etiqueta: "guerras", nota: "del archivo" },
        ]}
        puntos={[
          {
            titulo: "UN PLANETA, TODAS LAS LECTURAS",
            texto:
              "No son diez mapas sueltos: es un globo con un registro de capas. Añadir la próxima es declararla, no programar otro mapa.",
          },
          {
            titulo: "DEL PLANETA AL PAÍS",
            texto:
              "Toca un país y tienes su ficha geográfica; desde su ficha completa puedes volver volando hasta el mismo punto. La casa entera está conectada por coordenadas.",
          },
          {
            titulo: "MEDIR EL MUNDO",
            texto:
              "Toca dos puntos y la casa te dice los kilómetros. Cada toque deja sus coordenadas escritas: el mapa también es una regla.",
          },
        ]}
        nota="Arrastra para girar, rueda o botones para acercar, buscador de países arriba a la derecha. En móvil, el mismo sistema con los mandos a mano y, en aparatos ligeros, la vista plana entra sola."
      />

      <ExploradorMundial objetivo={objetivo} acontecimientos={PUNTOS_ACONTECIMIENTOS} />

      <FuenteYFecha
        fuente="Natural Earth 110m (polígonos) · ISO 3166-1 vía mledoze/countries (identidad y coordenadas) · Banco Mundial (población, superficie, gasto) vía la ficha de la casa · NASA Blue Marble / earth-topology (textura y relieve) · game-data.ts (guerras) · tierra-data.ts (lugares y recorridos) · earth/hitos.ts (hitos físicos de referencia)"
        nota="Ninguna capa inventa un dato: si una fuente no cubre un país, su ficha lo dice con la palabra «sin dato». Los hitos son coordenadas de referencia pública; el relieve lo pinta la textura real del planeta."
      />

      <section className="mt-10 pb-10">
        <EnlacesNucleo enlaces={[...PUERTAS]} titulo="CONECTA CON EL NÚCLEO" />
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdSeguro(jsonLd) }} />
    </main>
  );
}
