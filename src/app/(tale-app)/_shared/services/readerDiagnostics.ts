const reportIntervalMs = 1000;

type Counter = {
	count: number;
	lastDetails?: unknown;
	reportAfter: number;
};

const counters = new Map<string, Counter>();
let diagnosticsEnabled: boolean | null = null;

/**
 * Returns whether detailed reader diagnostics were enabled before page load.
 *
 * Enable diagnostics with:
 * localStorage.setItem("talescape:reader-diagnostics", "true")
 *
 * @returns Whether reader diagnostic logging is enabled.
 */
export function areReaderDiagnosticsEnabled(): boolean {
	if (typeof window === "undefined") return false;
	if (diagnosticsEnabled === null) {
		diagnosticsEnabled =
			window.localStorage.getItem("talescape:reader-diagnostics") === "true";
	}
	return diagnosticsEnabled;
}

export function logReaderDiagnostic(label: string, details?: unknown) {
	if (!areReaderDiagnosticsEnabled()) return;
	console.log(`[tale-reader] ${label}`, details ?? "");
}

/**
 * Reports frequently executed calls once per second rather than logging every
 * scroll frame, which would make the diagnostic itself expensive.
 */
export function countReaderDiagnostic(label: string, details?: unknown) {
	if (!areReaderDiagnosticsEnabled()) return;
	const now = performance.now();
	const counter = counters.get(label) ?? {
		count: 0,
		reportAfter: now + reportIntervalMs,
	};
	counter.count += 1;
	counter.lastDetails = details;
	if (now >= counter.reportAfter) {
		console.log(
			`[tale-reader calls/sec] ${label}: ${counter.count}`,
			counter.lastDetails ?? "",
		);
		counter.count = 0;
		counter.reportAfter = now + reportIntervalMs;
	}
	counters.set(label, counter);
}
