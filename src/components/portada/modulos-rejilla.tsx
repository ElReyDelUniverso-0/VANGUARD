// ============================================================
// v402.6 LOS NUEVE MÓDULOS — LA REJILLA DE MÓDULOS (servidor, cero JS)
// Una tarjeta por módulo con su ilustración, su frase de entrada y los nombres
// de sus salas. Las cuentas salen de modulos.ts (cero cifras a mano).
// La usan la portada principal, /modulos y la portada de cada módulo.
// ============================================================
import Link from "next/link";
import { MODULOS_PUBLICOS, portadaDe } from "./modulos";
import { PortadaHermosaModulo } from "./portadas-hermosas";

export function ModulosRejilla({ excepto, compacta = false }: { excepto?: string; compacta?: boolean }) {
  const lista = MODULOS_PUBLICOS.filter((m) => m.id !== excepto);
  return (
    <div className="vx-mods" data-compacta={compacta ? "1" : "0"}>
      {lista.map((m) => {
        const n = MODULOS_PUBLICOS.findIndex((x) => x.id === m.id) + 1;
        const vivos = m.pestanas.filter((p) => p.vivo).length;
        const visibles = m.pestanas.slice(0, 4);
        const resto = m.pestanas.length - visibles.length;
        return (
          <Link key={m.id} href={portadaDe(m)} className="vx-mod group overflow-hidden">
            <span className="vx-mira vx-esquinas" aria-hidden />
            <div className="vx-mod-bg overflow-hidden">
              <PortadaHermosaModulo id={m.id} />
            </div>
            <div className="vx-mod-cab">
              <span className="vx-mod-num">{String(n).padStart(2, "0")}</span>
              {vivos > 0 && (
                <span className="vx-mod-vivo">
                  <span className="vx-punto" /> En vivo
                </span>
              )}
            </div>
            <div className="vx-mod-pie">
              <h3>{m.nombre}</h3>
              <p>{m.gancho}</p>
              <ul className="vx-mod-salas" aria-label={`Salas de ${m.nombre}`}>
                {visibles.map((p) => (
                  <li key={p.href}>{p.label}</li>
                ))}
                {resto > 0 && <li>+{resto}</li>}
              </ul>
              <span className="vx-mod-ir">
                {m.pestanas.length} salas <span aria-hidden>→</span>
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
