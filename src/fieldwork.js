'use strict';
(() => {
  const groups=[
    [{id:'rounds',goal:8,coins:18},{id:'rounds',goal:12,coins:24},{id:'rounds',goal:10,coins:21}],
    [{id:'pops',goal:80,coins:20},{id:'armor',goal:20,coins:28},{id:'camo',goal:15,coins:26}],
    [{id:'win',goal:1,coins:35},{id:'boss',goal:1,coins:40},{id:'mixedWin',goal:1,coins:42}]
  ];
  const discoveries=['normal','camo','armored','heavyArmored','camoArmored','fast','regen','healer','trickster','jester','angel','demon','elite','miniBoss','campaignBoss','spine','eclipse'];
  const weeklyGoal=10,weeklyCoins=60;
  const period=(date=new Date())=>{
    const dayKey=globalThis.CatoonsEvents.dailyBoss(date).dateKey;
    const day=new Date(dayKey+'T00:00:00Z');
    const index=Math.floor(+day/86400000);
    day.setUTCDate(day.getUTCDate()-(day.getUTCDay()+6)%7);
    return {dayKey,weekKey:day.toISOString().slice(0,10),tasks:groups.map((group,i)=>group[(index+i)%group.length])};
  };
  function normalize(saved,calendar=period()){
    const currentDay=saved?.dayKey===calendar.dayKey;
    const progress=Object.fromEntries(calendar.tasks.map(task=>[task.id,currentDay?Math.max(0,Math.min(task.goal,Math.floor(Number(saved.progress?.[task.id])||0))):0]));
    return {dayKey:calendar.dayKey,weekKey:calendar.weekKey,progress,weekly:saved?.weekKey===calendar.weekKey?Math.max(0,Math.min(weeklyGoal,Math.floor(Number(saved.weekly)||0))):0};
  }
  function advance(profile,counts,calendar=period()){
    const track=profile.missions=normalize(profile.missions,calendar);
    const previousWeekly=track.weekly;
    let coins=0;
    for(const task of calendar.tasks){
      if(track.progress[task.id]>=task.goal)continue;
      track.progress[task.id]=Math.min(task.goal,track.progress[task.id]+(counts[task.id]||0));
      if(track.progress[task.id]===task.goal){coins+=task.coins;track.weekly=Math.min(weeklyGoal,track.weekly+1);}
    }
    if(previousWeekly<weeklyGoal&&track.weekly===weeklyGoal){
      coins+=weeklyCoins;
      if(!profile.honors.medals.includes('weeklyDefender'))profile.honors.medals.push('weeklyDefender');
    }
    profile.coins+=coins;
    return coins;
  }
  function discover(seen,enemies){
    let changed=false;
    for(const e of enemies){
      const key=e.eventBoss?e.raidBoss:e.miniBoss?'miniBoss':e.kind==='boss'?'campaignBoss':e.kind;
      for(const id of e.elite?[key,'elite']:[key]){
        if(!discoveries.includes(id)||seen.includes(id))continue;
        seen.push(id);changed=true;
      }
    }
    return changed;
  }
  globalThis.CatoonsFieldwork={period,normalize,advance,discover,discoveries,weeklyGoal,weeklyCoins};
})();
