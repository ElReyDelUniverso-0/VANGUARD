"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Compass,
  Copy,
  Download,
  Flame,
  Globe2,
  Layers,
  MapPin,
  Plane,
  Radio,
  RefreshCw,
  Scale,
  Search,
  ShieldAlert,
  Sparkles,
  Swords,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { CONFLICTS } from "@/lib/game-data";
import { pedirNoticias } from "@/lib/noticias-cache";
import {
  ARMAS_3D,
  ESCUADRONES_3D,
  LUGARES_MUNDO,
  UNIFORMES_3D,
  type BiomaTeatro,
} from "@/lib/teatro-total-data";
import {
  CHOQUES_SUMINISTRO,
  DESTINOS_VIAJE,
  TRATADOS_RADAR,
  type FuncionExpansionId,
} from "@/lib/vanguard-expansion-data";

interface CableSimple {
  id: string;
  title: string;
  source?: string;
  publishedAt?: string;
  severity?: string;
}

interface SismoItem {
  id: string;
  lugar: string;
  magnitud: number;
  profundidadKm: number;
  haceMin: number;
  tsunami: boolean;
}

interface EventoPlanetaItem {
  id: string;
  titulo: string;
  categoria: string;
  fecha: string;
}

interface CriptoItem {
  id: string;
  simbolo: string;
  nombre: string;
  precioUsd: number;
  cambio24h: number;
}

function linkTeatroCoord(lat: number, lng: number, nombre: string): string {
  return `/teatro-3d?modulo=mundial&lat=${encodeURIComponent(lat.toFixed(2))}&lng=${encodeURIComponent(lng.toFixed(2))}&nombre=${encodeURIComponent(nombre)}`;
}

