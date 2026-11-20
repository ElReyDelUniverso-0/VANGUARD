// ═══════════════════════════════════════════════════════════════════
// v406.2 LA PORTADA NUEVA — las piezas que se SUMAN a la portada v400
// (nada de lo anterior se quita): el héroe que dice qué es Vanguard, el
// índice rápido, las ocho puertas, «Descubre hoy» y «Lo nuevo en la casa».
// Todo son componentes de servidor: cero JS extra en el móvil.
// ═══════════════════════════════════════════════════════════════════
import Link from "next/link";
import type { ReactNode } from "react";
import { AREAS, CIFRAS_CASA, type ClaveArea } from "./areas";
import { MODULOS_PUBLICOS } from "./modulos";
import { BotonMundos } from "@/components/mundos/puerta-mundos";
import { hallazgosDelDia } from "@/lib/portada/descubre";
import { bitacoraViva, BITACORA_COLOR } from "@/lib/bitacora";

const base = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" } as const;

const ICONOS: Record<ClaveArea, ReactNode> = {
  noticias: (
    <svg {...base}>
      <circle cx="12" cy="12" r="2.2" fill="currentColor" />
      <path d="M7.8 7.8a6 6 0 0 0 0 8.4M16.2 7.8a6 6 0 0 1 0 8.4M5 5a10 10 0 0 0 0 14M19 5a10 10 0 0 1 0 14" />
    </svg>
  ),
  mapas: (
    <svg {...base}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </svg>
  ),
  simuladores: (
    <svg {...base}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 1.5v5M12 17.5v5M1.5 12h5M17.5 12h5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </svg>
  ),
  mundos: (
    <svg {...base}>
      <circle cx="8.5" cy="12" r="5.5" />
      <circle cx="15.5" cy="12" r="5.5" />
      <path d="M12 7.6v8.8" />
    </svg>
  ),
  informacion: (
    <svg {...base}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="2" />
      <path d="M7 16v-4M11 16V8M15 16v-6M19 16v-2" />
    </svg>
  ),
  historia: (
    <svg {...base}>
      <path d="M4 20h16M5 20V9M9.5 20V9M14.5 20V9M19 20V9M3 9h18L12 3.5z" />
    </svg>
  ),
  educacion: (
    <svg {...base}>
      <path d="M2.5 9 12 4.5 21.5 9 12 13.5z" />
      <path d="M6.5 11v4.5c0 1.4 2.5 3 5.5 3s5.5-1.6 5.5-3V11M21.5 9v5.5" />
    </svg>
  ),
  documentales: (
    <svg {...base}>
      <rect x="2.5" y="5" width="14" height="14" rx="2" />
      <path d="m16.5 10 5-3v10l-5-3" />
      <path d="m8 9.2 4 2.8-4 2.8z" fill="currentColor" />
    </svg>
  ),
};

