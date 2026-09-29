"use client";

import { Search, X } from "lucide-react";
import {
	Button as AriaButton,
	SearchField as AriaSearchField,
	type SearchFieldProps as AriaSearchFieldProps,
} from "react-aria-components";
import cn from "~/lib/utils/cn";
import type { ControlDensity } from "./control-styles";
import Input from "./input";

export type SearchFieldProps = Omit<AriaSearchFieldProps, "className"> & {
	className?: string;
	density?: ControlDensity;
	inputClassName?: string;
	placeholder?: string;
};

export function SearchField({
	"aria-label": ariaLabel = "Search",
	className,
	density = "default",
	inputClassName,
	placeholder,
	...props
}: SearchFieldProps): React.JSX.Element {
	return (
		<AriaSearchField
			{...props}
			aria-label={ariaLabel}
			data-slot="search-field"
			className={cn("group relative", className)}
		>
			<Search
				aria-hidden="true"
				className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 z-10 size-4 text-muted-foreground"
			/>
			<Input
				density={density}
				className={cn("pr-9 pl-9", inputClassName)}
				placeholder={placeholder}
			/>
			<AriaButton
				slot="clear"
				aria-label="Clear search"
				className="-translate-y-1/2 absolute top-1/2 right-1.5 flex size-7 items-center justify-center outline-none focus-visible:ring-4 focus-visible:ring-ring/40 group-data-[empty]:hidden"
			>
				<X className="size-4" />
			</AriaButton>
		</AriaSearchField>
	);
}
