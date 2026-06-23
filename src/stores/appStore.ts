import { devtools } from "zustand/middleware";
import { type StoreApi, createStore } from "zustand/vanilla";

export type AppTheme = "dark" | "light";
export type AppBreakpoint = "desktop" | "mobile" | "tablet";

export type AppState = {
	environment: {
		breakpoint: AppBreakpoint;
		height: number;
		reducedMotion: boolean;
		setViewport: (height: number, width: number) => void;
		width: number;
	};
	theme: {
		hasHydrated: boolean;
		hydrate: () => void;
		setTheme: (theme: AppTheme) => void;
		toggleTheme: () => void;
		value: AppTheme;
	};
};

export type AppDerivedState = {
	readonly isDarkTheme: boolean;
	readonly isDesktop: boolean;
	readonly isMobile: boolean;
};

const themeStorageKey = "talescape-theme";

/**
 * Creates the application-wide client state store.
 *
 * @returns Global theme and browser-environment state.
 *
 * @example
 * const store = createAppStore();
 */
export function createAppStore(): StoreApi<AppState> {
	return createStore<AppState>()(
		devtools(
			(set, get) => ({
				environment: {
					breakpoint: "desktop",
					height: 0,
					reducedMotion: false,
					setViewport: (height, width) =>
						set((state) => {
							const breakpoint = getBreakpoint(width);
							const reducedMotion = window.matchMedia(
								"(prefers-reduced-motion: reduce)",
							).matches;
							if (
								state.environment.breakpoint === breakpoint &&
								state.environment.height === height &&
								state.environment.reducedMotion === reducedMotion &&
								state.environment.width === width
							) {
								return state;
							}
							return {
								environment: {
									...state.environment,
									breakpoint,
									height,
									reducedMotion,
									width,
								},
							};
						}),
					width: 0,
				},
				theme: {
					hasHydrated: false,
					hydrate: () => {
						const value = getPreferredTheme();
						applyTheme(value);
						set((state) => ({
							theme: { ...state.theme, hasHydrated: true, value },
						}));
					},
					setTheme: (value) => {
						applyTheme(value);
						set((state) => ({ theme: { ...state.theme, value } }));
					},
					toggleTheme: () => {
						get().theme.setTheme(
							get().theme.value === "dark" ? "light" : "dark",
						);
					},
					value: "light",
				},
			}),
			{ name: "AppStore" },
		),
	);
}

/**
 * Creates lazy application-level derived values for one state snapshot.
 *
 * @param state - Current application state.
 * @returns Read-only derived application values.
 *
 * @example
 * const derived = createAppDerivedState(store.getState());
 */
export function createAppDerivedState(state: AppState): AppDerivedState {
	return {
		get isDarkTheme() {
			return state.theme.value === "dark";
		},
		get isDesktop() {
			return state.environment.breakpoint === "desktop";
		},
		get isMobile() {
			return state.environment.breakpoint === "mobile";
		},
	};
}

/** Reads the persisted browser theme preference. */
function getPreferredTheme(): AppTheme {
	if (typeof window === "undefined") return "light";
	const storedTheme = window.localStorage.getItem(themeStorageKey);
	return storedTheme === "dark" || storedTheme === "light"
		? storedTheme
		: "light";
}

/** Applies and persists the active browser theme. */
function applyTheme(theme: AppTheme): void {
	if (typeof document === "undefined") return;
	document.documentElement.classList.toggle("dark", theme === "dark");
	window.localStorage.setItem(themeStorageKey, theme);
}

/** Resolves the application breakpoint for a viewport width. */
function getBreakpoint(width: number): AppBreakpoint {
	if (width < 768) return "mobile";
	if (width < 1024) return "tablet";
	return "desktop";
}
