// v407.0 · GET /api/sistema/diagnostico — la casa se revisa y dice la verdad
import { muro, claveCliente } from "@/lib/fortaleza";
import { ok, fallo, conManejo } from "@/lib/sistema/contrato";
import { diagnosticar } from "@/lib/sistema/diagnostico";

export const dynamic = "force-dynamic";

export const GET = conManejo("/api/sistema/diagnostico", async (req, t0) => {
  const veredicto = muro(`sistema-diag:${claveCliente(req)}`, 20, 60_000);
  if (!veredicto.permitido) return fallo("MURO", `Demasiadas comprobaciones. Espera ${veredicto.espera} s.`, undefined, { t0 });

  const url = new URL(req.url);
  const profundo = url.searchParams.get("profundo") === "1";
  const d = await diagnosticar({ profundo });
  return ok(d, { t0, nota: profundo ? "Comprobación profunda: incluye la base de datos." : "Sin tocar la base de datos (usa ?profundo=1 para incluirla)." });
});
