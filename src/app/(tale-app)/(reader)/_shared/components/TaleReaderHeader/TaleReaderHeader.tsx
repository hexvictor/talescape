"use client";

import { BookOpen, Compass, Home } from "lucide-react";
import { useState } from "react";
import { useTaleReaderStoreShallow } from "~/app/(tale-app)/_shared/contexts/TaleReaderStoreContext";
import AppMenu from "~/app/_shared/components/layout/AppMenu/AppMenu";
import AutoHideTopBar from "~/app/_shared/components/layout/AutoHideTopBar/AutoHideTopBar";
import { Header } from "~/app/_shared/components/layout/Header";
import cn from "~/lib/utils/cn";

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
			className={cn(
				"fixed top-3 left-3 z-1000 transition-opacity duration-300 md:hidden",
				menuOpen || !reduceInactiveUiOpacity
					? "opacity-100"
					: "opacity-25 hover:opacity-100",
			)}
			buttonClassName="border-2 border-white bg-[var(--comic-ink)] text-white shadow-[3px_3px_0_var(--comic-teal)]"
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
