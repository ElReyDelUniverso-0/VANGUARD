// v402.11 EL MAPA QUE GOOGLE LEE — 404 DE VERDAD para teatros que no existen.
// La página vive bajo loading.tsx (transmisión): cuando su notFound() llega, el
// estado 200 ya salió y /conflicto/<lo-que-sea> respondía 200 con «noindex»
// (soft 404 para Google). Este layout comprueba el teatro ANTES de la frontera
// de carga, así la respuesta sale con 404 real. Solo mira TEATROS (fuente
// única, cero consultas); la página conserva todas sus comprobaciones.
import { notFound } from "next/navigation";
import { TEATROS } from "@/lib/teatros";

export default async function TeatroGuardia({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  if (!Object.prototype.hasOwnProperty.call(TEATROS, tag)) notFound();
  return children;
}
