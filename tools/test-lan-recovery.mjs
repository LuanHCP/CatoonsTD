import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {EventEmitter} from 'node:events';

let now=1000,nextTimer=0;
const timers=new Map(),brokers=[];
const later=(fn,delay)=>{const id=++nextTimer;timers.set(id,{fn,at:now+delay});return id;};
const advance=ms=>{const end=now+ms;for(;;){const due=[...timers].filter(([,t])=>t.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];if(!due)break;now=due[1].at;timers.delete(due[0]);due[1].fn();}now=end;};
class Channel extends EventEmitter{
  constructor(metadata={}){super();this.metadata=metadata;this.open=false;this.sent=[];this.bufferSize=0;this.dataChannel={bufferedAmount:0};}
  send(message){this.sent.push(message);}
  close(){this.open=false;this.emit('close');}
  ready(){this.open=true;this.emit('open');}
}
class Broker extends EventEmitter{
  constructor(){super();this.connections=[];brokers.push(this);}
  connect(id,options){const channel=new Channel(options.metadata);channel.options=options;this.connections.push(channel);return channel;}
  destroy(){this.destroyed=true;}
}
const window={Peer:Broker,RTCPeerConnection:class{},addEventListener(){}};
vm.runInNewContext(readFileSync(new URL('../src/multiplayer.js',import.meta.url),'utf8'),{window,crypto,Uint32Array,Date:{now:()=>now},setTimeout:later,clearTimeout:id=>timers.delete(id),console});
const lan=window.CatoonsLan,creating=lan.createRoom();brokers[0].emit('open');await creating;
const host=brokers[0],first=new Channel({protocol:4});host.emit('connection',first);first.ready();
assert.equal(lan.playerCount,2);const welcome=first.sent.find(m=>m.type==='welcome');
first.bufferSize=3;assert.equal(lan.send('snapshot',{}),false);assert.equal(lan.send('resume',{}),true);first.bufferSize=0;
lan.setAccepting(false);first.close();assert.equal(lan.recovering,true);assert.equal(lan.playerCount,2);
advance(10000);
const failedResume=new Channel({protocol:4,resumeToken:welcome.payload.resumeToken});host.emit('connection',failedResume);failedResume.close();
assert.equal(lan.recovering,true);
advance(49999);assert.equal(lan.playerCount,2);advance(1);assert.equal(lan.playerCount,1);assert.equal(lan.recovering,false);
lan.disconnect();advance(200);
const joining=lan.joinRoom('12345678'),guestBroker=brokers.at(-1);guestBroker.emit('open');await Promise.resolve();
const guest=guestBroker.connections.at(-1);assert.equal(guest.options.serialization,'binary');guest.ready();
guest.emit('data',{type:'welcome',payload:{playerId:'p2',resumeToken:'secret',players:['host','p2'],accepting:false}});await joining;
assert.equal(lan.connected,true);guest.close();assert.equal(lan.recovering,true);advance(600);
const retry=guestBroker.connections.at(-1);assert.equal(retry.metadata.resumeToken,'secret');retry.ready();retry.emit('data',{type:'welcome',payload:{playerId:'p2',resumeToken:'secret',players:['host','p2'],accepting:false}});
assert.equal(lan.connected,true);assert.equal(lan.recovering,false);assert.equal(lan.localPlayerId,'p2');
lan.disconnect();advance(200);assert.equal(lan.role,'solo');assert.equal(lan.recovering,false);
console.log('OK: reserved-slot expiry after failed resume, 60-second deadline, token reuse, binary transport, backpressure and explicit close.');
