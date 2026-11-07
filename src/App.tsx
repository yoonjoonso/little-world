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
import { makeDraft, maps, type BuildDraft } from './world/model';

const initial: GameState={map:'garden',prompt:'',interaction:null,x:480,y:458};
function readDrafts():BuildDraft[] {try{const value=JSON.parse(localStorage.getItem('little-world:drafts')||'[]');return Array.isArray(value)?value.filter(d=>d&&typeof d.title==='string'&&typeof d.description==='string'&&d.status==='draft').slice(0,20):[];}catch{return [];}}
export function App(){
  const [session,setSession]=useState<Session|null>(null);
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
  const [today,setToday]=useState(()=>new Date());
  const [sprint,setSprint]=useState(false);
  useEffect(()=>{const timer=window.setInterval(()=>setToday(new Date()),30_000);return()=>window.clearInterval(timer);},[]);
  const [modal,setModal]=useState<Interaction>(null);
  const [drafts,setDrafts]=useState<BuildDraft[]>(readDrafts);
  const [title,setTitle]=useState('');const [description,setDescription]=useState('');const [error,setError]=useState('');
  const [saved,setSaved]=useState(false);
  const [chatOpen,setChatOpen]=useState(false);
  const [helpOpen,setHelpOpen]=useState(false);
  const closeRef=useRef<HTMLButtonElement>(null);
  const worldRef=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const onState=(e:Event)=>setState((e as CustomEvent<GameState>).detail);
    const onInteract=(e:Event)=>{setModal((e as CustomEvent<Interaction>).detail);setSaved(false);};
    gameEvents.addEventListener('state',onState);gameEvents.addEventListener('interact',onInteract);
    const game=new Phaser.Game({type:Phaser.AUTO,parent:host.current!,width:960,height:640,backgroundColor:'#90ac72',pixelArt:true,roundPixels:true,scale:{mode:Phaser.Scale.RESIZE},scene:[WorldScene],input:{keyboard:true},audio:{noAudio:true}});
    return()=>{gameEvents.removeEventListener('state',onState);gameEvents.removeEventListener('interact',onInteract);game.destroy(true);};
  },[]);
  useEffect(()=>{controls.blocked=modal!==null||chatOpen||helpOpen;resetControls();setSprint(false);if(modal)closeRef.current?.focus();return()=>{controls.blocked=false;};},[modal,chatOpen,helpOpen]);
  function close(){setModal(null);worldRef.current?.focus();}
  function save(){try{const draft=makeDraft(title,description);const next=[draft,...drafts].slice(0,20);localStorage.setItem('little-world:drafts',JSON.stringify(next));setDrafts(next);setTitle('');setDescription('');setError('');setSaved(true);}catch(e){setError(e instanceof Error?e.message:'Could not save this idea.');}}
  function direction(key:'up'|'down'|'left'|'right',label:string){return <button aria-label={`Walk ${key}`} onPointerDown={e=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);controls[key]=true;}} onPointerUp={()=>{controls[key]=false;}} onPointerCancel={()=>{controls[key]=false;}} onLostPointerCapture={()=>{controls[key]=false;}}>{label}</button>;}
  const lighting=worldLighting(today);
  return <div className={`app lighting-${lighting}`}>
    <main id="world" ref={worldRef} className="world" tabIndex={0} onKeyDown={e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();}} aria-label="Game. Use WASD or arrow keys to walk, E or Space to interact.">
      <div ref={host} className="game-host"/><div className="night-overlay" aria-hidden="true"/>
    </main>
    <header className="game-hud"><div className="place-chip"><span className="presence-dot is-unknown" role="img" aria-label="Lila’s online status is unavailable; shared presence is not connected"/><div><span className="game-name">our little world</span><strong>{session&&shared.players.length?'Companion · '+shared.players[0].map_id:'Companion · not connected'}</strong></div><span className="day-chip"><span role="img" aria-label={`World lighting: ${lighting}`}>{lighting==='day'?'☀':'☾'}</span> {today.toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'})}</span></div><div className="hud-actions"><span className="offline-chip">{session?(shared.error?'Connection issue':shared.worldId?'Shared world':'Connecting…'):'Single-player preview'}</span><button className="help-toggle" aria-label="Show game controls" aria-expanded={helpOpen} onClick={()=>setHelpOpen(v=>!v)}>?</button></div></header>
    <div hidden={!helpOpen}><section className="help-panel" aria-label="Game controls"><button className="close" aria-label="Close game controls" onClick={()=>setHelpOpen(false)}>×</button><h2>Make yourself at home.</h2><AccountPanel onSession={acceptSession}/>{shared.error&&<p role="alert">{shared.error}</p>}<p>Current location: {maps[state.map].name}<br/>World lighting: {lighting}. Day is 7am–7pm Pacific; night is 7pm–7am. The calendar date follows your device.</p><p><kbd>W A S D</kbd> or arrow keys to walk.<br/><kbd>Shift</kbd> to sprint.<br/><kbd>Space</kbd> / <kbd>E</kbd> to interact.</p><p>On mobile, hold the directional pad to move and tap the action button. Toggle Run for faster movement. Find the cottage door, take a seat at your desk, or say hello to Milo.</p><p className="honest-note">{session?'Shared-play testing is enabled when your world connection succeeds. Online presence and seat reservations are still pending.':'This is a single-player preview. Messages and activity are local to this session.'}</p></section></div>
    <div className="interaction-hud" aria-live="polite">{state.prompt&&<button className="prompt" disabled={!!modal||chatOpen} onClick={()=>{controls.interact=true;}}><kbd>Space / E</kbd><span>{state.prompt}</span></button>}</div>
    <div className="touch-controls" aria-label="Touch controls" inert={!!modal||chatOpen}><div className="dpad">{direction('up','↑')}{direction('left','←')}{direction('down','↓')}{direction('right','→')}<span className="dpad-center" aria-hidden="true">·</span></div><div className="touch-actions"><button className="sprint-toggle" aria-pressed={sprint} onClick={()=>{setSprint(v=>!v);controls.sprint=!sprint;}}>{sprint?"Running":"Run"}</button><button className="action" onClick={()=>{controls.interact=true;}} disabled={!state.prompt||!!modal||chatOpen}><span className="action-symbol">✦</span><span>{state.prompt||'Interact'}</span></button></div></div>
    <ActivityPanel key={session?.user.id||"offline"} shared={session?shared:null} ownId={session?.user.id} sendShared={async body=>{if(!connection.current)throw new Error("Not connected");await connection.current.send("message",body);}} open={chatOpen} onToggle={()=>{setChatOpen(v=>!v);resetControls();}} onClose={()=>{setChatOpen(false);worldRef.current?.focus();}}/>
    <div className="desktop-hint"><kbd>W A S D</kbd> move <span>·</span> <kbd>Shift</kbd> sprint <span>·</span> <kbd>Space</kbd> interact</div>
    {modal&&<div className="modal-backdrop" onKeyDown={e=>{if(e.key==='Escape')close();if(e.key==='Tab'){const elements=Array.from(e.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled),input,textarea'));const first=elements[0],last=elements.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}}}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><button ref={closeRef} className="close" onClick={close} aria-label="Close dialog">×</button>
      {modal==='npc'?<><p className="eyebrow">A FRIENDLY FACE</p><h2 id="dialog-title">Milo <span>· your neighbor</span></h2><NpcConversation/></>:<><p className="eyebrow">UNDER CONSTRUCTION</p><h2 id="dialog-title">Our idea board</h2><p>A place for possibilities. Save a draft before we build it.</p><form onSubmit={e=>{e.preventDefault();save();}}><label>What shall we call it?<input value={title} maxLength={60} onChange={e=>setTitle(e.target.value)} placeholder="A tiny greenhouse…" required/></label><label>Tell us a little more<textarea value={description} maxLength={1000} onChange={e=>setDescription(e.target.value)} placeholder="A sunny corner for growing herbs and sharing tea." rows={3}/></label><button className="primary" type="submit" disabled={drafts.length>=20}>Save idea</button></form>{error&&<p role="alert">{error}</p>}{saved&&<p role="status">Idea saved on this device.</p>}<div className="drafts">{drafts.slice(0,5).map(d=><article key={d.id}><span>DRAFT</span><h3>{d.title}</h3><p>{d.description}</p></article>)}</div><small className="honest-note">Drafts stay in this browser. Saving an idea doesn’t build it. AI generation and shared drafts come later.</small></>}
    </section></div>}
  </div>;
}
