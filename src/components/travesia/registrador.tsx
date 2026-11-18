"use client";

// ═══════════════════════════════════════════════════════════════════
// v406.0 LA TRAVESÍA — EL REGISTRADOR: deja un paso del rastro en cada
// página. Sin red, sin render (devuelve null), sin tocar las salas: lee la
// ruta y el título cuando la página ya los tiene. En el cuartel, cuya sala
// cambia sin cambiar la URL, mira cada pocos segundos la sala activa que
// el propio cuartel ya guarda (vg-cromo-activa-v106) y la apunta como
// /cuartel?sala=<clave> — la misma puerta que abre esa sala de vuelta.
// ═══════════════════════════════════════════════════════════════════
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { dejaHuella, guardarRastro, leerRastro, registrarPaso, tipoDeRuta } from "@/lib/travesia/rastro";
import { espacioDeRuta, nombreSala, tituloDeRuta } from "@/lib/travesia/espacios";

function apuntar(url: string, tituloDoc: string) {
  const ruta = url.split("?")[0];
  if (!dejaHuella(ruta)) return;
  guardarRastro(
    registrarPaso(leerRastro(), {
      u: url,
      r: ruta,
      ti: tituloDeRuta(url, tituloDoc),
      k: tipoDeRuta(ruta),
      e: espacioDeRuta(ruta),
      t: Date.now(),
    })
  );
}

/** solo los parámetros que identifican lo que estabas viendo */
const QUERY_UTIL = ["sala", "id", "q", "pais", "tag", "escenario"];

function urlActual(): string {
  const { pathname, search } = window.location;
  const p = new URLSearchParams(search);
  const util = new URLSearchParams();
  for (const k of QUERY_UTIL) {
    const v = p.get(k);
    if (v) util.set(k, v.slice(0, 80));
  }
  const q = util.toString();
  return q ? `${pathname}?${q}` : pathname;
}

export function Registrador() {
  const ruta = usePathname();

  useEffect(() => {
    if (!ruta || !dejaHuella(ruta)) return;
    // el título llega con la página: esperamos a que se asiente
    const t = window.setTimeout(() => apuntar(urlActual(), document.title), 900);
    return () => window.clearTimeout(t);
  }, [ruta]);

  useEffect(() => {
    if (ruta !== "/cuartel") return;
    let ultima = "";
    const mirar = () => {
      try {
        const sala = localStorage.getItem("vg-cromo-activa-v106");
        if (sala && sala !== ultima && sala !== "inicio" && nombreSala(sala)) {
          ultima = sala;
          apuntar(`/cuartel?sala=${sala}`, "");
        }
      } catch {
        /* aparato mudo */
      }
    };
    const id = window.setInterval(mirar, 4000);
    const t = window.setTimeout(mirar, 2500);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(t);
    };
  }, [ruta]);

  return null;
}
