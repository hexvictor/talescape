"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { IconX } from "../Icons";

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (!mounted || !isOpen) return;

		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [onClose, mounted, isOpen]);

	if (!mounted || !isOpen) return null;

	return createPortal(
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
			<div className="absolute inset-0" onClick={onClose} onKeyDown={onClose} />
			<div
				className="relative z-10 w-full max-w-lg rounded-lg bg-white p-6 shadow-lg"
				onClick={(e) => e.stopPropagation()}
				onKeyDown={(e) => e.stopPropagation()}
			>
				<button
					type="button"
					onClick={onClose}
					className="absolute top-2 right-2 text-gray-500 hover:text-black"
					aria-label="Close"
				>
					<IconX />
				</button>
				{children}
			</div>
		</div>,
		document.body,
	);
}
