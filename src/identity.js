'use strict';
// Profile cosmetics and achievement rewards are independent of match simulation.
(() => {
  const medals=[
    {id:'bossSlayer',name:'Caçador de Almirantes',icon:'anchor',description:'Derrote uma invasão do Almirante Espinha.'},
    {id:'eventVictor',name:'Guardião da Maré',icon:'shield',description:'Vença as três invasões do evento Normal.'},
    {id:'insaneVictor',name:'Lenda Abissal',icon:'crown',description:'Conclua o evento Insano até a rodada 60.'},
    {id:'campaignEasy',name:'Explorador Felino',icon:'star',description:'Conclua todos os mapas na dificuldade Fácil.'},
    {id:'campaignNormal',name:'Defensor Veterano',icon:'star',description:'Conclua todos os mapas na dificuldade Normal.'},
    {id:'campaignHard',name:'Mestre da Defesa',icon:'crown',description:'Conclua todos os mapas na dificuldade Difícil.'}
  ];
  const items=[
    {id:'bannerStarter',kind:'banner',name:'Primeira Missão',theme:'starter',price:0},
    {id:'bannerTide',kind:'banner',name:'Maré Conquistada',theme:'tide',price:20,requires:'bossSlayer'},
    {id:'bannerEasy',kind:'banner',name:'Bosque Dourado',theme:'dawn',price:18,requires:'campaignEasy'},
    {id:'bannerNormal',kind:'banner',name:'Órbita Veterana',theme:'nebula',price:28,requires:'campaignNormal'},
    {id:'bannerHard',kind:'banner',name:'Fortaleza Escarlate',theme:'ember',price:40,requires:'campaignHard'},
    {id:'bannerInsane',kind:'banner',name:'Coroa do Abismo',theme:'abyss',price:60,requires:'insaneVictor'},
    {id:'avatarStarter',kind:'avatar',name:'Recruta Felino',theme:'recruit',price:0},
    {id:'avatarPilot',kind:'avatar',name:'Piloto Estelar',theme:'pilot',price:8},
    {id:'avatarAdmiral',kind:'avatar',name:'Gato Almirante',theme:'admiral',price:15,requires:'bossSlayer'},
    {id:'avatarRoyal',kind:'avatar',name:'Soberano Abissal',theme:'royal',price:30,requires:'insaneVictor'}
  ];
  const byId=id=>items.find(item=>item.id===id),escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const finite=value=>Number.isFinite(Number(value))?Math.min(1e12,Math.max(0,Math.floor(Number(value)))):0;
  function normalize(p,saved={}){
    const src=saved.identity||{},progress=saved.honors||{};
    p.salmonCans=finite(saved.salmonCans);
    p.identity={name:String(src.name||'Gatinho').replace(/[\x00-\x1f<>]/g,'').trim().slice(0,20)||'Gatinho',owned:['bannerStarter','avatarStarter'],banner:'bannerStarter',avatar:'avatarStarter'};
    for(const id of Array.isArray(src.owned)?src.owned:[])if(byId(id)&&!p.identity.owned.includes(id))p.identity.owned.push(id);
    for(const kind of ['banner','avatar'])if(byId(src[kind])?.kind===kind&&p.identity.owned.includes(src[kind]))p.identity[kind]=src[kind];
    p.honors={bossKills:finite(progress.bossKills),eventWins:finite(progress.eventWins),insaneWins:finite(progress.insaneWins),medals:medals.filter(m=>Array.isArray(progress.medals)&&progress.medals.includes(m.id)).map(m=>m.id),seenRewards:(Array.isArray(progress.seenRewards)?progress.seenRewards:[]).filter(id=>typeof id==='string').slice(-240)};
    sync(p);
  }
  function sync(p){
    if(!p.honors)return;
    const award=id=>{if(!p.honors.medals.includes(id))p.honors.medals.push(id);};
    if(p.honors.bossKills)award('bossSlayer');
    if(p.honors.eventWins)award('eventVictor');
    if(p.honors.insaneWins)award('insaneVictor');
    for(const [difficulty,id] of [['easy','campaignEasy'],['normal','campaignNormal'],['hard','campaignHard']]){
      const maps=Object.values(p.maps||{});if(maps.length&&maps.every(map=>map.cleared?.[difficulty]))award(id);
    }
  }
  function grant(p,reward){
    if(!reward?.id||p.honors.seenRewards.includes(reward.id))return false;
    p.honors.seenRewards.push(reward.id);p.honors.seenRewards=p.honors.seenRewards.slice(-240);
    p.salmonCans+=finite(reward.cans);
    if(reward.bossKill)p.honors.bossKills++;
    if(reward.eventWin)p.honors.eventWins++;
    if(reward.insaneWin)p.honors.insaneWins++;
    if(reward.mapClear&&p.maps[reward.mapClear]&&['easy','normal','hard'].includes(reward.difficulty))p.maps[reward.mapClear].cleared[reward.difficulty]=true;
    sync(p);return true;
  }
  function buy(p,id){
    const item=byId(id);if(!item)return{ok:false,message:'Cosmético não encontrado.'};
    if(item.requires&&!p.honors.medals.includes(item.requires))return{ok:false,message:'Conquiste o broche necessário para liberar esta compra.'};
    if(!p.identity.owned.includes(id)){if(p.salmonCans<item.price)return{ok:false,message:'Você ainda não tem latas de salmão suficientes.'};p.salmonCans-=item.price;p.identity.owned.push(id);}
    p.identity[item.kind]=id;return{ok:true,message:item.name+' equipado!'};
  }
  function mark(icon){
    const paths={anchor:'M32 9v41M23 17h18M12 34c0 23 40 23 40 0M7 38l5-6 5 6M47 38l5-6 5 6',shield:'M32 8 51 16v15c0 12-10 20-19 25-9-5-19-13-19-25V16Z',crown:'M11 43 8 19l14 12 10-20 10 20 14-12-3 24ZM12 51h40',star:'m32 8 7 16 18 2-14 12 4 18-15-9-15 9 4-18L7 26l18-2Z'};
    return '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="'+paths[icon]+'" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }
  function avatar(theme='recruit'){
    const color={recruit:'#efbb78',pilot:'#c5def5',admiral:'#a9e8df',royal:'#ccadf7'}[theme]||'#efbb78';
    const extra=theme==='pilot'?'<path d="M18 41h60v13H18Z" fill="#1a4b69"/><path d="M26 44h18v7H26m26-7h18v7H52" stroke="#7af6ee" stroke-width="5"/>':theme==='admiral'?'<path d="M17 32 24 18h48l7 14Z" fill="#163749" stroke="#f7d086" stroke-width="3"/><path d="M28 30h40" stroke="#f7d086" stroke-width="4"/>':theme==='royal'?'<path d="m23 29-4-18 17 11L48 7l12 15 17-11-4 18Z" fill="#f1c96c" stroke="#8757c5" stroke-width="3"/>':'';
    return '<svg viewBox="0 0 96 96" role="img" aria-label="Foto de perfil felina"><path d="M20 42 19 16l24 15m10 0 24-15-1 26" fill="'+color+'" stroke="#173040" stroke-width="4"/><path d="M16 53C16 15 80 15 80 53v8c0 34-64 34-64 0Z" fill="'+color+'" stroke="#173040" stroke-width="4"/><ellipse cx="48" cy="69" rx="20" ry="14" fill="#fff5db"/><path d="m42 63 6 6 6-6" fill="#c9617c"/><path d="M32 52v4m32-4v4" stroke="#183044" stroke-width="7" stroke-linecap="round"/><path d="M48 69v6m0-2-7 4m7-4 7 4" stroke="#183044" stroke-width="2" fill="none"/>'+extra+'</svg>';
  }
  function card(p,compact=false){
    const banner=byId(p.identity.banner),photo=byId(p.identity.avatar);
    return '<div class="identity-banner banner-'+banner.theme+(compact?' compact':'')+'"><span class="identity-avatar">'+avatar(photo.theme)+'</span><span class="identity-caption"><small>DEFENSOR FELINO · NÍVEL '+p.level+'</small><b>'+escape(p.identity.name)+'</b><span>'+p.honors.medals.slice(0,4).map(id=>{const m=medals.find(x=>x.id===id);return '<i title="'+m.name+'">'+mark(m.icon)+'</i>';}).join('')+'</span></span><span class="identity-emblem" aria-hidden="true">'+mark(banner.theme==='abyss'?'crown':banner.theme==='tide'?'anchor':'star')+'</span></div>';
  }
  let binding=null;
  function render(p){
    const q=id=>document.getElementById(id);if(!p.identity)return;
    if(q('profile-open'))q('profile-open').innerHTML=card(p,true);
    if(q('profile-card'))q('profile-card').innerHTML=card(p);
    for(const id of ['profile-cans','cosmetic-cans'])if(q(id))q(id).textContent=p.salmonCans;
    const input=q('profile-name-input');if(input&&document.activeElement!==input)input.value=p.identity.name;
    if(q('profile-medals'))q('profile-medals').innerHTML=medals.map(m=>{const earned=p.honors.medals.includes(m.id),difficulty={campaignEasy:'easy',campaignNormal:'normal',campaignHard:'hard'}[m.id],progress=difficulty?Object.values(p.maps).filter(map=>map.cleared[difficulty]).length+'/'+Object.keys(p.maps).length+' mapas':earned?'Conquistado':'Ainda não conquistado';return '<article class="honor-medal '+(earned?'earned':'locked')+'"><span>'+mark(m.icon)+'</span><div><b>'+m.name+'</b><p>'+m.description+'</p><small>'+progress+'</small></div></article>';}).join('');
    if(q('profile-stats'))q('profile-stats').textContent=p.honors.bossKills+' invasões derrotadas · '+p.honors.eventWins+' eventos Normal vencidos · '+p.honors.insaneWins+' eventos Insano vencidos';
    if(q('cosmetic-store'))q('cosmetic-store').innerHTML=items.filter(item=>item.price>0).map(item=>{
      const owned=p.identity.owned.includes(item.id),equipped=p.identity[item.kind]===item.id,unlocked=!item.requires||p.honors.medals.includes(item.requires),requirement=medals.find(m=>m.id===item.requires);
      const preview=item.kind==='banner'?'<div class="store-banner banner-'+item.theme+'">'+mark(item.theme==='abyss'?'crown':item.theme==='tide'?'anchor':'star')+'</div>':'<div class="store-avatar">'+avatar(item.theme)+'</div>';
      return '<article class="cosmetic-item '+(!unlocked?'locked':'')+'">'+preview+'<small>'+(item.kind==='banner'?'BANNER':'FOTO DE PERFIL')+'</small><h3>'+item.name+'</h3><p>'+(unlocked?'Disponível para seu perfil':requirement.description)+'</p><button type="button" data-cosmetic="'+item.id+'" '+(equipped||!unlocked||!owned&&p.salmonCans<item.price?'disabled':'')+'>'+(equipped?'✓ Equipado':owned?'Equipar':!unlocked?'🔒 Desbloqueie pela conquista':'Comprar · 🥫 '+item.price)+'</button></article>';
    }).join('');
  }
  function setup(getProfile,save){
    binding={getProfile,save};
    document.addEventListener('click',event=>{
      const button=event.target.closest('[data-cosmetic]');if(!button||button.disabled)return;
      const result=buy(getProfile(),button.dataset.cosmetic),status=document.getElementById('cosmetic-status');if(status)status.textContent=result.message;if(result.ok)save();
    });
    document.getElementById('profile-save-name')?.addEventListener('click',()=>{const input=document.getElementById('profile-name-input'),p=getProfile();p.identity.name=String(input.value).replace(/[\x00-\x1f<>]/g,'').trim().slice(0,20)||'Gatinho';save();document.getElementById('profile-name-status').textContent='Nome salvo neste perfil.';});
    document.getElementById('profile-default-banner')?.addEventListener('click',()=>{getProfile().identity.banner='bannerStarter';save();});
    document.getElementById('profile-default-avatar')?.addEventListener('click',()=>{getProfile().identity.avatar='avatarStarter';save();});
  }
  window.CatoonsIdentity={normalize,sync,grant,buy,render,setup,items,medals,avatar,mark,card};
})();
