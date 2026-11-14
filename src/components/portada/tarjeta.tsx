// v400.0 — la tarjeta de nota: foto arriba, etiqueta de color, titular corto, hora.
import Link from "next/link";
import type { Nota } from "@/lib/portada/notas";
import { REGIONES, conflictoPorKey } from "@/lib/portada/clasificar";
import { Foto } from "./foto";
import { Hace } from "./hace";

export function Etiqueta({ nota }: { nota: Nota }) {
  const c = conflictoPorKey(nota.conflicto);
  const reg = REGIONES[nota.region] ?? REGIONES.mundo;
  return (
    <span className="vx-tag">
      <i style={{ background: reg.color }} />
      {c ? c.nombre : reg.nombre}
    </span>
  );
}

export function Tarjeta({ nota, grande = false, prioridad = false, cable }: { nota: Nota; grande?: boolean; prioridad?: boolean; cable?: number }) {
  return (
    <Link href={`/lectura/${nota.id}`} className="vx-tarj vx-mira" data-grande={grande ? "1" : "0"}>
      <div className="vx-tarj-img">
        <Foto src={nota.imagen} alt={nota.titulo} region={nota.region} prioridad={prioridad} />
        {cable !== undefined && <span className="vx-tarj-cable">CABLE {String(cable).padStart(4, "0")}</span>}
      </div>
      <div className="vx-tarj-b">
        <Etiqueta nota={nota} />
        <h3>{nota.titulo}</h3>
        {grande && nota.resumen && <p>{nota.resumen}</p>}
        <div className="vx-meta">
          <b>{nota.fuente}</b> · <Hace iso={nota.fecha} />
        </div>
      </div>
    </Link>
  );
}
