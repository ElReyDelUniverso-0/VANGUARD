// ═══════════════════════════════════════════════════════════════════
// v400.0 EL REDISEÑO — LA PORTADA NUEVA.
// Mandato del Dueño (2026-11-14, «UN SUPER SÍ» a las 10 soluciones):
// ① una sola cabecera · ② la noticia grande al abrir (adiós pantalla negra
// y tutorial) · ③ cuadrícula tipo revista · ④ textos cortos · ⑤ colores y
// letras modernas · ⑥ móvil tipo app, cero ventanitas flotantes ·
// ⑦ historias por conflicto · ⑧ el mapa vivo a la vista · ⑨ movimiento ·
// ⑩ confianza: un idioma, fotos reales de cada nota, fechas de verdad.
// El cuartel de siempre (juego y salas) vive intacto en /cuartel.
// ═══════════════════════════════════════════════════════════════════
import type { Metadata } from "next";
import Link from "next/link";
import "./portada.css";
import { obtenerNotas, relevancia, type Nota } from "@/lib/portada/notas";
import { CONFLICTOS, REGIONES, conflictoPorKey, horaCorta, type Region } from "@/lib/portada/clasificar";
import { Cabecera, BarraMovil } from "@/components/portada/cabecera";
import { Tarjeta, Etiqueta } from "@/components/portada/tarjeta";
import { Foto } from "@/components/portada/foto";
import { Hace } from "@/components/portada/hace";
import { Historias, type GrupoHistoria } from "@/components/portada/historias";
import { MapaPortada } from "@/components/portada/mapa-portada";
import { AvisoNuevas } from "@/components/portada/aviso-nuevas";
import { Pie } from "@/components/portada/pie";
import { inter } from "@/components/portada/fuente";
import { Teletipo } from "@/components/portada/teletipo";
import { TituloSeccion } from "@/components/portada/titulo-seccion";


export const revalidate = 300;

export const metadata: Metadata = {
  title: { absolute: "VANGUARD · El mundo en tiempo real — conflictos, mapa en vivo y última hora" },
  description:
    "Las noticias del mundo en tiempo real, en español: última hora de cada conflicto, mapa vivo, historias de 30 segundos y el cuartel de juego. Gratis y sin registro.",
  alternates: { canonical: "/" },
};

function elegirPortada(notas: Nota[]) {
  const ahora = Date.now();
  const usadas = new Set<string>();
  const tomar = (n: Nota | undefined) => {
    if (n) usadas.add(n.id);
    return n;
  };
  const candidatas = notas.slice(0, 24).filter((n) => n.imagen);
  const heroe = tomar(
    [...(candidatas.length ? candidatas : notas.slice(0, 24))].sort((a, b) => relevancia(b, ahora) - relevancia(a, ahora))[0]
  );
  const ultima = notas.filter((n) => !usadas.has(n.id)).slice(0, 5);
  ultima.forEach((n) => usadas.add(n.id));
  // variedad: máximo 2 notas por frente, con foto primero
  const porFrente: Record<string, number> = {};
  if (heroe?.conflicto) porFrente[heroe.conflicto] = 1;
  const destacadas: Nota[] = [];
  for (const n of notas
    .filter((x) => !usadas.has(x.id) && x.imagen)
    .sort((a, b) => relevancia(b, ahora) - relevancia(a, ahora))) {
    const k = n.conflicto ?? `reg-${n.region}`;
    if ((porFrente[k] ?? 0) >= 2) continue;
    porFrente[k] = (porFrente[k] ?? 0) + 1;
    destacadas.push(n);
    if (destacadas.length === 5) break;
  }
  destacadas.forEach((n) => usadas.add(n.id));
  return { heroe, ultima, destacadas, usadas };
}

function gruposHistorias(notas: Nota[]): GrupoHistoria[] {
  const mapear = (n: Nota) => ({ id: n.id, titulo: n.titulo, resumen: n.resumen, imagen: n.imagen, fuente: n.fuente, fecha: n.fecha });
  const grupos: GrupoHistoria[] = [];
  const hoy = notas.filter((n) => n.imagen).slice(0, 6);
  if (hoy.length) grupos.push({ key: "hoy", nombre: "Hoy", color: "#e8c56a", notas: hoy.map(mapear) });
  CONFLICTOS.map((c) => ({ c, ns: notas.filter((n) => n.conflicto === c.key) }))
    .filter((x) => x.ns.length > 0)
    .sort((a, b) => b.ns.length - a.ns.length)
    .forEach(({ c, ns }) =>
      grupos.push({ key: c.key, nombre: c.nombre, color: REGIONES[c.region].color, notas: ns.slice(0, 6).map(mapear), total: ns.length })
    );
  return grupos;
}

function coordsTexto(lat: number, lng: number) {
  return `${Math.abs(lat).toFixed(1)}°${lat >= 0 ? "N" : "S"} ${Math.abs(lng).toFixed(1)}°${lng >= 0 ? "E" : "O"}`;
}

const SALAS = [
  { href: "/en-vivo", titulo: "El Pulso", txt: "La última hora, minuto a minuto.", img: "/ilustraciones/envivo.jpg", tag: "En vivo" },
  { href: "/mundo", titulo: "El Mundo 3D", txt: "Todas las guerras sobre un globo vivo.", img: "/ilustraciones/multijugador.jpg", tag: "3D" },
  { href: "/vertigo", titulo: "El Vértigo", txt: "Las noticias en deslizamientos.", img: "/ilustraciones/pulso.jpg", tag: "Infinito" },
  { href: "/zona-cero", titulo: "Zona Cero", txt: "La ciudad en guerra, en directo.", img: "/ilustraciones/frente.jpg", tag: "Teatro" },
  { href: "/cuartel", titulo: "El Cuartel", txt: "Juego multijugador, misiones y ranking.", img: "/ilustraciones/mapa.jpg", tag: "Juego" },
];

