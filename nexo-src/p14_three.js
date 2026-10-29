/* ================= THREE.JS: MOTOR + INTRO + HANGAR ================= */
const ThreeEng=(function(){
  let renderer,camera,active=null,scenes={},ok=false;
  function init(){
    if(!window.THREE)return false;
    try{
      renderer=new THREE.WebGLRenderer({canvas:$('#gl3d'),antialias:!IS_MOBILE,powerPreference:'high-performance',alpha:true});
      /* PERF v69: pixelRatio contenido (1 móvil / 1.25 desktop) — antes 1.5/2 congelaba el hangar */
      renderer.setPixelRatio(Math.min(devicePixelRatio||1,IS_MOBILE?1:1.25));
      renderer.setSize(innerWidth,innerHeight);
      renderer.setClearColor(0x0A0A0F,1);
      camera=new THREE.PerspectiveCamera(60,innerWidth/innerHeight,.1,400);
      camera.position.set(0,3,10);
      ok=true;
      window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
      Loop.add(dt=>{if(active&&scenes[active]){const s=scenes[active];renderer.render(s.scene,camera);}});
      return true;
    }catch(e){console.error('three init',e);return false;}
  }
  function reg(name,obj){scenes[name]=obj;}
  function show(name){active=name;$('#gl3d').style.display=ok?'block':'none';}
  function hide(){active=null;$('#gl3d').style.display='none';}
  /* PERF v69: calidad progresiva — 1º ratio 1, luego 0.72 (el bucle llama 2 veces máx) */
  let _qStep=0;
  function lowQuality(){_qStep=Math.min(2,_qStep+1);if(ok)renderer.setPixelRatio(_qStep===1?1:.72);}
  return{init,reg,show,hide,lowQuality,ready:()=>ok,camera:()=>camera,renderer:()=>renderer};
})();
if(!ThreeEng.init())console.error('WebGL no disponible: modo degradado');

/* ------- utilidades de textura canvas ------- */
function makeTextTexture(title,sub,color){
  const c=document.createElement('canvas');c.width=256;c.height=384;
  const g=c.getContext('2d');
  g.fillStyle='rgba(6,9,18,.92)';g.fillRect(0,0,256,384);
  g.strokeStyle=color;g.lineWidth=4;g.strokeRect(6,6,244,372);
  g.strokeStyle='rgba(255,255,255,.15)';g.lineWidth=1;g.strokeRect(14,14,228,356);
  g.fillStyle=color;g.font='700 26px Orbitron, sans-serif';g.textAlign='center';
  const words=title.split(' ');let y=150;
  words.forEach(w=>{g.fillText(w,128,y);y+=32;});
  g.fillStyle='rgba(240,240,240,.75)';g.font='16px Rajdhani, sans-serif';
  g.fillText(sub||'',128,y+18);
  g.strokeStyle=color;g.globalAlpha=.7;
  g.beginPath();g.moveTo(40,60);g.lineTo(216,60);g.stroke();
  g.beginPath();g.moveTo(40,320);g.lineTo(216,320);g.stroke();
  const t=new THREE.CanvasTexture(c);return t;
}
function makeLabelSprite(text,color,scale){
  const c=document.createElement('canvas');c.width=256;c.height=64;
  const g=c.getContext('2d');
  g.fillStyle='rgba(8,11,20,.75)';g.fillRect(0,0,256,64);
  g.fillStyle=color;g.font='700 26px Rajdhani, sans-serif';g.textAlign='center';g.textBaseline='middle';
  g.fillText(text,128,34);
  const t=new THREE.CanvasTexture(c);
  const m=new THREE.SpriteMaterial({map:t,transparent:true,depthTest:false});
  const s=new THREE.Sprite(m);s.scale.set((scale||2.4), (scale||2.4)/4,1);
  return s;
}
const V3=(x,y,z)=>new THREE.Vector3(x,y,z);
function worldToScreen(v){
  const cam=ThreeEng.camera();const p=v.clone().project(cam);
  return{x:(p.x*.5+.5)*innerWidth,y:(-p.y*.5+.5)*innerHeight,behind:p.z>1};
}

