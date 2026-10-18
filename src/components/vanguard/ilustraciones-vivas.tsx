"use client";

// ============================================================
// v121.0 LA CAMA MÁS CÓMODA — ILUSTRACIONES VIVAS
// "haz como imágenes e ilustraciones, funcionalas entre dos":
// una batería de ilustraciones PROCEDURALES (SVG dibujado a
// código, cero archivos de imagen) que son FUNCIONALES: respiran
// con la hora real del aparato, reaccionan a la sala y viven
// ENTRE los bloques de la casa (divisores, héroes, estados
// vacíos). Animación solo transform/opacity (60 FPS).
//
// v134.0 EL ESTRENO — ADIÓS A LOS PALITOS (orden del Dueño: «no
// sean palitos, más detalladas con anchura y que se muevan»):
// cada ilustración se re-dibujó con CUERPO REAL:
//   · RELLENOS con gradientes metálicos y atmosféricos (nunca
//     más trazos pelados: cada pieza tiene materia).
//   · PROFUNDIDAD en 3 planos — fondo con resplandor, cuerpo
//     con volumen (cara iluminada + sombra propia), suelo con
//     elipse de sombra.
//   · MÁS VIDA — cada escena ganó habitantes animados (nubes
//     que derivan, llamas con cuerpo, olas de señal, destellos
//     faceted, lunas con cráteres, ventanas que despiertan).
// La API no cambia (tipo/ancho/tono): ATELIER, ATLAS, CAMA y
// COMUNIDAD heredan el lujo sin tocar una línea.
// ============================================================
import { useEffect, useId, useState } from "react";
import { cn, q2 } from "@/lib/utils";

export type TipoIlustracion =
  | "globo"      // planeta con océanos, continentes y satélite en órbita
  | "satelite"   // sonda con cuerpo metálico, paneles solares y haz de señal
  | "ciudad"     // skyline en dos planos con ventanas vivas y cielo real
  | "antena"     // torre de celosía emitiendo anillos de radio
  | "cohete"     // cohete con fuselaje gradiente y llama con cuerpo
  | "cama"       // LA CAMA lunar con manta, almohada y cielo estrellado
  | "prensa"     // micrófono de estudio con ondas y barras de voz
  | "gema";      // v126 ATELIER: diamante facetado con destellos

interface IlustracionVivaProps {
  tipo: TipoIlustracion;
  className?: string;
  /** ancho en px (el SVG escala solo, viewBox 120x80) */
  ancho?: number;
  /** tono del trazo (por defecto var(--vg-acento)) */
  tono?: string;
}

/** ¿Noche en el aparato del visitante? (la ilustración ciudad/cama respira con él).
 *  SSR-safe: primer render nocturno neutro; el reloj real llega por rAF
 *  (nunca setState síncrono dentro del efecto — contrato del linter). */
function useEsNoche() {
  const [noche, setNoche] = useState(true);
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const h = new Date().getHours();
      setNoche(h >= 20 || h < 6);
    });
    return () => cancelAnimationFrame(id);
  }, []);
  return noche;
}

