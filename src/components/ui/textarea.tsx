"use client";

import {
	TextArea as AriaTextArea,
	type TextAreaProps as AriaTextAreaProps,
} from "react-aria-components";
import cn from "~/lib/utils/cn";
import { type ControlDensity, controlClassName } from "./control-styles";

export type TextareaProps = Omit<AriaTextAreaProps, "className"> & {
	className?: string;
	density?: ControlDensity;
};

function Textarea({
	className,
	density = "default",
	...props
}: TextareaProps): React.JSX.Element {
	return (
		<AriaTextArea
			data-reader-component="Textarea"
			data-reader-role="textarea"
			{...props}
			data-slot="textarea"
			className={controlClassName(
				density,
				cn("field-sizing-content min-h-20 resize-y", className),
			)}
		/>
	);
}

export default Textarea;
