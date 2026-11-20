"use client";
// ═══════════════════════════════════════════════════════════════════
// v431.5 RADIO VANGUARD · UNA SOLA EMISIÓN PARA TODA LA CASA
//
// EL PROBLEMA QUE RESUELVE: la voz vivía en un solo sitio (/radio) y cada
// pantalla que quería hablar tenía que reescribir el encadenado de bloques.
// Con dos copias, la pausa de un bloque se arregla en una y se olvida en la
// otra. Este hook es la ÚNICA implementación del encadenado: la usa el
// estudio (/radio) y la usa la emisora global que ahora vive en toda la casa.
//
// CÓMO HABLA: bloque a bloque, con `decir()` (la boca de la casa) y esperando
// el `pausaMs` que el guion declara — silencio real, no puntos suspensivos.
// Avisa del bloque y de cada frase (subtítulos) y sabe parar, saltar y
// reanudar desde donde iba.
// ═══════════════════════════════════════════════════════════════════

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { decir, pararBoca, type GustosVoz } from "@/lib/voz/decir";
import type { BloqueGuion } from "./guion";

export type Frase = { texto: string; i: number; total: number };

export type OpcionesEmision = {
  /** se llama al entrar en un bloque (para señalar en pantalla) */
  onBloque?: (i: number) => void;
  /** se llama al terminar el programa */
  onFin?: () => void;
  /** ¿guardar la posición? (el estudio lo hace; la emisora global también) */
  onPosicion?: (i: number) => void;
};

export function usaEmision(bloques: BloqueGuion[], gustos: GustosVoz, opciones: OpcionesEmision = {}) {
  const [sonando, setSonando] = useState(false);
  const [bloqueActual, setBloqueActual] = useState(-1);
  const [frase, setFrase] = useState<Frase | null>(null);
  const [sinVoz, setSinVoz] = useState(false);
  const vivo = useRef(false);
  const temporizador = useRef<number | null>(null);
  // las opciones cambian en cada render: se guardan en una ref para que el
  // encadenado no se recree (y no reinicie el discurso a mitad de frase)
  const cb = useRef(opciones);
  cb.current = opciones;
  const bloquesRef = useRef(bloques);
  bloquesRef.current = bloques;
  const gustosRef = useRef(gustos);
  gustosRef.current = gustos;

  const parar = useCallback(() => {
    vivo.current = false;
    if (temporizador.current) window.clearTimeout(temporizador.current);
    temporizador.current = null;
    pararBoca();
    setSonando(false);
    setBloqueActual(-1);
    setFrase(null);
  }, []);

  const decirBloque = useCallback((i: number) => {
    if (!vivo.current) return;
    const lista = bloquesRef.current;
    if (i >= lista.length) {
      vivo.current = false;
      setSonando(false);
      setBloqueActual(-1);
      setFrase(null);
      cb.current.onFin?.();
      return;
    }
    const bloque = lista[i];
    setBloqueActual(i);
    setFrase(null);
    cb.current.onBloque?.(i);
    cb.current.onPosicion?.(i);
    const ok = decir(bloque.texto, {
      gustos: gustosRef.current,
      interrumpir: i === 0,
      onFrase: (texto, indice, total) => setFrase({ texto, i: indice, total }),
      onFin: () => {
        if (!vivo.current) return;
        // EL SILENCIO DECLARADO, esperado de verdad
        temporizador.current = window.setTimeout(() => decirBloque(i + 1), bloque.pausaMs);
      },
    });
    if (!ok) {
      // el aparato no puede hablar: la casa lo dice y deja el texto en pantalla
      vivo.current = false;
      setSonando(false);
      setFrase(null);
      setSinVoz(true);
    }
  }, []);

  const empezar = useCallback(
    (desde = 0) => {
      vivo.current = true;
      setSonando(true);
      setSinVoz(false);
      decirBloque(Math.max(0, Math.min(bloquesRef.current.length - 1, desde)));
    },
    [decirBloque]
  );

  const saltar = useCallback(
    (delta: number) => {
      const total = bloquesRef.current.length;
      const destino = Math.max(0, Math.min(total - 1, (bloqueActual < 0 ? 0 : bloqueActual) + delta));
      vivo.current = false;
      pararBoca();
      if (temporizador.current) window.clearTimeout(temporizador.current);
      vivo.current = true;
      setSonando(true);
      decirBloque(destino);
    },
    [bloqueActual, decirBloque]
  );

  useEffect(() => {
    return () => {
      vivo.current = false;
      if (temporizador.current) window.clearTimeout(temporizador.current);
      pararBoca();
    };
  }, []);

  // el objeto solo cambia cuando cambia de verdad (empezar/parar/saltar son
  // estables): así los efectos que dependen de él no se rearman en cada render
  return useMemo(
    () => ({ sonando, bloqueActual, frase, sinVoz, empezar, parar, saltar }),
    [sonando, bloqueActual, frase, sinVoz, empezar, parar, saltar]
  );
}
