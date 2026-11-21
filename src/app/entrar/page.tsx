// ═══════════════════════════════════════════════════════════════════
// v406.0 LA TRAVESÍA — /entrar deja de ser la Puerta de dos mundos y pasa a
// ser la ENTRADA INMERSIVA de toda la casa: espacios que se recorren,
// puertas que se abren, herramientas a mano y tu hilo para continuar.
// (v403.1 LOS DOS MUNDOS vive igual: la Puerta sigue saliendo la primera
//  vez en la portada y el Cruce entre mundos no se ha tocado.)
// El servidor solo pone los cables reales del momento; todo lo personal
// (rastro, brújula, lo tuyo) se lee en el aparato del visitante.
// ═══════════════════════════════════════════════════════════════════
import type { Metadata } from "next";
import { obtenerNotas } from "@/lib/portada/notas";
import { conflictoPorKey } from "@/lib/portada/clasificar";
import { Travesia, type CableTravesia } from "@/components/travesia/travesia";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "La Travesía — explora todo VANGUARD y continúa donde lo dejaste",
  description:
    "La entrada a todo VANGUARD: conflictos, el planeta en 3D, conocimiento, secretos, arsenal, datos vivos, medios y juego, espacio a espacio — y tu hilo para seguir donde lo dejaste.",
  alternates: { canonical: "/entrar" },
  // puerta de paso: se sigue, no se indexa (su contenido es la propia casa)
  robots: { index: false, follow: true },
  openGraph: {
    title: "VANGUARD · La Travesía",
    description: "Recorre el mundo espacio a espacio y continúa donde lo dejaste.",
    images: ["/imagenes-reales/satelite.jpg"],
  },
};

async function cablesDelMomento(): Promise<{ cables: CableTravesia[]; total24: number }> {
  try {
    const notas = await obtenerNotas();
    const desde = Date.now() - 24 * 3600 * 1000;
    const total24 = notas.filter((n) => Date.parse(n.fecha) >= desde).length;
    const cables = notas.slice(0, 4).map((n) => ({
      id: n.id,
      titulo: n.titulo,
      fecha: n.fecha,
      fuente: n.fuente,
      frente: conflictoPorKey(n.conflicto)?.nombre ?? null,
    }));
    return { cables, total24 };
  } catch {
    // sin señal: la Travesía funciona igual, solo sin la franja de cables
    return { cables: [], total24: 0 };
  }
}

export default async function Entrar() {
  const { cables, total24 } = await cablesDelMomento();
  return (
    <main>
      <h1 className="sr-only">La Travesía: explora todo VANGUARD y continúa donde lo dejaste</h1>
      <Travesia cables={cables} total24={total24} />
    </main>
  );
}
