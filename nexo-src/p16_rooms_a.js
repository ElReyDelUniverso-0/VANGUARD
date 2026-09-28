/* ================= LIENZO 2D COMPARTIDO ================= */
const G2=(function(){
  const cv=$('#game2d'),ctx=cv.getContext('2d');
  let onV=false;
  function resize(){cv.width=innerWidth;cv.height=innerHeight;}
  function show(){onV=true;cv.style.display='block';resize();}
  function hide(){onV=false;cv.style.display='none';}
  window.addEventListener('resize',resize);
  return{cv,ctx,show,hide,get on(){return onV},get w(){return innerWidth},get h(){return innerHeight}};
})();

/* ================= EXPEDIENTE OMEGA ================= */
function checkOmega(){
  if(!P.omega&&P.files.length>=10){
    P.omega=true;
    addCoins(500,'Expediente Omega');addXP(250);
    toast('EXPEDIENTE OMEGA','10 archivos: desbloqueaste el documento prohibido','gold',6000);
    openModal('EXPEDIENTE OMEGA','<p class="small">Diez piezas de la verdad. El Omega habla de un patr\u00F3n: cada crisis del \u00FAltimo siglo fue precedida por <b>el mismo tipo de se\u00F1al</b>. Sigue interceptando.</p>');
    FX.confetti(80);SFX.win();save();
  }
}

