"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sheet, type SheetProps } from "~/components/ui/sheet";

type ModalRouteSheetProps = SheetProps & {
	side?: "top" | "bottom" | "left" | "right";
	children: React.ReactNode;
	onClose?: () => void;
	animationDurationMs?: number;
};

export default function ModalRouteSheet({
	children,
	onClose,
	animationDurationMs = 300,
	...sheetProps
}: ModalRouteSheetProps) {
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
