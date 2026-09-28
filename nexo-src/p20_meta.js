/* ================= HUB COMUNICACIONES ================= */
(function(){
  registerRoom('comm',{section:'scr-comm',enter(){
    Joy.enabled=false;
    const sec=$('#scr-comm');
    sec.innerHTML='<button class="btn sm back" id="cb3">&laquo; HANGAR</button>'
    +'<h2 class="pt">SALA DE COMUNICACIONES</h2>'
    +'<p class="small">Tres estaciones y una se\u00F1al oculta. El morse aparece a veces en el ticker.</p>'
    +'<div class="navGrid">'
    +'<div class="navCell" data-go="radio"><div class="ic">&#9742;</div><div class="nm">RADIO GEOPOL\u00CDTICA</div><div class="ds">diales, est\u00E1tica y noticias reales</div></div>'
    +'<div class="navCell hot" data-go="hack"><div class="ic">&#9099;</div><div class="nm">TERMINAL DE HACKEO</div><div class="ds">scan \u00B7 trace \u00B7 block \u00B7 decrypt</div></div>'
    +'<div class="navCell" data-go="detector"><div class="ic">&#9878;</div><div class="nm">DETECTOR DE MENTIRAS</div><div class="ds">VERITAS-9 analiza el feed</div></div>'
    +'<div class="navCell" data-go="morse"><div class="ic">&#8942;&#8942;&#8942;</div><div class="nm">CANAL MORSE</div><div class="ds">sincroniza tus toques con la luz</div></div>'
    +'<div class="navCell" data-go="archivo" style="border-color:#7CFC00"><div class="ic" style="color:#7CFC00">&#9788;</div><div class="nm">ARCHIVO CLASIFICADO</div><div class="ds">imágenes primero: mitos y documentos reales</div></div>'
    +'<a class="navCell" href="/clasico" style="text-decoration:none;color:inherit;display:block"><div class="ic">&#9635;</div><div class="nm">VANGUARD CLÁSICO v67</div><div class="ds">el hangar original de la presentación 10/10</div></a>'
    +'</div>';
    $('#cb3').onclick=()=>go('hangar');
    $$('#scr-comm .navCell').forEach(c=>c.onclick=()=>go(c.dataset.go));
  },exit(){}});
})();

