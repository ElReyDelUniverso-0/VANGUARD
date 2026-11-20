// ═══════════════════════════════════════════════════════════════════
// v422.1 REBIRTH · LA PORTADA VIVA — experiencias editoriales hechas con
// datos REALES de la casa, no con tarjetas de relleno.
//
// QUÉ ES: cuatro «aperturas» de otras tantas familias, elegidas por el día
// (deterministas: el mismo día da la misma selección, así la caché y el
// visitante ven lo mismo) y sacadas de los datos que ya publican las salas:
//   · una publicación del índice científico (con su DOI y su nivel),
//   · un expediente de memoria (con sus fechas y lo que NO tiene),
//   · una obra del atlas de infraestructura (con su país y su fecha),
//   · una ficha de país de las 249.
//
// HONESTIDAD: no hay curaduría manual ni texto inventado. Cada apertura dice
// de dónde sale y enlaza al registro completo; si el dato no está documentado
// (una fecha, por ejemplo) se dice, no se rellena.
// ═══════════════════════════════════════════════════════════════════

import Link from "next/link";
import { PUBLICACIONES, DISCIPLINAS } from "@/lib/ciencia/indice";
import { ACONTECIMIENTOS } from "@/lib/memoria/acontecimientos";
import { CATALOGO_INFRA } from "@/lib/infraestructura/catalogo";
import { PAISES_GEO } from "@/lib/geo-paises";

/** Día absoluto: mismo valor durante toda la jornada, distinto mañana. */
function diaActual(): number {
  return Math.floor(Date.now() / 86_400_000);
}

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

function fechaLarga(iso: string): string {
  const [a, m, d] = iso.split("-").map(Number);
  if (!a || !m || !d) return iso;
  return `${d} de ${MESES[m - 1]} de ${a}`;
}

type Apertura = {
  clave: string;
  familia: string;
  color: string;
  img: string;
  ceja: string;
  titulo: string;
  contexto: string;
  dato: string;
  pie: string;
  href: string;
  puerta: string;
  puertaNombre: string;
};

function aperturas(): Apertura[] {
  const dia = diaActual();

  // ① CIENCIA — la publicación más reciente dentro de las cinco últimas.
  const recientes = [...PUBLICACIONES]
    .sort((a, b) => (a.fecha < b.fecha ? 1 : a.fecha > b.fecha ? -1 : 0))
    .slice(0, 5);
  const pub = recientes[dia % Math.max(recientes.length, 1)];
  const disciplina = pub ? DISCIPLINAS.find((d) => d.id === pub.disciplinaId) : undefined;

  // ② MEMORIA — un expediente histórico del archivo.
  const aco = ACONTECIMIENTOS[dia % ACONTECIMIENTOS.length];

  // ③ INFRAESTRUCTURA — una obra documentada del atlas.
  const obra = CATALOGO_INFRA[dia % CATALOGO_INFRA.length];

  // ④ GEOGRAFÍA — una ficha de país de las 249.
  const pais = PAISES_GEO[dia % PAISES_GEO.length];

  const lista: Apertura[] = [];

  if (pub) {
    lista.push({
      clave: "ciencia",
      familia: "Ciencia",
      color: "#22d3ee",
      img: "/ilustraciones/estudio.jpg",
      ceja: `${pub.medio} · ${pub.anio} · ${pub.nivelEtiqueta}${disciplina ? ` · ${disciplina.nombre}` : ""}`,
      titulo: pub.titulo,
      contexto: pub.lectura,
      dato: `Identificador real: ${pub.identificador} (${pub.idTipo.toUpperCase()})`,
      pie: pub.cautela,
      href: `/ciencia/publicacion/${pub.id}`,
      puerta: "/ciencia",
      puertaNombre: "Science Frontier",
    });
  }

  if (aco) {
    const rango = aco.desde === aco.hasta ? `${aco.desde}` : `${aco.desde}–${aco.hasta}`;
    lista.push({
      clave: "historia",
      familia: "Historia",
      color: "#e8c56a",
      img: "/ilustraciones/historia.jpg",
      ceja: `${aco.volanta} · ${rango}`,
      titulo: aco.titulo,
      contexto: aco.resumen,
      dato: `${aco.piezas.length} ${aco.piezas.length === 1 ? "pieza documentada" : "piezas documentadas"} · ${aco.paises.length} ${aco.paises.length === 1 ? "país" : "países"} en el expediente`,
      pie: aco.noEsta[0] ? `Lo que este expediente NO tiene: ${aco.noEsta[0]}` : "",
      href: `/memoria/acontecimiento/${aco.slug}`,
      puerta: "/memoria",
      puertaNombre: "Memoria",
    });
  }

  if (obra) {
    lista.push({
      clave: "datos",
      familia: "Obras y datos",
      color: "#5eead4",
      img: "/ilustraciones/estadisticas.jpg",
      ceja: `${obra.categoria.replace(/-/g, " ")} · ${obra.ubicacion.ciudad} · ${obra.pais.toUpperCase()}`,
      titulo: obra.nombre,
      contexto: obra.descripcion,
      dato: obra.fecha ? `Fecha documentada: ${obra.fecha}` : "Fecha: sin dato documentado",
      pie: `Verificación: ${obra.verificacion}`,
      href: `/infraestructura/obra/${obra.id}`,
      puerta: "/infraestructura",
      puertaNombre: "Atlas de infraestructura",
    });
  }

  if (pais) {
    lista.push({
      clave: "geografia",
      familia: "Geografía",
      color: "#3ddcff",
      img: "/ilustraciones/mapa.jpg",
      ceja: `${pais.region} · ${pais.subregion}`,
      titulo: pais.nombre,
      contexto: `Ficha completa del país: geografía real, indicadores con su año y su fuente, historia y sus puertas a la simulación.`,
      dato: `Coordenadas de referencia: ${pais.lat.toFixed(2)}°, ${pais.lng.toFixed(2)}°`,
      pie: "Doce capas de datos, ninguna cifra sin procedencia.",
      href: `/mundos/${pais.iso2}`,
      puerta: "/mundos",
      puertaNombre: "Fichas de país",
    });
  }

  return lista;
}

