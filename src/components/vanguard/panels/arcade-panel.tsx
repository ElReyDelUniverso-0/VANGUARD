"use client";

// Vanguard v12 — ARCADE PACK: minijuegos rapidos con recompensas.
// 1) MEMORIA DE BANDERAS  2) ORDENA LA HISTORIA  3) QUIEN FUE? (fotos reales)
// 4) TRIVIA RELAMPAGO  5) DESCIFRA EL CODIGO  6) NEGOCIADOR DE PAZ  7) QUIZ DE BANDERAS
// v22: 8) ANTIMISIL  9) DUELO RELAMPAGO. Todo client-side, premios en monedas y XP.
// v26: 10) RADAR FURIA — reflejos de radar con combo x3 y MODO FIEBRE (el usuario
// pidió minijuegos menos aburridos: azúcar puro con multiplicadores y fiebre).

import { useState, useEffect, useRef } from "react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { CommunityGames } from "@/components/vanguard/community-games";
import { Gamepad2, RotateCcw, Clock, Brain, Flag, Hourglass, Camera, Zap, KeyRound, Handshake, Lightbulb, Rocket, Swords, Shield, Crosshair } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { sfx } from "@/lib/sound";
import { useGameStore } from "@/lib/game-store";
import { WIKI_ENTRIES } from "@/lib/wiki-data";
import { FlagBadge } from "@/components/vanguard/flag-badge";

type GameId = "memoria" | "historia" | "quien" | "trivia" | "codigo" | "negociador" | "banderas" | "antimisil" | "duelo" | "radar" | null;

// ====== DATOS DE JUEGOS ======
const MEMORY_FLAGS = ["US", "GB", "FR", "DE", "RU", "CN", "JP", "BR", "MX", "IT", "ES", "IN"];

interface TimelineQ { year: number; text: string; }
const TIMELINE_POOL: TimelineQ[] = [
  { year: 476, text: "Caida del Imperio Romano de Occidente" },
  { year: 1215, text: "Carta Magna en Inglaterra" },
  { year: 1453, text: "Caida de Constantinopla" },
  { year: 1492, text: "Llegada de Colon a America" },
  { year: 1517, text: "Lutero clava sus tesis" },
  { year: 1789, text: "Toma de la Bastilla" },
  { year: 1815, text: "Batalla de Waterloo" },
  { year: 1869, text: "Apertura del canal de Suez" },
  { year: 1912, text: "Hundimiento del Titanic" },
  { year: 1939, text: "Comienza la Segunda Guerra Mundial" },
  { year: 1945, text: "Bombas atomicas sobre Japon" },
  { year: 1969, text: "Apollo 11 llega a la Luna" },
  { year: 1989, text: "Cae el Muro de Berlin" },
  { year: 2001, text: "Atentados del 11 de septiembre" },
];

interface TriviaQ { q: string; options: string[]; a: number; }
const TRIVIA_POOL: TriviaQ[] = [
  { q: "Quien fue el primer emperador romano?", options: ["Julio Cesar", "Augusto", "Neron", "Trajano"], a: 1 },
  { q: "Que pais invento el papel?", options: ["Egipto", "China", "Grecia", "India"], a: 1 },
  { q: "En que ano cayo el muro de Berlin?", options: ["1987", "1989", "1991", "1985"], a: 1 },
  { q: "Que batalla freno a los persas en tierra (490 a.C.)?", options: ["Salamina", "Maraton", "Termopilas", "Platea"], a: 1 },
  { q: "Quien lidero la India a la independencia?", options: ["Nehru", "Gandhi", "Bose", "Patel"], a: 1 },
  { q: "Que monarca reinó 72 anos en Francia?", options: ["Luis XIV", "Napoleon", "Luis XVI", "Carlos VII"], a: 0 },
  { q: "El Kanato mongol llego hasta...", options: ["Polonia y Hungria", "Francia", "Italia", "España"], a: 0 },
  { q: "Primera mujer premio Nobel y de la Paz?", options: ["Marie Curie", "Bertha von Suttner", "Rosa Luxemburgo", "Jane Addams"], a: 1 },
  { q: "Que siglo es la Guerra de los Treinta Años?", options: ["XVII", "XVI", "XVIII", "XV"], a: 0 },
  { q: "Que imperio construyo Machu Picchu?", options: ["Maya", "Azteca", "Inca", "Olmeca"], a: 2 },
  { q: "Quien escribio El Principe?", options: ["Erasmo", "Maquiavelo", "Tomas Moro", "Boccaccio"], a: 1 },
  { q: "Que pais fue el primero en dar voto femenino?", options: ["EEUU", "Nueva Zelanda", "Suecia", "Australia"], a: 1 },
];

