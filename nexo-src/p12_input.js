/* ================= INPUT UNIFICADO ================= */
const Keys={};
window.addEventListener('keydown',e=>{
  Keys[e.code]=true;
  SecretWord.check(e);
  Konami.check(e.code);
  if(activeRoom&&activeRoom.onKey)try{activeRoom.onKey(e);}catch(err){}
});
window.addEventListener('keyup',e=>{Keys[e.code]=false;});
const Key=c=>!!Keys[c];

const Pointer={x:innerWidth/2,y:innerHeight/2,px:innerWidth/2,py:innerHeight/2,dx:0,dy:0,down:false,
  vx:0,vy:0,speed:0,downX:0,downY:0,moved:0,downT:0,justDown:false,justUp:false,longPress:false,
  touch:false, pinch:null};
const Joy={active:false,bx:0,by:0,dx:0,dy:0,mag:0,enabled:false,id:null};
const Pinch={active:false,scale:1,delta:0,dist:0};
const Wind={x:0,y:0,level:0};
const Gyro={ok:false,x:0,y:0,z:0,beta:0,gamma:0};
const Mic={on:false,level:0,stream:null,analyser:null,buf:null,
  async start(){
    if(this.on)return true;
    try{
      this.stream=await navigator.mediaDevices.getUserMedia({audio:true});
      if(!SFX.resume()){}
      const ctx=new (window.AudioContext||window.webkitAudioContext)();
      const src=ctx.createMediaStreamSource(this.stream);
      this.analyser=ctx.createAnalyser();this.analyser.fftSize=512;
      this.buf=new Uint8Array(this.analyser.frequencyBinCount);
      src.connect(this.analyser);this._ctx=ctx;this.on=true;return true;
    }catch(e){toast('MICR\u00D3FONO','Permiso denegado. Usa el cursor para soplar.','bad');return false;}
  },
  stop(){if(this.stream){this.stream.getTracks().forEach(t=>t.stop());}if(this._ctx)try{this._ctx.close();}catch(e){}this.on=false;this.level=0;},
  update(){if(!this.on)return;this.analyser.getByteTimeDomainData(this.buf);
    let s=0;for(let i=0;i<this.buf.length;i++){const v=(this.buf[i]-128)/128;s+=v*v;}
    this.level=clamp(Math.sqrt(s/this.buf.length)*6,0,1);}
};
Loop.add(()=>Mic.update());

async function requestGyro(){
  try{
    if(typeof DeviceOrientationEvent!=='undefined'&&DeviceOrientationEvent.requestPermission){
      const r=await DeviceOrientationEvent.requestPermission();
      if(r!=='granted'){toast('GIROSCOPIO','Permiso denegado','bad');return false;}
    }
    Gyro.ok=true;toast('GIROSCOPIO','Control por inclinaci\u00F3n activado','good');return true;
  }catch(e){return false;}
}
window.addEventListener('deviceorientation',e=>{Gyro.beta=e.beta||0;Gyro.gamma=e.gamma||0;Gyro.z=e.alpha||0;Gyro.ok=Gyro.ok||e.beta!==null;});

/* evita scroll global pero permite .scroll */
document.addEventListener('touchmove',e=>{if(!e.target.closest('.scroll,input,textarea,[contenteditable]'))e.preventDefault();},{passive:false});

