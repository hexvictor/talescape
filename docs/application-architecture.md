# Application Architecture

This document describes the current Talescape application boundaries and the
state ownership rules used when extending them.

## Application Domains

```mermaid
flowchart TD
    Browser[Browser] --> Root[Root App Layout]
    Root --> Site[Site Route Group]
    Root --> TaleApp[Tale App Route Group]
    Root --> APIs[HTTP and tRPC APIs]

    Site --> Landing[Landing]
    Site --> Auth[Authentication]
    Site --> Codex[Codex]
    Site --> Library[Community Library]

    Library --> Browse[Browse and Search]
    Library --> Detail[Book, Author, Tale Detail]
    Library --> Manage[Create and Edit Metadata]

    TaleApp --> ReaderRoutes[Tale Reader Routes]
    TaleApp --> StudioRoutes[Tale Studio Routes]
    ReaderRoutes --> ReaderRuntime[Reader Runtime]
    StudioRoutes --> EditorRoute["/studio/[taleId]"]
    StudioRoutes --> PreviewRoute["/studio/[taleId]/preview"]
    EditorRoute --> StudioRuntime[Tale Studio Runtime]
    PreviewRoute --> StudioRuntime
    ReaderRuntime --> SharedRuntime[Shared Tale Runtime]
    StudioRuntime --> SharedRuntime

    APIs --> TRPC[tRPC Routers]
    APIs --> Uploads[UploadThing]
    APIs --> Webhooks[Clerk Webhooks]
    TRPC --> DataLayer[Queries and Mutations]
    DataLayer --> Drizzle[Drizzle Schema and Relations]
    Drizzle --> Database[(PostgreSQL)]
```

The `(site)` route group owns conventional site pages. The `(tale-app)` route
group owns the full-screen tale experience. `(reader)` owns public reading
routes. `(studio)` owns one mounted Tale Studio application with URL-backed
`editor` and `preview` workspaces. Both reuse the formatted tale, rendering,
compilation, and viewport infrastructure in `(tale-app)/_shared`.

## Client and Server Boundaries

```mermaid
flowchart LR
    subgraph Server[Server Components and Services]
        Route[Next.js Route Component]
        Authz[Access Conditions]
        Query[Tale or Library Query]
        Format[Format Tale]
        Mutation[Validated Mutation]
        DB[(Database)]
        Route --> Authz --> Query --> DB
        Query --> Format
        Mutation --> Authz
        Mutation --> DB
    end

    subgraph Client[Client Runtime]
        AppProvider[TaleRootStoreProvider]
        DocumentProvider[TaleTaleRootStoreProvider]
        RuntimeProvider[TaleReaderProvider]
        Runtime[Tale Reader or Tale Studio Runtime]
        Engine[Scroll and Camera Engine]
        DOM[DOM Rendering]
        UI[Runtime UI]
        AppProvider --> DocumentProvider --> RuntimeProvider --> Runtime
        Runtime --> Engine
        Runtime --> DOM
        Runtime --> UI
    end

    Format -->|Formatted Tale| DocumentProvider
    Mutation <-->|Explicit save| Runtime
```

Database access remains server-only. Route components resolve authorization and
formatted tale data before mounting a client runtime. Tale Studio changes are
local draft state until an explicit save mutation persists them.

## Tale Store Boundaries

```mermaid
flowchart TD
    App[TaleRootStore] --> Theme[Theme and hydration]
    App --> Environment[Viewport, breakpoint, reduced motion]
    TaleApp[TaleAppStore] --> Tale[Canonical formatted tale draft]
    TaleApp --> Revision[Revision, dirty state, change descriptor]
    TaleApp --> Runtime[Application and workspace]
    Reader[TaleReaderStore] --> Engine[Engine phase, revision, readiness]
    Reader --> Compiled[Compiled layout references]
    Reader --> Navigation[Current location and chosen branches]
    Reader --> Progress[Persisted reading facts]
    Reader --> Scroll[Imperative API and render window]
    Reader --> UI[Preferences, viewport size, open state]
    Reader --> Hub[Contextual reader content]
    Reader --> Debug[Reader diagnostics]
    Studio[TaleStudioStore] --> Selection[Selection and inspectors]
    Studio --> StudioGraph[Graph nodes, paths, and layout]
    Studio --> EditorLayout[Editor panes and live-preview sizing]

    TaleApp --> Synchronizer[ReaderDocumentSynchronizer]
    Synchronizer -->|invalidate derived state| Reader
    Studio -->|edit actions replace document| TaleApp

    UI --> Derived[Pure UI Selectors]
    Derived --> Visibility[Visibility and Hub Conditions]
    UI --> Layout[Derived Viewport Layout]
    Runtime --> RuntimeDerived[Lazy tale application derivations]
    RuntimeDerived --> WorkspaceFlags[Reader, Studio, editor, and preview conditions]
```

Only independently mutable facts belong in a slice. Viewport dimensions are
canonical; portrait, landscape, and desktop layout labels are derived. UI
visibility mode is canonical; progress, navigation, and tool visibility are
pure derived concepts. Filtered collections and display labels stay outside the
store.

Store access follows these rules:

- Use a narrow selector for one primitive, action, or stable reference.
- Use one flat shallow selector when a coherent consumer needs several values.
- Keep named, reused domain derivations as pure selector functions.
- Do not create hooks that only conceal a one-use property selector.
- Do not move DOM elements, refs, or frame-by-frame camera values into Zustand.

## Reader Runtime

