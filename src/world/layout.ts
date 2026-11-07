import type { Point,Rect } from './model';
export const worldSize={width:7200,height:6000};
export const homeExterior={x:800,y:620,width:500,height:390,entrance:{x:800,y:865},spawn:{x:800,y:925},solid:{x:550,y:425,w:500,h:390}};
export const roads:Point[][]=[
 [{x:400,y:1100},{x:5700,y:1100}],
 [{x:2050,y:1100},{x:2050,y:3200}],
 [{x:2050,y:1900},{x:5700,y:1900}],
 [{x:4650,y:1100},{x:4650,y:3400}],
 [{x:400,y:3200},{x:4650,y:3200}],
];
export const walks:Point[][]=[
 [{x:800,y:870},{x:800,y:1100}],
 [{x:1250,y:1390},{x:1450,y:1390}],
 [{x:1450,y:1100},{x:1450,y:1550},{x:2050,y:1550}],
 [{x:2050,y:1800},{x:2050,y:3200}],
 [{x:650,y:2400},{x:1850,y:2400},{x:1850,y:3100}],
 [{x:650,y:3100},{x:1850,y:3100}],
 [{x:450,y:3500},{x:2700,y:3500}],
 [{x:2700,y:3945},{x:3200,y:3945}],
 [{x:3300,y:3085},{x:3300,y:3200}],
 [{x:2450,y:3110},{x:2450,y:3200}],
 [{x:4250,y:3115},{x:4250,y:3200}],
 [{x:2050,y:3850},{x:2050,y:4050}],
 [{x:450,y:3500},{x:450,y:4550},{x:2700,y:4550},{x:2700,y:3500}],
 [{x:1500,y:3500},{x:1500,y:4550}],
 [{x:1500,y:4050},{x:2700,y:4050}],
];
export const trails:Point[][]=[
 [{x:4650,y:3200},{x:4900,y:3550},{x:5100,y:4000},{x:5600,y:4600},{x:6550,y:4500},{x:6750,y:3650}],
 [{x:4650,y:3200},{x:4800,y:4400},{x:5000,y:5050},{x:5650,y:5200}],
];
export const regions:{name:string;bounds:Rect}[]=[
 {name:'Onsen area',bounds:{x:1800,y:3450,w:500,h:500}},
 {name:'Long Beach',bounds:{x:4500,y:4750,w:2700,h:1250}},
 {name:'Big Bear',bounds:{x:4800,y:3100,w:2400,h:1650}},
 {name:'Park area',bounds:{x:250,y:3300,w:2800,h:1450}},
 {name:'Religious buildings area',bounds:{x:250,y:1700,w:1750,h:1550}},
 {name:'Hospital area',bounds:{x:4000,y:150,w:1800,h:1750}},
 {name:'Northgate area',bounds:{x:2100,y:1950,w:2500,h:1300}},
 {name:'Mall area',bounds:{x:2150,y:150,w:1850,h:1750}},
 {name:'Home area',bounds:{x:250,y:200,w:1750,h:1500}},
];
export function regionAt(p:Point){return regions.find(region=>p.x>=region.bounds.x&&p.x<region.bounds.x+region.bounds.w&&p.y>=region.bounds.y&&p.y<region.bounds.y+region.bounds.h)?.name||'Town outskirts';}
