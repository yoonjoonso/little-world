import { centralCommons } from './layout';
import type { Rect } from './model';
export const park={id:'park',name:'Town Park',bounds:{x:250,y:3350,w:2700,h:1350},court:{x:650,y:3650,w:340,h:220},track:{x:650,y:4100,w:650,h:360},beach:{x:5900,y:5500,w:1800,h:1000},bigBear:{x:1200,y:1400,w:1200,h:780}};
export const waterSolids:Rect[]=[...centralCommons.benches.map(bench=>({x:bench.x-56,y:bench.y-10,w:112,h:48})),{x:2395,y:2080,w:210,h:100},{x:550,y:480,w:1400,h:400},{x:5000,y:5650,w:1800,h:350},{x:710,y:1170,w:980,h:460},{x:1644,y:4380,w:112,h:48},{x:5194,y:5370,w:112,h:48}];
