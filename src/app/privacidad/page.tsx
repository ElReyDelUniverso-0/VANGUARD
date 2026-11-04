import type { Metadata } from "next";
import Link from "next/link";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";
import { EnlacesNucleo } from "@/components/vanguard/enlaces-nucleo";
import type { EnlaceContextual } from "@/lib/nucleo/tipos";

// v206.0 MÁS PUERTAS — política de privacidad pública e indexable.
// Publisher Center (Google News) exige una URL de política de privacidad
// para validar la publicación; además transmite confianza a Google y a los
// visitantes. Texto honesto sobre lo que la casa realmente maneja:
// identidad local, cuentas con contraseña hasheada, cookie de sesión
// técnica y terceros técnicos (fuentes de noticias, imágenes y mapas).
// v243.0 LA POLÍTICA VIVA — la única sala del censo que ninguna ronda
// había expandido desde su nacimiento (v206) viste el kit de la casa:
// · JSON-LD WebPage (patrón v215): la ficha estructurada de la página que
//   Publisher Center exige.
// · CONECTA CON EL NÚCLEO (patrón v230): 3 puertas REALES del censo.
// · Sección 9 «La frontera técnica, a la vista»: la política documenta lo
//   que el árbol DECLARA — los 4 almacenes privados de src/lib/nucleo/
//   fuentes.ts (fnt:cuentas, fnt:jugadores, fnt:telemetria,
//   fnt:conversacion) que la búsqueda jamás consulta, vigilado por la
//   suite de pruebas del núcleo. Sin noscript a propósito: esta página es
//   100% server-rendered y funciona entera sin JavaScript — fingir una
//   carencia sería mentir (ley de la casa: la honestidad como técnica).

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://vanguard-kq9r.vercel.app";

export const metadata: Metadata = {
  title: "Política de Privacidad | VANGUARD",
  description:
    "Cómo VANGUARD maneja tus datos: identidad local en tu aparato, cuentas con contraseña cifrada, cookie de sesión técnica y terceros técnicos. Sin venta de datos.",
  alternates: {
    canonical: `${SITE_URL}/privacidad`,
  },
};

// v243.0 — las puertas del lector de la política: rutas REALES del censo.
const PUERTAS_DE_LA_POLITICA: EnlaceContextual[] = [
  {
    etiqueta: "EL CENSO DEL NÚCLEO ▸",
    ruta: "/nucleo",
    motivo: "donde la casa declara sus fuentes públicas y sus 4 almacenes privados — la frontera que esta política describe, a la vista",
    tipoRelacion: "documenta",
  },
  {
    etiqueta: "TU MODO · TU CUENTA ▸",
    ruta: "/modo",
    motivo: "la puerta de la cuenta que esta política protege",
    tipoRelacion: "pertenece_a",
  },
  {
    etiqueta: "PRIMERA PÁGINA ▸",
    ruta: "/",
    motivo: "la Casa entera, de donde esta página es la letra pequeña",
    tipoRelacion: "pertenece_a",
  },
];

