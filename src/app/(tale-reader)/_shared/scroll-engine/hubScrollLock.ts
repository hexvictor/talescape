"use client";

import type { InputBindingsApi } from "./inputBindings";
import type { ScrollDriverApi } from "./scrollDriver";

type Args = {
	driver: ScrollDriverApi;
	getInputBindings: () => InputBindingsApi | null;
	isLayoutRebuildRunning: () => boolean;
};

export type ReaderHubScrollLockApi = {
	applyHubOpenState: (open: boolean) => void;
	cleanup: () => void;
};

/**
 * Creates the scroll lock used while the reader hub is open.
 *
 * @param driver - Scroll driver that pauses ScrollSmoother movement.
 * @param getInputBindings - Returns the current wheel, touch, and keyboard
 * bindings so hub state can temporarily disable reader navigation.
 * @param isLayoutRebuildRunning - Reports whether layout rebuilds are already
 * controlling input state, preventing hub close from re-enabling input too soon.
 */
export function createReaderHubScrollLock({
	driver,
	getInputBindings,
	isLayoutRebuildRunning,
}: Args): ReaderHubScrollLockApi {
	const resetOverflow = () => {
		document.documentElement.style.overflow = "";
		document.body.style.overflow = "";
	};

	const applyHubOpenState = (open: boolean) => {
		driver.setPaused(open);

		if (open) {
			document.documentElement.style.overflow = "hidden";
			document.body.style.overflow = "hidden";
			getInputBindings()?.disable();
			return;
		}

		resetOverflow();

		if (!isLayoutRebuildRunning()) {
			getInputBindings()?.enable();
		}
	};

	const cleanup = () => {
		resetOverflow();
	};

	return {
		applyHubOpenState,
		cleanup,
	};
}
