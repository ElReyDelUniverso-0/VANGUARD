"use client";

// v108.0 LA CIUDAD VIVA — la franja de cromo gana CUSTOMIZACIÓN PROFUNDA.
// Mandato: "que uno pueda personalizar aún más las pestañas, detalles nuevos
// e innovaciones" + "haz un modo pantalla completa".
// NUEVO sobre v107 (arrastre + grupos con color):
//  ① FIJAR PESTAÑA (pin): zona fija a la izquierda, solo icono, × oculto.
//  ② RENOMBRAR PESTAÑA (alias): nombre propio que vive en tu navegador.
//  ③ DUPLICAR PESTAÑA como el navegador de verdad.
//  ④ VISTA PREVIA AL PASAR EL RATÓN: mini-portada real de la sala (CSS).
//  ⑤ CTRL+TAB y CTRL+RUEDA ciclan entre pestañas abiertas.
//  ⑥ BOTÓN DE PANTALLA COMPLETA / INMERSIÓN (con la tecla F en page.tsx).
// Rendimiento: mismo contrato 60 FPS — solo transform/opacity; reduced-motion
// apaga todo.

import { motion, AnimatePresence, Reorder, useDragControls } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Plus,
  Search,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Pin,
  PinOff,
  Copy,
  Maximize2,
  Type,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  TABS,
  sectionOfTab,
  accentOfSection,
  TOTAL_TABS,
  type TabKey,
} from "@/components/vanguard/tab-nav";
import { tabLabel, TAB_SHORTS, useT } from "@/lib/i18n";
import { useGameStore } from "@/lib/game-store";
import { VitrinaSala } from "@/components/vanguard/portadas";

// Límite honesto de pestañas abiertas (herencia v106): al llegar a 9 avisamos.
export const MAX_PESTANAS = 9;

// v107.0: la paleta de los grupos de cromo — 8 colores vivos, cero azul genérico
export const COLORES_GRUPO = [
  "#FF4D4D", // carmesí
  "#FFC94D", // ámbar
  "#4ADE80", // verde
  "#5EEAD4", // turquesa
  "#A78BFA", // violeta
  "#F472B6", // rosa
  "#FB923C", // naranja
  "#67E8F9", // cian
];

const LS_GRUPOS = "vg-cromo-grupos-v107";
const LS_GRUPO_DE = "vg-cromo-grupo-de-v107";
// v108: fijadas + alias — la customización profunda vive en tu navegador
const LS_FIJADAS = "vg-cromo-fijadas-v108";
const LS_ALIAS = "vg-cromo-alias-v108";

export type GrupoCromo = { id: string; nombre: string; color: string; colapsada: boolean };

// v108: estado de la vista previa al pasar el ratón (portal, solo ratón)
type Previa108 = { k: TabKey; left: number; top: number; abajo: boolean } | null;

