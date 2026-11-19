import React from "react";
import { notFound } from "next/navigation";
import { obtenerLeccion } from "@/lib/academia";
import { CURSOS_ACADEMIA } from "@/lib/academia/datos-cursos";
import { VisorLeccion } from "@/components/vanguard/academia/VisorLeccion";

interface PropsPaginaLeccion {
  params: Promise<{
    slug: string;
    capituloId: string;
    leccionId: string;
  }>;
}

export async function generateStaticParams() {
  const params: { slug: string; capituloId: string; leccionId: string }[] = [];

  for (const curso of CURSOS_ACADEMIA) {
    for (const cap of curso.capitulos) {
      for (const lec of cap.lecciones) {
        params.push({
          slug: curso.slug,
          capituloId: cap.id,
          leccionId: lec.id,
        });
      }
    }
  }

  return params;
}

export async function generateMetadata({ params }: PropsPaginaLeccion) {
  const { slug, capituloId, leccionId } = await params;
  const datos = obtenerLeccion(slug, capituloId, leccionId);

  if (!datos) {
    return { title: "Lección no encontrada | Vanguard Academy" };
  }

  return {
    title: `${datos.leccion.titulo} · ${datos.curso.titulo} | Vanguard Academy`,
    description: datos.leccion.resumenEjecutivo,
  };
}

export default async function PaginaLeccion({ params }: PropsPaginaLeccion) {
  const { slug, capituloId, leccionId } = await params;
  const datos = obtenerLeccion(slug, capituloId, leccionId);

  if (!datos) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <VisorLeccion
        curso={datos.curso}
        capitulo={datos.capitulo}
        leccion={datos.leccion}
      />
    </div>
  );
}
