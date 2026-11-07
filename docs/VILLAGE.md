# Shared village requirements

Confirmed by Yoon on November 6, 2026. Exact map layouts and room dimensions still need iteration. Art direction: Minami Lane-inspired soft illustration, keeping our existing straight-on top-down view rather than a diagonal/isometric angle. Keep the approved Phaser/React/TypeScript/Supabase architecture.

## Companion indicator

Keep “our little world” in the upper-left panel. Replace the current-map subtitle with the other player's name and current location/activity, such as “Lila · Hospital · Working”. On Lila's account show Yoon. Keep today's date.

The adjacent dot represents the human player's online/offline presence, not whether their agent is busy or their persistent character is active. Connection unknown/reconnecting is distinct from offline. If offline, show last-known location with that qualifier. Do not infer real-world whereabouts or invent live status. Logs are history, not the primary way to locate each other. A later tap-to-locate affordance may reveal the companion on the map without teleporting either character.

## Confirmed locations and interactions

| Location | Use | Interaction targets |
| --- | --- | --- |
| Shared home/cabin | Home base with expandable rooms | Entry, room doors |
| Home desk | Yoon's work desk | Desk/chair |
| Bathroom | Bathing | Bath |
| Study | Work/study at home | Study desk |
| Cabin living room | Watching shows together | TV plus two nearby seats |
| Hospital | Lila's working location | Work station/arrival anchor |
| Park with pickleball court, running track, and fishing lake | Pickleball, running, fishing | Court, track route/loop, lakeside fishing spot |
| Strip mall | Shopping area with a cinema | Street and shop entrances |
| Movie theater | Going to the movies | Screening room/seats |
| Bar | Drinking beer | Bar stool/table |
| Library | Working away from home | Reading/work desk |

TV currently means shared in-world activity and seating. Streaming or synchronizing actual video playback is a separate, unconfirmed feature. Preserve multiple room/door connections as the cabin expands. Confirm details of distinct home-desk versus study activities as layout develops.

## Agent-directed activity, without teleporting

MCP means Model Context Protocol: it can expose tools to an agent. Our API owns the commands; the game owns navigation and interaction logic. The agent sends semantic intent such as `set_activity(player, "bathing", target="home.bath")`. It must not calculate raw movement ticks, directly set player coordinates, or pretend an action happened before arrival.

Each target has a stable ID, map/room ID, walkable approach point, facing, interaction animation/state, availability rules, and optional occupancy slots. The game resolves a collision-safe route across maps, building entrances, and room portals. A normal door/map transition is allowed; jumping directly from the desk to a bath or hospital is not. Then the character approaches, interacts, and enters the activity state. Leaving reverses the interaction before walking away.

Keep command states queued → walking → interacting → active → completed/cancelled/failed. Report real progress through Supabase. Manual player input takes priority and cancels/pauses agent-directed travel according to the established override policy. Conflicting target occupancy or a blocked route produces a visible failure, not a teleport fallback. Agent requests need authentication, owner/world scope, expiry, and idempotency IDs.

For shared TV use, both characters independently walk to distinct seats at the TV and enter the watching activity. One person's request must not force the other person's character to move without delegated permission.

## Muse as visible builder

Each Muse can have its own builder character/avatar, distinct from the human player character. A build job reserves a plot; its builder walks to the site's safe construction anchor and remains visibly building while assets/layout are being prepared. Do not trap the builder at an inaccessible anchor or close the only walking route.

Stage the generated exterior, interior, portal links, collision, and interactions together. Validate asset paths, dimensions, animation frames, spawn points, connectivity, and entrance/exit routes. Publish one version only after all required parts are ready. Replace the construction site with the completed exterior and enterable interior atomically. Retain the last working version for rollback.

Generation failure leaves the old world usable and marks the site delayed/failed; the builder must not imply progress forever. Resume/retry or release the plot explicitly. Other agents cannot complete or overwrite the same build concurrently. Existing occupants need a safe transition when an interior changes.

## New characters and art

Both Muse agents may generate and implement characters/content through a validated content pipeline. Use a shared approved style guide, scale, palette, perspective, anchor convention, animation naming, and asset manifest. Character definitions include stable IDs, sprite/atlas references, facing/idle/walk/sit states, collision footprint, and interaction hooks.

Runtime world/character additions are versioned data and assets. Engine or arbitrary executable code changes continue through feature branches and PRs under Yoon's ownership. New assets must be recorded in art/ASSETS.md. Nothing here assumes the agents already have image generation, upload, or deployment connections.

## Supabase inboxes and snags

Keep human Messages, activity Logs, NPC conversations/jobs, and operational errors as separate record categories. Supabase is the intended durable backend/API. Ordinary activity logs do not trigger unread-message notifications.

An operational error record includes world/job/command/asset IDs, stage, sanitized error, occurrence time, severity, attempt count, affected agent, and pending/claimed/resolved/blocked state. Report build, asset import, routing, worker, and interaction failures. Do not include credentials or private provider payloads. A failure to reach Supabase must also appear locally and be buffered/retried; it cannot rely exclusively on writing its own error to an unreachable database.