export function PortadaViva() {
  const items = aperturas();
  if (items.length === 0) return null;

  return (
    <section id="viva" className="vxe-viva vxp-ancla" aria-labelledby="vxe-viva-titulo">
      <header className="vxe-viva-cab">
        <p className="vxe-viva-sello">Sección 02 · Portada viva</p>
        <h2 id="vxe-viva-titulo" className="vxe-viva-titulo">
          Cuatro aperturas de hoy
        </h2>
        <p className="vxe-viva-sub">
          No es una selección editorial a mano: cada día la casa abre cuatro registros reales de
          sus propias salas —una publicación, un expediente, una obra y un país— con su fuente y
          su límite a la vista.
        </p>
      </header>

      <div className="vxe-viva-lista">
        {items.map((a, i) => (
          <article key={a.clave} className="vxe-apertura" style={{ ["--eje" as string]: a.color }}>
            <span className="vxe-apertura-fondo" style={{ backgroundImage: `url(${a.img})` }} aria-hidden />
            <div className="vxe-apertura-caja">
              <p className="vxe-apertura-ceja">
                <span className="vxe-apertura-familia">{a.familia}</span>
                <span className="vxe-apertura-sep" aria-hidden>·</span>
                {a.ceja}
              </p>
              <h3 className="vxe-apertura-titulo">
                <Link href={a.href}>{a.titulo}</Link>
              </h3>
              <p className="vxe-apertura-contexto">{a.contexto}</p>
              <p className="vxe-apertura-dato">{a.dato}</p>
              {a.pie ? <p className="vxe-apertura-pie">{a.pie}</p> : null}
              <p className="vxe-apertura-acciones">
                <Link href={a.href} className="vxe-apertura-abrir">
                  Abrir el registro <span aria-hidden>→</span>
                </Link>
                <Link href={a.puerta} className="vxe-apertura-puerta">
                  {a.puertaNombre}
                </Link>
                <span className="vxe-apertura-num" aria-hidden>
                  0{i + 1}
                </span>
              </p>
            </div>
          </article>
        ))}
      </div>

      <p className="vxe-viva-nota">
        La selección rota cada día y es la misma para todos los visitantes del día; no se
        personaliza ni se inventa. Si un registro no está, su hueco no se rellena.
      </p>
    </section>
  );
}
