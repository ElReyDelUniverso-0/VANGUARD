"use client";
// ═══════════════════════════════════════════════════════════════════
// v431.6 EL CUADERNO · EL GANCHO (estado, guardado y deshacer)
//
// Todo lo que el cuaderno recuerda vive EN ESTE APARATO (localStorage):
// ni cuentas ni servidor guardan lo que alguien escribe aquí. Este gancho
// es el único sitio que escribe esa clave — si hubiera dos, la última en
// guardar pisaría a la otra y se perderían notas.
//
// · guarda solo cuando algo cambia, con un respiro de 400 ms (no en cada
//   tecla: escribir tiene que ir fluido);
// · guarda una pila corta para deshacer (24 pasos) y rehacer;
// · la PRIMERA vez trae lo que hubiera en el tablero de la Zona Cero;
// · escucha `vg:cuaderno` para que cualquier sala pueda mandarle una pieza.
// ═══════════════════════════════════════════════════════════════════

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  aJSON,
  acomodar,
  aMarkdown,
  cambiarEmblema,
  cambiarPiel,
  cambiarVista,
  cuenta,
  desdeJSON,
  editar,
  enlazar,
  desenlazar,
  fusionar,
  limpiar,
  migrarZonaCero,
  mover,
  nuevoCuaderno,
  poner,
  posicionOrbita,
  quitar,
  senalar,
  alternarTarea,
  marcar,
  etiquetar,
  type Cuaderno,
  type Emblema,
  type Pieza,
} from "@/lib/cuaderno/modelo";
import type { Piel, Vista } from "@/lib/cuaderno/pieles";

const CLAVE = "vg-cuaderno-v1";
const CLAVE_ZONA = "vx-zona-cero-v1";
const CLAVE_TRAIDO = "vg-cuaderno-traido-zona";
const MAX_HISTORIA = 24;

export type EstadoGuardado = "inicial" | "guardando" | "guardado" | "sin-espacio";

