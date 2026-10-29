/* ================= MERCADO DE INTELIGENCIA (bolsa en vivo) ================= */
const Mercado=(function(){
  const SEEDS=[
    ['ANLS-RM','Informe: frente del mar Rojo'],['ANLS-UE','An\u00E1lisis energ\u00E9tico europeo'],
    ['ESP-KP','Dossier nuclear de Corea'],['BND-TR','Tr\u00E1nsito del B\u00F3sforo'],
    ['SAT-24','Im\u00E1genes satelitales Ucrania'],['OSI-TW','Patrones del estrecho'],
    ['DIV-OPE','Flujo de divisas sancionadas'],['REF-SUD','Corredor de refugiados'],
    ['CYB-CL','Mapa de ciberataques global'],['AGT-DU','Agente doble: filtraciones'],
    ['PET-OR','Ruta del petr\u00F3leo oromuz'],['AGU-NI','Agua y conflictos del Nilo']
  ];
  let assets,acc=0,worth0;
  function init(){
    assets=SEEDS.map((s,i)=>({sym:s[0],name:s[1],price:rnd(40,220),shares:irnd(30,60),hist:[],mine:0,buy:0,fire:false}));
    assets.forEach(a=>{for(let i=0;i<24;i++)a.hist.push(a.price);});
  }
  function tick(){
    assets.forEach(a=>{
      const drift=rnd(-1,1)*a.price*.03;
      const crowd=Math.random()<.09?rnd(4,9)*a.price*.02:0;
      a.price=Math.max(8,a.price+drift+crowd);
      a.hist.push(a.price);if(a.hist.length>24)a.hist.shift();
      if(Math.random()<.25&&a.shares>0){a.shares--;a.botBought=(a.botBought||0)+1;}
    });
  }
  function row(a,i){
    const ch=a.hist.length>1?((a.price/a.hist[0]-1)*100):0;
    const cls=ch>=0?'up':'dn';
    return '<div class="mktRow '+cls+'" data-i="'+i+'">'
    +'<div><div class="sym">'+a.sym+'</div><div class="nm">'+esc(a.name)+'</div></div>'
    +'<canvas class="spark" width="74" height="26" data-i="'+i+'"></canvas>'
    +'<div class="pr num">'+a.price.toFixed(1)+'</div>'
    +'<div class="ch '+(ch>=0?'upT':'dnT')+'">'+(ch>=0?'+':'')+ch.toFixed(1)+'%</div>'
    +'<div style="text-align:right"><div class="small">'+a.shares+' disp.</div>'
    +(a.mine?'<div class="tag g">tuyas '+a.mine+'</div>':'<button class="btn sm green" data-buy="'+i+'">COMPRAR</button>')
    +(a.mine?'<button class="btn sm red" data-sell="'+i+'" style="margin-top:3px">VENDER</button>':'')
    +'</div></div>';
  }
  function drawSpark(cv,a){
    const g=cv.getContext('2d');g.clearRect(0,0,74,26);
    const mn=Math.min(...a.hist),mx=Math.max(...a.hist),rg=mx-mn||1;
    g.strokeStyle=a.hist[a.hist.length-1]>=a.hist[0]?'#00FF87':'#FF3B30';
    g.lineWidth=1.5;g.beginPath();
    a.hist.forEach((v,i)=>{const x=i/(a.hist.length-1)*72+1,y=24-(v-mn)/rg*22;i?g.lineTo(x,y):g.moveTo(x,y);});
    g.stroke();
  }
  registerRoom('mercado',{section:'scr-mercado',
    enter(){
      Joy.enabled=false;
      if(!assets)init();
      worth0=assets.reduce((s,a)=>s+a.mine*a.price,0);
      const sec=$('#scr-mercado');
      sec.innerHTML='<button class="btn sm back" id="mk">&laquo; HANGAR</button>'
      +'<h2 class="pt">MERCADO DE INTELIGENCIA</h2>'
      +'<p class="small">Especula: compra an\u00E1lisis baratos antes de que otros agentes vac\u00EDen las existencias. Las acciones suben y bajan en vivo.</p>'
      +'<div class="rowline"><span class="stat"> Cartera: <b class="num" id="mktWorth">0</b> '+IC+'</span><span class="tag y" id="mktTick">EN VIVO</span></div>'
      +'<div class="mkt scroll" id="mktList" style="max-height:52vh;margin-top:8px"></div>';
      $('#mk').onclick=()=>go('hangar');
      render();
    },
    exit(){},
    update(dt){
      acc+=dt;
      if(acc>.9){acc=0;tick();
        const list=$('#mktList');
        if(list){
          render();
          const worth=assets.reduce((s,a)=>s+a.mine*a.price,0);
          const el=$('#mktWorth');if(el)el.textContent=fmt(worth);
        }
      }
    }
  });
  function render(){
    const list=$('#mktList');if(!list)return;
    list.innerHTML=assets.map(row).join('');
    $$('.spark',list).forEach(cv=>drawSpark(cv,assets[+cv.dataset.i]));
    $$('[data-buy]',list).forEach(b=>b.onclick=()=>{
      const a=assets[+b.dataset.buy];
      if(a.shares<=0){toast('AGOTADO','\u00A1Otros agentes se llevaron todo! Corre a otro activo.','bad');return;}
      if(P.coins<a.price){toast('SIN FONDOS','Necesitas '+a.price.toFixed(0)+' '+IC,'bad');return;}
      addCoins(-a.price,null);a.mine++;a.shares--;a.buy=a.price;
      SFX.coin(false);save();render();
    });
    $$('[data-sell]',list).forEach(b=>b.onclick=()=>{
      const a=assets[+b.dataset.sell];
      if(!a.mine)return;
      const gain=a.price;
      a.mine--;a.shares++;addCoins(gain,null);
      const ch=gain>=a.buy;
      if(ch){FX.firework(innerWidth-rnd(100,240),rnd(150,300),['255,194,75','255,255,255']);
        toast('PLUSVAL\u00CDA','+'+(gain-a.buy).toFixed(1)+' '+IC+' de ganancia','gold');}
      else toast('VENTA','Saliste con '+(gain-a.buy).toFixed(1)+' '+IC+' de p\u00E9rdida','bad');
      SFX.coin(true);save();render();
    });
  }
})();

