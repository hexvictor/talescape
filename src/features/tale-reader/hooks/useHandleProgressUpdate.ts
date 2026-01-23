import { useAuth } from "@clerk/nextjs";
import { api } from "~/trpc/react";
import { useCallback } from "react";
import { debounceProgressUpdate } from "~/features/tale-reader/services/progressHelpers";
import {
  useReaderStore,
  useReaderStoreInstance,
} from "../contexts/ReaderStoreContext";

export function useHandleProgressUpdate() {
  const { isSignedIn } = useAuth();

  const setProgress = useReaderStore((s) => s.setProgress);
  const setProgressSaving = useReaderStore((s) => s.setProgressSaving);
  const setProgressSavedAt = useReaderStore((s) => s.setProgressSavedAt);
  const generateProgressUpdate = useReaderStore(
    (s) => s.generateProgressUpdate
  );

  const store = useReaderStoreInstance();
  const { mutateAsync } = api.taleReader.progress.update.useMutation();

  const handleProgressUpdate = useCallback(
    (blockId: number) => {
      const updated = generateProgressUpdate(blockId);
      if (!updated) return;

      // Immediately reflect on UI
      setProgress(updated);
      setProgressSavedAt(new Date());
      setProgressSaving(true);

      // Debounced save (to localStorage or API)
      debounceProgressUpdate(store, blockId, async (blockIdToSend) => {
        const queuedUpdate = generateProgressUpdate(blockIdToSend);
        if (!queuedUpdate) return;

        try {
          if (!isSignedIn) {
            const key = `tale_progress_${queuedUpdate.taleId}`;
            localStorage.setItem(key, JSON.stringify(queuedUpdate));
          } else {
            await mutateAsync(queuedUpdate);
          }
        } catch (err) {
          console.error("Error saving progress", err);
        } finally {
          setProgressSaving(false);
        }
      });
    },
    [
      store,
      isSignedIn,
      generateProgressUpdate,
      mutateAsync,
      setProgress,
      setProgressSaving,
      setProgressSavedAt,
    ]
  );

  return handleProgressUpdate;
}
