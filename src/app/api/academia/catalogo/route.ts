import { NextResponse } from "next/server";
import {
  CURSOS_ACADEMIA,
  CATEGORIAS_ACADEMIA,
} from "@/lib/academia/datos-cursos";
import {
  RUTAS_PREDEFINIDAS,
  BARAJAS_TARJETAS,
  GLOSARIO_ACADEMIA,
  BANCO_EJERCICIOS,
} from "@/lib/academia/datos-rutas-glosario";

export async function GET() {
  return NextResponse.json({
    meta: {
      plataforma: "Vanguard Academy",
      version: "2.0.0",
      disciplinasDisponibles: CATEGORIAS_ACADEMIA.length,
      totalCursos: CURSOS_ACADEMIA.length,
      totalRutasPredefinidas: RUTAS_PREDEFINIDAS.length,
      totalBarajasTarjetas: BARAJAS_TARJETAS.length,
      totalEjerciciosBanco: BANCO_EJERCICIOS.length,
      totalTerminosGlosario: GLOSARIO_ACADEMIA.length,
      timestampUtc: new Date().toISOString(),
    },
    categorias: CATEGORIAS_ACADEMIA,
    cursos: CURSOS_ACADEMIA,
    rutas: RUTAS_PREDEFINIDAS,
    tarjetas: BARAJAS_TARJETAS,
    ejercicios: BANCO_EJERCICIOS,
    glosario: GLOSARIO_ACADEMIA,
  });
}
