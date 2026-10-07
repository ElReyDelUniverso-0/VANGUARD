"use client";

// ============================================================
// VANGUARD v85.0 EL MUNDO DENTRO — CONSTRUCTOR DE MAPAS
// Los operadores crean SUS PROPIOS mapas de conflictos sobre la
// cartografía real de Vanguard: pintan zonas por facción, trazan
// frentes, colocan HQ/batallas/flotas, etiquetan, guardan una
// galería y EXPORTAN PNG o código de mapa compartible.
// ============================================================
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  PenTool, Circle, GitBranch, MapPin, Type, Eraser, Undo2, Save, FolderOpen,
  Trash2, Download, Share2, ClipboardPaste, Flag, Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HeroOro } from "@/components/vanguard/hero-oro";
import worldPaths from "@/lib/world-paths.json";
import { sfx } from "@/lib/sound";

const WIDTH = 1000;
const HEIGHT = 500;

// ===== facciones preinstaladas =====
interface Faccion { nombre: string; color: string }
const FAC_PRESET: Faccion[] = [
  { nombre: "ALIANZA AMANECER", color: "#FFB020" },
  { nombre: "COALICIÓN OCASO", color: "#FF3B30" },
  { nombre: "BLOQUE NEUTRAL", color: "#22D3EE" },
  { nombre: "MOVIMIENTO LIBRE", color: "#A78BFA" },
];

type Herramienta = "zona" | "frente" | "marcador" | "etiqueta" | "borrar";

const MARCAS = [
  { t: "hq", glyph: "⬢", label: "HQ" },
  { t: "batalla", glyph: "✕", label: "BATALLA" },
  { t: "flota", glyph: "⚓", label: "FLOTA" },
  { t: "aerea", glyph: "▲", label: "BASE AÉREA" },
  { t: "capital", glyph: "★", label: "CAPITAL" },
] as const;

interface Zona { id: string; f: number; x: number; y: number; r: number }
interface Frente { id: string; f: number; pts: number[][]; done: boolean }
interface Marca { id: string; f: number; tipo: string; glyph: string; x: number; y: number }
interface Texto { id: string; t: string; x: number; y: number }

interface MapaDatos {
  n: string;
  facciones: Faccion[];
  z: Zona[];
  fr: Frente[];
  m: Marca[];
  t: Texto[];
}

const LS_GALERIA = "vanguard-mapas-v85";

function cargarGaleria(): MapaDatos[] {
  try {
    const raw = localStorage.getItem(LS_GALERIA);
    if (raw) return JSON.parse(raw) as MapaDatos[];
  } catch { /* noop */ }
  return [];
}

function guardarGaleria(g: MapaDatos[]) {
  try { localStorage.setItem(LS_GALERIA, JSON.stringify(g.slice(0, 12))); } catch { /* noop */ }
}

let seq = 0;
const nid = () => `e${Date.now().toString(36)}${(seq++).toString(36)}`;

