"use client";

// ============================================================
// VANGUARD v170.0 — ARTE PROCEDURAL DE FICHAS (SVG puro)
// Cero imágenes externas: cada ficha se dibuja con vectores
// generados en cliente. Marcos por rareza, holo para
// LEGENDARIO+, prisma animado para ÚNICAS 1/1.
// ============================================================

import { useMemo } from "react";
import {
  type DefFicha,
  type FichaInstancia,
  type PaletaFicha,
  type RarezaFicha,
  type Sobre,
  CATEGORIA_META,
  PALETAS,
  RAREZA_META,
} from "@/lib/vanguard/fichas";

// ── Fondo común: cielo + halo + rayos + estrellas ────────────
function Fondo({ p, idp }: { p: PaletaFicha; idp: string }) {
  const rayos = useMemo(
    () =>
      [-155, -115, -75, -35, 5, 45, 85, 125].map((ang) => {
        const rad = (ang * Math.PI) / 180;
        return { x2: 100 + Math.cos(rad) * 150, y2: 108 + Math.sin(rad) * 150 };
      }),
    []
  );
  const estrellas: [number, number, number][] = [
    [22, 38, 1.2], [52, 22, 0.9], [162, 30, 1.1], [182, 66, 0.8], [30, 84, 0.9],
    [176, 112, 1.0], [24, 146, 0.8], [156, 178, 0.9], [58, 214, 1.0], [146, 228, 0.8],
    [86, 30, 0.7], [126, 20, 0.8],
  ];
  return (
    <>
      <defs>
        <linearGradient id={`${idp}-cielo`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.cieloA} />
          <stop offset="1" stopColor={p.cieloB} />
        </linearGradient>
        <radialGradient id={`${idp}-halo`} cx="0.5" cy="0.4" r="0.8">
          <stop offset="0" stopColor={p.luz} stopOpacity="0.4" />
          <stop offset="0.55" stopColor={p.mid} stopOpacity="0.14" />
          <stop offset="1" stopColor={p.mid} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${idp}-metal`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={p.luz} />
          <stop offset="0.5" stopColor={p.mid} />
          <stop offset="1" stopColor={p.sombra} />
        </linearGradient>
      </defs>
      <rect width="200" height="260" fill={`url(#${idp}-cielo)`} />
      <rect width="200" height="260" fill={`url(#${idp}-halo)`} />
      <g opacity="0.3" stroke={p.luz} strokeWidth="0.6">
        {rayos.map((r, i) => (
          <line key={i} x1="100" y1="108" x2={r.x2} y2={r.y2} />
        ))}
      </g>
      <g fill={p.luz}>
        {estrellas.map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} opacity={0.25 + (i % 3) * 0.15} />
        ))}
      </g>
    </>
  );
}

// ============================================================
// ARMAS
// ============================================================
function ArmaEspada({ p, idp }: { p: PaletaFicha; idp: string }) {
  return (
    <g transform="rotate(-16 100 130)">
      <path d="M100 30 L109 88 L105 178 L95 178 L91 88 Z" fill={`url(#${idp}-metal)`} stroke={p.luz} strokeWidth="1" />
      <line x1="100" y1="42" x2="100" y2="172" stroke={p.luz} strokeWidth="0.8" opacity="0.7" />
      <path d="M70 182 L130 182 L125 191 L75 191 Z" fill={`url(#${idp}-metal)`} stroke={p.luz} strokeWidth="1" />
      <rect x="96.5" y="191" width="7" height="26" rx="2" fill={p.sombra} stroke={p.luz} strokeWidth="0.8" />
      <circle cx="100" cy="223" r="6" fill={`url(#${idp}-metal)`} stroke={p.luz} strokeWidth="0.8" />
      <circle cx="100" cy="60" r="34" fill={p.luz} opacity="0.08" />
    </g>
  );
}

function ArmaLanza({ p, idp }: { p: PaletaFicha; idp: string }) {
  return (
    <g transform="rotate(9 100 130)">
      <rect x="97.5" y="54" width="5" height="168" rx="2" fill={`url(#${idp}-metal)`} stroke={p.luz} strokeWidth="0.7" />
      <path d="M100 24 L113 62 L100 53 L87 62 Z" fill={`url(#${idp}-metal)`} stroke={p.luz} strokeWidth="1" />
      <path d="M100 56 L108 78 L100 72 L92 78 Z" fill={p.mid} opacity="0.9" />
      <rect x="93" y="122" width="14" height="4.5" rx="2" fill={p.luz} opacity="0.8" />
      <rect x="93" y="178" width="14" height="4.5" rx="2" fill={p.luz} opacity="0.8" />
    </g>
  );
}

function ArmaDaga({ p, idp }: { p: PaletaFicha; idp: string }) {
  return (
    <g transform="rotate(-14 100 140)">
      <path d="M100 76 L111 132 L104 188 L96 188 L89 132 Z" fill={`url(#${idp}-metal)`} stroke={p.luz} strokeWidth="1" />
      <line x1="82" y1="128" x2="118" y2="128" stroke={p.luz} strokeWidth="4" strokeLinecap="round" />
      <rect x="96.5" y="188" width="7" height="10" fill={p.sombra} stroke={p.luz} strokeWidth="0.7" />
      <circle cx="100" cy="206" r="11" fill="none" stroke={p.luz} strokeWidth="3.2" />
      <circle cx="100" cy="140" r="40" fill={p.luz} opacity="0.07" />
    </g>
  );
}

function ArmaHacha({ p, idp }: { p: PaletaFicha; idp: string }) {
  return (
    <g transform="rotate(7 100 130)">
      <rect x="97" y="46" width="6" height="168" rx="2" fill={`url(#${idp}-metal)`} stroke={p.luz} strokeWidth="0.7" />
      <path d="M100 58 C138 54 154 78 152 106 C140 96 120 92 100 96 Z" fill={`url(#${idp}-metal)`} stroke={p.luz} strokeWidth="1" />
      <path d="M100 58 C62 54 46 78 48 106 C60 96 80 92 100 96 Z" fill={`url(#${idp}-metal)`} stroke={p.luz} strokeWidth="1" />
      <circle cx="100" cy="77" r="5.5" fill={p.sombra} stroke={p.luz} strokeWidth="1" />
    </g>
  );
}

function ArmaMartillo({ p, idp }: { p: PaletaFicha; idp: string }) {
  return (
    <g transform="rotate(-8 100 130)">
      <rect x="96" y="70" width="8" height="142" rx="2" fill={`url(#${idp}-metal)`} stroke={p.luz} strokeWidth="0.7" />
      <rect x="64" y="44" width="72" height="36" rx="7" fill={`url(#${idp}-metal)`} stroke={p.luz} strokeWidth="1.1" />
      <rect x="57" y="52" width="9" height="20" rx="2" fill={p.mid} stroke={p.luz} strokeWidth="0.8" />
      <rect x="134" y="52" width="9" height="20" rx="2" fill={p.mid} stroke={p.luz} strokeWidth="0.8" />
      <circle cx="82" cy="62" r="2.6" fill={p.luz} />
      <circle cx="118" cy="62" r="2.6" fill={p.luz} />
    </g>
  );
}

