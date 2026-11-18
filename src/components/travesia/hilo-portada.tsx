"use client";

// ═══════════════════════════════════════════════════════════════════
// v406.0 LA TRAVESÍA — EL HILO EN LA PORTADA: una sola línea, solo para
// quien ya anduvo por la casa: «continúa donde lo dejaste» + la puerta a su
// Travesía. Quien llega por primera vez no ve nada (la noticia manda).
// Sin ventanitas flotantes (ley v400 ⑥): vive dentro del flujo de la página.
// ═══════════════════════════════════════════════════════════════════
import Link from "next/link";
import { useEffect, useState } from "react";
import { haceCuanto, leerRastro, paraContinuar, type Paso } from "@/lib/travesia/rastro";
import { NOMBRE_TIPO } from "@/lib/travesia/espacios";
import "./hilo-portada.css";

export function HiloPortada() {
  const [paso, setPaso] = useState<Paso | null>(null);
  useEffect(() => {
    const leer = () => setPaso(paraContinuar(leerRastro()));
    leer();
    window.addEventListener("vg-rastro", leer);
    return () => window.removeEventListener("vg-rastro", leer);
  }, []);
  if (!paso) return null;
  return (
    <nav className="tv-hp" aria-label="Continúa donde lo dejaste">
      <Link href={paso.u} className="tv-hp-seguir">
        <span className="tv-hp-k">{NOMBRE_TIPO[paso.k].verbo}</span>
        <span className="tv-hp-t">{paso.ti}</span>
        <span className="tv-hp-h">{haceCuanto(paso.t)} →</span>
      </Link>
      <Link href="/entrar" className="tv-hp-tv">
        Tu Travesía
      </Link>
    </nav>
  );
}

/** botón de la portada hacia la entrada inmersiva (junto a la Puerta de mundos) */
export function BotonTravesia() {
  return (
    <Link href="/entrar" className="tv-hp-boton">
      Recorrer toda la casa · La Travesía →
    </Link>
  );
}

/** v406.5 — la puerta al directorio: todas las salas, buscables, con favoritos */
export function BotonDirectorio() {
  return (
    <Link href="/directorio" className="tv-hp-boton">
      Buscar cualquier herramienta · El directorio →
    </Link>
  );
}
