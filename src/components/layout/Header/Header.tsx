import type { HTMLAttributes, ReactNode } from "react";
import Logo from "~/components/ui/Logo";
import ThemeToggle from "~/components/ui/ThemeToggle";
import Separator from "~/components/ui/separator";
import { AuthStatus } from "~/features/auth/components";
import cn from "~/lib/utils/cn";
import MainNav from "../MainNav";

type HeaderProps = HTMLAttributes<HTMLElement> & {
	leftProps?: HTMLAttributes<HTMLDivElement>;
	rightProps?: HTMLAttributes<HTMLDivElement>;
	children?: ReactNode;
};

/**
 * Renders the shared site navigation header.
 *
 * @param props - Header attributes and optional left, right, and child content.
 * @returns The site header navigation.
 *
 * @example
 * <Header />
 */
export default function Header({
	leftProps,
	rightProps,
	children,
	className = "",
	...mainProps
}: HeaderProps): React.JSX.Element {
	return (
		<nav
			className={cn(
				"sticky top-0 z-40 w-full border-border/70 border-b bg-background/90 text-foreground shadow-xs backdrop-blur-md supports-[backdrop-filter]:bg-background/80",
				className,
			)}
			{...mainProps}
		>
			<div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-3 px-3 py-2 sm:px-5">
				<div
					className="flex min-w-0 items-center gap-4 font-medium text-lg"
					{...leftProps}
				>
					<Logo />
					<Separator className="hidden h-8 sm:block" />
					<div className="hidden sm:block">
						<MainNav />
					</div>
				</div>

				<div className="flex shrink-0 items-center gap-1.5" {...rightProps}>
					<ThemeToggle />
					<AuthStatus />
				</div>

				{children}
			</div>
		</nav>
	);
}
