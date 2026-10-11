(function(){
const C=DA.CARDS,$=s=>document.querySelector(s),app=$("#app"),modal=$("#modal");
const AR=["CG-04","CG-05","FIR-A-4","LEG-EAR","LEG-FRO","LEG-LIG","LEG-SHA","SR-01","SR-02","SR-03","SR-04","SR-05","SR-06","SR-07","SR-08","SR-09","SR-10","ULT-01","ULT-02","ULT-03","ULT-04","ULT-05","ULT-06","ULT-07","ULT-08","ULT-09","ULT-10","UR-01","UR-02","UR-03"];
const FXE={Water:"sea",Nature:"earth",Fire:"fire",Storm:"storm",Frost:"frost",Earth:"earth",Shadow:"shadow",Light:"light",Sea:"sea",Mech:"storm",Spirit:"frost"};
const FXMAP={"SR-01":"storm","SR-02":"earth","SR-03":"fire","SR-04":"sea","SR-05":"earth","SR-06":"light"};
DA.DATA.cards.forEach(c=>{if(c.rarity==="Creator's Gift")FXMAP[c.id]="ultra";else if((c.rarity==="Super Rare"||c.rarity==="Ultra Rare")&&!FXMAP[c.id])FXMAP[c.id]=(typeof c.element==="string"&&FXE[c.element])||"platinum";});
const img=id=>"cards/"+id+".jpg";
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const GIFT_HASH="d13d5631ec2d22cf58fe56aa2eca1dbe68b0ee66bf19ce5941b9af8ba52b992a";const KEY="dragonAscensionSave_v1";let S;
function save(){localStorage.setItem(KEY,JSON.stringify(S));}
function load(){try{S=JSON.parse(localStorage.getItem(KEY));}catch(e){}if(!S||!S.coll)fresh();else{DA.DATA.cards.forEach(c=>{if(c.deck==="Ascension"||c.creators_gift||c.rarity==="Ultra Rare")return;if(!S.coll.some(x=>x.id===c.id||(C[x.id]&&C[x.id].evolves_from===c.id)))for(let k=0;k<(c.max_copies||1);k++)addCopy(c.id);});save();}}
function fresh(){S={coll:[],deck:[],wins:0,losses:0,points:0,tour:{tier:1,round:0},rewards:[],next:1,gifts:false};
  DA.DATA.cards.forEach(c=>{if(c.deck==="Ascension"||c.creators_gift||c.rarity==="Ultra Rare")return;for(let k=0;k<(c.max_copies||1);k++)addCopy(c.id);});
  S.deck=autoDeckCopies(["Fire","Storm"]);save();}
function addCopy(id){const cp={copy:"c"+(S.next++),id,lxp:0,lvl:0,traits:[],train:{},battles:0,kos:0,wins:0,matches:0};S.coll.push(cp);return cp;}
function cpOf(k){return S.coll.find(c=>c.copy===k);}
function autoDeckCopies(els){const ids=DA.autoDeck(DA.rng(Date.now()%9999+1),els,false);const used=new Set();return ids.map(id=>{const cp=S.coll.find(c=>c.id===id&&!used.has(c.copy));if(cp){used.add(cp.copy);return cp.copy;}return null;}).filter(Boolean).concat(S.coll.filter(c=>!used.has(c.copy)&&DA.isMon(C[c.id])&&C[c.id].stage_number===1&&els.includes(C[c.id].element)).concat(S.coll.filter(c=>!used.has(c.copy)&&C[c.id].type==='Training')).map(c=>c.copy)).filter((v,i,a)=>a.indexOf(v)===i).slice(0,40);}
function deckIds(){return S.deck.map(k=>cpOf(k)).filter(Boolean);}
function stars(l){return l?"★".repeat(Math.min(5,Math.ceil(l/2)))+" Lv"+l:"";}
function fxDiv(id){const f=FXMAP[id];return f?`<div class="fx fx-${f}"></div>${C[id].rarity==="Super Rare"?'<div class="fx fx-holo"></div>':C[id].rarity==="Ultra Rare"?'<div class="fx fx-platinum"></div>':""}`:"";}
// ---------- screens ----------
function home(){G=null;app.innerHTML=`<div class="wrap"><h1>🐉 Dragon Ascension</h1>
<p style="text-align:center">Wins: <b>${S.wins}</b> / 100 for the Rare Reward • Training Points: <b>${S.points}</b></p>
<button class="big demobtn" id="b-demo">🔥 Play Demo Fight</button>
<button class="big" id="b-quick">⚔️ Quick Duel vs AI</button>
<button class="big" id="b-tour">🏆 Tournament (Tier ${S.tour.tier})</button>
<button class="big" id="b-deck">🃏 Deck Builder (${S.deck.length}/40)</button>
<button class="big" id="b-train">💪 Training Grounds & Collection</button>
<button class="big" id="b-rules">📜 How to Play</button><button class="big" id="b-gift">🎁 Redeem Creator's Gift code</button>
<p style="text-align:center;font-size:12px;opacity:.7">Progress is saved on this device. <a href="#" id="reset" style="color:#d9a948">Reset save</a></p></div>`;
$("#b-quick").onclick=()=>startDuel(null);$("#b-demo").onclick=()=>{DAFX.unlock();startDemo();};$("#b-tour").onclick=tourney;$("#b-deck").onclick=deckBuilder;$("#b-train").onclick=training;$("#b-rules").onclick=rules;$("#b-gift").onclick=redeem;
$("#reset").onclick=e=>{e.preventDefault();if(confirm("Erase all progress?")){fresh();home();}};}
function rules(){app.innerHTML=`<div class="wrap"><h2>How to Play</h2><div style="max-width:640px;margin:auto;line-height:1.5">
<p><b>Goal:</b> each player has 8000 LP. Win by: bringing your rival to 0 LP • <b>Ascension Victory</b> — keep an Elder Dragon or Legendary alive for 3 of your turns • your rival must draw from an empty deck (<b>Deck Out</b>) • <b>Dragon Extinction</b> — rival has no dragons left anywhere • no single card wins by itself — even Creator's Gifts can be stopped by Traps.</p>
<p><b>Legions (8):</b> Fire • Water • Nature • Mountain (Earth cards) • Sky (Storm cards) • Frost • Shadow • Light. A deck whose monsters all come from one Legion gets +100 ATK/DEF on every monster. Mixing Legions makes a <b>Wild Mix</b> deck: no bonus, but you start with 6 cards. Neutral cards (spells, traps, relics, multi-element, Human/Mech/Spirit, Creator's Gifts) fit any deck.</p><p><b>Advantage (+500 in battle):</b> Water beats Fire & Nature • Fire beats Nature & Mountain • Nature beats Mountain & Sky • Mountain beats Sky & Shadow • Sky beats Shadow & Frost • Shadow beats Frost & Light • Frost beats Light & Water • Light beats Water & Fire.</p><p><b>Turn:</b> draw, gain Dragon Energy (1 on your first turn, +1 each turn, max 10), play cards, attack, end turn.</p>
<p><b>Playing:</b> tap a card in your hand, then Play (Attack stance) or Guard. Spells that target ask you to tap a monster.</p>
<p><b>Battle:</b> tap your monster → Attack → tap an enemy (red) or Direct. ATK vs ATK: loser destroyed, difference as damage. ATK vs Guard: beat DEF to destroy, otherwise you take the difference. Element advantage gives +500.</p>
<p><b>XP & Evolution:</b> dragons gain XP from surviving turns (+1), wins (+2, +1 with advantage), direct hits (+1) and Training cards. At 3/5/8 XP they evolve into the next stage (card must be in your hand or deck). Elders with 10 XP Ascend to a Legendary or Exalt.</p>
<p><b>Lifetime growth:</b> each card copy you own keeps lifetime XP across matches. Levels give +50 ATK/DEF each and may roll a random trait (max 3). At level 3 a dragon permanently evolves in your collection.</p>
<p><b>Tournament:</b> beat 8 bots of rising difficulty to become champion; then a harder tier opens. Points buy training at the Training Grounds. Every win counts toward the 100-win Rare Reward.</p></div><button class="big" onclick="DAUI.home()">Back</button></div>`;}
async function redeem(){const code=prompt("Enter the Creator's Gift code you received:");if(!code)return;
 const h=Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(code.trim().toUpperCase())))).map(b=>b.toString(16).padStart(2,"0")).join("");
 const G={};G[GIFT_HASH]=["UR-01","UR-02","UR-03","CG-04","CG-05"];S.usedCodes=S.usedCodes||[];
 if(!G[h])return alert("That code is not valid.");if(S.usedCodes.includes(h))return alert("Already redeemed on this device.");
 S.usedCodes.push(h);G[h].forEach(id=>addCopy(id));save();alert("🎁 The Creator's Gifts are now in your collection!");home();}
