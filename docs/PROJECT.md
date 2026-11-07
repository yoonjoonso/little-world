# Our Little World

Status: first single-player prototype is live at https://yoonjoonso.github.io/little-world/. The viewport-filling interface is live. Routine publishing is authorized by Yoon as of November 6, 2026.
Owners: Yoon owns engine/code decisions; Yoon and Lila shape the world and content.

## Product

A persistent, shared browser-based 2D city for Yoon and Lila. Both characters inhabit the same world. Either player can manually walk, visit buildings, interact with objects, and talk. The other player sees their actions. The world can also reflect real-life routines: when an explicitly authorized agent sends a scheduled gym activity, the character travels to the gym and the other player can see it.

The village grows from the confirmed location list in docs/VILLAGE.md. Exact layouts and the final art direction remain unconfirmed. The current garden/cottage are starter content. Ask Yoon before adding locations outside the confirmed list.

## Confirmed stack and responsibilities

- React + TypeScript: interface, dialogue, activity panel, touch controls, account and editor screens.
- Phaser 3: rendering, movement, collisions, maps, portals, interactive objects, animation, and pathfinding when added.
- Vite: local development and static production build.
- Supabase: planned Auth, Postgres, private Realtime presence/events, and Storage for uploaded assets. Initial client and unapplied schema are included. The playable prototype does not contact Supabase without configuration.
- GitHub: source, documentation, asset history, feature branches, pull requests, and CI.
- Hosting: GitHub Pages for the public static prototype, using the existing public GitHub repository. Supabase remains the planned separate backend. Routine publishing is authorized for now; approved merges to `main` trigger the Pages workflow.

Keep one application with separate game, world, component, and service modules. Reconsider major changes with Yoon before implementation.

## Prototype acceptance

- [x] Credential-free browser game with original procedural placeholder art.
- [x] Character movement using WASD, arrows, or on-screen directional controls.
- [x] Solid-object collision and normalized diagonal speed.
- [x] Garden and one enterable cottage, with an exit back to the garden.
- [x] Desk highlight, contextual interaction prompt, sitting pose, and stand/cancel action.
- [x] E / Space and a mobile Interact button share the same interaction action.
- [x] A local persistent NPC conversation inbox that accepts follow-up messages while awaiting an agent connection.
- [x] An under-construction board that saves local idea drafts, without building them automatically.
- [x] Collapsible in-game activity overlay with Messages and Logs tabs; a badge counts unread messages while collapsed.
- [x] Local messages and semantic logs for map transitions and sitting/standing.
- [ ] Live, authenticated two-player sync. Current UI explicitly says offline and local.
- [ ] Browser verification complete. The initial deployed game was visually checked; reliable keyboard/touch interaction QA and the new layout's browser QA remain pending. The session browser cannot reach the local preview server.

Validation: `npm test` passed 7 tests; `npm run build` passed TypeScript and the production bundle. Phaser produces a bundle-size advisory. Database migration has not been applied or integration-tested.

Sitting currently uses a procedural seated pose, with a simple idle movement. It is not finished custom character animation. Prototype movement and player chat are session-local; idea drafts and the local NPC inbox persist in localStorage on that browser. Do not call local messages shared or multiplayer.

## Input and interactions

The object interaction model is approach → highlight/prompt → interact → active state → interact to cancel/leave. A desk reserves a seat in multiplayer; cancellation releases it. Sitting prevents walking until the player stands. React forms block game keyboard controls. Touch directions release on pointer-up, cancellation, capture loss, and browser blur. Modal dialogs trap focus and close with Escape.

## Shared city and control modes (next milestones)

1. Authenticate two accounts; create a private world and enroll exactly two members.
2. Deliver cross-device movement, current map, activity, object occupancy, and messages. Confirm with two real sessions before claiming multiplayer support.
3. Add confirmed city locations, routes, map portals, and pathfinding between locations. Character location and real-life activity are distinct fields; do not collect GPS by default.
4. Add per-player control modes: manual, idle, and agent-directed. Manual input cancels an agent route and holds an override until the player releases it or a visible, agreed timeout ends. A late schedule update must not teleport or interrupt manual play.
5. An agent command targets a stable location/object ID, not arbitrary coordinates, code, or SQL. Commands have owner, world, idempotency key, issue/expiry time, and status. Validate world membership, ownership, destination, permissions, and stale state on the server. Queue conflicting seat reservations atomically.
6. Persist semantic activity events such as `desk → gym` and arrival. Don't create a chat log for every movement tick. Client movement is cosmetic; authorization, membership, object occupancy, and world changes are server validated.

