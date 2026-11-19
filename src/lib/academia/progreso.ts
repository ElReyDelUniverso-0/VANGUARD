// ═══════════════════════════════════════════════════════════════════
// VANGUARD ACADEMY · MOTOR DE PROGRESO Y PRIVACIDAD DEL ESTUDIANTE
//
// Almacenamiento local seguro en el navegador (localStorage).
// Cero telemetría externa, exportación/importación en JSON,
// generación de certificados internos y cálculo de métricas.
// ═══════════════════════════════════════════════════════════════════

import type {
  EstadoEstudianteLocal,
  CertificadoFinalizacion,
  RutaAprendizaje,
  PasoRutaAprendizaje,
} from "./tipos";
import { CURSOS_ACADEMIA } from "./datos-cursos";

export const CLAVE_PROGRESO_ACADEMIA = "vanguard:academia:progreso:v2";

export const ESTADO_INICIAL_ESTUDIANTE: EstadoEstudianteLocal = {
  nombreEstudiante: "Estudiante de Vanguard",
  leccionesCompletadas: {},
  puntuacionesCuestionarios: {},
  tarjetasEstado: {},
  tarjetasDestacadas: [],
  rutasPersonalizadas: [],
  certificadosEmitidos: [],
  minutosEstudioAcumulados: 0,
  diasRachaEstudio: 1,
  historialActividad: [],
};

