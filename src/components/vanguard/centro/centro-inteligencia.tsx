"use client";

// ═══════════════════════════════════════════════════════════════════════════
// v419.1 · LA CÁMARA DE INTELIGENCIA — el centro de investigación de Vanguard
//
// El flujo que pidió el Dueño, tal cual, en una sola pantalla:
//   escribir pregunta → seleccionar fuentes → investigar → guardar → continuar
//
// Lo que NO hace, porque no puede (y lo dice en la cara):
//   · no busca en la web abierta: busca en el corpus de la casa (dossiers,
//     enciclopedia, fichas de país, expedientes) y en el feed del núcleo;
//   · no adivina si el proveedor de modelo está caído: pasa a modo extractivo y
//     lo declara con la palabra «determinista» en la cabecera de la respuesta;
//   · no hace OCR ni guarda documentos en servidor: el texto vive en tu navegador.
// ═══════════════════════════════════════════════════════════════════════════

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BookMarked,
  Check,
  Copy,
  Download,
  FileText,
  FolderPlus,
  History,
  Layers,
  Loader2,
  Quote,
  Search,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import type {
  Comparacion,
  Documento,
  EntradaHistorial,
  Fuente,
  Informe,
  Investigacion,
  Proyecto,
  RespuestaDocumento,
  ViaFuente,
} from "@/lib/centro/tipos";
import {
  archivarInvestigacion,
  borrarDocumento,
  borrarInvestigacion,
  borrarProyecto,
  copiar,
  crearProyecto,
  descargar,
  exportarTodo,
  guardarDocumento,
  hayAlmacen,
  importarTodo,
  leerDocumentos,
  leerHistorial,
  leerProyectos,
  anadirHistorial,
  nuevoId,
} from "@/lib/centro/store";
import { archivarAuto, sugerirDestino } from "@/lib/centro/organizador";
import { Barra, Bloque, Boton, Chip, Etiqueta, Vacio } from "./piezas";

type Candidata = Fuente & { puntos: number; muestra: string[]; pasajesN: number };
type Tab = "investigar" | "documentos" | "proyectos" | "historial";

const VIAS: { id: ViaFuente; nombre: string }[] = [
  { id: "dossier", nombre: "Dossiers" },
  { id: "enciclopedia", nombre: "Enciclopedia" },
  { id: "pais", nombre: "Fichas de país" },
  { id: "concepto", nombre: "Expedientes" },
];

const MEDIDAS_DECLARADAS = [
  "El proveedor de modelo NO busca en Internet abierta: sintetiza sobre el material que la casa ya publica, más los documentos que tú subes.",
  "Sin proveedor disponible, la Cámara responde en modo extractivo: citas literales ordenadas por pertinencia, sin redacción. Nunca rellena el hueco con invención.",
  "La estación de documentos no hace OCR: un PDF escaneado (imagen) se rechaza en vez de devolver texto inventado.",
  "Lo guardado vive en este navegador (la base de datos de Vercel es efímera). Exporta el volcado si quieres llevarlo a otro sitio.",
];

