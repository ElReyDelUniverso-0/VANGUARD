/** ESPACIO MULTIAGENTE · Almacén JSON local (un archivo por espacio de trabajo). */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { dirname } from "path";
import { randomUUID } from "crypto";
import type { EstadoEspacio, Tarea, Hallazgo, Fuente, Pregunta, Respuesta, EstadoTarea, Confianza } from "./tipos.js";

export function estadoVacio(): EstadoEspacio {
  return { version: 1, tareas: [], hallazgos: [], fuentes: [], preguntas: [], respuestas: [] };
}

export class Almacen {
  constructor(private ruta: string) {}
  cargar(): EstadoEspacio {
    if (!existsSync(this.ruta)) return estadoVacio();
    try {
      const e = JSON.parse(readFileSync(this.ruta, "utf8")) as EstadoEspacio;
      return { ...estadoVacio(), ...e };
    } catch {
      throw new Error("Almacén corrupto: " + this.ruta);
    }
  }
  guardar(e: EstadoEspacio): void {
    mkdirSync(dirname(this.ruta), { recursive: true });
    writeFileSync(this.ruta, JSON.stringify(e, null, 2) + "\n", "utf8");
  }
  // ---- tareas
  nuevaTarea(titulo: string, rol: string, detalle = ""): Tarea {
    const e = this.cargar();
    const t: Tarea = { id: randomUUID().slice(0, 8), titulo, rol, estado: "pendiente", creadaEn: new Date().toISOString(), actualizadaEn: new Date().toISOString(), detalle, evidencias: [] };
    e.tareas.push(t); this.guardar(e); return t;
  }
  asignarTarea(id: string, rol: string): Tarea {
    const e = this.cargar(); const t = e.tareas.find((x) => x.id === id);
    if (!t) throw new Error("Tarea no encontrada: " + id);
    t.rol = rol; t.actualizadaEn = new Date().toISOString(); this.guardar(e); return t;
  }
  estadoTarea(id: string, estado: EstadoTarea, evidencia?: string): Tarea {
    const e = this.cargar(); const t = e.tareas.find((x) => x.id === id);
    if (!t) throw new Error("Tarea no encontrada: " + id);
    t.estado = estado; t.actualizadaEn = new Date().toISOString();
    if (evidencia) t.evidencias.push(evidencia);
    this.guardar(e); return t;
  }
  // ---- hallazgos y fuentes
  nuevoHallazgo(tareaId: string, texto: string, confianza: Confianza, rol: string, fuenteIds: string[] = []): Hallazgo {
    const e = this.cargar();
    if (!e.tareas.find((t) => t.id === tareaId)) throw new Error("Tarea no encontrada: " + tareaId);
    const h: Hallazgo = { id: randomUUID().slice(0, 8), tareaId, rol, texto, confianza, fuenteIds, creadoEn: new Date().toISOString() };
    e.hallazgos.push(h); this.guardar(e); return h;
  }
  nuevaFuente(f: Fuente): Fuente { const e = this.cargar(); e.fuentes.push(f); this.guardar(e); return f; }
  // ---- preguntas compare (respuestas de especialistas)
  nuevaPregunta(titulo: string): Pregunta {
    const e = this.cargar();
    const p: Pregunta = { id: randomUUID().slice(0, 8), titulo, creadaEn: new Date().toISOString(), respuestas: [] };
    e.preguntas.push(p); this.guardar(e); return p;
  }
  nuevaRespuesta(preguntaId: string, rol: string, texto: string): Respuesta {
    const e = this.cargar(); const p = e.preguntas.find((x) => x.id === preguntaId);
    if (!p) throw new Error("Pregunta no encontrada: " + preguntaId);
    const r: Respuesta = { id: randomUUID().slice(0, 8), preguntaId, rol, texto, creadoEn: new Date().toISOString() };
    e.respuestas.push(r); p.respuestas.push(r.id); this.guardar(e); return r;
  }
}
