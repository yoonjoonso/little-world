# Our Little World

Status: first single-player prototype is live at https://yoonjoonso.github.io/little-world/. A viewport-filling interface update is in development on `feat/immersive-game-layout`; it is not yet approved for deployment.
Owners: Yoon owns engine/code decisions; Yoon and Lila shape the world and content.

## Product

A persistent, shared browser-based 2D city for Yoon and Lila. Both characters inhabit the same world. Either player can manually walk, visit buildings, interact with objects, and talk. The other player sees their actions. The world can also reflect real-life routines: when an explicitly authorized agent sends a scheduled gym activity, the character travels to the gym and the other player can see it.

The city and buildings are not yet finalized. The garden and cottage are disposable starter content, not confirmed city designs. Ask Yoon to confirm each additional building before implementing it.

## Confirmed stack and responsibilities

- React + TypeScript: interface, dialogue, activity panel, touch controls, account and editor screens.
- Phaser 3: rendering, movement, collisions, maps, portals, interactive objects, animation, and pathfinding when added.
- Vite: local development and static production build.
- Supabase: planned Auth, Postgres, private Realtime presence/events, and Storage for uploaded assets. Initial client and unapplied schema are included. The playable prototype does not contact Supabase without configuration.
- GitHub: source, documentation, asset history, feature branches, pull requests, and CI.
- Hosting: GitHub Pages for the public static prototype, using the existing public GitHub repository. Supabase remains the planned separate backend. Future deployments need Yoon's approval; approved merges to `main` trigger the Pages workflow.

Keep one application with separate game, world, component, and service modules. Reconsider major changes with Yoon before implementation.

## Prototype acceptance

- [x] Credential-free browser game with original procedural placeholder art.
- [x] Character movement using WASD, arrows, or on-screen directional controls.
- [x] Solid-object collision and normalized diagonal speed.
- [x] Garden and one enterable cottage, with an exit back to the garden.
- [x] Desk highlight, contextual interaction prompt, sitting pose, and stand/cancel action.
- [x] E / Space and a mobile Interact button share the same interaction action.
- [x] A scripted conversational NPC with reply choices.
- [x] An under-construction board that saves local idea drafts, without building them automatically.
- [x] Collapsible in-game activity overlay with All, Messages, and Logs filters; a badge counts unread activity while collapsed.
- [x] Local messages and semantic logs for map transitions and sitting/standing.
- [ ] Live, authenticated two-player sync. Current UI explicitly says offline and local.
- [ ] Browser verification complete. The initial deployed game was visually checked; reliable keyboard/touch interaction QA and the new layout's browser QA remain pending. The session browser cannot reach the local preview server.

Validation: `npm test` passed 6 tests; `npm run build` passed TypeScript and the production bundle. Phaser produces a bundle-size advisory. Database migration has not been applied or integration-tested.

Sitting currently uses a procedural seated pose, with a simple idle movement. It is not finished custom character animation. Prototype progress and chat are session-local; idea drafts alone persist in localStorage on that browser. Do not call local messages shared or multiplayer.

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

Use `feat/*`, `fix/*`, and `docs/*` branches with pull requests into `main`. The initial default branch is a minimal repository bootstrap. Keep this specification current. PRs describe actual behavior, checks, and limitations. CI runs tests and the production build. Never deploy or make major architecture changes without Yoon's approval. Do not change repository visibility without a request.

## GitHub Pages preview deployment

The `Publish game to GitHub Pages` workflow tests and builds `dist/`, then publishes it from approved changes on `main`. Vite emits relative asset URLs so the build works at the repository subpath. No Supabase credentials or paid services are needed for this offline preview.

Completed owner setup: repository Settings → Pages → Build and deployment → Source → GitHub Actions. The first prototype was published successfully from PR #1. Publish future reviewed changes by merging their PR to `main` after Yoon approves deployment. The workflow also supports a manual run. Do not merge future changes to `main` without approval to publish them.

The prototype site is public. Its messages and logs remain local to each browser session, and idea drafts remain local to that browser. Hosting alone does not enable multiplayer. No live Supabase migration is needed for the preview.

## Game-first interface (current change)

The game itself fills the browser viewport with no surrounding landing-page header, intro, footer, or fixed sidebar. Phaser resizes with the viewport and the camera follows the player when the map is cropped, preserving artwork proportions. Compact in-game overlays show the location, day, help, and single-player preview status.

Chat starts collapsed. A floating chat button expands/collapses the activity panel without restarting the game or losing the current session's messages, logs, draft message, or filter. Unread activity increments a badge while collapsed and clears when opened. Current notifications are local activity logs; future remote messages will feed the same notification behavior. No simulated incoming messages are shown. Opening chat pauses movement/input for now to prevent typing or touch gestures moving the character.

On mobile and other coarse-pointer devices, a persistent D-pad and contextual interaction button sit inside the game. Safe-area offsets keep controls away from device edges. Pointer cancellation, capture loss, tab blur, and hidden-page transitions release held directions. Chat has its own scrolling area; the page itself does not scroll. These are first-class mobile controls, not a requirement to use a physical keyboard.

Art direction remains unconfirmed. Compare three more detailed directions using the same cottage/garden scene: detailed cozy pixel art, hand-painted 2D storybook art, and pre-rendered miniature/diorama sprites. Keep the existing placeholder artwork until Yoon selects a direction. Direction images are concept previews, not assets automatically installed into the game. Do not add unconfirmed city buildings as part of the art comparison.
