import assert from 'node:assert/strict';
import {mkdirSync, writeFileSync} from 'node:fs';

const [endpoint='http://127.0.0.1:9251',base='http://127.0.0.1:4221']=process.argv.slice(2);
const target=await (await fetch(endpoint+'/json/new?'+encodeURIComponent(base+'/?testHooks=1'),{method:'PUT'})).json();
const socket=new WebSocket(target.webSocketDebuggerUrl);
const pending=new Map(), errors=[];
let id=0;
socket.addEventListener('message',({data})=>{
  const message=JSON.parse(data);
  if(message.method==='Runtime.exceptionThrown')errors.push(message.params.exceptionDetails.exception?.description||message.params.exceptionDetails.text);
  const request=pending.get(message.id);
  if(request){
    pending.delete(message.id);
    if(message.error)request.reject(new Error(message.error.message));
    else request.resolve(message.result);
  }
});
await new Promise((resolve,reject)=>{
  socket.addEventListener('open',resolve,{once:true});
  socket.addEventListener('error',reject,{once:true});
});
const call=(method,params={})=>new Promise((resolve,reject)=>{
  const key=++id;
  pending.set(key,{resolve,reject});
  socket.send(JSON.stringify({id:key,method,params}));
});
const run=async expression=>{
  const response=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});
  if(response.exceptionDetails)throw new Error(response.exceptionDetails.exception?.description||response.exceptionDetails.text);
  return response.result.value;
};
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function waitFor(expression){
  for(let attempt=0;attempt<80;attempt++){
    if(await run(expression))return;
    await delay(60);
  }
  throw new Error('Timed out: '+expression);
}
async function screenshot(name){
  const result=await call('Page.captureScreenshot',{format:'png'});
  mkdirSync('release/preview',{recursive:true});
  writeFileSync('release/preview/'+name+'.png',Buffer.from(result.data,'base64'));
}

