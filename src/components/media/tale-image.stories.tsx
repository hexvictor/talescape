import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { ComponentEditor } from "../design-system/component-editor";
import { TaleImage } from "./tale-image";
const meta = {
	title: "Design System/Components/TaleImage",
	component: TaleImage,
	args: {
		src: "/assets/site/ember-city-light.png",
		alt: "Ember City",
		width: 960,
		height: 480,
		unoptimized: true,
	},
	tags: ["autodocs"],
} satisfies Meta<typeof TaleImage>;
export default meta;
type Story = StoryObj<typeof meta>;
export const ImageEditor: Story = {
	render: () => <ComponentEditor kind="image" />,
};
export const Composed: Story = {
	args: {
		shapes: [
			{ type: "slant", position: "left", size: "14%", slope: "start" },
			{
				type: "step",
				position: "bottom-right-h",
				direction: "inward",
				size: 64,
				extent: "55%",
				ramp: 24,
			},
		],
		decorations: "image-home",
		borderWidth: 2,
		shadow: true,
	},
	play: async ({ canvasElement }) => {
		const surface = canvasElement.querySelector(
			'[data-reader-role="clipped-image-surface"]',
		) as HTMLElement;
		await expect(getComputedStyle(surface).clipPath).toMatch(/^path\(/);
		await expect(surface.querySelector(".ts-decorations")).toBeInTheDocument();
		await expect(surface.querySelector("img")?.getAttribute("alt")).toBe(
			"Ember City",
		);
	},
};
export const Fill: Story = {
	args: {
		fill: true,
		width: undefined,
		height: undefined,
		decorations: "image-accent",
		shapes: [{ type: "corner", position: "bottom-left", size: 32 }],
	},
	decorators: [
		(Story) => (
			<div className="relative h-72 max-w-2xl">
				<Story />
			</div>
		),
	],
};
