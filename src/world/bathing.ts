import { homeAnchor } from './home';
import type { MapId,Point } from './model';

export const onsen={id:'onsen.pool',x:2050,y:3700,solid:{x:1890,y:3625,w:320,h:180}};
export interface BathSlot {id:string;point:Point;reservedFor?:string}
export interface BathingTarget {id:string;map:MapId;name:string;approach:Point;exit:Point;waterColor:number;visibleFraction:number;foregroundDepth:number;slots:BathSlot[]}
export const bathingTargets:BathingTarget[]=[
  {id:onsen.id,map:'garden',name:'onsen',approach:{x:2050,y:3850},exit:{x:2050,y:3850},waterColor:0x8cbeb3,visibleFraction:.58,foregroundDepth:3710,
    slots:[{id:'onsen.mochi',point:{x:2000,y:3755},reservedFor:'mochi'},{id:'onsen.lilito',point:{x:2100,y:3762},reservedFor:'lilito'},{id:'onsen.guest-left',point:{x:1955,y:3710}},{id:'onsen.guest-right',point:{x:2140,y:3710}}]},
  {id:'beach.water',map:'garden',name:'Long Beach water',approach:{x:5850,y:5520},exit:{x:5850,y:5520},waterColor:0x24abb7,visibleFraction:.58,foregroundDepth:5660,slots:[{id:'beach.water.left',point:{x:5600,y:5720}},{id:'beach.water.right',point:{x:6100,y:5720}}]},
  {id:'home.bathroom.bath',map:'cottage',name:'bathtub',get approach(){return homeAnchor('home.bathroom',{x:90,y:190});},get exit(){return homeAnchor('home.bathroom',{x:90,y:190});},waterColor:0xa0c4bd,visibleFraction:.58,foregroundDepth:350,
    get slots(){return [{id:'home.bathroom.bath.seat',point:homeAnchor('home.bathroom',{x:90,y:125})}];}},
];
/** Finds a candidate only; shared play still needs an atomic server reservation. */
export function freeBathSlot(target:BathingTarget,occupied:ReadonlySet<string>){return target.slots.find(slot=>!slot.reservedFor&&!occupied.has(slot.id));}
