"use client";

// VANGUARD v83.0 ESTADIO GLOBAL — MULTIJUGADOR: DESAFÍO POR CÓDIGO (PVP asíncrono).
// Reta a cualquier operador del mundo SIN servidor: Vanguard genera un código de
// desafío (semilla + apuesta), tú y tu rival jugáis las MISMAS 5 preguntas y os
// pasáis los códigos de resultado por cualquier vía (chat, WhatsApp, papel).
// Cada dispositivo liquida su propio bote: gana el más rápido de acertar todo…
// gana el que más acierte. Honor de operador.
//   Código de desafío:  VG83-SEED-APUESTA-CHK
//   Código de resultado: VG83-SEED-APUESTA-PUNTOS-CHK

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  QrCode, Copy, Share2, ClipboardPaste, Swords, Check, X, Coins, ChevronRight, Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useGameStore } from "@/lib/game-store";
import { sfx } from "@/lib/sound";
import { toast } from "sonner";

// ====== banco de preguntas tácticas (24) ======
interface DesafioQ { q: string; o: [string, string, string, string]; a: number; }
const BANCO: DesafioQ[] = [
  { q: "¿Qué línea defensiva francesa quedó obsoleta en 1940?", o: ["Línea Maginot", "Línea Sigfrido", "Muro del Atlántico", "Línea Gustav"], a: 0 },
  { q: "El estrecho entre Irán y Omán, arteria del petróleo, se llama…", o: ["Bósforo", "Ormuz", "Malaca", "Bering"], a: 1 },
  { q: "¿Qué alianza militar firma el artículo 5 de defensa colectiva?", o: ["ONU", "OTAN", "BRICS", "ASEAN"], a: 1 },
  { q: "Operación que aterriza en Normandía el 6 de junio de 1944:", o: ["Barbarroja", "Overlord", "Torch", "Market Garden"], a: 1 },
  { q: "El muro que dividió una capital cayó en…", o: ["1961", "1975", "1989", "1991"], a: 2 },
  { q: "¿Qué país tiene el mayor número de husos horarios?", o: ["Rusia", "EE.UU.", "China", "Francia"], a: 3 },
  { q: "Grupo de elites británicas nacido en el desierto de África (1941):", o: ["SAS", "SBS", "Commandos", "Gurkhas"], a: 0 },
  { q: "La doctrina de 'guerra relámpago' mecanizada se llama…", o: ["Blitzkrieg", "Trenchcraft", "Attrition", "Scorched earth"], a: 0 },
  { q: "¿Cuál es la agencia de inteligencia exterior de Rusia?", o: ["FSB", "GRU", "SVR", "KGB"], a: 2 },
  { q: "El canal artificial que une el Mediterráneo y el Mar Rojo:", o: ["Panamá", "Kiel", "Corinto", "Suez"], a: 3 },
  { q: "¿Qué letra designa en la OTAN al misil aire-aire Sidewinder?", o: ["AIM-9", "AGM-84", "FGM-148", "RIM-162"], a: 0 },
  { q: "Batalla aeronaval decisiva del Pacífico (junio 1942):", o: ["Coral Sea", "Midway", "Leyte", "Guadalcanal"], a: 1 },
  { q: "El Muro de Berlín medía de largo aproximadamente…", o: ["15 km", "43 km", "155 km", "300 km"], a: 2 },
  { q: "¿Qué país regalo 'la Florida' a EE.UU. en 1819?", o: ["Francia", "España", "México", "Reino Unido"], a: 1 },
  { q: "Satélites de alerta temprana se conocen como sistema…", o: ["DEW", "GPS", "AWACS", "DSP"], a: 3 },
  { q: "La 'Cortina de Hierro' la nombró Churchill en…", o: ["1945", "1946", "1947", "1949"], a: 1 },
  { q: "¿Qué estrecho separa Asia de América del Norte?", o: ["Sunda", "Bering", "Magallanes", "Taiwán"], a: 1 },
  { q: "Cifrado nazi de rotores roto por los aliados en Bletchley:", o: ["Lorenz", "Enigma", "Purple", "Hagelin"], a: 1 },
  { q: "La ONU tiene su sede en…", o: ["Ginebra", "Viena", "Nueva York", "La Haya"], a: 2 },
  { q: "¿Qué potencias firmaron el tratado SALT?", o: ["EE.UU.-URSS", "OTAN-Pacto de Varsovia", "China-India", "Francia-Argelia"], a: 0 },
  { q: "El submarino más profundo hundido en combate (1970, Fjord de)…", o: ["Barents", "Noruega", "Báltico", "Kola"], a: 1 },
  { q: "Operación israelí de rescate en Entebbe (1976):", o: ["Rafael", "Yonatán", "Trueno", "Cóndor"], a: 1 },
  { q: "¿Qué país tiene la mayor frontera del mundo con otro solo país?", o: ["China", "Canadá", "Argentina", "Kazajistán"], a: 1 },
  { q: "La 'Guerra de las Galápagas' enfrentó a Argentina con…", o: ["Chile", "Brasil", "Reino Unido", "Uruguay"], a: 2 },
];

