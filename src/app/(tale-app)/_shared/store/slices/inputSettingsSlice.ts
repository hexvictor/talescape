import type { StateCreator } from "zustand/vanilla";
import {
	DEFAULT_READER_INPUT_SETTINGS,
	type ReaderInputSettings,
} from "../../scroll-engine/readerInputSettings";
import type { TaleBlockSnapMode } from "../../types";
import type { TaleReaderState } from "../createTaleReaderStore";

export type ReaderInputSettingsKey = keyof ReaderInputSettings;
export type ReaderSnapModeOverride = TaleBlockSnapMode | "default";

export type InputSettingsSlice = {
	inputSettings: {
		reset: () => void;
		setSnapModeOverride: (mode: ReaderSnapModeOverride) => void;
		setValue: <Key extends ReaderInputSettingsKey>(
			key: Key,
			value: ReaderInputSettings[Key],
		) => void;
		snapModeOverride: ReaderSnapModeOverride;
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
		setSnapModeOverride: (mode) =>
			set((state) => ({
				engine: {
					...state.engine,
					revision: state.engine.revision + 1,
				},
				inputSettings: {
					...state.inputSettings,
					snapModeOverride: mode,
				},
			})),
		setValue: (key, value) =>
			set((state) => ({
				inputSettings: {
					...state.inputSettings,
					values: { ...state.inputSettings.values, [key]: value },
				},
			})),
		snapModeOverride: "default",
		values: { ...DEFAULT_READER_INPUT_SETTINGS },
	},
});
