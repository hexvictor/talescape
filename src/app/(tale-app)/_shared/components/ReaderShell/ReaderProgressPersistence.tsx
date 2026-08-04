import { usePersistReaderProgress } from "../../hooks/usePersistReaderProgress";

/**
 * Persists reader progress from inside the active tale reader provider.
 *
 * @returns Null because this component owns only persistence effects.
 *
 * @example
 * <ReaderProgressPersistence />
 */
export function ReaderProgressPersistence(): null {
	usePersistReaderProgress();
	return null;
}
