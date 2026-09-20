// v27 ESTUDIOS CREADORES — semillas demo: monedas comunitarias, gobierno y contenido UGC nuevo
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

const MIN = 60_000;

async function main() {
  console.log("🌱 Sembrando v27…");

  // ---- monedas comunitarias ----
  const coins = [
    { code: "QUIM", name: "Quimbaya de Oro", symbol: "🥇", country: "co", creator: "Quimbaya", description: "Respaldo legendario: tesoros precolombinos y café", supply: 5_000_000, price: 14.2, basePrice: 10, volume: 8420, trades: 61, holders: 5 },
    { code: "RUBLO", name: "Rublo Rojo", symbol: "🔥", country: "ru", creator: "DonBosforo", description: "La moneda del frente oriental — alta volatilidad", supply: 100_000_000, price: 6.8, basePrice: 10, volume: 15300, trades: 92, holders: 7 },
    { code: "PESO", name: "Peso del Caribe", symbol: "💎", country: "do", creator: "PampaAnalista", description: "Stablecoin comunitaria del Caribe", supply: 1_000_000, price: 10.4, basePrice: 10, volume: 2210, trades: 18, holders: 3 },
    { code: "DRACM", name: "Dracma de Templo", symbol: "⚙️", country: "gr", creator: "VeneziaOSINT", description: "Moneda de la facción historia de VANGUARD", supply: 10_000_000, price: 11.9, basePrice: 10, volume: 4400, trades: 33, holders: 4 },
  ];
  for (const c of coins) {
    await db.communityCurrency.upsert({
      where: { code: c.code },
      update: {},
      create: { ...c },
    });
  }
  console.log("  💰 monedas:", coins.length);

  // trades de ejemplo
  const quim = await db.communityCurrency.findUnique({ where: { code: "QUIM" } });
  const rublo = await db.communityCurrency.findUnique({ where: { code: "RUBLO" } });
  const tradeCount = await db.currencyTrade.count();
  if (quim && rublo && tradeCount < 6) {
    await db.currencyTrade.createMany({
      data: [
        { currencyId: quim.id, user: "Agente-7719", side: "BUY", amount: 120, price: 12.1 },
        { currencyId: quim.id, user: "DonBosforo", side: "SELL", amount: 60, price: 13.4 },
        { currencyId: rublo.id, user: "Quimbaya", side: "BUY", amount: 300, price: 7.2 },
        { currencyId: rublo.id, user: "Agente-7719", side: "SELL", amount: 80, price: 6.9 },
      ],
    });
  }

  // ---- gobierno: decretos de ejemplo (UGC kind decreto) ----
  const decreeCount = await db.ugcItem.count({ where: { kind: "decreto" } });
  if (decreeCount === 0) {
    await db.ugcItem.createMany({
      data: [
        {
          kind: "decreto", author: "Quimbaya", authorBall: "co", country: "co",
          title: "DECRETO PRESIDENCIAL: Jornada de verificación ciudadana",
          summary: "Todo reportero ciudadano que verifique 3 noticias esta semana recibirá reconocimiento del estado.",
          body: "El gobierno de la República declara la Jornada de Verificación Ciudadana. Todo reportero que confirme 3 noticias en la cola comunitaria recibirá el sello de OJO NACIONAL y 150 monedas del tesoro. La desinformación debilita a la nación: verificar es patriotismo.",
          status: "APROBADO", aiVerdict: "LIMPIO",
        },
        {
          kind: "decreto", author: "DonBosforo", authorBall: "ru", country: "ua",
          title: "DECRETO PRESIDENCIAL: Escuela de OSINT gratuita",
          summary: "Se abre la escuela de inteligencia abierta para todos los contribuidores nivel 2+.",
          body: "El consejo de guerra aprueba la apertura de la Escuela de OSINT. Los cursos de geolocalización, análisis de metadatos y verificación de imágenes serán gratuitos para contribuidores nivel 2 en adelante. La inteligencia es el escudo del pueblo.",
          status: "APROBADO", aiVerdict: "LIMPIO",
        },
      ],
    });
  }

  // ---- contenido UGC nuevo: post, sticker, bandera, mapa ----
  const ugcCount = await db.ugcItem.count({ where: { kind: { in: ["post", "sticker", "bandera", "mapa"] } } });
  if (ugcCount === 0) {
    await db.ugcItem.createMany({
      data: [
        {
          kind: "post", author: "Quimbaya", authorBall: "co", country: "co",
          title: "Primera alerta comunitaria desde el Eje Cafetero",
          summary: "Terremoto menor esta madrugada: la comunidad confirmó el sismo antes que la prensa.",
          body: "A las 3:12 am tembló fuerte en Manizales. Antes de que saliera en los medios, ya lo habíamos reportado entre todos en la sala. Esto demuestra que la red de ciudadanos puede ir más rápido que cualquier cadena de noticias. Suban sus reportes con foto y hora.",
          status: "APROBADO", aiVerdict: "LIMPIO", likes: 12,
        },
        {
          kind: "bandera", author: "PampaAnalista", authorBall: "ar", country: "ar",
          title: "Bandera de la Federación del Sur",
          summary: "Diseño ganador del concurso interno: celeste, plata y sol.",
          body: "",
          specs: JSON.stringify({ dir: "h", colors: ["#6d9eeb", "#ffffff", "#6d9eeb"], circle: "#fcd116", symbol: "☀", symbolColor: "#fcd116", text: "FEDERACIÓN DEL SUR", textColor: "#333333" }),
          status: "APROBADO", aiVerdict: "LIMPIO", likes: 9,
        },
        {
          kind: "mapa", author: "VeneziaOSINT", authorBall: "it", country: "it",
          title: "Rutas de comercio marítimo amenazadas",
          summary: "Tres flechas de riesgo sobre Bab el-Mandeb, Ormuz y el Mar de China.",
          body: "",
          specs: JSON.stringify({
            title: "PUNTOS DE ESTRANGULAMIENTO 2026",
            items: [
              { id: "a1", type: "arrow", x: 57.5, y: 46, x2: 60, y2: 48.5, color: "#ef4444" },
              { id: "a2", type: "arrow", x: 61, y: 37, x2: 62.5, y2: 41, color: "#f59e0b" },
              { id: "l1", type: "label", x: 57.5, y: 44.6, color: "#ef4444", text: "BAB EL-MANDEB" },
              { id: "l2", type: "label", x: 60.2, y: 35.4, color: "#f59e0b", text: "ORMUZ" },
              { id: "z1", type: "zone", x: 79, y: 44, color: "#22d3ee" },
              { id: "l3", type: "label", x: 79, y: 42.6, color: "#22d3ee", text: "ESTRECHO DE TAIWÁN" },
            ],
          }),
          status: "APROBADO", aiVerdict: "LIMPIO", likes: 15,
        },
      ],
    });
  }

  const total = await db.ugcItem.count();
  console.log("  📦 ugc total:", total);
  console.log("✅ Seed v27 completo");
  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
