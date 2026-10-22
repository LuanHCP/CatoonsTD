const endpoint = process.argv[2] || 'http://127.0.0.1:9223/json';
const pages = await (await fetch(endpoint)).json();
const page = pages.find(item => item.type === 'page' && /^http:\/\/127\.0\.0\.1:419[12]/.test(item.url));
if (!page) throw new Error('Página local do jogo não encontrada no Edge.');

const socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, {once: true});
  socket.addEventListener('error', reject, {once: true});
});
let id = 0;
const pending = new Map();
socket.addEventListener('message', event => {
  const message = JSON.parse(event.data);
  const callback = pending.get(message.id);
  if (!callback) return;
  pending.delete(message.id);
  if (message.error) callback.reject(new Error(message.error.message));
  else callback.resolve(message.result);
});
const call = (method, params = {}) => new Promise((resolve, reject) => {
  const callId = ++id;
  pending.set(callId, {resolve, reject});
  socket.send(JSON.stringify({id: callId, method, params}));
});
const evaluate = async expression => {
  const result = await call('Runtime.evaluate', {expression, awaitPromise: true, returnByValue: true});
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
};

await call('Runtime.enable');
await call('Page.enable');
await call('Page.navigate', {url: 'http://127.0.0.1:4192'});
await new Promise(resolve => setTimeout(resolve, 700));
await evaluate(`new Promise(resolve => document.readyState === 'complete' ? resolve() : addEventListener('load', resolve, {once:true}))`);
await evaluate(`document.querySelector('[data-screen="play"]')?.click()`);
const result = await evaluate(`(() => {
  const section = document.querySelector('.multiplayer-strip');
  const rect = section?.getBoundingClientRect();
  return {
    title: document.title,
    screen: document.body.dataset.screen,
    lanApi: Boolean(window.CatoonsLan),
    lanRole: window.CatoonsLan?.role,
    visible: Boolean(rect && rect.width > 0 && rect.height > 0),
    controls: ['create','connect','status','copy','close'].every(action => Boolean(section?.querySelector('[data-room-'+action+']'))),
    copy: section?.innerText.includes('Sua sala'),
    scriptCount: [...document.scripts].map(script => script.src).filter(Boolean).length
  };
})()`);
console.log(JSON.stringify(result, null, 2));
socket.close();
