'use strict';
// Shared, deterministic rules for categories, daily events and match reports.
(() => {
  const classes={standard:{name:'Padrão',icon:'◆',color:'#efbd72'},magic:{name:'Mágico',icon:'✦',color:'#c19aff'},tech:{name:'Tecnológico',icon:'⬡',color:'#7cdbff'},support:{name:'Suporte',icon:'✚',color:'#81e0ad'}};
  const mapping={dart:'standard',frost:'standard',burst:'standard',ninja:'standard',boomerang:'standard',mister:'standard',wizard:'magic',vine:'magic',alchemist:'magic',chronomancer:'magic',demonking:'magic',laser:'tech',electric:'tech',sniper:'tech',celestial:'tech',salmon:'support',litter:'support'};
  const bosses={spine:{id:'spine',name:'Almirante Espinha',title:'Maré Blindada',icon:'🦈',color:'#55c7c2'},eclipse:{id:'eclipse',name:'Eclipse Devorador',title:'Banquete do Eclipse',icon:'🌑',color:'#c19aff'}};
  const phaseClass=phase=>['standard','magic','tech','support'][Math.max(0,Math.min(3,(phase||1)-1))];
  const categoryOf=type=>mapping[type]||'standard';
  const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function dailyBoss(date=new Date()){
    const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date),part=type=>parts.find(p=>p.type===type).value;
    const key=part('year')+'-'+part('month')+'-'+part('day'),day=Math.floor(Date.parse(key+'T00:00:00Z')/86400000);
    return{...bosses[day%2===0?'spine':'eclipse'],dateKey:key};
  }
  function badge(type,translate=name=>name){
    const c=classes[categoryOf(type)];
    return '<span class="cat-class-badge" style="--class-color:'+c.color+'">'+c.icon+' '+escape(translate(c.name))+'</span>';
  }
  function filters(selected='all',translate=name=>name){
    const options=[{id:'all',name:'Todos',icon:'🐾'},...Object.entries(classes).map(([id,c])=>({id,...c}))];
    return options.map(c=>{
      const pressed=selected===c.id;
      return '<button type="button" data-cat-class="'+c.id+'" aria-pressed="'+pressed+'" class="'+(pressed?'selected':'')+'">'+c.icon+' '+escape(translate(c.name))+'</button>';
    }).join('');
  }
  function targets(boss,units,pointAt){
    if(boss.dead||boss.raidBoss!=='eclipse')return[];
    const p=pointAt(boss.d,boss.path),category=phaseClass(boss.bossPhase);
    return units.filter(unit=>categoryOf(unit.type)===category&&Math.hypot(unit.x-p.x,unit.y-p.y)<=(boss.auraRadius||150));
  }
  function aura(boss,units,dt,pointAt){
    if(boss.dead||boss.raidBoss!=='eclipse')return{targets:[],healed:0};
    const warning=Math.max(0,boss.auraWarning||0),activeDt=Math.max(0,dt-warning);boss.auraWarning=Math.max(0,warning-dt);
    const affected=boss.auraWarning>0?[]:targets(boss,units,pointAt);
    const ceiling=boss.maxHp*(1-((boss.bossPhase||1)-1)*.25);
    const healed=Math.min(Math.max(0,ceiling-boss.hp),boss.maxHp*.0025*Math.min(4,affected.length)*activeDt);
    boss.hp+=healed;boss.healedTotal=(boss.healedTotal||0)+healed;boss.auraCount=affected.length;boss.auraHealRate=affected.length?boss.maxHp*.0025*Math.min(4,affected.length):0;
    if(healed)for(const unit of affected)unit.bossHealingFed=(unit.bossHealingFed||0)+healed/affected.length;
    return{targets:affected,healed};
  }
  function report(units,hero,bossHealing=0){
    const rows=units.map(u=>({type:u.type,owner:u.owner||'host',id:u.id,damage:Math.max(0,u.damageDealt||0),income:Math.max(0,u.incomeGenerated||0),healing:Math.max(0,u.bossHealingFed||0),sold:Boolean(u.sold)}));
    if(hero)rows.push({type:'hero:'+hero.type,owner:hero.owner||'host',id:'hero',damage:hero.damageDealt||0,income:hero.incomeGenerated||0,healing:0});
    const players={};for(const row of rows){const p=players[row.owner]||(players[row.owner]={owner:row.owner,damage:0,income:0,healing:0});p.damage+=row.damage;p.income+=row.income;p.healing+=row.healing;}
    return{rows:rows.sort((a,b)=>b.damage-a.damage),players:Object.values(players),bossHealing};
  }
  window.CatoonsEvents={classes,mapping,bosses,phaseClass,categoryOf,dailyBoss,badge,filters,targets,aura,report,escape};
})();
