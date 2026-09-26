# Studio draft model

## Current behavior

New entities use negative temporary IDs. Saving inserts new rows and maps their
references to database IDs inside the existing save transaction. Temporary IDs
are not a database allocation failure. Frame creation must add new entities to
the lookup map before resolving the owning scene.

The existing saveDraft mutation writes the canonical relational tale. It does
not yet provide published-versus-draft isolation.

Studio now maintains a user/tale-scoped browser recovery cache and up to 30
document snapshots, with undo, redo and discard controls. Recovery checks the
cached base against the server-loaded tale and pauses on mismatch. Storage
errors are displayed. Workspace layout and selection are cached separately.
These caches are local to the browser, are not cross-device storage, and do
not coordinate simultaneous editing in multiple tabs. Discard affects local
unsaved edits only; it does not revert a previously completed database save.

## Recommended durable model

Use an aggregate draft rather than duplicating every scene/frame/element table:

- tale_drafts: taleId, editorUserId, basePublishedRevision, revision, payload,
  createdAt, updatedAt; unique draft ownership constraint.
- tale_draft_revisions: draftId, revision, authorId, timestamp, change label,
  snapshot or forward/inverse patch, and schema version.
- studio_workspaces: userId, taleId, versioned pane/selection preferences.

Autosave only the draft. Require the expected revision on each write; reject
stale edits instead of silently overwriting them. Authorize all reads/writes
against tale permissions. Publish validates the whole entity graph and updates
the canonical relational tables atomically, returning the complete ID map.
Keep editor IDs stable across autosaves and remap selection/history references
when publishing allocates database IDs.

Discard deletes the user's draft and reloads the published revision. Reverting
a historical change creates a new revision; dependent edits require conflict
handling. Undo/redo and selective historical revert are separate operations.
Bound autosave history and retain deliberate checkpoints. A browser cache is
useful for network interruption recovery but is not authoritative server state.

Reference patterns:

- https://payloadcms.com/docs/versions/drafts
- https://payloadcms.com/docs/versions/autosave
- https://www.sanity.io/docs/content-lake/drafts
- https://www.sanity.io/docs/content-lake/transactions

## Remaining work

The aggregate draft tables, migration, revision-checked API, publish flow,
cross-device recovery and selective per-change revert are not implemented.
The inspector has Narrative tree/distribution views and compact tab styling;
the full screenshot-based redesign and complete control reorganization remain.
Instrumentation is added to touched inspector/history surfaces, with future
rules in AGENTS.md; the entire app has not yet been exhaustively instrumented.
