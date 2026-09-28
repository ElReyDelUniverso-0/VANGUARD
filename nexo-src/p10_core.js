(function(){
'use strict';
/* ================= VANGUARD v69 FUSIÓN TOTAL — NÚCLEO ================= */
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
  if(h&&h.ok){DATA.health=h;$('#verTag').textContent=h.version||'v69';}
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
  try{applyTheme(name);}catch(e){}
  refreshHUD();
}
function roomName(){return activeRoomName;}

/* ---------- REGLA DE ORO: COLOR + ILUSTRACIÓN ÚNICA POR SECCIÓN ---------- */
/* Cada sala tiene su tono vibrante propio y su ilustración SVG: nada aburrido, todo distinto. */
const ROOM_ICONS={
  badge:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="8" width="32" height="32" rx="4"/><circle cx="19" cy="20" r="4"/><path d="M13 32c1-4 4-6 6-6s5 2 6 6"/><path d="M29 16h8M29 22h8M29 28h5"/></svg>',
  hangar:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 40V20l18-12 18 12v20"/><path d="M18 40V27h12v13"/><path d="M2 40h44"/><path d="M24 8v6"/></svg>',
  globo:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="24" cy="24" r="16"/><ellipse cx="24" cy="24" rx="7" ry="16"/><path d="M8 24h32M11 15h26M11 33h26"/></svg>',
  folder:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 12h14l4 5h18v21H6z"/><path d="M24 22l1.8 3.8 4.2.6-3 3 .7 4.1-3.7-2-3.7 2 .7-4.1-3-3 4.2-.6z"/></svg>',
  book:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M24 12c-4-3-9-4-16-4v28c7 0 12 1 16 4 4-3 9-4 16-4V8c-7 0-12 1-16 4z"/><path d="M24 12v28"/></svg>',
  eye:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 24s8-10 20-10 20 10 20 10-8 10-20 10S4 24 4 24z"/><circle cx="24" cy="24" r="5"/><path d="M24 12v-4M24 40v-4" opacity=".6"/></svg>',
  tank:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 30h26l6-4"/><rect x="4" y="30" width="34" height="8" rx="4"/><rect x="14" y="22" width="14" height="8" rx="2"/><path d="M28 24h16"/></svg>',
  cross:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="24" cy="24" r="14"/><path d="M24 4v10M24 34v10M4 24h10M34 24h10"/><circle cx="24" cy="24" r="3" fill="currentColor"/></svg>',
  map:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 10l12 4 12-4 8 4v24l-8-4-12 4-12-4z"/><path d="M20 14v24M32 10v24"/></svg>',
  mtn:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 38L18 14l8 13 4-6 14 17z"/><circle cx="36" cy="10" r="4"/></svg>',
  quiz:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="8" width="32" height="32" rx="6"/><path d="M18 19a6 6 0 1 1 8 5.7c-1.6.6-2 1.8-2 3.3"/><circle cx="24" cy="33" r="1.6" fill="currentColor"/></svg>',
  turret:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 38a10 10 0 0 1 20 0"/><path d="M24 28v-8"/><path d="M24 20L38 8"/><circle cx="24" cy="26" r="4"/><path d="M8 38h32"/></svg>',
  radio:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M24 42L14 6M24 42L34 6M17 18h14M14 30h20"/><path d="M38 10a8 8 0 0 1 0 12M42 6a13 13 0 0 1 0 20" opacity=".65"/></svg>',
  code:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M16 12L6 24l10 12M32 12l10 12-10 12M27 8l-6 32"/></svg>',
  scale:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M24 6v34M12 12h24M12 12l-5 10a5 5 0 0 0 10 0zM36 12l-5 10a5 5 0 0 0 10 0z"/><path d="M16 40h16"/></svg>',
  chart:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 40h36"/><path d="M8 34l10-10 6 5 12-14"/><path d="M30 15h6v6"/><circle cx="36" cy="10" r="3" fill="currentColor"/></svg>',
  dove:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 22c6-8 16-10 24-6l8-6-4 10c2 8-4 16-14 16-6 0-10-3-12-8z"/><path d="M16 24c3 1 6 1 9-1"/><circle cx="14" cy="20" r="1.4" fill="currentColor"/></svg>',
  cards:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="12" width="18" height="26" rx="3" transform="rotate(-8 15 25)"/><rect x="22" y="10" width="18" height="26" rx="3" transform="rotate(8 31 23)"/><path d="M31 19l1.5 3 3 .5-2.2 2.2.5 3.3-2.8-1.5-2.8 1.5.5-3.3-2.2-2.2 3-.5z" fill="currentColor" stroke="none"/></svg>',
  dron:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="24" cy="24" r="5"/><path d="M24 19V9M24 29v10M19 24H9M29 24h10"/><circle cx="9" cy="9" r="5"/><circle cx="39" cy="9" r="5"/><circle cx="9" cy="39" r="5"/><circle cx="39" cy="39" r="5"/></svg>',
  dish:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 36a16 16 0 0 1 8-26l10 10a16 16 0 0 1-18 16z"/><path d="M20 20l-6 16"/><circle cx="27" cy="13" r="2.4"/><path d="M34 20l4 4M38 12l4 4" opacity=".65"/></svg>',
  morse:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="24" cy="20" r="10"/><path d="M10 40h28" opacity=".4"/><circle cx="14" cy="40" r="1.6" fill="currentColor"/><circle cx="21" cy="40" r="1.6" fill="currentColor"/><path d="M28 40h8" stroke-width="2.6"/><path d="M24 10v-4" opacity=".6"/></svg>',
  reptil:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="24" cy="24" rx="19" ry="10"/><ellipse cx="24" cy="24" rx="3.2" ry="8" fill="currentColor" stroke="none"/><path d="M6 20q6-6 12-2M42 20q-6-6-12-2" opacity=".6"/><path d="M4 34q8 4 20 4t20-4" opacity=".45"/></svg>',
  retro:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="16" width="36" height="20" rx="4"/><circle cx="17" cy="26" r="5"/><path d="M31 21v6M28 24h6"/><path d="M10 12l4 4M38 12l-4 4" opacity=".6"/></svg>'
};
const ROOM_THEMES={
  intro:{c:'#1E90FF'},
  onboarding:{c:'#1E90FF',t:'NUEVO AGENTE DETECTADO',s:'sin registro \u00B7 sin muros \u00B7 solo tu nombre en clave',svg:ROOM_ICONS.badge},
  hangar:{c:'#3E8EFF'},
  globo:{c:'#00D4FF'},
  misiones:{c:'#00FF87',t:'SALA DE MISIONES',s:'dossiers con noticias reales \u00B7 arrastra la ficha a la mesa',svg:ROOM_ICONS.folder},
  biblio:{c:'#B26BFF',t:'BIBLIOTECA SECRETA',s:'excava capa por capa \u00B7 documentos hist\u00F3ricos reales',svg:ROOM_ICONS.book},
  interrog:{c:'#5CE1E6',t:'SALA DE INTERROGACI\u00D3N',s:'holograma inestable \u00B7 arranca el secreto con preguntas',svg:ROOM_ICONS.eye},
  sim:{c:'#FF3B30',t:'SIMULADOR DE COMBATE',s:'5 entrenamientos \u00B7 tu r\u00E9cord te espera',svg:ROOM_ICONS.tank},
  sniper:{c:'#FF7A2A',t:'FRANCOTIRADOR OSINT',s:'dispara solo a la desinformaci\u00F3n \u00B7 la verdad NO se toca',svg:ROOM_ICONS.cross},
  tactica:{c:'#FFE066',t:'MESA T\u00C1CTICA',s:'arrastre por peso \u00B7 victoria en vivo',svg:ROOM_ICONS.map},
  builder:{c:'#8AFFC1',t:'CONSTRUCTOR DE MUNDOS',s:'esculpe monta\u00F1as, oc\u00E9anos y fronteras',svg:ROOM_ICONS.mtn},
  quiz:{c:'#FF5CA8',t:'QUIZ GEOPOL\u00CDTICO',s:'bloques caen del techo \u00B7 responde antes del impacto',svg:ROOM_ICONS.quiz},
  td:{c:'#A8FF3E',t:'DEFENSA PERIMETRAL',s:'oleadas que aprenden de ti',svg:ROOM_ICONS.turret},
  radio:{c:'#FF8A5C',t:'RADIO GEOPOL\u00CDTICA',s:'dial anal\u00F3gico \u00B7 noticias reales al aire',svg:ROOM_ICONS.radio},
  hack:{c:'#00FFC8',t:'TERMINAL DE HACKEO',s:'scan \u00B7 trace \u00B7 block \u00B7 decrypt',svg:ROOM_ICONS.code},
  detector:{c:'#FF4655',t:'DETECTOR DE MENTIRAS',s:'VERITAS-9 analiza el feed en vivo',svg:ROOM_ICONS.scale},
  mercado:{c:'#FFD700',t:'MERCADO DE INTELIGENCIA',s:'12 activos \u00B7 tus an\u00E1lisis mueven el precio',svg:ROOM_ICONS.chart},
  negocia:{c:'#7EC8FF',t:'SALA DE NEGOCIACI\u00D3N',s:'guerra \u2194 paz en 90 segundos',svg:ROOM_ICONS.dove},
  album:{c:'#FF9ED2',t:'\u00C1LBUM DEL AGENTE',s:'cartas f\u00EDsicas \u00B7 l\u00E1nzalas a otros agentes',svg:ROOM_ICONS.cards},
  dron:{c:'#9AB0D8',t:'PILOTAJE DE DRON',s:'vista satelital real \u00B7 recoge la intel al 100%',svg:ROOM_ICONS.dron},
  comm:{c:'#FFB347',t:'SALA DE COMUNICACIONES',s:'radio \u00B7 hackeo \u00B7 verdad \u00B7 morse',svg:ROOM_ICONS.dish},
  morse:{c:'#FFE082',t:'CANAL MORSE SECRETO',s:'sincroniza tus toques con la l\u00E1mpara',svg:ROOM_ICONS.morse},
  archivo:{c:'#7CFC00',t:'ARCHIVO CLASIFICADO',s:'im\u00E1genes primero \u00B7 luego la verdad: REAL, MITO o PARCIAL',svg:ROOM_ICONS.reptil}
};
function applyTheme(name){
  const T=ROOM_THEMES[name];
  document.documentElement.style.setProperty('--acc',(T&&T.c)||'#1E90FF');
  $$('.roomHero').forEach(h=>h.remove());
  const def=Rooms[name];
  const sec=def&&def.section?$('#'+def.section):null;
  if(!sec)return;
  if(T&&T.svg){
    sec.style.background='radial-gradient(1100px 460px at 50% -60px,'+T.c+'26,transparent 70%)';
    const h=document.createElement('div');h.className='roomHero holo';
    h.style.borderColor=T.c;h.style.background='linear-gradient(100deg,'+T.c+'2e,transparent 62%)';
    h.innerHTML='<div class="rhIc" style="color:'+T.c+';filter:drop-shadow(0 0 9px '+T.c+')">'+T.svg+'</div>'
      +'<div style="min-width:0"><div class="rhT" style="color:'+T.c+'">'+esc(T.t)+'</div>'
      +(T.s?'<div class="rhS">'+esc(T.s)+'</div>':'')+'</div>';
    sec.prepend(h);
  }else{
    sec.style.background='';
  }
}

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
