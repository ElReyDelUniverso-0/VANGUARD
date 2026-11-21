"use client";

// la misma verdad que el panel, en página: /config
import { ControlesAjustes, useAjustes } from "./panel-ajustes";

export function PaginaAjustes() {
  const { a, set, restablecer } = useAjustes();
  return (
    <div className="op-ajustes-pagina">
      <ControlesAjustes a={a} set={set} />
      <div className="op-ajustes-pie" style={{ marginTop: 8 }}>
        Se guarda solo en este aparato. Vanguard no guarda perfiles en un servidor: la personalización es tuya y se queda aquí.
        <br />
        <button type="button" onClick={restablecer} style={{ marginTop: 10 }}>
          Restablecer todo
        </button>
      </div>
    </div>
  );
}
