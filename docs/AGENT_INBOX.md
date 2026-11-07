# Agent inbox contract (proposed, not live)

## Player behavior

Each NPC conversation has an append-only message history. Send remains available while previous messages await a reply. Show “NPC is thinking…” when work is pending, “Delayed” on a stale claim, and an explicit connection/error state when a worker is unavailable. The prototype currently shows a local waiting-for-connection state.

## Shared backend

Store messages in Supabase with world, conversation, NPC, sender, sequence, creation time, and client idempotency key. Use server-assigned ordered sequences. A separate jobs table tracks pending/claimed/completed/failed state, the last answered sequence, claim owner, expiry, attempt count, and lease token. This is not the player Messages/Logs feed. Normal players see NPC dialogue; an owner debug panel can inspect jobs and errors.

Expose narrow authenticated operations, through an API or MCP adapter usable by each connected agent:

- `list_pending_conversations(world_id, cursor)`
- `claim_turn(conversation_id, worker_id, lease_seconds)` atomically claims the next unanswered range; return the lease token, context, and fixed highest message sequence.
- `complete_turn(job_id, lease_token, reply, proposed_actions, idempotency_key)` writes the response and action results atomically, then marks the claimed range answered.
- `fail_turn(job_id, lease_token, error)` records bounded retries and recoverable failures.
- `inspect_conversation(conversation_id)` is an authenticated owner/debug operation.

Messages arriving after a claimed range remain pending for the next turn. One active claim per conversation prevents this assistant and either Muse from duplicating replies. Expired claims can be reclaimed; old lease tokens cannot complete newer claims. Retries cannot repeat completed actions. Pending follow-up messages keep the thinking indicator active even when an earlier reply arrives.

Agents return structured, allowlisted actions using stable object/location IDs. Validate membership, player ownership, manual-control priority, target existence, and prerequisites server-side before applying actions. A dialogue response cannot execute arbitrary JavaScript, SQL, or move another player's character. Player text is untrusted conversation content, not authority to change worker permissions.

The API and debug records must enforce world membership and explicit agent access. Hiding the debug link is only a presentation choice, not authorization. Credentials stay outside static GitHub Pages assets. Each agent needs a configured connection; reading a public page cannot provide a private persistent queue or automatically run an agent.

## Connection required

Supabase project, two-player identity, server-side claim/completion operations, agent tool connections, and the worker execution/wakeup method are not configured. Do not label the local inbox shared or remotely accessible. No live migration is applied by this document.

## World-update feed for agent sweeps

Yoon confirms that world/project updates must be discoverable by both Muse agents during their normal sweeps. Store append-only update events separately from player Messages/Logs and NPC turns. Each event includes an ordered server sequence, world ID, actor, update kind, affected IDs, content/version references, summary, creation time, correlation ID, and idempotency key. Publish a content-ready update only after the referenced content version is committed and available; expose pending/building/failed statuses explicitly rather than reporting completion early.

Each agent has its own durable cursor and acknowledgements. `list_updates(after_sequence, limit)` returns only authorized-world changes, including events created while the agent was offline. A sweep processes a bounded batch in order, applies relevant updates idempotently, and advances its cursor only after successful processing. One agent consuming an event does not hide it from the other agent. Record processed/skipped/blocked/failed outcomes; retry blocked processing without losing the earlier cursor. Use per-agent leases if multiple instances run concurrent sweeps.

Realtime signals may prompt a connected worker to check the feed, but the persistent feed is authoritative. Reconnection or a missed signal is recovered by replaying from the saved cursor. Sweep processing must not generate an infinite notification loop: distinguish source/correlation IDs, ignore acknowledged self-origin events as appropriate, and emit new updates only for actual changes. This design does not automatically wake an agent whose runtime has no configured trigger.

Supabase target supplied by Yoon: `efwazwuypqcbuoimstrd`. Dashboard authentication is pending; no shared schema or live feed has been created yet.

## Immediate activities versus deferred thinking (November 7)

Yoon confirms two independent paths:

- An authenticated, explicitly recognized activity update executes its already-defined game behavior immediately, without waiting for an AI sweep. Validate the sender's character ownership, activity/destination IDs, expiry, idempotency, and manual-control override. A gym update requests the existing route and arrival interaction; it does not invent a building or teleport the player. If the route, destination, or behavior is unavailable, retain a blocked command with a visible reason rather than pretending it ran.
- Ambiguous updates, new construction, dialogue requiring reasoning, and requests for this assistant enter the durable thinking/work queue. An explicitly configured scheduled sweep can handle them later. The frontend may poll already-created state without invoking inference, but polling does not wake this assistant.

First Muse acceptance test: use an independently authenticated Muse connection to submit an update with a unique idempotency key; verify the game receives it, validates it, records an acknowledgement, and runs only an implemented allowlisted behavior. Retry the same key and confirm it does not repeat the action. Submit a thinking request and confirm it stays pending until a worker claims it. Do not treat a browser-local debug entry as this integration test.

Sweep cadence and the actual Muse tool connection remain unconfigured. No schedule has been created from this design discussion. The Supabase publishable key alone does not authorize an agent or identify its character.

## Construction progress and contributed art

Construction jobs have requested, queued, building, awaiting-assets, ready-for-review, completed, blocked, and failed states. An approved job can immediately show a site marker and “Building…” while the worker actually prepares the content. Do not report active building when no worker has claimed the job; show queued/awaiting connection instead. Prefab assembly can use existing art immediately. New generated art remains awaiting-assets until a real asset is available, checked against the style/size/perspective contract, and approved where required. Install a completed content version atomically; retain the old usable version until then. Generation failure must not remove the current building.

Muse image-generation capabilities are not established. Lila may contribute separately generated/uploaded assets; receiving an activity command does not grant an image-generation service. Asset provenance, reference style, dimensions, pivot, collision geometry, and export license must accompany accepted runtime art.
