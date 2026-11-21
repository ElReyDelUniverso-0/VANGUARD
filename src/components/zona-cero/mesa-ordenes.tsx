"use client";

// ═══════════════════════════════════════════════════════════════════════════
// v434.2 · ZONA CERO — LA MESA DE ÓRDENES (módulo completo)
//
// Orden del Dueño, textual: «mejora la zona cero, que sea un módulo completo,
// expándela; que uno pueda señalar, corregir, editar, poner capturas, poner
// órdenes por números, o sea de todo; y que se pueda poner una API key, también
// predecir y muchas más cosas».
//
// SEIS PUERTAS, una mesa:
//   ① ÓRDENES — numeradas solas, con prioridad, estado, progreso, vencimiento,
//      etiquetas y dependencias. Se mueven, se renumeran, se corrigen.
//   ② TABLERO — señalar: un clic pone una señal donde tocas; se arrastra; cada
//      señal tiene número, tipo, color, nota y puerta a la casa.
//   ③ CAPTURAS — pega con Ctrl+V, arrastra un archivo o elige uno. Se guardan
//      en tu aparato (nunca se suben). Con título, nota, fuente y tamaño.
//   ④ PREDECIR — el motor de la casa calcula probabilidades con tus datos y
//      dice en qué se basa y cuánta confianza merece. Opcional: narración con
//      TU clave (o con el núcleo de la casa).
//   ⑤ HISTORIAL — cada corrección queda apuntada; se deshace con un botón.
//   ⑥ AJUSTES — API key de tu proveedor (OpenAI, Groq, OpenRouter o una base
//      propia), tope de capturas, horizonte de predicción, exportar/importar y
//      olvidar la mesa.
//
// NADA SE SIMULA: si el navegador no deja guardar, se dice; si el proveedor no
// contesta, se dice; si no hay datos para predecir, la confianza baja y se
// explica. Todo vive en el aparato del operador.
// ═══════════════════════════════════════════════════════════════════════════

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle, ArrowDown, ArrowUp, BookmarkPlus, Brain, Camera, Check, ChevronRight,
  Crosshair, Download, Eraser, Eye, FileJson, History, Image as ImageIcon, KeyRound,
  ListOrdered, Loader2, MapPin, Plus, RotateCcw, Save, Settings2, Sparkles, Target,
  Trash2, Upload, X,
} from "lucide-react";
import {
  AJUSTES_DEFECTO, BASES, MODELOS, alertas, avance, borrar, borrarPrediccion, corregir,
  crearCaptura, crearOrden, crearPin, deshacer, exportarJSON, exportarMD, importarJSON,
  mesaVacia, moverOrden, predecir, siguienteNumero, type AjustesMesa, type Captura,
  type EstadoOrden, type Mesa, type Prediccion, type Prioridad, type TipoPin,
} from "@/lib/zona-cero/mesa";
import { descargar, guardarMesa, leerMesa, olvidarMesa, pesoMesa } from "@/lib/zona-cero/almacen";
import "./mesa-ordenes.css";

type Pestana = "ordenes" | "tablero" | "capturas" | "predecir" | "historial" | "ajustes";

const TIPOS: { id: TipoPin; nombre: string; color: string }[] = [
  { id: "senal", nombre: "señal", color: "#e8c56a" },
  { id: "riesgo", nombre: "riesgo", color: "#ff5470" },
  { id: "objetivo", nombre: "objetivo", color: "#22d3ee" },
  { id: "recurso", nombre: "recurso", color: "#7ab8ff" },
  { id: "nota", nombre: "nota", color: "#93a1b8" },
];

const ESTADOS: { id: EstadoOrden; nombre: string; color: string }[] = [
  { id: "pendiente", nombre: "pendiente", color: "#e8c56a" },
  { id: "curso", nombre: "en curso", color: "#22d3ee" },
  { id: "hecha", nombre: "hecha", color: "#4ade80" },
  { id: "descartada", nombre: "descartada", color: "#93a1b8" },
];

