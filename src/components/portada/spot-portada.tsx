// v402.4 «VANGUARD EN 30 SEGUNDOS» — el spot vertical (voz real, capturas
// reales de la casa) vive en la portada. Componente de SERVIDOR, cero JS:
// <video preload="none"> con póster, así no pesa nada hasta que alguien
// pulsa ▶. El botón de WhatsApp convierte a cada visitante en mensajero.
const SITE =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://vanguard.vanguard-casa.workers.dev";

const MENSAJE = `El mundo está en guerra ahora mismo y casi nadie lo cuenta completo. Mira esto 👉 ${SITE}/?origen=whatsapp`;

export function SpotPortada() {
  return (
    <div className="vx-spot">
      <div className="vx-spot-video">
        <span className="vx-mira vx-esquinas" aria-hidden />
        <video
          controls
          playsInline
          preload="none"
          poster="/videos/spot-vanguard.jpg"
          width={540}
          height={960}
          aria-label="Spot de VANGUARD: el mundo en tiempo real, en 30 segundos"
        >
          <source src="/videos/spot-vanguard.mp4" type="video/mp4" />
        </video>
      </div>
      <div className="vx-spot-txt">
        <span className="vx-sello">Treinta segundos · voz real</span>
        <p className="vx-spot-lema">Los noticieros te lo cuentan tarde, y a medias.</p>
        <ul>
          <li><b>Cada cable</b> con su hora, su fuente y su foto.</li>
          <li><b>Todas las guerras</b> sobre un globo vivo.</li>
          <li><b>Las claves del día</b> y una voz que te explica por qué te importa.</li>
        </ul>
        <div className="vx-spot-acc">
          <a
            className="vx-spot-wa"
            href={`https://wa.me/?text=${encodeURIComponent(MENSAJE)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Enviar por WhatsApp
          </a>
          <a className="vx-spot-dl" href="/videos/spot-vanguard.mp4" download="vanguard-30s.mp4">
            Descargar para tus estados
          </a>
        </div>
      </div>
    </div>
  );
}
