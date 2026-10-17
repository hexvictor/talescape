import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import type { Anchor, ResolvedTaleElement, TaleFrame } from "../../../types";
import { FrameRenderer } from "./FrameRenderer";

const image = {
	id: "image",
	type: "image",
	frameId: "frame",
	src: "/assets/site/ember-city-light.png",
	alt: "Frame image",
	style: { height: 80, minWidth: 100, maxWidth: 160 },
	placement: {
		mode: "absolute",
		frameId: "frame",
		horizontal: "left",
		vertical: "top",
		unit: "viewport",
		x: 0.25,
		y: 0.25,
		width: 1,
	},
} as ResolvedTaleElement;
const frame = {
	id: "frame",
	mode: "free",
	overflow: "clip",
	parentFrameId: null,
	children: [{ type: "element", elementId: "image" }],
	style: { width: 320, height: 240 },
} as TaleFrame;
const meta = {
	title: "Reader/Frames/Absolute Placement",
	component: FrameRenderer,
	args: {
		anchor: { sceneId: "scene" } as Anchor,
		contentSized: false,
		frameId: "frame",
		framesById: { frame },
		elementsById: { image },
	},
	render: (args) => (
		<div className="relative p-10">
			<FrameRenderer {...args} />
		</div>
	),
} satisfies Meta<typeof FrameRenderer>;
export default meta;
export const ParentBounds: StoryObj<typeof meta> = {
	play: async ({ canvasElement }) => {
		const frame = canvasElement.querySelector('[data-reader-frame-id="frame"]');
		const image = within(canvasElement).getByRole("img", {
			name: "Frame image",
		});
		const placed = image.closest(
			'[data-reader-role="positioned-element-frame"]',
		);
		if (!frame || !placed) throw new Error("Missing positioned frame image");
		await expect(placed.parentElement).toBe(frame);
		const parent = frame.getBoundingClientRect();
		const child = placed.getBoundingClientRect();
		await expect(child.x - parent.x).toBe(80);
		await expect(child.y - parent.y).toBe(60);
		await expect(child.width).toBe(160);
		await expect(child.height).toBe(80);
		await expect(within(canvasElement).getAllByRole("img")).toHaveLength(1);
	},
};