/* ================= SALA DE MISIONES ================= */
(function(){
  const qbank={};
  function ent(s){const t=document.createElement('textarea');t.innerHTML=s;return t.value;}
  function missionList(){
    const cs=(DATA.countries.length?DATA.countries:FALLBACK_COUNTRIES).filter(c=>c.cap);
    const out=[];
    const hot=DATA.news.slice(0,6);
    for(let i=0;i<3;i++){
      const n=hot[i]||null;
      const c=cs.length?pick(cs):pick(FALLBACK_COUNTRIES);
      out.push({id:'m'+i,news:n,country:c,reward:irnd(60,180),done:false,staked:0,pred:null});
    }
    return out;
  }
  let missions=missionList();
  function quizFor(c){
    if(!c||!c.cap)return null;
    const others=(DATA.countries.length?DATA.countries:FALLBACK_COUNTRIES).filter(x=>x.cap&&x.c2!==c.c2);
    const opts=[c.cap,pick(others).cap,pick(others).cap].sort(()=>Math.random()-.5);
    return{q:'\u00BF Cu\u00E1l es la capital de '+c.n+' ?',opts,ok:c.cap};
  }
  function render(){
    const sec=$('#scr-misiones');
    sec.innerHTML='<button class="btn sm back" id="mb">&laquo; HANGAR</button>'
    +'<h2 class="pt">SALA DE MISIONES</h2>'
    +'<p class="small" style="margin-bottom:10px">Arrastra una ficha a la <b style="color:var(--blue)">MESA DE AN\u00C1LISIS</b> para abrir el dossier. '+(IS_MOBILE?'Mant\u00E9n y arrastra.':'Clic sostenido y arrastra.')+'</p>'
    +'<div style="display:flex;gap:14px;align-items:flex-start;flex-wrap:wrap">'
    +'<div id="cardTray" style="display:flex;gap:10px;flex-wrap:wrap"></div>'
    +'<div id="dropZone" class="panel holo" style="width:220px;min-height:220px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;border-style:dashed;border-color:var(--blue)">'
    +'<div class="ttl" style="color:var(--blue)">MESA DE AN\u00C1LISIS</div><div class="small" style="margin-top:6px">suelta aqu\u00ED la ficha</div></div>'
    +'</div>'
    +'<div class="sep"></div><div class="small">Misiones resueltas: <b class="num">'+P.missionDone+'</b> \u00B7 Nuevas fichas cada visita. Las noticias son <b>reales</b> (GDELT en vivo).</div>';
    $('#mb').onclick=()=>go('hangar');
    const tray=$('#cardTray');
    missions.forEach((m,i)=>{
      if(m.done)return;
      const d=document.createElement('div');d.className='missionCard';d.dataset.i=i;
      d.innerHTML='<div class="mcT">'+(m.news?'\u00C9XITO EN VIVO':'DOSSIER FR\u00CDO')+'</div>'
      +'<div class="mcD">'+esc(m.news?m.news.title.slice(0,72):'Patr\u00F3n inusual en '+m.country.n+'. El an\u00E1lisis puede revelar el pr\u00F3ximo movimiento.')+'</div>'
      +'<div class="mcR"><span class="tag g">+'+m.reward+' '+IC+'</span><span class="tag">'+(m.country.c2||'??')+'</span></div>';
      tray.appendChild(d);
      dragCard(d,m);
    });
  }
  function dragCard(el,m){
    let drag=false,ox=0,oy=0,ghost=null;
    el.addEventListener('pointerdown',e=>{
      drag=true;ox=e.clientX-el.getBoundingClientRect().left;oy=e.clientY-el.getBoundingClientRect().top;
      el.setPointerCapture&&el.setPointerCapture(e.pointerId);
    });
    el.addEventListener('pointermove',e=>{
      if(!drag)return;
      if(!ghost){
        ghost=el.cloneNode(true);ghost.style.position='fixed';ghost.style.zIndex=35;ghost.style.pointerEvents='none';
        ghost.style.width=el.offsetWidth+'px';document.body.appendChild(ghost);el.style.opacity=.3;
      }
      ghost.style.left=(e.clientX-ox)+'px';ghost.style.top=(e.clientY-oy)+'px';
      const dz=$('#dropZone').getBoundingClientRect();
      const over=e.clientX>dz.left&&e.clientX<dz.right&&e.clientY>dz.top&&e.clientY<dz.bottom;
      $('#dropZone').style.borderColor=over?'var(--green)':'var(--blue)';
      el._over=over;el._lx=e.clientX;el._ly=e.clientY;
    });
    el.addEventListener('pointerup',e=>{
      drag=false;
      if(ghost){ghost.remove();ghost=null;}
      el.style.opacity=1;
      if(el._over){el._over=false;openDossier(m,el);}
      const dz=$('#dropZone');if(dz)dz.style.borderColor='var(--blue)';
    });
  }
  function openDossier(m,cardEl){
    const c=m.country;
    const quiz=quizFor(c);
    let html='<p class="small">'+'Fuente: <b>'+esc(m.news?m.news.domain:'VANGUARD OSINT')+'</b> \u00B7 objetivo geogr\u00E1fico: <b>'+esc(c.n)+'</b> <img src="'+flagURL(c.c2,40)+'" style="height:12px;vertical-align:middle"></p>'
    +'<div class="marco" style="margin:10px 0"><div style="font-size:13px;font-weight:600">'+esc(m.news?m.news.title:'Se\u00F1ales de actividad an\u00F3mala en '+c.n)+'</div></div>'
    +'<h3 class="ps">TAREA 1 \u00B7 CONOCIMIENTO DEL TERRENO</h3>';
    if(quiz){
      html+=quiz.opts.map((o,i)=>'<div class="qOpt" style="animation-delay:'+(i*.4)+'s" data-q="'+(o===quiz.ok?1:0)+'">'+esc(o)+'</div>').join('');
    }else{
      html+='<div class="small">Datos insuficientes del pa\u00EDs: tarea simplificada.</div><button class="btn blue sm" id="skipQ" style="margin:6px 0">CONTINUAR</button>';
    }
    html+='<h3 class="ps">TAREA 2 \u00B7 PREDICCI\u00D3N (apuesta '+IC+')</h3>'
    +'<div class="sw"><div class="swOpt" data-pred="up" style="border-color:var(--red)">\u25B2 ESCALAR\u00C1 (apuesta 30)</div>'
    +'<div class="swOpt" data-pred="down" style="border-color:var(--green)">\u25BC DESCALAR\u00C1 (apuesta 30)</div></div>'
    +'<div class="sep"></div><div id="dzStat" class="small">Completa las 2 tareas para quemar el dossier y cobrar <b>+'+m.reward+' '+IC+'</b> + XP.</div>';
    openModal('DOSSIER \u00B7 '+(c.c2||'??'),html);
    let qOk=!!m.qDone,pOk=!!m.pred;
    function tryFinish(){
      if(qOk&&pOk){
        $('#dzStat').innerHTML='<b style="color:var(--green)">DOSSIER COMPLETO. Quemando...</b>';
        setTimeout(()=>{
          closeModal();
          if(cardEl){cardEl.classList.add('burn');setTimeout(()=>render(),1200);}
          SFX.burn();
          const won=addCoins(m.reward,'misión');
          addXP(80);P.missionDone++;save();
          toast('MISI\u00D3N RESUELTA','+'+won+' '+IC+' \u00B7 +80 XP','gold');
          pushFeed('resolvi\u00F3 el dossier de '+c.n,'g');
          randomFeedEvent();
          Hangar.rewardRain(irnd(6,12),8);
          if(P.files.length===0||Math.random()<.4)setTimeout(()=>offerInterrog(c),1400);
        },1100);
      }
    }
    $$('#modalBody .qOpt').forEach(o=>{
      o.onclick=()=>{
        if(o.dataset.q==='1'){o.classList.add('ok');qOk=true;addXP(20);SFX.bell();}
        else{o.classList.add('no');SFX.fail();
          toast('CASI LO LOGRAS','Respuesta incorrecta: la capital correcta te dar\u00E1 la pista. Reintenta con otra ficha.','bad',4500);}
        tryFinish();
      };
    });
    const sq=$('#skipQ');if(sq)sq.onclick=()=>{qOk=true;tryFinish();};
    $$('#modalBody [data-pred]').forEach(b=>{
      b.onclick=()=>{
        if(P.coins<30){toast('SIN FONDOS','Necesitas 30 '+IC+' para apostar','bad');return;}
        $$('#modalBody [data-pred]').forEach(x=>x.classList.remove('swSel'));
        b.classList.add('swSel');
        m.pred=b.dataset.pred;pOk=true;addCoins(-30,'apuesta');
        const escUp=Math.random()<.45;
        setTimeout(()=>{
          if((m.pred==='up')===escUp){const prize=90;addCoins(prize,'predicción acertada');
            toast('PREDICCI\u00D3N ACERTADA','+'+prize+' '+IC,'good');addXP(30);World.bump(escUp?1.2:-.8);}
          else{toast('PREDICCI\u00D3N FALLIDA','El mercado movi\u00F3 '+(escUp?'al alza':'a la baja'), 'bad');World.bump(escUp?1.4:-.5);}
          tryFinish();
        },900);
      };
    });
    tryFinish();
  }
  registerRoom('misiones',{section:'scr-misiones',enter(){Joy.enabled=false;render();},exit(){}});
})();