// ---------- deck builder ----------
let filt="All";
function deckBuilder(){const inDeck=new Set(S.deck);const groups={};S.coll.forEach(cp=>{(groups[cp.id]=groups[cp.id]||[]).push(cp);});
 const ids=Object.keys(groups).filter(id=>filt==="All"||C[id].element===filt||C[id].type===filt).sort((a,b)=>(C[a].set_no>C[b].set_no?1:-1));
 const v=DA.validateDeck(deckIds().map(c=>c.id));
 app.innerHTML=`<div class="wrap"><h2>Deck Builder</h2><div class="bar"><span>Deck: <b>${S.deck.length}</b>/40 ${v?"⚠️ "+esc(v):"✅ Valid"} • Legion: <b>${esc(DA.deckLegion(deckIds()))}</b></span>
 <span><select id="filt">${["All","Fire","Water","Nature","Earth","Storm","Frost","Shadow","Light","Creature","Magic","Training","Relic","Lair","Rider","Dragon Egg","Ancient","Trap"].map(f=>`<option ${f===filt?"selected":""}>${f}</option>`).join("")}</select>
 <select id="auto"><option value="">Auto-build…</option>${["Fire","Water","Nature","Earth","Storm","Frost","Shadow","Light","Fire,Storm","Water,Nature","Frost,Shadow","Earth,Light"].map(x=>`<option>${x}</option>`).join("")}</select>
 <button id="clr">Clear</button><button onclick="DAUI.home()">Done</button></span></div>
 <div class="grid">${ids.map(id=>{const cps=groups[id];const n=cps.filter(c=>inDeck.has(c.copy)).length;const lv=Math.max(...cps.map(c=>c.lvl||0));
  return `<div class="gcard" style="background-image:url(${img(id)})" data-id="${id}">${lv?`<span class="lv">${stars(lv)}</span>`:""}<div class="cnt"><button data-m="${id}">−</button>${n}/${cps.length}<button data-p="${id}">+</button></div></div>`}).join("")}</div></div>`;
 $("#filt").onchange=e=>{filt=e.target.value;deckBuilder();};
 $("#auto").onchange=e=>{if(e.target.value){S.deck=autoDeckCopies(e.target.value.split(","));save();deckBuilder();}};
 $("#clr").onclick=()=>{S.deck=[];save();deckBuilder();};
 app.querySelectorAll("[data-p]").forEach(b=>b.onclick=e=>{e.stopPropagation();const id=b.dataset.p;if(S.deck.length>=40)return;const cp=groups[id].find(c=>!inDeck.has(c.copy));if(cp){S.deck.push(cp.copy);save();deckBuilder();}});
 app.querySelectorAll("[data-m]").forEach(b=>b.onclick=e=>{e.stopPropagation();const id=b.dataset.m;const k=S.deck.findIndex(x=>cpOf(x)&&cpOf(x).id===id);if(k>=0){S.deck.splice(k,1);save();deckBuilder();}});
 app.querySelectorAll(".gcard").forEach(d=>d.onclick=()=>detail(d.dataset.id,groups[d.dataset.id].sort((a,b)=>(b.lvl||0)-(a.lvl||0))[0]));}
