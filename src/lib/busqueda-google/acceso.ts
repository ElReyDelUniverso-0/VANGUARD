// ============================================================
// v415.0 · VANGUARD SEARCH OPPORTUNITIES — quién ve los datos (SOLO SERVIDOR)
//
// Las consultas de búsqueda de Search Console son datos privados del Dueño.
// El ESTADO de la conexión (qué variables existen, si la meta de verificación
// está publicada) es público; las FILAS solo las ve:
//   · la sesión firmada del Dueño, y SOLO si AUTH_SECRET y OWNER_PASSWORD
//     están definidas en el servidor (con los valores de reserva del código
//     —públicos en el repositorio— cualquiera podría firmar esa sesión);
//   · o cualquiera, si el Dueño lo decide con GSC_PANEL_PUBLICO=1.
// ============================================================

import { verifySessionToken, OWNER_USERNAME } from "@/lib/auth-server";

export interface Acceso {
  permitido: boolean;
  motivo: string;
  /** ¿la cuenta del Dueño está protegida con secretos propios? */
  duenoBlindado: boolean;
}

export function duenoBlindado(): boolean {
  return !!(process.env.AUTH_SECRET?.trim() && process.env.OWNER_PASSWORD?.trim());
}

export function accesoADatos(tokenSesion: string | null | undefined): Acceso {
  const blindado = duenoBlindado();
  if (process.env.GSC_PANEL_PUBLICO?.trim() === "1") {
    return { permitido: true, motivo: "El Dueño publicó el panel (GSC_PANEL_PUBLICO=1).", duenoBlindado: blindado };
  }
  let esDueno = false;
  try {
    esDueno = !!tokenSesion && verifySessionToken(decodeURIComponent(tokenSesion)) === OWNER_USERNAME;
  } catch {
    esDueno = false;
  }
  if (!esDueno) return { permitido: false, motivo: "Los datos de búsqueda son privados: entra con la cuenta del Dueño.", duenoBlindado: blindado };
  if (!blindado) {
    return {
      permitido: false,
      motivo:
        "La cuenta del Dueño usa la clave de firma y la contraseña de reserva que están en el código público. Define AUTH_SECRET y OWNER_PASSWORD en Vercel para que el panel enseñe datos privados.",
      duenoBlindado: false,
    };
  }
  return { permitido: true, motivo: "Sesión del Dueño.", duenoBlindado: true };
}

/** Lee la cookie de sesión de una Request (rutas de API). */
export function tokenDeRequest(req: Request, nombreCookie: string): string | null {
  const crudo = req.headers
    .get("cookie")
    ?.split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${nombreCookie}=`));
  return crudo ? crudo.slice(nombreCookie.length + 1) : null;
}
