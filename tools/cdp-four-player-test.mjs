const endpoint=process.argv[2]||'http://127.0.0.1:9223';
const gameUrl=process.argv[3]||'file:///C:/Users/67-103761/Downloads/Catoons/CatoonsTD-git/index.html';
const testMode=process.argv[4]||'campaign';
const testPlayers=Math.max(2,Math.min(4,Number(process.argv[5])||4));
class CdpClient{
  constructor(url){this.socket=new WebSocket(url);this.id=0;this.pending=new Map();this.socket.addEventListener('message',event=>{const message=JSON.parse(event.data),callback=this.pending.get(message.id);if(!callback)return;this.pending.delete(message.id);message.error?callback.reject(new Error(message.error.message)):callback.resolve(message.result);});}
  async open(){if(this.socket.readyState!==WebSocket.OPEN)await new Promise((resolve,reject)=>{this.socket.addEventListener('open',resolve,{once:true});this.socket.addEventListener('error',reject,{once:true});});}
  call(method,params={}){return new Promise((resolve,reject)=>{const id=++this.id;this.pending.set(id,{resolve,reject});this.socket.send(JSON.stringify({id,method,params}));});}
  async evaluate(expression){const response=await this.call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(response.exceptionDetails)throw new Error(JSON.stringify(response.exceptionDetails));return response.result.value;}
  close(){this.socket.close();}
}
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const targets=[];
for(let i=0;i<testPlayers;i++)targets.push(await (await fetch(`${endpoint}/json/new?${encodeURIComponent(gameUrl)}`,{method:'PUT'})).json());
const peers=targets.map(target=>new CdpClient(target.webSocketDebuggerUrl));
await Promise.all(peers.map(peer=>peer.open()));await Promise.all(peers.map(peer=>peer.call('Runtime.enable')));await delay(700);
const [host,...guests]=peers;
const roomId=await host.evaluate('CatoonsLan.createRoom()');
if(!/^\d{8}$/.test(roomId))throw new Error('ID numérico inválido: '+roomId);
for(let index=0;index<guests.length;index++){
  await guests[index].evaluate(`CatoonsLan.joinRoom(${JSON.stringify(roomId)})`);
  for(let attempt=0;attempt<30;attempt++){if(await host.evaluate(`CatoonsLan.playerCount===${index+2}`))break;await delay(120);}
}
const room=await host.evaluate(`({connected:CatoonsLan.connected,count:CatoonsLan.playerCount,max:CatoonsLan.maxPlayers,players:CatoonsLan.players,canInvite:CatoonsLan.canInvite})`);
if(!room.connected||room.count!==testPlayers||room.max!==4||(testPlayers===4&&room.canInvite))throw new Error(`Sala incompleta: ${JSON.stringify(room)}`);
if(testPlayers===4){
  const extraTarget=await(await fetch(`${endpoint}/json/new?${encodeURIComponent(gameUrl)}`,{method:'PUT'})).json();
  const extra=new CdpClient(extraTarget.webSocketDebuggerUrl);await extra.open();await delay(600);
  const rejection=await extra.evaluate(`CatoonsLan.joinRoom(${JSON.stringify(roomId)}).then(()=>'',e=>e.message)`);
  await extra.call('Page.close');extra.close();
  if(!rejection.includes('Sala cheia'))throw new Error('Quinto jogador não foi recusado: '+rejection);
}
const teamScaleText=testMode==='boss-event'?await host.evaluate(`document.querySelector('#event-team-scale')?.textContent||''`):'';
const expectedScale={2:'×1,00',3:'×1,34',4:'×1,68'}[testPlayers],expectedStartMoney=testMode==='boss-event'?({2:500,3:425,4:350}[testPlayers]):350;
if(testMode==='boss-event'&&(!teamScaleText.includes(expectedScale)||!teamScaleText.includes(`🐟 ${expectedStartMoney}`)))throw new Error(`Escala/bônus inicial para ${testPlayers} jogadores não foi aplicado no lobby: ${teamScaleText}`);
await host.call('Page.bringToFront');
if(testMode==='boss-event')await host.evaluate(`personalTd.startEvent();true`);
else await host.evaluate(`document.querySelector('[data-screen="play"]').click();document.querySelector('[data-game-mode="${testMode}"]').click();document.querySelector('#play-enter').click();true`);
await delay(1700);
for(const guest of guests){await guest.call('Page.bringToFront');await delay(1700);}
for(let attempt=0;attempt<50;attempt++){if((await Promise.all(peers.map(peer=>peer.evaluate(`document.body.dataset.screen==='game'`)))).every(Boolean))break;await delay(120);}
const screens=await Promise.all(peers.map(peer=>peer.evaluate(`({screen:document.body.dataset.screen,role:CatoonsLan.role,status:CatoonsLan.status,count:CatoonsLan.playerCount,message:document.querySelector('#td-message')?.textContent||''})`)));
if(!screens.every(item=>item.screen==='game'))throw new Error(`A fase não abriu nos quatro jogadores: ${JSON.stringify(screens)}`);
const coordinates=[[100,100],[1000,100],[100,540],[1000,540],[550,100],[550,540],[300,100],[800,500],[320,520]];
for(let index=0;index<guests.length;index++){
  let placed=false;
  for(const [x,y] of coordinates){
    await guests[index].evaluate(`(()=>{document.querySelector('[data-td-tower="dart"]').click();const canvas=document.querySelector('#personal-td-canvas'),rect=canvas.getBoundingClientRect();canvas.dispatchEvent(new MouseEvent('click',{bubbles:true,clientX:rect.left+${x}/1100*rect.width,clientY:rect.top+${y}/620*rect.height}));return true;})()`);
    await delay(180);
    if(await host.evaluate(`personalTd.towerCount('dart')===${index+1}`)){placed=true;break;}
  }
  if(!placed)throw new Error(`O jogador ${index+2} não conseguiu posicionar seu gatinho.`);
}
await delay(250);
const wallets=await Promise.all(peers.map(peer=>peer.evaluate(`Number(document.querySelector('#td-money').textContent)`)));
const dartPrice=await host.evaluate(`personalTd.towerPrice('dart')`);
if(wallets[0]!==expectedStartMoney||wallets.slice(1).some(value=>value!==expectedStartMoney-dartPrice))throw new Error(`Carteiras não ficaram independentes/equilibradas: ${wallets.join(', ')} (início ${expectedStartMoney}, preço ${dartPrice})`);
const waveTargets=await host.evaluate(`personalTd.startWave();Number(document.querySelector('#td-count').textContent)`);
const expectedTargets=testMode==='boss-event'?27:30;
if(waveTargets!==expectedTargets)throw new Error(`A primeira onda cooperativa deveria ter ${expectedTargets} balões, mas teve ${waveTargets}.`);
let bossAnnouncement='',bossState=null;
if(testMode==='boss-event')bossAnnouncement=await host.evaluate(`(()=>{for(let i=1;i<20;i++)personalTd.startWave();return document.querySelector('#td-message').textContent;})()`);
if(testMode==='boss-event'&&!bossAnnouncement.includes('Almirante Espinha'))throw new Error(`O boss da rodada 20 não apareceu: ${bossAnnouncement}`);
if(testMode==='boss-event')bossState=await host.evaluate(`personalTd.eventBossState()`);
if(testMode==='boss-event'&&(!bossState||bossState.round!==20||bossState.phase!==1||!bossState.shieldHp||!String(bossState.requirement).includes('Antiblindagem')))throw new Error(`Estado inicial do boss inválido: ${JSON.stringify(bossState)}`);
const result={room,roomId,mode:testMode,teamScaleText,matchStarted:true,totalPlaced:await host.evaluate(`personalTd.towerCount('dart')`),wallets,waveTargets,bossAnnouncement,bossState};
await host.evaluate(`document.querySelector('#menu-lobby').click();true`);
await delay(500);
const returned=await Promise.all(peers.map(peer=>peer.evaluate(`document.body.dataset.screen`)));
if(!returned.every(screen=>screen===(testMode==='boss-event'?'event':'play')))throw new Error('Retorno ao lobby não sincronizou: '+returned);
await guests[0].evaluate('CatoonsLan.disconnect();true');await delay(500);
if(await host.evaluate('CatoonsLan.playerCount')!==testPlayers-1)throw new Error('A vaga não foi liberada.');
await guests[0].evaluate(`CatoonsLan.joinRoom(${JSON.stringify(roomId)})`);
await delay(500);
if(await host.evaluate('CatoonsLan.playerCount')!==testPlayers)throw new Error('Não foi possível voltar com o mesmo ID.');
await host.evaluate('CatoonsLan.disconnect();true');await delay(500);
if(!(await Promise.all(peers.map(peer=>peer.evaluate('CatoonsLan.role')))).every(role=>role==='solo'))throw new Error('Fechar sala não desconectou toda a equipe.');
result.lifecycle='retorno sincronizado, saída, reentrada e fechamento OK';
console.log(JSON.stringify(result,null,2));
await Promise.all(peers.map(peer=>peer.call('Page.close')));peers.forEach(peer=>peer.close());
