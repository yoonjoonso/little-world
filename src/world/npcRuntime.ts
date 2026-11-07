import { homeExterior } from './layout';
import { maps, type MapId, type Point } from './model';
import { findRoute } from './navigation';
import { worldNpcs } from './npcs';
import { npcDefinitions, planNpcRoutine, type NpcPhase } from './npcRoutines';

interface Place {id:string;map:MapId;slots:Point[];waiting:Point[]}
const places:Place[]=[
  {id:'park.walk',map:'garden',slots:[{x:1550,y:3520},{x:1600,y:3520},{x:1650,y:3520}],waiting:[{x:1550,y:3580},{x:1600,y:3580}]},
  {id:'northgate.browsing',map:'garden',slots:[{x:3190,y:3080},{x:3240,y:3080}],waiting:[{x:3190,y:3140},{x:3240,y:3140}]},
  {id:'village.commons',map:'garden',slots:[{x:1350,y:1450},{x:1400,y:1450}],waiting:[{x:1350,y:1510},{x:1400,y:1510}]},
];
export interface NpcState {id:string;map:MapId;position:Point;phase:NpcPhase;areaId:string;home:boolean;route:Point[];reservation?:string;retryAt:number;waitingSince?:number}
const distance=(a:Point,b:Point)=>Math.hypot(a.x-b.x,a.y-b.y);
/** Local preview authority. Never run alongside a connected shared-world authority. */
export class NpcRuntime {
  states=worldNpcs.map(npc=>({id:npc.id,map:npc.map,position:{...npc.position()},phase:'active' as NpcPhase,areaId:npcDefinitions.find(n=>n.id===npc.id)!.homeArea,home:true,route:[],retryAt:0} satisfies NpcState)) as NpcState[];
  private reservations=new Map<string,string>();
  private elapsed=0;
  private planningAt=0;
  get(id:string){return this.states.find(state=>state.id===id)!;}
  approach(id:string){const state=this.get(id);return state.home?worldNpcs.find(npc=>npc.id===id)!.approach():state.position;}
  private landing(id:string){const npc=worldNpcs.find(n=>n.id===id)!;return id==='lucia'?{x:820,y:630}:npc.bathing?npc.approach():npc.position();}
  private release(state:NpcState){if(state.reservation)this.reservations.delete(state.reservation);state.reservation=undefined;}
  private route(state:NpcState,target:Point,targetMap:MapId){
    const endpoint=state.map===targetMap?target:state.map==='cottage'?{x:600,y:808}:homeExterior.entrance;
    const route=findRoute(maps[state.map],state.position,endpoint);
    if(!route){state.phase='blocked';state.retryAt=this.elapsed+10000;return false;}
    state.route=route;state.phase='walking';return true;
  }
  private destinations=new Map<string,{point:Point;map:MapId;home:boolean;waiting:boolean}>();
  private plan(date:Date,obstacles:{map:MapId;position:Point}[]){
    const available=new Set([...places.map(place=>place.id),...npcDefinitions.map(npc=>npc.homeArea)]);
    for(const definition of npcDefinitions){const state=this.get(definition.id);if(state.phase==='interacting'||state.retryAt>this.elapsed)continue;
      const intent=planNpcRoutine(definition,date,available);
      if(state.areaId===intent.areaId&&state.phase!=='blocked'&&state.phase!=='waiting')continue;
      if(state.waitingSince&&this.elapsed-state.waitingSince>30000){this.release(state);this.destinations.delete(state.id);state.areaId='';state.waitingSince=undefined;state.retryAt=this.elapsed+60000;this.goHome(state);continue;}
      if(state.home&&obstacles.some(other=>other.map===state.map&&distance(other.position,this.landing(state.id))<35)){state.retryAt=this.elapsed+5000;continue;}
      this.release(state);
      const place=places.find(place=>place.id===intent.areaId);
      if(!place){this.goHome(state);continue;}
      let selected:{point:Point;key:string;waiting:boolean}|undefined;
      for(const [kind,points] of [['activity',place.slots],['wait',place.waiting]] as const){const index=points.findIndex((point,i)=>!this.reservations.has(`${place.id}:${kind}:${i}`)&&!obstacles.some(other=>other.map===place.map&&distance(other.position,point)<35));if(index>=0){selected={point:points[index],key:`${place.id}:${kind}:${index}`,waiting:kind==='wait'};break;}}
      if(!selected){this.goHome(state);state.retryAt=this.elapsed+30000;continue;}
      this.reservations.set(selected.key,state.id);state.reservation=selected.key;state.areaId=place.id;
      this.depart(state);this.destinations.set(state.id,{point:selected.point,map:place.map,home:false,waiting:selected.waiting});
      if(!this.route(state,selected.point,place.map))this.release(state);
    }
  }
  private depart(state:NpcState){if(state.home){state.position={...this.landing(state.id)};state.home=false;}}
  private goHome(state:NpcState){const npc=worldNpcs.find(n=>n.id===state.id)!;state.areaId=npcDefinitions.find(n=>n.id===state.id)!.homeArea;this.destinations.set(state.id,{point:this.landing(state.id),map:npc.map,home:true,waiting:false});if(state.home){state.phase='active';return;}this.route(state,this.landing(state.id),npc.map);}
  step(delta:number,date:Date,obstacles:{map:MapId;position:Point}[],heldId?:string){
    const dt=Math.min(delta,100);this.elapsed+=dt;
    if(this.elapsed>=this.planningAt){this.planningAt=this.elapsed+5000;this.plan(date,obstacles);}
    for(const state of this.states){
      if(state.id===heldId){state.phase='interacting';continue;}if(state.phase==='interacting')state.phase=state.route.length?'walking':state.home?'active':'waiting';
      if(!state.route.length)continue;
      const next=state.route[0],length=distance(next,state.position),speed=55*dt/1000;
      const position=length<=speed?{...next}:{x:state.position.x+(next.x-state.position.x)*speed/length,y:state.position.y+(next.y-state.position.y)*speed/length};
      const blocked=[...obstacles,...this.states.filter(other=>other.id!==state.id&&!other.home)].some(other=>other.map===state.map&&distance(position,other.position)<30&&distance(position,other.position)<distance(state.position,other.position));
      if(blocked){state.phase='waiting';state.waitingSince??=this.elapsed;
        if(this.elapsed-state.waitingSince>5000){const destination=this.destinations.get(state.id);if(destination){const map=maps[state.map],dynamic=[...obstacles,...this.states.filter(other=>other.id!==state.id)].filter(other=>other.map===state.map&&distance(other.position,state.position)>30);const endpoint=state.route.at(-1)!;const detour=findRoute({...map,solids:[...map.solids,...dynamic.map(other=>({x:other.position.x-22,y:other.position.y-22,w:44,h:44}))]},state.position,endpoint);if(detour){state.route=detour;state.waitingSince=undefined;}}}continue;}

      state.phase='walking';state.waitingSince=undefined;state.position=position;if(length>speed)continue;state.route.shift();if(state.route.length)continue;
      const destination=this.destinations.get(state.id);if(!destination)continue;
      if(destination.map!==state.map){const portal=maps[state.map].portals.find(portal=>portal.target===destination.map)!;if(obstacles.some(o=>o.map===portal.target&&distance(o.position,portal.spawn)<35)){state.route=[next];state.phase='waiting';continue;}state.map=portal.target;state.position={...portal.spawn};this.route(state,destination.point,destination.map);continue;}
      state.phase=destination.waiting?'waiting':'active';if(destination.waiting)state.waitingSince??=this.elapsed;
      if(destination.home){state.home=true;state.position={...worldNpcs.find(npc=>npc.id===state.id)!.position()};this.release(state);}
    }
  }
}
