"use client";

import clsx from "clsx";
import { BookMarked, ListTree } from "lucide-react";
import { useTaleReaderStoreShallow } from "../../../contexts/TaleReaderStoreContext";

/**
 * Renders mobile reader navigation launchers as one compact action group.
 *
 * @returns Mobile-only reader action buttons, or null when navigation is hidden.
 *
 * @example
 * <ReaderMobileQuickActions />
 */
export function ReaderMobileQuickActions(): React.JSX.Element | null {
	const {
		contentsOpen,
		hubOpen,
		reduceInactiveUiOpacity,
		showsNavigation,
		toggleContents,
		toggleHub,
	} = useTaleReaderStoreShallow((state) => ({
		contentsOpen: state.derived.readerContentsOpen,
		hubOpen: state.derived.isHubOpen,
		reduceInactiveUiOpacity: state.ui.reduceInactiveUiOpacity,
		showsNavigation: state.derived.showsNavigation,
		toggleContents: state.contents.toggleOpen,
		toggleHub: state.hub.toggleOpen,
	}));

	if (!showsNavigation) return null;

	const toggleContentsOnly = (): void => {
		if (hubOpen && !contentsOpen) toggleHub();
		toggleContents();
	};
	const toggleHubOnly = (): void => {
		if (contentsOpen && !hubOpen) toggleContents();
		toggleHub();
	};

	return (
		<div
			data-reader-ui="true"
			data-reader-component="ReaderMobileQuickActions"
			data-reader-role="mobile-reader-actions"
			className={clsx(
				"pointer-events-auto absolute top-3 right-3 z-60 flex rounded-lg border border-foreground/14 bg-background/92 p-1 shadow-2xl backdrop-blur-md transition-opacity duration-300 md:hidden",
				contentsOpen || hubOpen || !reduceInactiveUiOpacity
					? "opacity-100"
					: "opacity-25 hover:opacity-100",
			)}
		>
			<MobileQuickActionButton
				active={contentsOpen}
				icon={ListTree}
				label="Story navigation"
				onClick={toggleContentsOnly}
			/>
			<MobileQuickActionButton
				active={hubOpen}
				icon={BookMarked}
				label="Reader Hub"
				onClick={toggleHubOnly}
			/>
		</div>
	);
}

/**
 * Renders one mobile reader quick action button.
 *
 * @param props - Button state and behavior.
 * @param props.active - Whether the target panel is open.
 * @param props.icon - Icon shown inside the button.
 * @param props.label - Accessible button label.
 * @param props.onClick - Opens or closes the target panel.
 * @returns Mobile reader action button.
 *
 * @example
 * <MobileQuickActionButton active icon={ListTree} label="Contents" onClick={toggle} />
 */
function MobileQuickActionButton({
	active,
	icon: Icon,
	label,
	onClick,
}: {
	active: boolean;
	icon: typeof ListTree;
	label: string;
	onClick: () => void;
}): React.JSX.Element {
	return (
		<button
			type="button"
			aria-label={label}
			aria-pressed={active}
			className={clsx(
				"grid h-10 w-10 place-items-center rounded-md transition",
				active
					? "bg-primary/18 text-primary"
					: "text-foreground/68 hover:bg-foreground/8 hover:text-foreground",
			)}
			onClick={onClick}
		>
			<Icon size={17} />
		</button>
	);
}