// ---------- detail ----------
function detail(id,cp,extra){const c=C[id];const t=cp&&cp.traits||[];
 modal.innerHTML=`<div class="detail"><div class="cardview ${extra&&extra.evo?"evo":""}"><img src="${img(id)}" alt="${esc(c.name)}">${fxDiv(id)}
 <div class="badges">${cp&&cp.lvl?`<span class="stars">${stars(cp.lvl)}</span>`:"<span></span>"}</div></div>
 ${extra&&extra.html||""}
 ${t.length?`<div class="traits">${t.map(x=>`<span class="trait ${DA.TR[x].tier}">${DA.TR[x].name}: ${DA.TR[x].txt}</span>`).join("")}</div>`:""}
 ${cp?`<p style="font-size:13px">Lifetime: Lv ${cp.lvl||0} • ${cp.lxp||0}/${DA.LIFE.xpPerLevel} XP • ${cp.matches||0} matches • ${cp.battles||0} battles • ${cp.kos||0} KOs${cp.train&&(cp.train.atk||cp.train.def)?` • Trained +${cp.train.atk||0}/+${cp.train.def||0}`:""}</p>`:""}
 <div id="arbox"></div>
 ${AR.includes(id)?`<button id="ar">📱 View in AR / 3D</button>`:""}<button id="cls">Close</button></div>`;
 modal.classList.remove("hidden");$("#cls").onclick=()=>modal.classList.add("hidden");
 if($("#ar"))$("#ar").onclick=()=>{$("#arbox").innerHTML=`<model-viewer src="models/${id}.glb" ios-src="models/${id}.usdz" ar ar-modes="webxr scene-viewer quick-look" ar-scale="auto" camera-controls auto-rotate autoplay animation-name="Idle" shadow-intensity="1" exposure="1.1" alt="3D ${esc(c.name)}"><button slot="ar-button" style="position:absolute;bottom:10px;left:50%;transform:translateX(-50%)">👋 Place in your room</button></model-viewer><p style="font-size:12px">AR needs a phone with ARCore (Android) or iOS Quick Look, and the game served over HTTPS.</p>`;};}
// ---------- training ----------
function addLxp(cp,n,evs){const old=cp.lvl||0;cp.lxp=(cp.lxp||0)+n;let lv=Math.min(10,Math.floor(cp.lxp/100));const c=C[cp.id];
 if(c.evolves_to&&lv>=3){evs.push({from:cp.id,to:c.evolves_to});cp.id=c.evolves_to;cp.lxp=0;lv=0;}
 else if(lv>old){evs.push({level:lv,id:cp.id});if((cp.traits||[]).length<3&&Math.random()<0.6){const t=DA.rollTrait(Math.random,cp.traits);cp.traits.push(t);evs.push({trait:t,id:cp.id});}}
 cp.lvl=lv;}
let tsel=null;
function training(){const mons=S.coll.filter(cp=>DA.isMon(C[cp.id])).sort((a,b)=>(b.lvl||0)-(a.lvl||0)||(C[a.id].set_no>C[b.id].set_no?1:-1));
 const cp=tsel&&cpOf(tsel);
 app.innerHTML=`<div class="wrap"><h2>Training Grounds</h2><div class="bar"><span>Training Points: <b>${S.points}</b></span><button onclick="DAUI.home()">Back</button></div>
 ${cp?`<div style="text-align:center"><b>${esc(C[cp.id].name)}</b> (${cp.copy}) ${stars(cp.lvl)}<br>
 <button data-t="atk" ${S.points<20?"disabled":""}>+100 ATK (20 pts)</button><button data-t="def" ${S.points<20?"disabled":""}>+100 DEF (20 pts)</button>
 <button data-t="xp" ${S.points<30||(cp.train.xp||0)>=2?"disabled":""}>+1 starting XP (30 pts, max 2)</button><button data-t="lxp" ${S.points<40?"disabled":""}>Spar: +60 lifetime XP (40 pts)</button>
 <button id="inf">Card info</button></div>`:`<p style="text-align:center">Tap a monster to train it. Each training also gives lifetime XP, so levels and random traits can roll.</p>`}
 <div class="grid">${mons.map(m=>`<div class="gcard" data-c="${m.copy}" style="background-image:url(${img(m.id)});${m.copy===tsel?"outline:3px solid #4fd1ff":""}">${m.lvl?`<span class="lv">${stars(m.lvl)}</span>`:""}${m.traits.length?`<div class="cnt" style="font-size:10px;justify-content:center">${m.traits.map(t=>DA.TR[t].name).join(", ")}</div>`:""}</div>`).join("")}</div></div>`;
 app.querySelectorAll("[data-c]").forEach(d=>d.onclick=()=>{tsel=d.dataset.c;training();window.scrollTo(0,0);});
 if($("#inf"))$("#inf").onclick=()=>detail(cp.id,cp);
 app.querySelectorAll("[data-t]").forEach(b=>b.onclick=()=>{const t=b.dataset.t,cost={atk:20,def:20,xp:30,lxp:40}[t];if(S.points<cost)return;S.points-=cost;
  if(t==="lxp"){}else cp.train[t]=(cp.train[t]||0)+(t==="xp"?1:100);const evs=[];addLxp(cp,t==="lxp"?60:25,evs);save();training();if(evs.length)results(evs,null,training);});}
