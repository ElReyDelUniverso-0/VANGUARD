// ============================================================
// v218.0 EL NÚCLEO — GET /api/nucleo/modulos
// El censo público de módulos: nombre, descripción, categoría,
// ruta, permisos, estado y dependencias. Es METADATO del sistema
// (nunca datos privados): así cualquier parte de la casa — o una
// prueba — consulta qué existe sin leer el código.
// Muro 60/min (ley v211).
// ============================================================
import { NextResponse } from "next/server";
import { APP_VERSION } from "@/lib/version";
import {
  MODULOS_NUCLEO,
  CATEGORIAS_MODULO,
  modulosPorCategoria,
} from "@/lib/nucleo/registro";
import {
  FUENTES_PUBLICAS,
  FUENTES_PRIVADAS,
} from "@/lib/nucleo/fuentes";
import { muro, claveCliente } from "@/lib/fortaleza";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const veredicto = muro(`nucleo-mod:${claveCliente(req)}`, 60, 60_000);
  if (!veredicto.permitido) {
    return NextResponse.json(
      { ok: false, error: "Demasiadas consultas del censo." },
      { status: 429 }
    );
  }
  return NextResponse.json(
    {
      ok: true,
      version: APP_VERSION,
      generado: new Date().toISOString(),
      totales: {
        modulos: MODULOS_NUCLEO.length,
        categorias: CATEGORIAS_MODULO.length,
        fuentesPublicas: FUENTES_PUBLICAS.length,
        fuentesPrivadas: FUENTES_PRIVADAS.length,
      },
      categorias: CATEGORIAS_MODULO,
      modulos: MODULOS_NUCLEO,
      grupos: modulosPorCategoria().map((g) => ({
        categoria: g.categoria,
        ids: g.modulos.map((m) => m.id),
      })),
      // La frontera se declara, no se esconde: qué NUNCA sale por búsqueda.
      fuentesPublicas: FUENTES_PUBLICAS.map((f) => ({ id: f.id, nombre: f.nombre, tipo: f.publica_tipo })),
      fuentesPrivadas: FUENTES_PRIVADAS.map((f) => ({ id: f.id, nombre: f.nombre })),
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
