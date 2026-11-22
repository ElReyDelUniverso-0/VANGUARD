// ═══════════════════════════════════════════════════════════════════
// v400.0 EL REDISEÑO — LA PORTADA NUEVA.
// Mandato del Dueño (2026-11-14, «UN SUPER SÍ» a las 10 soluciones):
// ① una sola cabecera · ② la noticia grande al abrir (adiós pantalla negra
// y tutorial) · ③ cuadrícula tipo revista · ④ textos cortos · ⑤ colores y
// letras modernas · ⑥ móvil tipo app, cero ventanitas flotantes ·
// ⑦ historias por conflicto · ⑧ el mapa vivo a la vista · ⑨ movimiento ·
// ⑩ confianza: un idioma, fotos reales de cada nota, fechas de verdad.
// El cuartel de siempre (juego y salas) vive intacto en /cuartel.
// ───────────────────────────────────────────────────────────────────
// v406.2 MISIÓN 2 — LA PORTADA TRANSFORMADA. Todo lo de v400 sigue (historias,
// noticia grande, última hora, destacadas, módulos, spot, mapa, teatros y
// salas) y se SUMA: el héroe que dice qué es Vanguard (con índice rápido),
// las ocho puertas (mundos, noticias, mapas, simuladores, información,
// historia, educación y documentales), «Descubre hoy» con el archivo real
// rotando cada día y «Lo nuevo en la casa» desde la bitácora. Cada enlace
// lleva a su módulo real — nada de páginas vacías.
// ═══════════════════════════════════════════════════════════════════
import type { Metadata } from "next";
import Link from "next/link";
import "./portada.css";
import { obtenerNotas, relevancia, type Nota } from "@/lib/portada/notas";
import { CONFLICTOS, REGIONES, conflictoPorKey, haceTexto, horaCorta, type Region } from "@/lib/portada/clasificar";
import { Cabecera, BarraMovil } from "@/components/portada/cabecera";
import { Tarjeta, Etiqueta } from "@/components/portada/tarjeta";
import { Foto } from "@/components/portada/foto";
import { Hace } from "@/components/portada/hace";
import { Historias, type GrupoHistoria } from "@/components/portada/historias";
import { MapaPortada } from "@/components/portada/mapa-portada";
import { TiraWarHumanity } from "@/components/guerra/tira-war-humanity";
import { AvisoNuevas } from "@/components/portada/aviso-nuevas";
import { Pie } from "@/components/portada/pie";
import { inter } from "@/components/portada/fuente";
import { Teletipo } from "@/components/portada/teletipo";
import { gruposHistorias } from "@/lib/portada/frentes";
import { TituloSeccion } from "@/components/portada/titulo-seccion";
import { SpotPortada } from "@/components/portada/spot-portada";
import { ModulosRejilla } from "@/components/portada/modulos-rejilla";
import { BarraExplorar } from "@/components/portada/barra-explorar";
import { VotacionTarjeta } from "@/components/portada/votacion-tarjeta";
import { MODULOS_PUBLICOS } from "@/components/portada/modulos";
// v406.0 LA TRAVESÍA — el hilo (continúa donde lo dejaste) y la puerta a la entrada inmersiva
import { HiloPortada } from "@/components/travesia/hilo-portada";
import { DescubreHoy, NovedadesPortada } from "@/components/portada/portada-nueva";
// v436.7 · EL TALLER DE MAPAS, en la portada: una herramienta que se ve antes de
// que nadie la busque. Componente de servidor: cero JavaScript extra.
import { EscaparateTaller } from "@/components/mapas/escaparate-taller";
import { ParaTi } from "@/components/vida/para-ti";
// v422.1 REBIRTH · la entrada del ecosistema (MISIÓN: dejar de ser «un diario
// con módulos» y ser una casa con diez familias). Tres piezas nuevas, todas
// de servidor: la entrada cinematográfica, el mapa de las diez familias y la
// portada viva con cuatro registros reales elegidos por día.
import "@/components/experiencia/experiencia.css";
import { Entrada } from "@/components/experiencia/entrada";
// v437.2 · EL MERCADO (orden del Dueño): las diez familias ya no ocupan la
// portada. Queda una franja de una fila con los diez toldos y la puerta a
// /mercado, donde cada familia tiene su puesto y su mercader.
import { MercadoPortada } from "@/components/mercado/mercado-portada";
import { PortadaViva } from "@/components/experiencia/portada-viva";
import { FocoAcademiaMotores } from "@/components/portada/foco-academia-motores";
// v432.0 EL TRÁILER
import { TrailerVanguard } from "@/components/trailer/trailer-vanguard";


