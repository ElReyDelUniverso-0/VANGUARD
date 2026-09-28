/* ================= ARCHIVO CLASIFICADO (v69 FUSIÓN TOTAL) =================
   Regla de oro del jefe: IMÁGENES PRIMERO, texto después.
   Cada expediente con veredicto honesto: REAL 🟢 / MITO 🔴 / PARCIAL 🟡.
   Los reptilianos: tono verde reptil + ilustración propia (sin fotos falsas). */
(function(){
  const VERD={g:['REAL \u2713','verd-g'],r:['MITO \u2717','verd-r'],y:['PARCIAL \u2248','verd-y']};
  /* Ilustración original: ojo reptiliano (SVG propio, no es una "foto real") */
  const REPTIL_SVG='<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">'
   +'<defs><radialGradient id="rgA" cx="50%" cy="42%" r="78%"><stop offset="0" stop-color="#16401a"/><stop offset="1" stop-color="#020a04"/></radialGradient></defs>'
   +'<rect width="200" height="120" fill="url(#rgA)"/>'
   +'<g stroke="#1d5c1d" stroke-width="1" fill="none" opacity=".5">'
   +'<path d="M0 22 q10 -8 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0"/>'
   +'<path d="M0 42 q10 -8 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0"/>'
   +'<path d="M0 62 q10 -8 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0"/>'
   +'<path d="M0 82 q10 -8 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0"/>'
   +'<path d="M0 102 q10 -8 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0"/>'
   +'</g>'
   +'<ellipse cx="100" cy="60" rx="54" ry="27" fill="#2f8f2f"/>'
   +'<ellipse cx="100" cy="60" rx="54" ry="27" fill="none" stroke="#61d661" stroke-width="2"/>'
   +'<ellipse cx="100" cy="60" rx="8" ry="24" fill="#03140a"/>'
   +'<circle cx="97" cy="47" r="3.4" fill="#b8ffb8" opacity=".9"/>'
   +'<circle cx="100" cy="60" r="66" fill="none" stroke="#39ff6e" stroke-width="1" opacity=".3"/>'
   +'</svg>';
  const FILES=[
   {id:'reptil',t:'REPTILIANOS EN EL PODER',v:'r',c:'#7CFC00',svg:1,yr:'1994\u2013hoy',
    txt:'La teor\u00EDa afirma que l\u00EDderes del mundo son reptiles con piel humana. No existe una sola prueba f\u00EDsica, gen\u00E9tica o documental: naci\u00F3 de la ciencia ficci\u00F3n (V, 1983) y creci\u00F3 con el folclore de internet. VANGUARD la archiva como MITO y la usa para entrenar tu ojo cr\u00EDtico: cuando algo no tiene fuente verificable, es un cuento.'},
   {id:'paperclip',t:'OPERACI\u00D3N PAPERCLIP',v:'g',img:'/assets/wiki/war-ww2.jpg',yr:'1945\u20131959',
    txt:'EE.UU. reclut\u00F3 en secreto a m\u00E1s de 1.600 cient\u00EDficos alemanes (aeron\u00E1utica, cohetes, medicina) despu\u00E9s de la II Guerra Mundial, borrando su pasado nazi de los expedientes. Wernher von Braun, padre del Saturno V, entr\u00F3 por esta puerta. Desclasificado por el Archivo Nacional en 2010: los papeles est\u00E1n en l\u00EDnea.'},
   {id:'mkultra',t:'PROYECTO MK-ULTRA',v:'g',img:'/assets/cctv/night-street.png',yr:'1953\u20131973',
    txt:'La CIA financi\u00F3 experimentos de control mental: LSD sin consentimiento, hipnosis, aislamiento, en universidades, prisiones y hospitales. El director Richard Helms orden\u00F3 destruir los archivos en 1973, pero 20.000 documentos sobrevivieron y el Senado de EE.UU. los destap\u00F3 en 1977. REAL, y por eso da miedo.'},
   {id:'able83',t:'ABLE ARCHER 83',v:'g',img:'/assets/wiki/war-fria.jpg',yr:'nov. 1983',
    txt:'Un ejercicio militar de la OTAN tan realista (simulaba una escalada nuclear completa) que la URSS crey\u00F3 que era el ataque de verdad y prepar\u00F3 respuesta. Informes desclasificados en 2015 y 2021 muestran al mundo a un mal paso del error definitivo. Ning\u00FAn mito: fue casi el fin.'},
   {id:'area51',t:'\u00C1REA 51 Y EL U-2',v:'y',img:'/assets/osint/jet-patrol.png',yr:'1955\u2013hoy',
    txt:'La base existe: el gobierno la reconoci\u00F3 oficialmente en 2013. Muchos "OVNIS" de los a\u00F1os 50-60 eran vuelos secretos de prueba (U-2, A-12 OXCART) a altitudes imposibles para la \u00E9poca. Lo real: espionaje a\u00E9reo de alto nivel. Lo no probado: alien\u00EDgenas en hangares. PARCIAL, con archivos CIA de por medio.'},
   {id:'zimmer',t:'TELEGRAMA ZIMMERMANN',v:'g',img:'/assets/tv/summit.png',yr:'1917',
    txt:'Mensaje secreto alem\u00E1n a M\u00E9xico proponiendo una alianza y la reconquista de Texas, Nuevo M\u00E9xico y Arizona. Interceptado y descifrado por el Room 40 brit\u00E1nico; publicado en la prensa el 1 de marzo de 1917. EE.UU. entr\u00F3 a la guerra semanas despu\u00E9s. Un solo telegrama cambi\u00F3 el siglo: REAL y verificable.'},
   {id:'stargate',t:'PROYECTO STARGATE',v:'g',img:'/assets/osint/infra-dam.png',yr:'1978\u20131995',
    txt:'La CIA y el ej\u00E9rcito de EE.UU. gastaron ~20 millones de d\u00F3lares en "visi\u00F3n remota": usar ps\u00EDquicos para espiar a la URSS. El programa existi\u00F3 de verdad y fue desclasificado \u00EDntegro en 1995... junto con la conclusi\u00F3n de que nunca produjo intel accionable. REAL el programa, FALSA la ps\u00EDquica.'},
   {id:'luna',t:'\u00BFLA LUNA ES UN PLAT\u00D3?',v:'r',img:'/assets/tv/rocket-launch.png',yr:'1969\u2013hoy',
    txt:'382 kg de rocas lunares analizadas por laboratorios de pa\u00EDses rivales, reflectores l\u00E1ser que a\u00FAn se miden hoy desde la Tierra, y la sonda india Chandrayaan-3 y la LRO fotografiando los sitios de alunizaje con equipamiento visible. El montaje no sobrevive a la evidencia f\u00EDsica: MITO absoluto.'},
   {id:'chem',t:'ESTELAS QU\u00CDCHEMTRAILS',v:'r',img:'/assets/real/jet-1.jpg',yr:'1996\u2013hoy',
    txt:'La idea de que los aviones pulverizan qu\u00EDmicos fue estudiada por 77 cient\u00EDficos atmosf\u00E9ricos (Environ. Res. Lett., 2016): el 76% no vio ninguna evidencia de programas secretos de fumigaci\u00F3n; las estelas son vapor de agua condensado que puede persistir horas seg\u00FAn humedad y temperatura. MITO con encuesta cient\u00EDfica en contra.'},
   {id:'tayos',t:'LA CUEVA DE LOS TAYOS',v:'y',img:'/assets/real/desert-1.jpg',yr:'1969\u20131976',
    txt:'Una cueva real y enorme en la Amazon\u00EDa ecuatoriana. El escritor Erich von D\u00E4niken dijo que guardaba una "biblioteca met\u00E1lica" de una civilizaci\u00F3n perdida. En 1976 una expedici\u00F3n con Neil Armstrong como integrante la explor\u00F3 a fondo: la cueva es verdadera; las plaquetas doradas, nunca aparecieron. PARCIAL: lugar real, leyenda adentro.'}
  ];
  function cardHTML(f,i){
    const vd=VERD[f.v];
    const im=f.img?('<img loading="lazy" src="'+f.img+'" alt="'+esc(f.t)+'">'):(f.svg?REPTIL_SVG:'');
    const read=P['arc_'+f.id];
    return '<div class="arcCard'+(read?' read':'')+'" data-i="'+i+'" style="--ac:'+(f.c||'#1E90FF')+'">'
     +'<div class="imw">'+im+'<span class="arcBadge '+vd[1]+'">'+vd[0]+'</span>'
     +(read?'':'<span class="rw">+30 \u20AC2</span>')+'</div>'
     +'<div class="tt">'+esc(f.t)+'</div>'
     +'<div class="tx">'+esc(f.yr)+' \u00B7 '+esc(f.txt.slice(0,78))+'\u2026</div></div>';
  }
  function render(){
    const sec=$('#scr-room2');
    const done=FILES.filter(f=>P['arc_'+f.id]).length;
    sec.innerHTML='<button class="btn sm back" id="ab2">&laquo; HANGAR</button>'
     +'<div class="scroll" style="flex:1">'
     +'<p class="small" style="margin:0 0 10px">Regla de la casa: <b style="color:var(--txt)">im\u00E1genes primero, texto despu\u00E9s</b>. Primera lectura de cada expediente: <b style="color:var(--gold)">+30 '+IC+'</b> y +25 XP. Le\u00EDdos: <b>'+done+'/'+FILES.length+'</b>'+(done===FILES.length?' \u00B7 <b style="color:var(--green)">EXPEDIENTE COMPLETO</b>':'')+'</p>'
     +'<div class="arcGrid">'+FILES.map(cardHTML).join('')+'</div>'
     +'<div class="small dim" style="margin:12px 0 4px">Fuentes: archivos desclasificados (CIA, Archivo Nacional), prensa hist\u00F3rica y literatura revisada. Las ilustraciones son arte propio de VANGUARD: aqu\u00ED no se publican "fotos" inventadas.</div>'
     +'</div>';
    $('#ab2').onclick=()=>go('hangar');
    $$('#scr-room2 .arcCard').forEach(c=>c.onclick=()=>openFile(FILES[+c.dataset.i]));
  }
  function openFile(f){
    const vd=VERD[f.v];
    const first=!P['arc_'+f.id];
    const im=f.img?('<img src="'+f.img+'" alt="'+esc(f.t)+'">'):(f.svg?REPTIL_SVG:'');
    openModal(esc(f.t),
     '<div class="imwBig">'+im+'</div>'
     +'<div style="margin:10px 0 2px;display:flex;gap:6px;align-items:center;flex-wrap:wrap">'
     +'<span class="arcBadge '+vd[1]+'" style="font-size:10px">'+vd[0]+'</span>'
     +'<span class="tag">'+esc(f.yr)+'</span>'
     +(first?'<span class="tag y">PRIMERA LECTURA +30 '+IC+'</span>':'')
     +'</div>'
     +'<p class="small" style="margin-top:8px">'+esc(f.txt)+'</p>'
     +'<div class="sep"></div><div class="small dim">Archivo Clasificado de VANGUARD \u00B7 veredicto verificado por la redacci\u00F3n OSINT</div>');
    if(first){
      P['arc_'+f.id]=true;
      addCoins(30,'archivo clasificado');addXP(25);SFX.bell();
      const done=FILES.filter(x=>P['arc_'+x.id]).length;
      if(done===FILES.length&&!P.arcAll){
        P.arcAll=true;
        setTimeout(()=>{
          addCoins(200,'expediente completo');addXP(150);
          toast('EXPEDIENTE COMPLETO','Los 10 archivos le\u00EDdos: +200 '+IC+' y +150 XP. Tu criterio vale oro.','gold',6000);
          FX.confetti(80);SFX.win();
          pushFeed('se ley\u00F3 el ARCHIVO CLASIFICADO completo: mito y verdad ya no lo confunden','g');
        },900);
      }
      save();
    }
  }
  registerRoom('archivo',{section:'scr-room2',enter(){Joy.enabled=false;render();},exit(){}});
})();
