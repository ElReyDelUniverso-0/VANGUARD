// combat-audio.ts — v66.0 TERCERA DIMENSIÓN
// Sonido de combate sintetizado con Web Audio API: cero assets, cero peso de red,
// latencia nula. Explosiones, obuses, alarmas, monedas, fiebre de combate y sirenas
// se generan al vuelo con osciladores y ruido filtrado.
// El contexto se crea perezosamente en el primer gesto del usuario (política de
// autoplay de los navegadores) y la preferencia se persiste en localStorage.

type Sfx =
  | "shot"      // lanzamiento de artillería propia
  | "boom"      // explosión estándar
  | "bigboom"   // explosión grande (bomba de jet, caja destruida)
  | "cp-hit"    // impacto sobre el puesto de mando
  | "siren"     // puesto de mando caído (repliegue)
  | "online"    // puesto de mando de vuelta en línea
  | "coin"      // recompensa de monedas
  | "pickup"    // caja de suministro recogida
  | "fever"     // fiebre de combate cargada
  | "drone"     // dron FPV en marcha
  | "mlrs"      // salva MLRS lanzada
  | "fanfare";  // nuevo récord de combate

class CombatAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private enabled = true;

  /** Restaura la preferencia guardada (llamar al montar el panel). */
  restore() {
    try {
      if (localStorage.getItem("vanguard_frente_snd") === "0") this.enabled = false;
    } catch { /* sin storage */ }
  }

  isEnabled() {
    return this.enabled;
  }

  setEnabled(v: boolean) {
    this.enabled = v;
    if (v) this.ensure();
    try { localStorage.setItem("vanguard_frente_snd", v ? "1" : "0"); } catch { /* sin storage */ }
  }

  /** Crea/recupera el AudioContext. Devuelve false si el sonido está apagado. */
  private ensure(): boolean {
    if (!this.enabled) return false;
    if (!this.ctx) {
      try {
        const AC = window.AudioContext
          || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.ctx = new AC();
        this.master = this.ctx.createGain();
        this.master.gain.value = 0.42;
        this.master.connect(this.ctx.destination);
        const len = Math.floor(this.ctx.sampleRate * 1.1);
        this.noise = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
        const d = this.noise.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      } catch {
        this.enabled = false;
        return false;
      }
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
    return true;
  }

  /** Ráfaga de ruido filtrado (explosiones, whooshes). */
  private burst(t0: number, dur: number, f0: number, f1: number, gain: number, type: BiquadFilterType = "lowpass") {
    const c = this.ctx!;
    const src = c.createBufferSource();
    src.buffer = this.noise!;
    src.loop = true;
    const flt = c.createBiquadFilter();
    flt.type = type;
    flt.frequency.setValueAtTime(f0, t0);
    flt.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t0 + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(gain, t0);
    g.gain.exponentialRampToValueAtTime(0.0008, t0 + dur);
    src.connect(flt).connect(g).connect(this.master!);
    src.start(t0);
    src.stop(t0 + dur + 0.05);
  }

  /** Tono con barrido de frecuencia (sirenas, blips, fanfarrias). */
  private tone(t0: number, f0: number, f1: number, dur: number, gain: number, type: OscillatorType = "sine") {
    const c = this.ctx!;
    const osc = c.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(Math.max(20, f0), t0);
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t0 + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(gain, t0);
    g.gain.exponentialRampToValueAtTime(0.0008, t0 + dur);
    osc.connect(g).connect(this.master!);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  play(name: Sfx) {
    if (!this.ensure()) return;
    const c = this.ctx!;
    const t0 = c.currentTime;
    switch (name) {
      case "shot":
        this.burst(t0, 0.12, 1600, 300, 0.14);
        this.tone(t0, 170, 55, 0.1, 0.12, "triangle");
        break;
      case "boom":
        this.burst(t0, 0.5, 900, 90, 0.5);
        this.tone(t0, 72, 36, 0.32, 0.22, "sine");
        break;
      case "bigboom":
        this.burst(t0, 0.9, 700, 55, 0.62);
        this.tone(t0, 55, 28, 0.55, 0.3, "sine");
        break;
      case "cp-hit":
        this.tone(t0, 880, 620, 0.12, 0.14, "square");
        this.burst(t0, 0.28, 520, 110, 0.3);
        break;
      case "siren":
        this.tone(t0, 420, 940, 0.55, 0.12, "sawtooth");
        this.tone(t0 + 0.55, 940, 420, 0.55, 0.12, "sawtooth");
        this.tone(t0 + 1.1, 420, 940, 0.55, 0.1, "sawtooth");
        break;
      case "online":
        this.tone(t0, 660, 990, 0.14, 0.12, "triangle");
        break;
      case "coin":
        this.tone(t0, 988, 988, 0.06, 0.1, "square");
        this.tone(t0 + 0.07, 1319, 1319, 0.09, 0.1, "square");
        break;
      case "pickup":
        this.tone(t0, 520, 1040, 0.13, 0.13, "triangle");
        break;
      case "fever":
        [523, 659, 784, 1047].forEach((f, i) => this.tone(t0 + i * 0.07, f, f, 0.08, 0.11, "square"));
        break;
      case "drone":
        this.tone(t0, 115, 88, 0.55, 0.09, "sawtooth");
        this.burst(t0, 0.55, 320, 210, 0.06, "bandpass");
        break;
      case "mlrs":
        this.burst(t0, 0.45, 380, 1500, 0.2, "bandpass");
        this.tone(t0, 140, 58, 0.3, 0.18, "triangle");
        break;
      case "fanfare":
        [784, 988, 1175, 1568].forEach((f, i) => this.tone(t0 + i * 0.12, f, f, 0.14, 0.12, "triangle"));
        break;
    }
  }
}

export const combatAudio = new CombatAudio();