This assistant and authorized agents can claim repair work, inspect reproducible errors, and fix within their permitted scope. Only one repair worker claims an item; verify the fix before resolving it. Do not loop indefinitely or silently dismiss a failure. If repair needs user input, missing access, an architectural decision, or exhausted retries, mark it blocked and tell Yoon what failed, what was attempted, and what is needed. Show meaningful blocking errors as a system status notice, without turning routine logs into chat badges.

No always-running repair agent is connected yet. Persisting an error does not automatically wake this assistant; a configured worker or scheduled agent needs to consume it. Until that is connected, reports and repairs occur during active sessions. The existing local NPC inbox is a frontend preview, not this shared error/API system.

## Delivery sequence

1. Connect Supabase accounts, companion presence/location, and shared messages/inboxes.
2. Implement semantic activity commands, routes through doors, and interaction anchors with manual override.
3. Expand the cabin (bathroom, study, TV seating) and test two-player interactions.
4. Build the approved village locations and route graph in increments.
5. Connect Muse builders, generated characters, atomic content replacement, and error/repair workers.

This list establishes product scope; it does not apply live database migrations or claim the future locations are playable now.

## Approved visual direction and world clock

Use original Minami Lane-inspired soft illustrated art: rounded forms, consistent outlines, warm restrained colors, and enough prop detail to feel inhabited. Keep the current straight-on/top-down perspective; do not adopt diagonal isometric streets. The approved reference sets direction, not permission to reuse copyrighted game assets. Existing procedural placeholders are not the final art pass.

Start with two world-lighting states, day and night. Use one shared world timezone, initially America/Los_Angeles, independent of player device timezone; default day is 07:00–18:59 and night is 19:00–06:59. These hours are an implementation default, not a claim about astronomical sunset. The current frontend rechecks every 30 seconds using its date timer. Night applies a cool multiply overlay to the game only; chat, labels in the HUD, and controls stay readable. Indoor and outdoor light art and smooth dawn/dusk transitions can follow later. The displayed calendar date remains device-local for now.

## Confirmed content and routine additions — November 7

- Retain the gym, library, and park with pickleball, running track and fishing area. Add Northgate Groceries, a Mexican/Northgate-inspired supermarket. Its visitor activities include browsing and a spaced checkout queue.
- Movie theater: reception/concessions and one adjacent auditorium, with individual seat slots.
- Onsen: open-air hot-spring area; Mochi (green turtle backpack) and smaller Lilito (small black kippah) mostly relax there, sometimes with oranges on their heads, and occasionally visit elsewhere. They do not need a separate house.
- Religious district: Methodist church with female Pastor Cait; mosque with Imam Samir; synagogue with Rabbi Eli; Sikh gurdwara with Granthi Harjit. The gurdwara has distinct worship and langar areas. Leaders normally stay at their institutions but make short outings. Do not invent religious service times from the general visitor schedule.
- Reusable routine planner: usual area/activity plus one short daily outing window, stable per NPC and Pacific-time world day, not fresh randomness per viewer or frame. Unbuilt/unavailable destinations resolve to the usual routine. Lifecycle phases: idle, walking, interacting, active, waiting, blocked. Conversation/inference status is separate from movement/activity.
- Each new area must identify permitted visitors, possible activities, activity slots, spaced waiting slots, map/route anchors and opening rules. Players and NPCs share the occupancy system. Server reservations are atomic and leased, acquired before travel and released when leaving/cancelling. If occupied, select a free nearby waiting slot or another activity; leave/retry after bounded waiting. No overlapping NPC stacks or indefinite blocking of doors. The planner's slot choice is a candidate, never proof of a successful reservation.
- Default windows: Lucia reception 8–12 and 13–18, possible lunch outing at noon; Mochi morning outing around 10; Lilito afternoon around 15; Cait around 14, Samir around 13, Eli around 15, Harjit around 12. Each outing lasts around 45 world minutes with ±10-minute daily departure variation, on selected days. Otherwise they remain at their usual area. These are proposed defaults, not a live shared scheduler.

These content additions and the activity runner are queued, not built merely by recording them. Existing procedural player art still needs a coherent character art pass. The latest visual direction uses compact enterable exteriors and larger modular interiors, with a wider hallway. Every actual door is enterable or visibly blocked; NPC names use a shared small backed nameplate and say only their name.

## Strip mall and phased entrances

Confirmed storefronts: movie theater, Taco Bell, Golden Dragon (generic Chinese restaurant), Little Caesars, Pollo Campero, Carl's Jr., and Starbucks. Northgate Groceries is the Mexican/Northgate-inspired supermarket. All new storefronts/buildings whose interiors are unfinished use the same closed entrance art with lock/Coming soon indicator. No door interaction should silently fail. Already playable interiors, such as home, retain functional entrances. Religious leaders belong to their institution interiors once built; the gurdwara includes separate worship/langar spaces. New content is published in small usable increments for Yoon's review.

Reusable visual generation contract: art/STYLE_GUIDE.md. It fixes the illustrated camera, light direction, aspect/pivot conventions and scene-scale review requirements.