/* ================= SALA DE NEGOCIACI\u00D3N DE PAZ ================= */
const Negocia=(function(){
  const DECK=[
    {n:'Ceder territorio',paz:18,rep:-8,tip:'+paz, -reputaci\u00F3n'},
    {n:'Amenaza militar',paz:-14,rep:6,tip:'+t\u00E1ctica, -paz'},
    {n:'Ayuda humanitaria',paz:12,rep:4,tip:'+paz, +rep'},
    {n:'Sanciones econ\u00F3micas',paz:-8,rep:8,tip:'presi\u00F3n'},
    {n:'Cumbre de paz',paz:22,rep:2,tip:'gran impulso'},
    {n:'Espionaje filtrado',paz:-16,rep:10,tip:'arriesgado'},
    {n:'Alto el fuego',paz:15,rep:0,tip:'respiro'},
    {n:'Inspecci\u00F3n ONU',paz:10,rep:6,tip:'transparencia'}
  ];
  let paz,timer,hand,table,atlasCd,over,log;
  function start(){
    paz=(P.recruits.some(r=>r.spec==='DIP')?20:10)+rnd(0,8);
    timer=90;hand=[];table=[];atlasCd=6;over=false;log=[];
    const deck=[...DECK].sort(()=>Math.random()-.5);
    for(let i=0;i<5;i++)hand.push(deck[i]);
  }
  function playCard(c,who){
    table.unshift({c,who});
    paz=clamp(paz+c.paz*(who==='atlas'?(World.tension>70?-1:1):1),0,100);
    if(who==='you'){P.karma+=c.rep>0?1:0;SFX.type();}
    else SFX.shutter();
    log.unshift((who==='you'?'T\u00DA':'ATLAS')+' jug\u00F3: '+c.n+' ('+(c.paz>0?'+':'')+c.paz+' paz)');
    if(log.length>4)log.pop();
    render();
    if(who==='you'){
      const idx=hand.indexOf(c);if(idx>=0)hand.splice(idx,1);
      const d=[...DECK].sort(()=>Math.random()-.5)[0];hand.push(d);
    }
  }
  function finish(){
    over=true;
    if(paz>=80){
      addCoins(200,'negociaci\u00F3n');addXP(120);SFX.win();FX.confetti(70);
      World.bump(-3,'acuerdo de paz alcanzado');
      toast('PAZ ALCANZADA','El conflicto desescala en el mapa real. +200 '+IC,'gold',5200);
      pushFeed('logr\u00F3 un acuerdo de paz frente a ATLAS','g');
    }else{
      SFX.siren();
      World.bump(4,'mesa de paz rota');
      toast('SIN ACUERDO','El reloj lleg\u00F3 a cero: ambos perdi\u00F3... el conflicto escala en el mapa.','bad',5200);
    }
  }
  registerRoom('negocia',{section:'scr-room',
    enter(){
      Joy.enabled=false;start();
      const sec=$('#scr-room');
      sec.innerHTML='<button class="btn sm back" id="nb">&laquo; SALIR</button>'
      +'<h2 class="pt">MESA DE NEGOCIACI\u00D3N</h2>'
      +'<p class="small">T\u00FA vs <b style="color:var(--red)">ATLAS</b>. Arrastra cartas a la mesa. Lleva el medidor a la zona verde antes de que el reloj muera, o el conflicto escala.</p>'
      +'<div style="text-align:center"><canvas id="pazCv" width="320" height="90" style="width:min(92vw,420px)"></canvas>'
      +'<div class="rowline" style="max-width:420px;margin:4px auto"><b class="num" id="pazTimer">90s</b><span class="small">GUERRA \u2190 \u2192 PAZ</span></div></div>'
      +'<div id="handRow" style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-top:8px"></div>'
      +'<div id="negLog" class="panel" style="max-width:420px;margin:10px auto;font-size:12px"></div>';
      $('#nb').onclick=()=>go('hangar');
      render();
    },
    exit(){},
    update(dt){
      if(over)return;
      timer-=dt;
      const te=$('#pazTimer');if(te)te.textContent=Math.max(0,Math.ceil(timer))+'s';
      atlasCd-=dt;
      if(atlasCd<=0){
        atlasCd=rnd(5,8);
        const pool=World.tension>70?DECK.filter(c=>c.paz<0).concat(DECK.filter(c=>c.paz>0).slice(0,1)):DECK.filter(c=>c.paz>0);
        playCard(pick(pool),'atlas');
      }
      if(timer<=0)finish();
      drawMeter();
    }
  });
  function drawMeter(){
    const cv=$('#pazCv');if(!cv)return;
    const g=cv.getContext('2d'),W=cv.width,H=cv.height;
    g.clearRect(0,0,W,H);
    g.fillStyle='#0a0e18';g.fillRect(0,0,W,H);
    g.strokeStyle='rgba(255,255,255,.15)';g.strokeRect(4,4,W-8,H-8);
    const w=W-12;
    const fillW=w*paz/100;
    const grad=g.createLinearGradient(6,0,W-6,0);
    grad.addColorStop(0,'#FF3B30');grad.addColorStop(.5,'#FFC24B');grad.addColorStop(1,'#00FF87');
    g.fillStyle='rgba(10,14,24,.9)';g.fillRect(6,6,w,H-12);
    g.save();g.beginPath();g.rect(6,6,fillW,H-12);g.clip();
    g.fillStyle=grad;g.fillRect(6,6,w,H-12);
    g.fillStyle='rgba(255,255,255,.18)';
    for(let i=0;i<8;i++){
      const y=6+((performance.now()/14+i*37)% (H-12));
      g.fillRect(6,y,w,3);
    }
    g.restore();
    g.strokeStyle='rgba(240,240,240,.9)';g.lineWidth=2;
    g.beginPath();g.moveTo(6+fillW,4);g.lineTo(6+fillW,H-4);g.stroke();
    g.fillStyle='#F0F0F0';g.font='700 14px Rajdhani';g.fillText('PAZ '+Math.round(paz)+'%',10,H/2+5);
  }
  function render(){
    const hr=$('#handRow');if(!hr)return;
    hr.innerHTML=hand.map((c,i)=>'<div class="missionCard" data-c="'+i+'" style="min-height:120px;width:128px;cursor:grab"><div class="mcT">'+esc(c.n)+'</div><div class="mcD">'+(c.paz>0?'+':'')+c.paz+' paz \u00B7 '+c.tip+'</div></div>').join('');
    $$('#handRow .missionCard').forEach(el=>{
      el.addEventListener('pointerdown',e=>{el.setPointerCapture&&el.setPointerCapture(e.pointerId);el._d=true;el.classList.add('flip3d');});
      el.addEventListener('pointerup',e=>{
        if(!el._d)return;el._d=false;
        const c=hand[+el.dataset.c];
        playCard(c,'you');
        if(paz>=80&&!over)finish();
      });
    });
    const lg=$('#negLog');if(lg)lg.innerHTML=log.map(l=>'<div class="feedItem">'+esc(l)+'</div>').join('')||'<div class="small">La mesa est\u00E1 silenciosa...</div>';
  }
})();

