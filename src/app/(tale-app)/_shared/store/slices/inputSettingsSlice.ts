import type { StateCreator } from "zustand/vanilla";
import {
	DEFAULT_READER_INPUT_SETTINGS,
	type ReaderInputSettings,
} from "../../scroll-engine/readerInputSettings";
import type { TaleReaderState } from "../createTaleReaderStore";

export type ReaderInputSettingsKey = keyof ReaderInputSettings;

export type InputSettingsSlice = {
	inputSettings: {
		reset: () => void;
		setValue: <Key extends ReaderInputSettingsKey>(
			key: Key,
			value: ReaderInputSettings[Key],
		) => void;
		values: ReaderInputSettings;
	};
};

/**
 * Creates editable reader input tuning values.
 *
 * @param set - Zustand state setter.
 * @returns Reader input settings state and update actions.
 *
 * @example
 * const slice = createInputSettingsSlice(set, get, api);
 */
export const createInputSettingsSlice: StateCreator<
	TaleReaderState,
	[],
	[],
	InputSettingsSlice
> = (set) => ({
	inputSettings: {
		reset: () =>
			set((state) => ({
				inputSettings: {
					...state.inputSettings,
					values: { ...DEFAULT_READER_INPUT_SETTINGS },
				},
			})),
		setValue: (key, value) =>
			set((state) => ({
				inputSettings: {
					...state.inputSettings,
					values: { ...state.inputSettings.values, [key]: value },
				},
			})),
		values: { ...DEFAULT_READER_INPUT_SETTINGS },
	},
});
