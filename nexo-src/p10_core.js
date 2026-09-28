(function(){
'use strict';
/* ================= VANGUARD v68 CONTROL DIRECTO — NÚCLEO ================= */
const $=(s,r)=> (r||document).querySelector(s);
const $$=(s,r)=> Array.from((r||document).querySelectorAll(s));
const clamp=(v,a,b)=>v<a?a:(v>b?b:v);
const lerp=(a,b,t)=>a+(b-a)*t;
const rnd=(a,b)=>a+Math.random()*(b-a);
const irnd=(a,b)=>Math.floor(rnd(a,b+1));
const pick=a=>a[Math.floor(Math.random()*a.length)];
const dist2=(x1,y1,x2,y2)=>Math.hypot(x2-x1,y2-y1);
const fmt=n=>{n=Math.round(n);return n>=1e9?(n/1e9).toFixed(1)+'B':n>=1e6?(n/1e6).toFixed(1)+'M':n>=1e3?(n/1e3).toFixed(1)+'k':''+n};
const now=()=>Date.now();
const esc=s=>(''+s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const isTouch=('ontouchstart' in window)||navigator.maxTouchPoints>0;
const IS_MOBILE=isTouch&&Math.min(innerWidth,innerHeight)<820;

/* ---------- CONFIG: pega claves opcionales aquí o en localStorage vg_keys ---------- */
const CFG=Object.assign({
  mapbox:'', elevenlabs:'', pexels:'', telegram:'', supabaseUrl:'', supabaseKey:'', firebase:''
},JSON.parse(localStorage.getItem('vg_keys')||'{}'));

/* ---------- PERFIL / GUARDADO ---------- */
const RANKS=['CIVIL','RECLUTA','ANALISTA','CORRESPONSAL','OPERATIVO','AGENTE ESPECIAL','DIRECTOR ADJUNTO','DIRECTOR DE INTELIGENCIA','LEYENDA','ORÁCULO'];
const RANK_XP=[0,100,250,500,900,1400,2000,2800,3800,5200];
const RANK_COLOR=['#8A93A6','#8A93A6','#00FF87','#00FF87','#1E90FF','#1E90FF','#B26BFF','#B26BFF','#FFC24B','#FFC24B'];
function defaultProfile(){return{
  v:68, code:'', gender:'m', suit:0, skin:2, hair:0,
  coins:0, xp:0, rank:0,
  cards:[], files:[], recruits:[], skills:{},
  streak:0, lastEnvelopeDay:0, lastSeen:0,
  tension:44, pacRep:0, analystRep:0, karma:0,
  foundersN:0, morseHits:0, omega:false, island:false,
  konami:false, arcadeUsed:0, missionDone:0, hackWins:0, duelWins:0,
  bestSniper:0, bestTactic:false, marketNet:0, totalEarned:0, created:now()
};}
let P;
try{P=Object.assign(defaultProfile(),JSON.parse(localStorage.getItem('vg_nexo_v1')||'{}'));}catch(e){P=defaultProfile();}
if(!P.code)P.code='';
let saveT=null,cloudDirty=false;
function save(){clearTimeout(saveT);saveT=setTimeout(()=>{try{localStorage.setItem('vg_nexo_v1',JSON.stringify(P));}catch(e){}},600);}

/* ---------- ECONOMÍA ---------- */
let protocoloUntil=Number(localStorage.getItem('vg_protocolo')||0);
function protocoloActive(){return now()<protocoloUntil;}
function skillMult(){const n=Object.values(P.skills||{}).reduce((a,b)=>a+(b||0),0);return 1+n*0.05;}
function addCoins(n,why){
  if(n>0){let m=1;if(protocoloActive())m*=2;
    m*=skillMult('analista');
    if(P.recruits.some(r=>r.spec==='ECO'))m*=1.05;
    n=Math.round(n*m);
    P.totalEarned+=n;
    if(m>1&&why)toast('MULTIPLICADOR','+'+n+' C\u20AC2 (x'+m.toFixed(1)+' activo)','gold');
  }
  P.coins=Math.max(0,Math.round(P.coins+n));
  $('#coinsN').textContent=fmt(P.coins);
  if(n>0)FX.coinBurst(irnd(6,14));
  save();return n;
}
function addXP(n){
  P.xp+=n;
  let up=false;
  while(P.rank<9&&P.xp>=RANK_XP[P.rank+1]){P.rank++;up=true;}
  if(up){
    const bonus=100*P.rank;P.coins+=bonus;
    toast('ASCENSO','\u00A1'+RANKS[P.rank]+'! Bonus +'+bonus+' C\u20AC2','gold',5200);
    SFX.fanfare();Flash.ring();
    Hangar.celebrate&&Hangar.celebrate();
    pushFeed('HAS SIDO ASCENDIDO A '+RANKS[P.rank],'y');
  }
  refreshHUD();save();
}
function xpPct(){
  const a=RANK_XP[P.rank],b=P.rank<9?RANK_XP[P.rank+1]:a+2000;
  return clamp((P.xp-a)/(b-a)*100,0,100);
}
function refreshHUD(){
  $('#coinsN').textContent=fmt(P.coins);
  $('#rankTag').textContent=RANKS[P.rank];
  $('#rankTag').style.color=RANK_COLOR[P.rank];
  $('#xpBar i').style.width=xpPct()+'%';
  $('#xpLab').textContent='XP '+fmt(P.xp);
  $('#rachaN').textContent=P.streak;
  const t=Math.round(World.tension);
  $('#thermoN').textContent=t;
  $('#thermo i').style.width=t+'%';
  document.body.classList.toggle('t-hot',t>=55&&t<80);
  document.body.classList.toggle('t-crisis',t>=80&&t<90);
  document.body.classList.toggle('t-rojo',t>=90);
  const hb=World.heartbeatMs();
  $('#hbIcon').style.setProperty('--hb',hb+'ms');
}
const IC='\u20AC2'; /* símbolo moneda ⓒ */

/* ---------- TOASTS / MODAL / FLASH ---------- */
function toast(t1,t2,kind,ms){
  const d=document.createElement('div');d.className='toast '+(kind||'');
  d.innerHTML='<div class="t1">'+esc(t1)+'</div><div>'+t2+'</div>';
  $('#toasts').appendChild(d);
  setTimeout(()=>{d.style.opacity='0';d.style.transition='opacity .4s';setTimeout(()=>d.remove(),450);},ms||3600);
}
let modalOnClose=null;
function openModal(title,html,onClose){
  $('#modalTitle').textContent=title;$('#modalBody').innerHTML=html;
  $('#modalWrap').classList.add('on');modalOnClose=onClose||null;
}
function closeModal(){if(!$('#modalWrap').classList.contains('on'))return;$('#modalWrap').classList.remove('on');if(modalOnClose){modalOnClose();modalOnClose=null;}}
const Flash={
  f:$('#flash'),
  white(o,ms){this.f.style.background='#fff';this.f.style.opacity=o||.5;setTimeout(()=>this.f.style.opacity=0,ms||110);},
  red(o,ms){this.f.style.background='#FF3B30';this.f.style.opacity=o||.4;setTimeout(()=>this.f.style.opacity=0,ms||160);},
  ring(){this.white(.25,90);setTimeout(()=>FX.rings(innerWidth/2,innerHeight/2,1),60);}
};
function vibrate(ms){try{navigator.vibrate&&navigator.vibrate(ms);}catch(e){}}

/* ---------- TENSION + LATIDO DEL MUNDO (sistema 21) ---------- */
const World={
  tension:clamp(P.tension,10,96),
  lastDrift:now(),
  bump(v,why){
    const prev=this.tension;this.tension=clamp(this.tension+v,5,99);
    if(why&&Math.abs(v)>=1)toast('TENSI\u00D3N MUNDIAL',(v>0?'+':'')+v.toFixed(1)+' \u00B7 '+why,v>0?'bad':'good',2600);
    if(prev<80&&this.tension>=80){SFX.alarm();toast('MODO CRISIS','Tensi\u00F3n >80: el mundo late en rojo','bad',5000);pushFeed('MODO CRISIS ACTIVADO \u2014 tensi\u00F3n global '+Math.round(this.tension),'r');}
    if(prev<90&&this.tension>=90){SFX.siren();toast('PROTOCOLO ROJO','Toda la interfaz late. Act\u00FAa.','bad',6000);}
    P.tension=this.tension;refreshHUD();
  },
  heartbeatMs(){const t=this.tension;return Math.round(lerp(1300,360,clamp((t-10)/85,0,1)));},
  beatAcc:0, beatN:0,
  update(dt){
    if(now()-this.lastDrift>60000){this.lastDrift=now();this.tension+=(this.tension<70?rnd(.5,2):rnd(-2,.5));this.tension=clamp(this.tension,10,96);P.tension=this.tension;refreshHUD();save();}
    this.beatAcc+=dt*1000;
    const ms=this.heartbeatMs();
    if(this.beatAcc>=ms){
      this.beatAcc=0;this.beatN++;
      const t=this.tension;
      const vol=lerp(.06,.5,clamp((t-10)/85,0,1));
      SFX.heart(vol,t>=80);
      $('#vig').style.opacity=Math.min(1,.25+(t/100)*.75);
      if(t>=90)document.body.animate([{filter:'brightness(1)'},{filter:'brightness(1.25) saturate(1.4)'},{filter:'brightness(1)'}],{duration:ms*.8});
    }
  }
};

/* ---------- DATOS REALES (mismas APIs del sitio + APIs abiertas) ---------- */
const DATA={news:[],quakes:[],pulso:null,countries:[],iss:null,online:1,peak:0,health:null,loaded:false};
async function jget(url,ms){
  try{const c=new AbortController();const t=setTimeout(()=>c.abort(),ms||9000);
    const r=await fetch(url,{signal:c.signal,cache:'no-store'});clearTimeout(t);
    if(!r.ok)throw 0;return await r.json();
  }catch(e){return null;}
}
async function loadNews(){
  const j=await jget('/api/news');
  if(j&&Array.isArray(j.items)&&j.items.length){DATA.news=j.items.slice(0,14);}
  else DATA.news=simNews();
  buildTicker();
}
async function loadQuakes(){
  const j=await jget('/api/earthquakes');
  if(j&&Array.isArray(j.quakes))DATA.quakes=j.quakes.slice(0,12);
  else DATA.quakes=[];
}
async function loadPulso(){
  const j=await jget('/api/pulso');
  if(j){DATA.pulso=j;if(j.iss)DATA.iss=j.iss;}
}
async function loadCountries(){
  const j=await jget('https://restcountries.com/v3.1/all?fields=name,cca2,latlng,region,population,translations,capital,currencies',12000);
  if(Array.isArray(j)&&j.length>50){
    DATA.countries=j.map(c=>({n:(c.translations&&c.translations.spa&&c.translations.spa.common)||c.name.common,nEn:c.name.common,c2:c.cca2,lat:c.latlng&&c.latlng[0],lng:c.latlng&&c.latlng[1],reg:c.region,pop:c.population,cap:c.capital&&c.capital[0],cur:c.currencies?Object.keys(c.currencies)[0]:null}));
  }else DATA.countries=FALLBACK_COUNTRIES;
}
async function loadPresence(){
  const j=await jget('/api/presence');
  if(j&&j.ok){DATA.online=Math.max(1,j.online);DATA.peak=j.peak||DATA.peak;
    $('#onlineN').textContent=DATA.online;
    const pt=$('#peakTag');pt.style.display='';pt.textContent='R\u00C9CORD '+DATA.peak;
  }
  const h=await jget('/api/health');
  if(h&&h.ok){DATA.health=h;$('#verTag').textContent=h.version||'v68';}
}
function simNews(){
  const T=['Escalada militar en el mar Rojo: los portaaviones cambian de posici\u00F3n','Cumbre de emergencia por la crisis energ\u00E9tica europea','Ciberataque masivo derriba servidores de una agencia gubernamental','Nuevas sanciones comerciales entraron en vigor esta madrugada','Cese el fuego fr\u00E1gil: observadores reportan disparos aislados','R\u00E9cord de refugiados cruzando la frontera sur','Maniobras navales sin precedentes cerca de aguas disputadas','Filtraci\u00F3n: documento clasificado describe un programa satelital secreto'];
  return T.map((t,i)=>({externalId:'sim-'+i,title:t,domain:'VANGUARD OSINT',published:new Date().toISOString(),imageUrl:null}));
}
const FALLBACK_COUNTRIES=[
 {n:'Ucrania',nEn:'Ukraine',c2:'UA',lat:49,lng:32,reg:'Europe',pop:44000000},
 {n:'Rusia',nEn:'Russia',c2:'RU',lat:61,lng:90,reg:'Europe',pop:144000000},
 {n:'Israel',nEn:'Israel',c2:'IL',lat:31.5,lng:34.9,reg:'Asia',pop:9500000},
 {n:'Palestina',nEn:'Palestine',c2:'PS',lat:31.9,lng:35.2,reg:'Asia',pop:5300000},
 {n:'Sud\u00E1n',nEn:'Sudan',c2:'SD',lat:15,lng:30,reg:'Africa',pop:47000000},
 {n:'Taiw\u00E1n',nEn:'Taiwan',c2:'TW',lat:23.7,lng:121,reg:'Asia',pop:23000000},
 {n:'Corea del Norte',nEn:'North Korea',c2:'KP',lat:40,lng:127,reg:'Asia',pop:26000000},
 {n:'Ir\u00E1n',nEn:'Iran',c2:'IR',lat:32,lng:53,reg:'Asia',pop:88000000},
 {n:'Venezuela',nEn:'Venezuela',c2:'VE',lat:8,lng:-66,reg:'South America',pop:28000000},
 {n:'Estados Unidos',nEn:'United States',c2:'US',lat:39,lng:-98,reg:'Americas',pop:335000000},
 {n:'China',nEn:'China',c2:'CN',lat:35,lng:105,reg:'Asia',pop:1412000000},
 {n:'India',nEn:'India',c2:'IN',lat:21,lng:78,reg:'Asia',pop:1428000000},
 {n:'Brasil',nEn:'Brazil',c2:'BR',lat:-12,lng:-50,reg:'South America',pop:216000000},
 {n:'Espa\u00F1a',nEn:'Spain',c2:'ES',lat:40,lng:-4,reg:'Europe',pop:48000000},
 {n:'M\u00E9xico',nEn:'Mexico',c2:'MX',lat:23,lng:-102,reg:'Americas',pop:128000000},
 {n:'Argentina',nEn:'Argentina',c2:'AR',lat:-35,lng:-65,reg:'South America',pop:46000000},
 {n:'Colombia',nEn:'Colombia',c2:'CO',lat:4,lng:-73,reg:'South America',pop:52000000},
 {n:'Chile',nEn:'Chile',c2:'CL',lat:-33,lng:-71,reg:'South America',pop:19600000},
 {n:'Francia',nEn:'France',c2:'FR',lat:46,lng:2,reg:'Europe',pop:68000000},
 {n:'Alemania',nEn:'Germany',c2:'DE',lat:51,lng:10,reg:'Europe',pop:84000000},
 {n:'Reino Unido',nEn:'United Kingdom',c2:'GB',lat:54,lng:-2,reg:'Europe',pop:67000000},
 {n:'Jap\u00F3n',nEn:'Japan',c2:'JP',lat:36,lng:138,reg:'Asia',pop:124000000},
 {n:'Etiop\u00EDa',nEn:'Ethiopia',c2:'ET',lat:9,lng:40,reg:'Africa',pop:126000000},
 {n:'Mal\u00ED',nEn:'Mali',c2:'ML',lat:17,lng:-4,reg:'Africa',pop:23000000},
 {n:'Siria',nEn:'Syria',c2:'SY',lat:35,lng:38,reg:'Asia',pop:22000000},
 {n:'Yemen',nEn:'Yemen',c2:'YE',lat:15.5,lng:48,reg:'Asia',pop:34000000},
 {n:'Myanmar',nEn:'Myanmar',c2:'MM',lat:21,lng:96,reg:'Asia',pop:54000000},
 {n:'Hait\u00ED',nEn:'Haiti',c2:'HT',lat:19,lng:-72.7,reg:'Americas',pop:11600000}
];
function flagURL(c2,s){return 'https://flagcdn.com/w'+(s||80)+'/'+(c2||'un').toLowerCase()+'.png';}
async function wikiSummary(title){
  const j=await jget('https://es.wikipedia.org/api/rest_v1/page/summary/'+encodeURIComponent(title),8000);
  if(j&&j.extract)return{extract:j.extract,url:j.content_urls&&j.content_urls.desktop&&j.content_urls.desktop.page,thumb:j.thumbnail&&j.thumbnail.source};
  return null;
}

/* ---------- FEED SOCIAL + TICKER ---------- */
const AGENT_NAMES=['Ana L\u00F3pez','K. Voss','Marelys P.','El C\u00F3ndor','Nadia R.','J. O\u2019Hara','La Viuda','Tango-7','R. M\u00E9ndez','Sombra-9','Camila F.','El Dan\u00E9s','P. Okonkwo','Vig\u00EDa-2','D. Kowalski','Halc\u00F3n-3'];
const FEED_ACTS=['acaba de resolver el caso del Mar Rojo','desbloque\u00F3 el Expediente Omega','intercept\u00F3 un mensaje morse',' gan\u00F3 un duelo de predicciones','encontr\u00F3 un documento quemado en la Biblioteca','atrap\u00F3 a un esp\u00EDa doble','complet\u00F3 un reconocimiento con dron al 100%','descifr\u00F3 el c\u00F3digo de la sala de hackeo','gan\u00F3 +500 C\u20AC2 en el Mercado de Inteligencia','fotografi\u00F3 una zona de conflicto desde el sat\u00E9lite','reclut\u00F3 a un economista para su equipo','sobrevivi\u00F3 al Protocolo Rojo'];
const feedItems=[];
function pushFeed(txt,cls){feedItems.unshift({txt,cls:cls||'',t:now()});if(feedItems.length>40)feedItems.pop();buildTicker();}
function randomFeedEvent(){
  const a=pick(AGENT_NAMES.filter(n=>n!=='K. Voss'));
  pushFeed(a+' '+pick(FEED_ACTS),pick(['','g','y']));
}
function buildTicker(){
  const parts=[];
  feedItems.slice(0,14).forEach(f=>{parts.push('<span class="'+f.cls+'">\u25B8 '+esc(f.txt)+'</span>');});
  DATA.news.slice(0,8).forEach(n=>{parts.push('<b>NOTICIA</b> '+esc(n.title));});
  if(P.morseHits<3)parts.push('<span class="y">...se\u00F1al codificada detectada en el canal morse...</span>');
  const el=$('#tickerIn');
  if(el)el.innerHTML=parts.join('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;');
}

/* ---------- PRESENCIA REAL (mismo backend del sitio) ---------- */
const UID=(function(){let u=localStorage.getItem('vg_uid');if(!u){u='nx-'+Math.random().toString(36).slice(2,10);localStorage.setItem('vg_uid',u);}return u;})();
async function presenceBeat(){
  const j=await jget('/api/presence',6000);
  if(j&&j.ok){DATA.online=Math.max(1,j.online);DATA.peak=Math.max(DATA.peak||0,j.peak||0);
    $('#onlineN').textContent=DATA.online;const pt=$('#peakTag');pt.style.display='';pt.textContent='R\u00C9CORD '+DATA.peak;}
  try{await fetch('/api/presence',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({uid:UID,lang:'es'})});}catch(e){}
}
setInterval(presenceBeat,30000);

/* ---------- GESTOR DE PANTALLAS ---------- */
const Rooms={};
let activeRoom=null,activeRoomName='';
function registerRoom(name,def){Rooms[name]=def;def.name=name;}
function go(name,arg){
  const def=Rooms[name];if(!def)return;
  if(activeRoom&&activeRoom.exit)try{activeRoom.exit();}catch(e){console.error(e);}
  $$('.scr').forEach(s=>s.classList.remove('on'));
  if(!def.three)ThreeEng.hide();
  const sec=def.section?$('#'+def.section):null;
  if(sec)sec.classList.add('on');
  activeRoom=def;activeRoomName=name;
  if(def.enter)try{def.enter(arg);}catch(e){console.error(e);}
  refreshHUD();
}
function roomName(){return activeRoomName;}

/* ---------- BUCLE MAESTRO + FPS ---------- */
const Loop={
  fns:[],last:performance.now(),fps:60,acc:0,frames:0,quality:IS_MOBILE?1:2,
  add(fn){this.fns.push(fn);},
  tick(t){
    let dt=(t-this.last)/1000;this.last=t;
    if(dt>0.09)dt=0.09;
    this.frames++;this.acc+=dt;
    if(this.acc>=1){this.fps=this.frames/this.acc;this.frames=0;this.acc=0;
      if(this.fps<38&&this.quality>0){this.quality--;ThreeEng.lowQuality();FX.lowQuality();}
    }
    try{World.update(dt);}catch(e){}
    if(activeRoom&&activeRoom.update)try{activeRoom.update(dt);}catch(e){console.error(e);}
    for(const f of this.fns)try{f(dt);}catch(e){}
    requestAnimationFrame(this.tickB);
  }
};
Loop.tickB=Loop.tick.bind(Loop);
requestAnimationFrame(Loop.tickB);

/* ---------- ERRORES: nunca pantalla muerta ---------- */
let errShown=false;
window.addEventListener('error',e=>{if(!errShown){errShown=true;try{toast('AVISO','Un m\u00F3dulo se reinici\u00F3. Sigue jugando.','bad');}catch(x){}}console.error('VG68:',e.message);});
window.addEventListener('unhandledrejection',e=>console.error('VG68 promise:',e.reason));

/* expone lo esencial (debug) */
window.__VG={P,World,DATA,go,Rooms};
