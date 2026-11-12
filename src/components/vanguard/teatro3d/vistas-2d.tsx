"use client";

// ============================================================================
// VISTAS 2D TÁCTICAS Y PLANOS TÉCNICOS (PARIDAD TOTAL 2D ↔ 3D)
// Cinco motores SVG interactivos sincronizados 1:1 con sus homólogos 3D:
//   1) MapaSimulador2D  (topografía real + unidades OTAN + arcos + clic)
//   2) MapaFrentes2D    (globo plano Natural Earth + zoom de teatro activo)
//   3) PlanoUniforme2D  (plano ortogonal de blindaje NIJ por capas)
//   4) PlanoEscuadron2D (diagrama táctico OTAN APP-6 de formación)
//   5) PlanoArma2D      (plano técnico CAD con cotas y despiece interactivo)
// ============================================================================

import { useMemo } from "react";
import type {
  Arma3D,
  CapaUniforme,
  Escuadron3D,
  FrenteVivo3D,
  ModoSensor,
  TeatroMundial,
  Uniforme3D,
} from "@/lib/teatro-total-data";
import {
  edificiosDeTeatro,
  elevacionEn,
  type SimEstado,
} from "@/lib/teatro-sim-engine";
import { WorldMapSVG } from "@/components/vanguard/world-map-svg";
import type { ConflictRegion } from "@/lib/game-data";

