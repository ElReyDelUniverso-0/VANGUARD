// VANGUARD v31 — PLANTILLAS DE JUEGO para el Estudio Comunitario.
// HTML completo y autónomo (sin recursos externos, sin localStorage — el
// sandbox del iframe no lo permite). El creador pulsa una plantilla, se
// rellena el editor y puede publicar tal cual o personalizarla.

export interface GameTemplate {
  id: string;
  name: string;
  desc: string;
  html: string;
}

const TPL_QUIZ = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Quiz de Conflictos</title><style>
body{font-family:monospace;background:#0A0A0F;color:#F0F0F0;margin:0;padding:16px;text-align:center}
h1{color:#1E90FF;font-size:18px;text-transform:uppercase;letter-spacing:2px}
.q{font-size:15px;margin:18px 0}.btn{display:block;width:100%;max-width:420px;margin:8px auto;padding:10px;background:#1A1A2E;border:1px solid #1E90FF;color:#F0F0F0;font-family:monospace;font-size:13px;cursor:pointer}
.btn:hover{background:#1E90FF33}.btn.ok{border-color:#00FF87;color:#00FF87}.btn.ko{border-color:#FF3B30;color:#FF3B30}
#score{color:#FFD700;font-size:14px;margin-top:12px}</style></head><body>
<h1>⚔️ QUIZ DE CONFLICTOS</h1><div id="app"></div><div id="score"></div><script>
var QS=[{q:"¿Cuál es la capital de Ucrania?",o:["Kyiv","Moscú","Varsovia","Odesa"],a:0},{q:"¿Qué país tiene más habitantes?",o:["EE.UU.","India","Brasil","Rusia"],a:1},{q:"¿Cuál es el río más largo del mundo?",o:["Nilo","Amazonas","Yangtsé","Misisipi"],a:1},{q:"¿Qué moneda usa Japón?",o:["Yuan","Won","Yen","Rupia"],a:2},{q:"¿Qué océano es el más grande?",o:["Atlántico","Índico","Pacífico","Ártico"],a:2}];
var i=0,score=0,app=document.getElementById("app");
function pintar(){if(i>=QS.length){app.innerHTML="<div class='q'>🏆 FIN: "+score+"/"+QS.length+"</div><button class='btn' onclick='location.reload()'>Jugar otra vez</button>";return}
var q=QS[i],h="<div class='q'>"+(i+1)+"/"+QS.length+" — "+q.q+"</div>";
for(var k=0;k<q.o.length;k++){h+="<button class='btn' data-k='"+k+"'>"+q.o[k]+"</button>"}
app.innerHTML=h;
app.querySelectorAll(".btn").forEach(function(b){b.onclick=function(){var k=+b.getAttribute("data-k");
if(k===q.a){score++;b.className="btn ok"}else{b.className="btn ko"}
document.getElementById("score").textContent="PUNTOS: "+score;
app.querySelectorAll(".btn").forEach(function(x){x.disabled=true});
setTimeout(function(){i++;pintar()},700)}})}
pintar();</script></body></html>`;

const TPL_REFLEJOS = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Reflejo Nuclear</title><style>
body{font-family:monospace;background:#0A0A0F;color:#F0F0F0;margin:0;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;text-align:center}
#zone{width:min(86vw,420px);height:min(50vh,300px);border:2px solid #1E90FF;display:flex;align-items:center;justify-content:center;font-size:18px;cursor:pointer;user-select:none;background:#1A1A2E}
#zone.go{border-color:#00FF87;background:#00FF8722}
#msg{margin:14px 0;color:#FFD700;font-size:16px;min-height:22px}</style></head><body>
<h1 style="color:#FF3B30">☢️ REFLEJO NUCLEAR</h1>
<p style="font-size:12px;color:#8A90A8">Espera el VERDE… y toca lo más rápido que puedas</p>
<div id="zone">TOCA PARA EMPEZAR</div><div id="msg"></div><div id="best"></div><script>
var z=document.getElementById("zone"),m=document.getElementById("msg"),best=document.getElementById("best");
var state="idle",t0=0,timer=null,topScore=null;
var READY=["ALERTA…","ESPERA…","NO TOQUES TODAVÍA…","CALMA…","OJO…"];
z.onclick=function(){
 if(state==="idle"||state==="done"){state="wait";z.className="";z.textContent=READY[Math.floor(Math.random()*READY.length)];m.textContent="";
 timer=setTimeout(function(){state="go";z.className="go";z.textContent="🟢 ¡AHORA!";t0=Date.now()},900+Math.random()*2200);return}
 if(state==="wait"){clearTimeout(timer);state="idle";z.className="";z.textContent="TOCA PARA EMPEZAR";m.textContent="❌ Demasiado pronto — falso inicio";return}
 if(state==="go"){var ms=Date.now()-t0;state="done";z.className="";z.textContent="TOCA PARA REPETIR";
 if(topScore===null||ms<topScore){topScore=ms;best.textContent="🏅 RÉCORD: "+topScore+" ms"}
 m.textContent="⏱️ "+ms+" ms — "+(ms<250?"¡REFLEJOS DE FRANCOTIRADOR!":ms<400?"Buenos reflejos":"El dron llegó antes…")}};</script></body></html>`;

const TPL_DRONES = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Caza-Drones</title><style>
body{font-family:monospace;background:#0A0A0F;color:#F0F0F0;margin:0;padding:10px;text-align:center}
canvas{background:#05070D;border:1px solid #1E90FF;touch-action:none;max-width:100%}
#hud{color:#FFD700;font-size:14px;margin:6px 0}</style></head><body>
<h1 style="color:#1E90FF;font-size:16px">🛸 CAZA-DRONES 30s</h1>
<div id="hud">PUNTOS: 0</div>
<canvas id="cv" width="360" height="420"></canvas>
<p style="font-size:11px;color:#8A90A8">Toca/clic los drones rojos · 30 segundos</p><script>
var cv=document.getElementById("cv"),cx=cv.getContext("2d"),hud=document.getElementById("hud");
var drones=[],score=0,left=30,running=false;
function spawn(){drones.push({x:30+Math.random()*(cv.width-60),y:-20,v:1+Math.random()*1.6,r:14})}
function loop(){cx.clearRect(0,0,cv.width,cv.height);
 cx.strokeStyle="#123";for(var gy=0;gy<cv.height;gy+=30){cx.beginPath();cx.moveTo(0,gy);cx.lineTo(cv.width,gy);cx.stroke()}
 for(var i=drones.length-1;i>=0;i--){var d=drones[i];d.y+=d.v;
 cx.fillStyle="#FF3B30";cx.beginPath();cx.arc(d.x,d.y,d.r,0,7);cx.fill();
 cx.fillStyle="#F0F0F0";cx.font="12px monospace";cx.fillText("🛸",d.x-8,d.y+4);
 if(d.y>cv.height+20)drones.splice(i,1)}
 if(running)requestAnimationFrame(loop)}
function tick(){left--;if(left<=0){running=false;alert("FIN 🏆 Puntos: "+score+" de "+(score+""));}
 else setTimeout(tick,1000)}
cv.addEventListener("pointerdown",function(e){if(!running)return;
 var p=cv.getBoundingClientRect(),mx=(e.clientX-p.left)*(cv.width/p.width),my=(e.clientY-p.top)*(cv.height/p.height);
 for(var i=drones.length-1;i>=0;i--){var d=drones[i];
 if((d.x-mx)*(d.x-mx)+(d.y-my)*(d.y-my)<(d.r+12)*(d.r+12)){drones.splice(i,1);score++;hud.textContent="PUNTOS: "+score}}});
function start(){drones=[];score=0;left=30;running=true;hud.textContent="PUNTOS: 0";setTimeout(tick,1000);loop();
 setTimeout(function end(){if(left<=0)return;cx.clearRect(0,0,cv.width,cv.height);cx.fillStyle="#FFD700";cx.font="18px monospace";
 cx.fillText("FIN 🏆 "+score+" puntos",90,cv.height/2)},30500)}
start();</script></body></html>`;

export const GAME_TEMPLATES: GameTemplate[] = [
  {
    id: "quiz",
    name: "Quiz de Conflictos",
    desc: "5 preguntas de cultura general con puntuación — edita las preguntas y haz el tuyo",
    html: TPL_QUIZ,
  },
  {
    id: "reflejos",
    name: "Reflejo Nuclear",
    desc: "Juego de reacción: esperar el verde y tocar — récord de milisegundos",
    html: TPL_REFLEJOS,
  },
  {
    id: "drones",
    name: "Caza-Drones 30s",
    desc: "Mini-juego de canvas: toca los drones antes de que escapen",
    html: TPL_DRONES,
  },
];
