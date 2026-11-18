// v415.0 · GET /api/sistema/busqueda-google — VANGUARD SEARCH OPPORTUNITIES
//   ?accion=estado            (público)  qué está configurado + comprobaciones públicas
//   ?accion=probar            (privado)  prueba real paso a paso contra Google
//   ?accion=informe&dias=28   (privado)  oportunidades a partir de datos reales
// Privado = sesión del Dueño con AUTH_SECRET/OWNER_PASSWORD propios, o
// GSC_PANEL_PUBLICO=1 (ver src/lib/busqueda-google/acceso.ts).
import { muro, claveCliente } from "@/lib/fortaleza";
import { ok, fallo, conManejo } from "@/lib/sistema/contrato";
import { SESSION_COOKIE } from "@/lib/auth-server";
import { configuracion, ErrorGoogle } from "@/lib/busqueda-google/cliente";
import { accesoADatos, tokenDeRequest } from "@/lib/busqueda-google/acceso";
import { comprobacionesPublicas, probarConexion, informe, DIAS_PERMITIDOS, type Dias } from "@/lib/busqueda-google/servicio";
import { UMBRALES } from "@/lib/busqueda-google/analisis";
import { TIPOS_OPORTUNIDAD, type TipoOportunidad } from "@/lib/busqueda-google/tipos";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export const GET = conManejo("/api/sistema/busqueda-google", async (req, t0) => {
  const veredicto = muro(`busqueda-google:${claveCliente(req)}`, 20, 60_000);
  if (!veredicto.permitido) return fallo("MURO", `Demasiadas peticiones. Espera ${veredicto.espera} s.`, undefined, { t0 });

  const url = new URL(req.url);
  const accion = url.searchParams.get("accion") ?? "estado";
  const cfg = configuracion();
  const acceso = accesoADatos(tokenDeRequest(req, SESSION_COOKIE));

  if (accion === "estado") {
    return ok(
      {
        conexion: {
          lista: cfg.lista,
          modo: cfg.modo,
          sitio: cfg.sitio,
          presentes: cfg.presentes,
          faltan: cfg.faltan,
          cuentaServicio: cfg.cuentaServicio,
          aviso: cfg.aviso,
        },
        acceso: { datos: acceso.permitido, motivo: acceso.motivo, duenoBlindado: acceso.duenoBlindado },
        comprobaciones: await comprobacionesPublicas(),
        umbrales: UMBRALES,
      },
      { t0 }
    );
  }

  if (accion !== "probar" && accion !== "informe") {
    return fallo("VALIDACION", "«accion» debe ser estado, probar o informe.", { campo: "accion" }, { t0 });
  }
  if (!acceso.permitido) return fallo("PERMISO", acceso.motivo, { comoEntrar: "/modo con la cuenta DUENO" }, { t0 });

  if (accion === "probar") return ok(await probarConexion(), { t0 });

  if (!cfg.lista) {
    return fallo("PROVEEDOR", "Search Console no está conectado: faltan credenciales en el servidor.", { faltan: cfg.faltan }, { t0 });
  }
  const diasCrudo = Number(url.searchParams.get("dias") ?? 28);
  const dias = (DIAS_PERMITIDOS as readonly number[]).includes(diasCrudo) ? (diasCrudo as Dias) : 28;
  const tipo = url.searchParams.get("tipo");
  try {
    const inf = await informe(dias);
    const filtro = tipo && (TIPOS_OPORTUNIDAD as readonly string[]).includes(tipo) ? (tipo as TipoOportunidad) : null;
    return ok(filtro ? { ...inf, oportunidades: inf.oportunidades.filter((o) => o.tipo === filtro) } : inf, { t0 });
  } catch (e) {
    if (e instanceof ErrorGoogle) return fallo("PROVEEDOR", e.message, { paso: e.paso, estado: e.estado }, { t0 });
    throw e;
  }
});
