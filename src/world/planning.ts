import type { Point, Rect } from './model';

export interface PlanningPlot { id:string; name:string; size:'Small'|'Medium'|'Large'; bounds:Rect; approach:Point }
export const requestBoard={id:'world.request-board',x:2500,y:2670,approach:{x:2500,y:2760},solid:{x:2422,y:2620,w:156,h:92}};
export const planningPlots:PlanningPlot[]=[
  {id:'plot.east-small',name:'East garden plot',size:'Small',bounds:{x:900,y:2500,w:250,h:180},approach:{x:1025,y:2710}},
  {id:'plot.east-medium',name:'Meadow plot',size:'Medium',bounds:{x:3500,y:3600,w:400,h:280},approach:{x:3700,y:3920}},
  {id:'plot.south-large',name:'South commons plot',size:'Large',bounds:{x:3300,y:4200,w:600,h:350},approach:{x:3600,y:4590}},
];
// Full non-walkable exterior bounds. Exit is an interaction zone inside this enclosure.
export const homePerimeter:Rect[]=[
  {x:0,y:0,w:1200,h:160},{x:0,y:0,w:170,h:960},{x:1030,y:0,w:170,h:960},
  {x:0,y:840,w:1200,h:120},
];
