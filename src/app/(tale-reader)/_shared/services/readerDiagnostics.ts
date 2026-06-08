const diagnosticsEnabled = false;
const reportIntervalMs = 1000;

type Counter = {
	count: number;
	lastDetails?: unknown;
	reportAfter: number;
};

const counters = new Map<string, Counter>();

export function logReaderDiagnostic(label: string, details?: unknown) {
	if (!diagnosticsEnabled) return;
	console.log(`[tale-reader] ${label}`, details ?? "");
}

/**
 * Reports frequently executed calls once per second rather than logging every
 * scroll frame, which would make the diagnostic itself expensive.
 */
export function countReaderDiagnostic(label: string, details?: unknown) {
	if (!diagnosticsEnabled) return;
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
