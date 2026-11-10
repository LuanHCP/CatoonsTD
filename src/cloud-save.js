'use strict';

(() => {
  const activeKey='catoonsTD_google_active';
  const accountKey=uid=>'catoonsTD_google_'+uid;
  const validUid=uid=>typeof uid==='string'&&/^[\w-]{1,128}$/.test(uid);
  const encode=({settings,checkpoints,...progress})=>JSON.stringify(progress);

  function read(storage,key){
    try{return JSON.parse(storage.getItem(key));}
    catch{return null;}
  }

  function account(storage,uid){
    if(!validUid(uid))return null;
    const record=read(storage,accountKey(uid));
    return record?.profile&&typeof record.profile==='object'?{...record,uid}:null;
  }

  function cached(storage){
    return account(storage,read(storage,activeKey));
  }

  function create({storage,initial,normalize,fresh,guest,current,apply,canSwitch,view,load}){
    let active=initial, user=null, service=null, loading=null, choice=null, busy=false,authReady=false;
    let status=initial?'pending':'guest', retryTimer=0;
    const progress=profile=>encode(normalize(profile));

    function show(){
      view({status,user,active:active?.uid??null,busy,ready:authReady,choice,local:current(),backup:Boolean(active?.backup)});
    }

    function keep(record){
      storage.setItem(accountKey(record.uid),JSON.stringify(record));
    }

    function activate(record){
      keep(record);
      storage.setItem(activeKey,JSON.stringify(record.uid));
      active=record;
      apply(record.profile);
    }

    function fromCloud(remote,device){
      const parsed=JSON.parse(remote.data);
      if(!Number.isFinite(parsed?.level)||!parsed.maps||typeof parsed.maps!=='object'||Array.isArray(parsed.maps))throw Error('Invalid cloud save');
      return normalize({...parsed,settings:device.settings,checkpoints:device.checkpoints});
    }

    function schedule(){
      if(retryTimer||!user||choice||!canSwitch())return;
      retryTimer=setTimeout(()=>{retryTimer=0;void sync();},2500);
    }

    function persist(profile){
      if(!active)return null;
      active.profile=profile;
      try{keep(active);}
      catch{status='storage';show();return false;}
      if(!busy&&progress(profile)!==active.base?.data){
        status=choice?choice.kind:'pending';
        schedule();
        show();
      }
      return true;
    }

    function setChoice(kind,remote,other=null){
      choice={kind,version:remote?.version??null,other};
      status=kind;
    }

    async function sync(preference){
      if(!authReady||!canSwitch()||busy)return;
      if(!user){
        if(active){
          try{storage.removeItem(activeKey);active=null;apply(guest());}
          catch{status='storage';show();return;}
        }
        choice=null;status='guest';show();return;
      }

      const uid=user.uid;
      if(active?.uid!==uid){
        try{
          const record=account(storage,uid);
          if(record){
            record.profile=normalize(record.profile);
            activate(record);
          }else if(active){
            storage.removeItem(activeKey);
            active=null;
            apply(guest());
          }
        }catch{status='storage';show();return;}
      }

      const requested=preference&&choice;
      const stillHere=()=>user?.uid===uid&&canSwitch();
      busy=true;status='syncing';show();
      try{
        const remote=await service.read(uid);
        if(!stillHere()){status='pending';return;}
        const local=current(),data=progress(local),empty=progress(fresh());
        const cloud=remote?fromCloud(remote,active?local:{settings:local.settings}):null;
        const equivalent=cloud&&encode(cloud)===data;
        const different=active&&remote?.version!==active.base?.version;
        const changed=active&&(active.base?encode(fromCloud(active.base,local))!==data:true);
        const link=!active&&!remote&&data!==empty;
        const conflict=Boolean(remote&&!equivalent&&(active?different&&changed:data!==empty));
        if((link||conflict)&&(!requested||requested.version!==(remote?.version??null))){
          setChoice(link?'link':'conflict',remote,cloud);return;
        }
        if(conflict&&preference==='cloud'){
          activate({uid,profile:cloud,base:remote,backup:local});
        }else if((link||conflict)&&preference==='local'){
          if(!active)activate({uid,profile:local,base:remote,backup:cloud});
          else if(cloud){active.backup=cloud;keep(active);}
          if(!await upload(uid,data,remote,stillHere))return;
        }else if(!active&&remote){
          activate({uid,profile:cloud,base:remote});
        }else if(equivalent){
          active.base=remote;keep(active);
        }else if(remote&&different&&!changed){
          activate({...active,profile:cloud,base:remote});
        }else{
          if(!active)activate({uid,profile:local,base:null});
          if(!await upload(uid,data,remote,stillHere))return;
        }
        choice=null;status='synced';
      }catch(error){
        if(user?.uid===uid)status=error?.name==='QuotaExceededError'?'storage':error?.code==='permission-denied'?'denied':'pending';
      }finally{
        busy=false;show();
        if(status==='synced'&&active&&progress(current())!==active.base?.data&&
          (!active.base||encode(fromCloud(active.base,current()))!==progress(current())))schedule();
        if(user?.uid!==uid)void sync();
      }
    }

    async function upload(uid,data,remote,stillHere){
      const result=await service.write(uid,remote?.version??null,data);
      if(user?.uid!==uid||active?.uid!==uid){status='pending';return;}
      if(result){
        active.base=result;
        keep(active);
        return true;
      }else{
        status='pending';choice=null;
        if(stillHere())schedule();
      }
      return false;
    }

    function ensure(){
      if(service||loading)return;
      status='loading';show();
      loading=load().then(backend=>{
        service=backend;
        service.observe(next=>{
          authReady=true;
          user=next&&validUid(next.uid)?next:null;
          choice=null;
          void sync();
        });
      }).catch(()=>{service=null;status=active?'pending':'unavailable';show();})
        .finally(()=>{loading=null;});
    }

    async function signIn(){
      if(!authReady||busy||user){ensure();return;}
      busy=true;status='signing-in';show();
      try{await service.signIn();}
      catch(error){status=error?.code==='auth/popup-blocked'?'popup':error?.code==='auth/unauthorized-domain'?'unsupported':'sign-in-error';}
      finally{busy=false;show();if(user)void sync();}
    }

    async function signOut(){
      if(!service||busy||!canSwitch())return;
      busy=true;show();
      try{await service.signOut();user=null;}
      catch{status='sign-out-error';}
      finally{busy=false;show();if(!user)void sync();}
    }

    return {
      ensure,signIn,signOut,persist,sync,
      owner:()=>active?.uid??null,
      backup:()=>active?.backup??null,
      resume:()=>{if(service)void sync();else if(active)ensure();},
      refresh:()=>{if(!service)ensure();else void sync();},
      show
    };
  }

  window.CatoonsCloud={cached,create};
})();
