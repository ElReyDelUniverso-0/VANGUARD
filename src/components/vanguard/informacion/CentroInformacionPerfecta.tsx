"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Globe,
  Shield,
  FileText,
  Cpu,
  BarChart3,
  Search,
  Crosshair,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  Zap,
  Radio,
  Flame,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { PAISES_MUNDO, type PaisDossier } from "@/lib/paises-data";
import { ARSENAL, type ArsenalWeapon } from "@/lib/arsenal-data";

// Puntos de estrangulamiento geoeconómicos mundiales
interface PuntoEstrangulamiento {
  id: string;
  nombre: string;
  ubicacion: string;
  importanciaComercio: string;
  flujoPetroleoMbd: number; // Millones barriles diarios
  nivelRiesgo: "CRÍTICO" | "ELEVADO" | "MODERADO";
  actoresClave: string[];
  vulnerabilidad: string;
}

const PUNTOS_ESTRANGULAMIENTO: PuntoEstrangulamiento[] = [
  {
    id: "hormuz",
    nombre: "Estrecho de Ormuz",
    ubicacion: "Golfo Pérsico · Entre Omán e Irán",
    importanciaComercio: "El cuello de botella petrolero más importante del planeta (21% del consumo global de crudo).",
    flujoPetroleoMbd: 21.0,
    nivelRiesgo: "CRÍTICO",
    actoresClave: ["Irán", "EE.UU.", "Arabia Saudita", "EAU"],
    vulnerabilidad: "Minado marítimo, lanchas rápidas armadas y misiles antibuque costeros.",
  },
  {
    id: "malaca",
    nombre: "Estrecho de Malaca",
    ubicacion: "Sudeste Asiático · Entre Indonesia, Malasia y Singapur",
    importanciaComercio: "Vía marítima principal hacia Asia Oriental (China, Japón, Corea del Sur); más de 84.000 buques anuales.",
    flujoPetroleoMbd: 16.5,
    nivelRiesgo: "ELEVADO",
    actoresClave: ["China", "Singapur", "EE.UU.", "India"],
    vulnerabilidad: "Piratería, congestión en el canal Phillips (ancho mínimo 2.8 km) y vulnerabilidad de suministros a China.",
  },
  {
    id: "suez-bab",
    nombre: "Canal de Suez & Bab el-Mandeb",
    ubicacion: "Mar Rojo · Entre Egipto, Yemen y Yibuti",
    importanciaComercio: "Conexión directa entre el Océano Índico y el Mediterráneo (12% del comercio marítimo mundial).",
    flujoPetroleoMbd: 8.8,
    nivelRiesgo: "CRÍTICO",
    actoresClave: ["Egipto", "Yemen (Hutíes)", "Israel", "EE.UU."],
    vulnerabilidad: "Ataques con drones y misiles antibuque desde Yemen; desvíos masivos por Cabo de Buena Esperanza (+14 días).",
  },
  {
    id: "taiwan",
    nombre: "Estrecho de Taiwán",
    ubicacion: "Asia Oriental · Entre China Continental y Taiwán",
    importanciaComercio: "Corredor por donde transita casi el 50% de la flota mundial de portacontenedores y microchips de alta gama.",
    flujoPetroleoMbd: 4.5,
    nivelRiesgo: "CRÍTICO",
    actoresClave: ["China", "Taiwán", "EE.UU.", "Japón"],
    vulnerabilidad: "Bloqueo aeronaval, zona de identificación de defensa aérea saturada y concentración del 90% de chips avanzados (TSMC).",
  },
  {
    id: "suwalki",
    nombre: "Corredor de Suwałki",
    ubicacion: "Frontera Polonia-Lituania · Entre Bielorrusia y Kaliningrado",
    importanciaComercio: "Cuello de botella terrestre estratégico de la OTAN para conectar los países bálticos con Europa Central.",
    flujoPetroleoMbd: 0,
    nivelRiesgo: "ELEVADO",
    actoresClave: ["Polonia", "Lituania", "Rusia", "Bielorrusia", "OTAN"],
    vulnerabilidad: "Franja de 65 km que podría aislar a Lituania, Letonia y Estonia del resto de la Alianza Atlántica.",
  },
  {
    id: "panama",
    nombre: "Canal de Panamá",
    ubicacion: "Centroamérica · Conexión Atlántico-Pacífico",
    importanciaComercio: "Paso de 14.000 naves al año (6% del comercio mundial); vital para la costa este de EE.UU. y Asia.",
    flujoPetroleoMbd: 1.2,
    nivelRiesgo: "MODERADO",
    actoresClave: ["Panamá", "EE.UU.", "China", "Japón"],
    vulnerabilidad: "Restricciones de calado por sequías en el Lago Gatún y capacidad limitada para buques Neopanamax.",
  },
];

