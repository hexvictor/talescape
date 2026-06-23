import clsx from "clsx";
import { BookOpen, Pencil } from "lucide-react";
import { useTaleAppStoreShallow } from "~/app/(tale-app)/_shared/contexts/TaleAppStoreContext";

const EDITOR_ACTIVITIES = [
	{
		icon: BookOpen,
		label: "Reading mode",
		value: "reading",
	},
	{
		icon: Pencil,
		label: "Edit mode",
		value: "editing",
	},
] as const;

/**
 * Switches the editor between its reading and editing activities.
 *
 * @returns Controls bound to the shared tale application activity.
 *
 * @example
 * <EditorActivitySwitcher />
 */
export function EditorActivitySwitcher(): React.JSX.Element {
	const { activity, setActivity } = useTaleAppStoreShallow((state) => ({
		activity: state.runtime.activity,
		setActivity: state.runtime.setActivity,
	}));

	return (
		<div
			data-reader-component="EditorActivitySwitcher"
			data-reader-role="editor-activity-switcher"
			className="flex items-center gap-2"
		>
			{EDITOR_ACTIVITIES.map((option) => {
				const Icon = option.icon;
				const active = activity === option.value;

				return (
					<button
						key={option.value}
						type="button"
						className={clsx(
							"flex h-9 items-center gap-2 rounded px-3 text-xs transition",
							active
								? "bg-foreground text-background"
								: "border border-foreground/10 text-foreground/60 hover:bg-foreground/8 hover:text-foreground",
						)}
						onClick={() => setActivity(option.value)}
					>
						<Icon size={15} />
						{option.label}
					</button>
				);
			})}
		</div>
	);
}
