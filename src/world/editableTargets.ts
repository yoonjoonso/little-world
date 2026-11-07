import { homeLayout,homeRooms } from './home';
import { onsen } from './bathing';
import { worldNpcs } from './npcs';
import { planningPlots,requestBoard } from './planning';
export interface EditableTarget {id:string;name:string;kind:'building'|'npc'|'object'|'map'}
export const editableTargets:EditableTarget[]=[
  {id:'player.yoon',name:'Yoon · player avatar',kind:'npc'},
  {id:'player.lila',name:'Lila · player avatar',kind:'npc'},
  ...worldNpcs.map(npc=>({id:npc.id,name:npc.name,kind:'npc' as const})),
  {id:'garden',name:'Village commons',kind:'building'},
  {id:'cottage',name:'Home & office',kind:'building'},
  {id:onsen.id,name:'Onsen',kind:'building'},
  ...homeLayout.map(room=>({id:room.id,name:homeRooms[room.definition].name,kind:'building' as const})),
  ...homeLayout.flatMap(room=>homeRooms[room.definition].props.map(prop=>({id:`${room.id}.${prop.id}`,name:`${homeRooms[room.definition].name} · ${prop.id.replaceAll('-',' ')}`,kind:'object' as const}))),
  {id:requestBoard.id,name:'Request board',kind:'object'},
  ...planningPlots.map(plot=>({id:plot.id,name:plot.name,kind:'map' as const})),
];
export function targetsForKind(kind:EditableTarget['kind']){return editableTargets.filter(target=>target.kind===kind||(kind==='map'&&target.kind==='building'));}
