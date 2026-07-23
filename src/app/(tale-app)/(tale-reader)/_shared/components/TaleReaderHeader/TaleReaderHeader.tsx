"use client";

import clsx from "clsx";
import { BookOpen, Compass, Home } from "lucide-react";
import { useState } from "react";
import { useTaleReaderStoreShallow } from "~/app/(tale-app)/_shared/contexts/TaleReaderStoreContext";
import AppMenu from "~/components/layout/AppMenu/AppMenu";
import AutoHideTopBar from "~/components/layout/AutoHideTopBar/AutoHideTopBar";
import { Header } from "~/components/layout/Header";

/**
 * Renders route chrome for the public reader.
 *
 * Desktop keeps the auto-hiding site header. Mobile uses an explicit menu
 * button so the reader does not depend on hover behavior.
 *
 * @returns Responsive reader route header controls.
 *
 * @example
 * <TaleReaderHeader />
 */
export function TaleReaderHeader(): React.JSX.Element {
	const { ready, visible } = useTaleReaderStoreShallow((state) => ({
		ready: state.reader.compiled !== null,
		visible: state.ui.visibilityMode !== "hidden",
	}));
	if (!ready || !visible) return <></>;

	return (
		<>
			<AutoHideTopBar
				clerkMenu
				pinOnBackgroundClick
				revealZoneClassName="hidden md:block"
				wrapperClassName="fixed top-0 left-0 z-1000 hidden w-full md:block"
			>
				<Header />
			</AutoHideTopBar>
			<MobileReaderHeader />
		</>
	);
}

/**
 * Renders the mobile-only reader app menu.
 *
 * @returns Mobile reader header menu.
 *
 * @example
 * <MobileReaderHeader />
 */
function MobileReaderHeader(): React.JSX.Element {
	const { reduceInactiveUiOpacity } = useTaleReaderStoreShallow((state) => ({
		reduceInactiveUiOpacity: state.ui.reduceInactiveUiOpacity,
	}));
	const [menuOpen, setMenuOpen] = useState(false);

	return (
		<AppMenu
			data-reader-role="mobile-reader-header"
			className={clsx(
				"fixed top-3 left-3 z-1000 transition-opacity duration-300 md:hidden",
				menuOpen || !reduceInactiveUiOpacity
					? "opacity-100"
					: "opacity-25 hover:opacity-100",
			)}
			buttonClassName="grid h-11 w-11 place-items-center rounded-lg border border-foreground/14 bg-background/92 text-foreground shadow-2xl backdrop-blur-md"
			menuOpen={menuOpen}
			menuItems={[
				{ href: "/", icon: Home, label: "Home" },
				{ href: "/library", icon: BookOpen, label: "Library" },
				{ href: "/codex", icon: Compass, label: "Codex" },
			]}
			onMenuOpenChange={setMenuOpen}
		/>
	);
}
