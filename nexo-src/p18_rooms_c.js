/* ---------- QUIZ OSINT (OpenTrivia) ---------- */
(function(){
  function ent(s){const t=document.createElement('textarea');t.innerHTML=s;return t.value;}
  registerRoom('quiz',{section:'scr-room',
    async enter(){
      Joy.enabled=false;
      const sec=$('#scr-room');
      sec.innerHTML='<button class="btn sm back" id="qb">&laquo; SALIR</button><h2 class="pt">QUIZ OSINT</h2><p class="small">5 preguntas de la base abierta OpenTrivia (en ingl\u00E9s, fuente internacional). 30 '+IC+' por acierto.</p><div id="qz" class="panel"><div class="small">Descargando preguntas...</div></div>';
      $('#qb').onclick=()=>go('sim');
      const j=await jget('https://opentdb.com/api.php?amount=5&type=multiple',9000);
      const box=$('#qz');
      if(!j||!j.results||!j.results.length){box.innerHTML='<div class="small">OpenTrivia no responde. Reintenta.</div>';return;}
      let i=0,ok=0;
      const qs=j.results;
      function show(){
        if(i>=5){
          const prize=ok*30;
          if(ok>=3){addCoins(prize+40,'quiz');addXP(ok*15);SFX.win();FX.confetti(40);}
          else if(ok===2){toast('CASI LO LOGRAS','Una pregunta m\u00E1s y llevabas el bonus completo. +'+(ok*30)+' '+IC+' igualmente.','bad',4200);addCoins(ok*30,'quiz');}
          else addCoins(ok*30,'quiz');
          box.innerHTML='<div class="big-num">'+ok+'/5</div><div class="small">Aciertos. Premio: '+(ok*30+(ok>=3?40:0))+' '+IC+'</div><button class="btn sm" id="again">OTRA RONDA</button>';
          $('#again').onclick=()=>go('quiz');
          return;
        }
        const q=qs[i];
        const opts=[...q.incorrect_answers.map(ent),ent(q.correct_answer)].sort(()=>Math.random()-.5);
        box.innerHTML='<div class="tag b">PREGUNTA '+(i+1)+'/5 \u00B7 '+esc(q.category)+' \u00B7 EN</div>'
        +'<div style="font-size:14px;margin:10px 0">'+ent(q.question)+'</div>'
        +opts.map(o=>'<div class="qOpt" data-ok="'+(o===ent(q.correct_answer)?1:0)+'">'+esc(o)+'</div>').join('');
        $$('#qz .qOpt').forEach(o=>o.onclick=()=>{
          $$('#qz .qOpt').forEach(x=>{x.style.pointerEvents='none';});
          if(o.dataset.ok==='1'){o.classList.add('ok');ok++;SFX.bell();}
          else{o.classList.add('no');SFX.fail();
            const right=$$('#qz .qOpt').find(x=>x.dataset.ok==='1');if(right)right.classList.add('ok');}
          i++;setTimeout(show,900);
        });
      }
      show();
    },exit(){}});
})();

