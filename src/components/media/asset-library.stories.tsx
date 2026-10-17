import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { AssetLibrary, type MediaAsset } from "./asset-library";
const assets: MediaAsset[] = [
	{
		id: "city",
		name: "Ember City",
		kind: "image",
		url: "/assets/site/ember-city-light.png",
	},
	{
		id: "rain",
		name: "Soft rain",
		kind: "audio",
		url: "/reader-demo/soft-rain-ambient.mp3",
	},
	{
		id: "film",
		name: "City preview",
		kind: "video",
		url: "/storybook-media/city-preview.webm",
		thumbnail: "/assets/site/ember-city-light.png",
	},
];
function Browser(args: React.ComponentProps<typeof AssetLibrary>) {
	const [selectedId, setSelected] = useState(args.selectedId);
	return (
		<AssetLibrary
			{...args}
			selectedId={selectedId}
			onSelect={(asset) => setSelected(asset.id)}
		/>
	);
}
const meta = {
	title: "Design System/Media/Asset Library",
	component: AssetLibrary,
	tags: ["autodocs"],
	args: { assets, onSelect: () => {} },
	render: (args) => <Browser {...args} />,
} satisfies Meta<typeof AssetLibrary>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Editor: Story = { parameters: { componentEditor: true } };
export const AllAssets: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.type(c.getByRole("searchbox"), "rain");
		await userEvent.click(c.getByRole("button", { name: /Soft rain/ }));
		await expect(c.getByRole("heading", { name: "Soft rain" })).toBeVisible();
	},
};
export const Images: Story = {
	args: { assets: assets.filter((a) => a.kind === "image") },
};
export const Audio: Story = {
	args: {
		assets: assets.filter((a) => a.kind === "audio"),
		selectedId: "rain",
	},
};
export const Video: Story = {
	args: {
		assets: assets.filter((a) => a.kind === "video"),
		selectedId: "film",
	},
};
export const Empty: Story = { args: { assets: [] } };
export const Loading: Story = { args: { isLoading: true } };
export const Failed: Story = { args: { error: "Could not load assets" } };
export const Disabled: Story = { args: { isDisabled: true } };
