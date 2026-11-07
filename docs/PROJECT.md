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

Art direction is confirmed: original soft illustrated art inspired by Minami Lane, retaining our straight-on/top-down perspective rather than diagonal isometric framing. See docs/VILLAGE.md. Current procedural art remains placeholder content until the art pass.

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

## Day/night lighting

The world now has day/night states with a shared Pacific-time clock: day 7am–7pm, night otherwise. The existing 30-second date timer updates lighting without reloading. Night tints only the game; menus and touch controls remain readable. See docs/VILLAGE.md for the confirmed art direction and expanded park (pickleball, running track, fishing lake).

## Modular world and multiplayer priority (November 7)

Yoon confirms reusable prefabs at object, building, plot, and neighborhood levels. Terrain and floors are editable tile layers inside these groups, not a single flattened background. Children use parent-relative coordinates. Moving a neighborhood moves its ground, roads, buildings, collision geometry, interaction anchors, portals, and NPC spawn points together. World connections must be revalidated after a layout edit.

Prefab definitions and placed instances are separate: instances have stable IDs, definition/version references, transforms, and explicit overrides. Resident assignments reference plot/house IDs independently of appearance. Destinations and saved interactions reference stable anchors rather than baked global coordinates. Neighbor houses can remain unassigned until Yoon names residents. Layout revisions must reconcile saved player positions and occupied objects; a connected player cannot be stranded inside newly moved collision geometry.

Art remains provisional: the generated comparison was too visually similar and too dense. Keep a coherent cozy direction, but review a small modular tileset and a block assembled from it before producing personalized avatars or replacing the world art. The uploaded Yoon photo is a character reference for later, not approval to generate the avatar now. Earlier art-direction notes do not override this pending modular asset review.

Next functional milestone is genuine two-player play, before a full city/art expansion:

1. Finish browser verification of viewport layout, touch movement, interaction, and chat input isolation.
2. Implement account/session UI and explicit account-to-character mapping, with an honest unconfigured/offline state.
3. Connect authorized world membership, remote player snapshots and interpolation, online presence, map changes, and reconnect cleanup.
4. Connect persistent shared messages and semantic activity logs; remote unread messages use the existing collapsed-chat badge.
5. Verify two independent sessions: both players see each other, chat crosses sessions, map transitions hide/show remote characters correctly, reconnect restores state, and unrelated accounts cannot access the world.

A live Supabase project and browser-safe configuration are required for the online verification. Do not claim multiplayer based only on local mocks or a successful frontend build. Applying the migration still requires confirmation of the target project and approval. No new multiplayer transport or hosting service is needed beyond the agreed Supabase architecture.

## Shared-play implementation in progress

The frontend now contains account sign-in/sign-out, authenticated membership discovery, periodic saved-position writes, saved-position restoration, remote character rendering/interpolation, shared event history, and shared message submission with visible send errors. The first transport uses bounded one-second database refreshes and a 15-second idle checkpoint, not realtime presence. Shared mode requires configuration, existing account memberships, and the foundation schema; it has not been verified against the live project. Saved remote positions are not evidence of current online presence. Seat occupancy and character-name mapping remain pending.

Three mocked integration tests cover missing membership, position restoration/cleanup, and failed sends. All 12 tests pass. Production build passes. Browser QA was attempted but local Chromium aborts because process-singleton socket creation is denied (`Operation not permitted`); browser interaction checks remain incomplete.

Activity routing: authenticated recognized updates use deterministic immediate actions; only tasks requiring interpretation/reasoning wait for a configured agent sweep. See docs/AGENT_INBOX.md. Neither the Muse connection nor a sweep schedule is live.

## Request board implementation (November 7)

The construction board now accepts building, NPC/neighbor, and object requests with a title, description, location, and up to three optional JPG/PNG/WebP reference photos (5 MB per file). NPC descriptions cover appearance, personality, and routine. Requests and original reference files persist in IndexedDB on the current browser and show Requested / Local; no remote builder is implied. Existing local idea drafts are retained in their previous storage but are not migrated automatically.

