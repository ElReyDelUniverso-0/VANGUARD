"use client";

// ============================================================
// VANGUARD-2 · GUARDIA DE RUTA — /vanguard2 es un universo puro:
// ninguna capa DOM de la Casa (retención, pulso, regreso) puede
// montar encima del canvas. Fuera de /vanguard2, todo sigue igual.
// ============================================================
import { usePathname } from "next/navigation";

export function SoloCasa({ children }: { children: React.ReactNode }) {
  const ruta = usePathname();
  if (ruta?.startsWith("/vanguard2")) return null;
  return <>{children}</>;
}
