import assert from 'node:assert/strict';

const endpoint=process.argv[2]||'http://127.0.0.1:9231';
const base=process.argv[3]||'http://127.0.0.1:4200';
const url=base+'/?testHooks=1';
const target=await (await fetch(endpoint+'/json/new?'+encodeURIComponent(url),{method:'PUT'})).json();
const socket=new WebSocket(target.webSocketDebuggerUrl);
const pending=new Map(),errors=[];
let id=0;
socket.addEventListener('message',event=>{
  const m=JSON.parse(event.data);
  if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);
  const request=pending.get(m.id);
  if(request){pending.delete(m.id);m.error?request.reject(new Error(m.error.message)):request.resolve(m.result);}
});
await new Promise(resolve=>socket.addEventListener('open',resolve,{once:true}));
const call=(method,params={})=>new Promise((resolve,reject)=>{
  const key=++id;pending.set(key,{resolve,reject});socket.send(JSON.stringify({id:key,method,params}));
});
const run=async expression=>{
  const r=await call('Runtime.evaluate',{expression,returnByValue:true});
  if(r.exceptionDetails)throw new Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);
  return r.result.value;
};
async function waitFor(expression){
  for(let i=0;i<80;i++){
    if(await run(expression))return;
    await new Promise(resolve=>setTimeout(resolve,50));
  }
  throw new Error('Timed out: '+expression);
}
const click=selector=>run(`document.querySelector(${JSON.stringify(selector)}).click()`);
const screen=name=>waitFor(`document.body?.dataset.screen==='${name}'`);
const reload=async()=>{
  await call('Page.reload',{ignoreCache:true});await screen('hub');await waitFor('Boolean(window.__CatoonsTest)');
};

