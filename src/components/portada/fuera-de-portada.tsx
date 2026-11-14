"use client";

// v400.0 — las capas flotantes del HUD viejo (temporada, pulso, cofre,
// avisos de regreso…) NO montan sobre el diseño nuevo: regla de oro
// «máximo una cosa flotante». Siguen vivas en el cuartel y las salas.
import { usePathname } from "next/navigation";

const RUTAS_NUEVAS = ["/lectura"];

export function esRutaNueva(ruta: string | null): boolean {
  if (!ruta) return false;
  if (ruta === "/") return true;
  return RUTAS_NUEVAS.some((r) => ruta === r || ruta.startsWith(r + "/"));
}

export function FueraDePortada({ children }: { children: React.ReactNode }) {
  const ruta = usePathname();
  if (esRutaNueva(ruta)) return null;
  return <>{children}</>;
}
