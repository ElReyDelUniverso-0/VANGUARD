/** ESPACIO MULTIAGENTE · Informe Markdown desde el almacén — solo lo que está registrado. */
import type { EstadoEspacio } from "./tipos.js";
import { matrizSolapamiento } from "./comparar.js";

export function generarInforme(e: EstadoEspacio, titulo: string): string {
  const hoy = new Date().toISOString().slice(0, 10);
  const T = (id: string) => e.tareas.find((t) => t.id === id);
  const F = (id: string) => e.fuentes.find((f) => f.id === id);
  const porEstado = (s: string) => e.tareas.filter((t) => t.estado === s).length;

  let md = `# ${titulo}\n\n_Espacio multiagente VANGUARD · ${hoy}_\n\n`;
  md += `## Resumen\n\n`;
  md += `- Tareas: ${e.tareas.length} (hechas ${porEstado("hecha")} · en curso ${porEstado("en-curso")} · pendientes ${porEstado("pendiente")} · bloqueadas ${porEstado("bloqueada")})\n`;
  md += `- Hallazgos: ${e.hallazgos.length} · Fuentes verificadas: ${e.fuentes.length} · Preguntas comparadas: ${e.preguntas.length}\n\n`;

  md += `## Tareas por especialista\n\n`;
  const roles = [...new Set(e.tareas.map((t) => t.rol))].sort();
  for (const rol of roles) {
    md += `### ${rol}\n`;
    for (const t of e.tareas.filter((t) => t.rol === rol)) {
      md += `- [${t.estado}] ${t.titulo}${t.detalle ? ` — ${t.detalle}` : ""}\n`;
      for (const ev of t.evidencias) md += `  - evidencia: ${ev}\n`;
    }
    md += `\n`;
  }

  md += `## Hallazgos (con fuente)\n\n`;
  for (const h of e.hallazgos) {
    const t = T(h.tareaId);
    md += `### ${h.creadoEn.slice(0, 10)} · ${h.rol} · confianza ${h.confianza}\n`;
    md += `${h.texto}\n`;
    md += `- tarea: ${t?.titulo ?? h.tareaId}\n`;
    if (h.fuenteIds.length) {
      for (const fid of h.fuenteIds) {
        const f = F(fid);
        if (f) md += `- fuente: ${f.url} (HTTP ${f.estado}, ${f.obtenidaEn})\n`;
      }
    } else {
      md += `- fuente: **sin fuente verificada — tratar como afirmación sin respaldo**\n`;
    }
    md += `\n`;
  }

  md += `## Comparación de respuestas\n\n`;
  for (const p of e.preguntas) {
    const rs = e.respuestas.filter((r) => p.respuestas.includes(r.id));
    md += `### ${p.titulo}\n\n`;
    for (const r of rs) md += `**${r.rol}:** ${r.texto}\n\n`;
    const matriz = matrizSolapamiento(rs.map((r) => ({ rol: r.rol, texto: r.texto })));
    if (matriz.length) {
      md += `Solapamiento léxico (Jaccard):\n`;
      for (const m of matriz) md += `- ${m.par[0]} ↔ ${m.par[1]}: ${m.jaccard}\n`;
      md += `\n`;
    }
  }

  md += `## Fuentes verificadas (fetch real ejecutado)\n\n`;
  for (const f of e.fuentes) {
    md += `- **HTTP ${f.estado}** ${f.url}\n  - obtenida: ${f.obtenidaEn} · ${f.bytes} bytes\n  - extracto: ${f.extracto.slice(0, 160).replace(/\n/g, " ")}…\n`;
  }
  md += `\n_Ningún dato de este informe fue consultado a modelos ni inventado: cada fuente listada fue obtenida por HTTP desde el espacio de trabajo; las afirmaciones sin fuente van marcadas._\n`;
  return md;
}