/* ================= \u00C1LBUM DE CARTAS F\u00CDCSICAS ================= */
const Album=(function(){
  let pageIdx=0,pages=1;
  function myCards(){return P.cards;}
  function cardHtml(c){
    const col=c.stars>=5?'var(--purple)':c.stars>=3?'var(--gold)':'#8fa3c8';
    return '<div class="holo" style="border:2px solid '+col+';border-radius:12px;aspect-ratio:3/4;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:8px;text-align:center;background:linear-gradient(160deg,#10182c,#0a0e1c)">'
    +'<div class="ttl" style="font-size:11px;color:'+col+'">'+esc(c.name)+'</div>'
    +'<div style="font-size:16px;color:'+col+'">'+ '&#9733;'.repeat(c.stars)+'</div>'
    +'<div class="small">'+esc(c.ed||'')+'</div></div>';
  }
  function openCard(c){
    const col=c.stars>=5?'var(--purple)':c.stars>=3?'var(--gold)':'#8fa3c8';
    openModal(esc(c.name),
      '<div id="holoCard" class="marco" style="position:relative;overflow:hidden;aspect-ratio:3/4;display:flex;flex-direction:column;align-items:center;justify-content:center;background:linear-gradient(160deg,#10182c,#0a0e1c)">'
      +'<div id="holoShine" style="position:absolute;inset:0;background:conic-gradient(from 0deg at 50% 50%,transparent 0deg,rgba(178,107,255,.35) 60deg,transparent 120deg,rgba(0,255,135,.3) 200deg,transparent 260deg);mix-blend-mode:screen"></div>'
      +'<div class="ttl" style="font-size:18px;color:'+col+'">'+esc(c.name)+'</div>'
      +'<div style="font-size:26px;color:'+col+'">'+'&#9733;'.repeat(c.stars)+'</div>'
      +'<div class="small">gira el cursor sobre la carta: efecto hologr\u00E1fico real</div></div>'
      +'<button class="btn sm gold" id="throwBtn" style="width:100%;margin-top:10px">LANZAR A OTRO AGENTE (regalo)</button>'
      +'<div class="small" style="margin-top:6px">Si la atrapan antes de tocar el suelo: regalo exitoso. Si no, se rompe en pedazos.</div>',()=>{
        const hc=$('#holoCard');
        if(hc)hc.onpointermove=e=>{
          const r=hc.getBoundingClientRect();
          const ang=Math.atan2(e.clientY-(r.top+r.height/2),e.clientX-(r.left+r.width/2))*180/Math.PI;
          const sh=$('#holoShine');
          if(sh)sh.style.transform='rotate('+ang+'deg) scale(1.6)';
          hc.style.transform='perspective(700px) rotateY('+((e.clientX-r.left)/r.width-.5)*22+'deg) rotateX('+((e.clientY-r.top)/r.height-.5)*-16+'deg)';
        };
        const tb=$('#throwBtn');
        if(tb)tb.onclick=()=>{closeModal();throwCard(c);};
      });
  }
  function throwCard(c){
    go('hangar');
    setTimeout(()=>{
      const idx=irnd(0,Math.max(0,(DATA.online||2)-2));
      const el=document.createElement('div');
      el.style.cssText='position:fixed;z-index:36;width:70px;height:96px;border:2px solid var(--gold);border-radius:10px;background:linear-gradient(160deg,#10182c,#0a0e1c);display:flex;align-items:center;justify-content:center;font-family:Orbitron;font-size:10px;text-align:center;color:var(--gold);pointer-events:none';
      el.textContent=c.name;
      document.body.appendChild(el);
      const x0=innerWidth/2,y0=innerHeight*.7;
      const tx=innerWidth*rnd(.2,.8),ty=innerHeight*rnd(.25,.5);
      let t=0;
      const iv=setInterval(()=>{
        t+=.022;
        const x=lerp(x0,tx,t),y=lerp(y0,ty,t)-Math.sin(t*Math.PI)*130;
        el.style.transform='translate('+x+'px,'+y+'px) rotate('+t*720+'deg)';
        el.style.left=0;el.style.top=0;
        if(t>=1){
          clearInterval(iv);el.remove();
          if(Math.random()<.6){
            P.karma+=2;addCoins(40,'regalo atrapado');addXP(30);
            toast('REGALO EXITOSO','AGT-'+pick(['NAVAJO','C\u00D3NDOR','KRAKEN','LYNX'])+' atrap\u00F3 tu carta en el aire. Karma +2, +40 '+IC,'gold',5200);
            SFX.bell();pushFeed('lanz\u00F3 una carta y fue atrapada en el aire: regalo exitoso','g');
          }else{
            SFX.shatter();Shake.add(3,200);
            toast('LA CARTA SE ROMPI\u00D3','Nadie la atrap\u00F3: pedazos de cristal en el suelo del hangar...','bad',4200);
            for(let i=0;i<6;i++)FX.sparks(tx,ty,4,'178,107,255');
          }
          P.cards=P.cards.filter(cc=>cc!==c);save();
        }
      },16);
    },600);
  }
  registerRoom('album',{section:'scr-album',
    enter(){
      Joy.enabled=false;
      const sec=$('#scr-album');
      const cards=myCards();
      const PER=8;
      pages=Math.max(1,Math.ceil(cards.length/PER));
      pageIdx=Math.min(pageIdx,pages-1);
      const pageCards=i=>cards.slice(i*PER,i*PER+PER);
      sec.innerHTML='<button class="btn sm back" id="ab">&laquo; HANGAR</button>'
      +'<h2 class="pt">\u00C1LBUM DEL AGENTE</h2>'
      +'<p class="small">'+cards.length+' cartas \u00B7 edici\u00F3n limitada: <b>'+cards.filter(c=>c.stars>=5).length+'</b> de rareza m\u00E1xima \u00B7 pasa p\u00E1ginas deslizando \u00B7 toca una carta para examinarla en 360\u00B0</p>'
      +'<div class="bookWrap"><div class="book" id="book">'
      +'<div class="bpage'+(pageIdx>0?' turned':'')+'" data-pg="0"><div class="bface front bcover" style="display:flex;flex-direction:column;align-items:center;justify-content:center"><div class="ttl" style="font-size:18px;color:var(--blue)">COLECCI\u00D3N<br>CLASIFICADA</div><div class="small" style="margin-top:8px">toca para abrir</div></div></div>'
      +Array.from({length:pages},(_,p)=>'<div class="bpage'+(p<pageIdx?' turned':'')+'" data-pg="'+(p+1)+'"><div class="bface front albumPage"><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding:12px">'
        +(pageCards(p).concat(Array(Math.max(0,PER-pageCards(p).length)).fill(null))).map(c=>c?'<div class="cardSlot" style="border-style:solid;border-color:var(--line)" data-card="'+c.t+'">'+cardHtml(c)+'</div>':'<div class="cardSlot">SLOT<br>VAC\u00CDO</div>').join('')
        +'</div><div class="small" style="text-align:center;padding:6px">p\u00E1gina '+(p+1)+'/'+pages+'</div></div></div>').join('')
      +'</div></div>';
      $('#ab').onclick=()=>go('hangar');
      const book=$('#book');
      let sx=0,turning=false;
      book.addEventListener('pointerdown',e=>{sx=e.clientX;turning=false;});
      book.addEventListener('pointermove',e=>{
        if(Pointer.down&&Math.abs(e.clientX-sx)>40&&!turning){
          turning=true;
          const dir=e.clientX>sx?1:-1;
          const target=dir>0?pageIdx-1:pageIdx+1;
          if(target>=0&&target<=pages){
            pageIdx=clamp(target,0,pages);
            $$('#book .bpage').forEach(pg=>{if(+pg.dataset.pg<=pageIdx)pg.classList.add('turned');else pg.classList.remove('turned');});
            SFX.bounce('papel',3,null);
          }
        }
      });
      $$('#scr-album [data-card]').forEach(sl=>{
        sl.addEventListener('click',()=>{
          const c=cards.find(cc=>''+cc.t===sl.dataset.card);
          if(c)openCard(c);
        });
      });
    },
    exit(){}
  });
})();

