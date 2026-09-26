# Reader DOM audit

Scope: Reader story rendering, measurement, Studio render slots, viewport,
and selected shared/library application shells. This is not an exhaustive audit
of every application page.

## Before

```text
ReaderViewportProvider (no DOM)
main reader-viewport
  div camera-viewport (runtime root)
    div absolute inset-0 (stage host)
      ReaderStage -> div camera-stage
        TaleScene / StudioScene (renderer selection)
          ReaderScene -> article scene-article
            ReaderSceneContent (fragment)
              div clipped-content-layer
                div frame-content-layer
                  SceneFrames -> div scene-container
                    FrameRenderer -> div layout-frame (recursive groups)
                      ElementFrame -> div frame-element-frame
                        TaleElement (renderer selection, no DOM)
                          ReaderElement -> div element-container
                            semantic content
              positioned-element-frame -> positioned-element-content
                ReaderElement -> semantic content
            FixedElements (fragment)
              fixed layer -> fixed-element-frame -> fixed-element-content
                ReaderElement -> semantic content
```

Quote content previously used `blockquote > div.space-y-6 > p`, with a
sibling `cite`. Library navigation used `nav > div.flex > a`.

## Decisions

| Node | Responsibility and decision |
| --- | --- |
| Viewport main | Keep: main landmark, isolation, fixed/sticky dimensions and clipping. |
| Preview scroll root and spacers | Keep: scroll ref and independent scroll extent. |
| Camera viewport | Keep: docked sidebar offsets, runtime registry root and clipping. |
| Stage host | Removed: no refs, handlers, padding, border, clipping or transform; duplicates the camera viewport's positioned bounds. |
| Camera stage | Keep: imperative camera transform and stage ref. |
| Scene article | Keep: semantic story unit, world position, visibility, scene animation target, article styles and action runtime root. |
| Clipped content layer | Keep: shared scene-size clipping for frames and clipped positioned elements. |
| Frame content layer | Keep: independent frame clipping/containing block. Removing it would let positioned siblings participate in scrollable overflow with frames, and could change scroll-container behavior. |
| Scene container | Keep: authored styles, flex/grid layout, sizing and measurement query target. Cannot merge with article without combining independent authored style surfaces. |
| Layout frame/group | Keep: recursive layout, authored position/overflow, measurement, group animation target and Studio overlay containing block. No semantic section is implied by an arbitrary layout group. |
| Normal element frame | Keep: parent grid/flex placement, min-width, authored size and outer animation registry target. |
| Positioned element frame | Keep: absolute placement and centering transform independent of content. |
| Positioned/fixed content div | Keep: auto-height, full-width flex item. Removing it makes the h-full ReaderElement a direct flex item and changes percentage-height/stretch resolution. |
| Fixed layer | Keep: engine-managed viewport counter-transform, dimensions, visibility and shared overflow policy. |
| Fixed element frame | Keep: positioning and pointer-events restoration inside the pointer-events-none fixed layer. |
| ReaderElement container | Keep: full-size relative box, Studio capture/double-click events and overlay positioning; for fixed elements also the registered animation target. |
| Text div plus paragraph | Keep: separate decorated/padded box and editable text area. Moving contentEditable to the outer box changes focus outline, selection and double-click/blur hit areas. |
| Image/video figure | Keep: media grouping/caption semantics and clipping/decorations independent of media sizing/object-fit. |
| Quote paragraph div | Removed: only supplies paragraph spacing. Non-final paragraphs now own the same bottom spacing; cite margin remains independent. |
| Quote blockquote/cite | Keep: accurate quotation/attribution semantics. |
| Audio anchor | Keep: hidden audio and its observable/clickable activation anchor have different boxes and responsibilities. |
| Choice/codex buttons and text spans | Keep: native button semantics and separate text layout/icon alignment. |
| Sound-cue container | Keep: groups independently styled label/mood paragraphs; no extra landmark is warranted. |
| Measurement root/article/content layer | Keep: hidden offscreen ref, per-scene constraints and intrinsic inline-block sizing. Removing these can change shrink-to-fit and percentage sizing. |
| Render providers, TaleElement/TaleScene, action runtime | No wrapper removal: component boundaries do not necessarily emit DOM. |
| Library nav inner div | Removed: flex/wrap/gap moved to existing semantic nav; links, accessible name and aria-current preserved. |
| LibraryChrome outer/grid/text/image boxes | Keep: width constraint, responsive columns, text grouping, image-fill containing block and decoration. |
| LibraryBrowsePage outer/header text group | Keep: grid gap and text grouped as one responsive flex item beside the action. |
| ComicPanel | Already renders one configurable semantic root; decoration/layout belongs to it. |
| ComicRail decorative span | Keep: visual decoration, already aria-hidden. |
| UserMenu wrappers | Retained: Clerk-controlled rendering and inherited layout need live integration verification before changing child structure. |
| TaleInteractionMotion contents div | Keep: ref, scoped capture handlers and feedback boundary. display:contents removes its layout box, not its event responsibility. |

## After and savings

The story chain is the same except `camera-viewport > camera-stage` is direct.
Quotes now render `blockquote > p + p + cite`; library navigation renders
`nav.flex > a + a`.

Savings: one element per mounted viewport, one per rendered quote (including
measurement copies), and one per LibraryChrome. Existing semantic roots are
preserved; no arbitrary layout div is relabeled as a landmark.

## Verification limits

Local Chromium before/after CSS fixtures produced identical screenshot bytes
at 375px and 1280px widths for stage geometry, wrapped quote paragraphs with
attribution, and wrapped navigation links. These fixtures isolate the changed
CSS relationships; they are not screenshots of a running authenticated app.
No development server was started. Full application visual equivalence,
Clerk behavior and Studio editing were not browser-tested in this audit.