try{
  await call('Runtime.enable');
  await waitFor('Boolean(window.__CatoonsTest)');
  await run("profile=cloneDefaultProfile();profile.matchTutorialSeen=true;saveProfile();");
  await click('[data-screen="missions"]');
  assert.equal(await run("document.querySelectorAll('#daily-missions article').length"),3);
  assert.equal(await run(`(()=>{
    const p=cloneDefaultProfile(),d=new Date('2026-11-09T02:59:59Z'),next=new Date('2026-11-09T03:00:00Z');
    const before=Fieldwork.period(d),after=Fieldwork.period(next);
    if(before.dayKey!=='2026-11-08'||after.dayKey!=='2026-11-09'||before.weekKey===after.weekKey)return false;
    p.missions={...Fieldwork.normalize(null,after),weekly:9};
    const task=after.tasks[0],count={[task.id]:task.goal};
    const paid=Fieldwork.advance(p,count,after),again=Fieldwork.advance(p,count,after);
    return paid===task.coins+Fieldwork.weeklyCoins&&again===0&&p.honors.medals.includes('weeklyDefender');
  })()`),true);
  await click('[data-screen="tutorial"]');
  assert.equal(await run("document.querySelectorAll('#tutorial-balloons .undiscovered').length"),17);
  await click('[data-screen="play"]');await click('#play-enter');await screen('game');
  await click('[data-td-tower="dart"]');
  assert(await run('[[200,110],[400,110],[700,105],[450,460]].some(([x,y])=>__CatoonsTest.placeTower(x,y))'));
  await click('#td-start');
  assert(await run(`(()=>{
    const t=__CatoonsTest,s=t.state;t.update(.02,0);t.usePower('frenzy');
    return profile.discoveries.includes('normal')&&profile.inventory.frenzy===1&&s.pendingPowers.frenzy===1&&profile.checkpoints.campaign.towers.length===1;
  })()`));
  await reload();
  await click('[data-checkpoint-mode="campaign"]');await screen('game');
  assert(await run(`(()=>{
    const s=__CatoonsTest.state;return s.wave===0&&s.towers.length===1&&s.towers[0].type==='dart'&&profile.inventory.frenzy===1;
  })()`));
  await click('#td-start');
  assert(await run(`(()=>{
    const t=__CatoonsTest,s=t.state;t.usePower('frenzy');
    s.spawn=[];s.enemies=[];t.update(0,0);
    return profile.checkpoints.campaign.wave===1&&profile.inventory.frenzy===0&&profile.missions.progress.rounds===1;
  })()`));
  assert(await run(`(()=>{
    const t=__CatoonsTest,s=t.state,previous=s.wave;
    s.wave=6;t.update(0,0);
    const warns=document.querySelector('#next-wave-alert').textContent.includes('Primeiros camuflados');
    s.wave=previous;t.update(0,0);
    return warns;
  })()`));
  await click('#td-exit');await click('#menu-save-lobby');await screen('hub');
  await click('[data-screen="event"]');await click('#event-start');await screen('game');
  const event=await run(`(()=>{
    const t=__CatoonsTest,s=t.state;return {boss:s.eventBossId,id:s.matchId,firstHp:t.makeDailyBoss(20).maxHp};
  })()`);
  await click('#td-exit');await click('#menu-save-lobby');await screen('hub');
  await click('[data-go-screen="training"]');await click('#training-enter');await screen('game');
  assert(await run("__CatoonsTest.state.mode==='training'&&__CatoonsTest.state.money===100000"));
  assert(await run(`(()=>{
    const t=__CatoonsTest;t.state.eventBossId=${JSON.stringify(event.boss)};
    return t.makeDailyBoss(20).maxHp===${event.firstHp};
  })()`),'Training invasion should use the event HP');
  const before=await run('JSON.stringify(profile)');
  for(const [width,height,mobile] of [[1366,768,false],[844,390,true],[390,844,true]]){
    await call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile});
    assert(await run(`(()=>{
      const e=document.querySelector('#training-enemy'),r=e.getBoundingClientRect();
      const b=document.querySelector('#td-start').getBoundingClientRect();
      return r.width>20&&r.height>15&&r.right<=innerWidth+2&&b.right<=innerWidth+2&&b.bottom<=innerHeight+2;
    })()`),'Training controls at '+width+'×'+height);
  }
  await call('Emulation.setDeviceMetricsOverride',{width:844,height:390,deviceScaleFactor:1,mobile:true});
  const launch=await run(`(()=>{
    const e=document.querySelector('#training-enemy');e.value='eclipse';e.dispatchEvent(new Event('change'));
    document.querySelector('#training-pack').value='60';
    const r=document.querySelector('#td-start').getBoundingClientRect();
    return {x:r.x+r.width/2,y:r.y+r.height/2};
  })()`);
  await call('Input.dispatchMouseEvent',{...launch,type:'mousePressed',button:'left',clickCount:1});
  await call('Input.dispatchMouseEvent',{...launch,type:'mouseReleased',button:'left',clickCount:1});
  assert(await run(`(()=>{
    const t=__CatoonsTest,s=t.state,boss=s.spawn[0]||s.enemies[0];
    if(boss?.raidBoss!=='eclipse'||boss.round!==60)return false;
    t.usePower('frenzy');
    for(let i=0;i<4;i++)t.damageEnemy(boss,1e9,{sourceType:'laser'});
    t.update(0,0);
    document.querySelector('#training-clear').click();
    return boss.dead&&!s.waveActive&&s.enemies.length===0;
  })()`));
  assert.equal(await run('JSON.stringify(profile)'),before,'Training changed profile progress');
  await click('#td-exit');await click('#menu-lobby');await screen('training');
  await click('[data-screen="hub"]');
  assert.equal(await run("document.querySelectorAll('[data-checkpoint-mode]').length"),2);
  await click('[data-checkpoint-mode="boss-event"]');await screen('game');
  assert(await run(`__CatoonsTest.state.eventBossId===${JSON.stringify(event.boss)}&&__CatoonsTest.state.matchId===${JSON.stringify(event.id)}`));
  await run('__CatoonsTest.state.wave=19;__CatoonsTest.state.lastFarmPaidWave=19;');
  const killInvasion=`(()=>{
    const t=__CatoonsTest,s=t.state;
    personalTd.startWave();
    const boss=s.spawn.find(e=>e.eventBoss);
    boss.id=5000;
    for(let i=0;i<8&&!boss.dead;i++)t.damageEnemy(boss,1e9,{sourceType:'laser',detectsCamo:true,breaksArmor:true});
    return boss.dead&&profile.salmonCans===0&&s.pendingBossRewards.length===1;
  })()`;
  assert(await run(killInvasion),'Boss reward should wait for a safe checkpoint');
  await reload();
  await click('[data-checkpoint-mode="boss-event"]');await screen('game');
  assert(await run(killInvasion),'Invasion should replay cleanly after reload');
  assert(await run(`(()=>{
    const t=__CatoonsTest,s=t.state;s.spawn=[];s.enemies=[];t.update(0,0);
    return profile.salmonCans===3&&profile.checkpoints['boss-event'].wave===20;
  })()`),'Boss reward should settle once with the checkpoint');
  assert.deepEqual(errors,[]);
  console.log('OK: daily and weekly boundaries, auto-rewards, discovery, checkpoint reload and power settlement, independent slots, training controls at three resolutions and isolated progress.');
}finally{
  socket.close();
  await fetch(endpoint+'/json/close/'+target.id);
}
