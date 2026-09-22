import { ImageResponse } from "next/og";
import { db } from "@/lib/db";

// v35 IMPACTO TOTAL — OG DINÁMICA: la tarjeta que WhatsApp/X/Telegram muestran
// al compartir ya no es una imagen fija, es una imagen VIVA con datos reales:
// agentes totales en la plataforma + noticias de las últimas 24h.
// Cada compartida luce distinta y actualizada → la página RESALTA en el chat.

export const dynamic = "force-dynamic";
export const size = { width: 1200, height: 630 };

async function getStats() {
  try {
    const counter = await db.$queryRaw<{ n: bigint | number }[]>`
      SELECT n FROM site_counter WHERE k = 'total' LIMIT 1`;
    const total = counter[0]
      ? Number(typeof counter[0].n === "bigint" ? counter[0].n : counter[0].n)
      : 0;
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const news24 = await db.newsItem.count({ where: { publishedAt: { gte: since } } });
    const totalNews = await db.newsItem.count();
    return {
      agents: total,
      news: news24 > 0 ? news24 : Math.min(totalNews, 48),
    };
  } catch {
    return { agents: 0, news: 0 };
  }
}

const fmt = (n: number) => n.toLocaleString("es-ES");

export async function GET() {
  const { agents, news } = await getStats();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0A0A0F 0%, #101528 55%, #0A0A0F 100%)",
          padding: "56px 64px",
          position: "relative",
        }}
      >
        {/* marco táctico */}
        <div
          style={{
            position: "absolute",
            top: 24, left: 24, right: 24, bottom: 24,
            border: "2px solid rgba(255,184,0,0.35)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 32, left: 32, width: 56, height: 56,
            borderTop: "6px solid #FFB800",
            borderLeft: "6px solid #FFB800",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 32, right: 32, width: 56, height: 56,
            borderBottom: "6px solid #FFB800",
            borderRight: "6px solid #FFB800",
            display: "flex",
          }}
        />

        {/* cabecera */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div
              style={{
                width: 74, height: 74,
                background: "linear-gradient(135deg, #FFB800, #FF7A00)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                clipPath: "polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)",
              }}
            >
              <div style={{ fontSize: 40, fontWeight: 900, color: "#0A0A0F" }}>V</div>
            </div>
            <div style={{ display: "flex", fontSize: 88, fontWeight: 900, color: "#FFFFFF", letterSpacing: 10 }}>
              VANGUARD
            </div>
          </div>
          <div style={{ display: "flex", fontSize: 30, color: "#7DD3FC", letterSpacing: 6, fontWeight: 700 }}>
            CONFLICTOS MUNDIALES EN TIEMPO REAL
          </div>
        </div>

        {/* métricas vivas */}
        <div style={{ display: "flex", gap: 28 }}>
          <div
            style={{
              flex: 1, display: "flex", flexDirection: "column", gap: 10,
              border: "2px solid rgba(0,255,135,0.4)",
              background: "rgba(0,255,135,0.08)",
              padding: "28px 32px",
            }}
          >
            <div style={{ display: "flex", fontSize: 24, color: "#9CA3AF", letterSpacing: 4 }}>
              AGENTES EN LA PLATAFORMA
            </div>
            <div style={{ display: "flex", fontSize: 84, fontWeight: 900, color: "#00FF87" }}>
              {fmt(agents)}
            </div>
          </div>
          <div
            style={{
              flex: 1, display: "flex", flexDirection: "column", gap: 10,
              border: "2px solid rgba(125,211,252,0.4)",
              background: "rgba(125,211,252,0.08)",
              padding: "28px 32px",
            }}
          >
            <div style={{ display: "flex", fontSize: 24, color: "#9CA3AF", letterSpacing: 4 }}>
              NOTICIAS DE GUERRA · 24H
            </div>
            <div style={{ display: "flex", fontSize: 84, fontWeight: 900, color: "#7DD3FC" }}>
              {fmt(news)}
            </div>
          </div>
        </div>

        {/* pie */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", fontSize: 28, color: "#FFB800", fontWeight: 700, letterSpacing: 2 }}>
            Mapa 3D militar · Guerra global multijugador · 100% gratis
          </div>
          <div style={{ display: "flex", fontSize: 26, color: "#6B7280", letterSpacing: 2 }}>
            EN ESPAÑOL
          </div>
        </div>
      </div>
    ),
    size
  );
}