/* ---------- DEFENSA PERIMETRAL (Phaser 3 on-demand) ---------- */
(function(){
  let game=null;
  function loadPhaser(cb){
    if(window.Phaser)return cb(true);
    const s=document.createElement('script');
    s.src='https://cdnjs.cloudflare.com/ajax/libs/phaser/3.60.0/phaser.min.js';
    s.onload=()=>cb(true);s.onerror=()=>cb(false);
    document.head.appendChild(s);
  }
  registerRoom('td',{section:'scr-room',
    enter(){
      Joy.enabled=false;
      const sec=$('#scr-room');
      sec.innerHTML='<button class="btn sm back" id="tdb">&laquo; SALIR</button><h2 class="pt">DEFENSA PERIMETRAL</h2>'
      +'<p class="small">Torres antiguas vs oleadas que <b>aprenden</b>: cada oleada es m\u00E1s r\u00E1pida y dura. Toca el terreno para construir (30 '+IC+'). +10 '+IC+' por oleada sobrevivida.</p>'
      +'<div id="phWrap" style="width:100%;height:min(52vh,420px);border:1px solid var(--line);border-radius:12px;overflow:hidden;position:relative"><div class="small" style="padding:20px">Cargando Phaser 3 (CDN)...</div></div>';
      $('#tdb').onclick=()=>go('sim');
      loadPhaser(ok=>{
        const wrap=$('#phWrap');if(!wrap)return;
        if(!ok){wrap.innerHTML='<div class="small" style="padding:20px">Sin conexi\u00F3n al CDN de Phaser. El resto del juego funciona igual.</div>';return;}
        try{wrap.innerHTML='';
          const W=wrap.clientWidth,H=wrap.clientHeight;
          const path=[[0,H*.5],[W*.25,H*.5],[W*.25,H*.2],[W*.5,H*.2],[W*.5,H*.75],[W*.75,H*.75],[W*.75,H*.4],[W,H*.4]];
          let wave=1,hp=30,spd=46,lives=5,money=120,spawnT=0,alive=0;
          game=new Phaser.Game({type:Phaser.AUTO,width:W,height:H,parent:wrap,backgroundColor:'#0a0e18',
            scene:{create:create,update:update}});
          function create(){
            const sc=this;
            sc.gfx=sc.add.graphics();
            sc.enemies=[];sc.towers=[];sc.bullets=[];
            sc.txt=sc.add.text(10,8,'OLEADA '+wave+' \u00B7 VIDAS '+lives,{fontFamily:'Rajdhani',fontSize:'16px',color:'#F0F0F0'});
            sc.txt2=sc.add.text(10,28,'CREDITOS '+money+' \u00B7 toca para construir torre (30)',{fontFamily:'Rajdhani',fontSize:'13px',color:'#8A93A6'});
            sc.input.on('pointerdown',p=>{
              if(money<30)return;
              money-=30;addCoins(-30,null);
              const t=sc.add.circle(p.x,p.y,11,0x1E90FF);t.hp=3;t.cd=0;
              sc.towers.push({obj:t,x:p.x,y:p.y,cd:0});
              SFX.pop();
            });
          }
          function update(tms,dt){
            const sc=this;
            spawnT-=dt;
            if(spawnT<=0){spawnT=Math.max(260,1100-wave*70);
              const e=sc.add.circle(4,path[0][1]+rnd(-14,14),8,wave%3===0?0xB26BFF:0xFF3B30);
              sc.enemies.push({obj:e,seg:0,hp:hp+wave*6,x:4,y:path[0][1]});
              alive++;
            }
            sc.enemies.forEach(en=>{
              if(!en.obj.scene)return;
              const tgt=path[Math.min(en.seg+1,path.length-1)];
              const dx=tgt[0]-en.obj.x,dy=tgt[1]-en.obj.y,d=Math.hypot(dx,dy);
              if(d<4){en.seg++;if(en.seg>=path.length-1){
                en.obj.destroy();en.dead=true;lives--;alive--;
                SFX.fail();Shake.add(3,150);
                if(lives<=0){const got=wave*10;addCoins(got,'perímetro');
                  toast('PER\u00CDMETRO CA\u00CDDO','Sobreviviste '+(wave-1)+' oleadas. Premio: +'+got+' '+IC,'gold',4500);
                  sc.scene.restart();wave=1;hp=30;spd=46;lives=5;money=120;}
                return;}
              }else{en.obj.x+=dx/d*spd*(1+wave*.09)*dt/1000*3;en.obj.y+=dy/d*spd*(1+wave*.09)*dt/1000*3;}
            });
            sc.enemies=sc.enemies.filter(e=>!e.dead&&e.obj.scene);
            sc.towers.forEach(tw=>{
              tw.cd-=dt;
              if(tw.cd<=0){
                const target=sc.enemies.find(en=>en.obj.scene&&Math.hypot(en.obj.x-tw.x,en.obj.y-tw.y)<110);
                if(target){
                  tw.cd=620;
                  const bl=sc.add.circle(tw.x,tw.y,3,0x00FF87);
                  sc.bullets.push({obj:bl,tw,target});
                }
              }
            });
            sc.bullets.forEach(b=>{
              if(!b.obj.scene||!b.target.obj.scene){b.obj.destroy();b.gone=true;return;}
              const dx=b.target.obj.x-b.obj.x,dy=b.target.obj.y-b.obj.y,d=Math.hypot(dx,dy);
              if(d<8){b.target.hp-=1;b.obj.destroy();b.gone=true;
                if(b.target.hp<=0){b.target.obj.destroy();b.target.dead=true;alive--;
                  addCoins(2,null);SFX.pop();
                  if(alive<=0){wave++;hp+=4;spd+=5;money+=40;
                    addCoins(10,'oleada');toast('OLEADA '+(wave-1)+' SUPERADA','+10 '+IC+' \u00B7 la pr\u00F3xima aprende: +velocidad, +blindaje','',2600);}
                }
              }else{b.obj.x+=dx/d*520*dt/1000*3;b.obj.y+=dy/d*520*dt/1000*3;}
            });
            sc.bullets=sc.bullets.filter(b=>!b.gone);
            if(sc.txt)sc.txt.setText('OLEADA '+wave+' \u00B7 VIDAS '+lives+' \u00B7 ENEMIGOS '+alive);
            if(sc.txt2)sc.txt2.setText('CREDITOS '+money+' \u00B7 oleadas aprenden: +9% velocidad/coraza por oleada');
          }
        }catch(e){console.error('phaser',e);wrap.innerHTML='<div class="small" style="padding:20px">El motor no arranc\u00F3 en este dispositivo.</div>';}
      });
    },
    exit(){if(game){try{game.destroy(true);}catch(e){}game=null;}}
  });
})();

