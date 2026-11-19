// v420.0 VANGUARD LINGUA — reproductor de una grabación de Wikimedia Commons, con su crédito.
import type { AudioCommons } from "@/lib/lingua/wiki";

export function AudioCommonsVista({ a, etiqueta }: { a: AudioCommons; etiqueta?: string }) {
  return (
    <div className="vx-li-audio">
      {etiqueta ? <span style={{ fontSize: 13, color: "var(--pl-suave)" }}>{etiqueta}</span> : null}
      <audio controls preload="none">
        {a.mp3 ? <source src={a.mp3} type="audio/mpeg" /> : null}
        <source src={a.url} />
        Tu navegador no reproduce audio incrustado. <a href={a.url}>Descarga la grabación</a>.
      </audio>
      <small>
        Grabación: {a.autor} · {a.licencia} ·{" "}
        <a href={a.pagina} target="_blank" rel="noopener noreferrer">
          {a.archivo}
        </a>{" "}
        (Wikimedia Commons)
      </small>
    </div>
  );
}
