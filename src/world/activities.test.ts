import { describe,expect,it } from 'vitest';
import { activityTargets,advanceTrack,chooseActivitySlot,trackRoute,routeIndexForPoint } from './activities';
import { canStand,maps } from './model';
describe('park and shower activities',()=>{
  it('keeps approaches and exits legal and does not reuse occupied slots',()=>{
    for(const target of activityTargets){
      expect(canStand(maps[target.map],target.approach),target.id).toBe(true);
      expect(canStand(maps[target.map],target.exit),target.id).toBe(true);
      expect(chooseActivitySlot(target,new Set(target.slots.map(slot=>slot.id)))).toBeUndefined();
    }
  });
  it('follows the full running loop without jumping through an obstacle',()=>{
    let position={...trackRoute[0]},index=1;
    for(let i=0;i<600;i++){const next=advanceTrack(maps.garden,position,trackRoute,index,50);expect(next.blocked).toBe(false);expect(Math.hypot(next.position.x-position.x,next.position.y-position.y)).toBeLessThanOrEqual(6.51);expect(canStand(maps.garden,next.position)).toBe(true);position=next.position;index=next.index;}
  });
  it('resumes the nearest track segment instead of cutting across the infield',()=>{expect(routeIndexForPoint(trackRoute,{x:(trackRoute[4].x+trackRoute[5].x)/2,y:(trackRoute[4].y+trackRoute[5].y)/2})).toBe(5);});

});
