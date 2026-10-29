"use client";

// ============================================================
// v173.0 — EL EMISOR DUERME (el universo 3D se retiró)
// Antes: puente entre los paneles DOM y el mundo WebGL — cada
// panel emitía sus filas por vg:sala3d-datos y el mundo las
// levantaba en volumen. Hoy el mundo ya no existe, pero los 129
// paneles de la Casa siguen llamando a este hook: lo mantenemos
// con la MISMA firma (cero cambios en los paneles) y el emisor
// en reposo. El tipo FilaContenido3D vive aquí desde v173
// (antes venía de salas-3d.ts, retirado con el universo).
// ============================================================

// La fila que los paneles entregan (convención v148/v165, intacta)
export interface FilaContenido3D {
  t: string;              // texto de la fila
  v?: string;             // valor (oro, a la derecha)
  p?: number;             // barra 0..100 (volumen proporcional)
  img?: string;           // url de imagen
  color?: string;         // acento hexadecimal de la fila
  d?: string;             // v165 EL DETALLE — info que la proximidad revelaba
  a?: string;             // v165 LA ACCIÓN — comprar/invertir/vender…
}

export function emitirSalaContenido(
  _tab: string,
  _titulo: string,
  _colorHex: string,
  _resumen: string,
  _filas: FilaContenido3D[],
) {
  // v173.0: el mundo 3D se retiró — emisor en reposo.
  // La firma se conserva para que los 129 paneles no cambien ni un byte.
}

export function useSala3DContenido(
  _tab: string,
  _titulo: string,
  _colorHex: string,
  _resumen: string,
  _filas: FilaContenido3D[],
) {
  // v173.0: sin universo que escuchar, el hook es un no-op honesto.
  // (El anti-churn, el JSON.stringify y los listeners murieron con él.)
}
