"use client";

// v108.0 LA CIUDAD VIVA — PORTADAS REALES EN CSS.
// Mandato del comandante: "dales una portada a cada una para ver qué hay en
// cada una, que no sean IA sino mejor: que se vea el lugar en sí".
// Aquí cada MUNDO (sección) y cada SALA (pestaña) tiene su portada dibujada
// con CSS/SVG propio: cielo nocturno, luna llena con halo, estrellas, ventanas
// vivas del color del mundo. Cero <img>, cero ilustraciones IA, cero enlaces.
// Rendimiento: solo transform/opacity anima — 60 FPS; reduced-motion apaga.

import { cn } from "@/lib/utils";
import { accentOfSection, sectionOfTab, TABS, type TabKey } from "./tab-nav";
import { tabLabel, TAB_SHORTS, useT } from "@/lib/i18n";
// v116.0 MEGALÓPOLIS — la ciudad del inicio rota de región y vive el
// ciclo día/noche REAL (sol, luna, estrellas y ventanas obedecen a TU hora)
import { CiudadInicio } from "./megalopolis";

export type MundoKey =
  | "nueva" | "inicio" | "hangar" | "inteligencia" | "juego" | "mercado"
  | "archivo" | "comando" | "observatorio" | "estrategia" | "emisora"
  | "oscsuro" | "creadores" | "social" | "sistema";

// ---------- PRIMITIVAS COMPARTIDAS ----------

// estrellas fijas (deterministas — cero Math.random en render: hidratación limpia)
const ESTRELLAS: [number, number, number][] = [
  [6, 18, 1.5], [14, 34, 1], [22, 12, 1.2], [30, 26, 1], [38, 8, 1.6],
  [46, 30, 1], [54, 16, 1.3], [62, 40, 1], [70, 10, 1.4], [78, 28, 1],
  [86, 20, 1.5], [92, 36, 1], [11, 46, 1], [57, 8, 1], [83, 44, 1.2],
];