/* ================= RADIO GEOPOL\u00CDTICA ================= */
(function(){
  const STATIONS=[
    {f:91.5,name:'MAR NEGRO FM',kw:['ucrania','rusia','kiev','mosc\u00FA']},
    {f:95.2,name:'ORIENTE MEDIO INT.',kw:['israel','gaza','ir\u00E1n','ir\u00E1n','medio']},
    {f:99.0,name:'ESTRECHO DE TAIW\u00C1N',kw:['taiw\u00E1n','china','pek\u00EDn']},
    {f:103.7,name:'AM\u00C9RICA EN LUCHA',kw:['venezuela','am\u00E9rica','m\u00E9xico','colombia','hait\u00ED']}
  ];
  let freq=88,tuned=null,eqVals=[.5,.5,.5,.5,.5];
  function stationNews(st){
    return DATA.news.filter(n=>st.kw.some(k=>(n.title||'').toLowerCase().includes(k))).slice(0,2);
  }
  registerRoom('radio',{section:'scr-room',
    enter(){
      Joy.enabled=false;
      const sec=$('#scr-room');
      sec.innerHTML='<button class="btn sm back" id="rb">&laquo; SALIR</button>'
      +'<h2 class="pt">RADIO GEOPOL\u00CDTICA</h2>'
      +'<div class="panel" style="text-align:center">'
      +'<div class="dial" id="dial"><div class="dialScale"><span>88</span><span>92</span><span>96</span><span>100</span><span>104</span><span>108</span></div>'
      +STATIONS.map(s=>'<div class="dialSt" style="left:'+((s.f-88)/20*100)+'%">&#9679;'+s.f+'</div>').join('')
      +'<div class="dialNeedle" id="needle" style="left:0%"></div></div>'
      +'<div class="rowline" style="margin-top:8px"><span class="mono" id="freqN" style="font-size:20px">88.0 MHz</span><span class="tag" id="tunedTag">EST\u00C1TICA</span></div>'
      +'<div class="rng" style="margin-top:4px"><label>VOLUMEN</label><input type="range" id="volR" min="0" max="100" value="70"></div>'
      +'<div id="eqRow" style="display:flex;gap:10px;justify-content:center;margin:10px 0">'
      +eqVals.map((v,i)=>'<div class="eqBar" data-eq="'+i+'"><div class="eqFill" style="height:'+(v*100)+'%"></div><i style="height:'+(v*60)+'%"></i></div>').join('')
      +'</div>'
      +'<canvas id="waveCv" width="300" height="70" style="width:100%;max-width:340px;border:1px solid var(--line);border-radius:8px"></canvas>'
      +'<div id="stNews" style="margin-top:8px"></div>'
      +'<button class="btn red sm" id="liveBtn" style="margin-top:8px">&#9679; TRANSMITIR EN VIVO (5s)</button>'
      +'<div class="small" style="margin-top:6px">Las noticias son reales (GDELT). El presentador usa s\u00EDntesis de voz'+(CFG.elevenlabs?' ElevenLabs':' del navegador')+'.</div>'
      +'</div>';
      $('#rb').onclick=()=>go('comm');
      SFX.staticStart();
      const dial=$('#dial');
      let dialDrag=false;
      const setFreqFromX=x=>{
        const r=dial.getBoundingClientRect();
        freq=clamp(88+(x-r.left)/r.width*20,88,108);
        $('#needle').style.left=((freq-88)/20*100)+'%';
        $('#freqN').textContent=freq.toFixed(1)+' MHz';
        let best=null,bd=99;
        STATIONS.forEach(s=>{const d=Math.abs(s.f-freq);if(d<bd){bd=d;best=s;}});
        SFX.staticLevel(clamp(bd/2.5,.06,.7));
        if(bd<.55){tuned=best;$('#tunedTag').textContent='SINTONIZADO: '+best.name;$('#tunedTag').className='tag g';
          const ns=stationNews(best);
          $('#stNews').innerHTML=ns.length?'<h3 class="ps">EN EMISI\u00D3N</h3>'+ns.map(n=>'<div class="feedItem">'+esc(n.title)+'</div>').join('')+'<button class="btn sm" id="playNews">&#9654; ESCUCHAR INFORME</button>':'<div class="small">Sin noticias de esta regi\u00F3n en el feed ahora mismo.</div>';
          const pb=$('#playNews');if(pb)pb.onclick=()=>{SFX.tts('Aqu\u00ED '+best.name+'. '+ns.map(n=>n.title).join('. '));};
          if(!dial._played){dial._played=true;SFX.bell();}
        }else{tuned=null;$('#tunedTag').textContent='EST\u00C1TICA';$('#tunedTag').className='tag r';$('#stNews').innerHTML='';}
      };
      setFreqFromX(innerWidth/2);
      dial.addEventListener('pointerdown',e=>{dialDrag=true;setFreqFromX(e.clientX);});
      window.addEventListener('pointermove',e=>{if(dialDrag)setFreqFromX(e.clientX);});
      window.addEventListener('pointerup',()=>dialDrag=false);
      $('#volR').oninput=e=>{if(window.Howler)Howler.volume(e.target.value/100);};
      /* EQ arrastrable */
      $$('.eqBar').forEach(bar=>{
        bar.addEventListener('pointerdown',e=>e.stopPropagation());
        bar.addEventListener('pointermove',e=>{
          if(!e.buttons&&!Pointer.touch)return;
          const r=bar.getBoundingClientRect();
          const v=clamp(1-(e.clientY-r.top)/r.height,0,1);
          eqVals[+bar.dataset.eq]=v;
          bar.querySelector('.eqFill').style.height=(v*100)+'%';
          bar.querySelector('i').style.height=(v*60)+'%';
        });
      });
      /* EN VIVO */
      $('#liveBtn').onclick=async()=>{
        const btn=$('#liveBtn');
        try{
          const stream=await navigator.mediaDevices.getUserMedia({audio:true});
          const rec=new MediaRecorder(stream);const chunks=[];
          rec.ondataavailable=e=>chunks.push(e.data);
          rec.start();btn.textContent='\u25CF EN VIVO...';btn.classList.add('rec');
          pushFeed('est\u00E1 TRANSMITIENDO EN VIVO en la radio geopol\u00EDtica','r');
          toast('EN VIVO','Tu voz se emite a los agentes sintonizados ('+DATA.online+')','good');
          setTimeout(()=>{
            rec.stop();stream.getTracks().forEach(t=>t.stop());
            btn.textContent='\u25CF TRANSMITIR EN VIVO (5s)';btn.classList.remove('rec');
            const blob=new Blob(chunks,{type:'audio/webm'});
            const url=URL.createObjectURL(blob);const au=new Audio(url);au.play();
            toast('RETRANSMISI\u00D3N','Reproduciendo tu emisi\u00F3n','',2500);
          },5000);
        }catch(e){toast('MICR\u00D3FONO','Sin permiso de micr\u00F3fono','bad');}
      };
    },
    exit(){SFX.staticStop();if(window.Howler)Howler.volume(.9);},
    update(){
      const cv=$('#waveCv');if(!cv)return;
      const g=cv.getContext('2d');
      g.fillStyle='rgba(7,10,18,.9)';g.fillRect(0,0,cv.width,cv.height);
      const t=performance.now()/180;
      for(let x=0;x<cv.width;x+=4){
        const base=tuned?Math.sin(x*.05+t)*16*eqVals[2]:rnd(1,4);
        const dist=Pointer.down&&Math.abs(x+(cv.getBoundingClientRect().left)-Pointer.x)<40?26:0;
        const h=Math.abs(base)+dist+Mic.level*22;
        g.fillStyle=tuned?'rgba(0,255,135,.8)':'rgba(255,59,48,.5)';
        g.fillRect(x,cv.height/2-h/2,2.5,h);
      }
    }
  });
})();

