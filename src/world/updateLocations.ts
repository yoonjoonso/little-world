import { homeAnchor, homeLayout, homeRooms, lucia, studyDesk } from './home';
import { planningPlots, requestBoard } from './planning';
import type { WorldUpdate } from '../services/worldUpdates';
export function updateLocation(update:Pick<WorldUpdate,'target'|'targetId'>){
  if(update.target==='npc')return update.targetId===lucia.id?{...lucia.approach,map:'cottage' as const,name:'Lucia'}:null;
  const plot=planningPlots.find(plot=>plot.id===update.targetId);
  if(plot)return {...plot.approach,map:'garden' as const,name:plot.name};
  if(update.targetId===studyDesk.id)return {...studyDesk.approach,map:'cottage' as const,name:'Study desk'};
  const room=homeLayout.find(room=>room.id===update.targetId);
  if(room)return {...homeAnchor(room.id,{x:homeRooms[room.definition].width/2,y:265}),map:'cottage' as const,name:homeRooms[room.definition].name};
  return {...requestBoard.approach,map:'garden' as const,name:'Request board'};
}
