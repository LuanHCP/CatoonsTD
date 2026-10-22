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
  for(const screen of ['hub','play','event']){
    await evaluate(`document.querySelector('[data-screen="${screen}"]').click();true`);await wait(200);
    const metrics=await evaluate(`(()=>{const el=document.querySelector('.screen.active');return{screen:document.body.dataset.screen,overflow:el.scrollWidth>el.clientWidth+2,viewportOverflow:document.documentElement.scrollWidth>innerWidth+2,oldCodes:document.querySelectorAll('textarea[id*="offer"],textarea[id*="answer"]').length};})()`);
    if(metrics.overflow||metrics.viewportOverflow||metrics.oldCodes)throw new Error('Layout inválido: '+JSON.stringify({width,height,...metrics}));
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
if(!/^\d{8}$/.test(created.id)||!created.visible||!created.startDisabled||created.status!=='waiting')throw new Error('Criar sala pela interface falhou: '+JSON.stringify(created));
await evaluate(`document.querySelector('#screen-event [data-room-close]').click();true`);await wait(150);
if(!await evaluate(`CatoonsLan.role==='solo'&&document.querySelector('#screen-event [data-room-active]').hidden&&!document.querySelector('#screen-event [data-room-actions]').hidden`))throw new Error('Fechar sala pela interface falhou.');
if(errors.length)throw new Error('Erros no navegador: '+errors);
console.log(JSON.stringify({layouts:result,modeShortcut:true,invalidId:true,createAndCloseButtons:true,browserErrors:errors},null,2));
await call('Page.close');socket.close();
