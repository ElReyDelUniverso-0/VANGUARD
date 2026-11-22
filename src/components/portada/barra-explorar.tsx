// ============================================================
// v439.0 ORDEN — BARRA DE EXPLORACIÓN (única, en toda la casa)
// Antes, la portada y /modulos repetían un trío de botones sueltos
// (Mundos · Travesía · Directorio) con estilos distintos y sin
// coordinación. Ahora es UNA sola barra, con un solo estilo, que se
// usa en todos los puntos de entrada de la casa.
// ============================================================
import Link from "next/link";

const PUERTAS = [
  { href: "/mundos", etiqueta: "Mundos", txt: "los cinco mundos" },
  { href: "/entrar", etiqueta: "Travesía", txt: "recorrer la casa" },
  { href: "/directorio", etiqueta: "Directorio", txt: "buscar una sala" },
] as const;

export function BarraExplorar({
  compacta = false,
  ancho = "normal",
}: {
  compacta?: boolean;
  ancho?: "normal" | "ancho";
}) {
  return (
    <nav
      className={`vx-barra${compacta ? " vx-barra--c" : ""}${ancho === "ancho" ? " vx-barra--ancho" : ""}`}
      aria-label="Explorar la casa"
    >
      {PUERTAS.map((p) => (
        <Link key={p.href} href={p.href} className="vx-barra-a">
          <b>{p.etiqueta}</b>
          <span>{p.txt}</span>
        </Link>
      ))}
    </nav>
  );
}
