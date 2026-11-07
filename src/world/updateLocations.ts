import { park } from './park';
import { activityTargets } from './activities';
import { villageBuildings,buildingApproach } from './buildings';
import { worldNpcs } from './npcs';
import { homeAnchor, homeLayout, homeRooms, studyDesk } from './home';
import { planningPlots, requestBoard } from './planning';
import type { WorldUpdate } from '../services/worldUpdates';
import type { MapId,Point } from './model';
const npcLocations=new Map<string,{map:MapId;point:Point}>();
export function setNpcLocation(id:string,map:MapId,point:Point){npcLocations.set(id,{map,point:{...point}});}
export function updateLocation(update:Pick<WorldUpdate,'target'|'targetId'>){
  if(update.target==='npc'){const npc=worldNpcs.find(npc=>npc.id===update.targetId),location=npcLocations.get(update.targetId);return npc?{...(location?.point||npc.approach()),map:location?.map||npc.map,name:npc.name}:null;}
  if(update.targetId==='big-bear')return {x:5950,y:4600,map:'garden' as const,name:'Big Bear'};
  const activity=activityTargets.find(target=>target.id===update.targetId);if(activity)return {...activity.approach,map:activity.map,name:activity.name};
  const building=villageBuildings.find(building=>building.id===update.targetId);if(building)return {...buildingApproach(building),map:'garden' as const,name:building.name};
  const plot=planningPlots.find(plot=>plot.id===update.targetId);
  if(plot)return {...plot.approach,map:'garden' as const,name:plot.name};
  if(update.targetId===studyDesk.id)return {...studyDesk.approach,map:'cottage' as const,name:'Study desk'};
  const room=homeLayout.find(room=>room.id===update.targetId);
  if(room)return {...homeAnchor(room.id,{x:homeRooms[room.definition].width/2,y:265}),map:'cottage' as const,name:homeRooms[room.definition].name};
  return {...requestBoard.approach,map:'garden' as const,name:'Request board'};
}
