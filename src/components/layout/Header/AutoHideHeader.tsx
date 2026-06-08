"use client";

import { AnimatePresence, motion } from "motion/react";
import { type MouseEvent, useEffect, useState } from "react";
import Header from "./Header";

const INTERACTIVE_HEADER_SELECTOR =
	"a, button, input, select, textarea, [role='button'], [role='menuitem']";
const CLERK_OVERLAY_SELECTOR =
	".cl-userButtonPopoverCard, .cl-userButtonPopoverMain, [data-clerk-portal]";

/**
 * Renders the site header when the pointer reaches the top edge and keeps it
 * available while a header-owned menu is active.
 *
 * @returns The animated auto-hiding site header.
 *
 * @example
 * <AutoHideHeader />
 */
export default function AutoHideHeader(): React.JSX.Element {
	const [isHovered, setIsHovered] = useState(false);
	const [isMenuActive, setIsMenuActive] = useState(false);
	const [isPinned, setIsPinned] = useState(false);
	const isVisible = isHovered || isMenuActive || isPinned;

	useEffect(() => {
		/**
		 * Tracks pointer and focus movement into Clerk's portalled profile menu.
		 *
		 * @param event - The pointer or focus event dispatched by the document.
		 * @returns Nothing.
		 */
		const updateMenuActivity = (event: Event): void => {
			const target = event.target;
			setIsMenuActive(
				target instanceof Element &&
					target.closest(CLERK_OVERLAY_SELECTOR) !== null,
			);
		};

		document.addEventListener("pointerover", updateMenuActivity);
		document.addEventListener("focusin", updateMenuActivity);
		return () => {
			document.removeEventListener("pointerover", updateMenuActivity);
			document.removeEventListener("focusin", updateMenuActivity);
		};
	}, []);

	/**
	 * Pins or unpins the header when its unused surface is clicked.
	 *
	 * @param event - The header click event.
	 * @returns Nothing.
	 */
	const handleHeaderClick = (event: MouseEvent<HTMLElement>): void => {
		const target = event.target;
		if (
			target instanceof Element &&
			target.closest(INTERACTIVE_HEADER_SELECTOR)
		) {
			return;
		}
		setIsPinned((current) => !current);
	};

	return (
		<>
			<div
				aria-hidden="true"
				className="fixed top-0 left-0 z-999 h-2 w-full"
				onMouseEnter={() => setIsHovered(true)}
			/>
			<div
				className="pointer-events-none fixed top-0 left-0 z-1000 w-full"
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
			>
				<AnimatePresence>
					{isVisible ? (
						<motion.div
							className="pointer-events-auto bg-white shadow-md"
							initial={{ y: -80, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							exit={{ y: -80, opacity: 0 }}
							transition={{ duration: 0.24 }}
						>
							<Header onClick={handleHeaderClick} />
						</motion.div>
					) : null}
				</AnimatePresence>
			</div>
		</>
	);
}
