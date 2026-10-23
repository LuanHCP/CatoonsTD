import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const context=vm.createContext({window:{},console});vm.runInContext(readFileSync('src/identity.js','utf8'),context);
const identity=context.window.CatoonsIdentity;
const old={level:8,coins:731,maps:{grove:{cleared:{easy:true,normal:false,hard:false}},ridge:{cleared:{easy:false,normal:false,hard:false}}}};
identity.normalize(old,{identity:{name:'Luan',banner:'unknown',owned:['unknown']}});
assert.equal(old.coins,731);assert.equal(old.salmonCans,0);assert.equal(old.identity.banner,'bannerStarter');
assert.equal(identity.buy(old,'bannerTide').ok,false);
assert.equal(identity.grant(old,{id:'match:boss1',cans:3,bossKill:true}),true);
assert.equal(old.salmonCans,3);assert(old.honors.medals.includes('bossSlayer'));
assert.equal(identity.grant(old,{id:'match:boss1',cans:3,bossKill:true}),false);assert.equal(old.salmonCans,3);
assert.equal(identity.buy(old,'bannerTide').ok,false);
identity.grant(old,{id:'match:boss2',cans:17,bossKill:true});
assert.equal(identity.buy(old,'bannerTide').ok,true);assert.equal(old.salmonCans,0);assert.equal(old.identity.banner,'bannerTide');
assert.equal(identity.buy(old,'bannerTide').ok,true);assert.equal(old.salmonCans,0);
identity.grant(old,{id:'match:map',cans:0,mapClear:'ridge',difficulty:'easy'});assert(old.honors.medals.includes('campaignEasy'));
identity.grant(old,{id:'match:insane',cans:48,insaneWin:true});assert(old.honors.medals.includes('insaneVictor'));
assert.equal(identity.buy(old,'avatarRoyal').ok,true);assert.equal(old.salmonCans,18);
const restored=structuredClone(old);identity.normalize(restored,structuredClone(old));
assert.equal(restored.identity.avatar,'avatarRoyal');assert.equal(restored.identity.banner,'bannerTide');assert.equal(restored.salmonCans,18);
assert.equal(identity.grant(restored,{id:'match:insane',cans:48,insaneWin:true}),false);

const source=readFileSync('src/game.js','utf8');
function extract(name){
  const start=source.indexOf('  function '+name+'(');assert(start>=0,'Missing '+name);
  const next=source.indexOf('\n  function ',start+4),chunk=source.slice(start,next<0?source.length:next);
  const end=chunk.lastIndexOf('\n  }');if(end>=0)return chunk.slice(0,end+4);
  return chunk.trim();
}
const state={matchPlayers:1,eventVariant:'normal',towers:[],hero:null,enemies:[],pulses:[],masterySession:{}};
const no=()=>{},rewards=[];
const combat=vm.createContext({state,lan:{playerCount:1},types:{vine:{name:'Cipó'}},profile:{coins:0},$t:x=>x,$T:(strings,...values)=>strings.reduce((sum,s,i)=>sum+s+(values[i]??''),''),
  currentMap:()=>({speedMultiplier:.92,rewardMultiplier:1.08}),currentDifficulty:()=>({speed:1.12,waveReward:.86,coinMultiplier:1.35}),
  strongestRegularDurability:()=>11.123,isSpecialEnemy:()=>false,pointAt:()=>({x:0,y:0}),spawnDamageNumber:no,spawnImpactFx:no,spawnFloatText:no,recordMastery:no,synergyActive:()=>false,sfx:no,
  playMusicTheme:no,addWallet:no,saveProfile:no,setMsg:no,grantHeroXp:no,summonShadowBalloon:no,recordProgressReward:reward=>rewards.push(reward),
  masteryState:()=>({level:50}),selectedTower:()=>({type:'vine'}),towerStats:()=>({}),MASTERY_ABILITIES:{vine:{name:'Floresta Prisional',icon:'X',cooldown:70}},updateUpgradePanel:no,updateStats:no,W:1100,H:620});
for(const name of ['isThermalSource','bossShieldRequirement','damageEnemy','makeDailyBoss','canControlTarget','activateMasteryAbility'])vm.runInContext(extract(name),combat);
for(const players of [1,2,3,4]){
  state.matchPlayers=players;state.eventVariant='normal';
  combat.eventPlayerCount=n=>n;combat.eventTeamScale=n=>1+(n-2)*.34;
  const normal=combat.makeDailyBoss(20);state.eventVariant='insane';const insane=combat.makeDailyBoss(20);
  assert.equal(insane.maxHp,normal.maxHp*5);assert.equal(insane.bossShieldMax,normal.bossShieldMax*5);
}
assert.equal(combat.canControlTarget({type:'vine'},{kind:'boss',camo:false},{}),false);
assert.equal(combat.canControlTarget({type:'vine'},{kind:'normal',camo:false},{}),true);
state.enemies=[{kind:'boss',dead:false,rootTimer:0},{kind:'normal',dead:false,rootTimer:0}];
combat.activateMasteryAbility();assert.equal(state.enemies[0].rootTimer,0);assert.equal(state.enemies[1].rootTimer,4);
const enemy={id:1,kind:'boss',eventBoss:true,encounter:1,hp:100,maxHp:100,bossPhase:1,bossShieldHp:10,bossShieldMax:10,d:0,reward:100,name:'Almirante'};
assert.equal(combat.damageEnemy(enemy,100,{}),false);assert.equal(enemy.hp,100);
combat.damageEnemy(enemy,10,{breaksArmor:true});assert.equal(enemy.bossShieldHp,0);
combat.damageEnemy(enemy,999,{});assert.equal(enemy.hp,75);assert.equal(enemy.bossPhase,2);
assert.equal(combat.damageEnemy(enemy,999,{breaksArmor:true}),false);
combat.damageEnemy(enemy,999,{detectsCamo:true});combat.damageEnemy(enemy,999,{});assert.equal(enemy.hp,50);assert.equal(enemy.bossPhase,3);
assert.equal(combat.damageEnemy(enemy,999,{sourceType:'ninja',burn:{damage:2}}),false);
combat.damageEnemy(enemy,999,{sourceType:'laser'});combat.damageEnemy(enemy,999,{});assert.equal(enemy.hp,25);assert.equal(enemy.bossPhase,4);
combat.damageEnemy(enemy,999,{});combat.damageEnemy(enemy,999,{});assert.equal(enemy.dead,true);assert.equal(rewards.at(-1).cans,9);
console.log('OK: migration, unique rewards, unlock/purchase/equip/persistence, four shield phases, fire vs poison, vine immunity and exact Insane 5x for 1–4 players.');
