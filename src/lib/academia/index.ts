// ═══════════════════════════════════════════════════════════════════
// VANGUARD ACADEMY · MOTOR DE CONSULTAS Y RECOMENDACIONES
//
// Acceso y filtrado de cursos, lecciones, rutas, tarjetas y glosario.
// ═══════════════════════════════════════════════════════════════════

import { CURSOS_ACADEMIA, CATEGORIAS_ACADEMIA } from "./datos-cursos";
import {
  RUTAS_PREDEFINIDAS,
  BARAJAS_TARJETAS,
  GLOSARIO_ACADEMIA,
  BANCO_EJERCICIOS,
} from "./datos-rutas-glosario";
import type {
  Curso,
  Leccion,
  Capitulo,
  RutaAprendizaje,
  BarajaTarjetas,
  TerminoGlosario,
  CategoriaEducativa,
  EstadoEstudianteLocal,
} from "./tipos";

export * from "./tipos";
export * from "./datos-cursos";
export * from "./datos-rutas-glosario";
export * from "./progreso";

export function obtenerCursoPorSlug(slug: string): Curso | undefined {
  return CURSOS_ACADEMIA.find((c) => c.slug === slug);
}

export function obtenerLeccion(
  cursoSlug: string,
  capituloId: string,
  leccionId: string
): { curso: Curso; capitulo: Capitulo; leccion: Leccion } | null {
  const curso = obtenerCursoPorSlug(cursoSlug);
  if (!curso) return null;

  const capitulo = curso.capitulos.find((cap) => cap.id === capituloId);
  if (!capitulo) return null;

  const leccion = capitulo.lecciones.find((lec) => lec.id === leccionId || lec.slug === leccionId);
  if (!leccion) return null;

  return { curso, capitulo, leccion };
}

export function filtrarCursos(
  categoria?: string,
  nivel?: string,
  busqueda?: string
): Curso[] {
  return CURSOS_ACADEMIA.filter((c) => {
    if (categoria && categoria !== "todas" && c.categoria !== categoria) {
      return false;
    }
    if (nivel && nivel !== "todos" && c.nivel !== nivel) {
      return false;
    }
    if (busqueda && busqueda.trim()) {
      const q = busqueda.toLowerCase().trim();
      return (
        c.titulo.toLowerCase().includes(q) ||
        c.subtitulo.toLowerCase().includes(q) ||
        c.descripcionGeneral.toLowerCase().includes(q) ||
        c.competenciasAdquiridas.some((comp) => comp.toLowerCase().includes(q))
      );
    }
    return true;
  });
}

export function obtenerRutaPorSlug(slug: string): RutaAprendizaje | undefined {
  return RUTAS_PREDEFINIDAS.find((r) => r.slug === slug);
}

export function obtenerBarajaPorSlug(slug: string): BarajaTarjetas | undefined {
  return BARAJAS_TARJETAS.find((b) => b.slug === slug);
}

export function buscarTerminosGlosario(
  busqueda?: string,
  categoria?: string
): TerminoGlosario[] {
  return GLOSARIO_ACADEMIA.filter((t) => {
    if (categoria && categoria !== "todas" && t.categoria !== categoria) {
      return false;
    }
    if (busqueda && busqueda.trim()) {
      const q = busqueda.toLowerCase().trim();
      return (
        t.termino.toLowerCase().includes(q) ||
        t.definicionBreve.toLowerCase().includes(q) ||
        t.explicacionAmpleada.toLowerCase().includes(q)
      );
    }
    return true;
  });
}

/** Motor de recomendaciones inteligentes para el estudiante */
export function obtenerRecomendacionesParaEstudiante(
  estado: EstadoEstudianteLocal
): { curso: Curso; motivo: string }[] {
  const completadas = Object.keys(estado.leccionesCompletadas || {});
  
  // Categorías de las lecciones completadas
  const categoriasVistas: Record<string, number> = {};
  for (const clave of completadas) {
    const [slug] = clave.split(":");
    const c = CURSOS_ACADEMIA.find((x) => x.slug === slug);
    if (c) {
      categoriasVistas[c.categoria] = (categoriasVistas[c.categoria] || 0) + 1;
    }
  }

  const categoriaFavorita = Object.entries(categoriasVistas).sort((a, b) => b[1] - a[1])[0]?.[0];

  const recomendaciones: { curso: Curso; motivo: string }[] = [];

  for (const curso of CURSOS_ACADEMIA) {
    // Si aún no ha completado el curso
    const todasLeccionesCurso = curso.capitulos.flatMap((cap) =>
      cap.lecciones.map((lec) => `${curso.slug}:${lec.id}`)
    );
    const completadasEnCurso = todasLeccionesCurso.filter((k) => estado.leccionesCompletadas[k]);

    if (completadasEnCurso.length < todasLeccionesCurso.length) {
      if (completadasEnCurso.length > 0) {
        recomendaciones.push({
          curso,
          motivo: `En progreso (${Math.round((completadasEnCurso.length / todasLeccionesCurso.length) * 100)}% completado). ¡Continúa donde lo dejaste!`,
        });
      } else if (categoriaFavorita && curso.categoria === categoriaFavorita) {
        recomendaciones.push({
          curso,
          motivo: `Relacionado con tus intereses en ${curso.categoria}.`,
        });
      } else if (curso.nivel === "introductorio") {
        recomendaciones.push({
          curso,
          motivo: "Excelente punto de partida para ampliar tus conocimientos.",
        });
      }
    }
  }

  return recomendaciones.slice(0, 3);
}
