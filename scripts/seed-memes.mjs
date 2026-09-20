// v25 — Semillas de la galería de memes (composiciones de demostración)
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

const L = (id, kind, x, y, size, extra = {}) => ({ id, kind, x, y, size, ...extra });

const memes = [
  {
    author: "Quimbaya", template: "dron",
    caption: "El futuro de la guerra vuela bajo y cuesta menos que un tanque",
    composition: { bg: "noche", layers: [
      L("a1","ball",24,58,110,{code:"ua"}), L("a2","ball",76,58,110,{code:"ru",rotate:-10}), L("a3","emoji",50,34,84,{emoji:"🚀"}),
      L("a4","text",50,10,42,{text:"GUERRA DE DRONES",color:"#C084FC"}), L("a5","text",50,88,18,{text:"UA ESTRENA LA NUEVA GENERACIÓN",color:"#FFFFFF"}),
    ]},
    likes: 7,
  },
  {
    author: "DonBosforo", template: "popcorn",
    caption: "Cuando la cumbre termina en comunicado de 4 páginas y cero acuerdos",
    composition: { bg: "crisis", layers: [
      L("b1","ball",50,46,170,{code:"ch"}), L("b2","ball",88,82,62,{code:"us",rotate:12}), L("b3","emoji",62,60,56,{emoji:"🍿"}),
      L("b4","text",50,10,40,{text:"YO VIÉNDOLO TODO 🍿",color:"#FFD34D"}), L("b5","text",50,88,18,{text:"SUIZA MIRA LA CUMBRE",color:"#FFFFFF"}),
    ]},
    likes: 5,
  },
  {
    author: "VeneziaOSINT", template: "cumbre",
    caption: "La foto familiar sale perfecta; el acuerdo, pendiente desde 2014",
    composition: { bg: "oceano", layers: [
      L("c1","ball",32,52,120,{code:"de"}), L("c2","ball",68,52,120,{code:"fr",rotate:-6}), L("c3","emoji",50,24,64,{emoji:"🕊️"}),
      L("c4","text",50,11,40,{text:"CUMBRE DE PAZ 🕊️",color:"#38BDF8"}), L("c5","text",50,87,18,{text:"APRIETAN MANOS PARA LA FOTO",color:"#FFFFFF"}),
    ]},
    likes: 3,
  },
  {
    author: "PampaAnalista", template: "expectativa",
    caption: "Lo que prometió el ministerio vs lo que quedó del presupuesto",
    composition: { bg: "desierto", layers: [
      L("d1","ball",26,40,140,{code:"ar"}), L("d2","ball",74,40,140,{code:"ar",rotate:-8}), L("d3","emoji",50,62,54,{emoji:"📉"}),
      L("d4","text",50,11,34,{text:"EXPECTATIVA VS REALIDAD",color:"#FFD34D"}), L("d5","text",26,78,22,{text:"EXPECTATIVA",color:"#FFFFFF"}), L("d6","text",74,78,22,{text:"REALIDAD",color:"#FF6B4D"}),
    ]},
    likes: 4,
  },
];

for (const m of memes) {
  const exists = await db.meme.findFirst({ where: { author: m.author, caption: m.caption } });
  if (exists) { console.log("ya existe:", m.author); continue; }
  await db.meme.create({ data: { ...m, composition: JSON.stringify(m.composition) } });
  console.log("sembrado:", m.author);
}
await db.$disconnect();
