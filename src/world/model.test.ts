import { villageBuildings,buildingApproach } from './buildings';
import { worldNpcs } from './npcs';
import { describe,expect,it } from 'vitest';
import { homeLayout, homeRooms, lucia, studyDesk, homeAnchor } from './home';
import { planningPlots, requestBoard } from './planning';
import {canStand,maps,move,portalAt,makeDraft} from './model';
describe('movement and map routes',()=>{
  it('blocks walls while allowing movement along their edge',()=>{
    const start={x:330,y:250};const next=move(maps.garden,start,1,1,50);
    expect(next.x).toBe(start.x);expect(next.y).toBeGreaterThan(start.y);
  });
  it('keeps diagonal movement equal to straight movement',()=>{
    const start=maps.garden.spawn;const a=move(maps.garden,start,1,0,50);const b=move(maps.garden,start,1,1,50);
    expect(Math.hypot(a.x-start.x,a.y-start.y)).toBeCloseTo(Math.hypot(b.x-start.x,b.y-start.y));
  });
  it('caps large frame deltas so a stalled tab cannot jump across obstacles',()=>{
    expect(move(maps.garden,maps.garden.spawn,1,0,10000).x-maps.garden.spawn.x).toBe(7.5);
  });
  it('uses accessible, explicit entrances between the compact village and larger home',()=>{
    for(const map of Object.values(maps)){
      expect(canStand(map,map.spawn)).toBe(true);
      for(const portal of map.portals)expect(canStand(maps[portal.target],portal.spawn)).toBe(true);
    }
    expect(portalAt(maps.garden,{x:464,y:350})?.target).toBe('cottage');
    expect(portalAt(maps.cottage,{x:600,y:818})?.target).toBe('garden');
    expect(canStand(maps.cottage,{x:600,y:832})).toBe(true);
    expect(canStand(maps.cottage,{x:550,y:845})).toBe(false);
  });
  it('stops at the exit mat until interaction and rejects saved positions outside the home',()=>{
    let point={...maps.cottage.spawn};
    for(let i=0;i<100;i++)point=move(maps.cottage,point,0,1,50);
    expect(point.y).toBeLessThan(840);expect(portalAt(maps.cottage,point)?.target).toBe('garden');
    expect(canStand(maps.cottage,{x:600,y:900})).toBe(false);
    expect(canStand(maps.cottage,{x:100,y:500})).toBe(false);
    expect(canStand(maps.cottage,{x:1100,y:500})).toBe(false);
    expect(canStand(maps.cottage,{x:600,y:100})).toBe(false);
  });
  it('keeps every room and both desk approaches reachable from the entrance',()=>{
    const map=maps.cottage;
    const start={...map.spawn};
    const queue=[start],seen=new Set([`${start.x},${start.y}`]);
    for(let i=0;i<queue.length;i++){
      const p=queue[i];
      for(const [dx,dy] of [[10,0],[-10,0],[0,10],[0,-10]]){
        const next={x:p.x+dx,y:p.y+dy},key=`${next.x},${next.y}`;
        if(!seen.has(key)&&canStand(map,next)){seen.add(key);queue.push(next);}
      }
    }
    const targets=[lucia.approach,studyDesk.approach,studyDesk.stand,...homeLayout.map(room=>homeAnchor(room.id,{x:homeRooms[room.definition].width/2,y:265}))];
    for(const target of targets){
      expect(canStand(map,target),JSON.stringify(target)).toBe(true);
      expect(queue.some(p=>Math.hypot(p.x-target.x,p.y-target.y)<15)).toBe(true);
    }
    // Sitting occupies the desk footprint; standing returns to a walkable anchor.
    expect(canStand(map,studyDesk.seat)).toBe(false);
  });
});
it('keeps planning plots empty and their request anchors walkable',()=>{
  expect(canStand(maps.garden,requestBoard.approach)).toBe(true);
  for(const plot of planningPlots){expect(canStand(maps.garden,plot.approach)).toBe(true);expect(canStand(maps.garden,{x:plot.bounds.x+plot.bounds.w/2,y:plot.bounds.y+plot.bounds.h/2})).toBe(true);}
});
it('keeps every NPC interaction approach outside solid scenery',()=>{
  for(const npc of worldNpcs)expect(canStand(maps[npc.map],npc.approach()),npc.id).toBe(true);
});
it('keeps each coming-soon door reachable and blocks its unopened interior',()=>{
  for(const building of villageBuildings){
    expect(canStand(maps.garden,buildingApproach(building)),building.id).toBe(true);
    expect(canStand(maps.garden,{x:building.position.x,y:building.position.y+20}),building.id).toBe(false);
    expect(building.status).toBe('coming-soon');
  }
});
describe('idea drafts',()=>{
  it('rejects empty and oversized proposals before saving',()=>{
    expect(()=>makeDraft('  ','')).toThrow();expect(()=>makeDraft('x'.repeat(61),'')).toThrow();expect(()=>makeDraft('Greenhouse','x'.repeat(1001))).toThrow();
    expect(makeDraft(' Greenhouse ',' Herbs ').status).toBe('draft');
  });
});

 it("sprints faster while preserving diagonal normalization and solid collisions",()=>{
 const p={x:480,y:458};
 const walk=move(maps.garden,p,1,0,50);
 const run=move(maps.garden,p,1,0,50,1.8);
 const diagonal=move(maps.garden,p,1,1,50,1.8);
 expect(run.x-p.x).toBeCloseTo((walk.x-p.x)*1.8);
 expect(Math.hypot(diagonal.x-p.x,diagonal.y-p.y)).toBeCloseTo(run.x-p.x);
 const blocked=move(maps.garden,{x:330,y:250},1,0,50,1.8);
 expect(blocked.x).toBe(330);
 });
