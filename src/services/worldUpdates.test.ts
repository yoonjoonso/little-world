import { beforeEach,describe,expect,it,vi } from 'vitest';
import { recordSweep,readReceipts,acknowledgeUpdates,unreadUpdates,setUpdateViewer } from './worldUpdates';
const data=new Map<string,string>();
beforeEach(()=>{data.clear();setUpdateViewer();vi.stubGlobal('localStorage',{getItem:(k:string)=>data.get(k)||null,setItem:(k:string,v:string)=>data.set(k,v)});});
describe('completed sweep notifications',()=>{
  it('does not manufacture a response for an empty sweep',()=>{recordSweep({id:'s1',completedAt:'2026-11-07T00:00:00Z',updates:[]});expect(unreadUpdates()).toEqual([]);expect(readReceipts()).toHaveLength(1);});
  it('deduplicates sweep receipts and acknowledges only the visited target',()=>{const receipt={id:'s1',completedAt:'2026-11-07T00:00:00Z',updates:[{id:'u1',target:'npc' as const,targetId:'milo',summary:'New response',createdAt:'2026-11-07T00:00:00Z',read:false},{id:'u2',target:'world' as const,targetId:'garden',summary:'Garden updated',createdAt:'2026-11-07T00:00:00Z',read:false}]};recordSweep(receipt);recordSweep(receipt);expect(unreadUpdates()).toHaveLength(2);acknowledgeUpdates('npc','milo');expect(unreadUpdates().map(u=>u.id)).toEqual(['u2']);});
  it('keeps discoveries separate for each viewer',()=>{
    recordSweep({id:'s',completedAt:'2026-11-07T00:00:00Z',updates:[{id:'reply',target:'npc',targetId:'lucia',summary:'A delivered reply',createdAt:'2026-11-07T00:00:00Z',read:false}]});
    setUpdateViewer('yoon');acknowledgeUpdates('npc','lucia');expect(unreadUpdates()).toHaveLength(0);
    setUpdateViewer('lila');expect(unreadUpdates()).toHaveLength(1);
    setUpdateViewer('yoon');expect(unreadUpdates()).toHaveLength(0);
  });

});