// ---------- tournament ----------
const BOTS=["Apprentice Pip","Scout Rhea","Tamer Joss","Drake Knight Ulla","Wyvern Lord Kade","Storm Witch Nara","Elder Warden Thorne","CHAMPION Valdris"];
function tourney(){const t=S.tour;app.innerHTML=`<div class="wrap"><h2>🏆 Tournament — Tier ${t.tier}</h2>
 <div class="ladder">${BOTS.map((b,i)=>`<div class="rung ${i<t.round?"done":i===t.round?"next":""}"><span>${i+1}. ${b}${i===7?" 👑":""}</span><span>${botPts(t.tier,i)} pts ${i<t.round?"✅":""}</span></div>`).join("")}</div>
 <button class="big" id="go">Fight ${BOTS[t.round]}</button><button class="big" onclick="DAUI.home()">Back</button></div>`;
 $("#go").onclick=()=>startDuel({tier:t.tier,round:t.round});}
function botPts(tier,r){return Math.round((10+r*8+(r===7?40:0))*tier);}
function botDeck(info){const E=["Fire","Water","Nature","Earth","Storm","Frost","Shadow","Light"];const r=DA.rng((info?info.tier*31+info.round*7:Date.now()%999)+1);const a=E[Math.floor(r()*8)],b=E[(E.indexOf(a)+1+Math.floor(r()*6))%8];
 const lvl=info?Math.min(10,Math.floor(info.round/2)+(info.tier-1)*2):0;
 return DA.autoDeck(r,[a,b],false).map(id=>{const o={id,lvl:DA.isMon(C[id])?lvl:0,traits:[]};if(info&&DA.isMon(C[id])){const nt=Math.min(3,Math.floor((info.round+(info.tier-1)*4)/3));for(let k=0;k<nt;k++)o.traits.push(DA.rollTrait(r,o.traits,info.round===7));}return o;});}
// ---------- duel ----------
let G=null,sel=null,mode=null,TI=null;
function startDuel(info){const deck=deckIds();const v=DA.validateDeck(deck.map(c=>c.id));if(v){alert("Fix your deck first: "+v);return deckBuilder();}
 TI=info;G=DA.newGame(deck.map(c=>({...c,traits:c.traits.slice(),train:{...c.train}})),botDeck(info),{});G.p[1].name=info?BOTS[info.round]:"AI Tamer";sel=null;mode=null;G.fx=[];render();}
function mini(m,pi){if(!m)return"";if(m.egg)return `<div class="mini egg">🥚<span class="tag">${pi===0?m.egg:"?"}</span></div>`;const c=C[m.id];
 const thr=DA.THR[c.stage];const pb=m.id==="CG-06"?`<span class="heads">🐉×${m.heads}</span><div class="pbars"><div class="ar"><i style="width:${Math.min(100,m.armor/30)}%"></i></div><div class="hp"><i style="width:${Math.min(100,m.hp/50)}%"></i></div></div>`:"";
 return `<div class="mini ${m.stance==="def"?"guard":""} ${m.frozen?"frozen":""} ${m.stun>0?"stun":""} ${m.acid>0?"acid":""} ${m.void>0?"void":""}" style="background-image:url(${img(m.id)})">${fxDiv(m.id)}${pb}${thr?`<div class="xp" style="width:${Math.min(100,m.xp/thr*100)}%"></div>`:""}<span class="tag">${m.stance==="def"?"🛡":"⚔"}${m.lvl?" ★"+m.lvl:""}</span><div class="st">${m.id==="CG-06"?`ATK ${DA.stat(G,pi,m,"atk")} • 🛡${m.armor} ❤${m.hp}`:DA.stat(G,pi,m,"atk")+"/"+DA.stat(G,pi,m,"def")}${thr?` • ${m.xp}/${thr}xp`:""}</div></div>`;}
