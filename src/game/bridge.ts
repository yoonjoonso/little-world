import type { MapId } from '../world/model';
export type Interaction = 'npc' | 'construction' | null;
export interface GameState { map: MapId; prompt: string; interaction: Interaction; x: number; y: number }
export const controls = { up:false,down:false,left:false,right:false,interact:false,sprint:false,blocked:false };
export const gameEvents = new EventTarget();
export function publish(state: GameState) { gameEvents.dispatchEvent(new CustomEvent('state',{detail:state})); }
export function interact(kind: Interaction) { gameEvents.dispatchEvent(new CustomEvent('interact',{detail:kind})); }
export function logActivity(text:string) { gameEvents.dispatchEvent(new CustomEvent('activity',{detail:text})); }
export function resetControls() { controls.up=controls.down=controls.left=controls.right=controls.interact=controls.sprint=false; }
