"use client";

// ═══════════════════════════════════════════════════════════════════
// v403.8 · EL BUSCADOR UNIVERSAL — la puerta que faltaba (ciclo 2).
//
// LO QUE HABÍA: `buscador.tsx` (v170.0) existía, con ⌘K y buen ranking, pero
// solo miraba el catálogo de 25 salas de la v170 y su único importador era
// `vanguard-app.tsx`, que no importaba nadie. La casa tenía 56 rutas y 155
// salas, y ni una caja donde escribir una palabra.
//
// LO QUE HACE ESTE: busca en las TRES capas de la casa y las distingue:
//   ① LAS 155 SALAS del cuartel (mapa-salas.ts, generado de tab-nav.tsx) →
//      abren en su sitio con /cuartel?sala=<clave> (v402.4, ya existía).
//   ② LAS 46 SALAS DE LOS MÓDULOS (modulos.ts) → sus rutas reales.
//   ③ LAS NOTICIAS VIVAS: al escribir 3+ letras pregunta a /api/noticias?q=
//      (la búsqueda real que ya tenía la casa) y enseña los cables con su
//      medio y su hora.
//
// NO SUSTITUYE A NADIE: `buscador.tsx` sigue intacto para la v170. Este es
// una pieza nueva que se monta en la cabecera viva y no depende de ningún
// almacén de la v170: si el visitante no ha hecho nada, funciona igual.
//
// Un solo atajo (⌘K / Ctrl+K) y un botón visible en la cabecera: si algo no
// se puede encontrar escribiéndolo, es que no existe.
// ═══════════════════════════════════════════════════════════════════
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { CONSTELACIONES, SALAS_MAPA, TOTAL_SALAS } from "@/lib/vanguard/mapa-salas";
import { MODULOS_PUBLICOS } from "@/components/portada/modulos";
// v405.10 · EL CONTEXTO: el buscador deja de ser una lista plana. Lo que
// pertenece al espacio en el que estás sube hasta arriba (y al abrir en
// vacío, lo primero que enseña son las herramientas de ese espacio).
import { espacioDe, ordenarPorContexto } from "@/lib/navegacion/contexto";
import { ESPACIO_POR_CLAVE } from "@/lib/navegacion/espacios";

type Cable = { id: string; t: string; f: string; fecha?: string };
type Grupo = "constelaciones" | "salas" | "rutas" | "cables";
type Hit = { grupo: Grupo; clave: string; titulo: string; sub: string; destino: string; color?: string };

const sinTildes = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

/** Puntúa como la v170: empieza > contiene > en la etiqueta corta > en el grupo. */
function puntuar(q: string, titulo: string, sub: string): number {
  const t = sinTildes(q).trim();
  if (!t) return 0;
  const a = sinTildes(titulo);
  const b = sinTildes(sub);
  let p = 0;
  if (a === t) p += 120;
  if (a.startsWith(t)) p += 70;
  if (a.includes(t)) p += 45;
  for (const palabra of t.split(/\s+/).filter((x) => x.length > 2)) {
    if (a.includes(palabra)) p += 12;
    if (b.includes(palabra)) p += 6;
  }
  return p;
}

// El índice de la casa, armado una sola vez por sesión de navegador.
const RUTAS = MODULOS_PUBLICOS.flatMap((m) =>
  m.pestanas.map((p) => ({ titulo: p.label, sub: m.nombre, destino: p.href }))
);

