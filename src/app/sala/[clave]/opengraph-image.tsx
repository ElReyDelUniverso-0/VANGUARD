// ═══════════════════════════════════════════════════════════════════
// v405.7 · EL ESCAPARATE — la tarjeta que se ve al compartir una sala.
//
// Antes: toda puerta /sala/<clave> heredaba la misma tarjeta genérica
// (/api/og) — al compartir el Simulador de Guerras en WhatsApp, X o Telegram
// se veía lo mismo que al compartir la portada, y nada invitaba a tocar.
// Ahora cada sala lleva SU tarjeta: nombre, lema real y constelación con su
// color. Mismo texto que la puerta (puertas-salas.ts): cero palabras nuevas.
// Se genera estática en el build (155 PNG, uno por sala) — sin base de datos,
// sin coste por visita.
// ═══════════════════════════════════════════════════════════════════
import { ImageResponse } from "next/og";
import { CONSTELACIONES } from "@/lib/vanguard/mapa-salas";
import { PUERTAS_SALAS } from "@/lib/vanguard/puertas-salas";

export const alt = "Una sala de VANGUARD";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const COLOR: Record<string, string> = {
  amber: "#f5a623",
  cyan: "#5eead4",
  red: "#ff4d5e",
  green: "#3ddc97",
  violet: "#b48cff",
  blue: "#7ab8ff",
};

function corta(t: string, max: number) {
  const l = t.replace(/\s+/g, " ").trim();
  if (l.length <= max) return l;
  const c = l.slice(0, max - 1);
  return c.slice(0, c.lastIndexOf(" ")).replace(/[,:;·—-]+$/, "") + "…";
}

export function generateStaticParams() {
  return CONSTELACIONES.flatMap((c) => c.salas.map((s) => ({ clave: s.clave })));
}

export default async function Tarjeta({ params }: { params: Promise<{ clave: string }> }) {
  const { clave } = await params;
  const c = CONSTELACIONES.find((x) => x.salas.some((s) => s.clave === clave));
  const s = c?.salas.find((x) => x.clave === clave);
  const p = PUERTAS_SALAS[clave];
  const color = COLOR[c?.color ?? "amber"] ?? "#f5a623";
  const titulo = corta(p?.titulo ?? s?.corto ?? "VANGUARD", 46);
  const lema = corta(p?.lema || p?.textos[0] || c?.desc || "", 150);
  const tamTitulo = titulo.length > 30 ? 62 : 78;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "linear-gradient(135deg, #06080c 0%, #10131a 55%, #06080c 100%)",
          color: "#e7ecf3",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 24,
            left: 24,
            right: 24,
            bottom: 24,
            border: "2px solid rgba(232,197,106,0.35)",
            display: "flex",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", fontSize: 30, fontWeight: 800, letterSpacing: 10, color: "#e8c56a" }}>
            VANGUARD
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 22,
              letterSpacing: 4,
              textTransform: "uppercase",
              color,
              border: `2px solid ${color}`,
              borderRadius: 8,
              padding: "8px 16px",
            }}
          >
            {`Sala · ${corta(c?.corto ?? "", 22)}`}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", width: 90, height: 6, background: color, marginBottom: 28 }} />
          <div style={{ display: "flex", fontSize: tamTitulo, fontWeight: 800, lineHeight: 1.05 }}>{titulo}</div>
          {lema ? (
            <div style={{ display: "flex", marginTop: 22, fontSize: 32, lineHeight: 1.35, color: "#aab4c3", maxWidth: 1000 }}>
              {lema}
            </div>
          ) : null}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 24, color: "#8b98ad" }}>
          <div style={{ display: "flex" }}>{`Entra desde el navegador · /sala/${clave}`}</div>
          <div style={{ display: "flex", color: "#e8c56a", letterSpacing: 3 }}>ENTRAR →</div>
        </div>
      </div>
    ),
    size
  );
}