```mermaid
flowchart TD
    TaleReader[TaleReader] --> Document[TaleAppProvider]
    Document --> Provider[TaleReaderProvider]
    Provider --> Viewport[TaleReaderViewport]
    Viewport --> Measure[Measurement Layer]
    Viewport --> Compile[Layout Compiler]
    Viewport --> ScrollEngine[Scroll Engine]
    Viewport --> Stage[ReaderStage]
    Stage --> Blocks[ReaderBlock]
    Blocks --> Nodes[NodeRenderer]
    Nodes --> Fragments[ReaderFragment]
    Viewport --> Overlay[ReaderOverlay]
    Overlay --> ProgressRuntime[Progress Runtime]
    Overlay --> NavigationRuntime[Navigation Overlay]
    Overlay --> CueRuntime[Scroll Cue Runtime]
    Overlay --> DebugRuntime[Debug Runtime]
    Overlay --> VisibilityRuntime[Visibility Control Runtime]

    ScrollEngine -->|imperative writes| Stage
    ScrollEngine -->|boundary changes only| Store[(Tale Reader Store)]
    Store --> NavigationRuntime
    Store --> ProgressRuntime
```

`ReaderOverlay` is structural composition. Feature runtime wrappers own their
visibility subscriptions and mount coherent UI groups. `ReaderProgress` remains
presentational and receives explicit display data.

The scroll engine owns per-frame work. Camera transforms, fragment animation,
visibility painting, and progress painting use refs, compiled metadata, and
direct DOM references. Zustand is updated at semantic boundaries rather than on
every animation frame.

## Tale Studio Runtime

```mermaid
flowchart TD
    TaleStudio[TaleStudio] --> AppProvider[TaleAppProvider]
    AppProvider --> ReaderProvider[TaleReaderProvider]
    ReaderProvider --> StudioProvider[TaleStudioProvider]
    StudioProvider --> Workspace[TaleStudioWorkspace]
    Workspace --> Editor[TaleEditor]
    Workspace --> Preview[TalePreview]

    Editor --> LivePreview[TaleEditorLivePreview]
    Editor --> Graph[TaleEditorBranchGraph]
    Editor --> EditorInspector[Editor Inspector]
    Preview --> PreviewViewport[Full TaleReaderViewport]
    Preview --> PreviewInspector[Preview Inspector]
    LivePreview --> TaleReaderViewport[Embedded TaleReaderViewport]
    Graph --> DnD[Sortable Block Lists]
    Graph --> Flow[React Flow and ELK Layout]

    EditorInspector --> Draft[Studio Draft Actions]
    PreviewInspector --> Draft
    Draft --> DocumentStore[(Tale App Store)]
    DnD --> DocumentStore
    Flow --> StudioStore[(Tale Studio Store)]
    DnD --> StudioStore
    DocumentStore --> Synchronizer[Document Synchronizer]
    Synchronizer --> ReaderStore[(Tale Reader Store)]
    ReaderStore --> TaleReaderViewport
    ReaderStore --> PreviewViewport
    DocumentStore -->|explicit save| Mutation[Studio Save Mutation]
```

The embedded live preview owns its DOM resize handle and local refs. Its width
and visibility are editor-layout preferences in `TaleStudioStore`. The active
`editor`, `preview`, or `reader` workspace belongs to `TaleAppStore`; Studio
switches update both browser history and runtime state so refresh and
back/forward navigation restore the workspace without discarding the mounted
draft. Graph selection uses atomic actions so branch, block, and path selections
cannot disagree. `StudioRendererProvider` injects Studio render extensions
through a context owned by `(tale-app)/_shared`, keeping shared Reader modules
independent from child route scopes. Each overlay selects its own Studio or
document dependencies directly.

## Library and Persistence

```mermaid
flowchart TD
    LibraryRoute[Library Server Route] --> Access[Library Access Conditions]
    Access --> Lists[List Queries]
    Access --> Detail[Tale Detail Query]
    Access --> Counts[Grouped Count Queries]
    Lists --> Schema[(Current Schema)]
    Detail --> Schema
    Counts --> Schema
    Detail --> LibraryUI[Prop-driven Library UI]
    Lists --> LibraryUI

    StudioSave[Tale Studio Save] --> Validation[Zod Validation]
    Validation --> StudioMutation[Tale Studio Mutation]
    StudioMutation --> Schema
    ReaderProgress[Settled Reader Progress] --> ProgressMutation[Progress Mutation]
    ProgressMutation --> Schema
```

Library data uses current schema concepts directly: branches, blocks,
fragments, paths, parts, entries, and pages. It does not fabricate legacy
sections. Library cards, lists, and detail panels are server-fed presentation
components and intentionally remain prop-driven.

## Shared Services

The important shared service boundaries are:

- `formatTale`: converts relational query results into the client tale model.
- reader compiler and geometry services: derive anchors, segments, indexes, and
  camera positions from formatted data and measured block sizes.
- scroll engine services: input normalization, navigation motion, visibility,
  animation evaluation, and persistence scheduling.
- library queries: authorization-aware lists, counts, and detail projections.
- Tale Studio mutations: validate and persist explicit Studio drafts.
- reader progress mutations: persist debounced reader progress independently
  from per-frame rendering.

## Ownership Rules

- Route parameters, server-loaded records, refs, and render-instance DOM
  configuration remain owned by routes or components.
- Generic UI primitives and library presentation components remain prop-driven.
- Runtime-only Reader and Studio components may select their own store
  dependencies.
- Structural composition components do not route all child state through props.
- Shared selectors represent named domain concepts, not aliases for raw fields.
- Client state never substitutes for server authorization or schema validation.