/* ================= CANAL MORSE ================= */
(function(){
  const M={A:'.-',B:'-...',C:'-.-.',D:'-..',E:'.',F:'..-.',G:'--.',H:'....',I:'..',J:'.---',K:'-.-',L:'.-..',M:'--',N:'-.',O:'---',P:'.--.',Q:'--.-',R:'.-.',S:'...',T:'-',U:'..-',V:'...-',W:'.--',X:'-..-',Y:'-.--',Z:'--..'};
  const WORDS=['ORO','RADIO','AYUDA','NORTE','LLAVE'];
  const DIT=200,DAH=DIT*3,GAP=DIT,GAPL=DIT*3;
  let seq=[],onTotal,lightOn=false,seqT=0,seqI=0,taps=[],hits=0,misses=0,running=false,word='';
  function buildSeq(){
    word=pick(WORDS);
    seq=[];onTotal=0;
    word.split('').forEach((ch,li)=>{
      const code=M[ch];
      code.split('').forEach((s,i)=>{
        const dur=s==='.'?DIT:DAH;
        seq.push({on:true,dur});onTotal++;
        if(i<code.length-1)seq.push({on:false,dur:GAP});
      });
      if(li<word.length-1)seq.push({on:false,dur:GAPL});
    });
  }
  function startMorse(){
    buildSeq();seqI=0;taps=[];hits=0;misses=0;running=true;seqT=0;lightOn=false;
    renderMorse();
  }
  registerRoom('morse',{section:'scr-room',
    enter(){
      Joy.enabled=false;startMorse();
      const sec=$('#scr-room');
      sec.innerHTML='<button class="btn sm back" id="mrb">&laquo; SALIR</button>'
      +'<h2 class="pt">CANAL MORSE SECRETO</h2>'
      +'<p class="small">La luz parpadea un mensaje codificado. Toca la pantalla (o SPACE) SOLO cuando la luz est\u00E9 ENCENDIDA y en el ritmo correcto. 3 mensajes descifrados abren un camino secreto.</p>'
      +'<div id="morseLamp" style="width:90px;height:90px;border-radius:50%;margin:14px auto;background:#241a10;border:2px solid var(--line);box-shadow:none;transition:background .05s"></div>'
      +'<div style="text-align:center"><div class="mono" style="font-size:18px" id="morseTaps">0/'+onTotal+' pulsos</div>'
      +'<div class="small" id="morseHint">escuchando...</div>'
      +'<button class="btn big blue" id="tapBtn" style="margin-top:14px;width:min(80vw,300px)">TOCAR (ritmo)</button>'
      +'<div class="small" style="margin-top:10px">Descifrados: <b>'+P.morseHits+'/3</b></div></div>';
      $('#mrb').onclick=()=>go('comm');
      const tap=()=>{
        if(!running)return;
        taps.push(1);
        if(lightOn){hits++;SFX.morse(.09);FX.sparks(Pointer.x||innerWidth/2,Pointer.y||innerHeight/2,4,'0,255,135');}
        else{misses++;SFX.uiTap();}
        $('#morseTaps').textContent=taps.length+'/'+onTotal+' pulsos';
        if(taps.length>=onTotal)judge();
      };
      $('#tapBtn').onclick=tap;
    },
    exit(){running=false;},
    onKey(e){if(e.code==='Space'){e.preventDefault();const b=$('#tapBtn');if(b)b.click();}},
    update(dt){
      if(!running)return;
      seqT+=dt*1000;
      const cur=seq[seqI];
      if(cur){
        if(!cur._started){cur._started=true;lightOn=cur.on;
          const lamp=$('#morseLamp');
          if(lamp){lamp.style.background=cur.on?'#FFC24B':'#241a10';lamp.style.boxShadow=cur.on?'0 0 34px rgba(255,194,75,.9)':'none';}
          if(cur.on)SFX.morse(cur.dur/1000*.9);
        }
        if(seqT>=cur.dur){seqT=0;cur._started=false;seqI++;
          if(seqI>=seq.length)setTimeout(judge,600);
        }
      }
    }
  });
  function judge(){
    if(!running)return;
    running=false;
    const perfect=misses<=1&&hits>=onTotal-1;
    if(perfect){
      P.morseHits++;save();
      const intel={t:now(),n:'Mensaje morse \u00B7 "'+word+'"',txt:'Se\u00F1al interceptada y descifrada: '+word+'. Coordenadas parciales: '+irnd(10,70)+'\u00B0N '+irnd(10,60)+'\u00B0E.',kind:'morse'};
      P.files.push(intel);save();checkOmega();
      addCoins(80,'morse');addXP(50);
      SFX.win();
      openModal('MENSAJE DESCIFRADO','<div class="mono" style="font-size:22px;color:var(--green)" id="morseReveal"></div><p class="small" style="margin-top:8px">Inteligencia exclusiva archivada. Nadie m\u00E1s tiene este dato. ('+P.morseHits+'/3)</p>');
      typeText($('#morseReveal'),word,16);
      if(P.morseHits>=3){P.knownIsland=true;save();
        toast('SECRETO','Las 3 se\u00F1ales apuntan al norte del hangar...','gold',6000);}
    }else{
      toast('RITMO FALLIDO',''+hits+' aciertos de '+onTotal+' \u00B7 '+misses+' toques fuera de luz. Sincroniza con la l\u00E1mpara.','bad',4200);
      SFX.fail();
      setTimeout(startMorse,1600);
      return;
    }
  }
  function renderMorse(){}
})();

