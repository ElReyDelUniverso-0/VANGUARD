"use client";

// ═══════════════════════════════════════════════════════════════════
// v431.2 · EL SELLO DE CLASIFICACIÓN
//
// La casa se declara lo que es: un sistema cerrado. Una franja de peligro
// arriba (3 px, no ocupa sitio ni tapa nada) y un sello de expediente en la
// esquina con el sector y la hora UTC en vivo.
//
// · No bloquea clics (`pointer-events: none`).
// · No se pinta en el servidor con la hora: arranca en «--:--:--Z» y la
//   primera lectura llega al hidratar, así que no hay desajuste.
// · Se esconde en móvil (donde el sello estorbaría) y en /vanguard2 (el 3D
//   manda y no lleva capas 2D encima).
// · Si la casa tiene las animaciones desactivadas, la franja sigue ahí pero
//   quieta: es información, no adorno.
// ═══════════════════════════════════════════════════════════════════
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function Clasificacion() {
  const ruta = usePathname();
  const [hora, setHora] = useState("--:--:--Z");

  useEffect(() => {
    const pintar = () => {
      const d = new Date();
      const hh = String(d.getUTCHours()).padStart(2, "0");
      const mm = String(d.getUTCMinutes()).padStart(2, "0");
      const ss = String(d.getUTCSeconds()).padStart(2, "0");
      setHora(`${hh}:${mm}:${ss}Z`);
    };
    pintar();
    const t = window.setInterval(pintar, 1000);
    return () => window.clearInterval(t);
  }, []);

  if (ruta?.startsWith("/vanguard2")) return null;

  return (
    <>
      <div className="op-franja" aria-hidden="true" />
      <div className="op-sello" aria-hidden="true">
        <b>Confidencial</b>
        <span>Sector 05 · {hora}</span>
      </div>
    </>
  );
}