const joyEl=$('#joy'),joyKnob=$('#joyKnob');
function joyShow(x,y){joyEl.style.display='block';joyEl.style.left=(x-60)+'px';joyEl.style.top=(y-60)+'px';Joy.bx=x;Joy.by=y;Joy.active=true;}
function joyMove(x,y){let dx=x-Joy.bx,dy=y-Joy.by;const d=Math.hypot(dx,dy);
  if(d>52){dx=dx/d*52;dy=dy/d*52;}
  Joy.dx=dx/52;Joy.dy=dy/52;Joy.mag=Math.min(1,d/52);
  joyKnob.style.transform=`translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;}
function joyHide(){Joy.active=false;Joy.dx=Joy.dy=Joy.mag=0;Joy.id=null;joyEl.style.display='none';joyKnob.style.transform='translate(-50%,-50%)';}

let longPressTimer=null,activeTouches=new Map();
function isUI(t){return t.closest&&(t.closest('button,.chip,input,textarea,.qOpt,.navCell,.mktRow,.skillNode,a,.x,#modalBox,.toast,.fileRow,.missionCard,[data-ui]'));}

window.addEventListener('pointerdown',e=>{
  Pointer.justDown=true;Pointer.down=true;Pointer.downX=e.clientX;Pointer.downY=e.clientY;
  Pointer.moved=0;Pointer.downT=now();Pointer.longPress=false;Pointer.touch=e.pointerType==='touch';
  activeTouches.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(e.pointerType==='touch'&&activeTouches.size===2){
    const p=Array.from(activeTouches.values());
    Pinch.active=true;Pinch.dist=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);Pinch.delta=0;
    if(Joy.active&&Joy.id!==e.pointerId){} 
  }
  if(e.pointerType==='touch'&&Joy.enabled&&!Joy.active&&activeTouches.size<3&&!isUI(e.target)){
    Joy.id=e.pointerId;joyShow(e.clientX,e.clientY);
  }
  if(!isUI(e.target)){
    clearTimeout(longPressTimer);
    longPressTimer=setTimeout(()=>{
      if(Pointer.down&&Pointer.moved<14&&now()-Pointer.downT>340){
        Pointer.longPress=true;
        if(activeRoom&&activeRoom.onLongPress)try{activeRoom.onLongPress(Pointer.x,Pointer.y);}catch(err){}
      }
    },380);
  }
},{passive:true});
window.addEventListener('pointermove',e=>{
  Pointer.px=Pointer.x;Pointer.py=Pointer.y;
  Pointer.x=e.clientX;Pointer.y=e.clientY;
  Pointer.dx=Pointer.x-Pointer.px;Pointer.dy=Pointer.y-Pointer.py;
  Pointer.vx=Pointer.vx*.8+Pointer.dx*.2;Pointer.vy=Pointer.vy*.8+Pointer.dy*.2;
  Pointer.speed=Math.hypot(Pointer.vx,Pointer.vy);
  if(Pointer.down)Pointer.moved+=Math.hypot(Pointer.dx,Pointer.dy);
  if(activeTouches.has(e.pointerId))activeTouches.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(Pinch.active&&activeTouches.size===2){
    const p=Array.from(activeTouches.values());
    const d=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);
    Pinch.delta=d/Pinch.dist;Pinch.dist=d;
  }
  if(Joy.active&&e.pointerId===Joy.id)joyMove(e.clientX,e.clientY);
  if(activeRoom&&activeRoom.onPointerMove)try{activeRoom.onPointerMove(e);}catch(err){}
},{passive:true});
function endPointer(e){
  Pointer.justUp=true;Pointer.down=false;
  activeTouches.delete(e.pointerId);
  if(activeTouches.size<2)Pinch.active=false;
  clearTimeout(longPressTimer);
  if(e.pointerId===Joy.id)joyHide();
  if(activeRoom&&activeRoom.onPointerUp)try{activeRoom.onPointerUp(e);}catch(err){}
}
window.addEventListener('pointerup',endPointer,{passive:true});
window.addEventListener('pointercancel',endPointer,{passive:true});
window.addEventListener('wheel',e=>{
  if(activeRoom&&activeRoom.onWheel)try{activeRoom.onWheel(e.deltaY);}catch(err){}
},{passive:true});

/* viento virtual: velocidad del cursor */
Loop.add(dt=>{
  const lvl=clamp(Pointer.speed/38,0,1);
  Wind.x=lerp(Wind.x,Pointer.vx/16,.12);Wind.y=lerp(Wind.y,Pointer.vy/16,.12);
  Wind.level=Math.max(lvl*(Pointer.down?1.4:1),Mic.level);
  Pointer.justDown=false;Pointer.justUp=false;Pointer.longPress=false;
});

/* KONAMI + palabra secreta ORACULO */
const Konami={seq:['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','KeyB','KeyA'],i:0,
  check(code){
    if(code===this.seq[this.i]){this.i++;if(this.i===this.seq.length){this.i=0;konamiReward();}}
    else this.i=(code===this.seq[0])?1:0;
  }};
const SecretWord={buf:'',
  check(e){
    if(e.key&&e.key.length===1&&/[a-zA-Z]/.test(e.key)){
      this.buf=(this.buf+e.key.toUpperCase()).slice(-9);
      if(this.buf.endsWith('ORACULO')){this.buf='';oraculoSecret();}
    }
  }};
function konamiReward(){
  if(!P.konami){P.konami=true;addCoins(1000,'Konami');addXP(120);}
  else addCoins(150,'Konami');
  SFX.arcade();
  document.body.classList.add('arcade');
  toast('C\u00D3DIGO KONAMI','\u00A1MODO ARCADE 1986! +1000 '+IC+' \u00B7 30s de ne\u00F3n','gold',5000);
  pushFeed('activ\u00F3 el MODO ARCADE 1986 con el c\u00F3digo Konami','y');
  Hangar.dance&&Hangar.dance();
  setTimeout(()=>document.body.classList.remove('arcade'),30000);
  save();
}
function oraculoSecret(){
  if(P.island){openModal('BIBLIOTECA DEL OR\u00C1CULO','<div class="small">Ya conoces el camino. La isla te espera en el hangar, al norte.</div>');return;}
  openModal('BIBLIOTECA DEL OR\u00C1CULO','<div class="small">La palabra correcta abre un lugar que no aparece en ning\u00FAn mapa. <b style="color:var(--gold)">Camina al extremo norte del hangar</b> y busca la luz dorada.</div>');
  P.knownIsland=true;save();
  toast('SECRETO','Coordenadas ocultas desbloqueadas','gold');
}