let BUSY=false;
async function runFx(){if(!G)return;BUSY=true;const ev=(G.fx||[]).splice(0);const post=[];
 for(let k=0;k<ev.length;k++){const e=ev[k];
  if(e.type==="attack"){let amount=0,toPlayer=false,destroyed=false,status=null;
   for(let j=k+1;j<ev.length&&!["attack","summon"].includes(ev[j].type);j++){const f=ev[j];
    if(f.type==="dmg"){amount=Math.max(amount,f.amount);if(f.pi!==e.pi)toPlayer=true;}
    if(f.type==="hit"||f.type==="armor")amount=Math.max(amount,f.amount||0);
    if(f.type==="destroy"&&f.pi!==e.pi&&f.i===e.t)destroyed=true;
    if(f.type==="status"&&!status)status=f.status;
    if(f.type==="trap"){DAFX.trap(f.name);await new Promise(r=>setTimeout(r,900/DAFX.speed));}}
   const P=G.p[e.pi];const a=C[e.aid];
   if(destroyed&&!status)status="Destroyed";await DAFX.attack({pi:e.pi,aid:e.aid,tid:e.tid,el:e.el,head:e.head,amount,toPlayer,destroyed,status,aname:a?a.name:"",targetName:G.p[1-e.pi].name});}
  else if(e.type==="trap"&&!(k>0&&ev.slice(0,k).some(x=>x.type==="attack"))){DAFX.trap(e.name);await new Promise(r=>setTimeout(r,900));}
  else if(e.type==="summon"||e.type==="evolve"||e.type==="head")post.push(e);}
 render();
 for(const e of post){const z=document.querySelector(e.pi===0?`[data-o="${e.i}"]`:`[data-e="${e.i}"]`);
  if(e.type==="summon")DAFX.slam(z,e.el);if(e.type==="evolve")DAFX.evolve(z);if(e.type==="head")DAFX.head(z,e.heads);
  await new Promise(r=>setTimeout(r,(e.type==="summon"?350:900)/DAFX.speed));}
 BUSY=false;}
function polish(myTurn,targets){const me=G.p[0];const e=$("#end");
 if(e){const can=me.hand.some(h=>DA.canPlay(G,0,h))||[0,1,2].some(i=>DA.canAttack(G,0,i));e.classList.toggle("pulse",!can);e.classList.add("bigend");}
 const sp=document.createElement("button");sp.className="spd";sp.textContent=["","▶1x","⏩2x","⏭3x"][DAFX.speed];sp.onclick=()=>{DAFX.toggleSpeed();render();};const bar=document.querySelector('[data-lp="0"]');bar&&bar.appendChild(sp);
 const ap=document.createElement("button");ap.className="spd"+(AUTO?" on":"");ap.textContent=AUTO?"🤖 Auto ON":"🤖 Auto";ap.onclick=()=>{AUTO=!AUTO;render();};bar&&bar.appendChild(ap);
 if(AUTO&&myTurn){clearTimeout(autoStep.t);autoStep.t=setTimeout(autoStep,450/DAFX.speed);}
 // aim arrows
 if(mode&&mode.kind==="attack"){const a=document.querySelector(`[data-o="${mode.i}"]`);if(a){const ar=a.getBoundingClientRect();let svg='<svg class="aim" width="'+innerWidth+'" height="'+document.body.scrollHeight+'">';
  targets.forEach(t=>{const z=t==="direct"?document.querySelector('[data-lp="1"]'):document.querySelector(`[data-e="${t}"]`);if(!z)return;const r=z.getBoundingClientRect();
   svg+=`<line x1="${ar.left+ar.width/2}" y1="${ar.top+scrollY}" x2="${r.left+r.width/2}" y2="${r.bottom+scrollY}" />`;});svg+='</svg>';const d=document.createElement("div");d.innerHTML=svg;app.appendChild(d.firstChild);}}
 // long-press to read a card big
 app.querySelectorAll("[data-h],[data-o],[data-e]").forEach(el=>{let tm=null;el.addEventListener("pointerdown",()=>{tm=setTimeout(()=>{tm="fired";let m=null;if(el.dataset.h!=null)m=me.hand[+el.dataset.h];else if(el.dataset.o!=null)m=me.field[+el.dataset.o];else m=G.p[1].field[+el.dataset.e];if(m&&!m.egg){DAFX.buzz(15);detail(m.id,m.copy?cpOf(m.copy):null);}},480);});
  ["pointerup","pointerleave","pointercancel"].forEach(ev=>el.addEventListener(ev,()=>{if(tm&&tm!=="fired")clearTimeout(tm);}));
  el.addEventListener("click",e=>{if(tm==="fired"){e.stopImmediatePropagation();e.preventDefault();tm=null;}},true);});
 // drag a hand card onto the field
 app.querySelectorAll(".hcard.ok").forEach(el=>{let g=null,sx,sy;el.addEventListener("pointerdown",e=>{sx=e.clientX;sy=e.clientY;});
  el.addEventListener("pointermove",e=>{if(sx==null||BUSY)return;if(!g&&Math.hypot(e.clientX-sx,e.clientY-sy)>18){g=el.cloneNode(true);g.className="hcard ghost";g.style.backgroundImage=el.style.backgroundImage;document.body.appendChild(g);try{el.setPointerCapture(e.pointerId);}catch(_){}}
   if(g){g.style.left=e.clientX+"px";g.style.top=e.clientY+"px";}});
  el.addEventListener("pointerup",e=>{sx=null;if(!g)return;g.remove();g=null;const z=document.elementFromPoint(e.clientX,e.clientY);const zone=z&&z.closest("[data-o],[data-e]");const k=+el.dataset.h;const c=C[me.hand[k].id];
   const tt=DA.needsTarget(c)||(c.type==="Relic"&&c.id!=="CG-05"?"own":null);
   act(()=>{if(DA.isMon(c)){DA.play(G,0,k,zone&&zone.dataset.o!=null&&!me.field[+zone.dataset.o]?+zone.dataset.o:null,"atk");}
    else if(tt==="own"&&zone&&zone.dataset.o!=null)DA.play(G,0,k,+zone.dataset.o);else if(tt==="enemy"&&zone&&zone.dataset.e!=null)DA.play(G,0,k,+zone.dataset.e);else if(!tt)DA.play(G,0,k,null);mode=null;});});});}
