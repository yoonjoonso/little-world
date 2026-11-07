import type { Point, Rect } from './model';

export interface PropDefinition {
  frame: string;
  atlas: 'cozy' | 'home' | 'office' | 'kitchen';
  width: number;
  height: number;
  solid?: Rect;
}
export const homeProps: Record<string, PropDefinition> = {
  bed: { atlas:'home', frame:'bed', width:160, height:180, solid:{x:-80,y:-90,w:160,h:180} },
  bath: { atlas:'home', frame:'bath', width:150, height:104, solid:{x:-75,y:-52,w:150,h:104} },
  bookcase: { atlas:'home', frame:'bookcase', width:100, height:110, solid:{x:-50,y:-35,w:100,h:70} },
  workDesk: { atlas:'home', frame:'workDesk', width:146, height:92, solid:{x:-73,y:-46,w:146,h:92} },
  secretaryDesk: { atlas:'cozy', frame:'desk', width:154, height:94, solid:{x:-77,y:-47,w:154,h:94} },
  frontDesk: { atlas:'office', frame:'frontDesk', width:146, height:100, solid:{x:-73,y:-40,w:146,h:80} },
  shower: { atlas:'office', frame:'shower', width:72, height:126, solid:{x:-36,y:-25,w:72,h:50} },
  sink: { atlas:'kitchen', frame:'sink', width:100, height:100, solid:{x:-45,y:-30,w:90,h:60} },
  stove: { atlas:'kitchen', frame:'stove', width:80, height:100, solid:{x:-35,y:-30,w:70,h:60} },
  fridge: { atlas:'kitchen', frame:'fridge', width:70, height:120, solid:{x:-30,y:-30,w:60,h:60} },
  diningTable: { atlas:'kitchen', frame:'diningTable', width:130, height:90, solid:{x:-60,y:-35,w:120,h:70} },
  chair: { atlas:'cozy', frame:'chair', width:38, height:48 },
  plant: { atlas:'cozy', frame:'planter', width:40, height:46, solid:{x:-20,y:-12,w:40,h:24} },
};
export interface PropInstance extends Point { id:string; definition:string }
export interface RoomDefinition {
  name:string; width:number; height:number; floor:'wood'|'ceramic';
  walls:Rect[]; props:PropInstance[];
}
export const homeRooms: Record<string,RoomDefinition> = {
  bedroom: {name:'Bedroom',width:270,height:280,floor:'wood',
    walls:[{x:0,y:272,w:90,h:12},{x:170,y:272,w:100,h:12},{x:266,y:0,w:12,h:280}],
    props:[{id:'bed',definition:'bed',x:130,y:135},{id:'plant',definition:'plant',x:230,y:45}]},
  bathroom: {name:'Bathroom',width:270,height:280,floor:'ceramic',
    walls:[{x:0,y:272,w:90,h:12},{x:170,y:272,w:100,h:12},{x:266,y:0,w:12,h:280}],
    props:[{id:'bath',definition:'bath',x:90,y:110},{id:'shower',definition:'shower',x:218,y:165}]},
  study: {name:'Study',width:320,height:280,floor:'wood',
    walls:[{x:0,y:272,w:110,h:12},{x:190,y:272,w:130,h:12}],
    props:[{id:'books',definition:'bookcase',x:65,y:70},{id:'desk',definition:'frontDesk',x:205,y:170},{id:'chair',definition:'chair',x:205,y:145}]},
  kitchen: {name:'Kitchen',width:300,height:300,floor:'ceramic',walls:[{x:292,y:0,w:12,h:150},{x:292,y:235,w:12,h:65}],
    props:[{id:'sink',definition:'sink',x:65,y:80},{id:'stove',definition:'stove',x:155,y:80},{id:'fridge',definition:'fridge',x:245,y:70},{id:'table',definition:'diningTable',x:130,y:220}]},
  reception: {name:'Reception',width:860,height:300,floor:'wood',walls:[],
    props:[{id:'secretary-desk',definition:'secretaryDesk',x:650,y:170},{id:'secretary-chair',definition:'chair',x:650,y:126},{id:'plant',definition:'plant',x:770,y:220}]},
};
export const homeLayout = [
  {id:'home.bedroom',definition:'bedroom',x:170,y:160},
  {id:'home.bathroom',definition:'bathroom',x:440,y:160},
  {id:'home.study',definition:'study',x:710,y:160},
  {id:'home.reception',definition:'reception',x:170,y:540},
  {id:'home.kitchen',definition:'kitchen',x:170,y:540},
];
export function homeAnchor(roomId:string,point:Point):Point {
  const room=homeLayout.find(room=>room.id===roomId);
  if(!room)throw new Error(`Unknown room: ${roomId}`);
  return {x:room.x+point.x,y:room.y+point.y};
}
export const studyDesk={id:'home.study.desk',get approach(){return homeAnchor('home.study',{x:205,y:110});},get seat(){return homeAnchor('home.study',{x:205,y:165});},get stand(){return homeAnchor('home.study',{x:130,y:110});}};
export const lucia={id:'lucia',name:'Lucia',roomId:'home.reception',defaultBehavior:'seated' as const,
  get seat(){return homeAnchor(this.roomId,{x:650,y:149});},
  get approach(){return homeAnchor(this.roomId,{x:650,y:238});},
};
export function homeSolids():Rect[] {
  return homeLayout.flatMap(room=>{
    const definition=homeRooms[room.definition];
    const local=[...definition.walls,...definition.props.flatMap(prop=>{
      const solid=homeProps[prop.definition].solid;
      return solid?[{...solid,x:prop.x+solid.x,y:prop.y+solid.y}]:[];
    })];
    return local.map(rect=>({...rect,x:room.x+rect.x,y:room.y+rect.y}));
  });
}

