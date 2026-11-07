import { worldNpcs } from './world/npcs';
import { WorldUpdates } from './components/WorldUpdates';
import { acknowledgeUpdates, setUpdateViewer,readReceipts } from './services/worldUpdates';
import { BuildRequests } from './components/BuildRequests';
import type { Session } from '@supabase/supabase-js';
import { AccountPanel } from './components/AccountPanel';
import { connectWorld, type SharedSnapshot } from './services/sharedWorld';
import { useCallback, useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { worldLighting } from './world/clock';
import { NpcConversation } from './components/NpcConversation';
import { ActivityPanel } from './components/ActivityPanel';
import { WorldScene } from './game/WorldScene';
import { controls, gameEvents, resetControls, type GameState, type Interaction } from './game/bridge';
import { maps } from './world/model';

const initial: GameState={map:'garden',prompt:'',interaction:null,x:466,y:430};
export function App(){
  const [session,setSession]=useState<Session|null>(null);
  useEffect(()=>{setUpdateViewer(session?.user.id);},[session?.user.id]);
  const acceptSession=useCallback((value:Session|null)=>setSession(value),[]);
  const [shared,setShared]=useState<SharedSnapshot>({worldId:null,players:[],events:[],error:null});
  const connection=useRef<ReturnType<typeof connectWorld>|null>(null);
  useEffect(()=>{
    setShared({worldId:null,players:[],events:[],error:null});
    gameEvents.dispatchEvent(new CustomEvent('remote-players',{detail:[]}));
    if(!session)return;
    const current=connectWorld(session,snapshot=>{setShared(snapshot);gameEvents.dispatchEvent(new CustomEvent('remote-players',{detail:snapshot.players}));});
    connection.current=current;
    const log=(event:Event)=>{void current.send('log',(event as CustomEvent<string>).detail).catch(error=>setShared(old=>({...old,error:String(error)})));};
    gameEvents.addEventListener('activity',log);
    return()=>{current.close();connection.current=null;gameEvents.removeEventListener('activity',log);};
  },[session]);
  const host=useRef<HTMLDivElement>(null);
  const [state,setState]=useState(initial);
  const [nightColors,setNightColors]=useState(()=>{try{return localStorage.getItem('little-world:night-colors')!=='off';}catch{return true;}});
  const [today,setToday]=useState(()=>new Date());
  const [sprint,setSprint]=useState(false);
  useEffect(()=>{const timer=window.setInterval(()=>setToday(new Date()),30_000);return()=>window.clearInterval(timer);},[]);
  const [selectedNpc,setSelectedNpc]=useState(worldNpcs[0]);
  const [updateTarget,setUpdateTarget]=useState('');
  const [modal,setModal]=useState<Interaction>(null);
  const [chatOpen,setChatOpen]=useState(false);
  const [helpOpen,setHelpOpen]=useState(false);
  const closeRef=useRef<HTMLButtonElement>(null);
  const worldRef=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const onState=(e:Event)=>setState((e as CustomEvent<GameState>).detail);
    const onInteract=(e:Event)=>{const kind=(e as CustomEvent<Interaction>).detail;setModal(kind);};
    const onInspect=(event:Event)=>{const id=(event as CustomEvent<string>).detail;setUpdateTarget(id);acknowledgeUpdates('world',id);setModal('updates');};
    const onTalk=(event:Event)=>{const npc=worldNpcs.find(npc=>npc.id===(event as CustomEvent<string>).detail);if(npc){setSelectedNpc(npc);acknowledgeUpdates('npc',npc.id);setModal('npc');}};
    gameEvents.addEventListener('talk-npc',onTalk);
    gameEvents.addEventListener('inspect-update',onInspect);
    gameEvents.addEventListener('state',onState);gameEvents.addEventListener('interact',onInteract);
    const game=new Phaser.Game({type:Phaser.AUTO,parent:host.current!,width:960,height:640,backgroundColor:'#90ac72',pixelArt:true,roundPixels:true,scale:{mode:Phaser.Scale.RESIZE},scene:[WorldScene],input:{keyboard:true},audio:{noAudio:true}});
    return()=>{gameEvents.removeEventListener('talk-npc',onTalk);gameEvents.removeEventListener('inspect-update',onInspect);gameEvents.removeEventListener('state',onState);gameEvents.removeEventListener('interact',onInteract);game.destroy(true);};
  },[]);
  useEffect(()=>{controls.blocked=modal!==null||chatOpen||helpOpen;resetControls();setSprint(false);if(modal)closeRef.current?.focus();return()=>{controls.blocked=false;};},[modal,chatOpen,helpOpen]);
  function close(){setModal(null);worldRef.current?.focus();}
  function direction(key:'up'|'down'|'left'|'right',label:string){return <button aria-label={`Walk ${key}`} onPointerDown={e=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);controls[key]=true;}} onPointerUp={()=>{controls[key]=false;}} onPointerCancel={()=>{controls[key]=false;}} onLostPointerCapture={()=>{controls[key]=false;}}>{label}</button>;}
  const lighting=worldLighting(today);
  return <div className={`app lighting-${lighting} ${nightColors?"night-colors-on":""}`}>
    <main id="world" ref={worldRef} className="world" tabIndex={0} onKeyDown={e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();}} aria-label="Game. Use WASD or arrow keys to walk, E or Space to interact.">
      <div ref={host} className="game-host"/><div className="night-overlay" aria-hidden="true"/>
    </main>
    <WorldUpdates state={state}/>
    <header className="game-hud"><div className="place-chip"><span className="presence-dot is-unknown" role="img" aria-label="Lila’s online status is unavailable; shared presence is not connected"/><div><span className="game-name">our little world</span><strong>{session&&shared.players.length?'Companion · '+shared.players[0].map_id:'Companion · not connected'}</strong></div><span className="day-chip"><span role="img" aria-label={`World lighting: ${lighting}`}>{lighting==='day'?'☀':'☾'}</span> {today.toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'})}</span></div><div className="hud-actions"><span className="offline-chip">{session?(shared.error?'Connection issue':shared.worldId?'Shared world':'Connecting…'):'Single-player preview'}</span><button className="help-toggle" aria-label="Show game controls" aria-expanded={helpOpen} onClick={()=>setHelpOpen(v=>!v)}>?</button></div></header>
    <div hidden={!helpOpen}><section className="help-panel" aria-label="Game controls"><button className="close" aria-label="Close game controls" onClick={()=>setHelpOpen(false)}>×</button><h2>Make yourself at home.</h2><label><input type="checkbox" checked={nightColors} onChange={e=>{setNightColors(e.target.checked);try{localStorage.setItem("little-world:night-colors",e.target.checked?"on":"off");}catch{}}}/> Gentle night colors (turn off for regular lighting)</label><AccountPanel onSession={acceptSession}/>{shared.error&&<p role="alert">{shared.error}</p>}<p>Current location: {maps[state.map].name}<br/>World lighting: {lighting}. Day is 7am–7pm Pacific; night is 7pm–7am. The calendar date follows your device.</p><p><kbd>W A S D</kbd> or arrow keys to walk.<br/><kbd>Shift</kbd> to sprint.<br/><kbd>Space</kbd> / <kbd>E</kbd> to interact.</p><p>On mobile, hold the directional pad to move and tap the action button. Toggle Run for faster movement. Interact with the house entrance, take a seat in your study, or visit Lucia at reception. Follow the path to the request board and open planning plots.</p><p className="honest-note">{session?'Shared-play testing is enabled when your world connection succeeds. Online presence and seat reservations are still pending.':'This is a single-player preview. Messages and activity are local to this session.'}</p></section></div>
    <div className="interaction-hud" aria-live="polite">{state.prompt&&<button className="prompt" disabled={!!modal||chatOpen} onClick={()=>{controls.interact=true;}}><kbd>Space / E</kbd><span>{state.prompt}</span></button>}</div>
    <div className="touch-controls" aria-label="Touch controls" inert={!!modal||chatOpen}><div className="dpad">{direction('up','↑')}{direction('left','←')}{direction('down','↓')}{direction('right','→')}<span className="dpad-center" aria-hidden="true">·</span></div><div className="touch-actions"><button className="sprint-toggle" aria-pressed={sprint} onClick={()=>{setSprint(v=>!v);controls.sprint=!sprint;}}>{sprint?"Running":"Run"}</button><button className="action" onClick={()=>{controls.interact=true;}} disabled={!state.prompt||!!modal||chatOpen}><span className="action-symbol">✦</span><span>{state.prompt||'Interact'}</span></button></div></div>
    <ActivityPanel key={session?.user.id||"offline"} shared={session?shared:null} ownId={session?.user.id} sendShared={async body=>{if(!connection.current)throw new Error("Not connected");await connection.current.send("message",body);}} open={chatOpen} onToggle={()=>{setChatOpen(v=>!v);resetControls();}} onClose={()=>{setChatOpen(false);worldRef.current?.focus();}}/>
    <div className="desktop-hint"><kbd>W A S D</kbd> move <span>·</span> <kbd>Shift</kbd> sprint <span>·</span> <kbd>Space</kbd> interact</div>
    {modal&&<div className="modal-backdrop" onKeyDown={e=>{if(e.key==='Escape')close();if(e.key==='Tab'){const elements=Array.from(e.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled),input,textarea'));const first=elements[0],last=elements.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}}}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><button ref={closeRef} className="close" onClick={close} aria-label="Close dialog">×</button>
      {modal==='updates'?<><p className="eyebrow">DISCOVERED</p><h2 id="dialog-title">What changed here</h2>{readReceipts().flatMap(receipt=>receipt.updates).filter(update=>update.target==='world'&&update.targetId===updateTarget).map(update=><p key={update.id}>{update.summary}</p>)}</>:modal==='npc'?<><p className="eyebrow">SAY HELLO</p><h2 id="dialog-title">{selectedNpc.name} <span>· {selectedNpc.role}</span></h2><NpcConversation key={selectedNpc.id} npc={selectedNpc}/></>:<><p className="eyebrow">UNDER CONSTRUCTION</p><h2 id="dialog-title">Our request board</h2><BuildRequests initialPlotId={state.plotId}/></>}
    </section></div>}
  </div>;
}
