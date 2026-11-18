// v407.0 · GET /api/consulta — consulta estructurada (determinista, sin IA)
//
// Interpreta la pregunta (país, tipo de entidad, teatro, ventana) y busca con
// los mismos proveedores públicos del núcleo. Devuelve la interpretación a la
// vista para que el usuario pueda corregirla: nada de cajas negras.
import { muro, claveCliente } from "@/lib/fortaleza";
import { ok, fallo, conManejo, validar } from "@/lib/sistema/contrato";
import { interpretarConsulta } from "@/lib/nucleo/consulta";
import { buscarEnNucleo } from "@/lib/nucleo/busqueda";

export const dynamic = "force-dynamic";

export const GET = conManejo("/api/consulta", async (req, t0) => {
  const veredicto = muro(`consulta:${claveCliente(req)}`, 30, 60_000);
  if (!veredicto.permitido) return fallo("MURO", `Demasiadas consultas. Espera ${veredicto.espera} s.`, undefined, { t0 });

  const url = new URL(req.url);
  const q = validar.texto(url.searchParams.get("q"), "q", { max: 240, min: 2, requerido: true });
  const limite = validar.entero(url.searchParams.get("limite"), "limite", { min: 1, max: 24, porDefecto: 8 });

  const interpretacion = interpretarConsulta(q, 6);
  const respuesta = await buscarEnNucleo(q, limite, interpretacion.tipo);

  return ok(
    {
      interpretacion,
      resultados: (respuesta.resultados ?? []).slice(0, limite),
      fuentes: respuesta.fuentes ?? [],
      generado: respuesta.generado,
    },
    {
      t0,
      nota: "Interpretación por reglas (sin proveedor de IA). Se muestra completa para poder corregirla.",
    }
  );
});
