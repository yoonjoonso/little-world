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
