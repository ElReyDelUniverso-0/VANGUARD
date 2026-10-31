// ════════════════════════════════════════════════════════════════
// v213.0 EL PULSO — LA LEYENDA DEL PLANETA
// Mandato del Dueño: «las ubicaciones 3D, el mapa 3D, todo eso
// debería estar BIEN DEFINIDO». Nada definido sin leyenda: esta placa
// explica CADA marca del globo — unidades, anillo de batalla, arcos,
// y (nuevo) los pines de cables por impacto de la Agencia. Colapsable
// (details/summary: sin estado, sin efectos, cero costo de render).
// ════════════════════════════════════════════════════════════════

const FILAS: { color: string; hollow?: boolean; etiqueta: string; texto: string }[] = [
  { color: "#38bdf8", etiqueta: "AVIONES", texto: "unidades aéreas en vuelo sobre su territorio" },
  { color: "#f59e0b", etiqueta: "TANQUES", texto: "blindados desplegados en el frente" },
  { color: "#a855f7", etiqueta: "SOLDADOS", texto: "infantería en el mapa de guerra" },
  { color: "#ff3355", etiqueta: "ANILLO DE BATALLA", texto: "el último frente activo pulsa aquí — arcos = ataque en curso" },
  { color: "#FF3B30", etiqueta: "CABLE URGENTE", texto: "pines de noticias: impacto 80-100, la casa en pie de guerra" },
  { color: "#FF8A3D", etiqueta: "CABLE CRÍTICO", texto: "impacto 64-79 — se está moviendo algo grande" },
  { color: "#F5C542", etiqueta: "CABLE ALTO", texto: "impacto 48-63 — desarrollo importante" },
  { color: "#7AB8FF", etiqueta: "CABLE DESARROLLO", texto: "impacto 32-47 — historia en seguimiento" },
  { color: "#8B98AD", etiqueta: "CABLE CONTEXTO", texto: "impacto < 32 — el fondo del tablero" },
  { color: "#5EEAD4", etiqueta: "FACCIONES", texto: "cada color de territorio es un dueño distinto (2D y 3D, misma verdad)" },
];

export function LeyendaPlaneta() {
  return (
    <details className="mt-2 group border border-cyan-hud/20 rounded-sm bg-black/30">
      <summary className="px-2 py-1.5 text-[8px] font-mono uppercase tracking-widest text-cyan-hud cursor-pointer select-none list-none flex items-center gap-1.5">
        <span className="inline-block transition-transform group-open:rotate-90">▸</span>
        LEYENDA DEL PLANETA — qué significa cada marca
      </summary>
      <div className="px-2 pb-2 pt-0.5 grid sm:grid-cols-2 gap-x-4 gap-y-1">
        {FILAS.map((f) => (
          <div key={f.etiqueta} className="flex items-start gap-1.5 text-[8px] font-mono uppercase tracking-wider">
            <span
              className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${f.hollow ? "border-2 bg-transparent" : ""}`}
              style={f.hollow ? { borderColor: f.color } : { backgroundColor: f.color }}
            />
            <span className="text-foreground">{f.etiqueta}</span>
            <span className="text-muted-foreground normal-case tracking-normal">· {f.texto}</span>
          </div>
        ))}
      </div>
    </details>
  );
}
