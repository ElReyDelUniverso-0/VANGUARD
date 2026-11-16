"use client";

// ═══════════════════════════════════════════════════════════════════
// v404.1 · EL PODER EN TARJETAS — 167 países, el peso dibujado.
//
// LO QUE HABÍA (auditoría): /poder medía 20.831 letras en 9 elementos
// visuales — **2.315 letras por visual**. El archivo por regiones volcaba los
// 167 países en tarjetas de cuatro líneas de texto seguidas: gasto, personal,
// esfuerzo y año. Un muro de cifras.
//
// LO QUE HAY: una tarjeta por país con su nombre, su gasto y **el gasto
// dibujado** contra el líder del planeta (una barra con su descripción, no un
// adorno). El personal, el esfuerzo y el año del dato siguen ahí, enteros, a
// un toque. Ni un dato se ha borrado y ni una cifra se escribe a mano: todo
// sale de la captura del Banco Mundial (poder-data.ts).
// ═══════════════════════════════════════════════════════════════════
import { PODER_FILAS, type FilaPoder } from "@/lib/poder-data";
// v405.5 — la plantilla compartida de fichas (el markup estaba escrito seis veces).
import { ArchivoMando, BotonAbrir, Detalle, Tramo, useArchivo } from "./ficha";

// las mismas reglas de formato es-ES de la sala (v297): billones · mil M · M
function fmtUsd(v: number): string {
  if (v >= 1e12) return `US$ ${(v / 1e12).toLocaleString("es-ES", { maximumFractionDigits: 2 })} billones`;
  if (v >= 1e9) return `US$ ${(v / 1e9).toLocaleString("es-ES", { maximumFractionDigits: 0 })} mil M`;
  if (v >= 1e6) return `US$ ${(v / 1e6).toLocaleString("es-ES", { maximumFractionDigits: 0 })} M`;
  return `US$ ${Math.round(v).toLocaleString("es-ES")}`;
}
function fmtUsdCorto(v: number): string {
  if (v >= 1e12) return `${(v / 1e12).toLocaleString("es-ES", { maximumFractionDigits: 1 })} B`;
  if (v >= 1e9) return `${(v / 1e9).toLocaleString("es-ES", { maximumFractionDigits: 0 })} mM`;
  if (v >= 1e6) return `${(v / 1e6).toLocaleString("es-ES", { maximumFractionDigits: 0 })} M`;
  return Math.round(v).toLocaleString("es-ES");
}
function fmtPersonas(v: number): string {
  if (v >= 1e6) return `${(v / 1e6).toLocaleString("es-ES", { maximumFractionDigits: 1 })} M`;
  if (v >= 1e3) return `${(v / 1e3).toLocaleString("es-ES", { maximumFractionDigits: 0 })} mil`;
  return `${Math.round(v).toLocaleString("es-ES")}`;
}
function fmtPct(v: number): string {
  return `${v.toLocaleString("es-ES", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
}

const RANKING = [...PODER_FILAS].sort((a, b) => b.gasto - a.gasto);
const LIDER = RANKING[0];
const TOTAL = RANKING.reduce((s, f) => s + f.gasto, 0);
const REGIONES: string[] = [];
for (const f of RANKING) if (!REGIONES.includes(f.region)) REGIONES.push(f.region);

function Tarjeta({ f, puesto }: { f: FilaPoder; puesto: number }) {
  const idDetalle = `pais-det-${f.iso3}`;
  const [abierto, setAbierto] = useArchivo(idDetalle);
  const ancho = Math.max(1, Math.round((f.gasto / LIDER.gasto) * 100));
  const cuota = ((f.gasto / TOTAL) * 100).toLocaleString("es-ES", { maximumFractionDigits: 2 });

  return (
    <article className={`vx-pais${abierto ? " vx-pais-abierto" : ""}`}>
      <div className="vx-pais-cab">
        <span className="vx-pais-puesto">{String(puesto).padStart(2, "0")}</span>
        <h3>{f.nombre}</h3>
        <span className="vx-pais-gasto">{fmtUsdCorto(f.gasto)}</span>
      </div>
      <div className="vx-peso" role="img" aria-label={`${f.nombre}: ${fmtUsd(f.gasto)} de gasto militar, ${cuota}% del total censado`}>
        <i style={{ width: `${ancho}%` }} />
      </div>
      <BotonAbrir
        abierto={abierto}
        onToggle={setAbierto}
        controla={idDetalle}
        texto={["Ver la cifra", "Cerrar"]}
      />
      {abierto && (
        <Detalle
          id={idDetalle}
          filas={[
            ["gasto militar", fmtUsd(f.gasto)],
            ["personal en servicio", f.personal != null ? fmtPersonas(f.personal) : "sin dato en la captura"],
            ["esfuerzo (% del PIB)", f.gdpPct != null ? fmtPct(f.gdpPct) : "sin dato en la captura"],
            ["cuota del total censado", `${cuota}% · año del dato: ${f.anio} · ${f.region}`],
          ]}
        />
      )}
    </article>
  );
}

export function ArchivoPoder() {
  return (
    <ArchivoMando>
      <div className="vx-archivo-oscuro">
      {REGIONES.map((reg) => {
        const filas = RANKING.filter((f) => f.region === reg);
        return (
          <Tramo key={reg} etiqueta={reg} color="#f5a623" cuenta={filas.length}>
            {filas.map((f) => (
              <Tarjeta key={f.iso3} f={f} puesto={RANKING.indexOf(f) + 1} />
            ))}
          </Tramo>
        );
      })}
      </div>
    </ArchivoMando>
  );
}
