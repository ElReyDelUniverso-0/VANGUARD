// Vanguard v195.0 TU LADO — LA PREGUNTA DE LA CASA: ¿de qué lado estás?
// Cada problema del mundo se parte en DOS bandos. El pueblo vota en vivo
// (simulación determinista por tiempo transcurrido — el mismo patrón
// honesto de las encuestas v7) y TÚ declaras tu lado y puedes apostar
// monedas por él con cuotas que dependen de cuán minoritario sea tu bando.
//
// Leyes de la casa:
//  · CERO BYTES DE RED: todo es lógica local determinista.
//  · NADA SE RECARGA SOLO: esta sala solo responde, nunca impulsa nada.
//  · Juego LIMPIO: la cuota se fija al apostar y el mundo se suele ir con
//    la mayoría pero NO siempre — apostar al bando minoritario paga más.

export interface LadoProblema {
  id: string;
  categoria: "MUNDO" | "GUERRA" | "TECNOLOGIA" | "COMUNIDAD" | "FUTURO";
  pregunta: string;
  contexto: string;
  ladoA: string;
  ladoB: string;
  colorA: string;
  colorB: string;
  horas: number; // horas que dura el ciclo: al cierre, EL MUNDO DECIDE
}

export const LADOS: LadoProblema[] = [
  {
    id: "LD-CIBER", categoria: "TECNOLOGIA",
    pregunta: "¿Quién manda en el ciberespacio del futuro?",
    contexto: "Los ataques a infraestructura crítica ya no distinguen fronteras: cables submarinos, redes eléctricas y hospitales caen sin un solo disparo.",
    ladoA: "Los ESTADOS", ladoB: "Los HACKERS libres",
    colorA: "#38BDF8", colorB: "#A855F7",
    horas: 6,
  },
  {
    id: "LD-DRONES", categoria: "GUERRA",
    pregunta: "¿Gana la guerra quien tenga más drones o más soldados?",
    contexto: "En los frentes actuales un dron de 500 dólares destruye un blindaje de 5 millones. El blindaje caro ya está en los libros de historia.",
    ladoA: "Los DRONES", ladoB: "El SOLDADO",
    colorA: "#FF6B4A", colorB: "#FFD166",
    horas: 6,
  },
  {
    id: "LD-IA", categoria: "FUTURO",
    pregunta: "¿La IA debería decidir objetivos militares?",
    contexto: "Varias potencias ya usan selección automática de blancos. Los críticos llaman a eso entregar la vida y la muerte a una máquina.",
    ladoA: "SÍ, sin errores humanos", ladoB: "NUNCA, decide un humano",
    colorA: "#3DDC97", colorB: "#FF3B30",
    horas: 8,
  },
  {
    id: "LD-SANCIONES", categoria: "MUNDO",
    pregunta: "¿Las sanciones económicas funcionan de verdad?",
    contexto: "Décadas de bloqueos: unos países cambiaron de rumbo, otros encontraron socios nuevos y el pueblo pagó la cuenta.",
    ladoA: "SÍ, presionan", ladoB: "NO, castigan al pueblo",
    colorA: "#E8C56A", colorB: "#FF7A5C",
    horas: 8,
  },
  {
    id: "LD-OSINT", categoria: "COMUNIDAD",
    pregunta: "¿Publicar inteligencia abierta ayuda o pone en riesgo?",
    contexto: "Un geolocalizador amateur puede validar una masacre… o delatar el movimiento de una tropa. El OSINT es poder y es peligro.",
    ladoA: "AYUDA a la verdad", ladoB: "PONE en riesgo",
    colorA: "#38BDF8", colorB: "#FF4D5E",
    horas: 6,
  },
  {
    id: "LD-ESPACIO", categoria: "FUTURO",
    pregunta: "¿La próxima gran guerra se peleará en el espacio?",
    contexto: "Satélites espía, armas antisatélite y constelaciones militares: quien controla la órbita controla la Tierra.",
    ladoA: "SÍ, la órbita es el frente", ladoB: "NO, seguirá en el suelo",
    colorA: "#7FE3FF", colorB: "#FFC94D",
    horas: 10,
  },
  {
    id: "LD-MONEDA", categoria: "MUNDO",
    pregunta: "¿El dólar seguirá siendo la moneda del mundo?",
    contexto: "Cada vez más comercio escapa al dólar: monedas locales, oro y activos digitales reparten el tablero.",
    ladoA: "SÍ, sigue el rey", ladoB: "NO, llega el multipolar",
    colorA: "#34C77B", colorB: "#FFD166",
    horas: 10,
  },
  {
    id: "LD-MEDIOS", categoria: "COMUNIDAD",
    pregunta: "¿Se puede confiar hoy en la prensa tradicional?",
    contexto: "Cada bando acusa al otro de propaganda. Mientras tanto, los datos abiertos permiten verificar como nunca antes.",
    ladoA: "SÍ, con fuentes se verifica", ladoB: "NO, ya eligió su bando",
    colorA: "#3DDCFF", colorB: "#FF4D5E",
    horas: 6,
  },
  {
    id: "LD-ALIANZAS", categoria: "MUNDO",
    pregunta: "¿Las alianzas militares protegen o arrastran a la guerra?",
    contexto: "Un tratado puede detener a un agresor… o convertir un conflicto local en una guerra mundial por solidaridad.",
    ladoA: "PROTEGEN", ladoB: "ARRASTRAN",
    colorA: "#3DDC97", colorB: "#FF6B4A",
    horas: 8,
  },
  {
    id: "LD-FRONTERAS", categoria: "MUNDO",
    pregunta: "¿Las fronteras del mundo seguirán siendo las mismas en 2050?",
    contexto: "Guerras, climas y economías redibujan mapas: en un siglo el mundo cambió de rostro varias veces.",
    ladoA: "SÍ, casi todas fijas", ladoB: "NO, veremos mapas nuevos",
    colorA: "#E8C56A", colorB: "#A855F7",
    horas: 12,
  },
  {
    id: "LD-ENERGIA", categoria: "FUTURO",
    pregunta: "¿Quién gana la carrera energética de los próximos 20 años?",
    contexto: "Petróleo contra sol y viento: la potencia que domine la energía del futuro dominará la política del futuro.",
    ladoA: "El SOL y el viento", ladoB: "El PETRÓLEO aguanta",
    colorA: "#F5C542", colorB: "#FF7A5C",
    horas: 10,
  },
  {
    id: "LD-MEMES", categoria: "COMUNIDAD",
    pregunta: "¿Un meme puede más que un discurso?",
    contexto: "En toda crisis reciente, la información que más corre no viene de un parte oficial: viene del humor del pueblo.",
    ladoA: "SÍ, el meme gana", ladoB: "NO, manda el dato duro",
    colorA: "#A855F7", colorB: "#38BDF8",
    horas: 6,
  },
  {
    id: "LD-PIRATAS", categoria: "MUNDO",
    pregunta: "¿El mar vuelve a ser territorio sin ley?",
    contexto: "Rutas comerciales asediadas por piratas modernos y flotas de sombra que no tienen bandera.",
    ladoA: "SÍ, el mar está suelto", ladoB: "NO, las armadas controlan",
    colorA: "#FF4D5E", colorB: "#3DDCFF",
    horas: 8,
  },
  {
    id: "LD-VERIFICACION", categoria: "COMUNIDAD",
    pregunta: "¿Vale la pena verificar antes de compartir?",
    contexto: "Una mentira da la vuelta al mundo mientras la verdad se pone las botas. Verificar cuesta minutos; desmentir, años.",
    ladoA: "SÍ, primero verifico", ladoB: "Comparto y que caiga quien caiga",
    colorA: "#3DDC97", colorB: "#FF3B30",
    horas: 6,
  },
];

