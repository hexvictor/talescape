"use client";

import clsx from "clsx";
import { Eye, EyeIcon, EyeOff, EyeOffIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "~/components/ui/tooltip";
import { useReaderStore } from "~/features/tale-reader/contexts/ReaderStoreContext";

export default function ReaderUiToggle() {
	const uiVisible = useReaderStore((s) => s.uiVisible);
	const toggleUI = useReaderStore((s) => s.toggleUI);

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					variant={uiVisible ? "outline" : "ghost"}
					size="icon"
					className={clsx(
						"pointer-events-auto absolute bottom-6 left-6 z-50 cursor-pointer rounded-full shadow-lg hover:scale-105",
					)}
					onClick={() => {
						toggleUI();
					}}
					aria-label={uiVisible ? "Hide interface" : "Show interface"}
				>
					{uiVisible ? (
						<EyeOff className="h-5 w-5" />
					) : (
						<Eye className="h-5 w-5" />
					)}
				</Button>
			</TooltipTrigger>
			<TooltipContent side="top">
				{uiVisible ? "Hide interface" : "Show interface"}
			</TooltipContent>
		</Tooltip>
	);
}
