export interface WorldUpdate {id:string;target:'world'|'npc';targetId:string;summary:string;createdAt:string;read:boolean}
export interface SweepReceipt {id:string;completedAt:string;updates:WorldUpdate[]}
const key='little-world:sweep-receipts';
export const updateEvents=new EventTarget();
export function readReceipts():SweepReceipt[]{try{const value=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(value)?value.filter(r=>r&&typeof r.id==='string'&&typeof r.completedAt==='string'&&Array.isArray(r.updates)).slice(-100):[];}catch{return [];}}
function write(receipts:SweepReceipt[]){localStorage.setItem(key,JSON.stringify(receipts.slice(-100)));updateEvents.dispatchEvent(new Event('change'));}
/** Called by delivery of a completed worker sweep, never by a timer or a local request. */
export function recordSweep(receipt:SweepReceipt){
  if(!receipt.id||!Number.isFinite(Date.parse(receipt.completedAt))||receipt.updates.some(u=>!u.id||!u.targetId||!['world','npc'].includes(u.target)||!u.summary||!Number.isFinite(Date.parse(u.createdAt))))throw new Error('Invalid sweep receipt.');
  const previous=readReceipts();if(previous.some(r=>r.id===receipt.id))return;
  const known=new Set(previous.flatMap(r=>r.updates.map(u=>u.id)));
  write([...previous,{...receipt,updates:receipt.updates.filter(u=>!known.has(u.id)).map(u=>({...u,read:false}))}]);
}
export function acknowledgeUpdates(target:'world'|'npc',targetId:string){write(readReceipts().map(r=>({...r,updates:r.updates.map(u=>u.target===target&&u.targetId===targetId?{...u,read:true}:u)})));}
export function unreadUpdates(){return readReceipts().flatMap(r=>r.updates).filter(u=>!u.read);}
