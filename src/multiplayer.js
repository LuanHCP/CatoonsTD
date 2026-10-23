'use strict';
// PeerServer presents peers. WebRTC carries the match; resume tokens reserve a slot for 60s.
(() => {
  const MAX_PLAYERS=4,PROTOCOL=4,PREFIX='catoons-v4-',TIMEOUT=22000,GRACE=60000;
  const listeners={message:new Set(),status:new Set()},peers=new Map();
  let broker=null,guest=null,role='solo',status='offline',detail='',roomId='',localPlayerId='solo',roster=['host'],accepting=true,generation=0,cancelPending=null;
  let resumeToken='',retryTimer=null,retryDeadline=0,brokerRetry=null,remoteAway=[],roomInMatch=false;
  const emit=(kind,value)=>listeners[kind].forEach(fn=>{try{fn(value);}catch(error){console.error('[Catoons sala]',error);}});
  const openPeers=()=>[...peers.values()].filter(item=>item.conn?.open&&!item.away);
  const reserved=()=>[...peers.values()].filter(item=>item.confirmed);
  const connected=()=>role==='host'?reserved().length>0:Boolean(guest?.open&&localPlayerId!=='guest'&&!retryDeadline);
  const players=()=>role==='host'?['host',...reserved().map(item=>item.id)]:roster.slice();
  const away=()=>role==='host'?reserved().filter(item=>item.away).map(item=>({id:item.id,until:item.until})):remoteAway;
  const info=()=>({status,detail,role,connected:connected(),playerCount:role==='solo'?1:players().length,maxPlayers:MAX_PLAYERS,localPlayerId,roomId,accepting,recovering:Boolean(retryDeadline||away().length),recoveryUntil:retryDeadline||Math.max(0,...away().map(item=>item.until)),awayPlayers:away().map(item=>item.id)});
  function setStatus(next,message=''){status=next;detail=message;emit('status',info());}
  function transmit(conn,type,payload={}){
    if(!conn?.open)return false;
    // Let PeerJS chunk binary snapshots; raw JSON can exceed the WebRTC message limit.
    // Skip stale periodic frames while the reliable channel drains, never control messages.
    if(type==='snapshot'&&(conn.bufferSize>2||conn.dataChannel?.bufferedAmount>524288))return false;
    try{conn.send({type,payload,sentAt:Date.now()});return true;}catch(_){return false;}
  }
  function send(type,payload={}){if(role==='host'){let sent=false;for(const item of openPeers())sent=transmit(item.conn,type,payload)||sent;return sent;}return transmit(guest,type,payload);}
  function broadcastRoster(){send('roster',{players:players(),accepting,away:away()});setStatus(away().length?'recovering':connected()?'connected':'waiting');}
  function closeAll(notify=true,flush=0){
    generation++;clearTimeout(retryTimer);clearTimeout(brokerRetry);retryTimer=null;brokerRetry=null;retryDeadline=0;roomInMatch=false;
    if(cancelPending){const cancel=cancelPending;cancelPending=null;cancel(new Error('Conexão cancelada.'));}
    const old=broker;broker=null;const channels=[...peers.values()].map(item=>{clearTimeout(item.timer);return item.conn;});if(guest)channels.push(guest);
    peers.clear();guest=null;role='solo';roomId='';localPlayerId='solo';roster=['host'];accepting=true;resumeToken='';remoteAway=[];
    const cleanup=()=>{for(const conn of channels){try{conn?.close();}catch(_){}}try{old?.destroy();}catch(_){}};
    flush?setTimeout(cleanup,flush):cleanup();if(notify)setStatus('offline');
  }
  const errorText=error=>error?.type==='peer-unavailable'?'Sala não encontrada. Confira o ID e se o anfitrião está com a sala aberta.':error?.type==='unavailable-id'?'Este ID já está em uso. Tente criar a sala novamente.':'Não foi possível conectar ao serviço de salas. Verifique sua internet e tente novamente.';
  function dropPeer(item){
    if(peers.get(item.id)!==item)return;
    clearTimeout(item.timer);peers.delete(item.id);try{item.conn?.close();}catch(_){}broadcastRoster();
  }
  function hostLost(item,token){
    if(token!==generation||peers.get(item.id)!==item||item.away)return;
    if(!item.confirmed){dropPeer(item);return;}
    item.away=true;item.until=Date.now()+GRACE;
    item.timer=setTimeout(()=>{if(token===generation&&item.away)dropPeer(item);},GRACE);
    broadcastRoster();
  }
  function incoming(message,from){
    if(!message||typeof message.type!=='string')return;
    if(role==='host'&&['welcome','roster','start','resume','snapshot','lobby','event-settings','return-lobby','room-closed','rejected'].includes(message.type))return;
    if(role==='host'&&message.type==='leaving'){const item=peers.get(from);if(item)dropPeer(item);return;}
    if(role==='guest'&&message.type==='roster'){roster=message.payload.players||roster;accepting=message.payload.accepting!==false;remoteAway=message.payload.away||[];setStatus(remoteAway.length?'recovering':'connected');}
    if(role==='guest'&&message.type==='room-closed'){closeAll(false);setStatus('closed','O anfitrião fechou a sala.');return;}
    if(message.type==='start'||message.type==='resume')roomInMatch=true;
    if(message.type==='return-lobby')roomInMatch=false;
    emit('message',{...message,from});
  }
  function acceptConnection(conn,token){
    if(token!==generation){conn.close();return;}
    const returning=conn.metadata?.resumeToken?[...peers.values()].find(item=>item.secret===conn.metadata.resumeToken):null;
    const id=returning?.id||['p2','p3','p4'].find(slot=>!peers.has(slot));
    const reason=conn.metadata?.protocol!==PROTOCOL?'Versões diferentes. Atualize o jogo nos dois computadores.':!returning&&!accepting?'A partida já começou. Aguarde o anfitrião voltar ao lobby.':!id?'Sala cheia. O limite é de quatro jogadores.':null;
    if(reason){conn.on('open',()=>{transmit(conn,'rejected',{reason});setTimeout(()=>conn.close(),300);});return;}
    if(returning){clearTimeout(returning.timer);try{returning.conn?.close();}catch(_){}}
    const item={id,conn,secret:returning?.secret||crypto.randomUUID(),confirmed:Boolean(returning),away:Boolean(returning),until:returning?.until||0};peers.set(id,item);
    const expiry=setTimeout(()=>{if(!conn.open&&token===generation)dropPeer(item);},returning?Math.max(1,returning.until-Date.now()):TIMEOUT);item.timer=expiry;
    conn.on('open',()=>{clearTimeout(expiry);if(token!==generation||peers.get(id)!==item)return;item.confirmed=true;item.away=false;item.until=0;transmit(conn,'welcome',{playerId:id,resumeToken:item.secret,players:players(),roomId,accepting,resumed:Boolean(returning),away:away()});broadcastRoster();});
    conn.on('data',message=>{if(token===generation&&peers.get(id)===item)incoming(message,id);});
    conn.on('close',()=>{if(!item.away)clearTimeout(expiry);hostLost(item,token);});
    conn.on('error',()=>{if(!item.away)clearTimeout(expiry);hostLost(item,token);});
  }
  function retryBroker(token){
    if(token!==generation||!broker||broker.destroyed)return;
    if(broker.disconnected){try{broker.reconnect();}catch(_){}}
    brokerRetry=setTimeout(()=>retryBroker(token),2500);
  }
  function openBroker(id,token){
    return new Promise((resolve,reject)=>{
      let settled=false;
      const timer=setTimeout(()=>finish(new Error('O serviço de salas demorou para responder. Tente novamente.')),TIMEOUT);
      function finish(error){if(settled)return;settled=true;clearTimeout(timer);if(cancelPending===cancel)cancelPending=null;error?reject(error):resolve(broker);}
      const cancel=error=>finish(error);cancelPending=cancel;
      let peer;try{peer=id?new window.Peer(id,{debug:0,config:{iceServers:[]}}):new window.Peer({debug:0,config:{iceServers:[]}});broker=peer;}catch(error){finish(error);return;}
      peer.on('open',()=>{if(token!==generation||broker!==peer)return;clearTimeout(brokerRetry);if(!settled)finish();else if(!retryDeadline)setStatus(away().length?'recovering':connected()?'connected':'waiting');});
      peer.on('connection',conn=>{if(role==='host'&&token===generation)acceptConnection(conn,token);else conn.close();});
      peer.on('error',error=>{if(token!==generation||broker!==peer)return;const message=errorText(error);if(!settled){finish(Object.assign(new Error(message),{type:error.type}));return;}if(retryDeadline)return;if(cancelPending){cancelPending(new Error(message));return;}setStatus('error',message);});
      peer.on('disconnected',()=>{if(token!==generation||broker!==peer)return;if(!settled)return;clearTimeout(brokerRetry);retryBroker(token);if(!retryDeadline)setStatus('signal-lost','Restabelecendo o serviço de salas. Sua partida continua se os jogadores ainda estiverem conectados.');});
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
  function beginRecovery(token){
    if(token!==generation||role!=='guest'||retryDeadline)return;
    retryDeadline=Date.now()+GRACE;setStatus('recovering','Reconectando ao anfitrião. Sua vaga, seus gatos e seus salmões estão reservados por 60 segundos.');
    const attempt=()=>{
      if(token!==generation)return;
      if(Date.now()>=retryDeadline){closeAll(false);setStatus('closed','O prazo de reconexão terminou. Volte ao lobby para criar outra sala.');return;}
      if(broker&&!broker.disconnected&&!broker.destroyed)connectGuest(token).catch(()=>{});
      retryTimer=setTimeout(attempt,2500);
    };
    retryTimer=setTimeout(attempt,600);
  }
  function connectGuest(token){
    return new Promise((resolve,reject)=>{
      let settled=false;const recovering=Boolean(retryDeadline),timer=setTimeout(()=>finish(new Error('A sala não respondeu. Confira o ID e a conexão LAN/VPN.')),recovering?2200:TIMEOUT);
      const cancel=error=>finish(error);if(!recovering)cancelPending=cancel;
      let conn;
      function finish(error){if(settled)return;settled=true;clearTimeout(timer);if(cancelPending===cancel)cancelPending=null;if(error){if(recovering)try{conn?.close();}catch(_){}reject(error);}else resolve(roomId);}
      try{conn=broker.connect(PREFIX+roomId,{reliable:true,serialization:'binary',metadata:{protocol:PROTOCOL,resumeToken}});guest=conn;}catch(error){finish(error);return;}
      conn.on('data',message=>{
        if(token!==generation||guest!==conn)return;
        if(message?.type==='rejected'){finish(new Error(message.payload.reason));return;}
        if(message?.type==='welcome'){
          localPlayerId=message.payload.playerId;resumeToken=message.payload.resumeToken;roster=message.payload.players;accepting=message.payload.accepting!==false;remoteAway=message.payload.away||[];
          clearTimeout(retryTimer);retryDeadline=0;setStatus(remoteAway.length?'recovering':'connected');finish();return;
        }
        incoming(message,'host');
      });
      conn.on('close',()=>{if(token!==generation||guest!==conn)return;if(!settled)finish(new Error('A conexão com o anfitrião foi encerrada.'));if(resumeToken)beginRecovery(token);});
      conn.on('error',()=>{if(token!==generation||guest!==conn)return;if(!settled)finish(new Error('Não foi possível ligar ao anfitrião. Verifique a rede ou VPN.'));if(resumeToken)beginRecovery(token);});
    });
  }
  async function joinRoom(value){
    checkSupport();const id=String(value||'').trim().replace(/[\s-]/g,'');if(!/^\d{8}$/.test(id))throw new Error('Digite os 8 números do ID da sala.');
    closeAll(false);const token=generation;roomId=id;role='guest';localPlayerId='guest';setStatus('joining');
    try{await openBroker(null,token);if(token!==generation)throw new Error('Conexão cancelada.');return await connectGuest(token);}
    catch(error){if(token===generation){closeAll(false);setStatus('error',error.message);}throw error;}
  }
  function disconnect(){send(role==='host'?'room-closed':'leaving');closeAll(true,160);}
  window.CatoonsLan={
    createRoom,joinRoom,disconnect,send,sendTo:(id,type,payload)=>transmit(peers.get(id)?.conn,type,payload),
    setAccepting(value){if(role!=='host')return;accepting=Boolean(value);roomInMatch=!accepting;broadcastRoster();},
    onMessage(fn){listeners.message.add(fn);return()=>listeners.message.delete(fn);},
    onStatus(fn){listeners.status.add(fn);fn(info());return()=>listeners.status.delete(fn);},
    get role(){return role;},get status(){return status;},get connected(){return connected();},get roomId(){return roomId;},
    get isHost(){return role==='host';},get isGuest(){return role==='guest';},get playerCount(){return role==='solo'?1:players().length;},
    get maxPlayers(){return MAX_PLAYERS;},get localPlayerId(){return localPlayerId;},get players(){return players();},
    get recovering(){return info().recovering;},get recoveryUntil(){return info().recoveryUntil;},
    get canInvite(){return role==='host'&&accepting&&peers.size<MAX_PLAYERS-1;}
  };
  window.addEventListener('pagehide',()=>{send(role==='host'?'room-closed':'leaving');closeAll(false,100);});
})();
