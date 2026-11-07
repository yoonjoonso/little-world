import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { gameEvents, type GameState } from '../game/bridge';

export interface SharedEvent {id:string;user_id:string;kind:'message'|'log';body:string;created_at:string}
export interface RemotePlayer {user_id:string;map_id:'garden'|'cottage';x:number;y:number;activity:string;updated_at:string}
export interface SharedSnapshot {worldId:string|null;players:RemotePlayer[];events:SharedEvent[];error:string|null}
// Database-backed first slice. Polling is intentionally bounded, not a per-frame write.
// Realtime interpolation can replace delivery without changing IDs or persistence.
export function connectWorld(session:Session,receive:(snapshot:SharedSnapshot)=>void){
  let stopped=false,working=false,worldId:string|null=null,lastSaved='',latest:GameState|null=null;
  let lastWrite=0,restored=false;
  const client=supabase!;
  const own=session.user.id;
  const state=(event:Event)=>{latest=(event as CustomEvent<GameState>).detail;};
  gameEvents.addEventListener('state',state);
  async function refresh(){
    if(stopped||working)return;
    working=true;
    try{
      if(!worldId){
        const membership=await client.from('world_members').select('world_id').eq('user_id',own).limit(2);
        if(membership.error)throw membership.error;
        if(membership.data?.length!==1)throw new Error('Your account needs membership in exactly one shared world.');
        worldId=membership.data[0].world_id;
      }
      if(!restored){
        const saved=await client.from('player_states').select('*').eq('world_id',worldId).eq('user_id',own).maybeSingle();
        if(saved.error)throw saved.error;
        if(stopped)return;
        if(saved.data){latest=null;gameEvents.dispatchEvent(new CustomEvent('restore-player',{detail:saved.data}));}
        restored=true;
      }
      if(stopped)return;
      if(latest){
        const value={world_id:worldId,user_id:own,map_id:latest.map,x:latest.x,y:latest.y,activity:latest.prompt==='Stand up'?'sitting':'idle'};
        const signature=JSON.stringify(value);
        if(signature!==lastSaved||Date.now()-lastWrite>15000){
          const result=await client.from('player_states').upsert({...value,updated_at:new Date().toISOString()});
          if(result.error)throw result.error;
          lastSaved=signature;lastWrite=Date.now();
        }
      }
      const [players,events]=await Promise.all([
        client.from('player_states').select('*').eq('world_id',worldId).neq('user_id',own),
        client.from('activity_events').select('*').eq('world_id',worldId).order('created_at',{ascending:false}).order('id',{ascending:false}).limit(100)
      ]);
      if(players.error)throw players.error;
      if(events.error)throw events.error;
      if(!stopped)receive({worldId,players:players.data as RemotePlayer[],events:(events.data as SharedEvent[]).reverse(),error:null});
    }catch(error){if(!stopped)receive({worldId,players:[],events:[],error:error instanceof Error?error.message:String((error as {message?:string}).message||'Shared world unavailable')});}
    finally{working=false;}
  }
  const timer=window.setInterval(()=>void refresh(),1000);
  void refresh();
  return {
    async send(kind:'message'|'log',body:string){
      if(stopped||!worldId)throw new Error('Shared world is not connected.');
      const result=await client.from('activity_events').insert({world_id:worldId,user_id:own,kind,body:body.trim()});
      if(result.error)throw new Error(result.error.message);
      void refresh();
    },
    close(){stopped=true;window.clearInterval(timer);gameEvents.removeEventListener('state',state);}
  };
}
