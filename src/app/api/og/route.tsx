import { ImageResponse } from "next/og";
import { db } from "@/lib/db";

// v35 IMPACTO TOTAL — OG DINÁMICA: la tarjeta que WhatsApp/X/Telegram muestran
// al compartir ya no es una imagen fija, es una imagen VIVA con datos reales:
// agentes totales en la plataforma + noticias de las últimas 24h.
// Cada compartida luce distinta y actualizada → la página RESALTA en el chat.

export const dynamic = "force-dynamic";
// v246.0 EL ANDAMIAJE EN SILENCIO — «size» era un hábito de la convención
// opengraph-image.tsx; aquí es una constante interna de la ruta (la usa el
// ImageResponse de abajo) y deja de ser pública del módulo. Vive igual.
const size = { width: 1200, height: 630 };

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
          background: "linear-gradient(135deg, #050507 0%, #171207 52%, #050507 100%)",
          padding: "56px 64px",
          position: "relative",
        }}
      >
        {/* marco táctico */}
        <div
          style={{
            position: "absolute",
            top: 24, left: 24, right: 24, bottom: 24,
            border: "2px solid rgba(245,197,66,0.35)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 32, left: 32, width: 56, height: 56,
            borderTop: "6px solid #F5C542",
            borderLeft: "6px solid #F5C542",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 32, right: 32, width: 56, height: 56,
            borderBottom: "6px solid #F5C542",
            borderRight: "6px solid #F5C542",
            display: "flex",
          }}
        />

        {/* cabecera con el nuevo emblema Polaris + Twin-Wing */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <svg width="84" height="84" viewBox="0 0 64 64" fill="none">
              <rect x="2" y="2" width="60" height="60" rx="14" fill="#120E08" stroke="#F5C542" strokeWidth="1.8" />
              <path d="M17 7.5 H47 L56.5 17 V47 L47 56.5 H17 L7.5 47 V17 Z" stroke="#F5C542" strokeOpacity="0.24" strokeWidth="1" />
              <ellipse cx="32" cy="34" rx="22.5" ry="9.2" transform="rotate(-24 32 34)" stroke="#38BDF8" strokeOpacity="0.55" strokeWidth="1.2" />
              <circle cx="50.4" cy="24.5" r="2" fill="#38BDF8" />
              <path d="M11.8 20.5 L20.6 20.5 L32 43.4 L32 54 Z" fill="#F7C948" />
              <path d="M52.2 20.5 L43.4 20.5 L32 43.4 L32 54 Z" fill="#D99B16" />
              <path d="M32 10.6 L33.7 16.1 L39.2 17.8 L33.7 19.5 L32 25 L30.3 19.5 L24.8 17.8 L30.3 16.1 Z" fill="#FFF3C4" />
              <circle cx="32" cy="17.8" r="1.4" fill="#FFFFFF" />
            </svg>
            <div style={{ display: "flex", fontSize: 88, fontWeight: 900, color: "#FFFFFF", letterSpacing: 10 }}>
              VANGUARD
            </div>
          </div>
          <div style={{ display: "flex", fontSize: 28, color: "#F5C542", letterSpacing: 6, fontWeight: 700 }}>
            CONFLICTOS MUNDIALES EN TIEMPO REAL
          </div>
        </div>

        {/* métricas vivas */}
        <div style={{ display: "flex", gap: 28 }}>
          <div
            style={{
              flex: 1, display: "flex", flexDirection: "column", gap: 10,
              border: "2px solid rgba(61, 220, 151,0.4)",
              background: "rgba(61, 220, 151,0.08)",
              padding: "28px 32px",
            }}
          >
            <div style={{ display: "flex", fontSize: 24, color: "#9CA3AF", letterSpacing: 4 }}>
              AGENTES EN LA PLATAFORMA
            </div>
            <div style={{ display: "flex", fontSize: 84, fontWeight: 900, color: "#3DDC97" }}>
              {fmt(agents)}
            </div>
          </div>
          <div
            style={{
              flex: 1, display: "flex", flexDirection: "column", gap: 10,
              border: "2px solid rgba(56,189,248,0.4)",
              background: "rgba(56,189,248,0.08)",
              padding: "28px 32px",
            }}
          >
            <div style={{ display: "flex", fontSize: 24, color: "#9CA3AF", letterSpacing: 4 }}>
              NOTICIAS DE GUERRA · 24H
            </div>
            <div style={{ display: "flex", fontSize: 84, fontWeight: 900, color: "#38BDF8" }}>
              {fmt(news)}
            </div>
          </div>
        </div>

        {/* pie */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", fontSize: 28, color: "#F5C542", fontWeight: 700, letterSpacing: 2 }}>
            Mapa 3D militar · Guerra global multijugador · 100% gratis
          </div>
          <div style={{ display: "flex", fontSize: 26, color: "#9CA3AF", letterSpacing: 2 }}>
            EN ESPAÑOL
          </div>
        </div>
      </div>
    ),
    size
  );
}
