export interface GameSettings {godMode:boolean;movement:number}
const defaults:GameSettings={godMode:false,movement:1};
let current:GameSettings|undefined;
export const settingsEvents=new EventTarget();
export function readSettings():GameSettings{
  if(current)return current;
  try{const saved=JSON.parse(localStorage.getItem('little-world:settings')||'{}');current={godMode:saved.godMode===true,movement:[1,1.5,2].includes(saved.movement)?saved.movement:1};}catch{current={...defaults};}
  return current!;
}
export function writeSettings(change:Partial<GameSettings>){
  const next={...readSettings(),...change};current={godMode:next.godMode===true,movement:[1,1.5,2].includes(next.movement)?next.movement:1};
  try{localStorage.setItem('little-world:settings',JSON.stringify(current));}catch{/* In-memory settings still work if browser storage is unavailable. */}
  settingsEvents.dispatchEvent(new Event('change'));return current;
}
