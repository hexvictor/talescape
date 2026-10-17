import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import type { ReaderStyle } from "~/app/(tale-app)/_shared/types";
import { StyleColorSetting } from "./StyleColorSetting";

function StyleColors() {
	const [style, setStyle] = useState<ReaderStyle>({
		color: "#102030",
		background: "red",
		backgroundCss: "linear-gradient(90deg, #fff, #eee)",
		border: "3px dashed #102030",
	});
	return (
		<div className="grid max-w-sm gap-4">
			{(["color", "backgroundCss", "border"] as const).map((property) => (
				<StyleColorSetting
					key={property}
					property={property}
					style={style}
					onChange={setStyle}
				/>
			))}
			<output aria-label="Style configuration">{JSON.stringify(style)}</output>
		</div>
	);
}
const meta = {
	component: StyleColors,
	title: "TaleStudio/Inspector/Style Colors",
} satisfies Meta<typeof StyleColors>;
export default meta;
type Story = StoryObj<typeof meta>;
export const ColorFields: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const background = canvas.getByLabelText("Background", { exact: true });
		await userEvent.click(background);
		await userEvent.keyboard("{Control>}a{/Control}{Backspace}");
		await userEvent.type(background, "#f049c3");
		await userEvent.tab();
		expect(canvas.getByLabelText("Style configuration")).toHaveTextContent(
			'"backgroundCss":"#f049c3"',
		);
		expect(
			canvas.getByLabelText("Style configuration").textContent,
		).not.toContain('"background":');
		const border = canvas.getByLabelText("Border color", { exact: true });
		await userEvent.click(border);
		await userEvent.keyboard("{Control>}a{/Control}{Backspace}");
		await userEvent.type(border, "#00a8e8");
		await userEvent.tab();
		expect(canvas.getByLabelText("Style configuration").textContent).toContain(
			"3px dashed",
		);
		expect(border).toHaveValue("rgb(0, 168, 232)");
	},
};