function ArmaArco({ p, idp }: { p: PaletaFicha; idp: string }) {
  return (
    <g>
      <path d="M60 48 C134 84 134 176 60 212" fill="none" stroke={`url(#${idp}-metal)`} strokeWidth="7" strokeLinecap="round" />
      <path d="M60 48 C134 84 134 176 60 212" fill="none" stroke={p.luz} strokeWidth="1.2" opacity="0.6" />
      <line x1="60" y1="48" x2="60" y2="212" stroke={p.luz} strokeWidth="1.1" />
      <line x1="66" y1="130" x2="152" y2="130" stroke={p.luz} strokeWidth="2.2" />
      <path d="M152 130 L139 123.5 L139 136.5 Z" fill={p.luz} />
      <path d="M66 130 L79 123 M66 130 L79 137" stroke={p.luz} strokeWidth="1.4" />
      <circle cx="100" cy="130" r="44" fill={p.luz} opacity="0.06" />
    </g>
  );
}

function ArmaEscudo({ p, idp }: { p: PaletaFicha; idp: string }) {
  return (
    <g>
      <path d="M100 40 C132 54 152 56 160 56 C160 128 138 188 100 214 C62 188 40 128 40 56 C48 56 68 54 100 40 Z" fill={`url(#${idp}-metal)`} stroke={p.luz} strokeWidth="1.6" />
      <path d="M100 56 C124 66 138 68 146 68 C146 126 128 174 100 196 C72 174 54 126 54 68 C62 68 76 66 100 56 Z" fill="none" stroke={p.luz} strokeWidth="1" opacity="0.55" />
      <path d="M100 72 L100 100 M100 136 L100 164 M64 118 L84 118 M116 118 L136 118" stroke={p.luz} strokeWidth="3.2" strokeLinecap="round" opacity="0.85" />
      <circle cx="100" cy="118" r="15" fill={p.sombra} stroke={p.luz} strokeWidth="1.4" />
      <circle cx="100" cy="118" r="5.5" fill={p.luz} opacity="0.95" />
    </g>
  );
}

function ArmaGuadana({ p, idp }: { p: PaletaFicha; idp: string }) {
  return (
    <g transform="rotate(-5 100 130)">
      <rect x="97" y="62" width="6" height="152" rx="2" transform="rotate(12 100 138)" fill={`url(#${idp}-metal)`} stroke={p.luz} strokeWidth="0.7" />
      <path d="M103 56 C152 62 170 110 156 154 C148 118 128 92 101 86 Z" fill={`url(#${idp}-metal)`} stroke={p.luz} strokeWidth="1.2" />
      <path d="M112 74 C140 86 152 112 152 136" fill="none" stroke={p.luz} strokeWidth="0.8" opacity="0.6" />
      <circle cx="100" cy="74" r="5" fill={p.sombra} stroke={p.luz} strokeWidth="0.9" />
    </g>
  );
}

function ArmaCetro({ p, idp }: { p: PaletaFicha; idp: string }) {
  return (
    <g>
      <rect x="97" y="98" width="6" height="124" rx="2" fill={`url(#${idp}-metal)`} stroke={p.luz} strokeWidth="0.7" />
      <rect x="92" y="152" width="16" height="4.5" rx="2" fill={p.luz} opacity="0.85" />
      <circle cx="100" cy="76" r="21" fill={p.mid} stroke={p.luz} strokeWidth="1.4" />
      <circle cx="100" cy="76" r="12" fill={p.luz} opacity="0.5" />
      <circle cx="93" cy="69" r="4" fill="#ffffff" opacity="0.85" />
      <path d="M74 62 C82 46 118 46 126 62 C118 56 82 56 74 62 Z" fill={`url(#${idp}-metal)`} stroke={p.luz} strokeWidth="0.9" />
      <path d="M84 98 L70 114 M116 98 L130 114" stroke={p.luz} strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="100" cy="76" r="34" fill={p.luz} opacity="0.08" />
    </g>
  );
}

function ArmaGuante({ p, idp }: { p: PaletaFicha; idp: string }) {
  return (
    <g>
      <path d="M100 30 C112 50 122 60 117 78 C113 90 106 94 100 98 C94 94 87 90 83 78 C78 60 88 50 100 30 Z" fill={p.mid} opacity="0.9" />
      <path d="M100 54 C106 66 110 72 108 82 C106 89 103 91 100 93 C97 91 94 89 92 82 C90 72 94 66 100 54 Z" fill={p.luz} opacity="0.85" />
      <rect x="70" y="104" width="60" height="64" rx="13" fill={`url(#${idp}-metal)`} stroke={p.luz} strokeWidth="1.3" />
      <rect x="70" y="104" width="60" height="15" rx="7" fill={p.sombra} stroke={p.luz} strokeWidth="0.9" />
      <path d="M84 134 L84 158 M100 134 L100 160 M116 134 L116 158" stroke={p.luz} strokeWidth="1.5" opacity="0.7" />
      <rect x="78" y="168" width="44" height="12" rx="4" fill={p.sombra} stroke={p.luz} strokeWidth="0.9" />
      <rect x="88" y="180" width="24" height="34" rx="3" fill={`url(#${idp}-metal)`} stroke={p.luz} strokeWidth="0.9" />
    </g>
  );
}

function ArmaBallesta({ p, idp }: { p: PaletaFicha; idp: string }) {
  return (
    <g>
      <path d="M50 96 C74 74 126 74 150 96" fill="none" stroke={`url(#${idp}-metal)`} strokeWidth="6" strokeLinecap="round" />
      <line x1="50" y1="96" x2="150" y2="96" stroke={p.luz} strokeWidth="1.1" />
      <rect x="94" y="88" width="12" height="114" rx="3" fill={`url(#${idp}-metal)`} stroke={p.luz} strokeWidth="0.8" />
      <line x1="100" y1="92" x2="100" y2="62" stroke={p.luz} strokeWidth="2.4" />
      <path d="M100 58 L107 71 L93 71 Z" fill={p.luz} />
      <rect x="86" y="142" width="28" height="10" rx="3" fill={p.sombra} stroke={p.luz} strokeWidth="0.8" />
      <circle cx="100" cy="120" r="40" fill={p.luz} opacity="0.06" />
    </g>
  );
}

const ARMAS = {
  espada: ArmaEspada,
  lanza: ArmaLanza,
  daga: ArmaDaga,
  hacha: ArmaHacha,
  martillo: ArmaMartillo,
  arco: ArmaArco,
  escudo: ArmaEscudo,
  guadana: ArmaGuadana,
  cetro: ArmaCetro,
  guante: ArmaGuante,
  ballesta: ArmaBallesta,
};