const SECCIONES: { titulo: string; parrafos: string[] }[] = [
  {
    titulo: "1. Quiénes somos",
    parrafos: [
      "VANGUARD (en adelante, «la Casa») es una plataforma web de seguimiento de conflictos mundiales en tiempo real, accesible en español desde vanguard-kq9r.vercel.app. Reúne noticias verificadas por fuente, un mapa de inteligencia en vivo y modos de juego comunitarios. Esta política explica qué información se maneja, por qué y con qué límites.",
    ],
  },
  {
    titulo: "2. Lo que se guarda en tu aparato (y nunca sale de él)",
    parrafos: [
      "Tu identidad de juego básica (alias, preferencias de vista, interruptores de sonido y voz) se guarda localmente en tu navegador mediante almacenamiento local del navegador. Estos datos no se envían a nuestros servidores: viven en tu aparato y desaparecen si borras los datos del sitio.",
      "También se guarda localmente una copia temporal de imágenes y sonidos de la Casa (caché) para que Vanguard cargue más rápido. La caché no contiene datos personales.",
    ],
  },
  {
    titulo: "3. Lo que se guarda en nuestros servidores",
    parrafos: [
      "Si creas una cuenta para guardar tu progreso en la nube (rango, monedas, gemas, cartas y logros), guardamos el alias que elijas, un identificador de cuenta y tu contraseña cifrada con una función de hash segura (scrypt). Nadie —ni siquiera el equipo de la Casa— puede leer tu contraseña.",
      "Guardamos además los contenidos que publiques voluntariamente en las zonas comunitarias (contribuciones, memes, denuncias, mensajes de sala) y las puntuaciones de los modos de juego, necesarias para el ranking global.",
      "El servidor mantiene una cookie técnica de sesión (vg_session) firmada, que solo sirve para reconocerte entre recargas. No se usa para publicidad ni para rastrear otros sitios.",
    ],
  },
  {
    titulo: "4. Lo que NO hacemos",
    parrafos: [
      "No vendemos ni alquilamos datos personales. No compartimos tus datos con anunciantes. No usamos rastreadores publicitarios de terceros. No pedimos datos sensibles (salud, religión, ideología) ni información de pago: la Casa es gratuita y no procesa cobros.",
    ],
  },
  {
    titulo: "5. Terceros técnicos",
    parrafos: [
      "Las noticias de Vanguard provienen de fuentes públicas internacionales (GDELT y más de 15 medios), con enlaces a la fuente original. Las imágenes de las noticias pertenecen a sus medios de origen y se muestran con fines informativos.",
      "El mapa y las vistas 3D cargan teselas cartográficas de proveedores técnicos abiertos (OpenStreetMap/OpenFreeMap, Esri World Imagery, AWS Open Data) y la tipografía se sirve mediante Google Fonts. Estas peticiones técnicas pueden registrar tu dirección IP de forma transitoria según las políticas de cada proveedor.",
    ],
  },
  {
    titulo: "6. Menores",
    parrafos: [
      "Vanguard es una plataforma informativa sobre guerras y geopolítica. Los modos comunitarios están pensados para un público adolescente y adulto. Si eres menor de edad en tu país, consulta con un adulto responsable antes de crear cuenta.",
    ],
  },
  {
    titulo: "7. Tus derechos",
    parrafos: [
      "Puedes borrar en cualquier momento los datos locales desde la configuración de tu navegador. Para revisar, corregir o eliminar tu cuenta y sus datos en el servidor, contacta al equipo de la Casa desde los canales oficiales de Vanguard y atenderemos la petición en un plazo razonable.",
    ],
  },
  {
    titulo: "8. Cambios de esta política",
    parrafos: [
      "Si la Casa cambia algo esencial de esta política, se actualizará esta página con su fecha. Seguir usando Vanguard después de un cambio implica conocer la versión vigente.",
    ],
  },
  {
    titulo: "9. La frontera técnica, a la vista",
    parrafos: [
      "Las promesas de esta política no son solo palabras: la arquitectura de la Casa las declara. El Núcleo (el censo público de módulos y fuentes de Vanguard) registra sus almacenes de datos con una frontera dura: las fuentes públicas alimentan la búsqueda global, y CUATRO almacenes privados —cuentas (fnt:cuentas), perfiles de juego (fnt:jugadores), telemetría (fnt:telemetria) y conversaciones en directo (fnt:conversacion)— están declarados con una regla fija: jamás se consultan por la búsqueda y jamás salen por una API pública. Los nombres son los reales del censo: no son jerga escondida, son los estantes que la Casa reconoce tener.",
      "Esa frontera se vigila sola: la suite de pruebas del sistema —que corre en cada ronda de desarrollo— verifica que la búsqueda global no puede tocar los almacenes privados y que los campos sensibles (el hash de tu contraseña, tu progreso guardado, la fecha de tu último acceso) nunca aparecen en un resultado público. Si la frontera se rompiera, las pruebas se rompen con ella.",
    ],
  },
];

export default function PrivacidadPage() {
  // v243.0 — la ficha estructurada de la política para Google (patrón v215):
  // la página que Publisher Center exige merece su ficha como las demás salas.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Política de Privacidad — VANGUARD",
    description:
      "Cómo VANGUARD maneja tus datos: identidad local en tu aparato, cuentas con contraseña cifrada, cookie de sesión técnica y terceros técnicos. Sin venta de datos.",
    url: `${SITE_URL}/privacidad`,
    isPartOf: { "@type": "WebSite", name: "VANGUARD", url: SITE_URL },
    inLanguage: "es",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdSeguro(jsonLd) }}
      />
      <main className="min-h-screen bg-zinc-950 text-zinc-200">
        <div className="border-b border-zinc-800 bg-zinc-900/60">
          <div className="max-w-3xl mx-auto px-5 py-3 flex items-center justify-between gap-3">
            <Link
              href="/"
              className="font-mono text-[11px] uppercase tracking-widest text-amber-400 hover:text-amber-300"
            >
              ◉ VANGUARD
            </Link>
            <span className="font-mono text-[10px] text-zinc-600 uppercase tracking-wider">
              Vigente desde el 31-10-2026
            </span>
          </div>
        </div>

        <article className="max-w-3xl mx-auto px-5 py-10">
          <h1 className="text-3xl font-bold text-zinc-100">
            Política de Privacidad
          </h1>
          <p className="mt-3 text-sm text-zinc-500 leading-relaxed">
            Resumen en una línea: tu identidad de juego vive en tu aparato, tu
            contraseña vive cifrada y nadie vende nada de nadie.
          </p>

          <div className="mt-8 flex flex-col gap-8">
            {SECCIONES.map((s) => (
              <section key={s.titulo}>
                <h2 className="text-lg font-bold text-amber-300">{s.titulo}</h2>
                {s.parrafos.map((p, i) => (
                  <p key={i} className="mt-3 text-sm text-zinc-400 leading-relaxed">
                    {p}
                  </p>
                ))}
              </section>
            ))}
          </div>

          <div className="mt-10 border border-amber-500/30 bg-amber-500/5 rounded-md p-4 text-sm text-zinc-400">
            ¿Dudas sobre tus datos? Escríbele al equipo desde los canales
            oficiales de la Casa. La guerra sigue en{" "}
            <Link
              href="/"
              className="text-amber-400 hover:text-amber-300 underline underline-offset-2"
            >
              vanguard-kq9r.vercel.app
            </Link>
            .
          </div>

          {/* v243.0 CONECTA CON EL NÚCLEO (patrón v230) — la política no es
              una isla: el censo que declara la frontera está a un chip. */}
          <section className="mt-10 pb-10">
            <EnlacesNucleo enlaces={PUERTAS_DE_LA_POLITICA} titulo="CONECTA CON EL NÚCLEO" />
          </section>
        </article>
      </main>
    </>
  );
}
