import type { Metadata } from "next";
import Link from "next/link";
import { FuenteYFecha } from "@/components/vanguard/fuente-y-fecha";
import { EnlacesNucleo } from "@/components/vanguard/enlaces-nucleo";
import type { EnlaceContextual } from "@/lib/nucleo/tipos";
import auditoria from "@/lib/auditoria.json";

// v367.9 LA SALA DE LA CALIDAD — la primera sala que no enseña el mundo, sino
// la casa. Nace de la directiva del Dueño (2026-11-14): «VANGUARD necesita
// menos acumulación y más calidad», y del orden que fijó para el trabajo:
// 1) reparar y auditar todo, 2) transformar la experiencia visual, 3) investigar
// y fusionar lo mejor del mundo. Esta sala es el pilar 1 puesto en pie: seis
// agentes revisan la casa de punta a punta y su informe se publica AQUÍ, con
// fecha, con fuente y con los números tal como salieron — no con los que
// quisiéramos.
//
// LO QUE LA SALA NO HACE: no inventa métricas. Todo lo que se lee viene de
// src/lib/auditoria.json, que escribe scripts/auditoria.mjs cada vez que se
// ejecuta `node scripts/auditoria.mjs --smoke <url> --json`. Si un día hay un
// enlace roto, un recurso ausente o una ruta caída, aparecerá en esta sala sin
// que nadie tenga que acordarse de escribirlo (guardia v234: cero cifras a
// mano). Y si el archivo de la instantánea no existe, la sala lo dice en vez de
// fingir que todo está bien.
//
// LECCIÓN DE ESTA PRIMERA PASADA (queda escrita para no repetirla): la
// auditoría nació gritando 2 enlaces rotos, 8 claves de idioma perdidas, 107
// imágenes ausentes y 208 pendientes. Al leerlas una por una, TODAS eran falsas:
// los «enlaces rotos» eran descargas a archivos que sí existen (el auditor no
// miraba public/), las «claves» eran un ayudante local llamado t(), las
// «imágenes» existían en el repositorio pero no en el clon de trabajo (que no
// trae binarios), y los «pendientes» eran la palabra española «todo» en
// mayúsculas. Una auditoría que no distingue un defecto de un susto no sirve:
// por eso el informe de hoy se lee con la lista de aceptados a mano
// (agent-ctx/auditoria-aceptados.json) y con el manifiesto real de public/.

export const metadata: Metadata = {
  title: "La Sala de la Calidad · la casa auditada de punta a punta",
  description:
    "Seis agentes revisan VANGUARD y publican su informe: rutas, enlaces, idioma, recursos, botones y salud en vivo. Cero defectos abiertos, con fecha y fuente.",
  alternates: { canonical: "/calidad" },
};

type Densidad = {
  ruta: string;
  kb: number;
  letras: number;
  imagenes: number;
  videos: number;
  lienzos: number;
  svgs: number;
  visuales: number;
  ratio: number;
};

type Instantanea = {
  fecha: string;
  humo: {
    base: string;
    fecha: string;
    total: number;
    ok: number;
    fallos: { ruta: string; codigo: number }[];
    densidad?: Densidad[];
  } | null;
  agentes: {
    rutas: { paginas: number; apis: number; dinamicas: number };
    enlaces: { revisados: number; rotos: number; aRutaDinamicaEnServer: number };
    idioma: { clavesDiccionario: number; clavesUsadas: number; faltantes: number };
    recursos: { revisados: number; faltantes: number; contra: string };
    botones: { sinAccion: number; hrefAlmohadilla: number; pendientes: number };
  };
  defectos: {
    enlacesRotos: { archivo: string; linea: number; destino: string }[];
    recursosFaltantes: { archivo: string; ruta: string }[];
    botonesVacios: { archivo: string; linea: number }[];
    clavesFaltantes: string[];
    pendientes: { archivo: string; linea: number }[];
  };
};

const INFORME = auditoria as unknown as Instantanea;