// ============================================================
// ADORNOS traseros de bustos
// ============================================================
function AdornoTrasero({ tipo, p }: { tipo: string; p: PaletaFicha }) {
  switch (tipo) {
    case "luna":
      return (
        <g opacity="0.4">
          <circle cx="100" cy="112" r="62" fill={p.luz} />
          <circle cx="126" cy="96" r="52" fill={p.cieloA} />
        </g>
      );
    case "espejo":
      return (
        <g>
          <ellipse cx="100" cy="118" rx="46" ry="62" fill={p.mid} opacity="0.2" />
          <ellipse cx="100" cy="118" rx="46" ry="62" fill="none" stroke={p.luz} strokeWidth="4" opacity="0.7" />
          <line x1="78" y1="150" x2="122" y2="86" stroke="#ffffff" strokeWidth="2" opacity="0.5" />
        </g>
      );
    case "brujula":
      return (
        <g opacity="0.75">
          <circle cx="100" cy="112" r="52" fill="none" stroke={p.luz} strokeWidth="1.6" />
          <circle cx="100" cy="112" r="44" fill="none" stroke={p.luz} strokeWidth="0.6" opacity="0.6" />
          <path d="M100 68 L108 104 L144 112 L108 120 L100 156 L92 120 L56 112 L92 104 Z" fill={p.mid} stroke={p.luz} strokeWidth="0.8" />
          <circle cx="100" cy="112" r="4" fill={p.luz} />
        </g>
      );
    case "tridente":
      return (
        <g opacity="0.8" transform="rotate(14 100 120)">
          <rect x="98" y="40" width="4" height="170" fill={p.mid} stroke={p.luz} strokeWidth="0.5" />
          <path d="M84 60 L84 34 L92 34 L92 52 M100 58 L100 28 L108 28 M116 60 L116 34 L108 34" fill="none" stroke={p.luz} strokeWidth="4" />
          <path d="M100 26 L106 40 L94 40 Z" fill={p.luz} />
        </g>
      );
    case "yunque":
      return (
        <g opacity="0.8">
          <path d="M50 96 L150 96 L138 116 L112 118 L112 146 L128 164 L72 164 L88 146 L88 118 L62 116 Z" fill={p.sombra} stroke={p.luz} strokeWidth="1" />
          <path d="M50 96 L150 96" stroke={p.luz} strokeWidth="1.6" />
        </g>
      );
    case "ola":
      return (
        <g opacity="0.7">
          <path d="M18 178 C40 158 58 198 80 178 C102 158 120 198 142 178 C160 162 174 186 184 176" fill="none" stroke={p.luz} strokeWidth="3.4" strokeLinecap="round" />
          <path d="M18 196 C40 178 58 214 80 196 C102 178 120 214 142 196 C160 182 174 202 184 194" fill="none" stroke={p.mid} strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="52" cy="166" r="2" fill={p.luz} />
          <circle cx="128" cy="160" r="1.8" fill={p.luz} />
        </g>
      );
    case "balanza":
      return (
        <g opacity="0.75">
          <rect x="98" y="52" width="4" height="118" fill={p.mid} stroke={p.luz} strokeWidth="0.5" />
          <rect x="70" y="168" width="60" height="7" rx="3" fill={p.sombra} stroke={p.luz} strokeWidth="0.7" />
          <line x1="58" y1="72" x2="142" y2="64" stroke={p.luz} strokeWidth="2.4" strokeLinecap="round" />
          <path d="M58 72 L46 96 L70 96 Z" fill="none" stroke={p.luz} strokeWidth="1.4" />
          <path d="M142 64 L130 88 L154 88 Z" fill="none" stroke={p.luz} strokeWidth="1.4" />
        </g>
      );
    case "llama":
      return (
        <g opacity="0.85">
          <path d="M100 26 C110 44 118 54 113 70 C109 82 104 86 100 90 C96 86 91 82 87 70 C82 54 90 44 100 26 Z" fill={p.mid} opacity="0.9" />
          <path d="M100 50 C105 60 108 66 106 74 C104 80 102 82 100 84 C98 82 96 80 94 74 C92 66 95 60 100 50 Z" fill={p.luz} />
        </g>
      );
    case "hacha":
      return (
        <g opacity="0.8" transform="rotate(-20 100 120)">
          <rect x="98" y="36" width="4" height="150" fill={p.mid} stroke={p.luz} strokeWidth="0.5" />
          <path d="M100 44 C130 40 142 58 140 80 C130 72 114 70 100 73 Z" fill={p.sombra} stroke={p.luz} strokeWidth="1" />
        </g>
      );
    case "espada":
      return (
        <g opacity="0.8" transform="rotate(24 100 120)">
          <rect x="98" y="30" width="4" height="156" fill={p.mid} stroke={p.luz} strokeWidth="0.5" />
          <path d="M78 60 L122 60 L118 68 L82 68 Z" fill={p.sombra} stroke={p.luz} strokeWidth="0.7" />
        </g>
      );
    default:
      return null;
  }
}

