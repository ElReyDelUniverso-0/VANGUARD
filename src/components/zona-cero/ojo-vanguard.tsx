// v432.0 ZONA CERO — EL OJO DE VANGUARD
// SVG puro (cero imágenes, cero JS propio): una estrella de ocho puntas que
// irradia luz, dos anillos de instrumento que giran, el ojo de oro y, en la
// pupila, el emblema de la casa (escudo hexagonal + V, el mismo de la Puerta).
// La pupila sigue al puntero por variables CSS (--ojo-x / --ojo-y) que escribe
// el tablero; el parpadeo y los giros son CSS (transform/opacity) y se apagan
// solos con «reducir movimiento».

const RAYOS = Array.from({ length: 36 }, (_, i) => i * 10);
const PESTANAS = Array.from({ length: 11 }, (_, i) => -50 + i * 10);

function estrella(cx: number, cy: number, largo: number, corto: number, puntas: number, giro = 0): string {
  const pts: string[] = [];
  for (let i = 0; i < puntas * 2; i++) {
    const r = i % 2 === 0 ? largo : corto;
    const a = ((Math.PI * 2) / (puntas * 2)) * i + (giro * Math.PI) / 180 - Math.PI / 2;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(" ");
}

export function OjoVanguard({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 400 400" aria-hidden focusable="false">
      <defs>
        <radialGradient id="zc-luz" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#fff6d6" stopOpacity=".95" />
          <stop offset=".35" stopColor="#e8c56a" stopOpacity=".5" />
          <stop offset="1" stopColor="#e8c56a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="zc-oro" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff3c4" />
          <stop offset=".45" stopColor="#e8c56a" />
          <stop offset="1" stopColor="#9a6a12" />
        </linearGradient>
        <linearGradient id="zc-punta" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff3c4" stopOpacity=".95" />
          <stop offset="1" stopColor="#b8862b" stopOpacity=".15" />
        </linearGradient>
        <radialGradient id="zc-iris" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#1a1206" />
          <stop offset=".42" stopColor="#5a3b08" />
          <stop offset=".7" stopColor="#c8901f" />
          <stop offset=".9" stopColor="#f2d27e" />
          <stop offset="1" stopColor="#7a520c" />
        </radialGradient>
        <radialGradient id="zc-blanco" cx="50%" cy="45%" r="60%">
          <stop offset="0" stopColor="#14110b" />
          <stop offset="1" stopColor="#050507" />
        </radialGradient>
        <clipPath id="zc-almendra">
          <path d="M38 200 Q200 58 362 200 Q200 342 38 200Z" />
        </clipPath>
      </defs>

      {/* halo y rayos que irradian */}
      <circle cx="200" cy="200" r="196" fill="url(#zc-luz)" className="zc-ojo-halo" />
      <g className="zc-ojo-rayos" stroke="#e8c56a" strokeLinecap="round">
        {RAYOS.map((g) => (
          <line
            key={g}
            x1="200"
            y1={g % 30 === 0 ? 14 : 34}
            x2="200"
            y2={g % 30 === 0 ? 58 : 62}
            strokeWidth={g % 30 === 0 ? 2.2 : 1}
            strokeOpacity={g % 30 === 0 ? 0.75 : 0.35}
            transform={`rotate(${g} 200 200)`}
          />
        ))}
      </g>

      {/* la estrella de ocho puntas (Polaris de la casa) y su gemela girada */}
      <polygon points={estrella(200, 200, 192, 70, 4)} fill="url(#zc-punta)" opacity=".55" className="zc-ojo-estrella" />
      <polygon points={estrella(200, 200, 150, 64, 4, 45)} fill="url(#zc-punta)" opacity=".32" className="zc-ojo-estrella b" />

      {/* anillos de instrumento */}
      <g className="zc-ojo-anillo" fill="none" stroke="url(#zc-oro)">
        <circle cx="200" cy="200" r="168" strokeWidth="1.2" strokeDasharray="2 9" opacity=".7" />
        <circle cx="200" cy="200" r="178" strokeWidth=".8" strokeDasharray="38 14 4 14" opacity=".45" />
      </g>
      <g className="zc-ojo-anillo b" fill="none" stroke="#e8c56a">
        <circle cx="200" cy="200" r="156" strokeWidth="1" strokeDasharray="1 5" opacity=".5" />
      </g>

      {/* el ojo: párpados, pestañas de luz, iris y pupila con el emblema */}
      <g className="zc-ojo-parpado">
        <g stroke="#e8c56a" strokeLinecap="round" opacity=".8">
          {PESTANAS.map((g) => (
            <line key={g} x1="200" y1="96" x2="200" y2={g === 0 ? 70 : 80} strokeWidth={g === 0 ? 3 : 1.8} transform={`rotate(${g} 200 236)`} />
          ))}
        </g>
        <path d="M38 200 Q200 58 362 200 Q200 342 38 200Z" fill="url(#zc-blanco)" />
        <g clipPath="url(#zc-almendra)">
          <g className="zc-ojo-pupila">
            <circle cx="200" cy="200" r="84" fill="url(#zc-iris)" />
            <g stroke="#f2d27e" strokeOpacity=".22" strokeWidth="1">
              {RAYOS.map((g) => (
                <line key={g} x1="200" y1="128" x2="200" y2="160" transform={`rotate(${g + 5} 200 200)`} />
              ))}
            </g>
            <circle cx="200" cy="200" r="84" fill="none" stroke="#2a1c05" strokeWidth="3" />
            <circle cx="200" cy="200" r="44" fill="#050507" />
            {/* el emblema de VANGUARD dentro de la pupila */}
            <g transform="translate(168 168)">
              <path d="M32 3 59 18v28L32 61 5 46V18z" fill="none" stroke="url(#zc-oro)" strokeWidth="2.4" />
              <path d="M17 20h8l7 18 7-18h8L35 47h-6z" fill="url(#zc-oro)" />
            </g>
            <ellipse cx="176" cy="172" rx="13" ry="8" fill="#fff8e1" opacity=".55" transform="rotate(-28 176 172)" />
            <circle cx="226" cy="226" r="3.5" fill="#fff8e1" opacity=".4" />
          </g>
        </g>
        <path d="M38 200 Q200 58 362 200 Q200 342 38 200Z" fill="none" stroke="url(#zc-oro)" strokeWidth="5" strokeLinejoin="round" />
        <path d="M24 200 Q200 40 376 200" fill="none" stroke="#e8c56a" strokeOpacity=".35" strokeWidth="1.4" />
        <path d="M24 200 Q200 360 376 200" fill="none" stroke="#e8c56a" strokeOpacity=".25" strokeWidth="1.2" />
      </g>

      {/* destellos de estrella en los vértices */}
      {[
        [200, 12],
        [388, 200],
        [200, 388],
        [12, 200],
      ].map(([x, y], i) => (
        <polygon key={i} points={estrella(x, y, 13, 3, 4)} fill="#fff6d6" className={`zc-ojo-destello d${i}`} />
      ))}
    </svg>
  );
}
