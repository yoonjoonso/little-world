export const WORLD_TIME_ZONE='America/Los_Angeles';
/** One shared world clock, regardless of the player's device timezone. */
export function worldLighting(date:Date):'day'|'night'{
  const hour=Number(new Intl.DateTimeFormat('en-US',{timeZone:WORLD_TIME_ZONE,hour:'numeric',hourCycle:'h23'}).format(date));
  return hour>=7&&hour<19?'day':'night';
}