export function usaCuaderno() {
  const [cuaderno, setCuadernoState] = useState<Cuaderno>(() => nuevoCuaderno());
  const [listo, setListo] = useState(false);
  const [estado, setEstado] = useState<EstadoGuardado>("inicial");
  const [traido, setTraido] = useState(0);
  const [aviso, setAviso] = useState("");
  const historia = useRef<Cuaderno[]>([]);
  const futuro = useRef<Cuaderno[]>([]);
  const guardado = useRef<string>("");
  const reloj = useRef<number | null>(null);
  // cuántos pasos hay en cada pila (en ESTADO: leer un ref durante el render
  // es justo lo que el compilador de la casa prohíbe)
  const [pilas, setPilas] = useState({ atras: 0, adelante: 0 });

  // ── ① abrir: lo guardado + lo que hubiera en la Zona Cero ──
  useEffect(() => {
    let base = nuevoCuaderno();
    try {
      const crudo = localStorage.getItem(CLAVE);
      if (crudo) base = limpiar(JSON.parse(crudo));
      if (!localStorage.getItem(CLAVE_TRAIDO)) {
        const zona = localStorage.getItem(CLAVE_ZONA);
        if (zona) {
          const otro = migrarZonaCero(JSON.parse(zona));
          if (otro.piezas.length) {
            base = fusionar(base, otro);
            setTraido(otro.piezas.length);
          }
        }
        localStorage.setItem(CLAVE_TRAIDO, new Date().toISOString());
      }
    } catch {
      /* modo privado o guardado corrupto: se empieza limpio, sin drama */
    }
    guardado.current = JSON.stringify(base);
    setCuadernoState(base);
    setListo(true);
  }, []);

  // ── ② guardar con respiro (400 ms) ──
  useEffect(() => {
    if (!listo) return;
    const texto = JSON.stringify(cuaderno);
    if (texto === guardado.current) return;
    setEstado("guardando");
    if (reloj.current) window.clearTimeout(reloj.current);
    reloj.current = window.setTimeout(() => {
      try {
        localStorage.setItem(CLAVE, texto);
        guardado.current = texto;
        setEstado("guardado");
      } catch {
        setEstado("sin-espacio");
        setAviso("El aparato no deja guardar más (almacenamiento lleno). Exporta el cuaderno para no perderlo.");
      }
    }, 400);
    return () => {
      if (reloj.current) window.clearTimeout(reloj.current);
    };
  }, [cuaderno, listo]);

  // ── ③ aplicar un cambio dejando el anterior en la pila ──
  const aplicar = useCallback((cambio: (c: Cuaderno) => Cuaderno) => {
    setCuadernoState((actual) => {
      const siguiente = cambio(actual);
      if (siguiente === actual) return actual;
      historia.current = [...historia.current, actual].slice(-MAX_HISTORIA);
      futuro.current = [];
      setPilas({ atras: historia.current.length, adelante: 0 });
      return siguiente;
    });
  }, []);

  const deshacer = useCallback(() => {
    setCuadernoState((actual) => {
      const previo = historia.current.pop();
      if (!previo) return actual;
      futuro.current = [...futuro.current, actual].slice(-MAX_HISTORIA);
      setPilas({ atras: historia.current.length, adelante: futuro.current.length });
      return previo;
    });
  }, []);

  const rehacer = useCallback(() => {
    setCuadernoState((actual) => {
      const siguiente = futuro.current.pop();
      if (!siguiente) return actual;
      historia.current = [...historia.current, actual].slice(-MAX_HISTORIA);
      setPilas({ atras: historia.current.length, adelante: futuro.current.length });
      return siguiente;
    });
  }, []);

  // ── ④ lo que manda la casa desde otra sala ──
  useEffect(() => {
    const alRecibir = (e: Event) => {
      const detalle = (e as CustomEvent).detail as Partial<Pieza> | undefined;
      if (!detalle || !(detalle.titulo || detalle.cuerpo)) return;
      aplicar((c) => {
        const pos = posicionOrbita(c.piezas.length);
        return poner(c, { ...detalle, x: detalle.x ?? pos.x, y: detalle.y ?? pos.y, creada: Date.now() }, Date.now());
      });
      setAviso(`«${String(detalle.titulo ?? "Pieza").slice(0, 60)}» entró en el cuaderno.`);
    };
    window.addEventListener("vg:cuaderno", alRecibir as EventListener);
    return () => window.removeEventListener("vg:cuaderno", alRecibir as EventListener);
  }, [aplicar]);

  const acciones = useMemo(
    () => ({
      poner: (pieza: Partial<Pieza>) =>
        // cada pieza nueva busca su sitio en la órbita: nunca dos encima
        aplicar((c) => {
          const pos = posicionOrbita(c.piezas.length);
          return poner(c, { ...pieza, x: pieza.x ?? pos.x, y: pieza.y ?? pos.y }, Date.now());
        }),
      editar: (id: string, cambios: Partial<Pieza>) => aplicar((c) => editar(c, id, cambios)),
      quitar: (id: string) => aplicar((c) => quitar(c, id)),
      mover: (id: string, x: number, y: number) => aplicar((c) => mover(c, id, x, y)),
      marcar: (id: string, marca: Pieza["marca"]) => aplicar((c) => marcar(c, id, marca)),
      etiquetar: (id: string, etiquetas: unknown) => aplicar((c) => etiquetar(c, id, etiquetas)),
      tarea: (id: string) => aplicar((c) => alternarTarea(c, id)),
      enlazar: (a: string, b: string) => aplicar((c) => enlazar(c, a, b)),
      desenlazar: (a: string, b: string) => aplicar((c) => desenlazar(c, a, b)),
      piel: (piel: Piel) => aplicar((c) => cambiarPiel(c, piel)),
      vista: (vista: Vista) => aplicar((c) => cambiarVista(c, vista)),
      emblema: (cambios: Partial<Emblema>) => aplicar((c) => cambiarEmblema(c, cambios)),
      /** SEÑALAR: el texto del cuerpo, con el tramo elegido entre ==...== */
      senalar: (id: string, desde: number, hasta: number): { desde: number; hasta: number } => {
        const p = cuaderno.piezas.find((x) => x.id === id);
        if (!p) return { desde, hasta };
        const r = senalar(p.cuerpo, desde, hasta);
        aplicar((c) => editar(c, id, { cuerpo: r.texto }));
        return { desde: r.desde, hasta: r.hasta };
      },
      exportarJSON: () => aJSON(cuaderno),
      exportarMarkdown: () => aMarkdown(cuaderno),
      importar: (texto: string): boolean => {
        const otro = desdeJSON(texto);
        if (!otro) return false;
        aplicar((c) => fusionar(c, otro));
        return true;
      },
      traerZonaCero: (): number => {
        try {
          const crudo = localStorage.getItem(CLAVE_ZONA);
          if (!crudo) return 0;
          const otro = migrarZonaCero(JSON.parse(crudo));
          if (!otro.piezas.length) return 0;
          aplicar((c) => fusionar(c, otro));
          return otro.piezas.length;
        } catch {
          return 0;
        }
      },
      acomodar: () => aplicar((c) => acomodar(c)),
      vaciar: () => aplicar(() => nuevoCuaderno()),
      avisar: (texto: string) => setAviso(texto),
      deshacer,
      rehacer,
    }),
    [aplicar, cuaderno, deshacer, rehacer]
  );

  const cifras = useMemo(() => cuenta(cuaderno), [cuaderno]);

  return {
    cuaderno,
    cifras,
    listo,
    estado,
    aviso,
    setAviso,
    traido,
    puedeDeshacer: pilas.atras > 0,
    puedeRehacer: pilas.adelante > 0,
    ...acciones,
  };
}

export type CuadernoEstado = ReturnType<typeof usaCuaderno>;
