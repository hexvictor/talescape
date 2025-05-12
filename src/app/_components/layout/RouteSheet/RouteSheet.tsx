"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sheet, type SheetProps } from "~/components/ui/Sheet";

type RouteSheetProps = SheetProps & {
	side?: "top" | "bottom" | "left" | "right";
	children: React.ReactNode;
	onClose?: () => void;
	animationDurationMs?: number;
};

export function RouteSheet({
	children,
	onClose,
	animationDurationMs = 300,
	...sheetProps
}: RouteSheetProps) {
	const router = useRouter();
	const [open, setOpen] = useState(true);

	const handleClose = () => {
		setOpen(false);
		onClose?.();
		setTimeout(() => {
			router.back();
		}, animationDurationMs);
	};

	return (
		<Sheet
			open={open}
			onOpenChange={(open) => !open && handleClose()}
			{...sheetProps}
		>
			{children}
		</Sheet>
	);
}
