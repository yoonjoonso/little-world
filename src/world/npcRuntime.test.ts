import { describe,it,expect } from 'vitest';
import { NpcRuntime } from './npcRuntime';
import { findRoute,clearRoute } from './navigation';
import { maps,canStand } from './model';
import { npcDefinitions,planNpcRoutine } from './npcRoutines';

describe('NPC travel',()=>{
  it('routes around buildings and rejects enclosed destinations',()=>{
    const start={x:466,y:430},end={x:1165,y:1235};
    const route=findRoute(maps.garden,start,end);expect(route).not.toBeNull();let previous=start;
    for(const point of route!){expect(clearRoute(maps.garden,previous,point)).toBe(true);previous=point;}
    expect(findRoute(maps.garden,start,{x:400,y:200})).toBeNull();
  });
  it('can reach every home landing and the house exit',()=>{
    expect(findRoute(maps.cottage,{x:820,y:630},{x:600,y:808})).not.toBeNull();
    for(const point of [{x:155,y:1000},{x:305,y:1000},{x:1960,y:835},{x:1030,y:1350}])expect(canStand(maps.garden,point)).toBe(true);
  });
  it('runs a scheduled outing through the door and returns Lucia to her desk',()=>{
    const definition=npcDefinitions[0],available=new Set(['home.reception','park.walk','northgate.browsing']);
    let date=new Date('2026-11-07T20:00:00Z');for(let day=7;day<30;day++){date=new Date(`2026-11-${String(day).padStart(2,'0')}T20:00:00Z`);if(planNpcRoutine(definition,date,available).reason==='outing')break;}
    expect(planNpcRoutine(definition,date,available).reason).toBe('outing');
    const runtime=new NpcRuntime();
    for(let i=0;i<14000;i++)runtime.step(100,date,[]);
    const state=runtime.get('lucia');expect(state.map).toBe('garden');expect(state.phase).toBe('active');expect(state.home).toBe(false);
    for(let i=0;i<14000;i++)runtime.step(100,new Date('2026-11-07T23:00:00Z'),[]);
    expect(state.map).toBe('cottage');expect(state.home).toBe(true);expect(state.position).toEqual({x:820,y:689});
  });
  it('holds conversations and avoids moving into a player',()=>{
    const runtime=new NpcRuntime(),state=runtime.get('pastor-cait');
    state.home=false;state.route=[{x:1165,y:1290}];state.phase='walking';
    const before={...state.position};runtime.step(100,new Date('2026-11-07T23:00:00Z'),[],'pastor-cait');expect(state.position).toEqual(before);expect(state.phase).toBe('interacting');
    runtime.step(100,new Date('2026-11-07T23:00:00Z'),[{map:'garden',position:{x:1165,y:1260}}]);expect(state.position).toEqual(before);
  });
});