let AUTO=false;
function autoStep(){if(!AUTO||!G||G.cur!==0||G.winner!=null)return;if(BUSY||mode){clearTimeout(autoStep.t);autoStep.t=setTimeout(autoStep,300);return;}BUSY=true;
 // AI plays our turn (cards + attacks), then ends it; then the opponent responds
 DA.aiTurn(G,0);BUSY=false;runFx().then(()=>{if(G&&G.winner==null&&G.cur===1)setTimeout(()=>{DA.aiTurn(G,1);runFx().then(()=>{if(G&&G.winner==null&&G.cur===0)DAFX.banner('YOUR TURN','turn');});},400/DAFX.speed);});}
function tutorial(){if(localStorage.getItem("da_tut"))return;const tips=["👆 Tap a glowing card in your hand (or drag it onto the field) to play it.","🐉 Tap your monster, then tap a red enemy to attack. Hold any card to read it big.","⚡ You get more Dragon Energy every turn. Dragons gain XP and EVOLVE in battle!","➡️ Tap End Turn when you're done. Watch out for face-down Traps!"];let k=0;
 const d=document.createElement("div");d.className="tut";const show=()=>{if(k>=tips.length){d.remove();localStorage.setItem("da_tut","1");return;}d.innerHTML=`<div>${tips[k]}</div><button>${k<tips.length-1?"Next":"Let's fight!"}</button>`;d.querySelector("button").onclick=()=>{k++;show();};};show();document.body.appendChild(d);}
