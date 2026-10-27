"use client";

// ============================================================
// VANGUARD-2 · MONTAJE — el nuevo Vanguard 100% 3D.
// Cero chrome DOM: un canvas a pantalla completa y nada más.
// El arranque es 3D desde el primer frame (estructuralmente
// imposible que una capa 2D tape el mundo: no hay capas).
// ============================================================
import { useEffect, useRef, useState } from "react";
import { MotorV2 } from "./motor";
import { constructorDe, construirHub, construirIndice } from "./mundos";
import { mutarLedger } from "./progreso";

// v185.0 EL SOCORRISTA — señal temprana en la ruta PESADA: dispara cuando
// el bundle del universo 3D llega y parsea (antes de que el motor nazca).
// El socorrista de layout.tsx la usa para no re-animar una carga que ya
// trajo su código (en pesado el tope de cortina es 60s y el bundle pesa).
if (typeof window !== "undefined") {
  (window as unknown as { __vgcasa?: boolean }).__vgcasa = true;
}

export default function Vanguard2() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [visitas, setVisitas] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let motor: MotorV2 | null = null;
    try {
      motor = new MotorV2(canvas);
      // navegación central: cada sección es un mundo independiente
      motor.navegar = (key) => {
        motor?.irA(constructorDe(key), key);
        mutarLedger((l) => {
          l.mundoVisitas[key] = (l.mundoVisitas[key] ?? 0) + 1;
        });
      };
      motor.irA(construirHub, "inicio", false); // arranque directo: 3D al instante
      if (typeof window !== "undefined") {
        (window as unknown as { __vg2?: MotorV2 }).__vg2 = motor; // QA/diagnóstico
        // v155.0 LA CORTINA: el motor V2 nació y ya pinta — señal de vida
        (window as unknown as { __vgvivo?: boolean }).__vgvivo = true;
      }
      setVisitas(true);
    } catch (e) {
      console.error("[v2] el motor no pudo nacer", e);
      setError(e instanceof Error ? e.message : "fallo del motor");
    }
    return () => {
      motor?.destruir();
      motor = null;
    };
  }, []);

  // FALLBACK ÚNICO (solo si WebGL es imposible en el dispositivo):
  // el mensaje es honesto y mínimo — nunca es la experiencia normal.
  if (error) {
    return (
      <div style={{ color: "#9fe8ff", background: "#02040a", height: "100dvh", display: "grid", placeItems: "center", fontFamily: "monospace", textAlign: "center", padding: 24 }}>
        <div>
          <p style={{ fontSize: 20, letterSpacing: 4 }}>VANGUARD-2 NECESITA WEBGL</p>
          <p style={{ opacity: 0.6, fontSize: 13, marginTop: 8 }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      aria-label="Vanguard 2 — universo 3D"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100dvh",
        display: "block",
        background: "#02040a",
        touchAction: "none",
        cursor: "grab",
      }}
      data-vanguard2={visitas ? "1" : "0"}
    />
  );
}