export default async function Portada() {
  const notas = await obtenerNotas();
  const { heroe, ultima, destacadas, usadas } = elegirPortada(notas);
  const historias = gruposHistorias(notas);

  const regiones = (["europa", "oriente", "americas", "africa", "asia"] as Region[])
    .map((r) => {
      const propias = notas.filter((n) => n.region === r);
      const frescas = propias.filter((n) => !usadas.has(n.id));
      const base = frescas.length >= 4 ? frescas : propias;
      // con foto primero (las sin foto llevan el color de su región)
      const lista = [...base.filter((n) => n.imagen), ...base.filter((n) => !n.imagen)].slice(0, 8);
      return { r, lista };
    })
    .filter((x) => x.lista.length >= 3);

  return (
    <div className={`vx ${inter.variable}`}>
      <Cabecera ruta="/" />
      <Teletipo notas={notas} />
      <AvisoNuevas primera={notas[0]?.id ?? null} />

      <main className="vx-wrap">
        <div id="historias" className="vx-entra">
          <Historias grupos={historias} />
        </div>

        {heroe ? (
          <section className="vx-top" aria-label="Lo más importante ahora">
            <Link href={`/lectura/${heroe.id}`} className="vx-heroe vx-entra">
              <span className="vx-mira vx-esq" aria-hidden />
              <Foto src={heroe.imagen} alt={heroe.titulo} region={heroe.region} prioridad />
              <div className="vx-heroe-sellos" aria-hidden>
                <span>
                  <b>◆ PRIORIDAD ALFA</b> · CABLE 0001
                </span>
                {conflictoPorKey(heroe.conflicto) && (
                  <span>{coordsTexto(conflictoPorKey(heroe.conflicto)!.coords[0], conflictoPorKey(heroe.conflicto)!.coords[1])}</span>
                )}
              </div>
              <div className="vx-heroe-txt">
                <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                  <Etiqueta nota={heroe} />
                </div>
                <h1>{heroe.titulo}</h1>
                {heroe.resumen && <p>{heroe.resumen}</p>}
                <div className="vx-meta">
                  <b>{heroe.fuente}</b> · <Hace iso={heroe.fecha} />
                </div>
              </div>
            </Link>

            <aside className="vx-ult vx-entra-2" aria-label="Última hora">
              <div className="vx-ult-h">
                <h2>
                  <span className="vx-punto" /> Última hora
                </h2>
                <span className="vx-meta">{notas.length} cables</span>
              </div>
              <ol>
                {ultima.map((n) => (
                  <li key={n.id}>
                    <Link href={`/lectura/${n.id}`}>
                      <time dateTime={n.fecha}>{horaCorta(n.fecha)}</time>
                      <span>{n.titulo}</span>
                      <small>{n.fuente}</small>
                    </Link>
                  </li>
                ))}
              </ol>
              <Link href="/en-vivo" className="vx-ult-mas">
                Ver todo en vivo →
              </Link>
            </aside>
          </section>
        ) : (
          <section className="vx-sec">
            <div className="vx-caja">
              <h3>Las agencias no responden ahora mismo</h3>
              <p className="vx-meta">Vuelve en unos minutos o entra al <Link href="/en-vivo">canal en vivo</Link>.</p>
            </div>
          </section>
        )}

        {destacadas.length > 0 && (
          <section className="vx-sec" aria-label="Destacadas">
            <TituloSeccion sello="Sección 01 · Inteligencia" titulo="Lo que tienes que saber" sub="Las historias que más pesan hoy en el mundo." />
            <div className="vx-bento vx-entra-3">
              {destacadas.map((n, i) => (
                <Tarjeta key={n.id} nota={n} grande={i === 0} cable={i + 2} />
              ))}
            </div>
          </section>
        )}

        <section className="vx-sec" aria-label="Mapa de conflictos">
          <TituloSeccion sello="Sección 02 · Radar" titulo="El mapa vivo" sub="Dónde se mueve el mundo ahora mismo." enlace="/mundo" textoEnlace="Mapa 3D" />
          <MapaPortada notas={notas} />
        </section>

        {regiones.map(({ r, lista }) => (
          <section key={r} className="vx-sec" aria-label={REGIONES[r].nombre}>
            <TituloSeccion sello={`Teatro · ${REGIONES[r].nombre}`} color={REGIONES[r].color} titulo={REGIONES[r].nombre} enlace="/guerra-hoy" textoEnlace="Ver más" />
            <div className="vx-carr">
              {lista.map((n) => (
                <Tarjeta key={n.id} nota={n} />
              ))}
            </div>
          </section>
        ))}

        <section className="vx-sec" aria-label="Explora Vanguard">
          <TituloSeccion sello="Sección 03 · Las salas" titulo="Explora Vanguard" sub="Más que noticias: vive el mundo en 3D, en directo y jugando." />
          <div className="vx-salas">
            {SALAS.map((s) => (
              <Link key={s.href} href={s.href} className="vx-sala">
                <span className="vx-mira vx-esq" aria-hidden />
                <div className="vx-sala-bg" style={{ backgroundImage: `url(${s.img})` }} />
                <span className="vx-sello">{s.tag}</span>
                <h3>{s.titulo}</h3>
                <p>{s.txt}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Pie />
      <BarraMovil ruta="/" />
    </div>
  );
}