Presence is ephemeral. Saved player state is durable and periodically checkpointed. On reconnect, load the latest authoritative state, expire stale presence, and resume or cancel a route explicitly. Filter messages and logs client-side with paginated persistent history later. Character movement should interpolate remote snapshots rather than write Postgres every frame.

## Muse and Lila's agent integration (design only)

Muse is an external agent whose exact product, API, and authentication capabilities are not yet confirmed. This game does not automatically read Muse conversations, calendars, or either person's real-world location. Before implementation, identify how each agent can call authenticated tools and how schedules are authorized.

Proposed narrow server tool boundary: `get_world`, `get_locations`, `get_player_state`, `set_activity`, `move_to_location`, `cancel_activity`, and `propose_world_change`. Exact API and credential method remain to be reviewed. Each player's integration can control only their own character unless explicit delegation is approved. Privileged credentials and AI provider keys stay server-side. Do not put agent credentials in Vite environment variables or the Git repository.

A routine such as “gym at 6” becomes a scheduled activity only after the user has authorized the schedule and selected the destination. The server should distinguish planned departure, travel, and arrival. Default activity reporting is self-declared; actual GPS tracking is outside scope. Do not create a ChatGPT automation merely from examples in this document.

## AI-assisted creation

Use an under-construction area for proposals and previews. Yoon reviews changes before they enter the active world. Agent-generated content is data with a validated schema, not executable scripts. Map/template changes carry versions, stable IDs, asset references, bounds, collision shapes, interaction anchors, and portal destinations. Check routes and entrance/exit reachability before approval. The prototype's local board is just an idea collector; it does not invoke AI.

## Asset storage and animation

- `public/assets/characters/`: runtime character sprite sheets and animation atlases.
- `public/assets/tiles/`: terrain and city tiles.
- `public/assets/objects/`: desks, chairs, interactive props, and state variants.
- `public/assets/buildings/`: exteriors, interiors, and building atlases.
- `art/source/`: editable source art. Keep exported runtime assets separate.
- Record authorship and license in `art/ASSETS.md` for every imported/generated asset.

The first assets live in Git and are served from the chosen game host. When editable source media becomes large, decide whether Git LFS or separate source storage is appropriate before introducing it. Future in-game uploads use Supabase Storage and a database asset registry. Prefer immutable versioned paths so updates don't break animation references or caching. For private worlds, authorize asset access rather than exposing an unrestricted upload bucket.

A desk defines collision bounds, interaction point, seat anchor, facing direction, animation name, and owner/occupant. Each character animation set should eventually include walk, idle, sit-enter, sit-idle, and sit-exit for required facings. Layering must place the seated character correctly behind/in front of the desk. The prototype uses procedural art and one generic character; custom Yoon/Lila sprites follow later.

## Data and security foundation

The unapplied migration defines worlds, world_members, player_states, and activity_events with row-level security. Membership is limited to two by a serialized insert trigger. Owners enroll themselves first and then a second known account; a friendly invite flow is future work. Activity event kinds separate chat messages from logs. High-frequency sync and private Realtime channel authorization are not implemented by this migration and must be added before enabling live play.

Use only the public Supabase URL and browser-safe publishable key in `.env.local`. Never expose service-role keys or AI secrets. Backups, migrations, Realtime policies, upload limits, reconnect behavior, and two-session authorization tests are required before deployment. Do not apply migrations to a live Supabase project without an agreed target and deployment approval.

## Development workflow

Repository: https://github.com/yoonjoonso/little-world

Use `feat/*`, `fix/*`, and `docs/*` branches with pull requests into `main`. The initial default branch is a minimal repository bootstrap. Keep this specification current. PRs describe actual behavior, checks, and limitations. CI runs tests and the production build. Routine merges and publishing are authorized for now. Major architecture changes still require Yoon's approval. Do not change repository visibility without a request.

## GitHub Pages preview deployment

The `Publish game to GitHub Pages` workflow tests and builds `dist/`, then publishes it from approved changes on `main`. Vite emits relative asset URLs so the build works at the repository subpath. No Supabase credentials or paid services are needed for this offline preview.