export function IlustracionViva({ tipo, className, ancho = 120, tono }: IlustracionVivaProps) {
  const noche = useEsNoche();
  const t = tono ?? "var(--vg-acento, #FFC94D)";
  // v125.0 CORRECCIÓN TOTAL: el sufijo del id de gradiente ya NO es Math.random()
  // (el servidor y el cliente tiraban sufijos distintos → error de hidratación en
  // CADA visita fresca, el bug más viejo de la casa). useId() es idéntico en
  // servidor y cliente y único por instancia; se limpian los «:» para url(#...).
  const uid = useId().replace(/:/g, "");
  const id = `iv-${tipo}-${uid}`;

  // gradientes compartidos del material de la casa (materia, no palitos)
  const defs = (
    <defs>
      <radialGradient id={`${id}-halo`} cx="50%" cy="46%" r="60%">
        <stop offset="0%" stopColor={t} stopOpacity="0.16" />
        <stop offset="70%" stopColor={t} stopOpacity="0.04" />
        <stop offset="100%" stopColor={t} stopOpacity="0" />
      </radialGradient>
      <linearGradient id={`${id}-metal`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#F4E7C3" />
        <stop offset="42%" stopColor={t} />
        <stop offset="100%" stopColor="#8a6410" />
      </linearGradient>
      <linearGradient id={`${id}-cuerpo`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={t} stopOpacity="0.85" />
        <stop offset="100%" stopColor="#0b0b14" stopOpacity="0.9" />
      </linearGradient>
      <radialGradient id={`${id}-sombra`} cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#000000" stopOpacity="0.45" />
        <stop offset="100%" stopColor="#000000" stopOpacity="0" />
      </radialGradient>
    </defs>
  );

  return (
    <svg
      viewBox="0 0 120 80"
      width={ancho}
      height={Math.round((ancho * 80) / 120)}
      className={cn("iv-ilustracion shrink-0", className)}
      role="img"
      aria-label={`Ilustración viva: ${tipo}`}
    >
      {defs}
      {/* EL AIRE DE LA ESCENA: resplandor de fondo + suelo de sombra (profundidad) */}
      <ellipse cx="60" cy="40" rx="56" ry="36" fill={`url(#${id}-halo)`} />
      <ellipse cx="60" cy="72" rx="30" ry="5" fill={`url(#${id}-sombra)`} className="iv-latido-soft" />

      {tipo === "globo" && (
        <g>
          {/* estrellas del fondo */}
          <circle cx="14" cy="14" r="1.1" fill="#FFF6E3" className="iv-parpadeo" />
          <circle cx="104" cy="10" r="1.2" fill="#FFF6E3" className="iv-parpadeo iv-delay" />
          <circle cx="112" cy="34" r="0.9" fill="#9BD4FF" className="iv-parpadeo" />
          <circle cx="8" cy="38" r="0.9" fill="#FFF6E3" className="iv-parpadeo iv-delay" />
          {/* el planeta: océano con volumen + atmósfera */}
          <circle cx="60" cy="42" r="27" fill={`url(#${id}-cuerpo)`} stroke={t} strokeWidth="1.4" strokeOpacity="0.9" />
          <circle cx="60" cy="42" r="29.5" fill="none" stroke={t} strokeOpacity="0.28" strokeWidth="2.5" className="iv-latido-soft" />
          {/* continentes con masa (deterministas) */}
          <path d="M44 34 Q50 28 58 31 Q64 33 61 39 Q55 44 47 41 Q43 38 44 34 Z" fill={t} opacity="0.4" />
          <path d="M66 46 Q74 42 79 47 Q82 53 75 56 Q68 57 65 52 Q64 48 66 46 Z" fill={t} opacity="0.33" />
          <path d="M56 55 Q60 52 64 55 Q66 59 61 61 Q56 60 56 55 Z" fill={t} opacity="0.28" />
          {/* meridianos y paralelos con gracia */}
          <ellipse cx="60" cy="42" rx="10.5" ry="27" fill="none" stroke={t} strokeWidth="0.7" opacity="0.45" />
          <ellipse cx="60" cy="42" rx="20" ry="27" fill="none" stroke={t} strokeWidth="0.5" opacity="0.3" />
          <path d="M34 34 H86" stroke={t} strokeWidth="0.6" opacity="0.4" />
          <path d="M33 50 H87" stroke={t} strokeWidth="0.6" opacity="0.4" />
          {/* el terminador: la noche muerde el planeta */}
          <path d="M60 15 A27 27 0 0 1 60 69 A34 34 0 0 0 60 15 Z" fill="#000000" opacity="0.34" />
          {/* satélite en órbita con cuerpo real */}
          <g className="iv-orbita">
            <g transform="translate(60 -16)">
              <rect x="-4.5" y="-2.5" width="9" height="5" rx="1" fill={`url(#${id}-metal)`} />
              <rect x="-11" y="-2" width="6" height="4" fill={t} opacity="0.75" />
              <rect x="5" y="-2" width="6" height="4" fill={t} opacity="0.75" />
              <path d="M-11 -2 h6 M-11 0 h6 M-11 2 h6 M5 -2 h6 M5 0 h6 M5 2 h6" stroke="#0b0b14" strokeWidth="0.5" opacity="0.6" />
            </g>
          </g>
        </g>
      )}

      {tipo === "satelite" && (
        <g>
          <circle cx="18" cy="12" r="1" fill="#FFF6E3" className="iv-parpadeo" />
          <circle cx="106" cy="18" r="1.1" fill="#9BD4FF" className="iv-parpadeo iv-delay" />
          <circle cx="96" cy="66" r="0.9" fill="#FFF6E3" className="iv-parpadeo" />
          {/* la órbita punteada */}
          <ellipse cx="60" cy="40" rx="46" ry="15" fill="none" stroke={t} strokeWidth="0.7" strokeDasharray="2 4" opacity="0.5" />
          <g className="iv-cruce">
            <g transform="translate(60 40)">
              {/* cuerpo de la sonda: metal con cara iluminada */}
              <rect x="-8" y="-5" width="16" height="10" rx="1.6" fill={`url(#${id}-metal)`} stroke="#8a6410" strokeWidth="0.5" />
              <rect x="-8" y="-5" width="16" height="3.4" rx="1.4" fill="#FFF7E0" opacity="0.22" />
              {/* los dos paneles solares con celdas */}
              <g>
                <rect x="-30" y="-4" width="19" height="8" rx="1" fill={t} opacity="0.8" />
                <path d="M-26 -4 v8 M-22 -4 v8 M-18 -4 v8 M-30 -1.3 h19 M-30 1.4 h19" stroke="#0b0b14" strokeWidth="0.55" opacity="0.7" />
                <rect x="11" y="-4" width="19" height="8" rx="1" fill={t} opacity="0.8" />
                <path d="M15 -4 v8 M19 -4 v8 M23 -4 v8 M11 -1.3 h19 M11 1.4 h19" stroke="#0b0b14" strokeWidth="0.55" opacity="0.7" />
              </g>
              {/* plato de señal + haz */}
              <path d="M8 -7 A4.6 4.6 0 0 1 12.6 -2.4" fill="none" stroke={t} strokeWidth="1.2" />
              <circle cx="10.5" cy="-5" r="1.1" fill={t} />
              <path d="M12 -8 L17 -13 M14 -6.5 L20 -10" stroke={t} strokeWidth="0.9" strokeLinecap="round" opacity="0.85" className="iv-onda" />
              <path d="M13 -9.5 L19.5 -14.5" stroke={t} strokeWidth="0.9" strokeLinecap="round" opacity="0.6" className="iv-onda" style={{ animationDelay: "0.5s" }} />
              {/* antena inferior */}
              <line x1="0" y1="5" x2="0" y2="9" stroke={t} strokeWidth="1" />
              <circle cx="0" cy="10" r="1.2" fill={t} className="iv-latido-soft" />
            </g>
          </g>
        </g>
      )}

      {tipo === "ciudad" && (
        <g>
          {/* cielo: luna de noche / sol de día */}
          {noche ? (
            <g>
              <circle cx="98" cy="14" r="7.5" fill="#FFF3D0" />
              <circle cx="96" cy="12" r="1.4" fill="#E8CE96" opacity="0.7" />
              <circle cx="100.5" cy="16" r="1.1" fill="#E8CE96" opacity="0.6" />
              <circle cx="14" cy="10" r="1" fill="#FFF6E3" className="iv-parpadeo" />
              <circle cx="30" cy="6" r="0.9" fill="#FFF6E3" className="iv-parpadeo iv-delay" />
              <circle cx="72" cy="8" r="1" fill="#9BD4FF" className="iv-parpadeo" />
            </g>
          ) : (
            <g>
              <circle cx="98" cy="13" r="8" fill="#FFD97A" className="iv-latido-soft" />
              <circle cx="98" cy="13" r="12" fill="none" stroke="#FFC94D" strokeOpacity="0.4" strokeWidth="1.5" />
            </g>
          )}
          {/* nube que deriva */}
          <g className="iv-flote" style={{ animationDuration: "7s" }}>
            <ellipse cx="34" cy="13" rx="9" ry="2.6" fill="#FFFFFF" opacity={noche ? 0.12 : 0.3} />
            <ellipse cx="39" cy="11" rx="5.5" ry="2.2" fill="#FFFFFF" opacity={noche ? 0.1 : 0.26} />
          </g>
          {/* skyline lejano (plano de fondo) */}
          <g opacity="0.5">
            <rect x="4" y="38" width="9" height="30" fill={t} opacity="0.35" />
            <rect x="16" y="30" width="11" height="38" fill={t} opacity="0.3" />
            <rect x="94" y="34" width="10" height="34" fill={t} opacity="0.32" />
            <rect x="106" y="42" width="8" height="26" fill={t} opacity="0.35" />
          </g>
          {/* la ciudad protagonista: torres con masa y ventanas vivas */}
          <g>
            <rect x="30" y="24" width="12" height="44" fill={`url(#${id}-cuerpo)`} stroke={t} strokeOpacity="0.55" strokeWidth="0.6" />
            <rect x="46" y="14" width="14" height="54" fill={`url(#${id}-cuerpo)`} stroke={t} strokeOpacity="0.7" strokeWidth="0.7" />
            <line x1="53" y1="14" x2="53" y2="7" stroke={t} strokeWidth="0.9" />
            <circle cx="53" cy="6" r="1.2" fill="#FF3B30" className="iv-latido-soft" />
            <rect x="64" y="30" width="11" height="38" fill={`url(#${id}-cuerpo)`} stroke={t} strokeOpacity="0.55" strokeWidth="0.6" />
            <rect x="78" y="20" width="10" height="48" fill={`url(#${id}-cuerpo)`} stroke={t} strokeOpacity="0.6" strokeWidth="0.6" />
            {/* caras laterales iluminadas (anchura) */}
            <rect x="58" y="14" width="2" height="54" fill={t} opacity="0.5" />
            <rect x="76" y="30" width="1.6" height="38" fill={t} opacity="0.4" />
            {/* ventanas en rejilla que despiertan */}
            {[0, 1, 2].map((f) => (
              <g key={f}>
                {[0, 1, 2, 3, 4].map((p) => (
                  <rect key={`${f}-${p}`} x={32.5 + f * 3.2} y={27 + p * 7} width="1.9" height="3" fill="#FFD98A" className={cn((f + p) % 3 === 0 && "iv-ventana")} opacity={(f + p) % 4 === 1 ? 0.35 : 0.85} style={{ animationDelay: `${((f * 5 + p) % 7) * 0.55}s` }} />
                ))}
              </g>
            ))}
            {[0, 1, 2].map((f) => (
              <g key={`b${f}`}>
                {[0, 1, 2, 3, 4, 5].map((p) => (
                  <rect key={`${f}-${p}`} x={48.5 + f * 3.6} y={17 + p * 8} width="2.1" height="3.4" fill={f === 1 && p === 2 ? "#9BD4FF" : "#FFD98A"} className={cn((f + p) % 4 === 0 && "iv-ventana")} opacity={(f * p) % 5 === 2 ? 0.3 : 0.85} style={{ animationDelay: `${((f * 6 + p) % 5) * 0.6}s` }} />
                ))}
              </g>
            ))}
          </g>
          {/* la calle: acera con reflejo del acento */}
          <rect x="0" y="68" width="120" height="12" fill="#07070d" />
          <rect x="0" y="68" width="120" height="1" fill={t} opacity="0.5" />
          <ellipse cx="53" cy="73" rx="22" ry="2" fill={t} opacity="0.22" className="iv-latido-soft" />
        </g>
      )}

      {tipo === "antena" && (
        <g>
          <circle cx="14" cy="14" r="1" fill="#FFF6E3" className="iv-parpadeo" />
          <circle cx="106" cy="10" r="1.1" fill="#9BD4FF" className="iv-parpadeo iv-delay" />
          {/* los anillos de radio que nacen del mástil */}
          {[0, 1, 2].map((i) => (
            <circle key={i} cx="60" cy="26" r={10 + i * 9} fill="none" stroke={t} strokeWidth="1.1" opacity={0.55 - i * 0.15} className="iv-onda" style={{ animationDelay: `${q2(i * 0.65)}s` }} />
          ))}
          {/* la torre de celosía (cruces de verdad) */}
          <g stroke={`url(#${id}-metal)`} strokeWidth="1.5" strokeLinecap="round">
            <line x1="54" y1="70" x2="59" y2="14" />
            <line x1="66" y1="70" x2="61" y2="14" />
          </g>
          <g stroke={t} strokeWidth="0.7" opacity="0.75">
            {[22, 32, 42, 52, 62].map((y, i) => {
              const w = 2.2 + (62 - y) * 0.02;
              return <path key={y} d={`M${60 - w - 2.5} ${y} L${60 + w + 2.5} ${y + 8} M${60 + w + 2.5} ${y} L${60 - w - 2.5} ${y + 8}`} opacity={0.8 - i * 0.08} />;
            })}
            <line x1="56.5" y1="30" x2="63.5" y2="30" />
            <line x1="55.5" y1="44" x2="64.5" y2="44" />
            <line x1="54.5" y1="58" x2="65.5" y2="58" />
          </g>
          {/* baliza viva en la cima */}
          <circle cx="60" cy="12" r="2" fill="#FF3B30" className="iv-latido-soft" style={{ boxShadow: "0 0 6px #FF3B30" }} />
          <circle cx="60" cy="12" r="4" fill="none" stroke="#FF3B30" strokeOpacity="0.5" className="iv-pulso-pin" />
          {/* plato lateral */}
          <path d="M66 46 A6 6 0 0 1 74 40" fill={t} opacity="0.55" />
          <line x1="62" y1="50" x2="70" y2="44" stroke={t} strokeWidth="1" />
          {/* base con masa */}
          <rect x="52" y="68" width="16" height="3.4" rx="1" fill={`url(#${id}-metal)`} opacity="0.9" />
        </g>
      )}

      {tipo === "cohete" && (
        <g>
          <circle cx="16" cy="16" r="1" fill="#FFF6E3" className="iv-parpadeo" />
          <circle cx="104" cy="12" r="1.1" fill="#9BD4FF" className="iv-parpadeo iv-delay" />
          <circle cx="110" cy="44" r="0.9" fill="#FFF6E3" className="iv-parpadeo" />
          <circle cx="10" cy="44" r="0.9" fill="#FFF6E3" className="iv-parpadeo iv-delay" />
          <g className="iv-flote">
            {/* fuselaje con volumen: nariz, cuerpo, cara iluminada */}
            <path d="M60 12 Q68 24 68 44 L52 44 Q52 24 60 12 Z" fill={`url(#${id}-metal)`} stroke="#8a6410" strokeWidth="0.6" />
            <path d="M60 12 Q63.5 20 64.5 32 L60 32 Z" fill="#FFF7E0" opacity="0.28" />
            <rect x="52" y="44" width="16" height="12" fill={t} opacity="0.85" />
            {/* escotilla con marco */}
            <circle cx="60" cy="30" r="4.2" fill="#0b0b14" stroke={t} strokeWidth="1.2" />
            <circle cx="61.2" cy="28.8" r="1.1" fill="#9BD4FF" opacity="0.8" className="iv-parpadeo" />
            {/* aletas con cuerpo */}
            <path d="M52 40 L44 58 L52 54 Z" fill={t} opacity="0.75" />
            <path d="M68 40 L76 58 L68 54 Z" fill={t} opacity="0.75" />
            {/* tobera */}
            <path d="M56 56 L64 56 L62 60 L58 60 Z" fill="#8a6410" />
            {/* la llama con cuerpo (núcleo + envoltura) */}
            <g className="iv-llama">
              <path d="M60 60 Q65 66 60 76 Q55 66 60 60 Z" fill="#FFB84D" opacity="0.9" />
              <path d="M60 62 Q63 67 60 72 Q57 67 60 62 Z" fill="#FFF3D0" />
            </g>
            {/* puffs de humo que se despiden */}
            <circle cx="52" cy="66" r="2.4" fill="#FFFFFF" opacity="0.14" className="iv-flote" style={{ animationDuration: "3.4s" }} />
            <circle cx="68" cy="70" r="1.8" fill="#FFFFFF" opacity="0.1" className="iv-flote" style={{ animationDuration: "4.1s", animationDelay: "0.6s" }} />
          </g>
          {/* líneas de velocidad */}
          <path d="M40 30 h-8 M42 40 h-11 M78 36 h9" stroke={t} strokeWidth="0.9" strokeLinecap="round" opacity="0.4" className="iv-onda" />
        </g>
      )}

      {tipo === "cama" && (
        <g>
          {/* el cielo de la alcoba */}
          {noche ? (
            <g>
              <circle cx="16" cy="12" r="1.1" fill="#FFF6E3" className="iv-parpadeo" />
              <circle cx="32" cy="8" r="0.9" fill="#FFF6E3" className="iv-parpadeo iv-delay" />
              <circle cx="90" cy="9" r="1" fill="#9BD4FF" className="iv-parpadeo" />
              <circle cx="106" cy="16" r="1" fill="#FFF6E3" className="iv-parpadeo iv-delay" />
              <circle cx="98" cy="14" r="6.5" fill="#FFF3D0" />
              <circle cx="96" cy="12" r="1.2" fill="#E8CE96" opacity="0.65" />
              <circle cx="100" cy="16" r="0.9" fill="#E8CE96" opacity="0.55" />
            </g>
          ) : (
            <g>
              <circle cx="100" cy="13" r="7" fill="#FFD97A" className="iv-latido-soft" />
              <circle cx="100" cy="13" r="11" fill="none" stroke="#FFC94D" strokeOpacity="0.35" strokeWidth="1.4" />
            </g>
          )}
          <g className="iv-flote">
            {/* la cama lunar: base, colchón, manta doblada, almohada */}
            <rect x="30" y="52" width="60" height="9" rx="2.4" fill={`url(#${id}-metal)`} stroke="#8a6410" strokeWidth="0.5" />
            <rect x="30" y="52" width="60" height="3" rx="1.4" fill="#FFF7E0" opacity="0.25" />
            <rect x="28" y="44" width="64" height="9" rx="4.4" fill="#0b0b14" stroke={t} strokeWidth="1.1" strokeOpacity="0.8" />
            {/* la manta: olas con cuerpo */}
            <path d="M40 44 Q46 40 52 44 Q58 48 64 44 Q70 40 76 44 L76 52 Q58 55 40 52 Z" fill={t} opacity="0.75" />
            <path d="M42 47 Q48 44 54 47 Q60 50 66 47" fill="none" stroke="#FFF7E0" strokeWidth="0.8" opacity="0.4" />
            {/* almohada mullida */}
            <ellipse cx="86" cy="43" rx="9" ry="5" fill="#FFF7E0" opacity="0.92" />
            <ellipse cx="84.5" cy="41.8" rx="5" ry="2.6" fill="#FFFFFF" opacity="0.6" />
            {/* patas */}
            <rect x="33" y="61" width="3.4" height="7" rx="1" fill={t} opacity="0.7" />
            <rect x="83.6" y="61" width="3.4" height="7" rx="1" fill={t} opacity="0.7" />
          </g>
          {/* las Zzz que suben con gracia */}
          <g fill={t} className="iv-zzz" style={{ fontFamily: "monospace", fontWeight: 700 }}>
            <text x="104" y="40" fontSize="6">z</text>
            <text x="109" y="32" fontSize="7.5" opacity="0.75" style={{ animationDelay: "0.9s" }}>z</text>
            <text x="113" y="23" fontSize="9" opacity="0.5" style={{ animationDelay: "1.8s" }}>z</text>
          </g>
          {/* resplandor cálido bajo la cama (la casa sueña) */}
          <ellipse cx="60" cy="69" rx="26" ry="3.4" fill={t} opacity="0.16" className="iv-latido-soft" />
        </g>
      )}

      {tipo === "prensa" && (
        <g>
          <circle cx="14" cy="12" r="1" fill="#FFF6E3" className="iv-parpadeo" />
          <circle cx="106" cy="14" r="1.1" fill="#9BD4FF" className="iv-parpadeo iv-delay" />
          {/* las barras de voz que respiran (la señal está viva) */}
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x={14 + i * 4.4} y={52 - (i === 2 ? 9 : i % 2 === 0 ? 6 : 4)} width="2.2" height={(i === 2 ? 18 : i % 2 === 0 ? 12 : 8)} rx="1.1" fill={t} opacity="0.6" className="iv-latido-soft" style={{ animationDelay: `${q2(i * 0.28)}s` }} />
          ))}
          <g className="iv-flote" style={{ animationDuration: "4.6s" }}>
            {/* el micrófono: cuerpo metálico + parrilla */}
            <rect x="56" y="18" width="10" height="24" rx="5" fill={`url(#${id}-metal)`} stroke="#8a6410" strokeWidth="0.6" />
            <path d="M57.5 18 h7 M57.5 22 h7 M57.5 26 h7 M57.5 30 h7 M57.5 34 h7 M57.5 38 h7" stroke="#0b0b14" strokeWidth="0.55" opacity="0.55" />
            <path d="M56 25 h10" stroke="#FFF7E0" strokeWidth="2" opacity="0.25" />
            {/* anillo titular */}
            <rect x="54.5" y="30" width="13" height="5" rx="2" fill={t} opacity="0.9" />
            {/* horquilla y pie */}
            <path d="M56 42 Q61 47 66 42" fill="none" stroke={t} strokeWidth="1.6" />
            <line x1="61" y1="45" x2="61" y2="62" stroke={t} strokeWidth="1.4" />
            <rect x="54" y="62" width="14" height="3.2" rx="1.6" fill={`url(#${id}-metal)`} />
            {/* las ondas que salen a la casa */}
            {[0, 1].map((i) => (
              <path key={i} d={`M${70 + i * 5} 22 Q${74 + i * 6} 30 ${70 + i * 5} 38`} fill="none" stroke={t} strokeWidth="1.3" strokeLinecap="round" opacity={0.7 - i * 0.25} className="iv-onda" style={{ animationDelay: `${q2(i * 0.5)}s` }} />
            ))}
          </g>
          {/* el cartel EN VIVO de la redacción */}
          <rect x="88" y="40" width="24" height="9" rx="1.6" fill="#0b0b14" stroke="#FF3B30" strokeWidth="0.8" />
          <circle cx="92" cy="44.5" r="1.4" fill="#FF3B30" className="iv-latido-soft" />
          <rect x="95" y="43.7" width="13" height="1.7" rx="0.8" fill="#FF3B30" opacity="0.75" />
        </g>
      )}

      {tipo === "gema" && (
        <g>
          {/* las estrellas de la vitrina */}
          <circle cx="18" cy="14" r="1" fill="#FFF6E3" className="iv-parpadeo" />
          <circle cx="102" cy="10" r="1.1" fill="#FFF6E3" className="iv-parpadeo iv-delay" />
          <circle cx="110" cy="30" r="0.9" fill="#9BD4FF" className="iv-parpadeo" />
          {/* los rayos de la vitrina */}
          <path d="M60 8 L64 40 L56 40 Z" fill="#FFFFFF" opacity="0.10" className="iv-latido-soft" />
          <g className="iv-flote">
            {/* el diamante: corona, banda y pabellón facetados */}
            <path d="M42 30 L52 18 L68 18 L78 30 L60 62 Z" fill={`url(#${id}-metal)`} stroke="#8a6410" strokeWidth="0.5" />
            <path d="M42 30 L78 30 L60 62 Z" fill={t} opacity="0.5" />
            <path d="M52 18 L58 30 L42 30 Z" fill="#FFF7E0" opacity="0.3" />
            <path d="M68 18 L78 30 L62 30 Z" fill="#FFF7E0" opacity="0.18" />
            <path d="M58 30 L60 62 L42 30 Z" fill="#FFFFFF" opacity="0.14" />
            <path d="M52 18 L60 26 L68 18" fill="none" stroke="#FFF7E0" strokeWidth="0.9" opacity="0.55" />
            <path d="M42 30 H78" stroke="#FFF7E0" strokeWidth="0.9" opacity="0.5" />
            {/* el pedestal del taller */}
            <rect x="44" y="62" width="32" height="4.4" rx="1.4" fill={`url(#${id}-metal)`} opacity="0.9" />
            <rect x="48" y="66.4" width="24" height="2.6" rx="1.2" fill={t} opacity="0.55" />
          </g>
          {/* destellos facetados que despiertan */}
          {[0, 1, 2].map((i) => (
            <g key={i} className="iv-parpadeo" style={{ animationDelay: `${q2(i * 0.9)}s` }}>
              <path d={`M${46 + i * 18} ${12 + i * 4} h6 M${49 + i * 18} ${9 + i * 4} v6`} stroke="#FFF7E0" strokeWidth="1.1" strokeLinecap="round" opacity="0.8" />
            </g>
          ))}
          {/* halo de valor bajo la gema */}
          <ellipse cx="60" cy="70" rx="24" ry="3" fill={t} opacity="0.2" className="iv-latido-soft" />
        </g>
      )}
    </svg>
  );
}

