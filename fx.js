// Dragon Ascension — cinematic battle FX + WebAudio SFX
(function(){
const FXEL={Fire:"fire",Storm:"lightning",Mech:"lightning",Frost:"ice",Water:"water",Sea:"water",Earth:"rock",Nature:"vine",Shadow:"claw",Light:"beam",Spirit:"beam",All:"beam",Acid:"acid",Void:"void",Human:"claw",Trap:"void"};
const COL={fire:["#ff5a1a","#ffb347","#fff1a8"],lightning:["#9fd8ff","#ffffff","#5a8cff"],ice:["#bff4ff","#ffffff","#6ad0ff"],water:["#2a9dff","#9fe3ff","#ffffff"],rock:["#8a6a44","#c9a46a","#5a4028"],vine:["#3fbf3f","#9cff6a","#1f6a1f"],claw:["#2a0a3a","#b050ff","#000000"],beam:["#fff6c0","#ffffff","#ffd34a"],acid:["#8cff3a","#d6ff6a","#3a8a10"],void:["#5a00a0","#c070ff","#10001a"]};
// ---------- audio ----------
let AC=null,muted=localStorage.getItem("da_mute")==="1";
function ac(){if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)();}catch(e){}}if(AC&&AC.state==="suspended")AC.resume();return AC;}
function noise(dur,f0,f1,type,vol){const a=ac();if(!a||muted)return;const n=a.createBufferSource(),b=a.createBuffer(1,a.sampleRate*dur,a.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;n.buffer=b;
 const fl=a.createBiquadFilter();fl.type=type||"lowpass";fl.frequency.setValueAtTime(f0,a.currentTime);fl.frequency.exponentialRampToValueAtTime(f1,a.currentTime+dur);const gn=a.createGain();gn.gain.setValueAtTime(vol||.4,a.currentTime);gn.gain.exponentialRampToValueAtTime(.001,a.currentTime+dur);n.connect(fl).connect(gn).connect(a.destination);n.start();}
function tone(f0,f1,dur,type,vol,delay){const a=ac();if(!a||muted)return;const t=a.currentTime+(delay||0);const o=a.createOscillator(),gn=a.createGain();o.type=type||"sine";o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);gn.gain.setValueAtTime(vol||.3,t);gn.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(gn).connect(a.destination);o.start(t);o.stop(t+dur);}
const SFX={roar(){noise(.7,300,90,"lowpass",.5);tone(110,55,.7,"sawtooth",.15);},whoosh(){noise(.35,400,3000,"bandpass",.35);},
 fire(){noise(.6,1800,300,"lowpass",.5);},lightning(){for(let k=0;k<4;k++)tone(1200+Math.random()*1800,100,.08,"square",.12,k*.05);noise(.3,6000,800,"highpass",.3);},
 ice(){for(let k=0;k<5;k++)tone(2000+k*400,1800+k*300,.12,"triangle",.1,k*.04);},water(){noise(.7,600,200,"lowpass",.45);},rock(){tone(90,40,.4,"sine",.5);noise(.3,500,100,"lowpass",.4);},
 vine(){noise(.4,1200,500,"bandpass",.3);},claw(){noise(.15,4000,1000,"highpass",.4);noise(.15,4000,1000,"highpass",.4);},beam(){tone(600,1200,.6,"sine",.2);tone(900,1800,.6,"sine",.12);},
 acid(){noise(.4,2500,800,"bandpass",.3);tone(300,120,.3,"square",.08);},void(){tone(200,40,.9,"sine",.35);noise(.8,200,60,"lowpass",.3);},
 impact(){tone(140,35,.45,"sine",.7);noise(.25,2000,200,"lowpass",.5);},shatter(){for(let k=0;k<6;k++)noise(.18,7000,2000,"highpass",.2);tone(1500,300,.3,"triangle",.1);},
 summon(){tone(70,40,.5,"sine",.7);tone(392,392,.4,"triangle",.1,.05);tone(523,523,.4,"triangle",.1,.1);},evolve(){[523,659,784,1047].forEach((f,k)=>tone(f,f,.35,"triangle",.15,k*.11));},
 trap(){tone(220,880,.25,"sawtooth",.15);tone(880,220,.25,"sawtooth",.12,.2);},head(){tone(80,160,.6,"sawtooth",.2);noise(.6,300,1200,"bandpass",.3);}};
