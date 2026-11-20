"use client";

// ═══════════════════════════════════════════════════════════════════
// v421.8 · MY UNIVERSE — LA PIEZA
//
// Una pieza NO es una copia de la herramienta: es su puerta. Muestra el
// nombre, el grupo y la descripción que ya declara el registro de la casa, y
// abre la sala real. Así el espacio organiza la casa sin duplicarla.
//
// Se arrastra (ratón) y se ajusta con botones (cualquier dispositivo): el
// tamaño se cambia sin depender de un asa de 6 px.
// ═══════════════════════════════════════════════════════════════════
import Link from "next/link";
import type { Pieza } from "@/lib/mi-universo/modelo";
import type { PiezaCatalogo } from "@/lib/mi-universo/catalogo";

type Props = {
  pieza: Pieza;
  ficha?: PiezaCatalogo;
  acento: string;
  seleccionada: boolean;
  arrastrando: boolean;
  onSeleccionar: () => void;
  onArrastreInicio: () => void;
  onArrastreFin: () => void;
  onSoltarSobre: () => void;
  onFavorito: () => void;
  onAncho: (delta: number) => void;
  onAlto: (delta: number) => void;
  onQuitar: () => void;
};

export function PiezaTarjeta({
  pieza,
  ficha,
  acento,
  seleccionada,
  arrastrando,
  onSeleccionar,
  onArrastreInicio,
  onArrastreFin,
  onSoltarSobre,
  onFavorito,
  onAncho,
  onAlto,
  onQuitar,
}: Props) {
  const nombre = ficha?.nombre ?? "Puerta retirada";
  const grupo = ficha?.grupo ?? "sin catálogo";
  const desc = ficha?.desc ?? "Esta pieza apunta a un módulo que ya no está en el catálogo. Se puede quitar sin miedo: el módulo, si existe, sigue en la casa.";
  const inicial = nombre.trim().charAt(0).toUpperCase();

  return (
    <article
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", pieza.id);
        onArrastreInicio();
      }}
      onDragEnd={onArrastreFin}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onSoltarSobre();
      }}
      onClick={onSeleccionar}
      style={{
        gridColumn: `${pieza.col + 1} / span ${pieza.ancho}`,
        gridRow: `${pieza.fila + 1} / span ${pieza.alto}`,
        borderColor: seleccionada ? acento : "var(--mu-borde)",
        boxShadow: seleccionada ? `0 0 0 1px ${acento}, 0 18px 40px -28px ${acento}` : "none",
        opacity: arrastrando ? 0.45 : 1,
      }}
      className="mu-pieza group relative flex min-h-0 cursor-grab flex-col overflow-hidden rounded-xl border bg-white/[0.02] p-3 transition active:cursor-grabbing"
      aria-label={`${nombre} — ${grupo}`}
    >
      <div className="flex items-start gap-2">
        <span
          aria-hidden
          className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md text-[11px] font-semibold"
          style={{ background: `${ficha?.acento ?? acento}22`, color: ficha?.acento ?? acento, border: `1px solid ${ficha?.acento ?? acento}44` }}
        >
          {inicial}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[13px] font-semibold leading-tight text-white/90">{nombre}</h3>
          <p className="mu-grupo truncate text-[10px] uppercase tracking-[0.14em] text-white/35">{grupo}</p>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onFavorito();
          }}
          aria-pressed={pieza.favorito}
          aria-label={pieza.favorito ? "Quitar de favoritos" : "Marcar como favorito"}
          className="shrink-0 rounded-md px-1 text-[13px] leading-none transition hover:bg-white/5"
          style={{ color: pieza.favorito ? acento : "rgba(255,255,255,0.28)" }}
        >
          {pieza.favorito ? "★" : "☆"}
        </button>
      </div>

      <p className="mt-2 line-clamp-2 flex-1 text-[11px] leading-snug text-white/45">{desc}</p>

      <div className="mt-2 flex items-center justify-between gap-2">
        {ficha ? (
          <Link
            href={ficha.href}
            onClick={(e) => e.stopPropagation()}
            className="mu-abrir rounded-md px-2 py-1 text-[11px] font-medium transition hover:bg-white/5"
            style={{ color: ficha.acento }}
          >
            Abrir →
          </Link>
        ) : (
          <span className="text-[11px] text-white/25">sin destino</span>
        )}

        {/* acciones de tamaño: visibles al seleccionar (o al pasar el ratón en escritorio) */}
        <div
          className={`flex items-center gap-0.5 transition ${
            seleccionada ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        >
          <button type="button" onClick={(e) => { e.stopPropagation(); onAncho(-1); }} aria-label="Más estrecha" className="mu-btn" title="Más estrecha">−</button>
          <button type="button" onClick={(e) => { e.stopPropagation(); onAncho(1); }} aria-label="Más ancha" className="mu-btn" title="Más ancha">+</button>
          <button type="button" onClick={(e) => { e.stopPropagation(); onAlto(-1); }} aria-label="Menos alta" className="mu-btn" title="Menos alta">▾</button>
          <button type="button" onClick={(e) => { e.stopPropagation(); onAlto(1); }} aria-label="Más alta" className="mu-btn" title="Más alta">▴</button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onQuitar(); }}
            aria-label="Quitar del espacio"
            title="Quitar del espacio (el módulo sigue en la casa)"
            className="mu-btn mu-btn-x"
          >
            ×
          </button>
        </div>
      </div>

      <style jsx>{`
        .mu-btn {
          border-radius: 0.375rem;
          padding: 0.05rem 0.3rem;
          font-size: 11px;
          line-height: 1.3;
          color: rgba(255, 255, 255, 0.5);
          background: rgba(255, 255, 255, 0.04);
        }
        .mu-btn:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.12);
        }
        .mu-btn-x:hover {
          color: #ff6b6b;
        }
        .mu-pieza:hover {
          background: rgba(255, 255, 255, 0.04);
        }
      `}</style>
    </article>
  );
}