// ====== RNG determinista ======
function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const ALFABETO = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // sin I,L,O,0,1 — legibles a mano
function seedNueva(): string {
  let s = "";
  for (let i = 0; i < 4; i++) s += ALFABETO[Math.floor(Math.random() * ALFABETO.length)];
  return s;
}
function chk(payload: string): string {
  return ALFABETO[hashStr("VG83" + payload) % ALFABETO.length];
}
function preguntasDe(seed: string): DesafioQ[] {
  const rng = mulberry32(hashStr("vanguard83:" + seed));
  const idx = BANCO.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx.slice(0, 5).map((i) => BANCO[i]);
}

// ====== códigos ======
// v84 FORTUNA: botes altos para duelos de alto riesgo — 500 y 1000ⓒ
const APUESTAS = [50, 100, 250, 500, 1000] as const;
type Apuesta = (typeof APUESTAS)[number];

function codigoDesafio(seed: string, apuesta: number): string {
  const p = `${seed}-${apuesta}`;
  return `VG83-${p}-${chk(p)}`;
}
function codigoResultado(seed: string, apuesta: number, score: number): string {
  const p = `${seed}-${apuesta}-${score}`;
  return `VG83-${p}-${chk(p)}`;
}
function parseCodigo(raw: string): { seed: string; apuesta: number; score: number | null } | null {
  const parts = raw.trim().toUpperCase().replace(/\s+/g, "").split("-").filter(Boolean);
  if (parts.length < 4 || parts[0] !== "VG83") return null;
  const seed = parts[1];
  const apuesta = parseInt(parts[2], 10);
  if (!/^[A-Z2-9]{4}$/.test(seed) || !APUESTAS.includes(apuesta as Apuesta)) return null;
  if (parts.length === 4) {
    return chk(`${seed}-${apuesta}`) === parts[3] ? { seed, apuesta, score: null } : null;
  }
  const score = parseInt(parts[3], 10);
  if (!Number.isFinite(score) || score < 0 || score > 5) return null;
  return chk(`${seed}-${apuesta}-${score}`) === parts[4] ? { seed, apuesta, score } : null;
}

// ====== persistencia ======
interface Reto {
  key: string; // seed-apuesta
  seed: string; apuesta: number;
  miScore: number | null; rivalScore: number | null;
  veredicto: "esperando" | "gane" | "perdi" | "empate" | null;
  ts: number;
}
const LS_KEY = "vg83_desafios";
function loadRetos(): Reto[] {
  try {
    const raw = JSON.parse(localStorage.getItem(LS_KEY) || "[]") as Reto[];
    return Array.isArray(raw) ? raw.slice(-12) : [];
  } catch { return []; }
}
function saveRetos(r: Reto[]) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(r.slice(-12))); } catch { /* noop */ }
}

type Fase = "menu" | "jugando" | "resultado";

