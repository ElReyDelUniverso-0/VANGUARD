"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GraduationCap,
  BookOpen,
  Compass,
  Layers,
  Sparkles,
  BookMarked,
  Award,
  History,
  Target,
} from "lucide-react";

interface ItemNavegacion {
  id: string;
  nombre: string;
  ruta: string;
  icono: React.ComponentType<{ className?: string }>;
  insignia?: string;
}

const ITEMS_ACADEMIA: ItemNavegacion[] = [
  { id: "inicio", nombre: "Centro General", ruta: "/academia", icono: GraduationCap },
  { id: "cursos", nombre: "Cursos y Biblioteca", ruta: "/academia/cursos", icono: BookOpen, insignia: "10 Áreas" },
  { id: "rutas", nombre: "Constructor de Rutas", ruta: "/academia/rutas", icono: Compass, insignia: "A medida" },
  { id: "tarjetas", nombre: "Tarjetas de Estudio", ruta: "/academia/tarjetas", icono: Layers, insignia: "Quizlet" },
  { id: "ejercicios", nombre: "Banco de Práctica", ruta: "/academia/ejercicios", icono: Target },
  { id: "glosario", nombre: "Glosario", ruta: "/academia/glosario", icono: BookMarked },
  { id: "certificados", nombre: "Certificados", ruta: "/academia/certificados", icono: Award, insignia: "Internos" },
  { id: "historial", nombre: "Mi Progreso", ruta: "/academia/historial", icono: History },
];

export function NavegacionAcademia() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegación de Vanguard Academy"
      className="w-full bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-2 shadow-2xl mb-8"
    >
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1 px-1">
        {ITEMS_ACADEMIA.map((item) => {
          const Icono = item.icono;
          const esActivo =
            item.ruta === "/academia"
              ? pathname === "/academia"
              : pathname.startsWith(item.ruta);

          return (
            <Link
              key={item.id}
              href={item.ruta}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                esActivo
                  ? "bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-lg shadow-amber-950/40"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent"
              }`}
            >
              <Icono className={`w-4 h-4 ${esActivo ? "text-amber-400" : "text-slate-400"}`} />
              <span>{item.nombre}</span>
              {item.insignia && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                    esActivo
                      ? "bg-amber-500/25 text-amber-200"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {item.insignia}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
