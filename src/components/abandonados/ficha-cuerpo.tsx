// ═══════════════════════════════════════════════════════════════════
// v441.3 · ABANDONED WORLD — el cuerpo de una ficha (server component)
// Lo comparten la ficha desplegable del atlas y la página del lugar:
// fotos documentales con su crédito, historia, razones del abandono,
// cronología, estado actual, cómo conocerlo con seguridad y fuentes.
// ═══════════════════════════════════════════════════════════════════
import type { FotoAbandono, LugarAbandonado } from "@/lib/abandonados/tipos";
import { META_ACCESO } from "@/lib/abandonados/lugares";

export function CreditoFoto({ f }: { f: FotoAbandono }) {
  return (
    <>
      Foto: {f.autor} ·{" "}
      <a href={f.origen} target="_blank" rel="noopener noreferrer">
        {f.licencia}, Wikimedia Commons
      </a>
    </>
  );
}

export function FichaCuerpo({
  lugar,
  fotos,
  saltarPrimera = false,
}: {
  lugar: LugarAbandonado;
  fotos: FotoAbandono[];
  saltarPrimera?: boolean;
}) {
  const acc = META_ACCESO[lugar.acceso.tipo];
  const galeria = saltarPrimera ? fotos.slice(1) : fotos;
  return (
    <>
      {galeria.length > 0 ? (
        <div className="aw-fotos" aria-label={`Fotografías documentales de ${lugar.nombre}`}>
          {galeria.map((f) => (
            <figure key={f.src}>
              <img src={f.src} width={f.w} height={f.h} alt={`${lugar.nombre}: ${f.titulo}`} loading="lazy" decoding="async" />
              <figcaption>
                <CreditoFoto f={f} />
              </figcaption>
            </figure>
          ))}
        </div>
      ) : null}

      <div className="aw-cols">
        <div>
          <h3>Historia</h3>
          {lugar.historia.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          <h3>Por qué se abandonó</h3>
          <ul className="aw-razones">
            {lugar.razones.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
          <h3>Estado actual</h3>
          <p>{lugar.estado}</p>
        </div>
        <div>
          <h3>Cronología</h3>
          <ol className="aw-crono">
            {lugar.cronologia.map((h, i) => (
              <li key={i}>
                <b>{h.anio}</b>
                {h.hecho}
              </li>
            ))}
          </ol>
          <h3>Cómo conocerlo con seguridad</h3>
          <div className="aw-acceso">
            <span className={`aw-acc ${acc.clase}`}>{acc.etiqueta}</span>
            <p>{lugar.acceso.texto}</p>
          </div>
          <h3>Fuentes</h3>
          <ul className="aw-fuentes">
            {lugar.fuentes.map((f) => (
              <li key={f.url}>
                <a href={f.url} target="_blank" rel="noopener noreferrer">
                  {f.titulo}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
