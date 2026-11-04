import type { Metadata, Viewport } from "next";
import Vanguard2 from "@/components/vanguard2/vanguard2";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";
import { EnlacesNucleo } from "@/components/vanguard/enlaces-nucleo";
import type { EnlaceContextual } from "@/lib/nucleo/tipos";

// ============================================================
// VANGUARD-2 — el NUEVO Vanguard: cada sección es su propio
// mundo 3D independiente, todo en volumen, cero DOM encima.
// ============================================================
export const metadata: Metadata = {
  title: "VANGUARD-2 · El universo 3D total",
  description:
    "El nuevo Vanguard: cada sección vive en su propio mundo 3D independiente. Letras, datos, gráficos y controles — todo en volumen, cada mínimo detalle.",
  robots: { index: true, follow: true },
};

// v208.0 LA LUPA — el zoom vuelve: maximumScale:1 + userScalable:false
// impedían el pellizco de zoom (WCAG 1.4.4) y iOS amplificaba cualquier
// input al enfocar; los lienzos WebGL gestionan su gesto con touch-action.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#02040a",
};

// v241.0 EL UNIVERSO ABIERTO — el módulo más huérfano del censo (auditoría
// de la ronda: 0 CONECTA, 0 noscript, 0 JSON-LD pese a declararse indexable)
// se conecta con la casa SIN TOCAR SU LEY ESTRUCTURAL («cero chrome DOM»:
// el lienzo manda cuando hay JS). Todo lo nuevo vive donde no estorba:
// · JSON-LD WebApplication (patrón v215): Google lee lo que el universo es.
// · noscript (patrón v230/v234): sin JavaScript el 3D no puede nacer — el
//   visitante sin JS y el crawler reciben las PUERTAS REALES del universo,
//   server-rendered con EnlacesNucleo reutilizado. Con JS encendido este
//   bloque no existe: el canvas sigue siendo todo lo que hay.
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://vanguard-kq9r.vercel.app";

// Las puertas son rutas REALES del censo v218 — cero invención.
const PUERTAS_DEL_UNIVERSO: EnlaceContextual[] = [
  {
    etiqueta: "PRIMERA PÁGINA ▸",
    ruta: "/",
    motivo: "el mando clásico de la casa, del que este universo es su espejo en volumen",
    tipoRelacion: "pertenece_a",
  },
  {
    etiqueta: "EL GLOBO 3D ▸",
    ruta: "/mundo",
    motivo: "el planeta en vivo que el mundo de conflictos de VANGUARD-2 resume",
    tipoRelacion: "visible_en",
  },
  {
    etiqueta: "EL MAPA DEL FRENTE ▸",
    ruta: "/ver-guerra",
    motivo: "los teatros documentados que el mundo de conflictos espeja",
    tipoRelacion: "simulado_en",
  },
  {
    etiqueta: "EL RADAR DE GOBIERNOS ▸",
    ruta: "/espia",
    motivo: "las escuchas oficiales que alimentan el mundo de noticias",
    tipoRelacion: "fuente_de",
  },
  {
    etiqueta: "LA BÚSQUEDA DEL NÚCLEO ▸",
    ruta: "/nucleo",
    motivo: "todo el archivo real de la casa, buscable sin lienzos",
    tipoRelacion: "documenta",
  },
  {
    etiqueta: "GUERRA HOY ▸",
    ruta: "/guerra-hoy",
    motivo: "la primera página escrita de la guerra que el universo muestra en volumen",
    tipoRelacion: "pertenece_a",
  },
];

export default function PageVanguard2() {
  // v241.0: la ficha honesta del universo para Google (patrón v215)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "VANGUARD-2 · El universo 3D total",
    applicationCategory: "NewsApplication",
    description:
      "El universo 3D de VANGUARD: noticias en vivo, conflictos documentados, quiz, encuestas, logros y la economía de la guerra — cada sección en su propio mundo tridimensional. Gratis y en español.",
    url: `${SITE_URL}/vanguard2`,
    inLanguage: "es",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    publisher: { "@type": "Organization", name: "VANGUARD", url: SITE_URL },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdSeguro(jsonLd) }}
      />
      <Vanguard2 />
      <noscript>
        <div className="p-5 text-xs leading-relaxed text-zinc-300">
          <p className="rounded-lg border border-white/10 bg-white/[.03] p-4">
            Sin JavaScript el universo 3D no puede nacer — cada sección de
            VANGUARD-2 vive en un lienzo WebGL. La casa sigue en pie sin él:
            estas son las puertas reales del universo, servidas desde el
            servidor.
          </p>
          <EnlacesNucleo enlaces={PUERTAS_DEL_UNIVERSO} titulo="PUERTAS DEL UNIVERSO ▸" />
        </div>
      </noscript>
    </>
  );
}
