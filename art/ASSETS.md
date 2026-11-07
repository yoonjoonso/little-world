# Asset register

The prototype art is drawn by project code in `src/game/WorldScene.ts`. The original placeholders remain for players and some fixtures; generated runtime art is registered below.

For future assets, record: file path, creator/source URL, license or permission, generation tool if used, and the corresponding editable source file. Do not add unlicensed third-party art.

## Cozy modular atlas v1

- Runtime file: `public/assets/world/cozy-atlas-v1.png` (1254×1254 RGBA).
- Created November 7, 2026 with OpenAI built-in image generation for this project; selected by Yoon. No downloaded asset pack or third-party game art.
- Original generated PNG preserved unchanged; frame rectangles in `WorldScene.ts` select terrain and individual objects without raster edits.
- Prompt: 4×4 modular cozy soft illustrated RPG atlas, straight-on elevated top-down view, transparent background; grass/stone/wood/sand, wall/roof/door/window, tree/fence/gate/shrub, bench/desk/chair/planter; warm palette, consistent outlines and upper-left lighting.
- Generated source is the PNG; no layered editable source exists. Ground patches are cropped to their interior for repeating, but perfect seamless edges are not yet certified.
- Character sprites, pond, and remaining room fixtures are still procedural placeholders.

## Lucia and home/office furniture v1 — November 7, 2026

All four PNGs were created with the built-in OpenAI image generation tool for this project. Lucia uses Yoon's supplied character illustration as identity reference. No downloaded asset pack is used. Generated PNGs are the source; no layered source exists. Original alpha is preserved without raster edits. Phaser frame rectangles select independent reusable props.

- `public/assets/characters/lucia-v1.png`: standing and seated Lucia frames, black hair with pink streaks, freckles, pink/black top, pink arm warmers, denim shorts. Seated frame is used at reception and the standing frame supplies the conversation portrait. This is an initial static character pass; directional walking and sit transitions are unfinished.
- `public/assets/objects/home-furniture-v1.png`: bed, bath, bookcase, original laptop work desk.
- `public/assets/objects/office-bath-v1.png`: front-facing desk variant (back of laptop faces viewer) and shower enclosure.
- `public/assets/objects/kitchen-v1.png`: sink counter, stove, fridge, dining table.

Generation briefs: `art/source/lucia-home-prompts.md`. Room/prop definitions, instance placement, room-relative desk and NPC anchors, and collision footprints live in `src/world/home.ts`. Angle, scale and collision footprints remain adjustable independently of the PNGs. Bedroom/bath/kitchen furnishings are placed scenery in this pass; bathing, sleeping and cooking activities are not implemented.

## Request board v1

`public/assets/objects/request-board-v1.png`: original built-in OpenAI image generation, November 7, 2026. Prompt: a single isolated warm wooden cork noticeboard with terracotta canopy, legs, pinned cream cards showing a house/chair/person without lettering, sage/pink accents, straight-on elevated cozy illustrated perspective, upper-left light, transparent background. Unchanged generated PNG is source, no layered source or third-party pack. Runtime labels are drawn by Phaser. Board interaction, collision and placement are defined in `src/world/planning.ts`.

## Capybara character draft (not placed)

`art/source/capybara-draft-v1.png`: built-in OpenAI image generation, November 7, 2026. Two isolated cozy illustrated capybaras: Mochi with a green turtle backpack and orange on head; smaller Lilito with a small black kippah. Transparent background, frontal elevated game view, brown outlines and upper-left light. Original generated PNG, no layered source or third-party pack. Saved as a draft for the confirmed onsen addition; not currently loaded by the game. Further scale/pose review and directional/behavior art remain.

## Onsen and capybaras applied v1

- `public/assets/characters/capybaras-v1.png` is an unchanged copy of the registered capybara draft, now used for Mochi/Lilito. Frames select the separate characters. No new raster edit.
- `public/assets/objects/onsen-v1.png`: original built-in OpenAI image generation, November 7, 2026. Brief: isolated open-air oval stone onsen pool with warm pale turquoise water, steam, small floating oranges, bamboo spout and wooden near-edge step; cozy hand-painted straight-on elevated RPG view, upper-left light, true transparency, no people/animals/text/landscape. Generated PNG is source; no layered source.
- Placed as an open-air area with separate collision and safe NPC approaches. NPCs are a static relaxation pass; wandering/authoritative shared routines remain pending. Reusable appearance/interaction definitions are in src/world/npcs.ts.

