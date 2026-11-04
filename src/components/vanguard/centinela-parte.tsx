"use client";

// v251.0 EL REFUGIO CON MEMORIA — el centinela del parte. Vive en
// /guerra-hoy (la primera página, la puerta más visitada de la Casa):
// cada vez que la sala se pinta con cables reales, deja en el aparato
// (localStorage vg-ultimo-parte) la copia que el REFUGIO (/offline)
// mostrará si la red muere. Silencioso por contrato: no pinta nada,
// no pide nada, no decide nada (ley v190) — solo guarda, con la hora
// del guardado, para que el refugio jamás pueda fingir que es vivo.

import { useEffect } from "react";

export type PiezaParte = {
  id: string;
  t: string; // título del cable
  f: string; // fuente
  fecha: string; // ISO
};

export const CLAVE_PARTE = "vg-ultimo-parte";
const LOTE = 8;

export function CentinelaParte({ parte }: { parte: PiezaParte[] }) {
  useEffect(() => {
    const piezas = parte.slice(0, LOTE);
    if (piezas.length === 0) return;
    try {
      window.localStorage.setItem(
        CLAVE_PARTE,
        JSON.stringify({ guardado: Date.now(), items: piezas })
      );
    } catch {
      /* sin almacenamiento: el refugio mostrará su vacío honesto */
    }
  }, [parte]);
  return null;
}
