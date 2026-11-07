import { describe,expect,it } from 'vitest';
import { bathingTargets,freeBathSlot } from './bathing';
import { canStand,maps } from './model';
describe('reusable bathing profiles',()=>{
  it('has safe entry/exit anchors and separate spaced onsen places',()=>{
    for(const target of bathingTargets){
      expect(canStand(maps[target.map],target.approach),target.id).toBe(true);
      expect(canStand(maps[target.map],target.exit),target.id).toBe(true);
      expect(target.visibleFraction).toBeGreaterThan(.4);expect(target.visibleFraction).toBeLessThan(.7);
      for(const [i,slot] of target.slots.entries())for(const other of target.slots.slice(i+1))expect(Math.hypot(slot.point.x-other.point.x,slot.point.y-other.point.y)).toBeGreaterThan(40);
    }
  });
  it('leaves capybara places reserved and refuses full targets',()=>{
    const onsen=bathingTargets[0],occupied=new Set<string>();
    const first=freeBathSlot(onsen,occupied)!;expect(first.reservedFor).toBeUndefined();occupied.add(first.id);
    const second=freeBathSlot(onsen,occupied)!;expect(second.id).not.toBe(first.id);occupied.add(second.id);
    expect(freeBathSlot(onsen,occupied)).toBeUndefined();
    const bath=bathingTargets.find(target=>target.id==='home.bathroom.bath')!;expect(freeBathSlot(bath,new Set([bath.slots[0].id]))).toBeUndefined();
  });
});
