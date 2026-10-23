const endpoint=process.argv[2]||'http://127.0.0.1:9223',url=(process.argv[3]||'http://127.0.0.1:4192')+'/?testHooks=1';
class Client{
  constructor(url){this.socket=new WebSocket(url);this.id=0;this.pending=new Map();this.socket.addEventListener('message',event=>{const m=JSON.parse(event.data),p=this.pending.get(m.id);if(p){this.pending.delete(m.id);m.error?p.reject(new Error(m.error.message)):p.resolve(m.result);}});}
  async open(){await new Promise(resolve=>this.socket.addEventListener('open',resolve,{once:true}));}
  call(method,params={}){return new Promise((resolve,reject)=>{const id=++this.id;this.pending.set(id,{resolve,reject});this.socket.send(JSON.stringify({id,method,params}));});}
  async eval(expression){const r=await this.call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw new Error(JSON.stringify(r.exceptionDetails));return r.result.value;}
}
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms)),clients=[],original=[];
const until=async(fn,label)=>{for(let i=0;i<100;i++){if(await fn())return;await wait(100);}throw new Error(label);};
try{
  for(let i=0;i<2;i++){const target=await(await fetch(endpoint+'/json/new?'+encodeURIComponent(url),{method:'PUT'})).json(),client=new Client(target.webSocketDebuggerUrl);await client.open();clients.push(client);await client.call('Runtime.enable');}
  const [host,guest]=clients;
  for(const client of clients)await until(()=>client.eval('typeof personalTd!=="undefined"&&typeof __CatoonsTest!=="undefined"'), 'Jogo não carregou.');
  for(const client of clients){original.push(await client.eval('JSON.stringify(profile)'));await client.eval('profile=cloneDefaultProfile();profile.matchTutorialSeen=true;saveProfile();true');}
  await guest.eval(`(()=>{const original=Peer.prototype.connect;Peer.prototype.connect=function(...args){const conn=original.apply(this,args);window.__testConnection=conn;return conn;};return true;})()`);
  const id=await host.eval('CatoonsLan.createRoom()');await guest.eval(`CatoonsLan.joinRoom('${id}')`);
  await until(()=>host.eval('CatoonsLan.playerCount===2'), 'Anfitrião não confirmou a equipe.');
  await host.call('Page.bringToFront');
  await host.eval(`document.querySelector('[data-screen="event"]').click();document.querySelector('[data-event-variant="insane"]').click();document.querySelector('#event-start').click();true`);
  await wait(1700);await guest.call('Page.bringToFront');await wait(1700);
  await until(async()=>(await Promise.all(clients.map(client=>client.eval(`document.body.dataset.screen==='game'`)))).every(Boolean),'Evento não abriu.');
  await host.call('Page.bringToFront');
  await host.eval(`for(let i=0;i<18;i++)personalTd.startWave();true`);
  if(!await host.eval(`!document.querySelector('#boss-preparation').hidden&&document.querySelector('#boss-preparation').textContent.includes('Falta na defesa')`))throw new Error('Preparação não apareceu.');
  const kill=async round=>host.eval(`(()=>{
    const test=__CatoonsTest;let skips=0;while(test.state.wave<${round}&&skips++<65)personalTd.startWave();
    if(test.state.wave!==${round})throw new Error('Rodada não avançou: '+JSON.stringify({wave:test.state.wave,lives:test.state.lives,paused:test.state.connectionPaused,recovering:CatoonsLan.recovering,completed:test.state.completed}));
    const boss=[...test.state.spawn,...test.state.enemies].find(enemy=>enemy.eventBoss&&enemy.round===${round});if(!boss)throw new Error('Boss ausente');
    boss.id=test.state.nextEnemyId++;test.state.spawn=[];test.state.enemies=[boss];let hits=0;
    while(!boss.dead&&hits++<10)test.damageEnemy(boss,1e9,{sourceType:'laser',detectsCamo:true,breaksArmor:true});
    test.update(0,performance.now()/1000);
    return{dead:boss.dead,hp:boss.maxHp,cans:profile.salmonCans,medals:profile.honors.medals,complete:test.state.completed};
  })()`);
  const first=await kill(20);if(first.cans!==9||!first.medals.includes('bossSlayer'))throw new Error('Primeiro prêmio incorreto: '+JSON.stringify(first));
  await until(()=>guest.eval('profile.salmonCans===9'),'Convidado não recebeu latas.');
  await host.eval('personalTd.startWave();true');await guest.eval('window.__testConnection.close();true');await wait(150);
  if(!await host.eval('CatoonsLan.recovering'))throw new Error('Queda não iniciou recuperação.');
  await until(()=>guest.eval('CatoonsLan.connected&&!CatoonsLan.recovering'),'Reconexão não concluiu.');
  await until(()=>host.eval('!CatoonsLan.recovering&&!__CatoonsTest.state.connectionPaused'),'Anfitrião não retomou a partida.');
  if(await guest.eval('profile.salmonCans')!==9)throw new Error('Reconexão duplicou recompensa.');
  const second=await kill(40),final=await kill(60);
  if(second.cans!==24||final.cans!==48||!final.complete||!final.medals.includes('insaneVictor'))throw new Error('Prêmio final incorreto: '+JSON.stringify({second,final}));
  await until(()=>guest.eval('profile.salmonCans===48&&profile.honors.insaneWins===1'),'Convidado não recebeu a conquista final.');
  await host.eval('CatoonsLan.send("snapshot",__CatoonsTest.lanSnapshot());CatoonsLan.send("snapshot",__CatoonsTest.lanSnapshot());true');await wait(250);
  const rewards=await Promise.all(clients.map(client=>client.eval('({cans:profile.salmonCans,kills:profile.honors.bossKills,insane:profile.honors.insaneWins,medals:profile.honors.medals})')));
  if(rewards.some(reward=>reward.cans!==48||reward.kills!==3||reward.insane!==1))throw new Error('Recompensa duplicada ou não compartilhada: '+JSON.stringify(rewards));
  await host.eval(`document.querySelector('#result-lobby').click();document.querySelector('[data-screen="cosmetics"]').click();document.querySelector('[data-cosmetic="bannerTide"]').click();document.querySelector('[data-cosmetic="avatarAdmiral"]').click();true`);
  const purchase=await host.eval('({cans:profile.salmonCans,banner:profile.identity.banner,avatar:profile.identity.avatar})');
  if(purchase.cans!==13||purchase.banner!=='bannerTide'||purchase.avatar!=='avatarAdmiral')throw new Error('Compra após vitória falhou: '+JSON.stringify(purchase));
  console.log(JSON.stringify({boss20:first,boss40:second,boss60:final,sharedRewards:rewards,reconnectNoDuplicate:true,purchase},null,2));
}finally{
  for(let i=0;i<clients.length;i++){const client=clients[i];try{if(original[i])await client.eval(`CatoonsLan.disconnect();profile=normalizeProfile(${original[i]});saveProfile();true`);await client.call('Page.close');}catch(_){}client.socket.close();}
}
