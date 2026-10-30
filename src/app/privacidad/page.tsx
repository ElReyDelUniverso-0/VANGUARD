import type { Metadata } from "next";
import Link from "next/link";

// v206.0 MÁS PUERTAS — política de privacidad pública e indexable.
// Publisher Center (Google News) exige una URL de política de privacidad
// para validar la publicación; además transmite confianza a Google y a los
// visitantes. Texto honesto sobre lo que la casa realmente maneja:
// identidad local, cuentas con contraseña hasheada, cookie de sesión
// técnica y terceros técnicos (fuentes de noticias, imágenes y mapas).

export const metadata: Metadata = {
  title: "Política de Privacidad | VANGUARD",
  description:
    "Cómo VANGUARD maneja tus datos: identidad local en tu aparato, cuentas con contraseña cifrada, cookie de sesión técnica y terceros técnicos. Sin venta de datos.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || "https://vanguard-kq9r.vercel.app"}/privacidad`,
  },
};

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
];

export default function PrivacidadPage() {
  return (
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
      </article>
    </main>
  );
}
