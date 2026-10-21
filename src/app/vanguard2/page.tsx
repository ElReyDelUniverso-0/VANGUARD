import type { Metadata, Viewport } from "next";
import Vanguard2 from "@/components/vanguard2/vanguard2";

// ============================================================
// VANGUARD-2 — el NUEVO Vanguard: cada sección es su propio
// mundo 3D independiente, todo en volumen, cero DOM encima.
// ============================================================
export const metadata: Metadata = {
  title: "VANGUARD-2 · El universo 3D total",
  description:
    "El nuevo Vanguard: cada sección vive en su propio mundo 3D independiente. Letras, datos, gráficos y controles — todo en volumen, cada mínimo detalle.",
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#02040a",
};

export default function PageVanguard2() {
  return <Vanguard2 />;
}