document.addEventListener("click",e=>{if(e.target.closest("button,.hcard,.zone,.gcard"))DAFX.click();},true);
function act(fn){if(BUSY)return;fn();runFx();}
function render(){if(!G)return;const me=G.p[0],ai=G.p[1];const myTurn=G.cur===0&&G.winner==null;
 let targets=[];if(mode&&mode.kind==="attack")targets=DA.legalTargets(G,0,mode.i);
 const handSel=mode&&mode.kind==="card"?mode.h:null;
 app.innerHTML=`<div class="wrap">
 <div class="bar ${ai.burn&&ai.burn.n>0?"burn":""}" data-lp="1"><span>🤖 ${esc(ai.name)} (${esc(ai.legion)})</span><span class="lp">❤️ ${ai.lp}</span><span>⚡${ai.energy} 🂠${ai.hand.length} 📚${ai.deck.length}${ai.lair?" 🏔"+esc(C[ai.lair.id].name):""}${ai.traps.length?" 🪤×"+ai.traps.length:""}</span></div>
 <div class="zones">${ai.field.map((m,i)=>`<div class="zone ${targets.includes(i)||(mode&&mode.kind==="enemy"&&m&&!m.egg)?"target":""}" data-e="${i}">${mini(m,1)}</div>`).join("")}</div>
 <div class="log" id="log">${G.log.slice(-12).map(esc).join("<br>")}</div>
 <div class="actions" id="acts"></div>
 <div class="zones">${me.field.map((m,i)=>`<div class="zone ${mode&&mode.kind==="attack"&&mode.i===i?"sel":""} ${mode&&mode.kind==="own"&&m&&!m.egg?"target":""}" data-o="${i}">${mini(m,0)}</div>`).join("")}</div>
 <div class="bar ${me.burn&&me.burn.n>0?"burn":""}" data-lp="0"><span>🧑 You (${esc(me.legion)})</span><span class="lp">❤️ ${me.lp}</span><span>⚡${me.energy}/10 📚${me.deck.length} T${G.turn}${me.lair?" 🏔"+esc(C[me.lair.id].name):""}${me.rider?" 🏇"+esc(C[me.rider.id].name):""}${me.traps.length?" 🪤"+me.traps.map(t=>esc(C[t.id].name)).join(", "):""}</span></div>
 <div class="hand">${me.hand.map((h,k)=>`<div class="hcard ${myTurn&&DA.canPlay(G,0,h)?"ok":""} ${handSel===k?"sel":""}" data-h="${k}" style="background-image:url(${img(h.id)})">${h.lvl?`<span class="tag" style="position:absolute;top:2px;left:2px;font-size:10px;background:#000b;color:gold">★${h.lvl}</span>`:""}</div>`).join("")}</div></div>`;
 const acts=$("#acts");
 if(G.winner!=null){acts.innerHTML=`<h2>${G.winner===0?"🏆 Victory!":"💀 Defeat"} — ${esc(G.reason)}</h2><button id="fin">Continue</button>`;$("#fin").onclick=finish;return;}
 if(mode&&mode.kind==="card"){const h=me.hand[mode.h],c=C[h.id];const ok=myTurn&&DA.canPlay(G,0,h);
  acts.innerHTML=`<b style="width:100%;text-align:center">${esc(c.name)} (⚡${c.cost??"-"})</b>${ok?(DA.isMon(c)?`<button id="pa">Summon ⚔</button><button id="pg">Summon 🛡</button>`:`<button id="pp">${DA.needsTarget(c)||c.type==="Relic"||c.id==="UR-03"?"Choose target":c.type==="Trap"?"Set face-down":"Play"}</button>`):"<span>Can't play now</span>"}<button id="pi">Info</button><button id="pc">Cancel</button>`;
  const go=st=>{const tt=DA.needsTarget(c)||(c.type==="Relic"||c.id==="UR-03"?"own":null);if(tt&&!DA.isMon(c)){mode={kind:tt,h:mode.h};render();return;}act(()=>{DA.play(G,0,mode.h,null,st);mode=null;});};
  $("#pa")&&($("#pa").onclick=()=>go("atk"));$("#pg")&&($("#pg").onclick=()=>go("def"));$("#pp")&&($("#pp").onclick=()=>go());
  $("#pi").onclick=()=>detail(h.id,h.copy?cpOf(h.copy):null);$("#pc").onclick=()=>{mode=null;render();};}
 else if(mode&&(mode.kind==="own"||mode.kind==="enemy")){acts.innerHTML=`<span>Tap a ${mode.kind==="own"?"monster of yours":"rival monster"} as the target</span><button id="pc">Cancel</button>`;$("#pc").onclick=()=>{mode=null;render();};}
 else if(mode&&mode.kind==="unit"){const m=me.field[mode.i];acts.innerHTML=`<b style="width:100%;text-align:center">${esc(C[m.id].name)}</b>${DA.canAttack(G,0,mode.i)?`<button id="ua">⚔ Attack</button>`:""}<button id="us">Switch stance</button><button id="sac">🩸 Sacrifice</button><button id="ui">Info</button><button id="pc">Cancel</button>`;
  $("#ua")&&($("#ua").onclick=()=>{mode={kind:"attack",i:mode.i};render();});$("#sac").onclick=()=>{if(confirm("Sacrifice this monster? (needed for Eclipsara to attack)")){DA.sacrifice(G,0,mode.i);mode=null;render();}};$("#us").onclick=()=>{DA.setStance(G,0,mode.i);mode=null;render();};$("#ui").onclick=()=>detail(m.id,m.copy?cpOf(m.copy):null);$("#pc").onclick=()=>{mode=null;render();};}
 else if(mode&&mode.kind==="attack"){acts.innerHTML=`<span>Choose a red target</span>${targets.includes("direct")?`<button id="dir">💥 Direct attack</button>`:""}<button id="pc">Cancel</button>`;
  $("#dir")&&($("#dir").onclick=()=>act(()=>{DA.attack(G,0,mode.i,"direct");mode=null;}));$("#pc").onclick=()=>{mode=null;render();};}
 else acts.innerHTML=myTurn?`<button id="end">End Turn ➡️</button><button id="quit">Forfeit</button>`:"<span>AI is thinking…</span>";
 $("#end")&&($("#end").onclick=()=>{if(BUSY)return;mode=null;DA.endTurn(G);runFx().then(()=>{if(G&&G.winner==null)setTimeout(()=>{DA.aiTurn(G,1);runFx().then(()=>{if(G&&G.winner==null&&G.cur===0){DAFX.banner('YOUR TURN','turn');}});},500);});});
 $("#quit")&&($("#quit").onclick=()=>{if(confirm("Forfeit this duel?")){DA.win(G,1,"Forfeit");render();}});
 app.querySelectorAll("[data-h]").forEach(d=>d.onclick=()=>{if(BUSY)return;mode={kind:"card",h:+d.dataset.h};render();});
 app.querySelectorAll("[data-o]").forEach(d=>d.onclick=()=>{const i=+d.dataset.o,m=me.field[i];
  if(BUSY)return;if(mode&&mode.kind==="own"){act(()=>{if(m&&DA.play(G,0,mode.h,i)){mode=null;}});return;}
  if(mode&&mode.kind==="card"&&DA.isMon(C[me.hand[mode.h].id])&&!m){act(()=>{DA.play(G,0,mode.h,i,"atk");mode=null;});return;}
  if(m&&!m.egg&&myTurn){mode={kind:"unit",i};render();}else if(m&&!m.egg)detail(m.id,m.copy?cpOf(m.copy):null);});
 app.querySelectorAll("[data-e]").forEach(d=>d.onclick=()=>{const i=+d.dataset.e,m=ai.field[i];
  if(BUSY)return;if(mode&&mode.kind==="attack"&&targets.includes(i)){act(()=>{DA.attack(G,0,mode.i,i);mode=null;});return;}
  if(mode&&mode.kind==="enemy"&&m){act(()=>{DA.play(G,0,mode.h,i);mode=null;});return;}
  if(m&&!m.egg)detail(m.id);});
 const lg=$("#log");lg.scrollTop=lg.scrollHeight;polish(myTurn,targets);}