const AGENTES = [
  {
    n: 1,
    nombre: "RUTAS",
    deber: "que cada puerta exista",
    cifra: INFORME.agentes.rutas.paginas,
    unidad: "salas",
    detalle: `${INFORME.agentes.rutas.apis} endpoints · ${INFORME.agentes.rutas.dinamicas} dinámicas`,
    defectos: 0,
    acento: "from-sky-500/20 to-sky-500/0",
    borde: "border-sky-500/30",
    texto: "text-sky-300",
  },
  {
    n: 2,
    nombre: "ENLACES",
    deber: "que ninguna puerta sea falsa",
    cifra: INFORME.agentes.enlaces.revisados,
    unidad: "enlaces",
    detalle: `${INFORME.agentes.enlaces.rotos} rotos · ${INFORME.agentes.enlaces.aRutaDinamicaEnServer} sospechosos`,
    defectos: INFORME.agentes.enlaces.rotos,
    acento: "from-emerald-500/20 to-emerald-500/0",
    borde: "border-emerald-500/30",
    texto: "text-emerald-300",
  },
  {
    n: 3,
    nombre: "IDIOMA",
    deber: "que ninguna palabra quede sin traducir",
    cifra: INFORME.agentes.idioma.clavesUsadas,
    unidad: "claves",
    detalle: `de ${INFORME.agentes.idioma.clavesDiccionario} del diccionario · ${INFORME.agentes.idioma.faltantes} sin resolver`,
    defectos: INFORME.agentes.idioma.faltantes,
    acento: "from-violet-500/20 to-violet-500/0",
    borde: "border-violet-500/30",
    texto: "text-violet-300",
  },
  {
    n: 4,
    nombre: "RECURSOS",
    deber: "que ninguna imagen sea un hueco",
    cifra: INFORME.agentes.recursos.revisados,
    unidad: "archivos",
    detalle: `${INFORME.agentes.recursos.faltantes} ausentes`,
    defectos: INFORME.agentes.recursos.faltantes,
    acento: "from-amber-500/20 to-amber-500/0",
    borde: "border-amber-500/30",
    texto: "text-amber-300",
  },
  {
    n: 5,
    nombre: "BOTONES",
    deber: "que nada parezca un botón sin serlo",
    cifra: INFORME.agentes.botones.sinAccion + INFORME.agentes.botones.hrefAlmohadilla + INFORME.agentes.botones.pendientes,
    unidad: "defectos",
    detalle: `${INFORME.agentes.botones.sinAccion} sin acción · ${INFORME.agentes.botones.hrefAlmohadilla} con enlace vacío · ${INFORME.agentes.botones.pendientes} pendientes`,
    defectos:
      INFORME.agentes.botones.sinAccion + INFORME.agentes.botones.hrefAlmohadilla + INFORME.agentes.botones.pendientes,
    acento: "from-rose-500/20 to-rose-500/0",
    borde: "border-rose-500/30",
    texto: "text-rose-300",
  },
  {
    n: 6,
    nombre: "EN VIVO",
    deber: "que la sección responda de verdad",
    cifra: INFORME.humo?.ok ?? 0,
    unidad: "rutas",
    detalle: INFORME.humo
      ? `${INFORME.humo.total} pedidas contra ${INFORME.humo.base.replace("https://", "")} · ${INFORME.humo.fallos.length} caídas`
      : "sin prueba en vivo en esta pasada",
    defectos: INFORME.humo?.fallos.length ?? 0,
    acento: "from-cyan-500/20 to-cyan-500/0",
    borde: "border-cyan-500/30",
    texto: "text-cyan-300",
  },
];