export const revalidate = 300;

export const metadata: Metadata = {
  title: { absolute: "VANGUARD · El mundo en tiempo real — conflictos, mapa en vivo y última hora" },
  description:
    "Vanguard, el mundo en tiempo real y en español: última hora de cada conflicto, mapas vivos, simuladores, historia, educación, documentales y el cuartel de juego. Gratis.",
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


function coordsTexto(lat: number, lng: number) {
  return `${Math.abs(lat).toFixed(1)}°${lat >= 0 ? "N" : "S"} ${Math.abs(lng).toFixed(1)}°${lng >= 0 ? "E" : "O"}`;
}

const SALAS = [
  { href: "/en-vivo", titulo: "El Pulso", txt: "La última hora, minuto a minuto.", img: "/imagenes-reales/satelite.jpg", tag: "En vivo" },
  { href: "/mundo", titulo: "El Mundo 3D", txt: "Todas las guerras sobre un globo vivo.", img: "/imagenes-reales/dubai.jpg", tag: "3D" },
  { href: "/vertigo", titulo: "El Vértigo", txt: "Las noticias en deslizamientos.", img: "/imagenes-reales/satelite.jpg", tag: "Infinito" },
  { href: "/zona-cero", titulo: "Zona Cero", txt: "La ciudad en guerra, en directo.", img: "/imagenes-reales/portaaviones.jpg", tag: "Teatro" },
  { href: "/cuartel", titulo: "El Cuartel", txt: "Juego multijugador, misiones y ranking.", img: "/imagenes-reales/satelite.jpg", tag: "Juego" },
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

  // v431.3 · los frentes que se ven en la entrada son los de VERDAD: se cuentan
  // los cables de la portada por conflicto. Si mañana no hay noticias de Gaza,
  // Gaza desaparece de la entrada sola; no hay lista escrita a mano.
  const cuenta: Record<string, number> = {};
  for (const n of notas) {
    if (n.conflicto) cuenta[n.conflicto] = (cuenta[n.conflicto] ?? 0) + 1;
  }
  const frentes = Object.entries(cuenta)
    .map(([key, n]) => ({ key, nombre: conflictoPorKey(key)?.nombre ?? key, n }))
    .sort((a, b) => b.n - a.n)
    .slice(0, 6);
  // la hora del sello es la del render (la página se regenera cada 5 min)
  const hora = new Date().toISOString().slice(11, 16);

  return (
    <div className={`vx ${inter.variable}`}>
      <Cabecera ruta="/" />

      {/* v431.3 · PRIMERO LA CASA SE EXPLICA — el Dueño, textual: «cuando entro
          que sepa dónde uno entra a VANGUARD, porque VANGUARD nunca se explica
          el mismo». El teletipo (una tira que se mueve) iba delante y no decía
          nada a quien llegaba de un enlace: ahora abre LA ENTRADA y el teletipo
          pasa justo detrás, como la última hora de lo que acabas de entender. */}
      <Entrada
        cables={notas.length}
        frentes={frentes}
        hora={hora}
        titular={
          heroe
            ? {
                titulo: heroe.titulo,
                fuente: heroe.fuente,
                href: `/lectura/${heroe.id}`,
                hace: haceTexto(heroe.fecha),
              }
            : null
        }
      />
      <Teletipo notas={notas} />
      <AvisoNuevas primera={notas[0]?.id ?? null} />

      {/* NOVEDADES 2026: Vanguard Academy y Laboratorio de Motores */}
      <FocoAcademiaMotores />

      <main className="vx-wrap">
        {/* v431.4 · ORDEN DE LECTURA PARA EL QUE LLEGA — el Dueño: «uno se
            pierde mucho». La portada tenía DOCE bloques seguidos y la noticia
            grande estaba en el sexto: nadie llegaba. Ahora, después de la
            entrada, solo tres cosas: qué pasa ahora, qué hay dentro y dónde.
            Todo lo demás sigue existiendo, plegado al final (details), para el
            que quiera bajar. */}
        {heroe ? (
          <section id="ahora" className="vx-top vxp-ancla vxp-top" aria-label="Lo más importante ahora">
            <Link href={`/lectura/${heroe.id}`} className="vx-heroe vx-entra">
              <span className="vx-mira vx-esquinas" aria-hidden />
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
                <h2 className="vxp-titular">{heroe.titulo}</h2>
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
          <section id="ahora" className="vx-sec vxp-ancla">
            <div className="vx-caja">
              <h3>Las agencias no responden ahora mismo</h3>
              <p className="vx-meta">Vuelve en unos minutos o entra al <Link href="/en-vivo">canal en vivo</Link>.</p>
            </div>
          </section>
        )}


        {/* v432.0 · EL TRÁILER — Vanguard explicado en 80 segundos, a la vista
            (no plegado): capítulos que saltan a cada sala del vídeo. v439.0
            ORDEN: el spot de 30 segundos (que vivía apilado a continuación)
            vive ahora DENTRO de esta sección, para que no haya dos promos
            apilando bloques. */}
        <section id="trailer" className="vx-sec vxp-ancla" aria-label="El tráiler de Vanguard">
          <TituloSeccion sello="Sección · El tráiler" titulo="Vanguard en 80 segundos" sub="Todo lo que hay en esta casa, contado con sus propias pantallas." enlace="/trailer" textoEnlace="Sala de proyección" />
          <TrailerVanguard compacto />
          <div className="vxp-spot-c">
            <SpotPortada />
          </div>
        </section>

        {/* v437.2 · EL MERCADO — las diez familias ya no se despliegan aquí: viven
            en /mercado, cada una en su puesto con su mercader. La portada solo
            enseña la franja con los diez toldos (una fila) y la entrada. */}
        <MercadoPortada />

        {/* v439.6 · LA VOTACIÓN DEL MUNDO — algo nuevo, original y nunca antes
            visto: una pregunta del día para todo el planeta. Determinista y
            predecible: el tablero es el mismo para todos por fecha, y la
            pregunta de mañana ya se sabe hoy. */}
        <VotacionTarjeta />

        <section id="mapa" className="vx-sec vxp-ancla" aria-label="Mapa de conflictos">
          <TituloSeccion sello="Sección 07 · Radar" titulo="El mapa vivo" sub="Dónde se mueve el mundo ahora mismo." enlace="/mundo" textoEnlace="Mapa 3D" />
          <MapaPortada notas={notas} />
        </section>

        {/* v441.0 · WAR & HUMANITY — la sala nueva también se ve desde la puerta
            de la casa: muertes en combate del último año, desplazados por la
            fuerza y los tres países donde más se muere, cada cifra con su
            fuente. Componente de servidor sobre la instantánea real. */}
        <section id="guerra" className="vx-sec vxp-ancla" aria-label="War & Humanity">
          <TituloSeccion sello="Sala nueva · El mundo" titulo="Dónde se muere y cuántos han tenido que huir" sub="La sala nueva del centro mundial: cada cifra con su fuente, su año y su límite." enlace="/war-humanity" textoEnlace="Abrir la sala" />
          <TiraWarHumanity />
        </section>

        {/* v436.7 · EL TALLER DE MAPAS — orden del Dueño: «no he visto nada de lo
            que agregaste, mejóralo y púlelo más, que diga wow». La herramienta
            existía y no la encontraba nadie: ahora tiene su franja grande en la
            portada, con el planeta en miniatura y las dos puertas. */}
        <section id="taller" className="vx-sec vxp-ancla" aria-label="El Taller de Mapas">
          <TituloSeccion sello="Sección · Herramientas" titulo="El Taller de Mapas" sub="Crear un mapa 2D o 3D con tus puntos, tus fichas y tus fuentes — y sacarlo de la casa." enlace="/mapas/taller" textoEnlace="Abrir el taller" />
          <EscaparateTaller />
        </section>


        {/* v422.1 · LA PORTADA VIVA — cuatro registros reales abiertos cada día */}
        <PortadaViva />

        {/* v421.9 VIDA · PARA TI — el carril que aprende de tus impresiones */}
        <ParaTi />

        <div id="historias" className="vx-entra">
          <TituloSeccion sello="Sección 03 · El mundo, hoy" titulo="Las historias del día" sub="Cada frente abierto, con sus cables y su hora." enlace="/conflictos" textoEnlace="Todos los conflictos" />
          <Historias grupos={historias} />
        </div>

        {destacadas.length > 0 && (
          <section className="vx-sec" aria-label="Destacadas">
            <TituloSeccion sello="Sección 04 · Inteligencia" titulo="Lo que tienes que saber" sub="Las historias que más pesan hoy en el mundo." />
            <div className="vx-bento vx-entra-3">
              {destacadas.map((n, i) => (
                <Tarjeta key={n.id} nota={n} grande={i === 0} cable={i + 2} />
              ))}
            </div>
          </section>
        )}

        {/* v406.2 DESCUBRE HOY — el archivo real de la casa, distinto cada día */}
        <section id="descubre" className="vx-sec vxp-ancla" aria-label="Descubre hoy">
          <TituloSeccion sello="Sección 05 · Descubre" titulo="Descubre hoy" sub="Seis hallazgos del archivo de Vanguard que cambian cada día." enlace="/archivo-mundial" textoEnlace="Archivo mundial" />
          <DescubreHoy />
        </section>

        {/* v402.6 LOS NUEVE MÓDULOS — lo que la casa tiene además de noticias, a la vista */}
        <section id="modulos" className="vx-sec vxp-ancla" aria-label="Los módulos de Vanguard">
          <TituloSeccion sello={`Sección 06 · ${MODULOS_PUBLICOS.length} módulos`} titulo="Mucho más que noticias" sub="Países en cifras, conocimiento, secretos, arsenal, datos vivos, medios y juego: elige por dónde entrar." enlace="/modulos" textoEnlace="Todos los módulos" />
          <ModulosRejilla compacta />
          <BarraExplorar />
        </section>

        {/* ── LO DEMÁS, PLEGADO ─────────────────────────────────────────
            Existe todo lo de antes (historias por frente, destacadas, descubre,
            los teatros por región, la bitácora y las salas),
            pero no se le echa encima a quien entra. Se abre con un clic, sin
            JavaScript: es un <details> de verdad. ── */}
        <details className="vx-mas">
          <summary>
            <span className="vx-mas-rotulo">todo lo demás de la portada</span>
            <span className="vx-mas-sub">historias por frente · destacadas · descubre hoy · módulos · el spot · teatros por región · bitácora · salas</span>
            <span className="vx-mas-abrir" aria-hidden />
          </summary>
          <div className="vx-mas-cuerpo">
            {/* el hilo: sigue donde lo dejaste */}
            <HiloPortada />

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

        {/* v406.2 LO NUEVO EN LA CASA — la bitácora, las tres últimas entregas */}
        <section id="novedades" className="vx-sec vxp-ancla" aria-label="Lo nuevo en Vanguard">
          <TituloSeccion sello="Sección 08 · Bitácora" titulo="Lo nuevo en la casa" sub="Las tres últimas entregas de Vanguard, con lo que cambió." enlace="/novedades" textoEnlace="Todas las novedades" />
          <NovedadesPortada />
        </section>

        <section className="vx-sec" aria-label="Las salas favoritas">
          <TituloSeccion sello="Sección 09 · Las salas" titulo="Explora Vanguard" sub="Las salas favoritas de la casa: en 3D, en directo y jugando." />
          <div className="vx-salas">
            {SALAS.map((s) => (
              <Link key={s.href} href={s.href} className="vx-sala">
                <span className="vx-mira vx-esquinas" aria-hidden />
                <div className="vx-sala-bg" style={{ backgroundImage: `url(${s.img})` }} />
                <span className="vx-sello">{s.tag}</span>
                <h3>{s.titulo}</h3>
                <p>{s.txt}</p>
              </Link>
            ))}
          </div>
        </section>
          </div>
        </details>
      </main>

      <Pie />
      <BarraMovil ruta="/" />
    </div>
  );
}
