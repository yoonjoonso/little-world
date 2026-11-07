export type RequestKind='building'|'npc'|'object';
export interface BuildRequest {id:string;kind:RequestKind;title:string;description:string;location:string;status:'requested';createdAt:string;references:File[]}
const kinds:RequestKind[]=['building','npc','object'];
export function makeRequest(input:{kind:RequestKind;title:string;description:string;location:string;references:File[]}):BuildRequest{
  const title=input.title.trim(),description=input.description.trim(),location=input.location.trim();
  if(!kinds.includes(input.kind)||!title||title.length>80||!description||description.length>2000||!location||location.length>120)throw new Error('Add a title, a description, and a location within the displayed limits.');
  if(input.references.length>3)throw new Error('Attach up to three reference photos.');
  for(const file of input.references)if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5*1024*1024)throw new Error('Reference photos must be JPG, PNG, or WebP and no larger than 5 MB each.');
  return {...input,title,description,location,id:crypto.randomUUID(),status:'requested',createdAt:new Date().toISOString()};
}
function database():Promise<IDBDatabase>{return new Promise((resolve,reject)=>{const request=indexedDB.open('little-world-build-requests',1);request.onupgradeneeded=()=>request.result.createObjectStore('requests',{keyPath:'id'});request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});}
export async function saveRequest(value:BuildRequest):Promise<void>{const db=await database();try{await new Promise<void>((resolve,reject)=>{const tx=db.transaction('requests','readwrite');tx.objectStore('requests').put(value);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||new Error('Saving was interrupted.'));});}finally{db.close();}}
export async function listRequests():Promise<BuildRequest[]>{const db=await database();try{return await new Promise((resolve,reject)=>{const request=db.transaction('requests').objectStore('requests').getAll();request.onsuccess=()=>resolve((request.result as BuildRequest[]).sort((a,b)=>b.createdAt.localeCompare(a.createdAt)));request.onerror=()=>reject(request.error);});}finally{db.close();}}