// ============================================================
// BUSTOS de personajes
// ============================================================
function Busto({ p, idp, tocado, adorno }: { p: PaletaFicha; idp: string; tocado: string; adorno?: string }) {
  return (
    <g>
      {adorno && <AdornoTrasero tipo={adorno} p={p} />}
      <circle cx="100" cy="116" r="60" fill={p.mid} opacity="0.14" />

      {tocado === "ojodios" ? (
        <>
          <path d="M46 216 C54 178 72 162 100 158 C128 162 146 178 154 216 Z" fill={`url(#${idp}-metal)`} stroke={p.luz} strokeWidth="1.2" />
          <g>
            {[-140, -110, -80, -50, -20, 10, 40, 70].map((ang, i) => {
              const rad = (ang * Math.PI) / 180;
              return <line key={i} x1="100" y1="104" x2={100 + Math.cos(rad) * 58} y2={104 + Math.sin(rad) * 58} stroke={p.luz} strokeWidth="1" opacity="0.5" />;
            })}
            <path d="M52 104 C74 74 126 74 148 104 C126 134 74 134 52 104 Z" fill={p.sombra} stroke={p.luz} strokeWidth="1.6" />
            <circle cx="100" cy="104" r="19" fill={p.mid} stroke={p.luz} strokeWidth="1.2" />
            <circle cx="100" cy="104" r="8.5" fill={p.luz} />
            <circle cx="94" cy="97" r="3.4" fill="#ffffff" opacity="0.9" />
          </g>
        </>
      ) : (
        <>
          <path d="M46 216 C52 178 70 162 100 158 C130 162 148 178 154 216 Z" fill={`url(#${idp}-metal)`} stroke={p.luz} strokeWidth="1.2" />
          <rect x="92" y="142" width="16" height="22" fill={p.sombra} stroke={p.luz} strokeWidth="0.8" />

          {tocado === "lobo" ? (
            <>
              <path d="M74 104 L66 62 L94 88 Z" fill={`url(#${idp}-metal)`} stroke={p.luz} strokeWidth="1" />
              <path d="M126 104 L134 62 L106 88 Z" fill={`url(#${idp}-metal)`} stroke={p.luz} strokeWidth="1" />
              <path d="M100 92 C118 92 128 104 128 120 C128 138 116 148 100 148 C84 148 72 138 72 120 C72 104 82 92 100 92 Z" fill={`url(#${idp}-metal)`} stroke={p.luz} strokeWidth="1.2" />
              <path d="M100 132 L90 146 L100 151 L110 146 Z" fill={p.sombra} stroke={p.luz} strokeWidth="0.9" />
              <circle cx="89" cy="116" r="3.6" fill={p.luz} />
              <circle cx="111" cy="116" r="3.6" fill={p.luz} />
            </>
          ) : (
            <>
              <circle cx="100" cy="118" r="26" fill={`url(#${idp}-metal)`} stroke={p.luz} strokeWidth="1.2" />
              <circle cx="90" cy="116" r="3.4" fill={p.luz} />
              <circle cx="110" cy="116" r="3.4" fill={p.luz} />
              <circle cx="90" cy="116" r="7" fill={p.luz} opacity="0.3" />
              <circle cx="110" cy="116" r="7" fill={p.luz} opacity="0.3" />
            </>
          )}

          {tocado === "capucha" && (
            <path d="M100 84 C68 84 60 116 65 148 C73 133 79 128 84 126 C81 104 88 95 100 93 C112 95 119 104 116 126 C121 128 127 133 135 148 C140 116 132 84 100 84 Z" fill={p.sombra} stroke={p.luz} strokeWidth="1" />
          )}
          {tocado === "corona" && (
            <>
              <path d="M74 96 L74 72 L85 83 L93 67 L100 80 L107 67 L115 83 L126 72 L126 96 Z" fill={`url(#${idp}-metal)`} stroke={p.luz} strokeWidth="1" />
              <circle cx="100" cy="70" r="3" fill={p.luz} />
            </>
          )}
          {tocado === "casco" && (
            <path d="M72 120 C72 96 85 84 100 84 C115 84 128 96 128 120 L128 126 L113 126 L113 106 C113 99 107 95 100 95 C93 95 87 99 87 106 L87 126 L72 126 Z" fill={p.sombra} stroke={p.luz} strokeWidth="1" />
          )}
          {tocado === "cuernos" && (
            <>
              <path d="M80 100 C60 92 50 74 55 56 C62 74 72 86 86 91 Z" fill={`url(#${idp}-metal)`} stroke={p.luz} strokeWidth="1" />
              <path d="M120 100 C140 92 150 74 145 56 C138 74 128 86 114 91 Z" fill={`url(#${idp}-metal)`} stroke={p.luz} strokeWidth="1" />
            </>
          )}
        </>
      )}
    </g>
  );
}

// ============================================================
// ESCENAS de guerra
// ============================================================
function Escena({ p, idp, sub, clima }: { p: PaletaFicha; idp: string; sub: string; clima: string }) {
  const lanceros = useMemo(
    () => Array.from({ length: 7 }, (_, i) => 18 + i * 27),
    []
  );
  return (
    <g>
      {/* astro */}
      <circle cx="146" cy="62" r="26" fill={p.luz} opacity="0.22" />
      <circle cx="146" cy="62" r="17" fill={p.luz} opacity="0.5" />
      {/* montañas */}
      <path d="M0 152 L42 104 L80 152 Z" fill={p.sombra} opacity="0.9" />
      <path d="M54 152 L98 92 L144 152 Z" fill={p.sombra} />
      <path d="M112 152 L158 100 L200 152 Z" fill={p.sombra} opacity="0.85" />
      {/* suelo */}
      <rect x="0" y="150" width="200" height="110" fill={p.sombra} />
      <rect x="0" y="150" width="200" height="2.5" fill={p.luz} opacity="0.45" />

      {sub === "muralla" && (
        <g>
          <rect x="14" y="104" width="172" height="48" fill={`url(#${idp}-metal)`} opacity="0.95" stroke={p.luz} strokeWidth="0.9" />
          {[18, 42, 66, 90, 114, 138, 162].map((x) => (
            <rect key={x} x={x} y="96" width="14" height="10" fill={p.mid} stroke={p.luz} strokeWidth="0.6" />
          ))}
          <rect x="82" y="72" width="36" height="80" fill={p.mid} stroke={p.luz} strokeWidth="0.9" />
          <rect x="88" y="84" width="9" height="14" fill={p.sombra} />
          <rect x="104" y="84" width="9" height="14" fill={p.sombra} />
          <path d="M86 58 L86 72 M100 54 L100 72 M114 58 L114 72" stroke={p.luz} strokeWidth="1.2" />
        </g>
      )}
      {sub === "puente" && (
        <g>
          <path d="M10 150 C50 118 150 118 190 150 L190 162 C150 132 50 132 10 162 Z" fill={`url(#${idp}-metal)`} stroke={p.luz} strokeWidth="1" />
          <path d="M52 150 C52 132 148 132 148 150" fill="none" stroke={p.sombra} strokeWidth="4" />
          <path d="M18 136 L18 116 M56 126 L56 110 M100 124 L100 108 M144 126 L144 110 M182 136 L182 116" stroke={p.luz} strokeWidth="1.4" />
        </g>
      )}
      {sub === "estandarte" && (
        <g>
          <line x1="64" y1="36" x2="64" y2="160" stroke={p.luz} strokeWidth="2.4" />
          <path d="M64 42 L128 54 L64 78 Z" fill={p.mid} stroke={p.luz} strokeWidth="1" />
          <circle cx="64" cy="34" r="3.5" fill={p.luz} />
          <path d="M88 132 L88 60" stroke={p.luz} strokeWidth="1.4" opacity="0.7" />
          <path d="M88 62 L118 70 L88 82 Z" fill={p.mid} opacity="0.75" />
        </g>
      )}
      {sub === "asalto" && (
        <g>
          <path d="M30 158 L52 96 M42 160 L64 98" stroke={p.luz} strokeWidth="1.8" />
          <path d="M34 144 L46 144 M39 128 L51 128 M44 112 L56 112" stroke={p.luz} strokeWidth="1.2" />
          <path d="M148 158 L128 96 M160 160 L140 98" stroke={p.luz} strokeWidth="1.8" />
          <path d="M136 144 L148 144 M131 128 L143 128 M126 112 L138 112" stroke={p.luz} strokeWidth="1.2" />
        </g>
      )}

      {/* ejército de lanceros */}
      <g>
        {lanceros.map((x, i) => (
          <g key={x} opacity={0.9 - (i % 2) * 0.25}>
            <line x1={x} y1="186" x2={x} y2={128 - (i % 3) * 8} stroke={p.luz} strokeWidth="1.4" />
            <path d={`M${x} ${118 - (i % 3) * 8} L${x + 3.5} ${130 - (i % 3) * 8} L${x - 3.5} ${130 - (i % 3) * 8} Z`} fill={p.luz} />
            <circle cx={x} cy="196" r="4.4" fill={p.mid} />
            <path d={`M${x - 7} 210 L${x} 199 L${x + 7} 210 Z`} fill={p.mid} opacity="0.85" />
          </g>
        ))}
      </g>

      {/* clima */}
      {clima === "nieve" && (
        <g fill="#ffffff">
          {[[24, 60, 1.6], [64, 40, 1.2], [104, 66, 1.5], [140, 34, 1.3], [178, 58, 1.6], [44, 96, 1.2], [92, 20, 1.3], [166, 90, 1.2], [16, 120, 1.1], [186, 124, 1.3]].map(([x, y, r], i) => (
            <circle key={i} cx={x} cy={y} r={r} opacity={0.55 + (i % 3) * 0.15} />
          ))}
        </g>
      )}
      {clima === "lluvia" && (
        <g stroke={p.luz} strokeWidth="1" opacity="0.5">
          {[[26, 44], [58, 30], [92, 52], [126, 36], [162, 48], [42, 84], [110, 88], [150, 92], [76, 110], [180, 104]].map(([x, y], i) => (
            <line key={i} x1={x} y1={y} x2={x - 4} y2={y + 12} />
          ))}
        </g>
      )}
      {clima === "ceniza" && (
        <g fill={p.luz}>
          {[[30, 56], [70, 38], [112, 62], [148, 40], [178, 70], [50, 100], [96, 24], [164, 108]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={1.4} opacity={0.4 + (i % 3) * 0.2} />
          ))}
        </g>
      )}
      {clima === "brasas" && (
        <g fill={p.luz}>
          {[[36, 148], [66, 130], [100, 142], [134, 126], [168, 146], [82, 116], [150, 110]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={1.8 + (i % 2) * 0.7} opacity="0.85" />
          ))}
          {[[46, 160], [116, 156], [158, 162]].map(([x, y], i) => (
            <circle key={`g${i}`} cx={x} cy={y} r={3.4} opacity="0.3" />
          ))}
        </g>
      )}
      {clima === "viento" && (
        <g fill="none" stroke={p.luz} strokeWidth="1.2" opacity="0.45" strokeLinecap="round">
          <path d="M20 66 C44 58 60 74 84 66" />
          <path d="M60 96 C88 86 104 104 132 94" />
          <path d="M36 128 C60 120 76 136 100 128" />
          <path d="M116 58 C136 52 148 64 168 58" />
        </g>
      )}
    </g>
  );
}

