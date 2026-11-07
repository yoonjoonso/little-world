import type { Point,Rect } from './model';
export interface VillageBuilding {
  id:string;name:string;district:'strip-mall'|'faith'|'village';
  asset:string;position:Point;width:number;height:number;
  status:'coming-soon';interiorPlan:string;
}
export const villageBuildings:VillageBuilding[]=[
  {id:'arena',name:'Town Arena',district:'village',asset:'single/building-arena.png',position:{x:6100,y:3600},width:1800,height:1000,status:'coming-soon',interiorPlan:'A large flexible sports and concert arena. Interior design will follow later.'},
  {id:'steakhouse',name:'Oak & Iron Steakhouse',district:'village',asset:'single/building-steakhouse.png',position:{x:3100,y:2120},width:500,height:280,status:'coming-soon',interiorPlan:'A sit-down steakhouse beside the commons, with a host stand, booths and dining tables. Interior coming later.'},
  {id:'cinema',name:'AMC',district:'strip-mall',asset:'single/building-cinema.png',position:{x:2800,y:840},width:800,height:380,status:'coming-soon',interiorPlan:'Reception and concessions beside one auditorium, with individual seats.'},
  {id:'taco-bell',name:'Taco Bell',district:'strip-mall',asset:'single/building-taco-bell.png',position:{x:2500,y:1650},width:390,height:340,status:'coming-soon',interiorPlan:'Counter, takeout queue and dining seats.'},
  {id:'golden-dragon',name:'Golden Dragon',district:'strip-mall',asset:'single/building-golden-dragon.png',position:{x:2925,y:1650},width:390,height:340,status:'coming-soon',interiorPlan:'A neighborhood Chinese restaurant with dining tables.'},
  {id:'little-caesars',name:'Little Caesars',district:'strip-mall',asset:'single/building-little-caesars.png',position:{x:4350,y:1650},width:420,height:365,status:'coming-soon',interiorPlan:'Pizza counter with pickup and waiting places.'},
  {id:'hospital',name:'Hospital',district:'village',asset:'single/building-hospital.png',position:{x:4900,y:790},width:1000,height:480,status:'coming-soon',interiorPlan:'Lila’s work location; reception and working activity anchors.'},
  {id:'pollo-campero',name:'Pollo Campero',district:'strip-mall',asset:'single/building-pollo-campero.png',position:{x:2450,y:2880},width:450,height:390,status:'coming-soon',interiorPlan:'Chicken restaurant with order, pickup and dining places.'},
  {id:'carls-jr',name:'Carl’s Jr.',district:'strip-mall',asset:'single/building-carls-jr.png',position:{x:5050,y:1650},width:420,height:365,status:'coming-soon',interiorPlan:'Burger counter and dining seats.'},
  {id:'starbucks',name:'Starbucks',district:'strip-mall',asset:'single/building-starbucks.png',position:{x:3350,y:1650},width:390,height:340,status:'coming-soon',interiorPlan:'Coffee counter, takeout queue and café seating.'},
  {id:'northgate',name:'Northgate Groceries',district:'strip-mall',asset:'single/building-northgate.png',position:{x:3300,y:2660},width:900,height:780,status:'coming-soon',interiorPlan:'Mexican-market-inspired supermarket; produce, browsing spots and a spaced checkout queue.'},
  {id:'bar',name:'La Jara Brewery',district:'village',asset:'single/building-bar.png',position:{x:4250,y:2820},width:600,height:520,status:'coming-soon',interiorPlan:'Brewery taproom, brewing equipment and separate tasting tables.'},
  {id:'gym',name:'Planet Fitness',district:'village',asset:'single/building-gym.png',position:{x:3900,y:1550},width:620,height:250,status:'coming-soon',interiorPlan:'Exercise stations with individual activity slots and waiting space.'},
  {id:'library',name:'Library',district:'village',asset:'single/building-library.png',position:{x:3200,y:3670},width:540,height:480,status:'coming-soon',interiorPlan:'Reading and work desks, bookshelves and quiet seating.'},
  {id:'church',name:'Church',district:'faith',asset:'single/building-church.png',position:{x:650,y:2050},width:440,height:530,status:'coming-soon',interiorPlan:'Worship space and office; Pastor Cait normally spends time here.'},
  {id:'mosque',name:'Mosque',district:'faith',asset:'single/building-mosque.png',position:{x:1450,y:2050},width:500,height:590,status:'coming-soon',interiorPlan:'Worship and study space; Imam Samir is the resident leader.'},
  {id:'synagogue',name:'Synagogue',district:'faith',asset:'single/building-synagogue.png',position:{x:650,y:2800},width:480,height:435,status:'coming-soon',interiorPlan:'Worship and study space; Rabbi Eli is the resident leader.'},
  {id:'gurdwara',name:'Sikh Gurdwara',district:'faith',asset:'single/building-gurdwara.png',position:{x:1500,y:2800},width:560,height:560,status:'coming-soon',interiorPlan:'Separate worship space and langar hall; Granthi Harjit is the resident leader.'},
  {id:'seven-eleven',name:'7-Eleven',district:'village',asset:'single/building-seven-eleven.png',position:{x:5100,y:2300},width:380,height:330,status:'coming-soon',interiorPlan:'Neighborhood convenience store with snacks, drinks and checkout.'},
];
export function buildingApproach(building:VillageBuilding):Point{return {x:building.position.x,y:building.position.y+building.height/2+35};}
export function buildingSolid(building:VillageBuilding):Rect{return {x:building.position.x-building.width/2+10,y:building.position.y-30,w:building.width-20,h:building.height/2+30};}
