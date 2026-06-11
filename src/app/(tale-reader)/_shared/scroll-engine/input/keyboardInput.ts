import { countReaderDiagnostic } from "../../services/readerDiagnostics";
import { clamp } from "../../services/readerMath";
import { NEW_READER_INPUT_SETTINGS } from "../readerInputSettings";
import type { ScrollDirection } from "../scrollSnapModel";
import { shouldLetElementHandleInput } from "./inputTarget";
import type { ReaderKeyboardInputControllerOptions } from "./inputTypes";

/**
 * Attaches reading input plus accelerated Home and End travel.
 *
 * @param options - Shared input controller dependencies.
 * @returns Listener and timer cleanup.
 *
 * @example
 * const cleanup = attachKeyboardInput(options);
 */
export function attachKeyboardInput({
	driver,
	scheduleSnap,
	setDirection,
	scrollToTimelineEdge,
	totalScroll,
}: ReaderKeyboardInputControllerOptions): () => void {
	let heldDirection: ScrollDirection | null = null;
	let target: number | null = null;
	let multiplier = 1;
	let decayTimer: number | null = null;
	let tapDirection: ScrollDirection | null = null;
	let tapCount = 0;
	let tapLastAt = 0;
	let tapResetTimer: number | null = null;

	const animateBy = (amount: number) => {
		setDirection(amount >= 0 ? 1 : -1);
		driver.scrollTo(
			clamp(driver.getScroll() + amount, 0, totalScroll),
			"smooth",
			{ duration: NEW_READER_INPUT_SETTINGS.keyboardDuration },
		);
		scheduleSnap();
	};

	const startDecay = () => {
		window.clearTimeout(decayTimer ?? undefined);
		decayTimer = window.setTimeout(() => {
			const decay = () => {
				multiplier = Math.max(
					1,
					multiplier - NEW_READER_INPUT_SETTINGS.keyboardDecayStep,
				);
				if (multiplier > 1) {
					decayTimer = window.setTimeout(
						decay,
						NEW_READER_INPUT_SETTINGS.keyboardDecayIntervalMs,
					);
					return;
				}
				heldDirection = null;
				if (tapCount === 0) target = null;
			};
			decay();
		}, NEW_READER_INPUT_SETTINGS.keyboardDecayDelayMs);
	};

	const resetTapBurst = (resetTarget = true) => {
		window.clearTimeout(tapResetTimer ?? undefined);
		tapDirection = null;
		tapCount = 0;
		tapLastAt = 0;
		if (resetTarget) target = null;
	};

	const getTapStep = (direction: ScrollDirection, now: number) => {
		const settings = NEW_READER_INPUT_SETTINGS;
		const continuesBurst =
			tapDirection === direction &&
			now - tapLastAt <= settings.keyboardTapBurstWindowMs;
		if (!continuesBurst) {
			tapCount = 0;
			target = null;
		}
		tapDirection = direction;
		tapCount += 1;
		tapLastAt = now;
		const accelerationCount = Math.max(0, tapCount - 1);
		const baseStep =
			settings.keyboardBaseStepPx +
			accelerationCount * settings.keyboardTapAccelerationPx;
		const repeatMultiplier =
			settings.keyboardTapRepeatMultiplier ** Math.max(0, tapCount - 2);
		window.clearTimeout(tapResetTimer ?? undefined);
		tapResetTimer = window.setTimeout(
			() => resetTapBurst(),
			settings.keyboardTapBurstWindowMs,
		);
		return Math.min(settings.keyboardTapMaxStepPx, baseStep * repeatMultiplier);
	};

	const onKeyDown = (event: KeyboardEvent) => {
		if (shouldLetElementHandleInput(event.target)) return;
		if (event.metaKey || event.ctrlKey || event.altKey) return;

		const pageStep = Math.max(
			120,
			window.innerHeight * NEW_READER_INPUT_SETTINGS.pageStepRatio,
		);
		const direction =
			event.key === "ArrowDown" || event.key === "ArrowRight"
				? 1
				: event.key === "ArrowUp" || event.key === "ArrowLeft"
					? -1
					: null;

		if (event.key === "Home" || event.key === "End") {
			event.preventDefault();
			scrollToTimelineEdge(event.key === "Home" ? "start" : "end");
			return;
		}
		if (
			event.key === "PageDown" ||
			event.key === "PageUp" ||
			event.key === " "
		) {
			event.preventDefault();
			animateBy((event.key === "PageUp" || event.shiftKey ? -1 : 1) * pageStep);
			return;
		}
		if (direction === null) return;

		countReaderDiagnostic("keyboard navigation input", { key: event.key });
		event.preventDefault();
		if (heldDirection !== direction) {
			heldDirection = direction;
			multiplier = 1;
			target = null;
			resetTapBurst(false);
		}
		const step = event.repeat
			? getHeldStep()
			: getTapStep(direction, performance.now());
		setDirection(direction);
		const from = target ?? driver.getScroll();
		target = clamp(from + direction * step, 0, totalScroll);
		driver.scrollTo(target, "smooth", {
			duration: NEW_READER_INPUT_SETTINGS.keyboardDuration,
		});
		scheduleSnap(
			event.repeat
				? NEW_READER_INPUT_SETTINGS.snapDelayMs
				: NEW_READER_INPUT_SETTINGS.keyboardTapBurstWindowMs,
		);
	};

	const getHeldStep = () => {
		resetTapBurst(false);
		multiplier = Math.min(
			NEW_READER_INPUT_SETTINGS.keyboardMaxMultiplier,
			multiplier + NEW_READER_INPUT_SETTINGS.keyboardHoldBoost,
		);
		startDecay();
		return NEW_READER_INPUT_SETTINGS.keyboardBaseStepPx * multiplier;
	};

	window.addEventListener("keydown", onKeyDown);
	return () => {
		window.removeEventListener("keydown", onKeyDown);
		window.clearTimeout(decayTimer ?? undefined);
		window.clearTimeout(tapResetTimer ?? undefined);
	};
}