/* ================= DRON DE RECONOCIMIENTO ================= */
const Dron=(function(){
  let lat,lng,battery,meter,collected,baseLat,baseLng,doneNoise,acc,missionDone;
  const Z=12;
  const tileCache={};
  function tileFor(tx,ty){
    const key=tx+'_'+ty;
    const c=tileCache[key];
    if(c)return c;
    const img=new Image();
    img.ok=false;
    img.onload=()=>{img.ok=true;};
    img.src='https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/'+Z+'/'+ty+'/'+tx;
    if(Object.keys(tileCache).length>120){for(const k in tileCache)delete tileCache[k];}
    tileCache[key]=img;
    return img;
  }
  function ll2px(lat,lng,z){
    const n=Math.pow(2,z)*256;
    const x=(lng+180)/360*n;
    const s=Math.sin(lat*Math.PI/180);
    const y=(0.5-Math.log((1+s)/(1-s))/(4*Math.PI))*n;
    return{x,y};
  }
  function px2ll(x,y,z){
    const n=Math.pow(2,z)*256;
    const lng=x/n*360-180;
    const yy=y/n*2-1;
    const lat=Math.atan(Math.sinh(Math.PI*yy))*180/Math.PI;
    return{lat,lng};
  }
  function start(zone){
    const zl=zone||{lat:32.08,lng:34.78};
    lat=zl.lat+.05;lng=zl.lng+.05;baseLat=lat;baseLng=lng;
    battery=100;meter=0;collected=0;doneNoise=0;acc=0;missionDone=false;
  }
  registerRoom('dron',{section:'scr-room',
    enter(arg){
      Joy.enabled=true;
      G2.show();
      start(arg&&arg.zone);
      const sec=$('#scr-room');
      sec.innerHTML='<button class="btn sm back" id="drb">&laquo; SALIR</button>'
      +'<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;justify-content:center">'
      +'<span class="tag b">DRON DE RECONOCIMIENTO</span>'
      +'<span class="small">BATER\u00CDA</span><div class="bar" style="width:90px" id="batBar"><i style="width:100%"></i></div>'
      +'<span class="small">INTEL</span><div class="bar" style="width:90px"><i id="misBar" style="width:0%"></i></div>'
      +'<button class="btn sm gold" id="baseBtn">VOLVER A BASE</button></div>';
      $('#drb').onclick=()=>go('globo');
      $('#baseBtn').onclick=()=>{const b=ll2px(baseLat,baseLng,Z);const c=ll2px(lat,lng,Z);
        lat=baseLat;lng=baseLng;toast('AUTOPILOT','De vuelta en base: recargando bater\u00EDa','good');};
      toast('MISI\u00D3N','Atraviesa los marcadores de datos. Vigila la bater\u00EDa: vuelve a la c\u00EDrculo base.','',5200);
      SFX.engineStart();
    },
    exit(){SFX.engineStop();SFX.staticLevel(0);G2.hide();},
    update(dt){
      if(!G2.on)return;
      /* movimiento */
      const spd=(0.004+0.012/1)*dt;
      let ix=0,iz=0;
      if(Key('KeyW')||Key('ArrowUp'))iz-=1;
      if(Key('KeyS')||Key('ArrowDown'))iz+=1;
      if(Key('KeyA')||Key('ArrowLeft'))ix-=1;
      if(Key('KeyD')||Key('ArrowRight'))ix+=1;
      if(Joy.active){ix+=Joy.dx;iz+=Joy.dy;}
      if(Gyro.ok){ix+=clamp(Gyro.gamma/40,-1,1);iz+=clamp((Gyro.beta-45)/40,-1,1);}
      lat=clamp(lat-iz*spd*2.2,-84,84);lng+=ix*spd*2.6;
      if(lng>180)lng-=360;if(lng<-180)lng+=360;
      /* bater\u00EDa */
      battery=Math.max(0,battery-dt*1.15);
      const cpx=ll2px(lat,lng,Z),bpx=ll2px(baseLat,baseLng,Z);
      const atBase=Math.hypot(cpx.x-bpx.x,cpx.y-bpx.y)<60;
      if(atBase)battery=Math.min(100,battery+dt*16);
      if(battery<=0&&!missionDone){
        toast('SIN BATER\u00CDA','El dron volvi\u00F3 a base en modo emergencia. Misi\u00F3n incompleta.','bad');
        go('globo');return;
      }
      /* marcadores */
      const zones=[{lat:32.08,lng:34.78,n:'Oriente Medio'},{lat:44.2,lng:28.6,n:'Mar Negro'},{lat:24.5,lng:120.5,n:'Taiw\u00E1n'}]
        .concat(DATA.quakes.slice(0,4).map(q=>({lat:q.lat,lng:q.lng,n:'sismo M'+q.mag})));
      if(!this._marks||this._marksT<now()){
        this._marks=zones.map(z=>({...z,px:ll2px(z.lat,z.lng,Z),got:false}));
        this._marksT=now()+1500;
      }
      this._marks.forEach(m=>{
        if(m.got)return;
        if(Math.hypot(m.px.x-cpx.x,m.px.y-cpx.y)<26){
          m.got=true;collected++;meter=Math.min(100,meter+14);
          SFX.coin(true);FX.sparks(innerWidth/2+rnd(-60,60),innerHeight/2+rnd(-40,40),8,'0,255,135');
          addXP(6);vibrate(20);
          if(meter>=100&&!missionDone){
            missionDone=true;
            addCoins(200,'reconocimiento');addXP(110);SFX.win();FX.confetti(60);
            toast('RECONOCIMIENTO 100%','+200 '+IC+' \u00B7 inteligencia completa','gold',5200);
            const file={t:now(),n:'Reconocimiento \u00B7 '+this._marks[0].n,txt:'Misi\u00F3n de dron completada al 100% sobre '+this._marks[0].n+'.',kind:'dron'};
            P.files.push(file);save();checkOmega();
          }
        }
      });
      /* est\u00E1tica en zonas calientes */
      const hot=Math.sin(lat*7)+Math.cos(lng*5)>.9?1:0;
      SFX.staticLevel(hot?.4:0);
      doneNoise=hot;
      const bb=$('#batBar i');if(bb){bb.style.width=battery+'%';bb.style.background=battery<25?'var(--red)':'linear-gradient(90deg,var(--blue),var(--green))';}
      const mb=$('#misBar');if(mb)mb.style.width=meter+'%';
      draw(cpx,this._marks||[]);
    }
  });
  function draw(cpx,marks){
    const ctx=G2.ctx,W=G2.w,H=G2.h;
    ctx.fillStyle='#05070c';ctx.fillRect(0,0,W,H);
    const n=Math.pow(2,Z)*256;
    const cx=cpx.x,cy=cpx.y;
    const tX=Math.floor(cx/256),tY=Math.floor(cy/256);
    const ox=cx-tX*256,oy=cy-tY*256;
    const tiles=4;
    for(let dy=-tiles;dy<=tiles;dy++)for(let dx=-tiles;dx<=tiles;dx++){
      const tx=tX+dx,ty=tY+dy;
      if(ty<0||ty>=Math.pow(2,Z))continue;
      const px=W/2+(tx*256-cx),py=H/2+(ty*256-cy);
      if(px<-260||py<-260||px>W+20||py>H+20)continue;
      const img=tileFor(tx,ty);
      if(img&&img.ok)ctx.drawImage(img,px,py,257,257);
      else{ctx.fillStyle='#0d1524';ctx.fillRect(px,py,257,257);}
    }
    /* base */
    const bpx=ll2px(baseLat,baseLng,Z);
    const bx=W/2+(bpx.x-cx),by=H/2+(bpx.y-cy);
    ctx.strokeStyle='rgba(0,255,135,.9)';ctx.lineWidth=2;
    ctx.beginPath();ctx.arc(bx,by,24,0,7);ctx.stroke();
    ctx.fillStyle='rgba(0,255,135,.15)';ctx.fill();
    ctx.fillStyle='#00FF87';ctx.font='10px Rajdhani';ctx.fillText('BASE',bx-12,by-28);
    /* marcadores */
    marks.forEach(m=>{
      const x=W/2+(m.px.x-cx),y=H/2+(m.px.y-cy);
      if(x<-30||y<-30||x>W+30||y>H+30)return;
      if(m.got){ctx.fillStyle='rgba(0,255,135,.35)';ctx.beginPath();ctx.arc(x,y,6,0,7);ctx.fill();return;}
      const bob=Math.sin(performance.now()/300+m.px.x)*4;
      ctx.save();ctx.translate(x,y+bob);ctx.rotate(Math.PI/4);
      ctx.fillStyle='rgba(30,144,255,.9)';ctx.fillRect(-7,-7,14,14);
      ctx.strokeStyle='#F0F0F0';ctx.strokeRect(-7,-7,14,14);
      ctx.restore();
      ctx.fillStyle='rgba(240,240,240,.85)';ctx.font='9px Rajdhani';
      ctx.fillText(m.n,x+10,y-6);
    });
    /* HUD dron: ret\u00EDcula + bater\u00EDa + coords */
    ctx.strokeStyle='rgba(240,240,240,.35)';
    ctx.beginPath();ctx.moveTo(W/2-24,H/2);ctx.lineTo(W/2-8,H/2);ctx.moveTo(W/2+8,H/2);ctx.lineTo(W/2+24,H/2);
    ctx.moveTo(W/2,H/2-24);ctx.lineTo(W/2,H/2-8);ctx.moveTo(W/2,H/2+8);ctx.lineTo(W/2,H/2+24);ctx.stroke();
    ctx.font='12px JetBrains Mono';ctx.fillStyle='rgba(0,255,135,.85)';
    ctx.fillText(lat.toFixed(3)+' '+lng.toFixed(3)+' \u00B7 INTEL '+collected+' \u00B7 BAT '+Math.round(battery)+'%',10,16);
    if(doneNoise){
      for(let i=0;i<40;i++){
        ctx.fillStyle='rgba(255,255,255,'+rnd(.02,.09)+')';
        ctx.fillRect(rnd(0,W),rnd(0,H),rnd(1,3),rnd(1,3));
      }
      ctx.fillStyle='rgba(255,59,48,.7)';ctx.font='11px Orbitron';
      ctx.fillText('SE\u00D1AL DEGRADADA \u00B7 ZONA DE ALTA TENSI\u00D3N',W/2-130,32);
    }
  }
})();

