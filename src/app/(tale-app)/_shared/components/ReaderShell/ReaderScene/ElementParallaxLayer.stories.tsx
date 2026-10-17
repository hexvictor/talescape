import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { type CSSProperties, useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Slider } from "~/components/ui/slider";
import type { Anchor, ResolvedTaleElement } from "../../../types";
import {
	ElementParallaxLayer,
	defaultElementParallax,
} from "./ElementParallaxLayer";
import { PositionedElements } from "./PositionedElements";
import { useScenePointerParallax } from "./useScenePointerParallax";

const meta = {
	title: "Reader/Elements/Parallax",
	component: ElementParallaxLayer,
	args: { children: null },
} satisfies Meta<typeof ElementParallaxLayer>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Background: Story = {
	render: function Background() {
		const [root, setRoot] = useState<HTMLElement | null>(null);
		const [camera, setCamera] = useState(0);
		useScenePointerParallax(root, true);
		return (
			<div className="grid max-w-3xl gap-4">
				<Slider
					label="Camera travel"
					minValue={0}
					maxValue={800}
					step={50}
					value={camera}
					onChange={setCamera}
				/>
				<div
					data-reader-role="camera-viewport"
					className="relative h-80 overflow-hidden"
				>
					<div
						ref={setRoot}
						className="absolute inset-0"
						style={{ "--reader-scroll-offset": `${camera}px` } as CSSProperties}
					>
						<ElementParallaxLayer config={defaultElementParallax}>
							<img
								className="h-full w-full object-cover"
								src="/assets/site/ember-city-light.png"
								alt="Parallax city background"
							/>
						</ElementParallaxLayer>
					</div>
					<div className="pointer-events-none absolute inset-0 flex items-center justify-center">
						<h2 className="bg-background p-4 font-bold text-xl">
							The Ember Archive
						</h2>
					</div>
				</div>
			</div>
		);
	},
	play: async ({ canvasElement }) => {
		const slider = within(canvasElement).getByRole("slider");
		await slider.focus();
		await userEvent.keyboard("{ArrowRight}");
		const layer = canvasElement.querySelector(
			'[data-reader-role="parallax-layer"]',
		);
		if (!layer) throw new Error("Missing parallax layer");
		await expect(getComputedStyle(layer).translate).toMatch(/-7.5px/);
	},
};

export const AbsoluteSceneImage: Story = {
	render: function AbsoluteSceneImage() {
		const [root, setRoot] = useState<HTMLElement | null>(null);
		const [scroll, setScroll] = useState(0);
		useScenePointerParallax(root, true);
		const element = {
			id: "parallax-image",
			type: "image",
			frameId: null,
			src: "/assets/site/ember-city-light.png",
			alt: "Scene image",
			placement: {
				mode: "absolute",
				horizontal: "left",
				vertical: "top",
				x: 0,
				y: 0,
				unit: "px",
				width: 320,
				parallax: { ...defaultElementParallax, scale: 1 },
			},
		} as ResolvedTaleElement;
		return (
			<div>
				<button type="button" onClick={() => setScroll(100)}>
					Scroll scene
				</button>
				<div
					data-reader-role="camera-viewport"
					className="relative h-80 w-96 overflow-hidden"
				>
					<div
						ref={setRoot}
						className="absolute inset-0"
						style={{ "--reader-scroll-offset": `${scroll}px` } as CSSProperties}
					>
						<PositionedElements
							anchor={{} as Anchor}
							contentSized
							elements={[element]}
							framesById={{}}
						/>
					</div>
				</div>
			</div>
		);
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const image = canvas.getByRole("img", { name: "Scene image" });
		await waitFor(() =>
			expect((image as HTMLImageElement).naturalWidth).toBeGreaterThan(0),
		);
		const figure = image.closest("figure");
		if (!figure) throw new Error("Missing image surface");
		await expect(getComputedStyle(figure).backgroundColor).toBe(
			"rgba(0, 0, 0, 0)",
		);
		const layer = canvasElement.querySelector(
			'[data-reader-role="parallax-layer"]',
		);
		if (!layer) throw new Error("Missing scene image parallax");
		await userEvent.click(canvas.getByRole("button", { name: "Scroll scene" }));
		await expect(getComputedStyle(layer).translate).toMatch(/-15px/);
		const viewport = canvasElement.querySelector(
			'[data-reader-role="camera-viewport"]',
		);
		if (!viewport) throw new Error("Missing viewport");
		const bounds = viewport.getBoundingClientRect();
		viewport.dispatchEvent(
			new PointerEvent("pointermove", {
				clientX: bounds.right,
				clientY: bounds.bottom,
				pointerType: "mouse",
			}),
		);
		await waitFor(() =>
			expect(getComputedStyle(layer).translate).toBe("16px -3px"),
		);
	},
};
