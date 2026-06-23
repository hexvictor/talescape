"use client";

import { Button } from "~/components/ui/button";
import { useAppStoreShallow } from "~/contexts/AppStoreContext";
import { MoonIcon, SunIcon } from "~/lib/utils/icons";

/**
 * Toggles the application-wide light and dark color theme.
 *
 * @returns An icon button reflecting the active theme.
 *
 * @example
 * <ThemeToggle />
 */
function ThemeToggle(): React.JSX.Element {
	const { isDarkTheme, toggleTheme } = useAppStoreShallow((state) => ({
		isDarkTheme: state.derived.isDarkTheme,
		toggleTheme: state.theme.toggleTheme,
	}));

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