export function CreadorMapasPanel() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [nombre, setNombre] = useState("OPERACIÓN LUNA NUEVA");
  const [facciones, setFacciones] = useState<Faccion[]>(FAC_PRESET);
  const [factiva, setFactiva] = useState(0);
  const [herr, setHerr] = useState<Herramienta>("zona");
  const [pincel, setPincel] = useState(26);
  const [marcaSel, setMarcaSel] = useState<string>("hq");
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [frentes, setFrentes] = useState<Frente[]>([]);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [textos, setTextos] = useState<Texto[]>([]);
  const [frenteAbierto, setFrenteAbierto] = useState<number[][]>([]);
  const [etiquetaPend, setEtiquetaPend] = useState<{ x: number; y: number } | null>(null);
  const [textoPend, setTextoPend] = useState("");
  const [galeria, setGaleria] = useState<MapaDatos[]>([]);
  const [importando, setImportando] = useState(false);
  const [codigoImport, setCodigoImport] = useState("");

  const land = worldPaths.landPath as string;
  const borders = worldPaths.borderPath as string;
  const graticule = worldPaths.graticulePath as string;

  const datos: MapaDatos = useMemo(
    () => ({ n: nombre, facciones, z: zonas, fr: frentes.filter((f) => f.done), m: marcas, t: textos }),
    [nombre, facciones, zonas, frentes, marcas, textos]
  );

  // ===== coordenadas del clic → viewBox =====
  const coords = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * WIDTH,
      y: ((e.clientY - rect.top) / rect.height) * HEIGHT,
    };
  };

  const clickMapa = (e: React.MouseEvent<SVGSVGElement>) => {
    const c = coords(e);
    if (!c) return;
    const f = factiva;
    switch (herr) {
      case "zona":
        setZonas((z) => [...z, { id: nid(), f, x: c.x, y: c.y, r: pincel }]);
        sfx.click();
        break;
      case "frente":
        setFrenteAbierto((pts) => [...pts, [c.x, c.y]]);
        sfx.click();
        break;
      case "marcador": {
        const def = MARCAS.find((m) => m.t === marcaSel) ?? MARCAS[0];
        setMarcas((ms) => [...ms, { id: nid(), f, tipo: def.t, glyph: def.glyph, x: c.x, y: c.y }]);
        sfx.click();
        break;
      }
      case "etiqueta":
        setEtiquetaPend(c);
        setTextoPend("");
        break;
      case "borrar":
        // prioridad: marca > texto > frente cerrado > zona
        const hitMarca = marcas.findIndex((m) => Math.hypot(m.x - c.x, m.y - c.y) < 14);
        if (hitMarca >= 0) { setMarcas((ms) => ms.filter((_, i) => i !== hitMarca)); sfx.error(); return; }
        const hitTexto = textos.findIndex((t) => Math.hypot(t.x - c.x, t.y - c.y) < 16);
        if (hitTexto >= 0) { setTextos((ts) => ts.filter((_, i) => i !== hitTexto)); sfx.error(); return; }
        const hitFrente = frentes.findIndex((fr) => fr.pts.some((p) => Math.hypot(p[0] - c.x, p[1] - c.y) < 12));
        if (hitFrente >= 0) { setFrentes((fs) => fs.filter((_, i) => i !== hitFrente)); sfx.error(); return; }
        const hitZona = zonas.findIndex((z) => Math.hypot(z.x - c.x, z.y - c.y) < z.r + 4);
        if (hitZona >= 0) { setZonas((zs) => zs.filter((_, i) => i !== hitZona)); sfx.error(); return; }
        break;
    }
  };

  const terminarFrente = () => {
    if (frenteAbierto.length < 2) {
      toast.error("Un frente necesita al menos 2 puntos");
      return;
    }
    setFrentes((fs) => [...fs, { id: nid(), f: factiva, pts: frenteAbierto, done: true }]);
    setFrenteAbierto([]);
    sfx.success();
    toast.success("Frente trazado y fijado");
  };

  const deshacer = () => {
    if (frenteAbierto.length > 0) {
      setFrenteAbierto((pts) => pts.slice(0, -1));
      return;
    }
    if (zonas.length) { setZonas((z) => z.slice(0, -1)); sfx.error(); return; }
    if (marcas.length) { setMarcas((m) => m.slice(0, -1)); sfx.error(); return; }
    if (textos.length) { setTextos((t) => t.slice(0, -1)); sfx.error(); return; }
    if (frentes.length) { setFrentes((f) => f.slice(0, -1)); sfx.error(); return; }
  };

  const limpiar = () => {
    setZonas([]); setFrentes([]); setMarcas([]); setTextos([]); setFrenteAbierto([]);
    toast.info("Tablero limpio: nueva operación");
  };

  // ===== galería =====
  useEffect(() => { setGaleria(cargarGaleria()); }, []);

  const guardar = () => {
    const g = [{ ...datos }, ...galeria.filter((m) => m.n !== nombre)].slice(0, 12);
    guardarGaleria(g);
    setGaleria(g);
    sfx.unlock();
    toast.success(`Mapa "${nombre}" guardado en tu cartoteca`);
  };

  const abrir = (m: MapaDatos) => {
    setNombre(m.n);
    setFacciones(m.facciones ?? FAC_PRESET);
    setZonas(m.z ?? []);
    setFrentes((m.fr ?? []).map((f) => ({ ...f, done: true })));
    setMarcas(m.m ?? []);
    setTextos(m.t ?? []);
    setFrenteAbierto([]);
    sfx.click();
    toast.success(`Mapa "${m.n}" cargado`);
  };

  const borrarDeGaleria = (n: string) => {
    const g = galeria.filter((m) => m.n !== n);
    guardarGaleria(g);
    setGaleria(g);
  };

  // ===== export PNG =====
  const exportarPng = () => {
    const svg = svgRef.current;
    if (!svg) return;
    const xml = new XMLSerializer().serializeToString(svg);
    const svg64 = window.btoa(unescape(encodeURIComponent(xml)));
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 2000;
      canvas.height = 1000;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#070912";
      ctx.fillRect(0, 0, 2000, 1000);
      ctx.drawImage(img, 0, 0, 2000, 1000);
      ctx.fillStyle = "rgba(255,176,32,0.9)";
      ctx.font = "bold 26px monospace";
      ctx.fillText(`VANGUARD · ${nombre.toUpperCase()} · CONSTRUCTOR DE MAPAS v85`, 24, 972);
      try {
        const a = document.createElement("a");
        a.href = canvas.toDataURL("image/png");
        a.download = `vanguard-mapa-${nombre.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`;
        a.click();
        toast.success("Mapa exportado en PNG (2000×1000)");
      } catch {
        toast.error("El navegador bloqueó la exportación");
      }
    };
    img.onerror = () => toast.error("No se pudo rasterizar el mapa");
    img.src = `data:image/svg+xml;base64,${svg64}`;
  };

  // ===== código de mapa =====
  const codigo = useMemo(() => {
    try {
      return `VGMAP85.${window.btoa(unescape(encodeURIComponent(JSON.stringify(datos))))}`;
    } catch {
      return "";
    }
  }, [datos]);

  const copiarCodigo = () => {
    navigator.clipboard?.writeText(codigo).then(
      () => toast.success("Código de mapa copiado: pégalo donde quieras"),
      () => toast.error("No se pudo copiar")
    );
  };

  const importarCodigo = () => {
    try {
      const raw = codigoImport.trim();
      if (!raw.startsWith("VGMAP85.")) throw new Error("formato");
      const datosImport = JSON.parse(decodeURIComponent(escape(window.atob(raw.slice(8))))) as MapaDatos;
      abrir(datosImport);
      setImportando(false);
      setCodigoImport("");
    } catch {
      toast.error("Código de mapa inválido");
    }
  };

  const col = (f: number) => facciones[f]?.color ?? "#FFB020";

  const herramientas: { t: Herramienta; icon: React.ReactNode; label: string }[] = [
    { t: "zona", icon: <Circle className="w-3.5 h-3.5" />, label: "Zona" },
    { t: "frente", icon: <GitBranch className="w-3.5 h-3.5" />, label: "Frente" },
    { t: "marcador", icon: <MapPin className="w-3.5 h-3.5" />, label: "Marca" },
    { t: "etiqueta", icon: <Type className="w-3.5 h-3.5" />, label: "Texto" },
    { t: "borrar", icon: <Eraser className="w-3.5 h-3.5" />, label: "Borrar" },
  ];

  return (
    <div className="space-y-3">
      <HeroOro panel="mapascrea" />
      <PanelHeader
        title="Constructor de Mapas"
        subtitle={`${zonas.length} zonas · ${frentes.length} frentes · ${marcas.length} marcas · ${galeria.length} guardados`}
        icon={<PenTool className="w-4 h-4 text-violet-hud" />}
        color="violet"
        right={
          <Button size="sm" onClick={guardar} className="h-8 px-2.5 font-mono text-[10px] uppercase bg-violet-hud/80 border border-violet-hud text-black hover:bg-violet-hud">
            <Save className="w-3.5 h-3.5 mr-1" /> GUARDAR
          </Button>
        }
      />

      {/* nombre + facciones */}
      <div className="hud-corner p-3 space-y-2.5">
        <div className="flex items-center gap-2">
          <Flag className="w-4 h-4 text-violet-hud flex-shrink-0" />
          <Input
            value={nombre}
            onChange={(e) => setNombre(e.target.value.slice(0, 42))}
            placeholder="Nombre de tu operación…"
            className="h-9 bg-background/60 border-border font-mono text-xs uppercase"
          />
        </div>
        <p className="text-[10px] font-mono uppercase tracking-wider text-violet-hud">facciones de tu mundo</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {facciones.map((f, i) => (
            <div key={i} className={cn("border p-1.5", i === factiva ? "border-violet-hud bg-violet-hud/15" : "border-border/60")}>
              <button onClick={() => setFactiva(i)} className="w-full text-left" aria-label={`Seleccionar facción ${f.nombre}`}>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: f.color, boxShadow: `0 0 8px ${f.color}` }} />
                  <input
                    value={f.nombre}
                    onChange={(e) => setFacciones((fs) => fs.map((x, j) => (j === i ? { ...x, nombre: e.target.value.slice(0, 22) } : x)))}
                    className="w-full bg-transparent text-[10px] font-mono font-bold uppercase text-foreground outline-none min-w-0"
                    aria-label={`Nombre de facción ${i + 1}`}
                  />
                </div>
                <p className="text-[8px] font-mono text-muted-foreground uppercase mt-0.5">
                  {zonas.filter((z) => z.f === i).length + marcas.filter((m) => m.f === i).length} elementos · {i === factiva ? "ACTIVA" : "toca para usar"}
                </p>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* herramientas */}
      <div className="hud-corner p-3">
        <div className="flex items-center gap-1.5 flex-wrap mb-2.5">
          {herramientas.map((h) => (
            <button
              key={h.t}
              onClick={() => { setHerr(h.t); sfx.click(); }}
              className={cn(
                "px-2.5 py-1.5 border text-[10px] font-mono uppercase flex items-center gap-1.5 transition-colors",
                herr === h.t ? "border-violet-hud text-violet-hud bg-violet-hud/20" : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {h.icon} {h.label}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-1.5">
            {frenteAbierto.length > 0 && (
              <Button size="sm" onClick={terminarFrente} className="h-7 font-mono text-[10px] uppercase bg-green-hud/30 border border-green-hud text-green-hud hover:bg-green-hud/50">
                fijar frente ({frenteAbierto.length} pts)
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={deshacer} className="h-7 font-mono text-[10px] uppercase">
              <Undo2 className="w-3.5 h-3.5 mr-1" /> deshacer
            </Button>
            <Button size="sm" variant="ghost" onClick={limpiar} className="h-7 font-mono text-[10px] uppercase text-red-hud hover:bg-red-hud/20">
              <Trash2 className="w-3.5 h-3.5 mr-1" /> limpiar
            </Button>
          </div>
        </div>

        {herr === "zona" && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[9px] font-mono uppercase text-muted-foreground">pincel:</span>
            {[14, 26, 42, 60].map((r) => (
              <button
                key={r}
                onClick={() => setPincel(r)}
                className={cn(
                  "px-2 py-1 border text-[9px] font-mono uppercase",
                  pincel === r ? "border-violet-hud text-violet-hud bg-violet-hud/20" : "border-border text-muted-foreground"
                )}
              >
                {r < 20 ? "pequeño" : r < 30 ? "medio" : r < 50 ? "grande" : "región"}
              </button>
            ))}
            <span className="text-[9px] font-mono text-muted-foreground">· toca el mapa para pintar territorio de {facciones[factiva]?.nombre}</span>
          </div>
        )}
        {herr === "marcador" && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {MARCAS.map((m) => (
              <button
                key={m.t}
                onClick={() => setMarcaSel(m.t)}
                className={cn(
                  "px-2 py-1 border text-[9px] font-mono uppercase flex items-center gap-1",
                  marcaSel === m.t ? "border-violet-hud text-violet-hud bg-violet-hud/20" : "border-border text-muted-foreground"
                )}
              >
                <span className="text-xs">{m.glyph}</span> {m.label}
              </button>
            ))}
          </div>
        )}
        {herr === "frente" && (
          <p className="text-[9px] font-mono text-muted-foreground uppercase">
            toca el mapa punto a punto para trazar la línea del frente · FIJAR al terminar
          </p>
        )}
        {herr === "etiqueta" && (
          <p className="text-[9px] font-mono text-muted-foreground uppercase">toca el mapa y escribe la etiqueta del lugar</p>
        )}
        {herr === "borrar" && (
          <p className="text-[9px] font-mono text-muted-foreground uppercase">toca cualquier elemento del mapa para eliminarlo</p>
        )}
      </div>

      {/* etiqueta pendiente */}
      <AnimatePresence>
        {etiquetaPend && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="hud-corner p-3 flex items-center gap-2">
            <Type className="w-4 h-4 text-violet-hud flex-shrink-0" />
            <Input
              autoFocus
              value={textoPend}
              onChange={(e) => setTextoPend(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && textoPend.trim()) {
                  setTextos((ts) => [...ts, { id: nid(), t: textoPend.trim().slice(0, 28), x: etiquetaPend.x, y: etiquetaPend.y }]);
                  setEtiquetaPend(null);
                  sfx.success();
                }
                if (e.key === "Escape") setEtiquetaPend(null);
              }}
              placeholder="Nombre del lugar… (Enter para fijar)"
              className="h-8 bg-background/60 border-border font-mono text-xs uppercase"
            />
            <Button size="sm" onClick={() => {
              if (!textoPend.trim()) return;
              setTextos((ts) => [...ts, { id: nid(), t: textoPend.trim().slice(0, 28), x: etiquetaPend.x, y: etiquetaPend.y }]);
              setEtiquetaPend(null);
              sfx.success();
            }} className="h-8 font-mono text-[10px] uppercase bg-violet-hud/30 border border-violet-hud text-violet-hud">
              fijar
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== MAPA EDITABLE ===== */}
      <div className="border border-violet-hud/50 overflow-hidden">
        <svg
          ref={svgRef}
          xmlns="http://www.w3.org/2000/svg"
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          onClick={clickMapa}
          className="w-full block cursor-crosshair"
          style={{ aspectRatio: "2/1" }}
        >
          <defs>
            <radialGradient id="cm-ocean" cx="50%" cy="34%" r="95%">
              <stop offset="0%" stopColor="#0d1120" />
              <stop offset="62%" stopColor="#070912" />
              <stop offset="100%" stopColor="#180d0a" />
            </radialGradient>
            <linearGradient id="cm-land" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#171d30" />
              <stop offset="100%" stopColor="#0d1120" />
            </linearGradient>
            <pattern id="cm-grid" width="25" height="25" patternUnits="userSpaceOnUse">
              <path d="M 25 0 L 0 0 0 25" fill="none" stroke="rgba(167,139,250,0.06)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width={WIDTH} height={HEIGHT} fill="url(#cm-ocean)" />
          <rect width={WIDTH} height={HEIGHT} fill="url(#cm-grid)" />
          <path d={graticule} fill="none" stroke="rgba(167,139,250,0.08)" strokeWidth="0.4" />
          <path d={land} fill="url(#cm-land)" stroke="rgba(217,167,32,0.4)" strokeWidth="0.7" />
          <path d={borders} fill="none" stroke="rgba(150,150,170,0.14)" strokeWidth="0.4" />

          {/* zonas pintadas */}
          {zonas.map((z) => (
            <circle
              key={z.id}
              cx={z.x}
              cy={z.y}
              r={z.r}
              fill={col(z.f)}
              fillOpacity={0.3}
              stroke={col(z.f)}
              strokeWidth={1.2}
              strokeOpacity={0.85}
            />
          ))}
          {/* frentes */}
          {frentes.map((fr) => (
            <g key={fr.id}>
              <polyline
                points={fr.pts.map((p) => p.join(",")).join(" ")}
                fill="none"
                stroke={col(fr.f)}
                strokeWidth={2.4}
                strokeDasharray="7 4"
                strokeLinejoin="round"
              />
              {fr.pts.map((p, i) => (
                <circle key={i} cx={p[0]} cy={p[1]} r={2.6} fill={col(fr.f)} />
              ))}
            </g>
          ))}
          {/* frente en construcción */}
          {frenteAbierto.length > 0 && (
            <g>
              <polyline points={frenteAbierto.map((p) => p.join(",")).join(" ")} fill="none" stroke="#ffffff" strokeWidth={1.6} strokeDasharray="4 4" opacity={0.8} />
              {frenteAbierto.map((p, i) => (
                <circle key={i} cx={p[0]} cy={p[1]} r={3.2} fill="#ffffff" opacity={0.9} />
              ))}
            </g>
          )}
          {/* marcadores */}
          {marcas.map((m) => (
            <g key={m.id}>
              <text x={m.x} y={m.y + 5} textAnchor="middle" fontSize={15} fill={col(m.f)} stroke="#070912" strokeWidth={0.7} paintOrder="stroke" fontWeight="bold">
                {m.glyph}
              </text>
              {m.tipo === "capital" && (
                <circle cx={m.x} cy={m.y} r={11} fill="none" stroke={col(m.f)} strokeWidth={1} strokeDasharray="3 3" opacity={0.7} />
              )}
            </g>
          ))}
          {/* etiquetas */}
          {textos.map((t) => (
            <text key={t.id} x={t.x} y={t.y} textAnchor="middle" fontSize={10} fill="#ffffff" stroke="#070912" strokeWidth={0.8} paintOrder="stroke" fontFamily="monospace" style={{ textTransform: "uppercase" }}>
              {t.t.toUpperCase()}
            </text>
          ))}
        </svg>
      </div>

      {/* export + código */}
      <div className="grid sm:grid-cols-2 gap-2">
        <div className="hud-corner p-3 space-y-2">
          <p className="text-[10px] font-mono uppercase tracking-wider text-violet-hud flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5" /> exportar tu mundo
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <Button size="sm" onClick={exportarPng} className="h-8 font-mono text-[10px] uppercase bg-violet-hud/30 border border-violet-hud text-violet-hud hover:bg-violet-hud/50">
              <Download className="w-3.5 h-3.5 mr-1" /> PNG 2000×1000
            </Button>
            <Button size="sm" variant="ghost" onClick={copiarCodigo} className="h-8 font-mono text-[10px] uppercase">
              <Share2 className="w-3.5 h-3.5 mr-1" /> copiar código
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setImportando((v) => !v)} className="h-8 font-mono text-[10px] uppercase">
              <ClipboardPaste className="w-3.5 h-3.5 mr-1" /> importar
            </Button>
          </div>
          <p className="text-[9px] font-mono text-muted-foreground leading-relaxed">
            El código VGMAP85 lleva tu mapa completo (facciones, zonas, frentes y marcas): pégalo en
            otro dispositivo e IMPORTE para continuar la guerra donde la dejaste.
          </p>
        </div>
        <AnimatePresence>
          {importando && (
            <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="hud-corner p-3 space-y-2">
              <p className="text-[10px] font-mono uppercase tracking-wider text-violet-hud">pegar código VGMAP85</p>
              <Input
                value={codigoImport}
                onChange={(e) => setCodigoImport(e.target.value)}
                placeholder="VGMAP85.eyJ…"
                className="h-8 bg-background/60 border-border font-mono text-[10px]"
              />
              <Button size="sm" onClick={importarCodigo} className="h-7 w-full font-mono text-[10px] uppercase bg-violet-hud/30 border border-violet-hud text-violet-hud">
                cargar mapa del código
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* galería */}
      <div className="hud-corner p-3">
        <p className="text-[10px] font-mono uppercase tracking-wider text-violet-hud flex items-center gap-1.5 mb-2">
          <FolderOpen className="w-3.5 h-3.5" /> tu cartoteca ({galeria.length}/12)
        </p>
        {galeria.length === 0 ? (
          <p className="text-[10px] font-mono text-muted-foreground uppercase py-3 text-center">
            sin mapas guardados todavía · pinta tu primer frente arriba
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {galeria.map((m) => (
              <div key={m.n} className="flex items-center gap-2 border border-border/60 p-2">
                <Layers className="w-4 h-4 text-violet-hud flex-shrink-0" />
                <button onClick={() => abrir(m)} className="flex-1 min-w-0 text-left">
                  <p className="text-[11px] font-mono font-bold uppercase text-foreground truncate">{m.n}</p>
                  <p className="text-[9px] font-mono text-muted-foreground">
                    {(m.z ?? []).length} zonas · {(m.fr ?? []).length} frentes · {(m.m ?? []).length} marcas
                  </p>
                </button>
                <button onClick={() => borrarDeGaleria(m.n)} className="text-red-hud hover:bg-red-hud/20 p-1" aria-label={`Borrar mapa ${m.n}`}>
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-[9px] font-mono text-muted-foreground text-center uppercase">
        cada mapa es tuyo: vive en tu dispositivo y viaja en código o PNG — el mundo dentro de Vanguard también se dibuja
      </p>
    </div>
  );
}