function play(n){try{SFX[n]&&SFX[n]();}catch(e){}}
// ---------- overlay ----------
let ov,cv,ctx,W,H,raf=null,parts=[],drawers=[];
function ensure(){if(ov)return;ov=document.createElement("div");ov.id="cine";ov.innerHTML='<div class="cine-bg"></div><div class="cine-att"><canvas class="cine-warp"></canvas></div><div class="cine-tgt"><img alt=""></div><canvas class="cine-fx"></canvas><div class="cine-banner"></div>';document.body.appendChild(ov);
 cv=ov.querySelector(".cine-fx");ctx=cv.getContext("2d");addEventListener("resize",size);size();}
function size(){if(!cv)return;const d=Math.min(2,devicePixelRatio||1);W=innerWidth;H=innerHeight;cv.width=W*d;cv.height=H*d;cv.style.width=W+"px";cv.style.height=H+"px";ctx.setTransform(d,0,0,d,0,0);}
function loop(){ctx.clearRect(0,0,W,H);const now=performance.now();drawers=drawers.filter(f=>f(now)!==false);
 ctx.globalCompositeOperation="lighter";parts=parts.filter(p=>{p.life-=16;if(p.life<=0)return false;p.vx*=p.drag||1;p.vy*=p.drag||1;p.vy+=p.g||0;p.x+=p.vx;p.y+=p.vy;p.rot=(p.rot||0)+(p.vr||0);
  const a=Math.max(0,p.life/p.max);ctx.globalAlpha=a;ctx.fillStyle=p.c;
  if(p.shape==="tri"){ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.beginPath();ctx.moveTo(0,-p.s*2);ctx.lineTo(p.s*.6,p.s);ctx.lineTo(-p.s*.6,p.s);ctx.fill();ctx.restore();}
  else if(p.shape==="sq"){ctx.save();ctx.globalCompositeOperation="source-over";ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.fillRect(-p.s,-p.s,p.s*2,p.s*2);ctx.restore();}
  else if(p.shape==="img"){ctx.save();ctx.globalCompositeOperation="source-over";ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.drawImage(p.img,p.sx,p.sy,p.sw,p.sh,-p.dw/2,-p.dh/2,p.dw,p.dh);ctx.restore();}
  else{ctx.beginPath();ctx.arc(p.x,p.y,p.s*(p.grow?(2-a):1),0,6.283);ctx.fill();}return true;});
 ctx.globalAlpha=1;ctx.globalCompositeOperation="source-over";
 if(parts.length||drawers.length)raf=requestAnimationFrame(loop);else raf=null;}
function kick(){if(!raf)raf=requestAnimationFrame(loop);}
function P(o){o.max=o.life;parts.push(o);kick();}
function burst(x,y,cols,n,sp,shape){for(let k=0;k<n;k++){const a=Math.random()*6.283,v=Math.random()*sp;P({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,s:2+Math.random()*4,c:cols[k%cols.length],life:400+Math.random()*500,drag:.94,shape,vr:.2});}}
function img(src){return new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.onerror=()=>r(null);i.src=src;});}
let SPD=+(localStorage.getItem('da_spd')||1);const wait=ms=>new Promise(r=>setTimeout(r,ms/SPD));
function buzz(p){try{navigator.vibrate&&navigator.vibrate(p);}catch(e){}}
// warp: draws art in horizontal slices with a roar/breath displacement concentrated in the upper half (head/wings)
function warp(c,im,t0,dur){const g=c.getContext("2d");const w=c.width,h=c.height;
 drawers.push(now=>{const t=(now-t0)/1000;if(now-t0>dur)return false;g.clearRect(0,0,w,h);const N=48,sh=im.height/N,dh=h/N;
  const roar=Math.max(0,Math.sin(Math.min(1,(now-t0)/dur)*Math.PI));
  for(let k=0;k<N;k++){const y=k/N,up=Math.max(0,1-y*1.6);const off=Math.sin(t*9+y*7)*10*up*roar+Math.sin(t*2.2+y*3)*3;const sc=1+.05*up*roar*Math.sin(t*6);
   const dw=w*sc;g.drawImage(im,0,k*sh,im.width,sh+1,(w-dw)/2+off,k*dh,dw,dh+1);}
  // heat haze / glow pulse
  g.fillStyle=`rgba(255,255,255,${.06*roar})`;g.fillRect(0,0,w,h);});kick();}