function Cielo({ acc, lunaX = 76, lunaY = 26, lunaR = 13 }: { acc: string; lunaX?: number; lunaY?: number; lunaR?: number }) {
  return (
    <>
      {/* cielo profundo con horizonte del color del mundo */}
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(180deg, #05050a 0%, #0a0a14 42%, ${acc}14 78%, ${acc}2E 100%)` }}
      />
      {/* estrellas titilantes */}
      {ESTRELLAS.map(([x, y, r], i) => (
        <span
          key={i}
          className="v108-estrella absolute rounded-full bg-white"
          style={{ left: `${x}%`, top: `${y}%`, width: r, height: r, animationDelay: `${(i % 5) * 0.7}s` }}
          aria-hidden
        />
      ))}
      {/* luna llena con halo — la firma de Vanguard */}
      <div
        className="absolute rounded-full"
        style={{
          left: `${lunaX}%`, top: `${lunaY}%`, width: lunaR * 2, height: lunaR * 2,
          background: "radial-gradient(circle at 38% 34%, #FFF7E0, #FFE9B8 52%, #F5D48A 100%)",
          boxShadow: `0 0 ${lunaR * 3}px ${lunaR}px rgba(255,233,184,0.22), 0 0 ${lunaR * 6}px rgba(255,233,184,0.12)`,
        }}
        aria-hidden
      />
      {/* resplandor del horizonte */}
      <div
        className="absolute inset-x-0 bottom-0 h-1/2"
        style={{ background: `radial-gradient(120% 90% at 50% 115%, ${acc}38, transparent 65%)` }}
        aria-hidden
      />
    </>
  );
}

function Ventanas({ n, acc, top, h, flicker = true }: { n: number; acc: string; top: string; h: number; flicker?: boolean }) {
  return (
    <div className="absolute inset-x-1 flex flex-wrap gap-[3px] content-start" style={{ top, maxHeight: h }}>
      {Array.from({ length: n }).map((_, i) => (
        <span
          key={i}
          className={cn("w-[3px] h-[3px] rounded-[0.5px]", flicker && i % 3 === 0 && "v108-ventana")}
          style={{ background: i % 4 === 0 ? acc : "#FFD98A", opacity: i % 5 === 0 ? 0.35 : 0.8, animationDelay: `${(i % 7) * 0.5}s` }}
          aria-hidden
        />
      ))}
    </div>
  );
}

// silueta de ciudad con ventanas encendidas (la ciudad que respira)
function Skyline({ acc, alto = "38%" }: { acc: string; alto?: string }) {
  const EDS = [26, 44, 34, 60, 40, 74, 50, 64, 36, 56, 30, 46];
  return (
    <div className="absolute inset-x-0 bottom-0 flex items-end justify-center gap-[3px] px-2" style={{ height: alto }} aria-hidden>
      {EDS.map((h, i) => (
        <div
          key={i}
          className="relative flex-1 max-w-[34px]"
          style={{
            height: `${h}%`,
            background: `linear-gradient(180deg, ${acc}26, rgba(7,7,12,0.96) 70%)`,
            borderTop: `1px solid ${acc}55`,
            boxShadow: `0 -6px 18px -10px ${acc}66`,
          }}
        >
          <Ventanas n={Math.max(3, Math.round(h / 6))} acc={acc} top="4px" h={999} flicker={i % 2 === 0} />
        </div>
      ))}
    </div>
  );
}

// ---------- LAS 15 ESCENAS (una por mundo) ----------

function EscenaInicio({ acc }: { acc: string }) {
  // v116.0 MEGALÓPOLIS: la ciudad del inicio ya no es una postal nocturna
  // fija — rota de REGIÓN cada día (Núcleo Cromo, Distrito Neón, Meseta
  // Solar, Puerto Abierto, Jardines Verticales, Ciudadela) y vive el
  // ciclo día/noche EN TIEMPO REAL: sol, luna, meteoros y ventanas que
  // obedecen a la luz de tu reloj. Tres capas de volumen 3D.
  return <CiudadInicio acc={acc} />;
}

function EscenaHangar({ acc }: { acc: string }) {
  return (
    <>
      <Cielo acc={acc} lunaX={14} lunaY={20} lunaR={10} />
      {/* hangar: bahía con puerta de arco y haz de escaneo */}
      <div className="absolute left-1/2 bottom-0 -translate-x-1/2 w-[70%] h-[64%]" aria-hidden>
        <div
          className="absolute inset-0 rounded-t-[999px]"
          style={{ background: `linear-gradient(180deg, rgba(8,8,13,0.95), rgba(8,8,13,0.98))`, border: `2px solid ${acc}66`, borderBottom: "none", boxShadow: `0 0 30px -8px ${acc}55` }}
        />
        <div
          className="absolute left-1/2 bottom-0 -translate-x-1/2 w-[58%] h-[74%] rounded-t-[999px]"
          style={{ background: `linear-gradient(180deg, ${acc}33, ${acc}0A 80%)`, border: `1px solid ${acc}55`, borderBottom: "none" }}
        />
        {/* haz de escaneo que sube y baja (transform puro — 60 FPS) */}
        <div className="absolute inset-x-2 inset-y-2 overflow-hidden rounded-full" aria-hidden>
          <div
            className="v108-escaneo absolute inset-x-0 h-full"
            style={{ background: `linear-gradient(180deg, transparent 44%, ${acc} 50%, transparent 56%)` }}
          />
        </div>
      </div>
      {/* jet en silueta despegando */}
      <div
        className="absolute right-[8%] top-[24%] w-16 h-3"
        style={{ background: `linear-gradient(90deg, ${acc}CC, ${acc}22)`, clipPath: "polygon(0 45%, 62% 0, 100% 50%, 62% 100%)", boxShadow: `0 0 18px -4px ${acc}` }}
        aria-hidden
      />
      {/* franjas de precaución */}
      <div
        className="absolute inset-x-0 bottom-0 h-1.5 opacity-70"
        style={{ background: `repeating-linear-gradient(45deg, ${acc}88 0 6px, transparent 6px 12px)` }}
        aria-hidden
      />
    </>
  );
}

function EscenaInteligencia({ acc }: { acc: string }) {
  return (
    <>
      <Cielo acc={acc} lunaX={84} lunaY={16} lunaR={9} />
      {/* sala de control: tres monitores vivos */}
      <div className="absolute inset-x-[12%] bottom-[16%] flex gap-2 items-end justify-center" aria-hidden>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="flex-1 max-w-[64px] h-9 sm:h-11 rounded-[3px] border p-1"
            style={{ borderColor: `${acc}66`, background: `linear-gradient(160deg, ${acc}1A, rgba(6,6,10,0.95))`, boxShadow: `0 0 18px -6px ${acc}66` }}
          >
            <div className="space-y-1">
              <div className={cn("h-[3px] rounded-full", i === 1 ? "v108-latido" : "")} style={{ width: `${72 - i * 14}%`, background: acc }} />
              <div className="h-[3px] rounded-full" style={{ width: `${44 + i * 12}%`, background: `${acc}66` }} />
              <div className="h-[3px] rounded-full" style={{ width: `${58 - i * 8}%`, background: `${acc}44` }} />
            </div>
          </div>
        ))}
      </div>
      {/* radar dirigiendo al cielo */}
      <div className="absolute left-[8%] bottom-[18%]" aria-hidden>
        <div className="w-px h-7 mx-auto" style={{ background: `${acc}77` }} />
        <div className="v108-onda w-7 h-7 rounded-full border-2 border-t-transparent" style={{ borderColor: `${acc}88`, borderTopColor: "transparent", marginTop: -26 }} />
      </div>
      {/* órbita satelital */}
      <div
        className="absolute left-1/2 top-[30%] -translate-x-1/2 w-[62%] h-10 rounded-[50%] border opacity-60"
        style={{ borderColor: `${acc}44`, transform: "translateX(-50%) rotate(-8deg)" }}
        aria-hidden
      />
      <span className="v108-estrella absolute w-1.5 h-1.5 rounded-full" style={{ left: "30%", top: "30%", background: acc, boxShadow: `0 0 10px ${acc}` }} aria-hidden />
    </>
  );
}

