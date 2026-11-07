# Current work and handoff

Project: Our Little World. Repository: https://github.com/yoonjoonso/little-world. Hosted game: https://yoonjoonso.github.io/little-world/. This file and the other project documents are versioned in GitHub, not local-only deliverables.

## User priorities

Publish small usable increments frequently so Yoon can review the live game. Fix house usability/scale before broad expansion. Use three review passes: functionality, visuals/scale, and regressions. Read art/STYLE_GUIDE.md for consistent camera, light, aspect ratio and native scale.

## Published baseline

PR #8: Lucia reception, modular bedroom/bathroom/study/kitchen/reception, request board and small/medium/large planning plots; unread discoveries on minimap; initial deterministic NPC planning layer and pending Supabase request schema.
PR #9: onsen with Mochi/Lilito, reusable NPC identities and local inboxes, house exit enclosure repair, quieter floors, separated bath/shower, display-only minimap. Exit mat must be interacted with; walking cannot enter the void. Both PRs merged and Pages publishing succeeded.

## Current increment

Yoon avatar based on two supplied photos, four standing facings and a seated pose, 64-unit source scale; no original private photos copied into the public repo. Explicit Create/Update existing request-board mode with stable target IDs for players, NPCs, rooms, locations and placed objects; optional photo references retained locally. Shared photo/agent processing is still unconnected. PR #10 merged after 24 passing tests/build and browser checks; Pages publishing succeeded. Source draft sheets for storefronts/religious buildings are saved but are not placed yet.

## Next unblocked work

1. Implemented locally in the bathing increment: shared bathing interaction profile for onsen and bathtub. Enter via interaction, choose a separate activity slot; hide lower body under a waterline only while bathing, leave to a legal approach. Apply the same immersion rendering to existing capybaras so they are not visibly floating above water. Plan for both human players joining later with little refactoring.
2. Implemented in the bathing increment: clear NPC affordances for all NPCs: shared backed nameplates, small talk bubble, close-range highlight/prompt, distinct unread !. Preserve separate inboxes and do not invent agent replies.
3. Finish reviewing interior scale/layering and route clearance; player art is a directional static-pose pass, not finished walk cycles. Lucia is normally seated at reception, sometimes near the entrance when routines are later connected.
4. Add exterior-only buildings in reusable data. All unfinished interiors share the same locked entrance art plus Coming soon marker. User explicitly deferred most new interiors; do not build a large set of generic enterable interiors yet. Existing home remains enterable.
5. Small beach farther out at the edge of town (user clarified beach, not peach).
6. Connect authoritative NPC state runner, collision-safe routes/portals, daily routines and atomic shared player/NPC activity reservations. Pure daily plan/slot-candidate helpers exist; actual autonomous/shared runner does not. No NPC stacking: reserve before travel, use separate waiting spots, switch activity/leave after bounded wait if full.

## Confirmed world content

Retain gym, library and park with pickleball, running track and fishing lake sections. Add Northgate Groceries (Mexican/Northgate-inspired). Strip mall: one-auditorium theater with reception/concessions, Taco Bell, Golden Dragon (generic Chinese), Little Caesars, Pollo Campero, Carl's Jr. and Starbucks. Consider optional food variety only after these confirmed entries.

Open-air onsen: Mochi has green turtle backpack and sometimes orange on head; Lilito is smaller and has a small black kippah. They mostly relax there, later occasional walks elsewhere. No capybara house.

Religious district: Methodist church with female Pastor Cait; mosque with Imam Samir; synagogue with Rabbi Eli; Sikh gurdwara with Granthi Harjit. Gurdwara has separate worship and langar areas when interior is built. Leaders normally at their institutions, with short occasional outings. Their definitions/plans exist, but their buildings/interiors and live NPC instances are not yet placed.

## Supabase is blocked, not live

Target project name supplied by Yoon: base. Exact project reference unverified. Supabase plugin reports installed, but this chat has no Supabase project tools. No live schema inspected or migration applied. No URL/public key configured, no shared image buckets, no working live login/multiplayer/Muse worker. Files under supabase/migrations are prepared and unapplied. Do not blindly apply against unknown existing tables. AGENTS.md requires approval before live migration changes.

