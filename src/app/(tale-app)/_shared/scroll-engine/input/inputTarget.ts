/**
 * Determines whether an interactive element should own an input event.
 *
 * @param target - Native event target.
 * @returns True when the reader must not intercept the event.
 *
 * @example
 * if (shouldLetElementHandleInput(event.target)) return;
 */
export function shouldLetElementHandleInput(
	target: EventTarget | null,
): boolean {
	if (!(target instanceof Element)) return false;
	if (target.closest("[data-reader-ui='true']")) return true;
	return Boolean(
		target.closest("input, textarea, select, button, [contenteditable='true']"),
	);
}
