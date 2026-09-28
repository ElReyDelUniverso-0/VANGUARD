/* ================= SIMULADOR DE COMBATE ================= */
(function(){
  registerRoom('sim',{section:'scr-sim',enter(){
    Joy.enabled=false;
    const sec=$('#scr-sim');
    sec.innerHTML='<button class="btn sm back" id="sb">&laquo; HANGAR</button>'
    +'<h2 class="pt">SIMULADOR DE COMBATE</h2>'
    +'<p class="small">Cinco entrenamientos. Cada victoria paga en '+IC+' y XP.</p>'
    +'<div class="navGrid">'
    +'<div class="navCell" data-go="sniper"><div class="ic">&#9678;</div><div class="nm">FRANCOTIRADOR</div><div class="ds">derriba burbujas de desinformaci\u00F3n</div></div>'
    +'<div class="navCell" data-go="tactica"><div class="ic">&#9878;</div><div class="nm">MESA T\u00C1CTICA</div><div class="ds">arrastra unidades vs ATLAS</div></div>'
    +'<div class="navCell" data-go="builder"><div class="ic">&#9968;</div><div class="nm">CONSTRUCTOR</div><div class="ds">esculpe un conflicto con tus manos</div></div>'
    +'<div class="navCell" data-go="quiz"><div class="ic">?</div><div class="nm">QUIZ OSINT</div><div class="ds">OpenTrivia en vivo</div></div>'
    +'<div class="navCell" data-go="td"><div class="ic">&#9638;</div><div class="nm">DEFENSA PERIMETRAL</div><div class="ds">torres vs oleadas que aprenden</div></div>'
    +'</div>'
    +'<div class="sep"></div><div class="small">Mejor racha de francotirador: <b>'+P.bestSniper+'</b> \u00B7 Duelos ganados: <b>'+P.duelWins+'</b></div>';
    $('#sb').onclick=()=>go('hangar');
    $$('#scr-sim .navCell').forEach(c=>c.onclick=()=>go(c.dataset.go));
  },exit(){}});
})();

