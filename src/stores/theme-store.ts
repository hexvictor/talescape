"use client";

import { create } from "zustand";

export type Theme = "dark" | "light";

const STORAGE_KEY = "talescape-theme";

function getPreferredTheme(): Theme {
	if (typeof window === "undefined") return "light";

	const storedTheme = window.localStorage.getItem(STORAGE_KEY);
	if (storedTheme === "dark" || storedTheme === "light") return storedTheme;

	return "light";
}

function applyTheme(theme: Theme) {
	if (typeof document === "undefined") return;

	document.documentElement.classList.toggle("dark", theme === "dark");
	window.localStorage.setItem(STORAGE_KEY, theme);
}

type ThemeStore = {
	hasHydrated: boolean;
	theme: Theme;
	hydrate: () => void;
	setTheme: (theme: Theme) => void;
	toggleTheme: () => void;
};

export const useThemeStore = create<ThemeStore>((set, get) => ({
	hasHydrated: false,
	theme: "light",
	hydrate: () => {
		const theme = getPreferredTheme();
		applyTheme(theme);
		set({ hasHydrated: true, theme });
	},
	setTheme: (theme) => {
		applyTheme(theme);
		set({ theme });
	},
	toggleTheme: () => {
		const nextTheme = get().theme === "dark" ? "light" : "dark";
		get().setTheme(nextTheme);
	},
}));
