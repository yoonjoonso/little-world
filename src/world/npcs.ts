import { lucia } from './home';
import type { MapId, Point } from './model';
export interface WorldNpc {id:string;name:string;role:string;map:MapId;position:()=>Point;approach:()=>Point;texture:string;frame:string;asset:string;width:number;height:number;greeting:string;portraitSize:string;portraitPosition:string}
export const onsen={id:'onsen.pool',x:240,y:850,solid:{x:80,y:775,w:320,h:180}};
export const worldNpcs:WorldNpc[]=[
  {id:'lucia',name:'Lucia',role:'your secretary',map:'cottage',position:()=>lucia.seat,approach:()=>lucia.approach,texture:'lucia',frame:'seated',asset:'characters/lucia-v1.png',width:30,height:70,greeting:'Welcome home. What would you like to work on?',portraitSize:'245px 245px',portraitPosition:'-25px -12px'},
  {id:'mochi',name:'Mochi',role:'onsen regular',map:'garden',position:()=>({x:190,y:905}),approach:()=>({x:155,y:1000}),texture:'capybaras',frame:'mochi',asset:'characters/capybaras-v1.png',width:53,height:78,greeting:'Mochi is enjoying the warm water, turtle backpack and all.',portraitSize:'160px 160px',portraitPosition:'0 -7px'},
  {id:'lilito',name:'Lilito',role:'onsen regular',map:'garden',position:()=>({x:290,y:912}),approach:()=>({x:305,y:1000}),texture:'capybaras',frame:'lilito',asset:'characters/capybaras-v1.png',width:42,height:59,greeting:'Lilito looks comfortable by the hot spring.',portraitSize:'200px 200px',portraitPosition:'-116px -48px'},
];
