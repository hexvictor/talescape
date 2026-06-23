"use client";

import { Magnet, MagnetIcon } from "lucide-react";
import { useTaleAppStoreShallow } from "../../../contexts/TaleAppStoreContext";
import { useTaleReaderStoreShallow } from "../../../contexts/TaleReaderStoreContext";
import { updateAllBlockSnapSettings } from "../../../services/updateAllBlockSnapSettings";

/**
 * Applies snap enabled or disabled to every block during an edit session.
 *
 * @returns Global block snap controls.
 */
export function GlobalSnapControls(): React.JSX.Element {
	const scrollApi = useTaleReaderStoreShallow((state) => state.scroll.api);
	const { setTale, tale } = useTaleAppStoreShallow((state) => ({
		setTale: state.document.setTale,
		tale: state.document.tale,
	}));
	const allEnabled = tale.structure.blocks.every((block) => block.snap);
	const allDisabled = tale.structure.blocks.every((block) => !block.snap);

	const apply = (snap: boolean): void => {
		scrollApi?.capturePosition();
		setTale(updateAllBlockSnapSettings(tale, snap), {
			reason: "global-snap-setting",
		});
	};

	return (
		<div
			data-reader-component="GlobalSnapControls"
			data-reader-role="snap-settings"
			className="flex items-center gap-1 border-foreground/10 border-b px-3 py-2"
		>
			<span className="mr-auto text-[10px] text-foreground/42 uppercase">
				All blocks
			</span>
			<button
				type="button"
				className="flex h-8 items-center gap-1.5 rounded border border-foreground/10 px-2 text-[10px] text-foreground/58 hover:bg-foreground/8 hover:text-foreground data-[active=true]:border-primary/55 data-[active=true]:text-primary"
				data-active={allEnabled}
				onClick={() => apply(true)}
			>
				<Magnet size={12} />
				Snap on
			</button>
			<button
				type="button"
				className="flex h-8 items-center gap-1.5 rounded border border-foreground/10 px-2 text-[10px] text-foreground/58 hover:bg-foreground/8 hover:text-foreground data-[active=true]:border-primary/55 data-[active=true]:text-primary"
				data-active={allDisabled}
				onClick={() => apply(false)}
			>
				<MagnetIcon size={12} className="opacity-45" />
				Snap off
			</button>
		</div>
	);
}
