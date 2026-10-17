import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, within } from "storybook/test";
import type { SceneSize } from "~/app/(tale-app)/_shared/types";
import { SceneSizeSettings } from "./SceneSizeSettings";

function ExplicitSize() {
	const [size, setSize] = useState<SceneSize>({
		mode: "manual",
		width: 1,
		height: 1,
		widthUnit: "viewport",
		heightUnit: "viewport",
		horizontalAlignment: "auto",
		verticalAlignment: "auto",
		maxWidth: 1200,
		maxWidthUnit: "px",
	});
	return (
		<div className="studio-inspector max-w-lg">
			<SceneSizeSettings size={size} onChange={setSize} />
		</div>
	);
}
const meta = {
	title: "TaleStudio/Inspector/Scene Dimensions",
	component: ExplicitSize,
} satisfies Meta<typeof ExplicitSize>;
export default meta;
export const Limits: StoryObj<typeof meta> = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		for (const label of [
			"Minimum width",
			"Maximum width",
			"Minimum height",
			"Maximum height",
		]) {
			await expect(canvas.getByText(label, { exact: true })).toBeVisible();
		}
	},
};
