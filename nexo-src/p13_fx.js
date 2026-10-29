/* ================= FX 2D: PART\u00CDCULAS, SHAKE, CONFETI, C\u00D3DIGO ================= */
const FX=(function(){
  const cv=$('#fx2d'),ctx=cv.getContext('2d');
  let W=innerWidth,H=innerHeight,DPR=Math.min(devicePixelRatio||1,2);
  let parts=[],lowQ=false;
  function resize(){W=innerWidth;H=innerHeight;DPR=Math.min(devicePixelRatio||1,2);
    cv.width=W*DPR;cv.height=H*DPR;cv.style.width=W+'px';cv.style.height=H+'px';ctx.setTransform(DPR,0,0,DPR,0,0);}
  resize();window.addEventListener('resize',resize);
  function add(p){if(lowQ&&parts.length>140)return;parts.push(p);}
  const API={
    lowQuality(){lowQ=true;},
    dust(x,y,n,spread){for(let i=0;i<(n||8);i++)add({t:'dust',x:x+rnd(-6,6),y:y+rnd(-3,3),vx:rnd(-40,40)*(spread||1),vy:rnd(-30,-4),life:0,max:rnd(.5,1),s:rnd(2,5),c:'rgba(180,190,210,'});},
    sparks(x,y,n,color){for(let i=0;i<(n||14);i++){const a=rnd(0,Math.PI*2),v=rnd(60,320);add({t:'spark',x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-40,life:0,max:rnd(.3,.9),s:rnd(1,3),c:color||'0,255,135'});}},
    confetti(n){const cols=['#1E90FF','#00FF87','#FFC24B','#FF3B30','#B26BFF','#F0F0F0'];
      for(let i=0;i<(n||80);i++)add({t:'conf',x:rnd(0,W),y:rnd(-H*.3,0),vx:rnd(-40,40),vy:rnd(60,240),life:0,max:rnd(1.6,3),s:rnd(3,7),c:pick(cols),rot:rnd(0,6),vr:rnd(-6,6)});},
    rings(x,y,scale,n){for(let i=0;i<(n||3);i++)add({t:'ring',x,y,r:6,life:0,max:.9+i*.25,s:(scale||1)*(1+i*.4),c:'30,144,255'});},
    ink(x,y){for(let i=0;i<10;i++)add({t:'ink',x:x+rnd(-30,30),y:y+rnd(-20,20),r:rnd(8,26),life:0,max:rnd(.8,1.6),s:0,c:'255,59,48'});},
    coinBurst(n){const r=$('#coinsN').getBoundingClientRect();const x=r.left+r.width/2,y=r.top+r.height/2;
      for(let i=0;i<(n||10);i++){const a=rnd(-2.6,-0.5),v=rnd(90,260);add({t:'coin',x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:0,max:rnd(.5,1),s:rnd(2.5,5),c:'255,194,75'});}},
    firework(x,y,cols){const c=cols||['255,194,75','30,144,255','0,255,135','255,255,255'];
      for(let i=0;i<46;i++){const a=rnd(0,Math.PI*2),v=rnd(80,300);add({t:'spark',x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:0,max:rnd(.6,1.3),s:rnd(1.5,3),c:pick(c),grav:120});}},
    codeRain(sec){this._rainUntil=now()+(sec||3)*1000;},
    _rainUntil:0,
    update(dt){
      ctx.clearRect(0,0,W,H);
      if(now()<this._rainUntil&&Math.random()<.5){
        const x=rnd(0,W);add({t:'code',x,y:-20,vy:rnd(300,700),life:0,max:2,s:rnd(10,14),ch:pick(['0','1','{','}','<','>','$','#','*','+']),c:'0,255,135'});
      }
      for(let i=parts.length-1;i>=0;i--){
        const p=parts[i];p.life+=dt;
        if(p.life>=p.max){parts.splice(i,1);continue;}
        const k=1-p.life/p.max;
        if(p.t==='dust'){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=60*dt;ctx.fillStyle=p.c+(.5*k)+')';ctx.beginPath();ctx.arc(p.x,p.y,p.s*(1+p.life),0,7);ctx.fill();}
        else if(p.t==='spark'){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=(p.grav||220)*dt;ctx.globalCompositeOperation='lighter';
          ctx.strokeStyle='rgba('+p.c+','+k+')';ctx.lineWidth=p.s;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x-p.vx*.03,p.y-p.vy*.03);ctx.stroke();
          ctx.globalCompositeOperation='source-over';}
        else if(p.t==='conf'){p.x+=p.vx*dt+Math.sin(p.life*8)*30*dt;p.y+=p.vy*dt;p.vy+=40*dt;p.rot+=p.vr*dt;
          ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.globalAlpha=k;ctx.fillStyle=p.c;ctx.fillRect(-p.s/2,-p.s/4,p.s,p.s/2);ctx.restore();ctx.globalAlpha=1;}
        else if(p.t==='ring'){const rr=p.r+p.life/p.max*160*p.s;ctx.strokeStyle='rgba('+p.c+','+(.7*k)+')';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(p.x,p.y,rr,0,7);ctx.stroke();}
        else if(p.t==='ink'){const rr=p.r+p.life/p.max*34;ctx.fillStyle='rgba('+p.c+','+(.8*k)+')';ctx.beginPath();ctx.arc(p.x,p.y,rr,0,7);ctx.fill();}
        else if(p.t==='coin'){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=500*dt;if(p.y>H-30){p.y=H-30;p.vy*=-.5;}
          ctx.fillStyle='rgba('+p.c+','+k+')';ctx.beginPath();ctx.arc(p.x,p.y,p.s,0,7);ctx.fill();
          ctx.fillStyle='rgba(255,255,255,'+(k*.9)+')';ctx.beginPath();ctx.arc(p.x-p.s*.3,p.y-p.s*.3,p.s*.3,0,7);ctx.fill();}
        else if(p.t==='code'){p.y+=p.vy*dt;ctx.fillStyle='rgba('+p.c+','+k+')';ctx.font=p.s+'px JetBrains Mono';ctx.fillText(p.ch,p.x,p.y);
          if(Math.random()<.2)p.ch=pick(['0','1','{','}','<','>','$','#','*','+']);}
      }
    }
  };
  Loop.add(dt=>API.update(dt));
  return API;
})();
const Shake={t:0,mag:0,
  add(m,ms){this.mag=Math.max(this.mag,m);this.t=Math.max(this.t,(ms||300)/1000);},
  update(dt){if(this.t>0){this.t-=dt;if(this.t<=0)this.mag=0;}},
  ox(){return this.mag?rnd(-this.mag,this.mag):0;},
  oy(){return this.mag?rnd(-this.mag,this.mag):0;}
};
Loop.add(dt=>Shake.update(dt));
function typeText(el,text,cps,done){
  el.textContent='';let i=0;const iv=setInterval(()=>{
    el.textContent=text.slice(0,++i);
    if(i%2===0)SFX.type();
    if(i>=text.length){clearInterval(iv);done&&done();}
  },1000/(cps||28));
  return iv;
}
