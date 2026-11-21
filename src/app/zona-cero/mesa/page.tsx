import type { Metadata } from "next";
import { MesaOrdenes } from "@/components/zona-cero/mesa-ordenes";

// ═══════════════════════════════════════════════════════════════════════════
// v434.2 · ZONA CERO · LA MESA DE ÓRDENES — el módulo completo
//
// La Zona Cero tenía el ojo (buscar en toda la casa) y el teatro global (la
// mesa de guerra en 3D). Le faltaba EL PAPEL: dónde se escriben las órdenes,
// se numeran, se señalan en un tablero, se pegan las capturas, se corrigen con
// rastro y se calculan probabilidades. Esto es esa sala.
//
// Todo vive en el aparato del operador (localStorage). El servidor solo entra
// si se le pide una narración con /api/zona-cero/predecir.
// ═══════════════════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Zona Cero · Mesa de órdenes — VANGUARD",
  description:
    "El puesto de mando de la Zona Cero: órdenes numeradas, tablero para señalar, capturas pegadas, correcciones con historial y predicciones explicadas. Con tu propia API key si la quieres.",
  robots: { index: false, follow: true },
};

export default function MesaPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-3 py-4 sm:px-5">
      <MesaOrdenes />
      <noscript>
        <p style={{ color: "#93a1b8", fontFamily: "monospace", fontSize: 12, padding: 12 }}>
          La mesa de órdenes necesita JavaScript: guarda lo que escribes en tu propio aparato.
        </p>
      </noscript>
    </main>
  );
}
