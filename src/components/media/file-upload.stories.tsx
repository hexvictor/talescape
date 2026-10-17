import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useEffect, useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { FileUpload } from "./file-upload";
function LocalUpload(args: React.ComponentProps<typeof FileUpload>) {
	const [url, setUrl] = useState("");
	useEffect(
		() => () => {
			if (url.startsWith("blob:")) URL.revokeObjectURL(url);
		},
		[url],
	);
	return (
		<div className="grid max-w-xl gap-4">
			<FileUpload
				{...args}
				onUploaded={(value, file) => {
					setUrl(value);
					args.onUploaded(value, file);
				}}
			/>
			{url ? (
				<img
					src={url}
					alt="Uploaded preview"
					className="max-h-64 max-w-full object-contain"
				/>
			) : null}
		</div>
	);
}
const meta = {
	title: "Design System/Media/Image Upload",
	component: FileUpload,
	tags: ["autodocs"],
	args: {
		label: "Cover image",
		upload: async (file, report) => {
			report(100);
			return URL.createObjectURL(file);
		},
		onUploaded: () => {},
	},
	render: (args) => <LocalUpload {...args} />,
	parameters: {
		docs: {
			description: {
				component:
					"Local preview stories exercise the upload contract without persistence. TaleStudio/Media/UploadThing Image Upload uses the existing authenticated UploadThing endpoint.",
			},
		},
	},
} satisfies Meta<typeof FileUpload>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Editor: Story = { parameters: { componentEditor: true } };
export const LocalPreview: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		const file = new File(
			[
				'<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect width="32" height="32" fill="cyan"/></svg>',
			],
			"cover.svg",
			{ type: "image/svg+xml" },
		);
		await userEvent.upload(c.getByLabelText("Cover image"), file);
		await expect(await c.findByRole("status")).toHaveTextContent("Uploaded");
	},
};
export const Disabled: Story = { args: { isDisabled: true } };
export const Failed: Story = {
	args: {
		upload: async () => {
			throw new Error("Upload unavailable. Try again.");
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.upload(
			canvas.getByLabelText("Cover image"),
			new File(["example"], "cover.png", { type: "image/png" }),
		);
		await expect(await canvas.findByRole("alert")).toHaveTextContent(
			"Upload unavailable",
		);
	},
};

export const Uploading: Story = {
	args: {
		upload: async (_file, report) => {
			report(45);
			return new Promise<string>(() => {});
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.upload(
			canvas.getByLabelText("Cover image"),
			new File(["example"], "cover.png", { type: "image/png" }),
		);
		await expect(
			canvas.getByRole("button", { name: "Uploading" }),
		).toBeDisabled();
	},
};

export const SizeValidation: Story = {
	args: { maxBytes: 1024 * 1024 },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.upload(
			canvas.getByLabelText("Cover image"),
			new File([new Uint8Array(1024 * 1024 + 1)], "cover.png", {
				type: "image/png",
			}),
		);
		await expect(await canvas.findByRole("alert")).toHaveTextContent(
			"File must be under 1 MB",
		);
	},
};
