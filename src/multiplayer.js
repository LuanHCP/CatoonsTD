'use strict';

// PeerServer presents the peers; match state travels directly over WebRTC.
(() => {
  const MAX_PLAYERS=4,PROTOCOL=3,PREFIX='catoons-v3-',TIMEOUT=22000;
  const listeners={message:new Set(),status:new Set()},peers=new Map();
  let broker=null,guest=null,role='solo',status='offline',detail='',roomId='',localPlayerId='solo',roster=['host'],accepting=true,generation=0,cancelPending=null;
  const emit=(kind,value)=>listeners[kind].forEach(fn=>{try{fn(value);}catch(error){console.error('[Catoons sala]',error);}});
  const openPeers=()=>[...peers.values()].filter(item=>item.conn.open);
  const connected=()=>role==='host'?openPeers().length>0:Boolean(guest?.open&&localPlayerId!=='guest');
  const players=()=>role==='host'?['host',...openPeers().map(item=>item.id)]:roster.slice();
  const info=()=>({status,detail,role,connected:connected(),playerCount:role==='solo'?1:players().length,maxPlayers:MAX_PLAYERS,localPlayerId,roomId,accepting});
  function setStatus(next,message=''){status=next;detail=message;emit('status',info());}
  function transmit(conn,type,payload={}){if(!conn?.open)return false;try{conn.send({type,payload,sentAt:Date.now()});return true;}catch(_){return false;}}
  function send(type,payload={}){if(role==='host'){let sent=false;for(const item of openPeers())sent=transmit(item.conn,type,payload)||sent;return sent;}return transmit(guest,type,payload);}
  function broadcastRoster(){send('roster',{players:players(),accepting});setStatus(connected()?'connected':'waiting');}
  function closeAll(notify=true){
    generation++;
    if(cancelPending){const cancel=cancelPending;cancelPending=null;cancel(new Error('Conexão cancelada.'));}
    const old=broker;broker=null;const channels=[...peers.values()].map(item=>item.conn);if(guest)channels.push(guest);
    peers.clear();guest=null;role='solo';roomId='';localPlayerId='solo';roster=['host'];accepting=true;
    for(const conn of channels){try{conn.close();}catch(_){}}
    try{old?.destroy();}catch(_){}
    if(notify)setStatus('offline');
  }
  const errorText=error=>error?.type==='peer-unavailable'?'Sala não encontrada. Confira o ID e se o anfitrião está com a sala aberta.':error?.type==='unavailable-id'?'Este ID já está em uso. Tente criar a sala novamente.':'Não foi possível conectar ao serviço de salas. Verifique sua internet e tente novamente.';
  function incoming(message,from){
    if(!message||typeof message.type!=='string')return;
    if(role==='host'&&['welcome','roster','start','snapshot','lobby','return-lobby','room-closed','rejected'].includes(message.type))return;
    if(role==='guest'&&message.type==='roster'){roster=message.payload.players||roster;accepting=message.payload.accepting!==false;setStatus('connected');}
    if(role==='guest'&&message.type==='room-closed'){closeAll(false);setStatus('closed','O anfitrião fechou a sala.');return;}
    emit('message',{...message,from});
  }
  function acceptConnection(conn,token){
    if(token!==generation){conn.close();return;}
    const id=['p2','p3','p4'].find(slot=>!peers.has(slot));
    const reason=conn.metadata?.protocol!==PROTOCOL?'Versões diferentes. Atualize o jogo nos dois computadores.':!accepting?'A partida já começou. Aguarde o anfitrião voltar ao lobby.':!id?'Sala cheia. O limite é de quatro jogadores.':null;
    if(reason){conn.on('open',()=>{transmit(conn,'rejected',{reason});setTimeout(()=>conn.close(),300);});return;}
    const item={id,conn};peers.set(id,item);
    const expiry=setTimeout(()=>{if(!conn.open&&token===generation){peers.delete(id);conn.close();broadcastRoster();}},TIMEOUT);
    conn.on('open',()=>{clearTimeout(expiry);if(token!==generation)return;transmit(conn,'welcome',{playerId:id,players:players(),roomId,accepting});broadcastRoster();});
    conn.on('data',message=>{if(token===generation)incoming(message,id);});
    conn.on('close',()=>{clearTimeout(expiry);if(token!==generation)return;peers.delete(id);broadcastRoster();});
    conn.on('error',()=>{clearTimeout(expiry);if(token!==generation)return;peers.delete(id);conn.close();broadcastRoster();});
  }
  function openBroker(id,token){
    return new Promise((resolve,reject)=>{
      let settled=false;
      const timer=setTimeout(()=>finish(new Error('O serviço de salas demorou para responder. Tente novamente.')),TIMEOUT);
      function finish(error){if(settled)return;settled=true;clearTimeout(timer);if(cancelPending===cancel)cancelPending=null;error?reject(error):resolve(broker);}
      const cancel=error=>finish(error);cancelPending=cancel;
      try{broker=id?new window.Peer(id,{debug:0,config:{iceServers:[]}}):new window.Peer({debug:0,config:{iceServers:[]}});}catch(error){finish(error);return;}
      broker.on('open',()=>{if(token===generation)finish();});
      broker.on('connection',conn=>{if(role==='host')acceptConnection(conn,token);else conn.close();});
      broker.on('error',error=>{if(token!==generation)return;const message=errorText(error);if(!settled){finish(Object.assign(new Error(message),{type:error.type}));return;}if(cancelPending){cancelPending(new Error(message));return;}setStatus('error',message);});
      broker.on('disconnected',()=>{if(token!==generation)return;setStatus('signal-lost','Serviço de salas desconectado. A partida em andamento continua; recrie a sala para receber novos jogadores.');});
    });
  }
  function checkSupport(){if(!window.Peer||!window.RTCPeerConnection)throw new Error('Use Edge ou Chrome atualizado e recarregue a página para conectar.');}
  async function createRoom(){
    checkSupport();closeAll(false);const token=generation;role='host';localPlayerId='host';setStatus('creating');
    try{
      for(let attempt=0;attempt<4;attempt++){
        const random=new Uint32Array(1);crypto.getRandomValues(random);roomId=String(10000000+random[0]%90000000);
        try{await openBroker(PREFIX+roomId,token);break;}catch(error){if(error.type!=='unavailable-id'||attempt===3)throw error;const old=broker;broker=null;old?.destroy();}
      }
      if(token!==generation)throw new Error('Conexão cancelada.');setStatus('waiting');return roomId;
    }catch(error){if(token===generation){closeAll(false);setStatus('error',error.message);}throw error;}
  }
  async function joinRoom(value){
    checkSupport();const id=String(value||'').trim().replace(/[\s-]/g,'');if(!/^\d{8}$/.test(id))throw new Error('Digite os 8 números do ID da sala.');
    closeAll(false);const token=generation;roomId=id;role='guest';localPlayerId='guest';setStatus('joining');
    try{
      const peer=await openBroker(null,token);if(token!==generation)throw new Error('Conexão cancelada.');
      return await new Promise((resolve,reject)=>{
        let settled=false;const timer=setTimeout(()=>finish(new Error('A sala não respondeu. Confira o ID e a conexão LAN/VPN.')),TIMEOUT);
        const cancel=error=>finish(error);cancelPending=cancel;
        function finish(error){if(settled)return;settled=true;clearTimeout(timer);if(cancelPending===cancel)cancelPending=null;error?reject(error):resolve(roomId);}
        guest=peer.connect(PREFIX+id,{reliable:true,serialization:'json',metadata:{protocol:PROTOCOL}});
        guest.on('data',message=>{
          if(token!==generation)return;
          if(message?.type==='rejected'){finish(new Error(message.payload.reason));return;}
          if(message?.type==='welcome'){
            localPlayerId=message.payload.playerId;roster=message.payload.players;accepting=message.payload.accepting!==false;setStatus('connected');finish();return;
          }
          incoming(message,'host');
        });
        guest.on('close',()=>{if(token!==generation)return;finish(new Error('A conexão com o anfitrião foi encerrada.'));closeAll(false);setStatus('closed','A sala foi encerrada ou a conexão com o anfitrião caiu.');});
        guest.on('error',()=>finish(new Error('Não foi possível ligar ao anfitrião. Verifique a rede ou VPN.')));
      });
    }catch(error){if(token===generation){closeAll(false);setStatus('error',error.message);}throw error;}
  }
  function disconnect(){send(role==='host'?'room-closed':'leaving');closeAll(true);}
  window.CatoonsLan={
    createRoom,joinRoom,disconnect,send,sendTo:(id,type,payload)=>transmit(peers.get(id)?.conn,type,payload),
    setAccepting(value){if(role!=='host')return;accepting=Boolean(value);broadcastRoster();},
    onMessage(fn){listeners.message.add(fn);return()=>listeners.message.delete(fn);},
    onStatus(fn){listeners.status.add(fn);fn(info());return()=>listeners.status.delete(fn);},
    get role(){return role;},get status(){return status;},get connected(){return connected();},get roomId(){return roomId;},
    get isHost(){return role==='host';},get isGuest(){return role==='guest';},get playerCount(){return role==='solo'?1:players().length;},
    get maxPlayers(){return MAX_PLAYERS;},get localPlayerId(){return localPlayerId;},get players(){return players();},
    get canInvite(){return role==='host'&&accepting&&peers.size<MAX_PLAYERS-1;}
  };
  window.addEventListener('pagehide',()=>closeAll(false));
})();
