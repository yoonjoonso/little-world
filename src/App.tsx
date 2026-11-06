import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { ActivityPanel } from './components/ActivityPanel';
import { WorldScene } from './game/WorldScene';
import { controls, gameEvents, resetControls, type GameState, type Interaction } from './game/bridge';
import { makeDraft, maps, type BuildDraft } from './world/model';

const initial: GameState={map:'garden',prompt:'',interaction:null,x:480,y:458};
const replies:Record<string,string>={
  hello:'You found us! There’s tea in the cottage and a whole garden to explore. It’s a small start, but we can make it ours.',
  cottage:'Follow the sandy path to the cottage door. Press E when you’re close, or use the Interact button. The same works for coming back outside.',
  ideas:'See the fenced plot to the northeast? That’s our idea board. We can collect plans there before anything gets built. A greenhouse? A little bakery? Your call.'
};
function readDrafts():BuildDraft[] {try{const value=JSON.parse(localStorage.getItem('little-world:drafts')||'[]');return Array.isArray(value)?value.filter(d=>d&&typeof d.title==='string'&&typeof d.description==='string'&&d.status==='draft').slice(0,20):[];}catch{return [];}}
export function App(){
  const host=useRef<HTMLDivElement>(null);
  const [state,setState]=useState(initial);
  const [modal,setModal]=useState<Interaction>(null);
  const [reply,setReply]=useState('hello');
  const [drafts,setDrafts]=useState<BuildDraft[]>(readDrafts);
  const [title,setTitle]=useState('');const [description,setDescription]=useState('');const [error,setError]=useState('');
  const [saved,setSaved]=useState(false);
  const closeRef=useRef<HTMLButtonElement>(null);
  const worldRef=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const onState=(e:Event)=>setState((e as CustomEvent<GameState>).detail);
    const onInteract=(e:Event)=>{setModal((e as CustomEvent<Interaction>).detail);setReply('hello');setSaved(false);};
    gameEvents.addEventListener('state',onState);gameEvents.addEventListener('interact',onInteract);
    const game=new Phaser.Game({type:Phaser.AUTO,parent:host.current!,width:960,height:640,backgroundColor:'#90ac72',pixelArt:true,roundPixels:true,scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},scene:[WorldScene],input:{keyboard:true},audio:{noAudio:true}});
    return()=>{gameEvents.removeEventListener('state',onState);gameEvents.removeEventListener('interact',onInteract);game.destroy(true);};
  },[]);
  useEffect(()=>{controls.blocked=modal!==null;resetControls();if(modal)closeRef.current?.focus();return()=>{controls.blocked=false;};},[modal]);
  function close(){setModal(null);worldRef.current?.focus();}
  function save(){try{const draft=makeDraft(title,description);const next=[draft,...drafts].slice(0,20);localStorage.setItem('little-world:drafts',JSON.stringify(next));setDrafts(next);setTitle('');setDescription('');setError('');setSaved(true);}catch(e){setError(e instanceof Error?e.message:'Could not save this idea.');}}
  function direction(key:'up'|'down'|'left'|'right',label:string){return <button aria-label={`Walk ${key}`} onPointerDown={e=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);controls[key]=true;}} onPointerUp={()=>{controls[key]=false;}} onPointerCancel={()=>{controls[key]=false;}} onLostPointerCapture={()=>{controls[key]=false;}}>{label}</button>;}
  return <div className="app">
    <header><a className="brand" href="#world"><span className="brand-mark">✿</span><span>our little world<small>A LITTLE PLACE TO MAKE OUR OWN</small></span></a><div className="session"><span className="status-dot"/>Offline prototype <span className="version">v0.1</span></div></header>
    <main>
      <div className="intro"><div><p className="eyebrow">THE FIRST CHAPTER</p><h1>Somewhere to call ours.</h1><p>A cottage, a quiet garden, and room for whatever comes next.</p></div><span className="day">☀ <span>Day 1<small>A fresh beginning</small></span></span></div>
      <div className="layout">
        <section className="world-card" aria-label="Game world">
          <div className="world-top"><span><span className="live-dot"/>{maps[state.map].name}</span><span className="world-tag">{state.map==='garden'?'OUTDOORS':'HOME SWEET HOME'}</span></div>
          <div id="world" ref={worldRef} className="world" tabIndex={0} onKeyDown={e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();}} aria-label="Game. Use WASD or arrow keys to walk, E or Space to interact."><div ref={host} className="game-host"/>
            {state.prompt&&<button className="prompt" onClick={()=>{controls.interact=true;}}><kbd>Space</kbd>{state.prompt}<span>↵</span></button>}
          </div>
          <div className="world-bottom"><span><kbd>W A S D</kbd> or <kbd>↑ ← ↓ →</kbd> Walk</span><span><kbd>E</kbd> Interact</span><span className="location-note">Take your time. There’s no rush.</span></div>
          <div className="touch-controls" aria-label="Touch controls"><div className="dpad">{direction('up','↑')}{direction('left','←')}{direction('down','↓')}{direction('right','→')}</div><button className="action" onClick={()=>{controls.interact=true;}} disabled={!state.prompt}>Interact</button></div>
        </section>
        <aside>
          <ActivityPanel/>
          <details className="field-notes"><summary>First visit? Field notes</summary>
          <section className="journal"><p className="eyebrow">YOUR FIELD NOTES</p><h2>Welcome home.</h2><p>Every world starts somewhere.<br/>This one starts with us.</p><div className="journal-rule"/><p className="checklist-label">A FEW THINGS TO TRY</p><ul className="tasks"><li><span>01</span><div>Wander a little<small>Follow the paths through the garden.</small></div></li><li><span>02</span><div>Step inside<small>Walk to the cottage door and interact.</small></div></li><li><span>03</span><div>Say hello to Milo<small>Our first neighbor has a few tips.</small></div></li><li><span>04</span><div>Leave a little idea<small>Find the fenced construction plot.</small></div></li></ul><div className="note">“What should we build next?”<small>THE BEST PART IS, WE GET TO DECIDE.</small></div></section>
          <section className="together"><span className="two-people">♧</span><div><h3>Made for two</h3><p>Shared worlds are next. This first slice is single-player.</p></div></section></details>
        </aside>
      </div>
      <footer><span>OUR LITTLE WORLD · FIRST PLAYABLE SLICE</span><span>Built slowly. Built together. <span className="footer-flower">✿</span></span></footer>
    </main>
    {modal&&<div className="modal-backdrop" onKeyDown={e=>{if(e.key==='Escape')close();if(e.key==='Tab'){const elements=Array.from(e.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled),input,textarea'));const first=elements[0],last=elements.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}}}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><button ref={closeRef} className="close" onClick={close} aria-label="Close dialog">×</button>
      {modal==='npc'?<><p className="eyebrow">A FRIENDLY FACE</p><h2 id="dialog-title">Milo <span>· your neighbor</span></h2><p className="dialogue">{replies[reply]}</p><div className="choices"><button onClick={()=>setReply('cottage')}>How do I get inside?</button><button onClick={()=>setReply('ideas')}>What can we build?</button><button className="primary" onClick={close}>See you around!</button></div><small className="honest-note">Scripted dialogue in this prototype. AI conversations come later.</small></>:<><p className="eyebrow">UNDER CONSTRUCTION</p><h2 id="dialog-title">Our idea board</h2><p>A place for possibilities. Save a draft before we build it.</p><form onSubmit={e=>{e.preventDefault();save();}}><label>What shall we call it?<input value={title} maxLength={60} onChange={e=>setTitle(e.target.value)} placeholder="A tiny greenhouse…" required/></label><label>Tell us a little more<textarea value={description} maxLength={1000} onChange={e=>setDescription(e.target.value)} placeholder="A sunny corner for growing herbs and sharing tea." rows={3}/></label><button className="primary" type="submit" disabled={drafts.length>=20}>Save idea</button></form>{error&&<p role="alert">{error}</p>}{saved&&<p role="status">Idea saved on this device.</p>}<div className="drafts">{drafts.slice(0,5).map(d=><article key={d.id}><span>DRAFT</span><h3>{d.title}</h3><p>{d.description}</p></article>)}</div><small className="honest-note">Drafts stay in this browser. Saving an idea doesn’t build it. AI generation and shared drafts come later.</small></>}
    </section></div>}
  </div>;
}
