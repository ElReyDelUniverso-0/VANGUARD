// ═══════════════════════════════════════════════════════════════════
// v440.3 · VANGUARD CINEMATIC EXPERIENCE — la parte de servidor.
// Reúne los datos REALES (bitácora, módulos, salas del mundo) y se los pasa
// al disparador, que es pequeño. La escena pesada se carga solo si toca.
// ═══════════════════════════════════════════════════════════════════
import { BITACORA } from "@/lib/bitacora";
import { APP_VERSION } from "@/lib/version";
import { MODULOS_PUBLICOS } from "@/components/portada/modulos";
import { CineDisparador } from "./cine-disparador";
import type { DatosCine } from "./tipos";
import "./cine.css";

function datosCine(): DatosCine {
  const recientes = BITACORA.slice(0, 15)
    .map((b) => `${b.nombre} ${b.hitos.join(" ")}`)
    .join(" ");
  const novedades = BITACORA.slice(0, 3).map((b) => ({
    version: b.version,
    nombre: b.nombre.length > 90 ? b.nombre.slice(0, 88) + "…" : b.nombre,
  }));
  const modulos = MODULOS_PUBLICOS.map((m) => {
    const salas = Array.from(new Set(m.pestanas.map((p) => p.href.split(/[?#]/)[0]))).filter((h) => h.startsWith("/"));
    const actualizado = salas.some((h) => {
      const re = new RegExp(h.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?![\\w-])");
      return h.length > 2 && re.test(recientes);
    });
    return { id: m.id, nombre: m.nombre, lema: m.lema, nav: m.nav, salas, actualizado };
  });
  const mundo = MODULOS_PUBLICOS.find((m) => m.id === "mundo");
  const ventanas = (mundo?.pestanas ?? [])
    .filter((p) => p.txt && ["/mundos", "/mapas", "/worlds", "/mundo"].includes(p.href))
    .slice(0, 3)
    .map((p) => ({ label: p.label, txt: (p.txt as string).length > 110 ? (p.txt as string).slice(0, 108) + "…" : (p.txt as string), href: p.href }));
  return { version: APP_VERSION, novedades, modulos, ventanas };
}

export function CineVanguard() {
  return <CineDisparador datos={datosCine()} />;
}
