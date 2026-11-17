#!/usr/bin/env node
/** ESPACIO MULTIAGENTE VANGUARD · CLI
 *  Uso: node dist/cli.js <comando> [args]   — espacio: ./espacio/espacio.json o ESPACIO=/ruta
 */
import { Almacen } from "./almacen.js";
import { ROLES, rolPorId } from "./roles.js";
import { obtenerFuenteReal, fuenteDesdeResultado } from "./fuentes.js";
import { generarInforme } from "./informe.js";
import { matrizSolapamiento } from "./comparar.js";
import { writeFileSync } from "fs";
import { basename } from "path";

const rutaAlmacen = process.env.ESPACIO || "espacio/espacio.json";
const A = new Almacen(rutaAlmacen);
const [,, cmd, ...args] = process.argv;

const ayuda = `comandos:
  roles                                  lista especialistas (funciones delimitadas)
  tablero                                resumen de tareas/hallazgos/fuentes
  tarea nuevo "titulo" --rol X [--detalle "..."]
  tarea asignar <id> <rol>
  tarea estado <id> <pendiente|en-curso|hecha|bloqueada> [--evidencia "texto"]
  hallazgo <tareaId> "texto" [--rol X] [--confianza baja|media|alta] [--fuente <idFuente>]
  fuente <url> [--nota "..."]            fetch HTTP REAL y registro (si falla, no guarda nada)
  pregunta nuevo "titulo"
  respuesta <preguntaId> <rol> "texto"
  comparar <preguntaId>
  informe [archivo.md]                   genera el informe (por defecto imprime)
  rol <id>                               detalle del especialista`;

function opcion(args: string[], nombre: string): string | undefined {
  const i = args.indexOf("--" + nombre);
  return i >= 0 ? args[i + 1] : undefined;
}
function requerido(args: string[], nombre: string): string {
  const v = opcion(args, nombre);
  if (!v) { console.error("falta --" + nombre); process.exit(2); }
  return v;
}
const posicional = (args: string[]) => args.filter((a, i) => !a.startsWith("--") && (i === 0 || !args[i - 1].startsWith("--")));

(async () => {
  switch (cmd) {
    case undefined: case "ayuda": console.log(ayuda); break;
    case "roles":
      for (const r of ROLES) console.log(`${r.id.padEnd(12)} [${r.estado}] ${r.nombre} — ${r.resumen}`);
      break;
    case "rol": {
      const r = rolPorId(args[0]); if (!r) { console.error("rol desconocido: " + args[0]); process.exit(2); }
      console.log(JSON.stringify(r, null, 2)); break;
    }
    case "tablero": {
      const e = A.cargar();
      console.log(`tareas ${e.tareas.length} · hallazgos ${e.hallazgos.length} · fuentes ${e.fuentes.length} · preguntas ${e.preguntas.length}`);
      for (const t of e.tareas) console.log(`  ${t.id} [${t.estado.padEnd(9)}] ${t.rol.padEnd(12)} ${t.titulo}`);
      break;
    }
    case "tarea": {
      const sub = args[0];
      if (sub === "nuevo") {
        const t = A.nuevaTarea(posicional(args).slice(1).join(" ") || args[1], requerido(args, "rol"), opcion(args, "detalle") ?? "");
        console.log("creada", t.id, "→", t.rol);
      } else if (sub === "asignar") console.log(A.asignarTarea(args[1], args[2]));
      else if (sub === "estado") console.log(A.estadoTarea(args[1], args[2] as never, opcion(args, "evidencia")));
      else { console.error("subcomando desconocido: " + sub); process.exit(2); }
      break;
    }
    case "hallazgo": {
      const [tareaId, ...resto] = args;
      const texto = posicional(args).slice(1).join(" ");
      const h = A.nuevoHallazgo(tareaId, texto, (opcion(args, "confianza") as never) ?? "media", opcion(args, "rol") ?? "?", opcion(args, "fuente") ? [requerido(args, "fuente")] : []);
      console.log("hallazgo", h.id, "registrado");
      break;
    }
    case "fuente": {
      const url = args[0];
      try {
        const r = await obtenerFuenteReal(url);
        const f = A.nuevaFuente(fuenteDesdeResultado(r, opcion(args, "nota") ?? ""));
        console.log("fuente registrada", f.id, `HTTP ${f.estado} · ${f.bytes} bytes · extracto ${f.extracto.length} chars`);
      } catch (e) {
        console.error("NO se registró nada (fetch real falló):", (e as Error).message);
        process.exit(1);
      }
      break;
    }
    case "pregunta": {
      const p = A.nuevaPregunta(posicional(args).slice(1).join(" ") || args[1]);
      console.log("pregunta", p.id); break;
    }
    case "respuesta": {
      const [preguntaId, rol, ...texto] = args;
      console.log("respuesta", A.nuevaRespuesta(preguntaId, rol, texto.join(" ")).id); break;
    }
    case "comparar": {
      const e = A.cargar(); const p = e.preguntas.find((x) => x.id === args[0]);
      if (!p) { console.error("pregunta no encontrada"); process.exit(2); }
      const rs = e.respuestas.filter((r) => p.respuestas.includes(r.id));
      for (const m of matrizSolapamiento(rs.map((r) => ({ rol: r.rol, texto: r.texto }))))
        console.log(`${m.par[0]} ↔ ${m.par[1]}: ${m.jaccard}`);
      break;
    }
    case "informe": {
      const md = generarInforme(A.cargar(), "Informe multiagente — VANGUARD");
      const out = args[0];
      if (out) { writeFileSync(out, md, "utf8"); console.log("informe escrito en", basename(out)); }
      else console.log(md);
      break;
    }
    default: console.error("comando desconocido: " + cmd); console.log(ayuda); process.exit(2);
  }
})().catch((e) => { console.error("error:", (e as Error).message); process.exit(1); });