// ---------- MENÚ DE PESTAÑA / GRUPO (portal: la franja tiene backdrop-blur,
// que crearía un containing block y rompería el position:fixed) ----------
function ItemMenu({
  onClick,
  children,
  peligro,
}: {
  onClick: () => void;
  children: React.ReactNode;
  peligro?: boolean;
}) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      className={cn(
        "w-full text-left px-3 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-2 nexus-letra-suave",
        peligro ? "text-red-400 hover:bg-red-500/15" : "text-soft/90 hover:bg-amber-hud/20 hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

function SepMenu() {
  return <div className="my-1 h-px bg-white/8" aria-hidden />;
}

function FilaColores({ onPick }: { onPick: (c: string) => void }) {
  const { t } = useT();
  return (
    <div className="px-3 py-2">
      <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/80 mb-1.5">
        {t("grupo.colorTitulo")}
      </div>
      <div className="flex items-center gap-1.5 flex-wrap">
        {COLORES_GRUPO.map((c, i) => (
          <button
            key={c}
            role="menuitem"
            aria-label={t(`grupo.c${i}`)}
            title={t(`grupo.c${i}`)}
            onClick={() => onPick(c)}
            className="w-6 h-6 rounded-full border border-white/20 transition-transform hover:scale-110 active:scale-95"
            style={{ background: `${c}D9`, boxShadow: `0 0 12px ${c}66` }}
          />
        ))}
      </div>
    </div>
  );
}

// ---------- UNA PESTAÑA (Reorder.Item con controles de arrastre propios) ----------
function PestanaItem({
  k,
  esActiva,
  chip,
  grupoColor,
  fijada,
  alias,
  onElegir,
  onCerrar,
  onMenu,
  onAgarre,
  onSoltar,
  onPrevisualizar,
  onSalirPrevia,
}: {
  k: TabKey;
  esActiva: boolean;
  chip?: React.ReactNode;
  grupoColor?: string;
  fijada?: boolean;
  alias?: string;
  onElegir: (k: TabKey) => void;
  onCerrar: (k: TabKey) => void;
  onMenu: (k: TabKey, x: number, y: number) => void;
  onAgarre: () => void;
  onSoltar: (k: TabKey) => void;
  onPrevisualizar?: (k: TabKey, el: HTMLElement) => void;
  onSalirPrevia?: () => void;
}) {
  const { t, lang } = useT();
  const def = TABS[k];
  const acc = accentOfSection(sectionOfTab(k).key);
  const controls = useDragControls();
  const itemRef = useRef<HTMLDivElement>(null);
  const holdRef = useRef<number | null>(null);
  const inicioRef = useRef<{ x: number; y: number } | null>(null);
  const levantaRef = useRef(false);
  const [levanta, setLevanta] = useState(false);
  // v108: vista previa al pasar el ratón (solo ratón real: los táctiles son
  // "pointer: coarse" — en ratón/desktop/lápiz fino la preview es bienvenida)
  const hoverRef = useRef<number | null>(null);
  const puedeHoverRef = useRef(false);
  useEffect(() => {
    puedeHoverRef.current = !(window.matchMedia?.("(pointer: coarse)").matches ?? false);
  }, []);
  const clearHover = () => {
    if (hoverRef.current !== null) {
      clearTimeout(hoverRef.current);
      hoverRef.current = null;
    }
  };
  useEffect(() => clearHover, []);

  // táctil: mientras la pestaña esté levantada, el dedo NO hace scroll nativo
  // (listener no pasivo montado una vez, decide con ref viva)
  useEffect(() => {
    const el = itemRef.current;
    if (!el) return;
    const bloquear = (ev: TouchEvent) => {
      if (levantaRef.current) ev.preventDefault();
    };
    el.addEventListener("touchmove", bloquear, { passive: false });
    return () => el.removeEventListener("touchmove", bloquear);
  }, []);

  const soltarAgarre = () => {
    if (holdRef.current !== null) {
      clearTimeout(holdRef.current);
      holdRef.current = null;
    }
  };

  const bajar = () => {
    levantaRef.current = false;
    setLevanta(false);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return; // clic derecho = menú
    inicioRef.current = { x: e.clientX, y: e.clientY };
    if (e.pointerType === "mouse") {
      controls.start(e);
    } else {
      // táctil/lápiz: pulsación larga 0.45s levanta la pestaña para arrastrar;
      // un deslizamiento antes de ese umbral era scroll del dedo y se respeta
      soltarAgarre();
      holdRef.current = window.setTimeout(() => {
        levantaRef.current = true;
        setLevanta(true);
        try {
          navigator.vibrate?.(12);
        } catch {}
        controls.start(e);
      }, 450);
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (holdRef.current !== null && inicioRef.current) {
      const d = Math.hypot(e.clientX - inicioRef.current.x, e.clientY - inicioRef.current.y);
      if (d > 10) soltarAgarre(); // era scroll, no arrastre
    }
  };

  const distancia = (e: React.MouseEvent) =>
    inicioRef.current ? Math.hypot(e.clientX - inicioRef.current.x, e.clientY - inicioRef.current.y) : 0;

  const onClick = (e: React.MouseEvent) => {
    // un arrastre NUNCA activa la pestaña (como el navegador de verdad)
    if (distancia(e) > 8) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    clearHover();
    onSalirPrevia?.();
    onElegir(k);
  };

  const etiqueta = (def ? tabLabel(lang, k, def.label) : k).split(" (")[0];
  const titulo = alias || etiqueta;

  return (
    <Reorder.Item
      ref={itemRef}
      value={k}
      as="div"
      dragListener={false}
      dragControls={controls}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={() => {
        soltarAgarre();
        bajar();
      }}
      onPointerCancel={() => {
        soltarAgarre();
        bajar();
      }}
      onDragStart={onAgarre}
      onDragEnd={() => onSoltar(k)}
      onClick={onClick}
      onContextMenu={(e) => {
        e.preventDefault();
        clearHover();
        onSalirPrevia?.();
        onMenu(k, e.clientX, e.clientY);
      }}
      onMouseEnter={() => {
        if (!puedeHoverRef.current) return;
        clearHover();
        hoverRef.current = window.setTimeout(() => {
          hoverRef.current = null;
          if (itemRef.current) onPrevisualizar?.(k, itemRef.current);
        }, 420);
      }}
      onMouseLeave={() => {
        clearHover();
        onSalirPrevia?.();
      }}
      initial={{ opacity: 0, scale: 0.88, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.88, y: 6 }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      className={cn("relative shrink-0 list-none", levanta && "v107-levanta")}
      style={{ touchAction: "pan-x" }}
      data-pestana={k}
    >
      <div className="flex items-end gap-0.5">
        {chip}
        <div className="relative">
          {/* píldora activa que VIAJA entre pestañas (transform puro, herencia v106) */}
          {esActiva && (
            <motion.div
              layoutId="v106-tab-activa"
              className="absolute inset-x-0 -top-0.5 -bottom-px rounded-t-[10px]"
              style={{
                backgroundColor: "rgba(10,10,15,0.98)",
                boxShadow: `inset 0 1px 0 ${acc}44, 0 -6px 18px -10px ${acc}66`,
                border: `1px solid ${acc}40`,
                borderBottom: "none",
              }}
              transition={{ type: "spring", stiffness: 420, damping: 34 }}
            />
          )}
          <button
            title={fijada ? `${t("m108.fijada")}: ${titulo}` : t("grupo.arrastre")}
            aria-current={esActiva ? "page" : undefined}
            className={cn(
              "nexus-tab-host group relative z-10 flex items-center gap-1.5 h-8 pl-2.5 rounded-t-[10px] font-mono text-[9px] sm:text-[10px] font-bold uppercase tracking-wide whitespace-nowrap transition-colors max-w-[168px] sm:max-w-[190px]",
              fijada && "pl-0 pr-0 w-9 justify-center max-w-none",
              esActiva
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-white/[0.045]"
            )}
            style={esActiva ? { color: acc } : undefined}
          >
            {/* favicon del mundo: punto del color de la sección */}
            <span
              className={cn("w-2 h-2 rounded-full shrink-0", esActiva && "vg-acc-dot")}
              style={{ backgroundColor: fijada ? (grupoColor ?? acc) : acc, boxShadow: esActiva ? `0 0 8px ${fijada ? (grupoColor ?? acc) : acc}` : `${acc}55` }}
            />
            {!fijada && (
              /* v136 PROFUNDIDAD TOTAL: la letra de la pestaña sale de la pantalla */
              <span className="truncate">
                <span className="sm:hidden nexus-tab nexus-letra-suave">{TAB_SHORTS[lang]?.[k] ?? def?.short ?? ""}</span>
                <span className="hidden sm:inline truncate nexus-tab nexus-letra-suave">{titulo}</span>
              </span>
            )}
            {/* ⋮ abre el menú de la pestaña (grupos, cerrar las demás, reabrir) */}
            <span
              role="button"
              tabIndex={0}
              aria-label={t("grupo.menu")}
              data-menu107={k}
              onClick={(e) => {
                e.stopPropagation();
                const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
                onMenu(k, r.left, r.bottom + 6);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
                  onMenu(k, r.left, r.bottom + 6);
                }
              }}
              className={cn(
                "ml-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-colors",
                esActiva
                  ? "opacity-100 hover:bg-white/15 text-muted-foreground hover:text-foreground"
                  : "opacity-0 group-hover:opacity-100 hover:bg-white/10 focus:opacity-100"
              )}
            >
              <MoreVertical className="w-2.5 h-2.5" />
            </span>
            {/* la × cierra la pestaña — en las FIJADAS se esconde (como Chrome):
                se cierra desde el menú ⋮ */}
            {!fijada && (
              <span
                role="button"
                tabIndex={0}
                aria-label={`${t("cromo.cerrar")}: ${titulo}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onCerrar(k);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                    onCerrar(k);
                  }
                }}
                className={cn(
                  "ml-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-colors",
                  esActiva
                    ? "hover:bg-white/15 text-muted-foreground hover:text-foreground"
                    : "opacity-0 group-hover:opacity-100 hover:bg-white/10 focus:opacity-100"
                )}
              >
                <X className="w-2.5 h-2.5" />
              </span>
            )}
            {/* subrayado del acento bajo la pestaña activa */}
            {esActiva && (
              <span
                className="absolute left-2 right-2 -bottom-px h-[2px] rounded-full"
                style={{ backgroundColor: acc, boxShadow: `0 0 10px ${acc}` }}
                aria-hidden
              />
            )}
          </button>
        </div>
      </div>
      {/* línea superior del color del grupo: la pestaña se sabe MIEMBRA */}
      {grupoColor && (
        <span
          className="absolute left-1.5 right-1.5 top-0 h-[2px] rounded-full pointer-events-none"
          style={{ background: grupoColor, boxShadow: `0 0 8px ${grupoColor}` }}
          aria-hidden
        />
      )}
    </Reorder.Item>
  );
}

// ---------- EL CHIP DE GRUPO (clic contrae, doble clic renombra, derecho: menú) ----------
// v112.0 SOLSTICIO — el chip CONTRAÍDO es arrastrable: mueves el GRUPO COMPLETO
// (chip + sus pestañas ocultas) como en el navegador de verdad. Ratón: agarra y
// mueve al instante · táctil: pulsación larga 450 ms levanta el chip (misma
// pauta de las pestañas v107) · un arrastre NUNCA contrae el grupo.
// Umbral (px) de arrastre del chip EXPANDIDO: cada cruce desplaza el bloque
// del grupo una pestaña — como empujar el grupo con la mano en Chrome.
const UMBRAL_BLOQUE = 56;

function ChipGrupo({
  grupo,
  miembros,
  enRenombre,
  nombreTmp,
  setNombreTmp,
  onToggle,
  onRenombrarInicio,
  onRenombrarFin,
  onCancelarRenombre,
  onMenu,
  arrastre,
  onAgarreChip,
  onSoltarChip,
  onMoverBloque,
}: {
  grupo: GrupoCromo;
  miembros: number;
  enRenombre: boolean;
  nombreTmp: string;
  setNombreTmp: (s: string) => void;
  onToggle: () => void;
  onRenombrarInicio: () => void;
  onRenombrarFin: () => void;
  onCancelarRenombre: () => void;
  onMenu: (gid: string, x: number, y: number) => void;
  arrastre?: boolean;
  onAgarreChip?: () => void;
  onSoltarChip?: (gid: string) => void;
  /** v114: chip de grupo EXPANDIDO — desplaza el BLOQUE visible (dir ±1 pestaña) */
  onMoverBloque?: (gid: string, dir: 1 | -1) => void;
}) {
  const { t } = useT();
  // v112: controles de arrastre + pulsación larga táctil (herencia v107)
  const controls = useDragControls();
  const inicioRef = useRef<{ x: number; y: number } | null>(null);
  const holdRef = useRef<number | null>(null);
  const levantaRef = useRef(false);
  const [levanta, setLevanta] = useState(false);
  // v114: arrastre del chip EXPANDIDO (estado del gesto del bloque)
  const expDrag = useRef<{ x: number; activo: boolean } | null>(null);

  const soltarAgarre = () => {
    if (holdRef.current !== null) {
      clearTimeout(holdRef.current);
      holdRef.current = null;
    }
  };
  const bajar = () => {
    levantaRef.current = false;
    setLevanta(false);
  };
  const distancia = (e: React.MouseEvent) =>
    inicioRef.current ? Math.hypot(e.clientX - inicioRef.current.x, e.clientY - inicioRef.current.y) : 0;

  const onPointerDownChip = (e: React.PointerEvent) => {
    if (!arrastre && !onMoverBloque) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    inicioRef.current = { x: e.clientX, y: e.clientY };
    if (arrastre) {
      if (e.pointerType === "mouse") {
        controls.start(e);
      } else {
        soltarAgarre();
        holdRef.current = window.setTimeout(() => {
          levantaRef.current = true;
          setLevanta(true);
          try {
            navigator.vibrate?.(12);
          } catch {}
          controls.start(e);
        }, 450);
      }
      return;
    }
    // v114 EXPANDIDO: ratón = arrastre inmediato · táctil = pulsación larga 450 ms
    if (e.pointerType === "mouse") {
      expDrag.current = { x: e.clientX, activo: true };
      levantaRef.current = true;
      setLevanta(true);
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    } else {
      soltarAgarre();
      holdRef.current = window.setTimeout(() => {
        levantaRef.current = true;
        setLevanta(true);
        expDrag.current = { x: inicioRef.current?.x ?? 0, activo: true };
        try {
          navigator.vibrate?.(12);
        } catch {}
      }, 450);
    }
  };
  const onPointerMoveChip = (e: React.PointerEvent) => {
    if (holdRef.current !== null && inicioRef.current) {
      const d = Math.hypot(e.clientX - inicioRef.current.x, e.clientY - inicioRef.current.y);
      if (d > 10) soltarAgarre(); // era scroll del dedo, no arrastre
    }
    // v114 EXPANDIDO: cada umbral cruzado desplaza el BLOQUE una pestaña —
    // el grupo viaja con la mano sin soltar (varios saltos por gesto)
    if (expDrag.current?.activo && onMoverBloque) {
      const dx = e.clientX - expDrag.current.x;
      if (dx >= UMBRAL_BLOQUE) {
        onMoverBloque(grupo.id, 1);
        expDrag.current.x = e.clientX;
      } else if (dx <= -UMBRAL_BLOQUE) {
        onMoverBloque(grupo.id, -1);
        expDrag.current.x = e.clientX;
      }
    }
  };

  const chipVisual = (
    <div
      data-grupo-chip={grupo.id}
      title={t("grupo.chipTitle")}
      onClick={(e) => {
        // un arrastre NUNCA contrae el grupo (como las pestañas)
        if (distancia(e) > 8) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        if (!enRenombre) onToggle();
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        if (!enRenombre) onRenombrarInicio();
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        soltarAgarre();
        onMenu(grupo.id, e.clientX, e.clientY);
      }}
      onPointerDown={onPointerDownChip}
      onPointerMove={onPointerMoveChip}
      onPointerUp={() => {
        soltarAgarre();
        expDrag.current = null;
        bajar();
      }}
      onPointerCancel={() => {
        soltarAgarre();
        expDrag.current = null;
        bajar();
      }}
      className={cn(
        "v107-chip relative flex items-center gap-1.5 h-8 pl-2 pr-2 rounded-t-[10px] cursor-pointer select-none shrink-0",
        (arrastre || onMoverBloque) && levanta && "v107-levanta"
      )}
      style={{
        color: grupo.color,
        background: `linear-gradient(160deg, ${grupo.color}22, rgba(8,8,13,0.9) 70%)`,
        border: `1px solid ${grupo.color}55`,
        borderBottom: "none",
        boxShadow: `inset 0 1px 0 ${grupo.color}33, 0 -4px 14px -8px ${grupo.color}55`,
        // v114 EXPANDIDO: pan-y — el gesto horizontal del chip es NUESTRO
        // (mover el bloque), el vertical sigue siendo scroll de la casa
        touchAction: onMoverBloque ? "pan-y" : undefined,
      }}
      role="button"
      tabIndex={0}
      aria-label={`${grupo.nombre} (${miembros})`}
      aria-expanded={!grupo.colapsada}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (!enRenombre) onToggle();
        }
      }}
    >
      <span
        className="w-2 h-2 rounded-full shrink-0"
        style={{ background: grupo.color, boxShadow: `0 0 8px ${grupo.color}` }}
      />
      {enRenombre ? (
        <input
          autoFocus
          value={nombreTmp}
          onChange={(e) => setNombreTmp(e.target.value.slice(0, 24))}
          onClick={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.stopPropagation()}
          onBlur={onRenombrarFin}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === "Enter") onRenombrarFin();
            if (e.key === "Escape") onCancelarRenombre();
          }}
          placeholder={t("grupo.nombrePlaceholder")}
          maxLength={24}
          className="w-[86px] bg-black/50 border border-white/20 rounded-sm px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wide text-foreground focus:outline-none focus:border-amber-hud"
          aria-label={t("grupo.renombrar")}
        />
      ) : (
        <>
          <span className="max-w-[76px] truncate text-[9px] font-mono font-bold uppercase tracking-wide">
            {grupo.nombre}
          </span>
          <span className="text-[8px] font-mono opacity-70 shrink-0">×{miembros}</span>
        </>
      )}
    </div>
  );

  // sin arrastre (chips de grupos EXPANDIDOS dentro de su primera pestaña):
  // el chip vive como siempre — JAMÁS un Reorder.Item fuera de su grupo
  if (!arrastre) return chipVisual;

  return (
    <Reorder.Item
      value={grupo.id}
      as="div"
      dragListener={false}
      dragControls={controls}
      onDragStart={onAgarreChip}
      onDragEnd={() => onSoltarChip?.(grupo.id)}
      className="relative shrink-0 list-none"
      style={{ touchAction: "pan-x" }}
    >
      {chipVisual}
    </Reorder.Item>
  );
}

// ---------- LA FRANJA DE CROMO v107 ----------
type Menu107 =
  | { modo: "pestana"; tab: TabKey; x: number; y: number; sub: null | "nuevo" | "existente" | "alias" }
  | { modo: "grupo"; gid: string; x: number; y: number; sub: null };

export function ChromeTabs({
  pestanas,
  activa,
  onElegir,
  onCerrar,
  onCerrarVarias,
  onReordenar,
  onNueva,
  onOpenMenu,
  onOpenSearch,
  onDuplicar,
  onInmersion,
}: {
  pestanas: TabKey[];
  activa: TabKey;
  onElegir: (k: TabKey) => void;
  onCerrar: (k: TabKey) => void;
  onCerrarVarias: (ks: TabKey[]) => void;
  onReordenar: (nuevas: TabKey[]) => void;
  onNueva: () => void;
  onOpenMenu?: () => void;
  onOpenSearch?: () => void;
  onDuplicar?: (k: TabKey) => void;
  onInmersion?: () => void;
}) {
  const { t, lang } = useT();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  // ----- estado de GRUPOS DE CROMO (v107) -----
  const [grupos, setGrupos] = useState<GrupoCromo[]>([]);
  const [grupoDe, setGrupoDe] = useState<Record<string, string>>({});
  const hidratadoRef = useRef(false);
  const [menu, setMenu] = useState<Menu107 | null>(null);
  const [renombre, setRenombre] = useState<string | null>(null);
  const [nombreTmp, setNombreTmp] = useState("");
  const cerradas = useRef<TabKey[]>([]);
  const [cerradasN, setCerradasN] = useState(0); // para leer en render sin refs
  const ordenAgarreRef = useRef("");
  const zonaAgarreRef = useRef<"fij" | "lib">("lib");

  // ----- v108: FIJADAS + ALIAS (customización profunda de la franja) -----
  const [fijadas, setFijadas] = useState<TabKey[]>([]);
  const [alias, setAlias] = useState<Record<string, string>>({});
  const [aliasTmp, setAliasTmp] = useState("");
  // v108: vista previa al pasar el ratón
  const [previa, setPrevia] = useState<Previa108>(null);

  // espejos vivos para callbacks estables (drag end): se actualizan en EFECTO
  // (el compilador de React prohíbe tocar refs durante el render) y, para el
  // orden exacto en dragEnd, reordenarVisibles también los refresca al vuelo
  const pestanasRef = useRef(pestanas);
  const grupoDeRef = useRef(grupoDe);
  const gruposRef = useRef(grupos);
  const elegirRef = useRef(onElegir);
  const activaRef = useRef(activa);
  const fijadasRef = useRef(fijadas);
  useEffect(() => {
    pestanasRef.current = pestanas;
  }, [pestanas]);
  useEffect(() => {
    grupoDeRef.current = grupoDe;
  }, [grupoDe]);
  useEffect(() => {
    gruposRef.current = grupos;
  }, [grupos]);
  useEffect(() => {
    elegirRef.current = onElegir;
  }, [onElegir]);
  useEffect(() => {
    activaRef.current = activa;
  }, [activa]);
  useEffect(() => {
    fijadasRef.current = fijadas;
  }, [fijadas]);

  // v48.0 BRÚJULA: el progreso del Explorador sobrevive en la franja
  const visited = useGameStore((s) => s.visitedTabs);
  const explorePct = Math.min(100, Math.round((visited.length / TOTAL_TABS) * 100));

  // ----- hidratación de grupos (guardián anti-machaque, lección v106) -----
  useEffect(() => {
    const id = setTimeout(() => {
      try {
        const rawG = localStorage.getItem(LS_GRUPOS);
        if (rawG) {
          const arr = JSON.parse(rawG);
          if (Array.isArray(arr)) {
            const limpios: GrupoCromo[] = arr
              .filter((g: unknown) => !!g && typeof g === "object" && typeof (g as GrupoCromo).id === "string")
              .map((g: Record<string, unknown>) => ({
                id: String(g.id),
                nombre: String(g.nombre ?? "").slice(0, 24),
                color: COLORES_GRUPO.includes(String(g.color)) ? String(g.color) : COLORES_GRUPO[1],
                colapsada: !!g.colapsada,
              }))
              .slice(0, 8);
            setGrupos(limpios);
          }
        }
        const rawM = localStorage.getItem(LS_GRUPO_DE);
        if (rawM) {
          const o = JSON.parse(rawM);
          if (o && typeof o === "object" && !Array.isArray(o)) {
            const limpio: Record<string, string> = {};
            for (const [k, v] of Object.entries(o)) {
              if (typeof k === "string" && typeof v === "string") limpio[k] = v;
            }
            setGrupoDe(limpio);
          }
        }
        // v108: fijadas (solo claves válidas)
        const rawF = localStorage.getItem(LS_FIJADAS);
        if (rawF) {
          const arr = JSON.parse(rawF);
          if (Array.isArray(arr)) {
            setFijadas(arr.filter((k: unknown): k is TabKey => typeof k === "string" && k in TABS).slice(0, 4));
          }
        }
        // v108: alias (nombre propio por pestaña)
        const rawA = localStorage.getItem(LS_ALIAS);
        if (rawA) {
          const o = JSON.parse(rawA);
          if (o && typeof o === "object" && !Array.isArray(o)) {
            const limpio: Record<string, string> = {};
            for (const [k, v] of Object.entries(o)) {
              if (typeof k === "string" && typeof v === "string" && k in TABS && v.trim()) {
                limpio[k] = v.trim().slice(0, 28);
              }
            }
            setAlias(limpio);
          }
        }
      } catch {
        /* sin almacenamiento la franja vive sin grupos */
      }
      hidratadoRef.current = true;
    }, 0);
    return () => clearTimeout(id);
  }, []);

  // ----- persistencia de grupos + fijadas + alias (solo tras hidratar) -----
  useEffect(() => {
    if (!hidratadoRef.current) return;
    try {
      localStorage.setItem(LS_GRUPOS, JSON.stringify(grupos));
      localStorage.setItem(LS_GRUPO_DE, JSON.stringify(grupoDe));
    } catch {}
  }, [grupos, grupoDe]);
  useEffect(() => {
    if (!hidratadoRef.current) return;
    try {
      localStorage.setItem(LS_FIJADAS, JSON.stringify(fijadas));
    } catch {}
  }, [fijadas]);
  useEffect(() => {
    if (!hidratadoRef.current) return;
    try {
      localStorage.setItem(LS_ALIAS, JSON.stringify(alias));
    } catch {}
  }, [alias]);

  // limpieza: pertenencias de pestañas ya cerradas se reciclan (deferido —
  // el compilador prohíbe setState síncrono en el cuerpo del efecto).
  // v112: 1200 ms — el restore de page.tsx (setTimeout 0) debe ganar la
  // carrera, o esta limpieza PODA la pertenencia de pestañas que están a
  // punto de restaurarse y el grupo pierde miembros en cada recarga en frío.
  useEffect(() => {
    const id = setTimeout(() => {
      setGrupoDe((prev) => {
        const vivos = new Set(pestanas);
        let cambio = false;
        const next: Record<string, string> = {};
        for (const [k, g] of Object.entries(prev)) {
          if (vivos.has(k as TabKey)) next[k] = g;
          else cambio = true;
        }
        return cambio ? next : prev;
      });
      // v108: las fijadas de pestañas cerradas también se purgan
      setFijadas((prev) => {
        const vivos = new Set(pestanas);
        const next = prev.filter((k) => vivos.has(k));
        return next.length === prev.length ? prev : next;
      });
    }, 1200);
    return () => clearTimeout(id);
  }, [pestanas]);


  // ----- helpers de grupo -----
  const miembrosDe = (gid: string): TabKey[] => pestanas.filter((k) => grupoDe[k] === gid);

  const crearGrupo = (color: string, tabs: TabKey[]) => {
    const id = `g${Date.now().toString(36)}${Math.floor(Math.random() * 46656).toString(36)}`;
    setGrupos((gs) => [
      ...gs,
      { id, nombre: `${t("grupo.grupo")} ${gs.length + 1}`, color, colapsada: false },
    ]);
    setGrupoDe((m) => {
      const n = { ...m };
      for (const k of tabs) n[k] = id;
      return n;
    });
  };

  const asignar = (k: TabKey, gid: string) => {
    setGrupoDe((m) => ({ ...m, [k]: gid }));
    // si el grupo estaba contraído, se despliega: nadie entra a ciegas
    setGrupos((gs) => gs.map((g) => (g.id === gid ? { ...g, colapsada: false } : g)));
  };

  const quitarDeGrupo = (k: TabKey) => {
    setGrupoDe((m) => {
      const n = { ...m };
      delete n[k];
      return n;
    });
  };

  const toggleColapsar = (gid: string) =>
    setGrupos((gs) => gs.map((g) => (g.id === gid ? { ...g, colapsada: !g.colapsada } : g)));

  const recolorear = (gid: string, color: string) =>
    setGrupos((gs) => gs.map((g) => (g.id === gid ? { ...g, color } : g)));

  const finRenombre = (gid: string) => {
    const nombre = nombreTmp.trim().slice(0, 24);
    if (nombre) {
      setGrupos((gs) => gs.map((g) => (g.id === gid ? { ...g, nombre } : g)));
    }
    setRenombre(null);
  };

  const desagrupar = (gid: string) => {
    setGrupoDe((m) => {
      const n = { ...m };
      for (const k of Object.keys(n)) if (n[k] === gid) delete n[k];
      return n;
    });
  };

  // ----- v112: ARRASTRAR EL CHIP DE GRUPO COMPLETO — el grupo viaja entero -----
  // Al soltar el chip: ① se reordena el registro de grupos (persistencia) y
  // ② se mueven los BLOQUES de pestañas del grupo en pestanas — cuando expanda,
  // sus pestañas aparecen donde el grupo quedó, como en el navegador real.
  const reordenarGruposChips = (ids: string[]) => {
    const ps = pestanasRef.current;
    const gDe = grupoDeRef.current;
    setGrupos((gs) => {
      const mapa = new Map(gs.map((g) => [g.id, g]));
      const ordenados = ids.map((id) => mapa.get(id)).filter((g): g is GrupoCromo => !!g);
      const resto = gs.filter((g) => !ids.includes(g.id));
      return [...ordenados, ...resto];
    });
    const bloques = ids
      .map((id) => ps.filter((k) => gDe[k] === id))
      .filter((b) => b.length > 0);
    if (bloques.length === 0) return;
    const miembros = new Set(bloques.flat());
    const base = ps.filter((k) => !miembros.has(k));
    // ancla: nº de pestañas NO miembros antes del primer miembro del grupo
    // más a la izquierda — los bloques reordenados aterrizan ahí (en base,
    // que ya no tiene miembros, ese índice es exactamente el mismo)
    let ancla = 0;
    for (const k of ps) {
      if (miembros.has(k)) break;
      ancla++;
    }
    const full = [...base.slice(0, ancla), ...bloques.flat(), ...base.slice(ancla)];
    if (full.join("¦") === ps.join("¦")) return;
    pestanasRef.current = full; // dragEnd de pestañas lee orden fresco
    onReordenar(full);
  };

  // ── v114: ARRASTRAR EL CHIP DE GRUPO EXPANDIDO — el bloque visible viaja ──
  // Cada cruce de umbral desplaza el grupo UNA PESTAÑA (intercambio con el
  // vecino no-miembro): el gesto empuja el grupo entero sin soltar, como en
  // el navegador real. Respeta la zona fija (nunca arrastra una fijada).
  const moverBloqueGrupo = (gid: string, dir: 1 | -1) => {
    const ps = pestanasRef.current;
    const gDe = grupoDeRef.current;
    const fij = new Set(fijadasRef.current);
    const setM = new Set(ps.filter((k) => gDe[k] === gid));
    if (setM.size === 0) return;
    const idxs = ps.map((k, i) => (setM.has(k) ? i : -1)).filter((i) => i >= 0);
    const first = idxs[0];
    const last = idxs[idxs.length - 1];
    let full: TabKey[] | null = null;
    if (dir > 0) {
      // el vecino de la DERECHA pasa a la izquierda del bloque
      let j = last + 1;
      while (j < ps.length && setM.has(ps[j])) j++;
      if (j < ps.length && !fij.has(ps[j])) {
        full = [...ps.slice(0, first), ps[j], ...ps.slice(first, j), ...ps.slice(j + 1)];
      }
    } else {
      // el vecino de la IZQUIERDA pasa a la derecha del bloque
      let j = first - 1;
      while (j >= 0 && setM.has(ps[j])) j--;
      if (j >= 0 && !fij.has(ps[j])) {
        full = [...ps.slice(0, j), ...ps.slice(j + 1, last + 1), ps[j], ...ps.slice(last + 1)];
      }
    }
    if (!full || full.join("¦") === ps.join("¦")) return;
    pestanasRef.current = full;
    onReordenar(full);
  };

  // ----- v108: FIJAR / DESFIJAR — la zona fija vive al principio de la franja -----
  const fijar = (k: TabKey) => {
    const fij = new Set([...fijadasRef.current, k]);
    const ps = pestanasRef.current;
    const zonaFija = ps.filter((p) => fij.has(p));
    const resto = ps.filter((p) => !fij.has(p));
    onReordenar([...zonaFija, ...resto]);
    pestanasRef.current = [...zonaFija, ...resto];
    setFijadas(zonaFija);
    quitarDeGrupo(k); // una pestaña fijada no pertenece a grupos (como Chrome)
  };

  const desfijar = (k: TabKey) => {
    const fij = fijadasRef.current.filter((x) => x !== k);
    const ps = pestanasRef.current;
    const zonaFija = ps.filter((p) => fij.includes(p));
    const libres = ps.filter((p) => !fij.includes(p) && p !== k);
    const full = [...zonaFija, k, ...libres]; // sale justo tras la zona fija
    onReordenar(full);
    pestanasRef.current = full;
    setFijadas(zonaFija);
  };

  // ----- v108: RENOMBRAR PESTAÑA (alias que vive en tu navegador) -----
  const guardarAlias = (k: TabKey) => {
    const nombre = aliasTmp.trim().slice(0, 28);
    if (nombre) setAlias((a) => ({ ...a, [k]: nombre }));
    else setAlias((a) => {
      const n = { ...a };
      delete n[k];
      return n;
    });
  };

  const quitarAlias = (k: TabKey) =>
    setAlias((a) => {
      const n = { ...a };
      delete n[k];
      return n;
    });

  // ----- v108: CTRL+TAB / CTRL+RUEDA — ciclar entre las pestañas ABIERTAS -----
  const ciclar = (dir: number) => {
    const ps = pestanasRef.current;
    if (ps.length < 2) return;
    const i = ps.indexOf(activaRef.current);
    const next = ps[(i + dir + ps.length) % ps.length];
    if (next) elegirRef.current(next);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Tab") {
        e.preventDefault();
        ciclar(e.shiftKey ? -1 : 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Ctrl + rueda sobre la franja: pestaña siguiente/anterior (el navegador
  // reserva Ctrl+Tab para sí mismo; la rueda siempre llega)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      ciclar(e.deltaY > 0 ? 1 : -1);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const cerrarGrupo = (gid: string) => {
    const ks = miembrosDe(gid);
    cerradas.current = [...ks, ...cerradas.current].slice(0, 6);
    setCerradasN(cerradas.current.length);
    onCerrarVarias(ks);
    setGrupos((gs) => gs.filter((g) => g.id !== gid));
    setGrupoDe((m) => {
      const n = { ...m };
      for (const k of ks) delete n[k];
      return n;
    });
  };

  const cerrarOtras = (k: TabKey) => {
    const ks = pestanas.filter((p) => p !== k);
    cerradas.current = [...ks, ...cerradas.current].slice(0, 6);
    setCerradasN(cerradas.current.length);
    onCerrarVarias(ks);
  };

  const registrarCerrada = (k: TabKey) => {
    cerradas.current = [k, ...cerradas.current.filter((x) => x !== k)].slice(0, 6);
    setCerradasN(cerradas.current.length);
  };

  const reabrirUltima = () => {
    const k = cerradas.current.shift();
    setCerradasN(cerradas.current.length);
    if (k) elegirRef.current(k); // ref viva: nunca una closure vieja del onElegir
  };

  // Ctrl+Shift+T: reabrir la última cerrada (la tecla la comparte el navegador,
  // pero si llega, se obedece; el menú ⋮ siempre funciona)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "t") {
        e.preventDefault();
        reabrirUltima();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ----- reordenar + integración en grupo al soltar (como Chrome) -----
  const handleAgarre = (zona: "fij" | "lib") => {
    zonaAgarreRef.current = zona;
    ordenAgarreRef.current = pestanasRef.current.join("¦");
  };

  const handleSoltar = (k: TabKey) => {
    const antes = ordenAgarreRef.current;
    ordenAgarreRef.current = "";
    const nuevas = pestanasRef.current;
    if (!antes || antes === nuevas.join("¦")) return; // no hubo reorden real
    if (zonaAgarreRef.current === "fij") return; // la zona fija solo se reordena
    const i = nuevas.indexOf(k);
    if (i < 0) return;
    const gPrev = i > 0 ? grupoDeRef.current[nuevas[i - 1]] : undefined;
    const gNext = i < nuevas.length - 1 ? grupoDeRef.current[nuevas[i + 1]] : undefined;
    const colapsada = (g?: string) => (g ? !!gruposRef.current.find((x) => x.id === g)?.colapsada : false);
    if (gPrev && !colapsada(gPrev) && (gPrev === gNext || !gNext)) {
      asignar(k, gPrev);
    } else if (gNext && !gPrev && !colapsada(gNext)) {
      // intención clara: soltar justo ANTES del primer miembro de un grupo
      const primera = nuevas.find((x) => grupoDeRef.current[x] === gNext);
      if (primera === nuevas[i + 1]) asignar(k, gNext);
    }
  };

  // ----- menú de pestaña/grupo -----
  const abrirMenuPestana = (k: TabKey, x: number, y: number) => {
    setRenombre(null);
    setMenu({
      modo: "pestana",
      tab: k,
      x: Math.max(8, Math.min(x, (window.innerWidth ?? 360) - 250)),
      y: Math.max(8, Math.min(y, (window.innerHeight ?? 640) - 380)),
      sub: null,
    });
  };

  const abrirMenuGrupo = (gid: string, x: number, y: number) => {
    setRenombre(null);
    setMenu({
      modo: "grupo",
      gid,
      x: Math.max(8, Math.min(x, (window.innerWidth ?? 360) - 250)),
      y: Math.max(8, Math.min(y, (window.innerHeight ?? 640) - 330)),
      sub: null,
    });
  };

  // cerrar el menú con clic fuera o Escape
  useEffect(() => {
    if (!menu) return;
    const fuera = (e: PointerEvent) => {
      const el = e.target as HTMLElement | null;
      if (el?.closest("[data-menu107]")) return;
      setMenu(null);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenu(null);
    };
    window.addEventListener("pointerdown", fuera);
    window.addEventListener("keydown", esc);
    return () => {
      window.removeEventListener("pointerdown", fuera);
      window.removeEventListener("keydown", esc);
    };
  }, [menu]);

  // ----- visibilidad según grupos contraídos -----
  const colapsadasSet = new Set(grupos.filter((g) => g.colapsada).map((g) => g.id));
  const visibles = pestanas.filter((k) => !colapsadasSet.has(grupoDe[k] ?? ""));
  // v108: la ZONA FIJA va siempre delante — dos grupos de arrastre separados
  const fijadasVis = visibles.filter((k) => fijadas.includes(k));
  const libresVis = visibles.filter((k) => !fijadas.includes(k));
  const chipsContraidos = grupos.filter(
    (g) => g.colapsada && pestanas.some((k) => grupoDe[k] === g.id)
  );

  // el chip de cada grupo expandido va delante del PRIMER miembro visible
  // (solo pestañas libres: una fijada nunca pertenece a un grupo)
  const chipAntesDe = new Map<string, GrupoCromo>();
  const vistos = new Set<string>();
  for (const k of libresVis) {
    const g = grupoDe[k];
    if (!g || vistos.has(g)) continue;
    vistos.add(g);
    const gr = grupos.find((x) => x.id === g);
    if (gr) chipAntesDe.set(k, gr);
  }

  const reordenarFijadas = (nuevas: TabKey[]) => {
    const full = [...nuevas, ...pestanas.filter((k) => !fijadas.includes(k))];
    pestanasRef.current = full; // handler (no render): el dragEnd lee orden fresco
    onReordenar(full);
  };

  const reordenarLibres = (nuevas: TabKey[]) => {
    const full = [...pestanas.filter((k) => fijadas.includes(k)), ...nuevas];
    pestanasRef.current = full;
    onReordenar(full);
  };

  // v108: vista previa al pasar el ratón — bajo la pestaña, sujeta al viewport
  const abrirPrevia = (k: TabKey, el: HTMLElement) => {
    // v170.0 PREFETCH: mientras se mira la vitrina, el chunk ya viene volando
    window.dispatchEvent(new CustomEvent("vg:prefetch-tab", { detail: { key: k } }));
    const r = el.getBoundingClientRect();
    const ancho = 232;
    const left = Math.max(8, Math.min(r.left, (window.innerWidth ?? 360) - ancho - 8));
    const alto = 150;
    const abajo = r.bottom + alto + 12 < (window.innerHeight ?? 640);
    setPrevia({
      k,
      left,
      top: abajo ? r.bottom + 6 : Math.max(8, r.top - alto - 6),
      abajo,
    });
  };

  const renderPestana = (k: TabKey) => {
    const chip = chipAntesDe.get(k);
    return (
      <PestanaItem
        key={k}
        k={k}
        esActiva={k === activa}
        fijada={fijadas.includes(k)}
        alias={alias[k]}
        chip={
          chip ? (
            <ChipGrupo
              grupo={chip}
              miembros={miembrosDe(chip.id).length}
              enRenombre={renombre === chip.id}
              nombreTmp={nombreTmp}
              setNombreTmp={setNombreTmp}
              onToggle={() => toggleColapsar(chip.id)}
              onRenombrarInicio={() => {
                setNombreTmp(chip.nombre);
                setRenombre(chip.id);
              }}
              onRenombrarFin={() => finRenombre(chip.id)}
              onCancelarRenombre={() => setRenombre(null)}
              onMenu={abrirMenuGrupo}
              onMoverBloque={moverBloqueGrupo} // v114: el chip EXPANDIDO también arrastra
            />
          ) : undefined
        }
        grupoColor={chip?.color}
        onElegir={onElegir}
        onCerrar={(kk) => {
          registrarCerrada(kk);
          onCerrar(kk);
        }}
        onMenu={abrirMenuPestana}
        onAgarre={() => handleAgarre(fijadas.includes(k) ? "fij" : "lib")}
        onSoltar={handleSoltar}
        onPrevisualizar={abrirPrevia}
        onSalirPrevia={() => setPrevia(null)}
      />
    );
  };

  const updateArrows = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  useEffect(() => {
    updateArrows();
    const el = scrollRef.current;
    const onScroll = () => updateArrows();
    el?.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el?.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateArrows);
    };
  }, [pestanas.length, activa, grupos]);

  // auto-scroll: la pestaña activa siempre a la vista (patrón v106)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const btn = el.querySelector(`[data-pestana="${activa}"]`) as HTMLElement | null;
    if (btn) {
      const left = btn.offsetLeft - el.clientWidth / 2 + btn.clientWidth / 2;
      el.scrollTo({ left, behavior: "smooth" });
    }
  }, [activa, visibles.length]);

  const scrollBy = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 200, behavior: "smooth" });
  };

  return (
    <nav className="sticky top-[126px] sm:top-[160px] z-20" aria-label={t("cromo.franga")}>
      <div className="vg170-franja-pulida relative bg-[#07070b]/88 backdrop-blur-md border-b border-amber-hud/25 shadow-[0_8px_24px_-14px_rgba(0,0,0,0.9)]">
        {/* degradados + flechas: nada queda opacado en móvil (herencia v48) */}
        <div
          className={cn(
            "absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-[#07070b] to-transparent z-10 pointer-events-none transition-opacity",
            canLeft ? "opacity-100" : "opacity-0"
          )}
        />
        <div
          className={cn(
            "absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-[#07070b] to-transparent z-10 pointer-events-none transition-opacity",
            canRight ? "opacity-100" : "opacity-0"
          )}
        />
        {canLeft && (
          <button
            onClick={() => scrollBy(-1)}
            className="absolute left-0 top-0 bottom-0 z-20 px-0.5 flex items-center bg-[#07070b]/80 hover:bg-amber-hud/30"
            aria-label={t("cromo.anterior")}
          >
            <ChevronLeft className="w-3.5 h-3.5 text-amber" />
          </button>
        )}
        {canRight && (
          <button
            onClick={() => scrollBy(1)}
            className="absolute right-0 top-0 bottom-0 z-20 px-0.5 flex items-center bg-[#07070b]/80 hover:bg-amber-hud/30"
            aria-label={t("cromo.siguiente")}
          >
            <ChevronRight className="w-3.5 h-3.5 text-amber" />
          </button>
        )}

        <div
          ref={scrollRef}
          className="overflow-x-auto thin-scroll"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <div className="flex items-end gap-0.5 px-2 sm:px-3 pt-1.5 min-w-max">
            {/* v108: ZONA FIJA — pestañas fijadas, solo icono, reordenables entre sí */}
            {fijadasVis.length > 0 && (
              <Reorder.Group
                axis="x"
                values={fijadasVis}
                onReorder={reordenarFijadas}
                as="div"
                className="flex items-end gap-0.5 pr-1 mr-0.5 border-r border-white/10"
              >
                <AnimatePresence initial={false}>{fijadasVis.map(renderPestana)}</AnimatePresence>
              </Reorder.Group>
            )}

            {/* ARRASTRA Y REORDENA: Reorder.Group anima con transform puro */}
            <Reorder.Group
              axis="x"
              values={libresVis}
              onReorder={reordenarLibres}
              as="div"
              className="flex items-end gap-0.5"
            >
              <AnimatePresence initial={false}>{libresVis.map(renderPestana)}</AnimatePresence>
            </Reorder.Group>

            {/* chips de grupos CONTRAIDOS: quedan en la franja como en Chrome.
                v112: ARRASTRABLES — mover un chip mueve el GRUPO COMPLETO */}
            {chipsContraidos.length > 0 && (
              <Reorder.Group
                axis="x"
                values={chipsContraidos.map((g) => g.id)}
                onReorder={reordenarGruposChips}
                as="div"
                className="flex items-end gap-1 ml-0.5"
              >
                {chipsContraidos.map((g) => (
                  <ChipGrupo
                    key={g.id}
                    grupo={g}
                    miembros={miembrosDe(g.id).length}
                    arrastre
                    enRenombre={renombre === g.id}
                    nombreTmp={nombreTmp}
                    setNombreTmp={setNombreTmp}
                    onToggle={() => toggleColapsar(g.id)}
                    onRenombrarInicio={() => {
                      setNombreTmp(g.nombre);
                      setRenombre(g.id);
                    }}
                    onRenombrarFin={() => finRenombre(g.id)}
                    onCancelarRenombre={() => setRenombre(null)}
                    onMenu={abrirMenuGrupo}
                    onAgarreChip={() => {
                      ordenAgarreRef.current = pestanasRef.current.join("¦");
                    }}
                    onSoltarChip={() => {
                      ordenAgarreRef.current = "";
                    }}
                  />
                ))}
              </Reorder.Group>
            )}

            {/* el + abre la NUEVA PESTAÑA — elegir destino como el navegador */}
            <motion.button
              layout
              onClick={onNueva}
              title={t("cromo.nueva")}
              aria-label={t("cromo.nueva")}
              className="shrink-0 mb-0.5 ml-1 w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-amber hover:bg-amber-hud/20 border border-transparent hover:border-amber-hud/40 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </motion.button>

            {/* buscar + pantalla completa + menú: los acompañantes fijos de la franja */}
            <div className="shrink-0 ml-auto flex items-center gap-1 mb-0.5 pl-3 pr-1">
              {onOpenSearch && (
                <button
                  onClick={onOpenSearch}
                  title={t("nav.searchTitle")}
                  aria-label={t("nav.searchTitle")}
                  className="nexus-btn3d flex items-center gap-1.5 px-2 py-1 rounded-md font-mono text-[9px] sm:text-[10px] font-bold uppercase tracking-widest border border-amber-hud/50 text-amber bg-amber-hud/10 hover:bg-amber-hud/30 transition-colors"
                >
                  <Search className="w-3 h-3" />
                  <span className="hidden sm:inline nexus-letra-suave">{t("nav.search")}</span>
                </button>
              )}
              {onInmersion && (
                <button
                  onClick={onInmersion}
                  title={`${t("inmi.entrar")} (F)`}
                  aria-label={t("inmi.entrar")}
                  data-inmi108
                  className="nexus-btn3d flex items-center gap-1.5 px-2 py-1 rounded-md font-mono text-[9px] sm:text-[10px] font-bold uppercase tracking-widest border border-green-hud/60 text-green-hud bg-green-hud/10 hover:bg-green-hud/30 transition-colors"
                >
                  <Maximize2 className="w-3 h-3" />
                  <span className="hidden sm:inline nexus-letra-suave">{t("inmi.corto")}</span>
                </button>
              )}
              {onOpenMenu && (
                <button
                  onClick={onOpenMenu}
                  title={t("nav.openFull")}
                  aria-label={t("nav.openFull")}
                  className="nexus-btn3d flex items-center gap-1.5 px-2 py-1 rounded-md font-mono text-[9px] sm:text-[10px] font-bold uppercase tracking-widest border border-electric-hud text-electric bg-electric-hud/30 hover:bg-electric-hud/60 transition-colors"
                >
                  <LayoutGrid className="w-3 h-3" />
                  <span className="hidden sm:inline nexus-letra-suave">{t("nav.menu")}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* v107.0 MENÚ DE PESTAÑA / GRUPO — portal: la franja tiene backdrop-blur */}
        {menu &&
          createPortal(
            <div
              data-menu107
              role="menu"
              aria-label={menu.modo === "pestana" ? t("grupo.menu") : undefined}
              className="v107-menu fixed z-[90] min-w-[238px] max-w-[286px] rounded-md border border-amber-hud/35 bg-[#0B0B12]/97 backdrop-blur-md shadow-[0_24px_60px_-18px_rgba(0,0,0,0.95)] py-1.5 font-mono"
              style={{ left: menu.x, top: menu.y }}
              onContextMenu={(e) => e.preventDefault()}
            >
              {menu.modo === "pestana" ? (
                <>
                  <div className="px-3 py-1.5 text-[9px] uppercase tracking-widest text-muted-foreground/80 border-b border-white/5 truncate">
                    {TABS[menu.tab] ? (alias[menu.tab] || tabLabel(lang, menu.tab, TABS[menu.tab].label)).split(" (")[0] : ""}
                  </div>
                  {menu.sub === null && (
                    <>
                      {/* v108: customización profunda de la pestaña */}
                      <ItemMenu
                        onClick={() => {
                          if (fijadas.includes(menu.tab)) desfijar(menu.tab);
                          else fijar(menu.tab);
                          setMenu(null);
                        }}
                      >
                        {fijadas.includes(menu.tab) ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
                        {fijadas.includes(menu.tab) ? t("m108.desfijar") : t("m108.fijar")}
                      </ItemMenu>
                      <ItemMenu
                        onClick={() => {
                          setAliasTmp(alias[menu.tab] ?? "");
                          setMenu({ ...menu, sub: "alias" });
                        }}
                      >
                        <Type className="w-3 h-3" /> {t("m108.renombrar")}
                      </ItemMenu>
                      <ItemMenu
                        onClick={() => {
                          onDuplicar?.(menu.tab);
                          setMenu(null);
                        }}
                      >
                        <Copy className="w-3 h-3" /> {t("m108.duplicar")}
                      </ItemMenu>
                      <SepMenu />
                      <ItemMenu onClick={() => setMenu({ ...menu, sub: "nuevo" })}>
                        <span aria-hidden>▸</span> {t("grupo.anadir")}
                      </ItemMenu>
                      {grupos.length > 0 && (
                        <ItemMenu onClick={() => setMenu({ ...menu, sub: "existente" })}>
                          <span aria-hidden>▸</span> {t("grupo.existente")}
                        </ItemMenu>
                      )}
                      {grupoDe[menu.tab] && (
                        <ItemMenu
                          onClick={() => {
                            quitarDeGrupo(menu.tab);
                            setMenu(null);
                          }}
                        >
                          <span aria-hidden>◌</span> {t("grupo.quitar")}
                        </ItemMenu>
                      )}
                      <SepMenu />
                      <ItemMenu
                        onClick={() => {
                          cerrarOtras(menu.tab);
                          setMenu(null);
                        }}
                      >
                        <span aria-hidden>⧉</span> {t("grupo.cerrarOtras")}
                      </ItemMenu>
                      {cerradasN > 0 && (
                        <ItemMenu
                          onClick={() => {
                            reabrirUltima();
                            setMenu(null);
                          }}
                        >
                          <span aria-hidden>↺</span> {t("grupo.reabrir")}
                          <span className="opacity-50 normal-case tracking-normal">Ctrl+Shift+T</span>
                        </ItemMenu>
                      )}
                      <SepMenu />
                      <ItemMenu
                        peligro
                        onClick={() => {
                          registrarCerrada(menu.tab);
                          onCerrar(menu.tab);
                          setMenu(null);
                        }}
                      >
                        <X className="w-3 h-3" /> {t("cromo.cerrar")}
                      </ItemMenu>
                    </>
                  )}
                  {menu.sub === "alias" && (
                    <div className="px-3 py-2">
                      <input
                        autoFocus
                        value={aliasTmp}
                        onChange={(e) => setAliasTmp(e.target.value.slice(0, 28))}
                        onKeyDown={(e) => {
                          e.stopPropagation();
                          if (e.key === "Enter") {
                            guardarAlias(menu.tab);
                            setMenu(null);
                          }
                          if (e.key === "Escape") setMenu(null);
                        }}
                        onBlur={() => {
                          guardarAlias(menu.tab);
                          setMenu(null);
                        }}
                        placeholder={t("m108.aliasPh")}
                        maxLength={28}
                        className="w-full bg-black/50 border border-white/20 rounded-sm px-2 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wide text-foreground focus:outline-none focus:border-amber-hud"
                        aria-label={t("m108.renombrar")}
                      />
                      {alias[menu.tab] && (
                        <ItemMenu
                          onClick={() => {
                            quitarAlias(menu.tab);
                            setMenu(null);
                          }}
                        >
                          <span aria-hidden>↺</span> {t("m108.restaurar")}
                        </ItemMenu>
                      )}
                      <div className="px-0 pt-1.5 text-[8px] font-mono text-muted-foreground/70 normal-case tracking-normal">
                        {t("m108.aliasHint")}
                      </div>
                    </div>
                  )}
                  {menu.sub === "nuevo" && (
                    <FilaColores
                      onPick={(c) => {
                        crearGrupo(c, [menu.tab]);
                        setMenu(null);
                      }}
                    />
                  )}
                  {menu.sub === "existente" &&
                    grupos.map((g) => (
                      <ItemMenu
                        key={g.id}
                        onClick={() => {
                          asignar(menu.tab, g.id);
                          setMenu(null);
                        }}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ background: g.color, boxShadow: `0 0 8px ${g.color}` }}
                        />
                        <span className="truncate">{g.nombre}</span>
                        <span className="opacity-60">×{miembrosDe(g.id).length}</span>
                      </ItemMenu>
                    ))}
                </>
              ) : (
                <>
                  {(() => {
                    const g = grupos.find((x) => x.id === menu.gid);
                    if (!g) return null;
                    return (
                      <div className="px-3 py-1.5 flex items-center gap-2 text-[9px] uppercase tracking-widest border-b border-white/5">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ background: g.color, boxShadow: `0 0 8px ${g.color}` }}
                        />
                        <span className="truncate" style={{ color: g.color }}>
                          {g.nombre}
                        </span>
                        <span className="opacity-60 text-muted-foreground">×{miembrosDe(g.id).length}</span>
                      </div>
                    );
                  })()}
                  <FilaColores
                    onPick={(c) => {
                      recolorear(menu.gid, c);
                    }}
                  />
                  <ItemMenu
                    onClick={() => {
                      const g = grupos.find((x) => x.id === menu.gid);
                      if (g) {
                        setNombreTmp(g.nombre);
                        setRenombre(g.id);
                      }
                      setMenu(null);
                    }}
                  >
                    <span aria-hidden>✎</span> {t("grupo.renombrar")}
                  </ItemMenu>
                  <ItemMenu
                    onClick={() => {
                      toggleColapsar(menu.gid);
                      setMenu(null);
                    }}
                  >
                    <span aria-hidden>⊟</span>{" "}
                    {grupos.find((x) => x.id === menu.gid)?.colapsada ? t("grupo.expandir") : t("grupo.colapsar")}
                  </ItemMenu>
                  <ItemMenu
                    onClick={() => {
                      desagrupar(menu.gid);
                      setMenu(null);
                    }}
                  >
                    <span aria-hidden>◌</span> {t("grupo.desagrupar")}
                  </ItemMenu>
                  <SepMenu />
                  <ItemMenu
                    peligro
                    onClick={() => {
                      cerrarGrupo(menu.gid);
                      setMenu(null);
                    }}
                  >
                    <X className="w-3 h-3" /> {t("grupo.cerrarGrupo")}
                  </ItemMenu>
                </>
              )}
            </div>,
            document.body
          )}

        {/* v108: VISTA PREVIA AL PASAR EL RATÓN — la sala se ve antes de entrar */}
        {previa &&
          createPortal(
            <div
              data-previa108={previa.k}
              aria-hidden
              className="v108-previa fixed z-[90] w-[232px] pointer-events-none rounded-md border border-amber-hud/35 bg-[#0B0B12]/97 backdrop-blur-md shadow-[0_24px_60px_-18px_rgba(0,0,0,0.95)] p-2"
              style={{ left: previa.left, top: previa.top }}
            >
              <VitrinaSala tab={previa.k} modo="card" alias={alias[previa.k]} className="h-24 w-full" />
            </div>,
            document.body
          )}
      </div>

      {/* línea del Explorador: el mapa se conquista pestaña a pestaña */}
      <div
        className="h-[3px] bg-secondary/40 relative overflow-hidden"
        role="progressbar"
        aria-label={t("cromo.explorador")}
        aria-valuemin={0}
        aria-valuemax={TOTAL_TABS}
        aria-valuenow={visited.length}
        title={`${t("cromo.exploradorTitle1")} ${visited.length}/${TOTAL_TABS} (${explorePct}%)`}
      >
        <div
          className="h-full transition-[width] duration-500"
          style={{
            width: `${Math.max(2, explorePct)}%`,
            background: `linear-gradient(90deg, #FFC94D, ${accentOfSection(sectionOfTab(activa).key)}, #4ADE80)`,
          }}
        />
      </div>
    </nav>
  );
}
