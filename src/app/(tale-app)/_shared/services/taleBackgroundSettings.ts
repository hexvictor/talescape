import type { TaleBackgroundConfig } from "../types";

export const DEFAULT_TALE_BACKGROUND_CONFIG: TaleBackgroundConfig = {
	dark: { color: "#070a0c", imageUrl: null },
	light: { color: "#fff8e8", imageUrl: null },
};

/** Normalizes theme-aware tale canvas settings from persisted and imported data. */
export function normalizeTaleBackgroundConfig(
	value: unknown,
): TaleBackgroundConfig {
	const config = isRecord(value) ? value : {};
	return {
		dark: normalizeTheme(config.dark, DEFAULT_TALE_BACKGROUND_CONFIG.dark),
		light: normalizeTheme(config.light, DEFAULT_TALE_BACKGROUND_CONFIG.light),
	};
}

function normalizeTheme(
	value: unknown,
	fallback: TaleBackgroundConfig["light"],
): TaleBackgroundConfig["light"] {
	const theme = isRecord(value) ? value : {};
	return {
		color:
			typeof theme.color === "string" && theme.color.trim()
				? theme.color
				: fallback.color,
		imageUrl:
			typeof theme.imageUrl === "string" && theme.imageUrl.trim()
				? theme.imageUrl.trim()
				: null,
	};
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}
