// ═══════════════════════════════════════════════════════════════════
// v407.1 · EL MARCO DE LOS CENTROS — atajos, cabecera y «sigue explorando».
// Server component: cero JS. Cada centro nuevo lo monta para que ninguno
// quede aislado: el pie recomienda las puertas vecinas (directorio.ts →
// relacionados()) y las colecciones que pasan por la página.
// ═══════════════════════════════════════════════════════════════════
import Link from "next/link";
import type { ReactNode } from "react";
import { coleccionesConRuta, relacionados } from "@/lib/planeta/directorio";
import "./planeta.css";

// La carcasa de la casa ya pinta las pestañas del módulo (Países, Comparador,
// Rankings…), así que esta barra NO las repite: lleva a las tres piezas
// transversales que sirven desde cualquier centro.
export const ATAJOS_PLANETA = [
  { href: "/modulo/planeta", label: "Planeta en cifras" },
  { href: "/directorio", label: "Directorio" },
  { href: "/colecciones", label: "Colecciones" },
  { href: "/espacio", label: "Mi espacio" },
];

export function Marco({
  ruta,
  volanta,
  titulo,
  sub,
  children,
  fuente,
  activo,
}: {
  /** la ruta de esta página (para la barra y las recomendaciones) */
  ruta: string;
  volanta: string;
  titulo: string;
  sub?: ReactNode;
  children: ReactNode;
  fuente?: ReactNode;
  /** qué botón de la barra se enciende (por defecto, el de la ruta) */
  activo?: string;
}) {
  const encendido = activo ?? ruta;
  return (
    <main className="vx-pl">
      <div className="vx-pl-caja">
        <nav className="vx-pl-barra" aria-label="Atajos">
          {ATAJOS_PLANETA.map((c) => (
            <Link key={c.href} href={c.href} aria-current={encendido === c.href ? "page" : undefined}>
              {c.label}
            </Link>
          ))}
        </nav>
        <header>
          <p className="vx-pl-volanta">{volanta}</p>
          <h1 className="vx-pl-titulo">{titulo}</h1>
          {sub ? <p className="vx-pl-sub">{sub}</p> : null}
        </header>
        {children}
        <SigueExplorando ruta={ruta} />
        {fuente ? <div className="vx-pl-fuente">{fuente}</div> : null}
      </div>
    </main>
  );
}

/** Las puertas vecinas de una ruta y las colecciones que pasan por ella. */
export function SigueExplorando({ ruta, titulo = "Sigue explorando" }: { ruta: string; titulo?: string }) {
  const rel = relacionados(ruta, 6);
  const cols = coleccionesConRuta(ruta).slice(0, 3);
  if (rel.length === 0 && cols.length === 0) return null;
  return (
    <section className="vx-pl-sigue" aria-label={titulo}>
      <h2 className="vx-pl-h2">{titulo}</h2>
      <p className="vx-pl-h2-sub">
        Puertas de la casa que responden preguntas vecinas.{" "}
        <Link href="/directorio" style={{ color: "#5eead4" }}>
          Ver el directorio completo →
        </Link>
      </p>
      <div className="vx-pl-rejilla">
        {rel.map((d) => (
          <Link key={d.ruta} href={d.ruta} className="vx-pl-tarjeta">
            <h3>{d.nombre}</h3>
            <p>{d.descripcion}</p>
            <p className="vx-pl-meta">{d.modulo}</p>
          </Link>
        ))}
      </div>
      {cols.length > 0 ? (
        <p className="vx-pl-h2-sub" style={{ marginTop: 12 }}>
          Esta página es parada de:{" "}
          {cols.map((c) => (
            <Link key={c.clave} href={`/colecciones/${c.clave}`} className="vx-pl-chip">
              {c.titulo}
            </Link>
          ))}
        </p>
      ) : null}
    </section>
  );
}

/** Bandera pequeña (flagcdn, la misma que usa la ficha del país). */
export function Bandera({ iso2, nombre }: { iso2: string; nombre: string }) {
  return (
    <img src={`https://flagcdn.com/w40/${iso2}.png`} alt="" title={nombre} className="vx-pl-bandera" loading="lazy" width={22} height={15} />
  );
}