function shuffle<T>(arr: T[]): T[] { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

// ====== v13: DATOS DE LOS 3 NUEVOS MINIJUEGOS ======
interface CipherQ { type: "MORSE" | "ENIGMA" | "NAVAJO"; prompt: string; code: string; options: string[]; a: number; fact: string; }
const CIPHER_POOL: CipherQ[] = [
  { type: "MORSE", prompt: "¿Qué palabra transmite este código?", code: "− · ·· ·− −·", options: ["PEKIN", "BONNA", "TEHERAN", "BERLIN"], a: 3, fact: "BERLIN en Morse: − · ·· ·− −· — el correo cifrado volaba por cable submarino." },
  { type: "ENIGMA", prompt: "Cifrado César +3 — descífralo:", code: "DHWUHHQGLQJ", options: ["ARGENTINA", "GREENWIND", "GREENLAND", "GRANADA"], a: 2, fact: "GREENLAND desplazado 3 letras = DHWUHHQGLQJ. La U-570 se rindió ahí en 1941 con una Enigma a bordo." },
  { type: "NAVAJO", prompt: "Código Navajo — ¿qué significa?", code: "besh-lo (pez de hierro)", options: ["Portaaviones", "Submarino", "Destructor", "Cañón"], a: 1, fact: "besh-lo = submarino en el diccionario Navajo: nunca fue descifrado por Japón." },
  { type: "MORSE", prompt: "¿Qué palabra transmite este código?", code: "·· ·− ··− −· ·−", options: ["JAPAN", "OSAKA", "GUAM", "WAKE"], a: 3, fact: "WAKE: la isla que resistió 15 días antes de caer en diciembre de 1941." },
  { type: "ENIGMA", prompt: "Cifrado César +3 — descífralo:", code: "YHOMD", options: ["VELDD", "WILNO", "VILNA", "WIENA"], a: 1, fact: "WILNO con clave +3. La ciudad cambió de manos 7 veces entre 1939 y 1944." },
  { type: "NAVAJO", prompt: "Código Navajo — ¿qué significa?", code: "da-he-tih-hi (colibrí)", options: ["Caza", "Bombardero", "Tanque", "Acorazado"], a: 0, fact: "da-he-tih-hi = avión de caza. Los code talkers Iwo Jima transmitieron 800 mensajes sin errores." },
  { type: "NAVAJO", prompt: "Código Navajo — ¿qué significa?", code: "chay-da-gahi (tortuga)", options: ["Camión", "Submarino", "Tanque", "Obús"], a: 2, fact: "chay-da-gahi = tanque: coraza propia, avanza lento y cruzó dos océanos." },
  { type: "ENIGMA", prompt: "Cifrado César +3 — descífralo:", code: "EDUHUDOOHV", options: ["BARRACKS", "BARBAROSSA", "BARBABRA", "CABALLERO"], a: 1, fact: "BARBAROSSA: la operación del este. Su clave rota por Ultra salvó Moscú en 1941." },
];

interface Negotiation { conflict: string; brief: string; real: string; options: { text: string; support: number }[]; }
const NEGOTIATION_POOL: Negotiation[] = [
  { conflict: "Crisis de los misiles de Cuba (1962)", brief: "Los soviéticos construyen silos en Cuba. Un general propone bombardear; otro, bloquear. Tienes que presentar 3 salidas al Comité Ejecutivo y la comunidad vota si tu propuesta evita la guerra.", real: "Kennedy eligió CUARENTENA (bloqueo) + intercambio secreto: misiles de Turquía por los de Cuba. 13 días, mundo al borde.", options: [ { text: "Bombardeo aéreo inmediato de los silos", support: 34 }, { text: "Bloqueo naval + negociación con intercambio secreto", support: 78 }, { text: "Invasión anfibia de la isla", support: 12 } ] },
  { conflict: "Bloqueo de Berlín (1948)", brief: "Stalin corta todo acceso terrestre a Berlín Oeste: 2M de personas sin comida. Los generales piden convoy blindado. Tú propones al mando aliado y la comunidad vota.", real: "Puente aéreo: 277.000 vuelos en 15 meses hasta que Stalin levantó el bloqueo. Sin un disparo.", options: [ { text: "Convoy blindado por la autopista con escolta armada", support: 29 }, { text: "Puente aéreo masivo: abastecer 2M de personas volando", support: 82 }, { text: "Retirada negociada: entregar Berlín Oeste a cambio de paz", support: 14 } ] },
  { conflict: "Crisis de Suez (1956)", brief: "Nasser nacionaliza el canal. Reino Unido, Francia e Israel coordinan una invasión. EEUU y la URSS presionan juntas (por una vez). Tu propuesta va al consejo británico.", real: "Cese al fuego bajo presión de EEUU: fin de la era colonial británica como superpotencia.", options: [ { text: "Avanzar hasta El Cairo y deponer a Nasser", support: 22 }, { text: "Cese al fuego y retirada bajo mediación de la ONU", support: 76 }, { text: "Escalada: pedir respaldo de la OTAN artículo 5", support: 26 } ] },
  { conflict: "Ciberataque a hospitales (actualidad)", brief: "Un ransomware de origen estatal tumba 34 hospitales. Hay pacientes en riesgo. Debes proponer respuesta al comité de crisis.", real: "Los casos reales (WannaCry, 2017) terminaron en defensa masiva + atribución pública: sin contraataque declarado.", options: [ { text: "Contraataque inmediato contra la infraestructura del atacante", support: 41 }, { text: "Defensa, reconstrucción y atribución pública con aliados", support: 74 }, { text: "Pagar el rescate en secreto para recuperar los sistemas", support: 23 } ] },
];

const FLAG_POOL = [
  { code: "UA", name: "Ucrania" }, { code: "JP", name: "Japón" }, { code: "BR", name: "Brasil" }, { code: "ZA", name: "Sudáfrica" },
  { code: "IN", name: "India" }, { code: "KP", name: "Corea del Norte" }, { code: "TR", name: "Turquía" }, { code: "EG", name: "Egipto" },
  { code: "AU", name: "Australia" }, { code: "CA", name: "Canadá" }, { code: "MX", name: "México" }, { code: "SE", name: "Suecia" },
  { code: "CN", name: "China" }, { code: "DE", name: "Alemania" }, { code: "NG", name: "Nigeria" }, { code: "AR", name: "Argentina" },
  { code: "PL", name: "Polonia" }, { code: "SA", name: "Arabia Saudita" }, { code: "KR", name: "Corea del Sur" }, { code: "NZ", name: "Nueva Zelanda" },
  { code: "FR", name: "Francia" }, { code: "GB", name: "Reino Unido" }, { code: "ES", name: "España" }, { code: "IT", name: "Italia" },
];

export function ArcadePanel() {
  const addCoins = useGameStore((s) => s.addCoins);
  const addXp = useGameStore((s) => s.addXp);
  const spendCoins = useGameStore((s) => s.spendCoins);
  // FIX B1: recordMinigameStats ya no se usa aquí (solo Threat Assessment y Dron)
  const [game, setGame] = useState<GameId>(null);

  const reward = (coins: number, xp: number, label: string) => {
    if (coins > 0) addCoins(coins, label);
    if (xp > 0) addXp(xp);
    // FIX B1: el arcade NO toca recordMinigameStats — esa metrica (score/hits reales)
    // es de Threat Assessment y Dron Strike; antes contaminaba el reto DC-2, el logro
    // "Centurion" y el ranking con monedas/XP que no son puntos de juego.
  };

  // ============ 1. MEMORIA DE BANDERAS ============
  const [memCards, setMemCards] = useState<{ code: string; flipped: boolean; done: boolean }[]>([]);
  const [memMoves, setMemMoves] = useState(0);
  const [memLock, setMemLock] = useState(false);
  const memFlip = useRef<string[]>([]);
  const memTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startMemoria = () => {
    // FIX B7: cancela el timeout huerfano de una partida anterior (marcaba parejas
    // del tablero NUEVO sin jugarlas)
    if (memTimer.current) clearTimeout(memTimer.current);
    const codes = shuffle(MEMORY_FLAGS).slice(0, 8);
    const cards = shuffle([...codes, ...codes]).map((code) => ({ code, flipped: false, done: false }));
    setMemCards(cards); setMemMoves(0); memFlip.current = []; setMemLock(false);
    setGame("memoria");
  };
  // FIX B7: limpieza al desmontar
  useEffect(() => () => { if (memTimer.current) clearTimeout(memTimer.current); }, []);
  const clickMem = (idx: number) => {
    if (memLock) return;
    const c = memCards[idx];
    if (c.flipped || c.done) return;
    sfx.hover();
    const next = memCards.map((x, i) => i === idx ? { ...x, flipped: true } : x);
    memFlip.current.push(c.code);
    setMemCards(next);
    if (memFlip.current.length === 2) {
      setMemMoves((m) => m + 1);
      setMemLock(true);
      const [a, b] = memFlip.current;
      memTimer.current = setTimeout(() => {
        if (a === b) {
          sfx.coin();
          setMemCards((prev) => prev.map((x) => x.code === a ? { ...x, done: true, flipped: true } : x));
          if (next.filter((x) => x.done || x.code === a).length === next.length || next.every((x) => x.done || x.code === a)) {
            // podria terminar; se comprueba abajo en efecto
          }
        } else sfx.error();
        setMemCards((prev) => prev.map((x) => x.code === a && !x.done && x.flipped && x.code === b && !x.done ? { ...x, flipped: false } : (x.code === a && !x.done) || (x.code === b && !x.done) ? { ...x, flipped: false } : x));
        memFlip.current = []; setMemLock(false);
      }, a === b ? 350 : 700);
    }
  };
  useEffect(() => {
    if (game === "memoria" && memCards.length && memCards.every((c) => c.done)) {
      const prize = Math.max(20, 140 - memMoves * 6);
      reward(prize, 30, "ARCADE: memoria de banderas");
      sfx.success();
      toast.success(`Memoria completada en ${memMoves} jugadas`, { description: `+${prize} mon · +30 xp` });
      setGame(null);
    }
  }, [memCards]);

  // ============ 2. ORDENA LA HISTORIA ============
  const [tlEvents, setTlEvents] = useState<TimelineQ[]>([]);
  const [tlOrder, setTlOrder] = useState<number[]>([]);
  const [tlRound, setTlRound] = useState(0);
  const [tlFails, setTlFails] = useState(0);
  const tlLock = useRef(false);
  const tlTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startHistoria = () => {
    if (tlTimer.current) clearTimeout(tlTimer.current); // FIX B8: timeout huerfano
    setTlEvents(shuffle(TIMELINE_POOL).slice(0, 5).sort(() => Math.random() - 0.5)); setTlOrder([]); setTlRound(1); setTlFails(0); setGame("historia");
  };
  useEffect(() => () => { if (tlTimer.current) clearTimeout(tlTimer.current); }, []);
  const clickTl = (year: number) => {
    // FIX B8: lock anti doble-clic — dos clics rapidos comparaban contra el mismo "expected"
    if (tlLock.current) return;
    tlLock.current = true;
    setTimeout(() => { tlLock.current = false; }, 350);
    const expected = [...tlEvents].sort((a, b) => a.year - b.year)[tlOrder.length].year;
    if (year === expected) {
      sfx.coin(); setTlOrder((o) => [...o, year]);
      if (tlOrder.length + 1 === tlEvents.length) {
        // ronda completada
        const prize = 40 - tlFails * 10;
        tlTimer.current = setTimeout(() => {
          reward(Math.max(10, prize), 25, "ARCADE: ordena la historia");
          sfx.success();
          toast.success(`Cronologia correcta! +${Math.max(10, prize)} mon`, { description: `Fallos: ${tlFails}` });
          if (tlRound >= 3) { setGame(null); }
          else {
            setTlRound((r) => r + 1);
            setTlEvents(shuffle(TIMELINE_POOL).slice(0, 5).sort(() => Math.random() - 0.5));
            setTlOrder([]); setTlFails(0);
          }
        }, 400);
      }
    } else { sfx.error(); setTlFails((f) => f + 1); toast.error("Fuera de orden... ese no toca"); }
  };

  // ============ 3. QUIEN FUE? ============
  const leaders = WIKI_ENTRIES.filter((e) => e.cat === "LIDERES" && e.img);
  const [qfTarget, setQfTarget] = useState<typeof leaders[number] | null>(null);
  const [qfOptions, setQfOptions] = useState<string[]>([]);
  const [qfScore, setQfScore] = useState(0);
  const [qfN, setQfN] = useState(0);
  const qfBusy = useRef(false);
  const qfTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startQuien = () => {
    if (qfTimer.current) clearTimeout(qfTimer.current); // FIX B3/B7: timeout huerfano de partida anterior
    qfBusy.current = false;
    setQfScore(0); setQfN(0); nextQuien(); setGame("quien");
  };
  useEffect(() => () => { if (qfTimer.current) clearTimeout(qfTimer.current); }, []);
  const nextQuien = () => {
    const t = leaders[Math.floor(Math.random() * leaders.length)];
    const wrong = shuffle(WIKI_ENTRIES.filter((e) => e.cat === "LIDERES" && e.id !== t.id)).slice(0, 3).map((e) => e.title);
    setQfTarget(t);
    setQfOptions(shuffle([t.title, ...wrong]));
    qfBusy.current = false; // nueva pregunta, se puede responder
  };
  const answerQuien = (title: string) => {
    if (!qfTarget || qfBusy.current) return; // FIX B3/B4: lock anti doble-clic
    qfBusy.current = true;
    if (title === qfTarget.title) { sfx.coin(); setQfScore((s) => s + 1); toast.success("¡Correcto!"); }
    else { sfx.error(); toast.error(`Era ${qfTarget.title}`); }
    if (qfN + 1 >= 6) {
      // FIX B2: el premio NO contaba el último acierto (usaba qfScore stale → -30 mon sistemáticas)
      const prize = (qfScore + (title === qfTarget.title ? 1 : 0)) * 30 + 20;
      qfTimer.current = setTimeout(() => { reward(prize, 35, "ARCADE: quien fue"); toast.success(`Ronda terminada: ${qfScore + (title === qfTarget.title ? 1 : 0)}/6`, { description: `+${prize} mon` }); setGame(null); }, 600);
    } else { setQfN((n) => n + 1); qfTimer.current = setTimeout(nextQuien, 500); }
  };

  // ============ 4. TRIVIA RELAMPAGO ============
  const [tvQ, setTvQ] = useState<TriviaQ | null>(null);
  const [tvLeft, setTvLeft] = useState(8);
  const [tvScore, setTvScore] = useState(0);
  const [tvN, setTvN] = useState(0);
  const tvTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const tvBusy = useRef(false);
  const startTrivia = () => { tvBusy.current = false; setTvScore(0); setTvN(0); setTvQ(shuffle(TRIVIA_POOL)[0]); setTvLeft(8); setGame("trivia"); };
  useEffect(() => {
    if (game !== "trivia" || !tvQ) return;
    tvBusy.current = false; // FIX B4: nueva pregunta desbloquea
    if (tvTimer.current) clearInterval(tvTimer.current);
    setTvLeft(8);
    // FIX B5: el timer solo decrementa — los efectos secundarios (avance, toasts)
    // se disparan desde el efecto de abajo; en StrictMode los updaters con efectos
    // dentro se ejecutaban DOS veces (doble avance, doble recompensa)
    tvTimer.current = setInterval(() => {
      setTvLeft((l) => (l <= 1 ? 0 : l - 1));
    }, 1000);
    return () => { if (tvTimer.current) clearInterval(tvTimer.current); };
  }, [tvQ, game]);
  const advanceTrivia = (ok: boolean) => {
    if (ok) { setTvScore((s) => s + 1); }
    if (tvN + 1 >= 8) {
      const prize = (tvScore + (ok ? 1 : 0)) * 25 + 20;
      setTvQ(null); // FIX B3: cierra la pregunta YA — sin ventana donde re-clic duplica la recompensa
      setTimeout(() => { reward(prize, 40, "ARCADE: trivia relampago"); toast.success(`Trivia: ${tvScore + (ok ? 1 : 0)}/8 aciertos`, { description: `+${prize} mon` }); setGame(null); }, 500);
    } else { setTvN((n) => n + 1); setTvQ(shuffle(TRIVIA_POOL.filter((x) => x !== tvQ))[0]); }
  };
  // FIX B5: deteccion de tiempo agotado FUERA del updater
  useEffect(() => {
    if (game !== "trivia" || !tvQ || tvLeft > 0) return;
    if (tvBusy.current) return;
    tvBusy.current = true;
    sfx.error(); toast.error("Tiempo agotado");
    advanceTrivia(false);
  }, [tvLeft]);
  const answerTv = (i: number) => {
    if (!tvQ || game !== "trivia" || tvBusy.current) return; // FIX B4: lock
    tvBusy.current = true;
    tvTimer.current && clearInterval(tvTimer.current);
    if (i === tvQ.a) { sfx.coin(); toast.success("+25 en juego"); } else sfx.error();
    advanceTrivia(i === tvQ.a);
  };

  // ============ 5. DESCIFRA EL CÓDIGO (v13) ============
  const [cpQ, setCpQ] = useState<CipherQ | null>(null);
  const [cpScore, setCpScore] = useState(0);
  const [cpN, setCpN] = useState(0);
  const [cpTime, setCpTime] = useState(60);
  const [cpHint, setCpHint] = useState(false);
  const [cpDone, setCpDone] = useState(false);
  const cpTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const startCodigo = () => { setCpScore(0); setCpN(0); setCpTime(60); setCpHint(false); setCpDone(false); setCpQ(shuffle(CIPHER_POOL)[0]); setGame("codigo"); };
  useEffect(() => {
    if (game !== "codigo" || cpDone) return;
    cpTimer.current && clearInterval(cpTimer.current);
    cpTimer.current = setInterval(() => {
      setCpTime((t) => {
        if (t <= 1) {
          clearInterval(cpTimer.current!);
          setCpDone(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (cpTimer.current) clearInterval(cpTimer.current); };
  }, [game, cpDone, cpQ]);
  // fin por tiempo
  useEffect(() => {
    if (game === "codigo" && cpDone) {
      const prize = cpScore * 40 + 20;
      setTimeout(() => {
        reward(prize, 45, "ARCADE: descifra el código");
        toast.success(`Máquina descifrada: ${cpScore} aciertos`, { description: `+${prize} mon · +45 xp` });
      }, 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cpDone]);
  const answerCodigo = (i: number) => {
    if (!cpQ || cpDone) return;
    if (i === cpQ.a) { sfx.coin(); toast.success("Código roto +40"); setCpScore((s) => s + 1); }
    else { sfx.error(); toast.error("Fallaste — el reloj sigue corriendo"); }
    const nextPool = CIPHER_POOL.filter((x) => x !== cpQ);
    if (nextPool.length === 0 || cpN + 1 >= 6) { setCpDone(true); }
    else { setCpN((n) => n + 1); setCpQ(shuffle(nextPool)[0]); setCpHint(false); }
  };
  const buyHint = () => {
    if (cpHint || !cpQ) return;
    if (!spendCoins(15, "ARCADE: pista de cifrado")) { toast.error("Necesitas 15 mon para una pista"); return; }
    setCpHint(true);
    toast("PISTA: " + cpQ.options[cpQ.a].slice(0, 3).split("").join("·") + " ...", { description: "Las 3 primeras letras reveladas" }); // FIX B9: texto acorde a lo mostrado
  };

  // ============ 6. NEGOCIADOR DE PAZ (v13) ============
  const [ngQ, setNgQ] = useState<Negotiation | null>(null);
  const [ngPick, setNgPick] = useState<number | null>(null);
  const [ngApproval, setNgApproval] = useState(0);
  const [ngPhase, setNgPhase] = useState<"pick" | "voting" | "result">("pick");
  const startNegociador = () => { ngRewarded.current = false; setNgQ(shuffle(NEGOTIATION_POOL)[0]); setNgPick(null); setNgApproval(0); setNgPhase("pick"); setGame("negociador"); };
  const ngRewarded = useRef(false);
  // votacion de la comunidad sobre tu propuesta
  useEffect(() => {
    // FIX B6: si sales a mitad de votación, el intervalo y la recompensa mueren con el juego
    if (game !== "negociador" || ngPhase !== "voting" || ngPick === null || !ngQ) return;
    const target = Math.round(ngQ.options[ngPick].support * 0.72 + Math.random() * 22);
    const iv = setInterval(() => {
      setNgApproval((a) => {
        if (a >= target) {
          clearInterval(iv);
          setTimeout(() => setNgPhase("result"), 400);
          return target;
        }
        return a + Math.max(1, Math.round((target - a) / 4));
      });
    }, 240);
    return () => clearInterval(iv);
  }, [ngPhase, ngPick, ngQ, game]);
  useEffect(() => {
    // FIX B6: solo paga si seguimos dentro del negociador y no ha pagado ya
    if (game !== "negociador" || ngPhase !== "result" || ngQ === null || ngPick === null) return;
    if (ngRewarded.current) return;
    ngRewarded.current = true;
    const ok = ngApproval >= 70;
    const prize = ok ? 100 : 30;
    setTimeout(() => {
      reward(prize, 40, "ARCADE: negociador de paz");
      if (ok) { sfx.success(); toast.success(`PROPUESTA APROBADA (${ngApproval}%) · +${prize} mon`, { description: "La comunidad apoya tu salida diplomática" }); }
      else { toast(`Propuesta rechazada (${ngApproval}%) · +${prize} mon por intentarlo`, { description: "Se necesita 70% de aprobación" }); }
    }, 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ngPhase, game]);
  const pickNegociador = (i: number) => {
    if (ngPhase !== "pick" || !ngQ) return;
    setNgPick(i);
    setNgPhase("voting");
    setNgApproval(6);
    sfx.hover();
  };

  // ============ 7. QUIZ DE BANDERAS (v13) ============
  const [fbTarget, setFbTarget] = useState<typeof FLAG_POOL[number] | null>(null);
  const [fbOptions, setFbOptions] = useState<string[]>([]);
  const [fbN, setFbN] = useState(0);
  const [fbScore, setFbScore] = useState(0);
  const [fbLeft, setFbLeft] = useState(5);
  const fbTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const fbBusy = useRef(false);
  const fbTimerQ = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startBanderas = () => {
    if (fbTimerQ.current) clearTimeout(fbTimerQ.current); // timeout huerfano
    fbBusy.current = false;
    setFbN(0); setFbScore(0); setGame("banderas"); nextFlag();
  };
  useEffect(() => () => { if (fbTimerQ.current) clearTimeout(fbTimerQ.current); }, []);
  const nextFlag = () => {
    const t = FLAG_POOL[Math.floor(Math.random() * FLAG_POOL.length)];
    const wrong = shuffle(FLAG_POOL.filter((x) => x.code !== t.code)).slice(0, 3).map((x) => x.name);
    setFbTarget(t);
    setFbOptions(shuffle([t.name, ...wrong]));
    setFbLeft(5);
    fbBusy.current = false;
  };
  useEffect(() => {
    if (game !== "banderas" || !fbTarget) return;
    fbTimer.current && clearInterval(fbTimer.current);
    // FIX B5: timer puro + deteccion de timeout en efecto aparte
    fbTimer.current = setInterval(() => {
      setFbLeft((l) => (l <= 1 ? 0 : l - 1));
    }, 1000);
    return () => { if (fbTimer.current) clearInterval(fbTimer.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fbTarget, game]);
  const advanceFlag = (ok: boolean) => {
    if (ok) setFbScore((s) => s + 1);
    if (fbN + 1 >= 10) {
      const prize = (fbScore + (ok ? 1 : 0)) * 22 + 15;
      setFbTarget(null); // FIX B3: cierra la pregunta YA (sin re-clics que dupliquen recompensa)
      setTimeout(() => { reward(prize, 35, "ARCADE: quiz de banderas"); toast.success(`Banderas: ${fbScore + (ok ? 1 : 0)}/10`, { description: `+${prize} mon` }); setGame(null); }, 500);
    } else { setFbN((n) => n + 1); fbTimerQ.current = setTimeout(nextFlag, 450); }
  };
  // FIX B5: timeout detectado fuera del updater
  useEffect(() => {
    if (game !== "banderas" || !fbTarget || fbLeft > 0) return;
    if (fbBusy.current) return;
    fbBusy.current = true;
    sfx.error();
    toast.error("¡Tiempo!");
    advanceFlag(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fbLeft]);
  const answerFlag = (name: string) => {
    if (!fbTarget || game !== "banderas" || fbBusy.current) return; // FIX B4: lock
    fbBusy.current = true;
    fbTimer.current && clearInterval(fbTimer.current);
    if (name === fbTarget.name) { sfx.coin(); } else sfx.error();
    advanceFlag(name === fbTarget.name);
  };

  // ============ 8. ANTIMISIL (v22) ============
  interface AmMissile { id: number; x: number; y: number; speed: number; }
  const [amMissiles, setAmMissiles] = useState<AmMissile[]>([]);
  const [amScore, setAmScore] = useState(0);
  const [amLives, setAmLives] = useState(3);
  const [amLeft, setAmLeft] = useState(45);
  const [amOver, setAmOver] = useState(false);
  const amId = useRef(0);
  const amRef = useRef<AmMissile[]>([]);
  const amSpawn = useRef<ReturnType<typeof setInterval> | null>(null);
  const amTick = useRef<ReturnType<typeof setInterval> | null>(null);
  const amClock = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopAm = () => {
    [amSpawn, amTick, amClock].forEach((t) => { if (t.current) clearInterval(t.current); t.current = null; });
  };

  const startAntimisil = () => {
    stopAm(); // FIX patrón B7: nada de timers huerfanos entre partidas
    setAmMissiles([]); setAmScore(0); setAmLives(3); setAmLeft(45); setAmOver(false);
    amRef.current = []; amId.current = 0;
    setGame("antimisil");
    // spawn de misiles (dificultad sube con la puntuación)
    amSpawn.current = setInterval(() => {
      const m: AmMissile = { id: amId.current++, x: 4 + Math.random() * 92, y: -2, speed: 0.32 + Math.random() * 0.45 + amScore * 0.008 };
      amRef.current = [...amRef.current, m].slice(-9);
      setAmMissiles(amRef.current);
    }, 850);
    // movimiento (60ms) — updaters puros, cálculo sobre ref
    amTick.current = setInterval(() => {
      const now = amRef.current.map((m) => ({ ...m, y: m.y + m.speed }));
      const landed = now.filter((m) => m.y >= 88);
      if (landed.length > 0) {
        sfx.beep();
        setAmLives((l) => l - landed.length);
        setAmScore((s) => Math.max(0, s - landed.length * 5));
      }
      amRef.current = now.filter((m) => m.y < 88);
      setAmMissiles(amRef.current);
    }, 60);
    amClock.current = setInterval(() => setAmLeft((l) => Math.max(0, l - 1)), 1000);
  };
  useEffect(() => () => stopAm(), []);

  const amShoot = (m: AmMissile, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!amRef.current.some((x) => x.id === m.id)) return; // anti doble-clic
    amRef.current = amRef.current.filter((x) => x.id !== m.id);
    setAmMissiles(amRef.current);
    setAmScore((s) => s + 10);
    sfx.coin();
  };

  // fin de partida: tiempo agotado o base destruida
  useEffect(() => {
    if (game !== "antimisil" || amOver) return;
    if (amLeft === 0 || amLives <= 0) {
      setAmOver(true);
      stopAm();
      const prize = amScore * 2 + 15;
      setTimeout(() => {
        reward(prize, 25, "ARCADE: antimisil");
        sfx.success();
        toast.success(`Defensa terminada · ${amScore} pts`, { description: amLives <= 0 ? "Base destruida — resistencia heroica" : `Base intacta x${Math.max(0, amLives)} · +${prize} mon · +25 xp` });
      }, 150);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amLeft, amLives, amOver, game]);

  // ============ 9. DUELO RELAMPAGO (v22) ============
  const [dPhase, setDPhase] = useState<"idle" | "wait" | "go" | "round" | "over">("idle");
  const [dRound, setDRound] = useState(0);
  const [dWins, setDWins] = useState(0);
  const [dMsg, setDMsg] = useState("");
  const dGoAt = useRef(0);
  const dWinsRef = useRef(0);
  const dTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const dClear = () => { dTimers.current.forEach(clearTimeout); dTimers.current = []; };

  const armDuelo = () => {
    setDPhase("wait");
    const delay = 1200 + Math.random() * 2300;
    dTimers.current.push(setTimeout(() => {
      dGoAt.current = Date.now();
      sfx.beep();
      setDPhase("go");
    }, delay));
  };

  const startDuelo = () => {
    dClear();
    dWinsRef.current = 0;
    setDWins(0); setDRound(1); setDMsg("Espera la señal verde... tocar antes = descalificación");
    setGame("duelo");
    armDuelo();
  };
  useEffect(() => () => dClear(), []);

  const dEndRound = () => {
    setDPhase("round");
    dTimers.current.push(setTimeout(() => {
      if (dRound >= 5) {
        setDPhase("over");
        const prize = dWinsRef.current * 40 + 10;
        setTimeout(() => {
          reward(prize, 30, "ARCADE: duelo relampago");
          sfx.success();
          toast.success(`Duelo finalizado: ${dWinsRef.current}/5 rondas`, { description: `+${prize} mon · +30 xp` });
        }, 150);
      } else {
        setDRound((r) => r + 1);
        setDMsg(`Ronda ${dRound + 1} · prepara el dedo...`);
        armDuelo();
      }
    }, 1500));
  };

  const dTap = () => {
    if (dPhase === "wait") {
      // demasiado pronto: pierde la ronda
      dClear();
      sfx.error();
      setDMsg("¡Demasiado pronto! Ronda perdida por ansioso");
      dEndRound();
      return;
    }
    if (dPhase !== "go") return;
    dClear();
    const you = Date.now() - dGoAt.current;
    const bot = 230 + Math.floor(Math.random() * 220);
    const win = you < bot;
    if (win) { dWinsRef.current += 1; setDWins(dWinsRef.current); sfx.coin(); setDMsg(`GANASTE: ${you}ms vs ${bot}ms del bot`); }
    else { sfx.error(); setDMsg(`El bot fue más rápido: ${bot}ms vs tus ${you}ms`); }
    dEndRound();
  };

  // ============ v26 · 10. RADAR FURIA ============
  const [rfDrones, setRfDrones] = useState<{ id: number; cell: number; born: number; ttl: number; hostile: boolean }[]>([]);
  const [rfScore, setRfScore] = useState(0);
  const [rfCombo, setRfCombo] = useState(0);
  const [rfBest, setRfBest] = useState(0);
  const [rfTime, setRfTime] = useState(45);
  const [rfLives, setRfLives] = useState(3);
  const [rfFever, setRfFever] = useState(0); // segundos restantes de FIEBRE x3
  const [rfHits, setRfHits] = useState(0);
  const [rfOver, setRfOver] = useState(false);
  const rfId = useRef(0);
  const rfRewarded = useRef(false);
  const rfComboRef = useRef(0);
  const rfHitsRef = useRef(0);
  const rfTickRef = useRef(0);
  const rfTimeRef = useRef(45);

  const startRadar = () => {
    rfRewarded.current = false;
    rfId.current = 0;
    rfComboRef.current = 0;
    rfHitsRef.current = 0;
    rfTickRef.current = 0;
    rfTimeRef.current = 45;
    setRfDrones([]); setRfScore(0); setRfCombo(0); setRfBest(0);
    setRfTime(45); setRfLives(3); setRfFever(0); setRfHits(0); setRfOver(false);
    setGame("radar");
  };

  useEffect(() => {
    if (game !== "radar" || rfOver) return;
    const tick = setInterval(() => {
      const now = Date.now();
      // v26: cronómetro real — 10 ticks de 100ms = 1 segundo (antes corría 10x)
      rfTickRef.current += 1;
      if (rfTickRef.current % 10 === 0) {
        setRfTime((t) => {
          if (t <= 1) {
            setRfOver(true);
            return 0;
          }
          return t - 1;
        });
        rfTimeRef.current = Math.max(0, rfTimeRef.current - 1);
        // la FIEBRE también corre en segundos reales
        setRfFever((f) => (f > 0 ? f - 1 : 0));
      }
      // expirar drones
      setRfDrones((ds) => {
        const alive = ds.filter((d) => {
          if (now - d.born < d.ttl) return true;
          if (d.hostile) {
            // dron que escapa: pierdes 1 vida, combo a 0
            rfComboRef.current = 0;
            setRfCombo(0);
            setRfLives((l) => {
              if (l <= 1) {
                setRfOver(true);
                return 0;
              }
              return l - 1;
            });
            sfx.droneLeak();
          }
          return false;
        });
        // spawn: frecuencia sube con el tiempo y en FIEBRE
        // (probabilidad POR TICK de 100ms — 0.02 ≈ 1 dron cada 5s al inicio)
        const feverOn = rfFever > 0;
        const elapsed = 45 - rfTimeRef.current;
        const chance = feverOn ? 0.09 : Math.min(0.055, 0.018 + elapsed * 0.0009);
        if (alive.length < (feverOn ? 5 : 3) && Math.random() < chance) {
          const used = new Set(alive.map((d) => d.cell));
          const free = [...Array(12).keys()].filter((c) => !used.has(c));
          if (free.length) {
            const hostile = Math.random() > 0.18; // 18% son aviones aliados (NO tocar)
            alive.push({ id: ++rfId.current, cell: free[Math.floor(Math.random() * free.length)], born: now, ttl: feverOn ? 1300 : Math.max(1000, 1900 - elapsed * 18), hostile });
          }
        }
        return alive;
      });
    }, 100);
    return () => clearInterval(tick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game, rfOver]);

  // recompensas al terminar la ronda
  useEffect(() => {
    if (game !== "radar" || !rfOver || rfRewarded.current) return;
    rfRewarded.current = true;
    const bonus = rfBest >= 25 ? 40 : rfBest >= 15 ? 20 : 0;
    const coins = Math.min(160, Math.floor(rfBest / 4)) + bonus;
    const xp = Math.min(55, Math.floor(rfBest / 3));
    reward(coins, xp, `Radar Furia: ${rfBest} derribos`);
    sfx.droneEnd();
    if (rfFeverBestRef.current >= 8) toast.success("MODO FIEBRE dominado", { description: `Racha máxima: ${rfBest}` });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game, rfOver]);
  const rfFeverBestRef = useRef(0);

  const rfHit = (id: number, cell: number, hostile: boolean) => {
    if (rfOver) return;
    setRfDrones((ds) => ds.filter((d) => d.id !== id));
    if (hostile) {
      const c = rfComboRef.current + 1;
      rfComboRef.current = c;
      setRfCombo(c);
      if (c > rfBest) setRfBest(c);
      const fever = rfFever > 0 ? 3 : 1;
      setRfScore((s) => s + 10 * fever + Math.min(20, c * 2));
      rfHitsRef.current += 1;
      setRfHits(rfHitsRef.current);
      if (rfHitsRef.current > 0 && rfHitsRef.current % 8 === 0 && rfFever <= 0) {
        setRfFever(7);
        rfFeverBestRef.current += 1;
        toast("🔥 MODO FIEBRE x3", { description: "¡Derriba todo lo que vuele!" });
      }
      sfx.droneHit(Math.min(5, Math.floor(c / 2)));
    } else {
      // ¡aliado derribado! penalización fuerte
      rfComboRef.current = 0;
      setRfCombo(0);
      setRfScore((s) => Math.max(0, s - 30));
      sfx.error();
    }
    void cell;
  };

  // ============ UI ============
  const GAMES = [
    { id: "memoria" as const, name: "MEMORIA DE BANDERAS", desc: "Encuentra las 8 parejas de codigos de pais", icon: <Flag className="w-5 h-5" />, color: "text-cyan-hud border-cyan-hud/60" },
    { id: "historia" as const, name: "ORDENA LA HISTORIA", desc: "3 rondas: toca los eventos del mas antiguo al mas nuevo", icon: <Hourglass className="w-5 h-5" />, color: "text-amber border-amber-hud/60" },
    { id: "quien" as const, name: "QUIEN FUE?", desc: "Adivina el lider por su foto real · 6 rondas", icon: <Camera className="w-5 h-5" />, color: "text-violet-hud border-violet-hud/60" },
    { id: "trivia" as const, name: "TRIVIA RELAMPAGO", desc: "8 segundos por pregunta · 8 preguntas", icon: <Zap className="w-5 h-5" />, color: "text-red-hud border-red-hud/60" },
    { id: "codigo" as const, name: "DESCIFRA EL CODIGO", desc: "Morse, Enigma y código Navajo · 60 segundos · pistas 15 mon", icon: <KeyRound className="w-5 h-5" />, color: "text-neon border-neon-hud/60" },
    { id: "negociador" as const, name: "NEGOCIADOR DE PAZ", desc: "Crisis real, tu propuesta, la comunidad vota · 70% aprueba", icon: <Handshake className="w-5 h-5" />, color: "text-electric border-electric-hud/60" },
    { id: "banderas" as const, name: "QUIZ DE BANDERAS", desc: "5 segundos por bandera · 10 rondas contrarreloj", icon: <Flag className="w-5 h-5" />, color: "text-amber border-amber-hud/60" },
    { id: "antimisil" as const, name: "ANTIMISIL", desc: "Intercepta misiles antes de que caigan · base con 3 vidas · 45s", icon: <Rocket className="w-5 h-5" />, color: "text-red-hud border-red-hud/60" },
    { id: "duelo" as const, name: "DUELO RELAMPAGO", desc: "5 rondas de reflejos contra el bot · toca solo en verde", icon: <Swords className="w-5 h-5" />, color: "text-green-hud border-green-hud/60" },
    { id: "radar" as const, name: "RADAR FURIA v26", desc: "Derriba drones en 45s · combo x3 y MODO FIEBRE · no toques aliados", icon: <Crosshair className="w-5 h-5" />, color: "text-amber border-amber-hud/60" },
  ];

  const startGame = (id: Exclude<GameId, null>) => {
    sfx.levelUp();
    if (id === "memoria") startMemoria();
    else if (id === "historia") startHistoria();
    else if (id === "quien") startQuien();
    else if (id === "trivia") startTrivia();
    else if (id === "codigo") startCodigo();
    else if (id === "negociador") startNegociador();
    else if (id === "banderas") startBanderas();
    else if (id === "antimisil") startAntimisil();
    else if (id === "duelo") startDuelo();
    else if (id === "radar") startRadar();
  };

  return (
    <div className="space-y-3">
      <PanelHeader title="ARCADE PACK" subtitle="10 minijuegos rapidos · monedas y XP al ganar" icon={<Gamepad2 className="w-4 h-4" />} color="red" />

      {!game && <CommunityGames />}

      {!game && (
        <div className="grid sm:grid-cols-2 gap-2">
          {GAMES.map((g) => (
            <button key={g.id} onClick={() => startGame(g.id)}
              className={cn("hud-corner border p-4 text-left transition-colors", g.color)}>
              <div className="flex items-center gap-2 mb-1">{g.icon}<span className="font-mono font-bold text-sm uppercase tracking-wider">{g.name}</span></div>
              <p className="text-[10px] font-mono text-muted-foreground">{g.desc}</p>
            </button>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {game === "radar" && (
          <motion.div key="rf" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hud-corner border bg-secondary/20 p-3">
            <div className="flex justify-between items-center mb-2 flex-wrap gap-1">
              <span className="text-[10px] font-mono text-amber font-bold uppercase">
                Radar Furia · puntos {rfScore} · racha {rfCombo}{rfFever > 0 && <span className="text-red-hud"> 🔥FIEBRE x3 ({rfFever}s)</span>}
              </span>
              <div className="flex items-center gap-2">
                <span className={cn("flex items-center gap-1 font-mono text-sm font-bold", rfTime <= 10 ? "text-red-hud blink-soft" : "text-cyan-hud")}>
                  <Clock className="w-4 h-4" /> {rfTime}s
                </span>
                <span className="font-mono text-[10px] text-muted-foreground">{"|".repeat(rfLives)}{"/".repeat(3 - rfLives) || ""} {rfLives} vidas</span>
                <Button size="sm" variant="ghost" onClick={() => setGame(null)} className="h-6 text-[10px] font-mono"><RotateCcw className="w-3 h-3 mr-1" /> SALIR</Button>
              </div>
            </div>
            {!rfOver ? (
              <>
                <div className="grid grid-cols-4 gap-1.5">
                  {[...Array(12).keys()].map((c) => {
                    const d = rfDrones.find((x) => x.cell === c);
                    return (
                      <button
                        key={c}
                        onClick={() => d && rfHit(d.id, c, d.hostile)}
                        className={cn(
                          "h-14 sm:h-16 border rounded-sm font-mono font-bold flex items-center justify-center text-xl transition-all duration-100",
                          !d && "border-border/60 bg-black/30 hover:border-amber-hud/40",
                          d && d.hostile && "border-red-hud bg-red-hud/25 text-red-hud",
                          d && !d.hostile && "border-green-hud bg-green-hud/25 text-green-hud"
                        )}
                      >
                        {d ? (d.hostile ? (rfFever > 0 ? "🔥🛸" : "🛸") : "✈️") : "·"}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[9px] font-mono text-muted-foreground mt-2">
                  🛸 DRON ENEMIGO = toca · ✈️ AVIÓN ALIADO = NO toques (−30) · 8 derribos = 🔥 FIEBRE x3
                </p>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="font-display text-lg font-black tracking-widest text-amber mb-1">RADAR DESCONECTADO</div>
                <div className="font-mono text-[11px] text-muted-foreground mb-1">
                  {rfBest} derribos en racha · {rfScore} puntos · {rfHits} objetivos
                </div>
                <div className="font-mono text-[10px] text-green-hud mb-3">recompensa enviada a tu cuenta ✓</div>
                <Button size="sm" variant="outline" onClick={startRadar} className="mt-1 font-mono text-[10px]">
                  <RotateCcw className="w-3 h-3 mr-1" /> OTRA RONDA
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {game === "memoria" && (
          <motion.div key="mem" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hud-corner border bg-secondary/20 p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-mono text-amber font-bold uppercase">Memoria de banderas · jugadas: {memMoves}</span>
              <Button size="sm" variant="ghost" onClick={() => setGame(null)} className="h-6 text-[10px] font-mono"><RotateCcw className="w-3 h-3 mr-1" /> SALIR</Button>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {memCards.map((c, i) => (
                <button key={i} onClick={() => clickMem(i)}
                  className={cn("h-14 sm:h-16 border rounded-sm font-mono font-bold flex items-center justify-center transition-all duration-200",
                    c.done ? "border-green-hud/60 bg-green-hud/15 text-green-hud" : c.flipped ? "border-amber-hud bg-amber-hud/20 text-amber" : "border-border/60 bg-background text-transparent hover:border-amber-hud/40")}>
                  {c.done || c.flipped ? c.code : "?"}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {game === "historia" && (
          <motion.div key="tl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hud-corner border bg-secondary/20 p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-mono text-amber font-bold uppercase">Ordena la historia · ronda {tlRound}/3 · fallos {tlFails}</span>
              <Button size="sm" variant="ghost" onClick={() => setGame(null)} className="h-6 text-[10px] font-mono"><RotateCcw className="w-3 h-3 mr-1" /> SALIR</Button>
            </div>
            {tlOrder.length > 0 && (
              <div className="mb-2 space-y-1">
                {[...tlEvents].sort((a, b) => a.year - b.year).filter((e) => tlOrder.includes(e.year)).map((e) => (
                  <div key={e.year} className="text-[10px] font-mono text-green-hud">✓ {e.year} · {e.text}</div>
                ))}
              </div>
            )}
            <div className="space-y-1.5">
              {tlEvents.filter((e) => !tlOrder.includes(e.year)).map((e) => (
                <button key={e.year} onClick={() => clickTl(e.year)}
                  className="w-full border border-border/60 bg-background px-2.5 py-2 text-left text-[11px] font-mono text-foreground hover:border-amber-hud/60 transition-colors">
                  {e.text}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {game === "quien" && qfTarget && (
          <motion.div key="qf" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hud-corner border bg-secondary/20 p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-mono text-amber font-bold uppercase">Quien fue? · ronda {qfN + 1}/6 · aciertos {qfScore}</span>
              <Button size="sm" variant="ghost" onClick={() => setGame(null)} className="h-6 text-[10px] font-mono"><RotateCcw className="w-3 h-3 mr-1" /> SALIR</Button>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qfTarget.img} alt="lider misterioso" className="w-full sm:w-44 h-52 object-cover border border-amber-hud/50" />
              <div className="flex-1 space-y-1.5">
                {qfOptions.map((o) => (
                  <button key={o} onClick={() => answerQuien(o)}
                    className="w-full border border-border/60 bg-background px-2.5 py-2 text-left text-[11px] font-mono text-foreground hover:border-amber-hud/60 transition-colors">
                    {o}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {game === "trivia" && tvQ && (
          <motion.div key="tv" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hud-corner border bg-secondary/20 p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-mono text-amber font-bold uppercase">Trivia relampago · {tvN + 1}/8 · aciertos {tvScore}</span>
              <span className={cn("flex items-center gap-1 font-mono text-sm font-bold", tvLeft <= 3 ? "text-red-hud blink-soft" : "text-cyan-hud")}>
                <Clock className="w-4 h-4" /> {tvLeft}s
              </span>
            </div>
            <p className="text-xs font-mono text-foreground mb-2">{tvQ.q}</p>
            <div className="grid sm:grid-cols-2 gap-1.5">
              {tvQ.options.map((o, i) => (
                <button key={i} onClick={() => answerTv(i)}
                  className="border border-border/60 bg-background px-2.5 py-2 text-left text-[11px] font-mono text-foreground hover:border-amber-hud/60 transition-colors">
                  {o}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {game === "codigo" && (
          <motion.div key="cp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hud-corner border bg-secondary/20 p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-mono text-neon font-bold uppercase">Descifra el código · {cpN + 1}/6 · aciertos {cpScore}</span>
              <span className={cn("flex items-center gap-1 font-mono text-sm font-bold", cpTime <= 10 ? "text-red-hud blink-soft" : "text-cyan-hud")}>
                <Clock className="w-4 h-4" /> {cpTime}s
              </span>
            </div>
            {!cpDone && cpQ && (
              <>
                <div className="border border-neon-hud/40 bg-black/40 px-3 py-3 mb-2 text-center">
                  <div className="font-mono text-[8px] text-muted-foreground uppercase tracking-widest mb-1">{cpQ.type} · {cpQ.prompt}</div>
                  <div className={cn("font-bold tracking-[0.25em]", cpQ.type === "MORSE" ? "font-mono text-base text-neon" : cpQ.type === "ENIGMA" ? "font-tech text-xl text-amber" : "font-tech text-lg text-electric")}>
                    {cpQ.code}
                  </div>
                  {cpHint && <div className="mt-1 font-mono text-[9px] text-amber">PISTA comprada: empieza por "{cpQ.options[cpQ.a].slice(0, 2)}..."</div>}
                </div>
                <div className="grid sm:grid-cols-2 gap-1.5">
                  {cpQ.options.map((o, i) => (
                    <button key={i} onClick={() => answerCodigo(i)}
                      className="border border-border/60 bg-background px-2.5 py-2 text-left text-[11px] font-mono text-foreground hover:border-neon-hud/60 transition-colors">
                      {o}
                    </button>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <Button size="sm" variant="ghost" onClick={buyHint} className="h-6 text-[10px] font-mono text-amber">
                    <Lightbulb className="w-3 h-3 mr-1" /> PISTA (15 mon)
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setGame(null)} className="h-6 text-[10px] font-mono"><RotateCcw className="w-3 h-3 mr-1" /> SALIR</Button>
                </div>
              </>
            )}
            {cpDone && (
              <div className="text-center py-4">
                <div className="font-display text-lg font-black tracking-widest text-neon mb-1">MENSAJE DESCIFRADO</div>
                <div className="font-mono text-[11px] text-muted-foreground mb-3">{cpScore} códigos rotos en el tiempo disponible</div>
                {cpQ && <div className="text-[10px] font-mono text-amber/80 max-w-md mx-auto">¿SABIAS? {cpQ.fact}</div>}
                <Button size="sm" variant="outline" onClick={() => setGame(null)} className="mt-3 font-mono text-[10px]">
                  <RotateCcw className="w-3 h-3 mr-1" /> VOLVER
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {game === "negociador" && ngQ && (
          <motion.div key="ng" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hud-corner border bg-secondary/20 p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-mono text-electric font-bold uppercase">Negociador de paz</span>
              <Button size="sm" variant="ghost" onClick={() => setGame(null)} className="h-6 text-[10px] font-mono"><RotateCcw className="w-3 h-3 mr-1" /> SALIR</Button>
            </div>
            <div className="font-tech text-sm font-bold text-foreground">{ngQ.conflict}</div>
            <p className="text-[10px] font-mono text-muted-foreground leading-relaxed my-2">{ngQ.brief}</p>

            {ngPhase === "pick" && (
              <div className="space-y-1.5">
                <div className="font-mono text-[9px] text-muted-foreground uppercase">Presenta tu propuesta al comité:</div>
                {ngQ.options.map((o, i) => (
                  <button key={i} onClick={() => pickNegociador(i)}
                    className="w-full border border-border/60 bg-background px-2.5 py-2 text-left text-[11px] font-mono text-foreground hover:border-electric-hud/60 transition-colors">
                    {o.text}
                  </button>
                ))}
              </div>
            )}
            {(ngPhase === "voting" || ngPhase === "result") && ngPick !== null && (
              <div className="border border-electric-hud/40 p-3">
                <div className="font-mono text-[10px] font-bold text-electric uppercase mb-1">Tu propuesta:</div>
                <div className="text-[11px] font-mono text-foreground mb-2">{ngQ.options[ngPick].text}</div>
                <div className="flex justify-between font-mono text-[9px] text-muted-foreground mb-1">
                  <span>Aprobación de la comunidad</span>
                  <span className={cn("font-bold tabular-nums", ngApproval >= 70 ? "text-neon" : ngApproval >= 50 ? "text-amber" : "text-crisis")}>{ngApproval}% (se necesita 70%)</span>
                </div>
                <div className="h-2 bg-secondary overflow-hidden border border-border">
                  <div className={cn("h-full vg-transition", ngApproval >= 70 ? "bg-neon" : "bg-electric")} style={{ width: `${ngApproval}%` }} />
                </div>
                {ngPhase === "result" && (
                  <div className="mt-3 border-t border-border pt-2">
                    <div className="font-mono text-[9px] text-amber uppercase tracking-widest mb-1">Lo que pasó realmente:</div>
                    <p className="text-[10px] font-mono text-foreground/90 leading-relaxed">{ngQ.real}</p>
                    <div className="flex gap-1.5 mt-2">
                      <Button size="sm" variant="outline" onClick={startNegociador} className="font-mono text-[9px] h-6">OTRA CRISIS</Button>
                      <Button size="sm" variant="ghost" onClick={() => setGame(null)} className="font-mono text-[9px] h-6">SALIR</Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {game === "banderas" && fbTarget && (
          <motion.div key="fb" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hud-corner border bg-secondary/20 p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-mono text-amber font-bold uppercase">Quiz de banderas · {fbN + 1}/10 · aciertos {fbScore}</span>
              <span className={cn("flex items-center gap-1 font-mono text-sm font-bold", fbLeft <= 2 ? "text-red-hud blink-soft" : "text-cyan-hud")}>
                <Clock className="w-4 h-4" /> {fbLeft}s
              </span>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="w-40 h-24 hud-corner border border-amber-hud/60 flex items-center justify-center bg-background flex-shrink-0">
                <FlagBadge code={fbTarget.code} size="lg" className="!text-lg !px-3 !py-1.5 !min-w-[70px]" />
              </div>
              <div className="flex-1 w-full grid sm:grid-cols-2 gap-1.5">
                {fbOptions.map((o) => (
                  <button key={o} onClick={() => answerFlag(o)}
                    className="border border-border/60 bg-background px-2.5 py-2 text-left text-[11px] font-mono text-foreground hover:border-amber-hud/60 transition-colors">
                    {o}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {game === "antimisil" && (
          <motion.div key="am" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hud-corner border bg-secondary/20 p-3">
            <div className="flex justify-between items-center mb-2 flex-wrap gap-1">
              <span className="text-[10px] font-mono text-red-hud font-bold uppercase">Antimisil · pts {amScore}</span>
              <div className="flex items-center gap-3 text-[10px] font-mono">
                <span className="text-amber flex items-center gap-1"><Shield className="w-3 h-3" /> {Math.max(0, amLives)}/3</span>
                <span className={cn("flex items-center gap-1", amLeft <= 10 ? "text-red-hud blink-soft" : "text-cyan-hud")}><Clock className="w-3 h-3" /> {amLeft}s</span>
                <Button size="sm" variant="ghost" onClick={() => { stopAm(); setGame(null); }} className="h-6 text-[10px] font-mono"><RotateCcw className="w-3 h-3 mr-1" /> SALIR</Button>
              </div>
            </div>
            {!amOver ? (
              <div
                className="relative overflow-hidden scanline hud-corner select-none"
                style={{ aspectRatio: "16/9", minHeight: 240 }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-green-hud/10" />
                {/* skyline de la base */}
                <div className="absolute bottom-0 inset-x-0 h-[12%] bg-black/50 border-t border-green-hud/30" />
                {/* ciudades: 3 vidas */}
                <div className="absolute bottom-1 inset-x-0 flex justify-center gap-6">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className={cn("w-8 h-5 border", i < Math.max(0, amLives) ? "border-green-hud/70 bg-green-hud/30" : "border-red-hud/40 bg-red-hud/10 opacity-40")} />
                  ))}
                </div>
                {/* misiles */}
                {amMissiles.map((m) => (
                  <button
                    key={m.id}
                    onClick={(e) => amShoot(m, e)}
                    className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center hover:scale-125 transition-transform z-10"
                    style={{ left: `${m.x}%`, top: `${m.y}%` }}
                    aria-label="interceptar misil"
                  >
                    <span className="block w-2.5 h-2.5 rounded-full bg-red-hud glow-red" />
                    <span className="absolute inset-0 rounded-full border border-red-hud/40 animate-ping" />
                  </button>
                ))}
                {/* retícula central decorativa */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
                  <Crosshair className="w-24 h-24 text-red-hud" />
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <Rocket className="w-10 h-10 mx-auto text-amber mb-2" />
                <div className="font-display text-lg font-black tracking-widest text-amber">DEFENSA FINALIZADA</div>
                <div className="font-mono text-[11px] text-muted-foreground mt-1">{amScore} puntos · base {Math.max(0, amLives) > 0 ? "de pie" : "destruida"}</div>
                <div className="flex gap-2 justify-center mt-3">
                  <Button size="sm" variant="outline" onClick={startAntimisil} className="font-mono text-[10px]"><RotateCcw className="w-3 h-3 mr-1" /> JUGAR DE NUEVO</Button>
                  <Button size="sm" variant="ghost" onClick={() => setGame(null)} className="font-mono text-[10px]">VOLVER</Button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {game === "duelo" && (
          <motion.div key="dl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hud-corner border bg-secondary/20 p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-mono text-green-hud font-bold uppercase">Duelo relampago · ronda {Math.min(dRound, 5)}/5 · ganadas {dWins}</span>
              <Button size="sm" variant="ghost" onClick={() => { dClear(); setGame(null); }} className="h-6 text-[10px] font-mono"><RotateCcw className="w-3 h-3 mr-1" /> SALIR</Button>
            </div>
            {dPhase !== "over" ? (
              <>
                <button
                  onClick={dTap}
                  className={cn(
                    "w-full hud-corner flex flex-col items-center justify-center gap-2 transition-colors duration-150 select-none",
                    dPhase === "wait" && "bg-red-hud/15 border-red-hud/60",
                    dPhase === "go" && "bg-green-hud/25 border-green-hud glow-green",
                    dPhase === "round" && "bg-secondary/30 border-amber-hud/50"
                  )}
                  style={{ minHeight: 220 }}
                >
                  {dPhase === "wait" && <><Swords className="w-10 h-10 text-red-hud" /><span className="font-mono font-bold text-sm text-red-hud uppercase tracking-widest">ESPERA LA SEÑAL...</span></>}
                  {dPhase === "go" && <><Zap className="w-12 h-12 text-green-hud" /><span className="font-mono font-black text-2xl text-green-hud uppercase tracking-widest blink-soft">¡AHORA!</span></>}
                  {dPhase === "round" && <><Clock className="w-8 h-8 text-amber" /><span className="font-mono text-xs text-foreground">{dMsg}</span></>}
                </button>
                <div className="text-center text-[9px] font-mono text-muted-foreground mt-2">{dMsg}</div>
              </>
            ) : (
              <div className="text-center py-6">
                <Swords className="w-10 h-10 mx-auto text-amber mb-2" />
                <div className="font-display text-lg font-black tracking-widest text-amber">DUELO TERMINADO</div>
                <div className="font-mono text-[11px] text-muted-foreground mt-1">{dWins}/5 rondas ganadas contra el bot</div>
                <div className="flex gap-2 justify-center mt-3">
                  <Button size="sm" variant="outline" onClick={startDuelo} className="font-mono text-[10px]"><RotateCcw className="w-3 h-3 mr-1" /> REVANCHA</Button>
                  <Button size="sm" variant="ghost" onClick={() => setGame(null)} className="font-mono text-[10px]">VOLVER</Button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!game && (
        <div className="text-center text-[9px] font-mono text-muted-foreground/60 uppercase tracking-widest flex items-center justify-center gap-1">
          <Brain className="w-3 h-3" /> los premios alimentan misiones, torneos y retos diarios
        </div>
      )}
    </div>
  );
}
