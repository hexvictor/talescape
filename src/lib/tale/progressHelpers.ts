// lib/tale/progressHelpers.ts
import type { StoreApi } from "zustand";
import type { TaleReaderState } from "../stores/TaleReaderStore";

export const debounceProgressUpdate = (
  store: StoreApi<TaleReaderState>,
  blockId: number,
  updateFn: (blockId: number) => void
) => {
  const {
    progressDebounceTimer,
    lastQueuedBlockId,
    setProgressDebounceTimer,
    setLastQueuedBlockId,
  } = store.getState();

  if (progressDebounceTimer) {
    setLastQueuedBlockId(blockId);
    return;
  }

  updateFn(blockId);

  const timer = setTimeout(() => {
    const { lastQueuedBlockId } = store.getState();

    if (lastQueuedBlockId != null && lastQueuedBlockId !== blockId) {
      updateFn(lastQueuedBlockId);
    }

    store.setState({
      progressDebounceTimer: null,
      lastQueuedBlockId: null,
    });
  }, 2000);

  setProgressDebounceTimer(timer);
};
