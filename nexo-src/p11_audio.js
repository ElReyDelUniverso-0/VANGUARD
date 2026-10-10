/* ================= AUDIO PROCEDURAL (WebAudio + Howler) ================= */
const SFX=(function(){
  let ctx=null,master=null,comp=null,noiseBuf=null,started=false,muted=false;
  let staticSrc=null,staticGain=null,staticFilter=null;
  function ensure(){
    if(started)return true;
    try{
      ctx=new (window.AudioContext||window.webkitAudioContext)();
      comp=ctx.createDynamicsCompressor();
      master=ctx.createGain();master.gain.value=.9;
      master.connect(comp);comp.connect(ctx.destination);
      const len=ctx.sampleRate*2,b=ctx.createBuffer(1,len,ctx.sampleRate),d=b.getChannelData(0);
      for(let i=0;i<len;i++)d[i]=Math.random()*2-1;
      noiseBuf=b;started=true;
      if(window.Howler)Howler.volume(.9);
      return true;
    }catch(e){return false;}
  }
  function resume(){if(!ensure())return;if(ctx.state==='suspended')ctx.resume();}
  function out(pos){ /* pos: THREE.Vector3 opcional -> posicional */
    if(!started)return null;
    if(pos&&ctx.createPanner&&ThreeEng.ready()){
      const p=ctx.createPanner();p.panningModel='equalpower';p.distanceModel='linear';
      p.refDistance=2;p.maxDistance=40;p.rolloffFactor=1.4;
      p.setPosition(pos.x||0,pos.y||0,pos.z||0);p.connect(master);return p;
    }
    return master;
  }
  function env(g,t0,a,peak,dec){g.gain.setValueAtTime(0.0001,t0);g.gain.linearRampToValueAtTime(peak,t0+a);g.gain.exponentialRampToValueAtTime(0.0001,t0+a+dec);}
  function tone(freq,dur,type,vol,dest,slide,dt){
    if(!started||muted)return;
    const t0=ctx.currentTime+(dt||0);
    const o=ctx.createOscillator(),g=ctx.createGain();
    o.type=type||'sine';o.frequency.setValueAtTime(freq,t0);
    if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(20,slide),t0+dur);
    env(g,t0,0.004,vol||.2,dur);
    o.connect(g);g.connect(dest||master);o.start(t0);o.stop(t0+dur+.05);
  }
  function noise(dur,vol,fType,fFreq,fQ,dest,dt,slideF){
    if(!started||muted)return;
    const t0=ctx.currentTime+(dt||0);
    const s=ctx.createBufferSource();s.buffer=noiseBuf;s.loop=true;
    const f=ctx.createBiquadFilter();f.type=fType||'bandpass';f.frequency.setValueAtTime(fFreq||1000,t0);f.Q.value=fQ||1;
    if(slideF)f.frequency.exponentialRampToValueAtTime(Math.max(30,slideF),t0+dur);
    const g=ctx.createGain();env(g,t0,0.005,vol||.2,dur);
    s.connect(f);f.connect(g);g.connect(dest||master);s.start(t0);s.stop(t0+dur+.05);
  }
  const S={};
  S.resume=resume;
  S.muteToggle=function(){muted=!muted;if(window.Howler)Howler.volume(muted?0:.9);if(master)master.gain.value=muted?0:.9;return muted;};
  S.muted=()=>muted;
  /* pasos por material (metal | vidrio | alfombra | hormigon) */
  S.step=function(mat,pos){
    if(!started||muted)return;const dst=out(pos);
    if(mat==='metal'){tone(1500+rnd(-150,300),.09,'triangle',.12,dst);noise(.05,.1,'bandpass',2400,4,dst);}
    else if(mat==='vidrio'){tone(2900+rnd(-200,500),.07,'sine',.09,dst);noise(.04,.06,'highpass',3000,1,dst);}
    else if(mat==='alfombra'){noise(.07,.12,'lowpass',240,1,dst);}
    else{noise(.06,.12,'bandpass',900,2,dst);tone(190,.05,'sine',.07,dst);}
  };
  S.coin=function(big,pos){
    if(!started||muted)return;const dst=out(pos);
    if(big){tone(660,.5,'triangle',.28,dst,650);tone(1320,.6,'sine',.22,dst,1200,.02);tone(1980,.4,'sine',.12,dst,0,.06);}
    else{tone(2300,.12,'square',.12,dst,2900);tone(3400,.1,'sine',.08,dst,0,.05);}
  };
  S.bounce=function(mat,vel,pos){
    if(!started||muted)return;const dst=out(pos);const v=clamp(vel/8,.1,1);
    if(mat==='metal'){tone(900,.15,'triangle',.2*v,dst,300);noise(.08,.14*v,'bandpass',1800,3,dst);}
    else if(mat==='papel'){noise(.09,.14*v,'bandpass',1200,1.5,dst);}
    else{tone(120,.18,'sine',.3*v,dst,60);noise(.07,.18*v,'lowpass',600,1,dst);}
  };
  S.thud=function(pos){if(!started||muted)return;const dst=out(pos);tone(80,.25,'sine',.4,dst,45);noise(.1,.2,'lowpass',300,1,dst);};
  S.pop=function(){if(!started||muted)return;noise(.06,.3,'highpass',1200,1);tone(500,.05,'square',.15);};
  S.shatter=function(){if(!started||muted)return;for(let i=0;i<6;i++)tone(rnd(1800,4200),.3,'sine',.1,null,rnd(1000,2000),i*.03);noise(.35,.2,'highpass',2500,1);};
  S.bell=function(){if(!started||muted)return;tone(880,1.1,'sine',.25);tone(1318,1.3,'sine',.18,0,0,.03);tone(1760,.9,'sine',.1,0,0,.06);};
  S.siren=function(){if(!started||muted)return;for(let i=0;i<3;i++){tone(600,.4,'sawtooth',.14,null,1200,i*.85);tone(1200,.4,'sawtooth',.14,null,600,i*.85+.42);}};
  S.alarm=function(){if(!started||muted)return;for(let i=0;i<4;i++){tone(950,.14,'square',.16,null,0,i*.3);tone(720,.14,'square',.16,null,0,i*.3+.15);}};
  S.explosion=function(){if(!started||muted)return;noise(.9,.5,'lowpass',2600,1,null,0,60);tone(60,.8,'sine',.5,null,30);S.shake?.();};
  S.whoosh=function(){if(!started||muted)return;noise(.4,.2,'bandpass',400,2,null,0,1600);};
  S.key=function(){if(!started||muted)return;noise(.02,.16,'bandpass',3400,6);tone(2000,.02,'square',.05);};
  S.type=function(){if(!started||muted)return;noise(.03,.2,'bandpass',2600,5);};
  S.shutter=function(){if(!started||muted)return;noise(.03,.3,'highpass',2000,1);tone(1400,.04,'square',.2);noise(.05,.2,'bandpass',900,2,null,.08);};
  S.pick=function(){if(!started||muted)return;tone(300,.09,'triangle',.25,null,140);noise(.08,.18,'lowpass',800,1);};
  S.dirt=function(){if(!started||muted)return;noise(.22,.16,'lowpass',500,1,null,0,200);};
  S.vacuum=function(){if(!started||muted)return;noise(1.4,.24,'bandpass',300,2,null,0,2400);};
  S.gear=function(){if(!started||muted)return;for(let i=0;i<5;i++)tone(rnd(240,320),.05,'square',.08,null,0,i*.12);};
  S.heart=function(vol,double){
    if(!started||muted)return;
    tone(55,.16,'sine',vol);
    if(double){tone(48,.14,'sine',vol*.8,null,0,.22);}
  };
  S.fanfare=function(){
    if(!started||muted)return;
    const n=[523,659,784,1046];n.forEach((f,i)=>{tone(f,.28,'triangle',.2,null,0,i*.13);tone(f*2,.2,'sine',.08,null,0,i*.13);});
    tone(1046,.7,'triangle',.22,null,0,.55);
  };
  S.arcade=function(){
    if(!started||muted)return;
    [440,554,659,880,659,554,440].forEach((f,i)=>tone(f,.1,'square',.14,null,0,i*.09));
  };
  S.morse=function(dur){if(!started||muted)return;tone(760,dur,'sine',.18);};
  S.uiTap=function(){if(!started||muted)return;tone(1800,.04,'sine',.08);};
  S.burn=function(){if(!started||muted)return;noise(1.1,.24,'lowpass',900,1,null,0,150);tone(180,.5,'sawtooth',.05,null,60);};
  S.win=function(){S.fanfare();S.bell();};
  S.fail=function(){if(!started||muted)return;tone(300,.5,'sawtooth',.22,null,80);tone(150,.6,'square',.14,null,50,.1);};
  S.engineStart=function(){if(!started||muted||S._eng)return;S._eng=ctx.createOscillator();S._engG=ctx.createGain();
    S._eng.type='sawtooth';S._eng.frequency.value=48;S._engG.gain.value=.08;S._eng.connect(S._engG);S._engG.connect(master);S._eng.start();};
  S.engineStop=function(){if(S._eng){try{S._eng.stop();}catch(e){}S._eng=null;S._engG=null;}};
  S.enginePitch=function(v){if(S._eng)S._eng.frequency.value=40+v*60;};
  S.staticStart=function(){if(!started||staticSrc)return;staticSrc=ctx.createBufferSource();staticSrc.buffer=noiseBuf;staticSrc.loop=true;
    staticFilter=ctx.createBiquadFilter();staticFilter.type='bandpass';staticFilter.frequency.value=1000;staticFilter.Q.value=.6;
    staticGain=ctx.createGain();staticGain.gain.value=0;staticSrc.connect(staticFilter);staticFilter.connect(staticGain);staticGain.connect(master);staticSrc.start();};
  S.staticLevel=function(v){if(staticGain)staticGain.gain.setTargetAtTime(muted?0:clamp(v,0,.7),ctx.currentTime,.1);if(staticFilter)staticFilter.frequency.value=800+v*3000;};
  S.staticStop=function(){if(staticSrc){try{staticSrc.stop();}catch(e){}staticSrc=null;staticGain=null;}};
  S.tts=function(text){ /* ElevenLabs si hay clave; si no, voz del navegador */
    if(!text)return;
    if(CFG.elevenlabs){
      try{
        fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM',{method:'POST',
          headers:{'xi-api-key':CFG.elevenlabs,'Content-Type':'application/json'},
          body:JSON.stringify({text,model_id:'eleven_multilingual_v2'})})
        .then(r=>r.ok?r.arrayBuffer():Promise.reject())
        .then(buf=>{if(!started)ensure();const s=ctx.createBufferSource();ctx.decodeAudioData(buf,b=>{s.buffer=b;s.connect(master);s.start();});})
        .catch(()=>speakBrowser(text));
      }catch(e){speakBrowser(text);}
    }else speakBrowser(text);
  };
  function speakBrowser(text){
    try{const u=new SpeechSynthesisUtterance(text);u.lang='es-ES';u.rate=1.02;speechSynthesis.speak(u);}catch(e){}
  }
  return S;
})();
/* desbloqueo de audio con el primer gesto */
['pointerdown','keydown','touchstart'].forEach(ev=>window.addEventListener(ev,function once(){SFX.resume();window.removeEventListener(ev,once);},{passive:true}));
$('#chipMute').addEventListener('click',()=>{const m=SFX.muteToggle();$('#muteN').textContent=m?'OFF':'ON';});
