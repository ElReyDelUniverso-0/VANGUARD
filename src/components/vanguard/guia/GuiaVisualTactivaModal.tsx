"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Compass,
  Database,
  Cpu,
  GraduationCap,
  Radio,
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
  ExternalLink,
  Shield,
  Layers,
} from "lucide-react";

interface PasoGuia {
  id: number;
  titulo: string;
  subtitulo: string;
  icono: string;
  color: string;
  badge: string;
  descripcion: string;
  elementosClave: { titulo: string; detalle: string }[];
  enlaceDirecto: string;
  textoEnlace: string;
  consejoTáctico: string;
}

const PASOS: PasoGuia[] = [
  {
    id: 1,
    titulo: "El Pulso de los Conflictos en Vivo",
    subtitulo: "Seguimiento satelital y cables de agencia sin sensacionalismo",
    icono: "📡",
    color: "from-red-500/20 via-orange-500/10 to-transparent border-red-500/40 text-red-400",
    badge: "FASE 01 · COBERTURA CINÉTICA",
    descripcion:
      "Vanguard monitorea frentes activos en todo el globo en tiempo real. Cada cable proviene de agencias verificadas (Reuters, AFP, AP, ISW) e incluye la hora exacta, coordenadas y teatro operacional.",
    elementosClave: [
      {
        titulo: "Punto Rojo en Vivo",
        detalle: "Indica cables con menos de 15 minutos de antigüedad ingresando al teletipo.",
      },
      {
        titulo: "Globo 3D & Zona Cero",
        detalle: "Explora las líneas de contacto, perímetros fortificados y teatros en volumen.",
      },
      {
        titulo: "Verdad Cruda",
        detalle: "Dossiers de bajas, abusos documentados y fuentes oficiales de derechos humanos.",
      },
    ],
    enlaceDirecto: "/en-vivo",
    textoEnlace: "Ver Cables en Vivo →",
    consejoTáctico: "Haz clic en cualquier cable para abrir su ficha completa con análisis geográfico y contexto histórico.",
  },
  {
    id: 2,
    titulo: "Centro de Información Perfecta",
    subtitulo: "Todos los datos, países, arsenales y dossiers en una sola pantalla",
    icono: "🌐",
    color: "from-sky-500/20 via-cyan-500/10 to-transparent border-sky-500/40 text-sky-400",
    badge: "FASE 02 · INTELIGENCIA UNIFICADA",
    descripcion:
      "Se acabaron los módulos dispersos. El nuevo Centro de Información fusiona 16 potencias con radar de 6 ejes, 21 sistemas de armas con planos técnicos, puntos de estrangulamiento naval y ciencia de frontera.",
    elementosClave: [
      {
        titulo: "Radar de 6 Ejes",
        detalle: "Mide poder militar, economía, demografía, energía, tecnología y diplomacia de cada nación.",
      },
      {
        titulo: "Arsenal Táctico",
        detalle: "Fichas técnicas de cazas furtivos, misiles hipersónicos y defensas antiaéreas.",
      },
      {
        titulo: "Comparador Bilateral",
        detalle: "Compara dos potencias o dos sistemas bélicos cara a cara con barras telemétricas.",
      },
    ],
    enlaceDirecto: "/informacion",
    textoEnlace: "Abrir Información Perfecta →",
    consejoTáctico: "Utiliza el buscador integrado para filtrar instantáneamente entre países, misiles o cuellos de botella marítimos.",
  },
  {
    id: 3,
    titulo: "Laboratorio de Motores Analíticos",
    subtitulo: "Simuladores matemáticos interactivos y 100 plataformas líderes",
    icono: "🔬",
    color: "from-purple-500/20 via-pink-500/10 to-transparent border-purple-500/40 text-purple-400",
    badge: "FASE 03 · CÁLCULO ESTRATÉGICO",
    descripcion:
      "Laboratorio cuantitativo donde tú ajustas las variables: simula bajas bélicas con las leyes de Lanchester, proyecta curvas de deuda Nelson-Siegel y calcula la fase DEFCON según la escala de 44 peldaños de Herman Kahn.",
    elementosClave: [
      {
        titulo: "Simulador de Lanchester",
        detalle: "Atrition diferencial lineal y cuadrática según concentración de fuego y letalidad.",
      },
      {
        titulo: "Escalada Kahn & DEFCON",
        detalle: "Calcula el umbral de uso nuclear y la probabilidad de conflicto de alta intensidad.",
      },
      {
        titulo: "Censo de 100 Plataformas",
        detalle: "Mapeo comparativo de Liveuamap, ACLED, Sentinel, SIPRI, Bloomberg y más.",
      },
    ],
    enlaceDirecto: "/motores",
    textoEnlace: "Entrar al Simulador →",
    consejoTáctico: "Desliza los controles de fuerza y letalidad para observar cómo cambia el desenlace de un enfrentamiento en segundos.",
  },
  {
    id: 4,
    titulo: "Vanguard Academy",
    subtitulo: "10 cursos interactivos con diplomas verificables SHA-256",
    icono: "🎓",
    color: "from-emerald-500/20 via-teal-500/10 to-transparent border-emerald-500/40 text-emerald-400",
    badge: "FASE 04 · FORMACIÓN ESPECIALIZADA",
    descripcion:
      "Aprende doctrina militar, análisis OSINT de fuentes abiertas, lectura cartográfica y economía bélica. Realiza cuestionarios dinámicos y emite certificados criptográficos respaldados por hash único.",
    elementosClave: [
      {
        titulo: "10 Cursos Nucleares",
        detalle: "Contenido estructurado por capítulos y lecciones interactivas.",
      },
      {
        titulo: "Cuestionarios Evaluativos",
        detalle: "Preguntas de opción múltiple para comprobar tu nivel de comprensión técnica.",
      },
      {
        titulo: "Certificados SHA-256",
        detalle: "Títulos oficiales con código hash inmutable para acreditar tu especialización.",
      },
    ],
    enlaceDirecto: "/academia",
    textoEnlace: "Explorar la Academia →",
    consejoTáctico: "Puedes completar los cuestionarios a tu propio ritmo; tu progreso se almacena de forma privada en tu navegador.",
  },
  {
    id: 5,
    titulo: "Cyber Radio & Centro de Mando",
    subtitulo: "Paisajes sonoros cinemáticos y operaciones tácticas",
    icono: "📻",
    color: "from-amber-500/20 via-yellow-500/10 to-transparent border-amber-500/40 text-amber-400",
    badge: "FASE 05 · EXPERIENCIA INMERSIVA",
    descripcion:
      "Olvídate de sirenas molestas o estática: el nuevo sintetizador analógico Web Audio genera pads atmosféricos envolventes en modo dórico, acompañado de estaciones de cyber radio tácticas 24/7.",
    elementosClave: [
      {
        titulo: "Cybersynth Polifónico",
        detalle: "Audio continuo generado por osciladores matemáticos cálidos sin ruido estresante.",
      },
      {
        titulo: "Dial de Emisoras Tácticas",
        detalle: "DEF CON Cyber Radio, Space Station Soma y Groove Salad para concentración total.",
      },
      {
        titulo: "El Cuartel y Operaciones",
        detalle: "Misiones tácticas, insignias de rango y juegos de estrategia multijugador.",
      },
    ],
    enlaceDirecto: "/cuartel",
    textoEnlace: "Ir al Cuartel General →",
    consejoTáctico: "Haz clic en el botón de la antena en la cabecera para encender o pausar el Cybersynth en cualquier momento.",
  },
];

