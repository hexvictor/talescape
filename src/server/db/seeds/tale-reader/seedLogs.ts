/**
 * Logs the start of one tale-reader seed step.
 *
 * @param label - Human-readable seed step label.
 * @returns Nothing.
 *
 * @example
 * logSeedStart("Pages", tale);
 */
export function logSeedStart(label: string): void {
	console.log(`Seeding ${label}`);
}

/**
 * Logs the completion of one tale-reader seed step.
 *
 * @param label - Human-readable seed step label.
 * @returns Nothing.
 *
 * @example
 * logSeedComplete("Pages", tale);
 */
export function logSeedComplete(label: string): void {
	console.log(`✅ ${label} seeded!`);
}
