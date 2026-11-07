import type { Rect } from './model';
export const vendorStands=[
  {id:'taco-stand',name:'Tacos',npcId:'mateo',texture:'cart.tacoFront',x:3500,y:2120,width:220,height:124},
  {id:'hotdog-cart',name:'LA Hot Dogs',npcId:'rosa',texture:'cart.hotdogFront',x:6500,y:4480,width:210,height:124},
];
export const vendorSolids:Rect[]=vendorStands.map(stand=>({x:stand.x-stand.width/2,y:stand.y-30,w:stand.width,h:85}));
