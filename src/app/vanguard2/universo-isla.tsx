"use client";

// ============================================================
// v307.0 LA ISLA DEL UNIVERSO — la cura medida por EL CENSO DE
// VELOCIDAD (tercera cuchilla del mandato del Dueño).
//
// HALLAZGO MEDIDO: /vanguard2/page.tsx importaba a Vanguard2 de
// forma estática, así que three.js viajaba en el grafo INICIAL de
// la ruta (chunk ~720 KB con el núcleo completo del motor) donde
// el grupo de caché «familia-tres» de la v244 (chunks:"async") no
// podía reunirlo: la casa pagaba DOS copias del motor — la familia
// reunida (1.6 MB, para el home y las salas 3D) y ESTA copia
// suelta para la ruta del universo (~720 KB crudos extra).
//
// CURA (misma casa, patrón existente de mundo-3d-vivo): el
// universo nace como ISLA PEREZOSA (next/dynamic ssr:false) — su
// grafo pasa a asíncrono, el cacheGroup lo reúne con su familia y
// la copia duplicada muere. El visitante de /vanguard2 ya solo
// baja el motor una vez (y si vino de casa, ni eso: lo tiene en
// caché de fábrica).
//
// HONESTIDAD: el «primer frame ya es 3D» del motor (campo de
// estrellas mientras la fuente 3D carga) queda INTACTO dentro del
// motor — lo único que cambia es que el CHUNGO del motor baja
// después del HTML. El placeholder viste el tono exacto del
// universo (#02040a) para que el nacimiento sea seamless.
// ============================================================

import dynamic from "next/dynamic";

export const UniversoIsla = dynamic(
  // el universo viaja como export DEFAULT del componente (misma firma que
  // consumía el import estático de la página) — la isla solo cambia el
  // CUÁNDO baja su chunk, jamás el componente que la casa renderiza
  () => import("@/components/vanguard2/vanguard2").then((m) => m.default),
  {
    ssr: false,
    loading: () => (
      <div
        className="fixed inset-0 z-0 grid place-items-center bg-[#02040a]"
        aria-hidden="true"
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-zinc-600 animate-pulse">
          abriendo el universo…
        </p>
      </div>
    ),
  }
);
