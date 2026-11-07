import { homeAnchor } from './home';
import type { MapId,Point } from './model';

export const onsen={id:'onsen.pool',x:240,y:850,solid:{x:80,y:775,w:320,h:180}};
export interface BathSlot {id:string;point:Point;reservedFor?:string}
export interface BathingTarget {id:string;map:MapId;name:string;approach:Point;exit:Point;waterColor:number;visibleFraction:number;foregroundDepth:number;slots:BathSlot[]}
export const bathingTargets:BathingTarget[]=[
  {id:onsen.id,map:'garden',name:'onsen',approach:{x:240,y:1000},exit:{x:240,y:1000},waterColor:0x8cbeb3,visibleFraction:.58,foregroundDepth:810,
    slots:[{id:'onsen.mochi',point:{x:190,y:905},reservedFor:'mochi'},{id:'onsen.lilito',point:{x:290,y:912},reservedFor:'lilito'},{id:'onsen.guest-left',point:{x:145,y:860}},{id:'onsen.guest-right',point:{x:330,y:860}}]},
  {id:'beach.water',map:'garden',name:'beach water',approach:{x:2300,y:1910},exit:{x:2300,y:1910},waterColor:0x24abb7,visibleFraction:.58,foregroundDepth:1945,slots:[{id:'beach.water.left',point:{x:2160,y:1980}},{id:'beach.water.right',point:{x:2360,y:1980}}]},
  {id:'home.bathroom.bath',map:'cottage',name:'bathtub',get approach(){return homeAnchor('home.bathroom',{x:90,y:190});},get exit(){return homeAnchor('home.bathroom',{x:90,y:190});},waterColor:0xa0c4bd,visibleFraction:.58,foregroundDepth:350,
    get slots(){return [{id:'home.bathroom.bath.seat',point:homeAnchor('home.bathroom',{x:90,y:125})}];}},
];
/** Finds a candidate only; shared play still needs an atomic server reservation. */
export function freeBathSlot(target:BathingTarget,occupied:ReadonlySet<string>){return target.slots.find(slot=>!slot.reservedFor&&!occupied.has(slot.id));}