// Tecnologías de Ruptura Geopolítica
interface TecnologiaDisrupcion {
  id: string;
  nombre: string;
  categoria: string;
  trl: number; // Technology Readiness Level 1-9
  lideres: string[];
  impactoEstrategico: string;
  descripcion: string;
}

const TECNOLOGIAS_DISRUPCION: TecnologiaDisrupcion[] = [
  {
    id: "hipersonico",
    nombre: "Propulsión Hipersónica (Mach 5+)",
    categoria: "Armamento & Aeroespacial",
    trl: 8,
    lideres: ["Rusia", "China", "EE.UU."],
    impactoEstrategico: "Invalida los sistemas tradicionales de defensa antiaérea por velocidad y maniobrabilidad no balística.",
    descripcion: "Planeadores hipersónicos (HGV) y misiles de crucero con scramjet que reducen el tiempo de respuesta defensiva a minutos.",
  },
  {
    id: "cuantica",
    nombre: "Criptografía & Computación Cuántica",
    categoria: "Ciberseguridad & Cómputo",
    trl: 5,
    lideres: ["EE.UU.", "China", "Alemania"],
    impactoEstrategico: "Ruptura del cifrado RSA tradicional ('Día Q') y optimización de cadenas logísticas bélicas complejas.",
    descripcion: "Superposición cuántica que permite descifrar comunicaciones encriptadas retrospectivamente y sensores gravimétricos ultrasensibles.",
  },
  {
    id: "enjambre-ia",
    nombre: "Enjambres Autónomos de Drones con IA",
    categoria: "Guerra No Tripulada",
    trl: 7,
    lideres: ["EE.UU.", "China", "Israel", "Turquía", "Ucrania"],
    impactoEstrategico: "Saturación asimétrica masiva de defensas costosas mediante cientos de unidades de bajo coste interconectadas.",
    descripcion: "Drones que se comunican entre sí sin control humano central, coordinando ataques en pinza y reconocimiento térmico en tiempo real.",
  },
  {
    id: "satelites-leo",
    nombre: "Constelaciones Satelitales LEO Masivas",
    categoria: "Telecomunicaciones & SIGINT",
    trl: 9,
    lideres: ["EE.UU. (Starlink)", "China (Guowang)"],
    impactoEstrategico: "Comando y control de campo hiperresistente que no depende de cables submarinos o torres terrestres destruibles.",
    descripcion: "Miles de satélites en órbita baja que ofrecen conectividad de baja latencia e imágenes multiespectrales casi instantáneas.",
  },
];

