(function(root){
const DATA=(typeof CARD_DATA!=='undefined')?CARD_DATA:require('./cards_node.js');
const CARDS={};DATA.cards.forEach(c=>CARDS[c.id]=c);
const THR={"Hatchling":3,"Drake":5,"Wyvern":8,"Elder Dragon":10};
const BEATS={};DATA.wheel.forEach(w=>BEATS[w.element]=w.beats);
const isMon=c=>["Dragon","Creature","Ancient"].includes(c.type)&&!(c.creators_gift&&c.subtype==="Relic");
const isDragon=c=>c.type==="Dragon";
const els=c=>Array.isArray(c.element)?c.element:String(c.element).split("/");
function rng(seed){let s=seed||Date.now()%2147483647;return()=>((s=s*16807%2147483647)-1)/2147483646;}
function ascensionCard(c){return c.deck==="Ascension";}
function poolIds(includeGifts){return DATA.cards.filter(c=>!ascensionCard(c)&&(includeGifts||!c.creators_gift)&&c.rarity!=="Ultra Rare").map(c=>c.id);}
function autoDeck(r,elements,gifts){ // 40-card deck around 1-2 elements, respecting copy limits
  const L=new Set(elements.map(e=>LEGION_OF[e]));const ids=[];const cnt={};
  const add=id=>{const c=CARDS[id];if(ids.length>=40||(cnt[id]||0)>=(c.max_copies||1))return false;cnt[id]=(cnt[id]||0)+1;ids.push(id);return true;};
  const pick=(id,n)=>{for(let i=0;i<n;i++)add(id)};
  DATA.cards.filter(c=>c.stage_number&&elements.includes(c.element)).forEach(c=>pick(c.id,c.stage_number===1?3:c.stage_number===4?1:2));
  DATA.cards.filter(c=>c.type==="Trap").sort(()=>r()-.5).slice(0,4).forEach(c=>{if(ids.length<36)add(c.id)});
  const fits=c=>{if(c.deck==="Ascension"||c.stage_number||c.creators_gift||c.rarity==="Ultra Rare")return false;const e=els(c);
    if(isMon(c)){const lg=e.length===1?LEGION_OF[e[0]]:null;return lg?L.has(lg):false;}
    return e.some(x=>elements.includes(x))||c.element==="Any"||c.element==="Trap";};
  const sup=DATA.cards.filter(fits);let guard=0;
  while(ids.length<40&&guard++<2000){add(sup[Math.floor(r()*sup.length)].id);}
  if(gifts)["UR-01","UR-02","UR-03"].forEach(i=>{if(ids.length>=40)ids.pop();ids.push(i);});
  return ids;
}
function validateDeck(ids){
  if(ids.length!==40)return "Deck must have exactly 40 cards ("+ids.length+")";
  const cnt={};for(const i of ids){cnt[i]=(cnt[i]||0)+1;const c=CARDS[i];if(!c)return "Unknown card "+i;if(ascensionCard(c))return c.name+" belongs in the Ascension Deck";if(cnt[i]>(c.max_copies||1))return "Too many copies of "+c.name;}
  if(!ids.some(i=>isDragon(CARDS[i])))return "Deck needs at least one dragon";return null;
}
const TRAITS=[
{id:"thick",name:"Thick Scales",tier:"common",def:200,txt:"+200 DEF"},
{id:"claws",name:"Sharp Claws",tier:"common",atk:200,txt:"+200 ATK"},
{id:"sturdy",name:"Sturdy",tier:"common",atk:100,def:100,txt:"+100 ATK/DEF"},
{id:"learner",name:"Quick Learner",tier:"common",xpDawn:1,txt:"+1 extra XP each of your turns"},
{id:"ember",name:"Ember Breath",tier:"common",burn:200,txt:"Deal 200 damage when it wins a battle"},
{id:"hide",name:"Tough Hide",tier:"common",def:300,txt:"+300 DEF"},
{id:"keen",name:"Keen Eyes",tier:"common",atk:150,def:50,txt:"+150 ATK, +50 DEF"},
{id:"rested",name:"Second Wind",tier:"common",regen:100,txt:"Heal 100 LP each of your turns"},
{id:"hardened",name:"Battle Hardened",tier:"common",xpBattle:1,txt:"+1 XP whenever it battles"},
{id:"fierce",name:"Fierce",tier:"common",atk:250,def:-50,txt:"+250 ATK, -50 DEF"},
{id:"swift",name:"Swift Wings",tier:"rare",swift:1,txt:"Can attack the turn it is summoned"},
{id:"firebreath",name:"Fire Breath",tier:"rare",burn:400,txt:"Deal 400 damage when it wins a battle"},
{id:"regen",name:"Regeneration",tier:"rare",regen:300,txt:"Heal 300 LP each of your turns"},
{id:"vamp",name:"Vampiric",tier:"rare",vamp:0.5,txt:"Heal half the battle damage it deals"},
{id:"pack",name:"Pack Hunter",tier:"rare",pack:200,txt:"+200 ATK for each other monster you control"},
{id:"mastery",name:"Elemental Mastery",tier:"rare",atk:500,txt:"+500 ATK"},
{id:"ironwill",name:"Iron Will",tier:"rare",lives:1,txt:"Returns once after being destroyed"},
{id:"titan",name:"Titan Blood",tier:"rare",atk:400,def:400,txt:"+400 ATK/DEF"},
{id:"dread",name:"Dread Aura",tier:"rare",def:500,txt:"+500 DEF"},
{id:"prodigy",name:"Prodigy",tier:"rare",xpDawn:2,txt:"+2 extra XP each of your turns"}];
const TR={};TRAITS.forEach(t=>TR[t.id]=t);
const tsum=(m,k)=>(m.traits||[]).reduce((a,t)=>a+((TR[t]||{})[k]||0),0);
function rollTrait(r,existing,rareBoost){const pool=TRAITS.filter(t=>!(existing||[]).includes(t.id));const rare=r()<(rareBoost?0.45:0.2);const p=pool.filter(t=>t.tier===(rare?"rare":"common"));return (p.length?p:pool)[Math.floor(r()*(p.length?p:pool).length)].id;}
const LEGION_OF={Fire:"Fire",Water:"Water",Sea:"Water",Nature:"Nature",Earth:"Mountain",Storm:"Sky",Frost:"Frost",Shadow:"Shadow",Light:"Light"};
const LEGIONS=["Fire","Water","Nature","Mountain","Sky","Frost","Shadow","Light","Wild Mix"];
const LBEATS={};(DATA.legion_wheel||[]).forEach(w=>LBEATS[w.legion]=w.beats);
function legionOfCard(c){if(!c||!isMon(c))return null;const e=els(c);if(e.length>1)return null;return LEGION_OF[e[0]]||null;}
function deckLegion(ids){const s=new Set();ids.forEach(x=>{const l=legionOfCard(CARDS[typeof x==="string"?x:x.id]);if(l)s.add(l);});return s.size===1?[...s][0]:"Wild Mix";}
let UID=1;
function inst(x){const m=inst0(x);if(m.id==="CG-06"){m.armor=3000;m.hp=1000;m.heads=1;}m.bonusAtk+=tsum(m,'atk')+((m.train.atk)||0);m.bonusDef+=tsum(m,'def')+((m.train.def)||0);m.xp+=(m.train.xp||0);m.lives+=tsum(m,'lives');return m;}
function inst0(x){const id=typeof x==='string'?x:x.id;const lv=(x&&x.lvl)||0;const c=CARDS[id];return {uid:UID++,id,copy:x&&x.copy||null,lvl:lv,traits:(x&&x.traits)||[],train:(x&&x.train)||{},xp:0,stance:"atk",bonusAtk:lv*50,bonusDef:lv*50,tmpAtk:0,tmpDef:0,frozen:0,attacked:false,summonedTurn:-1,relic:null,turnsAlive:0,lives:c.id==="SR-03"?2:(c.id==="CRE-05"?1:0),egg:c.id==="CG-04"?2:(c.type==="Dragon Egg"||c.id==="MAG-03"?3:0),immortal:false};}
function newGame(deckA,deckB,opts={}){if(opts.noShuffle){const g=newGame0(deckA,deckB,opts);return g;}return newGame0(deckA,deckB,opts);}
function newGame0(deckA,deckB,opts={}){
  const r=rng(opts.seed);const shuf=a=>{if(opts.noShuffle)return a;for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
  const mk=(name,deck)=>{const lg=deckLegion(deck);const P=({name,legion:lg,lp:8000,deck:shuf(deck.map(inst)),hand:[],field:[null,null,null],grave:[],lair:null,rider:null,energy:0,asc:DATA.cards.filter(c=>c.subtype==="Legendary").map(c=>c.id),traps:[],shield:false,doomed:false,thunderUsed:false});if(lg!=="Wild Mix")P.deck.forEach(m=>{if(isMon(CARDS[m.id])){m.bonusAtk+=100;m.bonusDef+=100;}});return P;};
  const g={stats:{},p:[mk("You",deckA),mk("AI",deckB)],turn:0,cur:0,log:[],winner:null,reason:"",r,phase:"main"};
  for(let k=0;k<5;k++){g.p[0].hand.push(g.p[0].deck.pop());g.p[1].hand.push(g.p[1].deck.pop());}
  g.p.forEach(p=>{if(p.legion==="Wild Mix")p.hand.push(p.deck.pop());});
  if(opts.setup)opts.setup(g);
  startTurn(g,true);return g;
}
const FX=(g,o)=>{(g.fx=g.fx||[]).push(o);if(g.fx.length>80)g.fx.shift();};
const L=(g,m)=>{g.log.push(m);if(g.log.length>200)g.log.shift();};
function C(x){return CARDS[x.id];}
function elOf(id){const c=CARDS[id];if(!c)return 'Light';const e=Array.isArray(c.element)?c.element[0]:String(c.element).split('/')[0];return e;}
function lairBonus(g,pi,m,stat){const l=g.p[pi].lair;if(!l)return 0;const c=CARDS[l.id];if(!els(C(m)).includes(c.element))return 0;
  const t=c.ability;let v=0;const mA=t.match(/\+(\d+) ATK/),mD=t.match(/\+(\d+) DEF/),mB=t.match(/\+(\d+) ATK\/DEF/);
  if(mB)v=+mB[1];else if(stat==="atk"&&mA)v=+mA[1];else if(stat==="def"&&mD)v=+mD[1];return v;}
function relicBonus(m,stat){if(!m.relic)return 0;const t=CARDS[m.relic].ability;const x=t.match(stat==="atk"?/\+(\d+) ATK/:/\+(\d+) DEF/);return x?+x[1]:0;}
function riderBonus(g,pi,m,stat){const r=g.p[pi].rider;if(!r)return 0;const c=CARDS[r.id];if(!els(C(m)).includes(c.element))return 0;
  const x=c.ability.match(stat==="atk"?/\+(\d+) ATK/:/\+(\d+) DEF/);if(!x)return 0;if(/Guard stance/.test(c.ability)&&m.stance!=="def")return 0;return +x[1];}
function stat(g,pi,m,s){const c=C(m);if(m.id==="CG-06"&&!m.egg){return s==='atk'?Math.max(0,1200*m.heads+m.tmpAtk+((g.p[pi]&&g.p[pi].seal)?1000:0)):Math.max(0,m.armor);}let base=c[s];if(base==="∞")return 1e9;if(typeof base!=="number")base=0;
  if(m.egg)return s==="def"?(c.def||0):0;
  const pk=tsum(m,'pack')?tsum(m,'pack')*(g.p[pi].field.filter(x=>x&&x!==m).length):0;return Math.max(0,(s==='atk'&&g.p[pi].seal?1000:0)+pk*(s==='atk'?1:0)+base+(s==="atk"?m.bonusAtk+m.tmpAtk:m.bonusDef+m.tmpDef)+lairBonus(g,pi,m,s)+relicBonus(m,s)+riderBonus(g,pi,m,s));}
function hasAdv(a,b){if(a.id==="UR-01")return true;if(b.id==="UR-01")return false;const lb=els(C(b)).map(e=>LEGION_OF[e]).filter(Boolean);return els(C(a)).some(e=>(LBEATS[LEGION_OF[e]]||[]).some(x=>lb.includes(x)));}
function startTurn(g,first){
  if(g.winner)return;g.turn++;const p=g.p[g.cur],o=g.p[1-g.cur];g.phase="main";
  if(o.doomed){return win(g,g.cur,"Eclipsara devoured the world");}
  if(!(first&&g.turn===1)){if(!p.deck.length)return win(g,1-g.cur,"Deck Out");p.hand.push(p.deck.pop());}
  p.energy=Math.min(10,Math.ceil(g.turn/2));if(p.energy<1)p.energy=1;if(g.energyFn)p.energy=g.energyFn(g,Math.ceil(g.turn/2));
  p.thunderUsedTurn=false;trig(g,1-g.cur,'onTurnStart',{});
  if(p.burn&&p.burn.n>0){p.burn.n--;damage(g,g.cur,p.burn.amt);FX(g,{type:"status",pi:g.cur,i:null,status:"Burn"});}
  g.p.forEach(pl=>pl.field.forEach(m=>{if(m&&m.void>0)m.void--;if(m&&m.stun>0)m.stun--;}));
  p.field.forEach((m,i)=>{if(!m)return;m.attacked=false;if(m.frozen>0)m.frozen--;if(m.acid>0){m.acid--;if(m.acid>0)m.bonusDef-=500;}
    if(m.id==="CG-06"&&!m.egg&&m.turnsAlive>=0){if(m.heads<(g.maxHeads||5)){m.heads++;m.hp+=1000;FX(g,{type:"head",pi:g.cur,i,heads:m.heads});L(g,"Pentarch grows its "+HEADS[m.heads-1]+" head! ("+m.heads+" heads)");}headStrike(g,g.cur,m);}
    if(m.egg){m.egg--;if(m.egg<=0)hatch(g,g.cur,i);return;}
    if(m.dead){if(m.lives>0){m.dead=false;}}
    m.turnsAlive++;if(tsum(m,'regen'))p.lp+=tsum(m,'regen');if(isDragon(C(m)))gainXP(g,g.cur,m,1+tsum(m,'xpDawn'));
    if(/At your Dawn Phase, gain (\d+) LP/.test(C(m).ability||"")){p.lp+=+RegExp.$1;}if(/At your Dawn Phase, deal (\d+) damage/.test(C(m).ability||""))damage(g,1-g.cur,+RegExp.$1);
  });
  // Seraphyx / Phoenix revive
  p.revive=(p.revive||[]).filter(x=>{const s=p.field.indexOf(null);if(s<0)return true;x.summonedTurn=g.turn;p.field[s]=x;p.grave=p.grave.filter(y=>y!==x);L(g,p.name+"'s "+C(x).name+" rises again!");return false;});
  // Ascension victory
  for(const m of p.field){if(m&&!m.egg&&(C(m).stage==="Elder Dragon"||C(m).subtype==="Legendary"||C(m).subtype==="Bond Fusion Legendary")){m.elderTurns=(m.elderTurns||0)+1;if(m.elderTurns>=4)return win(g,g.cur,"Ascension Victory ("+C(m).name+" survived 3 turns)");}}
  if(g.script)g.script(g);
  checkExtinction(g);
}
function hatch(g,pi,i){const p=g.p[pi],egg=p.field[i],c=C(egg);const el=(c.id==="MAG-03"||c.id==="CG-04")?null:c.element;
  const roll=g.r();const st=c.id==="CG-04"?4:roll<.6?1:roll<.9?2:3;const opts=DATA.cards.filter(x=>x.stage_number===st&&(!el||x.element===el));
  const n=inst(opts[Math.floor(g.r()*opts.length)].id);n.summonedTurn=g.turn;if(c.id==="EGG-FIR")n.bonusAtk+=300;if(c.id==="EGG-EAR")p.lp+=1000;if(c.id==="EGG-LIG")n.xp=2;if(c.id==="EGG-STO")n.summonedTurn=-1;if(c.id==="CG-04"){n.bonusAtk+=1000;n.summonedTurn=g.turn;}
  p.field[i]=n;L(g,p.name+"'s egg hatched into "+C(n).name+"!");}
function gainXP(g,pi,m,n){if(!m||m.egg||!C(m).stage_number&&C(m).stage!=="Elder Dragon")return;if(C(m).id==="LEG-FRO")return;m.xp+=n;tryEvolve(g,pi,m);}
function tryEvolve(g,pi,m){const p=g.p[pi];let c=C(m);
  while(c.stage_number&&m.xp>=THR[c.stage]){
    if(c.evolves_to){let src=p.hand.findIndex(x=>x.id===c.evolves_to),from=p.hand;if(src<0){src=p.deck.findIndex(x=>x.id===c.evolves_to);from=p.deck;}
      if(src<0){m.ready=true;break;}if(p.evoLock===g.turn){m.ready=true;break;}if(trig(g,1-pi,'onEvolve',{m}).negate){m.ready=true;break;}const nc=from.splice(src,1)[0];p.grave.push({...m,uid:UID++});m.id=nc.id;m.xp-=THR[c.stage];m.ready=false;m.bonusAtk+=300;rec(g,m,"evos");FX(g,{type:"evolve",pi,i:p.field.indexOf(m)});L(g,p.name+"'s dragon evolved into "+CARDS[m.id].name+"!");c=C(m);g.lastFx={type:"evolve",uid:m.uid};}
    else{const lg=p.asc.find(id=>CARDS[id].element===c.element);m.xp=0;
      if(lg){p.asc=p.asc.filter(x=>x!==lg);m.id=lg;m.elderTurns=m.elderTurns||0;L(g,p.name+" ASCENDED into "+CARDS[lg].name+"!");g.lastFx={type:"ascend",uid:m.uid};}
      else if(!m.exalted){m.exalted=true;m.bonusAtk+=500;m.bonusDef+=500;L(g,CARDS[m.id].name+" is Exalted (+500/+500)");}break;}
  }}
function checkReady(g,pi){g.p[pi].field.forEach(m=>m&&m.ready&&tryEvolve(g,pi,m));}
function dragonsLeft(p){return p.field.some(m=>m&&isDragon(C(m)))||p.hand.some(m=>isDragon(C(m)))||p.deck.some(m=>isDragon(C(m)));}
function checkExtinction(g){if(g.winner)return;const a=dragonsLeft(g.p[0]),b=dragonsLeft(g.p[1]);
  if(!a&&b)win(g,1,"Dragon Extinction");else if(!b&&a)win(g,0,"Dragon Extinction");}
function win(g,pi,why){if(g.winner!==null&&g.winner!==undefined)return;g.winner=pi;g.reason=why;L(g,(pi===0?"YOU WIN":"AI WINS")+" — "+why);}
function checkLP(g){for(let i=0;i<2;i++){const p=g.p[i];if(p.field.some(m=>m&&!m.egg&&m.id==="SR-03")&&p.lp<1000)p.lp=1000;}
  if(g.p[0].lp<=0)win(g,1,"Life Points reached 0");else if(g.p[1].lp<=0)win(g,0,"Life Points reached 0");}
function trig(g,oi,kind,x){const o=g.p[oi],p=g.p[1-oi];for(let k=0;k<o.traps.length;k++){const tc=CARDS[o.traps[k].id];if(tc.trigger!==kind)continue;
 const fire=()=>{o.traps.splice(k,1);o.grave.push({id:tc.id});L(g,o.name+"'s TRAP "+tc.name+" activates!");FX(g,{type:"trap",pi:oi,name:tc.name});g.lastFx={type:"trap",id:tc.id};};
 const pi=1-oi;
 if((x.a&&x.a.id==="SR-07")||(x.h&&(x.h.id==="SR-07"||x.h.id==="SR-09")))return {};
 if(kind==="onAttack"){const a=x.a,ac=CARDS[a.id],A=stat(g,pi,a,"atk"),d=x.t==="direct"?null:o.field[x.t];
  switch(tc.id){
  case "TRP-01":if(A>=3000){fire();destroy(g,pi,x.i);return {negate:true};}break;
  case "TRP-02":{const mx=Math.max(0,...o.field.filter(m=>m&&!m.egg).map(m=>CARDS[m.id].cost||0));if((ac.cost||0)>mx){fire();a.tmpAtk-=Math.floor(A/2);return {};}break;}
  case "TRP-03":fire();g.mirrorFor=oi;return {};
  case "TRP-07":if(d&&o.lp<p.lp){fire();d.tmpAtk+=stat(g,oi,d,"atk");return {};}break;
  case "TRP-08":if(d){fire();const el=els(ac);const lim=A;destroy(g,pi,x.i);p.field.forEach((m,j)=>{if(m&&!m.egg&&els(CARDS[m.id]).some(e=>el.includes(e))&&stat(g,pi,m,"atk")<lim)destroy(g,pi,j);});return {negate:true};}break;
  case "TRP-10":if((ac.cost||0)<=5){fire();destroy(g,pi,x.i);damage(g,pi,500);return {negate:true};}break;
  case "TRP-11":fire();a.frozen=2;return {negate:true};
  case "TRP-13":fire();damage(g,pi,500);return {negate:true};
  case "TRP-14":if(o.lp<=3000){fire();if(!d)return {negate:true};d.tmpAtk+=1500;d.tmpDef+=1500;return {};}break;}}
 if(kind==="onSummon"){const h=x.h,hc=CARDS[h.id];
  switch(tc.id){
  case "TRP-09":if(["Super Rare","Ultra Rare","Creator's Gift"].includes(hc.rarity)){fire();return {negate:true};}break;
  case "TRP-04":if(!x.relic&&(hc.cost||0)>=6){fire();h.frozen=2;h.sealed=true;return {};}break;
  case "TRP-12":if(!x.relic&&stat(g,pi,h,"atk")>=3000){fire();return {negate:true,bottom:true};}break;}}
 if(kind==="onSpell"&&tc.id==="TRP-15"){fire();return {negate:true};}
 if(kind==="onTurnStart"&&tc.id==="TRP-05"){fire();p.energy=Math.max(0,p.energy-3);return {};}
 if(kind==="onEvolve"&&tc.id==="TRP-06"){fire();p.evoLock=g.turn;return {negate:true};}
 }return {};}
function damage(g,pi,n,battle,attacker){if(battle&&g.mirrorFor===pi){pi=1-pi;}const p=g.p[pi];if(n<=0)return;
  if(battle&&attacker&&p.field.some(m=>m&&m.id==="SR-02"&&!m.egg)&&n>0&&attacker<3000)return;
  p.lp-=n;p.lost=(p.lost||0)+n;FX(g,{type:"dmg",pi,amount:n,battle:!!battle});L(g,p.name+" takes "+n+" damage");checkLP(g);}
const HEADS=["Lightning","Fire","Ice","Acid","Void"];
function pentHit(g,pi,i,n){const m=g.p[pi].field[i];if(!m||n<=0)return false;let a=Math.min(m.armor,n);m.armor-=a;n-=a;if(n>0)m.hp-=n;FX(g,{type:"armor",pi,i,armor:m.armor,hp:m.hp,amount:a+n});L(g,"Pentarch takes "+(a+n)+" ("+m.armor+" Armor / "+Math.max(0,m.hp)+" HP left)");
 if(m.hp<=0){m.hp=0;m.armor=0;m.id2=null;g.p[pi].field[i]=null;g.p[pi].grave.push(m);FX(g,{type:"destroy",pi,i,id:m.id});L(g,"Pentarch, Carlos's Hydra falls!");checkExtinction(g);return true;}return false;}
function headStrike(g,pi,m){const o=g.p[1-pi];const h=(g.headSeq&&g.headSeq.length)?g.headSeq.shift():HEADS[Math.floor(g.r()*m.heads)];const tg=o.field.map((x,k)=>x&&!x.egg&&!x.void?k:-1).filter(k=>k>=0);
 const j=tg.length?tg[Math.floor(g.r()*tg.length)]:null;const t=j==null?null:o.field[j];const src=g.p[pi].field.indexOf(m);
 FX(g,{type:"attack",aid:m.id,tid:t?t.id:null,pi,i:src,t:j==null?"direct":j,el:{Lightning:"Storm",Fire:"Fire",Ice:"Frost",Acid:"Acid",Void:"Void"}[h],head:h});
 L(g,"Pentarch's "+h+" head strikes"+(t?" "+C(t).name:" "+o.name)+"!");
 if(h==="Fire"){o.burn={n:2,amt:300};}
 if(!t){if(h!=="Fire")damage(g,1-pi,500);return;}
 if(h==="Lightning"){t.frozen=Math.max(t.frozen,1);t.stun=2;}
 if(h==="Ice"){t.frozen=Math.max(t.frozen,1);}
 if(h==="Acid"){t.acid=2;t.bonusDef-=500;}
 if(h==="Void"){t.void=2;}
 FX(g,{type:"status",pi:1-pi,i:j,status:h});}
function destroy(g,pi,i,byMagic){const p=g.p[pi],m=p.field[i];if(!m)return false;const c=C(m);
  if(m.immortal)return false;
  if(m.id==="CG-06"&&!m.egg)return pentHit(g,pi,i,byMagic?2000:3000);
  if(byMagic&&(c.id==="SR-01"||c.id==="SR-02"||c.id==="ULT-09"||m.relic==="UR-03"))return false;
  if(byMagic&&p.field.some(x=>x&&x.id==="SR-05"&&!x.blockUsed)){const t=p.field.find(x=>x&&x.id==="SR-05");t.blockUsed=g.turn;L(g,"Titan Golem Aegis blocks the destruction!");return false;}
  p.field[i]=null;if(m.relic)p.grave.push(inst(m.relic));
  if(c.id==="ULT-10"){m.xp=0;m.tmpAtk=m.tmpDef=0;m.relic=null;p.hand.push(m);p.lp+=2000;L(g,"Spirit Wyrm Eternal returns to hand (+2000 LP)");return true;}
  if(m.lives>0){m.lives--;m.xp=0;m.tmpAtk=m.tmpDef=0;p.revive=p.revive||[];p.revive.push(m);}
  p.grave.push(m);FX(g,{type:"destroy",pi,i,id:m.id});L(g,c.name+" was destroyed");
  if(/When destroyed, draw 1 card/.test(c.ability||"")&&p.deck.length)p.hand.push(p.deck.pop());
  checkExtinction(g);return true;}
function canPlay(g,pi,h){const p=g.p[pi],c=C(h);if(g.winner!=null||g.cur!==pi)return false;
  if((c.cost||0)>p.energy)return false;
  if(c.id==="UR-01"){const el=new Set(p.grave.filter(m=>CARDS[m.id]&&CARDS[m.id].stage==="Elder Dragon").map(m=>LEGION_OF[CARDS[m.id].element]));if(el.size<3)return false;}
  if(c.id==="UR-02"&&!(p.lp<3000))return false;
  if(c.id==="CG-06"){if((p.lost||0)<3000)return false;const lg=new Set(p.field.filter(m=>m&&!m.egg).map(m=>legionOfCard(C(m))).filter(Boolean));if(lg.size<2)return false;}
  if(c.id==="CG-05")return (p.lost||0)>=4000&&!p.seal;
  if(c.id==="UR-03")return p.field.some(m=>m&&!m.egg&&!m.relic&&(C(m).stage==="Elder Dragon"||/Legendary/.test(C(m).subtype||""))&&m.turnsAlive>=2);
  if(c.type==="Trap")return p.traps.length<3;
  if(c.id==="CG-06")return true;
  if(isMon(c)||c.type==="Dragon Egg"||c.id==="MAG-03")return p.field.includes(null);
  if(c.type==="Relic"&&c.id!=="UR-03")return p.field.some(m=>m&&!m.egg&&!m.relic&&(c.element==="Any"||els(C(m)).includes(c.element)));
  if(needsTarget(c)==="own")return p.field.some(m=>m&&!m.egg&&targetOk(c,m));
  if(needsTarget(c)==="enemy")return g.p[1-pi].field.some(m=>m&&!m.egg);
  return true;}
function needsTarget(c){if(c.id==="CG-05")return null;if(["MAG-06","MAG-07"].includes(c.id))return "enemy";if(c.type==="Training"||c.type==="Relic"||["MAG-01","MAG-02"].includes(c.id))return /each of your/.test(c.ability)?null:"own";return null;}
function targetOk(c,m){const mc=C(m);if(c.element!=="Any"&&!els(mc).includes(c.element))return false;if(/Hatchling or Drake/.test(c.ability)&&!["Hatchling","Drake"].includes(mc.stage))return false;
  if(/XP|evolve/i.test(c.ability)&&!mc.stage_number)return false;return true;}
// play: target = field index (own or enemy depending)
function play(g,pi,handIdx,target,stance){const p=g.p[pi],o=g.p[1-pi],h=p.hand[handIdx];if(!h||!canPlay(g,pi,h))return false;const c=C(h);
  const own=target!=null?p.field[target]:null,en=target!=null?o.field[target]:null;
  const tt=needsTarget(c);if(tt==="own"&&(!own||own.egg||!targetOk(c,own)))return false;if(tt==="enemy"&&(!en||en.egg||en.void>0||(en.id==="SR-09"&&en.summonedTurn>=g.turn-1)))return false;
  if(c.type==="Relic"&&c.id!=="CG-05"&&(!own||own.relic||own.egg||(c.element!=="Any"&&!els(C(own)).includes(c.element))))return false;
  if(c.id==="UR-03"&&(!own||!(own.turnsAlive>=2)||!(C(own).stage==="Elder Dragon"||/Legendary/.test(C(own).subtype||""))))return false;
  // Mirror Sphinx reflect & Chronoxis rewind
  p.energy-=(c.cost||0);p.hand.splice(handIdx,1);L(g,(p.name==="You"?"You play ":p.name+" plays ")+c.name);g.lastFx={type:"play",id:c.id,pi};
  if(c.type==="Trap"){p.traps.push(h);g.log[g.log.length-1]=p.name+(p.name==="You"?" set a face-down Trap":" sets a face-down Trap");return true;}
  const chrono=o.field.find(m=>m&&m.id==="SR-01"&&m.rewind!==g.turn);
  if(chrono&&!isMon(c)&&pi!==undefined&&g.r()<0.34){chrono.rewind=g.turn;o; p.hand.push(h);L(g,"Chronoxis rewinds "+c.name+" back to "+p.name+"'s hand!");return true;}
  if(tt==="enemy"&&en.id==="SR-06"&&en.mirror!==g.turn){en.mirror=g.turn;L(g,"Mirror Sphinx reflects "+c.name+"!");p.grave.push(h);return true;}
  if(c.id==="CG-05"){const tr=trig(g,1-pi,'onSummon',{h,relic:true});p.grave.push(h);if(tr.negate)return true;p.seal=true;const s0=p.field.indexOf(null);if(s0>=0){let bi=-1,bv=-1;p.grave.forEach((m,k)=>{const gc=CARDS[m.id];if(gc&&gc.type==="Dragon"&&!m.egg&&typeof gc.atk==="number"&&gc.atk>bv){bv=gc.atk;bi=k;}});if(bi>=0){const x=inst(p.grave.splice(bi,1)[0].id);x.summonedTurn=g.turn;p.field[s0]=x;L(g,"The Creator's Will revives "+CARDS[x.id].name+"!");}}return true;}
  if(isMon(c)||c.type==="Dragon Egg"||c.id==="MAG-03"){
    let s=target!=null&&p.field[target]===null?target:p.field.indexOf(null);
    if(c.id==="CG-06"){const seen=new Set();let n=0;p.field.forEach((m,k)=>{if(n<2&&m&&!m.egg){const l=legionOfCard(C(m));if(l&&!seen.has(l)){seen.add(l);p.grave.push(m);p.field[k]=null;n++;}}});s=p.field.indexOf(null);}
    h.stance=(c.type==="Dragon Egg"||c.id==="MAG-03")?"def":(stance||"atk");h.summonedTurn=g.turn;p.field[s]=h;rec(g,h,'used');FX(g,{type:"summon",pi,i:s,el:elOf(h.id),egg:!!h.egg});
    if(isMon(c)){const tr=trig(g,1-pi,'onSummon',{h});if(tr.negate){p.field[s]=null;if(tr.bottom)p.deck.unshift(h);else p.grave.push(h);return true;}}
    if(/When summoned, deal (\d+) damage/.test(c.ability||""))damage(g,1-pi,+RegExp.$1);
    switch(c.id){case "ULT-01":o.field.forEach((m,j)=>{if(m&&stat(g,1-pi,m,"atk")<=1500)destroy(g,1-pi,j,false);});break;
     case "ULT-02":h.summonedTurn=-1;break;case "ULT-03":o.field.forEach(m=>{if(m)m.frozen=2;});break;
     case "ULT-05":o.grave.push(...o.hand);o.hand=[];break;
     case "ULT-06":{p.lp+=3000;let n=0;for(let k=p.grave.length-1;k>=0&&n<2;k--){const gc=CARDS[p.grave[k].id];if(gc&&gc.type==="Dragon"&&!p.grave[k].egg){const x=p.grave.splice(k,1)[0];p.hand.push(inst(x.id));n++;}}break;}
     case "ULT-07":for(const [q,pl] of [[pi,p],[1-pi,o]])pl.field.forEach((m,j)=>{if(m&&m!==h){pl.field[j]=null;if(m.egg)pl.grave.push(m);else{m.tmpAtk=m.tmpDef=0;if(m.relic)pl.grave.push(inst(m.relic));m.relic=null;pl.hand.push(m);}}});break;}
    if(/When summoned, gain (\d+) LP/.test(c.ability||""))p.lp+=+RegExp.$1;
    if(c.id==="CRE-01"){const f=p.field.find(m=>m&&m!==h&&C(m).element==="Fire"&&C(m).stage_number);if(f)gainXP(g,pi,f,1);}
    if(/Can attack the turn it is summoned/.test(c.ability||""))h.summonedTurn=-1;
    return true;}
  if(!isMon(c)&&c.type!=="Trap"){let tr=c.creators_gift?trig(g,1-pi,'onSummon',{h,relic:true}):{};if(!tr.negate)tr=trig(g,1-pi,'onSpell',{h});if(tr.negate){p.grave.push(h);return true;}}
  const ab=c.ability;p.grave.push(h);
  if(c.type==="Relic"){own.relic=c.id;if(c.id==="UR-03"){own.crown=true;}return true;}
  if(c.type==="Lair"){if(p.lair)p.grave.push(p.lair);p.lair=h;p.grave.pop();return true;}
  if(c.type==="Rider"){if(p.rider)p.grave.push(p.rider);p.rider=h;p.grave.pop();return true;}
  switch(c.id){
    case "MAG-01":own.tmpAtk+=1000;return true;
    case "MAG-02":own.xp=Math.max(own.xp,THR[C(own).stage]||0);tryEvolve(g,pi,own);return true;
    case "MAG-04":p.shield=true;return true;
    case "MAG-05":for(const [q,pl] of [[pi,p],[1-pi,o]])pl.field.forEach((m,i)=>{if(m&&!m.egg){const v=m.stance==="atk"?stat(g,q,m,"atk"):stat(g,q,m,"def");if(v<=500)destroy(g,q,i,true);else{m.tmpDef-=500;m.tmpAtk-=500;}}});return true;
    case "MAG-06":if(en.id==="SR-01"||en.id==="SR-02"){L(g,"It resists!");return true;}o.field[target]=null;en.xp=0;en.tmpAtk=en.tmpDef=0;o.hand.push(en);if(en.relic)o.grave.push(inst(en.relic));en.relic=null;return true;
    case "MAG-07":{en.xp=0;const ec=C(en);if(ec.evolves_from){en.id=ec.evolves_from;}return true;}
    case "TRN-11":{const ec=C(own);if(ec.evolves_from){own.id=ec.evolves_from;own.xp=0;}for(let k=0;k<2&&p.deck.length;k++)p.hand.push(p.deck.pop());return true;}
    case "TRN-06":own.extraAttack=g.turn;break;
    case "TRN-09":own.directTurn=g.turn;break;
    case "TRN-07":own.stance="def";own.safeTurn=g.turn;break;
  }
  const xp=ab.match(/\+(\d+) XP/);
  const atk=ab.match(/\+(\d+) ATK until end of turn/),df=ab.match(/\+(\d+) DEF/),lp=ab.match(/gain (\d+) LP/);
  if(/each of your dragons/.test(ab)&&xp)p.field.forEach(m=>m&&gainXP(g,pi,m,+xp[1]));else if(own&&xp)gainXP(g,pi,own,+xp[1]);
  if(own&&atk)own.tmpAtk+=+atk[1];if(own&&df)own.tmpDef+=+df[1];if(lp)p.lp+=+lp[1];
  if(/draw 1 card/.test(ab)&&p.deck.length)p.hand.push(p.deck.pop());
  checkReady(g,pi);return true;}
function sacrifice(g,pi,i){const p=g.p[pi],m=p.field[i];if(!m||g.cur!==pi||g.winner!=null)return false;p.field[i]=null;if(m.relic)p.grave.push(inst(m.relic));p.grave.push(m);p.sacTurn=g.turn;L(g,p.name+" sacrifices "+C(m).name);checkExtinction(g);return true;}
function setStance(g,pi,i){const m=g.p[pi].field[i];if(!m||m.egg||m.frozen||m.stanceTurn===g.turn)return false;m.stance=m.stance==="atk"?"def":"atk";m.stanceTurn=g.turn;return true;}
function canAttack(g,pi,i){const m=g.p[pi].field[i];if(m&&(m.void>0||m.stun>0))return false;if(!m||g.cur!==pi||g.winner!=null||m.egg||m.stance!=="atk"||m.frozen)return false;if(g.turn===1)return false;
  if(m.id==="UR-01"&&!(m.turnsAlive>=1))return false;if(m.id==="UR-02"&&g.p[pi].sacTurn!==g.turn)return false;if(m.relic==="UR-03"&&!g.p[pi].field.some(x=>x&&x!==m&&!x.egg&&isDragon(C(x))))return false;
  if(m.summonedTurn===g.turn&&!tsum(m,'swift')&&C(m).subtype!=="Bond Fusion Legendary")return false;if(m.attacked&&!((m.extraAttack===g.turn||m.id==="ULT-02")&&m.attacked===1))return false;return true;}
function legalTargets(g,pi,i){const o=g.p[1-pi],m=g.p[pi].field[i];const mons=o.field.map((x,k)=>x&&!(x.void>0)?k:-1).filter(k=>k>=0);
  const taunt=mons.filter(k=>{const x=o.field[k];return x.id==="SR-05"||(x.id==="CRE-03"&&x.stance==="def");});
  let t=taunt.length?taunt:mons;const res=t.slice();
  if(!mons.length||(m&&(m.directTurn===g.turn||(m.id==="CRE-02"&&!g.p[pi].thunderUsed)||/may attack your opponent directly/.test(C(m).ability||""))))res.push("direct");return res;}
function attack(g,pi,i,t){if(!canAttack(g,pi,i))return false;const lt=legalTargets(g,pi,i);if(!lt.includes(t))return false;
  const p=g.p[pi],o=g.p[1-pi],a=p.field[i],ac=C(a);FX(g,{type:"attack",pi,i,t,el:elOf(a.id),aid:a.id,tid:(t!=="direct"&&o.field[t])?o.field[t].id:null});rec(g,a,'battles');if(t!=='direct'&&o.field[t])rec(g,o.field[t],'battles');a.attacked=(a.attacked||0)+1;g.lastFx={type:"attack",pi,i,t};
  if(o.shield){o.shield=false;L(g,"Wing Shield stops the attack!");return true;}
  g.mirrorFor=null;if(trig(g,1-pi,'onAttack',{a,i,t}).negate){checkReady(g,pi);return true;}if(!p.field[i])return true;
  let A=stat(g,pi,a,"atk");if(tsum(a,'xpBattle'))gainXP(g,pi,a,tsum(a,'xpBattle'));const lpBefore=o.lp;g._vamp=()=>{const v=tsum(a,'vamp');if(v&&o.lp<lpBefore)p.lp+=Math.floor((lpBefore-o.lp)*v);};
  if(t==="direct"){let dmg=A;const mons=o.field.some(x=>x);if(mons&&a.id==="CRE-02")p.thunderUsed=true;else if(mons)dmg=Math.floor(A/2);
    L(g,ac.name+" attacks directly!");damage(g,1-pi,dmg,true,A);gainXP(g,pi,a,1);return true;}
  const d=o.field[t];if(!d)return false;const dc=C(d);
  if(d.egg){destroy(g,1-pi,t);gainXP(g,pi,a,1);return true;}
  if(d.id==="CG-06"){let A2=A+(hasAdv(a,d)?500:0);FX(g,{type:"hit",pi:1-pi,i:t,amount:A2});if(pentHit(g,1-pi,t,A2))win2(g,pi,a,false);else{const D=stat(g,1-pi,d,"atk");if(d.stance==="atk"&&D>A2){destroy(g,pi,i);}}checkReady(g,pi);g.mirrorFor=null;return true;}
  if(ac.id==="CG-06"){const D=d.stance==="atk"?stat(g,1-pi,d,"atk"):stat(g,1-pi,d,"def");FX(g,{type:"hit",pi:1-pi,i:t,amount:A});if(A>D){destroy(g,1-pi,t);win2(g,pi,a,false);}else if(D>A){pentHit(g,pi,i,D-A);}checkReady(g,pi);g.mirrorFor=null;return true;}
  if(ac.id==="CRE-06"&&isDragon(dc))A+=800;
  let adv=hasAdv(a,d),dadv=hasAdv(d,a);if(adv)A+=500;
  if(d.id==="SR-02"){d.bonusDef+=300;}if(d.id==="SR-10"){d.bonusAtk+=500;}
  L(g,ac.name+" ("+A+") attacks "+dc.name);
  const leviathan=d.id==="SR-04"||(d.id==="ULT-09"&&A<=3000);if(leviathan)a.bonusAtk-=500;
  if(d.stance==="atk"){let D=stat(g,1-pi,d,"atk")+(dadv?500:0);if(dc.id==="CRE-06"&&isDragon(ac))D+=800;
    if(A>D){if(!leviathan&&!(d.safeTurn===g.turn)&&!(dc.id==="SR-01"&&g.r()<.5)){destroy(g,1-pi,t);win2(g,pi,a,adv);}damage(g,1-pi,A-D,true,A);
      if(/wins a battle, deal (\d+) damage/.test(ac.ability||""))damage(g,1-pi,+RegExp.$1);}
    else if(D>A){if(!(ac.id==="SR-01"&&g.r()<.5)&&!(ac.id==="ULT-09"&&D<=3000))destroy(g,pi,i);damage(g,pi,D-A,true,D);if(o.field[t])gainXP(g,1-pi,d,2);}
    else{destroy(g,pi,i);if(!leviathan)destroy(g,1-pi,t);}
  }else{let D=stat(g,1-pi,d,"def")+(dadv?500:0);
    if(A>D){if(!leviathan&&!(d.safeTurn===g.turn)&&!(dc.id==="SR-01"&&g.r()<.5)){destroy(g,1-pi,t);win2(g,pi,a,adv);}}
    else if(D>A){damage(g,pi,D-A,true,D);}}
  g._vamp&&g._vamp();g._vamp=null;g.mirrorFor=null;checkReady(g,pi);return true;}
function rec(g,m,k){if(!m||!m.copy)return;const s=g.stats[m.copy]=g.stats[m.copy]||{battles:0,kos:0,used:0,evos:0};s[k]++;}
function win2(g,pi,a,adv){rec(g,a,'kos');if(a.id==="UR-02"){const o=g.p[1-pi];if(o.hand.length){o.grave.push(o.hand.splice(Math.floor(g.r()*o.hand.length),1)[0]);L(g,o.name+" discards a card to Eclipsara");}}if(tsum(a,'burn'))damage(g,1-pi,tsum(a,'burn'));gainXP(g,pi,a,2+(adv?1:0)+(a.relic==="REL-03"?2:0));}
function endTurn(g){if(g.winner!=null)return;const p=g.p[g.cur];p.field.forEach(m=>{if(m){m.tmpAtk=0;m.tmpDef=0;}});
  while(p.hand.length>8)p.grave.push(p.hand.shift());g.cur=1-g.cur;startTurn(g);}
// ---- AI ----
function aiTurn(g,pi=1){let guard=0;const p=g.p[pi];
  while(guard++<20&&g.winner==null){let best=-1,bs=-1e9,bt=null;
    p.hand.forEach((h,k)=>{if(!canPlay(g,pi,h))return;const c=C(h);let s=(c.cost||0)*10+(c.atk||0)/100;let t=null;
      const tt=needsTarget(c);
      if(tt==="own"||c.type==="Relic"||c.id==="UR-03"){const cand=p.field.map((m,i)=>m&&!m.egg&&(c.type!=="Relic"||(!m.relic&&(c.element==="Any"||els(C(m)).includes(c.element))))&&(tt!=="own"||targetOk(c,m))?i:-1).filter(i=>i>=0);if(!cand.length)return;t=cand.sort((x,y)=>(p.field[y].xp-p.field[x].xp))[0];}
      if(tt==="enemy"){const o=g.p[1-pi];const cand=o.field.map((m,i)=>m&&!m.egg?i:-1).filter(i=>i>=0);if(!cand.length)return;t=cand.sort((x,y)=>stat(g,1-pi,o.field[y],"atk")-stat(g,1-pi,o.field[x],"atk"))[0];s+=20;}
      if(c.id==="MAG-04"||c.id==="MAG-05")s-=30;if(c.type==="Trap")s-=5;
      if(s>bs){bs=s;best=k;bt=t;}});
    if(best<0)break;const c=C(p.hand[best]);
    const st=isMon(c)&&(c.def||0)>(c.atk||0)?"def":"atk";if(!play(g,pi,best,bt,st))break;}
  {const ei=p.field.findIndex(m=>m&&m.id==="UR-02"&&m.summonedTurn!==g.turn&&!m.frozen&&m.stance==="atk");if(ei>=0&&p.sacTurn!==g.turn){let wi=-1,wv=1e9;p.field.forEach((m,k)=>{if(m&&k!==ei){const v=m.egg?0:stat(g,pi,m,"atk");if(v<wv){wv=v;wi=k;}}});if(wi>=0)sacrifice(g,pi,wi);}}
  // attacks
  for(let i=0;i<3&&g.winner==null;i++){for(let rep=0;rep<2;rep++){if(!canAttack(g,pi,i))break;const a=p.field[i],o=g.p[1-pi];const lt=legalTargets(g,pi,i);
    let choice=null,score=0;const A=stat(g,pi,a,"atk");
    for(const t of lt){if(t==="direct"){const s=A+(o.field.some(x=>x)?-A/2:0);if(s>score){score=s;choice=t;}continue;}
      const d=o.field[t];if(d.egg){if(300>score){score=300;choice=t;}continue;}const A2=A+(hasAdv(a,d)?500:0);const D=d.stance==="atk"?stat(g,1-pi,d,"atk")+(hasAdv(d,a)?500:0):stat(g,1-pi,d,"def")+(hasAdv(d,a)?500:0);
      if(A2>D){const s=1000+D;if(s>score){score=s;choice=t;}}}
    if(choice==null)break;attack(g,pi,i,choice);}}
  // guard weak monsters
  p.field.forEach((m,i)=>{if(m&&!m.egg&&m.stance==="atk"&&!m.attacked){const o=g.p[1-pi];const maxA=Math.max(0,...o.field.filter(Boolean).map(x=>stat(g,1-pi,x,"atk")));if(maxA>stat(g,pi,m,"atk")&&stat(g,pi,m,"def")>stat(g,pi,m,"atk"))setStance(g,pi,i);}});
  if(g.winner==null)endTurn(g);}
// ---- persistent collection ----
const LIFE={xpPerLevel:100,maxLevel:10,evolveLevel:3};
function lifetimeXP(st,won){return st.used*10+st.battles*15+st.kos*30+st.evos*20+(won?25:0);}
function applyMatch(coll,g,youWon,bossWin){const ev=[];const r=g.r;for(const cp of coll){const st=g.stats[cp.copy];if(!st)continue;cp.battles=(cp.battles||0)+st.battles;cp.kos=(cp.kos||0)+st.kos;cp.matches=(cp.matches||0)+1;if(youWon)cp.wins=(cp.wins||0)+1;
 const oldLv=cp.lvl||0;cp.lxp=(cp.lxp||0)+lifetimeXP(st,youWon);cp.traits=cp.traits||[];let lv=Math.min(LIFE.maxLevel,Math.floor(cp.lxp/LIFE.xpPerLevel));const c=CARDS[cp.id];
 if(c.evolves_to&&lv>=LIFE.evolveLevel){ev.push({from:cp.id,to:c.evolves_to,copy:cp.copy});cp.id=c.evolves_to;cp.lxp=0;lv=0;}if((lv>oldLv||(bossWin&&st.used))&&cp.traits.length<3&&(lv>oldLv?r()<0.5:true)){const t=rollTrait(r,cp.traits,bossWin);cp.traits.push(t);ev.push({trait:t,copy:cp.copy,id:cp.id});}
 if(lv>oldLv)ev.push({level:lv,copy:cp.copy,id:cp.id});cp.lvl=lv;}return ev;}
const API={FX,pentHit,elOf,LBEATS,hasAdv,sacrifice,LEGIONS,LEGION_OF,deckLegion,legionOfCard,TRAITS,TR,rollTrait,LIFE,applyMatch,lifetimeXP,CARDS,DATA,THR,newGame,play,attack,endTurn,aiTurn,canPlay,canAttack,legalTargets,setStance,stat,autoDeck,validateDeck,poolIds,needsTarget,targetOk,rng,isMon,win,gainXP};
if(typeof module!=='undefined')module.exports=API;else root.DA=API;
})(this);
