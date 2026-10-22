'use strict';

// Multiplayer cooperativo experimental para LAN/VPN.
// Topologia em estrela: o anfitrião mantém até três conexões WebRTC diretas.
(() => {
  const MAX_PLAYERS = 4;
  const listeners = {message: new Set(), status: new Set()};
  const hostPeers = new Map();
  let guestPeer = null;
  let role = 'solo';
  let status = 'offline';
  let localPlayerId = 'solo';
  let pendingPlayerId = null;
  let remotePlayerCount = 1;
  let remotePlayers = ['host'];

  const emit = (kind, value) => listeners[kind].forEach(fn => {
    try { fn(value); } catch (error) { console.error('[Catoons LAN]', error); }
  });
  const openHostPeers = () => [...hostPeers.values()].filter(item => item.channel?.readyState === 'open');
  const playerCount = () => role === 'host' ? 1 + openHostPeers().length : role === 'guest' ? remotePlayerCount : 1;
  const connected = () => role === 'host' ? openHostPeers().length > 0 : guestPeer?.channel?.readyState === 'open';
  const setStatus = (next, detail = '') => {
    status = next;
    emit('status', {status, detail, role, connected: connected(), playerCount: playerCount(), maxPlayers: MAX_PLAYERS, localPlayerId});
  };
  const encode = value => btoa(unescape(encodeURIComponent(JSON.stringify(value))));
  const decode = code => JSON.parse(decodeURIComponent(escape(atob(String(code || '').trim()))));
  const waitForIce = pc => new Promise(resolve => {
    if (pc.iceGatheringState === 'complete') return resolve();
    const done = () => {
      if (pc.iceGatheringState !== 'complete') return;
      pc.removeEventListener('icegatheringstatechange', done);
      resolve();
    };
    pc.addEventListener('icegatheringstatechange', done);
    setTimeout(resolve, 5000);
  });
  const packet = (type, payload = {}) => JSON.stringify({type, payload, sentAt: Date.now()});

  function broadcastRoster() {
    if (role !== 'host') return;
    const payload = {playerCount: playerCount(), maxPlayers: MAX_PLAYERS, players: ['host', ...openHostPeers().map(item => item.playerId)]};
    for (const item of openHostPeers()) item.channel.send(packet('roster', payload));
    setStatus(connected() ? 'connected' : status);
  }

  function closeAll(notify = true) {
    for (const item of hostPeers.values()) {
      try { item.channel?.close(); } catch (_) {}
      try { item.pc?.close(); } catch (_) {}
    }
    hostPeers.clear();
    try { guestPeer?.channel?.close(); } catch (_) {}
    try { guestPeer?.pc?.close(); } catch (_) {}
    guestPeer = null;
    role = 'solo';localPlayerId = 'solo';pendingPlayerId = null;remotePlayerCount = 1;remotePlayers = ['host'];
    if (notify) setStatus('offline');
  }

  function parseMessage(event, from) {
    try {
      const message = JSON.parse(event.data);
      if (message.type === 'welcome' && role === 'guest') {
        localPlayerId = message.payload.playerId || localPlayerId;
        remotePlayerCount = message.payload.playerCount || remotePlayerCount;
        remotePlayers = message.payload.players || ['host', localPlayerId];
        setStatus('connected');
      } else if (message.type === 'roster' && role === 'guest') {
        remotePlayerCount = message.payload.playerCount || remotePlayerCount;
        remotePlayers = message.payload.players || remotePlayers;
        setStatus('connected');
      }
      emit('message', {...message, from});
    } catch (_) { setStatus('error', 'Mensagem inválida recebida.'); }
  }

  function bindHostChannel(item, channel) {
    item.channel = channel;
    channel.onopen = () => {
      channel.send(packet('welcome', {playerId: item.playerId, playerCount: playerCount(), maxPlayers: MAX_PLAYERS, players: ['host', ...openHostPeers().map(peer => peer.playerId)]}));
      pendingPlayerId = null;setStatus('connected');broadcastRoster();
    };
    channel.onclose = () => { setStatus(openHostPeers().length ? 'connected' : 'disconnected');broadcastRoster(); };
    channel.onerror = () => setStatus('error', `Falha na conexão de ${item.playerId}.`);
    channel.onmessage = event => parseMessage(event, item.playerId);
  }

  function bindGuestChannel(item, channel) {
    item.channel = channel;
    channel.onopen = () => setStatus('connected');
    channel.onclose = () => setStatus('disconnected');
    channel.onerror = () => setStatus('error', 'Falha no canal da partida.');
    channel.onmessage = event => parseMessage(event, 'host');
  }

  function nextPlayerId() {
    for (let slot = 2; slot <= MAX_PLAYERS; slot++) {
      const id = `p${slot}`;if (!hostPeers.has(id)) return id;
    }
    return null;
  }

  async function createInvite() {
    if (!window.RTCPeerConnection) throw new Error('Este navegador não oferece suporte a WebRTC.');
    if (role !== 'host') {closeAll(false);role = 'host';localPlayerId = 'host';}
    if (pendingPlayerId) throw new Error('Conclua o convite atual antes de gerar outro.');
    const playerId = nextPlayerId();
    if (!playerId) throw new Error('A sala já atingiu o limite de 4 jogadores.');
    const pc = new RTCPeerConnection({iceServers: []});
    const item = {playerId, pc, channel: null};hostPeers.set(playerId, item);pendingPlayerId = playerId;
    pc.onconnectionstatechange = () => {if (pc.connectionState === 'failed') setStatus('error', `Não foi possível conectar ${playerId}.`);};
    bindHostChannel(item, pc.createDataChannel('catoons-coop', {ordered: true}));
    setStatus('creating');await pc.setLocalDescription(await pc.createOffer());await waitForIce(pc);setStatus('waiting-answer');
    return encode({version: 2, playerId, description: pc.localDescription});
  }

  async function createRoom() {
    closeAll(false);role = 'host';localPlayerId = 'host';setStatus('creating');return createInvite();
  }

  async function joinRoom(offerCode) {
    if (!window.RTCPeerConnection) throw new Error('Este navegador não oferece suporte a WebRTC.');
    const envelope = decode(offerCode),offer = envelope.description || envelope;
    if (offer.type !== 'offer') throw new Error('O código da sala não é uma oferta válida.');
    closeAll(false);role = 'guest';localPlayerId = envelope.playerId || 'guest';remotePlayerCount = 2;
    const pc = new RTCPeerConnection({iceServers: []});
    const item = {playerId: localPlayerId, pc, channel: null};guestPeer = item;
    pc.onconnectionstatechange = () => {if (pc.connectionState === 'failed') setStatus('error', 'Não foi possível ligar ao anfitrião.');};
    pc.ondatachannel = event => bindGuestChannel(item, event.channel);
    setStatus('joining');await pc.setRemoteDescription(offer);await pc.setLocalDescription(await pc.createAnswer());await waitForIce(pc);setStatus('waiting-host');
    return encode({version: 2, playerId: localPlayerId, description: pc.localDescription});
  }

  async function acceptAnswer(answerCode) {
    if (role !== 'host') throw new Error('Crie uma sala antes de aceitar a resposta.');
    const envelope = decode(answerCode),answer = envelope.description || envelope;
    const playerId = envelope.playerId || pendingPlayerId,item = hostPeers.get(playerId);
    if (!item || !pendingPlayerId || playerId !== pendingPlayerId) throw new Error('Esta resposta não pertence ao convite atual.');
    if (answer.type !== 'answer') throw new Error('O código recebido não é uma resposta válida.');
    await item.pc.setRemoteDescription(answer);setStatus('connecting');
  }

  function send(type, payload = {}) {
    if (role === 'host') {
      let sent = false;for (const item of openHostPeers()) {item.channel.send(packet(type, payload));sent = true;}return sent;
    }
    if (guestPeer?.channel?.readyState !== 'open') return false;
    guestPeer.channel.send(packet(type, payload));return true;
  }

  function sendTo(playerId, type, payload = {}) {
    if (role !== 'host') return false;
    const channel = hostPeers.get(playerId)?.channel;if (channel?.readyState !== 'open') return false;
    channel.send(packet(type, payload));return true;
  }

  window.CatoonsLan = {
    createRoom,createInvite,joinRoom,acceptAnswer,disconnect: () => closeAll(true),send,sendTo,
    onMessage(fn) {listeners.message.add(fn);return () => listeners.message.delete(fn);},
    onStatus(fn) {listeners.status.add(fn);fn({status,role,connected:connected(),playerCount:playerCount(),maxPlayers:MAX_PLAYERS,localPlayerId});return () => listeners.status.delete(fn);},
    get role() {return role;},get status() {return status;},get connected() {return connected();},
    get isHost() {return role === 'host';},get isGuest() {return role === 'guest';},
    get playerCount() {return playerCount();},get maxPlayers() {return MAX_PLAYERS;},get localPlayerId() {return localPlayerId;},
    get players() {return role === 'host' ? ['host', ...openHostPeers().map(item => item.playerId)] : [...remotePlayers];},
    get canInvite() {return role === 'host'&&!pendingPlayerId&&hostPeers.size<MAX_PLAYERS-1;}
  };
})();
