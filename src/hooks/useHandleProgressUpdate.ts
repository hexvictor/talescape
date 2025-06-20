import { useAuth } from "@clerk/nextjs";
import { api } from "~/trpc/react";
import {
  useReaderStore,
  useReaderStoreInstance,
} from "~/features/talereader/contexts/ReaderStoreContext";
import { useCallback } from "react";
import { debounceProgressUpdate } from "~/lib/tale/progressHelpers";

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
      debounceProgressUpdate(store, blockId, async (blockIdToSend) => {
        const updated = generateProgressUpdate(blockIdToSend);
        if (!updated) return;

        setProgressSaving(true);
        try {
          if (!isSignedIn) {
            const key = `tale_progress_${updated.taleId}`;
            localStorage.setItem(key, JSON.stringify(updated));
          } else {
            await mutateAsync(updated);
          }

          setProgress(updated);
          setProgressSavedAt(new Date());
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