// ── 1) MAPA TOPOGRÁFICO 2D DEL SIMULADOR DE GUERRA ──────────────────────────
export function MapaSimulador2D({
  teatro,
  estado,
  sensor,
  onTerrenoClick,
  altura = 440,
}: {
  teatro: TeatroMundial;
  estado: SimEstado;
  sensor: ModoSensor;
  onTerrenoClick?: (nx: number, nz: number) => void;
  altura?: number;
}) {
  const cols = 30;
  const rows = 20;
  const W = 600;
  const H = 400;

  const celdas = useMemo(() => {
    const res: { x: number; y: number; w: number; h: number; fill: string }[] = [];
    const cw = W / cols;
    const ch = H / rows;
    for (let r = 0; r < rows; r++) {
      const nz = -1 + ((r + 0.5) / rows) * 2;
      for (let c = 0; c < cols; c++) {
        const nx = -1 + ((c + 0.5) / cols) * 2;
        const el = elevacionEn(nx, nz, teatro);
        let fill = "#16202e";
        if (sensor === "nocturno") {
          const g = Math.round(Math.max(18, Math.min(185, 42 + el * 85)));
          fill = el < 0 && teatro.agua ? "#072614" : `rgb(8, ${g}, 28)`;
        } else if (sensor === "termico") {
          fill = el < 0 && teatro.agua ? "#0a1448" : `rgb(${Math.round(35 + Math.abs(el) * 55)}, 28, ${Math.round(115 - el * 25)})`;
        } else if (el < 0 && teatro.agua) {
          fill = "#0c355c";
        } else if (teatro.bioma === "desierto") {
          const v = Math.round(130 + el * 52);
          fill = `rgb(${v}, ${Math.round(v * 0.78)}, ${Math.round(v * 0.48)})`;
        } else if (teatro.bioma === "artico") {
          const v = Math.round(165 + el * 65);
          fill = `rgb(${v - 15}, ${v}, 240)`;
        } else if (teatro.bioma === "selva") {
          fill = `rgb(20, ${Math.round(78 + el * 46)}, 34)`;
        } else {
          const v = Math.round(40 + el * 58);
          fill = `rgb(${v}, ${Math.round(v * 1.15)}, ${Math.round(v * 0.95)})`;
        }
        res.push({ x: c * cw, y: r * ch, w: cw + 0.6, h: ch + 0.6, fill });
      }
    }
    return res;
  }, [teatro, sensor]);

  const edificios = useMemo(() => edificiosDeTeatro(teatro), [teatro]);

  const toX = (nx: number) => ((nx + 1) / 2) * W;
  const toY = (nz: number) => ((nz + 1) / 2) * H;

  const frontPath = estado.frenteLinea
    .map((fx, i) => {
      const fz = -0.8 + (i / 8) * 1.6;
      return `${i === 0 ? "M" : "L"} ${toX(fx).toFixed(1)} ${toY(fz).toFixed(1)}`;
    })
    .join(" ");

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!onTerrenoClick) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const nz = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    onTerrenoClick(
      Math.max(-0.92, Math.min(0.92, nx)),
      Math.max(-0.88, Math.min(0.88, nz))
    );
  };

  return (
    <div
      className="w-full rounded-lg overflow-hidden border border-amber-hud/30 bg-[#050810] flex items-center justify-center"
      style={{ height: altura }}
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-full cursor-crosshair select-none"
        onClick={handleClick}
        aria-label={`Mapa táctico 2D de ${teatro.nombre}`}
      >
        {/* Mapa topográfico por celdas 1:1 */}
        {celdas.map((c, idx) => (
          <rect key={idx} x={c.x} y={c.y} width={c.w} height={c.h} fill={c.fill} />
        ))}

        {/* Rejilla UTM táctica */}
        {[1, 2, 3, 4, 5].map((i) => (
          <g key={i}>
            <line x1={(W / 6) * i} y1={0} x2={(W / 6) * i} y2={H} stroke="#ffc94d" strokeOpacity={0.14} strokeDasharray="3 4" />
            <line x1={0} y1={(H / 4) * (i % 4 || 4)} x2={W} y2={(H / 4) * (i % 4 || 4)} stroke="#38bdf8" strokeOpacity={0.14} strokeDasharray="3 4" />
          </g>
        ))}

        {/* Huellas urbanas / búnkeres */}
        {edificios.map((ed, i) => (
          <rect
            key={i}
            x={toX(ed.x) - ed.w * 4.5}
            y={toY(ed.z) - ed.d * 4.5}
            width={ed.w * 9}
            height={ed.d * 9}
            fill={ed.tipo === "torre" ? "#94a3b8" : "#475569"}
            fillOpacity={0.65}
            stroke="#0f172a"
            strokeWidth={0.8}
          />
        ))}

        {/* Cráteres */}
        {estado.crateres.map((cr, i) => (
          <circle
            key={i}
            cx={toX(cr.x)}
            cy={toY(cr.z)}
            r={Math.max(3, cr.radio * 240)}
            fill="#020617"
            fillOpacity={0.65}
            stroke="#f97316"
            strokeOpacity={0.35}
            strokeWidth={0.8}
          />
        ))}

        {/* Línea del frente dinámica */}
        <path
          d={frontPath}
          fill="none"
          stroke="#FFC94D"
          strokeWidth={2.5}
          strokeDasharray="8 4"
        />

        {/* Proyectiles y trayectorias */}
        {estado.proyectiles.map((pr) => {
          const px = pr.x0 + (pr.x1 - pr.x0) * pr.p;
          const pz = pr.z0 + (pr.z1 - pr.z0) * pr.p;
          const col = pr.bando === "A" ? "#FFC94D" : "#FF3B30";
          return (
            <g key={pr.id}>
              <line
                x1={toX(pr.x0)}
                y1={toY(pr.z0)}
                x2={toX(px)}
                y2={toY(pz)}
                stroke={col}
                strokeOpacity={0.45}
                strokeWidth={1.4}
                strokeDasharray="3 3"
              />
              <circle cx={toX(px)} cy={toY(pz)} r={pr.estilo === "trazadora" ? 2.2 : 4} fill={col} />
            </g>
          );
        })}

        {/* Explosiones */}
        {estado.explosiones.map((ex) => {
          const k = ex.edad / ex.maxEdad;
          return (
            <circle
              key={ex.id}
              cx={toX(ex.x)}
              cy={toY(ex.z)}
              r={(6 + k * 18) * ex.radio}
              fill={ex.color}
              fillOpacity={Math.max(0, 0.42 * (1 - k))}
              stroke="#FFC94D"
              strokeOpacity={Math.max(0, 0.85 * (1 - k))}
              strokeWidth={1.5}
            />
          );
        })}

        {/* Unidades tácticas estilo OTAN */}
        {estado.unidades.map((u) => {
          const ux = toX(u.x);
          const uy = toY(u.z);
          const col = u.bando === "A" ? "#38BDF8" : "#FF3B30";
          const edge = u.bando === "A" ? "#FFC94D" : "#FCA5A5";
          const hpW = 18 * Math.max(0.1, u.hp / u.maxHp);
          const cod =
            u.tipo === "tank"
              ? "MBT"
              : u.tipo === "artillery"
              ? "ART"
              : u.tipo === "sam"
              ? "SAM"
              : u.tipo === "drone"
              ? "UAV"
              : u.tipo === "jet"
              ? "AIR"
              : u.tipo === "ship"
              ? "NAV"
              : u.tipo === "ifv"
              ? "IFV"
              : "INF";
          return (
            <g key={u.id} transform={`translate(${ux}, ${uy})`}>
              <circle r={u.alcance * 140} fill="none" stroke={col} strokeOpacity={0.07} />
              {u.bando === "A" ? (
                <rect x={-10} y={-7} width={20} height={14} rx={2} fill="#091526" stroke={edge} strokeWidth={1.4} />
              ) : (
                <polygon points="0,-10 11,0 0,10 -11,0" fill="#260909" stroke={edge} strokeWidth={1.4} />
              )}
              <text x={0} y={2.5} textAnchor="middle" fontSize="6.5" fontFamily="monospace" fontWeight="bold" fill={edge}>
                {cod}
              </text>
              <rect x={-9} y={-12} width={18} height={2.2} fill="#0f172a" />
              <rect x={-9} y={-12} width={hpW} height={2.2} fill={u.bando === "A" ? "#3DDC97" : "#FF3B30"} />
            </g>
          );
        })}

        {/* Leyenda norte y escala */}
        <g transform="translate(12, 16)">
          <rect x={-4} y={-10} width={205} height={20} rx={3} fill="#050810" fillOpacity={0.82} stroke="#FFC94D" strokeOpacity={0.4} />
          <text x={4} y={3} fontSize="8.5" fontFamily="monospace" fill="#FFC94D">
            2D TOPOGRÁFICO · {teatro.bioma.toUpperCase()} · {teatro.lat.toFixed(1)}°, {teatro.lng.toFixed(1)}°
          </text>
        </g>
      </svg>
    </div>
  );
}

