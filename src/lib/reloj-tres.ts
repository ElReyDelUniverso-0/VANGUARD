// v308.0 LA CUARTA CUCHILLA — EL ESPEJO DEL NAVEGADOR
// EL RELOJ PROPIO DEL MOTOR: la casa deja de depender de la API deprecada
// THREE.Clock (three 0.185 la marca muerta: «Please use THREE.Timer instead» —
// el ESPEJO DEL NAVEGADOR la cantó en la consola viva del universo).
//
// SEMÁNTICA EXACTA de THREE.Clock (la que los 6 motores de la casa ya viven):
//   · el PRIMER getDelta() arranca el reloj y devuelve 0 (autoStart implícito)
//   · las siguientes devuelven los segundos reales desde la llamada anterior
//   · elapsedTime acumula SOLO lo devuelto por getDelta (propiedad pública,
//     leída por hangar-3d, drone-strike-3d y el motor del universo)
//   · performance.now() como fuente del tiempo (la misma de three.js)
//   · NADA se recorta aquí: el techo del delta lo pone cada motor en su
//     bucle, exactamente como lo hacía con THREE.Clock.
//
// Cero dependencias, cero deprecación: cualquier versión de three sirve.

export class RelojTres {
  private previo = 0;
  private andando = false;
  elapsedTime = 0;

  /** Igual que THREE.Clock.start(): resetea el acumulado y marca el presente. */
  start(): void {
    this.previo = performance.now();
    this.elapsedTime = 0;
    this.andando = true;
  }

  getDelta(): number {
    if (!this.andando) {
      // primer pulso: arranca y devuelve 0 — igual que THREE.Clock autoStart
      this.previo = performance.now();
      this.andando = true;
      return 0;
    }
    const ahora = performance.now();
    const diff = (ahora - this.previo) / 1000;
    this.previo = ahora;
    this.elapsedTime += diff;
    return diff;
  }
}