let DEMO=false;
function startDemo(){DEMO=true;TI=null;
 const pd=["FIR-A-2","FIR-A-3","FIR-A-4","STO-A-1","FIR-A-1","TRN-01","MAG-01","STO-A-1","TRN-05","MAG-02","TRP-13","SR-03","TRN-01","LAI-FIR","MAG-01","TRN-05","STO-A-1","FIR-A-1"];
 const bd=["FRO-A-1","SHA-A-1","FRO-A-1","CRE-03","SHA-A-2","FRO-A-1","SHA-A-1","FRO-A-1","SHA-A-1","MAG-06","FRO-A-3","SHA-A-2","TRP-01","CRE-03","SHA-A-1","FRO-A-1"];
 G=DA.newGame(pd.map(id=>({id})),bd.map(id=>({id})),{noShuffle:true,seed:7,setup:g=>{g.p[1].lp=9000;g.maxHeads=3;g.p[1].name="Boss: Frost-Shadow Warlord";g.energyFn=(g,n)=>g.cur===0?Math.min(10,3*n):Math.min(10,2*n+1);g.headSeq=["Fire","Ice","Lightning","Acid","Void"];
  g.script=g=>{if(g.cur===1&&Math.ceil(g.turn/2)===3&&!g.pentDone){g.pentDone=true;const p=g.p[1];let s=p.field.indexOf(null);if(s<0){let wi=0,wv=1e9;p.field.forEach((m,k)=>{const v=m.egg?0:DA.stat(g,1,m,"atk");if(v<wv){wv=v;wi=k;}});p.grave.push(p.field[wi]);p.field[wi]=null;s=wi;}
   const h={uid:9e6,id:"CG-06",xp:0,stance:"atk",bonusAtk:0,bonusDef:0,tmpAtk:0,tmpDef:0,frozen:0,attacked:false,summonedTurn:g.turn,relic:null,turnsAlive:0,lives:0,egg:0,traits:[],train:{},armor:3000,hp:1000,heads:1};p.field[s]=h;
   g.log.push("The boss calls PENTARCH, CARLOS'S HYDRA!");DA.FX(g,{type:"summon",pi:1,i:s,el:"Void"});}};}});
 G.fx=[];mode=null;render();DAFX.banner("DEMO FIGHT — defeat the Warlord!");tutorial();}
function finish(){if(DEMO){DEMO=false;const won=G.winner===0;G=null;app.innerHTML=`<div class="wrap" style="text-align:center"><h1 class="vh">${won?"🏆 Victory!":"💀 Defeated"}</h1>${won?`<p>Reward unlocked:</p><div class="reveal"><img src="cards/SR-03.jpg" alt="Seraphyx"></div>`:`<p>The Warlord wins this time. Try again!</p>`}<p>That was the Dragon Ascension demo fight.</p><button class="big demobtn" onclick="DAUI.startDemo()">Fight again</button><button class="big" onclick="DAUI.home()">Main menu</button></div>`;if(won){DAFX.confetti();DAFX.buzz([50,50,100]);DAFX.play("evolve");}return;}const won=G.winner===0;let pts=0,html="";
 if(won){S.wins++;pts=TI?botPts(TI.tier,TI.round):5;S.points+=pts;
  if(TI){S.tour.round++;if(S.tour.round>=8){S.tour.round=0;S.tour.tier++;html+=`<h3>👑 Tournament Champion! Tier ${S.tour.tier} unlocked.</h3>`;
   const chance=Math.min(0.15,0.02+0.01*TI.tier);if(Math.random()<chance){const ul=DA.DATA.cards.filter(c=>c.rarity==="Ultra Rare");const u=ul[Math.floor(Math.random()*ul.length)];addCopy(u.id);html+=`<h3>💎 ULTRA RARE DROP: ${esc(u.name)}!</h3>`;}else html+=`<p>No Ultra Rare drop this time (chance ${Math.round(chance*100)}%).</p>`;}}}
 else{S.losses++;if(TI){S.tour.round=0;html+=`<p>Knocked out — the bracket restarts.</p>`;}}
 const evs=DA.applyMatch(S.coll,G,won,!!(won&&TI&&TI.round===7));
 if(won&&S.wins>=100&&!S.rewards.includes("100wins")){S.rewards.push("100wins");const srs=["SR-01","SR-02","SR-03","SR-04","SR-05","SR-06"];const id=srs[Math.floor(Math.random()*6)];addCopy(id);html+=`<h3>🎁 100 WINS! Rare Reward: an extra ${esc(C[id].name)}!</h3>`;}
 save();G=null;results(evs,`<h2>${won?"Victory":"Defeat"}</h2><p>${won?`+${pts} Training Points`:""} • Total wins ${S.wins}/100</p>`+html,TI?tourney:home);}
function results(evs,head,next){const evo=evs.filter(e=>e.to),other=evs.filter(e=>!e.to);
 app.innerHTML=`<div class="wrap" style="text-align:center">${head||""}${other.length?`<div class="traits">${other.map(e=>e.trait?`<span class="trait ${DA.TR[e.trait].tier}">${esc(C[e.id].name)} learned ${DA.TR[e.trait].name}!</span>`:`<span class="trait">${esc(C[e.id].name)} reached Lv ${e.level}</span>`).join("")}</div>`:""}<button class="big" id="nx">Continue</button></div>`;
 let q=evo.slice();const show=()=>{if(!q.length){modal.classList.add("hidden");return;}const e=q.shift();
  detail(e.to,S.coll.find(c=>c.id===e.to),{evo:true,html:`<h2>✨ Your ${esc(C[e.from].name)} evolved into ${esc(C[e.to].name)}!</h2>`});const b=$("#cls");b.textContent=q.length?"Next":"Awesome!";b.onclick=show;};
 show();$("#nx").onclick=()=>next();}
function muteBtn(){let b=document.getElementById("mute");if(!b){b=document.createElement("button");b.id="mute";document.body.appendChild(b);b.onclick=()=>{DAFX.toggleMute();muteBtn();};}b.textContent=DAFX.isMuted()?"🔇":"🔊";}
window.DAUI={home,startDemo,get G(){return G;},runFx};load();muteBtn();if(location.hash==="#demo")startDemo();else home();
})();
