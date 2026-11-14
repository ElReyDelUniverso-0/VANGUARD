// ============================================================
// v400.3 LA VIDEOTECA (components/vanguard/videoteca.tsx)
//
// Hallazgo de la auditoría (v400.2): la casa tiene **24 clips de vídeo**
// en `public/videos/` (V-001 … V-024, mp4 servidos por ella misma, con
// `accept-ranges` y `video/mp4` comprobados) y **ni una sola sala los
// usaba**. `grep -rn "/videos/V-" src` devolvía cero. El Dueño pide
// «vídeos» desde el primer día del pilar 2: aquí están, con casa.
//
// LO QUE ESTE COMPONENTE NO HACE: no inventa títulos ni duraciones. La
// casa no tiene ficha editorial de esos clips todavía, y este archivo no
// se la va a inventar. Cada tarjeta se llama por su nombre real de
// archivo y se declara lo que se sabe: que el clip viaja en el
// repositorio y que se sirve desde la casa.
//
// LO QUE SÍ HACE, Y AHORA: los pone a la vista y a un toque. `preload="none"`
// — ninguna tarjeta baja un byte hasta que alguien pulsa play (la lección
// v247 sobre el peso: el vídeo es lo más caro que puede bajar una página).
// La miniatura es una ilustración que YA existe en `/ilustraciones`.
// Componente de SERVIDOR: cero JavaScript propio; los controles son los
// del navegador, que no pesan nada.
// ============================================================

export type ClipVideoteca = {
  /** nombre real del archivo, sin adornos */
  archivo: string;
  /** una línea de lo que se ve (solo si la casa lo sabe de la fuente) */
  nota?: string;
};

export interface VideotecaProps {
  clips: ClipVideoteca[];
  /** ilustración que hace de miniatura mientras nadie pulsa play */
  poster: string;
  titulo?: string;
  volanta?: string;
  /** párrafo de honestidad: de dónde salen estos clips */
  nota: string;
  acento?: string;
  /** cuántos se enseñan (el resto se dice, no se esconde) */
  visibles?: number;
}

export function Videoteca({
  clips,
  poster,
  titulo = "LA VIDEOTECA",
  volanta = "EL VÍDEO DE LA CASA",
  nota,
  acento = "#f43f5e",
  visibles = 12,
}: VideotecaProps) {
  const acc = /^#[0-9a-fA-F]{6}$/.test(acento) ? acento : "#f43f5e";
  const mostrados = clips.slice(0, visibles);

  return (
    <section className="mx-auto max-w-5xl px-5 py-10" aria-labelledby="videoteca-titulo">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em]" style={{ color: acc }}>
            {volanta}
          </p>
          <h2 id="videoteca-titulo" className="mt-1 font-mono text-xl font-black uppercase tracking-tight text-white">
            {titulo}
          </h2>
        </div>
        <p className="font-mono text-[11px] uppercase tracking-widest text-slate-500">
          {clips.length} clips en el repositorio
        </p>
      </div>

      <p className="mt-2 max-w-3xl text-[13px] leading-relaxed text-slate-400">{nota}</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {mostrados.map((c) => (
          <figure key={c.archivo} className="overflow-hidden rounded-lg border border-slate-800 bg-slate-900/50">
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video
              controls
              preload="none"
              poster={poster}
              playsInline
              className="aspect-video w-full bg-black object-cover"
            >
              <source src={`/videos/${c.archivo}`} type="video/mp4" />
              Tu navegador no puede reproducir este clip. El archivo está en
              <code className="mx-1">/videos/{c.archivo}</code>.
            </video>
            <figcaption className="px-3 py-2">
              <div className="font-mono text-[10.5px] uppercase tracking-widest text-slate-300">{c.archivo}</div>
              {c.nota && <div className="mt-0.5 text-[11px] leading-snug text-slate-500">{c.nota}</div>}
            </figcaption>
          </figure>
        ))}
      </div>

      {clips.length > mostrados.length && (
        <p className="mt-3 font-mono text-[11px] text-slate-500">
          … y {clips.length - mostrados.length} clips más en el archivo. Se enseñan {mostrados.length} para no arrastrar
          la página: todos viajan en el repositorio de la casa.
        </p>
      )}
    </section>
  );
}
