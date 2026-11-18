import { quien, almacenDuradero, json } from "@/lib/creadores/servidor";
import { permisosDe } from "@/lib/creadores/permisos";

// v406.1 LA FORJA — ¿quién soy aquí? alias firmado, rol, permisos y si la base es duradera.
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const q = await quien(req);
  return json({
    alias: q.alias,
    rol: q.rol,
    permisos: permisosDe(q.rol, q.secreto),
    moderacionActiva: q.secreto,
    almacenDuradero: almacenDuradero(),
  });
}