/* ================= GRAN LOOP DE DOPAMINA ================= */
const NEMESIS_NAMES=['AGT-KRAKEN','AGT-V\u00D3RTICE','AGT-SIERRA','AGT-LYNX','AGT-C\u00D3NDOR'];
function nemesisName(){return NEMESIS_NAMES[(P.code||'VG').length%NEMESIS_NAMES.length];}
function nemesisScore(){
  const base=Math.max(80,P.totalEarned*0.92+P.missionDone*30);
  const drift=Math.sin(now()/60000)*base*.06;
  return Math.round(base+drift);
}
function todayKey(){const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();}
function yesterdayKey(){const d=new Date(now()-86400000);return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();}
function checkEnvelope(){
  const ready=P.lastEnvelopeDay!==todayKey();
  $('#envelopeChip').style.display=ready?'inline-flex':'none';
  return ready;
}
function claimEnvelope(){
  if(!checkEnvelope())return;
  const wasYesterday=P.lastEnvelopeDay===yesterdayKey();
  P.streak=wasYesterday?P.streak+1:1;
  P.lastEnvelopeDay=todayKey();
  const roll=Math.random();
  let msg='';
  if(roll<.55){const c=irnd(30,90);addCoins(c,'sobre diario');msg='+'+c+' '+IC;}
  else if(roll<.8){const c=irnd(90,220);addCoins(c,'sobre diario');msg='+'+c+' '+IC+' (raro)';}
  else if(roll<.95){const c=irnd(220,500);addCoins(c,'sobre diario');msg='+'+c+' '+IC+' (epico)';}
  else{
    const card={id:'c'+now(),name:pick(['FANTASMA DEL B\u00D3SFORO','SE\u00D1AL 404','LA MANO INVISIBLE','NOCTURNO 7']),stars:pick([3,5]),ed:'EDICI\u00D3N LIMITADA',t:now()};
    P.cards.push(card);msg='CARTA '+card.stars+'\u2605: '+card.name;
  }
  addXP(30);
  SFX.fanfare();FX.confetti(50);
  toast('SOBRE CLASIFICADO','Racha '+P.streak+' d\u00EDas \u00B7 '+msg,'gold',5200);
  pushFeed('abri\u00F3 su sobre clasificado: '+msg,'y');
  checkEnvelope();refreshHUD();save();
  if(P.streak===7){addCoins(150,'racha de 7');toast('RACHA DE FUEGO','7 d\u00EDas seguidos: +150 '+IC+' extra','gold');}
  const missTomorrow='Si ma\u00F1ana no abres tu sobre, tu racha de '+P.streak+' d\u00EDas muere.';
  setTimeout(()=>toast('AVISO DE P\u00C9RDIDA',missTomorrow,'bad',5000),2600);
}
function welcomeBack(){
  const away=now()-P.lastSeen;
  if(away>48*3600000){
    addCoins(100,'regreso');
    toast('TE EXTRA\u00D1AMOS','48h fuera: '+nemesisName()+' aprovech\u00F3. Regalo de retorno: +100 '+IC,'gold',6000);
    pushFeed('volvi\u00F3 al cuartel tras 48h de silencio','y');
  }else if(away>24*3600000){
    toast('BIENVENIDO DE VUELTA','Tu sobre diario te espera. '+nemesisName()+' suma puntos mientras tanto.','',5000);
  }
}
/* rival chip */
function refreshRival(){
  const chip=$('#chipRival');
  if(P.totalEarned<40){chip.style.display='none';return;}
  chip.style.display='inline-flex';
  $('#rivalName').textContent=nemesisName();
  $('#rivalScore').textContent=fmt(nemesisScore());
  $('#rivalYou').textContent=fmt(P.totalEarned);
}
setInterval(()=>{
  if(nemesisScore()<P.totalEarned&&!P._beatNemesis){
    P._beatNemesis=true;
    toast('N\u00C9MESIS SUPERADO',nemesisName()+' ya no te alcanza. \u00A1Sigue as\u00ED!','good',5000);
    addXP(40);
  }
  refreshRival();
},30000);

