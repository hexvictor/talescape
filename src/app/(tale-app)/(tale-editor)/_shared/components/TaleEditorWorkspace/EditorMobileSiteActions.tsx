"use client";

import Link from "next/link";
import Logo from "~/components/ui/Logo";
import ThemeToggle from "~/components/ui/ThemeToggle";
import { AuthStatus } from "~/features/auth/components";

/**
 * Renders compact site-level actions for mobile editor menus.
 *
 * @returns Theme, account, and primary navigation controls.
 *
 * @example
 * <EditorMobileSiteActions />
 */
export function EditorMobileSiteActions(): React.JSX.Element {
	return (
		<div
			data-reader-component="EditorModeToolbar"
			data-reader-role="mobile-site-actions"
			className="grid gap-3"
		>
			<div className="flex items-center gap-3">
				<Logo />
				<div className="min-w-0">
					<p className="font-semibold text-sm">Talescape</p>
					<div className="mt-1 flex gap-3 text-foreground/58 text-xs">
						<Link href="/library" className="hover:text-foreground">
							Library
						</Link>
						<Link href="/codex" className="hover:text-foreground">
							Codex
						</Link>
					</div>
				</div>
			</div>
			<div className="flex items-center justify-between gap-3">
				<ThemeToggle />
				<AuthStatus />
			</div>
		</div>
	);
}
