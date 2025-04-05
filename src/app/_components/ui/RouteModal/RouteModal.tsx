"use client";
import Link from "next/link";
import { IconX } from "~/utils/icons";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type RouteModalProps = {
	children: React.ReactNode;
	minimal?: boolean;
};

export default function RouteModal({ children, minimal }: RouteModalProps) {
	const router = useRouter();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const handleClose = () => {
		router.back();
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Escape") router.back();
	};

	if (!mounted) return null; // evita tentar usar `document` no SSR

	if (minimal) {
		return createPortal(
			<div
				className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
				aria-modal="true"
			>
				<div
					onClick={handleClose}
					onKeyDown={handleKeyDown}
					tabIndex={-1}
					className="absolute inset-0"
					aria-label="Close modal"
				/>
				<div className="relative z-10">
					<button
						className=" absolute top-3 right-3 z-11 cursor-pointer text-white transition-transform duration-200 hover:scale-110"
						aria-label="Close modal"
						type="button"
						onClick={handleClose}
						onKeyDown={handleKeyDown}
					>
						<IconX />
					</button>
					{children}
				</div>
			</div>,
			document.body,
		);
	}

	return createPortal(
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
			aria-modal="true"
		>
			<div
				onClick={handleClose}
				onKeyDown={handleKeyDown}
				tabIndex={-1}
				className="absolute inset-0"
				aria-label="Close modal"
			/>
			<div
				className="relative z-10 w-full max-w-lg rounded-lg bg-white p-6 shadow-lg"
				onClick={(e) => e.stopPropagation()}
				onKeyDown={(e) => e.stopPropagation()}
			>
				<button
					className="absolute top-2 right-2 text-gray-500 hover:text-black"
					aria-label="Close modal"
					type="button"
					onClick={handleClose}
					onKeyDown={handleKeyDown}
				>
					<IconX />
				</button>
				{children}
			</div>
		</div>,
		document.body,
	);
}