function EscenaJuego({ acc }: { acc: string }) {
  return (
    <>
      <Cielo acc={acc} lunaX={82} lunaY={20} lunaR={11} />
      {/* castillo con almenas */}
      <div className="absolute left-[10%] bottom-0 flex items-end gap-[3px]" aria-hidden>
        {[46, 72, 46].map((h, i) => (
          <div key={i} className="relative w-6 sm:w-7" style={{ height: h }}>
            <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${acc}2E, rgba(7,7,12,0.97) 78%)`, border: `1px solid ${acc}55`, borderBottom: "none" }} />
            <div className="absolute -top-[5px] inset-x-0 flex justify-between px-[2px]" aria-hidden>
              {[0, 1, 2].map((m) => <span key={m} className="w-[4px] h-[5px]" style={{ background: `${acc}99` }} />)}
            </div>
            {i === 1 && <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-2 h-[46%] rounded-t-full" style={{ background: `rgba(5,5,9,0.9)`, border: `1px solid ${acc}44`, borderBottom: "none" }} aria-hidden />}
          </div>
        ))}
      </div>
      {/* espadas cruzadas */}
      <div className="absolute right-[14%] top-[26%] w-12 h-12" aria-hidden>
        <span className="absolute left-1/2 top-0 w-[3px] h-12 -translate-x-1/2 rotate-[24deg] rounded-full" style={{ background: `linear-gradient(180deg, #E8E4D8, ${acc})` }} />
        <span className="absolute left-1/2 top-0 w-[3px] h-12 -translate-x-1/2 -rotate-[24deg] rounded-full" style={{ background: `linear-gradient(180deg, #E8E4D8, ${acc})` }} />
      </div>
      {/* mapa hex del frente */}
      <div className="absolute inset-x-[28%] bottom-[10%] h-[30%] opacity-70" aria-hidden>
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="absolute w-3.5 h-3.5 rotate-45 border"
            style={{
              left: `${(i % 3) * 34}%`, top: `${Math.floor(i / 3) * 52}%`,
              borderColor: i === 0 ? acc : `${acc}55`,
              background: i === 0 ? `${acc}44` : "transparent",
              boxShadow: i === 0 ? `0 0 12px ${acc}88` : undefined,
            }}
          />
        ))}
      </div>
    </>
  );
}

function EscenaMercado({ acc }: { acc: string }) {
  return (
    <>
      <Cielo acc={acc} lunaX={80} lunaY={18} lunaR={10} />
      {/* velas de bolsa vivas */}
      <div className="absolute inset-x-[10%] bottom-[14%] h-[52%] flex items-end gap-[6px] sm:gap-[9px]" aria-hidden>
        {[38, 62, 30, 74, 50, 88, 44, 68].map((h, i) => (
          <div key={i} className="relative flex-1 max-w-[22px]">
            <span className="absolute left-1/2 -top-2 w-px h-2" style={{ background: `${acc}55` }} />
            <div
              className={cn("w-full rounded-[1px]", i === 5 && "v108-latido")}
              style={{
                height: h,
                background: i % 2 === 0 ? `${acc}CC` : "#FF6B5ACC",
                boxShadow: i % 2 === 0 ? `0 0 10px -2px ${acc}` : "0 0 10px -2px #FF6B5A",
              }}
            />
          </div>
        ))}
      </div>
      {/* línea de tendencia */}
      <svg className="absolute inset-x-0 bottom-[8%] w-full h-10 opacity-80" viewBox="0 0 100 20" preserveAspectRatio="none" aria-hidden>
        <polyline points="2,16 20,12 38,14 56,7 74,9 98,2" fill="none" stroke={acc} strokeWidth="0.8" strokeDasharray="3 2" />
      </svg>
      {/* monedas */}
      {[16, 88].map((x, i) => (
        <span
          key={i}
          className="v108-onda absolute w-4 h-4 rounded-full border-2"
          style={{ left: `${x}%`, top: `${28 + i * 10}%`, borderColor: acc, background: `${acc}22`, animationDelay: `${i * 1.1}s` }}
          aria-hidden
        />
      ))}
    </>
  );
}

