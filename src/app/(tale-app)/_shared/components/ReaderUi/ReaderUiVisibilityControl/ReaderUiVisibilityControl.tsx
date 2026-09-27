"use client";

import { Bug, Eye, EyeOff, Gauge, Navigation } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import cn from "~/lib/utils/cn";
import type { ReaderUiVisibilityMode } from "../../../../(reader)/_shared/stores/slices/uiSlice";
import { useTaleReaderStoreShallow } from "../../../contexts/TaleReaderStoreContext";

const VISIBILITY_OPTIONS: Array<{
	icon: typeof Eye;
	label: string;
	mode: ReaderUiVisibilityMode;
}> = [
	{ icon: Eye, label: "Everything", mode: "all" },
	{ icon: Navigation, label: "Navigation", mode: "navigation" },
	{ icon: Gauge, label: "Progress only", mode: "minimal" },
	{ icon: EyeOff, label: "Hide all", mode: "hidden" },
];

/**
 * Renders the reader overlay visibility button and its preset menu.
 *
 * @param props - Current visibility mode and mode change callback.
 * @returns The reader UI visibility control.
 *
 * @example
 * <ReaderUiVisibilityControl />
 */
export function ReaderUiVisibilityControl(): React.JSX.Element {
	const { layout, mode, reduceInactiveUiOpacity, setMode, toggle } =
		useTaleReaderStoreShallow((state) => ({
			layout: state.derived.viewportLayout,
			mode: state.ui.visibilityMode,
			reduceInactiveUiOpacity: state.ui.reduceInactiveUiOpacity,
			setMode: state.ui.setVisibilityMode,
			toggle: state.ui.toggleReaderUi,
		}));
	const [open, setOpen] = useState(false);
	const rootRef = useRef<HTMLDivElement | null>(null);
	const mobile = layout !== "desktop";
	const CurrentIcon =
		VISIBILITY_OPTIONS.find((option) => option.mode === mode)?.icon ?? Bug;

	useEffect(() => {
		if (!open || !mobile) return;
		const closeOnOutsidePointer = (event: PointerEvent): void => {
			const target = event.target;
			if (
				target instanceof Node &&
				rootRef.current &&
				!rootRef.current.contains(target)
			) {
				setOpen(false);
			}
		};
		document.addEventListener("pointerdown", closeOnOutsidePointer);
		return () => {
			document.removeEventListener("pointerdown", closeOnOutsidePointer);
		};
	}, [mobile, open]);

	return (
		<div
			ref={rootRef}
			data-reader-ui="true"
			data-reader-component="ReaderUiVisibilityControl"
			data-reader-role="visibility-control"
			className="pointer-events-auto absolute bottom-1 left-2"
			onMouseEnter={() => {
				if (!mobile) setOpen(true);
			}}
			onMouseLeave={() => {
				if (!mobile) setOpen(false);
			}}
		>
			{open ? (
				<div className="absolute bottom-full left-0 pb-2">
					<div
						data-reader-component="ReaderUiVisibilityControl"
						data-reader-role="visibility-options"
						className="flex w-40 flex-col gap-1 border border-foreground/30 bg-background/92 p-1.5 shadow-[4px_4px_0_rgb(var(--foreground-rgb))] backdrop-blur-md"
					>
						{VISIBILITY_OPTIONS.map((option) => {
							const Icon = option.icon;
							return (
								<Button
									key={option.mode}
									data-reader-component="ReaderUiVisibilityControl"
									data-reader-role="visibility-option"
									type="button"
									className={cn(
										"h-9 w-full justify-start border-0 px-2 text-left text-xs normal-case",
										option.mode === mode
											? "bg-foreground/14 text-foreground"
											: "text-foreground/58 hover:bg-foreground/8 hover:text-foreground",
									)}
									motion="flat"
									variant="ghost"
									onPress={() => {
										setMode(option.mode);
										if (mobile) setOpen(false);
									}}
								>
									<Icon size={14} />
									{option.label}
								</Button>
							);
						})}
					</div>
				</div>
			) : null}
			<Button
				aria-label="Change reader UI visibility"
				aria-expanded={open}
				className={cn(
					"h-10 w-10 border-foreground/30 bg-background/88 p-0 text-foreground shadow-[3px_3px_0_rgb(var(--foreground-rgb))] backdrop-blur-md transition-opacity duration-200",
					open || !reduceInactiveUiOpacity
						? "opacity-100"
						: mode === "hidden"
							? "opacity-15 hover:opacity-100"
							: "opacity-25 hover:opacity-100",
				)}
				motion="flat"
				size="icon"
				variant="outline"
				onPress={() => {
					if (mobile) {
						setOpen((current) => !current);
						return;
					}
					toggle();
				}}
			>
				<CurrentIcon size={17} />
			</Button>
		</div>
	);
}