/* leaderboard */
function showLeaderboard(){
  const me={n:'T\u00DA ('+(P.code||'agente')+')',s:P.totalEarned,me:true};
  const nem={n:nemesisName()+' (n\u00E9mesis)',s:nemesisScore(),nem:true};
  const bots=AGENT_NAMES.slice(0,7).map((n,i)=>({n,s:Math.round(nemesisScore()*(1.35-i*.13))}));
  const rows=[me,nem,...bots].sort((a,b)=>b.s-a.s);
  openModal('RANKING SEMANAL',rows.map((r,i)=>'<div class="lbRow '+(r.me?'me':'')+'"><span class="pos">'+(i+1)+'</span><span style="flex:1">'+esc(r.n)+'</span><b class="num">'+fmt(r.s)+'</b></div>').join('')
  +'<div class="sep"></div><div class="small">Wall of Fame cada lunes \u00B7 el top 10 gana +500 '+IC+'</div>');
}

/* skills */
function showSkills(){
  const BR=[['analista','ANALISTA MILITAR'],['sanciones','SANCIONES'],['regional','REGIONAL'],['espionaje','ESPIONAJE']];
  const cost=[250,600];
  const html=BR.map(b=>{
    const lvl=P.skills[b[0]]||0;
    return '<div class="rowline"><div><div style="font-size:12px">'+b[1]+'</div><div class="small">nivel '+lvl+'/2 \u00B7 +5% ganancia global por nivel</div></div>'
    +(lvl<2?'<button class="btn sm gold" data-sk="'+b[0]+'">'+cost[lvl]+' '+IC+'</button>':'<span class="tag g">MAX</span>')+'</div>';
  }).join('');
  openModal('\u00C1RBOL DE HABILIDADES',html+'<div class="sep"></div><div class="small">Los bonus se aplican a TODA moneda que ganes, para siempre.</div>');
  $$('[data-sk]').forEach(btn=>btn.onclick=()=>{
    const br=btn.dataset.sk,lvl=P.skills[br]||0;
    const c=cost[lvl];
    if(P.coins<c){toast('SIN FONDOS','Necesitas '+c+' '+IC,'bad');return;}
    addCoins(-c,null);P.skills[br]=lvl+1;save();
    SFX.bell();toast('HABILIDAD','+'+br+' nivel '+(lvl+1)+': ganancia global '+(1+ (lvl+1)*.05).toFixed(2)+'x','good');
    showSkills();
  });
}

