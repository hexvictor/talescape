"use client";
import type React from "react";
import { useState } from "react";
import { IconMoon, IconSun } from "../Icons";
import type { IconType } from "react-icons";

function ThemeToggle() {
	const [theme, setTheme] = useState<"dark" | "light">("dark");

	const isDarkTheme = theme === "dark";

	const onToggleTheme = () => {
		setTheme((prev) => (prev === "dark" ? "light" : "dark"));
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") onToggleTheme();
	};

	const ThemeIcon = (props: { className: string }) => {
		if (isDarkTheme) return <IconMoon {...props} />;
		return <IconSun {...props} />;
	};
	return (
		<button type="button" onClick={onToggleTheme} onKeyDown={handleKeyDown}>
			<ThemeIcon className="h6 w-6 cursor-pointer text-white transition-transform duration-200 hover:scale-110" />
		</button>
	);
}

export default ThemeToggle;
