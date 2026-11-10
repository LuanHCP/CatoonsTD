import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const window={};
vm.runInNewContext(readFileSync('src/cloud-save.js','utf8'),{window,setTimeout:()=>1});
const {create,cached}=window.CatoonsCloud;
const copy=value=>JSON.parse(JSON.stringify(value));
const fresh=()=>({level:1,coins:250,maps:{},settings:{volume:.65},checkpoints:{}});
const remote=new Map();
let writes=0;

function device(visitor=fresh(),saved=new Map(),session=null){
  const storage={
    getItem:key=>saved.get(key)??null,
    setItem:(key,value)=>saved.set(key,value),
    removeItem:key=>saved.delete(key)
  };
  const initial=cached(storage);
  let profile=copy(initial?.profile??visitor),view,observe,offline=false,playing=false,beforeWrite=null,beforeRead=null;
  const controller=create({
    storage,initial,normalize:value=>copy({...fresh(),...value,settings:value.settings??fresh().settings,checkpoints:value.checkpoints??{}}),
    fresh,guest:()=>copy(visitor),current:()=>profile,
    apply:value=>{profile=copy(value);},canSwitch:()=>!playing,view:next=>{view=next;},
    load:async()=>({
      observe:callback=>{observe=callback;callback(session?{uid:session}:null);},
      signIn:async()=>observe({uid:'player'}),
      signOut:async()=>observe(null),
      read:async uid=>{
        if(offline)throw Error('offline');
        if(beforeRead){beforeRead();beforeRead=null;}
        return remote.get(uid)??null;
      },
      write:async (uid,expected,data)=>{
        if(offline)throw Error('offline');
        if(beforeWrite){beforeWrite();beforeWrite=null;}
        if((remote.get(uid)?.version??null)!==expected)return null;
        const record={data,version:'revision-'+(++writes)};
        remote.set(uid,record);return record;
      }
    })
  });
  return {
    saved,storage,controller,get profile(){return profile;},get view(){return view;},
    offline:value=>{offline=value;},playing:value=>{playing=value;},
    race:fn=>{beforeWrite=fn;},onRead:fn=>{beforeRead=fn;}
  };
}
const tick=()=>new Promise(resolve=>setImmediate(resolve));
async function ready(d){d.controller.ensure();await tick();}
async function signIn(d){await ready(d);await d.controller.signIn();await tick();}

const old={...fresh(),level:12,coins:724,checkpoints:{campaign:{wave:9}},settings:{volume:.4}};
const pc=device(old);
await signIn(pc);
assert.equal(pc.view.status,'link');
assert.equal(writes,0,'local progress requires linking consent');
await pc.controller.sync('local');
assert.equal(pc.view.status,'synced');
assert.equal(pc.profile.checkpoints.campaign.wave,9);
assert.equal(cached(pc.storage).profile.level,12);
const cloudProfile=JSON.parse(remote.get('player').data);
assert.equal(cloudProfile.level,12);
assert.equal('settings' in cloudProfile,false);
assert.equal('checkpoints' in cloudProfile,false);

const phone=device();
await signIn(phone);
assert.equal(phone.view.status,'synced');
assert.equal(phone.profile.level,12);
assert.equal(phone.profile.settings.volume,.65);
assert.equal(Object.keys(phone.profile.checkpoints).length,0);

phone.offline(true);
phone.profile.coins=820;
phone.controller.persist(phone.profile);
await phone.controller.sync();
assert.equal(phone.view.status,'pending');
assert.equal(cached(phone.storage).profile.coins,820);
const reopened=device(fresh(),phone.saved,'player');
reopened.offline(true);
await ready(reopened);
assert.equal(reopened.profile.coins,820);
assert.equal(reopened.view.status,'pending');

pc.profile.coins=920;pc.controller.persist(pc.profile);
await pc.controller.sync();
reopened.offline(false);
await reopened.controller.sync();
assert.equal(reopened.view.status,'conflict');
assert.equal(reopened.view.choice.other.coins,920);
assert.equal(reopened.profile.coins,820);
await reopened.controller.sync('cloud');
assert.equal(reopened.profile.coins,920);
assert.equal(reopened.controller.backup().coins,820);

reopened.profile.coins=1030;reopened.controller.persist(reopened.profile);
reopened.race(()=>remote.set('player',{version:'other-writer',data:JSON.stringify({...cloudProfile,coins:1110})}));
await reopened.controller.sync();
assert.equal(JSON.parse(remote.get('player').data).coins,1110,'stale write should fail its version check');
await reopened.controller.sync();
assert.equal(reopened.view.status,'conflict');
await reopened.controller.sync('local');
assert.equal(JSON.parse(remote.get('player').data).coins,1030);
assert.equal(reopened.controller.backup().coins,1110);

const spectator=device();
await signIn(spectator);
remote.set('player',{version:'next-device',data:JSON.stringify({...cloudProfile,coins:2040})});
spectator.onRead(()=>spectator.playing(true));
await spectator.controller.sync();
assert.equal(spectator.profile.coins,1030,'do not replace a profile during a match');
spectator.playing(false);
await spectator.controller.sync();
assert.equal(spectator.profile.coins,2040);

await pc.controller.signOut();
await tick();
assert.equal(pc.controller.owner(),null);
assert.equal(cached(pc.storage),null);
assert.equal(pc.profile.coins,724,'the guest copy stays separate from the account');
assert.equal(pc.profile.checkpoints.campaign.wave,9);

console.log('OK: guest linking, device-local checkpoints, offline reload, conflict backup, stale-write protection, match deferral and sign-out isolation.');