Shared requests, authorized photo storage, plot-linked markers, and worker claim/status updates remain to be connected to Supabase. In-game plot submission and authenticated Muse submission must converge on the same eventual shared request schema. This assistant creates the art and implementation after picking up a request; Lila and Muse need not provide generated runtime assets. Optional NPC sample photos are references, not a separate visual style. Unrecognized locations and requests needing an owner decision remain pending.

## First applied modular art pass

Yoon approved the generated cozy atlas. The garden now uses its ground patches, separate cottage wall/roof/door/windows, trees, fence segments, shrubs, planter, and bench. The cottage uses its wood floor, desk, and chair. Phaser atlas frames reference the unchanged PNG; individual pieces keep independent placement. Existing map boundaries, portals, movement, and desk interaction anchors remain in place. Characters, pond, and some interior fixtures remain procedural. This is the first applied art pass, not the completed city.

Night uses a gentle lavender soft-light tint instead of the previous dark multiply layer. Help includes a persistent toggle for regular lighting. Completed-sweep receipts support a world update panel and an exclamation marker over Milo for unread delivered NPC responses. No simulated sweep receipts are created; connecting actual worker delivery remains pending. Visiting Milo acknowledges his updates; viewing world updates acknowledges only world changes.

## Lucia, modular home, planning board and discoveries — November 7

Lucia replaces Milo as the main Muse/secretary NPC, based on Yoon's supplied reference. She normally sits at her separate reception desk near the entrance. Her nameplate says only Lucia and uses the common soft-backed NPC nameplate style. Her independent local inbox uses `little-world:npc-inbox:lucia`; the previous Milo inbox is retained untouched. No worker or agent connection is implied.

The compact outdoor village has an explicit enter-home interaction and a larger 1200×960 interior. Yoon reconsidered the continuous cutaway-house preview and chose compact exteriors with expanded interiors. Every future entrance must be functional or visibly blocked with an X/tape/sign; do not create apparently usable decorative doors. Bedroom, bathroom (bath and shower), study, kitchen and reception use reusable room/prop definitions with parent-relative furniture, walls, collision and stable interaction anchors. The hall is widened to 100 units. Bed/bath/shower/kitchen fixtures are placed scenery pending activity animations; Lucia is statically seated pending wandering routines. Study desk faces the screen with the player seated behind it. Invalid saved positions recover to a legal map spawn.

Willow Pond is removed. An illustrated request board is prominent near the paths, and small/medium/large empty plots have walkable planning signs. Interacting with a plot preselects its stable ID in the request form. Multiple building/object/NPC/map-change requests retain details and optional photo references in IndexedDB on this browser. Shared requests are not yet connected.

The old World updates tab is replaced by an SVG minimap. Delivered NPC replies and world changes add an exclamation at the destination, or the relevant entrance when the destination is on another map. Viewing the map does not acknowledge changes. Visit Lucia for her delivered replies; approach an updated world target and use Inspect changes. Read state is browser-local and separately keyed for each signed-in account (offline viewer separate). No simulated receipts are seeded in production. Database-backed cross-device reads require the pending Supabase setup.

Supabase target identified by Yoon: **base** (exact project ID still unverified). Plugin installed, but project tools were not exposed in this chat. No live database inspected or migration applied. The foundation remains unapplied. Prepared second migration adds shared requests, private per-player NPC messages, world updates and per-user read records, and service-only leased builder claims and completion/decision flags. It is not an active worker or deployed Muse API. Pages still needs the browser-safe Supabase URL/key wired into its build environment. The current Git credential cannot update workflow files, so that deployment configuration change was deferred. Two-account online verification remains outstanding.

## Next confirmed village additions

Mochi: capybara with green turtle backpack. Lilito: smaller capybara with a small black kippah. Both normally relax at an open-air onsen, sometimes with an orange on their head, with occasional wandering elsewhere. No separate capybara house needed. Religious district: church, mosque, synagogue and Sikh gurdwara. These are confirmed additions, not a claim that they have already been built.

See docs/VILLAGE.md for the subsequently confirmed leaders, separate gurdwara worship/langar areas, gym/library/sectioned park, Northgate Groceries, one-auditorium cinema, and occupancy-aware daily routines. src/world/npcRoutines.ts is a tested planning layer only; authoritative movement, shared reservations and scheduled worker execution are not connected yet.
