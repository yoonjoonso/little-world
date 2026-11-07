-- PREPARED, NOT APPLIED. Requires the foundation migration and confirmed project approval.
-- Browser users submit their own requests; only the trusted worker updates outcomes.
create table public.build_requests (
  id uuid primary key default gen_random_uuid(),
  world_id uuid not null,
  user_id uuid not null,
  kind text not null check (kind in ('building','npc','object','map')),
  title text not null check (char_length(title) between 1 and 80),
  description text not null check (char_length(description) between 1 and 2000),
  location text not null check (char_length(location) between 1 and 120),
  operation text not null default 'create' check (operation in ('create','update')),
  target_id text,
  check (operation<>'update' or target_id is not null),
  source text not null default 'board' check (source in ('board','muse')),
  status text not null default 'requested' check (status in ('requested','processing','needs_input','applied','failed')),
  result_note text,
  published_version text,
  lease_token uuid,
  lease_expires_at timestamptz,
  worker text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (world_id,user_id) references public.world_members(world_id,user_id)
);
create index build_requests_queue_idx on public.build_requests(status,created_at);
alter table public.build_requests enable row level security;
create policy request_read on public.build_requests for select to authenticated
  using (public.is_world_member(world_id));
create policy request_submit on public.build_requests for insert to authenticated
  with check (user_id=auth.uid() and public.is_world_member(world_id) and source='board' and status='requested');
revoke all on public.build_requests from anon,authenticated;
grant select on public.build_requests to authenticated;
grant insert (id,world_id,user_id,kind,title,description,location,operation,target_id) on public.build_requests to authenticated;
grant all on public.build_requests to service_role;

-- Agent identities/API authorization are configured separately. A browser cannot impersonate an NPC.
create table public.npc_messages (
  id uuid primary key default gen_random_uuid(),
  world_id uuid not null,
  user_id uuid not null,
  npc_id text not null,
  sender text not null default 'player' check (sender in ('player','npc')),
  body text not null check (char_length(body) between 1 and 4000),
  status text not null default 'queued' check (status in ('queued','processing','answered','needs_input','failed')),
  reply_to uuid references public.npc_messages(id),
  created_at timestamptz not null default now(),
  foreign key (world_id,user_id) references public.world_members(world_id,user_id)
);
create index npc_messages_thread_idx on public.npc_messages(world_id,user_id,npc_id,created_at);
alter table public.npc_messages enable row level security;
create policy npc_thread_read on public.npc_messages for select to authenticated
  using (user_id=auth.uid() and public.is_world_member(world_id));
create policy npc_message_submit on public.npc_messages for insert to authenticated
  with check (user_id=auth.uid() and public.is_world_member(world_id) and sender='player' and status='queued' and reply_to is null);
revoke all on public.npc_messages from anon,authenticated;
grant select on public.npc_messages to authenticated;
grant insert (id,world_id,user_id,npc_id,body) on public.npc_messages to authenticated;
grant all on public.npc_messages to service_role;

create table public.world_updates (
  id uuid primary key default gen_random_uuid(),
  world_id uuid not null references public.worlds(id),
  recipient_id uuid references auth.users(id),
  target text not null check (target in ('world','npc')),
  target_id text not null,
  summary text not null check (char_length(summary) between 1 and 4000),
  request_id uuid references public.build_requests(id),
  created_at timestamptz not null default now()
);
create table public.update_reads (
  update_id uuid not null references public.world_updates(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  read_at timestamptz not null default now(),
  primary key (update_id,user_id)
);
alter table public.world_updates enable row level security;
alter table public.update_reads enable row level security;
create policy update_read on public.world_updates for select to authenticated
  using (public.is_world_member(world_id) and (recipient_id is null or recipient_id=auth.uid()));
create policy own_read_receipts on public.update_reads for select to authenticated using (user_id=auth.uid());
create policy acknowledge_visible_update on public.update_reads for insert to authenticated
  with check (user_id=auth.uid() and exists(select 1 from public.world_updates u where u.id=update_id));
revoke all on public.world_updates,public.update_reads from anon,authenticated;
grant select on public.world_updates,public.update_reads to authenticated;
grant insert (update_id,user_id) on public.update_reads to authenticated;
grant all on public.world_updates,public.update_reads to service_role;

-- Atomic, leased claims prevent two builders from working the same request.
create function public.claim_build_request(worker_name text) returns setof public.build_requests
language plpgsql security definer set search_path='' as $$
begin
  if worker_name is null or char_length(worker_name) not between 1 and 120 then raise exception 'Worker name required'; end if;
  return query
  update public.build_requests r set status='processing',worker=worker_name,
    lease_token=gen_random_uuid(),lease_expires_at=now()+interval '15 minutes',updated_at=now()
  where r.id=(select q.id from public.build_requests q
    where q.status='requested' or (q.status='processing' and q.lease_expires_at<now())
    order by q.created_at for update skip locked limit 1)
  returning r.*;
end;
$$;
revoke all on function public.claim_build_request(text) from public,anon,authenticated;
grant execute on function public.claim_build_request(text) to service_role;

create function public.finish_build_request(request_uuid uuid,claim_token uuid,outcome text,note text,version_ref text default null)
returns void language plpgsql security definer set search_path='' as $$
declare request_row public.build_requests;
begin
  if outcome is null or outcome not in ('needs_input','applied','failed') or note is null or char_length(note) not between 1 and 4000 then
    raise exception 'Valid outcome and explanation required';
  end if;
  if outcome='applied' and (version_ref is null or char_length(trim(version_ref))=0) then
    raise exception 'Applied changes require a published version reference';
  end if;
  select * into request_row from public.build_requests where id=request_uuid for update;
  if not found or request_row.status<>'processing' or request_row.lease_token is distinct from claim_token or request_row.lease_expires_at<now() then
    raise exception 'Claim is missing, expired, or no longer owned';
  end if;
  update public.build_requests set status=outcome,result_note=note,published_version=version_ref,
    lease_token=null,lease_expires_at=null,updated_at=now() where id=request_uuid;
  insert into public.world_updates(world_id,target,target_id,summary,request_id)
    values(request_row.world_id,'world',coalesce(request_row.target_id,'world.request-board'),note,request_uuid);
end;
$$;
revoke all on function public.finish_build_request(uuid,uuid,text,text,text) from public,anon,authenticated;
grant execute on function public.finish_build_request(uuid,uuid,text,text,text) to service_role;
