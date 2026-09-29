"use client";

import { useTaleRootStoreShallow } from "~/app/_shared/contexts/TaleRootStoreContext";
import { Button, type ButtonProps } from "~/components/ui/button";
import { MoonIcon, SunIcon } from "~/components/ui/icons";

/**
 * Toggles the application-wide light and dark color theme.
 *
 * @returns An icon button reflecting the active theme.
 *
 * @example
 * <ThemeToggle />
 */
function ThemeToggle({
	variant = "lift",
}: {
	variant?: ButtonProps["variant"];
}): React.JSX.Element {
	const { isDarkTheme, toggleTheme } = useTaleRootStoreShallow((state) => ({
		isDarkTheme: state.derived.isDarkTheme,
		toggleTheme: state.theme.toggleTheme,
	}));

	const ThemeIcon = isDarkTheme ? MoonIcon : SunIcon;

	return (
		<Button
			type="button"
			variant={variant}
			size="icon"
			aria-label={
				isDarkTheme ? "Switch to light theme" : "Switch to dark theme"
			}
			title={isDarkTheme ? "Switch to light theme" : "Switch to dark theme"}
			onPointerDown={(event) => event.stopPropagation()}
			onClick={(event) => {
				event.stopPropagation();
				toggleTheme();
			}}
		>
			<ThemeIcon className="size-4" />
		</Button>
	);
}

export default ThemeToggle;
