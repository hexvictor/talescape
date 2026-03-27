"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { api } from "~/trpc/react";
import { useReaderStore } from "../contexts/ReaderStoreContext";

export function usePersistReaderProgress() {
  const { isSignedIn } = useAuth();

  const progress = useReaderStore((s) => s.progress);
  const setProgressSaving = useReaderStore((s) => s.setProgressSaving);

  const { mutateAsync } = api.taleReader.progress.update.useMutation();

  const lastSavedUpdatedAtRef = useRef<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!progress?.updatedAt) return;

    const updatedAtKey =
      progress.updatedAt instanceof Date
        ? progress.updatedAt.toISOString()
        : new Date(progress.updatedAt).toISOString();

    if (updatedAtKey === lastSavedUpdatedAtRef.current) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      setProgressSaving(true);

      try {
        if (!isSignedIn) {
          const key = `tale_progress_${progress.taleId}`;
          localStorage.setItem(key, JSON.stringify(progress));
        } else {
          await mutateAsync(progress);
        }

        lastSavedUpdatedAtRef.current = updatedAtKey;
      } catch {
      } finally {
        setProgressSaving(false);
      }
    }, 400);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;
    };
  }, [progress, isSignedIn, mutateAsync, setProgressSaving]);
}