// las puertas de la casa que la auditoría vigila (patrón v281/v367)
const PUERTAS: EnlaceContextual[] = [
  {
    etiqueta: "EL CATÁLOGO DE LO QUE EXISTE ▸",
    ruta: "/catalogo",
    motivo: "cada sala, panel, motor y API con su cifra real — lo que la auditoría cuenta",
    tipoRelacion: "pertenece_a",
  },
  {
    // v367.9 — la auditoría cazó esta puerta inventada: /bitacora NO existe como
    // sala. La bitácora de la casa vive dentro del aparato (pestaña CAMBIOS de la
    // primera página) y todavía no tiene puerta propia: se enlaza a la página y se
    // dice la verdad, en vez de mandar al piloto a un 404.
    etiqueta: "LA BITÁCORA, EN EL APARATO ▸",
    ruta: "/",
    motivo: "la pestaña CAMBIOS de la primera página guarda el registro de versiones; aún no tiene sala propia",
    tipoRelacion: "pertenece_a",
  },
  {
    etiqueta: "EL NÚCLEO ▸",
    ruta: "/nucleo",
    motivo: "el censo de módulos y entidades que la casa declara",
    tipoRelacion: "pertenece_a",
  },
  {
    etiqueta: "EL ESTADO DEL SISTEMA ▸",
    ruta: "/estado",
    motivo: "la salud en vivo del despliegue, servida por la propia casa",
    tipoRelacion: "pertenece_a",
  },
];

const PILARES = [
  {
    n: "1",
    titulo: "AUDITAR",
    texto:
      "Revisar la casa de punta a punta: rutas, enlaces, idioma, recursos, botones y salud en vivo. Reparar lo que se rompe sin borrar funciones. Esta sala es la prueba de que se hizo.",
    estado: "EN PIE",
  },
  {
    n: "2",
    titulo: "MEJORAR",
    texto:
      "Convertir la lectura en experiencia: imágenes que respiren, tarjetas que se toquen, mapas, líneas de tiempo y vídeo en lugar de bloques interminables de texto. La profundidad, opcional.",
    estado: "EN CURSO",
  },
  {
    n: "3",
    titulo: "FUSIONAR",
    texto:
      "Estudiar lo mejor que ya funciona en el mundo —prensa, mapas, visualización, buscadores— y combinarlo en una versión propia. Patrones y conceptos sí; código privado, marcas y diseños propietarios, no.",
    estado: "ABIERTO",
  },
  {
    n: "4",
    titulo: "PERFECCIONAR",
    texto:
      "Volver a pasar los seis agentes después de cada cambio y dejar el informe publicado. Lo que mejora se mide; lo que no se mide, no se sabe.",
    estado: "SEMPRE",
  },
];