const Flecha = () => (
  <svg {...base} aria-hidden width="16" height="16">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

/* ── ÍNDICE RÁPIDO: las anclas de la propia portada ── */
export const INDICE_PORTADA = [
  { href: "#areas", label: "Explorar" },
  { href: "#ahora", label: "Última hora" },
  { href: "#descubre", label: "Descubre" },
  { href: "#modulos", label: "Módulos" },
  { href: "#mapa", label: "Mapa vivo" },
  { href: "#novedades", label: "Lo nuevo" },
];

/* ── EL HÉROE: qué es Vanguard y qué puede hacer el visitante ── */
export function HeroeVanguard({ cables }: { cables: number }) {
  const cifras = [
    { v: cables, l: "cables de agencia ahora", vivo: true },
    { v: CIFRAS_CASA.naciones, l: "naciones en el atlas" },
    { v: CIFRAS_CASA.curiosidades, l: "curiosidades verídicas" },
    { v: CIFRAS_CASA.salas, l: "salas por explorar" },
  ];
  return (
    <section className="vxp-heroe vx-entra" aria-labelledby="vxp-heroe-t">
      <div className="vxp-heroe-fondo" aria-hidden />
      <span className="vx-mira vx-esquinas" aria-hidden />
      <div className="vxp-heroe-txt">
        <span className="vx-sello">Plataforma de conocimiento · exploración · simulación</span>
        <h1 id="vxp-heroe-t">
          El mundo entero, <em>en tiempo real</em> y a tu alcance.
        </h1>
        <p>
          Vanguard reúne en un solo lugar las noticias de cada conflicto, mapas vivos del planeta, simuladores, historia,
          educación y documentales. En español y gratis.
        </p>
        <div className="vxp-heroe-cta">
          <Link href="/en-vivo" className="vx-btn">
            <span className="vxp-punto" aria-hidden /> Ver la última hora
          </Link>
          <Link href="/mapas" className="vx-btn vx-btn-sec">
            Explorar mapas
          </Link>
          <BotonMundos className="vxp-boton-mundos">
            <span aria-hidden>◉</span> Zona Cero
          </BotonMundos>
        </div>
      </div>
      <dl className="vxp-cifras">
        {cifras.map((c) => (
          <div key={c.l}>
            <dt>{c.l}</dt>
            <dd>
              {c.vivo && <span className="vxp-punto" aria-hidden />}
              {c.v.toLocaleString("es")}
            </dd>
          </div>
        ))}
      </dl>
      <nav className="vxp-indice" aria-label="En esta portada">
        {INDICE_PORTADA.map((i) => (
          <a key={i.href} href={i.href}>
            {i.label}
          </a>
        ))}
      </nav>
    </section>
  );
}

/* ── LAS OCHO PUERTAS ── */
export function AreasRejilla() {
  return (
    <div className="vxp-areas">
      {AREAS.map((a, i) => (
        <article key={a.clave} className="vxp-area vx-mira" style={{ ["--c" as string]: a.color }} data-area={a.clave}>
          <Link href={a.href} className="vxp-area-principal" aria-label={`${a.titulo}: ${a.cta}`}>
            <span className="vxp-area-n" aria-hidden>
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="vxp-area-ico" aria-hidden>
              {ICONOS[a.clave]}
            </span>
            <span className="vxp-area-verbo">
              {a.vivo && <span className="vxp-punto" aria-hidden />}
              {a.verbo}
              {a.dato && <small> · {a.dato}</small>}
            </span>
            <h3>{a.titulo}</h3>
            <p>{a.txt}</p>
            <span className="vxp-area-cta">
              {a.cta} <Flecha />
            </span>
          </Link>
          <ul className="vxp-area-atajos" aria-label={`Más en ${a.titulo}`}>
            {a.atajos.map((x) => (
              <li key={x.href}>
                <Link href={x.href}>{x.label}</Link>
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}

/* ── DESCUBRE HOY ── */
export function DescubreHoy() {
  const h = hallazgosDelDia();
  return (
    <div className="vxp-desc">
      {h.map((x, i) => (
        <Link key={x.clave} href={x.href} className={`vxp-hall vx-mira${i === 0 ? " vxp-hall-grande" : ""}`} style={{ ["--c" as string]: x.color }}>
          {x.img && (
            // la foto real de la fuente (Wikimedia), como en la armería
            <img src={x.img} alt="" loading="lazy" decoding="async" className="vxp-hall-img" referrerPolicy="no-referrer" />
          )}
          {x.img && <span className="vxp-hall-velo" aria-hidden />}
          <span className="vxp-hall-tipo">{x.tipo}</span>
          <h3>{x.titulo}</h3>
          <p>{x.texto}</p>
          {x.dato && <span className="vxp-hall-dato">{x.dato}</span>}
          {x.ficha && (
            <dl className="vxp-hall-ficha">
              {x.ficha.map((f) => (
                <div key={f.k}>
                  <dt>{f.k}</dt>
                  <dd>{f.v}</dd>
                </div>
              ))}
            </dl>
          )}
          <span className="vxp-hall-cta">
            {x.cta} <Flecha />
          </span>
        </Link>
      ))}
    </div>
  );
}

/* ── LO NUEVO EN LA CASA: las tres últimas entradas de la bitácora ── */
function hitoLegible(hitos: string[]): { t: string; d: string } {
  const h = hitos.find((x) => !/^AUDITOR[IÍ]A/i.test(x)) ?? hitos[0] ?? "";
  const i = h.indexOf(":");
  const t = i > 0 && i < 48 ? h.slice(0, i) : "";
  let d = (t ? h.slice(i + 1) : h).trim();
  if (d.length > 170) d = `${d.slice(0, 170).replace(/\s+\S*$/, "")}…`;
  return { t, d: d.charAt(0).toUpperCase() + d.slice(1) };
}

export function NovedadesPortada() {
  const ultimas = bitacoraViva().slice(0, 3);
  return (
    <ol className="vxp-novs">
      {ultimas.map((e, i) => {
        const { t, d } = hitoLegible(e.hitos);
        return (
          <li key={e.version} style={{ ["--c" as string]: BITACORA_COLOR[e.tipo] }}>
            <Link href="/novedades" className="vxp-nov vx-mira">
              <span className="vxp-nov-v">
                {e.version}
                {i === 0 && <b>Lo último</b>}
              </span>
              <h3>{e.nombre}</h3>
              {t && <span className="vxp-nov-t">{t}</span>}
              <p>{d}</p>
              <span className="vxp-nov-n">
                {e.hitos.length} {e.hitos.length === 1 ? "cambio" : "cambios"} · ver lo nuevo <Flecha />
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}

export const TOTAL_MODULOS = MODULOS_PUBLICOS.length;
