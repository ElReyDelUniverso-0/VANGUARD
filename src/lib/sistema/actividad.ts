// ============================================================
// v407.0 · EL REGISTRO DE ACTIVIDAD TÉCNICA (lo que pasa por dentro)
//
// La casa tiene logs de Vercel, pero no tiene una vista propia de su actividad:
// cuántas peticiones, qué endpoints fallan, qué se cachea y qué no. Este módulo
// guarda un ANILLO de los últimos 200 eventos en la memoria del proceso.
//
// LÍMITES, declarados: es POR INSTANCIA (Vercel levanta varias), se pierde en
// cada despliegue y no es un sistema de auditoría ni de seguridad. Sirve para
// responder «¿qué está pasando ahora mismo en esta instancia?» desde /sistema.
//
// PRIVACIDAD: no guarda IPs, ni alias, ni cuerpos de petición completos; las
// cadenas se recortan y las claves se limitan a 8 por evento.
// ============================================================

export type NivelActividad = "info" | "aviso" | "error";

export interface EventoActividad {
  ts: string;
  nivel: NivelActividad;
  evento: string;
  datos?: Record<string, string | number | boolean>;
}

const MAX_EVENTOS = 200;
const ANILLO: EventoActividad[] = [];
const CUENTAS = { info: 0, aviso: 0, error: 0 };
let total = 0;

/** Anota un evento. Nunca lanza: la telemetría jamás puede tumbar una petición. */
export function anotar(nivel: NivelActividad, evento: string, datos?: Record<string, unknown>): void {
  try {
    const limpios: Record<string, string | number | boolean> = {};
    let n = 0;
    for (const [k, v] of Object.entries(datos ?? {})) {
      if (n++ >= 8) break;
      if (typeof v === "string") limpios[k] = v.slice(0, 120);
      else if (typeof v === "number" || typeof v === "boolean") limpios[k] = v;
    }
    ANILLO.push({ ts: new Date().toISOString(), nivel, evento: evento.slice(0, 60), datos: limpios });
    if (ANILLO.length > MAX_EVENTOS) ANILLO.shift();
    CUENTAS[nivel]++;
    total++;
  } catch {
    /* jamás romper por telemetría */
  }
}

/** Los últimos `n` eventos, del más reciente al más antiguo. */
export function ultimos(n = 40): EventoActividad[] {
  return ANILLO.slice(-Math.max(1, Math.min(MAX_EVENTOS, n))).reverse();
}

/** Recuento por nivel y por evento (sin datos: solo nombres y números). */
export function resumen() {
  const porEvento = new Map<string, number>();
  for (const e of ANILLO) porEvento.set(e.evento, (porEvento.get(e.evento) ?? 0) + 1);
  return {
    guardados: ANILLO.length,
    limite: MAX_EVENTOS,
    totalDesdeArranque: total,
    porNivel: { ...CUENTAS },
    porEvento: [...porEvento.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([evento, n]) => ({ evento, n })),
    ambito: "anillo en memoria · por instancia · se pierde en cada despliegue",
  };
}
