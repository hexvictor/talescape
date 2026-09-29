"use client";

import {
	Label as AriaLabel,
	type LabelProps as AriaLabelProps,
} from "react-aria-components";
import cn from "~/lib/utils/cn";

export default function Label({
	className,
	...props
}: AriaLabelProps): React.JSX.Element {
	return (
		<AriaLabel
			{...props}
			data-slot="label"
			className={cn(
				"flex select-none items-center gap-2 font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50 group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50",
				className,
			)}
		/>
	);
}
