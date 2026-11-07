import { onsen } from './bathing';
import { homePerimeter, requestBoard } from './planning';
import { homeSolids } from './home';
export type MapId = 'garden' | 'cottage';
export interface Point { x: number; y: number }
export interface Rect extends Point { w: number; h: number }
export interface Portal { area: Rect; target: MapId; spawn: Point; label: string }
export interface WorldMap { id: MapId; name: string; width: number; height: number; spawn: Point; solids: Rect[]; portals: Portal[] }
export const maps: Record<MapId, WorldMap> = {
  garden:{id:'garden',name:'Village Commons',width:1440,height:1120,spawn:{x:466,y:430},
    solids:[{x:342,y:160,w:244,h:168},requestBoard.solid,onsen.solid],
    portals:[{area:{x:445,y:321,w:40,h:47},target:'cottage',spawn:{x:600,y:770},label:'Enter our home'}]},
  cottage:{id:'cottage',name:'Our Home & Office',width:1200,height:960,spawn:{x:600,y:770},
    solids:[...homePerimeter,...homeSolids()],
    portals:[{area:{x:558,y:800,w:84,h:40},target:'garden',spawn:{x:466,y:395},label:'Exit house'}]},
};
export function overlaps(a: Rect,b: Rect) { return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y; }
export function canStand(map: WorldMap, p: Point) {
  const body = {x:p.x-9,y:p.y-6,w:18,h:12};
  return body.x>=24 && body.y>=24 && body.x+body.w<=map.width-24 && body.y+body.h<=map.height-24 && !map.solids.some(s=>overlaps(body,s));
}
export function move(map: WorldMap,p: Point,dx: number,dy: number,delta: number,speedMultiplier=1): Point {
  const length=Math.hypot(dx,dy); if(!length) return p;
  const distance=150*speedMultiplier*Math.min(delta,50)/1000;
  const next={...p}; const x=dx/length*distance, y=dy/length*distance;
  if(canStand(map,{x:next.x+x,y:next.y})) next.x+=x;
  if(canStand(map,{x:next.x,y:next.y+y})) next.y+=y;
  return next;
}
export function portalAt(map: WorldMap,p: Point) { return map.portals.find(t=>overlaps(t.area,{...p,w:1,h:1})); }
export function nearby(p: Point,target: Point,radius=65) { return Math.hypot(p.x-target.x,p.y-target.y)<radius; }
export interface BuildDraft { id: string; title: string; description: string; status: 'draft'; createdAt: string }
export function makeDraft(title: string,description: string): BuildDraft {
  const name=title.trim(), brief=description.trim();
  if(!name || name.length>60 || brief.length>1000) throw new Error('Use a title of 1–60 characters and a description under 1,000 characters.');
  return {id:crypto.randomUUID(),title:name,description:brief,status:'draft',createdAt:new Date().toISOString()};
}
