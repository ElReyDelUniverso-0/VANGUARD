"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Award,
  ShieldCheck,
  Printer,
  Sparkles,
  CheckCircle2,
  Calendar,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { CURSOS_ACADEMIA } from "@/lib/academia/datos-cursos";
import {
  obtenerEstadoEstudiante,
  emitirCertificadoCurso,
} from "@/lib/academia/progreso";
import type { CertificadoFinalizacion, EstadoEstudianteLocal } from "@/lib/academia/tipos";

export function GeneradorCertificado() {
  const [estado, setEstado] = useState<EstadoEstudianteLocal | null>(null);
  const [cursoSeleccionadoSlug, setCursoSeleccionadoSlug] = useState<string>(CURSOS_ACADEMIA[0].slug);
  const [nombreEstudiante, setNombreEstudiante] = useState<string>("Estudiante de Vanguard");
  const [certificadoActivo, setCertificadoActivo] = useState<CertificadoFinalizacion | null>(null);

  useEffect(() => {
    const est = obtenerEstadoEstudiante();
    setEstado(est);
    setNombreEstudiante(est.nombreEstudiante || "Estudiante de Vanguard");
    if (est.certificadosEmitidos && est.certificadosEmitidos.length > 0) {
      setCertificadoActivo(est.certificadosEmitidos[0]);
    }
  }, []);

  const handleGenerarCertificado = (e: React.FormEvent) => {
    e.preventDefault();
    const cert = emitirCertificadoCurso(cursoSeleccionadoSlug, nombreEstudiante);
    if (cert) {
      setCertificadoActivo(cert);
      setEstado(obtenerEstadoEstudiante());
    }
  };

  const handleImprimir = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="space-y-8">
      {/* ── PANEL DE EMISIÓN DE RECONOCIMIENTOS ── */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2.5 py-0.5 rounded-full">
              Reconocimiento de Logro Académico
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Código Verificable Interno
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Certificados Internos de Finalización
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
            Genera un certificado digital de acreditación formativa con código único de verificación hash al culminar los temarios de Vanguard Academy.
          </p>
        </div>

        {/* Aviso de descargo legal de transparencia */}
        <div className="bg-amber-950/30 border border-amber-500/40 p-4 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs text-amber-200/90 leading-relaxed">
            <strong className="text-amber-300 font-mono uppercase block">
              Aviso de Transparencia Académica:
            </strong>
            Los certificados emitidos por Vanguard Academy son reconocimientos de mérito formativo interno dentro de la plataforma experimental Vanguard. No representan títulos universitarios oficiales, diplomas acreditados por ministerios educativos ni habilitaciones profesionales regladas.
          </div>
        </div>

        {/* Formulario de emisión */}
        <form onSubmit={handleGenerarCertificado} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-2">
              Nombre del Titular
            </label>
            <input
              type="text"
              value={nombreEstudiante}
              onChange={(e) => setNombreEstudiante(e.target.value)}
              placeholder="Tu nombre completo"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-2">
              Curso a Certificar
            </label>
            <select
              value={cursoSeleccionadoSlug}
              onChange={(e) => setCursoSeleccionadoSlug(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
            >
              {CURSOS_ACADEMIA.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.titulo}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 text-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>Emitir Reconocimiento</span>
            </button>
          </div>
        </form>
      </div>

      {/* ── DIPLOMA / CERTIFICADO IMPRIMIBLE ── */}
      {certificadoActivo && (
        <div className="space-y-4">
          <div className="flex items-center justify-between print:hidden">
            <span className="text-xs font-mono text-slate-400">
              Vista previa del documento oficial interno:
            </span>
            <button
              type="button"
              onClick={handleImprimir}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-all border border-slate-700"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Imprimir / Guardar en PDF</span>
            </button>
          </div>

          {/* DIPLOMA FORMATO PREMIUM */}
          <div className="bg-slate-950 border-4 border-amber-500/40 rounded-3xl p-8 sm:p-14 shadow-2xl relative overflow-hidden print:p-8 print:border-amber-600 print:text-black">
            {/* Filigranas decorativas */}
            <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-amber-500/60 pointer-events-none" />
            <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-amber-500/60 pointer-events-none" />
            <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-amber-500/60 pointer-events-none" />
            <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-amber-500/60 pointer-events-none" />

            <div className="text-center space-y-6 max-w-3xl mx-auto">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono uppercase tracking-widest font-bold">
                  Vanguard Academy · Cátedra Interdisciplinar
                </div>
                <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-serif uppercase">
                  Certificado de Finalización
                </h1>
                <p className="text-xs sm:text-sm font-mono text-amber-400/90 tracking-widest uppercase">
                  Reconocimiento al Mérito y Dominio Formativo
                </p>
              </div>

              <div className="py-4">
                <p className="text-xs font-mono uppercase text-slate-400 mb-2">
                  Por cuanto se certifica que
                </p>
                <div className="text-2xl sm:text-4xl font-extrabold text-amber-300 font-serif border-b border-amber-500/30 pb-3 max-w-md mx-auto">
                  {certificadoActivo.nombreEstudiante}
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
                Ha completado satisfactoriamente todas las lecciones temáticas, desafíos prácticos y evaluaciones formativas del programa curricular:
              </p>

              <div className="bg-slate-900/80 border border-amber-500/30 p-5 rounded-2xl max-w-xl mx-auto">
                <div className="text-lg sm:text-xl font-bold text-white mb-1">
                  {certificadoActivo.cursoTitulo}
                </div>
                <div className="text-xs font-mono text-amber-400">
                  Disciplina: {certificadoActivo.categoria.toUpperCase()} · {certificadoActivo.horasAcreditadas} Horas Académicas Estimadas
                </div>
              </div>

              {/* Competencias acreditadas */}
              <div className="text-left max-w-xl mx-auto space-y-2">
                <span className="text-[11px] font-mono font-bold uppercase text-slate-400 block text-center">
                  Competencias Demostradas:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                  {certificadoActivo.competenciasDemostradas.map((comp, idx) => (
                    <div key={idx} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{comp}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Firmas y Sellos */}
              <div className="pt-8 grid grid-cols-2 gap-8 border-t border-slate-800 text-xs font-mono text-slate-400">
                <div className="space-y-1">
                  <div className="font-serif italic text-base text-amber-300">
                    Vanguard Academic Board
                  </div>
                  <div className="text-[10px]">Cátedra Vanguard Academy</div>
                  <div className="text-[10px] text-slate-500">
                    Fecha: {new Date(certificadoActivo.fechaEmisionIso).toLocaleDateString()}
                  </div>
                </div>

                <div className="space-y-1 text-right">
                  <div className="text-[10px] uppercase font-bold text-slate-400">
                    Hash de Verificación
                  </div>
                  <div className="text-xs text-amber-400 font-mono font-bold tracking-wider">
                    {certificadoActivo.codigoVerificacionHash}
                  </div>
                  <div className="text-[10px] text-emerald-400 flex items-center justify-end gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Integridad Criptográfica Verificada</span>
                  </div>
                </div>
              </div>

              {/* Aviso legal explícito en el propio certificado */}
              <div className="text-[10px] text-slate-500 leading-tight pt-4 border-t border-slate-900 text-center font-mono">
                {certificadoActivo.avisoLegalDescargo}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
