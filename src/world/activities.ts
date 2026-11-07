import { homeAnchor } from './home';
import { canStand,move,type MapId,type Point,type WorldMap } from './model';
import type { BathSlot } from './bathing';
export type LocalActivity='running'|'fishing'|'playing'|'resting'|'showering';
export interface ActivityTarget {id:string;map:MapId;name:string;verb:string;activity:LocalActivity;pose:'front'|'back'|'sitFront';approach:Point;exit:Point;foregroundDepth?:number;slots:BathSlot[];route?:Point[]}
export const trackRoute:Point[]=[{x:740,y:1208},{x:900,y:1225},{x:962,y:1340},{x:900,y:1455},{x:740,y:1472},{x:580,y:1455},{x:518,y:1340},{x:580,y:1225}];
export const activityTargets:ActivityTarget[]=[
  {id:'park.track',map:'garden',name:'running track',verb:'Run the track',activity:'running',pose:'front',approach:{x:740,y:1530},exit:{x:740,y:1530},slots:[{id:'park.track.runner-1',point:trackRoute[4]},{id:'park.track.runner-2',point:trackRoute[0]}],route:trackRoute},
  {id:'park.fishing',map:'garden',name:'fishing spot',verb:'Fish at the lake',activity:'fishing',pose:'back',approach:{x:1200,y:1678},exit:{x:1200,y:1678},foregroundDepth:1700,slots:[{id:'park.fishing.left',point:{x:1168,y:1640}},{id:'park.fishing.right',point:{x:1232,y:1640}}]},
  {id:'park.pickleball',map:'garden',name:'pickleball practice',verb:'Practice pickleball',activity:'playing',pose:'front',approach:{x:150,y:1370},exit:{x:150,y:1455},slots:[{id:'park.pickleball.left',point:{x:150,y:1310}},{id:'park.pickleball.right',point:{x:350,y:1310}}]},
  {id:'park.bench',map:'garden',name:'park bench',verb:'Sit at the park bench',activity:'resting',pose:'sitFront',approach:{x:760,y:1668},exit:{x:760,y:1668},foregroundDepth:1645,slots:[{id:'park.bench.left',point:{x:737,y:1615}},{id:'park.bench.right',point:{x:782,y:1615}}]},
  {id:'beach.bench',map:'garden',name:'beach bench',verb:'Sit by the beach',activity:'resting',pose:'sitFront',approach:{x:1900,y:1940},exit:{x:1900,y:1940},foregroundDepth:1930,slots:[{id:'beach.bench.left',point:{x:1877,y:1895}},{id:'beach.bench.right',point:{x:1922,y:1895}}]},
  {id:'home.bathroom.shower',map:'cottage',name:'shower',verb:'Take a shower',activity:'showering',pose:'front',get approach(){return homeAnchor('home.bathroom',{x:180,y:245});},get exit(){return homeAnchor('home.bathroom',{x:180,y:245});},foregroundDepth:390,get slots(){return [{id:'home.bathroom.shower.stand',point:homeAnchor('home.bathroom',{x:218,y:205})}];}},
];
export function chooseActivitySlot(target:ActivityTarget,occupied:ReadonlySet<string>){return target.slots.find(slot=>!occupied.has(slot.id));}
export function advanceTrack(map:WorldMap,position:Point,route:Point[],index:number,delta:number){
  const target=route[index],dx=target.x-position.x,dy=target.y-position.y,distance=Math.hypot(dx,dy);
  const step=130*Math.min(delta,50)/1000;
  if(distance<=step&&canStand(map,target))return {position:{...target},index:(index+1)%route.length,blocked:false,dx,dy};
  const next=move(map,position,dx,dy,delta,130/150);
  return {position:next,index,blocked:distance>10&&next.x===position.x&&next.y===position.y,dx,dy};
}

export function routeIndexForPoint(route:Point[],position:Point){
  let best=0,bestDistance=Infinity;
  for(let i=0;i<route.length;i++){
    const a=route[i],b=route[(i+1)%route.length],dx=b.x-a.x,dy=b.y-a.y;
    const t=Math.max(0,Math.min(1,((position.x-a.x)*dx+(position.y-a.y)*dy)/(dx*dx+dy*dy||1)));
    const distance=Math.hypot(position.x-a.x-dx*t,position.y-a.y-dy*t);
    if(distance<bestDistance){bestDistance=distance;best=(i+1)%route.length;}
  }
  return best;
}
