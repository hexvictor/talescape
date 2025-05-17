// Header.tsx
import { Logo } from "~/components/ui/Logo";
import { Divider } from "~/components/ui/Divider";
import { MainNav } from "../MainNav";
import { ThemeToggle } from "~/components/ui/ThemeToggle";
import type { HTMLAttributes, ReactNode } from "react";
import { AuthButtonSwitcher } from "../../ui/AuthButtonSwitcher";

type HeaderProps = HTMLAttributes<HTMLElement> & {
	leftProps?: HTMLAttributes<HTMLDivElement>;
	rightProps?: HTMLAttributes<HTMLDivElement>;
	children?: ReactNode;
};

export default function Header({
	leftProps,
	rightProps,
	children,
	className = "",
	...mainProps // ✅ this will carry onClick, onKeyDown, etc.
}: HeaderProps) {
	return (
		<nav
			className={`flex min-h-16 w-full items-center justify-between bg-black px-6 py-2 text-white ${className}`}
			{...mainProps} // ✅ onClick, onKeyDown, etc. now apply to <nav>
		>
			<div
				className="flex items-center gap-4 font-medium text-lg"
				{...leftProps}
			>
				<Logo />
				<Divider />
				<MainNav />
			</div>

			<div className="flex items-center gap-4" {...rightProps}>
				<ThemeToggle />
				<AuthButtonSwitcher />
			</div>

			{children}
		</nav>
	);
}
