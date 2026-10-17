"use client";
import { Setting } from "~/app/(tale-app)/_shared/components/ReaderUi/TaleDebug/DebugPrimitives";
import { AssetLibrary } from "~/components/media/asset-library";
import Input from "~/components/ui/input";
import { api } from "~/trpc/react";
import { UploadThingImageField } from "./UploadThingImageField";
export function ImageUploadSetting({
	label,
	onChange,
	value,
}: {
	label: string;
	onChange: (value: string) => void;
	value: string;
}): React.JSX.Element {
	const utils = api.useUtils();
	const {
		data: images = [],
		isLoading,
		error,
	} = api.image.getMyImages.useQuery();
	return (
		<Setting label={label} className="col-span-full">
			<div
				data-reader-component="ImageUploadSetting"
				data-reader-role="image-setting"
				data-studio-component="ImageUploadSetting"
				data-studio-role="image-setting"
				className="grid min-w-0 gap-3"
			>
				<Input
					aria-label={`${label} URL`}
					density="compact"
					value={value}
					onChange={(event) => onChange(event.target.value)}
				/>
				<UploadThingImageField
					label={`${label} upload`}
					onUploaded={(url) => {
						onChange(url);
						void utils.image.getMyImages.invalidate();
					}}
				/>
				<div className="max-h-80 overflow-y-auto">
					<AssetLibrary
						assets={images.map((image) => ({
							id: String(image.id),
							name: image.name,
							url: image.url,
							kind: "image",
						}))}
						selectedId={String(
							images.find((image) => image.url === value)?.id ?? "",
						)}
						onSelect={(asset) => onChange(asset.url)}
						isLoading={isLoading}
						error={error?.message}
					/>
				</div>
			</div>
		</Setting>
	);
}
