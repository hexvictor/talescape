type SettledProgressPosition = {
	blockId: string;
	innerProgress: number;
};

/**
 * Creates a single rescheduling timer that persists only after scrolling has
 * remained idle for the configured delay.
 *
 * @param save - Callback that persists the latest settled position.
 * @param delayMs - Required idle time before persistence.
 * @returns Position scheduler and cleanup function.
 *
 * @example
 * const saver = createSettledProgressSaver(savePosition, 280);
 * saver.schedule(blockId, innerProgress);
 */
export function createSettledProgressSaver(
	save: (position: SettledProgressPosition) => void,
	delayMs: number,
): {
	cancel: () => void;
	schedule: (blockId: string, innerProgress: number) => void;
} {
	let latest: SettledProgressPosition | null = null;
	let lastUpdateAt = 0;
	let timer: number | null = null;

	const flushWhenSettled = (): void => {
		const remaining = delayMs - (performance.now() - lastUpdateAt);
		if (remaining > 0) {
			timer = window.setTimeout(flushWhenSettled, remaining);
			return;
		}
		timer = null;
		if (latest) save(latest);
	};

	return {
		cancel: () => {
			window.clearTimeout(timer ?? undefined);
			timer = null;
		},
		schedule: (blockId, innerProgress) => {
			latest = { blockId, innerProgress };
			lastUpdateAt = performance.now();
			if (timer === null) {
				timer = window.setTimeout(flushWhenSettled, delayMs);
			}
		},
	};
}