// ============================================================
// SÍMBOLOS
// ============================================================
function SimboloOjo({ p, idp }: { p: PaletaFicha; idp: string }) {
  return (
    <g>
      {[-135, -100, -65, -30, 5, 40, 75, 110].map((ang, i) => {
        const rad = (ang * Math.PI) / 180;
        return <line key={i} x1="100" y1="120" x2={100 + Math.cos(rad) * 66} y2={120 + Math.sin(rad) * 66} stroke={p.luz} strokeWidth="1" opacity="0.45" />;
      })}
      <path d="M42 120 C70 84 130 84 158 120 C130 156 70 156 42 120 Z" fill={p.sombra} stroke={p.luz} strokeWidth="1.8" />
      <circle cx="100" cy="120" r="24" fill={`url(#${idp}-metal)`} stroke={p.luz} strokeWidth="1.2" />
      <circle cx="100" cy="120" r="11" fill={p.luz} />
      <circle cx="100" cy="120" r="4.5" fill={p.sombra} />
      <circle cx="92" cy="112" r="3.6" fill="#ffffff" opacity="0.9" />
      <path d="M56 120 C80 96 120 96 144 120" fill="none" stroke={p.luz} strokeWidth="0.8" opacity="0.6" />
    </g>
  );
}

function SimboloEspiral({ p }: { p: PaletaFicha; idp: string }) {
  const puntos = useMemo(() => {
    const pts: string[] = [];
    for (let t = 0; t <= 7.2; t += 0.18) {
      const r = 5 + t * 8.2;
      const x = 100 + Math.cos(t * 2) * r * 0.72;
      const y = 122 + Math.sin(t * 2) * r * 0.72;
      pts.push(`${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    return pts;
  }, []);
  return (
    <g>
      <circle cx="100" cy="122" r="72" fill="none" stroke={p.luz} strokeWidth="1" opacity="0.4" />
      <polyline points={puntos.join(" ")} fill="none" stroke={p.luz} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={puntos.join(" ")} fill="none" stroke={p.mid} strokeWidth="1" opacity="0.7" />
      <circle cx="100" cy="122" r="4" fill={p.luz} />
    </g>
  );
}

function SimboloTridente({ p, idp }: { p: PaletaFicha; idp: string }) {
  return (
    <g>
      <rect x="98" y="70" width="4" height="140" rx="2" fill={`url(#${idp}-metal)`} stroke={p.luz} strokeWidth="0.6" />
      <path d="M72 82 L72 46 L82 46 L82 66 M100 70 L100 34 L100 34 M118 82 L118 46 L128 46 L128 66" fill="none" stroke={`url(#${idp}-metal)`} strokeWidth="7" strokeLinecap="round" />
      <path d="M100 66 L100 32" stroke={`url(#${idp}-metal)`} strokeWidth="7" strokeLinecap="round" />
      <path d="M100 26 L106 40 L94 40 Z" fill={p.luz} />
      <path d="M72 40 L72 34 M128 40 L128 34" stroke={p.luz} strokeWidth="2.4" />
      <rect x="88" y="148" width="24" height="5" rx="2" fill={p.luz} opacity="0.85" />
      <path d="M60 208 C80 196 120 220 140 206" fill="none" stroke={p.luz} strokeWidth="2" opacity="0.6" />
    </g>
  );
}

function SimboloSello({ p, idp }: { p: PaletaFicha; idp: string }) {
  return (
    <g>
      <circle cx="100" cy="122" r="56" fill="none" stroke={`url(#${idp}-metal)`} strokeWidth="9" opacity="0.95" strokeDasharray="220 40" strokeDashoffset="-30" transform="rotate(-24 100 122)" />
      <circle cx="100" cy="122" r="42" fill="none" stroke={p.luz} strokeWidth="1" opacity="0.6" />
      <path d="M100 88 L108 114 L134 122 L108 130 L100 156 L92 130 L66 122 L92 114 Z" fill={p.mid} stroke={p.luz} strokeWidth="1" />
      <circle cx="100" cy="122" r="5" fill={p.luz} />
      <circle cx="152" cy="88" r="5" fill={p.mid} opacity="0.8" />
      <circle cx="149" cy="76" r="2.6" fill={p.mid} opacity="0.6" />
    </g>
  );
}

function SimboloBalanza({ p, idp }: { p: PaletaFicha; idp: string }) {
  return (
    <g transform="rotate(-7 100 122)">
      <rect x="98" y="56" width="4" height="120" fill={`url(#${idp}-metal)`} stroke={p.luz} strokeWidth="0.5" />
      <rect x="72" y="176" width="56" height="7" rx="3" fill={`url(#${idp}-metal)`} stroke={p.luz} strokeWidth="0.7" />
      <line x1="52" y1="76" x2="148" y2="68" stroke={p.luz} strokeWidth="2.6" strokeLinecap="round" />
      <line x1="52" y1="76" x2="40" y2="104" stroke={p.luz} strokeWidth="1" />
      <line x1="52" y1="76" x2="64" y2="104" stroke={p.luz} strokeWidth="1" />
      <path d="M36 104 L52 130 L68 104 Z" fill="none" stroke={p.luz} strokeWidth="1.6" />
      <line x1="148" y1="68" x2="136" y2="96" stroke={p.luz} strokeWidth="1" />
      <line x1="148" y1="68" x2="160" y2="96" stroke={p.luz} strokeWidth="1" />
      <path d="M132 96 L148 122 L164 96 Z" fill="none" stroke={p.luz} strokeWidth="1.6" />
      <circle cx="100" cy="70" r="4.5" fill={p.luz} />
    </g>
  );
}

function SimboloFaro({ p, idp }: { p: PaletaFicha; idp: string }) {
  return (
    <g>
      <path d="M30 96 L86 122 L30 148 Z" fill={p.luz} opacity="0.22" />
      <path d="M30 96 L86 122 L30 148 Z" fill="none" stroke={p.luz} strokeWidth="0.8" opacity="0.5" />
      <path d="M92 84 L108 84 L116 186 L84 186 Z" fill={`url(#${idp}-metal)`} stroke={p.luz} strokeWidth="1.2" />
      <path d="M88 112 L112 112 M86 138 L114 138 M84 162 L116 162" stroke={p.sombra} strokeWidth="6" opacity="0.8" />
      <rect x="90" y="70" width="20" height="16" rx="2" fill={p.luz} opacity="0.9" stroke={p.luz} strokeWidth="1" />
      <path d="M88 70 L100 52 L112 70 Z" fill={p.mid} stroke={p.luz} strokeWidth="1" />
      <path d="M10 200 C34 190 58 208 84 198 C110 190 130 206 156 197 C172 192 186 200 192 196" fill="none" stroke={p.luz} strokeWidth="2" opacity="0.7" />
      <path d="M20 214 C44 206 66 220 92 212 C118 205 142 218 168 210" fill="none" stroke={p.mid} strokeWidth="1.6" opacity="0.6" />
    </g>
  );
}

function SimboloReloj({ p, idp }: { p: PaletaFicha; idp: string }) {
  const marcas = Array.from({ length: 12 }, (_, i) => (i * 30 * Math.PI) / 180);
  return (
    <g>
      <circle cx="100" cy="120" r="62" fill="none" stroke={`url(#${idp}-metal)`} strokeWidth="6" />
      <circle cx="100" cy="120" r="54" fill={p.sombra} stroke={p.luz} strokeWidth="1" />
      {marcas.map((a, i) => (
        <line key={i} x1={100 + Math.cos(a) * 47} y1={120 + Math.sin(a) * 47} x2={100 + Math.cos(a) * 53} y2={120 + Math.sin(a) * 53} stroke={p.luz} strokeWidth={i % 3 === 0 ? 2.2 : 1} opacity="0.85" />
      ))}
      <line x1="100" y1="120" x2="100" y2="78" stroke={p.luz} strokeWidth="3.4" strokeLinecap="round" />
      <line x1="100" y1="120" x2="132" y2="132" stroke={p.luz} strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="100" cy="120" r="5.5" fill={p.luz} />
      <path d="M62 158 L58 168 M138 158 L142 168" stroke={p.luz} strokeWidth="1.4" opacity="0.6" />
    </g>
  );
}

function SimboloSerpiente({ p, idp }: { p: PaletaFicha; idp: string }) {
  return (
    <g>
      <path d="M34 190 C58 160 96 200 118 168 C134 144 112 128 96 140 C84 150 96 164 112 158" fill="none" stroke={`url(#${idp}-metal)`} strokeWidth="9" strokeLinecap="round" />
      <path d="M118 168 C132 152 146 130 138 106" fill="none" stroke={`url(#${idp}-metal)`} strokeWidth="9" strokeLinecap="round" />
      <path d="M138 106 C136 94 126 86 116 90 C108 93 108 104 116 108 C124 112 134 112 138 106 Z" fill={p.mid} stroke={p.luz} strokeWidth="1" />
      <path d="M114 92 L108 80 M120 90 L118 78" stroke={p.luz} strokeWidth="1.4" />
      <circle cx="126" cy="99" r="2" fill={p.sombra} />
      <path d="M52 180 C66 164 88 178 104 166" fill="none" stroke="#ffffff" strokeWidth="1.4" opacity="0.4" />
    </g>
  );
}

function SimboloCorona({ p, idp }: { p: PaletaFicha; idp: string }) {
  return (
    <g>
      <path d="M48 148 L48 92 L66 112 L82 74 L100 108 L118 74 L134 112 L152 92 L152 148 Z" fill={`url(#${idp}-metal)`} stroke={p.luz} strokeWidth="1.4" />
      <rect x="48" y="148" width="104" height="16" rx="4" fill={p.sombra} stroke={p.luz} strokeWidth="1" />
      <circle cx="82" cy="74" r="4" fill={p.luz} />
      <circle cx="118" cy="74" r="4" fill={p.luz} />
      <circle cx="100" cy="104" r="4" fill={p.luz} />
      <circle cx="66" cy="156" r="3.4" fill={p.luz} opacity="0.85" />
      <circle cx="100" cy="156" r="3.4" fill={p.luz} opacity="0.85" />
      <circle cx="134" cy="156" r="3.4" fill={p.luz} opacity="0.85" />
      <path d="M54 132 C66 122 74 140 88 130 M112 130 C126 120 134 138 146 128" fill="none" stroke={p.sombra} strokeWidth="2.4" opacity="0.9" />
      <path d="M60 88 L54 74 M140 88 L146 74" stroke={p.luz} strokeWidth="1.6" strokeLinecap="round" />
    </g>
  );
}

function SimboloUmbral({ p, idp }: { p: PaletaFicha; idp: string }) {
  return (
    <g>
      <rect x="60" y="44" width="80" height="150" rx="4" fill="none" stroke={`url(#${idp}-metal)`} strokeWidth="7" />
      <rect x="74" y="60" width="52" height="134" fill="#000000" />
      <rect x="74" y="60" width="52" height="134" fill="none" stroke={p.luz} strokeWidth="0.8" opacity="0.35" />
      <circle cx="100" cy="126" r="20" fill={p.luz} opacity="0.12" />
      <circle cx="100" cy="126" r="8" fill={p.luz} opacity="0.3" />
      <rect x="48" y="194" width="104" height="10" rx="3" fill={p.sombra} stroke={p.luz} strokeWidth="0.9" />
      <rect x="60" y="204" width="80" height="8" rx="3" fill={p.sombra} opacity="0.7" />
      <path d="M60 44 C60 32 68 28 76 28 M140 44 C140 32 132 28 124 28" stroke={p.luz} strokeWidth="2" fill="none" opacity="0.7" />
    </g>
  );
}

function SimboloPrisma({ p, idp }: { p: PaletaFicha; idp: string }) {
  return (
    <g>
      <line x1="6" y1="122" x2="66" y2="122" stroke="#ffffff" strokeWidth="2.6" opacity="0.85" />
      <line x1="6" y1="122" x2="66" y2="122" stroke={p.luz} strokeWidth="6" opacity="0.35" />
      <path d="M100 58 L152 158 L48 158 Z" fill={p.mid} opacity="0.3" stroke={p.luz} strokeWidth="1.6" />
      <path d="M100 74 L138 148 L62 148 Z" fill="none" stroke={p.luz} strokeWidth="0.8" opacity="0.5" />
      <line x1="100" y1="122" x2="192" y2="86" stroke={p.luz} strokeWidth="2.2" opacity="0.8" />
      <line x1="100" y1="122" x2="192" y2="122" stroke="#ffffff" strokeWidth="2.2" opacity="0.8" />
      <line x1="100" y1="122" x2="192" y2="158" stroke={p.mid} strokeWidth="2.2" opacity="0.9" />
      <circle cx="100" cy="122" r="5" fill="#ffffff" />
      <path d="M84 44 L92 58 L76 58 Z" fill={p.luz} opacity="0.7" />
      <path d="M122 176 L128 186 L116 186 Z" fill={p.mid} opacity="0.7" />
    </g>
  );
}

function SimboloLlave({ p, idp }: { p: PaletaFicha; idp: string }) {
  return (
    <g transform="rotate(-18 100 128)">
      <circle cx="76" cy="98" r="30" fill="none" stroke={`url(#${idp}-metal)`} strokeWidth="8" />
      <circle cx="76" cy="98" r="12" fill="none" stroke={p.luz} strokeWidth="1.4" opacity="0.7" />
      <circle cx="76" cy="98" r="4" fill={p.luz} />
      <rect x="104" y="94" width="66" height="8" rx="3" fill={`url(#${idp}-metal)`} stroke={p.luz} strokeWidth="0.7" />
      <path d="M142 102 L142 122 L150 122 L150 102 M156 102 L156 114 L163 114 L163 102" fill={`url(#${idp}-metal)`} stroke={p.luz} strokeWidth="0.7" />
      <circle cx="56" cy="84" r="2.6" fill={p.luz} opacity="0.8" />
      <circle cx="90" cy="112" r="2.2" fill={p.luz} opacity="0.6" />
    </g>
  );
}

const SIMBOLOS = {
  ojo: SimboloOjo,
  espiral: SimboloEspiral,
  tridente: SimboloTridente,
  sello: SimboloSello,
  balanza: SimboloBalanza,
  faro: SimboloFaro,
  reloj: SimboloReloj,
  serpiente: SimboloSerpiente,
  corona: SimboloCorona,
  umbral: SimboloUmbral,
  prisma: SimboloPrisma,
  llave: SimboloLlave,
};

// ── Render por tipo de arte ──────────────────────────────────
function Arte({ def, idp }: { def: DefFicha; idp: string }) {
  const p = PALETAS[def.paleta] ?? PALETAS.acero;
  const a = def.arte;
  if (a.tipo === "arma") {
    const C = ARMAS[a.sub] ?? ArmaEspada;
    return <C p={p} idp={idp} />;
  }
  if (a.tipo === "busto") {
    return <Busto p={p} idp={idp} tocado={a.sub} adorno={a.adorno} />;
  }
  if (a.tipo === "escena") {
    return <Escena p={p} idp={idp} sub={a.sub} clima={a.clima} />;
  }
  const C = SIMBOLOS[a.sub] ?? SimboloOjo;
  return <C p={p} idp={idp} />;
}
export function ArteFicha({ def, instancia }: { def: DefFicha; instancia?: FichaInstancia }) {
  const idp = useMemo(
    () => `${def.id}-${instancia?.serial ?? "d"}-${Math.random().toString(36).slice(2, 7)}`,
    [def.id, instancia?.serial]
  );
  return (
    <svg viewBox="0 0 200 260" className="h-full w-full" role="img" aria-label={`Arte de ${def.nombre}`}>
      <Fondo p={PALETAS[def.paleta] ?? PALETAS.acero} idp={idp} />
      <Arte def={def} idp={idp} />
    </svg>
  );
}

// ── Reverso del sobre/carta ──────────────────────────────────
export function FichaReverso({ tono = "#5fd4e8" }: { tono?: string }) {
  return (
    <svg viewBox="0 0 200 260" className="h-full w-full" role="img" aria-label="Reverso de ficha VANGUARD">
      <defs>
        <linearGradient id="rev-cielo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#10141c" />
          <stop offset="0.5" stopColor="#1a2230" />
          <stop offset="1" stopColor="#0b0e14" />
        </linearGradient>
      </defs>
      <rect width="200" height="260" fill="url(#rev-cielo)" />
      <rect x="10" y="10" width="180" height="240" rx="12" fill="none" stroke={tono} strokeWidth="1.4" opacity="0.55" />
      <rect x="16" y="16" width="168" height="228" rx="9" fill="none" stroke={tono} strokeWidth="0.6" opacity="0.3" />
      <circle cx="100" cy="118" r="46" fill="none" stroke={tono} strokeWidth="1.6" opacity="0.8" />
      <circle cx="100" cy="118" r="36" fill="none" stroke={tono} strokeWidth="0.7" opacity="0.5" />
      <path d="M100 84 L118 118 L100 152 L82 118 Z" fill="none" stroke={tono} strokeWidth="1.6" opacity="0.9" />
      <path d="M82 118 L118 118 M100 84 L100 152" stroke={tono} strokeWidth="0.8" opacity="0.6" />
      <circle cx="100" cy="118" r="7" fill={tono} opacity="0.9" />
      <text x="100" y="200" textAnchor="middle" fontSize="13" fontWeight="900" letterSpacing="6" fill="#ffffff" opacity="0.75" fontFamily="sans-serif">
        VANGUARD
      </text>
      <text x="100" y="216" textAnchor="middle" fontSize="6" letterSpacing="3" fill={tono} opacity="0.6" fontFamily="monospace">
        FICHAS DEL LINAJE
      </text>
    </svg>
  );
}

// ── Arte de sobres (pack) ────────────────────────────────────
export function ArteSobre({ sobre }: { sobre: Sobre }) {
  return (
    <svg viewBox="0 0 200 150" className="h-full w-full" role="img" aria-label={`Sobre ${sobre.nombre}`}>
      <defs>
        <linearGradient id={`sobre-${sobre.id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#141a26" />
          <stop offset="0.55" stopColor="#1e2836" />
          <stop offset="1" stopColor="#0c0f16" />
        </linearGradient>
      </defs>
      <rect x="30" y="12" width="140" height="126" rx="10" fill={`url(#sobre-${sobre.id})`} stroke={sobre.color} strokeWidth="1.6" opacity="0.97" />
      <path d="M30 22 L100 78 L170 22" fill="none" stroke={sobre.color} strokeWidth="1.2" opacity="0.6" />
      <path d="M30 12 L100 62 L170 12 Z" fill={sobre.color} opacity="0.12" />
      <circle cx="100" cy="88" r="22" fill="none" stroke={sobre.color} strokeWidth="1.4" opacity="0.85" />
      <path d="M100 66 L112 88 L100 110 L88 88 Z" fill="none" stroke={sobre.color} strokeWidth="1.4" opacity="0.9" />
      <circle cx="100" cy="88" r="4.5" fill={sobre.color} />
      <path d="M62 122 L138 122" stroke={sobre.color} strokeWidth="1" opacity="0.4" />
      <rect x="52" y="6" width="96" height="5" rx="2.5" fill={sobre.color} opacity="0.5" />
      <g fill="#ffffff" opacity="0.5">
        <circle cx="46" cy="30" r="1.1" />
        <circle cx="160" cy="42" r="1.3" />
        <circle cx="52" cy="118" r="1" />
        <circle cx="152" cy="112" r="1.2" />
      </g>
    </svg>
  );
}

// ============================================================
// TARJETA DE FICHA — el componente visible
// ============================================================
const PAD = (n: number): string => (n < 10 ? `00${n}` : n < 100 ? `0${n}` : `${n}`);

export function FichaCard({
  def,
  instancia,
  copias,
  bloqueada,
  tamaño = "sm",
  onClick,
  className = "",
}: {
  def: DefFicha;
  instancia?: FichaInstancia;
  copias?: number;
  bloqueada?: boolean;
  tamaño?: "sm" | "md" | "lg";
  onClick?: () => void;
  className?: string;
}) {
  const meta = RAREZA_META[def.rareza];
  const cat = CATEGORIA_META[def.categoria];
  const holo = !bloqueada && (def.rareza === "LEGENDARIO" || def.rareza === "MITICO" || def.rareza === "UNICO");
  const prisma = !bloqueada && def.rareza === "UNICO";
  const padFrame = tamaño === "lg" ? "p-[3px]" : "p-[2px]";

  return (
    <div
      className={`relative select-none ${onClick ? "cursor-pointer transition-transform duration-200 hover:-translate-y-1 active:scale-95" : ""} ${className}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      aria-label={bloqueada ? `Ficha sin descubrir: ${cat.etiqueta}` : `Ficha ${def.nombre}, ${meta.etiqueta}`}
    >
      <div
        className={`rounded-2xl ${padFrame} ${prisma ? "fichas-prisma" : ""}`}
        style={{ background: meta.marco, boxShadow: `0 0 26px -8px ${meta.glow}` }}
      >
        <div className="relative overflow-hidden rounded-[14px] bg-[#0a0c12]">
          {/* cabecera */}
          <div className="flex items-center justify-between px-2.5 pb-1 pt-2">
            <span className="text-[8px] font-black tracking-[0.16em]" style={{ color: bloqueada ? "#4a5260" : cat.color }}>
              {cat.icono} {cat.etiqueta}
            </span>
            <span className="text-[8px] font-black tracking-widest" style={{ color: bloqueada ? "#4a5260" : meta.color }}>
              {meta.etiqueta}
            </span>
          </div>

          {/* arte */}
          <div className={`relative mx-2 overflow-hidden rounded-lg border border-white/10 ${tamaño === "lg" ? "aspect-[10/9.4]" : "aspect-[10/9]"}`}>
            {bloqueada ? (
              <div className="absolute inset-0 grid place-items-center bg-[#0d1017]">
                <span className="text-3xl font-black text-white/15">?</span>
              </div>
            ) : (
              <ArteFicha def={def} instancia={instancia} />
            )}
            {holo && <div className="fichas-holo pointer-events-none absolute inset-0" />}
            {prisma && <div className="fichas-holo pointer-events-none absolute inset-0 fichas-prisma" />}
            {tamaño === "lg" && !bloqueada && (
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="fichas-pase absolute inset-y-0 w-1/3 bg-white/10" />
              </div>
            )}
          </div>

          {/* nombre */}
          <div className="px-2.5 pt-1.5">
            <div className="truncate text-[11px] font-black tracking-wide text-white" title={def.nombre}>
              {bloqueada ? "· · · · ·" : def.nombre}
            </div>
            <div className="text-[7.5px] font-mono text-white/40">
              {bloqueada ? "SIN DESCUBRIR" : `${def.elemento} · PODER ${def.poder}`}
            </div>
          </div>

          {/* pie de serie */}
          <div className="flex items-center justify-between px-2.5 pb-2 pt-1">
            <span className="font-mono text-[7px] tracking-wider text-white/35">VANGUARD LINAJE</span>
            <span className="font-mono text-[7.5px]" style={{ color: bloqueada ? "#4a5260" : meta.color }}>
              {instancia ? `Nº ${PAD(instancia.serial)}/${def.acunacion}` : `${def.acunacion} EN EL MUNDO`}
            </span>
          </div>

          {/* insignias */}
          {def.rareza === "UNICO" && !bloqueada && (
            <div className="absolute right-1.5 top-7 rotate-6 rounded-md border border-white/60 bg-black/80 px-1.5 py-0.5 text-[7px] font-black tracking-widest text-white">
              1 DE 1
            </div>
          )}
          {copias !== undefined && copias > 1 && (
            <div className="absolute left-2 top-7 rounded-md border border-white/25 bg-black/80 px-1.5 py-0.5 font-mono text-[7.5px] font-bold text-white/90">
              ×{copias}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// rareza mínima para burst visuals en la apertura
export function esRarezaAlta(r: RarezaFicha): boolean {
  return r === "LEGENDARIO" || r === "MITICO" || r === "UNICO";
}
