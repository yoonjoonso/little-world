# Our Little World — reusable art contract

## Camera and view

Use an **orthographic, straight-on elevated view**: the camera looks down approximately 30° from horizontal toward the front of the object. This describes the illustrated look, not a measured 3D camera in Phaser. Facades face the screen; horizontal edges stay horizontal and verticals stay vertical. Show the front face plus a modest top surface. No diagonal/isometric yaw, vanishing-point perspective, fisheye or overhead-only view. Objects have the same orientation as the existing cottage and desk.

The engine uses a flat 2D world and native 1× camera zoom. A foot/ground anchor is the placement reference. Buildings are compact outside and larger inside; entrance transitions are intentional. Every door is enterable or visibly marked blocked, never a misleading decoration.

## Style, color and light

Cozy soft hand-painted illustration, rounded readable forms, restrained warm wood/cream/sage palette, soft brown outlines. Upper-left light for all assets. Keep small objects readable at their actual game size. Avoid photorealistic textures, heavy black outlines, over-detailed tiny text and noisy repeated patterns. Character names are runtime text on a small soft-backed nameplate, not baked into images.

Existing generated art is an initial pass, not a perfect style reference. The procedural player is a temporary scale/animation placeholder, not the final character style. Use the most recent in-scene review before producing large batches.

## Scale and proportions

World units equal screen pixels at native zoom. Typical human: about 48–70 units tall, 24–34 wide. Seated heads should stay at comparable scale, with the torso/legs layered behind furniture rather than the whole person hovering above it. Capybaras are smaller than humans; Lilito is visibly smaller than Mochi.

Typical prop boxes: chair 38×48, work desk 146×100, reception desk 154×94, bed 160×180, bath 174×120, shower 90×145. These are gameplay footprint/visual targets, not permission to stretch an arbitrary source image. Generate props with the corresponding aspect ratio, then preserve cropped art proportions when fitting to the box. Crop frames to the visible object plus consistent padding; do not use a full square cell if it contains large empty margins. Keep separate ground collision, seat, approach, facing and waiting anchors.

Building exterior art fits roughly 220–280 units wide for a small building. Preserve useful door/approach clearance. Interior room definitions and props are independently reusable and parent-relative. Use about 90–100 units of hallway width where several characters may pass; doors must remain reachable around furniture.

## Runtime/source rules

Use genuinely transparent PNGs, independent props/characters, and clear atlas frame boundaries. No flattened whole-world background. Source PNGs stay unchanged; scene placement and frame rectangles are code/data. A square atlas is a container, not a required square object shape. Keep text, labels, signs and interaction indicators in the engine. Record provenance and final prompts in ASSETS.md. Store runtime exports under public/assets and editable/original drafts under art/source.

Every character definition supplies stable ID, display name, appearance reference, ground pivot, collision footprint, animation/state names, usual area, permitted outing areas, and interaction hook. Every area supplies visitor activities, capacity slots, spaced waiting anchors and clear entrance availability. Slot selection is not a reservation; shared occupancy is server-authoritative.

## Standard generation prefix

> Original reusable 2D game asset for Our Little World. Cozy soft hand-painted illustration, rounded forms, restrained warm cream/sage/wood palette and soft brown outlines. Orthographic straight-on elevated view, approximately 30° downward pitch from horizontal, front facing the screen, no isometric/diagonal yaw or vanishing-point perspective. Consistent upper-left lighting. Match the supplied approved in-scene reference. True transparent background, whole object inside frame with modest padding. No people unless requested; no text, grid, watermark or surrounding scene. Target visible-object width:height ratio: [ratio]. Ground pivot: [anchor]. Must read clearly at [world width]×[world height] native screen units.

For a seated desk variant add: front panel toward viewer; seated user behind desk facing down toward the screen; back of laptop faces viewer; include no person/chair in desk art. Generate sitting/standing character frames separately at matched head size.

## Review before acceptance

Inspect at native scene scale: silhouette, angle, pixel density, crop/padding, aspect ratio, foot pivot, chair/desk layering, collision and approach clearance, and nameplate contrast. Check day and night plus mobile. Review a small applied batch with Yoon before expanding the style. Angle and proportion errors are reasons to regenerate, not hide them with severe nonuniform scaling.
