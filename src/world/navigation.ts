import { canStand, type Point, type WorldMap } from './model';

export function clearRoute(map:WorldMap,a:Point,b:Point){
  const count=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/6));
  for(let i=0;i<=count;i++)if(!canStand(map,{x:a.x+(b.x-a.x)*i/count,y:a.y+(b.y-a.y)*i/count}))return false;
  return true;
}
/** Four-way grid search, with checked endpoint links and line-of-sight smoothing. */
export function findRoute(map:WorldMap,start:Point,end:Point):Point[]|null{
  if(!canStand(map,start)||!canStand(map,end))return null;
  if(clearRoute(map,start,end))return [{...end}];
  const step=20,cols=Math.ceil(map.width/step),rows=Math.ceil(map.height/step);
  const point=(id:number)=>({x:(id%cols)*step,y:Math.floor(id/cols)*step});
  const link=(p:Point)=>{const candidates:number[]=[];for(let y=Math.floor(p.y/step)-2;y<=Math.ceil(p.y/step)+2;y++)for(let x=Math.floor(p.x/step)-2;x<=Math.ceil(p.x/step)+2;x++){if(x<0||y<0||x>=cols||y>=rows)continue;const id=y*cols+x;if(clearRoute(map,p,point(id)))candidates.push(id);}return candidates.sort((a,b)=>Math.hypot(point(a).x-p.x,point(a).y-p.y)-Math.hypot(point(b).x-p.x,point(b).y-p.y));};
  const starts=link(start),goals=new Set(link(end));if(!starts.length||!goals.size)return null;
  const queue=starts.slice(),parent=new Map<number,number>(starts.map(id=>[id,-1]));let found:number|undefined;
  for(let index=0;index<queue.length;index++){const id=queue[index];if(goals.has(id)){found=id;break;}const p=point(id);for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const x=id%cols+dx,y=Math.floor(id/cols)+dy;if(x<0||y<0||x>=cols||y>=rows)continue;const next=y*cols+x;if(parent.has(next)||!clearRoute(map,p,point(next)))continue;parent.set(next,id);queue.push(next);}}
  if(found===undefined)return null;
  const path:Point[]=[end];for(let id=found;id!==-1;id=parent.get(id)!)path.unshift(point(id));
  const smooth:Point[]=[];let current=start,index=0;while(index<path.length){let next=index;for(let j=index;j<path.length;j++)if(clearRoute(map,current,path[j]))next=j;smooth.push(path[next]);current=path[next];index=next+1;}return smooth;
}
