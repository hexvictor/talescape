"use client";

import { ImagePlus } from "lucide-react";
import { useRef, useState } from "react";
import { Setting } from "~/app/(tale-app)/_shared/components/ReaderUi/TaleDebug/DebugPrimitives";
import { Thumbnail } from "~/components/data-display/thumbnail";
import { Button } from "~/components/ui/button";
import Input from "~/components/ui/input";
import { api } from "~/trpc/react";
import { useUploadThing } from "../../utils/uploadthing";

/**
 * Renders a URL field with an UploadThing-backed image file picker.
 */
export function ImageUploadSetting({
	label,
	onChange,
	value,
}: {
	label: string;
	onChange: (value: string) => void;
	value: string;
}): React.JSX.Element {
	const inputRef = useRef<HTMLInputElement>(null);
	const [error, setError] = useState<string | null>(null);
	const utils = api.useUtils();
	const { data: uploadedImages = [] } = api.image.getMyImages.useQuery();
	const { isUploading, startUpload } = useUploadThing("imageUploader", {
		onUploadError: (uploadError) => setError(uploadError.message),
	});

	const uploadFiles = async (files: FileList | null): Promise<void> => {
		setError(null);
		const file = files?.[0];
		if (!file) return;
		try {
			const result = await startUpload([file]);
			const uploadedUrl = result?.[0]?.ufsUrl ?? result?.[0]?.url;
			if (uploadedUrl) onChange(uploadedUrl);
			await utils.image.getMyImages.invalidate();
		} catch (uploadError) {
			setError(
				uploadError instanceof Error ? uploadError.message : "Upload failed",
			);
		}
	};

	return (
		<Setting label={label} className="col-span-full">
			<div className="grid min-w-0 @min-[28rem]/setting:grid-cols-[minmax(0,1fr)_auto] gap-2">
				<Input
					aria-label={`${label} URL`}
					density="compact"
					type="text"
					value={value}
					onChange={(event) => onChange(event.target.value)}
				/>
				<Button
					className="h-9 px-3"
					disabled={isUploading}
					motion="flat"
					size="sm"
					variant="outline"
					onPress={() => inputRef.current?.click()}
				>
					<ImagePlus size={14} />
					{isUploading ? "Uploading" : "Upload"}
				</Button>
				<input
					ref={inputRef}
					accept="image/*"
					className="sr-only"
					type="file"
					onChange={(event) => {
						void uploadFiles(event.currentTarget.files);
						event.currentTarget.value = "";
					}}
				/>
			</div>
			{uploadedImages.length > 0 ? (
				<div className="grid max-h-44 grid-cols-3 gap-2 overflow-y-auto rounded border border-foreground/12 bg-background/45 p-2">
					{uploadedImages.map((image) => (
						<Button
							key={image.id}
							aria-pressed={value === image.url}
							className={`group grid h-auto min-w-0 whitespace-normal border p-1 text-left shadow-none ${
								value === image.url
									? "border-primary bg-primary/8"
									: "border-foreground/12 hover:border-foreground/35"
							}`}
							motion="flat"
							variant="outline"
							onPress={() => onChange(image.url)}
						>
							<Thumbnail
								alt={image.name}
								className="aspect-video w-full"
								selected={value === image.url}
								src={image.url}
							/>
							<span className="truncate text-[10px] text-foreground/62">
								{image.name}
							</span>
						</Button>
					))}
				</div>
			) : null}
			{error ? <p className="text-[10px] text-destructive">{error}</p> : null}
		</Setting>
	);
}
