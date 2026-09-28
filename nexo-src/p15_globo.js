/* ================= SALA DE MAPAS: GLOBO 3D INTERACTIVO ================= */
const Globo=(function(){
  const R=2;
  const CONFLICT_SEED=[
    {lat:49,lng:32,name:'Ucrania \u00B7 frente este',i:1},
    {lat:31.5,lng:34.4,name:'Oriente Medio',i:.9},
    {lat:15.5,lng:42,name:'Mar Rojo \u00B7 Yemen',i:.75},
    {lat:24.5,lng:120.5,name:'Estrecho de Taiw\u00E1n',i:.6},
    {lat:15,lng:30,name:'Sud\u00E1n \u00B7 Jartum',i:.7},
    {lat:16.8,lng:-96.7,name:'Oaxaca \u00B7 cartel',i:.35},
    {lat:4.5,lng:29.9,name:'Sud\u00E1n del Sur',i:.4},
    {lat:21.9,lng:95.9,name:'Myanmar \u00B7 guerra civil',i:.55},
    {lat:35.2,lng:38.2,name:'Siria \u00B7 Idlib',i:.5},
    {lat:40.1,lng:44.5,name:'Nagorno \u00B7 C\u00E1ucaso',i:.35},
    {lat:11.5,lng:43,name:'Yibuti \u00B7 cuerno de \u00C1frica',i:.3},
    {lat:-2.5,lng:28.9,name:'Kivu \u00B7 RD Congo',i:.45}
  ];
  const ZONE_POS={marNegro:{lat:44.2,lng:28.6},orientemedio:{lat:32.08,lng:34.78},taiwan:{lat:24.5,lng:120.5}};
  let scene,gGroup,earth,atm,ready=false;
  let rotVX=0,rotVY=0,idleT=0,followPlane=null,mode='libre';
  const flames=[],quakeRings=[],planes3d=[],cloudPts=[];
  let spies=[],spyEventT=rnd(12,25);
  let issGroup=null,issLabel=null,captureReady=false,captureZone=null;
  function ll2v(lat,lng,r){
    const phi=(90-lat)*Math.PI/180,theta=(lng+180)*Math.PI/180;
    return V3(-r*Math.sin(phi)*Math.cos(theta),r*Math.cos(phi),r*Math.sin(phi)*Math.sin(theta));
  }
  function v2ll(v){
    const p=v.clone().normalize();
    const lat=90-Math.acos(p.y)*180/Math.PI;
    const lng=((Math.atan2(p.z,-p.x)*180/Math.PI)-180);
    return{lat,lng:((lng+540)%360)-180};
  }
  function build(){
    if(ready||!window.THREE)return;
    scene=new THREE.Scene();
    scene.fog=new THREE.FogExp2(0x0A0A0F,.012);
    gGroup=new THREE.Group();scene.add(gGroup);
    const starGeo=new THREE.BufferGeometry();
    const sp=new Float32Array(1600*3);
    for(let i=0;i<1600;i++){const r=rnd(24,90),a=rnd(0,Math.PI*2),b=rnd(-1,1),s=Math.sqrt(1-b*b);
      sp[i*3]=r*s*Math.cos(a);sp[i*3+1]=r*b;sp[i*3+2]=r*s*Math.sin(a);}
    starGeo.setAttribute('position',new THREE.BufferAttribute(sp,3));
    scene.add(new THREE.Points(starGeo,new THREE.PointsMaterial({color:0x9db8ff,size:.35,transparent:true,opacity:.8})));
    const eMat=new THREE.MeshStandardMaterial({color:0x1a3a6a,roughness:.85,metalness:.15});
    earth=new THREE.Mesh(new THREE.SphereGeometry(R,64,64),eMat);gGroup.add(earth);
    new THREE.TextureLoader().load('/assets/globe/earth-blue-marble.jpg',t=>{t.anisotropy=4;eMat.map=t;eMat.color.set(0xffffff);eMat.needsUpdate=true;},undefined,()=>{});
    const grat=new THREE.Mesh(new THREE.SphereGeometry(R*1.001,36,24),
      new THREE.MeshBasicMaterial({color:0x1E90FF,wireframe:true,transparent:true,opacity:.07}));
    gGroup.add(grat);
    atm=new THREE.Mesh(new THREE.SphereGeometry(R*1.09,48,48),
      new THREE.MeshBasicMaterial({color:0x1E90FF,transparent:true,opacity:.14,side:THREE.BackSide,blending:THREE.AdditiveBlending}));
    scene.add(atm);
    scene.add(new THREE.AmbientLight(0x445577,1.3));
    const sun=new THREE.DirectionalLight(0xffffff,1.5);sun.position.set(6,3,8);scene.add(sun);
    buildFlames();buildPlanes();buildQuakes();buildClouds();buildISS();buildSpyMeshes();
    ready=true;
  }
  function zones(){
    const z=CONFLICT_SEED.map(c=>({...c}));
    if(DATA.pulso&&DATA.pulso.zones)DATA.pulso.zones.forEach((pz,i)=>{
      const pos=ZONE_POS[pz.id]||{lat:30+i*10,lng:30};
      z.push({lat:pos.lat,lng:pos.lng,name:pz.label,i:clamp(.3+pz.total/18,.3,1),live:true});
    });
    return z;
  }
  function buildFlames(){
    zones().forEach(zn=>{
      const n=IS_MOBILE?60:110;
      const g=new THREE.BufferGeometry();
      const pos=new Float32Array(n*3),seed=[];
      const base=ll2v(zn.lat,zn.lng,R*1.005);
      const up=base.clone().normalize();
      for(let i=0;i<n;i++){seed.push({t:Math.random(),a:rnd(0,Math.PI*2),r:rnd(.02,.14)*zn.i+ .015,s:rnd(.5,1.4)});}
      g.setAttribute('position',new THREE.BufferAttribute(pos,3));
      const col=zn.live?0x00FF87:0xff7a2a;
      const pts=new THREE.Points(g,new THREE.PointsMaterial({color:col,size:.045,transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false}));
      gGroup.add(pts);
      const glow=new THREE.Mesh(new THREE.SphereGeometry(.09*zn.i+.05,10,10),
        new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.5,blending:THREE.AdditiveBlending}));
      glow.position.copy(base);gGroup.add(glow);
      /* PERF v69: tangentes precalculadas UNA vez — antes se clonaban 2 vectores por partícula por frame (miles de allocs = congelación) */
      const t1=V3(0,1,0).cross(up);
      if(t1.lengthSq()<1e-6)t1.set(1,0,0);t1.normalize();
      const t2=up.clone().cross(t1).normalize();
      flames.push({zn,pts,seed,base,up,glow,t1,t2});
    });
  }
  function buildPlanes(){
    if(!DATA.pulso||!DATA.pulso.zones)return;
    DATA.pulso.zones.forEach(zn=>{
      const c=ZONE_POS[zn.id]||{lat:30,lng:30};
      zn.planes.slice(0,6).forEach(pl=>{
        const m=new THREE.Mesh(new THREE.ConeGeometry(.03,.1,6),new THREE.MeshBasicMaterial({color:pl.mil?0xFF3B30:0x1E90FF}));
        m.position.copy(ll2v(c.lat+rnd(-4,4),c.lng+rnd(-4,4),R+0.18+((pl.altM||9000)/12000)*.3));
        m.userData={plane:pl,zone:zn.label};
        gGroup.add(m);planes3d.push(m);
      });
    });
  }
  function buildQuakes(){
    DATA.quakes.forEach(q=>{
      const ring=new THREE.Mesh(new THREE.RingGeometry(.08,.1,32),
        new THREE.MeshBasicMaterial({color:0xFFC24B,transparent:true,opacity:.85,side:THREE.DoubleSide}));
      const p=ll2v(q.lat,q.lng,R*1.01);
      ring.position.copy(p);
      ring.lookAt(p.clone().multiplyScalar(2));
      ring.userData={quake:q,ph:rnd(0,6)};
      gGroup.add(ring);quakeRings.push(ring);
    });
  }
  function buildClouds(){
    const n=IS_MOBILE?140:260;
    const g=new THREE.BufferGeometry();
    const pos=new Float32Array(n*3),vel=[];
    for(let i=0;i<n;i++){
      const zn=pick(CONFLICT_SEED);
      const base=ll2v(zn.lat+rnd(-3,3),zn.lng+rnd(-3,3),R*1.06);
      pos[i*3]=base.x;pos[i*3+1]=base.y;pos[i*3+2]=base.z;
      vel.push(V3(rnd(-.05,.05),rnd(-.05,.05),rnd(-.05,.05)));
    }
    g.setAttribute('position',new THREE.BufferAttribute(pos,3));
    const pts=new THREE.Points(g,new THREE.PointsMaterial({color:0x6a7a95,size:.06,transparent:true,opacity:.5,depthWrite:false}));
    gGroup.add(pts);cloudPts.push({pts,vel,g});
  }
  function buildISS(){
    issGroup=new THREE.Group();
    const core=new THREE.Mesh(new THREE.BoxGeometry(.06,.06,.14),new THREE.MeshBasicMaterial({color:0xF0F0F0}));
    const pan1=new THREE.Mesh(new THREE.PlaneGeometry(.16,.05),new THREE.MeshBasicMaterial({color:0x1E90FF,side:THREE.DoubleSide}));
    pan1.position.x=.12;const pan2=pan1.clone();pan2.position.x=-.12;
    issGroup.add(core,pan1,pan2);
    issLabel=makeLabelSprite('ISS \u00B7 SAT\u00C9LITE ESP\u00CDA','#00FF87',1.6);
    issLabel.position.y=.14;issGroup.add(issLabel);
    issGroup.visible=false;gGroup.add(issGroup);
  }
  const spyMeshes=[];
  function buildSpyMeshes(){}
  function syncSpyMeshes(){
    spies.forEach((sp,i)=>{
      if(!sp.mesh){
        const m=new THREE.Mesh(new THREE.SphereGeometry(.055,10,10),new THREE.MeshBasicMaterial({color:0x00FF87}));
        const lbl=makeLabelSprite('ESP\u00CDA-'+(i+1),'#00FF87',1.2);lbl.position.y=.13;m.add(lbl);
        gGroup.add(m);sp.mesh=m;
      }
      sp.mesh.position.copy(ll2v(sp.lat,sp.lng,R*1.02));
      sp.mesh.material.color.setHex(sp.pulse?0xFF3B30:0x00FF87);
      sp.mesh.scale.setScalar(sp.pulse?1.6+Math.sin(performance.now()/150)*.5:1);
    });
    spyMeshes.length=0;
  }
  function initSpies(){
    if(spies.length)return;
    const cs=pick(DATA.countries.length>5?DATA.countries:FALLBACK_COUNTRIES);
    spies=[{lat:cs.lat,lng:cs.lng,c2:cs.c2,n:cs.n,energy:100,pulse:false,pulseT:0},
      {lat:pick(FALLBACK_COUNTRIES).lat,lng:pick(FALLBACK_COUNTRIES).lng,c2:'??',n:'destino oculto',energy:100,pulse:false,pulseT:0},
      {lat:pick(FALLBACK_COUNTRIES).lat,lng:pick(FALLBACK_COUNTRIES).lng,c2:'??',n:'destino oculto',energy:100,pulse:false,pulseT:0}];
  }
  /* --- controles --- */
  let dragging=false,dragMoved=0;
  function onPointerMove(e){
    if(mode==='iss')return;
    if(Pointer.down&&!Pointer.pinchHandled){
      rotVY=Pointer.dx*.0035;rotVX=Pointer.dy*.0035;
      gGroup.rotation.y+=rotVY;
      gGroup.rotation.x=clamp(gGroup.rotation.x+rotVX,-1.1,1.1);
      dragMoved+=Math.abs(Pointer.dx)+Math.abs(Pointer.dy);
      idleT=0;
    }
  }
  function onPointerUp(e){
    if(dragMoved<10&&!isUI(e.target))tapGlobe(e);
    dragMoved=0;
    rotVX*=1;rotVY*=1;
  }
  function onWheel(dy){
    const cam=ThreeEng.camera();
    cam.position.multiplyScalar(1+clamp(dy,-1,1)*.08);
    /* FIX v69: nunca bajar al "nivel de tierra" — la textura se ve mal pegado al suelo.
       Mínimo R*2.05 (altura segura sobre la superficie). */
    cam.position.clampLength(R*2.05,R*6.5);
  }
  let moveMode=null;
  function tapGlobe(e){
    const cam=ThreeEng.camera();
    const ray=new THREE.Raycaster();
    ray.setFromCamera({x:e.clientX/innerWidth*2-1,y:-(e.clientY/innerHeight)*2+1},cam);
    /* aviones primero */
    const ph=ray.intersectObjects(planes3d,false)[0];
    if(ph){followCine(ph.object);return;}
    if(mode==='iss'){
      if(captureReady){captureShot();return;}
    }
    /* esp\u00EDas */
    const spyHit=ray.intersectObjects(spies.filter(s=>s.mesh).map(s=>s.mesh),false)[0];
    if(spyHit){
      const sp=spies.find(s=>s.mesh===spyHit.object);
      if(sp.pulse){spyCollect(sp);}
      else{
        openModal('ESP\u00CDA EN '+esc((sp.n||'posici\u00F3n').toUpperCase()),
          '<div class="stat">Energ\u00EDa: <b>'+Math.round(sp.energy)+'%</b></div>'
          +'<button class="btn green sm" id="spyChg" style="margin-top:8px;width:100%">VISITA VIRTUAL (recarga +40%)</button>'
          +'<button class="btn sm" id="spyMov" style="margin-top:6px;width:100%">REDESPLEGAR A OTRO PA\u00CDS (-20%)</button>',()=>{});
        $('#spyChg').onclick=()=>{sp.energy=Math.min(100,sp.energy+40);toast('ESP\u00CDA','Energ\u00EDa recargada','good');SFX.bell();closeModal();renderSpyPanel();};
        $('#spyMov').onclick=()=>{if(sp.energy<20){toast('ESP\u00CDA','Sin energ\u00EDa para moverse','bad');return;}moveMode=sp;closeModal();toast('REDESPLIEGUE','Toca el pa\u00EDs destino en el globo','',4000);};
      }
      renderSpyPanel();return;
    }
    /* sismos */
    const qh=ray.intersectObjects(quakeRings,false)[0];
    if(qh){
      const q=qh.object.userData.quake;
      vibrate(60+Math.min(120,(q.mag||4)*18));
      openModal('SISMO DETECTADO','<div class="big-num" style="color:var(--gold)">M'+(q.mag||q.m)+'</div><p class="small">'+esc(q.place||'')+'</p><p class="small dim">Profundidad '+(q.depth||'?')+' km \u00B7 '+(q.time?new Date(q.time).toLocaleString('es'):'')+'</p>');
      SFX.thud();return;
    }
    /* pa\u00EDs */
    const gh=ray.intersectObject(earth,false)[0];
    if(gh){
      const ll=v2ll(gh.point.clone().applyMatrix4(new THREE.Matrix4().copy(gGroup.matrixWorld).invert()));
      const c=nearestCountry(ll.lat,ll.lng);
      if(moveMode){
        if(c){moveMode.lat=c.lat;moveMode.lng=c.lng;moveMode.n=c.n;moveMode.c2=c.c2;moveMode.energy=Math.max(0,moveMode.energy-20);
          toast('ESP\u00CDA REDESPLEGADO','Nueva posici\u00F3n: '+c.n,'good');SFX.whoosh();}
        else toast('REDESPLIEGUE','Toca tierra firme (un pa\u00EDs)','bad');
        moveMode=null;renderSpyPanel();return;
      }
      if(c)showCountry(c);
    }
  }
  function nearestCountry(lat,lng){
    let best=null,bd=1e9;
    (DATA.countries.length?DATA.countries:FALLBACK_COUNTRIES).forEach(c=>{
      if(c.lat==null)return;
      const d=Math.hypot((c.lat-lat)*.9,(c.lng-lng)*1.1);
      if(d<bd){bd=d;best=c;}
    });
    return bd<26?best:null;
  }
  function showCountry(c){
    const news=DATA.news.filter(n=>(n.title||'').toLowerCase().includes(c.nEn.toLowerCase())).slice(0,3);
    openModal(c.n.toUpperCase(),
      '<img src="'+flagURL(c.c2,160)+'" style="width:70px;border-radius:6px;border:1px solid var(--line)">'
      +'<div class="sep"></div>'
      +'<div class="stat">Regi\u00F3n: <b>'+esc(c.reg||'\u2014')+'</b></div>'
      +'<div class="stat">Poblaci\u00F3n: <b>'+fmt(c.pop||0)+'</b></div>'
      +'<div class="stat">Coordenadas: <b class="mono">'+c.lat.toFixed(1)+', '+c.lng.toFixed(1)+'</b></div>'
      +(news.length?'<h3 class="ps">NOTICIAS EN VIVO</h3>'+news.map(n=>'<div class="feedItem">'+esc(n.title)+'</div>').join(''):'')
      +'<div class="sep"></div><button class="btn blue sm" id="wikiBtn">DOSSIER WIKIPEDIA</button>',()=>{
        const b=$('#wikiBtn');if(b)b.onclick=async()=>{
          b.textContent='CARGANDO...';const w=await wikiSummary(c.nEn);
          if(w)openModal(c.n.toUpperCase(),(w.thumb?'<img class="wsImg" src="'+w.thumb+'">':'')+'<p class="small" style="margin-top:8px">'+esc(w.extract)+'</p>'+(w.url?'<a class="btn sm" style="display:inline-block;margin-top:8px" href="'+w.url+'" target="_blank">ABRIR EN WIKIPEDIA</a>':''));
        };
      });
    SFX.uiTap();
  }
  /* seguimiento cinem\u00E1tico de aviones */
  function followCine(mesh){
    followPlane=mesh;mode='cine';
    const pl=mesh.userData.plane;
    toast('MODO CINEM\u00C1TICO','Siguiendo '+(pl.callsign||pl.icao||'aeronave'),'good');
    openModal('AERONAVE '+(pl.callsign||pl.icao||''),
      '<div class="stat">Modelo: <b>'+esc(pl.type||'\u2014')+'</b></div>'
      +'<div class="stat">Matr\u00EDcula: <b>'+esc(pl.reg||'\u2014')+'</b></div>'
      +'<div class="stat">Altitud: <b>'+Math.round((pl.altM||0))+' m</b></div>'
      +'<div class="stat">Velocidad: <b>'+Math.round((pl.velKmh||0))+' km/h</b></div>'
      +'<div class="stat">Rumbo: <b>'+Math.round(pl.heading||0)+'\u00B0</b></div>'
      +'<div class="stat">Tipo: <b>'+(pl.mil?'MILITAR':'civil')+'</b></div>'
      +'<div class="sep"></div><button class="btn sm" id="cineExit">SALIR DE C\u00C1MARA DE SEGUIMIENTO</button>',()=>{
        const b=$('#cineExit');if(b)b.onclick=exitCine;
      });
  }
  function exitCine(){followPlane=null;mode='libre';closeModal();}
  /* esp\u00EDas: eventos y recogida */
  function updateSpies(dt){
    spies.forEach(sp=>{sp.energy=Math.max(0,sp.energy-dt*1.4);});
    spyEventT-=dt;
    if(spyEventT<=0){
      spyEventT=rnd(18,36);
      const sp=pick(spies.filter(s=>s.energy>15))||spies[0];
      sp.pulse=true;sp.pulseT=30;
      const cs=nearestCountry(sp.lat,sp.lng)||{n:'zona desconocida'};
      sp.n=cs.n||sp.n;sp.c2=cs.c2||sp.c2;
      toast('SE\u00D1AL DE ESP\u00CDA',sp.n+' tiene algo. \u00A1Tienes 30s!','bad',4200);
      SFX.alarm();
    }
    spies.forEach(sp=>{
      if(sp.pulse){sp.pulseT-=dt;
        if(sp.pulseT<=0){sp.pulse=false;toast('INFORMACI\u00D3N PERDIDA','La se\u00F1al de '+sp.n+' se apag\u00F3...','bad');World.bump(.6,'intel perdida');}
      }
    });
    syncSpyMeshes();
  }
  function spyCollect(sp){
    sp.pulse=false;sp.pulseT=0;
    const intel={t:now(),n:sp.n,txt:'Informe interceptado de '+sp.n+' \u00B7 '+new Date().toLocaleTimeString('es'),kind:'spy'};
    P.files.push(intel);save();
    const from=sp.mesh.position.clone().normalize();
    const to=ll2v(35,10,R*1.05).normalize();
    for(let i=0;i<16;i++){
      const p=from.clone().lerp(to,i/16).multiplyScalar(R*(1.05+Math.sin(i/16*Math.PI)*.25));
      const s=worldToScreen(gGroup.localToWorld(p.clone()));
      if(!s.behind)setTimeout(()=>FX.sparks(s.x,s.y,6,'0,255,135'),i*60);
    }
    addXP(40);addCoins(30,'esp\u00EDa');
    toast('INTELIGENCIA OBTENIDA','Informe de '+sp.n+' archivado','good');
    checkOmega();
  }
  function renderSpyPanel(){
    const el=$('#spyPanel');
    if(!el)return;
    el.innerHTML='<h3 class="ps">RED DE ESP\u00CDAS</h3>'+spies.map((sp,i)=>
      '<div class="spyRow"><span class="tag '+(sp.pulse?'r pulse-btn':'g')+'">ESP-'+(i+1)+'</span>'
      +'<div style="flex:1"><div style="font-size:11px">'+esc(sp.n||'sin destino')+'</div>'
      +'<div class="bar" style="margin-top:3px"><i style="width:'+sp.energy+'%;background:'+(sp.energy<25?'var(--red)':'linear-gradient(90deg,var(--blue),var(--green))')+'"></i></div></div>'
      +'<span class="small">'+Math.round(sp.energy)+'%</span></div>').join('');
  }
  /* ISS / sat\u00E9lite */
  function updateISS(dt){
    if(!DATA.iss)return;
    issGroup.visible=true;
    const p=ll2v(DATA.iss.lat,DATA.iss.lon,R+1.15);
    issGroup.position.copy(p);
    issGroup.lookAt(0,0,0);
    const near=zones().find(z=>llDist(z.lat,z.lng,DATA.iss.lat,DATA.iss.lon)<14);
    if(near)captureReady=!!near;captureZone=near||null;
    issLabel.material.opacity=near?1:.6;
    const cap=$('#issCapture');
    const ip=$('#issPos');
    if(ip&&DATA.iss)ip.textContent=DATA.iss.lat.toFixed(1)+'\u00B0 '+DATA.iss.lon.toFixed(1)+'\u00B0 \u00B7 '+Math.round(DATA.iss.velKmh||27600)+' km/h';
    if(cap){cap.disabled=!near;cap.textContent=near?('CAPTURAR: '+near.name.split(' ')[0].toUpperCase()):'SIN CONFLICTO EN \u00D3RBITA';}
  }
  function llDist(a,b,c,d){return Math.hypot(a-c,Math.min(Math.abs(b-d),360-Math.abs(b-d)));}
  function captureShot(){
    try{
      const src=ThreeEng.renderer().domElement;
      const c=document.createElement('canvas');c.width=220;c.height=140;
      const g=c.getContext('2d');
      g.drawImage(src,innerWidth/2-220,innerHeight/2-140,440,280,0,0,220,140);
      const url=c.toDataURL('image/jpeg',.7);
      const intel={t:now(),n:'Foto satelital \u00B7 '+(captureZone?captureZone.name:'zona'),img:url,kind:'sat'};
      P.files.push(intel);P.analystRep++;save();
      SFX.shutter();Flash.white(.7,90);vibrate(30);
      addXP(25);
      toast('FOTOGRAF\u00CDA SATELITAL','Analista +1 \u00B7 archivo guardado','good');
      checkOmega();
    }catch(e){}
  }
  /* clima — PERF v69: vectores reutilizados, sin new por partícula */
  const _cp=V3(0,0,0),_cn=V3(0,0,0),_ct=V3(0,0,0);
  function updateClouds(dt){
    cloudPts.forEach(cl=>{
      const pos=cl.g.attributes.position;
      const wind=Wind.level;
      for(let i=0;i<pos.count;i++){
        const v=cl.vel[i];
        _cp.set(pos.getX(i),pos.getY(i),pos.getZ(i));
        _cn.copy(_cp).normalize();
        _ct.set(-_cn.z,0,_cn.x).normalize();
        _cp.addScaledVector(_ct,(v.x+wind*1.6)*dt);
        _cp.addScaledVector(_cn,Math.sin(performance.now()/900+i)*.0006);
        if(_cp.length()>R*1.16)_cp.multiplyScalar(R*1.06/_cp.length());
        pos.setXYZ(i,_cp.x,_cp.y,_cp.z);
      }
      pos.needsUpdate=true;
    });
  }
  let coldCd=0;
  function coldBlow(){
    if(coldCd>0)return;
    if(Wind.level>.65||Mic.level>.4){
      coldCd=3;
      World.tension=Math.max(5,World.tension-.25);P.tension=World.tension;
      P.pacRep++;refreshHUD();save();
      toast('PACIFICADOR','Tu soplo fr\u00EDo baja la tensi\u00F3n (-0.25). Rep +'+P.pacRep,'good');
      SFX.whoosh();
    }
  }
  /* --- AR-lite --- */
  let arOn=false;
  async function enterAR(){
    if(arOn){exitAR();return;}
    try{
      const st=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}});
      const v=$('#arcam');v.srcObject=st;v.style.display='block';v.style.zIndex=1;v.play();
      $('#gl3d').style.zIndex=2;
      scene.background=null;ThreeEng.renderer().setClearColor(0x000000,0);
      arOn=true;mode='ar';
      toast('REALIDAD AUMENTADA','Gira el tel\u00E9fono: el globo flota sobre tu mesa. Sopla para mover las llamas.','good',5200);
    }catch(e){toast('AR','Sin acceso a c\u00E1mara. Modo normal.','bad');}
  }
  function exitAR(){
    arOn=false;mode='libre';
    const v=$('#arcam');
    if(v.srcObject){v.srcObject.getTracks().forEach(t=>t.stop());v.srcObject=null;}
    v.style.display='none';$('#gl3d').style.zIndex=0;
    ThreeEng.renderer().setClearColor(0x0A0A0F,1);
  }
  /* --- UI --- */
  function enter(){
    build();initSpies();
    ThreeEng.show('globo');
    ThreeEng.reg('globo',{scene:scene,update:dt=>update(dt)});
    const sec=$('#scr-globo');
    sec.innerHTML=
     '<button class="btn sm back" id="gb">&laquo; HANGAR</button>'
    +'<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center">'
    +'<button class="btn sm" data-tool="iss">ISS ESP\u00CDA</button>'
    +'<button class="btn sm" data-tool="spies">RED DE ESP\u00CDAS</button>'
    +'<button class="btn sm" data-tool="weather">CLIMA</button>'
    +'<button class="btn sm" data-tool="ar">AR</button>'
    +'<button class="btn sm green" data-tool="drone">PILOTAR DRON &raquo;</button>'
    +'</div>'
    +'<div id="globoInfo" style="position:absolute;left:10px;right:10px;bottom:8px;max-height:38vh;overflow:hidden"></div>'
    +'<div id="spyPanel" style="position:absolute;right:10px;top:110px;width:min(250px,44vw)"></div>';
    $('#gb').onclick=()=>go('hangar');
    $$('[data-tool]',sec).forEach(b=>{
      b.onclick=()=>{
        SFX.uiTap();
        const t=b.dataset.tool;
        if(t==='iss'){mode=mode==='iss'?'libre':'iss';issGroup.visible=mode==='iss';
          toast('ISS','Modo sat\u00E9lite '+(mode==='iss'?'ON: inclina o mueve el cursor para cambiar el \u00E1ngulo':'OFF'),'');
          if(mode==='iss'){$('#globoInfo').innerHTML='<div class="panel" style="margin:0 auto;max-width:420px"><div class="rowline"><span class="small">ISS REAL (wheretheiss.at)</span><b class="num mono" id="issPos">...</b></div><button class="btn gold sm" id="issCapture" style="width:100%;margin-top:8px">ESPERANDO CONFLICTO...</button><div class="small" style="margin-top:6px">Cuando la ISS pase sobre una zona de conflicto, los sensores se encienden: CAPTURAR.</div></div>';}
          else $('#globoInfo').innerHTML='';}
        else if(t==='spies'){renderSpyPanel();toast('RED DE ESP\u00CDAS','Arrastra un esp\u00EDa de pa\u00EDs a pa\u00EDs. Cuando pulse en rojo: llega antes de 30s.','',5000);}
        else if(t==='weather'){toast('CLIMA DE CONFLICTOS','Mueve el cursor r\u00E1pido (o sopla al micr\u00F3fono) para dispersar nubes. SOPLO FR\u00CDOLO baja la tensi\u00F3n.','',5000);
          $('#globoInfo').innerHTML='<div class="panel" style="margin:0 auto;max-width:420px"><div class="rowline"><span class="small">Viento detectado</span><b class="num" id="windLvl">0%</b></div>'
          +'<button class="btn sm gold" id="coldBtn" style="width:100%;margin-top:8px">SOPLO FR\u00CDO (-0.25 tensi\u00F3n)</button>'
          +'<button class="btn sm '+(Mic.on?'red':'')+'" id="micBtn" style="width:100%;margin-top:6px">'+(Mic.on?'APAGAR MICR\u00D3FONO':'SOPlar AL MICR\u00D3FONO')+'</button></div>'.replace('SOPlar','SOPLAR');
          $('#coldBtn').onclick=coldBlow;
          $('#micBtn').onclick=async()=>{if(Mic.on){Mic.stop();}else{const ok=await Mic.start();if(ok)toast('MICR\u00D3FONO','Sopla fuerte para generar viento','good');}enter();};
        }
        else if(t==='ar')enterAR();
        else if(t==='drone')go('dron');
      };
    });
    const cam=ThreeEng.camera();
    cam.position.set(0,1.2,5.4);cam.lookAt(0,0,0);
    gGroup.rotation.set(.3,0,0);
    renderSpyPanel();
  }
  function exit(){
    exitAR();followPlane=null;mode='libre';SFX.staticLevel(0);
    $('#globoInfo').innerHTML='';
  }
  function update(dt){
    if(!ready)return;
    idleT+=dt;
    if(!Pointer.down&&mode!=='cine'){
      if(idleT>3)gGroup.rotation.y+=dt*.05;
      gGroup.rotation.y+=rotVY;gGroup.rotation.x=clamp(gGroup.rotation.x+rotVX,-1.1,1.1);
      rotVX*=Math.pow(.06,dt);rotVY*=Math.pow(.06,dt);
    }
    /* llamas con viento — PERF v69: aritmética directa, cero allocs por partícula */
    const t=performance.now()/1000;
    flames.forEach(f=>{
      const pos=f.pts.geometry.attributes.position;
      const wx=clamp(Wind.x*.9,-1,1)*.6,wy=clamp(-Wind.y*.9,-1,1)*.3;
      const w=f.up,t1=f.t1,t2=f.t2;
      const bx=f.base.x,by=f.base.y,bz=f.base.z;
      for(let i=0;i<f.seed.length;i++){
        const s=f.seed[i];
        s.t+=dt*s.s*(1+Wind.level*2.2);if(s.t>1)s.t-=1;
        const h=s.t*1.15*f.zn.i+.05;
        const r=(1-s.t)*.16*f.zn.i+.015;
        const px=Math.cos(s.a)*r+wx*h,py=h,pz=Math.sin(s.a)*r;
        const a1=px+wx*h*1.4;
        pos.setXYZ(i,
          bx+w.x*py+t1.x*a1+t2.x*pz,
          by+w.y*py+t1.y*a1+t2.y*pz,
          bz+w.z*py+t1.z*a1+t2.z*pz);
      }
      pos.needsUpdate=true;
      f.glow.scale.setScalar(1+Math.sin(t*5+f.base.x*9)*.25+Wind.level*.5);
    });
    quakeRings.forEach(r=>{
      r.userData.ph+=dt*1.2;
      const k=(r.userData.ph%1);
      r.scale.setScalar(1+k*4.5*(r.userData.quake.mag||3)/3);
      r.material.opacity=.85*(1-k);
    });
    planes3d.forEach(m=>{m.rotation.y+=dt*.5;});
    updateClouds(dt);
    updateSpies(dt);
    updateISS(dt);
    /* c\u00E1mara */
    const cam=ThreeEng.camera();
    if(mode==='cine'&&followPlane){
      const p=followPlane.getWorldPosition(V3(0,0,0));
      const camPos=p.clone().normalize().multiplyScalar(R+1.1);
      cam.position.lerp(gGroup.localToWorld(camPos),Math.min(1,4*dt));
      cam.lookAt(gGroup.localToWorld(followPlane.position.clone()));
    }else if(mode==='iss'&&DATA.iss){
      const p=issGroup.getWorldPosition(V3(0,0,0));
      const off=V3(Pointer.x/innerWidth-.5,0,Pointer.y/innerHeight-.5).multiplyScalar(1.4)
        .add(V3(Gyro.gamma/90,0,Gyro.beta/90));
      cam.position.lerp(p.clone().add(V3(0,.6,1.2)).add(off),Math.min(1,3*dt));
      cam.lookAt(p);
      if(Pointer.down&&Pointer.moved>2)cam.position.multiplyScalar(1);
    }else{
      const d=cam.position.length();
      cam.position.set(0,0,d);
      if(Pinch.active){cam.position.multiplyScalar(clamp(1/Pinch.delta,.96,1.04));}
      /* FIX v69: clamp SIEMPRE — ni rueda ni pellizco pueden acercarte al nivel del suelo */
      cam.position.clampLength(R*2.05,R*6.5);
      cam.lookAt(0,0,0);
    }
    const wl=$('#windLvl');if(wl)wl.textContent=Math.round((Wind.level+Mic.level)/1.4*100)+'%';
  }
  registerRoom('globo',{section:'scr-globo',three:true,enter,exit,update,onPointerMove,onPointerUp,onWheel,
    onLongPress(x,y){/* en m\u00F3vil: toque largo = soplar r\u00E1faga */Wind.x=rnd(-1,1);Wind.y=-1;Wind.level=1;setTimeout(()=>Wind.level=0,400);}});
  return{spies,enterAR,exitAR,initSpies};
})();
