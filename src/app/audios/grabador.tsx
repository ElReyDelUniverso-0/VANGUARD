"use client";

// v217.0 LA EMISORA — el grabador: permiso de micrófono honesto (getUserMedia),
// MediaRecorder ≤ 90 s, envío a /api/audios y muro vivo. Anti-traba propio:
// si el permiso no llega en 12 s o el recorder se queda sin flujo, la máquina
// se despierta sola y nunca se queda "grabando" eterna.
import { useCallback, useEffect, useRef, useState } from "react";

interface Fila {
  id: string;
  autor: string;
  titulo: string;
  duracion: number;
  url: string;
  creado: string;
}

export function GrabadorAudio() {
  const [estado, setEstado] = useState<"quieto" | "pidiendo" | "grabando" | "enviando">("quieto");
  const [aviso, setAviso] = useState<string | null>(null);
  const [segundos, setSegundos] = useState(0);
  const [titulo, setTitulo] = useState("");
  const [autor, setAutor] = useState("");
  const [muro, setMuro] = useState<Fila[]>([]);

  const recRef = useRef<MediaRecorder | null>(null);
  const trozosRef = useRef<Blob[]>([]);
  const relojRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const vigiaRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const vivoRef = useRef(true);
  useEffect(() => {
    vivoRef.current = true;
    cargarMuro();
    return () => {
      vivoRef.current = false;
      cortarFlujos();
    };
  }, []);

  const cortarFlujos = () => {
    if (relojRef.current) clearInterval(relojRef.current);
    if (vigiaRef.current) clearTimeout(vigiaRef.current);
    relojRef.current = null;
    vigiaRef.current = null;
    try {
      recRef.current?.stream.getTracks().forEach((t) => t.stop());
    } catch {}
  };

  const cargarMuro = useCallback(async () => {
    try {
      const r = await fetch("/api/audios", { cache: "no-store" });
      const j = await r.json();
      if (j?.ok && vivoRef.current) setMuro(j.audios ?? []);
    } catch {}
  }, []);

  const parar = useCallback(() => {
    try {
      if (recRef.current?.state === "recording") recRef.current.stop();
    } catch {}
  }, []);

  const grabar = async () => {
    setAviso(null);
    setEstado("pidiendo");
    try {
      const flujo = await Promise.race([
        navigator.mediaDevices.getUserMedia({ audio: true }),
        new Promise<never>((_, rej) => {
          vigiaRef.current = setTimeout(() => rej(new Error("El permiso de micrófono no llegó (12 s).")), 12_000);
        }),
      ]);
      trozosRef.current = [];
      const rec = new MediaRecorder(flujo);
      recRef.current = rec;
      rec.ondataavailable = (e) => e.data.size > 0 && trozosRef.current.push(e.data);
      rec.onstop = () => {
        cortarFlujos();
        void enviar();
      };
      setSegundos(0);
      relojRef.current = setInterval(() => {
        setSegundos((s) => {
          if (s + 1 >= 90) parar();
          return s + 1;
        });
      }, 1000);
      rec.start();
      setEstado("grabando");
    } catch (e) {
      cortarFlujos();
      setEstado("quieto");
      setAviso(
        e instanceof Error && /permiso/i.test(e.message)
          ? e.message
          : "No pude abrir el micrófono: concede el permiso en tu navegador y vuelve a intentarlo."
      );
    }
  };

  const enviar = async () => {
    setEstado("enviando");
    try {
      const bolita = new Blob(trozosRef.current, { type: "audio/webm" });
      if (bolita.size < 800) throw new Error("La grabación salió vacía. Intenta de nuevo.");
      const base64 = await new Promise<string>((res, rej) => {
        const fr = new FileReader();
        fr.onload = () => res(String(fr.result).split(",")[1] ?? "");
        fr.onerror = () => rej(new Error("No pude leer la grabación."));
        fr.readAsDataURL(bolita);
      });
      const r = await fetch("/api/audios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          autor: autor.trim() || "INVITADO",
          titulo: titulo.trim() || "Informe de comandante",
          duracion: Math.min(90, Math.max(1, segundos)),
          audio: base64,
        }),
      });
      const j = await r.json();
      if (!j?.ok) throw new Error(j?.error ?? "La emisora rechazó el envío.");
      setAviso("✔ " + j.aviso);
      setTitulo("");
      setSegundos(0);
      await cargarMuro();
    } catch (e) {
      setAviso(e instanceof Error ? e.message : "No pude enviar el audio.");
    } finally {
      if (vivoRef.current) setEstado("quieto");
    }
  };

  const grabando = estado === "grabando";

  return (
    <div className="mt-4">
      <div className="grid gap-2 sm:grid-cols-2">
        <input
          value={autor}
          onChange={(e) => setAutor(e.target.value)}
          maxLength={24}
          placeholder="Tu nombre de comandante (opcional)"
          className="rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm outline-none placeholder:text-[#6b665e] focus:border-[#ff2a3c]/60"
        />
        <input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          maxLength={120}
          placeholder="¿Qué lleva tu audio? (informe, avistamiento, saludo…)"
          className="rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm outline-none placeholder:text-[#6b665e] focus:border-[#ff2a3c]/60"
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        {!grabando ? (
          <button
            onClick={grabar}
            disabled={estado === "pidiendo" || estado === "enviando"}
            className="rounded-lg border border-[#ff2a3c]/60 bg-[#ff2a3c]/15 px-5 py-3 text-sm font-black tracking-widest text-[#ff2a3c] hover:bg-[#ff2a3c]/25 disabled:opacity-50"
          >
            {estado === "pidiendo" ? "PIDIENDO PERMISO…" : estado === "enviando" ? "ENVIANDO…" : "● GRABAR AUDIO"}
          </button>
        ) : (
          <button
            onClick={() => parar()}
            className="rounded-lg bg-[#ff2a3c] px-5 py-3 text-sm font-black tracking-widest text-black animate-pulse"
          >
            ■ PARAR Y ENVIAR ({segundos}s / 90)
          </button>
        )}
        {grabando && (
          <span className="flex items-center gap-1.5 text-xs text-[#ff2a3c]" aria-live="polite">
            <i className="inline-block h-2.5 w-2.5 rounded-full bg-[#ff2a3c] animate-ping" /> AL AIRE — te escucha Vanguard
          </span>
        )}
      </div>
      {aviso && <p className="mt-3 text-xs leading-relaxed text-[#ffd34d]">{aviso}</p>}

      <h3 className="mt-6 text-sm font-bold tracking-[0.25em] text-[#b9b4aa]">MURO DE LA EMISORA</h3>
      {muro.length === 0 ? (
        <p className="mt-2 text-xs text-[#6b665e]">Aún nadie habló. El primer audio puede ser el tuyo.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {muro.map((a) => (
            <li key={a.id} className="rounded-lg border border-white/10 bg-white/[.02] p-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-sm font-bold">{a.titulo}</span>
                <span className="text-[10px] tracking-widest text-[#ff2a3c]">
                  {a.autor} · {a.duracion}s
                </span>
              </div>
              <audio controls preload="none" src={a.url} className="mt-2 h-9 w-full" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