/* ================= RECLUTAMIENTO DE AGENTES ================= */
const Recruit=(function(){
  const QS=[
    {q:'Te asignan un presupuesto limitado. \u00BFQu\u00E9 priorizas?',eco:'Rentabilidad de cada operaci\u00F3n',mil:'Capacidad de respuesta inmediata',dip:'Canales de di\u00E1logo abiertos'},
    {q:'Un activo env\u00EDa se\u00F1ales contradictorias.',eco:'Cu\u00E1nto cuesta verificarlo',mil:'Si hay riesgo de emboscada',dip:'Qui\u00E9n puede mediar'},
    {q:'Tu victoria ideal ser\u00EDa...',eco:'Un mercado que se estabiliza',mil:'Una frontera que se sostiene',dip:'Un tratado que se firma'}
  ];
  let spec,score,qi;
  function interview(sp){
    spec=sp;score=0;qi=0;
    ask();
  }
  function ask(){
    const q=QS[qi];
    openModal('ENTREVISTA \u00B7 '+spec.name.toUpperCase()+' ('+spec.spec+')',
      '<div class="small">Especialidad declarada: <b>'+spec.d+'</b>. Pregunta '+(qi+1)+'/3:</div>'
      +'<div style="font-size:14px;margin:10px 0">'+q.q+'</div>'
      +'<div class="qOpt" data-s="eco">'+q.eco+'</div>'
      +'<div class="qOpt" data-s="mil">'+q.mil+'</div>'
      +'<div class="qOpt" data-s="dip">'+q.dip+'</div>');
    $$('#modalBody .qOpt').forEach(o=>o.onclick=()=>{
      if(o.dataset.s===spec.spec.toLowerCase()||(spec.spec==='MIL'&&o.dataset.s==='mil'))score++;
      SFX.uiTap();
      qi++;
      if(qi<QS.length)ask();
      else decide();
    });
  }
  function decide(){
    const ok=score>=2;
    if(ok){
      P.recruits.push({spec:spec.spec,name:spec.name});
      Hangar.syncCompanion();
      addCoins(0,'recluta');addXP(60);
      toast('AGENTE RECLUTADO',spec.name+' se une a tu equipo (bonus pasivo '+(spec.spec==='ECO'?'+5% monedas':spec.spec==='MIL'?'+3% mesa t\u00E1ctica':'+5 paz inicial')+')','gold',5200);
      SFX.fanfare();FX.confetti(40);
      pushFeed('reclut\u00F3 a '+spec.name+' para su equipo de inteligencia','g');
      if(spec.spec==='MIL')window.__vg_milBonus=3;
    }else{
      toast('NO CONVENCE','El candidato se levanta de la banca. Quiz\u00E1 el pr\u00F3ximo.','bad');
      SFX.fail();
    }
    closeModal();save();
  }
  return{interview};
})();
