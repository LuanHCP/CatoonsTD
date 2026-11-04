const endpoint=process.argv[2]||'http://127.0.0.1:9223';
const base=process.argv[3]||'http://127.0.0.1:4192';
const target=await(await fetch(endpoint+'/json/new?'+encodeURIComponent(base+'/?testHooks=1'),{method:'PUT'})).json();
const socket=new WebSocket(target.webSocketDebuggerUrl),pending=new Map();let id=0,original=null;
socket.addEventListener('message',event=>{const message=JSON.parse(event.data),callback=pending.get(message.id);if(callback){pending.delete(message.id);message.error?callback.reject(new Error(message.error.message)):callback.resolve(message.result);}});
await new Promise(resolve=>socket.addEventListener('open',resolve,{once:true}));
const call=(method,params={})=>new Promise((resolve,reject)=>{const key=++id;pending.set(key,{resolve,reject});socket.send(JSON.stringify({id:key,method,params}));});
const evaluate=async expression=>{const r=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw new Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
try{
  await call('Runtime.enable');
  let ready=false;for(let i=0;i<100;i++){if(await evaluate('typeof __CatoonsTest!=="undefined"')){ready=true;break;}await new Promise(resolve=>setTimeout(resolve,100));}if(!ready)throw new Error('Jogo não carregou.');
  original=await evaluate('JSON.stringify(profile)');
  const result=await evaluate(`(()=>{
    profile=cloneDefaultProfile();profile.level=10;profile.matchTutorialSeen=true;
    personalTd.loadSelection('grove','normal','boss-event','normal');setScreen('game');
    const test=__CatoonsTest,s=test.state,boss=test.makeDailyBoss(20);boss.id=s.nextEnemyId++;boss.d=100;boss.speed=100;boss.bossShieldHp=0;
    const p=test.pointAt(boss.d,0),tower={id:1,type:'vine',owner:'host',x:p.x+40,y:p.y,paths:[0,0,0],level:1,cool:0,spent:225};
    s.paused=false;s.spawn=[];s.enemies=[boss];s.towers=[tower];s.wave=20;s.waveActive=true;
    test.update(0,performance.now()/1000);
    if((boss.rootTimer||0)!==0||boss.vineSlowFactor!==.65)throw new Error('Ataque real do Cipó não desacelerou o boss.');
    tower.cool=100;
    test.update(.5,performance.now()/1000);const vineDistance=boss.d-100;
    boss.slowTimer=1;boss.slowFactor=.5;const beforeFrost=boss.d;test.update(.25,performance.now()/1000);const combinedDistance=boss.d-beforeFrost;
    if(Math.abs(vineDistance-32.5)>.001||Math.abs(combinedDistance-12.5)>.001)throw new Error('Lentidão somada ou movimento incorreto: '+JSON.stringify({vineDistance,combinedDistance}));
    profile.mastery.vine.level=50;s.selectedTower=1;test.activateMasteryAbility();
    if((boss.rootTimer||0)!==0||boss.vineSlowFactor!==.35||boss.vineSlowTimer!==4)throw new Error('Maestria não aplicou lentidão limitada.');
    const snapshot=JSON.parse(JSON.stringify(test.lanSnapshot()));
    if(snapshot.enemies[0].vineSlowFactor!==.35||!snapshot.enemies[0].vineSlows.length)throw new Error('Snapshot perdeu o efeito.');
    s.paused=true;return{vineDistance,frostAndVineDistance:combinedDistance,masterySlow:boss.vineSlowFactor,masteryDuration:boss.vineSlowTimer,rootTimer:boss.rootTimer||0,snapshot:true};
  })()`);
  console.log(JSON.stringify(result,null,2));
}finally{
  if(original)try{await evaluate('profile=normalizeProfile('+original+');saveProfile();true');}catch(_){}
  try{await call('Page.close');}catch(_){}socket.close();
}
