"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useRef } from "react";
import { api } from "~/trpc/react";
import { useReaderStore } from "../contexts/ReaderStoreContext";

export function usePersistReaderProgress() {
	const { isSignedIn } = useAuth();

	const progress = useReaderStore((s) => s.progress);
	const progressTrackingPaused = useReaderStore(
		(s) => s.progressTrackingPaused,
	);
	const setProgressSaving = useReaderStore((s) => s.setProgressSaving);

	const { mutateAsync } = api.taleReader.progress.update.useMutation();

	const lastSavedUpdatedAtRef = useRef<string | null>(null);
	const timerRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		if (!progress?.updatedAt) return;

		if (progressTrackingPaused) {
			console.log("[PersistReaderProgress] skipped because tracking is paused");
			return;
		}

		const updatedAtKey =
			progress.updatedAt instanceof Date
				? progress.updatedAt.toISOString()
				: new Date(progress.updatedAt).toISOString();

		if (updatedAtKey === lastSavedUpdatedAtRef.current) return;

		if (timerRef.current) clearTimeout(timerRef.current);

		timerRef.current = setTimeout(async () => {
			setProgressSaving(true);

			try {
				console.log("[PersistReaderProgress] saving", {
					blockId: progress.lastBlockId,
					taleId: progress.taleId,
					isSignedIn,
				});

				if (!isSignedIn) {
					const key = `tale_progress_${progress.taleId}`;
					localStorage.setItem(key, JSON.stringify(progress));
				} else {
					await mutateAsync(progress);
				}

				lastSavedUpdatedAtRef.current = updatedAtKey;
			} catch (error) {
				console.log("[PersistReaderProgress] save failed", error);
			} finally {
				setProgressSaving(false);
			}
		}, 400);

		return () => {
			if (timerRef.current) clearTimeout(timerRef.current);
			timerRef.current = null;
		};
	}, [
		progress,
		progressTrackingPaused,
		isSignedIn,
		mutateAsync,
		setProgressSaving,
	]);
}