export function BuscadorUniversal({ compacto = false }: { compacto?: boolean }) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [q, setQ] = useState("");
  const [cables, setCables] = useState<Cable[]>([]);
  const [buscandoCables, setBuscandoCables] = useState(false);
  const [sel, setSel] = useState(0);
  // v405.10: el contexto sale de la URL, no de un almacén
  const rutaActual = usePathname() ?? "/";
  const inputRef = useRef<HTMLInputElement>(null);
  const ctrl = useRef<AbortController | null>(null);

  const abrir = useCallback(() => {
    setAbierto(true);
    setQ("");
    setSel(0);
  }, []);
  const cerrar = useCallback(() => {
    setAbierto(false);
    ctrl.current?.abort();
  }, []);

  // ⌘K / Ctrl+K desde cualquier sitio, y ESC para cerrar.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setAbierto((v) => !v);
        return;
      }
      if (e.key === "Escape") setAbierto(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (abierto) setTimeout(() => inputRef.current?.focus(), 30);
  }, [abierto]);

  // La casa encontrada: salas del cuartel + rutas de los módulos.
  const locales = useMemo<Hit[]>(() => {
    const salas: Hit[] = SALAS_MAPA.map((s) => ({
      grupo: "salas",
      clave: `sala:${s.clave}`,
      titulo: s.corto,
      sub: `${s.constelacion} · ${s.nombre}`,
      destino: `/cuartel?sala=${s.clave}`,
      color: s.color,
    }));
    // v403.9: las 20 constelaciones, buscables por nombre y por su descripción.
    const constelaciones: Hit[] = CONSTELACIONES.map((c) => ({
      grupo: "constelaciones" as const,
      clave: `const:${c.clave}`,
      titulo: c.corto,
      sub: `${c.salas.length} ${c.salas.length === 1 ? "sala" : "salas"} · ${c.desc}`,
      destino: `/constelacion/${c.clave}`,
      color: c.color,
    }));
    const rutas: Hit[] = RUTAS.map((r) => ({
      grupo: "rutas",
      clave: `ruta:${r.destino}`,
      titulo: r.titulo,
      sub: `${r.sub} · ${r.destino}`,
      destino: r.destino,
    }));
    if (!q.trim()) {
      // v405.10: primero, las herramientas del espacio en el que estás.
      const espacioAhora = espacioDe(rutaActual);
      const delEspacio: Hit[] = ESPACIO_POR_CLAVE[espacioAhora].herramientas.slice(0, 4).map((h) => ({
        grupo: "rutas" as const,
        clave: `espacio:${h.id}`,
        titulo: h.nombre,
        sub: `${ESPACIO_POR_CLAVE[espacioAhora].nombre} · ${h.desc}`,
        destino: h.href,
        color: ESPACIO_POR_CLAVE[espacioAhora].color,
      }));
      const arranque: Hit[] = [...delEspacio, 
        { grupo: "rutas", clave: "ruta:/", titulo: "Portada", sub: "El mundo en tiempo real", destino: "/" },
        { grupo: "rutas", clave: "ruta:/modulos", titulo: "Mapa de la casa", sub: `Las ${TOTAL_SALAS} salas, por constelaciones`, destino: "/modulos" },
        { grupo: "rutas", clave: "ruta:/cuartel", titulo: "El cuartel", sub: "Todas las salas de juego y simulación", destino: "/cuartel" },
        { grupo: "rutas", clave: "ruta:/novedades", titulo: "Para ti", sub: "Lo nuevo y lo que encaja contigo", destino: "/novedades" },
      ];
      return arranque;
    }
    // v405.10: puntuación por texto + bonus de contexto (misma función pura
    // que usa la barra adaptativa: una sola idea de «dónde estás»).
    return ordenarPorContexto(
      [...constelaciones, ...salas, ...rutas].map((h) => ({
        h,
        puntos: puntuar(q, h.titulo, h.sub),
        espacio: espacioDe(h.destino),
      })),
      espacioDe(rutaActual),
    )
      .filter((x) => x.puntos > 0)
      .slice(0, 12)
      .map((x) => x.h);
  }, [q, rutaActual]);

  // Las noticias vivas: /api/noticias?q= (la búsqueda real de la casa), con
  // retardo para no disparar una petición por tecla.
  useEffect(() => {
    const t = q.trim();
    if (t.length < 3) {
      setCables([]);
      setBuscandoCables(false);
      return;
    }
    setBuscandoCables(true);
    const id = setTimeout(() => {
      ctrl.current?.abort();
      const c = new AbortController();
      ctrl.current = c;
      fetch(`/api/noticias?q=${encodeURIComponent(t)}`, { signal: c.signal })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          // /api/noticias?q= devuelve { items: [{ id, t, s, f, … }] } (lupa real
          // sobre la BD de la casa). Se aceptan las dos formas por si cambia.
          const lista: Cable[] = Array.isArray(d?.items) ? d.items : Array.isArray(d?.noticias) ? d.noticias : [];
          setCables(lista.slice(0, 5));
        })
        .catch(() => setCables([]))
        .finally(() => setBuscandoCables(false));
    }, 320);
    return () => clearTimeout(id);
  }, [q]);

  const hits: Hit[] = useMemo(
    () => [
      ...locales,
      ...cables.map<Hit>((c) => ({
        grupo: "cables",
        clave: `cable:${c.id}`,
        titulo: c.t ?? (c as unknown as { title?: string }).title ?? "Cable",
        sub: `${c.f ?? (c as unknown as { source?: string }).source ?? "medio"} · noticia en vivo`,
        destino: `/noticia/${encodeURIComponent(c.id)}`,
      })),
    ],
    [locales, cables]
  );

  const ir = useCallback(
    (h: Hit) => {
      cerrar();
      if (h.grupo === "cables") window.open(h.destino, "_blank", "noopener");
      else router.push(h.destino);
    },
    [cerrar, router]
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSel((s) => Math.min(hits.length - 1, s + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSel((s) => Math.max(0, s - 1));
    } else if (e.key === "Enter" && hits[sel]) {
      e.preventDefault();
      ir(hits[sel]);
    }
  };

  const tituloGrupo: Record<Grupo, string> = {
    constelaciones: "CONSTELACIONES",
    salas: "SALAS DE LA CASA",
    rutas: "PUERTAS",
    cables: buscandoCables ? "BUSCANDO EN LOS CABLES…" : "CABLES EN VIVO",
  };
  const grupos: Grupo[] = ["constelaciones", "salas", "rutas", "cables"];

  return (
    <>
      <button
        type="button"
        onClick={abrir}
        aria-label="Buscar en toda la casa (⌘K)"
        className={
          compacto
            ? "vx-ico"
            : "vx-ico"
        }
        style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.6-3.6" strokeLinecap="round" />
        </svg>
        {!compacto && <span style={{ font: "600 10px/1 ui-monospace,monospace", letterSpacing: ".14em" }}>⌘K</span>}
      </button>

      {abierto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Buscar en VANGUARD"
          onClick={cerrar}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(4,6,10,.72)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            padding: "10vh 14px 14px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(680px,100%)",
              background: "#0b0f16",
              border: "1px solid #22303f",
              borderRadius: 12,
              boxShadow: "0 30px 80px rgba(0,0,0,.6)",
              overflow: "hidden",
              color: "#e8edf6",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 15px", borderBottom: "1px solid #1a2431" }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#8b98ad" strokeWidth="1.8" aria-hidden>
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.6-3.6" strokeLinecap="round" />
              </svg>
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setSel(0);
                }}
                onKeyDown={onKeyDown}
                placeholder={`Busca en toda la casa: ${TOTAL_SALAS} salas, módulos, cables…`}
                aria-label="Término de búsqueda"
                style={{
                  flex: 1,
                  background: "transparent",
                  border: 0,
                  outline: "none",
                  color: "#e8edf6",
                  font: "500 15px/1.3 ui-sans-serif,system-ui,sans-serif",
                }}
              />
              <kbd style={{ font: "600 9px/1 ui-monospace,monospace", letterSpacing: ".12em", color: "#6b7a90", border: "1px solid #22303f", borderRadius: 5, padding: "5px 6px" }}>
                ESC
              </kbd>
            </div>

            <div style={{ maxHeight: "58vh", overflowY: "auto", padding: "6px 0" }}>
              {hits.length === 0 && (
                <p style={{ margin: 0, padding: "18px 16px", color: "#8b98ad", fontSize: 13 }}>
                  {q.trim().length >= 3 && buscandoCables
                    ? "Buscando…"
                    : `Nada responde a «${q}». Prueba «gas», «3d», «foro», «divisas», «sala de guerra»…`}
                </p>
              )}
              {grupos.map((g) => {
                const delGrupo = hits.filter((h) => h.grupo === g);
                if (!delGrupo.length) return null;
                return (
                  <div key={g}>
                    <p style={{ margin: "8px 16px 4px", font: "700 9px/1 ui-monospace,monospace", letterSpacing: ".2em", color: "#5c6b80" }}>
                      {tituloGrupo[g]}
                    </p>
                    {delGrupo.map((h) => {
                      const i = hits.indexOf(h);
                      const on = i === sel;
                      return (
                        <button
                          key={h.clave}
                          type="button"
                          onMouseEnter={() => setSel(i)}
                          onClick={() => ir(h)}
                          style={{
                            display: "block",
                            width: "100%",
                            textAlign: "left",
                            background: on ? "#131c27" : "transparent",
                            border: 0,
                            borderLeft: on ? "2px solid #f5a623" : "2px solid transparent",
                            padding: "9px 16px",
                            cursor: "pointer",
                            color: "inherit",
                          }}
                        >
                          <span style={{ display: "block", fontSize: 13.5, fontWeight: 600, color: on ? "#fff" : "#dfe6f1" }}>
                            {h.titulo}
                          </span>
                          <span style={{ display: "block", fontSize: 11.5, color: "#7d8ba1", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {h.sub}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            <div style={{ borderTop: "1px solid #1a2431", padding: "8px 15px", font: "600 9px/1.4 ui-monospace,monospace", letterSpacing: ".14em", color: "#54637a" }}>
              ↑↓ ELEGIR · ENTER ABRIR · ESC CERRAR · {TOTAL_SALAS} SALAS · {RUTAS.length} PUERTAS · CABLES EN VIVO
            </div>
          </div>
        </div>
      )}
    </>
  );
}
