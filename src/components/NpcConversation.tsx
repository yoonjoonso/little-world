import { readReceipts } from '../services/worldUpdates';
import { useState } from 'react';
interface Message { id:string; text:string; createdAt:string }
const key='little-world:npc-inbox:lucia';
function read():Message[]{try{const data=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(data)?data.filter(m=>m&&typeof m.id==='string'&&typeof m.text==='string'&&typeof m.createdAt==='string').slice(-100):[];}catch{return [];}}
export function NpcConversation(){
  const [messages,setMessages]=useState<Message[]>(read);
  const [text,setText]=useState('');
  const [error,setError]=useState('');
  const debug=window.location.hash==='#agent-debug';
  function send(){
    if(!text.trim())return;
    const next=[...messages,{id:crypto.randomUUID(),text:text.trim(),createdAt:new Date().toISOString()}];
    try{localStorage.setItem(key,JSON.stringify(next));setMessages(next);setText('');setError('');}
    catch{setError('Could not save your message. Please try again.');}
  }
  return <>
    {readReceipts().flatMap(receipt=>receipt.updates).filter(update=>update.target==='npc'&&update.targetId==='lucia').slice(-10).map(update=><p className="npc-greeting" key={update.id}><strong>Lucia</strong><br/>{update.summary}</p>)}
    <div className="npc-thread" role="log" aria-label="Conversation with Lucia"><p className="npc-greeting"><span className="lucia-portrait" style={{backgroundImage:`url(${import.meta.env.BASE_URL}assets/characters/lucia-v1.png)`}} role="img" aria-label="Lucia, your Muse and secretary"/><strong>Lucia</strong><br/>Welcome home. What would you like to work on?</p>{messages.map(m=><p className="npc-outgoing" key={m.id}><span>You · {new Date(m.createdAt).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</span><br/>{m.text}</p>)}</div>
    {messages.length>0&&<p className="npc-thinking" role="status">Message saved for Lucia. <small>Waiting for an agent connection. You can keep adding messages.</small></p>}
    <form className="npc-form" onSubmit={e=>{e.preventDefault();send();}}><label htmlFor="npc-message">Message Lucia</label><textarea id="npc-message" value={text} onChange={e=>setText(e.target.value)} maxLength={2000} rows={2} placeholder="Ask a question or request something…"/><button className="primary" disabled={!text.trim()||messages.length>=100}>Send</button></form>
    {error&&<p role="alert">{error}</p>}{messages.length>=100&&<p role="status">The local inbox is full. An agent connection is needed to process it.</p>}
    <small className="honest-note">Local inbox preview. Messages stay on this browser; no agent can read or answer them remotely yet.</small>
    {debug&&<details className="agent-debug"><summary>Agent inbox debug · local only</summary><pre>{JSON.stringify({npcId:'lucia',status:'awaiting_connection',messages},null,2)}</pre></details>}
  </>;
}