export function CentroInformacionPerfecta() {
  const [pestana, setPestana] = useState<"paises" | "arsenal" | "puntos" | "ciencia" | "comparador">("paises");
  const [busqueda, setBusqueda] = useState("");
  const [paisSeleccionadoId, setPaisSeleccionadoId] = useState<string>("us");

  // Comparador
  const [compPaisA, setCompPaisA] = useState<string>("us");
  const [compPaisB, setCompPaisB] = useState<string>("cn");

  const paisActivo = useMemo(() => {
    return PAISES_MUNDO.find((p) => p.id === paisSeleccionadoId) || PAISES_MUNDO[0];
  }, [paisSeleccionadoId]);

  const paisA = useMemo(() => PAISES_MUNDO.find((p) => p.id === compPaisA) || PAISES_MUNDO[0], [compPaisA]);
  const paisB = useMemo(() => PAISES_MUNDO.find((p) => p.id === compPaisB) || PAISES_MUNDO[1], [compPaisB]);

  // Filtros de búsqueda global
  const q = busqueda.toLowerCase().trim();

  const paisesFiltrados = useMemo(() => {
    if (!q) return PAISES_MUNDO;
    return PAISES_MUNDO.filter(
      (p) =>
        p.nombre.toLowerCase().includes(q) ||
        p.bloque.toLowerCase().includes(q) ||
        p.region.toLowerCase().includes(q) ||
        p.doctrinaMilitar.toLowerCase().includes(q)
    );
  }, [q]);

  const armasFiltradas = useMemo(() => {
    if (!q) return ARSENAL;
    return ARSENAL.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.origin.toLowerCase().includes(q) ||
        a.function.toLowerCase().includes(q)
    );
  }, [q]);

  const puntosFiltrados = useMemo(() => {
    if (!q) return PUNTOS_ESTRANGULAMIENTO;
    return PUNTOS_ESTRANGULAMIENTO.filter(
      (p) =>
        p.nombre.toLowerCase().includes(q) ||
        p.ubicacion.toLowerCase().includes(q) ||
        p.actoresClave.some((a) => a.toLowerCase().includes(q))
    );
  }, [q]);

  const cienciaFiltrada = useMemo(() => {
    if (!q) return TECNOLOGIAS_DISRUPCION;
    return TECNOLOGIAS_DISRUPCION.filter(
      (t) =>
        t.nombre.toLowerCase().includes(q) ||
        t.categoria.toLowerCase().includes(q) ||
        t.lideres.some((l) => l.toLowerCase().includes(q))
    );
  }, [q]);

  return (
    <div className="space-y-6">
      {/* ══════════ ENCABEZADO TÁCTICO & ESTADO GLOBAL ══════════ */}
      <div className="relative overflow-hidden rounded-2xl border border-sky-500/40 bg-[#060a12] p-6 shadow-[0_0_35px_rgba(56,189,248,0.15)]">
        {/* Esquinas y trama HUD */}
        <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-sky-400" />
        <span className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-sky-400" />
        <span className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-sky-400" />
        <span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-sky-400" />

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-sky-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-sky-300 border border-sky-500/40">
                CENTRO MAESTRO UNIFICADO
              </span>
              <span className="flex items-center gap-1.5 font-mono text-xs text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                TELEMETRÍA EN LÍNEA
              </span>
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-black uppercase tracking-wide text-zinc-100 flex items-center gap-2">
              <span>Información Perfecta</span>
              <span className="text-sky-400 text-lg sm:text-xl font-mono">v431.3</span>
            </h1>
            <p className="mt-1 text-sm text-zinc-300 max-w-3xl leading-relaxed">
              Toda la inteligencia mundial fusionada en una consola interactiva: potencias con radar de 6 ejes, arsenales estratégicos, puntos de estrangulamiento naval y ciencia de frontera. Cero redundancias.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent("abrir-guia-vanguard"))}
              className="inline-flex items-center gap-1.5 rounded-lg border border-sky-400 bg-sky-500/20 px-3.5 py-2 font-mono text-xs font-bold text-sky-200 hover:bg-sky-500/30 shadow-[0_0_15px_rgba(56,189,248,0.3)] transition"
            >
              <HelpCircle size={14} />
              <span>Ver Guía Visual</span>
            </button>
            <Link
              href="/motores"
              className="inline-flex items-center gap-1.5 rounded-lg border border-purple-500/40 bg-purple-950/40 px-3.5 py-2 font-mono text-xs text-purple-300 hover:bg-purple-900/40 transition"
            >
              <Zap size={14} />
              <span>Laboratorio</span>
            </Link>
          </div>
        </div>

        {/* Barra de Búsqueda Universal */}
        <div className="mt-5 flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950/90 px-3.5 py-2.5">
          <Search size={16} className="text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar por potencia (EE.UU., China), arma (F-35, Patriot), estrecho (Ormuz) o tecnología (Cuántica)..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-transparent font-mono text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
          />
          {busqueda && (
            <button
              onClick={() => setBusqueda("")}
              className="font-mono text-xs text-zinc-500 hover:text-zinc-300"
            >
              ✕
            </button>
          )}
        </div>

        {/* Pestañas de Navegación del Centro */}
        <div className="mt-5 flex border-b border-zinc-800/80 overflow-x-auto scrollbar-none gap-2">
          {[
            { id: "paises", label: "Potencias & Geopolítica", icono: "🌍", total: paisesFiltrados.length },
            { id: "arsenal", label: "Arsenal & Sistemas", icono: "🛡️", total: armasFiltradas.length },
            { id: "puntos", label: "Puntos de Estrangulamiento", icono: "⚓", total: puntosFiltrados.length },
            { id: "ciencia", label: "Ciencia & Disrupción", icono: "🔬", total: cienciaFiltrada.length },
            { id: "comparador", label: "Comparador Bilateral", icono: "⚖️", total: "1v1" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setPestana(tab.id as typeof pestana)}
              className={`flex items-center gap-2 border-b-2 px-4 py-2.5 font-mono text-xs font-bold transition whitespace-nowrap ${
                pestana === tab.id
                  ? "border-sky-400 text-sky-200 bg-sky-950/30"
                  : "border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
              }`}
            >
              <span>{tab.icono}</span>
              <span>{tab.label}</span>
              <span className="rounded bg-black/50 px-1.5 py-0.2 text-[10px] text-zinc-400 border border-zinc-800">
                {tab.total}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ══════════ PESTAÑA 1: PAÍSES & GEOPOLÍTICA ══════════ */}
      {pestana === "paises" && (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Selector de Potencias */}
          <div className="lg:col-span-5 space-y-2.5 max-h-[700px] overflow-y-auto pr-1">
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 block px-1">
              SELECCIONA UNA POTENCIA ({paisesFiltrados.length})
            </span>
            {paisesFiltrados.map((p) => (
              <button
                key={p.id}
                onClick={() => setPaisSeleccionadoId(p.id)}
                className={`w-full text-left rounded-xl border p-3.5 transition-all ${
                  paisActivo.id === p.id
                    ? "border-sky-400 bg-sky-950/40 shadow-[0_0_15px_rgba(56,189,248,0.2)]"
                    : "border-zinc-800/80 bg-zinc-950/60 hover:border-zinc-700 hover:bg-zinc-900/60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-sky-300">[{p.iso2}]</span>
                    <b className="text-zinc-100">{p.nombre}</b>
                  </div>
                  <span className="rounded bg-zinc-900 px-2 py-0.5 font-mono text-[10px] text-zinc-400 border border-zinc-800">
                    {p.bloque}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-zinc-400 font-mono">
                  <span>Población: {p.poblacion}M</span>
                  <span>PIB: ${p.pibNominalBillionUsd}B</span>
                  <span className={p.ojivasNucleares > 0 ? "text-amber-400 font-bold" : "text-zinc-500"}>
                    {p.ojivasNucleares > 0 ? `☢️ ${p.ojivasNucleares}` : "No Nuclear"}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Ficha Completa en Alta Definición */}
          <div className="lg:col-span-7 rounded-2xl border border-sky-500/30 bg-[#080d17]/90 p-5 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-3">
              <div>
                <span className="font-mono text-[10px] uppercase text-sky-400 tracking-wider">
                  EXPEDIENTE GEOPOLÍTICO Y MILITAR
                </span>
                <h2 className="text-2xl font-black text-zinc-100">{paisActivo.nombreOficial}</h2>
                <p className="font-mono text-xs text-zinc-400 mt-0.5">
                  Capital: {paisActivo.capital} · Región: {paisActivo.region} · Huso: {paisActivo.tz}
                </p>
              </div>
              <div className="text-right">
                <span className="rounded bg-sky-500/20 px-2.5 py-1 font-mono text-xs font-bold text-sky-300 border border-sky-500/40">
                  Global Firepower #{paisActivo.indiceGfp}
                </span>
              </div>
            </div>

            {/* Radar de 6 Ejes (Visualizador de Barras de Poder) */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-sky-300 block mb-3">
                Radar de Capacidades Estratégicas (0 a 100)
              </span>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {[
                  { label: "Poder Militar", val: paisActivo.radar.militar, color: "bg-red-500" },
                  { label: "Economía & Finanzas", val: paisActivo.radar.economia, color: "bg-amber-500" },
                  { label: "Demografía & Masa", val: paisActivo.radar.demografia, color: "bg-blue-500" },
                  { label: "Independencia Energética", val: paisActivo.radar.energia, color: "bg-emerald-500" },
                  { label: "Tecnología & I+D", val: paisActivo.radar.tecnologia, color: "bg-purple-500" },
                  { label: "Influencia Diplomática", val: paisActivo.radar.diplomacia, color: "bg-cyan-500" },
                ].map((eje) => (
                  <div key={eje.label} className="space-y-1">
                    <div className="flex justify-between font-mono text-xs">
                      <span className="text-zinc-400">{eje.label}</span>
                      <span className="font-bold text-zinc-200">{eje.val} / 100</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${eje.color}`}
                        style={{ width: `${eje.val}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Datos Clave de Defensa & Energía */}
            <div className="grid gap-3 sm:grid-cols-4 font-mono text-xs">
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
                <span className="text-zinc-500 block text-[10px] uppercase">Gasto Defensa</span>
                <b className="text-zinc-100 text-sm">${paisActivo.gastoMilitarBillionUsd}B</b>
                <span className="text-zinc-400 block text-[10px]">({paisActivo.gastoMilitarPibPct}% PIB)</span>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
                <span className="text-zinc-500 block text-[10px] uppercase">Fuerzas Activas</span>
                <b className="text-zinc-100 text-sm">{paisActivo.efectivosActivos}k</b>
                <span className="text-zinc-400 block text-[10px]">+{paisActivo.reservistas}k reserva</span>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
                <span className="text-zinc-500 block text-[10px] uppercase">Ojivas Nucleares</span>
                <b className={paisActivo.ojivasNucleares > 0 ? "text-amber-300 text-sm" : "text-zinc-400 text-sm"}>
                  {paisActivo.ojivasNucleares > 0 ? paisActivo.ojivasNucleares : "0"}
                </b>
                <span className="text-zinc-400 block text-[10px]">Estimadas operativas</span>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
                <span className="text-zinc-500 block text-[10px] uppercase">Satélites Militares</span>
                <b className="text-cyan-300 text-sm">{paisActivo.satelitesMilitares}</b>
                <span className="text-zinc-400 block text-[10px]">En órbita activa</span>
              </div>
            </div>

            {/* Doctrina Militar & Resumen */}
            <div className="space-y-2">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-400">
                Doctrina Militar Oficial
              </span>
              <p className="text-xs text-zinc-300 bg-zinc-900/50 p-3 rounded-lg border border-zinc-800/80 leading-relaxed font-sans">
                {paisActivo.doctrinaMilitar}
              </p>
            </div>

            {/* Ventajas Asimétricas & Vulnerabilidades */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-950/20 p-3">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={12} /> Ventajas Asimétricas
                </span>
                <ul className="mt-2 space-y-1 text-xs text-zinc-300">
                  {paisActivo.ventajasAsimetricas.map((v, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-400">•</span>
                      <span>{v}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg border border-red-500/20 bg-red-950/20 p-3">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-red-400 flex items-center gap-1">
                  <AlertTriangle size={12} /> Vulnerabilidades Estratégicas
                </span>
                <ul className="mt-2 space-y-1 text-xs text-zinc-300">
                  {paisActivo.vulnerabilidades.map((v, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-red-400">•</span>
                      <span>{v}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ PESTAÑA 2: ARSENAL & SISTEMAS BÉLICOS ══════════ */}
      {pestana === "arsenal" && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {armasFiltradas.map((w) => (
              <div
                key={w.id}
                className="group relative flex flex-col justify-between rounded-xl border border-zinc-800/80 bg-zinc-950/70 p-4 transition-all hover:border-amber-500/50 hover:bg-zinc-900/60"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-[10px] text-amber-400 uppercase tracking-wider">
                        {w.origin} · {w.era}
                      </span>
                      <h3 className="text-lg font-black text-zinc-100 group-hover:text-amber-300 transition-colors">
                        {w.name}
                      </h3>
                    </div>
                    <span className="rounded bg-zinc-900 px-2 py-0.5 font-mono text-[9px] text-zinc-400 border border-zinc-800">
                      {w.short}
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-zinc-300 leading-relaxed font-sans">
                    {w.function}
                  </p>
                </div>

                <div className="mt-4 border-t border-zinc-800/80 pt-3">
                  {w.specs && Object.keys(w.specs).length > 0 && (
                    <div className="grid grid-cols-2 gap-2 font-mono text-[11px] mb-3">
                      {Object.entries(w.specs).slice(0, 2).map(([k, v], i) => (
                        <div key={i} className="bg-zinc-900/80 p-1.5 rounded border border-zinc-800">
                          <span className="text-zinc-500 block text-[9px] uppercase truncate">{k}</span>
                          <span className="text-zinc-200 font-bold truncate">{v}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-500 font-mono">Impacto en teatros</span>
                    <Link
                      href={`/arsenal`}
                      className="font-mono text-xs text-amber-400 hover:text-amber-300 inline-flex items-center gap-1"
                    >
                      Despiece técnico →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════ PESTAÑA 3: PUNTOS DE ESTRANGULAMIENTO NAVAL ══════════ */}
      {pestana === "puntos" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {puntosFiltrados.map((p) => (
            <div
              key={p.id}
              className="rounded-xl border border-zinc-800/80 bg-zinc-950/70 p-5 flex flex-col justify-between transition hover:border-cyan-500/50 hover:bg-zinc-900/60"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-lg font-black text-zinc-100">{p.nombre}</h3>
                  <span
                    className={`rounded px-2 py-0.5 font-mono text-[10px] font-bold border ${
                      p.nivelRiesgo === "CRÍTICO"
                        ? "bg-red-500/20 text-red-300 border-red-500/40"
                        : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                    }`}
                  >
                    RIESGO {p.nivelRiesgo}
                  </span>
                </div>

                <p className="mt-1 font-mono text-xs text-cyan-400">{p.ubicacion}</p>
                <p className="mt-2.5 text-xs text-zinc-300 leading-relaxed font-sans">
                  {p.importanciaComercio}
                </p>

                <div className="mt-3 rounded-lg bg-zinc-900/80 p-2.5 border border-zinc-800 text-xs">
                  <span className="font-mono text-[10px] uppercase text-zinc-500 block">Flujo de Crudo Diario</span>
                  <b className="font-mono text-base text-zinc-100">
                    {p.flujoPetroleoMbd > 0 ? `${p.flujoPetroleoMbd} Millones de barriles / día` : "Corredor militar terrestre"}
                  </b>
                </div>
              </div>

              <div className="mt-4 border-t border-zinc-800/80 pt-3 space-y-2">
                <div className="text-xs">
                  <span className="font-mono text-[10px] uppercase text-zinc-400 block">Actores Clave:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {p.actoresClave.map((a) => (
                      <span key={a} className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] text-zinc-300">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-xs text-red-300/90 font-mono text-[11px] bg-red-950/20 p-2 rounded border border-red-500/20">
                  ⚠️ <b>Vulnerabilidad:</b> {p.vulnerabilidad}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ══════════ PESTAÑA 4: CIENCIA & DISRUPCIÓN ══════════ */}
      {pestana === "ciencia" && (
        <div className="grid gap-4 sm:grid-cols-2">
          {cienciaFiltrada.map((t) => (
            <div
              key={t.id}
              className="rounded-xl border border-zinc-800/80 bg-zinc-950/70 p-5 flex flex-col justify-between transition hover:border-purple-500/50 hover:bg-zinc-900/60"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-[10px] uppercase text-purple-400 tracking-wider">
                      {t.categoria}
                    </span>
                    <h3 className="text-lg font-black text-zinc-100">{t.nombre}</h3>
                  </div>
                  <span className="rounded bg-purple-500/20 px-2 py-0.5 font-mono text-xs font-bold text-purple-300 border border-purple-500/40">
                    TRL {t.trl}/9
                  </span>
                </div>

                <p className="mt-2 text-xs text-zinc-300 leading-relaxed font-sans">
                  {t.descripcion}
                </p>

                <div className="mt-3 rounded-lg border border-purple-500/20 bg-purple-950/20 p-3">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-purple-300 font-bold block">
                    Impacto en el Tablero Mundial
                  </span>
                  <p className="mt-1 text-xs text-zinc-300 font-sans">
                    {t.impactoEstrategico}
                  </p>
                </div>
              </div>

              <div className="mt-4 border-t border-zinc-800/80 pt-3 flex items-center justify-between font-mono text-xs">
                <span className="text-zinc-500">Potencias en cabeza:</span>
                <span className="text-zinc-200 font-bold">{t.lideres.join(" · ")}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ══════════ PESTAÑA 5: COMPARADOR BILATERAL CARA A CARA ══════════ */}
      {pestana === "comparador" && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6 space-y-6">
          <div className="border-b border-zinc-800 pb-4">
            <span className="font-mono text-xs font-bold uppercase text-sky-400">
              SIMULACIÓN Y BALANCE DE FUERZAS
            </span>
            <h2 className="text-2xl font-black text-zinc-100 uppercase">Comparador Bilateral</h2>
            <p className="text-xs text-zinc-400 mt-1">
              Selecciona dos actores geopolíticos para confrontar sus parámetros en tiempo real.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Selector A */}
            <div className="rounded-xl border border-sky-500/30 bg-sky-950/20 p-4">
              <label className="font-mono text-xs text-sky-400 block mb-1 font-bold">POTENCIA ALFA</label>
              <select
                value={compPaisA}
                onChange={(e) => setCompPaisA(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 font-mono text-sm text-zinc-100 focus:outline-none focus:border-sky-400"
              >
                {PAISES_MUNDO.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} ({p.bloque})
                  </option>
                ))}
              </select>
            </div>

            {/* Selector B */}
            <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-4">
              <label className="font-mono text-xs text-red-400 block mb-1 font-bold">POTENCIA BETA</label>
              <select
                value={compPaisB}
                onChange={(e) => setCompPaisB(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 font-mono text-sm text-zinc-100 focus:outline-none focus:border-red-400"
              >
                {PAISES_MUNDO.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} ({p.bloque})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tabla Comparativa con Barras Visuales */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-4">
            {[
              {
                label: "PIB Nominal",
                valA: paisA.pibNominalBillionUsd,
                valB: paisB.pibNominalBillionUsd,
                sufijo: "B USD",
              },
              {
                label: "Gasto Militar Anual",
                valA: paisA.gastoMilitarBillionUsd,
                valB: paisB.gastoMilitarBillionUsd,
                sufijo: "B USD",
              },
              {
                label: "Efectivos Activos",
                valA: paisA.efectivosActivos,
                valB: paisB.efectivosActivos,
                sufijo: "k soldados",
              },
              {
                label: "Arsenal Nuclear",
                valA: paisA.ojivasNucleares,
                valB: paisB.ojivasNucleares,
                sufijo: "ojivas",
              },
              {
                label: "Satélites Militares",
                valA: paisA.satelitesMilitares,
                valB: paisB.satelitesMilitares,
                sufijo: "satélites",
              },
              {
                label: "Índice de Poder Militar (GFP)",
                valA: 20 - paisA.indiceGfp, // Invertido para que mayor sea mejor
                valB: 20 - paisB.indiceGfp,
                sufijo: `Rank (#${paisA.indiceGfp} vs #${paisB.indiceGfp})`,
              },
            ].map((metrica) => {
              const maxVal = Math.max(metrica.valA, metrica.valB, 1);
              const pctA = Math.round((metrica.valA / maxVal) * 100);
              const pctB = Math.round((metrica.valB / maxVal) * 100);

              return (
                <div key={metrica.label} className="space-y-1.5 border-b border-zinc-800/60 pb-3">
                  <div className="flex justify-between font-mono text-xs">
                    <span className="font-bold text-sky-400">
                      {paisA.nombre}: {metrica.valA} {metrica.sufijo}
                    </span>
                    <span className="text-zinc-400 font-bold uppercase">{metrica.label}</span>
                    <span className="font-bold text-red-400">
                      {paisB.nombre}: {metrica.valB} {metrica.sufijo}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 h-2.5">
                    {/* Barra A alineada a la derecha */}
                    <div className="h-full bg-zinc-800 rounded-full overflow-hidden flex justify-end">
                      <div className="h-full bg-sky-500 rounded-full" style={{ width: `${pctA}%` }} />
                    </div>
                    {/* Barra B alineada a la izquierda */}
                    <div className="h-full bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full" style={{ width: `${pctB}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
