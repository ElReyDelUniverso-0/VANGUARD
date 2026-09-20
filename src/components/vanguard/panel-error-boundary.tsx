"use client";

// v17 ESTABILIDAD — BARRERA DE ERROR POR PANEL.
// Si un módulo falla (chunk no cargado por red lenta, bug puntual), la app COMPLETA
// ya no se cae: solo ese panel muestra su tarjeta de recuperación con REINTENTAR.
import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  /** cambia para forzar remontaje completo del panel (limpia estado interno) */
  resetKey?: string;
  /** nombre legible del módulo para la tarjeta de error */
  moduleName?: string;
}

interface State {
  error: Error | null;
  attempt: number;
}

export class PanelErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null, attempt: 0 };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // diagnóstico en consola sin tumbar la app
    console.error("[VANGUARD] módulo caído:", this.props.moduleName ?? "panel", error.message, info.componentStack);
  }

  componentDidUpdate(prevProps: Props) {
    // al cambiar de pestaña se limpia el error automáticamente
    if (prevProps.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null, attempt: 0 });
    }
  }

  retry = () => {
    this.setState((s) => ({ error: null, attempt: s.attempt + 1 }));
  };

  render() {
    if (this.state.error) {
      return (
        <div className="hud-panel p-8 sm:p-10 text-center hud-corner border-red-hud/60">
          <AlertTriangle className="w-10 h-10 mx-auto mb-3 text-red-hud" />
          <p className="font-display text-sm font-bold uppercase tracking-widest text-red-hud mb-1">
            Módulo caído
          </p>
          <p className="text-xs font-mono text-muted-foreground mb-1">
            {this.props.moduleName ?? "Este panel"} no pudo cargarse o falló durante el render.
          </p>
          <p className="text-[10px] font-mono text-muted-foreground/70 mb-5 max-w-md mx-auto break-words">
            {this.state.error.message?.slice(0, 160)}
          </p>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <button
              onClick={this.retry}
              className="inline-flex items-center gap-2 px-4 py-2 border border-electric-hud bg-electric/20 text-electric font-mono text-[11px] uppercase tracking-widest hover:bg-electric/40 transition-colors rounded-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reintentar
            </button>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-4 py-2 border border-border text-muted-foreground font-mono text-[11px] uppercase tracking-widest hover:bg-background/60 transition-colors rounded-sm"
            >
              Recargar la app
            </button>
          </div>
          <p className="mt-4 text-[9px] font-mono text-muted-foreground/60 uppercase tracking-widest">
            El resto de VANGUARD sigue operativo — el fallo queda aislado
          </p>
        </div>
      );
    }

    return (
      <div key={this.state.attempt} data-attempt={this.state.attempt}>
        {this.props.children}
      </div>
    );
  }
}
