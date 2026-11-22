import type { Metadata } from "next";
import { PortadaSala } from "@/components/vanguard/portada-sala";
import { FuenteYFecha } from "@/components/vanguard/fuente-y-fecha";
import { EnlacesNucleo } from "@/components/vanguard/enlaces-nucleo";
import { MarcoWorlds } from "@/components/mundos-vivos/marco-worlds";
import "@/components/mundos-vivos/worlds.css";
import { construirPayloadMundos, experienciasPorCategoria } from "@/lib/mundos-vivos/payload";
import { CATEGORIA_MUNDOS } from "@/lib/mundos-vivos/tipos";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";
import type { EnlaceContextual } from "@/lib/nucleo/tipos";

// ═══════════════════════════════════════════════════════════════════
// v422.0 · VANGUARD WORLDS — EL MUNDO VIVO
//
// LO QUE HAY: cinco MUNDOS explorables, no un globo giratorio con
// marcadores. Cada mundo es una ZONA REAL (América, Europa, África,
// Asia, Oceanía) con lugares de verdad —lat/lng reales— y cada lugar
// te lleva a una experiencia de Vanguard que ya existe: la ficha del
// país, su atlas, una gran obra documentada, la historia, los datos,
// la ciencia, la academia. Nada ficticio, nada inventado: todo el
// conteúdo que atraviesa cada lugar es una puerta que existe.
//
// TRES VISTAS, TRES TRANSICIONES: Mundo → Zona → Lugar. Capas
// conmutables que REUTILIZAN las declaraciones del Centro de Mapas
// (el mismo globo, la misma fuente), el buscador vuela al lugar, y
// cuando no hay WebGL o el visitante lo pide, el mismo mundo se
// despliega como plano 2D dibujado en código.
//
// ARQUITECTURA: un mundo es una DECLARACION en
// src/lib/mundos-vivos/zonas.ts. El sexto mundo no toca ni el globo ni
// esta página.
// ═══════════════════════════════════════════════════════════════════

export const metadata: Metadata = {
  title: "VANGUARD WORLDS · cinco mundos explorables, un planeta vivo",
  description:
    "Explora cinco mundos de verdad —América, Europa, África, Asia y Oceanía— como zonas con lugares reales. En cada uno, las experiencias de VANGUARD que ya existen: fichas de país, atlas, grandes obras documentadas, historia, datos y ciencia.",
  alternates: { canonical: "/worlds" },
};

const PUERTAS: EnlaceContextual[] = [
  {
    etiqueta: "EL CENTRO DE MAPAS ▸",
    ruta: "/mapas",
    motivo: "el globo de las ocho capas: el mismo planeta y las mismas fuentes que pintan cada mundo aquí",
    tipoRelacion: "pertenece_a",
  },
  {
    etiqueta: "EL ATLAS DE INFRAESTRUCTURA ▸",
    ruta: "/infraestructura",
    motivo: "las obras documentadas que cada lugar linkea: puentes, puertos, ferrocarriles y centrales del planeta",
    tipoRelacion: "pertenece_a",
  },
  {
    etiqueta: "EL MUNDO 3D ▸",
    ruta: "/mundo",
    motivo: "el globo de las guerras vivas: la otra vida del mismo motor 3D",
    tipoRelacion: "pertenece_a",
  },
  {
    etiqueta: "EL INDICE DE PAISES ▸",
    ruta: "/mundos",
    motivo: "las fichas completas de cada país: el texto que explica cada lugar del mundo",
    tipoRelacion: "pertenece_a",
  },
  {
    etiqueta: "DATOS MUNDIALES ▸",
    ruta: "/datos-mundiales",
    motivo: "las cifras reales que dan contenido a cada experiencia",
    tipoRelacion: "pertenece_a",
  },
];

export default function WorldsPage() {
  const payload = construirPayloadMundos();
  const porCategoria = experienciasPorCategoria(payload);

  const jsonLd = jsonLdSeguro({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "VANGUARD WORLDS",
    applicationCategory: "GeographicalExplorationApplication",
    operatingSystem: "Web",
    inLanguage: "es",
    description:
      "Cinco mundos explorables como zonas geográficas reales: América, Europa, África, Asia y Oceanía, con lugares reales y experiencias documentadas de VANGUARD.",
    url: "/worlds",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <PortadaSala ruta="/worlds"
        imagen="/imagenes-reales/satelite.jpg"
        alt="El planeta visto desde el espacio, con la luz del amanecer sobre el horizonte"
        volanta="AGENTE 04 · VANGUARD WORLDS"
        titulo="El mundo vivo"
        nivel="h1"
        acento="#5eead4"
        sumario="Cinco mundos explorables, no un globo giratorio con marcadores. América, Europa, África, Asia y Oceanía como zonas reales: cada lugar te lleva a la experiencia de VANGUARD que ya existe para ese rincón del planeta —ficha, atlas, obra, historia, datos, ciencia—. Navega Mundo → Zona → Lugar, enciende las capas del Centro de Mapas y vuela al lugar que busques. Sin motor 3D, el mismo mundo se despliega como plano."
        nota="Los mundos son zonas geográficas reales con lugares documentados; cada experiencia linkeada es una puerta existente de VANGUARD (ficha, atlas, obra, historia, datos, ciencia)."
      />

      <MarcoWorlds payload={payload} />

      <div className="vx-md-caja" style={{ paddingTop: 0 }}>
        <FuenteYFecha
          fuente="VANGUARD · Departamento de mundos vivos"
          nota="Cada experiencia linkeada es una puerta existente de la casa (ficha de país, atlas, obra documentada, historia, datos, ciencia). Los lugares son geografía real; el contenido es el que VANGUARD ya documenta. Sin datos inventados."
        />
        <div className="vx-md-barra" style={{ marginTop: 20 }}>
          <span style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--gris)" }}>
            {porCategoria.length} experiencias en el mundo · por categoría
          </span>
          {porCategoria.map((c) => {
            const cat = CATEGORIA_MUNDOS.find((x) => x.clave === c.clave);
            return (
              <span
                key={c.clave}
                style={{
                  border: "1px solid var(--borde)",
                  borderRadius: "999px",
                  padding: "7px 14px",
                  fontSize: 12,
                  color: "#ddd7c7",
                  background: "#0b0b0e",
                  borderLeft: `3px solid ${cat?.acento ?? "var(--oro)"}`,
                }}
              >
                {c.etiqueta} · <strong style={{ color: "var(--teal)" }}>{c.cuenta}</strong>
              </span>
            );
          })}
        </div>
        <EnlacesNucleo enlaces={PUERTAS} />
      </div>
    </>
  );
}
