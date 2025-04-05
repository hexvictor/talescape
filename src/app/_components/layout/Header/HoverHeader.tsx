"use client";

import { useRef, useState, type MouseEvent, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useClickOutside } from "~/hooks/useClickOutside";
import HeaderShell from "./HeaderShell";

export default function HoverHeader() {
	const [isHovered, setIsHovered] = useState(false);
	const [isLocked, setIsLocked] = useState(false);

	const onToggleLocked = () => {
		setIsLocked((prev) => !prev);
	};

	const headerRef = useRef<HTMLDivElement>(null);

	useClickOutside(headerRef, () => {
		setIsLocked(false);
		setIsHovered(false);
	});

	const stopPropagationProps = {
		onClick: (e: MouseEvent<HTMLDivElement>) => e.stopPropagation(),
		onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => e.stopPropagation(),
	};

	return (
		<div className="mb-14">
			<div
				ref={headerRef}
				onMouseEnter={() => !isLocked && setIsHovered(true)}
				onMouseLeave={() => !isLocked && setIsHovered(false)}
				className="fixed top-0 left-0 z-1000 h-14 w-full"
			>
				<AnimatePresence>
					{isHovered && (
						<motion.div
							initial={{ y: -80, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							exit={{ y: -80, opacity: 0 }}
							transition={{ duration: 0.3 }}
							className="bg-white shadow-md"
						>
							<HeaderShell
								onClick={onToggleLocked} // this works now!
								leftProps={stopPropagationProps}
								rightProps={stopPropagationProps}
								className={isLocked ? "bg-red-500" : ""}
							>
								{/* Optional client-only content */}
							</HeaderShell>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
}