/* ================= BIBLIOTECA SECRETA: EXCAVACI\u00D3N ================= */
const BIBLIO_ITEMS=[
  {img:'/assets/wiki/war-ww1.jpg',t:'Tratado de Versalles (1919)',txt:'El documento que redibuj\u00F3 Europa. Las reparaciones sembraron la siguiente guerra.',layer:0},
  {img:'/assets/wiki/leader-churchill.jpg',t:'Memorias de W. Churchill',txt:'"Nunca tantos debieron tanto a tan pocos". Notas originales del primer ministro.',layer:0},
  {img:'/assets/wiki/era-roma.jpg',t:'Cr\u00F3nicas del Imperio Romano',txt:'Las legiones mov\u00EDan fronteras con el mismo c\u00E1lculo de fuerzas que hoy.',layer:1},
  {img:'/assets/wiki/war-fria.jpg',t:'Telegrama de la Guerra Fr\u00EDa',txt:'Doctrina de contenci\u00F3n: el mundo entero cab\u00EDa en un tablero de dos colores.',layer:1,burned:true},
  {img:'/assets/wiki/leader-gandhi.jpg',t:'Cartas de M. Gandhi',txt:'La desobediencia civil como arma: sin un solo disparo, un imperio tembl\u00F3.',layer:1},
  {img:'/assets/wiki/war-ww2.jpg',t:'Cartograf\u00EDa de la II Guerra Mundial',txt:'Mapas de operaciones: cada flecha cost\u00F3 millones de vidas.',layer:2},
  {img:'/assets/wiki/era-egipto.jpg',t:'Papiros de Egipto',txt:'Los primeros tratados de paz conocidos datan de hace 3.300 a\u00F1os.',layer:2,burned:true},
  {img:'/assets/wiki/leader-kennedy.jpg',t:'Expediente Kennedy',txt:'13 d\u00EDas en octubre de 1962: el mundo estuvo a un paso del fin.',layer:2},
  {img:'/assets/wiki/war-vietnam.jpg',t:'Reportes de Vietnam',txt:'La primera guerra televisada: la opini\u00F3n p\u00FAblica se volvi\u00F3 un frente.',layer:3},
  {img:'/assets/wiki/leader-mandela.jpg',t:'Discursos de N. Mandela',txt:'27 a\u00F1os de c\u00E1rcel y despu\u00E9s, reconciliaci\u00F3n. La estrategia m\u00E1s larga.',layer:3}
];
(function(){
  const COLS=26,ROWS=16,LAYERS=4;
  let soil,layer,items,cw,ch,digAcc=0,revealed;
  function cellW(){return G2.w/COLS;}
  function cellH(){return (G2.h*.72)/ROWS;}
  function newLayer(){
    soil=[];revealed=[];
    for(let r=0;r<ROWS;r++){soil.push(new Array(COLS).fill(1));revealed.push(new Array(COLS).fill(false));}
    items=BIBLIO_ITEMS.filter(b=>b.layer===layer).map(b=>({...b,
      cx:irnd(3,COLS-4),cy:irnd(2,ROWS-3),cells:0,found:false,imgOk:true}));
    if(layer===LAYERS-1)items.push({chest:true,t:'COFRE DEL OR\u00C1CULO',txt:'Una carta de rareza m\u00E1xima duerme aqu\u00ED.',cx:irnd(5,COLS-6),cy:irnd(3,ROWS-4),cells:0,found:false});
    items.forEach(it=>{
      it.area=[];
      const w=it.chest?3:2,h=it.chest?2:2;
      for(let dx=0;dx<w;dx++)for(let dy=0;dy<h;dy++)it.area.push([it.cx+dx,it.cy+dy]);
      it.total=it.area.length;
    });
  }
  function digAt(px,py){
    const radius=layer>=2?2.1:2.6;
    let removed=0;
    const cwv=cellW(),chv=cellH();
    const cr=Math.floor(px/cwv),cc=Math.floor(py/chv);
    for(let r=Math.max(0,cr-3);r<Math.min(ROWS,cr+4);r++)
      for(let c=Math.max(0,cc-3);c<Math.min(COLS,cc+4);c++){
        if(Math.hypot(r-cr,c-cc)>radius)continue;
        if(soil[r][c]>0){soil[r][c]=0;removed++;}
      }
    if(removed){
      items.forEach(it=>{
        if(it.found)return;
        let cleared=0;
        it.area.forEach(([r,c])=>{if(r<ROWS&&c<COLS&&soil[r][c]===0)cleared++;});
        if(cleared/it.total>=.8)revealItem(it,px,py);
      });
    }
    return removed;
  }
  function revealItem(it,px,py){
    it.found=true;
    FX.sparks(px,py,20,'255,194,75');FX.rings(px,py,1.2,2);
    SFX.bell();Shake.add(2,150);
    if(it.chest){
      const card={id:'c'+now(),name:'OR\u00C1CULO PRIMIGENIO',stars:5,ed:'\u00DANICA',t:now()};
      P.cards.push(card);addCoins(250,'cofre');addXP(200);
      openModal('COFRE DEL OR\u00C1CULO','<div class="holo marco" style="text-align:center;padding:20px"><div class="ttl" style="color:var(--gold);font-size:16px">CARTA 5&#9733;</div><div class="ttl" style="font-size:20px;margin:8px 0">OR\u00C1CULO PRIMIGENIO</div><div class="small">Rareza m\u00E1xima \u00B7 part\u00EDculas de universo incluidas</div></div>');
      save();return;
    }
    const file={t:now(),n:it.t,txt:it.txt,img:it.img,kind:'dig'};
    P.files.push(file);addXP(40+layer*20);addCoins(20+layer*15,'excavación');
    save();checkOmega();
    openModal('DOCUMENTO EXHUMADO',
      '<img class="wsImg" src="'+it.img+'" style="'+(it.burned?'filter:sepia(.7) contrast(1.2);clip-path:polygon(0 0,100% 0,100% 62%,58% 100%,0 100%);':'')+'">'
      +(it.burned?'<div class="tag r" style="margin-top:6px">PARCIALMENTE QUEMADO</div>':'')
      +'<h3 class="ps" style="color:var(--gold)">'+esc(it.t)+'</h3><p class="small">'+esc(it.txt)+'</p>'
      +'<p class="small dim">Capa '+(layer+1)+' \u00B7 Wikimedia Commons \u00B7 guardado en tu Biblioteca</p>');
    pushFeed('exhum\u00F3 "'+it.t+'" en la Biblioteca Secreta','y');
  }
  function draw(){
    const ctx=G2.ctx,W=G2.w,H=G2.h;
    ctx.clearRect(0,0,W,H);
    const cwv=cellW(),chv=cellH();
    const tone=['#241a10','#1c1710','#141418','#0d0d12'][layer];
    for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){
      const v=soil[r][c];
      ctx.fillStyle=v>0?tone:'rgba(8,10,16,.9)';
      if(v>0){ctx.globalAlpha=.35+ (r%2)*.12;ctx.fillRect(c*cwv,r*chv,cwv+1,chv+1);ctx.globalAlpha=1;}
    }
    ctx.strokeStyle='rgba(255,255,255,.04)';
    for(let r=0;r<=ROWS;r++){ctx.beginPath();ctx.moveTo(0,r*chv);ctx.lineTo(W,r*chv);ctx.stroke();}
    /* brillo de objetos enterrados (pista sutil) */
    items.forEach(it=>{if(!it.found){
      const cx=it.cx*cwv+cwv,cy=it.cy*chv+chv;
      const gl=ctx.createRadialGradient(cx,cy,2,cx,cy,34);
      gl.addColorStop(0,it.chest?'rgba(255,194,75,.35)':'rgba(178,107,255,.22)');
      gl.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=gl;ctx.fillRect(cx-36,cy-36,72,72);
    }});
    ctx.fillStyle='rgba(240,240,240,.85)';ctx.font='12px Rajdhani';
    ctx.fillText('CAPA '+(layer+1)+'/'+LAYERS+' \u00B7 '+(layer>=2?'excavaci\u00F3n lenta y profunda':'tierra suelta'),12,H-14);
    ctx.fillText('Arrastra el dedo o el cursor para excavar',12,H-32);
  }
  registerRoom('biblio',{section:'scr-biblio',
    enter(){
      Joy.enabled=false;
      layer=0;newLayer();G2.show();
      const sec=$('#scr-biblio');
      sec.innerHTML='<button class="btn sm back" id="bb">&laquo; HANGAR</button>'
      +'<h2 class="pt">BIBLIOTECA SECRETA \u00B7 YACIMIENTO</h2>'
      +'<p class="small">Excava capa por capa. Los documentos son reales (Wikimedia). En la capa profunda duerme el cofre.</p>'
      +'<div class="digWrap" style="flex:1;position:relative;min-height:40vh" id="digArea"></div>'
      +'<div class="rowline"><span class="small">Archivos: <b>'+P.files.length+'</b>/10 para el Expediente Omega</span>'
      +'<button class="btn sm" id="shelfBtn">BIBLIOTECA PERSONAL</button></div>';
      $('#bb').onclick=()=>go('hangar');
      $('#shelfBtn').onclick=showShelf;
    },
    exit(){G2.hide();},
    update(dt){
      if(!G2.on)return;
      if(Pointer.down&&Pointer.moved>0){
        digAcc+=dt;
        if(digAcc>.05){digAcc=0;
          const removed=digAt(Pointer.x,Pointer.y-G2.cv.getBoundingClientRect().top);
          if(removed){if(Math.random()<.4)SFX.pick();if(Math.random()<.3)SFX.dirt();FX.dust(Pointer.x,Pointer.y,4);}
        }
      }
      draw();
    },
    onPointerDownAt(x,y){digAt(x,y);}
  });
  function showShelf(){
    const files=P.files.map(f=>'<div class="fileRow">'+(f.img?'<img src="'+f.img+'">':'<div style="width:52px;height:52px;border-radius:8px;background:#182036;display:flex;align-items:center;justify-content:center">'+(f.kind==='sat'?'SAT':'ESP')+'</div>')
      +'<div><div style="font-size:12px">'+esc(f.n||'informe')+'</div><div class="small">'+esc((f.txt||'').slice(0,70))+'</div></div></div>').join('');
    openModal('BIBLIOTECA PERSONAL',files||'<div class="small">Vac\u00EDa. Excava, esp\u00EDa, fotografia e interroga para llenarla.</div>');
  }
  window.__VG_showShelf=showShelf;
})();