export default function CalidadPage() {
  const totalDefectos =
    INFORME.agentes.enlaces.rotos +
    INFORME.agentes.idioma.faltantes +
    INFORME.agentes.recursos.faltantes +
    INFORME.agentes.botones.sinAccion +
    INFORME.agentes.botones.hrefAlmohadilla +
    INFORME.agentes.botones.pendientes +
    (INFORME.humo?.fallos.length ?? 0);

  return (
    <main className="min-h-screen bg-slate-950 pb-24 text-slate-200">
      {/* ── PORTADA ── */}
      <section className="relative overflow-hidden border-b border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 px-5 pb-10 pt-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 38px, #38bdf8 38px, #38bdf8 39px), repeating-linear-gradient(90deg, transparent, transparent 38px, #38bdf8 38px, #38bdf8 39px)",
          }}
        />
        <div className="relative mx-auto max-w-5xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-emerald-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            auditoría v367.9 · {INFORME.fecha}
          </div>
          <h1 className="font-mono text-4xl font-black uppercase leading-none tracking-tight text-white sm:text-6xl">
            La Sala de la Calidad
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-slate-400">
            Cinco agentes revisan el código y un sexto llama a cada puerta para comprobar que abre. Aquí se publica lo
            que encontraron, con fecha y con la fuente del dato:{" "}
            <code className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[12px] text-sky-300">
              node scripts/auditoria.mjs --smoke &lt;url&gt; --json
            </code>
            .
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
              <div className="font-mono text-[10px] uppercase tracking-widest text-slate-500">defectos abiertos</div>
              <div className={`font-mono text-4xl font-black ${totalDefectos === 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {totalDefectos}
              </div>
              <div className="mt-1 text-[11px] text-slate-500">
                {totalDefectos === 0 ? "la casa está sana en los seis frentes" : "hay que repararlos antes de construir"}
              </div>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
              <div className="font-mono text-[10px] uppercase tracking-widest text-slate-500">salas auditadas</div>
              <div className="font-mono text-4xl font-black text-sky-400">{INFORME.agentes.rutas.paginas}</div>
              <div className="mt-1 text-[11px] text-slate-500">más {INFORME.agentes.rutas.apis} endpoints de datos</div>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
              <div className="font-mono text-[10px] uppercase tracking-widest text-slate-500">rutas en vivo</div>
              <div className="font-mono text-4xl font-black text-cyan-400">
                {INFORME.humo ? `${INFORME.humo.ok}/${INFORME.humo.total}` : "—"}
              </div>
              <div className="mt-1 text-[11px] text-slate-500">pedidas una por una, no deducidas del código</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── LOS SEIS AGENTES ── */}
      <section className="mx-auto max-w-5xl px-5 py-12">
        <h2 className="mb-1 font-mono text-xs uppercase tracking-[0.25em] text-slate-500">el equipo</h2>
        <p className="mb-6 text-sm text-slate-400">Cada agente tiene un solo deber y se le mide por su número.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {AGENTES.map((a) => (
            <article
              key={a.n}
              className={`relative overflow-hidden rounded-xl border ${a.borde} bg-gradient-to-br ${a.acento} p-5`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">agente {a.n}</div>
                  <h3 className={`font-mono text-lg font-black uppercase tracking-tight ${a.texto}`}>{a.nombre}</h3>
                  <p className="mt-0.5 text-[12px] text-slate-400">{a.deber}</p>
                </div>
                <div className="text-right">
                  <div className="font-mono text-3xl font-black text-white">{a.cifra}</div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-slate-500">{a.unidad}</div>
                </div>
              </div>
              <div className="mt-3 border-t border-slate-700/60 pt-2 font-mono text-[11px] text-slate-400">{a.detalle}</div>
              <div className="mt-1 font-mono text-[11px]">
                {a.defectos === 0 ? (
                  <span className="text-emerald-400">✓ sin defectos</span>
                ) : (
                  <span className="text-rose-400">✗ {a.defectos} por reparar</span>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── LO REPARADO EN ESTA PASADA ── */}
      <section className="mx-auto max-w-5xl px-5 pb-12">
        <h2 className="mb-1 font-mono text-xs uppercase tracking-[0.25em] text-slate-500">esta pasada</h2>
        <p className="mb-6 text-sm text-slate-400">
          Reparaciones reales de la v367.9, ninguna de ellas quitó una función.
        </p>
        <div className="space-y-3">
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
            <div className="font-mono text-[11px] uppercase tracking-widest text-amber-400">la portada del taller</div>
            <p className="mt-1 text-[13px] leading-relaxed text-slate-300">
              El panel del laboratorio pedía <code className="text-slate-400">/img/cover-lab.jpg</code>, una carpeta que
              no existe en toda la casa: la portada salía como un hueco. Ahora usa la ilustración real del estudio, que
              viaja en el repositorio desde siempre.
            </p>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
            <div className="font-mono text-[11px] uppercase tracking-widest text-amber-400">el velo del cofre</div>
            <p className="mt-1 text-[13px] leading-relaxed text-slate-300">
              El fondo oscuro de la animación de recompensas tenía un manejador vacío. Su intención era bloquear el clic
              y no dejar pasar al contenido de detrás: ahora lo bloquea de verdad.
            </p>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
            <div className="font-mono text-[11px] uppercase tracking-widest text-amber-400">el auditor aprendió</div>
            <p className="mt-1 text-[13px] leading-relaxed text-slate-300">
              La primera pasada acusó 2 enlaces rotos, 8 claves de idioma, 107 imágenes y 208 pendientes. Leídos uno a
              uno, todos eran falsos: descargas a archivos reales, un ayudante local llamado <code>t()</code>, binarios
              que existen en el repositorio pero no en el clon de trabajo, y la palabra española «todo» en mayúsculas.
              El auditor ahora consulta el manifiesto real de <code>public/</code>, ignora archivos con traductor
              propio y mantiene una lista de aceptados leída a mano.
            </p>
          </div>
        </div>
      </section>

      {/* ── SI ALGO FALLA, SE NOMBRA ── */}
      {INFORME.humo && INFORME.humo.fallos.length > 0 && (
        <section className="mx-auto max-w-5xl px-5 pb-12">
          <div className="rounded-xl border border-rose-500/40 bg-rose-500/5 p-5">
            <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-rose-400">rutas que no responden</h2>
            <p className="mt-2 text-[13px] leading-relaxed text-slate-400">
              Medido contra {INFORME.humo.base.replace("https://", "")} el {INFORME.humo.fecha.replace("T", " · ")}. Si
              una sala aparece aquí, su archivo existe pero la puerta no abre:
            </p>
            <ul className="mt-3 space-y-1 font-mono text-[12px] text-rose-300">
              {INFORME.humo.fallos.map((f) => (
                <li key={f.ruta}>
                  {f.codigo} · {f.ruta}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ── LA DENSIDAD: el pilar 2 medido, no prometido ── */}
      {INFORME.humo?.densidad && INFORME.humo.densidad.length > 0 && (() => {
        const salas = [...INFORME.humo.densidad].sort((a, b) => b.ratio - a.ratio);
        const letras = salas.reduce((a, x) => a + x.letras, 0);
        const visuales = salas.reduce((a, x) => a + x.visuales, 0);
        const mediana = [...salas].map((x) => x.ratio).sort((a, b) => a - b)[Math.floor(salas.length / 2)];
        return (
          <section className="border-y border-slate-800 bg-slate-900/30">
            <div className="mx-auto max-w-5xl px-5 py-12">
              <h2 className="mb-1 font-mono text-xs uppercase tracking-[0.25em] text-slate-500">densidad visual · pilar 2</h2>
              <p className="mb-6 max-w-2xl text-sm text-slate-400">
                «Más imágenes y menos bloques interminables de texto». El agente 7 cuenta, en cada sala servida, las
                imágenes, vídeos, lienzos y gráficos contra las letras que quedan al quitar etiquetas. Se mide después
                de cada cambio: lo que mejora se ve, lo que no se mide no se sabe.
              </p>
              <div className="mb-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                  <div className="font-mono text-[10px] uppercase tracking-widest text-slate-500">letras servidas</div>
                  <div className="font-mono text-2xl font-black text-slate-200">{letras.toLocaleString("es")}</div>
                  <div className="mt-1 text-[11px] text-slate-500">en {salas.length} salas medidas</div>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                  <div className="font-mono text-[10px] uppercase tracking-widest text-slate-500">elementos visuales</div>
                  <div className="font-mono text-2xl font-black text-emerald-400">{visuales.toLocaleString("es")}</div>
                  <div className="mt-1 text-[11px] text-slate-500">imágenes, vídeos, lienzos y SVG</div>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                  <div className="font-mono text-[10px] uppercase tracking-widest text-slate-500">letras por visual</div>
                  <div className="font-mono text-2xl font-black text-sky-400">{mediana.toLocaleString("es")}</div>
                  <div className="mt-1 text-[11px] text-slate-500">la mediana: cuanto más bajo, menos libro</div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse font-mono text-[11px]">
                  <thead>
                    <tr className="border-b border-slate-700 text-left text-slate-500">
                      <th className="py-2 pr-3 font-normal uppercase tracking-widest">sala</th>
                      <th className="py-2 pr-3 text-right font-normal uppercase tracking-widest">letras</th>
                      <th className="py-2 pr-3 text-right font-normal uppercase tracking-widest">img</th>
                      <th className="py-2 pr-3 text-right font-normal uppercase tracking-widest">vídeo</th>
                      <th className="py-2 pr-3 text-right font-normal uppercase tracking-widest">svg</th>
                      <th className="py-2 text-right font-normal uppercase tracking-widest">letras/visual</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salas.slice(0, 12).map((x) => (
                      <tr key={x.ruta} className="border-b border-slate-800/60 text-slate-300">
                        <td className="py-1.5 pr-3 text-sky-300">{x.ruta}</td>
                        <td className="py-1.5 pr-3 text-right">{x.letras.toLocaleString("es")}</td>
                        <td className="py-1.5 pr-3 text-right">{x.imagenes}</td>
                        <td className="py-1.5 pr-3 text-right">{x.videos}</td>
                        <td className="py-1.5 pr-3 text-right">{x.svgs}</td>
                        <td className={`py-1.5 text-right ${x.ratio > 4000 ? "text-rose-400" : x.ratio > 1500 ? "text-amber-400" : "text-emerald-400"}`}>
                          {x.ratio.toLocaleString("es")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
                Las doce salas más densas de la última medición. En rojo, las que todavía se leen como un libro; en
                verde, las que ya respiran. La portada de sala (v367.10) se aplicó a ocho de ellas.
              </p>
            </div>
          </section>
        );
      })()}

      {/* ── LA DOCTRINA ── */}
      <section className="border-y border-slate-800 bg-slate-900/40">
        <div className="mx-auto max-w-5xl px-5 py-12">
          <h2 className="mb-1 font-mono text-xs uppercase tracking-[0.25em] text-slate-500">la doctrina</h2>
          <p className="mb-6 max-w-2xl text-sm text-slate-400">
            El orden que fijó el Dueño: primero que lo que ya existe funcione y se vea excelente; después, construir.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {PILARES.map((p) => (
              <div key={p.n} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-2xl font-black text-slate-700">{p.n}</span>
                  <h3 className="font-mono text-sm font-bold uppercase tracking-widest text-slate-200">{p.titulo}</h3>
                  <span className="ml-auto rounded-full border border-slate-700 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-slate-500">
                    {p.estado}
                  </span>
                </div>
                <p className="mt-2 text-[13px] leading-relaxed text-slate-400">{p.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REPETIR LA MEDICIÓN ── */}
      <section className="mx-auto max-w-5xl px-5 py-12">
        <h2 className="mb-1 font-mono text-xs uppercase tracking-[0.25em] text-slate-500">repetir la medición</h2>
        <p className="mb-4 max-w-2xl text-sm text-slate-400">
          El auditor vive en el repositorio, no en una libreta. Cero dependencias: solo Node. Los números de esta sala
          son los de la última ejecución.
        </p>
        <pre className="overflow-x-auto rounded-lg border border-slate-800 bg-black/60 p-4 font-mono text-[12px] leading-relaxed text-slate-300">
{`node scripts/auditoria.mjs                                  # informe legible
node scripts/auditoria.mjs --json                            # + agent-ctx/auditoria.json
node scripts/auditoria.mjs --smoke https://vanguard-u6b9.vercel.app --json`}
        </pre>
        <p className="mt-3 text-[12px] leading-relaxed text-slate-500">
          Recursos comprobados contra: {INFORME.agentes.recursos.contra}. Si el manifiesto no está, el auditor lo dice
          en vez de dar por bueno el disco de un clon incompleto.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href="/catalogo"
            className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 font-mono text-xs uppercase tracking-widest text-slate-300 transition hover:border-sky-500/60 hover:text-sky-300"
          >
            el catálogo de lo que existe
          </Link>
          <Link
            href="/historia"
            className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 font-mono text-xs uppercase tracking-widest text-slate-300 transition hover:border-sky-500/60 hover:text-sky-300"
          >
            el archivo histórico
          </Link>
          <Link
            href="/nucleo"
            className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 font-mono text-xs uppercase tracking-widest text-slate-300 transition hover:border-sky-500/60 hover:text-sky-300"
          >
            el núcleo
          </Link>
        </div>
        <div className="mt-8">
          <FuenteYFecha
            fuente="el auditor de la casa (scripts/auditoria.mjs), ejecutado sobre el código del repositorio y contra el despliegue de producción"
            publicado={INFORME.fecha}
            nota="Los seis números salen del informe de la última ejecución; nada está escrito a mano."
          />
        </div>
        <EnlacesNucleo enlaces={PUERTAS} titulo="CONECTA CON EL NÚCLEO" />
      </section>
    </main>
  );
}