/* men\u00FA principal */
function showMenu(){
  const rooms=[
    ['hangar','HANGAR','centro de operaciones'],
    ['globo','SALA DE MAPAS','globo vivo: llamas, aviones, sismos'],
    ['misiones','MISIONES','dossiers con noticias reales'],
    ['archivo','ARCHIVO CLASIFICADO','mitos y documentos: im\u00E1genes primero'],
    ['biblio','BIBLIOTECA SECRETA','excava documentos hist\u00F3ricos'],
    ['sim','SIMULADOR','5 entrenamientos de combate'],
    ['comm','COMUNICACIONES','radio \u00B7 hackeo \u00B7 verdad \u00B7 morse'],
    ['mercado','MERCADO','bolsa de inteligencia'],
    ['album','\u00C1LBUM','tu colecci\u00F3n de cartas']
  ];
  const proto=protocoloActive();
  openModal('CENTRO DE MANDO \u00B7 v69 FUSI\u00D3N TOTAL',
   '<div class="navGrid">'
   +rooms.map(r=>'<div class="navCell" data-nav="'+r[0]+'"><div class="nm">'+r[1]+'</div><div class="ds">'+r[2]+'</div></div>').join('')
   +'</div><div class="sep"></div>'
   +'<div class="rowline"><span class="small">\u00C1rbol de habilidades</span><button class="btn sm" id="mSkills">ABRIR</button></div>'
   +'<div class="rowline"><span class="small">Ranking semanal</span><button class="btn sm" id="mRank">ABRIR</button></div>'
   +'<div class="rowline"><span class="small">Protocolo Rojo (x2 '+IC+' 6h)</span><button class="btn sm red" id="mProto">'+(proto?('ACTIVO '+Math.round((protocoloUntil-now())/60000)+'min'):'ACTIVAR (500 '+IC+')')+'</button></div>'
   +'<div class="rowline"><span class="small">VANGUARD cl\u00E1sico (v67)</span><a class="btn sm" href="/clasico" style="text-decoration:none">ABRIR</a></div>'
   +'<div class="sep"></div><div class="small">Agente Fundador #'+(P.foundersN||'\u2014')+' \u00B7 '+P.files.length+' archivos \u00B7 '+P.cards.length+' cartas \u00B7 '+P.recruits.length+' reclutas</div>');
  $$('[data-nav]').forEach(c=>c.onclick=()=>{closeModal();go(c.dataset.nav);});
  $('#mSkills').onclick=showSkills;
  $('#mRank').onclick=showLeaderboard;
  $('#mProto').onclick=()=>{
    if(protocoloActive())return;
    if(P.coins<500){toast('SIN FONDOS','El protocolo cuesta 500 '+IC,'bad');return;}
    addCoins(-500,null);
    window.__VG_setProto?window.__VG_setProto(now()+6*3600000):localStorage.setItem('vg_protocolo',''+(now()+6*3600000));
    protocoloUntil=now()+6*3600000;
    toast('PROTOCOLO ROJO','x2 '+IC+' durante 6 horas. El mundo late m\u00E1s fuerte.','gold',5200);
    SFX.siren();closeModal();
  };
}
window.__VG_setProto=function(v){protocoloUntil=v;};

/* HUD wiring */
$('#chipMenu').addEventListener('click',showMenu);
$('#chipBrand').addEventListener('click',showMenu);
$('#envelopeChip').addEventListener('click',claimEnvelope);
$('#chipRival').addEventListener('click',showLeaderboard);
$('#chipRacha').addEventListener('click',()=>{
  openModal('RACHA DIARIA','<div class="big-num" style="color:var(--gold)">'+P.streak+' d\u00EDas</div>'
  +'<p class="small" style="margin-top:8px">Abre tu sobre clasificado cada d\u00EDa. A los 7 d\u00EDas: bonus de +150 '+IC+'. Si fallas un d\u00EDa, la racha arde y desaparece.</p>'
  +(checkEnvelope()?'<button class="btn gold" id="rClaim" style="margin-top:10px;width:100%">ABRIR SOBRE DE HOY</button>':'<div class="small" style="margin-top:8px">Sobre de hoy: ya reclamado. Vuelve ma\u00F1ana.</div>'));
  const b=$('#rClaim');if(b)b.onclick=()=>{closeModal();claimEnvelope();};
});
$('#chipPresence').addEventListener('click',showLeaderboard);
$('#stationBar').addEventListener('click',e=>{
  const act=e.target.dataset&&e.target.dataset.act;
  if(act==='hack')go('hack');
  else if(act==='detector')go('detector');
  else if(act==='interview'&&HangarNearBench())HangarInterview();
});
function HangarNearBench(){return true;}
function HangarInterview(){
  /* el bench activo lo resuelve el hangar: busca el m\u00E1s cercano en el bar */
  const txt=$('#stationBar').textContent;
  const sp=['ECO','MIL','DIP'].find(s=>txt.includes(s));
  const map={ECO:{spec:'ECO',name:'R. Vasquez',d:'economista'},MIL:{spec:'MIL',name:'T. Okoye',d:'militar'},DIP:{spec:'DIP',name:'L. Fontaine',d:'diplom\u00E1tica'}};
  if(sp)Recruit.interview(map[sp]);
}