function EscenaArchivo({ acc }: { acc: string }) {
  return (
    <>
      <Cielo acc={acc} lunaX={12} lunaY={22} lunaR={9} />
      {/* estantería: tres baldas con lomos de libros */}
      <div className="absolute inset-x-[10%] bottom-[12%] top-[24%] flex flex-col justify-between" aria-hidden>
        {[0, 1, 2].map((fila) => (
          <div key={fila} className="relative flex-1 mx-1">
            <div className="absolute bottom-0 inset-x-0 flex items-end gap-[2px] px-[2px] pb-[2px]">
              {[9, 12, 8, 13, 10, 12, 9, 13, 11, 8].map((h, i) => (
                <span
                  key={i}
                  className="flex-1 max-w-[7px] rounded-[1px]"
                  style={{
                    height: h + (fila * 2),
                    background: i % 3 === fila % 3 ? `${acc}CC` : i % 2 ? "#5A4A2E" : "#3E3420",
                    boxShadow: i % 4 === 0 ? `0 0 8px -2px ${acc}` : undefined,
                    opacity: 0.92,
                  }}
                />
              ))}
            </div>
            <div className="absolute bottom-0 inset-x-0 h-[3px] rounded-full" style={{ background: `linear-gradient(90deg, ${acc}88, ${acc}33)` }} />
          </div>
        ))}
      </div>
      {/* haz de polvo dorado */}
      <div
        className="absolute right-[6%] top-0 w-16 h-[70%] opacity-40"
        style={{ background: `linear-gradient(200deg, ${acc}55, transparent 70%)`, clipPath: "polygon(40% 0, 100% 0, 60% 100%, 0 100%)", filter: "blur(2px)" }}
        aria-hidden
      />
    </>
  );
}

function EscenaComando({ acc }: { acc: string }) {
  return (
    <>
      <Cielo acc={acc} lunaX={86} lunaY={14} lunaR={9} />
      {/* mesa de guerra con líneas de contorno y pines */}
      <div
        className="absolute left-1/2 bottom-[12%] -translate-x-1/2 w-[64%] h-[38%] rounded-[50%] border-2"
        style={{ borderColor: `${acc}66`, background: `radial-gradient(90% 80% at 50% 40%, ${acc}22, rgba(7,7,12,0.95))`, boxShadow: `0 0 30px -10px ${acc}66` }}
        aria-hidden
      >
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 50" preserveAspectRatio="none" aria-hidden>
          <ellipse cx="50" cy="25" rx="30" ry="12" fill="none" stroke={`${acc}55`} strokeWidth="0.6" strokeDasharray="3 2" />
          <ellipse cx="44" cy="27" rx="18" ry="7" fill="none" stroke={`${acc}44`} strokeWidth="0.5" />
          <path d="M8,32 Q30,18 52,26 T94,20" fill="none" stroke={`${acc}77`} strokeWidth="0.8" strokeDasharray="4 3" />
        </svg>
        {/* pines con halos */}
        {[[30, 34], [58, 42], [70, 30]].map(([x, y], i) => (
          <span
            key={i}
            className={cn("absolute w-2 h-2 rounded-full", i === 0 && "v108-latido")}
            style={{ left: `${x}%`, top: `${y}%`, background: i === 0 ? acc : "#FF6B5A", boxShadow: `0 0 10px ${i === 0 ? acc : "#FF6B5A"}` }}
            aria-hidden
          />
        ))}
      </div>
      {/* holograma cónico sobre la mesa */}
      <div
        className="absolute left-1/2 bottom-[48%] -translate-x-1/2 w-24 h-14 opacity-50"
        style={{ background: `conic-gradient(from 180deg at 50% 100%, transparent 40%, ${acc}66 50%, transparent 60%)`, clipPath: "polygon(35% 100%, 65% 100%, 92% 0, 8% 0)" }}
        aria-hidden
      />
    </>
  );
}

function EscenaObservatorio({ acc }: { acc: string }) {
  return (
    <>
      <Cielo acc={acc} lunaX={20} lunaY={18} lunaR={11} />
      {/* cúpula con rendija y telescopio asomando */}
      <div className="absolute left-1/2 bottom-0 -translate-x-1/2 w-[52%] h-[52%]" aria-hidden>
        <div
          className="absolute inset-0 rounded-t-[999px]"
          style={{ background: `linear-gradient(180deg, ${acc}24, rgba(7,7,12,0.97) 66%)`, border: `2px solid ${acc}66`, borderBottom: "none", boxShadow: `0 0 30px -8px ${acc}55` }}
        />
        {/* rendija abierta al cielo */}
        <div className="absolute left-[54%] top-0 w-[14%] h-[46%]" style={{ background: `linear-gradient(180deg, ${acc}55, rgba(7,7,12,0.6))`, borderRadius: "0 999px 0 0" }} aria-hidden />
        {/* tubo del telescopio saliendo por la rendija */}
        <div
          className="absolute left-[58%] top-[8%] w-[42%] h-[9px] rounded-full origin-left"
          style={{ background: `linear-gradient(90deg, #1A1A24, ${acc}CC)`, transform: "rotate(-28deg)", boxShadow: `0 0 16px -4px ${acc}` }}
          aria-hidden
        />
        <Ventanas n={4} acc={acc} top="62%" h={999} flicker={false} />
      </div>
      {/* cinta de aurora */}
      <div
        className="absolute inset-x-0 top-[10%] h-8 opacity-45"
        style={{ background: `linear-gradient(90deg, transparent, ${acc}88, #A78BFA66, transparent)`, filter: "blur(3px)", transform: "rotate(-4deg)" }}
        aria-hidden
      />
    </>
  );
}

