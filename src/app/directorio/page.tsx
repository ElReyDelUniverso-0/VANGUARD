import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import { Marco } from "@/components/planeta/marco";
import { Directorio } from "@/components/planeta/directorio";
import { COLECCIONES, TEMAS, payloadDirectorio } from "@/lib/planeta/directorio";

// ═══════════════════════════════════════════════════════════════════
// v406.5 · /directorio — TODAS LAS PUERTAS DE LA CASA
// El índice que cruza la cabecera, el censo del Núcleo y las familias de
// módulos. Buscable al instante, con temas inteligentes, favoritos, recientes
// (el rastro de la Travesía, vg-rastro-v1) y recomendaciones según lo visto.
// ═══════════════════════════════════════════════════════════════════

export const metadata: Metadata = {
  title: "Directorio de Vanguard: todas las herramientas y salas | VANGUARD",
  description:
    "El índice completo de Vanguard: busca cualquier herramienta, sala o centro, fíltralo por tema, marca tus favoritos y retoma lo que viste por última vez.",
  alternates: { canonical: `${SITE_URL}/directorio` },
};

export default function DirectorioPage() {
  const destinos = payloadDirectorio();
  const temas = TEMAS.map((t) => ({ id: t.id, nombre: t.nombre, pregunta: t.pregunta, color: t.color }));
  const colecciones = COLECCIONES.map((c) => ({ clave: c.clave, titulo: c.titulo, pregunta: c.pregunta, paradas: c.paradas.length, minutos: c.minutos }));
  return (
    <Marco
      ruta="/directorio"
      volanta="Vanguard · Directorio"
      titulo="Todas las puertas de la casa"
      sub={`${destinos.length} destinos en un solo índice. Busca por lo que quieres hacer («comparar países», «armas», «radio»…), filtra por tema y marca con ★ los que usas siempre.`}
      fuente={
        <>
          Fuente: los módulos de la cabecera (src/components/portada/modulos.ts), el censo del Núcleo (src/lib/nucleo/registro.ts) y las familias de
          módulos (src/lib/nucleo/fusiones.ts), cruzados por ruta en src/lib/planeta/directorio.ts. Tus favoritos y tus recientes viven solo en este
          navegador (vx406.5-directorio-favs y vg-rastro-v1): no se envían a ningún servidor.
        </>
      }
    >
      <Directorio destinos={destinos} temas={temas} colecciones={colecciones} />
    </Marco>
  );
}
