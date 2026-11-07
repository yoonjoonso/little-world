import type { Point,Rect } from './model';
export interface VillageBuilding {
  id:string;name:string;district:'strip-mall'|'faith'|'village';
  texture:'storefronts'|'faith';frame:string;position:Point;width:number;height:number;
  status:'coming-soon';interiorPlan:string;
}
export const villageBuildings:VillageBuilding[]=[
  {id:'cinema',name:'Movie Theater',district:'strip-mall',texture:'storefronts',frame:'store',position:{x:1100,y:250},width:240,height:210,status:'coming-soon',interiorPlan:'Reception and concessions beside one auditorium, with individual seats.'},
  {id:'taco-bell',name:'Taco Bell',district:'strip-mall',texture:'storefronts',frame:'store',position:{x:1400,y:250},width:230,height:200,status:'coming-soon',interiorPlan:'Counter, takeout queue and dining seats.'},
  {id:'golden-dragon',name:'Golden Dragon',district:'strip-mall',texture:'storefronts',frame:'store',position:{x:1700,y:250},width:230,height:200,status:'coming-soon',interiorPlan:'A neighborhood Chinese restaurant with dining tables.'},
  {id:'little-caesars',name:'Little Caesars',district:'strip-mall',texture:'storefronts',frame:'store',position:{x:2000,y:250},width:230,height:200,status:'coming-soon',interiorPlan:'Pizza counter with pickup and waiting places.'},
  {id:'hospital',name:'Hospital',district:'village',texture:'storefronts',frame:'store',position:{x:2350,y:250},width:230,height:200,status:'coming-soon',interiorPlan:'Lila’s work location; reception and working activity anchors.'},
  {id:'pollo-campero',name:'Pollo Campero',district:'strip-mall',texture:'storefronts',frame:'store',position:{x:1100,y:620},width:230,height:200,status:'coming-soon',interiorPlan:'Chicken restaurant with order, pickup and dining places.'},
  {id:'carls-jr',name:"Carl’s Jr.",district:'strip-mall',texture:'storefronts',frame:'store',position:{x:1400,y:620},width:230,height:200,status:'coming-soon',interiorPlan:'Burger counter and dining seats.'},
  {id:'starbucks',name:'Starbucks',district:'strip-mall',texture:'storefronts',frame:'store',position:{x:1700,y:620},width:230,height:200,status:'coming-soon',interiorPlan:'Coffee counter, takeout queue and café seating.'},
  {id:'northgate',name:'Northgate Groceries',district:'strip-mall',texture:'storefronts',frame:'grocery',position:{x:2060,y:620},width:300,height:280,status:'coming-soon',interiorPlan:'Mexican-market-inspired supermarket; produce, browsing spots and a spaced checkout queue.'},
  {id:'bar',name:'Neighborhood Bar',district:'village',texture:'storefronts',frame:'store',position:{x:2400,y:620},width:200,height:180,status:'coming-soon',interiorPlan:'Bar counter and separate stools for drinking/chatting activities.'},
  {id:'gym',name:'Gym',district:'village',texture:'storefronts',frame:'store',position:{x:160,y:250},width:210,height:185,status:'coming-soon',interiorPlan:'Exercise stations with individual activity slots and waiting space.'},
  {id:'library',name:'Library',district:'village',texture:'storefronts',frame:'store',position:{x:160,y:550},width:210,height:185,status:'coming-soon',interiorPlan:'Reading and work desks, bookshelves and quiet seating.'},
  {id:'church',name:'Methodist Church',district:'faith',texture:'faith',frame:'church',position:{x:1270,y:1050},width:240,height:280,status:'coming-soon',interiorPlan:'Worship space and office; Pastor Cait normally spends time here.'},
  {id:'mosque',name:'Mosque',district:'faith',texture:'faith',frame:'mosque',position:{x:1600,y:1050},width:240,height:280,status:'coming-soon',interiorPlan:'Worship and study space; Imam Samir is the resident leader.'},
  {id:'synagogue',name:'Synagogue',district:'faith',texture:'faith',frame:'synagogue',position:{x:1930,y:1050},width:240,height:250,status:'coming-soon',interiorPlan:'Worship and study space; Rabbi Eli is the resident leader.'},
  {id:'gurdwara',name:'Sikh Gurdwara',district:'faith',texture:'faith',frame:'gurdwara',position:{x:2260,y:1050},width:240,height:270,status:'coming-soon',interiorPlan:'Separate worship space and langar hall; Granthi Harjit is the resident leader.'},
];
export function buildingApproach(building:VillageBuilding):Point{return {x:building.position.x,y:building.position.y+building.height/2+35};}
export function buildingSolid(building:VillageBuilding):Rect{return {x:building.position.x-building.width/2+10,y:building.position.y-30,w:building.width-20,h:building.height/2+30};}
