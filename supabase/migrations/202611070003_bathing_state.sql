-- PREPARED, NOT APPLIED. Compatibility for projects with the older foundation.
-- Inspect the target schema/constraint names and approve the live diff before applying.
alter table public.player_states add column if not exists activity_target text;
alter table public.player_states add column if not exists activity_slot text;
alter table public.player_states drop constraint if exists player_states_activity_check;
alter table public.player_states add constraint player_states_activity_check
  check (activity in ('idle','walking','sitting','bathing','running','fishing','playing','resting','showering'));