// element projectile from A to B over dur ms
function projectile(kind,A,B,dur){const cols=COL[kind]||COL.beam;const t0=performance.now();play(kind==="claw"?"whoosh":kind);
 const dx=B.x-A.x,dy=B.y-A.y,len=Math.hypot(dx,dy),ux=dx/len,uy=dy/len,nx=-uy,ny=ux;
 if(kind==="lightning"||kind==="beam"){drawers.push(now=>{const p=(now-t0)/dur;if(p>1.15)return false;const reach=Math.min(1,p*1.6);
   ctx.save();ctx.globalCompositeOperation="lighter";
   if(kind==="beam"){const wdt=30*Math.sin(Math.min(1,p)*Math.PI)+6;const gr=ctx.createLinearGradient(A.x+nx*wdt,A.y+ny*wdt,A.x-nx*wdt,A.y-ny*wdt);gr.addColorStop(0,"rgba(255,220,80,0)");gr.addColorStop(.5,"rgba(255,255,230,.95)");gr.addColorStop(1,"rgba(255,220,80,0)");
     ctx.strokeStyle=gr;ctx.lineWidth=wdt*2;ctx.beginPath();ctx.moveTo(A.x,A.y);ctx.lineTo(A.x+dx*reach,A.y+dy*reach);ctx.stroke();}
   else{for(let b=0;b<2;b++){ctx.strokeStyle=b?"#ffffff":"#7fc4ff";ctx.lineWidth=b?2:7;ctx.shadowColor="#9fd8ff";ctx.shadowBlur=20;ctx.beginPath();ctx.moveTo(A.x,A.y);const seg=14;
     for(let k=1;k<=seg*reach;k++){const f=k/seg,j=(k===seg?0:(Math.random()-.5)*40);ctx.lineTo(A.x+dx*f+nx*j,A.y+dy*f+ny*j);}ctx.stroke();}}
   ctx.restore();});kick();return;}
 if(kind==="vine"){drawers.push(now=>{const p=Math.min(1,(now-t0)/dur);if(now-t0>dur+250)return false;ctx.save();ctx.strokeStyle="#2f9a2f";ctx.lineCap="round";
   for(let v=0;v<3;v++){ctx.lineWidth=8-v*2;ctx.beginPath();ctx.moveTo(A.x+nx*(v-1)*20,A.y+ny*(v-1)*20);const n=30;for(let k=1;k<=n*p;k++){const f=k/n,w=Math.sin(f*10+v*2)*30*(1-f);ctx.lineTo(A.x+dx*f+nx*(w+(v-1)*20*(1-f)),A.y+dy*f+ny*(w+(v-1)*20*(1-f)));}ctx.stroke();}
   ctx.restore();});kick();}
 const n=kind==="fire"?140:kind==="water"?120:kind==="void"?70:kind==="claw"?0:kind==="vine"?30:60;
 for(let k=0;k<n;k++){const d=Math.random()*dur*.8;setTimeout(()=>{const spd=len/(dur*.45/16);let o={x:A.x+(Math.random()-.5)*20,y:A.y+(Math.random()-.5)*20,vx:ux*spd*(0.8+Math.random()*.4),vy:uy*spd*(0.8+Math.random()*.4),life:dur*.5,c:cols[k%3],s:3+Math.random()*7};
   if(kind==="fire"){const j=(Math.random()-.5)*4;o.vx+=nx*j;o.vy+=ny*j;o.s=6+Math.random()*12;o.grow=true;}
   if(kind==="ice"){o.shape="tri";o.rot=Math.atan2(uy,ux)+1.57;o.s=5+Math.random()*6;}
   if(kind==="rock"){o.shape="sq";o.vy-=6;o.g=.35;o.vr=.2;o.s=4+Math.random()*7;}
   if(kind==="acid"){o.vy-=8;o.g=.45;o.s=5+Math.random()*7;}
   if(kind==="water"){const w=Math.sin(k*.3)*6;o.vx+=nx*w;o.vy+=ny*w;o.s=5+Math.random()*10;}
   if(kind==="void"){const a=Math.random()*6.28;o.x=B.x+Math.cos(a)*140;o.y=B.y+Math.sin(a)*140;o.vx=(B.x-o.x)/(dur*.4/16);o.vy=(B.y-o.y)/(dur*.4/16);o.s=6+Math.random()*10;}
   P(o);},d);}
 if(kind==="claw"){setTimeout(()=>{for(let c=0;c<3;c++){const t1=performance.now()+c*90;drawers.push(now=>{const p=(now-t1)/300;if(p<0)return;if(p>1)return false;ctx.save();ctx.strokeStyle=`rgba(190,90,255,${1-p})`;ctx.shadowColor="#000";ctx.shadowBlur=12;ctx.lineWidth=10*(1-p)+2;ctx.beginPath();
   const ox=(c-1)*36;ctx.moveTo(B.x-80+ox,B.y-90);ctx.quadraticCurveTo(B.x+ox+20,B.y,B.x+60+ox,B.y+90*Math.min(1,p*2));ctx.stroke();ctx.restore();});}play("claw");},dur*.5);}
 if(kind==="fire")for(let k=0;k<40;k++)setTimeout(()=>P({x:A.x+dx*Math.random(),y:A.y+dy*Math.random(),vx:(Math.random()-.5)*2,vy:-1-Math.random()*2,c:"#ffcc66",s:1.5,life:700}),Math.random()*dur);}
