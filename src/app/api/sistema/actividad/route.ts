// v407.0 · GET /api/sistema/actividad — el anillo técnico de esta instancia
import { muro, claveCliente } from "@/lib/fortaleza";
import { ok, fallo, conManejo, validar } from "@/lib/sistema/contrato";
import { resumen, ultimos } from "@/lib/sistema/actividad";
import { estadoCache } from "@/lib/sistema/cache";

export const dynamic = "force-dynamic";

export const GET = conManejo("/api/sistema/actividad", async (req, t0) => {
  const veredicto = muro(`sistema-act:${claveCliente(req)}`, 30, 60_000);
  if (!veredicto.permitido) return fallo("MURO", `Demasiadas peticiones. Espera ${veredicto.espera} s.`, undefined, { t0 });

  const url = new URL(req.url);
  const n = validar.entero(url.searchParams.get("n"), "n", { min: 1, max: 100, porDefecto: 40 });
  return ok(
    { resumen: resumen(), cache: estadoCache(), eventos: ultimos(n) },
    { t0, nota: "Por instancia: Vercel levanta varias y cada una tiene su propio anillo. No es auditoría de seguridad." }
  );
});
