// v407.0 · GET /api/sistema/extensiones — cómo se añade un módulo sin tocar el centro
import { ok, conManejo, cacheable } from "@/lib/sistema/contrato";
import { estadoExtensiones, validarExtension, PUNTOS_EXTENSION } from "@/lib/sistema/extensiones";

export const dynamic = "force-dynamic";

export const GET = conManejo("/api/sistema/extensiones", async (_req, t0) => {
  return ok(
    {
      ...estadoExtensiones(),
      contrato: {
        descriptor: {
          id: "ext:<slug>",
          nombre: "texto legible",
          version: "X.Y.Z",
          autor: "quién responde",
          descripcion: "mínimo 20 caracteres: qué hace de verdad",
          modulo: "ModuloNucleo completo (id mod:…, ruta real, permisos, dependencias)",
          puntos: [...PUNTOS_EXTENSION],
          requiere: ["mod:… o fnt:… que YA existan"],
          prueba: "nombre del caso en scripts/pruebas-plataforma.mjs",
        },
        ejemplo: validarExtension({
          id: "ext:ejemplo-invalido",
          nombre: "Ejemplo",
          version: "1.0.0",
          autor: "—",
          descripcion: "Descriptor de muestra que NO cumple: sirve para ver los errores.",
          modulo: { id: "mod:ejemplo", ruta: "sin-barra", dependencias: [] },
          puntos: ["censo"],
          requiere: ["mod:no-existe"],
          prueba: "",
        }),
      },
    },
    { t0, cabeceras: cacheable(300) }
  );
});
