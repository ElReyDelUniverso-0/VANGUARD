// v401 — cabecera de sección: sello de la casa (Orbitron, rombo de oro) + título legible
import Link from "next/link";

export function TituloSeccion({
  sello,
  titulo,
  sub,
  enlace,
  textoEnlace = "Ver todo",
  color,
}: {
  sello: string;
  titulo: React.ReactNode;
  sub?: string;
  enlace?: string;
  textoEnlace?: string;
  color?: string;
}) {
  return (
    <div className="vx-sec-h">
      <div>
        <span className="vx-sello" style={color ? { color } : undefined}>{sello}</span>
        <h2>{titulo}</h2>
        {sub && <p>{sub}</p>}
      </div>
      {enlace && <Link href={enlace}>{textoEnlace} →</Link>}
    </div>
  );
}
