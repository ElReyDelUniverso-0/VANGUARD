// Vanguard v23 — SEED EN VIVO MUNDIAL + CONTRIBUIDORES
// Pobla streams, chats, donaciones, programación, replays, cola de verificación,
// contribuciones de ejemplo y perfiles del leaderboard. Idempotente: limpia antes.
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Seed v23: limpiando datos anteriores...");
  await db.contribNotification.deleteMany();
  await db.contributionVote.deleteMany();
  await db.contribution.deleteMany();
  await db.newsVerifyVote.deleteMany();
  await db.newsVerify.deleteMany();
  await db.liveChatMessage.deleteMany();
  await db.streamDonation.deleteMany();
  await db.liveStream.deleteMany();
  await db.streamSchedule.deleteMany();
  await db.streamReplay.deleteMany();
  await db.contributorProfile.deleteMany();

  // ===== STREAMS DE USUARIOS EN VIVO =====
  const streams = [
    { title: "🔴 EN VIVO: análisis de la ofensiva en el este — mapas actualizados", category: "analisis", streamerName: "VolkovIntel", country: "ru", viewers: 84, peakViewers: 97, totalViews: 156 },
    { title: "Debate: ¿la OTAN se expande demasiado? PARTICIPA", category: "debate", streamerName: "LibertyWing", country: "us", viewers: 51, peakViewers: 60, totalViews: 88 },
    { title: "Historia en vivo: la crisis de los misiles de Cuba minuto a minuto", category: "historia", streamerName: "Quimbaya", country: "co", viewers: 33, peakViewers: 41, totalViews: 52 },
    { title: "Simulación comentada: dominación mundial en VANGUARD multiplayer", category: "simulacion", streamerName: "CariñoTropical", country: "do", viewers: 19, peakViewers: 27, totalViews: 31 },
    { title: "Noticias comentadas: giro nocturno con Al Jazeera de fondo", category: "noticias", streamerName: "TeaAndIntel", country: "gb", viewers: 47, peakViewers: 55, totalViews: 71 },
  ];
  const created = [];
  for (const s of streams) {
    const st = await db.liveStream.create({ data: { ...s, status: "live", startedAt: new Date(Date.now() - Math.floor(Math.random() * 40 + 10) * 60000) } });
    created.push(st);
  }

  // chat inicial para cada stream
  const chatSeed = [
    { a: "Patriota82", c: "us", t: "Primera vez aquí, esto es mejor que la TV" },
    { a: "BaguetteWar", c: "fr", t: "El mapa que muestras confirma lo del radar" },
    { a: "YukiSan", c: "jp", t: "¿fuente del informe? quiero leerlo completo" },
    { a: "Borscht", c: "ua", t: "F en el chat por la ciudad del sur" },
    { a: "TacoIntel", c: "mx", t: "Saludos desde México, gran directo" },
    { a: "SchnitzelOp", c: "de", t: "El frente este no perdona" },
    { a: "Carioca", c: "br", t: "Vengo del panel de divisas, el rublo vuela" },
    { a: "MapleOps", c: "ca", t: "GG streamer, sigue así" },
  ];
  for (const st of created) {
    for (let i = 0; i < 4; i++) {
      const m = chatSeed[(i + st.viewers) % chatSeed.length];
      await db.liveChatMessage.create({
        data: { streamId: st.id, author: m.a, country: m.c, content: m.t, createdAt: new Date(Date.now() - (4 - i) * 45000) },
      });
    }
    await db.liveChatMessage.create({
      data: { streamId: st.id, author: "SISTEMA", country: "un", kind: "system", content: "🎯 Predicción activa: participa y gana bonus", createdAt: new Date(Date.now() - 30000) },
    });
  }

  // donaciones de ejemplo
  await db.streamDonation.create({ data: { streamId: created[0].id, from: "MegaFan", to: created[0].streamerName, amount: 100, message: "Sigue así, el mejor análisis" } });
  await db.liveChatMessage.create({ data: { streamId: created[0].id, author: "MegaFan", country: "us", kind: "donation", amount: 100, content: "Sigue así, el mejor análisis" } });
  await db.streamDonation.create({ data: { streamId: created[1].id, from: "ElBarón", to: created[1].streamerName, amount: 25, message: "Por el debate" } });
  await db.liveChatMessage.create({ data: { streamId: created[1].id, author: "ElBarón", country: "gb", kind: "donation", amount: 25, content: "Por el debate" } });

  // ===== PROGRAMACIÓN =====
  const mañana8pm = new Date(Date.now() + 86400_000);
  mañana8pm.setHours(20, 0, 0, 0);
  const viernes = new Date(Date.now() + ((5 - new Date().getDay() + 7) % 7 || 7) * 86400_000);
  viernes.setHours(19, 0, 0, 0);
  await db.streamSchedule.createMany({
    data: [
      { title: "Debate sobre el conflicto del Sahel — ¿nueva guerra fría africana?", host: "VolkovIntel", category: "debate", scheduledAt: mañana8pm, description: "Con invitados del foro y mapa en vivo" },
      { title: "Análisis del simulador: las 5 guerras más probables de 2027", host: "TeaAndIntel", category: "analisis", scheduledAt: viernes, description: "Datos de Warsim + predicciones del mercado" },
      { title: "Historia en vivo: caída del Muro de Berlín, 36º aniversario", host: "Quimbaya", category: "historia", scheduledAt: new Date(Date.now() + 3 * 86400_000), description: "Archivo + curiosidades del panel de épocas" },
    ],
  });

  // ===== REPLAYS =====
  await db.streamReplay.createMany({
    data: [
      { title: "🔴 REPLAY: 2 horas de análisis de la cumbre de la OTAN", streamerName: "LibertyWing", category: "analisis", durationMin: 128, peakViewers: 214, views: 1830, recordedAt: new Date(Date.now() - 2 * 86400_000) },
      { title: "REPLAY: historia en vivo — la guerra de las Malvinas", streamerName: "Quimbaya", category: "historia", durationMin: 95, peakViewers: 156, views: 1120, recordedAt: new Date(Date.now() - 5 * 86400_000) },
      { title: "REPLAY: cobertura nocturna de elecciones globales", streamerName: "TeaAndIntel", category: "noticias", durationMin: 240, peakViewers: 302, views: 2940, recordedAt: new Date(Date.now() - 86400_000) },
    ],
  });

  // ===== COLA DE VERIFICACIÓN DE NOTICIAS (con ground truth) =====
  const news = [
    { headline: "Fuego cruzado en la frontera sur: 2 civiles heridos según ONU", source: "Reuters", publishedAt: "hace 2 h", truth: "real" },
    { headline: "China anuncia la mayor maniobra naval de su historia frente a Taiwán", source: "Bloomberg", publishedAt: "hace 4 h", truth: "real" },
    { headline: "Rusia capitula y retira todas sus tropas del frente este", source: "CanalNoVerificado", publishedAt: "hace 1 h", truth: "falsa" },
    { headline: "La UE aprueba el paquete de sanciones número 19 por unanimidad", source: "Euronews", publishedAt: "hace 6 h", truth: "real" },
    { headline: "Alienígenas aterrizan en la zona de conflicto y piden alto el fuego", source: "DiarioMisterioso", publishedAt: "hace 3 h", truth: "falsa" },
    { headline: "El precio del petróleo cae un 4% tras el alto el fuego temporal", source: "Financial Times", publishedAt: "hace 8 h", truth: "real" },
    { headline: "Ejército secreto de 50.000 soldados visto por satélite en el desierto", source: "BlogOSINT_Anon", publishedAt: "hace 5 h", truth: "dudosa" },
    { headline: "Cumbre de paz en Ginebra: 40 países confirman asistencia", source: "AFP", publishedAt: "hace 10 h", truth: "real" },
  ];
  for (const n of news) {
    await db.newsVerify.create({ data: n });
  }

  // ===== PERFILES DEL LEADERBOARD =====
  const profiles = [
    { alias: "Quimbaya", country: "co", approved: 234, rejected: 12, coinsEarned: 23400, verifHits: 180, verifTotal: 200, streamMinutes: 640, badges: "elite,reportero10,moderador," },
    { alias: "TeaAndIntel", country: "gb", approved: 189, rejected: 8, coinsEarned: 18900, verifHits: 150, verifTotal: 190, streamMinutes: 480, badges: "elite,reportero10," },
    { alias: "VolkovIntel", country: "ru", approved: 156, rejected: 20, coinsEarned: 15600, verifHits: 120, verifTotal: 175, streamMinutes: 320, badges: "reportero10," },
    { alias: "Patriota82", country: "us", approved: 98, rejected: 5, coinsEarned: 9800, verifHits: 80, verifTotal: 110, streamMinutes: 150, badges: "" },
    { alias: "BaguetteWar", country: "fr", approved: 74, rejected: 9, coinsEarned: 7400, verifHits: 60, verifTotal: 95, streamMinutes: 90, badges: "" },
    { alias: "CariñoTropical", country: "do", approved: 61, rejected: 3, coinsEarned: 6100, verifHits: 45, verifTotal: 70, streamMinutes: 220, badges: "reportero10," },
    { alias: "Borscht", country: "ua", approved: 45, rejected: 7, coinsEarned: 4500, verifHits: 40, verifTotal: 68, streamMinutes: 60, badges: "" },
    { alias: "YukiSan", country: "jp", approved: 31, rejected: 2, coinsEarned: 3100, verifHits: 28, verifTotal: 40, streamMinutes: 45, badges: "" },
    { alias: "SchnitzelOp", country: "de", approved: 18, rejected: 4, coinsEarned: 1800, verifHits: 15, verifTotal: 25, streamMinutes: 30, badges: "" },
    { alias: "MegaFan", country: "mx", approved: 9, rejected: 1, coinsEarned: 900, verifHits: 8, verifTotal: 12, streamMinutes: 15, badges: "" },
  ];
  for (const p of profiles) await db.contributorProfile.create({ data: p });

  // ===== CONTRIBUCIONES DE EJEMPLO =====
  const contribs = [
    // aprobadas
    { type: "ficha", title: "Conflicto del Sahel: raíces y actores 2012-2026", content: "Resumen completo de la insurgencia en el Sahel, con el golpe de estado de Malí, la retirada francesa y la entrada de mercenarios rusos. Incluye cronología y actores principales.", author: "Quimbaya", country: "co", status: "aprobado", countries: "ml,ne,bf", rewardCoins: 100 },
    { type: "analisis", title: "¿Qué pasaría si el estrecho de Taiwán se cierra 30 días?", content: "Análisis de consecuencias sobre el comercio global: el 40% de los contenedores pasa por ahí. Escenarios de respuesta de la OMC y el impacto en semiconductores.", author: "TeaAndIntel", country: "gb", status: "aprobado", analysisType: "consecuencias", likes: 67, rewardCoins: 150 },
    { type: "reporte", title: "Convoy militar no identificado visto al norte de la capital", content: "Movimiento de al menos 12 vehículos blindados hacia el norte, confirmado por dos fuentes locales.", author: "VolkovIntel", country: "ru", status: "aprobado", eventType: "militar", location: "Frente Norte", rewardCoins: 50 },
    { type: "traduccion", title: "Resumen del comunicado del Pentágono (EN→ES)", content: "Traducción completa del comunicado oficial sobre el despliegue temporal en el Báltico.", author: "Patriota82", country: "us", status: "aprobado", rewardCoins: 30 },
    { type: "prediccion", title: "¿Habrá alto el fuego formal antes de fin de año?", content: "Predicción comunitaria con 4 opciones basadas en el mercado actual.", author: "BaguetteWar", country: "fr", status: "aprobado", options: JSON.stringify([{ k: "A", t: "Sí, antes de 60 días" }, { k: "B", t: "Sí, entre 60 y 180 días" }, { k: "C", t: "No este año" }, { k: "D", t: "Se agrava el conflicto" }]), rewardCoins: 200 },
    // pendientes (para colas de verificación y moderación)
    { type: "reporte", title: "Corte de energía masivo en la ciudad portuaria esta madrugada", content: "Vecinos reportan apagón total desde las 3 AM, sin explicación oficial. Posible ataque a infraestructura.", author: "Borscht", country: "ua", status: "pendiente", eventType: "crisis", location: "Puerto Sur" },
    { type: "ficha", title: "El conflicto del Congo Oriental: segunda guerra congoleña moderna", content: "Ficha con la historia del M23, los minerales de conflicto y la intervención regional, con fuentes de ACNED y ONU.", author: "CariñoTropical", country: "do", status: "pendiente", countries: "cd,rw,ug" },
    { type: "analisis", title: "Comparativa: bloqueo de Berlín 1948 vs crisis energética actual", content: "Comparativa histórica entre el puente aéreo y la crisis energética, con lecciones para la OTAN.", author: "YukiSan", country: "jp", status: "pendiente", analysisType: "comparativa" },
    { type: "reporte", title: "Protesta masiva frente al parlamento: más de 50.000 personas", content: "Manifestación multitudinaria contra la ley de movilización, transmitida en directo por medios locales.", author: "MegaFan", country: "mx", status: "pendiente", eventType: "protesta", location: "Capital" },
    { type: "traduccion", title: "Traducción del informe de ACNED (FR→ES) sobre refugiados", content: "Traducción del capítulo ejecutivo con cifras oficiales de desplazamiento.", author: "SchnitzelOp", country: "de", status: "pendiente" },
    { type: "prediccion", title: "¿Qué país ganará más influencia en África Occidental en 2027?", content: "Predicción propuesta por la comunidad tras el debate del Sahel.", author: "Quimbaya", country: "co", status: "pendiente", options: JSON.stringify([{ k: "A", t: "Rusia" }, { k: "B", t: "China" }, { k: "C", t: "EE.UU." }, { k: "D", t: "Turquía" }]) },
  ];
  for (const c of contribs) await db.contribution.create({ data: c });

  // votos iniciales para el reporte pendiente (para demostrar la cola)
  const pendingReport = await db.contribution.findFirst({ where: { title: { contains: "Corte de energía" } } });
  if (pendingReport) {
    for (const v of ["TeaAndIntel", "Patriota82", "BaguetteWar", "YukiSan"]) {
      await db.contributionVote.create({ data: { contributionId: pendingReport.id, voter: v, verdict: "confirmo" } });
    }
  }

  // ===== NOTIFICACIONES DE EJEMPLO =====
  await db.contribNotification.createMany({
    data: [
      { alias: "Quimbaya", title: "Tu ficha fue aprobada 🎉 +100 monedas", body: "El Sahel ya está en la enciclopedia comunitaria.", icon: "📝" },
      { alias: "Quimbaya", title: "Eres el contribuidor #1 esta semana 👑", body: "234 contribuciones aprobadas. La comunidad te lo agradece.", icon: "👑" },
      { alias: "TeaAndIntel", title: "Tu análisis llegó a 50 likes 🔥 +250 monedas", body: "Estrecho de Taiwán: en tendencia.", icon: "🔥" },
      { alias: "VolkovIntel", title: "Tu reporte fue verificado ✅", body: "El convoy militar fue confirmado por 5 usuarios.", icon: "✅" },
      { alias: "TeaAndIntel", title: "Tu contribución fue la más vista hoy 🏆", body: "1.840 vistas en el replay de la cumbre OTAN.", icon: "🏆" },
    ],
  });

  console.log("✅ Seed v23 completo:");
  console.log(`  · ${created.length} streams en vivo con chat y donaciones`);
  console.log("  · 3 programados · 3 replays · 8 noticias a verificar");
  console.log(`  · ${contribs.length} contribuciones · ${profiles.length} perfiles · notificaciones`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