Needed: real project access and schema review, Auth/account mapping for Yoon/Lila, shared positions/messages/presence, private reference uploads and generated-model assets with registry/versioning, shared board updates and delegated Muse submissions, leased task processing/decision flags, actual NPC replies, per-user cross-device notification reads, common occupancy/seat locks. See docs/SUPABASE_SETUP.md and docs/AGENT_INBOX.md. Installed plugin tools may require a fresh chat explicitly selecting @Supabase. The existing Git credential cannot push workflow file edits, so build-time Supabase configuration was deferred rather than weakening access.

## Scheduled continuation requested but NOT created

Yoon requested a work cycle every three hours. No automation_update/scheduling tool is exposed in this chat, so no recurring automation exists from this session. Do not claim otherwise. Ready work-cycle prompt is in docs/WORK_CYCLE.md. Local scheduled tasks require the machine/app awake; user is considering Codex Cloud so coding can run independently. App project/cloud setup also was not performed by this chat (no project-management tools).

## Bathing increment verification

26 tests/build and browser entry/leave/movement/crop checks pass. NPC immersion and human immersion share a rendering primitive. Separate guest slots avoid the static capybara places. Shared snapshots carry activity target/slot, but reservations are not server-atomic until Supabase is configured. Third compatibility migration is prepared and unapplied. Confirm PR/deployment status before claiming a later increment is live.

## Town/park increment

Compact exteriors and Coming soon entrance behavior are implemented for all confirmed shops, hospital/bar/gym/library and religious buildings. The four leaders have original sprites and separate local inboxes near their institution entrances. The park has running/fishing/pickleball-practice and bench activities; the far-edge beach has a real coast image and wading, and the home shower has an activity. Current source has 30 passing tests plus successful targeted browser checks; confirm latest branch/PR/deployment before reporting this increment live. New asset provenance is in art/ASSETS.md. Next unblocked priority is the actual local NPC routine/navigation runner and shared occupancy integration interfaces; the deterministic intent planner alone is not a runner.

Supabase fallback checked: the CLI also has no saved access token, so it cannot inspect base. No login, migration, bucket or live backend configuration was performed. The three-hour recurring task remains NOT created.

## NPC runtime increment

Town/park PR #12 merged as 51c4540 after CI success. Local preview now has an actual NPC runtime: daily intents reserve distinct destinations or waiting places, collision-checked grid routes cross the house portal, seated/bathing NPCs leave their activity pose, conversation holds that NPC, and blocked travel waits/replans rather than stacking. Lucia returns to her desk; religious leaders remain outside their closed institutions. Northgate visits are at an outdoor browsing anchor, not an invented open interior. Closed library/langar plans fall back to usual locations.

NPC update notifications resolve to moving positions. Local runtime explicitly stops when a Supabase client is configured, pending a shared authoritative runner; it is not multiplayer. No offline snapshot is represented as shared state. 34 tests/build pass, including full simulated Lucia outing/return, endpoint collision checks and conversation/player avoidance. Existing browser flow checks passed after runtime integration. Directional walk cycles and live server occupancy remain unfinished.

## Home lounge increment

NPC runtime PR #13 merged as 289facce. Home reception now has reusable original TV-console and two-seat sofa props, with separate activity slots and a legal exit. This is a seated watching preview; no video/media service is connected. Source art remains unchanged and registered in ASSETS. Browser check caught and fixed sofa/actor layering; entry/leave pass. Corrected the NPC talk cue encoding to portable ASCII dots. New source files are UTF-8.

Remaining external dependencies: Supabase project access/configuration/schema review and approved live migrations; real auth/multiplayer/NPC authority, shared photo/model registry, storage, task worker and Muse delivery; a real cloud automation tool for the requested three-hour work cycle. New building interiors remain intentionally deferred behind Coming soon markers. All these are recorded rather than represented as completed.