// ── 2) MAPA 2D DE FRENTES ACTIVOS EN VIVO ───────────────────────────────────
export function MapaFrentes2D({
  frentes,
  activo,
  onSelectFrente,
  altura = 380,
}: {
  frentes: FrenteVivo3D[];
  activo: FrenteVivo3D;
  onSelectFrente: (id: string) => void;
  altura?: number;
}) {
  const conflicts: ConflictRegion[] = useMemo(
    () =>
      frentes.map((f) => ({
        id: f.id,
        name: f.nombre,
        country: f.bandoANombre,
        flag: f.keywords[0]?.toUpperCase().slice(0, 2) || "UN",
        lat: f.lat,
        lng: f.lng,
        level: f.intensidad >= 85 ? "CRITICO" : f.intensidad >= 65 ? "TENSION" : "INESTABILIDAD",
        intensity: f.intensidad,
        summary: f.subtitulo,
        factions: [f.bandoANombre, f.bandoBNombre],
        since: f.desde,
        casualties: f.bajas,
        civilianImpact: f.desplazados,
        humanitarian: f.riesgoGlobal,
        tags: f.keywords,
      })),
    [frentes]
  );

  // Proyección local del teatro seleccionado (ciudades + líneas de frente reales)
  const TW = 260;
  const TH = 150;
  const minLat = activo.bbox.minLat;
  const maxLat = Math.max(minLat + 0.4, activo.bbox.maxLat);
  const minLng = activo.bbox.minLng;
  const maxLng = Math.max(minLng + 0.4, activo.bbox.maxLng);

  const px = (lng: number) => 16 + ((lng - minLng) / (maxLng - minLng)) * (TW - 32);
  const py = (lat: number) => TH - 16 - ((lat - minLat) / (maxLat - minLat)) * (TH - 32);

  return (
    <div
      className="w-full rounded-lg overflow-hidden border border-red-hud/30 bg-[#050810] flex flex-col justify-between p-2 gap-2"
      style={{ minHeight: altura }}
    >
      <div className="flex-1 min-h-[205px]">
        <WorldMapSVG
          conflicts={conflicts}
          selected={activo.id}
          onSelectConflict={onSelectFrente}
          showFronts
          showSat={false}
          showGrid
          className="h-full"
        />
      </div>

      {/* Sub-carta 2D de líneas del frente y ciudades del teatro */}
      <div className="rounded border border-white/10 bg-black/50 p-2 flex flex-col sm:flex-row gap-3 items-center">
        <svg viewBox={`0 0 ${TW} ${TH}`} className="w-full sm:w-[240px] h-[125px] shrink-0 rounded border border-red-hud/25 bg-[#070b14]">
          <rect x={0} y={0} width={TW} height={TH} fill="#070b14" />
          <line x1={0} y1={TH / 2} x2={TW} y2={TH / 2} stroke="#38bdf8" strokeOpacity={0.14} />
          <line x1={TW / 2} y1={0} x2={TW / 2} y2={TH} stroke="#38bdf8" strokeOpacity={0.14} />
          {activo.frentes.map((fl, i) => {
            const d = fl.puntos
              .map(([la, ln], idx) => `${idx === 0 ? "M" : "L"} ${px(ln).toFixed(1)} ${py(la).toFixed(1)}`)
              .join(" ");
            return <path key={i} d={d} fill="none" stroke="#FF3B30" strokeWidth={2.2} strokeDasharray="5 3" />;
          })}
          {activo.ciudades.slice(0, 7).map((c, idx) => {
            const cx = Math.max(12, Math.min(TW - 12, px(c.lng)));
            const cy = Math.max(12, Math.min(TH - 12, py(c.lat)));
            const col =
              c.estado === "frente" || c.estado === "sitio"
                ? "#FF3B30"
                : c.estado === "ocupada"
                ? "#F97316"
                : c.estado === "contendida"
                ? "#FFC94D"
                : "#38BDF8";
            return (
              <g key={idx} transform={`translate(${cx}, ${cy})`}>
                <circle r={3.5} fill={col} stroke="#050810" strokeWidth={1} />
                <text x={5} y={3} fontSize="7.2" fontFamily="monospace" fill="#e2e8f0">
                  {c.nombre}
                </text>
              </g>
            );
          })}
        </svg>
        <div className="flex-1 text-[11px] font-mono space-y-1">
          <div className="text-amber font-bold uppercase">
            CARTA 2D DE FRENTE · {activo.nombre}
          </div>
          <div className="text-muted-foreground">
            Líneas rojas discontinuas = trazado OSINT aproximado · Puntos rojos = ciudades bajo fuego o sitio · Puntos azules = capital / retaguardia.
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {activo.ciudades.slice(0, 5).map((c) => (
              <span key={c.nombre} className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9.5px]">
                {c.nombre} · <b className="text-amber">{c.estado.toUpperCase()}</b>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 3) PLANO ORTOGONAL 2D DE UNIFORME Y CAPAS BALÍSTICAS ────────────────────
export function PlanoUniforme2D({
  uniforme,
  capaActiva,
  onSelectCapa,
  altura = 380,
}: {
  uniforme: Uniforme3D;
  capaActiva: CapaUniforme["id"];
  onSelectCapa: (id: CapaUniforme["id"]) => void;
  altura?: number;
}) {
  const ac = uniforme.colores.acento;
  const capaColor = (id: CapaUniforme["id"], def: string) =>
    capaActiva === id ? ac : def;

  return (
    <div
      className="w-full rounded-lg overflow-hidden border border-amber-hud/30 bg-[#060913] flex items-center justify-center p-2"
      style={{ height: altura }}
    >
      <svg viewBox="0 0 520 360" className="w-full h-full select-none" aria-label={`Esquema 2D del uniforme ${uniforme.nombre}`}>
        {/* Fondo plano técnico */}
        <defs>
          <pattern id="gridU2d" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#38bdf8" strokeOpacity="0.1" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="520" height="360" fill="url(#gridU2d)" />

        <text x="16" y="24" fontSize="10" fontFamily="monospace" fill={ac} fontWeight="bold">
          ESQUEMA 2D BLINDAJE · {uniforme.nombre.toUpperCase()}
        </text>
        <text x="16" y="38" fontSize="8.5" fontFamily="monospace" fill="#94a3b8">
          PESO TOTAL: {uniforme.pesoTotalKg} KG · ATENUACIÓN IR: {uniforme.sigiloIR}% · TOCA CUALQUIER ZONA
        </text>

        {/* Silueta frontal del operador */}
        <g transform="translate(106, 58)">
          {/* Casco */}
          <g className="cursor-pointer" onClick={() => onSelectCapa("casco")}>
            <path d="M 38,34 C 38,10 82,10 82,34 Z" fill={uniforme.colores.casco} stroke={capaColor("casco", "#64748b")} strokeWidth={capaActiva === "casco" ? 2.5 : 1.2} />
            <rect x="44" y="28" width="32" height="10" rx="2" fill={uniforme.colores.visor} opacity={0.9} />
            <circle cx="60" cy="46" r="14" fill={uniforme.colores.piel} opacity={0.9} />
          </g>

          {/* Uniforme base */}
          <g className="cursor-pointer" onClick={() => onSelectCapa("uniforme")}>
            <rect x="30" y="64" width="60" height="82" rx="6" fill={uniforme.colores.primario} stroke={capaColor("uniforme", "#64748b")} strokeWidth={capaActiva === "uniforme" ? 2.5 : 1.2} />
            <rect x="10" y="68" width="18" height="72" rx="5" fill={uniforme.colores.secundario} stroke={capaColor("uniforme", "#64748b")} strokeWidth={1.2} />
            <rect x="92" y="68" width="18" height="72" rx="5" fill={uniforme.colores.secundario} stroke={capaColor("uniforme", "#64748b")} strokeWidth={1.2} />
            <rect x="33" y="150" width="24" height="84" rx="4" fill={uniforme.colores.primario} stroke={capaColor("uniforme", "#64748b")} strokeWidth={1.2} />
            <rect x="63" y="150" width="24" height="84" rx="4" fill={uniforme.colores.primario} stroke={capaColor("uniforme", "#64748b")} strokeWidth={1.2} />
          </g>

          {/* Chaleco balístico */}
          <g className="cursor-pointer" onClick={() => onSelectCapa("chaleco")}>
            <rect x="34" y="68" width="52" height="62" rx="4" fill={uniforme.colores.chaleco} stroke={capaColor("chaleco", "#94a3b8")} strokeWidth={capaActiva === "chaleco" ? 2.5 : 1.4} />
            <rect x="42" y="78" width="36" height="32" rx="2" fill="none" stroke={ac} strokeDasharray="3 2" strokeWidth={1.2} />
          </g>

          {/* Mochila lateral esquemática */}
          <g className="cursor-pointer" onClick={() => onSelectCapa("mochila")}>
            <rect x="-26" y="72" width="28" height="54" rx="4" fill={uniforme.colores.chaleco} stroke={capaColor("mochila", "#64748b")} strokeWidth={capaActiva === "mochila" ? 2.5 : 1.2} />
            <line x1="-18" y1="72" x2="-18" y2="42" stroke={ac} strokeWidth={2} />
          </g>

          {/* Cinturón modular */}
          <g className="cursor-pointer" onClick={() => onSelectCapa("cinturon")}>
            <rect x="29" y="138" width="62" height="12" rx="2" fill="#111827" stroke={capaColor("cinturon", "#94a3b8")} strokeWidth={capaActiva === "cinturon" ? 2.5 : 1.2} />
          </g>

          {/* Botas */}
          <g className="cursor-pointer" onClick={() => onSelectCapa("botas")}>
            <rect x="32" y="236" width="26" height="26" rx="3" fill="#0f172a" stroke={capaColor("botas", "#94a3b8")} strokeWidth={capaActiva === "botas" ? 2.5 : 1.2} />
            <rect x="62" y="236" width="26" height="26" rx="3" fill="#0f172a" stroke={capaColor("botas", "#94a3b8")} strokeWidth={capaActiva === "botas" ? 2.5 : 1.2} />
          </g>
        </g>

        {/* Callouts laterales */}
        {uniforme.capas.map((c, i) => {
          const y = 74 + i * 44;
          const esSel = c.id === capaActiva;
          return (
            <g key={c.id} className="cursor-pointer" onClick={() => onSelectCapa(c.id)}>
              <rect
                x={266}
                y={y}
                width={240}
                height={36}
                rx={4}
                fill={esSel ? `${ac}22` : "#0b1120"}
                stroke={esSel ? ac : "#334155"}
                strokeWidth={esSel ? 1.8 : 1}
              />
              <text x={275} y={y + 14} fontSize="8.6" fontFamily="monospace" fontWeight="bold" fill={esSel ? ac : "#e2e8f0"}>
                {c.nombre.length > 31 ? `${c.nombre.slice(0, 30)}…` : c.nombre}
              </text>
              <text x={275} y={y + 27} fontSize="7.6" fontFamily="monospace" fill="#94a3b8">
                {`${c.proteccion.length > 26 ? `${c.proteccion.slice(0, 25)}…` : c.proteccion} · ${c.pesoKg}kg`}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── 4) DIAGRAMA TÁCTICO 2D DE FORMACIÓN DE ESCUADRÓN (OTAN APP-6) ───────────
export function PlanoEscuadron2D({
  escuadron,
  miembroActivoId,
  onSelectMiembro,
  altura = 380,
}: {
  escuadron: Escuadron3D;
  miembroActivoId: string;
  onSelectMiembro: (id: string) => void;
  altura?: number;
}) {
  const ac = escuadron.esVanguard ? "#FFC94D" : "#38BDF8";
  const cx = 260;
  const cy = 190;
  const scale = 42;

  return (
    <div
      className="w-full rounded-lg overflow-hidden border border-cyan-hud/30 bg-[#050812] flex items-center justify-center p-2"
      style={{ height: altura }}
    >
      <svg viewBox="0 0 520 360" className="w-full h-full select-none" aria-label={`Plano táctico 2D de ${escuadron.nombre}`}>
        <rect width="520" height="360" fill="#050812" />
        {/* Anillos de alcance y arco de fuego frontal */}
        <path
          d={`M ${cx} ${cy} L ${cx - 170} ${cy - 170} A 240 240 0 0 1 ${cx + 170} ${cy - 170} Z`}
          fill={ac}
          fillOpacity={0.07}
          stroke={ac}
          strokeOpacity={0.25}
          strokeDasharray="4 4"
        />
        {[65, 130].map((r) => (
          <circle key={r} cx={cx} cy={cy} r={r} fill="none" stroke="#38bdf8" strokeOpacity={0.16} strokeDasharray="3 3" />
        ))}

        {/* Líneas de enlace táctico entre el líder (0) y demás miembros */}
        {escuadron.miembros.slice(1).map((m) => {
          const lider = escuadron.miembros[0];
          return (
            <line
              key={m.id}
              x1={cx + lider.offset[0] * scale}
              y1={cy + lider.offset[1] * scale}
              x2={cx + m.offset[0] * scale}
              y2={cy + m.offset[1] * scale}
              stroke={ac}
              strokeOpacity={0.24}
              strokeWidth={1.2}
            />
          );
        })}

        {/* Miembros con símbolo OTAN */}
        {escuadron.miembros.map((m) => {
          const x = cx + m.offset[0] * scale;
          const y = cy + m.offset[1] * scale;
          const esSel = m.id === miembroActivoId;
          return (
            <g key={m.id} transform={`translate(${x}, ${y})`} className="cursor-pointer" onClick={() => onSelectMiembro(m.id)}>
              {esSel && <circle r={24} fill="none" stroke="#FFC94D" strokeWidth={2} strokeDasharray="3 2" />}
              <rect
                x={-16}
                y={-11}
                width={32}
                height={22}
                rx={3}
                fill={esSel ? `${ac}33` : "#0c1424"}
                stroke={esSel ? "#FFC94D" : ac}
                strokeWidth={esSel ? 2.2 : 1.4}
              />
              <text x={0} y={3} textAnchor="middle" fontSize="8" fontFamily="monospace" fontWeight="bold" fill="#f8fafc">
                {m.tipo.slice(0, 4).toUpperCase()}
              </text>
              <rect x={-48} y={13} width={96} height={12} rx={2} fill="#050812" fillOpacity={0.84} />
              <text x={0} y={22} textAnchor="middle" fontSize="7.2" fontFamily="monospace" fill={esSel ? "#FFC94D" : "#94a3b8"}>
                {m.rol.length > 18 ? `${m.rol.slice(0, 17)}…` : m.rol}
              </text>
            </g>
          );
        })}

        <text x="16" y="24" fontSize="10" fontFamily="monospace" fill={ac} fontWeight="bold">
          FORMACIÓN 2D OTAN · {escuadron.simboloOTAN} · ALCANCE {escuadron.alcanceKm} KM
        </text>
        <text x="16" y="346" fontSize="8.5" fontFamily="monospace" fill="#94a3b8">
          FRENTE DE AVANCE ↑ · ENLACES DE MANDO MESH · CLIC EN CUALQUIER UNIDAD
        </text>
      </svg>
    </div>
  );
}

// ── 5) PLANO TÉCNICO CAD 2D DE ARMA CON DESPIECE INTERACTIVO ─────────────────
export function PlanoArma2D({
  arma,
  piezaActivaId,
  despiece,
  onSelectPieza,
  altura = 380,
}: {
  arma: Arma3D;
  piezaActivaId: string;
  despiece: number;
  onSelectPieza: (id: string) => void;
  altura?: number;
}) {
  const ac = arma.esVanguard ? "#FFC94D" : "#38BDF8";
  const k = despiece * 24;
  const strokeDe = (idx: number, def = "#94a3b8") =>
    arma.piezas[idx]?.id === piezaActivaId ? ac : def;

  return (
    <div
      className="w-full rounded-lg overflow-hidden border border-amber-hud/30 bg-[#060914] flex items-center justify-center p-2"
      style={{ height: altura }}
    >
      <svg viewBox="0 0 560 360" className="w-full h-full select-none" aria-label={`Plano CAD 2D de ${arma.nombre}`}>
        <defs>
          <pattern id="gridW2d" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#38bdf8" strokeOpacity="0.1" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="560" height="360" fill="url(#gridW2d)" />

        <text x="18" y="24" fontSize="10" fontFamily="monospace" fill={ac} fontWeight="bold">
          PLANO CAD 2D · {arma.nombre.toUpperCase()}
        </text>
        <text x="18" y="38" fontSize="8.5" fontFamily="monospace" fill="#94a3b8">
          CALIBRE: {arma.specs.calibre} · ALCANCE: {arma.specs.alcance} · DESPIECE: {Math.round(despiece * 100)}%
        </text>

        {/* Dibujo esquemático CAD adaptado al tipo de arma + separación por despiece */}
        <g transform="translate(275, 168)">
          {/* Pieza 0: Cañón / Tubo / Rotores */}
          <g
            transform={`translate(${k * 1.4}, ${-k * 0.2})`}
            className="cursor-pointer"
            onClick={() => arma.piezas[0] && onSelectPieza(arma.piezas[0].id)}
          >
            <rect x="45" y="-12" width="135" height="16" rx="2" fill="#1e293b" stroke={strokeDe(0)} strokeWidth={2} />
            <rect x="172" y="-15" width="34" height="22" rx="2" fill="#0f172a" stroke={strokeDe(0, ac)} strokeWidth={1.8} />
          </g>

          {/* Pieza 1: Receptor / Chasis central */}
          <g
            transform={`translate(0, ${-k * 0.35})`}
            className="cursor-pointer"
            onClick={() => arma.piezas[1] && onSelectPieza(arma.piezas[1].id)}
          >
            <rect x="-65" y="-20" width="120" height="40" rx="4" fill="#111827" stroke={strokeDe(1)} strokeWidth={2} />
            <line x1="-58" y1="-20" x2="50" y2="-20" stroke={ac} strokeDasharray="4 2" strokeWidth={1.5} />
          </g>

          {/* Pieza 2: Óptica / Sensor superior */}
          <g
            transform={`translate(0, ${-k * 1.45})`}
            className="cursor-pointer"
            onClick={() => arma.piezas[2] && onSelectPieza(arma.piezas[2].id)}
          >
            <rect x="-32" y="-50" width="66" height="22" rx="4" fill="#0c192c" stroke={strokeDe(2, "#38BDF8")} strokeWidth={2} />
            <circle cx="28" cy="-39" r="7" fill="#38BDF8" fillOpacity={0.5} />
          </g>

          {/* Pieza 3: Cargador / Ojiva */}
          <g
            transform={`translate(${k * 0.15}, ${k * 1.3})`}
            className="cursor-pointer"
            onClick={() => arma.piezas[3] && onSelectPieza(arma.piezas[3].id)}
          >
            <polygon points="-8,20 18,20 26,74 -2,74" fill="#1e293b" stroke={strokeDe(3, "#f97316")} strokeWidth={2} />
          </g>

          {/* Pieza 4: Culata / Propulsión trasera */}
          <g
            transform={`translate(${-k * 1.4}, 0)`}
            className="cursor-pointer"
            onClick={() => arma.piezas[4] && onSelectPieza(arma.piezas[4].id)}
          >
            <polygon points="-65,-16 -175,-12 -180,26 -65,16" fill="#172030" stroke={strokeDe(4)} strokeWidth={2} />
          </g>

          {/* Línea de cota inferior */}
          <line x1="-180" y1="98" x2="205" y2="98" stroke="#64748b" strokeWidth={1} strokeDasharray="3 3" />
          <text x="12" y="112" textAnchor="middle" fontSize="8.5" fontFamily="monospace" fill="#94a3b8">
            PESO: {arma.specs.peso} · VELOCIDAD: {arma.specs.velocidad}
          </text>
        </g>

        {/* Chips de piezas abajo */}
        {arma.piezas.map((p, idx) => {
          const w = 100;
          const x = 18 + idx * 106;
          const esSel = p.id === piezaActivaId;
          return (
            <g key={p.id} className="cursor-pointer" onClick={() => onSelectPieza(p.id)}>
              <rect
                x={x}
                y={308}
                width={w}
                height={36}
                rx={4}
                fill={esSel ? `${ac}26` : "#0b1120"}
                stroke={esSel ? ac : "#334155"}
                strokeWidth={esSel ? 1.8 : 1}
              />
              <text x={x + w / 2} y={329} textAnchor="middle" fontSize="7.2" fontFamily="monospace" fontWeight="bold" fill={esSel ? ac : "#cbd5e1"}>
                {p.nombre.length > 16 ? `${p.nombre.slice(0, 15)}…` : p.nombre}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
