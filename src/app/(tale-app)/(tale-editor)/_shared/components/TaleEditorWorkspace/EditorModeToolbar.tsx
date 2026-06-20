"use client";

import { BookOpen, Save } from "lucide-react";
import type { EditorSurface } from "../../store/editorStoreTypes";

/**
 * Renders the editor mode switcher and save action.
 *
 * @param props - Toolbar properties.
 * @param props.onChange - Receives the next editor surface.
 * @param props.onSave - Saves the current editor draft.
 * @param props.saving - Whether the save mutation is active.
 * @param props.status - Current save status label.
 * @param props.surface - Active editor surface.
 * @returns Editor mode toolbar.
 *
 * @example
 * <EditorModeToolbar surface="edit" onChange={setSurface} onSave={save} />
 */
export function EditorModeToolbar({
	onChange,
	onSave,
	saving = false,
	status = "Unsaved",
	surface,
}: {
	onChange: (surface: EditorSurface) => void;
	onSave: () => void;
	saving?: boolean;
	status?: string;
	surface: EditorSurface;
}): React.JSX.Element {
	return (
		<header
			data-reader-component="EditorModeToolbar"
			data-reader-role="editor-toolbar"
			className="relative z-60 flex h-14 items-center justify-between border-white/10 border-b bg-black px-4"
		>
			<div className="flex items-center gap-2">
				<button
					type="button"
					className={modeButtonClassName(surface === "reading")}
					onClick={() => onChange("reading")}
				>
					<BookOpen size={15} />
					Reading mode
				</button>
				<button
					type="button"
					className={modeButtonClassName(surface === "edit")}
					onClick={() => onChange("edit")}
				>
					Edit mode
				</button>
			</div>
			<div className="flex items-center gap-3">
				<span className="text-white/42 text-xs">{status}</span>
				<button
					type="button"
					disabled={saving}
					className="flex h-9 items-center gap-2 rounded border border-[#d9b56f]/45 bg-[#d9b56f]/14 px-3 font-semibold text-[#f4d99b] text-xs disabled:opacity-45"
					onClick={onSave}
				>
					<Save size={14} />
					Save
				</button>
			</div>
		</header>
	);
}

/**
 * Resolves the visual state for one editor mode button.
 *
 * @param active - Whether the mode is active.
 * @returns Button class name.
 *
 * @example
 * const className = modeButtonClassName(true);
 */
function modeButtonClassName(active: boolean): string {
	return `flex h-9 items-center gap-2 rounded px-3 text-xs transition ${
		active
			? "bg-white text-black"
			: "border border-white/10 text-white/60 hover:bg-white/8 hover:text-white"
	}`;
}
