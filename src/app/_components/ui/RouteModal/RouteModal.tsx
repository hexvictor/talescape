"use client";
import Link from "next/link";
import { IconX } from "../Icons";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";

export default function RouteModal({
	children,
}: { children: React.ReactNode }) {
	const router = useRouter();

	const handleClose = () => {
		router.back();
	};
	return createPortal(
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
			<div
				onClick={handleClose}
				onKeyDown={handleClose}
				className="absolute inset-0"
				aria-label="Close"
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
					onKeyDown={handleClose}
				>
					<IconX />
				</button>
				{children}
			</div>
		</div>,
		document.body,
	);
}