function EscenaEstrategia({ acc }: { acc: string }) {
  return (
    <>
      <Cielo acc={acc} lunaX={84} lunaY={16} lunaR={10} />
      {/* mapa táctico con rejilla */}
      <div
        className="absolute inset-x-[10%] bottom-[12%] top-[26%] rounded-sm border"
        style={{
          borderColor: `${acc}55`, background: `linear-gradient(160deg, ${acc}14, rgba(7,7,12,0.94))`,
          backgroundImage: `linear-gradient(${acc}14 1px, transparent 1px), linear-gradient(90deg, ${acc}14 1px, transparent 1px)`,
          backgroundSize: "22px 22px",
        }}
        aria-hidden
      >
        {/* línea del frente */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 60" preserveAspectRatio="none" aria-hidden>
          <path d="M6,44 Q28,30 50,38 T96,22" fill="none" stroke={`${acc}AA`} strokeWidth="1" strokeDasharray="4 3" />
          {/* flechas de empuje */}
          <path d="M14,50 L38,42" stroke="#FF6B5A" strokeWidth="1.4" markerEnd="url(#f108a)" />
          <path d="M84,12 L60,26" stroke="#4ADE80" strokeWidth="1.4" markerEnd="url(#f108v)" />
          <defs>
            <marker id="f108a" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#FF6B5A" /></marker>
            <marker id="f108v" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#4ADE80" /></marker>
          </defs>
        </svg>
        {/* piezas de mando */}
        {[[24, 62], [64, 30]].map(([x, y], i) => (
          <span
            key={i}
            className={cn("absolute w-3 h-3 rotate-45 border-2", i === 0 && "v108-latido")}
            style={{ left: `${x}%`, top: `${y}%`, borderColor: i === 0 ? acc : "#4ADE80", background: `${i === 0 ? acc : "#4ADE80"}33`, animationDelay: `${i * 0.9}s` }}
            aria-hidden
          />
        ))}
      </div>
    </>
  );
}

function EscenaEmisora({ acc }: { acc: string }) {
  return (
    <>
      <Cielo acc={acc} lunaX={16} lunaY={18} lunaR={9} />
      {/* torre de emisión con ondas */}
      <div className="absolute left-[24%] bottom-0" aria-hidden>
        <div className="w-1.5 h-20 mx-auto" style={{ background: `linear-gradient(180deg, ${acc}, #2A2A36)` }} />
        {[26, 20].map((y, i) => (
          <span key={i} className="absolute left-1/2 -translate-x-1/2 w-8 h-[1.5px]" style={{ top: y, background: `${acc}66` }} />
        ))}
        {/* ondas vivas */}
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="v108-onda absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full border-2"
            style={{ borderColor: `${acc}88`, animationDelay: `${i * 0.9}s` }}
            aria-hidden
          />
        ))}
      </div>
      {/* pantallas del canal con play */}
      <div className="absolute right-[10%] bottom-[16%] w-[36%]" aria-hidden>
        <div
          className="aspect-video rounded-md border flex items-center justify-center"
          style={{ borderColor: `${acc}66`, background: `linear-gradient(160deg, ${acc}2A, rgba(7,7,12,0.95))`, boxShadow: `0 0 26px -8px ${acc}66` }}
        >
          <span className="v108-latido w-0 h-0 ml-1" style={{ borderTop: "7px solid transparent", borderBottom: "7px solid transparent", borderLeft: `12px solid ${acc}` }} />
        </div>
        <div className="mt-1 h-[3px] rounded-full" style={{ width: "70%", background: `${acc}55` }} />
        <div className="mt-1 h-[3px] rounded-full" style={{ width: "42%", background: `${acc}33` }} />
      </div>
      {/* cartel EN VIVO */}
      <div
        className="absolute right-[8%] top-[14%] px-1.5 py-0.5 rounded-[2px] font-mono text-[6px] font-black tracking-[0.2em] flex items-center gap-1"
        style={{ color: "#FF3B30", border: "1px solid #FF3B3088", background: "rgba(255,59,48,0.12)" }}
        aria-hidden
      >
        <span className="v108-latido w-1 h-1 rounded-full bg-[#FF3B30]" /> EN VIVO
      </div>
    </>
  );
}

