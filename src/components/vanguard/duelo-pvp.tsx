"use client";

// v73.0 REGLA DE ORO — DUELO PVP DE PREDICCIONES (sección de PREDICCIONES).
// Retas a un guerrero aleatorio EN LÍNEA: pregunta táctica, 4 opciones, el que
// acierte más rápido se lleva el bote. La apuesta se descuenta al responder y
// el cliente liquida al terminar (misma economía client-side del resto del juego).

import { useCallback, useEffect, useRef, useState } from "react";
import { useGameStore } from "@/lib/game-store";
import { Swords, Coins, Clock, Trophy, Skull, Handshake } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface DueloActivo {
  id: number;
  soyFrom: boolean;
  rival: string;
  pregunta: string;
  opciones: string[];
  apuesta: number;
  miResp: number | null;
  rivalResp: number | null;
  estado: string;
  ganador: string | null;
  correcta: number | null;
  miMs: number | null;
  rivalMs: number | null;
  ts?: number;
}

interface DueloAcabado extends DueloActivo {}

const RECORD_KEY = "vg_duelos_record_v73";
const COBRADOS_KEY = "vg_duelos_cobrados_v73";
const UID_KEY = "vanguard-mp-uid";

function uidLocal(): string {
  try {
    let id = localStorage.getItem(UID_KEY);
    if (!id) {
      id = `AGT-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      localStorage.setItem(UID_KEY, id);
    }
    return id;
  } catch {
    return "AGT-LOCAL";
  }
}

type Outcome = "gane" | "perdi" | "empate" | "paseo" | "cancelado";

function outcomeDe(d: DueloAcabado, uid: string): Outcome {
  if (d.ganador === uid) {
    // gano: por acierto o por paseo (el rival no respondió)
    return d.rivalResp === null ? "paseo" : "gane";
  }
  if (d.ganador && d.ganador !== uid) return "perdi";
  // ganador null: empate (ambos fallaron) o cancelado (nadie respondió)
  return d.miResp !== null ? "empate" : "cancelado";
}

function payoutDe(o: Outcome, apuesta: number): number {
  if (o === "gane") return apuesta * 2; // recupero + bote del rival
  if (o === "paseo") return Math.round(apuesta * 1.5); // victoria por incomparecencia
  if (o === "empate") return apuesta; // apuesta devuelta
  return 0; // derrota: ya se descontó al responder · cancelado: nunca aposté
}

export function DueloPvp() {
  const alias = useGameStore((s) => s.alias);
  const spendCoins = useGameStore((s) => s.spendCoins);
  const addCoins = useGameStore((s) => s.addCoins);

  const [uid, setUid] = useState("");
  const [apuesta, setApuesta] = useState(100);
  const [activas, setActivas] = useState<DueloActivo[]>([]);
  const [acabadas, setAcabadas] = useState<DueloAcabado[]>([]);
  const [record, setRecord] = useState({ w: 0, l: 0, e: 0 });
  const [retando, setRetando] = useState(false);
  const cobradasRef = useRef<Set<number>>(new Set());

  // carga record + ids ya liquidados + uid
  useEffect(() => {
    setUid(uidLocal());
    try {
      setRecord(JSON.parse(localStorage.getItem(RECORD_KEY) || '{"w":0,"l":0,"e":0}'));
      cobradasRef.current = new Set(JSON.parse(localStorage.getItem(COBRADOS_KEY) || "[]") as number[]);
    } catch { /* noop */ }
  }, []);

  const cargar = useCallback(async (u: string) => {
    if (!u) return;
    try {
      const r = await fetch(`/api/duelo?uid=${encodeURIComponent(u)}`, { cache: "no-store" });
      const j = await r.json();
      if (!j.ok) return;
      setActivas(j.activas || []);
      const fin: DueloAcabado[] = j.acabadas || [];
      setAcabadas(fin);

      // LIQUIDACIÓN idempotente de duelos terminados
      const rec = { ...JSON.parse(localStorage.getItem(RECORD_KEY) || '{"w":0,"l":0,"e":0}'), } as { w: number; l: number; e: number };
      let changed = false;
      for (const d of fin) {
        if (cobradasRef.current.has(d.id)) continue;
        cobradasRef.current.add(d.id);
        const o = outcomeDe(d, u);
        const pago = payoutDe(o, d.apuesta);
        if (o === "gane" || o === "paseo") rec.w++;
        else if (o === "perdi") rec.l++;
        else if (o !== "cancelado") rec.e++;
        if (pago > 0) addCoins(pago, `Duelo PVP ${o === "paseo" ? "por paseo" : o === "gane" ? "GANADO" : "empate"} #${d.id}`);
        changed = true;
        const msg =
          o === "gane" ? `¡Duelo GANADO contra ${d.rival}! +${pago} monedas`
          : o === "paseo" ? `${d.rival} no respondió: victoria por paseo +${pago}`
          : o === "empate" ? `Empate con ${d.rival} — apuesta devuelta`
          : o === "cancelado" ? `Duelo con ${d.rival} caducó sin respuesta — sin bote`
          : `${d.rival} te ganó el duelo — apuesta perdida`;
        if (o === "gane" || o === "paseo") toast.success(msg);
        else if (o !== "cancelado") toast.error(msg);
      }
      if (changed) {
        localStorage.setItem(RECORD_KEY, JSON.stringify(rec));
        localStorage.setItem(COBRADOS_KEY, JSON.stringify([...cobradasRef.current].slice(-60)));
        setRecord(rec);
      }
    } catch { /* offline: silencio */ }
  }, [addCoins]);

  // buzones: carga inicial + sondeo cada 12s
  useEffect(() => {
    if (!uid) return;
    cargar(uid);
    const t = setInterval(() => cargar(uid), 12_000);
    return () => clearInterval(t);
  }, [uid, cargar]);

  const retar = async () => {
    if (!uid || retando) return;
    setRetando(true);
    try {
      const r = await fetch("/api/duelo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "retar", uid, alias: alias || "Guerrero", apuesta }),
      });
      const j = await r.json();
      if (j.ok) {
        toast.success(`¡Reto lanzado a ${j.rival}! Responde también tú abajo`);
        cargar(uid);
      } else {
        toast.error(j.error || "No se pudo lanzar el reto");
      }
    } catch {
      toast.error("Red de duelos sin respuesta");
    } finally {
      setRetando(false);
    }
  };

  const responder = async (d: DueloActivo, idx: number) => {
    if (!uid || d.miResp !== null) return;
    if (!spendCoins(d.apuesta, `Apuesta duelo #${d.id}`)) {
      toast.error(`Necesitas ${d.apuesta} monedas para responder`);
      return;
    }
    const ms = d.ts ? Math.max(0, Date.now() - d.ts) : 0;
    try {
      await fetch("/api/duelo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "responder", uid, id: d.id, resp: idx, ms }),
      });
      toast(`Respuesta enviada — esperando a ${d.rival}…`);
      cargar(uid);
    } catch {
      toast.error("La respuesta no salió — reintenta");
    }
  };

  return (
    <div className="hud-panel neon-border p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-display font-black uppercase tracking-wide text-lg flex items-center gap-2">
            <Swords className="w-4 h-4 text-crisis" /> Duelo PVP — Predicción Rápida
          </h3>
          <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
            Reta a un guerrero en línea · el más rápido y certero se lleva el bote
          </p>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold">
          <span className="text-neon">{record.w}V</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-crisis">{record.l}D</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-amber">{record.e}E</span>
        </div>
      </div>

      {/* apuesta + retar */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Bote:</span>
        {[50, 100, 200, 500].map((v) => (
          <button
            key={v}
            onClick={() => setApuesta(v)}
            className={cn(
              "px-2.5 py-1 border font-mono text-[10px] font-bold tabular-nums transition active:scale-90",
              apuesta === v ? "border-amber text-amber bg-amber/10" : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {v}ⓒ
          </button>
        ))}
        <button
          onClick={retar}
          disabled={retando}
          className="ml-auto px-4 py-1.5 bg-crisis-hud text-white font-mono text-[11px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition disabled:opacity-50"
        >
          {retando ? "Buscando rival…" : "Retar a un guerrero aleatorio"}
        </button>
      </div>

      {/* duelos activos */}
      {activas.length === 0 && (
        <p className="font-mono text-[10px] text-muted-foreground">
          Sin duelos activos. Lanza un reto — cualquier guerrero en línea puede caer en él.
        </p>
      )}
      {activas.map((d) => (
        <div key={d.id} className="border border-border bg-secondary/30 p-3 space-y-2">
          <div className="flex flex-wrap items-center gap-2 font-mono text-[9px] uppercase tracking-widest">
            <span className={cn("font-bold", d.soyFrom ? "text-amber" : "text-crisis")}>
              {d.soyFrom ? `TU RETO → ${d.rival}` : `RETO DE ${d.rival}`}
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Coins className="w-3 h-3" /> {d.apuesta}ⓒ
            </span>
            <span className="ml-auto flex items-center gap-1 text-muted-foreground">
              <Clock className="w-3 h-3" /> caduca en 10 min
            </span>
          </div>
          <p className="text-sm font-bold leading-snug">{d.pregunta}</p>
          {d.miResp === null ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {d.opciones.map((o, i) => (
                <button
                  key={i}
                  onClick={() => responder(d, i)}
                  className="text-left px-3 py-2 border border-border hover:border-amber hover:bg-amber/5 active:scale-[0.98] transition text-[12px]"
                >
                  <span className="font-mono text-[9px] text-muted-foreground mr-1.5">{String.fromCharCode(65 + i)}</span>
                  {o}
                </button>
              ))}
            </div>
          ) : (
            <p className="font-mono text-[10px] text-neon">
              Tu respuesta está sellada ({d.opciones[d.miResp]}) — esperando a {d.rival}…
            </p>
          )}
        </div>
      ))}

      {/* duelos terminados (últimos resultados) */}
      {acabadas.length > 0 && (
        <div className="space-y-1.5 pt-1 border-t border-border/50">
          {acabadas.slice(0, 5).map((d) => {
            const o = outcomeDe(d, uid);
            const Icon = o === "gane" || o === "paseo" ? Trophy : o === "perdi" ? Skull : Handshake;
            return (
              <div key={d.id} className="flex items-center gap-2 font-mono text-[10px] py-0.5">
                <Icon className={cn("w-3.5 h-3.5", o === "gane" || o === "paseo" ? "text-amber" : o === "perdi" ? "text-crisis" : "text-muted-foreground")} />
                <span className="truncate">{d.pregunta}</span>
                <span className={cn("ml-auto font-bold", o === "gane" || o === "paseo" ? "text-neon" : o === "perdi" ? "text-crisis" : "text-amber")}>
                  {o === "gane" ? "GANADO" : o === "paseo" ? "PASEO" : o === "empate" ? "EMPATE" : "PERDIDO"}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
