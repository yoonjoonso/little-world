import { useEffect, useRef, useState } from 'react';
import { gameEvents } from '../game/bridge';
export interface Activity { id:string; type:'message'|'log'; text:string; time:string }
interface Props { open:boolean; onToggle:()=>void; onClose:()=>void }
export function ActivityPanel({open,onToggle,onClose}:Props){
  const [filter,setFilter]=useState<'all'|'message'|'log'>('all');
  const [items,setItems]=useState<Activity[]>([]);
  const [message,setMessage]=useState('');
  const [unread,setUnread]=useState(0);
  const list=useRef<HTMLDivElement>(null);
  const openRef=useRef(open);
  openRef.current=open;
  function append(type:Activity['type'],text:string){
    setItems(old=>[...old,{id:crypto.randomUUID(),type,text,time:new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}].slice(-100));
    if(!openRef.current)setUnread(count=>count+1);
  }
  useEffect(()=>{const log=(e:Event)=>append('log',(e as CustomEvent<string>).detail);gameEvents.addEventListener('activity',log);return()=>gameEvents.removeEventListener('activity',log);},[]);
  useEffect(()=>{if(open){setUnread(0);if(list.current)list.current.scrollTop=list.current.scrollHeight;}},[items,filter,open]);
  return <div className={`chat-overlay ${open?'is-open':''}`}>
    <button className="chat-toggle" aria-label={open?'Collapse chat':`Open chat${unread?`, ${unread} unread activities`:''}`} aria-expanded={open} aria-controls="activity-panel" onClick={onToggle}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M5 4h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-6 4V6a2 2 0 0 1 2-2Z"/><path d="M7 9h10M7 13h6"/></svg><span>{open?'Close':'Chat'}</span>{unread>0&&!open&&<span className="unread-badge" aria-hidden="true">{unread>99?'99+':unread}</span>}</button>
    <span className="sr-only" role="status">{!open&&unread>0?`${unread} unread activities`:''}</span>
    <section id="activity-panel" className="activity-panel" aria-label="Messages and activity" hidden={!open} onKeyDown={e=>{if(e.key==='Escape'){e.stopPropagation();onClose();}}}>
      <div className="activity-title"><div><h2>Around here</h2><span>LOCAL PREVIEW</span></div><button className="panel-close" aria-label="Close messages and activity" onClick={onClose}>×</button></div>
      <div className="activity-tabs" role="group" aria-label="Filter activity">{(['all','message','log'] as const).map(f=><button key={f} aria-pressed={filter===f} onClick={()=>setFilter(f)}>{f==='all'?'All':f==='message'?'Messages':'Logs'}</button>)}</div>
      <div ref={list} className="activity-items" role="log" aria-live={open?'polite':'off'}>{items.filter(i=>filter==='all'||i.type===filter).map(i=><div key={i.id} className={`activity-item ${i.type}`}><span>{i.type==='message'?'You':'World'} · {i.time}</span><p>{i.text}</p></div>)}{!items.some(i=>filter==='all'||i.type===filter)&&<p className="empty-activity">{filter==='message'?'Your messages will appear here.':'Step inside or take a seat. Your day starts here.'}</p>}</div>
      <form className="message-form" onSubmit={e=>{e.preventDefault();if(message.trim()){append('message',message.trim());setMessage('');}}}><input aria-label="Write a local message" placeholder="Leave a little message…" maxLength={500} value={message} onChange={e=>setMessage(e.target.value)}/><button type="submit" aria-label="Send local message" disabled={!message.trim()}>↑</button></form><p className="activity-disclaimer">Messages and logs are local to this session. Multiplayer comes next.</p>
    </section>
  </div>;
}