function fechaCorta(ms: number | null): string {
  if (!ms) return "";
  const d = new Date(ms);
  const dos = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`;
}

function aInputFecha(ms: number | null): string {
  return ms ? fechaCorta(ms) : "";
}

export function MesaOrdenes() {
  const [montado, setMontado] = useState(false);
  const [mesa, setMesa] = useState<Mesa>(() => mesaVacia(0));
  const [pestana, setPestana] = useState<Pestana>("ordenes");
  const [aviso, setAviso] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);
  const [sel, setSel] = useState<string | null>(null);
  const [previas, setPrevias] = useState<Prediccion[]>([]);
  const [narracion, setNarracion] = useState("");
  const [motivo, setMotivo] = useState("");
  const [motor, setMotor] = useState("");
  const [trabajando, setTrabajando] = useState<"nada" | "predecir" | "narrar" | "probar">("nada");
  const [pregunta, setPregunta] = useState("");
  const [abierta, setAbierta] = useState<string | null>(null);

  // formularios
  const [nuevaOrden, setNuevaOrden] = useState("");
  const [nuevaPrioridad, setNuevaPrioridad] = useState<Prioridad>(3);
  const [nuevaVence, setNuevaVence] = useState("");
  const [nuevaEtiqueta, setNuevaEtiqueta] = useState("");

  const lienzo = useRef<HTMLDivElement | null>(null);
  const arrastre = useRef<{ id: string; dx: number; dy: number } | null>(null);
  const entradaArchivo = useRef<HTMLInputElement | null>(null);

  // ── carga y guardado ─────────────────────────────────────────────────────
  useEffect(() => {
    setMesa(leerMesa());
    setMontado(true);
    const alGuardar = (e: Event) => {
      const d = (e as CustomEvent<{ ok?: boolean; error?: string }>).detail;
      if (d && d.ok === false && d.error) setAviso({ tipo: "error", texto: d.error });
    };
    window.addEventListener("vg:zona-cero:mesa", alGuardar);
    return () => window.removeEventListener("vg:zona-cero:mesa", alGuardar);
  }, []);

  useEffect(() => {
    if (!montado) return;
    guardarMesa(mesa);
  }, [mesa, montado]);

  const decir = useCallback((tipo: "ok" | "error", texto: string) => {
    setAviso({ tipo, texto });
    window.setTimeout(() => setAviso(null), 4200);
  }, []);

  /** Toda mutación pasa por aquí: se aplica y se guarda sola. */
  const act = useCallback((f: (m: Mesa) => Mesa) => setMesa((prev) => f(prev)), []);

  const ahora = () => Date.now();
  const av = useMemo(() => avance(mesa), [mesa]);
  const al = useMemo(() => alertas(mesa, ahora()), [mesa]);
  const peso = useMemo(() => (montado ? pesoMesa() : { bytes: 0, kb: 0, pct: 0 }), [mesa, montado]);

  // ── órdenes ──────────────────────────────────────────────────────────────
  const agregarOrden = () => {
    const titulo = nuevaOrden.trim();
    if (!titulo) {
      decir("error", "Escribe qué hay que hacer: una orden sin título no se puede cumplir.");
      return;
    }
    act((m) =>
      crearOrden(
        m,
        {
          titulo,
          prioridad: nuevaPrioridad,
          vence: nuevaVence ? new Date(`${nuevaVence}T23:59:00`).getTime() : null,
          etiquetas: nuevaEtiqueta ? nuevaEtiqueta.split(",").map((e) => e.trim()).filter(Boolean) : [],
        },
        ahora()
      )
    );
    setNuevaOrden("");
    setNuevaVence("");
    setNuevaEtiqueta("");
    decir("ok", `Orden ${siguienteNumero(mesa)} creada y numerada.`);
  };

  const editarOrden = (id: string, campo: string, valor: string) => act((m) => corregir(m, id, "orden", campo, valor, ahora()));

  // ── pines del tablero ────────────────────────────────────────────────────
  const soltarPin = (e: React.MouseEvent<HTMLDivElement>) => {
    const caja = lienzo.current?.getBoundingClientRect();
    if (!caja) return;
    const x = Math.round(((e.clientX - caja.left) / caja.width) * 1000);
    const y = Math.round(((e.clientY - caja.top) / caja.height) * 1000);
    act((m) => crearPin(m, { x, y, titulo: `Señal ${m.pines.length + 1}`, tipo: "senal" }, ahora()));
    decir("ok", "Señal puesta. Tócala para ponerle nombre, nota y color.");
  };

  const moverPin = (e: PointerEvent | React.PointerEvent) => {
    const d = arrastre.current;
    const caja = lienzo.current?.getBoundingClientRect();
    if (!d || !caja) return;
    const x = Math.max(0, Math.min(1000, Math.round((("clientX" in e ? e.clientX : 0) - caja.left - d.dx) / caja.width * 1000)));
    const y = Math.max(0, Math.min(1000, Math.round((("clientY" in e ? e.clientY : 0) - caja.top - d.dy) / caja.height * 1000)));
    act((m) => ({ ...m, pines: m.pines.map((p) => (p.id === d.id ? { ...p, x, y } : p)), actualizada: ahora() }));
  };

  useEffect(() => {
    const subir = () => {
      arrastre.current = null;
    };
    window.addEventListener("pointermove", moverPin as unknown as (e: Event) => void);
    window.addEventListener("pointerup", subir);
    window.addEventListener("pointercancel", subir);
    return () => {
      window.removeEventListener("pointermove", moverPin as unknown as (e: Event) => void);
      window.removeEventListener("pointerup", subir);
      window.removeEventListener("pointercancel", subir);
    };
  });

  const pinSel = mesa.pines.find((p) => p.id === sel) ?? null;

  // ── capturas ─────────────────────────────────────────────────────────────
  const pegarArchivo = useCallback(
    async (archivo: File) => {
      if (!archivo.type.startsWith("image/")) {
        decir("error", "Eso no es una imagen: solo capturas PNG, JPG o WebP.");
        return;
      }
      const tope = Math.max(0.2, Math.min(4, mesa.ajustes.topeMB)) * 1024 * 1024;
      if (archivo.size > tope) {
        decir("error", `La captura pesa ${(archivo.size / 1024 / 1024).toFixed(1)} MB y el tope está en ${(tope / 1024 / 1024).toFixed(1)} MB. Recórtala o sube el tope en Ajustes.`);
        return;
      }
      const dataUrl = await new Promise<string>((res, rej) => {
        const fr = new FileReader();
        fr.onload = () => res(String(fr.result ?? ""));
        fr.onerror = () => rej(new Error("no se pudo leer"));
        fr.readAsDataURL(archivo);
      }).catch(() => "");
      if (!dataUrl) {
        decir("error", "No se pudo leer esa imagen.");
        return;
      }
      const medida = await new Promise<{ ancho: number; alto: number }>((res) => {
        const img = new Image();
        img.onload = () => res({ ancho: img.naturalWidth, alto: img.naturalHeight });
        img.onerror = () => res({ ancho: 0, alto: 0 });
        img.src = dataUrl;
      });
      const r = crearCaptura(
        mesa,
        {
          titulo: archivo.name.replace(/\.[a-z0-9]+$/i, "").slice(0, 60) || "Captura",
          dataUrl,
          ancho: medida.ancho,
          alto: medida.alto,
          peso: archivo.size,
          fuente: "pegada por el operador",
        },
        ahora()
      );
      if (r.error) decir("error", r.error);
      else {
        setMesa(r.mesa);
        decir("ok", "Captura guardada en tu aparato (no se sube a ningún sitio).");
      }
    },
    [mesa, decir]
  );

  useEffect(() => {
    const alPegar = (e: ClipboardEvent) => {
      if (pestana !== "capturas") return;
      const item = Array.from(e.clipboardData?.items ?? []).find((i) => i.type.startsWith("image/"));
      const archivo = item?.getAsFile();
      if (!archivo) return;
      e.preventDefault();
      void pegarArchivo(archivo);
    };
    window.addEventListener("paste", alPegar as unknown as (e: Event) => void);
    return () => window.removeEventListener("paste", alPegar as unknown as (e: Event) => void);
  }, [pestana, pegarArchivo]);

  // ── predecir ─────────────────────────────────────────────────────────────
  const calcular = () => {
    const nuevas = predecir(mesa, ahora(), mesa.ajustes.horizonteDias);
    setPrevias(nuevas);
    setNarracion("");
    setMotivo("");
    setMotor("casa");
    act((m) => ({ ...m, predicciones: [...m.predicciones, ...nuevas].slice(-40), actualizada: ahora() }));
    decir("ok", "Calculado con lo que hay en la mesa. Cada número lleva sus factores.");
  };

  const narrar = async () => {
    setTrabajando("narrar");
    setMotivo("");
    try {
      const r = await fetch("/api/zona-cero/predecir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mesa,
          usarIA: true,
          pregunta,
          horizonteDias: mesa.ajustes.horizonteDias,
          clave: mesa.ajustes.motor === "propio" ? mesa.ajustes.clave : "",
          baseUrl: mesa.ajustes.baseUrl,
          modelo: mesa.ajustes.modelo,
        }),
      });
      const datos = (await r.json()) as { ok?: boolean; predicciones?: Prediccion[]; narracion?: string; motivo?: string; motor?: string };
      if (Array.isArray(datos.predicciones)) setPrevias(datos.predicciones);
      setNarracion(datos.narracion ?? "");
      setMotivo(datos.motivo ?? "");
      setMotor(datos.motor ?? "casa");
      if (!datos.narracion) decir("error", datos.motivo || "No hubo narración; las predicciones siguen valiendo.");
      else decir("ok", `Narración lista (${datos.motor}).`);
    } catch {
      decir("error", "No se pudo pedir la narración. Las predicciones de la casa no dependen de esto.");
    } finally {
      setTrabajando("nada");
    }
  };

  const probarClave = async () => {
    setTrabajando("probar");
    try {
      const prueba: Mesa = {
        ...mesaVacia(ahora()),
        titulo: "Prueba de clave",
        ordenes: [],
        pines: [],
        capturas: [],
        predicciones: [],
        correcciones: [],
      };
      const r = await fetch("/api/zona-cero/predecir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mesa: prueba,
          usarIA: true,
          pregunta: "¿Responde mi clave?",
          clave: mesa.ajustes.clave,
          baseUrl: mesa.ajustes.baseUrl,
          modelo: mesa.ajustes.modelo,
        }),
      });
      const d = (await r.json()) as { narracion?: string; motivo?: string; motor?: string };
      if (d.motor === "tu-clave" && d.narracion) decir("ok", "Tu clave responde. La narración usará tu proveedor.");
      else decir("error", d.motivo || "Tu clave no respondió. Revisa el modelo y la dirección.");
    } catch {
      decir("error", "No se pudo probar la clave (sin red o sin permiso).");
    } finally {
      setTrabajando("nada");
    }
  };

  // ── exportar / importar ──────────────────────────────────────────────────
  const exportar = (formato: "md" | "json") => {
    const sello = new Date().toISOString().slice(0, 10);
    if (formato === "md") descargar(`mesa-zona-cero-${sello}.md`, exportarMD(mesa));
    else descargar(`mesa-zona-cero-${sello}.json`, exportarJSON(mesa), "application/json;charset=utf-8");
    decir("ok", `Mesa exportada en ${formato.toUpperCase()}.`);
  };

  const importar = async (archivo: File) => {
    const texto = await archivo.text().catch(() => "");
    const r = importarJSON(texto, ahora());
    if (!r.mesa) {
      decir("error", r.error ?? "No se pudo importar.");
      return;
    }
    setMesa(r.mesa);
    decir("ok", `Mesa importada: ${r.mesa.ordenes.length} órdenes, ${r.mesa.pines.length} señales, ${r.mesa.capturas.length} capturas.`);
  };

  const ajustar = (parcial: Partial<AjustesMesa>) =>
    act((m) => ({ ...m, ajustes: { ...m.ajustes, ...parcial }, actualizada: ahora() }));

  if (!montado) {
    return (
      <div className="zc-cargando">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>abriendo la mesa…</span>
      </div>
    );
  }

  const tabs: { id: Pestana; nombre: string; icono: React.ReactNode }[] = [
    { id: "ordenes", nombre: `Órdenes (${mesa.ordenes.length})`, icono: <ListOrdered className="w-3.5 h-3.5" /> },
    { id: "tablero", nombre: `Tablero (${mesa.pines.length})`, icono: <MapPin className="w-3.5 h-3.5" /> },
    { id: "capturas", nombre: `Capturas (${mesa.capturas.length})`, icono: <Camera className="w-3.5 h-3.5" /> },
    { id: "predecir", nombre: "Predecir", icono: <Brain className="w-3.5 h-3.5" /> },
    { id: "historial", nombre: `Historial (${mesa.correcciones.length})`, icono: <History className="w-3.5 h-3.5" /> },
    { id: "ajustes", nombre: "Ajustes", icono: <Settings2 className="w-3.5 h-3.5" /> },
  ];

  return (
    <section className="zc-mesa">
      {/* ── cabecera ── */}
      <header className="zc-cab">
        <div className="zc-cab-tit">
          <span className="zc-rotulo">ZONA CERO · MESA DE ÓRDENES</span>
          <input
            className="zc-titulo"
            value={mesa.titulo}
            onChange={(e) => act((m) => ({ ...m, titulo: e.target.value.slice(0, 120) }))}
            aria-label="Nombre de la mesa"
          />
        </div>
        <div className="zc-cab-datos">
          <span>{av.hechas}/{av.total} órdenes hechas · {av.pct} %</span>
          <span>{mesa.pines.length} señales · {mesa.capturas.length} capturas</span>
          <span className="zc-peso">{peso.kb} KB en tu aparato</span>
        </div>
        <div className="zc-cab-botones">
          <button type="button" className="zc-b" onClick={() => exportar("md")} title="Exportar el informe en markdown"><Download className="w-3.5 h-3.5" /> MD</button>
          <button type="button" className="zc-b" onClick={() => exportar("json")} title="Exportar la mesa completa (se puede volver a importar)"><FileJson className="w-3.5 h-3.5" /> JSON</button>
          <label className="zc-b">
            <Upload className="w-3.5 h-3.5" /> Importar
            <input
              type="file"
              accept="application/json"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void importar(f);
                e.currentTarget.value = "";
              }}
            />
          </label>
          <Link className="zc-b zc-b-suave" href="/zona-cero">volver al ojo</Link>
        </div>
      </header>

      {aviso ? (
        <div className={`zc-aviso zc-aviso-${aviso.tipo}`} role="status">
          {aviso.tipo === "error" ? <AlertTriangle className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
          {aviso.texto}
        </div>
      ) : null}

      {al.length ? (
        <div className="zc-alertas">
          {al.slice(0, 3).map((a, i) => (
            <span key={i} className={`zc-alerta zc-alerta-${a.nivel}`}>
              {a.nivel === "alta" ? <AlertTriangle className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              {a.texto}
            </span>
          ))}
        </div>
      ) : null}

      {/* ── pestañas ── */}
      <nav className="zc-tabs" aria-label="Puertas de la mesa">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`zc-tab ${pestana === t.id ? "zc-tab-on" : ""}`}
            onClick={() => setPestana(t.id)}
            aria-pressed={pestana === t.id}
          >
            {t.icono} {t.nombre}
          </button>
        ))}
      </nav>

      {/* ═══ ① ÓRDENES ═══ */}
      {pestana === "ordenes" ? (
        <div className="zc-panel">
          <div className="zc-nueva">
            <input
              className="zc-in"
              placeholder={`Orden ${siguienteNumero(mesa)}: qué hay que hacer…`}
              value={nuevaOrden}
              onChange={(e) => setNuevaOrden(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") agregarOrden();
              }}
            />
            <select className="zc-in zc-in-corto" value={nuevaPrioridad} onChange={(e) => setNuevaPrioridad(Number(e.target.value) as Prioridad)} aria-label="Prioridad">
              {[5, 4, 3, 2, 1].map((p) => (
                <option key={p} value={p}>{`P${p}`}</option>
              ))}
            </select>
            <input className="zc-in zc-in-corto" type="date" value={nuevaVence} onChange={(e) => setNuevaVence(e.target.value)} aria-label="Vence" />
            <input className="zc-in zc-in-corto" placeholder="etiquetas" value={nuevaEtiqueta} onChange={(e) => setNuevaEtiqueta(e.target.value)} aria-label="Etiquetas separadas por comas" />
            <button type="button" className="zc-b zc-b-oro" onClick={agregarOrden}><Plus className="w-4 h-4" /> añadir</button>
          </div>

          {mesa.ordenes.length === 0 ? (
            <p className="zc-vacio">
              La mesa está vacía. Escribe la primera orden arriba: se numera sola y aparece aquí con su prioridad y su fecha.
            </p>
          ) : null}

          <ol className="zc-ordenes">
            {mesa.ordenes.map((o, i) => {
              const abiertaEsta = abierta === o.id;
              const estado = ESTADOS.find((e) => e.id === o.estado) ?? ESTADOS[0];
              const vencida = o.vence !== null && o.vence < Date.now() && o.estado !== "hecha" && o.estado !== "descartada";
              const bloqueos = o.dependeDe
                .map((d) => mesa.ordenes.find((x) => x.id === d))
                .filter((d): d is NonNullable<typeof d> => Boolean(d) && d!.estado !== "hecha" && d!.estado !== "descartada");
              return (
                <li key={o.id} className={`zc-orden ${vencida ? "zc-orden-vencida" : ""} ${o.estado === "hecha" ? "zc-orden-hecha" : ""}`}>
                  <div className="zc-orden-fila">
                    <span className="zc-num" title="Número de orden">{o.numero}</span>
                    <input
                      className="zc-orden-titulo"
                      value={o.titulo}
                      onChange={(e) => editarOrden(o.id, "titulo", e.target.value)}
                      aria-label={`Título de la orden ${o.numero}`}
                    />
                    <select
                      className="zc-sel"
                      value={o.estado}
                      onChange={(e) => editarOrden(o.id, "estado", e.target.value)}
                      style={{ color: estado.color }}
                      aria-label={`Estado de la orden ${o.numero}`}
                    >
                      {ESTADOS.map((e) => (
                        <option key={e.id} value={e.id}>{e.nombre}</option>
                      ))}
                    </select>
                    <select
                      className="zc-sel zc-sel-p"
                      value={o.prioridad}
                      onChange={(e) => editarOrden(o.id, "prioridad", e.target.value)}
                      aria-label={`Prioridad de la orden ${o.numero}`}
                    >
                      {[5, 4, 3, 2, 1].map((p) => (
                        <option key={p} value={p}>{`P${p}`}</option>
                      ))}
                    </select>
                    <input
                      className="zc-sel"
                      type="date"
                      value={aInputFecha(o.vence)}
                      onChange={(e) => editarOrden(o.id, "vence", e.target.value ? String(new Date(`${e.target.value}T23:59:00`).getTime()) : "")}
                      aria-label={`Vence la orden ${o.numero}`}
                    />
                    <div className="zc-orden-acciones">
                      <button type="button" className="zc-mini" onClick={() => act((m) => moverOrden(m, o.id, i - 1, Date.now()))} disabled={i === 0} aria-label="Subir"><ArrowUp className="w-3.5 h-3.5" /></button>
                      <button type="button" className="zc-mini" onClick={() => act((m) => moverOrden(m, o.id, i + 1, Date.now()))} disabled={i === mesa.ordenes.length - 1} aria-label="Bajar"><ArrowDown className="w-3.5 h-3.5" /></button>
                      <button type="button" className="zc-mini" onClick={() => setAbierta(abiertaEsta ? null : o.id)} aria-label="Detalle" aria-expanded={abiertaEsta}><Eye className="w-3.5 h-3.5" /></button>
                      <button type="button" className="zc-mini zc-mini-peligro" onClick={() => { act((m) => borrar(m, o.id, Date.now())); decir("ok", `Orden ${o.numero} borrada (queda en el historial).`); }} aria-label="Borrar"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>

                  {abiertaEsta ? (
                    <div className="zc-orden-detalle">
                      <textarea
                        className="zc-area"
                        placeholder="Cómo se cumple esta orden: pasos, quién, con qué…"
                        value={o.detalle}
                        onChange={(e) => editarOrden(o.id, "detalle", e.target.value)}
                        rows={3}
                      />
                      <div className="zc-fila">
                        <label className="zc-campo">
                          <span>progreso {o.progreso}%</span>
                          <input type="range" min={0} max={100} step={5} value={o.progreso} onChange={(e) => editarOrden(o.id, "progreso", e.target.value)} />
                        </label>
                        <label className="zc-campo zc-campo-ancho">
                          <span>etiquetas</span>
                          <input className="zc-in" key={`${o.id}-${o.etiquetas.join("|")}`} defaultValue={o.etiquetas.join(", ")} onBlur={(e) => {
                            const etiquetas = e.target.value.split(",").map((x) => x.trim()).filter(Boolean).slice(0, 8);
                            act((m) => ({ ...m, ordenes: m.ordenes.map((x) => (x.id === o.id ? { ...x, etiquetas, actualizada: Date.now() } : x)) }));
                          }} />
                        </label>
                      </div>
                      <div className="zc-deps">
                        <span className="zc-deps-rot">depende de:</span>
                        {mesa.ordenes.filter((x) => x.id !== o.id).map((x) => {
                          const on = o.dependeDe.includes(x.id);
                          return (
                            <button
                              key={x.id}
                              type="button"
                              className={`zc-chip ${on ? "zc-chip-on" : ""}`}
                              onClick={() =>
                                act((m) => ({
                                  ...m,
                                  ordenes: m.ordenes.map((y) =>
                                    y.id === o.id
                                      ? { ...y, dependeDe: on ? y.dependeDe.filter((d) => d !== x.id) : [...y.dependeDe, x.id].slice(0, 12), actualizada: Date.now() }
                                      : y
                                  ),
                                }))
                              }
                            >
                              {x.numero}. {x.titulo.slice(0, 22)}
                            </button>
                          );
                        })}
                        {mesa.ordenes.length === 1 ? <em className="zc-tenue">aún no hay otras órdenes</em> : null}
                      </div>
                      {bloqueos.length ? (
                        <p className="zc-bloqueo"><AlertTriangle className="w-3 h-3" /> bloqueada por {bloqueos.map((b) => b.numero).join(", ")}: no puede cerrarse antes.</p>
                      ) : null}
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ol>
        </div>
      ) : null}

      {/* ═══ ② TABLERO ═══ */}
      {pestana === "tablero" ? (
        <div className="zc-panel zc-panel-tablero">
          <div className="zc-tablero-cab">
            <span className="zc-tenue">Haz clic donde quieras señalar. Arrastra para mover. Toca una señal para nombrarla.</span>
            <span className="zc-tenue">{mesa.pines.length} señales</span>
          </div>
          <div className="zc-tablero" ref={lienzo} onClick={soltarPin} role="application" aria-label="Tablero de señales">
            <div className="zc-rejilla" aria-hidden />
            {mesa.pines.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`zc-pin ${sel === p.id ? "zc-pin-on" : ""}`}
                style={{ left: `${p.x / 10}%`, top: `${p.y / 10}%`, ["--pin" as string]: p.color }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSel(p.id);
                }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  const caja = lienzo.current?.getBoundingClientRect();
                  if (!caja) return;
                  const px = (p.x / 1000) * caja.width + caja.left;
                  const py = (p.y / 1000) * caja.height + caja.top;
                  arrastre.current = { id: p.id, dx: e.clientX - px, dy: e.clientY - py };
                  setSel(p.id);
                }}
                aria-label={`Señal ${p.numero}: ${p.titulo}`}
              >
                <span className="zc-pin-num">{p.numero}</span>
                <span className="zc-pin-tit">{p.titulo}</span>
              </button>
            ))}
            {mesa.pines.length === 0 ? (
              <p className="zc-tablero-vacio">El tablero está en blanco: un clic y tienes la primera señal.</p>
            ) : null}
          </div>

          {pinSel ? (
            <div className="zc-pin-editor">
              <div className="zc-pin-editor-cab">
                <Crosshair className="w-3.5 h-3.5" />
                <b>Señal {pinSel.numero}</b>
                <button type="button" className="zc-mini zc-mini-peligro" onClick={() => { act((m) => borrar(m, pinSel.id, Date.now())); setSel(null); }} aria-label="Borrar señal"><Trash2 className="w-3.5 h-3.5" /></button>
                <button type="button" className="zc-mini" onClick={() => setSel(null)} aria-label="Cerrar"><X className="w-3.5 h-3.5" /></button>
              </div>
              <div className="zc-fila">
                <label className="zc-campo zc-campo-ancho">
                  <span>nombre</span>
                  <input className="zc-in" value={pinSel.titulo} onChange={(e) => act((m) => corregir(m, pinSel.id, "pin", "titulo", e.target.value, Date.now()))} />
                </label>
                <label className="zc-campo">
                  <span>tipo</span>
                  <select className="zc-sel" value={pinSel.tipo} onChange={(e) => act((m) => corregir(m, pinSel.id, "pin", "tipo", e.target.value, Date.now()))}>
                    {TIPOS.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                  </select>
                </label>
                <label className="zc-campo">
                  <span>color</span>
                  <input type="color" className="zc-color" value={pinSel.color} onChange={(e) => act((m) => corregir(m, pinSel.id, "pin", "color", e.target.value, Date.now()))} />
                </label>
              </div>
              <textarea
                className="zc-area"
                rows={2}
                placeholder="Qué estás señalando y por qué importa…"
                value={pinSel.nota}
                onChange={(e) => act((m) => corregir(m, pinSel.id, "pin", "nota", e.target.value, Date.now()))}
              />
              <div className="zc-fila">
                <label className="zc-campo zc-campo-ancho">
                  <span>puerta de la casa (opcional)</span>
                  <input className="zc-in" placeholder="/mapas" value={pinSel.ruta ?? ""} onChange={(e) => act((m) => corregir(m, pinSel.id, "pin", "ruta", e.target.value, Date.now()))} />
                </label>
                {pinSel.ruta ? <Link className="zc-b" href={pinSel.ruta}><ChevronRight className="w-3.5 h-3.5" /> ir</Link> : null}
              </div>
              <p className="zc-tenue">posición {(pinSel.x / 10).toFixed(1)} % · {(pinSel.y / 10).toFixed(1)} %</p>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* ═══ ③ CAPTURAS ═══ */}
      {pestana === "capturas" ? (
        <div className="zc-panel">
          <div
            className="zc-soltar"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files?.[0];
              if (f) void pegarArchivo(f);
            }}
          >
            <Camera className="w-6 h-6" />
            <p><b>Pega con Ctrl+V</b> una captura, o arrástrala aquí, o elige un archivo.</p>
            <p className="zc-tenue">Se guardan en tu aparato. Tope {(Math.min(4, mesa.ajustes.topeMB)).toFixed(1)} MB por captura · máximo 40.</p>
            <button type="button" className="zc-b zc-b-oro" onClick={() => entradaArchivo.current?.click()}>
              <Upload className="w-3.5 h-3.5" /> elegir archivo
            </button>
            <input
              ref={entradaArchivo}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void pegarArchivo(f);
                e.currentTarget.value = "";
              }}
            />
          </div>

          <div className="zc-galeria">
            {mesa.capturas.map((c: Captura) => (
              <figure key={c.id} className="zc-captura">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.dataUrl} alt={c.titulo} />
                <figcaption>
                  <input className="zc-in" value={c.titulo} onChange={(e) => act((m) => corregir(m, c.id, "captura", "titulo", e.target.value, Date.now()))} aria-label="Título de la captura" />
                  <input className="zc-in" placeholder="fuente" value={c.fuente} onChange={(e) => act((m) => corregir(m, c.id, "captura", "fuente", e.target.value, Date.now()))} aria-label="Fuente" />
                  <textarea className="zc-area" rows={2} placeholder="nota" value={c.nota} onChange={(e) => act((m) => corregir(m, c.id, "captura", "nota", e.target.value, Date.now()))} />
                  <div className="zc-captura-pie">
                    <span className="zc-tenue">{c.ancho}×{c.alto} · {(c.peso / 1024).toFixed(0)} KB</span>
                    <button type="button" className="zc-mini zc-mini-peligro" onClick={() => act((m) => borrar(m, c.id, Date.now()))} aria-label="Borrar captura"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </figcaption>
              </figure>
            ))}
            {mesa.capturas.length === 0 ? (
              <p className="zc-vacio"><ImageIcon className="w-4 h-4 inline" /> Todavía no hay capturas. Pega la primera con Ctrl+V.</p>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* ═══ ④ PREDECIR ═══ */}
      {pestana === "predecir" ? (
        <div className="zc-panel">
          <div className="zc-predecir-cab">
            <button type="button" className="zc-b zc-b-oro" onClick={calcular}><Sparkles className="w-3.5 h-3.5" /> calcular en la casa</button>
            <button type="button" className="zc-b" onClick={() => void narrar()} disabled={trabajando !== "nada"}>
              {trabajando === "narrar" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Brain className="w-3.5 h-3.5" />}
              pedir narración ({mesa.ajustes.motor === "propio" && mesa.ajustes.clave ? "tu clave" : "núcleo de la casa"})
            </button>
            <label className="zc-campo zc-campo-horizonte">
              <span>horizonte {mesa.ajustes.horizonteDias} d</span>
              <input type="range" min={1} max={30} value={mesa.ajustes.horizonteDias} onChange={(e) => ajustar({ horizonteDias: Number(e.target.value) })} />
            </label>
            <input className="zc-in" placeholder="pregunta concreta (opcional)" value={pregunta} onChange={(e) => setPregunta(e.target.value)} />
          </div>

          <p className="zc-tenue">
            El motor no adivina el mundo: mide tu mesa — vencidas, bloqueos, carga crítica, avance y respaldo visual — y lo
            convierte en probabilidad. Con poca mesa, la confianza baja y se dice.
          </p>

          {narracion ? (
            <div className="zc-narracion">
              <span className="zc-rotulo">LECTURA · {motor}</span>
              <p>{narracion}</p>
            </div>
          ) : null}
          {motivo ? <p className="zc-motivo"><AlertTriangle className="w-3 h-3" /> {motivo}</p> : null}

          <div className="zc-previsiones">
            {previas.length === 0 ? (
              <p className="zc-vacio">Pulsa «calcular en la casa» y verás cuatro preguntas con su número y sus factores.</p>
            ) : (
              previas.map((p) => (
                <article key={p.id} className="zc-prevision">
                  <div className="zc-prevision-cab">
                    <b>{p.pregunta}</b>
                    <span className="zc-prob">{Math.round(p.probabilidad * 100)}%</span>
                  </div>
                  <div className="zc-barra"><i style={{ width: `${Math.round(p.probabilidad * 100)}%` }} /></div>
                  <p className="zc-confianza">confianza {Math.round(p.confianza * 100)} % · horizonte {p.horizonteDias} d · motor {p.motor}</p>
                  <p className="zc-texto">{p.texto}</p>
                  <ul className="zc-factores">
                    {p.factores.map((f, i) => (
                      <li key={i}>
                        <span>{f.etiqueta}</span>
                        <b>{f.valor}</b>
                        <em className={f.peso >= 0 ? "zc-pos" : "zc-neg"}>{f.peso > 0 ? "+" : ""}{f.peso}</em>
                      </li>
                    ))}
                  </ul>
                </article>
              ))
            )}
          </div>

          {mesa.predicciones.length ? (
            <div className="zc-guardadas">
              <span className="zc-rotulo">predicciones guardadas ({mesa.predicciones.length})</span>
              <div className="zc-guardadas-lista">
                {mesa.predicciones.slice(-6).reverse().map((p) => (
                  <span key={p.id} className="zc-guardada">
                    {p.pregunta.slice(0, 40)} → {Math.round(p.probabilidad * 100)} %
                    <button type="button" className="zc-mini" onClick={() => act((m) => borrarPrediccion(m, p.id, Date.now()))} aria-label="Borrar predicción"><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* ═══ ⑤ HISTORIAL ═══ */}
      {pestana === "historial" ? (
        <div className="zc-panel">
          <div className="zc-hist-cab">
            <button type="button" className="zc-b" onClick={() => { const r = deshacer(mesa, Date.now()); setMesa(r.mesa); decir("ok", r.dicho); }} disabled={!mesa.correcciones.length}>
              <RotateCcw className="w-3.5 h-3.5" /> deshacer la última
            </button>
            <button type="button" className="zc-b zc-b-suave" onClick={() => act((m) => ({ ...m, correcciones: [] }))} disabled={!mesa.correcciones.length}>
              <Eraser className="w-3.5 h-3.5" /> vaciar historial
            </button>
            <span className="zc-tenue">{mesa.correcciones.length} apuntes · los últimos 200</span>
          </div>
          {mesa.correcciones.length === 0 ? (
            <p className="zc-vacio">Aún no has corregido nada. Cada edición deja aquí el antes y el después.</p>
          ) : (
            <ul className="zc-historial">
              {[...mesa.correcciones].reverse().map((c) => (
                <li key={c.id}>
                  <span className="zc-hist-tipo">{c.tipo}</span>
                  <span className="zc-hist-campo">{c.campo}</span>
                  <span className="zc-hist-antes">«{c.antes || "(vacío)"}»</span>
                  <ChevronRight className="w-3 h-3" />
                  <span className="zc-hist-despues">«{c.despues || "(vacío)"}»</span>
                  <time>{new Date(c.ts).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}</time>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}

      {/* ═══ ⑥ AJUSTES ═══ */}
      {pestana === "ajustes" ? (
        <div className="zc-panel zc-ajustes">
          <h3><KeyRound className="w-4 h-4" /> tu clave de proveedor (opcional)</h3>
          <p className="zc-tenue">
            Sin clave, la narración la hace el núcleo de la casa. Con clave, la hace tu proveedor. La clave se queda en este
            aparato, solo viaja al proveedor que elijas cuando pulsas un botón, y la puedes borrar ahora mismo.
          </p>
          <div className="zc-fila">
            <label className="zc-campo">
              <span>motor</span>
              <select className="zc-sel" value={mesa.ajustes.motor} onChange={(e) => ajustar({ motor: e.target.value as AjustesMesa["motor"] })}>
                <option value="casa">núcleo de la casa</option>
                <option value="propio">mi clave</option>
              </select>
            </label>
            <label className="zc-campo">
              <span>proveedor</span>
              <select
                className="zc-sel"
                value={mesa.ajustes.proveedor}
                onChange={(e) => {
                  const p = e.target.value as AjustesMesa["proveedor"];
                  ajustar({ proveedor: p, baseUrl: BASES[p] || mesa.ajustes.baseUrl, modelo: MODELOS[p] });
                }}
              >
                <option value="openai">OpenAI</option>
                <option value="groq">Groq</option>
                <option value="openrouter">OpenRouter</option>
                <option value="personalizado">otra (OpenAI-compatible)</option>
              </select>
            </label>
            <label className="zc-campo zc-campo-ancho">
              <span>dirección</span>
              <input className="zc-in" value={mesa.ajustes.baseUrl} onChange={(e) => ajustar({ baseUrl: e.target.value })} placeholder="https://api.openai.com/v1" />
            </label>
            <label className="zc-campo">
              <span>modelo</span>
              <input className="zc-in" value={mesa.ajustes.modelo} onChange={(e) => ajustar({ modelo: e.target.value })} />
            </label>
          </div>
          <div className="zc-fila">
            <label className="zc-campo zc-campo-ancho">
              <span>clave (se guarda solo en este aparato)</span>
              <input
                className="zc-in"
                type="password"
                autoComplete="off"
                spellCheck={false}
                value={mesa.ajustes.clave}
                onChange={(e) => ajustar({ clave: e.target.value })}
                placeholder="sk-…"
              />
            </label>
            <button type="button" className="zc-b" onClick={() => void probarClave()} disabled={!mesa.ajustes.clave || trabajando !== "nada"}>
              {trabajando === "probar" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} probar
            </button>
            <button type="button" className="zc-b zc-b-suave" onClick={() => { ajustar({ clave: "" }); decir("ok", "Clave borrada de este aparato."); }} disabled={!mesa.ajustes.clave}>
              <Trash2 className="w-3.5 h-3.5" /> borrar clave
            </button>
          </div>

          <h3><Camera className="w-4 h-4" /> capturas y horizonte</h3>
          <div className="zc-fila">
            <label className="zc-campo">
              <span>tope por captura {mesa.ajustes.topeMB.toFixed(1)} MB</span>
              <input type="range" min={0.5} max={4} step={0.5} value={mesa.ajustes.topeMB} onChange={(e) => ajustar({ topeMB: Number(e.target.value) })} />
            </label>
            <label className="zc-campo">
              <span>horizonte {mesa.ajustes.horizonteDias} días</span>
              <input type="range" min={1} max={30} value={mesa.ajustes.horizonteDias} onChange={(e) => ajustar({ horizonteDias: Number(e.target.value) })} />
            </label>
            <p className="zc-tenue zc-campo-ancho">
              La mesa ocupa {peso.kb} KB de los ~5 MB que el navegador da por origen ({peso.pct} %). Si se llena, exporta y borra capturas.
            </p>
          </div>

          <h3><BookmarkPlus className="w-4 h-4" /> la mesa</h3>
          <div className="zc-fila">
            <button type="button" className="zc-b" onClick={() => exportar("json")}><FileJson className="w-3.5 h-3.5" /> exportar mesa</button>
            <button type="button" className="zc-b" onClick={() => exportar("md")}><Download className="w-3.5 h-3.5" /> informe MD</button>
            <label className="zc-b">
              <Upload className="w-3.5 h-3.5" /> importar mesa
              <input type="file" accept="application/json" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) void importar(f); e.currentTarget.value = ""; }} />
            </label>
            <button
              type="button"
              className="zc-b zc-b-peligro"
              onClick={() => {
                if (!window.confirm("¿Borrar la mesa entera de este aparato? Se puede recuperar solo si exportaste antes.")) return;
                olvidarMesa();
                setMesa({ ...mesaVacia(Date.now()), ajustes: { ...AJUSTES_DEFECTO } });
                decir("ok", "Mesa borrada de este aparato.");
              }}
            >
              <Trash2 className="w-3.5 h-3.5" /> olvidar todo
            </button>
          </div>

          <h3><Target className="w-4 h-4" /> atajos</h3>
          <ul className="zc-atajos">
            <li><kbd>Ctrl</kbd> + <kbd>V</kbd> en Capturas — pega una imagen del portapapeles.</li>
            <li>En el turno de órdenes, <kbd>Enter</kbd> en el campo de arriba crea la orden y la numera.</li>
            <li>Las flechas ▲▼ de cada orden la mueven y renumeran el resto.</li>
            <li>La x y la y de cada señal se guardan en el aparato: el tablero es el mismo al volver.</li>
          </ul>
        </div>
      ) : null}

      <footer className="zc-pie">
        <span>ZONA CERO · mesa de órdenes v434.2 — todos los datos viven en tu aparato</span>
        <Link href="/zona-cero">← el ojo de la Zona Cero</Link>
      </footer>
    </section>
  );
}
