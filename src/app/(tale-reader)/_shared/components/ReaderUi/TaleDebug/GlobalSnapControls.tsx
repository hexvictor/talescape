"use client";

import { Magnet, MagnetIcon } from "lucide-react";
import { useReaderStoreShallow } from "../../../contexts/ReaderStoreContext";
import { editAllBlocksSnap } from "../../../services/readerEdits";

/**
 * Applies snap enabled or disabled to every block during an edit session.
 *
 * @returns Global block snap controls.
 */
export function GlobalSnapControls(): React.JSX.Element {
	const { requestRecompile, scrollApi, setData, tale } = useReaderStoreShallow(
		(state) => ({
			requestRecompile: state.engine.requestRecompile,
			scrollApi: state.scroll.api,
			setData: state.tale.setData,
			tale: state.tale.data,
		}),
	);
	const allEnabled = tale.structure.blocks.every((block) => block.snap);
	const allDisabled = tale.structure.blocks.every((block) => !block.snap);

	const apply = (snap: boolean): void => {
		scrollApi?.capturePosition();
		setData(editAllBlocksSnap(tale, snap));
		requestRecompile("global-snap-setting");
	};

	return (
		<div
			data-reader-component="GlobalSnapControls"
			data-reader-role="snap-settings"
			className="flex items-center gap-1 border-white/10 border-b px-3 py-2"
		>
			<span className="mr-auto text-[10px] text-white/42 uppercase">
				All blocks
			</span>
			<button
				type="button"
				className="flex h-8 items-center gap-1.5 rounded border border-white/10 px-2 text-[10px] text-white/58 hover:bg-white/8 hover:text-white data-[active=true]:border-[#d9b56f]/55 data-[active=true]:text-[#d9b56f]"
				data-active={allEnabled}
				onClick={() => apply(true)}
			>
				<Magnet size={12} />
				Snap on
			</button>
			<button
				type="button"
				className="flex h-8 items-center gap-1.5 rounded border border-white/10 px-2 text-[10px] text-white/58 hover:bg-white/8 hover:text-white data-[active=true]:border-[#d9b56f]/55 data-[active=true]:text-[#d9b56f]"
				data-active={allDisabled}
				onClick={() => apply(false)}
			>
				<MagnetIcon size={12} className="opacity-45" />
				Snap off
			</button>
		</div>
	);
}