/* ticker animado */
let tickerX=0;
(function(){
  const el=$('#tickerIn');
  Loop.add(dt=>{
    if(!el.textContent)return;
    tickerX-=65*dt;
    const w=el.scrollWidth||2000;
    if(tickerX< -w)tickerX=innerWidth;
    el.style.transform='translateX('+tickerX+'px)';
  });
  $('#ticker').addEventListener('click',()=>go('morse'));
})();
setInterval(randomFeedEvent,22000);

/* ================= ONBOARDING ================= */
const CODE_PRE=['CUERVO','HALC\u00D3N','SOMBRA','AZAHAR','TANGO','LUNA','\u00C1SPID','BRUMA','CENTINELA','FARO','VIUDA','C\u00D3NDOR'];
function genCodename(){return pick(CODE_PRE)+'-'+irnd(10,99);}
registerRoom('onboarding',{section:'scr-ono',
  enter(){
    const sec=$('#scr-ono');
    sec.innerHTML=
    '<div style="text-align:center"><h2 class="pt" style="font-size:20px">NUEVO AGENTE DETECTADO</h2>'
    +'<p class="small">Sin registro. Sin muros. Solo tu nombre en clave.</p></div>'
    +'<div class="panel" style="max-width:420px;margin:0 auto;width:100%">'
    +'<h3 class="ps">NOMBRE EN CLAVE (generador CIA)</h3>'
    +'<div style="display:flex;gap:8px"><input type="text" id="onoCode" value="'+genCodename()+'" style="flex:1"><button class="btn sm" id="onoGen">DADO</button></div>'
    +'<h3 class="ps">AGENTE</h3>'
    +'<div class="sw" id="onoG">'
    +'<div class="swSel" data-g="m">OPERATIVO M</div><div class="swOpt" data-g="f">OPERATIVA F</div><div class="swOpt" data-g="x">NO BINARIO</div></div>'
    +'<h3 class="ps">UNIFORME</h3><div class="sw" id="onoS">'
    +[0,1,2,3,4].map(i=>'<div class="'+(i===0?'swSel':'swOpt')+'" data-s="'+i+'"><span style="display:inline-block;width:14px;height:14px;border-radius:3px;background:'+['#2a3a5f','#3a2a2f','#24402f','#33334a','#101820'][i]+'"></span></div>').join('')+'</div>'
    +'<h3 class="ps">PIEL / PELO</h3><div class="sw" id="onoK">'
    +[0,1,2].map(i=>'<div class="'+(i===2?'swSel':'swOpt')+'" data-k="'+i+'">TONO '+(i+1)+'</div>').join('')+'</div>'
    +'<div class="sep"></div>'
    +'<div class="small">Al aceptar recibes: <b style="color:var(--gold)">+500 '+IC+'</b> \u00B7 una carta rara \u00B7 insignia <b>AGENTE FUNDADOR</b> (solo los primeros 1000) \u00B7 acceso 24h a la Biblioteca.</div>'
    +'<button class="btn big green" id="onoGo" style="width:100%;margin-top:12px">ACEPTAR MISION</button></div>';
    $('#onoGen').onclick=()=>{$('#onoCode').value=genCodename();SFX.uiTap();};
    const wire=(id,attr)=>{$$(id+' [data-'+attr+']').forEach(o=>o.onclick=()=>{
      $$(id+' [data-'+attr+']').forEach(x=>{x.classList.remove('swSel');x.classList.add('swOpt');});
      o.classList.remove('swOpt');o.classList.add('swSel');SFX.uiTap();
    });};
    wire('#onoG','g');wire('#onoS','s');wire('#onoK','k');
    $('#onoGo').onclick=()=>{
      P.code=($('#onoCode').value||genCodename()).toUpperCase().slice(0,18);
      P.gender=(($('#onoG .swSel')||{}).dataset||{}).g||'m';
      P.suit=+((($('#onoS .swSel')||{}).dataset||{}).s||0);
      P.skin=+((($('#onoK .swSel')||{}).dataset||{}).k||2);
      P.foundersN=Math.min(1000,irnd(64,238)+P.missionDone);
      P.coins+=500;
      P.cards.push({id:'c'+now(),name:'AGT '+P.code+' ORIGEN',stars:3,ed:'FUNDADORA',t:now()});
      save();
      SFX.fanfare();FX.confetti(70);
      go('hangar');
      Hangar.rewardRain(8,10);
      openModal('BIENVENIDO, '+P.code,
       '<div class="tag y">AGENTE FUNDADOR #'+P.foundersN+'</div>'
       +'<p class="small" style="margin-top:10px">Esto es <b>CONTROL DIRECTO</b>: todo se toca, se agarra, se lanza.</p>'
       +'<div class="small" style="margin-top:8px">'
       +(IS_MOBILE?'\u2022 <b>Joystick flotante</b>: toca y arrastra para caminar.<br>\u2022 <b>Toque largo</b> sobre un objeto: ag\u00E1rralo. Mu\u00E9velo r\u00E1pido y su\u00E9ltalo: lo lanzas.<br>\u2022 Camina sobre las monedas para recogerlas.<br>\u2022 Las puertas hologr\u00E1ficas del norte llevan a las salas.'
       :'\u2022 <b>WASD</b> camina, <b>SHIFT</b> corre.<br>\u2022 <b>Clic sostenido</b> sobre un objeto: ag\u00E1rralo; suelta en movimiento: lo lanzas.<br>\u2022 <b>E</b> entra por la puerta cercana.<br>\u2022 Camina sobre las monedas para recogerlas.')
       +'</div>'
       +'<div class="sep"></div><div class="small">Tu rival '+nemesisName()+' ya empez\u00F3. No dejes que respire.</div>');
    };
  },exit(){}
});

