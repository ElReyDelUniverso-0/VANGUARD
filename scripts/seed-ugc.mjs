// v26 — Semillas del ESTUDIO COMUNITARIO (contenido de demostración).
// Crea 6 envíos de ejemplo: personaje, arma, juego (HTML jugable), noticia,
// encuesta y música-demo vacía NO se crea (la música sube el usuario).
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

// Juego demo: "CAZA DEL DRON" — canvas completo en <3KB, jugable con mouse/touch
const GAME_HTML = `<!DOCTYPE html><html><head><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1"><style>body{margin:0;background:#05070a;color:#7ef;font-family:monospace;overflow:hidden}#s{position:fixed;top:8px;left:10px;font-size:14px}#t{position:fixed;top:8px;right:10px;font-size:14px}</style></head><body><div id=s>PUNTOS: 0</div><div id=t>30s</div><canvas id=c></canvas><script>
const cv=document.getElementById('c'),g=cv.getContext('2d');let W,H;function rs(){W=cv.width=innerWidth;H=cv.height=innerHeight}rs();onresize=rs;
let drones=[],score=0,t=30,over=false;
function sp(){drones.push({x:Math.random()*W,y:-20,v:1+Math.random()*2.2,r:16+Math.random()*10,h:Math.random()<.15})}
setInterval(sp,600);
cv.addEventListener('pointerdown',e=>{if(over)return;const p=e;drones=drones.filter(d=>{const dx=d.x-p.clientX,dy=d.y-p.clientY;if(dx*dx+dy*dy<(d.r+16)*(d.r+16)){if(d.h){score=Math.max(0,score-2);g.fillStyle='#f43'}else{score+=5;g.fillStyle='#7ef'}g.font='bold 16px monospace';g.fillText('+',d.x,d.y);return false}return true});document.getElementById('s').textContent='PUNTOS: '+score});
const iv=setInterval(()=>{if(over)return;t--;document.getElementById('t').textContent=t+'s';if(t<=0){over=true;clearInterval(iv);g.fillStyle='#000c';g.fillRect(0,0,W,H);g.fillStyle='#ffd34d';g.font='bold 26px monospace';g.fillText('FIN — PUNTOS: '+score,W/2-110,H/2)}},1000);
function loop(){if(!over){g.fillStyle='#05070a';g.fillRect(0,0,W,H);g.strokeStyle='#123';for(let i=0;i<W;i+=40){g.beginPath();g.moveTo(i,0);g.lineTo(i,H);g.stroke()}drones.forEach(d=>{d.y+=d.v;g.font=d.r*1.6+'px serif';g.fillText(d.h?'✈️':'🛸',d.x-d.r/2,d.y)});drones=drones.filter(d=>d.y<H+30)}requestAnimationFrame(loop)}loop();
</script></body></html>`;

