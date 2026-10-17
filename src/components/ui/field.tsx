import type { ComponentProps, ReactNode } from "react";
import cn from "~/lib/utils/cn";

export type FieldProps = Omit<ComponentProps<"fieldset">, "children"> & {
	children: ReactNode;
	description?: ReactNode;
	label: ReactNode;
};

/**
 * Groups a visible label, optional description, and one or more related controls.
 */
export function Field({
	children,
	className,
	description,
	label,
	...props
}: FieldProps): React.JSX.Element {
	return (
		<fieldset
			data-reader-component="Field"
			data-reader-role="field"
			{...props}
			data-slot="field"
			className={cn("m-0 grid min-w-0 gap-1 border-0 p-0", className)}
		>
			<legend
				data-slot="field-label"
				className="float-left w-full font-bold text-muted-foreground text-xs uppercase"
			>
				{label}
			</legend>
			{description ? (
				<span
					data-slot="field-description"
					className="text-[11px] text-muted-foreground"
				>
					{description}
				</span>
			) : null}
			{children}
		</fieldset>
	);
}