## Yoon player avatar v1

`public/assets/characters/yoon-v1.png`: built-in OpenAI image generation, November 7, 2026, from two photos supplied by Yoon in this chat. Original photos are not copied into the public repo. Six-pose 3×2 atlas: standing front/left/right/back and seated front/back. Outfit: black tee with small white bear outline, blue jeans, dark shoes; short black hair, rectangular glasses and small stud earring. Prompt requests cozy hand-painted orthographic elevated RPG art, matched head scale, upper-left light, full-body transparent cutouts. A built-in background-extraction edit preserves the six figures while clearing surrounding backdrop; that selected generated PNG is stored unchanged. Alpha was inspected. No layered source exists. Runtime crops keep one 64/495 source scale; walk direction uses the four standing facings with a small movement bob, not completed walk cycles. Seated pose faces the screen behind the study desk. Remote account-to-avatar mapping remains pending; remote players retain placeholders rather than being mislabeled as Yoon.

## Unplaced exterior drafts

- `art/source/storefront-draft-v1.png`: built-in OpenAI generation, November 7, 2026. Two transparent facade cells: generic warm stucco strip-mall suite and larger Mexican-inspired grocery with produce crates, blank sign panels, straight-on elevated view, upper-left light. No third-party logos or pack images. Draft for future Coming soon storefronts; not loaded by the game.
- `art/source/faith-buildings-draft-v1.png`: built-in OpenAI generation, November 7, 2026. Transparent 2×2 atlas of modest church, mosque, synagogue and Sikh gurdwara exteriors, distinct architectural motifs, same cozy front-facing elevated view/light. Draft for the confirmed district, not loaded. Original PNGs are source, no layered source exists. Inspect scale/crops and apply the shared locked-door marker before placing them.

## Applied town exteriors, leaders, park and beach

- `public/assets/buildings/storefronts-v1.png` and `faith-v1.png`: unchanged copies of the registered exterior drafts. Runtime frames and data define the compact buildings; original signs remain blank and names are engine text. All unfinished interiors reuse the cozy atlas door plus one shared lock/Coming soon treatment.
- `public/assets/characters/faith-leaders-v1.png`: original built-in OpenAI generation, November 7, 2026. Transparent 2×2 adult fictional NPC sheet: female Methodist Pastor Cait (auburn hair, clerical shirt and sage cardigan); Imam Samir (cream tunic/skullcap); Rabbi Eli (glasses, beard/kippah, dark jacket); Granthi Harjit (blue turban, beard, cream kurta). Cozy simplified full-body front-facing elevated sprites, upper-left light. No external pack or layered source. Leaders currently meet visitors outside their closed institutions, not inside unfinished rooms.
- `public/assets/objects/park-water-v1.png`: original built-in OpenAI generation, same date. Two isolated modules, a natural fishing lake/dock and initial beach-cove draft. Only the lake frame remains placed; the original cove looked too enclosed for an edge-of-town coast.
- `public/assets/objects/beach-v2.png`: original built-in OpenAI generation, same date. Brief: grassy upper contour, broad sand, continuous surf and ocean filling lower third/off bottom-right, no sky/horizon, NOT an enclosed pond. Straight-on elevated cozy painted view with upper-left light. Unchanged PNG; runtime geometry mask blends the upper contour into terrain. Placed at the map corner, with ocean extending to the world edge. Shared immersion targets provide two wading places.
- `public/assets/tiles/quiet-grass-v2.png`: original built-in OpenAI generation, same date. Brief: quiet opaque repeating sage/olive grass around #91a56e, sparse tiny tufts/clover, very low contrast, no flowers/objects, no border/slab/vignette/lighting gradient, matching tile edges. The prior atlas grass included a patch border and produced visible checker seams. Source PNG unchanged; displayed as a repeat material at native scene scale.

Court/track markings and activity props (rod, racket, water drops) use engine geometry for precise reusable layouts. These are activity previews, not a scored sports game or fish-catching inventory. All new PNGs are generated source; no layered sources exist and no original user photos are included.