Completed owner setup: repository Settings → Pages → Build and deployment → Source → GitHub Actions. The first prototype was published successfully from PR #1. Publish future reviewed changes by merging their PR to `main` under Yoon’s standing routine-publishing authorization. The workflow also supports a manual run. Routine updates may be merged and published directly under the current authorization.

The prototype site is public. Its messages and logs remain local to each browser session, and idea drafts remain local to that browser. Hosting alone does not enable multiplayer. No live Supabase migration is needed for the preview.

## Game-first interface (current change)

The game itself fills the browser viewport with no surrounding landing-page header, intro, footer, or fixed sidebar. Phaser resizes with the viewport and the camera follows the player when the map is cropped, preserving artwork proportions. Compact in-game overlays show the location, day, help, and single-player preview status.

Chat starts collapsed. A floating chat button expands/collapses the activity panel without restarting the game or losing the current session's messages, logs, draft message, or filter. Only unread messages increment the badge, clearing when Messages is viewed. Logs never trigger notifications. Future remote messages will feed the same notification behavior. No simulated incoming messages are shown. Opening chat pauses movement/input for now to prevent typing or touch gestures moving the character.

On mobile and other coarse-pointer devices, a persistent D-pad and contextual interaction button sit inside the game. Safe-area offsets keep controls away from device edges. Pointer cancellation, capture loss, tab blur, and hidden-page transitions release held directions. Chat has its own scrolling area; the page itself does not scroll. These are first-class mobile controls, not a requirement to use a physical keyboard.

Art direction remains unconfirmed. Compare three more detailed directions using the same cottage/garden scene: detailed cozy pixel art, hand-painted 2D storybook art, and pre-rendered miniature/diorama sprites. Keep the existing placeholder artwork until Yoon selects a direction. Direction images are concept previews, not assets automatically installed into the game. Do not add unconfirmed city buildings as part of the art comparison.

## Rendering, sprint, and message separation

Use native 1x camera zoom and nearest-neighbor display rather than magnifying the map to cover the viewport. The camera follows the player on small screens. The HUD shows the viewer’s current local calendar date and refreshes while open. Shift runs at 1.8 times walking speed; mobile has a Run toggle alongside the existing D-pad and Interact button.

Messages is the default chat tab; Logs is separate and All is removed. Logs never produce unread notifications. Current messages are local only.

Possible future NPC queue: authenticated player submits a job in Supabase, an authorized worker claims it, then writes dialogue and validated action proposals before marking it complete. Use pending/processing/completed/failed states, claim leases, idempotent action IDs, expiry, bounded retries, and per-world ownership checks. No live queue or worker has been configured. An existing agent worker may consume its normal plan limits if its supported integration permits this; queueing does not itself supply inference or eliminate API fees. Confirm the worker connection before implementing this architecture.

## NPC inbox and native camera (November 6 update)

Yoon confirms asynchronous NPC conversations: players can append messages while an NPC is thinking. The agent-facing log is separate from player activity logs and ordinary chat, with an unobtrusive debug view for the owner. Intended readers/responders are this assistant, Yoon’s Muse, and Lila’s Muse, each through explicitly connected authenticated tools. Conversations do not wake these agents automatically.

The current frontend implements a browser-local persistent Milo inbox and allows further messages while awaiting connection. It explicitly labels the missing worker and offers a local JSON debug view when opened with `#agent-debug` and talking to Milo. This is neither a shared backend nor an agent API. No fake AI answers are generated. Read the proposed integration contract in `docs/AGENT_INBOX.md` before backend implementation.

The camera now uses native 1x world scale rather than enlarging the map to cover the viewport; on larger displays more of the map and surrounding background are visible. World labels render at 2x texture resolution. The game uses procedural graphics and Phaser text, not generated images with baked-in text.

## Companion status and village scope

The upper-left panel keeps “our little world” and the current date, with the other player’s location/activity directly beneath the title and a presence dot beside it. For Yoon this will show Lila; for Lila it will show Yoon after account mapping exists. The current single-player preview says “Lila · not connected” with an unknown gray dot. Do not fabricate offline/online state or location from the local player’s state. Own location remains in Help.

See docs/VILLAGE.md for Yoon’s confirmed locations, automatic walking and interactions, Muse construction avatar behavior, character/content generation, and operational error inbox. These are product requirements, not a claim that multiplayer, workers, generated assets, or Supabase are already running.
