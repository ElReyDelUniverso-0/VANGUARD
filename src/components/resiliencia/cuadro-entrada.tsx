// ═══════════════════════════════════════════════════════════════════
// v420.1 · MISIÓN 09 · el cuadro de entrada del centro
// Server component puro: las tres preguntas que ordenan el centro.
// ═══════════════════════════════════════════════════════════════════

import Link from "next/link";

const PASOS = [
  {
    pregunta: "¿Qué puede pasarme aquí?",
    texto: "Empieza por las fichas de peligro y por la ficha geográfica de tu país: la exposición es territorial y se puede leer.",
    enlace: { ruta: "/resiliencia/peligros", etiqueta: "Fichas de peligros" },
  },
  {
    pregunta: "¿Qué hago hoy, con lo que tengo?",
    texto: "El plan familiar en siete pasos y la mochila de 72 horas: dos tardes con lo que ya hay en casa, y la diferencia es medible.",
    enlace: { ruta: "/resiliencia/familia", etiqueta: "Continuidad familiar" },
  },
  {
    pregunta: "¿Con quién cuento?",
    texto: "La ficha de tu país (a quién llamar y cómo llega el aviso) y la red del barrio: el árbol de llamadas, el punto de encuentro, el registro de apoyos.",
    enlace: { ruta: "/resiliencia/organismos", etiqueta: "Directorio de organismos" },
  },
];

export function CuadroEntrada() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
      <h2 className="text-[15px] font-semibold text-zinc-100">Por dónde empezar, en tres preguntas</h2>
      <ol className="mt-3 space-y-3">
        {PASOS.map((p, i) => (
          <li key={p.pregunta} className="border-l-2 border-teal-500/40 pl-3">
            <p className="text-[13px] font-semibold text-zinc-100">
              <span className="font-mono text-[11px] text-teal-300">{i + 1} · </span>
              {p.pregunta}
            </p>
            <p className="mt-1 text-[12.5px] leading-6 text-zinc-400">{p.texto}</p>
            <Link href={p.enlace.ruta} className="mt-1.5 inline-block text-[12px] font-semibold text-teal-300 hover:text-teal-200">
              {p.enlace.etiqueta} →
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
