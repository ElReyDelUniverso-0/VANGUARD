import { NextResponse } from "next/server";
import { gatewaySospechosoCaido } from "@/lib/ia-gateway";
import { TOTAL_LUGARES, LUGARES } from "@/lib/mente/mapa-casa";
import { ESPACIOS } from "@/lib/navegacion/espacios";
import { SALAS_MAPA } from "@/lib/vanguard/mapa-salas";

// v431.0 · EL ESTADO DE LA MENTE, DICHO SIN ADORNOS.
//
// La casa ya tenía esta ley (v407, `lib/ia/proveedor.ts`): «no simules
// conexiones». Aquí se cumple también para la mente nueva: dice con qué motor
// está hablando, cuántos lugares conoce y qué puede hacer de verdad.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const caido = gatewaySospechosoCaido();
  return NextResponse.json({
    ok: true,
    version: "v431.0",
    motor: caido ? "casa" : "nube",
    motorHumano: caido
      ? "Modo casa: sin núcleo de lenguaje. Responde con los datos reales de la casa."
      : "Núcleo de lenguaje conectado (gateway de la casa) con respaldo determinista.",
    sabe: {
      lugares: TOTAL_LUGARES,
      areas: ESPACIOS.length,
      salas: SALAS_MAPA.length,
      // muestra: la interfaz puede enseñar por dónde empieza a saber
      primeros: LUGARES.slice(0, 3).map((l) => ({ n: l.n, r: l.r })),
    },
    puede: [
      "llevarte a cualquier lugar de la casa",
      "buscar en salas, áreas, herramientas y destinos",
      "explicar qué hay dentro de un sitio",
      "crear documentos, planes, tablas, código, listas e informes",
      "recordar lo que le digas entre conversaciones (en tu aparato, no en un servidor)",
      "conversar de cualquier tema con conocimiento general honesto",
    ],
    nota: caido
      ? "El gateway no respondió en esta instancia. La conversación abierta está limitada; la navegación y la creación siguen funcionando."
      : "Si el gateway deja de responder a mitad de una conversación, esta misma ruta lo nota y pasa a modo casa sin callarse.",
  });
}
