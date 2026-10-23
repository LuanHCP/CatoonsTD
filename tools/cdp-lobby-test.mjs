import {mkdirSync,writeFileSync} from 'node:fs';
const endpoint=process.argv[2]||'http://127.0.0.1:9223',base=process.argv[3]||'http://127.0.0.1:4192';
const target=await(await fetch(endpoint+'/json/new?'+encodeURIComponent(base),{method:'PUT'})).json();
const socket=new WebSocket(target.webSocketDebuggerUrl),pending=new Map(),errors=[];let id=0;
socket.addEventListener('message',event=>{const m=JSON.parse(event.data);if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.text);const cb=pending.get(m.id);if(cb){pending.delete(m.id);m.error?cb.reject(new Error(m.error.message)):cb.resolve(m.result);}});
await new Promise(resolve=>socket.addEventListener('open',resolve,{once:true}));
const call=(method,params={})=>new Promise((resolve,reject)=>{const key=++id;pending.set(key,{resolve,reject});socket.send(JSON.stringify({id:key,method,params}));});
const evaluate=async expression=>{const r=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw new Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
await call('Runtime.enable');await wait(600);
mkdirSync('release/preview',{recursive:true});
const sizes=[[1366,768],[844,390],[390,844]];
const result=[];
for(const [width,height] of sizes){
  await call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<900});await wait(150);
  for(const screen of ['hub','play','event','profile','cosmetics']){
    await evaluate(`document.querySelector('[data-screen="${screen}"]').click();true`);await wait(200);
    const metrics=await evaluate(`(()=>{const el=document.querySelector('.screen.active'),shell=document.querySelector('.game-shell'),header=document.querySelector('.hero'),profile=document.querySelector('#profile-open').getBoundingClientRect();return{screen:document.body.dataset.screen,overflow:el.scrollWidth>el.clientWidth+2,viewportOverflow:document.documentElement.scrollWidth>innerWidth+2,clippedShell:shell.scrollWidth>shell.clientWidth+2,clippedProfile:getComputedStyle(header).display!=='none'&&(profile.right>innerWidth+2||profile.left<0),oldCodes:document.querySelectorAll('textarea[id*="offer"],textarea[id*="answer"]').length};})()`);
    if(metrics.overflow||metrics.viewportOverflow||metrics.clippedShell||metrics.clippedProfile||metrics.oldCodes)throw new Error('Layout inválido: '+JSON.stringify({width,height,...metrics}));
    const shot=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
    writeFileSync(`release/preview/${screen}-${width}.png`,Buffer.from(shot.data,'base64'));result.push({width,height,...metrics});
  }
}
await evaluate(`document.querySelector('[data-screen="hub"]').click();document.querySelector('[data-select-mode="infinite"]').click();true`);
if(!await evaluate(`document.querySelector('[data-game-mode="infinite"]').classList.contains('selected')`))throw new Error('Atalho Infinito não selecionou o modo.');
await evaluate(`document.querySelector('[data-screen="event"]').click();document.querySelector('#event-room-id').value='123';document.querySelector('#screen-event [data-room-connect]').click();true`);await wait(50);
if(!await evaluate(`document.querySelector('#screen-event [data-room-help]').textContent.includes('8 números')`))throw new Error('Validação do ID ausente.');
await evaluate(`document.querySelector('#screen-event [data-room-create]').click();true`);
for(let attempt=0;attempt<120;attempt++){if(await evaluate(`CatoonsLan.status==='waiting'||CatoonsLan.status==='error'`))break;await wait(200);}
const created=await evaluate(`({id:CatoonsLan.roomId,visible:!document.querySelector('#screen-event [data-room-active]').hidden,startDisabled:document.querySelector('#event-start').disabled,status:CatoonsLan.status})`);
if(!/^\d{8}$/.test(created.id)||!created.visible||created.startDisabled||created.status!=='waiting')throw new Error('Criar sala pela interface falhou: '+JSON.stringify(created));
await evaluate(`document.querySelector('#screen-event [data-room-close]').click();true`);await wait(150);
if(!await evaluate(`CatoonsLan.role==='solo'&&document.querySelector('#screen-event [data-room-active]').hidden&&!document.querySelector('#screen-event [data-room-actions]').hidden`))throw new Error('Fechar sala pela interface falhou.');
await call('Network.enable');
await call('Network.emulateNetworkConditions',{offline:true,latency:0,downloadThroughput:-1,uploadThroughput:-1});
if(!await evaluate(`!document.querySelector('#event-start').disabled&&document.querySelector('#event-start').textContent.includes('solo')`))throw new Error('Evento solo não está disponível sem sala.');
await evaluate(`document.querySelector('#event-start').click();true`);
for(let attempt=0;attempt<30;attempt++){if(await evaluate(`document.body.dataset.screen==='game'`))break;await wait(100);}
const solo=await evaluate(`({screen:document.body.dataset.screen,money:Number(document.querySelector('#td-money').textContent),role:CatoonsLan.role,rounds:document.querySelector('#td-wave-max').textContent,modeLabel:document.querySelector('#game-difficulty-text').textContent})`);
if(solo.screen!=='game'||solo.money!==650||solo.role!=='solo'||solo.rounds!=='60'||!solo.modeLabel.includes('Solo'))throw new Error('Evento solo offline falhou: '+JSON.stringify(solo));
const soloWave=await evaluate(`personalTd.startWave();Number(document.querySelector('#td-count').textContent)`);
if(soloWave!==13)throw new Error('O solo não deveria receber balões dobrados: '+soloWave);
await evaluate(`for(let i=1;i<18;i++)personalTd.startWave();true`);
if(!await evaluate(`!document.querySelector('#boss-preparation').hidden&&document.querySelector('#boss-preparation').textContent.includes('Falta na defesa')`))throw new Error('Aviso de preparação não apareceu na rodada 18.');
const soloBoss=await evaluate(`personalTd.startWave();personalTd.startWave();personalTd.eventBossState()`);
if(soloBoss?.round!==20||soloBoss.maxHp<=0||soloBoss.maxHp>=1334.8||soloBoss.shieldHp<=0)throw new Error('Escala do boss solo incorreta: '+JSON.stringify(soloBoss));
await evaluate(`document.querySelector('#menu-lobby').click();true`);
if(!await evaluate(`document.body.dataset.screen==='event'&&!document.querySelector('#event-start').disabled`))throw new Error('Retorno do solo não liberou nova partida.');
await evaluate(`document.querySelector('[data-event-variant="insane"]').click();document.querySelector('#event-start').click();true`);
for(let attempt=0;attempt<30;attempt++){if(await evaluate(`document.body.dataset.screen==='game'`))break;await wait(100);}
const insaneBoss=await evaluate(`(()=>{for(let i=0;i<20;i++)personalTd.startWave();return personalTd.eventBossState();})()`);
if(insaneBoss.maxHp!==soloBoss.maxHp*5||insaneBoss.shieldMax!==soloBoss.shieldMax*5)throw new Error('Insano não aplicou 5× no jogo real.');
await evaluate(`document.querySelector('#menu-lobby').click();document.querySelector('[data-event-variant="normal"]').click();true`);
await call('Network.emulateNetworkConditions',{offline:false,latency:0,downloadThroughput:-1,uploadThroughput:-1});
const originalProfile=await evaluate('JSON.stringify(profile)');
await evaluate(`CatoonsIdentity.grant(profile,{id:'ui-cosmetic-test-'+Date.now(),cans:80,bossKill:true});saveProfile();document.querySelector('[data-screen="profile"]').click();document.querySelector('#profile-name-input').value='Luan Teste';document.querySelector('#profile-save-name').click();true`);
if(!await evaluate(`document.querySelector('#profile-card').textContent.includes('Luan Teste')&&document.querySelectorAll('.honor-medal.earned').length>=1`))throw new Error('Nome e broche não apareceram no perfil.');
await evaluate(`document.querySelector('[data-screen="cosmetics"]').click();document.querySelector('[data-cosmetic="bannerTide"]').click();document.querySelector('[data-cosmetic="avatarAdmiral"]').click();true`);
const cosmetics=await evaluate(`({banner:profile.identity.banner,avatar:profile.identity.avatar,cans:profile.salmonCans,stored:JSON.parse(localStorage.getItem('catoonsTD_v066')).identity.banner})`);
if(cosmetics.banner!=='bannerTide'||cosmetics.avatar!=='avatarAdmiral'||cosmetics.stored!=='bannerTide')throw new Error('Compra/equipamento/salvamento falhou: '+JSON.stringify(cosmetics));
await evaluate(`profile=normalizeProfile(${originalProfile});saveProfile();true`);
if(errors.length)throw new Error('Erros no navegador: '+errors);
console.log(JSON.stringify({layouts:result,modeShortcut:true,invalidId:true,createAndCloseButtons:true,soloOffline:solo,soloWave,soloBoss,insaneBoss,cosmetics,browserErrors:errors},null,2));
await call('Page.close');socket.close();
