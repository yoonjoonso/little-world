import { describe,expect,it } from 'vitest';
import { chooseNpcSlot,npcDefinitions,planNpcRoutine } from './npcRoutines';
describe('consistent NPC planning',()=>{
  it('keeps daily variations identical across viewers and never selects an unbuilt destination',()=>{
    for(const npc of npcDefinitions){
      const available=new Set([npc.homeArea]);
      for(let hour=0;hour<24;hour++){
        const now=new Date(`2026-11-07T${String(hour).padStart(2,'0')}:00:00Z`);
        expect(planNpcRoutine(npc,now,available)).toEqual(planNpcRoutine(npc,new Date(now),available));
        expect(planNpcRoutine(npc,now,available).areaId).toBe(npc.homeArea);
      }
    }
  });
  it('chooses separate waiting slots when seats are occupied, then leaves when full',()=>{
    const area={id:'park.bench',visitors:['mochi','lilito'],activitySlots:['seat.1'],waitingSlots:['wait.1','wait.2']};
    const occupied=new Set(['seat.1']);
    const mochi=chooseNpcSlot(area,'mochi',occupied);expect(mochi).toEqual({kind:'wait',slotId:'wait.1'});
    occupied.add(mochi.slotId!);
    expect(chooseNpcSlot(area,'lilito',occupied)).toEqual({kind:'wait',slotId:'wait.2'});
    occupied.add('wait.2');expect(chooseNpcSlot(area,'lilito',occupied)).toEqual({kind:'leave'});
    expect(chooseNpcSlot(area,'lucia',new Set())).toEqual({kind:'leave'});
  });
});