function center(el){const r=el.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2,r};}
function floatNum(x,y,txt,col,big){const d=document.createElement("div");d.className="dmgnum"+(big?" big":"");d.textContent=txt;d.style.left=x+"px";d.style.top=y+"px";d.style.color=col||"#fff";document.body.appendChild(d);setTimeout(()=>d.remove(),1300);}
function shake(el,str){el.classList.remove("shake","shake2");void el.offsetWidth;el.classList.add(str>1?"shake2":"shake");setTimeout(()=>el.classList.remove("shake","shake2"),600);}
async function shatter(imEl,B){const im=await img(imEl.src);if(!im)return;const r=imEl.getBoundingClientRect();const cols=6,rows=5;imEl.style.visibility="hidden";
 for(let a=0;a<cols;a++)for(let b=0;b<rows;b++){const sw=im.width/cols,sh=im.height/rows,dw=r.width/cols,dh=r.height/rows;const x=r.left+dw*(a+.5),y=r.top+dh*(b+.5);
  P({shape:"img",img:im,sx:a*sw,sy:b*sh,sw,sh,dw,dh,x,y,vx:(x-B.x)/18+(Math.random()-.5)*6,vy:(y-B.y)/18-4-Math.random()*4,g:.45,vr:(Math.random()-.5)*.3,life:1100,c:"#fff"});}
 burst(B.x,B.y,["#ffffff","#ffd27a","#ff7a3a"],60,10);play("shatter");}
