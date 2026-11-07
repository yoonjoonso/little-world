import { villageBuildings } from '../world/buildings';
import { park } from '../world/park';
import { onsen } from '../world/bathing';
import { useEffect,useState } from 'react';
import { readReceipts,updateEvents } from '../services/worldUpdates';
import { homeLayout,homeRooms } from '../world/home';
import { planningPlots,requestBoard } from '../world/planning';
import { updateLocation } from '../world/updateLocations';
import { maps } from '../world/model';
import type { GameState } from '../game/bridge';
export function WorldUpdates({state}:{state:GameState}){
  const [receipts,setReceipts]=useState(readReceipts);
  useEffect(()=>{const refresh=()=>setReceipts(readReceipts());updateEvents.addEventListener('change',refresh);window.addEventListener('storage',refresh);return()=>{updateEvents.removeEventListener('change',refresh);window.removeEventListener('storage',refresh);};},[]);
  const items=receipts.flatMap(receipt=>receipt.updates).filter(update=>!update.read);
  const targets=[...new Map(items.map(update=>[`${update.target}:${update.targetId}`,update])).values()];
  const map=maps[state.map];
  return <aside className="minimap" aria-label={`Minimap, ${items.length} unread updates`}>
    <div className="minimap-toggle">
      <svg viewBox={`0 0 ${map.width} ${map.height}`} role="img" aria-label="Your location, house, planning plots and unread update destinations">
        <rect width={map.width} height={map.height} rx="80" fill="#819e6c"/>
        {state.map==='cottage'?<>{homeLayout.map(room=><rect key={room.id} x={room.x} y={room.y} width={homeRooms[room.definition].width} height={homeRooms[room.definition].height} fill={room.definition==='reception'?'#dbb98e':'#eee0bc'} stroke="#806647" strokeWidth="16"/>)}</>:<>
          <path d="M466 360V1710M300 695H955M955 430V1280M955 432H2470M955 822H2470M1540 432V882H1455V1837H2230M1120 1262H2470" fill="none" stroke="#dbc59c" strokeWidth="35"/>
          <rect x="342" y="160" width="244" height="168" fill="#d1a277" stroke="#806647" strokeWidth="12"/>
          {planningPlots.map(plot=><rect key={plot.id} x={plot.bounds.x} y={plot.bounds.y} width={plot.bounds.w} height={plot.bounds.h} fill="#bdd09a" stroke="#f4e5bd" strokeDasharray="20 15" strokeWidth="12"/>)}
          {villageBuildings.map(building=><rect key={building.id} x={building.position.x-building.width/2} y={building.position.y-building.height/2} width={building.width} height={building.height} fill={building.district==='faith'?'#e1d5b5':'#cda57e'} stroke="#806647" strokeWidth="10"/>)}
          <rect x={park.court.x} y={park.court.y} width={park.court.w} height={park.court.h} fill="#759983"/>
          <rect x={park.track.x} y={park.track.y} width={park.track.w} height={park.track.h} rx="145" fill="#c19679"/>
          <ellipse cx={park.lake.x} cy={park.lake.y} rx="210" ry="130" fill="#9dc7bf"/>
          <ellipse cx={park.beach.x} cy={park.beach.y} rx="240" ry="140" fill="#e7d4a9"/>
          <ellipse cx={onsen.x} cy={onsen.y} rx="170" ry="105" fill="#9dc7bf" stroke="#c7b89a" strokeWidth="15"/>
          <rect x={requestBoard.x-25} y={requestBoard.y-25} width="50" height="50" fill="#86603f"/>
        </>}
        <circle cx={state.x} cy={state.y} r="37" fill="#fff9e6" stroke="#49684c" strokeWidth="15"/>
        {targets.map(update=>{const target=updateLocation(update);if(!target)return null;const location=target.map===state.map?target:state.map==='garden'?{x:464,y:350}:{x:600,y:818};return <g key={update.id} transform={`translate(${location.x},${location.y})`}><circle r="55" fill="#f8c66b" stroke="#6b4d33" strokeWidth="8"/><text textAnchor="middle" dominantBaseline="central" fontSize="86" fontWeight="bold" fill="#59412f">!</text></g>;})}
      </svg><span>{state.map==='cottage'?'Home map':'Village map'} {items.length>0&&<strong>! {items.length}</strong>}</span>
    </div>
  </aside>;
}
