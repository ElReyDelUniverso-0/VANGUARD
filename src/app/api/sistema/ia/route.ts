// v407.0 · GET /api/sistema/ia — qué IA hay configurada (y qué se hace sin ella)
//
// No llama a ningún modelo. Comprueba PRESENCIA de credenciales (nunca el valor)
// y declara las capacidades deterministas que ya funcionan.
import { ok, conManejo } from "@/lib/sistema/contrato";
import { estadoProveedores, capacidadesDeterministas, resumirEstado } from "@/lib/ia/proveedor";

export const dynamic = "force-dynamic";

export const GET = conManejo("/api/sistema/ia", async (_req, t0) => {
  return ok(
    {
      ...estadoProveedores(),
      deterministas: capacidadesDeterministas(),
      resumen: resumirEstado(),
      nota:
        "Configurado ≠ implementado. Ningún cliente de modelo está escrito en la casa: no hay llamadas que simular. Las capacidades de abajo se resuelven con reglas, catálogo y datos reales.",
    },
    { t0 }
  );
});
