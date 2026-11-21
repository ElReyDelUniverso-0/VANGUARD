"use client";

// ═══════════════════════════════════════════════════════════════════════════
// v435.2 · /descubrir — EL MAPA PARA EL QUE LLEGA
//
// La casa entera explicada en un solo documento: cuatro caminos guiados, todas
// las salas con su qué y sus ejemplos, lo último que llegó y tu progreso.
//
// No obliga a nada: la guía es una oferta, y al lado está siempre el buscador
// y el índice. Quien quiera explorar a su aire apaga el modo guía y no vuelve
// a ver avisos.
// ═══════════════════════════════════════════════════════════════════════════

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight, Check, ChevronDown, Compass, Lock, Map as MapIcon, RotateCcw,
  Search, Sparkles,
} from "lucide-react";
import { FICHAS, PUERTAS_DE_ENTRADA, TOTAL_FICHAS, fichaDe, porDivision, type Ficha } from "@/lib/descubrimiento/fichas";
import { GUIAS, guiaSugerida, pasoDe } from "@/lib/descubrimiento/guias";
import {
  fichasVisitadas, guardar, leer, pctDescubierto, registrarPaso, reiniciar, type Progreso,
} from "@/lib/descubrimiento/progreso";
import { DESTACADOS } from "@/lib/descubrimiento/destacados";
import "@/components/descubrimiento/descubrimiento.css";

