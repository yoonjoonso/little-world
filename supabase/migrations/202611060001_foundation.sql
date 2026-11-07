-- Foundation only. Not applied. Realtime authorization and agent commands are separate work.
create table public.worlds (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id),
  name text not null check (char_length(name) between 1 and 80),
  created_at timestamptz not null default now()
);
create table public.world_members (
  world_id uuid not null references public.worlds(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (world_id, user_id)
);
create index world_members_user_idx on public.world_members(user_id);

-- Definer helpers avoid RLS policy recursion. All names are schema-qualified.
create function public.is_world_owner(target uuid) returns boolean
language sql stable security definer set search_path = ''
as $$ select exists(select 1 from public.worlds where id=target and owner_id=auth.uid()); $$;
create function public.is_world_member(target uuid) returns boolean
language sql stable security definer set search_path = ''
as $$ select exists(select 1 from public.world_members where world_id=target and user_id=auth.uid()); $$;
revoke all on function public.is_world_owner(uuid), public.is_world_member(uuid) from public;
grant execute on function public.is_world_owner(uuid), public.is_world_member(uuid) to authenticated;

create function public.limit_world_members() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  -- Concurrent enrollments serialize on the parent world.
  perform 1 from public.worlds where id=new.world_id for update;
  if (select count(*) from public.world_members where world_id=new.world_id) >= 2 then
    raise exception 'A world supports two members';
  end if;
  return new;
end;
$$;
revoke all on function public.limit_world_members() from public;
create trigger limit_world_members before insert on public.world_members
for each row execute function public.limit_world_members();

create table public.player_states (
  world_id uuid not null,
  user_id uuid not null,
  map_id text not null default 'garden',
  x double precision not null default 480 check (x between 0 and 100000),
  y double precision not null default 458 check (y between 0 and 100000),
  activity text not null default 'idle' check (activity in ('idle','walking','sitting','bathing')),
  activity_target text,
  activity_slot text,
  updated_at timestamptz not null default now(),
  primary key(world_id,user_id),
  foreign key(world_id,user_id) references public.world_members(world_id,user_id) on delete cascade
);
create table public.activity_events (
  id uuid primary key default gen_random_uuid(),
  world_id uuid not null,
  user_id uuid not null,
  kind text not null check(kind in ('message','log')),
  body text not null check(char_length(body) between 1 and 1000),
  created_at timestamptz not null default now(),
  foreign key(world_id,user_id) references public.world_members(world_id,user_id) on delete cascade
);
create index activity_events_history_idx on public.activity_events(world_id,created_at desc,id);

alter table public.worlds enable row level security;
alter table public.world_members enable row level security;
alter table public.player_states enable row level security;
alter table public.activity_events enable row level security;

create policy world_read on public.worlds for select to authenticated
using(owner_id=auth.uid() or public.is_world_member(id));
create policy world_create on public.worlds for insert to authenticated with check(owner_id=auth.uid());
create policy member_read on public.world_members for select to authenticated
using(public.is_world_member(world_id) or public.is_world_owner(world_id));
create policy member_enroll on public.world_members for insert to authenticated
with check(public.is_world_owner(world_id));
create policy state_read on public.player_states for select to authenticated
using(public.is_world_member(world_id));
create policy state_insert on public.player_states for insert to authenticated
with check(user_id=auth.uid() and public.is_world_member(world_id));
create policy state_update on public.player_states for update to authenticated
using(user_id=auth.uid() and public.is_world_member(world_id))
with check(user_id=auth.uid() and public.is_world_member(world_id));
create policy event_read on public.activity_events for select to authenticated
using(public.is_world_member(world_id));
create policy event_insert on public.activity_events for insert to authenticated
with check(user_id=auth.uid() and public.is_world_member(world_id));

-- Append-only membership prevents moving a row between worlds to bypass the cap.
revoke all on public.worlds, public.world_members, public.player_states, public.activity_events from anon;
revoke all on public.worlds, public.world_members, public.player_states, public.activity_events from authenticated;
grant select, insert on public.worlds, public.world_members, public.activity_events to authenticated;
grant select, insert, update on public.player_states to authenticated;
