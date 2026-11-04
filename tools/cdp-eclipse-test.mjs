import {mkdirSync,writeFileSync} from 'node:fs';
const endpoint=process.argv[2]||'http://127.0.0.1:9226',base=process.argv[3]||'http://127.0.0.1:4196';
const target=await(await fetch(endpoint+'/json/new?'+encodeURIComponent(base+'/?testHooks=1'),{method:'PUT'})).json(),socket=new WebSocket(target.webSocketDebuggerUrl),pending=new Map(),errors=[];let id=0,original=null;
socket.addEventListener('message',event=>{const m=JSON.parse(event.data);if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.text);const p=pending.get(m.id);if(p){pending.delete(m.id);m.error?p.reject(new Error(m.error.message)):p.resolve(m.result);}});
await new Promise(resolve=>socket.addEventListener('open',resolve,{once:true}));
const call=(method,params={})=>new Promise((resolve,reject)=>{const key=++id;pending.set(key,{resolve,reject});socket.send(JSON.stringify({id:key,method,params}));});
const evaluate=async expression=>{const r=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw new Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const assert=(value,message)=>{if(!value)throw new Error(message);};
const shot=async name=>{mkdirSync('release/preview',{recursive:true});const r=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});writeFileSync('release/preview/'+name+'.png',Buffer.from(r.data,'base64'));};
try{
  await call('Runtime.enable');for(let i=0;i<100;i++){if(await evaluate('typeof __CatoonsTest!=="undefined"'))break;await wait(100);}
  original=await evaluate('JSON.stringify(profile)');await evaluate('profile=cloneDefaultProfile();profile.level=50;profile.matchTutorialSeen=true;saveProfile();true');
  const filters=await evaluate(`(()=>{document.querySelector('[data-screen="cats"]').click();document.querySelector('#collection-class-filters [data-cat-class="magic"]').click();const cards=[...document.querySelectorAll('[data-mastery-cat]')];return{count:cards.length,valid:cards.every(c=>EventRules.categoryOf(c.dataset.masteryCat)==='magic')};})()`);
  assert(filters.count>=2&&filters.valid,'Filtro da coleção falhou.');
  await call('Emulation.setDeviceMetricsOverride',{width:1366,height:768,deviceScaleFactor:1,mobile:false});
  const mechanics=await evaluate(`(()=>{
    personalTd.loadSelection('grove','normal','boss-event','normal','eclipse');setScreen('game');const t=__CatoonsTest,s=t.state;s.paused=true;s.wave=20;
    const boss=t.makeDailyBoss(20);boss.id=1;boss.d=200;boss.hp=boss.maxHp*.9;const p=t.pointAt(boss.d,0);
    const unit=(id,type,x,y)=>({id,type,owner:'host',x,y,paths:[0,0,0],level:1,cool:100,spent:100,damageDealt:123,incomeGenerated:0});
    s.enemies=[boss];s.towers=[unit(1,'dart',p.x+30,p.y),unit(2,'vine',p.x+40,p.y),unit(3,'dart',p.x+151,p.y)];
    t.applyEclipseAuras(2);if(s.towers.some(u=>u.eclipseStunned))throw Error('Aura ativou antes do aviso.');
    t.applyEclipseAuras(1);if(!s.towers[0].eclipseStunned||s.towers[1].eclipseStunned||s.towers[2].eclipseStunned)throw Error('Categoria/alcance errado.');
    const hp=boss.hp;t.applyEclipseAuras(1);if(boss.hp<=hp)throw Error('Aura não curou.');
    boss.bossPhase=2;boss.auraWarning=3;boss.hp=boss.maxHp*.6;t.applyEclipseAuras(3);if(s.towers[0].eclipseStunned||!s.towers[1].eclipseStunned)throw Error('Troca da etapa falhou.');
    t.applyEclipseAuras(100);if(boss.hp>boss.maxHp*.75+.001)throw Error('Curou etapa anterior.');
    boss.bossPhase=4;boss.auraWarning=0;boss.hp=boss.maxHp*.2;s.towers=[unit(4,'salmon',p.x+30,p.y),unit(5,'litter',p.x+50,p.y)];s.towers[1].paths=[5,0,0];
    t.applyEclipseAuras(0);if(!s.towers.every(u=>u.eclipseStunned)||t.litterTeamBonuses().universalPop)throw Error('Suporte não foi suspenso.');
    s.lastFarmPaidWave=18;s.wave=19;t.processFarmIncome();if(s.towers[0].incomeGenerated)throw Error('Fazenda atordoada produziu.');
    s.repositionTower=4;if(!t.moveRepositionedTower(100,100)||s.towers[0].eclipseStunned)throw Error('Reposicionar não liberou o gato.');
    s.selectedTower=4;t.sellSelectedTower();if(s.soldTowers.length!==1)throw Error('Venda perdeu o histórico.');
    t.showResult(false);if(!document.querySelector('#result-details').textContent.includes('(vendido)'))throw Error('Resumo não preservou vendido.');
    return{warning:true,localRange:true,classChanges:true,healingCeiling:true,supportDisabled:true,farmDisabled:true,reposition:true,soldReport:true};
  })()`);await shot('eclipse-report');
  await evaluate(`(()=>{const t=__CatoonsTest,s=t.state;document.querySelector('#result-screen').classList.remove('visible');setScreen('game');const boss=t.makeDailyBoss(20);boss.d=450;boss.bossPhase=2;boss.hp=boss.maxHp*.7;boss.auraWarning=0;const p=t.pointAt(boss.d,0);s.enemies=[boss];s.spawn=[];s.towers=[{id:8,type:'vine',owner:'host',x:p.x+65,y:p.y+40,paths:[0,0,0],level:1,cool:10,spent:225}];s.wave=20;s.paused=false;t.update(0,performance.now()/1000);s.paused=true;return true;})()`);await wait(200);await shot('eclipse-combat');
  for(const [width,height] of [[844,390],[390,844]]){
    await call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:true});
    assert(await evaluate(`(()=>{document.querySelector('#match-class-filters [data-cat-class="magic"]').click();const visible=[...document.querySelectorAll('[data-td-tower]')].filter(b=>!b.hidden);const r=document.querySelector('#td-start').getBoundingClientRect(),f=document.querySelector('#match-class-filters').getBoundingClientRect(),d=document.querySelector('.td-dock-scroll').getBoundingClientRect();return visible.length>=2&&visible.every(b=>EventRules.categoryOf(b.dataset.tdTower)==='magic')&&r.left>=0&&r.right<=innerWidth+2&&r.bottom<=innerHeight+2&&f.right<=innerWidth+2&&d.right<=innerWidth+2;})()`),'Filtro/controle de rodada no celular '+width);
    await wait(200);await shot('eclipse-combat-'+width);
  }
  await call('Emulation.setDeviceMetricsOverride',{width:1366,height:768,deviceScaleFactor:1,mobile:false});await evaluate(`document.querySelector('#match-class-filters [data-cat-class="all"]').click();true`);
  const victories=[];
  for(const variant of ['normal','insane']){
    victories.push(await evaluate(`(()=>{
      personalTd.loadSelection('grove','normal','boss-event','${variant}','eclipse');setScreen('game');const t=__CatoonsTest,s=t.state;
      for(const round of [20,40,60]){let limit=0;while(s.wave<round&&limit++<65)personalTd.startWave();const boss=s.spawn.find(e=>e.eventBoss&&e.round===round);if(!boss)throw Error('Boss ausente');boss.id=s.nextEnemyId++;s.spawn=[];s.enemies=[boss];let hits=0;while(!boss.dead&&hits++<10)t.damageEnemy(boss,1e9,{sourceType:'laser',detectsCamo:true,breaksArmor:true});s.paused=false;t.update(0,performance.now()/1000);}
      if(!s.completed)throw Error('Evento não concluiu');return{variant:'${variant}',cans:profile.salmonCans,kills:profile.honors.eclipseKills,wins:profile.honors.eclipseWins,pure:profile.honors.eclipsePureWins,medals:profile.honors.medals};
    })()`));
  }
  assert(victories[0].cans===16&&victories[1].cans===64&&victories[1].pure===2,'Recompensas incorretas: '+JSON.stringify(victories));
  assert(!victories[1].medals.includes('bossSlayer'),'Eclipse concedeu conquista do Almirante.');
  await evaluate(`document.querySelector('#result-lobby').click();document.querySelector('[data-screen="cosmetics"]').click();document.querySelector('[data-cosmetic="bannerEclipse"]').click();document.querySelector('[data-cosmetic="avatarEclipse"]').click();true`);
  assert(await evaluate(`profile.salmonCans===29&&profile.identity.banner==='bannerEclipse'&&profile.identity.avatar==='avatarEclipse'`),'Compra de cosmético exclusivo falhou.');
  for(const [width,height] of [[1366,768],[844,390],[390,844]]){
    await call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<900});
    for(const screen of ['event','cats','cosmetics']){await evaluate(`document.querySelector('[data-screen="${screen}"]').click();true`);await wait(180);assert(await evaluate(`(()=>{const s=document.querySelector('.screen.active');return s.scrollWidth<=s.clientWidth+2&&document.querySelector('.game-shell').scrollWidth<=innerWidth;})()`),'Corte de tela '+screen+' '+width);await shot(screen+'-new-'+width);}
  }
  assert(!errors.length,'Erros no navegador: '+errors);console.log(JSON.stringify({filters,mechanics,victories,cosmetics:true,layouts:9,browserErrors:errors},null,2));
}finally{if(original)try{await evaluate('profile=normalizeProfile('+original+');saveProfile();true');}catch(_){}try{await call('Page.close');}catch(_){}socket.close();}