function EscenaOscsuro({ acc }: { acc: string }) {
  return (
    <>
      <Cielo acc={acc} lunaX={88} lunaY={22} lunaR={8} />
      {/* niebla roja baja */}
      <div className="absolute inset-x-0 bottom-0 h-1/2" style={{ background: `radial-gradient(120% 100% at 50% 120%, ${acc}33, transparent 70%)` }} aria-hidden />
      {/* expediente tachado */}
      <div
        className="absolute left-1/2 top-[16%] -translate-x-1/2 w-[44%] rounded-sm border rotate-[-2deg] p-2 space-y-1.5"
        style={{ borderColor: `${acc}55`, background: "rgba(10,8,8,0.94)", boxShadow: `0 0 26px -10px ${acc}66` }}
        aria-hidden
      >
        {[82, 64, 74].map((w, i) => (
          <div key={i} className="relative h-[4px] rounded-full" style={{ width: `${w}%`, background: "#3A2A2A" }}>
            {i === 1 && <span className="absolute inset-y-0 left-0 w-full" style={{ background: acc, transform: "scaleY(0.9)", opacity: 0.85 }} />}
          </div>
        ))}
        <div className="pt-1 flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full border-2" style={{ borderColor: acc }} aria-hidden />
          <span className="h-[3px] flex-1 rounded-full" style={{ background: `${acc}44` }} aria-hidden />
        </div>
      </div>
      {/* ojo que vigila entre la niebla */}
      <div className="absolute right-[10%] bottom-[20%] opacity-80" aria-hidden>
        <div className="v108-latido w-6 h-3 rounded-[50%] border" style={{ borderColor: `${acc}99` }} />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full" style={{ background: acc, boxShadow: `0 0 10px ${acc}` }} />
      </div>
    </>
  );
}

function EscenaCreadores({ acc }: { acc: string }) {
  return (
    <>
      <Cielo acc={acc} lunaX={82} lunaY={18} lunaR={10} />
      {/* caballete con obra en progreso */}
      <div className="absolute left-[22%] bottom-0" aria-hidden>
        <div className="w-[52px] sm:w-[64px] aspect-[4/5] rounded-sm border rotate-[-3deg] relative overflow-hidden" style={{ borderColor: `${acc}66`, background: `linear-gradient(160deg, ${acc}2E, rgba(9,7,12,0.96))`, boxShadow: `0 0 28px -10px ${acc}66` }}>
          <span className="absolute left-2 top-2 w-4 h-4 rounded-full" style={{ background: `${acc}AA` }} />
          <span className="absolute right-2 top-4 w-3 h-3 rotate-45" style={{ background: "#5EEAD499" }} />
          <span className="absolute left-3 bottom-3 w-6 h-[3px] rounded-full" style={{ background: "#FFC94D99" }} />
          <span className="v108-estrella absolute right-3 bottom-5 w-2 h-2 rotate-45" style={{ background: acc }} />
        </div>
        <div className="mx-auto w-1.5 h-9" style={{ background: "#3A3A48" }} />
        <div className="mx-auto w-10 h-1.5 rounded-full" style={{ background: "#2A2A36" }} />
      </div>
      {/* chispas de creación */}
      {[[62, 30], [72, 44], [58, 56], [80, 24]].map(([x, y], i) => (
        <span
          key={i}
          className="v108-estrella absolute text-[10px] font-black"
          style={{ left: `${x}%`, top: `${y}%`, color: i % 2 ? "#FFC94D" : acc, animationDelay: `${i * 0.6}s` }}
          aria-hidden
        >
          +
        </span>
      ))}
      {/* pinceladas de la comunidad */}
      <div className="absolute inset-x-[56%] bottom-[14%] h-2 rounded-full rotate-[-6deg]" style={{ background: `linear-gradient(90deg, ${acc}88, transparent)` }} aria-hidden />
    </>
  );
}

function EscenaSocial({ acc }: { acc: string }) {
  return (
    <>
      <Cielo acc={acc} lunaX={86} lunaY={20} lunaR={10} />
      {/* globo de la comunidad */}
      <div
        className="absolute left-[10%] bottom-[18%] w-16 h-16 rounded-full border-2 opacity-90"
        style={{ borderColor: `${acc}77`, background: `radial-gradient(circle at 34% 30%, ${acc}33, rgba(8,8,13,0.9))`, boxShadow: `0 0 26px -8px ${acc}55` }}
        aria-hidden
      >
        <span className="absolute inset-x-0 top-1/2 h-px" style={{ background: `${acc}66` }} />
        <span className="absolute inset-y-0 left-1/2 w-px rounded-full" style={{ background: `${acc}44` }} />
        <span className="v108-latido absolute w-1.5 h-1.5 rounded-full" style={{ left: "60%", top: "30%", background: acc, boxShadow: `0 0 8px ${acc}` }} />
      </div>
      {/* burbujas de conversación */}
      <div className="absolute right-[8%] top-[20%] w-[42%] space-y-2" aria-hidden>
        <div className="ml-auto max-w-[80%] rounded-lg rounded-br-none border px-2 py-1.5" style={{ borderColor: `${acc}55`, background: `${acc}1F` }}>
          <span className="block h-[3px] w-4/5 rounded-full" style={{ background: `${acc}88` }} />
          <span className="block mt-1 h-[3px] w-3/5 rounded-full" style={{ background: `${acc}44` }} />
        </div>
        <div className="max-w-[76%] rounded-lg rounded-bl-none border px-2 py-1.5" style={{ borderColor: "#FFFFFF22", background: "rgba(16,16,24,0.94)" }}>
          <span className="block h-[3px] w-3/4 rounded-full bg-white/25" />
          <span className="block mt-1 h-[3px] w-1/2 rounded-full bg-white/15" />
        </div>
        {/* avatares */}
        <div className="flex gap-1 pt-1">
          {["#FF6B5A", "#4ADE80", "#5EEAD4"].map((c, i) => (
            <span key={i} className={cn("w-4 h-4 rounded-full border-2", i === 1 && "v108-latido")} style={{ borderColor: c, background: `${c}33`, animationDelay: `${i * 0.8}s` }} />
          ))}
          <span className="w-4 h-4 rounded-full border border-dashed" style={{ borderColor: `${acc}66` }} />
        </div>
      </div>
    </>
  );
}

