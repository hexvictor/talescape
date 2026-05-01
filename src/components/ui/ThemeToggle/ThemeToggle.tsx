"use client";

import { useEffect } from "react";
import { Button } from "~/components/ui/button";
import { MoonIcon, SunIcon } from "~/lib/utils/icons";
import { useThemeStore } from "~/stores/theme-store";

function ThemeToggle() {
	const hydrate = useThemeStore((state) => state.hydrate);
	const theme = useThemeStore((state) => state.theme);
	const toggleTheme = useThemeStore((state) => state.toggleTheme);

	useEffect(() => {
		hydrate();
	}, [hydrate]);

	const isDarkTheme = theme === "dark";
	const ThemeIcon = isDarkTheme ? MoonIcon : SunIcon;

	return (
		<Button
			type="button"
			variant="ghost"
			size="icon"
			aria-label={
				isDarkTheme ? "Switch to light theme" : "Switch to dark theme"
			}
			title={isDarkTheme ? "Switch to light theme" : "Switch to dark theme"}
			onClick={toggleTheme}
			className="text-muted-foreground hover:text-foreground"
		>
			<ThemeIcon className="size-4" />
		</Button>
	);
}

export default ThemeToggle;
