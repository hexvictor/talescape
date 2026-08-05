"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "motion/react";
import {
	type CSSProperties,
	type MouseEvent,
	type PropsWithChildren,
	type ReactNode,
	useCallback,
	useEffect,
	useState,
} from "react";

const INTERACTIVE_SELECTOR =
	"a, button, input, select, textarea, [role='button'], [role='menuitem']";

const CLERK_MENU_SELECTOR =
	".cl-userButtonPopoverCard, .cl-userButtonPopoverMain, [data-clerk-portal]";

type AutoHideTopBarProps = PropsWithChildren<{
	clerkMenu?: boolean;
	collapsedContent?: ReactNode;
	collapsedContentClassName?: string;
	contentClassName?: string;
	forceVisible?: boolean;
	onEnterCallback?: () => void;
	onLeaveCallback?: () => void;
	overlaySelector?: string;
	pinOnBackgroundClick?: boolean;
	revealZoneHeight?: CSSProperties["height"];
	revealZoneClassName?: string;
	wrapperClassName?: string;
}>;

/**

* Renders a top bar that reveals on hover and can swap to collapsed content
* after the main header exits.
*
* @param props - Auto-hiding top bar props.
* @param props.children - Expanded header content.
* @param props.collapsedContent - Content shown while the expanded header is hidden.
* @param props.revealZoneClassName - Optional classes applied to the hover reveal zone.
* @returns Animated top bar composition.
*
* @example
* <AutoHideTopBar collapsedContent={<CompactHeader />}>
* <Header />
* </AutoHideTopBar>

*/
export default function AutoHideTopBar({
	children,
	clerkMenu = false,
	collapsedContent,
	collapsedContentClassName,
	contentClassName = "shadow-md",
	forceVisible = false,
	onEnterCallback,
	onLeaveCallback,
	overlaySelector,
	pinOnBackgroundClick = false,
	revealZoneClassName = "",
	revealZoneHeight = "0.5rem",
	wrapperClassName = "fixed top-0 left-0 z-1000 w-full",
}: AutoHideTopBarProps): React.JSX.Element {
	const [hovered, setHovered] = useState(false);
	const [overlayActive, setOverlayActive] = useState(false);
	const [pinned, setPinned] = useState(false);

	const isVisible = forceVisible || hovered || overlayActive || pinned;

	const closeFloatingMenus = useCallback((): void => {
		if (!clerkMenu) return;

		document.dispatchEvent(
			new KeyboardEvent("keydown", {
				bubbles: true,
				cancelable: true,
				key: "Escape",
			}),
		);
	}, [clerkMenu]);

	const onMouseEnter = (): void => {
		if (!forceVisible) {
			onEnterCallback?.();
		}

		setHovered(true);
	};

	const onMouseLeave = (): void => {
		if (!forceVisible && !overlayActive && !pinned) {
			closeFloatingMenus();
			onLeaveCallback?.();
		}

		setHovered(false);
	};

	useEffect(() => {
		const selectors = [
			clerkMenu ? CLERK_MENU_SELECTOR : null,
			overlaySelector ?? null,
		].filter((selector): selector is string => Boolean(selector));

		if (selectors.length === 0) return;

		const updateOverlayActivity = (event: Event): void => {
			const target = event.target;

			const nextOverlayActive =
				target instanceof Element &&
				selectors.some((selector) => target.closest(selector) !== null);

			setOverlayActive(nextOverlayActive);
		};

		document.addEventListener("pointerover", updateOverlayActivity);
		document.addEventListener("focusin", updateOverlayActivity);

		return () => {
			document.removeEventListener("pointerover", updateOverlayActivity);
			document.removeEventListener("focusin", updateOverlayActivity);
		};
	}, [clerkMenu, overlaySelector]);

	const handleContentClick = (event: MouseEvent<HTMLDivElement>): void => {
		if (!pinOnBackgroundClick) return;

		const target = event.target;

		if (target instanceof Element && target.closest(INTERACTIVE_SELECTOR)) {
			return;
		}

		setPinned((current) => !current);
	};

	return (
		<>
			<div
				data-reader-component="AutoHideTopBar"
				data-reader-role="auto-hide-header"
				data-reader-pinned={pinned ? "true" : "false"}
				className={`pointer-events-none ${wrapperClassName}`}
				onMouseLeave={onMouseLeave}
			>
				<AnimatePresence mode="wait">
					{isVisible ? (
						<motion.div
							data-reader-component="AutoHideTopBar"
							data-reader-role="expanded-header"
							data-reader-pinned={pinned ? "true" : "false"}
							key="expanded-content"
							className={clsx(
								"pointer-events-auto transition-[box-shadow] duration-150",
								contentClassName,
								pinned && "ring-2 ring-primary/70 ring-inset",
							)}
							initial={{ opacity: 0, y: "-100%" }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: "-100%" }}
							transition={{ duration: 0.14 }}
							onClick={handleContentClick}
							onMouseEnter={onMouseEnter}
						>
							{children}
						</motion.div>
					) : collapsedContent ? (
						<motion.div
							data-reader-component="AutoHideTopBar"
							data-reader-role="collapsed-header"
							key="collapsed-content"
							className={`pointer-events-auto ${collapsedContentClassName ?? ""}`}
							initial={{ y: "-100%" }}
							animate={{ y: 0 }}
							exit={{ y: "-100%" }}
							transition={{ duration: 0.14 }}
						>
							{collapsedContent}
						</motion.div>
					) : null}
				</AnimatePresence>
			</div>
			<div
				aria-hidden="true"
				data-reader-component="AutoHideTopBar"
				data-reader-role="header-reveal-zone"
				className={`fixed top-0 left-0 z-[1001] w-full ${revealZoneClassName}`}
				style={{ height: revealZoneHeight }}
				onMouseEnter={onMouseEnter}
			/>
		</>
	);
}