export function GuiaVisualTactivaModal({
  abierto,
  alCerrar,
}: {
  abierto: boolean;
  alCerrar: () => void;
}) {
  const [pasoActual, setPasoActual] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!abierto) return;
      if (e.key === "Escape") alCerrar();
      if (e.key === "ArrowRight") setPasoActual((p) => Math.min(PASOS.length - 1, p + 1));
      if (e.key === "ArrowLeft") setPasoActual((p) => Math.max(0, p - 1));
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [abierto, alCerrar]);

  if (!abierto) return null;

  const paso = PASOS[pasoActual];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-4xl max-h-[92vh] overflow-hidden rounded-2xl border border-sky-500/40 bg-[#07090e] shadow-[0_0_50px_rgba(56,189,248,0.2)]">
        {/* Esquinas tácticas */}
        <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-sky-400 pointer-events-none" />
        <span className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-sky-400 pointer-events-none" />
        <span className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-sky-400 pointer-events-none" />
        <span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-sky-400 pointer-events-none" />

        {/* Barra Superior */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 px-5 py-3.5 bg-zinc-950/80">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/20 border border-sky-500/40 text-sky-300 font-mono text-xs font-black">
              VG
            </span>
            <div>
              <h2 className="font-sans text-sm font-black tracking-wider uppercase text-zinc-100 flex items-center gap-2">
                GUÍA TÁCTICA DE VANGUARD
                <span className="rounded bg-sky-500/20 px-1.5 py-0.2 font-mono text-[9px] text-sky-300 border border-sky-500/40">
                  ORIENTACIÓN RÁPIDA
                </span>
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={alCerrar}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700 hover:text-white transition"
            aria-label="Cerrar guía"
          >
            <X size={15} />
          </button>
        </div>

        {/* Selector de Pasos en Cinta Superior */}
        <div className="flex border-b border-zinc-800/80 bg-zinc-950/40 overflow-x-auto scrollbar-none px-2 py-2 gap-1.5">
          {PASOS.map((p, idx) => (
            <button
              key={p.id}
              onClick={() => setPasoActual(idx)}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 font-mono text-xs transition-all whitespace-nowrap ${
                pasoActual === idx
                  ? "bg-sky-500/20 text-sky-200 border border-sky-400/60 shadow-[0_0_12px_rgba(56,189,248,0.25)] font-bold"
                  : "border border-transparent text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200"
              }`}
            >
              <span>{p.icono}</span>
              <span>Paso {p.id}</span>
            </button>
          ))}
        </div>

        {/* Contenido Principal con Scroll */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Tarjeta de Encabezado de Fase */}
          <div className={`rounded-xl border p-5 bg-gradient-to-br ${paso.color}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-[10px] font-bold tracking-widest uppercase">
                {paso.badge}
              </span>
              <span className="font-mono text-xs text-zinc-400">
                Paso {pasoActual + 1} de {PASOS.length}
              </span>
            </div>

            <h3 className="mt-2 text-2xl font-black text-zinc-100 flex items-center gap-2.5">
              <span>{paso.icono}</span>
              <span>{paso.titulo}</span>
            </h3>
            <p className="mt-1 text-sm font-medium text-zinc-300">{paso.subtitulo}</p>
            <p className="mt-3 text-sm text-zinc-300 leading-relaxed border-t border-white/10 pt-3">
              {paso.descripcion}
            </p>
          </div>

          {/* Tres Elementos Clave con Iconos & Badges */}
          <div>
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-2">
              <Layers size={13} className="text-sky-400" />
              <span>LO QUE ENCONTRARÁS AQUÍ</span>
            </h4>
            <div className="grid gap-3 sm:grid-cols-3">
              {paso.elementosClave.map((elem, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4 transition hover:border-sky-500/40 hover:bg-zinc-900/70"
                >
                  <div className="flex items-center gap-2 font-mono text-[11px] font-bold text-sky-300">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-500/20 text-[10px]">
                      {i + 1}
                    </span>
                    <span>{elem.titulo}</span>
                  </div>
                  <p className="mt-2 text-xs text-zinc-400 leading-relaxed">{elem.detalle}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Consejo Táctico Visual */}
          <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 flex items-start gap-3">
            <span className="text-lg">💡</span>
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-amber-300">
                CONSEJO TÁCTICO DEL AGENTE
              </p>
              <p className="mt-0.5 text-xs text-amber-100/90 leading-relaxed">
                {paso.consejoTáctico}
              </p>
            </div>
          </div>
        </div>

        {/* Barra Inferior de Navegación */}
        <div className="flex items-center justify-between border-t border-zinc-800/80 px-5 py-3.5 bg-zinc-950/90">
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={pasoActual === 0}
              onClick={() => setPasoActual((p) => Math.max(0, p - 1))}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-xs transition ${
                pasoActual === 0
                  ? "border-zinc-800 text-zinc-600 cursor-not-allowed"
                  : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-600 hover:text-white"
              }`}
            >
              <ChevronLeft size={14} /> Anterior
            </button>

            <button
              type="button"
              disabled={pasoActual === PASOS.length - 1}
              onClick={() => setPasoActual((p) => Math.min(PASOS.length - 1, p + 1))}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-xs transition ${
                pasoActual === PASOS.length - 1
                  ? "border-zinc-800 text-zinc-600 cursor-not-allowed"
                  : "border-sky-500/40 bg-sky-950/40 text-sky-200 hover:bg-sky-900/50 hover:text-white"
              }`}
            >
              Siguiente <ChevronRight size={14} />
            </button>
          </div>

          <Link
            href={paso.enlaceDirecto}
            onClick={alCerrar}
            className="inline-flex items-center gap-1.5 rounded-lg border border-sky-400 bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-2 font-mono text-xs font-bold text-white shadow-[0_0_15px_rgba(56,189,248,0.4)] hover:brightness-110 transition"
          >
            <span>{paso.textoEnlace}</span>
            <ExternalLink size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}

/** Botón que vive en la cabecera para abrir la guía táctica */
export function BotonGuiaVisual() {
  const [modalAbierto, setModalAbierto] = useState(false);

  useEffect(() => {
    const alPedirGuia = () => setModalAbierto(true);
    window.addEventListener("abrir-guia-vanguard", alPedirGuia);
    return () => window.removeEventListener("abrir-guia-vanguard", alPedirGuia);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setModalAbierto(true)}
        aria-label="Abrir Guía Visual de Vanguard"
        className="group relative flex items-center gap-1.5 rounded-full border border-sky-500/40 bg-sky-950/50 px-2.5 py-1 text-xs font-mono text-sky-300 shadow-[0_0_12px_rgba(56,189,248,0.2)] transition hover:border-sky-400 hover:bg-sky-900/50 hover:text-white"
      >
        <span className="flex h-2 w-2 rounded-full bg-sky-400 animate-pulse" />
        <span className="hidden sm:inline font-bold uppercase tracking-wider">GUÍA TÁCTICA</span>
        <span className="sm:hidden font-bold uppercase">GUÍA</span>
      </button>

      <GuiaVisualTactivaModal abierto={modalAbierto} alCerrar={() => setModalAbierto(false)} />
    </>
  );
}