export function esNavegador(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function obtenerEstadoEstudiante(): EstadoEstudianteLocal {
  if (!esNavegador()) return ESTADO_INICIAL_ESTUDIANTE;

  try {
    const raw = localStorage.getItem(CLAVE_PROGRESO_ACADEMIA);
    if (!raw) return ESTADO_INICIAL_ESTUDIANTE;

    const parseado = JSON.parse(raw);
    return {
      ...ESTADO_INICIAL_ESTUDIANTE,
      ...parseado,
      leccionesCompletadas: parseado.leccionesCompletadas || {},
      puntuacionesCuestionarios: parseado.puntuacionesCuestionarios || {},
      tarjetasEstado: parseado.tarjetasEstado || {},
      tarjetasDestacadas: parseado.tarjetasDestacadas || [],
      rutasPersonalizadas: parseado.rutasPersonalizadas || [],
      certificadosEmitidos: parseado.certificadosEmitidos || [],
      historialActividad: parseado.historialActividad || [],
    };
  } catch (err) {
    console.warn("[Vanguard Academy] Error leyendo progreso local:", err);
    return ESTADO_INICIAL_ESTUDIANTE;
  }
}

export function guardarEstadoEstudiante(estado: EstadoEstudianteLocal): void {
  if (!esNavegador()) return;
  try {
    localStorage.setItem(CLAVE_PROGRESO_ACADEMIA, JSON.stringify(estado));
    // Disparar evento personalizado para actualizar componentes en tiempo real
    window.dispatchEvent(new CustomEvent("vanguard:academia:progreso_actualizado", { detail: estado }));
  } catch (err) {
    console.error("[Vanguard Academy] No se pudo escribir en almacenamiento local:", err);
  }
}

export function marcarLeccionCompletada(
  cursoSlug: string,
  leccionId: string,
  tiempoMinutos: number = 15
): EstadoEstudianteLocal {
  const actual = obtenerEstadoEstudiante();
  const clave = `${cursoSlug}:${leccionId}`;

  const nuevaLista = {
    ...actual.leccionesCompletadas,
    [clave]: true,
  };

  const nuevoHistorial = [
    {
      id: `act-${Date.now()}`,
      fechaUtc: new Date().toISOString(),
      cursoSlug,
      leccionSlug: leccionId,
      actividadTipo: "lectura" as const,
      tiempoMinutos,
    },
    ...actual.historialActividad.slice(0, 99),
  ];

  const nuevoEstado: EstadoEstudianteLocal = {
    ...actual,
    leccionesCompletadas: nuevaLista,
    minutosEstudioAcumulados: (actual.minutosEstudioAcumulados || 0) + tiempoMinutos,
    historialActividad: nuevoHistorial,
    ultimaFechaEstudio: new Date().toISOString().split("T")[0],
  };

  guardarEstadoEstudiante(nuevoEstado);
  return nuevoEstado;
}

export function guardarResultadoCuestionario(
  cursoSlug: string,
  leccionId: string,
  puntaje: number,
  totalPreguntas: number
): EstadoEstudianteLocal {
  const actual = obtenerEstadoEstudiante();
  const clave = `${cursoSlug}:${leccionId}`;
  const porcentaje = Math.round((puntaje / (totalPreguntas || 1)) * 100);

  const nuevoEstado: EstadoEstudianteLocal = {
    ...actual,
    puntuacionesCuestionarios: {
      ...actual.puntuacionesCuestionarios,
      [clave]: {
        puntaje,
        totalPreguntas,
        porcentaje,
        fechaUtc: new Date().toISOString(),
      },
    },
    historialActividad: [
      {
        id: `quiz-${Date.now()}`,
        fechaUtc: new Date().toISOString(),
        cursoSlug,
        leccionSlug: leccionId,
        actividadTipo: "cuestionario" as const,
        resultadoPuntaje: porcentaje,
        tiempoMinutos: 10,
      },
      ...actual.historialActividad.slice(0, 99),
    ],
  };

  // Si aprobó con >= 70%, marcar automáticamente la lección como completada
  if (porcentaje >= 70) {
    nuevoEstado.leccionesCompletadas[clave] = true;
  }

  guardarEstadoEstudiante(nuevoEstado);
  return nuevoEstado;
}

export function actualizarEstadoTarjeta(
  tarjetaId: string,
  estado: "por_aprender" | "repasando" | "dominada"
): EstadoEstudianteLocal {
  const actual = obtenerEstadoEstudiante();
  const nuevoEstado: EstadoEstudianteLocal = {
    ...actual,
    tarjetasEstado: {
      ...actual.tarjetasEstado,
      [tarjetaId]: estado,
    },
  };
  guardarEstadoEstudiante(nuevoEstado);
  return nuevoEstado;
}

export function alternarTarjetaDestacada(tarjetaId: string): EstadoEstudianteLocal {
  const actual = obtenerEstadoEstudiante();
  const yaEsta = actual.tarjetasDestacadas.includes(tarjetaId);
  const nuevaLista = yaEsta
    ? actual.tarjetasDestacadas.filter((id) => id !== tarjetaId)
    : [...actual.tarjetasDestacadas, tarjetaId];

  const nuevoEstado: EstadoEstudianteLocal = {
    ...actual,
    tarjetasDestacadas: nuevaLista,
  };
  guardarEstadoEstudiante(nuevoEstado);
  return nuevoEstado;
}

/** Genera un hash pseudo-criptográfico simple y único para el certificado */
function generarHashCertificado(textoSemilla: string): string {
  let hash = 0;
  for (let i = 0; i < textoSemilla.length; i++) {
    const char = textoSemilla.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, "0");
  const hex2 = Math.abs((hash ^ 0x5f3759df) >>> 0).toString(16).padStart(8, "0");
  return `VG-ACAD-${hex.toUpperCase()}-${hex2.toUpperCase()}`;
}

export function emitirCertificadoCurso(
  cursoSlug: string,
  nombreEstudiante: string
): CertificadoFinalizacion | null {
  const curso = CURSOS_ACADEMIA.find((c) => c.slug === cursoSlug);
  if (!curso) return null;

  const actual = obtenerEstadoEstudiante();
  const fechaIso = new Date().toISOString();
  const semilla = `${cursoSlug}:${nombreEstudiante}:${fechaIso}`;
  const codigoHash = generarHashCertificado(semilla);

  const certificado: CertificadoFinalizacion = {
    id: `cert-${Date.now()}`,
    codigoVerificacionHash: codigoHash,
    nombreEstudiante: nombreEstudiante.trim() || "Estudiante de Vanguard",
    cursoId: curso.id,
    cursoTitulo: curso.titulo,
    categoria: curso.categoria,
    fechaEmisionIso: fechaIso,
    horasAcreditadas: curso.duracionHorasEstimadas,
    promedioEvaluacion: 95,
    competenciasDemostradas: curso.competenciasAdquiridas,
    avisoLegalDescargo:
      "RECONOCIMIENTO INTERNO VANGUARD: Este documento acredita la compleción de los módulos formativos en la plataforma interactiva de Vanguard Academy. No constituye un título universitario oficial, certificación técnica regulada ni habilitación profesional ante terceros.",
  };

  const nuevoEstado: EstadoEstudianteLocal = {
    ...actual,
    nombreEstudiante: nombreEstudiante.trim() || actual.nombreEstudiante,
    certificadosEmitidos: [
      certificado,
      ...actual.certificadosEmitidos.filter((c) => c.cursoId !== curso.id),
    ],
  };

  guardarEstadoEstudiante(nuevoEstado);
  return certificado;
}

/** Constructor dinámico de rutas personalizadas */
export function construirRutaPersonalizada(
  tituloRuta: string,
  objetivoUsuario: string,
  categoriasInteres: string[],
  nivelDeseado: "introductorio" | "intermedio" | "avanzado" = "intermedio",
  horasSemanales: number = 4
): RutaAprendizaje {
  const cursosCoincidentes = CURSOS_ACADEMIA.filter(
    (c) =>
      categoriasInteres.length === 0 ||
      categoriasInteres.includes(c.categoria) ||
      c.nivel === nivelDeseado
  );

  const seleccion = cursosCoincidentes.length > 0 ? cursosCoincidentes : CURSOS_ACADEMIA.slice(0, 3);

  const hitos: PasoRutaAprendizaje[] = [];
  let contadorPaso = 1;

  for (const curso of seleccion) {
    for (const cap of curso.capitulos) {
      for (const lec of cap.lecciones) {
        hitos.push({
          paso: contadorPaso++,
          tipo: "leccion",
          titulo: `${curso.titulo.split(":")[0]} — ${lec.titulo}`,
          descripcion: lec.resumenEjecutivo,
          cursoSlug: curso.slug,
          capituloId: cap.id,
          leccionId: lec.id,
          rutaEnlace: `/academia/cursos/${curso.slug}/${cap.id}/${lec.id}`,
          tiempoEstimadoMinutos: lec.duracionEstimadaMinutos,
        });
      }
    }

    // Agregar hito práctico si el curso tiene labs relacionados
    if (curso.nexosVanguardRelacionados.length > 0) {
      const nexo = curso.nexosVanguardRelacionados[0];
      hitos.push({
        paso: contadorPaso++,
        tipo: "practica_lab",
        titulo: `Práctica Numérica: ${nexo.nombre}`,
        descripcion: nexo.motivoPedagogico,
        cursoSlug: curso.slug,
        rutaEnlace: nexo.ruta,
        tiempoEstimadoMinutos: 20,
      });
    }
  }

  const horasTotales = Math.round(
    hitos.reduce((acc, h) => acc + h.tiempoEstimadoMinutos, 0) / 60
  );
  const semanasEstimadas = Math.max(1, Math.round(horasTotales / (horasSemanales || 4)));

  const rutaNueva: RutaAprendizaje = {
    id: `ruta-custom-${Date.now()}`,
    slug: `ruta-custom-${Date.now()}`,
    titulo: tituloRuta.trim() || "Ruta de Aprendizaje Personalizada",
    descripcion: objetivoUsuario.trim() || "Plan de estudio adaptado a tus metas en Vanguard Academy.",
    categoria: "multidisciplinar",
    publicoObjetivo: "Plan personalizado generado a medida por el estudiante.",
    duracionSemanasEstimadas: semanasEstimadas,
    horasTotalesEstimadas: horasTotales,
    esPersonalizada: true,
    hitosSecuenciales: hitos,
    competenciasFinales: [
      "Comprensión interdisciplinar de los sistemas seleccionados.",
      "Capacidad de resolución práctica en simuladores numéricos de Vanguard.",
    ],
  };

  const actual = obtenerEstadoEstudiante();
  const nuevoEstado: EstadoEstudianteLocal = {
    ...actual,
    rutasPersonalizadas: [rutaNueva, ...actual.rutasPersonalizadas],
    rutaActivaId: rutaNueva.id,
  };
  guardarEstadoEstudiante(nuevoEstado);

  return rutaNueva;
}

export function exportarProgresoJson(): string {
  const estado = obtenerEstadoEstudiante();
  return JSON.stringify(estado, null, 2);
}

export function importarProgresoJson(jsonString: string): boolean {
  try {
    const parseado = JSON.parse(jsonString);
    if (!parseado || typeof parseado !== "object") return false;
    guardarEstadoEstudiante({
      ...ESTADO_INICIAL_ESTUDIANTE,
      ...parseado,
    });
    return true;
  } catch (err) {
    console.error("[Vanguard Academy] Error importando progreso:", err);
    return false;
  }
}

export function reiniciarTodoElProgreso(): void {
  if (!esNavegador()) return;
  try {
    localStorage.removeItem(CLAVE_PROGRESO_ACADEMIA);
    window.dispatchEvent(
      new CustomEvent("vanguard:academia:progreso_actualizado", { detail: ESTADO_INICIAL_ESTUDIANTE })
    );
  } catch (err) {
    console.error("[Vanguard Academy] Error al reiniciar:", err);
  }
}
