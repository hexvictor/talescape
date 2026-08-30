import { Eye, Pencil } from "lucide-react";
import { useTaleAppStoreShallow } from "~/app/(tale-app)/_shared/contexts/TaleAppStoreContext";
import cn from "~/lib/utils/cn";

const STUDIO_WORKSPACES = [
	{
		icon: Pencil,
		label: "Edit mode",
		value: "editor",
	},
	{
		icon: Eye,
		label: "Preview mode",
		value: "preview",
	},
] as const;

/**
 * Switches Tale Studio between URL-backed editor and preview workspaces.
 *
 * Native history keeps the mounted draft intact while making refresh and
 * browser navigation restore the selected workspace.
 *
 * @returns Controls bound to the shared tale application workspace.
 *
 * @example
 * <TaleStudioWorkspaceSwitcher />
 */
export function TaleStudioWorkspaceSwitcher(): React.JSX.Element {
	const { setWorkspace, taleId, workspace } = useTaleAppStoreShallow(
		(state) => ({
			setWorkspace: state.runtime.setWorkspace,
			taleId: state.document.tale.id,
			workspace: state.runtime.workspace,
		}),
	);

	return (
		<div
			data-reader-component="TaleStudioWorkspaceSwitcher"
			data-reader-role="studio-workspace-switcher"
			className="flex items-center gap-2"
		>
			{STUDIO_WORKSPACES.map((option) => {
				const Icon = option.icon;
				const active = workspace === option.value;
				const href =
					option.value === "preview"
						? `/studio/${taleId}/preview`
						: `/studio/${taleId}`;

				return (
					<button
						data-reader-component="TaleStudioWorkspaceSwitcher"
						data-reader-role={`${option.value}-mode-control`}
						key={option.value}
						type="button"
						aria-label={option.label}
						title={option.label}
						className={cn(
							"flex h-11 items-center gap-2 border-2 border-foreground px-3 font-black text-xs uppercase shadow-[3px_3px_0_rgb(var(--foreground-rgb))] transition-[transform,box-shadow,background-color]",
							active
								? "bg-accent text-accent-foreground"
								: "bg-card text-foreground hover:translate-x-0.5 hover:translate-y-0.5 hover:bg-secondary hover:shadow-[1px_1px_0_rgb(var(--foreground-rgb))]",
						)}
						onClick={() => {
							if (active) return;
							window.history.pushState(null, "", href);
							setWorkspace(option.value);
						}}
					>
						<Icon size={15} />
						<span
							data-reader-component="TaleStudioWorkspaceSwitcher"
							data-reader-role="mode-label"
							className="hidden lg:inline"
						>
							{option.label}
						</span>
					</button>
				);
			})}
		</div>
	);
}
