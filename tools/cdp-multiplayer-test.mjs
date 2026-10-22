const endpoint = process.argv[2] || 'http://127.0.0.1:9223';
const gameUrl = process.argv[3] || 'http://127.0.0.1:4192';

class CdpClient {
  constructor(url) {
    this.socket = new WebSocket(url);
    this.id = 0;
    this.pending = new Map();
    this.socket.addEventListener('message', event => {
      const message = JSON.parse(event.data);
      const callback = this.pending.get(message.id);
      if (!callback) return;
      this.pending.delete(message.id);
      if (message.error) callback.reject(new Error(message.error.message));
      else callback.resolve(message.result);
    });
  }
  async open() {
    if (this.socket.readyState === WebSocket.OPEN) return;
    await new Promise((resolve, reject) => {
      this.socket.addEventListener('open', resolve, {once: true});
      this.socket.addEventListener('error', reject, {once: true});
    });
  }
  call(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++this.id;
      this.pending.set(id, {resolve, reject});
      this.socket.send(JSON.stringify({id, method, params}));
    });
  }
  async evaluate(expression) {
    const response = await this.call('Runtime.evaluate', {expression, awaitPromise: true, returnByValue: true});
    if (response.exceptionDetails) throw new Error(JSON.stringify(response.exceptionDetails));
    return response.result.value;
  }
  close() { this.socket.close(); }
}

const hostTarget = await (await fetch(`${endpoint}/json/new?${encodeURIComponent(gameUrl)}`, {method: 'PUT'})).json();
const guestTarget = await (await fetch(`${endpoint}/json/new?${encodeURIComponent(gameUrl)}`, {method: 'PUT'})).json();
const host = new CdpClient(hostTarget.webSocketDebuggerUrl);
const guest = new CdpClient(guestTarget.webSocketDebuggerUrl);
await Promise.all([host.open(), guest.open()]);
await Promise.all([host.call('Runtime.enable'), guest.call('Runtime.enable')]);
await new Promise(resolve => setTimeout(resolve, 800));

await host.evaluate(`window.__lanTest=[];CatoonsLan.onMessage(message=>window.__lanTest.push(message));true`);
const roomId = await host.evaluate(`CatoonsLan.createRoom()`);
await guest.evaluate(`CatoonsLan.joinRoom(${JSON.stringify(roomId)})`);

let connected = false;
for (let attempt = 0; attempt < 20; attempt++) {
  const roles = await Promise.all([
    host.evaluate(`({role:CatoonsLan.role,connected:CatoonsLan.connected,status:CatoonsLan.status})`),
    guest.evaluate(`({role:CatoonsLan.role,connected:CatoonsLan.connected,status:CatoonsLan.status})`)
  ]);
  if (roles.every(item => item.connected)) { connected = true; break; }
  await new Promise(resolve => setTimeout(resolve, 150));
}
if (!connected) throw new Error('Os dois peers não chegaram ao estado conectado.');

await guest.evaluate(`CatoonsLan.send('smoke-test',{value:42})`);
await new Promise(resolve => setTimeout(resolve, 150));
const received = await host.evaluate(`window.__lanTest.some(message=>message.type==='smoke-test'&&message.payload.value===42)`);
await host.call('Page.bringToFront');
await host.evaluate(`document.querySelector('#play-enter').click();true`);
let hostStarted = false;
for (let attempt = 0; attempt < 40; attempt++) {
  if (await host.evaluate(`document.body.dataset.screen==='game'`)) { hostStarted = true; break; }
  await new Promise(resolve => setTimeout(resolve, 120));
}
await guest.call('Page.bringToFront');
let guestStarted = false;
for (let attempt = 0; attempt < 40; attempt++) {
  if (await guest.evaluate(`document.body.dataset.screen==='game'`)) { guestStarted = true; break; }
  await new Promise(resolve => setTimeout(resolve, 120));
}
const matchStarted = hostStarted && guestStarted;
if (!matchStarted) throw new Error('A partida não abriu nos dois peers.');

let sharedPlacement = false;
for (const [x,y] of [[100,100],[1000,100],[100,540],[1000,540],[550,100],[550,540]]) {
  await guest.evaluate(`(() => {
    document.querySelector('[data-td-tower="dart"]').click();
    const canvas=document.querySelector('#personal-td-canvas'),rect=canvas.getBoundingClientRect();
    canvas.dispatchEvent(new MouseEvent('click',{bubbles:true,clientX:rect.left+${x}/1100*rect.width,clientY:rect.top+${y}/620*rect.height}));
    return true;
  })()`);
  await new Promise(resolve => setTimeout(resolve, 220));
  if (await host.evaluate(`personalTd.towerCount('dart')===1`)) { sharedPlacement = true; break; }
}
if (!sharedPlacement) throw new Error('O posicionamento cooperativo não chegou ao anfitrião.');
await new Promise(resolve => setTimeout(resolve, 180));
const guestSeesTower = await guest.evaluate(`personalTd.towerCount('dart')===1`);
const result = {
  connected,
  transmitted: received,
  matchStarted,
  sharedPlacement,
  guestSeesTower,
  host: await host.evaluate(`({role:CatoonsLan.role,status:CatoonsLan.status})`),
  guest: await guest.evaluate(`({role:CatoonsLan.role,status:CatoonsLan.status})`)
};
console.log(JSON.stringify(result, null, 2));
await Promise.all([host.call('Page.close'),guest.call('Page.close')]);
host.close();guest.close();
