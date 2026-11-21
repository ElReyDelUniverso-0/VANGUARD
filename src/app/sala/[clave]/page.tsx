// ═══════════════════════════════════════════════════════════════════
// v434.1 · /sala/<clave> — CADA SALA DEL CUARTEL, CON SU URL
//
// Mandato del Dueño: «conviértelas en páginas propias» (para que el cuartel
// pueda desaparecer sin perder nada).
//
// Hasta hoy las 155 salas vivían detrás de un parámetro: /cuartel?sala=<clave>.
// Una URL con parámetro no es una página: no se comparte bien, no se indexa
// como sede propia y muere si el cajón se cierra. Aquí cada una tiene su
// dirección real, su título y su descripción, y abre LA MISMA sala (el motor
// del cuartel lee la ruta desde v434.1).
//
// No se reescribe ni una sala: se le pone puerta.
// ═══════════════════════════════════════════════════════════════════
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Cuartel from "@/app/cuartel/page";
import { CONSTELACIONES } from "@/lib/vanguard/mapa-salas";

const POR_CLAVE = new Map(
  CONSTELACIONES.flatMap((c) => c.salas.map((s) => [s.clave, { sala: s, constelacion: c }] as const)),
);

export const dynamicParams = true;

export async function generateMetadata({ params }: { params: Promise<{ clave: string }> }): Promise<Metadata> {
  const { clave } = await params;
  const ficha = POR_CLAVE.get(clave);
  if (!ficha) return { title: "Sala no encontrada" };
  const nombre = ficha.sala.corto || ficha.sala.nombre;
  // sin repetir el nombre cuando la constelación se llama igual que la sala
  // («HANGAR · HANGAR»), y con absolute para que el layout no añada otro VANGUARD
  const cola = ficha.constelacion.nombre === nombre ? "VANGUARD" : `${ficha.constelacion.nombre} · VANGUARD`;
  return {
    title: { absolute: `${nombre} — ${cola}` },
    description: `${nombre}: ${ficha.constelacion.desc}. Sala del sistema VANGUARD, con su propia dirección.`,
    alternates: { canonical: `/sala/${clave}` },
    openGraph: { title: `${nombre} · VANGUARD`, description: ficha.constelacion.desc },
  };
}

export default async function SalaPage({ params }: { params: Promise<{ clave: string }> }) {
  const { clave } = await params;
  if (!POR_CLAVE.has(clave)) notFound();
  return <Cuartel />;
}
