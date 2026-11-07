import type { SharedSnapshot } from '../services/sharedWorld';
import { useEffect, useRef, useState } from 'react';
import { gameEvents } from '../game/bridge';
export interface Activity { id:string; type:'message'|'log'; text:string; time:string }
interface Props { shared:SharedSnapshot|null; ownId?:string; sendShared:(body:string)=>Promise<void>; open:boolean; onToggle:()=>void; onClose:()=>void }
export function ActivityPanel({open,onToggle,onClose,shared,ownId,sendShared}:Props){
  const [sendError,setSendError]=useState('');
  const [sending,setSending]=useState(false);
  const seen=useRef(new Set<string>());
  const hydrated=useRef(false);
  useEffect(()=>{if(!shared||shared.error||!shared.worldId)return;let added=0;for(const event of shared.events){if(!seen.current.has(event.id)&&hydrated.current&&event.kind==='message'&&event.user_id!==ownId)added++;seen.current.add(event.id);}hydrated.current=true;if(added&&(!open||filterRef.current!=='message'))setUnread(n=>n+added);},[shared,ownId,open]);
  const [filter,setFilter]=useState<'message'|'log'>('message');
  const [items,setItems]=useState<Activity[]>([]);
  const [message,setMessage]=useState('');
  const [unread,setUnread]=useState(0);
  const list=useRef<HTMLDivElement>(null);
  const openRef=useRef(open);
  openRef.current=open;
  const filterRef=useRef(filter);filterRef.current=filter;
  function append(type:Activity['type'],text:string){
    setItems(old=>[...old,{id:crypto.randomUUID(),type,text,time:new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}].filter((item,index,all)=>all.slice(index+1).filter(next=>next.type===item.type).length<100));
    if(type==='message'&&(!openRef.current||filterRef.current!=='message'))setUnread(count=>count+1);
  }
  useEffect(()=>{const log=(e:Event)=>append('log',(e as CustomEvent<string>).detail);gameEvents.addEventListener('activity',log);return()=>gameEvents.removeEventListener('activity',log);},[]);
  useEffect(()=>{if(open){if(filter==='message')setUnread(0);if(list.current)list.current.scrollTop=list.current.scrollHeight;}},[items,filter,open]);
  return <div className={`chat-overlay ${open?'is-open':''}`}>
    <button className="chat-toggle" aria-label={open?'Collapse chat':`Open chat${unread?`, ${unread} unread messages`:''}`} aria-expanded={open} aria-controls="activity-panel" onClick={onToggle}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M5 4h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-6 4V6a2 2 0 0 1 2-2Z"/><path d="M7 9h10M7 13h6"/></svg><span>{open?'Close':'Chat'}</span>{unread>0&&(!open||filter==='log')&&<span className="unread-badge" aria-hidden="true">{unread>99?'99+':unread}</span>}</button>
    <span className="sr-only" role="status">{(!open||filter==='log')&&unread>0?`${unread} unread messages`:''}</span>
    <section id="activity-panel" className="activity-panel" aria-label="Messages and activity" hidden={!open} onKeyDown={e=>{if(e.key==='Escape'){e.stopPropagation();onClose();}}}>
      <div className="activity-title"><div><h2>Around here</h2><span>{shared?(shared.error?'CONNECTION ISSUE':'SHARED WORLD'):'LOCAL PREVIEW'}</span></div><button className="panel-close" aria-label="Close messages and activity" onClick={onClose}>×</button></div>
      <div className="activity-tabs" role="group" aria-label="Filter activity">{(['message','log'] as const).map(f=><button key={f} aria-pressed={filter===f} onClick={()=>setFilter(f)}>{f==='message'?'Messages':'Logs'}</button>)}</div>
      <div ref={list} className="activity-items" role="log" aria-live={open?'polite':'off'}>{(shared?shared.events.map(event=>({id:event.id,type:event.kind,text:event.body,time:new Date(event.created_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}),author:event.user_id===ownId?'You':'Companion'})):items.map(item=>({...item,author:item.type==='message'?'You':'World'}))).filter(i=>i.type===filter).map(i=><div key={i.id} className={`activity-item ${i.type}`}><span>{i.author} · {i.time}</span><p>{i.text}</p></div>)}{!(shared?shared.events.some(i=>i.kind===filter):items.some(i=>i.type===filter))&&<p className="empty-activity">{filter==='message'?'Your messages will appear here.':'Step inside or take a seat. Your day starts here.'}</p>}</div>
      {filter==='message'&&<form className="message-form" onSubmit={async e=>{e.preventDefault();if(!message.trim()||sending)return;setSending(true);setSendError('');try{if(shared)await sendShared(message.trim());else append('message',message.trim());setMessage('');}catch(error){setSendError(error instanceof Error?error.message:'Message could not be sent.');}finally{setSending(false);}}}><input aria-label="Write a local message" placeholder="Leave a little message…" maxLength={500} value={message} onChange={e=>setMessage(e.target.value)}/><button type="submit" aria-label="Send local message" disabled={!message.trim()||sending}>↑</button></form>}{sendError&&<p role="alert">{sendError}</p>}<p className="activity-disclaimer">{shared?'Shared messages refresh approximately once a second.':'Messages and logs are local to this session.'}</p>
    </section>
  </div>;
}
