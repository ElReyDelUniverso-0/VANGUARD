// ═══════════════════════════════════════════════════════════════════
// v416.0 · /datos-mundiales — EL EXPLORADOR DE ESTADÍSTICAS
// Departamento 4 · VANGUARD WORLD DATA
//
// Qué resuelve: hasta hoy, para ver una cifra de un país había que abrir su
// ficha (/mundos/[iso]) y para compararlo, el comparador de ocho indicadores.
// No existía una mesa donde elegir CUALQUIERA de los 52 indicadores, fijar un
// año o pedir el último dato de cada país, filtrar por región y ordenar la
// tabla. Esto es esa mesa.
//
// Todo se calcula en el servidor y se cachea 30 min: la página llega con los
// números dentro (sin spinner) y el enlace guarda indicador y año.
// ═══════════════════════════════════════════════════════════════════
import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/site";
import { MarcoDatos } from "@/components/mundial/marco-datos";
import { Controles } from "@/components/mundial/controles";
import { TablaRanking } from "@/components/mundial/tabla-ranking";
import { INDICADORES, CATEGORIAS, indicador as buscar, categoriaDe, VERSION_MUNDIAL } from "@/lib/mundial/catalogo";
import { rankingDeIndicador, catalogoPaises } from "@/lib/mundial/banco";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Centro de datos mundiales: 52 indicadores de 200 países con su fuente | VANGUARD",
  description:
    "Explora población, economía, educación, salud, energía, agricultura, comercio, medio ambiente y desarrollo país por país. Cada cifra con su año, su unidad, su fuente y su método. Tablas ordenables y comparador.",
  alternates: { canonical: `${SITE_URL}/datos-mundiales` },
};

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ExploradorPage({ searchParams }: Props) {
  const sp = await searchParams;
  const idIndicador = typeof sp.indicador === "string" ? sp.indicador : "poblacion";
  const ind = buscar(idIndicador) ?? INDICADORES[0];
  const anioCrudo = typeof sp.anio === "string" ? Number(sp.anio) : null;
  const anio = anioCrudo && Number.isFinite(anioCrudo) ? anioCrudo : null;

  const [ranking, paises] = await Promise.all([rankingDeIndicador(ind, { anio }), catalogoPaises()]);
  const regiones = [...new Set(paises.map((p) => p.region))].sort((a, b) => a.localeCompare(b, "es"));
  const cat = categoriaDe(ind.categoria);
  const aniosRanking = ranking.anios.length ? ranking.anios : [new Date().getFullYear() - 1];
  const fuente = ranking.disponible ? null : "El Banco Mundial no contestó a esta consulta en el momento de cargar la página.";

  return (
    <MarcoDatos
      activo="/datos-mundiales"
      volanta={`Mundo en cifras · Explorador · ${cat.nombre}`}
      titulo="El mundo en 52 indicadores"
      sub={
        <>
          Elige un indicador, un año y ordena la tabla. Cada fila lleva su cifra, su año y su fuente; cada indicador lleva su unidad y su método escritos
          al lado. Lo que el Banco Mundial no publica aparece como <b>sin dato</b>: la casa no estima ni rellena huecos.
        </>
      }
      cifras={[
        { valor: INDICADORES.length, etiqueta: "indicadores declarados", nota: `${CATEGORIAS.length} categorías con código, unidad y método` },
        { valor: paises.length, etiqueta: "países en el banco", nota: "Región y nivel de renta del propio Banco Mundial" },
        { valor: ranking.paisesConDato, etiqueta: "publican este indicador", nota: ranking.disponible ? `${ranking.paisesSinDato} sin dato en la fuente` : "fuente no disponible ahora" },
        { valor: VERSION_MUNDIAL, etiqueta: "versión del motor", nota: "Series con caché de 24 h en la plataforma" },
      ]}
    >
      <section className="vx-md-panel">
        <h2 className="vx-md-h2">1 · Elige qué mirar</h2>
        <p className="vx-md-h2-sub">
          El año importa: <b>«último dato de cada país»</b> llena la tabla pero mezcla años (cada fila trae el suyo); <b>«mismo año para todos»</b> deja
          países en «sin dato», y esa es la única forma de comparar filas de forma estricta.
        </p>
        <Controles base="/datos-mundiales" indicador={ind.id} anio={ranking.anio} anios={aniosRanking.slice(0, 24)} />
      </section>

      <section className="vx-md-panel" aria-labelledby="ficha-indicador">
        <div style={{ display: "flex", gap: 18, flexWrap: "wrap", justifyContent: "space-between" }}>
          <div style={{ flex: "1 1 520px" }}>
            <h2 className="vx-md-h2" id="ficha-indicador">
              {ind.nombre}
            </h2>
            <p className="vx-md-h2-sub" style={{ marginBottom: 10 }}>
              <b>{ind.pregunta}</b> · Unidad: {ind.unidad} · Código de la fuente: <code>{ind.codigo}</code> · Sentido:{" "}
              {ind.sentido === "alto" ? "más alto, mejor situación" : ind.sentido === "bajo" ? "más bajo, mejor situación" : "sin dirección (es una medida, no una nota)"}
            </p>
            <div className="vx-md-aviso teal">
              <b>Cómo se calcula:</b> {ind.metodo}
            </div>
          </div>
          <div style={{ flex: "0 0 280px" }}>
            <div className="vx-md-aviso">
              <b>Procedencia</b>
              <br />
              {ind.fuente}
              <br />
              Licencia: {ind.licencia}
              <br />
              <a href={ind.urlDefinicion} target="_blank" rel="noreferrer noopener">
                Definición original del Banco Mundial →
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="vx-md-panel">
        <h2 className="vx-md-h2">2 · Ranking{ranking.anio ? ` de ${ranking.anio}` : " con el último dato de cada país"}</h2>
        <p className="vx-md-h2-sub">
          Ordena por cualquier columna, filtra por región y busca tu país. El orden de partida pone primero la mejor situación según el sentido del
          indicador; puedes invertirlo haciendo clic en la cabecera.
        </p>
        {fuente ? <div className="vx-md-aviso rojo">{fuente}</div> : null}
        {ranking.disponible ? (
          <TablaRanking filas={ranking.filas} indicador={ind} regiones={regiones} modo={ranking.modo} />
        ) : (
          <p className="vx-md-sin">Sin datos disponibles en este momento: el proveedor no ha contestado.</p>
        )}
        <p className="vx-md-meta" style={{ marginTop: 10 }}>
          Consulta: {new Date(ranking.consultado).toLocaleString("es-ES")} · {ranking.paisesConDato} países con dato ·{" "}
          {ranking.paisesSinDato} sin dato. Los agregados regionales del Banco Mundial (por ejemplo «América Latina y el Caribe») se excluyen a
          propósito: aquí solo hay países.
        </p>
      </section>

      <section className="vx-md-panel">
        <h2 className="vx-md-h2">3 · Sigue por donde quieras</h2>
        <div className="vx-md-rejilla vx-md-4">
          <Link href={`/datos-mundiales/comparar?paises=do,ht&indicadores=${ind.id}`} className="vx-md-cifra" style={{ textDecoration: "none" }}>
            <b>Comparar</b>
            <span>Comparador mundial</span>
            <small>Dos a cuatro países y hasta seis indicadores, con gráficos y la diferencia explicada en una frase.</small>
          </Link>
          <Link href={`/datos-mundiales/pais/do?cat=${ind.categoria}`} className="vx-md-cifra" style={{ textDecoration: "none" }}>
            <b>Ficha</b>
            <span>Datos de un país</span>
            <small>Todos los indicadores de una categoría para un país, con su año, su fuente y su mini-serie.</small>
          </Link>
          <Link href={`/datos-mundiales/panel?indicador=${ind.id}`} className="vx-md-cifra" style={{ textDecoration: "none" }}>
            <b>Panel</b>
            <span>Desarrollo mundial</span>
            <small>La serie del planeta y de sus regiones, con los agregados oficiales del Banco Mundial.</small>
          </Link>
          <Link href="/datos" className="vx-md-cifra" style={{ textDecoration: "none" }}>
            <b>Origen</b>
            <span>Catálogo de la casa</span>
            <small>De dónde sale cada dato que usa Vanguard, con su licencia y su límite declarados.</small>
          </Link>
        </div>
      </section>

      <section className="vx-md-panel">
        <h2 className="vx-md-h2">Cómo se lee esta página (y qué no promete)</h2>
        <ul className="vx-md-lista">
          <li>
            <b>Cada cifra lleva su año.</b> No hay una sola celda sin año: si dos países tienen años distintos, la tabla lo enseña en la columna
            «Año» en vez de callarlo.
          </li>
          <li>
            <b>Los huecos son huecos.</b> «sin dato» significa que el Banco Mundial no publica ese valor para ese país en ese año. No se interpola, no se
            copia el año anterior y no se estima.
          </li>
          <li>
            <b>«Más alto» no siempre es «mejor».</b> El sentido de cada indicador se declara en su ficha: una mortalidad infantil alta es peor, una
            superficie grande no es ni una cosa ni la otra.
          </li>
          <li>
            <b>Una sola fuente por serie.</b> No se mezclan el Banco Mundial, la ONU y la OCDE en la misma línea: sería imposible saber de quién es cada
            tramo. Las otras fuentes se citan como contraste.
          </li>
          <li>
            <b>Esto no es una predicción.</b> Son series publicadas; la casa no proyecta, no modela y no promete a dónde va un país.
          </li>
        </ul>
      </section>
    </MarcoDatos>
  );
}
