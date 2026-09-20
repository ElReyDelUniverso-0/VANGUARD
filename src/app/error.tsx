"use client";

// v17 ESTABILIDAD — recuperacion a nivel de app.
// Si un render raiz falla, esta pantalla ofrece REINICIAR sin perder el servidor.
import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[VANGUARD] fallo de app:", error.message, error.digest);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#0A0A0F]">
      <div className="max-w-md w-full text-center border border-red-500/40 bg-[#1A1A2E]/60 rounded-md p-8">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
        <h1 className="font-bold text-lg text-white mb-2 tracking-wide">VANGUARD — interrupción detectada</h1>
        <p className="text-sm text-zinc-400 mb-1">
          Un módulo falló de forma inesperada. Tu progreso local está a salvo.
        </p>
        <p className="text-[10px] font-mono text-zinc-600 mb-6 break-words">
          {error.digest ? `ref: ${error.digest}` : error.message?.slice(0, 120)}
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-sm bg-[#1E90FF]/20 border border-[#1E90FF] text-[#5EB2FF] font-mono text-xs uppercase tracking-widest hover:bg-[#1E90FF]/40 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Reiniciar sistema
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 rounded-sm border border-zinc-700 text-zinc-300 font-mono text-xs uppercase tracking-widest hover:bg-zinc-800/60 transition-colors"
          >
            Recargar página
          </button>
        </div>
      </div>
    </div>
  );
}
