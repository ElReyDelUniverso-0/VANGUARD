"use client";
// v420.0 VANGUARD LINGUA — traductor (MyMemory), con el proveedor siempre visible.
import { useState } from "react";
import { IDIOMAS_TRADUCTOR, MAX_TRADUCTOR } from "@/lib/lingua/traduccion";

interface Resultado {
  texto: string;
  coincidencia: number;
  proveedor: string;
  alternativas: { texto: string; calidad: number; coincidencia: number; origen: string }[];
  aviso?: string;
  cache: boolean;
}

export function TraductorLingua() {
  const [texto, setTexto] = useState("");
  const [de, setDe] = useState("es");
  const [a, setA] = useState("en");
  const [res, setRes] = useState<Resultado | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const traducir = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!texto.trim() || cargando) return;
    setCargando(true);
    setError(null);
    setRes(null);
    try {
      const r = await fetch("/api/lingua/traducir", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ texto, de, a }) });
      const j = (await r.json()) as { ok: boolean; datos?: Resultado; error?: { mensaje: string } };
      if (!j.ok || !j.datos) setError(j.error?.mensaje ?? "No se pudo traducir.");
      else setRes(j.datos);
    } catch {
      setError("Sin conexión con el servicio de traducción.");
    } finally {
      setCargando(false);
    }
  };

  const invertir = () => {
    setDe(a);
    setA(de);
    if (res) {
      setTexto(res.texto);
      setRes(null);
    }
  };

  return (
    <form onSubmit={traducir}>
      <div className="vx-li-form">
        <label>
          De
          <select value={de} onChange={(e) => setDe(e.target.value)}>
            {IDIOMAS_TRADUCTOR.map((i) => (
              <option key={i.code} value={i.code}>
                {i.nombre}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="vx-li-boton sec" onClick={invertir} aria-label="Invertir idiomas" style={{ flex: "none" }}>
          ⇄
        </button>
        <label>
          A
          <select value={a} onChange={(e) => setA(e.target.value)}>
            {IDIOMAS_TRADUCTOR.map((i) => (
              <option key={i.code} value={i.code}>
                {i.nombre}
              </option>
            ))}
          </select>
        </label>
        <label style={{ flex: "1 1 100%" }}>
          Texto ({texto.length}/{MAX_TRADUCTOR})
          <textarea value={texto} maxLength={MAX_TRADUCTOR} onChange={(e) => setTexto(e.target.value)} placeholder="Escribe una frase…" />
        </label>
        <button className="vx-li-boton" type="submit" disabled={cargando || !texto.trim()}>
          {cargando ? "Traduciendo…" : "Traducir"}
        </button>
      </div>
      {error ? <p className="vx-li-aviso vx-li-error">{error}</p> : null}
      {res ? (
        <div>
          <div className="vx-li-resultado" lang={a}>
            {res.texto}
          </div>
          <p className="vx-li-nota" style={{ marginTop: 8 }}>
            Traducción automática de <b>{res.proveedor}</b> (Translated) · coincidencia {Math.round(res.coincidencia * 100)} %{res.cache ? " · servida desde caché" : ""}. Revísala antes de
            usarla en algo importante.
          </p>
          {res.aviso ? <p className="vx-li-aviso">{res.aviso}</p> : null}
          {res.alternativas.length ? (
            <div className="vx-li-caja">
              <h3>Otras propuestas de la memoria de traducción</h3>
              <ul className="vx-li-lista">
                {res.alternativas.map((x, i) => (
                  <li key={i}>
                    <span lang={a}>{x.texto}</span> <span className="vx-li-tr">
                      · {x.origen} · coincidencia {Math.round(x.coincidencia * 100)} %{x.coincidencia < 0.95 ? " con una frase parecida, no idéntica" : ""}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}
