# Our Little World — reusable art contract

## Camera and view

Use an **orthographic, straight-on elevated view**: the camera looks down approximately 30° from horizontal toward the front of the object. This describes the illustrated look, not a measured 3D camera in Phaser. Facades face the screen; horizontal edges stay horizontal and verticals stay vertical. Show the front face plus a modest top surface. No diagonal/isometric yaw, vanishing-point perspective, fisheye or overhead-only view. Objects have the same orientation as the existing cottage and desk.

The engine uses a flat 2D world and native 1× camera zoom. A foot/ground anchor is the placement reference. Buildings are compact outside and larger inside; entrance transitions are intentional. Every door is enterable or visibly marked blocked, never a misleading decoration.

## Style, color and light

Cozy soft hand-painted illustration, rounded readable forms, restrained warm wood/cream/sage palette, soft brown outlines. Upper-left light for all assets. Keep small objects readable at their actual game size. Avoid photorealistic textures, heavy black outlines, over-detailed tiny text and noisy repeated patterns. Character names are runtime text on a small soft-backed nameplate, not baked into images.

Existing generated art is an initial pass, not a perfect style reference. The procedural player is a temporary scale/animation placeholder, not the final character style. Use the most recent in-scene review before producing large batches.

## Scale and proportions

World units equal screen pixels at native zoom. Updated November 7: standard adult human target is 96 native screen units tall, about 40–45 wide. The user approved the request board, onsen and capybara scale and identified the human, tree and building scale as too small; keep those approved landmarks unchanged. Keep the same baseline scale across Yoon, Lucia and future adults. The old 44-unit procedural character is a placeholder to replace, not the size reference. Seated heads should stay at comparable scale, with the torso/legs layered behind furniture rather than the whole person hovering above it. Capybaras are smaller than humans; Lilito is visibly smaller than Mochi.

Typical prop boxes: chair 38×48, work desk 146×100, reception desk 154×94, bed 160×180, bath 150×104, shower 72×126. These are gameplay footprint/visual targets, not permission to stretch an arbitrary source image. Generate props with the corresponding aspect ratio, then preserve cropped art proportions when fitting to the box. Crop frames to the visible object plus consistent padding; do not use a full square cell if it contains large empty margins. Keep separate ground collision, seat, approach, facing and waiting anchors.

Small storefronts are about 380–450 units wide; the house is about 500, Planet Fitness about 620, AMC about 800, Northgate about 900, and Hospital about 1000. Trees are about 225 by 250. Preserve aspect ratios and set the building box to its actual visible height so entrances front the sidewalk. Preserve useful door/approach clearance. Interior room definitions and props are independently reusable and parent-relative. Use about 90–100 units of hallway width where several characters may pass; doors must remain reachable around furniture.

## Runtime/source rules

Use genuinely transparent PNGs, independent props/characters, and clear atlas frame boundaries. No flattened whole-world background. Source PNGs stay unchanged; scene placement and frame rectangles are code/data. A square atlas is a container, not a required square object shape. Keep text, labels, signs and interaction indicators in the engine. Record provenance and final prompts in ASSETS.md. Store runtime exports under public/assets and editable/original drafts under art/source.

Every character definition supplies stable ID, display name, appearance reference, ground pivot, collision footprint, animation/state names, usual area, permitted outing areas, and interaction hook. Every area supplies visitor activities, capacity slots, spaced waiting anchors and clear entrance availability. Slot selection is not a reservation; shared occupancy is server-authoritative.

## Standard generation prefix

> Original reusable 2D game asset for Our Little World. Cozy soft hand-painted illustration, rounded forms, restrained warm cream/sage/wood palette and soft brown outlines. Orthographic straight-on elevated view, approximately 30° downward pitch from horizontal, front facing the screen, no isometric/diagonal yaw or vanishing-point perspective. Consistent upper-left lighting. Match the supplied approved in-scene reference. True transparent background, whole object inside frame with modest padding. No people unless requested; no text, grid, watermark or surrounding scene. Target visible-object width:height ratio: [ratio]. Ground pivot: [anchor]. Must read clearly at [world width]×[world height] native screen units.

For a seated desk variant add: front panel toward viewer; seated user behind desk facing down toward the screen; back of laptop faces viewer; include no person/chair in desk art. Generate sitting/standing character frames separately at matched head size.

## Review before acceptance

Inspect at native scene scale: silhouette, angle, pixel density, crop/padding, aspect ratio, foot pivot, chair/desk layering, collision and approach clearance, and nameplate contrast. Check day and night plus mobile. Review a small applied batch with Yoon before expanding the style. Angle and proportion errors are reasons to regenerate, not hide them with severe nonuniform scaling.

## Individual image rule (user requirement)

Every runtime object, building, character and character pose uses its own PNG. Do not generate or edit multi-asset sheets. The historical sheets remain unchanged as legacy source only. Existing art was separated with user-authorized exact crops; art/crop-manifest.json records source rectangles. Inspect the full crop against a neutral background and in the scene: no clipped heads/feet/props and no neighboring asset fragments. The old default storefront crop accidentally included Northgate; use the corrected isolated storefront, never that legacy rectangle. Each placed building has a separate image file even when the initial artwork is a shared template. Edit that individual file only. Atlas packing can be an automated build optimization later, never the editable source.

## Town layout

Front doors face continuous paved sidewalks. Use connected blocks, curbs, crossings and small landscaped plazas; avoid disconnected dirt rectangles. Commercial groups: AMC/Planet Fitness/Taco Bell/Starbucks/Golden Dragon; Hospital/Little Caesars/Carl’s Jr.; Northgate/Pollo Campero/La Jara Brewery. 7-Eleven is near home, Library beside Commons Park. Park activity zones share circulation and green buffers; onsen is inside the park. Big Bear mountains/lake/trails and Long Beach coast are remote regions. Minimap labels identify the current region outdoors and building indoors.

## Vendor counters and monumental scale

NPCs working a counter stand behind its front layer. Keep the head/shoulders visible, lower body occluded naturally, and define separate customer approach and staff departure anchors. Vendor NPC pose points may be inside the counter footprint while active; walking resumes at a legal rear anchor. Generate customer-facing and vendor-facing variants as separate images; never embed the worker into the counter image. LA-specific details matter: taco folding table/skirt/griddle/salsas/tortillas; hot dog flat griddle/bacon-wrapped hot dogs/onions/peppers/propane, not the generic New York umbrella cart.

Monumental buildings must read substantially larger: Town Arena is 1800 units wide versus AMC800, Hospital1000 and normal shops380–500. God mode in Settings fits the whole map to the viewport; normal view follows the player at native scale. Outdoor regions use short names (Mall, Home, Commons, Park, Onsen, etc.). Big Bear is northwest; Long Beach southeast. Park fishing lake removed by user: retain fishing at Big Bear only.
