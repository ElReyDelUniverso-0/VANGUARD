// v400.0 — lista ligera de ids de la portada (para el aviso "noticias nuevas")
import { NextResponse } from "next/server";
import { obtenerNotas } from "@/lib/portada/notas";

export const revalidate = 120;

export async function GET() {
  const notas = await obtenerNotas();
  return NextResponse.json(
    {
      ids: notas.slice(0, 30).map((n) => n.id),
      total: notas.length,
      // v401 — el teletipo de la carcasa de los módulos
      tele: notas.slice(0, 14).map((n) => ({ id: n.id, titulo: n.titulo, fecha: n.fecha })),
    },
    { headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300" } }
  );
}