// ── #1 COMPARADOR TÁCTICO CARA A CARA ───────────────────────────────────────
function FuncionComparadorFuerzas() {
  const [tipo, setTipo] = useState<"armas" | "uniformes" | "escuadrones">("armas");
  const [idA, setIdA] = useState<string>(ARMAS_3D[0].id);
  const [idB, setIdB] = useState<string>(ARMAS_3D[1].id);

  const lista = useMemo(() => {
    if (tipo === "armas") return ARMAS_3D;
    if (tipo === "uniformes") return UNIFORMES_3D;
    return ESCUADRONES_3D;
  }, [tipo]);

  const cambiarTipo = (nuevo: "armas" | "uniformes" | "escuadrones") => {
    setTipo(nuevo);
    if (nuevo === "armas") {
      setIdA(ARMAS_3D[0].id);
      setIdB(ARMAS_3D[1].id);
    } else if (nuevo === "uniformes") {
      setIdA(UNIFORMES_3D[0].id);
      setIdB(UNIFORMES_3D[1].id);
    } else {
      setIdA(ESCUADRONES_3D[0].id);
      setIdB(ESCUADRONES_3D[1].id);
    }
  };

  const filasMetricas = useMemo(() => {
    if (tipo === "armas") {
      const a = ARMAS_3D.find((x) => x.id === idA) ?? ARMAS_3D[0];
      const b = ARMAS_3D.find((x) => x.id === idB) ?? ARMAS_3D[1];
      return {
        nombreA: `#${a.rango} ${a.nombre}`,
        nombreB: `#${b.rango} ${b.nombre}`,
        subA: `${a.specs.calibre} · ${a.specs.alcance}`,
        subB: `${b.specs.calibre} · ${b.specs.alcance}`,
        filas: [
          { k: "Daño / Energía", vA: a.simStats.dano, vB: b.simStats.dano },
          { k: "Anti-Blindaje", vA: a.simStats.antiBlindaje, vB: b.simStats.antiBlindaje },
          { k: "Anti-Aéreo", vA: a.simStats.antiAereo, vB: b.simStats.antiAereo },
          { k: "Alcance Relativo", vA: a.simStats.alcanceRelativo, vB: b.simStats.alcanceRelativo },
        ],
      };
    }
    if (tipo === "uniformes") {
      const a = UNIFORMES_3D.find((x) => x.id === idA) ?? UNIFORMES_3D[0];
      const b = UNIFORMES_3D.find((x) => x.id === idB) ?? UNIFORMES_3D[1];
      return {
        nombreA: `#${a.rango} ${a.nombre}`,
        nombreB: `#${b.rango} ${b.nombre}`,
        subA: `${a.faccion} · ${a.pesoTotalKg} kg`,
        subB: `${b.faccion} · ${b.pesoTotalKg} kg`,
        filas: [
          { k: "Sigilo Infrarrojo (IR)", vA: a.sigiloIR, vB: b.sigiloIR },
          { k: "Protección Simulada", vA: Math.round(a.bonoBlindajeSim * 65), vB: Math.round(b.bonoBlindajeSim * 65) },
          { k: "Camuflaje Urbano", vA: a.camuflaje.urbano, vB: b.camuflaje.urbano },
          { k: "Camuflaje Desierto/Costa", vA: Math.round((a.camuflaje.desierto + a.camuflaje.costa) / 2), vB: Math.round((b.camuflaje.desierto + b.camuflaje.costa) / 2) },
        ],
      };
    }
    const a = ESCUADRONES_3D.find((x) => x.id === idA) ?? ESCUADRONES_3D[0];
    const b = ESCUADRONES_3D.find((x) => x.id === idB) ?? ESCUADRONES_3D[1];
    return {
      nombreA: `#${a.rango} ${a.nombre}`,
      nombreB: `#${b.rango} ${b.nombre}`,
      subA: `${a.simboloOTAN} · ${a.efectivos}`,
      subB: `${b.simboloOTAN} · ${b.efectivos}`,
      filas: [
        { k: "Potencia de Fuego", vA: a.stats.fuego, vB: b.stats.fuego },
        { k: "Blindaje / Supervivencia", vA: a.stats.blindaje, vB: b.stats.blindaje },
        { k: "Movilidad", vA: a.stats.movilidad, vB: b.stats.movilidad },
        { k: "Sigilo + Guerra Electrónica", vA: Math.round((a.stats.sigilo + a.stats.ew) / 2), vB: Math.round((b.stats.sigilo + b.stats.ew) / 2) },
      ],
    };
  }, [tipo, idA, idB]);

  const totalA = filasMetricas.filas.reduce((s, r) => s + r.vA, 0);
  const totalB = filasMetricas.filas.reduce((s, r) => s + r.vB, 0);
  const ganador = totalA === totalB ? "EMPATE TÉCNICO" : totalA > totalB ? filasMetricas.nombreA : filasMetricas.nombreB;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1.5 font-mono text-xs">
          {(
            [
              { id: "armas", label: "ARMAS (10)" },
              { id: "uniformes", label: "UNIFORMES (8)" },
              { id: "escuadrones", label: "ESCUADRONES (8)" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => cambiarTipo(t.id)}
              className={cn(
                "px-3 py-1.5 rounded font-bold border transition-colors",
                tipo === t.id
                  ? "bg-[#FFC94D] text-black border-[#FFC94D]"
                  : "border-white/15 text-muted-foreground hover:text-foreground"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <Link
          href={`/teatro-3d?modulo=${tipo}`}
          className="px-3 py-1.5 rounded border border-amber-hud/50 text-amber font-mono text-xs font-bold hover:bg-amber-hud/15 flex items-center gap-1"
        >
          Inspeccionar en 3D <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="hud-panel p-3 border-amber-hud/40 space-y-2">
          <div className="font-mono text-[10px] text-amber font-bold uppercase">CONTENDIENTE A</div>
          <select
            value={idA}
            onChange={(e) => setIdA(e.target.value)}
            aria-label="Seleccionar contendiente A"
            className="w-full px-2.5 py-2 rounded bg-black/70 border border-amber-hud/40 font-mono text-xs text-foreground"
          >
            {lista.map((x) => (
              <option key={x.id} value={x.id}>
                #{x.rango} {x.nombre}
              </option>
            ))}
          </select>
          <div className="text-[11px] font-mono text-muted-foreground">{filasMetricas.subA}</div>
        </div>

        <div className="hud-panel p-3 border-cyan-hud/40 space-y-2">
          <div className="font-mono text-[10px] text-cyan-hud font-bold uppercase">CONTENDIENTE B</div>
          <select
            value={idB}
            onChange={(e) => setIdB(e.target.value)}
            aria-label="Seleccionar contendiente B"
            className="w-full px-2.5 py-2 rounded bg-black/70 border border-cyan-hud/40 font-mono text-xs text-foreground"
          >
            {lista.map((x) => (
              <option key={x.id} value={x.id}>
                #{x.rango} {x.nombre}
              </option>
            ))}
          </select>
          <div className="text-[11px] font-mono text-muted-foreground">{filasMetricas.subB}</div>
        </div>
      </div>

      <div className="hud-panel p-4 border-white/15 space-y-3">
        {filasMetricas.filas.map((f) => {
          const diff = f.vA - f.vB;
          return (
            <div key={f.k} className="space-y-1">
              <div className="flex justify-between font-mono text-xs">
                <span className="text-amber font-bold">{f.vA}</span>
                <span className="text-foreground font-semibold">
                  {f.k}{" "}
                  <span className={cn("text-[10px]", diff > 0 ? "text-amber" : diff < 0 ? "text-cyan-hud" : "text-muted-foreground")}>
                    ({diff > 0 ? `+${diff} A` : diff < 0 ? `+${Math.abs(diff)} B` : "="})
                  </span>
                </span>
                <span className="text-cyan-hud font-bold">{f.vB}</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 h-2">
                <div className="bg-white/10 rounded-l overflow-hidden flex justify-end">
                  <div className="bg-[#FFC94D] h-full" style={{ width: `${Math.min(100, f.vA)}%` }} />
                </div>
                <div className="bg-white/10 rounded-r overflow-hidden">
                  <div className="bg-[#38BDF8] h-full" style={{ width: `${Math.min(100, f.vB)}%` }} />
                </div>
              </div>
            </div>
          );
        })}

        <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
          <span className="text-muted-foreground">
            Índice total: <b className="text-amber">{totalA}</b> vs <b className="text-cyan-hud">{totalB}</b>
          </span>
          <span className="px-2.5 py-1 rounded bg-[#FFC94D] text-black font-black">
            VENTAJA: {ganador}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── #2 TERMÓMETRO GLOBAL POR REGIONES ───────────────────────────────────────
function FuncionTermometroRegiones() {
  const grupos = useMemo(() => {
    const mapRegion = (country: string, lat: number, lng: number) => {
      const c = country.toLowerCase();
      if (c.includes("ucrania") || lat > 43 && lng > 10 && lng < 55) return "Europa del Este y Mar Negro";
      if (lng > 30 && lng < 63 && lat > 11 && lat < 42) return "Oriente Medio y Mar Rojo";
      if (lng >= 63) return "Asia y Pacífico";
      if (lat < 36 && lng >= -20 && lng <= 52) return "África y Sahel";
      return "América y Atlántico";
    };

    const buckets = new Map<string, typeof CONFLICTS>();
    for (const c of CONFLICTS) {
      const reg = mapRegion(c.country, c.lat, c.lng);
      const arr = buckets.get(reg) ?? [];
      arr.push(c);
      buckets.set(reg, arr);
    }

    return [...buckets.entries()]
      .map(([region, items]) => {
        const media = Math.round(items.reduce((s, i) => s + i.intensity, 0) / items.length);
        const max = Math.max(...items.map((i) => i.intensity));
        const criticos = items.filter((i) => i.level === "CRITICO").length;
        return { region, items, media, max, criticos };
      })
      .sort((a, b) => b.max - a.max);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {grupos.map((g) => (
        <div key={g.region} className="hud-panel p-4 border-white/15 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-mono text-sm font-bold text-foreground">{g.region}</h4>
            <span
              className={cn(
                "px-2 py-0.5 rounded font-mono text-[10px] font-black",
                g.max >= 85 ? "bg-[#FF3B30] text-white" : g.max >= 65 ? "bg-[#FFC94D] text-black" : "bg-[#38BDF8] text-black"
              )}
            >
              PICO {g.max}/100
            </span>
          </div>
          <div className="h-2 rounded bg-white/10 overflow-hidden">
            <div
              className={cn("h-full", g.media >= 75 ? "bg-[#FF3B30]" : g.media >= 55 ? "bg-[#FFC94D]" : "bg-[#3DDC97]")}
              style={{ width: `${g.media}%` }}
            />
          </div>
          <div className="flex justify-between font-mono text-[11px] text-muted-foreground">
            <span>Focos monitoreados: {g.items.length} ({g.criticos} críticos)</span>
            <span>Media: <b className="text-amber">{g.media}/100</b></span>
          </div>
          <div className="space-y-1.5 pt-1">
            {g.items.slice(0, 3).map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-2 p-2 rounded bg-black/50 border border-white/10 text-xs font-mono">
                <span className="truncate">{c.name} ({c.intensity}/100)</span>
                <Link
                  href={linkTeatroCoord(c.lat, c.lng, c.name)}
                  className="px-2 py-0.5 rounded bg-[#FFC94D] text-black font-bold text-[10px] shrink-0"
                >
                  Simular 3D →
                </Link>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── #3 CALCULADORA DE RIESGO DE VIAJE Y RUTAS SEGURAS ───────────────────────
function FuncionRiesgoViajero() {
  const [destinoId, setDestinoId] = useState(DESTINOS_VIAJE[0].id);
  const [cables, setCables] = useState<CableSimple[]>([]);

  useEffect(() => {
    let vivo = true;
    pedirNoticias()
      .then((items) => {
        if (vivo) setCables(items as CableSimple[]);
      })
      .catch(() => {});
    return () => {
      vivo = false;
    };
  }, []);

  const dest = DESTINOS_VIAJE.find((d) => d.id === destinoId) ?? DESTINOS_VIAJE[0];
  const conflictoAsociado = CONFLICTS.find((c) => c.id === dest.teatroRelacionadoId);
  const indiceFinal = conflictoAsociado
    ? Math.round((dest.riesgoBase + conflictoAsociado.intensity) / 2)
    : dest.riesgoBase;

  const cablesRelacionados = useMemo(() => {
    const palabras = dest.nombre.toLowerCase().split(/[\s/·]+/).filter((w) => w.length > 3);
    return cables.filter((c) => palabras.some((p) => c.title.toLowerCase().includes(p))).slice(0, 3);
  }, [cables, dest.nombre]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {DESTINOS_VIAJE.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => setDestinoId(d.id)}
            className={cn(
              "px-3 py-1.5 rounded border font-mono text-xs transition-colors",
              d.id === dest.id
                ? "bg-[#38BDF8] text-black border-[#38BDF8] font-bold"
                : "border-white/15 text-muted-foreground hover:text-foreground"
            )}
          >
            {d.nombre}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="hud-panel p-4 border-cyan-hud/35 space-y-2">
          <div className="font-mono text-[10px] text-cyan-hud uppercase">ÍNDICE COMPUESTO DE TRÁNSITO</div>
          <div className="text-3xl font-mono font-black text-foreground">
            {indiceFinal}
            <span className="text-sm text-muted-foreground">/100</span>
          </div>
          <div className="inline-block px-2.5 py-0.5 rounded font-mono text-[10px] font-black bg-[#FFC94D] text-black">
            {indiceFinal >= 75 ? "ALERTA ALTA — DESVIAR" : indiceFinal >= 45 ? "PRECAUCIÓN ELEVADA" : "CORREDOR OPERATIVO"}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed pt-1">{dest.notaSeguridad}</p>
        </div>

        <div className="hud-panel p-4 border-white/15 space-y-2.5 font-mono text-xs">
          <div className="flex items-center gap-2 text-amber font-bold">
            <Plane className="w-4 h-4" /> ESTADO DEL ESPACIO AÉREO
          </div>
          <div className="p-2 rounded bg-black/50 border border-white/10 text-foreground">
            {dest.corredorAereo}
          </div>
          <div className="flex items-center gap-2 text-cyan-hud font-bold pt-1">
            <Compass className="w-4 h-4" /> TRÁNSITO MARÍTIMO
          </div>
          <div className="p-2 rounded bg-black/50 border border-white/10 text-foreground">
            {dest.corredorMaritimo}
          </div>
          <div className="text-[11px] text-[#3DDC97] pt-1">
            Ruta alterna recomendada: <b>{dest.alternativaSegura}</b>
          </div>
        </div>

        <div className="hud-panel p-4 border-white/15 space-y-2">
          <div className="font-mono text-xs font-bold text-amber">SEÑALES EN VIVO DE LA RUTA</div>
          {cablesRelacionados.length === 0 ? (
            <p className="text-xs font-mono text-muted-foreground">
              Sin incidentes recientes coincidentes en los últimos cables locales para «{dest.nombre}».
            </p>
          ) : (
            <div className="space-y-1.5">
              {cablesRelacionados.map((c) => (
                <div key={c.id} className="p-2 rounded bg-black/50 border border-white/10 text-xs">
                  <div className="font-medium text-foreground">{c.title}</div>
                  <div className="text-[10px] font-mono text-muted-foreground">{c.source}</div>
                </div>
              ))}
            </div>
          )}
          {conflictoAsociado && (
            <Link
              href={linkTeatroCoord(conflictoAsociado.lat, conflictoAsociado.lng, dest.nombre)}
              className="inline-flex items-center gap-1 mt-2 px-3 py-1.5 rounded bg-[#FFC94D] text-black font-mono text-xs font-black"
            >
              Ver sector en Teatro 3D <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// ── #4 SIMULADOR DE IMPACTO ECONÓMICO Y SUMINISTROS ─────────────────────────
function FuncionImpactoSuministros() {
  const [activos, setActivos] = useState<string[]>(["ormuz", "babelmandeb"]);
  const [criptos, setCriptos] = useState<CriptoItem[]>([]);

  useEffect(() => {
    let vivo = true;
    fetch("/api/datos/cripto")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (vivo && Array.isArray(d?.criptos ?? d?.datos ?? d?.items ?? d)) {
          const arr = Array.isArray(d) ? d : d?.criptos ?? d?.datos ?? [];
          setCriptos(arr.slice(0, 4));
        }
      })
      .catch(() => {});
    return () => {
      vivo = false;
    };
  }, []);

  const toggle = (id: string) => {
    setActivos((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const seleccion = CHOQUES_SUMINISTRO.filter((c) => activos.includes(c.id));
  const petroleo = seleccion.reduce((s, c) => s + c.petroleoImpactoUsd, 0);
  const gnl = Math.min(100, seleccion.reduce((s, c) => s + c.gnlImpactoPct, 0));
  const chips = Math.min(100, seleccion.reduce((s, c) => s + c.chipsImpactoPct, 0));
  const granos = Math.min(100, seleccion.reduce((s, c) => s + c.granosImpactoPct, 0));
  const maxDias = seleccion.length > 0 ? Math.max(...seleccion.map((c) => c.diasDesvioMaritimo)) : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {CHOQUES_SUMINISTRO.map((c) => {
          const on = activos.includes(c.id);
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => toggle(c.id)}
              className={cn(
                "p-3 rounded-lg border text-left transition-all",
                on
                  ? "bg-amber-hud/20 border-[#FFC94D] text-foreground"
                  : "bg-black/45 border-white/10 text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="flex items-center justify-between gap-2 font-mono text-xs font-bold">
                <span>{c.nombre}</span>
                <span className={cn("px-1.5 py-0.5 rounded text-[10px]", on ? "bg-[#FFC94D] text-black" : "bg-white/10")}>
                  {on ? "ACTIVO" : "SIMULAR"}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">{c.descripcion}</p>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5 font-mono">
        <div className="hud-panel p-3 border-amber-hud/35">
          <div className="text-[10px] text-muted-foreground">PRIMA CRUDO EST.</div>
          <div className="text-xl font-black text-amber">+${petroleo}/bbl</div>
        </div>
        <div className="hud-panel p-3 border-cyan-hud/35">
          <div className="text-[10px] text-muted-foreground">TENSIÓN GNL</div>
          <div className="text-xl font-black text-cyan-hud">+{gnl}%</div>
        </div>
        <div className="hud-panel p-3 border-red-hud/35">
          <div className="text-[10px] text-muted-foreground">SEMICONDUCTORES</div>
          <div className="text-xl font-black text-red-hud">+{chips}%</div>
        </div>
        <div className="hud-panel p-3 border-green-hud/35">
          <div className="text-[10px] text-muted-foreground">GRANOS / FLETE</div>
          <div className="text-xl font-black text-green-hud">+{granos}%</div>
        </div>
        <div className="hud-panel p-3 border-white/15">
          <div className="text-[10px] text-muted-foreground">DESVÍO NAVAL MÁX.</div>
          <div className="text-xl font-black text-foreground">+{maxDias} días</div>
        </div>
      </div>

      {criptos.length > 0 && (
        <div className="hud-panel p-3 border-white/10 flex flex-wrap items-center gap-3 font-mono text-xs">
          <span className="text-amber font-bold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> PULSO MERCADO EN VIVO:
          </span>
          {criptos.map((cr) => (
            <span key={cr.id} className="px-2 py-1 rounded bg-black/50 border border-white/10">
              {cr.simbolo}: ${cr.precioUsd?.toLocaleString()} (
              <span className={cr.cambio24h >= 0 ? "text-green-hud" : "text-red-hud"}>
                {cr.cambio24h >= 0 ? "+" : ""}
                {cr.cambio24h?.toFixed(2)}%
              </span>
              )
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── #5 RADAR DE TRATADOS Y CUMBRES ──────────────────────────────────────────
function FuncionRadarDiplomatico() {
  const [bloque, setBloque] = useState<string>("TODOS");
  const bloques = ["TODOS", "OTAN / Europa", "ONU / Tratados", "Indo-Pacífico", "BRICS / Sur Global"];

  const items = TRATADOS_RADAR.filter((t) => bloque === "TODOS" || t.bloque === bloque);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5 font-mono text-xs">
        {bloques.map((b) => (
          <button
            key={b}
            type="button"
            onClick={() => setBloque(b)}
            className={cn(
              "px-3 py-1.5 rounded border font-bold",
              bloque === b ? "bg-[#FFC94D] text-black border-[#FFC94D]" : "border-white/15 text-muted-foreground hover:text-foreground"
            )}
          >
            {b}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((h) => (
          <div key={h.id} className="hud-panel p-4 border-white/15 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <span className="font-mono text-[10px] text-cyan-hud uppercase font-bold">{h.bloque}</span>
              <span
                className={cn(
                  "px-2 py-0.5 rounded font-mono text-[10px] font-black",
                  h.estado.includes("CRÍTICO")
                    ? "bg-[#FF3B30] text-white"
                    : h.estado.includes("VIGENTE")
                    ? "bg-[#3DDC97] text-black"
                    : "bg-[#FFC94D] text-black"
                )}
              >
                {h.estado}
              </span>
            </div>
            <h4 className="text-sm font-bold text-foreground">{h.nombre}</h4>
            <p className="text-xs text-muted-foreground">{h.impacto}</p>
            <div className="flex items-center justify-between pt-1 font-mono text-[11px]">
              <span className="text-amber">{h.ventanaTemporal}</span>
              <Link
                href={`/nucleo?q=${encodeURIComponent(h.palabrasClave[0])}`}
                className="text-cyan-hud hover:underline flex items-center gap-1"
              >
                Buscar en El Núcleo <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── #6 VERIFICADOR RÁPIDO OSINT ─────────────────────────────────────────────
function FuncionVerificadorOsint() {
  const [texto, setTexto] = useState(
    "Reportes de tráfico naval restringido en el Estrecho de Ormuz tras maniobras militares"
  );
  const [cables, setCables] = useState<CableSimple[]>([]);

  useEffect(() => {
    let vivo = true;
    pedirNoticias()
      .then((items) => {
        if (vivo) setCables((items as CableSimple[]).slice(0, 4));
      })
      .catch(() => {});
    return () => {
      vivo = false;
    };
  }, []);

  const analisis = useMemo(() => {
    const low = texto.toLowerCase();
    const alarmas = ["urgente", "bomba", "secreto", "total", "destruido", "colapso", "inminente", "100%"].filter((w) =>
      low.includes(w)
    );
    const entidades = [
      "Ucrania",
      "Rusia",
      "Gaza",
      "Israel",
      "Ormuz",
      "Taiwán",
      "OTAN",
      "Mar Rojo",
      "Sudán",
      "China",
      "Irán",
    ].filter((e) => low.includes(e.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "")) || low.includes(e.toLowerCase()));
    const tieneFuente = /reuters|ap|afp|onu|osint|informe|reportes|comunicado|ministerio/i.test(texto);
    const objetividad = Math.max(
      15,
      Math.min(98, 64 + (tieneFuente ? 18 : 0) + entidades.length * 6 - alarmas.length * 14)
    );
    return { alarmas, entidades, tieneFuente, objetividad };
  }, [texto]);

  return (
    <div className="space-y-3">
      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        rows={3}
        placeholder="Pega un titular o cable para analizar sesgo, marcadores de urgencia y entidades..."
        className="w-full p-3 rounded-lg bg-black/60 border border-cyan-hud/35 font-mono text-xs text-foreground"
      />

      {cables.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-mono text-[10px] text-muted-foreground">Cables reales:</span>
          {cables.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setTexto(`${c.title} (${c.source ?? "OSINT"})`)}
              className="px-2 py-1 rounded border border-white/15 text-[10px] font-mono text-foreground hover:border-cyan-hud truncate max-w-[260px]"
            >
              {c.title}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
        <div className="hud-panel p-3 border-cyan-hud/30">
          <div className="text-[10px] text-muted-foreground">ÍNDICE DE NEUTRALIDAD</div>
          <div className="text-2xl font-black text-cyan-hud">{analisis.objetividad}/100</div>
          <div className="text-[10px] text-muted-foreground mt-1">
            {analisis.tieneFuente ? "Cita fuente u organismo verificable" : "Sin atribución explícita de fuente"}
          </div>
        </div>
        <div className="hud-panel p-3 border-amber-hud/30">
          <div className="text-[10px] text-muted-foreground">ENTIDADES DETECTADAS</div>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {analisis.entidades.length === 0 ? (
              <span className="text-muted-foreground text-[11px]">Ninguna entidad geográfica clave</span>
            ) : (
              analisis.entidades.map((e) => (
                <Link
                  key={e}
                  href={`/nucleo?q=${encodeURIComponent(e)}`}
                  className="px-2 py-0.5 rounded bg-[#FFC94D] text-black font-bold text-[10px]"
                >
                  {e} →
                </Link>
              ))
            )}
          </div>
        </div>
        <div className="hud-panel p-3 border-red-hud/30">
          <div className="text-[10px] text-muted-foreground">SEÑALES DE SESGO / ALARMA</div>
          <div className="text-sm font-bold text-foreground mt-1">
            {analisis.alarmas.length === 0 ? (
              <span className="text-[#3DDC97]">Sin lenguaje sensacionalista detectado</span>
            ) : (
              <span className="text-red-hud">Detectadas: {analisis.alarmas.join(", ")}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── #7 DUELO TÁCTICO RELÁMPAGO (3 TURNOS) ────────────────────────────────────
function FuncionDueloRelampago() {
  const [sectorIdx, setSectorIdx] = useState(0);
  const [turno, setTurno] = useState(1);
  const [puntosA, setPuntosA] = useState(50);
  const [puntosB, setPuntosB] = useState(50);
  const [registro, setRegistro] = useState<string[]>([
    "Despliegue inicial 50% / 50%. Elige doctrina para los 3 turnos.",
  ]);

  const lugar = LUGARES_MUNDO[sectorIdx] ?? LUGARES_MUNDO[0];

  const jugarTurno = (doctrina: "recon" | "asalto" | "defensa") => {
    if (turno > 3) return;
    const modA = doctrina === "asalto" ? 14 : doctrina === "recon" ? 9 : 7;
    const modB = ((sectorIdx * 7 + turno * 11) % 13) + 4;
    const dA = Math.max(10, Math.min(90, puntosA + modA - modB));
    const dB = 100 - dA;
    setPuntosA(dA);
    setPuntosB(dB);
    setRegistro((r) => [
      `Turno ${turno} (${doctrina.toUpperCase()}): VANGUARD ${dA}% vs OPFOR ${dB}% en ${lugar.nombre}`,
      ...r,
    ]);
    setTurno((t) => t + 1);
  };

  const reiniciar = () => {
    setTurno(1);
    setPuntosA(50);
    setPuntosB(50);
    setRegistro([`Nueva escaramuza lista en ${lugar.nombre} (${lugar.bioma}).`]);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <select
          value={sectorIdx}
          onChange={(e) => {
            setSectorIdx(Number(e.target.value));
            setTurno(1);
            setPuntosA(50);
            setPuntosB(50);
          }}
          aria-label="Seleccionar sector para Duelo Relámpago"
          className="px-3 py-1.5 rounded bg-black/70 border border-amber-hud/40 font-mono text-xs text-foreground"
        >
          {LUGARES_MUNDO.slice(0, 12).map((l, i) => (
            <option key={l.id} value={i}>
              {l.nombre} ({l.bioma})
            </option>
          ))}
        </select>

        <Link
          href={linkTeatroCoord(lugar.lat, lugar.lng, lugar.nombre)}
          className="px-3 py-1.5 rounded bg-[#FFC94D] text-black font-mono text-xs font-black flex items-center gap-1"
        >
          Llevar escenario a Teatro 3D <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="hud-panel p-4 border-amber-hud/30 space-y-3">
        <div className="flex justify-between font-mono text-xs font-bold">
          <span className="text-amber">#1 VANGUARD: {puntosA}%</span>
          <span className="text-muted-foreground">{turno <= 3 ? `TURNO ${turno}/3` : "BATALLA FINALIZADA"}</span>
          <span className="text-red-hud">OPFOR: {puntosB}%</span>
        </div>
        <div className="h-3 rounded-full bg-[#FF3B30] overflow-hidden">
          <div className="h-full bg-[#FFC94D] transition-all" style={{ width: `${puntosA}%` }} />
        </div>

        <div className="flex flex-wrap gap-2 font-mono text-xs">
          <button
            type="button"
            disabled={turno > 3}
            onClick={() => jugarTurno("recon")}
            className="px-3 py-1.5 rounded bg-[#38BDF8] text-black font-bold disabled:opacity-40"
          >
            Reconocimiento + Dron
          </button>
          <button
            type="button"
            disabled={turno > 3}
            onClick={() => jugarTurno("asalto")}
            className="px-3 py-1.5 rounded bg-[#FFC94D] text-black font-bold disabled:opacity-40"
          >
            Asalto Blindado
          </button>
          <button
            type="button"
            disabled={turno > 3}
            onClick={() => jugarTurno("defensa")}
            className="px-3 py-1.5 rounded bg-[#3DDC97] text-black font-bold disabled:opacity-40"
          >
            Defensa Aérea / Artillería
          </button>
          <button
            type="button"
            onClick={reiniciar}
            className="px-3 py-1.5 rounded border border-white/20 text-foreground hover:bg-white/10"
          >
            Reiniciar
          </button>
        </div>

        <div className="space-y-1 font-mono text-[11px] text-muted-foreground">
          {registro.slice(0, 4).map((l, idx) => (
            <div key={idx} className="p-1.5 rounded bg-black/50 border border-white/5">
              {l}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── #8 VIGÍA PLANETARIO (SISMOS USGS + NASA EONET) ──────────────────────────
function FuncionVigíaPlanetario() {
  const [sismos, setSismos] = useState<SismoItem[]>([]);
  const [eventos, setEventos] = useState<EventoPlanetaItem[]>([]);
  const [fuenteS, setFuenteS] = useState<string>("Cargando...");
  const [fuenteE, setFuenteE] = useState<string>("Cargando...");

  const recargar = () => {
    fetch("/api/datos/sismos")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.sismos) {
          setSismos(d.sismos.slice(0, 5));
          setFuenteS(d.enVivo ? `EN VIVO (${d.fuente})` : `RESPALDO (${d.fuente})`);
        }
      })
      .catch(() => setFuenteS("Sin respuesta"));

    fetch("/api/datos/planeta")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.eventos) {
          setEventos(d.eventos.slice(0, 5));
          setFuenteE(d.enVivo ? `EN VIVO (${d.fuente})` : `RESPALDO (${d.fuente})`);
        }
      })
      .catch(() => setFuenteE("Sin respuesta"));
  };

  useEffect(() => {
    let vivo = true;
    Promise.all([
      fetch("/api/datos/sismos").then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch("/api/datos/planeta").then((r) => (r.ok ? r.json() : null)).catch(() => null),
    ]).then(([ds, dp]) => {
      if (!vivo) return;
      if (ds?.sismos) {
        setSismos(ds.sismos.slice(0, 5));
        setFuenteS(ds.enVivo ? `EN VIVO (${ds.fuente})` : `RESPALDO (${ds.fuente})`);
      }
      if (dp?.eventos) {
        setEventos(dp.eventos.slice(0, 5));
        setFuenteE(dp.enVivo ? `EN VIVO (${dp.fuente})` : `RESPALDO (${dp.fuente})`);
      }
    });
    return () => {
      vivo = false;
    };
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={recargar}
          className="px-3 py-1 rounded border border-cyan-hud/45 text-cyan-hud font-mono text-xs font-bold flex items-center gap-1 hover:bg-cyan-hud/15"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Actualizar telemetría
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="hud-panel p-4 border-amber-hud/30 space-y-2">
          <div className="flex justify-between items-center font-mono text-xs">
            <span className="font-bold text-amber flex items-center gap-1.5">
              <Activity className="w-4 h-4" /> SISMOS M4.5+ RECIENTES
            </span>
            <span className="text-[10px] text-muted-foreground">{fuenteS}</span>
          </div>
          {sismos.map((s) => (
            <div key={s.id} className="p-2 rounded bg-black/50 border border-white/10 flex items-center justify-between gap-2 text-xs font-mono">
              <div className="min-w-0">
                <div className="text-foreground font-semibold truncate">{s.lugar}</div>
                <div className="text-[10px] text-muted-foreground">
                  Prof. {s.profundidadKm} km · hace {s.haceMin} min
                </div>
              </div>
              <span className={cn("px-2 py-0.5 rounded font-black shrink-0", s.magnitud >= 5.5 ? "bg-[#FF3B30] text-white" : "bg-[#FFC94D] text-black")}>
                M{s.magnitud}
              </span>
            </div>
          ))}
        </div>

        <div className="hud-panel p-4 border-green-hud/30 space-y-2">
          <div className="flex justify-between items-center font-mono text-xs">
            <span className="font-bold text-green-hud flex items-center gap-1.5">
              <Globe2 className="w-4 h-4" /> ALERTAS NATURALES NASA EONET
            </span>
            <span className="text-[10px] text-muted-foreground">{fuenteE}</span>
          </div>
          {eventos.map((ev) => (
            <div key={ev.id} className="p-2 rounded bg-black/50 border border-white/10 flex items-center justify-between gap-2 text-xs font-mono">
              <div className="min-w-0">
                <div className="text-foreground font-semibold truncate">{ev.titulo}</div>
                <div className="text-[10px] text-muted-foreground">{ev.categoria}</div>
              </div>
              <span className="text-[10px] text-amber shrink-0">{ev.fecha || "activo"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── #9 GENERADOR DE PARTE EJECUTIVO 1-MINUTO ────────────────────────────────
function FuncionGeneradorBriefing() {
  const [enfoque, setEnfoque] = useState("GLOBAL");
  const [cables, setCables] = useState<CableSimple[]>([]);

  useEffect(() => {
    let vivo = true;
    pedirNoticias()
      .then((items) => {
        if (vivo) setCables((items as CableSimple[]).slice(0, 6));
      })
      .catch(() => {});
    return () => {
      vivo = false;
    };
  }, []);

  const topConflictos = useMemo(
    () =>
      CONFLICTS.filter(
        (c) =>
          enfoque === "GLOBAL" ||
          c.tags.some((t) => t.toLowerCase().includes(enfoque.toLowerCase())) ||
          c.name.toLowerCase().includes(enfoque.toLowerCase()) ||
          c.country.toLowerCase().includes(enfoque.toLowerCase())
      )
        .sort((a, b) => b.intensity - a.intensity)
        .slice(0, 4),
    [enfoque]
  );

  const textoBriefing = useMemo(() => {
    const fecha = new Date().toISOString().slice(0, 16).replace("T", " ") + " UTC";
    const lineas = [
      `====================================================`,
      `VANGUARD · PARTE EJECUTIVO (${enfoque}) · ${fecha}`,
      `====================================================`,
      ``,
      `1. FOCOS DE MAYOR ESCALADA:`,
      ...topConflictos.map(
        (c) => ` - ${c.name} (${c.intensity}/100 · ${c.level}): ${c.summary}`
      ),
      ``,
      `2. SEÑALES RECIENTES DE PRENSA / OSINT:`,
      ...(cables.length > 0
        ? cables.slice(0, 4).map((cb) => ` - [${cb.source ?? "OSINT"}] ${cb.title}`)
        : [" - Catálogo OSINT activo (sin cables externos en esta consulta)."]),
      ``,
      `3. EQUIPAMIENTO #1 DE REFERENCIA VANGUARD:`,
      ` - Uniforme: ${UNIFORMES_3D[0].nombre} (${UNIFORMES_3D[0].pesoTotalKg}kg, -${UNIFORMES_3D[0].sigiloIR}% IR)`,
      ` - Escuadrón: ${ESCUADRONES_3D[0].nombre}`,
      ` - Arma: ${ARMAS_3D[0].nombre} (${ARMAS_3D[0].specs.calibre})`,
      `====================================================`,
    ];
    return lineas.join("\n");
  }, [enfoque, topConflictos, cables]);

  const copiar = () => {
    navigator.clipboard?.writeText(textoBriefing);
    toast.success("Parte ejecutivo copiado al portapapeles");
  };

  const descargar = () => {
    const blob = new Blob([textoBriefing], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vanguard-briefing-${enfoque.toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Archivo .txt descargado");
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5 font-mono text-xs">
          {["GLOBAL", "Ucrania", "Gaza", "drones", "energía"].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setEnfoque(f)}
              className={cn(
                "px-2.5 py-1 rounded border font-bold",
                enfoque === f ? "bg-[#FFC94D] text-black border-[#FFC94D]" : "border-white/15 text-muted-foreground"
              )}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="flex gap-2 font-mono text-xs">
          <button
            type="button"
            onClick={copiar}
            className="px-3 py-1.5 rounded bg-[#38BDF8] text-black font-bold flex items-center gap-1"
          >
            <Copy className="w-3.5 h-3.5" /> Copiar Parte
          </button>
          <button
            type="button"
            onClick={descargar}
            className="px-3 py-1.5 rounded bg-[#FFC94D] text-black font-bold flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" /> Descargar .TXT
          </button>
        </div>
      </div>

      <pre className="p-3.5 rounded-lg bg-black/75 border border-amber-hud/30 font-mono text-[11px] text-foreground whitespace-pre-wrap leading-relaxed overflow-x-auto">
        {textoBriefing}
      </pre>
    </div>
  );
}

// ── #10 EXPLORADOR DE 32 PUNTOS Y ESTRECHOS → TEATRO 3D ─────────────────────
function FuncionAtlasEstrategico() {
  const [filtro, setFiltro] = useState("");
  const [bioma, setBioma] = useState<"todos" | BiomaTeatro>("todos");

  const filtrados = useMemo(() => {
    const q = filtro.trim().toLowerCase();
    return LUGARES_MUNDO.filter((l) => {
      if (bioma !== "todos" && l.bioma !== bioma) return false;
      if (!q) return true;
      return l.nombre.toLowerCase().includes(q) || l.region.toLowerCase().includes(q) || l.bioma.toLowerCase().includes(q);
    });
  }, [filtro, bioma]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-2.5" />
          <input
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            placeholder="Filtrar 32 estrechos, capitales o bastiones..."
            className="w-full pl-8 pr-3 py-1.5 rounded bg-black/60 border border-white/15 font-mono text-xs text-foreground"
          />
        </div>
        <select
          value={bioma}
          onChange={(e) => setBioma(e.target.value as "todos" | BiomaTeatro)}
          aria-label="Filtrar por bioma"
          className="px-2.5 py-1.5 rounded bg-black/70 border border-white/15 font-mono text-xs text-foreground"
        >
          <option value="todos">Todos los biomas ({LUGARES_MUNDO.length})</option>
          <option value="costa">Costa / Estrecho</option>
          <option value="urbano">Urbano</option>
          <option value="llanura">Llanura</option>
          <option value="montana">Montaña</option>
          <option value="desierto">Desierto</option>
          <option value="selva">Selva</option>
          <option value="artico">Ártico</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[420px] overflow-y-auto thin-scroll pr-1">
        {filtrados.map((l) => (
          <div
            key={l.id}
            className={cn(
              "hud-panel p-3 space-y-1.5",
              l.esVanguard ? "border-[#FFC94D]/60 bg-amber-hud/10" : "border-white/12"
            )}
          >
            <div className="flex items-center justify-between gap-2 font-mono text-xs font-bold">
              <span className={cn("truncate", l.esVanguard ? "text-amber" : "text-foreground")}>{l.nombre}</span>
              <span className="px-1.5 py-0.5 rounded bg-white/10 text-[9px] uppercase">{l.bioma}</span>
            </div>
            <div className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {l.lat.toFixed(2)}°, {l.lng.toFixed(2)}° · {l.region}
            </div>
            <div className="pt-1 flex gap-1.5 font-mono text-[10px]">
              <Link
                href={linkTeatroCoord(l.lat, l.lng, l.nombre)}
                className="px-2.5 py-1 rounded bg-[#FFC94D] text-black font-black flex items-center gap-1"
              >
                Abrir en 3D/2D <ArrowRight className="w-3 h-3" />
              </Link>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.origin + linkTeatroCoord(l.lat, l.lng, l.nombre));
                  toast.success(`Link 3D de ${l.nombre} copiado`);
                }}
                className="px-2 py-1 rounded border border-white/15 text-muted-foreground hover:text-foreground"
              >
                Copiar link
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── ENRUTADOR VISUAL DE LAS 10 FUNCIONES NUEVAS ─────────────────────────────
export function RenderFuncionExpansion({ id }: { id: FuncionExpansionId }) {
  switch (id) {
    case "comparador-fuerzas":
      return <FuncionComparadorFuerzas />;
    case "termometro-regiones":
      return <FuncionTermometroRegiones />;
    case "riesgo-viajero":
      return <FuncionRiesgoViajero />;
    case "impacto-suministros":
      return <FuncionImpactoSuministros />;
    case "radar-diplomatico":
      return <FuncionRadarDiplomatico />;
    case "verificador-osint":
      return <FuncionVerificadorOsint />;
    case "duelo-relampago":
      return <FuncionDueloRelampago />;
    case "vigia-planetario":
      return <FuncionVigíaPlanetario />;
    case "generador-briefing":
      return <FuncionGeneradorBriefing />;
    case "atlas-estrategico":
      return <FuncionAtlasEstrategico />;
  }
}

export function iconoDeFuncion(id: FuncionExpansionId) {
  switch (id) {
    case "comparador-fuerzas":
      return Scale;
    case "termometro-regiones":
      return Flame;
    case "riesgo-viajero":
      return Plane;
    case "impacto-suministros":
      return TrendingUp;
    case "radar-diplomatico":
      return ShieldAlert;
    case "verificador-osint":
      return CheckCircle2;
    case "duelo-relampago":
      return Swords;
    case "vigia-planetario":
      return Radio;
    case "generador-briefing":
      return Layers;
    case "atlas-estrategico":
      return Compass;
  }
}
