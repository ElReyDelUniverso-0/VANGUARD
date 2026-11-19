"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  History,
  Download,
  Upload,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Flame,
  FileText,
  AlertCircle,
  Save,
} from "lucide-react";
import {
  obtenerEstadoEstudiante,
  guardarEstadoEstudiante,
  exportarProgresoJson,
  importarProgresoJson,
  reiniciarTodoElProgreso,
} from "@/lib/academia/progreso";
import type { EstadoEstudianteLocal } from "@/lib/academia/tipos";

export function HistorialProgreso() {
  const [estado, setEstado] = useState<EstadoEstudianteLocal | null>(null);
  const [nombre, setNombre] = useState("");
  const [mensaje, setMensaje] = useState<{ tipo: "exito" | "error"; texto: string } | null>(null);
  const [jsonPegado, setJsonPegado] = useState("");
  const [mostrarModalImportar, setMostrarModalImportar] = useState(false);

  useEffect(() => {
    const est = obtenerEstadoEstudiante();
    setEstado(est);
    setNombre(est.nombreEstudiante || "");
  }, []);

  const handleGuardarNombre = (e: React.FormEvent) => {
    e.preventDefault();
    if (!estado) return;
    const actualizado = { ...estado, nombreEstudiante: nombre.trim() || "Estudiante de Vanguard" };
    guardarEstadoEstudiante(actualizado);
    setEstado(actualizado);
    setMensaje({ tipo: "exito", texto: "Nombre actualizado correctamente en tu navegador." });
    setTimeout(() => setMensaje(null), 3000);
  };

  const handleDescargarJson = () => {
    const dataStr = exportarProgresoJson();
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `vanguard-academia-progreso-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setMensaje({ tipo: "exito", texto: "Archivo JSON de progreso descargado con éxito." });
    setTimeout(() => setMensaje(null), 3000);
  };

  const handleImportarTexto = () => {
    if (!jsonPegado.trim()) return;
    const ok = importarProgresoJson(jsonPegado);
    if (ok) {
      setEstado(obtenerEstadoEstudiante());
      setMensaje({ tipo: "exito", texto: "Progreso importado con éxito desde el archivo JSON." });
      setMostrarModalImportar(false);
      setJsonPegado("");
    } else {
      setMensaje({ tipo: "error", texto: "El JSON suministrado tiene un formato inválido." });
    }
    setTimeout(() => setMensaje(null), 4000);
  };

  const handleReiniciar = () => {
    if (confirm("¿Estás seguro de que deseas borrar todo tu historial y progreso local en Vanguard Academy? Esta acción no se puede deshacer.")) {
      reiniciarTodoElProgreso();
      setEstado(obtenerEstadoEstudiante());
      setMensaje({ tipo: "exito", texto: "Progreso local reiniciado correctamente." });
      setTimeout(() => setMensaje(null), 3000);
    }
  };

  if (!estado) return null;

  return (
    <div className="space-y-8">
      {/* ── ENCABEZADO Y PRIVACIDAD ── */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2.5 py-0.5 rounded-full">
                Privacidad Absoluta del Estudiante
              </span>
              <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero Telemetría</span>
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Historial de Aprendizaje y Gestión de Datos
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Todos tus datos viven exclusivamente en este navegador. Eres dueño absoluto de tu aprendizaje: puedes exportar tu archivo JSON en cualquier momento o transferirlo a otro equipo.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleDescargarJson}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold transition-all border border-slate-700"
            >
              <Download className="w-4 h-4" />
              <span>Exportar JSON</span>
            </button>
            <button
              type="button"
              onClick={() => setMostrarModalImportar(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all border border-slate-700"
            >
              <Upload className="w-4 h-4" />
              <span>Importar JSON</span>
            </button>
            <button
              type="button"
              onClick={handleReiniciar}
              className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-800/60 transition-all"
              title="Borrar todos los datos locales"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mensajes de notificación */}
        {mensaje && (
          <div
            className={`p-3.5 rounded-2xl text-xs font-medium flex items-center gap-2 ${
              mensaje.tipo === "exito"
                ? "bg-emerald-950/40 border border-emerald-500/40 text-emerald-200"
                : "bg-rose-950/40 border border-rose-500/40 text-rose-200"
            }`}
          >
            {mensaje.tipo === "exito" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{mensaje.texto}</span>
          </div>
        )}

        {/* Editor de nombre del estudiante */}
        <form onSubmit={handleGuardarNombre} className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-slate-800">
          <label className="text-xs font-mono text-slate-300 shrink-0">
            Nombre para certificados:
          </label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Tu nombre completo"
            className="flex-1 px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-amber-500 font-medium"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 shrink-0"
          >
            <Save className="w-3.5 h-3.5 text-amber-400" />
            <span>Actualizar</span>
          </button>
        </form>
      </div>

      {/* ── HISTORIAL DE ACTIVIDAD RECIENTE ── */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" />
            <span>Registro de Actividad Cronológica</span>
          </h3>
          <span className="text-xs font-mono text-slate-400">
            {estado.historialActividad?.length || 0} eventos registrados
          </span>
        </div>

        {(!estado.historialActividad || estado.historialActividad.length === 0) ? (
          <div className="text-center py-10 text-slate-500 text-xs font-mono">
            Aún no has iniciado lecciones. ¡Explora el catálogo o crea una ruta de aprendizaje para comenzar!
          </div>
        ) : (
          <div className="space-y-3">
            {estado.historialActividad.map((item) => (
              <div
                key={item.id}
                className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 truncate">
                  <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-xs font-mono text-amber-400 shrink-0">
                    {item.actividadTipo === "cuestionario" ? "Quiz" : "Lec"}
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-bold text-white truncate">
                      {item.cursoSlug} / {item.leccionSlug}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {new Date(item.fechaUtc).toLocaleString()} · {item.tiempoMinutos} minutos
                    </div>
                  </div>
                </div>

                {item.resultadoPuntaje !== undefined && (
                  <span
                    className={`text-xs font-mono font-bold px-2.5 py-1 rounded-xl shrink-0 ${
                      item.resultadoPuntaje >= 70
                        ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                        : "bg-rose-950 text-rose-300 border border-rose-800"
                    }`}
                  >
                    {item.resultadoPuntaje}%
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── MODAL / CAJA PARA IMPORTAR JSON ── */}
      {mostrarModalImportar && (
        <div className="bg-slate-950 border border-slate-700 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white">Importar Archivo JSON de Progreso</h4>
            <button
              type="button"
              onClick={() => setMostrarModalImportar(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cerrar
            </button>
          </div>
          <p className="text-xs text-slate-400">
            Pega aquí el contenido de tu archivo de respaldo exportado previamente:
          </p>
          <textarea
            value={jsonPegado}
            onChange={(e) => setJsonPegado(e.target.value)}
            rows={5}
            placeholder='{"nombreEstudiante": "...", "leccionesCompletadas": {...}}'
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setMostrarModalImportar(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleImportarTexto}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold"
            >
              Procesar e Importar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
