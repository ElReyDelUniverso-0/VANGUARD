// ============================================================
// v114.0 ECLIPSE — LA MATEMÁTICA DEL SOL (compartida)
// Extraída del mini-mapa sísmico (v112) para que toda la casa
// pinte la MISMA noche real: el mini-mapa 2D y el globo 3D de
// VANGUARD EARTH comparten declinación, ecuación del tiempo y
// punto subsolar. Precisión ±0.2° — la que pinta la Tierra.
// ============================================================

// Declinación δ (aprox. precisa ±0.2°) y ecuación del tiempo (±15 s):
// suficiente para pintar la noche donde la Tierra la pinta de verdad.
export function solAhora(d = new Date()): { dec: number; lngSub: number } {
  const ahora = d;
  const inicio = Date.UTC(ahora.getUTCFullYear(), 0, 0);
  const N = Math.floor((ahora.getTime() - inicio) / 86_400_000); // día del año
  const dec = 23.44 * Math.sin((2 * Math.PI * (284 + N)) / 365); // grados
  const B = (2 * Math.PI * (N - 81)) / 364;
  const eot = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B); // minutos
  const hUtc = ahora.getUTCHours() + ahora.getUTCMinutes() / 60 + ahora.getUTCSeconds() / 3600;
  const lngSub = -15 * (hUtc + eot / 60 - 12); // longitud subsolar (grados)
  return { dec, lngSub: ((lngSub + 540) % 360) - 180 };
}

// ── la noche por columnas — latitud del terminador en cada longitud ──
// tan(φb) = −cos(H)/tan(δ) · H = longitud − longitud subsolar.
// δ > 0 (sol en el norte): la noche va del sur hasta φb · δ < 0: del φb al norte.
export function latitudTerminador(lng: number, dec: number, lngSub: number): number {
  const H = ((lng - lngSub) * Math.PI) / 180;
  const d = (dec * Math.PI) / 180;
  const tanD = Math.tan(d);
  if (Math.abs(tanD) < 1e-4) return Math.cos(H) > 0 ? -90 : 90; // equinoccio: circulo polar
  return (Math.atan(-Math.cos(H) / tanD) * 180) / Math.PI;
}

// ── la dirección del sol en coordenadas del GLOBO 3D (three-globe) ──
// Réplica EXACTA de polar2Cartesian de three-globe (r = 1): el vector
// unitario que apunta al punto subsolar — así el terminador del globo
// y el del mini-mapa están gobernados por el mismo sol.
export function direccionSolGlobo(dec: number, lngSub: number): { x: number; y: number; z: number } {
  const phi = ((90 - dec) * Math.PI) / 180;
  const theta = ((90 - lngSub) * Math.PI) / 180;
  const phiSin = Math.sin(phi);
  return { x: phiSin * Math.cos(theta), y: Math.cos(phi), z: phiSin * Math.sin(theta) };
}