// ---------- the attack cinematic ----------
function big0(o){return (o.amount||0)>=1500||o.destroyed;}
async function attack(o){document.body.classList.toggle('fast',SPD>1);document.body.classList.toggle('faster',SPD>2);ensure();size();const aid=o.aid,el=o.head?o.el:(o.el||"Light");const kind=FXEL[el]||"beam";const you=o.pi===0;
 ov.className="on "+(you?"you":"them");const bg=ov.querySelector(".cine-bg"),att=ov.querySelector(".cine-att"),cw=ov.querySelector(".cine-warp"),tg=ov.querySelector(".cine-tgt"),ti=tg.querySelector("img"),bn=ov.querySelector(".cine-banner");
 const aSrc="art/"+aid+".jpg";bg.style.backgroundImage=`url(${aSrc})`;ti.style.visibility="visible";
 if(o.tid){ti.src="art/"+o.tid+".jpg";tg.classList.remove("direct");tg.dataset.label="";}else{ti.src="";tg.classList.add("direct");tg.dataset.label=o.targetName||"Direct attack!";}
 bn.textContent=(o.head?o.head+" head — ":"")+(o.aname||"");
 const im=await img(aSrc);const ar=att.getBoundingClientRect();const d=Math.min(2,devicePixelRatio||1);cw.width=ar.width*d;cw.height=ar.height*d;
 att.classList.remove("go");void att.offsetWidth;att.classList.add("go");
 if(im)warp(cw,im,performance.now(),1500/SPD);play(o.head?"head":"roar");
 await wait(520);
 const A=center(att),B=center(tg);const from={x:A.x+(you?0:0),y:A.y+(you?-A.r.height*.25:A.r.height*.25)};projectile(kind,from,B,520/SPD);
 att.classList.add("lunge");
 await wait(560);
 // impact
 play("impact");buzz(big0(o)?[40,30,90]:30);burst(B.x,B.y,(COL[kind]||COL.beam).concat(["#ffffff"]),50,9);tg.classList.remove("hit");void tg.offsetWidth;tg.classList.add("hit");
 const big=(o.amount||0)>=1500||o.destroyed;shake(ov,big?2:1);
 if((o.amount||0)>=2000)setTimeout(()=>banner('CRITICAL HIT!','crit'),120);
 if(o.amount)floatNum(B.x,B.y-30,"-"+o.amount,o.toPlayer?"#ff5a5a":"#fff",big);
 if(o.status)setTimeout(()=>floatNum(B.x,B.y+20,o.status.toUpperCase()+"!","#9fd8ff"),250);
 await wait(320);
 if(o.destroyed&&o.tid){await shatter(ti,B);await wait(650);}else await wait(380);
 ov.classList.add("out");await wait(260);ov.className="";att.classList.remove("go","lunge");tg.classList.remove("hit");drawers=[];}
// ---------- field effects ----------
function slam(zone,el){buzz(25);if(!zone)return;const m=zone.querySelector(".mini");if(m){m.classList.add("slam");setTimeout(()=>m.classList.remove("slam"),700);}ensure();size();const c=center(zone);burst(c.x,c.y,COL[FXEL[el]||"beam"],46,7);play("summon");shake(document.getElementById("app"),1);}
function evolve(zone){banner('EVOLVED!','evo');buzz([20,40,20,40,60]);if(!zone)return;const m=zone.querySelector(".mini");if(m){m.classList.add("evolving");setTimeout(()=>m.classList.remove("evolving"),1600);}ensure();size();const c=center(zone);for(let k=0;k<4;k++)setTimeout(()=>burst(c.x,c.y,["#fff6c0","#ffd34a","#ffffff"],30,6),k*220);play("evolve");}
function banner(text,cls){const d=document.createElement("div");d.className="fxbanner "+(cls||"");d.textContent=text;document.body.appendChild(d);setTimeout(()=>d.remove(),1700);}
function trap(name){banner("⚠ TRAP: "+name,"trap");play("trap");}
function head(zone,n){banner("🐉 Pentarch grows head #"+n+"!","head");if(zone){const m=zone.querySelector(".mini");m&&m.classList.add("evolving");setTimeout(()=>m&&m.classList.remove("evolving"),1500);}play("head");}
function confetti(){ensure();size();for(let k=0;k<160;k++)setTimeout(()=>P({x:Math.random()*W,y:-10,vx:(Math.random()-.5)*3,vy:2+Math.random()*3,g:.05,c:['#ffd34a','#ff5a5a','#5ad1ff','#7dff8a','#ff7ae0'][k%5],s:4,shape:'sq',vr:.3,life:2600}),k*12);}
window.DAFX={confetti,buzz,wait,get speed(){return SPD;},toggleSpeed(){SPD=SPD>=3?1:SPD+1;localStorage.setItem('da_spd',SPD);return SPD;},click(){tone(900,500,.06,'triangle',.12);buzz(8);},attack,slam,evolve,trap,head,banner,play,isMuted:()=>muted,toggleMute(){muted=!muted;localStorage.setItem("da_mute",muted?"1":"0");if(!muted)ac();return muted;},unlock:ac};
})();