/* ================= INTRO UI + BOOT ================= */
introUIStart=function(){
  const t=$('#introTitle');
  t.innerHTML='VANGUARD'.split('').map((ch,i)=>'<span class="glitchLetter '+(i%3===0?'b':i%5===0?'r':'')+'" style="animation-delay:'+(i*.12)+'s">'+ch+'</span>').join('');
  const lines=['CONECTANDO A LA RED VANGUARD...','DESCARGANDO DATOS OSINT EN VIVO...','CALIBRANDO CONTROL DIRECTO...','AGENTE: EN EL SISTEMA'];
  const sub=$('#introSub');
  sub.style.opacity=1;
  lines.forEach((l,i)=>setTimeout(()=>{sub.textContent=l;},700+i*1800));
  setTimeout(()=>{sub.style.color='var(--green)';},7000);
};
finishIntro=function(){
  if(finishIntro._fired)return;finishIntro._fired=true;
  Flash.white(.7,160);
  if(!P.code)go('onboarding');
  else{go('hangar');welcomeBack();}
};

/* arranque */
(function boot(){
  $('#verTag').textContent='v69';
  $('#introSkip').addEventListener('click',finishIntro);
  $('#modalX').addEventListener('click',closeModal);
  $('#modalWrap').addEventListener('pointerdown',e=>{if(e.target.id==='modalWrap')closeModal();});
  refreshHUD();checkEnvelope();refreshRival();
  go('intro');
  loadNews();loadQuakes();loadPulso();loadCountries();loadPresence();
  setInterval(loadPulso,45000);
  setInterval(loadQuakes,120000);
  setInterval(loadNews,90000);
  setInterval(()=>{presenceBeat();},30000);
  buildTicker();
  Loop.add(()=>{
    if(roomName()==='hangar')P.lastSeen=now();
  });
  setInterval(save,25000);
  setTimeout(()=>{if(roomName()==='intro')finishIntro();},12500);
})();