try{
  await call('Runtime.enable');
  await waitFor('Boolean(window.__CatoonsTest)');
  await run(`profile=cloneDefaultProfile();profile.level=50;profile.matchTutorialSeen=true;
    for(const id of Object.keys(profile.secretUnlocks))profile.secretUnlocks[id]=true;
    profile.exclusiveUnlocks.celestial=true;saveProfile();`);
  await call('Emulation.setDeviceMetricsOverride',{width:1366,height:768,deviceScaleFactor:1,mobile:false});
  await run(`setScreen('cats');`);
  await waitFor(`document.querySelectorAll('#cat-collection .cat-portrait.has-art').length===17`);
  await delay(250);
  await screenshot('colecao-gatinhos-v0323');
  await run(`setScreen('heroes');`);
  await waitFor(`document.querySelectorAll('#hero-collection .cat-portrait.has-art').length===4`);
  await screenshot('herois-v0323');

  assert.deepEqual(await run(`Promise.all([...MAP_ART].map(async id=>{
    const image=loadArt(mapArtUrl(id));
    await image.decode();
    return image.naturalWidth;
  }))`),Array(8).fill(1320));
  const loadedCats=await run(`Promise.all([...Object.keys(types),...Object.keys(HEROES),'elven-wizard'].map(async id=>{
    const image=loadArt(catArtUrl(id));
    await image.decode();
    return image.naturalWidth;
  }))`);
  assert.deepEqual(loadedCats,Array(22).fill(224));

  await run(`setScreen('play');`);
  for(const [category,count,illustrated] of [['beginner',6,false],['medium',4,true],['hardmaps',2,true],['impossible',2,true]]){
    await run(`document.querySelector('[data-map-category="${category}"]').click()`);
    assert.equal(await run('document.querySelectorAll("#map-selection-grid .map-preview").length'),count);
    if(illustrated){
      await waitFor(`document.querySelectorAll('#map-selection-grid .map-preview.has-art').length===${count}`);
      assert(await run(`[...document.querySelectorAll('#map-selection-grid .map-preview-image')].every(img=>
        img.naturalWidth===1320&&img.getBoundingClientRect().height>0&&getComputedStyle(img).visibility==='visible'
      )`));
    }else{
      assert(await run(`[...document.querySelectorAll('#map-selection-grid .map-preview')].every(preview=>
        getComputedStyle(preview).backgroundImage!=='none'
      )`));
    }
    if(category==='medium')await screenshot('previas-mapas-v0324');
  }
  await run(`document.querySelector('[data-map-choice="church"]').click();document.querySelector('#play-enter').click();`);
  await waitFor(`Boolean(document.querySelector('#loading-preview.has-art .map-preview-image[src$="/church.webp"]'))`);
  await waitFor(`document.body.dataset.screen==='game'&&__CatoonsTest.state.map==='church'`);
  await waitFor(`!document.querySelector('#loading-screen').classList.contains('visible')`);
  for(const map of ['harbor','canyon','ruins','factory','fork','storm','blind','church']){
    await run(`personalTd.loadSelection('${map}','normal');setScreen('game');`);
    await delay(250);
    await screenshot('mapa-'+map+'-v0323');
  }

  const metrics=()=>run(`(()=>{
    const c=document.querySelector('#personal-td-canvas').getBoundingClientRect();
    const b=document.querySelector('.canvas-wrap').getBoundingClientRect();
    const start=document.querySelector('#td-start').getBoundingClientRect();
    return {w:c.width,h:c.height,left:c.left,top:c.top,
      fits:c.left>=b.left-1&&c.top>=b.top-1&&c.right<=b.right+1&&c.bottom<=b.bottom+1&&c.bottom<=innerHeight+1,
      button:start.bottom<=innerHeight+1&&start.right<=innerWidth+1};
  })()`);
  for(const [width,height,dpr,zoom,mobile] of [
    [1633,390,1,1,false],[998,581,1.25,1.25,false],[998,440,1.5,1.4,false],
    [844,390,1,1,true],[740,430,1.5,1,false],[390,844,1,1,true]
  ]){
    await call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:dpr,mobile});
    await run(`applyUiScale(${zoom});`);
    for(const mode of ['campaign','training','infinite','boss-event']){
      await run(`personalTd.loadSelection('church','normal','${mode}');setScreen('game');`);
      await delay(250);
      const before=await metrics();
      assert(before.w>=200&&before.h>=112&&before.fits&&before.button,JSON.stringify({width,height,dpr,zoom,mode,before}));
      assert(Math.abs(before.w/before.h-1100/620)<.01,'The map aspect ratio changed');
      await delay(160);
      assert.deepEqual(await metrics(),before,'Canvas size drifted across frames');
    }
  }

  await call('Emulation.setDeviceMetricsOverride',{width:998,height:440,deviceScaleFactor:1.5,mobile:false});
  await run(`applyUiScale(1.4);personalTd.loadSelection('church','normal');setScreen('game');`);
  await delay(270);
  await run(`document.querySelector('[data-td-tower="dart"]').click()`);
  const board=await metrics();
  async function clickAt(x,y){
    await call('Input.dispatchMouseEvent',{type:'mousePressed',x,y,button:'left',clickCount:1});
    await call('Input.dispatchMouseEvent',{type:'mouseReleased',x,y,button:'left',clickCount:1});
  }
  await clickAt(board.left+board.w/2,board.top+board.h/2);
  assert.equal(await run('personalTd.towerCount("dart")'),0,'Tower placed on the road');
  await clickAt(board.left+board.w*140/1100,board.top+board.h*175/620);
  assert.equal(await run('personalTd.towerCount("dart")'),1,'The board click did not reach the bench');
  assert(await run('__CatoonsTest.state.towers[0].elevated'),'The bench did not elevate the cat');
  const start=await run(`(()=>{const r=document.querySelector('#td-start').getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2]})()`);
  await clickAt(...start);
  assert.equal(await run('__CatoonsTest.state.wave'),1,'The wave button did not respond');
  await screenshot('mapa-igreja-zoom-v0323');

  await call('Emulation.setDeviceMetricsOverride',{width:1366,height:768,deviceScaleFactor:1,mobile:false});
  await run(`(()=>{
    applyUiScale(1);personalTd.loadSelection('church','normal');setScreen('game');
    const s=__CatoonsTest.state;s.money=20000;
    profile.equippedSkins.wizard='elvenMage';
    const points=[];
    for(const y of [175,445,85,525])for(let x=95;x<=1015;x+=65)points.push([x,y]);
    for(const id of Object.keys(types)){
      s.selected=id;
      if(!points.some(([x,y])=>__CatoonsTest.placeTower(x,y)))throw Error('Failed to place '+id+': '+s.msg);
    }
    if(s.towers.length!==17)throw Error('Incomplete sprite showcase');
  })()`);
  await delay(250);
  await screenshot('gatinhos-em-campo-v0323');

  await run(`setScreen('play');document.querySelector('[data-map-category="medium"]').click();`);
  await waitFor(`Boolean(document.querySelector('[data-map-choice="harbor"] .map-preview.has-art'))`);
  const fallback=await run(`new Promise(resolve=>{
    const preview=document.querySelector('[data-map-choice="harbor"] .map-preview');
    const img=preview.querySelector('img');
    preview.classList.remove('has-art');
    img.addEventListener('error',()=>resolve(getComputedStyle(img).visibility==='hidden'
      &&getComputedStyle(preview).backgroundImage!=='none'&&getComputedStyle(preview,'::before').display!=='none'),{once:true});
    img.src='data:image/webp,broken';
  })`);
  assert(fallback,'The map card lost its fallback when the image failed');

  assert.deepEqual(errors,[]);
  console.log('OK: 8 illustrated maps, 22 unit assets, 6 stable viewport/scale combinations in 4 modes, precise bench placement and wave controls.');
}finally{
  try{await call('Page.close');}catch{}
  socket.close();
}
