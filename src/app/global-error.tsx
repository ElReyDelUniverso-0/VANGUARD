"use client";

// v17 ESTABILIDAD — ultimo recurso: fallo del layout raiz mismo.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body style={{ background: "#0A0A0F", color: "#F0F0F0", fontFamily: "monospace" }}>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ maxWidth: 460, textAlign: "center", border: "1px solid rgba(255,59,48,0.4)", padding: 32, borderRadius: 6 }}>
            <h1 style={{ fontSize: 18, marginBottom: 8 }}>VANGUARD — fallo crítico del shell</h1>
            <p style={{ fontSize: 13, color: "#a1a1aa", marginBottom: 6 }}>
              El sistema no pudo iniciarse. Recarga para volver al centro de mando.
            </p>
            <p style={{ fontSize: 10, color: "#52525b", marginBottom: 20, wordBreak: "break-word" }}>
              {error.digest ? `ref: ${error.digest}` : error.message?.slice(0, 120)}
            </p>
            <button
              onClick={reset}
              style={{
                padding: "10px 22px", background: "rgba(30,144,255,0.2)", border: "1px solid #1E90FF",
                color: "#5EB2FF", borderRadius: 4, cursor: "pointer", textTransform: "uppercase",
                letterSpacing: 2, fontSize: 12,
              }}
            >
              Reiniciar VANGUARD
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
