// v400.0 — el pie de la casa nueva
import Link from "next/link";
import { LogoVanguard } from "./logo";
import { BotonMundos } from "@/components/mundos/puerta-mundos";

export function Pie() {
  return (
    <footer className="vx-pie">
      <div className="vx-wrap">
        <div className="vx-pie-g">
          <div>
            <LogoVanguard />
            <p style={{ margin: "12px 0 0", maxWidth: 360 }}>
              Un solo mundo: noticias en tiempo real y en español, mapas, conocimiento, simulación y juego, todo con el mismo estilo.
              Gratis y sin registro.
            </p>
            <div style={{ marginTop: 14 }}>
              <BotonMundos />
            </div>
          </div>
          <div>
            <h4>Noticias</h4>
            <ul>
              <li><Link href="/">Portada</Link></li>
              <li><Link href="/en-vivo">En vivo</Link></li>
              <li><Link href="/guerra-hoy">Conflictos</Link></li>
              <li><Link href="/modulo/conocimiento">Conocimiento</Link></li>
              <li><Link href="/modulo/datos">Datos vivos</Link></li>
            </ul>
          </div>
          <div>
            <h4>Explorar</h4>
            <ul>
              <li><Link href="/mundo">Mapa 3D</Link></li>
              <li><Link href="/vertigo">El Vértigo</Link></li>
              <li><Link href="/zona-cero">Zona Cero</Link></li>
              <li><Link href="/cuaderno">El Cuaderno</Link></li>
              <li><Link href="/trailer">El tráiler</Link></li>
              <li><Link href="/historia">Historia</Link></li>
            </ul>
          </div>
          <div>
            <h4>Comunidad</h4>
            <ul>
              <li><Link href="/cuartel">Cuartel y juego</Link></li>
              <li><Link href="/perfil">Mi perfil</Link></li>
              <li><Link href="/estado">Estado</Link></li>
              <li><Link href="/privacidad">Privacidad</Link></li>
            </ul>
          </div>
        </div>
        <p style={{ marginTop: 28, fontSize: 13 }}>
          Fuentes: BBC Mundo, France 24, El País, El Mundo, ABC, DW, Europa Press, La Vanguardia, 20minutos y ONU Noticias.
          Cada nota enlaza a su medio original.
        </p>
      </div>
    </footer>
  );
}