// ============================================================
// FRANJA ILUSTRADA (v121): la cinta de las salas — tres escenas
// vivas + la hora real del visitante. Con el estreno v134, las
// tres escenas lucen su cuerpo nuevo.
// ============================================================
export function FranjaIlustrada({ titulo }: { titulo?: string }) {
  const hora = useHoraViva();
  return (
    <div className="hud-panel px-4 py-3 my-6 flex items-center justify-between gap-3 overflow-hidden" aria-hidden>
      <div className="flex items-center gap-4 min-w-0">
        <IlustracionViva tipo="satelite" ancho={78} />
        <IlustracionViva tipo="globo" ancho={86} className="hidden sm:block" />
        <IlustracionViva tipo="ciudad" ancho={96} className="hidden md:block" />
      </div>
      <div className="text-right shrink-0">
        {titulo && <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground">{titulo}</p>}
        <p className="font-mono text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--vg-acento, #FFC94D)" }}>
          {hora}
        </p>
        <p className="font-mono text-[9px] text-muted-foreground">TU HORA · EL PLANETA GIRA</p>
      </div>
    </div>
  );
}

/** Hora viva (1 Hz, formateada al idioma del aparato). */
function useHoraViva() {
  const [hora, setHora] = useState("--:--");
  useEffect(() => {
    const tick = () => setHora(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return hora;
}