export function DescubrirCliente() {
  const router = useRouter();
  const [montado, setMontado] = useState(false);
  const [p, setP] = useState<Progreso | null>(null);
  const [busca, setBusca] = useState("");
  const [division, setDivision] = useState<string>("todas");
  const [abierta, setAbierta] = useState<string | null>(null);

  useEffect(() => {
    setP(leer());
    setMontado(true);
  }, []);

  const actualizar = (nuevo: Progreso) => {
    guardar(nuevo);
    setP(nuevo);
  };

  const grupos = useMemo(() => porDivision(), []);

  const filtradas = useMemo<Ficha[]>(() => {
    const q = busca.trim().toLowerCase();
    return FICHAS.filter((f) => {
      if (division !== "todas" && f.division !== division) return false;
      if (!q) return true;
      return (
        f.nombre.toLowerCase().includes(q) ||
        f.que.toLowerCase().includes(q) ||
        f.modulo.toLowerCase().includes(q) ||
        f.href.toLowerCase().includes(q) ||
        f.ejemplos.some((e) => e.toLowerCase().includes(q))
      );
    });
  }, [busca, division]);

  const pct = p ? pctDescubierto(p) : 0;
  const vistas = p ? fichasVisitadas(p) : 0;
  const sugerida = p ? guiaSugerida(p.guias) : GUIAS[0];
  const pasoDeHoy = p ? pasoDe(sugerida.id, p.guias[sugerida.id] ?? 0) : null;

  const ir = (ruta: string) => router.push(ruta);

  return (
    <div className="dsc">
      {/* ── ① EMPEZAR ── */}
      <section className="dsc-bloque" aria-labelledby="dsc-empezar">
        <div className="dsc-cab">
          <div>
            <p className="dsc-rotulo">① por dónde empezar</p>
            <h2 id="dsc-empezar" className="dsc-h2">Una guía, no un laberinto</h2>
            <p className="dsc-p">
              Elige un camino y la casa te lleva paso a paso. Cada paso te dice qué vas a ver y qué hacer allí; tú decides
              cuándo darlo por hecho, y puedes salirte en cualquier momento: abajo está todo, sin candados.
            </p>
          </div>
          <div className="dsc-empezar-caja">
            <span className="dsc-rotulo">tu siguiente paso</span>
            <b className="dsc-empezar-guia">{sugerida.nombre}</b>
            <em className="dsc-empezar-paso">
              {pasoDeHoy ? `${pasoDeHoy.haz}` : "Ya has hecho todos los pasos de esta guía."}
            </em>
            <div className="dsc-botones">
              <button type="button" className="dsc-b dsc-b-oro" onClick={() => ir(pasoDeHoy?.ruta ?? "/guerra-hoy")} disabled={!montado}>
                <Compass className="w-3.5 h-3.5" /> {pasoDeHoy ? "ir al paso" : "empezar de cero"}
              </button>
              {p && pasoDeHoy ? (
                <button
                  type="button"
                  className="dsc-b"
                  onClick={() => actualizar(registrarPaso(p, sugerida.id, p.guias[sugerida.id] ?? 0))}
                >
                  <Check className="w-3.5 h-3.5" /> lo he hecho
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="dsc-guias">
          {GUIAS.map((g) => {
            const hechos = p?.guias[g.id] ?? 0;
            const listo = hechos >= g.pasos.length;
            return (
              <article key={g.id} className="dsc-guia" style={{ ["--c" as string]: g.color }}>
                <header>
                  <h3>{g.nombre}</h3>
                  <span className={listo ? "dsc-hecha" : ""}>{listo ? "hecha" : `${hechos}/${g.pasos.length}`}</span>
                </header>
                <p className="dsc-guia-para">{g.para}</p>
                <p className="dsc-guia-promesa">{g.promesa}</p>
                <ol className="dsc-guia-pasos">
                  {g.pasos.map((paso, i) => (
                    <li key={paso.ruta + i} className={i < hechos ? "hecho" : ""}>
                      <button type="button" onClick={() => ir(paso.ruta)} title={paso.haz}>
                        <span className="dsc-paso-n">{i < hechos ? <Check className="w-3 h-3" /> : i + 1}</span>
                        <span className="dsc-paso-nombre">{fichaDe(paso.ruta)?.nombre ?? paso.ruta}</span>
                        <span className="dsc-paso-min">{paso.minutos} min</span>
                      </button>
                    </li>
                  ))}
                </ol>
                <footer>
                  <span className="dsc-total">
                    {g.pasos.reduce((t, x) => t + x.minutos, 0)} min en total
                  </span>
                  <button type="button" className="dsc-enlace" onClick={() => ir(pasoDe(g.id, hechos)?.ruta ?? g.pasos[0].ruta)}>
                    {listo ? "volver a hacerla" : "continuar"} <ArrowRight className="w-3 h-3" />
                  </button>
                </footer>
              </article>
            );
          })}
        </div>
      </section>

      {/* ── ② TODAS LAS SALAS ── */}
      <section className="dsc-bloque" aria-labelledby="dsc-salas">
        <div className="dsc-cab">
          <div>
            <p className="dsc-rotulo">② todas las salas</p>
            <h2 id="dsc-salas" className="dsc-h2">Qué hace cada herramienta, con ejemplos</h2>
            <p className="dsc-p">
              {TOTAL_FICHAS} puertas con su explicación breve y lo que puedes hacer dentro. Busca por nombre, por tema o por
              lo que quieras hacer («capas», «divisas», «capturas»).
            </p>
          </div>
        </div>

        <div className="dsc-buscador">
          <Search className="w-4 h-4" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="busca una sala o lo que quieras hacer…"
            aria-label="Buscar salas"
          />
          {busca ? (
            <button type="button" className="dsc-limpiar" onClick={() => setBusca("")}>limpiar</button>
          ) : null}
        </div>

        <div className="dsc-filtros">
          <button type="button" className={division === "todas" ? "on" : ""} onClick={() => setDivision("todas")}>
            todas ({TOTAL_FICHAS})
          </button>
          {grupos.map((g) => (
            <button key={g.codigo} type="button" className={division === g.codigo ? "on" : ""} onClick={() => setDivision(g.codigo)}>
              {g.codigo} · {g.nombre} ({g.fichas.length})
            </button>
          ))}
        </div>

        <div className="dsc-entradas">
          {PUERTAS_DE_ENTRADA.map((r) => {
            const f = fichaDe(r);
            if (!f) return null;
            const pisada = p ? Boolean(p.visitadas[f.href.split("#")[0]]) : false;
            return (
              <button key={r} type="button" className={`dsc-entrada ${pisada ? "pisada" : ""}`} onClick={() => ir(r)}>
                <b>{f.nombre}</b>
                <em>{f.que}</em>
                <span>{pisada ? "ya la has visto" : "por estrenar"}</span>
              </button>
            );
          })}
        </div>

        {filtradas.length === 0 ? (
          <p className="dsc-vacio">
            No hay ninguna sala que case con «{busca}». Prueba con otra palabra o ábrete <Link href="/buscar">el buscador único</Link>.
          </p>
        ) : (
          <ul className="dsc-lista">
            {filtradas.map((f) => {
              const on = abierta === f.href;
              const pisada = p ? Boolean(p.visitadas[f.href.split("#")[0]]) : false;
              return (
                <li key={f.href} className={pisada ? "pisada" : ""}>
                  <button type="button" className="dsc-ficha-cab" onClick={() => setAbierta(on ? null : f.href)} aria-expanded={on}>
                    <span className="dsc-ficha-div">{f.division}</span>
                    <span className="dsc-ficha-nombre">{f.nombre}</span>
                    {f.vivo ? <span className="dsc-vivo">en vivo</span> : null}
                    {pisada ? <span className="dsc-check"><Check className="w-3 h-3" /></span> : null}
                    <ChevronDown className={`w-3.5 h-3.5 dsc-flecha ${on ? "on" : ""}`} />
                  </button>
                  <p className="dsc-ficha-que">{f.que}</p>
                  {on ? (
                    <div className="dsc-ficha-cuerpo">
                      <span className="dsc-rotulo-mini">qué puedes hacer aquí</span>
                      <ul className="dsc-ejemplos">
                        {f.ejemplos.map((e, i) => <li key={i}><Check className="w-3 h-3" /> {e}</li>)}
                      </ul>
                      <div className="dsc-botones">
                        <button type="button" className="dsc-b dsc-b-oro" onClick={() => ir(f.href)}>
                          abrir {f.nombre} <ArrowRight className="w-3 h-3" />
                        </button>
                        <span className="dsc-ruta"><code>{f.href}</code></span>
                      </div>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* ── ③ LO NUEVO ── */}
      <section className="dsc-bloque" aria-labelledby="dsc-nuevo">
        <div className="dsc-cab">
          <div>
            <p className="dsc-rotulo">③ lo que acaba de llegar</p>
            <h2 id="dsc-nuevo" className="dsc-h2">Funciones destacadas, con su puerta</h2>
            <p className="dsc-p">Cada línea es una versión real de la casa y una cosa que puedes probar ahora mismo. El archivo completo vive en <Link href="/novedades">Lo nuevo</Link>.</p>
          </div>
        </div>
        <ul className="dsc-destacados">
          {DESTACADOS.map((d) => (
            <li key={d.version}>
              <span className="dsc-version">{d.version}</span>
              <div>
                <b>{d.nombre}</b>
                <em>{d.que}</em>
                <span className="dsc-prueba">Prueba: {d.prueba}</span>
              </div>
              <button type="button" className="dsc-b" onClick={() => ir(d.ruta)}>
                probar <ArrowRight className="w-3 h-3" />
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* ── ④ TU PROGRESO Y TU LIBERTAD ── */}
      <section className="dsc-bloque" aria-labelledby="dsc-progreso">
        <div className="dsc-cab">
          <div>
            <p className="dsc-rotulo">④ tu recorrido</p>
            <h2 id="dsc-progreso" className="dsc-h2">Sin perderte y sin que te lleven</h2>
            <p className="dsc-p">
              La casa apunta lo que abres solo en tu aparato. Si no quieres explicaciones, apágalas: desaparecen los avisos y
              sigues teniendo el buscador, el índice y esta página cuando la necesites.
            </p>
          </div>
          <div className="dsc-progreso-caja">
            <span className="dsc-pct">{pct} %</span>
            <span className="dsc-pct-sub">{vistas} de {TOTAL_FICHAS} salas vistas</span>
            <div className="dsc-barra"><i style={{ width: `${pct}%` }} /></div>
            {p ? (
              <div className="dsc-interruptores">
                <label>
                  <input type="checkbox" checked={p.modoLibre} onChange={(e) => actualizar({ ...p, modoLibre: e.target.checked })} />
                  <span>modo libre (sin avisos ni guía)</span>
                </label>
                <button type="button" className="dsc-enlace" onClick={() => actualizar(reiniciar())}>
                  <RotateCcw className="w-3 h-3" /> reiniciar mi progreso
                </button>
              </div>
            ) : null}
            <p className="dsc-nota"><Lock className="w-3 h-3" /> vive en tu aparato: nadie más lo ve</p>
          </div>
        </div>

        <div className="dsc-atajos">
          <Link href="/buscar" className="dsc-atajo"><Search className="w-4 h-4" /><b>Buscador único</b><em>cuando sabes qué quieres y no dónde está</em></Link>
          <Link href="/orden" className="dsc-atajo"><MapIcon className="w-4 h-4" /><b>Orden de batalla</b><em>las siete divisiones y sus {TOTAL_FICHAS} puertas</em></Link>
          <Link href="/novedades" className="dsc-atajo"><Sparkles className="w-4 h-4" /><b>Lo nuevo</b><em>el archivo completo de novedades</em></Link>
        </div>
      </section>
    </div>
  );
}