/* ================= TERMINAL DE HACKEO ================= */
(function(){
  let state='idle',challenge=null,timer=0,lockUntil=0,keyFrag=null,targetIp=null,fwLevel=0;
  const CHARS='ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#$%&/()=';
  function rndStr(n){let s='';for(let i=0;i<n;i++)s+=CHARS[Math.floor(Math.random()*CHARS.length)];return s;}
  function log(line,cls){const t=$('#termOut');if(!t)return;t.innerHTML+='<div class="'+(cls||'')+'">'+line+'</div>';t.scrollTop=t.scrollHeight;}
  function incomingAttack(){
    if(state==='challenge'||now()<lockUntil)return;
    toast('ATAQUE CIBERN\u00C9TICO','Cloudflare Radar: tr\u00E1fico malicioso dirigido a ti. Terminal lista.','bad',5200);
    SFX.alarm();
    if(roomName()==='hack')armChallenge();
  }
  setInterval(()=>{if(Math.random()<.4)incomingAttack();},150000);
  function armChallenge(){
    fwLevel=irnd(1,3);
    targetIp=irnd(11,223)+'.'+irnd(0,255)+'.'+irnd(0,255)+'.'+irnd(1,254);
    challenge=rndStr(14+fwLevel*6);
    state='challenge';timer=9+fwLevel*2;
    log('<span class="warn">FIREWALL ACTIVO nivel '+fwLevel+' desde '+targetIp+'</span>');
    log('Escribe EXACTAMENTE antes de que caiga el muro:');
    log('<b style="color:#fff">'+challenge+'</b>');
    $('#cmdIn').value='';
  }
  function successBlock(){
    state='idle';
    P.hackWins++;addCoins(120+fwLevel*40,'hackeo');addXP(70);save();
    log('<span style="color:#00FF87">MURO DESTRUIDO. ATAQUE BLOQUEADO.</span>');
    FX.codeRain(4);FX.confetti(50);SFX.win();Shake.add(2,200);
    toast('HACKEO CONTRAATACADO','+'+(120+fwLevel*40)+' '+IC,'gold');
    pushFeed('destruy\u00F3 un firewall nivel '+fwLevel+' en la terminal de hackeo','g');
    randomFeedEvent();
  }
  function failBlock(){
    state='locked';lockUntil=now()+30000;
    document.body.classList.add('glitchRed');
    SFX.explosion();Flash.red(.6,300);vibrate(200);
    log('<span class="err">FALLO CRITICO. El sistema qued\u00F3 comprometido. Bloqueo de seguridad: 30s.</span>');
    World.bump(1.2,'ciberataque exitoso en tu contra');
    setTimeout(()=>{document.body.classList.remove('glitchRed');state='idle';log('Sistemas restaurados. Reintenta.');},30000);
  }
  registerRoom('hack',{section:'scr-room',
    enter(){
      Joy.enabled=false;
      const sec=$('#scr-room');
      sec.innerHTML='<button class="btn sm back" id="hb2">&laquo; SALIR</button>'
      +'<h2 class="pt">TERMINAL DE HACKEO &middot; CIBERDEFENSA</h2>'
      +'<p class="small">Comandos: <span class="kbd">scan</span> <span class="kbd">trace</span> <span class="kbd">block</span> <span class="kbd">decrypt</span> <span class="kbd">clear</span></p>'
      +'<div class="term" id="termOut"><div>VANGUARD SECURE SHELL v68 \u00B7 conexi\u00F3n segura establecida</div><div>Escribe <b>scan</b> para detectar amenazas (Cloudflare Radar simulado en cliente + eventos en vivo).</div></div>'
      +'<div style="display:flex;gap:8px;margin-top:8px"><input type="text" id="cmdIn" placeholder="comando..." autocomplete="off"><button class="btn green sm" id="cmdGo">&raquo;</button></div>'
      +'<div class="rowline"><span class="small">Hackeos ganados: <b>'+P.hackWins+'</b></span><span class="mono" id="hackTimer"></span></div>';
      $('#hb2').onclick=()=>go('comm');
      const run=()=>{
        const v=$('#cmdIn').value.trim();
        $('#cmdIn').value='';
        if(!v)return;
        if(state==='challenge'){
          if(v===challenge){successBlock();}
          else{log('<span class="err">SECUENCIA INCORRECTA \u2014 el muro resiste</span>','err');}
          return;
        }
        const c=v.toLowerCase();
        log('<span class="cIn">&gt; '+esc(v)+'</span>');
        if(c==='clear'){$('#termOut').innerHTML='';}
        else if(c==='scan'){
          log('Escaneando red... <span class="warn">amenaza detectada: '+irnd(3,18)+' intentos/min</span>');
          setTimeout(()=>{log('Usa <b>trace</b> para identificar el origen y <b>block</b> para enfrentar el firewall.');armChallenge();},600);
        }
        else if(c==='trace'){
          const ctry=pick(DATA.countries.length?DATA.countries:FALLBACK_COUNTRIES);
          keyFrag=rndStr(6);
          log('Origen: <b>'+(ctry.n||'desconocido')+'</b> <img src="'+flagURL(ctry.c2,40)+'" style="height:11px;vertical-align:middle"> \u00B7 fragmento de clave: <b>'+keyFrag+'</b>');
        }
        else if(c==='block'){armChallenge();}
        else if(c==='decrypt'){
          if(!keyFrag){log('<span class="err">Sin clave: ejecuta trace primero</span>');}
          else{
            try{
              const cipher=CryptoJS.AES.encrypt('INTEL: el bot utiliza nodos de salida en '+pick(FALLBACK_COUNTRIES).n,keyFrag).toString();
              const plain=CryptoJS.AES.decrypt(cipher,keyFrag).toString(CryptoJS.enc.Utf8);
              log('<span class="warn">CIFRADO AES-256 (CryptoJS)</span> \u00B7 descifrando...');
              setTimeout(()=>{
                log('<span style="color:#00FF87">'+esc(plain)+'</span>');
                const file={t:now(),n:'Descifrado '+keyFrag,txt:plain,kind:'hack'};
                P.files.push(file);save();checkOmega();addXP(30);
              },700);
            }catch(e){log('<span class="err">Error de cifrado</span>');}
          }
        }
        else if(c==='help'){log('scan \u00B7 trace \u00B7 block \u00B7 decrypt \u00B7 clear');}
        else log('<span class="err">comando desconocido</span>');
      };
      $('#cmdGo').onclick=run;
      $('#cmdIn').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();run();}else SFX.key();});
      log('Escribe <b>scan</b> para comenzar.');
      setTimeout(()=>$('#cmdIn')&&$('#cmdIn').focus(),300);
    },
    exit(){},
    update(dt){
      if(state==='challenge'){
        timer-=dt;
        const el=$('#hackTimer');if(el)el.textContent='MURO: '+Math.max(0,timer).toFixed(1)+'s';
        if(timer<=0)failBlock();
      }
    }
  });
})();

