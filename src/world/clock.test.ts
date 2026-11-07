import { describe,it,expect } from 'vitest';
import { worldLighting } from './clock';
describe('shared Pacific world lighting',()=>{
  it('switches at 7am and 7pm in winter',()=>{
    expect(worldLighting(new Date('2026-11-07T14:59:00Z'))).toBe('night');
    expect(worldLighting(new Date('2026-11-07T15:00:00Z'))).toBe('day');
    expect(worldLighting(new Date('2026-11-08T02:59:00Z'))).toBe('day');
    expect(worldLighting(new Date('2026-11-08T03:00:00Z'))).toBe('night');
  });
  it('keeps the same local thresholds through daylight saving time',()=>{
    expect(worldLighting(new Date('2026-07-07T13:59:00Z'))).toBe('night');
    expect(worldLighting(new Date('2026-07-07T14:00:00Z'))).toBe('day');
    expect(worldLighting(new Date('2026-07-08T02:00:00Z'))).toBe('night');
  });
});
