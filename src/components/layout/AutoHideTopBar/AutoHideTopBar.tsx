"use client";

import { AnimatePresence, motion } from "motion/react";
import {
	type CSSProperties,
	type MouseEvent,
	type PropsWithChildren,
	useEffect,
	useState,
} from "react";

const INTERACTIVE_SELECTOR =
	"a, button, input, select, textarea, [role='button'], [role='menuitem']";

type AutoHideTopBarProps = PropsWithChildren<{
	contentClassName?: string;
	overlaySelector?: string;
	pinOnBackgroundClick?: boolean;
	forceVisible?: boolean;
	revealZoneHeight?: CSSProperties["height"];
	wrapperClassName?: string;
}>;

export default function AutoHideTopBar({
	children,
	contentClassName = "shadow-md",
	overlaySelector,
	pinOnBackgroundClick = false,
	forceVisible = false,
	revealZoneHeight = "0.5rem",
	wrapperClassName = "fixed top-0 left-0 z-1000 w-full",
}: AutoHideTopBarProps): React.JSX.Element {
	const [hovered, setHovered] = useState(false);
	const [overlayActive, setOverlayActive] = useState(false);
	const [pinned, setPinned] = useState(false);

	const visible = forceVisible || hovered || overlayActive || pinned;

	useEffect(() => {
		if (!overlaySelector) return;

		const updateOverlayActivity = (event: Event): void => {
			const target = event.target;

			setOverlayActive(
				target instanceof Element && target.closest(overlaySelector) !== null,
			);
		};

		document.addEventListener("pointerover", updateOverlayActivity);
		document.addEventListener("focusin", updateOverlayActivity);

		return () => {
			document.removeEventListener("pointerover", updateOverlayActivity);
			document.removeEventListener("focusin", updateOverlayActivity);
		};
	}, [overlaySelector]);

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
				aria-hidden="true"
				className="fixed top-0 left-0 z-999 w-full"
				style={{ height: revealZoneHeight }}
				onMouseEnter={() => setHovered(true)}
			/>
			<div
				className={`pointer-events-none ${wrapperClassName}`}
				onMouseEnter={() => setHovered(true)}
				onMouseLeave={() => setHovered(false)}
			>
				<AnimatePresence>
					{visible ? (
						<motion.div
							className={`pointer-events-auto ${contentClassName}`}
							initial={{ opacity: 0, y: "-100%" }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: "-100%" }}
							transition={{ duration: 0.24 }}
							onClick={handleContentClick}
						>
							{children}
						</motion.div>
					) : null}
				</AnimatePresence>
			</div>
		</>
	);
}