/* ================= DETECTOR DE MENTIRAS ================= */
(function(){
  let analyzing=false;
  function truthOf(id){
    let h=0;for(let i=0;i<id.length;i++)h=(h*31+id.charCodeAt(i))>>>0;
    return (h%100)<62;
  }
  registerRoom('detector',{section:'scr-room',
    enter(){
      Joy.enabled=false;
      const sec=$('#scr-room');
      const news=DATA.news.slice(0,8);
      sec.innerHTML='<button class="btn sm back" id="db">&laquo; SALIR</button>'
      +'<h2 class="pt">DETECTOR DE MENTIRAS</h2>'
      +'<p class="small">Agarra una noticia del feed y arr\u00E1strala hasta la m\u00E1quina.</p>'
      +'<div style="display:flex;gap:12px;flex-wrap:wrap">'
      +'<div id="newsFeed" style="flex:1;min-width:240px;max-height:52vh" class="scroll">'
      +(news.length?news.map((n,i)=>'<div class="feedItem lieItem" draggable="false" data-i="'+i+'" style="cursor:grab;background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:8px;margin-bottom:6px">'+esc(n.title)+'<div class="small dim">'+esc(n.domain||'')+'</div></div>').join(''):'<div class="small">Feed cargando...</div>')
      +'</div>'
      +'<div id="machine" class="panel holo" style="width:230px;text-align:center;border-style:dashed;border-color:var(--red)">'
      +'<div class="ttl" style="color:var(--red)">VERITAS-9</div>'
      +'<div id="gears" style="display:flex;justify-content:center;gap:10px;margin:12px 0;opacity:.25">'
      +[0,1,2].map(i=>'<div class="gear" data-g="'+i+'" style="width:38px;height:38px;border:4px dashed var(--gold);border-radius:50%;animation:spin '+(2+i)+'s linear infinite"></div>').join('')
      +'</div>'
      +'<div class="bar" style="height:12px"><i id="lieBar" style="width:0%;background:linear-gradient(90deg,var(--red),var(--gold),var(--green))"></i></div>'
      +'<div class="small" id="lieStat">esperando muestra</div>'
      +'</div></div>'
      +'<style>@keyframes spin{to{transform:rotate(360deg)}}</style>';
      $('#db').onclick=()=>go('comm');
      let dragEl=null,ghost=null;
      $$('.lieItem',sec).forEach(it=>{
        it.addEventListener('pointerdown',e=>{
          dragEl=it;it.setPointerCapture&&it.setPointerCapture(e.pointerId);
          ghost=it.cloneNode(true);ghost.style.cssText='position:fixed;z-index:36;pointer-events:none;width:230px;opacity:.9';
          document.body.appendChild(ghost);
        });
        it.addEventListener('pointermove',e=>{
          if(!dragEl)return;
          ghost.style.left=(e.clientX-110)+'px';ghost.style.top=(e.clientY-20)+'px';
          const m=$('#machine').getBoundingClientRect();
          $('#machine').style.borderColor=(e.clientX>m.left&&e.clientX<m.right&&e.clientY>m.top&&e.clientY<m.bottom)?'var(--green)':'var(--red)';
        });
        it.addEventListener('pointerup',e=>{
          const m=$('#machine').getBoundingClientRect();
          const over=e.clientX>m.left&&e.clientX<m.right&&e.clientY>m.top&&e.clientY<m.bottom;
          if(ghost){ghost.remove();ghost=null;}
          $('#machine').style.borderColor='var(--red)';
          if(over&&dragEl&&!analyzing)analyze(news[+dragEl.dataset.i],dragEl);
          dragEl=null;
        });
      });
    },
    exit(){}
  });
  function analyze(n,el){
    if(!n)return;
    analyzing=true;
    SFX.vacuum();
    $('#lieStat').innerHTML='absorbiendo muestra...';
    $('#gears').style.opacity=1;
    setTimeout(()=>{
      SFX.gear();
      $('#lieStat').innerHTML='analizando (engranajes en vivo)...';
      let v=0;const truth=truthOf(n.externalId||n.title||'x');
      let t0=performance.now();
      const iv=setInterval(()=>{
        const k=(performance.now()-t0)/5000;
        v=truth?lerp(v,rnd(70,96),.3):lerp(v,rnd(4,28),.3);
        $('#lieBar').style.width=v+'%';
        $('#lieStat').innerHTML='medidor de veracidad: <b class="num">'+Math.round(v)+'%</b>';
        if(Math.random()<.5)SFX.type();
        if(k>=1){
          clearInterval(iv);
          if(truth){
            SFX.bell();FX.confetti(60);addXP(35);addCoins(25,'detector');
            $('#lieStat').innerHTML='<b style="color:var(--green)">VERIFICADO \u00B7 REAL</b>';
            toast('VERITAS-9','La noticia pasa el control. +25 '+IC,'good');
          }else{
            SFX.siren();FX.ink(innerWidth-140,innerHeight/2);Shake.add(4,300);addXP(25);
            $('#lieStat').innerHTML='<b style="color:var(--red)">FALSO \u00B7 PROPAGANDA</b>';
            el.insertAdjacentHTML('beforeend','<div class="inkdrip"></div>');
            toast('VERITAS-9','Fabricaci\u00F3n detectada. La tinta roja la cubre.','bad');
          }
          $('#gears').style.opacity=.25;
          analyzing=false;
        }
      },120);
    },900);
  }
})();
