"use client";

import { ChevronDown } from "lucide-react";
import {
	ComboBox as AriaComboBox,
	Button,
	Input,
	type Key,
	Label,
	ListBox,
	ListBoxItem,
	Popover,
} from "react-aria-components";
import { type ControlDensity, controlClassName } from "./control-styles";

export type ComboBoxOption = { id: string; label: string; disabled?: boolean };
export function ComboBox({
	label,
	options,
	value,
	defaultValue,
	onChange,
	isDisabled,
	isInvalid,
	density = "default",
	placeholder,
}: {
	label: string;
	options: ComboBoxOption[];
	value?: Key | null;
	defaultValue?: Key;
	onChange?: (value: Key | null) => void;
	isDisabled?: boolean;
	isInvalid?: boolean;
	density?: ControlDensity;
	placeholder?: string;
}): React.JSX.Element {
	return (
		<AriaComboBox
			defaultItems={options}
			selectedKey={value}
			defaultSelectedKey={defaultValue}
			onSelectionChange={onChange}
			isDisabled={isDisabled}
			isInvalid={isInvalid}
			disabledKeys={options.filter((o) => o.disabled).map((o) => o.id)}
			data-reader-component="ComboBox"
			data-reader-role="combobox-control"
			className="grid min-w-0 gap-2"
		>
			<Label className="font-bold text-xs uppercase">{label}</Label>
			<div className="relative">
				<Input
					placeholder={placeholder}
					className={controlClassName(density, "pr-10")}
				/>
				<Button
					aria-label={`Show ${label}`}
					className="absolute inset-y-0 right-0 grid w-10 place-items-center outline-none focus-visible:ring-2 focus-visible:ring-ring"
				>
					<ChevronDown size={16} />
				</Button>
			</div>
			<Popover className="z-50 max-h-72 w-[var(--trigger-width)] overflow-auto border-2 border-foreground bg-popover p-1 text-popover-foreground shadow-[var(--ts-shadow-comic)]">
				<ListBox<ComboBoxOption>
					className="outline-none"
					renderEmptyState={() => (
						<p className="p-3 text-muted-foreground text-sm">No matches</p>
					)}
				>
					{(item) => (
						<ListBoxItem
							id={item.id}
							textValue={item.label}
							className="cursor-default px-3 py-2 text-sm outline-none data-[focused]:bg-accent data-[selected]:font-black data-[disabled]:opacity-40"
						>
							{item.label}
						</ListBoxItem>
					)}
				</ListBox>
			</Popover>
		</AriaComboBox>
	);
}