export default function CentroInteligencia({
  censo,
  relacionadosIniciales,
  preguntaInicial,
}: {
  censo: { fuentes: number; pasajes: number; porVia: Record<string, number> };
  relacionadosIniciales: { titulo: string; ruta: string; porque: string }[];
  preguntaInicial?: string;
}) {
  const [tab, setTab] = useState<Tab>("investigar");
  const [aviso, setAviso] = useState<{ tono: "ok" | "error" | "info"; texto: string } | null>(null);

  // ── investigar
  const [pregunta, setPregunta] = useState(preguntaInicial ?? "");
  const [vias, setVias] = useState<ViaFuente[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [candidatas, setCandidatas] = useState<Candidata[]>([]);
  const [vivas, setVivas] = useState<Candidata[]>([]);
  const [elegidas, setElegidas] = useState<string[]>([]);
  const [investigando, setInvestigando] = useState(false);
  const [inv, setInv] = useState<Investigacion | null>(null);
  const [informe, setInforme] = useState<Informe | null>(null);
  const [generandoInforme, setGenerandoInforme] = useState(false);
  const [docsSeleccionados, setDocsSeleccionados] = useState<string[]>([]);

  // ── documentos
  const [docs, setDocs] = useState<Documento[]>([]);
  const [docActivoId, setDocActivoId] = useState<string | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [preguntaDoc, setPreguntaDoc] = useState("");
  const [respuestaDoc, setRespuestaDoc] = useState<RespuestaDocumento | null>(null);
  const [preguntandoDoc, setPreguntandoDoc] = useState(false);
  const [comparando, setComparando] = useState(false);
  const [comparacion, setComparacion] = useState<Comparacion | null>(null);
  const [docBId, setDocBId] = useState<string | null>(null);
  const [pegado, setPegado] = useState("");
  const inputArchivo = useRef<HTMLInputElement>(null);

  // ── proyectos / historial
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [historial, setHistorial] = useState<EntradaHistorial[]>([]);
  const [proyectoDestino, setProyectoDestino] = useState<string>("");
  const [nombreProyecto, setNombreProyecto] = useState("");
  const [proyectoAbierto, setProyectoAbierto] = useState<string | null>(null);
  const [importando, setImportando] = useState("");
  // ¿el navegador deja guardar? Se decide EN EL CLIENTE, después de montar:
  // preguntarlo durante el primer render hacía que el servidor pintara una cosa
  // («sin almacenamiento») y el navegador otra — error de hidratación #418.
  const [almacenOk, setAlmacenOk] = useState<boolean | null>(null);
  const inputImport = useRef<HTMLInputElement>(null);

  const docActivo = useMemo(() => docs.find((d) => d.id === docActivoId) ?? null, [docs, docActivoId]);

  useEffect(() => {
    setAlmacenOk(hayAlmacen());
    setDocs(leerDocumentos());
    setProyectos(leerProyectos());
    setHistorial(leerHistorial());
  }, []);

  const decir = useCallback((tono: "ok" | "error" | "info", texto: string) => {
    setAviso({ tono, texto });
    window.setTimeout(() => setAviso(null), 7000);
  }, []);

  // ── ① buscar fuentes ──────────────────────────────────────────────────
  const buscar = useCallback(async () => {
    if (pregunta.trim().length < 3) {
      decir("error", "Escribe una pregunta de al menos 3 caracteres.");
      return;
    }
    setBuscando(true);
    setInv(null);
    setInforme(null);
    try {
      const r = await fetch("/api/centro/buscar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pregunta, vias }),
      });
      const j = await r.json();
      if (!j.ok) {
        decir("error", j.error ?? "La búsqueda falló.");
        return;
      }
      setCandidatas(j.candidatas ?? []);
      setVivas(j.vivas ?? []);
      // preselección honesta: las tres mejores, para que el operador pueda
      // investigar en un clic sin dejar de elegir
      setElegidas([...(j.candidatas ?? []).slice(0, 3).map((c: Candidata) => c.id)]);
      if (!j.candidatas?.length && !j.vivas?.length) decir("info", j.avisos?.[0] ?? "Sin fuentes para esa pregunta.");
    } catch {
      decir("error", "No se pudo hablar con la Cámara (¿sin conexión?).");
    } finally {
      setBuscando(false);
    }
  }, [pregunta, vias, decir]);

  // ── ② investigar ──────────────────────────────────────────────────────
  const investigar = useCallback(
    async (sinModelo = false) => {
      if (!elegidas.length && !docsSeleccionados.length) {
        decir("error", "Marca al menos una fuente o un documento.");
        return;
      }
      setInvestigando(true);
      setInforme(null);
      try {
        const elegidos = candidatas.filter((c) => elegidas.includes(c.id));
        const vivasElegidas = vivas.filter((c) => elegidas.includes(c.id));
        const todas = [...elegidos, ...vivasElegidas];
        const documentos = docs.filter((d) => docsSeleccionados.includes(d.id));
        const r = await fetch("/api/centro/investigar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pregunta,
            fuentes: todas.map((f) => f.id),
            documentos,
            sinModelo,
          }),
        });
        const j = await r.json();
        if (!j.ok) {
          decir("error", j.error ?? "La investigación falló.");
          return;
        }
        setInv(j.investigacion as Investigacion);
        anadirHistorial({
          id: nuevoId("his"),
          pregunta: pregunta.slice(0, 200),
          cuando: new Date().toISOString(),
          motor: j.investigacion.motor,
          nFuentes: j.investigacion.fuentes.length,
          confianza: j.investigacion.confianza,
        });
        setHistorial(leerHistorial());
      } catch {
        decir("error", "La Cámara no respondió. Inténtalo otra vez.");
      } finally {
        setInvestigando(false);
      }
    },
    [pregunta, elegidas, candidatas, vivas, docs, docsSeleccionados, decir]
  );

  // ── ③ informe ─────────────────────────────────────────────────────────
  const generarInforme = useCallback(async () => {
    if (!inv) return;
    setGenerandoInforme(true);
    try {
      const r = await fetch("/api/centro/informe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ investigacion: inv }),
      });
      const j = await r.json();
      if (!j.ok) {
        decir("error", j.error ?? "No se pudo generar el informe.");
        return;
      }
      setInforme(j.informe as Informe);
      decir("ok", "Informe generado.");
    } catch {
      decir("error", "No se pudo generar el informe.");
    } finally {
      setGenerandoInforme(false);
    }
  }, [inv, decir]);

  const archivar = useCallback(() => {
    if (!inv) return;
    const documentos = docs
      .filter((d) => docsSeleccionados.includes(d.id))
      .map((d) => ({ id: d.id, nombre: d.nombre }));

    // sin proyecto elegido no se bloquea: el organizador decide y lo declara
    if (!proyectoDestino) {
      const r = archivarAuto(inv, documentos);
      if (!r.ok) {
        decir("error", r.error ?? "No se pudo guardar.");
        return;
      }
      setProyectos(leerProyectos());
      setHistorial(leerHistorial());
      decir(
        "ok",
        `${r.destino.crear ? "Proyecto creado" : "Archivado"} en «${r.destino.nombre}» (${r.destino.motivo}). Etiquetas: ${
          r.destino.etiquetas.join(" · ") || "ninguna"
        }.`
      );
      return;
    }

    const etiquetas = sugerirDestino(inv, proyectos, documentos).etiquetas;
    const r = archivarInvestigacion(proyectoDestino, inv, documentos, "", etiquetas);
    if (!r.ok) {
      decir("error", r.error ?? "No se pudo guardar.");
      return;
    }
    setProyectos(leerProyectos());
    setHistorial(leerHistorial());
    decir("ok", "Investigación guardada en el proyecto. Puedes cerrar y volver otro día.");
  }, [inv, proyectoDestino, proyectos, docs, docsSeleccionados, decir]);

  // ── documentos ────────────────────────────────────────────────────────
  const subir = useCallback(
    async (archivos: FileList | null) => {
      if (!archivos?.length) return;
      setSubiendo(true);
      for (const f of Array.from(archivos).slice(0, 4)) {
        const fd = new FormData();
        fd.append("archivo", f);
        try {
          const r = await fetch("/api/centro/documento", { method: "POST", body: fd });
          const j = await r.json();
          if (!j.ok) {
            decir("error", `${f.name}: ${j.error}`);
            continue;
          }
          const doc = j.documento as Documento;
          const g = guardarDocumento(doc);
          if (!g.ok) decir("error", `${f.name}: ${g.error}`);
          else if (g.recortado) decir("info", `${f.name}: leído. Se guardó el texto recortado (límite del navegador).`);
          else decir("ok", `${f.name}: ${doc.caracteres.toLocaleString("es-ES")} caracteres, calidad ${doc.calidad}.`);
        } catch {
          decir("error", `${f.name}: no se pudo subir.`);
        }
      }
      setDocs(leerDocumentos());
      setSubiendo(false);
      if (inputArchivo.current) inputArchivo.current.value = "";
    },
    [decir]
  );

  const pegarTexto = useCallback(async () => {
    if (pegado.trim().length < 40) {
      decir("error", "Pega al menos 40 caracteres.");
      return;
    }
    setSubiendo(true);
    try {
      const r = await fetch("/api/centro/documento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto: pegado, nombre: `Texto pegado ${new Date().toLocaleString("es-ES")}` }),
      });
      const j = await r.json();
      if (!j.ok) {
        decir("error", j.error ?? "No se pudo analizar el texto.");
        return;
      }
      guardarDocumento(j.documento as Documento);
      setDocs(leerDocumentos());
      setPegado("");
      decir("ok", "Texto analizado y guardado en tu navegador.");
    } catch {
      decir("error", "No se pudo analizar el texto.");
    } finally {
      setSubiendo(false);
    }
  }, [pegado, decir]);

  const preguntarAlDoc = useCallback(async () => {
    if (!docActivo || preguntaDoc.trim().length < 3) return;
    setPreguntandoDoc(true);
    setRespuestaDoc(null);
    try {
      const r = await fetch("/api/centro/documento/preguntar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documento: docActivo, pregunta: preguntaDoc }),
      });
      const j = await r.json();
      if (!j.ok) {
        decir("error", j.error ?? "No se pudo preguntar al documento.");
        return;
      }
      setRespuestaDoc(j as RespuestaDocumento);
    } catch {
      decir("error", "No se pudo preguntar al documento.");
    } finally {
      setPreguntandoDoc(false);
    }
  }, [docActivo, preguntaDoc, decir]);

  const comparar = useCallback(async () => {
    const a = docs.find((d) => d.id === docActivoId);
    const b = docs.find((d) => d.id === docBId);
    if (!a || !b || a.id === b.id) {
      decir("error", "Elige dos documentos distintos.");
      return;
    }
    setComparando(true);
    setComparacion(null);
    try {
      const r = await fetch("/api/centro/documento/comparar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ a, b }),
      });
      const j = await r.json();
      if (!j.ok) {
        decir("error", j.error ?? "No se pudo comparar.");
        return;
      }
      setComparacion(j.comparacion as Comparacion);
    } catch {
      decir("error", "No se pudo comparar.");
    } finally {
      setComparando(false);
    }
  }, [docs, docActivoId, docBId, decir]);

  const alternar = (id: string, lista: string[], set: (v: string[]) => void) =>
    set(lista.includes(id) ? lista.filter((x) => x !== id) : [...lista, id]);

  const abrirGuardada = (invGuardada: Investigacion) => {
    setInv(invGuardada);
    setPregunta(invGuardada.pregunta);
    setInforme(null);
    setTab("investigar");
    decir("info", "Investigación recuperada del proyecto. Puedes generar su informe otra vez o seguir tirando del hilo.");
  };

  // El organizador propone destino y etiquetas ANTES de guardar: el operador
  // ve a dónde va y con qué nombre, y puede corregirlo en el desplegable.
  const docsElegidos = docs.filter((d) => docsSeleccionados.includes(d.id)).map((d) => ({ id: d.id, nombre: d.nombre }));
  const destinoAuto = almacenOk && inv ? sugerirDestino(inv, proyectos, docsElegidos) : null;

  // ─────────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto w-full max-w-6xl px-3 pb-24 sm:px-6">
      {/* cabecera */}
      <header className="border-b border-border/60 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <Etiqueta tono="interp">Departamento de inteligencia</Etiqueta>
          {inv ? (
            <Etiqueta tono={inv.motor === "llm" ? "hecho" : "interp"}>
              {inv.motor === "llm" ? "motor: modelo + citas validadas" : "motor: determinista (extractivo)"}
            </Etiqueta>
          ) : null}
          {almacenOk === false ? <Etiqueta tono="noconf">sin almacenamiento local</Etiqueta> : null}
        </div>
        <p className="mt-2 max-w-3xl text-[13px] leading-relaxed text-muted-foreground">
          Pregunta, elige de dónde citar, investiga y guárdalo. Cada respuesta separa lo que las fuentes{" "}
          <span className="text-cyan-hud">dicen</span> de lo que se <span className="text-amber">interpreta</span> y de
          lo que <span className="text-red-hud">no está confirmado</span>.
        </p>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[12px] text-muted-foreground">
          <span>{censo.fuentes} fuentes · {censo.pasajes.toLocaleString("es-ES")} pasajes citables</span>
          <span>{docs.length}/4 documentos cargados</span>
          <span>{proyectos.length} proyectos</span>
        </div>
      </header>

      {/* pestañas */}
      <nav className="sticky top-0 z-10 -mx-3 mt-3 flex gap-1 overflow-x-auto border-b border-border/60 bg-background/95 px-3 py-2 backdrop-blur sm:-mx-6 sm:px-6" aria-label="Secciones de la cámara">
        {(
          [
            ["investigar", "Investigar", <Search key="s" className="h-3.5 w-3.5" />],
            ["documentos", "Documentos", <FileText key="f" className="h-3.5 w-3.5" />],
            ["proyectos", "Proyectos", <BookMarked key="b" className="h-3.5 w-3.5" />],
            ["historial", "Historial", <History key="h" className="h-3.5 w-3.5" />],
          ] as [Tab, string, React.ReactNode][]
        ).map(([id, nombre, icono]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            aria-current={tab === id ? "page" : undefined}
            className={`inline-flex min-h-[36px] shrink-0 items-center gap-1.5 rounded-sm border px-3 font-mono text-[12px] uppercase tracking-[0.16em] transition-colors ${
              tab === id ? "border-amber-hud bg-amber-hud text-amber" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {icono}
            {nombre}
          </button>
        ))}
      </nav>

      {aviso ? (
        <div
          role="status"
          className={`mt-3 flex items-start gap-2 rounded-sm border p-2.5 text-[12.5px] ${
            aviso.tono === "error"
              ? "border-red-hud bg-red-hud text-red-hud"
              : aviso.tono === "ok"
                ? "border-cyan-hud bg-cyan-hud text-cyan-hud"
                : "border-amber-hud bg-amber-hud text-amber"
          }`}
        >
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span className="flex-1">{aviso.texto}</span>
          <button type="button" onClick={() => setAviso(null)} aria-label="Cerrar aviso" className="p-1">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : null}

      {/* ══ INVESTIGAR ══ */}
      {tab === "investigar" ? (
        <div className="mt-4 space-y-4">
          <Bloque titulo="1 · La pregunta" tono="amber">
            <div className="flex flex-col gap-2">
              <textarea
                value={pregunta}
                onChange={(e) => setPregunta(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") buscar();
                }}
                rows={2}
                maxLength={400}
                placeholder="¿Qué quieres averiguar? Ej: «¿Quién controla la cadena de litografía ultravioleta y por qué es un cuello de botella?»"
                className="w-full resize-y rounded-sm border border-border bg-background/60 p-2.5 text-[13.5px] leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:border-amber-hud focus:outline-none"
              />
              <div className="flex flex-wrap items-center gap-2">
                <Boton onClick={buscar} disabled={buscando}>
                  {buscando ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
                  {buscando ? "Buscando" : "Buscar fuentes"}
                </Boton>
                <span className="font-mono text-[12px] text-muted-foreground">⌘/Ctrl + Enter</span>
                <div className="ml-auto flex flex-wrap gap-1">
                  {VIAS.map((v) => (
                    <Chip
                      key={v.id}
                      activo={vias.includes(v.id)}
                      onClick={() => setVias((p) => (p.includes(v.id) ? p.filter((x) => x !== v.id) : [...p, v.id]))}
                      titulo={`Restringir a ${v.nombre.toLowerCase()}`}
                    >
                      {v.nombre}
                    </Chip>
                  ))}
                </div>
              </div>
            </div>
          </Bloque>

          {candidatas.length || vivas.length || docs.length ? (
            <Bloque
              titulo="2 · De dónde citar"
              nota={`${elegidas.length} marcada(s)`}
              tono="cyan"
            >
              <div className="space-y-2">
                {candidatas.map((c) => (
                  <label
                    key={c.id}
                    className={`flex cursor-pointer items-start gap-2.5 rounded-sm border p-2.5 transition-colors ${
                      elegidas.includes(c.id) ? "border-cyan-hud/60 bg-cyan-hud/5" : "border-border/60 hover:border-border"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={elegidas.includes(c.id)}
                      onChange={() => alternar(c.id, elegidas, setElegidas)}
                      className="mt-1 h-4 w-4 shrink-0 accent-[var(--hud-cyan)]"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-1.5">
                        <Etiqueta>{c.via}</Etiqueta>
                        <span className="text-[13px] font-semibold text-foreground">{c.titulo}</span>
                        {c.fecha ? <span className="font-mono text-[11.5px] text-muted-foreground">{c.fecha}</span> : null}
                      </span>
                      <span className="mt-1 block text-[12.5px] leading-relaxed text-muted-foreground">{c.resumen}</span>
                      {c.muestra[0] ? (
                        <span className="mt-1 block border-l-2 border-border pl-2 font-mono text-[11.5px] italic leading-relaxed text-muted-foreground/80">
                          «{c.muestra[0].slice(0, 190)}…»
                        </span>
                      ) : null}
                      <span className="mt-1 flex flex-wrap items-center gap-2 font-mono text-[11.5px] text-muted-foreground">
                        <span>{c.emisor}</span>
                        {c.ruta ? (
                          <Link href={c.ruta} className="text-cyan-hud underline-offset-2 hover:underline">
                            abrir fuente ↗
                          </Link>
                        ) : null}
                        <span>{c.pasajesN} pasajes</span>
                      </span>
                    </span>
                  </label>
                ))}

                {vivas.length ? (
                  <div className="pt-1">
                    <p className="mb-1 font-mono text-[11.5px] uppercase tracking-[0.18em] text-muted-foreground">
                      del feed vivo del núcleo
                    </p>
                    {vivas.map((c) => (
                      <label key={c.id} className="flex cursor-pointer items-start gap-2.5 rounded-sm p-2 hover:bg-secondary/30">
                        <input
                          type="checkbox"
                          checked={elegidas.includes(c.id)}
                          onChange={() => alternar(c.id, elegidas, setElegidas)}
                          className="mt-1 h-4 w-4 shrink-0 accent-[var(--hud-cyan)]"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block text-[12.5px] text-foreground">{c.titulo}</span>
                          <span className="block font-mono text-[11.5px] text-muted-foreground">
                            {c.emisor} {c.fecha ? `· ${c.fecha}` : ""}
                            {c.ruta ? (
                              <>
                                {" · "}
                                <Link href={c.ruta} className="text-cyan-hud hover:underline">
                                  abrir ↗
                                </Link>
                              </>
                            ) : null}
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                ) : null}

                {docs.length ? (
                  <div className="border-t border-border/60 pt-2">
                    <p className="mb-1 font-mono text-[11.5px] uppercase tracking-[0.18em] text-muted-foreground">
                      tus documentos
                    </p>
                    {docs.map((d) => (
                      <label key={d.id} className="flex cursor-pointer items-start gap-2.5 rounded-sm p-2 hover:bg-secondary/30">
                        <input
                          type="checkbox"
                          checked={docsSeleccionados.includes(d.id)}
                          onChange={() => alternar(d.id, docsSeleccionados, setDocsSeleccionados)}
                          className="mt-1 h-4 w-4 shrink-0 accent-[var(--hud-amber)]"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block text-[12.5px] text-foreground">{d.nombre}</span>
                          <span className="block font-mono text-[11.5px] text-muted-foreground">
                            {d.caracteres.toLocaleString("es-ES")} caracteres · calidad {d.calidad} · {d.paginas} pág.
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                ) : null}

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <Boton onClick={() => investigar(false)} disabled={investigando} tono="cyan">
                    {investigando ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                    {investigando ? "Investigando…" : `Investigar (${elegidas.length + docsSeleccionados.length} fuentes)`}
                  </Boton>
                  <Boton onClick={() => investigar(true)} disabled={investigando} tono="fantasma" titulo="Sin llamar a ningún modelo: extractos literales con sus citas">
                    Sólo extractos
                  </Boton>
                  <Boton
                    onClick={() => {
                      const todos = [...candidatas, ...vivas].map((c) => c.id);
                      setElegidas(elegidas.length === todos.length ? [] : todos);
                    }}
                    tono="fantasma"
                  >
                    {elegidas.length === candidatas.length + vivas.length && elegidas.length > 0 ? "Quitar todas" : "Marcar todas"}
                  </Boton>
                </div>
              </div>
            </Bloque>
          ) : null}

          {investigando ? (
            <div className="flex items-center gap-2 rounded-sm border border-cyan-hud/40 bg-cyan-hud/5 p-3 text-[12.5px] text-cyan-hud">
              <Loader2 className="h-4 w-4 animate-spin" />
              Leyendo los pasajes, sintetizando y validando cada cita contra el material…
            </div>
          ) : null}

          {inv ? <PanelInvestigacion inv={inv} /> : null}

          {inv ? (
            <div className="flex flex-wrap items-center gap-2">
              <Boton onClick={generarInforme} disabled={generandoInforme}>
                {generandoInforme ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Layers className="h-3.5 w-3.5" />}
                {generandoInforme ? "Componiendo" : "Generar informe"}
              </Boton>
              <select
                value={proyectoDestino}
                onChange={(e) => setProyectoDestino(e.target.value)}
                className="min-h-[38px] rounded-sm border border-border bg-background px-2 font-mono text-[12px] text-foreground"
                aria-label="Proyecto donde guardar"
              >
                <option value="">
                  {destinoAuto
                    ? `automático: «${destinoAuto.nombre}»`
                    : "— guardar en proyecto —"}
                </option>
                {proyectos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
              <Boton
                onClick={archivar}
                tono="fantasma"
                titulo="Guarda esta investigación en el navegador: en el proyecto elegido o, si no eliges, en el que propone el organizador"
              >
                <BookMarked className="h-3.5 w-3.5" /> Guardar
              </Boton>
              {destinoAuto ? (
                <p className="w-full font-mono text-[11.5px] leading-snug text-muted-foreground">
                  Organizador: {destinoAuto.crear ? "creará" : "guardará en"} «{destinoAuto.nombre}» —{" "}
                  {destinoAuto.motivo}
                  {destinoAuto.etiquetas.length ? ` · etiquetas: ${destinoAuto.etiquetas.join(" · ")}` : ""}
                </p>
              ) : null}
              <Boton
                onClick={async () => {
                  const ok = await copiar(inv.sintesis + "\n\n" + inv.afirmaciones.map((a) => `[${a.clase}] ${a.texto}`).join("\n"));
                  decir(ok ? "ok" : "error", ok ? "Copiado al portapapeles." : "El navegador no dejó copiar.");
                }}
                tono="fantasma"
              >
                <Copy className="h-3.5 w-3.5" /> Copiar
              </Boton>
              <Boton
                onClick={() =>
                  descargar(
                    `vanguard-investigacion-${inv.pregunta.slice(0, 40).replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.md`,
                    [
                      `# ${inv.pregunta}`,
                      "",
                      inv.sintesis,
                      "",
                      "## HECHOS",
                      ...inv.afirmaciones.filter((a) => a.clase === "HECHO").map((a) => `- ${a.texto} [${a.fuentes.join(", ")}]`),
                      "",
                      "## INTERPRETACIÓN",
                      ...inv.afirmaciones.filter((a) => a.clase === "INTERPRETACION").map((a) => `- ${a.texto}`),
                      "",
                      "## NO CONFIRMADO",
                      ...inv.afirmaciones.filter((a) => a.clase === "NO_CONFIRMADO").map((a) => `- ${a.texto}`),
                      "",
                      "## FUENTES",
                      ...inv.fuentes.map((f) => `- ${f.titulo} — ${f.emisor}${f.ruta ? ` · ${f.ruta}` : ""}`),
                      "",
                      "## BIBLIOGRAFÍA",
                      ...inv.bibliografia.citas.map((c) => `- ${c}`),
                    ].join("\n")
                  )
                }
                tono="fantasma"
              >
                <Download className="h-3.5 w-3.5" /> .md
              </Boton>
            </div>
          ) : null}

          {informe ? <PanelInforme informe={informe} /> : null}

          {!inv && !candidatas.length && !buscando ? (
            <Bloque titulo="Cómo se usa" nota="sin humo">
              <ol className="space-y-1.5 text-[12.5px] leading-relaxed text-muted-foreground">
                <li>1 · Escribe la pregunta y pulsa <span className="text-amber">Buscar fuentes</span>. La Cámara mira en {censo.fuentes} fuentes de la casa y te enseña qué va a citar de cada una.</li>
                <li>2 · Marca las que quieras (o deja las tres que vienen marcadas) y pulsa <span className="text-cyan-hud">Investigar</span>.</li>
                <li>3 · Lee la respuesta en sus tres casillas: hechos con cita, interpretación y no confirmado.</li>
                <li>4 · Genera el informe, guárdalo en un proyecto y sigue mañana desde <span className="text-amber">Proyectos</span>.</li>
              </ol>
              {relacionadosIniciales.length ? (
                <div className="mt-3 border-t border-border/60 pt-2">
                  <p className="mb-1.5 font-mono text-[11.5px] uppercase tracking-[0.18em] text-muted-foreground">por dónde empezar</p>
                  <div className="flex flex-wrap gap-1.5">
                    {relacionadosIniciales.map((r) => (
                      <button
                        key={r.ruta}
                        type="button"
                        onClick={() => setPregunta(r.titulo)}
                        className="min-h-[32px] rounded-sm border border-border px-2 text-left font-mono text-[12px] text-muted-foreground transition-colors hover:border-amber-hud hover:text-amber"
                      >
                        {r.titulo}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </Bloque>
          ) : null}
        </div>
      ) : null}

      {/* ══ DOCUMENTOS ══ */}
      {tab === "documentos" ? (
        <div className="mt-4 space-y-4">
          <Bloque titulo="Subir documentos" nota="PDF · DOCX · TXT · MD · CSV · JSON" tono="amber">
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={inputArchivo}
                type="file"
                multiple
                accept=".pdf,.docx,.txt,.md,.csv,.json,.tsv,.xml,.html"
                onChange={(e) => subir(e.target.files)}
                className="hidden"
                id="centro-archivo"
              />
              <label
                htmlFor="centro-archivo"
                className="inline-flex min-h-[38px] cursor-pointer items-center gap-2 rounded-sm border border-amber-hud bg-amber-hud px-3.5 font-mono text-[12px] uppercase tracking-[0.16em] text-amber"
              >
                {subiendo ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                Elegir archivos
              </label>
              <span className="font-mono text-[12px] text-muted-foreground">
                máx. 4 MB por archivo · el texto no sale de tu navegador
              </span>
            </div>
            <details className="mt-3">
              <summary className="cursor-pointer font-mono text-[12px] uppercase tracking-[0.16em] text-muted-foreground">
                o pegar texto
              </summary>
              <textarea
                value={pegado}
                onChange={(e) => setPegado(e.target.value)}
                rows={5}
                placeholder="Pega aquí el texto de un informe, un cable, una resolución…"
                className="mt-2 w-full rounded-sm border border-border bg-background/60 p-2.5 text-[13px] text-foreground focus:border-amber-hud focus:outline-none"
              />
              <div className="mt-2">
                <Boton onClick={pegarTexto} disabled={subiendo} tono="fantasma">
                  Analizar texto
                </Boton>
              </div>
            </details>

            {docs.length ? (
              <div className="mt-3 space-y-1.5 border-t border-border/60 pt-2">
                {docs.map((d) => (
                  <div key={d.id} className="flex flex-wrap items-center gap-2 rounded-sm border border-border/60 p-2">
                    <button
                      type="button"
                      onClick={() => {
                        setDocActivoId(d.id === docActivoId ? null : d.id);
                        setRespuestaDoc(null);
                        setComparacion(null);
                      }}
                      className="min-h-[32px] flex-1 text-left text-[13px] text-foreground hover:text-amber"
                    >
                      {d.nombre}
                    </button>
                    <Etiqueta tono={d.calidad === "alta" ? "hecho" : d.calidad === "parcial" ? "interp" : "noconf"}>
                      {d.calidad}
                    </Etiqueta>
                    <span className="font-mono text-[11.5px] text-muted-foreground">
                      {d.caracteres.toLocaleString("es-ES")} car. · {d.paginas} pág.
                    </span>
                    <button
                      type="button"
                      aria-label={`Quitar ${d.nombre}`}
                      onClick={() => {
                        borrarDocumento(d.id);
                        setDocs(leerDocumentos());
                        if (docActivoId === d.id) setDocActivoId(null);
                      }}
                      className="p-1.5 text-muted-foreground hover:text-red-hud"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <Vacio>Aún no hay documentos. Sube un PDF con capa de texto o pega un informe y la Cámara te dirá fechas, lugares, nombres, cifras y qué se contradice.</Vacio>
            )}
          </Bloque>

          {docActivo ? (
            <>
              <Bloque titulo={`Entidades · ${docActivo.nombre}`} nota={`${docActivo.entidades.fechas.length} fechas · ${docActivo.entidades.lugares.length} lugares`} tono="cyan">
                {docActivo.avisos.length ? (
                  <ul className="mb-2 space-y-1">
                    {docActivo.avisos.map((a, i) => (
                      <li key={i} className="flex gap-1.5 text-[12px] leading-relaxed text-amber">
                        <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                        {a}
                      </li>
                    ))}
                  </ul>
                ) : null}
                <div className="grid gap-3 sm:grid-cols-2">
                  <ListaEntidades titulo="Fechas" items={docActivo.entidades.fechas.map((f) => `${f.valor}${f.iso ? ` → ${f.iso}` : ""} (${f.n})`)} />
                  <ListaEntidades titulo="Lugares (atlas real)" items={docActivo.entidades.lugares.map((l) => `${l.nombre}${l.iso ? ` [${l.iso.toUpperCase()}]` : ""} (${l.n})`)} />
                  <ListaEntidades titulo="Posibles nombres" items={docActivo.entidades.personas.map((p) => `${p.nombre} (${p.n})`)} nota="heurística de mayúsculas, no un NER entrenado" />
                  <ListaEntidades titulo="Organizaciones" items={docActivo.entidades.organizaciones.map((o) => `${o.nombre} (${o.n})`)} />
                  <ListaEntidades titulo="Cifras" items={docActivo.entidades.cifras.slice(0, 10).map((c) => `${c.valor} ${c.unidad}`)} />
                  <ListaEntidades titulo="Acontecimientos" items={docActivo.entidades.acontecimientos.slice(0, 6).map((a) => a.texto.slice(0, 120) + "…")} />
                </div>
              </Bloque>

              <Bloque titulo="Preguntar a este documento" tono="amber">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    value={preguntaDoc}
                    onChange={(e) => setPreguntaDoc(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") preguntarAlDoc();
                    }}
                    placeholder="¿Qué dice sobre los plazos? ¿Qué cifras da de producción?"
                    className="min-h-[38px] flex-1 rounded-sm border border-border bg-background/60 px-2.5 text-[13px] text-foreground focus:border-amber-hud focus:outline-none"
                  />
                  <Boton onClick={preguntarAlDoc} disabled={preguntandoDoc} tono="cyan">
                    {preguntandoDoc ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Quote className="h-3.5 w-3.5" />}
                    Preguntar
                  </Boton>
                </div>
                {respuestaDoc ? (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <Etiqueta tono={respuestaDoc.motor === "llm" ? "hecho" : "interp"}>
                        {respuestaDoc.motor === "llm" ? "modelo sobre el documento" : "extracto literal"}
                      </Etiqueta>
                      {respuestaDoc.vacio ? <Etiqueta tono="noconf">no está en el documento</Etiqueta> : null}
                    </div>
                    <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-foreground">{respuestaDoc.respuesta}</p>
                    {respuestaDoc.citas.map((c) => (
                      <blockquote key={`${c.n}-${c.pagina}`} className="border-l-2 border-cyan-hud/60 pl-2.5 font-mono text-[12px] leading-relaxed text-muted-foreground">
                        <span className="text-cyan-hud">pág. {c.pagina} · trozo {c.n + 1}</span> — {c.texto}
                      </blockquote>
                    ))}
                    {respuestaDoc.avisos.map((a, i) => (
                      <p key={i} className="font-mono text-[11.5px] text-amber">{a}</p>
                    ))}
                  </div>
                ) : null}
              </Bloque>

              {docs.length >= 2 ? (
                <Bloque titulo="Comparar con otro documento" nota="detector de contradicciones" tono="rojo">
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={docBId ?? ""}
                      onChange={(e) => setDocBId(e.target.value || null)}
                      className="min-h-[38px] rounded-sm border border-border bg-background px-2 font-mono text-[12px] text-foreground"
                      aria-label="Segundo documento"
                    >
                      <option value="">— segundo documento —</option>
                      {docs.filter((d) => d.id !== docActivo.id).map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.nombre}
                        </option>
                      ))}
                    </select>
                    <Boton onClick={comparar} disabled={comparando} tono="rojo">
                      {comparando ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Layers className="h-3.5 w-3.5" />}
                      Comparar
                    </Boton>
                  </div>

                  {comparacion ? (
                    <div className="mt-3 space-y-3">
                      <div>
                        <div className="mb-1 flex items-center justify-between font-mono text-[12px] text-muted-foreground">
                          <span>solapamiento léxico</span>
                          <span className="text-foreground">{comparacion.solapamiento}%</span>
                        </div>
                        <Barra valor={comparacion.solapamiento} tono={comparacion.solapamiento > 55 ? "rojo" : "amber"} />
                        <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground">{comparacion.veredicto}</p>
                      </div>

                      <div className="grid gap-2 sm:grid-cols-2">
                        <div>
                          <p className="font-mono text-[11.5px] uppercase tracking-[0.18em] text-muted-foreground">temas comunes</p>
                          <ul className="mt-1 space-y-1">
                            {comparacion.comunes.map((c) => (
                              <li key={c.tema} className="rounded-sm border border-border/60 p-1.5 text-[12px] text-muted-foreground">
                                <span className="text-foreground">{c.tema}</span>
                                <span className="mt-0.5 block italic">A: {c.enA.slice(0, 110)}…</span>
                                <span className="block italic">B: {c.enB.slice(0, 110)}…</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="font-mono text-[11.5px] uppercase tracking-[0.18em] text-muted-foreground">sólo en uno</p>
                          <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                            <span className="text-cyan-hud">A:</span> {comparacion.soloA.join(", ") || "—"}
                          </p>
                          <p className="text-[12px] leading-relaxed text-muted-foreground">
                            <span className="text-amber">B:</span> {comparacion.soloB.join(", ") || "—"}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="mb-1 font-mono text-[11.5px] uppercase tracking-[0.18em] text-red-hud">
                          contradicciones ({comparacion.contradicciones.length})
                        </p>
                        {comparacion.contradicciones.length ? (
                          <ul className="space-y-1.5">
                            {comparacion.contradicciones.map((c, i) => (
                              <li key={i} className="rounded-sm border border-red-hud/40 bg-red-hud/5 p-2 text-[12px] leading-relaxed">
                                <Etiqueta tono="noconf">{c.tipo}</Etiqueta>
                                <p className="mt-1 text-foreground">{c.explicacion}</p>
                                <p className="mt-1 font-mono text-[11.5px] text-muted-foreground">A: {c.a.texto.slice(0, 160)}…</p>
                                <p className="font-mono text-[11.5px] text-muted-foreground">B: {c.b.texto.slice(0, 160)}…</p>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-[12.5px] text-muted-foreground">
                            Ningún choque comprobable (cifra, fecha, atribución o polaridad) entre los dos documentos.
                          </p>
                        )}
                      </div>
                    </div>
                  ) : null}
                </Bloque>
              ) : null}
            </>
          ) : null}

          <Bloque titulo="Lo que esta estación no hace" nota="declarado, no escondido">
            <ul className="space-y-1.5 text-[12.5px] leading-relaxed text-muted-foreground">
              <li>· No hace OCR: un PDF escaneado sin capa de texto se rechaza con el motivo, en vez de devolver palabras inventadas.</li>
              <li>· No lee PDF cifrados ni notas al pie de un DOCX: si falta texto, el aviso de calidad lo dice.</li>
              <li>· No guarda nada en servidor: el documento vive en tu navegador (por eso hay un tope de 4 documentos y el texto se recorta avisando).</li>
            </ul>
          </Bloque>
        </div>
      ) : null}

      {/* ══ PROYECTOS ══ */}
      {tab === "proyectos" ? (
        <div className="mt-4 space-y-4">
          <Bloque titulo="Nuevo proyecto" nota="organiza por temas" tono="amber">
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                value={nombreProyecto}
                onChange={(e) => setNombreProyecto(e.target.value)}
                placeholder="Ej: «Cuellos de botella del silicio», «Mar Rojo 2026»"
                className="min-h-[38px] flex-1 rounded-sm border border-border bg-background/60 px-2.5 text-[13px] text-foreground focus:border-amber-hud focus:outline-none"
              />
              <Boton
                onClick={() => {
                  if (nombreProyecto.trim().length < 2) {
                    decir("error", "Ponle un nombre al proyecto.");
                    return;
                  }
                  crearProyecto(nombreProyecto);
                  setProyectos(leerProyectos());
                  setNombreProyecto("");
                  decir("ok", "Proyecto creado. Ya puedes guardar investigaciones dentro.");
                }}
              >
                <FolderPlus className="h-3.5 w-3.5" /> Crear
              </Boton>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border/60 pt-2">
              <Boton onClick={() => descargar(`vanguard-centro-${new Date().toISOString().slice(0, 10)}.json`, exportarTodo(), "application/json")} tono="fantasma">
                <Download className="h-3.5 w-3.5" /> Exportar todo
              </Boton>
              <input
                ref={inputImport}
                type="file"
                accept=".json"
                className="hidden"
                id="centro-importar"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const t = await f.text();
                  const r = importarTodo(t);
                  if (!r.ok) decir("error", r.error ?? "No se pudo importar.");
                  else {
                    setProyectos(leerProyectos());
                    setHistorial(leerHistorial());
                    decir("ok", `Importados ${r.proyectos} proyecto(s).`);
                  }
                  setImportando("");
                  if (inputImport.current) inputImport.current.value = "";
                }}
              />
              <label htmlFor="centro-importar" className="inline-flex min-h-[38px] cursor-pointer items-center gap-2 rounded-sm border border-border px-3.5 font-mono text-[12px] uppercase tracking-[0.16em] text-muted-foreground hover:text-amber">
                <Upload className="h-3.5 w-3.5" /> Importar
              </label>
              {importando ? <span className="font-mono text-[11.5px] text-muted-foreground">{importando}</span> : null}
            </div>
            <p className="mt-2 font-mono text-[11.5px] leading-relaxed text-muted-foreground/80">
              Todo lo guardado vive en este navegador. Exporta el .json si quieres conservarlo al cambiar de equipo.
            </p>
          </Bloque>

          {proyectos.length ? (
            proyectos.map((p) => (
              <Bloque key={p.id} titulo={p.nombre} nota={`${p.investigaciones.length} investigaciones · ${p.actualizado.slice(0, 10)}`}>
                <div className="space-y-1.5">
                  {p.investigaciones.length ? (
                    p.investigaciones.map((g) => (
                      <div key={g.id} className="flex flex-wrap items-center gap-2 rounded-sm border border-border/60 p-2">
                        <button
                          type="button"
                          onClick={() => abrirGuardada(g.investigacion)}
                          className="min-h-[32px] flex-1 text-left text-[12.5px] text-foreground hover:text-amber"
                        >
                          {g.titulo}
                        </button>
                        <Etiqueta tono={g.investigacion.motor === "llm" ? "hecho" : "interp"}>
                          {g.investigacion.motor === "llm" ? "modelo" : "extractivo"}
                        </Etiqueta>
                        <span className="font-mono text-[11.5px] text-muted-foreground">
                          {g.investigacion.fuentes.length} fuentes · conf. {g.investigacion.confianza}
                        </span>
                        {g.etiquetas.length ? (
                          <span className="font-mono text-[11.5px] text-amber/80">{g.etiquetas.join(" · ")}</span>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => {
                            borrarInvestigacion(p.id, g.id);
                            setProyectos(leerProyectos());
                          }}
                          aria-label="Quitar investigación"
                          className="p-1.5 text-muted-foreground hover:text-red-hud"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <Vacio>Proyecto vacío. Investiga algo y guárdalo aquí desde la pestaña Investigar.</Vacio>
                  )}
                </div>
                <div className="mt-2 flex gap-2 border-t border-border/60 pt-2">
                  <Boton
                    tono="fantasma"
                    onClick={() => {
                      setProyectoDestino(p.id);
                      setTab("investigar");
                      decir("info", `Se guardará en «${p.nombre}». Investiga y pulsa Guardar.`);
                    }}
                  >
                    <ArrowRight className="h-3.5 w-3.5" /> Investigar para este proyecto
                  </Boton>
                  <Boton
                    tono="rojo"
                    onClick={() => {
                      borrarProyecto(p.id);
                      setProyectos(leerProyectos());
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Borrar
                  </Boton>
                </div>
              </Bloque>
            ))
          ) : (
            <Vacio>Sin proyectos todavía. Crea uno y cada investigación quedará archivada dentro, con sus fuentes.</Vacio>
          )}
        </div>
      ) : null}

      {/* ══ HISTORIAL ══ */}
      {tab === "historial" ? (
        <div className="mt-4 space-y-4">
          <Bloque titulo="Historial de investigaciones" nota={`${historial.length} entradas`}>
            {historial.length ? (
              <ul className="space-y-1.5">
                {historial.map((h) => (
                  <li key={h.id} className="flex flex-wrap items-center gap-2 border-b border-border/40 py-1.5 last:border-0">
                    <button
                      type="button"
                      onClick={() => {
                        setPregunta(h.pregunta);
                        setTab("investigar");
                      }}
                      className="min-h-[32px] flex-1 text-left text-[12.5px] text-foreground hover:text-amber"
                    >
                      {h.pregunta}
                    </button>
                    <Etiqueta tono={h.motor === "llm" ? "hecho" : "interp"}>{h.motor === "llm" ? "modelo" : "extractivo"}</Etiqueta>
                    <span className="font-mono text-[11.5px] text-muted-foreground">
                      {h.cuando.slice(0, 16).replace("T", " ")} · {h.nFuentes} fuentes · {h.confianza}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <Vacio>Cada pregunta que investigues queda aquí, para retomarla sin volver a escribirla.</Vacio>
            )}
            {historial.length ? (
              <div className="mt-2">
                <Boton
                  tono="rojo"
                  onClick={() => {
                    borrarHistorialLocal(setHistorial);
                    decir("ok", "Historial borrado.");
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" /> Borrar historial
                </Boton>
              </div>
            ) : null}
          </Bloque>

          <Bloque titulo="Medidas declaradas" nota="lo que la Cámara no promete">
            <ul className="space-y-1.5 text-[12.5px] leading-relaxed text-muted-foreground">
              {MEDIDAS_DECLARADAS.map((m) => (
                <li key={m} className="flex gap-1.5">
                  <Check className="mt-0.5 h-3 w-3 shrink-0 text-amber" />
                  {m}
                </li>
              ))}
            </ul>
          </Bloque>
        </div>
      ) : null}
    </div>
  );
}

/** Borra el historial del navegador y refresca el estado local. */
function borrarHistorialLocal(set: (v: EntradaHistorial[]) => void) {
  try {
    localStorage.removeItem("vg:centro:v1:historial");
  } catch {
    /* sin almacenamiento: nada que borrar */
  }
  set([]);
}

function ListaEntidades({ titulo, items, nota }: { titulo: string; items: string[]; nota?: string }) {
  return (
    <div>
      <p className="font-mono text-[11.5px] uppercase tracking-[0.18em] text-muted-foreground">
        {titulo} {nota ? <span className="normal-case tracking-normal text-muted-foreground/60">· {nota}</span> : null}
      </p>
      {items.length ? (
        <ul className="mt-1 flex flex-wrap gap-1">
          {items.slice(0, 18).map((x) => (
            <li key={x} className="rounded-sm border border-border/60 px-1.5 py-0.5 font-mono text-[11.5px] text-muted-foreground">
              {x}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-1 font-mono text-[11.5px] text-muted-foreground/60">— ninguno detectado</p>
      )}
    </div>
  );
}

// ── Panel de la investigación ───────────────────────────────────────────

function PanelInvestigacion({ inv }: { inv: Investigacion }) {
  const hechos = inv.afirmaciones.filter((a) => a.clase === "HECHO");
  const interps = inv.afirmaciones.filter((a) => a.clase === "INTERPRETACION");
  const noconf = inv.afirmaciones.filter((a) => a.clase === "NO_CONFIRMADO");
  const nombreFuente = (id: string) => inv.fuentes.find((f) => f.id === id)?.titulo ?? id;

  return (
    <div className="space-y-3">
      <Bloque
        titulo="3 · La respuesta"
        nota={`${inv.ms} ms · confianza ${inv.confianza}/100`}
        tono={inv.motor === "llm" ? "cyan" : "amber"}
      >
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          <Etiqueta tono={inv.motor === "llm" ? "hecho" : "interp"}>
            {inv.motor === "llm" ? "síntesis de modelo · citas validadas" : "extractivo · sin modelo"}
          </Etiqueta>
          <Etiqueta>{inv.fuentes.length} fuentes</Etiqueta>
          <Etiqueta>{inv.pasajes.length} pasajes</Etiqueta>
          {inv.contradicciones.length ? <Etiqueta tono="noconf">{inv.contradicciones.length} contradicción(es)</Etiqueta> : null}
        </div>
        <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed text-foreground">{inv.sintesis}</p>
        <div className="mt-2">
          <Barra valor={inv.confianza} tono={inv.confianza > 66 ? "cyan" : inv.confianza > 33 ? "amber" : "rojo"} />
        </div>
        {inv.avisos.length ? (
          <ul className="mt-2 space-y-1">
            {inv.avisos.map((a, i) => (
              <li key={i} className="flex gap-1.5 font-mono text-[11.5px] leading-relaxed text-amber">
                <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                {a}
              </li>
            ))}
          </ul>
        ) : null}
      </Bloque>

      <div className="grid gap-3 lg:grid-cols-3">
        <Bloque titulo={`Hechos con fuente (${hechos.length})`} tono="cyan">
          {hechos.length ? (
            <ul className="space-y-2">
              {hechos.map((a, i) => (
                <li key={i} className="text-[12.5px] leading-relaxed text-foreground">
                  {a.texto}
                  <span className="mt-0.5 flex flex-wrap gap-1">
                    {a.fuentes.map((f) => (
                      <span key={f} className="rounded-sm border border-cyan-hud/50 px-1 font-mono text-[11px] text-cyan-hud" title={nombreFuente(f)}>
                        {nombreFuente(f).slice(0, 34)}
                      </span>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <Vacio>Ninguna afirmación quedó con cita válida. Es una respuesta legítima: el material no lo sostiene.</Vacio>
          )}
        </Bloque>

        <Bloque titulo={`Interpretación (${interps.length})`} tono="amber">
          {interps.length ? (
            <ul className="space-y-2">
              {interps.map((a, i) => (
                <li key={i} className="text-[12.5px] leading-relaxed text-muted-foreground">
                  {a.texto}
                </li>
              ))}
            </ul>
          ) : (
            <Vacio>Sin interpretación: se ha preferido no leer más de lo que dicen las fuentes.</Vacio>
          )}
        </Bloque>

        <Bloque titulo={`No confirmado (${noconf.length})`} tono="rojo">
          {noconf.length ? (
            <ul className="space-y-2">
              {noconf.map((a, i) => (
                <li key={i} className="text-[12.5px] leading-relaxed text-muted-foreground">
                  {a.texto}
                  {a.nota ? <span className="mt-0.5 block font-mono text-[11px] text-red-hud">{a.nota}</span> : null}
                </li>
              ))}
            </ul>
          ) : (
            <Vacio>Nada quedó en el limbo.</Vacio>
          )}
        </Bloque>
      </div>

      {inv.clave.length ? (
        <Bloque titulo="Consecuencias señaladas">
          <ul className="space-y-1">
            {inv.clave.map((c, i) => (
              <li key={i} className="flex gap-1.5 text-[12.5px] leading-relaxed text-foreground">
                <ArrowRight className="mt-1 h-3 w-3 shrink-0 text-amber" />
                {c}
              </li>
            ))}
          </ul>
        </Bloque>
      ) : null}

      {inv.contradicciones.length ? (
        <Bloque titulo={`Las fuentes se contradicen (${inv.contradicciones.length})`} nota="comprobable a mano" tono="rojo">
          <ul className="space-y-2">
            {inv.contradicciones.map((c, i) => (
              <li key={i} className="rounded-sm border border-red-hud/40 bg-red-hud/5 p-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Etiqueta tono="noconf">{c.tipo}</Etiqueta>
                  <span className="font-mono text-[11.5px] text-muted-foreground">{c.tema}</span>
                </div>
                <p className="mt-1 text-[12.5px] leading-relaxed text-foreground">{c.explicacion}</p>
                <p className="mt-1 font-mono text-[11.5px] leading-relaxed text-muted-foreground">
                  A ({nombreFuente(c.a.fuenteId).slice(0, 28)}): {c.a.texto.slice(0, 150)}…
                </p>
                <p className="font-mono text-[11.5px] leading-relaxed text-muted-foreground">
                  B ({nombreFuente(c.b.fuenteId).slice(0, 28)}): {c.b.texto.slice(0, 150)}…
                </p>
              </li>
            ))}
          </ul>
        </Bloque>
      ) : null}

      {inv.pasajes.length ? (
        <Bloque titulo="Pasajes citados" nota={`${inv.pasajes.length}`}>
          <ol className="space-y-2">
            {inv.pasajes.slice(0, 10).map((p) => (
              <li key={`${p.fuenteId}-${p.n}`} className="border-l-2 border-border pl-2.5">
                <p className="font-mono text-[11.5px] text-cyan-hud">
                  {nombreFuente(p.fuenteId)} · {p.donde}
                </p>
                <p className="text-[12.5px] leading-relaxed text-muted-foreground">{p.texto.slice(0, 320)}…</p>
              </li>
            ))}
          </ol>
        </Bloque>
      ) : null}

      <div className="grid gap-3 lg:grid-cols-2">
        <Bloque titulo="Lagunas de evidencia" tono="rojo">
          {inv.vacios.length ? (
            <ul className="space-y-1">
              {inv.vacios.map((v, i) => (
                <li key={i} className="text-[12.5px] leading-relaxed text-muted-foreground">· {v}</li>
              ))}
            </ul>
          ) : (
            <Vacio>Sin lagunas declaradas.</Vacio>
          )}
        </Bloque>

        <Bloque titulo="Temas relacionados" nota="del corpus real">
          {inv.relacionados.length ? (
            <ul className="space-y-1.5">
              {inv.relacionados.map((r) => (
                <li key={r.ruta} className="text-[12.5px] leading-relaxed">
                  <Link href={r.ruta} className="text-cyan-hud underline-offset-2 hover:underline">
                    {r.titulo}
                  </Link>
                  <span className="block font-mono text-[11.5px] text-muted-foreground">{r.porque}</span>
                </li>
              ))}
            </ul>
          ) : (
            <Vacio>Sin vecinos claros en el corpus.</Vacio>
          )}
        </Bloque>
      </div>

      <Bloque titulo="Bibliografía" nota={`${inv.bibliografia.entradas.length} referencias`}>
        {inv.bibliografia.citas.length ? (
          <>
            <ol className="space-y-1">
              {inv.bibliografia.citas.map((c, i) => (
                <li key={i} className="text-[12px] leading-relaxed text-muted-foreground">{c}</li>
              ))}
            </ol>
            {inv.bibliografia.bibtex ? (
              <details className="mt-2">
                <summary className="cursor-pointer font-mono text-[11.5px] uppercase tracking-[0.16em] text-muted-foreground">
                  bibtex
                </summary>
                <pre className="mt-1 max-h-56 overflow-auto rounded-sm border border-border/60 bg-background/60 p-2 font-mono text-[11px] text-muted-foreground">
                  {inv.bibliografia.bibtex}
                </pre>
              </details>
            ) : null}
          </>
        ) : (
          <Vacio>Las fuentes elegidas no traen referencias metodológicas propias; las citas de arriba son los documentos de la casa.</Vacio>
        )}
      </Bloque>
    </div>
  );
}

function PanelInforme({ informe }: { informe: Informe }) {
  return (
    <Bloque titulo="4 · Informe estructurado" nota={`${informe.secciones.length} secciones · motor ${informe.motor}`} tono="amber">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-[15px] font-semibold leading-snug text-foreground">{informe.titulo}</h2>
        <Boton
          tono="fantasma"
          onClick={() => descargar(`vanguard-informe-${new Date().toISOString().slice(0, 10)}.md`, informe.markdown)}
        >
          <Download className="h-3.5 w-3.5" /> Descargar .md
        </Boton>
        <Boton
          tono="fantasma"
          onClick={async () => {
            const ok = await copiar(informe.markdown);
            if (!ok) alert("El navegador no permitió copiar. Usa Descargar .md.");
          }}
        >
          <Copy className="h-3.5 w-3.5" /> Copiar
        </Boton>
      </div>
      <div className="mt-3 space-y-3">
        {informe.secciones.map((s) => (
          <section key={s.titulo}>
            <h3 className="font-mono text-[11.5px] uppercase tracking-[0.2em] text-amber">{s.titulo}</h3>
            <div className="mt-1 space-y-1">
              {s.parrafos.map((p, i) => (
                <p key={i} className="text-[12.5px] leading-relaxed text-muted-foreground">{p}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
      {informe.avisos.length ? (
        <ul className="mt-3 space-y-1 border-t border-border/60 pt-2">
          {informe.avisos.map((a, i) => (
            <li key={i} className="font-mono text-[11.5px] text-amber">{a}</li>
          ))}
        </ul>
      ) : null}
    </Bloque>
  );
}
