import { homeAnchor } from './home';
import { canStand,move,type MapId,type Point,type WorldMap } from './model';
import type { BathSlot } from './bathing';
export type LocalActivity='running'|'fishing'|'playing'|'resting'|'showering'|'watching';
export interface ActivityTarget {id:string;map:MapId;name:string;verb:string;activity:LocalActivity;pose:'front'|'back'|'sitFront';approach:Point;exit:Point;foregroundDepth?:number;slots:BathSlot[];route?:Point[]}
export const trackRoute:Point[]=[{x:975,y:4118},{x:1190,y:4138},{x:1282,y:4280},{x:1190,y:4422},{x:975,y:4442},{x:760,y:4422},{x:668,y:4280},{x:760,y:4138}];
export const activityTargets:ActivityTarget[]=[
  {id:'big-bear.fishing',map:'garden',name:'Big Bear lakeshore',verb:'Fish at Big Bear',activity:'fishing',pose:'back',approach:{x:5950,y:4430},exit:{x:5950,y:4430},foregroundDepth:4450,slots:[{id:'big-bear.fishing.left',point:{x:5910,y:4380}},{id:'big-bear.fishing.right',point:{x:5990,y:4380}}]},
  {id:'home.reception.tv',map:'cottage',name:'TV sofa',verb:'Sit and watch TV',activity:'watching',pose:'sitFront',approach:{x:650,y:660},exit:{x:650,y:660},foregroundDepth:655,slots:[{id:'home.reception.tv.left',point:{x:625,y:620}},{id:'home.reception.tv.right',point:{x:675,y:620}}]},
  {id:'park.track',map:'garden',name:'running track',verb:'Run the track',activity:'running',pose:'front',approach:{x:975,y:4510},exit:{x:975,y:4510},slots:[{id:'park.track.runner-1',point:trackRoute[4]},{id:'park.track.runner-2',point:trackRoute[0]}],route:trackRoute},
  {id:'park.fishing',map:'garden',name:'fishing spot',verb:'Fish at the lake',activity:'fishing',pose:'back',approach:{x:2180,y:4560},exit:{x:2180,y:4560},foregroundDepth:4590,slots:[{id:'park.fishing.left',point:{x:2148,y:4500}},{id:'park.fishing.right',point:{x:2212,y:4500}}]},
  {id:'park.pickleball',map:'garden',name:'pickleball practice',verb:'Practice pickleball',activity:'playing',pose:'front',approach:{x:720,y:3820},exit:{x:720,y:3905},slots:[{id:'park.pickleball.left',point:{x:720,y:3760}},{id:'park.pickleball.right',point:{x:920,y:3760}}]},
  {id:'park.bench',map:'garden',name:'park bench',verb:'Sit at the park bench',activity:'resting',pose:'sitFront',approach:{x:1700,y:4458},exit:{x:1700,y:4458},foregroundDepth:4440,slots:[{id:'park.bench.left',point:{x:1677,y:4405}},{id:'park.bench.right',point:{x:1722,y:4405}}]},
  {id:'beach.bench',map:'garden',name:'beach bench',verb:'Sit by the beach',activity:'resting',pose:'sitFront',approach:{x:5250,y:5440},exit:{x:5250,y:5440},foregroundDepth:5430,slots:[{id:'beach.bench.left',point:{x:5227,y:5395}},{id:'beach.bench.right',point:{x:5272,y:5395}}]},
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