/* ---------- FRANCOTIRADOR GEOPOL\u00CDTICO ---------- */
(function(){
  let bubbles,clusters,scope,time,score,got,missed,over,aimX,aimY,stamina;
  function start(){
    bubbles=[];clusters=[];score=0;got=0;missed=0;over=false;time=60;stamina=3;
    aimX=G2.w/2;aimY=G2.h/2;
    for(let i=0;i<5;i++)clusters.push({x:rnd(G2.w*.1,G2.w*.9),y:G2.h*rnd(.72,.86),n:0});
    spawnT=0;
  }
  let spawnT=0;
  function spawn(){
    const truth=Math.random()<.28;
    const r=rnd(14,34);
    bubbles.push({x:rnd(40,G2.w-40),y:-30,r,vx:rnd(-30,30),vy:rnd(28,60)+(34-r)*1.2,type:truth?'true':'dis',ph:rnd(0,6)});
  }
  function shoot(){
    if(over)return;
    SFX.pop();vibrate(20);
    let hit=null;
    for(let i=bubbles.length-1;i>=0;i--){
      const b=bubbles[i];
      if(Math.hypot(b.x-aimX,b.y-aimY)<b.r+16){hit=b;bubbles.splice(i,1);break;}
    }
    if(!hit){FX.dust(aimX,aimY,3);return;}
    if(hit.type==='dis'){
      const val=Math.max(4,Math.round(40-hit.r));
      score+=val;got++;
      addCoins(val,'francotirador');addXP(6);
      FX.sparks(hit.x,hit.y,14,'30,144,255');SFX.coin(val>=20);
    }else{
      score=Math.max(0,score-25);missed++;
      toast('INFO VERIFICADA','Era informaci\u00F3n VERDADERA. Dilema moral: -25','bad',2500);
      FX.sparks(hit.x,hit.y,10,'0,255,135');SFX.fail();
    }
  }
  registerRoom('sniper',{section:'scr-room',
    enter(){
      Joy.enabled=false;G2.show();start();
      const sec=$('#scr-room');
      sec.innerHTML='<button class="btn sm back" id="xb">&laquo; SALIR</button><div style="text-align:center"><h2 class="pt">FRANCOTIRADOR GEOPOL\u00CDTICO</h2><p class="small">Elimina <b style="color:var(--blue)">burbujas de desinformaci\u00F3n</b> antes de que lleguen a la poblaci\u00F3n. NO dispares a la informaci\u00F3n verificada <span class="tag g">VERDADERA</span>. '+(IS_MOBILE?'Toca para disparar. Mant\u00E9n para apuntar firme.':'Clic dispara. Mant\u00E9n para apuntar firme (3s de pulso firme).')+'</p></div>';
      $('#xb').onclick=()=>go('sim');
      sec.style.pointerEvents='none';$('#xb').style.pointerEvents='auto';
    },
    exit(){G2.hide();$('#scr-room').style.pointerEvents='';
      if(score>P.bestSniper){P.bestSniper=score;save();}
    },
    update(dt){
      if(!G2.on)return;
      if(over){draw();return;}
      time-=dt;
      if(time<=0){over=true;
        const won=score>=120;
        if(won){addCoins(100,'francotirador ronda');addXP(60);SFX.win();FX.confetti(50);}
        else{SFX.fail();toast('CASI LO LOGRAS','Te faltaron '+Math.max(0,120-score)+' puntos para el bonus. Revancha inmediata.','bad',4500);}
      }
      spawnT-=dt;
      if(spawnT<=0){spawnT=rnd(.5,1.1);spawn();}
      const steady=Pointer.down&&stamina>0;
      if(steady)stamina-=dt;else stamina=Math.min(3,stamina+dt*.7);
      const trem=steady?1.2:4.5;
      aimX=lerp(aimX,Pointer.x,.25)+Math.sin(performance.now()/90)*trem*.4;
      aimY=lerp(aimY,Pointer.y,.25)+Math.cos(performance.now()/120)*trem*.4;
      if((Pointer.justDown&&!Pointer.longPress))shoot();
      for(let i=bubbles.length-1;i>=0;i--){
        const b=bubbles[i];
        b.x+=b.vx*dt+Math.sin(performance.now()/300+b.ph)*.6;
        b.y+=b.vy*dt;
        let hitPop=false;
        clusters.forEach(c=>{if(Math.hypot(c.x-b.x,c.y-b.y)<30)hitPop=true;});
        if(hitPop||b.y>G2.h){
          bubbles.splice(i,1);
          if(hitPop&&b.type==='dis'){World.bump(.5,'desinformaci\u00F3n alcanz\u00F3 a la poblaci\u00F3n');FX.ink(b.x,b.y);}
        }
      }
      draw();
    },
    onKey(e){if(e.code==='Space')shoot();},
    onPointerMove(){}
  });
  function draw(){
    const ctx=G2.ctx,W=G2.w,H=G2.h;
    ctx.fillStyle='#070a12';ctx.fillRect(0,0,W,H);
    ctx.strokeStyle='rgba(30,144,255,.08)';
    for(let x=0;x<W;x+=60){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
    for(let y=0;y<H;y+=60){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
    clusters.forEach(c=>{
      for(let i=0;i<14;i++){
        const px=c.x+rnd(-22,22),py=c.y+rnd(-10,10);
        ctx.fillStyle='rgba(0,255,135,'+rnd(.15,.5)+')';
        ctx.beginPath();ctx.arc(px,py,1.6,0,7);ctx.fill();
      }
      ctx.fillStyle='rgba(0,255,135,.5)';ctx.font='10px Rajdhani';
      ctx.fillText('POBLACI\u00D3N',c.x-24,c.y+26);
    });
    bubbles.forEach(b=>{
      const grad=ctx.createRadialGradient(b.x,b.y,1,b.x,b.y,b.r);
      if(b.type==='dis'){grad.addColorStop(0,'rgba(30,144,255,.6)');grad.addColorStop(1,'rgba(178,107,255,.15)');}
      else{grad.addColorStop(0,'rgba(0,255,135,.55)');grad.addColorStop(1,'rgba(0,255,135,.12)');}
      ctx.fillStyle=grad;ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,7);ctx.fill();
      ctx.strokeStyle=b.type==='dis'?'rgba(120,180,255,.8)':'rgba(0,255,135,.9)';
      ctx.lineWidth=1.5;ctx.stroke();
      ctx.fillStyle='rgba(240,240,240,.8)';ctx.font='8px JetBrains Mono';
      ctx.fillText(b.type==='dis'?'FAKE':'TRUE',b.x-10,b.y+3);
    });
    /* mirilla */
    ctx.strokeStyle='rgba(255,59,48,.9)';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.arc(aimX,aimY,34,0,7);ctx.stroke();
    ctx.beginPath();ctx.arc(aimX,aimY,2,0,7);ctx.stroke();
    ctx.beginPath();ctx.moveTo(aimX-46,aimY);ctx.lineTo(aimX-36,aimY);ctx.moveTo(aimX+36,aimY);ctx.lineTo(aimX+46,aimY);
    ctx.moveTo(aimX,aimY-46);ctx.lineTo(aimX,aimY-36);ctx.moveTo(aimX,aimY+36);ctx.lineTo(aimX,aimY+46);ctx.stroke();
    ctx.fillStyle='rgba(240,240,240,.9)';ctx.font='14px Rajdhani';
    ctx.fillText('PUNTOS '+score+'  \u00B7  TIEMPO '+Math.max(0,Math.ceil(time))+'s  \u00B7  PULSO '+stamina.toFixed(1)+'s',12,24);
    if(over){
      ctx.fillStyle='rgba(5,6,10,.75)';ctx.fillRect(0,0,W,H);
      ctx.fillStyle='#F0F0F0';ctx.font='700 30px Orbitron';ctx.textAlign='center';
      ctx.fillText(score>=120?'MISI\u00D3N CUMPLIDA':'RONDA TERMINADA',W/2,H/2-20);
      ctx.font='16px Rajdhani';ctx.fillStyle='#8A93A6';
      ctx.fillText('Puntos: '+score+' \u00B7 Aciertos: '+got+' \u00B7 Errores: '+missed,W/2,H/2+14);
      ctx.textAlign='left';
    }
  }
})();

/* ---------- MESA DE ESTRATEGIA T\u00C1CTICA ---------- */
(function(){
  const UNIT_TYPES={
    inf:{r:6,speed:220,label:'INF',cost:1,w:1},
    tank:{r:9,speed:70,label:'TAN',cost:3,w:3.2},
    plane:{r:7,speed:300,label:'AVN',cost:2,w:2}
  };
  let units,atlas,drag,time,pct,over,objA,objB,intensity;
  function atlasLayout(){
    return[{t:'inf',x:.72,y:.3},{t:'inf',x:.78,y:.5},{t:'inf',x:.7,y:.7},{t:'tank',x:.85,y:.5},{t:'tank',x:.9,y:.35},{t:'inf',x:.65,y:.5}];
  }
  function start(){
    units=[];drag=null;time=60;over=false;
    objA={x:G2.w*.18,y:G2.h*.5};objB={x:G2.w*.82,y:G2.h*.5};
    const pz=(DATA.pulso&&DATA.pulso.zones)?DATA.pulso.zones:[];
    intensity=pz.reduce((a,z)=>a+z.total,0);
    atlas=atlasLayout().map(u=>({...u,x:u.x*G2.w,y:u.y*G2.h}));
    ['inf','inf','inf','inf','tank','plane'].forEach(t=>units.push({t,x:rnd(G2.w*.06,G2.w*.2),y:rnd(G2.h*.2,G2.h*.8)}));
  }
  function unitScore(u,isMine){
    const T=UNIT_TYPES[u.t];
    const tgt=u.t==='plane'?objB:objA;
    const d=Math.hypot(u.x-tgt.x,u.y-tgt.y);
    let s=T.w*Math.max(.2,1-d/(G2.w*.7));
    let sup=0;
    (isMine?units:atlas).forEach(o=>{if(o!==u&&Math.hypot(o.x-u.x,o.y-u.y)<90)sup+=.12;});
    return s+Math.min(1.2,sup);
  }
  function calcPct(){
    let mine=0,their=0;
    units.forEach(u=>mine+=unitScore(u,true));
    atlas.forEach(u=>their+=unitScore(u,false));
    const live=clamp(intensity/30,0,1);
    const mil=P.recruits.some(r=>r.spec==='MIL')?3:0;
    return Math.round(clamp(50+(mine-their)*7+ (live*2-1)*3+mil,4,96));
  }
  registerRoom('tactica',{section:'scr-room',
    enter(){
      Joy.enabled=false;G2.show();start();
      const sec=$('#scr-room');
      sec.innerHTML='<button class="btn sm back" id="tb">&laquo; SALIR</button>'
      +'<div style="text-align:center;pointer-events:none"><h2 class="pt">MESA DE ESTRATEGIA T\u00C1CTICA</h2>'
      +'<p class="small">Arrastra tus unidades: INF liviana y veloz \u00B7 TAN lenta y pesada (motor real) \u00B7 AVN vuela en arco al soltar. Objetivo: supera el despliegue de <b style="color:var(--red)">ATLAS</b>. Factor ACLED en vivo: <b class="num">'+intensity+'</b> se\u00F1ales.</p></div>';
      $('#tb').onclick=()=>go('sim');
      sec.style.pointerEvents='none';$('#tb').style.pointerEvents='auto';
    },
    exit(){G2.hide();$('#scr-room').style.pointerEvents='';SFX.engineStop();},
    update(dt){
      if(!G2.on)return;
      if(!over){
        time-=dt;
        if(time<=0)finish();
      }
      if(drag){
        const T=UNIT_TYPES[drag.t];
        const dx=Pointer.x-drag.x,dy=Pointer.y-drag.y;
        if(drag.t==='plane'){
          /* el avi\u00F3n vuela en arco parab\u00F3lico hacia el puntero */
          drag._arc=(drag._arc||0)+dt*2.2;
          drag.x+=dx*dt*4.5;drag.y+=dy*dt*4.5-Math.sin(Math.min(Math.PI,drag._arc))*2.2;
          if(drag._arc>Math.PI)drag._arc=Math.PI;
        }else{
          const sp=T.speed*dt;
          drag.x+=clamp(dx,-sp,sp);drag.y+=clamp(dy,-sp,sp);
        }
        if(drag.t==='tank'){SFX.engineStart();SFX.enginePitch(Math.abs(dx)/60);}
        drag.x=clamp(drag.x,20,G2.w-20);drag.y=clamp(drag.y,70,G2.h-20);
      }else SFX.engineStop();
      pct=calcPct();
      draw();
    },
    onPointerMove(){
      if(!Pointer.down||!G2.on)return;
      if(!drag){
        const hit=units.find(u=>Math.hypot(u.x-Pointer.x,u.y-Pointer.y)<16);
        if(hit)drag=hit;
      }
    },
    onPointerUp(){drag=null;SFX.engineStop();},
    onKey(e){if(e.code==='Enter'&&!over)finish();}
  });
  function finish(){
    over=true;
    const won=pct>55;
    if(won){P.duelWins++;addCoins(150,'t\u00E1ctica');addXP(90);SFX.win();FX.confetti(60);
      pushFeed('venci\u00F3 a ATLAS en la mesa t\u00E1ctica ('+pct+'%)','g');}
    else{SFX.fail();
      toast('CASI LO LOGRAS','ATLAS te gan\u00F3 por '+Math.abs(pct-55)+' puntos de despliegue. Reposici\u00F3n sugerida: acerca la INF al objetivo A.','bad',5200);
      World.bump(1,'conflicto escal\u00F3 en el mapa');}
    if(!P.bestTactic&&won){P.bestTactic=true;save();}
  }
  function drawUnit(u,col){
    const ctx=G2.ctx,T=UNIT_TYPES[u.t];
    ctx.fillStyle=col;ctx.strokeStyle='rgba(240,240,240,.5)';
    if(u.t==='tank'){ctx.fillRect(u.x-T.r,u.y-T.r,T.r*2,T.r*1.4);ctx.strokeRect(u.x-T.r,u.y-T.r,T.r*2,T.r*1.4);}
    else if(u.t==='plane'){ctx.beginPath();ctx.moveTo(u.x,u.y-T.r);ctx.lineTo(u.x+T.r,u.y+T.r);ctx.lineTo(u.x-T.r,u.y+T.r);ctx.closePath();ctx.fill();ctx.stroke();}
    else{ctx.beginPath();ctx.arc(u.x,u.y,T.r,0,7);ctx.fill();ctx.stroke();}
    ctx.fillStyle='rgba(240,240,240,.85)';ctx.font='8px Rajdhani';
    ctx.fillText(T.label,u.x-8,u.y+T.r+9);
  }
  function draw(){
    const ctx=G2.ctx,W=G2.w,H=G2.h;
    ctx.fillStyle='#0a0e18';ctx.fillRect(0,0,W,H);
    ctx.strokeStyle='rgba(30,144,255,.1)';
    for(let x=0;x<W;x+=50){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
    for(let y=0;y<H;y+=50){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
    [objA,objB].forEach((o,i)=>{
      ctx.strokeStyle=i===0?'rgba(30,144,255,.7)':'rgba(255,59,48,.7)';
      ctx.lineWidth=2;ctx.strokeRect(o.x-30,o.y-30,60,60);
      ctx.fillStyle=i===0?'rgba(30,144,255,.12)':'rgba(255,59,48,.12)';
      ctx.fillRect(o.x-30,o.y-30,60,60);
      ctx.fillStyle=i===0?'#1E90FF':'#FF3B30';ctx.font='10px Orbitron';
      ctx.fillText(i===0?'OBJETIVO A':'OBJETIVO B',o.x-30,o.y-38);
    });
    ctx.lineWidth=1;
    atlas.forEach(u=>drawUnit(u,'#FF3B30'));
    units.forEach(u=>drawUnit(u,'#1E90FF'));
    ctx.fillStyle='rgba(240,240,240,.95)';ctx.font='700 15px Orbitron';
    ctx.fillText('VICTORIA: '+pct+'%',12,24);
    ctx.font='12px Rajdhani';ctx.fillStyle='#8A93A6';
    ctx.fillText('Tiempo: '+Math.max(0,Math.ceil(time))+'s \u00B7 '+(pct>55?'VAS GANANDO':'ATLAS VA GANANDO'),12,42);
    if(over){
      ctx.fillStyle='rgba(5,6,10,.78)';ctx.fillRect(0,0,W,H);
      ctx.textAlign='center';ctx.fillStyle=pct>55?'#00FF87':'#FF3B30';ctx.font='700 30px Orbitron';
      ctx.fillText(pct>55?'DESPLIEGUE PERFECTO':'ATLAS GANA ESTA',W/2,H/2-16);
      ctx.fillStyle='#F0F0F0';ctx.font='15px Rajdhani';
      ctx.fillText('Probabilidad final: '+pct+'%',W/2,H/2+16);
      ctx.textAlign='left';
    }
  }
})();

/* ---------- CONSTRUCTOR DE MAPAS T\u00C1CTIL ---------- */
(function(){
  const GC=48,GR=32;
  let hmap,cities,flames,troops,borders,alliances,tool,oceanMode,simT,playing,allyFrom=null;
  function start(){
    hmap=[];for(let r=0;r<GR;r++)hmap.push(new Array(GC).fill(.3));
    cities=[];flames=[];troops=[];borders=[];alliances=[];tool='mount';oceanMode=false;playing=false;simT=0;
  }
  function paint(px,py,dir){
    const cw=G2.w/GC,chh=G2.h/GR;
    const c=Math.floor(px/cw),r=Math.floor(py/chh);
    const R=2;
    for(let dr=-R;dr<=R;dr++)for(let dc=-R;dc<=R;dc++){
      const rr=r+dr,cc=c+dc;
      if(rr<0||rr>=GR||cc<0||cc>=GC)continue;
      if(Math.hypot(dr,dc)>R)continue;
      if(oceanMode||tool==='ocean')hmap[rr][cc]=Math.min(hmap[rr][cc],.14);
      else if(tool==='mount')hmap[rr][cc]=Math.min(1,hmap[rr][cc]+.05);
      else if(tool==='valley')hmap[rr][cc]=Math.max(0,hmap[rr][cc]-.05);
    }
  }
  function nearestCity(x,y,md){let b=null,bd=md||40;cities.forEach(c=>{const d=Math.hypot(c.x-x,c.y-y);if(d<bd){bd=d;b=c;}});return b;}
  function simulate(dt){
    simT+=dt;
    troops.forEach(t=>{
      const f=flames.length?flames[t._fi=Math.min(t._fi??0,flames.length-1)]:null;
      if(f){
        const dx=f.x-t.x,dy=f.y-t.y,d=Math.hypot(dx,dy);
        if(d>6){t.x+=dx/d*40*dt;t.y+=dy/d*40*dt;}
      }
    });
    if(simT>18)playing=false;
  }
  registerRoom('builder',{section:'scr-room',
    enter(){
      Joy.enabled=false;G2.show();start();
      const sec=$('#scr-room');
      sec.innerHTML='<button class="btn sm back" id="cb2">&laquo; SALIR</button>'
      +'<div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center">'
      +['mount|MONTA\u00D1A','valley|VALLE','ocean|OC\u00C9ANO','border|FRONTERA','city|CIUDAD','flame|CONFLICTO','troop|TROPA','ally|ALIANZA','play|\u25B6 SIMULAR','reset|RESET'].map(s=>{
        const[tk,nm]=s.split('|');
        return '<button class="btn sm '+(tk==='play'?'green':tk==='flame'?'red':'')+'" data-tool="'+tk+'">'+nm+'</button>';
      }).join('')+'</div>';
      $('#cb2').onclick=()=>go('sim');
      sec.style.pointerEvents='none';
      $$('[data-tool]',sec).forEach(b=>{b.style.pointerEvents='auto';b.onclick=()=>{
        tool=b.dataset.tool;oceanMode=false;SFX.uiTap();
        if(tool==='reset'){start();toast('MAPA','Lienzo nuevo','',2000);}
        if(tool==='play'){playing=true;simT=0;
          if(!flames.length)toast('CONSTRUCTOR','Arrastra primero iconos de CONFLICTO al mapa','bad');
          else toast('SIMULACI\u00D3N','Las tropas marchan hacia los focos...','',3000);}
      };});
    },
    exit(){G2.hide();$('#scr-room').style.pointerEvents='';},
    update(dt){
      if(!G2.on)return;
      if(playing)simulate(dt);
      if(Pointer.down&&!isUI(document.elementFromPoint(Pointer.x,Pointer.y)||document.body)){
        const y=Pointer.y;
        if(tool==='mount'||tool==='valley'||tool==='ocean')paint(Pointer.x,y);
        else if(tool==='border'){borders.push({x:Pointer.x,y});if(borders.length>240)borders.shift();}
        else if(tool==='ally'&&Pointer.justDown){
          const c=nearestCity(Pointer.x,Pointer.y,60);
          if(c){
            if(allyFrom&&allyFrom!==c){alliances.push([allyFrom,c]);allyFrom=null;SFX.bell();}
            else allyFrom=c;
          }
        }
      }
      if(tool==='city'&&Pointer.justDown&&!isUI(document.elementFromPoint(Pointer.x,Pointer.y)||document.body)){
        cities.push({x:Pointer.x,y:Pointer.y,n:'C'+(cities.length+1)});SFX.pop();FX.sparks(Pointer.x,Pointer.y,8,'0,255,135');
      }
      if(tool==='flame'&&Pointer.justDown){
        flames.push({x:Pointer.x,y:Pointer.y,ph:rnd(0,6)});SFX.explosion();Shake.add(3,200);
      }
      if(tool==='troop'&&Pointer.justDown){troops.push({x:Pointer.x,y:Pointer.y});SFX.uiTap();}
      draw();
    }
  });
  function terrainColor(v){
    if(v<.15)return '#123a6b';
    if(v<.3)return '#1d4a34';
    if(v<.55)return '#2c4a2c';
    if(v<.75)return '#5a5142';
    return '#8a8a92';
  }
  function draw(){
    const ctx=G2.ctx,W=G2.w,H=G2.h;
    const cw=W/GC,chh=H/GR;
    const top=64;
    for(let r=0;r<GR;r++)for(let c=0;c<GC;c++){
      ctx.fillStyle=terrainColor(hmap[r][c]);
      ctx.fillRect(c*cw,top+r*chh,cw+1,chh+1);
    }
    ctx.strokeStyle='rgba(240,240,240,.6)';ctx.lineWidth=2;ctx.beginPath();
    borders.forEach((b,i)=>{if(i===0)ctx.moveTo(b.x,b.y);else ctx.lineTo(b.x,b.y);});ctx.stroke();ctx.lineWidth=1;
    cities.forEach(c=>{
      ctx.fillStyle='#F0F0F0';ctx.fillRect(c.x-3,c.y-5,6,8);
      ctx.fillStyle='rgba(255,194,75,.9)';ctx.font='9px Rajdhani';
      ctx.fillText(c.n,c.x+6,c.y-4);
    });
    flames.forEach(f=>{
      f.ph+=.1;
      for(let i=0;i<3;i++){
        const h=8+Math.sin(f.ph+i*2)*4;
        ctx.fillStyle=i===0?'rgba(255,59,48,.9)':i===1?'rgba(255,122,42,.8)':'rgba(255,194,75,.9)';
        ctx.beginPath();ctx.moveTo(f.x,f.y);
        ctx.quadraticCurveTo(f.x-4,f.y-h*.6,f.x+Math.sin(f.ph+i)*3,f.y-h);
        ctx.quadraticCurveTo(f.x+4,f.y-h*.6,f.x,f.y);ctx.fill();
      }
    });
    ctx.fillStyle='#1E90FF';
    troops.forEach(t=>{ctx.beginPath();ctx.arc(t.x,t.y,4,0,7);ctx.fill();
      ctx.strokeStyle='rgba(240,240,240,.6)';ctx.stroke();});
    ctx.strokeStyle='rgba(0,255,135,.8)';
    alliances.forEach(a=>{ctx.beginPath();ctx.moveTo(a[0].x,a[0].y);ctx.lineTo(a[1].x,a[1].y);ctx.stroke();});
    ctx.fillStyle='rgba(240,240,240,.9)';ctx.font='12px Rajdhani';
    ctx.fillText('HERRAMIENTA: '+tool.toUpperCase()+' \u00B7 ciudades '+cities.length+' \u00B7 conflictos '+flames.length+' \u00B7 tropas '+troops.length,10,20);
    if(tool==='ally'&&allyFrom){ctx.fillStyle='rgba(0,255,135,.9)';ctx.fillText('elige la segunda ciudad para la alianza',10,38);}
  }
})();
