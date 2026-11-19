// v420.0 VANGUARD LINGUA — comparación entre dos sistemas de escritura.
import type { Metadata } from "next";
import Link from "next/link";
import { MarcoLingua } from "@/components/lingua/marco-lingua";
import { Migas } from "@/components/lingua/piezas";
import { escrituraPorCodigo, escrituras, type Escritura } from "@/lib/lingua/servidor";
import { antepasadosDe, lenguasDeEscritura } from "@/lib/lingua/escrituras";
import { DIRECCIONES, RUTAS_LINGUA, TIPOS_ESCRITURA, rutaEscritura, rutaIdioma } from "@/lib/lingua/tipos";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Comparar sistemas de escritura · Lingua · VANGUARD",
  description: "Pon dos escrituras frente a frente: tipo, dirección, origen, antepasado común, lenguas que las usan y caracteres reales.",
  alternates: { canonical: `${SITE_URL}/lingua/escrituras/comparar` },
};

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

function antepasadoComun(a: Escritura, b: Escritura): Escritura | null {
  const la = [...antepasadosDe(a.codigo), a];
  const lb = new Set([...antepasadosDe(b.codigo), b].map((x) => x.codigo));
  for (let i = la.length - 1; i >= 0; i--) if (lb.has(la[i].codigo)) return la[i];
  return null;
}

function Columna({ e }: { e: Escritura }) {
  const ant = antepasadosDe(e.codigo);
  const lenguas = lenguasDeEscritura(e, 14).filter((l) => l.principal);
  return (
    <div className="vx-li-caja">
      <h2 style={{ fontSize: 20, textTransform: "none", letterSpacing: 0, color: "var(--pl-tinta)" }}>
        <Link href={rutaEscritura(e.codigo)} style={{ color: "inherit" }}>
          {e.nombre}
        </Link>
      </h2>
      <div className={`vx-li-glifos${e.direccion === "rtl" ? " vx-li-rtl" : ""}`} lang="und" style={{ marginBottom: 12 }}>
        {e.muestra.slice(0, 16).map((c, i) => (
          <div key={i} title={e.muestraNombres[i]}>
            <b>{c}</b>
            <small>{e.muestraCodigos[i]}</small>
          </div>
        ))}
      </div>
      <dl className="vx-li-datos">
        <div>
          <dt>Tipo</dt>
          <dd>
            {TIPOS_ESCRITURA[e.tipo]?.nombre ?? e.tipo}
            <small>{TIPOS_ESCRITURA[e.tipo]?.nota}</small>
          </dd>
        </div>
        <div>
          <dt>Dirección</dt>
          <dd>{DIRECCIONES[e.direccion] ?? e.direccion}</dd>
        </div>
        <div>
          <dt>Caja (mayúsculas)</dt>
          <dd>{e.caja ? "Sí" : "No"}</dd>
        </div>
        <div>
          <dt>Origen</dt>
          <dd>
            {e.epoca}
            <small>{e.lugar}</small>
          </dd>
        </div>
        <div>
          <dt>Linaje</dt>
          <dd>{ant.length ? [...ant.map((a) => a.nombre), e.nombre].join(" → ") : e.origenTexto ?? "Origen independiente"}</dd>
        </div>
        <div>
          <dt>Inventario</dt>
          <dd style={{ fontSize: 13.5 }}>{e.letras}</dd>
        </div>
        <div>
          <dt>Lenguas (principal, CLDR)</dt>
          <dd>
            {e.lenguasP.length ? `${e.lenguasP.length} lenguas` : "Ninguna en uso habitual"}
            {lenguas.length ? (
              <small>
                {lenguas.map((l, i) => (
                  <span key={l.code}>
                    {i ? ", " : ""}
                    {l.glotto ? <Link href={rutaIdioma(l.glotto)}>{l.nombre}</Link> : l.nombre}
                  </span>
                ))}
              </small>
            ) : null}
          </dd>
        </div>
      </dl>
    </div>
  );
}

export default async function Page({ searchParams }: Props) {
  const sp = await searchParams;
  const a = escrituraPorCodigo(typeof sp.a === "string" ? sp.a : "Latn") ?? escrituraPorCodigo("Latn")!;
  const b = escrituraPorCodigo(typeof sp.b === "string" ? sp.b : "Arab") ?? escrituraPorCodigo("Arab")!;
  const comun = antepasadoComun(a, b);
  const todas = escrituras();
  const mismasLenguas = a.lenguasP.filter((c) => b.lenguasP.includes(c) || b.lenguasS.includes(c));
  return (
    <MarcoLingua activo={RUTAS_LINGUA.escrituras} titulo="Comparar escrituras" sub="Elige dos sistemas de escritura y compáralos: cómo representan los sonidos, en qué dirección se escriben, de dónde vienen y si comparten antepasado.">
      <Migas pasos={[{ href: RUTAS_LINGUA.inicio, label: "Lingua" }, { href: RUTAS_LINGUA.escrituras, label: "Escrituras" }, { label: "Comparar" }]} />
      <form className="vx-li-form" method="get" action={RUTAS_LINGUA.comparar}>
        <label>
          Escritura A
          <select name="a" defaultValue={a.codigo}>
            {todas.map((e) => (
              <option key={e.codigo} value={e.codigo}>
                {e.nombre}
              </option>
            ))}
          </select>
        </label>
        <label>
          Escritura B
          <select name="b" defaultValue={b.codigo}>
            {todas.map((e) => (
              <option key={e.codigo} value={e.codigo}>
                {e.nombre}
              </option>
            ))}
          </select>
        </label>
        <button className="vx-li-boton" type="submit">
          Comparar
        </button>
        <Link className="vx-li-boton sec" href={`${RUTAS_LINGUA.comparar}?a=${b.codigo}&b=${a.codigo}`}>
          ⇄ Invertir
        </Link>
      </form>

      <div className="vx-li-aviso">
        <b>Resumen.</b>{" "}
        {a.codigo === b.codigo
          ? "Has elegido la misma escritura dos veces."
          : comun
            ? comun.codigo === a.codigo || comun.codigo === b.codigo
              ? `${comun.codigo === a.codigo ? b.nombre : a.nombre} desciende de ${comun.nombre}, directa o indirectamente.`
              : `Ambas descienden de la escritura ${comun.nombre.toLowerCase()}.`
            : "No comparten antepasado conocido en esta colección: surgieron en tradiciones distintas."}{" "}
        {a.tipo === b.tipo ? `Las dos son de tipo ${TIPOS_ESCRITURA[a.tipo]?.nombre.toLowerCase()}.` : `Funcionan distinto: ${TIPOS_ESCRITURA[a.tipo]?.nombre.toLowerCase()} frente a ${TIPOS_ESCRITURA[b.tipo]?.nombre.toLowerCase()}.`}{" "}
        {a.direccion !== b.direccion ? `Una se escribe ${DIRECCIONES[a.direccion]} y la otra ${DIRECCIONES[b.direccion]}.` : ""}
        {mismasLenguas.length ? ` ${mismasLenguas.length} lenguas usan ambas según CLDR.` : ""}
      </div>

      <div className="vx-li-comparar">
        <Columna e={a} />
        <Columna e={b} />
      </div>
    </MarcoLingua>
  );
}
