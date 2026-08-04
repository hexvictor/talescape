# Application Architecture

This document describes the current Talescape application boundaries and the
state ownership rules used when extending them.

## Application Domains

```mermaid
flowchart TD
    Browser[Browser] --> Root[Root App Layout]
    Root --> Main[Main Route Group]
    Root --> TaleApp[Tale App Route Group]
    Root --> APIs[HTTP and tRPC APIs]

    Main --> Landing[Landing]
    Main --> Auth[Authentication]
    Main --> Codex[Codex]
    Main --> Library[Community Library]

    Library --> Browse[Browse and Search]
    Library --> Detail[Book, Author, Tale Detail]
    Library --> Manage[Create and Edit Metadata]

    TaleApp --> ReaderRoutes[Tale Reader Routes]
    TaleApp --> EditorRoutes[Tale Editor Routes]
    ReaderRoutes --> ReaderRuntime[Reader Runtime]
    EditorRoutes --> EditorRuntime[Editor Runtime]
    ReaderRuntime --> SharedRuntime[Shared Tale Runtime]
    EditorRuntime --> SharedRuntime

    APIs --> TRPC[tRPC Routers]
    APIs --> Uploads[UploadThing]
    APIs --> Webhooks[Clerk Webhooks]
    TRPC --> DataLayer[Queries and Mutations]
    DataLayer --> Drizzle[Drizzle Schema and Relations]
    Drizzle --> Database[(PostgreSQL)]
```

The `(main)` route group owns conventional site pages. The `(tale-app)` route
group owns the full-screen tale experience and its auto-hiding header. Reader
and editor routes are separate applications that reuse the same formatted tale,
rendering, compilation, and viewport infrastructure.

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
        AppProvider[AppStoreProvider]
        DocumentProvider[TaleAppStoreProvider]
        RuntimeProvider[TaleReaderStoreProvider]
        Runtime[Reader or Editor Runtime]
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
formatted tale data before mounting a client runtime. Editor changes are local
draft state until an explicit save mutation persists them.

## Tale Store Boundaries

```mermaid
flowchart TD
    App[AppStore] --> Theme[Theme and hydration]
    App --> Environment[Viewport, breakpoint, reduced motion]
    TaleApp[TaleAppStore] --> Tale[Canonical formatted tale draft]
    TaleApp --> Revision[Revision, dirty state, change descriptor]
    TaleApp --> Runtime[Application, activity, preview open]
    Reader[TaleReaderStore] --> Engine[Engine phase, revision, readiness]
    Reader --> Compiled[Compiled layout references]
    Reader --> Navigation[Current location and chosen branches]
    Reader --> Progress[Persisted reading facts]
    Reader --> Scroll[Imperative API and render window]
    Reader --> UI[Preferences, viewport size, open state]
    Reader --> Hub[Contextual reader content]
    Reader --> Debug[Reader diagnostics]
    Editor[TaleEditorStore] --> Selection[Editor selection and inspectors]
    Editor --> EditorGraph[Graph nodes, paths, and layout]
    Editor --> EditorWorkspace[Panes and preview sizing]

    TaleApp --> Synchronizer[ReaderDocumentSynchronizer]
    Synchronizer -->|invalidate derived state| Reader
    Editor -->|edit actions replace document| TaleApp

	UI --> Derived[Pure UI Selectors]
    Derived --> Visibility[Visibility and Hub Conditions]
    UI --> Layout[Derived Viewport Layout]
    Runtime --> RuntimeDerived[Lazy tale application derivations]
    RuntimeDerived --> Previewing[Preview and full-reader conditions]
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
    TaleReader[TaleReader] --> Document[TaleAppStoreProvider]
    Document --> Provider[TaleReaderStoreProvider]
    Provider --> Viewport[ReaderViewport]
    Viewport --> Controller[useReaderViewportController]
    Controller --> Measure[Measurement Layer]
    Controller --> Compile[Layout Compiler]
    Controller --> ScrollEngine[Scroll Engine]
    Viewport --> Stage[ReaderStage]
    Stage --> Blocks[ReaderBlock]
    Blocks --> Nodes[NodeRenderer]
    Nodes --> Fragments[ReaderFragment]
    Viewport --> Overlay[ReaderOverlayUi]
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

## Editor Runtime

```mermaid
flowchart TD
    TaleEditor[TaleEditor] --> DocumentProvider[TaleAppStoreProvider]
    DocumentProvider --> EditorProvider[TaleEditorStoreProvider]
    EditorProvider --> ReaderProvider[TaleReaderStoreProvider]
    ReaderProvider --> Extensions[Editor renderer extensions]
    Extensions --> Workspace[TaleEditorWorkspace]
    Workspace --> Preview[TaleEditorPreview]
    Workspace --> Graph[TaleBranchGraph]
    Workspace --> Inspector[Selected Element Inspector]

    Preview --> PreviewViewport[Preview ReaderViewport]
    Preview --> Resize[Owned Resize Interaction]
    Graph --> DnD[Sortable Block Lists]
    Graph --> Flow[React Flow and ELK Layout]
    Inspector --> Draft[Editor Draft Actions]

    Draft --> DocumentStore[(Tale App Store)]
    DnD --> DocumentStore
    Flow --> EditorStore[(Editor Workspace Store)]
    DnD --> EditorStore
    DocumentStore --> Synchronizer[Document Synchronizer]
    Synchronizer --> ReaderStore[(Tale Reader Store)]
    ReaderStore --> PreviewViewport
    DocumentStore -->|explicit save| Mutation[Save Mutation]
```

The preview owns its DOM resize handle and local refs. Preview width remains an
editor pane-layout preferences; preview visibility and reading/editing activity
belong to the shared tale application store. Graph selection is changed by
atomic editor actions so branch, block, and path selections cannot disagree.
Editor renderer extensions contain component implementations rather than editor
state; each overlay selects its own editor or document dependencies directly.

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

    EditorSave[Editor Save] --> Validation[Zod Validation]
    Validation --> EditorMutation[Tale Editor Mutation]
    EditorMutation --> Schema
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
- tale editor mutations: validate and persist explicit editor drafts.
- reader progress mutations: persist debounced reader progress independently
  from per-frame rendering.

## Ownership Rules

- Route parameters, server-loaded records, refs, and render-instance DOM
  configuration remain owned by routes or components.
- Generic UI primitives and library presentation components remain prop-driven.
- Runtime-only reader/editor components may select their own store dependencies.
- Structural composition components do not route all child state through props.
- Shared selectors represent named domain concepts, not aliases for raw fields.
- Client state never substitutes for server authorization or schema validation.
