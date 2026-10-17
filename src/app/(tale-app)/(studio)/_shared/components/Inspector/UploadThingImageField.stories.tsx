import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { UploadThingImageField } from "./UploadThingImageField";
function LiveUpload() {
	const [connected, setConnected] = useState(false);
	const [url, setUrl] = useState("");
	return (
		<div className="grid max-w-lg gap-4">
			{connected ? (
				<UploadThingImageField label="UploadThing image" onUploaded={setUrl} />
			) : (
				<Button onPress={() => setConnected(true)}>Connect UploadThing</Button>
			)}
			{url ? (
				<img src={url} alt="Uploaded asset" className="max-h-64 max-w-full" />
			) : null}
		</div>
	);
}
const meta = {
	title: "TaleStudio/Media/UploadThing Image Upload",
	component: LiveUpload,
	parameters: {
		docs: {
			description: {
				component:
					"Uses the production imageUploader route and requires a signed-in Talescape session. The Storybook server proxies /api/uploadthing to localhost:3000; TALESCAPE_STORYBOOK_APP_ORIGIN can select another running app origin. Sign into the app on the same localhost hostname first. This story does not mock persistence. Static Storybook alone cannot authenticate or serve the upload API.",
			},
		},
	},
} satisfies Meta<typeof LiveUpload>;
export default meta;
type Story = StoryObj<typeof meta>;
export const ConnectedEndpoint: Story = {};