export const LADOS_CATEGORIAS = ["TODAS", "MUNDO", "GUERRA", "TECNOLOGIA", "COMUNIDAD", "FUTURO"] as const;

// ====== MOTOR DETERMINISTA (el mismo espíritu honesto de las encuestas) ======

function hash01(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

/** Ciclo actual del problema: cada `horas` el mundo vuelve a decidir. */
export function cicloDe(p: LadoProblema, ahora = Date.now()): number {
  return Math.floor(ahora / (p.horas * 3600_000));
}

export function abreEn(p: LadoProblema, ciclo: number): number {
  return ciclo * p.horas * 3600_000;
}

export function cierraEn(p: LadoProblema, ciclo: number): number {
  return (ciclo + 1) * p.horas * 3600_000;
}

/** Votos simulados de la comunidad para un lado, creciendo minuto a minuto. */
export function votosComunidad(p: LadoProblema, lado: "A" | "B", ciclo: number, ahora = Date.now()): number {
  const inicio = abreEn(p, ciclo);
  const fin = Math.min(ahora, cierraEn(p, ciclo));
  const slots = Math.max(0, Math.floor((fin - inicio) / (12 * 60_000))); // un latido cada 12 min
  const base = 40 + Math.floor(hash01(`${p.id}:${lado}:${ciclo}`) * 160); // arraque del bando
  let votos = 0;
  for (let s = 0; s < slots; s++) {
    if (hash01(`${p.id}:${lado}:${ciclo}:${s}`) < 0.34) votos += 1 + Math.floor(hash01(`${p.id}:${lado}:${ciclo}:${s}:w`) * 7);
  }
  return base + votos;
}

/** Porcentaje del lado A sobre el total (0-100). */
export function repartoA(p: LadoProblema, ciclo: number, ahora = Date.now()): number {
  const a = votosComunidad(p, "A", ciclo, ahora);
  const b = votosComunidad(p, "B", ciclo, ahora);
  if (a + b === 0) return 50;
  return Math.round((a / (a + b)) * 100);
}

/** Cuota honesta: minoritario cobra más. Margen de la casa 0.95, tope 3.40. */
export function cuotaDe(p: LadoProblema, lado: "A" | "B", ciclo: number, ahora = Date.now()): number {
  const a = votosComunidad(p, "A", ciclo, ahora);
  const b = votosComunidad(p, "B", ciclo, ahora);
  const total = a + b || 1;
  const share = (lado === "A" ? a : b) / total;
  const imp = 0.95 / Math.max(0.28, Math.min(0.72, share));
  return Math.max(1.12, Math.min(3.4, Math.round(imp * 100) / 100));
}

/** El veredicto del mundo al cierre: se suele ir con la mayoría, NO siempre. */
export function ganadorDelMundo(p: LadoProblema, ciclo: number, ahora = Date.now()): "A" | "B" {
  const a = votosComunidad(p, "A", ciclo, ahora);
  const b = votosComunidad(p, "B", ciclo, ahora);
  const total = a + b || 1;
  const pA = Math.max(0.2, Math.min(0.8, a / total));
  return hash01(`${p.id}:veredicto:${ciclo}`) < pA ? "A" : "B";
}
