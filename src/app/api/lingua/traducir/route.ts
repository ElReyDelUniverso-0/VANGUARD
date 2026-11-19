// ═══════════════════════════════════════════════════════════════════
// v420.0 VANGUARD LINGUA — POST /api/lingua/traducir { texto, de, a }
// Traducción automática con MyMemory (Translated), servicio público y
// gratuito. Se devuelve tal cual, con el proveedor, el grado de
// coincidencia y las alternativas de la memoria de traducción. Si el
// servicio falla o agota su cuota, se dice: no hay respaldo inventado.
// ═══════════════════════════════════════════════════════════════════
import { fallo, ok } from "@/lib/sistema/contrato";
import { muro, claveCliente } from "@/lib/fortaleza";
import { traducirMyMemory, ErrorTraduccion, type ResultadoTraduccion } from "@/lib/lingua/wiki";
import { CODIGOS_TRADUCTOR, MAX_TRADUCTOR } from "@/lib/lingua/traduccion";

export const dynamic = "force-dynamic";

const CACHE = new Map<string, { r: ResultadoTraduccion; ts: number }>();
const TTL = 6 * 3600_000;

export async function POST(req: Request) {
  const t0 = Date.now();
  if (!muro(`lingua-traducir:${claveCliente(req)}`, 15, 60_000).permitido) return fallo("MURO", "Has hecho muchas traducciones seguidas; espera un minuto.");
  let body: { texto?: unknown; de?: unknown; a?: unknown } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return fallo("VALIDACION", "El cuerpo debe ser JSON: { texto, de, a }.");
  }
  const texto = typeof body.texto === "string" ? body.texto.trim() : "";
  const de = typeof body.de === "string" ? body.de : "";
  const a = typeof body.a === "string" ? body.a : "";
  if (!texto) return fallo("VALIDACION", "Escribe el texto que quieres traducir.");
  if (texto.length > MAX_TRADUCTOR) return fallo("VALIDACION", `El texto no puede pasar de ${MAX_TRADUCTOR} caracteres.`);
  if (!CODIGOS_TRADUCTOR.has(de) || !CODIGOS_TRADUCTOR.has(a)) return fallo("VALIDACION", "Par de idiomas no disponible.");
  if (de === a) return fallo("VALIDACION", "Elige dos idiomas distintos.");
  const clave = `${de}|${a}|${texto}`;
  const hit = CACHE.get(clave);
  if (hit && Date.now() - hit.ts < TTL) return ok({ ...hit.r, cache: true }, { t0 });
  try {
    const r = await traducirMyMemory(texto, de, a);
    if (CACHE.size > 400) CACHE.delete(CACHE.keys().next().value as string);
    CACHE.set(clave, { r, ts: Date.now() });
    return ok({ ...r, cache: false }, { t0 });
  } catch (e) {
    const cuota = e instanceof ErrorTraduccion && e.cuota;
    return fallo("PROVEEDOR", cuota ? "El servicio de traducción gratuito agotó su cuota de hoy. Vuelve a intentarlo mañana." : e instanceof ErrorTraduccion ? e.message : "El servicio de traducción no respondió. Inténtalo de nuevo en unos segundos.", { proveedor: "MyMemory", cuota }, { t0 });
  }
}
