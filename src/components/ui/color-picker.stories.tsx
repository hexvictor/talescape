import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, fn, userEvent, within } from "storybook/test";
import { ColorPicker, type ColorPickerProps } from "./color-picker";

function ControlledPicker(props: Partial<ColorPickerProps>) {
	const [value, setValue] = useState(props.value ?? "#00a8e8");
	return (
		<div className="grid w-full max-w-sm gap-4">
			<ColorPicker
				{...props}
				label={props.label ?? "Accent color"}
				value={value}
				onChange={setValue}
			/>
			<output aria-label="Selected color" className="font-mono text-xs">
				{value || "Inherit"}
			</output>
		</div>
	);
}
const meta = {
	component: ColorPicker,
	title: "Design System/Forms/Color Picker",
	tags: ["autodocs"],
	args: { label: "Accent color", value: "#00a8e8", onChange: fn() },
	render: (args) => <ControlledPicker {...args} />,
} satisfies Meta<typeof ColorPicker>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Editor: Story = { parameters: { componentEditor: true } };

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const field = canvas.getByLabelText("Accent color", { exact: true });
		await userEvent.clear(field);
		await userEvent.type(field, "#f049c3");
		await userEvent.tab();
		expect(canvas.getByLabelText("Selected color")).toHaveTextContent(
			"#f049c3",
		);
		await userEvent.click(
			canvas.getByRole("button", { name: "Choose accent color" }),
		);
		const dialog = within(canvasElement.ownerDocument.body).getByRole(
			"dialog",
			{ name: "Accent color picker" },
		);
		const picker = within(dialog);
		const hue = picker.getByRole("slider", { name: "Hue" });
		hue.focus();
		await userEvent.keyboard("{ArrowRight}");
		const alpha = picker.getByRole("slider", { name: "Opacity" });
		alpha.focus();
		await userEvent.keyboard("{ArrowLeft}");
		expect(canvas.getByLabelText("Selected color").textContent).not.toBe(
			"#f049c3",
		);
		await userEvent.click(picker.getByRole("button", { name: "Magenta" }));
		expect(canvas.getByLabelText("Selected color")).toHaveTextContent(
			"var(--ts-pink)",
		);
		await userEvent.keyboard("{Escape}");
		expect(
			within(canvasElement.ownerDocument.body).queryByRole("dialog"),
		).not.toBeInTheDocument();
	},
};
export const Compact: Story = { args: { density: "compact" } };
export const Disabled: Story = { args: { isDisabled: true } };
export const Invalid: Story = {
	args: { isInvalid: true, value: "not-a-color" },
};
export const Inherited: Story = { args: { allowEmpty: true, value: "" } };
export const Transparent: Story = { args: { value: "#ff006e80" } };
export const CssBackground: Story = {
	args: { allowCss: true, value: "linear-gradient(120deg, #00a8e8, #ff006e)" },
};
export const CustomStyling: Story = {
	args: {
		popoverClassName: "border-primary",
		areaClassName: "h-48",
		density: "compact",
		swatches: [
			{ label: "Ink", value: "var(--foreground)" },
			{ label: "Paper", value: "var(--background)" },
		],
	},
};
export const Validation: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const field = canvas.getByLabelText("Accent color", { exact: true });
		await userEvent.clear(field);
		await userEvent.type(field, "not-a-color");
		await userEvent.tab();
		expect(field).toHaveAttribute("aria-invalid", "true");
		expect(canvas.getByLabelText("Selected color")).toHaveTextContent(
			"#00a8e8",
		);
	},
};
