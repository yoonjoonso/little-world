import type { Point, Rect } from './model';

export interface PlanningPlot { id:string; name:string; size:'Small'|'Medium'|'Large'; bounds:Rect; approach:Point }
export const requestBoard={id:'world.request-board',x:800,y:550,approach:{x:800,y:625},solid:{x:722,y:500,w:156,h:92}};
export const planningPlots:PlanningPlot[]=[
  {id:'plot.east-small',name:'East garden plot',size:'Small',bounds:{x:1080,y:110,w:140,h:100},approach:{x:1150,y:240}},
  {id:'plot.east-medium',name:'Meadow plot',size:'Medium',bounds:{x:1060,y:440,w:240,h:150},approach:{x:1180,y:620}},
  {id:'plot.south-large',name:'South commons plot',size:'Large',bounds:{x:780,y:800,w:360,h:180},approach:{x:960,y:1010}},
];
// Full non-walkable exterior bounds. Exit is an interaction zone inside this enclosure.
export const homePerimeter:Rect[]=[
  {x:0,y:0,w:1200,h:160},{x:0,y:0,w:170,h:960},{x:1030,y:0,w:170,h:960},
  {x:0,y:840,w:1200,h:120},
];
