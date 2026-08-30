import { usePersistReaderProgress } from "../../hooks/usePersistReaderProgress";

/**
 * Persists reader progress from inside the active tale reader provider.
 *
 * @returns Null because this component owns only persistence effects.
 *
 * @example
 * <TaleReaderProgressPersistence />
 */
export function TaleReaderProgressPersistence(): null {
	usePersistReaderProgress();
	return null;
}
