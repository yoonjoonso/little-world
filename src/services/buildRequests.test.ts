import { describe,it,expect } from 'vitest';
import { makeRequest } from './buildRequests';
const base={kind:'npc' as const,title:' Gardener ',description:' Loves growing herbs. ',location:' Unassigned house ',references:[]};
describe('build requests',()=>{
  it('keeps NPC reference photos and starts as requested',()=>{const photo=new File(['photo'],'neighbor.png',{type:'image/png'});const request=makeRequest({...base,references:[photo]});expect(request.status).toBe('requested');expect(request.title).toBe('Gardener');expect(request.references).toEqual([photo]);expect(request.location).toBe('Unassigned house');});
  it('rejects missing destinations and unsupported attachments',()=>{expect(()=>makeRequest({...base,location:' '})).toThrow();expect(()=>makeRequest({...base,references:[new File(['x'],'script.svg',{type:'image/svg+xml'})]})).toThrow('JPG, PNG, or WebP');});
  it('bounds attachment count and description size',()=>{const photo=new File(['x'],'test.jpg',{type:'image/jpeg'});expect(()=>makeRequest({...base,references:[photo,photo,photo,photo]})).toThrow('three');expect(()=>makeRequest({...base,description:'x'.repeat(2001)})).toThrow();});
});
