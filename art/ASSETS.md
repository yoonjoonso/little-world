# Asset register

The prototype art is drawn by project code in `src/game/WorldScene.ts`. No external sprite packs, images, or animation files are included.

For future assets, record: file path, creator/source URL, license or permission, generation tool if used, and the corresponding editable source file. Do not add unlicensed third-party art.

## Cozy modular atlas v1

- Runtime file: `public/assets/world/cozy-atlas-v1.png` (1254×1254 RGBA).
- Created November 7, 2026 with OpenAI built-in image generation for this project; selected by Yoon. No downloaded asset pack or third-party game art.
- Original generated PNG preserved unchanged; frame rectangles in `WorldScene.ts` select terrain and individual objects without raster edits.
- Prompt: 4×4 modular cozy soft illustrated RPG atlas, straight-on elevated top-down view, transparent background; grass/stone/wood/sand, wall/roof/door/window, tree/fence/gate/shrub, bench/desk/chair/planter; warm palette, consistent outlines and upper-left lighting.
- Generated source is the PNG; no layered editable source exists. Ground patches are cropped to their interior for repeating, but perfect seamless edges are not yet certified.
- Character sprites, pond, and remaining room fixtures are still procedural placeholders.