function EscenaSistema({ acc }: { acc: string }) {
  return (
    <>
      <Cielo acc={acc} lunaX={14} lunaY={18} lunaR={9} />
      {/* núcleo hexagonal con anillos orbitales */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[42%]" aria-hidden>
        <div
          className="v108-latido w-14 h-14"
          style={{
            clipPath: "polygon(50% 0, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
            background: `linear-gradient(160deg, ${acc}55, ${acc}18)`,
            border: "none",
            boxShadow: `0 0 34px -6px ${acc}88`,
          }}
        />
        {[0, 1].map((i) => (
          <span
            key={i}
            className="absolute left-1/2 top-1/2 rounded-[50%] border"
            style={{
              width: 64 + i * 22, height: (64 + i * 22) * 0.42,
              transform: `translate(-50%, -50%) rotate(${i ? 62 : -18}deg)`,
              borderColor: `${acc}55`,
            }}
            aria-hidden
          />
        ))}
        <span className="v108-estrella absolute left-1/2 top-1/2 w-1.5 h-1.5 rounded-full" style={{ background: acc, boxShadow: `0 0 12px ${acc}`, transform: "translate(-50%,-50%)" }} aria-hidden />
      </div>
      {/* escudos de la fortaleza */}
      {[18, 84].map((x, i) => (
        <div key={i} className="absolute bottom-[16%]" style={{ left: `${x}%` }} aria-hidden>
          <div
            className="w-5 h-6 border-2"
            style={{
              clipPath: "polygon(50% 0, 100% 14%, 100% 62%, 50% 100%, 0 62%, 0 14%)",
              background: `${acc}22`, borderColor: "transparent",
              boxShadow: `inset 0 0 12px -4px ${acc}`,
            }}
          />
        </div>
      ))}
    </>
  );
}

function EscenaNueva({ acc }: { acc: string }) {
  return (
    <>
      <Cielo acc={acc} lunaX={50} lunaY={22} lunaR={12} />
      {/* el portal de oro: aquí se elige el destino */}
      <div className="absolute left-1/2 bottom-0 -translate-x-1/2 w-[54%] h-[56%]" aria-hidden>
        <div
          className="absolute inset-0 rounded-t-[999px] border-2"
          style={{ borderColor: `${acc}AA`, background: `linear-gradient(180deg, ${acc}26, rgba(8,8,13,0.9) 70%)`, boxShadow: `0 0 40px -8px ${acc}88, inset 0 0 30px -12px ${acc}66` }}
        />
        <div
          className="absolute left-1/2 top-[30%] -translate-x-1/2 -translate-y-1/2 w-5 h-5 rotate-45 border-2"
          style={{ borderColor: acc, boxShadow: `0 0 18px ${acc}88` }}
          aria-hidden
        />
        {/* camino de luz hacia el portal */}
        <div className="absolute inset-x-[30%] bottom-0 h-1.5 rounded-full" style={{ background: `linear-gradient(90deg, transparent, ${acc}AA, transparent)` }} aria-hidden />
      </div>
      {/* brújula de mundos orbitando */}
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="v108-estrella absolute w-1.5 h-1.5 rounded-full"
          style={{ left: `${22 + i * 28}%`, top: `${58 - (i % 2) * 14}%`, background: i === 1 ? "#5EEAD4" : acc, boxShadow: `0 0 10px ${i === 1 ? "#5EEAD4" : acc}`, animationDelay: `${i * 0.7}s` }}
          aria-hidden
        />
      ))}
    </>
  );
}

const ESCENAS: Record<string, (p: { acc: string }) => React.ReactNode> = {
  inicio: EscenaInicio,
  nueva: EscenaNueva,
  hangar: EscenaHangar,
  inteligencia: EscenaInteligencia,
  juego: EscenaJuego,
  mercado: EscenaMercado,
  archivo: EscenaArchivo,
  comando: EscenaComando,
  observatorio: EscenaObservatorio,
  estrategia: EscenaEstrategia,
  emisora: EscenaEmisora,
  oscsuro: EscenaOscsuro,
  creadores: EscenaCreadores,
  social: EscenaSocial,
  sistema: EscenaSistema,
};

