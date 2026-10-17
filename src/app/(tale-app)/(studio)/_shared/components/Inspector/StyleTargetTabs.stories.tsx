import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import type { ReaderStyle } from "~/app/(tale-app)/_shared/types";
import { StyleSettings } from "./StyleSettings";
import { StyleTargetTabs } from "./StyleTargetTabs";

function ImageStyles() {
	const [box, setBox] = useState<ReaderStyle>({});
	const [image, setImage] = useState<ReaderStyle>({});
	return (
		<div className="studio-inspector max-w-md">
			<StyleTargetTabs
				targets={[
					{
						id: "box",
						label: "Element box",
						content: (
							<StyleSettings
								title="Element box"
								style={box}
								onChange={setBox}
								showTypographyControls={false}
								showAppearanceControls={false}
								showPositionControls={false}
							/>
						),
					},
					{
						id: "image",
						label: "Image",
						content: (
							<StyleSettings
								title="Image"
								style={image}
								onChange={setImage}
								showTypographyControls={false}
								showAppearanceControls={false}
								showMediaControls
							/>
						),
					},
				]}
			/>
		</div>
	);
}

const meta = {
	title: "TaleStudio/Inspector/Style Targets",
	component: ImageStyles,
} satisfies Meta<typeof ImageStyles>;
export default meta;
export const Image: StoryObj<typeof meta> = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(canvas.queryByText("Object fit")).not.toBeInTheDocument();
		await userEvent.click(canvas.getByRole("tab", { name: "Image" }));
		await expect(canvas.getByText("Object fit")).toBeVisible();
		await expect(
			canvas.queryByText("Element box · Size and spacing"),
		).not.toBeInTheDocument();
	},
};