/* ================= SALA DE INTERROGACI\u00D3N ================= */
const LEADERS=[
  {n:'Winston Churchill',img:'/assets/wiki/leader-churchill.jpg',era:'II Guerra Mundial',qa:[
    {q:'A\u00F1o en que asumi\u00F3 como primer ministro brit\u00E1nico',o:['1940','1936','1945'],ok:0},
    {q:'Su famosa pol\u00EDtica ante la Alemania nazi',o:['Apaciguamiento','Resistencia total','Neutralidad'],ok:1},
    {q:'Pa\u00EDs que ide\u00F3 con Roosevelt y Stalin el orden de posguerra',o:['La ONU','La OTAN','La UE'],ok:0}]},
  {n:'Mahatma Gandhi',img:'/assets/wiki/leader-gandhi.jpg',era:'Independencia de la India',qa:[
    {q:'Su m\u00E9todo de lucha principal',o:['Sabotaje','Desobediencia civil','Guerra de guerrillas'],ok:1},
    {q:'A\u00F1o del final del Raj brit\u00E1nico',o:['1947','1950','1935'],ok:0},
    {q:'Marcha famosa contra el impuesto a...',o:['La sal','El t\u00E9','El algod\u00F3n'],ok:0}]},
  {n:'Nelson Mandela',img:'/assets/wiki/leader-mandela.jpg',era:'Fin del apartheid',qa:[
    {q:'A\u00F1os que pas\u00F3 prisionero',o:['10','18','27'],ok:2},
    {q:'Su m\u00E9todo de reconciliaci\u00F3n',o:['Comisi\u00F3n de la Verdad','Expulsi\u00F3n masiva','Refer\u00E9ndum unilateral'],ok:0},
    {q:'A\u00F1o elegido presidente',o:['1990','1994','1999'],ok:1}]},
  {n:'Mija\u00EDl Gorbachov',img:'/assets/wiki/leader-gorbachov.jpg',era:'Ca\u00EDda del Muro',qa:[
    {q:'Sus reformas se llamaban...',o:['Perestroika y Glásnost','Dotrina Brezhnev','Plan Marshall'],ok:0},
    {q:'A\u00F1o de la ca\u00EDda del Muro de Berl\u00EDn',o:['1985','1989','1991'],ok:1},
    {q:'Su acuerdo nuclear clave con Reagan',o:['START','INF','SALT II'],ok:1}]}
];
function offerInterrog(c){
  if(roomName()==='interrog')return;
  openModal('INTELIGENCIA SOBRE L\u00CDDER','<p class="small">Tu red encontr\u00F3 algo sobre un l\u00EDder hist\u00F3rico clave. \u00BFInterrogar su holograma en la sala especial?</p>'
  +'<button class="btn blue" id="goInter" style="margin-top:10px;width:100%">ABRIR SALA DE INTERROGACI\u00D3N</button>');
  $('#goInter').onclick=()=>{closeModal();go('interrog');};
}
(function(){
  let leader,round,revealedLines,hState;
  function start(){
    leader=pick(LEADERS);round=0;revealedLines=0;
    hState={op:1,lines:[]};
    render();
  }
  function render(){
    const sec=$('#scr-room');
    sec.innerHTML='<button class="btn sm back" id="ib">&laquo; SALIR</button>'
    +'<h2 class="pt">SALA DE INTERROGACI\u00D3N</h2>'
    +'<p class="small">Sujeto: <b style="color:var(--blue)">'+esc(leader.n)+'</b> \u00B7 '+esc(leader.era)+' \u00B7 holograma inestable</p>'
    +'<div style="display:flex;gap:14px;flex-wrap:wrap;align-items:flex-start">'
    +'<div style="position:relative;width:190px;flex-shrink:0">'
    +'<div id="holoBox" style="position:relative;border:1px solid var(--blue);border-radius:12px;overflow:hidden">'
    +'<img src="'+leader.img+'" style="width:100%;display:block;filter:hue-rotate(160deg) saturate(1.6) contrast(1.3);opacity:'+hState.op+'">'
    +'<div style="position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(30,144,255,.12) 0 2px,transparent 2px 4px);pointer-events:none"></div>'
    +'</div>'
    +'<div class="small" style="margin-top:6px" id="holoStat">Estabilidad: <b class="num">'+Math.round(hState.op*100)+'%</b></div>'
    +'</div>'
    +'<div style="flex:1;min-width:230px">'
    +'<div class="panel">'
    +'<div class="rng"><label>TEMPERATURA</label><input type="range" id="rTemp" min="0" max="100" value="50"></div>'
    +'<div class="rng"><label>LUZ</label><input type="range" id="rLuz" min="0" max="100" value="60"></div>'
    +'<div class="rng"><label>PRESI\u00D3N PSI.</label><input type="range" id="rPre" min="0" max="100" value="30"></div>'
    +'<div class="small" id="envHint"></div>'
    +'</div>'
    +'<div id="qArea" style="margin-top:10px"></div>'
    +'</div></div>'
    +'<div id="classified" style="margin-top:10px"></div>';
    $('#ib').onclick=()=>go('hangar');
    ['rTemp','rLuz','rPre'].forEach(id=>{
      $('#'+id).oninput=()=>{
        const temp=+$('#rTemp').value,luz=+$('#rLuz').value,pre=+$('#rPre').value;
        $('#holoBox').style.filter='brightness('+(.5+luz/100)+') hue-rotate('+(120+temp*1.4)+'deg)';
        $('#envHint').textContent=pre>75?'Presi\u00F3n extrema: el holograma puede cerrarse (evasi\u00F3n)':'Ajusta el ambiente para desestabilizar al sujeto';
      };
    });
    ask();
  }
  function ask(){
    const q=leader.qa[round];
    const pre=+$('#rPre').value;
    const evasive=pre>75&&Math.random()<.3;
    $('#qArea').innerHTML='<div class="small" style="margin-bottom:6px">PREGUNTA '+(round+1)+'/3'+(evasive?' \u00B7 <b style="color:var(--red)">EL SUJETO SE VUELVE EVASIVO</b>':'')+'</div>'
      +(evasive?'<div class="marco" style="border-color:var(--red)">"\u00BF...puedes repetir la pregunta?"</div>'
      :q.o.map((o,i)=>'<div class="qOpt" style="animation-delay:'+(i*.5)+'s" data-ok="'+(i===q.ok?1:0)+'">'+esc(o)+'</div>').join(''));
    if(evasive){setTimeout(ask,2200);return;}
    $$('#qArea .qOpt').forEach(o=>{
      o.onclick=()=>{
        if(o.dataset.ok==='1'){
          o.classList.add('ok');SFX.bell();addXP(25);
          hState.op=Math.max(.35,hState.op-.22);
          revealedLines++;
          const secret=['Movi\u00F3 fondos por el banco de '+pick(['Ginebra','Basilea','Luxemburgo']),
            'Se reuni\u00F3 en secreto con '+pick(['un agregado sovi\u00E9tico','un emisario vaticano','un esp\u00EDa doble']),
            'Firm\u00F3 una orden que nunca entr\u00F3 en los archivos oficiales',
            'Sabi\u00F3 del ataque '+irnd(2,6)+' d\u00EDas antes'][revealedLines-1]||'Detalle clasificado recuperado';
          $('#holoStat').innerHTML='Estabilidad: <b class="num" style="color:var(--red)">'+Math.round(hState.op*100)+'%</b> \u00B7 capa revelada';
          $('#classified').innerHTML+='<div class="marco" style="border-color:var(--gold);margin-top:6px"><span class="tag y">CLASIFICADO</span><div class="mono small" id="cw'+revealedLines+'"></div></div>';
          typeText($('#cw'+revealedLines),secret,30);
          $('#holoBox img').style.opacity=hState.op;
          round++;
          if(round>=3)finish(true);else setTimeout(ask,1400);
        }else{
          o.classList.add('no');SFX.fail();vibrate(40);
          hState.op=Math.min(1,hState.op+.1);
          $('#holoBox img').style.opacity=hState.op;
          World.bump(.4,'sujeto a la defensiva');
          $('#holoStat').innerHTML='Estabilidad: <b class="num">'+Math.round(hState.op*100)+'%</b> \u00B7 evasivo';
        }
      };
    });
  }
  function finish(){
    const file={t:now(),n:'Interrogatorio \u00B7 '+leader.n,txt:'Archivo psicol\u00F3gico completo del sujeto ('+leader.era+').',img:leader.img,kind:'interrog'};
    P.files.push(file);save();checkOmega();
    addCoins(200,'interrogatorio');addXP(150);
    for(let i=0;i<4;i++)setTimeout(()=>FX.firework(rnd(80,innerWidth-80),rnd(100,innerHeight*.6)),i*300);
    SFX.win();SFX.tts('Interrogación completada. El archivo ha sido añadido a tu biblioteca.');
    toast('INTERROGATORIO COMPLETO','+200 '+IC+' \u00B7 archivo exclusivo en Biblioteca','gold',5200);
    pushFeed('quebr\u00F3 la voluntad del holograma de '+leader.n,'y');
    setTimeout(()=>go('biblio'),1600);
  }
  registerRoom('interrog',{section:'scr-room',enter(){Joy.enabled=false;start();},exit(){}});
})();
