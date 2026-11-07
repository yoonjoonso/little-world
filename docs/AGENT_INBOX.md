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