// ---------- PORTADA DE MUNDO (sección) ----------
// La escena completa del lugar — para el mega-menú, la nueva pestaña y la vista
// previa. CSS puro: se ve el lugar en sí, no una foto de nadie.
export function PortadaMundo({ mundo, className }: { mundo: string; className?: string }) {
  const acc = accentOfSection(mundo);
  const Escena = ESCENAS[mundo] ?? EscenaInicio;
  return (
    <div data-portada={mundo} aria-hidden className={cn("relative overflow-hidden select-none pointer-events-none", className)}>
      <Escena acc={acc} />
      {/* velo inferior: el texto de la tarjeta siempre legible */}
      <div className="absolute inset-x-0 bottom-0 h-1/2" style={{ background: "linear-gradient(180deg, transparent, rgba(6,6,10,0.82))" }} />
      {/* destello al pasar (transform puro, como la casa manda) */}
      <div className="portada-destello" />
    </div>
  );
}

// ---------- VITRINA DE SALA (subsección) ----------
// La portada de cada PESTAÑA dentro de su mundo: mini-escena del lugar + icono
// + nombre. Así "ves qué hay en cada una" antes de entrar. Modo "mini" para
// vistas previas y buscador; modo "card" para el mega-menú.
export function VitrinaSala({
  tab,
  modo = "card",
  alias,
  className,
}: {
  tab: TabKey;
  modo?: "card" | "mini";
  alias?: string;
  className?: string;
}) {
  const { t, lang } = useT();
  const def = TABS[tab];
  if (!def) return null;
  const mundo = sectionOfTab(tab);
  const acc = accentOfSection(mundo.key);
  const nombre = alias || tabLabel(lang, tab, def.label).split(" (")[0];
  return (
    <div
      data-vitrina={tab}
      className={cn(
        "group/v relative overflow-hidden rounded-md border text-left",
        className
      )}
      style={{ borderColor: `${acc}44`, background: "rgba(8,8,13,0.9)" }}
    >
      {/* mini-escena del lugar: cielo + luna + horizonte del mundo */}
      <div className="absolute inset-0" aria-hidden>
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #06060b 0%, ${acc}18 90%, ${acc}30 100%)` }} />
        <span
          className="absolute rounded-full"
          style={{
            right: "8%", top: "12%", width: 14, height: 14,
            background: "radial-gradient(circle at 38% 34%, #FFF7E0, #FFE9B8 55%, #F5D48A 100%)",
            boxShadow: "0 0 16px 4px rgba(255,233,184,0.18)",
          }}
        />
        <span className="v108-estrella absolute rounded-full bg-white" style={{ left: "18%", top: "22%", width: 1.5, height: 1.5 }} />
        <span className="v108-estrella absolute rounded-full bg-white" style={{ left: "38%", top: "12%", width: 1, height: 1, animationDelay: "0.8s" }} />
        <span className="v108-estrella absolute rounded-full bg-white" style={{ left: "58%", top: "30%", width: 1.2, height: 1.2, animationDelay: "1.4s" }} />
        {/* silueta del horizonte */}
        <div
          className="absolute inset-x-0 bottom-0 h-[38%]"
          style={{ background: `linear-gradient(180deg, transparent, rgba(6,6,10,0.95))`, borderTop: `1px solid ${acc}44` }}
        />
        <div className="absolute inset-x-0 bottom-0 h-[30%]" style={{ background: `radial-gradient(110% 100% at 50% 130%, ${acc}44, transparent 70%)` }} />
      </div>
      {/* icono de la sala, grande, del acento del mundo */}
      <div className="relative h-full flex flex-col justify-end p-2">
        <span
          className={cn(
            "rounded-md flex items-center justify-center border",
            modo === "card" ? "w-7 h-7" : "w-5 h-5"
          )}
          style={{ borderColor: `${acc}66`, color: acc, background: `linear-gradient(150deg, ${acc}30, rgba(6,6,10,0.92))`, boxShadow: `0 0 14px -4px ${acc}88` }}
        >
          {def.icon}
        </span>
        <span
          className={cn(
            "mt-1.5 font-display font-black tracking-wider leading-tight line-clamp-2",
            modo === "card" ? "text-[9px]" : "text-[8px]"
          )}
          style={{ color: acc, textShadow: `0 0 12px ${acc}44` }}
        >
          {nombre}
        </span>
        {modo === "card" && (
          <span className="font-mono text-[7px] uppercase tracking-[0.18em] text-muted-foreground/80 truncate">
            {t(`sec.${mundo.key}`)}
          </span>
        )}
      </div>
      {/* brillo al pasar */}
      <div className="absolute inset-0 opacity-0 group-hover/v:opacity-100 transition-opacity duration-200 pointer-events-none" style={{ background: `radial-gradient(90% 70% at 50% 110%, ${acc}30, transparent 70%)` }} aria-hidden />
    </div>
  );
}