/* ================= INTRO CINEMÁTICA (10s) ================= */
if(window.THREE){
(function buildIntro(){
  const scene=new THREE.Scene();
  scene.fog=new THREE.FogExp2(0x0A0A0F,0.02);
  const camT={t:0};
  /* estrellas */
  const starGeo=new THREE.BufferGeometry();
  const sp=new Float32Array(2200*3);
  for(let i=0;i<2200;i++){const r=rnd(30,140),a=rnd(0,Math.PI*2),b=rnd(-1,1);const s=Math.sqrt(1-b*b);
    sp[i*3]=r*s*Math.cos(a);sp[i*3+1]=r*b;sp[i*3+2]=r*s*Math.sin(a);}
  starGeo.setAttribute('position',new THREE.BufferAttribute(sp,3));
  const stars=new THREE.Points(starGeo,new THREE.PointsMaterial({color:0x9db8ff,size:.5,transparent:true,opacity:.9}));
  scene.add(stars);
  /* nebulosas */
  function nebulaTex(col){
    const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');
    const gr=g.createRadialGradient(128,128,10,128,128,128);
    gr.addColorStop(0,col+'0.55)');gr.addColorStop(.5,col+'0.18)');gr.addColorStop(1,col+'0)');
    g.fillStyle=gr;g.fillRect(0,0,256,256);
    return new THREE.CanvasTexture(c);
  }
  [['rgba(30,144,255,',-40,10,-60,60],['rgba(178,107,255,',50,-8,-80,80],['rgba(255,59,48,',0,20,-110,50]].forEach(n=>{
    const m=new THREE.Mesh(new THREE.PlaneGeometry(n[4],n[4]),
      new THREE.MeshBasicMaterial({map:nebulaTex(n[0]),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));
    m.position.set(n[1],n[2],n[3]);scene.add(m);
  });
  /* tierra */
  const earthGroup=new THREE.Group();scene.add(earthGroup);
  const earthMat=new THREE.MeshStandardMaterial({color:0x1a3a6a,roughness:.9,metalness:.1});
  const earth=new THREE.Mesh(new THREE.SphereGeometry(2.2,48,48),earthMat);
  earthGroup.add(earth);
  const loader=new THREE.TextureLoader();
  loader.load('/assets/globe/earth-blue-marble.jpg',t=>{t.anisotropy=4;earthMat.map=t;earthMat.color.set(0xffffff);earthMat.needsUpdate=true;},undefined,()=>{});
  const atm=new THREE.Mesh(new THREE.SphereGeometry(2.38,48,48),
    new THREE.MeshBasicMaterial({color:0x1E90FF,transparent:true,opacity:.16,side:THREE.BackSide,blending:THREE.AdditiveBlending}));
  earthGroup.add(atm);
  /* explosión naranja */
  const boomGeo=new THREE.BufferGeometry();
  const bp=new Float32Array(260*3),bv=[];
  for(let i=0;i<260;i++){bp[i*3]=0;bp[i*3+1]=0;bp[i*3+2]=0;bv.push(V3(rnd(-1,1),rnd(-1,1),rnd(-1,1)).normalize().multiplyScalar(rnd(.5,2.6)));}
  boomGeo.setAttribute('position',new THREE.BufferAttribute(bp,3));
  const boom=new THREE.Points(boomGeo,new THREE.PointsMaterial({color:0xff7a2a,size:.16,transparent:true,opacity:0,blending:THREE.AdditiveBlending}));
  boom.position.set(0,.4,2.1);earthGroup.add(boom);
  scene.add(new THREE.AmbientLight(0x334455,1.2));
  const sun=new THREE.DirectionalLight(0xffffff,1.4);sun.position.set(5,3,8);scene.add(sun);
  const rim=new THREE.DirectionalLight(0x1E90FF,.9);rim.position.set(-6,-2,-4);scene.add(rim);
  const INTRO_T=10;
  const obj={scene,hide3d:false,
    update(dt){
      const camera=ThreeEng.camera();
      camT.t+=dt;
      const k=camT.t;
      earth.rotation.y+=dt*.12;
      stars.rotation.y+=dt*.008;
      if(k<3){camera.position.set(0,0,15-k*.8);camera.lookAt(0,0,0);}
      else if(k<6.5){const u=(k-3)/3.5;camera.position.set(0,1.2*u,15-3.8-9.4*u*u);camera.lookAt(0,0,0);}
      else if(k<8.2){const u=(k-6.5)/1.7;earth.rotation.y=lerp(earth.rotation.y,2.4,.04);
        camera.position.set(Math.sin(k*2)*.4,1.2,5.9-1.2*u);camera.lookAt(0,.4,2.1);
        boom.material.opacity=Math.min(1,u*1.5)* (u<.85?1:(1-(u-.85)/.15)*.4);
        for(let i=0;i<260;i++){const v=bv[i];bp[i*3]+=v.x*dt;bp[i*3+1]+=v.y*dt;bp[i*3+2]+=v.z*dt;}
        boomGeo.attributes.position.needsUpdate=true;
      }else{camera.position.z=4.7;}
      if(!obj._s1&&k>2.2){obj._s1=1;SFX.whoosh();}
      if(!obj._s2&&k>6.5){obj._s2=1;SFX.alarm();Flash.red(.28,200);Shake.add(5,500);vibrate(80);}
      if(!obj._s3&&k>8.6){obj._s3=1;Flash.white(.9,240);SFX.explosion();}
      if(k>=INTRO_T)finishIntro();
    },
    enter(){camT.t=0;obj._s1=obj._s2=obj._s3=0;boom.material.opacity=0;
      for(let i=0;i<260;i++){bp[i*3]=0;bp[i*3+1]=0;bp[i*3+2]=0;}
      boomGeo.attributes.position.needsUpdate=true;
      ThreeEng.show('intro');ThreeEng.reg('intro',{scene:scene,update:dt=>obj.update(dt)});introUIStart();}
  };
  regIntro(obj);
})();
}else{
  regIntro({enter(){setTimeout(()=>finishIntro(),400);}});
}
let introUIStart=()=>{},finishIntro=()=>{};

/* ================= HANGAR 3D ================= */
const Hangar=(function(){
  if(!window.THREE){
    registerRoom('hangar',{enter(){toast('3D','El motor WebGL no carg\u00F3 (CDN). Recarga la p\u00E1gina.','bad');},exit(){},update(){}});
    return{celebrate(){},dance(){},rewardRain(){},syncCompanion(){},agent:null,coins:[]};
  }
  const scene=new THREE.Scene();
  scene.fog=new THREE.FogExp2(0x0A0A0F,.028);
  scene.add(new THREE.AmbientLight(0x8899bb,.85));
  const hemi=new THREE.HemisphereLight(0x3a5a9f,0x0a0a12,.9);scene.add(hemi);
  const dir=new THREE.DirectionalLight(0xfff2df,.85);dir.position.set(6,12,4);scene.add(dir);
  const FXW=44,FXD=30,WALL_H=6,R_AGENT=.45;
  const obstacles=[]; /* {x,z,w,d} */
  /* suelo por zonas — PERF v69: Lambert en vez de Standard (PBR caro con muchas luces) */
  function floorMat(c1,rough,op){return new THREE.MeshLambertMaterial({color:c1,transparent:!!op,opacity:op||1});}
  const carpet=new THREE.Mesh(new THREE.PlaneGeometry(14,FXD),floorMat(0x141423,.98));
  carpet.rotation.x=-Math.PI/2;carpet.position.set(-15,0,0);scene.add(carpet);
  const metal=new THREE.Mesh(new THREE.PlaneGeometry(16,FXD),floorMat(0x1a2233,.55));
  metal.rotation.x=-Math.PI/2;metal.position.set(0,0,0);scene.add(metal);
  const glassBase=new THREE.Mesh(new THREE.PlaneGeometry(14,FXD),floorMat(0x101828,.5));
  glassBase.rotation.x=-Math.PI/2;glassBase.position.set(15,0,0);scene.add(glassBase);
  const glass=new THREE.Mesh(new THREE.PlaneGeometry(13.4,FXD-1),
    new THREE.MeshBasicMaterial({color:0x1E90FF,transparent:true,opacity:.14,blending:THREE.AdditiveBlending,depthWrite:false}));
  glass.rotation.x=-Math.PI/2;glass.position.set(15,.02,0);scene.add(glass);
  const grid=new THREE.GridHelper(46,23,0x1E90FF,0x13203a);
  grid.material.transparent=true;grid.material.opacity=.24;grid.position.y=.01;scene.add(grid);
  /* paredes */
  const wallMat=new THREE.MeshLambertMaterial({color:0x11162a});
  [[0,-FXD/2-.5,FXW+2,1],[0,FXD/2+.5,FXW+2,1],[-FXW/2-.5,0,1,FXD+2],[FXW/2+.5,0,1,FXD+2]].forEach(w=>{
    const m=new THREE.Mesh(new THREE.BoxGeometry(w[2],WALL_H,w[3]),wallMat);
    m.position.set(w[0],WALL_H/2,w[1]);scene.add(m);
  });
  /* tiras de luz */
  const stripMat=new THREE.MeshBasicMaterial({color:0x1E90FF});
  for(let i=-2;i<=2;i++){const s=new THREE.Mesh(new THREE.BoxGeometry(FXW-4,.08,.3),stripMat);
    s.position.set(0,WALL_H-.4,i*6);scene.add(s);}
  /* puertas */
  const DOORS=[
    {x:-17.5,name:'SALA DE MAPAS',sub:'globo interactivo',room:'globo',col:'#1E90FF'},
    {x:-10.5,name:'MISIONES',sub:'dossiers clasificados',room:'misiones',col:'#00FF87'},
    {x:-3.5,name:'BIBLIOTECA SECRETA',sub:'excava la historia',room:'biblio',col:'#B26BFF'},
    {x:3.5,name:'SIMULADOR',sub:'combate t\u00E1ctico',room:'sim',col:'#FF3B30'},
    {x:10.5,name:'COMUNICACIONES',sub:'radio \u00B7 hackeo \u00B7 verdad',room:'comm',col:'#FFC24B'},
    {x:17.5,name:'MERCADO',sub:'bolsa de inteligencia',room:'mercado',col:'#FFC24B'}
  ];
  const doorMeshes=[];
  DOORS.forEach(d=>{
    const t=makeTextTexture(d.name,d.sub.toUpperCase(),d.col);
    const m=new THREE.Mesh(new THREE.PlaneGeometry(3.2,4.8),
      new THREE.MeshBasicMaterial({map:t,transparent:true,side:THREE.DoubleSide}));
    m.position.set(d.x,2.4,-FXD/2+.06);scene.add(m);
    /* PERF v69: sin PointLight por puerta (eran 7 luces puntuales = congelación).
       Un plano aditivo da el mismo resplandor a coste cero. */
    const glow=new THREE.Mesh(new THREE.PlaneGeometry(4.6,5.8),
      new THREE.MeshBasicMaterial({color:new THREE.Color(d.col),transparent:true,opacity:.15,blending:THREE.AdditiveBlending,depthWrite:false}));
    glow.position.set(d.x,2.5,-FXD/2+.14);scene.add(glow);
    doorMeshes.push(m);
  });
  /* estaciones: terminal hack + detector + isla */
  function pedestal(x,z,col){
    const g=new THREE.Group();
    const base=new THREE.Mesh(new THREE.CylinderGeometry(.55,.7,1,10),new THREE.MeshStandardMaterial({color:0x18203a,metalness:.7,roughness:.3}));
    base.position.y=.5;g.add(base);
    const core=new THREE.Mesh(new THREE.IcosahedronGeometry(.32,0),new THREE.MeshBasicMaterial({color:new THREE.Color(col),wireframe:true}));
    core.position.y=1.25;g.add(core);g.userData.core=core;
    g.position.set(x,0,z);scene.add(g);obstacles.push({x,z,w:1.2,d:1.2});
    return g;
  }
  const hackPed=pedestal(20.6,-6,'#00FF87');
  const detPed=pedestal(-20.6,2,'#FF3B30');
  const arcPed=pedestal(-20.6,-8,'#7CFC00');
  const islMat=new THREE.MeshBasicMaterial({color:0xFFC24B,transparent:true,opacity:.5});
  const island=new THREE.Mesh(new THREE.CylinderGeometry(1.4,1.6,.18,24),islMat);
  island.position.set(19.5,.09,-12.6);scene.add(island);
  const islLight=new THREE.PointLight(0xFFC24B,1,8);islLight.position.set(19.5,2,-12.6);scene.add(islLight);
  const islLbl=makeLabelSprite('ISLA DEL OR\u00C1CULO','#FFC24B',3.4);islLbl.position.set(19.5,2.6,-12.6);scene.add(islLbl);
  /* bancas + NPC reclutas */
  const SPECS=[{spec:'ECO',name:'R. Vasquez',col:'#00FF87',d:'economista'},{spec:'MIL',name:'T. Okoye',col:'#FF3B30',d:'militar'},{spec:'DIP',name:'L. Fontaine',col:'#1E90FF',d:'diplom\u00E1tica'}];
  const benches=[];
  SPECS.forEach((sp,i)=>{
    const bz=12.2,bx=-8+i*8;
    const bench=new THREE.Mesh(new THREE.BoxGeometry(3,.5,.9),new THREE.MeshLambertMaterial({color:0x1c2440}));
    bench.position.set(bx,.45,bz);scene.add(bench);obstacles.push({x:bx,z:bz,w:3,d:.9});
    const npc=new THREE.Group();
    const body=new THREE.Mesh(new THREE.CapsuleGeometry(.28,.7,4,10),new THREE.MeshStandardMaterial({color:0x2a3552,roughness:.7}));
    body.position.y=.95;body.rotation.x=-.25;npc.add(body);
    const head=new THREE.Mesh(new THREE.SphereGeometry(.22,14,14),new THREE.MeshStandardMaterial({color:0x37456b}));
    head.position.set(0,1.62,-.12);npc.add(head);
    npc.position.set(bx-.9,0.28,bz+.15);scene.add(npc);
    const lbl=makeLabelSprite(sp.name+' \u00B7 '+sp.spec,sp.col,2.6);lbl.position.set(bx,2.5,bz);scene.add(lbl);
    benches.push({x:bx,z:bz,spec:sp,recruited:()=>P.recruits.some(r=>r.spec===sp.spec)});
  });
  /* agentes conectados (presencia real) */
  const BOT_NAMES=['AGT-NAVAJO','AGT-C\u00D3NDOR','AGT-KRAKEN','AGT-ZORRO','AGT-LYNX','AGT-B\u00DAMERANG','AGT-COMETA','AGT-SIERRA'];
  const bots=[];
  function addBot(i){
    const g=new THREE.Group();
    const mat=new THREE.MeshBasicMaterial({color:0x7fb8ff,transparent:true,opacity:.4,blending:THREE.AdditiveBlending});
    const body=new THREE.Mesh(new THREE.CapsuleGeometry(.3,.9,4,10),mat);body.position.y=.9;g.add(body);
    const haloCol=pick([0x1E90FF,0xB26BFF,0xFFC24B,0x00FF87]);
    const halo=new THREE.Mesh(new THREE.RingGeometry(.5,.62,26),new THREE.MeshBasicMaterial({color:haloCol,transparent:true,opacity:.7,side:THREE.DoubleSide}));
    halo.rotation.x=-Math.PI/2;halo.position.y=.06;g.add(halo);
    const lbl=makeLabelSprite(BOT_NAMES[i%BOT_NAMES.length],'#7fb8ff',2.4);lbl.position.y=1.9;g.add(lbl);
    g.position.set(rnd(-18,18),0,rnd(-12,12));
    g.userData={target:null,t:rnd(2,6),halo};
    scene.add(g);bots.push(g);
  }
  function syncBots(){
    const want=clamp((DATA.online||1),1,8)-1+(IS_MOBILE?0:1);
    while(bots.length<want)addBot(bots.length);
  }
  /* ---- AGENTE ---- */
  const agent={pos:V3(0,0,6),vel:V3(0,0,0),heading:0,speed:0,jumpV:0,danceT:0,
    group:null,cape:null,hairs:[],footT:0,dustT:0,companion:null};
  (function buildAgent(){
    const g=new THREE.Group();
    const suitCols=[0x2a3a5f,0x3a2a2f,0x24402f,0x33334a,0x101820];
    const bodyMat=new THREE.MeshStandardMaterial({color:suitCols[P.suit||0],roughness:.6,metalness:.25});
    const body=new THREE.Mesh(new THREE.CapsuleGeometry(.32,.85,4,12),bodyMat);body.position.y=1.05;g.add(body);
    const head=new THREE.Mesh(new THREE.SphereGeometry(.24,16,16),new THREE.MeshStandardMaterial({color:0xd8b49a,roughness:.7}));
    head.position.y=1.78;g.add(head);
    const visor=new THREE.Mesh(new THREE.BoxGeometry(.34,.1,.1),new THREE.MeshBasicMaterial({color:0x1E90FF}));
    visor.position.set(0,1.8,.2);g.add(visor);
    const haloCol=new THREE.Color(RANK_COLOR[P.rank]);
    const halo=new THREE.Mesh(new THREE.RingGeometry(.5,.6,28),new THREE.MeshBasicMaterial({color:haloCol,transparent:true,opacity:.55,side:THREE.DoubleSide}));
    halo.rotation.x=-Math.PI/2;halo.position.y=.05;g.add(halo);g.userData.halo=halo;
    /* capa con onda (simulaci\u00F3n de tela) */
    const capeGeo=new THREE.PlaneGeometry(.68,.95,4,6);
    const capeMat=new THREE.MeshStandardMaterial({color:suitCols[(P.suit||0)+1>suitCols.length-1?0:(P.suit||0)+1],side:THREE.DoubleSide,roughness:.9});
    const cape=new THREE.Mesh(capeGeo,capeMat);
    cape.position.set(0,1.28,-.3);cape.rotation.x=.15;g.add(cape);
    /* pelo */
    for(let i=0;i<3;i++){
      const h=new THREE.Mesh(new THREE.ConeGeometry(.05,.22,6),new THREE.MeshStandardMaterial({color:0x1a1a22,roughness:.9}));
      h.position.set(-.1+i*.1,2.02,-.05);g.add(h);agent.hairs.push(h);
    }
    /* compa\u00F1ero reclutado */
    const comp=new THREE.Mesh(new THREE.OctahedronGeometry(.11,0),new THREE.MeshBasicMaterial({color:0x00FF87,wireframe:true}));
    comp.position.set(.42,1.55,0);comp.visible=false;g.add(comp);
    agent.group=g;agent.cape=cape;agent.companion=comp;
    scene.add(g);
  })();
  function syncCompanion(){
    if(!agent.companion)return;
    agent.companion.visible=P.recruits.length>0;
  }
  /* huellas */
  const prints=[];
  const printGeo=new THREE.PlaneGeometry(.22,.34);
  for(let i=0;i<40;i++){
    const m=new THREE.Mesh(printGeo,new THREE.MeshBasicMaterial({color:0x1E90FF,transparent:true,opacity:0,depthWrite:false}));
    m.rotation.x=-Math.PI/2;m.position.y=.015;scene.add(m);prints.push({m,life:1});
  }
  let printIdx=0,printSide=1;
  function spawnPrint(){
    const p=prints[printIdx=(printIdx+1)%prints.length];
    p.life=0;
    p.m.position.set(agent.pos.x+printSide*.12,0.015,agent.pos.z);
    p.m.rotation.z=-agent.heading+Math.PI/2*0; p.m.rotation.z=Math.atan2(agent.vel.x,agent.vel.z);
    printSide*=-1;
  }
  /* ---- objetos agarrables (sistema 2) ---- */
  const grabbables=[];
  function addGrab(type,x,z){
    let mesh,weight,rest,mat;
    if(type==='sobre'){mesh=new THREE.Mesh(new THREE.BoxGeometry(.5,.06,.34),new THREE.MeshStandardMaterial({color:0xE8DCC0,roughness:.8}));weight=2.2;rest=.45;mat='papel';}
    else if(type==='carta'){mesh=new THREE.Mesh(new THREE.PlaneGeometry(.4,.56),new THREE.MeshStandardMaterial({color:0x1E90FF,roughness:.4,side:THREE.DoubleSide,metalness:.6}));weight=1.4;rest=.35;mat='papel';}
    else if(type==='trofeo'){mesh=new THREE.Mesh(new THREE.CylinderGeometry(.14,.2,.5,10),new THREE.MeshStandardMaterial({color:0xFFC24B,metalness:.9,roughness:.2}));weight=14;rest=.08;mat='metal';}
    else{mesh=new THREE.Mesh(new THREE.BoxGeometry(.55,.4,.3),new THREE.MeshStandardMaterial({color:0x232c47,roughness:.5,metalness:.4}));weight=11;rest=.15;mat='metal';}
    mesh.position.set(x,.4,z);mesh.rotation.y=rnd(0,6);
    mesh.castShadow=false;scene.add(mesh);
    grabbables.push({mesh,type,weight,rest,mat,vel:V3(0,0,0),held:false,target:null,spin:rnd(-2,2)});
  }
  [['sobre',-14,-8],['sobre',-16,-2],['carta',-13,3],['carta',-15,7],['trofeo',12,8],['trofeo',14,-3],['maletin',17,5],['sobre',5,9],['carta',8,-9],['carta',-5,-10],['sobre',10,2],['maletin',-18,-11]].forEach(a=>addGrab(a[0],a[1],a[2]));
  /* ---- monedas f\u00EDsicas (sistema 20) ---- */
  const coins=[];
  const coinGeo=new THREE.CylinderGeometry(.16,.16,.045,14);
  const coinMat=new THREE.MeshStandardMaterial({color:0xFFC24B,metalness:.95,roughness:.15,emissive:0x6b4a10,emissiveIntensity:.6});
  function spawnCoin(x,z,value,life,group){
    const m=new THREE.Mesh(coinGeo,coinMat.clone());
    m.material.emissiveIntensity=.4+Math.min(1,value/40);
    const s=1+Math.min(.9,value/25);m.scale.set(s,1,s);
    m.position.set(x,rnd(5,7.5),z);
    scene.add(m);
    coins.push({m,value,life:life||14,v:V3(rnd(-1.5,1.5),0,rnd(-1.5,1.5)),spin:rnd(6,14),group:group||null,collected:false});
  }
  let rainGroup=null,rainTotal=0,rainGot=0;
  function rewardRain(n,base){
    rainGroup='g'+now();rainTotal=0;rainGot=0;
    for(let i=0;i<n;i++){const v=Math.max(1,Math.round(base*rnd(.5,2)));
      rainTotal+=v;spawnCoin(rnd(-16,16),rnd(-11,11),v,10,rainGroup);}
    toast('LLUVIA DE MONEDAS','\u00A1Rec\u00F3gelas TODAS caminando para el bonus +25%!','gold',4200);
    SFX.whoosh();Shake.add(3,300);
  }
  /* ---- interacciones ---- */
  const ray=new THREE.Raycaster();
  let heldObj=null,holdTarget=V3(0,1.2,0),holdPlane=new THREE.Plane(V3(0,1,0),-1.1);
  function tryGrab(){
    if(heldObj)return;
    const cam=ThreeEng.camera();
    ray.setFromCamera({x:Pointer.x/innerWidth*2-1,y:-(Pointer.y/innerHeight)*2+1},cam);
    const meshes=grabbables.filter(g=>g.mesh.position.distanceTo(agent.pos)<9).map(g=>g.mesh);
    const hit=ray.intersectObjects(meshes,false)[0];
    if(hit){
      const g=grabbables.find(gg=>gg.mesh===hit.object);
      if(g){g.held=true;heldObj=g;document.body.style.cursor='grabbing';SFX.pop();}
    }
  }
  function releaseGrab(){
    if(!heldObj)return;
    heldObj.held=false;
    const cam=ThreeEng.camera();
    const f=heldObj.type==='trofeo'?4:(heldObj.type==='carta'?14:10);
    heldObj.vel.set(Pointer.vx*.06*f+agent.vel.x,2+Math.abs(Pointer.vy)*.05*f,Pointer.vy*.06*f+agent.vel.z);
    heldObj=null;document.body.style.cursor='';
    SFX.whoosh();
  }
  function matAt(x,z){if(x<-8)return 'alfombra';if(x>8)return 'vidrio';return 'metal';}
  function collide(px,pz){
    let x=clamp(px,-FXW/2+R_AGENT,FXW/2-R_AGENT),z=clamp(pz,-FXD/2+R_AGENT,FXD/2-R_AGENT),hit=false;
    for(const o of obstacles){
      const hx=o.w/2+R_AGENT,hz=o.d/2+R_AGENT;
      if(Math.abs(x-o.x)<hx&&Math.abs(z-o.z)<hz){
        const dx=x-o.x,dz=z-o.z;
        if(Math.abs(dx)/hx>Math.abs(dz)/hz)x=o.x+Math.sign(dx)*hx;else z=o.z+Math.sign(dz)*hz;
        hit=true;
      }
    }
    return{x,z,hit};
  }
  let nearDoor=null,nearStation=null,nearBench=null,nearIsland=false;
  function update(dt){
    const run=Key('ShiftLeft')||Key('ShiftRight')||Joy.mag>.92;
    const maxV=run?6.2:3.4,acc=run?26:16;
    let ix=0,iz=0;
    if(Key('KeyW')||Key('ArrowUp'))iz-=1;
    if(Key('KeyS')||Key('ArrowDown'))iz+=1;
    if(Key('KeyA')||Key('ArrowLeft'))ix-=1;
    if(Key('KeyD')||Key('ArrowRight'))ix+=1;
    if(Joy.active){ix+=Joy.dx;iz+=Joy.dy;}
    const il=Math.hypot(ix,iz);
    if(il>1){ix/=il;iz/=il;}
    agent.vel.x+=ix*acc*dt;agent.vel.z+=iz*acc*dt;
    const fr=Math.exp(-7*dt*(il>0?2.2:5));
    agent.vel.x*=fr;agent.vel.z*=fr;
    const sp=Math.hypot(agent.vel.x,agent.vel.z);
    if(sp>maxV){agent.vel.x*=maxV/sp;agent.vel.z*=maxV/sp;}
    agent.speed=sp;
    const np=collide(agent.pos.x+agent.vel.x*dt,agent.pos.z+agent.vel.z*dt);
    if(np.hit&&sp>3.2){SFX.thud(agent.pos);Shake.add(6,260);vibrate(60);
      agent.vel.x*=-.35;agent.vel.z*=-.35;FX.sparks(worldToScreen(agent.pos.clone().setY(1)).x,worldToScreen(agent.pos.clone().setY(1)).y,6,'30,144,255');}
    agent.pos.x=np.x;agent.pos.z=np.z;
    /* saltito/celebraci\u00F3n */
    if(agent.jumpV!==0||agent.pos.y>0){agent.pos.y+=agent.jumpV*dt;agent.jumpV-=22*dt;if(agent.pos.y<=0){agent.pos.y=0;agent.jumpV=0;}}
    let yawT=agent.heading;
    if(sp>.4)yawT=Math.atan2(agent.vel.x,agent.vel.z);
    if(agent.danceT>0){agent.danceT-=dt;yawT+=agent.danceT*9;}
    let dy=yawT-agent.heading;while(dy>Math.PI)dy-=Math.PI*2;while(dy<-Math.PI)dy+=Math.PI*2;
    agent.heading+=dy*Math.min(1,12*dt);
    const g=agent.group;
    g.position.copy(agent.pos);
    g.rotation.y=agent.heading;
    const bob=sp>.4?Math.abs(Math.sin(performance.now()/(run?95:150)))*(run?.1:.05):Math.sin(performance.now()/700)*.012;
    g.position.y=agent.pos.y+bob;
    g.rotation.x=run&&sp>3?-.08:0;
    /* tela: capa + pelo */
    const t=performance.now()/1000;
    if(agent.cape){
      const pos=agent.cape.geometry.attributes.position;
      const sway=clamp(sp/6,0,1);
      for(let i=0;i<pos.count;i++){
        const y=pos.getY(i),x=pos.getX(i);
        pos.setZ(i,-(Math.sin(t*6+x*4+y*2)*.05+sway*.5)*((.95-y)/1.9+.2));
      }
      pos.needsUpdate=true;
    }
    agent.hairs.forEach((h,i)=>{h.rotation.x=Math.sin(t*5+i)*.14+swayHair();function swayHair(){return clamp(sp*.1,0,.5);}});
    if(agent.companion.visible){agent.companion.rotation.y+=dt*3;agent.companion.position.y=1.55+Math.sin(t*3)*.06;}
    /* pasos + huellas */
    if(sp>.6){
      agent.footT+=sp*dt;
      if(agent.footT>1.6){agent.footT=0;SFX.step(matAt(agent.pos.x,agent.pos.z),agent.pos);if(sp>3.8)spawnPrint();}
    }
    /* frenado con polvo */
    if(sp>3&&il===0){
      agent.dustT+=dt;
      if(agent.dustT>.09){agent.dustT=0;const s=worldToScreen(agent.pos.clone());if(!s.behind)FX.dust(s.x,s.y+10,3);}
    }
    prints.forEach(p=>{if(p.life<1){p.life+=dt/2;p.m.material.opacity=Math.max(0,.65*(1-p.life));}});
    /* puertas cerca */
    nearDoor=null;
    for(const d of DOORS){
      if(Math.abs(agent.pos.x-d.x)<2.4&&agent.pos.z<-FXD/2+3.4){nearDoor=d;break;}
    }
    const dh=$('#doorHint');
    if(nearDoor){dh.style.display='block';dh.innerHTML='<span style="color:'+nearDoor.col+'">'+nearDoor.name+'</span><br><span class="small">'+(IS_MOBILE?'Toca la puerta':'Pulsa E o clic')+' para entrar</span>';}
    else dh.style.display='none';
    /* estaciones */
    nearStation=null;nearBench=null;
    if(agent.pos.distanceTo(V3(20.6,0,-6))<2.2)nearStation='hack';
    else if(agent.pos.distanceTo(V3(-20.6,0,2))<2.2)nearStation='detector';
    else if(agent.pos.distanceTo(V3(-20.6,0,-8))<2.2)nearStation='archivo';
    else for(const b of benches){if(Math.hypot(agent.pos.x-b.x,agent.pos.z-b.z)<2.4){nearBench=b;break;}}
    nearIsland=Math.hypot(agent.pos.x-19.5,agent.pos.z+12.6)<1.7;
    const sb=$('#stationBar');
    if(nearStation==='hack'){sb.className='stationBar on';sb.innerHTML='<button class="btn green sm" data-act="hack">TERMINAL DE HACKEO &raquo;</button>';}
    else if(nearStation==='detector'){sb.className='stationBar on';sb.innerHTML='<button class="btn red sm" data-act="detector">DETECTOR DE MENTIRAS &raquo;</button>';}
    else if(nearStation==='archivo'){sb.className='stationBar on';sb.innerHTML='<button class="btn gold sm" data-act="archivo">ARCHIVO CLASIFICADO &raquo;</button>';}
    else if(nearBench&&!nearBench.recruited()){sb.className='stationBar on';sb.innerHTML='<button class="btn sm" data-act="interview">ENTREVISTAR A '+nearBench.spec.name.toUpperCase()+' ['+nearBench.spec.spec+'] &raquo;</button>';}
    else sb.classList.remove('on');
    /* isla */
    if(nearIsland){
      islMat.opacity=.5+Math.sin(t*6)*.3;
      if(!P.island&&(P.knownIsland||P.morseHits>=3)){
        P.island=true;addCoins(777,'Isla del Or\u00E1culo');addXP(300);
        openModal('BIBLIOTECA DEL OR\u00C1CULO','<div class="ttl" style="color:var(--gold)">Has encontrado la isla secreta</div><p class="small" style="margin-top:8px">Bajo la arena hay un cofre del Or\u00E1culo: <b>+777 '+IC+'</b> y un archivo prohibido.</p>');
        rewardRain(14,20);save();
      }else if(!P.knownIsland&&P.morseHits<3){
        islLbl.material.opacity=.4+Math.sin(t*2)*.2;
      }
    }
    /* monedas */
    for(let i=coins.length-1;i>=0;i--){
      const c=coins[i];
      if(c.collected){coins.splice(i,1);continue;}
      c.life-=dt;if(c.life<=0){scene.remove(c.m);coins.splice(i,1);continue;}
      c.v.y-=9.8*dt;
      c.m.position.addScaledVector(c.v,dt);
      c.m.rotation.x+=c.spin*dt;
      if(c.m.position.y<.1){
        c.m.position.y=.1;c.v.y*=-.45;c.v.x*=.85;c.v.z*=.85;
        if(Math.abs(c.v.y)>.6)SFX.coin(c.value>=20,c.m.position);
      }
      c.m.position.x=clamp(c.m.position.x,-FXW/2+.3,FXW/2-.3);
      c.m.position.z=clamp(c.m.position.z,-FXD/2+.3,FXD/2-.3);
      if(Math.hypot(c.m.position.x-agent.pos.x,c.m.position.z-agent.pos.z)<(0.9+c.m.scale.x*.12)){
        c.collected=true;scene.remove(c.m);
        addCoins(c.value,null);SFX.coin(c.value>=20);vibrate(15);
        if(c.group===rainGroup){rainGot+=c.value;
          if(!coins.some(cc=>cc.group===rainGroup&&!cc.collected)){
            const bonus=Math.round(rainGot*.25);
            if(bonus>0){addCoins(bonus,'bonus 25% recogida total');
              toast('RECOGIDA PERFECTA','+25% bonus: +'+bonus+' '+IC,'gold');FX.confetti(60);SFX.win();}
          }
        }
      }
    }
    /* objetos agarrables: f\u00EDsica */
    if(heldObj){
      const cam=ThreeEng.camera();
      ray.setFromCamera({x:Pointer.x/innerWidth*2-1,y:-(Pointer.y/innerHeight)*2+1},cam);
      ray.ray.intersectPlane(holdPlane,holdTarget);
      holdTarget.y=Math.max(.4,holdTarget.y);
      holdTarget.x=clamp(holdTarget.x,-FXW/2+.4,FXW/2-.4);holdTarget.z=clamp(holdTarget.z,-FXD/2+.4,FXD/2-.4);
      const k=heldObj.type==='trofeo'?9:(heldObj.type==='sobre'?30:22);
      const c2=heldObj.type==='trofeo'?6:5;
      heldObj.vel.x+=((holdTarget.x-heldObj.mesh.position.x)*k-heldObj.vel.x*c2)*dt;
      heldObj.vel.y+=((holdTarget.y-heldObj.mesh.position.y)*k-heldObj.vel.y*c2)*dt;
      heldObj.vel.z+=((holdTarget.z-heldObj.mesh.position.z)*k-heldObj.vel.z*c2)*dt;
      if(heldObj.type==='carta'){heldObj.vel.x+=agent.vel.x*.9*dt*8;heldObj.vel.z+=agent.vel.z*.9*dt*8;}
    }
    for(const gr of grabbables){
      const m=gr.mesh;
      if(gr.held){m.position.addScaledVector(gr.vel,dt);}
      else{
        gr.vel.y-=(gr.type==='sobre'?1.6:gr.type==='carta'?1.2:9.8)*dt;
        if(gr.type==='carta'){gr.vel.x+=Math.sin(t*2+m.position.x)*.25*dt*8;gr.vel.z+=Math.cos(t*1.7+m.position.z)*.25*dt*8;}
        m.position.addScaledVector(gr.vel,dt);
        if(m.position.y<gr.type==='trofeo'?.25:.2){
          m.position.y=gr.type==='trofeo'?.25:.2;
          if(Math.abs(gr.vel.y)>1.2){SFX.bounce(gr.mat,Math.abs(gr.vel.y),m.position);}
          gr.vel.y*=-gr.rest;gr.vel.x*=.86;gr.vel.z*=.86;
        }
        if(m.position.x<-FXW/2+.3||m.position.x>FXW/2-.3){gr.vel.x*=-.6;m.position.x=clamp(m.position.x,-FXW/2+.3,FXW/2-.3);SFX.bounce('metal',2,m.position);}
        if(m.position.z<-FXD/2+.3||m.position.z>FXD/2-.3){gr.vel.z*=-.6;m.position.z=clamp(m.position.z,-FXD/2+.3,FXD/2-.3);}
      }
      if(!gr.held)m.rotation.y+=gr.spin*dt*(gr.vel.length()*.2+.05);
      m.rotation.z=clamp(-gr.vel.x*.05,-.5,.5);
    }
    /* clic para agarrar / soltar */
    if(Pointer.justDown&&!Pointer.touch&&activeRoomName==='hangar'&&!isUI(document.elementFromPoint(Pointer.x,Pointer.y)||document.body)){
      if(heldObj)releaseGrab();else tryGrab();
    }
    if(Pointer.longPress&&Pointer.touch&&activeRoomName==='hangar'&&!heldObj)tryGrab();
    if(!Pointer.down&&heldObj)releaseGrab();
    /* bots */
    bots.forEach(b=>{
      const u=b.userData;
      u.t-=dt;
      if(u.t<=0||!u.target){u.target=V3(rnd(-18,18),0,rnd(-12,12));u.t=rnd(3,8);}
      const dx=u.target.x-b.position.x,dz=u.target.z-b.position.z,d=Math.hypot(dx,dz);
      if(d>.4){b.position.x+=dx/d*1.4*dt;b.position.z+=dz/d*1.4*dt;b.rotation.y=Math.atan2(dx,dz);}
      b.position.y=Math.abs(Math.sin(performance.now()/300))*.08;
      u.halo.scale.setScalar(1+Math.sin(performance.now()/400)*.12);
    });
    /* c\u00E1mara */
    const cam=ThreeEng.camera();
    const parX=(Pointer.x/innerWidth-.5)*1.6;
    const desired=V3(agent.pos.x-agent.vel.x*.25+parX*.4,3.6+agent.pos.y*.4,agent.pos.z+6.4);
    cam.position.lerp(desired,Math.min(1,5*dt));
    cam.position.x+=Shake.ox()*.05;cam.position.y+=Shake.oy()*.05;
    cam.lookAt(agent.pos.x,1.2+agent.pos.y,agent.pos.z);
    /* puertas pulso */
    doorMeshes.forEach((m,i)=>{
      const near=Math.abs(agent.pos.x-DOORS[i].x)<3&&agent.pos.z<-10;
      m.scale.setScalar(lerp(m.scale.x,near?1.12:1+Math.sin(t*2+i)*.02,.1));
    });
    [hackPed,detPed,arcPed].forEach(p=>{p.userData.core.rotation.y+=dt*2;p.userData.core.rotation.x+=dt;});
  }
  function celebrate(){agent.jumpV=5;FX.confetti(50);SFX.fanfare();}
  function dance(){agent.danceT=2;}
  function enter(){
    Joy.enabled=true;
    ThreeEng.show('hangar');syncBots();syncCompanion();
    ThreeEng.camera().position.set(agent.pos.x,3.6,agent.pos.z+6.4);
    if(P.recruits.length&&!agent.companion.visible)syncCompanion();
  }
  function exit(){$('#doorHint').style.display='none';$('#stationBar').classList.remove('on');document.body.style.cursor='';}
  function onKey(e){
    if(e.code==='KeyE'||e.code==='Enter'){
      if(nearDoor)go(nearDoor.room);
      else if(nearStation==='hack')go('hack');
      else if(nearStation==='detector')go('detector');
      else if(nearStation==='archivo')go('archivo');
      else if(nearBench)Recruit.interview(nearBench.spec);
      else if(nearIsland&&P.knownIsland)toast('ISLA DEL OR\u00C1CULO',P.island?'La isla ya te dio su secreto.':'Algo dorado late bajo la arena...','gold');
    }
  }
  function onPointerUp(e){
    if(nearDoor&&Pointer.moved<12&&!isUI(e.target))go(nearDoor.room);
  }
  function onLongPress(x,y){if(activeRoomName==='hangar')tryGrab();}
  ThreeEng.reg('hangar',{scene:scene,update:dt=>update(dt)});
  regHangar({scene,update,enter,exit,onKey,onPointerUp,onLongPress,hide3d:false});
  return{scene,update,enter,exit,onKey,onPointerUp,onLongPress,celebrate,dance,rewardRain,syncCompanion,
    grabRay:{tryGrab,releaseGrab},agent,coins,addBot};
})();
function regIntro(o){registerRoom('intro',Object.assign({section:'scr-intro',three:true},o));}
function regHangar(o){registerRoom('hangar',Object.assign({three:true},o));}
