// Catoons TD — Beta portfolio build v0.27.2
'use strict';

const $ = selector => document.querySelector(selector);
const $$ = selector => Array.from(document.querySelectorAll(selector));

const SAVE_KEY = 'catoonsTD_v066';
const PREVIOUS_SAVE_KEYS = ['catoonsTD_v065','catoonsTD_v064','catoonsTD_v063','catoonsTD_v062','catoonsTD_v061','catoonsTD_v060','catoonsTD_v050','luanCatDefense_v030','luanCatDefense_v020'];

const difficulties = {
  easy:   {name:'Fácil',  star:'★', hp:.90, speed:1.00, startMoney:1.00, extraLives:3, waveReward:.78, xpMultiplier:1.00, coinMultiplier:1.00, clearXp:80,  roundsDelta:-4, description:'Entrada mais tranquila, mas sem excesso de dinheiro. +3 vidas, menos rodadas e sem blindados.'},
  normal: {name:'Normal', star:'★', hp:1.00, speed:1.12, startMoney:.90, extraLives:0, waveReward:.86, xpMultiplier:1.25, coinMultiplier:1.35, clearXp:130, roundsDelta:0,  description:'Economia mais apertada, ondas mais cheias e blindados a partir daqui.'},
  hard:   {name:'Difícil',star:'★', hp:1.16, speed:1.28, startMoney:.78, extraLives:-3,waveReward:.95, xpMultiplier:1.55, coinMultiplier:1.75, clearXp:210, roundsDelta:5,  description:'Pouco dinheiro inicial, inimigos rápidos, mais rodadas e margem pequena para erro.'}
};
const difficultyOrder = ['easy','normal','hard'];
const TOWER_LIMIT_PER_TYPE = 4;

const maps = {
  grove: {
    name:'Bosque dos Gatinhos', rounds:15, startMoney:260, lives:20, hpMultiplier:1, speedMultiplier:1.05, rewardMultiplier:1, clearCoins:40,
    description:'Curvas abertas, árvores iluminadas e um grande gancho ao redor do bosque central — o mapa mais simples para aprender as tropas.',
    obstacles:[
      {x:320,y:280,r:34,type:'tree'},{x:80,y:110,r:26,type:'tree'},
      {x:610,y:340,r:28,type:'tree'},{x:860,y:40,r:22,type:'tree'}
    ],
    sky:['#122a3d','#0d1d1a'], ground:'#142b22', road:'#71675c', shoulder:'#34313a',
    // Um único gancho em U ao redor do bosque central — a rota mais simples das quatro.
    path:[{x:-40,y:200},{x:170,y:200},{x:170,y:400},{x:460,y:400},{x:460,y:150},{x:700,y:110},{x:960,y:170}]
  },
  ridge: {
    name:'Serra Felina', rounds:20, startMoney:290, lives:18, hpMultiplier:1.08, speedMultiplier:1.12, rewardMultiplier:1.05, clearCoins:65,
    description:'Montanhas, neblina e uma estrada de montanha com duas curvas fechadas em ziguezague.',
    obstacles:[
      {x:340,y:130,r:29,type:'pine'},{x:60,y:420,r:31,type:'rock'},
      {x:700,y:250,r:30,type:'pine'},{x:60,y:220,r:27,type:'rock'}
    ],
    sky:['#1b1930','#0d151d'], ground:'#1a271f', road:'#6a625c', shoulder:'#302e38',
    // Duas curvas fechadas em ziguezague, como uma estrada de montanha subindo a serra.
    path:[{x:-40,y:90},{x:160,y:90},{x:260,y:220},{x:150,y:340},{x:280,y:460},{x:470,y:460},{x:560,y:300},{x:430,y:170},{x:620,y:110},{x:820,y:200},{x:960,y:150}]
  },
  toll: {
    name:'Pedágio da Meia-Noite', rounds:25, startMoney:320, lives:16, hpMultiplier:1.14, speedMultiplier:1.18, rewardMultiplier:1.10, clearCoins:90,
    description:'Cidade ao fundo, postes de luz e uma volta quase completa ao redor da praça do pedágio — o trecho mais pesado dos mapas Iniciantes.',
    obstacles:[
      {x:600,y:40,r:26,type:'rock'},{x:80,y:430,r:31,type:'rock'},
      {x:750,y:300,r:26,type:'rock'},{x:780,y:150,r:27,type:'rock'}
    ],
    sky:['#080c1c','#111724'], ground:'#111a22', road:'#59616c', shoulder:'#292f38',
    // Entrada vertical pelo topo — única entre os quatro mapas — dando quase uma volta
    // completa ao redor da praça do pedágio antes da saída pela direita.
    path:[{x:300,y:-40},{x:300,y:120},{x:440,y:210},{x:440,y:340},{x:300,y:430},{x:160,y:360},{x:160,y:200},{x:280,y:110},{x:520,y:120},{x:640,y:250},{x:600,y:400},{x:960,y:430}]
  },
  meadow: {
    name:'Prado das Patinhas', rounds:17, startMoney:275, lives:20, hpMultiplier:1.03, speedMultiplier:1.07, rewardMultiplier:1.01, clearCoins:50,
    description:'Pradaria aberta com curvas largas e poucos bloqueios. Introduz posicionamento em ambos os lados da rota sem apertar demais a economia.',
    obstacles:[
      {x:120,y:110,r:24,type:'tree'},{x:350,y:390,r:24,type:'tree'},{x:630,y:120,r:22,type:'tree'},{x:800,y:410,r:22,type:'rock'}
    ],
    sky:['#17384a','#10271f'], ground:'#25452d', road:'#7b6f62', shoulder:'#3a3b3a',
    path:[{x:-40,y:310},{x:120,y:310},{x:210,y:210},{x:340,y:210},{x:420,y:330},{x:560,y:330},{x:650,y:220},{x:760,y:220},{x:960,y:300}]
  },
  creek: {
    name:'Riacho do Novelo', rounds:19, startMoney:285, lives:19, hpMultiplier:1.06, speedMultiplier:1.10, rewardMultiplier:1.03, clearCoins:58,
    description:'Uma rota sinuosa acompanha um riacho. As curvas aumentam o tempo no alcance, mas pedras começam a criar pontos cegos importantes.',
    obstacles:[
      {x:175,y:115,r:27,type:'rock'},{x:330,y:325,r:24,type:'tree'},{x:545,y:165,r:25,type:'rock'},{x:730,y:365,r:25,type:'tree'}
    ],
    sky:['#123547','#0d2524'], ground:'#173b34', road:'#69746f', shoulder:'#2c3b3b',
    path:[{x:-40,y:145},{x:130,y:145},{x:230,y:260},{x:150,y:390},{x:335,y:445},{x:460,y:335},{x:420,y:190},{x:610,y:125},{x:720,y:245},{x:835,y:390},{x:960,y:345}]
  },
  garden: {
    name:'Jardim das Lanternas', rounds:23, startMoney:310, lives:17, hpMultiplier:1.11, speedMultiplier:1.15, rewardMultiplier:1.07, clearCoins:78,
    description:'O último treino antes dos mapas Médios: rota longa ao redor de jardins e lanternas, com vários bloqueios de visão próximos às melhores curvas.',
    obstacles:[
      {x:280,y:245,r:30,type:'tree'},{x:470,y:245,r:33,type:'tree'},{x:650,y:260,r:30,type:'tree'},{x:820,y:115,r:22,type:'rock'}
    ],
    sky:['#271c3d','#101b2b'], ground:'#20342b', road:'#756b72', shoulder:'#353344',
    path:[{x:-40,y:410},{x:120,y:410},{x:180,y:280},{x:170,y:130},{x:370,y:95},{x:520,y:155},{x:540,y:350},{x:690,y:435},{x:825,y:350},{x:790,y:185},{x:960,y:120}]
  },
  canyon: {
    name:'Desfiladeiro Escaldante', rounds:28, startMoney:340, lives:15, hpMultiplier:1.20, speedMultiplier:1.22, rewardMultiplier:1.15, clearCoins:115, enemyDensity:1.15,
    description:'Mapa mediano: rota bem mais longa e sinuosa entre as rochas, mais rodadas e mais balões por onda que os mapas iniciantes.',
    obstacles:[
      {x:480,y:260,r:95,type:'rock'},
      {x:80,y:150,r:27,type:'rock'},{x:850,y:150,r:28,type:'rock'},
      {x:150,y:420,r:26,type:'rock'},{x:800,y:420,r:27,type:'rock'}
    ],
    sky:['#3a1f18','#1a0f0c'], ground:'#4a2f1f', road:'#8a7360', shoulder:'#3d2e26',
    // A rota dá uma volta quase completa ao redor da grande formação rochosa central
    // (o "quarteirão" do desfiladeiro) antes de seguir para a saída.
    path:[{x:-40,y:260},{x:150,y:260},{x:310,y:260},{x:360,y:140},{x:480,y:90},{x:600,y:140},{x:650,y:260},{x:600,y:380},{x:480,y:430},{x:360,y:380},{x:250,y:470},{x:960,y:470}]
  },
  harbor: {
    name:'Porto das Sardinhas', rounds:27, startMoney:335, lives:15, hpMultiplier:1.18, speedMultiplier:1.20, rewardMultiplier:1.12, clearCoins:105, enemyDensity:1.10,
    description:'Cais estreitos e contêineres criam corredores de tiro. Mais balões por onda e uma rota que muda de direção várias vezes.',
    obstacles:[
      {x:190,y:165,r:31,type:'rock'},{x:370,y:355,r:34,type:'rock'},{x:610,y:160,r:32,type:'rock'},{x:790,y:360,r:34,type:'rock'}
    ],
    sky:['#10283a','#081a28'], ground:'#182a31', road:'#66727b', shoulder:'#2d3942',
    path:[{x:-40,y:390},{x:145,y:390},{x:145,y:250},{x:300,y:250},{x:300,y:115},{x:500,y:115},{x:555,y:300},{x:700,y:300},{x:700,y:445},{x:840,y:445},{x:840,y:240},{x:960,y:240}]
  },
  ruins: {
    name:'Ruínas do Ronrom', rounds:30, startMoney:350, lives:14, hpMultiplier:1.23, speedMultiplier:1.24, rewardMultiplier:1.16, clearCoins:125, enemyDensity:1.16,
    description:'Ruínas antigas dividem as melhores linhas de tiro. A rota faz um grande oito e exige coberturas que funcionem em mais de uma passagem.',
    obstacles:[
      {x:300,y:150,r:44,type:'rock'},{x:300,y:370,r:44,type:'rock'},{x:585,y:260,r:56,type:'rock'},{x:810,y:120,r:28,type:'rock'}
    ],
    sky:['#302b24','#171a19'], ground:'#34372b', road:'#81786a', shoulder:'#414039',
    path:[{x:-40,y:250},{x:130,y:250},{x:230,y:120},{x:410,y:120},{x:500,y:260},{x:410,y:400},{x:220,y:400},{x:165,y:300},{x:420,y:260},{x:650,y:120},{x:805,y:210},{x:760,y:390},{x:960,y:430}]
  },
  factory: {
    name:'Fábrica de Brinquedos', rounds:32, startMoney:360, lives:14, hpMultiplier:1.28, speedMultiplier:1.27, rewardMultiplier:1.18, clearCoins:140, enemyDensity:1.20,
    description:'Esteiras imaginárias, máquinas e curvas de 90°. É o mapa Mediano mais pesado e prepara o jogador para defender setores separados.',
    obstacles:[
      {x:220,y:165,r:36,type:'rock'},{x:420,y:350,r:38,type:'rock'},{x:625,y:155,r:40,type:'rock'},{x:790,y:365,r:38,type:'rock'}
    ],
    sky:['#1c2630','#10161d'], ground:'#293038', road:'#6d7378', shoulder:'#373d44',
    path:[{x:-40,y:100},{x:160,y:100},{x:160,y:310},{x:330,y:310},{x:330,y:455},{x:535,y:455},{x:535,y:235},{x:705,y:235},{x:705,y:80},{x:855,y:80},{x:855,y:330},{x:960,y:330}]
  },
  fork: {
    name:'Vale Bifurcado', rounds:24, startMoney:370, lives:14, hpMultiplier:1.26, speedMultiplier:1.26, rewardMultiplier:1.20, clearCoins:145, enemyDensity:1.20,
    description:'Mapa Difícil: duas trilhas separadas por uma cordilheira central, cada uma exigindo sua própria defesa. As 2 primeiras rodadas vêm só pela trilha de cima, as 2 seguintes só pela de baixo — a partir da rodada 5 as duas trilhas recebem balões ao mesmo tempo.',
    obstacles:[
      {x:320,y:150,r:26,type:'tree'},{x:650,y:200,r:24,type:'tree'},
      {x:340,y:380,r:26,type:'rock'},{x:660,y:330,r:24,type:'rock'},
      {x:150,y:260,r:30,type:'rock'},{x:780,y:260,r:28,type:'tree'}
    ],
    sky:['#241a3a','#120c1f'], ground:'#221a30', road:'#877aa0', shoulder:'#372c4a',
    // Duas trilhas paralelas — uma alta, uma baixa — que nunca se cruzam.
    paths:[
      [{x:-40,y:120},{x:200,y:120},{x:320,y:70},{x:520,y:70},{x:650,y:130},{x:960,y:110}],
      [{x:-40,y:420},{x:200,y:420},{x:340,y:460},{x:540,y:460},{x:660,y:400},{x:960,y:430}]
    ]
  },
  storm: {
    name:'Ponte da Tempestade', rounds:29, startMoney:350, lives:13, hpMultiplier:1.31, speedMultiplier:1.29, rewardMultiplier:1.18, clearCoins:155, enemyDensity:1.24,
    description:'Mapa Difícil: duas pontes longas atravessam a tempestade. As rotas pressionam lados opostos e os rochedos centrais reduzem as linhas de tiro cruzadas.',
    obstacles:[
      {x:270,y:255,r:38,type:'rock'},{x:450,y:255,r:42,type:'rock'},{x:630,y:255,r:38,type:'rock'},{x:810,y:255,r:34,type:'rock'}
    ],
    sky:['#151d2f','#090e18'], ground:'#1d2930', road:'#66788c', shoulder:'#303d4c',
    paths:[
      [{x:-40,y:105},{x:165,y:105},{x:285,y:165},{x:455,y:105},{x:625,y:165},{x:790,y:105},{x:960,y:150}],
      [{x:-40,y:430},{x:165,y:430},{x:285,y:365},{x:455,y:430},{x:625,y:365},{x:790,y:430},{x:960,y:390}]
    ]
  },
  blind: {
    name:'Passagem Cega', rounds:26, startMoney:300, lives:15, hpMultiplier:1.34, speedMultiplier:1.30, rewardMultiplier:0.90, clearCoins:160, enemyDensity:1.25,
    description:'Mapa Impossível: as mesmas duas trilhas paralelas do Vale Bifurcado, agora numa neblina espessa cheia de rochedos que bloqueiam a visão das torres — e com 10% menos dinheiro para trabalhar.',
    obstacles:[
      {x:250,y:100,r:36,type:'rock'},{x:420,y:190,r:34,type:'pine'},{x:560,y:110,r:32,type:'rock'},
      {x:260,y:420,r:36,type:'rock'},{x:420,y:340,r:34,type:'pine'},{x:560,y:420,r:32,type:'rock'},
      {x:850,y:260,r:40,type:'rock'}
    ],
    sky:['#232a30','#11151a'], ground:'#252c31', road:'#5c6670', shoulder:'#2e363c',
    // As mesmas duas trilhas em espírito do Vale Bifurcado, com curvas mais fechadas —
    // a neblina e os rochedos grandes é que fazem o trabalho pesado de dificultar a visão.
    paths:[
      [{x:-40,y:100},{x:150,y:100},{x:250,y:180},{x:420,y:120},{x:560,y:190},{x:700,y:110},{x:960,y:140}],
      [{x:-40,y:430},{x:150,y:430},{x:260,y:350},{x:420,y:410},{x:560,y:340},{x:700,y:420},{x:960,y:390}]
    ]
  }
};

// v0.6.6 — campo maior. Os mapas existentes foram desenhados originalmente em 920×520;
// a geometria é ampliada para 1100×620 sem alterar a lógica de posicionamento/linha de visão.
const MAP_DESIGN_W=920,MAP_DESIGN_H=520,MAP_CANVAS_W=1100,MAP_CANVAS_H=620;
const MAP_SCALE_X=MAP_CANVAS_W/MAP_DESIGN_W,MAP_SCALE_Y=MAP_CANVAS_H/MAP_DESIGN_H;
Object.values(maps).forEach(map=>{
  // Mapas de rota única usam `path`; mapas de duas rotas paralelas (Difíceis/Impossíveis)
  // usam `paths` (array de rotas) em vez disso — os dois formatos passam pelo mesmo scale.
  if(map.path)map.path=map.path.map(p=>({x:p.x*MAP_SCALE_X,y:p.y*MAP_SCALE_Y}));
  if(map.paths)map.paths=map.paths.map(onePath=>onePath.map(p=>({x:p.x*MAP_SCALE_X,y:p.y*MAP_SCALE_Y})));
  map.obstacles=(map.obstacles||[]).map(o=>({...o,x:o.x*MAP_SCALE_X,y:o.y*MAP_SCALE_Y,r:o.r*((MAP_SCALE_X+MAP_SCALE_Y)/2)}));
});

const MAP_CATEGORIES=[
  {id:'beginner',name:'Iniciantes',icon:'🌱',maps:['grove','meadow','creek','ridge','garden','toll'],description:'6 mapas de aprendizado com pressão crescente: rotas simples no começo e mais obstáculos/economia apertada perto do final.'},
  {id:'medium',name:'Medianos',icon:'🧭',maps:['harbor','canyon','ruins','factory'],description:'4 mapas com mais densidade, rotas longas, bloqueios de visão e decisões de posicionamento mais exigentes.'},
  {id:'hardmaps',name:'Difíceis',icon:'🔥',maps:['fork','storm'],description:'2 mapas de duas rotas: a defesa precisa ser dividida e pouco espaço pode ser desperdiçado.'},
  {id:'impossible',name:'Impossíveis',icon:'💀',maps:['blind'],description:'1 desafio máximo: duas rotas, neblina, visão bloqueada, menos economia e inimigos mais fortes.'}
];

const SECRET_TOWER_RULES={
  boomerang:'beginner',
  alchemist:'medium',
  chronomancer:'hardmaps',
  demonking:'impossible'
};
function categoryMasteredForProfile(p,categoryId){
  const category=MAP_CATEGORIES.find(c=>c.id===categoryId);if(!category)return false;
  return category.maps.every(mapId=>difficultyOrder.every(d=>Boolean(p.maps?.[mapId]?.cleared?.[d])));
}

// Sistema de camadas ao estilo Bloons: cada balão tem uma "cor" (1 a 6) que indica
// quantos tiros de dano-base ele aguenta. A vida real do balão pode passar de 6
// (elite/blindado/dificuldade), mas visualmente ele nunca passa da cor Preta (a última).
const TIERS=[
  {name:'Vermelho', color:'#ff5b5b', ring:'#ffb3b3'},
  {name:'Azul',      color:'#3fa9f5', ring:'#bfe3ff'},
  {name:'Verde',     color:'#3fd47a', ring:'#b8f5d0'},
  {name:'Amarelo',   color:'#ffd93f', ring:'#fff0b3'},
  {name:'Rosa',      color:'#ff7fd1', ring:'#ffd6f0'},
  {name:'Preto',     color:'#33323d', ring:'#8f8fa8'}
];
function tierIndex(hp){return Math.max(0,Math.min(TIERS.length-1,Math.ceil(hp)-1));}
function tierOf(hp){return TIERS[tierIndex(hp)];}

// map.rounds is the Normal baseline; cada dificuldade soma/subtrai rodadas via roundsDelta.
function mapRounds(mapId,diffId){
  const map=maps[mapId]||maps.grove,diff=difficulties[diffId]||difficulties.normal;
  return Math.max(8,map.rounds+(diff.roundsDelta||0));
}

const types = {
  dart:   {name:'Gatinho Dardo', icon:'🐱', role:'Versátil / 3 caminhos', special:'Possui árvore própria de upgrades: Arqueiro, Lanceiro de Fogo ou Suporte. Pode usar até 2 caminhos; um chega ao T5 e o secundário ao T3.', cost:70, unlockLevel:1, range:116, rate:.56, damage:1.55, color:'#f3bf67', fur:'#d8a56f', accent:'#f3bf67', shot:'dart'},
  frost:  {name:'Gato Gelinho', icon:'❄️', role:'Controle em área', special:'FULL AOE: a cada ataque acerta e reduz a velocidade de todos os alvos válidos dentro do alcance.', cost:95, unlockLevel:1, range:104, rate:.94, damage:.84, slow:2.0, fullAoe:true, color:'#70caea', fur:'#ffffff', accent:'#70caea', shot:'snow'},
  burst:  {name:'Gato Bombinha', icon:'💥', role:'Blindagem + área / 3 caminhos', special:'Sempre quebra blindagem (incluindo pesados e camuflados-revelados) e causa dano em área. Possui árvore própria: Barril Reforçado, Fragmentação ou Nuvem Tóxica. Pode usar até 2 caminhos; um chega ao T5 e o secundário ao T3.', cost:140, unlockLevel:1, range:138, rate:1.12, damage:3.10, splash:58, color:'#ff7180', fur:'#6f6265', accent:'#ff7180', shot:'bomb', breaksArmor:true},
  laser:  {name:'Gato Laser', icon:'🔴', role:'Ataque muito rápido / 3 caminhos', special:'Alta cadência para limpar grupos de balões comuns. Possui árvore própria: Foco de Precisão, Superaquecimento ou Grade de Plasma. Pode usar até 2 caminhos; um chega ao T5 e o secundário ao T3.', cost:175, unlockLevel:2, range:165, rate:.20, damage:.88, color:'#ff5d6c', fur:'#c99b78', accent:'#ff5d6c', shot:'laser'},
  ninja:  {name:'Gato Ninja', icon:'🥷', role:'Dano explosivo / 3 caminhos', special:'Ataques rápidos com alto dano por alvo. Possui árvore própria: Lâminas Afiadas, Kunai Envenenado ou Sombra Assassina. Pode usar até 2 caminhos; um chega ao T5 e o secundário ao T3.', cost:210, unlockLevel:4, range:112, rate:.34, damage:2.85, color:'#b58cff', fur:'#3d3b47', accent:'#b58cff', shot:'shuriken'},
  wizard: {name:'Gato Mago', icon:'✨', role:'Magia em área / 3 caminhos', special:'Projéteis mágicos com splash e controle leve. Possui árvore própria: Arcano Amplificado, Chamas Arcanas ou Runas de Fraqueza. Pode usar até 2 caminhos; um chega ao T5 e o secundário ao T3.', cost:260, unlockLevel:6, range:154, rate:.92, damage:3.20, slow:.75, splash:72, color:'#c9adff', fur:'#8e78ae', accent:'#c9adff', shot:'magic'},
  electric:{name:'Gato Volts', icon:'⚡', role:'Dano em cadeia / 3 caminhos', special:'O raio salta entre até 4 alvos próximos. Possui árvore própria: Sobrecarga, Corrente Ampliada ou Tempestade Estática. Pode usar até 2 caminhos; um chega ao T5 e o secundário ao T3.', cost:235, unlockLevel:3, range:150, rate:.82, damage:2.15, chainTargets:4, chainRadius:96, color:'#ffe66d', fur:'#c4ab72', accent:'#ffe66d', shot:'electric'},
  vine:   {name:'Gato Cipó', icon:'🌿', role:'Controle pesado', special:'Imobiliza até 3 inimigos comuns ou 1 boss por 2 segundos. Recarga começa em 6s e cai até 4s no nível máximo.', cost:225, unlockLevel:5, range:145, rate:6, minRate:4, damage:0, rootHold:true, rootDuration:2, rootCount:3, color:'#69d17d', fur:'#98775d', accent:'#69d17d', shot:'vine'},
  salmon: {name:'Gato Pescador de Salmão', icon:'🎣', role:'Farm / economia', special:'Não ataca. A cada rodada concluída, pesca salmões e gera dinheiro para a partida. Upgrades aumentam a renda.', cost:180, unlockLevel:2, range:0, rate:0, damage:0, farm:true, farmIncome:18, color:'#ff9b73', fur:'#c58b66', accent:'#72c6dd', shot:'salmon'},
  sniper: {name:'Gato Sniper', icon:'🎯', role:'Especialista / 3 caminhos', special:'Possui árvore própria: Atirador de Elite, Caçador ou Observador. O Sniper sempre enxerga Camo para si; revelar Camo para TODA a defesa passa a ser função do caminho Observador.', cost:320, unlockLevel:1, range:285, rate:1.72, damage:9.40, globalRange:true, color:'#8fe7a8', fur:'#a79072', accent:'#8fe7a8', shot:'sniper', detectsCamo:true},
  boomerang:{name:'Gato Bumerangue',icon:'🪃',role:'Perfuração / retorno',special:'Gatinho secreto. O bumerangue atravessa vários inimigos e volta causando um segundo impacto. Quanto mais evoluído, mais alvos alcança e mais forte fica o retorno.',cost:285,unlockLevel:1,secret:true,range:158,rate:.78,damage:4.15,color:'#e6a95d',fur:'#b77849',accent:'#f3c168',shot:'boomerang',boomerangTargets:3,returnMultiplier:.58},
  alchemist:{name:'Gato Alquimista',icon:'🧪',role:'Combos / dano contínuo',special:'Gatinho secreto. Alterna Veneno → Fraqueza → Explosão no mesmo alvo. No terceiro estágio detona uma área e reinicia o ciclo.',cost:345,unlockLevel:1,secret:true,range:154,rate:1.02,damage:3.35,splash:58,color:'#8be07b',fur:'#806aa2',accent:'#b7ff75',shot:'alchemist',alchemyPoison:.65,alchemyMark:.14,alchemyExplosion:1.45},
  chronomancer:{name:'Gato Cronomante',icon:'⏳',role:'Controle temporal',special:'Gatinho secreto. Marca o inimigo no tempo e, após alguns segundos, o devolve à posição em que estava. Chefões sofrem um retorno reduzido.',cost:515,unlockLevel:1,secret:true,range:176,rate:1.18,damage:5.10,slow:1.3,color:'#7fd8ff',fur:'#5d638c',accent:'#b7ecff',shot:'chronomancer',temporalDelay:3.2,slowFactor:.72},
  demonking:{name:'Gatinho Rei Demônio',icon:'👑',role:'Elite / Medo / Legião Sombria / 3 caminhos',special:'Secreto do modo Impossível. Unidade de fim de jogo com árvore própria: Senhor do Medo, Chamas do Abismo ou Legião Sombria. Pode usar até 2 caminhos; um chega ao T5 e o secundário ao T3. Espalha Medo, causa dano em área e invoca Balões Sombrios aliados.',cost:650,unlockLevel:1,secret:true,limit:1,range:176,rate:.95,damage:7.80,splash:86,color:'#a64dff',fur:'#211b2b',accent:'#d45cff',shot:'demonking',burn:{damage:1.35,interval:1,ticks:5},fearInterval:10,fearRadius:166,fearBack:60,fearVuln:.18,fearDuration:5.5,shadowCap:10,shadowDamageMult:1.1,shadowSpawnCount:1}
};

const HEROES = {
  king:{
    name:'Rei Bigodes', icon:'👑', role:'Comandante / suporte', cost:500, color:'#f2cf62', fur:'#d9a873', accent:'#f2cf62',
    range:145, rate:.92, damage:2.60, auraRange:172,
    passive:'Comando Real: gatinhos dentro da aura recebem +10% Range e +10% velocidade de ataque.',
    skill:{name:'Ordem Real',icon:'📯',cooldown:28,description:'Por 8s, gatinhos dentro da aura recebem +25% dano e +25% velocidade de ataque.'},
    ultimate:{name:'Decreto da Coroa',icon:'👑',cooldown:55,description:'Por 10s, TODA a defesa recebe +20% dano, +20% Range e +20% velocidade de ataque.'}
  },
  warrior:{
    name:'Miaurício', icon:'⚔️', role:'Guerreiro / dano', cost:450, color:'#ff8b63', fur:'#b36f52', accent:'#ffcf8a',
    range:112, rate:.58, damage:4.40,
    passive:'Instinto de Execução: ataques causam 2,5× dano em inimigos comuns abaixo de 12% da vida.',
    skill:{name:'Golpe Heroico',icon:'🗡️',cooldown:22,description:'Ataca o inimigo mais forte no alcance causando 5× o dano atual.'},
    ultimate:{name:'Mil Cortes',icon:'⚔️',cooldown:48,description:'Quatro cortes em todos os inimigos no alcance, cada um causando 125% do dano atual.'}
  },
  luna:{
    name:'Luna', icon:'🌙', role:'Feiticeira / controle', cost:525, color:'#b58cff', fur:'#73628f', accent:'#d7c2ff',
    range:178, rate:1.02, damage:2.15, detectsCamo:true,
    passive:'Maldição Lunar: cada ataque desacelera o alvo e o deixa 10% mais vulnerável por alguns segundos.',
    skill:{name:'Passo Lunar',icon:'🌙',cooldown:25,description:'Empurra até 3 inimigos fortes no alcance para trás na rota.'},
    ultimate:{name:'Eclipse Total',icon:'🌑',cooldown:52,description:'Por 8s, todos os inimigos ficam extremamente lentos e recebem +25% de dano de toda a defesa.'}
  },
  merchant:{
    name:'Dom Salmão', icon:'💰', role:'Mercador / economia', cost:400, color:'#ffcf8a', fur:'#c58b66', accent:'#72c6dd',
    range:0, rate:0, damage:0, auraRange:185, farm:true,
    passive:'Mercado de Peixes: Pescadores próximos recebem +20% de renda e Dom Salmão gera dinheiro ao fim de cada rodada.',
    skill:{name:'Barganha Real',icon:'🤝',cooldown:35,description:'Gera dinheiro instantaneamente para a partida.'},
    ultimate:{name:'Tesouro Real',icon:'💎',cooldown:65,description:'Gera um grande tesouro e dobra a renda dos Pescadores nas próximas 2 rodadas concluídas.'}
  }
};

// v0.27.0 — Playtest & Balance. Inclui painel F8 para medir a partida sem alterar o balanceamento.
// v0.26.0 — Sinergias dos Gatinhos. A sinergia só existe enquanto TODOS os participantes
// necessários estão realmente em campo. O objetivo é criar interações de comportamento,
// não apenas empilhar bônus numéricos genéricos.
const SYNERGIES={
  frozenCircuit:{icon:'❄️⚡',name:'Tempestade Congelante',towers:['frost','electric'],description:'Volts atingindo inimigos desacelerados pelo Gelinho descarrega uma explosão elétrica gelada em área.'},
  silentHunt:{icon:'🎯🥷',name:'Caçada Silenciosa',towers:['sniper','ninja'],description:'Ninja causa +50% de dano em alvos que estejam marcados especificamente por um Sniper.'},
  improvisedArtillery:{icon:'🐱💥',name:'Artilharia Improvisada',towers:['dart','burst'],description:'Bombinha deixa pólvora nos alvos; o próximo acerto de Dardo consome a pólvora e espalha estilhaços ao redor.'},
  enchantedForest:{icon:'🌿✨',name:'Floresta Encantada',towers:['vine','wizard'],description:'Magias lançadas contra inimigos presos pelo Cipó florescem em uma explosão arcana ao redor do alvo.'},
  fishMarket:{icon:'🎣💰',name:'Mercado de Peixes',towers:['salmon'],hero:'merchant',description:'A cada 5 rodadas concluídas, Pescadores + Dom Salmão realizam um Festival do Salmão e ganham +35% de renda naquele pagamento.'},
  plasmaCatalyst:{icon:'🔴🧪',name:'Catalisador de Plasma',towers:['laser','alchemist'],description:'Quatro acertos de Laser em um alvo preparado pelo Alquimista detonam uma reação química em área.'},
  arcaneParadox:{icon:'✨⏳',name:'Paradoxo Arcano',towers:['wizard','chronomancer'],description:'Magias acumulam energia em alvos marcados no tempo; quando o rewind acontece, a energia explode no ponto de retorno.'},
  glacialReturn:{icon:'🪃❄️',name:'Retorno Glacial',towers:['boomerang','frost'],description:'A volta do Bumerangue causa +35% de dano em inimigos desacelerados e reforça a lentidão por um instante.'}
};

function heroPrice(heroId,mapId){
  const hero=HEROES[heroId]||HEROES.king;
  return Math.max(1,Math.round(hero.cost*towerPriceMultiplier(mapId)));
}

const DART_MAX_TIER = 5;
const DART_SECONDARY_MAX = 3;
// v0.13.0 — preço-base dos gatinhos varia pelo TIER DO MAPA.
// Iniciantes -10%, Medianos = preço normal, Difíceis +10%, Impossíveis +20%.
// A dificuldade escolhida dentro do mapa (Fácil/Normal/Difícil) continua afetando ondas/economia,
// mas NÃO duplica este multiplicador.
const TOWER_PRICE_BY_CATEGORY = {beginner:.90, medium:1.00, hardmaps:1.10, impossible:1.20};

function mapCategoryForMap(mapId){
  return MAP_CATEGORIES.find(c=>c.maps.includes(mapId))||MAP_CATEGORIES[0];
}
function towerPriceMultiplier(mapId){
  const category=mapCategoryForMap(mapId);
  return TOWER_PRICE_BY_CATEGORY[category.id]||1;
}
function towerPrice(typeId,mapId){
  const base=types[typeId];
  if(!base)return 0;
  return Math.max(1,Math.round(base.cost*towerPriceMultiplier(mapId)));
}
function towerPriceDeltaLabel(mapId){
  const pct=Math.round((towerPriceMultiplier(mapId)-1)*100);
  return pct===0?'preço normal':`${pct>0?'+':''}${pct}% no preço`;
}

const DART_PATHS = [
  {
    id:'bow', icon:'🏹', name:'Arqueiro', color:'#f3bf67',
    tiers:[
      {name:'Bandana de Caça', cost:45, description:'+dano e +alcance. O Dardo recebe uma bandana.'},
      {name:'Arco Felino', cost:85, description:'Troca o dardo por arco. Ataca mais rápido e a flecha salta em cadeia; dano-base 2.'},
      {name:'Flecha Reforçada', cost:145, description:'+alcance e +1 de dano (3 de dano-base no arco).'},
      {name:'Flechas Gêmeas', cost:260, description:'Dispara 2 flechas por ataque.'},
      {name:'Mestre Arqueiro', cost:430, description:'+velocidade de ataque e +alcance.'}
    ]
  },
  {
    id:'spear', icon:'🔥', name:'Lanceiro', color:'#ff8b63',
    tiers:[
      {name:'Olhos de Caçador', cost:40, description:'+alcance.'},
      {name:'Visão Camuflada', cost:80, description:'Passa a enxergar Camo e recebe mais alcance.'},
      {name:'Lança Pesada', cost:165, description:'Usa uma lança: 4 de dano bruto na cadência do Dardo normal.'},
      {name:'Lança Brutal', cost:285, description:'+2 de dano e +alcance (6 de dano-base).'},
      {name:'Lança de Fogo', cost:465, description:'6 de dano + Burn: 1 de dano a cada 2s por 4 ticks.'}
    ]
  },
  {
    id:'support', icon:'🐟', name:'Suporte', color:'#6fd7a1',
    tiers:[
      {name:'Comando Felino', cost:55, description:'+alcance próprio e +10% de dano aos gatinhos próximos.'},
      {name:'Salmão Extra', cost:100, description:'+15% na renda dos Pescadores de Salmão próximos.'},
      {name:'Olho de Equipe', cost:175, description:'+10% de alcance aos gatinhos próximos.'},
      {name:'Ritmo de Batalha', cost:315, description:'+10% de velocidade de ataque aos gatinhos próximos.'},
      {name:'Banquete da Tropa', cost:520, description:'Salmão sobe para +30%; dano/range/velocidade passam a +15%.'}
    ]
  }
];

const SNIPER_MAX_TIER = 5;
const SNIPER_SECONDARY_MAX = 3;
const SNIPER_PATHS = [
  {
    id:'elite', icon:'🎯', name:'Atirador de Elite', color:'#ffd36b',
    tiers:[
      {name:'Munição Magnum', cost:130, description:'+3 de dano bruto por disparo.'},
      {name:'Projétil Perfurante', cost:220, description:'+3 de dano e o tiro atravessa até 2 inimigos.'},
      {name:'Mira Crítica', cost:360, description:'20% de crítico (2× dano) e perfuração sobe para 3 alvos.'},
      {name:'Canhão de Precisão', cost:620, description:'+6 de dano, 30% de crítico (2,5×) e atravessa até 4 alvos.'},
      {name:'Atirador Supremo', cost:980, description:'+8 de dano, +20% velocidade, 40% de crítico (3×) e atravessa até 6 alvos.'}
    ]
  },
  {
    id:'hunter', icon:'🥷', name:'Caçador', color:'#c58cff',
    tiers:[
      {name:'Olhos na Sombra', cost:115, description:'+35% de dano contra Camo e inimigos especiais.'},
      {name:'Caça de Elite', cost:210, description:'+50% contra especiais e +15% contra Boss.'},
      {name:'Marca do Caçador', cost:390, description:'Cada acerto marca o alvo por 6s: ele recebe +15% de dano de TODA a defesa.'},
      {name:'Munição Anti-Couraça', cost:680, description:'Passa a quebrar blindagem; +75% contra especiais, +30% contra Boss e marca +25%.'},
      {name:'Predador de Chefões', cost:1080, description:'+100% contra especiais, +75% contra Boss e marca +35% por 8s.'}
    ]
  },
  {
    id:'observer', icon:'🛰️', name:'Observador', color:'#70caea',
    tiers:[
      {name:'Telêmetro Global', cost:120, description:'Todos os gatinhos recebem +5% de range.'},
      {name:'Radar de Camuflagem', cost:230, description:'Camo avistado pelo Sniper fica revelado para TODA a defesa.'},
      {name:'Coordenadas Precisas', cost:410, description:'Buff global sobe para +10% range e +5% dano de precisão.'},
      {name:'Designador de Alvos', cost:720, description:'Acertos marcam o alvo por 5s (+15% dano recebido) e precisão global sobe para +7% dano.'},
      {name:'Comando Aéreo', cost:1180, description:'+15% range, +10% dano global e chama um avião a cada 2 rodadas OU 25s de combate para bombardear o inimigo mais forte.'}
    ]
  }
];

const FROST_MAX_TIER = 5;
const FROST_SECONDARY_MAX = 3;
const FROST_PATHS = [
  {
    id:'blizzard', icon:'🌨️', name:'Nevasca', color:'#eaf7ff',
    tiers:[
      {name:'Rajada Gelada', cost:50, description:'+dano em cada ataque (o Gelinho continua acertando todos os alvos válidos no alcance).'},
      {name:'Nevasca Intensa', cost:95, description:'+dano e +alcance.'},
      {name:'Explosão de Gelo', cost:160, description:'+dano; inimigos que já estavam lentos recebem +25% de dano deste ataque.'},
      {name:'Avalanche', cost:280, description:'+dano considerável e cadência mais rápida.'},
      {name:'Nevasca Absoluta', cost:460, description:'Dano no máximo; um alvo já lento é congelado quase por completo por 1s a cada acerto.'}
    ]
  },
  {
    id:'gale', icon:'💨', name:'Ventania Ártica', color:'#c9f0ff',
    tiers:[
      {name:'Correntes de Vento', cost:45, description:'+alcance.'},
      {name:'Rajada Contínua', cost:85, description:'Ataca mais rápido.'},
      {name:'Vórtice Gélido', cost:150, description:'+alcance; cada alvo atingido fica marcado (+12% de dano recebido de TODA a defesa por alguns segundos).'},
      {name:'Ventania Total', cost:265, description:'+alcance considerável e mais velocidade de ataque.'},
      {name:'Olho da Tempestade', cost:440, description:'Alcance cobre praticamente o mapa inteiro e a marca sobe para +20% de dano.'}
    ]
  },
  {
    id:'heart', icon:'🧊', name:'Coração Glacial', color:'#8fd9ef',
    tiers:[
      {name:'Gelo Espesso', cost:45, description:'A lentidão dura mais tempo.'},
      {name:'Frio Penetrante', cost:85, description:'A lentidão fica mais forte (o inimigo anda mais devagar do que antes).'},
      {name:'Núcleo Congelante', cost:150, description:'Lentidão ainda mais forte e mais duradoura.'},
      {name:'Estase', cost:265, description:'Inimigos atingidos ficam quase parados enquanto durar o efeito.'},
      {name:'Pulso Glacial', cost:440, description:'Cada acerto imobiliza quase por completo — a linha de frente praticamente para.'}
    ]
  }
];

const VINE_MAX_TIER = 5;
const VINE_SECONDARY_MAX = 3;
const VINE_PATHS = [
  {
    id:'roots', icon:'🌱', name:'Raízes Profundas', color:'#8fd69a',
    tiers:[
      {name:'Raízes Longas', cost:70, description:'A prisão dura mais tempo.'},
      {name:'Enraizamento Amplo', cost:130, description:'Prende +1 inimigo comum por vez (ou continua prendendo 1 Boss sozinho).'},
      {name:'Garras da Selva', cost:220, description:'+duração da prisão e recarrega mais rápido.'},
      {name:'Floresta Prendedora', cost:380, description:'Prende ainda mais inimigos comuns de uma vez e +duração.'},
      {name:'Domínio da Selva', cost:600, description:'Prende um grupo bem maior, por mais tempo, com a recarga mais curta possível.'}
    ]
  },
  {
    id:'thorns', icon:'☠️', name:'Espinhos Venenosos', color:'#8bd15a',
    tiers:[
      {name:'Espinhos', cost:70, description:'Quem fica preso sofre um veneno leve enquanto dura a prisão.'},
      {name:'Seiva Tóxica', cost:130, description:'+dano do veneno.'},
      {name:'Toxina Concentrada', cost:220, description:'O veneno tica mais vezes e mais rápido.'},
      {name:'Praga Verde', cost:380, description:'+dano do veneno bem mais forte.'},
      {name:'Floração Mortal', cost:600, description:'Veneno no auge: dano máximo, tica muitas vezes enquanto o inimigo estiver preso.'}
    ]
  },
  {
    id:'wild', icon:'🥀', name:'Vinha Selvagem', color:'#c9a6ff',
    tiers:[
      {name:'Vinhas Fracas', cost:70, description:'Quem fica preso recebe +dano de TODA a defesa por alguns segundos.'},
      {name:'Amarras Sufocantes', cost:130, description:'+dano recebido enquanto marcado.'},
      {name:'Estrangulamento', cost:220, description:'+dano recebido e a marca dura mais.'},
      {name:'Vinha Predatória', cost:380, description:'+dano recebido bem mais alto e marca ainda mais duradoura.'},
      {name:'Fúria da Selva', cost:600, description:'Quem é preso pelo Cipó fica extremamente vulnerável ao resto da defesa.'}
    ]
  }
];

const BURST_MAX_TIER = 5;
const BURST_SECONDARY_MAX = 3;
const BURST_PATHS = [
  {
    id:'barrels', icon:'💣', name:'Barril Reforçado', color:'#ffb26b',
    tiers:[
      {name:'Barril Reforçado', cost:60, description:'+dano e +raio da explosão.'},
      {name:'Carga Dupla', cost:115, description:'+dano e +raio da explosão, de novo.'},
      {name:'Casco de Aço', cost:195, description:'+raio da explosão e recarrega mais rápido.'},
      {name:'Bomba Sísmica', cost:340, description:'+dano considerável, +raio da explosão e ainda mais rápido para recarregar.'},
      {name:'Barril Colossal', cost:560, description:'Explosão no tamanho e dano máximos, com a recarga mais rápida do caminho.'}
    ]
  },
  {
    id:'frag', icon:'🔥', name:'Fragmentação', color:'#ff5f4d',
    tiers:[
      {name:'Estilhaços em Chamas', cost:60, description:'Quem é atingido pega fogo e sofre dano contínuo leve; recarrega um pouco mais rápido.'},
      {name:'Napalm Leve', cost:115, description:'+dano do fogo.'},
      {name:'Barril Incendiário', cost:195, description:'+dano do fogo, tica mais vezes e recarrega mais rápido.'},
      {name:'Inferno Compacto', cost:340, description:'+dano do fogo bem mais forte e recarrega ainda mais rápido.'},
      {name:'Chuva de Estilhaços', cost:560, description:'Fogo no auge: dano alto, tica muitas vezes, além de +dano no impacto direto.'}
    ]
  },
  {
    id:'toxic', icon:'☣️', name:'Nuvem Tóxica', color:'#b6e66a',
    tiers:[
      {name:'Gás Lacrimogêneo', cost:60, description:'O impacto direto deixa o alvo mais lento por um tempo.'},
      {name:'Névoa Corrosiva', cost:115, description:'O alvo atingido fica marcado e recebe mais dano de TODA a defesa por alguns segundos.'},
      {name:'Gás Mostarda', cost:195, description:'A lentidão fica bem mais forte e dura mais.'},
      {name:'Nuvem Densa', cost:340, description:'Lentidão e marca mais fortes e mais duradouras.'},
      {name:'Zona Morta', cost:560, description:'O alvo atingido quase para no lugar e fica extremamente vulnerável ao resto da defesa.'}
    ]
  }
];

const NINJA_MAX_TIER = 5;
const NINJA_SECONDARY_MAX = 3;
const NINJA_PATHS = [
  {
    id:'blades', icon:'🗡️', name:'Lâminas Afiadas', color:'#dcdcec',
    tiers:[
      {name:'Lâminas Afiadas', cost:70, description:'Ataques mais rápidos e um pouco mais de dano.'},
      {name:'Kit de Arremesso', cost:130, description:'+dano e +alcance.'},
      {name:'Reflexos de Sombra', cost:225, description:'+dano e ainda mais velocidade de ataque.'},
      {name:'Fúria Silenciosa', cost:440, description:'+dano considerável, +alcance e mais velocidade de ataque.'},
      {name:'Tempestade de Lâminas', cost:700, description:'Dano e velocidade de ataque no máximo — praticamente uma chuva de shurikens.'}
    ]
  },
  {
    id:'poison', icon:'🧪', name:'Kunai Envenenado', color:'#8fd15a',
    tiers:[
      {name:'Kunai Envenenado', cost:70, description:'O alvo atingido diretamente sofre veneno leve.'},
      {name:'Veneno Reforçado', cost:130, description:'+dano do veneno.'},
      {name:'Lâminas Corrosivas', cost:225, description:'+dano do veneno, tica mais vezes e mais rápido; recarrega um pouco mais rápido.'},
      {name:'Toxina Mortal', cost:390, description:'+dano do veneno bem mais forte.'},
      {name:'Veneno Ancestral', cost:620, description:'Veneno no auge, tica muitas vezes, além de +dano no impacto direto.'}
    ]
  },
  {
    id:'shadow', icon:'🌑', name:'Sombra Assassina', color:'#8a7fae',
    tiers:[
      {name:'Olhos na Escuridão', cost:70, description:'O Ninja passa a enxergar inimigos Camuflados.'},
      {name:'Golpe Certeiro', cost:130, description:'+dano contra inimigos especiais (Camuflado, Blindado, Rápido, Regenerador, Elite).'},
      {name:'Marca da Sombra', cost:225, description:'Cada acerto marca o alvo por alguns segundos: ele recebe mais dano de TODA a defesa.'},
      {name:'Caçador Noturno', cost:390, description:'+dano contra especiais e contra Boss; a marca fica mais forte.'},
      {name:'Lâmina Fantasma', cost:620, description:'Passa a quebrar blindagem; dano máximo contra especiais e Boss, e a marca no auge.'}
    ]
  }
];

const LASER_MAX_TIER = 5;
const LASER_SECONDARY_MAX = 3;
const LASER_PATHS = [
  {
    id:'focus', icon:'🔴', name:'Foco de Precisão', color:'#ff8f8f',
    tiers:[
      {name:'Foco de Precisão', cost:55, description:'+dano e dispara mais rápido.'},
      {name:'Lente Refinada', cost:100, description:'+dano e dispara ainda mais rápido.'},
      {name:'Emissor Duplo', cost:170, description:'+dano e mais velocidade de disparo.'},
      {name:'Núcleo Instável', cost:340, description:'+dano considerável e mais velocidade de disparo.'},
      {name:'Raio Contínuo', cost:620, description:'Dano e cadência no máximo — quase um feixe contínuo.'}
    ]
  },
  {
    id:'overheat', icon:'♨️', name:'Superaquecimento', color:'#ff9d5c',
    tiers:[
      {name:'Superaquecimento', cost:55, description:'O alvo atingido diretamente sofre queimadura leve.'},
      {name:'Feixe Térmico', cost:100, description:'+dano da queimadura.'},
      {name:'Overdrive', cost:170, description:'+dano da queimadura, tica mais vezes e mais rápido; dispara mais rápido.'},
      {name:'Fusão Parcial', cost:300, description:'+dano da queimadura bem mais forte.'},
      {name:'Plasma Ardente', cost:500, description:'Queimadura no auge, tica muitas vezes, além de +dano no impacto direto.'}
    ]
  },
  {
    id:'grid', icon:'🔷', name:'Grade de Plasma', color:'#7ee0ff',
    tiers:[
      {name:'Grade de Plasma', cost:55, description:'O raio passa a saltar para um segundo alvo próximo.'},
      {name:'Condutor Amplo', cost:100, description:'O salto alcança alvos um pouco mais distantes.'},
      {name:'Tripla Descarga', cost:170, description:'O raio salta para um terceiro alvo.'},
      {name:'Grade Expandida', cost:320, description:'Salta para mais um alvo (4 no total) e alcança mais longe.'},
      {name:'Grade de Plasma Total', cost:580, description:'O salto alcança bem mais longe e ganha +dano no impacto — cada um dos 4 alvos continua recebendo o dano cheio, sem redução.'}
    ]
  }
];

const WIZARD_MAX_TIER = 5;
const WIZARD_SECONDARY_MAX = 3;
const WIZARD_PATHS = [
  {
    id:'arcane', icon:'✨', name:'Arcano Amplificado', color:'#d9c4ff',
    tiers:[
      {name:'Arcano Amplificado', cost:85, description:'+dano e +raio da explosão mágica.'},
      {name:'Prisma de Poder', cost:150, description:'+dano e +raio da explosão, de novo.'},
      {name:'Ressonância', cost:260, description:'+dano e dispara mais rápido.'},
      {name:'Convergência', cost:440, description:'+dano considerável, +raio da explosão e mais velocidade de disparo.'},
      {name:'Explosão Cósmica', cost:720, description:'Dano e raio da explosão no máximo do caminho.'}
    ]
  },
  {
    id:'flame', icon:'🔥', name:'Chamas Arcanas', color:'#ffb26b',
    tiers:[
      {name:'Chamas Arcanas', cost:85, description:'O alvo atingido diretamente pega fogo mágico.'},
      {name:'Fogo Fátuo', cost:150, description:'+dano do fogo.'},
      {name:'Combustão', cost:260, description:'+dano do fogo, tica mais vezes; dispara mais rápido.'},
      {name:'Inferno Arcano', cost:440, description:'+dano do fogo bem mais forte.'},
      {name:'Chamas Eternas', cost:720, description:'Fogo no auge, tica muitas vezes, além de +dano no impacto direto.'}
    ]
  },
  {
    id:'runes', icon:'🔮', name:'Runas de Fraqueza', color:'#9fe0d0',
    tiers:[
      {name:'Runa de Fraqueza', cost:85, description:'O alvo atingido fica marcado e recebe mais dano de TODA a defesa por alguns segundos.'},
      {name:'Grimório Gélido', cost:150, description:'A lentidão do Mago fica mais forte.'},
      {name:'Marca Arcana', cost:260, description:'+dano recebido pela marca; a lentidão dura mais.'},
      {name:'Selo do Vazio', cost:440, description:'Lentidão ainda mais forte e marca mais duradoura.'},
      {name:'Colapso Dimensional', cost:720, description:'O alvo atingido quase para no lugar e fica extremamente vulnerável ao resto da defesa.'}
    ]
  }
];

const ELECTRIC_MAX_TIER = 5;
const ELECTRIC_SECONDARY_MAX = 3;
const ELECTRIC_PATHS = [
  {
    id:'overload', icon:'⚡', name:'Sobrecarga', color:'#fff0a0',
    tiers:[
      {name:'Sobrecarga', cost:75, description:'+dano do raio.'},
      {name:'Amperagem Alta', cost:140, description:'+dano e dispara mais rápido.'},
      {name:'Núcleo Voltaico', cost:240, description:'+dano e mais velocidade de disparo.'},
      {name:'Descarga Bruta', cost:410, description:'+dano considerável e mais velocidade de disparo.'},
      {name:'Tempestade Voltaica', cost:660, description:'Dano e cadência no máximo do caminho.'}
    ]
  },
  {
    id:'chain', icon:'🔗', name:'Corrente Ampliada', color:'#ffd76b',
    tiers:[
      {name:'Corrente Ampliada', cost:75, description:'O raio alcança alvos um pouco mais distantes.'},
      {name:'Elo Extra', cost:140, description:'O raio salta para +1 alvo e alcança mais longe.'},
      {name:'Condutor Reforçado', cost:240, description:'Alcança bem mais longe; dispara mais rápido.'},
      {name:'Malha Elétrica', cost:410, description:'O raio salta para +1 alvo e alcança ainda mais longe.'},
      {name:'Rede Total', cost:660, description:'O raio salta para +2 alvos, alcançando o máximo, além de +dano no impacto direto.'}
    ]
  },
  {
    id:'static', icon:'🌩️', name:'Tempestade Estática', color:'#b6a4ff',
    tiers:[
      {name:'Estática Residual', cost:75, description:'Todo alvo atingido pelo raio fica marcado e recebe mais dano de TODA a defesa por alguns segundos.'},
      {name:'Choque Prolongado', cost:140, description:'+dano recebido pela marca.'},
      {name:'Campo Eletrizado', cost:240, description:'+dano recebido e a marca dura mais; o raio alcança um pouco mais longe.'},
      {name:'Paralisia Parcial', cost:410, description:'Todo alvo atingido também fica mais lento por um instante; marca mais forte.'},
      {name:'Tempestade Estática', cost:660, description:'A lentidão e a marca chegam ao auge em todos os alvos atingidos pelo raio.'}
    ]
  }
];


const DEMONKING_MAX_TIER = 5;
const DEMONKING_SECONDARY_MAX = 3;
const DEMONKING_PATHS = [
  {
    id:'dread', icon:'😨', name:'Senhor do Medo', color:'#ff7ad9',
    tiers:[
      {name:'Aura Pavorosa', cost:120, description:'A aura de Medo ativa mais rápido e empurra mais os inimigos.'},
      {name:'Terror Crescente', cost:210, description:'Mais raio e duração para o Medo.'},
      {name:'Pânico Coletivo', cost:340, description:'Inimigos amedrontados recebem muito mais dano.'},
      {name:'Pesadelo Vivo', cost:540, description:'O Medo passa a cobrir uma grande área e recarrega muito mais rápido.'},
      {name:'Imperador do Pavor', cost:860, description:'Ápice do controle: a aura fica enorme, muito frequente e extremamente opressiva.'}
    ]
  },
  {
    id:'abyss', icon:'🔥', name:'Chamas do Abismo', color:'#ff8a63',
    tiers:[
      {name:'Brasa Sombria', cost:120, description:'Mais dano direto e fogo sombrio mais forte.'},
      {name:'Labareda Cruel', cost:210, description:'Maior splash e mais ticks de queimadura.'},
      {name:'Fornalha Maldita', cost:340, description:'Ataca mais rápido e queima com mais intensidade.'},
      {name:'Inferno Negro', cost:540, description:'Grande salto no dano em área e no fogo.'},
      {name:'Cataclismo Abissal', cost:860, description:'Pico ofensivo: dano brutal, explosão enorme e fogo devastador.'}
    ]
  },
  {
    id:'legion', icon:'🌑', name:'Legião Sombria', color:'#b88cff',
    tiers:[
      {name:'Sombra Desperta', cost:120, description:'Aumenta o limite de sombras invocadas.'},
      {name:'Eco do Submundo', cost:210, description:'Sombras causam mais dano.'},
      {name:'Chamado das Trevas', cost:340, description:'Cada inimigo morto amedrontado pode invocar sombras extras.'},
      {name:'Horda Espectral', cost:540, description:'A legião cresce bastante e as sombras ficam ainda mais fortes.'},
      {name:'Exército do Abismo', cost:860, description:'Ápice da invocação: muitas sombras, muito mais dano e reforço contra chefes.'}
    ]
  }
];

const powers = {
  frenzy:{name:'Patinhas Frenéticas',icon:'⚡',cost:70,duration:10,description:'Todas as torres atacam 2× mais rápido por 10 segundos.',effect:'attackSpeed'},
  focus:{name:'Instinto Predador',icon:'🔥',cost:85,duration:10,description:'Todas as torres causam 2× de dano por 10 segundos.',effect:'damage'},
  blizzard:{name:'Nevasca Felina',icon:'🌨️',cost:65,duration:8,description:'Todos os inimigos ficam com 35% da velocidade por 8 segundos.',effect:'slow'},
  cash:{name:'Cofre de Sardinhas',icon:'💰',cost:45,duration:0,description:'Receba +$350 imediatamente dentro da partida.',effect:'cash'},
  heal:{name:'Nove Vidas',icon:'❤️‍🩹',cost:55,duration:0,description:'Recupera até 6 vidas perdidas no mapa atual.',effect:'heal'}
};

const skins = {
  elvenMage:{
    name:'Gata Maga Élfica',icon:'🧝‍♀️',tower:'wizard',cost:0,
    description:'Visual experimental do Gato Mago com pelagem clara, cabelos prateados, traje verde-petróleo e magia azul-dourada.'
  }
};

const DEFAULT_PROFILE = {
  version:15,
  coins:250,
  selectedHero:'king',
  secretUnlocks:{boomerang:false,alchemist:false,chronomancer:false,demonking:false},
  level:1,
  xp:0,
  mastery:{
    dart:{level:1,xp:0,maxRewardClaimed:false}, frost:{level:1,xp:0,maxRewardClaimed:false}, burst:{level:1,xp:0,maxRewardClaimed:false},
    laser:{level:1,xp:0,maxRewardClaimed:false}, ninja:{level:1,xp:0,maxRewardClaimed:false}, wizard:{level:1,xp:0,maxRewardClaimed:false},
    electric:{level:1,xp:0,maxRewardClaimed:false}, vine:{level:1,xp:0,maxRewardClaimed:false}, salmon:{level:1,xp:0,maxRewardClaimed:false}, sniper:{level:1,xp:0,maxRewardClaimed:false},
    boomerang:{level:1,xp:0,maxRewardClaimed:false}, alchemist:{level:1,xp:0,maxRewardClaimed:false}, chronomancer:{level:1,xp:0,maxRewardClaimed:false}, demonking:{level:1,xp:0,maxRewardClaimed:false}
  },
  maps:Object.fromEntries(Object.keys(maps).map(id=>[id,{cleared:{easy:false,normal:false,hard:false},wins:0}])),
  inventory:{frenzy:1,focus:0,blizzard:0,cash:0,heal:0},
  ownedSkins:{},
  equippedSkins:{},
  settings:{volume:.65,musicVolume:.35,uiScale:1},
  matchTutorialSeen:false,
  infiniteBest:Object.fromEntries(Object.keys(maps).map(id=>[id,{easy:0,normal:0,hard:0}]))
};

function cloneDefaultProfile(){ return JSON.parse(JSON.stringify(DEFAULT_PROFILE)); }
function requiredXp(level){ return Math.round(100*Math.pow(1.30,Math.max(0,level-1))); }

function normalizeProfile(saved){
  const p=cloneDefaultProfile();
  if(!saved||typeof saved!=='object') return p;
  p.coins=Number.isFinite(Number(saved.coins))?Math.max(0,Math.floor(Number(saved.coins))):p.coins;
  p.level=Math.max(1,Math.floor(Number(saved.level)||1));
  p.xp=Math.max(0,Math.floor(Number(saved.xp)||0));
  p.selectedHero=(saved.selectedHero&&HEROES[saved.selectedHero])?saved.selectedHero:'king';
  for(const id of Object.keys(p.maps)){
    const src=saved.maps&&saved.maps[id];
    if(!src) continue;
    p.maps[id].wins=Math.max(0,Math.floor(Number(src.wins)||0));
    if(src.cleared){
      for(const d of difficultyOrder) p.maps[id].cleared[d]=Boolean(src.cleared[d]);
    }else if(src.stars!=null){
      const oldStars=Math.max(0,Math.min(3,Number(src.stars)||0));
      difficultyOrder.forEach((d,i)=>p.maps[id].cleared[d]=i<oldStars);
    }
  }
  for(const id of Object.keys(p.secretUnlocks)){
    p.secretUnlocks[id]=Boolean(saved.secretUnlocks&&saved.secretUnlocks[id]);
    if(categoryMasteredForProfile(p,SECRET_TOWER_RULES[id]))p.secretUnlocks[id]=true;
  }
  for(const id of Object.keys(p.inventory)){
    if(saved.inventory&&saved.inventory[id]!=null) p.inventory[id]=Math.max(0,Math.floor(Number(saved.inventory[id])||0));
  }
  for(const id of Object.keys(skins))p.ownedSkins[id]=Boolean(saved.ownedSkins&&saved.ownedSkins[id]);
  for(const towerId of Object.keys(types)){
    const skinId=saved.equippedSkins&&saved.equippedSkins[towerId];
    if(skinId&&skins[skinId]?.tower===towerId&&p.ownedSkins[skinId])p.equippedSkins[towerId]=skinId;
  }
  if(saved.settings&&saved.settings.volume!=null){
    p.settings.volume=Math.max(0,Math.min(1,Number(saved.settings.volume)||0));
  }
  if(saved.settings&&saved.settings.musicVolume!=null){
    p.settings.musicVolume=Math.max(0,Math.min(1,Number(saved.settings.musicVolume)||0));
  }
  if(saved.settings&&saved.settings.uiScale!=null){
    p.settings.uiScale=Math.max(.7,Math.min(1.4,Number(saved.settings.uiScale)||1));
  }
  if(saved.infiniteBest){
    for(const mapId of Object.keys(p.infiniteBest)){
      for(const d of difficultyOrder){
        p.infiniteBest[mapId][d]=Math.max(0,Math.floor(Number(saved.infiniteBest?.[mapId]?.[d])||0));
      }
    }
  }
  if(saved.mastery){
    for(const id of Object.keys(p.mastery)){
      const src=saved.mastery[id];if(!src)continue;
      p.mastery[id].level=Math.max(1,Math.min(50,Math.floor(Number(src.level)||1)));
      p.mastery[id].xp=p.mastery[id].level>=50?0:Math.max(0,Math.floor(Number(src.xp)||0));
      p.mastery[id].maxRewardClaimed=Boolean(src.maxRewardClaimed||p.mastery[id].level>=50);
    }
  }
  if('matchTutorialSeen' in saved){
    p.matchTutorialSeen=Boolean(saved.matchTutorialSeen);
  }else{
    // Save antigo, de antes deste campo existir: se já tem progresso real, não é a
    // primeira partida do jogador — não mostra o tutorial guiado para quem já joga.
    const experienced=p.level>1||p.xp>0||totalWinsOf(p)||Object.values(p.mastery).some(m=>m.level>1||m.xp>0);
    p.matchTutorialSeen=experienced;
  }
  return p;
}
function totalWinsOf(p){ return Object.values(p.maps).some(m=>(m.wins||0)>0||Object.values(m.cleared).some(Boolean)); }

function loadProfile(){
  try{
    const current=localStorage.getItem(SAVE_KEY);
    if(current) return normalizeProfile(JSON.parse(current));
    for(const key of PREVIOUS_SAVE_KEYS){
      const raw=localStorage.getItem(key);
      if(!raw) continue;
      const old=JSON.parse(raw);
      const migrated=normalizeProfile(old);
      if(key==='luanCatDefense_v020'){
        const oldStars=Object.values(old.maps||{}).reduce((sum,m)=>sum+Math.max(0,Math.min(3,Number(m&&m.stars)||0)),0);
        migrated.level=Math.max(1,oldStars);
        migrated.xp=0;
      }
      return migrated;
    }
  }catch(err){ console.warn('Não foi possível ler o save local.',err); }
  return cloneDefaultProfile();
}

let profile=loadProfile();
let personalTd=null;
let lobbySelection={map:'grove',difficulty:'easy',mode:'campaign',category:'beginner'};
let catCollectionSelection='dart';
let heroCollectionSelection=profile.selectedHero||'king';

const MASTERY_MAX_LEVEL=50;
const MASTERY_MAX_COINS=500;
const MASTERY_ABILITIES={
  dart:{name:'Chuva de Dardos',icon:'🌧️',cooldown:40,description:'Todos os inimigos no mapa recebem 50% do dano atual deste Dardo.'},
  sniper:{name:'Tiro de Execução',icon:'💥',cooldown:30,description:'Dispara no inimigo de maior vida e causa 10× o dano atual do Sniper.'},
  frost:{name:'Zero Absoluto',icon:'🧊',cooldown:45,description:'Congela inimigos comuns por 3s; chefões ficam extremamente lentos por 4s.'},
  burst:{name:'Bombardeio Felino',icon:'💣',cooldown:35,description:'Cinco explosões atingem a região do inimigo mais forte, cada uma com 100% do dano atual.'},
  electric:{name:'Tempestade Elétrica',icon:'⛈️',cooldown:40,description:'Quatro pulsos globais de raio causam 75% do dano atual por pulso.'},
  vine:{name:'Floresta Prisional',icon:'🌳',cooldown:50,description:'Prende todos os inimigos comuns por 4s e chefões por 2s.'},
  salmon:{name:'Pesca Milagrosa',icon:'🐟',cooldown:60,description:'Gera instantaneamente 3× a renda atual por rodada deste Pescador.'},
  ninja:{name:'Clones das Sombras',icon:'👥',cooldown:45,description:'Por 10s, dois clones atacam junto: o dano total do Ninja fica aproximadamente 2× maior.'},
  wizard:{name:'Cataclismo Arcano',icon:'🔮',cooldown:45,description:'Explode a área do inimigo mais forte e causa 300% do dano atual em grande área.'},
  laser:{name:'Sobrecarga',icon:'🔴',cooldown:40,description:'Por 8s, dobra a cadência do Laser e faz seus disparos saltarem entre mais inimigos.'},
  boomerang:{name:'Tornado de Bumerangues',icon:'🪃',cooldown:45,description:'Uma tempestade de bumerangues atravessa o mapa em 5 rajadas, atingindo todos os inimigos.'},
  alchemist:{name:'Pedra Filosofal',icon:'⚗️',cooldown:50,description:'Por 10s, cada ataque aplica Veneno, Fraqueza e Explosão de uma vez.'},
  chronomancer:{name:'Reverter o Tempo',icon:'⏰',cooldown:60,description:'Todos os inimigos voltam aproximadamente 5 segundos na rota; chefões voltam menos.'},
  demonking:{name:'Reino do Rei Demônio',icon:'🌑',cooldown:70,description:'Espalha Medo por todo o mapa, intensifica o Fogo Sombrio e fortalece temporariamente o exército de sombras.'}
};
function requiredMasteryXp(level){
  if(level>=MASTERY_MAX_LEVEL)return 0;
  return Math.round(55+8*level+1.2*Math.pow(level,1.35));
}
function masteryState(id){
  if(!profile.mastery)profile.mastery={};
  if(!profile.mastery[id])profile.mastery[id]={level:1,xp:0,maxRewardClaimed:false};
  return profile.mastery[id];
}
function masteryBonuses(level){
  level=Math.max(1,Math.min(50,Math.floor(level||1)));
  const range=Number((Math.min(level,10)*.3+Math.max(0,Math.min(level,40)-30)*.2).toFixed(1));
  const damage=Number((Math.max(0,Math.min(level,20)-10)*.2+Math.max(0,Math.min(level,49)-40)*.2+(level>=50?1.2:0)).toFixed(1));
  // 21–30 = 2% por nível; 31–40 = 1% por nível. Teto: -30% no intervalo entre ataques.
  const attackReduction=Math.min(.30,Math.max(0,Math.min(level,30)-20)*.02+Math.max(0,Math.min(level,40)-30)*.01);
  return{range,damage,attackReduction};
}
function masteryProgressPct(id){const m=masteryState(id);return m.level>=50?100:Math.max(0,Math.min(100,m.xp/requiredMasteryXp(m.level)*100));}
function grantMasteryXp(id,amount){
  const m=masteryState(id);if(m.level>=50)return{levels:[],coins:0,xp:0};
  const granted=Math.max(0,Math.floor(amount||0));m.xp+=granted;const levels=[];let coins=0;
  while(m.level<50&&m.xp>=requiredMasteryXp(m.level)){
    m.xp-=requiredMasteryXp(m.level);m.level++;levels.push(m.level);
    if(m.level>=50){m.level=50;m.xp=0;if(!m.maxRewardClaimed){m.maxRewardClaimed=true;profile.coins+=MASTERY_MAX_COINS;coins+=MASTERY_MAX_COINS;}break;}
  }
  return{levels,coins,xp:granted};
}
function masteryBonusSummary(id,level=masteryState(id).level){
  const b=masteryBonuses(level);
  if(id==='salmon'){
    const incomePct=Math.round(Math.min(.30,(b.range/5)*.05+(b.damage/5)*.10+b.attackReduction*.5)*100);
    return{...b,incomeBonus:incomePct/100,text:`+${incomePct}% renda`};
  }
  return{...b,text:`+${b.range.toFixed(1)} Range • +${b.damage.toFixed(1)} Dano • -${Math.round(b.attackReduction*100)}% intervalo de ataque`};
}


// v0.20.2 — "resolução"/tamanho da interface: como o jogo roda dentro do navegador (Edge/
// Chrome), não dá pra trocar a resolução real da tela — o equivalente prático é escalar a
// interface inteira, deixando a pessoa escolher o quanto encolher/ampliar até caber bem na
// tela dela. `zoom` é suportado nos dois navegadores usados pelo launcher.
function applyUiScale(value){
  const v=Math.max(.7,Math.min(1.4,Number(value)||1));
  try{document.documentElement.style.zoom=String(v);}catch(err){}
}
applyUiScale(profile.settings&&profile.settings.uiScale);

let audioCtx=null;
function audioVolume(){ return Math.max(0,Math.min(1,Number(profile.settings&&profile.settings.volume)||0)); }
function musicVolume(){
  const v=profile.settings&&profile.settings.musicVolume;
  return Math.max(0,Math.min(1,v==null?.35:(Number(v)||0)));
}
function ensureAudioCtx(){
  try{
    const AC=window.AudioContext||window.webkitAudioContext;
    if(!AC)return null;
    if(!audioCtx)audioCtx=new AC();
    if(audioCtx.state==='suspended')audioCtx.resume();
    return audioCtx;
  }catch(err){return null;}
}
function sfx(kind){
  const volume=audioVolume();
  if(volume<=0) return;
  try{
    const ctx=ensureAudioCtx();
    if(!ctx)return;
    const osc=ctx.createOscillator(),gain=ctx.createGain();
    const now=ctx.currentTime;
    const presets={
      ui:[420,.045,'sine'],wave:[520,.11,'triangle'],place:[300,.07,'square'],boss:[125,.32,'sawtooth'],
      win:[720,.34,'triangle'],lose:[145,.34,'sine'],pop:[560,.05,'square'],
      armorbreak:[380,.12,'square'],leak:[260,.18,'triangle'],bossleak:[95,.9,'sawtooth']
    };
    const [freqBase,dur,type]=presets[kind]||presets.ui;
    // Pequena variação de pitch nos pops evita que mortes em sequência soem repetitivas/metronômicas.
    const jitter=kind==='pop'?(.92+Math.random()*.16):1;
    const freq=freqBase*jitter;
    osc.type=type;osc.frequency.setValueAtTime(freq,now);
    if(kind==='win')osc.frequency.exponentialRampToValueAtTime(1180,now+dur);
    if(kind==='lose')osc.frequency.exponentialRampToValueAtTime(85,now+dur);
    if(kind==='boss')osc.frequency.exponentialRampToValueAtTime(72,now+dur);
    if(kind==='leak')osc.frequency.exponentialRampToValueAtTime(130,now+dur);
    if(kind==='bossleak')osc.frequency.exponentialRampToValueAtTime(34,now+dur);
    gain.gain.setValueAtTime(Math.min(.12,volume*.10),now);
    gain.gain.exponentialRampToValueAtTime(.0001,now+dur);
    osc.connect(gain);gain.connect(ctx.destination);osc.start(now);osc.stop(now+dur);
  }catch(err){}
}

// --- Música de fundo: um tema instrumental original por mapa + lobby + luta de chefão ---
// (tudo sintetizado ao vivo via Web Audio, nenhuma melodia de terceiros é reproduzida.)
let musicState=null;
let currentThemeId=null;
const MUSIC_STEPS_PER_BAR=8;
const MUSIC_THEMES={
  // Lobby/menus: alegre e simples, progressão I-V-vi-IV em Dó maior.
  lobby:{bpm:126,
    chords:[{bass:48,tones:[60,64,67,72]},{bass:43,tones:[55,59,62,67]},{bass:45,tones:[57,60,64,69]},{bass:41,tones:[53,57,60,65]}],
    pattern:[0,2,1,2,0,3,2,1],bassSteps:[0,4],melodyType:'triangle',bassType:'sine',
    melodyGain:.085,bassGain:.065,shaker:true,shakerGain:.035},
  // Bosque dos Gatinhos: o mais saltitante/infantil dos mapas Iniciantes, I-IV-V-I.
  grove:{bpm:132,
    chords:[{bass:48,tones:[60,64,67,72]},{bass:41,tones:[53,57,60,65]},{bass:43,tones:[55,59,62,67]},{bass:48,tones:[60,64,67,72]}],
    pattern:[0,1,2,1,0,2,3,2],bassSteps:[0,4],melodyType:'triangle',bassType:'sine',
    melodyGain:.085,bassGain:.06,shaker:true,shakerGain:.03},
  // Serra Felina: mais frio/aéreo — tom mais suave (sine), mais lento, sem shaker.
  ridge:{bpm:116,
    chords:[{bass:45,tones:[57,60,64,69]},{bass:41,tones:[53,57,60,65]},{bass:48,tones:[60,64,67,72]},{bass:43,tones:[55,59,62,67]}],
    pattern:[0,2,3,2,0,1,2,1],bassSteps:[0,4],melodyType:'sine',bassType:'sine',
    melodyGain:.078,bassGain:.058,shaker:false,shakerGain:0},
  // Pedágio da Meia-Noite: clima noturno/meio jazzy — menor, com pausas sincopadas (-1 = silêncio).
  toll:{bpm:110,
    chords:[{bass:45,tones:[57,60,64,69]},{bass:41,tones:[53,56,60,65]},{bass:43,tones:[55,59,62,67]},{bass:45,tones:[57,60,64,69]}],
    pattern:[0,-1,2,1,-1,2,3,-1],bassSteps:[0,4],melodyType:'square',bassType:'sine',
    melodyGain:.058,bassGain:.06,shaker:true,shakerGain:.02},
  // Desfiladeiro Escaldante: mapa Mediano — mais rápido e "quente", baixo em corcheias, tom mais áspero.
  canyon:{bpm:142,
    chords:[{bass:40,tones:[52,55,59,64]},{bass:36,tones:[48,52,55,60]},{bass:43,tones:[55,59,62,67]},{bass:38,tones:[50,53,57,62]}],
    pattern:[0,2,1,3,0,2,1,3],bassSteps:[0,2,4,6],melodyType:'sawtooth',bassType:'sawtooth',
    melodyGain:.065,bassGain:.07,shaker:true,shakerGain:.04},
  // Vale Bifurcado (Difícil): menor, mais urgente que os mapas Iniciantes/Mediano —
  // duas trilhas simultâneas pra defender exigem um clima mais tenso o tempo todo.
  fork:{bpm:136,
    chords:[{bass:38,tones:[50,53,57,62]},{bass:34,tones:[46,50,53,58]},{bass:41,tones:[53,56,60,65]},{bass:36,tones:[48,51,55,60]}],
    pattern:[0,2,1,3,0,2,3,1],bassSteps:[0,4],melodyType:'triangle',bassType:'sawtooth',
    melodyGain:.075,bassGain:.065,shaker:true,shakerGain:.03},
  // Passagem Cega (Impossível): esparso e abafado — poucas notas, bem espaçadas, clima de neblina.
  blind:{bpm:98,
    chords:[{bass:33,tones:[45,48,52,55]},{bass:29,tones:[41,44,48,51]},{bass:31,tones:[43,46,50,53]},{bass:33,tones:[45,48,52,55]}],
    pattern:[0,-1,-1,2,-1,1,-1,-1],bassSteps:[0],melodyType:'sine',bassType:'sine',
    melodyGain:.055,bassGain:.05,shaker:false,shakerGain:0},
  // Chefão: tenso e urgente — menor, andamento acelerado, baixo pulsando em toda corcheia.
  bossFight:{bpm:150,
    chords:[{bass:33,tones:[45,48,52,57]},{bass:33,tones:[45,48,52,57]},{bass:29,tones:[41,44,48,53]},{bass:31,tones:[43,46,50,55]}],
    pattern:[0,3,2,3,0,3,1,3],bassSteps:[0,1,2,3,4,5,6,7],melodyType:'sawtooth',bassType:'square',
    melodyGain:.07,bassGain:.05,shaker:true,shakerGain:.045}
};
// Novos mapas reutilizam famílias musicais compatíveis com seus ambientes, mantendo o jogo leve.
Object.assign(MUSIC_THEMES,{
  meadow:MUSIC_THEMES.grove, creek:MUSIC_THEMES.grove, garden:MUSIC_THEMES.ridge,
  harbor:MUSIC_THEMES.toll, ruins:MUSIC_THEMES.canyon, factory:MUSIC_THEMES.canyon,
  storm:MUSIC_THEMES.fork
});
function midiFreq(m){ return 440*Math.pow(2,(m-69)/12); }
function musicPluck(ctx,dest,freq,time,dur,peak,type){
  const osc=ctx.createOscillator(),gain=ctx.createGain();
  osc.type=type;osc.frequency.setValueAtTime(freq,time);
  gain.gain.setValueAtTime(.0001,time);
  gain.gain.linearRampToValueAtTime(peak,time+.008);
  gain.gain.exponentialRampToValueAtTime(.0001,time+dur);
  osc.connect(gain);gain.connect(dest);
  osc.start(time);osc.stop(time+dur+.02);
}
function musicShaker(ctx,dest,time,peak){
  const size=Math.floor(ctx.sampleRate*.045);
  const buffer=ctx.createBuffer(1,size,ctx.sampleRate);
  const data=buffer.getChannelData(0);
  for(let i=0;i<size;i++) data[i]=(Math.random()*2-1)*(1-i/size);
  const noise=ctx.createBufferSource();noise.buffer=buffer;
  const hp=ctx.createBiquadFilter();hp.type='highpass';hp.frequency.value=6500;
  const gain=ctx.createGain();
  gain.gain.setValueAtTime(peak||.03,time);
  gain.gain.exponentialRampToValueAtTime(.0001,time+.045);
  noise.connect(hp);hp.connect(gain);gain.connect(dest);
  noise.start(time);noise.stop(time+.05);
}
function scheduleMusicSteps(){
  if(!musicState)return;
  const {ctx,theme}=musicState,stepDur=60/theme.bpm/2;
  while(musicState.nextTime<ctx.currentTime+.15){
    const step=musicState.step%MUSIC_STEPS_PER_BAR;
    const bar=Math.floor(musicState.step/MUSIC_STEPS_PER_BAR)%theme.chords.length;
    const chord=theme.chords[bar],time=musicState.nextTime,toneIdx=theme.pattern[step];
    if(toneIdx>=0)musicPluck(ctx,musicState.gain,midiFreq(chord.tones[toneIdx]),time,stepDur*.92,theme.melodyGain,theme.melodyType);
    if(theme.bassSteps.includes(step))musicPluck(ctx,musicState.gain,midiFreq(chord.bass),time,stepDur*1.8,theme.bassGain,theme.bassType);
    if(theme.shaker&&step%2===1)musicShaker(ctx,musicState.gain,time,theme.shakerGain);
    musicState.step++;musicState.nextTime+=stepDur;
  }
  musicState.timer=setTimeout(scheduleMusicSteps,30);
}
function startThemeAudio(themeId,fadeMs){
  const ctx=ensureAudioCtx();
  if(!ctx)return;
  const theme=MUSIC_THEMES[themeId]||MUSIC_THEMES.lobby;
  const gain=ctx.createGain();
  gain.gain.value=0;
  gain.connect(ctx.destination);
  gain.gain.linearRampToValueAtTime(musicVolume(),ctx.currentTime+(fadeMs||500)/1000);
  musicState={ctx,gain,theme,step:0,nextTime:ctx.currentTime+.05,timer:null};
  currentThemeId=themeId;
  scheduleMusicSteps();
}
function playMusicTheme(themeId){
  if(!MUSIC_THEMES[themeId])themeId='lobby';
  if(musicVolume()<=0){currentThemeId=themeId;return;}
  if(currentThemeId===themeId&&musicState)return;
  const ctx=ensureAudioCtx();
  if(!ctx)return;
  if(musicState){
    const old=musicState;
    musicState=null; // interrompe o scheduler antigo (a checagem no topo de scheduleMusicSteps encerra o loop)
    try{
      const now=old.ctx.currentTime;
      old.gain.gain.cancelScheduledValues(now);
      old.gain.gain.setValueAtTime(old.gain.gain.value,now);
      old.gain.gain.linearRampToValueAtTime(0,now+.4);
    }catch(err){}
    setTimeout(()=>{try{old.gain.disconnect();}catch(err){}},450);
    setTimeout(()=>startThemeAudio(themeId,400),120);
  }else{
    startThemeAudio(themeId,500);
  }
}
function startMusic(){
  if(musicVolume()<=0)return;
  playMusicTheme(currentThemeId||'lobby');
}
function stopMusic(){
  if(!musicState)return;
  clearTimeout(musicState.timer);
  try{musicState.gain.disconnect();}catch(err){}
  musicState=null;
}
function updateMusicVolume(){
  if(!musicState)return;
  musicState.gain.gain.setTargetAtTime(musicVolume(),musicState.ctx.currentTime,.2);
}
function unlockAudioOnce(){
  ensureAudioCtx();
  if(musicVolume()>0)startMusic();
  document.removeEventListener('pointerdown',unlockAudioOnce);
  document.removeEventListener('keydown',unlockAudioOnce);
}
document.addEventListener('pointerdown',unlockAudioOnce,{once:true});
document.addEventListener('keydown',unlockAudioOnce,{once:true});


function saveProfile(){
  try{localStorage.setItem(SAVE_KEY,JSON.stringify(profile));}
  catch(err){console.warn('Não foi possível salvar o progresso local.',err);}
  renderProfileUi();
}

function mapStars(id){ return difficultyOrder.filter(d=>profile.maps[id].cleared[d]).length; }
function totalStars(){ return Object.keys(maps).reduce((sum,id)=>sum+mapStars(id),0); }
function totalWins(){ return Object.values(profile.maps).reduce((sum,m)=>sum+(m.wins||0),0); }
function isTowerUnlocked(id){ const t=types[id];if(!t)return false;if(t.secret&&!profile.secretUnlocks?.[id])return false;return profile.level>=t.unlockLevel; }
function discoverSecretUnlocks(){
  if(!profile.secretUnlocks)profile.secretUnlocks={boomerang:false,alchemist:false,chronomancer:false,demonking:false};
  const unlocked=[];
  for(const [id,categoryId] of Object.entries(SECRET_TOWER_RULES)){
    if(profile.secretUnlocks[id])continue;
    if(categoryMasteredForProfile(profile,categoryId)){profile.secretUnlocks[id]=true;unlocked.push(id);}
  }
  return unlocked;
}
let secretRevealQueue=[];
function queueSecretReveals(ids){if(!ids||!ids.length)return;secretRevealQueue.push(...ids);showNextSecretReveal();}
function showNextSecretReveal(){
  const modal=$('#secret-unlock-modal');if(!modal||modal.classList.contains('visible')||!secretRevealQueue.length)return;
  const id=secretRevealQueue.shift(),t=types[id];if(!t)return showNextSecretReveal();
  if($('#secret-unlock-icon'))$('#secret-unlock-icon').textContent=t.icon;
  if($('#secret-unlock-name'))$('#secret-unlock-name').textContent=t.name;
  if($('#secret-unlock-role'))$('#secret-unlock-role').textContent=t.role;
  if($('#secret-unlock-text'))$('#secret-unlock-text').textContent='Um novo Gatinho Secreto foi descoberto e agora pode ser usado nas partidas.';
  modal.classList.add('visible');modal.setAttribute('aria-hidden','false');sfx('win');
}
function closeSecretReveal(){
  const modal=$('#secret-unlock-modal');if(!modal)return;modal.classList.remove('visible');modal.setAttribute('aria-hidden','true');renderProfileUi();setTimeout(showNextSecretReveal,120);
}

function xpPercent(){
  const need=requiredXp(profile.level);
  return Math.max(0,Math.min(100,(profile.xp/need)*100));
}

function grantXp(amount){
  amount=Math.max(0,Math.floor(amount||0));
  profile.xp+=amount;
  const levels=[];
  let need=requiredXp(profile.level);
  while(profile.xp>=need){
    profile.xp-=need;
    profile.level++;
    levels.push(profile.level);
    need=requiredXp(profile.level);
  }
  return levels;
}

function nextUnlock(){
  const locked=Object.entries(types).filter(([,t])=>t.unlockLevel>profile.level).sort((a,b)=>a[1].unlockLevel-b[1].unlockLevel);
  if(!locked.length) return 'Todos os gatinhos atuais já foram liberados.';
  const level=locked[0][1].unlockLevel;
  const names=locked.filter(([,t])=>t.unlockLevel===level).map(([,t])=>t.name).join(', ');
  return `Próximo: ${names} no nível ${level}`;
}

function starMarkup(mapId){
  return difficultyOrder.map(d=>`<span class="map-star ${profile.maps[mapId].cleared[d]?'cleared':''}" title="${difficulties[d].name}${profile.maps[mapId].cleared[d]?' concluído':' não concluído'}">★</span>`).join('');
}

function setScreen(id,pushHistory=true){
  $$('[data-screen]').forEach(btn=>btn.classList.toggle('active',btn.dataset.screen===id));
  $$('.screen').forEach(screen=>screen.classList.toggle('active',screen.id===`screen-${id}`));
  document.body.classList.toggle('in-game',id==='game');
  document.body.dataset.screen=id;
  if(id!=='game')hideMatchTutorialOverlay();
  if(pushHistory){
    try{history.pushState({screen:id},'',`#${id}`);}catch(err){}
  }
  if(id==='play') renderMapLobby();
  if(id==='cats') renderCatCollection();
  if(id==='heroes') renderHeroCollection();
  if(id==='powers') renderPowerShop();
  if(id==='tutorial') renderTutorial();
  // A tela "game" já troca a música pro tema do mapa (via reset()/loadSelection); qualquer
  // outra tela volta pro tema de lobby.
  if(id!=='game') playMusicTheme('lobby');
  const active=$(`#screen-${id}`);if(active)active.scrollTop=0;
}

function renderHub(){
  const need=requiredXp(profile.level),pct=xpPercent();
  if($('#hub-level')) $('#hub-level').textContent=profile.level;
  if($('#hub-xp-text')) $('#hub-xp-text').textContent=`${profile.xp}/${need} XP`;
  if($('#hub-next-unlock')) $('#hub-next-unlock').textContent=nextUnlock();
  if($('#hub-xp-fill')) $('#hub-xp-fill').style.width=`${pct}%`;
  const root=$('#hub-summary');
  if(root){
    root.innerHTML=`
      <div class="summary-card"><span>Nível</span><b>🎖️ ${profile.level}</b></div>
      <div class="summary-card"><span>Estrelas de dificuldade</span><b>⭐ ${totalStars()}/${Object.keys(maps).length*3}</b></div>
      <div class="summary-card"><span>Vitórias</span><b>🏆 ${totalWins()}</b></div>
      <div class="summary-card"><span>Moedas</span><b>🪙 ${profile.coins}</b></div>`;
  }
}

function infiniteBestFor(mapId,diffId){
  return Math.max(0,Math.floor(Number(profile.infiniteBest?.[mapId]?.[diffId])||0));
}

function renderMapLobby(){
  const infinite=lobbySelection.mode==='infinite';
  const category=MAP_CATEGORIES.find(c=>c.id===lobbySelection.category)||MAP_CATEGORIES[0];
  const availableMapIds=category.maps.filter(id=>maps[id]);
  const categoryHasMaps=availableMapIds.length>0;

  const categoryPicker=$('#map-category-picker');
  if(categoryPicker){
    categoryPicker.innerHTML=MAP_CATEGORIES.map(c=>`<button type="button" class="map-category-button ${category.id===c.id?'selected':''} ${c.maps.length?'':'coming-soon'}" data-map-category="${c.id}"><span>${c.icon}</span><b>${c.name}</b><small>${c.maps.length?`${c.maps.length} mapa${c.maps.length>1?'s':''}`:'em breve'}</small></button>`).join('');
    $$('[data-map-category]').forEach(btn=>btn.onclick=()=>{
      sfx('ui');
      lobbySelection.category=btn.dataset.mapCategory;
      const next=MAP_CATEGORIES.find(c=>c.id===lobbySelection.category)||MAP_CATEGORIES[0];
      if(next.maps.length&&!next.maps.includes(lobbySelection.map))lobbySelection.map=next.maps[0];
      renderMapLobby();
    });
  }
  const categoryNote=$('#map-category-note');
  if(categoryNote){
    categoryNote.innerHTML=`<b>${category.icon} Mapas ${category.name}</b><span>${category.description} • 🐾 Gatinhos: ${towerPriceDeltaLabel(category.maps[0]||'grove')}.</span>`;
    categoryNote.classList.toggle('empty-category',!categoryHasMaps);
  }

  const root=$('#map-selection-grid');
  if(root){
    if(!categoryHasMaps){
      root.innerHTML=`<div class="map-category-empty"><span>${category.icon}</span><div><b>Mapas ${category.name} em desenvolvimento</b><p>Esta categoria já está preparada para receber novos mapas sem misturar com os três mapas Iniciantes.</p></div></div>`;
    }else{
      root.innerHTML=availableMapIds.map(id=>{
        const map=maps[id];
        const label=infinite?`∞ sem limite • recorde ${infiniteBestFor(id,lobbySelection.difficulty)}`:`${mapRounds(id,lobbySelection.difficulty)} rodadas`;
        return `
        <button type="button" class="map-choice ${lobbySelection.map===id?'selected':''}" data-map-choice="${id}">
          <div class="map-preview preview-${id}"><span class="map-preview-label">${label}</span></div>
          <div class="map-choice-body">
            <h3>${map.name}</h3>
            <p>${map.description}</p>
            <div class="map-star-row">${starMarkup(id)}</div>
          </div>
        </button>`;
      }).join('');
      $$('[data-map-choice]').forEach(btn=>btn.onclick=()=>{
        lobbySelection.map=btn.dataset.mapChoice;
        renderMapLobby();
      });
    }
  }

  const modePicker=$('#mode-picker');
  if(modePicker){
    $$('[data-game-mode]').forEach(btn=>btn.classList.toggle('selected',btn.dataset.gameMode===lobbySelection.mode));
    $$('[data-game-mode]').forEach(btn=>btn.onclick=()=>{
      sfx('ui');lobbySelection.mode=btn.dataset.gameMode==='infinite'?'infinite':'campaign';renderMapLobby();
    });
  }
  const modeDescription=$('#mode-description');
  if(modeDescription)modeDescription.textContent=infinite
    ?'Infinito: não existe rodada final. A vida, velocidade e composição dos inimigos escalam continuamente; a cada 10 rodadas concluídas você recebe moedas permanentes.'
    :'Campanha: conclua a fase, derrote o dirigível boss e conquiste a estrela da dificuldade.';

  const picker=$('#difficulty-picker');
  if(picker){
    picker.innerHTML=difficultyOrder.map(d=>{
      const diff=difficulties[d],cleared=profile.maps[lobbySelection.map]?.cleared?.[d]||false;
      const endlessDescriptions={
        easy:'Escalada mais lenta e mais vidas; no Infinito todas as cores aparecem e blindados entram só depois da rodada 20.',
        normal:'Escalada padrão do Infinito, com blindados e ameaças especiais chegando mais cedo.',
        hard:'Escalada mais agressiva, menos dinheiro/vidas e crescimento de vida/velocidade mais rápido.'
      };
      return `<button type="button" class="difficulty-button ${lobbySelection.difficulty===d?'selected':''}" data-difficulty="${d}" ${categoryHasMaps?'':'disabled'}>
        <b>${infinite?'∞':(cleared?'⭐':'☆')} ${diff.name}</b><small>${infinite?endlessDescriptions[d]:diff.description}</small>
      </button>`;
    }).join('');
    $$('[data-difficulty]').forEach(btn=>btn.onclick=()=>{
      lobbySelection.difficulty=btn.dataset.difficulty;
      renderMapLobby();
    });
  }

  const record=$('#infinite-record');
  if(record){
    record.hidden=!infinite||!categoryHasMaps;
    if(infinite&&categoryHasMaps)record.innerHTML=`∞ Recorde: rodada <b>${infiniteBestFor(lobbySelection.map,lobbySelection.difficulty)}</b>`;
  }
  const diffDesc=$('#difficulty-description');
  if(diffDesc)diffDesc.textContent=categoryHasMaps
    ?(infinite?'A dificuldade define sua economia inicial, vidas e velocidade de escalada.':'Cada mapa pode ser jogado em Fácil, Normal ou Difícil; a categoria do mapa é independente da dificuldade escolhida.')
    :'Escolha uma categoria com mapas disponíveis para selecionar a dificuldade.';
  const playEnter=$('#play-enter');
  if(playEnter){playEnter.textContent=infinite?'Jogar Infinito':'Entrar no mapa';playEnter.disabled=!categoryHasMaps;}
  if($('#selected-map-badge')) $('#selected-map-badge').textContent=categoryHasMaps
    ?`${maps[lobbySelection.map].name} • ${category.name} • ${infinite?'∞ Infinito':'🏁 Campanha'} • ${difficulties[lobbySelection.difficulty].name}`
    :`${category.icon} Mapas ${category.name} • em desenvolvimento`;
  renderPlayHeroSummary();
}
function drawCollectionCat(id){
  const canvas=$('#cat-preview-canvas');if(!canvas)return;
  const c=canvas.getContext('2d'),t=types[id]||types.dart,m=masteryState(id),gold=m.level>=50,W=canvas.width,H=canvas.height;
  c.clearRect(0,0,W,H);
  const bg=c.createRadialGradient(W/2,H*.42,20,W/2,H*.42,180);bg.addColorStop(0,gold?'#5a481f':'#203c50');bg.addColorStop(1,'#081018');c.fillStyle=bg;c.fillRect(0,0,W,H);
  for(let i=0;i<18;i++){const x=(i*71+37)%W,y=(i*43+19)%H;c.globalAlpha=.12+(i%3)*.04;c.fillStyle=gold?'#f5d76d':t.color;c.beginPath();c.arc(x,y,1+(i%2),0,Math.PI*2);c.fill();}c.globalAlpha=1;
  c.save();c.translate(W/2,H*.52);const r=58,fur=t.fur,accent=gold?'#f7da74':t.accent;
  if(gold){c.shadowColor='#f3cf62';c.shadowBlur=28;c.fillStyle='#e7c65b33';c.beginPath();c.arc(0,-4,86,0,Math.PI*2);c.fill();c.shadowBlur=0;}
  c.fillStyle=fur;c.beginPath();c.ellipse(0,45,42,40,0,0,Math.PI*2);c.fill();
  c.beginPath();c.moveTo(-38,-22);c.lineTo(-28,-76);c.lineTo(-8,-43);c.closePath();c.fill();c.beginPath();c.moveTo(38,-22);c.lineTo(28,-76);c.lineTo(8,-43);c.closePath();c.fill();
  c.strokeStyle='#080b10';c.lineWidth=5;c.beginPath();c.arc(0,-12,r,0,Math.PI*2);c.fill();c.stroke();
  if(gold){c.fillStyle='#f7d66b';c.globalAlpha=.88;c.beginPath();c.arc(0,-12,r*.88,Math.PI*1.08,Math.PI*1.92);c.lineTo(0,-12);c.closePath();c.fill();c.globalAlpha=1;}
  c.fillStyle='#fff1df';c.globalAlpha=.78;c.beginPath();c.ellipse(0,9,28,18,0,0,Math.PI*2);c.fill();c.globalAlpha=1;
  c.fillStyle='#11151c';for(const x of[-20,20]){c.beginPath();c.ellipse(x,-20,6,9,0,0,Math.PI*2);c.fill();}
  c.fillStyle='#e88993';c.beginPath();c.moveTo(-5,1);c.lineTo(5,1);c.lineTo(0,8);c.closePath();c.fill();
  c.strokeStyle=gold?'#f7d66b':accent;c.lineWidth=5;c.beginPath();c.arc(0,46,36,.15,Math.PI-.15);c.stroke();
  c.font='52px Segoe UI Emoji,Segoe UI Symbol';c.textAlign='center';c.fillText(t.icon,0,-88);if(gold){c.font='28px Segoe UI Emoji';c.fillText('👑',48,-72);}c.restore();
  c.fillStyle='#f4f7fa';c.font='900 18px Segoe UI,Arial';c.textAlign='center';c.fillText(gold?'SKIN MAESTRIA DOURADA':'VISUAL DO GATINHO',W/2,H-18);
}
function renderCatMasteryDetail(id){
  const root=$('#cat-mastery-info');if(!root)return;
  const t=types[id],m=masteryState(id),b=masteryBonusSummary(id),ability=MASTERY_ABILITIES[id],max=m.level>=50,need=max?0:requiredMasteryXp(m.level),pct=masteryProgressPct(id);
  root.innerHTML=`<div class="mastery-detail-head"><div><span class="eyebrow">MAESTRIA INDIVIDUAL</span><h3>${t.name}</h3><small>${t.role}</small></div><span class="mastery-level-badge ${max?'max':''}">${max?'⭐ MÁX 50':`Nv. ${m.level}/50`}</span></div>
    <div class="mastery-xp-line"><span>${max?'Maestria concluída':`${m.xp}/${need} XP`}</span><b>${Math.round(pct)}%</b></div><div class="mastery-big-track"><i style="width:${pct}%"></i></div>
    <div class="mastery-bonus-list">${id==='salmon'?`<span>🎣 Bônus atual: <b>${b.text}</b></span>`:`<span>📏 Range: <b>+${b.range.toFixed(1)}</b></span><span>💥 Dano: <b>+${b.damage.toFixed(1)}</b></span><span>⚡ Attack Speed: <b>-${Math.round(b.attackReduction*100)}% no intervalo</b></span>`}</div>
    <div class="mastery-ability-card ${max?'':'locked'}"><b>${ability.icon} ${ability.name}</b><br>${ability.description}<br><small>${max?`✓ Desbloqueada • cooldown ${ability.cooldown}s`:'🔒 Desbloqueia no nível 50'}</small></div>
    <div class="mastery-reward">${max?'✨ Skin dourada equipada automaticamente • recompensa de nível 50 recebida':'🎁 Nível 50: skin dourada + habilidade exclusiva + 🪙 '+MASTERY_MAX_COINS+' moedas'}</div>`;
  drawCollectionCat(id);
}
function renderCatCollection(){
  if($('#cats-level')) $('#cats-level').textContent=profile.level;
  const root=$('#cat-collection');if(!root)return;
  if(!types[catCollectionSelection]||(types[catCollectionSelection].secret&&!isTowerUnlocked(catCollectionSelection)))catCollectionSelection='dart';
  const visibleTypes=Object.entries(types).filter(([id,t])=>!t.secret||isTowerUnlocked(id));
  root.innerHTML=visibleTypes.map(([id,t])=>{const unlocked=isTowerUnlocked(id),m=masteryState(id),pct=masteryProgressPct(id),max=m.level>=50,need=max?0:requiredMasteryXp(m.level);
    return `<article class="cat-card mastery-card ${unlocked?'':'locked'} ${max?'mastered':''} ${catCollectionSelection===id?'selected':''}" data-mastery-cat="${id}" style="--cat-glow:${max?'#f2cf62':t.color}33">
      <div class="cat-head"><div class="cat-avatar">${unlocked?t.icon:'🔒'}</div><div><h3>${t.name}</h3><small>${t.role} • $${t.cost}</small></div></div>
      <p class="cat-role">${max?'<span class="mastery-gold-label">⭐ Maestria Máxima • Skin Dourada</span>':`Maestria ${m.level}/50`} • ${masteryBonusSummary(id).text}</p>
      <div class="mastery-mini-track"><i style="width:${pct}%"></i></div><div class="mastery-mini-text"><span>${max?'MAX':`${m.xp}/${need} XP`}</span><span>${Math.round(pct)}%</span></div>
      <div class="cat-unlock">${unlocked?'✓ Liberado para jogar':`🔒 Libera no nível ${t.unlockLevel} • você está no ${profile.level}`}</div></article>`;}).join('');
  $$('[data-mastery-cat]').forEach(card=>card.onclick=()=>{catCollectionSelection=card.dataset.masteryCat;renderCatCollection();});
  renderCatMasteryDetail(catCollectionSelection);
}

function drawHeroPreview(heroId){
  const canvas=$('#hero-preview-canvas');if(!canvas)return;
  const h=HEROES[heroId]||HEROES.king,c=canvas.getContext('2d'),W=canvas.width,H=canvas.height;
  c.clearRect(0,0,W,H);
  const bg=c.createRadialGradient(W/2,H*.44,20,W/2,H*.44,220);bg.addColorStop(0,h.color+'55');bg.addColorStop(1,'#071018');c.fillStyle=bg;c.fillRect(0,0,W,H);
  for(let i=0;i<24;i++){const x=(i*83+31)%W,y=(i*47+13)%H;c.globalAlpha=.1+(i%4)*.035;c.fillStyle=h.color;c.beginPath();c.arc(x,y,1+(i%3)*.55,0,Math.PI*2);c.fill();}c.globalAlpha=1;
  c.save();c.translate(W/2,H*.54);
  c.shadowColor=h.color;c.shadowBlur=24;c.fillStyle=h.color+'22';c.beginPath();c.arc(0,-6,92,0,Math.PI*2);c.fill();c.shadowBlur=0;
  c.fillStyle=h.fur;c.beginPath();c.ellipse(0,48,46,42,0,0,Math.PI*2);c.fill();
  c.beginPath();c.moveTo(-42,-20);c.lineTo(-28,-78);c.lineTo(-7,-43);c.closePath();c.fill();c.beginPath();c.moveTo(42,-20);c.lineTo(28,-78);c.lineTo(7,-43);c.closePath();c.fill();
  c.beginPath();c.arc(0,-10,61,0,Math.PI*2);c.fill();
  c.fillStyle='#fff1df';c.globalAlpha=.8;c.beginPath();c.ellipse(0,11,30,18,0,0,Math.PI*2);c.fill();c.globalAlpha=1;
  c.fillStyle='#12151b';for(const x of[-20,20]){c.beginPath();c.ellipse(x,-19,6,9,0,0,Math.PI*2);c.fill();}
  c.fillStyle='#ed8d99';c.beginPath();c.moveTo(-5,1);c.lineTo(5,1);c.lineTo(0,8);c.closePath();c.fill();
  c.strokeStyle=h.accent;c.lineWidth=4;c.beginPath();c.arc(0,45,36,.1,Math.PI-.1);c.stroke();
  c.font='60px Segoe UI Emoji,Segoe UI Symbol';c.textAlign='center';c.fillText(h.icon,0,-92);
  if(heroId==='king'){c.fillStyle='#f2cf62';c.beginPath();c.moveTo(-30,-55);c.lineTo(-18,-85);c.lineTo(0,-63);c.lineTo(18,-85);c.lineTo(30,-55);c.closePath();c.fill();c.strokeStyle='#fff1a6';c.lineWidth=2;c.stroke();}
  if(heroId==='warrior'){c.strokeStyle='#eef4f8';c.lineWidth=8;c.beginPath();c.moveTo(38,-15);c.lineTo(68,-55);c.stroke();c.strokeStyle='#8f5d39';c.lineWidth=6;c.beginPath();c.moveTo(30,-6);c.lineTo(44,-20);c.stroke();}
  if(heroId==='luna'){c.fillStyle='#d9c8ff';c.beginPath();c.arc(40,-58,19,.6,Math.PI*1.75);c.lineTo(48,-58);c.arc(44,-58,13,Math.PI*1.75,.6,true);c.closePath();c.fill();}
  if(heroId==='merchant'){c.fillStyle='#d49c55';c.beginPath();c.ellipse(0,-67,36,10,0,0,Math.PI*2);c.fill();c.fillStyle='#ffcf8a';c.fillRect(-23,-82,46,14);c.font='31px Segoe UI Emoji';c.fillText('🐟',46,20);}
  c.restore();
  c.fillStyle='#f6f4ff';c.font='900 22px Segoe UI,Arial';c.textAlign='center';c.fillText(h.name,W/2,H-32);
  c.fillStyle='#b9cad3';c.font='600 13px Segoe UI,Arial';c.fillText(h.role,W/2,H-12);
}

function renderHeroDetail(heroId){
  const root=$('#hero-detail-info');if(!root)return;
  const h=HEROES[heroId]||HEROES.king;
  root.innerHTML=`<div class="hero-detail-head"><div><span class="eyebrow">HERÓI GATINHO</span><h3>${h.icon} ${h.name}</h3><small>${h.role}</small></div><span class="hero-cost-chip">$${h.cost} base</span></div>
    <div class="hero-passive-card"><b>✨ Passiva</b><p>${h.passive}</p></div>
    <div class="hero-skill-grid"><div><b>🔓 Nv.5 • ${h.skill.icon} ${h.skill.name}</b><p>${h.skill.description}</p><small>Cooldown: ${h.skill.cooldown}s</small></div><div class="ultimate"><b>⭐ Nv.10 • ${h.ultimate.icon} ${h.ultimate.name}</b><p>${h.ultimate.description}</p><small>Cooldown: ${h.ultimate.cooldown}s</small></div></div>
    <button type="button" id="hero-equip" class="primary big-action">${profile.selectedHero===heroId?'✓ Herói equipado':'Equipar '+h.name}</button>
    <small class="hero-note">Cada partida começa no nível 1. XP do herói é ganho durante o mapa e não substitui a Maestria dos gatinhos normais.</small>`;
  const btn=$('#hero-equip');if(btn)btn.onclick=()=>{profile.selectedHero=heroId;heroCollectionSelection=heroId;saveProfile();sfx('ui');renderHeroCollection();renderMapLobby();};
  drawHeroPreview(heroId);
}

function renderHeroCollection(){
  const root=$('#hero-collection');if(!root)return;
  if(!HEROES[heroCollectionSelection])heroCollectionSelection=profile.selectedHero||'king';
  root.innerHTML=Object.entries(HEROES).map(([id,h])=>`<article class="hero-card ${profile.selectedHero===id?'equipped':''} ${heroCollectionSelection===id?'selected':''}" data-hero-choice="${id}" style="--hero-color:${h.color}">
    <div class="hero-card-icon">${h.icon}</div><div class="hero-card-copy"><h3>${h.name}</h3><small>${h.role}</small><p>${h.passive}</p><span>$${h.cost} base • habilidade Nv.5 • Ultimate Nv.10</span></div>${profile.selectedHero===id?'<b class="hero-equipped-label">✓ EQUIPADO</b>':''}</article>`).join('');
  $$('[data-hero-choice]').forEach(card=>card.onclick=()=>{sfx('ui');heroCollectionSelection=card.dataset.heroChoice;renderHeroCollection();});
  if($('#hero-equipped-chip'))$('#hero-equipped-chip').textContent=`🦸 Equipado: ${(HEROES[profile.selectedHero]||HEROES.king).name}`;
  renderHeroDetail(heroCollectionSelection);
}

function renderPlayHeroSummary(){
  const root=$('#play-hero-summary');if(!root)return;
  const h=HEROES[profile.selectedHero]||HEROES.king,price=heroPrice(profile.selectedHero,lobbySelection.map);
  root.innerHTML=`<span class="play-hero-icon">${h.icon}</span><span><b>${h.name}</b><small>${h.role} • $${price} neste mapa • Nv.5 ${h.skill.name} • Nv.10 ${h.ultimate.name}</small></span>`;
}

const TOWER_TIPS={
  dart:'Barato e flexível — boa escolha logo no início em qualquer mapa. O caminho Lanceiro é a única forma de enxergar Camuflados fora do Sniper e do Ninja.',
  frost:'Não escolhe um alvo: atinge todos os inimigos válidos no alcance a cada ataque. Ótimo pra segurar grupos e deixa todo mundo mais lento.',
  burst:'Sempre quebra blindagem, mesmo sem investir em nenhum caminho — a primeira escolha natural contra Blindados e Blindados Pesados.',
  laser:'A maior cadência de tiro do jogo. Forte contra muitos balões fracos ao mesmo tempo, principalmente com o caminho Grade de Plasma.',
  ninja:'O maior dano por acerto entre as torres rápidas. O caminho Sombra Assassina é a única forma, além do Sniper, de enxergar Camuflado e quebrar blindagem ao mesmo tempo.',
  wizard:'Dano em área com uma lentidão leve já de fábrica — caro, mas já nasce pronto pra ajudar contra grupos.',
  electric:'O raio salta entre vários alvos próximos sozinho — ótimo contra balões enfileirados ou agrupados.',
  vine:'Não causa dano por padrão: imobiliza inimigos por alguns segundos. Combine com torres de dano pra aproveitar a deixa parada.',
  salmon:'Não ataca — gera dinheiro extra a cada rodada concluída. Ajuda a bancar as outras torres mais caras.',
  sniper:'Alcance cobre o mapa inteiro e sempre enxerga Camuflados sozinho. Caro, mas nunca precisa se preocupar com posicionamento.'
};

const BALLOON_GUIDE=[
  {icon:'🥷',name:'Camuflado',color:'#547b59',desc:'Invisível para a maioria das torres — passa despercebido até ser detectado.',counter:'Detectado por: Sniper (sempre), Dardo (caminho Lanceiro, T2+), Ninja (caminho Sombra Assassina, T1+) e pelo Observador do Sniper (T2+, revela pra toda a defesa).'},
  {icon:'🛡️',name:'Blindado',color:'#9ba4b4',desc:'Tem uma camada extra de blindagem por fora. A maioria dos ataques não avança até ela quebrar.',counter:'Quebra blindagem: Bombinha (sempre), Sniper (caminho Caçador, T4+), Ninja (caminho Sombra Assassina, T5).'},
  {icon:'🛡️🛡️',name:'Blindado Pesado',color:'#4a525c',desc:'A versão reforçada do Blindado — a camada externa aguenta bem mais dano antes de quebrar. Aparece a partir da dificuldade Normal.',counter:'As mesmas fontes que quebram blindagem comum funcionam, só que leva mais tempo pra derrubar a camada.'},
  {icon:'🥷🛡️',name:'Camuflado + Blindado',color:'#5c7a63',desc:'Combina os dois ao mesmo tempo: invisível E blindado.',counter:'Precisa de detecção de Camuflado E de uma fonte que quebre blindagem — nem sempre é a mesma torre.'},
  {icon:'⚡',name:'Rápido',color:'#ffe066',desc:'Menos vida que o normal, mas atravessa a rota bem mais rápido — passa rápido pelo alcance das torres.',counter:'Lentidão (Gelinho, Cipó, Mago) ajuda a mantê-lo no alcance por mais tempo.'},
  {icon:'➕',name:'Regenerador',color:'#5fd88a',desc:'Recupera vida aos poucos quando fica um tempo sem ser atingido.',counter:'Dano constante e rápido (Laser, Dardo, Ninja) não dá espaço pra ele regenerar.'},
  {icon:'❤️',name:'Curandeiro',color:'#62d887',desc:'Regenera 1 camada por segundo dos balões próximos em um raio pequeno.',counter:'Priorize o Curandeiro antes que uma formação inteira comece a recuperar camadas.'},
  {icon:'🤡',name:'Atrapalhão',color:'#ff9f5d',desc:'Pode estourar 1 camada do balão à frente, mas o impacto atordoa gatinhos próximos por 1,2s.',counter:'Evite concentrar toda a defesa colada no mesmo ponto quando ele estiver chegando.'},
  {icon:'🃏',name:'Bobo da Corte',color:'#ce78ff',desc:'Tem apenas 1 de vida. O dano do tiro que o acerta tira dinheiro da partida.',counter:'O prejuízo é limitado a $500 por acerto. Torres fracas/rápidas podem ser mais econômicas do que um tiro enorme de Sniper.'},
  {icon:'😇',name:'Anjo',color:'#f4efc7',desc:'Dá 1 escudo a um balão próximo. O escudo bloqueia um ataque inteiro, mas reduz em 18% a velocidade do protegido.',counter:'Ataques baratos e rápidos quebram o escudo antes dos seus golpes pesados.'},
  {icon:'😈',name:'Demônio',color:'#a94455',desc:'Rouba até 1 camada de balões próximos e converte isso em vida máxima própria.',counter:'Mate cedo: ele pode crescer até 2× a vida máxima original se ficar cercado de aliados.'},
  {icon:'⭐',name:'Elite',color:'#ffd36b',desc:'Não é bem um tipo novo — é uma versão fortalecida (+45% de vida) de qualquer balão comum ou especial, a partir da rodada 3.',counter:'Fica mais fácil de notar pela barra de vida maior; trate como o tipo base, só que mais resistente.'},
  {icon:'👑',name:'Chefão',color:'#ffb347',desc:'Aparece na última rodada de cada mapa. Tem 50× a vida do balão mais forte da fase.',counter:'Se escapar, tira TODAS as suas vidas restantes na hora — vale guardar poderes e dinheiro pra essa rodada.'}
];

function renderTutorial(){
  const towerRoot=$('#tutorial-towers');
  if(towerRoot){
    towerRoot.innerHTML=Object.entries(types).map(([id,t])=>{
      const cadence=t.farm?`+$${t.farmIncome}/rodada`:t.rootHold?`recarga ${t.rate.toFixed(1)}s`:`${(1/t.rate).toFixed(1)} ataque(s)/s`;
      return `<article class="cat-card" style="--cat-glow:${t.color}33">
        <div class="cat-head">
          <div class="cat-avatar">${t.icon}</div>
          <div><h3>${t.name}</h3><small>${t.role} • $${t.cost}</small></div>
        </div>
        <p class="cat-role">${t.farm?'Economia • não ataca':t.rootHold?'Controle • imobiliza':`Dano ${t.damage.toFixed(2)}`} • ${t.globalRange?'range GLOBAL':`range ${t.range}`} • ${cadence}.</p>
        <div class="tutorial-tip">💡 ${TOWER_TIPS[id]||t.special}</div>
      </article>`;
    }).join('');
  }
  const tierRoot=$('#tutorial-tiers');
  if(tierRoot){
    tierRoot.innerHTML=TIERS.map((tier,i)=>`<span class="tier-chip"><b style="background:${tier.color};--ring:${tier.ring}55"></b>${tier.name} • resistência ${i+1}</span>`).join('');
  }
  const balloonRoot=$('#tutorial-balloons');
  if(balloonRoot){
    balloonRoot.innerHTML=BALLOON_GUIDE.map(b=>`<article class="balloon-card">
      <div class="balloon-head">
        <div class="balloon-avatar">${b.icon}<b style="background:${b.color}"></b></div>
        <h3>${b.name}</h3>
      </div>
      <p class="balloon-desc">${b.desc}</p>
      <div class="balloon-counter">🎯 ${b.counter}</div>
    </article>`).join('');
  }
}

function renderPowerShop(){
  if($('#shop-coins')) $('#shop-coins').textContent=profile.coins;
  const root=$('#power-shop');
  if(root){
    root.innerHTML=Object.entries(powers).map(([id,p])=>{
      const qty=profile.inventory[id]||0,affordable=profile.coins>=p.cost;
      return `<article class="shop-card">
        <div class="shop-card-head"><div class="shop-card-icon">${p.icon}</div><div><h3>${p.name}</h3><p>${p.description}</p></div></div>
        <div class="shop-card-meta"><span>Na mochila: <b>${qty}</b></span><span>${p.duration?`${p.duration}s`:'instantâneo'}</span></div>
        <button type="button" data-buy-power="${id}" class="${affordable?'affordable':''}" ${affordable?'':'disabled'}>🪙 ${p.cost} • Comprar 1 carga</button>
      </article>`;
    }).join('');
    $$('[data-buy-power]').forEach(btn=>btn.onclick=()=>buyPower(btn.dataset.buyPower));
  }
  const need=requiredXp(profile.level),pct=xpPercent();
  if($('#powers-level')) $('#powers-level').textContent=profile.level;
  if($('#powers-xp-text')) $('#powers-xp-text').textContent=`${profile.xp}/${need} XP • próximo nível exige ${requiredXp(profile.level+1)} XP`;
  if($('#powers-xp-fill')) $('#powers-xp-fill').style.width=`${pct}%`;
  renderSkinShop();
}

function renderSkinShop(){
  const root=$('#skin-shop');if(!root)return;
  root.innerHTML=Object.entries(skins).map(([id,skin])=>{
    const owned=Boolean(profile.ownedSkins[id]),equipped=profile.equippedSkins[skin.tower]===id;
    return `<article class="shop-card ${equipped?'skin-equipped':''}">
      <div class="shop-card-head"><div class="shop-card-icon">${skin.icon}</div><div><h3>${skin.name}</h3><p>${skin.description}</p></div></div>
      <div class="shop-card-meta"><span>Skin de: <b>${types[skin.tower].name}</b></span><span>${equipped?'✓ Equipada':owned?'Adquirida':'Teste gratuito'}</span></div>
      <button type="button" data-skin-action="${id}" class="affordable">${equipped?'✓ Equipada':owned?'Equipar':'🪙 0 • Adquirir grátis'}</button>
    </article>`;
  }).join('');
  $$('[data-skin-action]').forEach(btn=>btn.onclick=()=>unlockOrEquipSkin(btn.dataset.skinAction));
}

function unlockOrEquipSkin(id){
  const skin=skins[id];if(!skin)return;
  profile.ownedSkins[id]=true;
  profile.equippedSkins[skin.tower]=id;
  saveProfile();sfx('ui');renderPowerShop();
}

function buyPower(id){
  const p=powers[id];
  if(!p||profile.coins<p.cost) return;
  profile.coins-=p.cost;
  profile.inventory[id]=(profile.inventory[id]||0)+1;
  saveProfile();
}

function renderUnlocks(){
  const mapId=personalTd&&personalTd.mapId?personalTd.mapId():lobbySelection.map;
  const category=mapCategoryForMap(mapId),mult=towerPriceMultiplier(mapId);
  const sideLabel=$('#td-side-label');
  if(sideLabel){
    const pct=Math.round((mult-1)*100);
    sideLabel.textContent=`GATINHOS • MÁX 4 • ${category.name.toUpperCase()} ${pct===0?'NORMAL':`${pct>0?'+':''}${pct}%`}`;
  }
  $$('.td-tower-picker [data-td-tower]').forEach(btn=>{
    const id=btn.dataset.tdTower,unlocked=isTowerUnlocked(id),t=types[id],price=towerPrice(id,mapId);
    btn.hidden=Boolean(t.secret&&!unlocked);
    const placed=personalTd&&personalTd.towerCount?personalTd.towerCount(id):0;
    const limit=t.limit||TOWER_LIMIT_PER_TYPE,maxed=placed>=limit;
    btn.disabled=!unlocked||maxed;
    btn.classList.toggle('locked',!unlocked);
    btn.classList.toggle('maxed',maxed);
    const small=btn.querySelector('small');
    if(small)small.innerHTML=`${price}<span class="tower-count">${placed}/${limit}</span>`;
    btn.title=!unlocked
      ?`Bloqueado: ${t.name} libera no nível ${t.unlockLevel}.`
      :maxed
        ?`${t.name}: limite de ${limit} unidade${limit===1?'':'s'} atingido.`
        :`${t.name} • ${price} (${category.name}) • ${placed}/${limit} no mapa • ${t.special}`;
  });
}

function renderProfileUi(){
  const need=requiredXp(profile.level),pct=xpPercent();
  if($('#profile-level')) $('#profile-level').textContent=profile.level;
  if($('#profile-coins')) $('#profile-coins').textContent=profile.coins;
  if($('#profile-stars')) $('#profile-stars').textContent=totalStars();
  if($('#profile-stars-total')) $('#profile-stars-total').textContent=Object.keys(maps).length*3;
  if($('#header-xp-text')) $('#header-xp-text').textContent=`${profile.xp}/${need} XP`;
  if($('#header-xp-fill')) $('#header-xp-fill').style.width=`${pct}%`;
  renderHub();renderMapLobby();renderCatCollection();renderHeroCollection();renderPowerShop();renderUnlocks();
  if(personalTd) personalTd.renderHotbar();
}

function initNavigation(){
  $$('[data-screen]').forEach(btn=>btn.onclick=()=>{sfx('ui');setScreen(btn.dataset.screen);});
  $$('[data-go-screen]').forEach(btn=>btn.onclick=()=>{sfx('ui');setScreen(btn.dataset.goScreen);});
  window.addEventListener('popstate',e=>{
    const id=(e.state&&e.state.screen)||(location.hash||'#hub').slice(1);
    if(['hub','play','cats','heroes','powers','game','tutorial'].includes(id))setScreen(id,false);
  });
}

function doResetSave(){
  profile=cloneDefaultProfile();
  lobbySelection={map:'grove',difficulty:'easy',mode:'campaign',category:'beginner'};
  saveProfile();
  if(personalTd) personalTd.loadSelection('grove','easy','campaign');
}
// v0.18.0 — troca o confirm() nativo do navegador (que não combina com o resto da UI e em
// alguns navegadores/atalhos é fácil de confirmar sem querer) por um modal temático próprio.
function initResetSave(){
  const btn=$('#reset-save'),modal=$('#confirm-delete-modal'),cancelBtn=$('#confirm-delete-cancel'),okBtn=$('#confirm-delete-ok');
  if(!btn) return;
  const closeModal=()=>{ if(modal){modal.classList.remove('visible');modal.setAttribute('aria-hidden','true');} };
  btn.onclick=()=>{
    if(!modal){ if(confirm('Apagar moedas, nível, XP, estrelas, vitórias e poderes comprados?'))doResetSave(); return; }
    modal.classList.add('visible');modal.setAttribute('aria-hidden','false');
  };
  if(cancelBtn) cancelBtn.onclick=()=>{sfx('ui');closeModal();};
  if(okBtn) okBtn.onclick=()=>{sfx('ui');doResetSave();closeModal();};
}

// v0.18.0 — resto da "tela de configurações completa": tela cheia/janela e exportar/importar
// save (backup manual entre trocas de PC ou reinstalação, já que hoje o save só vive no
// localStorage do navegador/perfil do launcher).
function showSaveIoStatus(text,isError=false){
  const el=$('#menu-save-io-status');
  if(!el) return;
  el.textContent=text;el.hidden=false;el.classList.toggle('io-error',isError);
  clearTimeout(showSaveIoStatus._t);
  showSaveIoStatus._t=setTimeout(()=>{el.hidden=true;},6000);
}
function initSettingsExtras(){
  const fsBtn=$('#menu-fullscreen');
  const syncFsLabel=()=>{ if(fsBtn) fsBtn.textContent=document.fullscreenElement?'🗗 Sair da tela cheia':'🖥️ Tela cheia'; };
  if(fsBtn){
    fsBtn.onclick=()=>{
      sfx('ui');
      if(document.fullscreenElement){ document.exitFullscreen().catch(()=>{}); }
      else if(document.documentElement.requestFullscreen){ document.documentElement.requestFullscreen().catch(()=>showSaveIoStatus('Não foi possível entrar em tela cheia neste navegador.',true)); }
    };
  }
  document.addEventListener('fullscreenchange',syncFsLabel);
  syncFsLabel();

  const scaleSel=$('#menu-ui-scale');
  if(scaleSel){
    scaleSel.value=String(profile.settings&&profile.settings.uiScale||1);
    scaleSel.onchange=e=>{
      sfx('ui');
      const v=Math.max(.7,Math.min(1.4,Number(e.target.value)||1));
      profile.settings.uiScale=v;saveProfile();applyUiScale(v);
    };
  }

  const exportBtn=$('#menu-export-save');
  if(exportBtn) exportBtn.onclick=()=>{
    sfx('ui');
    try{
      const blob=new Blob([JSON.stringify(profile,null,2)],{type:'application/json'});
      const url=URL.createObjectURL(blob);
      const a=document.createElement('a');
      a.href=url;a.download=`catoons-td-save-${new Date().toISOString().slice(0,10)}.json`;
      document.body.appendChild(a);a.click();a.remove();
      setTimeout(()=>URL.revokeObjectURL(url),4000);
      showSaveIoStatus('✓ Save exportado. Guarde o arquivo .json em um lugar seguro.');
    }catch(err){ console.warn('Falha ao exportar save.',err); showSaveIoStatus('Não foi possível exportar o save.',true); }
  };

  const importInput=$('#menu-import-save-input'),importBtn=$('#menu-import-save');
  if(importBtn&&importInput){
    importBtn.onclick=()=>{sfx('ui');importInput.click();};
    importInput.onchange=()=>{
      const file=importInput.files&&importInput.files[0];
      if(!file) return;
      const reader=new FileReader();
      reader.onload=()=>{
        try{
          const parsed=JSON.parse(String(reader.result));
          profile=normalizeProfile(parsed);
          saveProfile();
          applyUiScale(profile.settings&&profile.settings.uiScale);
          if($('#menu-ui-scale'))$('#menu-ui-scale').value=String(profile.settings&&profile.settings.uiScale||1);
          renderHub();
          if(personalTd&&personalTd.renderHotbar) personalTd.renderHotbar();
          showSaveIoStatus(`✓ Save importado: nível ${profile.level}, ${profile.coins} moedas, ${totalStars()} estrelas.`);
        }catch(err){
          console.warn('Falha ao importar save.',err);
          showSaveIoStatus('Arquivo inválido — não parece um save do Catoons TD.',true);
        }
        importInput.value='';
      };
      reader.readAsText(file);
    };
  }
}

// v0.22.0 — Tutorial 2.0: as primeiras etapas validam a ação real do jogador.
// O cartão não bloqueia o jogo; quando a ação pedida acontece, a etapa avança sozinha.
const MATCH_TUTORIAL_STEPS=[
  {id:'pick',sel:'.td-tower-picker',action:'towerSelected',text:'Comece escolhendo um gatinho na barra. O Dardo é barato e ótimo para aprender.',task:'Escolha qualquer gatinho na barra da direita.'},
  {id:'place',sel:'.canvas-wrap',action:'towerPlaced',text:'Agora coloque o gatinho fora da estrada e longe de obstáculos. A área válida é confirmada no próprio mapa.',task:'Clique em um ponto válido do mapa para posicionar.'},
  {id:'inspect',sel:'.canvas-wrap',action:'towerInspected',text:'Clique no gatinho que você acabou de colocar. É aqui que você abre upgrades, venda, reposicionamento e Maestria.',task:'Clique em uma torre já colocada.'},
  {id:'wave',sel:'.td-side-controls',action:'waveStarted',text:'Sua defesa está pronta. Chame a primeira rodada; depois você pode usar 2×/3× ou até sobrepor ondas quando quiser mais ritmo.',task:'Clique em Rodada 1.'},
  {id:'hero',sel:'.td-hero-slot',text:'O Herói equipado é único por partida. Ele sobe do Nv.1 ao Nv.10 no próprio mapa, libera habilidade no Nv.5 e Ultimate no Nv.10.',task:'Herói: 1 por partida. Você pode colocá-lo quando tiver dinheiro.'},
  {id:'powers',sel:'.power-hotbar-wrap',text:'Poderes gastam cargas da mochila e são temporários. Guarde-os para uma onda difícil, um Boss ou quando a defesa estiver perto de romper.',task:'Poderes são consumíveis; usar é opcional.'},
  {id:'menu',sel:'#td-exit',text:'Por fim, o Menu pausa a partida e dá acesso a som, tamanho da interface, save e saída. Pronto: o resto você descobre jogando. 🐱',task:'Tutorial concluído.'}
];
let matchTutorialIndex=0,matchTutorialActive=false,matchTutorialAdvanceTimer=null;
function clearTutorialSpotlight(){ $$('.tutorial-spotlight').forEach(el=>el.classList.remove('tutorial-spotlight')); }
function hideMatchTutorialOverlay(){
  clearTutorialSpotlight();
  if(matchTutorialAdvanceTimer){clearTimeout(matchTutorialAdvanceTimer);matchTutorialAdvanceTimer=null;}
  const overlay=$('#match-tutorial');if(overlay)overlay.hidden=true;
  matchTutorialActive=false;
}
function renderMatchTutorialStep(){
  clearTutorialSpotlight();
  const step=MATCH_TUTORIAL_STEPS[matchTutorialIndex];
  if(!step){ endMatchTutorial(); return; }
  matchTutorialActive=true;
  const target=$(step.sel);if(target)target.classList.add('tutorial-spotlight');
  if($('#match-tutorial-step'))$('#match-tutorial-step').textContent=`Treinamento • ${matchTutorialIndex+1}/${MATCH_TUTORIAL_STEPS.length}`;
  if($('#match-tutorial-text'))$('#match-tutorial-text').textContent=step.text;
  if($('#match-tutorial-task')){$('#match-tutorial-task').textContent=step.task||'';$('#match-tutorial-task').classList.toggle('done',false);}
  const nextBtn=$('#match-tutorial-next');
  if(nextBtn){
    if(step.action){nextBtn.disabled=true;nextBtn.textContent='Faça a ação destacada';}
    else{nextBtn.disabled=false;nextBtn.textContent=matchTutorialIndex>=MATCH_TUTORIAL_STEPS.length-1?'Concluir tutorial 🐱':'Próximo →';}
  }
}
function startMatchTutorial(){
  matchTutorialIndex=0;const overlay=$('#match-tutorial');if(!overlay)return;
  overlay.hidden=false;renderMatchTutorialStep();
}
function advanceMatchTutorial(){
  matchTutorialIndex++;
  if(matchTutorialIndex>=MATCH_TUTORIAL_STEPS.length){endMatchTutorial();return;}
  renderMatchTutorialStep();
}
function notifyMatchTutorialAction(action){
  if(!matchTutorialActive)return;
  const step=MATCH_TUTORIAL_STEPS[matchTutorialIndex];
  if(!step||step.action!==action)return;
  if($('#match-tutorial-task')){$('#match-tutorial-task').textContent='✓ Feito!';$('#match-tutorial-task').classList.add('done');}
  const nextBtn=$('#match-tutorial-next');if(nextBtn){nextBtn.disabled=true;nextBtn.textContent='✓ Certo!';}
  clearTutorialSpotlight();
  if(matchTutorialAdvanceTimer)clearTimeout(matchTutorialAdvanceTimer);
  matchTutorialAdvanceTimer=setTimeout(()=>{matchTutorialAdvanceTimer=null;advanceMatchTutorial();},520);
}
function endMatchTutorial(){
  hideMatchTutorialOverlay();
  if(!profile.matchTutorialSeen){profile.matchTutorialSeen=true;saveProfile();}
}
function maybeStartMatchTutorial(){if(profile.matchTutorialSeen)return;setTimeout(startMatchTutorial,450);}
function initMatchTutorial(){
  if($('#match-tutorial-next'))$('#match-tutorial-next').onclick=()=>{const step=MATCH_TUTORIAL_STEPS[matchTutorialIndex];if(step&&step.action)return;sfx('ui');advanceMatchTutorial();};
  if($('#match-tutorial-skip'))$('#match-tutorial-skip').onclick=()=>{sfx('ui');endMatchTutorial();};
}

const loadingTips=[
  'Dica: gatinhos Sniper enxergam qualquer camuflado do mapa, de qualquer posição.',
  'Dica: só o Gato Bombinha quebra a blindagem dos balões blindados.',
  'Dica: o Gato Gelinho é FULL AOE — cada ataque acerta todos os alvos no alcance.',
  'Dica: quanto mais forte o balão, mais dinheiro ele solta ao estourar.',
  'Dica: a cor do balão mostra quantos tiros ele aguenta — Vermelho é 1, e vai subindo até o Preto. Uma torre bem upada pode estourar várias cores de uma vez.',
  'Dica: as rodadas ficam mais difíceis com o tempo — reforce a defesa antes de avançar.',
  'Dica: você pode chamar a próxima rodada mesmo com inimigos ainda em campo.',
  'Dica: use a velocidade 2× ou 3× para acelerar rodadas mais tranquilas.',
  'Dica: poderes da mochila só duram alguns segundos — use no momento certo.',
  'Dica: árvores, pedras e obstáculos grandes bloqueiam a linha de visão dos gatinhos. Posicionamento agora importa mais.'
];

function runMapLoading(mapId,diffId,onReady,modeId='campaign'){
  const overlay=$('#loading-screen');
  if(!overlay){onReady();return;}
  const map=maps[mapId]||maps.grove,diff=difficulties[diffId]||difficulties.easy;
  const preview=$('#loading-preview');
  if(preview) preview.className=`loading-preview preview-${mapId in maps?mapId:'grove'}`;
  if($('#loading-map-name')) $('#loading-map-name').textContent=map.name;
  if($('#loading-diff-name')) $('#loading-diff-name').textContent=modeId==='infinite'?`∞ Infinito • ${diff.name} • sem rodada final`:`${diff.name} • ${mapRounds(mapId,diffId)} rodadas`;
  if($('#loading-tip')) $('#loading-tip').textContent=loadingTips[Math.floor(Math.random()*loadingTips.length)];
  const fill=$('#loading-bar-fill');
  if(fill) fill.style.width='0%';
  overlay.classList.add('visible');
  overlay.setAttribute('aria-hidden','false');
  requestAnimationFrame(()=>overlay.classList.add('show'));

  const duration=900+Math.random()*500;
  const start=performance.now();
  let done=false;
  function step(ts){
    const pct=Math.min(100,((ts-start)/duration)*100);
    if(fill) fill.style.width=`${pct}%`;
    if(pct<100){requestAnimationFrame(step);return;}
    if(done)return;
    done=true;
    onReady();
    overlay.classList.remove('show');
    setTimeout(()=>{overlay.classList.remove('visible');overlay.setAttribute('aria-hidden','true');},220);
  }
  requestAnimationFrame(step);
}

function initPersonalTd(){
  const canvas=$('#personal-td-canvas');
  if(!canvas||personalTd) return;
  const ctx=canvas.getContext('2d'),W=canvas.width,H=canvas.height,MAX_LEVEL=4;
  const state={
    map:'grove',difficulty:'easy',mode:'campaign',money:720,lives:25,wave:0,lastClearedWave:0,lastFarmPaidWave:0,selected:null,selectedTower:null,selectedHero:false,repositionTower:null,hero:null,
    nextTowerId:1,nextEnemyId:1,paused:false,menuOpen:false,defeatShown:false,gameSpeed:1,waveActive:false,completed:false,rewardGranted:false,
    enemies:[],towers:[],shots:[],spawn:[],shadowBloons:[],pulses:[],lightning:[],airstrikes:[],bombs:[],floatTexts:[],particles:[],impactFx:[],muzzleFx:[],particleTimer:0,screenShake:0,last:0,
    pendingClearCash:0,pendingWaveXp:0,paidMilestones:new Set(),
    masteryXpGranted:false,masterySession:Object.fromEntries(Object.keys(types).map(id=>[id,{used:false,damage:0,pops:0,income:0,actions:0}])),
    effects:{frenzy:0,focus:0,blizzard:0},powerUiClock:0,synergyAnnounced:{},
    playtest:{visible:false,frames:0,fps:0,lastFpsAt:performance.now(),lastPanelAt:0},
    msg:'Escolha um mapa e uma dificuldade no lobby Play.'
  };

  // A maioria dos mapas tem uma única rota (`map.path`). Mapas com duas rotas paralelas
  // (Difíceis/Impossíveis) usam `map.paths` (array de rotas) em vez de `map.path`; `path`/
  // `segs`/`total` abaixo sempre refletem a rota de índice 0, mantidos por compatibilidade
  // com todo o código que já assumia uma única rota. `pathsList`/`segsList`/`totalsList`
  // guardam TODAS as rotas do mapa atual, indexadas por `enemy.path` (0 = primeira rota,
  // 1 = segunda rota; balões sem `.path` definido usam a rota 0, ou seja, mapas antigos
  // continuam funcionando sem qualquer mudança).
  let path=[],segs=[],total=0;
  let pathsList=[],segsList=[],totalsList=[];

  function currentMap(){return maps[state.map];}
  function currentDifficulty(){return difficulties[state.difficulty];}
  function isInfinite(){return state.mode==='infinite';}
  function currentHeroDef(){return HEROES[profile.selectedHero]||HEROES.king;}
  function towerTypePresent(typeId){return state.towers.some(t=>t.type===typeId);}
  function togglePlaytestDebug(force){
    const panel=$('#playtest-debug');if(!panel)return;
    state.playtest.visible=typeof force==='boolean'?force:!state.playtest.visible;
    panel.hidden=!state.playtest.visible;
    if(state.playtest.visible){state.playtest.lastPanelAt=0;setMsg('🧪 Painel de playtest ativado. Pressione F8 para ocultar.');}
  }
  function renderPlaytestDebug(ts){
    if(!state.playtest)return;
    state.playtest.frames++;
    const elapsed=ts-state.playtest.lastFpsAt;
    if(elapsed>=500){state.playtest.fps=Math.round(state.playtest.frames*1000/elapsed);state.playtest.frames=0;state.playtest.lastFpsAt=ts;}
    if(!state.playtest.visible||ts-state.playtest.lastPanelAt<220)return;
    state.playtest.lastPanelAt=ts;
    const body=$('#playtest-debug-body');if(!body)return;
    const alive=state.enemies.filter(e=>!e.dead);
    const bosses=alive.filter(e=>e.kind==='boss');
    const boss=bosses.sort((a,b)=>(b.hp||0)-(a.hp||0))[0];
    const projectileCount=state.shots.length+state.lightning.length+state.bombs.length+state.airstrikes.length;
    const fxCount=state.particles.length+state.pulses.length+state.impactFx.length+state.muzzleFx.length+state.floatTexts.length;
    const syn=activeSynergies().map(([,v])=>`${v.icon} ${v.name}`);
    const heroText=state.hero?`${HEROES[state.hero.type]?.name||state.hero.type} Nv.${state.hero.level||1}`:'—';
    const mem=performance.memory&&performance.memory.usedJSHeapSize?`${Math.round(performance.memory.usedJSHeapSize/1048576)} MB`:'n/d';
    const bossText=boss?`${Math.max(0,Math.ceil(boss.hp||0))}/${Math.max(1,Math.ceil(boss.maxHp||boss.hp||1))}`:'—';
    const warn=state.playtest.fps&&state.playtest.fps<45?' <span class="playtest-debug-warn">⚠ FPS baixo</span>':'';
    body.innerHTML=`
      <div class="playtest-debug-row"><span>FPS</span><b>${state.playtest.fps||'…'}${warn}</b></div>
      <div class="playtest-debug-row"><span>Velocidade</span><b>${state.gameSpeed}×</b></div>
      <div class="playtest-debug-row"><span>Rodada</span><b>${state.wave}/${isInfinite()?'∞':mapRounds(state.map,state.difficulty)}</b></div>
      <div class="playtest-debug-row"><span>Vidas</span><b>${state.lives}</b></div>
      <div class="playtest-debug-row"><span>Dinheiro</span><b>$${Math.floor(state.money)}</b></div>
      <div class="playtest-debug-row"><span>Inimigos</span><b>${alive.length} + ${state.spawn.length}</b></div>
      <div class="playtest-debug-row"><span>Torres</span><b>${state.towers.length}</b></div>
      <div class="playtest-debug-row"><span>Projéteis</span><b>${projectileCount}</b></div>
      <div class="playtest-debug-row"><span>Efeitos</span><b>${fxCount}</b></div>
      <div class="playtest-debug-row"><span>Memória JS</span><b>${mem}</b></div>
      <div class="playtest-debug-row"><span>Boss HP</span><b>${bossText}</b></div>
      <div class="playtest-debug-row"><span>Herói</span><b>${heroText}</b></div>
      <div class="playtest-debug-wide playtest-debug-synergy"><b>Sinergias:</b> ${syn.length?syn.join(' • '):'nenhuma'}</div>`;
  }

  function synergyActive(id){
    const syn=SYNERGIES[id];if(!syn)return false;
    if(syn.towers&&!syn.towers.every(towerTypePresent))return false;
    if(syn.hero&&state.hero?.type!==syn.hero)return false;
    return true;
  }
  function activeSynergies(){return Object.entries(SYNERGIES).filter(([id])=>synergyActive(id));}
  function renderSynergies(){
    const root=$('#td-synergy-panel');if(!root)return;
    const active=activeSynergies();
    root.hidden=!active.length;
    root.innerHTML=active.length?`<div class="synergy-head"><span>🔗 SINERGIAS ATIVAS</span><b>${active.length}</b></div><div class="synergy-pills">${active.map(([id,syn])=>`<span class="synergy-pill" title="${syn.description}">${syn.icon} ${syn.name}</span>`).join('')}</div>`:'';
  }
  function announceNewSynergies(){
    const fresh=activeSynergies().filter(([id])=>!state.synergyAnnounced[id]);
    fresh.forEach(([id])=>state.synergyAnnounced[id]=true);
    renderSynergies();
    if(fresh.length){
      const names=fresh.map(([,syn])=>`${syn.icon} ${syn.name}`).join(' • ');
      setMsg(`🔗 SINERGIA ATIVADA: ${names}`);sfx('ui');
    }
    return fresh.length;
  }
  function heroRequiredXp(level){return level>=10?0:45+(Math.max(1,level)-1)*15;}
  function heroStats(hero=state.hero){
    if(!hero)return null;
    const base=HEROES[hero.type]||HEROES.king,lv=Math.max(1,Math.min(10,hero.level||1));
    return{...base,
      damage:Number(((base.damage||0)*(1+(lv-1)*.13)).toFixed(2)),
      range:base.range?Math.round(base.range+(lv-1)*4):0,
      rate:base.rate?Number((base.rate*Math.max(.66,1-(lv-1)*.035)).toFixed(3)):0,
      auraRange:base.auraRange?Math.round(base.auraRange+(lv-1)*4):0,
      farmIncome:base.farm?Math.round(28+(lv-1)*7):0,
      detectsCamo:Boolean(base.detectsCamo||hero.type==='warrior'&&lv>=7),
      breaksArmor:Boolean(hero.type==='warrior'&&lv>=6),
      level:lv,isHeroSource:true,heroType:hero.type
    };
  }
  function grantHeroXp(amount){
    const h=state.hero;if(!h||h.level>=10)return[];
    h.xp=Math.max(0,(h.xp||0)+Math.max(0,Math.floor(amount||0)));
    const gained=[];
    while(h.level<10&&h.xp>=heroRequiredXp(h.level)){
      h.xp-=heroRequiredXp(h.level);h.level++;gained.push(h.level);sfx('ui');
      spawnFloatText(h.x,h.y-42,`🦸 NÍVEL ${h.level}!`,HEROES[h.type].color);
    }
    if(gained.length){
      const unlock=gained.includes(10)?` ⭐ ULTIMATE ${HEROES[h.type].ultimate.name} liberada!`:gained.includes(5)?` ${HEROES[h.type].skill.icon} ${HEROES[h.type].skill.name} liberada!`:'';
      setMsg(`🦸 ${HEROES[h.type].name} chegou ao nível ${h.level}!${unlock}`);
    }
    renderHeroHud();return gained;
  }
  // Upar o Herói gastando ouro da partida em vez de esperar XP em combate — sempre mais caro que
  // um upgrade de gatinho comum no mesmo estágio (as unidades normais custam de $40 a ~$740 no T5;
  // aqui a curva começa em $180 e sobe rápido, deixando claro que é um atalho premium).
  function heroLevelUpCost(level){return Math.round(180+(Math.max(1,level)-1)*70);}
  function buyHeroLevel(){
    const h=state.hero;
    if(!h){setMsg('Coloque um Herói em campo antes de upar com ouro.');return;}
    if(h.level>=10){setMsg('🦸 Herói já está no nível máximo.');return;}
    const cost=heroLevelUpCost(h.level);
    if(state.money<cost){setMsg(`Faltam $${cost-Math.floor(state.money)} para upar ${HEROES[h.type].name} com ouro.`);return;}
    state.money-=cost;
    const missing=Math.max(0,heroRequiredXp(h.level)-(h.xp||0));
    grantHeroXp(missing);
    updateStats();
  }
  function infiniteMilestoneReward(wave){
    const step=Math.max(1,Math.floor(wave/10));
    return Math.round((40+(step-1)*10)*currentDifficulty().coinMultiplier);
  }

  function configurePath(){
    const map=currentMap();
    pathsList=map.paths||[map.path];
    segsList=pathsList.map(p=>{
      const s=[];let t=0;
      for(let i=0;i<p.length-1;i++){
        const a=p[i],b=p[i+1],len=Math.hypot(b.x-a.x,b.y-a.y);
        s.push({a,b,len,start:t});t+=len;
      }
      return s;
    });
    totalsList=segsList.map(s=>s.length?s[s.length-1].start+s[s.length-1].len:0);
    path=pathsList[0];segs=segsList[0];total=totalsList[0];
  }

  function pathTotal(pathIndex){
    const t=totalsList[pathIndex||0];
    return t!=null?t:total;
  }

  function pointAt(d,pathIndex){
    const s2=segsList[pathIndex||0]||segs;
    let s=s2[s2.length-1];
    for(const x of s2){if(d<=x.start+x.len){s=x;break;}}
    const t=Math.max(0,Math.min(1,(d-s.start)/s.len));
    return{x:s.a.x+(s.b.x-s.a.x)*t,y:s.a.y+(s.b.y-s.a.y)*t};
  }

  function distPath(x,y){
    // Distância até a rota mais próxima (dentre TODAS as rotas do mapa) — usada para
    // impedir posicionar torre em cima de qualquer uma delas.
    let best=Infinity;
    for(const segsForPath of segsList){
      for(const s of segsForPath){
        const vx=s.b.x-s.a.x,vy=s.b.y-s.a.y,l2=vx*vx+vy*vy;
        const t=Math.max(0,Math.min(1,((x-s.a.x)*vx+(y-s.a.y)*vy)/l2));
        const px=s.a.x+vx*t,py=s.a.y+vy*t;
        const dd=Math.hypot(x-px,y-py);
        if(dd<best)best=dd;
      }
    }
    return best;
  }

  function currentObstacles(){return currentMap().obstacles||[];}

  function segmentHitsCircle(ax,ay,bx,by,cx,cy,r){
    const vx=bx-ax,vy=by-ay,l2=vx*vx+vy*vy;
    if(l2<=.0001)return Math.hypot(ax-cx,ay-cy)<=r;
    const t=Math.max(0,Math.min(1,((cx-ax)*vx+(cy-ay)*vy)/l2));
    const px=ax+vx*t,py=ay+vy*t;
    return Math.hypot(px-cx,py-cy)<=r;
  }

  function hasLineOfSight(tower,point){
    return !currentObstacles().some(o=>segmentHitsCircle(tower.x,tower.y,point.x,point.y,o.x,o.y,o.r));
  }

  // Distância, a partir de (ox,oy) na direção "angle", até o primeiro obstáculo que bloqueia
  // a linha de tiro (ou null se nada bloquear dentro de maxDist). Usado para: 1) girar o
  // gatinho para a direção realmente livre e 2) desenhar a "zona morta" vermelha no alcance.
  function raycastBlockDistance(ox,oy,angle,maxDist){
    const dx=Math.cos(angle),dy=Math.sin(angle);
    let minT=null;
    for(const o of currentObstacles()){
      const cx=o.x-ox,cy=o.y-oy;
      const proj=cx*dx+cy*dy;
      if(proj<-o.r||proj>maxDist+o.r)continue;
      const perp2=cx*cx+cy*cy-proj*proj,r2=o.r*o.r;
      if(perp2>r2)continue;
      const thc=Math.sqrt(Math.max(0,r2-perp2));
      let tEnter=proj-thc;
      if(tEnter<0)tEnter=0;
      if(tEnter<maxDist&&(minT===null||tEnter<minT))minT=tEnter;
    }
    return minT;
  }

  function stepAngleTowards(current,target,maxDelta){
    let diff=((target-current+Math.PI)%(Math.PI*2)+Math.PI*2)%(Math.PI*2)-Math.PI;
    if(diff>maxDelta)diff=maxDelta;else if(diff<-maxDelta)diff=-maxDelta;
    return current+diff;
  }

  function obstacleAt(x,y,padding=0){
    return currentObstacles().find(o=>Math.hypot(x-o.x,y-o.y)<o.r+padding)||null;
  }

  function setMsg(text){
    state.msg=text;
    const el=$('#td-message');if(el)el.textContent=text;
  }

  function showGameModal(selector){
    const el=$(selector);if(!el)return;
    el.classList.add('visible');el.setAttribute('aria-hidden','false');
  }
  function hideGameModal(selector){
    const el=$(selector);if(!el)return;
    el.classList.remove('visible');el.setAttribute('aria-hidden','true');
  }
  function syncVolumeUi(){
    const value=Math.round(audioVolume()*100),slider=$('#menu-volume'),label=$('#menu-volume-value');
    if(slider)slider.value=String(value);if(label)label.textContent=`${value}%`;
    const mValue=Math.round(musicVolume()*100),mSlider=$('#menu-music'),mLabel=$('#menu-music-value');
    if(mSlider)mSlider.value=String(mValue);if(mLabel)mLabel.textContent=`${mValue}%`;
    const scaleSel=$('#menu-ui-scale');
    if(scaleSel)scaleSel.value=String(profile.settings&&profile.settings.uiScale||1);
  }
  function openPauseMenu(){
    if(state.completed||state.lives<=0)return;
    hideMatchTutorialOverlay();
    state.menuOpen=true;state.paused=true;syncVolumeUi();
    $$('.match-only-action').forEach(btn=>btn.hidden=false);
    $$('.settings-only-action').forEach(btn=>btn.hidden=true);
    if($('#menu-kicker'))$('#menu-kicker').textContent='PARTIDA PAUSADA';
    if($('#menu-title'))$('#menu-title').textContent='Menu';
    if($('#menu-subtitle'))$('#menu-subtitle').textContent='Ajuste o som ou escolha o que fazer com a partida atual.';
    showGameModal('#pause-menu');
    if($('#td-pause')){$('#td-pause').textContent='▶';$('#td-pause').title='Continuar';}
  }
  function closePauseMenu(resume=true){
    state.menuOpen=false;hideGameModal('#pause-menu');
    if(resume){state.paused=false;if($('#td-pause')){$('#td-pause').textContent='⏸';$('#td-pause').title='Pausar';}}
  }
  // Acessível pelo botão "⚙️ Som" da barra de navegação — mesmas duas barras de volume,
  // fora de uma partida (esconde os botões "Continuar/Reiniciar/Voltar", que não fazem
  // sentido sem uma partida em andamento, e mostra só um botão de fechar).
  function openSettingsModal(){
    syncVolumeUi();
    $$('.match-only-action').forEach(btn=>btn.hidden=true);
    $$('.settings-only-action').forEach(btn=>btn.hidden=false);
    if($('#menu-kicker'))$('#menu-kicker').textContent='CONFIGURAÇÕES';
    if($('#menu-title'))$('#menu-title').textContent='Som';
    if($('#menu-subtitle'))$('#menu-subtitle').textContent='Ajuste o volume dos efeitos e da música — vale pra qualquer tela do jogo.';
    showGameModal('#pause-menu');
  }
  function nextStageSelection(){
    const ids=MAP_CATEGORIES.flatMap(c=>c.maps).filter(id=>maps[id]),index=ids.indexOf(state.map);
    if(index>=0&&index<ids.length-1)return{map:ids[index+1],difficulty:state.difficulty,label:`Próxima fase: ${maps[ids[index+1]].name}`};
    const dIndex=difficultyOrder.indexOf(state.difficulty);
    if(dIndex>=0&&dIndex<difficultyOrder.length-1)return{map:ids[0],difficulty:difficultyOrder[dIndex+1],label:`Próxima dificuldade: ${difficulties[difficultyOrder[dIndex+1]].name}`};
    return null;
  }
  function showResult(victory,details={}){
    state.paused=true;state.menuOpen=false;hideGameModal('#pause-menu');
    const masteryRewards=masteryMatchRewards(),masteryXpTotal=masteryRewards.reduce((sum,r)=>sum+r.xp,0),masteryCoinTotal=masteryRewards.reduce((sum,r)=>sum+r.coins,0);
    const endless=isInfinite();
    const next=victory&&!endless?nextStageSelection():null;
    const resultCard=$('#result-screen .result-card');
    if(resultCard){resultCard.classList.toggle('victory',victory);resultCard.classList.toggle('defeat',!victory);}
    if($('#result-icon'))$('#result-icon').textContent=victory?'🏆':(endless?'∞':'💔');
    if($('#result-kicker'))$('#result-kicker').textContent=victory?'FASE CONCLUÍDA':(endless?'MODO INFINITO ENCERRADO':'DEFESA ROMPIDA');
    if($('#result-title'))$('#result-title').textContent=victory?'Vitória!':(endless?'Fim do Infinito':'Derrota');
    if($('#result-text'))$('#result-text').textContent=victory
      ?`${currentMap().name} • ${currentDifficulty().name} concluído.`
      :(endless?`Você chegou até a rodada ${Math.max(state.wave,state.lastClearedWave)}. Seu recorde fica salvo para a próxima tentativa.`:'Os inimigos atravessaram sua defesa. Reorganize as torres e tente novamente.');
    if($('#result-summary'))$('#result-summary').innerHTML=victory
      ?`<span>⭐ ${mapStars(state.map)}/3 no mapa</span><span>🪙 +${(details.coins||0)+masteryCoinTotal}</span><span>XP conta +${details.xp||0}</span><span>🐾 Maestria +${masteryXpTotal} XP</span>`
      :(endless
        ?`<span>✓ ${state.lastClearedWave} rodadas concluídas</span><span>∞ Recorde ${infiniteBestFor(state.map,state.difficulty)}</span><span>🐾 Maestria +${masteryXpTotal} XP</span>`
        :`<span>Rodada ${state.wave}/${mapRounds(state.map,state.difficulty)}</span><span>Torres ${state.towers.length}</span><span>🐾 Maestria +${masteryXpTotal} XP</span>`);
    const nextBtn=$('#result-next');if(nextBtn){nextBtn.hidden=!next;nextBtn.textContent=next?`${next.label} →`:'Próxima fase →';nextBtn.dataset.nextMap=next?next.map:'';nextBtn.dataset.nextDifficulty=next?next.difficulty:'';}
    if($('#result-retry'))$('#result-retry').textContent=victory?'↻ Jogar novamente':'↻ Tentar novamente';
    showGameModal('#result-screen');
    sfx(victory?'win':'lose');
  }

  function effectActive(id){return(state.effects[id]||0)>0;}

  function spawnFloatText(x,y,text,color){
    if(state.floatTexts.length>60)return; // evita acumular texto demais em combates grandes
    state.floatTexts.push({x,y,text,color:color||'#ffe89a',life:.9,maxLife:.9});
  }

  // v0.20.0: número de dano flutuante em CADA acerto que sobrevive (não só nos eventos
  // especiais que já tinham texto próprio) — antes o jogador só via "quanto" um ataque
  // fez quando o balão morria (o "+$" do prêmio); agora todo hit relevante mostra
  // "-N" na hora, com destaque maior pra acertos que tiram uma fatia grande da vida.
  function spawnDamageNumber(enemy,actual,opts){
    if(!enemy||actual<=0||state.floatTexts.length>60)return;
    opts=opts||{};
    const p=pointAt(enemy.d,enemy.path),jitterX=(Math.random()-.5)*14,big=actual>=(enemy.maxHp||actual)*.4;
    const label=`${opts.crit?'✦':''}-${actual>=10?Math.round(actual):Number(actual.toFixed(1))}`;
    state.floatTexts.push({x:p.x+jitterX,y:p.y-16-Math.random()*6,text:label,
      color:opts.crit?'#ffd36b':(big?'#ffb9b9':'#f2f6ff'),life:opts.crit||big?.7:.5,maxLife:opts.crit||big?.7:.5,dmg:true});
  }

  // v0.21.0 — Combat Polish: recuo, clarão de disparo, impacto e tremor leve.
  // Os efeitos são puramente visuais e têm limites rígidos para não pesar no modo infinito.
  function towerFxColor(type,st){
    if(type==='frost')return '#c8f5ff';
    if(type==='burst')return '#ff9a6b';
    if(type==='laser')return '#ff6574';
    if(type==='ninja')return '#c4a2ff';
    if(type==='wizard')return '#d8c4ff';
    if(type==='electric')return '#ffe66d';
    if(type==='vine')return '#78df91';
    if(type==='sniper')return '#b7ffd0';
    return (st&&st.color)||'#f3bf67';
  }
  function triggerAttackFx(unit,st,kind='shot'){
    if(!unit)return;
    unit.recoil=Math.max(unit.recoil||0,kind==='sniper'?.16:kind==='burst'?.13:.09);
    unit.attackFlash=.12;
    if(state.muzzleFx.length<45 && !st?.fullAoe && !st?.rootHold){
      const a=unit.angle||0,dist=kind==='sniper'?33:kind==='burst'?28:24;
      state.muzzleFx.push({x:unit.x+Math.cos(a)*dist,y:unit.y+Math.sin(a)*dist,angle:a,
        color:towerFxColor(unit.type,st),kind,life:.11,maxLife:.11});
    }
  }
  function spawnImpactFx(enemy,amount,source){
    if(!enemy||amount<=0||state.impactFx.length>=80)return;
    const p=pointAt(enemy.d,enemy.path),type=source&&source.sourceType||source&&source.heroType||'';
    const color=towerFxColor(type,source),big=amount>=Math.max(4,(enemy.maxHp||amount)*.28);
    state.impactFx.push({x:p.x,y:p.y,color,life:big?.24:.16,maxLife:big?.24:.16,big,
      shards:big?7:4,seed:Math.random()*6.28});
    enemy.hitFlash=Math.max(enemy.hitFlash||0,big?.12:.07);
    if(big)state.screenShake=Math.max(state.screenShake,Math.min(4.2,1.1+amount*.05));
  }

  function popReward(hp,opts){
    opts=opts||{};
    const diff=currentDifficulty(),map=currentMap();
    let bonus=5;
    if(opts.elite)bonus+=4;
    if(opts.camo)bonus+=2;
    if(opts.armored)bonus+=3;
    if(opts.heavy)bonus+=3;
    if(opts.fast)bonus+=2;
    if(opts.regen)bonus+=3;
    if(opts.boss)bonus+=40;
    // hp agora é pequeno e limitado (camadas estilo Bloons), então escala linear em vez de raiz.
    return Math.max(1,Math.round((1+bonus*.18+Math.max(0,hp)*1.15)*map.rewardMultiplier*diff.waveReward));
  }

  const MAP_PARTICLE_KIND={grove:'leaf',ridge:'snow',toll:'ember'};

  function makeMapParticle(){
    const kind=MAP_PARTICLE_KIND[state.map]||'leaf';
    if(kind==='leaf'){
      const leafColors=['#e2a24b','#d97b4f','#e8c34f','#7fae4a'];
      return{kind,x:Math.random()*W,y:-14,vx:(Math.random()-.5)*22,vy:26+Math.random()*20,
        rot:Math.random()*Math.PI*2,rotSpeed:(Math.random()-.5)*3.4,sway:Math.random()*Math.PI*2,
        swaySpeed:1.1+Math.random()*1.3,size:4+Math.random()*3.4,color:leafColors[Math.floor(Math.random()*leafColors.length)],life:99};
    }
    if(kind==='snow'){
      return{kind,x:Math.random()*W,y:-10,vx:(Math.random()-.5)*10,vy:16+Math.random()*16,
        sway:Math.random()*Math.PI*2,swaySpeed:.7+Math.random()*.8,size:1.6+Math.random()*2.4,life:99};
    }
    return{kind,x:Math.random()*W,y:H+10,vx:(Math.random()-.5)*6,vy:-(14+Math.random()*18),
      size:1.2+Math.random()*2,flicker:Math.random()*Math.PI*2,
      color:Math.random()<.5?'#f3bf67':'#ff9d6c',life:99};
  }

  function updateParticles(dt){
    const rate=state.map==='toll'?.16:.11;
    state.particleTimer+=dt;
    while(state.particleTimer>=rate&&state.particles.length<70){
      state.particleTimer-=rate;
      state.particles.push(makeMapParticle());
    }
    state.particles.forEach(p=>{
      if(p.kind==='leaf'){
        p.sway+=p.swaySpeed*dt;p.rot+=p.rotSpeed*dt;
        p.x+=(p.vx+Math.sin(p.sway)*26)*dt;p.y+=p.vy*dt;
      }else if(p.kind==='snow'){
        p.sway+=p.swaySpeed*dt;p.x+=(p.vx+Math.sin(p.sway)*14)*dt;p.y+=p.vy*dt;
      }else{
        p.flicker+=dt*4;p.x+=p.vx*dt;p.y+=p.vy*dt;
      }
    });
    state.particles=state.particles.filter(p=>p.y>-24&&p.y<H+24&&p.x>-24&&p.x<W+24);
  }

  function drawParticles(){
    state.particles.forEach(p=>{
      ctx.save();
      if(p.kind==='leaf'){
        ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.globalAlpha=.85;ctx.fillStyle=p.color;
        ctx.beginPath();ctx.ellipse(0,0,p.size,p.size*.6,0,0,Math.PI*2);ctx.fill();
      }else if(p.kind==='snow'){
        ctx.globalAlpha=.75;ctx.fillStyle='#f4fbff';
        ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill();
      }else{
        const a=.45+.4*Math.abs(Math.sin(p.flicker));
        ctx.globalAlpha=a;ctx.fillStyle=p.color;ctx.shadowColor=p.color;ctx.shadowBlur=6;
        ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill();
      }
      ctx.restore();
    });
  }

  function dartPaths(t){
    if(!t.paths||!Array.isArray(t.paths))t.paths=[0,0,0];
    while(t.paths.length<3)t.paths.push(0);
    t.paths=t.paths.slice(0,3).map(v=>Math.max(0,Math.min(DART_MAX_TIER,Math.floor(Number(v)||0))));
    return t.paths;
  }

  function dartPrimaryPath(t){
    const p=dartPaths(t);
    if(Number.isInteger(t.dartMainPath)&&p[t.dartMainPath]>=4)return t.dartMainPath;
    // Autocorreção defensiva: se um estado antigo/inconsistente já tiver T4/T5,
    // recupera o caminho principal em vez de deixar dois caminhos passarem do T3.
    const high=p.map((tier,i)=>({tier,i})).filter(x=>x.tier>=4).sort((a,b)=>b.tier-a.tier);
    if(!high.length){t.dartMainPath=null;return null;}
    let chosen=high[0].i;
    if(high.length>1&&high[0].tier===high[1].tier&&Number.isInteger(t.dartLastPath)&&p[t.dartLastPath]>=4)chosen=t.dartLastPath;
    t.dartMainPath=chosen;
    return chosen;
  }

  function dartWeaponPath(t){
    const p=dartPaths(t),main=dartPrimaryPath(t);
    if(main===0||main===1)return main;
    const eligible=[];
    if(p[0]>=2)eligible.push({i:0,tier:p[0]});
    if(p[1]>=3)eligible.push({i:1,tier:p[1]});
    if(!eligible.length)return null;
    eligible.sort((a,b)=>b.tier-a.tier);
    if(eligible.length>1&&eligible[0].tier===eligible[1].tier&&Number.isInteger(t.dartLastPath)){
      const last=eligible.find(x=>x.i===t.dartLastPath);
      if(last)return last.i;
    }
    return eligible[0].i;
  }

  function dartBaseStats(t){
    const base=types.dart,p=dartPaths(t),primary=dartPrimaryPath(t),weaponPath=dartWeaponPath(t);
    let damage=base.damage,range=base.range,rate=base.rate,weapon='dart',chainTargets=0,multiShot=1;
    let detectsCamo=false,burn=null,bandana=p[0]>=1;

    // Caminho 1 — Arqueiro.
    if(p[0]>=1){damage+=.45;range+=12;}
    if(p[0]>=2){damage=Math.max(2,damage);if(weaponPath===0){weapon='bow';rate*=.76;chainTargets=3;}}
    if(p[0]>=3){damage+=1;range+=18;}
    if(p[0]>=4&&primary===0){multiShot=2;weapon='bow';chainTargets=3;}
    if(p[0]>=5&&primary===0){rate*=.74;range+=24;weapon='bow';chainTargets=3;}

    // Caminho 2 — Lanceiro. T1/T2 são crosspath puros; T3+ troca a arma somente
    // quando o Lanceiro é a arma dominante. Isso evita o bug em que um T3 secundário
    // roubava o arco do caminho principal.
    if(p[1]>=1)range+=15;
    if(p[1]>=2){detectsCamo=true;range+=18;}
    if(p[1]>=3){
      damage=Math.max(4,damage);
      if(weaponPath===1){weapon='spear';rate=base.rate;chainTargets=0;multiShot=1;}
    }
    if(p[1]>=4&&primary===1){damage=Math.max(6,damage+2);range+=20;weapon='spear';rate=base.rate;}
    if(p[1]>=5&&primary===1){damage=Math.max(6,damage);burn={damage:1,interval:2,ticks:4};weapon='fireSpear';rate=base.rate;}

    // Se o Arqueiro for a arma dominante após os bônus numéricos do crosspath,
    // restaura explicitamente suas propriedades de tiro.
    if(weaponPath===0){
      weapon='bow';chainTargets=3;
      rate=base.rate*.76*(p[0]>=5?.74:1);
      if(p[0]>=4)multiShot=2;
    }

    let supportDamage=0,supportRange=0,supportAttack=0,salmonBonus=0;
    if(p[2]>=1){supportDamage=.10;range+=14;}
    if(p[2]>=2)salmonBonus=.15;
    if(p[2]>=3)supportRange=.10;
    if(p[2]>=4&&primary===2)supportAttack=.10;
    if(p[2]>=5&&primary===2){supportDamage=.15;supportRange=.15;supportAttack=.15;salmonBonus=.30;}

    return{...base,damage:Number(damage.toFixed(2)),range:Math.round(range),rate:Number(rate.toFixed(3)),
      detectsCamo,revealsCamo:false,weapon,chainTargets,chainRadius:104,multiShot,burn,bandana,
      supportAuraRadius:p[2]>=1?Math.max(150,Math.round(range+26)):0,
      supportDamage,supportRange,supportAttack,salmonBonus,dartPaths:p.slice(),dartPrimary:primary,dartWeaponPath:weaponPath};
  }

  function sniperPaths(t){
    if(!t.paths||!Array.isArray(t.paths))t.paths=[0,0,0];
    while(t.paths.length<3)t.paths.push(0);
    t.paths=t.paths.slice(0,3).map(v=>Math.max(0,Math.min(SNIPER_MAX_TIER,Math.floor(Number(v)||0))));
    return t.paths;
  }

  function sniperPrimaryPath(t){
    const p=sniperPaths(t);
    if(Number.isInteger(t.sniperMainPath)&&p[t.sniperMainPath]>=4)return t.sniperMainPath;
    const high=p.map((tier,i)=>({tier,i})).filter(x=>x.tier>=4).sort((a,b)=>b.tier-a.tier);
    if(!high.length){t.sniperMainPath=null;return null;}
    let chosen=high[0].i;
    if(high.length>1&&high[0].tier===high[1].tier&&Number.isInteger(t.sniperLastPath)&&p[t.sniperLastPath]>=4)chosen=t.sniperLastPath;
    t.sniperMainPath=chosen;
    return chosen;
  }

  function sniperBaseStats(t){
    const base=types.sniper,p=sniperPaths(t),primary=sniperPrimaryPath(t);
    let damage=base.damage,rate=base.rate,pierceTargets=1,critChance=0,critMultiplier=1;
    let hunterSpecialBonus=0,hunterBossBonus=0,breaksArmor=false,markBonus=0,markDuration=0;
    let observerRange=0,observerDamage=0,revealsCamo=false,observerMark=0,observerMarkDuration=0,airstrike=false;

    // Caminho 1 — Atirador de Elite.
    if(p[0]>=1)damage+=3;
    if(p[0]>=2){damage+=3;pierceTargets=2;}
    if(p[0]>=3){critChance=.20;critMultiplier=2;pierceTargets=3;}
    if(p[0]>=4&&primary===0){damage+=6;critChance=.30;critMultiplier=2.5;pierceTargets=4;}
    if(p[0]>=5&&primary===0){damage+=8;rate*=.80;critChance=.40;critMultiplier=3;pierceTargets=6;}

    // Caminho 2 — Caçador.
    if(p[1]>=1)hunterSpecialBonus=.35;
    if(p[1]>=2){hunterSpecialBonus=.50;hunterBossBonus=.15;}
    if(p[1]>=3){markBonus=.15;markDuration=6;}
    if(p[1]>=4&&primary===1){breaksArmor=true;hunterSpecialBonus=.75;hunterBossBonus=.30;markBonus=.25;markDuration=6;}
    if(p[1]>=5&&primary===1){hunterSpecialBonus=1.00;hunterBossBonus=.75;markBonus=.35;markDuration=8;}

    // Caminho 3 — Observador. Buffs iguais entre vários Observadores não acumulam:
    // a defesa recebe apenas o maior nível global disponível.
    if(p[2]>=1)observerRange=.05;
    if(p[2]>=2)revealsCamo=true;
    if(p[2]>=3){observerRange=.10;observerDamage=.05;}
    if(p[2]>=4&&primary===2){observerDamage=.07;observerMark=.15;observerMarkDuration=5;}
    if(p[2]>=5&&primary===2){observerRange=.15;observerDamage=.10;observerMark=.20;observerMarkDuration=6;airstrike=true;}

    return{...base,damage:Number(damage.toFixed(2)),rate:Number(rate.toFixed(3)),detectsCamo:true,revealsCamo,breaksArmor,
      pierceTargets,critChance,critMultiplier,hunterSpecialBonus,hunterBossBonus,markBonus,markDuration,
      observerRange,observerDamage,observerMark,observerMarkDuration,airstrike,
      sniperPaths:p.slice(),sniperPrimary:primary};
  }

  function frostPaths(t){
    if(!t.paths||!Array.isArray(t.paths))t.paths=[0,0,0];
    while(t.paths.length<3)t.paths.push(0);
    t.paths=t.paths.slice(0,3).map(v=>Math.max(0,Math.min(FROST_MAX_TIER,Math.floor(Number(v)||0))));
    return t.paths;
  }

  function frostPrimaryPath(t){
    const p=frostPaths(t);
    if(Number.isInteger(t.frostMainPath)&&p[t.frostMainPath]>=4)return t.frostMainPath;
    const high=p.map((tier,i)=>({tier,i})).filter(x=>x.tier>=4).sort((a,b)=>b.tier-a.tier);
    if(!high.length){t.frostMainPath=null;return null;}
    let chosen=high[0].i;
    if(high.length>1&&high[0].tier===high[1].tier&&Number.isInteger(t.frostLastPath)&&p[t.frostLastPath]>=4)chosen=t.frostLastPath;
    t.frostMainPath=chosen;
    return chosen;
  }

  function frostBaseStats(t){
    const base=types.frost,p=frostPaths(t),primary=frostPrimaryPath(t);
    let damage=base.damage,range=base.range,rate=base.rate,slow=base.slow;
    let frostVulnBonus=0,deepFreezeOnSlowed=false,slowFactor=0,markBonus=0,markDuration=0;

    // Caminho 1 — Nevasca (dano).
    if(p[0]>=1)damage+=.35;
    if(p[0]>=2){damage+=.35;range+=15;}
    if(p[0]>=3){damage+=.45;frostVulnBonus=.25;}
    if(p[0]>=4&&primary===0){damage+=.70;rate*=.90;}
    if(p[0]>=5&&primary===0){damage+=1.0;deepFreezeOnSlowed=true;}

    // Caminho 2 — Ventania Ártica (alcance/velocidade/marca).
    if(p[1]>=1)range+=22;
    if(p[1]>=2)rate*=.85;
    if(p[1]>=3){range+=20;markBonus=.12;markDuration=3;}
    if(p[1]>=4&&primary===1){range+=40;rate*=.85;}
    if(p[1]>=5&&primary===1){range+=60;markBonus=.20;markDuration=4;}

    // Caminho 3 — Coração Glacial (força/duração da lentidão).
    if(p[2]>=1)slow+=1.0;
    if(p[2]>=2)slowFactor=.45;
    if(p[2]>=3){slow+=.5;slowFactor=.35;}
    if(p[2]>=4&&primary===2)slowFactor=.22;
    if(p[2]>=5&&primary===2){slow+=.5;slowFactor=.05;}

    return{...base,damage:Number(damage.toFixed(2)),range:Math.round(range),rate:Number(rate.toFixed(3)),
      slow:Number(slow.toFixed(2)),slowFactor:slowFactor||0,frostVulnBonus,deepFreezeOnSlowed,
      markBonus,markDuration,frostPaths:p.slice(),frostPrimary:primary};
  }

  function vinePaths(t){
    if(!t.paths||!Array.isArray(t.paths))t.paths=[0,0,0];
    while(t.paths.length<3)t.paths.push(0);
    t.paths=t.paths.slice(0,3).map(v=>Math.max(0,Math.min(VINE_MAX_TIER,Math.floor(Number(v)||0))));
    return t.paths;
  }

  function vinePrimaryPath(t){
    const p=vinePaths(t);
    if(Number.isInteger(t.vineMainPath)&&p[t.vineMainPath]>=4)return t.vineMainPath;
    const high=p.map((tier,i)=>({tier,i})).filter(x=>x.tier>=4).sort((a,b)=>b.tier-a.tier);
    if(!high.length){t.vineMainPath=null;return null;}
    let chosen=high[0].i;
    if(high.length>1&&high[0].tier===high[1].tier&&Number.isInteger(t.vineLastPath)&&p[t.vineLastPath]>=4)chosen=t.vineLastPath;
    t.vineMainPath=chosen;
    return chosen;
  }

  function vineBaseStats(t){
    const base=types.vine,p=vinePaths(t),primary=vinePrimaryPath(t);
    let rootDuration=base.rootDuration,rootCount=base.rootCount,rate=base.rate,burn=null,markBonus=0,markDuration=0;

    // Caminho 1 — Raízes Profundas.
    if(p[0]>=1)rootDuration+=.4;
    if(p[0]>=2)rootCount+=1;
    if(p[0]>=3){rootDuration+=.4;rate-=.5;}
    if(p[0]>=4&&primary===0){rootCount+=1;rootDuration+=.3;}
    if(p[0]>=5&&primary===0){rootDuration+=.7;rootCount+=2;rate-=1;}

    // Caminho 2 — Espinhos Venenosos.
    if(p[1]>=1)burn={damage:1,interval:1.5,ticks:3};
    if(p[1]>=2)burn={damage:1.5,interval:1.5,ticks:3};
    if(p[1]>=3)burn={damage:1.5,interval:1.3,ticks:5};
    if(p[1]>=4&&primary===1)burn={damage:2.5,interval:1.3,ticks:6};
    if(p[1]>=5&&primary===1)burn={damage:4,interval:1.2,ticks:7};

    // Caminho 3 — Vinha Selvagem.
    if(p[2]>=1){markBonus=.10;markDuration=3;}
    if(p[2]>=2)markBonus=.15;
    if(p[2]>=3){markBonus=.20;markDuration=4;}
    if(p[2]>=4&&primary===2){markBonus=.30;markDuration=5;}
    if(p[2]>=5&&primary===2){markBonus=.45;markDuration=6;}

    return{...base,rootDuration:Number(rootDuration.toFixed(2)),rootCount,rate:Number(Math.max(2.5,rate).toFixed(2)),
      burn,markBonus,markDuration,vinePaths:p.slice(),vinePrimary:primary};
  }

  function burstPaths(t){
    if(!t.paths||!Array.isArray(t.paths))t.paths=[0,0,0];
    while(t.paths.length<3)t.paths.push(0);
    t.paths=t.paths.slice(0,3).map(v=>Math.max(0,Math.min(BURST_MAX_TIER,Math.floor(Number(v)||0))));
    return t.paths;
  }

  function burstPrimaryPath(t){
    const p=burstPaths(t);
    if(Number.isInteger(t.burstMainPath)&&p[t.burstMainPath]>=4)return t.burstMainPath;
    const high=p.map((tier,i)=>({tier,i})).filter(x=>x.tier>=4).sort((a,b)=>b.tier-a.tier);
    if(!high.length){t.burstMainPath=null;return null;}
    let chosen=high[0].i;
    if(high.length>1&&high[0].tier===high[1].tier&&Number.isInteger(t.burstLastPath)&&p[t.burstLastPath]>=4)chosen=t.burstLastPath;
    t.burstMainPath=chosen;
    return chosen;
  }

  function burstBaseStats(t){
    const base=types.burst,p=burstPaths(t),primary=burstPrimaryPath(t);
    let damage=base.damage,splash=base.splash,rate=base.rate,burn=null,slow=0,slowFactor=0,markBonus=0,markDuration=0;

    // Caminho 1 — Barril Reforçado (poder puro: explosão maior e mais dano).
    // Cadência de T4/T5 suavizada (v0.19.0): medição real de dano-por-segundo em
    // combate mostrava esse caminho ~1,3-1,8x acima dos outros bichinhos de área
    // (Gelinho, Mago) pelo mesmo investimento — mesmo sem contar a quebra de
    // blindagem universal do Bombinha. Como o alcance da explosão já estoura a
    // vida da maioria dos balões (overkill), cortar o dano bruto quase não mudava
    // o dano real medido; a cadência é o que de fato limita quantos ataques saem
    // por segundo, então foi ela que recuou um pouco — ainda fica no topo do
    // grupo de área, só não isolado.
    if(p[0]>=1){splash+=16;damage+=.7;}
    if(p[0]>=2){splash+=14;damage+=1.1;}
    if(p[0]>=3){splash+=20;rate-=.15;}
    if(p[0]>=4&&primary===0){splash+=15;damage+=2.0;rate-=.06;}
    if(p[0]>=5&&primary===0){splash+=25;damage+=3.5;rate-=.08;}

    // Caminho 2 — Fragmentação (queimadura no impacto direto).
    if(p[1]>=1){rate-=.12;burn={damage:1,interval:1.4,ticks:3};}
    if(p[1]>=2)burn={damage:1.6,interval:1.4,ticks:4};
    if(p[1]>=3){rate-=.15;burn={damage:1.9,interval:1.2,ticks:5};}
    if(p[1]>=4&&primary===1){rate-=.15;burn={damage:2.8,interval:1.2,ticks:6};}
    if(p[1]>=5&&primary===1){burn={damage:4.2,interval:1.0,ticks:8};damage+=1.5;}

    // Caminho 3 — Nuvem Tóxica (controle: lentidão + marca no impacto direto).
    if(p[2]>=1){slow=Math.max(slow,1.0);slowFactor=slowFactor?Math.min(slowFactor,.7):.7;}
    if(p[2]>=2){markBonus=.12;markDuration=3;}
    if(p[2]>=3){slow=Math.max(slow,1.4);slowFactor=Math.min(slowFactor||1,.55);}
    if(p[2]>=4&&primary===2){slow=Math.max(slow,2.0);slowFactor=Math.min(slowFactor||1,.42);markBonus=.26;markDuration=5;}
    if(p[2]>=5&&primary===2){slow=Math.max(slow,2.6);slowFactor=Math.min(slowFactor||1,.28);markBonus=.42;markDuration=6;}

    return{...base,damage:Number(damage.toFixed(2)),splash:Math.round(splash),rate:Number(Math.max(.45,rate).toFixed(3)),
      slow:Number(slow.toFixed(2)),slowFactor,burn,markBonus,markDuration,burstPaths:p.slice(),burstPrimary:primary};
  }

  function ninjaPaths(t){
    if(!t.paths||!Array.isArray(t.paths))t.paths=[0,0,0];
    while(t.paths.length<3)t.paths.push(0);
    t.paths=t.paths.slice(0,3).map(v=>Math.max(0,Math.min(NINJA_MAX_TIER,Math.floor(Number(v)||0))));
    return t.paths;
  }

  function ninjaPrimaryPath(t){
    const p=ninjaPaths(t);
    if(Number.isInteger(t.ninjaMainPath)&&p[t.ninjaMainPath]>=4)return t.ninjaMainPath;
    const high=p.map((tier,i)=>({tier,i})).filter(x=>x.tier>=4).sort((a,b)=>b.tier-a.tier);
    if(!high.length){t.ninjaMainPath=null;return null;}
    let chosen=high[0].i;
    if(high.length>1&&high[0].tier===high[1].tier&&Number.isInteger(t.ninjaLastPath)&&p[t.ninjaLastPath]>=4)chosen=t.ninjaLastPath;
    t.ninjaMainPath=chosen;
    return chosen;
  }

  function ninjaBaseStats(t){
    const base=types.ninja,p=ninjaPaths(t),primary=ninjaPrimaryPath(t);
    let damage=base.damage,range=base.range,rate=base.rate,burn=null,detectsCamo=false,breaksArmor=false,
      hunterSpecialBonus=0,hunterBossBonus=0,markBonus=0,markDuration=0;

    // Caminho 1 — Lâminas Afiadas (poder puro: dano e velocidade de ataque).
    if(p[0]>=1){damage+=.5;rate-=.03;}
    if(p[0]>=2){damage+=.8;range+=14;}
    if(p[0]>=3){damage+=.9;rate-=.05;}
    if(p[0]>=4&&primary===0){damage+=1.2;range+=14;rate-=.04;}
    if(p[0]>=5&&primary===0){damage+=1.8;rate-=.05;}

    // Caminho 2 — Kunai Envenenado (veneno no impacto direto).
    if(p[1]>=1)burn={damage:1,interval:1.0,ticks:3};
    if(p[1]>=2)burn={damage:1.6,interval:1.0,ticks:4};
    if(p[1]>=3){rate-=.04;burn={damage:1.9,interval:.9,ticks:5};}
    if(p[1]>=4&&primary===1)burn={damage:2.8,interval:.9,ticks:6};
    if(p[1]>=5&&primary===1){burn={damage:4.5,interval:.8,ticks:8};damage+=1.5;}

    // Caminho 3 — Sombra Assassina (visão Camo, dano vs. especiais/Boss e marca).
    if(p[2]>=1)detectsCamo=true;
    if(p[2]>=2)hunterSpecialBonus=.30;
    if(p[2]>=3){markBonus=.15;markDuration=3;}
    if(p[2]>=4&&primary===2){hunterSpecialBonus=.55;hunterBossBonus=.25;markBonus=.25;markDuration=4;}
    if(p[2]>=5&&primary===2){breaksArmor=true;hunterSpecialBonus=.90;hunterBossBonus=.45;markBonus=.40;markDuration=5;}

    return{...base,damage:Number(damage.toFixed(2)),range:Math.round(range),rate:Number(Math.max(.20,rate).toFixed(3)),
      burn,detectsCamo,breaksArmor,hunterSpecialBonus,hunterBossBonus,markBonus,markDuration,ninjaPaths:p.slice(),ninjaPrimary:primary};
  }

  function laserPaths(t){
    if(!t.paths||!Array.isArray(t.paths))t.paths=[0,0,0];
    while(t.paths.length<3)t.paths.push(0);
    t.paths=t.paths.slice(0,3).map(v=>Math.max(0,Math.min(LASER_MAX_TIER,Math.floor(Number(v)||0))));
    return t.paths;
  }

  function laserPrimaryPath(t){
    const p=laserPaths(t);
    if(Number.isInteger(t.laserMainPath)&&p[t.laserMainPath]>=4)return t.laserMainPath;
    const high=p.map((tier,i)=>({tier,i})).filter(x=>x.tier>=4).sort((a,b)=>b.tier-a.tier);
    if(!high.length){t.laserMainPath=null;return null;}
    let chosen=high[0].i;
    if(high.length>1&&high[0].tier===high[1].tier&&Number.isInteger(t.laserLastPath)&&p[t.laserLastPath]>=4)chosen=t.laserLastPath;
    t.laserMainPath=chosen;
    return chosen;
  }

  function laserBaseStats(t){
    const base=types.laser,p=laserPaths(t),primary=laserPrimaryPath(t);
    let damage=base.damage,rate=base.rate,burn=null,chainTargets=0,chainRadius=0;

    // Caminho 1 — Foco de Precisão (poder puro: dano e cadência).
    if(p[0]>=1){damage+=.25;rate-=.02;}
    if(p[0]>=2){damage+=.35;rate-=.02;}
    if(p[0]>=3){damage+=.45;rate-=.03;}
    if(p[0]>=4&&primary===0){damage+=.55;rate-=.03;}
    if(p[0]>=5&&primary===0){damage+=.80;rate-=.03;}

    // Caminho 2 — Superaquecimento (queimadura no impacto direto).
    if(p[1]>=1)burn={damage:.4,interval:.8,ticks:3};
    if(p[1]>=2)burn={damage:.6,interval:.8,ticks:4};
    if(p[1]>=3){rate-=.02;burn={damage:.7,interval:.7,ticks:5};}
    if(p[1]>=4&&primary===1)burn={damage:1.1,interval:.7,ticks:6};
    if(p[1]>=5&&primary===1){burn={damage:1.8,interval:.6,ticks:8};damage+=.5;}

    // Caminho 3 — Grade de Plasma (salta para alvos próximos, sem redução de dano por salto —
    // por isso o T5 não aumenta mais a quantidade de alvos além do T4, só o alcance do salto).
    if(p[2]>=1){chainTargets=2;chainRadius=60;}
    if(p[2]>=2)chainRadius=75;
    if(p[2]>=3){chainTargets=3;chainRadius=85;}
    if(p[2]>=4&&primary===2){chainTargets=4;chainRadius=95;}
    if(p[2]>=5&&primary===2){chainTargets=4;chainRadius=130;damage+=.3;}

    return{...base,damage:Number(damage.toFixed(2)),rate:Number(Math.max(.10,rate).toFixed(3)),
      burn,chainTargets,chainRadius,laserPaths:p.slice(),laserPrimary:primary};
  }

  function wizardPaths(t){
    if(!t.paths||!Array.isArray(t.paths))t.paths=[0,0,0];
    while(t.paths.length<3)t.paths.push(0);
    t.paths=t.paths.slice(0,3).map(v=>Math.max(0,Math.min(WIZARD_MAX_TIER,Math.floor(Number(v)||0))));
    return t.paths;
  }

  function wizardPrimaryPath(t){
    const p=wizardPaths(t);
    if(Number.isInteger(t.wizardMainPath)&&p[t.wizardMainPath]>=4)return t.wizardMainPath;
    const high=p.map((tier,i)=>({tier,i})).filter(x=>x.tier>=4).sort((a,b)=>b.tier-a.tier);
    if(!high.length){t.wizardMainPath=null;return null;}
    let chosen=high[0].i;
    if(high.length>1&&high[0].tier===high[1].tier&&Number.isInteger(t.wizardLastPath)&&p[t.wizardLastPath]>=4)chosen=t.wizardLastPath;
    t.wizardMainPath=chosen;
    return chosen;
  }

  function wizardBaseStats(t){
    const base=types.wizard,p=wizardPaths(t),primary=wizardPrimaryPath(t);
    let damage=base.damage,splash=base.splash,rate=base.rate,slow=base.slow,slowFactor=0,burn=null,markBonus=0,markDuration=0;

    // Caminho 1 — Arcano Amplificado (poder puro: dano e raio da explosão).
    if(p[0]>=1)damage+=.9;
    if(p[0]>=2){damage+=1.1;splash+=12;}
    if(p[0]>=3){damage+=1.2;rate-=.06;}
    if(p[0]>=4&&primary===0){damage+=1.8;splash+=15;}
    if(p[0]>=5&&primary===0){damage+=2.6;splash+=20;rate-=.08;}

    // Caminho 2 — Chamas Arcanas (fogo mágico no impacto direto).
    if(p[1]>=1)burn={damage:1.2,interval:1.4,ticks:3};
    if(p[1]>=2)burn={damage:1.8,interval:1.4,ticks:4};
    if(p[1]>=3){rate-=.05;burn={damage:2.1,interval:1.2,ticks:5};}
    if(p[1]>=4&&primary===1)burn={damage:3.2,interval:1.2,ticks:6};
    if(p[1]>=5&&primary===1){burn={damage:5.0,interval:1.0,ticks:8};damage+=1.8;}

    // Caminho 3 — Runas de Fraqueza (reforça a lentidão base e marca o alvo).
    if(p[2]>=1){markBonus=.12;markDuration=3;}
    if(p[2]>=2)slowFactor=.50;
    if(p[2]>=3){slow+=.5;slowFactor=.38;markBonus=.20;markDuration=4;}
    if(p[2]>=4&&primary===2){slowFactor=.28;markBonus=.30;markDuration=5;}
    if(p[2]>=5&&primary===2){slow+=.75;slowFactor=.16;markBonus=.48;markDuration=6;}

    return{...base,damage:Number(damage.toFixed(2)),splash:Math.round(splash),rate:Number(Math.max(.30,rate).toFixed(3)),
      slow:Number(slow.toFixed(2)),slowFactor:slowFactor||0,burn,markBonus,markDuration,wizardPaths:p.slice(),wizardPrimary:primary};
  }

  function electricPaths(t){
    if(!t.paths||!Array.isArray(t.paths))t.paths=[0,0,0];
    while(t.paths.length<3)t.paths.push(0);
    t.paths=t.paths.slice(0,3).map(v=>Math.max(0,Math.min(ELECTRIC_MAX_TIER,Math.floor(Number(v)||0))));
    return t.paths;
  }

  function electricPrimaryPath(t){
    const p=electricPaths(t);
    if(Number.isInteger(t.electricMainPath)&&p[t.electricMainPath]>=4)return t.electricMainPath;
    const high=p.map((tier,i)=>({tier,i})).filter(x=>x.tier>=4).sort((a,b)=>b.tier-a.tier);
    if(!high.length){t.electricMainPath=null;return null;}
    let chosen=high[0].i;
    if(high.length>1&&high[0].tier===high[1].tier&&Number.isInteger(t.electricLastPath)&&p[t.electricLastPath]>=4)chosen=t.electricLastPath;
    t.electricMainPath=chosen;
    return chosen;
  }

  function electricBaseStats(t){
    const base=types.electric,p=electricPaths(t),primary=electricPrimaryPath(t);
    let damage=base.damage,rate=base.rate,chainTargets=base.chainTargets,chainRadius=base.chainRadius,
      slow=0,slowFactor=0,markBonus=0,markDuration=0;

    // Caminho 1 — Sobrecarga (poder puro: dano e cadência).
    if(p[0]>=1)damage+=.5;
    if(p[0]>=2){damage+=.7;rate-=.04;}
    if(p[0]>=3){damage+=.9;rate-=.05;}
    if(p[0]>=4&&primary===0){damage+=1.4;rate-=.05;}
    if(p[0]>=5&&primary===0){damage+=2.2;rate-=.07;}

    // Caminho 2 — Corrente Ampliada (mais alvos e mais alcance na cadeia).
    if(p[1]>=1)chainRadius+=20;
    if(p[1]>=2){chainTargets+=1;chainRadius+=15;}
    if(p[1]>=3){chainRadius+=20;rate-=.04;}
    if(p[1]>=4&&primary===1){chainTargets+=1;chainRadius+=25;}
    if(p[1]>=5&&primary===1){chainTargets+=2;chainRadius+=35;damage+=1.0;}

    // Caminho 3 — Tempestade Estática (marca e atordoa TODOS os alvos atingidos pela cadeia).
    if(p[2]>=1){markBonus=.10;markDuration=3;}
    if(p[2]>=2)markBonus=.15;
    if(p[2]>=3){chainRadius+=15;markBonus=.20;markDuration=4;}
    if(p[2]>=4&&primary===2){slow=.6;slowFactor=.6;markBonus=.28;markDuration=5;}
    if(p[2]>=5&&primary===2){slow=1.0;slowFactor=.4;markBonus=.42;markDuration=6;}

    return{...base,damage:Number(damage.toFixed(2)),rate:Number(Math.max(.20,rate).toFixed(3)),
      chainTargets,chainRadius,slow,slowFactor,markBonus,markDuration,electricPaths:p.slice(),electricPrimary:primary};
  }


  function demonkingPaths(t){
    if(!t.paths||!Array.isArray(t.paths))t.paths=[0,0,0];
    while(t.paths.length<3)t.paths.push(0);
    t.paths=t.paths.slice(0,3).map(v=>Math.max(0,Math.min(DEMONKING_MAX_TIER,Math.floor(Number(v)||0))));
    return t.paths;
  }

  function demonkingPrimaryPath(t){
    const p=demonkingPaths(t);
    if(Number.isInteger(t.demonMainPath)&&p[t.demonMainPath]>=4)return t.demonMainPath;
    const high=p.map((tier,i)=>({tier,i})).filter(x=>x.tier>=4).sort((a,b)=>b.tier-a.tier);
    if(!high.length){t.demonMainPath=null;return null;}
    let chosen=high[0].i;
    if(high.length>1&&high[0].tier===high[1].tier&&Number.isInteger(t.demonLastPath)&&p[t.demonLastPath]>=4)chosen=t.demonLastPath;
    t.demonMainPath=chosen;
    return chosen;
  }

  function demonkingBaseStats(t){
    const base=types.demonking,p=demonkingPaths(t),primary=demonkingPrimaryPath(t);
    let damage=base.damage,range=base.range,rate=base.rate,splash=base.splash;
    let fearInterval=base.fearInterval||10,fearRadius=base.fearRadius||166,fearBack=base.fearBack||60,fearVuln=base.fearVuln||.18,fearDuration=base.fearDuration||5.5;
    let shadowCap=base.shadowCap||10,shadowDamageMult=base.shadowDamageMult||1.1,shadowSpawnCount=base.shadowSpawnCount||1;
    let burnDamage=base.burn?.damage||1.35,burnTicks=base.burn?.ticks||5,breaksArmor=true,detectsCamo=false;

    // Caminho 1 — Senhor do Medo.
    if(p[0]>=1){fearInterval-=.7;fearBack+=12;fearRadius+=10;}
    if(p[0]>=2){fearRadius+=18;fearDuration+=.9;}
    if(p[0]>=3){fearVuln+=.10;fearBack+=10;}
    if(p[0]>=4&&primary===0){fearInterval-=1.1;fearRadius+=26;fearDuration+=1.1;fearVuln+=.10;}
    if(p[0]>=5&&primary===0){fearInterval-=1.35;fearRadius+=34;fearBack+=18;fearDuration+=1.4;fearVuln+=.12;shadowCap+=2;}

    // Caminho 2 — Chamas do Abismo.
    if(p[1]>=1){damage+=1.2;burnDamage+=.45;}
    if(p[1]>=2){splash+=16;burnTicks+=2;}
    if(p[1]>=3){rate*=.88;damage+=1.6;burnDamage+=.55;}
    if(p[1]>=4&&primary===1){damage+=3.0;splash+=22;burnDamage+=.90;burnTicks+=2;rate*=.88;detectsCamo=true;}
    if(p[1]>=5&&primary===1){damage+=4.8;splash+=28;burnDamage+=1.20;burnTicks+=3;rate*=.82;detectsCamo=true;}

    // Caminho 3 — Legião Sombria.
    if(p[2]>=1)shadowCap+=4;
    if(p[2]>=2)shadowDamageMult+=.35;
    if(p[2]>=3){shadowCap+=3;shadowSpawnCount=2;}
    if(p[2]>=4&&primary===2){shadowCap+=5;shadowDamageMult+=.55;shadowSpawnCount=2;fearDuration+=.6;}
    if(p[2]>=5&&primary===2){shadowCap+=8;shadowDamageMult+=.90;shadowSpawnCount=3;fearDuration+=.8;detectsCamo=true;}

    return{...base,
      damage:Number(damage.toFixed(2)),range:Math.round(range),rate:Number(Math.max(.28,rate).toFixed(3)),splash:Math.round(splash),
      fearInterval:Number(Math.max(5.0,fearInterval).toFixed(2)),fearRadius:Math.round(fearRadius),fearBack:Math.round(fearBack),
      fearVuln:Number(fearVuln.toFixed(3)),fearDuration:Number(fearDuration.toFixed(1)),shadowCap:Math.round(shadowCap),
      shadowDamageMult:Number(shadowDamageMult.toFixed(2)),shadowSpawnCount:Math.max(1,Math.round(shadowSpawnCount)),breaksArmor,detectsCamo,
      burn:{damage:Number(burnDamage.toFixed(2)),interval:1,ticks:Math.round(burnTicks)},demonkingPaths:p.slice(),demonPrimary:primary
    };
  }

  function baseTowerStats(t){
    if(t.type==='dart')return dartBaseStats(t);
    if(t.type==='sniper')return sniperBaseStats(t);
    if(t.type==='frost')return frostBaseStats(t);
    if(t.type==='vine')return vineBaseStats(t);
    if(t.type==='burst')return burstBaseStats(t);
    if(t.type==='ninja')return ninjaBaseStats(t);
    if(t.type==='laser')return laserBaseStats(t);
    if(t.type==='wizard')return wizardBaseStats(t);
    if(t.type==='electric')return electricBaseStats(t);
    if(t.type==='demonking')return demonkingBaseStats(t);
    const base=types[t.type],step=Math.max(0,(t.level||1)-1);
    const normalRate=Math.max(base.rate*.48,base.rate*Math.pow(.82,step));
    const rootRate=base.rootHold?Math.max(base.minRate||4,base.rate-step*((base.rate-(base.minRate||4))/Math.max(1,MAX_LEVEL-1))):normalRate;
    const out={...base,
      damage:Number((base.damage*Math.pow(1.70,step)).toFixed(2)),
      range:base.globalRange?base.range:Math.round(base.range*(1+step*.16)),
      rate:Number(rootRate.toFixed(2)),
      slow:base.slow?base.slow+step*.28:0,
      splash:base.splash?base.splash+step*12:0,
      chainRadius:base.chainRadius?Math.round(base.chainRadius*(1+step*.08)):0,
      farmIncome:base.farmIncome?Math.round(base.farmIncome*Math.pow(1.37,step)):0
    };
    if(t.type==='boomerang'){out.boomerangTargets=(base.boomerangTargets||3)+step;out.returnMultiplier=Number(((base.returnMultiplier||.58)+step*.09).toFixed(2));out.detectsCamo=step>=2;out.breaksArmor=step>=3;}
    if(t.type==='alchemist'){out.alchemyPoison=Number(((base.alchemyPoison||.65)+step*.28).toFixed(2));out.alchemyMark=Number(((base.alchemyMark||.14)+step*.035).toFixed(3));out.alchemyExplosion=Number(((base.alchemyExplosion||1.45)+step*.18).toFixed(2));out.breaksArmor=step>=3;}
    if(t.type==='chronomancer'){out.temporalDelay=Math.max(2.2,(base.temporalDelay||3.2)-step*.22);out.slowFactor=Math.max(.48,(base.slowFactor||.72)-step*.06);out.detectsCamo=step>=2;out.breaksArmor=step>=2;}
    return out;
  }

  // Buffs iguais não acumulam entre vários Dardos de Suporte: vale o maior buff local recebido.
  function supportBonusesFor(target){
    let damage=0,range=0,attack=0,salmon=0;
    for(const source of state.towers){
      if(source.id===target.id||source.type!=='dart')continue;
      const st=dartBaseStats(source);
      if(!st.supportAuraRadius)continue;
      if(Math.hypot(source.x-target.x,source.y-target.y)>st.supportAuraRadius)continue;
      damage=Math.max(damage,st.supportDamage||0);
      range=Math.max(range,st.supportRange||0);
      attack=Math.max(attack,st.supportAttack||0);
      salmon=Math.max(salmon,st.salmonBonus||0);
    }
    return{damage,range,attack,salmon};
  }

  // O Observador é suporte global. Múltiplos Observadores não somam o mesmo bônus:
  // utiliza-se o maior tier global existente, mas ele combina com o Suporte local do Dardo.
  function observerBonusesFor(target){
    let damage=0,range=0;
    for(const source of state.towers){
      if(source.id===target.id||source.type!=='sniper')continue;
      const st=sniperBaseStats(source);
      damage=Math.max(damage,st.observerDamage||0);
      range=Math.max(range,st.observerRange||0);
    }
    return{damage,range};
  }

  function heroBonusesFor(target){
    const out={damage:0,range:0,attack:0,salmon:0};
    const h=state.hero;if(!h)return out;
    const hs=heroStats(h);if(!hs)return out;
    const dist=Math.hypot(h.x-target.x,h.y-target.y),inside=hs.auraRange&&dist<=hs.auraRange;
    if(h.type==='king'){
      if(inside){out.range+=.10;out.attack+=.10;if((h.commandTimer||0)>0){out.damage+=.25;out.attack+=.25;}}
      if((h.ultimateTimer||0)>0){out.damage+=.20;out.range+=.20;out.attack+=.20;}
    }
    if(h.type==='merchant'&&types[target.type]?.farm&&inside)out.salmon+=.20;
    return out;
  }

  function towerStats(t){
    const st=baseTowerStats(t),buff=supportBonusesFor(t),observer=observerBonusesFor(t),heroBuff=heroBonusesFor(t);
    if(st.farm){
      if(buff.salmon)st.farmIncome=Math.round(st.farmIncome*(1+buff.salmon));
      if(heroBuff.salmon)st.farmIncome=Math.round(st.farmIncome*(1+heroBuff.salmon));
    }else{
      if(st.damage&&buff.damage)st.damage=Number((st.damage*(1+buff.damage)).toFixed(2));
      if(st.rate&&buff.attack)st.rate=Number((st.rate/(1+buff.attack)).toFixed(3));
      if(!st.globalRange&&st.range&&buff.range)st.range=Math.round(st.range*(1+buff.range));
      if(st.damage&&observer.damage)st.damage=Number((st.damage*(1+observer.damage)).toFixed(2));
      if(!st.globalRange&&st.range&&observer.range)st.range=Math.round(st.range*(1+observer.range));
      if(st.damage&&heroBuff.damage)st.damage=Number((st.damage*(1+heroBuff.damage)).toFixed(2));
      if(st.rate&&heroBuff.attack)st.rate=Number((st.rate/(1+heroBuff.attack)).toFixed(3));
      if(!st.globalRange&&st.range&&heroBuff.range)st.range=Math.round(st.range*(1+heroBuff.range));
    }
    const mastery=masteryState(t.type),mb=masteryBonusSummary(t.type,mastery.level);
    if(st.farm){
      st.farmIncome=Math.max(1,Math.round(st.farmIncome*(1+(mb.incomeBonus||0))));
    }else{
      if(st.damage!=null)st.damage=Number((Math.max(0,st.damage)+mb.damage).toFixed(2));
      if(!st.globalRange&&st.range)st.range=Number((st.range+mb.range).toFixed(1));
      if(st.rate)st.rate=Number((st.rate*(1-mb.attackReduction)).toFixed(3));
      if(t.masteryBuffTimer>0&&t.type==='ninja')st.damage=Number((st.damage*2).toFixed(2));
      if(t.masteryBuffTimer>0&&t.type==='laser'){st.rate=Number((st.rate/2).toFixed(3));st.chainTargets=Math.max(st.chainTargets||0,5);st.chainRadius=Math.max(st.chainRadius||0,105);}
    }
    st.masteryLevel=mastery.level;st.masteryMax=mastery.level>=50;
    st.receivedSupport=buff;
    st.receivedObserver=observer;
    st.receivedHero=heroBuff;
    // Identificador usado apenas para estatísticas da v0.13.0 (dano/eliminações por gatinho).
    st.sourceTowerId=t.id;
    st.sourceType=t.type;
    return st;
  }

  // Retorna os buffs que realmente estão afetando a unidade neste frame.
  // Buffs de fontes diferentes são somados para a leitura visual; o cálculo de combate
  // continua usando as regras já existentes de cada fonte.
  function activeTowerBuffLabels(t,st){
    const support=st.receivedSupport||{},observer=st.receivedObserver||{},hero=st.receivedHero||{};
    let damage=(support.damage||0)+(observer.damage||0)+(hero.damage||0);
    let attack=(support.attack||0)+(hero.attack||0);
    let range=st.globalRange?0:(support.range||0)+(observer.range||0)+(hero.range||0);
    let income=(support.salmon||0)+(hero.salmon||0);
    if(effectActive('focus')&&!st.farm&&!st.rootHold)damage+=1;
    if(effectActive('frenzy')&&!st.farm&&!st.rootHold)attack+=1;
    if((t.masteryBuffTimer||0)>0&&t.type==='ninja')damage+=1;
    if((t.masteryBuffTimer||0)>0&&t.type==='laser')attack+=1;
    const labels=[];
    if((t.masteryBuffTimer||0)>0&&t.type==='alchemist')labels.push({text:'COMBO ×3',color:'#b7ff75'});
    if(damage>.001)labels.push({text:`DMG +${Math.round(damage*100)}%`,color:'#ff9a78'});
    if(attack>.001)labels.push({text:`SPD +${Math.round(attack*100)}%`,color:'#ffe06b'});
    if(range>.001)labels.push({text:`RNG +${Math.round(range*100)}%`,color:'#77d8ff'});
    if(income>.001)labels.push({text:`$ +${Math.round(income*100)}%`,color:'#8ee89a'});
    return labels;
  }
  function drawBuffBadges(x,y,labels){
    if(!labels||!labels.length)return;
    ctx.save();ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='900 9px Segoe UI,Arial';
    const shown=labels.slice(0,3),lineH=15;
    shown.forEach((item,i)=>{
      const yy=y-i*lineH,text=item.text,w=Math.ceil(ctx.measureText(text).width)+12;
      ctx.fillStyle='#071019dd';ctx.strokeStyle=item.color+'cc';ctx.lineWidth=1;
      ctx.beginPath();ctx.roundRect(x-w/2,yy-6,w,12,6);ctx.fill();ctx.stroke();
      ctx.fillStyle=item.color;ctx.fillText(text,x,yy+.3);
    });
    ctx.restore();
  }

  function upgradeCost(t){
    const base=types[t.type];
    return Math.round(base.cost*(.82+(t.level||1)*.56));
  }

  function selectedTower(){return state.towers.find(t=>t.id===state.selectedTower)||null;}
  function repositioningTower(){return state.towers.find(t=>t.id===state.repositionTower)||null;}
  function towerRefund(t){return Math.max(0,Math.floor((t?.spent||towerPrice(t?.type,state.map))*0.50));}
  function towerPerformanceText(t){
    const damage=Math.round(t.damageDealt||0),pops=Math.max(0,Math.floor(t.pops||0));
    const spent=Math.max(0,Math.round(t.spent||towerPrice(t.type,state.map))),refund=towerRefund(t);
    const income=Math.max(0,Math.round(t.incomeGenerated||0));
    const ml=masteryState(t.type).level;
    return types[t.type]?.farm
      ?`📊 Renda gerada $${income} • Maestria ${ml}/50 • Investido $${spent} • Venda $${refund} (50%)`
      :`📊 Dano causado ${damage} • Eliminações ${pops} • Maestria ${ml}/50 • Investido $${spent} • Venda $${refund} (50%)`;
  }

  function syncPlacementUi(){
    const dock=$('#td-side-dock'),wrap=canvas.closest('.canvas-wrap'),armed=!!state.selected||!!state.repositionTower;
    if(dock)dock.classList.toggle('placement-armed',armed);
    if(wrap)wrap.classList.toggle('placement-active',armed);
    $$('.td-tower-picker [data-td-tower]').forEach(btn=>btn.classList.toggle('active',btn.dataset.tdTower===state.selected));
    const heroBtn=$('#td-hero-deploy');if(heroBtn)heroBtn.classList.toggle('active',state.selected==='__hero__');
  }

  function cancelPlacement(silent=false){
    const previous=state.selected==='__hero__'?currentHeroDef():(state.selected?types[state.selected]:null);
    state.selected=null;syncPlacementUi();
    if(!silent&&previous)setMsg(`Posicionamento de ${previous.name} cancelado.`);
  }

  function cancelReposition(silent=false){
    const t=repositioningTower();
    state.repositionTower=null;syncPlacementUi();
    if(!silent&&t)setMsg(`Reposicionamento de ${types[t.type].name} cancelado.`);
  }

  function armPlacement(id){
    cancelReposition(true);
    state.selected=id;state.selectedTower=null;state.selectedHero=false;syncPlacementUi();updateUpgradePanel();renderHeroHud();
  }

  function armHeroPlacement(){
    if(state.hero){setMsg(`🦸 ${HEROES[state.hero.type].name} já está em campo. Só é permitido 1 herói por partida.`);return;}
    cancelReposition(true);state.selected='__hero__';state.selectedTower=null;state.selectedHero=false;syncPlacementUi();updateUpgradePanel();renderHeroHud();
  }

  function closeUpgradePanel(silent=true){
    if(!state.selectedTower)return;
    state.selectedTower=null;updateUpgradePanel();
    if(!silent)setMsg('Painel de upgrades fechado.');
  }

  function beginReposition(){
    const t=selectedTower();if(!t)return;
    cancelPlacement(true);
    state.repositionTower=t.id;state.selectedTower=null;
    updateUpgradePanel();syncPlacementUi();
    setMsg(`↔ ${types[t.type].name}: escolha um novo ponto válido. Reposicionar é grátis. ESC cancela.`);
  }

  function sellSelectedTower(){
    const t=selectedTower();if(!t)return;
    const refund=towerRefund(t),name=types[t.type].name;
    state.money+=refund;
    state.towers=state.towers.filter(x=>x.id!==t.id);
    state.selectedTower=null;
    updateUpgradePanel();renderUnlocks();updateStats();renderSynergies();
    setMsg(`💰 ${name} vendido por $${refund} — 50% dos $${Math.round(t.spent||0)} investidos.`);
  }

  function moveRepositionedTower(x,y){
    const t=repositioningTower();if(!t){cancelReposition(true);return false;}
    if(distPath(x,y)<43){setMsg('↔ Reposicionamento: muito perto da estrada. Escolha outro ponto.');return false;}
    if(obstacleAt(x,y,24)){setMsg('↔ Reposicionamento: há um obstáculo nesse ponto.');return false;}
    if(state.towers.some(other=>other.id!==t.id&&Math.hypot(other.x-x,other.y-y)<46)){setMsg('↔ Reposicionamento: muito perto de outra torre.');return false;}
    t.x=x;t.y=y;
    state.pulses.push({x,y,range:54,life:.55,maxLife:.55,color:types[t.type].accent||types[t.type].color});
    state.repositionTower=null;syncPlacementUi();
    setMsg(`✓ ${types[t.type].name} reposicionado sem custo.`);
    updateStats();return true;
  }

  function dartPathLockReason(t,pathIndex){
    const p=dartPaths(t),main=dartPrimaryPath(t),current=p[pathIndex],next=current+1;
    if(current>=DART_MAX_TIER)return'Nível máximo';
    const active=p.map((v,i)=>v>0?i:-1).filter(i=>i>=0);
    if(current===0&&active.length>=2)return'Máximo de 2 caminhos';
    if(next>DART_SECONDARY_MAX&&main!==null&&main!==pathIndex)return`Secundário limitado ao T${DART_SECONDARY_MAX}`;
    return'';
  }

  function sniperPathLockReason(t,pathIndex){
    const p=sniperPaths(t),main=sniperPrimaryPath(t),current=p[pathIndex],next=current+1;
    if(current>=SNIPER_MAX_TIER)return'Nível máximo';
    const active=p.map((v,i)=>v>0?i:-1).filter(i=>i>=0);
    if(current===0&&active.length>=2)return'Máximo de 2 caminhos';
    if(next>SNIPER_SECONDARY_MAX&&main!==null&&main!==pathIndex)return`Secundário limitado ao T${SNIPER_SECONDARY_MAX}`;
    return'';
  }

  function frostPathLockReason(t,pathIndex){
    const p=frostPaths(t),main=frostPrimaryPath(t),current=p[pathIndex],next=current+1;
    if(current>=FROST_MAX_TIER)return'Nível máximo';
    const active=p.map((v,i)=>v>0?i:-1).filter(i=>i>=0);
    if(current===0&&active.length>=2)return'Máximo de 2 caminhos';
    if(next>FROST_SECONDARY_MAX&&main!==null&&main!==pathIndex)return`Secundário limitado ao T${FROST_SECONDARY_MAX}`;
    return'';
  }

  function vinePathLockReason(t,pathIndex){
    const p=vinePaths(t),main=vinePrimaryPath(t),current=p[pathIndex],next=current+1;
    if(current>=VINE_MAX_TIER)return'Nível máximo';
    const active=p.map((v,i)=>v>0?i:-1).filter(i=>i>=0);
    if(current===0&&active.length>=2)return'Máximo de 2 caminhos';
    if(next>VINE_SECONDARY_MAX&&main!==null&&main!==pathIndex)return`Secundário limitado ao T${VINE_SECONDARY_MAX}`;
    return'';
  }

  function burstPathLockReason(t,pathIndex){
    const p=burstPaths(t),main=burstPrimaryPath(t),current=p[pathIndex],next=current+1;
    if(current>=BURST_MAX_TIER)return'Nível máximo';
    const active=p.map((v,i)=>v>0?i:-1).filter(i=>i>=0);
    if(current===0&&active.length>=2)return'Máximo de 2 caminhos';
    if(next>BURST_SECONDARY_MAX&&main!==null&&main!==pathIndex)return`Secundário limitado ao T${BURST_SECONDARY_MAX}`;
    return'';
  }

  function ninjaPathLockReason(t,pathIndex){
    const p=ninjaPaths(t),main=ninjaPrimaryPath(t),current=p[pathIndex],next=current+1;
    if(current>=NINJA_MAX_TIER)return'Nível máximo';
    const active=p.map((v,i)=>v>0?i:-1).filter(i=>i>=0);
    if(current===0&&active.length>=2)return'Máximo de 2 caminhos';
    if(next>NINJA_SECONDARY_MAX&&main!==null&&main!==pathIndex)return`Secundário limitado ao T${NINJA_SECONDARY_MAX}`;
    return'';
  }

  function laserPathLockReason(t,pathIndex){
    const p=laserPaths(t),main=laserPrimaryPath(t),current=p[pathIndex],next=current+1;
    if(current>=LASER_MAX_TIER)return'Nível máximo';
    const active=p.map((v,i)=>v>0?i:-1).filter(i=>i>=0);
    if(current===0&&active.length>=2)return'Máximo de 2 caminhos';
    if(next>LASER_SECONDARY_MAX&&main!==null&&main!==pathIndex)return`Secundário limitado ao T${LASER_SECONDARY_MAX}`;
    return'';
  }

  function wizardPathLockReason(t,pathIndex){
    const p=wizardPaths(t),main=wizardPrimaryPath(t),current=p[pathIndex],next=current+1;
    if(current>=WIZARD_MAX_TIER)return'Nível máximo';
    const active=p.map((v,i)=>v>0?i:-1).filter(i=>i>=0);
    if(current===0&&active.length>=2)return'Máximo de 2 caminhos';
    if(next>WIZARD_SECONDARY_MAX&&main!==null&&main!==pathIndex)return`Secundário limitado ao T${WIZARD_SECONDARY_MAX}`;
    return'';
  }

  function electricPathLockReason(t,pathIndex){
    const p=electricPaths(t),main=electricPrimaryPath(t),current=p[pathIndex],next=current+1;
    if(current>=ELECTRIC_MAX_TIER)return'Nível máximo';
    const active=p.map((v,i)=>v>0?i:-1).filter(i=>i>=0);
    if(current===0&&active.length>=2)return'Máximo de 2 caminhos';
    if(next>ELECTRIC_SECONDARY_MAX&&main!==null&&main!==pathIndex)return`Secundário limitado ao T${ELECTRIC_SECONDARY_MAX}`;
    return'';
  }


  function demonkingPathLockReason(t,pathIndex){
    const p=demonkingPaths(t),main=demonkingPrimaryPath(t),current=p[pathIndex],next=current+1;
    if(current>=DEMONKING_MAX_TIER)return'Nível máximo';
    const active=p.map((v,i)=>v>0?i:-1).filter(i=>i>=0);
    if(current===0&&active.length>=2)return'Máximo de 2 caminhos';
    if(next>DEMONKING_SECONDARY_MAX&&main!==null&&main!==pathIndex)return`Secundário limitado ao T${DEMONKING_SECONDARY_MAX}`;
    return'';
  }

  // Só substitui o innerHTML quando o conteúdo realmente muda. Antes disso, este painel era
  // redesenhado do zero a cada ~120ms (mesmo sem nada ter mudado), o que podia destruir o botão
  // bem debaixo do clique do jogador e fazer o upgrade parecer travado/sem resposta.
  function renderTreeHTML(root,html){
    if(!root)return;
    if(root.__lastHtml===html)return;
    root.innerHTML=html;root.__lastHtml=html;
  }

  function renderPathCards(t,paths,levels,lockFn,buttonAttr,mainPath){
    return paths.map((path,i)=>{
      const level=levels[i],next=level+1,lock=lockFn(t,i),tier=path.tiers[Math.max(0,Math.min(level-1,path.tiers.length-1))];
      const nextTier=level<5?path.tiers[level]:null,isMain=mainPath===i;
      return`<article class="dart-path-card ${isMain?'main-path':''} ${lock&&level<5?'path-locked':''}" style="--path-color:${path.color}">
        <div class="dart-path-head"><span>${path.icon} <b>${path.name}</b></span><strong>T${level}/5${isMain?' • PRINCIPAL':''}</strong></div>
        <small>${level===0?'Ainda não escolhido.':tier.name}${nextTier?` → ${nextTier.description}`:' • caminho completo'}</small>
        <button type="button" ${buttonAttr}="${i}" ${lock?'disabled':''}>${level>=5?'T5 completo':lock||`T${next} • $${nextTier.cost}`}</button>
      </article>`;
    }).join('');
  }

  function renderDartUpgradeTree(t){
    const root=$('#dart-upgrade-tree');if(!root)return;
    const p=dartPaths(t);
    renderTreeHTML(root,renderPathCards(t,DART_PATHS,p,dartPathLockReason,'data-dart-path',dartPrimaryPath(t)));
    // Delegação no container: o clique continua válido mesmo depois que a árvore é redesenhada.
    root.onclick=e=>{
      const btn=e.target.closest('[data-dart-path]');
      if(!btn||btn.disabled)return;
      e.stopPropagation();
      upgradeDartPath(Number(btn.dataset.dartPath));
    };
  }

  function renderSniperUpgradeTree(t){
    const root=$('#dart-upgrade-tree');if(!root)return;
    const p=sniperPaths(t);
    renderTreeHTML(root,renderPathCards(t,SNIPER_PATHS,p,sniperPathLockReason,'data-sniper-path',sniperPrimaryPath(t)));
    root.onclick=e=>{
      const btn=e.target.closest('[data-sniper-path]');
      if(!btn||btn.disabled)return;
      e.stopPropagation();
      upgradeSniperPath(Number(btn.dataset.sniperPath));
    };
  }

  function renderFrostUpgradeTree(t){
    const root=$('#dart-upgrade-tree');if(!root)return;
    const p=frostPaths(t);
    renderTreeHTML(root,renderPathCards(t,FROST_PATHS,p,frostPathLockReason,'data-frost-path',frostPrimaryPath(t)));
    root.onclick=e=>{
      const btn=e.target.closest('[data-frost-path]');
      if(!btn||btn.disabled)return;
      e.stopPropagation();
      upgradeFrostPath(Number(btn.dataset.frostPath));
    };
  }

  function renderVineUpgradeTree(t){
    const root=$('#dart-upgrade-tree');if(!root)return;
    const p=vinePaths(t);
    renderTreeHTML(root,renderPathCards(t,VINE_PATHS,p,vinePathLockReason,'data-vine-path',vinePrimaryPath(t)));
    root.onclick=e=>{
      const btn=e.target.closest('[data-vine-path]');
      if(!btn||btn.disabled)return;
      e.stopPropagation();
      upgradeVinePath(Number(btn.dataset.vinePath));
    };
  }

  function renderBurstUpgradeTree(t){
    const root=$('#dart-upgrade-tree');if(!root)return;
    const p=burstPaths(t);
    renderTreeHTML(root,renderPathCards(t,BURST_PATHS,p,burstPathLockReason,'data-burst-path',burstPrimaryPath(t)));
    root.onclick=e=>{
      const btn=e.target.closest('[data-burst-path]');
      if(!btn||btn.disabled)return;
      e.stopPropagation();
      upgradeBurstPath(Number(btn.dataset.burstPath));
    };
  }

  function renderNinjaUpgradeTree(t){
    const root=$('#dart-upgrade-tree');if(!root)return;
    const p=ninjaPaths(t);
    renderTreeHTML(root,renderPathCards(t,NINJA_PATHS,p,ninjaPathLockReason,'data-ninja-path',ninjaPrimaryPath(t)));
    root.onclick=e=>{
      const btn=e.target.closest('[data-ninja-path]');
      if(!btn||btn.disabled)return;
      e.stopPropagation();
      upgradeNinjaPath(Number(btn.dataset.ninjaPath));
    };
  }

  function renderLaserUpgradeTree(t){
    const root=$('#dart-upgrade-tree');if(!root)return;
    const p=laserPaths(t);
    renderTreeHTML(root,renderPathCards(t,LASER_PATHS,p,laserPathLockReason,'data-laser-path',laserPrimaryPath(t)));
    root.onclick=e=>{
      const btn=e.target.closest('[data-laser-path]');
      if(!btn||btn.disabled)return;
      e.stopPropagation();
      upgradeLaserPath(Number(btn.dataset.laserPath));
    };
  }

  function renderWizardUpgradeTree(t){
    const root=$('#dart-upgrade-tree');if(!root)return;
    const p=wizardPaths(t);
    renderTreeHTML(root,renderPathCards(t,WIZARD_PATHS,p,wizardPathLockReason,'data-wizard-path',wizardPrimaryPath(t)));
    root.onclick=e=>{
      const btn=e.target.closest('[data-wizard-path]');
      if(!btn||btn.disabled)return;
      e.stopPropagation();
      upgradeWizardPath(Number(btn.dataset.wizardPath));
    };
  }

  function renderElectricUpgradeTree(t){
    const root=$('#dart-upgrade-tree');if(!root)return;
    const p=electricPaths(t);
    renderTreeHTML(root,renderPathCards(t,ELECTRIC_PATHS,p,electricPathLockReason,'data-electric-path',electricPrimaryPath(t)));
    root.onclick=e=>{
      const btn=e.target.closest('[data-electric-path]');
      if(!btn||btn.disabled)return;
      e.stopPropagation();
      upgradeElectricPath(Number(btn.dataset.electricPath));
    };
  }


  function renderDemonkingUpgradeTree(t){
    const root=$('#dart-upgrade-tree');if(!root)return;
    const p=demonkingPaths(t);
    renderTreeHTML(root,renderPathCards(t,DEMONKING_PATHS,p,demonkingPathLockReason,'data-demon-path',demonkingPrimaryPath(t)));
    root.onclick=e=>{
      const btn=e.target.closest('[data-demon-path]');
      if(!btn||btn.disabled)return;
      e.stopPropagation();
      upgradeDemonkingPath(Number(btn.dataset.demonPath));
    };
  }

  const NO_PRIORITY_TYPES=['salmon','frost','vine'];
  function updatePriorityRow(t){
    const row=$('#td-priority-row'),select=$('#td-priority');
    if(!row||!select)return;
    if(!t||NO_PRIORITY_TYPES.includes(t.type)){row.hidden=true;return;}
    row.hidden=false;
    const mode=TARGET_PRIORITIES.includes(t.priority)?t.priority:'first';
    if(select.value!==mode)select.value=mode;
  }

  function updateUpgradePanel(){
    const t=selectedTower(),name=$('#td-selected-name'),stats=$('#td-selected-stats'),perf=$('#td-selected-performance'),btn=$('#td-upgrade'),tree=$('#dart-upgrade-tree'),bar=$('#td-upgrade-bar'),dock=$('#td-side-dock'),actions=$('#td-tower-actions'),sellBtn=$('#td-sell'),moveBtn=$('#td-reposition'),abilityBtn=$('#td-mastery-ability');
    if(!name||!stats||!btn)return;
    if(!t){
      if(tree){tree.hidden=true;tree.innerHTML='';tree.__lastHtml='';}
      if(bar){bar.classList.remove('dart-mode');bar.hidden=true;}
      if(dock)dock.classList.remove('upgrade-open');
      updatePriorityRow(null);
      if(perf)perf.textContent='';
      if(actions)actions.hidden=true;if(abilityBtn)abilityBtn.hidden=true;
      name.textContent='Nenhuma torre selecionada';
      stats.textContent='Clique em um gatinho colocado para abrir os upgrades aqui.';
      btn.hidden=false;btn.textContent='Upgrade';btn.disabled=true;return;
    }
    if(bar)bar.hidden=false;if(dock)dock.classList.add('upgrade-open');
    if(actions)actions.hidden=false;
    if(perf)perf.textContent=towerPerformanceText(t);
    if(sellBtn)sellBtn.textContent=`💰 Vender $${towerRefund(t)}`;
    if(moveBtn)moveBtn.textContent='↔ Reposicionar';
    if(abilityBtn){const m=masteryState(t.type),ab=MASTERY_ABILITIES[t.type];abilityBtn.hidden=m.level<50;abilityBtn.disabled=(t.masteryAbilityCd||0)>0;abilityBtn.textContent=m.level>=50?`${ab.icon} ${ab.name}${(t.masteryAbilityCd||0)>0?` • ${Math.ceil(t.masteryAbilityCd)}s`:''}`:'⭐ Habilidade Nv.50';}
    updatePriorityRow(t);
    const st=towerStats(t);

    if(t.type==='dart'){
      if(tree)tree.hidden=false;if(bar)bar.classList.add('dart-mode');btn.hidden=true;
      const p=dartPaths(t),active=p.filter(v=>v>0).length;
      const weapon=st.weapon==='bow'?'🏹 Arco':st.weapon==='fireSpear'?'🔥 Lança de Fogo':st.weapon==='spear'?'🗡️ Lança':'➤ Dardo';
      const buffs=[];
      if(st.detectsCamo)buffs.push('🥷 vê Camo');
      if(st.chainTargets)buffs.push(`cadeia ${st.chainTargets}`);
      if(st.multiShot>1)buffs.push(`${st.multiShot} projéteis`);
      if(st.burn)buffs.push('🔥 Burn 4 ticks');
      if(st.supportDamage)buffs.push(`aura dano +${Math.round(st.supportDamage*100)}%`);
      if(st.salmonBonus)buffs.push(`salmão +${Math.round(st.salmonBonus*100)}%`);
      if(st.supportRange)buffs.push(`aura range +${Math.round(st.supportRange*100)}%`);
      if(st.supportAttack)buffs.push(`aura vel. +${Math.round(st.supportAttack*100)}%`);
      name.textContent=`${st.name} • ${weapon}`;
      stats.textContent=`Dano ${st.damage.toFixed(2)} • Range ${st.range} • Vel. ${(1/st.rate).toFixed(1)}/s • caminhos ${p.map((v,i)=>`${i+1}:T${v}`).join(' / ')} • ${active}/2 escolhidos${Number.isInteger(t.dartMainPath)?` • principal C${t.dartMainPath+1}`:''}${buffs.length?' • '+buffs.join(' • '):''}`;
      renderDartUpgradeTree(t);return;
    }

    if(t.type==='sniper'){
      if(tree)tree.hidden=false;if(bar)bar.classList.add('dart-mode');btn.hidden=true;
      const p=sniperPaths(t),active=p.filter(v=>v>0).length,buffs=[];
      if(st.pierceTargets>1)buffs.push(`perfura ${st.pierceTargets}`);
      if(st.critChance)buffs.push(`crítico ${Math.round(st.critChance*100)}% ×${st.critMultiplier}`);
      if(st.hunterSpecialBonus)buffs.push(`especiais +${Math.round(st.hunterSpecialBonus*100)}%`);
      if(st.hunterBossBonus)buffs.push(`Boss +${Math.round(st.hunterBossBonus*100)}%`);
      if(st.breaksArmor)buffs.push('💥 quebra blindagem');
      if(st.markBonus)buffs.push(`marca +${Math.round(st.markBonus*100)}%`);
      if(st.revealsCamo)buffs.push('👁 revela Camo p/ todos');
      if(st.observerRange)buffs.push(`global range +${Math.round(st.observerRange*100)}%`);
      if(st.observerDamage)buffs.push(`global precisão +${Math.round(st.observerDamage*100)}%`);
      if(st.observerMark)buffs.push(`designador +${Math.round(st.observerMark*100)}%`);
      if(st.airstrike)buffs.push('✈ avião 2 rodadas/25s');
      name.textContent=`${st.name} • árvore de especialização`;
      stats.textContent=`Dano ${st.damage.toFixed(2)} • Range GLOBAL • Vel. ${(1/st.rate).toFixed(2)}/s • caminhos ${p.map((v,i)=>`${i+1}:T${v}`).join(' / ')} • ${active}/2 escolhidos${Number.isInteger(t.sniperMainPath)?` • principal C${t.sniperMainPath+1}`:''}${buffs.length?' • '+buffs.join(' • '):''}`;
      renderSniperUpgradeTree(t);return;
    }

    if(t.type==='frost'){
      if(tree)tree.hidden=false;if(bar)bar.classList.add('dart-mode');btn.hidden=true;
      const p=frostPaths(t),active=p.filter(v=>v>0).length,buffs=[];
      if(st.frostVulnBonus)buffs.push(`+${Math.round(st.frostVulnBonus*100)}% vs. já lentos`);
      if(st.deepFreezeOnSlowed)buffs.push('❄️ congela quem já está lento');
      if(st.slowFactor)buffs.push(`lentidão ${Math.round(st.slowFactor*100)}% da velocidade`);
      if(st.markBonus)buffs.push(`marca +${Math.round(st.markBonus*100)}%`);
      name.textContent=`${st.name} • árvore de especialização`;
      stats.textContent=`Dano ${st.damage.toFixed(2)} (FULL AOE) • Range ${st.range} • Vel. ${(1/st.rate).toFixed(2)}/s • lentidão ${st.slow.toFixed(1)}s • caminhos ${p.map((v,i)=>`${i+1}:T${v}`).join(' / ')} • ${active}/2 escolhidos${Number.isInteger(t.frostMainPath)?` • principal C${t.frostMainPath+1}`:''}${buffs.length?' • '+buffs.join(' • '):''}`;
      renderFrostUpgradeTree(t);return;
    }

    if(t.type==='vine'){
      if(tree)tree.hidden=false;if(bar)bar.classList.add('dart-mode');btn.hidden=true;
      const p=vinePaths(t),active=p.filter(v=>v>0).length,buffs=[];
      if(st.burn)buffs.push(`☠️ veneno ${st.burn.damage}×${st.burn.ticks}`);
      if(st.markBonus)buffs.push(`vulnerável +${Math.round(st.markBonus*100)}%`);
      name.textContent=`${st.name} • árvore de especialização`;
      stats.textContent=`Prende ${st.rootCount} (ou 1 Boss) • Duração ${st.rootDuration.toFixed(1)}s • Recarga ${st.rate.toFixed(1)}s • caminhos ${p.map((v,i)=>`${i+1}:T${v}`).join(' / ')} • ${active}/2 escolhidos${Number.isInteger(t.vineMainPath)?` • principal C${t.vineMainPath+1}`:''}${buffs.length?' • '+buffs.join(' • '):''}`;
      renderVineUpgradeTree(t);return;
    }

    if(t.type==='burst'){
      if(tree)tree.hidden=false;if(bar)bar.classList.add('dart-mode');btn.hidden=true;
      const p=burstPaths(t),active=p.filter(v=>v>0).length,buffs=[];
      buffs.push('💥 quebra blindagem');
      if(st.burn)buffs.push(`🔥 queimadura ${st.burn.damage}×${st.burn.ticks}`);
      if(st.slow)buffs.push(`lentidão ${st.slow.toFixed(1)}s a ${Math.round((st.slowFactor||.55)*100)}%`);
      if(st.markBonus)buffs.push(`marca +${Math.round(st.markBonus*100)}%`);
      name.textContent=`${st.name} • árvore de especialização`;
      stats.textContent=`Dano ${st.damage.toFixed(2)} • Splash ${st.splash} • Range ${st.range} • Vel. ${(1/st.rate).toFixed(2)}/s • caminhos ${p.map((v,i)=>`${i+1}:T${v}`).join(' / ')} • ${active}/2 escolhidos${Number.isInteger(t.burstMainPath)?` • principal C${t.burstMainPath+1}`:''}${buffs.length?' • '+buffs.join(' • '):''}`;
      renderBurstUpgradeTree(t);return;
    }

    if(t.type==='ninja'){
      if(tree)tree.hidden=false;if(bar)bar.classList.add('dart-mode');btn.hidden=true;
      const p=ninjaPaths(t),active=p.filter(v=>v>0).length,buffs=[];
      if(st.detectsCamo)buffs.push('🥷 vê Camo');
      if(st.burn)buffs.push(`🧪 veneno ${st.burn.damage}×${st.burn.ticks}`);
      if(st.hunterSpecialBonus)buffs.push(`especiais +${Math.round(st.hunterSpecialBonus*100)}%`);
      if(st.hunterBossBonus)buffs.push(`Boss +${Math.round(st.hunterBossBonus*100)}%`);
      if(st.markBonus)buffs.push(`marca +${Math.round(st.markBonus*100)}%`);
      if(st.breaksArmor)buffs.push('💥 quebra blindagem');
      name.textContent=`${st.name} • árvore de especialização`;
      stats.textContent=`Dano ${st.damage.toFixed(2)} • Range ${st.range} • Vel. ${(1/st.rate).toFixed(2)}/s • caminhos ${p.map((v,i)=>`${i+1}:T${v}`).join(' / ')} • ${active}/2 escolhidos${Number.isInteger(t.ninjaMainPath)?` • principal C${t.ninjaMainPath+1}`:''}${buffs.length?' • '+buffs.join(' • '):''}`;
      renderNinjaUpgradeTree(t);return;
    }

    if(t.type==='laser'){
      if(tree)tree.hidden=false;if(bar)bar.classList.add('dart-mode');btn.hidden=true;
      const p=laserPaths(t),active=p.filter(v=>v>0).length,buffs=[];
      if(st.burn)buffs.push(`♨️ queimadura ${st.burn.damage}×${st.burn.ticks}`);
      if(st.chainTargets>1)buffs.push(`salta ${st.chainTargets} alvos`);
      name.textContent=`${st.name} • árvore de especialização`;
      stats.textContent=`Dano ${st.damage.toFixed(2)} • Range ${st.range} • Vel. ${(1/st.rate).toFixed(2)}/s • caminhos ${p.map((v,i)=>`${i+1}:T${v}`).join(' / ')} • ${active}/2 escolhidos${Number.isInteger(t.laserMainPath)?` • principal C${t.laserMainPath+1}`:''}${buffs.length?' • '+buffs.join(' • '):''}`;
      renderLaserUpgradeTree(t);return;
    }

    if(t.type==='wizard'){
      if(tree)tree.hidden=false;if(bar)bar.classList.add('dart-mode');btn.hidden=true;
      const p=wizardPaths(t),active=p.filter(v=>v>0).length,buffs=[];
      if(st.burn)buffs.push(`🔥 fogo ${st.burn.damage}×${st.burn.ticks}`);
      if(st.slowFactor)buffs.push(`lentidão ${st.slow.toFixed(1)}s a ${Math.round(st.slowFactor*100)}%`);
      if(st.markBonus)buffs.push(`marca +${Math.round(st.markBonus*100)}%`);
      name.textContent=`${st.name} • árvore de especialização`;
      stats.textContent=`Dano ${st.damage.toFixed(2)} • Splash ${st.splash} • Range ${st.range} • Vel. ${(1/st.rate).toFixed(2)}/s • caminhos ${p.map((v,i)=>`${i+1}:T${v}`).join(' / ')} • ${active}/2 escolhidos${Number.isInteger(t.wizardMainPath)?` • principal C${t.wizardMainPath+1}`:''}${buffs.length?' • '+buffs.join(' • '):''}`;
      renderWizardUpgradeTree(t);return;
    }

    if(t.type==='electric'){
      if(tree)tree.hidden=false;if(bar)bar.classList.add('dart-mode');btn.hidden=true;
      const p=electricPaths(t),active=p.filter(v=>v>0).length,buffs=[];
      if(st.markBonus)buffs.push(`marca +${Math.round(st.markBonus*100)}%`);
      if(st.slow)buffs.push(`atordoa ${st.slow.toFixed(1)}s a ${Math.round((st.slowFactor||.55)*100)}%`);
      name.textContent=`${st.name} • árvore de especialização`;
      stats.textContent=`Dano ${st.damage.toFixed(2)} • Cadeia ${st.chainTargets} alvos (raio ${st.chainRadius}) • Range ${st.range} • Vel. ${(1/st.rate).toFixed(2)}/s • caminhos ${p.map((v,i)=>`${i+1}:T${v}`).join(' / ')} • ${active}/2 escolhidos${Number.isInteger(t.electricMainPath)?` • principal C${t.electricMainPath+1}`:''}${buffs.length?' • '+buffs.join(' • '):''}`;
      renderElectricUpgradeTree(t);return;
    }

    if(t.type==='demonking'){
      if(tree)tree.hidden=false;if(bar)bar.classList.add('dart-mode');btn.hidden=true;
      const p=demonkingPaths(t),active=p.filter(v=>v>0).length,buffs=[];
      buffs.push(`😨 ${st.fearRadius}px / ${st.fearInterval.toFixed(1)}s`);
      buffs.push(`↩ empurra ${st.fearBack}`);
      buffs.push(`🌑 sombras ${st.shadowCap}`);
      if(st.fearVuln)buffs.push(`alvos sofrem +${Math.round(st.fearVuln*100)}% dano`);
      if(st.burn)buffs.push(`🔥 ${st.burn.damage}×${st.burn.ticks}`);
      if(st.detectsCamo)buffs.push('🥷 vê Camo');
      name.textContent=`${st.name} • árvore de especialização`;
      stats.textContent=`Dano ${st.damage.toFixed(2)} • Splash ${st.splash} • Range ${st.range} • Vel. ${(1/st.rate).toFixed(2)}/s • caminhos ${p.map((v,i)=>`${i+1}:T${v}`).join(' / ')} • ${active}/2 escolhidos${Number.isInteger(t.demonMainPath)?` • principal C${t.demonMainPath+1}`:''}${buffs.length?' • '+buffs.join(' • '):''}`;
      renderDemonkingUpgradeTree(t);return;
    }

    if(tree){tree.hidden=true;tree.innerHTML='';tree.__lastHtml='';}if(bar)bar.classList.remove('dart-mode');btn.hidden=false;
    const max=t.level>=MAX_LEVEL,cost=upgradeCost(t);
    let special='';
    if(st.farm)special=` • 🎣 +$${st.farmIncome} por rodada`;
    else if(st.globalRange)special=' • 🎯 Range GLOBAL';
    else if(st.fullAoe)special=' • ❄️ FULL AOE';
    else if(st.breaksArmor)special=' • 💥 Quebra blindagem';
    else if(st.chainTargets)special=` • ⚡ Cadeia ${st.chainTargets} alvos`;
    else if(st.rootHold)special=` • 🌿 Segura ${st.rootCount} ou 1 boss por ${st.rootDuration}s`;
    else if(t.type==='boomerang')special=` • 🪃 ${st.boomerangTargets} alvos + retorno ×${st.returnMultiplier.toFixed(2)}`;
    else if(t.type==='alchemist')special=` • 🧪 Veneno → Fraqueza → Explosão`;
    else if(t.type==='chronomancer')special=` • ⏳ Retorno temporal em ${st.temporalDelay.toFixed(1)}s`;
    else if(t.type==='demonking')special=` • 😨 Medo ${st.fearRadius}px / ${st.fearInterval.toFixed(1)}s • 🌑 sombras ${st.shadowCap}`;
    const speedBonus=effectActive('frenzy')&&!st.rootHold&&!st.farm?' • ⚡ 2× velocidade ATIVO':'';
    const damageBonus=effectActive('focus')&&!st.rootHold&&!st.farm?' • 🔥 2× dano ATIVO':'';
    const received=st.receivedSupport||{},observer=st.receivedObserver||{};
    const supportText=(received.damage||received.range||received.attack||received.salmon)?' • 🐟 buff de Suporte ativo':'';
    const observerText=(observer.damage||observer.range)?' • 🛰️ buff de Observador ativo':'';
    name.textContent=`${st.name} • nível ${t.level}/${MAX_LEVEL}`;
    const cadence=st.farm?`Renda $${st.farmIncome}/rodada`:st.rootHold?`Recarga ${st.rate.toFixed(1)}s`:`Vel. ${(1/st.rate).toFixed(1)}/s`;
    stats.textContent=st.farm
      ?`${st.role} • não ataca • ${cadence}${special}${supportText}${observerText} • limite ${TOWER_LIMIT_PER_TYPE} por tipo • ${max?'nível máximo':`próximo upgrade $${cost}`}`
      :`${st.role} • ${st.rootHold?'Controle':`Dano ${st.damage.toFixed(2)}`} • ${st.globalRange?'Range GLOBAL':`Range ${st.range}`} • ${cadence}${special}${supportText}${observerText}${speedBonus}${damageBonus} • ${max?'nível máximo':`próximo upgrade $${cost}`}`;
    btn.textContent=max?'Nível máximo':`Upgrade $${cost}`;btn.disabled=max;
  }

  function renderHotbar(){
    const root=$('#power-hotbar');if(!root)return;
    root.innerHTML=Object.entries(powers).map(([id,p])=>{
      const qty=profile.inventory[id]||0,active=effectActive(id);
      const remaining=active?`${state.effects[id].toFixed(1)}s`:`${qty} carga${qty===1?'':'s'}`;
      return`<button type="button" class="power-use ${qty>0?'ready':''} ${active?'active':''}" data-use-power="${id}" ${qty<=0||active?'disabled':''} title="${p.description}">
        <span class="icon">${p.icon}</span><b>${p.name}</b><small>${remaining}</small>
      </button>`;
    }).join('');
    $$('[data-use-power]').forEach(btn=>btn.onclick=()=>usePower(btn.dataset.usePower));
  }

  function renderEffects(){
    const root=$('#active-effects');if(!root)return;
    const items=[];
    if(effectActive('frenzy'))items.push(`⚡ 2× attack speed • ${state.effects.frenzy.toFixed(1)}s`);
    if(effectActive('focus'))items.push(`🔥 2× dano • ${state.effects.focus.toFixed(1)}s`);
    if(effectActive('blizzard'))items.push(`🌨️ inimigos a 35% da velocidade • ${state.effects.blizzard.toFixed(1)}s`);
    root.innerHTML=items.map(x=>`<span class="effect-pill">${x}</span>`).join('');
    renderSynergies();
  }

  function updateSpeedButtons(){
    $$('[data-speed]').forEach(btn=>btn.classList.toggle('active',Number(btn.dataset.speed)===state.gameSpeed));
  }

  const SPECIAL_ENEMY_INFO={
    healer:{icon:'❤️',name:'Curandeiro',color:'#62d887',description:'A cada 1s regenera 1 camada dos balões próximos em um raio pequeno.'},
    trickster:{icon:'🤡',name:'Atrapalhão',color:'#ff9f5d',description:'Às vezes estoura 1 camada do balão da frente e atordoa gatinhos próximos por 1,2s.'},
    jester:{icon:'🃏',name:'Bobo da Corte',color:'#ce78ff',description:'Tem apenas 1 de vida. O dano do tiro que o acerta vira perda de dinheiro, limitada a $500.'},
    angel:{icon:'😇',name:'Anjo',color:'#f4efc7',description:'Concede 1 escudo a um balão próximo. O escudo bloqueia um ataque, mas deixa o protegido 18% mais lento.'},
    demon:{icon:'😈',name:'Demônio',color:'#a94455',description:'Rouba camadas de balões próximos para aumentar permanentemente sua vida máxima, até 2× a vida original.'}
  };

  const waveKindLabels={
    camo:'🥷 Camo',armored:'🛡 Blindado',heavyArmored:'🛡🛡 Pesado',
    camoArmored:'🥷🛡 Camo+Blindado',fast:'⚡ Rápido',regen:'➕ Regenerador',
    healer:'❤️ Curandeiro',trickster:'🤡 Atrapalhão',jester:'🃏 Bobo da Corte',angel:'😇 Anjo',demon:'😈 Demônio'
  };

  function waveEnemyCount(round){
    if(isInfinite()){
      const hardExtra=state.difficulty==='hard'?Math.floor(round/10)*4:state.difficulty==='normal'?Math.floor(round/15)*3:0;
      return Math.min(128,10+round*4+hardExtra);
    }
    const totalRounds=mapRounds(state.map,state.difficulty);
    const base=10+round*5+(round===totalRounds?14:0);
    return Math.round(base*(currentMap().enemyDensity||1));
  }

  function waveFeatureSet(round){
    if(round<1)return{tier:null,kinds:new Set(),boss:false};
    const count=waveEnemyCount(round),kinds=new Set();
    for(let i=0;i<count;i++){
      const k=enemyKind(round,i);
      if(k!=='normal')kinds.add(k);
    }
    const boss=!isInfinite()&&round===mapRounds(state.map,state.difficulty);
    return{tier:tierOf(waveHp(round)).name,kinds,boss};
  }

  function renderNextWavePreview(){
    const root=$('#next-wave-alert');if(!root)return;
    const totalRounds=mapRounds(state.map,state.difficulty),next=state.wave+1;
    if(!isInfinite()&&(state.completed||next>totalRounds)){
      root.className='next-wave-alert done';
      root.innerHTML='<span class="next-wave-icon">✓</span><div><b>Última rodada chamada</b><small>Termine os inimigos restantes.</small></div>';
      return;
    }
    const previous=waveFeatureSet(state.wave),upcoming=waveFeatureSet(next),news=[];
    if(!previous.tier||upcoming.tier!==previous.tier)news.push(`🎈 ${upcoming.tier}`);
    for(const kind of upcoming.kinds)if(!previous.kinds.has(kind))news.push(waveKindLabels[kind]||kind);
    if(upcoming.boss)news.push('👑 BOSS');
    const milestone=isInfinite()&&next%10===0;
    if(milestone)news.push(`🪙 +${infiniteMilestoneReward(next)} moedas permanentes ao concluir`);
    root.className=`next-wave-alert ${news.length?'warning':'quiet'}`;
    const headline=milestone&&!upcoming.boss?`Rodada ${next}: marco do Infinito`:(news.length?`Rodada ${next}: vem coisa nova`:`Rodada ${next}: sem novos tipos`);
    root.innerHTML=news.length
      ?`<span class="next-wave-icon">${milestone?'🪙':'⚠'}</span><div><b>${headline}</b><small>${news.join(' • ')}</small></div>`
      :`<span class="next-wave-icon">✓</span><div><b>${headline}</b><small>As ameaças conhecidas continuam, só ficam mais numerosas/fortes.</small></div>`;
  }

  function renderHeroHud(){
    const def=currentHeroDef(),h=state.hero,btn=$('#td-hero-deploy'),icon=$('#td-hero-icon'),name=$('#td-hero-name'),stateEl=$('#td-hero-state');
    const price=heroPrice(profile.selectedHero,state.map);
    if(icon)icon.textContent=def.icon;if(name)name.textContent=def.name;
    if(btn){btn.disabled=!!h;btn.classList.toggle('placed',!!h);}
    if(stateEl)stateEl.textContent=h?`Em campo • Nv. ${h.level}/10`:`$${price} • pronto para entrar`;
    const progress=$('#td-hero-progress'),actions=$('#td-hero-actions');
    // O XP/nível (e o botão de upar com ouro, que mora no mesmo bloco) só aparece com o herói
    // selecionado — clique nele em campo para ver/gerenciar o progresso, como já funciona para
    // torres. As habilidades continuam sempre visíveis assim que o herói entra em campo.
    if(progress)progress.hidden=!h||!state.selectedHero;
    if(actions)actions.hidden=!h;
    if(!h)return;
    const hs=heroStats(h),need=heroRequiredXp(h.level),pct=h.level>=10?100:Math.max(0,Math.min(100,(h.xp/need)*100));
    if($('#td-hero-level'))$('#td-hero-level').textContent=h.level>=10?'⭐ Nv. 10 MAX':`Nv. ${h.level}/10`;
    if($('#td-hero-xp'))$('#td-hero-xp').textContent=h.level>=10?'Ultimate liberada':`${h.xp}/${need} XP`;
    if($('#td-hero-xp-fill'))$('#td-hero-xp-fill').style.width=`${pct}%`;
    if($('#td-hero-passive'))$('#td-hero-passive').textContent=`${def.passive}${def.farm?` • Renda própria: +$${hs.farmIncome}/rodada`:` • Dano ${hs.damage} • Range ${hs.range}`}`;
    const buyBtn=$('#td-hero-buy-level');
    if(buyBtn){
      if(h.level>=10){buyBtn.hidden=true;}
      else{
        const cost=heroLevelUpCost(h.level);
        buyBtn.hidden=false;buyBtn.disabled=state.money<cost;
        buyBtn.textContent=`💰 Upar com ouro • $${cost}`;
      }
    }
    const skill=$('#td-hero-skill'),ult=$('#td-hero-ultimate');
    if(skill){skill.disabled=h.level<5||(h.skillCd||0)>0||(h.stunTimer||0)>0;skill.textContent=(h.stunTimer||0)>0?`😵 Atordoado • ${Math.ceil(h.stunTimer*10)/10}s`:h.level<5?`🔒 Nv.5 • ${def.skill.name}`:`${def.skill.icon} ${def.skill.name}${h.skillCd>0?` • ${Math.ceil(h.skillCd)}s`:''}`;}
    if(ult){ult.disabled=h.level<10||(h.ultimateCd||0)>0||(h.stunTimer||0)>0;ult.textContent=(h.stunTimer||0)>0?`😵 Atordoado • ${Math.ceil(h.stunTimer*10)/10}s`:h.level<10?`🔒 Nv.10 • ${def.ultimate.name}`:`${def.ultimate.icon} ${def.ultimate.name}${h.ultimateCd>0?` • ${Math.ceil(h.ultimateCd)}s`:''}`;}
  }

  function updateStats(){
    const map=currentMap(),diff=currentDifficulty(),totalRounds=mapRounds(state.map,state.difficulty),endless=isInfinite();
    renderHeroHud();renderSynergies();
    if($('#td-lives'))$('#td-lives').textContent=Math.max(0,state.lives);
    if($('#td-money'))$('#td-money').textContent=Math.floor(state.money);
    if($('#td-wave'))$('#td-wave').textContent=state.wave;
    if($('#td-wave-max'))$('#td-wave-max').textContent=endless?'∞':totalRounds;
    if($('#td-count'))$('#td-count').textContent=state.enemies.length+state.spawn.length;
    if($('#td-map-meta'))$('#td-map-meta').textContent=endless
      ?`${map.description} • ∞ Infinito ${diff.name} • recorde ${infiniteBestFor(state.map,state.difficulty)} • moedas permanentes a cada 10 rodadas.`
      :`${map.description} • ${diff.name} • estrelas do mapa ${mapStars(state.map)}/3.`;
    if($('#game-map-title'))$('#game-map-title').textContent=map.name;
    if($('#game-difficulty-text'))$('#game-difficulty-text').textContent=endless
      ?`∞ Modo Infinito • ${diff.name} • melhor: rodada ${infiniteBestFor(state.map,state.difficulty)}`
      :`🏁 Campanha • ${diff.name} • ${profile.maps[state.map].cleared[state.difficulty]?'⭐ já concluída':'☆ estrela ainda não conquistada'}`;
    const start=$('#td-start');
    if(start){
      if(!endless&&state.completed){
        start.disabled=true;start.title='Mapa concluído';start.innerHTML='<span class="wave-play-icon">✓</span><small>Concluído</small>';
      }else if(!endless&&state.wave>=totalRounds){
        start.disabled=true;
        const label=state.enemies.length||state.spawn.length?'Final em campo':'Finalizando';
        start.title=label;start.innerHTML=`<span class="wave-play-icon">⌛</span><small>${label}</small>`;
      }else{
        start.disabled=false;
        const next=state.wave+1,overlap=state.enemies.length||state.spawn.length;
        start.title=overlap?`Chamar rodada ${next} agora`:`Iniciar rodada ${next}`;
        start.innerHTML=`<span class="wave-play-icon">${overlap?'🚀':'▶'}</span><small>${endless?'∞ ':''}Rodada ${next}</small>`;
      }
    }
    // HOTFIX 0.6.5.1: não recriar a árvore de upgrades a cada frame.
    // Recriar os botões entre mousedown e mouseup cancelava o evento de click.
    // v0.13.0: só o resumo numérico de desempenho pode atualizar em tempo real.
    if(state.selectedTower){
      const t=selectedTower(),perf=$('#td-selected-performance'),sellBtn=$('#td-sell');
      if(t&&perf)perf.textContent=towerPerformanceText(t);
      if(t&&sellBtn)sellBtn.textContent=`💰 Vender $${towerRefund(t)}`;
    }
    updateSpeedButtons();renderNextWavePreview();
  }

  function reset(){
    const map=currentMap(),diff=currentDifficulty();
    state.money=Math.round(map.startMoney*diff.startMoney);
    state.lives=Math.max(1,map.lives+diff.extraLives);
    state.wave=0;state.lastClearedWave=0;state.lastFarmPaidWave=0;state.selected=null;state.selectedTower=null;state.selectedHero=false;state.repositionTower=null;state.hero=null;state.nextTowerId=1;state.nextEnemyId=1;
    state.paused=false;state.menuOpen=false;state.defeatShown=false;state.waveActive=false;state.completed=false;state.rewardGranted=false;state.masteryXpGranted=false;state.masterySession=Object.fromEntries(Object.keys(types).map(id=>[id,{used:false,damage:0,pops:0,income:0,actions:0}]));
    state.enemies=[];state.towers=[];state.shots=[];state.spawn=[];state.shadowBloons=[];state.pulses=[];state.lightning=[];state.airstrikes=[];state.bombs=[];state.floatTexts=[];state.particles=[];state.impactFx=[];state.muzzleFx=[];state.screenShake=0;state.particleTimer=0;state.last=0;
    state.pendingClearCash=0;state.pendingWaveXp=0;state.paidMilestones=new Set();
    state.effects={frenzy:0,focus:0,blizzard:0};state.powerUiClock=0;
    configurePath();syncPlacementUi();updateUpgradePanel();
    playMusicTheme(state.map);
    if($('#td-pause')){$('#td-pause').textContent='⏸';$('#td-pause').title='Pausar';}
    hideGameModal('#pause-menu');hideGameModal('#result-screen');
    setMsg(isInfinite()
      ?`${map.name} • ∞ Infinito ${diff.name}. Não existe rodada final: a dificuldade sobe continuamente e cada 10 rodadas concluídas rende moedas permanentes.`
      :`${map.name} • ${diff.name}. Obstáculos grandes bloqueiam a visão. Chame as rodadas no seu ritmo — você pode sobrepor ondas.`);
    renderHotbar();renderEffects();renderUnlocks();renderHeroHud();updateStats();
  }

  function loadSelection(mapId,diffId,modeId='campaign'){
    state.map=mapId in maps?mapId:'grove';
    state.difficulty=diffId in difficulties?diffId:'easy';
    state.mode=modeId==='infinite'?'infinite':'campaign';
    lobbySelection={map:state.map,difficulty:state.difficulty,mode:state.mode,category:'beginner'};
    reset();
  }

  function usePower(id){
    const p=powers[id];if(!p)return;
    if((profile.inventory[id]||0)<=0){setMsg(`Sem cargas de ${p.name}. Compre no lobby Poderes.`);return;}
    if(p.duration&&(!state.wave||(!state.enemies.length&&!state.spawn.length))){setMsg(`${p.name} é temporário. Inicie uma rodada antes de usar.`);return;}
    if(p.duration&&effectActive(id)){setMsg(`${p.name} já está ativo.`);return;}
    const maxLives=currentMap().lives+currentDifficulty().extraLives;
    if(p.effect==='heal'&&state.lives>=maxLives){setMsg('Suas vidas já estão cheias.');return;}
    profile.inventory[id]--;
    if(p.effect==='attackSpeed')state.effects.frenzy=p.duration;
    if(p.effect==='damage')state.effects.focus=p.duration;
    if(p.effect==='slow')state.effects.blizzard=p.duration;
    if(p.effect==='cash')state.money+=350;
    if(p.effect==='heal')state.lives=Math.min(maxLives,state.lives+6);
    saveProfile();
    sfx('ui');setMsg(`${p.icon} ${p.name} ativado! ${p.description}`);
    renderHotbar();renderEffects();
    if(state.selectedTower)updateUpgradePanel();
    updateStats();
  }

  // Vida-base do balão "puro" da rodada, em camadas (estilo Bloons: Vermelho=1 ... Preto=6).
  // O teto de cor depende da dificuldade — Fácil nunca manda Rosa/Preto, Difícil manda todas.
  // A rampa vai de 1 na rodada 1 até o teto na última rodada do mapa/dificuldade atual.
  function waveHp(wave){
    if(isInfinite()){
      // No infinito todas as cores acabam aparecendo. Depois da camada Preta,
      // a vida continua crescendo por trás da cor visual para manter a escalada.
      const pace=state.difficulty==='easy'?6:state.difficulty==='hard'?4:5;
      const layered=1+Math.min(5,(Math.max(1,wave)-1)/pace);
      const post=Math.max(0,wave-(pace*5+1));
      const growth=Math.pow(state.difficulty==='hard'?1.095:state.difficulty==='normal'?1.082:1.07,post/5);
      return Number((layered*growth).toFixed(2));
    }
    const totalRounds=mapRounds(state.map,state.difficulty);
    const maxTier=state.difficulty==='easy'?4:state.difficulty==='hard'?6:5;
    const progress=totalRounds>1?Math.min(1,(wave-1)/(totalRounds-1)):1;
    return Number((1+progress*(maxTier-1)).toFixed(2));
  }

  function specialEnemyKind(round,index){
    const cat=mapCategoryForMap(state.map).id;
    const total=isInfinite()?Math.max(36,round):mapRounds(state.map,state.difficulty);
    const progress=isInfinite()?Math.min(1,round/36):Math.min(1,round/Math.max(1,total));
    const diffShift=state.difficulty==='easy'?5:state.difficulty==='hard'?-2:0;
    const cadence=base=>Math.max(6,base+diffShift);
    const infiniteAll=isInfinite()&&round>=26;
    const has=id=>{
      if(infiniteAll)return true;
      if(cat==='beginner')return id==='healer'||id==='trickster';
      if(cat==='medium')return ['healer','trickster','jester'].includes(id);
      if(cat==='hardmaps'||cat==='impossible')return true;
      return false;
    };
    // O tier define quais especiais existem; Fácil/Normal/Difícil muda a frequência.
    if(has('angel')&&progress>=.42&&index%cadence(19)===7)return'angel';
    if(has('demon')&&progress>=.50&&index%cadence(21)===11)return'demon';
    if(has('jester')&&progress>=.46&&index%cadence(18)===9)return'jester';
    if(has('healer')&&progress>=.34&&index%cadence(16)===4)return'healer';
    if(has('trickster')&&progress>=.43&&index%cadence(17)===6)return'trickster';
    return null;
  }

  function enemyKind(round,index){
    const special=specialEnemyKind(round,index);
    if(special)return special;
    const armorAllowed=state.difficulty!=='easy'||(isInfinite()&&round>=20); // No Infinito até o Fácil recebe blindagem mais tarde.
    const offset=state.difficulty==='easy'?1:state.difficulty==='hard'?-1:0;
    const armoredStart=Math.max(2,4+offset),camoStart=Math.max(3,6+offset);
    const heavyStart=Math.max(6,9+offset),camoArmoredStart=Math.max(9,12+offset);
    const regenStart=Math.max(3,5+offset),fastStart=Math.max(2,3+offset);
    const finalRound=!isInfinite()&&round===mapRounds(state.map,state.difficulty);
    const armoredMod=Math.max(4,7-Math.floor(round/8)),camoMod=Math.max(5,9-Math.floor(round/8));
    const heavyMod=11,camoArmoredMod=17;
    const regenMod=Math.max(6,9-Math.floor(round/10)),fastMod=Math.max(5,7-Math.floor(round/10));

    if(armorAllowed&&round>=camoArmoredStart&&index%camoArmoredMod===0)return'camoArmored';
    if(armorAllowed&&round>=heavyStart&&index%heavyMod===0)return'heavyArmored';
    if(armorAllowed&&round>=armoredStart&&(index%armoredMod===0||finalRound&&index%4===0))return'armored';
    if(round>=camoStart&&(index%camoMod===camoMod-1||finalRound&&index%5===2))return'camo';
    if(round>=regenStart&&index%regenMod===3)return'regen';
    if(round>=fastStart&&index%fastMod===2)return'fast';
    return'normal';
  }

  const BOSS_NAMES={
    grove:'Dirigível do Bosque',meadow:'Dirigível do Prado',creek:'Dirigível do Riacho',ridge:'Dirigível da Neblina',garden:'Dirigível das Lanternas',toll:'Dirigível do Pedágio',
    harbor:'Dirigível do Porto',canyon:'Dirigível do Desfiladeiro',ruins:'Dirigível Ancestral',factory:'Dirigível Mecânico',fork:'Dirigível Gêmeo',storm:'Dirigível da Tempestade',blind:'Dirigível das Sombras'
  };

  function strongestRegularDurability(round){
    const eliteBase=waveHp(round)*1.45;
    // Em Normal/Difícil, o Blindado Pesado elite é o inimigo regular com maior vida total
    // (blindagem + balão interno). No Fácil, o elite normal é o teto.
    return state.difficulty==='easy'?eliteBase:eliteBase*(2.30+1.05);
  }

  function makeBoss(round){
    const map=currentMap(),diff=currentDifficulty();
    const strongest=strongestRegularDurability(round);
    const hp=Number((strongest*50).toFixed(1));
    const speed=(50+round*3.15)*map.speedMultiplier*diff.speed*.44;
    // Recompensa própria para não transformar o boss em uma fonte absurda de dinheiro.
    const reward=Math.round((90+round*8)*map.rewardMultiplier*diff.waveReward);
    return{at:0,round,kind:'boss',armored:false,camo:false,name:BOSS_NAMES[state.map]||'Chefão',
      hp,maxHp:hp,elite:false,speed,reward,regenPause:0,d:0,slowTimer:0,color:'#ffb347',bossScale:50,strongestHp:strongest};
  }

  // Em mapas com duas rotas paralelas (map.paths.length===2): as 2 primeiras rodadas usam
  // só a rota 0, as 2 seguintes só a rota 1, e a partir da rodada 5 os balões se dividem
  // entre as duas rotas (intercalando por índice). Mapas de rota única sempre retornam 0.
  function pickEnemyPath(round,index){
    const map=currentMap();
    if(!map.paths||map.paths.length<2)return 0;
    if(round<=2)return 0;
    if(round<=4)return 1;
    return index%2;
  }

  function makeEnemy(round,index){
    const map=currentMap(),diff=currentDifficulty(),kind=enemyKind(round,index);
    const eliteMod=Math.max(5,8-Math.floor(round/6)),elite=index%eliteMod===0&&round>2;
    // Sem multiplicador de mapa/dificuldade nem variação por índice: a cor da camada
    // (Vermelho..Preto) precisa significar sempre a mesma quantidade de tiros.
    const base=waveHp(round)*(elite?1.45:1);
    const roundSpeed=isInfinite()?Math.min(round,45):round;
    const endlessSpeed=isInfinite()?1+Math.min(.75,Math.max(0,round-20)*.012):1;
    const baseSpeed=(54+roundSpeed*3.35+(index%5)*2.2)*map.speedMultiplier*diff.speed*endlessSpeed;
    const colors=['#ff7180','#f3bf67','#70caea','#4bd6a0','#c9adff'];
    const color=colors[index%colors.length];

    if(kind==='healer'){
      const hp=Number((base*1.16).toFixed(1)),reward=popReward(hp,{elite,special:true});
      return{at:index*.36,round,kind,armored:false,camo:false,hp,maxHp:hp,elite,speed:baseSpeed*.92,reward,d:0,slowTimer:0,color:SPECIAL_ENEMY_INFO.healer.color,specialTimer:.35+(index%4)*.12,healRadius:76};
    }
    if(kind==='trickster'){
      const hp=Number((base*.92).toFixed(1)),reward=popReward(hp,{elite,special:true});
      return{at:index*.36,round,kind,armored:false,camo:false,hp,maxHp:hp,elite,speed:baseSpeed*1.03,reward,d:0,slowTimer:0,color:SPECIAL_ENEMY_INFO.trickster.color,specialTimer:2.4+(index%3)*.7,stunRadius:108};
    }
    if(kind==='jester'){
      return{at:index*.36,round,kind,armored:false,camo:false,hp:1,maxHp:1,elite:false,speed:baseSpeed*1.16,reward:1,d:0,slowTimer:0,color:SPECIAL_ENEMY_INFO.jester.color,moneyPenaltyCap:500};
    }
    if(kind==='angel'){
      const hp=Number((base*1.12).toFixed(1)),reward=popReward(hp,{elite,special:true});
      return{at:index*.36,round,kind,armored:false,camo:false,hp,maxHp:hp,elite,speed:baseSpeed*.90,reward,d:0,slowTimer:0,color:SPECIAL_ENEMY_INFO.angel.color,specialTimer:2.1+(index%3)*.5,shieldRadius:88};
    }
    if(kind==='demon'){
      const hp=Number((base*1.48).toFixed(1)),reward=popReward(hp,{elite,special:true});
      return{at:index*.36,round,kind,armored:false,camo:false,hp,maxHp:hp,baseMaxHp:hp,demonMaxHp:Number((hp*2).toFixed(1)),elite,speed:baseSpeed*.94,reward,d:0,slowTimer:0,color:SPECIAL_ENEMY_INFO.demon.color,specialTimer:1.7+(index%3)*.4,drainRadius:78};
    }

    if(kind==='camoArmored'){
      const armorHp=Number((base*1.30).toFixed(1)),innerHp=Number((base*.90).toFixed(1));
      const armorReward=popReward(armorHp,{elite,armored:true,camo:true}),reward=popReward(innerHp,{elite,camo:true});
      return{at:index*.36,round,kind,armored:true,camo:true,revealed:false,hp:armorHp,maxHp:armorHp,armorHp,armorMax:armorHp,innerHp,elite,speed:baseSpeed*.9,reward,armorReward,d:0,slowTimer:0,color:'#5c7a63',innerColor:'#547b59'};
    }
    if(kind==='heavyArmored'){
      const armorHp=Number((base*2.3).toFixed(1)),innerHp=Number((base*1.05).toFixed(1));
      const armorReward=popReward(armorHp,{elite,armored:true,heavy:true}),reward=popReward(innerHp,{elite,heavy:true});
      return{at:index*.36,round,kind,armored:true,camo:false,hp:armorHp,maxHp:armorHp,armorHp,armorMax:armorHp,innerHp,elite,speed:baseSpeed*.82,reward,armorReward,d:0,slowTimer:0,color:'#4a525c',innerColor:color};
    }
    if(kind==='armored'){
      const armorHp=Number((base*1.45).toFixed(1)),innerHp=Number((base*.92).toFixed(1));
      const armorReward=popReward(armorHp,{elite,armored:true}),reward=popReward(innerHp,{elite});
      return{at:index*.36,round,kind,armored:true,camo:false,hp:armorHp,maxHp:armorHp,armorHp,armorMax:armorHp,innerHp,elite,speed:baseSpeed,reward,armorReward,d:0,slowTimer:0,color:'#9ba4b4',innerColor:color};
    }
    if(kind==='fast'){
      const hp=Number((base*.55).toFixed(1)),reward=popReward(hp,{elite,fast:true});
      return{at:index*.36,round,kind,armored:false,camo:false,hp,maxHp:hp,elite,speed:baseSpeed*1.85,reward,d:0,slowTimer:0,color:'#ffe066'};
    }
    if(kind==='regen'){
      const hp=Number((base*1.05).toFixed(1)),reward=popReward(hp,{elite,regen:true});
      return{at:index*.36,round,kind,armored:false,camo:false,hp,maxHp:hp,elite,speed:baseSpeed,reward,regenPause:0,d:0,slowTimer:0,color:'#5fd88a'};
    }
    const hp=Number((base*(kind==='camo'?.92:1)).toFixed(1));
    const reward=popReward(hp,{elite,camo:kind==='camo'});
    return{at:index*.36,round,kind,armored:false,camo:kind==='camo',revealed:false,hp,maxHp:hp,elite,speed:baseSpeed,reward,d:0,slowTimer:0,color:kind==='camo'?'#547b59':color};
  }

  function startWave(){
    const map=currentMap(),diff=currentDifficulty(),totalRounds=mapRounds(state.map,state.difficulty),endless=isInfinite();
    if(state.lives<=0){reset();return;}
    if(!endless&&state.completed){setMsg(`${map.name} já foi concluído. Reinicie ou escolha outra dificuldade.`);return;}
    if(!endless&&state.wave>=totalRounds){setMsg('A rodada final já foi chamada. Termine os inimigos restantes.');return;}
    const overlapping=state.enemies.length||state.spawn.length;
    state.wave++;state.waveActive=true;notifyMatchTutorialAction('waveStarted');
    const final=!endless&&state.wave===totalRounds,count=waveEnemyCount(state.wave);
    const newcomers=Array.from({length:count},(_,i)=>{
      const e=makeEnemy(state.wave,i);
      e.path=pickEnemyPath(state.wave,i);
      return e;
    });
    let boss=null;
    if(final){
      boss=makeBoss(state.wave);
      boss.path=0;
      boss.at=(newcomers.length?newcomers[newcomers.length-1].at:0)+2.6;
      newcomers.push(boss);
      playMusicTheme('bossFight');
    }
    state.spawn.push(...newcomers);
    state.pendingClearCash+=Math.round((24+state.wave*5)*diff.waveReward);
    state.pendingWaveXp+=Math.round((7+state.wave*.85)*diff.xpMultiplier);
    const armored=newcomers.filter(e=>e.armored).length,camo=newcomers.filter(e=>e.camo).length;
    const fast=newcomers.filter(e=>e.kind==='fast').length,regen=newcomers.filter(e=>e.kind==='regen').length;
    const specialCounts=Object.fromEntries(Object.keys(SPECIAL_ENEMY_INFO).map(k=>[k,newcomers.filter(e=>e.kind===k).length]));
    const extra=[fast?`${fast} rápido(s)`:'',regen?`${regen} regenerador(es)`:'',...Object.entries(specialCounts).filter(([,n])=>n).map(([k,n])=>`${SPECIAL_ENEMY_INFO[k].icon} ${n} ${SPECIAL_ENEMY_INFO[k].name}`)].filter(Boolean).join(' • ');
    const roundLabel=endless?`${state.wave}/∞`:`${state.wave}/${totalRounds}`;
    const milestone=endless&&state.wave%10===0?` 🪙 MARCO: conclua a rodada ${state.wave} para receber +${infiniteMilestoneReward(state.wave)} moedas permanentes.`:'';
    sfx(final?'boss':'wave');setMsg(`${overlapping?'🚀 Rodada chamada antecipadamente! ':' '}${roundLabel}: ${count} alvos • ${armored} blindado(s) • ${camo} camo${extra?' • '+extra:''}.${final?` RODADA FINAL! 👑 ${boss.name} chegou com ${boss.hp.toFixed(0)} HP — 50× a vida do inimigo regular mais resistente da fase!`:''}${milestone}`);
    updateStats();
  }

  function towerCount(typeId){return state.towers.reduce((sum,t)=>sum+(t.type===typeId?1:0),0);}

  function placeTower(x,y){
    const typeId=state.selected,type=types[typeId];if(!type)return false;
    if(!isTowerUnlocked(typeId)){setMsg(`${type.name} libera no nível ${type.unlockLevel}.`);return false;}
    const placed=towerCount(typeId),price=towerPrice(typeId,state.map),limit=type.limit||TOWER_LIMIT_PER_TYPE;
    if(placed>=limit){setMsg(`🐾 Limite atingido: no máximo ${limit} ${type.name} por mapa.`);renderUnlocks();return false;}
    if(state.money<price){setMsg(`Faltam $${price-Math.floor(state.money)} para ${type.name} neste tier de mapa.`);return false;}
    if(distPath(x,y)<43){setMsg('Muito perto da estrada. Escolha outro ponto para confirmar.');return false;}
    if(obstacleAt(x,y,24)){setMsg('🌳 Esse obstáculo ocupa o espaço e também bloquearia a visão. Escolha outro ponto.');return false;}
    if(state.towers.some(t=>Math.hypot(t.x-x,t.y-y)<46)||(state.hero&&Math.hypot(state.hero.x-x,state.hero.y-y)<52)){setMsg('Muito perto de outra unidade. Escolha outro ponto.');return false;}
    state.money-=price;
    const pathTower=['dart','sniper','frost','vine','burst','ninja','laser','wizard','electric','demonking'].includes(typeId);
    const tower={id:state.nextTowerId++,x,y,type:typeId,cool:0,level:1,angle:0,paths:pathTower?[0,0,0]:undefined,dartMainPath:null,dartLastPath:null,sniperMainPath:null,sniperLastPath:null,demonMainPath:null,demonLastPath:null,planeTimer:0,planeLastWave:state.wave,
      spent:price,damageDealt:0,pops:0,incomeGenerated:0,masteryAbilityCd:0,masteryBuffTimer:0,fearCooldown:typeId==='demonking'?1.4:0};
    state.towers.push(tower);state.masterySession[typeId].used=true;
    const count=towerCount(typeId);
    state.selectedTower=null;state.selectedHero=false;cancelPlacement(true);
    setMsg(`✓ ${type.name} posicionado. ${count}/${type.limit||TOWER_LIMIT_PER_TYPE} deste tipo. Para colocar outro, selecione o gatinho novamente na barra.`);
    notifyMatchTutorialAction('towerPlaced');
    renderUnlocks();updateStats();announceNewSynergies();return true;
  }

  function placeHero(x,y){
    if(state.hero){setMsg('🦸 Só é permitido 1 Herói Gatinho por partida.');return false;}
    const id=profile.selectedHero||'king',h=HEROES[id]||HEROES.king,price=heroPrice(id,state.map);
    if(state.money<price){setMsg(`Faltam $${price-Math.floor(state.money)} para colocar ${h.name}.`);return false;}
    if(distPath(x,y)<46){setMsg('O herói está muito perto da estrada. Escolha outro ponto.');return false;}
    if(obstacleAt(x,y,27)){setMsg('🌳 Esse obstáculo ocupa o espaço do herói. Escolha outro ponto.');return false;}
    if(state.towers.some(t=>Math.hypot(t.x-x,t.y-y)<52)){setMsg('Muito perto de outro gatinho. Escolha outro ponto.');return false;}
    state.money-=price;
    state.hero={type:id,x,y,level:1,xp:0,cool:0,skillCd:0,ultimateCd:0,commandTimer:0,ultimateTimer:0,farmBoostWaves:0,damageDealt:0,pops:0,spent:price,priority:id==='warrior'?'strong':'first'};
    cancelPlacement(true);sfx('place');
    setMsg(`🦸 ${h.name} entrou em campo! Ele sobe do nível 1 ao 10 nesta partida. Habilidade no Nv.5 e Ultimate no Nv.10.`);
    renderHeroHud();updateStats();announceNewSynergies();return true;
  }

  function heroAt(x,y){return state.hero&&Math.hypot(state.hero.x-x,state.hero.y-y)<=32?state.hero:null;}

  function towerAt(x,y){return[...state.towers].reverse().find(t=>{const tier=t.type==='dart'?Math.max(0,...dartPaths(t)):t.type==='sniper'?Math.max(0,...sniperPaths(t)):t.type==='frost'?Math.max(0,...frostPaths(t)):t.type==='vine'?Math.max(0,...vinePaths(t)):t.type==='burst'?Math.max(0,...burstPaths(t)):t.type==='ninja'?Math.max(0,...ninjaPaths(t)):t.type==='laser'?Math.max(0,...laserPaths(t)):t.type==='wizard'?Math.max(0,...wizardPaths(t)):t.type==='electric'?Math.max(0,...electricPaths(t)):t.type==='demonking'?Math.max(0,...demonkingPaths(t)):Math.max(0,(t.level||1)-1);return Math.hypot(t.x-x,t.y-y)<=24+tier*2;})||null;}

  function upgradeDartPath(pathIndex){
    const t=selectedTower();
    if(!t||t.type!=='dart'){setMsg('Selecione um Gatinho Dardo para usar os caminhos de upgrade.');return;}
    if(pathIndex<0||pathIndex>=DART_PATHS.length)return;
    const p=dartPaths(t),current=p[pathIndex],lock=dartPathLockReason(t,pathIndex);
    if(lock){setMsg(`🔒 ${DART_PATHS[pathIndex].name}: ${lock}.`);updateUpgradePanel();return;}
    const next=current+1,tier=DART_PATHS[pathIndex].tiers[current];
    if(state.money<tier.cost){setMsg(`Faltam $${tier.cost-Math.floor(state.money)} para ${tier.name}.`);return;}
    state.money-=tier.cost;t.spent=(t.spent||towerPrice(t.type,state.map))+tier.cost;p[pathIndex]=next;t.paths=p;t.dartLastPath=pathIndex;
    if(next===4)t.dartMainPath=pathIndex;
    const st=towerStats(t);
    state.pulses.push({x:t.x,y:t.y,range:48+next*10,life:.55,maxLife:.55,color:DART_PATHS[pathIndex].color});
    spawnFloatText(t.x,t.y-34,`${DART_PATHS[pathIndex].icon} T${next}`,DART_PATHS[pathIndex].color);
    setMsg(`${DART_PATHS[pathIndex].icon} ${DART_PATHS[pathIndex].name} T${next}: ${tier.name}. ${tier.description}`);
    updateUpgradePanel();updateStats();
  }

  function upgradeSniperPath(pathIndex){
    const t=selectedTower();
    if(!t||t.type!=='sniper'){setMsg('Selecione um Gato Sniper para usar os caminhos de upgrade.');return;}
    if(pathIndex<0||pathIndex>=SNIPER_PATHS.length)return;
    const p=sniperPaths(t),current=p[pathIndex],lock=sniperPathLockReason(t,pathIndex);
    if(lock){setMsg(`🔒 ${SNIPER_PATHS[pathIndex].name}: ${lock}.`);updateUpgradePanel();return;}
    const next=current+1,tier=SNIPER_PATHS[pathIndex].tiers[current];
    if(state.money<tier.cost){setMsg(`Faltam $${tier.cost-Math.floor(state.money)} para ${tier.name}.`);return;}
    state.money-=tier.cost;t.spent=(t.spent||towerPrice(t.type,state.map))+tier.cost;p[pathIndex]=next;t.paths=p;t.sniperLastPath=pathIndex;
    if(next===4)t.sniperMainPath=pathIndex;
    if(pathIndex===2&&next===5){t.planeTimer=0;t.planeLastWave=state.wave;}
    const st=towerStats(t);
    state.pulses.push({x:t.x,y:t.y,range:52+next*12,life:.58,maxLife:.58,color:SNIPER_PATHS[pathIndex].color});
    spawnFloatText(t.x,t.y-34,`${SNIPER_PATHS[pathIndex].icon} T${next}`,SNIPER_PATHS[pathIndex].color);
    setMsg(`${SNIPER_PATHS[pathIndex].icon} ${SNIPER_PATHS[pathIndex].name} T${next}: ${tier.name}. ${tier.description}`);
    updateUpgradePanel();updateStats();
  }

  function upgradeFrostPath(pathIndex){
    const t=selectedTower();
    if(!t||t.type!=='frost'){setMsg('Selecione um Gato Gelinho para usar os caminhos de upgrade.');return;}
    if(pathIndex<0||pathIndex>=FROST_PATHS.length)return;
    const p=frostPaths(t),current=p[pathIndex],lock=frostPathLockReason(t,pathIndex);
    if(lock){setMsg(`🔒 ${FROST_PATHS[pathIndex].name}: ${lock}.`);updateUpgradePanel();return;}
    const next=current+1,tier=FROST_PATHS[pathIndex].tiers[current];
    if(state.money<tier.cost){setMsg(`Faltam $${tier.cost-Math.floor(state.money)} para ${tier.name}.`);return;}
    state.money-=tier.cost;t.spent=(t.spent||towerPrice(t.type,state.map))+tier.cost;p[pathIndex]=next;t.paths=p;t.frostLastPath=pathIndex;
    if(next===4)t.frostMainPath=pathIndex;
    state.pulses.push({x:t.x,y:t.y,range:48+next*10,life:.55,maxLife:.55,color:FROST_PATHS[pathIndex].color});
    spawnFloatText(t.x,t.y-34,`${FROST_PATHS[pathIndex].icon} T${next}`,FROST_PATHS[pathIndex].color);
    setMsg(`${FROST_PATHS[pathIndex].icon} ${FROST_PATHS[pathIndex].name} T${next}: ${tier.name}. ${tier.description}`);
    updateUpgradePanel();updateStats();
  }

  function upgradeVinePath(pathIndex){
    const t=selectedTower();
    if(!t||t.type!=='vine'){setMsg('Selecione um Gato Cipó para usar os caminhos de upgrade.');return;}
    if(pathIndex<0||pathIndex>=VINE_PATHS.length)return;
    const p=vinePaths(t),current=p[pathIndex],lock=vinePathLockReason(t,pathIndex);
    if(lock){setMsg(`🔒 ${VINE_PATHS[pathIndex].name}: ${lock}.`);updateUpgradePanel();return;}
    const next=current+1,tier=VINE_PATHS[pathIndex].tiers[current];
    if(state.money<tier.cost){setMsg(`Faltam $${tier.cost-Math.floor(state.money)} para ${tier.name}.`);return;}
    state.money-=tier.cost;t.spent=(t.spent||towerPrice(t.type,state.map))+tier.cost;p[pathIndex]=next;t.paths=p;t.vineLastPath=pathIndex;
    if(next===4)t.vineMainPath=pathIndex;
    state.pulses.push({x:t.x,y:t.y,range:48+next*10,life:.55,maxLife:.55,color:VINE_PATHS[pathIndex].color});
    spawnFloatText(t.x,t.y-34,`${VINE_PATHS[pathIndex].icon} T${next}`,VINE_PATHS[pathIndex].color);
    setMsg(`${VINE_PATHS[pathIndex].icon} ${VINE_PATHS[pathIndex].name} T${next}: ${tier.name}. ${tier.description}`);
    updateUpgradePanel();updateStats();
  }

  function upgradeBurstPath(pathIndex){
    const t=selectedTower();
    if(!t||t.type!=='burst'){setMsg('Selecione um Gato Bombinha para usar os caminhos de upgrade.');return;}
    if(pathIndex<0||pathIndex>=BURST_PATHS.length)return;
    const p=burstPaths(t),current=p[pathIndex],lock=burstPathLockReason(t,pathIndex);
    if(lock){setMsg(`🔒 ${BURST_PATHS[pathIndex].name}: ${lock}.`);updateUpgradePanel();return;}
    const next=current+1,tier=BURST_PATHS[pathIndex].tiers[current];
    if(state.money<tier.cost){setMsg(`Faltam $${tier.cost-Math.floor(state.money)} para ${tier.name}.`);return;}
    state.money-=tier.cost;t.spent=(t.spent||towerPrice(t.type,state.map))+tier.cost;p[pathIndex]=next;t.paths=p;t.burstLastPath=pathIndex;
    if(next===4)t.burstMainPath=pathIndex;
    const st=towerStats(t);
    state.pulses.push({x:t.x,y:t.y,range:48+next*10,life:.55,maxLife:.55,color:BURST_PATHS[pathIndex].color});
    spawnFloatText(t.x,t.y-34,`${BURST_PATHS[pathIndex].icon} T${next}`,BURST_PATHS[pathIndex].color);
    setMsg(`${BURST_PATHS[pathIndex].icon} ${BURST_PATHS[pathIndex].name} T${next}: ${tier.name}. ${tier.description}`);
    updateUpgradePanel();updateStats();
  }

  function upgradeNinjaPath(pathIndex){
    const t=selectedTower();
    if(!t||t.type!=='ninja'){setMsg('Selecione um Gato Ninja para usar os caminhos de upgrade.');return;}
    if(pathIndex<0||pathIndex>=NINJA_PATHS.length)return;
    const p=ninjaPaths(t),current=p[pathIndex],lock=ninjaPathLockReason(t,pathIndex);
    if(lock){setMsg(`🔒 ${NINJA_PATHS[pathIndex].name}: ${lock}.`);updateUpgradePanel();return;}
    const next=current+1,tier=NINJA_PATHS[pathIndex].tiers[current];
    if(state.money<tier.cost){setMsg(`Faltam $${tier.cost-Math.floor(state.money)} para ${tier.name}.`);return;}
    state.money-=tier.cost;t.spent=(t.spent||towerPrice(t.type,state.map))+tier.cost;p[pathIndex]=next;t.paths=p;t.ninjaLastPath=pathIndex;
    if(next===4)t.ninjaMainPath=pathIndex;
    const st=towerStats(t);
    state.pulses.push({x:t.x,y:t.y,range:48+next*10,life:.55,maxLife:.55,color:NINJA_PATHS[pathIndex].color});
    spawnFloatText(t.x,t.y-34,`${NINJA_PATHS[pathIndex].icon} T${next}`,NINJA_PATHS[pathIndex].color);
    setMsg(`${NINJA_PATHS[pathIndex].icon} ${NINJA_PATHS[pathIndex].name} T${next}: ${tier.name}. ${tier.description}`);
    updateUpgradePanel();updateStats();
  }

  function upgradeLaserPath(pathIndex){
    const t=selectedTower();
    if(!t||t.type!=='laser'){setMsg('Selecione um Gato Laser para usar os caminhos de upgrade.');return;}
    if(pathIndex<0||pathIndex>=LASER_PATHS.length)return;
    const p=laserPaths(t),current=p[pathIndex],lock=laserPathLockReason(t,pathIndex);
    if(lock){setMsg(`🔒 ${LASER_PATHS[pathIndex].name}: ${lock}.`);updateUpgradePanel();return;}
    const next=current+1,tier=LASER_PATHS[pathIndex].tiers[current];
    if(state.money<tier.cost){setMsg(`Faltam $${tier.cost-Math.floor(state.money)} para ${tier.name}.`);return;}
    state.money-=tier.cost;t.spent=(t.spent||towerPrice(t.type,state.map))+tier.cost;p[pathIndex]=next;t.paths=p;t.laserLastPath=pathIndex;
    if(next===4)t.laserMainPath=pathIndex;
    const st=towerStats(t);
    state.pulses.push({x:t.x,y:t.y,range:48+next*10,life:.55,maxLife:.55,color:LASER_PATHS[pathIndex].color});
    spawnFloatText(t.x,t.y-34,`${LASER_PATHS[pathIndex].icon} T${next}`,LASER_PATHS[pathIndex].color);
    setMsg(`${LASER_PATHS[pathIndex].icon} ${LASER_PATHS[pathIndex].name} T${next}: ${tier.name}. ${tier.description}`);
    updateUpgradePanel();updateStats();
  }

  function upgradeWizardPath(pathIndex){
    const t=selectedTower();
    if(!t||t.type!=='wizard'){setMsg('Selecione um Gato Mago para usar os caminhos de upgrade.');return;}
    if(pathIndex<0||pathIndex>=WIZARD_PATHS.length)return;
    const p=wizardPaths(t),current=p[pathIndex],lock=wizardPathLockReason(t,pathIndex);
    if(lock){setMsg(`🔒 ${WIZARD_PATHS[pathIndex].name}: ${lock}.`);updateUpgradePanel();return;}
    const next=current+1,tier=WIZARD_PATHS[pathIndex].tiers[current];
    if(state.money<tier.cost){setMsg(`Faltam $${tier.cost-Math.floor(state.money)} para ${tier.name}.`);return;}
    state.money-=tier.cost;t.spent=(t.spent||towerPrice(t.type,state.map))+tier.cost;p[pathIndex]=next;t.paths=p;t.wizardLastPath=pathIndex;
    if(next===4)t.wizardMainPath=pathIndex;
    const st=towerStats(t);
    state.pulses.push({x:t.x,y:t.y,range:48+next*10,life:.55,maxLife:.55,color:WIZARD_PATHS[pathIndex].color});
    spawnFloatText(t.x,t.y-34,`${WIZARD_PATHS[pathIndex].icon} T${next}`,WIZARD_PATHS[pathIndex].color);
    setMsg(`${WIZARD_PATHS[pathIndex].icon} ${WIZARD_PATHS[pathIndex].name} T${next}: ${tier.name}. ${tier.description}`);
    updateUpgradePanel();updateStats();
  }

  function upgradeElectricPath(pathIndex){
    const t=selectedTower();
    if(!t||t.type!=='electric'){setMsg('Selecione um Gato Volts para usar os caminhos de upgrade.');return;}
    if(pathIndex<0||pathIndex>=ELECTRIC_PATHS.length)return;
    const p=electricPaths(t),current=p[pathIndex],lock=electricPathLockReason(t,pathIndex);
    if(lock){setMsg(`🔒 ${ELECTRIC_PATHS[pathIndex].name}: ${lock}.`);updateUpgradePanel();return;}
    const next=current+1,tier=ELECTRIC_PATHS[pathIndex].tiers[current];
    if(state.money<tier.cost){setMsg(`Faltam $${tier.cost-Math.floor(state.money)} para ${tier.name}.`);return;}
    state.money-=tier.cost;t.spent=(t.spent||towerPrice(t.type,state.map))+tier.cost;p[pathIndex]=next;t.paths=p;t.electricLastPath=pathIndex;
    if(next===4)t.electricMainPath=pathIndex;
    const st=towerStats(t);
    state.pulses.push({x:t.x,y:t.y,range:48+next*10,life:.55,maxLife:.55,color:ELECTRIC_PATHS[pathIndex].color});
    spawnFloatText(t.x,t.y-34,`${ELECTRIC_PATHS[pathIndex].icon} T${next}`,ELECTRIC_PATHS[pathIndex].color);
    setMsg(`${ELECTRIC_PATHS[pathIndex].icon} ${ELECTRIC_PATHS[pathIndex].name} T${next}: ${tier.name}. ${tier.description}`);
    updateUpgradePanel();updateStats();
  }


  function upgradeDemonkingPath(pathIndex){
    const t=selectedTower();
    if(!t||t.type!=='demonking'){setMsg('Selecione um Gatinho Rei Demônio para usar os caminhos de upgrade.');return;}
    if(pathIndex<0||pathIndex>=DEMONKING_PATHS.length)return;
    const p=demonkingPaths(t),current=p[pathIndex],lock=demonkingPathLockReason(t,pathIndex);
    if(lock){setMsg(`🔒 ${DEMONKING_PATHS[pathIndex].name}: ${lock}.`);updateUpgradePanel();return;}
    const next=current+1,tier=DEMONKING_PATHS[pathIndex].tiers[current];
    if(state.money<tier.cost){setMsg(`Faltam $${tier.cost-Math.floor(state.money)} para ${tier.name}.`);return;}
    state.money-=tier.cost;t.spent=(t.spent||towerPrice(t.type,state.map))+tier.cost;p[pathIndex]=next;t.paths=p;t.demonLastPath=pathIndex;
    if(next===4)t.demonMainPath=pathIndex;
    state.pulses.push({x:t.x,y:t.y,range:54+next*12,life:.6,maxLife:.6,color:DEMONKING_PATHS[pathIndex].color});
    spawnFloatText(t.x,t.y-34,`${DEMONKING_PATHS[pathIndex].icon} T${next}`,DEMONKING_PATHS[pathIndex].color);
    setMsg(`${DEMONKING_PATHS[pathIndex].icon} ${DEMONKING_PATHS[pathIndex].name} T${next}: ${tier.name}. ${tier.description}`);
    updateUpgradePanel();updateStats();
  }

  function upgradeTower(){
    const t=selectedTower();
    if(!t){setMsg('Clique primeiro em um gatinho já posicionado.');return;}
    if(t.type==='dart'||t.type==='sniper'||t.type==='frost'||t.type==='vine'||t.type==='burst'||t.type==='ninja'||t.type==='laser'||t.type==='wizard'||t.type==='electric'||t.type==='demonking'){setMsg(`${types[t.type].name} usa a árvore de 3 caminhos na aba de upgrades da direita.`);updateUpgradePanel();return;}
    if(t.level>=MAX_LEVEL){setMsg(`${types[t.type].name} já está no nível máximo.`);return;}
    const cost=upgradeCost(t);
    if(state.money<cost){setMsg(`Faltam $${cost-Math.floor(state.money)} para o upgrade.`);return;}
    const before=towerStats(t);state.money-=cost;t.spent=(t.spent||towerPrice(t.type,state.map))+cost;t.level++;
    const st=towerStats(t);
    state.pulses.push({x:t.x,y:t.y,range:46+t.level*10,life:.5,maxLife:.5,color:st.accent||st.color});
    spawnFloatText(t.x,t.y-30,`⬆ nível ${t.level}`,st.accent||'#ffe89a');
    if(st.farm){
      setMsg(`${st.name} → nível ${t.level}: renda $${before.farmIncome}→$${st.farmIncome} por rodada concluída.`);
    }else if(st.rootHold){
      setMsg(`${st.name} → nível ${t.level}: recarga ${before.rate.toFixed(1)}s→${st.rate.toFixed(1)}s • imobiliza por ${st.rootDuration}s • range ${st.range}.`);
    }else{
      setMsg(`${st.name} → nível ${t.level}: dano ${before.damage.toFixed(2)}→${st.damage.toFixed(2)} • velocidade ${(1/before.rate).toFixed(1)}→${(1/st.rate).toFixed(1)}/s${st.globalRange?' • range continua GLOBAL':` • range ${st.range}`}.`);
    }
    updateUpgradePanel();updateStats();
  }

  function recordMastery(type,field,amount=1){const s=state.masterySession[type];if(s)s[field]=(s[field]||0)+Math.max(0,Number(amount)||0);}
  function activateMasteryAbility(){
    const t=selectedTower();if(!t||masteryState(t.type).level<50)return;
    if((t.masteryAbilityCd||0)>0){setMsg(`⭐ ${MASTERY_ABILITIES[t.type].name} recarrega em ${Math.ceil(t.masteryAbilityCd)}s.`);return;}
    const st=towerStats(t),ab=MASTERY_ABILITIES[t.type],alive=state.enemies.filter(e=>!e.dead);if(!alive.length&&t.type!=='salmon'){setMsg('Não há inimigos no mapa para usar essa habilidade.');return;}
    const strongest=()=>alive.slice().sort((a,b)=>(b.hp||0)-(a.hp||0))[0];
    if(t.type==='dart'){
      alive.forEach(e=>damageEnemy(e,st.damage*.5,{...st,detectsCamo:true,breaksArmor:true}));state.pulses.push({x:W/2,y:H/2,range:Math.max(W,H),life:.45,maxLife:.45,color:'#f3bf67'});
    }else if(t.type==='sniper'){
      const e=strongest();damageEnemy(e,st.damage*10,{...st,detectsCamo:true,breaksArmor:true});const p=pointAt(e.d,e.path);spawnFloatText(p.x,p.y-30,'💥 EXECUÇÃO ×10','#ffd36b');
    }else if(t.type==='frost'){
      alive.forEach(e=>{if(e.kind==='boss'){e.slowTimer=Math.max(e.slowTimer||0,4);e.slowFactor=Math.min(e.slowFactor||1,.18);}else e.rootTimer=Math.max(e.rootTimer||0,3);});
      state.pulses.push({x:W/2,y:H/2,range:Math.max(W,H),life:.5,maxLife:.5,color:'#70caea'});
    }else if(t.type==='burst'){
      const e=strongest(),center=pointAt(e.d,e.path);for(let k=0;k<5;k++)alive.forEach(x=>{const p=pointAt(x.d,x.path);if(Math.hypot(p.x-center.x,p.y-center.y)<=145)damageEnemy(x,st.damage,{...st,detectsCamo:true,breaksArmor:true});});state.pulses.push({x:center.x,y:center.y,range:145,life:.7,maxLife:.7,color:'#ff7180'});
    }else if(t.type==='electric'){
      for(let k=0;k<4;k++)alive.forEach(e=>damageEnemy(e,st.damage*.75,{...st,detectsCamo:true,breaksArmor:true}));
      state.pulses.push({x:W/2,y:H/2,range:Math.max(W,H),life:.5,maxLife:.5,color:'#ffe66d'});
    }else if(t.type==='vine'){
      alive.forEach(e=>e.rootTimer=Math.max(e.rootTimer||0,e.kind==='boss'?2:4));
      state.pulses.push({x:W/2,y:H/2,range:Math.max(W,H),life:.5,maxLife:.5,color:'#69d17d'});
    }else if(t.type==='boomerang'){
      ctx.strokeStyle=accent;ctx.lineWidth=5;ctx.lineCap='round';ctx.beginPath();ctx.arc(r*.8,-2,13,-2.25,-.3);ctx.stroke();ctx.beginPath();ctx.arc(r*.8,-2,13,.3,2.25);ctx.stroke();ctx.lineCap='butt';ctx.fillStyle='#5b3c2d';ctx.fillRect(-r*.55,-r*.6,7,22);
    }else if(t.type==='alchemist'){
      ctx.fillStyle='#465064';ctx.beginPath();ctx.roundRect(-12,-r-5,24,11,4);ctx.fill();ctx.fillStyle='#b7ff75';ctx.globalAlpha=.9;ctx.beginPath();ctx.arc(17,7,8,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;ctx.strokeStyle='#e8ffbd';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(13,1);ctx.lineTo(13,-7);ctx.lineTo(21,-7);ctx.lineTo(21,1);ctx.stroke();
    }else if(t.type==='chronomancer'){
      ctx.strokeStyle='#9de7ff';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(0,-3,r+8,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#d8f6ff';ctx.beginPath();ctx.arc(r*.75,-r*.45,8,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#446c89';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(r*.75,-r*.45);ctx.lineTo(r*.75,-r*.45-5);ctx.moveTo(r*.75,-r*.45);ctx.lineTo(r*.75+4,-r*.45);ctx.stroke();
    }else if(t.type==='salmon'){
      const cash=Math.max(1,Math.round((st.farmIncome||1)*3));state.money+=cash;t.incomeGenerated=(t.incomeGenerated||0)+cash;recordMastery('salmon','income',cash);spawnFloatText(t.x,t.y-30,`🐟 +$${cash}`,'#ffcf8a');
    }else if(t.type==='ninja'){
      t.masteryBuffTimer=10;state.pulses.push({x:t.x,y:t.y,range:80,life:.8,maxLife:.8,color:'#b58cff'});
    }else if(t.type==='wizard'){
      const e=strongest(),center=pointAt(e.d,e.path);alive.forEach(x=>{const p=pointAt(x.d,x.path);if(Math.hypot(p.x-center.x,p.y-center.y)<=165)damageEnemy(x,st.damage*3,{...st,detectsCamo:true,breaksArmor:true});});state.pulses.push({x:center.x,y:center.y,range:165,life:.75,maxLife:.75,color:'#c9adff'});
    }else if(t.type==='laser'){
      t.masteryBuffTimer=8;state.pulses.push({x:t.x,y:t.y,range:95,life:.7,maxLife:.7,color:'#ff5d6c'});
    }else if(t.type==='boomerang'){
      for(let k=0;k<5;k++)alive.forEach(e=>{if(!e.dead)damageEnemy(e,st.damage*.6,{...st,detectsCamo:true,breaksArmor:true});});state.pulses.push({x:W/2,y:H/2,range:Math.max(W,H),life:.75,maxLife:.75,color:'#f3c168'});
    }else if(t.type==='alchemist'){
      t.masteryBuffTimer=10;state.pulses.push({x:t.x,y:t.y,range:110,life:.8,maxLife:.8,color:'#b7ff75'});
    }else if(t.type==='chronomancer'){
      alive.forEach(e=>{const seconds=e.kind==='boss'?3:5;e.d=Math.max(0,e.d-e.speed*seconds);e.temporalMark=null;});state.pulses.push({x:W/2,y:H/2,range:Math.max(W,H),life:1,maxLife:1,color:'#9de7ff'});
    }else if(t.type==='demonking'){
      applyDemonFear(t,{...st,fearRadius:Math.max(W,H)*2,fearBack:95,fearDuration:8,fearVuln:.25,shadowCap:Math.max(12,st.shadowCap||8),shadowDamageMult:(st.shadowDamageMult||1)*1.35},true);
      alive.forEach(e=>{if(!e.dead)applyBurn(e,{damage:Math.max(2,st.damage*.28),interval:.8,ticks:6},{...st,detectsCamo:true,breaksArmor:true});});
      state.pulses.push({x:W/2,y:H/2,range:Math.max(W,H),life:1.2,maxLife:1.2,color:'#7d2dc2'});
    }
    t.masteryAbilityCd=ab.cooldown;recordMastery(t.type,'actions',8);sfx('boss');setMsg(`${ab.icon} ${types[t.type].name}: ${ab.name} ativada!`);updateUpgradePanel();updateStats();
  }
  function heroTargetsInRange(h,st){
    return state.enemies.filter(e=>{if(e.dead)return false;if(!canTowerTarget(h,e,st))return false;const p=pointAt(e.d,e.path);return Math.hypot(p.x-h.x,p.y-h.y)<=st.range&&hasLineOfSight(h,p);});
  }

  function activateHeroSkill(){
    const h=state.hero;if(!h)return;const def=HEROES[h.type],st=heroStats(h);
    if((h.stunTimer||0)>0){setMsg(`😵 ${def.name} está atordoado por mais ${Math.ceil(h.stunTimer*10)/10}s.`);return;}
    if(h.level<5){setMsg(`🔒 ${def.skill.name} libera no nível 5 do herói.`);return;}
    if(h.skillCd>0){setMsg(`${def.skill.icon} ${def.skill.name} recarrega em ${Math.ceil(h.skillCd)}s.`);return;}
    if(h.type==='king'){h.commandTimer=8;state.pulses.push({x:h.x,y:h.y,range:st.auraRange,life:.8,maxLife:.8,color:def.color});}
    if(h.type==='warrior'){const targets=heroTargetsInRange(h,st).sort((a,b)=>((b.hp||0)+(b.innerHp||0))-((a.hp||0)+(a.innerHp||0)));const e=targets[0];if(!e){setMsg('Nenhum inimigo no alcance para o Golpe Heroico.');return;}damageEnemy(e,st.damage*5,st);const p=pointAt(e.d,e.path);spawnFloatText(p.x,p.y-30,'⚔️ ×5',def.color);}
    if(h.type==='luna'){const targets=heroTargetsInRange(h,st).sort((a,b)=>((b.hp||0)+(b.innerHp||0))-((a.hp||0)+(a.innerHp||0))).slice(0,3);if(!targets.length){setMsg('Nenhum inimigo no alcance para o Passo Lunar.');return;}targets.forEach(e=>{e.d=Math.max(0,e.d-120);const p=pointAt(e.d,e.path);spawnFloatText(p.x,p.y-22,'🌙 RECUO',def.color);});}
    if(h.type==='merchant'){const cash=180+h.level*55;state.money+=cash;spawnFloatText(h.x,h.y-34,`💰 +$${cash}`,def.color);}
    h.skillCd=def.skill.cooldown;sfx('ui');setMsg(`${def.skill.icon} ${def.name}: ${def.skill.name} ativada!`);renderHeroHud();updateStats();
  }

  function activateHeroUltimate(){
    const h=state.hero;if(!h)return;const def=HEROES[h.type],st=heroStats(h);
    if((h.stunTimer||0)>0){setMsg(`😵 ${def.name} está atordoado por mais ${Math.ceil(h.stunTimer*10)/10}s.`);return;}
    if(h.level<10){setMsg(`🔒 ${def.ultimate.name} libera no nível 10 do herói.`);return;}
    if(h.ultimateCd>0){setMsg(`${def.ultimate.icon} ${def.ultimate.name} recarrega em ${Math.ceil(h.ultimateCd)}s.`);return;}
    if(h.type==='king'){h.ultimateTimer=10;state.pulses.push({x:h.x,y:h.y,range:Math.max(W,H),life:1,maxLife:1,color:def.color});}
    if(h.type==='warrior'){const targets=heroTargetsInRange(h,st);if(!targets.length){setMsg('Nenhum inimigo no alcance para Mil Cortes.');return;}for(let i=0;i<4;i++)targets.forEach(e=>{if(!e.dead)damageEnemy(e,st.damage*1.25,st);});state.pulses.push({x:h.x,y:h.y,range:st.range,life:.9,maxLife:.9,color:def.color});}
    if(h.type==='luna'){state.enemies.forEach(e=>{if(e.dead)return;e.slowTimer=Math.max(e.slowTimer||0,8);e.slowFactor=Math.min(e.slowFactor||1,.35);e.markTimer=Math.max(e.markTimer||0,8);e.markBonus=Math.max(e.markBonus||0,.25);});state.pulses.push({x:W/2,y:H/2,range:Math.max(W,H),life:1.2,maxLife:1.2,color:def.color});}
    if(h.type==='merchant'){const cash=700+h.level*80;state.money+=cash;h.farmBoostWaves=2;spawnFloatText(h.x,h.y-36,`💎 +$${cash}`,def.color);}
    h.ultimateCd=def.ultimate.cooldown;sfx('boss');setMsg(`${def.ultimate.icon} ${def.name}: ${def.ultimate.name} ativada!`);renderHeroHud();updateStats();
  }

  // v0.19.0: no ritmo antigo, mastear UM gatinho (chegar ao Nv.50) exigia algo
  // como 30-90 partidas dedicadas a ele (dependendo do quanto era usado), o que
  // deixava a progressão de Maestria bem mais lenta que o resto do jogo — com 9
  // tipos de gatinho + Pescador, mastear tudo passava de 300 partidas. MASTERY_PACE
  // acelera o ganho de XP por partida em ~60% (curva de níveis em si não muda),
  // trazendo isso para algo em torno de 20-55 partidas por gatinho.
  const MASTERY_PACE=1.6;
  function masteryMatchRewards(){
    if(state.masteryXpGranted)return[];state.masteryXpGranted=true;const results=[];
    const diffMult={easy:.85,normal:1,hard:1.25}[state.difficulty]||1;const catMult={beginner:.9,medium:1,hardmaps:1.15,impossible:1.3}[mapCategoryForMap(state.map).id]||1;
    const waveFactor=Math.max(0,state.lastClearedWave||state.wave||0)*2;
    for(const [id,ss] of Object.entries(state.masterySession)){if(!ss.used)continue;
      let raw=25+waveFactor+Math.min(150,Math.floor(ss.damage/70))+Math.min(90,Math.floor(ss.pops*1.2))+Math.min(140,Math.floor(ss.income/10))+Math.min(100,Math.floor(ss.actions*1.5));
      if(isInfinite())raw*=1.08;const amount=Math.max(8,Math.round(raw*diffMult*catMult*MASTERY_PACE));const before=masteryState(id).level,res=grantMasteryXp(id,amount);results.push({id,xp:amount,from:before,to:masteryState(id).level,coins:res.coins});
    }
    saveProfile();return results;
  }

  function canTowerTarget(tower,enemy,stats=null){
    const type=stats||towerStats(tower);
    if(enemy.camo&&!enemy.revealed&&!type.detectsCamo)return false;
    if(enemy.armored&&!type.breaksArmor)return false;
    return true;
  }

  function canControlTarget(tower,enemy,stats=null){
    const type=stats||towerStats(tower);
    if(enemy.camo&&!enemy.revealed&&!type.detectsCamo)return false;
    return true;
  }

  function updateCamoReveals(){
    // Detectar Camo para si NÃO revela mais o alvo para toda a defesa.
    // Apenas unidades com revealsCamo (Sniper Observador T2+) fazem a revelação global.
    const detectors=state.towers.filter(t=>towerStats(t).revealsCamo);
    if(!detectors.length)return;
    for(const e of state.enemies){
      if(!e.camo||e.dead||e.revealed)continue;
      const p=pointAt(e.d,e.path);
      const spotted=detectors.some(t=>{
        const st=towerStats(t);
        return (st.globalRange||Math.hypot(p.x-t.x,p.y-t.y)<=st.range)&&hasLineOfSight(t,p);
      });
      if(spotted){
        e.revealed=true;
        spawnFloatText(p.x,p.y-20,'👁 Camo revelado!','#70caea');
      }
    }
  }

  const TOWER_TURN_RATE=11; // rad/s — velocidade com que o gatinho gira o corpo/arma até o alvo
  const TARGET_PRIORITIES=['first','last','strong','weak','camo','armored'];
  const TARGET_PRIORITY_LABELS={first:'Primeiro',last:'Último',strong:'Mais forte',weak:'Mais fraco',camo:'Camuflado primeiro',armored:'Blindado primeiro'};
  function targetPriorityScore(e,mode){
    const power=(e.hp||0)+(e.armored?(e.innerHp||0):0);
    switch(mode){
      case 'last':return -e.d;
      case 'strong':return power;
      case 'weak':return -power;
      case 'camo':return(e.camo?1e6:0)+e.d;
      case 'armored':return(e.armored?1e6:0)+e.d;
      default:return e.d;
    }
  }

  function targetFor(tower,st){
    let best=null,bestScore=-Infinity;
    const mode=TARGET_PRIORITIES.includes(tower.priority)?tower.priority:'first';
    for(const e of state.enemies){
      if(e.dead)continue;
      if(!canTowerTarget(tower,e,st))continue;
      const p=pointAt(e.d,e.path);
      if(!((st.globalRange||Math.hypot(p.x-tower.x,p.y-tower.y)<=st.range)&&hasLineOfSight(tower,p)))continue;
      const score=targetPriorityScore(e,mode);
      if(score>bestScore){best=e;bestScore=score;}
    }
    return best;
  }

  function targetsInRange(tower,st){
    return state.enemies.filter(e=>{
      if(e.dead)return false;
      if(!canTowerTarget(tower,e,st))return false;
      const p=pointAt(e.d,e.path);
      return (st.globalRange||Math.hypot(p.x-tower.x,p.y-tower.y)<=st.range)&&hasLineOfSight(tower,p);
    });
  }

  function controlTargets(tower,st){
    const valid=state.enemies.filter(e=>{
      if(e.dead||!canControlTarget(tower,e,st))return false;
      const p=pointAt(e.d,e.path);
      return (st.globalRange||Math.hypot(p.x-tower.x,p.y-tower.y)<=st.range)&&hasLineOfSight(tower,p);
    }).sort((a,b)=>b.d-a.d);
    const boss=valid.find(e=>e.kind==='boss');
    return boss?[boss]:valid.filter(e=>e.kind!=='boss').slice(0,st.rootCount||3);
  }

  function chainTargetsFrom(first,tower,st){
    const result=[first],used=new Set([first.id]);
    let current=first;
    while(result.length<(st.chainTargets||1)){
      const cp=pointAt(current.d,current.path);
      let next=null,best=Infinity;
      for(const e of state.enemies){
        if(e.dead||used.has(e.id)||!canTowerTarget(tower,e,st))continue;
        const ep=pointAt(e.d,e.path),dist=Math.hypot(ep.x-cp.x,ep.y-cp.y);
        if(dist<=st.chainRadius&&dist<best){next=e;best=dist;}
      }
      if(!next)break;
      result.push(next);used.add(next.id);current=next;
    }
    return result;
  }

  function isSpecialEnemy(enemy){
    return !!(enemy&&(enemy.elite||enemy.camo||enemy.armored||['fast','regen','heavyArmored','camoArmored','healer','trickster','jester','angel','demon'].includes(enemy.kind)));
  }

  function applySlow(enemy,duration,factor){
    if(!enemy||enemy.dead||!duration)return;
    const wasFresh=(enemy.slowTimer||0)<=0;
    const f=factor||.55;
    enemy.slowFactor=(enemy.slowTimer||0)>0?Math.min(enemy.slowFactor??1,f):f;
    enemy.slowTimer=Math.max(enemy.slowTimer||0,duration);
    // Só mostra o ❄️ quando o lentidão começa do zero (não a cada tick de refresh),
    // pra dar feedback claro de "isso congelou" sem poluir a tela em áreas com Gelinho.
    if(wasFresh){const p=pointAt(enemy.d,enemy.path);spawnFloatText(p.x,p.y-r0(enemy)-8,'❄️',enemy.slowFactor<=.4?'#bdeaff':'#eaf8ff');}
  }
  function r0(enemy){return enemy.kind==='boss'?32:14+Math.min(8,Math.log2(Math.max(2,(enemy.maxHp||1)+1))*1.7)+(enemy.elite?2:0);}

  function applyTargetMark(enemy,source){
    if(!enemy||enemy.dead||!source)return;
    const hunter=source.markBonus||0,observer=source.observerMark||0;
    const bonus=Math.max(hunter,observer);
    if(bonus<=0)return;
    const duration=hunter>=observer?(source.markDuration||6):(source.observerMarkDuration||5);
    const previous=enemy.markBonus||0,previousTimer=enemy.markTimer||0;
    enemy.markBonus=Math.max(previous,bonus);
    enemy.markTimer=Math.max(previousTimer,duration);
    const markTower=Number.isFinite(source.sourceTowerId)?state.towers.find(t=>t.id===source.sourceTowerId):null;
    if(markTower?.type==='sniper')enemy.sniperMarkTimer=Math.max(enemy.sniperMarkTimer||0,duration);
    if(bonus>previous+.001||previousTimer<.35){
      const p=pointAt(enemy.d,enemy.path);
      spawnFloatText(p.x,p.y-28,`🎯 MARCADO +${Math.round(enemy.markBonus*100)}%`,'#c8b2ff');
    }
  }

  function sniperPierceTargets(first,tower,st){
    const max=Math.max(1,st.pierceTargets||1);
    if(max<=1)return[first];
    const span=190;
    const extras=state.enemies.filter(e=>{
      if(e.dead||e.id===first.id||!canTowerTarget(tower,e,st))return false;
      if(Math.abs(e.d-first.d)>span)return false;
      const p=pointAt(e.d,e.path);
      return hasLineOfSight(tower,p);
    }).sort((a,b)=>b.d-a.d).slice(0,max-1);
    return[first,...extras];
  }

  function strongestEnemy(){
    return state.enemies.filter(e=>!e.dead).sort((a,b)=>{
      const av=(a.hp||0)+(a.armored?(a.innerHp||0):0),bv=(b.hp||0)+(b.armored?(b.innerHp||0):0);
      if(b.kind==='boss'&&a.kind!=='boss')return 1;
      if(a.kind==='boss'&&b.kind!=='boss')return-1;
      return bv-av||b.d-a.d;
    })[0]||null;
  }

  function launchObserverPlane(t,st){
    const target=strongestEnemy();if(!target)return false;
    const p=pointAt(target.d,target.path);
    state.airstrikes.push({x:-72,y:54+((t.id*23)%70),speed:430,targetId:target.id,targetX:p.x,targetY:p.y,dropped:false,towerId:t.id,sourceStats:{...st,breaksArmor:true,detectsCamo:true,markBonus:0,observerMark:0}});
    t.planeTimer=0;t.planeLastWave=state.wave;
    spawnFloatText(t.x,t.y-32,'✈ COMANDO AÉREO','#70caea');
    setMsg(`✈ ${st.name}: avião enviado contra o inimigo mais forte da rodada.`);
    return true;
  }

  function updateAirstrikes(dt){
    state.airstrikes.forEach(plane=>{
      plane.x+=plane.speed*dt;
      let target=state.enemies.find(e=>e.id===plane.targetId&&!e.dead);
      if(!target&&!plane.dropped){
        target=strongestEnemy();
        if(target)plane.targetId=target.id;
      }
      if(target){const p=pointAt(target.d,target.path);plane.targetX=p.x;plane.targetY=p.y;}
      if(!plane.dropped&&plane.x>=plane.targetX-8){
        plane.dropped=true;
        state.bombs.push({x:plane.targetX,y:plane.y+10,targetId:plane.targetId,targetX:plane.targetX,targetY:plane.targetY,speed:520,sourceStats:plane.sourceStats,hit:false});
      }
    });
    state.airstrikes=state.airstrikes.filter(p=>p.x<W+90);

    state.bombs.forEach(b=>{
      let target=state.enemies.find(e=>e.id===b.targetId&&!e.dead);
      if(!target){
        target=strongestEnemy();
        if(target)b.targetId=target.id;
      }
      if(target){const p=pointAt(target.d,target.path);b.targetX=p.x;b.targetY=p.y;}
      const dx=b.targetX-b.x,dy=b.targetY-b.y,dist=Math.hypot(dx,dy),step=b.speed*dt;
      if(dist<=step||dist<9){
        b.hit=true;
        const targetNow=state.enemies.find(e=>e.id===b.targetId&&!e.dead);
        if(targetNow){
          const p=pointAt(targetNow.d,targetNow.path);
          const durability=(targetNow.maxHp||targetNow.hp||1)+(targetNow.armored?(targetNow.innerHp||0):0);
          const direct=Math.max(80,Math.min(320,durability*.10));
          const hit=damageEnemy(targetNow,direct,b.sourceStats);
          if(hit){
            spawnFloatText(p.x,p.y-34,`💣 -${Math.round(direct)}`,'#ffd36b');
            state.pulses.push({x:p.x,y:p.y,range:82,life:.48,maxLife:.48,color:'#ffb347'});
            state.enemies.forEach(e=>{
              if(e.dead||e.id===targetNow.id)return;
              const ep=pointAt(e.d,e.path);
              if(Math.hypot(ep.x-p.x,ep.y-p.y)<=82)damageEnemy(e,direct*.45,b.sourceStats);
            });
          }
        }else{
          state.pulses.push({x:b.targetX,y:b.targetY,range:70,life:.4,maxLife:.4,color:'#ffb347'});
        }
      }else if(dist>0){b.x+=dx/dist*step;b.y+=dy/dist*step;}
    });
    state.bombs=state.bombs.filter(b=>!b.hit);
  }

  function breakArmor(enemy){
    const armorReward=enemy.armorReward||0;
    enemy.kind='normal';enemy.armored=false;enemy.camo=false;enemy.armorHp=0;
    enemy.hp=enemy.innerHp;enemy.maxHp=enemy.innerHp;enemy.color=enemy.innerColor||'#ff7180';
    enemy.justUnarmored=performance.now()/1000+.55;
    sfx('armorbreak');
    if(armorReward>0){
      state.money+=armorReward;
      const p=pointAt(enemy.d,enemy.path);
      spawnFloatText(p.x,p.y-14,`+$${armorReward}`,'#9fe0ff');
    }
  }

  function popEnemyWithoutReward(enemy,label=''){
    if(!enemy||enemy.dead)return;
    enemy.dead=true;
    const p=pointAt(enemy.d,enemy.path);
    if(label)spawnFloatText(p.x,p.y-18,label,'#ffd6a0');
  }

  function stripOneLayer(enemy,label='-1 camada'){
    if(!enemy||enemy.dead||enemy.kind==='boss'||enemy.armored)return 0;
    const stolen=Math.min(1,Math.max(0,enemy.hp||0));
    if(stolen<=0)return 0;
    enemy.hp-=stolen;
    const p=pointAt(enemy.d,enemy.path);spawnFloatText(p.x,p.y-16,label,'#ffbd7a');
    if(enemy.hp<=0)popEnemyWithoutReward(enemy,'💨 camada perdida');
    return stolen;
  }

  function updateSpecialEnemies(dt){
    for(const e of state.enemies){
      if(e.dead||!SPECIAL_ENEMY_INFO[e.kind])continue;
      e.specialTimer=(e.specialTimer??1)-dt;
      if(e.specialTimer>0)continue;
      const ep=pointAt(e.d,e.path);
      if(e.kind==='healer'){
        e.specialTimer+=1;
        let healed=0;
        for(const other of state.enemies){
          if(other.dead||other===e||other.kind==='boss'||other.armored||other.hp>=other.maxHp)continue;
          const op=pointAt(other.d,other.path);if(Math.hypot(op.x-ep.x,op.y-ep.y)>(e.healRadius||76))continue;
          const before=other.hp;other.hp=Math.min(other.maxHp,other.hp+1);if(other.hp>before)healed++;
        }
        if(healed){state.pulses.push({x:ep.x,y:ep.y,range:e.healRadius||76,life:.34,maxLife:.34,color:'#62d887'});spawnFloatText(ep.x,ep.y-28,`❤️ +1 camada ×${healed}`,'#8dffad');}
      }else if(e.kind==='trickster'){
        e.specialTimer+=7;
        const target=state.enemies.filter(o=>!o.dead&&o!==e&&o.kind!=='boss'&&!o.armored&&o.path===e.path&&o.d>e.d).sort((a,b)=>a.d-b.d)[0];
        if(target&&target.d-e.d<150){
          stripOneLayer(target,'🤡 BONK! -1');
          let stunned=0;
          for(const t of state.towers){const def=types[t.type];if(def?.farm)continue;if(Math.hypot(t.x-ep.x,t.y-ep.y)<=(e.stunRadius||108)){t.stunTimer=Math.max(t.stunTimer||0,1.2);stunned++;}}
          if(state.hero&&Math.hypot(state.hero.x-ep.x,state.hero.y-ep.y)<=(e.stunRadius||108)){state.hero.stunTimer=Math.max(state.hero.stunTimer||0,1.2);stunned++;}
          state.pulses.push({x:ep.x,y:ep.y,range:e.stunRadius||108,life:.32,maxLife:.32,color:'#ff9f5d'});
          if(stunned)spawnFloatText(ep.x,ep.y-34,`😵 STUN ×${stunned}`,'#ffd09a');
        }
      }else if(e.kind==='angel'){
        e.specialTimer+=6;
        const candidates=state.enemies.filter(o=>!o.dead&&o!==e&&o.kind!=='angel'&&(o.divineShield||0)<=0);
        let target=null,best=Infinity;
        for(const o of candidates){const op=pointAt(o.d,o.path),dist=Math.hypot(op.x-ep.x,op.y-ep.y);if(dist<=(e.shieldRadius||88)&&dist<best){best=dist;target=o;}}
        if(target){target.divineShield=1;target.angelSlowFactor=.82;const tp=pointAt(target.d,target.path);state.pulses.push({x:tp.x,y:tp.y,range:34,life:.5,maxLife:.5,color:'#f4efc7'});spawnFloatText(tp.x,tp.y-28,'🛡 ESCUDO DIVINO','#fff2a8');}
      }else if(e.kind==='demon'){
        e.specialTimer+=2.5;
        const donors=[];
        for(const o of state.enemies){if(o.dead||o===e||o.kind==='boss'||o.kind==='demon'||o.armored)continue;const op=pointAt(o.d,o.path);if(Math.hypot(op.x-ep.x,op.y-ep.y)<=(e.drainRadius||78))donors.push(o);}
        donors.sort((a,b)=>Math.abs(a.d-e.d)-Math.abs(b.d-e.d));
        let gained=0;
        for(const donor of donors.slice(0,2)){if(e.maxHp>=e.demonMaxHp-.001)break;const stolen=stripOneLayer(donor,'😈 -1 camada');if(stolen>0){const add=Math.min(stolen,e.demonMaxHp-e.maxHp);e.maxHp+=add;e.hp+=add;gained+=add;}}
        if(gained>0){state.pulses.push({x:ep.x,y:ep.y,range:e.drainRadius||78,life:.4,maxLife:.4,color:'#a94455'});spawnFloatText(ep.x,ep.y-30,`😈 +${Number(gained.toFixed(1))} VIDA MÁX`,'#ff8b8f');}
      }
    }
  }

  function applyDemonFear(t,st,global=false){
    const radius=global?Math.max(W,H)*2:(st.fearRadius||158),duration=global?8:(st.fearDuration||5),back=global?95:(st.fearBack||52),vuln=global?.25:(st.fearVuln||.15);
    let affected=0;
    for(const enemy of state.enemies){
      if(enemy.dead)continue;
      const p=pointAt(enemy.d,enemy.path);
      if(!global&&Math.hypot(p.x-t.x,p.y-t.y)>radius)continue;
      const retreat=enemy.kind==='boss'?back*.28:back;
      enemy.d=Math.max(0,enemy.d-retreat);
      enemy.fearTimer=Math.max(enemy.fearTimer||0,duration);
      enemy.fearBonus=Math.max(enemy.fearBonus||0,vuln);
      enemy.fearSource={...st,sourceTowerId:t.id,sourceType:'demonking'};
      affected++;
      spawnFloatText(p.x,p.y-30,enemy.kind==='boss'?'😨 MEDO':'😨 MEDO','#d48cff');
    }
    if(affected){
      state.pulses.push({x:t.x,y:t.y,range:radius,life:.75,maxLife:.75,color:'#a64dff'});
      recordMastery('demonking','actions',affected);
    }
    return affected;
  }

  function summonShadowBalloon(enemy,source){
    const cap=Math.max(1,source?.shadowCap||8);
    if(state.shadowBloons.length>=cap)return;
    const isBoss=enemy.kind==='boss',baseCount=Math.max(1,source?.shadowSpawnCount||1),count=isBoss?Math.min(Math.max(3,baseCount+2),cap-state.shadowBloons.length):Math.min(baseCount,cap-state.shadowBloons.length);
    for(let i=0;i<count;i++){
      const baseHp=Math.max(1,enemy.maxHp||enemy.hp||1);
      state.shadowBloons.push({
        path:enemy.path||0,d:Math.max(0,pathTotal(enemy.path)-4-i*12),
        hp:isBoss?6:Math.max(2,Math.min(6,2+Math.floor(baseHp/3))),
        damage:(isBoss?8.5:Math.max(2,Math.min(8,1.6+baseHp*.34)))*(source?.shadowDamageMult||1),
        speed:isBoss?105:92,cool:0,life:18,source:{...(source||types.demonking),sourceType:'demonking',isShadowSummon:true}
      });
    }
    const p=pointAt(pathTotal(enemy.path),enemy.path);spawnFloatText(p.x,p.y-26,isBoss?`🌑 ×${count} SOMBRAS`:(count>1?`🌑 ×${count} SOMBRAS`:'🌑 SOMBRA INVOCADA'),'#d48cff');
  }

  function updateShadowBloons(dt){
    for(const s of state.shadowBloons){
      s.life-=dt;s.cool=Math.max(0,(s.cool||0)-dt);s.d=Math.max(0,s.d-s.speed*dt);
      if(s.cool>0||s.hp<=0)continue;
      let target=null,best=Infinity;
      for(const e of state.enemies){
        if(e.dead||(e.path||0)!==(s.path||0))continue;
        const gap=Math.abs(e.d-s.d);if(gap<=34&&gap<best){best=gap;target=e;}
      }
      if(target){
        const hit=damageEnemy(target,s.damage,s.source);s.cool=.5;
        if(hit){s.hp-=1;const p=pointAt(s.d,s.path);state.pulses.push({x:p.x,y:p.y,range:26,life:.24,maxLife:.24,color:'#7c39b8'});}
      }
    }
    state.shadowBloons=state.shadowBloons.filter(s=>s.life>0&&s.hp>0&&s.d>0);
  }

  function drawShadowBloons(){
    const now=performance.now()/1000;
    for(const s of state.shadowBloons){
      const p=pointAt(s.d,s.path),pulse=.85+.12*Math.sin(now*5+s.d*.02);
      ctx.save();ctx.translate(p.x,p.y);ctx.globalAlpha=.92;
      ctx.shadowColor='#a64dff';ctx.shadowBlur=12;
      ctx.fillStyle='#17131f';ctx.beginPath();ctx.ellipse(0,0,13*pulse,16*pulse,0,0,Math.PI*2);ctx.fill();
      ctx.shadowBlur=0;ctx.fillStyle='#d45cff';ctx.beginPath();ctx.ellipse(-4,-2,2.3,1.7,-.2,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(4,-2,2.3,1.7,.2,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle='#7e3ab8';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(0,15);ctx.quadraticCurveTo(-5,22,2,26);ctx.stroke();
      ctx.restore();
    }
  }

  function damageEnemy(enemy,amount,sourceRef){
    if(!enemy||enemy.dead)return false;
    const source=typeof sourceRef==='string'?types[sourceRef]:(sourceRef||{});
    if(enemy.camo&&!enemy.revealed&&!source.detectsCamo)return false;

    let dealt=Math.max(0,Number(amount)||0);
    if(enemy.kind==='boss'&&source.hunterBossBonus)dealt*=1+source.hunterBossBonus;
    else if(isSpecialEnemy(enemy)&&source.hunterSpecialBonus)dealt*=1+source.hunterSpecialBonus;
    if((enemy.markTimer||0)>0&&(enemy.markBonus||0)>0)dealt*=1+enemy.markBonus;
    if((enemy.fearTimer||0)>0&&(enemy.fearBonus||0)>0)dealt*=1+enemy.fearBonus;

    if((enemy.divineShield||0)>0){
      enemy.divineShield=0;enemy.angelSlowFactor=1;
      const p=pointAt(enemy.d,enemy.path);spawnFloatText(p.x,p.y-28,'🛡 BLOQUEADO','#fff1a6');
      state.pulses.push({x:p.x,y:p.y,range:34,life:.34,maxLife:.34,color:'#f4efc7'});
      return false;
    }
    if(enemy.kind==='jester'&&dealt>0){
      const cap=enemy.moneyPenaltyCap||500,penalty=Math.min(cap,Math.max(1,Math.ceil(dealt))),lost=Math.min(state.money,penalty);
      state.money=Math.max(0,state.money-lost);
      const p=pointAt(enemy.d,enemy.path);spawnFloatText(p.x,p.y-32,`🃏 -$${lost}`,'#ff8fbf');
      if(penalty>=cap)spawnFloatText(p.x,p.y-46,'LIMITE $500','#ffd0e4');
    }

    const sourceTower=Number.isFinite(source.sourceTowerId)?state.towers.find(t=>t.id===source.sourceTowerId):null;
    const sourceHero=source.isHeroSource?state.hero:null;
    if(enemy.armored){
      if(!source.breaksArmor)return false;
      const beforeArmor=Math.max(0,enemy.armorHp||0),actual=Math.min(beforeArmor,dealt);
      enemy.armorHp-=dealt;enemy.hp=Math.max(0,enemy.armorHp);
      spawnDamageNumber(enemy,actual,{crit:source.critical});
      spawnImpactFx(enemy,actual,source);
      if(sourceTower){sourceTower.damageDealt=(sourceTower.damageDealt||0)+actual;recordMastery(sourceTower.type,'damage',actual);}
      if(sourceHero)sourceHero.damageDealt=(sourceHero.damageDealt||0)+actual;
      if(source.sourceType==='burst'&&synergyActive('improvisedArtillery'))enemy.powderTimer=Math.max(enemy.powderTimer||0,4);
      if(enemy.armorHp<=0){breakArmor(enemy);setMsg('💥 Blindagem quebrada: saiu um balão normal de dentro!');}
      return true;
    }
    if(enemy.kind==='regen'||enemy.kind==='boss')enemy.regenPause=1.6;
    const beforeHp=Math.max(0,enemy.hp||0),actual=Math.min(beforeHp,dealt);
    enemy.hp-=dealt;
    spawnDamageNumber(enemy,actual,{crit:source.critical});
    spawnImpactFx(enemy,actual,source);
    if(sourceTower){sourceTower.damageDealt=(sourceTower.damageDealt||0)+actual;recordMastery(sourceTower.type,'damage',actual);}
    if(sourceHero)sourceHero.damageDealt=(sourceHero.damageDealt||0)+actual;
    if(source.sourceType==='burst'&&synergyActive('improvisedArtillery'))enemy.powderTimer=Math.max(enemy.powderTimer||0,4);
    if(enemy.hp<=0&&!enemy.dead){
      const feared=(enemy.fearTimer||0)>0,fearSource=enemy.fearSource;
      enemy.dead=true;
      if(sourceTower){sourceTower.pops=(sourceTower.pops||0)+1;recordMastery(sourceTower.type,'pops',1);}
      if(sourceHero){sourceHero.pops=(sourceHero.pops||0)+1;grantHeroXp(enemy.kind==='boss'?75:(enemy.elite?5:2));}
      const p=pointAt(enemy.d,enemy.path);
      if(feared&&!source.isShadowSummon&&fearSource)summonShadowBalloon(enemy,fearSource);
      if(enemy.kind==='boss'){
        sfx('boss');
        playMusicTheme(state.map);
        state.money+=enemy.reward;
        const bonusCoins=Math.round(20*currentDifficulty().coinMultiplier);
        profile.coins+=bonusCoins;saveProfile();
        spawnFloatText(p.x,p.y-18,`👑 +$${enemy.reward} • +🪙${bonusCoins}`,'#ffd36b');
        setMsg(`👑 Você derrotou ${enemy.name}! +$${enemy.reward} na partida e +🪙${bonusCoins} moedas permanentes.`);
      }else{
        sfx('pop');
        state.money+=enemy.reward;
        spawnFloatText(p.x,p.y-14,`+$${enemy.reward}`,enemy.elite?'#ffd36b':'#ffe89a');
      }
    }
    return true;
  }

  function applyBurn(enemy,burn,source){
    if(!enemy||enemy.dead||!burn)return;
    enemy.burn={damage:burn.damage||1,interval:burn.interval||2,ticks:burn.ticks||4,timer:burn.interval||2,source};
    const p=pointAt(enemy.d,enemy.path);spawnFloatText(p.x,p.y-24,'🔥 queimando','#ff9b63');
  }

  function processFarmIncome(){
    const awards=[];
    while(state.lastFarmPaidWave<state.wave){
      const next=state.lastFarmPaidWave+1;
      const stillExists=state.enemies.some(e=>!e.dead&&e.round===next)||state.spawn.some(e=>e.round===next);
      if(stillExists)break;
      state.lastFarmPaidWave=next;
      if(state.hero)grantHeroXp(38+next*4);
      const farms=state.towers.filter(t=>types[t.type]?.farm);
      let cash=0;
      const merchantBoost=state.hero?.type==='merchant'&&(state.hero.farmBoostWaves||0)>0;
      for(const farm of farms){
        let income=towerStats(farm).farmIncome||0;
        if(merchantBoost)income=Math.round(income*2);
        cash+=income;
        farm.incomeGenerated=(farm.incomeGenerated||0)+income;recordMastery(farm.type,'income',income);
        spawnFloatText(farm.x,farm.y-28,`🎣 +$${income}`,'#ffcf8a');
      }
      if(state.hero?.type==='merchant'){
        const hIncome=heroStats(state.hero).farmIncome||0;cash+=hIncome;
        spawnFloatText(state.hero.x,state.hero.y-30,`💰 +$${hIncome}`,HEROES.merchant.color);
        if(merchantBoost)state.hero.farmBoostWaves=Math.max(0,(state.hero.farmBoostWaves||0)-1);
      }
      if(cash>0&&synergyActive('fishMarket')&&next%5===0){
        const festival=Math.max(1,Math.round(cash*.35));cash+=festival;
        const fx=state.hero||farms[0];if(fx)spawnFloatText(fx.x,fx.y-52,`🎣💰 FESTIVAL +$${festival}`,'#ffe0a1');
        setMsg(`🎣💰 Mercado de Peixes: Festival do Salmão! +$${festival} de renda extra na rodada ${next}.`);
      }
      if(cash>0){state.money+=cash;awards.push({wave:next,cash});}
    }
    return awards;
  }

  function settleCalledWaves(){
    if(state.pendingClearCash<=0&&state.pendingWaveXp<=0)return{levels:[],xp:0,cash:0};
    const cash=state.pendingClearCash,xp=state.pendingWaveXp;
    state.pendingClearCash=0;state.pendingWaveXp=0;
    state.money+=cash;
    const levels=grantXp(xp);
    saveProfile();
    return{levels,xp,cash};
  }

  function processClearedRounds(){
    if(!isInfinite())return[];
    const awards=[];
    let advanced=false;
    while(state.lastClearedWave<state.wave){
      const next=state.lastClearedWave+1;
      const stillExists=state.enemies.some(e=>!e.dead&&e.round===next)||state.spawn.some(e=>e.round===next);
      if(stillExists)break;
      state.lastClearedWave=next;advanced=true;
      if(profile.infiniteBest[state.map][state.difficulty]<next)profile.infiniteBest[state.map][state.difficulty]=next;
      if(next%10===0&&!state.paidMilestones.has(next)){
        const coins=infiniteMilestoneReward(next);
        state.paidMilestones.add(next);profile.coins+=coins;awards.push({wave:next,coins});
        sfx('win');setMsg(`🪙 Marco do Infinito! Rodada ${next} concluída: +${coins} moedas permanentes. Próximo prêmio na rodada ${next+10}.`);
      }
    }
    if(advanced)saveProfile();
    return awards;
  }

  function completeMap(){
    if(state.rewardGranted)return;
    state.rewardGranted=true;state.completed=true;state.waveActive=false;
    const map=currentMap(),diff=currentDifficulty(),data=profile.maps[state.map];
    const newStar=!data.cleared[state.difficulty];
    data.cleared[state.difficulty]=true;data.wins=(data.wins||0)+1;
    const coinReward=Math.round(map.clearCoins*diff.coinMultiplier)+(newStar?35:0);
    const xpReward=diff.clearXp;
    profile.coins+=coinReward;
    const levels=grantXp(xpReward);
    const secretUnlocks=discoverSecretUnlocks();
    saveProfile();
    const levelText=levels.length?` • 🎖️ Subiu para o nível ${profile.level}!`:'';
    setMsg(`🏆 ${map.name} • ${diff.name} concluído! ${newStar?'⭐ Nova estrela! ':''}+🪙 ${coinReward} • +${xpReward} XP${levelText}`);
    updateStats();
    showResult(true,{coins:coinReward,xp:xpReward});
    if(secretUnlocks.length)setTimeout(()=>queueSecretReveals(secretUnlocks),450);
  }

  function update(dt,now){
    updateParticles(dt);
    if(state.paused||state.lives<=0||state.completed)return;

    for(const id of['frenzy','focus','blizzard'])state.effects[id]=Math.max(0,state.effects[id]-dt);
    state.powerUiClock+=dt;
    if(state.powerUiClock>=.12){state.powerUiClock=0;renderHotbar();renderEffects();if(state.selectedTower)updateUpgradePanel();}

    state.spawn.forEach(s=>s.at-=dt);
    const ready=state.spawn.filter(s=>s.at<=0);
    state.spawn=state.spawn.filter(s=>s.at>0);
    ready.forEach(s=>state.enemies.push({...s,id:state.nextEnemyId++}));

    updateCamoReveals();

    const globalSlow=effectActive('blizzard')?.35:1;
    state.enemies.forEach(e=>{
      e.slowTimer=Math.max(0,(e.slowTimer||0)-dt);
      if(e.slowTimer<=0)e.slowFactor=1;
      e.rootTimer=Math.max(0,(e.rootTimer||0)-dt);
      e.markTimer=Math.max(0,(e.markTimer||0)-dt);
      if(e.markTimer<=0)e.markBonus=0;
      e.sniperMarkTimer=Math.max(0,(e.sniperMarkTimer||0)-dt);
      e.fearTimer=Math.max(0,(e.fearTimer||0)-dt);
      if(e.fearTimer<=0){e.fearBonus=0;e.fearSource=null;}
      e.powderTimer=Math.max(0,(e.powderTimer||0)-dt);
      e.frozenCircuitCd=Math.max(0,(e.frozenCircuitCd||0)-dt);
      e.arcaneBloomCd=Math.max(0,(e.arcaneBloomCd||0)-dt);
      e.alchemyStageTimer=Math.max(0,(e.alchemyStageTimer||0)-dt);
      if(e.alchemyStageTimer<=0&&e.alchemyStage){e.alchemyStage=0;e.plasmaCatalystHits=0;}
      if(e.burn&&e.burn.ticks>0&&!e.dead){
        e.burn.timer-=dt;
        while(e.burn&&e.burn.timer<=0&&e.burn.ticks>0&&!e.dead){
          e.burn.timer+=e.burn.interval;e.burn.ticks--;
          damageEnemy(e,e.burn.damage,e.burn.source);
          if(!e.dead){const bp=pointAt(e.d,e.path);spawnFloatText(bp.x,bp.y-20,'🔥 -1','#ff8b63');}
        }
        if(e.burn&&e.burn.ticks<=0)e.burn=null;
      }
      if(e.temporalMark&&!e.dead){
        e.temporalMark.timer-=dt;
        if(e.temporalMark.timer<=0){
          const from=Math.max(0,e.temporalMark.snapshotD||0),before=e.d;
          e.d=e.kind==='boss'?Math.max(0,before-(before-from)*.5):Math.min(before,from);
          const tp=pointAt(e.d,e.path);spawnFloatText(tp.x,tp.y-25,'⏳ REWIND','#9de7ff');
          if((e.temporalArcaneDamage||0)>0){
            const blast=Math.min(e.temporalArcaneDamage,Math.max(4,(e.maxHp||20)*.28)),src=e.temporalArcaneSource||{detectsCamo:true,breaksArmor:true};
            state.enemies.forEach(other=>{if(other.dead)return;const op=pointAt(other.d,other.path);if(Math.hypot(op.x-tp.x,op.y-tp.y)<=72)damageEnemy(other,blast,src);});
            state.pulses.push({x:tp.x,y:tp.y,range:72,life:.45,maxLife:.45,color:'#c9adff'});
            spawnFloatText(tp.x,tp.y-42,'✨ PARADOXO!','#e5d6ff');
            e.temporalArcaneDamage=0;e.temporalArcaneSource=null;e.temporalArcaneCharges=0;
          }
          e.temporalMark=null;
        }
      }
      const angelSlow=(e.divineShield||0)>0?(e.angelSlowFactor||.82):1;
      if(e.rootTimer<=0)e.d+=e.speed*(e.slowTimer>0?(e.slowFactor||.55):1)*globalSlow*angelSlow*dt;
      if((e.kind==='regen'||e.kind==='boss')&&!e.armored){
        e.regenPause=Math.max(0,(e.regenPause||0)-dt);
        if(e.regenPause<=0&&e.hp<e.maxHp)e.hp=Math.min(e.maxHp,e.hp+e.maxHp*.045*dt);
      }
    });
    updateSpecialEnemies(dt);
    updateShadowBloons(dt);
    state.enemies=state.enemies.filter(e=>{
      if(e.dead)return false;
      if(e.d>=pathTotal(e.path)){
        const p=pointAt(pathTotal(e.path),e.path);
        if(e.kind==='boss'){
          // O chefão que escapa tira TODAS as vidas restantes na hora.
          state.lives=0;
          spawnFloatText(p.x,p.y-18,'💀 Chefão escapou!','#ff5b5b');
          sfx('bossleak');
          playMusicTheme(state.map);
        }else{
          // Cada balão tira vidas conforme a cor/tier dele no momento em que escapa
          // (a mesma escala Vermelho=1..Preto=6 usada na cor do balão em jogo).
          const lost=tierIndex(e.hp)+1;
          state.lives=Math.max(0,state.lives-lost);
          spawnFloatText(p.x,p.y-14,`💔 -${lost}`,'#ff5b5b');
          sfx('leak');
        }
        return false;
      }
      return true;
    });

    const speedBoost=effectActive('frenzy')?2:1,damageBoost=effectActive('focus')?2:1;
    state.screenShake=Math.max(0,state.screenShake-dt*18);
    state.towers.forEach(t=>{t.recoil=Math.max(0,(t.recoil||0)-dt*5.5);t.attackFlash=Math.max(0,(t.attackFlash||0)-dt*7);t.stunTimer=Math.max(0,(t.stunTimer||0)-dt);});
    if(state.hero){state.hero.recoil=Math.max(0,(state.hero.recoil||0)-dt*5.5);state.hero.attackFlash=Math.max(0,(state.hero.attackFlash||0)-dt*7);state.hero.stunTimer=Math.max(0,(state.hero.stunTimer||0)-dt);}
    state.enemies.forEach(e=>e.hitFlash=Math.max(0,(e.hitFlash||0)-dt*8));
    state.impactFx.forEach(f=>f.life-=dt);state.impactFx=state.impactFx.filter(f=>f.life>0);
    state.muzzleFx.forEach(f=>f.life-=dt);state.muzzleFx=state.muzzleFx.filter(f=>f.life>0);
    state.towers.forEach(t=>{
      t.masteryAbilityCd=Math.max(0,(t.masteryAbilityCd||0)-dt);t.masteryBuffTimer=Math.max(0,(t.masteryBuffTimer||0)-dt);
      const st=towerStats(t);
      if(st.farm)return;
      if((t.stunTimer||0)>0)return;

      {
        const facing=st.rootHold?controlTargets(t,st)[0]:(st.fullAoe?targetsInRange(t,st)[0]:targetFor(t,st));
        if(facing){
          const p=pointAt(facing.d,facing.path);
          const desired=Math.atan2(p.y-t.y,p.x-t.x);
          t.angle=stepAngleTowards(t.angle||0,desired,TOWER_TURN_RATE*dt);
        }
      }

      if(t.type==='demonking'&&state.waveActive){
        t.fearCooldown=(Number.isFinite(t.fearCooldown)?t.fearCooldown:1.4)-dt;
        if(t.fearCooldown<=0){applyDemonFear(t,st,false);t.fearCooldown=st.fearInterval||11;}
      }

      if(t.type==='sniper'&&st.airstrike&&state.waveActive){
        if(!Number.isFinite(t.planeTimer))t.planeTimer=0;
        if(!Number.isFinite(t.planeLastWave))t.planeLastWave=state.wave;
        t.planeTimer+=dt;
        const waveDue=state.wave-t.planeLastWave>=2,timeDue=t.planeTimer>=25;
        if((waveDue||timeDue)&&state.enemies.some(e=>!e.dead))launchObserverPlane(t,st);
      }

      t.cool-=dt*(st.rootHold?1:speedBoost);
      if(t.cool>0)return;

      if(st.rootHold){
        const targets=controlTargets(t,st);
        if(!targets.length)return;
        t.cool=st.rate;triggerAttackFx(t,st,'vine');
        for(const enemy of targets){
          enemy.rootTimer=Math.max(enemy.rootTimer||0,st.rootDuration||2);recordMastery(t.type,'actions',1);if(st.damage>0)damageEnemy(enemy,st.damage*damageBoost,st);
          if(st.burn)applyBurn(enemy,st.burn,st);
          if(st.markBonus)applyTargetMark(enemy,st);
          const ep=pointAt(enemy.d,enemy.path);
          state.pulses.push({x:ep.x,y:ep.y,range:enemy.kind==='boss'?42:28,life:.42,maxLife:.42,color:st.color});
          spawnFloatText(ep.x,ep.y-24,enemy.kind==='boss'?'🌿 BOSS preso':'🌿 preso',st.color);
        }
        return;
      }

      if(st.chainTargets&&t.type==='electric'){
        const first=targetFor(t,st);if(!first)return;
        t.cool=st.rate;triggerAttackFx(t,st,'electric');
        const chain=chainTargetsFrom(first,t,st),points=[{x:t.x,y:t.y}];
        chain.forEach((enemy,i)=>{
          const ep=pointAt(enemy.d,enemy.path);points.push(ep);
          const falloff=[1,.78,.60,.46,.36,.30][i]||.26,hitDamage=st.damage*damageBoost*falloff;
          const chilled=(enemy.slowTimer||0)>0;
          const hit=damageEnemy(enemy,hitDamage,st);
          if(hit){
            if(st.markBonus)applyTargetMark(enemy,st);
            if(hit&&st.slow&&!enemy.armored)applySlow(enemy,st.slow,st.slowFactor);
            if(chilled&&synergyActive('frozenCircuit')&&(enemy.frozenCircuitCd||0)<=0){
              enemy.frozenCircuitCd=.8;
              state.enemies.forEach(other=>{if(other.dead||other===enemy)return;const op=pointAt(other.d,other.path);if(Math.hypot(op.x-ep.x,op.y-ep.y)<=56)damageEnemy(other,hitDamage*.30,st);});
              state.pulses.push({x:ep.x,y:ep.y,range:56,life:.28,maxLife:.28,color:'#aeeaff'});
              spawnFloatText(ep.x,ep.y-34,'❄️⚡','#c9f3ff');
            }
          }
        });
        state.lightning.push({points,life:.20,maxLife:.20,color:st.color,kind:'electric'});
        return;
      }

      if(st.chainTargets&&t.type==='dart'&&st.weapon==='bow'){
        const bowMode=TARGET_PRIORITIES.includes(t.priority)?t.priority:'first';
        const valid=targetsInRange(t,st).sort((a,b)=>targetPriorityScore(b,bowMode)-targetPriorityScore(a,bowMode));if(!valid.length)return;
        t.cool=st.rate;triggerAttackFx(t,st,'bow');
        const shots=Math.max(1,st.multiShot||1);
        for(let i=0;i<shots;i++){
          const target=valid[i]||valid[0],p=pointAt(target.d,target.path);
          state.shots.push({x:t.x+(i?4:-4),y:t.y,tx:p.x,ty:p.y,target:target.id,type:'arrow',sourceType:t.type,sourceStats:st,towerId:t.id,
            speed:720,damage:st.damage*damageBoost,slow:0,splash:0,color:st.color,level:Math.max(...dartPaths(t)),chainTargets:st.chainTargets,chainRadius:st.chainRadius});
        }
        return;
      }

      if(st.fullAoe){
        const targets=targetsInRange(t,st);
        if(!targets.length)return;
        t.cool=st.rate;triggerAttackFx(t,st,'frost');
        for(const enemy of targets){
          const wasSlowed=(enemy.slowTimer||0)>0;
          const dmg=st.damage*damageBoost*(wasSlowed&&st.frostVulnBonus?1+st.frostVulnBonus:1);
          const hit=damageEnemy(enemy,dmg,st);if(hit)recordMastery(t.type,'actions',1);
          if(hit&&!enemy.armored&&st.slow)applySlow(enemy,st.slow,st.slowFactor);
          if(hit&&!enemy.armored&&st.deepFreezeOnSlowed&&wasSlowed)applySlow(enemy,Math.max(1,st.slow||0),.15);
          if(hit)applyTargetMark(enemy,st);
        }
        state.pulses.push({x:t.x,y:t.y,range:st.range,life:.34,maxLife:.34,color:st.color});
        return;
      }

      if(t.type==='sniper'){
        const target=targetFor(t,st);if(!target)return;
        t.cool=st.rate;triggerAttackFx(t,st,'sniper');
        const p=pointAt(target.d,target.path),critical=st.critChance>0&&Math.random()<st.critChance;
        const shotDamage=st.damage*damageBoost*(critical?st.critMultiplier:1);
        state.shots.push({x:t.x,y:t.y,tx:p.x,ty:p.y,target:target.id,type:'sniper',sourceType:t.type,sourceStats:st,towerId:t.id,
          speed:1280,damage:shotDamage,slow:0,splash:0,color:critical?'#ffd36b':st.color,level:Math.max(...sniperPaths(t)),pierceTargets:st.pierceTargets||1,critical});
        if(critical)spawnFloatText(t.x,t.y-30,'🎯 CRÍTICO!','#ffd36b');
        return;
      }

      const target=targetFor(t,st);if(!target)return;
      t.cool=st.rate;triggerAttackFx(t,st,t.type==='burst'?'burst':t.type);
      const p=pointAt(target.d,target.path);
      state.shots.push({x:t.x,y:t.y,tx:p.x,ty:p.y,target:target.id,type:t.type==='dart'?(st.weapon==='fireSpear'?'fireSpear':st.weapon==='spear'?'spear':'dart'):t.type,sourceType:t.type,sourceStats:st,towerId:t.id,speed:st.globalRange?1150:(t.type==='boomerang'?690:t.type==='chronomancer'?560:(st.weapon==='spear'||st.weapon==='fireSpear'?650:580)),damage:st.damage*damageBoost,slow:st.slow,splash:st.splash,color:st.weapon==='fireSpear'?'#ff8b63':st.color,level:t.type==='dart'?Math.max(...dartPaths(t)):t.level,burn:st.burn,chainTargets:st.chainTargets&&t.type==='laser'?st.chainTargets:0,chainRadius:st.chainRadius,boomerangTargets:st.boomerangTargets||0,returnMultiplier:st.returnMultiplier||0,alchemyPhilosopher:t.type==='alchemist'&&(t.masteryBuffTimer||0)>0});
    });

    if(state.hero){
      const h=state.hero,st=heroStats(h),def=HEROES[h.type];
      h.skillCd=Math.max(0,(h.skillCd||0)-dt);h.ultimateCd=Math.max(0,(h.ultimateCd||0)-dt);
      h.commandTimer=Math.max(0,(h.commandTimer||0)-dt);h.ultimateTimer=Math.max(0,(h.ultimateTimer||0)-dt);
      if(!st.farm&&(h.stunTimer||0)<=0){
        h.cool-=dt*speedBoost;
        if(h.cool<=0){
          const target=targetFor(h,st);
          if(target){
            h.cool=st.rate;triggerAttackFx(h,st,h.type==='warrior'?'spear':h.type);
            const p=pointAt(target.d,target.path);
            let dmg=st.damage*damageBoost;
            if(h.type==='warrior'&&target.kind!=='boss'&&!target.armored&&target.maxHp>0&&target.hp/target.maxHp<=.12)dmg*=2.5;
            const shotType=h.type==='warrior'?'spear':h.type==='luna'?'magic':'dart';
            state.shots.push({x:h.x,y:h.y,tx:p.x,ty:p.y,target:target.id,type:shotType,sourceType:'hero',sourceStats:st,towerId:null,speed:h.type==='warrior'?760:650,damage:dmg,slow:0,splash:0,color:def.color,level:h.level,heroEffect:h.type});
          }
        }
      }
    }

    state.shots.forEach(s=>{
      const target=state.enemies.find(e=>e.id===s.target);
      if(target){const p=pointAt(target.d,target.path);s.tx=p.x;s.ty=p.y;}
      const dx=s.tx-s.x,dy=s.ty-s.y,dist=Math.hypot(dx,dy),step=s.speed*dt;
      if(dist<=step){
        s.hit=true;
        if(target){
          const source=s.sourceStats||s.sourceType;
          if(s.critical&&source&&typeof source==='object')source.critical=true;
          let impactDamage=s.damage;
          if(s.sourceType==='ninja'&&synergyActive('silentHunt')&&(target.sniperMarkTimer||0)>0){
            impactDamage*=1.5;
            const np=pointAt(target.d,target.path);spawnFloatText(np.x,np.y-38,'🎯🥷 +50%','#d6b8ff');
          }
          const hit=damageEnemy(target,impactDamage,source);
          if(hit&&s.heroEffect==='luna'){applySlow(target,2.4,.72);target.markTimer=Math.max(target.markTimer||0,3.5);target.markBonus=Math.max(target.markBonus||0,.10);}
          if(hit)applyTargetMark(target,source);
          if(hit&&s.sourceType==='sniper'&&synergyActive('silentHunt')){
            const fresh=(target.sniperMarkTimer||0)<=0;target.sniperMarkTimer=Math.max(target.sniperMarkTimer||0,3.5);
            if(fresh){const sp=pointAt(target.d,target.path);spawnFloatText(sp.x,sp.y-36,'🎯 ALVO DA CAÇADA','#cdb8ff');}
          }
          if(hit&&s.burn&&!target.dead)applyBurn(target,s.burn,source);
          if(hit&&s.slow&&!target.armored)applySlow(target,s.slow,source&&source.slowFactor);
          if(hit&&s.sourceType==='dart'&&synergyActive('improvisedArtillery')&&(target.powderTimer||0)>0){
            target.powderTimer=0;const dp=pointAt(target.d,target.path);
            state.enemies.forEach(other=>{if(other.dead||other===target)return;const op=pointAt(other.d,other.path);if(Math.hypot(op.x-dp.x,op.y-dp.y)<=58)damageEnemy(other,impactDamage*.40,source);});
            state.pulses.push({x:dp.x,y:dp.y,range:58,life:.30,maxLife:.30,color:'#ffb16d'});spawnFloatText(dp.x,dp.y-34,'🐱💥 ESTILHAÇOS','#ffd19b');
          }
          if(hit&&s.sourceType==='wizard'&&synergyActive('enchantedForest')&&(target.rootTimer||0)>0&&(target.arcaneBloomCd||0)<=0){
            target.arcaneBloomCd=1.05;const wp=pointAt(target.d,target.path);
            state.enemies.forEach(other=>{if(other.dead)return;const op=pointAt(other.d,other.path);if(Math.hypot(op.x-wp.x,op.y-wp.y)<=68)damageEnemy(other,impactDamage*.55,source);});
            state.pulses.push({x:wp.x,y:wp.y,range:68,life:.36,maxLife:.36,color:'#bca8ff'});spawnFloatText(wp.x,wp.y-34,'🌿✨ FLOR ARCANA','#e1d7ff');
          }
          if(hit&&s.sourceType==='laser'&&synergyActive('plasmaCatalyst')&&(target.alchemyStage||0)>0){
            target.plasmaCatalystHits=(target.plasmaCatalystHits||0)+1;
            if(target.plasmaCatalystHits>=4){target.plasmaCatalystHits=0;const lp=pointAt(target.d,target.path),blast=Math.max(2.5,impactDamage*2.4);
              state.enemies.forEach(other=>{if(other.dead)return;const op=pointAt(other.d,other.path);if(Math.hypot(op.x-lp.x,op.y-lp.y)<=62)damageEnemy(other,blast,source);});
              target.alchemyStage=0;state.pulses.push({x:lp.x,y:lp.y,range:62,life:.33,maxLife:.33,color:'#c6ff79'});spawnFloatText(lp.x,lp.y-34,'🔴🧪 CATALISADO!','#e4ff9d');}
          }
          if(hit&&s.sourceType==='wizard'&&synergyActive('arcaneParadox')&&target.temporalMark){
            target.temporalArcaneCharges=Math.min(5,(target.temporalArcaneCharges||0)+1);
            target.temporalArcaneDamage=(target.temporalArcaneDamage||0)+impactDamage*.35;
            target.temporalArcaneSource=source;
          }
          if(hit&&s.sourceType==='boomerang'){
            const center=pointAt(target.d,target.path),near=state.enemies.filter(e=>{if(e.dead||e===target)return false;const ep=pointAt(e.d,e.path);return Math.hypot(ep.x-center.x,ep.y-center.y)<=150;}).sort((a,b)=>{const ap=pointAt(a.d,a.path),bp=pointAt(b.d,b.path);return Math.hypot(ap.x-center.x,ap.y-center.y)-Math.hypot(bp.x-center.x,bp.y-center.y);}).slice(0,Math.max(0,(s.boomerangTargets||3)-1));
            const hitList=[target,...near];near.forEach(e=>damageEnemy(e,s.damage*.82,source));hitList.forEach(e=>{if(e.dead)return;const chilled=(e.slowTimer||0)>0&&synergyActive('glacialReturn'),mult=(s.returnMultiplier||.58)*(chilled?1.35:1);damageEnemy(e,s.damage*mult,source);if(chilled&&!e.armored)applySlow(e,1.2,.38);});
            if(hitList.some(e=>(e.slowTimer||0)>0)&&synergyActive('glacialReturn')){const bp=pointAt(target.d,target.path);spawnFloatText(bp.x,bp.y-40,'🪃❄️ RETORNO GLACIAL','#c7f1ff');}
            const pts=[{x:s.x,y:s.y},...hitList.map(e=>pointAt(e.d,e.path)),{x:s.x,y:s.y}];state.lightning.push({points:pts,life:.22,maxLife:.22,color:'#f3c168',kind:'boomerang'});
          }
          if(hit&&s.sourceType==='alchemist'){
            const full=s.alchemyPhilosopher,stage=full?3:((target.alchemyStage||0)%3)+1,ap=pointAt(target.d,target.path);
            if(stage===1||full){applyBurn(target,{damage:source.alchemyPoison||.65,interval:1.1,ticks:4},source);spawnFloatText(ap.x,ap.y-24,'🧪 VENENO','#9df36f');}
            if(stage===2||full){target.markTimer=Math.max(target.markTimer||0,4.5);target.markBonus=Math.max(target.markBonus||0,source.alchemyMark||.14);spawnFloatText(ap.x,ap.y-24,'⚗️ FRAQUEZA','#d0ff8a');}
            if(stage===3||full){const radius=Math.max(72,source.splash||58)*1.35;state.enemies.forEach(e=>{if(e.dead)return;const ep=pointAt(e.d,e.path);if(Math.hypot(ep.x-ap.x,ep.y-ap.y)<=radius)damageEnemy(e,s.damage*(source.alchemyExplosion||1.45),source);});state.pulses.push({x:ap.x,y:ap.y,range:radius,life:.38,maxLife:.38,color:'#b7ff75'});spawnFloatText(ap.x,ap.y-30,'💥 REAÇÃO!','#e8ff9d');}
            target.alchemyStage=full?0:stage;
            target.alchemyStageTimer=full?0:8;
          }
          if(hit&&s.sourceType==='chronomancer'){
            if(!target.temporalMark)target.temporalMark={timer:source.temporalDelay||3.2,snapshotD:target.d};if(!target.armored)applySlow(target,Math.max(1,source.slow||1.3),source.slowFactor||.72);const cp=pointAt(target.d,target.path);spawnFloatText(cp.x,cp.y-24,'⏳ MARCADO','#9de7ff');
          }
          if(hit&&s.sourceType==='demonking'){
            const dp=pointAt(target.d,target.path);
            state.pulses.push({x:dp.x,y:dp.y,range:Math.max(48,s.splash||78),life:.38,maxLife:.38,color:'#7d2dc2'});
            spawnFloatText(dp.x,dp.y-32,'🔥🌑 FOGO SOMBRIO','#d48cff');
          }
          if(hit&&s.pierceTargets>1&&s.sourceType==='sniper'){
            const tower=state.towers.find(t=>t.id===s.towerId)||{x:s.x,y:s.y,type:'sniper'};
            const pierced=sniperPierceTargets(target,tower,source).slice(1),points=[pointAt(target.d,target.path)];
            pierced.forEach(enemy=>{
              const ep=pointAt(enemy.d,enemy.path);points.push(ep);
              const piercedHit=damageEnemy(enemy,s.damage,source);
              if(piercedHit)applyTargetMark(enemy,source);
            });
            if(points.length>1)state.lightning.push({points,life:.13,maxLife:.13,color:s.critical?'#ffd36b':'#8fe7a8',kind:'sniperPierce'});
          }
          if(hit&&s.chainTargets>1){
            const tower=state.towers.find(t=>t.id===s.towerId)||{x:s.x,y:s.y,type:s.sourceType};
            const chainStats={...(s.sourceStats||types[s.sourceType]),chainTargets:s.chainTargets,chainRadius:s.chainRadius};
            const chain=chainTargetsFrom(target,tower,chainStats).slice(1),points=[pointAt(target.d,target.path)];
            chain.forEach(enemy=>{const ep=pointAt(enemy.d,enemy.path);points.push(ep);damageEnemy(enemy,s.damage,source);});
            if(points.length>1)state.lightning.push({points,life:.15,maxLife:.15,color:'#f3bf67',kind:'arrow'});
          }
          if(hit&&s.splash){
            const center=pointAt(target.d,target.path);
            state.enemies.forEach(e=>{
              if(e===target||e.dead)return;
              const a=pointAt(e.d,e.path);
              if(Math.hypot(a.x-center.x,a.y-center.y)<=s.splash){
                const splashHit=damageEnemy(e,s.damage*.45,source);
                if(splashHit&&s.sourceType==='demonking'&&!e.dead)applyBurn(e,{damage:(source.burn?.damage||1.15)*.65,interval:1,ticks:3},source);
              }
            });
          }
        }
      }else if(dist>0){s.x+=dx/dist*step;s.y+=dy/dist*step;}
    });
    state.shots=state.shots.filter(s=>!s.hit);

    updateAirstrikes(dt);

    state.lightning.forEach(l=>l.life-=dt);
    state.lightning=state.lightning.filter(l=>l.life>0);

    state.pulses.forEach(p=>p.life-=dt);
    state.pulses=state.pulses.filter(p=>p.life>0);

    state.floatTexts.forEach(f=>{f.y-=24*dt;f.life-=dt;});
    state.floatTexts=state.floatTexts.filter(f=>f.life>0);

    const farmAwards=processFarmIncome();
    const milestoneAwards=processClearedRounds();
    if(farmAwards.length&&(state.enemies.length||state.spawn.length)){
      const last=farmAwards[farmAwards.length-1],totalFarm=farmAwards.reduce((sum,x)=>sum+x.cash,0);
      setMsg(`🎣 Pescadores renderam +$${totalFarm} ao concluir ${farmAwards.length>1?`${farmAwards.length} rodadas`:`a rodada ${last.wave}`}.`);
    }
    if(state.waveActive&&!state.enemies.length&&!state.spawn.length){
      state.waveActive=false;
      const settled=settleCalledWaves();
      if(!isInfinite()&&state.wave>=mapRounds(state.map,state.difficulty))completeMap();
      else{
        const levelText=settled.levels.length?` • 🎖️ Nível ${profile.level}!`:'';
        const milestoneText=milestoneAwards.length?` • 🪙 +${milestoneAwards.reduce((sum,x)=>sum+x.coins,0)} moedas permanentes`:'';
        const farmText=farmAwards.length?` • 🎣 +$${farmAwards.reduce((sum,x)=>sum+x.cash,0)} dos Pescadores`:'';
        setMsg(`${isInfinite()?'∞ ':''}Campo limpo após a rodada ${state.wave}. +$${settled.cash} • +${settled.xp} XP${farmText}${milestoneText}${levelText} Você pode chamar a próxima.`);
      }
    }
    if(state.lives<=0&&!state.defeatShown){
      state.defeatShown=true;playMusicTheme(state.map);setMsg(isInfinite()?`∞ Fim do Infinito. Você concluiu ${state.lastClearedWave} rodadas.`:'Fim de jogo. Reinicie o mapa e tente outra estratégia.');showResult(false);
    }
    updateStats();
  }

function drawSnowflakeIcon(cx,cy,size,color){
  ctx.save();ctx.translate(cx,cy);ctx.strokeStyle=color;ctx.lineWidth=2;ctx.lineCap='round';ctx.shadowColor=color;ctx.shadowBlur=5;
  for(let i=0;i<3;i++){
    ctx.save();ctx.rotate(i*Math.PI/3);ctx.beginPath();ctx.moveTo(-size,0);ctx.lineTo(size,0);ctx.stroke();
    for(const side of [-1,1]){
      const x=side*size*.62;
      ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x-side*size*.22,-size*.22);ctx.moveTo(x,0);ctx.lineTo(x-side*size*.22,size*.22);ctx.stroke();
    }
    ctx.restore();
  }
  ctx.shadowBlur=0;ctx.restore();
}

function drawDartWeapon(r,accent){
  ctx.save();ctx.translate(r*.35,3);ctx.rotate(-.28);
  ctx.strokeStyle='#5c4635';ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(25,0);ctx.stroke();
  ctx.fillStyle=accent;ctx.beginPath();ctx.moveTo(31,0);ctx.lineTo(22,-5);ctx.lineTo(22,5);ctx.closePath();ctx.fill();
  ctx.fillStyle='#efefef';ctx.beginPath();ctx.moveTo(3,0);ctx.lineTo(-4,-4);ctx.lineTo(-2,0);ctx.lineTo(-4,4);ctx.closePath();ctx.fill();ctx.restore();
}

function drawBowWeapon(r,multiShot,accent){
  const bx=r+14,by=1,rad=18;
  ctx.save();ctx.strokeStyle='#c78945';ctx.lineWidth=3;ctx.beginPath();ctx.arc(bx,by,rad,-1.25,1.25);ctx.stroke();
  ctx.strokeStyle='#efe2ca';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(bx+rad*.31,by-rad*.95);ctx.lineTo(bx+rad*.31,by+rad*.95);ctx.stroke();
  const drawArrow=(off,color)=>{ctx.strokeStyle='#765436';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(r*.35,by+off);ctx.lineTo(r+34,by+off);ctx.stroke();ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(r+39,by+off);ctx.lineTo(r+29,by+off-4);ctx.lineTo(r+29,by+off+4);ctx.closePath();ctx.fill();};
  drawArrow(multiShot>1?-4:0,accent);if(multiShot>1)drawArrow(5,'#f3bf67');ctx.restore();
}

function drawSpearWeapon(r,fire=false){
  ctx.save();ctx.translate(r*.25,8);ctx.rotate(-.45);
  ctx.strokeStyle='#9f7c4f';ctx.lineWidth=3.4;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(40,0);ctx.stroke();
  ctx.fillStyle=fire?'#ffb05f':'#dce2e8';ctx.beginPath();ctx.moveTo(48,0);ctx.lineTo(37,-6);ctx.lineTo(39,0);ctx.lineTo(37,6);ctx.closePath();ctx.fill();
  if(fire){ctx.shadowColor='#ff633f';ctx.shadowBlur=10;ctx.fillStyle='#ff633f';ctx.beginPath();ctx.arc(38,0,4.5,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;}
  ctx.restore();
}

function drawSniperRifle(r,sp,accent){
  const elite=sp[0]||0,hunter=sp[1]||0;
  ctx.save();ctx.translate(r*.18,8);ctx.rotate(-.16);
  // coronha fora do corpo
  ctx.fillStyle=hunter>=1?'#473653':'#5b4638';ctx.beginPath();ctx.roundRect(-2,-5,18,11,3);ctx.fill();
  // corpo da arma
  ctx.fillStyle=elite>=2?'#665238':'#252b31';ctx.strokeStyle='#0d1115';ctx.lineWidth=1.5;ctx.beginPath();ctx.roundRect(10,-5,34,9,2);ctx.fill();ctx.stroke();
  // cano longo, claramente para fora do gatinho
  ctx.strokeStyle=elite>=4?'#d2b35b':'#4e5961';ctx.lineWidth=elite>=4?4:3;ctx.beginPath();ctx.moveTo(42,-1);ctx.lineTo(r+43,-1);ctx.stroke();
  ctx.fillStyle='#161b20';ctx.fillRect(r+38,-4,9,6);
  // mira telescópica
  ctx.fillStyle='#13181d';ctx.strokeStyle=accent;ctx.lineWidth=1.6;ctx.beginPath();ctx.roundRect(18,-12,20,7,3);ctx.fill();ctx.stroke();
  ctx.fillStyle=elite>=1?'#ffd36b':accent;ctx.beginPath();ctx.arc(34,-8.5,2.3,0,Math.PI*2);ctx.fill();
  // empunhadura e bipé visual
  ctx.strokeStyle='#343c43';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(23,4);ctx.lineTo(19,13);ctx.moveTo(36,3);ctx.lineTo(40,12);ctx.stroke();
  if(elite>=3){ctx.strokeStyle='#ffd36b';ctx.lineWidth=1;ctx.beginPath();ctx.arc(34,-8.5,6,0,Math.PI*2);ctx.stroke();}
  ctx.restore();
}

function drawBombLauncher(r,lv,accent){
  ctx.save();ctx.translate(r*.28,4);ctx.rotate(-.5);
  ctx.strokeStyle='#4a3a2c';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-3,4);ctx.lineTo(9,-2);ctx.stroke();
  const len=20+Math.min(3,lv)*2.4;
  ctx.fillStyle='#2c2f36';ctx.beginPath();ctx.roundRect(4,-6,len,12,4);ctx.fill();
  ctx.strokeStyle=accent;ctx.lineWidth=1.6;ctx.beginPath();ctx.roundRect(4,-6,len,12,4);ctx.stroke();
  ctx.fillStyle='#0c0d11';ctx.beginPath();ctx.ellipse(4+len,0,3.6,6,0,0,Math.PI*2);ctx.fill();
  const bx=4+len*.42;
  ctx.fillStyle='#20232b';ctx.beginPath();ctx.arc(bx,-9,5+lv*.4,0,Math.PI*2);ctx.fill();ctx.strokeStyle=accent;ctx.lineWidth=1.2;ctx.stroke();
  ctx.strokeStyle='#f3bf67';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(bx+1,-13-lv*.4);ctx.quadraticCurveTo(bx+6,-19-lv*.4,bx+9,-15-lv*.4);ctx.stroke();
  ctx.shadowColor='#ffcf6b';ctx.shadowBlur=6;ctx.fillStyle='#ffcf6b';ctx.beginPath();ctx.arc(bx+9,-15-lv*.4,1.6,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
  ctx.restore();
}

function drawLaserEmitter(r,lv,accent){
  ctx.save();ctx.translate(r*.32,-2);ctx.rotate(-.12);
  ctx.strokeStyle='#565f68';ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(-4,4);ctx.lineTo(8,0);ctx.stroke();
  const len=18+Math.min(3,lv)*2;
  ctx.fillStyle='#181c28';ctx.strokeStyle=accent;ctx.lineWidth=1.6;
  ctx.beginPath();ctx.roundRect(6,-5,len,10,3);ctx.fill();ctx.stroke();
  ctx.shadowColor=accent;ctx.shadowBlur=4+lv;
  ctx.fillStyle=accent;ctx.beginPath();ctx.arc(6+len,0,3.4,0,Math.PI*2);ctx.fill();
  ctx.shadowBlur=0;
  ctx.strokeStyle=accent;ctx.globalAlpha=.55;ctx.lineWidth=1;
  for(let i=0;i<Math.min(3,lv);i++){ctx.beginPath();ctx.arc(6+len*.35+i*(len*.22),0,5,0,Math.PI*2);ctx.stroke();}
  ctx.globalAlpha=1;
  ctx.strokeStyle=accent+'55';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(6+len+3,0);ctx.lineTo(6+len+16,0);ctx.stroke();
  ctx.restore();
}

function drawWizardStaff(r,lv,accent){
  ctx.save();ctx.translate(r*.6,6);ctx.rotate(-.25);
  ctx.strokeStyle='#7a5a3a';ctx.lineWidth=3;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(0,14);ctx.lineTo(0,-24-lv*1.6);ctx.stroke();
  const oy=-27-lv*1.6;
  ctx.shadowColor=accent;ctx.shadowBlur=8+lv;
  const orb=ctx.createRadialGradient(0,oy,0,0,oy,7);orb.addColorStop(0,'#fff6d8');orb.addColorStop(.6,accent);orb.addColorStop(1,accent+'00');
  ctx.fillStyle=orb;ctx.beginPath();ctx.arc(0,oy,6,0,Math.PI*2);ctx.fill();
  ctx.shadowBlur=0;
  const tt=performance.now()/1000;
  ctx.fillStyle='#fff6a8';
  for(let i=0;i<2+lv;i++){const a=tt*1.6+i*(Math.PI*2/(2+lv)),rr=10+(i%2)*3;ctx.beginPath();ctx.arc(Math.cos(a)*rr,oy+Math.sin(a)*rr*.6,1.4,0,Math.PI*2);ctx.fill();}
  ctx.restore();
}

function drawHero(h){
  if(!h)return;const st=heroStats(h),def=HEROES[h.type],r=25,now=performance.now()/1000;
  ctx.save();
  if(st.auraRange){ctx.globalAlpha=.075+(h.type==='king'&&(h.commandTimer||0)>0?.06:0);ctx.fillStyle=def.color;ctx.beginPath();ctx.arc(h.x,h.y,st.auraRange,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;ctx.strokeStyle=def.color+'88';ctx.setLineDash([7,7]);ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(h.x,h.y,st.auraRange,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);}
  else if(st.range){ctx.globalAlpha=.04;ctx.fillStyle=def.color;ctx.beginPath();ctx.arc(h.x,h.y,st.range,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;}
  const heroRecoil=(h.recoil||0);ctx.translate(h.x-Math.cos(h.angle||0)*heroRecoil*14,h.y-Math.sin(h.angle||0)*heroRecoil*14);
  if(h.attackFlash>0){ctx.save();ctx.globalAlpha=Math.min(.28,h.attackFlash*2.5);ctx.fillStyle=def.color;ctx.beginPath();ctx.arc(0,-2,r+13,0,Math.PI*2);ctx.fill();ctx.restore();}
  ctx.shadowColor=def.color;ctx.shadowBlur=10+4*Math.sin(now*2);ctx.fillStyle=def.color+'2a';ctx.beginPath();ctx.arc(0,-2,r+10,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
  ctx.fillStyle=def.fur;ctx.beginPath();ctx.ellipse(0,13,r*.72,r*.66,0,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.moveTo(-r*.62,-7);ctx.lineTo(-r*.50,-r-7);ctx.lineTo(-r*.20,-r*.55);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(r*.62,-7);ctx.lineTo(r*.50,-r-7);ctx.lineTo(r*.20,-r*.55);ctx.closePath();ctx.fill();
  ctx.beginPath();ctx.arc(0,-5,r,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#fff0e0';ctx.globalAlpha=.8;ctx.beginPath();ctx.ellipse(0,6,r*.52,r*.34,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
  ctx.fillStyle='#11151b';for(const x of[-8,8]){ctx.beginPath();ctx.ellipse(x,-8,3.3,4.8,0,0,Math.PI*2);ctx.fill();}
  ctx.fillStyle='#e88794';ctx.beginPath();ctx.moveTo(-3,1);ctx.lineTo(3,1);ctx.lineTo(0,5);ctx.closePath();ctx.fill();
  ctx.font='25px Segoe UI Emoji,Segoe UI Symbol';ctx.textAlign='center';ctx.fillText(def.icon,0,-r-15);
  if(h.type==='king'){ctx.fillStyle='#f2cf62';ctx.beginPath();ctx.moveTo(-14,-20);ctx.lineTo(-8,-37);ctx.lineTo(0,-26);ctx.lineTo(8,-37);ctx.lineTo(14,-20);ctx.closePath();ctx.fill();}
  if(h.type==='warrior'){ctx.strokeStyle='#f4f6f8';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(18,5);ctx.lineTo(34,-22);ctx.stroke();ctx.strokeStyle='#855635';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(13,10);ctx.lineTo(22,1);ctx.stroke();}
  if(h.type==='luna'){ctx.fillStyle='#d9c8ff';ctx.beginPath();ctx.arc(18,-23,9,.55,Math.PI*1.8);ctx.lineTo(22,-23);ctx.arc(20,-23,6,Math.PI*1.8,.55,true);ctx.closePath();ctx.fill();}
  if(h.type==='merchant'){ctx.fillStyle='#d49c55';ctx.beginPath();ctx.ellipse(0,-21,18,5,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ffcf8a';ctx.fillRect(-12,-30,24,9);ctx.font='18px Segoe UI Emoji';ctx.fillText('🐟',20,13);}
  ctx.strokeStyle=def.color;ctx.lineWidth=2.4;ctx.beginPath();ctx.arc(0,10,r*.74,.15,Math.PI-.15);ctx.stroke();
  ctx.restore();
  const heroLabels=[];
  if(effectActive('focus'))heroLabels.push({text:'DMG +100%',color:'#ff9a78'});
  if(effectActive('frenzy'))heroLabels.push({text:'SPD +100%',color:'#ffe06b'});
  drawBuffBadges(h.x,h.y-r-22,heroLabels);
  if((h.stunTimer||0)>0){ctx.fillStyle='#ffe0a6';ctx.font='900 14px Segoe UI Emoji,Segoe UI Symbol';ctx.textAlign='center';ctx.fillText('😵',h.x,h.y-r-47);}
  ctx.fillStyle='#f6f4ff';ctx.font='900 10px Segoe UI,Arial';ctx.textAlign='center';ctx.fillText(`🦸 Nv.${h.level}`,h.x,h.y+r+18);
}

// Sombreia em vermelho, dentro do círculo de alcance da torre selecionada, os setores onde um
// obstáculo bloqueia a linha de tiro — ou seja, onde "aquele gatinho não consegue acertar"
// mesmo estando nominalmente dentro do alcance.
function drawTowerDeadZones(t,st){
  if(!currentObstacles().length)return;
  const steps=96,step=Math.PI*2/steps;
  ctx.save();ctx.fillStyle='#ff3b3b';ctx.globalAlpha=.32;
  for(let i=0;i<steps;i++){
    const a0=i*step,a1=a0+step,mid=a0+step/2;
    const blockDist=raycastBlockDistance(t.x,t.y,mid,st.range);
    if(blockDist===null)continue;
    const inner=Math.max(0,blockDist-2);
    ctx.beginPath();
    ctx.arc(t.x,t.y,st.range,a0-.01,a1+.01);
    ctx.arc(t.x,t.y,inner,a1+.01,a0-.01,true);
    ctx.closePath();ctx.fill();
  }
  ctx.globalAlpha=1;ctx.restore();
}

function drawTower(t){
    const st=towerStats(t),dartTier=t.type==='dart'?Math.max(0,...dartPaths(t)):null,sniperTier=t.type==='sniper'?Math.max(0,...sniperPaths(t)):null,frostTier=t.type==='frost'?Math.max(0,...frostPaths(t)):null,vineTier=t.type==='vine'?Math.max(0,...vinePaths(t)):null,burstTier=t.type==='burst'?Math.max(0,...burstPaths(t)):null,ninjaTier=t.type==='ninja'?Math.max(0,...ninjaPaths(t)):null,laserTier=t.type==='laser'?Math.max(0,...laserPaths(t)):null,wizardTier=t.type==='wizard'?Math.max(0,...wizardPaths(t)):null,electricTier=t.type==='electric'?Math.max(0,...electricPaths(t)):null,demonTier=t.type==='demonking'?Math.max(0,...demonkingPaths(t)):null,pathTier=t.type==='dart'?dartTier:t.type==='sniper'?sniperTier:t.type==='frost'?frostTier:t.type==='vine'?vineTier:t.type==='burst'?burstTier:t.type==='ninja'?ninjaTier:t.type==='laser'?laserTier:t.type==='wizard'?wizardTier:t.type==='electric'?electricTier:t.type==='demonking'?demonTier:null,lv=pathTier!==null?Math.max(1,pathTier):t.level||1,selected=t.id===state.selectedTower;
    const mastered=masteryState(t.type).level>=50;
    const elvenWizardSkin=t.type==='wizard'&&profile.equippedSkins?.wizard==='elvenMage';
    const r=17+Math.max(0,lv-1)*1.8,fur=elvenWizardSkin?'#f5f1e8':(st.fur||'#d8a56f'),accent=elvenWizardSkin?'#65e1dc':(mastered?'#f4d36b':(st.accent||st.color));
    if(st.farm){
      if(selected){ctx.globalAlpha=.12;ctx.fillStyle='#ffcf8a';ctx.beginPath();ctx.arc(t.x,t.y,44,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;}
    }else if(st.globalRange){
      if(selected){ctx.fillStyle=accent+'12';ctx.fillRect(0,0,W,H);ctx.strokeStyle=accent+'aa';ctx.lineWidth=2;ctx.setLineDash([7,6]);ctx.strokeRect(7,7,W-14,H-14);ctx.setLineDash([]);}
    }else{
      ctx.globalAlpha=selected?.18:.065;ctx.fillStyle=accent;ctx.beginPath();ctx.arc(t.x,t.y,st.range,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
      if(selected){ctx.strokeStyle='#ffffffaa';ctx.lineWidth=1.5;ctx.setLineDash([5,5]);ctx.beginPath();ctx.arc(t.x,t.y,st.range,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);drawTowerDeadZones(t,st);}
    }
    if(t.type==='dart'&&st.supportAuraRadius&&selected){ctx.globalAlpha=.09;ctx.fillStyle='#6fd7a1';ctx.beginPath();ctx.arc(t.x,t.y,st.supportAuraRadius,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;ctx.strokeStyle='#6fd7a188';ctx.setLineDash([6,6]);ctx.beginPath();ctx.arc(t.x,t.y,st.supportAuraRadius,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);}
    const now=performance.now()/1000;
    ctx.save();
    const recoil=(t.recoil||0);
    ctx.translate(t.x-Math.cos(t.angle||0)*recoil*16,t.y-Math.sin(t.angle||0)*recoil*16);
    if(t.attackFlash>0){ctx.save();ctx.globalAlpha=Math.min(.30,t.attackFlash*2.4);ctx.fillStyle=accent;ctx.beginPath();ctx.arc(0,-2,r+10,0,Math.PI*2);ctx.fill();ctx.restore();}
    if(lv>=3){
      const pulse=.14+.08*Math.sin(now*2.6+t.id);
      ctx.globalAlpha=pulse;ctx.fillStyle=accent;ctx.beginPath();ctx.arc(0,-3,r+7+(lv-3)*3,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
    }
    if((t.type==='dart'&&dartTier>=DART_MAX_TIER)||(t.type==='sniper'&&sniperTier>=SNIPER_MAX_TIER)||(t.type==='frost'&&frostTier>=FROST_MAX_TIER)||(t.type==='vine'&&vineTier>=VINE_MAX_TIER)||(t.type==='burst'&&burstTier>=BURST_MAX_TIER)||(t.type==='ninja'&&ninjaTier>=NINJA_MAX_TIER)||(t.type==='laser'&&laserTier>=LASER_MAX_TIER)||(t.type==='wizard'&&wizardTier>=WIZARD_MAX_TIER)||(t.type==='electric'&&electricTier>=ELECTRIC_MAX_TIER)||(t.type==='demonking'&&demonTier>=DEMONKING_MAX_TIER)||(!['dart','sniper','frost','vine','burst','ninja','laser','wizard','electric','demonking'].includes(t.type)&&lv>=MAX_LEVEL)){
      ctx.globalAlpha=.55+.25*Math.sin(now*4+t.id);
      ctx.strokeStyle=accent;ctx.lineWidth=1.4;ctx.setLineDash([3,4]);
      ctx.beginPath();ctx.arc(0,-3,r+14,now*1.4,now*1.4+Math.PI*1.5);ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=1;
    }
    // Corpo + arma encaram o alvo sem deixar o gatinho ficar de ponta-cabeca.
    // Ao passar de +/-90 graus, usamos o angulo equivalente e espelhamos no eixo X:
    // a arma continua apontando exatamente para o alvo, mas o corpo permanece em pe.
    let visualAngle=((t.angle||0)+Math.PI)%(Math.PI*2);
    if(visualAngle<0)visualAngle+=Math.PI*2;
    visualAngle-=Math.PI;
    const flipFacing=visualAngle>Math.PI/2||visualAngle<-Math.PI/2;
    if(flipFacing)visualAngle+=visualAngle>0?-Math.PI:Math.PI;
    ctx.save();ctx.rotate(visualAngle);if(flipFacing)ctx.scale(-1,1);
    ctx.fillStyle=fur;ctx.beginPath();ctx.ellipse(0,14,r*.68,r*.66,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=fur;ctx.beginPath();ctx.moveTo(-r*.55,-9);ctx.lineTo(-r*.45,-r-2);ctx.lineTo(-r*.2,-r*.58);ctx.closePath();ctx.fill();
    ctx.beginPath();ctx.moveTo(r*.55,-9);ctx.lineTo(r*.45,-r-2);ctx.lineTo(r*.2,-r*.58);ctx.closePath();ctx.fill();
    ctx.fillStyle=fur;ctx.strokeStyle='#0b0c12cc';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,-3,r,0,Math.PI*2);ctx.fill();ctx.stroke();
    if(mastered){ctx.fillStyle='#d4af55';ctx.globalAlpha=.95;ctx.beginPath();ctx.moveTo(-r*.55,-9);ctx.lineTo(-r*.45,-r-2);ctx.lineTo(-r*.2,-r*.58);ctx.closePath();ctx.fill();ctx.beginPath();ctx.arc(r*.18,-r*.24,r*.42,-1.55,-.1);ctx.lineTo(r*.18,-r*.24);ctx.closePath();ctx.fill();ctx.globalAlpha=1;}
    ctx.fillStyle=t.type==='frost'?'#ffffff':'#fff2e6';ctx.globalAlpha=t.type==='frost' ? .92 : .72;ctx.beginPath();ctx.ellipse(0,4,r*.46,r*.31,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
    ctx.fillStyle=t.type==='demonking'?'#ff405d':'#161720';ctx.shadowColor=t.type==='demonking'?'#ff405d':'transparent';ctx.shadowBlur=t.type==='demonking'?6:0;ctx.beginPath();ctx.ellipse(-r*.34,-5,2.1,3.1,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(r*.34,-5,2.1,3.1,0,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
    ctx.fillStyle='#e88d94';ctx.beginPath();ctx.moveTo(-2,1);ctx.lineTo(2,1);ctx.lineTo(0,4);ctx.closePath();ctx.fill();
    ctx.strokeStyle='#3a2d31';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,4);ctx.quadraticCurveTo(-3,7,-6,6);ctx.moveTo(0,4);ctx.quadraticCurveTo(3,7,6,6);ctx.stroke();
    ctx.strokeStyle=t.type==='frost'?'#a7c4d2aa':'#f4eee8aa';ctx.lineWidth=.85;for(const yy of [2,5]){ctx.beginPath();ctx.moveTo(-5,yy);ctx.lineTo(-r*.82,yy-1);ctx.moveTo(5,yy);ctx.lineTo(r*.82,yy-1);ctx.stroke();}
    if(t.type==='dart'){
      const dp=dartPaths(t),primary=dartPrimaryPath(t);
      if(st.bandana){ctx.fillStyle='#d94355';ctx.fillRect(-r*.78,-r*.5,r*1.56,5);ctx.beginPath();ctx.moveTo(r*.65,-r*.48);ctx.lineTo(r+10,-r*.62);ctx.lineTo(r+6,-r*.25);ctx.closePath();ctx.fill();}
      if(st.weapon==='bow'){
        drawBowWeapon(r,st.multiShot||1,accent);
      }else if(st.weapon==='spear'||st.weapon==='fireSpear'){
        drawSpearWeapon(r,st.weapon==='fireSpear');
      }else{
        drawDartWeapon(r,accent);
      }
      if(dp[2]>=1){ctx.strokeStyle='#6fd7a1';ctx.globalAlpha=.9;ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,10,r*.82,.2,Math.PI-.2);ctx.stroke();ctx.globalAlpha=1;ctx.font='11px Segoe UI,Arial';ctx.textAlign='center';ctx.fillText(dp[2]>=2?'🐟':'✚',-r*.75,18);}
    }else if(t.type==='frost'){
      // Gelinho: corpo totalmente branco, rosto limpo e floco acima da cabeça.
      const fp=frostPaths(t);
      drawSnowflakeIcon(0,-r-15,8+Math.min(3,lv),accent);
      ctx.strokeStyle='#9edff3';ctx.lineWidth=2.2;ctx.beginPath();ctx.arc(0,10,r*.55,.12,Math.PI-.12);ctx.stroke();
      if(fp[0]>=3){ctx.fillStyle='#eaf7ff';ctx.strokeStyle='#c9edff';ctx.lineWidth=1;for(const a of[-.5,0,.5]){ctx.save();ctx.rotate(a);ctx.beginPath();ctx.moveTo(0,-r-2);ctx.lineTo(2.4,-r-11);ctx.lineTo(-2.4,-r-11);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();}}
      if(fp[1]>=3){ctx.strokeStyle='#c9f0ff';ctx.globalAlpha=.8;ctx.lineWidth=1.6;for(const off of[0,1]){ctx.beginPath();ctx.arc(0,-3,r+9+off*6,-.6-off*.2,.6+off*.2);ctx.stroke();}ctx.globalAlpha=1;}
      if(fp[2]>=2){ctx.fillStyle='#bfe9fb';for(const x of[-r*.4,r*.4]){ctx.beginPath();ctx.moveTo(x-2.2,r*.5);ctx.lineTo(x+2.2,r*.5);ctx.lineTo(x,r*.5+6+Math.min(3,fp[2])*1.6);ctx.closePath();ctx.fill();}}
    }else if(t.type==='burst'){
      const bp=burstPaths(t);
      ctx.strokeStyle='#4a3a2c';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-r*.6,-r*.35);ctx.lineTo(r*.4,r*.5);ctx.stroke();
      ctx.fillStyle='#20232b';for(const oy of [-6,3]){ctx.beginPath();ctx.arc(-r*.15,oy,2.6,0,Math.PI*2);ctx.fill();}
      drawBombLauncher(r,lv,accent);
      if(bp[0]>=2){ctx.strokeStyle='#ffb26b';ctx.globalAlpha=.85;ctx.lineWidth=1.6;for(const a of[-2.3,2.3]){ctx.save();ctx.rotate(a);ctx.beginPath();ctx.moveTo(0,-r*.15);ctx.lineTo(r*.42,-r*.32);ctx.moveTo(0,-r*.15);ctx.lineTo(r*.3,-r*.05);ctx.stroke();ctx.restore();}ctx.globalAlpha=1;}
      if(bp[1]>=2){ctx.fillStyle='#ff8a4d';for(const [x,y] of[[-r*.55,r*.35],[r*.6,r*.4],[0,r*.75]]){ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x-3,y-8,x,y-13);ctx.quadraticCurveTo(x+3,y-8,x,y);ctx.fill();}}
      if(bp[2]>=2){ctx.strokeStyle='#b6e66a';ctx.globalAlpha=.65;ctx.lineWidth=1.3;ctx.beginPath();ctx.arc(0,3,r*.9+5,.15,Math.PI*.7);ctx.stroke();ctx.globalAlpha=1;}
    }else if(t.type==='laser'){
      const lp=laserPaths(t);
      drawLaserEmitter(r,lv,accent);
      if(lp[0]>=2){ctx.strokeStyle='#ff8f8f';ctx.globalAlpha=.75;ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(0,-3,r*.9+4,-.6,.6);ctx.stroke();ctx.globalAlpha=1;}
      if(lp[1]>=2){ctx.fillStyle='#ff9d5c';ctx.globalAlpha=.85;for(const [x,y] of[[-r*.5,r*.4],[r*.55,r*.42]]){ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x-2.5,y-7,x,y-11);ctx.quadraticCurveTo(x+2.5,y-7,x,y);ctx.fill();}ctx.globalAlpha=1;}
      if(lp[2]>=2){ctx.strokeStyle='#7ee0ff';ctx.globalAlpha=.7;ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(-r*.6,-r*.5);ctx.lineTo(-r*.3,-r*.15);ctx.lineTo(-r*.55,r*.1);ctx.stroke();ctx.globalAlpha=1;}
    }else if(t.type==='ninja'){
      const np=ninjaPaths(t);
      ctx.fillStyle='#171821';ctx.globalAlpha=.92;ctx.beginPath();ctx.arc(0,-3,r*.88,Math.PI,Math.PI*2);ctx.lineTo(r*.88,2);ctx.quadraticCurveTo(0,8,-r*.88,2);ctx.closePath();ctx.fill();ctx.globalAlpha=1;ctx.strokeStyle=accent;ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(-r*.78,-r*.48);ctx.lineTo(r*.95,-r*.48);ctx.stroke();ctx.fillStyle=accent;ctx.beginPath();ctx.moveTo(r*.9,-r*.48);ctx.lineTo(r+9,-r*.72);ctx.lineTo(r+4,-r*.25);ctx.closePath();ctx.fill();
      if(np[0]>=2){ctx.fillStyle='#dcdcec';ctx.globalAlpha=.9;for(const a of[-2.4,2.4]){ctx.save();ctx.rotate(a);ctx.beginPath();ctx.moveTo(0,-r*.3);ctx.lineTo(r*.14,-r*.05);ctx.lineTo(0,r*.05);ctx.lineTo(-r*.14,-r*.05);ctx.closePath();ctx.fill();ctx.restore();}ctx.globalAlpha=1;}
      if(np[1]>=2){ctx.fillStyle='#8fd15a';ctx.globalAlpha=.85;ctx.beginPath();ctx.arc(-r*.55,r*.35,2.6,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(r*.6,r*.4,2.2,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;}
      if(np[2]>=2){ctx.strokeStyle='#8a7fae';ctx.globalAlpha=.7;ctx.lineWidth=1.3;ctx.beginPath();ctx.arc(0,-3,r*.88+6,.1,Math.PI*.6);ctx.stroke();ctx.globalAlpha=1;ctx.fillStyle='#c9c0ff';ctx.beginPath();ctx.ellipse(-r*.34,-5,1.6,2.3,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(r*.34,-5,1.6,2.3,0,0,Math.PI*2);ctx.fill();}
    }else if(t.type==='wizard'){
      const wp=wizardPaths(t);
      if(elvenWizardSkin){
        // Cabelo para trás e rosto do gatinho totalmente visível na frente.
        ctx.fillStyle='#dbe7ea';ctx.globalAlpha=.96;
        ctx.beginPath();ctx.moveTo(-r*.9,-9);ctx.quadraticCurveTo(-r*1.15,8,-r*.62,18);ctx.lineTo(-r*.1,11);ctx.lineTo(r*.1,11);ctx.lineTo(r*.62,18);ctx.quadraticCurveTo(r*1.15,8,r*.9,-9);ctx.quadraticCurveTo(0,-r-5,-r*.9,-9);ctx.closePath();ctx.fill();ctx.globalAlpha=1;
        ctx.fillStyle='#f7f1df';ctx.beginPath();ctx.arc(0,-3,r*.88,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle='#d7b75d';ctx.lineWidth=1.9;ctx.beginPath();ctx.arc(0,-12,r*.56,Math.PI*1.08,Math.PI*1.92);ctx.stroke();
        ctx.fillStyle='#edf1f3';ctx.beginPath();ctx.moveTo(-r*.92,-8);ctx.quadraticCurveTo(-r*.7,-19,-r*.14,-12);ctx.quadraticCurveTo(0,-8,r*.14,-12);ctx.quadraticCurveTo(r*.7,-19,r*.92,-8);ctx.lineTo(r*.68,-1);ctx.quadraticCurveTo(r*.15,-7,0,-7);ctx.quadraticCurveTo(-r*.15,-7,-r*.68,-1);ctx.closePath();ctx.fill();
        ctx.fillStyle='#d9eef0';for(const side of[-1,1]){ctx.beginPath();ctx.moveTo(side*r*.6,-1);ctx.quadraticCurveTo(side*(r+9),7,side*r*.7,13);ctx.quadraticCurveTo(side*r*.48,9,side*r*.36,3);ctx.closePath();ctx.fill();}
        ctx.fillStyle='#174e55';ctx.strokeStyle='#d7b75d';ctx.lineWidth=1.7;ctx.beginPath();ctx.moveTo(-r*.82,9);ctx.quadraticCurveTo(0,1,r*.82,9);ctx.lineTo(r*.64,r+8);ctx.lineTo(-r*.64,r+8);ctx.closePath();ctx.fill();ctx.stroke();
        ctx.fillStyle='#f7f1df';ctx.beginPath();ctx.moveTo(-r*.28,9);ctx.lineTo(0,18);ctx.lineTo(r*.28,9);ctx.lineTo(r*.16,r+5);ctx.lineTo(-r*.16,r+5);ctx.closePath();ctx.fill();
        // Mini baú mimico ao lado para deixar a skin mais identificável.
        ctx.fillStyle='#7a5033';ctx.strokeStyle='#d7b75d';ctx.lineWidth=1.1;ctx.beginPath();ctx.roundRect(-r-12,10,11,9,2);ctx.fill();ctx.stroke();
        ctx.fillStyle='#f3d7b0';ctx.beginPath();ctx.moveTo(-r-11,14);ctx.lineTo(-r-6,12);ctx.lineTo(-r-2,14);ctx.lineTo(-r-6,16);ctx.closePath();ctx.fill();
        if(lv>=3){ctx.strokeStyle='#d7b75d';ctx.lineWidth=1.3;ctx.beginPath();ctx.arc(0,-3,r+10,now*.8,now*.8+Math.PI*1.35);ctx.stroke();}
      }else{
        ctx.fillStyle='#443061';ctx.strokeStyle=accent;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-r*.82,-r*.48);ctx.lineTo(r*.82,-r*.48);ctx.lineTo(r*.15,-r-18-lv);ctx.closePath();ctx.fill();ctx.stroke();
      }
      drawWizardStaff(r,lv,accent);
      if(wp[0]>=2){ctx.strokeStyle='#d9c4ff';ctx.globalAlpha=.7;ctx.lineWidth=1.3;for(const off of[0,1]){ctx.beginPath();ctx.arc(0,-3,r+7+off*6,-.5-off*.15,.5+off*.15);ctx.stroke();}ctx.globalAlpha=1;}
      if(wp[1]>=2){ctx.fillStyle='#ffb26b';for(const [x,y] of[[-r*.55,r*.3],[r*.6,r*.35],[0,r*.65]]){ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x-2.6,y-8,x,y-12);ctx.quadraticCurveTo(x+2.6,y-8,x,y);ctx.fill();}}
      if(wp[2]>=2){ctx.strokeStyle='#9fe0d0';ctx.globalAlpha=.7;ctx.lineWidth=1.3;ctx.beginPath();ctx.arc(0,3,r*.9+5,.1,Math.PI*.65);ctx.stroke();ctx.globalAlpha=1;}
    }else if(t.type==='electric'){
      const ep=electricPaths(t);
      ctx.strokeStyle=accent;ctx.lineWidth=2.4;ctx.shadowColor=accent;ctx.shadowBlur=7;
      ctx.beginPath();ctx.moveTo(-8,-r-2);ctx.lineTo(-2,-r-10);ctx.lineTo(2,-r-3);ctx.lineTo(9,-r-14);ctx.stroke();ctx.shadowBlur=0;
      ctx.fillStyle='#4a4327';ctx.fillRect(-8,8,16,7);ctx.fillStyle=accent;ctx.fillRect(-4,4,8,10);
      if(ep[0]>=2){ctx.strokeStyle='#fff0a0';ctx.globalAlpha=.8;ctx.lineWidth=1.4;ctx.shadowColor='#fff0a0';ctx.shadowBlur=4;ctx.beginPath();ctx.moveTo(-r*.5,-r*.2);ctx.lineTo(-r*.25,-r*.05);ctx.lineTo(-r*.45,r*.15);ctx.stroke();ctx.shadowBlur=0;ctx.globalAlpha=1;}
      if(ep[1]>=2){ctx.strokeStyle='#ffd76b';ctx.globalAlpha=.75;ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(0,-3,r*.9+5,-.5,.5);ctx.stroke();ctx.globalAlpha=1;}
      if(ep[2]>=2){ctx.strokeStyle='#b6a4ff';ctx.globalAlpha=.65;ctx.lineWidth=1.3;ctx.beginPath();ctx.arc(0,3,r*.9+8,.2,Math.PI*.6);ctx.stroke();ctx.globalAlpha=1;}
    }else if(t.type==='vine'){
      const vp=vinePaths(t);
      ctx.strokeStyle=accent;ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,3,r*.85,.1,Math.PI*1.7);ctx.stroke();
      ctx.fillStyle='#3f7d49';for(const [x,y] of [[-9,-14],[10,-10],[-12,7],[12,8]]){ctx.beginPath();ctx.ellipse(x,y,5,2.6,.5,0,Math.PI*2);ctx.fill();}
      ctx.strokeStyle='#8fd69a';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(-r*.7,15);ctx.quadraticCurveTo(0,23,r*.75,13);ctx.stroke();
      if(vp[0]>=2){ctx.strokeStyle='#69d17d';ctx.lineWidth=1.4;ctx.globalAlpha=.85;for(const a of[-2.1,2.1]){ctx.save();ctx.rotate(a);ctx.beginPath();ctx.moveTo(0,-r*.2);ctx.quadraticCurveTo(r*.35,-r*.55,r*.5,-r*.15);ctx.stroke();ctx.restore();}ctx.globalAlpha=1;}
      if(vp[1]>=2){ctx.fillStyle='#e9ff8a';for(const [x,y] of[[-6,-r*.65],[6,-r*.55],[0,r*.7]]){ctx.beginPath();ctx.moveTo(x,y-3);ctx.lineTo(x+1.6,y);ctx.lineTo(x,y+3);ctx.lineTo(x-1.6,y);ctx.closePath();ctx.fill();}}
      if(vp[2]>=2){ctx.strokeStyle='#c9a6ff';ctx.globalAlpha=.7;ctx.lineWidth=1.3;ctx.beginPath();ctx.arc(0,3,r*.85+5,.05,Math.PI*.55);ctx.stroke();ctx.globalAlpha=1;}
    }else if(t.type==='salmon'){
      ctx.fillStyle='#35586a';ctx.strokeStyle='#8cd7ea';ctx.lineWidth=1.7;
      ctx.beginPath();ctx.roundRect(-11,8,22,11,3);ctx.fill();ctx.stroke();
      ctx.strokeStyle='#7b5a3d';ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(8,7);ctx.lineTo(17,-24);ctx.stroke();
      ctx.strokeStyle='#d5edf4';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(17,-24);ctx.quadraticCurveTo(26,-6,14,12);ctx.stroke();
      ctx.fillStyle='#ff8e73';ctx.beginPath();ctx.ellipse(-2,13,7,3.8,-.18,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.moveTo(-8,13);ctx.lineTo(-13,9);ctx.lineTo(-13,17);ctx.closePath();ctx.fill();
      ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(2,12,1,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#f2c56b';ctx.beginPath();ctx.ellipse(0,-r*.75,13,5.5,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#c69b49';ctx.fillRect(-7,-r*.96,14,5);
    }else if(t.type==='sniper'){
      const sp=sniperPaths(t);
      ctx.fillStyle=sp[1]>=1?'#41364f':'#546b55';ctx.strokeStyle=accent;ctx.lineWidth=1.8;ctx.beginPath();ctx.arc(0,-r*.52,r*.75,Math.PI,0);ctx.lineTo(r*.92,-r*.34);ctx.lineTo(-r*.75,-r*.34);ctx.closePath();ctx.fill();ctx.stroke();
      drawSniperRifle(r,sp,accent);
      if(sp[1]>=1){ctx.fillStyle='#c58cff';ctx.globalAlpha=.9;ctx.fillRect(-r*.72,-r*.48,r*1.44,4);ctx.globalAlpha=1;}
      if(sp[1]>=3){ctx.font='11px Segoe UI Emoji,Segoe UI Symbol';ctx.textAlign='center';ctx.fillText('🎯',-r*.72,18);}
      if(sp[2]>=1){ctx.strokeStyle='#70caea';ctx.lineWidth=1.8;ctx.beginPath();ctx.moveTo(-5,-r-3);ctx.lineTo(-5,-r-14);ctx.stroke();ctx.fillStyle='#70caea';ctx.beginPath();ctx.arc(-5,-r-16,3,0,Math.PI*2);ctx.fill();}
      if(sp[2]>=2){ctx.strokeStyle='#70caea';ctx.globalAlpha=.75;ctx.beginPath();ctx.arc(-5,-r-16,7,-.7,.7);ctx.stroke();ctx.beginPath();ctx.arc(-5,-r-16,11,-.55,.55);ctx.stroke();ctx.globalAlpha=1;}
      if(sp[2]>=5){ctx.font='12px Segoe UI Emoji,Segoe UI Symbol';ctx.textAlign='center';ctx.fillText('✈️',r*.75,-r-10);}
    }else if(t.type==='demonking'){
      const dp=demonkingPaths(t);
      // Coroa, chifres e capa mais legíveis para a skin não ficar estranha.
      ctx.fillStyle='#1a1322';ctx.strokeStyle='#6a2f46';ctx.lineWidth=1.7;ctx.beginPath();ctx.roundRect(-r*.8,6,r*1.6,r,6);ctx.fill();ctx.stroke();
      ctx.fillStyle='#5b1832';ctx.beginPath();ctx.moveTo(-r*.82,8);ctx.lineTo(-r-12,20);ctx.lineTo(-r*.4,24);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(r*.82,8);ctx.lineTo(r+12,20);ctx.lineTo(r*.4,24);ctx.closePath();ctx.fill();
      ctx.fillStyle='#23111b';for(const side of[-1,1]){ctx.beginPath();ctx.moveTo(side*r*.48,-r*.62);ctx.lineTo(side*r*.9,-r-9);ctx.lineTo(side*r*.28,-r*.42);ctx.closePath();ctx.fill();}
      ctx.strokeStyle='#f0ca73';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(-7,-r-2);ctx.lineTo(-3,-r-11);ctx.lineTo(0,-r-5);ctx.lineTo(3,-r-12);ctx.lineTo(7,-r-2);ctx.stroke();
      ctx.fillStyle='#f0ca73';ctx.beginPath();ctx.arc(0,-r-5,2.1,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle='#d45cff';ctx.lineWidth=2.2;ctx.shadowColor='#a64dff';ctx.shadowBlur=9;ctx.beginPath();ctx.arc(0,-3,r+8,now*.9,now*.9+Math.PI*1.55);ctx.stroke();ctx.shadowBlur=0;
      ctx.fillStyle='#a64dff';ctx.globalAlpha=.82;ctx.beginPath();ctx.arc(r+12,-10,6,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(r+17,-19,3,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
      if(dp[0]>=2){ctx.strokeStyle='#ff7ad9';ctx.globalAlpha=.75;ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(0,-3,r+13,-.4,Math.PI*1.2);ctx.stroke();ctx.globalAlpha=1;}
      if(dp[1]>=2){ctx.fillStyle='#ff8a63';for(const [x,y] of [[-r*.55,r*.28],[r*.55,r*.28],[0,r*.62]]){ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x-3,y-9,x,y-14);ctx.quadraticCurveTo(x+3,y-9,x,y);ctx.fill();}}
      if(dp[2]>=2){ctx.strokeStyle='#b88cff';ctx.globalAlpha=.7;ctx.lineWidth=1.3;ctx.beginPath();ctx.arc(0,3,r*.95+8,.1,Math.PI*.72);ctx.stroke();ctx.globalAlpha=1;ctx.fillStyle='#d4b0ff';ctx.font='900 12px Segoe UI Symbol';ctx.textAlign='center';ctx.fillText('♜',-r*.82,17);ctx.fillText('♜',r*.82,17);}
    }
    ctx.restore();
    if(lv>=2){
      ctx.strokeStyle=accent;ctx.lineWidth=2;ctx.globalAlpha=.85;
      ctx.beginPath();ctx.arc(0,7,r*.78,.15,Math.PI-.15);ctx.stroke();ctx.globalAlpha=1;
      ctx.fillStyle=accent;ctx.globalAlpha=.9;
      const spin=now*(1.1+lv*.18);
      for(let i=0;i<lv-1;i++){
        const a=spin+i*(Math.PI*2/Math.max(1,lv-1));
        ctx.beginPath();ctx.arc(Math.cos(a)*(r+8),Math.sin(a)*(r+8),1.7+lv*.2,0,Math.PI*2);ctx.fill();
      }
      ctx.globalAlpha=1;
    }
    if(mastered){ctx.save();ctx.globalAlpha=.9;ctx.strokeStyle='#ffe48a';ctx.lineWidth=2.3;ctx.beginPath();ctx.arc(0,-3,r+8,0,Math.PI*2);ctx.stroke();ctx.font='13px Segoe UI Emoji';ctx.textAlign='center';ctx.fillText('⭐',0,-r-13);ctx.restore();}
    if(t.type!=='frost'&&((t.type==='dart'&&dartTier>=DART_MAX_TIER)||(t.type==='sniper'&&sniperTier>=SNIPER_MAX_TIER)||(t.type==='vine'&&vineTier>=VINE_MAX_TIER)||(t.type==='burst'&&burstTier>=BURST_MAX_TIER)||(t.type==='ninja'&&ninjaTier>=NINJA_MAX_TIER)||(t.type==='laser'&&laserTier>=LASER_MAX_TIER)||(t.type==='wizard'&&wizardTier>=WIZARD_MAX_TIER)||(t.type==='electric'&&electricTier>=ELECTRIC_MAX_TIER)||(t.type==='demonking'&&demonTier>=DEMONKING_MAX_TIER)||(!['dart','sniper','vine','burst','ninja','laser','wizard','electric','demonking'].includes(t.type)&&lv>=MAX_LEVEL))){
      ctx.save();ctx.translate(0,-r-15);ctx.font='13px Segoe UI,Arial';ctx.textAlign='center';ctx.fillText('👑',0,0);ctx.restore();
    }
    ctx.restore();
    // Indicadores compactos acima da cabeça: aparecem/somem em tempo real conforme a aura,
    // Herói ou Poder global entra e sai de efeito.
    drawBuffBadges(t.x,t.y-r-18,activeTowerBuffLabels(t,st));
    if((t.stunTimer||0)>0){ctx.fillStyle='#ffe0a6';ctx.font='900 13px Segoe UI Emoji,Segoe UI Symbol';ctx.textAlign='center';ctx.fillText('😵',t.x,t.y-r-42);}
    ctx.fillStyle='#f6f4ff';ctx.font='800 9px Segoe UI,Arial';ctx.textAlign='center';
    ctx.fillText(t.type==='dart'?`${dartTier>=DART_MAX_TIER?'★':''}T${dartTier}`:t.type==='sniper'?`${sniperTier>=SNIPER_MAX_TIER?'★':''}T${sniperTier}`:t.type==='frost'?`${frostTier>=FROST_MAX_TIER?'★':''}T${frostTier}`:t.type==='vine'?`${vineTier>=VINE_MAX_TIER?'★':''}T${vineTier}`:t.type==='burst'?`${burstTier>=BURST_MAX_TIER?'★':''}T${burstTier}`:t.type==='ninja'?`${ninjaTier>=NINJA_MAX_TIER?'★':''}T${ninjaTier}`:t.type==='laser'?`${laserTier>=LASER_MAX_TIER?'★':''}T${laserTier}`:t.type==='wizard'?`${wizardTier>=WIZARD_MAX_TIER?'★':''}T${wizardTier}`:t.type==='electric'?`${electricTier>=ELECTRIC_MAX_TIER?'★':''}T${electricTier}`:t.type==='demonking'?`${demonTier>=DEMONKING_MAX_TIER?'★':''}T${demonTier}`:`${lv>=MAX_LEVEL?'★':''}L${lv}`,t.x,t.y+r+15);
  }

function drawTree(x,y,s=1,night=false){
  ctx.save();ctx.translate(x,y);ctx.scale(s,s);
  // tronco largo e galhos visíveis — não é mais só um retângulo marrom solto.
  const trunk=ctx.createLinearGradient(-7,0,8,0);trunk.addColorStop(0,night?'#2d211d':'#3d291f');trunk.addColorStop(.55,night?'#5a3a2b':'#6a432d');trunk.addColorStop(1,night?'#33231e':'#432c22');
  ctx.fillStyle=trunk;ctx.beginPath();ctx.moveTo(-6,27);ctx.lineTo(-4,-8);ctx.lineTo(5,-9);ctx.lineTo(7,27);ctx.closePath();ctx.fill();
  ctx.strokeStyle=night?'#4d3328':'#61402d';ctx.lineWidth=4;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(-15,-15);ctx.moveTo(1,-3);ctx.lineTo(16,-17);ctx.moveTo(0,-9);ctx.lineTo(0,-28);ctx.stroke();
  const dark=night?'#153126':'#17422f',mid=night?'#214b38':'#245e40',light=night?'#2e6247':'#327552';
  const blobs=[[-15,-25,17,dark],[10,-29,19,mid],[-2,-41,22,mid],[-24,-10,16,dark],[21,-12,17,dark],[0,-15,22,light]];
  for(const [dx,dy,r,c] of blobs){const g=ctx.createRadialGradient(dx-5,dy-6,2,dx,dy,r);g.addColorStop(0,light);g.addColorStop(.55,c);g.addColorStop(1,dark);ctx.fillStyle=g;ctx.beginPath();ctx.arc(dx,dy,r,0,Math.PI*2);ctx.fill();}
  ctx.globalAlpha=.35;ctx.fillStyle='#b9e4a1';for(const [dx,dy] of [[-12,-35],[5,-47],[18,-24],[-25,-18]]){ctx.beginPath();ctx.arc(dx,dy,3,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;
  ctx.restore();
}
function drawPine(x,y,s=1){
  ctx.save();ctx.translate(x,y);ctx.scale(s,s);
  ctx.fillStyle='#3e2d27';ctx.fillRect(-3,0,6,28);
  ctx.fillStyle='#1a372c';
  for(const [yy,w] of [[-25,16],[-10,22],[5,27]]){ctx.beginPath();ctx.moveTo(0,yy-20);ctx.lineTo(-w,yy+8);ctx.lineTo(w,yy+8);ctx.closePath();ctx.fill();}
  ctx.restore();
}

function drawRock(x,y,s=1){
  ctx.save();ctx.translate(x,y);ctx.scale(s,s);
  ctx.fillStyle='#48515a';ctx.strokeStyle='#68737d';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(-13,8);ctx.lineTo(-8,-5);ctx.lineTo(3,-10);ctx.lineTo(14,-2);ctx.lineTo(11,10);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.restore();
}

function drawLamp(x,y,h=56){
  ctx.save();
  const glow=ctx.createRadialGradient(x,y-h,2,x,y-h,34);glow.addColorStop(0,'#ffe7a999');glow.addColorStop(1,'#ffe7a900');ctx.fillStyle=glow;ctx.fillRect(x-36,y-h-36,72,72);
  ctx.strokeStyle='#707985';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y-h);ctx.stroke();
  ctx.fillStyle='#f8d67d';ctx.beginPath();ctx.arc(x,y-h,4.5,0,Math.PI*2);ctx.fill();
  ctx.restore();
}

function drawBlockingObstacle(o){
  ctx.save();
  ctx.fillStyle='#00000040';ctx.beginPath();ctx.ellipse(o.x,o.y+o.r*.55,o.r*.82,o.r*.28,0,0,Math.PI*2);ctx.fill();
  if(o.type==='tree')drawTree(o.x,o.y,o.r/26,true);
  else if(o.type==='pine')drawPine(o.x,o.y,o.r/27);
  else drawRock(o.x,o.y,o.r/18);
  ctx.strokeStyle='#ffd36b55';ctx.lineWidth=1;ctx.setLineDash([3,5]);ctx.beginPath();ctx.arc(o.x,o.y,o.r,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
  ctx.restore();
}

function drawMap(){
  const map=currentMap();
  const sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,map.sky[0]);sky.addColorStop(1,map.sky[1]);ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);

  // Luz principal / céu
  if(state.map==='grove'){
    const moon=ctx.createRadialGradient(760,82,4,760,82,95);moon.addColorStop(0,'#fff1bddd');moon.addColorStop(.23,'#f3d98766');moon.addColorStop(1,'#f3d98700');ctx.fillStyle=moon;ctx.fillRect(650,-20,220,220);
    ctx.fillStyle='#e9e2ba';ctx.beginPath();ctx.arc(760,82,24,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=map.ground;ctx.fillRect(0,H*.46,W,H*.54);
    for(let i=0;i<10;i++){const x=(i*109+24)%W,y=270+((i*67)%210);drawTree(x,y,.72+(i%3)*.12);}
    for(let i=0;i<18;i++){const x=(i*71+55)%W,y=245+((i*47)%245);ctx.fillStyle=i%2?'#d9ff9a99':'#ffe69a88';ctx.beginPath();ctx.arc(x,y,1.6,0,Math.PI*2);ctx.fill();}
    // flores / cogumelos
    for(let i=0;i<10;i++){const x=(i*89+35)%W,y=315+((i*61)%180);ctx.fillStyle=i%2?'#ffb5d1':'#a9d8ff';ctx.beginPath();ctx.arc(x,y,2.2,0,Math.PI*2);ctx.fill();}
  }else if(state.map==='ridge'){
    const moon=ctx.createRadialGradient(795,74,2,795,74,80);moon.addColorStop(0,'#dbe3ff99');moon.addColorStop(1,'#dbe3ff00');ctx.fillStyle=moon;ctx.fillRect(710,-10,180,180);
    ctx.fillStyle='#dce1f1aa';ctx.beginPath();ctx.arc(795,74,20,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#25253a';
    for(let i=0;i<7;i++){const x=i*165-55,h=85+(i%3)*38;ctx.beginPath();ctx.moveTo(x,H*.47);ctx.lineTo(x+85,H*.47-h);ctx.lineTo(x+180,H*.47);ctx.closePath();ctx.fill();}
    ctx.fillStyle='#303349';
    for(let i=0;i<6;i++){const x=i*185-70,h=55+(i%2)*28;ctx.beginPath();ctx.moveTo(x,H*.47);ctx.lineTo(x+90,H*.47-h);ctx.lineTo(x+190,H*.47);ctx.closePath();ctx.fill();}
    ctx.fillStyle=map.ground;ctx.fillRect(0,H*.47,W,H*.53);
    for(let i=0;i<11;i++){const x=(i*79+19)%W,y=278+((i*53)%220);drawPine(x,y,.62+(i%4)*.09);}
    for(let i=0;i<4;i++)drawRock((i*123+40)%W,320+((i*43)%165),.7+(i%3)*.12);
    const mist=ctx.createLinearGradient(0,260,0,430);mist.addColorStop(0,'#c8d4e000');mist.addColorStop(.45,'#b9c8d112');mist.addColorStop(1,'#b9c8d100');ctx.fillStyle=mist;ctx.fillRect(0,220,W,230);
  }else if(state.map==='toll'){
    const moon=ctx.createRadialGradient(810,70,2,810,70,70);moon.addColorStop(0,'#b9c8ff77');moon.addColorStop(1,'#b9c8ff00');ctx.fillStyle=moon;ctx.fillRect(735,-5,160,160);
    ctx.fillStyle='#bdc8e6aa';ctx.beginPath();ctx.arc(810,70,18,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#15192a';
    for(let i=0;i<19;i++){
      const x=i*55-10,y=70+(i%4)*17,h=92+(i%5)*16;ctx.fillRect(x,y,42,h);
      ctx.fillStyle='#f3bf6730';
      for(let wy=y+15;wy<y+h-8;wy+=18)for(let wx=x+7;wx<x+35;wx+=12)if(((wx+wy+i)%3)!==0)ctx.fillRect(wx,wy,4,6);
      ctx.fillStyle='#15192a';
    }
    ctx.fillStyle=map.ground;ctx.fillRect(0,H*.49,W,H*.51);
    // Cabine do pedágio no miolo da praça ao redor da qual a rota faz a volta.
    ctx.fillStyle='#737984';ctx.fillRect(347,270,7,68);ctx.fillStyle='#a87aff';ctx.fillRect(312,266,76,9);
    ctx.fillStyle='#f3f3fa';ctx.font='800 10px Segoe UI,Arial';ctx.textAlign='center';ctx.fillText('PEDÁGIO',350,258);
    drawLamp(360,110,62);drawLamp(560,415,62);drawLamp(150,235,62);drawLamp(740,490,62);
  }else if(state.map==='meadow'){
    ctx.fillStyle=map.ground;ctx.fillRect(0,H*.40,W,H*.60);
    const sun=ctx.createRadialGradient(835,75,4,835,75,100);sun.addColorStop(0,'#fff4b999');sun.addColorStop(1,'#fff4b900');ctx.fillStyle=sun;ctx.fillRect(720,-30,230,220);
    for(let i=0;i<12;i++)drawTree((i*97+35)%W,300+((i*61)%250),.50+(i%3)*.08);
    ctx.fillStyle='#ffd98a';for(let i=0;i<28;i++){ctx.globalAlpha=.4;ctx.beginPath();ctx.arc((i*83+17)%W,285+((i*47)%285),1.5,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;
  }else if(state.map==='creek'){
    ctx.fillStyle=map.ground;ctx.fillRect(0,H*.38,W,H*.62);
    ctx.strokeStyle='#3e8ea8aa';ctx.lineWidth=26;ctx.beginPath();ctx.moveTo(0,520);ctx.bezierCurveTo(250,420,380,560,560,470);ctx.bezierCurveTo(740,380,860,510,W,430);ctx.stroke();
    ctx.strokeStyle='#79c9d9aa';ctx.lineWidth=3;ctx.stroke();
    for(let i=0;i<9;i++)drawTree((i*127+40)%W,270+((i*73)%250),.52+(i%3)*.08);
  }else if(state.map==='garden'){
    ctx.fillStyle=map.ground;ctx.fillRect(0,H*.40,W,H*.60);
    for(let i=0;i<8;i++){const x=(i*145+45)%W,y=295+((i*83)%245);drawTree(x,y,.48+(i%2)*.08);drawLamp(x+28,y+15,40);}
    ctx.fillStyle='#ffb8dc';for(let i=0;i<18;i++){ctx.globalAlpha=.35;ctx.beginPath();ctx.arc((i*61+20)%W,300+((i*39)%260),2,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;
  }else if(state.map==='harbor'){
    ctx.fillStyle='#0c3140';ctx.fillRect(0,H*.36,W,H*.64);ctx.fillStyle=map.ground;ctx.fillRect(0,H*.55,W,H*.45);
    ctx.fillStyle='#35536a';for(let i=0;i<7;i++){const x=i*165+25;ctx.fillRect(x,250,105,45);ctx.fillStyle=i%2?'#915e4c':'#466f78';ctx.fillRect(x+8,258,89,29);ctx.fillStyle='#35536a';}
    ctx.strokeStyle='#8fb8c2';ctx.lineWidth=3;for(let i=0;i<6;i++){const x=i*190+70;ctx.beginPath();ctx.moveTo(x,215);ctx.lineTo(x,150);ctx.lineTo(x+28,180);ctx.stroke();}
  }else if(state.map==='ruins'){
    ctx.fillStyle=map.ground;ctx.fillRect(0,H*.36,W,H*.64);ctx.fillStyle='#5a5848';
    for(let i=0;i<8;i++){const x=(i*139+35)%W,y=285+((i*73)%235);ctx.fillRect(x,y-42,9,42);ctx.fillRect(x-8,y-46,25,7);}
    ctx.fillStyle='#a8b08a33';for(let i=0;i<16;i++){ctx.beginPath();ctx.arc((i*71+15)%W,300+((i*47)%260),8+(i%3)*3,0,Math.PI*2);ctx.fill();}
  }else if(state.map==='factory'){
    ctx.fillStyle=map.ground;ctx.fillRect(0,H*.34,W,H*.66);ctx.fillStyle='#202a33';
    for(let i=0;i<7;i++){const x=i*170-20,h=90+(i%3)*25;ctx.fillRect(x,125,135,h);ctx.fillStyle='#ffc95a44';for(let wx=x+14;wx<x+120;wx+=25)ctx.fillRect(wx,145,9,12);ctx.fillStyle='#202a33';}
    ctx.strokeStyle='#697783';ctx.lineWidth=5;for(let i=0;i<6;i++){const x=i*190+30;ctx.beginPath();ctx.moveTo(x,330);ctx.lineTo(x+80,330);ctx.stroke();}
  }else if(state.map==='canyon'){
    // Desfiladeiro Escaldante: sol baixo, mesas empilhadas em tons quentes e neblina de calor.
    const sun=ctx.createRadialGradient(150,90,4,150,90,140);sun.addColorStop(0,'#ffd9a3cc');sun.addColorStop(.3,'#ff9a5555');sun.addColorStop(1,'#ff9a5500');ctx.fillStyle=sun;ctx.fillRect(10,-40,280,280);
    ctx.fillStyle='#ffe3b0';ctx.beginPath();ctx.arc(150,90,26,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#4a2318';
    for(let i=0;i<6;i++){const x=i*180-40,h=100+(i%3)*40,mw=150+(i%2)*30;ctx.beginPath();ctx.moveTo(x,H*.42);ctx.lineTo(x+30,H*.42-h);ctx.lineTo(x+30+mw,H*.42-h);ctx.lineTo(x+30+mw+30,H*.42);ctx.closePath();ctx.fill();}
    ctx.fillStyle='#622c1d';
    for(let i=0;i<5;i++){const x=i*200-30,h=60+(i%2)*30,mw=110+(i%3)*20;ctx.beginPath();ctx.moveTo(x,H*.44);ctx.lineTo(x+20,H*.44-h);ctx.lineTo(x+20+mw,H*.44-h);ctx.lineTo(x+20+mw+20,H*.44);ctx.closePath();ctx.fill();}
    ctx.fillStyle=map.ground;ctx.fillRect(0,H*.44,W,H*.56);
    for(let i=0;i<7;i++)drawRock((i*137+45)%W,300+((i*61)%180),.75+(i%3)*.14);
    ctx.strokeStyle='#8a6a4a99';ctx.lineWidth=1.4;
    for(let i=0;i<14;i++){const x=(i*83+30)%W,y=260+((i*53)%230);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y-8-(i%3)*3);ctx.moveTo(x-3,y-4);ctx.lineTo(x+3,y-4);ctx.stroke();}
    const haze=ctx.createLinearGradient(0,H*.35,0,H*.6);haze.addColorStop(0,'#ffb56b00');haze.addColorStop(.5,'#ffb56b1a');haze.addColorStop(1,'#ffb56b00');ctx.fillStyle=haze;ctx.fillRect(0,H*.35,W,H*.25);
  }else if(state.map==='fork'){
    // Vale Bifurcado: crepúsculo sobre uma cordilheira central que separa as duas trilhas.
    const dusk=ctx.createRadialGradient(850,70,4,850,70,170);dusk.addColorStop(0,'#ffb7e0aa');dusk.addColorStop(.35,'#c98cff55');dusk.addColorStop(1,'#c98cff00');ctx.fillStyle=dusk;ctx.fillRect(700,-70,340,340);
    ctx.fillStyle='#f3d7ff';ctx.beginPath();ctx.arc(850,70,20,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=map.ground;ctx.fillRect(0,H*.09,W,H*.91);
    ctx.fillStyle='#241c38';
    for(let i=0;i<9;i++){const x=i*140-40,h=62+(i%3)*24;ctx.beginPath();ctx.moveTo(x,H*.58);ctx.lineTo(x+70,H*.58-h);ctx.lineTo(x+140,H*.58);ctx.closePath();ctx.fill();}
    ctx.fillStyle='#33284a';
    for(let i=0;i<8;i++){const x=i*155-30,h=38+(i%2)*18;ctx.beginPath();ctx.moveTo(x,H*.62);ctx.lineTo(x+75,H*.62-h);ctx.lineTo(x+150,H*.62);ctx.closePath();ctx.fill();}
    for(let i=0;i<7;i++)drawTree((i*131+40)%W,58+((i*41)%68),.56+(i%3)*.1);
    for(let i=0;i<7;i++)drawRock((i*141+55)%W,542+((i*47)%58),.64+(i%3)*.12);
  }else if(state.map==='storm'){
    ctx.fillStyle=map.ground;ctx.fillRect(0,H*.08,W,H*.92);
    ctx.fillStyle='#10182a';for(let i=0;i<9;i++){const x=i*145-30,h=55+(i%3)*25;ctx.beginPath();ctx.moveTo(x,H*.54);ctx.lineTo(x+70,H*.54-h);ctx.lineTo(x+145,H*.54);ctx.closePath();ctx.fill();}
    ctx.strokeStyle='#8fcfff55';ctx.lineWidth=2;for(let i=0;i<7;i++){const x=(i*173+70)%W;ctx.beginPath();ctx.moveTo(x,20);ctx.lineTo(x-18,85);ctx.lineTo(x+3,85);ctx.lineTo(x-12,142);ctx.stroke();}
    const rain=performance.now()/14;ctx.strokeStyle='#a9d9ff2f';ctx.lineWidth=1.2;for(let i=0;i<55;i++){const x=(i*97+rain)%W,y=(i*53+rain*1.6)%H;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-8,y+18);ctx.stroke();}
  }else if(state.map==='blind'){
    // Passagem Cega: neblina espessa o tempo todo — a visão curta das torres é o ponto do mapa.
    ctx.fillStyle=map.ground;ctx.fillRect(0,H*.08,W,H*.92);
    for(let i=0;i<9;i++)drawRock((i*133+35)%W,90+((i*53)%70),.6+(i%3)*.12);
    for(let i=0;i<9;i++)drawPine((i*147+60)%W,520+((i*49)%80),.58+(i%3)*.12);
    const fogBands=[[0,'2e'],[H*.16,'22'],[H*.34,'2a'],[H*.52,'20'],[H*.7,'2a'],[H*.86,'1c']];
    fogBands.forEach(([y,alphaHex])=>{
      const fog=ctx.createLinearGradient(0,y,0,y+120);fog.addColorStop(0,'#c3ccd600');fog.addColorStop(.5,'#c3ccd6'+alphaHex);fog.addColorStop(1,'#c3ccd600');
      ctx.fillStyle=fog;ctx.fillRect(0,y,W,120);
    });
  }else{
    ctx.fillStyle=map.ground;ctx.fillRect(0,H*.47,W,H*.53);
  }

  // Estrada com sombra, acostamento, asfalto e faixa central — desenhada para CADA
  // rota do mapa (mapas de uma rota só têm `pathsList.length===1`, sem mudança visual).
  ctx.lineCap='round';ctx.lineJoin='round';
  pathsList.forEach(p=>{
    ctx.shadowColor='#000a';ctx.shadowBlur=16;ctx.lineWidth=62;ctx.strokeStyle='#0006';ctx.beginPath();p.forEach((pt,i)=>i?ctx.lineTo(pt.x,pt.y):ctx.moveTo(pt.x,pt.y));ctx.stroke();ctx.shadowBlur=0;
    ctx.lineWidth=56;ctx.strokeStyle=map.shoulder;ctx.beginPath();p.forEach((pt,i)=>i?ctx.lineTo(pt.x,pt.y):ctx.moveTo(pt.x,pt.y));ctx.stroke();
    ctx.lineWidth=40;ctx.strokeStyle=map.road;ctx.beginPath();p.forEach((pt,i)=>i?ctx.lineTo(pt.x,pt.y):ctx.moveTo(pt.x,pt.y));ctx.stroke();
    ctx.setLineDash([16,18]);ctx.lineWidth=3;ctx.strokeStyle='#f0e4c5aa';ctx.beginPath();p.forEach((pt,i)=>i?ctx.lineTo(pt.x,pt.y):ctx.moveTo(pt.x,pt.y));ctx.stroke();ctx.setLineDash([]);
  });

  // Pequenos marcadores luminosos.
  totalsList.forEach((pathLen,pathIndex)=>{
    for(let d=45;d<pathLen;d+=115){const p=pointAt(d,pathIndex);ctx.fillStyle=state.map==='toll'?'#f3bf67aa':state.map==='canyon'?'#ffb36bcc':'#b7e7d2aa';ctx.beginPath();ctx.arc(p.x,p.y,2,0,Math.PI*2);ctx.fill();}
  });

  // Obstáculos grandes: estes bloqueiam de verdade a linha de visão dos gatinhos.
  currentObstacles().forEach(drawBlockingObstacle);

  // Vinheta e iluminação final.
  const vignette=ctx.createRadialGradient(W/2,H/2,160,W/2,H/2,610);vignette.addColorStop(.45,'#0000');vignette.addColorStop(1,'#0000007a');ctx.fillStyle=vignette;ctx.fillRect(0,0,W,H);
}


function drawEnemy(e){
    const p=pointAt(e.d,e.path),isBoss=e.kind==='boss';
    const baseR=14+Math.min(8,Math.log2(Math.max(2,e.maxHp+1))*1.7)+(e.elite?2:0);
    let r=baseR;
    if(isBoss)r=32;
    else if(e.kind==='camoArmored')r=baseR+4;
    else if(e.kind==='heavyArmored')r=baseR+5;
    else if(e.armored)r=baseR+3;
    const t=performance.now()/1000;
    ctx.save();ctx.translate(p.x,p.y);
    if(isBoss){
      // Boss visual: um dirigível/carrinho voador, bem maior e imediatamente reconhecível.
      const bob=Math.sin(t*3+e.id)*2.2;
      ctx.translate(0,bob);
      const glow=ctx.createRadialGradient(0,0,10,0,0,72);glow.addColorStop(0,'#ffcf6b55');glow.addColorStop(1,'#ffcf6b00');ctx.fillStyle=glow;ctx.fillRect(-78,-58,156,116);
      // envelope do dirigível
      const body=ctx.createLinearGradient(0,-28,0,25);body.addColorStop(0,'#d95b68');body.addColorStop(.55,'#9f3447');body.addColorStop(1,'#6e2535');
      ctx.fillStyle=body;ctx.strokeStyle='#ffd36b';ctx.lineWidth=3.5;ctx.beginPath();ctx.ellipse(0,-8,54,25,0,0,Math.PI*2);ctx.fill();ctx.stroke();
      ctx.strokeStyle='#ffd36b88';ctx.lineWidth=1.3;for(const off of [-26,0,26]){ctx.beginPath();ctx.ellipse(off*.25,-8,Math.max(12,54-Math.abs(off)),23,0,0,Math.PI*2);ctx.stroke();}
      // cauda e estabilizadores
      ctx.fillStyle='#7d2b3a';ctx.beginPath();ctx.moveTo(-49,-8);ctx.lineTo(-70,-24);ctx.lineTo(-62,-5);ctx.lineTo(-72,9);ctx.closePath();ctx.fill();ctx.strokeStyle='#ffd36b';ctx.stroke();
      // cabine/carrinho voador pendurado
      ctx.fillStyle='#242b34';ctx.strokeStyle='#cfd9e0';ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(-24,17,48,18,6);ctx.fill();ctx.stroke();
      ctx.fillStyle='#8fd9ef';ctx.globalAlpha=.75;ctx.fillRect(-15,21,10,6);ctx.fillRect(5,21,10,6);ctx.globalAlpha=1;
      ctx.strokeStyle='#7b8790';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-17,15);ctx.lineTo(-11,5);ctx.moveTo(17,15);ctx.lineTo(11,5);ctx.stroke();
      // hélices
      for(const x of [-30,30]){ctx.save();ctx.translate(x,34);ctx.rotate(t*8+(x<0?0:1));ctx.strokeStyle='#d7dde2';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-11,0);ctx.lineTo(11,0);ctx.moveTo(0,-11);ctx.lineTo(0,11);ctx.stroke();ctx.restore();ctx.fillStyle='#555f68';ctx.beginPath();ctx.arc(x,34,3,0,Math.PI*2);ctx.fill();}
      ctx.font='900 15px Segoe UI Emoji,Segoe UI Symbol';ctx.textAlign='center';ctx.fillText('👑',0,-37);
      ctx.fillStyle='#fff';ctx.font='900 8px Segoe UI,Arial';ctx.fillText('BOSS',0,31);
    }else if(e.kind==='healer'){
      const tc=tierOf(e.hp);ctx.fillStyle=tc.color;ctx.strokeStyle=e.elite?'#ffd36b':'#8dffad';ctx.lineWidth=e.elite?3:2.5;ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();ctx.stroke();
      ctx.fillStyle='#fff';ctx.font='900 13px Segoe UI Emoji,Segoe UI Symbol';ctx.textAlign='center';ctx.fillText('❤️',0,5);ctx.strokeStyle='#62d88788';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,r+5+Math.sin(t*4)*2,0,Math.PI*2);ctx.stroke();
    }else if(e.kind==='trickster'){
      const tc=tierOf(e.hp);ctx.fillStyle=tc.color;ctx.strokeStyle=e.elite?'#ffd36b':'#ffbf88';ctx.lineWidth=e.elite?3:2.5;ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.font='900 14px Segoe UI Emoji,Segoe UI Symbol';ctx.textAlign='center';ctx.fillText('🤡',0,5);ctx.fillStyle='#ff9f5d';ctx.beginPath();ctx.moveTo(-4,r-1);ctx.lineTo(4,r-1);ctx.lineTo(0,r+7);ctx.closePath();ctx.fill();
    }else if(e.kind==='jester'){
      ctx.fillStyle='#ce78ff';ctx.strokeStyle='#ffe36e';ctx.lineWidth=2.6;ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.font='900 14px Segoe UI Emoji,Segoe UI Symbol';ctx.textAlign='center';ctx.fillText('🃏',0,5);ctx.font='900 10px Segoe UI,Arial';ctx.fillStyle='#ffe36e';ctx.fillText('$',0,-r-5);
    }else if(e.kind==='angel'){
      const tc=tierOf(e.hp);ctx.fillStyle=tc.color;ctx.strokeStyle=e.elite?'#ffd36b':'#fff2a8';ctx.lineWidth=e.elite?3:2.5;ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.strokeStyle='#fff2a8';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,-r-5,r*.55,3,0,0,Math.PI*2);ctx.stroke();ctx.font='12px Segoe UI Emoji,Segoe UI Symbol';ctx.textAlign='center';ctx.fillText('😇',0,5);
    }else if(e.kind==='demon'){
      const growth=(e.baseMaxHp||e.maxHp)>0?Math.max(1,e.maxHp/(e.baseMaxHp||e.maxHp)):1,dr=r+Math.min(6,(growth-1)*6);ctx.fillStyle='#8f3548';ctx.strokeStyle=e.elite?'#ffd36b':'#ff7585';ctx.lineWidth=e.elite?3:2.8;ctx.beginPath();ctx.arc(0,0,dr,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='#2a1720';ctx.beginPath();ctx.moveTo(-dr*.55,-dr*.45);ctx.lineTo(-dr*.85,-dr-5);ctx.lineTo(-dr*.18,-dr*.62);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(dr*.55,-dr*.45);ctx.lineTo(dr*.85,-dr-5);ctx.lineTo(dr*.18,-dr*.62);ctx.closePath();ctx.fill();ctx.font='13px Segoe UI Emoji,Segoe UI Symbol';ctx.textAlign='center';ctx.fillText('😈',0,5);
    }else if(e.kind==='camoArmored'){
      ctx.fillStyle='#4c6a52';ctx.strokeStyle=e.revealed?'#ffd36b':'#8a9c8f';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();ctx.stroke();
      ctx.fillStyle='#33473a';ctx.beginPath();ctx.arc(0,0,r*.66,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#6b5b3a';ctx.beginPath();ctx.arc(-5,-5,r*.28,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle='#cbd1da';ctx.lineWidth=2;for(let a=0;a<Math.PI*2;a+=Math.PI/2){ctx.beginPath();ctx.arc(Math.cos(a)*r*.7,Math.sin(a)*r*.7,2,0,Math.PI*2);ctx.stroke();}
      ctx.fillStyle='#fff';ctx.font='900 6.5px Segoe UI,Arial';ctx.textAlign='center';ctx.fillText('ARM+CAMO',0,3);
      if(e.revealed){ctx.font='11px Segoe UI,Arial';ctx.fillText('👁',0,-r-6);}
    }else if(e.kind==='heavyArmored'){
      ctx.fillStyle='#454e59';ctx.strokeStyle='#e7c66b';ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();ctx.stroke();
      ctx.fillStyle='#333a43';ctx.beginPath();ctx.arc(0,0,r*.7,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle='#dcc98a';ctx.lineWidth=2;for(let a=Math.PI/4;a<Math.PI*2;a+=Math.PI/2){ctx.beginPath();ctx.arc(Math.cos(a)*r*.74,Math.sin(a)*r*.74,2.4,0,Math.PI*2);ctx.stroke();}
      ctx.fillStyle='#ffe9b0';ctx.font='900 7px Segoe UI,Arial';ctx.textAlign='center';ctx.fillText('PESADO',0,3);
    }else if(e.armored){
      ctx.fillStyle='#77818e';ctx.strokeStyle='#d4d8df';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='#4d5663';ctx.beginPath();ctx.arc(0,0,r*.68,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#cbd1da';ctx.lineWidth=2;for(let a=0;a<Math.PI*2;a+=Math.PI/2){ctx.beginPath();ctx.arc(Math.cos(a)*r*.72,Math.sin(a)*r*.72,2,0,Math.PI*2);ctx.stroke();}ctx.fillStyle='#fff';ctx.font='900 8px Segoe UI,Arial';ctx.textAlign='center';ctx.fillText('ARM',0,3);
    }else if(e.camo){
      const tc=tierOf(e.hp);
      ctx.fillStyle=tc.color;ctx.strokeStyle=e.elite?'#ffd36b':(e.revealed?tc.ring:'#2a2a2a');ctx.lineWidth=e.elite?3:2;ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();ctx.stroke();
      ctx.globalAlpha=.5;ctx.fillStyle='#20301f';ctx.beginPath();ctx.arc(-5,-5,r*.33,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(6,4,r*.38,0,Math.PI*2);ctx.fill();ctx.fillStyle='#3d4a30';ctx.beginPath();ctx.arc(4,-8,r*.20,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
      ctx.fillStyle=tc.color;ctx.beginPath();ctx.moveTo(-4,r-1);ctx.lineTo(4,r-1);ctx.lineTo(0,r+7);ctx.closePath();ctx.fill();
      if(e.revealed){ctx.font='10px Segoe UI,Arial';ctx.textAlign='center';ctx.fillText('👁',0,-r-6);}
    }else if(e.kind==='fast'){
      const tc=tierOf(e.hp);
      ctx.strokeStyle='#fff3b0aa';ctx.lineWidth=2;for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(-r*.4-i*5,-r*.4+i*7);ctx.lineTo(-r*1.1-i*5,-r*.4+i*7);ctx.stroke();}
      ctx.fillStyle=tc.color;ctx.strokeStyle=e.elite?'#ffd36b':tc.ring;ctx.lineWidth=e.elite?3:2;ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();ctx.stroke();
      ctx.fillStyle=tc.color;ctx.beginPath();ctx.moveTo(-4,r-1);ctx.lineTo(4,r-1);ctx.lineTo(0,r+7);ctx.closePath();ctx.fill();
      ctx.fillStyle='#00000088';ctx.font='900 10px Segoe UI,Arial';ctx.textAlign='center';ctx.fillText('⚡',0,4);
    }else if(e.kind==='regen'){
      const tc=tierOf(e.hp);
      ctx.fillStyle=tc.color;ctx.strokeStyle=e.elite?'#ffd36b':tc.ring;ctx.lineWidth=e.elite?3:2;ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();ctx.stroke();
      ctx.fillStyle=tc.color;ctx.beginPath();ctx.moveTo(-4,r-1);ctx.lineTo(4,r-1);ctx.lineTo(0,r+7);ctx.closePath();ctx.fill();
      ctx.fillStyle='#ffffffcc';ctx.fillRect(-1.5,-r*.42,3,r*.84);ctx.fillRect(-r*.42,-1.5,r*.84,3);
      if(e.regenPause<=0){ctx.strokeStyle='#7cffa0aa';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,r+5+Math.sin(t*3)*2,0,Math.PI*2);ctx.stroke();}
    }else{
      const tc=tierOf(e.hp);
      ctx.fillStyle=tc.color;ctx.strokeStyle=e.slowTimer>0?'#c6f6ff':e.elite?'#ffd36b':tc.ring;ctx.lineWidth=e.elite?3:2;ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle=tc.color;ctx.beginPath();ctx.moveTo(-4,r-1);ctx.lineTo(4,r-1);ctx.lineTo(0,r+7);ctx.closePath();ctx.fill();if(e.justUnarmored>performance.now()/1000){ctx.strokeStyle='#ffdd87';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,r+6,0,Math.PI*2);ctx.stroke();}
    }
    if(e.elite&&!e.armored&&!isBoss){ctx.fillStyle='#ffffffbb';ctx.beginPath();ctx.arc(-4,-4,3,0,Math.PI*2);ctx.fill();}
    if((e.hitFlash||0)>0){ctx.save();ctx.globalAlpha=Math.min(.65,e.hitFlash*7);ctx.fillStyle='#ffffff';ctx.beginPath();ctx.arc(0,0,r+2,0,Math.PI*2);ctx.fill();ctx.restore();}
    if((e.divineShield||0)>0){ctx.strokeStyle='#fff2a8';ctx.lineWidth=3;ctx.globalAlpha=.9;ctx.beginPath();ctx.arc(0,0,r+8,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;ctx.font='11px Segoe UI Emoji,Segoe UI Symbol';ctx.textAlign='center';ctx.fillText('🛡️',0,-r-10);}
    if((e.rootTimer||0)>0){
      ctx.strokeStyle='#69d17dcc';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,4,r+5,-.2,Math.PI*1.35);ctx.stroke();
      ctx.strokeStyle='#a4e3aacc';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(0,4,r+9,Math.PI*.7,Math.PI*2.1);ctx.stroke();
      ctx.fillStyle='#7fd88b';for(const a of [.4,1.8,3.4,5.2]){ctx.beginPath();ctx.ellipse(Math.cos(a)*(r+5),4+Math.sin(a)*(r+5),4,2,a,0,Math.PI*2);ctx.fill();}
    }
    ctx.restore();
    if(isBoss){ctx.fillStyle='#ffd36b';ctx.font='900 10px Segoe UI,Arial';ctx.textAlign='center';ctx.fillText(e.name,p.x,p.y-52);}
    const hpHalf=isBoss?52:r;const hpY=isBoss?p.y-43:p.y-r-9;ctx.fillStyle='#0009';ctx.fillRect(p.x-hpHalf,hpY,hpHalf*2,5);ctx.fillStyle=e.hp/e.maxHp>.35?'#4bd6a0':'#ff7180';ctx.fillRect(p.x-hpHalf,hpY,Math.max(0,hpHalf*2*(e.hp/e.maxHp)),5);
  }

function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.save();
  if(state.screenShake>0){const sh=state.screenShake;ctx.translate((Math.random()-.5)*sh,(Math.random()-.5)*sh);}
  drawMap();
  drawParticles();

  state.towers.forEach(drawTower);
  if(state.hero)drawHero(state.hero);
  state.enemies.forEach(e=>{if(!e.dead)drawEnemy(e);});
  drawShadowBloons();
  state.enemies.forEach(e=>{
    if(e.dead||(e.fearTimer||0)<=0)return;
    const p=pointAt(e.d,e.path);ctx.save();ctx.translate(p.x,p.y);ctx.globalAlpha=.82;ctx.strokeStyle='#c56bff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,e.kind==='boss'?32:23,0,Math.PI*2);ctx.stroke();ctx.font='13px Segoe UI Emoji';ctx.textAlign='center';ctx.fillText('😨',0,e.kind==='boss'?-38:-28);ctx.restore();
  });
  state.enemies.forEach(e=>{
    if(e.dead||(e.markTimer||0)<=0)return;
    const p=pointAt(e.d,e.path);
    ctx.save();ctx.translate(p.x,p.y);ctx.strokeStyle='#c8b2ff';ctx.lineWidth=2;ctx.setLineDash([3,3]);
    ctx.beginPath();ctx.arc(0,0,e.kind==='boss'?27:20,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
    ctx.fillStyle='#e9deff';ctx.font='10px Segoe UI,Arial';ctx.textAlign='center';ctx.fillText(`🎯 +${Math.round((e.markBonus||0)*100)}%`,0,-24);ctx.restore();
  });

  state.pulses.forEach(p=>{
    const progress=1-(p.life/p.maxLife),r=p.range*(.25+.75*progress),alpha=Math.max(0,p.life/p.maxLife);
    ctx.save();ctx.globalAlpha=alpha*.75;ctx.strokeStyle=p.color;ctx.lineWidth=4-2*progress;ctx.beginPath();ctx.arc(p.x,p.y,r,0,Math.PI*2);ctx.stroke();
    ctx.globalAlpha=alpha*.10;ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,r,0,Math.PI*2);ctx.fill();ctx.restore();
  });

  state.muzzleFx.forEach(f=>{
    const a=Math.max(0,f.life/f.maxLife);ctx.save();ctx.translate(f.x,f.y);ctx.rotate(f.angle);ctx.globalAlpha=a;
    ctx.fillStyle=f.color;ctx.shadowColor=f.color;ctx.shadowBlur=f.kind==='sniper'?14:9;
    const len=f.kind==='sniper'?22:f.kind==='burst'?16:12;
    ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(len,-4*a);ctx.lineTo(len*1.25,0);ctx.lineTo(len,4*a);ctx.closePath();ctx.fill();ctx.restore();
  });

  state.impactFx.forEach(f=>{
    const a=Math.max(0,f.life/f.maxLife),progress=1-a;ctx.save();ctx.translate(f.x,f.y);ctx.globalAlpha=a;
    ctx.strokeStyle=f.color;ctx.lineWidth=f.big?2.6:1.7;ctx.shadowColor=f.color;ctx.shadowBlur=f.big?10:5;
    ctx.beginPath();ctx.arc(0,0,(f.big?5:3)+progress*(f.big?20:12),0,Math.PI*2);ctx.stroke();
    ctx.fillStyle=f.color;
    for(let i=0;i<f.shards;i++){const ang=f.seed+i*Math.PI*2/f.shards,dist=5+progress*(f.big?18:11);ctx.beginPath();ctx.arc(Math.cos(ang)*dist,Math.sin(ang)*dist,f.big?1.8:1.2,0,Math.PI*2);ctx.fill();}
    ctx.restore();
  });

  state.shots.forEach(s=>{
    const rr=4+Math.min(3,(s.level||1)-1);
    ctx.save();ctx.translate(s.x,s.y);ctx.fillStyle=s.color||'#fff';ctx.strokeStyle=s.color||'#fff';
    if(s.type==='laser'){ctx.shadowColor=s.color;ctx.shadowBlur=8;ctx.fillRect(-7,-1.5,14,3);}
    else if(s.type==='arrow'){ctx.rotate(Math.atan2(s.ty-s.y,s.tx-s.x));ctx.strokeStyle='#c88f4b';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-8,0);ctx.lineTo(8,0);ctx.stroke();ctx.fillStyle='#f3bf67';ctx.beginPath();ctx.moveTo(9,0);ctx.lineTo(3,-3);ctx.lineTo(3,3);ctx.closePath();ctx.fill();}
    else if(s.type==='spear'||s.type==='fireSpear'){ctx.rotate(Math.atan2(s.ty-s.y,s.tx-s.x));ctx.strokeStyle=s.type==='fireSpear'?'#ff8b63':'#d4c29b';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-12,0);ctx.lineTo(10,0);ctx.stroke();ctx.fillStyle=s.type==='fireSpear'?'#ffb35f':'#d9dee5';ctx.beginPath();ctx.moveTo(13,0);ctx.lineTo(5,-4);ctx.lineTo(5,4);ctx.closePath();ctx.fill();if(s.type==='fireSpear'){ctx.shadowColor='#ff6a3d';ctx.shadowBlur=10;ctx.fillStyle='#ff6a3d';ctx.beginPath();ctx.arc(-8,0,3,0,Math.PI*2);ctx.fill();}}
    else if(s.type==='ninja'){ctx.rotate(performance.now()/90);ctx.beginPath();for(let i=0;i<8;i++){const a=i*Math.PI/4,r2=i%2?2:rr+2;ctx.lineTo(Math.cos(a)*r2,Math.sin(a)*r2);}ctx.closePath();ctx.fill();}
    else if(s.type==='sniper'){ctx.shadowColor=s.color;ctx.shadowBlur=7;ctx.fillRect(-9,-1,18,2);}
    else if(s.type==='boomerang'){ctx.rotate(performance.now()/105);ctx.lineWidth=3;ctx.lineCap='round';ctx.beginPath();ctx.arc(0,0,7,-2.4,-.35);ctx.stroke();ctx.beginPath();ctx.arc(0,0,7,.35,2.4);ctx.stroke();}
    else if(s.type==='alchemist'){ctx.shadowColor=s.color;ctx.shadowBlur=7;ctx.beginPath();ctx.arc(0,2,5,0,Math.PI*2);ctx.fill();ctx.fillRect(-2,-6,4,6);ctx.shadowBlur=0;}
    else if(s.type==='chronomancer'){ctx.shadowColor=s.color;ctx.shadowBlur=8;ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,6,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-4);ctx.moveTo(0,0);ctx.lineTo(3,0);ctx.stroke();}
    else{ctx.beginPath();ctx.arc(0,0,rr,0,Math.PI*2);ctx.fill();}
    ctx.restore();
  });

  state.airstrikes.forEach(a=>{
    ctx.save();ctx.translate(a.x,a.y);ctx.font='30px Segoe UI Emoji,Segoe UI Symbol';ctx.textAlign='center';
    ctx.shadowColor='#70caea';ctx.shadowBlur=10;ctx.fillText('✈️',0,0);ctx.shadowBlur=0;ctx.restore();
  });
  state.bombs.forEach(b=>{
    ctx.save();ctx.translate(b.x,b.y);ctx.font='20px Segoe UI Emoji,Segoe UI Symbol';ctx.textAlign='center';
    ctx.shadowColor='#ffb347';ctx.shadowBlur=8;ctx.fillText('💣',0,0);ctx.restore();
  });

  state.lightning.forEach(l=>{
    const alpha=Math.max(0,l.life/l.maxLife);
    ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle=l.color||'#ffe66d';ctx.shadowColor=l.color||'#ffe66d';ctx.lineWidth=l.kind==='arrow'?2:l.kind==='sniperPierce'?2.5:3;ctx.shadowBlur=l.kind==='arrow'?3:l.kind==='sniperPierce'?6:12;
    for(let i=0;i<l.points.length-1;i++){
      const a=l.points[i],b=l.points[i+1];
      if(l.kind==='arrow'||l.kind==='sniperPierce'){
        ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
      }else{
        const mx=(a.x+b.x)/2+(i%2?8:-8),my=(a.y+b.y)/2+(i%2?-7:7);
        ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(mx,my);ctx.lineTo(b.x,b.y);ctx.stroke();
      }
    }
    ctx.restore();
  });

  state.floatTexts.forEach(f=>{
    const a=Math.max(0,f.life/f.maxLife);
    ctx.save();ctx.globalAlpha=a;ctx.fillStyle=f.color;ctx.font='800 12px Segoe UI,Arial';ctx.textAlign='center';
    ctx.shadowColor='#000a';ctx.shadowBlur=3;ctx.fillText(f.text,f.x,f.y);ctx.restore();
  });

  ctx.restore(); // fim do tremor visual do mundo

  if(effectActive('blizzard')){ctx.fillStyle='#b9ecff16';ctx.fillRect(0,0,W,H);}
  if(effectActive('frenzy')){ctx.strokeStyle='#ffd36b66';ctx.lineWidth=5;ctx.strokeRect(2.5,2.5,W-5,H-5);}
  if(effectActive('focus')){ctx.strokeStyle='#ff718066';ctx.lineWidth=3;ctx.strokeRect(8.5,8.5,W-17,H-17);}

  ctx.save();ctx.textAlign='left';ctx.font='800 11px Segoe UI,Arial';ctx.fillStyle='#071019bb';ctx.fillRect(12,12,136,30);ctx.fillStyle='#dceef6';ctx.fillText(`⏩ Velocidade ${state.gameSpeed}×`,22,31);ctx.restore();

  if(state.completed){
    const stars=mapStars(state.map),diff=currentDifficulty();
    ctx.fillStyle='#05050bd4';ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#f3bf67';ctx.font='900 38px Segoe UI,Arial';ctx.textAlign='center';ctx.fillText('🏆 MAPA CONCLUÍDO',W/2,H/2-58);
    ctx.fillStyle='#f6f4ff';ctx.font='800 20px Segoe UI,Arial';ctx.fillText(`${currentMap().name} • ${diff.name}`,W/2,H/2-20);
    ctx.fillStyle='#f3bf67';ctx.font='900 28px Segoe UI,Arial';ctx.fillText('★'.repeat(stars)+'☆'.repeat(3-stars),W/2,H/2+20);
    ctx.fillStyle='#c9d8df';ctx.font='600 13px Segoe UI,Arial';ctx.fillText(`${stars}/3 dificuldades concluídas neste mapa`,W/2,H/2+50);
    ctx.fillText(`Conta: nível ${profile.level} • ${profile.xp}/${requiredXp(profile.level)} XP`,W/2,H/2+72);
  }else if(state.lives<=0){
    ctx.fillStyle='#05050bd4';ctx.fillRect(0,0,W,H);ctx.fillStyle='#f6f4ff';ctx.font='900 34px Segoe UI,Arial';ctx.textAlign='center';ctx.fillText('Fim de jogo',W/2,H/2-8);ctx.font='600 15px Segoe UI,Arial';ctx.fillText('Reinicie e reposicione seus gatinhos.',W/2,H/2+25);
  }
}

function loop(ts){
  if(!state.last)state.last=ts;
  const realDt=Math.min(.05,(ts-state.last)/1000);state.last=ts;
  const simDt=realDt*state.gameSpeed;
  update(simDt,ts);draw();renderPlaytestDebug(ts);requestAnimationFrame(loop);
}

canvas.addEventListener('click',e=>{
  const rect=canvas.getBoundingClientRect(),x=(e.clientX-rect.left)*W/rect.width,y=(e.clientY-rect.top)*H/rect.height;
  if(state.repositionTower){moveRepositionedTower(x,y);return;}
  const hitHero=heroAt(x,y);
  if(hitHero){
    cancelPlacement(true);state.selectedTower=null;state.selectedHero=true;updateUpgradePanel();const hs=heroStats(hitHero),def=HEROES[hitHero.type];
    setMsg(`🦸 ${def.name} • Nv.${hitHero.level}/10 • ${def.role}${def.farm?` • +$${hs.farmIncome}/rodada`:` • Dano ${hs.damage} • Range ${hs.range}`} • eliminações ${hitHero.pops||0}. XP e habilidades ficam no painel HERÓI à direita.`);
    renderHeroHud();return;
  }
  const hit=towerAt(x,y);
  if(hit){
    cancelPlacement(true);state.selectedTower=hit.id;state.selectedHero=false;notifyMatchTutorialAction('towerInspected');renderHeroHud();const st=towerStats(hit);
    const cadence=st.farm?`+$${st.farmIncome} por rodada`:st.rootHold?`recarga ${st.rate.toFixed(1)}s`:`${(1/st.rate).toFixed(1)} ataques/s`;
    setMsg(hit.type==='dart'
      ?`${st.name} selecionado • ${dartPaths(hit).map((v,i)=>`C${i+1}:T${v}`).join(' / ')} • os caminhos estão na aba da direita.`
      :hit.type==='sniper'
        ?`${st.name} selecionado • ${sniperPaths(hit).map((v,i)=>`C${i+1}:T${v}`).join(' / ')} • escolha Atirador, Caçador ou Observador na aba da direita.`
        :st.farm
          ?`${st.name} nível ${hit.level} selecionado. Farm econômico • ${cadence} • upgrades na aba da direita.`
          :`${st.name} nível ${hit.level} selecionado. ${st.rootHold?'Controle':`Dano ${st.damage.toFixed(2)}`} • ${st.globalRange?'range GLOBAL':`range ${st.range}`} • ${cadence}. Upgrades na aba da direita.`);
    updateUpgradePanel();updateStats();return;
  }
  if(state.selectedTower){closeUpgradePanel(true);setMsg('Painel de upgrades fechado. Clique em um gatinho para posicionar ou em uma unidade para abrir seus upgrades.');return;}
  if(state.selectedHero){state.selectedHero=false;renderHeroHud();setMsg('Painel do Herói fechado. Clique no herói em campo para reabrir o XP e as habilidades.');return;}
  if(state.selected==='__hero__'){placeHero(x,y);return;}
  if(state.selected){placeTower(x,y);return;}
  setMsg('Nenhum gatinho ou herói está pronto para posicionar. Selecione uma unidade na barra da direita primeiro.');
});

if($('#td-start'))$('#td-start').onclick=startWave;
if($('#td-reset'))$('#td-reset').onclick=()=>{
  sfx('ui');runMapLoading(state.map,state.difficulty,reset,state.mode);
};
if($('#td-exit'))$('#td-exit').onclick=()=>{sfx('ui');openPauseMenu();};
if($('#td-pause'))$('#td-pause').onclick=()=>{
  if(state.paused){closePauseMenu(true);setMsg(`Jogo rodando em ${state.gameSpeed}×.`);}
  else{openPauseMenu();setMsg('Partida pausada.');}
};
if($('#menu-resume'))$('#menu-resume').onclick=()=>{sfx('ui');closePauseMenu(true);setMsg(`Jogo rodando em ${state.gameSpeed}×.`);};
if($('#menu-restart'))$('#menu-restart').onclick=()=>{sfx('ui');closePauseMenu(false);runMapLoading(state.map,state.difficulty,reset,state.mode);};
if($('#menu-lobby'))$('#menu-lobby').onclick=()=>{sfx('ui');closePauseMenu(false);state.paused=true;setScreen('hub');};
if($('#menu-close'))$('#menu-close').onclick=()=>{sfx('ui');hideGameModal('#pause-menu');};
if($('#hub-settings-btn'))$('#hub-settings-btn').onclick=()=>{sfx('ui');openSettingsModal();};
if($('#menu-replay-tutorial'))$('#menu-replay-tutorial').onclick=()=>{sfx('ui');profile.matchTutorialSeen=false;saveProfile();showSaveIoStatus('✓ Tutorial guiado será mostrado ao entrar na próxima partida.');};
if($('#menu-volume'))$('#menu-volume').oninput=e=>{
  profile.settings.volume=Math.max(0,Math.min(1,Number(e.target.value)/100));
  saveProfile();syncVolumeUi();
};
if($('#menu-music'))$('#menu-music').oninput=e=>{
  profile.settings.musicVolume=Math.max(0,Math.min(1,Number(e.target.value)/100));
  saveProfile();syncVolumeUi();
  if(profile.settings.musicVolume<=0)stopMusic();
  else if(!musicState)startMusic();else updateMusicVolume();
};
if($('#result-retry'))$('#result-retry').onclick=()=>{sfx('ui');hideGameModal('#result-screen');runMapLoading(state.map,state.difficulty,reset,state.mode);};
if($('#result-lobby'))$('#result-lobby').onclick=()=>{sfx('ui');hideGameModal('#result-screen');setScreen('hub');};
if($('#result-next'))$('#result-next').onclick=e=>{
  const mapId=e.currentTarget.dataset.nextMap,diffId=e.currentTarget.dataset.nextDifficulty;
  if(!mapId||!diffId)return;
  sfx('ui');hideGameModal('#result-screen');runMapLoading(mapId,diffId,()=>{loadSelection(mapId,diffId,'campaign');setScreen('game');},'campaign');
};
window.addEventListener('keydown',e=>{
  if(e.key==='F8'&&document.body.dataset.screen==='game'){e.preventDefault();togglePlaytestDebug();return;}
  if(e.key!=='Escape'||document.body.dataset.screen!=='game'||state.completed||state.lives<=0)return;
  if(state.repositionTower){cancelReposition();return;}
  if(state.selected){cancelPlacement();return;}
  if(state.selectedTower){closeUpgradePanel(false);return;}
  if(state.menuOpen)closePauseMenu(true);else openPauseMenu();
});
if($('#secret-unlock-close'))$('#secret-unlock-close').onclick=closeSecretReveal;
if($('#td-upgrade'))$('#td-upgrade').onclick=upgradeTower;
if($('#td-reposition'))$('#td-reposition').onclick=e=>{e.stopPropagation();beginReposition();};
if($('#td-sell'))$('#td-sell').onclick=e=>{e.stopPropagation();sellSelectedTower();};
if($('#td-mastery-ability'))$('#td-mastery-ability').onclick=e=>{e.stopPropagation();activateMasteryAbility();};
if($('#td-upgrade-close'))$('#td-upgrade-close').onclick=e=>{e.stopPropagation();closeUpgradePanel(false);};
if($('#td-priority'))$('#td-priority').onchange=e=>{
  const t=selectedTower();if(!t)return;
  t.priority=TARGET_PRIORITIES.includes(e.target.value)?e.target.value:'first';
};

document.addEventListener('click',e=>{
  if(document.body.dataset.screen!=='game'||!state.selectedTower)return;
  if(e.target.closest('#td-upgrade-bar')||e.target.closest('#personal-td-canvas'))return;
  closeUpgradePanel(true);
});

$$('[data-speed]').forEach(btn=>btn.onclick=()=>{
  state.gameSpeed=Math.max(1,Math.min(3,Number(btn.dataset.speed)||1));
  updateSpeedButtons();setMsg(`Velocidade alterada para ${state.gameSpeed}×.`);
});

if($('#td-hero-deploy'))$('#td-hero-deploy').onclick=()=>{
  if(state.hero){setMsg(`🦸 ${HEROES[state.hero.type].name} já está em campo. O limite é 1 herói por partida.`);return;}
  if(state.selected==='__hero__'){cancelPlacement();return;}
  armHeroPlacement();const h=currentHeroDef();setMsg(`📍 ${h.icon} ${h.name} pronto para posicionar por $${heroPrice(profile.selectedHero,state.map)}. Limite: 1 Herói Gatinho por partida.`);
};
if($('#td-hero-skill'))$('#td-hero-skill').onclick=e=>{e.stopPropagation();activateHeroSkill();};
if($('#td-hero-ultimate'))$('#td-hero-ultimate').onclick=e=>{e.stopPropagation();activateHeroUltimate();};
if($('#td-hero-buy-level'))$('#td-hero-buy-level').onclick=e=>{e.stopPropagation();buyHeroLevel();};

$$('.td-tower-picker [data-td-tower]').forEach(btn=>btn.onclick=()=>{
  const id=btn.dataset.tdTower,t=types[id];
  if(state.repositionTower)cancelReposition(true);
  if(!isTowerUnlocked(id)){setMsg(`${t.name} libera no nível ${t.unlockLevel}.`);return;}
  const limit=t.limit||TOWER_LIMIT_PER_TYPE;if(towerCount(id)>=limit){setMsg(`🐾 ${t.name}: limite de ${limit} unidade${limit===1?'':'s'} atingido.`);return;}
  if(state.selected===id){cancelPlacement();return;}
  armPlacement(id);notifyMatchTutorialAction('towerSelected');
  let warning='';
  if(t.farm)warning=` Farm: +$${t.farmIncome} por rodada concluída e não ataca.`;
  else if(t.globalRange)warning=' Alcance GLOBAL e detecção de CAMUFLADOS.';
  else if(t.fullAoe)warning=' FULL AOE: atinge todos os alvos válidos no alcance.';
  else if(t.breaksArmor)warning=' Quebra BLINDADOS.';
  setMsg(`📍 ${t.name} pronto para posicionar por $${towerPrice(id,state.map)} (${mapCategoryForMap(state.map).name}).${warning} Clique UMA vez em um local válido do mapa. Depois da colocação, a seleção será cancelada.`);
});

if($('#play-enter'))$('#play-enter').onclick=()=>{
  sfx('ui');
  const mapId=lobbySelection.map,diffId=lobbySelection.difficulty,modeId=lobbySelection.mode;
  runMapLoading(mapId,diffId,()=>{
    loadSelection(mapId,diffId,modeId);
    setScreen('game');
    const area=$('#game-area');
    if(area)area.scrollTop=0;
    maybeStartMatchTutorial();
  },modeId);
};

personalTd={reset,startWave,upgradeTower,upgradeDartPath,upgradeSniperPath,renderHotbar,loadSelection,towerCount,placementType:()=>state.selected,mapId:()=>state.map,towerPrice:(id)=>towerPrice(id,state.map)};

configurePath();reset();requestAnimationFrame(loop);
}

initNavigation();
initResetSave();
initMatchTutorial();
initSettingsExtras();
renderProfileUi();
initPersonalTd();
renderProfileUi();
const initialScreen=(location.hash||'#hub').slice(1);
setScreen(['hub','play','cats','heroes','powers','tutorial'].includes(initialScreen)?initialScreen:'hub',false);
