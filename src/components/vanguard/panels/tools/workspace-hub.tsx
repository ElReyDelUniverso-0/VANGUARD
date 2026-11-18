"use client";

// ============================================================
// VANGUARD TOOLS — MÓDULO DE WORKSPACE PERSONAL Y NOTAS
// v406.7 Favoritos, Historial, Bloc de Inteligencia y Enlaces Compartibles
// ============================================================

import React, { useState, useEffect } from "react";
import {
  FolderKanban,
  Star,
  Clock,
  FileEdit,
  Trash2,
  Plus,
  Share2,
  Download,
  Copy,
  Check,
  Bookmark,
  ShieldAlert,
  Tag,
  CheckCircle2,
} from "lucide-react";
import {
  loadWorkspaceState,
  saveWorkspaceState,
  saveIntelligenceNote,
  deleteIntelligenceNote,
  encodeShareableState,
} from "@/lib/tools/workspace-store";
import { VanguardWorkspaceState, NotaInteligencia } from "@/lib/tools/types";
import { PAISES_DOSSIERS } from "@/lib/paises-data";

export function WorkspaceHub({
  onSelectTool,
}: {
  onSelectTool?: (toolId: string) => void;
}) {
  const [workspace, setWorkspace] = useState<VanguardWorkspaceState | null>(null);

  // Formulario de Nueva Nota
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteCountry, setNoteCountry] = useState("US");
  const [noteClasif, setNoteClasif] = useState<NotaInteligencia["clasificacion"]>("CONFIDENCIAL (VANGUARD)");
  const [noteTags, setNoteTags] = useState("geopolitica, defensa");

  const [shareLinkCopied, setShareLinkCopied] = useState(false);
  const [exportFeedback, setExportFeedback] = useState(false);

  useEffect(() => {
    setWorkspace(loadWorkspaceState());
  }, []);

  const handleSaveNote = () => {
    if (!noteTitle.trim()) return;
    const tagsArray = noteTags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
    saveIntelligenceNote({
      titulo: noteTitle,
      contenido: noteContent,
      paisRelacionado: noteCountry,
      clasificacion: noteClasif,
      tags: tagsArray,
    });
    setWorkspace(loadWorkspaceState());
    setIsCreatingNote(false);
    setNoteTitle("");
    setNoteContent("");
  };

  const handleDeleteNote = (id: string) => {
    deleteIntelligenceNote(id);
    setWorkspace(loadWorkspaceState());
  };

  const handleGenerateShareLink = () => {
    if (typeof window === "undefined") return;
    const shareCode = encodeShareableState("mi-workspace", {
      notasCount: workspace?.notas.length || 0,
      timestamp: Date.now(),
    });
    const url = `${window.location.origin}${window.location.pathname}#tools-share=${shareCode}`;
    navigator.clipboard.writeText(url);
    setShareLinkCopied(true);
    setTimeout(() => setShareLinkCopied(false), 2500);
  };

  const handleExportJSON = () => {
    if (!workspace) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(workspace, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `vanguard_workspace_backup_${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setExportFeedback(true);
    setTimeout(() => setExportFeedback(false), 2500);
  };

  if (!workspace) {
    return <div className="p-8 text-center text-xs text-slate-500 font-mono">Cargando Workspace...</div>;
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <section className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 md:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs tracking-wider uppercase mb-1">
              <FolderKanban className="w-4 h-4" />
              <span>Espacio de Trabajo del Analista</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Mi Workspace & Notas de Inteligencia
            </h2>
            <p className="text-sm text-slate-400">
              Gestor personal con persistencia local: guarda favoritos, expedientes, notas clasificadas y exporta tus investigaciones.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleGenerateShareLink}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs flex items-center gap-1.5 font-mono transition-colors"
            >
              {shareLinkCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-cyan-400" />}
              <span>{shareLinkCopied ? "Enlace Copiado" : "Compartir Enlace"}</span>
            </button>
            <button
              onClick={handleExportJSON}
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded text-xs flex items-center gap-1.5 font-mono transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{exportFeedback ? "Descargado" : "Exportar JSON"}</span>
            </button>
          </div>
        </div>

        {/* Cuadrícula de 3 Columnas: Favoritos, Historial, Escenarios Guardados */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* 1. Favoritos */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-900">
              <span className="text-xs font-bold text-white flex items-center gap-1.5 font-mono uppercase">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>Favoritos Fijados</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {workspace.favoritos.length} elementos
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {workspace.favoritos.map((fav) => (
                <span
                  key={fav}
                  className="px-2 py-1 rounded bg-slate-900 text-slate-200 border border-slate-800 text-xs font-mono"
                >
                  {fav}
                </span>
              ))}
            </div>
          </div>

          {/* 2. Historial de Consultas */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-900">
              <span className="text-xs font-bold text-white flex items-center gap-1.5 font-mono uppercase">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Historial Reciente</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Últimas sesiones</span>
            </div>
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {workspace.historialConsultas.map((h, i) => (
                <div key={i} className="text-xs text-slate-300 font-mono flex items-center justify-between">
                  <span className="truncate max-w-[180px]">{h.texto}</span>
                  <span className="text-[9px] text-slate-500 uppercase">{h.categoria}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Escenarios Guardados */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-900">
              <span className="text-xs font-bold text-white flex items-center gap-1.5 font-mono uppercase">
                <Bookmark className="w-3.5 h-3.5 text-violet-400" />
                <span>Escenarios Simulados</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {workspace.escenariosGuardados.length} guardados
              </span>
            </div>
            <div className="space-y-2 max-h-36 overflow-y-auto">
              {workspace.escenariosGuardados.map((esc) => (
                <div key={esc.id} className="p-2 bg-slate-900 rounded border border-slate-850 text-xs">
                  <span className="font-bold text-white block mb-0.5 truncate">{esc.nombre}</span>
                  <span className="text-[10px] text-red-400 font-mono">
                    Tensión: {esc.impacto.indiceTensionGlobal}/100 · Inflación +{esc.impacto.inflacionAdicionalGlobalPct}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bloc de Notas de Inteligencia */}
        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono">
                <FileEdit className="w-4 h-4 text-cyan-400" />
                <span>Bloc de Notas de Inteligencia & Hipótesis</span>
              </h3>
              <p className="text-xs text-slate-400">
                Registra observaciones, cables desclasificados y líneas de investigación personalizadas.
              </p>
            </div>
            <button
              onClick={() => setIsCreatingNote(!isCreatingNote)}
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded text-xs flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nueva Nota</span>
            </button>
          </div>

          {/* Formulario Desplegable para Crear Nota */}
          {isCreatingNote && (
            <div className="p-4 bg-slate-900 rounded-lg border border-cyan-500/40 mb-6 space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-mono uppercase">Título de la Nota:</label>
                <input
                  type="text"
                  placeholder="ej. Fricción en el Mar de Filipinas y cables submarinos"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-750 text-white rounded p-2"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-mono uppercase">Contenido del Análisis:</label>
                <textarea
                  rows={3}
                  placeholder="Redacta la hipótesis o evidencia táctica observada..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-750 text-white rounded p-2"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-mono uppercase">País Vinculado:</label>
                  <select
                    value={noteCountry}
                    onChange={(e) => setNoteCountry(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-750 text-white rounded p-2"
                  >
                    {PAISES_DOSSIERS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-mono uppercase">Clasificación:</label>
                  <select
                    value={noteClasif}
                    onChange={(e) => setNoteClasif(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-750 text-white rounded p-2"
                  >
                    <option value="ABIERTO (OSINT)">ABIERTO (OSINT)</option>
                    <option value="CONFIDENCIAL (VANGUARD)">CONFIDENCIAL (VANGUARD)</option>
                    <option value="ESTRÉGICO RESERVADO">ESTRÉGICO RESERVADO</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-mono uppercase">Etiquetas (separadas por coma):</label>
                  <input
                    type="text"
                    value={noteTags}
                    onChange={(e) => setNoteTags(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-750 text-white rounded p-2"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => setIsCreatingNote(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveNote}
                  className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded"
                >
                  Guardar Nota
                </button>
              </div>
            </div>
          )}

          {/* Lista de Notas Guardadas */}
          <div className="space-y-3">
            {workspace.notas.map((n) => (
              <div
                key={n.id}
                className="p-4 bg-slate-900/80 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{n.titulo}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-cyan-400 border border-cyan-500/30">
                      {n.clasificacion}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-[10px] font-mono text-slate-500">
                      {new Date(n.fechaModificacion).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => handleDeleteNote(n.id)}
                      className="text-slate-500 hover:text-red-400 transition-colors"
                      title="Eliminar nota"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-3">{n.contenido}</p>

                <div className="flex flex-wrap gap-1.5 items-center">
                  <Tag className="w-3 h-3 text-slate-500" />
                  {n.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] font-mono px-2 py-0.5 bg-slate-950 text-slate-400 rounded"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
