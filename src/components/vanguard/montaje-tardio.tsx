"use client";

// v194.0 LA CASA PESO PLUMA — EL MONTAJE TARDÍO.
// Los motores de ambiente (3D, cama, luxe, cine, asistente, centinela,
// retención, agentes...) NO pelean con el JS crítico de la hidratación:
// cada byte que ellos bajan al boot es un byte que el Dueño con señal
// lenta no puede gastar en despertar la casa. Este wrapper monta a sus
// hijos SOLO cuando ① la casa ya respira (__vgvivo) y ② el hilo queda
// idle (o vence el tope). Cero cambios visibles en red rápida; en señal
// lenta la casa despierta PRIMERO y el ambiente llega después.
// Sin mismatch de hidratación: servidor y primer render del cliente
// pintan lo mismo (null).
import { useEffect, useState, type ReactNode } from "react";

export function MontajeTardio({
  children,
  tope = 6000,
}: {
  children: ReactNode;
  tope?: number;
}) {
  const [listo, setListo] = useState(false);
  useEffect(() => {
    let cancelado = false;
    const encender = () => {
      if (cancelado) return;
      cancelado = true;
      setListo(true);
    };
    const arrancar = () => {
      // pequeño respiro tras vgvivo: la casa pinta, el hilo baja de revoluciones
      const t = window.setTimeout(() => {
        const w = window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => void };
        if (typeof w.requestIdleCallback === "function") {
          w.requestIdleCallback(encender, { timeout: tope });
        } else {
          window.setTimeout(encender, 300);
        }
      }, 2500);
      // si la casa tarda en dar señal, el tope manda: jamás colgamos para siempre
      const guardia = window.setTimeout(encender, tope + 4000);
      return () => {
        window.clearTimeout(t);
        window.clearTimeout(guardia);
      };
    };
    let limpiar: (() => void) | undefined;
    try {
      if ((window as unknown as { __vgvivo?: boolean }).__vgvivo === true) {
        limpiar = arrancar();
      } else {
        const iv = window.setInterval(() => {
          try {
            if ((window as unknown as { __vgvivo?: boolean }).__vgvivo === true) {
              window.clearInterval(iv);
              limpiar = arrancar();
            }
          } catch {
            window.clearInterval(iv);
            limpiar = arrancar();
          }
        }, 400);
        const GuardiaTimeout = window.setTimeout(() => {
          window.clearInterval(iv);
          if (!cancelado) limpiar = arrancar();
        }, tope + 4000);
        limpiar = () => {
          window.clearInterval(iv);
          window.clearTimeout(GuardiaTimeout);
        };
      }
    } catch {
      const t = window.setTimeout(encender, tope);
      limpiar = () => window.clearTimeout(t);
    }
    return () => {
      if (limpiar) limpiar();
    };
  }, [tope]);
  return listo ? <>{children}</> : null;
}