const items = [
  {
    kind: "personaje", author: "PampaAnalista", authorBall: "ar", country: "co",
    title: "Quimbaya — el personaje cafetero que nadie vio venir",
    summary: "Un país-personaje original: ni aliado ni enemigo, puro café, neutralidad ymediación secreta.",
    body: "Quimbaya nació como broma del foro y terminó en las cumbres del meme: es el país que todos invitan a mediar porque no tiene ejército, solo el mejor café del mundo y una flota de jeeps Willys.\n\nPersonalidad: pacificador con sombrero aguadeño. Frase típica: 'tómense un tinto y lo hablamos'. Fortaleza: nadie le declara la guerra (¿quién bombardea el café?). Debilidad: la lluvia en la cordillera.",
    photos: "[]",
    assembly: "[]",
    likes: 12,
    aiVerdict: "LIMPIO", aiReason: "Humor geopolítico seguro, sin ataques a grupos reales", aiModerated: true,
  },
  {
    kind: "arma", author: "DonBosforo", authorBall: "tr", country: "ua",
    title: "Mavic 3T con municiones de mortero — el dron de reconnaïsa de trinchera",
    summary: "El dron comercial convertido en los ojos del frente: localiza, corrige artillería y a veces suelta granadas.",
    body: "El Mavic 3T es un dron comercial ucraniano con cámara térmica que las brigadas usan para vigilar trincheras de noche. No es un arma en sí: es el CENTINELA. Localiza grupos, corrige el fuego de mortero y a veces lleva granadas de 30mm hechizadas con impresora 3D.",
    photos: "[]",
    specs: JSON.stringify({ origen: "DJI (comercial, modificado)", calibre: "granadas VOG-17 30mm", peso: "920 gramos + carga", alcance: "12-15 km de radio", usuarios: "brigadas de drones UA/RU" }),
    assembly: JSON.stringify([
      { pieza: "Brazos plegables", desc: "4 brazos de fibra que se pliegan: cabe en una mochila y se despliega en 40 segundos en la trinchera." },
      { pieza: "Cámara térmica", desc: "Sensor que ve el CALOR: un soldado a 300m de noche brilla como una antorcha. Es el arma real del dron: la información." },
      { pieza: "Soporte de carga", desc: "Pinza impresa en 3D bajo el fuselaje con servomotor: suelta la granada con un comando del piloto." },
      { pieza: "Batería de 45 min", desc: "La ventana de vuelo completa: por eso trabajan en parejas — uno observa, otro descansa." },
      { pieza: "Antena y amplificador", desc: "Extiende el radio de control a 15 km; la guerra electrónica enemiga intenta silenciarlo con jamming." },
    ]),
    likes: 8,
    aiVerdict: "LIMPIO", aiReason: "Ficha educativa de equipo documentado públicamente", aiModerated: true,
  },
  {
    kind: "juego", author: "Quimbaya", authorBall: "co", country: "ua",
    title: "CAZA DEL DRON — mi primer juego hecho en el estudio",
    summary: "30 segundos de reflejos: toca los drones 🛸, NO toques los aviones aliados ✈️.",
    body: "Mi primer juego hecho con el editor del estudio comunitario. Todo en un archivo HTML: canvas, enemigos que caen y marcador. ¡El próximo tendrá power-ups!",
    photos: "[]",
    gameHtml: GAME_HTML,
    gamePlatform: "ambos",
    likes: 15,
    plays: 42,
    aiVerdict: "LIMPIO", aiReason: "Juego inofensivo, sin contenido prohibido", aiModerated: true,
  },
  {
    kind: "noticia", author: "VeneziaOSINT", authorBall: "it", country: "",
    title: "OPINIÓN DE LA COMUNIDAD: el cese al fuego que nadie firma",
    summary: "Tres intentos, cuatro treguas humanitarias fallidas y una lección: sin garantías externas, el papel no detiene tanques.",
    body: "Esto no es una noticia de agencia: es lo que la comunidad viene documentando en el foro. Los tres últimos intentos de cese al fuego fracasaron por la misma razón — ninguna potencia externa garantiza el cumplimiento.\n\nSi quieres, debate en los FOROS: ¿las misiones de paz con mandato fuerte valen la pena?",
    photos: "[]",
    likes: 6,
    aiVerdict: "LIMPIO", aiReason: "Opinión geopolítica permitida, sin incitación", aiModerated: true,
  },
  {
    kind: "encuesta", author: "Quimbaya", authorBall: "co", country: "",
    title: "¿Qué sección nueva quieres que lance la comunidad primero?",
    summary: "La comunidad decide la próxima función del estudio. Vota y manda.",
    body: "Reglas: 1 voto por agente. El ganador se construye la próxima semana con el agente de mejora.",
    pollOptions: JSON.stringify([
      { label: "Más plantillas de memes", votes: 7 },
      { label: "Clasificación de música por géneros", votes: 4 },
      { label: "Torneos de juegos comunitarios", votes: 9 },
      { label: "Mapa de colaboradores por país", votes: 3 },
    ]),
    likes: 5,
    aiVerdict: "LIMPIO", aiReason: "Encuesta ordinaria de la comunidad", aiModerated: true,
  },
  {
    kind: "video", author: "DonBosforo", authorBall: "tr", country: "ua",
    title: "MI ANÁLISIS SEMANAL: por qué cambió el mapa del frente",
    summary: "Pega aquí el link de TU análisis en YouTube y se reproduce dentro de la página.",
    body: "Este envío es de muestra: muestra cómo se comparte un video propio (de una persona real con una idea real) desde el estudio. Envía el link de tu YouTube y aparecerá embebido para todos.",
    photos: "[]",
    videoUrl: "https://www.youtube.com/embed/UCknLrEdhRCp1aegoMqRaCZg",
    likes: 2,
    aiVerdict: "LIMPIO", aiReason: "Enlace de video de muestra", aiModerated: true,
  },
];

async function main() {
  const count = await db.ugcItem.count();
  if (count > 0) {
    console.log(`Ya hay ${count} items UGC — no se vuelve a sembrar.`);
    return;
  }
  for (const it of items) {
    await db.ugcItem.create({
      data: {
        kind: it.kind,
        author: it.author,
        authorBall: it.authorBall,
        title: it.title,
        summary: it.summary || "",
        body: it.body || "",
        photos: it.photos || "[]",
        country: it.country || "",
        specs: it.specs || "{}",
        assembly: it.assembly || "[]",
        gameUrl: it.gameUrl || "",
        gameHtml: it.gameHtml || "",
        gamePlatform: it.gamePlatform || "pc",
        audioData: "",
        pollOptions: it.pollOptions || "[]",
        videoUrl: it.videoUrl || "",
        sensitive: false,
        status: "APROBADO",
        aiVerdict: it.aiVerdict,
        aiReason: it.aiReason,
        aiModerated: true,
        likes: it.likes || 0,
        plays: it.plays || 0,
        ratingSum: 17, ratingCount: 4,
      },
    });
    console.log(`+ ${it.kind}: ${it.title.slice(0, 50)}`);
  }
  console.log("Seed v26 completado.");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
