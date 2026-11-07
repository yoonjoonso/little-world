import { describe,it,expect } from 'vitest';
import { regionAt,homeExterior,roads,walks,trails } from './layout';
import { villageBuildings,buildingApproach } from './buildings';
import { maps } from './model';
import { clearRoute,findRoute } from './navigation';
import { standaloneAssets } from './standaloneAssets';

describe('walkable town layout',()=>{
  it('names the region occupied by the player',()=>{
    expect(regionAt(homeExterior.spawn)).toBe('Home');
    expect(regionAt({x:2800,y:1035})).toBe('Mall');
    expect(regionAt({x:2050,y:3850})).toBe('Onsen');
    expect(regionAt({x:5900,y:5500})).toBe('Long Beach');
    expect(regionAt({x:1200,y:1900})).toBe('Big Bear');
  });
  it('keeps roads, park walks and wilderness trails clear of closed buildings and water',()=>{
    for(const path of [...roads,...walks,...trails])for(let i=1;i<path.length;i++)expect(clearRoute(maps.garden,path[i-1],path[i]),JSON.stringify(path)).toBe(true);
  });
  it('gives each building an independent image and a reachable entrance',()=>{
    const files=villageBuildings.map(building=>standaloneAssets[`building.${building.id}`]);
    expect(new Set(files).size).toBe(villageBuildings.length);
    for(const building of villageBuildings)expect(findRoute(maps.garden,homeExterior.spawn,buildingApproach(building)),building.id).not.toBeNull();
  });
  it('uses larger anchor buildings and distributes the requested food clusters',()=>{
    const get=(id:string)=>villageBuildings.find(building=>building.id===id)!;
    expect(get('hospital').width).toBeGreaterThan(get('carls-jr').width*2);
    expect(get('cinema').width).toBeGreaterThan(get('taco-bell').width*1.8);
    expect(Math.hypot(get('gym').position.x-homeExterior.x,get('gym').position.y-homeExterior.y)).toBeLessThan(Math.hypot(get('cinema').position.x-homeExterior.x,get('cinema').position.y-homeExterior.y));
    expect(get('arena').width).toBeGreaterThan(get('cinema').width*2);
    expect(Math.hypot(1200-5900,1400-5500)).toBeGreaterThan(6000);
    expect(get('bar').name).toBe('La Jara Brewery');
    expect(get('gym').name).toBe('Planet Fitness');
  });
});