export function DesafioCodigo({ alias }: { alias: string }) {
  const spendCoins = useGameStore((s) => s.spendCoins);
  const addCoins = useGameStore((s) => s.addCoins);

  const [retos, setRetos] = useState<Reto[]>([]);
  const [fase, setFase] = useState<Fase>("menu");
  const [rol, setRol] = useState<"creador" | "rival">("creador");
  const [reto, setReto] = useState<Reto | null>(null);
  const [preguntas, setPreguntas] = useState<DesafioQ[]>([]);
  const [idx, setIdx] = useState(0);
  const [elegida, setElegida] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [inputReto, setInputReto] = useState("");
  const [inputLiquidar, setInputLiquidar] = useState("");
  const [targetKey, setTargetKey] = useState<string | null>(null); // reto a liquidar

  useEffect(() => { setRetos(loadRetos()); }, []);

  const compartir = useCallback(async (texto: string) => {
    try {
      if (navigator.share) {
        await navigator.share({ title: "DESAFÍO VANGUARD", text: texto });
        return;
      }
      throw new Error("no-share");
    } catch {
      try {
        await navigator.clipboard.writeText(texto);
        toast.success("Código copiado", { description: texto });
      } catch {
        toast.error("No se pudo copiar — copia a mano: " + texto);
      }
    }
  }, []);

  // ====== jugar 5 preguntas ======
  const responder = (o: number) => {
    if (elegida !== null) return;
    setElegida(o);
    const ok = o === preguntas[idx].a;
    if (ok) { setScore((s) => s + 1); sfx.success(); } else { sfx.error(); }
    setTimeout(() => {
      if (idx + 1 >= preguntas.length) {
        terminar(ok ? score + 1 : score);
      } else {
        setIdx((i) => i + 1);
        setElegida(null);
      }
    }, 750);
  };

  const terminar = (final: number) => {
    if (!reto) return;
    setScore(final);
    sfx.levelUp();
    // guarda/actualiza el reto local
    setRetos((prev) => {
      const otros = prev.filter((r) => r.key !== reto.key);
      const actualizado: Reto = { ...reto, miScore: final };
      saveRetos([...otros, actualizado]);
      return [...otros, actualizado];
    });
    setReto({ ...reto, miScore: final });
    setFase("resultado");
  };

  // ====== CREAR ======
  const crear = (apuesta: Apuesta) => {
    if (!spendCoins(apuesta, "DESAFÍO: apuesta al bote")) {
      toast.error("No tienes monedas para esa apuesta");
      return;
    }
    const seed = seedNueva();
    const nuevo: Reto = { key: `${seed}-${apuesta}`, seed, apuesta, miScore: null, rivalScore: null, veredicto: null, ts: Date.now() };
    setRetos((prev) => { const next = [...prev.filter((r) => r.key !== nuevo.key), nuevo]; saveRetos(next); return next; });
    setRol("creador");
    setReto(nuevo);
    setPreguntas(preguntasDe(seed));
    setIdx(0); setScore(0); setElegida(null);
    setFase("jugando");
    sfx.tab();
  };

  // ====== RESPONDER (pegar código de desafío) ======
  const aceptar = () => {
    const parsed = parseCodigo(inputReto);
    if (!parsed || parsed.score !== null) {
      toast.error("Código inválido", { description: "Pega el código de DESAFÍO de tu rival (VG83-XXXX-APUESTA-CHK)" });
      sfx.error();
      return;
    }
    const key = `${parsed.seed}-${parsed.apuesta}`;
    if (retos.some((r) => r.key === key)) {
      toast.info("Ya tienes ese desafío", { description: "Aparece en tu lista — juega o liquida desde ahí" });
      return;
    }
    if (!spendCoins(parsed.apuesta, "DESAFÍO: apuesta al bote")) {
      toast.error(`Necesitas ${parsed.apuesta} monedas para igualar la apuesta`);
      return;
    }
    const nuevo: Reto = { key, seed: parsed.seed, apuesta: parsed.apuesta, miScore: null, rivalScore: null, veredicto: null, ts: Date.now() };
    setRetos((prev) => { const next = [...prev.filter((r) => r.key !== key), nuevo]; saveRetos(next); return next; });
    setRol("rival");
    setReto(nuevo);
    setPreguntas(preguntasDe(parsed.seed));
    setIdx(0); setScore(0); setElegida(null);
    setInputReto("");
    setFase("jugando");
    sfx.tab();
    toast.success("Desafío aceptado", { description: `Mismas 5 preguntas · bote ${parsed.apuesta * 2} mon` });
  };

  // ====== LIQUIDAR (pegar el código de RESULTADO del rival) ======
  const liquidar = () => {
    const parsed = parseCodigo(inputLiquidar);
    if (!parsed || parsed.score === null) {
      toast.error("Código inválido", { description: "Pega el código de RESULTADO de tu rival (lleva los puntos)" });
      sfx.error();
      return;
    }
    const key = `${parsed.seed}-${parsed.apuesta}`;
    const local = loadRetos().find((r) => r.key === key) ?? retos.find((r) => r.key === key);
    if (!local || local.miScore === null) {
      toast.error("No coincide con ninguno de tus desafíos jugados", { description: `Buscando ${key} con tu score ya registrado` });
      return;
    }
    const mio = local.miScore;
    const suyo = parsed.score;
    let veredicto: Reto["veredicto"];
    let pago = 0;
    if (mio > suyo) { veredicto = "gane"; pago = local.apuesta * 2; }
    else if (mio === suyo) { veredicto = "empate"; pago = local.apuesta; }
    else { veredicto = "perdi"; pago = 0; }
    if (pago > 0) addCoins(pago, veredicto === "empate" ? "DESAFÍO: apuesta devuelta (empate)" : "DESAFÍO: bote ganado");
    setRetos((prev) => {
      const next = prev.map((r) => (r.key === key ? { ...r, rivalScore: suyo, veredicto } : r));
      saveRetos(next);
      return next;
    });
    setInputLiquidar("");
    setTargetKey(null);
    sfx.levelUp();
    if (veredicto === "gane") toast.success(`¡BOTÉ GANADO! +${local.apuesta * 2} mon`, { description: `${mio} - ${suyo} · ${alias} domina el código` });
    else if (veredicto === "empate") toast.info(`Empate ${mio} - ${suyo}`, { description: `Apuesta devuelta: +${local.apuesta} mon` });
    else toast.error(`Derrota ${mio} - ${suyo}`, { description: "El rival se queda el bote — revancha disponible" });
  };

  const codigosActuales = useMemo(() => {
    if (!reto) return null;
    return {
      desafio: codigoDesafio(reto.seed, reto.apuesta),
      resultado: reto.miScore !== null ? codigoResultado(reto.seed, reto.apuesta, reto.miScore) : null,
    };
  }, [reto]);

  // ============ UI ============
  if (fase === "jugando" && reto) {
    const q = preguntas[idx];
    return (
      <div className="hud-corner border bg-secondary/20 p-3 space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="text-[10px] font-mono font-bold text-red-hud uppercase tracking-wider flex items-center gap-1.5">
            <Swords className="w-3.5 h-3.5" /> DESAFÍO {reto.seed} · {rol === "creador" ? "CREANDO" : "RESPONDIENDO"}
          </span>
          <span className="text-[10px] font-mono text-muted-foreground">pregunta {idx + 1}/5 · aciertos: {score}</span>
        </div>
        <div className="h-1 bg-background rounded-full overflow-hidden">
          <div className="h-full bg-red-hud transition-all duration-300" style={{ width: `${((idx + (elegida !== null ? 1 : 0)) / 5) * 100}%` }} />
        </div>
        <p className="text-sm font-mono text-foreground leading-relaxed">{q.q}</p>
        <div className="grid sm:grid-cols-2 gap-2">
          {q.o.map((op, i) => (
            <button
              key={i}
              onClick={() => responder(i)}
              disabled={elegida !== null}
              className={cn(
                "text-left px-3 py-2.5 border font-mono text-[11px] transition-colors rounded-sm",
                elegida === null && "border-border/60 hover:border-red-hud hover:bg-red-hud/10",
                elegida !== null && i === q.a && "border-green-hud bg-green-hud/20 text-green-hud",
                elegida !== null && elegida === i && i !== q.a && "border-red-hud bg-red-hud/20 text-red-hud",
                elegida !== null && elegida !== i && i !== q.a && "border-border/40 opacity-50"
              )}
            >
              {elegida !== null && i === q.a && <Check className="w-3 h-3 inline mr-1" />}
              {elegida !== null && elegida === i && i !== q.a && <X className="w-3 h-3 inline mr-1" />}
              {op}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (fase === "resultado" && reto && codigosActuales) {
    return (
      <div className="hud-corner border bg-secondary/20 p-3 space-y-3">
        <div className="flex items-center gap-2">
          <QrCode className="w-4 h-4 text-red-hud" />
          <span className="text-[11px] font-mono font-bold text-red-hud uppercase tracking-wider">
            JUGADO · {score}/5 aciertos
          </span>
        </div>
        <div className="space-y-1.5">
          <div className="text-[9px] font-mono text-muted-foreground uppercase">1 · pasa ESTE código de desafío a tu rival (si aún no lo tiene):</div>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-2.5 py-2 bg-background/70 border border-amber-hud/50 text-amber font-mono text-[12px] tracking-wider rounded-sm overflow-x-auto whitespace-nowrap">
              {codigosActuales.desafio}
            </code>
            <Button size="sm" variant="outline" onClick={() => compartir(`DESAFÍO VANGUARD de ${alias}: juega estas 5 preguntas con el código ${codigosActuales.desafio} (sección MULTIJUGADOR → DESAFÍO) `)} className="h-9 px-2">
              <Share2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="text-[9px] font-mono text-muted-foreground uppercase">2 · cuando te pase su código de RESULTADO, ve a MIS DESAFÍOS y liquida:</div>
          <code className="block px-2.5 py-2 bg-background/70 border border-green-hud/50 text-green-hud font-mono text-[12px] tracking-wider rounded-sm overflow-x-auto whitespace-nowrap">
            {codigosActuales.resultado}
          </code>
        </div>
        <p className="text-[9px] font-mono text-muted-foreground leading-relaxed">
          El bote ya está en depósito ({reto.apuesta} mon). Al liquidar: victoria cobra {reto.apuesta * 2}, empate devuelve {reto.apuesta}.
        </p>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => { setFase("menu"); setReto(null); }} className="font-mono text-[10px]">
            IR A MIS DESAFÍOS
          </Button>
        </div>
      </div>
    );
  }

  // ====== MENU ======
  return (
    <div className="space-y-3">
      <div className="hud-corner border bg-secondary/20 p-3 space-y-3">
        <p className="text-[10px] font-mono text-muted-foreground leading-relaxed">
          PVP asíncrono sin servidor: <b className="text-foreground">crea un desafío</b>, pásale el código a
          cualquier operador (chat, WhatsApp, papel) y liquidad el bote cuando os paséis los
          resultados. Las 5 preguntas salen de la MISMA semilla para los dos.
        </p>

        <div className="grid sm:grid-cols-2 gap-2">
          {/* CREAR */}
          <div className="border border-red-hud/50 bg-red-hud/5 p-2.5 space-y-2 rounded-sm">
            <div className="text-[10px] font-mono font-bold text-red-hud uppercase tracking-wider flex items-center gap-1.5">
              <Swords className="w-3.5 h-3.5" /> Crear desafío
            </div>
            <div className="text-[9px] font-mono text-muted-foreground">elige el bote:</div>
            <div className="flex gap-1.5">
              {APUESTAS.map((a) => (
                <Button key={a} size="sm" onClick={() => crear(a)} className="flex-1 h-8 font-mono text-[10px] bg-red-hud/20 border border-red-hud text-red-hud hover:bg-red-hud/40">
                  <Coins className="w-3 h-3 mr-1" />{a}
                </Button>
              ))}
            </div>
          </div>
          {/* RESPONDER */}
          <div className="border border-amber-hud/50 bg-amber-hud/5 p-2.5 space-y-2 rounded-sm">
            <div className="text-[10px] font-mono font-bold text-amber uppercase tracking-wider flex items-center gap-1.5">
              <ClipboardPaste className="w-3.5 h-3.5" /> Responder código
            </div>
            <input
              value={inputReto}
              onChange={(e) => setInputReto(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && aceptar()}
              placeholder="VG83-XXXX-APUESTA-CHK"
              maxLength={32}
              className="w-full h-8 px-2 bg-background/70 border border-border/60 text-amber font-mono text-[11px] tracking-wider uppercase rounded-sm focus:outline-none focus:border-amber-hud"
              aria-label="Código de desafío"
            />
            <Button size="sm" onClick={aceptar} className="w-full h-8 font-mono text-[10px] bg-amber-hud/25 border border-amber-hud text-amber hover:bg-amber-hud/45">
              ACEPTAR Y JUGAR <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* MIS DESAFÍOS */}
      <div className="hud-corner border bg-secondary/20 p-3 space-y-2">
        <div className="text-[10px] font-mono font-bold text-foreground uppercase tracking-wider">
          Mis desafíos ({retos.length})
        </div>
        {retos.length === 0 && (
          <p className="text-[10px] font-mono text-muted-foreground">
            Todavía no retaste a nadie. Crea un desafío y comparte el código — el bote espera.
          </p>
        )}
        <div className="space-y-1.5">
          {retos.map((r) => (
            <div key={r.key} className="border border-border/50 bg-background/50 p-2 rounded-sm space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap text-[10px] font-mono">
                <span className="text-amber font-bold">{r.seed}</span>
                <span className="text-muted-foreground">bote {r.apuesta * 2} mon</span>
                <span className="text-muted-foreground">
                  · tú {r.miScore ?? "—"} / rival {r.rivalScore ?? "—"}
                </span>
                <span className={cn(
                  "ml-auto px-1.5 py-0.5 border uppercase text-[8px]",
                  r.veredicto === "gane" && "border-green-hud text-green-hud bg-green-hud/15",
                  r.veredicto === "perdi" && "border-red-hud text-red-hud bg-red-hud/15",
                  r.veredicto === "empate" && "border-cyan-hud text-cyan-hud bg-cyan-hud/15",
                  (!r.veredicto || r.veredicto === "esperando") && "border-border/60 text-muted-foreground"
                )}>
                  {r.veredicto === "gane" ? "VICTORIA" : r.veredicto === "perdi" ? "DERROTA" : r.veredicto === "empate" ? "EMPATE" : r.miScore === null ? "SIN JUGAR" : "ESPERANDO RIVAL"}
                </span>
              </div>
              {r.miScore !== null && r.rivalScore === null && (
                <div className="flex items-center gap-1.5">
                  <input
                    value={targetKey === r.key ? inputLiquidar : ""}
                    onChange={(e) => { setTargetKey(r.key); setInputLiquidar(e.target.value); }}
                    onKeyDown={(e) => e.key === "Enter" && targetKey === r.key && liquidar()}
                    placeholder="código de resultado del rival…"
                    maxLength={40}
                    className="flex-1 h-7 px-2 bg-background/70 border border-border/60 text-green-hud font-mono text-[10px] tracking-wider uppercase rounded-sm focus:outline-none focus:border-green-hud"
                    aria-label={`Liquidar desafío ${r.seed}`}
                  />
                  <Button size="sm" onClick={liquidar} className="h-7 px-2 font-mono text-[9px] bg-green-hud/20 border border-green-hud text-green-hud hover:bg-green-hud/40">
                    LIQUIDAR
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => compartir(codigoDesafio(r.seed, r.apuesta))} className="h-7 px-2" aria-label="Copiar código de desafío">
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
        {retos.length > 0 && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => { saveRetos(retos.filter((r) => r.veredicto === null || r.veredicto === "esperando")); setRetos(loadRetos()); toast.info("Historial limpio (quedan los pendientes)"); }}
            className="h-7 px-2 font-mono text-[9px] text-muted-foreground"
          >
            <Trash2 className="w-3 h-3 mr-1" /> limpiar liquidados
          </Button>
        )}
      </div>
    </div>
  );
}
