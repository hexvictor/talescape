"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { IconX } from "../Icons";

interface ModalProps {
	isOpen: boolean;
	handleClose: () => void;
	children: React.ReactNode;
}

export default function Modal({ isOpen, handleClose, children }: ModalProps) {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (!mounted || !isOpen) return;

		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") handleClose();
		};
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [handleClose, mounted, isOpen]);

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Escape") handleClose();
	};

	if (!mounted || !isOpen) return null;

	return createPortal(
		<dialog
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
			aria-modal="true"
		>
			<div
				className="absolute inset-0"
				onClick={handleClose}
				tabIndex={-1}
				onKeyDown={handleKeyDown}
				aria-label="Close modal"
			/>
			<div
				className="relative z-10 w-full max-w-lg rounded-lg bg-white p-6 shadow-lg"
				onClick={(e) => e.stopPropagation()}
				onKeyDown={(e) => e.stopPropagation()}
			>
				<button
					type="button"
					onClick={handleClose}
					onKeyDown={handleKeyDown}
					className="absolute top-2 right-2 text-gray-500 hover:text-black"
					aria-label="Close modal"
				>
					<IconX />
				</button>
				{children}
			</div>
		</dialog>,
		document.body,
	);
}
