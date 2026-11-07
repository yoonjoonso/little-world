import { WORLD_TIME_ZONE } from './clock';

export type NpcPhase='idle'|'walking'|'interacting'|'active'|'waiting'|'blocked';
export type NpcActivity='working'|'relaxing'|'reading'|'shopping'|'walking'|'eating'|'watching';
export interface NpcDefinition {id:string;name:string;homeArea:string;usualActivity:NpcActivity;outingAreas:string[];outingHour:number}
export const npcDefinitions:NpcDefinition[]=[
  {id:'mateo',name:'Mateo',homeArea:'taco.stand',usualActivity:'working',outingAreas:['village.commons'],outingHour:17},
  {id:'rosa',name:'Rosa',homeArea:'hotdog.cart',usualActivity:'working',outingAreas:['village.commons'],outingHour:16},
  {id:'lucia',name:'Lucia',homeArea:'home.reception',usualActivity:'working',outingAreas:['park.walk','northgate.browsing'],outingHour:12},
  {id:'mochi',name:'Mochi',homeArea:'onsen.pool',usualActivity:'relaxing',outingAreas:['park.walk','village.commons'],outingHour:10},
  {id:'lilito',name:'Lilito',homeArea:'onsen.pool',usualActivity:'relaxing',outingAreas:['park.walk','village.commons'],outingHour:15},
  {id:'pastor-cait',name:'Pastor Cait',homeArea:'church.office',usualActivity:'reading',outingAreas:['northgate.browsing','park.walk'],outingHour:14},
  {id:'imam-samir',name:'Imam Samir',homeArea:'mosque.study',usualActivity:'reading',outingAreas:['northgate.browsing','park.walk'],outingHour:13},
  {id:'rabbi-eli',name:'Rabbi Eli',homeArea:'synagogue.study',usualActivity:'reading',outingAreas:['library.reading','northgate.browsing'],outingHour:15},
  {id:'granthi-harjit',name:'Granthi Harjit',homeArea:'gurdwara.worship',usualActivity:'reading',outingAreas:['gurdwara.langar','northgate.browsing','park.walk'],outingHour:12},
];
function hash(value:string){let result=2166136261;for(const letter of value)result=Math.imul(result^letter.charCodeAt(0),16777619);return result>>>0;}
export interface RoutineIntent {areaId:string;activity:NpcActivity;reason:'usual'|'outing'|'unavailable';dayKey:string}
/** Plans only: the authoritative runner must reserve a slot and resolve a real route. */
export function planNpcRoutine(npc:NpcDefinition,date:Date,availableAreas:ReadonlySet<string>):RoutineIntent{
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:WORLD_TIME_ZONE,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(date);
  const part=(name:string)=>parts.find(value=>value.type===name)!.value;
  const dayKey=`${part('year')}-${part('month')}-${part('day')}`,minute=Number(part('hour'))*60+Number(part('minute'));
  const seed=hash(`${npc.id}:${dayKey}`),departure=npc.outingHour*60+(seed%21)-10;
  // Two days in three have one short outing. All clients derive the same daily plan.
  const outing=seed%3!==0&&minute>=departure&&minute<departure+45;
  const area=outing?npc.outingAreas[seed%npc.outingAreas.length]:npc.homeArea;
  if(!availableAreas.has(area))return {areaId:npc.homeArea,activity:npc.usualActivity,reason:'unavailable',dayKey};
  const activity:NpcActivity=area.startsWith('northgate')?'shopping':area.endsWith('langar')?'eating':outing?'walking':npc.usualActivity;
  return {areaId:area,activity,reason:outing?'outing':'usual',dayKey};
}
export interface ActivityArea {id:string;visitors:string[];activitySlots:string[];waitingSlots:string[]}
export interface SlotChoice {kind:'activity'|'wait'|'leave';slotId?:string}
/** Selects a candidate; a successful server reservation is still required before walking. */
export function chooseNpcSlot(area:ActivityArea,npcId:string,occupied:ReadonlySet<string>):SlotChoice{
  if(!area.visitors.includes(npcId))return {kind:'leave'};
  const activity=area.activitySlots.find(slot=>!occupied.has(slot));
  if(activity)return {kind:'activity',slotId:activity};
  const waiting=area.waitingSlots.find(slot=>!occupied.has(slot));
  return waiting?{kind:'wait',slotId:waiting}:{kind:'leave'};
}
