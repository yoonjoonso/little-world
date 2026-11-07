import { describe,expect,it } from 'vitest';
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
  it('provides legal spawns and reachable round-trip portals',()=>{
    for(const map of Object.values(maps)){
      expect(canStand(map,map.spawn)).toBe(true);
      for(const portal of map.portals)expect(canStand(maps[portal.target],portal.spawn)).toBe(true);
    }
    expect(portalAt(maps.garden,{x:466,y:350})?.target).toBe('cottage');
    expect(portalAt(maps.cottage,{x:480,y:533})?.target).toBe('garden');
    let point={x:480,y:492};for(let i=0;i<6;i++) point=move(maps.cottage,point,0,1,50);
    expect(portalAt(maps.cottage,point)?.target).toBe('garden');
  });
  it('allows a player to reach and leave the desk chair',()=>{
    let point={x:480,y:492};for(let i=0;i<10;i++)point=move(maps.cottage,point,0,-1,50);
    expect(point.y).toBeLessThan(430);expect(canStand(maps.cottage,{x:480,y:433})).toBe(true);
  });
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
 const blocked=move(maps.garden,{x:466,y:340},0,-1,50,1.8);
 expect(blocked.y).toBe(340);
 });
