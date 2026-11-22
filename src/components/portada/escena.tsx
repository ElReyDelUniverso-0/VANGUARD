// ═══════════════════════════════════════════════════════════════════
// v439.4 · EL DIBUJANTE DE PORTADAS — doce técnicas, cero descargas
//
// Cada sala trae su técnica en el atlas y aquí se dibuja con SVG puro: sin
// imágenes, sin peticiones, sin javascript en el cliente. Todo es determinista
// (semilla = huella de la ruta), así que la misma portada sale siempre igual
// para el que vuelve, y ninguna sala se parece a otra.
//
// Si la sala tiene fotografía (ficha.imagen), la imagen va DETRÁS como
// atmósfera y el dibujo encima como estructura: es el «mixto» que pidió el
// Dueño.
// ═══════════════════════════════════════════════════════════════════

import type { Glifo, Paleta, Tecnica } from "@/lib/portadas/atlas";

const ANCHO = 1200;
const ALTO = 520;

/** Generador pequeñito y estable: misma semilla, mismo dibujo. */
function azar(semilla: number) {
  let s = semilla >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const r1 = (n: number) => Math.round(n * 10) / 10;

export type EscenaProps = {
  tecnica: Tecnica;
  paleta: Paleta;
  semilla: number;
  /** el glifo de la sala, dibujado en el sello */
  glifo: Glifo;
  /** true cuando hay fotografía detrás: el dibujo baja de intensidad */
  conFoto?: boolean;
};

export function Escena({ tecnica, paleta, semilla, glifo, conFoto = false }: EscenaProps) {
  const rnd = azar(semilla);
  const cx = ANCHO * (0.34 + rnd() * 0.26);
  const cy = ALTO * (0.4 + rnd() * 0.2);
  const trazo = { stroke: paleta.luz, fill: "none", strokeWidth: 1.1, opacity: 0.55 };

  const piezas: React.ReactNode[] = [];

  if (tecnica === "ojo") {
    // un ojo enorme, hecho de arcos y pestañas
    const rx = 300 + rnd() * 90;
    const ry = 120 + rnd() * 40;
    piezas.push(<path key="parpado" d={`M${r1(cx - rx)} ${cy} Q${cx} ${r1(cy - ry)} ${r1(cx + rx)} ${cy} Q${cx} ${r1(cy + ry)} ${r1(cx - rx)} ${cy} Z`} {...trazo} strokeWidth={1.6} />);
    for (let i = 1; i <= 4; i++) {
      const k = 0.62 - i * 0.13;
      piezas.push(<path key={`iris${i}`} d={`M${r1(cx - rx * k)} ${cy} Q${cx} ${r1(cy - ry * k)} ${r1(cx + rx * k)} ${cy} Q${cx} ${r1(cy + ry * k)} ${r1(cx - rx * k)} ${cy} Z`} {...trazo} opacity={0.16 * i} />);
    }
    piezas.push(<circle key="pupila" cx={cx} cy={cy} r={26 + rnd() * 12} fill={paleta.sombra} opacity={0.85} />);
    piezas.push(<circle key="pupila2" cx={cx} cy={cy} r={12 + rnd() * 5} fill={paleta.fondo} />);
    piezas.push(<circle key="brillo" cx={cx - 9} cy={cy - 10} r={4.5} fill={paleta.filo} opacity={0.9} />);
  } else if (tecnica === "orbita") {
    // átomo de la casa: tres órbitas y electrones
    const R = 210 + rnd() * 70;
    piezas.push(<circle key="nucleo" cx={cx} cy={cy} r={16} fill={paleta.luz} opacity={0.9} />);
    for (let i = 0; i < 3; i++) {
      const ang = i * 60 + rnd() * 14;
      piezas.push(<ellipse key={`orb${i}`} cx={cx} cy={cy} rx={R} ry={r1(R * (0.28 + rnd() * 0.1))} transform={`rotate(${r1(ang)} ${cx} ${cy})`} {...trazo} strokeWidth={1.3} />);
      const a = rnd() * Math.PI * 2;
      piezas.push(
        <circle key={`ele${i}`} cx={r1(cx + Math.cos(a) * R)} cy={r1(cy + Math.sin(a) * R * 0.4)} r={5} fill={paleta.filo} opacity={0.95} />,
      );
    }
  } else if (tecnica === "reticula") {
    // el plano de la casa: rejilla con cruces o planta de naves
    const paso = 42 + rnd() * 20;
    for (let x = (cx % paso) - paso; x < ANCHO + paso; x += paso) {
      piezas.push(<line key={`v${x}`} x1={r1(x)} y1={0} x2={r1(x)} y2={ALTO} {...trazo} opacity={0.12} />);
    }
    for (let y = 0; y < ALTO; y += paso) {
      piezas.push(<line key={`h${y}`} x1={0} y1={r1(y)} x2={ANCHO} y2={r1(y)} {...trazo} opacity={0.12} />);
    }
    if (rnd() > 0.45) {
      // planta: naves de distinto tamaño, con su cota
      for (let i = 0; i < 9; i++) {
        const w = 70 + rnd() * 210;
        const h = 50 + rnd() * 130;
        const x = r1(140 + rnd() * (ANCHO - 300 - w));
        const y = r1(40 + rnd() * (ALTO - 120 - h));
        piezas.push(<rect key={`n${i}`} x={x} y={y} width={r1(w)} height={r1(h)} {...trazo} opacity={0.5} strokeWidth={1.2} />);
        piezas.push(<rect key={`n2${i}`} x={r1(x + 8)} y={r1(y + 8)} width={r1(w - 16)} height={r1(h - 16)} fill={paleta.luz} fillOpacity={r1(0.05 + rnd() * 0.1)} stroke="none" />);
      }
    } else {
      // referencia: cruces de medida y una caja de trabajo
      for (let i = 0; i < 8; i++) {
        const gx = r1(cx - 300 + rnd() * 600);
        const gy = r1(cy - 190 + rnd() * 380);
        piezas.push(<path key={`c${i}`} d={`M${gx - 9} ${gy} h18 M${gx} ${gy - 9} v18`} {...trazo} opacity={0.7} />);
        piezas.push(<circle key={`cc${i}`} cx={gx} cy={gy} r={2.2} fill={paleta.filo} opacity={0.8} />);
      }
      piezas.push(<rect key="caja" x={r1(cx - 200)} y={r1(cy - 130)} width={400} height={260} {...trazo} strokeWidth={1.6} opacity={0.75} strokeDasharray="12 7" />);
    }
  } else if (tecnica === "onda") {
    // la voz de la casa: ondas que se ensanchan
    for (let i = 0; i < 7; i++) {
      const amp = 30 + i * (16 + rnd() * 10);
      const fre = 0.006 + i * 0.0016;
      const desplaz = cy + (rnd() - 0.5) * 40;
      let d = `M0 ${r1(desplaz)}`;
      for (let x = 0; x <= ANCHO; x += 24) d += ` Q${x + 12} ${r1(desplaz - amp)} ${x + 24} ${r1(desplaz)}`;
      piezas.push(<path key={`o${i}`} d={d} transform={`translate(0 ${r1(Math.sin(fre * 100) * 0)})`} {...trazo} opacity={0.14 + i * 0.09} strokeWidth={1.2} />);
    }
    piezas.push(<line key="eje" x1={0} y1={r1(cy)} x2={ANCHO} y2={r1(cy)} stroke={paleta.filo} strokeWidth={0.8} opacity={0.3} />);
  } else if (tecnica === "barras") {
    // datos: columnas y su línea de tendencia
    const n = 18 + Math.floor(rnd() * 8);
    const ancho = ANCHO / (n + 2);
    const base = ALTO - 60;
    let alto0 = 0;
    for (let i = 0; i < n; i++) {
      const h = 40 + rnd() * (ALTO - 190);
      alto0 = h;
      piezas.push(
        <rect key={`b${i}`} x={r1(ancho * (i + 1))} y={r1(base - h)} width={r1(ancho * 0.56)} height={r1(h)} rx={2} fill={paleta.luz} opacity={r1(0.12 + (i / n) * 0.42)} />,
      );
    }
    let d = "";
    for (let i = 0; i < n; i++) {
      const x = r1(ancho * (i + 1.28));
      const y = r1(base - (40 + rnd() * (ALTO - 220)));
      d += i === 0 ? `M${x} ${y}` : ` L${x} ${y}`;
    }
    piezas.push(<path key="tend" d={d} stroke={paleta.filo} strokeWidth={1.6} fill="none" opacity={0.75} />);
    void alto0;
  } else if (tecnica === "constelacion") {
    // constelación: nodos, aristas y una estrella más alta
    const nodos: [number, number][] = [];
    for (let i = 0; i < 26; i++) nodos.push([r1(rnd() * ANCHO), r1(rnd() * ALTO)]);
    for (let i = 0; i < nodos.length; i++) {
      for (let j = i + 1; j < nodos.length; j++) {
        const dx = nodos[i][0] - nodos[j][0];
        const dy = nodos[i][1] - nodos[j][1];
        if (Math.hypot(dx, dy) < 220) {
          piezas.push(<line key={`a${i}-${j}`} x1={nodos[i][0]} y1={nodos[i][1]} x2={nodos[j][0]} y2={nodos[j][1]} {...trazo} opacity={0.16} />);
        }
      }
    }
    nodos.forEach(([x, y], i) => piezas.push(<circle key={`n${i}`} cx={x} cy={y} r={i % 5 === 0 ? 4.4 : 2} fill={i % 5 === 0 ? paleta.filo : paleta.luz} opacity={i % 5 === 0 ? 0.95 : 0.55} />));
  } else if (tecnica === "diana") {
    // diana: anillos y marcas de medida
    for (let i = 1; i <= 9; i++) {
      piezas.push(<circle key={`an${i}`} cx={cx} cy={cy} r={r1((i * Math.min(ANCHO, ALTO)) / 20)} {...trazo} opacity={r1(0.5 - i * 0.045)} />);
    }
    for (let i = 0; i < 4; i++) {
      const a = (i * 90 + rnd() * 20) * (Math.PI / 180);
      piezas.push(<line key={`e${i}`} x1={r1(cx + Math.cos(a) * 30)} y1={r1(cy + Math.sin(a) * 30)} x2={r1(cx + Math.cos(a) * 460)} y2={r1(cy + Math.sin(a) * 460)} {...trazo} opacity={0.2} />);
    }
    piezas.push(<circle key="centro" cx={cx} cy={cy} r={7} fill={paleta.filo} opacity={0.9} />);
    piezas.push(<circle key="centro2" cx={cx} cy={cy} r={16} {...trazo} opacity={0.6} />);
  } else if (tecnica === "espiral") {
    // espiral: el tiempo de la casa
    const vueltas = 4 + rnd() * 2;
    let d = "";
    for (let t = 0; t <= vueltas * Math.PI * 2; t += 0.16) {
      const rad = 12 + t * (18 + rnd() * 0.5);
      const x = cx + Math.cos(t) * rad;
      const y = cy + Math.sin(t) * rad * 0.62;
      d += t === 0 ? `M${r1(x)} ${r1(y)}` : ` L${r1(x)} ${r1(y)}`;
    }
    piezas.push(<path key="esp" d={d} {...trazo} strokeWidth={1.3} opacity={0.5} />);
    for (let i = 0; i < 12; i++) {
      const t = i * 0.9;
      const rad = 12 + t * 18;
      piezas.push(<circle key={`p${i}`} cx={r1(cx + Math.cos(t) * rad)} cy={r1(cy + Math.sin(t) * rad * 0.62)} r={2.4} fill={paleta.filo} opacity={0.6} />);
    }
  } else if (tecnica === "curvas") {
    // el terreno, leído de tres maneras según la sala
    const modo = Math.floor(rnd() * 3);
    if (modo === 0) {
      // A · curvas de nivel abiertas
      for (let i = 0; i < 11; i++) {
        const ky = 90 + i * 30 + rnd() * 12;
        const kx = 220 + rnd() * 120;
        let d = `M-40 ${r1(ky)}`;
        for (let x = -40; x < ANCHO + 40; x += 60) {
          d += ` Q${r1(x + 30)} ${r1(ky - kx * 0.18 + Math.sin((x + i * 40) / 90) * 26)} ${r1(x + 60)} ${r1(ky + Math.cos((x + i * 30) / 120) * 12)}`;
        }
        piezas.push(<path key={`cl${i}`} d={d} {...trazo} opacity={r1(0.1 + (i % 4) * 0.08)} strokeWidth={i % 5 === 0 ? 1.6 : 0.9} />);
      }
    } else if (modo === 1) {
      // B · la montaña, en anillos cerrados irregulares
      for (let anillo = 0; anillo < 13; anillo++) {
        const rad = 40 + anillo * 26;
        let d = "";
        for (let a = 0; a <= 64; a++) {
          const t = (a / 64) * Math.PI * 2;
          const desvio = 1 + Math.sin(t * (3 + (anillo % 3)) + anillo) * 0.13 + Math.cos(t * 5 + anillo * 0.7) * 0.07;
          const x = cx + Math.cos(t) * rad * desvio * 1.5;
          const y = cy + Math.sin(t) * rad * desvio * 0.62;
          d += a === 0 ? `M${r1(x)} ${r1(y)}` : ` L${r1(x)} ${r1(y)}`;
        }
        piezas.push(<path key={`an${anillo}`} d={`${d} Z`} {...trazo} opacity={r1(0.12 + (anillo % 4) * 0.07)} strokeWidth={anillo % 4 === 0 ? 1.6 : 0.9} />);
      }
    } else {
      // C · cordillera: crestas quebradas una detrás de otra
      for (let capa = 0; capa < 6; capa++) {
        const base = ALTO * (0.36 + capa * 0.11);
        let d = `M-40 ${ALTO}`;
        for (let x = -40; x < ANCHO + 80; x += 70) {
          d += ` L${r1(x)} ${r1(base - rnd() * (150 - capa * 12))}`;
        }
        d += ` L${ANCHO + 80} ${ALTO} Z`;
        piezas.push(<path key={`cr${capa}`} d={d} fill={capa % 2 ? paleta.luz : paleta.sombra} fillOpacity={r1(0.1 + capa * 0.05)} stroke={paleta.filo} strokeWidth={0.8} strokeOpacity={0.35} />);
      }
    }
    for (let i = 0; i < 5; i++) {
      piezas.push(<circle key={`pico${i}`} cx={r1(200 + rnd() * 800)} cy={r1(120 + rnd() * 280)} r={2.6} fill={paleta.filo} opacity={0.6} />);
    }
  } else if (tecnica === "red") {
    // la red de la casa: estrella, racimos o malla, según la sala
    const modo = Math.floor(rnd() * 3);
    if (modo === 0) {
      const nodos: [number, number][] = [[cx, cy]];
      for (let i = 1; i < 22; i++) {
        const a = rnd() * Math.PI * 2;
        const rad = 90 + rnd() * 380;
        nodos.push([r1(cx + Math.cos(a) * rad), r1(cy + Math.sin(a) * rad * 0.62)]);
      }
      for (let i = 0; i < nodos.length; i++) {
        piezas.push(<line key={`l${i}`} x1={nodos[0][0]} y1={nodos[0][1]} x2={nodos[i][0]} y2={nodos[i][1]} {...trazo} opacity={0.2} />);
      }
      nodos.forEach(([x, y], i) => piezas.push(<circle key={`no${i}`} cx={x} cy={y} r={i === 0 ? 9 : 3.4} fill={i === 0 ? paleta.filo : paleta.luz} opacity={i === 0 ? 1 : 0.7} />));
    } else if (modo === 1) {
      // racimos: tres cabezas y su gente alrededor
      for (let hub = 0; hub < 3; hub++) {
        const hx = r1(ANCHO * (0.22 + hub * 0.28) + (rnd() - 0.5) * 60);
        const hy = r1(ALTO * (0.34 + rnd() * 0.3));
        piezas.push(<circle key={`h${hub}`} cx={hx} cy={hy} r={7} fill={paleta.filo} opacity={0.95} />);
        for (let i = 0; i < 9; i++) {
          const a = rnd() * Math.PI * 2;
          const rad = 40 + rnd() * 150;
          const x = r1(hx + Math.cos(a) * rad);
          const y = r1(hy + Math.sin(a) * rad * 0.7);
          piezas.push(<line key={`hl${hub}-${i}`} x1={hx} y1={hy} x2={x} y2={y} {...trazo} opacity={0.24} />);
          piezas.push(<circle key={`hn${hub}-${i}`} cx={x} cy={y} r={2.6} fill={paleta.luz} opacity={0.65} />);
        }
      }
    } else {
      // malla: nodos en retícula irregular, unidos a sus vecinos
      const cols = 11;
      const filas = 6;
      const pts: [number, number][] = [];
      for (let f = 0; f < filas; f++) {
        for (let c = 0; c < cols; c++) {
          pts.push([r1((ANCHO / (cols - 1)) * c + (rnd() - 0.5) * 46), r1((ALTO / (filas - 1)) * f + (rnd() - 0.5) * 40)]);
        }
      }
      pts.forEach(([x, y], i) => {
        const c = i % cols;
        const f = Math.floor(i / cols);
        if (c < cols - 1) piezas.push(<line key={`mh${i}`} x1={x} y1={y} x2={pts[i + 1][0]} y2={pts[i + 1][1]} {...trazo} opacity={0.2} />);
        if (f < filas - 1) piezas.push(<line key={`mv${i}`} x1={x} y1={y} x2={pts[i + cols][0]} y2={pts[i + cols][1]} {...trazo} opacity={0.16} />);
        piezas.push(<circle key={`mn${i}`} cx={x} cy={y} r={rnd() > 0.82 ? 3.6 : 1.9} fill={rnd() > 0.8 ? paleta.filo : paleta.luz} opacity={0.7} />);
      });
    }
  } else if (tecnica === "prisma") {
    // prisma: haces que se abren en abanico
    const origenX = 120 + rnd() * 120;
    const origenY = ALTO * (0.35 + rnd() * 0.3);
    for (let i = 0; i < 13; i++) {
      const a = (-32 + i * 5.4 + rnd() * 2) * (Math.PI / 180);
      piezas.push(
        <line key={`h${i}`} x1={r1(origenX)} y1={r1(origenY)} x2={r1(origenX + Math.cos(a) * 1500)} y2={r1(origenY + Math.sin(a) * 1500)} stroke={i % 3 === 0 ? paleta.filo : paleta.luz} strokeWidth={i % 3 === 0 ? 1.4 : 0.9} opacity={r1(0.28 - i * 0.012)} />,
      );
    }
    piezas.push(<path key="pris" d={`M${origenX - 60} ${origenY - 90} L${origenX + 70} ${origenY} L${origenX - 60} ${origenY + 90} Z`} {...trazo} strokeWidth={1.5} opacity={0.6} />);
    piezas.push(<circle key="foco" cx={origenX} cy={origenY} r={5} fill={paleta.filo} opacity={0.95} />);
  } else if (tecnica === "sello") {
    // sello: el cuño de la casa, con su orla dentada
    const R = 190 + rnd() * 60;
    piezas.push(<circle key="s1" cx={cx} cy={cy} r={R} {...trazo} strokeWidth={1.4} />);
    piezas.push(<circle key="s2" cx={cx} cy={cy} r={R - 26} {...trazo} strokeWidth={2.4} strokeDasharray="4 6" opacity={0.5} />);
    piezas.push(<circle key="s3" cx={cx} cy={cy} r={R - 62} {...trazo} opacity={0.4} />);
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      piezas.push(<line key={`r${i}`} x1={r1(cx + Math.cos(a) * (R + 8))} y1={r1(cy + Math.sin(a) * (R + 8))} x2={r1(cx + Math.cos(a) * (R + 22))} y2={r1(cy + Math.sin(a) * (R + 22))} {...trazo} opacity={0.35} />);
    }
  }

  return (
    <svg
      className="vp-escena"
      viewBox={`0 0 ${ANCHO} ${ALTO}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
      focusable="false"
      data-tecnica={tecnica}
      style={{ opacity: conFoto ? 0.75 : 1 }}
    >
      {piezas}
      {/* el polvo en el aire: 90 puntos, siempre distintos por la semilla */}
      {Array.from({ length: 90 }, (_, i) => {
        const a = azar(semilla + i * 7919);
        return (
          <circle
            key={`polvo${i}`}
            cx={r1(a() * ANCHO)}
            cy={r1(a() * ALTO)}
            r={r1(0.6 + a() * 1.6)}
            fill={i % 4 === 0 ? paleta.filo : paleta.luz}
            opacity={r1(0.12 + a() * 0.4)}
          />
        );
      })}
      {/* el aire de la casa: un foco de luz y un viñeteado */}
      <ellipse cx={cx} cy={cy} rx={520} ry={300} fill={paleta.luz} opacity={0.055} />
      <rect x={0} y={0} width={ANCHO} height={ALTO} fill="url(#vp-vineta)" />
      <defs>
        <radialGradient id="vp-vineta" cx="50%" cy="45%" r="72%">
          <stop offset="55%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.72" />
        </radialGradient>
      </defs>
      <GlifoPequeno glifo={glifo} color={paleta.filo} />
    </svg>
  );
}

// ── los 28 glifos de la casa, en un cuadrado de 24 ───────────────────
const D: Record<Glifo, string> = {
  ojo: "M2 12q10-7 20 0-10 7-20 0Z",
  mapa: "M3 5l6-2 6 2 6-2v16l-6 2-6-2-6 2Z",
  sello: "M12 3a9 9 0 100 18 9 9 0 000-18Zm-4 5l4 10 4-10",
  atomo: "M2 12c0-3 20-3 20 0s-20 3-20 0Zm3-5c3-2 14 8 12 11S2 9 5 7Zm14 0C16 5 5 15 7 18s14-9 12-11Z",
  barras: "M5 20V10m5 10V5m5 15v-8m5 8V7",
  libro: "M3 6q4-2 9 0 5-2 9 0v13q-4-2-9 0-5-2-9 0Z",
  orbe: "M12 3a9 9 0 100 18 9 9 0 000-18Zm-4 9h8M12 3c4 6 4 12 0 18-4-6-4-12 0-18Z",
  onda: "M2 12q3-7 5 0t5 0 5 0 5 0",
  lupa: "M10 3a7 7 0 100 14 7 7 0 000-14Zm5 12l6 6",
  uve: "M4 4l8 16 8-16M7 21h10",
  brújula: "M12 2a10 10 0 100 20 10 10 0 000-20Zm4 6l-2 6-6 2 2-6Z",
  balanza: "M12 3v18M5 8h14M5 8l-3 7h6ZM19 8l-3 7h6Z",
  llave: "M14 3a7 7 0 100 14 7 7 0 000-14Zm0 4a3 3 0 110 6 3 3 0 010-6ZM10 17l-7 7",
  torre: "M6 21V8h12v13M6 8l3-5h6l3 5M10 21v-6h4v6",
  escudo: "M12 2l8 3v8c0 5-4 8-8 9-4-1-8-4-8-9V5Z",
  daga: "M12 2l3 12-3 3-3-3ZM8 17h8M12 17v5",
  corona: "M3 18l2-11 4 5 3-8 3 8 4-5 2 11Z",
  reloj: "M12 3a9 9 0 100 18 9 9 0 000-18Zm0 4v5l4 3",
  radio: "M4 8h16v12H4ZM7 8l3-5m4 9a3 3 0 100 6 3 3 0 000-6Z",
  camara: "M3 7h5l2-2h4l2 2h5v13H3Zm9 3a4 4 0 100 8 4 4 0 000-8Z",
  nota: "M9 18V5l10-2v13M9 18a3 3 0 11-3-3M19 16a3 3 0 11-3-3",
  red: "M12 3v18M4 7l16 10M20 7L4 17",
  dado: "M4 4h16v16H4Zm4 4h.01M12 12h.01M16 16h.01",
  estrella: "M12 2l3 7 7 .6-5.4 4.6 1.7 7L12 17l-6.3 4.2 1.7-7L2 9.6 9 9Z",
  ancla: "M12 7a2.5 2.5 0 100-5 2.5 2.5 0 000 5Zm0 0v14M5 13c0 5 3 8 7 8s7-3 7-8M2 13h6m8 0h6",
  llama: "M12 2c4 5 6 8 6 12a6 6 0 11-12 0c0-2 1-3 2-5 1 2 2 3 3 3 0-4 0-7 1-10Z",
  rayo: "M13 2L4 14h6l-1 8 9-12h-6Z",
  cruz: "M12 3v18M3 12h18",
};

function GlifoPequeno({ glifo, color }: { glifo: Glifo; color: string }) {
  return (
    <g transform="translate(1076 404) scale(3.4)" opacity={0.9}>
      <rect x={-4} y={-4} width={32} height={32} rx={4} fill="none" stroke={color} strokeWidth={0.6} opacity={0.35} />
      <path d={D[glifo]} fill="none" stroke={color} strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}
