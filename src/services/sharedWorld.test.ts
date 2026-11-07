import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Session } from '@supabase/supabase-js';
const {from}=vi.hoisted(()=>({from:vi.fn()}));
vi.mock('./supabase',()=>({supabase:{from}}));
import { connectWorld } from './sharedWorld';
import { gameEvents } from '../game/bridge';
const session={user:{id:'yoon'}} as Session;
function query(result:unknown){const q:any={then:(resolve:any)=>Promise.resolve(result).then(resolve)};for(const key of ['select','eq','neq','limit','order','maybeSingle','upsert','insert'])q[key]=vi.fn(()=>q);return q;}
async function flush(){for(let i=0;i<20;i++)await Promise.resolve();}
describe('shared world connection',()=>{
  let close:(()=>void)|undefined;
  beforeEach(()=>{vi.stubGlobal('window',globalThis);from.mockReset();vi.useFakeTimers();});
  afterEach(()=>{close?.();close=undefined;vi.useRealTimers();vi.unstubAllGlobals();});
  it('rejects an account without world membership and never reads another world',async()=>{
    from.mockReturnValue(query({data:[],error:null}));
    const receive=vi.fn();const connection=connectWorld(session,receive);close=connection.close;
    await flush();
    expect(receive.mock.lastCall?.[0].error).toContain('membership');
    expect(from).toHaveBeenCalledTimes(1);
    await expect(connection.send('message','hello')).rejects.toThrow('not connected');
  });
  it('restores saved position before writing and tears down the state listener',async()=>{
    const restore=vi.fn();gameEvents.addEventListener('restore-player',restore);
    const saved={world_id:'world',user_id:'yoon',map_id:'cottage',x:480,y:395,activity:'sitting'};
    const states=[query({data:saved,error:null}),query({data:[],error:null})];
    from.mockImplementation((table:string)=>table==='world_members'?query({data:[{world_id:'world'}],error:null}):table==='player_states'?states.shift():query({data:[],error:null}));
    const receive=vi.fn();const connection=connectWorld(session,receive);close=connection.close;
    gameEvents.dispatchEvent(new CustomEvent('state',{detail:{map:'garden',x:50,y:50,prompt:''}}));
    await flush();
    expect(restore).toHaveBeenCalledTimes(1);
    expect((restore.mock.calls[0][0] as CustomEvent).detail).toEqual(saved);
    expect(receive.mock.lastCall?.[0].worldId).toBe('world');
    connection.close();const count=from.mock.calls.length;
    await vi.advanceTimersByTimeAsync(5000);
    expect(from).toHaveBeenCalledTimes(count);
    gameEvents.removeEventListener('restore-player',restore);
  });
  it('does not report a failed message insert as success',async()=>{
    from.mockImplementation((table:string)=>table==='world_members'?query({data:[{world_id:'world'}],error:null}):table==='player_states'?query({data:null,error:null}):query({data:[],error:null}));
    const connection=connectWorld(session,vi.fn());close=connection.close;await flush();
    from.mockReturnValueOnce(query({error:{message:'Permission denied'}}));
    await expect(connection.send('message','hello')).rejects.toThrow('Permission denied');
  });
});
